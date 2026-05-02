export const buildCustomerMessage = ({ customer, merchant, offer }) => {

  const name = customer?.identity?.name || "there";

  const businessName =
    merchant.identity?.business_name ||
    `${merchant.identity?.owner_first_name || "our"} ${
      merchant.category_slug === "dentists" ? "clinic" : "service"
    }`;

  const offerText = offer?.title || "a special offer";

  // 🔥 Category-aware service naming
  const categoryServiceMap = {
    dentists: "check-up",
    gyms: "workout session",
    salons: "self-care session",
    restaurants: "visit",
    pharmacies: "refill"
  };

  const service = categoryServiceMap[merchant.category_slug] || "visit";

  // 🔥 Robust time hint (NO hallucination)
  const getTimeHint = () => {
    if (customer?.days_since_last_visit) {
      return `${customer.days_since_last_visit} days`;
    }

    if (customer?.weeks_since_last_visit) {
      return `${customer.weeks_since_last_visit} weeks`;
    }

    if (customer?.state) {
      const state = customer.state.toLowerCase();

      if (state.includes("lapsed")) return "a few weeks";
      if (state.includes("inactive")) return "some time";
      if (state.includes("new")) return null;
    }

    return null;
  };

  const timeHint = getTimeHint();

  const timeLine = timeHint
    ? `It’s been about ${timeHint} since your last ${service} — you may be due for one.`
    : `You may be due for a ${service}.`;

  // 🔥 Safe urgency + choice architecture
  const slots = ["today evening", "tomorrow evening"];

  // 🔥 Emoji only where it fits
  const emojiMap = {
    dentists: " 🦷",
    gyms: " 💪",
    salons: " ✨",
    restaurants: " 🍽️",
    pharmacies: " 💊"
  };

  const emoji = emojiMap[merchant.category_slug] || "";

  return `Hi ${name}, ${businessName} here${emoji}

${timeLine}

We’re currently offering ${offerText}.

I can hold one of the next available slots:
1️⃣ ${slots[0]}
2️⃣ ${slots[1]}

Reply 1 or 2, or tell me a time that works 🙂`;
};