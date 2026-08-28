'use client'

import { useEffect, useRef, useState } from 'react'

function extraireIdYoutube(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function extraireIdTiktok(url: string): string | null {
  const match = url.match(/tiktok\.com\/.+\/video\/(\d+)/)
  return match ? match[1] : null
}

export default function TemoignageVideo({ url }: { url: string }) {
  const idYoutube = extraireIdYoutube(url)
  const idTiktok = !idYoutube ? extraireIdTiktok(url) : null
  const embarquable = idYoutube || idTiktok

  const containerRef = useRef<HTMLDivElement>(null)
  const [flottant, setFlottant] = useState(false)
  const [fermee, setFermee] = useState(false)

  useEffect(() => {
    if (!embarquable) return
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Flotte des qu'on quitte la zone (au-dessus ou en dessous), grande quand bien visible
        setFlottant(entry.intersectionRatio < 0.6)
      },
      { threshold: [0, 0.6, 1] }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [embarquable])

  if (!embarquable) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-40 rounded-xl border border-white/10 bg-gray-900 text-gray-300 hover:border-white/30 transition">
        Voir le témoignage
      </a>
    )
  }

  const src = idYoutube ? `https://www.youtube.com/embed/${idYoutube}` : `https://www.tiktok.com/embed/v2/${idTiktok}`
  const actif = flottant && !fermee

  return (
    <div ref={containerRef} className="aspect-video w-full relative">
      {actif && <div className="aspect-video w-full" />}
      <div
        className={
          actif
            ? 'fixed bottom-4 right-4 z-[60] w-56 sm:w-64 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/60 bg-black'
            : 'aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black'
        }
      >
        {actif && (
          <button onClick={() => setFermee(true)} className="absolute top-1 right-1 z-10 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-black">
            ×
          </button>
        )}
        <iframe
          src={src}
          title="Vidéo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  )
}