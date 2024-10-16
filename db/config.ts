import { defineDb, defineTable, column } from "astro:db";

const Posts = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    createdAt: column.date(),
    slug: column.text({ unique: true }),
    content: column.text(),
    userId: column.text(),
    projectId: column.number({ references: () => Projects.columns.id }),
  }
});

const Projects = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    content: column.text(),
    createdAt: column.date(),
    userId: column.text(),
    bannerImageId: column.text({ optional: true }),
    youtubeVideoUrl: column.text({ optional: true }),
  }
});

const Leads = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    message: column.text(),
    createdAt: column.date(),
    projectId: column.number({ references: () => Projects.columns.id }),
  }
});

export default defineDb({
  tables: {
    Posts,
    Leads,
    Projects
  }
});
