import Link from 'next/link'
import Image from 'next/image'

export default function MinimalHeader() {
  return (
    <div className="absolute top-0 left-0 z-10 px-6 py-4">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo-cndci.png" alt="CNDCI" width={32} height={32} />
        <span className="font-extrabold text-lg tracking-tight text-white drop-shadow">
          CND<span className="text-[#1666f0]">CI</span>
        </span>
      </Link>
    </div>
  )
}