const { z } = require('zod');

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().regex(slugRegex, 'Slug must be lowercase, alphanumeric, and hyphen-separated').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

const updatePageSchema = createPageSchema.partial();

module.exports = { createPageSchema, updatePageSchema };
