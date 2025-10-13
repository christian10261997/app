// OpenAI API Debug Utility using official SDK
import { openaiService } from "../services/openai";

export const debugOpenAI = async () => {
  console.log("🔍 OpenAI Debug Information (Official SDK):");
  console.log("  - Service configured:", openaiService.isConfigured());
  console.log("  - API Key length:", process.env.EXPO_PUBLIC_OPENAI_API_KEY?.length || 0);
  console.log("  - API Key format valid:", process.env.EXPO_PUBLIC_OPENAI_API_KEY?.startsWith("sk-") || false);

  if (openaiService.isConfigured()) {
    console.log("  - Testing API connection with official SDK...");
    try {
      const testResult = await openaiService.testConnection();
      console.log("  - Connection test result:", testResult);
    } catch (error) {
      console.log("  - Connection test error:", error);
    }
  }

  return {
    configured: openaiService.isConfigured(),
    keyLength: process.env.EXPO_PUBLIC_OPENAI_API_KEY?.length || 0,
    validFormat: process.env.EXPO_PUBLIC_OPENAI_API_KEY?.startsWith("sk-") || false,
  };
};
