import { ILlmDriver, LlmCallOptions, StreamChunk } from "types";

async function* googleStreamResponse(
  apiKey: string,
  model: string,
  options: LlmCallOptions,
  externalFunctions: Record<
    string,
    (args: Record<string, unknown>) => Promise<unknown>
  > = {}
): AsyncGenerator<StreamChunk> {
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const payload = {
    contents: (options.messages || []).map((m) => ({
      role:
        m.role === "system"
          ? "system"
          : m.role === "assistant"
          ? "model"
          : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: options.temperature ?? 0,
      maxOutputTokens: options.maxTokens ?? 200,
    },
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    yield { error: `Google error: ${err}` };
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
        const jsonStr = line.replace("data: ", "").trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(jsonStr);

          // Если модель вернула functionCall
          if (parsed.functionCall) {
            const { name, arguments: args } = parsed.functionCall;

            if (externalFunctions[name]) {
              // Парсим аргументы как Record<string, unknown>
              const parsedArgs = JSON.parse(args) as Record<string, unknown>;
              const result = await externalFunctions[name](parsedArgs);
              yield { functionResponse: { name, result } };
            } else {
              yield { error: `Function "${name}" not found.` };
            }
            continue;
          }

          // Метаданные usage
          if (parsed.usageMetadata) {
            yield {
              usage: {
                prompt_tokens: parsed.usageMetadata.promptTokenCount ?? 0,
                completion_tokens:
                  parsed.usageMetadata.candidatesTokenCount ?? 0,
              },
            };
          }

          // Текстовая часть ответа
          if (parsed.candidates?.length) {
            const text = parsed.candidates[0].content.parts
              ?.map((p: { text: string }) => p.text)
              .join("");
            if (text) {
              yield { text };
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

export class GoogleDriver implements ILlmDriver {
  private externalFunctions: Record<
    string,
    (args: Record<string, unknown>) => Promise<unknown>
  >;

  constructor(
    private apiKey: string,
    private model: string,
    externalFunctions: Record<
      string,
      (args: Record<string, unknown>) => Promise<unknown>
    > = {}
  ) {
    this.externalFunctions = externalFunctions;
  }

  public async *stream(options: LlmCallOptions): AsyncGenerator<StreamChunk> {
    yield* googleStreamResponse(
      this.apiKey,
      this.model,
      options,
      this.externalFunctions
    );
  }
}
