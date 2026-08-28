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
  if (idYoutube) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
        <iframe
          src={`https://www.youtube.com/embed/${idYoutube}`}
          title="Témoignage vidéo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  const idTiktok = extraireIdTiktok(url)
  if (idTiktok) {
    return (
      <div className="aspect-[9/16] max-h-[500px] w-full rounded-xl overflow-hidden border border-white/10 bg-black">
        <iframe
          src={`https://www.tiktok.com/embed/v2/${idTiktok}`}
          title="Témoignage vidéo"
          allow="encrypted-media"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-40 rounded-xl border border-white/10 bg-gray-900 text-gray-300 hover:border-white/30 transition">
      Voir le témoignage
    </a>
  )
}