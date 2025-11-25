import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChefHat, Loader2 } from 'lucide-react';
import { authAPI } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { registerSchema, RegisterFormData } from '@/utils/validation';
import { DIETARY_PREFERENCES } from '@/utils/constants';
import { toast } from 'react-hot-toast';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(response.user, response.accessToken);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create account';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreference = (preference: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Create Your Account</CardTitle>
          <CardDescription>
            Join RecipeAI and start discovering amazing recipes
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register('name')}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Dietary Preferences (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DIETARY_PREFERENCES.map((preference) => (
                  <div key={preference} className="flex items-center space-x-2">
                    <Checkbox
                      id={preference}
                      checked={selectedPreferences.includes(preference)}
                      onCheckedChange={() => togglePreference(preference)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={preference}
                      className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {preference}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
