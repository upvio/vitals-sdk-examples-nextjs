'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import {
  getBusinessAlias,
  listScans,
  retrieveScan,
  type ScanDetail,
  type ScanSummary,
} from '@/app/actions'

export default function ScanResultsForm() {
  const [scans, setScans] = useState<ScanSummary[]>([])
  const [alias, setAlias] = useState<string>()
  const [selectedScanId, setSelectedScanId] = useState('')
  const [scanDetail, setScanDetail] = useState<ScanDetail>()
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string>()

  const fetchScans = useCallback(async () => {
    setLoading(true)
    setError(undefined)

    const [result, businessAlias] = await Promise.all([
      listScans(),
      getBusinessAlias(),
    ])
    if (result.error) {
      setError(result.error)
    } else {
      setScans(result.scans ?? [])
    }

    setAlias(businessAlias)
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
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="scan"
            className="mb-1 block text-sm font-semibold uppercase text-foreground"
          >
            Scan
          </label>
          <select
            id="scan"
            value={selectedScanId}
            onChange={(e) => {
              setSelectedScanId(e.target.value)
              setScanDetail(undefined)
            }}
            required
            className="w-full rounded-md border border-input bg-background px-2 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a scan</option>
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {formatDate(s.createdAt)} — {s.status}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm leading-tight text-muted-foreground">
            Pick a scan to view its details, input data, and results. Don't see
            any scans? Visit your{' '}
            {alias && (
              <a
                href={`https://vitals.upvio.com/${alias}`}
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={fetching || !selectedScanId}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {fetching ? 'Fetching...' : 'Fetch Scan'}
        </button>
      </form>

      {scanDetail && (
        <div className="mt-6 text-sm rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Status</span>
            <span className="text-foreground">{scanDetail.status}</span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Created</span>
            <span className="text-muted-foreground">
              {formatDate(scanDetail.createdAt)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Updated</span>
            <span className="text-muted-foreground">
              {formatDate(scanDetail.updatedAt)}
            </span>
          </div>

          {scanDetail.startedAt && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Started</span>
              <span className="text-muted-foreground">
                {formatDate(scanDetail.startedAt)}
              </span>
            </div>
          )}

          {scanDetail.patientId && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Patient ID</span>
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
              <span className="font-semibold text-foreground">Metrics</span>
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
              <h3 className="mb-2 text-sm font-semibold  text-foreground">
                Results
              </h3>
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-sm text-foreground">
                {JSON.stringify(scanDetail.results, null, 2)}
              </pre>
            </div>
          ) : null}

          {scanDetail.inputData == null && scanDetail.results == null && (
            <p className="text-sm text-muted-foreground">
              No input data or results available for this scan.
            </p>
          )}
        </div>
      )}

      <Link
        href="/"
        className="mt-6 inline-block text-sm text-primary hover:underline"
      >
        &larr; Back to home
      </Link>
    </>
  )
}
