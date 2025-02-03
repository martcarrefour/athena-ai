import { ILlmDriver, LlmCallOptions, StreamChunk } from "types";

interface OpenAiRequestParams {
  model?: string;
  prompt?: string;
  messages?: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream: boolean;
}

interface OpenAiUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenAiChoice {
  text?: string;
  delta?: {
    content?: string;
  };
}

interface OpenAiResponseChunk {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  usage?: OpenAiUsage;
  choices?: OpenAiChoice[];
}

async function* openaiStreamResponse(
  apiKey: string,
  baseUrl: string,
  options: LlmCallOptions
): AsyncGenerator<StreamChunk> {
  const isCompletion = !!options.prompt;

  // Формируем тело запроса к OpenAI
  const jsonData: OpenAiRequestParams = isCompletion
    ? {
        model: baseUrl ? undefined : "text-davinci-003",
        prompt: options.prompt,
        temperature: options.temperature ?? 0,
        max_tokens: options.maxTokens ?? 200,
        top_p: options.topP ?? 1.0,
        frequency_penalty: options.frequencyPenalty ?? 0,
        presence_penalty: options.presencePenalty ?? 0,
        stop: options.stop,
        stream: true,
      }
    : {
        model: baseUrl ? undefined : "gpt-3.5-turbo",
        messages: options.messages || [],
        temperature: options.temperature ?? 0,
        max_tokens: options.maxTokens ?? 200,
        top_p: options.topP ?? 1.0,
        frequency_penalty: options.frequencyPenalty ?? 0,
        presence_penalty: options.presencePenalty ?? 0,
        stop: options.stop,
        stream: true,
      };

  // Определяем конечную точку
  let endpoint = isCompletion
    ? "https://api.openai.com/v1/completions"
    : "https://api.openai.com/v1/chat/completions";

  if (baseUrl) {
    endpoint = baseUrl;
  }

  // Выполняем запрос
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(jsonData),
  });

  // Проверяем успешность ответа
  if (!response.ok) {
    const errText = await response.text();
    yield { error: `OpenAI error: ${errText}` };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  // Читаем поток
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Завершающий маркер потока
      if (trimmed.startsWith("data: [DONE]")) {
        return;
      }

      // Обрабатываем только строки с данными
      if (trimmed.startsWith("data:")) {
        const jsonStr = trimmed.replace("data:", "").trim();
        if (!jsonStr) continue;

        try {
          // Парсим ответ как OpenAiResponseChunk
          const parsed = JSON.parse(jsonStr) as OpenAiResponseChunk;

          // usage
          if (parsed.usage) {
            yield { usage: parsed.usage };
          }

          // choices
          const choice = parsed.choices?.[0];
          if (choice) {
            if (typeof choice.text === "string") {
              // Сценарий completion
              yield { text: choice.text };
            } else if (choice.delta?.content) {
              // Сценарий chat
              yield { text: choice.delta.content };
            }
          }
        } catch (err) {
          yield {
            error: `JSON parse error: ${
              err instanceof Error ? err.message : String(err)
            }`,
          };
        }
      }
    }
  }
}
export class OpenAiDriver implements ILlmDriver {
  constructor(private apiKey: string, private baseUrl: string = "") {}

  public async *stream(options: LlmCallOptions): AsyncGenerator<StreamChunk> {
    yield* openaiStreamResponse(this.apiKey, this.baseUrl, options);
  }
}
