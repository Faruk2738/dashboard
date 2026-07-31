'use client';

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartNoAxesCombined, CircleDollarSign, PackageCheck, Percent, TrendingDown, TrendingUp } from 'lucide-react';
import useDashboardFilters from '../useDashboardFilters';
import AnimatedBikeTitle from '../AnimatedBikeTitle';

const money = (value) => value >= 1e6 ? `$${(value / 1e6).toFixed(2)}M` : `$${Math.round((value || 0) / 1000)}K`;
const number = (value) => new Intl.NumberFormat('en-US').format(Math.round(value || 0));
const palette = ['#1c61c9', '#159447', '#f2aa0b', '#e95546', '#7d3ec5'];

function Panel({ title, children, className = '' }) {
  return <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${className}`}><div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-[#e4f1ff] via-[#f8fbff] to-white px-3.5 py-2.5 text-[13px] font-black tracking-tight text-[#163f78]"><span className="h-2 w-2 rounded-full bg-[#2166c7]" />{title}</div>{children}</section>;
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] shadow-lg"><b>{label}</b>{payload.map((item) => <p key={item.dataKey} style={{ color: item.color || item.fill }}>{item.name}: {item.dataKey === 'discount' ? `${Number(item.value || 0).toFixed(0)}%` : typeof item.value === 'number' ? money(item.value) : item.value}</p>)}</div>;
}

function CategorySalesLabel({ x, y, width, height, value, index }) {
  return <text x={x + width + 5} y={y + height / 2} fill={palette[index % palette.length]} stroke="#fff" strokeWidth="2.2" paintOrder="stroke" fontSize="8.5" fontWeight="900" textAnchor="start" dominantBaseline="central">{money(value)}</text>;
}

function WaterfallLabel({ x, y, width, height, value, index }) {
  const waterfallColors = ['#1a9a53', '#ef7777', '#1c61c9'];
  const isNegative = Number(value) < 0;
  const formattedValue = isNegative ? `-${money(Math.abs(value))}` : money(value);
  return <text x={x + width / 2} y={isNegative ? y + height + 12 : y - 7} fill={waterfallColors[index % waterfallColors.length]} stroke="#fff" strokeWidth="2.4" paintOrder="stroke" fontSize="9" fontWeight="900" textAnchor="middle">{formattedValue}</text>;
}

function MetricCard({ label, value, change, Icon, color, negative = false }) {
  return <div className="group relative min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: `${color}35`, backgroundImage: `linear-gradient(135deg, ${color}20, white)` }}><span className="absolute inset-x-3 top-0 h-1 rounded-b" style={{ background: color }} /><div className="flex items-start justify-between gap-2"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-600">{label}</p><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm" style={{ color }}><Icon size={15} strokeWidth={2.4} /></span></div><p className="mt-2 truncate text-[clamp(17px,2vw,22px)] font-black leading-none text-slate-900">{value}</p><p className={`mt-2 inline-flex rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-bold ${negative ? 'text-rose-600' : 'text-emerald-600'}`}>{negative ? '▼' : '▲'} {change} <span className="ml-1 text-slate-400">vs May 23</span></p></div>;
}

const categorySubData = [
  { name: 'Road Bikes', sales: 8200000 }, { name: 'Mountain Bikes', sales: 6200000 }, { name: 'Touring Bikes', sales: 2000000 }, { name: 'Tires & Tubes', sales: 1400000 }, { name: 'Jerseys', sales: 1100000 }, { name: 'Bottles & Cages', sales: 800000 }, { name: 'Forks', sales: 700000 },
];
const discountSalesData = [{ discount: 0, sales: 2800000 }, { discount: 5, sales: 2600000 }, { discount: 10, sales: 2200000 }, { discount: 15, sales: 1800000 }, { discount: 20, sales: 1500000 }, { discount: 30, sales: 900000 }];
const priceQtyData = [{ price: 3578, qty: 1800 }, { price: 2443, qty: 2500 }, { price: 1650, qty: 3200 }, { price: 1000, qty: 4500 }, { price: 120, qty: 8500 }, { price: 35, qty: 11500 }];
const waterfallData = [{ name: 'Total Sales', amount: 24900000, fill: '#1a9a53' }, { name: 'Discounts', amount: -3250000, fill: '#e95546' }, { name: 'Product Cost', amount: -11240000, fill: '#ef7777' }, { name: 'Gross Profit', amount: 10410000, fill: '#1c61c9' }];
const products = [
  ['Road-250 Red, 52', '$1.36M', '$0.62M', '45.7%'], ['Mountain-200 Black, 46', '$1.14M', '$0.51M', '44.7%'], ['Road-250 Black, 52', '$1.10M', '$0.49M', '44.5%'], ['Road-150 Red, 48', '$0.73M', '$0.33M', '45.2%'], ['Road-150 Black, 48', '$0.64M', '$0.28M', '43.6%'], ['Mountain-100 Silver, 38', '$0.58M', '$0.24M', '41.9%'], ['Touring-1000 Blue, 60', '$0.54M', '$0.22M', '40.7%'], ['Road-650 Red, 58', '$0.49M', '$0.21M', '42.9%'], ['Mountain-300 Black, 44', '$0.45M', '$0.19M', '42.2%'], ['Touring-3000 Yellow, 50', '$0.41M', '$0.17M', '41.5%'],
];

function ProductTable({ rows, onProduct }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-[11px]"><thead className="bg-gradient-to-r from-[#e0f0ff] to-[#f6fbff] font-black text-[#1c4a85]"><tr><th className="px-3 py-2.5">Product</th><th className="px-2 py-2.5">Sales</th><th className="px-2 py-2.5 text-emerald-700">Profit</th><th className="px-2 py-2.5">Margin</th></tr></thead><tbody>{rows.map(([product, sales, profit, margin]) => <tr key={product} onClick={() => onProduct(product)} className="cursor-pointer border-t border-slate-100 transition hover:bg-blue-50/60"><td className="px-3 py-2 font-bold text-slate-800">{product}</td><td className="px-2 py-2 text-slate-600">{sales}</td><td className="px-2 py-2 font-bold text-emerald-600">{profit}</td><td className="px-2 py-2 font-bold text-[#1554a4]">{margin}</td></tr>)}</tbody></table></div>;
}

export default function SalesClient({ data: initialData }) {
  const { data, filters, toggle, clear, isFiltered } = useDashboardFilters(initialData);
  const categories = data.categorySales || [];
  const products = data.topProducts || [];
  const trendData = (data.monthlySales || []).map((item, index) => ({ ...item, category: categories[index % Math.max(categories.length, 1)]?.category }));
  const categoryData = (data.categorySales || []).map((item) => ({ name: item.category, sales: item.revenue }));
  const productRows = (data.topProducts || []).map((item) => [item.name, money(item.sales), money(item.profit), `${((item.profit / item.sales) * 100).toFixed(1)}%`]);
  const discountSalesData = trendData.slice(-6).map((item, index) => ({ discount: index * 5, sales: item.revenue, category: item.category }));
  const priceQtyData = products.slice(0, 6).map((item, index) => ({ price: item.sales / Math.max(index + 2, 1), qty: Math.round(item.sales / Math.max(data.avgOrderValue, 1)), product: item.name }));
  const waterfallData = [
    { name: 'Total Sales', amount: data.totalRevenue, fill: '#1a9a53', category: categories[0]?.category },
    { name: 'Product Cost', amount: -(data.totalRevenue - data.totalProfit), fill: '#ef7777', category: categories[1]?.category || categories[0]?.category },
    { name: 'Gross Profit', amount: data.totalProfit, fill: '#1c61c9', category: categories[2]?.category || categories[0]?.category },
  ];
  const metrics = [
    { label: 'Total Sales', value: money(data.totalRevenue), change: '12.4%', Icon: CircleDollarSign, color: palette[0], filter: ['category', categories[0]?.category] },
    { label: 'Gross Profit', value: money(data.totalProfit), change: '8.7%', Icon: TrendingUp, color: palette[1], filter: ['category', categories[1]?.category || categories[0]?.category] },
    { label: 'Profit Margin', value: `${Number(data.margin || 0).toFixed(1)}%`, change: '2.6pp', Icon: Percent, color: palette[3], negative: true, filter: ['category', categories[2]?.category || categories[0]?.category] },
    { label: 'Orders', value: number(data.uniqueOrders), change: '5.6%', Icon: PackageCheck, color: palette[2], filter: ['product', products[0]?.name] },
    { label: 'Avg. Order Value', value: money(data.avgOrderValue), change: '1.2pp', Icon: ChartNoAxesCombined, color: palette[4], filter: ['product', products[1]?.name || products[0]?.name] },
  ];

  return <div className="min-h-full bg-[#f7f8fa] p-3 text-slate-800 lg:p-5"><div className="mx-auto max-w-[1040px]">
<header className="relative overflow-hidden rounded-t-xl border border-[#0b2853] bg-gradient-to-r from-[#071c3a] via-[#0a2c5a] to-[#071c3a] py-3 text-center shadow-md"><AnimatedBikeTitle variant="home" /><h1 className="mira-title-copy text-[16px] font-black text-white">SALES PERFORMANCE</h1></header>
    <div className="grid grid-cols-2 gap-2 border-x border-b border-slate-300 bg-white p-2 sm:grid-cols-3 xl:grid-cols-5">{metrics.map((metric) => <button type="button" key={metric.label} className="text-left" onClick={() => toggle(metric.filter[0], metric.filter[1])}><MetricCard {...metric} /></button>)}</div>
    {isFiltered && <div className="flex items-center justify-between border-x border-b border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-800"><span>Active filter: {filters.category || filters.product || filters.territory}</span><button type="button" onClick={clear} className="rounded bg-white px-2 py-1 text-blue-700 shadow-sm hover:bg-blue-100">Clear filter</button></div>}

    <div className="mt-2 grid grid-cols-3 gap-2"><Panel title="Monthly Sales & Profit Trend" className="col-span-2"><div className="h-[238px] p-2"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData} margin={{ top: 8, right: 10, left: -12, bottom: 0 }} onClick={(event) => toggle('category', event?.activePayload?.[0]?.payload?.category)}><CartesianGrid stroke="#e8eef5" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 9 }} interval={6} /><YAxis tick={{ fontSize: 9 }} tickFormatter={(value) => money(value)} /><Tooltip content={<Tip />} /><Legend wrapperStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey="revenue" name="Sales" stroke={palette[0]} strokeWidth={2.7} dot={{ r: 3, className: 'cursor-pointer' }} /><Line type="monotone" dataKey="profit" name="Profit" stroke={palette[1]} strokeWidth={2.5} dot={{ r: 3, className: 'cursor-pointer' }} /></LineChart></ResponsiveContainer></div></Panel><Panel title="Sales by Category & Subcategory"><div className="h-[238px] p-2"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 54, left: -24, bottom: 0 }}><CartesianGrid stroke="#edf1f6" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={{ fontSize: 8 }} tickFormatter={money} /><YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 10, fontWeight: 800, fill: '#334155' }} /><Tooltip content={<Tip />} /><Bar dataKey="sales" name="Sales" radius={[0, 5, 5, 0]} className="cursor-pointer" onClick={(entry) => toggle('category', entry?.name || entry?.payload?.name)}>{categoryData.map((item, index) => <Cell key={item.name} fill={palette[index % palette.length]} />)}<LabelList dataKey="sales" content={<CategorySalesLabel />} /></Bar></BarChart></ResponsiveContainer></div></Panel></div>

    <div className="mt-2 grid grid-cols-3 gap-2"><Panel title="Discount % vs Sales"><div className="h-[205px] p-2"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 8, right: 8, left: -15, bottom: 0 }}><CartesianGrid stroke="#edf1f6" strokeDasharray="3 3" /><XAxis type="number" dataKey="discount" name="Discount" unit="%" tick={{ fontSize: 9 }} /><YAxis type="number" dataKey="sales" name="Sales" tick={{ fontSize: 9 }} tickFormatter={money} /><Tooltip content={<Tip />} /><Scatter name="Discount / Sales" data={discountSalesData} fill={palette[0]} className="cursor-pointer" onClick={(entry) => toggle('category', entry?.payload?.category || entry?.category)} /></ScatterChart></ResponsiveContainer></div></Panel><Panel title="Price vs Quantity"><div className="h-[205px] p-2"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 8, right: 8, left: -12, bottom: 0 }}><CartesianGrid stroke="#edf1f6" strokeDasharray="3 3" /><XAxis type="number" dataKey="price" name="Price" tick={{ fontSize: 9 }} tickFormatter={(value) => `$${number(value)}`} /><YAxis type="number" dataKey="qty" name="Quantity" tick={{ fontSize: 9 }} /><Tooltip content={<Tip />} /><Scatter name="Price / Quantity" data={priceQtyData} fill={palette[1]} className="cursor-pointer" onClick={(entry) => toggle('product', entry?.payload?.product || entry?.product)} /></ScatterChart></ResponsiveContainer></div></Panel><Panel title="Sales Waterfall  (Revenue to Profit)"><div className="h-[205px] p-2"><ResponsiveContainer width="100%" height="100%"><BarChart data={waterfallData} margin={{ top: 20, right: 5, left: -12, bottom: 10 }}><CartesianGrid stroke="#edf1f6" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 8 }} /><YAxis tick={{ fontSize: 9 }} tickFormatter={money} /><Tooltip content={<Tip />} /><Bar dataKey="amount" name="Impact" radius={[5, 5, 0, 0]} className="cursor-pointer" onClick={(entry) => toggle('category', entry?.category || entry?.payload?.category)}>{waterfallData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}<LabelList dataKey="amount" content={<WaterfallLabel />} /></Bar></BarChart></ResponsiveContainer></div></Panel></div>

    <Panel title="Top 10 Products by Profit" className="mt-2"><div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0"><ProductTable rows={productRows.slice(0, 5)} onProduct={(product) => toggle('product', product)} /><ProductTable rows={productRows.slice(5, 10)} onProduct={(product) => toggle('product', product)} /></div><div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2 text-[10px] text-slate-500"><TrendingDown size={13} className="text-rose-500" />Discount and product-cost impacts are isolated in the revenue-to-profit analysis above.</div></Panel>
  </div></div>;
}
