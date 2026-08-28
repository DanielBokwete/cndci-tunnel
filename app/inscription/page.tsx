'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function genererSlug(texte: string) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function InscriptionPage() {
  const router = useRouter()
  const [etape, setEtape] = useState<'formulaire' | 'code'>('formulaire')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [nomPlateforme, setNomPlateforme] = useState('')
  const [sousDomaine, setSousDomaine] = useState('')
  const [sousDomaineModifieManuellement, setSousDomaineModifieManuellement] = useState(false)
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [code, setCode] = useState('')

  function handleNomPlateformeChange(valeur: string) {
    setNomPlateforme(valeur)
    if (!sousDomaineModifieManuellement) {
      setSousDomaine(genererSlug(valeur))
    }
  }

  function handleSousDomaineChange(valeur: string) {
    setSousDomaineModifieManuellement(true)
    setSousDomaine(genererSlug(valeur))
  }

  async function handleSubmitFormulaire(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data: existant } = await supabase
      .from('organisations')
      .select('id')
      .eq('sous_domaine', sousDomaine)
      .maybeSingle()

    if (existant) {
      setError('Ce nom de plateforme est déjà pris, choisis-en un autre.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: motDePasse,
    })

    setLoading(false)

    if (signUpError) {
      setError(`Erreur : ${signUpError.message}`)
      return
    }

    setEtape('code')
  }

  async function handleSubmitCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data: verifData, error: verifError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })

    if (verifError || !verifData.user) {
      setLoading(false)
      setError(verifError ? `Erreur : ${verifError.message}` : 'Code incorrect ou expiré.')
      return
    }

    const { data: organisation, error: orgError } = await supabase
      .from('organisations')
      .insert({
        nom: nomPlateforme,
        sous_domaine: sousDomaine,
        proprietaire_id: verifData.user.id,
      })
      .select()
      .single()

    if (orgError || !organisation) {
      setLoading(false)
      setError(`Ton compte est créé, mais la création de l'organisation a échoué : ${orgError?.message}`)
      return
    }

    await supabase.from('profils').insert({
      user_id: verifData.user.id,
      organisation_id: organisation.id,
      role: 'proprietaire',
    })

    setLoading(false)
    router.push('/admin')
    router.refresh()
  }

  if (etape === 'code') {
    return (
      <main className="min-h-screen bg-[#070c18] text-white flex items-center justify-center px-6">
        <form onSubmit={handleSubmitCode} className="w-full max-w-sm border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">Vérifie ton email</h1>
          <p className="text-sm text-gray-400 mb-6">
            On a envoyé un code à 6 chiffres à <span className="text-white">{email}</span>.
          </p>

          {error && (
            <p className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <input
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-3 mb-4 text-center text-2xl tracking-widest outline-none focus:border-gray-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1666f0] hover:bg-[#1256cc] text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Confirmer mon compte'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#070c18] text-white flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmitFormulaire} className="w-full max-w-sm border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-1">Crée ta plateforme</h1>
        <p className="text-sm text-gray-400 mb-6">
          Lance tes propres pages de conversion pour tes formations et masterclass.
        </p>

        {error && (
          <p className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <label className="block text-sm text-gray-400 mb-1">Nom de ta plateforme</label>
        <input
          type="text"
          required
          placeholder="ex: Sarah Formations"
          value={nomPlateforme}
          onChange={(e) => handleNomPlateformeChange(e.target.value)}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 mb-4 outline-none focus:border-gray-600"
        />

        <label className="block text-sm text-gray-400 mb-1">Adresse de ta plateforme</label>
        <div className="flex items-center bg-gray-900 border border-white/10 rounded-lg overflow-hidden mb-1 focus-within:border-gray-600">
          <span className="px-3 py-2 text-gray-500 text-sm border-r border-white/10 shrink-0">/o/</span>
          <input
            type="text"
            required
            value={sousDomaine}
            onChange={(e) => handleSousDomaineChange(e.target.value)}
            className="flex-1 bg-transparent px-3 py-2 outline-none min-w-0"
          />
        </div>
        <p className="text-xs text-gray-600 mb-4">
          Uniquement lettres, chiffres et tirets.
        </p>

        <label className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 mb-4 outline-none focus:border-gray-600"
        />

        <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
        <input
          type="password"
          required
          minLength={6}
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 mb-6 outline-none focus:border-gray-600"
        />

        <button
          type="submit"
          disabled={loading || sousDomaine.length < 3}
          className="w-full bg-[#1666f0] hover:bg-[#1256cc] text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          Déjà un compte ?{' '}
          <Link href="/admin/login" className="text-[#1666f0] hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  )
}