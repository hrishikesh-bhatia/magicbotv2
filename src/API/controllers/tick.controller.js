import { contextStore } from "../../STORE/context.store.js";
import { compose } from "../../ENGINE/DecisionEngine.js";
import { SuppressionManager } from "../../ENGINE/SuppressionManager.js";

/**
 * Triggered periodically by the judge to initiate proactive conversations.
 * Handles trigger resolution, context matching, and suppression check.
 */
export const handleTick = (req, res) => {
  const { available_triggers } = req.body;
  const actions = [];

  // 1. Early exit if no triggers are active for this tick
  if (!available_triggers || available_triggers.length === 0) {
    return res.json({ actions: [] });
  }

  // 2. Process each trigger independently[cite: 2, 15]
  for (let triggerData of available_triggers) {
    // Resolve the actual trigger context object from the store[cite: 11]
    const trigger = contextStore.trigger?.[triggerData.id] || triggerData;

    // A. Suppression Check: Never send the same trigger/event twice[cite: 1, 25]
    if (trigger.suppression_key && SuppressionManager.isBlocked(trigger.suppression_key)) {
      continue;
    }

    // B. Resolve Merchant Context[cite: 1, 15]
    const merchantId = trigger.merchant_id || trigger.payload?.merchant_id;
    const merchant = contextStore.merchant?.[merchantId];

    if (!merchant) {
      // In production, we skip triggers that don't have associated merchant context
      continue;
    }

    // C. Resolve Category Context[cite: 1, 15]
    const category = contextStore.category?.[merchant.category_slug];
    if (!category) {
      continue;
    }

    // D. Resolve Customer Context (Optional for most, required for customer scope)[cite: 1, 15]
    let customer = null;
    if (trigger.customer_id) {
      customer = contextStore.customer?.[trigger.customer_id];
    } else if (trigger.scope === "customer") {
      // Fallback: Find any customer belonging to this merchant if specific ID missing[cite: 15]
      customer = Object.values(contextStore.customer || {})
        .find(c => c.merchant_id === merchant.merchant_id);
    }

    // E. Execute Deterministic Composition[cite: 1, 18]
    const decision = compose({
      trigger,
      merchant,
      category,
      customer
    });

    if (decision) {
      // F. Mark as suppressed before adding to actions
      if (trigger.suppression_key) {
        SuppressionManager.mark(trigger.suppression_key);
      }

      actions.push({
        conversation_id: `conv_${merchant.merchant_id}_${trigger.id}`, // Unique ID for tracking[cite: 2]
        merchant_id: merchant.merchant_id,
        customer_id: customer?.customer_id || null,
        trigger_id: trigger.id,
        ...decision
      });
    }
  }

  // 3. Prioritize by Urgency (5 = High, 1 = Low)
  actions.sort((a, b) => {
    const tA = available_triggers.find(t => t.id === a.trigger_id);
    const tB = available_triggers.find(t => t.id === b.trigger_id);
    return (tB?.urgency || 0) - (tA?.urgency || 0);
  });

  // 4. Respect the 20-action cap per tick[cite: 2]
  return res.json({
    actions: actions.slice(0, 20)
  });
};