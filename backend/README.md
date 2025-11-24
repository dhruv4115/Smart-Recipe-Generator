# Smart Recipe Generator – Backend (NestJS + MongoDB)

This is the backend API for **Smart Recipe Generator** – an app that suggests recipes based on:

- Ingredients detected from photos
- User preferences (diet, allergies, disliked ingredients)
- Semantic similarity between recipes and user ingredients
- AI-powered nutrition and substitution suggestions

The backend is built with:

- **NestJS** (TypeScript)
- **MongoDB** (Mongoose)
- **JWT Auth**
- **Multer** for file uploads
- **Axios + external AI APIs** (vision, embeddings, LLM)
- **Swagger / OpenAPI** docs

---

## Folder Structure

From `/project-root`:

```text
project-root/
  ├── backend/
  │   ├── src/
  │   │   ├── app.module.ts
  │   │   ├── main.ts
  │   │   ├── config/
  │   │   │   └── configuration.ts
  │   │   ├── database/
  │   │   │   └── database.module.ts
  │   │   ├── common/
  │   │   │   ├── filters/http-exception.filter.ts
  │   │   │   ├── pipes/validation.pipe.ts
  │   │   │   └── utils/ingredients-normalizer.ts
  │   │   ├── auth/
  │   │   │   ├── auth.module.ts
  │   │   │   ├── auth.service.ts
  │   │   │   ├── auth.controller.ts
  │   │   │   ├── dto/
  │   │   │   │   ├── login.dto.ts
  │   │   │   │   └── register.dto.ts
  │   │   │   ├── guards/jwt-auth.guard.ts
  │   │   │   └── strategies/jwt.strategy.ts
  │   │   ├── users/
  │   │   │   ├── users.module.ts
  │   │   │   ├── users.service.ts
  │   │   │   ├── users.controller.ts
  │   │   │   ├── dto/update-preferences.dto.ts
  │   │   │   └── schemas/user.schema.ts
  │   │   ├── recipes/
  │   │   │   ├── recipes.module.ts
  │   │   │   ├── recipes.service.ts
  │   │   │   ├── recipes.controller.ts
  │   │   │   ├── dto/
  │   │   │   │   ├── create-recipe.dto.ts
  │   │   │   │   ├── query-recipes.dto.ts
  │   │   │   │   ├── recommend-recipes.dto.ts
  │   │   │   │   ├── rate-recipe.dto.ts
  │   │   │   │   └── substitution-request.dto.ts
  │   │   │   ├── schemas/
  │   │   │   │   ├── recipe.schema.ts
  │   │   │   │   └── rating.schema.ts
  │   │   │   └── utils/
  │   │   │       ├── recommendation-score.ts
  │   │   │       └── similarity.ts
  │   │   ├── ingredients/
  │   │   │   ├── ingredients.module.ts
  │   │   │   ├── ingredients.service.ts
  │   │   │   └── ingredients.controller.ts
  │   │   ├── ai/
  │   │   │   ├── ai.module.ts
  │   │   │   └── ai.service.ts
  │   │   └── seed/
  │   │       └── recipes.seed-data.ts
  │   ├── src/seed.ts
  │   ├── test/
  │   │   ├── recommendation-score.spec.ts
  │   │   └── ingredients-normalizer.spec.ts
  │   ├── .env.example
  │   ├── package.json
  │   └── tsconfig.json
  └── frontend/  (React app handled separately)
```

# Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

# Now fill in the following values inside .env:

```ini
# Server
PORT=3000
NODE_ENV=development

# Mongo
MONGODB_URI=mongodb://localhost:27017/smart_recipe_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Vision API (e.g. HuggingFace)
VISION_API_BASE_URL=https://api-inference.huggingface.co/models
VISION_API_KEY=your_hf_api_key
VISION_FOOD_MODEL_ID=your_food_model_id

# Embeddings API (e.g. OpenAI)
EMBEDDING_API_BASE_URL=https://api.openai.com/v1/embeddings
EMBEDDING_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-3-small

# LLM API (e.g. OpenAI)
LLM_API_BASE_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=your_openai_api_key
LLM_MODEL=gpt-4o-mini

# Uploads
MAX_UPLOAD_SIZE_MB=5
UPLOAD_TEMP_DIR=./uploads/tmp
```
# Installation & Local Development

## Go to the backend folder:

```bash
cd backend
```

## Install dependencies:
```bash
npm install
```


## Run the development server:
```bash
npm run start:dev
```

# API URLs

## Base URL: http://localhost:3000

## Swagger Docs: http://localhost:3000/docs

## Ensure MongoDB is running locally and your MONGODB_URI is correct.

# 🔥 API Endpoints Overview

All authenticated routes require:
```makefile
Authorization: Bearer <accessToken>
```

# 🔐 Auth Endpoints

## POST /auth/register

Registers a new user.
```json
Body:

{
  "name": "Dhruv",
  "email": "example@gmail.com",
  "password": "your_password"
}
```

## POST /auth/login

Logs in a user.
```json
Body:

{
  "email": "example@gmail.com",
  "password": "your_password"
}
```


Returns:
```json
{
  "accessToken": "...",
  "user": { "id": "...", "email": "..." }
}
```

## GET /auth/me (JWT)

Returns currently authenticated user.
```json
{
  "id": "...",
  "email": "..."
}
```

# 👤 User Preferences & Favorites
## GET /users/me/preferences (JWT)

Returns user’s dietary preferences, allergies, disliked ingredients.

## PUT /users/me/preferences (JWT)
```json
Body:

{
  "dietaryPreferences": ["vegetarian"],
  "allergies": ["peanut"],
  "dislikedIngredients": ["mushroom"]
}
```

## GET /users/me/favorites (JWT)

Returns a list of favorite recipes.

# 🧠 Ingredient Detection (Vision AI)
## POST /ingredients/from-images (JWT)

Extract ingredients from 1..N images.

multipart/form-data
Field name → images

Returns:
```json
{
  "detectedIngredients": ["tomato", "onion", "garlic"]
}
```

# 🍽️ Recipe Module
## GET /recipes

Filters + pagination.

Query Params:
```pgsql
page
limit
difficulty
maxTime
cuisine
diet
search
```

## GET /recipes/:id

Returns a single recipe by ID.

## POST /recipes (JWT)

Creates a recipe.

If nutrition is missing → auto-computed using AI (per serving).

## POST /recipes/recommend (JWT)

Recommend recipes based on ingredients + preferences.
```json
Body:

{
  "ingredients": ["tomato", "onion", "garlic"],
  "dietaryPreferences": ["vegetarian"],
  "maxCookingTimeMinutes": 30,
  "difficulty": "easy",
  "servings": 2
}
```

Returns example:
```json
[
  {
    "recipe": { ... },
    "scores": {
      "overlap": 0.8,
      "semantic": 0.9,
      "popularity": 0.6,
      "combined": 0.82
    },
    "explanation": "High overlap with your ingredients and vegetarian preference."
  }
]
```

## POST /recipes/:id/rate (JWT)
```json
Body:

{
  "rating": 5,
  "comment": "Loved it!"
}
```

Recomputes:

averageRating

ratingCount

## POST /recipes/:id/favorite (JWT)

Toggles favorite state.
```json
Returns:

{
  "isFavorite": true
}
``` 

## POST /recipes/:id/substitutions (JWT)

AI-based ingredient substitution.
```json
Body:

{
  "dietaryPreferences": ["vegan"],
  "allergies": ["peanut"]
}
```

Returns:
```json
{
  "recipeId": "...",
  "ingredients": ["..."],
  "dietaryPreferences": ["vegan"],
  "allergies": ["peanut"],
  "substitutions": [
    {
      "original": "butter",
      "suggested": "olive oil",
      "reason": "vegan"
    }
  ],
  "notes": "..."
}
```

# 🧠 Recommendation Algorithm (High-Level Overview)

The Smart Recipe Generator ranks recipes using a weighted combination of:

- **Ingredient Overlap**  
- **Semantic Similarity (Embeddings)**  
- **Popularity (Ratings)**  

For each candidate recipe, the following scores are computed:

---

## 1. Ingredient Overlap Score (0–1)

Computed using the **Jaccard Index**:

overlap = | intersection(userIngredients, recipeIngredients) |
-----------------------------------------------------
| union(userIngredients, recipeIngredients) |


Where both sets are **normalized** (lowercased, deduplicated).

A value of **1.0** means perfect overlap.

---

## 2. Semantic Similarity Score (0–1)

Captured using **cosine similarity** between:

- **Embedding of the user’s combined ingredient text**
- **Embedding vector stored on the recipe**

semantic = cosineSimilarity(userEmbedding, recipeEmbedding)


This enables matching even when ingredient words differ (e.g., "chili" vs "red pepper").

---

## 3. Popularity Score (0–1)

Based on recipe ratings:

popularity = averageRating / 5 (only if ratingCount > 0)
popularity = 0 (if the recipe has no ratings yet)


---

## 4. Final Combined Score

Each recipe receives a weighted aggregate score:

finalScore =
0.5 * ingredientOverlap +
0.3 * semanticSimilarity +
0.2 * popularityScore


The weights reflect:

- **50%** relevance by actual ingredient overlap  
- **30%** semantic closeness  
- **20%** crowd popularity  

---

## 5. Ranking & Results

Recipes are sorted in **descending order of finalScore**.  
Top **N results** (e.g., **10 recipes**) are returned in the API response.

---

# 🚀 Deployment Notes (Basic Guide)

This section outlines how to deploy the Smart Recipe Generator backend to production, connect it to MongoDB Atlas, and prepare it for live hosting.

---

## 1. 📦 Build for Production

From `/project-root/backend`:

```bash
npm run build
npm run start:prod
```
This will:

Compile TypeScript → dist/

Start the production app using:
```bash
node dist/main.js
```
