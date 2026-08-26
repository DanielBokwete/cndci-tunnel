import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProgrammeAvecSecteur, Programme, Vacation } from '@/lib/types'
import OffreBar from './offre-bar'
import LeadForm from './lead-form'
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
    .from('vacations')
    .select('*')
    .eq('programme_id', programme.id)
    .order('ordre') as { data: Vacation[] | null }

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
          <img
            src={programme.image_header_url}
            alt={programme.titre}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${programme.secteur?.couleur ?? '#1666f0'}, #070c18)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-[#070c18]/40 to-black/10" />

        <div className="relative h-full flex flex-col justify-end max-w-4xl mx-auto px-6 pb-10">
          <div className="flex items-center gap-2 mb-4">
            {programme.secteur && (
              <span
                className="inline-block w-fit text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1"
                style={{ backgroundColor: programme.secteur.couleur, color: '#000' }}
              >
                {programme.secteur.nom}
              </span>
            )}
            <span className="inline-block w-fit text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 bg-white/10 border border-white/30 text-white">
              {labelType}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            {programme.titre}
          </h1>
          {programme.description && (
            <p className="text-gray-300 mt-3 text-lg max-w-2xl">{programme.description}</p>
          )}
        </div>
      </div>

      {joursRestants !== null && (
        <div className="fixed top-3 right-3 z-50">
          {programme.image_affiche_url ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg shadow-black/50">
              <img
                src={programme.image_affiche_url}
                alt=""
                className="w-full h-full object-cover blur-[1px]"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-red-500 font-extrabold text-sm animate-pulse drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {joursRestants === 0 ? "Aujourd'hui" : `J-${joursRestants}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-black/70 backdrop-blur border border-white/20 rounded-full px-4 py-2 text-xs font-bold shadow-lg shadow-black/50">
              <span className="text-red-500 animate-pulse">
                {joursRestants === 0 ? "Débute aujourd'hui" : `Début dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {programme.prix != null && (
          <OffreBar
            prix={programme.prix}
            prixOriginal={programme.prix_original}
            fraisInscription={programme.frais_inscription}
          />
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {programme.type === 'masterclass' ? (
            programme.date_debut && (
              <div className="border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Date et heure</p>
                <p className="font-semibold">{formatDate(programme.date_debut)}</p>
                {plageHoraire && (
                  <p className="text-sm text-gray-400">{plageHoraire}</p>
                )}
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
          {programme.lieu && (
            <div className="border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Lieu</p>
              <p className="font-semibold">{programme.lieu}</p>
            </div>
          )}
        </div>

        {programme.contenu && (
          <div className={programme.image_affiche_url ? 'grid grid-cols-1 md:grid-cols-3 gap-8' : ''}>
            <div className={programme.image_affiche_url ? 'md:col-span-2' : ''}>
              <h2 className="text-xl font-bold mb-3">À propos de ce programme</h2>
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {programme.contenu}
              </p>
            </div>
            {programme.image_affiche_url && (
              <div className="mt-6 md:mt-0">
                <img
                  src={programme.image_affiche_url}
                  alt={`Affiche ${programme.titre}`}
                  className="w-full rounded-xl border border-white/10"
                />
              </div>
            )}
          </div>
        )}

        <LeadForm
          programmeId={programme.id}
          lienInscription={programme.lien_inscription}
          programmesSimilaires={programmesSimilaires ?? []}
          vacations={vacations ?? []}
        />
      </div>

      <SiteFooter />
    </main>
  )
}