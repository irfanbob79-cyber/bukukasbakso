import React, { useState } from 'react';
import { formatRupiah } from '../utils/formatters';
import { X, Calculator, Plus, Minus, Check, RotateCcw } from 'lucide-react';

const DENOMINATIONS = [
  { label: 'Rp 100.000', value: 100000, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { label: 'Rp 50.000', value: 50000, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { label: 'Rp 20.000', value: 20000, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  { label: 'Rp 10.000', value: 10000, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { label: 'Rp 5.000', value: 5000, color: 'text-amber-800 bg-amber-50 border-amber-200' },
  { label: 'Rp 2.000', value: 2000, color: 'text-slate-700 bg-slate-100 border-slate-200' },
  { label: 'Rp 1.000', value: 1000, color: 'text-slate-700 bg-slate-100 border-slate-200' },
];

export default function DenominationCalculatorModal({ isOpen, onClose, onApply }) {
  const [counts, setCounts] = useState({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
  });
  const [coins, setCoins] = useState(0);

  if (!isOpen) return null;

  const handleCountChange = (val, delta) => {
    setCounts((prev) => ({
      ...prev,
      [val]: Math.max(0, (prev[val] || 0) + delta),
    }));
  };

  const handleDirectChange = (val, inputStr) => {
    const num = parseInt(inputStr.replace(/[^\d]/g, ''), 10) || 0;
    setCounts((prev) => ({
      ...prev,
      [val]: num,
    }));
  };

  const handleReset = () => {
    setCounts({
      100000: 0,
      50000: 0,
      20000: 0,
      10000: 0,
      5000: 0,
      2000: 0,
      1000: 0,
    });
    setCoins(0);
  };

  const totalCalculated = Object.entries(counts).reduce((sum, [denom, count]) => {
    return sum + Number(denom) * count;
  }, 0) + (Number(coins) || 0);

  const handleSave = () => {
    onApply(totalCalculated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0">
      {/* Mobile Drawer */}
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden pb-[max(env(safe-area-inset-bottom),14px)] animate-in slide-in-from-bottom duration-200">
        
        {/* Grab Handle for iOS/Android feel */}
        <div className="pt-2 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700 text-white rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base leading-tight">Hitung Uang Fisik Laci</h3>
              <p className="text-[11px] text-slate-500 font-medium">Hitung lembaran uang saat tutup warung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full bg-slate-200/60 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticky Total Bar */}
        <div className="px-5 py-3 bg-emerald-800 text-white flex items-center justify-between shadow-inner">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Total Uang Laci:</span>
          <span className="text-2xl font-black">{formatRupiah(totalCalculated)}</span>
        </div>

        {/* Denominations List with Large Mobile Touch Buttons */}
        <div className="overflow-y-auto px-5 py-2.5 space-y-2 flex-1 divide-y divide-slate-100">
          {DENOMINATIONS.map((d) => {
            const count = counts[d.value] || 0;
            const subtotal = d.value * count;

            return (
              <div key={d.value} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-black rounded-lg border ${d.color}`}>
                    {d.label}
                  </span>
                  <div className="text-xs text-slate-500 mt-0.5 font-bold">
                    = {formatRupiah(subtotal)}
                  </div>
                </div>

                {/* Counter Stepper with 40px+ touch targets */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCountChange(d.value, -1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 active:scale-90 flex items-center justify-center font-black transition-transform"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={count === 0 ? '' : count}
                    placeholder="0"
                    onChange={(e) => handleDirectChange(d.value, e.target.value)}
                    className="w-12 h-10 text-center font-black border border-slate-300 rounded-xl focus:border-emerald-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCountChange(d.value, 1)}
                    className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 active:scale-90 flex items-center justify-center font-black transition-transform"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Koin / Recehan */}
          <div className="pt-2.5 flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="inline-block px-2.5 py-0.5 text-xs font-black rounded-lg border bg-amber-50 text-amber-900 border-amber-200">
                Uang Koin / Receh (Total)
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Recehan total dalam laci</p>
            </div>
            <div className="w-32">
              <input
                type="text"
                inputMode="numeric"
                value={coins > 0 ? coins.toLocaleString('id-ID') : ''}
                placeholder="Rp 0"
                onChange={(e) => {
                  const num = parseInt(e.target.value.replace(/[^\d]/g, ''), 10) || 0;
                  setCoins(num);
                }}
                className="w-full text-right px-3 py-2 text-sm font-black border border-slate-300 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Mobile Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="w-12 h-12 text-slate-500 bg-white border border-slate-200 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
            title="Reset hitungan"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={totalCalculated === 0}
            className="flex-1 min-h-[48px] px-4 bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 transition-all"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Pakai Hasil ({formatRupiah(totalCalculated)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
