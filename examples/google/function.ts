import { config } from "dotenv";
import { Athena, AthenaConfig } from "../../src";
import { isJson } from "../../src/utils";

config();

// Декларация функции управления светом
const controlLightFunctionDeclaration = {
  name: "controlLight",
  parameters: {
    type: "OBJECT",
    description: "Set the brightness and color temperature of a room light.",
    properties: {
      brightness: {
        type: "NUMBER",
        description:
          "Light level from 0 to 100. Zero is off and 100 is full brightness.",
      },
      colorTemperature: {
        type: "STRING",
        description:
          "Color temperature of the light fixture which can be `daylight`, `cool`, or `warm`.",
      },
    },
    required: ["brightness", "colorTemperature"],
  },
};

async function setLightValues(brightness: number, colorTemperature: string) {
  console.log(
    `Setting light: brightness=${brightness}, colorTemperature=${colorTemperature}`
  );
  return {
    brightness,
    colorTemperature,
    status: "success",
  };
}

async function main() {
  const config: AthenaConfig = {
    provider: "google",
    apiKey: process.env.GOOGLE_API_KEY || "",
    model: "gemini-1.5-flash",
    functions: {
      controlLight: async ({
        brightness,
        colorTemperature,
      }: {
        brightness: number;
        colorTemperature: string;
      }) => {
        return await setLightValues(brightness, colorTemperature);
      },
    },
  };

  const google = new Athena(config);

  google.addToContext([
    {
      role: "user",
      content: `
        You can control a virtual lighting system by calling the following function:
        'controlLight' - to set brightness and color temperature.
      `,
    },
    {
      role: "user",
      content: "You are a helpful assistant.",
    },
  ]);

  google.addToContext([
    {
      role: "function_declaration",
      content: JSON.stringify(controlLightFunctionDeclaration),
    },
  ]);

  const response = await google.createMessage({
    messages: [
      {
        role: "user",
        content:
          "Set the light to 75% brightness with a cool color temperature.",
      },
    ],
    format: "json",
    temperature: 1,
    maxTokens: 200,
  });

  if (isJson(response.content)) {
    console.log(
      "Parsed JSON Response:",
      JSON.parse(response.content as string)
    );
  } else {
    console.error("The response is not valid JSON.");
    console.log(response.content);
  }
}

main().catch(console.error);
