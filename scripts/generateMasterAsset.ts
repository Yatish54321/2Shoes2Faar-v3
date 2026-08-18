import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import mosaicData from '../src/data/mosaic-cells.json';

async function generateMasterMosaicAsset() {
  const WIDTH = 1200;
  const HEIGHT = 1400;

  const GRID_COLS = 35;
  const GRID_ROWS = 45;

  // Calculate layout parameters
  const paddingX = 140;
  const paddingY = 40;
  const availableWidth = WIDTH - paddingX * 2;
  const availableHeight = HEIGHT - paddingY * 2;

  const cellSize = Math.min(availableWidth / GRID_COLS, availableHeight / GRID_ROWS);
  const cellGap = 3;
  const squareSize = cellSize - cellGap;

  const totalGridWidth = GRID_COLS * cellSize;
  const totalGridHeight = GRID_ROWS * cellSize;

  const startX = (WIDTH - totalGridWidth) / 2;
  const startY = (HEIGHT - totalGridHeight) / 2;

  // Build SVG overlays for the black squares
  const squaresSvg = mosaicData.cells.map(cell => {
    const px = startX + cell.x * cellSize;
    const py = startY + cell.y * cellSize;
    return `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${squareSize.toFixed(1)}" height="${squareSize.toFixed(1)}" rx="2" ry="2" fill="#08080C" stroke="#22272F" stroke-width="1.2" />`;
  }).join('\n');

  const fullSvg = `
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0B132B" stop-opacity="0.75" />
        <stop offset="50%" stop-color="#1C2541" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#0B132B" stop-opacity="0.85" />
      </linearGradient>
    </defs>
    
    <!-- Dark contrast gradient layer -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)" />

    <!-- 567 India Mosaic Black Cells -->
    <g id="mosaic-cells">
      ${squaresSvg}
    </g>
  </svg>
  `;

  // Fetch or compose mountain image
  const mountainUrl = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=85";
  
  let mountainBuffer: Buffer;
  try {
    const res = await fetch(mountainUrl);
    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      mountainBuffer = Buffer.from(arrayBuf);
    } else {
      throw new Error(`Failed to fetch image: ${res.status}`);
    }
  } catch (err) {
    console.warn("Could not fetch remote mountain image, creating synthetic backdrop:", err);
    mountainBuffer = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      }
    }).png().toBuffer();
  }

  // Composite mountain background + SVG black squares
  const resizedMountain = await sharp(mountainBuffer)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .modulate({ saturation: 0.7, brightness: 0.85 })
    .toBuffer();

  const finalImage = await sharp(resizedMountain)
    .composite([
      {
        input: Buffer.from(fullSvg),
        top: 0,
        left: 0
      }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  const publicDir = path.join(process.cwd(), 'public/assets');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outPath = path.join(publicDir, 'mosaic_reference_map.jpg');
  fs.writeFileSync(outPath, finalImage);
  console.log(`Saved master visual asset to ${outPath} (${WIDTH}x${HEIGHT})`);
}

generateMasterMosaicAsset().catch(console.error);
