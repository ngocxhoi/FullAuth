// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  modules: ["@nuxt/ui"],

  appConfig: {
    title: "FullAuth",
    description: "Full function of an auth system",
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL,
    },
  },
});
