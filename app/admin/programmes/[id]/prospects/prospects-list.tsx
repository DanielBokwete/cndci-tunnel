'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Prospect } from '@/lib/types'

export default function ProspectsList({ programmeId }: { programmeId: string }) {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [confirmSuppressionId, setConfirmSuppressionId] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<'tous' | 'confirmes' | 'non_confirmes'>('tous')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function charger() {
      const { data } = await supabase
        .from('prospects')
        .select('*')
        .eq('programme_id', programmeId)
      setProspects((data as Prospect[]) ?? [])
      setLoading(false)
    }
    charger()

    const channel = supabase
      .channel(`prospects-${programmeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'prospects', filter: `programme_id=eq.${programmeId}` },
        (payload) => {
          setProspects((prev) => [...prev, payload.new as Prospect])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [programmeId])

  async function toggleConfirme(p: Prospect) {
    const supabase = createClient()
    const nouveauStatut = !p.confirme
    setProspects((prev) => prev.map((x) => (x.id === p.id ? { ...x, confirme: nouveauStatut } : x)))
    await supabase.from('prospects').update({ confirme: nouveauStatut }).eq('id', p.id)
  }

  async function supprimer(id: string) {
    const supabase = createClient()
    setProspects((prev) => prev.filter((p) => p.id !== id))
    setConfirmSuppressionId(null)
    await supabase.from('prospects').delete().eq('id', id)
  }

  function copier(whatsapp: string, id: string) {
    navigator.clipboard.writeText(whatsapp)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const prospectsFiltres = prospects
    .filter((p) => {
      if (filtre === 'confirmes') return p.confirme
      if (filtre === 'non_confirmes') return !p.confirme
      return true
    })
    .filter((p) => p.nom.toLowerCase().includes(recherche.toLowerCase()))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }))

  const nbConfirmes = prospects.filter((p) => p.confirme).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {loading ? 'Chargement...' : `${prospects.length} inscrit${prospects.length > 1 ? 's' : ''} · ${nbConfirmes} confirmé${nbConfirmes > 1 ? 's' : ''}`}
        </p>
      </div>

      <input
        type="text"
        placeholder="Rechercher un nom..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 outline-none focus:border-gray-600 mb-4"
      />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setFiltre('tous')} className={`shrink-0 text-xs rounded-full px-3 py-1.5 border transition ${filtre === 'tous' ? 'bg-white text-black border-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
          Tous
        </button>
        <button onClick={() => setFiltre('confirmes')} className={`shrink-0 text-xs rounded-full px-3 py-1.5 border transition ${filtre === 'confirmes' ? 'bg-green-600 text-white border-green-600' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
          Confirmés
        </button>
        <button onClick={() => setFiltre('non_confirmes')} className={`shrink-0 text-xs rounded-full px-3 py-1.5 border transition ${filtre === 'non_confirmes' ? 'bg-gray-700 text-white border-gray-700' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
          Non confirmés
        </button>
      </div>

      {!loading && prospectsFiltres.length === 0 && (
        <p className="text-gray-600 text-sm">Aucun prospect trouvé.</p>
      )}

      <div className="space-y-2">
        {prospectsFiltres.map((p) => {
          const numeroPropre = p.whatsapp.replace(/\D/g, '')
          return (
            <div key={p.id} className={`border rounded-xl px-4 py-3 ${p.confirme ? 'border-green-800 bg-green-950/20' : 'border-gray-800'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{p.nom}</p>
                {p.genre && (
                  <span className="text-xs bg-gray-900 border border-gray-800 rounded-full px-2 py-0.5 text-gray-400">
                    {p.genre === 'homme' ? 'H' : 'F'}{p.age ? ` · ${p.age} ans` : ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 break-all">+{numeroPropre}{p.email ? ` · ${p.email}` : ''}</p>
              <p className="text-xs text-gray-700">{new Date(p.created_at).toLocaleString('fr-FR')}</p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button onClick={() => toggleConfirme(p)} className={`text-xs rounded-lg px-3 py-1.5 transition ${p.confirme ? 'bg-green-700 text-white' : 'bg-gray-900 border border-gray-800 hover:border-gray-600'}`}>
                  {p.confirme ? '✓ Confirmé' : 'Confirmer'}
                </button>
                <button onClick={() => copier(numeroPropre, p.id)} className="text-xs bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 hover:border-gray-600 transition">
                  {copiedId === p.id ? 'Copié !' : 'Copier'}
                </button>
                <a href={`https://wa.me/${numeroPropre}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-700 hover:bg-green-600 text-white rounded-lg px-3 py-1.5 transition">
                  WhatsApp
                </a>

                {confirmSuppressionId === p.id ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-400">Supprimer ?</span>
                    <button onClick={() => supprimer(p.id)} className="text-xs bg-red-700 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 transition">
                      Oui
                    </button>
                    <button onClick={() => setConfirmSuppressionId(null)} className="text-xs text-gray-500 hover:text-white transition">
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmSuppressionId(p.id)} className="text-xs text-red-500 hover:text-red-400 ml-auto transition">
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}