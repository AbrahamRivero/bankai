import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import addToFavorites from "./controllers/add-to-favorites";
import createProduct from "./controllers/create-product";
import deleteProduct from "./controllers/delete-product";
import getMostFavorited from "./controllers/get-most-favorited";
import getProduct from "./controllers/get-product";
import getProducts from "./controllers/get-products";
import getProductsInsights from "./controllers/get-products-insights";
import getUserFavorites from "./controllers/get-user-favorites";
import isProductInFavorites from "./controllers/is-product-in-favorites";
import removeFromFavorites from "./controllers/remove-from-favorites";
import updateProduct from "./controllers/update-product";
import {
  createFavoriteSchema,
  createProductSchema,
  paginationSchema,
  productListResponseSchema,
  productResponseSchema,
  updateProductSchema,
} from "./schemas";

const products = new Hono<{
  Variables: {
    userId: string;
  };
}>()
  .get(
    "/",
    describeRoute({
      operationId: "getProducts",
      tags: ["Store"],
      description: "Get paginated products with filters",
      responses: {
        200: {
          description: "Paginated product list",
          content: {
            "application/json": { schema: resolver(productListResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator("query", paginationSchema),
    async (c) => {
      const query = c.req.valid("query");
      const userId = c.get("userId");
      const products = await getProducts({
        limit: query.limit ? Number(query.limit) : 10,
        offset: query.offset ? Number(query.offset) : 0,
        sortBy: query.sortBy,
        availability: query.availability,
        minPrice: query.minPrice ? Number(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
        gender: query.gender,
        sizes: query.sizes,
        tags: query.tags,
        searchterm: query.searchterm,
        workspaceId: query.workspaceId,
        userId,
      });
      return c.json(products);
    },
  )
  .get(
    "/most-favorited",
    describeRoute({
      operationId: "getMostFavoritedProducts",
      tags: ["Store"],
      description: "Get top 10 most favorited products",
      responses: {
        200: {
          description: "List of most favorited products",
          content: {
            "application/json": {
              schema: resolver(v.array(productResponseSchema)),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator("query", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("query");
      const userId = c.get("userId");
      const products = await getMostFavorited(userId, workspaceId);
      return c.json(products);
    },
  )
  .get(
    "/favorites",
    describeRoute({
      operationId: "getUserFavorites",
      tags: ["Store"],
      description: "Get current user's favorite products",
      responses: {
        200: {
          description: "List of user's favorite products",
          content: {
            "application/json": {
              schema: resolver(v.array(productResponseSchema)),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator("query", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("query");
      const userId = c.get("userId");
      const favorites = await getUserFavorites(userId, workspaceId);
      return c.json(favorites);
    },
  )
  .get(
    "/favorites/:productId/check",
    describeRoute({
      operationId: "isProductInFavorites",
      tags: ["Store"],
      description: "Check if a product is in user's favorites",
      responses: {
        200: {
          description: "Favorite status",
          content: {
            "application/json": {
              schema: resolver(v.object({ isFavorite: v.boolean() })),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator("param", v.object({ productId: v.string() })),
    async (c) => {
      const { productId } = c.req.valid("param");
      const userId = c.get("userId");
      const check = await isProductInFavorites(productId, userId);
      return c.json({ isFavorite: check });
    },
  )
  .get(
    "/insights",
    describeRoute({
      operationId: "getProductsInsights",
      tags: ["Store"],
      description: "Get products insights for the dashboard",
      responses: { 200: { description: "Products insights" } },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    requireWorkspacePermission({ product: ["read"] }),
    validator("query", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("query");
      const insights = await getProductsInsights(workspaceId);
      return c.json(insights);
    },
  )
  .get(
    "/:term",
    describeRoute({
      operationId: "getProduct",
      tags: ["Store"],
      description: "Get product by ID or slug",
      responses: {
        200: {
          description: "Product details",
          content: {
            "application/json": { schema: resolver(productResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator("param", v.object({ term: v.string() })),
    validator("query", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { term } = c.req.valid("param");
      const userId = c.get("userId");
      const product = await getProduct(term, userId);
      return c.json(product);
    },
  )
  .post(
    "/",
    describeRoute({
      operationId: "createProduct",
      tags: ["Store"],
      description: "Create a new product",
      responses: {
        200: {
          description: "Product created",
          content: {
            "application/json": { schema: resolver(productResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ product: ["create"] }),
    validator("json", createProductSchema),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");
      const product = await createProduct({ ...input, userId });
      return c.json(product);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      operationId: "updateProduct",
      tags: ["Store"],
      description: "Update an existing product",
      responses: {
        200: {
          description: "Product updated",
          content: {
            "application/json": { schema: resolver(productResponseSchema) },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ product: ["update"] }),
    validator("param", v.object({ id: v.string() })),
    validator("json", updateProductSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");
      const userId = c.get("userId");
      const product = await updateProduct(id, { ...input, userId });
      return c.json(product);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      operationId: "deleteProduct",
      tags: ["Store"],
      description: "Delete a product",
      responses: {
        200: {
          description: "Product deleted",
          content: {
            "application/json": {
              schema: resolver(v.object({ message: v.string() })),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    requireWorkspacePermission({ product: ["delete"] }),
    validator("param", v.object({ id: v.string() })),
    validator("query", v.object({ workspaceId: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const { workspaceId } = c.req.valid("query");
      const userId = c.get("userId");
      const result = await deleteProduct(id, workspaceId, userId);
      return c.json(result);
    },
  )
  .post(
    "/favorites",
    describeRoute({
      operationId: "addProductToFavorites",
      tags: ["Store"],
      description: "Add a product to user's favorites",
      responses: {
        200: {
          description: "Favorite added",
          content: {
            "application/json": {
              schema: resolver(
                v.object({
                  id: v.string(),
                  userId: v.string(),
                  productId: v.string(),
                }),
              ),
            },
          },
        },
      },
    }),
    workspaceAccess.fromBody(),
    validator("json", createFavoriteSchema),
    async (c) => {
      const { productId } = c.req.valid("json");
      const userId = c.get("userId");
      const favorite = await addToFavorites(productId, userId);
      return c.json(favorite);
    },
  )
  .delete(
    "/favorites/:productId",
    describeRoute({
      operationId: "removeProductFromFavorites",
      tags: ["Store"],
      description: "Remove a product from user's favorites",
      responses: {
        200: {
          description: "Favorite removed",
          content: {
            "application/json": {
              schema: resolver(v.object({ message: v.string() })),
            },
          },
        },
      },
    }),
    workspaceAccess.fromQuery("workspaceId"),
    validator("param", v.object({ productId: v.string() })),
    async (c) => {
      const { productId } = c.req.valid("param");
      const userId = c.get("userId");
      const result = await removeFromFavorites(productId, userId);
      return c.json(result);
    },
  );

export default products;
