export default function manifest() {
  return {
    name: 'Glam Studio',
    short_name: 'Glam Studio',
    description: 'Sistema de Gestión para Glam Studio Estética',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0c0f',
    theme_color: '#0d0c0f',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
  }
}
