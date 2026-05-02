/**
 * In-memory store for tracking multi-turn conversation states.
 * Essential for intent transitions and detecting repeated auto-replies[cite: 1, 2, 14].
 */

/**
 * Structure of a conversation state entry:
 * [conversation_id]: {
 *   last_intent: string,   // e.g., "positive", "tweak", "auto_reply"
 *   last_action: string,   // e.g., "send", "wait", "end"[cite: 2, 14]
 *   pending_edit: string,  // Store specific merchant tweak requests[cite: 14]
 *   turn_count: number     // Track depth to handle auto-reply escalation[cite: 2, 14]
 * }
 */
export const conversationStore = {};