import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { db, eq, Posts, Projects, desc } from "astro:db";

export const GET: APIRoute = async ({ params, request }) => {
  const searchParams = new URL(request.url).searchParams;
  const projectId = Number(searchParams.get("projectId") || 0);

  if (!projectId) {
    return new Response("Project ID is required", { status: 400 });
  }

  const posts = await db.select().from(Posts).where(eq(Posts.projectId, projectId)).orderBy(desc(Posts.createdAt));
  const projects = await db.select().from(Projects).where(eq(Projects.id, projectId)).limit(1);
  const project = projects[0];

  if (!project) {
    return new Response("Project not found", { status: 404 });
  }

  return rss({
    title: project.title,
    description: project.content,
    site: request.url,
    items: posts.map((post) => ({
      title: post.title,
      description: post.content,
      pubDate: post.createdAt,
      link: `/app/${project.slug}/posts/${post.slug}`,
    })),
  });
};
