import { UpvioApiClient } from '@upvio/sdk-node'

const apiKey = process.env.UPVIO_API_KEY
if (!apiKey) {
  throw new Error('UPVIO_API_KEY is not defined in environment variables.')
}

const businessId = process.env.UPVIO_BUSINESS_ID
if (!businessId) {
  throw new Error('UPVIO_BUSINESS_ID is not defined in environment variables.')
}

export const upvio = new UpvioApiClient({
  apiKey,
  businessId,
  baseUrl: process.env.UPVIO_API_BASE_URL,
})
