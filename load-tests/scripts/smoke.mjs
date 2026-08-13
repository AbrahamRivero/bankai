import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTILLERY_BIN = join(
  __dirname,
  "..",
  "node_modules",
  "artillery",
  "bin",
  "run",
);
const NODE_PATH = [
  join(__dirname, "..", "node_modules"),
  join(__dirname, "..", "..", "node_modules"),
].join(";");

const scenario = process.argv[2];
if (!scenario) {
  console.error(
    "Usage: node scripts/smoke.mjs <api-public|api-auth|client|ws>",
  );
  process.exit(1);
}

const fileMap = { client: "client-web", ws: "websocket" };
const file = fileMap[scenario] ?? scenario;

const child = spawn(
  process.execPath,
  [
    ARTILLERY_BIN,
    "run",
    join(__dirname, "..", "scenarios", "smoke", `${file}.yml`),
    "-o",
    join(__dirname, "..", "reports", `smoke-${scenario}.json`),
  ],
  {
    env: { ...process.env, NODE_PATH },
    stdio: "inherit",
  },
);

child.on("exit", (code) => process.exit(code ?? 1));
