import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema()
export class Ingredient {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false })
  quantity?: number;

  @Prop({ required: false, trim: true })
  unit?: string;
}

const IngredientSchema = SchemaFactory.createForClass(Ingredient);

@Schema()
export class Nutrition {
  @Prop()
  calories: number;

  @Prop()
  protein: number;

  @Prop()
  carbs: number;

  @Prop()
  fat: number;

  @Prop({ default: true })
  perServing: boolean;
}

const NutritionSchema = SchemaFactory.createForClass(Nutrition);

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: [IngredientSchema], default: [] })
  ingredients: Ingredient[];

  @Prop({ type: [String], default: [] })
  steps: string[];

  @Prop({ trim: true })
  cuisine: string;

  @Prop({
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  })
  difficulty: string;

  @Prop()
  cookingTimeMinutes: number;

  @Prop()
  servings: number;

  @Prop({ type: [String], default: [] })
  dietaryTags: string[];

  @Prop()
  imageUrl?: string;

  @Prop({ type: NutritionSchema })
  nutrition?: Nutrition;

  @Prop({ type: [Number], default: [] })
  embeddingVector: number[];

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  ratingCount: number;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);