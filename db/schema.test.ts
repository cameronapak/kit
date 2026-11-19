import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { Leads, PageView, Posts, Projects } from "./schema.ts";

test("reads Astro DB dates and booleans and writes to the existing table layout", async () => {
  const client = createClient({ url: ":memory:" });
  try {
    await client.executeMultiple(readFileSync(new URL("./local.sql", import.meta.url), "utf8"));
    const timestamp = "2024-10-14T00:00:00.000Z";
    await client.execute({
      sql: `INSERT INTO "Projects" ("id", "authors", "title", "content", "createdAt", "userId", "isPublished", "updatedAt")
            VALUES (1, 'Author', 'Project', 'Content', ?, 'user_1', 1, '2024-10-15 12:00:00')`,
      args: [timestamp]
    });

    const db = drizzle(client);
    const project = await db.select().from(Projects).where(eq(Projects.id, 1)).get();
    assert.ok(project);
    assert.equal(project.createdAt.toISOString(), timestamp);
    assert.equal(project.updatedAt.toISOString(), "2024-10-15T12:00:00.000Z");
    assert.equal(project.isPublished, true);
    assert.equal(project.isFeatured, false);

    const createdAt = new Date(timestamp);
    await db
      .insert(Posts)
      .values({ projectId: 1, title: "Post", slug: "post", content: "Content", userId: "user_1", createdAt });
    await db
      .insert(Leads)
      .values({ projectId: 1, name: "Contact", email: "contact@example.com", message: "", createdAt });
    await db.insert(PageView).values({ url: "/app/project", date: createdAt });

    assert.equal((await client.execute('SELECT "createdAt" FROM "Posts"')).rows[0].createdAt, timestamp);
    assert.equal((await client.execute('SELECT "projectId" FROM "Leads"')).rows[0].projectId, 1);
    const view = await db.select().from(PageView).get();
    assert.equal(view?._id, 1);
    assert.deepEqual(view?.date, createdAt);
  } finally {
    client.close();
  }
});
