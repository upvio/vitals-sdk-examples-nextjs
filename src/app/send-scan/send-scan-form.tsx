'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import {
  createScanWithMagicLink,
  getBusinessAlias,
  listLinks,
  listPatients,
  type Patient,
  type VitalsLink,
} from '@/app/actions'
import { vitalsUrl } from '@/lib/urls'

const DEFAULT_INPUT_DATA = JSON.stringify(
  {
    age: 35,
    height: 170,
    weight: 70,
    gender: 'male',
    smokingStatus: 'never',
  },
  null,
  2,
)

type View =
  | { kind: 'form' }
  | { kind: 'result'; magicLinkUrl: string; patientName: string }

export default function SendScanForm() {
  const [view, setView] = useState<View>({ kind: 'form' })
  const [patients, setPatients] = useState<Patient[]>([])
  const [links, setLinks] = useState<VitalsLink[]>([])
  const [alias, setAlias] = useState<string>()
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedLinkId, setSelectedLinkId] = useState('')
  const [inputJson, setInputJson] = useState(DEFAULT_INPUT_DATA)
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const patient = patients.find((p) => p.id === selectedPatientId)
    const link = links.find((l) => l.id === selectedLinkId)
    if (!patient || !link) return

    let inputData: Record<string, unknown> | undefined
    try {
      inputData = JSON.parse(inputJson) as Record<string, unknown>
    } catch {
      setError('Invalid JSON in input data.')
      return
    }

    setSubmitting(true)
    setError(undefined)

    const result = await createScanWithMagicLink(
      patient.id,
      link.id,
      inputData,
    )
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

  if (view.kind === 'result') {
    return (
      <>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold text-foreground">
            Magic link for {view.patientName}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            The scan was created with your pre-filled data. Send this URL to the
            patient:
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
              className="mb-1 block text-sm font-semibold uppercase text-foreground"
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
              The patient this scan will be created for. They'll receive a magic
              link to access it directly.{' '}
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
              className="mb-1 block text-sm font-semibold uppercase text-foreground"
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
              The scan link to use. This determines which health metrics will be
              measured.{' '}
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

          <div>
            <label
              htmlFor="inputData"
              className="mb-1 block text-sm font-semibold uppercase text-foreground"
            >
              Input data
            </label>
            <textarea
              id="inputData"
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              rows={10}
              className="w-full rounded-md border border-input bg-background px-2 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-sm leading-tight text-muted-foreground">
              Pre-filled health details in JSON format. The patient won't need
              to enter these manually — they'll go straight to the face scan.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !selectedPatientId || !selectedLinkId}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Scan & Generate Magic Link'}
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
