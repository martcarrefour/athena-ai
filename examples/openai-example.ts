import { Athena } from "../src/Athena";
import { AthenaConfig } from "../src/types";

async function main() {
  // 1. Конфиг для OpenAI
  const config: AthenaConfig = {
    provider: "openai",
    apiKey: "sk-XXXXXXXXXXXXXXXXXXXXXXXX", // Ваш OpenAI ключ
    baseUrl: "", // При необходимости, если используете кастомный эндпоинт
    // model: "gpt-4", // Можете указать нужную модель
  };

  // 2. Создаём ORM
  const openai = new Athena(config);

  // 3. Пример вызова (получить весь ответ сразу, без стрима)
  const result = await openai.call({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello, how are you?" },
    ],
    temperature: 0.7,
    maxTokens: 100,
  });

  console.log("OpenAI response:\n", result);
}

main().catch(console.error);
