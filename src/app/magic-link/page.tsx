import { Suspense } from 'react'

import MagicLinkForm from './magic-link-form'

export default function MagicLinkPage() {
  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:px-8 ">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Create magic link
        </h1>
        <p className="mb-6 text-sm text-muted-foreground leading-tight">
          Magic links are authenticated URLs that take a patient directly to a
          scan without needing to sign up or log in.
        </p>
      </div>
      <Suspense>
        <MagicLinkForm />
      </Suspense>
    </main>
  )
}
