export default function PrixDisplay({
  prix,
  prixOriginal,
  fraisInscription,
}: {
  prix: number
  prixOriginal: number | null
  fraisInscription: number | null
}) {
  const reduction =
    prixOriginal && prixOriginal > prix
      ? Math.round(((prixOriginal - prix) / prixOriginal) * 100)
      : null

  return (
    <div className="border border-gray-800 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-500 uppercase">Prix</p>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-3xl font-extrabold text-green-400 animate-pulse">
          {prix}$
        </span>
        {prixOriginal && (
          <span className="text-lg text-gray-500 line-through">
            {prixOriginal}$
          </span>
        )}
        {reduction && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            -{reduction}%
          </span>
        )}
      </div>
      {fraisInscription ? (
        <p className="text-sm text-gray-500">+ {fraisInscription}$ frais d&apos;inscription</p>
      ) : null}
      {reduction && (
        <p className="text-xs text-green-400 mt-1">Prix promo valable aujourd&apos;hui</p>
      )}
    </div>
  )
}