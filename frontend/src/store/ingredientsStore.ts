import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IngredientsState {
  detectedIngredients: string[];
  customIngredients: string[];
  setDetectedIngredients: (ingredients: string[]) => void;
  addCustomIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;
  getAllIngredients: () => string[];
}

export const useIngredientsStore = create<IngredientsState>()(
  persist(
    (set, get) => ({
      detectedIngredients: [],
      customIngredients: [],

      setDetectedIngredients: (ingredients) =>
        set({ detectedIngredients: ingredients }),

      addCustomIngredient: (ingredient) =>
        set((state) => ({
          customIngredients: [...state.customIngredients, ingredient],
        })),

      removeIngredient: (ingredient) =>
        set((state) => ({
          detectedIngredients: state.detectedIngredients.filter(
            (i) => i !== ingredient
          ),
          customIngredients: state.customIngredients.filter(
            (i) => i !== ingredient
          ),
        })),

      clearIngredients: () =>
        set({ detectedIngredients: [], customIngredients: [] }),

      getAllIngredients: () => {
        const state = get();
        return [...state.detectedIngredients, ...state.customIngredients];
      },
    }),
    {
      name: 'ingredients-storage',
    }
  )
);
