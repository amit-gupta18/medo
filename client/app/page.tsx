import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')

  if (token) redirect('/dashboard')

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0D0C0B] text-[#EAE5D8] selection:bg-[#C8A96E]/20 selection:text-[#C8A96E]">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0D0C0B]/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#C8A96E]/30 bg-[#C8A96E]/10 text-sm transition-transform group-hover:scale-105">
              🧠
            </div>

            <span className="font-serif text-lg tracking-tight transition-colors group-hover:text-[#C8A96E]">
              Brainyfy
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[#9E9A8E] transition-colors hover:text-white sm:block"
            >
              Log in
            </Link>

            <Link
              href="/login"
              className="rounded-full bg-[#C8A96E] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[#D4B97A] hover:shadow-[0_0_20px_rgba(200,169,110,0.3)]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative isolate">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(200,169,110,0.07)_0%,transparent_70%)]" />

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pb-12 pt-28 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C8A96E]/25 bg-[#C8A96E]/10 px-4 py-1.5 text-xs font-medium tracking-wide text-[#C8A96E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96E]" />
              Introducing Brainyfy 2.0
            </div>

            <h1 className="text-5xl leading-[1.08] tracking-tight text-white sm:text-6xl font-serif">
              The intelligent nervous system for your{' '}
              <span className="italic text-[#C8A96E]">company</span>.
            </h1>

            <p className="mt-6 text-base leading-7 text-[#9E9A8E] sm:text-lg">
              Connect your scattered knowledge—Slack, Notion, and docs—into
              one unified semantic graph. Onboard faster, resolve incidents,
              and let your org&apos;s brain do the thinking.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full bg-[#C8A96E] px-7 py-3 text-sm font-semibold text-black transition-all hover:bg-[#D4B97A] hover:shadow-[0_0_24px_rgba(200,169,110,0.35)]"
              >
                Start building your brain →
              </Link>

              <Link
                href="/login"
                className="text-sm font-medium text-[#9E9A8E] transition-colors hover:text-white"
              >
                Book a live demo
              </Link>
            </div>

            <p className="mt-6 text-xs text-[#3E3B34]">
              Trusted by 500+ teams · No credit card required
            </p>
          </div>
        </section>

        {/* Mockup */}
        <section className="mx-auto max-w-5xl px-6 pb-16 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#131210] p-1.5 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-[#C8A96E]/[0.025] to-transparent" />

            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0D0C0B]">
              {/* Browser */}
              <div className="flex h-10 items-center gap-3 border-b border-white/5 bg-[#131210] px-4">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
                </div>

                <div className="flex flex-1 justify-center">
                  <div className="flex h-6 w-56 items-center rounded border border-white/5 bg-[#0D0C0B] px-3 font-mono text-[11px] text-[#5E5A52]">
                    brainyfy.app/graph
                  </div>
                </div>
              </div>

              {/* Layout */}
              <div className="flex h-[400px]">
                {/* Sidebar */}
                <aside className="hidden w-32 flex-shrink-0 flex-col border-r border-white/5 bg-[#111009] sm:flex">
                  <div className="flex items-center gap-2 border-b border-white/5 px-3 py-3">
                    <div className="flex h-4 w-4 items-center justify-center rounded border border-[#C8A96E]/20 bg-[#C8A96E]/10 text-[8px]">
                      🧠
                    </div>

                    <span className="font-serif text-[10px] font-medium text-[#EAE5D8]">
                      Brainyfy
                    </span>
                  </div>

                  <nav className="flex-1 space-y-0.5 p-1.5">
                    {[
                      ['◩', 'Dashboard', false],
                      ['📄', 'Knowledge', false],
                      ['💬', 'Chat', false],
                      ['🔗', 'Graph', true],
                      ['📋', 'Playbooks', false],
                      ['⚙', 'Settings', false],
                    ].map(([icon, label, active]) => (
                      <div
                        key={label as string}
                        className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] ${
                          active
                            ? 'bg-[#252219] text-[#EAE5D8]'
                            : 'text-[#5E5A52]'
                        }`}
                      >
                        <span className="w-3 text-center text-[9px]">
                          {icon}
                        </span>

                        <span>{label}</span>
                      </div>
                    ))}
                  </nav>
                </aside>

                {/* Graph */}
                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0A0908]">
                  {/* Grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.025]" />

                  {/* SVG */}
                  <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                    <line
                      x1="50%"
                      y1="50%"
                      x2="22%"
                      y2="22%"
                      stroke="#C8A96E"
                      strokeWidth="1"
                      strokeDasharray="5 5"
                      opacity="0.35"
                    />

                    <line
                      x1="50%"
                      y1="50%"
                      x2="78%"
                      y2="27%"
                      stroke="#C8A96E"
                      strokeWidth="1"
                      strokeDasharray="5 5"
                      opacity="0.35"
                    />

                    <line
                      x1="50%"
                      y1="50%"
                      x2="76%"
                      y2="74%"
                      stroke="#C8A96E"
                      strokeWidth="1"
                      strokeDasharray="5 5"
                      opacity="0.25"
                    />
                  </svg>

                  {/* Center */}
                  <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#C8A96E]/60 bg-[#C8A96E]/10 text-xl shadow-[0_0_40px_rgba(200,169,110,0.2)]">
                    🧠
                  </div>

                  {/* Nodes */}
                  <div className="absolute left-[19%] top-[18%] flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1A1815] text-sm shadow-xl">
                      📝
                    </div>

                    <span className="mt-1 text-[8px] text-[#3E3B34]">
                      Notion
                    </span>
                  </div>

                  <div className="absolute right-[19%] top-[16%] flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1A1815] text-sm shadow-xl">
                      💬
                    </div>

                    <span className="mt-1 text-[8px] text-[#3E3B34]">
                      Slack
                    </span>
                  </div>

                  <div className="absolute bottom-[18%] right-[22%] flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#1A1815] text-base shadow-xl">
                      ⚡
                    </div>

                    <span className="mt-1 text-[8px] text-[#3E3B34]">
                      Playbooks
                    </span>
                  </div>

                  <div className="absolute bottom-[20%] left-[23%] flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#1A1815] text-xs shadow-xl">
                      📄
                    </div>

                    <span className="mt-1 text-[8px] text-[#3E3B34]">
                      Docs
                    </span>
                  </div>

                  {/* Topbar */}
                  <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-between border-b border-white/5 bg-[#0D0C0B]/80 px-3 backdrop-blur-sm">
                    <span className="text-[10px] font-medium text-[#9E9A8E]">
                      Knowledge Graph
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-[#C8A96E]/20 bg-[#C8A96E]/10 px-2 py-0.5 text-[9px] text-[#C8A96E]">
                        42 nodes
                      </span>

                      <span className="rounded-full border border-white/10 bg-[#1A1815] px-2 py-0.5 text-[9px] text-[#5E5A52]">
                        Live
                      </span>
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-3 right-3 w-40 rounded-lg border border-white/10 bg-[#131210]/95 p-2.5 shadow-2xl backdrop-blur-sm">
                    <div className="mb-1 text-[9px] uppercase tracking-wider text-[#5E5A52]">
                      Selected
                    </div>

                    <div className="text-[10px] font-medium text-[#EAE5D8]">
                      Q3 Incident Report
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="rounded-full border border-[#C8A96E]/20 bg-[#C8A96E]/10 px-1 py-0.5 text-[8px] text-[#C8A96E]">
                        incident
                      </span>

                      <span className="rounded-full border border-white/10 bg-[#1A1815] px-1 py-0.5 text-[8px] text-[#5E5A52]">
                        ops
                      </span>
                    </div>

                    <div className="mt-1.5 text-[9px] text-[#5E5A52]">
                      3 connections · SLACK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}