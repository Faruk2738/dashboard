'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Gift, Medal, RefreshCw, Sparkles, TimerReset, UsersRound, X } from 'lucide-react';
import AnimatedBikeTitle from '../AnimatedBikeTitle';
import useDashboardFilters from '../useDashboardFilters';

const campaigns = [
  { segment: 'Champions', filter: 'Champions', title: 'AdventureWorks Ambassador', eyebrow: 'Referral campaign', offer: 'Earn $20 credit for every successful referral', detail: 'Your friend receives 10% off their first order', image: '/campaigns/ambassador-champions.jpeg', position: 'center', fit: 'contain', accent: '#16a34a', audience: 1742, Icon: UsersRound },
  { segment: 'At Risk', filter: 'At Risk', title: 'Ride Again', eyebrow: 'Win-back campaign', offer: 'Save 10% on 2 accessories or 15% on 3+', detail: 'Free delivery on qualifying orders', image: '/campaigns/ride-again-at-risk.jpeg', position: 'center', fit: 'contain', accent: '#65a30d', audience: 3238, Icon: RefreshCw },
  { segment: 'Loyal Customers', filter: 'Loyal', title: 'Ride More. Earn More.', eyebrow: 'Tiered loyalty campaign', offer: 'Unlock Bronze, Silver & Gold rewards', detail: 'Earn points, early access and VIP benefits', image: '/campaigns/loyalty-loyal.jpeg', position: '17% 16%', accent: '#d97706', audience: 3259, Icon: Medal },
  { segment: "Can't Lose", filter: 'Lost', title: 'Why You Are Special', eyebrow: 'High-value recovery', offer: 'Personal advice and curated bike bundles', detail: 'Exclusive benefits reserved for you', image: '/campaigns/special-cant-lose.jpeg', position: '82% 14%', accent: '#4d7c0f', audience: 1039, Icon: Sparkles },
  { segment: 'New & Potential Loyalists', filter: 'New', title: 'Thanks for Riding With Us', eyebrow: 'Welcome campaign', offer: '10% off your next accessory purchase', detail: 'Bike care tips and hand-picked essentials', image: '/campaigns/welcome-new.jpeg', position: '16% 15%', accent: '#0284c7', audience: 3286, audienceNote: '772 New + 2,514 Potential Loyalists', Icon: Gift },
  { segment: 'Hibernating', filter: 'Lost', title: 'Last Chance Trade-In', eyebrow: 'Reactivation campaign', offer: 'Trade in old gear and unlock a special price', detail: 'Limited-time offer — while stock lasts', image: '/campaigns/last-chance-hibernating.jpeg', position: 'center', fit: 'contain', accent: '#ca8a04', audience: 3115, Icon: TimerReset },
];

const number = (value) => new Intl.NumberFormat('en-US').format(Math.round(value || 0));

export default function CampaignGalleryClient({ data: initialData }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { filters, toggle, clear, isFiltered } = useDashboardFilters(initialData);
  const total = campaigns.reduce((sum, campaign) => sum + campaign.audience, 0);

  return <div className="min-h-full bg-gradient-to-br from-[#f7fbff] via-[#fffdf8] to-[#f4faf6] p-3 text-slate-800 lg:p-5"><div className="mx-auto max-w-[1120px]">
    <header className="relative overflow-hidden rounded-xl border border-[#0b2853] bg-gradient-to-r from-[#071c3a] via-[#0a2c5a] to-[#071c3a] py-3 text-center shadow-md"><AnimatedBikeTitle variant="home" /><h1 className="mira-title-copy text-[16px] font-black text-white">RFM CAMPAIGN COLLECTION</h1><p className="relative z-10 mt-0.5 text-[8px] font-medium text-amber-100">Six customer segments · Six personalized journeys · {number(total)} customers</p></header>

    <div className="mt-3 flex min-h-9 items-center justify-between rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2 shadow-sm"><p className="text-[9px] font-semibold text-slate-500">Choose a segment card or open its campaign story.</p>{isFiltered ? <div className="flex items-center gap-2 text-[9px] font-bold text-blue-700"><span className="rounded-full bg-blue-50 px-2.5 py-1">Selected: {filters.rfmSegment}</span><button type="button" onClick={clear} className="rounded-full border border-blue-200 bg-white px-2.5 py-1 hover:bg-blue-50">Clear</button></div> : <span className="text-[9px] font-bold text-emerald-600">All audiences ready</span>}</div>

    <div className="mt-3 grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)]">
      <figure className="relative min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_8px_24px_rgba(35,65,95,.1)] lg:min-h-full"><Image src="/assets/image-adventureworks.png" alt="Cyclist wearing an AdventureWorks backpack in the mountains" fill sizes="(max-width:1024px) 100vw, 180px" className="object-cover" style={{ objectPosition: 'right 80%' }} /><div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" /></figure>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {campaigns.map((campaign) => { const { segment, filter, title, image, position, fit, accent } = campaign; const selected = filters.rfmSegment === filter; return <article key={segment} onClick={() => toggle('rfmSegment', filter)} className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white text-left shadow-[0_8px_24px_rgba(35,65,95,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(35,65,95,.14)] ${selected ? 'border-blue-400 ring-2 ring-blue-200' : 'border-slate-200'}`}>
        <div className="relative h-[145px] overflow-hidden bg-[#f7f4ec]"><Image src={image} alt={`${title} campaign for ${segment}`} fill sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 38vw" className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} transition duration-500 group-hover:scale-[1.02]`} style={{ objectPosition: position }} /><div className="absolute inset-0 bg-gradient-to-t from-white/15 via-transparent to-transparent" /><span className="absolute bottom-2.5 left-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur-sm">{segment}</span></div>
        <div className="relative flex min-h-[72px] items-center justify-between gap-3 p-3.5"><span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} /><h2 className="text-[16px] font-black leading-tight tracking-tight text-[#123c78]">{title}</h2><button type="button" onClick={(event) => { event.stopPropagation(); setSelectedCampaign(campaign); }} className="flex shrink-0 items-center gap-1 rounded-full border bg-white px-3 py-2 text-[9px] font-black transition hover:scale-105 hover:bg-slate-50" style={{ borderColor: `${accent}80`, color: accent }}>VIEW <ArrowRight size={11} /></button></div>
      </article>; })}
      </div>
    </div>

    {selectedCampaign && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${selectedCampaign.title} campaign image`} onClick={() => setSelectedCampaign(null)}><div className="flex h-[94vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="relative min-h-0 flex-1 bg-[#f5f2e9]"><Image src={selectedCampaign.image} alt={`${selectedCampaign.title} full campaign artwork`} fill sizes="1200px" className="object-contain" priority /><button type="button" onClick={() => setSelectedCampaign(null)} className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-md hover:bg-white" aria-label="Close campaign image"><X size={20} /></button></div><div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-5 py-3"><div><p className="text-[9px] font-black uppercase tracking-wider" style={{ color: selectedCampaign.accent }}>{selectedCampaign.segment}</p><h2 className="text-[17px] font-black text-[#123c78]">{selectedCampaign.title}</h2></div><button type="button" onClick={() => { toggle('rfmSegment', selectedCampaign.filter); setSelectedCampaign(null); }} className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-white shadow-sm" style={{ background: selectedCampaign.accent }}>SELECT CAMPAIGN <ArrowRight size={14} /></button></div></div></div>}
  </div></div>;
}
