'use server'

import { upvio } from '@/lib/upvio'
import { scanUrl } from '@/lib/urls'

export const listPatients = async () => {
  return upvio.v1.core.patients.list()
}
export type Patient = NonNullable<
  Awaited<ReturnType<typeof listPatients>>['data']
>[number]

export const generateMagicLink = async (
  patientId: string,
  linkSlug: string,
) => {
  const alias = process.env.UPVIO_BUSINESS_ALIAS
  return upvio.v1.core.patients.createMagicLink(patientId, {
    redirectUrl: scanUrl(`${alias}/links/${linkSlug}`),
  })
}
export type MagicLink = NonNullable<
  Awaited<ReturnType<typeof generateMagicLink>>['data']
>

export const listLinks = async () => {
  return upvio.v1.vitals.links.list({
    status: 'ACTIVE',
  })
}
export type VitalsLink = NonNullable<
  Awaited<ReturnType<typeof listLinks>>['data']
>[number]

export const listScans = async () => {
  return upvio.v1.vitals.scans.list()
}
export const retrieveScan = async (scanId: string) => {
  return upvio.v1.vitals.scans.retrieve(scanId)
}
export type VitalsScan = NonNullable<
  Awaited<ReturnType<typeof retrieveScan>>['data']
>

export const createScanWithMagicLink = async (
  patientId: string,
  vitalsLinkId: string,
  inputData?: Record<string, unknown>,
) => {
  const alias = process.env.UPVIO_BUSINESS_ALIAS
  const { data: scan, error } = await upvio.v1.vitals.scans.create({
    vitalsLinkId,
    patientId,
    inputData,
  })

  if (error) {
    return { error }
  }

  if (!scan) {
    throw new Error('Scan creation did not return a scan or an error')
  }

  const redirectUrl = scanUrl(`${alias}/scans/${scan.id}`)
  return upvio.v1.core.patients.createMagicLink(patientId, { redirectUrl })
}
