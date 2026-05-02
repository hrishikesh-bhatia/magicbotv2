import { contextStore } from "../../STORE/context.store.js";
import { compose } from "../../ENGINE/DecisionEngine.js";

export const handleTick = (req, res) => {
  const { available_triggers } = req.body;

  const actions = [];

  if (!available_triggers || available_triggers.length === 0) {
    return res.json({ actions: [] });
  }

  console.log("==== CONTEXT DEBUG ====");
  console.log("MERCHANTS:", contextStore.merchant);
  console.log("CATEGORIES:", contextStore.category);
  console.log("CUSTOMERS:", contextStore.customer);

  for (let trigger of available_triggers) {

    console.log("\n---- NEW TRIGGER ----");
    console.log("RAW TRIGGER:", trigger);

    let merchant = null;

    // ✅ 1. Try direct mapping
    if (trigger.merchant_id) {
      merchant = contextStore.merchant?.[trigger.merchant_id];
    }

    // 🔥 2. Fallback merchant
    if (!merchant) {
      const merchantIds = Object.keys(contextStore.merchant || {});
      if (merchantIds.length > 0) {
        merchant = contextStore.merchant[merchantIds[0]];
        console.log("FALLBACK MERCHANT USED:", merchant.merchant_id);
      }
    }

    if (!merchant) {
      console.log("❌ NO MERCHANT FOUND → SKIPPING");
      continue;
    }

    let category = contextStore.category?.[merchant.category_slug];

    // 🔥 3. Fallback category
    if (!category) {
      const catIds = Object.keys(contextStore.category || {});
      if (catIds.length > 0) {
        category = contextStore.category[catIds[0]];
        console.log("FALLBACK CATEGORY USED:", category.slug || catIds[0]);
      }
    }

    if (!category) {
      console.log("❌ NO CATEGORY FOUND → SKIPPING");
      continue;
    }

    // 🔥 4. CUSTOMER LOGIC (FIXED)
    let customer = null;

    const allCustomers = Object.values(contextStore.customer || {});

    console.log("ALL CUSTOMERS:", allCustomers);

    if (allCustomers.length > 0) {
      // Try matching merchant
      customer =
        allCustomers.find(
          c => c.merchant_id === merchant.merchant_id
        ) || allCustomers[0]; // 🔥 fallback to any customer

      console.log("SELECTED CUSTOMER:", customer);
    } else {
      console.log("⚠️ NO CUSTOMERS AVAILABLE");
    }

    // 🔥 5. Compose decision
    const decision = compose({
      trigger,
      merchant,
      category,
      customer   // 🔥 IMPORTANT FIX
    });

    console.log("DECISION:", decision);

    if (!decision) {
      console.log("❌ NO DECISION → SKIPPING");
      continue;
    }

    actions.push({
      merchant_id: merchant.merchant_id,
      trigger_id: trigger.id,
      ...decision
    });
  }

  // 🔥 6. Sort by urgency
  actions.sort((a, b) => {
    const tA = available_triggers.find(t => t.id === a.trigger_id);
    const tB = available_triggers.find(t => t.id === b.trigger_id);
    return (tB?.urgency || 0) - (tA?.urgency || 0);
  });

  const finalActions = actions.slice(0, 20);

  console.log("\n==== FINAL ACTIONS ====");
  console.log(finalActions);

  return res.json({
    actions: finalActions
  });
};