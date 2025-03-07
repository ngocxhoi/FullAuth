import type { SuccessResponse, UserSchema } from "~/lib/type";

export const useAuth = () => {
  const config = useRuntimeConfig();
  const { userData } = useStateStore();

  const signUp = async (email: string, name: string, password: string) => {
    try {
      const { data, error } = await useFetch<SuccessResponse>(
        "/auth/register",
        {
          method: "POST",
          baseURL: config.public.baseUrl,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider: "credentials",
            providerAccountId: email,
            name,
            password,
          }),
          credentials: "include",
          watch: false,
        }
      );

      if (error.value) throw error.value;

      if (data.value) await logIn(email, password);

      return data.value?.message;
    } catch (error: any) {
      console.error(error);
      showError(error);
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      const { data, error } = await useFetch<UserSchema>("/auth/login", {
        method: "POST",
        baseURL: config.public.baseUrl,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: "include",
        watch: false,
      });

      if (error.value) throw error.value;

      if (!data.value) {
        userData.value = null;
        throw new Error("User not found");
      }
      userData.value = data.value.data;

      if (!data.value.data.isEmailVerified)
        return navigateTo("/auth/verify-mfa");

      return navigateTo("/");
    } catch (error: any) {
      console.error(error);
      showError(error);
    }
  };

  const logOut = async () => {
    try {
      await useFetch("/auth/logout", {
        method: "POST",
        baseURL: config.public.baseUrl,
        credentials: "include",
        watch: false,
      });

      userData.value = null;
      useCookie("accessToken").value = null;

      return navigateTo("/auth/login");
    } catch (error: any) {
      console.error(error);
      showError(error);
    }
  };

  const verifyMFA = async (user: string, token: string) => {
    const { userData } = useStateStore();
    const accessToken = useCookie("accessToken").value;
    try {
      const { data, error } = await useFetch<SuccessResponse>("/auth/verify", {
        method: "GET",
        baseURL: config.public.baseUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        query: {
          user,
          token,
        },
        watch: false,
      });

      if (error.value) throw error.value;

      if (userData.value) userData.value.isEmailVerified = true;

      return data.value?.message;
    } catch (error: any) {
      console.error(error);
      showError(error);
    }
  };

  return { signUp, logIn, logOut, verifyMFA };
};
