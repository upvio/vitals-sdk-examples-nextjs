import Link from 'next/link'

export function BackLink() {
  return (
    <Link
      href="/"
      className="mt-6 inline-block text-sm text-primary hover:underline"
    >
      &larr; Back to home
    </Link>
  )
}
