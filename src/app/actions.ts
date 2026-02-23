'use server'

import { upvio } from '@/lib/upvio'

export type Patient = {
  id: string
  name: string
  email: string
}

type ListPatientsResult = {
  patients?: Patient[]
  error?: string
}

export type VitalsLink = {
  id: string
  name: string
  slug: string
}

type ListLinksResult = {
  links?: VitalsLink[]
  error?: string
}

type MagicLinkResult = {
  magicLinkUrl?: string
  error?: string
}

export async function getBusinessAlias(): Promise<string | undefined> {
  return process.env.UPVIO_BUSINESS_ALIAS
}

export async function listPatients(): Promise<ListPatientsResult> {
  try {
    const { data } = await upvio.v1.core.patients.list()
    if (!data) {
      return { error: 'Failed to fetch patients.' }
    }
    return {
      patients: data.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
      })),
    }
  } catch (err) {
    console.error('Error listing patients:', err)
    return {
      error: err instanceof Error ? err.message : 'Something went wrong',
    }
  }
}

export async function generateMagicLink(
  patientId: string,
  linkSlug: string,
): Promise<MagicLinkResult> {
  const alias = process.env.UPVIO_BUSINESS_ALIAS
  if (!alias) {
    return { error: 'UPVIO_BUSINESS_ALIAS is not configured.' }
  }

  const redirectUrl = `https://scan.upvio.com/${alias}/links/${linkSlug}`

  try {
    const { data: magicLink } = await upvio.v1.core.patients.createMagicLink(
      patientId,
      { redirectUrl },
    )

    if (!magicLink) {
      return { error: 'Failed to create magic link.' }
    }

    return { magicLinkUrl: magicLink.url }
  } catch (err) {
    console.error('Error generating magic link:', err)
    return {
      error: err instanceof Error ? err.message : 'Something went wrong',
    }
  }
}

export async function listLinks(): Promise<ListLinksResult> {
  try {
    const { data } = await upvio.v1.vitals.links.list({
      status: 'ACTIVE',
    })
    if (!data) {
      return { error: 'Failed to fetch links.' }
    }
    return {
      links: data.map((l) => ({
        id: l.id,
        name: l.name,
        slug: l.slug,
      })),
    }
  } catch (err) {
    console.error('Error listing links:', err)
    return {
      error: err instanceof Error ? err.message : 'Something went wrong',
    }
  }
}

export type ScanSummary = {
  id: string
  createdAt: string
  status: string
  patientId?: string
}

export type ScanDetail = {
  id: string
  createdAt: string
  updatedAt: string
  status: string
  patientId?: string
  vitalsLinkId?: string
  startedAt?: string | null
  includedMetrics: string[]
  inputData?: unknown
  results?: unknown
}

type ListScansResult = {
  scans?: ScanSummary[]
  error?: string
}

type RetrieveScanResult = {
  scan?: ScanDetail
  error?: string
}

export async function listScans(): Promise<ListScansResult> {
  try {
    const { data } = await upvio.v1.vitals.scans.list()
    if (!data) {
      return { error: 'Failed to fetch scans.' }
    }
    return {
      scans: data.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        status: s.status,
        patientId: s.patientId,
      })),
    }
  } catch (err) {
    console.error('Error listing scans:', err)
    return {
      error: err instanceof Error ? err.message : 'Something went wrong',
    }
  }
}

export async function retrieveScan(
  scanId: string,
): Promise<RetrieveScanResult> {
  try {
    const { data } = await upvio.v1.vitals.scans.retrieve(scanId)
    if (!data) {
      return { error: 'Failed to fetch scan.' }
    }
    return {
      scan: {
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        status: data.status,
        patientId: data.patientId,
        vitalsLinkId: data.vitalsLinkId,
        startedAt: data.startedAt,
        includedMetrics: data.includedMetrics,
        inputData: data.inputData,
        results: data.results,
      },
    }
  } catch (err) {
    console.error('Error retrieving scan:', err)
    return {
      error: err instanceof Error ? err.message : 'Something went wrong',
    }
  }
}

export async function createScanWithMagicLink(
  patientId: string,
  vitalsLinkId: string,
  inputData?: Record<string, unknown>,
): Promise<MagicLinkResult> {
  const alias = process.env.UPVIO_BUSINESS_ALIAS
  if (!alias) {
    return { error: 'UPVIO_BUSINESS_ALIAS is not configured.' }
  }

  let scanId: string
  try {
    const { data: scan } = await upvio.v1.vitals.scans.create({
      vitalsLinkId,
      patientId,
      inputData,
    })
    if (!scan) {
      return { error: 'Failed to create scan.' }
    }
    scanId = scan.id
  } catch (err) {
    console.error('Error creating scan:', err)
    return {
      error: err instanceof Error ? err.message : 'Something went wrong',
    }
  }

  const redirectUrl = `https://scan.upvio.com/${alias}/scans/${scanId}`

  try {
    const { data: magicLink } = await upvio.v1.core.patients.createMagicLink(
      patientId,
      { redirectUrl },
    )

    if (!magicLink) {
      return { error: 'Failed to create magic link.' }
    }

    return { magicLinkUrl: magicLink.url }
  } catch (err) {
    console.error('Error generating magic link:', err)
    return {
      error: err instanceof Error ? err.message : 'Something went wrong',
    }
  }
}
