// src/api/recipes.ts
import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './endpoints';

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  perServing: boolean;
}

export interface RecipeIngredient {
  name: string;
  quantity?: number;
  unit?: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  cuisine?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTimeMinutes: number;
  servings: number;
  dietaryTags?: string[];
  imageUrl?: string;
  nutrition?: Nutrition;
  averageRating?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedRecipesResponse {
  items: Recipe[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RecommendedRecipe {
  recipe: Recipe;
  scores: {
    overlap: number;
    semantic: number;
    popularity: number;
    combined: number;
  };
  explanation: string;
}

export interface RecommendRecipesResponse {
  items: RecommendedRecipe[];
  explanation: string;
}

export interface CreateRecipeDto {
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  cuisine?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTimeMinutes: number;
  servings: number;
  dietaryTags?: string[];
  imageUrl?: string;
  nutrition?: Nutrition; // optional: if omitted, backend estimates
}

export interface SubstitutionSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface RecommendRecipesParams {
  ingredients: string[];
  dietaryPreferences?: string[];
  maxCookingTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
}

export interface SubstitutionsResponse {
  recipeId: string;
  ingredients: string[];
  dietaryPreferences: string[];
  allergies: string[];
  substitutions: SubstitutionSuggestion[];
  notes: string;
}

export interface RateRecipeResponse {
  recipeId: string;
  averageRating: number;
  ratingCount: number;
}

export interface ToggleFavoriteResponse {
  isFavorite: boolean;
}

export const recipesAPI = {
  recommend: async (
    params: RecommendRecipesParams,
  ): Promise<RecommendRecipesResponse> => {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.RECOMMEND_RECIPES,
      params,
    );
    return data;
  },

  getRecipe: async (id: string): Promise<Recipe> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.GET_RECIPE(id));
    return data;
  },

  getRecipes: async (params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    maxTime?: number;
    cuisine?: string;
    diet?: string;
    search?: string;
  }): Promise<PaginatedRecipesResponse> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.GET_RECIPES, {
      params,
    });
    return data;
  },

  createRecipe: async (recipe: CreateRecipeDto): Promise<Recipe> => {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.GET_RECIPES,
      recipe,
    );
    return data;
  },

  getSubstitutions: async (
    id: string,
    preferences?: { dietaryPreferences?: string[]; allergies?: string[] },
  ): Promise<SubstitutionsResponse> => {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.GET_SUBSTITUTIONS(id),
      preferences || {},
    );
    return data;
  },

  rateRecipe: async (
    id: string,
    rating: number,
    comment?: string,
  ): Promise<RateRecipeResponse> => {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.RATE_RECIPE(id),
      {
        rating,
        comment,
      },
    );
    return data;
  },

  toggleFavorite: async (id: string): Promise<ToggleFavoriteResponse> => {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.TOGGLE_FAVORITE(id),
    );
    return data;
  },
};
