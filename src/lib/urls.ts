const defaultDomain =
  process.env.NODE_ENV === 'development' ? 'upvio.dev' : 'upvio.com'

const domain = process.env.NEXT_PUBLIC_UPVIO_DOMAIN || defaultDomain

export const apiBaseUrl = `https://api.${domain}`

export const scanUrl = (path: string): string =>
  `https://scan.${domain}/${path}`

export const vitalsUrl = (path: string): string =>
  `https://vitals.${domain}/${path}`

export const developersUrl = (path: string): string =>
  `https://developers.${domain}/${path}`
