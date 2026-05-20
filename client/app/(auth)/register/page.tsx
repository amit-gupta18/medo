'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ApiError } from '@/lib/api'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password, orgName })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0D0C0B]">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(200,169,110,0.06) 0%, transparent 60%)' }}
        aria-hidden
      />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C8A96E]/30 bg-[#C8A96E]/10 text-base shadow-[0_0_15px_rgba(200,169,110,0.1)] transition-transform group-hover:scale-105">
              🧠
            </div>
            <span className="font-(family-name:--font-dm-serif) text-xl text-[#EAE5D8] tracking-tight">
              Brainyfy
            </span>
          </Link>
          <p className="mt-3 text-sm text-[#5E5A52]">Create your org and account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-[#131210] p-7 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Corp"
              required
            />

            {error && (
              <p className="rounded-lg border border-(--red-dim) bg-(--red-dim) px-3 py-2 text-xs text-(--red)">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[#5E5A52]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C8A96E] hover:text-[#D4B97A] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
