import { Link } from 'react-router-dom';
import { ChefHat, Github, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              <span className="font-serif font-semibold">RecipeAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered recipe generation from your ingredients
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/upload" className="hover:text-foreground transition-colors">
                  Upload Ingredients
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="hover:text-foreground transition-colors">
                  Browse Recipes
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-foreground transition-colors">
                  Saved Recipes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/preferences" className="hover:text-foreground transition-colors">
                  Preferences
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com/dhruv4115"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/dhruv_kumar_tiwari/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RecipeAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
