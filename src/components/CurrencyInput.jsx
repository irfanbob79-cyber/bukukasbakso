import React from 'react';
import { parseRupiahInput } from '../utils/formatters';
import { X } from 'lucide-react';

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  label,
  id,
  showQuickChips = false,
  className = "",
  size = "normal" // "normal" | "large"
}) {
  const numericValue = typeof value === 'number' ? value : parseRupiahInput(value);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    const parsed = parseRupiahInput(raw);
    onChange(parsed);
  };

  const handleAddAmount = (amountToAdd) => {
    onChange((numericValue || 0) + amountToAdd);
  };

  const handleAppendZeros = () => {
    const currentStr = numericValue ? numericValue.toString() : '';
    const newStr = currentStr + '000';
    onChange(parseInt(newStr, 10));
  };

  const handleClear = () => {
    onChange(0);
  };

  const isLarge = size === "large";

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <span className={`absolute left-3.5 font-black select-none pointer-events-none ${
          isLarge ? 'text-2xl text-emerald-700' : 'text-base text-slate-500'
        }`}>
          Rp
        </span>

        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={numericValue > 0 ? numericValue.toLocaleString('id-ID') : ''}
          placeholder={placeholder}
          onChange={handleInputChange}
          className={`w-full rounded-2xl border border-slate-300 bg-white shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-black text-slate-900 ${
            isLarge 
              ? 'pl-14 pr-12 py-3 text-2xl tracking-tight' 
              : 'pl-11 pr-11 py-2.5 text-lg'
          } ${className}`}
        />

        {numericValue > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 p-2 rounded-xl text-slate-400 hover:text-slate-600 active:bg-slate-200 transition-colors"
            title="Hapus nominal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showQuickChips && (
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={handleAppendZeros}
            className="min-h-[38px] px-3 py-1.5 text-xs font-extrabold rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 active:scale-90 transition-transform shrink-0"
          >
            +000
          </button>
          <button
            type="button"
            onClick={() => handleAddAmount(50000)}
            className="min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-800 border border-slate-200 active:scale-90 transition-transform shrink-0"
          >
            +50rb
          </button>
          <button
            type="button"
            onClick={() => handleAddAmount(100000)}
            className="min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-800 border border-slate-200 active:scale-90 transition-transform shrink-0"
          >
            +100rb
          </button>
          <button
            type="button"
            onClick={() => handleAddAmount(500000)}
            className="min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-800 border border-slate-200 active:scale-90 transition-transform shrink-0"
          >
            +500rb
          </button>
        </div>
      )}
    </div>
  );
}
