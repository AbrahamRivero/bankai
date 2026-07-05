import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import executeSeed from "./controllers/execute-seed";

const seed = new Hono<{ Variables: { userId: string } }>().post(
  "/",
  describeRoute({
    operationId: "executeSeed",
    tags: ["Store"],
    description: "Seed the database with initial products and admin user",
    responses: {
      200: {
        description: "Seed result",
        content: {
          "application/json": {
            schema: resolver(
              v.object({
                message: v.string(),
                productsSeeded: v.optional(v.number()),
              }),
            ),
          },
        },
      },
    },
  }),
  workspaceAccess.fromBody(),
  requireWorkspacePermission({
    product: ["delete"],
    order: ["delete"],
    promotion: ["delete"],
  }),
  async (c) => {
    const result = await executeSeed();
    return c.json(result);
  },
);

export default seed;
