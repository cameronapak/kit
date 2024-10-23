// https://developers.netlify.com/guides/how-to-do-advanced-caching-and-isr-with-astro/
import { purgeCache } from "@netlify/functions";

export async function POST({ request }: { request: Request }) {
  const body = await request.json();

//   // See below for information on webhook security
//   if (request.headers.get("X-Contentful-Webhook-Secret") !== process.env.CONTENTFUL_WEBHOOK_SECRET) {
//     return new Response("Unauthorized", { status: 401 });
//   }

  await purgeCache({ tags: [body.sys.id] });

  return new Response(`Revalidated entry with id ${body.sys.id}`, { status: 200 });
}
