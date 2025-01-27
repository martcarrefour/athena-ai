// src/config/llm.config.ts
import { AthenaConfig } from "@/types";

export const myLlmConfig: AthenaConfig = {
  provider: "openai",
  apiKey: "sk-XXXXX",
  baseUrl: "", // при необходимости
  // model: "gpt-4" и т.д.
};
