import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { QuizProvider } from '@/context/quiz-context'
import { BookingsProvider } from '@/context/bookings-context'
import { OperatorProvider } from '@/context/operator-context'
import { ToastProvider } from '@/context/toast-context'
import { ToastContainer } from '@/components/common/toast-container'
import './globals.css'

export const metadata: Metadata = {
  title: 'AfriConnect - Authentic Cultural Tourism',
  description: 'Discover authentic African cultural experiences. Connect directly with local communities and master artisans for immersive cultural tourism.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <ToastProvider>
          <QuizProvider>
            <BookingsProvider>
              <OperatorProvider>
                {children}
                <ToastContainer />
                {process.env.NODE_ENV === 'production' && <Analytics />}
              </OperatorProvider>
            </BookingsProvider>
          </QuizProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
