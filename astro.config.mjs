// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import alpinejs from "@astrojs/alpinejs";
import netlify from "@astrojs/netlify";
import db from "@astrojs/db";
import clerk from "@clerk/astro";
import lottie from "astro-integration-lottie";

// https://astro.build/config
export default defineConfig({
  integrations: [
    db(),
    tailwind(), // This entrypoint file is where Alpine plugins are registered.
    alpinejs({
      entrypoint: "/src/entrypoint"
    }),
    clerk(),
    lottie()
  ],
  vite: {
    optimizeDeps: {
      exclude: ["astro:db"]
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
