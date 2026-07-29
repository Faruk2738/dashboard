'use client'

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bike, CalendarDays, Play, UsersRound } from 'lucide-react';

export default function IntroPage() {
  const [ended, setEnded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  // Browsers block unprompted audio. Start muted and explicitly enable sound
  // after a user click so the intro behaves consistently across browsers.
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const showOverlay = () => {
    setEnded(true);
    setTimeout(() => {
      setVisible(true);
    }, 50);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    showOverlay();
  };

  const toggleMute = async () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    video.defaultMuted = nextMuted;
    if (!nextMuted) video.volume = 1;
    setIsMuted(nextMuted);

    try {
      await video.play();
    } catch (error) {
      console.error('Intro video could not resume:', error);
    }
  };

  useEffect(() => {
    if (!hasStarted) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch((error) => {
      console.error('Intro video could not autoplay:', error);
      showOverlay();
    });
  }, [hasStarted]);

  if (!hasStarted) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061a36] px-5 py-10 text-white">
        <div className="mira-welcome-aurora absolute inset-0" />
        <div className="intro-border-light absolute inset-0 z-[5] pointer-events-none" aria-hidden="true" />
        <div className="mira-welcome-orb mira-welcome-orb--one absolute -left-24 top-12 h-72 w-72 rounded-full border border-sky-300/10 bg-sky-400/10 blur-3xl" />
        <div className="mira-welcome-orb mira-welcome-orb--two absolute -bottom-28 -right-20 h-80 w-80 rounded-full border border-blue-300/10 bg-blue-600/20 blur-3xl" />
        <section className="relative z-10 w-full max-w-3xl text-center">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-sky-200/50 bg-white/10 shadow-[0_16px_44px_rgba(14,165,233,.24)] backdrop-blur-sm">
            <Bike size={43} strokeWidth={2.2} className="text-amber-300" />
          </div>
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-sky-200/35 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.14em] text-sky-100 backdrop-blur-sm">
            <span className="rounded-lg bg-white px-2.5 py-1 text-[19px] font-black lowercase leading-none tracking-[-.04em] text-[#151b36] shadow-md">miuul</span>
            <span className="h-4 w-px bg-sky-100/35" />
            <span>Miuul Data Analytics Bootcamp 10. Dönem</span>
          </div>
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/10 px-4 py-2 text-xs font-bold text-amber-100"><CalendarDays size={15} className="text-amber-300" /> 29–31 Temmuz 2026</div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">AdventureWorks<br /><span className="bg-gradient-to-r from-sky-200 via-white to-amber-200 bg-clip-text text-transparent">Final Project</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-blue-100/85 sm:text-lg">Miuul ailesinin değerli üyeleri, final proje sunumumuza hoş geldiniz.</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-blue-200/75">Bu çalışma, <strong className="font-bold text-white">Miuul Data Analytics Bootcamp 10. Dönem</strong> yolculuğunda <strong className="font-bold text-white">Group by Adventure Riders</strong> takımı olarak hazırladığımız veri analitiği final projesidir.</p>
          <div className="mx-auto mt-7 flex items-center justify-center gap-2 text-xs font-semibold text-sky-100/75"><UsersRound size={15} className="text-sky-300" /> Miuul ailesine özel final sunumu</div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => setHasStarted(true)} className="intro-start-button group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-sky-200/50 bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(37,99,235,.35)] transition duration-300 hover:scale-105 hover:from-sky-400 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-sky-300/35">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5"><Play size={15} fill="currentColor" /></span>
              Sunumu Başlat
            </button>
          </div>
          <p className="mt-5 text-[11px] font-medium tracking-wide text-blue-200/55">AdventureWorks Analytics Hub</p>
        </section>
      </main>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      {!ended && (
        <video 
          ref={videoRef}
          src="/assets/intro8.mp4" 
          className="w-full h-full object-contain"
          onEnded={showOverlay}
          onError={showOverlay}
          autoPlay
          playsInline
          controls
          muted={isMuted}
          preload="auto"
          onVolumeChange={(event) => setIsMuted(event.currentTarget.muted || event.currentTarget.volume === 0)}
        />
      )}

      {!ended && (
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <button 
            onClick={toggleMute}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-semibold ${
              isMuted 
                ? 'bg-red-500 text-white border border-red-600 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/50 animate-pulse' 
                : 'text-white/60 bg-transparent border border-white/30 hover:text-white hover:border-white hover:bg-white/10'
            }`}
            title={isMuted ? "Sesi aç" : "Sesi kapat"}
          >
            {isMuted ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                <span className="text-sm">Sesi Aç</span>
              </>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>
          <button 
            onClick={handleSkip}
            className="text-white/60 bg-transparent border border-white/30 px-4 py-2 rounded-full cursor-pointer hover:text-white hover:border-white hover:bg-white/10 transition-all"
          >
            Skip Intro
          </button>
        </div>
      )}

      {ended && (
        <div 
          className={`cover-stage-background absolute inset-0 flex flex-col justify-center items-center z-10 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="cover-stage-aurora absolute inset-0 pointer-events-none" aria-hidden="true" />
          <div className="cover-border-light absolute z-20 pointer-events-none" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/assets/intro-light.png" 
            alt="Dashboard Presentation" 
            className="relative z-10 max-w-[90%] max-h-[70vh] object-contain mb-8 shadow-[0_24px_70px_rgba(2,12,32,.55)] rounded-2xl ring-1 ring-white/70"
          />
          <Link 
            href="/dashboard" 
            className="cover-dashboard-button relative z-10 px-10 py-4 text-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-full shadow-lg hover:scale-105 active:scale-95 hover:shadow-xl transition-all duration-300 decoration-transparent"
          >
            <span className="cover-dashboard-button-text relative z-10">Go to Dashboard</span>
          </Link>
        </div>
      )}
    </div>
  );
}
