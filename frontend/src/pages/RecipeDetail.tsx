import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, Star, Users, Heart, RefreshCw, Loader2 } from 'lucide-react';
import { recipesAPI } from '@/api/recipes';
import { userAPI } from '@/api/user';
import { RecipeDetailSkeleton } from '@/components/RecipeDetailSkeleton';
import { formatCookingTime, getDifficultyColor } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [rating, setRating] = useState(0);
  const { isAuthenticated, user } = useAuthStore();
  const [substitutionsOpen, setSubstitutionsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipesAPI.getRecipe(id!),
    enabled: !!id,
  });

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: userAPI.getFavorites,
    enabled: isAuthenticated,
  });

  const isFavorite = favoritesData?.items?.some((fav: any) => fav._id === id);

  const { data: substitutions, refetch: refetchSubstitutions, isLoading: substitutionsLoading } = useQuery({
    queryKey: ['substitutions', id],
    queryFn: () => recipesAPI.getSubstitutions(id!, {
      dietaryPreferences: user?.preferences?.dietaryPreferences,
      allergies: user?.preferences?.allergies,
    }),
    enabled: false,
  });

  const rateMutation = useMutation({
    mutationFn: (newRating: number) => recipesAPI.rateRecipe(id!, newRating),
    onSuccess: () => {
      toast.success('Rating submitted!');
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
    },
    onError: () => {
      toast.error('Failed to submit rating');
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => recipesAPI.toggleFavorite(id!),
    onSuccess: (data) => {
      toast.success(data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: () => {
      toast.error('Failed to update favorites');
    },
  });

  const handleRate = (newRating: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate recipes');
      return;
    }
    setRating(newRating);
    rateMutation.mutate(newRating);
  };

  const handleGetSubstitutions = () => {
    if (!isAuthenticated) {
      toast.error('Please login to get substitutions');
      return;
    }
    setSubstitutionsOpen(true);
    refetchSubstitutions();
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/recipes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>
          <RecipeDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground mb-4">Recipe not found</p>
            <Button asChild>
              <Link to="/recipes">Back to Recipes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  {recipe.imageUrl && (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-serif font-bold mb-3">
                      {recipe.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                      {recipe.dietaryTags?.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-6 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {formatCookingTime(recipe.cookingTimeMinutes)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {recipe.servings} servings
                      </div>
                      {recipe.averageRating && (
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          {recipe.averageRating.toFixed(1)} ({recipe.ratingCount || 0})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {recipe.description && (
                  <>
                    <p className="text-muted-foreground">{recipe.description}</p>
                    <Separator />
                  </>
                )}

                <div>
                  <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        <span>
                          {ingredient.quantity && `${ingredient.quantity} `}
                          {ingredient.unit && `${ingredient.unit} `}
                          {ingredient.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                  <ol className="space-y-4">
                    {recipe.steps.map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </span>
                        <p className="pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={isFavorite ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => toggleFavoriteMutation.mutate()}
                  disabled={!isAuthenticated || toggleFavoriteMutation.isPending}
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
                  />
                  {toggleFavoriteMutation.isPending ? 'Saving...' : isFavorite ? 'Saved' : 'Save Recipe'}
                </Button>

                <Dialog open={substitutionsOpen} onOpenChange={setSubstitutionsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={handleGetSubstitutions}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Get Substitutions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Ingredient Substitutions</DialogTitle>
                    </DialogHeader>
                    {substitutionsLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Finding substitutions...</p>
                      </div>
                    ) : substitutions ? (
                      <div className="space-y-4">
                        {substitutions.substitutions && substitutions.substitutions.length > 0 ? (
                          <>
                            {substitutions.substitutions.map((sub: any, index: number) => (
                              <Card key={index}>
                                <CardContent className="pt-6">
                                  <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                      <p className="font-medium text-muted-foreground line-through">
                                        {sub.original}
                                      </p>
                                    </div>
                                    <div className="text-muted-foreground">→</div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-primary">{sub.suggested}</p>
                                      <p className="text-sm text-muted-foreground mt-1">{sub.reason}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            {substitutions.notes && (
                              <div className="mt-4 p-4 bg-muted rounded-lg">
                                <p className="text-sm">{substitutions.notes}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No substitutions needed for your dietary preferences.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {recipe.nutrition && (
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Facts</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {recipe.nutrition.perServing ? 'Per serving' : 'Total recipe'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calories</span>
                    <span className="font-semibold">{recipe.nutrition.calories}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protein</span>
                    <span className="font-semibold">{recipe.nutrition.protein}g</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carbs</span>
                    <span className="font-semibold">{recipe.nutrition.carbs}g</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fat</span>
                    <span className="font-semibold">{recipe.nutrition.fat}g</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Rate This Recipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className="transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!isAuthenticated || rateMutation.isPending}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
