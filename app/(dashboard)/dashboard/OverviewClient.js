'use client'

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import dynamic from 'next/dynamic';
import { 
  DollarSign, TrendingUp, Users, ShoppingBag, 
  Percent, Star, ArrowUpRight, ArrowDownRight, Award 
} from 'lucide-react';

const WorldMap = dynamic(() => import('./WorldMap'), { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading map…</div> });

const DONUT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

export default function OverviewClient({ data }) {
  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };
  const formatFull = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val);

  const trendData = data.monthlySales || [];
  const forecastData = data.forecast || [];

  // Combine actual + forecast for chart
  const combinedTrend = [
    ...trendData.map(m => ({ month: m.month, actual: m.revenue, forecast: null })),
    ...forecastData.map(f => ({ month: f.month, actual: null, forecast: f.revenue }))
  ];

  const categoryData = (data.categorySales || []).map((c, i) => ({
    name: c.category,
    value: c.revenue
  }));

  const totalForPct = categoryData.reduce((s, c) => s + c.value, 0);

  // Top 10 products
  const topProducts = [
    { name: "Road-250 Red, 52", sales: 1320000 },
    { name: "Mountain-200 Black, 46", sales: 1140000 },
    { name: "Road-250 Black, 52", sales: 1100000 },
    { name: "Mountain-200 Silver, 46", sales: 890000 },
    { name: "Touring-1000 Blue, 60", sales: 830000 },
    { name: "Road-150 Red, 48", sales: 730000 },
    { name: "Mountain-100 Silver, 38", sales: 580000 },
    { name: "Road-150 Silver, 48", sales: 500000 },
    { name: "Road-150 Black, 48", sales: 380000 },
    { name: "Touring-3000 Blue, 62", sales: 340000 },
  ].reverse();

  // Custom tooltips for premium feel
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl text-white font-sans text-xs">
          <p className="font-bold mb-2 text-slate-300">{label}</p>
          {payload.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }}></span>
              <span className="text-slate-400">{p.name}:</span>
              <span className="font-black text-white">{formatFull(p.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 max-w-full bg-slate-50/50 min-h-screen">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
          <p className="text-xs text-slate-500 font-medium">Enterprise performance indicators and growth trajectory</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-[11px] font-bold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          System Online
        </div>
      </div>

      {/* ── 8 VIBRANT KPI CARDS ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Total Sales",           value: formatCurrency(data.totalRevenue),    change: "+12.4%", icon: DollarSign,   color: "from-blue-500/10 to-indigo-500/10 border-blue-100 text-blue-700" },
          { label: "Gross Profit",          value: formatCurrency(data.totalProfit),     change: "+8.7%",  icon: TrendingUp,   color: "from-emerald-500/10 to-teal-500/10 border-emerald-100 text-emerald-700" },
          { label: "Total Customers",       value: formatNumber(data.uniqueCustomers),   change: "+6.1%",  icon: Users,        color: "from-purple-500/10 to-fuchsia-500/10 border-purple-100 text-purple-700" },
          { label: "Total Orders",          value: formatNumber(data.uniqueOrders),      change: "+9.3%",  icon: ShoppingBag,  color: "from-amber-500/10 to-orange-500/10 border-amber-100 text-amber-700" },
          { label: "Avg. Order Value",      value: formatFull(data.avgOrderValue),       change: "+3.2%",  icon: Percent,      color: "from-rose-500/10 to-pink-500/10 border-rose-100 text-rose-700" },
          { label: "Repeat Customer Rate",  value: `${data.repeatPurchaseRate.toFixed(1)}%`, change: "+3.2%", icon: Star,         color: "from-cyan-500/10 to-blue-500/10 border-cyan-100 text-cyan-700" },
          { label: "Active Customers",      value: formatNumber(data.uniqueCustomers),   change: "+5.7%",  icon: Users,        color: "from-violet-500/10 to-indigo-500/10 border-violet-100 text-violet-700" },
          { label: "Forecast Next Month",   value: formatCurrency(data.forecast?.[0]?.revenue || 2710000), change: "+9.8%", icon: Award, color: "from-sky-500/10 to-blue-500/10 border-sky-100 text-sky-700" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} border rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
              <div className="flex justify-between items-start gap-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{kpi.label}</span>
                <span className="p-1 rounded-lg bg-white/60 shadow-sm"><Icon size={12} className="opacity-80" /></span>
              </div>
              <div className="mt-2.5">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">{kpi.value}</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-bold bg-white/80 text-emerald-600 px-1 py-0.5 rounded flex items-center">
                    <ArrowUpRight size={8} /> {kpi.change}
                  </span>
                  <span className="text-[8px] text-slate-500 font-semibold uppercase">vs May 23</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ROW 2: Sales Trend + Donut ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sales Trend Area Chart */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sales Trend & Projection</h2>
              <p className="text-[10px] text-slate-400 font-medium">Historical sales vs projected model</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Actual
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-300"></span> Forecast
              </span>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual Sales" dot={false} connectNulls />
                <Area type="monotone" dataKey="forecast" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" name="Forecast" dot={false} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Donut */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Sales by Category</h2>
            <p className="text-[10px] text-slate-400 font-medium">Revenue contribution by segment</p>
          </div>
          <div className="h-60 relative flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="40%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center glassmorphic text */}
            <div className="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-inner border border-slate-100 flex flex-col justify-center items-center w-28 h-28">
              <span className="text-sm font-black text-slate-900 leading-none">{formatCurrency(data.totalRevenue)}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 leading-none">Sales Base</span>
            </div>

            {/* Premium Legend card side layout */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
              {categoryData.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}></span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-800 font-bold leading-tight">{c.name}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{((c.value / totalForPct) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Map + Top 10 Products ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* World Map */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Geographic Sales Map</h2>
            <p className="text-[10px] text-slate-400 font-medium">Global density of customer transactions</p>
          </div>
          <div className="h-64 mt-4 w-full">
            <WorldMap />
          </div>
        </div>

        {/* Top 10 Products Horizontal Bar */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Top 10 Products by Sales</h2>
            <p className="text-[10px] text-slate-400 font-medium">Highest grossing catalog items</p>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 9, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── KEY INSIGHTS FOOTER ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Sales growth momentum", desc: "Enterprise Sales up by 12.4% YoY", value: "12.4%", isUp: true, color: "from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-100" },
          { label: "Operating cost impact", desc: "Kâr marjı son dönem maliyetleri nedeniyle -3.2% azaldı", value: "-3.2%", isUp: false, color: "from-rose-500/10 to-orange-500/5 text-rose-600 border-rose-100" },
          { label: "Repeat customer loyalty", desc: "Sadık müşteri kitlesi ciro tabanını güçlendiriyor", value: "61.3%", isUp: true, color: "from-indigo-500/10 to-purple-500/5 text-indigo-600 border-indigo-100" },
          { label: "Dynamic next-month forecast", desc: "Tahmin motoru büyümenin devam edeceğini öngörüyor", value: "$2.71M", isUp: true, color: "from-amber-500/10 to-yellow-500/5 text-amber-600 border-amber-100" }
        ].map((insight, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${insight.color} border rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-transform`}>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              {insight.isUp ? (
                <ArrowUpRight size={20} className={insight.isUp ? 'text-emerald-500' : 'text-rose-500'} />
              ) : (
                <ArrowDownRight size={20} className="text-rose-500" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">{insight.label}</p>
              <p className="text-2xl font-black tracking-tight mt-1">{insight.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-medium">{insight.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
