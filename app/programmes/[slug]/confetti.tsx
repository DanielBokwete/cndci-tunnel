'use client'

import { useMemo } from 'react'

const COULEURS = ['#1666f0', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ffffff']

export default function Confetti() {
  const particules = useMemo(() => {
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      gauche: Math.random() * 100,
      delai: Math.random() * 2,
      duree: 2.5 + Math.random() * 1.5,
      taille: 6 + Math.random() * 6,
      couleur: COULEURS[Math.floor(Math.random() * COULEURS.length)],
      arrondi: Math.random() > 0.5,
    }))
  }, [])

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {particules.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.gauche}%`,
            top: '-5vh',
            width: p.taille,
            height: p.taille,
            backgroundColor: p.couleur,
            borderRadius: p.arrondi ? '50%' : '2px',
            animation: `confetti-fall ${p.duree}s linear ${p.delai}s infinite`,
          }}
        />
      ))}
    </div>
  )
}