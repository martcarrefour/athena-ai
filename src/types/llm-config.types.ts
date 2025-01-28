export interface AthenaConfig {
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMRequestOptions {
  messages: Message[];
  format?: "json" | "text";
  example?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  raw?: unknown;
}
