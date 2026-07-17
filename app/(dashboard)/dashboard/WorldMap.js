'use client'

import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const markers = [
  { name: "United States", coordinates: [-95, 40], revenue: 8200000, color: "#38bdf8" },
  { name: "Canada", coordinates: [-106, 56], revenue: 1800000, color: "#22c55e" },
  { name: "Australia", coordinates: [134, -25], revenue: 3100000, color: "#f59e0b" },
  { name: "United Kingdom", coordinates: [-2, 54], revenue: 2900000, color: "#a855f7" },
  { name: "France", coordinates: [2, 46], revenue: 1600000, color: "#ec4899" },
  { name: "Germany", coordinates: [10, 51], revenue: 1500000, color: "#3b82f6" },
];

const formatFull = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function WorldMap() {
  return (
    <div className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-2">
      {/* Dynamic ambient grid overlay background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-35"></div>
      
      {/* Decorative header controls */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Live Market Coverage</span>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [10, 20] }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1e293b"
                stroke="#0f172a"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none', transition: 'all 200ms' },
                  hover: { fill: '#334155', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        {markers.map(({ name, coordinates, revenue, color }) => {
          const radius = Math.sqrt(revenue / 1000000) * 3 + 3;
          return (
            <Marker key={name} coordinates={coordinates}>
              {/* Outer pulsing ring */}
              <circle
                r={radius + 8}
                fill={color}
                fillOpacity={0.15}
                className="animate-ping"
                style={{ transformOrigin: 'center', animationDuration: '3s' }}
              />
              {/* Second soft glowing circle */}
              <circle
                r={radius + 4}
                fill={color}
                fillOpacity={0.25}
              />
              {/* Core solid circle */}
              <circle
                r={radius}
                fill={color}
                stroke="#ffffff"
                strokeWidth={1.5}
                className="cursor-pointer hover:scale-125 transition-transform"
              />
              <title>{`${name}: ${formatFull(revenue)}`}</title>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
