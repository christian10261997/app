// API response interfaces for Phase 3 integrations

// Generic API response structure
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    source?: string;
    timestamp?: Date;
    requestId?: string;
    rateLimit?: {
      remaining?: number;
      reset?: Date;
    };
  };
}

// Hugging Face API interfaces
export interface HuggingFaceRequest {
  inputs: string;
  parameters?: {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    do_sample?: boolean;
    return_full_text?: boolean;
  };
  options?: {
    wait_for_model?: boolean;
    use_cache?: boolean;
  };
}

export interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
  estimated_time?: number;
}

// AI Recipe Generation specific interfaces
export interface AIRecipeRequest {
  ingredients: string[];
  preferences?: {
    cuisine?: string;
    category?: string;
    difficulty?: string;
    maxPrepTime?: number;
    servings?: number;
    dietary?: string[];
  };
  context?: {
    useFilipinoBias?: boolean;
    creativityLevel?: "conservative" | "balanced" | "creative";
    fusionAllowed?: boolean;
  };
}

export interface AIRecipeResponse {
  success: boolean;
  recipe?: {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    cuisine: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    confidence?: number; // 0-1 score for recipe quality
    source: "ai" | "hybrid" | "local";
  };
  error?: string;
  fallbackUsed?: boolean;
  apiMetadata?: {
    model?: string;
    processingTime?: number;
    tokensUsed?: number;
  };
}

// Rate limiting and quota management
export interface APIQuota {
  daily?: {
    used: number;
    limit: number;
    resetTime: Date;
  };
  monthly?: {
    used: number;
    limit: number;
    resetTime: Date;
  };
}

export interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
  quota?: APIQuota;
  enabled: boolean;
}
