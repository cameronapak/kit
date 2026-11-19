// Run with: bun test tests/ownership.test.mjs
import { beforeEach, expect, mock, test } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const sql = new Database(":memory:");
const db = drizzle(sql);
const Projects = sqliteTable("Projects", {
  id: integer().primaryKey(), userId: text(), title: text(), content: text(),
  authors: text(), slug: text(), webhookUrl: text(), bannerImageId: text(),
  logoImageId: text(), youtubeVideoUrl: text(), callToActionUrl: text(),
  callToActionText: text(), isPublished: integer({ mode: "boolean" }),
  createdAt: integer({ mode: "timestamp" }), updatedAt: integer({ mode: "timestamp" })
});
const Posts = sqliteTable("Posts", {
  id: integer().primaryKey(), userId: text(), projectId: integer(),
  title: text(), slug: text(), content: text(), createdAt: integer({ mode: "timestamp" })
});
const Leads = sqliteTable("Leads", {
  id: integer().primaryKey(), projectId: integer(), name: text(), email: text(),
  message: text(), createdAt: integer({ mode: "timestamp" })
});
for (const table of [Projects, Posts, Leads]) {
  const { getTableConfig } = await import("drizzle-orm/sqlite-core");
  const config = getTableConfig(table);
  sql.exec(`CREATE TABLE ${config.name} (${config.columns.map(c =>
    `${c.name} ${c.getSQLType()}${c.primary ? " PRIMARY KEY" : ""}`).join(", ")})`);
}
class ActionError extends Error {
  constructor({ code, message }) { super(message); this.code = code; }
}
mock.module("astro:actions", () => ({ ActionError, defineAction: config => config.handler }));
mock.module("astro:schema", () => ({ z }));
mock.module("astro:db", () => ({ db, Projects, Posts, Leads, and, eq }));
mock.module("@netlify/functions", () => ({ purgeCache: mock() }));
const moderate = mock(async () => true);
mock.module("../src/libs/ai", () => ({ isContentPG13Appropriate: moderate }));
const { projects } = await import("../src/actions/projects");
const { posts } = await import("../src/actions/posts");
const { leads } = await import("../src/actions/leads");
const context = userId => ({ locals: { auth: () => ({ userId }) } });
const snapshot = () => ["Projects", "Posts", "Leads"].map(t => sql.query(`SELECT * FROM ${t} ORDER BY id`).all());
beforeEach(() => {
  for (const table of ["Posts", "Leads", "Projects"]) sql.exec(`DELETE FROM ${table}`);
  db.insert(Projects).values([
    { id: 1, userId: "owner", slug: "owned" },
    { id: 2, userId: "other", slug: "other" },
    { id: 3, userId: "owner", slug: "also-owned" }
  ]).run();
  db.insert(Posts).values({ id: 1, userId: "owner", projectId: 1 }).run();
  db.insert(Leads).values({ id: 1, projectId: 1 }).run();
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
