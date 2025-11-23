import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RecipesService } from './recipes/recipes.service';
import recipeSeedData from './seed/recipes.seed-data';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Starting seed process...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const recipesService = app.get(RecipesService);

  try {
    for (const recipe of recipeSeedData) {
      try {
        // Check if recipe with same title already exists to avoid duplicates
        const existing = await (recipesService as any)['recipeModel']
          .findOne({ title: recipe.title })
          .exec();

        if (existing) {
          logger.log(`Skipping existing recipe: ${recipe.title}`);
          continue;
        }

        logger.log(`Seeding recipe: ${recipe.title}`);
        await recipesService.create({
          ...recipe,
          // explicit cast to match CreateRecipeDto shape (TS side)
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          difficulty: recipe.difficulty,
          cookingTimeMinutes: recipe.cookingTimeMinutes,
          servings: recipe.servings,
          dietaryTags: recipe.dietaryTags,
          imageUrl: recipe.imageUrl,
        } as any);
      } catch (err: any) {
        logger.error(
          `Failed to seed recipe ${recipe.title}: ${err.message}`,
        );
      }
    }

    logger.log('Seed process completed.');
  } catch (err: any) {
    logger.error('Seed process failed', err.message);
  } finally {
    await app.close();
    logger.log('Nest application context closed.');
  }
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed bootstrap error', err);
  process.exit(1);
});
