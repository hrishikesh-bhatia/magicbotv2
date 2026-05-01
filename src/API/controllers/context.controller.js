import { contextStore, contextVersion } from "../../STORE/context.store.js";

export const contextController = (req, res) => {
  const { scope, context_id, version, payload } = req.body;

  if (!scope || !context_id || version === undefined) {
    return res.status(400).json({ accepted: false });
  }

  // 🔥 check version (important)
  const prevVersion = contextVersion[scope]?.[context_id] || -1;

  if (version <= prevVersion) {
    return res.json({
      accepted: true,
      message: "No-op (older or same version)"
    });
  }

  // ✅ store context
  if (!contextStore[scope]) {
    return res.status(400).json({ accepted: false, error: "Invalid scope" });
  }

  contextStore[scope][context_id] = payload;

  // ✅ update version
  if (!contextVersion[scope]) contextVersion[scope] = {};
  contextVersion[scope][context_id] = version;

  return res.json({
    accepted: true,
    stored_at: new Date().toISOString()
  });
};