'use client'

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function IntroPage() {
  const [ended, setEnded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Önce sesli olarak çalmayı dene
    video.muted = false;
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Autoplay blocked, mute et ve tekrar dene
        console.log("Autoplay blocked. Retrying with mute...");
        video.muted = true;
        setIsMuted(true);
        video.play().catch(e => {
          console.error("Play failed even with mute. Showing overlay.", e);
          showOverlay();
        });
      });
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      {!ended && (
        <video 
          ref={videoRef}
          src="/assets/intro8.mp4" 
          className="w-full h-full object-contain"
          onEnded={showOverlay}
          autoPlay
          playsInline
          controls
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
            title={isMuted ? "Click to unmute audio" : "Mute"}
          >
            {isMuted ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                <span className="text-sm">🔇 Unmute</span>
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
          className={`absolute inset-0 bg-white flex flex-col justify-center items-center z-10 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/assets/intro-light.png" 
            alt="Dashboard Presentation" 
            className="max-w-[90%] max-h-[70vh] object-contain mb-8 shadow-xl rounded-2xl"
          />
          <Link 
            href="/dashboard" 
            className="px-10 py-4 text-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-full shadow-lg hover:scale-105 active:scale-95 hover:shadow-xl transition-all duration-300 decoration-transparent"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
