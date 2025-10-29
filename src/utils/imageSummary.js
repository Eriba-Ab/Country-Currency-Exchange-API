const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateSummaryImage({ total, top5, timestamp, outPath }) {
  // Make sure cache dir exists
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Create SVG with the text content
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="white"/>
      
      <!-- Title -->
      <text x="40" y="80" font-family="Arial" font-size="40" font-weight="bold" fill="#222">
        Country Summary
      </text>
      
      <!-- Total and timestamp -->
      <text x="40" y="140" font-family="Arial" font-size="28" fill="#222">
        Total countries: ${total}
      </text>
      <text x="40" y="180" font-family="Arial" font-size="28" fill="#222">
        Last refreshed: ${new Date(timestamp).toISOString()}
      </text>
      
      <!-- Top 5 header -->
      <text x="40" y="240" font-family="Arial" font-size="26" font-weight="bold" fill="#222">
        Top 5 by estimated GDP (USD equiv):
      </text>
      
      <!-- Top 5 list -->
      ${top5.map((c, idx) => {
        const y = 280 + (idx * 36);
        const gdpStr = c.estimated_gdp != null ? Number(c.estimated_gdp).toLocaleString() : 'N/A';
        return `
          <text x="60" y="${y}" font-family="Arial" font-size="22" fill="#222">
            ${idx + 1}. ${c.name} — ${gdpStr}
          </text>
        `;
      }).join('')}
    </svg>
  `;

  // Convert SVG to PNG using sharp
  await sharp(Buffer.from(svg))
    .toFile(outPath);
}

module.exports = { generateSummaryImage };
