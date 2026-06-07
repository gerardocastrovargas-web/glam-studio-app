import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Glam Studio — Sistema de Gestión',
  description: 'Sistema de gestión y agenda para Glam Studio Estética, Mexicali, Baja California.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Glam Studio',
  },
}

export const viewport = {
  themeColor: '#0d1117',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}