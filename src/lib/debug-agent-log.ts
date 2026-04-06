/** Debug session: agent NDJSON ingest (local dev). */
export function agentLog(payload: {
  location: string;
  message: string;
  hypothesisId: string;
  data?: Record<string, unknown>;
  runId?: string;
}): void {
  // #region agent log
  fetch("http://127.0.0.1:7654/ingest/527c6de2-20d8-45a0-90a3-9d8a7801669f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "8117cf",
    },
    body: JSON.stringify({
      sessionId: "8117cf",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
}
