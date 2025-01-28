import { config } from "dotenv";
import { Athena, AthenaConfig } from "../../src";
import { isJson } from "../../src/utils";

config();

async function main() {
  const config: AthenaConfig = {
    provider: "google",
    apiKey: process.env.GOOGLE_API_KEY || "",
    model: "gemini-1.5-flash",
  };

  const google = new Athena(config);

  google.addToContext([
    { role: "user", content: "You are a helpful assistant." },
  ]);

  const exampleJson = {
    coinSide: "",
  };

  const response = await google.createMessage({
    messages: [
      {
        role: "user",
        content:
          "Provide a JSON object with the following fields: coinSide (head or tail)",
      },
    ],
    format: "json",
    example: exampleJson,
    temperature: 1,
    maxTokens: 200,
  });

  console.log("Raw Response Content:", response.raw);

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
