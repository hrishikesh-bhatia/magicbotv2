import { conversationStore } from "../../STORE/conversation.store.js";
import { classifyIntent } from "../../ENGINE/IntentClassifier.js";

// ---------- Keyword Detectors (Safety Fallbacks) ----------
const isAutoReply = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("thank you for contacting") ||
    text.includes("we will respond shortly") ||
    text.includes("auto-reply") ||
    text.includes("out of office") ||
    text.includes("automated assistant") ||
    text.includes("busy in a meeting") || 
    text.includes("get back to you")
  );
};

const isHostile = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("stop") ||
    text.includes("don't message") ||
    text.includes("spam") ||
    text.includes("not interested")
  );
};

const isPositive = (msg) => {
  const text = msg.toLowerCase();
  return (
    text.includes("yes") ||
    text.includes("ok") ||
    text.includes("theek hai") || 
    text.includes("bhej do") || 
    text.includes("go ahead")
  );
};

// ---------- Controller ----------

export const handleReply = async (req, res) => {
  const { conversation_id, message, turn_number } = req.body;

  if (!conversation_id) {
    return res.json({
      action: "wait",
      wait_seconds: 3600,
      rationale: "Missing conversation_id"
    });
  }

  // 1. Initialize or retrieve conversation state
  if (!conversationStore[conversation_id]) {
    conversationStore[conversation_id] = {
      last_intent: null,
      last_action: null,
      pending_edit: null,
      turn_count: 0
    };
  }

  const state = conversationStore[conversation_id];
  state.turn_count = turn_number || state.turn_count + 1;

  if (!message) {
    return res.json({
      action: "wait",
      wait_seconds: 3600,
      rationale: "Empty message received"
    });
  }

  // CRITICAL FIX: Define 'msg' before using it in Section 3
  const msg = message.toLowerCase();

  // 2. PRIMARY INTENT: LLM Classification
  let intent = "UNKNOWN";
  try {
    intent = await classifyIntent(message);
  } catch (error) {
    console.error("[LLM ERROR] Falling back to keywords:", error.message);
    intent = "UNKNOWN";
  }

  // 3. SECONDARY INTENT: Keyword Fallback
  if (intent === "UNKNOWN") {
    if (isHostile(msg)) intent = "HOSTILE";
    else if (isAutoReply(msg)) intent = "AUTO_REPLY";
    else if (isPositive(msg)) intent = "POSITIVE";
    else if (msg.includes("change") || msg.includes("edit") || msg.includes("tweak")) intent = "TWEAK";
    else if (msg.includes("short") || msg.includes("emoji") || msg.includes("tone")) intent = "REFINEMENT";
  }

// ---------- 4. DETERMINISTIC STATE MACHINE ----------

  // --- 0. CAPTURE CUSTOM DRAFT (CRITICAL FIX: MOVE TO TOP) ---
  // If we were waiting for them to type their version, grab whatever they send next.
  if (state.last_intent === "awaiting_draft") {
    state.last_intent = "approval_pending";
    state.last_action = "send";
    state.pending_edit = message; 

    return res.json({
      action: "send",
      body: `Perfect. I've updated the campaign with your exact text: \n\n"${message}" \n\nReady to launch this version to your customers?`,
      cta: "yes_no",
      rationale: "Priority Capture: Successfully grabbed merchant-provided draft from state."
    });
  }

  // --- 1. HOSTILE / OPT-OUT ---
  if (intent === "HOSTILE") {
    state.last_intent = "hostile";
    state.last_action = "end";
    return res.json({
      action: "end",
      rationale: "Merchant opted out or signaled disinterest"
    });
  }

  // --- 2. AUTO REPLY DETECTION ---
  if (intent === "AUTO_REPLY") {
    state.last_intent = "auto_reply";
    if (state.turn_count <= 2) {
      state.last_action = "send";
      return res.json({
        action: "send",
        body: "Looks like an auto-reply 😊 When you see this, just reply YES and I’ll proceed.",
        cta: "yes_no",
        rationale: "Handling automated responses"
      });
    }
    if (state.turn_count === 3) {
      state.last_action = "wait";
      return res.json({ action: "wait", wait_seconds: 86400, rationale: "Repeated auto-reply backoff" });
    }
    state.last_action = "end";
    return res.json({ action: "end", rationale: "Multiple auto-replies; exiting" });
  }

  // --- 3. TWEAK / REFINEMENT REQUESTED ---
  if (intent === "TWEAK" || intent === "REFINEMENT") {
    state.last_intent = "awaiting_draft"; 
    state.last_action = "send";

    return res.json({
      action: "send",
      body: "Got it. To make sure it's exactly how you want it, please reply with the updated message text here. I'll then set it up for your customers!",
      cta: "none", 
      rationale: "Empowering merchant to provide final draft for 100% accuracy."
    });
  }

  // --- 4. OFF-TOPIC REDIRECTION ---
  if (intent === "OFF_TOPIC") {
    state.last_intent = "off_topic";
    state.last_action = "send";
    return res.json({
      action: "send",
      body: "I’m focused on your marketing, so I’ll leave the other details to the experts! 😄 Shall I proceed with our draft?",
      cta: "yes_no",
      rationale: "Redirection to core mission"
    });
  }

  // --- 5. POSITIVE INTENT (Approval & Final Launch) ---
  if (intent === "POSITIVE") {
    // FINAL EXIT: If they say YES to the "One last check"
    if (state.last_intent === "final_confirmation") {
      state.last_intent = "completed";
      state.last_action = "end";
      return res.json({
        action: "end",
        body: "All systems go! 🚀 Your campaign is being launched now. I'll notify you once it's complete.",
        rationale: "Merchant gave final approval; ending conversation loop."
      });
    }

    // STEP-DOWN APPROVAL: From 'Ready to launch?' to 'One last check'
    if (state.last_intent === "approval_pending" || state.last_action === "send") {
      state.last_intent = "final_confirmation";
      state.last_action = "send";
      return res.json({
        action: "send",
        body: "Great. I'm finalizing the targeting now. One last check—ready to launch?",
        cta: "yes_no",
        rationale: "Final confirmation flow before execution"
      });
    }

    state.last_intent = "positive";
    state.last_action = "send";
    return res.json({
      action: "send",
      body: "Great! I'll draft the message now. I'll make sure it's targeted. Ready?",
      cta: "yes_no",
      rationale: "Moving to composition"
    });
  }

  // --- 6. CLARIFICATION ---
  if (intent === "CLARIFICATION") {
    state.last_intent = "clarification";
    state.last_action = "send";
    return res.json({
      action: "send",
      body: "I’ll keep it simple: we’ll send a WhatsApp message to your lapsed customers to bring them back. Shall I draft it?",
      cta: "yes_no",
      rationale: "Providing process clarity"
    });
  }

  // --- 7. FINAL FALLBACK ---
  state.last_intent = "unknown";
  state.last_action = "send";
  return res.json({
    action: "send",
    body: "I want to make sure I get this right. Shall I go ahead and draft a targeted message to help bring in more customers this week?",
    cta: "yes_no",
    rationale: "Default fallback for unknown intent"
  });
};