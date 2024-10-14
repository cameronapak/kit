import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Posts } from "astro:db";

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
      userId: z.string()
    }),
    // Handler function
    handler: async ({ title, createdAt, slug, content, userId }) => {
      try {
        // Create the post in the database
        const newPost = await db
          .insert(Posts)
          .values({
            title,
            createdAt,
            slug,
            content,
            userId
          })
          .returning()
          .get();

        return {
          success: true,
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
      userId: z.string()
    }),
    // Handler function
    handler: async ({ id, title, slug, content, userId }) => {
      try {
        // Update the post in the database
        const updatedPost = await db
          .update(Posts)
          .set({
            title,
            slug,
            content,
            userId
          })
          .where(eq(Posts.id, id))
          .returning()
          .get();

        if (!updatedPost) {
          throw new Error("Post not found");
        }

        return {
          success: true,
          post: updatedPost
        };
      } catch (error) {
        throw new Error(`Failed to update post: ${error instanceof Error ? error.message : "Unknown error"}`);
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
          success: true,
          message: "Post deleted successfully"
        };
      } catch (error) {
        throw new Error(`Failed to delete post: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  })
};
