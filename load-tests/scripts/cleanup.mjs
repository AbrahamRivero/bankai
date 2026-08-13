import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(join(ROOT, ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // no .env at root; rely on process.env
  }
  return { ...env, ...process.env };
}

const env = loadEnv();
const DATABASE_URL =
  env.DATABASE_URL ??
  "postgresql://postgres:Awalker20997@localhost:5432/bankai";
const TEST_EMAIL = env.LOAD_TEST_EMAIL ?? "loadtest@bankai.test";

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL, max: 5 });

async function main() {
  const userRes = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [
    TEST_EMAIL,
  ]);
  if (userRes.rows.length === 0) {
    console.log(
      "No load-test user found (",
      TEST_EMAIL,
      ") — nothing to clean.",
    );
    await pool.end();
    return;
  }
  const userId = userRes.rows[0].id;

  const orders = await pool.query(
    `DELETE FROM "order" WHERE user_id = $1 RETURNING id`,
    [userId],
  );
  const favs = await pool.query(
    "DELETE FROM product_favorite WHERE user_id = $1",
    [userId],
  );

  console.log(
    `Cleaned ${orders.rowCount} orders and ${favs.rowCount} favorites for ${TEST_EMAIL} (${userId}).`,
  );

  const apikey = await pool.query(
    "DELETE FROM apikey WHERE reference_id = $1",
    [userId],
  );
  console.log(`Deleted ${apikey.rowCount} api keys.`);

  const delUser = await pool.query(`DELETE FROM "user" WHERE id = $1`, [
    userId,
  ]);
  console.log(`Deleted user: ${delUser.rowCount}`);

  await pool.end();
}

main().catch((err) => {
  console.error("cleanup failed:", err.message);
  process.exit(1);
});
