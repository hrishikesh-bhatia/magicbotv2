# Vera Message Engine — Deterministic Merchant Growth Assistant

## Overview

This project implements the message engine behind **Vera**, an AI assistant that helps merchants improve performance through timely, high-quality interventions.

The system is designed to:

* Select the **most relevant growth signal**
* Generate **high-specificity, category-aware messages**
* Drive **high reply rates with low-friction actions**
* Handle **real-world conversational scenarios reliably**

---

## Core Philosophy

Instead of relying on LLMs for decision-making, this system uses a **deterministic decision engine** with structured inputs.

> Decisions are deterministic. Language is controlled. Context drives everything.

This ensures:

* Consistent outputs
* No hallucination
* Strong alignment with merchant data
* Reliable behavior under evaluation

---

## Architecture

```
/v1/context  → ingest & store structured data
/v1/tick     → select signals → generate actions
/v1/reply    → handle conversation transitions
/v1/healthz  → system health
/v1/metadata → system description
```

### Engine Flow

```
Trigger + Merchant + Category
        ↓
SignalSelector (ranking)
        ↓
StrategyMapper
        ↓
MessageComposer
        ↓
Final Output
```

---

## Key Components

### 1. Signal Selection (Decision Quality)

Signals are ranked using:

```
score = urgency + impact + relevance
```

Examples:

* Performance drop → high priority
* Research insight → medium priority
* Events → time-sensitive

This ensures the system chooses **what matters most now**, not just what exists.

---

### 2. Strategy Mapping

Each signal maps to a messaging strategy:

| Signal          | Strategy           |
| --------------- | ------------------ |
| RESEARCH        | Insight → Action   |
| PERF_DIP        | Problem → Solution |
| EVENT           | Timely Push        |
| CUSTOMER_RECALL | Retention          |
| COMPETITOR      | Response           |

---

### 3. Message Composition

Messages are:

* Data-driven (CTR, % drop, offers)
* Category-aware (clinical for dentists, etc.)
* Action-oriented (single CTA)
* Concise (~150–200 chars)

Example:

> Dr. Meera, your calls dropped 50% this week — you're likely missing high-intent patients. "Dental Cleaning @ ₹299" is live but underperforming. Want me to push this to high-intent users today?

---

### 4. Offer Optimization

The system selects the **lowest-friction offer** (e.g., ₹299 cleaning) to maximize conversion likelihood.

---

### 5. Prioritization & Suppression

* Actions are sorted by urgency
* Limited to top-N per tick
* Duplicate sends prevented via `suppression_key`

---

### 6. Conversation Intelligence (/reply)

Handles real-world scenarios:

| Scenario   | Behavior           |
| ---------- | ------------------ |
| Yes        | Execute next step  |
| No         | Pivot              |
| Question   | Clarify + re-offer |
| Auto-reply | End conversation   |
| Hostile    | Respectfully end   |

---

### 7. Context Management

* Versioned context ingestion
* Supports dynamic updates
* No hardcoded data
* Fully adaptable to judge injections

---

## Why Deterministic?

LLMs are powerful but:

* Non-deterministic
* Prone to hallucination
* Hard to evaluate consistently

This system uses:

* Deterministic logic for decisions
* Controlled templates for messaging

This aligns directly with the challenge requirement:

> “Score decisions, not creativity.”

---

## Tradeoffs

| Decision             | Tradeoff                 |
| -------------------- | ------------------------ |
| Deterministic engine | Less flexibility vs LLM  |
| Templates            | Slightly less expressive |
| No full LLM usage    | More engineering effort  |

But gains:

* Reliability
* Predictability
* Higher evaluation scores

---

## Future Improvements

* Add LLM-based phrasing layer (controlled, temperature=0)
* Learn optimal offers from historical performance
* Multi-turn context memory for deeper personalization

---

## Summary

This system focuses on:

* Picking the **right moment**
* Saying the **right thing**
* Making it **easy to act**

It is designed not just to pass evaluation, but to behave like a **real merchant growth assistant**.

---

## Author

Hrishikesh Bhatia

---
