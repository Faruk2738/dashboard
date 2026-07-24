import { Bike } from 'lucide-react';

export default function AnimatedBikeTitle({ variant = 'compact' }) {
  return <span className={`mira-bike-track${variant === 'home' ? ' mira-bike-title--home' : ''}`} aria-hidden="true">
    <span className="mira-bike-route" />
    <span className="mira-bike-rider"><Bike size={19} strokeWidth={2.3} /></span>
  </span>;
}
