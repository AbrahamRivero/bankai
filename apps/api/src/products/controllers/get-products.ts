import {
  and,
  arrayOverlaps,
  asc,
  avg,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  sql,
} from "drizzle-orm";
import db from "../../database";
import {
  productFavoriteTable,
  productImageTable,
  productTable,
  reviewTable,
} from "../../database/schema";

type GetProductsOptions = {
  limit?: number;
  offset?: number;
  sortBy?: string;
  availability?: string;
  minPrice?: number;
  maxPrice?: number;
  gender?: string;
  sizes?: string | string[];
  tags?: string | string[];
  searchterm?: string;
  workspaceId: string;
  userId?: string;
};

async function getProducts(options: GetProductsOptions) {
  const {
    limit = 10,
    offset = 0,
    sortBy,
    availability,
    minPrice,
    maxPrice,
    gender,
    sizes,
    tags,
    searchterm,
    workspaceId,
    userId,
  } = options;

  const conditions: ReturnType<typeof eq>[] = [];

  conditions.push(eq(productTable.workspaceId, workspaceId));

  if (availability === "available") {
    conditions.push(gte(productTable.stock, 1));
  } else if (availability === "out_of_stock") {
    conditions.push(lte(productTable.stock, 0));
  }

  if (minPrice !== undefined) {
    conditions.push(gte(productTable.price, minPrice));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(productTable.price, maxPrice));
  }

  if (gender) {
    conditions.push(eq(productTable.gender, gender));
  }

  if (searchterm) {
    conditions.push(sql`${productTable.title} ILIKE ${`%${searchterm}%`}`);
  }

  if (sizes) {
    const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
    conditions.push(arrayOverlaps(productTable.sizes, sizeArray));
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    conditions.push(arrayOverlaps(productTable.tags, tagArray));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy = asc(productTable.title);

  switch (sortBy) {
    case "title_asc":
      orderBy = asc(productTable.title);
      break;
    case "title_desc":
      orderBy = desc(productTable.title);
      break;
    case "price_asc":
      orderBy = asc(productTable.price);
      break;
    case "price_desc":
      orderBy = desc(productTable.price);
      break;
    case "newest":
      orderBy = desc(productTable.createdAt);
      break;
    case "oldest":
      orderBy = asc(productTable.createdAt);
      break;
  }

  const [products, totalResult] = await Promise.all([
    db
      .select()
      .from(productTable)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productTable).where(where),
  ]);

  const total = Number(totalResult?.[0]?.count ?? 0);
  const productIds = products.map((p) => p.id);

  const [reviewAggs, images, favorites] = await Promise.all([
    productIds.length > 0
      ? db
          .select({
            productId: reviewTable.productId,
            reviewCount: count(reviewTable.id),
            averageRating: avg(reviewTable.rating),
          })
          .from(reviewTable)
          .where(inArray(reviewTable.productId, productIds))
          .groupBy(reviewTable.productId)
      : Promise.resolve([]),
    productIds.length > 0
      ? db
          .select()
          .from(productImageTable)
          .where(inArray(productImageTable.productId, productIds))
      : Promise.resolve([]),
    userId
      ? db
          .select()
          .from(productFavoriteTable)
          .where(eq(productFavoriteTable.userId, userId))
      : Promise.resolve([]),
  ]);

  const reviewMap = new Map<
    string,
    { reviewCount: number; averageRating: number | null }
  >();
  for (const agg of reviewAggs) {
    reviewMap.set(agg.productId, {
      reviewCount: Number(agg.reviewCount),
      averageRating: agg.averageRating ? Number(agg.averageRating) : null,
    });
  }

  const imageMap = new Map<string, string[]>();
  for (const img of images) {
    const existing = imageMap.get(img.productId) ?? [];
    existing.push(img.url);
    imageMap.set(img.productId, existing);
  }

  const favoriteSet = new Set(favorites.map((f) => f.productId));

  const mappedProducts = products.map((product) => {
    const agg = reviewMap.get(product.id);
    return {
      ...product,
      images: imageMap.get(product.id) ?? [],
      isFavorite: favoriteSet.has(product.id),
      reviewCount: agg?.reviewCount ?? 0,
      averageRating: agg?.averageRating ?? null,
    };
  });

  return {
    products: mappedProducts,
    total,
    offset,
    limit,
  };
}

export default getProducts;
