import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccessMiddleware } from "../utils/workspace-access-middleware";
import uploadProductImage from "./controllers/upload-product-image";

const files = new Hono<{ Variables: { userId: string } }>().post(
  "/products",
  describeRoute({
    operationId: "uploadProductImage",
    tags: ["Store"],
    description: "Upload a product image",
    responses: {
      200: {
        description: "Uploaded image URLs",
        content: {
          "application/json": {
            schema: resolver(
              v.object({ secureUrl: v.string(), optimizedUrl: v.string() }),
            ),
          },
        },
      },
    },
  }),
  workspaceAccessMiddleware({
    sources: [
      { type: "query", key: "workspaceId" },
      { type: "body", key: "workspaceId" },
    ],
  }),
  requireWorkspacePermission({ product: ["create"] }),
  async (c) => {
    const body = await c.req.parseBody();
    const file = body.file;

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    const result = await uploadProductImage(file);
    return c.json(result);
  },
);

export default files;
