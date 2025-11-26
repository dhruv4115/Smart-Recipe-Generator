import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RecipesService } from '../recipes/recipes.service';
import { RecipeDocument } from '../recipes/schemas/recipe.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const recipesService = app.get(RecipesService);

  const recipeModel = (recipesService as any)['recipeModel'] as {
    find: (...args: any[]) => any;
  };

  const recipes: RecipeDocument[] = await recipeModel.find().exec();

  let updatedCount = 0;

  for (const recipe of recipes) {
    const needsUpdate =
      !recipe.imageUrl ||
      recipe.imageUrl.includes('source.unsplash.com'); // old broken URLs

    if (needsUpdate) {
      const imageUrl = recipesService['aiService'].getRecipeImageUrl({
        title: recipe.title,
        cuisine: recipe.cuisine,
        dietaryTags: recipe.dietaryTags,
      });

      recipe.imageUrl = imageUrl;
      await recipe.save();
      updatedCount++;
      console.log(`Updated imageUrl for: ${recipe.title} -> ${imageUrl}`);
    }
  }

  console.log(`Done. Updated ${updatedCount} recipes.`);
  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
