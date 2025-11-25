import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './endpoints';

export interface UserPreferences {
  dietaryPreferences: string[];
  allergies: string[];
  dislikedIngredients: string[];
}

export const userAPI = {
  // getUser: async () => {
  //   const { data } = await axiosInstance.get(API_ENDPOINTS.GET_USER);
  //   return data;
  // },

  getPreferences: async (): Promise<UserPreferences> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.GET_PREFERENCES);
    return data;
  },

  updatePreferences: async (preferences: UserPreferences): Promise<UserPreferences> => {
    const { data } = await axiosInstance.put(
      API_ENDPOINTS.UPDATE_PREFERENCES,
      preferences
    );
    return data;
  },

  getFavorites: async () => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.GET_FAVORITES);
    return data;
  },

  // addFavorite: async (recipeId: string) => {
  //   const { data } = await axiosInstance.post(API_ENDPOINTS.ADD_FAVORITE, {
  //     recipeId,
  //   });
  //   return data;
  // },

  // removeFavorite: async (recipeId: string) => {
  //   const { data } = await axiosInstance.delete(
  //     API_ENDPOINTS.REMOVE_FAVORITE(recipeId)
  //   );
  //   return data;
  // },
};
