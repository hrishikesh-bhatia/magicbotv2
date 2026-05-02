// src/ENGINE/SignalSelector.js

/**
 * Evaluates all active triggers and selects the most impactful signal.
 * Uses a weighted scoring system to prioritize performance-critical events.
 */
export const selectSignal = (trigger, merchant, category) => {
  if (!trigger) return null;

  const signals = [];
  const baseUrgency = trigger.urgency || 1;

  // 1. Performance Dip (Highest Priority - Loss Aversion Lever)
  if (trigger.kind === "perf_dip" || trigger.kind === "perf_spike") {
    const delta = Math.abs(trigger.payload?.delta_pct || 0);
    const weight = trigger.kind === "perf_dip" ? 12 : 8; // Dips are more urgent than spikes
    
    signals.push({
      type: "PERF_DIP",
      score: weight + (delta * 10) + baseUrgency,
      payload: trigger.payload
    });
  }

  // 2. Customer Recall (High Engagement - Retention Lever)[cite: 1, 23]
  if (trigger.kind === "recall_due" || trigger.kind === "customer_lapsed_soft") {
    signals.push({
      type: "CUSTOMER_RECALL",
      score: 9 + baseUrgency,
      payload: trigger.payload,
      customer_id: trigger.customer_id
    });
  }

  // 3. Research Digest (Clinical/Peer Authority Lever)[cite: 1, 23]
  if (trigger.kind === "research_digest" || trigger.kind === "category_research_digest_release") {
    signals.push({
      type: "RESEARCH",
      score: 7 + baseUrgency,
      payload: trigger.payload
    });
  }

  // 4. Competitor Alerts (Competitive Response Lever)[cite: 1, 23]
  if (trigger.kind === "competitor_opened") {
    signals.push({
      type: "COMPETITOR",
      score: 7 + baseUrgency,
      payload: trigger.payload
    });
  }

  // 5. Events & Timing (Demand Spike Lever)[cite: 1, 23]
  const eventTriggers = ["ipl_match_today", "festival_upcoming", "weather_heatwave", "local_news_event"];
  if (eventTriggers.includes(trigger.kind)) {
    signals.push({
      type: "EVENT",
      score: 6 + baseUrgency,
      payload: trigger.payload
    });
  }

  // 6. Generic/Dormancy Nudges[cite: 1, 23]
  if (trigger.kind === "dormant_with_vera" || trigger.kind === "milestone_reached") {
    signals.push({
      type: "DORMANT_NUDGE",
      score: 4 + baseUrgency,
      payload: trigger.payload
    });
  }

  // Early exit if no valid signals identified[cite: 23]
  if (signals.length === 0) return null;

  // Pick the BEST signal based on the highest calculated score[cite: 23]
  signals.sort((a, b) => b.score - a.score);

  return signals[0];
};