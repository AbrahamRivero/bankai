import { lt } from "drizzle-orm";
import db from "../../database";
import { currencyCacheTable } from "../../database/schema";

async function getCurrencies() {
  const now = new Date();

  const cached = await db
    .select()
    .from(currencyCacheTable)
    .where(lt(currencyCacheTable.expiresAt, now));

  if (cached.length > 0) {
    return { source: "cache", rates: cached };
  }

  try {
    const response = await fetch("https://api.eltoque.com/v1/rates", {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const stale = await db.select().from(currencyCacheTable);
      if (stale.length > 0) {
        return { source: "stale_cache", rates: stale };
      }
      return { source: "error", message: "Failed to fetch currency rates" };
    }

    const data = (await response.json()) as Record<
      string,
      { rate: number; provider: string }
    >;

    const rates = Object.entries(data).map(([code, info]) => ({
      currencyCode: code,
      rate: info.rate,
      provider: info.provider,
      lastUpdated: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    }));

    await db.delete(currencyCacheTable);
    if (rates.length > 0) {
      await db.insert(currencyCacheTable).values(rates);
    }

    return { source: "live", rates };
  } catch {
    const stale = await db.select().from(currencyCacheTable);
    if (stale.length > 0) {
      return { source: "stale_cache", rates: stale };
    }
    return { source: "error", message: "Failed to fetch currency rates" };
  }
}

export default getCurrencies;
