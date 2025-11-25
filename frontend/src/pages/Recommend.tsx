import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { recipesAPI } from '@/api/recipes';
import { userAPI } from '@/api/user';
import { RecipeCard } from '@/components/RecipeCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Recommend() {
  const location = useLocation();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [difficulty, setDifficulty] = useState<string>('any');
  const [maxTime, setMaxTime] = useState('');
  const [servings, setServings] = useState('4');
  const [hasSearched, setHasSearched] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Load ingredients from navigation state (from Upload page)
  useEffect(() => {
    if (location.state?.ingredients) {
      setIngredients(location.state.ingredients);
    }
  }, [location.state]);

  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: userAPI.getPreferences,
    enabled: isAuthenticated,
  });

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['recommendations', ingredients, difficulty, maxTime, servings],
    queryFn: async () => {
      if (ingredients.length === 0) return null;

      const difficultyForApi =
        !difficulty || difficulty === 'any'
          ? undefined
          : (difficulty as 'easy' | 'medium' | 'hard');

      return await recipesAPI.recommend({
        ingredients,
        dietaryPreferences: preferences?.dietaryPreferences,
        maxCookingTimeMinutes: maxTime ? parseInt(maxTime) : undefined,
        difficulty: difficultyForApi,
        servings: servings ? parseInt(servings) : undefined,
      });
    },
    enabled: false,
  });


  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleGetRecommendations = () => {
    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }
    setHasSearched(true);
    refetch();
  };

  const handleFavorite = async (recipeId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to save recipes');
      return;
    }
    try {
      await recipesAPI.toggleFavorite(recipeId);
      toast.success('Favorites updated');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-serif font-bold">Recipe Recommendations</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Enter your ingredients and let AI find the perfect recipes for you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ingredient">Add Ingredient</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="ingredient"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., tomato, onion, garlic"
                  />
                  <Button onClick={handleAddIngredient} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {ingredients.length > 0 && (
                <div className="space-y-2">
                  <Label>Ingredients ({ingredients.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient) => (
                      <Badge key={ingredient} variant="secondary" className="gap-1">
                        {ingredient}
                        <button
                          onClick={() => handleRemoveIngredient(ingredient)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="difficulty">Difficulty (optional)</Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any difficulty</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div>
                <Label htmlFor="maxTime">Max Cooking Time (minutes)</Label>
                <Input
                  id="maxTime"
                  type="number"
                  value={maxTime}
                  onChange={(e) => setMaxTime(e.target.value)}
                  placeholder="e.g., 30"
                />
              </div>

              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="4"
                />
              </div>

              <Button
                onClick={handleGetRecommendations}
                className="w-full"
                disabled={ingredients.length === 0 || isLoading}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get Recommendations
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" text="Finding perfect recipes..." />
              </div>
            ) : recommendations?.items ? (
              <div className="space-y-6">
                {recommendations.explanation && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium">{recommendations.explanation}</p>
                    </CardContent>
                  </Card>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  {recommendations.items.map((item) => (
                    <div key={item.recipe._id} className="space-y-2">
                      <RecipeCard
                        recipe={item.recipe}
                        onFavorite={handleFavorite}
                      />
                      <Card className="bg-muted/50">
                        <CardContent className="pt-4 pb-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Match:</span>{' '}
                              <span className="font-semibold">{(item.scores.overlap * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Semantic:</span>{' '}
                              <span className="font-semibold">{(item.scores.semantic * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Popularity:</span>{' '}
                              <span className="font-semibold">{(item.scores.popularity * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Overall:</span>{' '}
                              <span className="font-semibold">{(item.scores.combined * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          {item.explanation && (
                            <p className="text-xs text-muted-foreground mt-2">{item.explanation}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ) : hasSearched ? (
              <Card className="min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    No recipes found. Try different ingredients or adjust your filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-xl font-semibold mb-2">Ready to discover recipes?</p>
                    <p className="text-muted-foreground">
                      Add your ingredients on the left and click "Get Recommendations"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
