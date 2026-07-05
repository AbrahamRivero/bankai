import * as v from "valibot";

export const reviewResponseSchema = v.object({
  id: v.string(),
  comment: v.string(),
  rating: v.number(),
  userId: v.string(),
  productId: v.string(),
  createdAt: v.date(),
  updatedAt: v.date(),
});

export const createReviewSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
  rating: v.pipe(v.number(), v.minValue(1), v.maxValue(5)),
  productId: v.string(),
});

export const updateReviewSchema = v.partial(
  v.object({
    comment: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
    rating: v.pipe(v.number(), v.minValue(1), v.maxValue(5)),
  }),
);
