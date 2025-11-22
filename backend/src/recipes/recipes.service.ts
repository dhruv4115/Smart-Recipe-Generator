import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { Model, Types} from 'mongoose';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import { RecommendRecipesDto } from './dto/recommend-recipes.dto';
import { RateRecipeDto } from './dto/rate-recipe.dto';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { computeRecommendationScore } from './utils/recommendation-score';
import { cosineSimilarity } from './utils/similarity';
import { normalizeIngredients } from '../common/utils/ingredients-normalizer';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    private aiService: AiService,
    private usersService: UsersService,
  ) {}

  // ------------ BASIC CREATE / LIST / GET -----------------

  async create(dto: CreateRecipeDto): Promise<RecipeDocument> {
    let nutrition = dto.nutrition;
    if (!nutrition) {
      const ingredients = dto.ingredients.map((i) => i.name);
      const estimated = await this.aiService.getNutritionEstimate(
        ingredients,
        dto.servings,
      );
      nutrition = {
        calories: estimated.calories,
        protein: estimated.protein,
        carbs: estimated.carbs,
        fat: estimated.fat,
      };
    }

    const recipe = new this.recipeModel({
      ...dto,
      nutrition: {
        ...nutrition,
        perServing: true,
      },
    });

    // Embedding for recipe ingredients text
    const ingredientsText = dto.ingredients.map((i) => i.name).join(', ');
    recipe.embeddingVector = await this.aiService.getEmbedding(ingredientsText);

    return recipe.save();
  }

  async findAll(query: QueryRecipesDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }

    if (query.maxTime) {
      filter.cookingTimeMinutes = { $lte: parseInt(query.maxTime, 10) };
    }

    if (query.cuisine) {
      filter.cuisine = query.cuisine;
    }

    if (query.diet) {
      filter.dietaryTags = { $in: [query.diet] };
    }

    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.recipeModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.recipeModel.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<RecipeDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({ message: 'Recipe not found' });
    }
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) throw new NotFoundException({ message: 'Recipe not found' });
    return recipe;
  }

  // ------------ RECOMMENDATION LOGIC -----------------

  async recommend(userId: string, dto: RecommendRecipesDto) {
    if (!dto.ingredients || dto.ingredients.length === 0) {
      throw new BadRequestException({
        message: 'At least one ingredient is required',
        code: 'NO_INGREDIENTS',
      });
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    const normalizedInputIngredients = normalizeIngredients(dto.ingredients);

    const userDietPrefs = user.preferences?.dietaryPreferences || [];
    const allergies = user.preferences?.allergies || [];
    const disliked = user.preferences?.dislikedIngredients || [];

    const combinedDietPrefs = Array.from(
      new Set([
        ...(dto.dietaryPreferences || []),
        ...userDietPrefs,
      ]),
    );

    // Build DB filter
    const filter: any = {};

    if (combinedDietPrefs.length > 0) {
      filter.dietaryTags = { $all: combinedDietPrefs };
    }

    if (dto.maxCookingTimeMinutes) {
      filter.cookingTimeMinutes = { $lte: dto.maxCookingTimeMinutes };
    }

    if (dto.difficulty) {
      filter.difficulty = dto.difficulty;
    }

    // Limit number of recipes considered to keep computation reasonable
    const candidateRecipes = await this.recipeModel
      .find(filter)
      .limit(200)
      .exec();

    if (candidateRecipes.length === 0) {
      return { items: [], explanation: 'No recipes matched the filters.' };
    }

    // Embedding for user ingredients
    const ingredientsText = normalizedInputIngredients.join(', ');
    const userEmbedding = await this.aiService.getEmbedding(ingredientsText);

    const allergySet = new Set(allergies);
    const dislikedSet = new Set(disliked);

    const scoredRecipes = candidateRecipes
      .map((recipe) => {
        const recipeIngredients = recipe.ingredients.map((i) => i.name);
        const normalizedRecipeIngredients = normalizeIngredients(
          recipeIngredients,
        );

        // Exclude recipes containing allergies or disliked ingredients
        const hasAllergy = normalizedRecipeIngredients.some((i) =>
          allergySet.has(i),
        );
        const hasDisliked = normalizedRecipeIngredients.some((i) =>
          dislikedSet.has(i),
        );
        if (hasAllergy || hasDisliked) {
          return null;
        }

        // Overlap score: Jaccard (intersection/union)
        const inputSet = new Set(normalizedInputIngredients);
        const recipeSet = new Set(normalizedRecipeIngredients);

        const intersectionSize = [...inputSet].filter((i) =>
          recipeSet.has(i),
        ).length;
        const unionSize = new Set([
          ...normalizedInputIngredients,
          ...normalizedRecipeIngredients,
        ]).size;

        const overlapScore =
          unionSize === 0 ? 0 : intersectionSize / unionSize;

        // Semantic score: cosine similarity
        const semanticScore = cosineSimilarity(
          userEmbedding,
          recipe.embeddingVector || [],
        );

        // Popularity score: normalized average rating (0–1)
        const popularityScore =
          recipe.ratingCount > 0 ? recipe.averageRating / 5 : 0;

        const combinedScore = computeRecommendationScore({
          overlapScore,
          semanticScore,
          popularityScore,
        });

        // Simple explanation string
        const matchPercentage = Math.round(overlapScore * 100);
        let explanation = `This recipe matches about ${matchPercentage}% of your ingredients.`;
        if (combinedDietPrefs.length > 0) {
          explanation += ` Fits dietary preferences: ${combinedDietPrefs.join(
            ', ',
          )}.`;
        }
        if (dto.maxCookingTimeMinutes) {
          explanation += ` Within ${dto.maxCookingTimeMinutes} min.`;
        }

        return {
          recipe,
          overlapScore,
          semanticScore,
          popularityScore,
          combinedScore,
          explanation,
        };
      })
      .filter((r) => r !== null) as any[];

    if (scoredRecipes.length === 0) {
      return {
        items: [],
        explanation:
          'Recipes exist, but all were filtered out due to allergies/disliked ingredients.',
      };
    }

    scoredRecipes.sort((a, b) => b.combinedScore - a.combinedScore);
    const top = scoredRecipes.slice(0, 10);

    // Adjust for servings (optional)
    const desiredServings = dto.servings;

    const items = top.map((entry) => {
      const recipeObj = entry.recipe.toObject();
      let adjustedIngredients = recipeObj.ingredients;
      let adjustedNutrition = recipeObj.nutrition;

      if (
        desiredServings &&
        recipeObj.servings &&
        desiredServings !== recipeObj.servings
      ) {
        const factor = desiredServings / recipeObj.servings;

        adjustedIngredients = recipeObj.ingredients.map((ing: any) => ({
          ...ing,
          quantity:
            typeof ing.quantity === 'number'
              ? ing.quantity * factor
              : ing.quantity,
        }));

        if (adjustedNutrition) {
          adjustedNutrition = {
            ...adjustedNutrition,
            calories: adjustedNutrition.calories * factor,
            protein: adjustedNutrition.protein * factor,
            carbs: adjustedNutrition.carbs * factor,
            fat: adjustedNutrition.fat * factor,
          };
        }

        recipeObj.servings = desiredServings;
      }

      return {
        recipe: {
          ...recipeObj,
          ingredients: adjustedIngredients,
          nutrition: adjustedNutrition,
        },
        scores: {
          overlap: entry.overlapScore,
          semantic: entry.semanticScore,
          popularity: entry.popularityScore,
          combined: entry.combinedScore,
        },
        explanation: entry.explanation,
      };
    });

    return {
      items,
      explanation: `Found ${items.length} recommended recipes.`,
    };
  }

  // ------------ RATINGS -----------------

  async rateRecipe(
    userId: string,
    recipeId: string,
    dto: RateRecipeDto,
  ) {
    if (!Types.ObjectId.isValid(recipeId)) {
      throw new NotFoundException({ message: 'Recipe not found' });
    }

    const recipe = await this.recipeModel.findById(recipeId).exec();
    if (!recipe) {
      throw new NotFoundException({ message: 'Recipe not found' });
    }

    const userObjectId = new Types.ObjectId(userId);
    const recipeObjectId = new Types.ObjectId(recipeId);

    // Upsert rating
    await this.ratingModel
      .findOneAndUpdate(
        { userId: userObjectId, recipeId: recipeObjectId },
        {
          $set: {
            rating: dto.rating,
            comment: dto.comment,
          },
        },
        { upsert: true, new: true },
      )
      .exec();

    // Recompute average rating and count
    const stats = await this.ratingModel
      .aggregate([
        { $match: { recipeId: recipeObjectId } },
        {
          $group: {
            _id: '$recipeId',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    if (stats.length > 0) {
      recipe.averageRating = stats[0].avgRating;
      recipe.ratingCount = stats[0].count;
    } else {
      recipe.averageRating = 0;
      recipe.ratingCount = 0;
    }

    await recipe.save();

    return {
      recipeId,
      averageRating: recipe.averageRating,
      ratingCount: recipe.ratingCount,
    };
  }

  // ------------ FAVORITES (TOGGLE) -----------------

  async toggleFavorite(userId: string, recipeId: string) {
    if (!Types.ObjectId.isValid(recipeId)) {
      throw new NotFoundException({ message: 'Recipe not found' });
    }

    const recipe = await this.recipeModel.findById(recipeId).exec();
    if (!recipe) {
      throw new NotFoundException({ message: 'Recipe not found' });
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    const idStr = recipeId.toString();
    const favorites = (user.favorites || []).map((id) => id.toString());
    const isAlreadyFavorite = favorites.includes(idStr);

    if (isAlreadyFavorite) {
      await this.usersService.removeFavorite(userId, recipeId);
      return { isFavorite: false };
    } else {
      await this.usersService.addFavorite(userId, recipeId);
      return { isFavorite: true };
    }
  }
}