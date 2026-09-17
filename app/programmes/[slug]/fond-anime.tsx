export default function FondAnime() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ backgroundColor: '#050608' }}>
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-bulle1"
        style={{ top: '-10%', left: '-5%', backgroundColor: 'rgba(255,59,48,0.16)' }}
      />
      <div
        className="absolute w-[450px] h-[450px] rounded-full blur-3xl animate-bulle2"
        style={{ top: '5%', right: '-8%', backgroundColor: 'rgba(255,122,26,0.13)' }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-bulle3"
        style={{ top: '45%', left: '60%', backgroundColor: 'rgba(255,59,48,0.10)' }}
      />
      <div
        className="absolute w-[420px] h-[420px] rounded-full blur-3xl animate-bulle2"
        style={{ top: '35%', left: '-10%', backgroundColor: 'rgba(255,122,26,0.10)' }}
      />
      <div
        className="absolute w-[480px] h-[480px] rounded-full blur-3xl animate-bulle1"
        style={{ bottom: '-10%', left: '30%', backgroundColor: 'rgba(255,59,48,0.12)' }}
      />
    </div>
  )
}