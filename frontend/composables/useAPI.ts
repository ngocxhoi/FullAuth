import type { FetchError } from "ofetch";
import type {
  APIResponseError,
  APIResponseType,
  LoginType,
  MfaVerify,
  RegisterType,
} from "~/lib/type";

export const publicRoute = [
  "/auth/login",
  "/auth/register",
  "/auth/password/forgot",
  "/auth/password/reset",
];
export const protectedRoutes = [
  "/",
  "/auth/user",
  "/auth/confirm-account",
  "/auth/verify-mfa",
];

export const getAccessToken = async () => {
  const config = useRuntimeConfig();

  const { error } = await useFetch<void, FetchError<APIResponseError>>(
    "/auth/refresh",
    {
      method: "POST" as any,
      baseURL: config.public.baseUrl,
      credentials: "include",
      watch: false,
    }
  );

  return {
    errorRefresh: error,
  };
};

export const checkAccessToken = async () => {
  const config = useRuntimeConfig();

  const { data } = await useFetch("/auth/access/check", {
    method: "GET" as any,
    baseURL: config.public.baseUrl,
    credentials: "include",
    watch: false,
  });

  return data.value == "YES";
};

export const authFunc = async (
  path: string,
  method = "GET",
  body?: LoginType | RegisterType | MfaVerify | { [key: string]: string }
) => {
  const config = useRuntimeConfig();
  const accessToken = await checkAccessToken();

  const isPublicRoute = publicRoute.includes(path);
  const isProtectedRoute = protectedRoutes.includes(path);

  if (!accessToken && isProtectedRoute) {
    const { errorRefresh } = await getAccessToken();
    if (errorRefresh.value?.data) {
      const data = ref(null);
      return {
        data,
        error: errorRefresh,
      };
    }
  }

  const { data, error } = await useFetch<
    APIResponseType,
    FetchError<APIResponseError>
  >(path, {
    method: method as any,
    body: method === "GET" ? undefined : JSON.stringify(body),
    baseURL: config.public.baseUrl,
    credentials: "include",
    watch: false,
  });

  return {
    data,
    error,
  };
};
