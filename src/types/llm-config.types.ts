export interface AthenaConfig {
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  baseUrl?: string;
  model?: string;
  functions?: Record<
    string,
    (args: Record<string, unknown>) => Promise<unknown>
  >;
  temperature?: number;
  maxTokens?: number;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMRequestOptions {
  messages: Message[];
  format: "json" | "text" | "function";
  example?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  raw?: unknown;
}
