const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/AdventureWorksJson.json');
const outputPath = path.join(__dirname, '../data/aggregated.json');

console.log('Reading data from:', inputPath);
let rawData;
try {
  rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (error) {
  console.error("Error reading JSON file:", error);
  process.exit(1);
}

console.log(`Processing ${rawData.length} rows...`);

const summary = {
  totalRevenue: 0,
  totalProfit: 0,
  totalOrders: new Set(),
  totalCustomers: new Set(),
  totalProductsSold: 0,
  monthlySales: {}, // { "2017-07": { revenue: 0, profit: 0 } }
  territorySales: {}, // { "Canada": { revenue: 0, profit: 0 } }
  channelSales: { Internet: { revenue: 0, profit: 0 }, Reseller: { revenue: 0, profit: 0 } },
  customerStats: {}, // { CustomerKey: { recency: date, frequency: count, monetary: sum } }
  categorySales: {},
  latestDate: "2000-01-01"
};

for (const row of rawData) {
  // Parsing dates
  const dateStr = row.OrderDate.substring(0, 10);
  if (dateStr > summary.latestDate) {
    summary.latestDate = dateStr;
  }
  const monthKey = dateStr.substring(0, 7); // YYYY-MM
  
  const revenue = row.Sales_Amount || 0;
  const cost = row.Total_Product_Cost || 0;
  const profit = revenue - cost;
  
  summary.totalRevenue += revenue;
  summary.totalProfit += profit;
  if (row.Sales_Order) summary.totalOrders.add(row.Sales_Order);
  if (row.CustomerKey) summary.totalCustomers.add(row.CustomerKey);
  summary.totalProductsSold += row.Order_Quantity || 0;
  
  // Monthly Sales
  if (!summary.monthlySales[monthKey]) {
    summary.monthlySales[monthKey] = { revenue: 0, profit: 0 };
  }
  summary.monthlySales[monthKey].revenue += revenue;
  summary.monthlySales[monthKey].profit += profit;
  
  // Territory Sales
  const territory = row.Region || "Unknown";
  if (!summary.territorySales[territory]) {
    summary.territorySales[territory] = { revenue: 0, profit: 0 };
  }
  summary.territorySales[territory].revenue += revenue;
  summary.territorySales[territory].profit += profit;
  
  // Channel Sales
  const channel = row.Channel || "Unknown";
  if (!summary.channelSales[channel]) {
    summary.channelSales[channel] = { revenue: 0, profit: 0 };
  }
  summary.channelSales[channel].revenue += revenue;
  summary.channelSales[channel].profit += profit;

  // Category Sales
  const category = row.Category || "Unknown";
  if (!summary.categorySales[category]) {
    summary.categorySales[category] = { revenue: 0, profit: 0 };
  }
  summary.categorySales[category].revenue += revenue;
  summary.categorySales[category].profit += profit;

  // Customer RFM
  if (row.CustomerKey) {
    if (!summary.customerStats[row.CustomerKey]) {
      summary.customerStats[row.CustomerKey] = {
        name: row.Customer || "Unknown",
        orders: new Set(),
        revenue: 0,
        lastOrderDate: dateStr
      };
    }
    const c = summary.customerStats[row.CustomerKey];
    if (row.Sales_Order) c.orders.add(row.Sales_Order);
    c.revenue += revenue;
    if (dateStr > c.lastOrderDate) c.lastOrderDate = dateStr;
  }
}

// Convert Sets to counts for final JSON
const finalSummary = {
  totalRevenue: summary.totalRevenue,
  totalProfit: summary.totalProfit,
  margin: summary.totalRevenue ? (summary.totalProfit / summary.totalRevenue) * 100 : 0,
  uniqueOrders: summary.totalOrders.size,
  uniqueCustomers: summary.totalCustomers.size,
  avgOrderValue: summary.totalOrders.size ? summary.totalRevenue / summary.totalOrders.size : 0,
  monthlySales: Object.entries(summary.monthlySales).map(([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month)),
  territorySales: Object.entries(summary.territorySales).map(([territory, data]) => ({ territory, ...data })).sort((a,b) => b.revenue - a.revenue),
  channelSales: summary.channelSales,
  categorySales: Object.entries(summary.categorySales).map(([category, data]) => ({ category, ...data })).sort((a,b) => b.revenue - a.revenue),
  latestDate: summary.latestDate
};

// Calculate basic RFM Segments
const latestDateObj = new Date(summary.latestDate);
const rfmSegments = {
  "Champions": 0,
  "Loyal": 0,
  "At Risk": 0,
  "New": 0,
  "Lost": 0
};

let repeatCustomers = 0;
const topCustomers = [];

for (const [key, c] of Object.entries(summary.customerStats)) {
  const orderCount = c.orders.size;
  if (orderCount > 1) repeatCustomers++;
  
  const lastDate = new Date(c.lastOrderDate);
  const diffDays = Math.floor((latestDateObj - lastDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30 && orderCount > 3) rfmSegments["Champions"]++;
  else if (diffDays <= 90 && orderCount > 1) rfmSegments["Loyal"]++;
  else if (diffDays <= 30 && orderCount === 1) rfmSegments["New"]++;
  else if (diffDays > 90 && diffDays <= 180) rfmSegments["At Risk"]++;
  else rfmSegments["Lost"]++;
  
  topCustomers.push({
    name: c.name,
    orders: orderCount,
    revenue: c.revenue,
    lastOrderDate: c.lastOrderDate
  });
}

// Top 10 Customers
topCustomers.sort((a, b) => b.revenue - a.revenue);
finalSummary.topCustomers = topCustomers.slice(0, 10);
finalSummary.rfmSegments = Object.entries(rfmSegments).map(([segment, count]) => ({ segment, count }));
finalSummary.repeatPurchaseRate = finalSummary.uniqueCustomers ? (repeatCustomers / finalSummary.uniqueCustomers) * 100 : 0;

// Basic Forecasting (Moving average of last 3 months applied to next 3 months)
const months = finalSummary.monthlySales;
if (months.length >= 3) {
  const last3 = months.slice(-3);
  const avgRev = last3.reduce((sum, m) => sum + m.revenue, 0) / 3;
  const avgProf = last3.reduce((sum, m) => sum + m.profit, 0) / 3;
  
  // Forecast next 3 months
  const forecasts = [];
  let d = new Date(summary.latestDate);
  for (let i = 1; i <= 3; i++) {
    d.setMonth(d.getMonth() + 1);
    const mStr = d.toISOString().substring(0, 7);
    // Add a slight random trend +/- 5%
    const trend = 1 + (Math.random() * 0.1 - 0.05);
    forecasts.push({
      month: mStr,
      revenue: avgRev * trend,
      profit: avgProf * trend
    });
  }
  finalSummary.forecast = forecasts;
}

fs.writeFileSync(outputPath, JSON.stringify(finalSummary, null, 2));
console.log('Successfully wrote aggregated data to:', outputPath);
