const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { QRCodeSVG } = require('qrcode.react');

const target = path.join(
  __dirname,
  'AdventureWorksDynamic.Report',
  'StaticResources',
  'RegisteredResources',
  'thank-you-page26007271740.svg'
);

const presentationUrl = 'https://dashboard-adventure.vercel.app/';
const qr = renderToStaticMarkup(
  React.createElement(QRCodeSVG, {
    value: presentationUrl,
    size: 104,
    level: 'H',
    marginSize: 2,
    fgColor: '#082D5C',
    bgColor: '#FFFFFF',
    title: 'AdventureWorks mobile presentation'
  })
);

const block = `<!-- MOBILE_QR_START -->
  <g font-family="Segoe UI,Arial,sans-serif" text-anchor="middle" filter="url(#shadow)">
    <rect x="1050" y="548" width="160" height="142" rx="20" fill="#ffffff" stroke="#c4b5fd" stroke-width="2"/>
    <g transform="translate(1078 558)">${qr}</g>
    <text x="1130" y="681" fill="#082D5C" font-size="11" font-weight="800">SCAN FOR MOBILE</text>
  </g>
  <!-- MOBILE_QR_END -->`;

let svg = fs.readFileSync(target, 'utf8');
svg = svg.replace(/\s*<!-- MOBILE_QR_START -->[\s\S]*?<!-- MOBILE_QR_END -->/g, '');
svg = svg.replace(/\s*<\/svg>\s*$/, `\n${block}\n</svg>\n`);
fs.writeFileSync(target, svg, 'utf8');

console.log(`QR added: ${presentationUrl}`);
