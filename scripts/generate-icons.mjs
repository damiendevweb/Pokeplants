import sharp from 'sharp';
import { mkdir } from 'fs/promises';

const sizes = [192, 512];
const outDir = 'public/icons';
await mkdir(outDir, { recursive: true });

for (const size of sizes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#2c1810"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="${Math.round(size * 0.55)}">🌿</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`${outDir}/icon-${size}.png`);

  const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#2c1810"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="${Math.round(size * 0.5)}">🌿</text>
  </svg>`;

  await sharp(Buffer.from(svgMaskable))
    .png()
    .toFile(`${outDir}/icon-maskable-${size}.png`);

  console.log(`✅ Generated icon-${size}.png & icon-maskable-${size}.png`);
}

console.log('Done!');
