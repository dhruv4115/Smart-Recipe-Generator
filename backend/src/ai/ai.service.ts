import { Injectable } from '@nestjs/common';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  perServing: boolean;
}

@Injectable()
export class AiService {
  //implement calls to external APIs later
  async getNutritionEstimate(
    ingredients: string[],
    servings: number,
  ): Promise<NutritionInfo> {
    // returning dummy values for now
    return {
      calories: 400,
      protein: 20,
      carbs: 50,
      fat: 10,
      perServing: true,
    };
  }

  async getSubstitutionSuggestions(
    ingredients: string[],
    dietaryPreferences: string[],
  ): Promise<{ substitutions: any[]; notes: string }> {
    return {
      substitutions: [],
      notes: 'Substitution suggestions not yet implemented',
    };
  }

  async getEmbedding(text: string): Promise<number[]> {
    // Placeholder embedding (we’ll later call embeddings API)
    return [0.1, 0.2, 0.3];
  }
}
