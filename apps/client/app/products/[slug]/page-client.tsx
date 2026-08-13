"use client";

import { Heart, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ImageGallery from "@/components/catalog/image-gallery";
import ProductCard from "@/components/catalog/product-card";
import ProductReviews from "@/components/catalog/product-reviews";
import QuantitySelector from "@/components/catalog/quantity-selector";
import StarRating from "@/components/catalog/star-rating";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import useGetProduct from "@/hooks/queries/store/use-get-product";
import useGetReviews from "@/hooks/queries/store/use-get-reviews";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID;

export default function ProductDetailClient() {
  const { t } = useTranslation("store");
  const { user } = useAuth();
  const { addItem } = useCart();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const workspaceId = DEFAULT_WORKSPACE_ID ?? "";
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { data: product, isLoading } = useGetProduct(workspaceId, slug);
  const { data: reviews, isLoading: isLoadingReviews } = useGetReviews(
    product?.id ?? "",
    workspaceId,
  );

  if (!DEFAULT_WORKSPACE_ID) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{t("configError")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-40" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
        <Package className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-medium">{t("notFound")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("notFoundDescription")}
        </p>
        <Button variant="outline" onClick={() => router.push("/products")}>
          {t("backToProducts")}
        </Button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [];
  const canAddToCart = product.stock > 0;

  return (
    <div className="flex min-h-svh flex-col">
      <nav className="flex items-center gap-2 border-b border-border/40 px-6 py-3 text-sm">
        <Link
          href="/"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("home")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          href="/products"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("products")}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{product.title}</span>
      </nav>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="order-1">
            <ImageGallery images={images} title={product.title} />
          </div>

          <div className="order-2 flex flex-col">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {product.gender && (
                <>
                  <span className="capitalize">{product.gender}</span>
                  <span className="text-muted-foreground/50">/</span>
                </>
              )}
              {product.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="capitalize">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight">
              {product.title}
            </h1>

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-2xl font-bold">
                ${product.price.toFixed(2)}
              </span>
              <div className="flex items-center gap-2 sm:border-l sm:border-border sm:pl-4">
                <StarRating
                  rating={product.averageRating ?? 0}
                  showValue
                  reviewCount={product.reviewCount}
                />
              </div>
            </div>

            <p className="mb-8 text-base leading-relaxed text-muted-foreground">
              {product.description || t("noDescription")}
            </p>

            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-medium text-foreground">
                  {t("tags")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-medium text-foreground">
                  {t("availableSizes")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-muted-foreground/50 hover:bg-muted",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={Math.max(product.stock, 1)}
              />
              {canAddToCart && (
                <div className="flex items-center gap-2">
                  <Badge variant="success">
                    {t("product.inStock", { count: product.stock })}
                  </Badge>
                </div>
              )}
              {!canAddToCart && (
                <Badge variant="destructive">{t("product.outOfStock")}</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                disabled={!canAddToCart}
                className="gap-2"
                onClick={() => {
                  if (!user) {
                    router.push("/auth/sign-in");
                    return;
                  }
                  if (product.sizes.length > 0 && !selectedSize) return;
                  addItem({
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.images?.[0] ?? "",
                    size: selectedSize,
                    quantity,
                    slug: product.slug,
                    stock: product.stock,
                  });
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                {t("addToCart")}
              </Button>

              <Button size="lg" variant="secondary" className="gap-2">
                <Heart className="h-5 w-5" />
                {t("wishlist")}
              </Button>
            </div>

            <Button
              size="lg"
              disabled={!canAddToCart}
              className="mt-3 w-full"
              onClick={() => {
                if (!user) {
                  router.push("/auth/sign-in");
                  return;
                }
                if (product.sizes.length > 0 && !selectedSize) return;
                addItem({
                  productId: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.images?.[0] ?? "",
                  size: selectedSize,
                  quantity,
                  slug: product.slug,
                  stock: product.stock,
                });
                router.push("/checkout");
              }}
            >
              {t("buyNow")}
            </Button>
          </div>
        </div>

        <Separator className="my-12" />

        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <>
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">{t("youMayAlsoLike")}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {product.relatedProducts.map((rp) => (
                  <ProductCard key={rp.id} {...rp} isFavorite={false} />
                ))}
              </div>
            </section>
            <Separator className="mb-12" />
          </>
        )}

        <ProductReviews
          reviews={reviews}
          isLoading={isLoadingReviews}
          productId={product?.id ?? ""}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
}
