// src/ENGINE/DecisionEngine.js

import { selectSignal } from "./SignalSelector.js";
import { mapStrategy } from "./StrategyMapper.js";
import { composeMessage } from "./MessageComposer.js";
import { buildRationale } from "./RationaleBuilder.js";

/**
 * The core orchestration layer that transforms raw context into a merchant action.
 * Follows the 4-context composition framework: Category, Merchant, Trigger, Customer.
 */
export const compose = ({ trigger, merchant, category, customer }) => {
  // 1️⃣ Signal Selection: Identify the most critical event (e.g., Performance Dip vs. Research)[cite: 23]
  const signal = selectSignal(trigger, merchant, category);
  if (!signal) {
    return null; 
  }

  // 2️⃣ Strategy Mapping: Determine the psychological lever (Loss Aversion, Social Proof, etc.)[cite: 1, 24]
  const strategy = mapStrategy(signal, category);
  if (!strategy) {
    return null;
  }

  // 3️⃣ Message Composition: Draft the actual copy using category-specific voice and specific anchors[cite: 1, 19]
  const message = composeMessage({
    strategy,
    trigger,
    merchant,
    category,
    customer
  });

  // 4️⃣ Validation: Ensure output is valid string to prevent malformed response penalties
  if (!message || typeof message !== "string") {
    return null;
  }

  // 5️⃣ Final Action Object: Structured for the magicpin judge harness
  return {
    body: message,
    cta: strategy.cta || "yes_no", // Default to binary YES/STOP for high engagement compulsion
    
    // send_as logic: "vera" for merchant-facing, "merchant_on_behalf" for customer-facing[cite: 1, 3]
    send_as: trigger.scope === "customer" ? "merchant_on_behalf" : "vera",
    
    // Critical for dedup logic to avoid "anti-repetition" penalties
    suppression_key: trigger.suppression_key || `sup_${merchant.merchant_id}_${trigger.id}`,
    
    // Anchored rationale for scoring transparency[cite: 1, 21]
    rationale: buildRationale(signal, merchant)
  };
};