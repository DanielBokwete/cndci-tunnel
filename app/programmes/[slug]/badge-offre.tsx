'use client'

export default function BadgeOffre({
  joursRestants,
  imageAfficheUrl,
  reduction,
}: {
  joursRestants: number
  imageAfficheUrl: string | null
  reduction: number | null
}) {
  function allerAuFormulaire() {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <button onClick={allerAuFormulaire} className="fixed top-3 right-3 z-50 text-left">
      {imageAfficheUrl ? (
        <div className="w-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg shadow-black/50">
          <div className="relative w-20 h-20">
            <img src={imageAfficheUrl} alt="" className="w-full h-full object-cover blur-[1px]" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-red-500 font-extrabold text-sm animate-pulse drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {joursRestants === 0 ? "Aujourd'hui" : `J-${joursRestants}`}
              </span>
            </div>
          </div>
          {reduction && (
            <div className="bg-red-600 text-white text-[10px] font-bold text-center py-1 animate-pulse">
              -{reduction}% aujourd&apos;hui
            </div>
          )}
        </div>
      ) : (
        <div className="bg-black/70 backdrop-blur border border-white/20 rounded-xl px-4 py-2 shadow-lg shadow-black/50 text-center">
          <span className="text-red-500 animate-pulse text-xs font-bold block">
            {joursRestants === 0 ? "Débute aujourd'hui" : `Début dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`}
          </span>
          {reduction && (
            <span className="text-red-500 animate-pulse text-xs font-bold block mt-0.5">
              -{reduction}% aujourd&apos;hui
            </span>
          )}
        </div>
      )}
    </button>
  )
}