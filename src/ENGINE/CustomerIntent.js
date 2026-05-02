export const deriveAudience = (category, trigger, merchant) => {

  if (trigger.kind === "perf_dip") {
    return "recent customers who haven’t revisited in the last 3–6 months";
  }

  if (trigger.kind === "research_digest") {
    return "high-risk customers who benefit from preventive care";
  }

  if (trigger.kind === "event") {
    return "nearby customers likely to act today";
  }

  return "relevant customers";
};