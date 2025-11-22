import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class UserPreferences {
  @Prop({ type: [String], default: [] })
  dietaryPreferences: string[];

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  dislikedIngredients: string[];
}

const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: UserPreferencesSchema, default: {} })
  preferences: UserPreferences;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Recipe' }], default: [] })
  favorites: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
