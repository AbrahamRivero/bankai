"use client";

import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./product-card";

type ProductItem = {
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

type ProductGridProps = {
  products: ProductItem[];
  isLoading: boolean;
};

const SKELETON_KEYS = [
  "skel-0",
  "skel-1",
  "skel-2",
  "skel-3",
  "skel-4",
  "skel-5",
];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {SKELETON_KEYS.map((key) => (
        <div key={key} className="mx-auto w-full max-w-[384px]">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductGrid({ products, isLoading }: ProductGridProps) {
  const { t } = useTranslation("store");

  if (isLoading) return <SkeletonGrid />;

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium">{t("empty")}</p>
        <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

export default ProductGrid;
