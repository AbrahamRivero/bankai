import type { Metadata } from "next";
import { tServer } from "@/lib/i18n/server";
import { getServerLocale } from "@/lib/i18n/server-locale";
import SignInClient from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = tServer("auth.signIn.pageTitle", undefined, locale);
  return { title };
}

export default function SignInPage() {
  return <SignInClient />;
}
