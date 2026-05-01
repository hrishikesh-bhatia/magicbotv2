// src/ENGINE/RationaleBuilder.js

export const buildRationale = (signal, merchant) => {

  if (!signal) return "No valid signal found";

  // 🔬 Research
  if (signal.type === "RESEARCH") {
    return "Using research insight combined with merchant performance to drive higher engagement";
  }

  // 📉 Performance dip
  if (signal.type === "PERF_DIP") {
    const delta = signal.payload?.delta_pct
      ? Math.abs(signal.payload.delta_pct * 100).toFixed(0)
      : null;

    return `Detected performance drop${delta ? ` of ${delta}%` : ""}, prompting corrective action`;
  }

  // 🎯 Event
  if (signal.type === "EVENT") {
    return "Leveraging time-sensitive event to capture immediate demand";
  }

  // 🔁 Customer recall
  if (signal.type === "CUSTOMER_RECALL") {
    return "Customer is due for service, prompting timely follow-up to drive retention";
  }

  // 🆚 Competitor
  if (signal.type === "COMPETITOR") {
    return "Nearby competitor activity detected, prompting competitive response";
  }

  return "Selected most relevant signal based on trigger and merchant context";
};