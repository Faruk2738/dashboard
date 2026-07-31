'use client';

import { useState } from 'react';

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import dynamic from 'next/dynamic';
import { ArrowDownRight, ArrowUpRight, Award, Clock3, DollarSign, Percent, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import AnimatedBikeTitle from './AnimatedBikeTitle';

const WorldMap = dynamic(() => import('./WorldMap'), { ssr: false, loading: () => <div className="h-full bg-[#dcecff]" /> });
const colors = ['#0754c8', '#169344', '#f0ac0a', '#e95b4e'];
const money = (value) => value >= 1e6 ? `$${(value / 1e6).toFixed(2)}M` : `$${Math.round((value || 0) / 1e3)}K`;
const number = (value) => new Intl.NumberFormat('en-US').format(Math.round(value || 0));

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] shadow-lg"><b>{label}</b>{payload.map((item) => <p key={item.dataKey} style={{ color: item.color || item.fill }}>{item.name}: {money(item.value)}</p>)}</div>;
}

function ActualTrendLabel({ x, y, value, index }) {
  if (value == null || index % 6 !== 0) return null;
  return <text x={x} y={y - 7} fill="#d97706" stroke="#fff" strokeWidth="2.4" paintOrder="stroke" strokeLinejoin="round" fontSize="8.5" fontWeight="900" textAnchor="middle">{money(value)}</text>;
}

function ForecastTrendLabel({ x, y, value, index, totalPoints }) {
  if (value == null || index !== totalPoints - 1) return null;
  return <text x={x} y={y - 7} fill="#e11d48" stroke="#fff" strokeWidth="2.4" paintOrder="stroke" strokeLinejoin="round" fontSize="8.5" fontWeight="900" textAnchor="middle">{money(value)}</text>;
}

function CategoryValueLabel({ cx, cy, midAngle, outerRadius, value, payload, index }) {
  const edgeRadius = outerRadius + 2;
  const bendRadius = outerRadius + 11;
  const radians = -midAngle * (Math.PI / 180);
  const direction = Math.cos(radians) >= 0 ? 1 : -1;
  const edgeX = cx + edgeRadius * Math.cos(radians);
  const edgeY = cy + edgeRadius * Math.sin(radians);
  const bendX = cx + bendRadius * Math.cos(radians);
  const bendY = cy + bendRadius * Math.sin(radians);
  const categoryOffset = payload?.name === 'Clothing' ? -9 : payload?.name === 'Accessories' ? 9 : 0;
  const labelY = bendY + categoryOffset;
  const cornerX = bendX + direction * 8;
  const labelX = cornerX + direction * 13;
  const lineEndX = labelX - direction * 3;
  const connectorPath = `M ${edgeX} ${edgeY} L ${bendX} ${bendY} L ${cornerX} ${labelY} L ${lineEndX} ${labelY}`;
  const connectorColor = colors[index % colors.length];

  return <g>
    <path d={connectorPath} fill="none" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round" />
    <path d={connectorPath} fill="none" stroke={connectorColor} strokeWidth="1.5" strokeLinejoin="round" />
    <rect x={edgeX - 1.8} y={edgeY - 1.8} width="3.6" height="3.6" rx=".7" fill="#fff" stroke={connectorColor} strokeWidth="1" />
    <text x={labelX} y={labelY} fill="#174f9f" fontSize="10" fontWeight="800" textAnchor={direction > 0 ? 'start' : 'end'} dominantBaseline="central">{money(value)}</text>
  </g>;
}

function KpiCard({ label, value, change, Icon, color, down = false }) {
  return <div className={`bg-gradient-to-br ${color} min-h-[92px] border rounded-xl p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md`}>
    <div className="flex items-start justify-between gap-1"><span className="text-[8px] font-bold uppercase leading-tight tracking-wide text-slate-500">{label}</span><span className="rounded-md bg-white/70 p-1 shadow-sm"><Icon size={12} className="opacity-80" /></span></div>
    <p className="mt-2 text-[17px] font-black leading-none tracking-tight text-slate-900">{value}</p>
    <div className="mt-1.5 flex items-center gap-1"><span className={`flex items-center rounded bg-white/80 px-1 py-0.5 text-[8px] font-bold ${down ? 'text-rose-600' : 'text-emerald-600'}`}>{down ? <ArrowDownRight size={8} /> : <ArrowUpRight size={8} />}{change}</span><span className="text-[7px] font-semibold uppercase text-slate-500">vs May 23</span></div>
  </div>;
}

function Panel({ title, children, className = '' }) {
  return <section className={`overflow-hidden rounded-sm border border-slate-300 bg-white ${className}`}><div className="border-b border-slate-200 px-3 py-2 text-[13px] font-black tracking-tight text-[#123c78]">{title}</div>{children}</section>;
}

export default function OverviewClient({ data: initialData }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const toggleCategory = (category) => setSelectedCategory((current) => current === category ? null : category);
  const toggleTerritory = (territory) => setSelectedTerritory((current) => current === territory ? null : territory);
  const toggleProduct = (product) => setSelectedProduct((current) => current === product ? null : product);
  const clearFilters = () => { setSelectedCategory(null); setSelectedTerritory(null); setSelectedProduct(null); };
  const sliceKey = [
    selectedCategory && `category:${selectedCategory}`,
    selectedTerritory && `territory:${selectedTerritory}`,
    selectedProduct && `product:${selectedProduct}`,
  ].filter(Boolean).join('|') || 'all';
  const slice = initialData.interactiveSlices?.[sliceKey];
  const data = { ...initialData, ...(slice || {}) };
  const monthly = data.monthlySales || [];
  const filteredForecast = selectedCategory || selectedTerritory || selectedProduct
    ? (() => {
      const recent = monthly.slice(-3);
      const revenue = recent.length ? recent.reduce((total, row) => total + row.revenue, 0) / recent.length : 0;
      const start = new Date(`${monthly.at(-1)?.month || '2024-01'}-01T00:00:00Z`);
      return [1, 2, 3].map((offset) => {
        const date = new Date(start);
        date.setUTCMonth(date.getUTCMonth() + offset);
        return { month: date.toISOString().slice(0, 7), revenue };
      });
    })()
    : (data.forecast || []);
  const forecast = filteredForecast;
  const trend = [
    ...monthly.map((row) => ({ month: row.month.slice(2).replace('-', '/'), actual: row.revenue, forecast: null })),
    ...forecast.map((row) => ({ month: row.month.slice(2).replace('-', '/'), actual: null, forecast: row.revenue })),
  ];
  const categories = (data.categorySales || []).map((row) => ({ name: row.category, value: row.revenue }));
  const products = data.topProducts || [];
  const nextForecast = forecast[0]?.revenue || 2710000;
  const kpis = [
    { label: 'Total Sales', value: money(data.totalRevenue), change: '12.4%', Icon: DollarSign, color: 'from-blue-500/10 to-indigo-500/10 border-blue-100 text-blue-700' },
    { label: 'Gross Profit', value: money(data.totalProfit), change: '8.7%', Icon: TrendingUp, color: 'from-emerald-500/10 to-teal-500/10 border-emerald-100 text-emerald-700' },
    { label: 'Total Customers', value: number(data.uniqueCustomers), change: '6.1%', Icon: Users, color: 'from-purple-500/10 to-fuchsia-500/10 border-purple-100 text-purple-700' },
    { label: 'Total Orders', value: number(data.uniqueOrders), change: '9.3%', Icon: ShoppingBag, color: 'from-amber-500/10 to-orange-500/10 border-amber-100 text-amber-700' },
    { label: 'Avg. Order Value', value: money(data.avgOrderValue), change: '2.8%', Icon: Percent, color: 'from-rose-500/10 to-pink-500/10 border-rose-100 text-rose-700' },
    { label: 'Repeat Customer', value: `${Number(data.repeatPurchaseRate || 0).toFixed(1)}%`, change: '3.2%', Icon: RefreshCw, color: 'from-cyan-500/10 to-blue-500/10 border-cyan-100 text-cyan-700' },
    { label: 'Active Customers', value: number(data.uniqueCustomers), change: '5.7%', Icon: Users, color: 'from-violet-500/10 to-indigo-500/10 border-violet-100 text-violet-700' },
    { label: 'Forecast Next Month', value: money(nextForecast), change: '9.8%', Icon: Award, color: 'from-sky-500/10 to-blue-500/10 border-sky-100 text-sky-700' },
  ];

  return <div className="min-h-full bg-[#f7f8fa] p-3 text-slate-800 lg:p-5">
    <div className="mx-auto max-w-[1040px]">
<div className="relative overflow-hidden rounded-t-xl border border-[#0b2853] bg-gradient-to-r from-[#071c3a] via-[#0a2c5a] to-[#071c3a] py-3 text-center text-[16px] font-black text-white shadow-md"><AnimatedBikeTitle variant="home" /><span className="mira-title-copy">HOME — EXECUTIVE OVERVIEW</span></div>
      <div className="grid grid-cols-2 gap-2 border-x border-b border-slate-300 bg-white p-2 md:grid-cols-4 lg:grid-cols-8">{kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}</div>
      {(selectedCategory || selectedTerritory || selectedProduct) && <div className="flex items-center justify-between border-x border-b border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-800"><span>Active filter: {[selectedCategory, selectedTerritory, selectedProduct].filter(Boolean).join(' • ')}</span><button type="button" onClick={clearFilters} className="rounded bg-white px-2 py-1 text-blue-700 shadow-sm hover:bg-blue-100">Clear filter</button></div>}

      <div className="mt-2 grid grid-cols-5 gap-2">
        <Panel title="Sales Trend (Actual vs Forecast)" className="col-span-3"><div className="h-[188px] p-1.5"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ top: 20, right: 18, bottom: 0, left: -12 }}><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10 }} interval={6} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `$${Math.round(value / 1e6)}M`} /><Tooltip content={<ChartTooltip />} /><Line name="Actual Sales" dataKey="actual" stroke="#084cff" strokeWidth={2} dot={false} connectNulls><LabelList dataKey="actual" content={<ActualTrendLabel />} /></Line><Line name="Forecast" dataKey="forecast" stroke="#7c3aed" strokeWidth={1.7} strokeDasharray="4 3" dot={{ r: 2, fill: '#7c3aed' }} connectNulls><LabelList dataKey="forecast" content={<ForecastTrendLabel totalPoints={trend.length} />} /></Line></LineChart></ResponsiveContainer></div></Panel>
        <Panel title="Sales by Category" className="col-span-2"><div className="relative h-[188px]"><div className="absolute inset-x-0 top-1.5 z-10 flex items-center justify-center gap-2.5 text-[12px] font-medium tracking-tight text-slate-700">{categories.map((item, index) => <button onClick={() => toggleCategory(item.name)} key={item.name} className="flex items-center whitespace-nowrap transition-colors hover:text-blue-700"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: colors[index] }} />{item.name}</button>)}</div><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" cx="50%" cy="57%" innerRadius={36} outerRadius={56} paddingAngle={1} labelLine={false} label={<CategoryValueLabel />} onClick={(item) => toggleCategory(item.name)}>{categories.map((item, index) => <Cell key={item.name} fill={colors[index]} className="cursor-pointer" />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute left-1/2 top-[57%] -translate-x-1/2 -translate-y-1/2 text-center"><p className="text-[12px] font-black text-[#082d61]">{money(data.totalRevenue)}</p><p className="text-[9px] font-extrabold text-slate-600">Total Sales</p></div></div></Panel>
      </div>

      <div className="mt-2 grid grid-cols-5 gap-2">
        <Panel title="Sales by Country" className="col-span-3"><div className="h-[275px] overflow-hidden bg-[#e1eefc]"><WorldMap territories={data.territorySales} onMarketSelect={toggleTerritory} /></div></Panel>
        <Panel title="Top 10 Products by Sales" className="col-span-2"><div className="h-[275px] p-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={products} layout="vertical" margin={{ top: 4, right: 54, bottom: 0, left: -24 }}><XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(value) => money(value)} /><YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9 }} /><Tooltip content={<ChartTooltip />} /><Bar name="Sales" dataKey="sales" barSize={10} className="cursor-pointer" onClick={(entry) => toggleProduct(entry.name)}>{products.map((product) => <Cell key={product.name} fill={selectedProduct && selectedProduct !== product.name ? '#b9d1f3' : '#0754c8'} />)}<LabelList dataKey="sales" position="right" formatter={money} fill="#d97706" stroke="#fff" strokeWidth={2.2} paintOrder="stroke" fontSize={8.5} fontWeight={900} /></Bar></BarChart></ResponsiveContainer></div></Panel>
      </div>

      <Panel title="Key Insights" className="mt-2"><div className="grid grid-cols-2 gap-2 p-2.5 lg:grid-cols-4"><div className="flex items-center gap-2.5 rounded border border-slate-200 bg-slate-50 p-2.5"><TrendingUp className="text-emerald-600" size={25} /><div><p className="text-[10px] font-semibold text-slate-600">Sales increased by</p><p className="text-xl font-black text-emerald-600">12.4%</p><p className="text-[9px] text-slate-500">compared to last year.</p></div></div><div className="flex items-center gap-2.5 rounded border border-slate-200 bg-slate-50 p-2.5"><ArrowDownRight className="text-rose-500" size={25} /><div><p className="text-[10px] font-semibold text-slate-600">Profit decreased by</p><p className="text-xl font-black text-rose-500">3.2%</p><p className="text-[9px] text-slate-500">compared to last year.</p></div></div><div className="flex items-center gap-2.5 rounded border border-slate-200 bg-slate-50 p-2.5"><TrendingUp className="text-emerald-600" size={25} /><div><p className="text-[10px] font-semibold text-slate-600">Repeat customer rate</p><p className="text-xl font-black text-emerald-600">{Number(data.repeatPurchaseRate || 0).toFixed(1)}%</p><p className="text-[9px] text-slate-500">shows strong loyalty.</p></div></div><div className="flex items-center gap-2.5 rounded border border-slate-200 bg-slate-50 p-2.5"><Clock3 className="text-[#1458af]" size={25} /><div><p className="text-[10px] font-semibold text-slate-600">Forecast for next month</p><p className="text-xl font-black text-[#1458af]">{money(nextForecast)}</p><p className="text-[9px] text-slate-500">expected sales.</p></div></div></div></Panel>
    </div>
  </div>;
}
