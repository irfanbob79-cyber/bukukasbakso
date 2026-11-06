import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Wallet, 
  GlassWater, 
  UtensilsCrossed, 
  Plus, 
  Minus 
} from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import IndonesianDatePicker from './IndonesianDatePicker';
import { formatRupiah } from '../utils/formatters';

export default function EditSaleModal({ isOpen, sale, onClose, onSave }) {
  if (!isOpen || !sale) return null;

  const [date, setDate] = useState(sale.date || '');
  const [baksoIncome, setBaksoIncome] = useState(sale.bakso_income ?? (sale.total_cash_income || 0));
  const [iceCups, setIceCups] = useState(sale.ice_cups_sold || 0);
  const [icePrice, setIcePrice] = useState(sale.ice_price_per_cup || 4000);
  const [iceIncome, setIceIncome] = useState(sale.ice_income || 0);
  const [isManualIceIncome, setIsManualIceIncome] = useState(false);
  const [notes, setNotes] = useState(sale.notes || '');

  // Auto-calculate ice income when cups or price change unless manually entered
  useEffect(() => {
    if (!isManualIceIncome) {
      setIceIncome((Number(iceCups) || 0) * (Number(icePrice) || 0));
    }
  }, [iceCups, icePrice, isManualIceIncome]);

  const totalIncome = (Number(baksoIncome) || 0) + (Number(iceIncome) || 0);

  const handleCupStepper = (delta) => {
    setIsManualIceIncome(false);
    setIceCups((prev) => Math.max(0, (Number(prev) || 0) + delta));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalIncome <= 0) {
      alert('Total uang masuk tidak boleh Rp 0!');
      return;
    }

    const updatedSale = {
      ...sale,
      date,
      bakso_income: Number(baksoIncome) || 0,
      ice_cups_sold: Number(iceCups) || 0,
      ice_price_per_cup: Number(icePrice) || 0,
      ice_income: Number(iceIncome) || 0,
      total_cash_income: totalIncome,
      notes: notes.trim(),
      updated_at: new Date().toISOString()
    };

    onSave(updatedSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-[430px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-black">Ubah Catatan Uang Masuk</h3>
              <p className="text-[10px] text-emerald-100 font-medium">Koreksi omzet bakso, penjualan es, atau catatan</p>
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
          {/* Tanggal Uang Masuk */}
          <div>
            <IndonesianDatePicker
              id="edit-sale-date"
              label="Tanggal Uang Masuk"
              value={date}
              onChange={setDate}
              accentColor="emerald"
            />
          </div>

          {/* 1. Omzet Bakso */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span>1. Omzet Bakso Murni</span>
              </label>
              <span className="text-[10px] text-slate-500 font-bold">Di luar es</span>
            </div>

            <CurrencyInput
              value={baksoIncome}
              onChange={(val) => setBaksoIncome(val)}
              placeholder="0"
              size="large"
              showQuickChips={true}
            />
          </div>

          {/* 2. Penjualan Es Cup */}
          <div className="space-y-2.5 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <GlassWater className="w-4 h-4 text-blue-600" />
                <span>2. Penjualan Minuman Es</span>
              </label>
              <span className="text-[10px] text-blue-700 font-bold">Opsional</span>
            </div>

            {/* Stepper Jumlah Cup */}
            <div>
              <span className="block text-[11px] font-bold text-slate-600 mb-1">
                Jumlah Cup Es Terjual:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCupStepper(-1)}
                  className="w-10 h-10 rounded-xl bg-white border border-blue-200 text-blue-800 font-black text-lg active:scale-90 flex items-center justify-center shrink-0 shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center bg-white border border-blue-200 rounded-xl py-2">
                  <span className="text-lg font-black text-blue-950">{iceCups}</span>
                  <span className="text-[10px] text-slate-500 font-bold ml-1">cup</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCupStepper(1)}
                  className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg active:scale-90 flex items-center justify-center shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Stepper Chips */}
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {[+5, +10, +20, +50].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleCupStepper(step)}
                    className="py-1 text-[11px] font-black rounded-lg bg-white border border-blue-200 text-blue-800 active:scale-95"
                  >
                    +{step}
                  </button>
                ))}
              </div>
            </div>

            {/* Harga per cup & subtotal */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200/60">
              <div className="bg-white p-2 rounded-xl border border-blue-200">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                  Harga / Cup
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={icePrice || ''}
                  onChange={(e) => {
                    setIsManualIceIncome(false);
                    setIcePrice(Number(e.target.value) || 0);
                  }}
                  className="w-full text-xs font-black text-slate-900 outline-none"
                />
              </div>

              <div className="bg-blue-100/70 p-2 rounded-xl border border-blue-300">
                <label className="block text-[10px] font-bold text-blue-900 uppercase">
                  Subtotal Omzet Es
                </label>
                <div className="text-xs font-black text-blue-950 mt-0.5 truncate">
                  {formatRupiah(iceIncome)}
                </div>
              </div>
            </div>
          </div>

          {/* Total Box */}
          <div className="p-3.5 bg-emerald-800 text-white rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                Total Uang Masuk Baru:
              </span>
              <span className="text-[10px] text-emerald-300 font-medium">
                Bakso: {formatRupiah(baksoIncome)} • Es: {formatRupiah(iceIncome)}
              </span>
            </div>
            <div className="text-xl font-black">
              {formatRupiah(totalIncome)}
            </div>
          </div>

          {/* Catatan Harian */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Catatan Harian
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Hujan sore hari, bakso urat laku keras..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-emerald-600 outline-none resize-none leading-relaxed"
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
              className="flex-2 py-3 px-4 bg-emerald-600 active:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Penjualan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

