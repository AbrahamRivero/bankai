import type { Metadata } from "next";
import { tServer } from "@/lib/i18n/server";
import { getServerLocale } from "@/lib/i18n/server-locale";
import ProductsClient from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = tServer("store.meta.products.title", undefined, locale);
  const description = tServer(
    "store.meta.products.description",
    undefined,
    locale,
  );
  return { title, description };
}

export default function ProductsPage() {
  return <ProductsClient />;
}
