import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Upload, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import heroImage from '@/assets/hero-cooking.jpg';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Recipe Discovery
              </div>
              
              <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight">
                Turn Your Ingredients Into
                <span className="text-primary"> Delicious Recipes</span>
              </h1>
              
              <p className="text-xl text-muted-foreground">
                Upload photos of your ingredients and let AI create personalized recipes tailored to your dietary preferences and cooking style.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg">
                  <Link to={isAuthenticated ? '/upload' : '/register'}>
                    <Upload className="mr-2 h-5 w-5" />
                    Start Creating
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg">
                  <Link to="/recipes">
                    Browse Recipes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
              <img
                src={heroImage}
                alt="Fresh ingredients"
                className="relative rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to discover your next favorite recipe
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Upload Ingredients</CardTitle>
              <CardDescription>
                Take photos of your ingredients or manually add them to your list
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI Processing</CardTitle>
              <CardDescription>
                Our AI analyzes your ingredients and preferences to find perfect recipes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Cook & Enjoy</CardTitle>
              <CardDescription>
                Get step-by-step instructions with nutrition info and cooking tips
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold">
                Personalized For Your Diet
              </h2>
              <p className="text-muted-foreground text-lg">
                Whether you're vegan, gluten-free, keto, or have specific allergies, 
                our AI ensures every recipe matches your dietary requirements perfectly.
              </p>
              <ul className="space-y-3">
                {['Dietary preference filtering', 'Allergy-aware suggestions', 'Ingredient substitutions', 'Nutrition tracking'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-6">
              <CardHeader>
                <Heart className="h-8 w-8 text-primary mb-4" />
                <CardTitle>Save Your Favorites</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build your personal cookbook by saving recipes you love. Access them anytime, 
                  get similar recommendations, and never lose track of that perfect dish.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="text-center py-12 px-6">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Ready to Start Cooking?
            </h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of home cooks discovering new recipes every day
            </p>
            <Button size="lg" asChild>
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
