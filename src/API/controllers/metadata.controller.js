/**
 * Provides bot identity and architectural details to the judge harness.
 * Highlights the deterministic logic used to solve production pain points.
 */
export const metadataController = (req, res) => {
  return res.json({
    team_name: "Hrishikesh Bhatia",
    team_members: ["Hrishikesh Bhatia"],
    model: "deterministic-engine-v1",

    approach: [
      "4-Context Composition Framework: strictly isolating Category, Merchant, Trigger, and Customer data[cite: 1, 3]",
      "Deterministic Decision Engine: prioritizing signal selection (Research, Performance, Events) with urgency-aware logic[cite: 1, 23]",
      "Semantic Intent Parsing: multi-turn state machine to detect auto-replies, intent transitions, and hostile exits[cite: 1, 14]",
      "Specific Anchor Logic: grounding every message in verifiable facts (performance numbers, dates, or research citations)[cite: 1, 3]",
      "Category-Aware Voice matching: peer-clinical tone for dentists/pharmacies vs. retail-promo for restaurants[cite: 1, 4]",
      "Suppression Management: global key-tracking to prevent duplicate messaging and anti-repetition penalties[cite: 1, 25]",
      "Customer-facing capability: on-behalf-of-merchant messaging driven by lapse thresholds and recall windows[cite: 1, 4]",
      "Structured Rationale Generation: providing per-action explanations for scoring transparency[cite: 1, 21]"
    ].join("; "),

    capabilities: [
      "Deterministic Multi-turn handling with graceful exit on auto-reply detection[cite: 1, 14]",
      "High-fidelity context ingestion (Version-controlled idempotent updates)[cite: 2, 11]",
      "Category-specific offer optimization (Merchant active-offer vs. vertical-catalog fallback)[cite: 20]",
      "Urgency-prioritized proactive engagement (20-action cap compliant)[cite: 2, 15]",
      "Personalized customer outreach with preference and language-mix honoring[cite: 1, 3]",
      "Stateless logic with state-assisted conversation history tracking[cite: 14, 28]"
    ],

    version: "1.2.0" // Incremented version to reflect architectural updates
  });
};