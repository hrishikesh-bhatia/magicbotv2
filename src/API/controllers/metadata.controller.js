export const metadataController = (req, res) => {
  return res.json({
    team_name: "Hrishikesh Bhatia",
    team_members: ["Hrishikesh Bhatia"],
    model: "deterministic-engine-v1",
    approach:
"Hybrid deterministic engine: signal scoring (urgency + impact), strategy mapping, category-aware templating, offer optimization, and reply-state handling with suppression control",
    version: "1.0.0"
  });
};