// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import alpinejs from "@astrojs/alpinejs";
import netlify from "@astrojs/netlify";
import clerk from "@clerk/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [
    alpinejs({
      entrypoint: "/src/entrypoint"
    }),
    clerk()
  ],
  vite: {
    css: {
      postcss: { plugins: [tailwindcss(), autoprefixer()] }
    }
  },
  redirects: {
    "/app/1-introducing-faith-tools-kit": "/app/kit",
    "/app/1/posts/kit-update-1": "/app/kit/posts/kit-update-1",
    "/app/1/posts/introducing-kit": "/app/kit/posts/introducing-kit"
  },
  output: "server",
  adapter: netlify()
});
