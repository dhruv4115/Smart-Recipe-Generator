import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, Heart } from 'lucide-react';
import { Recipe } from '@/api/recipes';
import { formatCookingTime, getDifficultyColor } from '@/utils/helpers';

interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export const RecipeCard = ({ recipe, onFavorite, isFavorite }: RecipeCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link to={`/recipes/${recipe._id}`}>
        <div className="relative h-48 overflow-hidden bg-muted">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="pb-3">
        <Link to={`/recipes/${recipe._id}`}>
          <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
            {recipe.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty}
          </Badge>
          {recipe.dietaryTags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatCookingTime(recipe.cookingTimeMinutes)}
          </div>
          {recipe.averageRating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {recipe.averageRating.toFixed(1)}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            onFavorite?.(recipe._id);
          }}
        >
          <Heart
            className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
          />
          {isFavorite ? 'Saved' : 'Save Recipe'}
        </Button>
      </CardFooter>
    </Card>
  );
};
