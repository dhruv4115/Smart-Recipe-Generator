import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(params: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<UserDocument> {
    const user = new this.userModel({
      email: params.email,
      passwordHash: params.passwordHash,
      name: params.name,
    });
    return user.save();
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.dietaryPreferences': dto.dietaryPreferences,
            'preferences.allergies': dto.allergies,
            'preferences.dislikedIngredients': dto.dislikedIngredients,
          },
        },
        { new: true },
      )
      .exec();

    if (!user) throw new NotFoundException({ message: 'User not found' });
    return user;
  }

  async addFavorite(userId: string, recipeId: string): Promise<UserDocument> {
    const user = await this.userModel
    .findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: recipeId } },
      { new: true },
    )
    .exec();

    if (!user) throw new NotFoundException('User not found');
    return user;
}


  async removeFavorite(userId: string, recipeId: string): Promise<UserDocument> {
    const user = await this.userModel
    .findByIdAndUpdate(
      userId,
      { $pull: { favorites: recipeId } },
      { new: true },
    )
    .exec();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async getFavoritesWithRecipes(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('favorites')
      .exec();

    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    // favorites will be populated with Recipe documents
    return user.favorites;
  }

}