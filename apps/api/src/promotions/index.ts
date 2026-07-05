import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createPromotion from "./controllers/create-promotion";
import deletePromotion from "./controllers/delete-promotion";
import getPromotionProducts from "./controllers/get-promotion-products";
import getPromotions from "./controllers/get-promotions";
import updatePromotion from "./controllers/update-promotion";
import {
  createPromotionSchema,
  paginationSchema,
  promotionListResponseSchema,
  promotionResponseSchema,
  updatePromotionSchema,
} from "./schemas";

const promotions = new Hono<{ Variables: { userId: string } }>()
  .post(
    "/",
    describeRoute({
      operationId: "createPromotion",
      tags: ["Store"],
      description: "Create a promotion",
      responses: {
        200: {
          description: "Promotion created",
          content: {
            "application/json": { schema: resolver(promotionResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ promotion: ["create"] }),
    validator("json", createPromotionSchema),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");
      const promotion = await createPromotion({ ...input, userId });
      return c.json(promotion);
    },
  )
  .get(
    "/",
    describeRoute({
      operationId: "getPromotions",
      tags: ["Store"],
      description: "Get paginated promotions",
      responses: {
        200: {
          description: "Paginated promotion list",
          content: {
            "application/json": {
              schema: resolver(promotionListResponseSchema),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator("query", paginationSchema),
    async (c) => {
      const query = c.req.valid("query");
      const result = await getPromotions({
        limit: query.limit ? Number(query.limit) : 10,
        offset: query.offset ? Number(query.offset) : 0,
        workspaceId: query.workspaceId,
      });
      return c.json(result);
    },
  )
  .get(
    "/:id/products",
    describeRoute({
      operationId: "getPromotionProducts",
      tags: ["Store"],
      description: "Get product IDs associated with a promotion",
      responses: {
        200: {
          description: "List of product IDs",
          content: {
            "application/json": {
              schema: resolver(
                v.array(
                  v.object({ productId: v.string(), quantity: v.number() }),
                ),
              ),
            },
          },
        },
      },
    }),
    workspaceAccess.fromParam("id"),
    validator("param", v.object({ id: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const productIds = await getPromotionProducts(id);
      return c.json(productIds);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      operationId: "updatePromotion",
      tags: ["Store"],
      description: "Update a promotion",
      responses: {
        200: {
          description: "Promotion updated",
          content: {
            "application/json": { schema: resolver(promotionResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ promotion: ["update"] }),
    validator("param", v.object({ id: v.string() })),
    validator("json", updatePromotionSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const userId = c.get("userId");
      const result = await updatePromotion(id, { ...input, userId });
      return c.json(result);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      operationId: "deletePromotion",
      tags: ["Store"],
      description: "Delete a promotion",
      responses: { 200: { description: "Promotion deleted" } },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    requireWorkspacePermission({ promotion: ["delete"] }),
    validator("param", v.object({ id: v.string() })),
    validator("query", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const { workspaceId } = c.req.valid("query");
      const userId = c.get("userId");
      const result = await deletePromotion(id, workspaceId, userId);
      return c.json(result);
    },
  );

export default promotions;
