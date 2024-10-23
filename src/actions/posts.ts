import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Posts } from "astro:db";
import { purgeCache } from "@netlify/functions";

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
    handler: async ({ title, createdAt, slug, content, userId, projectId }) => {
      try {
        // Create the post in the database
        const newPost = await db
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
    handler: async ({ id, title, slug, content, userId, projectId }) => {
      try {
        // Update the post in the database
        const updatedPost = await db
          .update(Posts)
          .set({
            title,
            slug,
            content,
            userId,
            projectId
          })
          .where(eq(Posts.id, id))
          .returning()
          .get();

        if (!updatedPost) {
          throw new Error("Post not found");
        }

        // Invalidate Netlify cache for the updated post
        await purgeCache({ tags: [slug] });

        return {
          success: "Successfully updated post and invalidated cache!",
          post: updatedPost
        };
      } catch (error) {
        throw new Error(`Failed to update post or invalidate cache: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }),

  deletePost: defineAction({
    // Accept form data
    accept: "form",
    // Define input schema for validation
    input: z.object({
      id: z.number()
    }),
    // Handler function
    handler: async ({ id }) => {
      try {
        // Delete the post from the database
        const deletedPost = await db.delete(Posts).where(eq(Posts.id, id)).returning().get();

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
