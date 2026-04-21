/**
 * Generates all logo/icon variants from sheetspin-new-logo/sheetspin-logo.svg.
 * Run with: node scripts/generate-logos.mjs
 */

import sharp from 'sharp';
import { readFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'sheetspin-new-logo', 'sheetspin-logo.svg');
const pub = join(root, 'public');

// Copy SVG variants
copyFileSync(src, join(pub, 'favicon.svg'));
copyFileSync(src, join(pub, 'logo.svg'));
console.log('✓ public/favicon.svg');
console.log('✓ public/logo.svg');

const svgBuffer = readFileSync(src);

const pngTargets = [
  { file: 'icon-192.png',        size: 192 },
  { file: 'icon-512.png',        size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size } of pngTargets) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(pub, file));
  console.log(`✓ public/${file} (${size}x${size})`);
}

// WebP variant (used internally)
await sharp(svgBuffer)
  .resize(192, 192)
  .webp({ quality: 90 })
  .toFile(join(pub, 'logo-initial.webp'));
console.log('✓ public/logo-initial.webp (192x192)');

console.log('\nAll logo assets generated from sheetspin-logo.svg');
