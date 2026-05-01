import { contextStore } from "../../STORE/context.store.js";
import { compose } from "../../ENGINE/DecisionEngine.js";

export const handleTick = (req, res) => {
  const { available_triggers } = req.body;

  const actions = [];

  if (!available_triggers || available_triggers.length === 0) {
    return res.json({ actions: [] });
  }

  for (let trigger of available_triggers) {

    // 🔥 1. Get merchant (IMPORTANT)
    const merchant = contextStore.merchant?.[trigger.merchant_id];

    if (!merchant) continue;

    // 🔥 2. Get category from merchant
    const category = contextStore.category?.[merchant.category_slug];

    if (!category) continue;

    // 🔥 3. Compose decision
    const decision = compose({
      trigger,
      merchant,
      category
    });

    if (!decision) continue;

    actions.push({
      merchant_id: merchant.merchant_id,
      trigger_id: trigger.id,
      ...decision
    });
  }

  // 🔥 4. Sort by urgency (important)
  actions.sort((a, b) => {
    const tA = available_triggers.find(t => t.id === a.trigger_id);
    const tB = available_triggers.find(t => t.id === b.trigger_id);
    return (tB?.urgency || 0) - (tA?.urgency || 0);
  });

  // 🔥 5. Limit actions
  return res.json({
    actions: actions.slice(0, 20)
  });
};