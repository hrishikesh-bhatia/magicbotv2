// src/API/controllers/reply.controller.js

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

export const handleReply = (req, res) => {

  const { message, turn_number } = req.body;

  if (!message) {
    return res.json({
      action: "wait",
      wait_seconds: 3600,
      rationale: "Empty message received"
    });
  }

  // 🔥 1. HOSTILE → END
  if (isHostile(message)) {
    return res.json({
      action: "end",
      rationale: "Merchant explicitly opted out or expressed frustration"
    });
  }

  // 🔥 2. AUTO-REPLY HANDLING
  if (isAutoReply(message)) {

    if (turn_number <= 2) {
      return res.json({
        action: "send",
        body: "Looks like an auto-reply 😊 When you see this, just reply YES and I’ll proceed.",
        cta: "binary_yes_no",
        rationale: "Detected auto-reply; prompting owner"
      });
    }

    if (turn_number === 3) {
      return res.json({
        action: "wait",
        wait_seconds: 86400,
        rationale: "Repeated auto-reply; waiting for human response"
      });
    }

    return res.json({
      action: "end",
      rationale: "Multiple auto-replies with no engagement"
    });
  }

  // 🔥 3. OFF-TOPIC
  if (isOffTopic(message)) {
    return res.json({
      action: "send",
      body: "I’ll have to leave that to a specialist 😄 Coming back — want me to proceed with the message we discussed?",
      cta: "yes_no",
      rationale: "Out-of-scope query redirected"
    });
  }

  // 🔥 4. POSITIVE INTENT → EXECUTION MODE
  if (isPositive(message)) {
    return res.json({
      action: "send",
      body: "Great — I’ll draft and prepare everything for you. I’ll keep it short, targeted, and ready to send. Want me to proceed?",
      cta: "binary_yes_no",
      rationale: "Merchant intent confirmed; moving to execution"
    });
  }

  // 🔥 5. CLARIFICATION
  if (isClarification(message)) {
    return res.json({
      action: "send",
      body: "I’ll keep it simple — short message, clear offer, and targeted to high-intent customers. Want me to draft it for you?",
      cta: "yes_no",
      rationale: "Merchant seeking clarity"
    });
  }

  // 🔥 6. FALLBACK → KEEP FLOW ALIVE
  return res.json({
    action: "send",
    body: "Got it — want me to go ahead and draft the message for you?",
    cta: "yes_no",
    rationale: "Fallback engagement"
  });
};