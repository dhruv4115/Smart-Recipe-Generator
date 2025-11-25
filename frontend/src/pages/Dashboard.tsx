import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Heart, Settings, TrendingUp, ChefHat } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const preferences = user?.preferences;

  const quickActions = [
    {
      title: 'Upload Ingredients',
      description: 'Take photos to detect ingredients',
      icon: Upload,
      href: '/upload',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'My Favorites',
      description: 'View your saved recipes',
      icon: Heart,
      href: '/favorites',
      color: 'bg-red-500/10 text-red-600',
    },
    {
      title: 'Browse Recipes',
      description: 'Explore recipe collection',
      icon: ChefHat,
      href: '/recipes',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: 'Preferences',
      description: 'Update dietary settings',
      icon: Settings,
      href: '/preferences',
      color: 'bg-purple-500/10 text-purple-600',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to discover your next favorite recipe?
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* User Info Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Saved Recipes</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Recipes Tried</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Average Rating</span>
                <span className="font-semibold">-</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {preferences?.dietaryPreferences && preferences.dietaryPreferences.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preferences.dietaryPreferences.map((pref) => (
                    <span
                      key={pref}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    No dietary preferences set yet
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/preferences">Add Preferences</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-serif font-bold mb-3">
              Start Creating Today
            </h3>
            <p className="text-muted-foreground mb-6">
              Upload your ingredients and let AI suggest perfect recipes
            </p>
            <Button size="lg" asChild>
              <Link to="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload Ingredients
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
