'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Award, Bike, BrainCircuit, ChartNoAxesCombined, House, Megaphone, UsersRound } from 'lucide-react'

const navItems = [
  { href: '/dashboard', Icon: House, label: 'Home', color: '#49a3ff' },
  { href: '/dashboard/customer-1', Icon: UsersRound, label: 'Customer Analytics', color: '#67e8f9' },
  { href: '/dashboard/sales', Icon: ChartNoAxesCombined, label: 'Sales Performance', color: '#45d5a0' },
  { href: '/dashboard/campaign-1', Icon: Megaphone, label: 'Campaign Center', color: '#facc15' },
  { href: '/dashboard/model-analytics', Icon: BrainCircuit, label: 'Model Analytics', color: '#c084fc' },
]

export default function Sidebar({ updatedDate }) {
  const pathname = usePathname()

  return (
    <>
    <aside className="flex min-h-screen w-[128px] shrink-0 flex-col overflow-y-auto border-r border-[#234c79] bg-gradient-to-b from-[#061d3b] to-[#08294d] text-white">
      <div className="border-b border-blue-200/15 px-3 py-5">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="mira-sidebar-bike relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-200/50 shadow-[0_5px_18px_rgba(73,163,255,.28)]">
            <span className="mira-sidebar-bike-glow absolute inset-1 rounded-full" aria-hidden="true" />
            <span className="mira-sidebar-bike-road absolute bottom-[10px] left-2 right-2" aria-hidden="true" />
            <Bike size={31} className="mira-sidebar-bike-icon relative z-10 text-amber-300" strokeWidth={2.3} />
          </div>
          <div className="min-w-0"><p className="whitespace-nowrap text-[12px] font-extrabold leading-tight tracking-tight">AdventureWorks</p><p className="mt-0.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-blue-200/70">Analytics Hub</p></div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col justify-evenly px-2.5 py-3">
        {navItems.map(({ href, Icon, label, color }) => {
          const isActive = pathname === href
          return <Link key={href} href={href} className={`group flex flex-col items-center gap-1.5 rounded-lg px-1.5 py-2.5 text-center text-[11px] font-bold leading-tight transition-all duration-200 ${isActive ? 'border border-blue-300/25 bg-white/10 text-white shadow-[0_5px_16px_rgba(17,100,220,.2)]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-md transition duration-200 group-hover:scale-110 ${isActive ? 'border-white/50 bg-white/20' : 'border-white/10 bg-slate-950/20'}`} style={{ color, boxShadow: `0 5px 14px ${color}35` }}><Icon size={20} strokeWidth={2.4} /></span>
            <span className="leading-[1.15]">{label}</span>
          </Link>
        })}
      </nav>

      <div className="border-t border-blue-200/15 px-2.5 pb-3 pt-3">
        <Link href="/thank-you" className="group flex flex-col items-center gap-1 rounded-lg border border-amber-200/20 bg-amber-300/10 px-1.5 py-2 text-center text-[9px] font-bold leading-tight text-amber-100 shadow-[0_6px_16px_rgba(251,191,36,.08)] transition hover:scale-[1.03] hover:border-amber-200/45 hover:bg-amber-300/20">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-200/30 bg-amber-300/15 text-amber-300 transition group-hover:rotate-6 group-hover:scale-110"><Award size={16} strokeWidth={2.5} /></span>
          <span>Grand<br />Finale</span>
        </Link>
      </div>
      <div className="border-t border-blue-200/15 px-2 py-4 text-center"><p className="text-[9px] font-semibold text-blue-200/60">Last updated:</p><p className="mt-0.5 text-[9px] font-bold leading-tight text-blue-100">{updatedDate}</p></div>
    </aside>
    </>
  )
}
