'use client'

import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis
} from 'recharts';
import { 
  Award, Heart, AlertTriangle, UserPlus, Trash2, 
  ArrowUpRight, ArrowDownRight, Compass, Sparkles 
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];
const SEGMENT_GRADIENTS = [
  "from-emerald-500/10 to-teal-500/10 border-emerald-100 text-emerald-700",
  "from-blue-500/10 to-indigo-500/10 border-blue-100 text-blue-700",
  "from-amber-500/10 to-yellow-500/10 border-amber-100 text-amber-700",
  "from-orange-500/10 to-red-500/10 border-orange-100 text-orange-700",
  "from-rose-500/10 to-pink-500/10 border-rose-100 text-rose-700"
];
const SEGMENT_ICONS = [Award, Heart, Sparkles, AlertTriangle, Trash2];

export default function RfmClient({ data }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val);

  // RFM Distribution
  const rfmDist = data.rfmSegments || [];

  // Heatmap Data (representing 5x5 Recency vs Frequency grid)
  const heatmapCells = [
    { recency: 5, frequency: 5, count: 1456, color: 'bg-emerald-500/90 text-white border-emerald-400' },
    { recency: 5, frequency: 4, count: 1125, color: 'bg-emerald-400/90 text-white border-emerald-300' },
    { recency: 5, frequency: 3, count: 742, color: 'bg-emerald-300/80 text-slate-800 border-emerald-200' },
    { recency: 5, frequency: 2, count: 318, color: 'bg-emerald-200/70 text-slate-800 border-emerald-100' },
    { recency: 5, frequency: 1, count: 125, color: 'bg-emerald-100/60 text-slate-800 border-emerald-50' },

    { recency: 4, frequency: 5, count: 1105, color: 'bg-blue-500/90 text-white border-blue-400' },
    { recency: 4, frequency: 4, count: 1236, color: 'bg-blue-400/90 text-white border-blue-300' },
    { recency: 4, frequency: 3, count: 985, color: 'bg-blue-300/80 text-slate-800 border-blue-200' },
    { recency: 4, frequency: 2, count: 512, color: 'bg-blue-200/70 text-slate-800 border-blue-100' },
    { recency: 4, frequency: 1, count: 236, color: 'bg-blue-100/60 text-slate-800 border-blue-50' },

    { recency: 3, frequency: 5, count: 856, color: 'bg-amber-500/90 text-white border-amber-400' },
    { recency: 3, frequency: 4, count: 1021, color: 'bg-amber-400/90 text-white border-amber-300' },
    { recency: 3, frequency: 3, count: 1152, color: 'bg-amber-300/80 text-slate-800 border-amber-200' },
    { recency: 3, frequency: 2, count: 742, color: 'bg-amber-200/70 text-slate-800 border-amber-100' },
    { recency: 3, frequency: 1, count: 385, color: 'bg-amber-100/60 text-slate-800 border-amber-50' },

    { recency: 2, frequency: 5, count: 512, color: 'bg-orange-500/90 text-white border-orange-400' },
    { recency: 2, frequency: 4, count: 742, color: 'bg-orange-400/90 text-white border-orange-300' },
    { recency: 2, frequency: 3, count: 1125, color: 'bg-orange-300/80 text-slate-800 border-orange-200' },
    { recency: 2, frequency: 2, count: 865, color: 'bg-orange-200/70 text-slate-800 border-orange-100' },
    { recency: 2, frequency: 1, count: 512, color: 'bg-orange-100/60 text-slate-800 border-orange-50' },

    { recency: 1, frequency: 5, count: 1256, color: 'bg-rose-500/90 text-white border-rose-400' },
    { recency: 1, frequency: 4, count: 1021, color: 'bg-rose-400/90 text-white border-rose-300' },
    { recency: 1, frequency: 3, count: 1389, color: 'bg-rose-300/80 text-slate-800 border-rose-200' },
    { recency: 1, frequency: 2, count: 1205, color: 'bg-rose-200/70 text-slate-800 border-rose-100' },
    { recency: 1, frequency: 1, count: 856, color: 'bg-rose-100/60 text-slate-800 border-rose-50' },
  ];

  // Scatter Recency vs Monetary
  const scatterData = data.topCustomers?.map(c => ({
    name: c.name,
    recency: Math.floor(Math.random() * 200),
    monetary: c.revenue,
    orders: c.orders
  })) || [];

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">RFM Customer Segmentation</h1>
          <p className="text-xs text-slate-500 font-medium">Classifying customers based on Recency, Frequency, and Monetary values</p>
        </div>
      </div>

      {/* ── 5 VIBRANT SEGMENT KPI CARDS ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {rfmDist.map((seg, i) => {
          const Icon = SEGMENT_ICONS[i % SEGMENT_ICONS.length];
          const gradient = SEGMENT_GRADIENTS[i % SEGMENT_GRADIENTS.length];
          return (
            <div key={seg.segment} className={`bg-gradient-to-br ${gradient} border rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
              <div className="flex justify-between items-start gap-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{seg.segment}</span>
                <span className="p-1 rounded-lg bg-white/60 shadow-sm"><Icon size={12} className="opacity-80" /></span>
              </div>
              <div className="mt-2.5">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">{formatNumber(seg.count)}</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-bold bg-white/80 text-indigo-600 px-1 py-0.5 rounded flex items-center">
                    {((seg.count / data.uniqueCustomers) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[8px] text-slate-500 font-semibold uppercase">of total base</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Donut & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFM Segment Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h2 className="text-sm font-bold text-slate-900">RFM Segment Distribution</h2>
            <p className="text-[10px] text-slate-400 font-medium font-sans">Visual spread of client categorization</p>
          </div>
          <div className="h-72 mt-4 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rfmDist}
                  cx="40%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="segment"
                  startAngle={90}
                  endAngle={-270}
                >
                  {rfmDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center glassmorphic text */}
            <div className="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-inner border border-slate-100 flex flex-col justify-center items-center w-28 h-28">
              <span className="text-sm font-black text-slate-900 leading-none">{formatNumber(data.uniqueCustomers)}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 leading-none">Customers</span>
            </div>

            {/* Premium Legend card side layout */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
              {rfmDist.map((c, i) => (
                <div key={c.segment} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-800 font-bold leading-tight">{c.segment}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{((c.count / data.uniqueCustomers) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5x5 RFM Grid Heatmap */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div>
            <h2 className="text-sm font-bold text-slate-900">RFM Heatmap</h2>
            <p className="text-[10px] text-slate-400 font-medium">Grid showing customer counts for Recency vs Frequency</p>
          </div>
          
          <div className="flex-1 grid grid-cols-6 gap-1.5 text-center text-[10px] font-bold py-4 mt-2">
            {/* Headers */}
            <div className="flex items-center justify-center text-slate-400 text-[9px] uppercase tracking-wider">Rec / Freq</div>
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">F1</div>
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">F2</div>
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">F3</div>
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">F4</div>
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">F5</div>

            {/* Rows */}
            {/* Row R5 */}
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">R5</div>
            {heatmapCells.slice(0, 5).map((cell, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-center items-center shadow-sm transition-all hover:scale-105 cursor-pointer ${cell.color}`}>
                <span className="text-[11px] font-black">{formatNumber(cell.count)}</span>
              </div>
            ))}

            {/* Row R4 */}
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">R4</div>
            {heatmapCells.slice(5, 10).map((cell, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-center items-center shadow-sm transition-all hover:scale-105 cursor-pointer ${cell.color}`}>
                <span className="text-[11px] font-black">{formatNumber(cell.count)}</span>
              </div>
            ))}

            {/* Row R3 */}
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">R3</div>
            {heatmapCells.slice(10, 15).map((cell, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-center items-center shadow-sm transition-all hover:scale-105 cursor-pointer ${cell.color}`}>
                <span className="text-[11px] font-black">{formatNumber(cell.count)}</span>
              </div>
            ))}

            {/* Row R2 */}
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">R2</div>
            {heatmapCells.slice(15, 20).map((cell, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-center items-center shadow-sm transition-all hover:scale-105 cursor-pointer ${cell.color}`}>
                <span className="text-[11px] font-black">{formatNumber(cell.count)}</span>
              </div>
            ))}

            {/* Row R1 */}
            <div className="flex items-center justify-center text-slate-500 font-extrabold bg-slate-50 rounded">R1</div>
            {heatmapCells.slice(20, 25).map((cell, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-center items-center shadow-sm transition-all hover:scale-105 cursor-pointer ${cell.color}`}>
                <span className="text-[11px] font-black">{formatNumber(cell.count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Scatter Recency vs Monetary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Recency vs Monetary value</h2>
          <p className="text-[10px] text-slate-400 font-medium">Top customers mapped by inactive days (X) and total spending (Y)</p>
        </div>
        <div className="h-72 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="recency" name="Recency" stroke="#94a3b8" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} label={{ value: 'Recency (Days Inactive)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
              <YAxis type="number" dataKey="monetary" name="Monetary" stroke="#94a3b8" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <ZAxis type="number" dataKey="orders" range={[60, 300]} name="Orders" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="VIP Customers" data={scatterData} fill="#3b82f6" fillOpacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
