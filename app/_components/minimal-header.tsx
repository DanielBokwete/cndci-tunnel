import Link from 'next/link'
import Image from 'next/image'

export default function MinimalHeader() {
  return (
    <div className="absolute top-0 left-0 z-10 p-3">
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