import type { APIRoute } from "astro";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import { htmlDescription } from "@/libs/html-description";
import { getDb, eq, Projects, desc, and } from "@/libs/db";
import { getCldImageUrl } from "@/libs/cloudinary";

export const GET: APIRoute = async ({ request }) => {
  const projects = await getDb()
    .select()
    .from(Projects)
    .where(and(eq(Projects.isPublished, true), eq(Projects.isFeatured, true)))
    .orderBy(desc(Projects.updatedAt));

  const items: RSSFeedItem[] = await Promise.all(
    projects.map(async (project) => {
      const logoImageUrl = project.logoImageId
        ? await getCldImageUrl({
            src: project.logoImageId,
            width: 256,
            crop: "fill",
            format: "webp"
          })
        : null;

      const bannerImageUrl = project.bannerImageId
        ? await getCldImageUrl({
            src: project.bannerImageId,
            width: 512,
            crop: "fill",
            format: "webp"
          })
        : null;

      const item: RSSFeedItem = {
        title: project.title,
        description: htmlDescription(project.content, true),
        pubDate: project.createdAt,
        link: `/app/${project.slug}`,
        // Add a link to the project's own RSS feed
        customData: `
          <projectRssFeed>/api/posts/rss.xml?projectId=${project.id}</projectRssFeed>
          ${bannerImageUrl ? `<bannerImageUrl>${bannerImageUrl}</bannerImageUrl>` : ""}
          ${logoImageUrl ? `<logoImageUrl>${logoImageUrl}</logoImageUrl>` : ""}
          ${project.youtubeVideoUrl ? `<youtubeVideoUrl>${project.youtubeVideoUrl}</youtubeVideoUrl>` : ""}
        `.trim()
      };

      if (logoImageUrl) {
        item.enclosure = {
          url: logoImageUrl,
          length: 0,
          type: "image/webp"
        };
      }

      return item;
    })
  );

  return rss({
    title: "All Projects",
    description: "A list of all published projects and their RSS feeds",
    site: request.url,
    items
  });
};
