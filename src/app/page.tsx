import Link from 'next/link'

import { developersUrl } from '@/lib/urls'

const cards = [
  {
    title: 'Create magic link',
    description:
      'Save your patients time by sending them directly to their scan without them needing to log in.',
    route: '/magic-link',
  },
  {
    title: 'Pre-fill scan data',
    description:
      'Pre-fill patient health details such as name, age, and other relevant information so they skip the form and go straight to the face scan.',
    route: '/send-scan',
  },
  {
    title: 'Query scan results',
    description: 'Browse completed scans and inspect health metrics. ',
    route: '/scan-results',
  },
]

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-4 sm:px-8">
      <div className="max-w-lg mx-auto text-pretty text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Vitals SDK Examples
        </h1>
        <p className="mb-8 text-sm text-muted-foreground leading-tight">
          You can learn more about how to implement these features in the{' '}
          <a
            href={developersUrl('sdk/')}
            className="underline underline-offset-2"
          >
            Upvio SDK
          </a>{' '}
          section of the Developers documentation.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <li
            key={card.route}
            className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm "
          >
            <h2 className="mb-1 font-bold text-card-foreground uppercase">
              {card.title}
            </h2>
            <p className="mb-4 flex-1 text-sm text-muted-foreground leading-tight">
              {card.description}
            </p>
            <Link
              href={card.route}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 w-full text-center"
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
