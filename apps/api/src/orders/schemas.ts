import * as v from "valibot";

export const orderItemSchema = v.object({
  id: v.string(),
  quantity: v.number(),
  size: v.nullable(v.string()),
  product: v.object({
    id: v.string(),
    title: v.string(),
    slug: v.string(),
    price: v.number(),
    stock: v.number(),
    images: v.optional(v.array(v.string())),
  }),
});

export const orderResponseSchema = v.object({
  id: v.string(),
  shippingAddress: v.string(),
  phone: v.nullable(v.string()),
  city: v.string(),
  province: v.string(),
  discount: v.number(),
  paymentMethod: v.string(),
  orderStatus: v.string(),
  orderNumber: v.string(),
  trackingNumber: v.string(),
  subtotal: v.number(),
  shipping: v.number(),
  total: v.number(),
  notes: v.nullable(v.string()),
  userId: v.string(),
  customerId: v.nullable(v.string()),
  customerName: v.nullable(v.string()),
  orderItems: v.array(orderItemSchema),
  createdAt: v.date(),
  updatedAt: v.date(),
});

export const createOrderItemSchema = v.object({
  quantity: v.number(),
  product: v.string(),
  size: v.optional(v.string()),
});

export const createOrderSchema = v.object({
  shippingAddress: v.pipe(v.string(), v.minLength(1)),
  phone: v.optional(v.string()),
  city: v.string(),
  province: v.pipe(v.string(), v.minLength(1)),
  discount: v.optional(v.number()),
  paymentMethod: v.optional(
    v.union([
      v.literal("usd"),
      v.literal("euro"),
      v.literal("cup"),
      v.literal("card"),
    ]),
  ),
  orderStatus: v.union([
    v.literal("pending"),
    v.literal("cancelled"),
    v.literal("completed"),
    v.literal("confirmed"),
    v.literal("shipped"),
  ]),
  subtotal: v.number(),
  shipping: v.number(),
  total: v.number(),
  notes: v.optional(v.string()),
  customerId: v.optional(v.nullable(v.string())),
  orderItems: v.array(createOrderItemSchema),
  workspaceId: v.string(),
});

export const updateOrderSchema = v.partial(createOrderSchema);

export const orderStatsSchema = v.object({
  period: v.optional(
    v.union([
      v.literal("week"),
      v.literal("two-weeks"),
      v.literal("month"),
      v.literal("quarter"),
      v.literal("year"),
    ]),
  ),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  workspaceId: v.string(),
});
