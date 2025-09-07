// API Configuration for Phase 3 - AI Integration & Nutritional Enhancement

// Hugging Face Configuration
export const HUGGINGFACE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY || "",
  baseUrl: "https://api-inference.huggingface.co/models/",
  defaultModel: "microsoft/DialoGPT-medium",
  timeout: 30000,
  retryAttempts: 2,

  // Free tier limits
  monthlyCharacterLimit: 30000,

  // Available models for recipe generation
  models: {
    creative: "gpt2",
    balanced: "microsoft/DialoGPT-medium",
    fast: "distilgpt2",
  },
};

// No nutrition APIs needed - focusing on AI generation only

// Feature flags
export const FEATURES = {
  aiGeneration: !!HUGGINGFACE_CONFIG.apiKey,

  // Fallback options
  useLocalGenerationFallback: true,

  // Development options
  debugMode: __DEV__,
  logAPIRequests: __DEV__,
};

// API Status checker
export const getAPIStatus = () => ({
  huggingface: {
    configured: FEATURES.aiGeneration,
    status: FEATURES.aiGeneration ? "ready" : "not configured",
  },
});
