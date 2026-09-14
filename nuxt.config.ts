import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/style.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Single Class Management System • SMS Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Modern Single Class Management System with real-time grade calculations, teacher gradebook, student portal, and admin lock controls.'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap'
        }
      ]
    }
  }
})
