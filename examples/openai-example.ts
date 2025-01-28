import { Athena } from "../src";
import { AthenaConfig } from "../src/types";

async function main() {
  const config: AthenaConfig = {
    provider: "openai",
    apiKey: "sk-XXXXXXXXXXXXXXXXXXXXXXXX",
    baseUrl: "",
  };

  const openai = new Athena(config);

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
