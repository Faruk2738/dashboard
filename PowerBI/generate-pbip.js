const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const name = process.env.PBIP_NAME || 'AdventureWorks';
const modelDir = path.join(root, `${name}.SemanticModel`);
const reportDir = path.join(root, `${name}.Report`);
const definitionDir = path.join(reportDir, 'definition');
const pagesDir = path.join(definitionDir, 'pages');

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n');
};
const hex = (seed) => crypto.createHash('sha1').update(seed).digest('hex').slice(0, 20);
const pageHex = (seed) => crypto.createHash('sha1').update(seed).digest('hex').slice(0, 24);
const lit = (value) => ({ expr: { Literal: { Value: typeof value === 'boolean' ? String(value) : `'${value}'` } } });
const column = (table, property) => ({ Column: { Expression: { SourceRef: { Entity: table } }, Property: property } });
const measure = (table, property) => ({ Measure: { Expression: { SourceRef: { Entity: table } }, Property: property } });
const projection = (field, table, property) => ({ field, queryRef: `${table}.${property}`, nativeQueryRef: property });
const colP = (table, property) => projection(column(table, property), table, property);
const meaP = (table, property) => projection(measure(table, property), table, property);

function textbox(seed, text, x, y, w, h, size = 24, color = '#F8FAFC', weight = 'bold') {
  return {
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.9.0/schema.json',
    name: hex(seed), position: { x, y, z: 1000, width: w, height: h, tabOrder: 1000 },
    visual: { visualType: 'textbox', objects: { general: [{ properties: { paragraphs: [{ textRuns: [{ value: text, textStyle: { fontFamily: 'Segoe UI', fontSize: `${size}px`, fontWeight: weight, color } }], horizontalTextAlignment: 'left' }] } }] }, visualContainerObjects: headerChrome() }
  };
}
function headerChrome() {
  return {
    background: [{ properties: { show: lit(true), color: { solid: { color: lit('#082D5C') } }, transparency: { expr: { Literal: { Value: '0D' } } } } }],
    border: [{ properties: { show: lit(true), color: { solid: { color: lit('#0B2853') } }, radius: { expr: { Literal: { Value: '10D' } } } } }]
  };
}
function chrome(background = true, title) {
  const v = {
    background: [{ properties: { show: lit(background), color: { solid: { color: lit('#FFFFFF') } }, transparency: { expr: { Literal: { Value: '0D' } } } } }],
    border: [{ properties: { show: lit(background), color: { solid: { color: lit('#D7E2F0') } }, radius: { expr: { Literal: { Value: '10D' } } } } }],
  };
  if (title) v.title = [{ properties: { show: lit(true), text: lit(title), fontColor: { solid: { color: lit('#082D5C') } }, fontSize: { expr: { Literal: { Value: '13D' } } } } }];
  return v;
}
function visual(seed, type, roles, x, y, w, h, title) {
  return {
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.9.0/schema.json',
    name: hex(seed), position: { x, y, z: 1000, width: w, height: h, tabOrder: 1000 },
    visual: { visualType: type, query: { queryState: Object.fromEntries(Object.entries(roles).map(([r, ps]) => [r, { projections: ps }])) }, visualContainerObjects: chrome(true, title) }
  };
}
function cards(seed, measures, x, y, w, h) { return visual(seed, 'cardVisual', { Data: measures.map(([t,m]) => meaP(t,m)) }, x,y,w,h); }
const kpiPalette = [
  ['#EEF5FF','#8AB7F0'], ['#ECFDF5','#6DD3A0'], ['#FAF0FF','#C79AE8'], ['#FFF7E8','#F2C56B'],
  ['#FFF0F3','#F3A1B0'], ['#EAFBFF','#76CFE3'], ['#F1F0FF','#AAA2EA'], ['#EDF7FF','#85BDE8']
];
function kpiRow(seed, measures, x, y, w, h) {
  const gap = 10;
  const cardWidth = (w - gap * (measures.length - 1)) / measures.length;
  return measures.map(([table, metric], index) => {
    const result = visual(`${seed}${index}`, 'cardVisual', { Data: [meaP(table, metric)] }, x + index * (cardWidth + gap), y, cardWidth, h);
    const [background, border] = kpiPalette[index % kpiPalette.length];
    result.visual.visualContainerObjects = {
      background: [{ properties: { show: lit(true), color: { solid: { color: lit(background) } }, transparency: { expr: { Literal: { Value: '0D' } } } } }],
      border: [{ properties: { show: lit(true), color: { solid: { color: lit(border) } }, radius: { expr: { Literal: { Value: '12D' } } } } }]
    };
    return result;
  });
}
function slicer(seed, table, field, x, y, w, h, title) {
  const result = visual(seed, 'slicer', { Values: [colP(table, field)] }, x,y,w,Math.max(h,76),title);
  result.visual.objects = {
    data: [{ properties: { mode: lit('Dropdown') } }],
    selection: [{ properties: { selectAllCheckboxEnabled: lit(true), singleSelect: lit(false), strictSingleSelect: lit(false) } }],
    items: [{ properties: { fontColor: { solid: { color: lit('#17345C') } }, background: { solid: { color: lit('#FFFFFF') } }, textSize: { expr: { Literal: { Value: '11D' } } }, padding: { expr: { Literal: { Value: '4D' } } } } }]
  };
  return result;
}

const pages = [
  { id: 'ReportSection' + pageHex('home'), name: 'Home — Executive Overview', build(id) {
    return [
    textbox(id+'t','HOME — EXECUTIVE OVERVIEW',24,8,1226,60,26,'#FFFFFF'),
      slicer(id+'s1','Product','Category',24,80,220,44,'Category'), slicer(id+'s2','Territory','Country',254,80,220,44,'Country'),
      ...kpiRow(id+'k',[['Sales','Total Sales'],['Sales','Total Profit'],['Customer','Customers'],['Sales','Orders'],['Sales','Average Order Value'],['Customer','Repeat Rate'],['Sales','Active Customers'],['Sales','Sales Forecast']],24,172,1226,100),
      visual(id+'l','lineChart',{Category:[colP('Date','Year Month')],Y:[meaP('Sales','Total Sales'),meaP('Sales','Sales Forecast')]},24,290,780,260,'Sales Actual vs Forecast'),
      visual(id+'d','donutChart',{Category:[colP('Product','Category')],Y:[meaP('Sales','Total Sales')]},820,290,430,260,'Sales by Category'),
      visual(id+'m','map',{Category:[colP('Territory','Country')],Size:[meaP('Sales','Total Sales')]},24,566,600,198,'Global Sales Footprint'),
      visual(id+'b','clusteredBarChart',{Category:[colP('Product','Product')],Y:[meaP('Sales','Total Sales')]},640,566,610,198,'Top 10 Products by Sales'),
      visual(id+'tb','tableEx',{Values:[colP('Product','Product'),colP('Product','Category'),meaP('Sales','Total Sales'),meaP('Sales','Total Profit'),meaP('Sales','Orders')]},24,780,1226,180,'Product Sales Detail')
    ];
  }},
  { id: 'ReportSection' + pageHex('customers'), name: 'Customer Analytics', build(id) { return [
    textbox(id+'t','CUSTOMER ANALYTICS',24,8,1226,60,26), slicer(id+'s1','Customer','RFM Segment',24,80,220,44,'RFM Segment'), slicer(id+'s2','Customer','Country',254,80,220,44,'Country'),
    ...kpiRow(id+'k',[['Customer','Customers'],['Customer','Repeat Rate'],['Sales','Average Order Value'],['Customer','Average Customer Value'],['Sales','Orders'],['Customer','Average Recency']],24,172,1226,100),
    visual(id+'sc','scatterChart',{Category:[colP('Customer','Customer')],X:[colP('Customer','Recency Days')],Y:[colP('Customer','Frequency')],Size:[meaP('Customer','Customer Revenue')],Series:[colP('Customer','RFM Segment')]},24,290,700,260,'Frequency vs Recency (Bubble Size = Monetary)'),
    visual(id+'dn','donutChart',{Category:[colP('Customer','RFM Segment')],Y:[meaP('Customer','Customers')]},740,290,510,260,'RFM Distribution'),
    visual(id+'br','clusteredBarChart',{Category:[colP('Customer','RFM Segment')],Y:[meaP('Customer','Customer Revenue')]},24,566,600,198,'Revenue by Segment'),
    visual(id+'tb','tableEx',{Values:[colP('Customer','Country'),colP('Customer','RFM Segment'),meaP('Customer','Customers'),meaP('Customer','Customer Revenue')]},640,566,610,198,'Segment by Country (Customer Count & Revenue)'),
    visual(id+'co','areaChart',{Category:[colP('Date','Year Month')],Y:[meaP('Sales','New Active Customers'),meaP('Sales','Repeat Active Customers')]},24,780,1226,180,'New vs Repeat Customers')
  ];}},
  { id: 'ReportSection' + pageHex('sales'), name: 'Sales Performance', height: 1320, build(id) { return [
    textbox(id+'t','SALES PERFORMANCE',24,8,1226,60,26), slicer(id+'s1','Date','Year',24,80,180,44,'Year'), slicer(id+'s2','Sales','Channel',214,80,200,44,'Channel'), slicer(id+'s3','Product','Category',424,80,220,44,'Category'),
    ...kpiRow(id+'k',[['Sales','Total Sales'],['Sales','Total Profit'],['Sales','Profit Margin'],['Sales','Orders'],['Sales','Average Order Value']],24,172,1226,100),
    visual(id+'ln','lineChart',{Category:[colP('Date','Year Month')],Y:[meaP('Sales','Total Sales'),meaP('Sales','Total Profit')]},24,290,760,230,'Monthly Sales & Profit'),
    visual(id+'br','clusteredBarChart',{Category:[colP('Product','Category')],Y:[meaP('Sales','Total Sales'),meaP('Sales','Total Profit')]},800,290,450,230,'Category Performance'),
    visual(id+'ds','scatterChart',{Category:[colP('Product','Product')],X:[meaP('Sales','Average Discount')],Y:[meaP('Sales','Total Sales')],Size:[meaP('Sales','Units Sold')],Series:[colP('Product','Category')]},24,536,600,280,'Discount % vs Sales — Product Performance'),
    visual(id+'sct','scatterChart',{Category:[colP('Product','Product')],X:[colP('Product','List Price')],Y:[meaP('Sales','Units Sold')],Size:[meaP('Sales','Total Sales')],Series:[colP('Product','Category')]},640,536,610,280,'Price vs Quantity — Bubble Size = Sales'),
    visual(id+'wf','waterfallChart',{Category:[colP('Waterfall','Stage')],Y:[meaP('Waterfall','Waterfall Amount')]},24,832,1226,260,'Sales Waterfall — Total Sales to Gross Profit'),
    visual(id+'tb','tableEx',{Values:[colP('Product','Product'),colP('Product','Category'),meaP('Sales','Total Sales'),meaP('Sales','Total Profit'),meaP('Sales','Units Sold'),meaP('Sales','Average Discount')]},24,1108,1226,188,'Top 10 Products by Profit')
  ];}},
  { id: 'ReportSection' + pageHex('campaign'), name: 'Campaign Center', build(id) { return [
    textbox(id+'t','CAMPAIGN CENTER',24,8,1226,60,26), slicer(id+'s1','Campaign','Segment',24,80,220,44,'Segment'), slicer(id+'s2','Campaign','Channel',254,80,220,44,'Channel'), slicer(id+'s3','Campaign','Status',484,80,220,44,'Status'),
    ...kpiRow(id+'k',[['Campaign','Campaign Count'],['Campaign','Total Audience'],['Campaign','Active Campaigns']],24,172,1226,100),
    visual(id+'br','clusteredBarChart',{Category:[colP('Campaign','Campaign')],Y:[meaP('Campaign','Total Audience')]},24,290,600,270,'Audience by Campaign'),
    visual(id+'dn','donutChart',{Category:[colP('Campaign','Channel')],Y:[meaP('Campaign','Total Audience')]},640,290,610,270,'Audience by Channel'),
    visual(id+'tb','tableEx',{Values:[colP('Campaign','Campaign'),colP('Campaign','Segment'),colP('Campaign','Offer'),colP('Campaign','Channel'),colP('Campaign','Status'),meaP('Campaign','Total Audience')]},24,576,1226,250,'Campaign Activation Plan')
  ];}},
  { id: 'ReportSection' + pageHex('models'), name: 'Model Analytics', build(id) { return [
    textbox(id+'t','PREDICTIVE INTELLIGENCE LAB',24,8,1226,60,26),
    slicer(id+'s1','Model Metric','Model',24,80,200,44,'Model'), slicer(id+'s2','Model Metric','Dataset',234,80,200,44,'Metric Set'), slicer(id+'s3','Forecast','Period',444,80,220,44,'Forecast Period'),
    ...kpiRow(id+'k',[['Model Metric','ADF Statistic'],['Model Metric','ADF P Value'],['Model Metric','XGBoost Test MAE'],['Model Metric','XGBoost Test RMSE']],24,172,1226,100),
    visual(id+'tes','lineChart',{Category:[colP('Forecast','Week Start')],Y:[meaP('Forecast','Actual Sales Amount'),meaP('Forecast','TES Forecast Amount')]},24,290,398,220,'Triple Exponential Smoothing'),
    visual(id+'ari','lineChart',{Category:[colP('Forecast','Week Start')],Y:[meaP('Forecast','Actual Sales Amount'),meaP('Forecast','ARIMA Forecast Amount'),meaP('Forecast','SARIMA Forecast Amount')]},438,290,398,220,'ARIMA & SARIMA'),
    visual(id+'xgb','lineChart',{Category:[colP('Forecast','Week Start')],Y:[meaP('Forecast','Actual Sales Amount'),meaP('Forecast','XGBoost Forecast Amount')]},852,290,398,220,'XGBoost Generalization'),
    visual(id+'mt','tableEx',{Values:[colP('Model Metric','Model'),colP('Model Metric','Dataset'),colP('Model Metric','Metric'),colP('Model Metric','Value')]},24,526,500,300,'Data Diagnostic'),
    visual(id+'fg','tableEx',{Values:[colP('Forecast','Week Start'),colP('Forecast','Period'),meaP('Forecast','Actual Sales Amount'),meaP('Forecast','TES Forecast Amount'),meaP('Forecast','ARIMA Forecast Amount'),meaP('Forecast','SARIMA Forecast Amount'),meaP('Forecast','XGBoost Forecast Amount')]},540,526,710,300,'Forecast Gallery — Three Models, Three Behaviors')
  ];}}
];

function pageJson(p) { return { $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json', name:p.id, displayName:p.name, displayOption:'FitToWidth', height:p.height || 980, width:1280, filterConfig:{filters:[]}, objects:{ background:[{properties:{color:{solid:{color:lit('#F3F7FC')}},transparency:{expr:{Literal:{Value:'0D'}}}}}] } }; }

const schemas = {
  Sales: { file:'FactSales.csv', columns:[['Sales Order Line','string'],['Sales Order','string'],['Date Key','int64'],['Customer Key','int64'],['Product Key','int64'],['Territory Key','string'],['Channel','string'],['Order Quantity','int64'],['Unit Price','decimal'],['Sales Amount','decimal'],['Product Cost','decimal'],['Profit','decimal'],['Discount Pct','decimal']], measures:[
    ['Total Sales',"SUM('Sales'[Sales Amount])",'$#,##0'],['Total Profit',"SUM('Sales'[Profit])",'$#,##0'],['Profit Margin','DIVIDE([Total Profit], [Total Sales])','0.0%'],['Orders',"DISTINCTCOUNT('Sales'[Sales Order])",'#,##0'],['Units Sold',"SUM('Sales'[Order Quantity])",'#,##0'],['Average Order Value','DIVIDE([Total Sales], [Orders])','$#,##0'],['Sales Forecast','[Total Sales] * 1.035','$#,##0'],['Total Product Cost',"SUM('Sales'[Product Cost])",'$#,##0'],['Average Discount',"AVERAGE('Sales'[Discount Pct])",'0.0'],['Active Customers',"DISTINCTCOUNT('Sales'[Customer Key])",'#,##0'],['Repeat Active Customers',"CALCULATE(DISTINCTCOUNT('Sales'[Customer Key]), KEEPFILTERS('Customer'[Frequency] > 1))",'#,##0'],['New Active Customers',"CALCULATE(DISTINCTCOUNT('Sales'[Customer Key]), KEEPFILTERS('Customer'[Frequency] = 1))",'#,##0'] ] },
  Date: { file:'DimDate.csv', columns:[['Date Key','int64','DateKey'],['Date','string'],['Year','int64'],['Quarter','string'],['Month Number','int64','MonthNumber'],['Month','string'],['Year Month','string','YearMonth'],['Fiscal Year','string','FiscalYear'],['Fiscal Quarter','string','FiscalQuarter']] },
  Customer:{file:'DimCustomer.csv',columns:[['Customer Key','int64','CustomerKey'],['Customer ID','string','CustomerID'],['Customer','string'],['City','string'],['State Province','string','StateProvince'],['Country','string','CountryRegion'],['Postal Code','string','PostalCode'],['Recency Days','int64','RecencyDays'],['Frequency','int64'],['Monetary','decimal'],['RFM Segment','string','RFMSegment']],measures:[['Customers',"DISTINCTCOUNT('Customer'[Customer Key])",'#,##0'],['Repeat Customers',"CALCULATE([Customers], KEEPFILTERS('Customer'[Frequency] > 1))",'#,##0'],['Repeat Rate','DIVIDE([Repeat Customers], [Customers])','0.0%'],['Customer Revenue',"SUM('Customer'[Monetary])",'$#,##0'],['Average Customer Value','DIVIDE([Customer Revenue], [Customers])','$#,##0'],['Average Recency',"AVERAGE('Customer'[Recency Days])",'0 days']]},
  Product:{file:'DimProduct.csv',columns:[['Product Key','int64','ProductKey'],['SKU','string'],['Product','string'],['Model','string'],['Subcategory','string'],['Category','string'],['Standard Cost','decimal','StandardCost'],['List Price','decimal','ListPrice']]},
  Territory:{file:'DimTerritory.csv',columns:[['Territory Key','string','TerritoryKey'],['Region','string'],['Country','string'],['Group','string','TerritoryGroup']]},
  Campaign:{file:'Campaigns.csv',columns:[['Campaign Key','int64','CampaignKey'],['Segment','string','RFMSegment'],['Campaign','string'],['Campaign Type','string','CampaignType'],['Audience','int64'],['Offer','string'],['Channel','string'],['Status','string']],measures:[['Campaign Count',"DISTINCTCOUNT('Campaign'[Campaign])",'#,##0'],['Total Audience',"SUM('Campaign'[Audience])",'#,##0'],['Active Campaigns',"CALCULATE([Campaign Count], KEEPFILTERS('Campaign'[Status] = \"Ready\"))",'#,##0']]},
  Waterfall:{file:'WaterfallStages.csv',columns:[['Stage','string'],['Stage Order','int64','StageOrder']],measures:[['Waterfall Amount',"SWITCH(SELECTEDVALUE('Waterfall'[Stage]), \"1. Total Sales\", [Total Sales], \"2. Product Cost\", -[Total Product Cost], \"3. Gross Profit\", [Total Profit])",'$#,##0']]},
  Forecast:{file:'WeeklyForecasts.csv',columns:[['Week Start','dateTime'],['Period','string'],['Actual Sales','decimal'],['TES Forecast','decimal'],['ARIMA Forecast','decimal'],['SARIMA Forecast','decimal'],['XGBoost Forecast','decimal']],measures:[['Actual Sales Amount',"SUM('Forecast'[Actual Sales])",'$#,##0'],['TES Forecast Amount',"SUM('Forecast'[TES Forecast])",'$#,##0'],['ARIMA Forecast Amount',"SUM('Forecast'[ARIMA Forecast])",'$#,##0'],['SARIMA Forecast Amount',"SUM('Forecast'[SARIMA Forecast])",'$#,##0'],['XGBoost Forecast Amount',"SUM('Forecast'[XGBoost Forecast])",'$#,##0']]},
  'Model Metric':{file:'ModelMetrics.csv',columns:[['Model','string'],['Dataset','string'],['Metric','string'],['Value','decimal']],measures:[['ADF Statistic',"CALCULATE(MAX('Model Metric'[Value]), 'Model Metric'[Metric] = \"Test statistic\")",'0.000'],['ADF P Value',"CALCULATE(MAX('Model Metric'[Value]), 'Model Metric'[Metric] = \"p-value\")",'0.000'],['XGBoost Test MAE',"CALCULATE(MAX('Model Metric'[Value]), 'Model Metric'[Model] = \"XGBoost\", 'Model Metric'[Dataset] = \"Test\", 'Model Metric'[Metric] = \"MAE\")",'0.000'],['XGBoost Test RMSE',"CALCULATE(MAX('Model Metric'[Value]), 'Model Metric'[Model] = \"XGBoost\", 'Model Metric'[Dataset] = \"Test\", 'Model Metric'[Metric] = \"RMSE\")",'0.000']]}
};

function sourceName(label){ return label.replaceAll(' ','').replace('Pct','Pct'); }
function tableTmdl(table, spec) {
  const quote = (s) => /[^A-Za-z0-9_]/.test(s) ? `'${s}'` : s;
  const measures = (spec.measures||[]).map(([n,e,f])=>`\t/// Business measure used by the AdventureWorks report.\n\tmeasure ${quote(n)} = ${e}\n\t\tformatString: ${f}\n`).join('\n');
  const cols = spec.columns.map(([n,t,source])=>{ const technical=/ Key$|^Date Key$/.test(n); const src=source||sourceName(n); return `\t/// ${n} imported from the prepared AdventureWorks dataset.\n\tcolumn ${quote(n)}\n\t\tdataType: ${t}\n${technical?'\t\tisHidden\n':''}\t\tsummarizeBy: none\n\t\tsourceColumn: ${src}`; }).join('\n\n');
  const csvPath=path.join(root,'Data',spec.file).replaceAll('\\','\\\\');
  const transforms=spec.columns.map(([n,t,source])=>`{\"${source||sourceName(n)}\", ${t==='int64'?'Int64.Type':t==='decimal'?'Currency.Type':t==='dateTime'?'type datetime':'type text'}}`).join(', ');
  return `/// ${table} data for the native interactive AdventureWorks report.\ntable ${quote(table)}\n\n${measures}${cols}\n\n\tpartition ${quote(table)} = m\n\t\tmode: import\n\t\tsource =\n\t\t\tlet\n\t\t\t\tSource = Csv.Document(File.Contents(\"${csvPath}\"), [Delimiter=\",\", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),\n\t\t\t\t#\"Promoted Headers\" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),\n\t\t\t\t#\"Changed Types\" = Table.TransformColumnTypes(#\"Promoted Headers\", {${transforms}}, \"en-US\")\n\t\t\tin\n\t\t\t\t#\"Changed Types\"\n`;
}

fs.rmSync(modelDir,{recursive:true,force:true}); fs.rmSync(reportDir,{recursive:true,force:true});
write(path.join(root,`${name}.pbip`),{$schema:'https://developer.microsoft.com/json-schemas/fabric/pbip/pbipProperties/1.0.0/schema.json',version:'1.0',artifacts:[{report:{path:`${name}.Report`}}],settings:{enableAutoRecovery:true}});
write(path.join(modelDir,'definition.pbism'),{$schema:'https://developer.microsoft.com/json-schemas/fabric/item/semanticModel/definitionProperties/1.0.0/schema.json',version:'4.2',settings:{qnaEnabled:true}});
write(path.join(modelDir,'definition','database.tmdl'),`database ${crypto.randomUUID()}\n\tcompatibilityLevel: 1702\n\tcompatibilityMode: powerBI\n\tlanguage: 1033\n`);
write(path.join(modelDir,'definition','model.tmdl'),`model Model\n\tculture: en-US\n\tdefaultPowerBIDataSourceVersion: powerBI_V3\n\tsourceQueryCulture: en-US\n\tdiscourageImplicitMeasures\n\n${Object.keys(schemas).map(t=>`ref table ${/\s/.test(t)?`'${t}'`:t}`).join('\n')}\n`);
for(const [table,spec] of Object.entries(schemas)) write(path.join(modelDir,'definition','tables',`${table}.tmdl`),tableTmdl(table,spec));
write(path.join(modelDir,'definition','relationships.tmdl'),`relationship 'Sales to Date'\n\tfromColumn: Sales.'Date Key'\n\ttoColumn: Date.'Date Key'\n\nrelationship 'Sales to Customer'\n\tfromColumn: Sales.'Customer Key'\n\ttoColumn: Customer.'Customer Key'\n\nrelationship 'Sales to Product'\n\tfromColumn: Sales.'Product Key'\n\ttoColumn: Product.'Product Key'\n\nrelationship 'Sales to Territory'\n\tfromColumn: Sales.'Territory Key'\n\ttoColumn: Territory.'Territory Key'\n`);
write(path.join(reportDir,'definition.pbir'),{$schema:'https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json',version:'4.0',datasetReference:{byPath:{path:`../${name}.SemanticModel`}}});
write(path.join(reportDir,'.platform'),{$schema:'https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json',metadata:{type:'Report',displayName:name},config:{version:'2.0',logicalId:crypto.randomUUID()}});
write(path.join(definitionDir,'version.json'),{$schema:'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/versionMetadata/1.0.0/schema.json',version:'2.0.0'});
write(path.join(definitionDir,'report.json'),{$schema:'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/3.1.0/schema.json',themeCollection:{baseTheme:{name:'CY25SU12',reportVersionAtImport:{visual:'2.5.0',report:'3.1.0',page:'2.3.0'},type:'SharedResources'}},objects:{outspacePane:[{properties:{expanded:lit(false),visible:lit(true)}}]}});
write(path.join(pagesDir,'pages.json'),{$schema:'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.0.0/schema.json',pageOrder:pages.map(p=>p.id),activePageName:pages[0].id});
for(const p of pages){ const pd=path.join(pagesDir,p.id); write(path.join(pd,'page.json'),pageJson(p)); for(const v of p.build(p.id)) write(path.join(pd,'visuals',v.name,'visual.json'),v); }
console.log(`Created ${path.join(root, name+'.pbip')} with ${pages.length} pages.`);
