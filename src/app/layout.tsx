import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import './globals.css'
import MissingEnvVars from './missing-env-vars'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const REQUIRED_ENV_VARS = [
  'UPVIO_API_KEY',
  'UPVIO_BUSINESS_ID',
  'UPVIO_BUSINESS_ALIAS',
] as const

export const metadata: Metadata = {
  title: 'Vitals SDK Examples',
  description: 'Explore Vitals SDK capabilities',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])

  return (
    <html lang="en" className={geist.variable}>
      <body className="flex min-h-screen flex-col items-center justify-center">
        {missing.length > 0 ? (
          <MissingEnvVars missing={[...missing]} />
        ) : (
          children
        )}
      </body>
    </html>
  )
}
