import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me/preferences')
  async getPreferences(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return user?.preferences || {};
  }

  @Put('me/preferences')
  async updatePreferences(
    @Req() req: any,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const user = await this.usersService.updatePreferences(
      req.user.userId,
      dto,
    );
    return user.preferences;
  }
}