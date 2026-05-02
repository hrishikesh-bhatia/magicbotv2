import { contextStore, contextVersion } from "../../STORE/context.store.js";

/**
 * Handles incoming context pushes from the judge.
 * Supports idempotency and version control to ensure only the latest data is used.
 */
export const contextController = (req, res) => {
  const { scope, context_id, version, payload } = req.body;

  // 1. Basic validation of the request structure
  if (!scope || !context_id || version === undefined || !payload) {
    return res.status(400).json({ 
      accepted: false, 
      reason: "malformed_request",
      details: "Missing scope, context_id, version, or payload" 
    });
  }

  // 2. Ensure the scope exists in our store[cite: 11, 26]
  if (!contextStore[scope]) {
    return res.status(400).json({ 
      accepted: false, 
      reason: "invalid_scope",
      details: `Scope '${scope}' is not supported` 
    });
  }

  // 3. Idempotency & Version Check[cite: 2, 11]
  // We only accept the update if the version is strictly higher than what we have.
  const prevVersion = contextVersion[scope]?.[context_id] ?? -1;

  if (version <= prevVersion) {
    return res.json({
      accepted: true,
      message: "No-op (older or same version)",
      current_version: prevVersion
    });
  }

  // 4. Atomic Update of Context and Version
  try {
    // Store the actual payload
    contextStore[scope][context_id] = payload;

    // Track the version globally to prevent stale data overrides
    if (!contextVersion[scope]) {
      contextVersion[scope] = {};
    }
    contextVersion[scope][context_id] = version;

    // 5. Success response with the recommended ack_id[cite: 2]
    return res.json({
      accepted: true,
      ack_id: `ack_${context_id}_v${version}`,
      stored_at: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error storing context for ${scope}/${context_id}:`, error);
    return res.status(500).json({ 
      accepted: false, 
      reason: "internal_storage_error" 
    });
  }
};