import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ingredientSchema = z.object({
  ingredient: z.string().min(2, 'Ingredient name must be at least 2 characters'),
});

export const preferencesSchema = z.object({
  dietaryPreferences: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  dislikedIngredients: z.array(z.string()).default([]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type IngredientFormData = z.infer<typeof ingredientSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
