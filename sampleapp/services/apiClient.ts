// Generic API client utilities for Phase 3 integrations
import { APIConfig, APIResponse } from "../types/api";

export class APIClient {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  async makeRequest<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<APIResponse<T>> {
    if (!this.config.enabled) {
      return {
        success: false,
        error: `${this.config.name} API is disabled`,
      };
    }

    const { method = "GET", body, headers = {}, timeout = this.config.timeout || 10000 } = options;

    const url = `${this.config.baseUrl}/${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      defaultHeaders["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
    };
    console.log("🚀 ~ APIClient ~ makeRequest ~ requestOptions:", requestOptions);

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      console.log("🚀 ~ APIClient ~ makeRequest ~ timeoutId:", timeoutId);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });
      console.log("🚀 ~ APIClient ~ makeRequest ~ response:", response);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

        // Add more specific error messages for common status codes
        if (response.status === 401) {
          errorMessage += " - Invalid API key";
        } else if (response.status === 403) {
          errorMessage += " - API key doesn't have permission or billing issue";
        } else if (response.status === 429) {
          errorMessage += " - Rate limit exceeded";
        } else if (response.status === 500) {
          errorMessage += " - OpenAI server error";
        }

        errorMessage += `. ${errorText}`;

        return {
          success: false,
          error: errorMessage,
          metadata: {
            source: this.config.name,
            timestamp: new Date(),
          },
        };
      }

      const data = await response.json();

      return {
        success: true,
        data,
        metadata: {
          source: this.config.name,
          timestamp: new Date(),
          rateLimit: this.extractRateLimit(response),
        },
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: `Request timeout after ${timeout}ms`,
          metadata: {
            source: this.config.name,
            timestamp: new Date(),
          },
        };
      }

      return {
        success: false,
        error: error.message || "Network error occurred",
        metadata: {
          source: this.config.name,
          timestamp: new Date(),
        },
      };
    }
  }

  private extractRateLimit(response: Response) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");

    if (remaining || reset) {
      return {
        remaining: remaining ? parseInt(remaining) : undefined,
        reset: reset ? new Date(parseInt(reset) * 1000) : undefined,
      };
    }

    return undefined;
  }

  async retryableRequest<T>(endpoint: string, options: Parameters<APIClient["makeRequest"]>[1] = {}, maxRetries: number = this.config.retryAttempts || 3): Promise<APIResponse<T>> {
    let lastError: APIResponse<T> | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.makeRequest<T>(endpoint, options);

      if (result.success) {
        return result;
      }

      lastError = result;

      // Don't retry on certain errors
      if (result.error?.includes("401") || result.error?.includes("403")) {
        break;
      }

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return (
      lastError || {
        success: false,
        error: "Max retries exceeded",
      }
    );
  }

  updateConfig(updates: Partial<APIConfig>) {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): APIConfig {
    return { ...this.config };
  }
}
