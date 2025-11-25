import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Settings, Loader2, X } from 'lucide-react';
import { userAPI } from '@/api/user';
import { useAuthStore } from '@/store/authStore';
import { preferencesSchema, PreferencesFormData } from '@/utils/validation';
import { DIETARY_PREFERENCES, COMMON_ALLERGIES } from '@/utils/constants';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Preferences() {
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const { updateUser } = useAuthStore();

  const { handleSubmit } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
  });

  const { data: preferences, isLoading: loadingPreferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: userAPI.getPreferences,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: userAPI.updatePreferences,
    onSuccess: (data) => {
      updateUser({ preferences: data });
      toast.success('Preferences updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    },
  });

  useEffect(() => {
    if (preferences) {
      setSelectedDietaryPreferences(preferences.dietaryPreferences || []);
      setSelectedAllergies(preferences.allergies || []);
      setDislikedIngredients(preferences.dislikedIngredients || []);
    }
  }, [preferences]);

  const toggleDietaryPreference = (preference: string) => {
    setSelectedDietaryPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const addDislikedIngredient = () => {
    if (newIngredient.trim() && !dislikedIngredients.includes(newIngredient.trim())) {
      setDislikedIngredients((prev) => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeDislikedIngredient = (ingredient: string) => {
    setDislikedIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const onSubmit = async () => {
    const data = {
      dietaryPreferences: selectedDietaryPreferences,
      allergies: selectedAllergies,
      dislikedIngredients,
    };
    updatePreferencesMutation.mutate(data);
  };

  if (loadingPreferences) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading preferences..." />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-serif font-bold">Preferences</h1>
              <p className="text-muted-foreground">
                Customize your recipe recommendations
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>
                  Select your dietary requirements and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {DIETARY_PREFERENCES.map((preference) => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diet-${preference}`}
                        checked={selectedDietaryPreferences.includes(preference)}
                        onCheckedChange={() => toggleDietaryPreference(preference)}
                      />
                      <label
                        htmlFor={`diet-${preference}`}
                        className="text-sm cursor-pointer leading-none"
                      >
                        {preference}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allergies</CardTitle>
                <CardDescription>
                  Let us know about any food allergies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {COMMON_ALLERGIES.map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${allergy}`}
                        checked={selectedAllergies.includes(allergy)}
                        onCheckedChange={() => toggleAllergy(allergy)}
                      />
                      <label
                        htmlFor={`allergy-${allergy}`}
                        className="text-sm cursor-pointer leading-none"
                      >
                        {allergy}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disliked Ingredients</CardTitle>
                <CardDescription>
                  Add ingredients you'd like to avoid in recipes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add ingredient to avoid"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDislikedIngredient();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addDislikedIngredient}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>

                {dislikedIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dislikedIngredients.map((ingredient) => (
                      <Badge key={ingredient} variant="secondary" className="gap-2">
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => removeDislikedIngredient(ingredient)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={updatePreferencesMutation.isPending}>
              {updatePreferencesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
