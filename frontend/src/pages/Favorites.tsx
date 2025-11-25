import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userAPI } from '@/api/user';
import { RecipeCard } from '@/components/RecipeCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Favorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const { data: favoritesResponse, isLoading, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: userAPI.getFavorites,
  });

  const favorites = favoritesResponse?.items || [];

  useEffect(() => {
    if (favorites) {
      setFavoriteIds(favorites.map((fav: any) => fav._id));
    }
  }, [favorites]);

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      await userAPI.removeFavorite(recipeId);
      setFavoriteIds((prev) => prev.filter((id) => id !== recipeId));
      toast.success('Removed from favorites');
      refetch();
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading favorites..." />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary fill-current" />
            <h1 className="text-4xl font-serif font-bold">My Favorites</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {favorites.length} saved recipes
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((recipe: any) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onFavorite={handleRemoveFavorite}
                isFavorite={true}
              />
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center space-y-4">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-xl font-semibold mb-2">No favorites yet</p>
                <p className="text-muted-foreground mb-6">
                  Start saving recipes you love to build your personal cookbook
                </p>
              </div>
              <Button asChild>
                <a href="/recipes">Browse Recipes</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
