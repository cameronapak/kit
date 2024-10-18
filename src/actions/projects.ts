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
      youtubeVideoUrl: z.string().optional().nullable().transform(v => v === "" ? null : v),
      authors: z.string(),
      webhookUrl: z.string().url().optional().nullable(),
    }),
    // Handler function
    handler: async ({ id, title, content, bannerImageId, youtubeVideoUrl, authors, webhookUrl }) => {
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
            webhookUrl: webhookUrl || null,
          })
          .where(eq(Projects.id, id))
          .returning()
          .get();

        if (!updatedProject) {
          throw new Error("Project not found");
        }

        return {
          success: true,
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
      webhookUrl: z.string().url().optional().nullable(),
    }),
    handler: async ({ projectId, webhookUrl }) => {
      const updatedProject = await db.update(Projects).set({ webhookUrl }).where(eq(Projects.id, projectId)).returning().get();
      return {
        success: true,
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
      youtubeVideoUrl: z.string().optional().nullable().transform(v => v === "" ? null : v),
      authors: z.string(),
      webhookUrl: z.string().url().optional().nullable(),
    }),
    // Handler function
    handler: async ({ title, content, userId, bannerImageId, youtubeVideoUrl, authors, webhookUrl }) => {
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
            webhookUrl: webhookUrl || null,
            createdAt: new Date()
          })
          .returning()
          .get();

        return {
          success: true,
          project: newProject
        };
      } catch (error) {
        throw new Error(`Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  })
};
