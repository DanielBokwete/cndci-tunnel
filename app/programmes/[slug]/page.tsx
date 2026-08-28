import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProgrammeAvecSecteur, Programme, Vacation, Faq, Temoignage, Intervenant } from '@/lib/types'
import OffreBar from './offre-bar'
import LeadForm from './lead-form'
import TemoignageVideo from './temoignage-video'
import BadgeOffre from './badge-offre'
import BoutonReserver from './bouton-reserver'
import MinimalHeader from '../../_components/minimal-header'
import SiteFooter from '../../_components/site-footer'

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: programme } = await supabase
    .from('programmes')
    .select('*, secteur:secteurs(*)')
    .eq('slug', slug)
    .eq('actif', true)
    .single() as { data: ProgrammeAvecSecteur | null }

  if (!programme) {
    notFound()
  }

  const { data: programmesSimilaires } = await supabase
    .from('programmes')
    .select('*')
    .eq('secteur_id', programme.secteur_id)
    .eq('actif', true)
    .neq('id', programme.id)
    .limit(3) as { data: Programme[] | null }

  const { data: vacations } = await supabase
    .from('vacations').select('*').eq('programme_id', programme.id).order('ordre') as { data: Vacation[] | null }
  const { data: faqs } = await supabase
    .from('faqs').select('*').eq('programme_id', programme.id).order('ordre') as { data: Faq[] | null }
  const { data: temoignagesBruts } = await supabase
    .from('temoignages').select('*').eq('programme_id', programme.id).order('ordre') as { data: Temoignage[] | null }
  const { data: intervenants } = await supabase
    .from('intervenants').select('*').eq('programme_id', programme.id).order('ordre') as { data: Intervenant[] | null }

  const videos = (temoignagesBruts ?? []).filter((t) => t.type === 'video')
  const captures = (temoignagesBruts ?? []).filter((t) => t.type === 'image')

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const formatHeure = (h: string | null) => h ? h.slice(0, 5) : null

  const labelType =
    programme.type === 'formation' ? 'Formation' :
    programme.type === 'masterclass' ? 'Masterclass' : 'Autre'

  const heureDebutFmt = formatHeure(programme.heure_debut)
  const heureFinFmt = formatHeure(programme.heure_fin)
  const plageHoraire =
    heureDebutFmt && heureFinFmt ? `${heureDebutFmt} - ${heureFinFmt}` :
    heureDebutFmt ? heureDebutFmt : null

  const lieuAffiche = [programme.ville, programme.pays].filter(Boolean).join(', ')

  const reduction =
    programme.prix != null && programme.prix_original && programme.prix_original > programme.prix
      ? Math.round(((programme.prix_original - programme.prix) / programme.prix_original) * 100)
      : null

  let joursRestants: number | null = null
  if (programme.date_debut) {
    const aujourdhui = new Date()
    aujourdhui.setHours(0, 0, 0, 0)
    const debut = new Date(programme.date_debut)
    debut.setHours(0, 0, 0, 0)
    const diff = Math.round((debut.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 0) joursRestants = diff
  }

  return (
    <main className="min-h-screen bg-[#070c18] text-white">
      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden">
        <MinimalHeader />

        {programme.image_header_url ? (
          <img src={programme.image_header_url} alt={programme.titre} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${programme.secteur?.couleur ?? '#1666f0'}, #070c18)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-[#070c18]/40 to-black/10" />

        <div className="relative h-full flex flex-col justify-end max-w-4xl mx-auto px-6 pb-10">
          <div className="flex items-center gap-2 mb-4">
            {programme.secteur && (
              <span className="inline-block w-fit text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1" style={{ backgroundColor: programme.secteur.couleur, color: '#000' }}>
                {programme.secteur.nom}
              </span>
            )}
            <span className="inline-block w-fit text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 bg-white/10 border border-white/30 text-white">
              {labelType}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{programme.titre}</h1>
          {programme.description && <p className="text-gray-300 mt-3 text-lg max-w-2xl">{programme.description}</p>}
        </div>
      </div>

      {joursRestants !== null && (
        <BadgeOffre joursRestants={joursRestants} imageAfficheUrl={programme.image_affiche_url} reduction={reduction} />
      )}

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {programme.prix != null && (
          <OffreBar prix={programme.prix} prixOriginal={programme.prix_original} fraisInscription={programme.frais_inscription} />
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {programme.type === 'masterclass' ? (
            programme.date_debut && (
              <div className="border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Date et heure</p>
                <p className="font-semibold">{formatDate(programme.date_debut)}</p>
                {plageHoraire && <p className="text-sm text-gray-400">{plageHoraire}</p>}
              </div>
            )
          ) : (
            <>
              {programme.date_debut && (
                <div className="border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Début</p>
                  <p className="font-semibold">{formatDate(programme.date_debut)}</p>
                </div>
              )}
              {programme.date_fin && (
                <div className="border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Fin</p>
                  <p className="font-semibold">{formatDate(programme.date_fin)}</p>
                </div>
              )}
            </>
          )}
          {lieuAffiche && (
            <div className="border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Lieu</p>
              <p className="font-semibold">{lieuAffiche}</p>
              {programme.lieu && <p className="text-sm text-gray-400">{programme.lieu}</p>}
            </div>
          )}
        </div>

        {videos.length > 0 && (
          <div>
            {programme.titre_video && (
              <h2 className="text-xl font-bold mb-4">{programme.titre_video}</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((t) => (
                <div key={t.id}>
                  <TemoignageVideo url={t.url} />
                  {t.nom && <p className="text-sm text-gray-500 mt-2">{t.nom}</p>}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <BoutonReserver />
            </div>
          </div>
        )}

        {programme.contenu && (
          <div className={programme.image_affiche_url ? 'grid grid-cols-1 md:grid-cols-3 gap-8' : ''}>
            <div className={programme.image_affiche_url ? 'md:col-span-2' : ''}>
              <h2 className="text-xl font-bold mb-3">À propos de ce programme</h2>
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">{programme.contenu}</p>
              {programme.afficher_certification && (
                <div className="flex items-center gap-2 mt-4 text-sm text-green-400">
                  <span>🎓</span>
                  <span>Certificat délivré à la fin du programme</span>
                </div>
              )}
            </div>
            {programme.image_affiche_url && (
              <div className="mt-6 md:mt-0">
                <img src={programme.image_affiche_url} alt={`Affiche ${programme.titre}`} className="w-full rounded-xl border border-white/10" />
              </div>
            )}
          </div>
        )}

        {!programme.contenu && programme.afficher_certification && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <span>🎓</span>
            <span>Certificat délivré à la fin du programme</span>
          </div>
        )}

        {programme.public_cible && (
          <div>
            <h2 className="text-xl font-bold mb-3">Pour qui est ce programme</h2>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{programme.public_cible}</p>
          </div>
        )}

        {intervenants && intervenants.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Tes intervenants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {intervenants.map((it) => (
                <div key={it.id} className="border border-white/10 rounded-xl p-4 flex gap-4">
                  {it.photo_url ? (
                    <img src={it.photo_url} alt={it.nom} className="w-16 h-16 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#1666f0]/20 flex items-center justify-center text-lg font-bold shrink-0">
                      {it.nom.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{it.nom}</p>
                    {it.bio && <p className="text-sm text-gray-400 mt-1">{it.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {captures.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Ils en parlent</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {captures.map((t) => (
                <div key={t.id}>
                  <img src={t.url} alt={t.nom ?? 'Témoignage'} className="w-full rounded-xl border border-white/10 object-cover" />
                  {t.nom && <p className="text-sm text-gray-500 mt-2">{t.nom}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <LeadForm
          programmeId={programme.id}
          lienInscription={programme.lien_inscription}
          programmesSimilaires={programmesSimilaires ?? []}
          vacations={vacations ?? []}
          indicatif={programme.indicatif}
        />

        {faqs && faqs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Questions fréquentes</h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details key={f.id} className="border border-white/10 rounded-xl p-4 group">
                  <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                    {f.question}
                    <span className="text-gray-500 group-open:rotate-45 transition">+</span>
                  </summary>
                  <p className="text-gray-400 text-sm mt-3 whitespace-pre-line">{f.reponse}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}