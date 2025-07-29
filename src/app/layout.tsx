import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
// PWA components disabled due to build issues
// import { PWAInstallButton, OfflineIndicator } from '@/components/pwa/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NAMC NorCal Member Portal',
    template: '%s | NAMC NorCal Member Portal'
  },
  description: 'Comprehensive digital platform for minority contractors in Northern California. Connect, grow, and succeed with NAMC NorCal.',
  keywords: [
    'NAMC',
    'minority contractors',
    'construction',
    'Northern California',
    'contractor portal',
    'business opportunities',
    'networking',
    'training'
  ],
  authors: [{ name: 'NAMC NorCal' }],
  creator: 'NAMC NorCal',
  publisher: 'NAMC NorCal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://namc-norcal.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://namc-norcal.org',
    title: 'NAMC NorCal Member Portal',
    description: 'Comprehensive digital platform for minority contractors in Northern California.',
    siteName: 'NAMC NorCal Member Portal',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NAMC NorCal Member Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NAMC NorCal Member Portal',
    description: 'Comprehensive digital platform for minority contractors in Northern California.',
    images: ['/og-image.jpg'],
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'NAMC Portal',
    'application-name': 'NAMC Portal',
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NAMC Portal" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {/* PWA Offline Indicator - disabled due to build issues */}
          {/* <OfflineIndicator /> */}
          
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          
          {/* PWA Install Button - disabled due to build issues */}
          {/* <PWAInstallButton /> */}
          
          <Toaster />
        </Providers>
      </body>
    </html>
  )
} 