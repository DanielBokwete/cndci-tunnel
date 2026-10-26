'use client'

import { useEffect, useRef, useState, type Ref } from 'react'

// Fenêtre vidéo qui prend la forme de la vidéo importée (verticale, carrée ou horizontale),
// sans bandes noires ni déformation.
export default function VideoAdaptee({
  src,
  poster,
  barre,
  fenetreRef,
  incline = true,
}: {
  src: string
  poster?: string | null
  barre: string
  fenetreRef?: Ref<HTMLDivElement>
  incline?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ratio, setRatio] = useState<number | null>(null)
  const [sonActif, setSonActif] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const lire = () => { if (v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight) }
    lire()
    v.addEventListener('loadedmetadata', lire)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) v.pause()

    // Une seule vidéo avec le son à la fois sur la page
    const couper = (e: Event) => {
      if ((e as CustomEvent).detail !== v) { v.muted = true; setSonActif(false) }
    }
    window.addEventListener('sk-son', couper)
    return () => { v.removeEventListener('loadedmetadata', lire); window.removeEventListener('sk-son', couper) }
  }, [src])

  function basculerSon() {
    const v = videoRef.current
    if (!v) return
    const activer = v.muted
    if (activer) {
      window.dispatchEvent(new CustomEvent('sk-son', { detail: v }))
      v.currentTime = 0
    }
    v.muted = !activer
    v.play().catch(() => {})
    setSonActif(activer)
  }

  // Vertical : fenêtre étroite façon téléphone ; carré : moyenne ; horizontal : pleine largeur
  const r = ratio ?? 16 / 9
  const largeurMax = r < 0.8 ? 400 : r < 1.25 ? 620 : 1120

  return (
    <div className="window" ref={fenetreRef} style={{ maxWidth: largeurMax, marginInline: 'auto', ...(incline ? {} : { transform: 'none' }) }}>
      <div className="bar-top" aria-hidden="true"><i /><i /><i /><span>{barre}</span></div>
      <div className="promo" style={{ aspectRatio: String(r) }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster ?? undefined}
          src={src}
          style={{ objectFit: 'cover' }}
        />
        <button className="chip-btn" type="button" aria-pressed={sonActif} onClick={basculerSon}>
          {sonActif ? '🔊 Son activé' : '🔇 Activer le son'}
        </button>
      </div>
    </div>
  )
}
