# Vitals SDK Examples

A Next.js app demonstrating three common integration patterns with the
[Upvio SDK](https://developers.upvio.com/sdk/).

## Examples

### Create magic link

Generate authenticated URLs that take patients directly to a vitals
scan — no login required.

### Pre-fill scan data

Create a scan with pre-filled health details (age, height, weight, etc.)
so the patient skips the intake form and goes straight to the face scan.

### Query scan results

Browse completed scans and inspect their status, input data, and health
metric results.

## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io/)
- An Upvio API key ([docs](https://developers.upvio.com/api/api-keys/))
- A scan link created in the
  [Vitals dashboard](https://vitals.upvio.com)

## Setup

```bash
git clone <repo-url> && cd vitals-sdk-examples-nextjs
cp .env.local.sample .env.local
```

Fill in `.env.local`:

| Variable               | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `UPVIO_API_KEY`        | Your API key from the Upvio dashboard                 |
| `UPVIO_BUSINESS_ID`    | Your business ID                                      |
| `UPVIO_BUSINESS_ALIAS` | Your business alias (the subdomain in scan.upvio.com) |

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Integration highlights

The SDK calls that power each example
([full guide](https://developers.upvio.com/guides/authenticate-patients/)):

### Magic links

Create a patient, build the scan URL, and generate an authenticated
redirect:

```typescript
const { data: magicLink } =
  await client.v1.core.patients.createMagicLink(
    patient.id,
    { redirectUrl: scanUrl },
  )
```

> Magic links are single-use and expire after 20 minutes.

### Pre-filled scans

Create a scan with input data so the patient doesn't need to fill in
the intake form:

```typescript
await client.v1.vitals.scans.create({
  vitalsLinkId,
  patientId,
  inputData: { age: 35, height: 170, weight: 70 },
})
```

### Scan results

List scans and retrieve full details including health metrics:

```typescript
const { data: scans } = await client.v1.vitals.scans.list()

const { data: scan } =
  await client.v1.vitals.scans.retrieve(scanId)
```
