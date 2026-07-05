import { eq } from "drizzle-orm";
import db from "../../database";
import {
  productImageTable,
  productTable,
  userTable,
} from "../../database/schema";

const seedProducts = [
  {
    title: "T-shirt Teslo",
    price: 25.99,
    description: "Cómoda camiseta de algodón con logo de Teslo",
    slug: "t-shirt-teslo",
    stock: 50,
    sizes: ["S", "M", "L", "XL"],
    gender: "men",
    tags: ["camiseta", "algodon"],
    images: ["https://placehold.co/600x600/1a1a2e/e94560?text=Teslo+Tshirt"],
  },
  {
    title: "Sudadera Teslo",
    price: 49.99,
    description: "Sudadera con capucha, edición limitada",
    slug: "sudadera-teslo",
    stock: 30,
    sizes: ["M", "L", "XL"],
    gender: "unisex",
    tags: ["sudadera", "edicion-limitada"],
    images: ["https://placehold.co/600x600/16213e/0f3460?text=Teslo+Hoodie"],
  },
  {
    title: "Gorra Teslo Classic",
    price: 19.99,
    description: "Gorra clásica con bordado de Teslo",
    slug: "gorra-teslo-classic",
    stock: 100,
    sizes: ["Universal"],
    gender: "unisex",
    tags: ["gorra", "accesorios"],
    images: ["https://placehold.co/600x600/533483/e94560?text=Teslo+Cap"],
  },
];

async function executeSeed() {
  const existingProducts = await db.select().from(productTable).limit(1);
  if (existingProducts.length > 0) {
    return {
      message:
        "Seed has already been executed. Delete all products first to re-seed.",
    };
  }

  const [adminUser] = await db
    .insert(userTable)
    .values({
      name: "Admin Teslo",
      email: "admin@teslo.com",
      emailVerified: true,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  const userId = adminUser?.id;

  if (!userId) {
    const [existing] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, "admin@teslo.com"))
      .limit(1);
    if (!existing) {
      return { message: "Failed to create admin user" };
    }
  }

  for (const product of seedProducts) {
    const { images, ...productData } = product;
    const [created] = await db
      .insert(productTable)
      .values({ ...productData, userId })
      .returning();

    await db.insert(productImageTable).values(
      images.map((url) => ({
        url,
        productId: created.id,
      })),
    );
  }

  return {
    message: "Seed executed successfully",
    productsSeeded: seedProducts.length,
  };
}

export default executeSeed;
