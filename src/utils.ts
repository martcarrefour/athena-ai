export function parseMarkdownToJson(md: string): Record<string, unknown> {
  const jsonMatch = md.match(/```json\n([\s\S]+?)\n```/);
  if (jsonMatch) {
    try {
      // Парсим содержимое JSON
      return JSON.parse(jsonMatch[1]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error";
      throw new Error(`Failed to parse JSON: ${errorMessage}`);
    }
  }
  throw new Error(
    "No valid JSON block found in the provided Markdown content."
  );
}

export function isJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
