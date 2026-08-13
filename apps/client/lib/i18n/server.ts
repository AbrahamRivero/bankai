import { type AppLocale, defaultLocale, resources } from "@i18n/resources";

function getValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function tServer(
  key: string,
  params?: Record<string, string>,
  locale?: AppLocale,
): string {
  const resolvedLocale = locale ?? defaultLocale;
  const resource = resources[resolvedLocale];
  let value = getValue(resource as Record<string, unknown>, key);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
    }
  }
  return value;
}

export function formatMetadataTitle(title: string): string {
  return `${title} — Bankai Project`;
}
