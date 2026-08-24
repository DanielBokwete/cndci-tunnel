import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Programme } from '@/lib/types'
import ProspectsList from './prospects-list'

export default async function ProspectsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: programme } = await supabase
    .from('programmes')
    .select('*')
    .eq('id', id)
    .single() as { data: Programme | null }

  if (!programme) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#070c18] text-white px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">{programme.titre}</h1>

        <div className="flex gap-2 border-b border-white/10">
          <Link
            href={`/admin/programmes/${programme.id}`}
            className="text-sm text-gray-500 hover:text-white px-3 py-2 transition"
          >
            Modifier
          </Link>
          <span className="text-sm font-semibold px-3 py-2 border-b-2 border-white">
            Prospects
          </span>
        </div>

        <ProspectsList programmeId={programme.id} />
      </div>
    </main>
  )
}