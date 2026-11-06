import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Printer, 
  FileSpreadsheet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  GlassWater,
  UtensilsCrossed
} from 'lucide-react';
import { 
  formatRupiah, 
  getTodayDateString, 
  formatDateIndonesian, 
  formatShortDate 
} from '../utils/formatters';
import IndonesianDatePicker from '../components/IndonesianDatePicker';

export default function ReportsView({ sales, expenses, batches }) {
  const today = getTodayDateString();
  const [filterPeriod, setFilterPeriod] = useState('7DAYS'); // 'TODAY' | '7DAYS' | 'THIS_MONTH' | 'CUSTOM'
  
  // Custom date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(today);

  const { effectiveStart, effectiveEnd } = useMemo(() => {
    const now = new Date();
    if (filterPeriod === 'TODAY') {
      return { effectiveStart: today, effectiveEnd: today };
    }
    if (filterPeriod === '7DAYS') {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { effectiveStart: d.toISOString().split('T')[0], effectiveEnd: today };
    }
    if (filterPeriod === 'THIS_MONTH') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      return { effectiveStart: start, effectiveEnd: today };
    }
    // CUSTOM
    return { effectiveStart: startDate, effectiveEnd: endDate };
  }, [filterPeriod, startDate, endDate, today]);

  // Filter datasets
  const periodSales = useMemo(() => {
    return sales.filter((s) => s.date >= effectiveStart && s.date <= effectiveEnd);
  }, [sales, effectiveStart, effectiveEnd]);

  const periodExpenses = useMemo(() => {
    return expenses.filter((e) => e.date >= effectiveStart && e.date <= effectiveEnd);
  }, [expenses, effectiveStart, effectiveEnd]);

  const periodBatches = useMemo(() => {
    return batches.filter((b) => b.grind_date >= effectiveStart && b.grind_date <= effectiveEnd);
  }, [batches, effectiveStart, effectiveEnd]);

  // Aggregate Totals
  const totalIncome = periodSales.reduce((sum, s) => sum + s.total_cash_income, 0);
  const totalBaksoIncome = periodSales.reduce((sum, s) => sum + (s.bakso_income !== undefined ? s.bakso_income : s.total_cash_income), 0);
  const totalIceIncome = periodSales.reduce((sum, s) => sum + (s.ice_income || 0), 0);
  const totalIceCups = periodSales.reduce((sum, s) => sum + (s.ice_cups_sold || 0), 0);

  const totalMarketExpense = periodExpenses
    .filter((e) => e.category === 'MARKET')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIceExpense = periodExpenses
    .filter((e) => e.category === 'ICE')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOperExpense = periodExpenses
    .filter((e) => e.category === 'OPERATIONAL')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDoughCost = periodBatches.reduce((sum, b) => sum + b.total_dough_cost, 0);

  const totalAllExpenses = totalMarketExpense + totalIceExpense + totalOperExpense + totalDoughCost;

  // Laba Bersih Riil = Omzet - (Pasar + Es + Operasional + Adonan)
  const netProfit = totalIncome - totalAllExpenses;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Laba Khusus Jualan Es
  const netIceProfit = totalIceIncome - totalIceExpense;

  // Daily Breakdown Map
  const dailyBreakdown = useMemo(() => {
    const map = {};

    periodSales.forEach((s) => {
      if (!map[s.date]) map[s.date] = { date: s.date, income: 0, bakso: 0, ice: 0, cups: 0, market: 0, iceExp: 0, oper: 0, dough: 0 };
      map[s.date].income += s.total_cash_income;
      map[s.date].bakso += (s.bakso_income !== undefined ? s.bakso_income : s.total_cash_income);
      map[s.date].ice += (s.ice_income || 0);
      map[s.date].cups += (s.ice_cups_sold || 0);
    });

    periodExpenses.forEach((e) => {
      if (!map[e.date]) map[e.date] = { date: e.date, income: 0, bakso: 0, ice: 0, cups: 0, market: 0, iceExp: 0, oper: 0, dough: 0 };
      if (e.category === 'MARKET') map[e.date].market += e.amount;
      else if (e.category === 'ICE') map[e.date].iceExp += e.amount;
      else map[e.date].oper += e.amount;
    });

    periodBatches.forEach((b) => {
      if (!map[b.grind_date]) map[b.grind_date] = { date: b.grind_date, income: 0, bakso: 0, ice: 0, cups: 0, market: 0, iceExp: 0, oper: 0, dough: 0 };
      map[b.grind_date].dough += b.total_dough_cost;
    });

    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [periodSales, periodExpenses, periodBatches]);

  const handleExportCSV = () => {
    let csv = 'Tanggal,Omzet Total,Omzet Bakso,Cup Es Terjual,Omzet Es,Belanja Pasar,Belanja Bahan Es,Belanja Operasional/Gas,Modal Adonan,Laba Harian\n';
    dailyBreakdown.forEach((row) => {
      const dailyExpenses = row.market + row.iceExp + row.oper + row.dough;
      const dailyNet = row.income - dailyExpenses;
      csv += `"${row.date}",${row.income},${row.bakso},${row.cups},${row.ice},${row.market},${row.iceExp},${row.oper},${row.dough},${dailyNet}\n`;
    });
    csv += `\n"TOTAL",${totalIncome},${totalBaksoIncome},${totalIceCups},${totalIceIncome},${totalMarketExpense},${totalIceExpense},${totalOperExpense},${totalDoughCost},${netProfit}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap_laba_bakso_es_${effectiveStart}_sd_${effectiveEnd}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Printable Report Header */}
      <div className="hidden print-only mb-6 text-center border-b pb-4">
        <h1 className="text-xl font-black">LAPORAN LABA BERSIH WARUNG BAKSO & ES JOSJIS</h1>
        <p className="text-xs text-slate-600">
          Periode: {formatDateIndonesian(effectiveStart, false)} s/d {formatDateIndonesian(effectiveEnd, false)}
        </p>
      </div>

      {/* Screen Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between no-print">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">Rekap Laba Bersih</h2>
            <p className="text-[11px] text-slate-500 font-medium">Laba riil bakso & penjualan es cup</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrint}
            className="p-2 bg-slate-100 text-slate-700 rounded-xl active:scale-90 transition-transform"
            title="Cetak PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl active:scale-90 transition-transform"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-sm no-print space-y-2">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-black">
          <button
            onClick={() => setFilterPeriod('TODAY')}
            className={`py-1.5 rounded-lg transition-all ${
              filterPeriod === 'TODAY'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setFilterPeriod('7DAYS')}
            className={`py-1.5 rounded-lg transition-all ${
              filterPeriod === '7DAYS'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setFilterPeriod('THIS_MONTH')}
            className={`py-1.5 rounded-lg transition-all ${
              filterPeriod === 'THIS_MONTH'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setFilterPeriod('CUSTOM')}
            className={`py-1.5 rounded-lg transition-all ${
              filterPeriod === 'CUSTOM'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Rentang
          </button>
        </div>

        {filterPeriod === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Dari:</span>
              <IndonesianDatePicker
                id="report-start-date"
                value={startDate}
                onChange={setStartDate}
                size="compact"
                accentColor="emerald"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Sampai:</span>
              <IndonesianDatePicker
                id="report-end-date"
                value={endDate}
                onChange={setEndDate}
                size="compact"
                accentColor="emerald"
              />
            </div>
          </div>
        )}
      </div>

      {/* Net Profit Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-emerald-900">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Total Laba Bersih Warung</span>
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-emerald-200">
              Margin {profitMargin}%
            </span>
          </div>

          <div className="text-3xl font-black tracking-tight text-white my-2">
            {formatRupiah(netProfit)}
          </div>

          <p className="text-[11px] text-slate-300 font-medium">
            Hasil bersih dari {periodSales.length} hari operasional ({formatDateIndonesian(effectiveStart, false)} s/d {formatDateIndonesian(effectiveEnd, false)})
          </p>
        </div>
      </div>

      {/* Split Cards: Omzet Bakso vs Omzet Es */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Omzet Bakso */}
        <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-sm space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-800">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Omzet Bakso</span>
          </div>
          <div className="text-base font-black text-slate-900 truncate">
            {formatRupiah(totalBaksoIncome)}
          </div>
          <p className="text-[10px] text-emerald-700 font-bold">
            Porsi makanan & mie
          </p>
        </div>

        {/* Omzet Es */}
        <div className="bg-white rounded-2xl p-3.5 border border-blue-200/80 shadow-sm space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-900">
            <GlassWater className="w-3.5 h-3.5 text-blue-600" />
            <span>Omzet Minuman Es</span>
          </div>
          <div className="text-base font-black text-blue-950 truncate">
            {formatRupiah(totalIceIncome)}
          </div>
          <p className="text-[10px] text-blue-700 font-extrabold">
            {totalIceCups} cup terjual
          </p>
        </div>
      </div>

      {/* Khusus Analisis Keuntungan Jualan Es */}
      <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
            <GlassWater className="w-4 h-4 text-blue-700" />
            <span>Kinerja Jualan Es ({totalIceCups} Cup)</span>
          </span>
          <span className="text-xs font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-lg">
            Untung Bersih Es: {formatRupiah(netIceProfit)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-blue-200/60">
          <div>
            <span className="text-[10px] text-blue-800 font-medium block">Total Jual Es:</span>
            <span className="font-extrabold text-blue-950">{formatRupiah(totalIceIncome)}</span>
          </div>
          <div>
            <span className="text-[10px] text-blue-800 font-medium block">Belanja Bahan Es:</span>
            <span className="font-extrabold text-rose-700">{formatRupiah(totalIceExpense)}</span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Details */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
          Rincian Seluruh Pos Pengeluaran ({formatRupiah(totalAllExpenses)})
        </h3>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <strong className="text-slate-800 text-xs">Belanja Pasar Harian</strong>
            </div>
            <span className="font-black text-slate-900">{formatRupiah(totalMarketExpense)}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <strong className="text-slate-800 text-xs">Belanja Bahan Es & Minuman</strong>
            </div>
            <span className="font-black text-slate-900">{formatRupiah(totalIceExpense)}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <strong className="text-slate-800 text-xs">Gas & Operasional Warung</strong>
            </div>
            <span className="font-black text-slate-900">{formatRupiah(totalOperExpense)}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <strong className="text-slate-800 text-xs">Modal Batch Adonan ({periodBatches.length}x)</strong>
            </div>
            <span className="font-black text-slate-900">{formatRupiah(totalDoughCost)}</span>
          </div>
        </div>
      </div>

      {/* Daily Breakdown List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <h3 className="font-extrabold text-slate-800 text-sm">
          Rincian Harian
        </h3>

        {dailyBreakdown.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {dailyBreakdown.map((row) => {
              const dailyExpense = row.market + row.iceExp + row.oper + row.dough;
              const dailyNet = row.income - dailyExpense;

              return (
                <div key={row.date} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-slate-900 block">
                      {formatShortDate(row.date)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Bakso: {formatRupiah(row.bakso)} • Es: {formatRupiah(row.ice)} ({row.cups} cup)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-sm block ${
                      dailyNet >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {formatRupiah(dailyNet)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Laba Harian</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4 font-medium">
            Belum ada transaksi di rentang tanggal ini.
          </p>
        )}
      </div>
    </div>
  );
}
