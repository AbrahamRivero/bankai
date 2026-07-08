import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  productImageTable,
  productRelatedTable,
  productTable,
} from "../../database/schema";
import { publishEvent } from "../../events";

type UpdateProductInput = {
  title?: string;
  price?: number;
  description?: string;
  slug?: string;
  stock?: number;
  sizes?: string[];
  gender?: string;
  tags?: string[];
  images?: string[];
  relatedProductIds?: string[];
  userId: string;
  workspaceId?: string;
};

async function updateProduct(id: string, input: UpdateProductInput) {
  const { images, relatedProductIds, userId, workspaceId, ...toUpdate } = input;

  const [existing] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, {
      message: `Product with id "${id}" not found`,
    });
  }

  const updateData: Record<string, unknown> = { ...toUpdate, userId };

  if (toUpdate.title) {
    updateData.slug = toUpdate.title
      .toLowerCase()
      .replaceAll(" ", "_")
      .replaceAll("'", "");
  }

  const [updated] = await db
    .update(productTable)
    .set(updateData)
    .where(eq(productTable.id, id))
    .returning();

  if (images !== undefined) {
    await db
      .delete(productImageTable)
      .where(eq(productImageTable.productId, id));

    if (images.length > 0) {
      await db.insert(productImageTable).values(
        images.map((url) => ({
          url,
          productId: id,
        })),
      );
    }
  }

  if (relatedProductIds !== undefined) {
    await db
      .delete(productRelatedTable)
      .where(eq(productRelatedTable.productId, id));

    if (relatedProductIds.length > 0) {
      await db.insert(productRelatedTable).values(
        relatedProductIds.map((relatedProductId) => ({
          productId: id,
          relatedProductId,
        })),
      );
    }
  }

  await publishEvent("product.updated", {
    workspaceId,
    productId: id,
    userId,
  });

  return updated;
}

export default updateProduct;
