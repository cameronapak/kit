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
  }),

  createPost: defineAction({
    // Accept form data
    accept: 'form',
    // Define input schema for validation
    input: z.object({
      title: z.string().min(1, "Title is required"),
      pubDate: z.string().transform(str => new Date(str)),
      description: z.string(),
      author: z.string(),
      imageUrl: z.string().optional(),
      imageAlt: z.string().optional(),
      tags: z.string().optional().transform(str => str ? JSON.parse(str) : undefined),
      slug: z.string().min(1, "Slug is required"),
      content: z.string(),
      userId: z.string(),
    }),
    // Handler function
    handler: async ({ title, pubDate, description, author, imageUrl, imageAlt, tags, slug, content, userId }) => {
      try {
        // Create the post in the database
        const newPost = await db.insert(Posts)
          .values({
            title,
            pubDate,
            description,
            author,
            imageUrl,
            imageAlt,
            tags,
            slug,
            content,
            userId,
          })
          .returning()
          .get();

        return {
          success: true,
          post: newPost,
        };
      } catch (error) {
        throw new Error(`Failed to create post: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
  }),

  updatePost: defineAction({
    // Accept form data
    accept: 'form',
    // Define input schema for validation
    input: z.object({
      id: z.number(),
      title: z.string().min(1, "Title is required"),
      pubDate: z.string().transform(str => new Date(str)),
      description: z.string(),
      author: z.string(),
      imageUrl: z.string().optional(),
      imageAlt: z.string().optional(),
      tags: z.string().optional().transform(str => str ? JSON.parse(str) : undefined),
      slug: z.string().min(1, "Slug is required"),
      content: z.string(),
    }),
    // Handler function
    handler: async ({ id, title, pubDate, description, author, imageUrl, imageAlt, tags, slug, content }) => {
      try {
        // Update the post in the database
        const updatedPost = await db.update(Posts)
          .set({
            title,
            pubDate,
            description,
            author,
            imageUrl,
            imageAlt,
            tags,
            slug,
            content,
          })
          .where(eq(Posts.id, id))
          .returning()
          .get();

        if (!updatedPost) {
          throw new Error("Post not found");
        }

        return {
          success: true,
          post: updatedPost,
        };
      } catch (error) {
        throw new Error(`Failed to update post: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
  }),

  deletePost: defineAction({
    // Accept form data
    accept: 'form',
    // Define input schema for validation
    input: z.object({
      id: z.number(),
    }),
    // Handler function
    handler: async ({ id }) => {
      try {
        // Delete the post from the database
        const deletedPost = await db.delete(Posts)
          .where(eq(Posts.id, id))
          .returning()
          .get();

        if (!deletedPost) {
          throw new Error("Post not found");
        }

        return {
          success: true,
          message: "Post deleted successfully",
        };
      } catch (error) {
        throw new Error(`Failed to delete post: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
  }),

  createLead: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      message: z.string(),
      projectId: z.number(),
    }),
    handler: async ({ name, email, message, projectId }) => {
      try {
        const newLead = await db.insert(Leads)
          .values({
            name,
            email,
            message,
            projectId,
            createdAt: new Date(),
          })
          .returning()
          .get();

        return {
          success: true,
          lead: newLead,
        };
      } catch (error) {
        throw new Error(`Failed to create lead: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
  }),

  updateLead: defineAction({
    accept: 'form',
    input: z.object({
      id: z.number(),
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      message: z.string(),
      projectId: z.number(),
    }),
    handler: async ({ id, name, email, message, projectId }) => {
      try {
        const updatedLead = await db.update(Leads)
          .set({ name, email, message, projectId })
          .where(eq(Leads.id, id))
          .returning()
          .get();

        if (!updatedLead) {
          throw new Error("Lead not found");
        }

        return {
          success: true,
          lead: updatedLead,
        };
      } catch (error) {
        throw new Error(`Failed to update lead: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
  }),

  deleteLead: defineAction({
    accept: 'form',
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      try {
        const deletedLead = await db.delete(Leads)
          .where(eq(Leads.id, id))
          .returning()
          .get();

        if (!deletedLead) {
          throw new Error("Lead not found");
        }

        return {
          success: true,
          message: "Lead deleted successfully",
        };
      } catch (error) {
        throw new Error(`Failed to delete lead: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
  }),
};
