import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createReview from "./controllers/create-review";
import deleteReview from "./controllers/delete-review";
import getReviewsByProduct from "./controllers/get-reviews-by-product";
import getReviewsInsights from "./controllers/get-reviews-insights";
import updateReview from "./controllers/update-review";
import {
  createReviewSchema,
  reviewResponseSchema,
  updateReviewSchema,
} from "./schemas";

const reviews = new Hono<{ Variables: { userId: string } }>()
  .post(
    "/",
    describeRoute({
      operationId: "createReview",
      tags: ["Store"],
      description: "Create a review for a product",
      responses: {
        200: {
          description: "Review created",
          content: {
            "application/json": { schema: resolver(reviewResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ review: ["create"] }),
    validator("json", createReviewSchema),
    async (c) => {
      const { comment, rating, productId } = c.req.valid("json");
      const userId = c.get("userId");
      const review = await createReview(comment, rating, productId, userId);
      return c.json(review);
    },
  )
  .get(
    "/insights",
    describeRoute({
      operationId: "getReviewsInsights",
      tags: ["Store"],
      description: "Get reviews insights for the dashboard",
      responses: { 200: { description: "Reviews insights" } },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    requireWorkspacePermission({ review: ["read"] }),
    validator("query", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("query");
      const insights = await getReviewsInsights(workspaceId);
      return c.json(insights);
    },
  )
  .get(
    "/product/:productId",
    describeRoute({
      operationId: "getProductReviews",
      tags: ["Store"],
      description: "Get all reviews for a product",
      responses: {
        200: {
          description: "Review list",
          content: {
            "application/json": {
              schema: resolver(v.array(reviewResponseSchema)),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    requireWorkspacePermission({ review: ["read"] }),
    validator("param", v.object({ productId: v.string() })),
    async (c) => {
      const { productId } = c.req.valid("param");
      const result = await getReviewsByProduct(productId);
      return c.json(result);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      operationId: "updateReview",
      tags: ["Store"],
      description: "Update a review",
      responses: {
        200: {
          description: "Review updated",
          content: {
            "application/json": { schema: resolver(reviewResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ review: ["update"] }),
    validator("param", v.object({ id: v.string() })),
    validator("json", updateReviewSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { comment, rating } = c.req.valid("json");
      const userId = c.get("userId");
      const review = await updateReview(id, comment, rating, userId);
      return c.json(review);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      operationId: "deleteReview",
      tags: ["Store"],
      description: "Delete a review",
      responses: { 200: { description: "Review deleted" } },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    requireWorkspacePermission({ review: ["delete"] }),
    validator("param", v.object({ id: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const result = await deleteReview(id);
      return c.json(result);
    },
  );

export default reviews;
