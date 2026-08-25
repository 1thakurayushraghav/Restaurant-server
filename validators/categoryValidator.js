const { z } = require("zod");

const createCategorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers and hyphens only"),
  icon: z.string().optional().default(""),
  image: z.string().optional().default(""),
  sortOrder: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateCategorySchema = createCategorySchema.partial();

const reorderSchema = z.object({
  order: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
});

module.exports = { createCategorySchema, updateCategorySchema, reorderSchema };
