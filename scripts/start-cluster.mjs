import { spawn } from "node:child_process";
import {
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer, request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STATE_DIR = path.join(tmpdir(), "kaneo-cluster");
const PID_FILE = path.join(STATE_DIR, "cluster.pids");
const LOG_DIR = path.join(STATE_DIR, "logs");

const args = process.argv.slice(2);
const apiCount = parseArg(args, "--api", 2);
const clientCount = parseArg(args, "--client", 2);

if (args.includes("--stop")) {
  if (!fileExists(PID_FILE)) {
    console.log("No cluster running.");
    process.exit(0);
  }
  const pids = readFileSync(PID_FILE, "utf8").trim().split(/\s+/);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGTERM");
      console.log(`Stopped PID ${pid}`);
    } catch {
      console.log(`PID ${pid} already gone`);
    }
  }
  rmSync(STATE_DIR, { recursive: true, force: true });
  console.log("Cluster stopped.");
  process.exit(0);
}

mkdirSync(LOG_DIR, { recursive: true });

const apiPorts = Array.from({ length: apiCount }, (_, i) => 1338 + i);
const clientPorts = Array.from({ length: clientCount }, (_, i) => 3001 + i);
const pids = [];

function launch(exe, args, cwd, env, logName) {
  const logFd = openSync(path.join(LOG_DIR, `${logName}.log`), "a");
  const child = spawn(exe, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", logFd, logFd],
  });
  child.on("error", (err) => console.error(`[${logName}] spawn error:`, err));
  child.on("exit", (code, signal) => {
    closeSync(logFd);
    console.log(`[${logName}] exited (code=${code}, signal=${signal})`);
  });
  console.log(`[${logName}] started with PID ${child.pid}`);
  pids.push(child.pid);
}

for (const port of apiPorts) {
  launch(
    process.execPath,
    ["dist/index.js"],
    path.join(ROOT, "apps/api"),
    { PORT: String(port) },
    `api-${port}`,
  );
}

for (const port of clientPorts) {
  launch(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    path.join(ROOT, "apps/client"),
    {},
    `client-${port}`,
  );
}

writeFileSync(PID_FILE, pids.join("\n"));

createProxy(1337, apiPorts, "api");
createProxy(3000, clientPorts, "client");

console.log(
  `Cluster started: API x${apiPorts.length} (${apiPorts.join(", ")}) proxied on :1337, client x${clientPorts.length} (${clientPorts.join(", ")}) proxied on :3000`,
);

function createProxy(proxyPort, backends, name) {
  let rr = 0;
  const server = createServer((req, res) => {
    const target = backends[rr++ % backends.length];
    const preq = httpRequest(
      {
        host: "localhost",
        port: target,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (pres) => {
        res.writeHead(pres.statusCode, pres.headers);
        pres.pipe(res);
      },
    );
    preq.on("error", () => res.destroy());
    res.on("error", () => preq.destroy());
    req.pipe(preq);
  });

  server.on("upgrade", (req, socket, _head) => {
    socket.on("error", () => socket.destroy());
    const target = backends[rr++ % backends.length];
    const preq = httpRequest({
      host: "localhost",
      port: target,
      path: req.url,
      method: "GET",
      headers: {
        ...req.headers,
        connection: "Upgrade",
        upgrade: "websocket",
      },
    });
    preq.on("upgrade", (pres, psocket, phead) => {
      psocket.on("error", () => psocket.destroy());
      const headLines = Object.entries(pres.headers)
        .map(([k, v]) => `${k}: ${v}\r\n`)
        .join("");
      socket.write(`HTTP/1.1 101 Switching Protocols\r\n${headLines}\r\n`);
      if (phead?.length) psocket.write(phead);
      socket.pipe(psocket);
      psocket.pipe(socket);
    });
    preq.on("response", (pres) => {
      const body = `HTTP/1.1 ${pres.statusCode} ${pres.statusMessage}\r\nConnection: close\r\n\r\n`;
      socket.write(body);
      pres.resume();
      socket.end();
    });
    preq.on("error", () => socket.destroy());
    preq.end();
  });

  server.on("error", (err) => console.error(`Proxy ${name} error:`, err));

  server.listen(proxyPort, () => {
    console.log(`Proxy ${name} listening on :${proxyPort}`);
  });
}

function parseArg(argv, name, def) {
  const i = argv.indexOf(name);
  if (i === -1) return def;
  const v = Number(argv[i + 1]);
  return Number.isFinite(v) && v > 0 ? v : def;
}

function fileExists(p) {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
}
