import type { APIRoute } from "astro";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import { db, eq, Posts, Projects, desc } from "astro:db";
import { getCldImageUrl } from "astro-cloudinary/helpers";

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

  const logoImageUrl = await getCldImageUrl({
    src: project?.logoImageId || "",
    width: 256,
    crop: "fill",
    format: "webp"
  });

  return rss({
    title: project.title,
    description: project.content,
    site: request.url,
    items: posts.map((post) => {
      const item = {
        title: post.title,
        description: post.content,
        pubDate: post.createdAt,
        link: `/app/${project.slug}/posts/${post.slug}`
      } as RSSFeedItem;

      if (logoImageUrl) {
        item.enclosure = {
          url: logoImageUrl,
          length: 0,
          type: "image/png"
        };
      }

      return item;
    })
  });
};
