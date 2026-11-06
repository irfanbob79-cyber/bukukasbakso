import React, { useState, useMemo } from 'react';
import { 
  History, 
  Calendar, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  GlassWater, 
  UtensilsCrossed, 
  Flame, 
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  formatRupiah, 
  getTodayDateString, 
  formatDateIndonesian, 
  formatShortDate 
} from '../utils/formatters';
import IndonesianDatePicker from '../components/IndonesianDatePicker';

export default function HistoryView({
  sales,
  expenses,
  batches,
  onDeleteSale,
  onDeleteExpense,
  onDeleteBatch,
  onToggleBatchStatus,
  setActiveTab
}) {
  const today = getTodayDateString();

  // Date filters
  const [dateMode, setDateMode] = useState('ALL'); // 'SPECIFIC' | 'TODAY' | 'YESTERDAY' | '7DAYS' | 'ALL'
  const [selectedDate, setSelectedDate] = useState(today);
  
  // Type filter
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'SALES' | 'MARKET' | 'ICE' | 'OPERATIONAL' | 'BATCH'
  
  // Keyword search
  const [searchQuery, setSearchQuery] = useState('');

  // Helper for yesterday
  const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // Helper to change date by delta (+1 or -1 day)
  const handleShiftDate = (deltaDays) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + deltaDays);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const newDateStr = `${y}-${m}-${d}`;
    setSelectedDate(newDateStr);
    setDateMode('SPECIFIC');
  };

  // Filter Sales
  const filteredSales = useMemo(() => {
    if (typeFilter !== 'ALL' && typeFilter !== 'SALES') return [];

    return sales.filter((s) => {
      // Date filter
      if (dateMode === 'TODAY' && s.date !== today) return false;
      if (dateMode === 'YESTERDAY' && s.date !== getYesterdayDate()) return false;
      if (dateMode === 'SPECIFIC' && s.date !== selectedDate) return false;
      if (dateMode === '7DAYS') {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        const minDate = d.toISOString().split('T')[0];
        if (s.date < minDate || s.date > today) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const noteMatch = (s.notes || '').toLowerCase().includes(q);
        const matchEs = q.includes('es') && (s.ice_income > 0 || s.ice_cups_sold > 0);
        const matchBakso = q.includes('bakso') && (s.bakso_income > 0 || s.total_cash_income > 0);
        if (!noteMatch && !matchEs && !matchBakso) return false;
      }

      return true;
    });
  }, [sales, dateMode, selectedDate, typeFilter, searchQuery, today]);

  // Filter Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Type filter
      if (typeFilter !== 'ALL') {
        if (typeFilter === 'SALES' || typeFilter === 'BATCH') return false;
        if (typeFilter !== e.category) return false;
      }

      // Date filter
      if (dateMode === 'TODAY' && e.date !== today) return false;
      if (dateMode === 'YESTERDAY' && e.date !== getYesterdayDate()) return false;
      if (dateMode === 'SPECIFIC' && e.date !== selectedDate) return false;
      if (dateMode === '7DAYS') {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        const minDate = d.toISOString().split('T')[0];
        if (e.date < minDate || e.date > today) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!e.item_name.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [expenses, dateMode, selectedDate, typeFilter, searchQuery, today]);

  // Filter Batches
  const filteredBatches = useMemo(() => {
    if (typeFilter !== 'ALL' && typeFilter !== 'BATCH') return [];

    return batches.filter((b) => {
      // Date filter
      if (dateMode === 'TODAY' && b.grind_date !== today) return false;
      if (dateMode === 'YESTERDAY' && b.grind_date !== getYesterdayDate()) return false;
      if (dateMode === 'SPECIFIC' && b.grind_date !== selectedDate) return false;
      if (dateMode === '7DAYS') {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        const minDate = d.toISOString().split('T')[0];
        if (b.grind_date < minDate || b.grind_date > today) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const noteMatch = (b.notes || '').toLowerCase().includes(q);
        const itemsMatch = b.items && b.items.some(i => i.name.toLowerCase().includes(q) || (i.qty || '').toLowerCase().includes(q));
        if (!noteMatch && !itemsMatch) return false;
      }

      return true;
    });
  }, [batches, dateMode, selectedDate, typeFilter, searchQuery, today]);

  // Combined calculations for the active filter
  const totalSalesIncome = filteredSales.reduce((sum, s) => sum + s.total_cash_income, 0);
  const totalIceCups = filteredSales.reduce((sum, s) => sum + (s.ice_cups_sold || 0), 0);
  const totalIceIncome = filteredSales.reduce((sum, s) => sum + (s.ice_income || 0), 0);

  const totalExpensesCost = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBatchesCost = filteredBatches.reduce((sum, b) => sum + b.total_dough_cost, 0);
  const totalAllCost = totalExpensesCost + totalBatchesCost;
  const netCalculated = totalSalesIncome - totalAllCost;

  const totalEntriesCount = filteredSales.length + filteredExpenses.length + filteredBatches.length;

  return (
    <div className="space-y-3.5 pb-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">Riwayat Transaksi</h2>
            <p className="text-[11px] text-slate-500 font-medium">Cari & kelola data berdasarkan tanggal</p>
          </div>
        </div>
      </div>

      {/* 1. Date Filter Controls (Cari Berdasarkan Tanggal) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pilih Tanggal Riwayat:</span>
          </span>
          <span className="text-[11px] font-bold text-indigo-700">
            {dateMode === 'ALL' ? 'Semua Waktu' : dateMode === '7DAYS' ? '7 Hari Terakhir' : formatDateIndonesian(selectedDate, false)}
          </span>
        </div>

        {/* Quick Date Mode Buttons */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-center">
          <button
            type="button"
            onClick={() => { setDateMode('TODAY'); setSelectedDate(today); }}
            className={`py-1.5 text-xs font-black rounded-lg transition-all ${
              dateMode === 'TODAY'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => { setDateMode('YESTERDAY'); setSelectedDate(getYesterdayDate()); }}
            className={`py-1.5 text-xs font-black rounded-lg transition-all ${
              dateMode === 'YESTERDAY'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Kemarin
          </button>
          <button
            type="button"
            onClick={() => setDateMode('7DAYS')}
            className={`py-1.5 text-xs font-black rounded-lg transition-all ${
              dateMode === '7DAYS'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-600'
            }`}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => setDateMode('ALL')}
            className={`py-1.5 text-xs font-black rounded-lg transition-all ${
              dateMode === 'ALL'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Date Stepper & Direct Date Picker */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleShiftDate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black active:scale-90 flex items-center justify-center shrink-0"
            title="Hari Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <IndonesianDatePicker
              id="history-date-picker"
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                setDateMode('SPECIFIC');
              }}
              size="compact"
              accentColor="indigo"
            />
          </div>

          <button
            type="button"
            onClick={() => handleShiftDate(1)}
            className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black active:scale-90 flex items-center justify-center shrink-0"
            title="Hari Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Search Keyword Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari barang, es, gas, daging, atau catatan..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-indigo-600 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Type Filter Badges (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'ALL', label: 'Semua Transaksi' },
          { id: 'SALES', label: '💰 Uang Masuk & Es' },
          { id: 'MARKET', label: '🥬 Belanja Pasar' },
          { id: 'ICE', label: '🧊 Belanja Es' },
          { id: 'OPERATIONAL', label: '🔥 Gas/Operasional' },
          { id: 'BATCH', label: '🥩 Batch Adonan' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTypeFilter(t.id)}
            className={`min-h-[36px] px-3 py-1 text-xs font-black rounded-xl border shrink-0 active:scale-90 transition-all ${
              typeFilter === t.id
                ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 4. Mini Financial Summary Box for this Filter */}
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-md space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
          <span>Ringkasan Filter Ini ({totalEntriesCount} data)</span>
          <span className="text-emerald-400 font-extrabold">
            Sisa Bersih: {formatRupiah(netCalculated)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">UANG MASUK:</span>
            <span className="font-black text-emerald-400 text-sm">{formatRupiah(totalSalesIncome)}</span>
            {totalIceCups > 0 && (
              <span className="text-[10px] text-blue-300 block">
                (Es: {totalIceCups} cup • {formatRupiah(totalIceIncome)})
              </span>
            )}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">PENGELUARAN:</span>
            <span className="font-black text-rose-400 text-sm">{formatRupiah(totalAllCost)}</span>
            <span className="text-[10px] text-slate-400 block">Belanja & Adonan</span>
          </div>
        </div>
      </div>

      {/* 5. Transactions Feed List */}
      <div className="space-y-3">
        {totalEntriesCount === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-bold">
              Tidak ada riwayat transaksi pada filter tanggal ini.
            </p>
            <button
              onClick={() => { setDateMode('ALL'); setTypeFilter('ALL'); setSearchQuery(''); }}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-xl border border-indigo-200"
            >
              Tampilkan Semua Transaksi
            </button>
          </div>
        ) : (
          <>
            {/* Sales Items */}
            {filteredSales.map((s) => (
              <div 
                key={s.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                      UANG MASUK
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {formatDateIndonesian(s.date, true)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-700">
                      {formatRupiah(s.total_cash_income)}
                    </span>
                  </div>
                </div>

                {/* Sub-breakdown Bakso vs Es */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Omzet Bakso:</span>
                    <span className="font-extrabold text-slate-800">
                      {formatRupiah(s.bakso_income ?? s.total_cash_income)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Penjualan Es:</span>
                    <span className="font-extrabold text-blue-900">
                      {s.ice_income ? formatRupiah(s.ice_income) : 'Rp 0'} {s.ice_cups_sold ? `(${s.ice_cups_sold} cup)` : ''}
                    </span>
                  </div>
                </div>

                {s.notes && (
                  <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100 font-medium">
                    "{s.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('sales')}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah di Form Penjualan</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus catatan omzet tanggal ${formatDateIndonesian(s.date)}?`)) {
                        onDeleteSale(s.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 active:scale-90"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Expenses Items */}
            {filteredExpenses.map((exp) => (
              <div 
                key={exp.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      exp.category === 'MARKET'
                        ? 'bg-emerald-100 text-emerald-800'
                        : exp.category === 'ICE'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {exp.category === 'MARKET' ? '🥬 Belanja Pasar' : exp.category === 'ICE' ? '🧊 Bahan Es' : '🔥 Operasional'}
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs truncate">
                      {exp.item_name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold">
                    {formatDateIndonesian(exp.date, true)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-rose-700 text-sm">
                    {formatRupiah(exp.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus belanja "${exp.item_name}"?`)) {
                        onDeleteExpense(exp.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 active:scale-90"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Batch Items */}
            {filteredBatches.map((b) => (
              <div 
                key={b.id}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                      BATCH ADONAN #{b.batch_number}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {formatDateIndonesian(b.grind_date, true)}
                    </span>
                  </div>

                  <span className="text-base font-black text-amber-950">
                    {formatRupiah(b.total_dough_cost)}
                  </span>
                </div>

                {/* Items & Units */}
                <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 space-y-1 text-xs">
                  {b.items && b.items.length > 0 ? (
                    b.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {it.name} {it.qty && <span className="text-amber-800 text-[10px]">({it.qty})</span>}
                        </span>
                        <span className="font-black text-slate-900">{formatRupiah(it.cost)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-600 font-bold">
                      Daging: {formatRupiah(b.meat_cost)} • Giling: {formatRupiah(b.grinding_fee)}
                    </div>
                  )}
                </div>

                {b.notes && (
                  <p className="text-xs text-slate-600 italic font-medium">"{b.notes}"</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onToggleBatchStatus(b.id)}
                    className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      !b.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {!b.is_completed ? 'Status: Aktif' : 'Status: Habis'}
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus catatan Batch #${b.batch_number}?`)) {
                        onDeleteBatch(b.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 active:scale-90"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

