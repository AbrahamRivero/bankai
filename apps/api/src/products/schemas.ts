import * as v from "valibot";

export const productResponseSchema = v.object({
  id: v.string(),
  title: v.string(),
  price: v.number(),
  description: v.nullable(v.string()),
  slug: v.string(),
  stock: v.number(),
  sizes: v.array(v.string()),
  gender: v.string(),
  tags: v.array(v.string()),
  userId: v.nullable(v.string()),
  images: v.array(v.string()),
  relatedProductIds: v.array(v.string()),
  createdAt: v.date(),
  updatedAt: v.date(),
});

export const productListResponseSchema = v.object({
  products: v.array(productResponseSchema),
  total: v.number(),
  offset: v.number(),
  limit: v.number(),
});

export const createProductSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  price: v.optional(v.number()),
  description: v.optional(v.string()),
  slug: v.optional(v.string()),
  stock: v.optional(v.number()),
  sizes: v.array(v.string()),
  gender: v.optional(
    v.union([
      v.literal("men"),
      v.literal("women"),
      v.literal("kid"),
      v.literal("unisex"),
    ]),
  ),
  tags: v.optional(v.array(v.string())),
  images: v.optional(v.array(v.string())),
  relatedProductIds: v.optional(v.array(v.string())),
  workspaceId: v.string(),
});

export const updateProductSchema = v.partial(createProductSchema);

export const createFavoriteSchema = v.object({
  productId: v.string(),
});

export const paginationSchema = v.object({
  limit: v.optional(v.string()),
  offset: v.optional(v.string()),
  sortBy: v.optional(v.string()),
  availability: v.optional(v.string()),
  minPrice: v.optional(v.string()),
  maxPrice: v.optional(v.string()),
  gender: v.optional(v.string()),
  sizes: v.optional(v.union([v.string(), v.array(v.string())])),
  tags: v.optional(v.union([v.string(), v.array(v.string())])),
  searchterm: v.optional(v.string()),
  workspaceId: v.string(),
});
