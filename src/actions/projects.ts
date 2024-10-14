import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Posts, Projects, Leads } from "astro:db";

export const server = {
  updateProject: defineAction({
    // Accept form data
    accept: "form",
    // Define input schema for validation
    input: z.object({
      id: z.number(),
      title: z.string().min(1, "Title is required"),
      slug: z.string().min(1, "Slug is required"),
      content: z.string(),
      bannerImageId: z.string().optional()
    }),
    // Handler function
    handler: async ({ id, title, slug, content, bannerImageId }) => {
      try {
        // Update the project in the database
        const updatedProject = await db
          .update(Projects)
          .set({ title, slug, content, bannerImageId })
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

  createProject: defineAction({
    // Accept form data
    accept: "form",
    // Define input schema for validation
    input: z.object({
      title: z.string().min(1, "Title is required"),
      slug: z.string().min(1, "Slug is required"),
      content: z.string(),
      userId: z.string(),
      bannerImageId: z.string().optional()
    }),
    // Handler function
    handler: async ({ title, slug, content, userId, bannerImageId }) => {
      try {
        // Create the project in the database
        const newProject = await db
          .insert(Projects)
          .values({
            title,
            slug,
            content,
            userId,
            bannerImageId,
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
