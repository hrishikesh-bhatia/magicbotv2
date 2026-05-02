/**
 * Manages message deduplication to prevent anti-repetition penalties.
 * Ensures that specific triggers or events are only acted upon once per session[cite: 1, 25].
 */

// In-memory set to track suppression keys for the duration of the test
const sentKeys = new Set();

export const SuppressionManager = {
  /**
   * Checks if a specific key (e.g., trigger ID or suppression_key) is already blocked[cite: 2, 25].
   * @param {string} key 
   * @returns {boolean}
   */
  isBlocked: (key) => {
    if (!key) return false;
    return sentKeys.has(key);
  },

  /**
   * Marks a key as suppressed to prevent future duplicate sends.
   * @param {string} key 
   */
  mark: (key) => {
    if (key) {
      sentKeys.add(key);
    }
  },

  /**
   * Wipes all state. Required for the teardown phase to ensure clean 
   * state between test runs.
   */
  clear: () => {
    sentKeys.clear();
  },

  /**
   * Optional: Returns the total number of suppressed events for diagnostics[cite: 2].
   */
  getStats: () => {
    return { suppressed_count: sentKeys.size };
  }
};