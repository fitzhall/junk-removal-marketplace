import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { StructuredData } from '@/components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://junkremovalai.com'),
  title: {
    default: 'Instant Junk Removal Quotes | AI-Powered Pricing in 60 Seconds',
    template: '%s | Junk Removal AI'
  },
  description: 'Get instant junk removal quotes with AI. Upload a photo, receive accurate pricing in seconds, and book licensed pros. Same-day service available. Save time and money on junk removal.',
  keywords: [
    'junk removal',
    'instant quote',
    'AI pricing',
    'hauling service',
    'waste removal',
    'debris removal',
    'furniture removal',
    'appliance disposal',
    'same day junk removal',
    'licensed haulers',
    'junk removal cost',
    'free junk removal quote',
    'eco-friendly disposal'
  ],
  authors: [{ name: 'Junk Removal AI' }],
  creator: 'Junk Removal AI',
  publisher: 'Junk Removal AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Instant Junk Removal Quotes | AI-Powered Pricing in 60 Seconds',
    description: 'Get instant junk removal quotes with AI. Upload a photo, receive accurate pricing in seconds, and book licensed pros. Same-day service available.',
    siteName: 'Junk Removal AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Junk Removal AI - Instant Quotes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instant Junk Removal Quotes | AI-Powered Pricing in 60 Seconds',
    description: 'Get instant junk removal quotes with AI. Upload a photo, receive accurate pricing in seconds.',
    images: ['/og-image.jpg'],
    creator: '@junkremovalai',
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'google-site-verification-code', // Add your verification code
    // yandex: 'yandex-verification-code',
    // bing: 'bing-verification-code',
  },
  category: 'Business Services',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8B5CF6',
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
        <StructuredData />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}