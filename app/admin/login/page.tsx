'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError('Email ou mot de passe incorrect.')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#070c18] text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-white/10 rounded-xl p-8"
      >
        <h1 className="text-2xl font-bold mb-6">Connexion admin</h1>

        {error && (
          <p className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <label className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 mb-4 outline-none focus:border-gray-600"
        />

        <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 mb-6 outline-none focus:border-gray-600"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold rounded-lg py-2 hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}