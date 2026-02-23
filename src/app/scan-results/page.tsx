import { Suspense } from 'react'

import ScanResultsForm from './scan-results-form'

export default function ScanResultsPage() {
  const alias = process.env.UPVIO_BUSINESS_ALIAS

  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Query scan results
        </h1>
        <p className="mb-6 text-sm leading-tight text-muted-foreground">
          Select a scan to view its status, input data, and health metric
          results.
        </p>
      </div>
      <Suspense>
        <ScanResultsForm alias={alias} />
      </Suspense>
    </main>
  )
}
