import { customType, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Astro DB stored dates as text, not SQLite integer timestamps.
const date = customType<{ data: Date; driverData: string }>({
  dataType: () => "text",
  toDriver: (value) => value.toISOString(),
  fromDriver: (value) => new Date(value.endsWith("Z") ? value : `${value}Z`)
});

export const Projects = sqliteTable("Projects", {
  id: integer().primaryKey(),
  authors: text().notNull(),
  title: text().notNull(),
  content: text().notNull(),
  createdAt: date().notNull(),
  userId: text().notNull(),
  bannerImageId: text(),
  youtubeVideoUrl: text(),
  slug: text().notNull().default("233a7b01-ee6e-47fa-a5ec-91edd503b807"),
  webhookUrl: text(),
  callToActionUrl: text(),
  callToActionText: text(),
  isPublished: integer({ mode: "boolean" }).notNull().default(false),
  logoImageId: text(),
  isFeatured: integer({ mode: "boolean" }).notNull().default(false),
  updatedAt: date()
    .notNull()
    .$defaultFn(() => new Date())
});

export const Posts = sqliteTable("Posts", {
  id: integer().primaryKey(),
  title: text().notNull(),
  createdAt: date().notNull(),
  slug: text().notNull().unique(),
  content: text().notNull(),
  userId: text().notNull(),
  projectId: integer()
    .notNull()
    .references(() => Projects.id),
  isFeatured: integer({ mode: "boolean" }).notNull().default(false)
});

export const PageView = sqliteTable(
  "PageView",
  {
    _id: integer().primaryKey(),
    url: text().notNull(),
    date: date().notNull()
  },
  (table) => [index("url_idx").on(table.url), index("date_idx").on(table.date)]
);

export const Leads = sqliteTable("Leads", {
  id: integer().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  message: text().notNull(),
  createdAt: date().notNull(),
  projectId: integer()
    .notNull()
    .references(() => Projects.id)
});
