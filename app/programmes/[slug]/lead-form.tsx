'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Programme, Vacation } from '@/lib/types'
import { formaterNumeroInternational } from '@/lib/pays-francophones'
import Confetti from './confetti'

export default function LeadForm({
  programmeId,
  lienInscription,
  programmesSimilaires,
  vacations,
  indicatif,
}: {
  programmeId: string
  lienInscription: string | null
  programmesSimilaires: Programme[]
  vacations: Vacation[]
  indicatif: string | null
}) {
  const [nom, setNom] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [genre, setGenre] = useState('')
  const [age, setAge] = useState('')
  const [vacationId, setVacationId] = useState('')
  const [vacationSecondaireId, setVacationSecondaireId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [montrerConfetti, setMontrerConfetti] = useState(false)

  function libelleVacation(v: Vacation) {
    return `${v.nom ? `${v.nom} — ` : ''}${v.heure_debut.slice(0, 5)} à ${v.heure_fin.slice(0, 5)}`
  }

  useEffect(() => {
    if (envoye) {
      setMontrerConfetti(true)
      const timer = setTimeout(() => setMontrerConfetti(false), 7000)
      return () => clearTimeout(timer)
    }
  }, [envoye])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const numeroFormate = indicatif ? formaterNumeroInternational(whatsapp, indicatif) : whatsapp

    const supabase = createClient()
    const { error: insertError } = await supabase.from('prospects').insert({
      programme_id: programmeId,
      vacation_id: vacationId || null,
      vacation_secondaire_id: vacationSecondaireId || null,
      nom,
      whatsapp: numeroFormate,
      email: email || null,
      genre,
      age: parseInt(age, 10),
    })

    setLoading(false)

    if (insertError) {
      setError('Une erreur est survenue, réessaie.')
      return
    }

    setEnvoye(true)
  }

  if (envoye) {
    return (
      <div id="reservation" className="space-y-8">
        {montrerConfetti && <Confetti />}
        <div className="border border-green-800 bg-green-950/30 rounded-2xl p-6 text-center">
          <p className="text-green-400 font-semibold mb-2">
            Merci {nom.split(' ')[0]} ! Tes informations ont bien été enregistrées.
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Notre équipe te contactera pour finaliser ton inscription.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {lienInscription && (
              <a href={lienInscription} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black font-bold text-lg rounded-xl px-8 py-3 hover:bg-gray-200 transition">
                Nous contacter
              </a>
            )}
            <Link href="/#formations" className="inline-block border border-white/20 text-white font-semibold rounded-xl px-8 py-3 hover:bg-white/10 transition">
              Voir d&apos;autres programmes du centre
            </Link>
          </div>
        </div>

        {programmesSimilaires.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-4">Ça pourrait aussi t&apos;intéresser</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {programmesSimilaires.map((p) => (
                <Link
                  key={p.id}
                  href={`/programmes/${p.slug}`}
                  className="border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition"
                >
                  {p.image_card_url ? (
                    <img src={p.image_card_url} alt={p.titre} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-[#1666f0] to-[#070c18]" />
                  )}
                  <div className="p-4">
                    <p className="font-semibold mb-1">{p.titre}</p>
                    {p.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                    )}
                    {p.prix != null && (
                      <p className="text-green-400 font-bold mt-2">{p.prix}$</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const vacationsSecondaires = vacations.filter((v) => v.id !== vacationId)

  return (
    <form id="reservation" onSubmit={handleSubmit} className="border border-gray-800 rounded-2xl p-6 space-y-4">
      <h3 className="font-bold text-lg">Réserve ta place</h3>
      <p className="text-sm text-gray-400">
        Laisse tes coordonnées, on te recontacte pour finaliser ton inscription.
      </p>

      {error && (
        <p className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <input
        type="text"
        required
        placeholder="Nom complet"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
      />

      <div>
        {indicatif ? (
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg overflow-hidden focus-within:border-gray-600">
            <span className="px-3 py-2 text-gray-400 bg-gray-800/60 border-r border-gray-800 select-none">
              +{indicatif}
            </span>
            <input
              type="tel"
              required
              placeholder="Numéro WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 outline-none min-w-0"
            />
          </div>
        ) : (
          <input
            type="tel"
            required
            placeholder="Numéro WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          />
        )}
      </div>

      <input
        type="email"
        placeholder="Email (optionnel)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          required
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-600 text-gray-300"
        >
          <option value="">Genre</option>
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
        </select>

        <input
          type="number"
          required
          min="1"
          max="120"
          placeholder="Âge"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
        />
      </div>

      {vacations.length > 0 && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Vacation souhaitée</label>
            <select
              required
              value={vacationId}
              onChange={(e) => {
                setVacationId(e.target.value)
                if (e.target.value === vacationSecondaireId) setVacationSecondaireId('')
              }}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-600 text-gray-300"
            >
              <option value="">Choisis ta vacation</option>
              {vacations.map((v) => (
                <option key={v.id} value={v.id}>{libelleVacation(v)}</option>
              ))}
            </select>
          </div>

          {vacationId && vacationsSecondaires.length > 0 && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Deuxième choix</label>
              <select
                required
                value={vacationSecondaireId}
                onChange={(e) => setVacationSecondaireId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-600 text-gray-300"
              >
                <option value="">Choisis ton deuxième choix</option>
                {vacationsSecondaires.map((v) => (
                  <option key={v.id} value={v.id}>{libelleVacation(v)}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Le nombre de places par vacation est limité. Ce second choix nous permet de te
                confirmer une place rapidement si ta vacation préférée est déjà complète.
              </p>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black font-bold text-lg rounded-xl py-3 hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? 'Envoi...' : 'Je réserve ma place'}
      </button>
    </form>
  )
}