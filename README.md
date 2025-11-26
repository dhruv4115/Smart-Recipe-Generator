# 🍳 RecipeAI – Smart Recipe Generator

RecipeAI is a full-stack web application that recommends and **generates** recipes based on user ingredients, dietary preferences, and cooking constraints. It combines a modular **NestJS + MongoDB** backend with a **React + Vite + TypeScript** frontend and multiple AI services (vision, LLM, embeddings).

---

## ✨ Key Features

- **User Auth & Profiles**
  - JWT-based authentication (register, login, `/auth/me`)
  - User preferences: dietary tags, allergies, disliked ingredients
  - Favorites & ratings for recipes

- **Ingredient Detection from Images**
  - Upload 1..N images
  - Vision API extracts ingredient names
  - Normalized, deduplicated ingredient list returned

- **Recipe Recommendation**
  - `POST /recipes/recommend` combines:
    - Ingredient overlap
    - Semantic similarity (embeddings)
    - Popularity score (ratings, favorites)
  - Filters by difficulty, cuisine, max time, servings

- **AI Recipe Generation**
  - `POST /recipes/generate` uses an LLM to create **brand-new recipes**:
    - Title, ingredients, steps, cuisine, difficulty
    - Nutrition estimates (calories, protein, carbs, fat)
  - Auto-assigns a relevant food image using Unsplash-based URLs

- **Rich Frontend Experience**
  - Ingredient upload + detection flow
  - Browse, search, and filter recipes
  - Recommendation page with match scores
  - Detailed recipe view with nutrition
  - Favorites and preferences management

---

## 🧱 Tech Stack

**Backend**

- Node.js, **NestJS**, TypeScript
- MongoDB with **Mongoose**
- JWT auth, bcrypt
- Axios for external APIs
- class-validator / class-transformer
- Swagger/OpenAPI
- Helmet, CORS, rate limiting

**Frontend**

- **React** + **Vite** + TypeScript
- React Router
- Zustand for auth & ingredient state
- React Query (@tanstack/react-query) for data fetching
- Axios instance with interceptors
- shadcn/ui + TailwindCSS
- react-hot-toast

---

## 📂 Monorepo Structure

```bash
.
├── backend/        # NestJS API
└── frontend/       # React + Vite app
```

## ⚙️ Backend Setup (NestJS)
### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Environment variables

Create backend/.env from this example:
```bash
cp .env.example .env
```

backend/.env.example:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/recipe-ai

# Auth
JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=1h

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Vision API (ingredient recognition)
VISION_API_KEY=your_vision_api_key
VISION_API_URL=https://your-vision-api-endpoint

# Embeddings API
EMBEDDING_API_KEY=your_embeddings_key
EMBEDDING_API_URL=https://your-embeddings-endpoint

# LLM API (nutrition + substitutions + recipe generation)
LLM_API_KEY=your_llm_key
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
```

Update with your real credentials.

### 3. Run the backend
```bash
npm run start:dev
# API available at http://localhost:3000
```

### 4. Seed the database
```bash
npm run seed          # Inserts ~20 sample recipes
npm run backfill:images  # (optional) Adds imageUrl to existing recipes
```

### 5. Useful scripts
```bash
npm run start:dev     # Development
npm run build         # Build for production
npm run start:prod    # Run built app
npm run seed          # Seed sample recipes
npm run backfill:images  # Add image URLs to existing recipes
npm test              # Basic tests
```

## ⚙️ Frontend Setup (React + Vite)
### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Environment variables

Create frontend/.env.local:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Run the frontend
```bash
npm run dev
# App at http://localhost:5173
```

## 🔗 Core API Endpoints (Backend)

 **Auth**

 - POST /auth/register – { name, email, password }

 - POST /auth/login – { email, password } → { accessToken, user }

 - GET /auth/me – current user (requires Authorization: Bearer <token>)

**Users**

 - GET /users/me/preferences

 - PUT /users/me/preferences

 - GET /users/me/favorites

**Ingredients & AI Vision**

 - POST /ingredients/from-images

   multipart/form-data with images fields

   Response: { detectedIngredients: string[] }

**Recipes**

- GET /recipes – paginated + filters (page, limit, difficulty, maxTime, cuisine, diet, search)

- GET /recipes/:id

- POST /recipes – create recipe (admin / future use)

- POST /recipes/recommend
```json
{ ingredients, dietaryPreferences?, maxCookingTimeMinutes?, difficulty?, servings? }
```

- POST /recipes/:id/rate – { rating, comment? }

- POST /recipes/:id/favorite – toggle favorite

- GET /recipes/generate
```json
{ ingredients, dietaryPreferences?, servings? }
```

Returns AI-generated recipe with nutrition + imageUrl

**AI Utilities**

- Nutrition estimation and substitution suggestions are used internally in recipe creation and AI flows.

## 🧪 Example Requests
### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 2. Recommend recipes from ingredients
```bash
curl -X POST http://localhost:3000/recipes/recommend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "ingredients": ["tomato", "onion", "garlic"],
    "dietaryPreferences": ["vegetarian"],
    "maxCookingTimeMinutes": 30,
    "difficulty": "easy",
    "servings": 2
  }'
  ```

### 3. Generate a brand-new AI recipe
```bash
curl -X POST http://localhost:3000/recipes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "ingredients": ["tomato", "basil", "pasta"],
    "dietaryPreferences": ["vegetarian"],
    "servings": 2
  }'
```


## 🧑‍💻 Development Notes

- All APIs return structured error responses: { message, code, details? }.

- Axios interceptors in the frontend auto-attach JWTs and handle 401/429/500 with toasts.

- Favorites are handled via POST /recipes/:id/favorite plus GET /users/me/favorites.

- Recipe images are pulled from Unsplash based on recipe title/cuisine through dynamic URLs, so you don’t need to manage image uploads.

## 📜 License

This project is for educational / assignment purposes.
