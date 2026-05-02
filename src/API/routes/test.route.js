import express from "express";
import { compose } from "../../ENGINE/DecisionEngine.js";

const router = express.Router();

/**
 * Route: GET /test/test-compose
 * Purpose: Internal debugging to verify the Decision Engine logic.
 * Behavior: Simulates a specific (Merchant, Category, Trigger) triplet to
 * test template anchoring and rationale generation[cite: 9, 18].
 */
router.get("/test-compose", (req, res) => {

  // 1. Mock Merchant Context[cite: 1, 3, 9]
  const merchant = {
    merchant_id: "m_001_drmeera",
    category_slug: "dentists",
    identity: { 
      owner_first_name: "Meera",
      business_name: "Dr. Meera's Dental Clinic",
      languages: ["en", "hi"] // Testing Hinglish support
    },
    performance: { 
      ctr: 0.021,
      metric: "CTR"
    },
    offers: [
      { title: "Dental Cleaning @ ₹299", status: "active" }
    ]
  };

  // 2. Mock Category Context[cite: 1, 3, 9]
  const category = {
    slug: "dentists",
    peer_stats: { avg_ctr: 0.030 },
    digest: [
      {
        id: "d_2026W17_jida_fluoride",
        title: "3-month fluoride recall reduces caries recurrence by 38%",
        source: "JIDA Oct 2026, p.14" // Testing specific anchor logic
      }
    ],
    offer_catalog: [
      { title: "Dental Cleaning @ ₹299" }
    ]
  };

  // 3. Mock Trigger Context[cite: 1, 3, 9]
  const trigger = {
    id: "trg_test_001",
    kind: "research_digest",
    urgency: 3,
    payload: { 
      top_item_id: "d_2026W17_jida_fluoride" 
    },
    suppression_key: "research:test:001"
  };

  // 4. Mock Customer Context (Optional for this test)[cite: 1, 3]
  const customer = {
    identity: { name: "Priya" },
    state: "lapsed_soft",
    relationship: { last_visit: "2025-11-04" }
  };

  // Execute Composition[cite: 18]
  const result = compose({ trigger, merchant, category, customer });

  return res.json({
    test_id: "T_DEBUG_01",
    input_summary: {
      merchant: merchant.merchant_id,
      trigger: trigger.kind,
      has_customer: !!customer
    },
    output: result
  });
});

export default router;