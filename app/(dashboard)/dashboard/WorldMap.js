'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const markers = [
  { name: 'Canada', territory: 'Canada', coordinates: [-106, 57], revenue: '$1.98M', size: 12, color: '#0d9f62' },
  { name: 'US Northwest', territory: 'Northwest', coordinates: [-121, 45], revenue: '$3.65M', size: 12, color: '#1669d5', growth: '+9.1%', status: 'Strong regional demand' },
  { name: 'US Southwest', territory: 'Southwest', coordinates: [-112, 34], revenue: '$5.72M', size: 14, color: '#0754c8', growth: '+12.4%', status: 'Top revenue market' },
  { name: 'US Central', territory: 'Central', coordinates: [-97, 38], revenue: '$3K', size: 11, color: '#2563c9', growth: '+2.1%', status: 'Live regional market' },
  { name: 'US Northeast', territory: 'Northeast', coordinates: [-74, 42], revenue: '$7K', size: 11, color: '#3177d8', growth: '+3.4%', status: 'Live regional market' },
  { name: 'US Southeast', territory: 'Southeast', coordinates: [-83, 33], revenue: '$12K', size: 11, color: '#3b82e8', growth: '+4.0%', status: 'Live regional market' },
  { name: 'United Kingdom', territory: 'United Kingdom', coordinates: [-2, 54], revenue: '$3.39M', size: 13, color: '#7b3fc7' },
  { name: 'Germany', territory: 'Germany', coordinates: [10, 51], revenue: '$2.89M', size: 13, color: '#e69a08' },
  { name: 'France', territory: 'France', coordinates: [2, 46], revenue: '$2.64M', size: 12, color: '#b246b9' },
  { name: 'Australia', territory: 'Australia', coordinates: [134, -25], revenue: '$9.06M', size: 16, color: '#e04e4e' },
];

const marketByCountry = {
  'United States of America': { ...markers[2], growth: '+12.4%', status: 'Top revenue market' },
  Canada: { ...markers[0], growth: '+7.1%', status: 'Growing market' },
  'United Kingdom': { ...markers[6], growth: '+8.9%', status: 'Strong repeat demand' },
  Germany: { ...markers[7], growth: '+5.6%', status: 'High value customers' },
  France: { ...markers[8], growth: '+4.2%', status: 'Stable market' },
  Australia: { ...markers[9], growth: '+14.8%', status: 'Highest growth market' },
};

// Exact pixel coordinates produced by the geoMercator projection used below
// (scale 123, center [8, 22], viewBox 800 × 600). They create reliable hit
// areas without moving the visible bubbles away from their map locations.
const markerHitAreas = [
  [155.27, 198.78], [123.07, 240.02], [142.39, 270.74], [174.59, 260.12], [223.97, 248.91], [204.65, 273.31], [378.53, 210.16], [404.29, 220.74], [387.12, 236.96], [670.49, 403.89],
];

export default function WorldMap({ onMarketSelect, territories = [] }) {
  const [selected, setSelected] = useState(null);
  const [mapScale, setMapScale] = useState(160);
  const salesByTerritory = Object.fromEntries(territories.map((item) => [item.territory, item.revenue]));
  const withLiveRevenue = (market) => {
    const revenue = salesByTerritory[market.territory];
    if (revenue === undefined) return { ...market, revenue: '$0' };
    return { ...market, revenue: revenue >= 1000000 ? `$${(revenue / 1e6).toFixed(2)}M` : `$${Math.round(revenue / 1000)}K` };
  };
  const activeSelected = selected ? withLiveRevenue(selected) : null;
  const selectMarker = (event, marker) => {
    event.stopPropagation();
    selectMarket(marker);
  };
  const selectMarket = (marker) => {
    const detail = Object.values(marketByCountry).find((market) => market.name === marker.name);
    const activeMarket = withLiveRevenue(detail || marker);
    const isSameMarket = selected?.territory === activeMarket.territory;
    setSelected(isSameMarket ? null : activeMarket);
    onMarketSelect?.(activeMarket.territory || activeMarket.name);
  };

  return <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_50%_15%,#f8fcff,transparent_36%),linear-gradient(135deg,#e9f5ff,#bdd8f5)]">
    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(#7aa4d3_1px,transparent_1px),linear-gradient(90deg,#7aa4d3_1px,transparent_1px)] [background-size:22px_22px]" />
    <div className="absolute left-3 top-2 z-10 flex items-center gap-1.5 rounded-full border border-white/30 bg-[#082b5d]/90 px-3 py-1.5 text-[8px] font-bold tracking-wide text-white shadow-lg"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />GLOBAL SALES COVERAGE</div>
    <div className="absolute right-3 top-2 z-10 flex flex-col overflow-hidden rounded border border-slate-300 bg-white/95 text-[13px] shadow-md"><button type="button" aria-label="Zoom in" onClick={() => setMapScale((scale) => Math.min(scale + 20, 243))} className="flex h-6 w-6 items-center justify-center border-b border-slate-200 font-black text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300" disabled={mapScale >= 243}>+</button><button type="button" aria-label="Zoom out" onClick={() => setMapScale((scale) => Math.max(scale - 20, 103))} className="flex h-6 w-6 items-center justify-center font-black text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300" disabled={mapScale <= 103}>−</button></div>
    <ComposableMap projection="geoMercator" projectionConfig={{ scale: mapScale, center: [8, 22] }} style={{ width: '100%', height: '100%' }}>
      <Geographies geography={geoUrl}>{({ geographies }) => geographies.map((geo) => {
        const countryName = geo.properties.name;
        const market = marketByCountry[countryName];
        return <Geography key={geo.rsmKey} geography={geo} onClick={(event) => selectMarker(event, market || { name: countryName, revenue: 'No recorded sales', color: '#64748b', growth: '—', status: 'No active sales data for this region' })} fill={market ? '#a9cff5' : '#c7def6'} stroke="#6d9dce" strokeWidth={0.7} style={{ default: { outline: 'none', cursor: 'pointer' }, hover: { fill: market ? '#81b8ee' : '#9fc5ed', outline: 'none', cursor: 'pointer' }, pressed: { outline: 'none' } }} />;
      })}</Geographies>
      {markers.map((marker) => {
        const isSelected = marker.name === selected?.name;
        return <Marker key={marker.name} coordinates={marker.coordinates}><g role="button" tabIndex="0" aria-label={`Show sales details for ${marker.name}`} onClick={(event) => selectMarker(event, marker)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') selectMarker(event, marker); }} style={{ cursor: 'pointer', pointerEvents: 'all' }}><circle r={marker.size + 20} fill="transparent" pointerEvents="all" /><circle r={marker.size + (isSelected ? 20 : 17)} fill={marker.color} fillOpacity={isSelected ? '.22' : '.14'} className="animate-pulse" /><circle r={marker.size + 8} fill={marker.color} fillOpacity=".26" /><circle r={marker.size + 1} fill={marker.color} stroke="white" strokeWidth={isSelected ? 3.2 : 2.5} style={{ filter: 'drop-shadow(0 2px 2px rgba(7, 42, 90, .38))' }} /><circle r={marker.size / 2.8} fill="white" /><rect x={marker.size + 9} y={-14} width={marker.name.length * 7.5 + 29} height="29" rx="5" fill="white" fillOpacity={isSelected ? '.99' : '.93'} stroke={marker.color} strokeWidth={isSelected ? 1.4 : 1} strokeOpacity=".88" /><text x={marker.size + 15} y={-3} fontSize="12" fontWeight="800" fill="#143c70">{marker.name}</text><text x={marker.size + 15} y={8} fontSize="10" fontWeight="700" fill="#5e7798">{marker.revenue}</text><title>{`Click ${marker.name} to view sales details`}</title></g></Marker>;
      })}
    </ComposableMap>
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 z-[5] h-full w-full">
      {markers.map((marker, index) => {
        const zoomFactor = mapScale / 123;
        const [baseX, baseY] = markerHitAreas[index];
        const x = 400 + (baseX - 400) * zoomFactor;
        const y = 300 + (baseY - 300) * zoomFactor;
        return <circle key={`hit-${marker.name}`} cx={x} cy={y} r={marker.size + 7} fill="transparent" pointerEvents="all" className="cursor-pointer" onClick={() => selectMarket(marker)}><title>{`Click ${marker.name} to filter the dashboard`}</title></circle>;
      })}
    </svg>
    {activeSelected && <div className="pointer-events-none absolute bottom-2 left-3 z-10 min-w-[122px] rounded-md border border-white/70 bg-white/95 px-2.5 py-1.5 shadow-md"><p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">Selected location</p><p className="text-[10px] font-black" style={{ color: activeSelected.color }}>{activeSelected.name}</p><div className="mt-1 flex items-center justify-between gap-3 text-[7px]"><span className="font-bold text-[#174b8b]">{activeSelected.revenue}</span><span className="font-bold text-emerald-600">{activeSelected.growth}</span></div><p className="mt-0.5 text-[6px] text-slate-500">{activeSelected.status}</p></div>}
    <div className="absolute bottom-2 right-3 z-10"><div className="rounded-md border border-white/70 bg-white/90 px-2 py-1 shadow-sm"><p className="text-[6px] font-bold uppercase text-slate-400">Coverage</p><p className="text-[9px] font-black text-emerald-600">10 regions live</p></div></div>
  </div>;
}
