'use client'

export default function BoutonReserver({ accent }: { accent: string }) {
  function allerAuFormulaire() {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <button
      onClick={allerAuFormulaire}
      style={{ backgroundColor: accent }}
      className="w-full sm:w-auto text-white font-bold rounded-xl px-8 py-3 transition hover:brightness-90"
    >
      Réserver ma place
    </button>
  )
}