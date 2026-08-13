import { createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
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
const WORKSPACE_ID =
  env.LOAD_TEST_WORKSPACE_ID ?? "lIY4mGWhyghwAH2ecH5OyFDFoMFCD76Y";
const TEST_EMAIL = env.LOAD_TEST_EMAIL ?? "loadtest@bankai.test";
const TEST_NAME = env.LOAD_TEST_NAME ?? "Load Test";
const TEST_ROLE = env.LOAD_TEST_ROLE ?? "owner";
const KEY_PREFIX = env.LOAD_TEST_KEY_PREFIX ?? "key_";
const KEY_NAME = "loadtest";

function hashApiKey(key) {
  const hash = createHash("sha256").update(key).digest();
  return hash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function randomId() {
  return randomBytes(16).toString("hex");
}

function randomKey(length = 24) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[randomBytes(1)[0] % chars.length];
  }
  return out;
}

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL, max: 5 });

async function main() {
  const userId = randomId();
  const rawKey = `${KEY_PREFIX}${randomKey()}`;
  const hashedKey = hashApiKey(rawKey);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userRes = await client.query(
      `INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
       VALUES ($1, $2, $3, true, $4, now(), now())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email_verified = true
       RETURNING id`,
      [userId, TEST_NAME, TEST_EMAIL, TEST_ROLE],
    );
    const finalUserId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO workspace_member (id, workspace_id, user_id, role, joined_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT DO NOTHING`,
      [randomId(), WORKSPACE_ID, finalUserId, TEST_ROLE],
    );

    await client.query("DELETE FROM apikey WHERE name = $1", [KEY_NAME]);
    await client.query(
      `INSERT INTO apikey
        (id, name, start, prefix, key, reference_id, enabled, rate_limit_enabled, request_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, false, 0, now(), now())`,
      [
        randomId(),
        KEY_NAME,
        rawKey.slice(0, 8),
        KEY_PREFIX,
        hashedKey,
        finalUserId,
      ],
    );

    const productsRes = await client.query(
      "SELECT id, slug FROM product WHERE workspace_id = $1 ORDER BY created_at LIMIT 50",
      [WORKSPACE_ID],
    );
    const products = productsRes.rows;

    await client.query("COMMIT");

    const fixtures = {
      apiKey: rawKey,
      userId: finalUserId,
      workspaceId: WORKSPACE_ID,
      products,
      productId: products[0]?.id ?? "",
      slug: products[0]?.slug ?? "",
    };

    const outPath = join(__dirname, "..", "fixtures.json");
    writeFileSync(outPath, JSON.stringify(fixtures, null, 2), "utf8");

    console.log("Fixtures written to", outPath);
    console.log("  user       :", TEST_EMAIL, "->", finalUserId);
    console.log("  api key    :", rawKey);
    console.log("  workspace  :", WORKSPACE_ID);
    console.log("  products   :", products.length);
    if (products.length === 0) {
      console.warn(
        "  WARNING: no products found for workspace — product scenarios will fail.",
      );
    }
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  await pool.end();
}

main().catch((err) => {
  console.error("setup-fixtures failed:", err.message);
  process.exit(1);
});
