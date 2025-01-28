export interface StreamChunk {
  text?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  error?: string;
  functionCall?: {
    name: string;
    arguments: Record<string, unknown>;
  };
  functionResponse?: {
    name: string;
    result: unknown;
  };
}

export interface LlmCallOptions {
  messages?: { role: string; content: string }[];
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface ILlmDriver {
  stream(options: LlmCallOptions): AsyncGenerator<StreamChunk>;
  callFunction?(name: string, args: Record<string, unknown>): Promise<unknown>;
}
