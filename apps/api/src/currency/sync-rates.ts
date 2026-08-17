import { sql } from "drizzle-orm";
import db from "../database";
import { currencyCacheTable } from "../database/schema";

const EL_TOQUE_URL = "https://api.eltoque.com/v1/rates";

type ElToqueRate = {
  rate: number;
  provider: string;
};

export type SyncCurrencyRatesResult = {
  synced: boolean;
  inserted: number;
  reason?: string;
};

export async function hasCurrencyRatesForToday(): Promise<boolean> {
  const now = new Date();
  const [row] = await db
    .select({ id: currencyCacheTable.id })
    .from(currencyCacheTable)
    .where(sql`date(${currencyCacheTable.lastUpdated}) = date(${now})`)
    .limit(1);
  return Boolean(row);
}

export async function syncCurrencyRates(): Promise<SyncCurrencyRatesResult> {
  let response: Response;
  try {
    response = await fetch(EL_TOQUE_URL, {
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return { synced: false, inserted: 0, reason: "fetch_failed" };
  }

  if (!response.ok) {
    return { synced: false, inserted: 0, reason: `http_${response.status}` };
  }

  const data = (await response.json()) as Record<string, ElToqueRate>;
  const now = new Date();

  let inserted = 0;
  for (const [code, info] of Object.entries(data)) {
    const [existing] = await db
      .select({ id: currencyCacheTable.id })
      .from(currencyCacheTable)
      .where(
        sql`${currencyCacheTable.currencyCode} = ${code} AND date(${currencyCacheTable.lastUpdated}) = date(${now})`,
      )
      .limit(1);
    if (existing) continue;

    await db.insert(currencyCacheTable).values({
      currencyCode: code,
      rate: info.rate,
      provider: info.provider,
      lastUpdated: now,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
    inserted++;
  }

  return { synced: true, inserted };
}
