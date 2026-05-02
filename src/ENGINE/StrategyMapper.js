// src/ENGINE/StrategyMapper.js

/**
 * Maps a selected signal to a specific psychological engagement strategy.
 * Leverages peer benchmarks to choose between Social Proof and Loss Aversion.
 */
export const mapStrategy = (signal, category) => {
  if (!signal) return null;

  // 1. Identify the core template based on signal type
  switch (signal.type) {
    
    // 🔬 Research-driven: Focus on Peer Authority and Insight[cite: 1, 4]
    case "RESEARCH":
      return {
        template: "insight_action",
        cta: "yes_no" // High commitment via binary choice
      };

    // 📉 Performance drop: Focus on Loss Aversion or Social Proof[cite: 1, 4]
    case "PERF_DIP":
      // If we have peer stats, we can use Social Proof to show they are falling behind[cite: 1, 4]
      const hasPeerStats = !!category?.peer_stats;
      
      return {
        template: "problem_solution",
        cta: "yes_no",
        lever: hasPeerStats ? "social_proof" : "loss_aversion"
      };

    // 🎯 Event / IPL / Festival: Focus on Demand Spikes[cite: 3, 24]
    case "EVENT":
      return {
        template: "event_push",
        cta: "yes_no"
      };

    // 🔁 Customer recall: Focus on Personalization and Retention[cite: 1, 24]
    case "CUSTOMER_RECALL":
      return {
        template: "customer_recall",
        cta: "yes_no"
      };

    // 🆚 Competitor action: Focus on Competitive Response[cite: 4, 24]
    case "COMPETITOR":
      return {
        template: "competitor_response",
        cta: "yes_no"
      };

    // 😴 Dormancy: Focus on Curiosity and Re-engagement[cite: 1, 23]
    case "DORMANT_NUDGE":
      return {
        template: "insight_action", // Reuse insight to spark curiosity[cite: 1]
        cta: "yes_no"
      };

    default:
      return null;
  }
};