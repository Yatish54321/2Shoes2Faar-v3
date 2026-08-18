import { MosaicCell, Supporter } from '../types';
import gridData from './india_grid_data.json';

export const GRID_COLS = gridData.cols || 41;
export const GRID_ROWS = gridData.rows || 47;
export const MOSAIC_META = {
  gridCols: GRID_COLS,
  gridRows: GRID_ROWS,
  totalCells: (gridData.cells && gridData.cells.length) || 674,
  originX: gridData.originX || 285.8,
  originY: gridData.originY || 40.2,
  pitchX: gridData.pitchX || 26.23,
  pitchY: gridData.pitchY || 26.46,
  cellW: 21,
  cellH: 21,
  description: "Official 674-cell Pixel-Accurate India Mosaic Grid Matrix"
};

/**
 * Generates the full array of pixel-accurate interactive mosaic cells.
 */
export function generateIndiaMosaicGrid(): MosaicCell[] {
  if (gridData.cells && Array.isArray(gridData.cells)) {
    return gridData.cells.map((c: any) => ({
      cellId: c.cellId,
      x: c.x,
      y: c.y,
      pixelX: c.pixelX,
      pixelY: c.pixelY,
      leftPercent: c.leftPercent,
      topPercent: c.topPercent,
      widthPercent: c.widthPercent,
      heightPercent: c.heightPercent,
      valid: true,
      isBlackTile: !!c.isBlackTile,
      region: c.region,
      stateName: c.stateName,
      cityName: c.cityName,
      normX: c.x / GRID_COLS,
      normY: c.y / GRID_ROWS,
      normWidth: 1 / GRID_COLS,
      normHeight: 1 / GRID_ROWS
    }));
  }
  return [];
}

/**
 * Normalizes city names for fuzzy semantic matching (e.g. 'mumbai' -> 'mumbai', 'bangalore' -> 'bengaluru')
 */
function normalizeLocationString(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

/**
 * Centroid Coordinates (Grid X, Y) for accurate Geographic Center-to-Spiral placement.
 * Based on official GIS coordinates scaled to the 41x47 India Mosaic Matrix.
 */
const CITY_CENTROIDS: Record<string, { x: number; y: number; state: string; region: string }> = {
  // Madhya Pradesh (Gwalior in north MP near UP border, Bhopal in center MP, Indore in SW MP, Jabalpur in East MP)
  gwalior: { x: 13, y: 16, state: 'madhya pradesh', region: 'central' },
  morena: { x: 13, y: 15, state: 'madhya pradesh', region: 'central' },
  bhind: { x: 14, y: 16, state: 'madhya pradesh', region: 'central' },
  shivpuri: { x: 12, y: 16, state: 'madhya pradesh', region: 'central' },
  datia: { x: 13, y: 16, state: 'madhya pradesh', region: 'central' },
  bhopal: { x: 11, y: 18, state: 'madhya pradesh', region: 'central' },
  indore: { x: 10, y: 19, state: 'madhya pradesh', region: 'central' },
  ujjain: { x: 10, y: 18, state: 'madhya pradesh', region: 'central' },
  jabalpur: { x: 15, y: 18, state: 'madhya pradesh', region: 'central' },
  sagar: { x: 14, y: 17, state: 'madhya pradesh', region: 'central' },
  rewa: { x: 17, y: 17, state: 'madhya pradesh', region: 'central' },
  satna: { x: 16, y: 17, state: 'madhya pradesh', region: 'central' },

  // Maharashtra
  mumbai: { x: 7, y: 25, state: 'maharashtra', region: 'south' },
  bombay: { x: 7, y: 25, state: 'maharashtra', region: 'south' },
  thane: { x: 8, y: 24, state: 'maharashtra', region: 'south' },
  'navi mumbai': { x: 8, y: 25, state: 'maharashtra', region: 'south' },
  pune: { x: 9, y: 26, state: 'maharashtra', region: 'west' },
  nagpur: { x: 14, y: 20, state: 'maharashtra', region: 'central' },
  nashik: { x: 9, y: 21, state: 'maharashtra', region: 'west' },
  aurangabad: { x: 11, y: 23, state: 'maharashtra', region: 'west' },
  sambhajinagar: { x: 11, y: 23, state: 'maharashtra', region: 'west' },
  kolhapur: { x: 9, y: 28, state: 'maharashtra', region: 'west' },
  ratnagiri: { x: 7, y: 28, state: 'maharashtra', region: 'south' },
  sindhudurg: { x: 7, y: 29, state: 'maharashtra', region: 'south' },
  solapur: { x: 11, y: 26, state: 'maharashtra', region: 'west' },
  amravati: { x: 13, y: 21, state: 'maharashtra', region: 'central' },
  wardha: { x: 14, y: 21, state: 'maharashtra', region: 'central' },
  chandrapur: { x: 15, y: 22, state: 'maharashtra', region: 'central' },
  akola: { x: 12, y: 21, state: 'maharashtra', region: 'central' },
  nanded: { x: 14, y: 24, state: 'maharashtra', region: 'west' },

  // Goa
  goa: { x: 7, y: 31, state: 'goa', region: 'south' },
  panaji: { x: 7, y: 31, state: 'goa', region: 'south' },
  margao: { x: 7, y: 32, state: 'goa', region: 'south' },
  vasco: { x: 7, y: 31, state: 'goa', region: 'south' },

  // Karnataka
  bengaluru: { x: 14, y: 33, state: 'karnataka', region: 'south' },
  bangalore: { x: 14, y: 33, state: 'karnataka', region: 'south' },
  udupi: { x: 8, y: 34, state: 'karnataka', region: 'south' },
  mangalore: { x: 8, y: 35, state: 'karnataka', region: 'south' },
  mangaluru: { x: 8, y: 35, state: 'karnataka', region: 'south' },
  manipal: { x: 8, y: 34, state: 'karnataka', region: 'south' },
  gokarna: { x: 8, y: 34, state: 'karnataka', region: 'south' },
  karwar: { x: 8, y: 34, state: 'karnataka', region: 'south' },
  mysore: { x: 11, y: 35, state: 'karnataka', region: 'south' },
  mysuru: { x: 11, y: 35, state: 'karnataka', region: 'south' },
  hubli: { x: 10, y: 29, state: 'karnataka', region: 'south' },
  hubballi: { x: 10, y: 29, state: 'karnataka', region: 'south' },
  dharwad: { x: 10, y: 29, state: 'karnataka', region: 'south' },
  belgaum: { x: 9, y: 29, state: 'karnataka', region: 'south' },
  belagavi: { x: 9, y: 29, state: 'karnataka', region: 'south' },
  shivamogga: { x: 10, y: 32, state: 'karnataka', region: 'south' },
  shimoga: { x: 10, y: 32, state: 'karnataka', region: 'south' },
  kalaburagi: { x: 13, y: 28, state: 'karnataka', region: 'south' },
  gulbarga: { x: 13, y: 28, state: 'karnataka', region: 'south' },

  // Tamil Nadu
  chennai: { x: 19, y: 33, state: 'tamil nadu', region: 'south' },
  madras: { x: 19, y: 33, state: 'tamil nadu', region: 'south' },
  coimbatore: { x: 13, y: 36, state: 'tamil nadu', region: 'south' },
  madurai: { x: 14, y: 40, state: 'tamil nadu', region: 'south' },
  trichy: { x: 15, y: 36, state: 'tamil nadu', region: 'south' },
  tiruchirappalli: { x: 15, y: 36, state: 'tamil nadu', region: 'south' },
  salem: { x: 14, y: 35, state: 'tamil nadu', region: 'south' },
  tirunelveli: { x: 14, y: 42, state: 'tamil nadu', region: 'south' },
  kanyakumari: { x: 14, y: 44, state: 'tamil nadu', region: 'south' },
  kanchipuram: { x: 18, y: 33, state: 'tamil nadu', region: 'south' },
  vellore: { x: 17, y: 33, state: 'tamil nadu', region: 'south' },

  // Kerala
  kochi: { x: 10, y: 39, state: 'kerala', region: 'south' },
  cochin: { x: 10, y: 39, state: 'kerala', region: 'south' },
  trivandrum: { x: 11, y: 42, state: 'kerala', region: 'south' },
  thiruvananthapuram: { x: 11, y: 42, state: 'kerala', region: 'south' },
  kozhikode: { x: 9, y: 37, state: 'kerala', region: 'south' },
  calicut: { x: 9, y: 37, state: 'kerala', region: 'south' },
  kannur: { x: 9, y: 37, state: 'kerala', region: 'south' },
  wayanad: { x: 10, y: 37, state: 'kerala', region: 'south' },
  thrissur: { x: 10, y: 38, state: 'kerala', region: 'south' },
  alappuzha: { x: 10, y: 40, state: 'kerala', region: 'south' },
  kollam: { x: 10, y: 41, state: 'kerala', region: 'south' },

  // Delhi & NCR
  delhi: { x: 12, y: 12, state: 'delhi', region: 'north' },
  'new delhi': { x: 12, y: 12, state: 'delhi', region: 'north' },
  ncr: { x: 12, y: 12, state: 'delhi', region: 'north' },
  gurgaon: { x: 11, y: 13, state: 'haryana', region: 'north' },
  gurugram: { x: 11, y: 13, state: 'haryana', region: 'north' },
  noida: { x: 13, y: 13, state: 'uttar pradesh', region: 'north' },
  faridabad: { x: 12, y: 13, state: 'haryana', region: 'north' },

  // Uttar Pradesh
  lucknow: { x: 17, y: 14, state: 'uttar pradesh', region: 'north' },
  kanpur: { x: 16, y: 14, state: 'uttar pradesh', region: 'north' },
  varanasi: { x: 19, y: 15, state: 'uttar pradesh', region: 'north' },
  banaras: { x: 19, y: 15, state: 'uttar pradesh', region: 'north' },
  prayagraj: { x: 18, y: 15, state: 'uttar pradesh', region: 'north' },
  allahabad: { x: 18, y: 15, state: 'uttar pradesh', region: 'north' },
  agra: { x: 13, y: 13, state: 'uttar pradesh', region: 'north' },
  mathura: { x: 12, y: 13, state: 'uttar pradesh', region: 'north' },
  ayodhya: { x: 18, y: 14, state: 'uttar pradesh', region: 'north' },
  gorakhpur: { x: 20, y: 14, state: 'uttar pradesh', region: 'north' },
  jhansi: { x: 15, y: 16, state: 'uttar pradesh', region: 'north' },

  // Rajasthan
  jaipur: { x: 8, y: 14, state: 'rajasthan', region: 'west' },
  jodhpur: { x: 6, y: 14, state: 'rajasthan', region: 'west' },
  udaipur: { x: 8, y: 17, state: 'rajasthan', region: 'west' },
  kota: { x: 10, y: 16, state: 'rajasthan', region: 'west' },
  bikaner: { x: 5, y: 12, state: 'rajasthan', region: 'west' },
  jaisalmer: { x: 3, y: 14, state: 'rajasthan', region: 'west' },
  ajmer: { x: 7, y: 14, state: 'rajasthan', region: 'west' },

  // Gujarat
  ahmedabad: { x: 7, y: 19, state: 'gujarat', region: 'west' },
  surat: { x: 8, y: 22, state: 'gujarat', region: 'west' },
  vadodara: { x: 8, y: 20, state: 'gujarat', region: 'west' },
  baroda: { x: 8, y: 20, state: 'gujarat', region: 'west' },
  rajkot: { x: 4, y: 20, state: 'gujarat', region: 'west' },
  jamnagar: { x: 2, y: 20, state: 'gujarat', region: 'west' },
  bhuj: { x: 2, y: 18, state: 'gujarat', region: 'west' },

  // Telangana & Andhra Pradesh
  hyderabad: { x: 15, y: 25, state: 'telangana', region: 'south' },
  secunderabad: { x: 15, y: 25, state: 'telangana', region: 'south' },
  warangal: { x: 17, y: 24, state: 'telangana', region: 'south' },
  visakhapatnam: { x: 22, y: 23, state: 'andhra pradesh', region: 'south' },
  vijayawada: { x: 19, y: 26, state: 'andhra pradesh', region: 'south' },
  guntur: { x: 19, y: 27, state: 'andhra pradesh', region: 'south' },
  tirupati: { x: 17, y: 29, state: 'andhra pradesh', region: 'south' },

  // East & Northeast
  kolkata: { x: 24, y: 19, state: 'west bengal', region: 'east' },
  patna: { x: 21, y: 14, state: 'bihar', region: 'east' },
  ranchi: { x: 21, y: 18, state: 'jharkhand', region: 'east' },
  bhubaneswar: { x: 21, y: 22, state: 'odisha', region: 'east' },
  raipur: { x: 17, y: 19, state: 'chhattisgarh', region: 'central' },
  guwahati: { x: 30, y: 15, state: 'assam', region: 'northeast' },
  shillong: { x: 30, y: 16, state: 'meghalaya', region: 'northeast' },
  gangtok: { x: 28, y: 13, state: 'sikkim', region: 'northeast' },
  itanagar: { x: 34, y: 13, state: 'arunachal pradesh', region: 'northeast' },
  kohima: { x: 36, y: 16, state: 'nagaland', region: 'northeast' },
  imphal: { x: 35, y: 19, state: 'manipur', region: 'northeast' },
  aizawl: { x: 34, y: 21, state: 'mizoram', region: 'northeast' },
  agartala: { x: 31, y: 20, state: 'tripura', region: 'northeast' },

  // North
  chandigarh: { x: 11, y: 9, state: 'punjab', region: 'north' },
  amritsar: { x: 8, y: 8, state: 'punjab', region: 'north' },
  ludhiana: { x: 9, y: 9, state: 'punjab', region: 'north' },
  shimla: { x: 12, y: 8, state: 'himachal pradesh', region: 'north' },
  dehradun: { x: 14, y: 9, state: 'uttarakhand', region: 'north' },
  srinagar: { x: 9, y: 3, state: 'jammu & kashmir', region: 'north' },
  jammu: { x: 8, y: 5, state: 'jammu & kashmir', region: 'north' },
  leh: { x: 13, y: 3, state: 'ladakh', region: 'north' }
};

const STATE_CENTROIDS: Record<string, { x: number; y: number; region: string }> = {
  'madhya pradesh': { x: 13, y: 17, region: 'central' },
  maharashtra: { x: 10, y: 25, region: 'west' },
  karnataka: { x: 11, y: 32, region: 'south' },
  'tamil nadu': { x: 15, y: 37, region: 'south' },
  kerala: { x: 10, y: 39, region: 'south' },
  'uttar pradesh': { x: 16, y: 14, region: 'north' },
  delhi: { x: 12, y: 12, region: 'north' },
  rajasthan: { x: 7, y: 14, region: 'west' },
  gujarat: { x: 6, y: 20, region: 'west' },
  telangana: { x: 16, y: 25, region: 'south' },
  'andhra pradesh': { x: 18, y: 27, region: 'south' },
  'west bengal': { x: 24, y: 19, region: 'east' },
  bihar: { x: 21, y: 15, region: 'east' },
  jharkhand: { x: 21, y: 18, region: 'east' },
  odisha: { x: 20, y: 22, region: 'east' },
  chhattisgarh: { x: 17, y: 19, region: 'central' },
  punjab: { x: 9, y: 9, region: 'north' },
  haryana: { x: 11, y: 11, region: 'north' },
  'himachal pradesh': { x: 12, y: 7, region: 'north' },
  uttarakhand: { x: 14, y: 9, region: 'north' },
  'jammu & kashmir': { x: 9, y: 4, region: 'north' },
  ladakh: { x: 13, y: 3, region: 'north' },
  goa: { x: 7, y: 31, region: 'south' },
  assam: { x: 31, y: 15, region: 'northeast' },
  sikkim: { x: 28, y: 13, region: 'northeast' },
  meghalaya: { x: 30, y: 17, region: 'northeast' },
  'arunachal pradesh': { x: 34, y: 13, region: 'northeast' },
  nagaland: { x: 36, y: 17, region: 'northeast' },
  manipur: { x: 35, y: 19, region: 'northeast' },
  mizoram: { x: 34, y: 22, region: 'northeast' },
  tripura: { x: 31, y: 21, region: 'northeast' }
};

/**
 * Helper to determine macro India region for any Indian state/UT.
 */
export function getRegionForState(stateName?: string): 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast' | 'islands' {
  if (!stateName) return 'central';
  const norm = stateName.toLowerCase().trim();
  if (['delhi', 'delhi ncr', 'haryana', 'punjab', 'uttar pradesh', 'himachal pradesh', 'uttarakhand', 'jammu & kashmir', 'ladakh', 'chandigarh'].some(s => norm.includes(s))) {
    return 'north';
  }
  if (['karnataka', 'tamil nadu', 'kerala', 'andhra pradesh', 'telangana', 'goa', 'puducherry'].some(s => norm.includes(s))) {
    return 'south';
  }
  if (['maharashtra', 'gujarat', 'rajasthan', 'dadra'].some(s => norm.includes(s))) {
    return 'west';
  }
  if (['madhya pradesh', 'chhattisgarh'].some(s => norm.includes(s))) {
    return 'central';
  }
  if (['west bengal', 'bihar', 'jharkhand', 'odisha'].some(s => norm.includes(s))) {
    return 'east';
  }
  if (['assam', 'meghalaya', 'sikkim', 'arunachal pradesh', 'nagaland', 'manipur', 'mizoram', 'tripura'].some(s => norm.includes(s))) {
    return 'northeast';
  }
  if (['andaman', 'nicobar', 'lakshadweep'].some(s => norm.includes(s))) {
    return 'islands';
  }
  return 'central';
}

/**
 * Helper to determine accurate macro India region for any City & State combination.
 * Explicitly maps:
 * - Mumbai, Thane, Navi Mumbai, Bhiwandi, Palghar -> 'south'
 * - Nagpur, Wardha, Amravati, Chandrapur, Akola -> 'central'
 * - Gwalior, Bhopal, Indore, Jabalpur -> 'central'
 * - Pune, Nashik, Aurangabad -> 'west'
 */
export function getRegionForLocation(
  cityName?: string,
  stateName?: string
): 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast' | 'islands' {
  const normCity = normalizeLocationString(cityName);
  const normState = normalizeLocationString(stateName);

  // 1. Direct match in CITY_CENTROIDS
  for (const [key, val] of Object.entries(CITY_CENTROIDS)) {
    if (normCity === key || normCity.includes(key) || (key.length > 3 && normCity.startsWith(key))) {
      return val.region as 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast' | 'islands';
    }
  }

  // 2. Specific City Allocations
  if (['mumbai', 'bombay', 'thane', 'navi mumbai', 'palghar', 'bhiwandi', 'kalyan', 'dombivli', 'vasai', 'virar', 'mira bhayandar', 'alibaug', 'raigad', 'ratnagiri', 'sindhudurg'].some(c => normCity.includes(c))) {
    return 'south';
  }
  if (['nagpur', 'wardha', 'amravati', 'chandrapur', 'akola', 'bhandara', 'gondia', 'yavatmal', 'gadchiroli', 'washim', 'buldhana'].some(c => normCity.includes(c))) {
    return 'central';
  }
  if (['gwalior', 'morena', 'bhind', 'shivpuri', 'datia', 'guna', 'bhopal', 'indore', 'ujjain', 'jabalpur', 'sagar', 'rewa', 'satna', 'chhattisgarh', 'raipur', 'bilaspur', 'durg'].some(c => normCity.includes(c))) {
    return 'central';
  }

  // 3. Fallback to state-level region
  return getRegionForState(stateName);
}

/**
 * Distributes supporters dynamically by real geographic location.
 * - Empty tiles are unassigned with no pre-baked fake location.
 * - Each supporter is anchored to their verified geographic centroid on the India map.
 * - When multiple supporters join from the same city/region (higher density),
 *   the allocation algorithm expands outwards in concentric spiral orbits around their anchor.
 * - Claimed tiles dynamically receive the supporter's verified city, state, region, and cluster data.
 */
export function distributeSupportersByState(supporters: Supporter[], cells: MosaicCell[]): {
  cells: MosaicCell[];
  supporters: Supporter[];
} {
  // Clear all previous assignments and leave empty cells clean (no pre-assigned fake place names)
  const freshCells: MosaicCell[] = cells.map(c => ({
    ...c,
    supporterId: undefined,
    supporter: undefined,
    stateName: undefined,
    cityName: undefined,
    region: undefined,
    clusterIndex: undefined,
    clusterSize: undefined
  }));

  const assigned = new Set<string>();

  // Filter approved, featured supporters
  const activeSupporters = supporters.filter(s => s.approved && s.featured);

  // Group supporters by normalized location (City + State) to calculate cluster density & spiral expansion
  const locationGroups = new Map<string, Supporter[]>();

  activeSupporters.forEach(sup => {
    const sCityNorm = normalizeLocationString(sup.city);
    const sStateNorm = normalizeLocationString(sup.state);
    const key = sCityNorm ? `${sCityNorm}__${sStateNorm}` : (sStateNorm || 'online');

    if (!locationGroups.has(key)) {
      locationGroups.set(key, []);
    }
    locationGroups.get(key)!.push(sup);
  });

  // Process each location group
  locationGroups.forEach((groupSupporters) => {
    // Sort supporters in the group by supporterNumber so earlier supporters get prime center slots
    groupSupporters.sort((a, b) => (a.supporterNumber || 0) - (b.supporterNumber || 0));

    const sampleSup = groupSupporters[0];
    const sStateRaw = (sampleSup.state || '').trim();
    const sCityRaw = (sampleSup.city || '').trim();
    const sState = sStateRaw.toLowerCase();
    const sCity = sCityRaw.toLowerCase();
    const isOnlineOrInternational = !sState || sState === 'online' || sState === 'other' || sState === 'international';

    // 1. Determine Target Geographic Centroid (targetX, targetY)
    let targetCentroid: { x: number; y: number } = { x: 14, y: 22 }; // Default map center

    // Find known city centroid
    let matchedCityKey = Object.keys(CITY_CENTROIDS).find(
      key => sCity.includes(key) || key.includes(sCity)
    );

    if (matchedCityKey) {
      targetCentroid = { x: CITY_CENTROIDS[matchedCityKey].x, y: CITY_CENTROIDS[matchedCityKey].y };
    } else if (STATE_CENTROIDS[sState]) {
      targetCentroid = { x: STATE_CENTROIDS[sState].x, y: STATE_CENTROIDS[sState].y };
    } else if (isOnlineOrInternational) {
      targetCentroid = { x: 10, y: 1 }; // Crown / Siachen slots for international
    }

    const resolvedRegion = getRegionForLocation(sampleSup.city, sampleSup.state);

    // Allocate each supporter in this cluster in concentric spiral order
    groupSupporters.forEach((sup, idx) => {
      // Helper to calculate euclidean distance from target centroid
      const getDist = (c: MosaicCell) => Math.hypot(c.x - targetCentroid.x, c.y - targetCentroid.y);

      let candidate: MosaicCell | undefined;

      // Priority 1: Spiral outwards from centroid among vacant black tiles
      if (!candidate && isOnlineOrInternational) {
        const crownCandidates = freshCells
          .filter(c => !assigned.has(c.cellId) && c.isBlackTile && c.y <= 4)
          .sort((a, b) => getDist(a) - getDist(b));
        candidate = crownCandidates[0];
      }

      // Priority 2: Closest vacant black tile in India mosaic matrix
      if (!candidate) {
        const blackCandidates = freshCells
          .filter(c => !assigned.has(c.cellId) && c.isBlackTile)
          .sort((a, b) => getDist(a) - getDist(b));
        candidate = blackCandidates[0];
      }

      // Priority 3: Any remaining available tile
      if (!candidate) {
        const anyCandidates = freshCells
          .filter(c => !assigned.has(c.cellId))
          .sort((a, b) => getDist(a) - getDist(b));
        candidate = anyCandidates[0];
      }

      if (candidate) {
        assigned.add(candidate.cellId);
        candidate.supporterId = sup.id;
        candidate.supporter = sup;
        candidate.stateName = sup.state;
        candidate.cityName = sup.city;
        candidate.region = resolvedRegion;
        candidate.clusterIndex = idx + 1;
        candidate.clusterSize = groupSupporters.length;

        sup.mapCellId = candidate.cellId;
        sup.mapX = candidate.x;
        sup.mapY = candidate.y;
        sup.region = resolvedRegion;
      }
    });
  });

  return { cells: freshCells, supporters };
}

/**
 * Returns grid dimensions and stats.
 */
export function getMosaicGridStats(cells: MosaicCell[]) {
  const totalSlots = cells.length;
  const occupiedCount = cells.filter(c => !!c.supporterId).length;
  const remainingSlots = Math.max(0, totalSlots - occupiedCount);
  const occupancyPercentage = totalSlots > 0 ? Math.round((occupiedCount / totalSlots) * 100) : 0;

  return {
    totalSlots,
    targetGoal: 1000,
    occupiedCount,
    remainingSlots,
    occupancyPercentage
  };
}
