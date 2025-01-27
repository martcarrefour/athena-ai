export interface AthenaConfig {
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  baseUrl?: string; // для OpenAI (опц.)
  model?: string; // для Google
  // ... любые другие поля
}

// src/types.ts
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMRequestOptions {
  messages: Message[]; // Основные сообщения
  format?: "json" | "text"; // Формат ответа
  example?: Record<string, unknown>; // Пример JSON для нейросети
  temperature?: number; // Настройка температуры
  maxTokens?: number; // Максимальное количество токенов
}

export interface LLMResponse {
  content: string;
  raw?: unknown;
}
