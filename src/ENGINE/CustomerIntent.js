/**
 * Derives a specific audience description based on the trigger kind and category.
 * Used to ground the message in "Specific Anchor Logic" for the merchant[cite: 1, 13].
 */
export const deriveAudience = (category, trigger, merchant) => {
  if (!trigger) return "relevant customers";

  const categorySlug = category?.slug || merchant?.category_slug || "general";
  
  // Mapping vertical-specific terminology for professional "Voice Matching"
  const terminology = {
    dentists: "patients",
    gyms: "members",
    salons: "clients",
    restaurants: "diners",
    pharmacies: "customers"
  };

  const audienceWord = terminology[categorySlug] || "customers";

  // 📉 1. Performance Dip -> Loss Aversion Segment[cite: 1, 4]
  if (trigger.kind === "perf_dip") {
    return `lapsed ${audienceWord} who haven’t revisited in the last 3–6 months`;
  }

  // 🔬 2. Research Digest -> High-Interest/Risk Segment[cite: 3, 19]
  if (trigger.kind === "research_digest" || trigger.kind === "category_research_digest_release") {
    if (categorySlug === "dentists") {
      return "high-risk patients who benefit most from preventive recall care";
    }
    return `highly-engaged ${audienceWord} who value professional insights`;
  }

  // 🎯 3. Events/IPL/Festivals -> Proximity Segment[cite: 3, 23]
  const eventTriggers = ["ipl_match_today", "festival_upcoming", "weather_heatwave", "event"];
  if (eventTriggers.includes(trigger.kind)) {
    return `nearby ${audienceWord} looking for timely ${categorySlug === "restaurants" ? "dining" : "service"} options`;
  }

  // 🔁 4. Customer Recall -> Specific Relationship Segment[cite: 4, 17]
  if (trigger.kind === "recall_due" || trigger.kind === "customer_lapsed_soft") {
    return `${audienceWord} currently in their 6-month recall window`;
  }

  // 🆚 5. Competitor Response -> At-Risk Segment[cite: 4, 23]
  if (trigger.kind === "competitor_opened") {
    return `local ${audienceWord} who might be exploring new options nearby`;
  }

  return `your most relevant ${audienceWord}`;
};