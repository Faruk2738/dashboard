'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard',             icon: '🏠', label: 'Home' },
  { href: '/dashboard/customers',   icon: '👤', label: 'Customer' },
  { href: '/dashboard/rfm',         icon: '🎯', label: 'RFM Segmentation' },
  { href: '/dashboard/sales',       icon: '📊', label: 'Sales Performance' },
  { href: '/dashboard/forecasting', icon: '📈', label: 'Forecast & Insights' },
  { href: '/dashboard/ai-center',   icon: '✨', label: 'Campaign Center' },
];

export default function Sidebar({ latestDate }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-slate-900 flex flex-col shrink-0 text-white">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            {/* Mountain icon */}
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M3 20L9 8l3 5 3-7 6 14H3z" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight leading-tight">AdventureWorks</p>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Analytics Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ href, icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base shrink-0">{icon}</span>
              <span className="leading-tight">{label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700/60">
        <p className="text-[10px] text-slate-500 font-semibold">Data as of:</p>
        <p className="text-xs text-slate-300 font-bold mt-0.5">{latestDate || '31 May 2024'}</p>
      </div>
    </aside>
  );
}
