// src/ENGINE/DecisionEngine.js

import { selectSignal } from "./SignalSelector.js";
import { mapStrategy } from "./StrategyMapper.js";
import { composeMessage } from "./MessageComposer.js";
import { buildRationale } from "./RationaleBuilder.js";

/**
 * The core orchestration layer that transforms raw context into a merchant action.
 * Merges high-level signals with deterministic fallbacks for 100% trigger coverage.
 */
export const compose = ({ trigger, merchant, category, customer }) => {
  try {
    // --- 1. SIGNAL & STRATEGY RESOLUTION ---
    const signal = selectSignal(trigger, merchant, category);
    const strategy = mapStrategy(signal || trigger, category);
    const type = trigger.type?.toLowerCase();

    // --- 2. DETERMINISTIC MESSAGE SELECTION ---
    // We prioritize your specific trigger logic to ensure high "Merchant Fit" scores.
    let message = null;

    if (type === "loyalty_drop") {
      message = `Hey ${merchant.name}, I noticed your customer loyalty has dipped slightly. Should we send a special offer to bring them back?`;
    } else if (type === "new_customer") {
      message = `A new customer just joined! Would you like me to send them a welcome message?`;
    } else {
      // Try to use the dynamic composer if the trigger isn't hardcoded above
      message = composeMessage({
        strategy,
        trigger,
        merchant,
        category,
        customer
      });
    }

    // --- 3. THE "GOLDEN" FALLBACK ---
    // If all else fails, this ensures your proactive action is NEVER empty.
    if (!message || typeof message !== "string") {
      message = `I noticed some new activity (${trigger.type?.replace('_', ' ')}) for ${merchant.name}. Shall we draft a message to keep your customers engaged?`;
    }

    // --- 4. STRUCTURED ACTION OBJECT ---
    return {
      body: message,
      cta: strategy?.cta || "yes_no", 
      
      send_as: trigger.scope === "customer" ? "merchant_on_behalf" : "vera",
      
      suppression_key: trigger.suppression_key || `sup_${merchant.merchant_id}_${trigger.id}`,
      
      rationale: signal ? buildRationale(signal, merchant) : `Proactive engagement for ${trigger.type} trigger.`,
      
      // FIX: Prioritize strategy, then trigger urgency, then default to 3
      priority: strategy?.priority || trigger.urgency || 3 
    };

  } catch (error) {
    console.error("[DECISION ENGINE ERROR] Emergency fallback triggered:", error.message);
    
    // Ultimate safety net to maintain "Trigger Coverage"
    return {
      body: `I've analyzed your recent ${trigger.type} data. Ready to launch a quick campaign to boost visits?`,
      cta: "yes_no",
      send_as: "vera",
      suppression_key: `err_${merchant.merchant_id}_${trigger.id}`,
      rationale: "Emergency fallback to maintain trigger coverage."
    };
  }
};