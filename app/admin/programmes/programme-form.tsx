'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Secteur, Programme, Vacation } from '@/lib/types'
import { PAYS_FRANCOPHONES } from '@/lib/pays-francophones'

const styleInputFichier =
  "w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/20 file:bg-gray-900 file:text-white file:font-semibold file:cursor-pointer hover:file:border-white/40 hover:file:bg-gray-800 transition"

type VacationForm = { id?: string; nom: string; heure_debut: string; heure_fin: string }

export default function ProgrammeForm({
  secteurs,
  programme,
  vacationsInitiales,
}: {
  secteurs: Secteur[]
  programme?: Programme
  vacationsInitiales?: Vacation[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageHeaderFile, setImageHeaderFile] = useState<File | null>(null)
  const [imageCardFile, setImageCardFile] = useState<File | null>(null)
  const [imageAfficheFile, setImageAfficheFile] = useState<File | null>(null)
  const [previewHeader, setPreviewHeader] = useState<string | null>(programme?.image_header_url ?? null)
  const [previewCard, setPreviewCard] = useState<string | null>(programme?.image_card_url ?? null)
  const [previewAffiche, setPreviewAffiche] = useState<string | null>(programme?.image_affiche_url ?? null)

  const [vacations, setVacations] = useState<VacationForm[]>(
    vacationsInitiales?.map((v) => ({
      id: v.id,
      nom: v.nom ?? '',
      heure_debut: v.heure_debut.slice(0, 5),
      heure_fin: v.heure_fin.slice(0, 5),
    })) ?? []
  )

  const [form, setForm] = useState({
    titre: programme?.titre ?? '',
    slug: programme?.slug ?? '',
    secteur_id: programme?.secteur_id ?? (secteurs[0]?.id ?? ''),
    type: programme?.type ?? 'formation',
    description: programme?.description ?? '',
    contenu: programme?.contenu ?? '',
    date_debut: programme?.date_debut ?? '',
    date_fin: programme?.date_fin ?? '',
    heure_debut: programme?.heure_debut ?? '',
    heure_fin: programme?.heure_fin ?? '',
    pays: programme?.pays ?? '',
    ville: programme?.ville ?? '',
    lieu: programme?.lieu ?? '',
    prix: programme?.prix?.toString() ?? '',
    prix_original: programme?.prix_original?.toString() ?? '',
    frais_inscription: programme?.frais_inscription?.toString() ?? '',
    lien_inscription: programme?.lien_inscription ?? '',
    actif: programme?.actif ?? true,
  })

  function genererSlug(titre: string) {
    return titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function handleHeaderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageHeaderFile(file)
    if (file) setPreviewHeader(URL.createObjectURL(file))
  }

  function handleCardChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageCardFile(file)
    if (file) setPreviewCard(URL.createObjectURL(file))
  }

  function handleAfficheChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageAfficheFile(file)
    if (file) setPreviewAffiche(URL.createObjectURL(file))
  }

  function ajouterVacation() {
    setVacations([...vacations, { nom: '', heure_debut: '', heure_fin: '' }])
  }

  function retirerVacation(index: number) {
    setVacations(vacations.filter((_, i) => i !== index))
  }

  function modifierVacation(index: number, champ: 'nom' | 'heure_debut' | 'heure_fin', valeur: string) {
    setVacations(vacations.map((v, i) => (i === index ? { ...v, [champ]: valeur } : v)))
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('programmes-images')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('programmes-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      let image_header_url = programme?.image_header_url ?? null
      let image_card_url = programme?.image_card_url ?? null
      let image_affiche_url = programme?.image_affiche_url ?? null

      if (imageHeaderFile) {
        image_header_url = await uploadImage(imageHeaderFile)
      }
      if (imageCardFile) {
        image_card_url = await uploadImage(imageCardFile)
      }
      if (imageAfficheFile) {
        image_affiche_url = await uploadImage(imageAfficheFile)
      }

      const paysChoisi = PAYS_FRANCOPHONES.find((p) => p.nom === form.pays)

      const payload = {
        titre: form.titre,
        slug: form.slug || genererSlug(form.titre),
        secteur_id: form.secteur_id || null,
        type: form.type,
        description: form.description || null,
        contenu: form.contenu || null,
        date_debut: form.date_debut || null,
        date_fin: form.date_fin || null,
        heure_debut: form.type !== 'formation' ? (form.heure_debut || null) : null,
        heure_fin: form.type !== 'formation' ? (form.heure_fin || null) : null,
        pays: form.pays || null,
        indicatif: paysChoisi?.indicatif ?? null,
        ville: form.ville || null,
        lieu: form.lieu || null,
        prix: form.prix ? parseFloat(form.prix) : null,
        prix_original: form.prix_original ? parseFloat(form.prix_original) : null,
        frais_inscription: form.frais_inscription ? parseFloat(form.frais_inscription) : null,
        lien_inscription: form.lien_inscription || null,
        actif: form.actif,
        image_header_url,
        image_card_url,
        image_affiche_url,
      }

      let programmeId = programme?.id

      if (programme) {
        const { error: updateError } = await supabase
          .from('programmes')
          .update(payload)
          .eq('id', programme.id)
        if (updateError) throw updateError
      } else {
        const { data: nouveauProgramme, error: insertError } = await supabase
          .from('programmes')
          .insert({ ...payload, promo_start_at: new Date().toISOString() })
          .select()
          .single()
        if (insertError) throw insertError
        programmeId = nouveauProgramme.id
      }

      if (programmeId) {
        await supabase.from('vacations').delete().eq('programme_id', programmeId)

        if (form.type === 'formation' && vacations.length > 0) {
          const vacationsValides = vacations.filter((v) => v.heure_debut && v.heure_fin)
          if (vacationsValides.length > 0) {
            const { error: vacationsError } = await supabase.from('vacations').insert(
              vacationsValides.map((v, i) => ({
                programme_id: programmeId,
                nom: v.nom || null,
                heure_debut: v.heure_debut,
                heure_fin: v.heure_fin,
                ordre: i,
              }))
            )
            if (vacationsError) throw vacationsError
          }
        }
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Titre du programme</label>
        <input
          type="text"
          required
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Secteur</label>
          <select
            value={form.secteur_id}
            onChange={(e) => setForm({ ...form, secteur_id: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          >
            {secteurs.map((s) => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as Programme['type'] })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          >
            <option value="formation">Formation</option>
            <option value="masterclass">Masterclass</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description courte</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Contenu détaillé du programme</label>
        <textarea
          value={form.contenu}
          onChange={(e) => setForm({ ...form, contenu: e.target.value })}
          rows={5}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Date de début</label>
          <input
            type="date"
            value={form.date_debut}
            onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Date de fin</label>
          <input
            type="date"
            value={form.date_fin}
            onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          />
        </div>
      </div>

      {form.type !== 'formation' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Heure de début</label>
              <input
                type="time"
                value={form.heure_debut}
                onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
                className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Heure de fin</label>
              <input
                type="time"
                value={form.heure_fin}
                onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
                className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 -mt-3">
            Précise l&apos;heure exacte de début et fin de la masterclass.
          </p>
        </>
      )}

      {form.type === 'formation' && (
        <div className="border border-white/10 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Vacations</label>
            <p className="text-xs text-gray-600">
              Ajoute un ou plusieurs créneaux horaires parmi lesquels la personne pourra choisir
              lors de son inscription (ex : &quot;Matinée&quot; 9h-12h, &quot;Après-midi&quot; 14h-17h).
            </p>
          </div>

          {vacations.map((v, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Nom (ex: Matinée)"
                value={v.nom}
                onChange={(e) => modifierVacation(index, 'nom', e.target.value)}
                className="sm:w-40 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
              />
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={v.heure_debut}
                  onChange={(e) => modifierVacation(index, 'heure_debut', e.target.value)}
                  className="flex-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
                />
                <span className="text-gray-600">à</span>
                <input
                  type="time"
                  value={v.heure_fin}
                  onChange={(e) => modifierVacation(index, 'heure_fin', e.target.value)}
                  className="flex-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => retirerVacation(index)}
                  className="text-red-500 hover:text-red-400 text-sm px-2 shrink-0"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={ajouterVacation}
            className="text-sm border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition"
          >
            + Ajouter une vacation
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Pays</label>
          <select
            required
            value={form.pays}
            onChange={(e) => setForm({ ...form, pays: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          >
            <option value="">Choisis un pays</option>
            {PAYS_FRANCOPHONES.map((p) => (
              <option key={p.nom} value={p.nom}>{p.nom} (+{p.indicatif})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ville</label>
          <input
            type="text"
            required
            placeholder="ex: Kinshasa"
            value={form.ville}
            onChange={(e) => setForm({ ...form, ville: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          />
        </div>
      </div>
      <p className="text-xs text-gray-600 -mt-3">
        Le pays choisi détermine automatiquement l&apos;indicatif téléphonique appliqué aux numéros
        WhatsApp enregistrés pour ce programme (ex : RDC → +243).
      </p>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Adresse précise (optionnel)</label>
        <input
          type="text"
          placeholder="ex: 63, avenue Colonel Mondjiba, Silikin Village"
          value={form.lieu}
          onChange={(e) => setForm({ ...form, lieu: e.target.value })}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prix original (avant réduction, $)</label>
          <input
            type="number"
            step="0.01"
            placeholder="ex: 82"
            value={form.prix_original}
            onChange={(e) => setForm({ ...form, prix_original: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prix promo affiché ($)</label>
          <input
            type="number"
            step="0.01"
            placeholder="ex: 49"
            value={form.prix}
            onChange={(e) => setForm({ ...form, prix: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          />
        </div>
      </div>
      <p className="text-xs text-gray-600 -mt-3">
        Laisse &quot;Prix original&quot; vide si tu ne veux pas afficher de réduction barrée.
      </p>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Frais d&apos;inscription ($)</label>
        <input
          type="number"
          step="0.01"
          value={form.frais_inscription}
          onChange={(e) => setForm({ ...form, frais_inscription: e.target.value })}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Lien d&apos;inscription</label>
        <input
          type="text"
          placeholder="ex: https://wa.me/243xxxxxxxxx ou un lien Google Forms"
          value={form.lien_inscription}
          onChange={(e) => setForm({ ...form, lien_inscription: e.target.value })}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
        />
        <p className="text-xs text-gray-600 mt-1">
          C&apos;est le lien que verra la personne après avoir rempli le formulaire de réservation
          sur la page publique, pour finaliser son inscription (un numéro WhatsApp au format
          wa.me/243xxxxxxxxx, ou un formulaire externe type Google Forms). Laisse vide si tu ne
          veux pas de bouton final.
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Image d&apos;en-tête (bannière)</label>
        <p className="text-xs text-gray-600 mb-2">
          Grande image affichée tout en haut de la page du programme.
        </p>
        {previewHeader && (
          <img src={previewHeader} alt="Aperçu bannière" className="w-full h-32 object-cover rounded-lg mb-2 border border-white/10" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleHeaderChange}
          className={styleInputFichier}
        />
        {programme?.image_header_url && !imageHeaderFile && (
          <p className="text-xs text-gray-600 mt-1">Image actuelle conservée si aucun nouveau fichier choisi.</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Image de carte (listing)</label>
        <p className="text-xs text-gray-600 mb-2">
          Petite image affichée sur la carte du programme, sur la page d&apos;accueil.
        </p>
        {previewCard && (
          <img src={previewCard} alt="Aperçu carte" className="w-full h-32 object-cover rounded-lg mb-2 border border-white/10" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleCardChange}
          className={styleInputFichier}
        />
        {programme?.image_card_url && !imageCardFile && (
          <p className="text-xs text-gray-600 mt-1">Image actuelle conservée si aucun nouveau fichier choisi.</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Affiche / Flyer du programme</label>
        <p className="text-xs text-gray-600 mb-2">
          Affichée à côté de la section &quot;À propos de ce programme&quot; sur la page publique.
        </p>
        {previewAffiche && (
          <img src={previewAffiche} alt="Aperçu affiche" className="w-full h-48 object-cover rounded-lg mb-2 border border-white/10" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleAfficheChange}
          className={styleInputFichier}
        />
        {programme?.image_affiche_url && !imageAfficheFile && (
          <p className="text-xs text-gray-600 mt-1">Image actuelle conservée si aucun nouveau fichier choisi.</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          checked={form.actif}
          onChange={(e) => setForm({ ...form, actif: e.target.checked })}
        />
        Programme actif (visible publiquement)
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black font-semibold rounded-lg py-2 hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : programme ? 'Mettre à jour' : 'Créer le programme'}
      </button>
    </form>
  )
}