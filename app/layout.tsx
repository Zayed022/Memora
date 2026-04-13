import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Memora — Your AI Second Brain', template: '%s | Memora' },
  description: 'Save anything. Ask anything. Never lose a good idea again. Memora uses AI to organise your knowledge and surface connections you never knew existed.',
  keywords: ['second brain', 'knowledge management', 'AI notes', 'personal knowledge base'],
  openGraph: {
    type: 'website',
    siteName: 'Memora',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@memoraapp' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased">
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1714',
                color: '#f7f6f2',
                border: '1px solid #47413a',
                borderRadius: '10px',
                fontSize: '13px',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
