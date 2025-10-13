// Model availability checker for OpenAI
import { openaiService } from "../services/openai";

export const checkModelAvailability = async () => {
  console.log("🔍 Checking OpenAI Model Availability:");

  const modelsToCheck = ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4o", "gpt-4"];

  const results: { [key: string]: boolean } = {};

  for (const model of modelsToCheck) {
    try {
      console.log(`  - Testing ${model}...`);
      const response = await openaiService.testConnection();
      results[model] = response.success;
      console.log(`    ${response.success ? "✅" : "❌"} ${model}: ${response.success ? "Available" : response.error}`);
    } catch (error: any) {
      results[model] = false;
      console.log(`    ❌ ${model}: ${error.message}`);
    }
  }

  const availableModels = Object.entries(results)
    .filter(([_, available]) => available)
    .map(([model, _]) => model);

  console.log(`\n📊 Summary:`);
  console.log(`  - Available models: ${availableModels.length > 0 ? availableModels.join(", ") : "None"}`);
  console.log(`  - Recommended: ${availableModels.includes("gpt-4o-mini") ? "gpt-4o-mini (best value)" : availableModels[0] || "None available"}`);

  return {
    results,
    availableModels,
    recommended: availableModels.includes("gpt-4o-mini") ? "gpt-4o-mini" : availableModels[0] || null,
  };
};
