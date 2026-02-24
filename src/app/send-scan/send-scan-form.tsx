'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  createScanWithMagicLink,
  listLinks,
  listPatients,
  type Patient,
  type VitalsLink,
} from '@/app/actions'
import { BackLink } from '@/components/ui/back-link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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

export default function SendScanForm({ alias }: { alias?: string }) {
  const [view, setView] = useState<View>({ kind: 'form' })
  const [patients, setPatients] = useState<Patient[]>([])
  const [links, setLinks] = useState<VitalsLink[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedLinkId, setSelectedLinkId] = useState('')
  const [inputJson, setInputJson] = useState(DEFAULT_INPUT_DATA)
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
      setError(patientsResult.error.title)
    } else {
      setPatients(patientsResult.data ?? [])
    }

    if (linksResult.error) {
      setError(linksResult.error.title)
    } else {
      setLinks(linksResult.data ?? [])
    }

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

    const inputData = JSON.parse(inputJson) as Record<string, unknown>

    setSubmitting(true)
    setError(undefined)

    const result = await createScanWithMagicLink(patient.id, link.id, inputData)
    setSubmitting(false)
    console.log('createScanWithMagicLink result', result)

    if (result.error) {
      setError(result.error.title)
      return
    }

    if (result.data) {
      setView({
        kind: 'result',
        magicLinkUrl: result.data.url,
        patientName: patient.name,
      })
    }
  }

  const dashboardUrl = alias ? vitalsUrl(`${alias}/clients`) : undefined

  if (view.kind === 'result') {
    return (
      <>
        <Card>
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(view.magicLinkUrl)}
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
    return <p className="text-sm text-muted-foreground">Loading...</p>
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
              onChange={(e) => setSelectedPatientId(e.target.value)}
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
            <Label htmlFor="inputData">Input data</Label>
            <Textarea
              id="inputData"
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              rows={10}
            />
            <p className="mt-1 text-sm leading-tight text-muted-foreground">
              Pre-filled health details in JSON format. The patient won't need
              to enter these manually — they'll go straight to the face scan.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={submitting || !selectedPatientId || !selectedLinkId}
          fullWidth
        >
          {submitting ? 'Creating...' : 'Create Scan & Generate Magic Link'}
        </Button>
      </Card>
      <BackLink />
    </>
  )
}
