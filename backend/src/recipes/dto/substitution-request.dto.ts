import { IsArray, IsOptional, IsString } from 'class-validator';

export class SubstitutionRequestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}
