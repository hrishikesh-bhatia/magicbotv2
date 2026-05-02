import { pickBestOffer } from "./OfferPicker.js";
import { deriveAudience } from "./CustomerIntent.js";
import { buildCustomerMessage } from "./CustomerMessageBuilder.js";

export const composeMessage = ({ strategy, trigger, merchant, category, customer }) => {

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

  const audience = deriveAudience(category, trigger, merchant) || "relevant customers";

  const categorySlug = category.slug || merchant.category_slug;

  const categoryHints = {
    dentists: "patients",
    gyms: "members",
    restaurants: "customers",
    salons: "clients",
    pharmacies: "customers"
  };

  const audienceWord = categoryHints[categorySlug] || "customers";

  const customerName = customer?.identity?.name;
  const isCustomerMessage = !!customer && !!customerName;

  // 🔬 1. RESEARCH → INSIGHT → ACTION
  if (strategy.template === "insight_action") {

    const insight = category.digest?.find(
      d => d.id === trigger.payload?.top_item_id
    );

    // 🔥 CUSTOMER MODE (FINAL)
    if (isCustomerMessage && insight) {
      const draft = buildCustomerMessage({
        customer,
        merchant,
        offer,
        category
      });

      return `${name}, ${customerName} fits this insight (${insight.title}).

I’ve drafted a message for them:

"${draft}"

Send this as-is, or want me to tweak it?`;
    }

    // fallback safe
    if (!insight) {
      return `${name}, I found a strong insight to improve engagement. ${
        offer ? `"${offer.title}" can be used here.` : ""
      } Want me to turn this into a targeted message and drive bookings this week?`;
    }

    return `${name}, ${insight.title}. ${
      ctr && peerCtr
        ? `Your CTR is ${ctr}% vs ${peerCtr}% peers${ctr < peerCtr ? " (below median)" : ""}.`
        : ""
    } ${
      offer ? `You already have "${offer.title}".` : ""
    } Want me to turn this into a targeted recall message for ${audience} and drive bookings this week?`;
  }

  // 📉 2. PERFORMANCE DIP → LOSS → ACTION
  if (strategy.template === "problem_solution") {

    const metric = trigger.payload?.metric || "performance";
    const delta = trigger.payload?.delta_pct
      ? Math.abs(trigger.payload.delta_pct * 100).toFixed(0)
      : null;

    // 🔥 CUSTOMER MODE (FINAL)
    if (isCustomerMessage) {

      const draft = buildCustomerMessage({
        customer,
        merchant,
        offer,
        category
      });

      return `${name}, ${customerName} is likely due for a revisit (${customer.state || "recent inactivity"}).

I’ve drafted a message for them:

"${draft}"

Send this as-is, or want me to tweak it?`;
    }

    return `${name}, your ${metric} dropped ${delta}% this week — you're likely missing high-intent ${audience}. ${
      offer
        ? `"${offer.title}" is live but underperforming — likely not reaching the right ${audienceWord}.`
        : `Most peers convert better with a simple entry offer.`
    } Want me to draft a targeted message and push it to ${audience} today?`;
  }

  // 🎯 3. EVENT → TIMING → DEMAND SPIKE
  if (strategy.template === "event_push") {

    const event = trigger.payload?.match || trigger.payload?.festival || "upcoming event";

    const time = trigger.payload?.match_time_iso
      ? new Date(trigger.payload.match_time_iso).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "";

    return `${name}, ${event}${time ? ` at ${time}` : ""} — these usually drive ~1.5x demand. ${
      offer ? `You already have "${offer.title}".` : ""
    } Want me to push a timely message to nearby ${audienceWord} and capture this spike?`;
  }

  // 🔁 4. CUSTOMER RECALL
  if (strategy.template === "customer_recall") {

    const service = trigger.payload?.service_due || "a visit";

    if (isCustomerMessage) {

      const draft = buildCustomerMessage({
        customer,
        merchant,
        offer,
        category
      });

      return `${name}, ${customerName} is due for ${service}.

I’ve drafted a reminder:

"${draft}"

Send this as-is, or want me to tweak it?`;
    }

    return `${name}, some ${audienceWord} are due for ${service}. ${
      offer ? `"${offer.title}" can work well here.` : ""
    } Want me to send a recall message targeting ${audience} and suggest 2–3 high-conversion time slots?`;
  }

  // 🆚 5. COMPETITOR RESPONSE
  if (strategy.template === "competitor_response") {

    const comp = trigger.payload;

    return `${name}, ${comp?.competitor_name} opened ${comp?.distance_km}km away offering ${comp?.their_offer}. ${
      offer ? `You have "${offer.title}".` : "You currently have no active offer."
    } Want me to respond with a stronger hook and target nearby ${audienceWord} before they capture demand?`;
  }

  return `${name}, I found an opportunity to improve performance. Want me to act on it?`;
};