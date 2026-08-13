import type { Metadata } from "next";
import { tServer } from "@/lib/i18n/server";
import { getServerLocale } from "@/lib/i18n/server-locale";
import ProductDetailClient from "./page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const workspaceId = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

  try {
    const res = await fetch(
      `${apiUrl}/api/products/${slug}?workspaceId=${workspaceId}`,
    );
    if (!res.ok) throw new Error("Product not found");
    const product = await res.json();
    const productName = product.title;
    const description =
      product.description ||
      tServer("store.meta.productDetail.description", { productName }, locale);
    const image = product.images?.[0];

    return {
      title: productName,
      description,
      openGraph: {
        title: productName,
        description,
        ...(image && { images: [{ url: image }] }),
      },
    };
  } catch {
    const title = tServer(
      "store.meta.productDetail.title",
      { productName: slug },
      locale,
    );
    return { title };
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
