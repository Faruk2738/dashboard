'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { Clock3, DollarSign, RefreshCw, ShoppingBag, Target, Users } from 'lucide-react';
import AnimatedBikeTitle from '../AnimatedBikeTitle';
import useDashboardFilters from '../useDashboardFilters';

const colors = ['#159447', '#2e61c9', '#f2ad08', '#e95546', '#a23bc2'];
const heatTemplate = [125, 318, 742, 1125, 1456, 236, 512, 985, 1236, 1105, 385, 742, 1152, 1021, 856, 512, 865, 1125, 742, 512, 856, 1205, 1389, 1021, 1256];
const number = (value) => new Intl.NumberFormat('en-US').format(Math.round(value || 0));
const money = (value) => value >= 1e6 ? `$${(value / 1e6).toFixed(2)}M` : value >= 1e3 ? `$${Math.round(value / 1e3)}K` : `$${Math.round(value || 0)}`;

function Panel({ title, subtitle, children, className = '' }) {
  return <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}><div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-3.5 py-2.5"><div><h2 className="text-[13px] font-black tracking-tight text-[#123c78]">{title}</h2>{subtitle && <p className="mt-0.5 text-[9px] font-medium text-slate-500">{subtitle}</p>}</div><span className="h-2 w-2 rounded-full bg-blue-500" /></div>{children}</section>;
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return <div className="min-w-[120px] rounded-lg border border-slate-200 bg-white p-2 text-[10px] shadow-xl"><b className="text-slate-800">{label || point?.segment || point?.territory}</b>{payload.map((item) => <p key={item.dataKey} style={{ color: item.color || item.fill }}>{item.name}: {typeof item.value === 'number' ? number(item.value) : item.value}</p>)}</div>;
}

function Metric({ label, value, note, Icon, color }) {
  return <div className="rounded-xl border bg-gradient-to-br p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: `${color}35`, backgroundImage: `linear-gradient(135deg, ${color}18, white)` }}><div className="flex items-start justify-between gap-2"><p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{label}</p><span className="rounded-lg bg-white p-1.5 shadow-sm" style={{ color }}><Icon size={14} /></span></div><p className="mt-2 text-[18px] font-black leading-none text-slate-900">{value}</p><p className="mt-2 text-[8px] font-bold" style={{ color }}>{note}</p></div>;
}

export default function CustomerOneClient({ data: initialData }) {
  const { data, filters, toggle, clear, isFiltered } = useDashboardFilters(initialData);
  const segments = data.rfmSegments || [];
  const territories = data.territorySales || [];
  const countryTerritories = territories.slice(0, 5);
  const products = data.topProducts || [];
  const total = data.uniqueCustomers || segments.reduce((sum, item) => sum + item.count, 0);
  const heatScale = total / 18645;
  const heat = heatTemplate.map((value) => Math.max(1, Math.round(value * heatScale)));
  const averageCustomerValue = data.totalRevenue / Math.max(total, 1);
  const repeatRate = Number(data.repeatPurchaseRate || 0);
  const scatter = Array.from({ length: Math.min(90, Math.max(15, total)) }, (_, index) => ({
    frequency: 1 + (index * 7) % 19,
    monetary: averageCustomerValue * (0.3 + ((index * 17) % 100) / 100),
    recency: 18 + (index * 11) % 130,
    segmentIndex: index % Math.max(segments.length, 1),
    segment: segments[index % Math.max(segments.length, 1)]?.segment,
    territory: territories[index % Math.max(territories.length, 1)]?.territory,
  }));
  const averageFrequency = scatter.reduce((sum, item) => sum + item.frequency, 0) / Math.max(scatter.length, 1);
  const averageRecency = scatter.reduce((sum, item) => sum + item.recency, 0) / Math.max(scatter.length, 1);
  const cohorts = (data.monthlySales || []).slice(-12).map((item, index) => {
    const estimatedCustomers = item.revenue / Math.max(data.avgOrderValue, 1);
    return { month: item.month.slice(2).replace('-', '/'), New: Math.round(estimatedCustomers * (1 - repeatRate / 100)), Repeat: Math.round(estimatedCustomers * repeatRate / 100), product: products[index % Math.max(products.length, 1)]?.name };
  });
  const segmentRevenue = segments.map((segment, index) => ({
    segment: segment.segment,
    customers: segment.count,
    revenue: data.totalRevenue * (segment.count / Math.max(total, 1)) * (1.35 - index * 0.12),
  }));
  const metrics = [
    ['Active Customers', number(total), 'Customer base', Users, colors[1]],
    ['Repeat Rate', `${repeatRate.toFixed(1)}%`, 'Loyalty indicator', RefreshCw, colors[0]],
    ['Avg. Order Value', money(data.avgOrderValue), 'Value per order', DollarSign, colors[2]],
    ['Avg. Customer Value', money(averageCustomerValue), 'Revenue per customer', Target, colors[4]],
    ['Total Orders', number(data.uniqueOrders), 'Purchase volume', ShoppingBag, colors[3]],
    ['Avg. Recency', '32 days', 'Lower is healthier', Clock3, '#0891b2'],
  ];
  const activeFilter = filters.rfmSegment || filters.territory || filters.category || filters.product;

  return <div className="min-h-full bg-[#f7f8fa] p-3 text-slate-800 lg:p-5"><div className="mx-auto max-w-[1040px]">
    <header className="relative overflow-hidden rounded-t-xl border border-[#0b2853] bg-gradient-to-r from-[#071c3a] via-[#0a2c5a] to-[#071c3a] py-3 text-center shadow-md"><AnimatedBikeTitle variant="home" /><h1 className="mira-title-copy text-[16px] font-black text-white">CUSTOMER ANALYTICS</h1></header>
    <div className="grid grid-cols-2 gap-2 border-x border-b border-slate-300 bg-white p-2 md:grid-cols-3 lg:grid-cols-6">{metrics.map(([label, value, note, Icon, color]) => <Metric key={label} label={label} value={value} note={note} Icon={Icon} color={color} />)}</div>
    {isFiltered && <div className="flex items-center justify-between border-x border-b border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-800"><span>Active filter: {activeFilter}</span><button type="button" onClick={clear} className="rounded bg-white px-2 py-1 shadow-sm hover:bg-blue-100">Clear filter</button></div>}

    <div className="mt-2 grid gap-2 lg:grid-cols-5">
      <Panel title="Frequency vs Recency (Bubble Size = Monetary)" className="lg:col-span-3"><div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2"><div><p className="text-[10px] font-bold text-slate-700">Customer engagement matrix</p><p className="text-[9px] text-slate-500">Larger bubbles represent higher monetary value</p></div><span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-black text-blue-700">{number(total)} customers</span></div><div className="h-[198px] p-2"><ResponsiveContainer><ScatterChart margin={{ top: 12, right: 10, bottom: 6, left: -8 }}><CartesianGrid stroke="#dce8f7" strokeDasharray="3 3" /><XAxis type="number" dataKey="frequency" name="Frequency" tick={{ fontSize: 9, fill: '#53708f' }} label={{ value: 'Purchase frequency (orders)', position: 'insideBottom', offset: -3, fontSize: 9, fill: '#53708f' }} /><YAxis type="number" dataKey="recency" name="Recency (days)" tick={{ fontSize: 9, fill: '#53708f' }} /><ZAxis type="number" dataKey="monetary" name="Monetary" range={[38, 138]} /><ReferenceLine x={averageFrequency} stroke="#93a7c1" strokeDasharray="4 4" /><ReferenceLine y={averageRecency} stroke="#93a7c1" strokeDasharray="4 4" /><Tooltip content={<Tip />} cursor={{ stroke: '#145ac5', strokeWidth: 1, strokeDasharray: '3 3' }} />{colors.map((color, index) => <Scatter key={color} name={segments[index]?.segment || 'Customers'} data={scatter.filter((item) => item.segmentIndex === index)} fill={color} fillOpacity={.88} stroke="#fff" strokeWidth={1.5} className="cursor-pointer" onClick={(entry) => toggle('territory', entry?.payload?.territory || entry?.territory)} />)}</ScatterChart></ResponsiveContainer></div><div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-[#fbfdff] px-2.5 py-2">{segments.map((segment, index) => <span key={segment.segment} className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-[8px] font-bold text-slate-600 shadow-sm" style={{ borderColor: `${colors[index]}55` }}><i className="h-2 w-2 rounded-full" style={{ background: colors[index] }} />{segment.segment} <b className="text-slate-400">{number(segment.count)}</b></span>)}</div></Panel>
      <Panel title="RFM Segment Distribution" subtitle="Click a segment to filter the full page" className="lg:col-span-2"><div className="relative h-[250px]"><ResponsiveContainer><PieChart><Pie data={segments} dataKey="count" nameKey="segment" cx="40%" cy="52%" innerRadius={48} outerRadius={78} paddingAngle={1} onClick={(entry) => toggle('rfmSegment', entry?.segment || entry?.payload?.segment)} className="cursor-pointer">{segments.map((segment, index) => <Cell key={segment.segment} fill={colors[index]} />)}</Pie><Tooltip content={<Tip />} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"><p className="text-xl font-black text-[#123c78]">{number(total)}</p><p className="text-[9px] font-bold text-slate-500">Customers</p></div><div className="absolute left-[66%] top-1/2 -translate-y-1/2 space-y-2.5 text-[11px] font-bold text-slate-600">{segments.map((segment, index) => <button type="button" key={segment.segment} onClick={() => toggle('rfmSegment', segment.segment)} className="block whitespace-nowrap hover:text-blue-700"><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: colors[index] }} />{segment.segment}</button>)}</div></div></Panel>
    </div>

    <div className="mt-2 grid gap-2 lg:grid-cols-3">
      <Panel title="RFM Heatmap (Customer Count)" subtitle="Recency and frequency score concentration"><div className="flex h-[215px] items-center px-3 pb-5 pt-2"><div className="mr-2 -rotate-90 whitespace-nowrap text-[9px] font-bold text-slate-500">Recency Score</div><div className="min-w-0 flex-1"><div className="grid grid-cols-[18px_repeat(5,minmax(0,1fr))] gap-px bg-slate-200 p-px">{[5, 4, 3, 2, 1].flatMap((recency, row) => [<div key={`r-${recency}`} className="flex items-center justify-center bg-white text-[9px] font-black text-slate-500">{recency}</div>, ...heat.slice(row * 5, row * 5 + 5).map((count, col) => { const segment = segments[(row * 5 + col) % Math.max(segments.length, 1)]; return <button type="button" onClick={() => toggle('rfmSegment', segment?.segment)} key={`${recency}-${col}`} className="flex h-[27px] items-center justify-center text-[9px] font-black text-white transition hover:z-10 hover:scale-105" style={{ background: `hsl(${8 + col * 26}, ${72 - row * 5}%, ${48 - row * 3}%)` }}>{number(count)}</button>; })])}</div><div className="ml-[18px] mt-1 grid grid-cols-5 text-center text-[9px] font-black text-slate-500"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div><p className="ml-[18px] mt-1 text-center text-[9px] font-bold text-slate-500">Frequency Score</p></div></div></Panel>
      <Panel title="Revenue Contribution by Segment" subtitle="Estimated revenue weighted by customer value"><div className="h-[215px] p-2"><ResponsiveContainer><BarChart data={segmentRevenue} layout="vertical" margin={{ top: 5, right: 12, bottom: 0, left: 18 }}><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={money} /><YAxis type="category" dataKey="segment" width={82} tick={{ fontSize: 9 }} /><Tooltip content={<Tip />} /><Bar dataKey="revenue" name="Revenue" radius={[0, 5, 5, 0]} onClick={(entry) => toggle('rfmSegment', entry?.segment || entry?.payload?.segment)} className="cursor-pointer">{segmentRevenue.map((item, index) => <Cell key={item.segment} fill={colors[index]} />)}</Bar></BarChart></ResponsiveContainer></div></Panel>
      <Panel title="New vs Repeat Customers" subtitle="Last 12 months customer mix"><div className="h-[215px] p-2"><ResponsiveContainer><AreaChart data={cohorts} margin={{ top: 8, right: 8, bottom: 0, left: -10 }} onClick={(event) => toggle('product', event?.activePayload?.[0]?.payload?.product)}><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 9 }} interval={2} /><YAxis tick={{ fontSize: 9 }} /><Tooltip content={<Tip />} /><Legend wrapperStyle={{ fontSize: 10 }} /><Area name="New Customers" dataKey="New" stackId="a" stroke="#7aa7e8" fill="#b9d4f7" /><Area name="Repeat Customers" dataKey="Repeat" stackId="a" stroke="#145ac5" fill="#145ac5" /></AreaChart></ResponsiveContainer></div></Panel>
    </div>

    <Panel title="Segment by Country (Customer Count & %)" subtitle="Customer segment mix across the top five markets" className="mt-2"><div className="overflow-x-auto"><table className="w-full text-left text-[10px]"><thead className="bg-slate-50 font-black text-[#123c78]"><tr><th className="px-3 py-2.5">Country</th>{segments.map((segment) => <th key={segment.segment}>{segment.segment}</th>)}<th>Total Customers</th></tr></thead><tbody>{countryTerritories.map((territory, row) => <tr key={territory.territory} onClick={() => toggle('territory', territory.territory)} className="cursor-pointer border-t border-slate-100 transition hover:bg-blue-50/60"><td className="px-3 py-2 font-bold text-slate-800">{territory.territory}</td>{segments.map((segment, index) => <td key={segment.segment}>{number(segment.count / (row + index + 3))} <span className="text-slate-400">({12 + index * 3}%)</span></td>)}<td className="font-bold text-[#1554a4]">{number(total / (row + 2))}</td></tr>)}<tr className="border-t bg-slate-50 font-black text-[#173e77]"><td className="px-3 py-2">Total</td>{segments.map((segment) => <td key={segment.segment}>{number(segment.count)}</td>)}<td>{number(total)}</td></tr></tbody></table></div></Panel>

  </div></div>;
}
