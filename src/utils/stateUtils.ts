// Utility for extracting, mapping, and normalizing Indian States from supporter responses

export const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman & Nicobar',
  'Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
] as const;

export const ALL_INDIAN_STATES_AND_UTS = INDIAN_STATES_AND_UTS;

// Comprehensive city-to-state mapping
const CITY_TO_STATE: Record<string, string> = {
  // Karnataka
  bangalore: 'Karnataka',
  bengaluru: 'Karnataka',
  mysore: 'Karnataka',
  mysuru: 'Karnataka',
  udupi: 'Karnataka',
  mangalore: 'Karnataka',
  mangaluru: 'Karnataka',
  hubli: 'Karnataka',
  hubballi: 'Karnataka',
  belgaum: 'Karnataka',
  belagavi: 'Karnataka',
  dharwad: 'Karnataka',
  shimoga: 'Karnataka',
  shivamogga: 'Karnataka',
  tumkur: 'Karnataka',
  tumakuru: 'Karnataka',
  bellary: 'Karnataka',
  ballari: 'Karnataka',
  gulbarga: 'Karnataka',
  kalaburagi: 'Karnataka',
  davanagere: 'Karnataka',
  bidar: 'Karnataka',
  hassan: 'Karnataka',
  chikmagalur: 'Karnataka',
  hampi: 'Karnataka',
  manipal: 'Karnataka',
  whitefield: 'Karnataka',
  hsr: 'Karnataka',
  marathahalli: 'Karnataka',
  koramangala: 'Karnataka',
  indiranagar: 'Karnataka',
  jayanagar: 'Karnataka',

  // Tamil Nadu
  chennai: 'Tamil Nadu',
  madras: 'Tamil Nadu',
  coimbatore: 'Tamil Nadu',
  madurai: 'Tamil Nadu',
  tiruchirappalli: 'Tamil Nadu',
  trichy: 'Tamil Nadu',
  salem: 'Tamil Nadu',
  tiruppur: 'Tamil Nadu',
  erode: 'Tamil Nadu',
  vellore: 'Tamil Nadu',
  thaiyur: 'Tamil Nadu',
  kanchipuram: 'Tamil Nadu',
  thanjavur: 'Tamil Nadu',
  tirunelveli: 'Tamil Nadu',
  thoothukudi: 'Tamil Nadu',
  tuticorin: 'Tamil Nadu',
  dindigul: 'Tamil Nadu',
  nagercoil: 'Tamil Nadu',
  hosur: 'Tamil Nadu',
  sembakkam: 'Tamil Nadu',
  semmancheri: 'Tamil Nadu',
  semmencherry: 'Tamil Nadu',
  omr: 'Tamil Nadu',

  // Maharashtra
  mumbai: 'Maharashtra',
  bombay: 'Maharashtra',
  pune: 'Maharashtra',
  nagpur: 'Maharashtra',
  thane: 'Maharashtra',
  nashik: 'Maharashtra',
  aurangabad: 'Maharashtra',
  'chhatrapati sambhajinagar': 'Maharashtra',
  solapur: 'Maharashtra',
  'navi mumbai': 'Maharashtra',
  kolhapur: 'Maharashtra',
  amravati: 'Maharashtra',
  nanded: 'Maharashtra',
  sangli: 'Maharashtra',
  jalgaon: 'Maharashtra',
  akola: 'Maharashtra',
  latur: 'Maharashtra',
  dhule: 'Maharashtra',
  ahmednagar: 'Maharashtra',
  chandrapur: 'Maharashtra',
  parbhani: 'Maharashtra',
  panvel: 'Maharashtra',

  // Delhi / NCR
  delhi: 'Delhi',
  'new delhi': 'Delhi',
  dwarka: 'Delhi',
  rohini: 'Delhi',
  saket: 'Delhi',
  'karol bagh': 'Delhi',
  'connaught place': 'Delhi',

  // Telangana
  hyderabad: 'Telangana',
  secunderabad: 'Telangana',
  warangal: 'Telangana',
  nizamabad: 'Telangana',
  karimnagar: 'Telangana',
  khammam: 'Telangana',
  ramagundam: 'Telangana',
  mahbubnagar: 'Telangana',
  cyberabad: 'Telangana',
  hitech: 'Telangana',
  gachibowli: 'Telangana',

  // West Bengal
  kolkata: 'West Bengal',
  calcutta: 'West Bengal',
  howrah: 'West Bengal',
  durgapur: 'West Bengal',
  asansol: 'West Bengal',
  siliguri: 'West Bengal',
  bardhaman: 'West Bengal',
  malda: 'West Bengal',
  kharagpur: 'West Bengal',
  darjeeling: 'West Bengal',

  // Rajasthan
  jaipur: 'Rajasthan',
  jodhpur: 'Rajasthan',
  udaipur: 'Rajasthan',
  kota: 'Rajasthan',
  bikaner: 'Rajasthan',
  ajmer: 'Rajasthan',
  alwar: 'Rajasthan',
  bhilwara: 'Rajasthan',
  sikar: 'Rajasthan',
  jaisalmer: 'Rajasthan',
  pushkar: 'Rajasthan',
  'mount abu': 'Rajasthan',

  // Gujarat
  ahmedabad: 'Gujarat',
  surat: 'Gujarat',
  vadodara: 'Gujarat',
  baroda: 'Gujarat',
  rajkot: 'Gujarat',
  bhavnagar: 'Gujarat',
  jamnagar: 'Gujarat',
  gandhinagar: 'Gujarat',
  junagadh: 'Gujarat',
  anand: 'Gujarat',
  navsari: 'Gujarat',
  morbi: 'Gujarat',
  bhuj: 'Gujarat',

  // Kerala
  kochi: 'Kerala',
  cochin: 'Kerala',
  thiruvananthapuram: 'Kerala',
  trivandrum: 'Kerala',
  kozhikode: 'Kerala',
  calicut: 'Kerala',
  thrissur: 'Kerala',
  kollam: 'Kerala',
  kannur: 'Kerala',
  alappuzha: 'Kerala',
  alleppey: 'Kerala',
  palakkad: 'Kerala',
  kottayam: 'Kerala',
  ernakulam: 'Kerala',
  munnar: 'Kerala',
  wayanad: 'Kerala',

  // Uttar Pradesh
  lucknow: 'Uttar Pradesh',
  kanpur: 'Uttar Pradesh',
  varanasi: 'Uttar Pradesh',
  banaras: 'Uttar Pradesh',
  kashi: 'Uttar Pradesh',
  agra: 'Uttar Pradesh',
  prayagraj: 'Uttar Pradesh',
  allahabad: 'Uttar Pradesh',
  noida: 'Uttar Pradesh',
  'greater noida': 'Uttar Pradesh',
  ghaziabad: 'Uttar Pradesh',
  meerut: 'Uttar Pradesh',
  bareilly: 'Uttar Pradesh',
  aligarh: 'Uttar Pradesh',
  moradabad: 'Uttar Pradesh',
  gorakhpur: 'Uttar Pradesh',
  saharanpur: 'Uttar Pradesh',
  jhansi: 'Uttar Pradesh',
  mathura: 'Uttar Pradesh',
  ayodhya: 'Uttar Pradesh',

  // Haryana
  gurugram: 'Haryana',
  gurgaon: 'Haryana',
  faridabad: 'Haryana',
  panipat: 'Haryana',
  ambala: 'Haryana',
  karnal: 'Haryana',
  rohtak: 'Haryana',
  hisar: 'Haryana',
  sonipat: 'Haryana',
  panchkula: 'Haryana',

  // Punjab
  chandigarh: 'Chandigarh',
  mohali: 'Punjab',
  amritsar: 'Punjab',
  ludhiana: 'Punjab',
  jalandhar: 'Punjab',
  patiala: 'Punjab',
  bathinda: 'Punjab',
  hoshiarpur: 'Punjab',
  pathankot: 'Punjab',

  // Madhya Pradesh
  bhopal: 'Madhya Pradesh',
  indore: 'Madhya Pradesh',
  gwalior: 'Madhya Pradesh',
  jabalpur: 'Madhya Pradesh',
  ujjain: 'Madhya Pradesh',
  sagar: 'Madhya Pradesh',
  dewas: 'Madhya Pradesh',
  satna: 'Madhya Pradesh',
  ratlam: 'Madhya Pradesh',

  // Bihar
  patna: 'Bihar',
  gaya: 'Bihar',
  bhagalpur: 'Bihar',
  muzaffarpur: 'Bihar',
  purnia: 'Bihar',
  darbhanga: 'Bihar',
  'bihar sharif': 'Bihar',

  // Jharkhand
  ranchi: 'Jharkhand',
  jamshedpur: 'Jharkhand',
  dhanbad: 'Jharkhand',
  bokaro: 'Jharkhand',
  deoghar: 'Jharkhand',
  hazaribagh: 'Jharkhand',

  // Odisha
  bhubaneswar: 'Odisha',
  cuttack: 'Odisha',
  rourkela: 'Odisha',
  puri: 'Odisha',
  sambalpur: 'Odisha',
  berhampur: 'Odisha',

  // Assam & North East
  guwahati: 'Assam',
  silchar: 'Assam',
  dibrugarh: 'Assam',
  jorhat: 'Assam',
  tezpur: 'Assam',
  shillong: 'Meghalaya',
  imphal: 'Manipur',
  aizawl: 'Mizoram',
  kohima: 'Nagaland',
  dimapur: 'Nagaland',
  agartala: 'Tripura',
  itanagar: 'Arunachal Pradesh',
  gangtok: 'Sikkim',

  // Uttarakhand
  dehradun: 'Uttarakhand',
  haridwar: 'Uttarakhand',
  rishikesh: 'Uttarakhand',
  roorkee: 'Uttarakhand',
  nainital: 'Uttarakhand',
  mussoorie: 'Uttarakhand',
  haldwani: 'Uttarakhand',

  // Himachal Pradesh
  shimla: 'Himachal Pradesh',
  manali: 'Himachal Pradesh',
  dharamshala: 'Himachal Pradesh',
  kullu: 'Himachal Pradesh',
  mandi: 'Himachal Pradesh',
  solan: 'Himachal Pradesh',
  kasol: 'Himachal Pradesh',

  // Goa
  panaji: 'Goa',
  panjim: 'Goa',
  margao: 'Goa',
  madgaon: 'Goa',
  'vasco da gama': 'Goa',
  vasco: 'Goa',
  mapusa: 'Goa',
  calangute: 'Goa',
  candolim: 'Goa',
  anjuna: 'Goa',

  // Chhattisgarh
  raipur: 'Chhattisgarh',
  bilaspur: 'Chhattisgarh',
  bhilai: 'Chhattisgarh',
  durg: 'Chhattisgarh',
  korba: 'Chhattisgarh',

  // Andhra Pradesh
  visakhapatnam: 'Andhra Pradesh',
  vizag: 'Andhra Pradesh',
  vijayawada: 'Andhra Pradesh',
  guntur: 'Andhra Pradesh',
  nellore: 'Andhra Pradesh',
  kurnool: 'Andhra Pradesh',
  rajahmundry: 'Andhra Pradesh',
  tirupati: 'Andhra Pradesh',
  kakinada: 'Andhra Pradesh',
  kadapa: 'Andhra Pradesh',
  anantapur: 'Andhra Pradesh',

  // Jammu & Kashmir & Ladakh
  srinagar: 'Jammu & Kashmir',
  jammu: 'Jammu & Kashmir',
  gulmarg: 'Jammu & Kashmir',
  pahalgam: 'Jammu & Kashmir',
  leh: 'Ladakh',
  kargil: 'Ladakh',

  // Puducherry
  puducherry: 'Puducherry',
  pondicherry: 'Puducherry'
};

// PIN code prefix ranges for Indian States
export function getStateFromPinCode(pin?: string): string | null {
  if (!pin) return null;
  const cleanPin = String(pin).replace(/[^0-9]/g, '');
  if (cleanPin.length < 2) return null;

  const prefix2 = parseInt(cleanPin.slice(0, 2), 10);
  const prefix3 = cleanPin.length >= 3 ? parseInt(cleanPin.slice(0, 3), 10) : null;

  if (prefix2 === 11) return 'Delhi';
  if (prefix2 === 12 || prefix2 === 13) return 'Haryana';
  if (prefix2 === 14 || prefix2 === 15) return 'Punjab';
  if (prefix2 === 16) return 'Chandigarh';
  if (prefix2 === 17) return 'Himachal Pradesh';
  if (prefix2 === 18 || prefix2 === 19) return 'Jammu & Kashmir';
  if (prefix3 && prefix3 >= 244 && prefix3 <= 249) return 'Uttarakhand';
  if (prefix2 >= 20 && prefix2 <= 28) return 'Uttar Pradesh';
  if (prefix2 >= 30 && prefix2 <= 34) return 'Rajasthan';
  if (prefix2 >= 36 && prefix2 <= 39) return 'Gujarat';
  if (prefix3 === 403) return 'Goa';
  if (prefix2 >= 40 && prefix2 <= 44) return 'Maharashtra';
  if (prefix2 >= 45 && prefix2 <= 48) return 'Madhya Pradesh';
  if (prefix2 === 49) return 'Chhattisgarh';
  if (prefix3 && prefix3 >= 500 && prefix3 <= 509) return 'Telangana';
  if (prefix2 >= 50 && prefix2 <= 53) return 'Andhra Pradesh';
  if (prefix2 >= 56 && prefix2 <= 59) return 'Karnataka';
  if (prefix3 === 605) return 'Puducherry';
  if (prefix2 >= 60 && prefix2 <= 64) return 'Tamil Nadu';
  if (prefix2 >= 67 && prefix2 <= 69) return 'Kerala';
  if (prefix2 >= 70 && prefix2 <= 74) return 'West Bengal';
  if (prefix2 >= 75 && prefix2 <= 77) return 'Odisha';
  if (prefix2 === 78) return 'Assam';
  if (prefix2 === 79) return 'Meghalaya'; // Or North East
  if (prefix3 && prefix3 >= 814 && prefix3 <= 835) return 'Jharkhand';
  if (prefix2 >= 80 && prefix2 <= 85) return 'Bihar';

  return null;
}

export function normalizeStateName(rawState?: string): string | null {
  if (!rawState) return null;
  const s = rawState.trim().toLowerCase();
  if (!s || s.length < 3) return null;

  // Ignore noise strings that entered the state column
  if (
    s.includes('give me') ||
    s.includes('person') ||
    s.includes('hand') ||
    s.includes('flat') ||
    s.includes('house') ||
    s.includes('tower') ||
    s.includes('road') ||
    s.includes('nagar') ||
    s.includes('apartment') ||
    s.includes('co living')
  ) {
    return null;
  }

  for (const st of INDIAN_STATES_AND_UTS) {
    if (s === st.toLowerCase() || s.includes(st.toLowerCase())) {
      return st;
    }
  }

  if (s.includes('karn') || s === 'ka') return 'Karnataka';
  if (s.includes('tamil') || s === 'tn') return 'Tamil Nadu';
  if (s.includes('maha') || s === 'mh') return 'Maharashtra';
  if (s.includes('delhi') || s === 'dl') return 'Delhi';
  if (s.includes('telan') || s === 'ts' || s === 'tg') return 'Telangana';
  if (s.includes('bengal') || s === 'wb') return 'West Bengal';
  if (s.includes('rajas') || s === 'rj') return 'Rajasthan';
  if (s.includes('guj') || s === 'gj') return 'Gujarat';
  if (s.includes('kerala') || s === 'kl') return 'Kerala';
  if (s.includes('uttar p') || s === 'up') return 'Uttar Pradesh';
  if (s.includes('uttarak') || s === 'uk') return 'Uttarakhand';
  if (s.includes('haryana') || s === 'hr') return 'Haryana';
  if (s.includes('punjab') || s === 'pb') return 'Punjab';
  if (s.includes('madhya') || s === 'mp') return 'Madhya Pradesh';
  if (s.includes('bihar') || s === 'br') return 'Bihar';
  if (s.includes('jharkhand') || s === 'jh') return 'Jharkhand';
  if (s.includes('odisha') || s.includes('orissa') || s === 'od') return 'Odisha';
  if (s.includes('assam') || s === 'as') return 'Assam';
  if (s.includes('goa') || s === 'ga') return 'Goa';
  if (s.includes('andhra') || s === 'ap') return 'Andhra Pradesh';
  if (s.includes('chhattis') || s === 'cg') return 'Chhattisgarh';
  if (s.includes('himachal') || s === 'hp') return 'Himachal Pradesh';
  if (s.includes('kashmir') || s === 'jk') return 'Jammu & Kashmir';

  return null;
}

/**
 * High-accuracy multi-tier extractor to detect the Indian State for any supporter
 */
export function resolveIndianState(supporter: {
  state?: string;
  city?: string;
  pinCode?: string;
  deliveryAddress?: string;
}): string {
  // 1. Check explicit state field if valid
  const cleanState = normalizeStateName(supporter.state);
  if (cleanState) return cleanState;

  // 2. Check City dictionary
  if (supporter.city) {
    const normCity = supporter.city.trim().toLowerCase();
    // Direct lookup
    if (CITY_TO_STATE[normCity]) {
      return CITY_TO_STATE[normCity];
    }
    // Substring / partial lookup
    for (const [c, st] of Object.entries(CITY_TO_STATE)) {
      if (normCity.includes(c) || c.includes(normCity)) {
        return st;
      }
    }
  }

  // 3. Check PIN code in pinCode field
  if (supporter.pinCode) {
    const pinMatch = supporter.pinCode.match(/\b([1-9][0-9]{5})\b/);
    if (pinMatch) {
      const stateFromPin = getStateFromPinCode(pinMatch[1]);
      if (stateFromPin) return stateFromPin;
    } else {
      const stateFromPin = getStateFromPinCode(supporter.pinCode);
      if (stateFromPin) return stateFromPin;
    }
  }

  // 4. Check deliveryAddress text for city, state name, or 6-digit PIN code
  if (supporter.deliveryAddress) {
    const addr = supporter.deliveryAddress.toLowerCase();

    // Check embedded PIN code
    const pinMatch = addr.match(/\b([1-9][0-9]{5})\b/);
    if (pinMatch) {
      const stateFromPin = getStateFromPinCode(pinMatch[1]);
      if (stateFromPin) return stateFromPin;
    }

    // Check state names in address
    for (const st of INDIAN_STATES_AND_UTS) {
      if (addr.includes(st.toLowerCase())) {
        return st;
      }
    }

    // Check cities in address
    for (const [c, st] of Object.entries(CITY_TO_STATE)) {
      if (addr.includes(c)) {
        return st;
      }
    }
  }

  // Default fallback if unknown
  return supporter.state?.trim() || 'Karnataka';
}
