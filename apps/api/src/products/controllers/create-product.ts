import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  productImageTable,
  productRelatedTable,
  productTable,
} from "../../database/schema";
import { publishEvent } from "../../events";

type CreateProductInput = {
  title: string;
  price?: number;
  description?: string;
  slug?: string;
  stock?: number;
  sizes: string[];
  gender?: string;
  tags?: string[];
  images?: string[];
  relatedProductIds?: string[];
  userId: string;
  workspaceId: string;
};

async function createProduct(input: CreateProductInput) {
  const {
    images = [],
    relatedProductIds = [],
    userId,
    workspaceId,
    ...productData
  } = input;

  const slug = productData.slug
    ? productData.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", "")
    : productData.title.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");

  const [product] = await db
    .insert(productTable)
    .values({
      ...productData,
      gender: productData.gender ?? "unisex",
      slug,
      userId,
      workspaceId,
    })
    .returning();

  if (!product) {
    throw new HTTPException(500, { message: "Failed to create product" });
  }

  await publishEvent("product.created", {
    workspaceId,
    productId: product.id,
    userId,
  });

  if (images.length > 0) {
    await db.insert(productImageTable).values(
      images.map((url) => ({
        url,
        productId: product.id,
      })),
    );
  }

  if (relatedProductIds.length > 0) {
    await db.insert(productRelatedTable).values(
      relatedProductIds.map((relatedProductId) => ({
        productId: product.id,
        relatedProductId,
      })),
    );
  }

  return {
    ...product,
    images,
    relatedProductIds,
  };
}

export default createProduct;
