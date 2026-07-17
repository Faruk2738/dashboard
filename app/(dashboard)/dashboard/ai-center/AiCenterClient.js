'use client'

import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Target, AlertTriangle, TrendingUp, DollarSign, ArrowRight, Award, Zap, Sparkles } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981'];

export default function AiCenterClient({ data }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val);

  // Donut chart: Segment - Campaign Target
  const campaignTargetData = [
    { name: 'At Risk', value: 30.5 },
    { name: 'Potential Loyalists', value: 25.0 },
    { name: 'Lost Customers', value: 20.0 },
    { name: 'Loyal Customers', value: 15.0 },
    { name: 'Champions', value: 9.5 }
  ];

  // Bar chart: Response Prediction (Uplift %)
  const responsePredictionData = [
    { name: 'At Risk', value: 18.7, fill: '#ef4444' },
    { name: 'Potential Loyalists', value: 14.2, fill: '#f97316' },
    { name: 'Lost Customers', value: 11.9, fill: '#f59e0b' },
    { name: 'Loyal Customers', value: 8.7, fill: '#3b82f6' },
    { name: 'Champions', value: 6.3, fill: '#10b981' }
  ];

  const campaignStrategies = [
    { segment: "At Risk Customers", action: "Send 20% OFF coupon", icon: Zap, color: "text-amber-500 bg-amber-50" },
    { segment: "Loyal Customers", action: "Invite to VIP Early Access", icon: Award, color: "text-blue-500 bg-blue-50" },
    { segment: "Lost Customers", action: "Win-back email bundle promo", icon: Sparkles, color: "text-rose-500 bg-rose-50" }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">AI Campaign Center</h1>
        <p className="text-gray-500 mt-1">Design target marketing campaigns using predictive models and secure AI</p>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Left Column Cyclist Banner */}
        <div className="lg:col-span-1 rounded-3xl overflow-hidden relative min-h-[400px] flex flex-col justify-end p-8 text-white shadow-xl group border border-slate-800">
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
            <button className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
              SHOP NOW <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Columns Area */}
        <div className="lg:col-span-3 space-y-8 flex flex-col justify-between">
          {/* Top KPI Cards (4 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customers At Risk</span>
              </div>
              <h4 className="text-2xl font-black mt-2 text-rose-600">3,087</h4>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-orange-500">
                <DollarSign size={16} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Targeted Revenue</span>
              </div>
              <h4 className="text-2xl font-black mt-2 text-orange-600">$142,500</h4>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-emerald-500">
                <TrendingUp size={16} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Est. Conversion</span>
              </div>
              <h4 className="text-2xl font-black mt-2 text-emerald-600">14.2%</h4>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-blue-500">
                <Target size={16} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Campaigns</span>
              </div>
              <h4 className="text-2xl font-black mt-2 text-blue-600">3 Campaigns</h4>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Campaign Target Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Targeting Share by RFM</h3>
              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={campaignTargetData}
                      cx="40%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {campaignTargetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend on the right side */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  {campaignTargetData.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap">
                        {c.name} <span className="text-gray-400">{c.value}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Campaign Uplift prediction */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Uplift Prediction (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responsePredictionData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Top Products to Recommend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Road-250 Red, 52', 'Mountain-200 Black, 46', 'Touring-1000 Blue, 60', 'Road-150 Red, 48'].map((prod, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-gray-150 flex flex-col items-center justify-between text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-3">🚲</div>
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">{prod}</span>
                  <span className="text-[10px] text-emerald-500 font-bold mt-1">Recommended</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Area: Target List & Campaign Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer List Sample */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
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
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">William Brown</td>
                      <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">At Risk</span></td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-950">$1,250</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">Patricia Smith</td>
                      <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Loyal</span></td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-950">$980</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">Linda Garcia</td>
                      <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Potential</span></td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-950">$760</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campaign Strategies List */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Recommended AI Campaign Tactics</h3>
                <div className="space-y-4">
                  {campaignStrategies.map((strat, i) => {
                    const IconComp = strat.icon;
                    return (
                      <div key={i} className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className={`p-2 rounded-lg ${strat.color}`}>
                          <IconComp size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{strat.segment}</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{strat.action}</p>
                        </div>
                      </div>
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
    </div>
  );
}
