import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import getCustomersInsights from "./controllers/get-customers-insights";

const customers = new Hono<{ Variables: { userId: string } }>().get(
  "/insights",
  describeRoute({
    operationId: "getCustomersInsights",
    tags: ["Store"],
    description: "Get customers insights for the dashboard",
    responses: { 200: { description: "Customers insights" } },
  }),
  workspaceAccess.fromQuery("workspaceId"),
  requireWorkspacePermission({ order: ["read"] }),
  validator(
    "query",
    v.object({
      workspaceId: v.string(),
      period: v.optional(v.string()),
    }),
  ),
  async (c) => {
    const { workspaceId, period } = c.req.valid("query");
    const insights = await getCustomersInsights(workspaceId, period);
    return c.json(insights);
  },
);

export default customers;
