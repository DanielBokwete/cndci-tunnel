'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const styleInputFichier =
  "w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/20 file:bg-gray-900 file:text-white file:font-semibold file:cursor-pointer hover:file:border-white/40 hover:file:bg-gray-800 transition"

// Vidéo commune à toutes les formations S'KILLER (« Découvre le programme S'KILLER »)
export default function VideoProgrammeForm({
  organisationId,
  titreInitial,
  urlInitiale,
}: {
  organisationId: string
  titreInitial: string
  urlInitiale: string | null
}) {
  const [titre, setTitre] = useState(titreInitial)
  const [url, setUrl] = useState(urlInitiale ?? '')
  const [fichier, setFichier] = useState<File | null>(null)
  const [etat, setEtat] = useState<'' | 'envoi' | 'ok' | 'erreur'>('')
  const [message, setMessage] = useState('')

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault()
    setEtat('envoi')
    setMessage('')
    try {
      const supabase = createClient()
      let videoUrl = url || null
      if (fichier) {
        const ext = fichier.name.split('.').pop()
        const nom = `${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage.from('programmes-images').upload(nom, fichier)
        if (upErr) throw upErr
        videoUrl = supabase.storage.from('programmes-images').getPublicUrl(nom).data.publicUrl
      }
      const { error } = await supabase.from('videos_programme').upsert({
        organisation_id: organisationId,
        titre: titre || "Découvre le programme S'KILLER",
        video_url: videoUrl,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      if (videoUrl) setUrl(videoUrl)
      setFichier(null)
      setEtat('ok')
      setMessage('Vidéo enregistrée. Elle apparaît sur toutes les pages S’KILLER.')
    } catch (err) {
      setEtat('erreur')
      setMessage(err instanceof Error ? err.message : "L'enregistrement a échoué. Réessaie.")
    }
  }

  return (
    <form onSubmit={enregistrer} className="border border-white/10 rounded-xl p-4 space-y-3 mb-8">
      <div>
        <p className="text-sm font-semibold text-gray-300">Vidéo du programme S&apos;KILLER</p>
        <p className="text-xs text-gray-600">Affichée sur toutes les formations S&apos;KILLER. Verticale, carrée ou horizontale : la page s&apos;adapte.</p>
      </div>
      <input id="vp-titre" type="text" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Découvre le programme S'KILLER"
        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
      <input id="vp-fichier" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => setFichier(e.target.files?.[0] ?? null)} className={styleInputFichier} />
      <p className="text-xs text-gray-600">MP4 conseillé (lu sur tous les téléphones). 20 Mo maximum. Ou colle un lien direct vers la vidéo :</p>
      <input id="vp-url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://.../video.mp4"
        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
      {message && <p className={`text-xs ${etat === 'erreur' ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
      <button type="submit" disabled={etat === 'envoi'} className="text-sm bg-white text-black font-semibold rounded-lg px-4 py-2 hover:bg-gray-200 transition disabled:opacity-50">
        {etat === 'envoi' ? 'Enregistrement...' : 'Enregistrer la vidéo'}
      </button>
    </form>
  )
}
