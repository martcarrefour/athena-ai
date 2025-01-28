import { ILlmDriver, LlmCallOptions, StreamChunk } from "@/types";

async function* anthropicStreamResponse(
  apiKey: string,
  options: LlmCallOptions
): AsyncGenerator<StreamChunk> {
  const jsonBody = {
    model: "claude-2",
    stream: true,
    messages: options.messages || [],
    max_tokens_to_sample: options.maxTokens ?? 200,
    temperature: options.temperature ?? 0,
    top_p: options.topP ?? 1.0,
  };

  const response = await fetch("https://api.anthropic.com/v1/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(jsonBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    yield { error: `Anthropic error: ${errText}` };
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
      if (line.startsWith("data: ")) {
        const jsonStr = line.replace("data:", "").trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);

          if (parsed.stop_reason === "max_tokens") {
            // ...
          }

          if (
            parsed?.metadata?.input_tokens ||
            parsed?.metadata?.output_tokens
          ) {
            yield {
              usage: {
                prompt_tokens: parsed.metadata.input_tokens || 0,
                completion_tokens: parsed.metadata.output_tokens || 0,
              },
            };
          }

          if (parsed.completion) {
            yield { text: parsed.completion };
          }
        } catch (err) {
          yield { error: `JSON parse error: ${line}` };
        }
      }
    }
  }
}

export class AnthropicDriver implements ILlmDriver {
  constructor(private apiKey: string) {}

  public async *stream(options: LlmCallOptions): AsyncGenerator<StreamChunk> {
    yield* anthropicStreamResponse(this.apiKey, options);
  }
}
