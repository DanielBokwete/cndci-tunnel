import { createClient } from '@/lib/supabase/server'
import type { Secteur } from '@/lib/types'
import ProgrammeForm from '../programme-form'

export default async function NouveauProgrammePage() {
  const supabase = await createClient()
  const { data: secteurs } = await supabase
    .from('secteurs')
    .select('*')
    .order('nom') as { data: Secteur[] | null }

  return (
    <main className="min-h-screen bg-[#070c18] text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Nouveau programme</h1>
        <ProgrammeForm secteurs={secteurs ?? []} />
      </div>
    </main>
  )
}