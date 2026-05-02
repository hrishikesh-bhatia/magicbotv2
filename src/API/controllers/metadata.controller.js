export const metadataController = (req, res) => {
  return res.json({
    team_name: "Hrishikesh Bhatia",
    team_members: ["Hrishikesh Bhatia"],
    model: "deterministic-engine-v1",

    approach: [
      "Deterministic decision engine for real-time merchant engagement",
      "Signal selection layer (research, performance dip, events) with urgency-aware prioritization",
      "Strategy mapping → template selection → message composition pipeline",
      "Category-aware templating (dentists, gyms, salons, restaurants, pharmacies)",
      "Customer-aware personalization (state, recency, preferences, offers)",
      "Offer optimization via active-offer selection and fallback catalog",
      "Lightweight semantic intent parsing for replies (positive, hostile, auto-reply, clarification, tweak, refinement)",
      "Stateful conversation handling with turn-based control and deterministic transitions",
      "Auto-reply detection with escalation (send → wait → end)",
      "Suppression keys to avoid spam / duplicate messaging",
      "Structured rationale generation for explainability",
      "LLM-ready architecture (optional final-layer enhancement, not required for core flow)"
    ].join("; "),

    capabilities: [
      "Multi-turn conversation handling",
      "Context ingestion (category, merchant, customer)",
      "Trigger-driven action generation",
      "Personalized message drafting with CTA optimization",
      "Robust fallback handling and edge-case coverage",
      "Production-ready stateless + state-assisted hybrid design"
    ],

    version: "1.1.0"
  });
};