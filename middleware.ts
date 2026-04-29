import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  // Temporarily disabled for testing
  // const { userId } = await auth();
  // if (!userId) {
  //   const { signInUrl } = auth();
  //   return new Response("Redirecting to sign-in", {
  //     status: 302,
  //     headers: { Location: signInUrl },
  //   });
  // }
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/(api|trpc)(.*)",
  ],
};