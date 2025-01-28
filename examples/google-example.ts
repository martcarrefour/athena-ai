import { config } from "dotenv";
import { Athena, AthenaConfig } from "../src";
import { isJson } from "../src/utils";

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
    name: "",
    age: 20,
    gender: "male",
    profession: "Engineer",
    address: "Russia, Moscow",
  };

  const response = await google.createMessage({
    messages: [
      {
        role: "user",
        content: "Provide information about a fictional person.",
      },
    ],

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
