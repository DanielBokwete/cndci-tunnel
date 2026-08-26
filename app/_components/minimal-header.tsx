import Link from 'next/link'
import Image from 'next/image'

export default function MinimalHeader() {
  return (
    <div className="fixed top-3 left-3 z-50">
      <Link
        href="/"
        className="flex items-center gap-2 bg-[#070c18]/70 backdrop-blur-md rounded-full pl-2 pr-3 py-1.5 border border-white/10"
      >
        <Image src="/logo-cndci.png" alt="CNDCI" width={28} height={28} />
        <span className="font-extrabold text-base tracking-tight text-white">
          CND<span className="text-[#1666f0]">CI</span>
        </span>
      </Link>
    </div>
  )
}