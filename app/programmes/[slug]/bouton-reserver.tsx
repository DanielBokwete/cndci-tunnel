'use client'

export default function BoutonReserver() {
  function allerAuFormulaire() {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <button onClick={allerAuFormulaire} className="w-full sm:w-auto bg-[#1666f0] hover:bg-[#1256cc] text-white font-bold rounded-xl px-8 py-3 transition">
      Réserver ma place
    </button>
  )
}