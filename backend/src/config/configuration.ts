export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_recipe_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  uploads: {
    maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10),
    tempDir: process.env.UPLOAD_TEMP_DIR || './uploads/tmp',
  },

  vision: {
    baseUrl: process.env.VISION_API_BASE_URL,
    apiKey: process.env.VISION_API_KEY,
    modelId: process.env.VISION_FOOD_MODEL_ID,
  },

  embeddings: {
    baseUrl: process.env.EMBEDDING_API_BASE_URL,
    apiKey: process.env.EMBEDDING_API_KEY,
    model: process.env.EMBEDDING_MODEL,
  },

  llm: {
    baseUrl: process.env.LLM_API_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL,
  },
});
