import { appendFileSync } from "node:fs";
import { join } from "node:path";

/** NDJSON to workspace; ingest may be offline — file is the source of truth. */
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
  try {
    appendFileSync(join(process.cwd(), "debug-8117cf.log"), `${line}\n`);
  } catch {
    /* ignore */
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
