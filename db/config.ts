import { defineDb, defineTable, column } from "astro:db";

const Posts = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    pubDate: column.date(),
    description: column.text(),
    author: column.text(),
    imageUrl: column.text({ optional: true }),
    imageAlt: column.text({ optional: true }),
    tags: column.json({ optional: true }),
    slug: column.text({ unique: true }),
    content: column.text(),
    userId: column.text(),
  }
});

const Leads = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    message: column.text(),
    createdAt: column.date(),
  }
});

export default defineDb({
  tables: {
    Posts,
    Leads
  }
});
