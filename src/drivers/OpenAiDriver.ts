import { ILlmDriver, LlmCallOptions, StreamChunk } from "./ILlmDriver";

async function* openaiStreamResponse(
  apiKey: string,
  baseUrl: string,
  options: LlmCallOptions
): AsyncGenerator<StreamChunk> {
  const isCompletion = !!options.prompt;
  const jsonData: Record<string, any> = isCompletion
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

  let endpoint = isCompletion
    ? "https://api.openai.com/v1/completions"
    : "https://api.openai.com/v1/chat/completions";

  if (baseUrl) {
    endpoint = baseUrl;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(jsonData),
  });

  if (!response.ok) {
    const errText = await response.text();
    yield { error: `OpenAI error: ${errText}` };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim().startsWith("data: [DONE]")) {
        return;
      }
      if (line.trim().startsWith("data:")) {
        const jsonStr = line.replace("data:", "").trim();
        if (!jsonStr) continue;
        try {
          const parsed = JSON.parse(jsonStr);

          if (parsed.usage) {
            yield { usage: parsed.usage };
          }

          const choice = parsed?.choices?.[0];
          if (choice) {
            if ("text" in choice) {
              yield { text: choice.text };
            } else if (choice.delta?.content) {
              yield { text: choice.delta.content };
            }
          }
        } catch (err) {
          yield { error: `JSON parse error: ${line}` };
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
