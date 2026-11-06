import React, { useState } from 'react';
import { 
  X, 
  Save, 
  ShoppingCart, 
  Sparkles, 
  Tag 
} from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import IndonesianDatePicker from './IndonesianDatePicker';
import { formatRupiah } from '../utils/formatters';

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

export default function EditExpenseModal({ isOpen, expense, onClose, onSave }) {
  if (!isOpen || !expense) return null;

  const [date, setDate] = useState(expense.date || '');
  const [category, setCategory] = useState(expense.category || 'MARKET');
  const [itemName, setItemName] = useState(expense.item_name || '');
  const [amount, setAmount] = useState(expense.amount || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert('Nama barang belanja tidak boleh kosong!');
      return;
    }
    if (Number(amount) <= 0) {
      alert('Nominal belanja harus lebih dari Rp 0!');
      return;
    }

    const updatedExpense = {
      ...expense,
      date,
      category,
      item_name: itemName.trim(),
      amount: Number(amount),
      updated_at: new Date().toISOString()
    };

    onSave(updatedExpense);
    onClose();
  };

  const getPresetsForCategory = () => {
    if (category === 'MARKET') return PRESET_MARKET_ITEMS;
    if (category === 'ICE') return PRESET_ICE_ITEMS;
    return PRESET_OPERATIONAL_ITEMS;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-[430px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-black">Ubah Catatan Belanja</h3>
              <p className="text-[10px] text-rose-100 font-medium">Koreksi nama belanjaan, tanggal, atau nominal biaya</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Tanggal Belanja */}
          <div>
            <IndonesianDatePicker
              id="edit-expense-date"
              label="Tanggal Belanja"
              value={date}
              onChange={setDate}
              accentColor="rose"
            />
          </div>

          {/* Kategori Belanja (3 Tabs) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Kategori Pengeluaran
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCategory('MARKET')}
                className={`py-2 text-[11px] font-black rounded-lg transition-all ${
                  category === 'MARKET'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🥬 Pasar
              </button>
              <button
                type="button"
                onClick={() => setCategory('ICE')}
                className={`py-2 text-[11px] font-black rounded-lg transition-all ${
                  category === 'ICE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧊 Bahan Es
              </button>
              <button
                type="button"
                onClick={() => setCategory('OPERATIONAL')}
                className={`py-2 text-[11px] font-black rounded-lg transition-all ${
                  category === 'OPERATIONAL'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔥 Gas/Oper
              </button>
            </div>
          </div>

          {/* Nama Barang Belanja */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Nama Barang / Keperluan
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Contoh: Sawi 3 ikat, Gas 3kg, Es balok..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-rose-600 outline-none"
            />
          </div>

          {/* Preset Buttons for Quick Replacement */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Pilihan Cepat Barang:
            </span>
            <div className="flex flex-wrap gap-1">
              {getPresetsForCategory().map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setItemName(preset)}
                  className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg active:scale-95 shadow-2xs"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal Biaya */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Nominal Belanja (Rupiah)
            </label>
            <CurrencyInput
              value={amount}
              onChange={(newAmt) => setAmount(newAmt)}
              placeholder="0"
              size="large"
              showQuickChips={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 bg-rose-600 active:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Belanja</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
