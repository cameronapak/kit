import { clerkMiddleware } from "@clerk/astro/server";

export const onRequest = clerkMiddleware((auth, context) => {
  const { redirectToSignIn, userId } = auth();

  const { pathname } = context.url;
  if (!userId && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    return redirectToSignIn();
  }
});
