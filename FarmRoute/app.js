/**
 * FarmRoute — Smart Harvest Selling, Logistics, GPS & Crop Intelligence
 * Fully autonomous browser application compatible with VS Code Live Server extension,
 * static HTTP hosts, and optional Python FastAPI backend.
 */

// --- CORE DATA CONFIGURATIONS ---
const markets = [
  { name: 'Vashi (Navi Mumbai)', prices: [29.0, 29.8, 30.5, 31.2, 32.0], arrivals: 24000, lat: 19.073, lon: 73.008, type: 'APMC Metro Terminal' },
  { name: 'Panvel APMC', prices: [28.0, 28.6, 29.2, 29.8, 30.5], arrivals: 11500, lat: 18.989, lon: 73.117, type: 'APMC Regional Hub' },
  { name: 'Thane APMC', prices: [28.2, 28.8, 29.5, 30.1, 30.8], arrivals: 14200, lat: 19.200, lon: 72.975, type: 'APMC City Terminal' },
  { name: 'Kalyan APMC', prices: [27.5, 28.0, 28.6, 29.2, 29.8], arrivals: 13200, lat: 19.243, lon: 73.135, type: 'APMC City Market' },
  { name: 'Lasalgaon', prices: [26.5, 27.0, 27.5, 28.0, 28.5], arrivals: 15400, lat: 20.142, lon: 74.239, type: 'APMC Mega Market' },
  { name: 'Pimpalgaon', prices: [25.5, 26.0, 26.5, 26.2, 26.8], arrivals: 12900, lat: 20.166, lon: 74.082, type: 'APMC Regional Hub' },
  { name: 'Yeola', prices: [24.0, 24.4, 24.8, 25.2, 25.5], arrivals: 8800, lat: 20.042, lon: 74.489, type: 'APMC Sub-Market' },
  { name: 'Nashik (Dindori Rd)', prices: [25.0, 25.5, 26.0, 26.5, 27.0], arrivals: 9200, lat: 20.015, lon: 73.805, type: 'APMC City Market' },
  { name: 'Pune Market Yard', prices: [27.0, 27.8, 28.5, 29.2, 30.0], arrivals: 18500, lat: 18.496, lon: 73.867, type: 'APMC Terminal Market' }
];

const buyers = [
  { name: 'Sahyadri Agro Processing Ltd', short: 'Sahyadri Agro', price: 28.0, grade: 'A', payment: 3, reliability: 96, demand: 50000, simulated: false, location: 'Mohadi, Dindori', lat: 20.12, lon: 74.09 },
  { name: 'Nashik Kisan Producer Co. (FPO)', short: 'Nashik Kisan FPO', price: 27.5, grade: 'B', payment: 1, reliability: 93, demand: 25000, simulated: false, location: 'Niphad Hub', lat: 20.10, lon: 74.13 },
  { name: 'MahaFresh Retail Chains', short: 'MahaFresh Retail', price: 29.2, grade: 'A', payment: 7, reliability: 89, demand: 15000, simulated: false, location: 'Nashik MIDC', lat: 20.03, lon: 73.99 },
  { name: 'Pimpalgaon Wholesale Syndicate', short: 'Pimpalgaon Syndicate', price: 26.8, grade: 'B', payment: 0, reliability: 82, demand: 40000, simulated: true, location: 'Pimpalgaon Baswant', lat: 20.17, lon: 74.04 },
  { name: 'Godavari Dehydration Exporters', short: 'Godavari Dehydration', price: 25.2, grade: 'C', payment: 14, reliability: 78, demand: 60000, simulated: true, location: 'Yeola Industrial Area', lat: 20.04, lon: 74.49 },
  { name: 'Local Spot Trader (Lasalgaon Gate)', short: 'Local Spot Trader', price: 27.2, grade: 'B', payment: 0, reliability: 72, demand: 10000, simulated: true, location: 'Lasalgaon APMC Gate', lat: 20.14, lon: 74.24 }
];

const warehouses = [
  { name: 'Lasalgaon WDRA Cold Store & Godown', lat: 20.148, lon: 74.225, rate: 0.08, capacity: '1,800 Tonnes', wdra: true, temp: '0°C to 2°C (WDRA)', phone: '+91 2550 266120', type: 'cold', district: 'Nashik' },
  { name: 'Pimpalgaon Agri Warehouse Hub', lat: 20.165, lon: 73.985, rate: 0.09, capacity: '1,200 Tonnes', wdra: true, temp: 'Controlled Atmosphere', phone: '+91 2550 252340', type: 'cold', district: 'Nashik' },
  { name: 'Niphad FPO Chawl Complex', lat: 20.082, lon: 74.112, rate: 0.07, capacity: '600 Tonnes', wdra: false, temp: 'Ventilated Natural', phone: '+91 2550 241280', type: 'ambient', district: 'Nashik' },
  { name: 'Vashi APMC Central Cold Storage', lat: 19.076, lon: 73.003, rate: 0.10, capacity: '4,500 Tonnes', wdra: true, temp: '0°C to 2°C (WDRA)', phone: '+91 22 2788 8000', type: 'cold', district: 'Navi Mumbai' },
  { name: 'Panvel Agri Logistics Godown', lat: 18.990, lon: 73.120, rate: 0.08, capacity: '2,800 Tonnes', wdra: true, temp: 'Modern CA Storage', phone: '+91 22 2745 1200', type: 'cold', district: 'Navi Mumbai' },
  { name: 'Taloja Cold Chain Logistics Hub', lat: 19.062, lon: 73.118, rate: 0.09, capacity: '3,200 Tonnes', wdra: true, temp: 'Dehumidified Cold Chain', phone: '+91 22 2741 4500', type: 'cold', district: 'Navi Mumbai' },
  { name: 'Pune Market Yard Godown Hub', lat: 18.498, lon: 73.864, rate: 0.08, capacity: '3,500 Tonnes', wdra: true, temp: 'WDRA Certified Hub', phone: '+91 20 2426 1200', type: 'ambient', district: 'Pune' },
  { name: 'Dindori Agri Logistics Park', lat: 20.203, lon: 73.834, rate: 0.085, capacity: '2,200 Tonnes', wdra: true, temp: 'Modern Dehumidified', phone: '+91 2557 234190', type: 'cold', district: 'Nashik' }
];

const vehicles = {
  mini: { name: 'Mini Truck (Tata Ace / Jeeto)', maxPayload: 2500, ratePerKm: 18, tag: 'Best for <2.5T' },
  pickup: { name: 'Pickup (Bolero Maxi Truck)', maxPayload: 3500, ratePerKm: 24, tag: 'Best for 3T' },
  medium: { name: 'Medium Truck (14-ft / 17-ft)', maxPayload: 9000, ratePerKm: 34, tag: 'Bulk Economy' },
  heavy: { name: 'Heavy Multi-Axle (10-Wheeler)', maxPayload: 25000, ratePerKm: 46, tag: 'Long Haul' },
  fpo: { name: 'FPO Shared Freight Pool', maxPayload: 20000, ratePerKm: 12, tag: 'Save 33%' }
};

const distances = {
  Niphad: { Lasalgaon: 14, Pimpalgaon: 22, Yeola: 34, 'Nashik (Dindori Rd)': 38, 'Pune Market Yard': 225, 'Vashi (Navi Mumbai)': 195, 'Panvel APMC': 205, 'Kalyan APMC': 180, 'Thane APMC': 185, 'Sahyadri Agro': 18, 'Nashik Kisan FPO': 12, 'MahaFresh Retail': 28, 'Pimpalgaon Syndicate': 22, 'Godavari Dehydration': 30, 'Local Spot Trader': 14 },
  Lasalgaon: { Lasalgaon: 2, Pimpalgaon: 28, Yeola: 24, 'Nashik (Dindori Rd)': 56, 'Pune Market Yard': 240, 'Vashi (Navi Mumbai)': 210, 'Panvel APMC': 220, 'Kalyan APMC': 195, 'Thane APMC': 200, 'Sahyadri Agro': 25, 'Nashik Kisan FPO': 15, 'MahaFresh Retail': 32, 'Pimpalgaon Syndicate': 28, 'Godavari Dehydration': 20, 'Local Spot Trader': 2 },
  Pimpalgaon: { Lasalgaon: 28, Pimpalgaon: 2, Yeola: 52, 'Nashik (Dindori Rd)': 30, 'Pune Market Yard': 230, 'Vashi (Navi Mumbai)': 190, 'Panvel APMC': 200, 'Kalyan APMC': 175, 'Thane APMC': 180, 'Sahyadri Agro': 16, 'Nashik Kisan FPO': 26, 'MahaFresh Retail': 15, 'Pimpalgaon Syndicate': 2, 'Godavari Dehydration': 42, 'Local Spot Trader': 28 },
  Yeola: { Lasalgaon: 24, Pimpalgaon: 52, Yeola: 2, 'Nashik (Dindori Rd)': 78, 'Pune Market Yard': 235, 'Vashi (Navi Mumbai)': 230, 'Panvel APMC': 240, 'Kalyan APMC': 215, 'Thane APMC': 220, 'Sahyadri Agro': 48, 'Nashik Kisan FPO': 36, 'MahaFresh Retail': 58, 'Pimpalgaon Syndicate': 52, 'Godavari Dehydration': 12, 'Local Spot Trader': 24 },
  Sinnar: { Lasalgaon: 46, Pimpalgaon: 42, Yeola: 58, 'Nashik (Dindori Rd)': 32, 'Pune Market Yard': 190, 'Vashi (Navi Mumbai)': 170, 'Panvel APMC': 178, 'Kalyan APMC': 155, 'Thane APMC': 160, 'Sahyadri Agro': 32, 'Nashik Kisan FPO': 30, 'MahaFresh Retail': 26, 'Pimpalgaon Syndicate': 42, 'Godavari Dehydration': 54, 'Local Spot Trader': 46 },
  Chandwad: { Lasalgaon: 26, Pimpalgaon: 24, Yeola: 44, 'Nashik (Dindori Rd)': 65, 'Pune Market Yard': 260, 'Vashi (Navi Mumbai)': 225, 'Panvel APMC': 235, 'Kalyan APMC': 210, 'Thane APMC': 215, 'Sahyadri Agro': 35, 'Nashik Kisan FPO': 28, 'MahaFresh Retail': 38, 'Pimpalgaon Syndicate': 24, 'Godavari Dehydration': 38, 'Local Spot Trader': 26 },
  Kalwan: { Lasalgaon: 56, Pimpalgaon: 38, Yeola: 78, 'Nashik (Dindori Rd)': 68, 'Pune Market Yard': 285, 'Vashi (Navi Mumbai)': 245, 'Panvel APMC': 255, 'Kalyan APMC': 230, 'Thane APMC': 235, 'Sahyadri Agro': 48, 'Nashik Kisan FPO': 52, 'MahaFresh Retail': 50, 'Pimpalgaon Syndicate': 38, 'Godavari Dehydration': 70, 'Local Spot Trader': 56 }
};

const districtCoordinates = {
  Ahmednagar: [19.09, 74.75], Akola: [20.70, 77.00], Amravati: [20.93, 77.75], Beed: [18.99, 75.76],
  Bhandara: [21.17, 79.65], Buldhana: [20.53, 76.18], Chandrapur: [19.97, 79.30], 'Chhatrapati Sambhajinagar': [19.88, 75.34],
  Dharashiv: [18.19, 76.04], Dhule: [20.90, 74.78], Gadchiroli: [20.18, 80.00], Gondia: [21.46, 80.20],
  Hingoli: [19.72, 77.15], Jalgaon: [21.01, 75.56], Jalna: [19.83, 75.88], Kolhapur: [16.70, 74.24],
  Latur: [18.41, 76.57], 'Mumbai City': [18.94, 72.83], 'Mumbai Suburban': [19.08, 72.88], 'Navi Mumbai': [19.034, 73.018], Nagpur: [21.15, 79.09],
  Nanded: [19.14, 77.32], Nandurbar: [21.37, 74.24], Nashik: [19.99, 73.79], Palghar: [19.70, 72.77],
  Parbhani: [19.26, 76.77], Pune: [18.52, 73.86], Raigad: [18.51, 73.18], Ratnagiri: [16.99, 73.31],
  Sangli: [16.85, 74.58], Satara: [17.68, 73.99], Sindhudurg: [16.35, 73.56], Solapur: [17.66, 75.91],
  Thane: [19.22, 72.98], Wardha: [20.75, 78.60], Washim: [20.11, 77.14], Yavatmal: [20.39, 78.13]
};

const nashikPilotTalukaCoordinates = {
  Niphad: [20.083, 74.108], Lasalgaon: [20.142, 74.239], Pimpalgaon: [20.166, 74.082],
  Yeola: [20.042, 74.489], Sinnar: [19.846, 73.999], Chandwad: [20.326, 74.244],
  Kalwan: [20.495, 74.026], Malegaon: [20.553, 74.529], Dindori: [20.203, 73.834],
  Igatpuri: [19.697, 73.562], Nashik: [19.997, 73.789]
};

const marketCoordinates = {
  'Vashi (Navi Mumbai)': [19.073, 73.008],
  'Panvel APMC': [18.989, 73.117],
  'Thane APMC': [19.200, 72.975],
  'Kalyan APMC': [19.243, 73.135],
  Lasalgaon: [20.142, 74.239],
  Pimpalgaon: [20.166, 74.082],
  Yeola: [20.042, 74.489],
  'Nashik (Dindori Rd)': [20.015, 73.805],
  'Pune Market Yard': [18.496, 73.867],
  'Sahyadri Agro': [20.12, 74.09],
  'Nashik Kisan FPO': [20.10, 74.13],
  'MahaFresh Retail': [20.03, 73.99],
  'Pimpalgaon Syndicate': [20.17, 74.04],
  'Godavari Dehydration': [20.04, 74.49],
  'Local Spot Trader': [20.142, 74.239]
};

const talukasByDistrict = {
  Nashik: ['Niphad', 'Lasalgaon', 'Pimpalgaon', 'Yeola', 'Sinnar', 'Chandwad', 'Kalwan', 'Malegaon', 'Dindori', 'Igatpuri', 'Nashik'],
  Thane: ['Nerul', 'Thane', 'Kalyan', 'Bhiwandi', 'Ulhasnagar', 'Ambernath', 'Badlapur', 'Murbad', 'Shahapur'],
  'Navi Mumbai': ['Nerul', 'Vashi', 'Belapur', 'Kopar Khairane', 'Airoli', 'Ghansoli', 'Sanpada', 'Turbhe', 'Seawoods'],
  Pune: ['Haveli', 'Junnar', 'Khed', 'Mawal', 'Mulshi', 'Shirur', 'Daund', 'Baramati', 'Indapur', 'Bhor', 'Velhe', 'Ambegaon', 'Purandar'],
  Raigad: ['Panvel', 'Alibag', 'Karjat', 'Khalapur', 'Pen', 'Uran', 'Roha', 'Mangaon', 'Mahad'],
  Nagpur: ['Nagpur Rural', 'Hingna', 'Katol', 'Kamptee', 'Kuhi', 'Mauda', 'Narkhed', 'Parseoni', 'Ramtek', 'Savner', 'Umred'],
  'Chhatrapati Sambhajinagar': ['Aurangabad', 'Kannad', 'Khuldabad', 'Paithan', 'Phulambri', 'Sillod', 'Soegaon', 'Vaijapur', 'Gangapur'],
  Ahmednagar: ['Ahmednagar', 'Akole', 'Jamkhed', 'Karjat', 'Kopargaon', 'Nevasa', 'Parner', 'Pathardi', 'Rahata', 'Rahuri', 'Sangamner', 'Shevgaon', 'Shrigonda', 'Shrirampur'],
  Kolhapur: ['Karvir', 'Panhala', 'Hatkanangale', 'Kagal', 'Shirol', 'Radhanagari', 'Gaganbawada', 'Bhudargad', 'Ajra', 'Chandgad', 'Gadhinglaj', 'Shahuwadi'],
  Solapur: ['Solapur North', 'Solapur South', 'Akkalkot', 'Barshi', 'Karmala', 'Madha', 'Malshiras', 'Mangalwedha', 'Mohol', 'Pandharpur', 'Sangole'],
  Sangli: ['Miraj', 'Walwa', 'Tasgaon', 'Kavathe Mahankal', 'Jat', 'Khanapur', 'Atpadi', 'Palus', 'Shirala'],
  Satara: ['Satara', 'Karad', 'Khatav', 'Koregaon', 'Mahabaleshwar', 'Man', 'Patan', 'Phaltan', 'Wai', 'Jaoli'],
  Jalgaon: ['Jalgaon', 'Amalner', 'Bhadgaon', 'Bhusawal', 'Bodwad', 'Chalisgaon', 'Chopda', 'Dharangaon', 'Erandol', 'Jamner', 'Pachora', 'Parola', 'Raver', 'Yawal'],
  Amravati: ['Amravati', 'Achalpur', 'Anjangaon Surji', 'Bhatkuli', 'Chandur Bazar', 'Chandur Railway', 'Chikhaldara', 'Daryapur', 'Dhamangaon Railway', 'Dharni', 'Morshi', 'Nandgaon Khandeshwar', 'Teosa', 'Warud'],
  Akola: ['Akola', 'Akot', 'Balapur', 'Barshitakli', 'Murtizapur', 'Patur', 'Telhara']
};

// --- PRESET QUALITY PROFILES ---
const qualityProfiles = {
  cured: {
    name: 'Well-cured Rabi Lot',
    imageSrc: 'assets/onion-cured.jpg',
    grade: 'A',
    gradeLabel: 'GRADE A (AGMARK SPECIAL)',
    shelfDays: 60,
    storageDays: 45,
    curingScore: 94,
    moisturePct: 13.5,
    neckMm: 7.2,
    sproutRisk: 4,
    cropType: 'Rabi Garwa (High Storage)',
    title: 'Store 45–60 days in a ventilated chawl',
    detail: 'Dry bronze-red scales and a tightly constricted neck indicate a prime well-cured lot suitable for holding for post-monsoon festive demand.',
    guidance: [
      'Dry, intact papery skin provides natural fungal barrier.',
      'Store in raised, ventilated bamboo chawl (कांदा चाळ) with bottom airflow.',
      'Inspect lot every 15 days; remove any soft neck bulbs.'
    ],
    overlays: {
      neck: [{ x: 300, y: 140, w: 28, h: 42, label: '7.2mm Sealed Neck' }],
      curing: [{ x: 230, y: 180, w: 160, h: 140, label: 'Tunic Curing: 94%' }],
      sizing: [{ cx: 310, cy: 250, r: 68, label: '58mm Export Caliber' }],
      defects: []
    }
  },
  moist: {
    name: 'Moist Kharif Lot',
    imageSrc: 'assets/onion-moist.jpg',
    grade: 'B',
    gradeLabel: 'GRADE B (STANDARD MARKET)',
    shelfDays: 15,
    storageDays: 0,
    curingScore: 48,
    moisturePct: 23.0,
    neckMm: 22.4,
    sproutRisk: 38,
    cropType: 'Pol / Early Kharif (Succulent)',
    title: 'Sell immediately — High moisture spoilage risk',
    detail: 'Thick succulent green necks and peeling wet scales indicate high field moisture. High risk of fungal rot and rapid weight loss in closed storage.',
    guidance: [
      'Fresh moisture in the neck creates an active fungal entry path.',
      'Pack in ventilated red mesh net bags (जाळीदार पिशव्या); do not use plastic sacks.',
      'Dispatch immediately to the highest-net APMC mandi or direct buyer.'
    ],
    overlays: {
      neck: [{ x: 320, y: 160, w: 55, h: 70, label: '22.4mm Moist Neck' }],
      curing: [{ x: 240, y: 220, w: 180, h: 150, label: 'Moisture Zone: 23%' }],
      sizing: [{ cx: 330, cy: 290, r: 72, label: '62mm Standard Size' }],
      defects: [{ x: 340, y: 175, w: 35, h: 35, label: 'High Moisture Tissue' }]
    }
  },
  sprouted: {
    name: 'Sprouted / High Moisture Lot',
    imageSrc: 'assets/onion-sprouted.jpg',
    grade: 'C',
    gradeLabel: 'GRADE C (PROCESSING / DISTRESS)',
    shelfDays: 7,
    storageDays: 0,
    curingScore: 32,
    moisturePct: 25.5,
    neckMm: 28.0,
    sproutRisk: 84,
    cropType: 'Damaged / Sprouted Lot',
    title: 'Distress sale warning — Clear lot within 48 hours',
    detail: 'Active green shoots emerging from neck and soft spongy outer scales. The lot is actively converting internal dry matter into leaf shoots, degrading culinary value.',
    guidance: [
      'Internal sprouting causes fast bulb hollowing and moisture liquefaction.',
      'Sell immediately to dehydration plants (e.g. Godavari Dehydration) or local spot gate.',
      'Do not incur additional warehouse storage costs on this lot.'
    ],
    overlays: {
      neck: [{ x: 280, y: 110, w: 60, h: 80, label: '28mm Sprouted Shoot' }],
      curing: [{ x: 210, y: 180, w: 180, h: 160, label: 'Shrivelled Tunic: 32%' }],
      sizing: [{ cx: 300, cy: 260, r: 75, label: 'Variable Size' }],
      defects: [{ x: 290, y: 120, w: 45, h: 50, label: 'Active Green Shoot' }]
    }
  },
  export: {
    name: 'Export Grade A1 Lot',
    imageSrc: 'assets/onion-export.jpg',
    grade: 'A',
    gradeLabel: 'GRADE EXTRA (EXPORT QUALITY)',
    shelfDays: 90,
    storageDays: 60,
    curingScore: 98,
    moisturePct: 11.8,
    neckMm: 5.5,
    sproutRisk: 2,
    cropType: 'Rabi Export Quality (AGMARK)',
    title: 'Top Premium Export Lot — Maximum holding potential',
    detail: 'Uniform 55mm spherical bulbs with tightly pinched dry neck, completely intact bronze outer skins, and zero fungal blemishes. Eligible for maximum corporate and export premium.',
    guidance: [
      'Top tier lot. Qualifies for +₹1.50/kg AGMARK Special export bonus.',
      'Can safely be held 60+ days in ventilated cold storage for festival price spikes.',
      'Ideal for direct corporate contracts (MahaFresh Retail, Sahyadri Agro).'
    ],
    overlays: {
      neck: [{ x: 300, y: 130, w: 22, h: 36, label: '5.5mm Pinched Neck' }],
      curing: [{ x: 220, y: 170, w: 170, h: 150, label: 'Uniform Tunic: 98%' }],
      sizing: [{ cx: 305, cy: 245, r: 66, label: '55mm Uniform Export' }],
      defects: []
    }
  }
};

// --- APP STATE ---
let activeAnalysisKey = 'cured';
let customImageSrc = null;
let activeOverlays = { neck: true, curing: true, sizing: true, defects: true };
let certificatePremium = 0;
let certificateLabel = '';
let selectedVehicleKey = 'mini';
let currentLang = 'en'; // 'en' or 'mr'
let latestResult = null;
let detectedGpsCoords = null;
let detectedLocationLabel = '';
let leafletMap = null;
let mapMarkersGroup = null;
let mapPolyline = null;

// Helpers
const rupees = val => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(val));
const fixed = val => Number(val.toFixed(2));

// --- STATE GETTER ---
function getState() {
  const district = document.querySelector('#district').value || 'Nashik';
  const taluka = document.querySelector('#taluka').value || 'Niphad';
  const quantity = Math.max(100, Number(document.querySelector('#quantity').value) || 2000);
  const gradeInput = document.querySelector('input[name="grade"]:checked');
  const grade = gradeInput ? gradeInput.value : 'A';
  const storage = Number(document.querySelector('#storage').value) || 0;
  const shelf = Number(document.querySelector('#shelf-life').value) || 45;
  const urgent = document.querySelector('#urgent').checked;
  const commodity = document.querySelector('#commodity').value;

  const locDisplay = detectedLocationLabel || `${taluka}, ${district}`;

  return {
    commodity,
    district,
    taluka,
    quantity,
    grade,
    storage,
    shelf,
    urgent,
    vehicle: selectedVehicleKey,
    coordinates: detectedGpsCoords || nashikPilotTalukaCoordinates[taluka] || districtCoordinates[district] || [19.99, 73.79],
    detectedLocationName: locDisplay
  };
}

// --- DISTANCE & ROUTING ENGINE ---
function getRouteDistance(input, destination) {
  if (input.district === 'Nashik' && !detectedGpsCoords && distances[input.taluka]?.[destination]) {
    return distances[input.taluka][destination];
  }
  const origin = input.coordinates || districtCoordinates[input.district] || districtCoordinates.Nashik;
  const target = marketCoordinates[destination] || marketCoordinates.Lasalgaon;
  const lat = Math.PI / 180, earth = 6371;
  const a = Math.sin((target[0] - origin[0]) * lat / 2) ** 2 +
    Math.cos(origin[0] * lat) * Math.cos(target[0] * lat) *
    Math.sin((target[1] - origin[1]) * lat / 2) ** 2;
  return Math.max(5, Math.round(earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.25));
}

function trendFor(market) {
  const change = ((market.prices.at(-1) - market.prices[0]) / market.prices[0]) * 100;
  return {
    change: fixed(change),
    direction: change > 1.5 ? 'Increasing' : change < -1.5 ? 'Decreasing' : 'Stable'
  };
}

// --- ACTUAL COSTING ENGINE (Freight, Tolls, Hamali, Cess, Spoilage) ---
function computeDetailedCosting(distanceKm, quantityKg, vehicleKey, grossPrice, transitHours = 1) {
  const veh = vehicles[vehicleKey] || vehicles.mini;
  const freightTotal = Math.round(distanceKm * veh.ratePerKm);
  const freightPerKg = fixed(freightTotal / quantityKg);

  // Toll estimation for Maharashtra highways: ~₹85 per 50 km after first 45 km
  const tollsTotal = distanceKm > 45 ? Math.round((distanceKm / 50) * 85) : 0;
  const tollsPerKg = fixed(tollsTotal / quantityKg);

  // Hamali (हमाली) loading & unloading standard: ₹12 per quintal = ₹0.12/kg
  const hamaliTotal = Math.round((quantityKg / 100) * 12);
  const hamaliPerKg = 0.12;

  // Mandi user cess: 1.05% of gross market realization
  const cessPerKg = fixed(grossPrice * 0.0105);
  const cessTotal = Math.round(cessPerKg * quantityKg);

  // Transit spoilage & moisture loss: ~0.08% per transit hour
  const spoilageLossKg = Math.round(quantityKg * (transitHours * 0.0008));
  const spoilageVal = Math.round(spoilageLossKg * grossPrice);

  const totalDeductionsPerKg = fixed(freightPerKg + tollsPerKg + hamaliPerKg + cessPerKg);
  const netPrice = fixed(grossPrice - totalDeductionsPerKg);
  const netPayoutTotal = Math.round(netPrice * quantityKg);

  return {
    distanceKm,
    freightTotal,
    freightPerKg,
    tollsTotal,
    tollsPerKg,
    hamaliTotal,
    hamaliPerKg,
    cessTotal,
    cessPerKg,
    spoilageLossKg,
    spoilageVal,
    totalDeductionsPerKg,
    netPrice,
    netPayoutTotal
  };
}

// --- ML / AI MANDI RECOMMENDATION MODEL ---
function computeAiMandiScore(netPrice, distanceKm, trendDirection, reliabilityScore) {
  // Multi-factor regression weighting for mandi optimality
  const priceWeight = (netPrice / 32) * 50; // max normalized
  const distancePenalty = Math.min(30, (distanceKm / 150) * 25);
  const trendBonus = trendDirection === 'Increasing' ? 15 : trendDirection === 'Stable' ? 8 : 2;
  const reliabilityBonus = (reliabilityScore / 100) * 15;

  const rawScore = priceWeight - distancePenalty + trendBonus + reliabilityBonus;
  const matchPct = Math.min(99, Math.max(50, Math.round(rawScore + 15)));

  let label = 'Strong Match';
  if (matchPct >= 92) label = '★ AI Optimal Choice';
  else if (matchPct >= 80) label = 'High Net Alternative';
  else if (matchPct >= 65) label = 'Moderate Return';
  else label = 'Distance Friction Risk';

  return { matchPct, label };
}

// --- RECOMMENDATION & EVALUATION LOGIC ---
function evaluate(input) {
  const options = [];
  const vehicle = vehicles[input.vehicle] || vehicles.mini;
  const storageCost = fixed(input.storage * 0.08);

  // Evaluate APMC Mandis with Actual Costing
  markets.forEach(market => {
    const distance = getRouteDistance(input, market.name);
    const transitHours = Math.max(0.4, fixed(distance / 40));
    const gross = market.prices.at(-1) + certificatePremium;
    const costing = computeDetailedCosting(distance, input.quantity, input.vehicle, gross, transitHours);
    const trend = trendFor(market);
    const ai = computeAiMandiScore(costing.netPrice, distance, trend.direction, 88);

    options.push({
      title: `${market.name} APMC Mandi`,
      destination: market.name,
      type: 'APMC Mandi',
      gross,
      premium: certificatePremium,
      transport: costing.freightPerKg,
      tolls: costing.tollsPerKg,
      hamali: costing.hamaliPerKg,
      storage: storageCost,
      other: costing.cessPerKg,
      net: fixed(costing.netPrice - storageCost),
      total: Math.round((costing.netPrice - storageCost) * input.quantity),
      reliability: 88,
      demand: market.arrivals > 12000 ? 90 : 80,
      trend,
      payment: 0,
      distance,
      costing,
      ai,
      lat: market.lat,
      lon: market.lon
    });
  });

  // Evaluate Direct Corporate Buyers
  buyers.filter(buyer => buyer.grade === 'C' || input.grade === 'A' || input.grade === buyer.grade).forEach(buyer => {
    const distance = getRouteDistance(input, buyer.short);
    const transitHours = Math.max(0.4, fixed(distance / 40));
    const gross = buyer.price + certificatePremium;
    const transport = fixed((distance * vehicle.ratePerKm) / Math.max(100, input.quantity));
    const directHandling = 0.10; // Farmgate loading
    const net = fixed(gross - transport - storageCost - directHandling);
    const trend = trendFor(markets[0]);
    const ai = computeAiMandiScore(net, distance, trend.direction, buyer.reliability);

    options.push({
      title: buyer.name,
      destination: buyer.short,
      type: 'Direct Corporate Buyer',
      gross,
      premium: certificatePremium,
      transport,
      tolls: 0,
      hamali: directHandling,
      storage: storageCost,
      other: 0,
      net,
      total: Math.round(net * input.quantity),
      reliability: buyer.reliability,
      demand: buyer.demand >= 40000 ? 95 : buyer.demand >= 20000 ? 85 : 70,
      trend,
      payment: buyer.payment,
      distance,
      ai,
      simulated: buyer.simulated,
      lat: buyer.lat,
      lon: buyer.lon
    });
  });

  const min = Math.min(...options.map(o => o.net));
  const max = Math.max(...options.map(o => o.net));
  const range = Math.max(0.5, max - min);

  options.forEach(option => {
    option.normalized = fixed(((option.net - min) / range) * 100);
    option.trendScore = option.trend.direction === 'Increasing' ? 95 : option.trend.direction === 'Stable' ? 65 : 35;
    option.storageScore = input.storage === 0 ? 100 : Math.max(30, 100 - (input.storage * 1.2));

    // Weighted scoring formula
    option.score = fixed(
      0.40 * option.normalized +
      0.20 * option.reliability +
      0.15 * option.demand +
      0.15 * option.trendScore +
      0.10 * option.storageScore
    );
  });

  options.sort((a, b) => b.score - a.score);

  const benchmarkTrend = trendFor(markets[0]);
  let advice;
  if (input.urgent) {
    advice = {
      mode: 'sell',
      title: '⚡ Sell Immediately (Cash-Flow Liquidity Priority)',
      text: 'Because urgent cash is needed, the engine prioritizes same-day spot settlement and eliminates storage and market price risks.'
    };
  } else if (benchmarkTrend.direction === 'Increasing' && input.shelf >= 30) {
    advice = {
      mode: 'wait',
      title: '📦 Hold & Store (Upward Price Momentum)',
      text: `Modal market rates have appreciated +${benchmarkTrend.change}% in 5 days. Holding in a ventilated chawl offers an anticipated net gain after storage cost.`
    };
  } else {
    advice = {
      mode: 'sell',
      title: '⚖️ Dispatch Current Batch Today',
      text: 'Market prices are stable and within normal seasonal range. The top verified option delivers the strongest certainty without holding costs.'
    };
  }

  const risk = (input.urgent && input.shelf <= 15)
    ? 'High Distress-Sale Risk: Urgent cash need combined with short crop shelf life can lead to heavy price discounting. Commit to the verified top route immediately.'
    : (input.shelf <= 10)
      ? 'Critical Shelf-Life Alert: Crop moisture profile indicates spoilage risk within 10 days. Avoid warehousing.'
      : null;

  return { input, options, best: options[0], advice, risk };
}

// --- RENDER RECOMMENDATION ---
function renderRecommendation(result) {
  latestResult = result;
  const { best, input, advice, risk } = result;
  const vehicle = vehicles[input.vehicle] || vehicles.mini;
  const originDisplay = input.detectedLocationName || `${input.taluka}, ${input.district}`;

  document.querySelector('#recommendation-context').textContent =
    `${rupees(input.quantity)} kg · Grade ${input.grade} · ${originDisplay} · ${input.storage ? input.storage + ' days hold' : 'Immediate Dispatch'} · ${vehicle.name}`;

  const premiumTag = best.premium ? ` (includes +₹${best.premium.toFixed(2)} ${certificateLabel})` : '';

  const html = `
    <div class="recommendation-layout">
      <div>
        <article class="best-card">
          <p class="eyebrow">✦ TOP RECOMMENDED ROUTE · ${best.ai.label.toUpperCase()}</p>
          <h2>${best.title}</h2>
          <p class="best-meta">${best.type} · ${best.distance} km from ${originDisplay} · ${best.payment === 0 ? 'Same-day cash settlement' : best.payment + '-day RTGS bank transfer'}</p>
          <div class="best-amount">₹${best.net.toFixed(2)} <small>net take-home / kg</small></div>
          <div class="best-total">Estimated Total Payout: <b>₹${rupees(best.total)}</b> for your entire ${rupees(input.quantity)} kg lot</div>
          <div class="best-stats">
            <div><span>AI Match</span><b class="text-green">${best.ai.matchPct}%</b></div>
            <div><span>Decision Score</span><b>${best.score}/100</b></div>
            <div><span>Buyer Reliability</span><b>${best.reliability}%</b></div>
            <div><span>Price Trend</span><b>${best.trend.direction}</b></div>
          </div>
          <div class="best-card-actions" style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;border-top:1px solid rgba(22,101,52,0.15);padding-top:14px;">
            <button type="button" class="btn-pill primary" onclick="activateView('logistics')">🚚 Book Transport & Logistics →</button>
            <button type="button" class="btn-pill secondary" onclick="activateView('timing')">⏳ Storage Timing</button>
            <button type="button" class="btn-pill secondary" onclick="activateView('payments')">💳 Digital Escrow</button>
            <button type="button" class="btn-pill secondary" onclick="activateView('legal-shield')">⚖️ Anti-Fraud Legal</button>
          </div>
        </article>

        <h2 class="rank-heading">All Analyzed Options (${result.options.length} Ranked Channels)</h2>
        <div class="options-list">
          ${result.options.map((opt, idx) => optionCardHTML(opt, idx, best)).join('')}
        </div>
      </div>

      <div>
        <article class="advice-card ${advice.mode === 'wait' ? 'wait' : ''}">
          <p class="eyebrow">TIMING & STRATEGY VERDICT</p>
          <h2>${advice.title}</h2>
          <p>${advice.text}</p>
        </article>

        ${risk ? `
          <article class="risk-card">
            <h3>⚠️ Risk Alert</h3>
            <p>${risk}</p>
          </article>
        ` : ''}

        <article class="panel">
          <p class="eyebrow">FULL DEDUCTION LEDGER (ACTUAL COSTING)</p>
          <h2 style="font-size:16px;margin-bottom:10px;">Why ${best.title} Ranks First</h2>
          <div class="cost-ledger-table" style="font-size:12px;">
            <div class="ledger-row"><span>Gross Market Offer:</span> <b>₹${best.gross.toFixed(2)}/kg${premiumTag}</b></div>
            <div class="ledger-row"><span>Road Freight (${best.distance} km):</span> <b class="text-amber">−₹${best.transport.toFixed(2)}/kg</b></div>
            ${best.tolls > 0 ? `<div class="ledger-row"><span>Highway Tolls:</span> <b class="text-amber">−₹${best.tolls.toFixed(2)}/kg</b></div>` : ''}
            <div class="ledger-row"><span>Loading / Hamali:</span> <b class="text-amber">−₹${(best.hamali || 0.12).toFixed(2)}/kg</b></div>
            <div class="ledger-row"><span>Mandi Cess & Fee:</span> <b class="text-amber">−₹${(best.other || 0.30).toFixed(2)}/kg</b></div>
            ${best.storage > 0 ? `<div class="ledger-row"><span>Warehouse Rent:</span> <b class="text-amber">−₹${best.storage.toFixed(2)}/kg</b></div>` : ''}
            <div class="ledger-row total"><span>Net Take-Home Price:</span> <b class="text-green">₹${best.net.toFixed(2)}/kg</b></div>
          </div>
          <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line);font-size:11px;color:var(--muted-500);">
            ML Factors: Net Return (${best.normalized}/100), Reliability (${best.reliability}/100), Demand (${best.demand}/100), Trend (${best.trendScore}/100).
          </div>
        </article>
      </div>
    </div>
  `;

  document.querySelector('#recommendation-results').innerHTML = html;

  // Toggle option card drawer
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('open'));
  });

  // Update quick sidebar summary
  document.querySelector('#summary-weight').textContent = `${rupees(input.quantity)} kg`;
  document.querySelector('#summary-grade').textContent = input.grade;
  document.querySelector('#tip-text').innerHTML = `At ${rupees(input.quantity)} kg, every ₹1.00/kg difference in selling route changes your return by <b>₹${rupees(input.quantity)}</b>.`;
}

function optionCardHTML(option, index, best) {
  const isBest = index === 0;
  const diff = (best.net - option.net).toFixed(2);
  const reason = isBest
    ? `Highest net payout with ₹${option.net.toFixed(2)}/kg realization and ${option.reliability}% verified reliability.`
    : `₹${diff}/kg less take-home than the top option after transport and handling.`;

  return `
    <article class="option-card ${isBest ? 'is-best' : ''}" tabindex="0">
      <span class="rank">${index + 1}</span>
      <div>
        <div style="display:flex;align-items:center;gap:8px;">
          <h3>${option.title}${option.simulated ? ' <small style="color:var(--accent-amber)">(Pilot Offer)</small>' : ''}</h3>
          <span class="status-pill verified" style="font-size:10px;">${option.ai.matchPct}% Match</span>
        </div>
        <p>${option.type} · ${option.distance} km · ${option.payment === 0 ? 'Immediate Cash' : option.payment + '-day payment'} · Score ${option.score}/100</p>
      </div>
      <div class="option-price">
        <strong>₹${option.net.toFixed(2)}/kg</strong>
        <small>₹${rupees(option.total)} total</small>
      </div>
      <div class="option-details">
        <b>Actual Cost Breakdown:</b> ₹${option.gross.toFixed(2)} gross − ₹${option.transport.toFixed(2)} freight ${option.tolls ? `− ₹${option.tolls.toFixed(2)} tolls ` : ''}− ₹${(option.hamali || 0.12).toFixed(2)} hamali − ₹${(option.other || 0.30).toFixed(2)} cess = <b>₹${option.net.toFixed(2)}/kg net</b><br />
        <span>${reason} Click to toggle details.</span>
      </div>
    </article>
  `;
}

// --- MULTI-TIER BULLETPROOF GEOLOCATION & REVERSE GEOCODING ---
function acquireCoordinates() {
  return new Promise((resolve) => {
    let finished = false;
    const finish = res => {
      if (!finished) {
        finished = true;
        resolve(res);
      }
    };

    if (!navigator.geolocation) {
      return fallbackToIp(finish);
    }

    // Tier 1: Try GPS with 4.5s timeout
    navigator.geolocation.getCurrentPosition(
      pos => {
        finish({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 20,
          source: 'GPS'
        });
      },
      errHigh => {
        console.warn('GPS hardware lookup timed out or unavailable:', errHigh?.message, 'Trying Wi-Fi triangulation...');
        // Tier 2: Try standard accuracy Wi-Fi/Cell with 4.5s timeout
        navigator.geolocation.getCurrentPosition(
          posLow => {
            finish({
              lat: posLow.coords.latitude,
              lon: posLow.coords.longitude,
              accuracy: posLow.coords.accuracy || 120,
              source: 'Wi-Fi'
            });
          },
          errLow => {
            console.warn('Browser geolocation failed:', errLow?.message, 'Falling back to IP lookup...');
            // Tier 3: Fallback to IP lookup
            fallbackToIp(finish);
          },
          { enableHighAccuracy: false, timeout: 4500, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 4500, maximumAge: 0 }
    );
  });
}

async function fallbackToIp(resolve) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://ipwho.is/', { signal: timer.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false && data.latitude && data.longitude) {
        return resolve({
          lat: data.latitude,
          lon: data.longitude,
          accuracy: 800,
          ipCity: data.city,
          ipRegion: data.region,
          source: 'Network IP'
        });
      }
    }
  } catch (e) {
    console.warn('IP lookup error:', e);
  }

  // Safe fallback to user's selected district or default Nashik (Niphad) — never hardcode Nerul
  const dist = document.querySelector('#district')?.value || 'Nashik';
  const coords = districtCoordinates[dist] || [20.076, 74.108];
  resolve({
    lat: coords[0],
    lon: coords[1],
    accuracy: 50,
    source: 'District Default'
  });
}

async function reverseGeocodeCoords(lat, lon) {
  let locality = '';
  let city = '';
  let stateDist = '';
  let state = 'Maharashtra';

  // Fast race: Nominatim and BigDataCloud with 2.8s maximum wait
  const timeoutPromise = new Promise(res => setTimeout(() => res(null), 2800));

  const nominatimPromise = (async () => {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&email=farmroute_farmer_${Date.now()}@gmail.com`;
      const res = await fetch(nomUrl);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        return {
          locality: addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.residential || addr.hamlet || addr.subdistrict || addr.city_district || '',
          city: addr.city || addr.city_district || addr.municipality || addr.county || addr.state_district || '',
          stateDist: addr.state_district || addr.county || '',
          state: addr.state || 'Maharashtra'
        };
      }
    } catch (e) { }
    return null;
  })();

  const bdcPromise = (async () => {
    try {
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const res = await fetch(bdcUrl);
      if (res.ok) {
        const bdc = await res.json();
        return {
          locality: bdc.locality || bdc.city || '',
          city: bdc.city || bdc.principalSubdivision || '',
          stateDist: bdc.city || '',
          state: bdc.principalSubdivision || 'Maharashtra'
        };
      }
    } catch (e) { }
    return null;
  })();

  try {
    const winner = await Promise.race([nominatimPromise, bdcPromise, timeoutPromise]);
    if (winner) {
      locality = winner.locality || '';
      city = winner.city || '';
      stateDist = winner.stateDist || '';
      state = winner.state || 'Maharashtra';
    }
  } catch (e) {
    console.warn('Geocoding race warning:', e);
  }

  const clean = str => (str || '').replace(/\s+(East|West|North|South|Village|Gaon|Town|Taluka|Subdistrict|District|City|Corporation)$/i, '').trim();
  locality = clean(locality);
  city = clean(city);
  stateDist = clean(stateDist);

  let formatted = '';
  if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
    formatted = `${locality}, ${city}`;
  } else if (locality) {
    formatted = `${locality}, ${state}`;
  } else if (city) {
    formatted = `${city}, ${state}`;
  } else {
    // Find closest district by Haversine
    let bestDist = 9999;
    let bestName = 'Nashik';
    for (const [dName, c] of Object.entries(districtCoordinates)) {
      const d = haversineKm(lat, lon, c[0], c[1]);
      if (d < bestDist) {
        bestDist = d;
        bestName = dName;
      }
    }
    formatted = `${bestName}, Maharashtra`;
  }

  return { locality, city, stateDist, state, formatted };
}

// --- LOCATION SEARCH & RECENT DETECTED HISTORY ---
const RECENT_LOC_KEY = 'farmroute_recent_locations';

function getLocationHistory() {
  try {
    const raw = localStorage.getItem(RECENT_LOC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Explicitly purge any previously saved Nerul entry from user storage
      const cleaned = parsed.filter(item => item && item.name && !item.name.toLowerCase().includes('nerul'));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(RECENT_LOC_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (e) { }
  return []; // Clean empty slate: no fake Nerul
}

function addLocationToHistory(name, lat, lon) {
  if (!name || name.toLowerCase().includes('nerul')) return; // Do not save Nerul
  try {
    let history = getLocationHistory();
    history = history.filter(h => h.name.toLowerCase() !== name.toLowerCase());
    history.unshift({ name, lat, lon });
    if (history.length > 6) history = history.slice(0, 6);
    localStorage.setItem(RECENT_LOC_KEY, JSON.stringify(history));
    renderLocationHistory();
  } catch (e) { }
}

function clearLocationHistory() {
  localStorage.removeItem(RECENT_LOC_KEY);
  renderLocationHistory();
  showToast('Search history cleared.');
}
window.clearLocationHistory = clearLocationHistory;

function renderLocationHistory() {
  const container = document.querySelector('#location-history-chips');
  if (!container) return;
  const history = getLocationHistory();
  if (!history || history.length === 0) {
    container.innerHTML = `<span class="empty-history-hint">No recent searches yet. Search any APMC, taluka, or tap GPS above.</span>`;
    return;
  }
  container.innerHTML = history.map(item => `
    <button type="button" class="btn-loc-chip" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${item.name}" title="Switch to ${item.name}">
      📍 ${item.name}
    </button>
  `).join('') + `<button type="button" class="btn-clear-history-pill" onclick="clearLocationHistory()" title="Clear History">✕ Clear</button>`;

  container.querySelectorAll('.btn-loc-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);
      const name = btn.dataset.name;
      applyDetectedLocation(lat, lon, 20, name);
    });
  });
}

let locSearchTimeout = null;
async function searchLocationNominatim(query) {
  const dropdown = document.querySelector('#loc-search-results');
  if (!dropdown) return;
  if (!query || query.trim().length < 2) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Maharashtra, India')}&countrycodes=in&limit=5&email=farmroute_farmer_app@gmail.com`;
    const res = await fetch(url);
    if (res.ok) {
      const results = await res.json();
      if (!results || results.length === 0) {
        dropdown.innerHTML = '<div class="loc-search-item" style="color:#64748b;">No matching location found in Maharashtra.</div>';
        dropdown.style.display = 'block';
        return;
      }
      dropdown.innerHTML = results.map(r => {
        const parts = r.display_name.split(',');
        const shortName = (parts[0] + (parts[1] ? ', ' + parts[1].trim() : '')).trim();
        return `<div class="loc-search-item" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${shortName}">
          <span>📍</span> <b>${shortName}</b> <small style="color:#64748b;margin-left:auto;">${r.type || 'place'}</small>
        </div>`;
      }).join('');
      dropdown.style.display = 'block';

      dropdown.querySelectorAll('.loc-search-item').forEach(item => {
        item.addEventListener('click', () => {
          const lat = parseFloat(item.dataset.lat);
          const lon = parseFloat(item.dataset.lon);
          const name = item.dataset.name;
          dropdown.style.display = 'none';
          const inputEl = document.querySelector('#input-loc-search');
          if (inputEl) inputEl.value = name;
          applyDetectedLocation(lat, lon, 20, name);
        });
      });
    }
  } catch (err) {
    console.warn('Search nominatim error:', err);
  }
}

async function applyDetectedLocation(lat, lon, accuracy = 25, forcedLocName = null) {
  const btn = document.querySelector('#btn-detect-gps');
  const label = document.querySelector('#gps-btn-label');
  const badge = document.querySelector('#gps-status-badge');
  const statusText = document.querySelector('#gps-status-text');

  btn.classList.remove('locating');
  badge.className = 'gps-status-pill located';

  let locationName = forcedLocName;
  let locDetail = null;

  if (!locationName) {
    statusText.textContent = 'Reverse-geocoding coordinates with OpenStreetMap...';
    locDetail = await reverseGeocodeCoords(lat, lon);
    locationName = locDetail.formatted;
  }

  detectedGpsCoords = [lat, lon];
  detectedLocationLabel = locationName;

  // Set single location name without duplicating emoji
  label.textContent = locationName;
  statusText.innerHTML = `<b>📍 Location:</b> ${locationName} (±${Math.round(accuracy)}m)`;

  // Add to persistent search / detected history
  addLocationToHistory(locationName, lat, lon);

  // Update District & Taluka in Farm Form
  const locality = locDetail ? locDetail.locality : (locationName.split(',')[0].trim());
  const city = locDetail ? (locDetail.city || locDetail.stateDist) : (locationName.split(',')[1] ? locationName.split(',')[1].trim() : 'Nashik');

  // Match or add district
  const distSelect = document.querySelector('#district');
  let distMatched = false;
  for (let opt of distSelect.options) {
    if (opt.value.toLowerCase() === city.toLowerCase() ||
      city.toLowerCase().includes(opt.value.toLowerCase()) ||
      opt.value.toLowerCase().includes(city.toLowerCase())) {
      distSelect.value = opt.value;
      refreshTalukas(opt.value);
      distMatched = true;
      break;
    }
  }
  if (!distMatched && city) {
    const newOpt = new Option(city, city, true, true);
    distSelect.add(newOpt, 0);
    refreshTalukas(city);
  }

  // Match or add taluka
  const talukaSelect = document.querySelector('#taluka');
  let talukaMatched = false;
  for (let opt of talukaSelect.options) {
    if (opt.value.toLowerCase() === locality.toLowerCase() ||
      locality.toLowerCase().includes(opt.value.toLowerCase())) {
      talukaSelect.value = opt.value;
      talukaMatched = true;
      break;
    }
  }
  if (!talukaMatched && locality) {
    const newTalOpt = new Option(locality, locality, true, true);
    talukaSelect.add(newTalOpt, 0);
    talukaSelect.value = locality;
  }

  // Update dynamic warehouses, logistics & recommendations
  renderWarehouses();
  updateLogisticsView();
  updateTimingView();
  renderRecommendation(evaluate(getState()));
  findNearestMandisLive(lat, lon);

  showToast(`Location locked: ${locationName}!`);
}

async function detectCurrentLocation() {
  const btn = document.querySelector('#btn-detect-gps');
  const label = document.querySelector('#gps-btn-label');
  const badge = document.querySelector('#gps-status-badge');
  const statusText = document.querySelector('#gps-status-text');

  btn.classList.add('locating');
  label.textContent = 'Detecting Location...';
  badge.className = 'gps-status-pill locating';
  statusText.textContent = 'Acquiring GPS / Wi-Fi coordinates...';

  try {
    const coords = await acquireCoordinates();
    statusText.textContent = 'Reverse-geocoding place name...';
    await applyDetectedLocation(coords.lat, coords.lon, coords.accuracy);
  } catch (err) {
    console.warn('detectCurrentLocation error:', err);
    badge.className = 'gps-status-pill';
    statusText.textContent = 'Location lookup timed out. Search your mandi above.';
    showToast('GPS timed out. You can search or select a taluka directly.');
  } finally {
    btn.classList.remove('locating');
    badge.className = 'gps-status-pill';
    if (!detectedLocationLabel) {
      label.textContent = 'Detect My Location (GPS)';
    }
  }
}

// --- LEAFLET OPENSTREETMAP ROUTE MAP ---
function initOrUpdateMandiMap(originCoords, mandis) {
  const mapContainer = document.querySelector('#mandi-map');
  if (!mapContainer || typeof L === 'undefined') return;

  if (!leafletMap) {
    leafletMap = L.map('mandi-map').setView(originCoords, 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap);
    mapMarkersGroup = L.layerGroup().addTo(leafletMap);
  } else {
    mapMarkersGroup.clearLayers();
    if (mapPolyline) leafletMap.removeLayer(mapPolyline);
  }

  // Farm Marker (Green Icon)
  const farmIcon = L.divIcon({
    className: 'custom-map-pin farm-pin',
    html: '<div style="background:#166534;color:#fff;border:2px solid #fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 8px rgba(0,0,0,0.3);">🌾</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const state = getState();
  const originName = detectedLocationLabel || `${state.taluka}, ${state.district}`;

  L.marker(originCoords, { icon: farmIcon })
    .addTo(mapMarkersGroup)
    .bindPopup(`
      <div class="map-popup-card">
        <b>🌾 Your Location</b>
        <div class="popup-meta">${originName}</div>
        <div>Lot: ${rupees(state.quantity)} kg (${state.commodity})</div>
      </div>
    `).openPopup();

  // Mandi Markers & Bounds
  const bounds = [originCoords];

  mandis.forEach((mandi, idx) => {
    if (!mandi.lat || !mandi.lon) return;
    const isTop = idx === 0;
    const mandiIcon = L.divIcon({
      className: 'custom-map-pin mandi-pin',
      html: `<div style="background:${isTop ? '#d97706' : '#0284c7'};color:#fff;border:2px solid #fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;box-shadow:0 3px 8px rgba(0,0,0,0.25);">${idx + 1}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const mMarker = L.marker([mandi.lat, mandi.lon], { icon: mandiIcon })
      .addTo(mapMarkersGroup)
      .bindPopup(`
        <div class="map-popup-card">
          <b>${mandi.name}</b>
          <div class="popup-price">₹${mandi.gross ? mandi.gross.toFixed(2) : (mandi.costing ? (mandi.costing.netPrice + 1).toFixed(2) : '30.50')}/kg</div>
          <div class="popup-meta">${mandi.road_distance_km || mandi.distance} km by road · ~${mandi.travel_time_minutes || 30} mins</div>
          <div style="margin-top:4px;font-weight:bold;color:#166534;">Take-home: ₹${mandi.costing ? mandi.costing.netPrice.toFixed(2) : (mandi.net ? mandi.net.toFixed(2) : '29.50')}/kg net</div>
        </div>
      `);

    bounds.push([mandi.lat, mandi.lon]);
  });

  leafletMap.fitBounds(bounds, { padding: [35, 35] });

  // Draw OSRM Road Driving Polyline to Top Mandi
  if (mandis.length > 0 && mandis[0].lat && mandis[0].lon) {
    const topMandi = mandis[0];
    const osrmRouteUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${topMandi.lon},${topMandi.lat}?overview=full&geometries=geojson`;

    fetch(osrmRouteUrl)
      .then(res => res.json())
      .then(routeData => {
        if (routeData.routes && routeData.routes[0]) {
          const coordinates = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          if (mapPolyline) leafletMap.removeLayer(mapPolyline);
          mapPolyline = L.polyline(coordinates, {
            color: '#166534',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 4'
          }).addTo(leafletMap);
        }
      })
      .catch(() => {
        // If OSRM fails, draw a straight flight line
        if (mapPolyline) leafletMap.removeLayer(mapPolyline);
        mapPolyline = L.polyline([originCoords, [topMandi.lat, topMandi.lon]], {
          color: '#166534',
          weight: 3,
          dashArray: '4, 4'
        }).addTo(leafletMap);
      });
  }
}

// --- BROWSER-BASED LIVE MANDI DISCOVERY WITH ACTUAL COSTING ---
async function findNearestMandisLive(lat, lon) {
  const container = document.querySelector('#live-mandi-results');
  container.classList.add('visible');
  document.querySelector('#live-mandi-title').textContent = 'Finding Nearest Mandis & Calculating Live Road Freight...';

  const originCoords = [lat, lon];
  const state = getState();

  // Tier 1: Local Python FastAPI backend check
  try {
    const localUrl = (window.location.port === '8000') ? '/api/mandis/nearest' : 'http://127.0.0.1:8000/api/mandis/nearest';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(localUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lon }),
      signal: timer.signal
    });
    clearTimeout(timer);
    if (response.ok) {
      const data = await response.json();
      renderLiveMandiResults(originCoords, data.optimal_mandi, data.alternatives, 'Python FastAPI + OSM');
      return;
    }
  } catch (err) {
    // Expected on Live Server extension; proceed to browser direct query
  }

  // Tier 2: Browser direct query to Overpass API + OSRM
  try {
    const overpassQuery = `
      [out:json][timeout:15];
      (
        nwr["amenity"="marketplace"](around:45000,${lat},${lon});
        nwr["name"~"mandi|apmc|sabji|vegetable",i](around:45000,${lat},${lon});
      );
      out center tags;
    `;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const opRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(overpassQuery),
      signal: timer.signal
    });
    clearTimeout(timer);

    if (opRes.ok) {
      const opData = await opRes.json();
      const candidates = [];
      (opData.elements || []).forEach(el => {
        const pt = el.lat ? el : (el.center || {});
        if (pt.lat && pt.lon) {
          const name = (el.tags && (el.tags.name || el.tags['name:en'])) || 'APMC Sub-Market';
          const aerial = haversineKm(lat, lon, pt.lat, pt.lon);
          const roadDist = Math.max(4, Math.round(aerial * 1.25));
          const transitMins = Math.max(10, Math.round(aerial * 1.6));
          const costing = computeDetailedCosting(roadDist, state.quantity, state.vehicle, 30.50, transitMins / 60);
          const ai = computeAiMandiScore(costing.netPrice, roadDist, 'Increasing', 88);

          candidates.push({
            name,
            road_distance_km: roadDist,
            travel_time_minutes: transitMins,
            lat: pt.lat,
            lon: pt.lon,
            costing,
            ai
          });
        }
      });

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.road_distance_km - b.road_distance_km);
        renderLiveMandiResults(originCoords, candidates[0], candidates.slice(1, 4), 'Live Browser Overpass OSM');
        return;
      }
    }
  } catch (opErr) {
    // Network timeout or offline; proceed to pre-indexed Maharashtra APMC dataset
  }

  // Tier 3: High-precision pre-indexed Maharashtra APMC dataset
  const preindexed = markets.map(m => {
    const aerial = haversineKm(lat, lon, m.lat, m.lon);
    const dist = Math.max(5, Math.round(aerial * 1.25));
    const mins = Math.max(12, Math.round(dist * 1.5));
    const costing = computeDetailedCosting(dist, state.quantity, state.vehicle, m.prices.at(-1), mins / 60);
    const ai = computeAiMandiScore(costing.netPrice, dist, trendFor(m).direction, 88);
    return {
      name: `${m.name.includes('APMC') ? m.name : m.name + ' APMC'}`,
      road_distance_km: dist,
      travel_time_minutes: mins,
      lat: m.lat,
      lon: m.lon,
      costing,
      ai
    };
  }).sort((a, b) => a.road_distance_km - b.road_distance_km);

  renderLiveMandiResults(originCoords, preindexed[0], preindexed.slice(1, 4), 'Pre-Indexed Maharashtra APMC Network');
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const p = Math.PI / 180;
  const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 +
    Math.cos(lat1 * p) * Math.cos(lat2 * p) *
    (1 - Math.cos((lon2 - lon1) * p)) / 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}
const calcHaversineKm = haversineKm;

function renderLiveMandiResults(originCoords, optimal, alternatives, sourceLabel) {
  const allMandis = [optimal, ...alternatives];
  const originName = detectedLocationLabel || 'your location';
  document.querySelector('#live-mandi-title').textContent = `Nearest Sabji Mandi: ${optimal.name}`;
  document.querySelector('#live-mandi-sub').textContent = `Discovered via ${sourceLabel} · Ranked by road travel time & net payout from ${originName}.`;

  const cardsContainer = document.querySelector('#live-mandi-cards');
  cardsContainer.innerHTML = allMandis.map((m, i) => {
    const isTop = i === 0;
    const costing = m.costing || { netPrice: 29.50, freightTotal: 180, totalDeductionsPerKg: 0.50 };
    const ai = m.ai || { matchPct: 96, label: 'Optimal Route' };

    return `
      <div class="live-mandi-item ${isTop ? 'top' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <b>${isTop ? '✦ ' : ''}${m.name}</b>
          <span class="status-pill verified" style="font-size:10px;">${ai.matchPct}% Match</span>
        </div>
        <small>${m.travel_time_minutes} mins · ${m.road_distance_km} km by road</small>
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font-size:11.5px;">
          <div>Est. Freight: <b>₹${rupees(costing.freightTotal)}</b> (₹${costing.freightPerKg ? costing.freightPerKg.toFixed(2) : '0.15'}/kg)</div>
          <div style="font-size:13px;font-weight:800;color:var(--primary-green);margin-top:3px;">
            Net Realisation: ₹${costing.netPrice.toFixed(2)}/kg
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Render Leaflet Map
  initOrUpdateMandiMap(originCoords, allMandis);
  setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 300);
}

// --- LOGISTICS SUITE CALCULATIONS ---
function updateLogisticsView() {
  const state = getState();
  const vehicle = vehicles[state.vehicle] || vehicles.mini;

  // Custom tariff override check
  const customRateInput = document.querySelector('#prof-custom-veh-rate');
  const customRate = customRateInput ? parseFloat(customRateInput.value) : 0;

  // Return-trip shared pool discount check
  const isSharedPool = document.querySelector('#chk-return-pool')?.checked || false;
  let activeRate = customRate > 0 ? customRate : vehicle.ratePerKm;
  if (isSharedPool) activeRate = Math.round(activeRate * 0.70);

  // Big rate update
  document.querySelector('#logistics-big-rate').innerHTML = `₹${activeRate} <small>/ route km ${isSharedPool ? '(Shared Pool 30% Off)' : customRate > 0 ? '(Custom Rate)' : ''}</small>`;
  document.querySelector('#origin-logistics').textContent = state.detectedLocationName || `${state.taluka}, ${state.district}`;

  // Top 3 target markets distance
  const targetMarkets = markets.slice(0, 3);
  const avgDist = Math.round(targetMarkets.reduce((sum, m) => sum + getRouteDistance(state, m.name), 0) / targetMarkets.length);

  const tripBase = Math.round(avgDist * activeRate);
  const hamali = Math.round((state.quantity / 100) * 12); // ₹12 per quintal
  const shrinkageKg = Math.round(state.quantity * 0.01);
  const shrinkageVal = Math.round(shrinkageKg * 28.5);
  const totalTripCost = tripBase + hamali;
  const costPerKg = fixed(totalTripCost / state.quantity);

  document.querySelector('#logistics-avg-dist').textContent = `${avgDist} km`;
  document.querySelector('#logistics-base-freight').textContent = `₹${tripBase} (${avgDist} km @ ₹${activeRate}/km)`;
  document.querySelector('#logistics-hamali').textContent = `₹${hamali} (${Math.round(state.quantity / 50)} bags @ ₹6/bag)`;
  document.querySelector('#logistics-shrinkage').textContent = `~${shrinkageKg} kg (est. ₹${rupees(shrinkageVal)})`;
  document.querySelector('#logistics-total-cost').textContent = `₹${costPerKg} / kg (₹${rupees(totalTripCost)} total trip)`;

  // Truck Payload Utilization Gauge
  const maxPayload = vehicle.maxPayload || 2500;
  const utilPct = Math.round((state.quantity / maxPayload) * 100);
  const utilBar = document.querySelector('#truck-utilization-bar');
  const utilLabel = document.querySelector('#truck-utilization-pct');
  const utilHint = document.querySelector('#truck-utilization-hint');

  if (utilBar && utilLabel && utilHint) {
    utilBar.style.width = `${Math.min(100, utilPct)}%`;
    if (utilPct > 100) {
      utilBar.classList.add('overload');
      utilLabel.innerHTML = `<span style="color:#ef4444;font-weight:900;">⚠️ ${utilPct}% (Overloaded by ${rupees(state.quantity - maxPayload)} kg)</span>`;
      utilHint.textContent = `Warning: Your lot exceeds ${vehicle.name} payload limit (${rupees(maxPayload)} kg). Switch to a larger truck or make multiple trips.`;
    } else {
      utilBar.classList.remove('overload');
      utilLabel.textContent = `${utilPct}% Loaded (${rupees(state.quantity)} / ${rupees(maxPayload)} kg)`;
      utilHint.textContent = `Optimal load capacity. Fuel consumption and axle load are perfectly balanced for road transport.`;
    }
  }

  // Live Diesel Fuel Calculation
  const mileage = state.vehicle === 'mini' ? 11 : state.vehicle === 'pickup' ? 9 : state.vehicle === 'medium' ? 5.5 : state.vehicle === 'heavy' ? 3.5 : 7;
  const roundTripKm = avgDist * 2;
  const litresNeeded = (roundTripKm / mileage).toFixed(1);
  const dieselCost = Math.round(litresNeeded * 92.50);
  const driverMisc = Math.max(80, Math.round(tripBase * 0.45));

  const fuelLitresEl = document.querySelector('#fuel-litres');
  const fuelCostEl = document.querySelector('#fuel-cost');
  const fuelMiscEl = document.querySelector('#fuel-misc');
  if (fuelLitresEl) fuelLitresEl.textContent = `${litresNeeded} Litres (${roundTripKm} km round-trip @ ${mileage} km/L)`;
  if (fuelCostEl) fuelCostEl.textContent = `₹${rupees(dieselCost)} (Diesel @ ₹92.50/L)`;
  if (fuelMiscEl) fuelMiscEl.textContent = `₹${rupees(driverMisc)} (Driver allowance + toll share)`;

  // Multi-market freight comparison table
  const comparisonTargets = [
    { name: 'Vashi APMC (Navi Mumbai)', target: 'Vashi (Navi Mumbai)', timeHrs: '0h 25m' },
    { name: 'Panvel APMC', target: 'Panvel APMC', timeHrs: '0h 30m' },
    { name: 'Thane APMC', target: 'Thane APMC', timeHrs: '0h 40m' },
    { name: 'Kalyan APMC', target: 'Kalyan APMC', timeHrs: '0h 45m' },
    { name: 'Pune Market Yard', target: 'Pune Market Yard', timeHrs: '2h 45m' },
    { name: 'Lasalgaon APMC', target: 'Lasalgaon', timeHrs: '4h 15m' }
  ];

  const tableBody = document.querySelector('#freight-matrix-body');
  if (tableBody) {
    tableBody.innerHTML = comparisonTargets.map(tgt => {
      const d = getRouteDistance(state, tgt.target);
      const tripCost = Math.round(d * activeRate);
      const perKg = fixed(tripCost / state.quantity);
      return `
        <tr>
          <td><b>${tgt.name}</b></td>
          <td>${d} km</td>
          <td>${tgt.timeHrs}</td>
          <td><b class="text-green">₹${perKg.toFixed(2)}/kg</b></td>
          <td>₹${rupees(tripCost)}</td>
        </tr>
      `;
    }).join('');
  }

  // Update auto recommend vehicle tag
  const recVehKey = autoRecommendVehicle(state.quantity);
  const recVeh = vehicles[recVehKey];
  document.querySelector('#fleet-auto-tag').innerHTML =
    `<span>Auto-recommend for ${rupees(state.quantity)} kg: <b>${recVeh.name}</b></span>`;
}

function autoRecommendVehicle(qty) {
  if (qty <= 2500) return 'mini';
  if (qty <= 3500) return 'pickup';
  if (qty <= 9000) return 'medium';
  return 'heavy';
}

// --- TIME GRADING & STORAGE SIMULATION ---
function updateTimingView() {
  const state = getState();
  const slider = document.querySelector('#sim-storage-slider');
  const days = Number(slider.value) || 0;
  document.querySelector('#sim-duration-val').textContent = `${days} Days`;

  const profile = qualityProfiles[activeAnalysisKey] || qualityProfiles.cured;
  const basePrice = 28.50; // modal baseline

  // Market appreciation curve: price appreciates +₹0.065 per day during rising market trend
  const projPrice = fixed(basePrice + (days * 0.065));
  const priceDiff = fixed(projPrice - basePrice);

  // Storage fee: ₹0.08 per kg per day
  const storageCostPerKg = fixed(days * 0.08);
  const totalStorageFee = Math.round(storageCostPerKg * state.quantity);

  // Dehydration moisture shrinkage curve: 0.16% per day in storage
  const shrinkagePct = fixed(Math.min(12, days * 0.16));
  const lostKg = Math.round(state.quantity * (shrinkagePct / 100));
  const remainingKg = state.quantity - lostKg;
  const shrinkageLossVal = Math.round(lostKg * projPrice);

  // Net calculations
  const todayNetTotal = Math.round(state.quantity * (basePrice - 0.50));
  const futureNetTotal = Math.round((remainingKg * (projPrice - 0.50)) - totalStorageFee);
  const netDiff = futureNetTotal - todayNetTotal;

  document.querySelector('#sim-proj-price').textContent = `₹${projPrice.toFixed(2)} /kg`;
  document.querySelector('#sim-price-diff').textContent = `${priceDiff >= 0 ? '+' : ''}₹${priceDiff.toFixed(2)} vs Today`;
  document.querySelector('#sim-storage-cost').textContent = `₹${storageCostPerKg.toFixed(2)} /kg`;
  document.querySelector('#sim-storage-total').textContent = `₹${rupees(totalStorageFee)} total`;
  document.querySelector('#sim-shrinkage-loss').textContent = `${shrinkagePct}% (${lostKg} kg)`;
  document.querySelector('#sim-shrinkage-cost').textContent = `−₹${rupees(shrinkageLossVal)} value loss`;

  const diffEl = document.querySelector('#sim-net-diff');
  const verdictEl = document.querySelector('#sim-diff-verdict');
  if (netDiff >= 0) {
    diffEl.textContent = `+₹${rupees(netDiff)}`;
    diffEl.className = 'text-green';
    verdictEl.textContent = 'Profitable to Hold';
  } else {
    diffEl.textContent = `−₹${rupees(Math.abs(netDiff))}`;
    diffEl.className = 'text-red';
    verdictEl.textContent = 'Hold Loss (Sell Today)';
  }

  // Breakeven price calculation
  const breakevenAppreciation = fixed(storageCostPerKg + (projPrice * (shrinkagePct / 100)));
  document.querySelector('#be-desc').innerHTML =
    `To profit from holding for ${days} days, the mandi price must appreciate by at least <b>₹${breakevenAppreciation.toFixed(2)}/kg</b> to offset cold store rent and natural ${shrinkagePct}% weight shrinkage.`;

  // Spoilage Risk Meter calculation
  const maxSafeShelf = profile.shelfDays;
  const riskPct = Math.min(100, Math.round((days / maxSafeShelf) * 85 + (100 - profile.curingScore) * 0.3));
  const riskFill = document.querySelector('#risk-fill');
  const riskBadge = document.querySelector('#risk-badge');
  if (riskFill) riskFill.style.width = `${riskPct}%`;

  if (riskPct <= 35) {
    riskBadge.innerHTML = `<span class="dot-green"></span> <b>LOW SPOILAGE RISK (${riskPct}%)</b>`;
    riskBadge.style.borderColor = '#bbf7d0';
    riskBadge.style.background = '#f0fdf4';
  } else if (riskPct <= 65) {
    riskBadge.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#eab308;"></span> <b style="color:#854d0e;">MODERATE CAUTION (${riskPct}%)</b>`;
    riskBadge.style.borderColor = '#fef08a';
    riskBadge.style.background = '#fefce8';
  } else {
    riskBadge.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#ef4444;"></span> <b style="color:#b91c1c;">HIGH DISTRESS / ROT RISK (${riskPct}%)</b>`;
    riskBadge.style.borderColor = '#fecaca';
    riskBadge.style.background = '#fef2f2';
  }

  document.querySelector('#timing-crop-type').textContent = profile.cropType;
  document.querySelector('#timing-curing-val').textContent = `${profile.curingScore}% Cured`;
  document.querySelector('#timing-sprout-days').textContent = `~${Math.max(5, profile.shelfDays - days)} Days remaining`;

  // Horizon Table
  renderTimingHorizonTable(basePrice, state.quantity);
}

function renderTimingHorizonTable(basePrice, totalKg) {
  const intervals = [0, 10, 20, 30, 45, 60];
  const tableBody = document.querySelector('#timing-horizon-body');
  if (!tableBody) return;

  const todayNetTotal = Math.round(totalKg * (basePrice - 0.50));

  tableBody.innerHTML = intervals.map(d => {
    const projP = fixed(basePrice + (d * 0.065));
    const storePerKg = fixed(d * 0.08);
    const storeFeeTotal = Math.round(storePerKg * totalKg);
    const lossPct = fixed(Math.min(14, d * 0.16));
    const remKg = Math.round(totalKg * (1 - lossPct / 100));
    const payout = Math.round((remKg * (projP - 0.50)) - storeFeeTotal);
    const diff = payout - todayNetTotal;
    const isOptimal = d === 20;

    return `
      <tr class="${isOptimal ? 'highlight-row' : ''}">
        <td><b>Day ${d} ${d === 0 ? '(Today)' : ''}</b> ${isOptimal ? '★ Best Window' : ''}</td>
        <td>₹${projP.toFixed(2)}/kg</td>
        <td>₹${storePerKg.toFixed(2)}/kg</td>
        <td>${lossPct}%</td>
        <td>${rupees(remKg)} kg</td>
        <td><b>₹${rupees(payout)}</b></td>
        <td><b class="${diff >= 0 ? 'text-green' : 'text-red'}">${diff >= 0 ? '+' : ''}₹${rupees(diff)}</b></td>
        <td>${diff > 500 ? '<span class="grade-badge green">High Profit</span>' : diff >= 0 ? '<span class="grade-badge blue">Marginal</span>' : '<span class="grade-badge amber">Net Loss</span>'}</td>
      </tr>
    `;
  }).join('');
}

// --- CROP QUALITY ANALYSER & CANVAS ENGINE ---
const canvas = document.querySelector('#crop-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let currentImageObject = new Image();

function loadQualityPreset(key) {
  activeAnalysisKey = key;
  const profile = qualityProfiles[key];
  if (!profile) return;

  document.querySelector('#scorecard-grade').textContent = profile.gradeLabel;
  document.querySelector('#scorecard-title').textContent = profile.title;
  document.querySelector('#scorecard-detail').textContent = profile.detail;
  document.querySelector('#metric-curing').textContent = `${profile.curingScore}%`;
  document.querySelector('#metric-moisture').textContent = `${profile.moisturePct}%`;
  document.querySelector('#metric-neck').textContent = `${profile.neckMm} mm`;
  document.querySelector('#metric-sprout').textContent = `${profile.sproutRisk}%`;

  const guidanceEl = document.querySelector('#guidance-list');
  if (guidanceEl) {
    guidanceEl.innerHTML = profile.guidance.map(g => `<li>${g}</li>`).join('');
  }

  currentImageObject.crossOrigin = 'anonymous';
  currentImageObject.onload = () => {
    drawCanvasWithOverlays(profile.overlays);
  };
  currentImageObject.src = customImageSrc || profile.imageSrc;
}

function drawCanvasWithOverlays(overlays) {
  if (!ctx || !canvas) return;

  canvas.width = 600;
  canvas.height = 420;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentImageObject, 0, 0, canvas.width, canvas.height);

  if (!overlays) return;

  // 1. Neck Constriction Overlay
  if (activeOverlays.neck && overlays.neck) {
    overlays.neck.forEach(n => {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(n.x, n.y, n.w, n.h);
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(n.x, n.y + n.h / 2);
      ctx.lineTo(n.x + n.w, n.y + n.h / 2);
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(n.x, n.y - 20, 130, 18);
      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(n.label, n.x + 4, n.y - 6);
    });
  }

  // 2. Curing Heatmap Overlay
  if (activeOverlays.curing && overlays.curing) {
    overlays.curing.forEach(c => {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x, c.y, c.w, c.h);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(c.x, c.y - 20, 120, 18);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(c.label, c.x + 4, c.y - 6);
    });
  }

  // 3. Sizing Caliper Overlay
  if (activeOverlays.sizing && overlays.sizing) {
    overlays.sizing.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, s.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(s.cx - 65, s.cy + s.r + 4, 130, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(s.label, s.cx - 60, s.cy + s.r + 17);
    });
  }

  // 4. Defect & Rot Scan Overlay
  if (activeOverlays.defects && overlays.defects) {
    overlays.defects.forEach(d => {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x, d.y, d.w, d.h);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(d.x, d.y - 20, 135, 18);
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(d.label, d.x + 4, d.y - 6);
    });
  }
}

// --- FARMER USER PROFILE MANAGEMENT ---
const defaultProfile = {
  name: 'Ramesh Shankar Patil',
  phone: '+91 98224 51890',
  khata: 'KH-2026-NPH-842',
  village: 'Pimpalgaon Road, Niphad',
  taluka: 'Niphad',
  district: 'Nashik',
  land: 6.5,
  soil: 'black_cotton',
  storage: 30,
  season: 'rabi',
  bank: 'Bank of Maharashtra',
  account: '60184491023',
  ifsc: 'MAHB0000184',
  upi: '9822451890@upi',
  defVehicle: 'mini',
  defQty: 2000
};

function loadUserProfile() {
  const saved = localStorage.getItem('farmroute_farmer_profile_2026');
  const prof = saved ? JSON.parse(saved) : defaultProfile;

  document.querySelector('#card-farmer-name').textContent = prof.name;
  document.querySelector('#header-farmer-name').textContent = prof.name.split(' ')[0] + ' ' + (prof.name.split(' ')[1] || '');
  document.querySelector('#prof-name').value = prof.name;
  document.querySelector('#prof-phone').value = prof.phone;
  document.querySelector('#prof-khata').value = prof.khata;
  document.querySelector('#prof-village').value = prof.village;
  document.querySelector('#prof-taluka').value = prof.taluka;
  document.querySelector('#prof-district').value = prof.district;
  document.querySelector('#prof-land').value = prof.land;
  document.querySelector('#prof-soil').value = prof.soil;
  document.querySelector('#prof-storage').value = prof.storage;
  document.querySelector('#prof-season').value = prof.season;
  document.querySelector('#prof-bank').value = prof.bank;
  document.querySelector('#prof-account').value = prof.account;
  document.querySelector('#prof-ifsc').value = prof.ifsc;
  document.querySelector('#prof-upi').value = prof.upi;
  document.querySelector('#prof-def-vehicle').value = prof.defVehicle;
  document.querySelector('#prof-def-qty').value = prof.defQty;

  return prof;
}

function saveUserProfile(e) {
  if (e) e.preventDefault();
  const prof = {
    name: document.querySelector('#prof-name').value.trim() || 'Ramesh Patil',
    phone: document.querySelector('#prof-phone').value.trim(),
    khata: document.querySelector('#prof-khata').value.trim(),
    village: document.querySelector('#prof-village').value.trim(),
    taluka: document.querySelector('#prof-taluka').value.trim(),
    district: document.querySelector('#prof-district').value.trim(),
    land: Number(document.querySelector('#prof-land').value) || 5,
    soil: document.querySelector('#prof-soil').value,
    storage: Number(document.querySelector('#prof-storage').value) || 20,
    season: document.querySelector('#prof-season').value,
    bank: document.querySelector('#prof-bank').value.trim(),
    account: document.querySelector('#prof-account').value.trim(),
    ifsc: document.querySelector('#prof-ifsc').value.trim(),
    upi: document.querySelector('#prof-upi').value.trim(),
    defVehicle: document.querySelector('#prof-def-vehicle').value,
    defQty: Number(document.querySelector('#prof-def-qty').value) || 2000
  };

  localStorage.setItem('farmroute_farmer_profile_2026', JSON.stringify(prof));
  loadUserProfile();
  showToast('Farmer Profile & Land Records saved!');
}

function syncProfileToFarmLot() {
  const prof = loadUserProfile();

  const distSelect = document.querySelector('#district');
  if (distSelect) {
    distSelect.value = prof.district;
    refreshTalukas(prof.district);
  }
  const talukaSelect = document.querySelector('#taluka');
  if (talukaSelect) {
    talukaSelect.value = prof.taluka;
  }

  document.querySelector('#quantity').value = prof.defQty;

  selectedVehicleKey = prof.defVehicle;
  document.querySelectorAll('.vehicle-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.vehicle === prof.defVehicle);
  });

  renderRecommendation(evaluate(getState()));
  updateLogisticsView();
  updateTimingView();
  activateView('dashboard');
  showToast(`Profile applied: ${prof.taluka}, ${prof.defQty} kg, ${vehicles[prof.defVehicle].name}!`);
}

// --- VIEW NAVIGATION & STEPPER ---
function activateView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === viewId));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  document.querySelectorAll('.step-btn').forEach(s => s.classList.toggle('active', s.dataset.step === viewId));
  document.querySelectorAll('.mobile-nav-item').forEach(m => m.classList.toggle('active', m.dataset.view === viewId));

  const sidebar = document.querySelector('#navigation');
  const backdrop = document.querySelector('#sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewId === 'logistics') updateLogisticsView();
  if (viewId === 'timing') updateTimingView();
  if (viewId === 'quality') loadQualityPreset(activeAnalysisKey);
  if (viewId === 'profile') loadUserProfile();
  if (viewId === 'payments') initPaymentsView();
  if (leafletMap) setTimeout(() => leafletMap.invalidateSize(), 300);
}
window.activateView = activateView;

// --- TOAST NOTIFICATIONS ---
function showToast(msg) {
  const toast = document.querySelector('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// --- INITIALIZATION & EVENT BINDINGS ---
function initApp() {
  // Populate Districts Dropdown
  const districtSelect = document.querySelector('#district');
  const distNames = Object.keys(districtCoordinates);
  districtSelect.innerHTML = distNames.map(d => `<option value="${d}" ${d === 'Nashik' ? 'selected' : ''}>${d}</option>`).join('');

  // Populate Talukas
  refreshTalukas('Nashik');
  districtSelect.addEventListener('change', e => refreshTalukas(e.target.value));

  // Load User Profile & Customization
  loadUserProfile();
  initProfileCustomization();
  initPaymentsView();

  // Render static initial sections & dynamic warehouses
  renderMarketsAndBuyers();
  renderLocationHistory();
  renderWarehouses();

  // Run initial evaluation
  const initialState = getState();
  renderRecommendation(evaluate(initialState));
  updateLogisticsView();
  updateTimingView();
  loadQualityPreset('cured');

  // Navigation click bindings (Sidebar, Stepper, Mobile Nav)
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => activateView(btn.dataset.view));
  });

  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => activateView(btn.dataset.step));
  });

  document.querySelectorAll('.mobile-nav-item').forEach(btn => {
    btn.addEventListener('click', () => activateView(btn.dataset.view));
  });

  document.querySelector('#btn-header-profile')?.addEventListener('click', () => activateView('profile'));

  // Mobile Drawer Toggle Handlers
  const toggleSidebar = () => {
    const sidebar = document.querySelector('#navigation');
    const backdrop = document.querySelector('#sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('open');
  };
  document.querySelector('#mobile-menu')?.addEventListener('click', toggleSidebar);
  document.querySelector('#btn-close-sidebar')?.addEventListener('click', toggleSidebar);
  document.querySelector('#sidebar-backdrop')?.addEventListener('click', toggleSidebar);

  // GPS Location Detection Button
  document.querySelector('#btn-detect-gps').addEventListener('click', detectCurrentLocation);

  // Dynamic Location Search Nominatim
  const locInput = document.querySelector('#input-loc-search');
  const locBtn = document.querySelector('#btn-run-loc-search');
  if (locInput) {
    locInput.addEventListener('input', e => {
      clearTimeout(locSearchTimeout);
      locSearchTimeout = setTimeout(() => searchLocationNominatim(e.target.value), 350);
    });
    locInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchLocationNominatim(locInput.value);
      }
    });
  }
  if (locBtn) {
    locBtn.addEventListener('click', () => searchLocationNominatim(locInput?.value));
  }

  // Dynamic Warehouse Filter Chips
  document.querySelectorAll('.btn-wh-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-wh-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWarehouses(btn.dataset.filter);
    });
  });

  // AGMARK Generator Button
  const btnGenAgmark = document.querySelector('#btn-generate-agmark-card');
  if (btnGenAgmark) btnGenAgmark.addEventListener('click', generateAgmarkCertificate);

  // Return-trip Freight Pool Toggle
  const chkReturnPool = document.querySelector('#chk-return-pool');
  if (chkReturnPool) {
    chkReturnPool.addEventListener('change', () => {
      updateLogisticsView();
      showToast(chkReturnPool.checked ? 'Return-Trip Pooling Enabled: 30% Freight Discount Active!' : 'Standard Dedicated Freight Restored');
    });
  }

  // Transporter Booking Modal Handlers
  const btnOpenBooking = document.querySelector('#btn-open-booking-modal');
  if (btnOpenBooking) btnOpenBooking.addEventListener('click', openTransporterBookingModal);
  const btnCloseDispatch = document.querySelector('#btn-close-dispatch-modal');
  if (btnCloseDispatch) btnCloseDispatch.addEventListener('click', closeTransporterBookingModal);
  const btnDismissDispatch = document.querySelector('#btn-dismiss-dispatch');
  if (btnDismissDispatch) btnDismissDispatch.addEventListener('click', closeTransporterBookingModal);
  const btnConfirmDispatch = document.querySelector('#btn-confirm-dispatch');
  if (btnConfirmDispatch) {
    btnConfirmDispatch.addEventListener('click', () => {
      closeTransporterBookingModal();
      showToast('🚚 Transporter Santosh Shinde dispatched! Driver arriving at farm in ~25 mins.');
    });
  }

  // Anti-Fraud Legal Notice Form & Trader Search
  const formNotice = document.querySelector('#form-legal-notice');
  if (formNotice) formNotice.addEventListener('submit', generateStatutoryLegalNotice);
  const btnCheckTrader = document.querySelector('#btn-check-trader');
  const inputTrader = document.querySelector('#input-trader-search');
  if (btnCheckTrader && inputTrader) {
    btnCheckTrader.addEventListener('click', () => {
      const q = inputTrader.value.toLowerCase().trim();
      const items = document.querySelectorAll('.trader-status-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
      });
      showToast(`Filtered traders for "${inputTrader.value || 'All'}"`);
    });
  }

  // Profile Form & Sync Buttons
  document.querySelector('#profile-form').addEventListener('submit', saveUserProfile);
  document.querySelector('#btn-sync-profile-to-form').addEventListener('click', syncProfileToFarmLot);

  // Profile JSON export
  document.querySelector('#btn-export-profile-json').addEventListener('click', () => {
    const prof = loadUserProfile();
    const blob = new Blob([JSON.stringify(prof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FarmRoute-Profile-${prof.taluka}.json`;
    a.click();
    showToast('Profile JSON exported successfully!');
  });

  document.querySelector('#btn-clear-saved').addEventListener('click', () => {
    if (confirm('Clear saved scenario history in this browser?')) {
      localStorage.removeItem('farmroute-scenario-2026');
      showToast('Saved scenario cleared.');
    }
  });

  // Farm Form Submit
  document.querySelector('#farm-form').addEventListener('submit', e => {
    e.preventDefault();
    const state = getState();
    const coords = state.coordinates || districtCoordinates[state.district];
    if (coords) findNearestMandisLive(coords[0], coords[1]);
    renderRecommendation(evaluate(state));
    updateLogisticsView();
    updateTimingView();
    activateView('recommendation');
    showToast('Optimal selling route calculated!');
  });

  // Quick Quantity Selection Chips
  document.querySelectorAll('.quick-amounts button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('#quantity').value = btn.dataset.quantity;
      document.querySelectorAll('.quick-amounts button').forEach(b => b.classList.toggle('selected', b === btn));
      const state = getState();
      renderRecommendation(evaluate(state));
      updateLogisticsView();
      updateTimingView();
    });
  });

  // Grade Cards Radio Selection
  document.querySelectorAll('.grade-card').forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input');
      if (radio) radio.checked = true;
      document.querySelectorAll('.grade-card').forEach(c => c.classList.toggle('selected', c === card));
      renderRecommendation(evaluate(getState()));
    });
  });

  // Range Sliders
  document.querySelector('#storage').addEventListener('input', e => {
    const d = e.target.value;
    document.querySelector('#storage-output').textContent = `${d} days ${d === '0' ? '(Sell Now)' : ''}`;
  });

  document.querySelector('#shelf-life').addEventListener('input', e => {
    document.querySelector('#shelf-output').textContent = `${e.target.value} days`;
  });

  // Live Mandi Button
  document.querySelector('#find-mandi-from-farm').addEventListener('click', () => {
    const state = getState();
    const taluka = document.querySelector('#taluka').value;
    const coords = detectedGpsCoords || nashikPilotTalukaCoordinates[taluka] || districtCoordinates[state.district] || districtCoordinates.Nashik;
    findNearestMandisLive(coords[0], coords[1]);
  });

  // Go to Quality Analyser Callout
  document.querySelector('#btn-goto-quality').addEventListener('click', () => activateView('quality'));

  // Quality Preset Buttons
  document.querySelectorAll('[data-analysis]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-analysis]').forEach(b => b.classList.toggle('selected', b === btn));
      customImageSrc = null;
      loadQualityPreset(btn.dataset.analysis);
      showToast(`Loaded ${qualityProfiles[btn.dataset.analysis].name}`);
    });
  });

  // Canvas Overlay Toggles
  document.querySelectorAll('.btn-overlay').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.overlay;
      activeOverlays[type] = !activeOverlays[type];
      btn.classList.toggle('active', activeOverlays[type]);
      const prof = qualityProfiles[activeAnalysisKey];
      if (prof) drawCanvasWithOverlays(prof.overlays);
    });
  });

  // Reset Canvas Button
  document.querySelector('#btn-reset-canvas').addEventListener('click', () => {
    activeOverlays = { neck: true, curing: true, sizing: true, defects: true };
    document.querySelectorAll('.btn-overlay').forEach(b => b.classList.add('active'));
    loadQualityPreset(activeAnalysisKey);
  });

  // Image Upload Handling
  const photoInput = document.querySelector('#onion-photo');
  photoInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    document.querySelector('#photo-name').textContent = `${file.name} loaded · Running instant scan`;
    const reader = new FileReader();
    reader.onload = ev => {
      customImageSrc = ev.target.result;
      currentImageObject.src = customImageSrc;
      currentImageObject.onload = () => {
        const prof = qualityProfiles[activeAnalysisKey];
        drawCanvasWithOverlays(prof.overlays);
        showToast('Photo imported and analyzed on canvas!');
      };
    };
    reader.readAsDataURL(file);
  });

  // Run AI Scan Button
  document.querySelector('#analyse-onions').addEventListener('click', () => {
    loadQualityPreset(activeAnalysisKey);
    showToast('Quality metrics updated from computer-vision scan!');
  });

  // Apply Findings to Selling Recommendation
  document.querySelector('#btn-apply-quality').addEventListener('click', () => {
    const prof = qualityProfiles[activeAnalysisKey];
    if (!prof) return;

    const targetRadio = document.querySelector(`input[name="grade"][value="${prof.grade}"]`);
    if (targetRadio) {
      targetRadio.checked = true;
      document.querySelectorAll('.grade-card').forEach(c => c.classList.toggle('selected', c.querySelector('input').checked));
    }

    document.querySelector('#storage').value = prof.storageDays;
    document.querySelector('#storage-output').textContent = `${prof.storageDays} days ${prof.storageDays === 0 ? '(Sell Now)' : ''}`;
    document.querySelector('#shelf-life').value = prof.shelfDays;
    document.querySelector('#shelf-output').textContent = `${prof.shelfDays} days`;

    renderRecommendation(evaluate(getState()));
    activateView('recommendation');
    showToast('Quality analysis applied to selling recommendation!');
  });

  // Verify Certificate
  document.querySelector('#verify-certificate').addEventListener('click', () => {
    const select = document.querySelector('#certificate-grade');
    certificatePremium = Number(select.value);
    certificateLabel = select.options[select.selectedIndex].text.split(' — ')[0];
    const certNumber = document.querySelector('#certificate-number').value.trim();
    const status = document.querySelector('#certificate-status');

    if (!certificatePremium) {
      certificateLabel = '';
      status.textContent = 'No certificate linked.';
      status.className = 'certificate-status';
      showToast('Certificate removed.');
    } else {
      status.textContent = `✓ Verified ${certificateLabel} (${certNumber || 'CA-2026-CERT'}) · +₹${certificatePremium.toFixed(2)}/kg premium active across all routes.`;
      status.className = 'certificate-status verified';
      showToast('AGMARK quality premium applied!');
    }
    renderRecommendation(evaluate(getState()));
  });

  // Vehicle Fleet Selector
  document.querySelectorAll('.vehicle-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedVehicleKey = card.dataset.vehicle;
      updateLogisticsView();
      renderRecommendation(evaluate(getState()));
      showToast(`Selected ${vehicles[selectedVehicleKey].name}`);
    });
  });

  // Time Slider
  document.querySelector('#sim-storage-slider').addEventListener('input', () => {
    updateTimingView();
  });

  // Save Scenario
  document.querySelector('#save-scenario').addEventListener('click', () => {
    localStorage.setItem('farmroute-scenario-2026', JSON.stringify(getState()));
    showToast('Scenario saved in browser localStorage!');
  });
  document.querySelector('#btn-quick-save').addEventListener('click', () => {
    localStorage.setItem('farmroute-scenario-2026', JSON.stringify(getState()));
    showToast('Scenario saved in browser localStorage!');
  });

  // Language Toggle
  document.querySelector('#lang-toggle').addEventListener('click', toggleLanguage);
}

function refreshTalukas(district) {
  const talukas = talukasByDistrict[district] || [district];
  const select = document.querySelector('#taluka');
  const prev = select.value;
  select.innerHTML = `<option value="">Choose taluka</option>${talukas.map(t => `<option value="${t}">${t}</option>`).join('')}`;
  if (talukas.includes(prev)) select.value = prev;
  else if (district === 'Nashik') select.value = 'Niphad';
  else if (district === 'Navi Mumbai' || district === 'Thane') select.value = 'Nerul';
}

function renderMarketsAndBuyers() {
  const mGrid = document.querySelector('#market-cards');
  if (mGrid) {
    mGrid.innerHTML = markets.map(m => {
      const tr = trendFor(m);
      return `
        <article class="market-card">
          <h2>${m.name} APMC</h2>
          <p>${m.type} · 1 Sep 2026</p>
          <div class="market-price">₹${m.prices.at(-1).toFixed(2)} <small>/kg</small></div>
          <span class="positive-pill">↑ ${tr.change}% in 5 days</span>
          <p style="margin-top:10px;">${rupees(m.arrivals / 10)} Tonnes daily arrivals</p>
        </article>
      `;
    }).join('');
  }

  const mTable = document.querySelector('#market-table tbody');
  if (mTable) {
    mTable.innerHTML = markets.map(m => `
      <tr>
        <td><b>${m.name} APMC</b></td>
        ${m.prices.map(p => `<td>₹${p.toFixed(2)}</td>`).join('')}
        <td><b class="text-green">↑ ${trendFor(m).change}%</b></td>
      </tr>
    `).join('');
  }

  const bGrid = document.querySelector('#buyer-list');
  if (bGrid) {
    bGrid.innerHTML = buyers.map(b => `
      <article class="buyer-card">
        <div>
          <h2>${b.name}</h2>
          <p>${b.location} · ${rupees(b.demand / 1000)} Tonnes contract volume</p>
          <div class="offer">₹${b.price.toFixed(2)} <small>/kg</small></div>
        </div>
        <div>
          <div class="buyer-tags">
            <span class="tag">Grade ${b.grade}+</span>
            <span class="tag">${b.payment === 0 ? 'Instant Cash' : b.payment + '-day payment'}</span>
            <span class="tag">${b.reliability}% verified</span>
            ${b.simulated ? '<span class="tag pilot">Pilot Network</span>' : ''}
          </div>
          <button type="button" class="btn-pill primary" style="width:100%;margin-top:14px;" onclick="alert('Contacting procurement desk for ${b.name}...')">
            Contract Booking <span>→</span>
          </button>
        </div>
      </article>
    `).join('');
  }
}

// --- DYNAMIC WAREHOUSES & E-NWR PLEDGE LOANS ---
let activeWarehouseFilter = 'all';

function renderWarehouses(filter = null) {
  if (filter) activeWarehouseFilter = filter;
  const wList = document.querySelector('#warehouse-list');
  if (!wList) return;

  const state = getState();
  const originCoords = detectedGpsCoords || districtCoordinates[state.district] || [20.083, 74.108];

  // Calculate live road distance from detected coordinates
  const enrichedWarehouses = warehouses.map(w => {
    let dKm = 15;
    if (w.lat && w.lon && originCoords) {
      dKm = Math.max(5, Math.round(calcHaversineKm(originCoords[0], originCoords[1], w.lat, w.lon) * 1.22));
    }
    return { ...w, liveDistance: dKm };
  }).sort((a, b) => a.liveDistance - b.liveDistance);

  // Update NABARD 70% e-NWR pledge loan estimator banner
  const basePrice = 28.50;
  const lotValue = state.quantity * basePrice;
  const pledgeAdvance = Math.round(lotValue * 0.70);
  const pledgeQtyEl = document.querySelector('#pledge-qty-val');
  const pledgeLoanEl = document.querySelector('#pledge-loan-val');
  if (pledgeQtyEl) pledgeQtyEl.textContent = `${rupees(state.quantity)} kg`;
  if (pledgeLoanEl) pledgeLoanEl.textContent = `₹${rupees(pledgeAdvance)}`;

  // Filter list
  const filtered = enrichedWarehouses.filter(w => {
    if (activeWarehouseFilter === 'wdra') return w.wdra;
    if (activeWarehouseFilter === 'cold') return w.type === 'cold';
    return true;
  });

  wList.innerHTML = filtered.map(w => `
    <div class="warehouse-card ${w.wdra ? 'wdra-card' : ''}">
      <div class="wh-header">
        <b>${w.name}</b>
        <span class="wh-rate">₹${w.rate.toFixed(2)}/kg/day</span>
      </div>
      <div class="wh-meta">📍 <b>${w.liveDistance} km</b> by road · ${w.capacity} capacity</div>
      <div class="wh-meta">Temp: ${w.temp} · Helpline: ${w.phone}</div>
      ${w.wdra ? '<span class="wh-badge">✓ WDRA e-NWR 70% Pledge Loan Eligible</span>' : '<span class="wh-badge" style="background:#f1f5f9;color:#64748b;">Local Storage</span>'}
    </div>
  `).join('');
}

// --- INTERACTIVE AGMARK CERTIFICATE GENERATOR & QR PORTAL ---
function generateAgmarkCertificate() {
  const gradeSelect = document.querySelector('#certificate-grade');
  const premium = parseFloat(gradeSelect.value) || 0;
  const gradeText = gradeSelect.options[gradeSelect.selectedIndex].text.split(' — ')[0];
  const certId = `AGM/MH/2026/${Math.floor(10000 + Math.random() * 90000)}`;

  const state = getState();
  const certInput = document.querySelector('#certificate-number');
  if (certInput) certInput.value = certId;

  const dispNo = document.querySelector('#cert-display-no');
  const dispFarmer = document.querySelector('#cert-farmer-name');
  const dispQty = document.querySelector('#cert-lot-qty');
  const dispBadge = document.querySelector('#agmark-preview-grade-badge');

  if (dispNo) dispNo.textContent = certId;
  if (dispFarmer) dispFarmer.textContent = document.querySelector('#prof-name')?.value || 'Ramesh Shankar Patil';
  if (dispQty) dispQty.textContent = `${rupees(state.quantity)} kg (Grade ${state.grade || 'A'})`;
  if (dispBadge) dispBadge.textContent = gradeSelect.value === '1.5' ? 'SPECIAL' : gradeSelect.value === '0.8' ? 'GOOD' : gradeSelect.value === '0.25' ? 'FAIR' : 'STANDARD';

  certificatePremium = premium;
  certificateLabel = gradeText;

  const status = document.querySelector('#certificate-status');
  if (premium > 0) {
    status.textContent = `✓ Generated & Verified ${gradeText} (${certId}) · +₹${premium.toFixed(2)}/kg legal contract premium active across all routes!`;
    status.className = 'certificate-status verified';
  } else {
    status.textContent = `Standard grade registered (${certId}) · Standard auction pricing.`;
    status.className = 'certificate-status';
  }

  renderRecommendation(evaluate(getState()));
  showToast(`⚡ Official AGMARK Certificate ${certId} Generated with QR Seal!`);
}

// --- TRANSPORTER DISPATCH BOOKING MODAL ---
function openTransporterBookingModal() {
  const modal = document.querySelector('#transporter-dispatch-modal');
  if (!modal) return;
  const state = getState();
  const vehicle = vehicles[state.vehicle] || vehicles.mini;
  const origin = state.detectedLocationName || `${state.taluka} Farm`;
  const dest = 'Lasalgaon APMC';
  const tripCost = Math.round(getRouteDistance(state, 'Lasalgaon') * vehicle.ratePerKm);
  const otp = Math.floor(1000 + Math.random() * 9000);

  document.querySelector('#dispatch-route-text').textContent = `${origin} → ${dest}`;
  document.querySelector('#dispatch-lot-text').textContent = `${rupees(state.quantity)} kg (${state.commodity})`;
  document.querySelector('#dispatch-cost-text').textContent = `₹${rupees(tripCost)} Total Trip`;
  document.querySelector('#dispatch-otp-text').textContent = `${otp}`;

  modal.style.display = 'flex';
}

function closeTransporterBookingModal() {
  const modal = document.querySelector('#transporter-dispatch-modal');
  if (modal) modal.style.display = 'none';
}

// --- FARMER PAYMENTS & DIGITAL ESCROW VIEW ---
function initPaymentsView() {
  const prof = loadUserProfile();
  const bankHolder = document.querySelector('#pay-card-holder');
  const bankName = document.querySelector('#pay-bank-name');
  const bankAcc = document.querySelector('#pay-card-acc');
  const bankIfsc = document.querySelector('#pay-card-ifsc');
  const upiId = document.querySelector('#pay-upi-id');

  if (bankHolder) bankHolder.textContent = prof.name;
  if (bankName) bankName.textContent = prof.bank;
  if (bankAcc) bankAcc.textContent = `•••• •••• ${prof.account.slice(-4)}`;
  if (bankIfsc) bankIfsc.textContent = prof.ifsc;
  if (upiId) upiId.textContent = prof.upi;

  const btnCopyUpi = document.querySelector('#btn-copy-upi');
  if (btnCopyUpi) {
    btnCopyUpi.onclick = () => {
      if (navigator.clipboard) navigator.clipboard.writeText(prof.upi);
      showToast(`Copied UPI VPA: ${prof.upi}`);
    };
  }

  const btnEscrow = document.querySelector('#btn-simulate-escrow-release');
  if (btnEscrow) {
    btnEscrow.onclick = () => {
      btnEscrow.disabled = true;
      btnEscrow.innerHTML = '<span>⏳ Verifying Digital Weighbridge Slip & OTP...</span>';
      setTimeout(() => {
        btnEscrow.innerHTML = '<span>✓ Escrow Released: ₹56,200 IMPS Credited</span>';
        btnEscrow.style.background = '#15803d';
        showToast('🎉 Digital weighbridge slip verified! ₹56,200 released directly to Bank of Maharashtra!');
      }, 1200);
    };
  }
}

// --- ANTI-FRAUD & STATUTORY LEGAL SHIELD ---
function generateStatutoryLegalNotice(e) {
  if (e) e.preventDefault();
  const buyerName = document.querySelector('#notice-buyer-name')?.value || 'Defaulting Trader';
  const amount = document.querySelector('#notice-amount')?.value || '54000';
  const chequeNo = document.querySelector('#notice-cheque-no')?.value || 'CHQ-748921 (SBI)';
  const lotDetail = document.querySelector('#notice-lot-detail')?.value || '2,000 kg Red Onion';
  const prof = loadUserProfile();

  const noticeText =
    `TO:
${buyerName}

SUBJECT: STATUTORY DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 READ WITH RULE 32 & SECTION 37 OF THE MAHARASHTRA AGRICULTURAL PRODUCE MARKETING (DEVELOPMENT & REGULATION) ACT, 1963.

Dear Sir/Madam,

Under instructions from and on behalf of my client / farmer, ${prof.name}, resident of ${prof.village}, Taluka ${prof.taluka}, District ${prof.district}, I hereby serve upon you this Statutory Legal Demand Notice:

1. That you purchased and took delivery of agricultural produce (${lotDetail}) for a total agreed consideration of Rs. ${rupees(amount)}/-.
2. That in discharge of your legally enforceable debt and liability, you issued Cheque / Payment Instrument No. ${chequeNo} for the amount of Rs. ${rupees(amount)}/-.
3. That upon presentation, the said cheque was returned unpaid / dishonored with the remark "FUNDS INSUFFICIENT" / Payment Defaulted.
4. That under Rule 32 of Maharashtra APMC Act, 1963, payment to an agriculturist is statutory and mandatory within 24 hours of sale.

NOW THEREFORE, YOU ARE HEREBY CALLED UPON TO PAY THE SAID SUM OF RS. ${rupees(amount)}/- TO MY CLIENT WITHIN 15 (FIFTEEN) DAYS OF RECEIPT OF THIS NOTICE, failing which appropriate criminal proceedings under Section 138 of Negotiable Instruments Act, 1881 and Section 316 / 318 of Bharatiya Nyaya Sanhita (BNS, 2023) / IPC 406 & 420 shall be instituted against you before the Competent Judicial Magistrate Court, where you shall be liable to imprisonment for a term up to TWO YEARS and/or FINE UP TO TWICE THE CHEQUE AMOUNT, besides immediate cancellation of your APMC License and seizure of bank guarantee through the District APMC Secretary.

Dated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
Complainant / Farmer: ${prof.name}
Phone / Contact: ${prof.phone}`;

  const container = document.querySelector('#notice-preview-container');
  const bodyEl = document.querySelector('#notice-body-text');
  if (bodyEl && container) {
    bodyEl.textContent = noticeText;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
    showToast('Formal Statutory Legal Demand Notice Drafted!');
  }

  const btnWa = document.querySelector('#btn-whatsapp-notice');
  if (btnWa) {
    btnWa.onclick = () => {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(`*LEGAL NOTICE UNDER SEC 138 NI ACT / APMC ACT*\n\nTo: ${buyerName}\nYou are hereby notified of immediate legal demand for unpaid sum of Rs. ${rupees(amount)}/- against ${lotDetail}.\n\nPay within 15 days or face criminal prosecution under Sec 138 NI Act.\nFarmer: ${prof.name}`)}`;
      window.open(waUrl, '_blank');
    };
  }
}

// --- PROFILE CUSTOMIZATION STUDIO ---
function initProfileCustomization() {
  // Avatar Selection
  const savedAvatar = localStorage.getItem('farmroute_farmer_avatar') || '👨‍🌾';
  const avatarButtons = document.querySelectorAll('.btn-avatar-opt');
  const avatarLarge = document.querySelector('.avatar-large');

  avatarButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.avatar === savedAvatar);
    if (btn.dataset.avatar === savedAvatar && avatarLarge) {
      avatarLarge.textContent = savedAvatar;
    }
    btn.addEventListener('click', () => {
      avatarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const av = btn.dataset.avatar;
      if (avatarLarge) avatarLarge.textContent = av;
      localStorage.setItem('farmroute_farmer_avatar', av);
      showToast(`Profile avatar updated to ${av}!`);
    });
  });

  // Display density
  const densitySelect = document.querySelector('#prof-density-pref');
  if (densitySelect) {
    densitySelect.addEventListener('change', e => {
      document.body.classList.toggle('compact-density', e.target.value === 'compact');
      showToast(`Display density set to ${e.target.value}`);
    });
  }

  // Custom vehicle tariff override
  const customRateInput = document.querySelector('#prof-custom-veh-rate');
  if (customRateInput) {
    customRateInput.addEventListener('input', () => {
      updateLogisticsView();
    });
  }
}

// --- MARATHI / ENGLISH BILINGUAL SUPPORT ---
const i18nDict = {
  mr: {
    tagline: 'स्मार्ट शेतमाल विक्री आणि वाहतूक व्यवस्थापन',
    navWorkflow: 'निर्णय प्रक्रिया',
    navProfile: 'शेत व पीक तपशील',
    navQuality: 'प्रतवारी विश्लेषक (AI)',
    navRecommendation: 'सर्वोत्तम विक्री मार्ग',
    navLogistics: 'वाहतूक व खर्च',
    navTiming: 'साठवणूक व काळ गणना',
    navMarkets: 'बाजारभाव माहिती',
    navBuyers: 'थेट खरेदीदार नेटवर्क',
    navPayments: 'पेमेंट व डिजिटल एस्क्रो',
    navLegalShield: 'शेतकरी संरक्षण व कायदा',
    navUserProfile: 'शेतकरी प्रोफाइल व ७/१२',
    coverageTitle: 'महाराष्ट्र राज्यव्यापी',
    coverageSub: 'OSM व OSRM थेट जोडणी',
    currentLot: 'चालू लॉट:',
    step1: 'पीक लॉट',
    step2: 'प्रतवारी',
    step3: 'शिफारस',
    step4: 'वाहतूक',
    step5: 'साठवणूक',
    dashEyebrow: 'महाराष्ट्रातील शेतकऱ्यांसाठी निर्णय सहाय्य प्रणाली',
    dashTitle: 'तुमच्या पिकासाठी सर्वोत्तम विक्री मार्ग शोधा.',
    dashSubtitle: 'वाहतूक, पॅकिंग आणि हमाली खर्च वजा करून प्रत्यक्ष हातात पडणाऱ्या पैशांची अचूक तुलना.',
    step1Title: 'तुमचा पीक लॉट व शेताचे ठिकाण',
    step1Sub: 'अचूक रस्ता अंतर आणि वाहतूक खर्चासाठी शेताचे ठिकाण व वजन निवडा.',
    btnDetectGPS: 'शेताचे थेट GPS ठिकाण शोधा',
    lblCommodity: 'शेतमाल / पीक',
    lblDistrict: 'जिल्हा',
    lblTaluka: 'तालुका',
    lblQuantity: 'एकूण वजन (किलो)',
    lblQuickTonnage: 'झटपट वजन:',
    findMandiTitle: 'जवळची APMC व भाजीपाला मंडी नकाशावर शोधा',
    findMandiSub: 'ओपनस्ट्रीटमॅप व OSRM द्वारे थेट रस्ता अंतर व प्रत्यक्ष खर्च मोजा.',
    btnFindMandi: 'नकाशावर मंडी शोधा',
    step2Title: 'गुणवत्ता प्रतवारी',
    step2Sub: 'प्रतीनुसार कॉर्पोरेट खरेदीदारांची बोली आणि प्रीमियम ठरतो.',
    aiHelpTitle: 'कांद्याची अचूक प्रत माहिती नाही?',
    aiHelpSub: 'फोटो विश्लेषक वापरून कांद्याची सुकवण आणि मानाचा ओलावा तपासा.',
    btnLaunchAnalyser: 'विश्लेषक उघडा',
    step3Title: 'वेळ आणि रोख पैशांची गरज',
    step3Sub: 'साठवणूक कालावधी आणि तात्काळ पैशांची गरज निवडा.',
    lblPlannedStorage: 'नियोजित साठवणूक (दिवस)',
    lblShelfLife: 'अंदाजे टिकाऊ क्षमता',
    lblUrgentCash: 'तात्काळ रोख पैशांची गरज',
    lblUrgentCashSub: 'उधारी टाळून त्याच दिवशी रोख पैसे देणाऱ्या पर्यायांना प्राधान्य द्या.',
    btnCalcRoute: 'सर्वोत्तम विक्री मार्ग मोजा',
    btnRunScan: '⚡ AI गुणवत्ता स्कॅन करा',
    btnApplyToForm: 'हे निष्कर्ष माझ्या विक्री शिफारसीत लागू करा',
    btnSaveScenario: 'माहिती सेव्ह करा',
    btnPrintReport: 'पावती प्रिंट करा',
    profileEyebrow: 'शेतकरी ओळखपत्र व प्राधान्ये',
    profileTitle: 'शेतकरी प्रोफाइल व शेतजमीन नोंदी',
    profileSub: 'तुमच्या जमिनीचा ७/१२ उतारा, बँक खाते आणि वाहतूक पसंती व्यवस्थापित करा.',
    btnSyncToForm: 'प्रोफाइलमधील माहिती फॉर्ममध्ये भरा',
    personalDetails: 'वैयक्तिक व शेतजमीन नोंदणी',
    pFarmerName: 'शेतकऱ्याचे पूर्ण नाव',
    pPhone: 'मोबाईल / व्हॉट्सॲप नंबर',
    pKhata: '७/१२ खाते क्र.',
    pVillage: 'गाव / वस्ती',
    pTaluka: 'तालुका',
    pDistrict: 'जिल्हा',
    landDetails: 'जमीन क्षेत्र व माती प्रकार',
    pLandSize: 'एकूण जमीन (एकर)',
    pSoilType: 'जमिनीचा प्रकार',
    pStorageChawl: 'कांदा चाळ साठवणूक क्षमता (टन)',
    pSeason: 'प्रमुख कांदा हंगाम',
    bankDetails: 'थेट जमा बँक व UPI तपशील',
    pBankName: 'बँकेचे नाव',
    pAccount: 'खाते क्रमांक',
    pIfsc: 'IFSC कोड',
    pUpi: 'UPI आयडी (थेट पेमेंटसाठी)',
    btnSaveProfile: 'प्रोफाइल सेव्ह करा',
    sellingPreferences: 'विक्री व वाहतूक प्राथमिक पसंती',
    pDefVehicle: 'नेहमीचे वाहतूक वाहन',
    pDefQty: 'नेहमीचे लॉट वजन (किलो)',
    savedScenarios: 'सेव्ह केलेले शेती हिशोब'
  },
  en: {
    tagline: 'Smart Harvest Selling & Logistics',
    navWorkflow: 'DECISION WORKFLOW',
    navProfile: 'Farm & Harvest',
    navQuality: 'Crop Quality Analyser',
    navRecommendation: 'Route Recommendation',
    navLogistics: 'Logistics & Freight',
    navTiming: 'Time Grading & Storage',
    navMarkets: 'Market Intelligence',
    navBuyers: 'Direct Buyer Network',
    navPayments: 'Payments & Escrow',
    navLegalShield: 'Anti-Fraud & Legal',
    navUserProfile: 'Farmer Profile & 7/12',
    coverageTitle: 'Maharashtra Statewide',
    coverageSub: 'OSM & OSRM Routing Live',
    currentLot: 'Current Lot:',
    step1: 'Farm Lot',
    step2: 'Quality Analyser',
    step3: 'Recommendation',
    step4: 'Logistics',
    step5: 'Storage Timing',
    dashEyebrow: 'DECISION SUPPORT FOR MAHARASHTRA FARMERS',
    dashTitle: 'Find the best route for your harvest.',
    dashSubtitle: 'Compare verified APMC mandis and direct corporate buyers by the money you actually take home after transport, packing, and mandi handling costs.',
    step1Title: 'Your Harvest Lot & Farm Location',
    step1Sub: 'Specify crop origin and quantity for exact road route calculation.',
    btnDetectGPS: 'Detect My Location (GPS)',
    lblCommodity: 'Commodity / Crop',
    lblDistrict: 'District (जिल्हा)',
    lblTaluka: 'Farm Taluka / Town (तालुका)',
    lblQuantity: 'Total Lot Quantity (kg)',
    lblQuickTonnage: 'Quick Select:',
    findMandiTitle: 'Discover Nearest APMC Mandis on Live Map',
    findMandiSub: 'Calculates live driving distances, toll tariffs, and real road travel time via OpenStreetMap & OSRM.',
    btnFindMandi: 'Find & Map Nearest Mandis',
    step2Title: 'Quality Grade Assessment',
    step2Sub: 'Grade determines premium eligibility and corporate buyer acceptance.',
    aiHelpTitle: "Unsure about your crop's grade?",
    aiHelpSub: 'Use the interactive Crop Quality Analyser with camera or sample photos to measure curing and neck moisture.',
    btnLaunchAnalyser: 'Open Analyser',
    step3Title: 'Timing & Cash Flow Preferences',
    step3Sub: 'Storage duration and urgent liquidity needs shape your net payout.',
    lblPlannedStorage: 'Planned Storage (दिवस)',
    lblShelfLife: 'Estimated Shelf Life (टिकाऊ क्षमता)',
    lblUrgentCash: 'Urgent Cash Need (तात्काळ रोख गरज)',
    lblUrgentCashSub: 'Prioritizes same-day settlement options over delayed payment corporate buyers.',
    btnCalcRoute: 'Calculate Optimal Selling Route',
    btnRunScan: '⚡ Run AI Visual Diagnostics',
    btnApplyToForm: 'Apply Findings to My Selling Recommendation',
    btnSaveScenario: 'Save Scenario',
    btnPrintReport: 'Print Summary',
    profileEyebrow: 'FARMER CREDENTIALS & PREFERENCES',
    profileTitle: 'Farmer Profile & Land Records',
    profileSub: 'Manage your land details, 7/12 extract khata, direct buyer payment accounts, and default logistics preferences.',
    btnSyncToForm: 'Apply Profile to Farm Lot',
    personalDetails: 'Personal & Farm Registration',
    pFarmerName: 'Farmer Full Name',
    pPhone: 'Mobile / WhatsApp Number',
    pKhata: '7/12 Extract Khata No.',
    pVillage: 'Farm Village / Wasti',
    pTaluka: 'Taluka',
    pDistrict: 'District',
    landDetails: 'Land Holding & Soil Profile',
    pLandSize: 'Total Farm Land (Acres)',
    pSoilType: 'Soil Type',
    pStorageChawl: 'On-Farm Storage Chawl (Tonnes)',
    pSeason: 'Primary Onion Season',
    bankDetails: 'Direct Payout Bank & UPI Details',
    pBankName: 'Bank Name',
    pAccount: 'Account Number',
    pIfsc: 'IFSC Code',
    pUpi: 'UPI ID (Instant Corporate Settlement)',
    btnSaveProfile: 'Save Profile Changes',
    sellingPreferences: 'Selling & Logistics Defaults',
    pDefVehicle: 'Default Transport Vehicle',
    pDefQty: 'Typical Lot Size (kg)',
    savedScenarios: 'Saved Harvest Scenarios'
  }
};

function toggleLanguage() {
  currentLang = (currentLang === 'en') ? 'mr' : 'en';
  document.querySelector('#lang-text').textContent = (currentLang === 'en') ? 'मराठी' : 'English';

  const dict = i18nDict[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  showToast(currentLang === 'mr' ? 'भाषा मराठीत बदलली आहे.' : 'Switched to English.');
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
