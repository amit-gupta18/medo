import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')
  if (token) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)]">
      {/* Topbar */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)] border border-[rgba(200,169,110,0.25)] bg-[var(--accent-dim)] text-sm">
            🧠
          </div>
          <span className="font-[family-name:var(--font-dm-serif)] text-lg tracking-tight text-[var(--text-primary)]">
            Brainyfy
          </span>
        </div>
        <nav>
          <Link href="/login" className="btn btn-outline btn-sm">
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="badge badge-accent mb-6 px-3 py-1">
          ✦ Now in private beta
        </div>
        <h1 className="mb-6 max-w-4xl font-[family-name:var(--font-dm-serif)] text-5xl tracking-tight text-[var(--text-primary)] md:text-7xl">
          The company brain that thinks alongside you.
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-[var(--text-secondary)]">
          Connect your team's knowledge — Slack, Notion, and documents — into a single, intelligent graph. Ask questions, generate playbooks, and onboard instantly.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="btn btn-primary btn-lg">
            Start building your brain →
          </Link>
          <button className="btn btn-outline btn-lg">
            Book a demo
          </button>
        </div>

        {/* Feature Cards */}
        <div className="mt-32 w-full max-w-5xl text-left">
          <div className="grid-3">
            <div className="card">
              <div className="mb-4 text-3xl">🕸️</div>
              <h3 className="card-title">Knowledge Graph</h3>
              <p className="card-desc">
                Visualize how everything connects. Your documents automatically link based on semantic context, forming an intuitive mind map.
              </p>
            </div>
            <div className="card">
              <div className="mb-4 text-3xl">💬</div>
              <h3 className="card-title">RAG Chat</h3>
              <p className="card-desc">
                Stop searching, start asking. Chat with your entire organizational history and get precise, cited answers instantly.
              </p>
            </div>
            <div className="card">
              <div className="mb-4 text-3xl">⚡</div>
              <h3 className="card-title">Auto Playbooks</h3>
              <p className="card-desc">
                Turn passive knowledge into active workflows. Instantly generate step-by-step guides from your past incidents and docs.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] px-8 py-8 text-center text-sm text-[var(--text-tertiary)]">
        <p>© 2026 Brainyfy, Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}
