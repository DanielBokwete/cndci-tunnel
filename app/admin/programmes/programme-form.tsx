'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Secteur, Programme, Vacation, Faq, Temoignage, Intervenant } from '@/lib/types'
import { PAYS_FRANCOPHONES } from '@/lib/pays-francophones'

const styleInputFichier =
  "w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/20 file:bg-gray-900 file:text-white file:font-semibold file:cursor-pointer hover:file:border-white/40 hover:file:bg-gray-800 transition"

type VacationForm = { id?: string; nom: string; heure_debut: string; heure_fin: string }
type FaqForm = { id?: string; question: string; reponse: string }
type TemoignageForm = { id?: string; type: 'image' | 'video'; url: string; nom: string; file?: File; preview?: string }
type IntervenantForm = { id?: string; nom: string; bio: string; photo_url?: string; file?: File; preview?: string }

export default function ProgrammeForm({
  secteurs,
  programme,
  vacationsInitiales,
  faqsInitiales,
  temoignagesInitiaux,
  intervenantsInitiaux,
}: {
  secteurs: Secteur[]
  programme?: Programme
  vacationsInitiales?: Vacation[]
  faqsInitiales?: Faq[]
  temoignagesInitiaux?: Temoignage[]
  intervenantsInitiaux?: Intervenant[]
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
      id: v.id, nom: v.nom ?? '', heure_debut: v.heure_debut.slice(0, 5), heure_fin: v.heure_fin.slice(0, 5),
    })) ?? []
  )
  const [faqs, setFaqs] = useState<FaqForm[]>(
    faqsInitiales?.map((f) => ({ id: f.id, question: f.question, reponse: f.reponse })) ?? []
  )
  const [temoignages, setTemoignages] = useState<TemoignageForm[]>(
    temoignagesInitiaux?.map((t) => ({ id: t.id, type: t.type, url: t.url, nom: t.nom ?? '', preview: t.type === 'image' ? t.url : undefined })) ?? []
  )
  const [intervenants, setIntervenants] = useState<IntervenantForm[]>(
    intervenantsInitiaux?.map((i) => ({ id: i.id, nom: i.nom, bio: i.bio ?? '', photo_url: i.photo_url ?? undefined, preview: i.photo_url ?? undefined })) ?? []
  )

  const [form, setForm] = useState({
    titre: programme?.titre ?? '',
    slug: programme?.slug ?? '',
    secteur_id: programme?.secteur_id ?? (secteurs[0]?.id ?? ''),
    type: programme?.type ?? 'formation',
    description: programme?.description ?? '',
    contenu: programme?.contenu ?? '',
    public_cible: programme?.public_cible ?? '',
        titre_video: programme?.titre_video ?? '',
    afficher_certification: programme?.afficher_certification ?? true,
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
    return titre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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

  function ajouterVacation() { setVacations([...vacations, { nom: '', heure_debut: '', heure_fin: '' }]) }
  function retirerVacation(i: number) { setVacations(vacations.filter((_, idx) => idx !== i)) }
  function modifierVacation(i: number, champ: 'nom' | 'heure_debut' | 'heure_fin', v: string) {
    setVacations(vacations.map((vac, idx) => (idx === i ? { ...vac, [champ]: v } : vac)))
  }

  function ajouterFaq() { setFaqs([...faqs, { question: '', reponse: '' }]) }
  function retirerFaq(i: number) { setFaqs(faqs.filter((_, idx) => idx !== i)) }
  function modifierFaq(i: number, champ: 'question' | 'reponse', v: string) {
    setFaqs(faqs.map((f, idx) => (idx === i ? { ...f, [champ]: v } : f)))
  }

  function ajouterTemoignage() { setTemoignages([...temoignages, { type: 'image', url: '', nom: '' }]) }
  function retirerTemoignage(i: number) { setTemoignages(temoignages.filter((_, idx) => idx !== i)) }
  function modifierTemoignage(i: number, champ: 'type' | 'url' | 'nom', v: string) {
    setTemoignages(temoignages.map((t, idx) => (idx === i ? { ...t, [champ]: v } : t)))
  }
  function handleTemoignageFichier(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    setTemoignages(temoignages.map((t, idx) => (idx === i ? { ...t, file, preview: URL.createObjectURL(file) } : t)))
  }

  function ajouterIntervenant() { setIntervenants([...intervenants, { nom: '', bio: '' }]) }
  function retirerIntervenant(i: number) { setIntervenants(intervenants.filter((_, idx) => idx !== i)) }
  function modifierIntervenant(i: number, champ: 'nom' | 'bio', v: string) {
    setIntervenants(intervenants.map((it, idx) => (idx === i ? { ...it, [champ]: v } : it)))
  }
  function handleIntervenantPhoto(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    setIntervenants(intervenants.map((it, idx) => (idx === i ? { ...it, file, preview: URL.createObjectURL(file) } : it)))
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('programmes-images').upload(fileName, file)
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

      if (imageHeaderFile) image_header_url = await uploadImage(imageHeaderFile)
      if (imageCardFile) image_card_url = await uploadImage(imageCardFile)
      if (imageAfficheFile) image_affiche_url = await uploadImage(imageAfficheFile)

      const paysChoisi = PAYS_FRANCOPHONES.find((p) => p.nom === form.pays)

      const payload = {
        titre: form.titre,
        slug: form.slug || genererSlug(form.titre),
        secteur_id: form.secteur_id || null,
        type: form.type,
        description: form.description || null,
        contenu: form.contenu || null,
        public_cible: form.public_cible || null,
                titre_video: form.titre_video || null,
        afficher_certification: form.afficher_certification,
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
        const { error: updateError } = await supabase.from('programmes').update(payload).eq('id', programme.id)
        if (updateError) throw updateError
      } else {
        const { data: nouveauProgramme, error: insertError } = await supabase
          .from('programmes').insert({ ...payload, promo_start_at: new Date().toISOString() }).select().single()
        if (insertError) throw insertError
        programmeId = nouveauProgramme.id
      }

      if (programmeId) {
        // Vacations
        await supabase.from('vacations').delete().eq('programme_id', programmeId)
        if (form.type === 'formation' && vacations.length > 0) {
          const valides = vacations.filter((v) => v.heure_debut && v.heure_fin)
          if (valides.length > 0) {
            await supabase.from('vacations').insert(
              valides.map((v, i) => ({ programme_id: programmeId, nom: v.nom || null, heure_debut: v.heure_debut, heure_fin: v.heure_fin, ordre: i }))
            )
          }
        }

        // FAQ
        await supabase.from('faqs').delete().eq('programme_id', programmeId)
        const faqsValides = faqs.filter((f) => f.question && f.reponse)
        if (faqsValides.length > 0) {
          await supabase.from('faqs').insert(
            faqsValides.map((f, i) => ({ programme_id: programmeId, question: f.question, reponse: f.reponse, ordre: i }))
          )
        }

        // Temoignages (upload des nouveaux fichiers image d'abord)
        await supabase.from('temoignages').delete().eq('programme_id', programmeId)
        const temoignagesAvecUrl = await Promise.all(
          temoignages.map(async (t) => {
            let url = t.url
            if (t.type === 'image' && t.file) {
              url = await uploadImage(t.file)
            }
            return { ...t, url }
          })
        )
        const temoignagesValides = temoignagesAvecUrl.filter((t) => t.url)
        if (temoignagesValides.length > 0) {
          await supabase.from('temoignages').insert(
            temoignagesValides.map((t, i) => ({ programme_id: programmeId, type: t.type, url: t.url, nom: t.nom || null, ordre: i }))
          )
        }

        // Intervenants (upload des nouvelles photos d'abord)
        await supabase.from('intervenants').delete().eq('programme_id', programmeId)
        const intervenantsAvecUrl = await Promise.all(
          intervenants.map(async (it) => {
            let photo_url = it.photo_url ?? null
            if (it.file) {
              photo_url = await uploadImage(it.file)
            }
            return { ...it, photo_url }
          })
        )
        const intervenantsValides = intervenantsAvecUrl.filter((it) => it.nom)
        if (intervenantsValides.length > 0) {
          await supabase.from('intervenants').insert(
            intervenantsValides.map((it, i) => ({ programme_id: programmeId, nom: it.nom, bio: it.bio || null, photo_url: it.photo_url, ordre: i }))
          )
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
        <p className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-3 py-2">{error}</p>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Titre du programme</label>
        <input type="text" required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Secteur</label>
          <select value={form.secteur_id} onChange={(e) => setForm({ ...form, secteur_id: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600">
            {secteurs.map((s) => (<option key={s.id} value={s.id}>{s.nom}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Programme['type'] })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600">
            <option value="formation">Formation</option>
            <option value="masterclass">Masterclass</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description courte</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Contenu détaillé du programme</label>
        <textarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} rows={5}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Pour qui est conçu ce programme</label>
        <textarea
          placeholder="ex: Entrepreneurs débutants, freelances qui veulent structurer leur offre..."
          value={form.public_cible}
          onChange={(e) => setForm({ ...form, public_cible: e.target.value })}
          rows={3}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
        />
        <p className="text-xs text-gray-600 mt-1">Affiché dans une section dédiée sur la page publique.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input type="checkbox" checked={form.afficher_certification} onChange={(e) => setForm({ ...form, afficher_certification: e.target.checked })} />
        Afficher la mention "Certificat à la fin du programme" sur la page
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Date de début</label>
          <input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Date de fin</label>
          <input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
        </div>
      </div>

      {form.type !== 'formation' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Heure de début</label>
              <input type="time" value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
                className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Heure de fin</label>
              <input type="time" value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
                className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600 -mt-3">Précise l&apos;heure exacte de début et fin de la masterclass.</p>
        </>
      )}

      {form.type === 'formation' && (
        <div className="border border-white/10 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Vacations</label>
            <p className="text-xs text-gray-600">Ajoute un ou plusieurs créneaux horaires (ex : &quot;Matinée&quot; 9h-12h).</p>
          </div>
          {vacations.map((v, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input type="text" placeholder="Nom (ex: Matinée)" value={v.nom} onChange={(e) => modifierVacation(i, 'nom', e.target.value)}
                className="sm:w-40 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
              <div className="flex items-center gap-2 flex-1">
                <input type="time" value={v.heure_debut} onChange={(e) => modifierVacation(i, 'heure_debut', e.target.value)}
                  className="flex-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
                <span className="text-gray-600">à</span>
                <input type="time" value={v.heure_fin} onChange={(e) => modifierVacation(i, 'heure_fin', e.target.value)}
                  className="flex-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
                <button type="button" onClick={() => retirerVacation(i)} className="text-red-500 hover:text-red-400 text-sm px-2 shrink-0">Retirer</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={ajouterVacation} className="text-sm border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition">+ Ajouter une vacation</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Pays</label>
          <select required value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600">
            <option value="">Choisis un pays</option>
            {PAYS_FRANCOPHONES.map((p) => (<option key={p.nom} value={p.nom}>{p.nom} (+{p.indicatif})</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ville</label>
          <input type="text" required placeholder="ex: Kinshasa" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Adresse précise (optionnel)</label>
        <input type="text" placeholder="ex: 63, avenue Colonel Mondjiba" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prix original ($)</label>
          <input type="number" step="0.01" placeholder="ex: 82" value={form.prix_original} onChange={(e) => setForm({ ...form, prix_original: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prix promo affiché ($)</label>
          <input type="number" step="0.01" placeholder="ex: 49" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Frais d&apos;inscription ($)</label>
        <input type="number" step="0.01" value={form.frais_inscription} onChange={(e) => setForm({ ...form, frais_inscription: e.target.value })}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Lien d&apos;inscription</label>
        <input type="text" placeholder="ex: https://wa.me/243xxxxxxxxx" value={form.lien_inscription} onChange={(e) => setForm({ ...form, lien_inscription: e.target.value })}
          className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Image d&apos;en-tête (bannière)</label>
        {previewHeader && <img src={previewHeader} alt="" className="w-full h-32 object-cover rounded-lg mb-2 border border-white/10" />}
        <input type="file" accept="image/*" onChange={handleHeaderChange} className={styleInputFichier} />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Image de carte (listing)</label>
        {previewCard && <img src={previewCard} alt="" className="w-full h-32 object-cover rounded-lg mb-2 border border-white/10" />}
        <input type="file" accept="image/*" onChange={handleCardChange} className={styleInputFichier} />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Affiche / Flyer</label>
        {previewAffiche && <img src={previewAffiche} alt="" className="w-full h-48 object-cover rounded-lg mb-2 border border-white/10" />}
        <input type="file" accept="image/*" onChange={handleAfficheChange} className={styleInputFichier} />
      </div>

      <div className="border border-white/10 rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Intervenants</label>
          <p className="text-xs text-gray-600">Mets en avant les formateurs/intervenants avec une photo et une courte bio.</p>
        </div>
        {intervenants.map((it, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-3">
              {it.preview && <img src={it.preview} alt="" className="w-16 h-16 rounded-full object-cover border border-white/10 shrink-0" />}
              <div className="flex-1 space-y-2">
                <input type="text" placeholder="Nom de l'intervenant" value={it.nom} onChange={(e) => modifierIntervenant(i, 'nom', e.target.value)}
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
                <textarea placeholder="Courte bio" value={it.bio} onChange={(e) => modifierIntervenant(i, 'bio', e.target.value)} rows={2}
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
                <input type="file" accept="image/*" onChange={(e) => handleIntervenantPhoto(i, e)} className={styleInputFichier} />
              </div>
            </div>
            <button type="button" onClick={() => retirerIntervenant(i)} className="text-red-500 hover:text-red-400 text-sm">Retirer cet intervenant</button>
          </div>
        ))}
        <button type="button" onClick={ajouterIntervenant} className="text-sm border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition">+ Ajouter un intervenant</button>
      </div>

      <div className="border border-white/10 rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Témoignages / Preuves sociales</label>
          <p className="text-xs text-gray-600">Ajoute des captures d&apos;écran ou des liens vidéo (YouTube, TikTok...) de témoignages clients.</p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Titre de la section vidéo (optionnel)</label>
          <input
            type="text"
            placeholder="ex: Découvre le programme en vidéo"
            value={form.titre_video}
            onChange={(e) => setForm({ ...form, titre_video: e.target.value })}
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
          />
          <p className="text-xs text-gray-600 mt-1">Affiché au-dessus des vidéos ajoutées ci-dessous, si tu en as au moins une. Laisse vide pour n&apos;afficher aucun titre.</p>
        </div>
        {temoignages.map((t, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex gap-2">
              <select value={t.type} onChange={(e) => modifierTemoignage(i, 'type', e.target.value)}
                className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600">
                <option value="image">Capture d&apos;écran</option>
                <option value="video">Vidéo (lien)</option>
              </select>
              <input type="text" placeholder="Nom (optionnel)" value={t.nom} onChange={(e) => modifierTemoignage(i, 'nom', e.target.value)}
                className="flex-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
            </div>
            {t.type === 'image' ? (
              <>
                {t.preview && <img src={t.preview} alt="" className="w-full h-32 object-cover rounded-lg border border-white/10" />}
                <input type="file" accept="image/*" onChange={(e) => handleTemoignageFichier(i, e)} className={styleInputFichier} />
              </>
            ) : (
              <input type="text" placeholder="Lien de la vidéo (YouTube, TikTok...)" value={t.url} onChange={(e) => modifierTemoignage(i, 'url', e.target.value)}
                className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
            )}
            <button type="button" onClick={() => retirerTemoignage(i)} className="text-red-500 hover:text-red-400 text-sm">Retirer ce témoignage</button>
          </div>
        ))}
        <button type="button" onClick={ajouterTemoignage} className="text-sm border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition">+ Ajouter un témoignage</button>
      </div>

      <div className="border border-white/10 rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">FAQ</label>
          <p className="text-xs text-gray-600">S&apos;affiche en bas de la page de vente.</p>
        </div>
        {faqs.map((f, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-3 space-y-2">
            <input type="text" placeholder="Question" value={f.question} onChange={(e) => modifierFaq(i, 'question', e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
            <textarea placeholder="Réponse" value={f.reponse} onChange={(e) => modifierFaq(i, 'reponse', e.target.value)} rows={2}
              className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-gray-600" />
            <button type="button" onClick={() => retirerFaq(i)} className="text-red-500 hover:text-red-400 text-sm">Retirer cette question</button>
          </div>
        ))}
        <button type="button" onClick={ajouterFaq} className="text-sm border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition">+ Ajouter une question</button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-400">
        <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} />
        Programme actif (visible publiquement)
      </label>

      <button type="submit" disabled={loading}
        className="w-full bg-white text-black font-semibold rounded-lg py-2 hover:bg-gray-200 transition disabled:opacity-50">
        {loading ? 'Enregistrement...' : programme ? 'Mettre à jour' : 'Créer le programme'}
      </button>
    </form>
  )
}