const { z } = require('zod');

// Inline rich-text runs: a paragraph/heading/list item is an array of runs
// so bold/italic/code/link marks can be mixed within one line, without
// pulling in a full rich-text-editor document schema.
const inlineRunSchema = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  code: z.boolean().optional(),
  href: z.string().url().optional(),
});
const richTextSchema = z.array(inlineRunSchema).min(1);

// Recursive schema for nested list items: each item is rich text plus an
// optional array of child items (arbitrary depth).
const listItemSchema = z.lazy(() =>
  z.object({
    content: richTextSchema,
    children: z.array(listItemSchema).optional(),
  })
);

const blockDataSchemas = {
  HEADING: z.object({
    level: z.number().int().min(1).max(4),
    content: richTextSchema,
  }),
  PARAGRAPH: z.object({
    content: richTextSchema,
  }),
  IMAGE: z.object({
    url: z.string().min(1),
    alt: z.string().default(''),
    caption: z.string().optional(),
  }),
  LIST: z.object({
    ordered: z.boolean().default(false),
    items: z.array(listItemSchema).min(1),
  }),
  TABLE: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
  MATH: z.object({
    latex: z.string().min(1),
    displayMode: z.boolean().default(true),
  }),
  CODE: z.object({
    language: z.string().default('text'),
    code: z.string(),
  }),
  QUOTE: z.object({
    content: richTextSchema,
    cite: z.string().optional(),
  }),
  DIVIDER: z.object({}).default({}),
  CALLOUT: z.object({
    icon: z.string().optional(),
    tone: z.enum(['info', 'warning', 'success', 'danger']).default('info'),
    content: richTextSchema,
  }),
};

const blockTypeEnum = z.enum(Object.keys(blockDataSchemas));

// Cross-field validation (data shape must match declared type) happens in
// the controller via blockDataSchemas[type], since Zod's discriminated
// union needs the discriminant key inside the same object; here `type` and
// `data` are validated together for clearer error messages per block type.
const createBlockSchema = z.object({
  type: blockTypeEnum,
  order: z.number().int().min(0),
  data: z.record(z.any()),
});

const updateBlockSchema = z.object({
  type: blockTypeEnum.optional(),
  order: z.number().int().min(0).optional(),
  data: z.record(z.any()).optional(),
});

const reorderSchema = z.object({
  blocks: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })).min(1),
});

function validateBlockData(type, data) {
  const schema = blockDataSchemas[type];
  if (!schema) {
    return { success: false, error: `Unknown block type: ${type}` };
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }
  return { success: true, data: result.data };
}

module.exports = {
  createBlockSchema,
  updateBlockSchema,
  reorderSchema,
  blockDataSchemas,
  validateBlockData,
};
