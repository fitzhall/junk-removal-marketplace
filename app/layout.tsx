import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Junk Removal Quote - Instant Pricing with AI',
  description: 'Get instant junk removal quotes by uploading a photo. AI-powered pricing and local provider matching.',
  keywords: ['junk removal', 'hauling', 'waste removal', 'instant quote', 'debris removal'],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#22c55e',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Junk Removal Quote - Instant Pricing',
    description: 'Upload a photo, get an instant quote',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}