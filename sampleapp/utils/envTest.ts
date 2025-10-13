// Utility to test environment variable loading
export const testEnvironmentVariables = () => {
  console.log("🧪 Environment Variables Test:");
  console.log("  - EXPO_PUBLIC_OPENAI_API_KEY exists:", !!process.env.EXPO_PUBLIC_OPENAI_API_KEY);
  console.log("  - EXPO_PUBLIC_OPENAI_API_KEY length:", process.env.EXPO_PUBLIC_OPENAI_API_KEY?.length || 0);
  console.log("  - EXPO_PUBLIC_OPENAI_API_KEY starts with 'sk-':", process.env.EXPO_PUBLIC_OPENAI_API_KEY?.startsWith("sk-") || false);
  console.log(
    "  - All env keys containing 'OPENAI':",
    Object.keys(process.env).filter((key) => key.includes("OPENAI"))
  );

  return {
    hasOpenAIKey: !!process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    keyLength: process.env.EXPO_PUBLIC_OPENAI_API_KEY?.length || 0,
    isValidFormat: process.env.EXPO_PUBLIC_OPENAI_API_KEY?.startsWith("sk-") || false,
  };
};
