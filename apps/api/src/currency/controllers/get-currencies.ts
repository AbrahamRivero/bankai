import { desc } from "drizzle-orm";
import db from "../../database";
import { currencyCacheTable } from "../../database/schema";

async function getCurrencies() {
  const rates = await db
    .selectDistinctOn([currencyCacheTable.currencyCode], {
      id: currencyCacheTable.id,
      currencyCode: currencyCacheTable.currencyCode,
      rate: currencyCacheTable.rate,
      provider: currencyCacheTable.provider,
      lastUpdated: currencyCacheTable.lastUpdated,
    })
    .from(currencyCacheTable)
    .orderBy(
      currencyCacheTable.currencyCode,
      desc(currencyCacheTable.lastUpdated),
    );

  return { source: "database", rates };
}

export default getCurrencies;
