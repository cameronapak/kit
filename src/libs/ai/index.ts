import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY
});

const GROQ_GUARD_MODEL = "openai/gpt-oss-safeguard-20b";

// https://console.groq.com/docs/content-moderation
export async function isContentAppropriate(content: string): Promise<boolean> {
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content }],
    model: GROQ_GUARD_MODEL
  });

  const message = response.choices[0].message.content?.trim();

  if (message?.includes("unsafe")) {
    return false;
  }

  return true;
}

export async function isContentPG13Appropriate(content: string): Promise<boolean> {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a content moderation system that outputs whether content is PG-13 appropriate or not. You will help determine if content is inappropriate or spammy. In this context, faith-based content is PG-13.`
      },
      {
        role: "user",
        content: `Is this content PG-13 appropriate? <content>${content}</content>`
      }
    ],
    model: GROQ_GUARD_MODEL
  });

  const message = response.choices[0].message.content;

  if (!message) {
    throw new Error("No content returned");
  }

  return !message.toLowerCase().includes("unsafe");
}
