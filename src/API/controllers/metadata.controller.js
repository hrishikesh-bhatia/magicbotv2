/**
 * Provides bot identity and architectural details to the judge harness.
 * Highlights the deterministic logic used to solve production pain points.
 */
export const metadataController = (req, res) => {
  return res.json({
    team_name: "Hrishikesh Bhatia",
    team_members: ["Hrishikesh Bhatia"],
    model: "Vera-Deterministic-Hybrid-v2",

    approach: [
      "Role-Aware Persona Switching: Dual-voice logic that branches between Merchant Assistant and Business Persona based on from_role",
      "100% Trigger Coverage: Implementation of a 'Golden Fallback' mechanism ensuring zero empty action arrays across all 6 trigger types",
      "Deterministic State Machine: Strict multi-turn management for Tweak Capturing, Approval Flow, and Final Confirmation",
      "Global Safety Firewall: Priority-ordered detection of Auto-Replies and Hostile exits across all roles to prevent loop penalties",
      "Context-Anchored Messaging: Grounding proactive messages in merchant-specific attributes and category-slug marketing goals",
      "Urgency-Driven Prioritization: Sorting and priority-tagging actions based on trigger urgency to maximize Decision Quality scores",
      "Idempotent Teardown Protocol: Systematic clearing of Suppression and Conversation states while preserving Merchant Context"
    ].join("; "),

    capabilities: [
      "Dual-Persona handling for Merchant-Assistant and Merchant-to-Customer communications",
      "Deterministic Tweak Capture (Capture-and-Confirm) to eliminate LLM hallucination in campaign edits",
      "Three-Strike Auto-Reply Dampening: Wait -> Backoff -> End sequence to handle automated loops",
      "High-fidelity context ingestion with version-controlled idempotent updates",
      "Urgency-prioritized proactive engagement within the 20-action cap",
      "Stateless logic supported by in-memory conversation state tracking"
    ],

    version: "2.0.0" // Major version bump to reflect Persona Switching and 100% Coverage updates
  });
};