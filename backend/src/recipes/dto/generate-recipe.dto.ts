import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GenerateRecipeDto {
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;
}
