import Link from 'next/link'

export default function MinimalHeader() {
  return (
    <div className="absolute top-0 left-0 z-10 px-6 py-5">
      <Link href="/" className="font-extrabold text-lg tracking-tight text-white drop-shadow">
        CND<span className="text-[#1666f0]">CI</span>
      </Link>
    </div>
  )
}