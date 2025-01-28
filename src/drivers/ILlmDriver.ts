export interface StreamChunk {
  text?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  error?: string;
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
}
