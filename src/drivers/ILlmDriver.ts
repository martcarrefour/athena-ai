// src/AthenaORM/drivers/ILlmDriver.ts

// Общий интерфейс ответа на токены usage, текст, ошибки и т.д.
export interface StreamChunk {
  text?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  error?: string;
}

// Интерфейс для параметров вызова
export interface LlmCallOptions {
  messages?: { role: string; content: string }[]; // классический формат
  prompt?: string; // если нужен prompt
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface ILlmDriver {
  // Метод возвращает асинхронный генератор, который выдаёт куски ответа (текст/usage/ошибки)
  stream(options: LlmCallOptions): AsyncGenerator<StreamChunk>;
}
