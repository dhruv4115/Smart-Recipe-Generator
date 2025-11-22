import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';
import { Model } from 'mongoose';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
    private aiService: AiService,
  ) {}

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

    // Get embedding for recipe ingredients text
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
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) throw new NotFoundException({ message: 'Recipe not found' });
    return recipe;
  }
}
