import { generateUUID, getTodayDateString } from '../utils/formatters';

const STORAGE_KEYS = {
  SALES: 'bakso_sales_v2',
  EXPENSES: 'bakso_expenses_v2',
  BATCHES: 'bakso_batches_v2',
  SETTINGS: 'bakso_settings_v2',
};

// Automatically purge legacy v1 test demo data from browser localStorage
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('bakso_sales_v1');
    localStorage.removeItem('bakso_expenses_v1');
    localStorage.removeItem('bakso_batches_v1');
    localStorage.removeItem('bakso_settings_v1');
  }
} catch (e) {}

// Safe LocalStorage helpers
export const getStoredData = (key, fallback = []) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : fallback;
    }
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
};

export const saveStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

// Automatic Server Cloud Sync (Cross-Device)
export const fetchServerData = async () => {
  try {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (e) {
    // Offline or server API not yet enabled on Nginx
    return null;
  }
};

export const syncAllToServer = async ({ sales, expenses, batches }) => {
  try {
    const payload = {
      sales: Array.isArray(sales) ? sales : getStoredData(STORAGE_KEYS.SALES, []),
      expenses: Array.isArray(expenses) ? expenses : getStoredData(STORAGE_KEYS.EXPENSES, []),
      batches: Array.isArray(batches) ? batches : getStoredData(STORAGE_KEYS.BATCHES, []),
      last_updated: new Date().toISOString()
    };

    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return { success: true };
    }
    return { success: false };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// Sample realistic dummy data for previewing the app
export const generateDemoData = () => {
  const today = new Date();
  
  const formatDateOffset = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const sampleBatches = [
    {
      id: generateUUID(),
      batch_number: 1,
      grind_date: formatDateOffset(6),
      estimated_days: 3,
      items: [
        { name: "Daging Sapi Segar", qty: "4 kg", cost: 420000 },
        { name: "Tetelan Sapi", qty: "1 kg", cost: 100000 },
        { name: "Tepung Premix & Bumbu", qty: "1 paket", cost: 95000 },
        { name: "Ongkos Giling di Pasar", qty: "1 sesi", cost: 35000 },
        { name: "Bensin & Es Balok Giling", qty: "", cost: 15000 },
      ],
      meat_cost: 520000,
      seasoning_flour_cost: 95000,
      grinding_fee: 35000,
      other_cost: 15000,
      total_dough_cost: 665000,
      notes: "Daging sapi segar 4kg + tetelan 1kg (Laris)",
      is_completed: true,
      created_at: new Date(Date.now() - 6 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      batch_number: 2,
      grind_date: formatDateOffset(3),
      estimated_days: 3,
      items: [
        { name: "Daging Sapi Campur Urat", qty: "3.5 kg", cost: 380000 },
        { name: "Tetelan Sapi Gurih", qty: "1 kg", cost: 100000 },
        { name: "Bumbu Racik & Tepung", qty: "1 paket", cost: 85000 },
        { name: "Ongkos Giling di Pasar", qty: "1 sesi", cost: 35000 },
        { name: "Plastik Adonan", qty: "", cost: 10000 },
      ],
      meat_cost: 480000,
      seasoning_flour_cost: 85000,
      grinding_fee: 35000,
      other_cost: 10000,
      total_dough_cost: 610000,
      notes: "Campur urat + tetelan gurih",
      is_completed: true,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      batch_number: 3,
      grind_date: formatDateOffset(1),
      estimated_days: 3,
      items: [
        { name: "Daging Sapi Paha", qty: "4 kg", cost: 450000 },
        { name: "Daging Ayam Fillet", qty: "1 kg", cost: 100000 },
        { name: "Tepung Aren & Bumbu", qty: "1 paket", cost: 90000 },
        { name: "Ongkos Giling di Pasar", qty: "1 sesi", cost: 40000 },
        { name: "Biaya Bensin", qty: "", cost: 20000 },
      ],
      meat_cost: 550000,
      seasoning_flour_cost: 90000,
      grinding_fee: 40000,
      other_cost: 20000,
      total_dough_cost: 700000,
      notes: "Persiapan stok akhir pekan",
      is_completed: false,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  const sampleSales = [
    { 
      id: generateUUID(), 
      date: formatDateOffset(6), 
      bakso_income: 760000,
      ice_cups_sold: 30,
      ice_price_per_cup: 4000,
      ice_income: 120000,
      total_cash_income: 880000, 
      notes: "Hari biasa, sore gerimis", 
      created_at: new Date().toISOString() 
    },
    { 
      id: generateUUID(), 
      date: formatDateOffset(5), 
      bakso_income: 780000,
      ice_cups_sold: 35,
      ice_price_per_cup: 4000,
      ice_income: 140000,
      total_cash_income: 920000, 
      notes: "Ramai pas makan siang", 
      created_at: new Date().toISOString() 
    },
    { 
      id: generateUUID(), 
      date: formatDateOffset(4), 
      bakso_income: 940000,
      ice_cups_sold: 40,
      ice_price_per_cup: 4000,
      ice_income: 160000,
      total_cash_income: 1100000, 
      notes: "Laris manis, bakso urat & es teh habis duluan", 
      created_at: new Date().toISOString() 
    },
    { 
      id: generateUUID(), 
      date: formatDateOffset(3), 
      bakso_income: 730000,
      ice_cups_sold: 30,
      ice_price_per_cup: 4000,
      ice_income: 120000,
      total_cash_income: 850000, 
      notes: "Normal", 
      created_at: new Date().toISOString() 
    },
    { 
      id: generateUUID(), 
      date: formatDateOffset(2), 
      bakso_income: 1030000,
      ice_cups_sold: 55,
      ice_price_per_cup: 4000,
      ice_income: 220000,
      total_cash_income: 1250000, 
      notes: "Malam minggu sangat ramai, es laku keras", 
      created_at: new Date().toISOString() 
    },
    { 
      id: generateUUID(), 
      date: formatDateOffset(1), 
      bakso_income: 1140000,
      ice_cups_sold: 60,
      ice_price_per_cup: 4000,
      ice_income: 240000,
      total_cash_income: 1380000, 
      notes: "Hari Minggu, rekor omzet bakso dan 60 cup es", 
      created_at: new Date().toISOString() 
    },
    { 
      id: generateUUID(), 
      date: formatDateOffset(0), 
      bakso_income: 780000,
      ice_cups_sold: 40,
      ice_price_per_cup: 4000,
      ice_income: 160000,
      total_cash_income: 940000, 
      notes: "Tutup warung sore hari", 
      created_at: new Date().toISOString() 
    },
  ];

  const sampleExpenses = [
    // 6 days ago
    { id: generateUUID(), date: formatDateOffset(6), category: 'MARKET', item_name: 'Sawi manis, toge segar, seledri', amount: 45000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(6), category: 'ICE', item_name: 'Es balok 2 balok & gula pasir 2 kg', amount: 48000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(6), category: 'OPERATIONAL', item_name: 'Isi ulang Gas Elpiji 3kg (2 tabung)', amount: 44000, created_at: new Date().toISOString() },
    
    // 5 days ago
    { id: generateUUID(), date: formatDateOffset(5), category: 'MARKET', item_name: 'Sawi, toge, jeruk nipis', amount: 50000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(5), category: 'ICE', item_name: 'Es balok 2 balok & teh celup poci', amount: 38000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(5), category: 'OPERATIONAL', item_name: 'Plastik kuah tebal 1kg & kresek putih', amount: 35000, created_at: new Date().toISOString() },

    // 4 days ago
    { id: generateUUID(), date: formatDateOffset(4), category: 'MARKET', item_name: 'Sayuran sawi & toge', amount: 45000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(4), category: 'MARKET', item_name: 'Bihun jagung & mie kuning (1 bal)', amount: 80000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(4), category: 'ICE', item_name: 'Cup plastik es 1 bal (50 cup) & sedotan', amount: 25000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(4), category: 'ICE', item_name: 'Es batu kristal 2 kantong', amount: 20000, created_at: new Date().toISOString() },
    
    // 3 days ago
    { id: generateUUID(), date: formatDateOffset(3), category: 'MARKET', item_name: 'Sawi, toge, daun bawang', amount: 40000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(3), category: 'ICE', item_name: 'Es batu kristal & balok', amount: 35000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(3), category: 'OPERATIONAL', item_name: 'Sabun cuci Sunlight & spon busa', amount: 22000, created_at: new Date().toISOString() },

    // 2 days ago
    { id: generateUUID(), date: formatDateOffset(2), category: 'MARKET', item_name: 'Sawi 3 ikat, toge 2 kg', amount: 55000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(2), category: 'ICE', item_name: 'Es balok 3 balok & gula pasir 3 kg', amount: 72000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(2), category: 'OPERATIONAL', item_name: 'Gas LPG 3kg', amount: 22000, created_at: new Date().toISOString() },
    
    // 1 day ago
    { id: generateUUID(), date: formatDateOffset(1), category: 'MARKET', item_name: 'Sayur sawi, toge, seledri porsi banyak', amount: 70000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(1), category: 'ICE', item_name: 'Es balok 3 balok & Cup plastik 100 pcs', amount: 75000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(1), category: 'OPERATIONAL', item_name: 'Sedotan + Kertas nasi bungkus coklat', amount: 28000, created_at: new Date().toISOString() },

    // Today
    { id: generateUUID(), date: formatDateOffset(0), category: 'MARKET', item_name: 'Sawi hijau & toge segar pasar', amount: 45000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(0), category: 'ICE', item_name: 'Es balok 2 balok untuk es teh manis', amount: 30000, created_at: new Date().toISOString() },
    { id: generateUUID(), date: formatDateOffset(0), category: 'OPERATIONAL', item_name: 'Gas Elpiji 3kg (1 tabung cadangan)', amount: 22000, created_at: new Date().toISOString() },
  ];

  const sampleSettings = {
    storeName: "Bakso Josjis",
    ownerName: "Cak Mat",
    initialBalance: 0
  };

  saveStoredData(STORAGE_KEYS.SALES, sampleSales);
  saveStoredData(STORAGE_KEYS.EXPENSES, sampleExpenses);
  saveStoredData(STORAGE_KEYS.BATCHES, sampleBatches);
  saveStoredData(STORAGE_KEYS.SETTINGS, sampleSettings);

  return { sampleSales, sampleExpenses, sampleBatches, sampleSettings };
};

// Export all data to JSON string for backup
export const exportDataAsJSON = () => {
  const data = {
    exportedAt: new Date().toISOString(),
    sales: getStoredData(STORAGE_KEYS.SALES, []),
    expenses: getStoredData(STORAGE_KEYS.EXPENSES, []),
    batches: getStoredData(STORAGE_KEYS.BATCHES, []),
    settings: getStoredData(STORAGE_KEYS.SETTINGS, { storeName: 'Bakso Josjis' })
  };
  return JSON.stringify(data, null, 2);
};

// Import backup data
export const importDataFromJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.sales && Array.isArray(data.sales)) {
      saveStoredData(STORAGE_KEYS.SALES, data.sales);
    }
    if (data.expenses && Array.isArray(data.expenses)) {
      saveStoredData(STORAGE_KEYS.EXPENSES, data.expenses);
    }
    if (data.batches && Array.isArray(data.batches)) {
      saveStoredData(STORAGE_KEYS.BATCHES, data.batches);
    }
    if (data.settings) {
      saveStoredData(STORAGE_KEYS.SETTINGS, data.settings);
    }
    return { success: true };
  } catch (err) {
    console.error('Import failed', err);
    return { success: false, error: err.message };
  }
};

// Clear all data
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.SALES);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.BATCHES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem('bakso_sales_v1');
  localStorage.removeItem('bakso_expenses_v1');
  localStorage.removeItem('bakso_batches_v1');
  localStorage.removeItem('bakso_settings_v1');
};

export { STORAGE_KEYS };
