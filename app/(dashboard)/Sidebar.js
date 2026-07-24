'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Award, Bike, ChartNoAxesCombined, Download, House, LineChart, QrCode, Sparkles, Target, UsersRound, X } from 'lucide-react'

const navItems = [
  { href: '/dashboard', Icon: House, label: 'Home', color: '#49a3ff' },
  { href: '/dashboard/customers', Icon: UsersRound, label: 'Customer', color: '#c28cff' },
  { href: '/dashboard/rfm', Icon: Target, label: 'RFM Segmentation', color: '#f6b440' },
  { href: '/dashboard/sales', Icon: ChartNoAxesCombined, label: 'Sales Performance', color: '#45d5a0' },
  { href: '/dashboard/forecasting', Icon: LineChart, label: 'Forecast & Insights', color: '#57c4f4' },
  { href: '/dashboard/ai-center', Icon: Sparkles, label: 'Campaign Center', color: '#ff9f72' },
]

export default function Sidebar({ latestDate }) {
  const pathname = usePathname()
  const [shareUrl, setShareUrl] = useState('')
  const [showQr, setShowQr] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    setShareUrl(process.env.NEXT_PUBLIC_PRESENTATION_URL || process.env.NEXT_PUBLIC_LOCAL_SHARE_URL || `${window.location.origin}/`)
    const captureInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
  }, [])

  const installApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <>
    <aside className="flex min-h-screen w-[128px] shrink-0 flex-col overflow-y-auto border-r border-[#234c79] bg-gradient-to-b from-[#061d3b] to-[#08294d] text-white">
      <div className="border-b border-blue-200/15 px-3 py-5">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-blue-200/50 bg-blue-500/10 shadow-[0_5px_16px_rgba(73,163,255,.2)]">
            <Bike size={31} className="text-amber-300 drop-shadow-sm" strokeWidth={2.3} />
          </div>
          <div className="min-w-0"><p className="whitespace-nowrap text-[12px] font-extrabold leading-tight tracking-tight">AdventureWorks</p><p className="mt-0.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-blue-200/70">Analytics Hub</p></div>
        </div>
      </div>

      <nav className="flex-1 space-y-2.5 px-2.5 py-4">
        {navItems.map(({ href, Icon, label, color }) => {
          const isActive = pathname === href
          return <Link key={href} href={href} className={`group flex flex-col items-center gap-1.5 rounded-lg px-1.5 py-2.5 text-center text-[11px] font-bold leading-tight transition-all duration-200 ${isActive ? 'border border-blue-300/25 bg-white/10 text-white shadow-[0_5px_16px_rgba(17,100,220,.2)]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-md transition duration-200 group-hover:scale-110 ${isActive ? 'border-white/50 bg-white/20' : 'border-white/10 bg-slate-950/20'}`} style={{ color, boxShadow: `0 5px 14px ${color}35` }}><Icon size={20} strokeWidth={2.4} /></span>
            <span className="leading-[1.15]">{label}</span>
          </Link>
        })}
      </nav>

      <div className="px-2.5 pb-3">
        <Link href="/thank-you" className="group flex flex-col items-center gap-1 rounded-lg border border-amber-200/20 bg-amber-300/10 px-1.5 py-2 text-center text-[9px] font-bold leading-tight text-amber-100 shadow-[0_6px_16px_rgba(251,191,36,.08)] transition hover:scale-[1.03] hover:border-amber-200/45 hover:bg-amber-300/20">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-200/30 bg-amber-300/15 text-amber-300 transition group-hover:rotate-6 group-hover:scale-110"><Award size={16} strokeWidth={2.5} /></span>
          <span>Grand<br />Finale</span>
        </Link>
      </div>
      <div className="px-2.5 pb-3">
        <button type="button" onClick={() => setShowQr(true)} className="group flex w-full flex-col items-center gap-1 rounded-lg border border-sky-200/20 bg-white/10 px-1 py-1.5 text-center text-[8px] font-bold leading-tight text-sky-100 shadow-[0_6px_16px_rgba(56,189,248,.08)] transition hover:scale-[1.03] hover:border-sky-200/50 hover:bg-white/15">
          <span className="rounded-md bg-white p-1 shadow-sm">{shareUrl ? <QRCodeSVG value={shareUrl} size={52} level="M" marginSize={1} fgColor="#082d5c" title="Mobile presentation QR code" /> : <QrCode size={42} className="text-[#082d5c]" />}</span>
          <span>Scan for<br />Mobile</span>
        </button>
      </div>
      <div className="border-t border-blue-200/15 px-2 py-4 text-center"><p className="text-[9px] font-semibold text-blue-200/60">Data as of:</p><p className="mt-0.5 text-[9px] font-bold leading-tight text-blue-100">{latestDate || '31 May 2024'}</p></div>
    </aside>
    {showQr && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04152d]/80 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Mobile presentation QR code" onClick={() => setShowQr(false)}>
      <div className="w-full max-w-sm rounded-3xl border border-sky-200/40 bg-gradient-to-br from-[#0b3568] to-[#061a36] p-7 text-center text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between"><div className="text-left"><p className="text-sm font-black">Open on mobile</p><p className="mt-1 text-xs text-sky-100/70">Scan to view the full presentation</p></div><button type="button" onClick={() => setShowQr(false)} className="rounded-lg p-1 text-sky-100/70 transition hover:bg-white/10 hover:text-white" aria-label="Close QR code"><X size={20} /></button></div>
        <div className="mx-auto mt-6 w-fit rounded-2xl bg-white p-4 shadow-[0_10px_35px_rgba(0,0,0,.25)]">{shareUrl && <QRCodeSVG value={shareUrl} size={224} level="H" marginSize={2} fgColor="#082d5c" title="AdventureWorks presentation mobile QR code" />}</div>
        <p className="mt-5 text-xs font-medium leading-relaxed text-sky-100/75">QR code opens the presentation&apos;s welcome screen. On Vercel, guests can also install it on their home screen as an app.</p>
        {installPrompt && <button type="button" onClick={installApp} className="mt-5 inline-flex items-center gap-2 rounded-full border border-sky-200/40 bg-sky-400/20 px-4 py-2.5 text-xs font-extrabold text-white transition hover:scale-105 hover:bg-sky-400/30"><Download size={15} /> Install AdventureWorks App</button>}
      </div>
    </div>}
    </>
  )
}
