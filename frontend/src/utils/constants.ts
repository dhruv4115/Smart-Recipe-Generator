export const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'High-Protein',
  'Halal',
  'Kosher',
] as const;

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

export const SORT_OPTIONS = [
  { value: 'match', label: 'Best Match' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'time', label: 'Cooking Time' },
  { value: 'difficulty', label: 'Difficulty' },
] as const;

export const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Sesame',
] as const;
