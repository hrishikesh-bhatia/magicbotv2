import { contextStore } from "../../STORE/context.store.js";

const startTime = Date.now();

export const healthController = (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  return res.json({
    status: "ok",
    uptime_seconds: uptime,
    contexts_loaded: {
      category: Object.keys(contextStore.category || {}).length,
      merchant: Object.keys(contextStore.merchant || {}).length,
      customer: Object.keys(contextStore.customer || {}).length,
      trigger: Object.keys(contextStore.trigger || {}).length
    }
  });
};