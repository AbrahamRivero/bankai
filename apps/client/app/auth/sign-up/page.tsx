import type { Metadata } from "next";
import { tServer } from "@/lib/i18n/server";
import { getServerLocale } from "@/lib/i18n/server-locale";
import SignUpClient from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = tServer("auth.signUp.pageTitle", undefined, locale);
  return { title };
}

export default function SignUpPage() {
  return <SignUpClient />;
}
