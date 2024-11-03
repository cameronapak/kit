import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { PageView, db } from "astro:db";
import { isbot } from "isbot";

export const pageView = {
  updatePageView: defineAction({
    input: z.object({
      url: z.string()
    }),
    handler: async ({ url }, context) => {
      const { request } = context;

      if (isbot(request.headers.get("user-agent"))) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "This endpoint is not available for bots"
        });
      }
      if (url === "/page-views") {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "This url is not tracked"
        });
      }
      try {
        // Remove trailing slash if it exists...
        const urlWithoutTrailingSlash = url.endsWith("/") ? url.slice(0, -1) : url;
        await db.insert(PageView).values({
          url: urlWithoutTrailingSlash,
          date: new Date()
        });
        return {};
      } catch (e) {
        console.error(e);
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Error updating views"
        });
      }
    }
  })
};
