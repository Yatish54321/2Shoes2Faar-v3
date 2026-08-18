import fs from 'fs';
import path from 'path';
import gridData from '../src/data/india_grid_data.json';

const outputPath = path.join(process.cwd(), 'src/data/mosaic-cells.json');
fs.writeFileSync(outputPath, JSON.stringify(gridData, null, 2), 'utf-8');
console.log(`Synchronized ${gridData.cells.length} cells to ${outputPath}`);
