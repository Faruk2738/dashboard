'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Gift, Medal, RefreshCw, Sparkles, TimerReset, UsersRound, X } from 'lucide-react';
import AnimatedBikeTitle from '../AnimatedBikeTitle';
import useDashboardFilters from '../useDashboardFilters';

const campaigns = [
  {
    segment: 'At Risk', filter: 'At Risk', title: 'Ride Again', eyebrow: 'Win-back campaign',
    offer: 'Save 10% on 2 accessories or 15% on 3+', detail: 'Free delivery on qualifying orders',
    image: '/campaigns/ride-again-at-risk-en.png', position: '70% 42%', accent: '#84cc16', audience: 3238, Icon: RefreshCw,
  },
  {
    segment: 'Loyal Customers', filter: 'Loyal', title: 'Ride More. Earn More.', eyebrow: 'Tiered loyalty campaign',
    offer: 'Unlock Bronze, Silver & Gold rewards', detail: 'Earn points, early access and VIP benefits',
    image: '/campaigns/loyalty-loyal-en.png', position: '22% 45%', accent: '#f59e0b', audience: 3259, Icon: Medal,
  },
  {
    segment: "Can't Lose", filter: 'Lost', title: 'Why You Are Special', eyebrow: 'High-value recovery',
    offer: 'Personal advice and curated bike bundles', detail: 'Exclusive benefits reserved for you',
    image: '/campaigns/special-cant-lose-en.png', position: '58% 45%', accent: '#a3e635', audience: 1039, Icon: Sparkles,
  },
  {
    segment: 'Champions', filter: 'Champions', title: 'AdventureWorks Ambassador', eyebrow: 'Referral campaign',
    offer: 'Earn $20 credit for every successful referral', detail: 'Your friend receives 10% off their first order',
    image: '/campaigns/ambassador-champions-en.png', position: '70% 38%', accent: '#22c55e', audience: 1742, Icon: UsersRound,
  },
  {
    segment: 'New & Potential Loyalists', filter: 'New', title: 'Thanks for Riding With Us', eyebrow: 'Welcome campaign',
    offer: '10% off your next accessory purchase', detail: 'Bike care tips and hand-picked essentials',
    image: '/campaigns/welcome-new-en.png', position: '50% 38%', accent: '#38bdf8', audience: 3286, audienceNote: '772 New + 2,514 Potential Loyalists', Icon: Gift,
  },
  {
    segment: 'Hibernating', filter: 'Lost', title: 'Last Chance Trade-In', eyebrow: 'Reactivation campaign',
    offer: 'Trade in old gear and unlock a special price', detail: 'Limited-time offer — while stock lasts',
    image: '/campaigns/last-chance-hibernating-en.png', position: '66% 40%', accent: '#facc15', audience: 3115, Icon: TimerReset,
  },
];

const number = (value) => new Intl.NumberFormat('en-US').format(Math.round(value || 0));

export default function CampaignOneClient({ data: initialData }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { filters, toggle, clear, isFiltered } = useDashboardFilters(initialData);
  const total = campaigns.reduce((sum, campaign) => sum + campaign.audience, 0);
  const displayCampaigns = [campaigns[3], campaigns[0], campaigns[1], campaigns[2], campaigns[4], campaigns[5]];

  return <div className="min-h-full bg-gradient-to-br from-[#f8fbff] via-[#fffdf8] to-[#f5fbf7] p-3 text-slate-800 lg:p-5"><div className="mx-auto max-w-[1120px]">
    <header className="relative overflow-hidden rounded-xl border border-[#0b2853] bg-gradient-to-r from-[#071c3a] via-[#0a2c5a] to-[#071c3a] py-3 text-center shadow-md"><AnimatedBikeTitle variant="home" /><h1 className="mira-title-copy text-[16px] font-black text-white">RFM CAMPAIGN COLLECTION</h1><p className="relative z-10 mt-0.5 text-[8px] font-semibold uppercase tracking-[.18em] text-amber-200">Six segments · Six personalized journeys</p></header>

    <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"><div className="flex items-center gap-4"><div><p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Active Campaigns</p><p className="text-[16px] font-black text-[#123c78]">6</p></div><div className="h-7 w-px bg-slate-200" /><div><p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Reachable Audience</p><p className="text-[16px] font-black text-emerald-600">{number(total)}</p></div></div>{isFiltered ? <div className="flex items-center gap-2 text-[9px] font-bold text-blue-700"><span className="rounded-full bg-blue-50 px-2.5 py-1">Selected: {filters.rfmSegment}</span><button type="button" onClick={clear} className="rounded-full border border-blue-200 px-2.5 py-1 hover:bg-blue-50">Clear</button></div> : <p className="text-[9px] font-semibold text-slate-400">Select a campaign to focus its audience</p>}</div>

    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[210px]">
      {displayCampaigns.map((campaign) => {
        const { segment, filter, title, eyebrow, offer, detail, image, position, accent, audience, Icon } = campaign;
        const selected = filters.rfmSegment === filter;
        const featured = segment === 'Champions';
        return <article key={segment} onClick={() => toggle('rfmSegment', filter)} className={`group relative min-h-[250px] cursor-pointer overflow-hidden rounded-2xl border text-left text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl lg:min-h-0 ${cardLayout[segment]} ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : 'border-slate-300'}`}>
          <Image src={image} alt={`${title} campaign for ${segment}`} fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: position }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020b18] via-[#04152de6] via-45% to-[#061d3b26]" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4"><span className="rounded-full border border-white/25 bg-[#061d3b]/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">{segment}</span><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 bg-black/35 backdrop-blur-sm" style={{ color: accent }}><Icon size={17} /></span></div>
          <div className={`absolute inset-x-2 bottom-2 rounded-xl border border-white/10 bg-[#031326]/90 shadow-[0_12px_32px_rgba(0,0,0,.45)] backdrop-blur-[4px] ${featured ? 'p-5' : 'p-3.5'}`}><p className="text-[9px] font-black uppercase tracking-[.16em]" style={{ color: accent }}>{eyebrow}</p><h2 className={`mt-1 font-black leading-[1.08] tracking-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,.9)] ${featured ? 'text-[30px]' : 'text-[19px]'}`}>{title}</h2><p className={`mt-2 font-bold leading-snug text-white ${featured ? 'text-[14px]' : 'text-[11px]'}`}>{offer}</p><div className="mt-3 flex items-end justify-between gap-3"><div>{featured && <p className="text-[11px] font-medium leading-snug text-slate-200">{detail}</p>}<p className={`${featured ? 'mt-1.5' : ''} text-[9px] font-bold text-white/65`}>Audience: {number(audience)}</p></div><button type="button" onClick={(event) => { event.stopPropagation(); setSelectedCampaign(campaign); }} className="flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-[9px] font-black text-[#061d3b] shadow-md transition hover:scale-105" style={{ background: accent }}>VIEW <ArrowRight size={11} /></button></div></div>
        </article>;
      })}
    </div>
    {selectedCampaign && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020b18]/80 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${selectedCampaign.title} campaign details`} onClick={() => setSelectedCampaign(null)}><div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-[#071c3a] text-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="relative h-52"><Image src={selectedCampaign.image} alt="" fill unoptimized sizes="512px" className="object-cover" style={{ objectPosition: selectedCampaign.position }} /><div className="absolute inset-0 bg-gradient-to-t from-[#071c3a] via-[#071c3a]/45 to-transparent" /><button type="button" onClick={() => setSelectedCampaign(null)} className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/60" aria-label="Close campaign details"><X size={18} /></button><span className="absolute bottom-4 left-5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">{selectedCampaign.segment}</span></div><div className="p-6"><p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: selectedCampaign.accent }}>{selectedCampaign.eyebrow}</p><h2 className="mt-1 text-3xl font-black">{selectedCampaign.title}</h2><p className="mt-4 text-base font-bold text-white">{selectedCampaign.offer}</p><p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedCampaign.detail}. This campaign is designed for {selectedCampaign.segment.toLowerCase()} customers with a reachable audience of {number(selectedCampaign.audience)}.</p>{selectedCampaign.audienceNote && <p className="mt-2 rounded-lg bg-sky-400/10 px-3 py-2 text-xs font-bold text-sky-200">Audience split: {selectedCampaign.audienceNote}</p>}<div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white/5 p-3"><p className="text-[8px] font-bold uppercase text-slate-400">Audience</p><p className="mt-1 text-lg font-black">{number(selectedCampaign.audience)}</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-[8px] font-bold uppercase text-slate-400">Channel</p><p className="mt-1 text-sm font-black">Email + App</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-[8px] font-bold uppercase text-slate-400">Status</p><p className="mt-1 text-sm font-black text-emerald-400">Ready</p></div></div><button type="button" onClick={() => { toggle('rfmSegment', selectedCampaign.filter); setSelectedCampaign(null); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-[#061d3b]" style={{ background: selectedCampaign.accent }}>SELECT CAMPAIGN <ArrowRight size={16} /></button></div></div></div>}
  </div></div>;
}
