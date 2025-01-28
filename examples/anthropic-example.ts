import { Athena } from "../src/Athena";
import { AthenaConfig } from "../src/types";

async function main() {
  const config: AthenaConfig = {
    provider: "anthropic",
    apiKey: "anthropic-XXXXXXXXXXXXXXXX",
  };

  const anthropic = new Athena(config);

  const result = await anthropic.call({
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
