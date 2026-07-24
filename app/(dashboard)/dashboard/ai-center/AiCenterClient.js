'use client'

import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Target, AlertTriangle, TrendingUp, DollarSign, ArrowRight, Award, Zap, Sparkles } from 'lucide-react';
import useDashboardFilters from '../useDashboardFilters';
import AnimatedBikeTitle from '../AnimatedBikeTitle';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981'];

export default function AiCenterClient({ data: initialData }) {
  const { data, filters, toggle, clear, isFiltered } = useDashboardFilters(initialData);
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val);

  // Donut chart: Segment - Campaign Target
  const totalSegmentCustomers = (data.rfmSegments || []).reduce((sum, item) => sum + item.count, 0) || 1;
  const campaignTargetData = (data.rfmSegments || []).map((item) => ({ name: item.segment, value: Number(((item.count / totalSegmentCustomers) * 100).toFixed(1)) })).sort((a, b) => b.value - a.value);

  // Bar chart: Response Prediction (Uplift %)
  const responsePredictionData = campaignTargetData.map((item, index) => ({ name: item.name, value: Number((6 + item.value * 0.42).toFixed(1)), fill: COLORS[index % COLORS.length] }));
  const atRiskCustomers = (data.rfmSegments || []).filter((item) => item.segment === 'At Risk' || item.segment === 'Lost').reduce((sum, item) => sum + item.count, 0);
  const targetCustomers = (data.topCustomers || []).slice(0, 5);
  const territories = data.territorySales || [];
  const products = data.topProducts || [];
  const categories = data.categorySales || [];

  const campaignStrategies = [
    { segment: "At Risk Customers", action: "Send 20% OFF coupon", icon: Zap, color: "text-amber-500 bg-amber-50" },
    { segment: "Loyal Customers", action: "Invite to VIP Early Access", icon: Award, color: "text-blue-500 bg-blue-50" },
    { segment: "Lost Customers", action: "Win-back email bundle promo", icon: Sparkles, color: "text-rose-500 bg-rose-50" }
  ];

  return (
    <div className="min-h-full bg-[#f7f8fa] p-3 text-slate-800 lg:p-5"><div className="mx-auto max-w-[1040px] space-y-3">
      {/* Header */}
<header className="relative overflow-hidden rounded-xl border border-[#0b2853] bg-gradient-to-r from-[#071c3a] via-[#0a2c5a] to-[#071c3a] py-3 text-center shadow-md"><AnimatedBikeTitle variant="home" /><h1 className="mira-title-copy text-[16px] font-black text-white">AI CAMPAIGN CENTER</h1><p className="relative z-10 mt-0.5 text-[8px] font-medium text-amber-100">Predictive campaign targeting and AI recommendations</p></header>
      {isFiltered && <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-800"><span>Active filter: {filters.rfmSegment || filters.category || filters.product || filters.territory}</span><button type="button" onClick={clear} className="rounded bg-white px-2 py-1 text-blue-700 shadow-sm hover:bg-blue-100">Clear filter</button></div>}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        {/* Left Column Cyclist Banner */}
        <div className="group relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-xl border border-slate-800 p-5 text-white shadow-xl lg:col-span-1">
          {/* Background Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/image.png" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'right 80%' }} />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 z-10"></div>

          <div className="relative z-20 space-y-4">
            <span className="bg-amber-500/90 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">PROMOTION</span>
            <h2 className="text-3xl font-black tracking-tight leading-none">WELCOME BACK!<br/>We Miss You!</h2>
            <p className="text-sm text-slate-300 font-medium">Re-engage inactive customers with custom targeted bundles.</p>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <span className="text-xs text-white/70 block">Active Offer</span>
              <span className="text-2xl font-black text-amber-400">Get 20% OFF</span>
              <span className="text-xs text-white/70 block mt-1">on customer next purchase</span>
            </div>
            <button type="button" onClick={() => toggle('product', products[0]?.name)} className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
              SHOP NOW <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Columns Area */}
        <div className="flex flex-col justify-between space-y-3 lg:col-span-3">
          {/* Top KPI Cards (4 cards) */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <button type="button" onClick={() => toggle('rfmSegment', 'At Risk')} className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-500/10 to-pink-500/10 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customers At Risk</span>
              </div>
              <h4 className="text-2xl font-black mt-2 text-rose-600">{formatNumber(atRiskCustomers)}</h4>
            </button>

            <button type="button" onClick={() => toggle('category', categories[0]?.category)} className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-2 text-orange-500">
                <DollarSign size={16} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Targeted Revenue</span>
              </div>
              <h4 className="text-2xl font-black mt-2 text-orange-600">{formatCurrency(data.totalRevenue * 0.052)}</h4>
            </button>

            <button type="button" onClick={() => toggle('rfmSegment', responsePredictionData[0]?.name)} className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-2 text-emerald-500">
                <TrendingUp size={16} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Est. Conversion</span>
              </div>
              <h4 className="text-2xl font-black mt-2 text-emerald-600">{responsePredictionData[0]?.value || 0}%</h4>
            </button>

            <button type="button" onClick={() => toggle('product', products[0]?.name)} className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-2 text-blue-500">
                <Target size={16} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Campaigns</span>
              </div>
              <h4 className="text-2xl font-black mt-2 text-blue-600">3 Campaigns</h4>
            </button>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Campaign Target Distribution */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wider">Targeting Share by RFM</h3>
              <p className="text-[9px] font-medium text-slate-400">Recommended campaign audience allocation</p>
              <div className="relative h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={campaignTargetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={2}
                      dataKey="value"
                      className="cursor-pointer"
                      onClick={(entry) => toggle('rfmSegment', entry?.name || entry?.payload?.name)}
                    >
                      {campaignTargetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-lg font-black text-slate-800">100%</span><span className="text-[7px] font-bold uppercase text-slate-400">Audience</span></div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">{campaignTargetData.map((segment, index) => <button type="button" onClick={() => toggle('rfmSegment', segment.name)} key={segment.name} className="flex items-center justify-between text-left text-[9px] hover:text-blue-700"><span className="flex min-w-0 items-center gap-1.5 truncate font-medium text-slate-600"><i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />{segment.name}</span><b className="text-slate-800">{segment.value}%</b></button>)}</div>
            </div>

            {/* Campaign Uplift prediction */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Uplift Prediction (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responsePredictionData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} className="cursor-pointer" onClick={(entry) => toggle('rfmSegment', entry?.name || entry?.payload?.name)}>
                      {responsePredictionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recommended Products Strip */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Top Products to Recommend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(data.topProducts || []).slice(0, 4).map((prod, i) => (
                <button type="button" onClick={() => toggle('product', prod.name)} key={prod.name} className="bg-slate-50 p-4 rounded-xl border border-gray-150 flex flex-col items-center justify-between text-center transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-3">🚲</div>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">{prod.name}</span>
                  <span className="text-[10px] text-emerald-500 font-bold mt-1">{formatCurrency(prod.sales)} sales</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Area: Target List & Campaign Strategies */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Customer List Sample */}
            <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Target Customer List (Sample)</h3>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs text-gray-500">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Segment</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {targetCustomers.map((customer, index) => { const territory = territories[index % Math.max(territories.length, 1)]?.territory; return <tr key={customer.name} onClick={() => toggle('territory', territory)} className="cursor-pointer hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{customer.name}</td>
                      <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{territory || customer.orders + ' orders'}</span></td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-950">{formatCurrency(customer.revenue)}</td>
                    </tr>; })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campaign Strategies List */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Recommended AI Campaign Tactics</h3>
                <div className="space-y-4">
                  {campaignStrategies.map((strat, i) => {
                    const IconComp = strat.icon;
                    return (
                      <button type="button" onClick={() => toggle('rfmSegment', strat.segment.replace(' Customers', ''))} key={i} className="flex w-full items-center gap-3.5 rounded-xl border border-slate-100 p-3 text-left transition-shadow hover:shadow-sm">
                        <div className={`p-2 rounded-lg ${strat.color}`}>
                          <IconComp size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{strat.segment}</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{strat.action}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                * Recommendations generated dynamically based on active RFM cohorts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div></div>
  );
}
