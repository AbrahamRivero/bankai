import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import cancelOrder from "./controllers/cancel-order";
import checkout from "./controllers/checkout";
import createOrder from "./controllers/create-order";
import deleteOrder from "./controllers/delete-order";
import getDashboardSummary from "./controllers/get-dashboard-summary";
import getOrder from "./controllers/get-order";
import getOrders from "./controllers/get-orders";
import updateOrder from "./controllers/update-order";
import {
  checkoutSchema,
  createOrderSchema,
  orderResponseSchema,
  orderStatsSchema,
  updateOrderSchema,
} from "./schemas";

const orders = new Hono<{ Variables: { userId: string } }>()
  .post(
    "/",
    describeRoute({
      operationId: "createOrder",
      tags: ["Store"],
      description: "Create a new order",
      responses: {
        200: {
          description: "Order created",
          content: {
            "application/json": { schema: resolver(orderResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ order: ["create"] }),
    validator("json", createOrderSchema),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");
      const order = await createOrder({ ...input, userId });
      return c.json(order);
    },
  )
  .post(
    "/checkout",
    describeRoute({
      operationId: "checkout",
      tags: ["Store"],
      description: "Customer checkout — create an order from cart",
      responses: {
        200: {
          description: "Order created",
          content: {
            "application/json": { schema: resolver(orderResponseSchema) },
          },
        },
      },
    }),
    validator("json", checkoutSchema),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");
      if (!userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const order = await checkout({ ...input, userId });
      return c.json(order);
    },
  )
  .get(
    "/",
    describeRoute({
      operationId: "getOrders",
      tags: ["Store"],
      description: "Get all orders",
      responses: {
        200: {
          description: "Order list",
          content: {
            "application/json": {
              schema: resolver(v.array(orderResponseSchema)),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator(
      "query",
      v.object({
        workspaceId: v.string(),
        limit: v.optional(v.string()),
        offset: v.optional(v.string()),
        customerId: v.optional(v.string()),
      }),
    ),
    async (c) => {
      const { workspaceId, limit, offset, customerId } = c.req.valid("query");
      const result = await getOrders({
        limit: limit ? Number(limit) : 10,
        offset: offset ? Number(offset) : 0,
        workspaceId,
        customerId,
      });
      return c.json(result);
    },
  )
  .get(
    "/user-orders",
    describeRoute({
      operationId: "getUserOrders",
      tags: ["Store"],
      description: "Get current user's orders",
      responses: {
        200: {
          description: "User orders",
          content: {
            "application/json": {
              schema: resolver(v.array(orderResponseSchema)),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator(
      "query",
      v.object({
        workspaceId: v.string(),
        limit: v.optional(v.string()),
        offset: v.optional(v.string()),
        orderStatus: v.optional(v.string()),
        searchterm: v.optional(v.string()),
        minTotal: v.optional(v.string()),
        maxTotal: v.optional(v.string()),
        sortBy: v.optional(v.picklist(["createdAt", "total", "orderNumber"])),
        sortOrder: v.optional(v.picklist(["asc", "desc"])),
      }),
    ),
    async (c) => {
      const {
        workspaceId,
        limit,
        offset,
        orderStatus,
        searchterm,
        minTotal,
        maxTotal,
        sortBy,
        sortOrder,
      } = c.req.valid("query");
      const userId = c.get("userId");
      const result = await getOrders({
        limit: limit ? Number(limit) : 10,
        offset: offset ? Number(offset) : 0,
        userId,
        workspaceId,
        orderStatus,
        searchterm,
        minTotal: minTotal ? Number(minTotal) : undefined,
        maxTotal: maxTotal ? Number(maxTotal) : undefined,
        sortBy,
        sortOrder,
      });
      return c.json(result);
    },
  )
  .get(
    "/dashboard/summary",
    describeRoute({
      operationId: "getDashboardSummary",
      tags: ["Store"],
      description: "Get dashboard order statistics",
      responses: { 200: { description: "Dashboard stats" } },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    requireWorkspacePermission({ order: ["read"] }),
    validator("query", orderStatsSchema),
    async (c) => {
      const { period, startDate, endDate, workspaceId } = c.req.valid("query");
      const summary = await getDashboardSummary(
        period,
        startDate,
        endDate,
        workspaceId,
      );
      return c.json(summary);
    },
  )
  .get(
    "/:id",
    describeRoute({
      operationId: "getOrder",
      tags: ["Store"],
      description: "Get order by ID",
      responses: {
        200: {
          description: "Order details",
          content: {
            "application/json": { schema: resolver(orderResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator("param", v.object({ id: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const userId = c.get("userId");
      const order = await getOrder(id, userId);
      return c.json(order);
    },
  )
  .post(
    "/:id/cancel",
    describeRoute({
      operationId: "cancelOrder",
      tags: ["Store"],
      description: "Cancel own order",
      responses: {
        200: {
          description: "Order cancelled",
          content: {
            "application/json": { schema: resolver(orderResponseSchema) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator(
      "json",
      v.object({
        workspaceId: v.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const userId = c.get("userId");
      if (!userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const order = await cancelOrder(id, userId);
      return c.json(order);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      operationId: "updateOrder",
      tags: ["Store"],
      description: "Update an order",
      responses: {
        200: {
          description: "Order updated",
          content: {
            "application/json": { schema: resolver(orderResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ order: ["update"] }),
    validator("param", v.object({ id: v.string() })),
    validator("json", updateOrderSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const order = await updateOrder(id, input);
      return c.json(order);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      operationId: "deleteOrder",
      tags: ["Store"],
      description: "Delete an order",
      responses: { 200: { description: "Order deleted" } },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    requireWorkspacePermission({ order: ["delete"] }),
    validator("param", v.object({ id: v.string() })),
    validator("query", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const { workspaceId } = c.req.valid("query");
      const userId = c.get("userId");
      const result = await deleteOrder(id, workspaceId, userId);
      return c.json(result);
    },
  );

export default orders;
