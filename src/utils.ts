export function parseMarkdownToJson(md: string): Record<string, unknown> {
  const jsonMatch = md.match(/```json\n([\s\S]+?)\n```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      throw new Error("Failed to parse JSON from Markdown content.");
    }
  }
  throw new Error("No valid JSON found in Markdown content.");
}

export function isJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}
