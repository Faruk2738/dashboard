'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Bike, Heart, PartyPopper, Sparkles, UsersRound } from 'lucide-react';

const FINALE_CONFETTI = Array.from({ length: 230 }, (_, index) => ({
  left: (index * 41) % 101, delay: (index % 20) * 0.065, duration: 3.5 + (index % 10) * 0.18,
  drift: `${((index * 31) % 210) - 105}px`, midDrift: `${((index * 49) % 150) - 75}px`, rotation: `${(index * 47) % 360}deg`,
  shape: ['square', 'circle', 'ribbon'][index % 3], size: 7 + (index % 5) * 2,
  color: ['#fbbf24', '#38bdf8', '#a78bfa', '#fb7185', '#34d399', '#f97316'][index % 6],
}));

const FINALE_BALLOONS = [
  { left: '4%', top: '18%', color: '#38bdf8', delay: '0s', duration: '6.4s', scale: .78 }, { left: '9%', top: '58%', color: '#a78bfa', delay: '-2.2s', duration: '7.2s', scale: .62 },
  { left: '16%', top: '11%', color: '#fbbf24', delay: '-3.1s', duration: '6.8s', scale: .52 }, { left: '83%', top: '13%', color: '#fb7185', delay: '-1.3s', duration: '6.6s', scale: .62 },
  { left: '91%', top: '30%', color: '#34d399', delay: '-3.8s', duration: '7.4s', scale: .78 }, { left: '85%', top: '66%', color: '#f97316', delay: '-.8s', duration: '6.1s', scale: .56 },
];

export default function ThankYouPage() {
  const [celebrating, setCelebrating] = useState(true);
  const replayCelebration = () => { setCelebrating(false); window.requestAnimationFrame(() => setCelebrating(true)); window.setTimeout(() => setCelebrating(false), 6200); };
  useEffect(() => { const timer = window.setTimeout(() => setCelebrating(false), 6200); return () => window.clearTimeout(timer); }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061a36] px-5 py-9 text-white sm:px-8 sm:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(251,191,36,.2),transparent_25%),radial-gradient(circle_at_10%_88%,rgba(56,189,248,.22),transparent_28%),radial-gradient(circle_at_92%_82%,rgba(167,139,250,.22),transparent_30%),linear-gradient(135deg,#04132a_0%,#092f60_50%,#061a36_100%)]" />
      <div className="absolute left-[8%] top-16 h-44 w-44 rounded-full border border-sky-200/10 bg-sky-300/10 blur-3xl" />
      <div className="absolute bottom-0 right-[6%] h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">{FINALE_BALLOONS.map((balloon, index) => <span key={index} className="mira-finale-balloon" style={{ left: balloon.left, top: balloon.top, '--mira-balloon-color': balloon.color, '--mira-balloon-delay': balloon.delay, '--mira-balloon-duration': balloon.duration, '--mira-balloon-scale': balloon.scale }} />)}</div>
      {celebrating && <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true"><span className="mira-champion-glow" /><span className="mira-celebration-flare mira-celebration-flare--left" /><span className="mira-celebration-flare mira-celebration-flare--right" /><span className="mira-celebration-flare mira-celebration-flare--top" /><span className="mira-confetti-cannon mira-confetti-cannon--left"><PartyPopper size={42} /></span><span className="mira-confetti-cannon mira-confetti-cannon--right"><PartyPopper size={42} /></span>{FINALE_CONFETTI.map((piece, index) => <span key={index} className={`mira-confetti mira-confetti--${piece.shape}`} style={{ left: `${piece.left}%`, width: `${piece.size}px`, height: `${piece.shape === 'circle' ? piece.size : piece.size + (piece.shape === 'ribbon' ? 10 : 3)}px`, backgroundColor: piece.color, animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s`, '--mira-confetti-drift': piece.drift, '--mira-confetti-mid-drift': piece.midDrift, '--mira-confetti-rotation': piece.rotation }} />)}</div>}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl flex-col items-center justify-center text-center">
        <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-sky-200/30 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.14em] text-sky-100 backdrop-blur-sm">
          <span className="rounded-lg bg-white px-2.5 py-1 text-[19px] font-black lowercase leading-none tracking-[-.04em] text-[#151b36] shadow-md">miuul</span><span className="h-4 w-px bg-sky-100/35" />Miuul Data Analytics Bootcamp 10. Dönem
        </div>
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/45 bg-amber-300/10 shadow-[0_14px_36px_rgba(251,191,36,.22)]"><Award size={34} className="text-amber-300" /></div>
        <p className="text-xs font-bold uppercase tracking-[.24em] text-sky-200">AdventureWorks Final Project</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">Teşekkürler<span className="text-amber-300">!</span></h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg font-medium leading-relaxed text-blue-100/90 sm:text-xl">Sunumumuzu dinlediğiniz ve bu özel anı bizimle paylaştığınız için çok teşekkür ederiz.</p>

        <div className="mt-9 grid w-full max-w-5xl gap-4 text-left md:grid-cols-3">
          <article className="rounded-3xl border border-sky-100/20 bg-white/[.09] p-6 shadow-[0_18px_42px_rgba(2,12,35,.22)] backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sky-200"><Sparkles size={20} /></span>
            <h2 className="mt-4 text-lg font-extrabold text-white">Rehberliğiniz için</h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-100/80">Bootcamp yolculuğumuzda başta <strong className="text-white">Atilla Yardımcı</strong> hocamıza ve mentorumuz <strong className="text-white">Doğukan Erdoğan</strong>&apos;a destekleri ve yol göstericilikleri için içtenlikle teşekkür ederiz.</p>
          </article>
          <article className="rounded-3xl border border-amber-100/20 bg-white/[.09] p-6 shadow-[0_18px_42px_rgba(2,12,35,.22)] backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300/15 text-amber-200"><UsersRound size={20} /></span>
            <h2 className="mt-4 text-lg font-extrabold text-white">Emeğiniz için</h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-100/80">Eğlenceli, eğitici ve öğretici harika dersleri için <strong className="text-white">Halil, Fatmanur ve İbrahim</strong> hocalarımıza; tüm mentor hocalarımıza ve TA hocalarımıza emekleri ve özverileri için çok çok teşekkür ederiz.</p>
          </article>
          <article className="rounded-3xl border border-rose-100/20 bg-white/[.09] p-6 shadow-[0_18px_42px_rgba(2,12,35,.22)] backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-300/15 text-rose-200"><Heart size={20} fill="currentColor" /></span>
            <h2 className="mt-4 text-lg font-extrabold text-white">Aile hissi için</h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-100/80">Bizlere bir aile hissi yaşatan; pozitif enerjisi, güler yüzü ve motivasyonuyla yanımızda olan <strong className="text-white">Oya</strong> hocamıza da teşekkür etmeyi bir borç biliyoruz.</p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3"><button type="button" onClick={replayCelebration} className="inline-flex items-center gap-2 rounded-full border border-amber-200/45 bg-amber-300/10 px-5 py-3 text-sm font-bold text-amber-100 transition hover:scale-105 hover:bg-amber-300/20"><PartyPopper size={17} className="text-amber-300" /> Kutlamayı Yeniden Başlat</button><Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-sky-200/35 bg-white/10 px-5 py-3 text-sm font-bold text-sky-100 transition hover:scale-105 hover:bg-white/15"><Bike size={17} className="text-sky-300" /> Dashboard&apos;a Dön</Link></div>
        <p className="mt-6 text-xs font-semibold tracking-wide text-blue-200/60">Group by Adventure Riders</p>
      </section>
    </main>
  );
}
