import { pickBestOffer } from "./OfferPicker.js";

export const composeMessage = ({ strategy, trigger, merchant, category }) => {

  if (!strategy) return null;

  const owner = merchant.identity?.owner_first_name || "Owner";
  const name =
    merchant.category_slug === "dentists"
      ? `Dr. ${owner}`
      : owner;

  const offer = pickBestOffer(merchant, category);

  const ctr = merchant.performance?.ctr
    ? (merchant.performance.ctr * 100).toFixed(1)
    : null;

  const peerCtr = category.peer_stats?.avg_ctr
    ? (category.peer_stats.avg_ctr * 100).toFixed(1)
    : null;

  // 🔥 STEP 2 — urgency helper
  const urgencyText =
    (trigger.urgency || 0) >= 4 ? " today" : "";

  // 🔬 1. RESEARCH TEMPLATE
  if (strategy.template === "insight_action") {

    const insight = category.digest?.find(
      d => d.id === trigger.payload?.top_item_id
    );

    if (!insight) return null;

    return `${name}, ${insight.title}. ${
      ctr && peerCtr
        ? `Your CTR is ${ctr}% vs ${peerCtr}% peers${ctr < peerCtr ? " (below median)" : ""}.`
        : ""
    } ${
      offer ? `You already have "${offer.title}".` : ""
    } Want me to send this as a recall message to recent patients${urgencyText}?`;
  }

  // 📉 2. PERFORMANCE DIP
  if (strategy.template === "problem_solution") {

    const metric = trigger.payload?.metric || "performance";
    const delta = trigger.payload?.delta_pct
      ? Math.abs(trigger.payload.delta_pct * 100).toFixed(0)
      : null;

    return `${name}, your ${metric} ${
      delta ? `dropped ${delta}%` : "has dropped"
    } this week. ${
      offer
        ? `"${offer.title}" is live but underperforming — want me to push it to high-intent users${urgencyText}?`
        : `Most peers convert with a simple ₹299-style hook — want me to set one up quickly${urgencyText}?`
    }`;
  }

  // 🎯 3. EVENT TEMPLATE
  if (strategy.template === "event_push") {

    const event = trigger.payload?.match || trigger.payload?.festival || "upcoming event";
    const time = trigger.payload?.match_time_iso
      ? new Date(trigger.payload.match_time_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "";

    return `${name}, ${event} ${time ? `at ${time}` : ""}. These usually drive ~1.5x demand. ${
      offer ? `You already have "${offer.title}".` : ""
    } Want me to push a message now${urgencyText}?`;
  }

  // 🔁 4. CUSTOMER RECALL
  if (strategy.template === "customer_recall") {

    const slots = trigger.payload?.available_slots || [];

    const slotText =
      slots.length >= 2
        ? `${slots[0].label} or ${slots[1].label}`
        : slots.length === 1
        ? slots[0].label
        : "available slots";

    return `This customer is due for ${trigger.payload?.service_due || "a visit"}. You have ${slotText}. Want me to send a reminder${urgencyText}?`;
  }

  // 🆚 5. COMPETITOR RESPONSE
  if (strategy.template === "competitor_response") {

    const comp = trigger.payload;

    return `${name}, ${comp?.competitor_name} opened ${comp?.distance_km}km away offering ${comp?.their_offer}. ${
      offer ? `You have "${offer.title}".` : "You have no active offer."
    } Want me to respond with a stronger hook${urgencyText}?`;
  }

  return null;
};