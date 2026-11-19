import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { getDb, eq, Posts, and } from "@/libs/db";
import { purgeCache } from "@netlify/cache";
import { isContentPG13Appropriate } from "@/libs/ai";
import { requireUser, requireProjectOwner, requirePostOwner } from "./ownership";

export const posts = {
  createPost: defineAction({
    // Accept form data
    accept: "form",
    // Define input schema for validation
    input: z.object({
      title: z.string().min(1, "Title is required"),
      createdAt: z.string().transform((str) => new Date(str)),
      slug: z.string().min(1, "Slug is required"),
      content: z.string(),
      userId: z.string(),
      projectId: z.number()
    }),
    // Handler function
    handler: async ({ title, createdAt, slug, content, projectId }, { locals }) => {
      const userId = requireUser(locals);
      await requireProjectOwner(projectId, userId);
      try {
        const isContentAppropriate = await isContentPG13Appropriate(content);

        if (!isContentAppropriate) {
          throw new Error(
            "AI detected inappropriate content. Please contact support if you believe this was a mistake."
          );
        }

        // Create the post in the database
        const newPost = await getDb()
          .insert(Posts)
          .values({
            title,
            createdAt,
            slug,
            content,
            userId,
            projectId
          })
          .returning()
          .get();

        return {
          success: "Successfully created post!",
          post: newPost
        };
      } catch (error) {
        throw new Error(`Failed to create post: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }),

  updatePost: defineAction({
    // Accept form data
    accept: "form",
    // Define input schema for validation
    input: z.object({
      id: z.number(),
      title: z.string().min(1, "Title is required"),
      slug: z.string().min(1, "Slug is required"),
      content: z.string(),
      userId: z.string(),
      projectId: z.number()
    }),
    // Handler function
    handler: async ({ id, title, slug, content, projectId }, { locals }) => {
      const userId = requireUser(locals);
      await requirePostOwner(id, userId);
      await requireProjectOwner(projectId, userId);
      try {
        const isContentAppropriate = await isContentPG13Appropriate(content);

        if (!isContentAppropriate) {
          throw new Error(
            "AI detected inappropriate content. Please contact support if you believe this was a mistake."
          );
        }

        // Update the post in the database
        const updatedPost = await getDb()
          .update(Posts)
          .set({
            title,
            slug,
            content,
            userId,
            projectId
          })
          .where(and(eq(Posts.id, id), eq(Posts.userId, userId)))
          .returning()
          .get();

        if (!updatedPost) {
          throw new Error("Post not found");
        }

        if (import.meta.env.PROD) {
          await purgeCache({ tags: [slug] });
        }

        return {
          success: "Successfully updated post and invalidated cache!",
          post: updatedPost
        };
      } catch (error) {
        throw new Error(
          `Failed to update post or invalidate cache: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  }),

  deletePost: defineAction({
    // Accept form data
    accept: "form",
    // Define input schema for validation
    input: z.object({
      id: z.number(),
      userId: z.string()
    }),
    // Handler function
    handler: async ({ id }, { locals }) => {
      const userId = requireUser(locals);
      await requirePostOwner(id, userId);
      try {
        // Delete the post from the database
        const deletedPost = await getDb()
          .delete(Posts)
          .where(and(eq(Posts.id, id), eq(Posts.userId, userId)))
          .returning()
          .get();

        if (!deletedPost) {
          throw new Error("Post not found");
        }

        return {
          success: "Successfully deleted post!",
          message: "Post deleted successfully"
        };
      } catch (error) {
        throw new Error(`Failed to delete post: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  })
};
