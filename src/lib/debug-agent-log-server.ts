import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const PKG_NAME = "cancha-ya-bogota";

function findPackageRoot(start: string): string | null {
  let dir = start;
  for (let i = 0; i < 12; i++) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
          name?: string;
        };
        if (pkg.name === PKG_NAME) return dir;
      } catch {
        /* keep walking */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function logFilePaths(): string[] {
  const name = "debug-8117cf.log";
  const roots = new Set<string>();
  const fromPkg = findPackageRoot(process.cwd());
  if (fromPkg) roots.add(fromPkg);
  if (process.env.INIT_CWD) roots.add(process.env.INIT_CWD);
  roots.add(process.cwd());
  return [...roots].map((r) => join(r, name));
}

/** NDJSON in repo root; tries INIT_CWD then cwd (npm vs server cwd). */
export function debugAgentLogServer(entry: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  runId?: string;
}): void {
  const line = JSON.stringify({
    sessionId: "8117cf",
    timestamp: Date.now(),
    ...entry,
  });
  let wrote = false;
  for (const p of logFilePaths()) {
    try {
      appendFileSync(p, `${line}\n`);
      wrote = true;
      break;
    } catch {
      /* try next root */
    }
  }
  if (!wrote) {
    const tmpPath = join(tmpdir(), `debug-8117cf-${PKG_NAME}.log`);
    try {
      appendFileSync(tmpPath, `${line}\n`);
      console.warn("[debug-agent-log-server] wrote to tmp (repo paths failed)", tmpPath);
      wrote = true;
    } catch {
      console.warn("[debug-agent-log-server] append failed", logFilePaths(), "and tmp", tmpPath);
    }
  }
  fetch("http://127.0.0.1:7654/ingest/527c6de2-20d8-45a0-90a3-9d8a7801669f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8117cf",
    },
    body: line,
  }).catch(() => {});
}
