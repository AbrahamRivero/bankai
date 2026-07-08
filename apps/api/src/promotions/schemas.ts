import * as v from "valibot";

export const promotionResponseSchema = v.object({
  id: v.string(),
  title: v.string(),
  description: v.nullable(v.string()),
  type: v.string(),
  value: v.number(),
  startDate: v.date(),
  endDate: v.date(),
  code: v.string(),
  minimumPurchaseAmount: v.nullable(v.number()),
  maxUses: v.nullable(v.number()),
  usesPerUser: v.nullable(v.number()),
  currentUses: v.number(),
  priority: v.number(),
  isActive: v.boolean(),
  isCombinable: v.boolean(),
  conditions: v.nullable(v.record(v.string(), v.unknown())),
  createdAt: v.date(),
  updatedAt: v.date(),
});

export const paginationSchema = v.object({
  limit: v.optional(v.string()),
  offset: v.optional(v.string()),
  workspaceId: v.string(),
});

export const promotionListResponseSchema = v.object({
  promotions: v.array(promotionResponseSchema),
  total: v.number(),
  offset: v.number(),
  limit: v.number(),
});

export const createPromotionSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.optional(v.string()),
  type: v.union([
    v.literal("percentage"),
    v.literal("free_shipping"),
    v.literal("bogo"),
  ]),
  value: v.number(),
  startDate: v.string(),
  endDate: v.string(),
  code: v.pipe(v.string(), v.minLength(1)),
  minimumPurchaseAmount: v.optional(v.number()),
  maxUses: v.optional(v.number()),
  usesPerUser: v.optional(v.number()),
  priority: v.optional(v.number()),
  isCombinable: v.optional(v.boolean()),
  conditions: v.optional(v.record(v.string(), v.unknown())),
  applicableProductIds: v.optional(
    v.array(v.object({ productId: v.string(), quantity: v.number() })),
  ),
  workspaceId: v.string(),
});

export const updatePromotionSchema = v.partial(createPromotionSchema);

export const validatePromotionItemSchema = v.object({
  productId: v.string(),
  quantity: v.number(),
});

export const validatePromotionSchema = v.object({
  workspaceId: v.string(),
  code: v.pipe(v.string(), v.minLength(1)),
  subtotal: v.number(),
  shipping: v.number(),
  items: v.array(validatePromotionItemSchema),
});

export const promotionValidationResponseSchema = v.object({
  valid: v.boolean(),
  discount: v.number(),
  type: v.string(),
  value: v.number(),
  promotionId: v.string(),
  title: v.string(),
  message: v.optional(v.string()),
});
