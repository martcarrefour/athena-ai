import { AthenaORM } from "../src/AthenaORM";
import { AthenaConfig } from "../src/types";

async function main() {
  // 1. Конфиг для Anthropic
  const config: AthenaConfig = {
    provider: "anthropic",
    apiKey: "anthropic-XXXXXXXXXXXXXXXX", // Ваш Anthropic ключ
    // Тут не нужно baseUrl обычно, AnthropicDriver сам знает https://api.anthropic.com
  };

  // 2. Создаём ORM
  const anthropicOrm = new AthenaORM(config);

  // 3. Вызов
  const result = await anthropicOrm.call({
    messages: [
      { role: "system", content: "You are a wise assistant named Claude." },
      { role: "user", content: "Please tell me a short story about cats." },
    ],
    temperature: 0.7,
    maxTokens: 150,
  });

  console.log("Anthropic response:\n", result);
}

main().catch(console.error);
