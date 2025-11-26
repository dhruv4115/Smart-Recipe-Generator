export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  // REFRESH: '/auth/refresh',
  ME: '/auth/me',
  
  // Ingredients
  DETECT_INGREDIENTS: '/ingredients/from-images',
  // GET_INGREDIENTS: '/ingredients',
  
  // Recipes
  RECOMMEND_RECIPES: '/recipes/recommend',
  GET_RECIPE: (id: string) => `/recipes/${id}`,
  GET_RECIPES: '/recipes',
  GET_SUBSTITUTIONS: (id: string) => `/recipes/${id}/substitutions`,
  RATE_RECIPE: (id: string) => `/recipes/${id}/rate`,
  GENERATE_RECIPE: '/recipes/generate',
  
  // User
  // GET_USER: '/users/me',
  GET_PREFERENCES: '/users/me/preferences',
  UPDATE_PREFERENCES: '/users/me/preferences',
  GET_FAVORITES: '/users/me/favorites',
  ADD_FAVORITE: '/users/me/favorites',
  TOGGLE_FAVORITE: (id: string) => `/recipes/${id}/favorite`,
  
  // AI
  // GET_NUTRITION: '/ai/nutrition',
  // ANALYZE_RECIPE: '/ai/analyze',
} as const;
