import { desc, eq, inArray, sql } from "drizzle-orm";
import db from "../../database";
import {
  productFavoriteTable,
  productImageTable,
  productTable,
} from "../../database/schema";

export type ProductsInsights = {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  averagePrice: number;
  byGender: { gender: string; count: number }[];
  topFavorited: {
    id: string;
    title: string;
    price: number;
    slug: string;
    stock: number;
    images: string[];
    favoritesCount: number;
  }[];
};

async function getProductsInsights(
  workspaceId?: string,
): Promise<ProductsInsights> {
  const where = workspaceId
    ? eq(productTable.workspaceId, workspaceId)
    : undefined;

  const baseProducts = where
    ? await db.select().from(productTable).where(where)
    : await db.select().from(productTable);

  const totalProducts = baseProducts.length;
  const lowStock = baseProducts.filter(
    (p) => p.stock > 0 && p.stock <= 5,
  ).length;
  const outOfStock = baseProducts.filter((p) => p.stock === 0).length;
  const averagePrice =
    totalProducts > 0
      ? baseProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts
      : 0;

  const genderCounts = baseProducts.reduce<Record<string, number>>((acc, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1;
    return acc;
  }, {});
  const byGender = Object.entries(genderCounts).map(([gender, count]) => ({
    gender,
    count,
  }));

  const topFavRows = await db
    .select({
      id: productTable.id,
      title: productTable.title,
      price: productTable.price,
      slug: productTable.slug,
      stock: productTable.stock,
      favoritesCount: sql<number>`count(${productFavoriteTable.id})`,
    })
    .from(productTable)
    .innerJoin(
      productFavoriteTable,
      eq(productTable.id, productFavoriteTable.productId),
    )
    .where(where)
    .groupBy(productTable.id)
    .orderBy(desc(sql`count(${productFavoriteTable.id})`))
    .limit(5);

  let topFavorited: ProductsInsights["topFavorited"] = [];
  if (topFavRows.length > 0) {
    const topIds = topFavRows.map((p) => p.id);
    const images = await db
      .select()
      .from(productImageTable)
      .where(inArray(productImageTable.productId, topIds));
    const imageMap = new Map<string, string[]>();
    for (const img of images) {
      const existing = imageMap.get(img.productId) ?? [];
      existing.push(img.url);
      imageMap.set(img.productId, existing);
    }
    topFavorited = topFavRows.map((p) => ({
      ...p,
      images: imageMap.get(p.id) ?? [],
      favoritesCount: Number(p.favoritesCount),
    }));
  }

  return {
    totalProducts,
    lowStock,
    outOfStock,
    averagePrice,
    byGender,
    topFavorited,
  };
}

export default getProductsInsights;
