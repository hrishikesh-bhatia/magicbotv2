// src/ENGINE/SignalSelector.js

export const selectSignal = (trigger, merchant, category) => {

  if (!trigger) return null;

  const signals = [];

  // 🔥 1. Research Digest
  if (trigger.kind === "research_digest") {
    signals.push({
      type: "RESEARCH",
      score: 5 + (trigger.urgency || 0),
      payload: trigger.payload
    });
  }

  // 🔥 2. Performance Dip (VERY IMPORTANT)
  if (trigger.kind === "perf_dip") {
    const drop = Math.abs(trigger.payload.delta_pct || 0);

    signals.push({
      type: "PERF_DIP",
      score: 8 + (drop * 10) + (trigger.urgency || 0),
      payload: trigger.payload
    });
  }

  // 🔥 3. Event / IPL
  if (trigger.kind === "ipl_match_today" || trigger.kind === "festival_upcoming") {
    signals.push({
      type: "EVENT",
      score: 6 + (trigger.urgency || 0),
      payload: trigger.payload
    });
  }

  // 🔥 4. Customer Recall (HIGH ENGAGEMENT)
  if (trigger.kind === "recall_due") {
    signals.push({
      type: "CUSTOMER_RECALL",
      score: 7 + (trigger.urgency || 0),
      payload: trigger.payload,
      customer_id: trigger.customer_id
    });
  }

  // 🔥 5. Competitor Alert (ADVANCED EDGE)
  if (trigger.kind === "competitor_opened") {
    signals.push({
      type: "COMPETITOR",
      score: 6 + (trigger.urgency || 0),
      payload: trigger.payload
    });
  }

  // ❌ No signals found
  if (signals.length === 0) return null;

  // ✅ Pick BEST signal
  signals.sort((a, b) => b.score - a.score);

  return signals[0];
};