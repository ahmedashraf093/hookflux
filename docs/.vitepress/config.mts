import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/hookflux/',
  title: "HookFlux",
  description: "Self-hosted webhook deployment automation",
  head: [['link', { rel: 'icon', href: '/hookflux/logo.svg' }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' },
      { text: 'GitHub', link: 'https://github.com/ahmedashraf093/hookflux' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Core Concepts', link: '/concepts' }
        ]
      },
      {
        text: 'Usage',
        items: [
          { text: 'Configuration', link: '/configuration' },
          { text: 'Webhooks & Integrations', link: '/webhooks' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ahmedashraf093/hookflux' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Ahmed'
    }
  }
})
