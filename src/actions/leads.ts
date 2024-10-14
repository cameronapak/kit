import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Leads } from "astro:db";

export const leads = {
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
