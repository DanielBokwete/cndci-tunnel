'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ programmeId }: { programmeId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('programmes').delete().eq('id', programmeId)
    router.push('/admin')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Confirmer ?</span>
        <button onClick={handleDelete} disabled={loading} className="text-sm bg-red-700 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 transition disabled:opacity-50">
          {loading ? 'Suppression...' : 'Oui, supprimer'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-sm text-gray-500 hover:text-white transition">
          Annuler
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-sm text-red-500 hover:text-red-400 transition">
      Supprimer le programme
    </button>
  )
}