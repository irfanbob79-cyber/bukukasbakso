import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  CheckCircle,
  History,
  ChevronRight
} from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import IndonesianDatePicker from '../components/IndonesianDatePicker';
import { 
  formatRupiah, 
  getTodayDateString, 
  generateUUID 
} from '../utils/formatters';

const PRESET_MARKET_ITEMS = [
  'Sawi & Toge segar',
  'Bihun & Mie kuning',
  'Saos & Kecap manis',
  'Bumbu dapur & seledri',
  'Jeruk nipis & cabe rawit',
  'Bawang goreng'
];

const PRESET_ICE_ITEMS = [
  'Es balok (2 balok)',
  'Es batu kristal (2 kantong)',
  'Gula pasir (2 kg)',
  'Gula pasir (3 kg)',
  'Teh celup / tubruk (1 pak)',
  'Cup plastik es + tutup (1 bal)',
  'Sedotan es higienis (1 pak)',
  'Sirup / Jeruk peras es'
];

const PRESET_OPERATIONAL_ITEMS = [
  'Gas Elpiji 3kg (1 tabung)',
  'Gas Elpiji 3kg (2 tabung)',
  'Plastik kuah tebal 1kg',
  'Kantong kresek putih',
  'Kertas bungkus coklat',
  'Sabun cuci piring & spon',
  'Bensin motor belanja'
];

export default function ExpensesView({ onSaveExpenses, setActiveTab }) {
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState('MARKET'); // 'MARKET' | 'ICE' | 'OPERATIONAL'
  
  // Multi-item rows for quick batch input
  const [items, setItems] = useState([
    { id: generateUUID(), name: '', amount: 0 }
  ]);

  const [successNotice, setSuccessNotice] = useState('');

  const handleAddItemRow = (presetName = '') => {
    setItems((prev) => [
      ...prev,
      { id: generateUUID(), name: presetName, amount: 0 }
    ]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItemRow = (id) => {
    if (items.length === 1) {
      setItems([{ id: generateUUID(), name: '', amount: 0 }]);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAddPreset = (presetName) => {
    const lastItem = items[items.length - 1];
    if (lastItem && !lastItem.name.trim() && lastItem.amount === 0) {
      handleUpdateItem(lastItem.id, 'name', presetName);
    } else {
      handleAddItemRow(presetName);
    }
  };

  const calculateTotalBatch = () => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validItems = items.filter(
      (item) => item.name.trim() !== '' && Number(item.amount) > 0
    );

    if (validItems.length === 0) {
      alert('Mohon isi minimal 1 barang belanja beserta nominalnya!');
      return;
    }

    const newExpenses = validItems.map((item) => ({
      id: generateUUID(),
      date,
      category,
      item_name: item.name.trim(),
      amount: Number(item.amount),
      created_at: new Date().toISOString()
    }));

    onSaveExpenses(newExpenses);

    setItems([{ id: generateUUID(), name: '', amount: 0 }]);
    setSuccessNotice(`Tercatat ${newExpenses.length} belanjaan baru!`);
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  const getPresetsForCategory = () => {
    if (category === 'MARKET') return PRESET_MARKET_ITEMS;
    if (category === 'ICE') return PRESET_ICE_ITEMS;
    return PRESET_OPERATIONAL_ITEMS;
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">Catatan Belanja</h2>
            <p className="text-[11px] text-slate-500 font-medium">Pasar harian, bahan es, & operasional warung</p>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Input Form with Multi-Row Entry */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
        {/* Date (Format Indonesia: Day-Month-Year) */}
        <div>
          <IndonesianDatePicker
            id="expense-date"
            label="Tanggal Belanja (Hari-Bulan-Tahun)"
            value={date}
            onChange={setDate}
            accentColor="rose"
          />
        </div>

        {/* Category Switcher (3 Pilihan: Pasar, Es, Operasional) */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
            Kategori Belanja
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-center">
            <button
              type="button"
              onClick={() => setCategory('MARKET')}
              className={`min-h-[42px] py-1 text-xs font-black rounded-lg transition-all ${
                category === 'MARKET'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              🥬 Pasar
            </button>
            <button
              type="button"
              onClick={() => setCategory('ICE')}
              className={`min-h-[42px] py-1 text-xs font-black rounded-lg transition-all ${
                category === 'ICE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              🧊 Bahan Es
            </button>
            <button
              type="button"
              onClick={() => setCategory('OPERATIONAL')}
              className={`min-h-[42px] py-1 text-xs font-black rounded-lg transition-all ${
                category === 'OPERATIONAL'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              🔥 Gas/Lain
            </button>
          </div>
        </div>

        {/* Quick Presets Chips for Mobile Single Thumb */}
        <div>
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pilihan Cepat {category === 'MARKET' ? 'Pasar' : category === 'ICE' ? 'Bahan Es' : 'Operasional'}:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {getPresetsForCategory().map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 active:scale-90 shrink-0 transition-transform"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Item Mobile Cards */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Daftar Barang Belanja ({items.length})
            </span>
            <button
              type="button"
              onClick={() => handleAddItemRow()}
              className="text-xs font-black text-emerald-700 active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500">
                    Barang #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 active:scale-90 transition-transform"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                  placeholder={
                    category === 'ICE'
                      ? "Nama bahan es (misal: Es balok 2 balok / Gula 2kg)"
                      : "Nama barang (contoh: Sawi 3 ikat)"
                  }
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-rose-600 outline-none"
                />

                <CurrencyInput
                  value={item.amount}
                  onChange={(newAmt) => handleUpdateItem(item.id, 'amount', newAmt)}
                  placeholder="0"
                  size="normal"
                  showQuickChips={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Total Batch Calculation Box */}
        <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
          <span className="text-xs font-extrabold text-rose-900">Total Belanja:</span>
          <span className="text-xl font-black text-rose-800">{formatRupiah(calculateTotalBatch())}</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full min-h-[48px] py-3 px-4 bg-rose-700 active:bg-rose-800 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-700/20 active:scale-98 transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Simpan Belanja ({formatRupiah(calculateTotalBatch())})</span>
        </button>
      </form>

      {/* Shortcut ke Menu Riwayat Lengkap */}
      <div 
        onClick={() => setActiveTab('history')}
        className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <History className="w-4 h-4 text-rose-700" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800">Lihat Riwayat & Pencarian Tanggal</h4>
            <p className="text-[10px] text-slate-500 font-medium">Buka menu riwayat untuk melihat semua catatan belanja lampau</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}
