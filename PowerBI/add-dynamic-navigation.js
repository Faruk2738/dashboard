const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, 'AdventureWorksDynamic.Report', 'definition');
const pagesRoot = path.join(root, 'pages');
const pagesFile = path.join(pagesRoot, 'pages.json');

const INTRO = 'ReportSection6dc09cc759179c2bc5c4b420';
const CLOSING = 'ReportSection1efc42d3e9d8ec69bd55c69f';
const HOME = 'ReportSectione83249bd3ba79932e16fb1fb';

const hash = (value, size = 20) => crypto.createHash('sha1').update(value).digest('hex').slice(0, size);
const literal = value => ({ expr: { Literal: { Value: typeof value === 'string' ? `'${value}'` : `${value}` } } });
const color = value => ({ solid: { color: literal(value) } });

function containerStyle(background, border = '#1B4F8A', radius = 12, transparency = 0) {
  return {
    background: [{ properties: { show: literal(true), color: color(background), transparency: literal(`${transparency}D`) } }],
    border: [{ properties: { show: literal(true), color: color(border), radius: literal(`${radius}D`), width: literal('1D') } }]
  };
}

function transparentContainer() {
  return {
    background: [{ properties: { show: literal(false), color: color('#061A36'), transparency: literal('100D') } }],
    border: [{ properties: { show: literal(false), color: color('#061A36'), radius: literal('0D'), width: literal('0D') } }]
  };
}

function textbox(key, x, y, width, height, value, options = {}) {
  const name = hash(key);
  const textStyle = {
    fontFamily: 'Segoe UI',
    fontSize: `${options.size || 24}px`,
    color: options.color || '#FFFFFF'
  };
  if (options.bold !== false) textStyle.fontWeight = 'bold';
  return {
    name,
    json: {
      $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.11.0/schema.json',
      name,
      position: { x, y, z: options.z || 1000, height, width, tabOrder: options.z || 1000 },
      visual: {
        visualType: 'textbox',
        objects: {
          general: [{ properties: { paragraphs: [{ textRuns: [{ value, textStyle }], horizontalTextAlignment: options.align || 'center' }] } }]
        },
        visualContainerObjects: options.background
          ? containerStyle(options.background, options.border || options.background, options.radius || 12, options.transparency || 0)
          : transparentContainer()
      }
    }
  };
}

function navigator(key, x, y, width, height, z = 3000) {
  const name = hash(key);
  return {
    name,
    json: {
      $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.11.0/schema.json',
      name,
      position: { x, y, z, height, width, tabOrder: z },
      visual: {
        visualType: 'pageNavigator',
        objects: {
          layout: [{ properties: { orientation: literal('0'), rowCount: literal('1D'), columnCount: literal('7D'), cellPadding: literal('4D') } }],
          pages: [{ properties: { showHiddenPages: literal(false), showTooltipPages: literal(false), showByDefault: literal(true), showPage: literal(true) } }],
          shape: [{ properties: { tileShape: literal('rectangleRounded'), roundEdge: literal('10D') } }]
        },
        visualContainerObjects: containerStyle('#FFFFFF', '#8AB7F0', 12)
      }
    }
  };
}

function pageDefinition(name, displayName) {
  return {
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json',
    name,
    displayName,
    displayOption: 'FitToPage',
    height: 720,
    width: 1280,
    objects: {
      background: [{ properties: { color: color('#061A36'), transparency: literal('0D') } }]
    }
  };
}

function writeVisual(pageId, visual) {
  const dir = path.join(pagesRoot, pageId, 'visuals', visual.name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'visual.json'), JSON.stringify(visual.json, null, 2) + '\n', 'utf8');
}

function writePage(pageId, displayName, visuals) {
  const dir = path.join(pagesRoot, pageId);
  const visualsDir = path.join(dir, 'visuals');
  // This script owns only the two added presentation pages; replace their generated visuals cleanly.
  if (fs.existsSync(visualsDir)) fs.rmSync(visualsDir, { recursive: true, force: true });
  fs.mkdirSync(visualsDir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.json'), JSON.stringify(pageDefinition(pageId, displayName), null, 2) + '\n', 'utf8');
  for (const visual of visuals) writeVisual(pageId, visual);
}

const introVisuals = [
  textbox('intro-bike', 590, 38, 100, 88, '🚲', { size: 40, color: '#FCD34D', background: '#173D6B', border: '#7DD3FC', radius: 24, transparency: 12, z: 100 }),
  textbox('intro-badge', 378, 142, 524, 52, 'miuul   │   MIUUL DATA ANALYTICS BOOTCAMP 10. DÖNEM', { size: 14, background: '#173D6B', border: '#7DD3FC', radius: 26, transparency: 10, z: 110 }),
  textbox('intro-date', 490, 208, 300, 42, '▣  29–31 TEMMUZ 2026', { size: 14, color: '#FDE68A', background: '#5A461D', border: '#FCD34D', radius: 21, transparency: 24, z: 120 }),
  textbox('intro-title', 160, 267, 960, 72, 'AdventureWorks', { size: 46, z: 130 }),
  textbox('intro-subtitle', 160, 337, 960, 72, 'Final Project', { size: 43, color: '#D9F1FF', z: 131 }),
  textbox('intro-message', 220, 417, 840, 55, 'Miuul ailesinin değerli üyeleri, final proje sunumumuza hoş geldiniz.', { size: 18, color: '#D7E8FF', bold: false, z: 140 }),
  textbox('intro-description', 240, 470, 800, 64, 'Bu çalışma, Miuul Data Analytics Bootcamp 10. Dönem yolculuğunda\nGroup by Adventure Riders takımı olarak hazırladığımız veri analitiği final projesidir.', { size: 13, color: '#AFC9E8', bold: false, z: 141 }),
  textbox('intro-family', 440, 536, 400, 32, '♟  MIUUL AİLESİNE ÖZEL FİNAL SUNUMU', { size: 11, color: '#BAE6FD', z: 150 }),
  textbox('intro-start', 475, 578, 330, 56, '▶   SUNUMU BAŞLAT', { size: 17, background: '#1677D2', border: '#7DD3FC', radius: 28, z: 160 }),
  textbox('intro-hub', 490, 640, 300, 24, 'AdventureWorks Analytics Hub', { size: 10, color: '#7898BE', bold: false, z: 170 }),
  navigator('intro-navigator', 390, 675, 500, 32, 180)
];

const closingVisuals = [
  textbox('closing-badge', 400, 30, 480, 44, 'miuul   │   DATA ANALYTICS BOOTCAMP 10. DÖNEM', { size: 13, background: '#173D6B', border: '#7DD3FC', radius: 22, transparency: 10, z: 100 }),
  textbox('closing-award', 606, 86, 68, 62, '★', { size: 29, color: '#FCD34D', background: '#5A461D', border: '#FCD34D', radius: 18, transparency: 18, z: 110 }),
  textbox('closing-project', 390, 153, 500, 30, 'ADVENTUREWORKS FINAL PROJECT', { size: 12, color: '#BAE6FD', z: 120 }),
  textbox('closing-title', 170, 184, 940, 76, 'Teşekkürler!', { size: 48, color: '#FFFFFF', z: 130 }),
  textbox('closing-message', 220, 260, 840, 54, 'Sunumumuzu dinlediğiniz ve bu özel anı bizimle paylaştığınız için çok teşekkür ederiz.', { size: 17, color: '#D7E8FF', bold: false, z: 140 }),
  textbox('closing-card-1', 74, 336, 356, 192, '✦  REHBERLİĞİNİZ İÇİN\n\nBootcamp yolculuğumuzda başta Atilla Yardımcı hocamıza ve mentorumuz Doğukan Erdoğan’a destekleri ve yol göstericilikleri için içtenlikle teşekkür ederiz.', { size: 14, color: '#E9F7FF', background: '#173D6B', border: '#7DD3FC', radius: 22, transparency: 12, z: 150 }),
  textbox('closing-card-2', 462, 336, 356, 192, '♟  EMEĞİNİZ İÇİN\n\nEğlenceli, eğitici ve öğretici dersleri için Halil, Fatmanur, İbrahim ve Mert hocalarımıza; tüm mentor ve TA hocalarımıza çok teşekkür ederiz.', { size: 14, color: '#FFF5D6', background: '#3F3B36', border: '#FCD34D', radius: 22, transparency: 10, z: 151 }),
  textbox('closing-card-3', 850, 336, 356, 192, '♥  AİLE HİSSİ İÇİN\n\nBizlere bir aile hissi yaşatan; pozitif enerjisi, güler yüzü ve motivasyonuyla yanımızda olan Oya hocamıza da teşekkür etmeyi bir borç biliyoruz.', { size: 14, color: '#FFE4ED', background: '#493449', border: '#FDA4AF', radius: 22, transparency: 10, z: 152 }),
  textbox('closing-actions', 330, 552, 620, 48, '🎉  KUTLAMAYI YENİDEN BAŞLAT     │     🚲  DASHBOARD’A DÖN', { size: 13, color: '#FDE68A', background: '#173D6B', border: '#7DD3FC', radius: 24, transparency: 10, z: 160 }),
  textbox('closing-team', 440, 611, 400, 28, 'GROUP BY ADVENTURE RIDERS', { size: 11, color: '#7898BE', z: 170 }),
  navigator('closing-navigator', 390, 665, 500, 32, 180)
];

writePage(INTRO, 'Welcome', introVisuals);
writePage(CLOSING, 'Thank You', closingVisuals);

// Home sayfasındaki mevcut görsellere dokunmadan yalnızca boş üst alana menü eklenir.
writeVisual(HOME, textbox('home-menu-label', 494, 80, 100, 76, 'MENU', { size: 16, background: '#082D5C', border: '#0B2853', radius: 12, z: 9000 }));
writeVisual(HOME, navigator('home-page-navigator', 604, 80, 646, 76, 9001));

const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
const retained = pages.pageOrder.filter(id => id !== INTRO && id !== CLOSING);
pages.pageOrder = [INTRO, ...retained, CLOSING];
pages.activePageName = INTRO;
try {
  fs.writeFileSync(pagesFile, JSON.stringify(pages, null, 2) + '\n', 'utf8');
} catch (error) {
  if (error.code !== 'EPERM') throw error;
}

// Desktop tarafından kaldırılmış olabilen şema bilgisini doğrulama araçları için geri ekle.
const definitionFile = path.join(__dirname, 'AdventureWorksDynamic.Report', 'definition.pbir');
const definition = JSON.parse(fs.readFileSync(definitionFile, 'utf8'));
if (!definition.$schema) {
  definition.$schema = 'https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json';
  try {
    fs.writeFileSync(definitionFile, JSON.stringify(definition, null, 2) + '\n', 'utf8');
  } catch (error) {
    if (error.code !== 'EPERM') throw error;
  }
}

console.log('AdventureWorksDynamic: Welcome/Thank You pages and Home navigation added.');
