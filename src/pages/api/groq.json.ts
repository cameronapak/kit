import type { APIRoute } from "astro";
import Groq from "groq-sdk";

// Rate limit settings
const RATE_LIMIT = 5; // requests
const TIME_WINDOW = 60 * 1000; // 1 minute in milliseconds

// In-memory store for rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();

// Clean up old entries every hour
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimit.entries()) {
      if (now - value.timestamp > TIME_WINDOW) {
        rateLimit.delete(key);
      }
    }
  },
  60 * 60 * 1000
);

function getRateLimitInfo(ip: string): { isAllowed: boolean; remainingRequests: number } {
  const now = Date.now();
  const userRateLimit = rateLimit.get(ip);

  if (!userRateLimit) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return { isAllowed: true, remainingRequests: RATE_LIMIT - 1 };
  }

  if (now - userRateLimit.timestamp > TIME_WINDOW) {
    // Reset if time window has passed
    rateLimit.set(ip, { count: 1, timestamp: now });
    return { isAllowed: true, remainingRequests: RATE_LIMIT - 1 };
  }

  if (userRateLimit.count >= RATE_LIMIT) {
    return { isAllowed: false, remainingRequests: 0 };
  }

  // Increment count
  userRateLimit.count += 1;
  rateLimit.set(ip, userRateLimit);
  return { isAllowed: true, remainingRequests: RATE_LIMIT - userRateLimit.count };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Rate limit check
    const { isAllowed, remainingRequests } = getRateLimitInfo(clientAddress);

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": remainingRequests.toString(),
          "X-RateLimit-Reset": (Date.now() + TIME_WINDOW).toString()
        }
      });
    }

    const groq = new Groq({
      apiKey: import.meta.env.GROQ_API_KEY
    });

    const { userPrompt, systemPrompt } = await request.json();

    if (!userPrompt || !systemPrompt) {
      return new Response(JSON.stringify({ error: "User and system prompts are required" }), { status: 400 });
    }

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: "llama3-8b-8192"
    });

    const message = response.choices[0].message.content?.trim();

    return new Response(
      JSON.stringify({
        message
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": remainingRequests.toString()
        }
      }
    );
  } catch (error) {
    console.error("Groq API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
