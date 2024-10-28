import { db, Posts, Leads, Projects } from "astro:db";

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

const CAMS_CLERK_USER_ID = "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Projects).values([
    {
      id: 1,
      title: "Wisephone II • Demo",
      authors: "Techless",
      content: SEED_PROJECT_CONTENT,
      createdAt: new Date(),
      bannerImageId: "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu/Slide_16_9_-_1_iyuklo",
      userId: CAMS_CLERK_USER_ID,
      slug: "wpii",
      isPublished: true
    },
    {
      id: 2,
      title: "My Project",
      authors: "Me",
      content: "<p>Hello, World</p>",
      createdAt: new Date(),
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
      userId: CAMS_CLERK_USER_ID,
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
}
