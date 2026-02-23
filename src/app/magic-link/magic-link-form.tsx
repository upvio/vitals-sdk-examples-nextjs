'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import {
  generateMagicLink,
  listLinks,
  listPatients,
  type Patient,
  type VitalsLink,
} from '@/app/actions'
import { BackLink } from '@/components/ui/back-link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { scanUrl, vitalsUrl } from '@/lib/urls'

type View =
  | { kind: 'form' }
  | { kind: 'result'; magicLinkUrl: string; patientName: string }

export default function MagicLinkForm({ alias }: { alias?: string }) {
  const searchParams = useSearchParams()

  const [view, setView] = useState<View>({ kind: 'form' })
  const [patients, setPatients] = useState<Patient[]>([])
  const [links, setLinks] = useState<VitalsLink[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedLinkId, setSelectedLinkId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(undefined)

    const [patientsResult, linksResult] = await Promise.all([
      listPatients(),
      listLinks(),
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

  const selectedSlug = links.find(
    (l) => l.id === selectedLinkId,
  )?.slug
  const redirectUrl =
    alias && selectedSlug
      ? scanUrl(`${alias}/links/${selectedSlug}`)
      : undefined

  if (view.kind === 'result') {
    return (
      <>
        <Card>
          <h2 className="mb-1 text-xl font-semibold text-foreground">
            Magic link for {view.patientName}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Send this URL to the patient:
          </p>
          <div className="rounded-md border border-border bg-muted p-3">
            <code className="break-all text-sm text-foreground">
              {view.magicLinkUrl}
            </code>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                navigator.clipboard.writeText(view.magicLinkUrl)
              }
            >
              Copy
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setView({ kind: 'form' })}
            >
              Generate another
            </Button>
          </div>
        </Card>
        <BackLink />
      </>
    )
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading...</p>
    )
  }

  return (
    <>
      <Card as="form" onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col gap-6">
          <div>
            <Label htmlFor="patient">Patient</Label>
            <Select
              id="patient"
              value={selectedPatientId}
              onChange={(e) =>
                setSelectedPatientId(e.target.value)
              }
              required
            >
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </option>
              ))}
            </Select>

            <p className="mt-1 text-sm leading-tight text-muted-foreground">
              When the patient opens the magic link, they'll be
              automatically signed in as this person, no login
              needed. Don't see the patient you want to create a
              link for?{' '}
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
            <Label htmlFor="link">Vitals link</Label>
            <Select
              id="link"
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              required
            >
              <option value="">Select a link</option>
              {links.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-sm leading-tight text-muted-foreground">
              After signing in, the patient will be redirected to
              this scan page where they can complete their health
              check. Don't have a link set up yet?{' '}
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
              <Input
                id="redirectUrl"
                type="text"
                readOnly
                value={redirectUrl}
                className="bg-muted text-sm text-muted-foreground"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={
            submitting || !selectedPatientId || !selectedLinkId
          }
          fullWidth
        >
          {submitting ? 'Generating...' : 'Generate Magic Link'}
        </Button>
      </Card>
      <BackLink />
    </>
  )
}
