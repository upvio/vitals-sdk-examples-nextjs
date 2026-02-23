'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  listScans,
  retrieveScan,
  type ScanDetail,
  type ScanSummary,
} from '@/app/actions'
import { BackLink } from '@/components/ui/back-link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { vitalsUrl } from '@/lib/urls'

export default function ScanResultsForm({
  alias,
}: { alias?: string }) {
  const [scans, setScans] = useState<ScanSummary[]>([])
  const [selectedScanId, setSelectedScanId] = useState('')
  const [scanDetail, setScanDetail] = useState<ScanDetail>()
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string>()

  const fetchScans = useCallback(async () => {
    setLoading(true)
    setError(undefined)

    const result = await listScans()
    if (result.error) {
      setError(result.error)
    } else {
      setScans(result.scans ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchScans()
  }, [fetchScans])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedScanId) return

    setFetching(true)
    setError(undefined)
    setScanDetail(undefined)

    const result = await retrieveScan(selectedScanId)
    setFetching(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setScanDetail(result.scan)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString()
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading...</p>
    )
  }

  return (
    <>
      <Card
        as="form"
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        <div>
          <Label htmlFor="scan">Scan</Label>
          <Select
            id="scan"
            value={selectedScanId}
            onChange={(e) => {
              setSelectedScanId(e.target.value)
              setScanDetail(undefined)
            }}
            required
          >
            <option value="">Select a scan</option>
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {formatDate(s.createdAt)} — {s.status}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-sm leading-tight text-muted-foreground">
            Pick a scan to view its details, input data, and
            results. Don't see any scans? Visit your{' '}
            {alias && (
              <a
                href={vitalsUrl(alias)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Vitals Dashboard
              </a>
            )}{' '}
            to run some scans and they will appear here.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={fetching || !selectedScanId}
          fullWidth
        >
          {fetching ? 'Fetching...' : 'Fetch Scan'}
        </Button>
      </Card>

      {scanDetail && (
        <Card className="mt-6 flex flex-col gap-4 text-sm">
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              Status
            </span>
            <span className="text-foreground">
              {scanDetail.status}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              Created
            </span>
            <span className="text-muted-foreground">
              {formatDate(scanDetail.createdAt)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              Updated
            </span>
            <span className="text-muted-foreground">
              {formatDate(scanDetail.updatedAt)}
            </span>
          </div>

          {scanDetail.startedAt && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                Started
              </span>
              <span className="text-muted-foreground">
                {formatDate(scanDetail.startedAt)}
              </span>
            </div>
          )}

          {scanDetail.patientId && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                Patient ID
              </span>
              <span className="break-all font-mono text-xs text-muted-foreground">
                {scanDetail.patientId}
              </span>
            </div>
          )}

          {scanDetail.vitalsLinkId && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                Vitals Link ID
              </span>
              <span className="break-all font-mono text-xs text-muted-foreground">
                {scanDetail.vitalsLinkId}
              </span>
            </div>
          )}

          {scanDetail.includedMetrics.length > 0 && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                Metrics
              </span>
              <span className="text-muted-foreground">
                {scanDetail.includedMetrics.join(', ')}
              </span>
            </div>
          )}

          {scanDetail.inputData != null ? (
            <div className="flex flex-col">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Input Data
              </h3>
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm text-foreground">
                {JSON.stringify(scanDetail.inputData, null, 2)}
              </pre>
            </div>
          ) : null}

          {scanDetail.results != null ? (
            <div className="flex flex-col">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Results
              </h3>
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm text-foreground">
                {JSON.stringify(scanDetail.results, null, 2)}
              </pre>
            </div>
          ) : null}

          {scanDetail.inputData == null &&
            scanDetail.results == null && (
              <p className="text-sm text-muted-foreground">
                No input data or results available for this scan.
              </p>
            )}
        </Card>
      )}

      <BackLink />
    </>
  )
}
