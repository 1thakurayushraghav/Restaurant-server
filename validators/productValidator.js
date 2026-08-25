const { z } = require("zod");

const variantSchema = z.object({
  label: z.string().min(1),
  price: z.number().nonnegative(),
  isAvailable: z.boolean().optional(),
  sku: z.string().optional(),
});

const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers and hyphens only"),
  description: z.string().max(2000).optional().default(""),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional().default([]),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  isVeg: z.boolean().optional().default(true),
  isAvailable: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  isBestseller: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  ingredients: z.array(z.string()).optional().default([]),
  allergens: z.array(z.string()).optional().default([]),
});

const updateProductSchema = createProductSchema.partial();

module.exports = { createProductSchema, updateProductSchema };
