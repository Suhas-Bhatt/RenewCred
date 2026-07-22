export type BlockType =
  | "HEADING"
  | "PARAGRAPH"
  | "IMAGE"
  | "LIST"
  | "TABLE"
  | "MATH"
  | "CODE"
  | "QUOTE"
  | "DIVIDER"
  | "CALLOUT";

export interface InlineRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  href?: string;
}

export interface ListItem {
  content: InlineRun[];
  children?: ListItem[];
}

export interface HeadingData {
  level: 1 | 2 | 3 | 4;
  content: InlineRun[];
}
export interface ParagraphData {
  content: InlineRun[];
}
export interface ImageData {
  url: string;
  alt: string;
  caption?: string;
}
export interface ListData {
  ordered: boolean;
  items: ListItem[];
}
export interface TableData {
  headers: string[];
  rows: string[][];
}
export interface MathData {
  latex: string;
  displayMode: boolean;
}
export interface CodeData {
  language: string;
  code: string;
}
export interface QuoteData {
  content: InlineRun[];
  cite?: string;
}
export interface CalloutData {
  icon?: string;
  tone: "info" | "warning" | "success" | "danger";
  content: InlineRun[];
}

export type BlockData =
  | HeadingData
  | ParagraphData
  | ImageData
  | ListData
  | TableData
  | MathData
  | CodeData
  | QuoteData
  | CalloutData
  | Record<string, never>;

export interface Block {
  id: string;
  pageId: string;
  type: BlockType;
  order: number;
  data: BlockData;
  createdAt: string;
  updatedAt: string;
}

export type PageStatus = "DRAFT" | "PUBLISHED";

export interface Page {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  blocks?: Block[];
  _count?: { blocks: number };
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "EDITOR";
}

export const BLOCK_TYPE_META: Record<BlockType, { label: string; tag: string; colorVar: string }> = {
  HEADING: { label: "Heading", tag: "H", colorVar: "block-heading" },
  PARAGRAPH: { label: "Paragraph", tag: "P", colorVar: "block-paragraph" },
  IMAGE: { label: "Image", tag: "IMG", colorVar: "block-image" },
  LIST: { label: "List", tag: "LIST", colorVar: "block-list" },
  TABLE: { label: "Table", tag: "TBL", colorVar: "block-table" },
  MATH: { label: "Math (LaTeX)", tag: "TEX", colorVar: "block-math" },
  CODE: { label: "Code", tag: "CODE", colorVar: "block-code" },
  QUOTE: { label: "Quote", tag: "QUOTE", colorVar: "block-quote" },
  DIVIDER: { label: "Divider", tag: "DIV", colorVar: "block-divider" },
  CALLOUT: { label: "Callout", tag: "CALL", colorVar: "block-callout" },
};
