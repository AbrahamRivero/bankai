import { and, eq, inArray } from "drizzle-orm";
import db from "../../database";
import {
  productTable,
  promotionProductTable,
  promotionTable,
} from "../../database/schema";

type ValidatePromotionInput = {
  workspaceId: string;
  code: string;
  subtotal: number;
  shipping: number;
  items: { productId: string; quantity: number }[];
};

type ValidatePromotionResult = {
  valid: boolean;
  discount: number;
  type: string;
  value: number;
  promotionId: string;
  title: string;
  message?: string;
};

async function validatePromotion(
  input: ValidatePromotionInput,
): Promise<ValidatePromotionResult> {
  const [promotion] = await db
    .select()
    .from(promotionTable)
    .where(
      and(
        eq(promotionTable.code, input.code),
        eq(promotionTable.workspaceId, input.workspaceId),
      ),
    )
    .limit(1);

  if (!promotion) {
    return {
      valid: false,
      discount: 0,
      type: "",
      value: 0,
      promotionId: "",
      title: "",
      message: "Promotion not found",
    };
  }

  if (!promotion.isActive) {
    return {
      valid: false,
      discount: 0,
      type: promotion.type,
      value: promotion.value,
      promotionId: promotion.id,
      title: promotion.title,
      message: "Promotion is inactive",
    };
  }

  const now = new Date();
  if (now < promotion.startDate) {
    return {
      valid: false,
      discount: 0,
      type: promotion.type,
      value: promotion.value,
      promotionId: promotion.id,
      title: promotion.title,
      message: "Promotion has not started yet",
    };
  }

  if (now > promotion.endDate) {
    return {
      valid: false,
      discount: 0,
      type: promotion.type,
      value: promotion.value,
      promotionId: promotion.id,
      title: promotion.title,
      message: "Promotion has expired",
    };
  }

  if (
    promotion.maxUses !== null &&
    promotion.currentUses >= promotion.maxUses
  ) {
    return {
      valid: false,
      discount: 0,
      type: promotion.type,
      value: promotion.value,
      promotionId: promotion.id,
      title: promotion.title,
      message: "Promotion has reached maximum uses",
    };
  }

  if (
    promotion.minimumPurchaseAmount !== null &&
    input.subtotal < promotion.minimumPurchaseAmount
  ) {
    return {
      valid: false,
      discount: 0,
      type: promotion.type,
      value: promotion.value,
      promotionId: promotion.id,
      title: promotion.title,
      message: `Minimum purchase amount of $${promotion.minimumPurchaseAmount.toFixed(2)} not met`,
    };
  }

  let discount = 0;

  if (promotion.type === "free_shipping") {
    discount = input.shipping;
  } else if (promotion.type === "percentage") {
    discount = input.subtotal * (promotion.value / 100);
  } else if (promotion.type === "bogo") {
    const linkedProducts = await db
      .select()
      .from(promotionProductTable)
      .where(eq(promotionProductTable.promotionId, promotion.id));

    if (linkedProducts.length > 0) {
      const cartQuantities = input.items.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
          return acc;
        },
        {},
      );

      const allMet = linkedProducts.every(
        (lp) => (cartQuantities[lp.productId] || 0) >= lp.quantity,
      );

      if (!allMet) {
        return {
          valid: false,
          discount: 0,
          type: promotion.type,
          value: promotion.value,
          promotionId: promotion.id,
          title: promotion.title,
          message: "Required products not in cart",
        };
      }

      const qualifyingProductIds = linkedProducts.map((lp) => lp.productId);

      const qualifyingProducts = await db
        .select({ id: productTable.id, price: productTable.price })
        .from(productTable)
        .where(inArray(productTable.id, qualifyingProductIds));

      const cheapestPrice =
        qualifyingProducts.length > 0
          ? Math.min(...qualifyingProducts.map((p) => p.price))
          : 0;

      discount = cheapestPrice * (promotion.value / 100);
    }
  }

  return {
    valid: true,
    discount: Math.max(0, discount),
    type: promotion.type,
    value: promotion.value,
    promotionId: promotion.id,
    title: promotion.title,
  };
}

export default validatePromotion;
