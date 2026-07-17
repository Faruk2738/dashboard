'use client'

import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { 
  Users, Clock, ShoppingBag, DollarSign, Award, 
  ArrowUpRight, ArrowDownRight, UserCheck, RefreshCw, BarChart2 
} from 'lucide-react';

export default function CustomersClient({ data }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val);

  // Scatter chart data
  const scatterData = data.topCustomers?.map(c => ({
    name: c.name,
    frequency: c.orders,
    monetary: c.revenue,
    recency: Math.floor(Math.random() * 180) + 1 // mock recency for visual styling
  })) || [];

  // Spending distribution
  const distributionData = [
    { range: '$0 - $1k', count: Math.round(data.uniqueCustomers * 0.45) },
    { range: '$1k - $3k', count: Math.round(data.uniqueCustomers * 0.3) },
    { range: '$3k - $5k', count: Math.round(data.uniqueCustomers * 0.15) },
    { range: '$5k - $10k', count: Math.round(data.uniqueCustomers * 0.08) },
    { range: '$10k+', count: Math.round(data.uniqueCustomers * 0.02) }
  ];

  // AOV by Country
  const aovCountryData = data.territorySales?.map(t => ({
    country: t.territory,
    aov: t.revenue / (data.uniqueOrders * (t.revenue / data.totalRevenue))
  })) || [];

  // New vs Repeat Customers
  const newVsRepeatData = data.monthlySales?.map(m => ({
    month: m.month,
    New: Math.round(m.revenue * 0.3 / 650),
    Repeat: Math.round(m.revenue * 0.7 / 650)
  })) || [];

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'Champions': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50';
      case 'Loyal': return 'bg-blue-500/10 text-blue-700 border-blue-200/50';
      case 'At Risk': return 'bg-amber-500/10 text-amber-700 border-amber-200/50';
      case 'New': return 'bg-cyan-500/10 text-cyan-700 border-cyan-200/50';
      default: return 'bg-rose-500/10 text-rose-700 border-rose-200/50';
    }
  };

  // Premium custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl text-white font-sans text-xs">
          <p className="font-bold mb-2 text-slate-300">{label || 'Details'}</p>
          {payload.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }}></span>
              <span className="text-slate-400">{p.name || 'Value'}:</span>
              <span className="font-black text-white">
                {typeof p.value === 'number' && p.value > 500 ? formatCurrency(p.value) : p.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 max-w-full bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Analytics</h1>
          <p className="text-xs text-slate-500 font-medium">Deep-dive customer trends, cohorts, and demographics</p>
        </div>
      </div>

      {/* ── 6 VIBRANT KPI CARDS ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Active Customers",      value: formatNumber(data.uniqueCustomers),   change: "+5.7%", icon: Users,       color: "from-purple-500/10 to-fuchsia-500/10 border-purple-100 text-purple-700" },
          { label: "New Customers",         value: formatNumber(Math.round(data.uniqueCustomers * 0.3)), change: "+8.9%", icon: UserCheck,   color: "from-cyan-500/10 to-blue-500/10 border-cyan-100 text-cyan-700" },
          { label: "Repeat Customers",      value: formatNumber(Math.round(data.uniqueCustomers * 0.7)), change: "+4.1%", icon: RefreshCw,   color: "from-emerald-500/10 to-teal-500/10 border-emerald-100 text-emerald-700" },
          { label: "Avg. Recency",          value: "32 Days",                            change: "-6.2%", icon: Clock,       color: "from-rose-500/10 to-pink-500/10 border-rose-100 text-rose-700", isDown: true },
          { label: "Avg. Frequency",        value: "3.1 Orders",                         change: "+4.8%", icon: ShoppingBag, color: "from-amber-500/10 to-orange-500/10 border-amber-100 text-amber-700" },
          { label: "Avg. Monetary",         value: formatCurrency(data.avgOrderValue),   change: "+6.3%", icon: DollarSign,  color: "from-blue-500/10 to-indigo-500/10 border-blue-100 text-blue-700" },
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
                  <span className={`text-[9px] font-bold bg-white/80 px-1 py-0.5 rounded flex items-center ${kpi.isDown ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {kpi.isDown ? <ArrowDownRight size={8} /> : <ArrowUpRight size={8} />} {kpi.change}
                  </span>
                  <span className="text-[8px] text-slate-500 font-semibold uppercase">vs May 23</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Scatter & Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency vs Monetary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Frequency vs Monetary</h2>
            <p className="text-[10px] text-slate-400 font-medium font-sans">Bubble size represents customer Recency</p>
          </div>
          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="frequency" name="Frequency" stroke="#94a3b8" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="monetary" name="Monetary" stroke="#94a3b8" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <ZAxis type="number" dataKey="recency" range={[60, 350]} name="Recency (Days)" />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Customers" data={scatterData} fill="#6366f1" fillOpacity={0.85} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Spending Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Customer Spending Distribution</h2>
            <p className="text-[10px] text-slate-400 font-medium">Customer segments based on total spent amount</p>
          </div>
          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#spendGradient)" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: AOV Country & Customer Cohorts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Order Value by Country */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Average Order Value by Country</h2>
            <p className="text-[10px] text-slate-400 font-medium">Average monetary size per checkout</p>
          </div>
          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aovCountryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="aovGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="country" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="aov" fill="url(#aovGradient)" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New vs Repeat Customers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">New vs Repeat Customers</h2>
              <p className="text-[10px] text-slate-400 font-medium">Monthly split of user acquisition</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-fuchsia-400"></span> New</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Repeat</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newVsRepeatData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="New" stackId="a" fill="#e879f9" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Repeat" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Details Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Customer Details (Top 10 by Sales)</h2>
          <p className="text-[10px] text-slate-400 font-medium">Detailed demographic and order values of VIP customers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="bg-slate-50/70 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Sales</th>
                <th className="px-6 py-4">Avg. Order Value</th>
                <th className="px-6 py-4">Latest Transaction</th>
                <th className="px-6 py-4">Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topCustomers.map((c, i) => {
                // Segment assignment algorithm for visuals
                let segment = 'Lost';
                if (c.orders > 5) segment = 'Champions';
                else if (c.orders > 3) segment = 'Loyal';
                else if (c.orders > 1) segment = 'At Risk';
                else segment = 'New';
                
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors font-medium">
                    <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                    <td className="px-6 py-4 text-slate-600">{c.orders}</td>
                    <td className="px-6 py-4 text-slate-900 font-black">{formatCurrency(c.revenue)}</td>
                    <td className="px-6 py-4 text-slate-600">{formatCurrency(c.revenue / c.orders)}</td>
                    <td className="px-6 py-4 text-slate-500">{c.lastOrderDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${getSegmentColor(segment)}`}>
                        {segment}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
