/**
 * Global In-Memory Store for Challenge Contexts.
 * Designed to persist state throughout the 60-minute test window.
 */

// 1. Raw Context Storage
// Maps context_id/slug to the full payload provided by the judge[cite: 11, 26].
export const contextStore = {
  category: {}, // Vertical-specific knowledge (dentists, salons, etc.)[cite: 1, 3]
  merchant: {}, // Specific business state and performance[cite: 1, 3]
  customer: {}, // Individual customer relationship data[cite: 3, 4]
  trigger: {}   // Event-driven payloads (external/internal)[cite: 3, 23]
};

// 2. Version Tracking Ledger
// Tracks the highest 'version' number received for each specific context_id[cite: 2, 11].
// Essential for Phase 3: Adaptive Context Injection.
export const contextVersion = {
  category: {},
  merchant: {},
  customer: {},
  trigger: {}
};