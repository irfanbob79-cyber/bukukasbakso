import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Save, 
  Calculator, 
  CheckCircle, 
  AlertCircle,
  GlassWater,
  UtensilsCrossed,
  History,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import DenominationCalculatorModal from '../components/DenominationCalculatorModal';
import { 
  formatRupiah, 
  getTodayDateString, 
  formatDateIndonesian, 
  generateUUID 
} from '../utils/formatters';

export default function SalesView({ sales, onSaveSale, setActiveTab }) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [baksoIncome, setBaksoIncome] = useState(0);
  
  // Drink/Ice sales separation
  const [iceCups, setIceCups] = useState(0);
  const [icePrice, setIcePrice] = useState(4000); // Default Rp 4.000 / cup
  const [iceIncome, setIceIncome] = useState(0);
  const [isManualIceIncome, setIsManualIceIncome] = useState(false);

  const [notes, setNotes] = useState('');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-calculate ice income when cups or price change unless manually entered
  useEffect(() => {
    if (!isManualIceIncome) {
      setIceIncome((Number(iceCups) || 0) * (Number(icePrice) || 0));
    }
  }, [iceCups, icePrice, isManualIceIncome]);

  // Total cash income = bakso + ice
  const totalIncome = (Number(baksoIncome) || 0) + (Number(iceIncome) || 0);

  // When date changes, check if there's already an existing record for that date
  useEffect(() => {
    const existing = sales.find((s) => s.date === selectedDate);
    if (existing) {
      if (existing.bakso_income !== undefined) {
        setBaksoIncome(existing.bakso_income);
        setIceCups(existing.ice_cups_sold || 0);
        setIcePrice(existing.ice_price_per_cup || 4000);
        setIceIncome(existing.ice_income || 0);
      } else {
        // Legacy data without ice separation
        setBaksoIncome(existing.total_cash_income || 0);
        setIceCups(0);
        setIceIncome(0);
      }
      setNotes(existing.notes || '');
    } else {
      setBaksoIncome(0);
      setIceCups(0);
      setIcePrice(4000);
      setIceIncome(0);
      setIsManualIceIncome(false);
      setNotes('');
    }
  }, [selectedDate, sales]);

  const existingRecord = sales.find((s) => s.date === selectedDate);

  const handleCupStepper = (delta) => {
    setIsManualIceIncome(false);
    setIceCups((prev) => Math.max(0, (Number(prev) || 0) + delta));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalIncome <= 0) {
      alert('Total uang masuk tunai harus lebih besar dari Rp 0!');
      return;
    }

    const saleData = {
      id: existingRecord ? existingRecord.id : generateUUID(),
      date: selectedDate,
      bakso_income: Number(baksoIncome) || 0,
      ice_cups_sold: Number(iceCups) || 0,
      ice_price_per_cup: Number(icePrice) || 0,
      ice_income: Number(iceIncome) || 0,
      total_cash_income: totalIncome,
      notes: notes.trim(),
      created_at: existingRecord ? existingRecord.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSaveSale(saleData);
    setSuccessMessage(existingRecord ? 'Data penjualan berhasil diperbarui!' : 'Penjualan harian berhasil disimpan!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-3.5">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">Pencatatan Uang Masuk</h2>
            <p className="text-[11px] text-slate-500 font-medium">Pisahkan omzet bakso & penjualan es cup</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCalcOpen(true)}
          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <Calculator className="w-4 h-4 text-emerald-700" />
          <span>Kalkulator</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
        {/* Date Selector */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
            Tanggal Tutup Warung
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-slate-800 focus:border-emerald-600 outline-none text-sm"
            required
          />
          {existingRecord && (
            <p className="text-[11px] text-amber-700 mt-1 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline" />
              Sudah ada data penjualan tanggal ini. Menyimpan akan memperbarui nilai lama.
            </p>
          )}
        </div>

        {/* 1. Omzet Makanan / Bakso */}
        <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
            <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
            <span>1. Penjualan Bakso & Makanan</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Total uang masuk dari porsi bakso, mie, dan makanan
          </p>

          <CurrencyInput
            value={baksoIncome}
            onChange={setBaksoIncome}
            placeholder="0"
            size="large"
            showQuickChips={true}
          />
        </div>

        {/* 2. Penjualan Es & Minuman */}
        <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-950 font-extrabold text-xs uppercase tracking-wider">
              <GlassWater className="w-4 h-4 text-blue-600" />
              <span>2. Penjualan Es & Minuman</span>
            </div>
            <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-black">
              Es Teh / Jeruk
            </span>
          </div>

          {/* Stepper Jumlah Cup */}
          <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">
                Total Cup Es Terjual:
              </span>
              <span className="text-xs text-blue-700 font-black">
                {iceCups} Cup
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCupStepper(-5)}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black active:scale-90 flex items-center justify-center"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleCupStepper(-1)}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black active:scale-90 flex items-center justify-center"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>

              <input
                type="text"
                inputMode="numeric"
                value={iceCups === 0 ? '' : iceCups}
                placeholder="0"
                onChange={(e) => {
                  setIsManualIceIncome(false);
                  const num = parseInt(e.target.value.replace(/[^\d]/g, ''), 10) || 0;
                  setIceCups(num);
                }}
                className="flex-1 h-10 text-center font-black text-lg border border-slate-300 rounded-xl focus:border-blue-600 outline-none"
              />

              <button
                type="button"
                onClick={() => handleCupStepper(1)}
                className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black active:scale-90 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={() => handleCupStepper(5)}
                className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black active:scale-90 flex items-center justify-center"
              >
                +5
              </button>
            </div>

            {/* Quick cup presets */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => { setIsManualIceIncome(false); setIceCups(20); }}
                className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold active:scale-90"
              >
                20 cup
              </button>
              <button
                type="button"
                onClick={() => { setIsManualIceIncome(false); setIceCups(30); }}
                className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold active:scale-90"
              >
                30 cup
              </button>
              <button
                type="button"
                onClick={() => { setIsManualIceIncome(false); setIceCups(40); }}
                className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold active:scale-90"
              >
                40 cup
              </button>
              <button
                type="button"
                onClick={() => { setIsManualIceIncome(false); setIceCups(50); }}
                className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold active:scale-90"
              >
                50 cup
              </button>
              <button
                type="button"
                onClick={() => { setIsManualIceIncome(false); setIceCups(60); }}
                className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold active:scale-90"
              >
                60 cup
              </button>
            </div>
          </div>

          {/* Harga per cup & Subtotal Omzet Es */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2.5 rounded-xl border border-blue-200">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">
                Harga Jual / Cup
              </label>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={icePrice ? icePrice.toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    setIsManualIceIncome(false);
                    const p = parseInt(e.target.value.replace(/[^\d]/g, ''), 10) || 0;
                    setIcePrice(p);
                  }}
                  className="w-full text-sm font-black text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-100/70 p-2.5 rounded-xl border border-blue-300">
              <label className="block text-[10px] font-bold text-blue-900 uppercase">
                Subtotal Omzet Es
              </label>
              <div className="text-sm font-black text-blue-950 mt-0.5 truncate">
                {formatRupiah(iceIncome)}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Total Omzet Keseluruhan Box */}
        <div className="p-4 bg-emerald-800 text-white rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
              Total Uang Masuk (Bakso + Es):
            </span>
            <span className="text-[10px] text-emerald-300 font-medium">
              Bakso: {formatRupiah(baksoIncome)} • Es: {formatRupiah(iceIncome)} ({iceCups} cup)
            </span>
          </div>
          <div className="text-2xl font-black">
            {formatRupiah(totalIncome)}
          </div>
        </div>

        {/* Catatan Harian (Textarea) */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
            Catatan Harian (Opsional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Hujan deras sore hari, bakso urat dan es teh manis laku keras..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-emerald-600 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full min-h-[48px] py-3 px-4 bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 transition-all"
        >
          <Save className="w-5 h-5" />
          <span>{existingRecord ? 'Perbarui Penjualan Tanggal Ini' : `Simpan Penjualan (${formatRupiah(totalIncome)})`}</span>
        </button>
      </form>

      {/* Shortcut ke Menu Riwayat Lengkap */}
      <div 
        onClick={() => setActiveTab('history')}
        className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <History className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800">Lihat Riwayat & Pencarian Tanggal</h4>
            <p className="text-[10px] text-slate-500 font-medium">Buka menu riwayat untuk melihat semua catatan omzet lampau</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Cash Drawer Calculator Modal */}
      <DenominationCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onApply={(calculatedTotal) => setBaksoIncome(calculatedTotal)}
      />
    </div>
  );
}
