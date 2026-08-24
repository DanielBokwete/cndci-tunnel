import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProgrammeAvecSecteur, Programme } from '@/lib/types'
import CountdownTimer from './countdown-timer'
import LeadForm from './lead-form'
import PrixDisplay from './prix-display'
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

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <CountdownTimer />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  {heureDebutFmt && (
                    <p className="text-sm text-gray-400">{heureDebutFmt}</p>
                  )}
                </div>
              )}
              {programme.date_fin && (
                <div className="border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Fin</p>
                  <p className="font-semibold">{formatDate(programme.date_fin)}</p>
                  {heureFinFmt && (
                    <p className="text-sm text-gray-400">{heureFinFmt}</p>
                  )}
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
          {programme.prix != null && (
            <PrixDisplay
              prix={programme.prix}
              prixOriginal={programme.prix_original}
              fraisInscription={programme.frais_inscription}
            />
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
        />
      </div>

      <SiteFooter />
    </main>
  )
}