import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ProgrammeAvecSecteur, Secteur } from '@/lib/types'
import SiteHeader from './_components/site-header'
import SiteFooter from './_components/site-footer'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: secteurs } = await supabase
    .from('secteurs')
    .select('*')
    .order('nom') as { data: Secteur[] | null }

  const { data: programmes } = await supabase
    .from('programmes')
    .select('*, secteur:secteurs(*)')
    .eq('actif', true)
    .order('created_at', { ascending: false }) as { data: ProgrammeAvecSecteur[] | null }

  return (
    <main className="min-h-screen bg-[#070c18] text-white">
      <SiteHeader />

      <div className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 30% 20%, #1666f0, transparent 60%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#1666f0] bg-[#1666f0]/10 border border-[#1666f0]/30 rounded-full px-4 py-1.5 mb-6">
              CNDCI · Groupe Elako
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Forme-toi en ligne ou en présentiel,<br />avec des experts
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Des formations et masterclass pratiques, encadrées par des
              formateurs expérimentés. Réserve ta place en quelques secondes.
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-2xl font-extrabold text-[#1666f0]">2,799+</p>
                <p className="text-sm text-gray-500">Étudiants formés</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#1666f0]">19+</p>
                <p className="text-sm text-gray-500">Formations</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#1666f0]">100%</p>
                <p className="text-sm text-gray-500">Cours en ligne et en présentiel</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#1666f0]">Certif.</p>
                <p className="text-sm text-gray-500">À la fin</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10">
            <img
              src="https://facileapp.org/cndci/assets/img/cndci_etudiant_illustration.jpg"
              alt="Étudiants CNDCI"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div id="formations" className="max-w-5xl mx-auto px-6 py-16">
        {!secteurs || secteurs.length === 0 ? (
          <p className="text-gray-500 text-center">
            Aucun secteur pour le moment.
          </p>
        ) : (
          <div className="space-y-16">
            {secteurs.map((secteur) => {
              const programmesDuSecteur = (programmes ?? []).filter(
                (p) => p.secteur_id === secteur.id
              )
              if (programmesDuSecteur.length === 0) return null

              return (
                <div key={secteur.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: secteur.couleur }}
                    />
                    <h2 className="text-xl font-bold">{secteur.nom}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {programmesDuSecteur.map((p) => (
                      <Link
                        key={p.id}
                        href={`/programmes/${p.slug}`}
                        className="group border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition"
                      >
                        <div className="relative h-36 overflow-hidden">
                          {p.image_card_url ? (
                            <img
                              src={p.image_card_url}
                              alt={p.titre}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{
                                background: `linear-gradient(135deg, ${secteur.couleur}, #070c18)`,
                              }}
                            />
                          )}
                          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur rounded-full px-2.5 py-1">
                            {p.type === 'formation' ? 'Formation' : p.type === 'masterclass' ? 'Masterclass' : 'Autre'}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-1 group-hover:text-[#1666f0] transition">
                            {p.titre}
                          </h3>
                          {p.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.description}</p>
                          )}
                          {p.prix != null && (
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 font-bold">{p.prix}$</span>
                              {p.prix_original && p.prix_original > p.prix && (
                                <span className="text-xs text-gray-600 line-through">{p.prix_original}$</span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div id="apropos" className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1666f0]">Présentation</span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-4">Le centre du Groupe Elako</h2>
          <p className="text-gray-400 leading-relaxed max-w-3xl">
            Le <span className="text-white font-semibold">CNDCI</span> (Centre Numérique de Développement des
            Compétences Informatiques) est le centre de formation du{' '}
            <span className="text-white font-semibold">Groupe Elako</span>, créé par{' '}
            <span className="text-white font-semibold">Michel Elako</span> en février 2021. Notre mission :
            rendre la formation de qualité accessible à tous, partout en République Démocratique du Congo
            et au-delà.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <div className="border border-white/10 rounded-2xl p-5">
              <p className="font-semibold mb-1">Accompagnement WhatsApp</p>
              <p className="text-sm text-gray-500">
                Un accompagnement personnalisé, par WhatsApp ou en direct, à chaque étape de ta formation.
              </p>
            </div>
            <div className="border border-white/10 rounded-2xl p-5">
              <p className="font-semibold mb-1">100% pratique</p>
              <p className="text-sm text-gray-500">
                Des formations orientées terrain, pour mettre en application ce que tu apprends dès le premier jour.
              </p>
            </div>
            <div className="border border-white/10 rounded-2xl p-5">
              <p className="font-semibold mb-1">Certification</p>
              <p className="text-sm text-gray-500">
                Un certificat à la fin de chaque parcours pour valider tes compétences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}