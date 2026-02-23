'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import {
  generateMagicLink,
  getBusinessAlias,
  listLinks,
  listPatients,
  type Patient,
  type VitalsLink,
} from '@/app/actions'
import { scanUrl, vitalsUrl } from '@/lib/urls'

type View =
  | { kind: 'form' }
  | { kind: 'result'; magicLinkUrl: string; patientName: string }

export default function MagicLinkForm() {
  const searchParams = useSearchParams()

  const [view, setView] = useState<View>({ kind: 'form' })
  const [patients, setPatients] = useState<Patient[]>([])
  const [links, setLinks] = useState<VitalsLink[]>([])
  const [alias, setAlias] = useState<string>()
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedLinkId, setSelectedLinkId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(undefined)

    const [patientsResult, linksResult, businessAlias] = await Promise.all([
      listPatients(),
      listLinks(),
      getBusinessAlias(),
    ])

    if (patientsResult.error) {
      setError(patientsResult.error)
    } else {
      setPatients(patientsResult.patients ?? [])
    }

    if (linksResult.error) {
      setError(linksResult.error)
    } else {
      setLinks(linksResult.links ?? [])
    }

    setAlias(businessAlias)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (patientId && patients.length > 0) {
      const match = patients.find((p) => p.id === patientId)
      if (match) setSelectedPatientId(match.id)
    }
  }, [searchParams, patients])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const patient = patients.find((p) => p.id === selectedPatientId)
    const link = links.find((l) => l.id === selectedLinkId)
    if (!patient || !link) return

    setSubmitting(true)
    setError(undefined)
    const result = await generateMagicLink(patient.id, link.slug)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.magicLinkUrl) {
      setView({
        kind: 'result',
        magicLinkUrl: result.magicLinkUrl,
        patientName: patient.name,
      })
    }
  }

  const dashboardUrl = alias
    ? vitalsUrl(`${alias}/clients`)
    : undefined

  const selectedSlug = links.find((l) => l.id === selectedLinkId)?.slug
  const redirectUrl =
    alias && selectedSlug
      ? scanUrl(`${alias}/links/${selectedSlug}`)
      : undefined

  if (view.kind === 'result') {
    return (
      <>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold text-foreground">
            Magic link for {view.patientName}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground ">
            Send this URL to the patient:
          </p>
          <div className="rounded-md border border-border bg-muted p-3">
            <code className="break-all text-sm text-foreground">
              {view.magicLinkUrl}
            </code>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(view.magicLinkUrl)}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => setView({ kind: 'form' })}
              className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:opacity-90"
            >
              Generate another
            </button>
          </div>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-primary hover:underline"
        >
          &larr; Back to home
        </Link>
      </>
    )
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="patient"
              className="mb-1 block text-sm font-semibold text-foreground uppercase"
            >
              Patient
            </label>
            <select
              id="patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>

            <p className="mt-1 text-sm leading-tight text-muted-foreground">
              When the patient opens the magic link, they'll be automatically
              signed in as this person, no login needed. Don't see the patient
              you want to create a link for?{' '}
              {dashboardUrl && (
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Create Patient
                </a>
              )}
            </p>
          </div>

          <div>
            <label
              htmlFor="link"
              className="mb-1 block text-sm font-semibold text-foreground uppercase"
            >
              Vitals link
            </label>
            <select
              id="link"
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a link</option>
              {links.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm leading-tight text-muted-foreground">
              After signing in, the patient will be redirected to this scan page
              where they can complete their health check. Don't have a link set
              up yet?{' '}
              {alias && (
                <a
                  href={vitalsUrl(`${alias}/links`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Create Vitals Link
                </a>
              )}
            </p>
          </div>

          {redirectUrl && (
            <div>
              <label
                htmlFor="redirectUrl"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Redirect URL
              </label>
              <input
                id="redirectUrl"
                type="text"
                readOnly
                value={redirectUrl}
                className="w-full rounded-md border border-input bg-muted px-2 py-2 text-sm text-muted-foreground focus:outline-none"
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !selectedPatientId || !selectedLinkId}
          className="rounded-md bg-primary px-4 w-full py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Generating...' : 'Generate Magic Link'}
        </button>
      </form>
      <Link
        href="/"
        className="mt-6 inline-block text-sm text-primary hover:underline"
      >
        &larr; Back to home
      </Link>
    </>
  )
}
