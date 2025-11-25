import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recipesAPI, CreateRecipeDto } from '@/api/recipes';
import { ChefHat, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const createRecipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1, 'Ingredient name required'),
    quantity: z.number().optional(),
    unit: z.string().optional(),
  })).min(1, 'At least one ingredient required'),
  steps: z.array(z.string().min(1, 'Step cannot be empty')).min(1, 'At least one step required'),
  cuisine: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  cookingTimeMinutes: z.number().min(1, 'Cooking time must be at least 1 minute'),
  servings: z.number().min(1, 'Servings must be at least 1'),
  dietaryTags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type CreateRecipeForm = z.infer<typeof createRecipeSchema>;

export default function CreateRecipe() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateRecipeForm>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      ingredients: [{ name: '', quantity: undefined, unit: '' }],
      steps: [''],
      difficulty: 'medium',
      servings: 4,
      cookingTimeMinutes: 30,
      dietaryTags: [],
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps' as any,
  });

  const onSubmit = async (data: CreateRecipeForm) => {
    setIsLoading(true);
    try {
      const recipeData: CreateRecipeDto = {
        title: data.title,
        description: data.description,
        ingredients: data.ingredients.filter(ing => ing.name).map(ing => ({
          name: ing.name!,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
        steps: data.steps,
        cuisine: data.cuisine,
        difficulty: data.difficulty,
        cookingTimeMinutes: data.cookingTimeMinutes,
        servings: data.servings,
        imageUrl: data.imageUrl || undefined,
        dietaryTags: data.dietaryTags?.filter(tag => tag.length > 0),
      };
      const newRecipe = await recipesAPI.createRecipe(recipeData);
      toast.success('Recipe created successfully!');
      navigate(`/recipes/${newRecipe._id}`);
    } catch (error: any) {
      console.error('Failed to create recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-serif font-bold">Create New Recipe</h1>
          </div>
          <p className="text-muted-foreground">Share your culinary creation with the community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Recipe Title *</Label>
                <Input id="title" {...register('title')} disabled={isLoading} />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} disabled={isLoading} rows={3} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cuisine">Cuisine</Label>
                  <Input id="cuisine" {...register('cuisine')} placeholder="e.g., Italian, Mexican" disabled={isLoading} />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." disabled={isLoading} />
                  {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={watch('difficulty')}
                    onValueChange={(value) => setValue('difficulty', value as 'easy' | 'medium' | 'hard')}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cookingTimeMinutes">Cooking Time (minutes) *</Label>
                  <Input
                    id="cookingTimeMinutes"
                    type="number"
                    {...register('cookingTimeMinutes', { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.cookingTimeMinutes && <p className="text-sm text-destructive mt-1">{errors.cookingTimeMinutes.message}</p>}
                </div>

                <div>
                  <Label htmlFor="servings">Servings *</Label>
                  <Input
                    id="servings"
                    type="number"
                    {...register('servings', { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.servings && <p className="text-sm text-destructive mt-1">{errors.servings.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ingredients</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => appendIngredient({ name: '', quantity: undefined, unit: '' })}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 grid md:grid-cols-3 gap-2">
                    <Input
                      {...register(`ingredients.${index}.name`)}
                      placeholder="Ingredient name"
                      disabled={isLoading}
                    />
                    <Input
                      {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="Quantity"
                      disabled={isLoading}
                    />
                    <Input
                      {...register(`ingredients.${index}.unit`)}
                      placeholder="Unit (e.g., cups, grams)"
                      disabled={isLoading}
                    />
                  </div>
                  {ingredientFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.ingredients && <p className="text-sm text-destructive">{errors.ingredients.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Steps</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => (appendStep as any)('')}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stepFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <Textarea
                    {...register(`steps.${index}`)}
                    placeholder={`Step ${index + 1}`}
                    disabled={isLoading}
                    rows={2}
                    className="flex-1"
                  />
                  {stepFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.steps && <p className="text-sm text-destructive">{errors.steps.message}</p>}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Recipe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
