import { existsSync, linkSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { Posts, Leads, Projects, PageView } from "./schema.ts";

const content = `
Never gonna give you up, never gonna let you down.
Never gonna run around and desert you.
Never gonna make you cry, never gonna say goodbye.
Never gonna tell a lie and hurt you.
Never gonna hold you back, never gonna lose your grip.
Never gonna give you up, never gonna let you down.
Never gonna run around and desert you.
Never gonna make you cry, never gonna say goodbye.
Never gonna tell a lie and hurt you.
`.trim();

const SEED_PROJECT_CONTENT = `
<div>What if it were easier to live a holy life digitally?<br><br>We're building a healthy smartphone for the modern age, with no browser, no social media, no porn, and no games. It has all the essential tools, like a camera, texting, phone calls, calendar, etc. And, our curated app store only has safe apps to be used as tools to get a job done.</div>
`.trim();

async function seed(db: ReturnType<typeof drizzle>) {
  await db.insert(Projects).values([
    {
      id: 1,
      title: "Wisephone II • Demo",
      authors: "Techless",
      content: SEED_PROJECT_CONTENT,
      createdAt: new Date(),
      bannerImageId: "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu/Slide_16_9_-_1_iyuklo",
      logoImageId: "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu/Techless_Avatar_tq8cjo",
      userId: "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu",
      slug: "wpii",
      isPublished: true
    },
    {
      id: 2,
      title: "My Project",
      authors: "Me",
      content: "<p>Hello, World</p>",
      createdAt: new Date(),
      logoImageId: "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu/kit-transparent_hfiukx",
      userId: "user_1",
      slug: "xyz",
      isPublished: true
    }
  ]);

  await db.insert(Posts).values([
    {
      id: 1,
      title: "Wisephone II is Shipping!",
      createdAt: new Date("2024-10-14"),
      slug: "wisephone-ii-is-shipping",
      content,
      userId: "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu",
      projectId: 1,
      isFeatured: true
    },
    {
      id: 2,
      title: "My Second Post",
      createdAt: new Date("2024-10-15"),
      slug: "my-second-post",
      content,
      userId: "user_1",
      projectId: 2
    }
  ]);

  await db.insert(Leads).values([
    {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      message:
        "Love the product you're creating. I'm a big fan of the focus on developer experience. Keep up the good work!",
      createdAt: new Date(),
      projectId: 1
    },
    {
      id: 2,
      name: "Cameron Pak",
      email: "cameronandrewpak@gmail.com",
      message: "Need an app like this!",
      createdAt: new Date(),
      projectId: 1
    }
  ]);

  await db.insert(PageView).values([
    { date: new Date(), url: "/" },
    { date: new Date(), url: "/app/wpii" }
  ]);
}

const path = ".astro/kit.sqlite";
if (!existsSync(path)) {
  mkdirSync(".astro", { recursive: true });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  const client = createClient({ url: `file:${temporaryPath}` });
  try {
    try {
      await client.executeMultiple(readFileSync(new URL("./local.sql", import.meta.url), "utf8"));
      await seed(drizzle(client));
    } finally {
      client.close();
    }
    try {
      linkSync(temporaryPath, path);
    } catch (error) {
      if (!existsSync(path)) throw error;
    }
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}
