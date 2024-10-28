import { defineDb, defineTable, column } from "astro:db";

const Projects = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    authors: column.text(),
    title: column.text(),
    content: column.text(),
    createdAt: column.date(),
    userId: column.text(),
    bannerImageId: column.text({ optional: true }),
    youtubeVideoUrl: column.text({ optional: true }),
    slug: column.text({ default: "233a7b01-ee6e-47fa-a5ec-91edd503b807" }),
    webhookUrl: column.text({ optional: true }),
    callToActionUrl: column.text({ optional: true }),
    callToActionText: column.text({ optional: true }),
    isPublished: column.boolean({ default: false }),
    logoImageId: column.text({ optional: true })
  }
});

const Posts = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    createdAt: column.date(),
    slug: column.text({ unique: true }),
    content: column.text(),
    userId: column.text(),
    projectId: column.number({ references: () => Projects.columns.id }),
    isFeatured: column.boolean({ default: false })
  }
});

const Leads = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    message: column.text(),
    createdAt: column.date(),
    projectId: column.number({ references: () => Projects.columns.id })
  }
});

export default defineDb({
  tables: {
    Posts,
    Leads,
    Projects
  }
});
