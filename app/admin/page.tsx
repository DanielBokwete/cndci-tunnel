import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ProgrammeAvecSecteur } from '@/lib/types'
import LogoutButton from './logout-button'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: programmes } = await supabase
    .from('programmes')
    .select('*, secteur:secteurs(*)')
    .order('created_at', { ascending: false }) as { data: ProgrammeAvecSecteur[] | null }

  return (
    <main className="min-h-screen bg-[#070c18] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin CNDCI</h1>
            <p className="text-gray-500 text-sm">Gestion des programmes</p>
          </div>
          <LogoutButton />
        </div>

        <Link
          href="/admin/programmes/nouveau"
          className="inline-block bg-white text-black font-semibold rounded-lg px-4 py-2 mb-8 hover:bg-gray-200 transition"
        >
          + Nouveau programme
        </Link>

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