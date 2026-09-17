'use client'

import { useEffect, useRef, useState } from 'react'

function extraireIdYoutube(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function estShortYoutube(url: string): boolean {
  return url.includes('/shorts/')
}

function extraireIdTiktok(url: string): string | null {
  const match = url.match(/tiktok\.com\/.+\/video\/(\d+)/)
  return match ? match[1] : null
}

function estInstagram(url: string): boolean {
  return /instagram\.com\/(p|reel|tv)\//.test(url)
}

function estVideoNative(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)
}

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    function traiter() {
      window.instgrm?.Embeds.process()
    }
    if (window.instgrm) {
      traiter()
      return
    }
    const scriptExistant = document.getElementById('instagram-embed-script')
    if (scriptExistant) {
      scriptExistant.addEventListener('load', traiter)
      return () => scriptExistant.removeEventListener('load', traiter)
    }
    const script = document.createElement('script')
    script.id = 'instagram-embed-script'
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    script.onload = traiter
    document.body.appendChild(script)
  }, [url])

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ background: '#000', border: 0, margin: 0, width: '100%' }}
    />
  )
}

export default function TemoignageVideo({ url }: { url: string }) {
  const videoNative = estVideoNative(url)
  const idYoutube = !videoNative ? extraireIdYoutube(url) : null
  const idTiktok = !videoNative && !idYoutube ? extraireIdTiktok(url) : null
  const instagram = !videoNative && !idYoutube && !idTiktok && estInstagram(url)
  const embarquable = videoNative || idYoutube || idTiktok

  const containerRef = useRef<HTMLDivElement>(null)
  const [flottant, setFlottant] = useState(false)
  const [fermee, setFermee] = useState(false)
  const [ratioNatif, setRatioNatif] = useState<number | null>(null)

  const ratio = videoNative
    ? ratioNatif ?? 16 / 9
    : idYoutube
    ? (estShortYoutube(url) ? 9 / 16 : 16 / 9)
    : 9 / 16

  useEffect(() => {
    if (!embarquable) return
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFlottant(entry.intersectionRatio < 0.6)
      },
      { threshold: [0, 0.6, 1] }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [embarquable])

  if (instagram) {
    return (
      <div className="w-full flex justify-center overflow-hidden rounded-xl border border-white/10">
        <InstagramEmbed url={url} />
      </div>
    )
  }

  if (!embarquable) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-40 rounded-xl border border-white/10 bg-gray-900 text-gray-300 hover:border-white/30 transition">
        Voir le témoignage
      </a>
    )
  }

  const actif = flottant && !fermee

  const contenuLecteur = videoNative ? (
    <video
      src={url}
      controls
      playsInline
      onLoadedMetadata={(e) => {
        const v = e.currentTarget
        if (v.videoWidth && v.videoHeight) {
          setRatioNatif(v.videoWidth / v.videoHeight)
        }
      }}
      className="w-full h-full object-contain bg-black"
    />
  ) : (
    <iframe
      src={idYoutube ? `https://www.youtube.com/embed/${idYoutube}` : `https://www.tiktok.com/embed/v2/${idTiktok}`}
      title="Vidéo"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    />
  )

  return (
    <div ref={containerRef} className="w-full relative flex justify-center" style={{ aspectRatio: ratio, maxHeight: '75vh' }}>
      {actif && <div className="w-full h-full" />}
      <div
        style={actif ? undefined : { aspectRatio: ratio, maxHeight: '75vh', maxWidth: '100%' }}
        className={
          actif
            ? 'fixed bottom-4 right-4 z-[60] w-40 sm:w-52 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/60 bg-black'
            : 'rounded-xl overflow-hidden border border-white/10 bg-black'
        }
      >
        {actif && (
          <button onClick={() => setFermee(true)} className="absolute top-1 right-1 z-10 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-black">
            ×
          </button>
        )}
        {contenuLecteur}
      </div>
    </div>
  )
}