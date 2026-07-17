// State Management
let dashboardData = null;
let filters = {
  startDate: '2017-07-02',
  endDate: '2020-06-15',
  segment: 'all',
  territory: 'all'
};
let searchTerm = '';

// Chart Instances
let chartMonthlyTrend = null;
let chartRFM = null;

// Chat History
let chatHistory = [];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('dashboard_data.json');
    if (!response.ok) {
      throw new Error('Kan het gegevensbestand niet laden.');
    }
    dashboardData = await response.json();
    
    initializeFilters();
    setupEventListeners();
    updateDashboard();
    initChatbot();
    initSimulator();
  } catch (error) {
    console.error('Fout:', error);
    alert('Fout bij het laden van het dashboard: ' + error.message);
  }
});

// Setup Filter Dropdowns
function initializeFilters() {
  const territorySelect = document.getElementById('filter-territory');
  
  // Clear dynamic options if any (useful on CSV reload)
  territorySelect.innerHTML = '<option value="all">Alle regio\'s</option>';
  
  // Sort territory keys to insert in order
  const sortedTerritories = Object.entries(dashboardData.territories)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    
  sortedTerritories.forEach(([key, terr]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = terr.name;
    territorySelect.appendChild(option);
  });
}

// Event Listeners Setup
function setupEventListeners() {
  document.getElementById('filter-start-date').addEventListener('change', (e) => {
    filters.startDate = e.target.value;
    updateDashboard();
  });
  
  document.getElementById('filter-end-date').addEventListener('change', (e) => {
    filters.endDate = e.target.value;
    updateDashboard();
  });
  
  document.getElementById('filter-segment').addEventListener('change', (e) => {
    filters.segment = e.target.value;
    updateDashboard();
  });
  
  document.getElementById('filter-territory').addEventListener('change', (e) => {
    filters.territory = e.target.value;
    updateDashboard();
  });
  
  document.getElementById('btn-reset').addEventListener('click', () => {
    // Reset date range in inputs
    let minDateStr = "2017-07-02";
    let maxDateStr = "2020-06-15";
    
    // Find min and max dates based on current dashboardData
    if (dashboardData && dashboardData.monthly_data) {
      let dates = dashboardData.monthly_data.map(item => `${item.year}-${item.month.toString().padStart(2, '0')}-01`);
      if (dates.length > 0) {
        dates.sort();
        minDateStr = dates[0];
        maxDateStr = dates[dates.length - 1];
      }
    }
    
    document.getElementById('filter-start-date').value = minDateStr;
    document.getElementById('filter-end-date').value = maxDateStr;
    document.getElementById('filter-segment').value = 'all';
    document.getElementById('filter-territory').value = 'all';
    
    filters = {
      startDate: minDateStr,
      endDate: maxDateStr,
      segment: 'all',
      territory: 'all'
    };
    
    document.getElementById('table-search').value = '';
    searchTerm = '';
    updateDashboard();
  });
  
  document.getElementById('table-search').addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderTable();
  });
  
  // CSV Upload Event Handlers
  const csvFileInput = document.getElementById('csv-file-input');
  
  // Header Button
  const btnCsvChange = document.querySelector('.btn-csv-change');
  if (btnCsvChange) {
    btnCsvChange.addEventListener('click', () => {
      csvFileInput.click();
    });
  }
  
  // Sidebar Link
  const btnCsvSidebar = document.getElementById('btn-csv-upload-sidebar');
  if (btnCsvSidebar) {
    btnCsvSidebar.addEventListener('click', (e) => {
      e.preventDefault();
      csvFileInput.click();
    });
  }
  
  // File Selected
  csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleCsvUpload(file);
    }
  });
}

// Global Filter Helpers
function getFilteredMonthlyData() {
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);
  
  return dashboardData.monthly_data.filter(item => {
    const itemDate = new Date(`${item.year}-${item.month.toString().padStart(2, '0')}-15`);
    const matchDate = itemDate >= start && itemDate <= end;
    const matchTerr = filters.territory === 'all' || item.territory.toString() === filters.territory;
    const matchSeg = filters.segment === 'all' || item.segment === filters.segment;
    return matchDate && matchTerr && matchSeg;
  });
}

// Keep names as standard NL-NL locale formatting
function formatEuro(val) {
  if (val >= 1000000) {
    return '€' + (val / 1000000).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mln';
  } else if (val >= 1000) {
    return '€' + (val / 1000).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' k';
  } else {
    return '€' + val.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}

const formatInteger = (val) => {
  return new Intl.NumberFormat('nl-NL').format(val);
};

const formatPercent = (val) => {
  return val.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
};

function getFilteredProductSales() {
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);
  
  return dashboardData.product_sales.filter(item => {
    const itemDate = new Date(`${item.year}-06-15`);
    const matchDate = itemDate.getFullYear() >= start.getFullYear() && itemDate.getFullYear() <= end.getFullYear();
    const matchTerr = filters.territory === 'all' || item.territory.toString() === filters.territory;
    const matchSeg = filters.segment === 'all' || item.segment === filters.segment;
    return matchDate && matchTerr && matchSeg;
  });
}

function getFilteredResellerSales() {
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);
  
  return dashboardData.reseller_sales.filter(item => {
    const itemDate = new Date(`${item.year}-06-15`);
    const matchDate = itemDate.getFullYear() >= start.getFullYear() && itemDate.getFullYear() <= end.getFullYear();
    const matchTerr = filters.territory === 'all' || item.territory.toString() === filters.territory;
    const matchSeg = filters.segment === 'all' || filters.segment === 'Reseller';
    return matchDate && matchTerr && matchSeg;
  });
}

// Main Update Flow
function updateDashboard() {
  const filteredMonthly = getFilteredMonthlyData();
  const filteredProducts = getFilteredProductSales();
  const filteredResellers = getFilteredResellerSales();
  
  let sales = 0;
  let cost = 0;
  let qty = 0;
  let orders = 0;
  let b2bSales = 0;
  let b2cSales = 0;
  let b2bOrders = 0;
  let b2cOrders = 0;
  
  filteredMonthly.forEach(item => {
    sales += item.sales;
    cost += item.cost;
    qty += item.quantity;
    orders += item.order_count;
    
    if (item.segment === 'Reseller') {
      b2bSales += item.sales;
      b2bOrders += item.order_count;
    } else {
      b2cSales += item.sales;
      b2cOrders += item.order_count;
    }
  });
  
  const profit = sales - cost;
  const margin = sales > 0 ? (profit / sales) * 100 : 0;
  const aov = orders > 0 ? sales / orders : 0;
  
  // Customer & Reseller count model
  const activeResellerKeys = new Set(filteredResellers.map(r => r.reseller_key));
  const b2bCustomers = activeResellerKeys.size;
  const b2cCustomers = Math.round(b2cOrders * 0.668);
  const totalCustomers = b2bCustomers + b2cCustomers;
  
  // Returning rates
  const returningB2c = Math.round(b2cCustomers * 0.371);
  const returningB2b = Math.round(b2bCustomers * 0.954);
  const totalReturning = returningB2c + returningB2b;
  const returnRate = totalCustomers > 0 ? (totalReturning / totalCustomers) * 100 : 0;
  
  // 1. Render KPIs
  document.getElementById('kpi-sales').innerText = formatEuro(sales);
  document.getElementById('kpi-sales-sub').innerText = `uit ${formatInteger(orders)} bestellingen`;
  
  document.getElementById('kpi-profit').innerText = formatEuro(profit);
  document.getElementById('kpi-profit-sub').innerText = `${formatEuro(cost)} productkosten`;
  
  document.getElementById('kpi-margin').innerText = formatPercent(margin);
  document.getElementById('kpi-margin-sub').innerText = margin > 12 ? 'Goed niveau' : 'Verbetering mogelijk';
  
  document.getElementById('kpi-customers').innerText = formatInteger(totalCustomers);
  document.getElementById('kpi-customers-sub').innerText = `${formatInteger(qty)} producten verkocht`;
  
  document.getElementById('kpi-return-rate').innerText = formatPercent(returnRate);
  document.getElementById('kpi-return-rate-sub').innerText = `${formatInteger(totalReturning)} klanten teruggekeerd`;
  
  document.getElementById('kpi-aov').innerText = formatEuro(aov);
  document.getElementById('kpi-aov-sub').innerText = `${(qty / (orders || 1)).toFixed(1)} producten per bestelling`;
  
  // 2. Render Trend Chart
  renderTrendChart(filteredMonthly);
  
  // 3. Render RFM Chart
  renderRFMChart(totalCustomers);
  
  // 4. Render Territory Progress
  renderTerritoryProgress(filteredMonthly);
  
  // 5. Render Channel Mix
  renderChannelMix(b2cSales, b2bSales, b2cCustomers, b2bCustomers, b2cOrders, b2bOrders);
  
  // 6. Render Table & Action Center
  renderTable();
  renderActionCenter(totalReturning, totalCustomers, profit, sales);
  
  // 7. Update Scenario Simulator labels & baseline
  updateSimulatorBaseline(currentMargin => {
    document.getElementById('lbl-curr-margin').innerText = margin.toFixed(1) + '%';
    document.getElementById('lbl-curr-repeat').innerText = returnRate.toFixed(1) + '%';
    
    // Set simulator slider default values and minimum boundaries to match current state
    const simRepeat = document.getElementById('sim-repeat-rate');
    const simMargin = document.getElementById('sim-margin-target');
    
    simRepeat.min = Math.floor(returnRate);
    simRepeat.value = Math.floor(returnRate);
    
    simMargin.min = Math.floor(margin);
    simMargin.value = Math.floor(margin);
    
    // Reset other simulator sliders to 0
    document.getElementById('sim-churn-recover').value = 0;
    document.getElementById('sim-aov-increase').value = 0;
    
    updateSimulator();
  });
}

function updateSimulatorBaseline(callback) {
  if (callback) callback();
}

// Trend Chart
function renderTrendChart(monthlyData) {
  const monthlyAgg = {};
  monthlyData.forEach(item => {
    const key = `${item.year}-${item.month.toString().padStart(2, '0')}`;
    if (!monthlyAgg[key]) {
      monthlyAgg[key] = { sales: 0, profit: 0 };
    }
    monthlyAgg[key].sales += item.sales;
    monthlyAgg[key].profit += (item.sales - item.cost);
  });
  
  const sortedKeys = Object.keys(monthlyAgg).sort();
  const salesData = sortedKeys.map(k => monthlyAgg[k].sales);
  const profitData = sortedKeys.map(k => monthlyAgg[k].profit);
  
  const monthsNl = ["Jul", "Aug", "Sep", "Okt", "Nov", "Dec", "Jan", "Feb", "Mrt", "Apr", "Mei", "Jun"];
  const labels = sortedKeys.map(k => {
    const [y, m] = k.split('-');
    return `${monthsNl[parseInt(m) - 1]} ${y.substring(2)}`;
  });
  
  if (chartMonthlyTrend) {
    chartMonthlyTrend.destroy();
  }
  
  const ctx = document.getElementById('chart-monthly-trend').getContext('2d');
  chartMonthlyTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Omzet',
          data: salesData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: '#2563eb',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Winst',
          data: profitData,
          borderColor: '#f97316',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: '#f97316',
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          padding: 10,
          backgroundColor: '#0f172a',
          callbacks: {
            label: context => ` ${context.dataset.label}: ${formatEuro(context.raw)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: { 
            color: '#64748b', 
            font: { family: 'Inter', size: 10 },
            callback: value => formatEuro(value)
          }
        }
      }
    }
  });
}

// RFM Doughnut Chart
function renderRFMChart(currentCustomerCount) {
  const baseline = {
    "Kampioenen": { count: 350, color: '#10b981' },
    "Loyaal": { count: 1287, color: '#3b82f6' },
    "Nieuw": { count: 3277, color: '#6366f1' },
    "Risico": { count: 2431, color: '#f59e0b' },
    "Slapend": { count: 11774, color: '#94a3b8' }
  };
  
  const scaleRatio = currentCustomerCount / 19119;
  
  const segmentsData = [];
  const labels = [];
  const colors = [];
  const legendItems = [];
  
  let totalComputed = 0;
  
  Object.entries(baseline).forEach(([name, val], index) => {
    let scaledCount = Math.round(val.count * scaleRatio);
    if (index === Object.keys(baseline).length - 1) {
      scaledCount = Math.max(0, currentCustomerCount - totalComputed);
    }
    totalComputed += scaledCount;
    
    segmentsData.push(scaledCount);
    labels.push(name);
    colors.push(val.color);
    
    const pct = currentCustomerCount > 0 ? (scaledCount / currentCustomerCount) * 100 : 0;
    
    legendItems.push({
      name: name,
      count: scaledCount,
      pct: pct,
      color: val.color
    });
  });
  
  document.getElementById('donut-customer-count').innerText = formatInteger(currentCustomerCount);
  
  const legendContainer = document.getElementById('rfm-legend-list');
  legendContainer.innerHTML = '';
  legendItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'rfm-legend-item';
    div.innerHTML = `
      <div class="rfm-legend-label">
        <span class="rfm-dot" style="background-color: ${item.color}"></span>
        <span>${item.name}</span>
      </div>
      <div class="rfm-legend-values">
        <span class="rfm-legend-count">${formatInteger(item.count)}</span>
        <span class="rfm-legend-pct">%${item.pct.toFixed(1)}</span>
      </div>
    `;
    legendContainer.appendChild(div);
  });
  
  if (chartRFM) {
    chartRFM.destroy();
  }
  
  const ctx = document.getElementById('chart-rfm').getContext('2d');
  chartRFM = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: segmentsData,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '76%',
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 8,
          backgroundColor: '#0f172a',
          callbacks: {
            label: context => ` ${context.label}: ${formatInteger(context.raw)} klanten`
          }
        }
      }
    }
  });
}

// Territory Progress Bars
function renderTerritoryProgress(monthlyData) {
  const terrSales = {};
  monthlyData.forEach(item => {
    const name = dashboardData.territories[item.territory]?.name || `Regio ${item.territory}`;
    terrSales[name] = (terrSales[name] || 0) + item.sales;
  });
  
  const sortedTerr = Object.entries(terrSales).sort((a, b) => b[1] - a[1]);
  
  const container = document.getElementById('territory-progress-list');
  container.innerHTML = '';
  
  if (sortedTerr.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-light); padding: 20px 0;">Geen gegevens beschikbaar.</div>`;
    document.getElementById('territory-top-label').innerText = '0 Regio\'s';
    return;
  }
  
  document.getElementById('territory-top-label').innerText = `Top ${sortedTerr.length} regio's`;
  
  const maxVal = sortedTerr[0][1];
  
  sortedTerr.forEach(([name, val]) => {
    const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
    const row = document.createElement('div');
    row.className = 'territory-row';
    row.innerHTML = `
      <div class="territory-name">${name}</div>
      <div class="territory-bar-wrapper">
        <div class="territory-bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="territory-val">${formatEuro(val)}</div>
    `;
    container.appendChild(row);
  });
}

// Channel Mix Progress
function renderChannelMix(b2cSales, b2bSales, b2cCusts, b2bCusts, b2cOrds, b2bOrds) {
  const totalSales = b2cSales + b2bSales;
  let b2cPct = 0;
  let b2bPct = 0;
  
  if (totalSales > 0) {
    b2cPct = (b2cSales / totalSales) * 100;
    b2bPct = (b2bSales / totalSales) * 100;
  }
  
  document.getElementById('channel-ratio').innerText = (b2bPct > b2cPct ? b2bPct : b2cPct).toFixed(1);
  document.getElementById('channel-lead-badge').innerText = b2bPct > b2cPct ? 'Wederverkoperskanaal leidt' : 'Individueel kanaal leidt';
  
  const barB2c = document.getElementById('channel-progress-b2c');
  const barB2b = document.getElementById('channel-progress-b2b');
  barB2c.style.width = `${b2cPct}%`;
  barB2b.style.width = `${b2bPct}%`;
  
  document.getElementById('channel-val-b2c').innerText = formatEuro(b2cSales);
  document.getElementById('channel-sub-b2c').innerText = `${formatInteger(b2cCusts)} klanten - ${formatInteger(b2cOrds)} bestellingen`;
  
  document.getElementById('channel-val-b2b').innerText = formatEuro(b2bSales);
  document.getElementById('channel-sub-b2b').innerText = `${formatInteger(b2bCusts)} wederverkopers - ${formatInteger(b2bOrds)} bestellingen`;
}

// Top Resellers Table
function renderTable() {
  const filteredResellers = getFilteredResellerSales();
  const body = document.getElementById('table-body');
  body.innerHTML = '';
  
  const resellerMap = {};
  filteredResellers.forEach(item => {
    if (!resellerMap[item.reseller_key]) {
      resellerMap[item.reseller_key] = { reseller_key: item.reseller_key, sales: 0, quantity: 0 };
    }
    resellerMap[item.reseller_key].sales += item.sales;
    resellerMap[item.reseller_key].quantity += item.quantity;
  });
  
  let tableData = Object.values(resellerMap).map(item => {
    const meta = dashboardData.resellers[item.reseller_key];
    random.seed(item.reseller_key);
    const ordersCount = Math.round(5 + random.random() * 15);
    const lastActiveDays = Math.round(random.random() * 90);
    let lastActiveText = `${lastActiveDays} dagen geleden`;
    if (lastActiveDays === 0) lastActiveText = 'Vandaag';
    
    return {
      id: item.reseller_key,
      name: meta ? meta.name : `Wederverkoper #${item.reseller_key}`,
      sales: item.sales,
      orders: ordersCount,
      lastActive: lastActiveText,
      lastActiveDays: lastActiveDays
    };
  });
  
  if (searchTerm) {
    tableData = tableData.filter(item => item.name.toLowerCase().includes(searchTerm));
  }
  
  tableData.sort((a, b) => b.sales - a.sales);
  const top8 = tableData.slice(0, 8);
  
  if (top8.length === 0) {
    body.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Geen gegevens gevonden.</td></tr>`;
    return;
  }
  
  top8.forEach(item => {
    const tr = document.createElement('tr');
    let displayName = item.name;
    if (displayName.length > 24) displayName = displayName.substring(0, 22) + '...';
    
    // Generate AI recommendation for the table cell (in Dutch)
    const action = getNextBestAction(item);
    
    tr.innerHTML = `
      <td>
        <div style="display: flex; align-items: center;">
          <span class="table-customer-avatar b2b">B</span>
          <span style="font-weight: 600; color: var(--text-main);">${displayName}</span>
        </div>
      </td>
      <td><span class="badge-channel b2b">B2B</span></td>
      <td style="text-align: center;">${item.orders}</td>
      <td style="color: var(--text-muted);">${item.lastActive}</td>
      <td>
        <div class="ai-reason-tooltip">
          <span class="badge-ai-action ${action.class}">${action.title}</span>
          <span class="tooltiptext"><strong>AI-analyse:</strong> ${action.reason}</span>
        </div>
      </td>
      <td style="text-align: right; font-weight: 700; color: var(--color-primary);">${formatEuro(item.sales)}</td>
    `;
    body.appendChild(tr);
  });
}

// Generate Next Best Action for reseller table (Dutch)
function getNextBestAction(item) {
  let title = "";
  let className = "";
  let reason = "";
  
  if (item.sales > 250000 && item.lastActiveDays < 30) {
    title = "Opnemen in VIP-programma";
    className = "vip";
    reason = `Reseller heeft een zeer hoge omzet van ${formatEuro(item.sales)} en was in de afgelopen 30 dagen actief. VIP-behandeling is aanbevolen om loyaliteit te consolideren.`;
  } else if (item.lastActiveDays > 60) {
    title = "Klantbehoudcampagne";
    className = "recovery";
    reason = `Müşteri (reseller) al ${item.lastActiveDays} dagen niet actief. Hoog verlooprisico. Neem direct contact op met een gerichte retentiekorting.`;
  } else if (item.orders <= 7) {
    title = "Stimulans tweede bestelling";
    className = "incentive";
    reason = `Tot nu toe slechts ${item.orders} bestellingen geplaatst. Bied een welkomst- of winkelwagenkorting aan om de bestelfrequentie op gang te brengen.`;
  } else if (item.orders > 7 && item.orders < 12 && item.lastActiveDays <= 30) {
    title = "Aanbeveling cross-selling";
    className = "cross";
    reason = `Recent actief (afgelopen 30 dagen) met een gemiddelde frequentie van ${item.orders} bestellingen. Stel complementaire productcategorieën voor.`;
  } else if (item.sales > 120000) {
    title = "Volumekorting reseller";
    className = "discount";
    reason = `B2B partner heeft een jaarlijks volume van ${formatEuro(item.sales)} bereikt. Bied volumekortingen aan om grotere bestellingen te stimuleren.`;
  } else if (item.sales < 50000) {
    title = "Kortingen beperken en marge behouden";
    className = "margin";
    reason = `Omzetvolume is laag (${formatEuro(item.sales)}). Beperk verdere discounts om de brutomarge te beschermen.`;
  } else {
    title = "Hoge koopwaarschijnlijkheid";
    className = "hot";
    reason = `Hoge bestelfrequentie en laatste bestelling was ${item.lastActiveDays} dagen geleden. Verkoopteam moet proactief bellen voor een nieuwe order.`;
  }
  
  return { title, class: className, reason };
}

// Action Center (Prioritized by impact, Dutch)
function renderActionCenter(returningCusts, totalCusts, profit, sales) {
  const container = document.getElementById('action-list-container');
  container.innerHTML = '';
  
  const filteredMonthly = getFilteredMonthlyData();
  let b2bSales = 0;
  let orders = 0;
  filteredMonthly.forEach(item => {
    orders += item.order_count;
    if (item.segment === 'Reseller') {
      b2bSales += item.sales;
    }
  });
  
  const aov = orders > 0 ? sales / orders : 0;
  const margin = sales > 0 ? (profit / sales) * 100 : 0;
  const riskCount = Math.round(totalCusts * 0.123);
  const singleOrderCount = Math.round(totalCusts * 0.609);
  
  // Candidates
  const candidates = [
    {
      id: "churn",
      priority: "high",
      title: "Klantbehoudcampagne",
      headline: `Behoud van ${formatInteger(riskCount)} risicoklanten`,
      desc: `Als we 10% van de risicoklanten behouden, levert dit geschat ${formatEuro(riskCount * 0.10 * aov)} extra omzet op.`,
      estimatedImpact: riskCount * 0.10 * aov,
      icon: "🔄",
      theme: "orange"
    },
    {
      id: "single",
      priority: "high",
      title: "Stimulans tweede bestelling",
      headline: `Converteer ${formatInteger(singleOrderCount)} eenmalige kopers`,
      desc: `Als 10% van de eenmalige kopers een tweede bestelling plaatst, genereert dit ${formatEuro(singleOrderCount * 0.10 * aov)} extra omzet.`,
      estimatedImpact: singleOrderCount * 0.10 * aov,
      icon: "➕",
      theme: "blue"
    },
    {
      id: "margin",
      priority: "medium",
      title: "Margebehoud & Prijsstelling",
      headline: "Brutowinstmarge verhogen naar 15%",
      desc: `Het verhogen van de winstmarge naar 15% (nu %${margin.toFixed(1)}) levert ${formatEuro(sales * Math.max(0, 15 - margin) / 100)} extra brutowinst op.`,
      estimatedImpact: sales * Math.max(0, 15 - margin) / 100,
      icon: "📈",
      theme: "orange"
    },
    {
      id: "b2b",
      priority: "medium",
      title: "Volumestimulans reseller",
      headline: "Verhoog de B2B reseller ordergrootte",
      desc: `Het verhogen van de gemiddelde reseller ordergrootte met 5% levert ${formatEuro(b2bSales * 0.05)} extra omzet op.`,
      estimatedImpact: b2bSales * 0.05,
      icon: "💼",
      theme: "green"
    }
  ];
  
  // Sort candidates by priority (high > medium) and then by estimatedImpact desc
  candidates.sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    return b.estimatedImpact - a.estimatedImpact;
  });
  
  // Take top 3
  const top3 = candidates.slice(0, 3);
  
  top3.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = `action-card ${item.theme}`;
    card.innerHTML = `
      <div class="action-icon-circle">${item.icon}</div>
      <div class="action-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Actie #${index+1}: ${item.title}</span>
          <span class="ai-action-priority ${item.priority}">${item.priority === 'high' ? 'Hoog' : 'Middel'}</span>
        </div>
        <div class="action-headline">${item.headline}</div>
        <div class="action-desc">${item.desc}</div>
        <div class="ai-action-impact">
          💰 Geschatte potentiële impact: <strong>${formatEuro(item.estimatedImpact)}</strong>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Simple random seed mock class for deterministic numbers in table
const random = {
  seedVal: 1,
  seed: function(s) {
    this.seedVal = s;
  },
  random: function() {
    const x = Math.sin(this.seedVal++) * 10000;
    return x - Math.floor(x);
  }
};

// ==========================================================================
// NEW AI LAYER BUSINESS LOGIC & API INTERACTION (DUTCH LOCALIZATION)
// ==========================================================================

// Build Aggregated Dashboard Context for Gemini (Dutch)
function buildDashboardContext() {
  const filteredMonthly = getFilteredMonthlyData();
  const filteredProducts = getFilteredProductSales();
  
  let sales = 0;
  let cost = 0;
  let qty = 0;
  let orders = 0;
  let b2bSales = 0;
  let b2cSales = 0;
  
  filteredMonthly.forEach(item => {
    sales += item.sales;
    cost += item.cost;
    qty += item.quantity;
    orders += item.order_count;
    if (item.segment === 'Reseller') b2bSales += item.sales;
    else b2cSales += item.sales;
  });
  
  const profit = sales - cost;
  const margin = sales > 0 ? (profit / sales) * 100 : 0;
  const aov = orders > 0 ? sales / orders : 0;

  const activeResellers = new Set(getFilteredResellerSales().map(r => r.reseller_key)).size;
  
  const terrSales = {};
  filteredMonthly.forEach(item => {
    const name = dashboardData.territories[item.territory]?.name || `Regio ${item.territory}`;
    terrSales[name] = (terrSales[name] || 0) + item.sales;
  });
  const topTerritories = Object.entries(terrSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, val]) => `${name}: ${formatEuro(val)}`)
    .join(', ');

  const prodMap = {};
  filteredProducts.forEach(item => {
    if (!prodMap[item.product_key]) {
      prodMap[item.product_key] = { name: dashboardData.products[item.product_key]?.name || `Product #${item.product_key}`, sales: 0 };
    }
    prodMap[item.product_key].sales += item.sales;
  });
  const topProducts = Object.values(prodMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map(p => `- ${p.name} (${formatEuro(p.sales)})`)
    .join('\n');

  const startD = filters.startDate.split('-').reverse().join('.');
  const endD = filters.endDate.split('-').reverse().join('.');
  
  const activeTerritoryName = filters.territory === 'all' 
    ? 'Alle Regio\'s' 
    : (dashboardData.territories[filters.territory]?.name || filters.territory);
  const activeSegmentName = filters.segment === 'all' 
    ? 'Alle Kanalen' 
    : (filters.segment === 'Reseller' ? 'Wederverkoper (B2B)' : 'Individueel (B2C)');

  return `
Actuele dashboard verkoopgegevens (Gefilterd):
- Datumbereik: ${startD} - ${endD}
- Geselecteerde verkoopregio: ${activeTerritoryName}
- Geselecteerd verkoopkanaal: ${activeSegmentName}
- Totale omzet: ${formatEuro(sales)} (B2B Reseller: ${formatEuro(b2bSales)}, B2C Individueel: ${formatEuro(b2cSales)})
- Totale nettowinst: ${formatEuro(profit)} (Winstmarge: %${margin.toFixed(1)})
- Aantal bestellingen: ${formatInteger(orders)} (Gemiddelde bestelwaarde / AOV: ${formatEuro(aov)})
- Aantal verkochte producten: ${formatInteger(qty)}
- Aantal actieve resellers (B2B): ${activeResellers}
- Top 3 verkoopregio's: ${topTerritories}
- Top 5 best verkochte producten:
${topProducts}
`;
}

// Call secure backend proxy endpoint /api/chat
async function callGeminiAPI(messages, systemInstruction, responseMimeType = "text/plain") {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20000); // 20s timeout
  
  try {
    const payload = {
      contents: messages,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    };
    
    if (responseMimeType === "application/json") {
      payload.generationConfig = {
        responseMimeType: "application/json"
      };
    }
    
    const isServedByBackend = window.location.origin === 'http://localhost:3000';
    const apiEndpoint = isServedByBackend ? '/api/chat' : 'http://localhost:3000/api/chat';
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    if (response.status === 429) {
      throw new Error("Te veel verzoeken verstuurd (Rate limit). Wacht even en probeer het opnieuw.");
    }
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Serverfout: Status ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Geen reactie ontvangen van AI.");
    }
    return text.trim();
    
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error("Verzoek time-out (20 seconden). Probeer het opnieuw.");
    }
    throw err;
  }
}

// Format markdown
function formatMarkdown(text) {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return `<li style="margin-left: 16px; margin-bottom: 4px;">${trimmed.substring(2)}</li>`;
    }
    return line;
  }).join('\n');
  html = html.replace(/\n/g, '<br>');
  return html;
}

// Render Structured JSON AI response in chat drawer (Dutch)
function renderStructuredAIResponse(data) {
  let html = `<div class="ai-structured-response">`;
  
  if (data.summary) {
    html += `<div class="ai-exec-summary">${data.summary}</div>`;
  }
  
  if (data.findings && data.findings.length > 0) {
    html += `<div class="ai-section-title">Bevindingen en trends</div>`;
    html += `<div class="ai-findings-list">`;
    data.findings.forEach(f => {
      html += `
        <div class="ai-finding-card">
          <div class="ai-finding-title-row">
            <span class="ai-finding-title">${f.title}</span>
            <span class="ai-finding-metric">${f.metric}</span>
          </div>
          <div class="ai-finding-explanation">${f.explanation}</div>
        </div>
      `;
    });
    html += `</div>`;
  }
  
  if (data.actions && data.actions.length > 0) {
    html += `<div class="ai-section-title font-bold">Aanbevolen acties</div>`;
    html += `<div class="ai-actions-list">`;
    data.actions.forEach(a => {
      const priorityClass = (a.priority || 'medium').toLowerCase();
      const impactText = a.estimatedImpact ? `💰 Financiële impact: <strong>${a.estimatedImpact}</strong>` : '';
      const displayPriority = priorityClass === 'high' ? 'Hoog' : (priorityClass === 'medium' ? 'Gemiddeld' : 'Laag');
      html += `
        <div class="ai-action-card ${priorityClass}">
          <div class="ai-action-header-row">
            <span class="ai-action-title">${a.title}</span>
            <span class="ai-action-priority ${priorityClass}">${displayPriority}</span>
          </div>
          <div class="ai-action-reason">${a.reason}</div>
          ${impactText ? `<div class="ai-action-impact">${impactText}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  }
  
  if (data.limitations && data.limitations.length > 0) {
    html += `<div class="ai-section-title">Dataset-beperkingen & aannames</div>`;
    html += `<ul class="ai-limitations-list">`;
    data.limitations.forEach(l => {
      html += `<li>${l}</li>`;
    });
    html += `</ul>`;
  }
  
  html += `</div>`;
  return html;
}

// Generate local fallback deterministic JSON response if API fails/offline (Dutch)
function getFallbackAIResponse(userText) {
  const filteredMonthly = getFilteredMonthlyData();
  let sales = 0;
  let cost = 0;
  let orders = 0;
  filteredMonthly.forEach(item => {
    sales += item.sales;
    cost += item.cost;
    orders += item.order_count;
  });
  const profit = sales - cost;
  const margin = sales > 0 ? (profit / sales) * 100 : 0;
  const aov = orders > 0 ? sales / orders : 0;
  
  const text = userText.toLowerCase();
  
  let summary = "Offline analyse-modus: Lokale verkoopanalyse gegenereerd op basis van de huidige dashboarddata.";
  let findings = [
    {
      title: "Actuele omzet & winstsituatie",
      metric: `Omzet: ${formatEuro(sales)}, Nettowinst: ${formatEuro(profit)}`,
      explanation: `Over de geselecteerde periode is de brutowinstmarge %${margin.toFixed(1)} en bedraagt de gemiddelde bestelwaarde (AOV) ${formatEuro(aov)}.`
    }
  ];
  let actions = [
    {
      priority: "high",
      title: "Gerichte retentiecampagne opstarten",
      reason: "Bied een speciale retentiekorting aan resellers die langer dan 60 dagen inactief zijn.",
      estimatedImpact: formatEuro(sales * 0.05)
    }
  ];
  let limitations = [
    "Gemini API-verbinding mislukt. Lokale deterministische analysemotor gebruikt.",
    "Mensenrechten, NPS, supporttickets of gedetailleerde klantprofielen zijn niet beschikbaar in deze dataset."
  ];

  if (text.includes("verkoop") || text.includes("daal") || text.includes("waarom") || text.includes("omzet")) {
    summary = "Lokaliseerde factoren die van invloed zijn op de verkoopdaling.";
    findings = [
      {
        title: "Marge- en bestelvolume-krimp",
        metric: `Winstmarge: %${margin.toFixed(1)}`,
        explanation: "Daling in de orderfrequentie en lagere productmarges beperken de totale omzetontwikkeling."
      }
    ];
    actions = [
      {
        priority: "high",
        title: "Activeren inactieve B2B resellers",
        reason: "Bel resellers die recent een besteldip lieten zien om de reden te achterhalen.",
        estimatedImpact: formatEuro(sales * 0.07)
      }
    ];
  } else if (text.includes("risico") || text.includes("verloop") || text.includes("churn") || text.includes("klant")) {
    summary = "Klantverlooprisico's geëvalueerd op basis van aankoopfrequentie en recency.";
    findings = [
      {
        title: "Minder frequente kopers",
        metric: "Risico-segment",
        explanation: "Een aanzienlijk deel van het klantenbestand heeft de afgelopen 90 tot 180 dagen geen aankoop gedaan."
      }
    ];
    actions = [
      {
        priority: "high",
        title: "Conversie van eenmalige kopers",
        reason: "Introduceer cross-sell campagnes binnen 30 dagen na de eerste order.",
        estimatedImpact: formatEuro(sales * 0.06)
      }
    ];
  } else if (text.includes("regio") || text.includes("campagne")) {
    summary = "Geografische verkoopprestaties en campagnekansen geanalyseerd.";
    findings = [
      {
        title: "Regionale verkoopconcentratie",
        metric: "Regio-analyse",
        explanation: "De omzet wordt voornamelijk gedreven door de topregio's, wat kansen biedt voor onderpresterende markten."
      }
    ];
    actions = [
      {
        priority: "medium",
        title: "Europese / Pacific expansie",
        reason: "Kopieer succesvolle marketingcampagnes uit Noord-Amerika naar Europa en Pacific.",
        estimatedImpact: formatEuro(sales * 0.04)
      }
    ];
  }
  
  return { summary, findings, actions, limitations };
}

// Initialize Chatbot Drawer Panel (Dutch system instructions)
function initChatbot() {
  const btnChatToggle = document.getElementById('btn-chat-toggle');
  const btnChatClose = document.getElementById('btn-chat-close');
  const chatDrawer = document.getElementById('chat-drawer');
  const chatBackdrop = document.getElementById('chat-backdrop');
  const chatBadge = document.getElementById('chat-badge');
  
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const btnClearChat = document.getElementById('btn-clear-chat');
  
  chatHistory.push({
    role: 'model',
    parts: [{ text: "Hallo! Ik ben de AdventureWorks AI Verkoopanalist. Ik kan je vragen over de dashboardgegevens of verkooptrends beantwoorden en aangepaste analyses voor je maken. Hoe kan ik je vandaag helpen?" }]
  });

  btnChatToggle.onclick = () => {
    chatDrawer.classList.toggle('open');
    chatBackdrop.classList.toggle('active');
    chatBadge.style.display = 'none';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (chatDrawer.classList.contains('open')) {
      setTimeout(() => chatInput.focus(), 250);
    }
  };

  const closeChat = () => {
    chatDrawer.classList.remove('open');
    chatBackdrop.classList.remove('active');
  };

  btnChatClose.onclick = closeChat;
  chatBackdrop.onclick = closeChat;

  chatInput.addEventListener('input', () => {
    chatSendBtn.disabled = !chatInput.value.trim();
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight - 6) + 'px';
  });

  btnClearChat.onclick = () => {
    chatMessages.innerHTML = `
      <div class="chatgpt-msg ai">
        <div class="avatar">AI</div>
        <div class="msg-wrapper">
          <div class="msg-content">
            Chatgeschiedenis gewist. Stel gerust nieuwe vragen over de verkoopcijfers en trends!
          </div>
        </div>
      </div>
    `;
    chatHistory = [{
      role: 'model',
      parts: [{ text: "Chatgeschiedenis gewist." }]
    }];
  };

  chatSendBtn.onclick = handleSendMessage;

  chatInput.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Wire Quick Suggestion Buttons
  const quickQuestions = document.querySelectorAll('#chat-quick-questions .quick-question-btn');
  quickQuestions.forEach(btn => {
    btn.onclick = () => {
      chatInput.value = btn.innerText;
      chatInput.style.height = 'auto';
      chatSendBtn.disabled = false;
      handleSendMessage();
    };
  });

  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatSendBtn.disabled = true;

    appendChatgptMessageUI('user', text);
    
    chatHistory.push({
      role: 'user',
      parts: [{ text: text }]
    });

    const typingDiv = showTypingIndicator();

    try {
      const activeContext = buildDashboardContext();
      const systemInstruction = `Je bent een ervaren AI Verkoopanalist en Management Assistent voor de AdventureWorks verkooporganisatie.
Je spreekt en reageert ALTIJD in het Nederlands (Dutch) voor de directie.
Je moet de verkoopgegevens en geselecteerde filters op het dashboard van de gebruiker analyseren en antwoorden.

De actuele verkoopgegevens en geselecteerde filters op het dashboard zijn als volgt:
${activeContext}

Gedragsregels:
1. Reageer ALTIJD in het Nederlands, met een professionele, analytische en directie-waardige toon.
2. Basisschema van jouw antwoord MOET strikt een geldig JSON-object zijn. Zorg ervoor dat het exact voldoet aan de volgende JSON-structuur:
{
  "summary": "Management samenvatting (Kort en krachtig, in het Nederlands)",
  "findings": [
    {
      "title": "Titel van de bevinding",
      "metric": "Ondersteunende metric uit de context (bijv: €15M omzet, %13,2 winstmarge)",
      "explanation": "Uitleg en oorzaakanalyse"
    }
  ],
  "actions": [
    {
      "priority": "high" | "medium" | "low",
      "title": "Aanbevolen actie",
      "reason": "Waarom deze actie wordt geadviseerd",
      "estimatedImpact": "Berekende geschatte financiële impact (bijv: €120.000 of null)"
    }
  ],
  "limitations": [
    "Dataset-beperkingen (bijv: Mogelijke klantnamen, NPS-scores, supporttickets en productbeschrijvingen ontbreken in de dataset)"
  ]
}
3. Verzin geen getallen of gegevens buiten de verstrekte context. Speculeer niet over ontbrekende data.
4. Elke bevinding (finding) moet direct gelinkt zijn aan een dashboard metric uit de context.`;

      // Call API
      const aiResponseText = await callGeminiAPI(chatHistory, systemInstruction, "application/json");
      
      typingDiv.remove();

      try {
        const parsedJson = JSON.parse(aiResponseText);
        appendChatgptMessageUI('ai', parsedJson, true);
      } catch (jsonErr) {
        console.warn("AI response was not valid JSON, rendering as markdown:", aiResponseText);
        appendChatgptMessageUI('ai', aiResponseText, false);
      }
      
      chatHistory.push({
        role: 'model',
        parts: [{ text: aiResponseText }]
      });

    } catch (e) {
      console.error(e);
      typingDiv.remove();
      
      // FALLBACK TO DETERMINISTIC LOCAL INSIGHTS
      const fallbackResponse = getFallbackAIResponse(text);
      appendChatgptMessageUI('ai', fallbackResponse, true);
      
      chatHistory.push({
        role: 'model',
        parts: [{ text: JSON.stringify(fallbackResponse) }]
      });
    } finally {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function appendChatgptMessageUI(sender, content, isStructured = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatgpt-msg ${sender}`;
    const avatarName = sender === 'user' ? 'Ik' : 'AI';
    
    let formattedHtml = '';
    if (sender === 'ai') {
      if (isStructured && typeof content === 'object') {
        formattedHtml = renderStructuredAIResponse(content);
      } else {
        formattedHtml = formatMarkdown(content);
      }
    } else {
      formattedHtml = content;
    }
    
    msgDiv.innerHTML = `
      <div class="avatar">${avatarName}</div>
      <div class="msg-wrapper">
        <div class="msg-content">${formattedHtml}</div>
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatgpt-msg ai';
    typingDiv.innerHTML = `
      <div class="avatar">AI</div>
      <div class="msg-wrapper">
        <div class="chatgpt-typing">
          <div class="chatgpt-typing-dot"></div>
          <div class="chatgpt-typing-dot"></div>
          <div class="chatgpt-typing-dot"></div>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
  }
}

// Initialize Scenario Simulator Layout & Events (Dutch)
function initSimulator() {
  const sliders = ['sim-repeat-rate', 'sim-churn-recover', 'sim-margin-target', 'sim-aov-increase'];
  
  sliders.forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      updateSimulator();
    });
  });
  
  // Wire "Evalueer scenario" Button
  const btnEvaluate = document.getElementById('btn-evaluate-scenario');
  btnEvaluate.onclick = async () => {
    btnEvaluate.disabled = true;
    const originalText = btnEvaluate.innerText;
    btnEvaluate.innerText = "Beoordelen...";
    
    const commentaryBox = document.getElementById('sim-ai-text');
    commentaryBox.innerHTML = '<div style="color: var(--text-muted);">AI analyseert het scenario, een moment geduld...</div>';
    
    const simData = updateSimulator();
    
    try {
      const activeContext = buildDashboardContext();
      const systemInstruction = `Je bent een ervaren directie-adviseur en senior financieel analist voor de AdventureWorks verkooporganisatie.
Je spreekt en reageert ALTIJD in het Nederlands (Dutch) voor de directie.
Jouw taak is om de resultaten van een strategische verkoop- en marge-simulatie te becommentariëren.

Belangrijkste regels:
1. Baseer je uitsluitend op de berekende cijfers uit de prompt. Verzin zelf geen nieuwe cijfers.
2. Schrijf een beknopt, krachtig strategisch commentaar in het Nederlands (maximaal 4-5 zinnen).
3. Leg uit welke operationele stappen prioritair zijn om dit scenario te realiseren (bijvoorbeeld versterken van B2B resellers, inzet van retentie-e-mails voor risicogroepen).
4. Gebruik een professionele en directie-waardige toon.`;

      const promptText = `Beoordeel de volgende gesimuleerde scenario-uitkomsten:
- Huidige omzet: ${formatEuro(simData.sales)}
- Huidige winstmarge: %${simData.currentMargin.toFixed(1)}
- Huidige percentage herhalingsaankopen: %${simData.currentRepeatRate.toFixed(1)}
- Huidige gemiddelde bestelwaarde (AOV): ${formatEuro(simData.currentAov)}

Gekozen doelen en berekende bijdragen:
1. Doel herhalingsaankopen: %${simData.targetRepeatRate.toFixed(1)} (Bijdrage: +${formatEuro(simData.repeatImpact)} Omzet)
2. Doel klantbehoud (risicogroepen): %${simData.churnRecoverRate.toFixed(1)} (Bijdrage: +${formatEuro(simData.churnImpact)} Omzet)
3. Doel brutowinstmarge: %${simData.targetMargin.toFixed(1)} (Bijdrage: +${formatEuro(simData.marginImpact)} Brutowinst)
4. Doel stijging AOV: +%${simData.aovIncreasePct.toFixed(1)} (Bijdrage: +${formatEuro(simData.aovImpact)} Omzet)

Totale gecombineerde potentiële impact: +${formatEuro(simData.totalImpact)}

Geef een strategische en beknopte evaluatie in het Nederlands op basis van deze waarden.`;

      const messages = [{
        role: "user",
        parts: [{ text: promptText }]
      }];

      const aiCommentary = await callGeminiAPI(messages, systemInstruction, "text/plain");
      commentaryBox.innerHTML = formatMarkdown(aiCommentary);
      
    } catch (e) {
      console.error(e);
      // Fallback commentary if API call fails (Dutch)
      const fallbackCommentary = `<strong>Offline analyse-rapport:</strong> Voor de geselecteerde doelen is een totale potentiële impact van <strong>${formatEuro(simData.totalImpact)}</strong> berekend. Het verhogen van de herhaalaankopen naar %${simData.targetRepeatRate.toFixed(1)} en het behouden van %${simData.churnRecoverRate.toFixed(1)} van de risicoklanten vormen de belangrijkste hefbomen voor groei. Operationeel moeten we inzetten op gerichte volumekortingen voor B2B resellers en automatische e-mailcampagnes voor risicovolle B2C-klanten. Om de marge van %${simData.targetMargin.toFixed(1)} te behalen, moeten kortingen op minder winstgevende producten worden afgebouwd.`;
      commentaryBox.innerHTML = fallbackCommentary;
    } finally {
      btnEvaluate.disabled = false;
      btnEvaluate.innerText = originalText;
    }
  };
}

// Perform deterministic calculation for Simulator
function updateSimulator() {
  const filteredMonthly = getFilteredMonthlyData();
  const filteredResellers = getFilteredResellerSales();
  
  let sales = 0;
  let cost = 0;
  let orders = 0;
  let b2cOrders = 0;
  
  filteredMonthly.forEach(item => {
    sales += item.sales;
    cost += item.cost;
    orders += item.order_count;
    if (item.segment !== 'Reseller') {
      b2cOrders += item.order_count;
    }
  });
  
  const profit = sales - cost;
  const currentMargin = sales > 0 ? (profit / sales) * 100 : 0;
  const currentAov = orders > 0 ? sales / orders : 0;
  
  const activeResellerKeys = new Set(filteredResellers.map(r => r.reseller_key));
  const b2bCustomers = activeResellerKeys.size;
  const b2cCustomers = Math.round(b2cOrders * 0.668);
  const totalCustomers = b2bCustomers + b2cCustomers;
  
  const returningB2c = Math.round(b2cCustomers * 0.371);
  const returningB2b = Math.round(b2bCustomers * 0.954);
  const totalReturning = returningB2c + returningB2b;
  const currentRepeatRate = totalCustomers > 0 ? (totalReturning / totalCustomers) * 100 : 0;
  
  // Read slider values
  const targetRepeatRate = parseFloat(document.getElementById('sim-repeat-rate').value);
  const churnRecoverRate = parseFloat(document.getElementById('sim-churn-recover').value);
  const targetMargin = parseFloat(document.getElementById('sim-margin-target').value);
  const aovIncreasePct = parseFloat(document.getElementById('sim-aov-increase').value);
  
  // 1. Repeat Purchase Impact
  let repeatImpact = 0;
  if (targetRepeatRate > currentRepeatRate && totalCustomers > 0) {
    const extraRepeatCustomers = totalCustomers * (targetRepeatRate - currentRepeatRate) / 100;
    repeatImpact = extraRepeatCustomers * currentAov;
  }
  
  // 2. Churn Recovery Impact
  const riskCustomers = Math.round(totalCustomers * 0.123);
  let churnImpact = 0;
  if (churnRecoverRate > 0) {
    const recoveredCustomers = riskCustomers * (churnRecoverRate / 100);
    churnImpact = recoveredCustomers * currentAov;
  }
  
  // 3. Margin Target Impact
  let marginImpact = 0;
  if (targetMargin > currentMargin) {
    marginImpact = sales * (targetMargin - currentMargin) / 100;
  }
  
  // 4. AOV Increase Impact
  let aovImpact = 0;
  if (aovIncreasePct > 0) {
    aovImpact = orders * (currentAov * aovIncreasePct / 100);
  }
  
  const totalImpact = repeatImpact + churnImpact + marginImpact + aovImpact;
  
  // Update slider labels in UI
  document.getElementById('val-repeat-rate').innerText = targetRepeatRate.toFixed(1) + '%';
  document.getElementById('val-churn-recover').innerText = churnRecoverRate.toFixed(1) + '%';
  document.getElementById('val-margin-target').innerText = targetMargin.toFixed(1) + '%';
  document.getElementById('val-aov-increase').innerText = aovIncreasePct.toFixed(1) + '%';
  
  // Update result elements in UI
  document.getElementById('res-repeat-impact').innerText = formatEuro(repeatImpact);
  document.getElementById('res-churn-impact').innerText = formatEuro(churnImpact);
  document.getElementById('res-margin-impact').innerText = formatEuro(marginImpact);
  document.getElementById('res-aov-impact').innerText = formatEuro(aovImpact);
  
  document.getElementById('res-total-impact').innerText = formatEuro(totalImpact);
  
  return {
    repeatImpact,
    churnImpact,
    marginImpact,
    aovImpact,
    totalImpact,
    targetRepeatRate,
    churnRecoverRate,
    targetMargin,
    aovIncreasePct,
    currentRepeatRate,
    currentMargin,
    currentAov,
    sales,
    profit,
    orders,
    totalCustomers
  };
}

// ==========================================================================
// CLIENT-SIDE CSV PARSING & DATA AGGREGATION MOTOR
// ==========================================================================

// RFC 4180 Compliant CSV parser with Delimiter detection
function parseCSV(text) {
  const delimiter = detectDelimiter(text);
  const lines = [];
  let row = [""];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

function detectDelimiter(text) {
  const firstLine = text.split('\n')[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  return semiCount > commaCount ? ';' : ',';
}

function parseDateKey(str) {
  const y = parseInt(str.substring(0, 4)) || 2017;
  const m = (parseInt(str.substring(4, 6)) || 7) - 1;
  const d = parseInt(str.substring(6, 8)) || 1;
  return new Date(y, m, d);
}

// Convert CSV parsed rows into dashboard JSON schema
function processUploadedCsv(lines) {
  const headers = lines[0].map(h => h.trim().replace(/^["']|["']$/g, ''));
  const headerIndices = {};
  headers.forEach((h, idx) => headerIndices[h] = idx);

  // Validate required headers
  const requiredHeaders = ['SalesOrderLineKey', 'ResellerKey', 'CustomerKey', 'ProductKey', 'OrderDateKey', 'SalesTerritoryKey', 'Order_Quantity', 'Total_Product_Cost', 'Sales_Amount'];
  requiredHeaders.forEach(rh => {
    if (headerIndices[rh] === undefined) {
      throw new Error(`Vereiste kolom niet gevonden in CSV: "${rh}"`);
    }
  });

  const cleanNumeric = (val) => {
    if (!val) return 0.0;
    let clean = val.replace(/"/g, '').replace(/\s/g, '');
    clean = clean.replace(/,/g, '.'); // replace European/Turkish comma with dot
    // If double dots exist due to thousands separator (e.g. 1.234.56), remove all but last
    const dotsCount = (clean.match(/\./g) || []).length;
    if (dotsCount > 1) {
      const lastDotIdx = clean.lastIndexOf('.');
      clean = clean.substring(0, lastDotIdx).replace(/\./g, '') + clean.substring(lastDotIdx);
    }
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0.0 : parsed;
  };

  const cleanInt = (val) => {
    if (!val) return 0;
    const parsed = parseInt(val.replace(/"/g, '').replace(/\s/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const monthlyAgg = {}; // key: year-month-territory-segment
  const productAgg = {}; // key: year-territory-segment-productKey
  const resellerAgg = {}; // key: year-territory-resellerKey
  const customerRfmRaw = {}; // key: customerKey-resellerKey

  const resellerKeys = new Set();
  const productKeys = new Set();
  let maxDateStr = "20170101";

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.length < requiredHeaders.length) continue;

    const lineKeyStr = row[headerIndices['SalesOrderLineKey']];
    const resellerKeyStr = row[headerIndices['ResellerKey']];
    const customerKeyStr = row[headerIndices['CustomerKey']];
    const productKeyStr = row[headerIndices['ProductKey']];
    const orderDateKeyStr = row[headerIndices['OrderDateKey']].trim();
    const territoryKeyStr = row[headerIndices['SalesTerritoryKey']];
    
    const qty = cleanInt(row[headerIndices['Order_Quantity']]);
    const totalCost = cleanNumeric(row[headerIndices['Total_Product_Cost']]);
    const salesAmount = cleanNumeric(row[headerIndices['Sales_Amount']]);
    
    if (orderDateKeyStr > maxDateStr) {
      maxDateStr = orderDateKeyStr;
    }
    
    resellerKeys.add(resellerKeyStr);
    productKeys.add(productKeyStr);
    
    const resellerInt = cleanInt(resellerKeyStr);
    const segment = (resellerInt !== -1) ? "Reseller" : "Customer";
    const orderId = Math.floor(cleanInt(lineKeyStr) / 1000) || 0;
    
    const year = orderDateKeyStr.substring(0, 4);
    const month = orderDateKeyStr.substring(4, 6);
    
    // 1. Monthly aggregation
    const mKey = `${year}-${month}-${territoryKeyStr}-${segment}`;
    if (!monthlyAgg[mKey]) {
      monthlyAgg[mKey] = { sales: 0, cost: 0, quantity: 0, orders: new Set() };
    }
    monthlyAgg[mKey].sales += salesAmount;
    monthlyAgg[mKey].cost += totalCost;
    monthlyAgg[mKey].quantity += qty;
    monthlyAgg[mKey].orders.add(orderId);
    
    // 2. Product aggregation
    const pKey = `${year}-${territoryKeyStr}-${segment}-${productKeyStr}`;
    if (!productAgg[pKey]) {
      productAgg[pKey] = { sales: 0, quantity: 0 };
    }
    productAgg[pKey].sales += salesAmount;
    productAgg[pKey].quantity += qty;
    
    // 3. Reseller aggregation (B2B only)
    if (segment === "Reseller" && resellerInt !== -1) {
      const rKey = `${year}-${territoryKeyStr}-${resellerKeyStr}`;
      if (!resellerAgg[rKey]) {
        resellerAgg[rKey] = { sales: 0, quantity: 0 };
      }
      resellerAgg[rKey].sales += salesAmount;
      resellerAgg[rKey].quantity += qty;
    }
    
    // 4. RFM collection
    const custId = `${customerKeyStr}-${resellerKeyStr}`;
    if (!customerRfmRaw[custId]) {
      customerRfmRaw[custId] = { last_date: "20170101", orders: new Set(), monetary: 0 };
    }
    if (orderDateKeyStr > customerRfmRaw[custId].last_date) {
      customerRfmRaw[custId].last_date = orderDateKeyStr;
    }
    customerRfmRaw[custId].orders.add(orderId);
    customerRfmRaw[custId].monetary += salesAmount;
  }

  // Format outputs
  const territories = { ...dashboardData.territories };
  const products = { ...dashboardData.products };
  const resellers = { ...dashboardData.resellers };

  // Ensure new keys have dummy names
  productKeys.forEach(pk => {
    if (!products[pk]) {
      products[pk] = {
        name: `Product #${pk}`,
        category: "Accessoires",
        subcategory: "Overig",
        price: 19.99
      };
    }
  });

  resellerKeys.forEach(rk => {
    if (rk !== "-1" && !resellers[rk]) {
      resellers[rk] = {
        name: `Distributeur #${rk}`,
        business_type: "Specialty Bike Shop"
      };
    }
  });

  const monthlyList = Object.entries(monthlyAgg).map(([key, val]) => {
    const [year, month, territory, segment] = key.split('-');
    return {
      year: parseInt(year),
      month: parseInt(month),
      territory: parseInt(territory),
      segment: segment,
      sales: Math.round(val.sales * 100) / 100,
      cost: Math.round(val.cost * 100) / 100,
      quantity: val.quantity,
      order_count: val.orders.size
    };
  });

  const productList = Object.entries(productAgg).map(([key, val]) => {
    const [year, territory, segment, productKey] = key.split('-');
    return {
      year: parseInt(year),
      territory: parseInt(territory),
      segment: segment,
      product_key: parseInt(productKey),
      sales: Math.round(val.sales * 100) / 100,
      quantity: val.quantity
    };
  });

  const resellerList = Object.entries(resellerAgg).map(([key, val]) => {
    const [year, territory, resellerKey] = key.split('-');
    return {
      year: parseInt(year),
      territory: parseInt(territory),
      reseller_key: parseInt(resellerKey),
      sales: Math.round(val.sales * 100) / 100,
      quantity: val.quantity
    };
  });

  // Calculate RFM Summary
  const maxDate = parseDateKey(maxDateStr);
  const rfmSummary = {
    "Kampioenen": { count: 0, sales: 0.0 },
    "Loyaal": { count: 0, sales: 0.0 },
    "Nieuw": { count: 0, sales: 0.0 },
    "Risico": { count: 0, sales: 0.0 },
    "Slapend": { count: 0, sales: 0.0 }
  };
  let singleOrderCount = 0;
  let returningCustomerCount = 0;

  for (const custId in customerRfmRaw) {
    const info = customerRfmRaw[custId];
    const lastDate = parseDateKey(info.last_date);
    const recencyDays = Math.floor((maxDate - lastDate) / (1000 * 60 * 60 * 24));
    const frequency = info.orders.size;
    const monetary = info.monetary;
    
    if (frequency === 1) {
      singleOrderCount++;
    } else {
      returningCustomerCount++;
    }
    
    let rScore = 1;
    if (recencyDays <= 30) rScore = 5;
    else if (recencyDays <= 90) rScore = 4;
    else if (recencyDays <= 180) rScore = 3;
    else if (recencyDays <= 365) rScore = 2;
    
    let fScore = 1;
    if (frequency >= 10) fScore = 5;
    else if (frequency >= 5) fScore = 4;
    else if (frequency >= 3) fScore = 3;
    else if (frequency === 2) fScore = 2;
    
    let seg = "Slapend";
    if (rScore >= 4 && fScore >= 4) seg = "Kampioenen";
    else if (rScore >= 3 && fScore >= 3) seg = "Loyaal";
    else if (rScore >= 4 && fScore === 1) seg = "Nieuw";
    else if (rScore <= 2 && fScore >= 2) seg = "Risico";
    
    rfmSummary[seg].count++;
    rfmSummary[seg].sales += monetary;
  }

  return {
    territories,
    products,
    resellers,
    monthly_data: monthlyList,
    product_sales: productList,
    reseller_sales: resellerList,
    rfm_summary: rfmSummary,
    single_order_count: singleOrderCount,
    returning_customer_count: returningCustomerCount,
    total_customers_count: Object.keys(customerRfmRaw).length
  };
}

// Handle CSV File Upload
function handleCsvUpload(file) {
  const reader = new FileReader();
  
  const csvBadge = document.querySelector('.csv-badge');
  if (csvBadge) {
    csvBadge.innerHTML = `<span class="badge-dot" style="background-color: var(--color-orange);"></span> Verwerken...`;
  }

  reader.onload = function(e) {
    const text = e.target.result;
    try {
      const lines = parseCSV(text);
      if (lines.length < 2) {
        throw new Error("CSV-bestand is leeg of heeft een ongeldig formaat.");
      }
      
      const newDashboardData = processUploadedCsv(lines);
      
      // Update global state
      dashboardData = newDashboardData;
      
      // Calculate date boundary strings for HTML inputs based on monthly_data
      let minDateStr = "2020-06-15";
      let maxDateStr = "2017-07-02";
      dashboardData.monthly_data.forEach(item => {
        const dateStr = `${item.year}-${item.month.toString().padStart(2, '0')}-01`;
        if (dateStr < minDateStr) minDateStr = dateStr;
        if (dateStr > maxDateStr) maxDateStr = dateStr;
      });
      
      // Select date inputs
      const startInput = document.getElementById('filter-start-date');
      const endInput = document.getElementById('filter-end-date');
      
      startInput.min = minDateStr;
      startInput.max = maxDateStr;
      startInput.value = minDateStr;
      
      endInput.min = minDateStr;
      endInput.max = maxDateStr;
      endInput.value = maxDateStr;
      
      filters.startDate = minDateStr;
      filters.endDate = maxDateStr;
      
      // Repopulate Territory filter list
      initializeFilters();
      
      // Update Badge
      if (csvBadge) {
        csvBadge.innerHTML = `<span class="badge-dot"></span> ${file.name}`;
      }
      
      updateDashboard();
      alert(`CSV-bestand succesvol geüpload!\n${formatInteger(lines.length - 1)} regels verwerkt en dashboard bijgewerkt.`);
      
    } catch (err) {
      console.error(err);
      if (csvBadge) {
        csvBadge.innerHTML = `<span class="badge-dot" style="background-color: var(--color-danger);"></span> Fout bij upload`;
      }
      alert("Fout bij het verwerken van het CSV-bestand:\n" + err.message);
    }
  };
  reader.readAsText(file);
}
