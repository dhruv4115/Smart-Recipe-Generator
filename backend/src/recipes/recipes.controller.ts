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
import { GenerateRecipeDto } from './dto/generate-recipe.dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private recipesService: RecipesService) {}

  @Get()
  async findAll(@Query() query: QueryRecipesDto) {
    return this.recipesService.findAll(query);
  }

//   @UseGuards(JwtAuthGuard)
//   @Post('generate')
//   async generateRecipe(@Body() dto: GenerateRecipeDto, @Req() req: any) {
//     const recipe = await this.recipesService.generateAndSave(dto);
//     return recipe;
//   }

// @UseGuards(JwtAuthGuard)
// @Post('generate-ai')
// async generateRecipeWithAi(@Body() dto: GenerateRecipeDto, @Req() req: any) {
// const recipe = await this.recipesService.generateAndSave(dto);
// return recipe.toJSON ? recipe.toJSON() : recipe;
// }
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateRecipe(@Body() dto: GenerateRecipeDto, @Req() req: any) {
    const saved = await this.recipesService.generateAndSave(dto);
    console.log('Generated & saved recipe with _id:', saved._id?.toString());
    return saved.toJSON ? saved.toJSON() : saved;
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

  @UseGuards(JwtAuthGuard)
    @Post(':id/favorite')
    async toggleFavorite(@Req() req, @Param('id') recipeId: string) {
    const userId = req.user.userId || req.user.sub; // whichever your JWT uses

    return this.recipesService.toggleFavorite(userId, recipeId);
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