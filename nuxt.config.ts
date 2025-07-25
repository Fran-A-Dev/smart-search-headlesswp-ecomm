// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: process.env.NODE_ENV === "development" },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/image"],

  // Production optimizations
  nitro: {
    compressPublicAssets: true,
  },

  // CSS optimization
  css: ["~/assets/main/main.css"],

  // Build optimizations
  build: {
    transpile: process.env.NODE_ENV === "production" ? ["vue"] : [],
  },
  image: {
    domains: [
      new URL(process.env.NUXT_PUBLIC_WORDPRESS_URL || "").hostname,
    ].filter(Boolean),
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
