import {
  AthenaConfig,
  Message,
  LLMRequestOptions,
  LLMResponse,
  ILlmDriver,
  LlmCallOptions,
  StreamChunk,
} from "@/types";
import { parseMarkdownToJson } from "@/utils";
import { GoogleDriver, AnthropicDriver, OpenAiDriver } from "@/drivers";

export class Athena {
  private driver: ILlmDriver;
  private context: Message[] = [];

  constructor(private config: AthenaConfig) {
    this.driver = this.selectDriver(config);
  }

  private selectDriver(config: AthenaConfig): ILlmDriver {
    switch (config.provider) {
      case "openai":
        return new OpenAiDriver(config.apiKey, config.baseUrl || "");
      case "anthropic":
        return new AnthropicDriver(config.apiKey);
      case "google":
        return new GoogleDriver(
          config.apiKey,
          config.model || "models/chat-bison-001"
        );
      default:
        throw new Error(`Unknown LLM provider: ${config.provider}`);
    }
  }

  public async *run(options: LlmCallOptions): AsyncGenerator<StreamChunk> {
    yield* this.driver.stream(options);
  }

  public async call(options: LlmCallOptions): Promise<string> {
    let result = "";
    for await (const chunk of this.run(options)) {
      if (chunk.text) {
        result += chunk.text;
      }
      if (chunk.error) {
        throw new Error(chunk.error);
      }
    }
    return result;
  }

  public addToContext(messages: Message[]): void {
    this.context.push(...messages);
  }

  public clearContext(): void {
    this.context = [];
  }

  public getContext(): Message[] {
    return this.context;
  }

  /**
   * Создание нового запроса с учётом контекста.
   * Учитывает формат ответа (текст или JSON).
   */
  public async createMessage(options: LLMRequestOptions): Promise<LLMResponse> {
    const messages = [...this.context];

    if (options.format === "json" && options.example) {
      const exampleString = JSON.stringify(options.example, null, 2);
      messages.push({
        role: "user",
        content: `Please respond in JSON format, strictly following this structure:\n\n${exampleString}`,
      });
    }

    messages.push(...options.messages);

    const rawResponse = await this.call({
      messages,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 200,
    });

    let content: string | Record<string, unknown> = rawResponse;
    if (options.format === "json") {
      try {
        content = JSON.parse(rawResponse);
      } catch (error) {
        content = parseMarkdownToJson(rawResponse);
      }

      if (options.example) {
        content = this.filterJsonByExample(
          content as Record<string, unknown>,
          options.example
        );
      }
    }

    return {
      content:
        typeof content === "string"
          ? content
          : JSON.stringify(content, null, 2),
      raw: rawResponse,
    };
  }

  /**
   * Фильтрует JSON, чтобы оставить только поля, указанные в примере.
   */
  private filterJsonByExample(
    data: Record<string, unknown>,
    example: Record<string, unknown>
  ): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const key in example) {
      if (key in data) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }
}
