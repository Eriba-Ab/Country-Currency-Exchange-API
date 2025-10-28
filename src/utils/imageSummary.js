const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

async function generateSummaryImage({ total, top5, timestamp, outPath }) {
  // Make sure cache dir exists
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#222';
  ctx.font = 'bold 40px Sans';
  ctx.fillText('Country Summary', 40, 80);

  // Total
  ctx.font = '28px Sans';
  ctx.fillText(`Total countries: ${total}`, 40, 140);
  ctx.fillText(`Last refreshed: ${new Date(timestamp).toISOString()}`, 40, 180);

  // Top 5 list
  ctx.font = 'bold 26px Sans';
  ctx.fillText('Top 5 by estimated GDP (USD equiv):', 40, 240);

  ctx.font = '22px Sans';
  let y = 280;
  top5.forEach((c, idx) => {
    const gdpStr = c.estimated_gdp != null ? Number(c.estimated_gdp).toLocaleString() : 'N/A';
    ctx.fillText(`${idx + 1}. ${c.name} — ${gdpStr}`, 60, y);
    y += 36;
  });

  // Save file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
}

module.exports = { generateSummaryImage };
