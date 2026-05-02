import dotenv from "dotenv";
dotenv.config();

/**
 * classifyIntent
 * Sends the merchant message to Groq for sub-second, high-accuracy categorization.
 * Optimized with Few-Shot examples for Indian merchant context and Hinglish.
 */
export const classifyIntent = async (message) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s Safety Timeout

  try {
    const url = process.env.LLM_MODEL_URL || "https://api.groq.com/openai/v1/chat/completions";
    const apiKey = process.env.LLM_API_KEY;

    const categories = ["POSITIVE", "HOSTILE", "AUTO_REPLY", "CLARIFICATION", "TWEAK", "REFINEMENT", "OFF_TOPIC", "UNKNOWN"];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an expert Intent Classifier for a Merchant Marketing AI. 
            Classify the message into EXACTLY one category from this list:
            
            - POSITIVE: User says yes, okay, theek hai, bhej do, go ahead, sounds good.
            - HOSTILE: User says stop, spam, not interested, don't message me, useless.
            - AUTO_REPLY: Automated "Out of office", "busy in a meeting", or "will respond shortly".
            - CLARIFICATION: User asks "how does this work?", "who are you?", "explain this", "kya hai ye?".
            - TWEAK: User wants to change the offer, price, or timing (e.g., "change to 20%", "do it tomorrow").
            - REFINEMENT: User wants to change the style (e.g., "make it shorter", "add emojis", "less formal").
            - OFF_TOPIC: User asks about GST, taxes, accounting, bank accounts, or technical support.
            - UNKNOWN: Anything else that doesn't fit the above.

            Output ONLY the category name in UPPERCASE. Do not provide any explanation or extra text.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.0,
        max_tokens: 10
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Extracting choice from Groq/OpenAI response format
    const rawResult = data.choices?.[0]?.message?.content || "UNKNOWN";
    
    // Clean string (remove punctuation or extra whitespace often returned by smaller models)
    const cleanedResult = rawResult.replace(/[^\w\s]/gi, '').trim().toUpperCase();

    return categories.includes(cleanedResult) ? cleanedResult : "UNKNOWN";

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("[LLM] Groq request timed out. Falling back to Keyword Engine.");
    } else {
      console.error("[LLM] Connection error:", error.message);
    }
    return "UNKNOWN";
  }
};