import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryRecipesDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'], { message: 'Invalid difficulty' })
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsOptional()
  @IsNumberString()
  maxTime?: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  diet?: string;

  @IsOptional()
  @IsString()
  search?: string;
}