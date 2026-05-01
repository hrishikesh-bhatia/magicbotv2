// src/ENGINE/DecisionEngine.js

import { selectSignal } from "./SignalSelector.js";
import { mapStrategy } from "./StrategyMapper.js";
import { composeMessage } from "./MessageComposer.js";
import { buildRationale } from "./RationaleBuilder.js";

export const compose = ({ trigger, merchant, category }) => {

  // 1️⃣ Select best signal
  const signal = selectSignal(trigger, merchant, category);
  if (!signal) return null;

  // 2️⃣ Map to strategy
  const strategy = mapStrategy(signal, category);
  if (!strategy) return null;

  // 3️⃣ Generate message
  const message = composeMessage({
    strategy,
    trigger,
    merchant,
    category
  });

  // ❗ IMPORTANT: prevent invalid output
  if (!message || typeof message !== "string") return null;
  // 4️⃣ Return final action
  return {
    body: message,
    cta: strategy.cta,
    send_as: "vera",
    suppression_key: trigger.suppression_key,
    rationale: buildRationale(signal, merchant)
  };
};