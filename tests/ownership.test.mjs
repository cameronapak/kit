import { readFileSync } from "node:fs";
import { beforeEach, expect, mock, test } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { and, eq } from "drizzle-orm";
import { Projects, Posts, Leads } from "../db/schema.ts";

const sql = new Database(":memory:");
sql.exec("PRAGMA foreign_keys=ON");
sql.exec(readFileSync(new URL("../db/local.sql", import.meta.url), "utf8"));
const db = drizzle(sql);
class ActionError extends Error {
  constructor({ code, message }) { super(message); this.code = code; }
}
mock.module("astro:actions", () => ({ ActionError, defineAction: config => config.handler }));
mock.module("../src/libs/db", () => ({ getDb: () => db, Projects, Posts, Leads, and, eq }));
mock.module("@netlify/cache", () => ({ purgeCache: mock() }));
const moderate = mock(async () => true);
mock.module("../src/libs/ai", () => ({ isContentPG13Appropriate: moderate }));
const { projects } = await import("../src/actions/projects");
const { posts } = await import("../src/actions/posts");
const { leads } = await import("../src/actions/leads");
const context = userId => ({ locals: { auth: () => ({ userId }) } });
const snapshot = () => ["Projects", "Posts", "Leads"].map(t => sql.query(`SELECT * FROM ${t} ORDER BY id`).all());
beforeEach(() => {
  for (const table of ["Posts", "Leads", "Projects"]) sql.exec(`DELETE FROM ${table}`);
  const createdAt = new Date("2025-01-01T00:00:00Z");
  const project = { title: "Project", authors: "Author", content: "Original", createdAt, updatedAt: createdAt };
  db.insert(Projects).values([
    { ...project, id: 1, userId: "owner", slug: "owned", isPublished: true },
    { ...project, id: 2, userId: "other", slug: "other" },
    { ...project, id: 3, userId: "owner", slug: "also-owned" }
  ]).run();
  db.insert(Posts).values({
    id: 1, userId: "owner", projectId: 1, title: "First post", slug: "first-post", content: "Original", createdAt
  }).run();
  db.insert(Leads).values({ id: 1, projectId: 1, name: "Contact", email: "contact@example.com", message: "", createdAt }).run();
  moderate.mockClear();
});
const input = {
  id: 1, projectId: 1, userId: "owner", title: "Updated", content: "Content",
  slug: "updated", authors: "Author", createdAt: new Date(),
  name: "Name", email: "name@example.com", message: "Hello", webhookUrl: "https://example.com"
};
const actions = [
  ...Object.entries(projects), ...Object.entries(posts),
  ["updateLead", leads.updateLead], ["deleteLead", leads.deleteLead]
];
for (const [name, action] of actions) {
  if (name !== "createProject") {
    test(`${name}: non-owner rejected, no change or moderation`, async () => {
      const before = snapshot();
      await expect(action(input, context("other"))).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(snapshot()).toEqual(before);
      expect(moderate).not.toHaveBeenCalled();
    });
  }
  test(`${name}: owner succeeds`, async () => {
    const before = snapshot();
    expect((await action(input, context("owner"))).success).toBeTruthy();
    expect(snapshot()).not.toEqual(before);
  });
  test(`${name}: signed-out rejected, no change`, async () => {
    const before = snapshot();
    await expect(action(input, context(null))).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(snapshot()).toEqual(before);
  });
  if (!["createPost", "createProject"].includes(name)) {
    test(`${name}: missing record rejected`, async () => {
      const before = snapshot();
      await expect(action({ ...input, id: 999, projectId: 999 }, context("owner")))
        .rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(snapshot()).toEqual(before);
    });
  }
}
for (const [name, action] of [["createProject", projects.createProject], ["createPost", posts.createPost], ["updatePost", posts.updatePost]]) {
  test(`${name}: forged userId cannot assign ownership`, async () => {
    const result = await action({ ...input, userId: "other" }, context("owner"));
    expect((result.project || result.post).userId).toBe("owner");
  });
}
for (const [name, action] of [["updatePost", posts.updatePost], ["updateLead", leads.updateLead]]) {
  test(`${name}: cannot move owned record into another user's project`, async () => {
    const before = snapshot();
    await expect(action({ ...input, projectId: 2 }, context("owner"))).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(snapshot()).toEqual(before);
  });
  test(`${name}: cannot take foreign record into owned project`, async () => {
    const before = snapshot();
    await expect(action({ ...input, projectId: 2 }, context("other"))).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(snapshot()).toEqual(before);
  });
  test(`${name}: can move record between own projects`, async () => {
    const result = await action({ ...input, projectId: 3 }, context("owner"));
    expect((result.post || result.lead).projectId).toBe(3);
  });
}
test("createPost: missing parent rejected without changes", async () => {
  const before = snapshot();
  await expect(posts.createPost({ ...input, projectId: 999 }, context("owner")))
    .rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(snapshot()).toEqual(before);
});
test("post author cannot edit or delete a post attached to another owner's project", async () => {
  db.update(Projects).set({ userId: "other" }).where(eq(Projects.id, 1)).run();
  const before = snapshot();
  for (const action of [posts.updatePost, posts.deletePost]) {
    await expect(action(input, context("owner"))).rejects.toMatchObject({ code: "NOT_FOUND" });
  }
  expect(snapshot()).toEqual(before);
});
