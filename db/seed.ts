import { db, Posts, Leads, Projects } from "astro:db";

const content = `
## This is the first post of my new Astro blog.

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

const CAMS_CLERK_USER_ID = "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Posts).values([
    {
      id: 1,
      title: "My First Blog Post",
      createdAt: new Date("2024-10-14"),
      slug: "my-first-blog-post",
      content,
      userId: CAMS_CLERK_USER_ID
    }
  ]);

  await db.insert(Projects).values([
    {
      id: 1,
      title: "Test Project",
      content: "This is a test project.",
      createdAt: new Date(),
      bannerImageId: "user_2hHFZTOTzVEGWVy8gpbKyB6JXPu/freedom-stack_hbfpk9",
      userId: CAMS_CLERK_USER_ID,
      slug: "test-project",
    },
  ]);

  await db.insert(Leads).values([
    {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      message: "Love the product you're creating. I'm a big fan of the focus on developer experience. Keep up the good work!",
      createdAt: new Date(),
      projectId: 1,
    },
    {
      id: 2,
      name: "Cameron Pak",
      email: "cameronandrewpak@gmail.com",
      message: "Need an app like this!",
      createdAt: new Date(),
      projectId: 1,
    }
  ]);
}
