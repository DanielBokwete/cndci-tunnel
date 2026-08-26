'use client'

import { useEffect, useState } from 'react'

function calculerTempsRestant() {
  const maintenant = new Date()
  const minuit = new Date(maintenant)
  minuit.setHours(24, 0, 0, 0)
  const restant = minuit.getTime() - maintenant.getTime()

  const heures = Math.floor(restant / (60 * 60 * 1000))
  const minutes = Math.floor((restant % (60 * 60 * 1000)) / (60 * 1000))
  const secondes = Math.floor((restant % (60 * 1000)) / 1000)

  return { heures, minutes, secondes }
}

export default function OffreBar({
  prix,
  prixOriginal,
  fraisInscription,
}: {
  prix: number
  prixOriginal: number | null
  fraisInscription: number | null
}) {
  const [temps, setTemps] = useState(() => calculerTempsRestant())

  useEffect(() => {
    const interval = setInterval(() => {
      setTemps(calculerTempsRestant())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  const reduction =
    prixOriginal && prixOriginal > prix
      ? Math.round(((prixOriginal - prix) / prixOriginal) * 100)
      : null

  function allerAuFormulaire() {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl font-extrabold text-green-400 animate-pulse">{prix}$</span>
        {prixOriginal && (
          <span className="text-lg text-gray-500 line-through">{prixOriginal}$</span>
        )}
        {reduction && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            -{reduction}%
          </span>
        )}
        {fraisInscription ? (
          <span className="text-sm text-gray-500">+ {fraisInscription}$ frais d&apos;inscription</span>
        ) : null}
      </div>
      {reduction && (
        <p className="text-xs text-green-400 -mt-2">Prix promo valable aujourd&apos;hui</p>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 border-t border-white/10">
        <div className="inline-flex items-center gap-3 bg-red-950/40 border border-red-800/50 rounded-2xl px-5 py-3">
          <span className="text-red-400 text-xs font-semibold uppercase tracking-wide">
            Offre expire dans
          </span>
          <div className="flex items-center gap-1 font-mono text-xl font-bold text-white">
            <span className="bg-red-900/60 rounded-lg px-2 py-1">{pad(temps.heures)}</span>
            <span className="text-red-400">:</span>
            <span className="bg-red-900/60 rounded-lg px-2 py-1">{pad(temps.minutes)}</span>
            <span className="text-red-400">:</span>
            <span className="bg-red-900/60 rounded-lg px-2 py-1">{pad(temps.secondes)}</span>
          </div>
        </div>
        <button onClick={allerAuFormulaire} className="bg-[#1666f0] hover:bg-[#1256cc] text-white font-bold rounded-xl px-6 py-3 transition text-center w-full sm:w-auto">
          Profiter de l&apos;offre maintenant
        </button>
      </div>
    </div>
  )
}