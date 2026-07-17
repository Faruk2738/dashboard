'use client'

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, ScatterChart, Scatter, LabelList, Cell
} from 'recharts';

export default function SalesClient({ data }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-US').format(val);

  // Monthly trends
  const trendData = data.monthlySales || [];

  // Category vs Subcategory horizontal bar data (structured mock based on actual stats)
  const categorySubData = [
    { name: 'Road Bikes', sales: 8200000, category: 'Bikes' },
    { name: 'Mountain Bikes', sales: 6200000, category: 'Bikes' },
    { name: 'Touring Bikes', sales: 2000000, category: 'Bikes' },
    { name: 'Tires and Tubes', sales: 1400000, category: 'Accessories' },
    { name: 'Jerseys', sales: 1100000, category: 'Clothing' },
    { name: 'Bottles & Cages', sales: 800000, category: 'Accessories' },
    { name: 'Forks', sales: 700000, category: 'Components' },
    { name: 'Helmets', sales: 600000, category: 'Accessories' },
    { name: 'Shorts', sales: 500000, category: 'Clothing' }
  ];

  // Scatter data: Discount % vs Sales
  const discountSalesData = [
    { discount: 0, sales: 2800000 },
    { discount: 10, sales: 2200000 },
    { discount: 15, sales: 1800000 },
    { discount: 20, sales: 1500000 },
    { discount: 30, sales: 900000 }
  ];

  // Scatter data: Price vs Quantity
  const priceQtyData = [
    { price: 3578, qty: 1800 },
    { price: 2443, qty: 2500 },
    { price: 1000, qty: 4500 },
    { price: 120, qty: 8500 },
    { price: 35, qty: 11500 }
  ];

  // Waterfall Chart data (mock representation of conversion)
  const waterfallData = [
    { name: 'Total Sales', amount: 24900000, fill: '#10b981' },
    { name: 'Discounts', amount: -3250000, fill: '#ef4444' },
    { name: 'Product Cost', amount: -11240000, fill: '#ef4444' },
    { name: 'Gross Profit', amount: 10410000, fill: '#10b981' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Sales Performance</h1>
          <p className="text-gray-500 mt-1">Detailed analysis of revenue streams, profit margins, and discounts</p>
        </div>
      </header>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales</span>
          <h4 className="text-2xl font-black mt-2 text-gray-900">{formatCurrency(data.totalRevenue)}</h4>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1">▲ +12.4% vs May 23</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Profit</span>
          <h4 className="text-2xl font-black mt-2 text-gray-900">{formatCurrency(data.totalProfit)}</h4>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1">▲ +8.7% vs May 23</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profit Margin</span>
          <h4 className="text-2xl font-black mt-2 text-gray-900">{data.margin.toFixed(1)}%</h4>
          <span className="text-[10px] text-rose-500 font-semibold mt-1">▼ -2.6pp vs May 23</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity Sold</span>
          <h4 className="text-2xl font-black mt-2 text-gray-900">266K</h4>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1">▲ +5.6% vs May 23</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Discount</span>
          <h4 className="text-2xl font-black mt-2 text-gray-900">12.6%</h4>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1">▲ +1.2pp vs May 23</span>
        </div>
      </div>

      {/* Row 2: Monthly Trends & Category Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Sales & Monthly Profit Trends</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `$${v/1000000}M`} stroke="#94a3b8" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Sales" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 font-sans">Sales by Category & Subcategory</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySubData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(v) => `$${v/1000000}M`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="sales" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Scatters & Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Discount % vs Sales</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="discount" name="Discount" unit="%" />
                <YAxis type="number" dataKey="sales" name="Sales" tickFormatter={(v) => `$${v/1000000}M`} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Discount/Sales Link" data={discountSalesData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Price vs Quantity</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="price" name="Price" unit="$" />
                <YAxis type="number" dataKey="qty" name="Quantity" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Elasticity" data={priceQtyData} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sales Waterfall (Revenue to Profit)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${v/1000000}M`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 10 Products by Profit Split Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Top 10 Products by Profit</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Sales</th>
                  <th className="px-4 py-3 text-emerald-600">Profit</th>
                  <th className="px-4 py-3">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">Road-250 Red, 52</td>
                  <td className="px-4 py-3">$1.36M</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">$0.62M</td>
                  <td className="px-4 py-3">45.7%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">Mountain-200 Black, 46</td>
                  <td className="px-4 py-3">$1.14M</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">$0.51M</td>
                  <td className="px-4 py-3">44.7%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">Road-250 Black, 52</td>
                  <td className="px-4 py-3">$1.10M</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">$0.49M</td>
                  <td className="px-4 py-3">44.5%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Sales</th>
                  <th className="px-4 py-3 text-emerald-600">Profit</th>
                  <th className="px-4 py-3">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">Road-150 Red, 48</td>
                  <td className="px-4 py-3">$0.73M</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">$0.33M</td>
                  <td className="px-4 py-3">45.2%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">Road-150 Black, 48</td>
                  <td className="px-4 py-3">$0.64M</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">$0.28M</td>
                  <td className="px-4 py-3">43.6%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">Mountain-100 Silver, 38</td>
                  <td className="px-4 py-3">$0.58M</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">$0.24M</td>
                  <td className="px-4 py-3">41.9%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
