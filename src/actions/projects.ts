import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Projects } from "astro:db";

export const projects = {
  updateProject: defineAction({
    // Accept form data
    accept: "form",
    // Define input schema for validation
    input: z.object({
      id: z.number(),
      title: z.string().min(1, "Title is required"),
      content: z.string(),
      bannerImageId: z.string().optional(),
      youtubeVideoUrl: z
        .string()
        .optional()
        .nullable()
        .transform((v) => (v === "" ? null : v)),
      authors: z.string(),
      slug: z.string(),
      webhookUrl: z.string().url().optional().nullable()
    }),
    // Handler function
    handler: async ({ id, title, content, bannerImageId, youtubeVideoUrl, authors, webhookUrl, slug }) => {
      try {
        // Update the project in the database
        const updatedProject = await db
          .update(Projects)
          .set({
            title,
            content,
            bannerImageId,
            youtubeVideoUrl: youtubeVideoUrl || null,
            authors: authors || "",
            slug,
            webhookUrl: webhookUrl || null
          })
          .where(eq(Projects.id, id))
          .returning()
          .get();

        if (!updatedProject) {
          throw new Error("Project not found");
        }

        return {
          success: "Project updated successfully!",
          project: updatedProject
        };
      } catch (error) {
        throw new Error(`Failed to update project: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }),

  addWebhook: defineAction({
    accept: "form",
    input: z.object({
      projectId: z.number(),
      webhookUrl: z.string().url().optional().nullable()
    }),
    handler: async ({ projectId, webhookUrl }) => {
      const updatedProject = await db
        .update(Projects)
        .set({ webhookUrl })
        .where(eq(Projects.id, projectId))
        .returning()
        .get();
      return {
        success: "Webhook updated successfully!",
        project: updatedProject
      };
    }
  }),

  createProject: defineAction({
    // Accept form data
    accept: "form",
    // Define input schema for validation
    input: z.object({
      title: z.string().min(1, "Title is required"),
      content: z.string(),
      userId: z.string(),
      bannerImageId: z.string().optional(),
      youtubeVideoUrl: z
        .string()
        .optional()
        .nullable()
        .transform((v) => (v === "" ? null : v)),
      authors: z.string(),
      slug: z.string().optional(),
      webhookUrl: z.string().url().optional().nullable()
    }),
    // Handler function
    handler: async ({ title, content, userId, bannerImageId, youtubeVideoUrl, authors, webhookUrl, slug }) => {
      try {
        // Create the project in the database
        const newProject = await db
          .insert(Projects)
          .values({
            title,
            content,
            userId,
            bannerImageId,
            youtubeVideoUrl: youtubeVideoUrl || null,
            authors: authors || "",
            slug: slug || "",
            webhookUrl: webhookUrl || null,
            createdAt: new Date()
          })
          .returning()
          .get();

        return {
          success: "Project created successfully!",
          project: newProject
        };
      } catch (error) {
        throw new Error(`Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }),

  unpublishProject: defineAction({
    accept: "form",
    input: z.object({ id: z.number() }),
    handler: async ({ id }) => {
      const updatedProject = await db
        .update(Projects)
        .set({ isPublished: false })
        .where(eq(Projects.id, id))
        .returning()
        .get();

      return {
        success: "Project unpublished successfully!",
        project: updatedProject
      };
    }
  }),

  publishProject: defineAction({
    accept: "form",
    input: z.object({ id: z.number() }),
    handler: async ({ id }) => {
      const updatedProject = await db
        .update(Projects)
        .set({ isPublished: true })
        .where(eq(Projects.id, id))
        .returning()
        .get();

      return {
        success: "Project unpublished successfully!",
        project: updatedProject
      };
    }
  })
};
