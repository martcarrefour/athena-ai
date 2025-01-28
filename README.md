# AthenaORM: Unified LLM Interaction Framework

AthenaORM is a lightweight, developer-friendly ORM (Object-Relational Mapping)-inspired library designed specifically for interacting with Large Language Models (LLMs) like OpenAI, Anthropic, and Google PaLM. With its easy-to-use API, AthenaORM streamlines the process of making requests to different LLM providers, managing message context, and handling JSON and text-based responses effortlessly.

## Key Features:

- **Multi-provider support**: Integrates seamlessly with OpenAI (GPT models), Anthropic (Claude models), and Google PaLM (e.g., Chat-Bison).
- **Context management**: Easily manage conversation context across multiple messages for more coherent interactions.
- **Flexible response handling**: Supports both text and JSON response formats with advanced filtering and validation for JSON data.
- **Custom drivers**: Extend functionality by implementing custom drivers for other LLM providers.
- **TypeScript-first**: Fully typed with TypeScript for robust and predictable development.
- **Error handling**: Built-in mechanisms to handle API errors and edge cases gracefully.
- **Lightweight and fast**: Focused on simplicity and performance for modern applications.

## Why Choose AthenaORM?

If you're a developer building applications that rely on LLMs, AthenaORM provides a unified abstraction to reduce the complexity of managing multiple APIs. Whether you're developing AI-powered chatbots, personalized assistants, or data-processing pipelines, AthenaORM is the perfect tool for seamless integration.

## Use Cases:

- **AI Chatbots**: Easily manage multi-turn conversations and context.
- **Data Processing**: Extract structured data (e.g., JSON) from text responses.
- **Custom AI Models**: Integrate with different providers while maintaining a consistent interface.
- **Experimental Projects**: Quickly prototype ideas without worrying about API-specific details.

## Example:

```typescript
import { Athena } from "athena-ai";

const config = {
  provider: "openai",
  apiKey: "your-api-key",
};

const ai = new Athena(config);

const response = await ai.createMessage({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Tell me about the future of AI." },
  ],
  format: "json",
  example: { prediction: "..." },
});

console.log(response.content);
```
