const defaultDomain = 'upvio.com'

const domain = process.env.NEXT_PUBLIC_UPVIO_DOMAIN || defaultDomain

export const apiBaseUrl = `https://api.${domain}`

export const scanUrl = (businessAlias: string, path: string): string =>
  `https://${businessAlias}.clients.${domain}/vitals/${path}`

export const vitalsUrl = (path: string): string =>
  `https://vitals.${domain}/${path}`

export const developersUrl = (path: string): string =>
  `https://developers.${domain}/${path}`
