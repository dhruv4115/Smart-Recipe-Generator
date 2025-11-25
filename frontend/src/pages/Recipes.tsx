import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recipesAPI } from '@/api/recipes';
import { userAPI } from '@/api/user';
import { useIngredientsStore } from '@/store/ingredientsStore';
import { useAuthStore } from '@/store/authStore';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeListSkeleton } from '@/components/RecipeSkeleton';
import { SORT_OPTIONS, DIFFICULTY_LEVELS } from '@/utils/constants';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function Recipes() {
  const [sortBy, setSortBy] = useState('match');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { getAllIngredients } = useIngredientsStore();
  const { isAuthenticated } = useAuthStore();

  const ingredients = getAllIngredients();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    difficulty: '',
    maxTime: '',
    cuisine: '',
    diet: '',
    search: '',
  });

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', ingredients, sortBy, page, filters],
    queryFn: async () => {
      if (ingredients.length > 0) {
        return await recipesAPI.recommend({
          ingredients,
          dietaryPreferences: filters.diet ? [filters.diet] : undefined,
          maxCookingTimeMinutes: filters.maxTime ? parseInt(filters.maxTime) : undefined,
          difficulty: filters.difficulty as 'easy' | 'medium' | 'hard' | undefined,
        });
      }
      return await recipesAPI.getRecipes({
        page,
        limit: 12,
        difficulty: filters.difficulty || undefined,
        maxTime: filters.maxTime ? parseInt(filters.maxTime) : undefined,
        cuisine: filters.cuisine || undefined,
        diet: filters.diet || undefined,
        search: filters.search || undefined,
      });
    },
  });

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: userAPI.getFavorites,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (favoritesData?.items) {
      setFavorites(favoritesData.items.map((fav: any) => fav._id));
    }
  }, [favoritesData]);

  const queryClient = useQueryClient();

  const handleFavorite = async (recipeId: string) => {
      if (!isAuthenticated) {
        toast.error('Please login to save recipes');
        return;
      }

      try {
        await recipesAPI.toggleFavorite(recipeId);

        // refresh lists that depend on favorites
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
        queryClient.invalidateQueries({ queryKey: ['favorites'] });

        toast.success('Favorites updated');
      } catch (error) {
        toast.error('Failed to update favorites');
      }
    };

  const recipeItems = ingredients.length > 0 
    ? (recipes as any)?.items?.map((item: any) => item.recipe) || []
    : recipes?.items || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">
              {ingredients.length > 0 ? 'Recommended Recipes' : 'Browse Recipes'}
            </h1>
            <p className="text-muted-foreground">
              {ingredients.length > 0
                ? `Found recipes matching your ${ingredients.length} ingredients`
                : 'Discover delicious recipes from our collection'}
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search recipes..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any difficulty</SelectItem>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Time (min)</label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={filters.maxTime}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxTime: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Cuisine</label>
                  <Input
                    placeholder="e.g. Italian"
                    value={filters.cuisine}
                    onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      difficulty: '',
                      maxTime: '',
                      cuisine: '',
                      diet: '',
                      search: '',
                    });
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <RecipeListSkeleton count={12} />
        ) : recipeItems.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipeItems.map((recipe: any) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onFavorite={handleFavorite}
                  isFavorite={favorites.includes(recipe._id)}
                />
              ))}
            </div>
            {!ingredients.length && recipes && 'totalPages' in recipes && recipes.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {recipes.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === recipes.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                No recipes found. Try adjusting your filters or adding ingredients!
              </p>
              <Button asChild>
                <a href="/upload">Upload Ingredients</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
