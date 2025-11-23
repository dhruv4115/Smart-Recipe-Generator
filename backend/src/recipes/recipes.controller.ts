import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecommendRecipesDto } from './dto/recommend-recipes.dto';
import { RateRecipeDto } from './dto/rate-recipe.dto';
import { SubstitutionRequestDto } from './dto/substitution-request.dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private recipesService: RecipesService) {}

  @Get()
  async findAll(@Query() query: QueryRecipesDto) {
    return this.recipesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recipesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() dto: CreateRecipeDto) {
    return this.recipesService.create(dto);
  }

  @Post('recommend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async recommend(
    @Req() req: any,
    @Body() dto: RecommendRecipesDto,
  ) {
    return this.recipesService.recommend(req.user.userId, dto);
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async rate(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RateRecipeDto,
  ) {
    return this.recipesService.rateRecipe(req.user.userId, id, dto);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async toggleFavorite(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.recipesService.toggleFavorite(req.user.userId, id);
  }

  @Post(':id/substitutions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async substitutions(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: SubstitutionRequestDto,
  ) {
    return this.recipesService.getSubstitutions(
      req.user.userId,
      id,
      dto,
    );
  }
}