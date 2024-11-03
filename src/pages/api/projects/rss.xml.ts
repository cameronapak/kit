import type { APIRoute } from "astro";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import { db, eq, Projects, desc } from "astro:db";
import { getCldImageUrl } from "astro-cloudinary/helpers";

export const GET: APIRoute = async ({ request }) => {
  const projects = await db
    .select()
    .from(Projects)
    .where(eq(Projects.isPublished, true))
    .orderBy(desc(Projects.createdAt));

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
        description: project.content,
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
