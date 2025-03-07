import { checkAccessToken } from "~/composables/useAPI";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const isProtectedRoute = protectedRoutes.includes(to.path);
  const isPublicRoute = publicRoute.includes(to.path);

  const accessToken = await checkAccessToken();

  if (isProtectedRoute && !accessToken) return navigateTo("/auth/login");

  if (isPublicRoute && accessToken) return navigateTo("/");

  return;
});
