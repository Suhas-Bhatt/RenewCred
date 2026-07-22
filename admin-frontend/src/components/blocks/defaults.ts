import type { BlockData, BlockType } from "@/lib/types";

export function defaultDataFor(type: BlockType): BlockData {
  switch (type) {
    case "HEADING":
      return { level: 2, content: [{ text: "" }] };
    case "PARAGRAPH":
      return { content: [{ text: "" }] };
    case "IMAGE":
      return { url: "", alt: "" };
    case "LIST":
      return { ordered: false, items: [{ content: [{ text: "" }] }] };
    case "TABLE":
      return { headers: ["Column 1", "Column 2"], rows: [["", ""]] };
    case "MATH":
      return { latex: "", displayMode: true };
    case "CODE":
      return { language: "javascript", code: "" };
    case "QUOTE":
      return { content: [{ text: "" }] };
    case "DIVIDER":
      return {};
    case "CALLOUT":
      return { tone: "info", content: [{ text: "" }] };
    default:
      return {};
  }
}
