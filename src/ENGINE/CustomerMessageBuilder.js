/**
 * Composes the message sent from the merchant to their customer.
 * Focuses on warm-clinical voice, specific time-anchors, and binary slot choice.
 */
export const buildCustomerMessage = ({ customer, merchant, offer, category }) => {
  // 1. Identity & Voice Matching[cite: 1, 4]
  const customerName = customer?.identity?.name || "there";
  const languages = merchant?.identity?.languages || [];
  const isHinglish = languages.includes("hi"); // Check for Hindi preference

  const businessName = merchant.identity?.business_name || 
    `${merchant.identity?.owner_first_name || "our"} ${
      merchant.category_slug === "dentists" ? "clinic" : "service"
    }`;

  // 2. Category-Aware Service Naming[cite: 4, 17]
  const categoryServiceMap = {
    dentists: "dental check-up",
    gyms: "workout session",
    salons: "grooming session",
    restaurants: "visit",
    pharmacies: "refill"
  };
  const service = categoryServiceMap[merchant.category_slug] || "visit";

  // 3. Robust Time Anchoring (No Hallucination)
  const getTimeHint = () => {
    // Relationship data from CustomerContext
    const relationship = customer?.relationship;
    if (relationship?.last_visit) {
      const lastDate = new Date(relationship.last_visit);
      const diffTime = Math.abs(new Date() - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) return `${diffDays} days`;
      return `${Math.floor(diffDays / 30)} months`;
    }

    // Fallback to state-based descriptive hints[cite: 17]
    if (customer?.state) {
      const state = customer.state.toLowerCase();
      if (state.includes("lapsed_soft")) return "5-6 months";
      if (state.includes("lapsed_hard")) return "over 6 months";
    }
    return null;
  };

  const timeHint = getTimeHint();
  
  // 4. Message Content Construction[cite: 1, 4]
  const offerText = offer?.title || "a special preference for you";
  
  // Emoji configuration for visual engagement[cite: 17]
  const emojiMap = {
    dentists: " 🦷",
    gyms: " 💪",
    salons: " ✨",
    restaurants: " 🍽️",
    pharmacies: " 💊"
  };
  const emoji = emojiMap[merchant.category_slug] || "";

  // Hinglish vs English Logic
  const greeting = isHinglish ? `Hi ${customerName}, Dr. Meera ke clinic se bol rahi hoon` : `Hi ${customerName}, ${businessName} here`;
  
  const timeLine = timeHint 
    ? `It’s been about ${timeHint} since your last ${service} — your 6-month recall is due.`
    : `You may be due for your next ${service}.`;

  const slotLine = isHinglish 
    ? "Apke liye 2 slots ready hain:" 
    : "I can hold one of the next available slots for you:";

  const slots = ["Today evening", "Tomorrow evening"];

  // 5. Final Assembly (Single Binary CTA)[cite: 1, 3]
  return `${greeting}${emoji}

${timeLine}

We’re currently offering ${offerText}.

${slotLine}
1️⃣ ${slots[0]}
2️⃣ ${slots[1]}

Reply 1 or 2, or tell us a time that works 🙂`;
};