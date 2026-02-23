import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vitals SDK Examples',
  description: 'Explore Vitals SDK capabilities',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
