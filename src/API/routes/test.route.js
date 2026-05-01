import express from "express";
import { compose } from "../../ENGINE/DecisionEngine.js";

const router = express.Router();

router.get("/test-compose", (req, res) => {

  // 👇 hardcode one test case (Dr. Meera)
  const merchant = {
  identity: { owner_first_name: "Meera" },
  performance: { ctr: 0.021 },
  offers: [
    { title: "Dental Cleaning @ ₹299", status: "active" }
  ]
};

const category = {
  peer_stats: { avg_ctr: 0.030 },
  digest: [
    {
      id: "d_2026W17_jida_fluoride",
      title: "3-month fluoride recall reduces caries recurrence by 38%"
    }
  ],
  offer_catalog: [
    { title: "Dental Cleaning @ ₹299" }
  ]
};

  const trigger = {
    kind: "research_digest",
    payload: { top_item_id: "d_2026W17_jida_fluoride" },
    suppression_key: "research:test"
  };

  const result = compose({ trigger, merchant, category });

  return res.json(result);
});

export default router;