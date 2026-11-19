import { ActionError } from "astro:actions";
import { getDb, eq, and, Projects, Posts, Leads } from "@/libs/db";

export function requireUser(locals: App.Locals) {
  const userId = locals.auth().userId;
  if (!userId) {
    throw new ActionError({ code: "UNAUTHORIZED", message: "Sign in required" });
  }
  return userId;
}

export async function requireProjectOwner(id: number, userId: string) {
  const project = await getDb().select().from(Projects)
    .where(and(eq(Projects.id, id), eq(Projects.userId, userId))).get();
  if (!project) {
    throw new ActionError({ code: "NOT_FOUND", message: "Project not found" });
  }
  return project;
}

export async function requirePostOwner(id: number, userId: string) {
  const post = await getDb().select().from(Posts)
    .where(and(eq(Posts.id, id), eq(Posts.userId, userId))).get();
  if (!post) {
    throw new ActionError({ code: "NOT_FOUND", message: "Post not found" });
  }
  await requireProjectOwner(post.projectId, userId);
  return post;
}

export async function requireLeadOwner(id: number, userId: string) {
  const lead = await getDb().select().from(Leads).where(eq(Leads.id, id)).get();
  if (!lead) {
    throw new ActionError({ code: "NOT_FOUND", message: "Contact not found" });
  }
  await requireProjectOwner(lead.projectId, userId);
  return lead;
}
