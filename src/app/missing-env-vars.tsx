export default function MissingEnvVars({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto max-w-lg p-4 sm:px-8">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-1 font-bold text-card-foreground uppercase">
          Missing environment variables
        </h1>
        <p className="mb-4 text-sm text-muted-foreground leading-tight">
          The following required environment variables are not set:
        </p>
        <ul className="mb-4 space-y-1">
          {missing.map((name) => (
            <li key={name} className="font-mono text-sm text-destructive">
              {name}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground leading-tight">
          Copy{' '}
          <code className="font-mono text-foreground">.env.local.sample</code>{' '}
          to <code className="font-mono text-foreground">.env.local</code> and
          fill in the values, then restart the dev server. See{' '}
          <a
            href="https://developers.upvio.com/sdk/#configure-credentials"
            className="underline underline-offset-2"
          >
            Configure credentials
          </a>{' '}
          for details on obtaining these values.
        </p>
      </div>
    </main>
  )
}
