import type { SupabaseClient } from '@supabase/supabase-js'
import type { Organisation } from './types'

export async function getOrganisationCourante(
  supabase: SupabaseClient
): Promise<Organisation | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profil } = await supabase
    .from('profils')
    .select('organisation_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profil) return null

  const { data: organisation } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', profil.organisation_id)
    .single()

  return organisation as Organisation | null
}