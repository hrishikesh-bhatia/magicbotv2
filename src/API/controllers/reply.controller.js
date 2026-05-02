import { conversationStore } from "../../STORE/conversation.store.js";

// ---------- Intent detectors ----------

const isAutoReply = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("thank you for contacting") ||
    text.includes("we will respond shortly") ||
    text.includes("auto-reply") ||
    text.includes("out of office")
  );
};

const isHostile = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("stop") ||
    text.includes("don't message") ||
    text.includes("dont message") ||
    text.includes("spam") ||
    text.includes("useless") ||
    text.includes("not interested")
  );
};

const isPositive = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("yes") ||
    text.includes("ok") ||
    text.includes("okay") ||
    text.includes("let's do it") ||
    text.includes("lets do it") ||
    text.includes("go ahead") ||
    text.includes("sure")
  );
};

const isClarification = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("what") ||
    text.includes("how") ||
    text.includes("why") ||
    text.includes("explain")
  );
};

const isOffTopic = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("gst") ||
    text.includes("tax") ||
    text.includes("accounting")
  );
};

const isTweak = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("tweak") ||
    text.includes("change") ||
    text.includes("edit") ||
    text.includes("modify") ||
    text.includes("different") ||
    text.includes("not this") ||
    text.includes("improve")
  );
};

const isRefinement = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("short") ||
    text.includes("long") ||
    text.includes("tone") ||
    text.includes("emoji") ||
    text.includes("formal") ||
    text.includes("casual")
  );
};

// ---------- Controller ----------

export const handleReply = (req, res) => {
  const { conversation_id, message, turn_number } = req.body;

  if (!conversation_id) {
    return res.json({
      action: "wait",
      wait_seconds: 3600,
      rationale: "Missing conversation_id"
    });
  }

  if (!conversationStore[conversation_id]) {
    conversationStore[conversation_id] = {
      last_intent: null,
      last_action: null,
      pending_edit: null
    };
  }

  const state = conversationStore[conversation_id];

  if (!message) {
    return res.json({
      action: "wait",
      wait_seconds: 3600,
      rationale: "Empty message"
    });
  }

  const msg = message.toLowerCase();

  // ---------- 1. HOSTILE ----------
  if (isHostile(msg)) {
    state.last_intent = "hostile";
    state.last_action = "end";

    return res.json({
      action: "end",
      rationale: "Merchant opted out"
    });
  }

  // ---------- 2. AUTO REPLY ----------
  if (isAutoReply(msg)) {
    state.last_intent = "auto_reply";

    if (turn_number === 1) {
      state.last_action = "send";
      return res.json({
        action: "send",
        body: "Looks like an auto-reply 😊 When you see this, just reply YES and I’ll proceed.",
        cta: "yes_no",
        rationale: "Detected auto-reply (first)"
      });
    }

    if (turn_number === 2) {
      state.last_action = "wait";
      return res.json({
        action: "wait",
        wait_seconds: 86400,
        rationale: "Repeated auto-reply → waiting"
      });
    }

    state.last_action = "end";
    return res.json({
      action: "end",
      rationale: "Multiple auto-replies → ending"
    });
  }

  // 🔥 PRIORITY FIX: HANDLE REFINEMENT CONFIRMATION
  if (state.last_intent === "refinement" && isPositive(msg)) {
    state.last_action = "send";

    return res.json({
      action: "send",
      body: "Great — I’ve updated the message based on your preference. I’ll proceed with this version.",
      cta: "none",
      rationale: "Confirmed refined message"
    });
  }

  // 🔥 HANDLE TWEAK INSTRUCTION FLOW
  if (state.last_intent === "tweak" && !isPositive(msg)) {
    state.pending_edit = msg;
    state.last_intent = "refinement";
    state.last_action = "send";

    return res.json({
      action: "send",
      body: "Got it — I’ll apply that change. Want me to share the updated version?",
      cta: "yes_no",
      rationale: "Captured tweak instruction"
    });
  }

  // ---------- 3. OFF-TOPIC ----------
  if (isOffTopic(msg)) {
    state.last_intent = "off_topic";
    state.last_action = "send";

    return res.json({
      action: "send",
      body: "I’ll have to leave that to your CA 😄 Coming back — want me to proceed with the message we discussed?",
      cta: "yes_no",
      rationale: "Out-of-scope query"
    });
  }

  // ---------- 4. POSITIVE ----------
  if (isPositive(msg)) {
    state.last_intent = "positive";

    if (state.last_action === "send") {
      return res.json({
        action: "send",
        body: "Perfect — I’m preparing it now. I’ll keep it concise and ready. Want me to confirm before sending?",
        cta: "yes_no",
        rationale: "Continue execution"
      });
    }

    state.last_action = "send";

    return res.json({
      action: "send",
      body: "Great — I’ll draft everything and keep it short, targeted, and ready. Want me to proceed?",
      cta: "yes_no",
      rationale: "Intent confirmed"
    });
  }

  // ---------- 5. CLARIFICATION ----------
  if (isClarification(msg)) {
    state.last_intent = "clarification";
    state.last_action = "send";

    return res.json({
      action: "send",
      body: "I’ll keep it simple — short message, clear offer, and targeted to high-intent customers. Want me to draft it?",
      cta: "yes_no",
      rationale: "Clarification"
    });
  }

  // ---------- 6. TWEAK ----------
  if (isTweak(msg)) {
    state.last_intent = "tweak";
    state.last_action = "send";
    state.pending_edit = msg;

    return res.json({
      action: "send",
      body: "Got it — what would you like me to change? I can adjust tone, length, offer, or targeting.",
      cta: "none",
      rationale: "Edit requested"
    });
  }

  // ---------- 7. REFINEMENT ----------
  if (isRefinement(msg)) {
    state.last_intent = "refinement";
    state.last_action = "send";

    return res.json({
      action: "send",
      body: "Done — I’ll refine it accordingly. Want me to share the updated version?",
      cta: "yes_no",
      rationale: "Refinement applied"
    });
  }

  // ---------- 8. FALLBACK ----------
  state.last_intent = "unknown";
  state.last_action = "send";

  return res.json({
    action: "send",
    body: "Got it — want me to go ahead and draft the message for you?",
    cta: "yes_no",
    rationale: "Fallback"
  });
};