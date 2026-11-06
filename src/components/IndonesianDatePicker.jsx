import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateIndonesian } from '../utils/formatters';

export const formatToDayMonthYear = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`; // DD-MM-YYYY format Indonesia
  }
  return dateStr;
};

export default function IndonesianDatePicker({
  value,
  onChange,
  label,
  id,
  className = "",
  size = "normal", // "normal" | "compact"
  accentColor = "emerald" // "emerald" | "amber" | "rose" | "indigo"
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
          return;
        } catch (e) {}
      }
      inputRef.current.focus();
      inputRef.current.click();
    }
  };

  const dmyFormatted = formatToDayMonthYear(value);
  const indonesianText = formatDateIndonesian(value, false);

  const iconColor = 
    accentColor === 'amber' ? 'text-amber-700' :
    accentColor === 'rose' ? 'text-rose-700' :
    accentColor === 'indigo' ? 'text-indigo-700' :
    'text-emerald-700';

  const isCompact = size === 'compact';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      <div 
        onClick={handleClick}
        className={`relative flex items-center justify-between w-full rounded-2xl border border-slate-300 bg-white shadow-sm cursor-pointer active:scale-[0.99] transition-all hover:border-emerald-600 select-none ${
          isCompact ? 'px-2.5 py-1.5' : 'px-3.5 py-2.5'
        } ${className}`}
      >
        <div className="flex items-baseline gap-1.5 truncate mr-2">
          <span className={`font-black text-slate-900 tracking-wider ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {dmyFormatted || '-'}
          </span>
          {!isCompact && (
            <span className="text-[11px] font-bold text-slate-500 truncate">
              ({indonesianText})
            </span>
          )}
        </div>

        <Calendar className={`w-4 h-4 shrink-0 pointer-events-none ${iconColor}`} />

        {/* Native date input overlay to open Android / iOS date picker */}
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-auto"
        />
      </div>
    </div>
  );
}

