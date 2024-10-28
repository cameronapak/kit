import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Projects } from "astro:db";
import { purgeCache } from "@netlify/functions";

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
      logoImageId: z.string().optional(),
      youtubeVideoUrl: z
        .string()
        .optional()
        .nullable()
        .transform((v) => (v === "" ? null : v)),
      authors: z.string(),
      slug: z.string(),
      webhookUrl: z.string().url().optional().nullable(),
      callToActionUrl: z.string().url().optional().nullable(),
      callToActionText: z.string().optional().nullable()
    }),
    // Handler function
    handler: async ({
      id,
      title,
      content,
      bannerImageId,
      logoImageId,
      youtubeVideoUrl,
      authors,
      webhookUrl,
      slug,
      callToActionUrl,
      callToActionText
    }) => {
      try {
        // Update the project in the database
        const updatedProject = await db
          .update(Projects)
          .set({
            title,
            content,
            bannerImageId,
            logoImageId,
            youtubeVideoUrl: youtubeVideoUrl || null,
            authors: authors || "",
            slug,
            webhookUrl: webhookUrl || null,
            callToActionUrl: callToActionUrl || null,
            callToActionText: callToActionText || null
          })
          .where(eq(Projects.id, id))
          .returning()
          .get();

        if (!updatedProject) {
          throw new Error("Project not found");
        }

        if (import.meta.env.PROD) {
          purgeCache({ tags: [slug] });
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
      logoImageId: z.string().optional(),
      youtubeVideoUrl: z
        .string()
        .optional()
        .nullable()
        .transform((v) => (v === "" ? null : v)),
      authors: z.string(),
      slug: z.string().optional(),
      webhookUrl: z.string().url().optional().nullable(),
      callToActionUrl: z.string().url().optional().nullable(),
      callToActionText: z.string().optional().nullable()
    }),
    // Handler function
    handler: async ({
      title,
      content,
      userId,
      bannerImageId,
      logoImageId,
      youtubeVideoUrl,
      authors,
      webhookUrl,
      slug,
      callToActionUrl,
      callToActionText
    }) => {
      try {
        // Create the project in the database
        const newProject = await db
          .insert(Projects)
          .values({
            title,
            content,
            userId,
            bannerImageId,
            logoImageId,
            youtubeVideoUrl: youtubeVideoUrl || null,
            authors: authors || "",
            slug: slug || "",
            webhookUrl: webhookUrl || null,
            callToActionUrl: callToActionUrl || null,
            callToActionText: callToActionText || null,
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

      if (import.meta.env.PROD) {
        purgeCache({ tags: [updatedProject.slug] });
      }

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

      if (import.meta.env.PROD) {
        purgeCache({ tags: [updatedProject.slug] });
      }

      return {
        success: "Project unpublished successfully!",
        project: updatedProject
      };
    }
  })
};
