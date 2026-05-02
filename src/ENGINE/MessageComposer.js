import { pickBestOffer } from "./OfferPicker.js";
import { deriveAudience } from "./CustomerIntent.js";
import { buildCustomerMessage } from "./CustomerMessageBuilder.js";

/**
 * Composes the final message body sent to the merchant.
 * Optimized for Specificity, Social Proof, and Category Fit.
 */
export const composeMessage = ({ strategy, trigger, merchant, category, customer }) => {
  if (!strategy) return null;

  // 1. Resolve Voice & Identity
  const owner = merchant.identity?.owner_first_name || "Owner";
  const name = merchant.category_slug === "dentists" ? `Dr. ${owner}` : owner;
  
  // 2. Resolve Domain Anchors[cite: 3, 20]
  const offer = pickBestOffer(merchant, category);
  const ctr = merchant.performance?.ctr ? (merchant.performance.ctr * 100).toFixed(1) : null;
  const peerCtr = category.peer_stats?.avg_ctr ? (category.peer_stats.avg_ctr * 100).toFixed(1) : null;
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

  // 🔬 1. RESEARCH → INSIGHT → ACTION (Factual Grounding)
  if (strategy.template === "insight_action") {
    const insight = category.digest?.find(d => d.id === trigger.payload?.top_item_id);

    if (isCustomerMessage && insight) {
      const draft = buildCustomerMessage({ customer, merchant, offer, category });
      return `${name}, ${customerName} fits the ${insight.source || 'latest research'} insight: "${insight.title}".

I’ve drafted a message for them:
"${draft}"

Send this as-is, or want me to tweak it?`;
    }

    if (!insight) {
      return `${name}, I found a strong clinical insight to improve engagement. ${
        offer ? `"${offer.title}" can be used here.` : ""
      } Want me to turn this into a targeted message and drive bookings this week?`;
    }

    // Anchor on verifiability: Cite the source directly
    const citation = insight.source ? ` (${insight.source})` : "";
    return `${name}, ${insight.title}${citation}. ${
      ctr && peerCtr
        ? `Your CTR is ${ctr}% vs ${peerCtr}% for local peers${ctr < peerCtr ? " (below median)" : ""}.`
        : ""
    } Want me to turn this into a targeted recall for ${audience} and drive bookings this week?`;
  }

  // 📉 2. PERFORMANCE DIP → LOSS AVERSION + SOCIAL PROOF
  if (strategy.template === "problem_solution") {
    const metric = trigger.payload?.metric || "performance";
    const delta = trigger.payload?.delta_pct ? Math.abs(trigger.payload.delta_pct * 100).toFixed(0) : null;

    if (isCustomerMessage) {
      const draft = buildCustomerMessage({ customer, merchant, offer, category });
      return `${name}, ${customerName} is likely due for a revisit (${customer.state || "recent inactivity"}).

I’ve drafted a reminder for them:
"${draft}"

Send this as-is, or want me to tweak it?`;
    }

    // Leverage Social Proof if peer stats exist[cite: 1, 4]
    const socialProof = peerCtr ? ` Local peers are averaging a ${peerCtr}% CTR.` : "";
    return `${name}, your ${metric} dropped ${delta}% this week—you're likely missing high-intent ${audience}.${socialProof} ${
      offer
        ? `"${offer.title}" is active but might need a stronger hook to reach the right ${audienceWord}.`
        : `Most successful peers use a simple entry offer to capture demand.`
    } Want me to draft a targeted message for ${audience} today?`;
  }

  // 🎯 3. EVENT → TIMING → DEMAND SPIKE[cite: 1, 3]
  if (strategy.template === "event_push") {
    const event = trigger.payload?.match || trigger.payload?.festival || "upcoming event";
    const time = trigger.payload?.match_time_iso ? 
      new Date(trigger.payload.match_time_iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

    return `${name}, ${event}${time ? ` at ${time}` : ""} is expected to drive ~1.5x demand spike. ${
      offer ? `We can leverage your "${offer.title}" here.` : ""
    } Want me to push a timely message to nearby ${audienceWord} and capture this demand?`;
  }

  // 🔁 4. CUSTOMER RECALL (Personalization)[cite: 1, 4]
  if (strategy.template === "customer_recall") {
    const service = trigger.payload?.service_due || "a visit";

    if (isCustomerMessage) {
      const draft = buildCustomerMessage({ customer, merchant, offer, category });
      return `${name}, ${customerName} is due for their ${service} recall.

I’ve drafted this reminder:
"${draft}"

Send this as-is, or want me to tweak it?`;
    }

    return `${name}, some ${audienceWord} are due for ${service} recalls. ${
      offer ? `"${offer.title}" is a great incentive for them.` : ""
    } Want me to send a recall message targeting ${audience} with 2–3 available time slots?`;
  }

  // 🆚 5. COMPETITOR RESPONSE (Comparison Lever)[cite: 1, 4]
  if (strategy.template === "competitor_response") {
    const comp = trigger.payload;
    const proximity = comp?.distance_km ? `${comp.distance_km}km away` : "nearby";

    return `${name}, ${comp?.competitor_name || 'A new competitor'} opened ${proximity} offering ${comp?.their_offer || 'a similar service'}. ${
      offer ? `Your current "${offer.title}" is strong.` : "You currently have no active offer to counter this."
    } Want me to respond with a stronger hook for nearby ${audienceWord} before they capture the market?`;
  }

  return `${name}, I found an opportunity to improve your listing's performance. Want me to act on it?`;
};