import { contextStore } from "../../STORE/context.store.js";

const startTime = Date.now();

/**
 * Liveness probe for the magicpin judge harness.
 * Used during warmup (Phase 1) to verify all contexts are loaded.
 */
export const healthController = (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  // Calculate loaded counts for diagnostic verification
  const counts = {
    category: Object.keys(contextStore.category || {}).length,
    merchant: Object.keys(contextStore.merchant || {}).length,
    customer: Object.keys(contextStore.customer || {}).length,
    trigger: Object.keys(contextStore.trigger || {}).length
  };

  // Log heartbeat for local monitoring
  console.log(`[HEALTHZ] Uptime: ${uptime}s | Contexts: C:${counts.category} M:${counts.merchant} Cu:${counts.customer} T:${counts.trigger}`);

  return res.json({
    status: "ok",
    uptime_seconds: uptime,
    contexts_loaded: counts
  });
};