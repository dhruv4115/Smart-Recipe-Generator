import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './endpoints';

export interface DetectIngredientsResponse {
  detectedIngredients: string[];
}

export const ingredientsAPI = {
  detectFromImages: async (images: File[]): Promise<DetectIngredientsResponse> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const { data } = await axiosInstance.post(
      API_ENDPOINTS.DETECT_INGREDIENTS,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for AI processing
      }
    );
    return data;
  },

  // getIngredients: async () => {
  //   const { data } = await axiosInstance.get(API_ENDPOINTS.GET_INGREDIENTS);
  //   return data;
  // },
};
