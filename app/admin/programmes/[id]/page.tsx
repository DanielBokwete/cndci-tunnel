import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Secteur, Programme, Vacation, Faq, Temoignage, Intervenant } from '@/lib/types'
import ProgrammeForm from '../programme-form'
import DeleteButton from './delete-button'

export default async function EditerProgrammePage({
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

  const { data: secteurs } = await supabase
    .from('secteurs')
    .select('*')
    .eq('organisation_id', programme.organisation_id)
    .order('nom') as { data: Secteur[] | null }

  const { data: vacations } = await supabase
    .from('vacations').select('*').eq('programme_id', id).order('ordre') as { data: Vacation[] | null }
  const { data: faqs } = await supabase
    .from('faqs').select('*').eq('programme_id', id).order('ordre') as { data: Faq[] | null }
  const { data: temoignages } = await supabase
    .from('temoignages').select('*').eq('programme_id', id).order('ordre') as { data: Temoignage[] | null }
  const { data: intervenants } = await supabase
    .from('intervenants').select('*').eq('programme_id', id).order('ordre') as { data: Intervenant[] | null }

  return (
    <main className="min-h-screen bg-[#070c18] text-white px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Modifier le programme</h1>
          <DeleteButton programmeId={programme.id} />
        </div>

        <div className="flex gap-2 border-b border-white/10">
          <span className="text-sm font-semibold px-3 py-2 border-b-2 border-white">Modifier</span>
          <Link href={`/admin/programmes/${programme.id}/prospects`} className="text-sm text-gray-500 hover:text-white px-3 py-2 transition">
            Prospects
          </Link>
        </div>

        <ProgrammeForm
          secteurs={secteurs ?? []}
          programme={programme}
          vacationsInitiales={vacations ?? []}
          faqsInitiales={faqs ?? []}
          temoignagesInitiaux={temoignages ?? []}
          intervenantsInitiaux={intervenants ?? []}
        />
      </div>
    </main>
  )
}