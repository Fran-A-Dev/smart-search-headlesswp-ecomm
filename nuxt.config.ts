// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/image"],
  image: {
    domains: ["smartcache.wpenginepowered.com"],
    quality: 80,
    format: ["webp", "jpg", "png"],
  },
  app: {
    head: {
      title: "Nuxt headlesswp eCommerce",
      meta: [{ name: "description", content: "Nuxt headlesswp eCommerce" }],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/icon?family=Material+Icons",
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      wordpressUrl: "",
      smartSearchUrl: "",
      smartSearchToken: "",
    },
  },
});
