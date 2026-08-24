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

export default function CountdownTimer() {
  const [temps, setTemps] = useState(() => calculerTempsRestant())

  useEffect(() => {
    const interval = setInterval(() => {
      setTemps(calculerTempsRestant())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  function allerAuFormulaire() {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="inline-flex items-center gap-3 bg-red-950/40 border border-red-800/50 rounded-2xl px-6 py-4">
        <span className="text-red-400 text-sm font-semibold uppercase tracking-wide">
          Offre expire dans
        </span>
        <div className="flex items-center gap-1 font-mono text-2xl font-bold text-white">
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
  )
}