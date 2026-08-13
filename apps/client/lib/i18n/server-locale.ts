import { type AppLocale, defaultLocale, resources } from "@i18n/resources";
import { cookies } from "next/headers";

export async function getServerLocale(): Promise<AppLocale> {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get("locale")?.value;
    if (localeCookie && localeCookie in resources) {
      return localeCookie as AppLocale;
    }
  } catch {
    // cookies() might fail in certain contexts (e.g., static generation)
  }
  return defaultLocale;
}
