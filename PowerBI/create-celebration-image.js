const fs = require('fs');
const path = require('path');

const resources = path.join(__dirname, 'AdventureWorksDynamic.Report', 'StaticResources', 'RegisteredResources');
const source = path.join(resources, 'thank-you-page26007271740.svg');
const target = path.join(resources, 'celebration-page26007271745.svg');
const colors = ['#FBBF24', '#38BDF8', '#A78BFA', '#FB7185', '#34D399', '#F97316'];

let pieces = '';
for (let i = 0; i < 150; i += 1) {
  const x = 18 + ((i * 83) % 1244);
  const y = 12 + ((i * 47) % 650);
  const size = 4 + (i % 7);
  const color = colors[i % colors.length];
  const rotation = (i * 37) % 180;
  if (i % 3 === 0) {
    pieces += `<circle cx="${x}" cy="${y}" r="${Math.max(2, size / 2)}" fill="${color}" opacity=".92"/>`;
  } else {
    pieces += `<rect x="${x}" y="${y}" width="${size}" height="${size + 7}" rx="2" fill="${color}" opacity=".92" transform="rotate(${rotation} ${x} ${y})"/>`;
  }
}

const overlay = `
  <!-- CELEBRATION_CONFETTI -->
  <g>${pieces}</g>
  <g font-family="Segoe UI,Arial,sans-serif" text-anchor="middle">
    <rect x="475" y="650" width="330" height="48" rx="24" fill="#ffffff" fill-opacity=".14" stroke="#bae6fd" stroke-opacity=".55"/>
    <text x="640" y="680" fill="#ffffff" font-size="13" font-weight="800">← THANK YOU SAYFASINA DÖN</text>
  </g>`;

let svg = fs.readFileSync(source, 'utf8');
svg = svg.replace(/\s*<\/svg>\s*$/, `${overlay}\n</svg>\n`);
fs.writeFileSync(target, svg, 'utf8');
console.log('Celebration image created.');
