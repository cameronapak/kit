import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY
});

// https://console.groq.com/docs/content-moderation
export async function isContentAppropriate(content: string): Promise<boolean> {
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content }],
    model: "llama-guard-3-8b"
  });

  const message = response.choices[0].message.content?.trim();

  if (message?.includes("unsafe")) {
    return false;
  }

  return true;
}

export async function isContentPG13Appropriate(content: string): Promise<boolean> {
  const jsonSchema = JSON.stringify({
    type: "object",
    properties: {
      isAppropriate: { type: "boolean" }
    }
  });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a content moderation system that outputs whether content is PG-13 appropriate or not. You will help determine if content is inappropriate or spammy. The JSON object must use the schema: ${jsonSchema}`
      },
      {
        role: "user",
        content: `Is this content PG-13 appropriate? <content>${content}</content>`
      }
    ],
    model: "llama3-8b-8192",
    temperature: 0,
    stream: false,
    response_format: { type: "json_object" }
  });

  const message = response.choices[0].message.content;

  if (!message) {
    throw new Error("No content returned");
  }

  return JSON.parse(message).isAppropriate;
}
