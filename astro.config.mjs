import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import alpinejs from "@astrojs/alpinejs";
import netlify from "@astrojs/netlify";
import sentry from "@sentry/astro";
import db from "@astrojs/db";
import clerk from "@clerk/astro";
import lottie from "astro-integration-lottie";

const SENTRY_DSN = import.meta.env.SENTRY_DSN;
const SENTRY_AUTH_TOKEN = import.meta.env.SENTRY_AUTH_TOKEN;
const SENTRY_PROJECT = import.meta.env.SENTRY_PROJECT;
const isSentryEnabled = SENTRY_DSN && SENTRY_AUTH_TOKEN && SENTRY_PROJECT;

// https://astro.build/config
export default defineConfig({
  integrations: [
    db(),
    tailwind(), // This entrypoint file is where Alpine plugins are registered.
    alpinejs({
      entrypoint: "/src/entrypoint"
    }),
    // To enable Sentry monitoring, add the following environment variables.
    // Learn more at https://docs.sentry.io/platforms/javascript/guides/astro/#prerequisites.
    isSentryEnabled &&
      sentry({
        dsn: SENTRY_DSN,
        auth: SENTRY_AUTH_TOKEN,
        project: SENTRY_PROJECT
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
  adapter: netlify(),
  experimental: {
    serverIslands: true
  }
});
