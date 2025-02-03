import { OpenAiDriver, AnthropicDriver, GoogleDriver } from "./drivers";
import {
  ILlmDriver,
  Message,
  AthenaConfig,
  LlmCallOptions,
  StreamChunk,
  LLMRequestOptions,
  LLMResponse,
} from "./types";
import { parseMarkdownToJson } from "./utils";

export class Athena {
  private driver: ILlmDriver;
  private context: Message[] = [];
  private externalFunctions: Record<
    string,
    (args: Record<string, unknown>) => Promise<unknown>
  >;

  constructor(private config: AthenaConfig) {
    this.driver = this.initializeDriver(config);
    this.externalFunctions = config.functions || {};
  }

  private initializeDriver(config: AthenaConfig): ILlmDriver {
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
    for await (const chunk of this.driver.stream(options)) {
      if (chunk.functionCall) {
        const { name, arguments: args } = chunk.functionCall;

        if (this.externalFunctions[name]) {
          const result = await this.externalFunctions[name](args);
          yield { functionResponse: { name, result } };
        } else {
          yield { error: `Function "${name}" not found.` };
        }
      } else {
        yield chunk;
      }
    }
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

  public async createMessage(options: LLMRequestOptions): Promise<LLMResponse> {
    const messages = this.prepareMessages(options);

    const rawResponse = await this.call({
      messages,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 200,
    });

    const processedContent = this.processResponse(rawResponse, options);

    return {
      content:
        typeof processedContent === "string"
          ? processedContent
          : JSON.stringify(processedContent, null, 2),
      raw: rawResponse,
    };
  }

  private prepareMessages(options: LLMRequestOptions): Message[] {
    const messages = [...this.context];

    if (options.format === "json" && options.example) {
      const exampleString = JSON.stringify(options.example, null, 2);
      messages.push({
        role: "user",
        content: `Please respond in JSON format, strictly following this structure:\n\n${exampleString}`,
      });
    }

    messages.push(...options.messages);

    return messages;
  }

  private processResponse(
    rawResponse: string,
    options: LLMRequestOptions
  ): string | Record<string, unknown> {
    switch (options.format) {
      case "text":
        return rawResponse;

      case "json": {
        let parsedContent: unknown = rawResponse;

        try {
          parsedContent = JSON.parse(rawResponse) as Record<string, unknown>;
        } catch {
          parsedContent = parseMarkdownToJson(rawResponse);
        }

        if (
          options.example &&
          typeof parsedContent === "object" &&
          parsedContent !== null
        ) {
          parsedContent = this.filterJsonByExample(
            parsedContent as Record<string, unknown>,
            options.example
          );
        }

        return parsedContent as Record<string, unknown>;
      }

      case "function":
        return { functionCall: rawResponse };

      default:
        return rawResponse;
    }
  }

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
