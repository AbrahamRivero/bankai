"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToggleFavorite } from "@/hooks/mutations/use-toggle-favorite";
import { useCart } from "@/lib/cart-context";
import { convertPrice, formatPrice } from "@/lib/currency";
import { useCurrencyStore } from "@/lib/currency-store";
import { cn } from "@/lib/utils";
import StarRating from "./star-rating";

type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  slug: string;
  stock: number;
  sizes: string[];
  images: string[];
  isFavorite: boolean;
  reviewCount: number;
  averageRating: number | null;
};

const SIZE_DISPLAY = ["XS", "S", "M", "L", "XL", "XXL"];

function ProductCard({
  id,
  title,
  price,
  compareAtPrice,
  slug,
  stock,
  sizes,
  images,
  isFavorite,
  reviewCount,
  averageRating,
}: ProductCardProps) {
  const { t } = useTranslation("store");
  const { user } = useAuth();
  const toggleFavorite = useToggleFavorite();
  const { addItem } = useCart();
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);
  const router = useRouter();
  const displayPrice = convertPrice(price, rates, currency);
  const displayCompareAt =
    compareAtPrice != null
      ? convertPrice(compareAtPrice, rates, currency)
      : null;

  const handleRequireAuth = () => {
    if (!user) {
      router.push("/auth/sign-in");
      return false;
    }
    return true;
  };
  const imageUrl = images?.[0];
  const isOnSale = compareAtPrice != null && compareAtPrice > price;
  const discountPercent =
    isOnSale && compareAtPrice
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;
  const gridCols =
    sizes.length <= 3
      ? "grid-cols-3"
      : sizes.length <= 4
        ? "grid-cols-4"
        : "grid-cols-6";

  return (
    <div className="group mx-auto w-full max-w-[384px]">
      <Link href={`/products/${slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted shadow-xs">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-xs text-muted-foreground">
                {t("noImage")}
              </span>
            </div>
          )}

          {stock <= 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground">
              {t("product.outOfStock")}
            </span>
          )}

          {isOnSale && (
            <span className="absolute right-3 top-3 z-10 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              -{discountPercent}% {t("off")}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${slug}`}>
            <h3 className="text-sm font-medium text-foreground line-clamp-1 hover:underline">
              {title}
            </h3>
          </Link>
          <button
            type="button"
            onClick={() => toggleFavorite.mutate({ productId: id, isFavorite })}
            disabled={toggleFavorite.isPending}
            className={cn(
              "shrink-0 rounded-full p-1.5 transition-colors",
              isFavorite
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={
              isFavorite ? t("removeFromWishlist") : t("addToWishlist")
            }
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>

        <StarRating
          rating={averageRating ?? 0}
          reviewCount={reviewCount}
          size="sm"
        />

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-foreground">
            {formatPrice(displayPrice, currency)}
          </span>
          {isOnSale && displayCompareAt != null && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(displayCompareAt, currency)}
            </span>
          )}
        </div>

        <div className={cn("grid gap-1", gridCols)}>
          {SIZE_DISPLAY.filter((s) => sizes.includes(s)).map((size) => (
            <div
              key={size}
              className="rounded-md border border-border px-1.5 py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {size}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <Button
            size="sm"
            variant="default"
            disabled={stock <= 0}
            className="w-full gap-1.5"
            onClick={() => {
              if (!handleRequireAuth()) return;
              addItem({
                productId: id,
                title,
                price,
                image: imageUrl ?? "",
                size: sizes.length > 0 ? sizes[0] : null,
                quantity: 1,
                slug,
                stock,
              });
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            {t("addToCart")}
          </Button>
          <button
            type="button"
            disabled={stock <= 0}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (!handleRequireAuth()) return;
              addItem({
                productId: id,
                title,
                price,
                image: imageUrl ?? "",
                size: sizes.length > 0 ? sizes[0] : null,
                quantity: 1,
                slug,
                stock,
              });
              router.push("/checkout");
            }}
          >
            {t("buyNow")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
