import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Focus Timer Study | DATASCI 241',
  description: 'Causal inference experiment exploring how timer visualization affects sustained focus',
  keywords: ['focus', 'timer', 'productivity', 'pomodoro', 'experiment'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          {children}
        </main>
      </body>
    </html>
  )
}
