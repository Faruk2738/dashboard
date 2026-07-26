'use client';

import { useEffect } from 'react';

export default function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then(() => caches.keys())
        .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
        .then(() => {
          if (navigator.serviceWorker.controller && !sessionStorage.getItem('sw-cleared')) {
            sessionStorage.setItem('sw-cleared', 'true');
            window.location.reload();
          }
        })
        .catch(() => {});
      return undefined;
    }

    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
