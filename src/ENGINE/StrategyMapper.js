// src/ENGINE/StrategyMapper.js

export const mapStrategy = (signal, category) => {

  if (!signal) return null;

  switch (signal.type) {

    // 🔬 Research-driven message
    case "RESEARCH":
      return {
        template: "insight_action",
        cta: "yes_no"
      };

    // 📉 Performance drop
    case "PERF_DIP":
      return {
        template: "problem_solution",
        cta: "yes_no"
      };

    // 🎯 Event / IPL / Festival
    case "EVENT":
      return {
        template: "event_push",
        cta: "yes_no"
      };

    // 🔁 Customer recall / follow-up
    case "CUSTOMER_RECALL":
      return {
        template: "customer_recall",
        cta: "yes_no"
      };

    // 🆚 Competitor action
    case "COMPETITOR":
      return {
        template: "competitor_response",
        cta: "yes_no"
      };

    default:
      return null;
  }
};