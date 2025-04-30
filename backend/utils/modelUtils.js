const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize the AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to try multiple models with fallback
async function generateWithModelFallback(input) {
  const modelOptions = [
    "gemini-2.0-flash",
    "gemini-2.5-flash-preview-04-17",
    "gemini-2.5-pro-preview-03-25",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b",
    "gemma-3-1b-it",
    "gemma-3-4b-it",
    "gemma-3-12b-it",
    "gemma-3-27b-it",
    "gemma-2-2b-it",
    "gemma-2-9b-it",
    "gemma-2-27b-it"
  ];
  
  let lastError = null;
  
  for (const modelName of modelOptions) {
    try {
      const currentModel = genAI.getGenerativeModel({ model: modelName });
      const result = await currentModel.generateContent(input);
      if (process.env.NODE_ENV !== "production") {
        console.log(`Model ${modelName} succeeded`);
      }
      return result;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`Error with model ${modelName}:`, error?.message || error);
      }
      lastError = error;
      // Continue to next model
    }
  }
  
  // If we get here, all models failed
  throw lastError;
}

module.exports = {
  generateWithModelFallback
}; 