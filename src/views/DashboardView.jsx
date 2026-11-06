import React from 'react';
import { 
  Wallet, 
  ShoppingCart, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  formatRupiah, 
  getTodayDateString, 
  formatDateIndonesian, 
  calculateDaysBetween 
} from '../utils/formatters';

export default function DashboardView({
  sales = [],
  expenses = [],
  batches = [],
  setActiveTab
}) {
  const today = getTodayDateString();

  const safeSales = Array.isArray(sales) ? sales : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeBatches = Array.isArray(batches) ? batches : [];

  // Find today's sales
  const todaySale = safeSales.find((s) => s && s.date === today);
  const todayIncome = todaySale ? (Number(todaySale.total_cash_income) || 0) : 0;

  // Filter today's expenses
  const todayExpenses = safeExpenses.filter((e) => e && e.date === today);
  const todayMarketExpense = todayExpenses
    .filter((e) => e && e.category === 'MARKET')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const todayIceExpense = todayExpenses
    .filter((e) => e && e.category === 'ICE')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const todayOperExpense = todayExpenses
    .filter((e) => e && e.category === 'OPERATIONAL')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalTodayExpenses = todayMarketExpense + todayIceExpense + todayOperExpense;

  // Sisa Kas Fisik Hari Ini = Uang Masuk - Belanja Harian
  const todayNetCash = todayIncome - totalTodayExpenses;

  // Active Batch calculation
  const activeBatch = safeBatches
    .slice()
    .reverse()
    .find((b) => b && !b.is_completed);

  let batchDayNumber = 1;
  let batchStatus = 'fresh'; // 'fresh' | 'warning' | 'expired'
  let batchStatusText = 'Adonan Baru';
  let batchProgressPercent = 33;

  if (activeBatch) {
    const estDays = Math.max(1, Number(activeBatch.estimated_days) || 3);
    const daysPassed = calculateDaysBetween(activeBatch.grind_date, today);
    batchDayNumber = Math.max(1, daysPassed + 1);

    if (batchDayNumber === 1) {
      batchStatus = 'fresh';
      batchStatusText = 'Hari ke-1: Adonan Baru & Segar';
      batchProgressPercent = 33;
    } else if (batchDayNumber < estDays) {
      batchStatus = 'normal';
      batchStatusText = `Hari ke-${batchDayNumber} dari ${estDays} hari`;
      batchProgressPercent = Math.min(80, (batchDayNumber / estDays) * 100);
    } else if (batchDayNumber === estDays) {
      batchStatus = 'warning';
      batchStatusText = `Hari Terakhir (${batchDayNumber} dari ${estDays} hari)`;
      batchProgressPercent = 100;
    } else {
      batchStatus = 'expired';
      batchStatusText = `Lewat estimasi (${batchDayNumber} hari)`;
      batchProgressPercent = 100;
    }
  }

  return (
    <div className="space-y-3.5">
      {/* Date Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <Calendar className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-200 font-medium">Buku Kas Hari Ini</p>
            <h2 className="text-sm font-extrabold text-white tracking-tight leading-tight">
              {formatDateIndonesian(today)}
            </h2>
          </div>
        </div>

        {todaySale ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Tercatat
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-200 border border-amber-400/30">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            Belum Tutup
          </span>
        )}
      </div>

      {/* Main Cash Balance Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            Sisa Uang Fisik Hari Ini
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            (Di laci / dompet)
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <div className={`text-3xl font-black tracking-tight ${
            todayNetCash >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {formatRupiah(todayNetCash)}
          </div>
        </div>

        {/* 2-Columns breakdown: In vs Out */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
          <div 
            onClick={() => setActiveTab('sales')}
            className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/60 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-1 text-emerald-800 text-[11px] font-bold mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Uang Masuk</span>
            </div>
            <div className="text-base font-black text-emerald-950 truncate">
              {formatRupiah(todayIncome)}
            </div>
            <p className="text-[10px] text-emerald-700 mt-0.5 font-semibold">
              {todaySale ? 'Omzet tercatat' : 'Belum input'}
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('expenses')}
            className="p-3 bg-rose-50/80 rounded-xl border border-rose-200/60 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-1 text-rose-800 text-[11px] font-bold mb-0.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Belanja Hari Ini</span>
            </div>
            <div className="text-base font-black text-rose-950 truncate">
              {formatRupiah(totalTodayExpenses)}
            </div>
            <p className="text-[10px] text-rose-700 mt-0.5 font-semibold">
              {todayExpenses.length} belanjaan
            </p>
          </div>
        </div>
      </div>

      {/* Batch Adonan Status Card (Traffic Light System) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Status Batch Adonan</h3>
              <p className="text-[10px] text-slate-500 font-medium">Siklus modal gilingan 2-4 hari</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('batches')}
            className="text-xs font-black text-emerald-700 active:scale-95 flex items-center gap-0.5"
          >
            <span>Detail</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {activeBatch ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-black text-slate-900 text-sm">
                  Batch #{activeBatch.batch_number}
                </span>
                <span className="text-[11px] text-slate-500 ml-1.5 font-medium">
                  ({formatDateIndonesian(activeBatch.grind_date, false)})
                </span>
              </div>

              {batchStatus === 'fresh' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Segar
                </span>
              )}
              {batchStatus === 'normal' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Normal
                </span>
              )}
              {(batchStatus === 'warning' || batchStatus === 'expired') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Siapkan Gilingan
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                <span>{batchStatusText}</span>
                <span>Modal: {formatRupiah(activeBatch.total_dough_cost)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    batchStatus === 'fresh'
                      ? 'bg-emerald-500'
                      : batchStatus === 'normal'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${batchProgressPercent}%` }}
                />
              </div>
              {activeBatch.items && activeBatch.items.length > 0 && (
                <p className="text-[10px] text-slate-500 font-medium truncate mt-1.5">
                  Bahan: {activeBatch.items.map(it => `${it.name}${it.qty ? ` (${it.qty})` : ''}`).join(' • ')}
                </p>
              )}
            </div>

            {/* Warning Box */}
            {(batchStatus === 'warning' || batchStatus === 'expired') && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium text-[11px]">
                  <strong>Waktunya giling!</strong> Adonan mendekati batas masa pakai {activeBatch.estimated_days} hari.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
            <p className="text-xs text-slate-600 font-medium mb-2">
              Belum ada batch adonan aktif yang tercatat.
            </p>
            <button
              onClick={() => setActiveTab('batches')}
              className="px-3 py-1.5 bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold active:scale-95"
            >
              + Catat Batch Adonan Baru
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Buttons (Prinsip Jempol: Satu Tangan) */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
          Aksi Cepat Warung
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('sales')}
            className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 shadow-sm active:scale-90 transition-transform"
          >
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-slate-800 leading-tight">
              Tutup Toko
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 shadow-sm active:scale-90 transition-transform"
          >
            <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-slate-800 leading-tight">
              Catat Belanja
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 shadow-sm active:scale-90 transition-transform"
          >
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-slate-800 leading-tight">
              Giling Adonan
            </span>
          </button>
        </div>
      </div>

      {/* Today's Transactions Overview */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Belanja Hari Ini ({todayExpenses.length})
          </h4>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-black text-emerald-700 active:scale-95"
          >
            + Tambah
          </button>
        </div>

        {todayExpenses.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {todayExpenses.map((exp) => (
              <div key={exp.id} className="py-2 flex items-center justify-between text-xs">
                <div className="truncate mr-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold mr-1.5 ${
                    exp.category === 'MARKET'
                      ? 'bg-emerald-100 text-emerald-800'
                      : exp.category === 'ICE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {exp.category === 'MARKET' ? '🥬 Pasar' : exp.category === 'ICE' ? '🧊 Bahan Es' : '🔥 Lainnya'}
                  </span>
                  <span className="font-bold text-slate-700">{exp.item_name}</span>
                </div>
                <span className="font-black text-slate-900 shrink-0">{formatRupiah(exp.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2 font-medium">
            Belum ada catatan belanja untuk hari ini.
          </p>
        )}
      </div>

      {/* Rekap Banner */}
      <div 
        onClick={() => setActiveTab('reports')}
        className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-black text-xs">Rekap Laba Bersih Warung</h4>
            <p className="text-[10px] text-slate-300 font-medium">
              Hitung keuntungan bersih riil masuk kantong
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </div>
  );
}
