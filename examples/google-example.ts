import { config } from "dotenv";
import { Athena } from "../src/Athena";
import { AthenaConfig } from "../src/types";
import { isJson } from "../src/utils";

// Загружаем переменные окружения
config();

async function main() {
  // Настраиваем конфигурацию AthenaORM
  const config: AthenaConfig = {
    provider: "google",
    apiKey: process.env.GOOGLE_API_KEY || "", // Используем ключ из .env
    model: "gemini-1.5-flash", // Используем корректное имя модели
  };

  const google = new Athena(config);

  // Устанавливаем контекст
  google.addToContext([
    { role: "user", content: "You are a helpful assistant." },
  ]);

  // Пример JSON, который мы ожидаем
  const exampleJson = {
    name: "",
    age: 20,
    gender: "male",
    profession: "Engineer",
    address: "Russia, Moscow",
  };

  // Отправляем запрос
  const response = await google.createMessage({
    messages: [
      {
        role: "user",
        content: "Provide information about a fictional person.",
      },
    ],
    format: "json",
    example: exampleJson,
    temperature: 1,
    maxTokens: 200,
  });

  console.log("Raw Response Content:", response.raw);

  // Проверяем, является ли content корректным JSON
  if (isJson(response.content)) {
    console.log(
      "Parsed JSON Response:",
      JSON.parse(response.content as string)
    );
  } else {
    console.error("The response is not valid JSON.");
  }
}

main().catch(console.error);
