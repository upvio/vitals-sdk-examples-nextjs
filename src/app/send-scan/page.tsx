import { Suspense } from 'react'

import SendScanForm from './send-scan-form'

export default function SendScanPage() {
  const alias = process.env.UPVIO_BUSINESS_ALIAS

  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Pre-fill scan data
        </h1>
        <p className="mb-6 text-sm leading-tight text-muted-foreground">
          Pre-fill patient health details so they skip the form and go straight
          to the face scan. A magic link will be generated to send to the
          patient.
        </p>
      </div>
      <Suspense>
        <SendScanForm alias={alias} />
      </Suspense>
    </main>
  )
}
