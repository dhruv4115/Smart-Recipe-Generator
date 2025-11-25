import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChefHat, LogOut, User, Heart, Upload, Plus, Sparkles, Menu, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-semibold text-foreground">
            RecipeAI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/recipes">Recipes</Link>
          </Button>
          
          <Button variant="ghost" size="sm" asChild>
            <Link to="/recommend">
              <Sparkles className="h-4 w-4 mr-2" />
              Recommend
            </Link>
          </Button>
          
          <ThemeToggle />
          
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <Link to="/recipes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/preferences" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" asChild className="justify-start">
                    <Link to="/recipes" onClick={closeMobileMenu}>
                      Recipes
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild className="justify-start">
                    <Link to="/recommend" onClick={closeMobileMenu}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Recommend
                    </Link>
                  </Button>

                  {isAuthenticated && (
                    <>
                      <Separator className="my-2" />
                      
                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link to="/dashboard" onClick={closeMobileMenu}>
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link to="/upload" onClick={closeMobileMenu}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Ingredients
                        </Link>
                      </Button>

                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link to="/recipes/new" onClick={closeMobileMenu}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Recipe
                        </Link>
                      </Button>

                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link to="/favorites" onClick={closeMobileMenu}>
                          <Heart className="h-4 w-4 mr-2" />
                          Favorites
                        </Link>
                      </Button>

                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link to="/preferences" onClick={closeMobileMenu}>
                          <Settings className="h-4 w-4 mr-2" />
                          Preferences
                        </Link>
                      </Button>

                      <Separator className="my-2" />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  )}

                  {!isAuthenticated && (
                    <>
                      <Separator className="my-2" />
                      
                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link to="/login" onClick={closeMobileMenu}>
                          Login
                        </Link>
                      </Button>
                      
                      <Button size="sm" asChild>
                        <Link to="/register" onClick={closeMobileMenu}>
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
