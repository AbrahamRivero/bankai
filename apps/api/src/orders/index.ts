import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createOrder from "./controllers/create-order";
import deleteOrder from "./controllers/delete-order";
import getDashboardSummary from "./controllers/get-dashboard-summary";
import getOrder from "./controllers/get-order";
import getOrders from "./controllers/get-orders";
import updateOrder from "./controllers/update-order";
import {
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
      const result = await getOrders(
        limit ? Number(limit) : 10,
        offset ? Number(offset) : 0,
        undefined,
        workspaceId,
        customerId,
      );
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
      }),
    ),
    async (c) => {
      const { workspaceId, limit, offset } = c.req.valid("query");
      const userId = c.get("userId");
      const result = await getOrders(
        limit ? Number(limit) : 10,
        offset ? Number(offset) : 0,
        userId,
        workspaceId,
      );
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
