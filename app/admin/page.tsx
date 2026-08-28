import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrganisationCourante } from '@/lib/organisation'
import type { ProgrammeAvecSecteur } from '@/lib/types'
import LogoutButton from './logout-button'

export default async function AdminPage() {
  const supabase = await createClient()
  const organisation = await getOrganisationCourante(supabase)

  if (!organisation) {
    redirect('/inscription')
  }

  const { data: programmes } = await supabase
    .from('programmes')
    .select('*, secteur:secteurs(*)')
    .eq('organisation_id', organisation.id)
    .order('created_at', { ascending: false }) as { data: ProgrammeAvecSecteur[] | null }

  const joursEssaiRestants = organisation.plan === 'essai'
    ? Math.max(0, Math.ceil((new Date(organisation.essai_fin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <main className="min-h-screen bg-[#070c18] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">{organisation.nom}</h1>
            <p className="text-gray-500 text-sm">Gestion des programmes</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-8">
          {organisation.plan === 'essai' && (
            <span className="inline-block text-xs font-semibold bg-yellow-950 text-yellow-400 border border-yellow-800 rounded-full px-3 py-1">
              Essai gratuit — {joursEssaiRestants} jour{joursEssaiRestants !== 1 ? 's' : ''} restant{joursEssaiRestants !== 1 ? 's' : ''}
            </span>
          )}
          {organisation.plan === 'actif' && (
            <span className="inline-block text-xs font-semibold bg-green-950 text-green-400 border border-green-800 rounded-full px-3 py-1">
              Abonnement actif
            </span>
          )}
          {organisation.plan === 'expire' && (
            <span className="inline-block text-xs font-semibold bg-red-950 text-red-400 border border-red-800 rounded-full px-3 py-1">
              Abonnement expiré
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/admin/programmes/nouveau"
            className="inline-block bg-white text-black font-semibold rounded-lg px-4 py-2 hover:bg-gray-200 transition"
          >
            + Nouveau programme
          </Link>
          <Link
            href="/admin/secteurs"
            className="inline-block border border-white/20 text-white font-semibold rounded-lg px-4 py-2 hover:bg-white/10 transition"
          >
            Gérer les secteurs
          </Link>
        </div>

        {!programmes || programmes.length === 0 ? (
          <p className="text-gray-500">Aucun programme pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {programmes.map((p) => (
              <Link
                key={p.id}
                href={`/admin/programmes/${p.id}`}
                className="flex items-center justify-between border border-white/10 rounded-xl px-5 py-4 hover:border-white/30 transition"
              >
                <div>
                  <p className="font-semibold">{p.titre}</p>
                  <p className="text-sm text-gray-500">
                    {p.secteur?.nom ?? 'Sans secteur'} · {p.type}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    p.actif ? 'bg-green-950 text-green-400' : 'bg-gray-900 text-gray-500'
                  }`}
                >
                  {p.actif ? 'Actif' : 'Inactif'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}