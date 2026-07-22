import OpenAI from "openai";

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;

if (!baseURL) {
  throw new Error(
    "AI_INTEGRATIONS_OPENAI_BASE_URL must be set. Did you forget to provision the OpenAI AI integration?",
  );
}

if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY (or AI_INTEGRATIONS_OPENAI_API_KEY) must be set.",
  );
}

export const openai = new OpenAI({
  apiKey,
  baseURL,
});
