// API Configuration for Phase 3 - AI Integration & Nutritional Enhancement

// Debug logs removed - configuration is working correctly

// OpenAI Configuration
export const OPENAI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "",
  baseUrl: "https://api.openai.com/v1",
  defaultModel: "gpt-4o-mini", // Best value for recipe generation
  timeout: 30000,
  retryAttempts: 2,

  // Available models for recipe generation
  models: {
    creative: "gpt-4o", // Most creative
    balanced: "gpt-4o-mini", // Best value
    fast: "gpt-4o-mini", // Fast and efficient
  },

  // Model-specific settings
  modelSettings: {
    "gpt-4o": {
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
    },
    "gpt-4o-mini": {
      maxTokens: 1500,
      temperature: 0.7,
      topP: 0.9,
    },
    "gpt-3.5-turbo": {
      maxTokens: 1500,
      temperature: 0.7,
      topP: 0.9,
    },
  },
};

// Hugging Face Configuration (deprecated - keeping for fallback)
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

// Feature flags
export const FEATURES = {
  aiGeneration: !!OPENAI_CONFIG.apiKey,
  huggingFaceFallback: !!HUGGINGFACE_CONFIG.apiKey,

  // Fallback options
  useLocalGenerationFallback: true,

  // Development options
  debugMode: __DEV__,
  logAPIRequests: __DEV__,
};

// API Status checker
export const getAPIStatus = () => ({
  openai: {
    configured: FEATURES.aiGeneration,
    status: FEATURES.aiGeneration ? "ready" : "not configured",
  },
  huggingface: {
    configured: FEATURES.huggingFaceFallback,
    status: FEATURES.huggingFaceFallback ? "ready (fallback)" : "not configured",
  },
});
