import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Junk Removal Quote - Instant Pricing with AI',
  description: 'Get instant junk removal quotes by uploading a photo. AI-powered pricing and local provider matching.',
  keywords: ['junk removal', 'hauling', 'waste removal', 'instant quote', 'debris removal'],
  openGraph: {
    title: 'Junk Removal Quote - Instant Pricing',
    description: 'Upload a photo, get an instant quote',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}