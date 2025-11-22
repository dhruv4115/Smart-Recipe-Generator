// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
// import { RecipesModule } from './recipes/recipes.module';
// import { AiModule } from './ai/ai.module';
// import { IngredientsModule } from './ingredients/ingredients.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    // UsersModule,
    // AuthModule,
    // RecipesModule,
    // AiModule,
    // IngredientsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
