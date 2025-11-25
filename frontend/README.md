# Smart Recipe Generator - React Frontend

An AI-powered recipe generator that detects ingredients from images and recommends personalized recipes based on dietary preferences.

![Recipe Generator]

## 🎯 Overview

RecipeAI is a modern web application that helps users discover recipes based on the ingredients they have. Upload photos of your ingredients, and our AI will detect them and suggest perfect recipes tailored to your dietary preferences and cooking style.

## ✨ Features

- **🤖 AI-Powered Ingredient Detection** - Upload photos and automatically detect ingredients
- **🍳 Personalized Recipe Recommendations** - Get recipes matched to your ingredients and preferences
- **❤️ Favorites & Collections** - Save and organize your favorite recipes
- **⚙️ Dietary Preferences** - Filter recipes based on dietary requirements (Vegan, Keto, Gluten-Free, etc.)
- **📊 Nutrition Information** - View detailed nutrition facts for each recipe
- **🔄 Ingredient Substitutions** - Get alternative ingredient suggestions
- **⭐ Recipe Ratings** - Rate and review recipes
- **📱 Responsive Design** - Beautiful UI that works on all devices

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Query (TanStack Query)** - Data fetching and caching
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **React Dropzone** - File upload with drag & drop
- **React Hot Toast** - Beautiful toast notifications
- **Lucide React** - Icon library

## 📁 Project Structure

```
src/
├── api/                    # API integration layer
│   ├── axiosInstance.ts   # Axios configuration with interceptors
│   ├── endpoints.ts       # API endpoint definitions
│   ├── auth.ts            # Authentication API calls
│   ├── recipes.ts         # Recipe API calls
│   ├── ingredients.ts     # Ingredient detection API
│   └── user.ts            # User preferences API
│
├── components/            # Reusable components
│   ├── Navbar.tsx        # Navigation bar with auth
│   ├── Footer.tsx        # Footer component
│   ├── RecipeCard.tsx    # Recipe display card
│   ├── LoadingSpinner.tsx # Loading state component
│   └── ProtectedRoute.tsx # Route guard for authentication
│
├── layouts/              # Layout components
│   └── MainLayout.tsx    # Main app layout with navbar & footer
│
├── pages/                # Page components
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Login page
│   ├── Register.tsx     # Registration page
│   ├── Dashboard.tsx    # User dashboard
│   ├── Upload.tsx       # Ingredient upload page
│   ├── Recipes.tsx      # Recipe listing/search
│   ├── RecipeDetail.tsx # Individual recipe view
│   ├── Favorites.tsx    # Saved recipes
│   ├── Preferences.tsx  # User preferences settings
│   └── NotFound.tsx     # 404 page
│
├── store/                # State management
│   ├── authStore.ts     # Authentication state (Zustand)
│   └── ingredientsStore.ts # Ingredients state (Zustand)
│
├── utils/                # Utility functions
│   ├── constants.ts     # App constants
│   ├── helpers.ts       # Helper functions
│   └── validation.ts    # Zod validation schemas
│
├── App.tsx              # Main app component with routing
└── main.tsx             # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (NestJS server)

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication Flow

1. **Registration**: Users create an account with email/password and optional dietary preferences
2. **Login**: JWT-based authentication with secure token storage
3. **Protected Routes**: Automatic redirect to login for unauthorized access
4. **Token Management**: Axios interceptor automatically attaches JWT to requests
5. **Session Persistence**: Auth state persisted using Zustand with localStorage

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Dark Mode Support** - Built-in theme system
- **Loading States** - Skeleton loaders and spinners for better UX
- **Error Handling** - User-friendly error messages with toast notifications
- **Form Validation** - Client-side validation with Zod schemas
- **Optimistic Updates** - Instant UI feedback for better perceived performance

## 📡 API Integration

The frontend communicates with the NestJS backend API with the following endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Ingredients
- `POST /ingredients/from-images` - Detect ingredients from images (multipart/form-data)

### Recipes
- `POST /recipes/recommend` - Get recipe recommendations
- `GET /recipes/:id` - Get recipe details
- `POST /recipes/:id/rate` - Rate a recipe
- `POST /recipes/:id/substitutions` - Get ingredient substitutions

### User
- `GET /users/me/favorites` - Get user's favorite recipes
- `POST /users/me/favorites` - Add recipe to favorites
- `DELETE /users/me/favorites/:id` - Remove favorite
- `PATCH /users/me/preferences` - Update user preferences

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.


### Environment Variables

Make sure to set the following environment variables in your deployment platform:

- `VITE_API_BASE_URL` - Your backend API URL

## 🧪 Testing

The application includes comprehensive error handling and validation:

- Form validation with Zod schemas
- API error handling with user-friendly messages
- Loading states for async operations
- Retry logic for failed requests

## 🎯 Key Features Implementation

### Image Upload & Detection
- Drag & drop file upload with react-dropzone
- Image preview before upload
- Multi-image support
- AI-powered ingredient detection via backend

### Recipe Recommendations
- Ingredient-based matching algorithm
- Dietary preference filtering
- Match score calculation
- Sorting options (match, rating, time, difficulty)

### User Preferences
- Multiple dietary preference selection
- Allergy management
- Disliked ingredients tracking
- Preference-based filtering

### Favorites System
- Save/unsave recipes
- Personal recipe collection
- Quick access from dashboard

## 🐛 Known Issues

- None at the moment

## 🔮 Future Improvements

- [ ] Social sharing features
- [ ] Meal planning calendar
- [ ] Grocery list generation
- [ ] Recipe comments and community features
- [ ] Advanced search filters
- [ ] Cooking timers and notifications
- [ ] Video recipe tutorials
- [ ] Print-friendly recipe views
- [ ] Recipe import from URLs
- [ ] Ingredient quantity adjustment

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email tiwaridhruv4146@gmail.com or open an issue in the repository.

---

Built with ❤️ using React, TypeScript, and AI
