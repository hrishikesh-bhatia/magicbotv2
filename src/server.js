// src/server.js
import express from "express";

// Route Imports
import testRoute from "./API/routes/test.route.js";
import tickRoute from "./API/routes/tick.route.js";
import replyRoute from "./API/routes/reply.route.js";
import healthRoute from "./API/routes/health.route.js";
import contextRoute from "./API/routes/context.route.js";
import metadataRoute from "./API/routes/metadata.route.js";

// Store Imports for Teardown
import { SuppressionManager } from "./ENGINE/SuppressionManager.js";
import { conversationStore } from "./STORE/conversation.store.js";

const app = express();

// 1. GLOBAL MIDDLEWARE
// Ensures all incoming JSON payloads from the judge are correctly parsed.
app.use(express.json());

// 2. INTERNAL TESTING ROUTES
// Used for manual verification of the Decision Engine.
app.use("/test", testRoute);

// 3. PRODUCTION ENDPOINTS (/v1 Prefix)
// These match the strict technical contract provided in the challenge brief.
app.use("/v1", healthRoute);   // GET /v1/healthz
app.use("/v1", tickRoute);     // POST /v1/tick
app.use("/v1", replyRoute);    // POST /v1/reply
app.use("/v1", contextRoute);  // POST /v1/context
app.use("/v1", metadataRoute); // GET /v1/metadata

/**
 * 4. TEARDOWN ENDPOINT
 * Required to wipe in-memory state between test runs.
 * Ensures the bot remains 'idempotent' across different judge simulations.
 */
app.post("/v1/teardown", (req, res) => {
  SuppressionManager.clear();
  
  // Wipe the conversation store
  Object.keys(conversationStore).forEach(key => delete conversationStore[key]);
  
  console.log("[SYSTEM] Teardown complete. In-memory state cleared.");
  return res.status(200).json({ status: "cleared" });
});

// 5. GLOBAL ERROR HANDLER
// Prevents the server from crashing during the 60-minute test window.
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({ error: "Internal Server Error" });
});

// 6. SERVER STARTUP
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 Vera Bot is Live
  ------------------
  Endpoint: http://localhost:${PORT}/v1
  Mode: Challenge Production
  ------------------
  `);
});