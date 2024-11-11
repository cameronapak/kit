import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, Leads, Projects } from "astro:db";
import { isContentPG13Appropriate } from "@/libs/ai";

async function sendWebhook(
  webhookUrl: string,
  data: { event: string; lead: { name: string; email: string; message: string } }
) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error(`Webhook request failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error sending webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export const leads = {
  createLead: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      message: z.string().optional(),
      projectId: z.number()
    }),
    handler: async ({ name, email, message = "", projectId }) => {
      try {
        const emailIsAppropriate = await isContentPG13Appropriate(
          `A user submitted this email <email>${email}</email> to a project. Is it appropriate?`
        );
        const isNameAndMessageAppropriate = await isContentPG13Appropriate(
          `Is this name and message PG-13 appropriate? Name is <name>${name}</name> and message is <message>${message}</message>`
        );

        if (!emailIsAppropriate || !isNameAndMessageAppropriate) {
          throw new Error("Detected inappropriate content");
        }

        const newLead = await db
          .insert(Leads)
          .values({
            name,
            email,
            message,
            projectId,
            createdAt: new Date()
          })
          .returning()
          .get();

        // Fetch the project to get the webhookUrl
        const project = await db.select().from(Projects).where(eq(Projects.id, projectId)).get();

        if (project && project.webhookUrl) {
          await sendWebhook(project.webhookUrl, {
            event: "lead_created",
            lead: {
              name,
              email,
              message
            }
          });
        }

        return {
          success: "Contact created successfully!",
          lead: newLead
        };
      } catch (error: any) {
        if (error.validation && error.validation.includes("email")) {
          throw new Error("Invalid email");
        }

        throw new Error(`Failed to submit: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }),

  updateLead: defineAction({
    accept: "form",
    input: z.object({
      id: z.number(),
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      message: z.string().optional(),
      projectId: z.number()
    }),
    handler: async ({ id, name, email, message = "", projectId }) => {
      try {
        const emailIsAppropriate = await isContentPG13Appropriate(
          `A user submitted this email <email>${email}</email> to a project. Is it appropriate?`
        );
        const isNameAndMessageAppropriate = await isContentPG13Appropriate(
          `Is this name and message PG-13 appropriate? Name is <name>${name}</name> and message is <message>${message}</message>`
        );

        if (!emailIsAppropriate || !isNameAndMessageAppropriate) {
          throw new Error("Detected inappropriate content");
        }

        const updatedLead = await db
          .update(Leads)
          .set({ name, email, message, projectId })
          .where(eq(Leads.id, id))
          .returning()
          .get();

        if (!updatedLead) {
          throw new Error("Lead not found");
        }

        return {
          success: "Contact updated successfully!",
          lead: updatedLead
        };
      } catch (error) {
        throw new Error(`Failed to update: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }),

  deleteLead: defineAction({
    accept: "form",
    input: z.object({
      id: z.number()
    }),
    handler: async ({ id }) => {
      try {
        const deletedLead = await db.delete(Leads).where(eq(Leads.id, id)).returning().get();

        if (!deletedLead) {
          throw new Error("Lead not found");
        }

        return {
          success: "Contact deleted successfully!",
          message: "Contact deleted successfully"
        };
      } catch (error) {
        throw new Error(`Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  })
};
