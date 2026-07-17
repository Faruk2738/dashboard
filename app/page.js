'use client'

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function IntroPage() {
  const [ended, setEnded] = useState(false);
  const [visible, setVisible] = useState(false);
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Autoplay blocked. Retrying with mute...");
        video.muted = true;
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
        />
      )}

      {!ended && (
        <button 
          onClick={handleSkip}
          className="absolute bottom-6 right-6 text-white/60 bg-transparent border border-white/30 px-4 py-2 rounded-full cursor-pointer hover:text-white hover:border-white hover:bg-white/10 transition-all z-20"
        >
          Skip Intro
        </button>
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
