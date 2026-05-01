export const handleReply = ({ message, turn_number }) => {

  const msg = message.toLowerCase();

  // 🔥 1. HOSTILE (VERY IMPORTANT)
  if (
    msg.includes("stop") ||
    msg.includes("spam") ||
    msg.includes("useless") ||
    msg.includes("don't message")
  ) {
    return {
      action: "end",
      body: "Understood — I’ll stop here. If you need anything later, I’m here.",
      rationale: "Detected hostile/opt-out intent"
    };
  }

  // 🔥 2. AUTO-REPLY DETECTION (NEW)
  if (
    msg.includes("out of office") ||
    msg.includes("auto reply") ||
    msg.includes("i am away") ||
    msg.includes("vacation")
  ) {
    return {
      action: "end",
      rationale: "Detected auto-reply pattern"
    };
  }

  // 🔥 3. TOO MANY WAITS → END
  if (turn_number && turn_number >= 3) {
    return {
      action: "end",
      rationale: "Multiple low-signal replies, ending conversation"
    };
  }

  // 🔥 4. STRONG YES (EXECUTION MODE)
  if (msg.includes("yes") || msg.includes("do it") || msg.includes("ok lets do it")) {
    return {
      action: "send",
      body: "Great — I’ll draft the message using your current offer and share it shortly for approval.",
      rationale: "User confirmed intent to proceed"
    };
  }

  // 🔥 5. NO (PIVOT)
  if (msg.includes("no")) {
    return {
      action: "send",
      body: "No problem. Want me to try a different offer or angle instead?",
      rationale: "User rejected initial suggestion"
    };
  }

  // 🔥 6. QUESTION → CLEAR ACTION
  if (msg.includes("how") || msg.includes("what")) {
    return {
      action: "send",
      body: "I’ll create a short message using your current offer and send it to high-intent users. Want me to proceed?",
      rationale: "User asked for clarification"
    };
  }

  // 🔥 7. LOW SIGNAL
  if (msg.length < 10) {
    return {
      action: "wait",
      rationale: "Low-signal response"
    };
  }

  return {
    action: "wait",
    rationale: "Unclear intent"
  };
};