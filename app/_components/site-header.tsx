import Link from 'next/link'
import Image from 'next/image'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#070c18]/80 backdrop-blur border-b border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-cndci.png" alt="CNDCI" width={36} height={36} />
          <span className="font-extrabold text-lg tracking-tight">
            CND<span className="text-[#1666f0]">CI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/#formations" className="hover:text-white transition">Formations</Link>
          <Link href="/#apropos" className="hover:text-white transition">Présentation</Link>
          <Link href="/#contact" className="hover:text-white transition">Contact</Link>
        </nav>
        <a href="https://wa.me/243825367992" target="_blank" rel="noopener noreferrer" className="text-sm bg-[#1666f0] hover:bg-[#1256cc] text-white font-semibold rounded-full px-4 py-2 transition">
          Nous contacter
        </a>
      </div>
    </header>
  )
}