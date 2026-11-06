import React, { useState } from 'react';
import { 
  Flame, 
  Calendar, 
  Clock, 
  Save, 
  CheckCircle2, 
  Trash2, 
  Check,
  Plus,
  Scale,
  Sparkles,
  Edit3,
  Utensils,
  TrendingUp,
  CircleDot
} from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import IndonesianDatePicker from '../components/IndonesianDatePicker';
import EditBatchModal from '../components/EditBatchModal';
import { 
  formatRupiah, 
  getTodayDateString, 
  formatDateIndonesian, 
  calculateDaysBetween,
  generateUUID 
} from '../utils/formatters';

const DEFAULT_ITEMS = [
  { id: '1', name: 'Daging Sapi / Tetelan', qty: '2 kg', cost: 0 },
  { id: '2', name: 'Bumbu, Tepung Premix & Es', qty: '1 paket', cost: 0 },
  { id: '3', name: 'Ongkos Giling di Pasar', qty: '1 kali', cost: 0 },
  { id: '4', name: 'Biaya Lainnya (Bensin/Plastik)', qty: '', cost: 0 },
];

const PRESET_NAMES = [
  'Daging Sapi',
  'Tetelan Sapi',
  'Daging Ayam',
  'Bumbu & Tepung',
  'Ongkos Giling',
  'Es Batu Adonan',
  'Bawang Goreng Adonan'
];

const PRESET_UNITS = ['1 kg', '2 kg', '3 kg', '4 kg', '5 kg', '500 gr'];

export const PRESET_BAKSO_TYPES = [
  { name: 'Bakso Biasa / Halus', defaultPrice: 3000 },
  { name: 'Bakso Urat', defaultPrice: 5000 },
  { name: 'Bakso Mercon', defaultPrice: 10000 },
  { name: 'Bakso Keju', defaultPrice: 10000 },
  { name: 'Bakso Telur Puyuh', defaultPrice: 5000 },
  { name: 'Tahu Bakso', defaultPrice: 3000 },
  { name: 'Bakso Beranak / Jumbo', defaultPrice: 20000 }
];

export default function DoughBatchView({ 
  batches, 
  onSaveBatch, 
  onUpdateBatch, 
  onToggleBatchStatus, 
  onDeleteBatch 
}) {
  const [grindDate, setGrindDate] = useState(getTodayDateString());
  const [estimatedDays, setEstimatedDays] = useState(3);
  const [editingBatch, setEditingBatch] = useState(null);
  
  // Dynamic customizable components with custom name and quantity/unit
  const [items, setItems] = useState([
    { id: generateUUID(), name: 'Daging Sapi / Tetelan', qty: '2 kg', cost: 0 },
    { id: generateUUID(), name: 'Bumbu, Tepung Premix & Es Batu', qty: '1 paket', cost: 0 },
    { id: generateUUID(), name: 'Ongkos Giling di Pasar', qty: '1 kali', cost: 0 },
    { id: generateUUID(), name: 'Biaya Lainnya (Bensin/Plastik)', qty: '', cost: 0 },
  ]);

  // Hasil Cetak Bakso & Estimasi Omzet
  const [yieldItems, setYieldItems] = useState([
    { id: generateUUID(), name: 'Bakso Biasa / Halus', qty: 50, price_per_unit: 3000 },
    { id: generateUUID(), name: 'Bakso Mercon', qty: 10, price_per_unit: 10000 },
    { id: generateUUID(), name: 'Bakso Keju', qty: 10, price_per_unit: 10000 },
  ]);

  const [notes, setNotes] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const totalDoughCost = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

  // Perhitungan Hasil Cetak Bakso & Estimasi Pendapatan
  const totalBallsMolded = yieldItems.reduce((sum, y) => sum + (Number(y.qty) || 0), 0);
  const totalProjectedRevenue = yieldItems.reduce(
    (sum, y) => sum + ((Number(y.qty) || 0) * (Number(y.price_per_unit) || 0)),
    0
  );
  const projectedGrossProfit = totalProjectedRevenue - totalDoughCost;
  const profitMarginPercent = totalProjectedRevenue > 0
    ? Math.round((projectedGrossProfit / totalProjectedRevenue) * 100)
    : 0;

  const nextBatchNumber = batches.length > 0 
    ? Math.max(...batches.map(b => b.batch_number || 0)) + 1 
    : 1;

  const handleUpdateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItem = (presetName = '', presetQty = '') => {
    setItems((prev) => [
      ...prev,
      { id: generateUUID(), name: presetName || 'Bahan / Biaya Baru', qty: presetQty, cost: 0 }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      alert('Minimal harus ada 1 rincian bahan dalam adonan!');
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Yield items handlers
  const handleUpdateYieldItem = (id, field, value) => {
    setYieldItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddYieldItem = (name = 'Bakso Baru', qty = 10, price = 5000) => {
    setYieldItems((prev) => [
      ...prev,
      { id: generateUUID(), name, qty, price_per_unit: price }
    ]);
  };

  const handleRemoveYieldItem = (id) => {
    if (yieldItems.length <= 1) {
      alert('Minimal harus ada 1 jenis bakso dicetak!');
      return;
    }
    setYieldItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalDoughCost <= 0) {
      alert('Total modal adonan tidak boleh Rp 0! Masukkan rincian nominal belanja daging atau penggilingan.');
      return;
    }

    // Categorize costs for summary backwards compatibility
    const meatItem = items.find(i => /daging|tetelan|ayam/i.test(i.name));
    const flourItem = items.find(i => /bumbu|tepung|premix|es/i.test(i.name));
    const grindItem = items.find(i => /giling/i.test(i.name));

    const newBatch = {
      id: generateUUID(),
      batch_number: nextBatchNumber,
      grind_date: grindDate,
      estimated_days: Number(estimatedDays),
      // Store full dynamic items with custom name and unit/quantity
      items: items.map(i => ({
        id: i.id,
        name: i.name.trim() || 'Bahan Adonan',
        qty: i.qty.trim(),
        cost: Number(i.cost) || 0
      })),
      // Hasil Cetak Bakso & Estimasi Omzet
      yield_items: yieldItems.map(y => ({
        id: y.id,
        name: y.name.trim() || 'Bakso',
        qty: Number(y.qty) || 0,
        price_per_unit: Number(y.price_per_unit) || 0,
        subtotal: (Number(y.qty) || 0) * (Number(y.price_per_unit) || 0)
      })),
      total_yield_balls: totalBallsMolded,
      total_projected_revenue: totalProjectedRevenue,
      projected_profit: projectedGrossProfit,
      profit_margin_percent: profitMarginPercent,
      meat_cost: meatItem ? Number(meatItem.cost) || 0 : (Number(items[0]?.cost) || 0),
      seasoning_flour_cost: flourItem ? Number(flourItem.cost) || 0 : (Number(items[1]?.cost) || 0),
      grinding_fee: grindItem ? Number(grindItem.cost) || 0 : (Number(items[2]?.cost) || 0),
      other_cost: Number(items[3]?.cost) || 0,
      total_dough_cost: totalDoughCost,
      notes: notes.trim(),
      is_completed: false,
      created_at: new Date().toISOString()
    };

    onSaveBatch(newBatch);

    // Reset inputs
    setItems([
      { id: generateUUID(), name: 'Daging Sapi / Tetelan', qty: '2 kg', cost: 0 },
      { id: generateUUID(), name: 'Bumbu, Tepung Premix & Es Batu', qty: '1 paket', cost: 0 },
      { id: generateUUID(), name: 'Ongkos Giling di Pasar', qty: '1 kali', cost: 0 },
      { id: generateUUID(), name: 'Biaya Lainnya (Bensin/Plastik)', qty: '', cost: 0 },
    ]);
    setYieldItems([
      { id: generateUUID(), name: 'Bakso Biasa / Halus', qty: 50, price_per_unit: 3000 },
      { id: generateUUID(), name: 'Bakso Mercon', qty: 10, price_per_unit: 10000 },
      { id: generateUUID(), name: 'Bakso Keju', qty: 10, price_per_unit: 10000 },
    ]);
    setNotes('');

    setSuccessNotice(`Batch Adonan #${nextBatchNumber} berhasil dicatat!`);
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  const today = getTodayDateString();

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">Batch Adonan Bakso</h2>
            <p className="text-[11px] text-slate-500 font-medium">Modal gilingan berkala & satuan bahan</p>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Input Batch Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl">
            Buat Batch #{nextBatchNumber}
          </span>
          <span className="text-[11px] text-slate-500 font-bold">
            Dialokasikan {estimatedDays} Hari
          </span>
        </div>

        {/* Date and Estimated Days */}
        <div className="space-y-2.5">
          <div>
            <IndonesianDatePicker
              id="batch-grind-date"
              label="Tanggal Pembuatan / Giling (Hari-Bulan-Tahun)"
              value={grindDate}
              onChange={setGrindDate}
              accentColor="amber"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Estimasi Masa Pakai Adonan
            </label>
            <select
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-slate-800 text-sm focus:border-amber-600 outline-none bg-white"
            >
              <option value={2}>2 Hari (Ramai / Cepat Habis)</option>
              <option value={3}>3 Hari (Standar Umum Warung)</option>
              <option value={4}>4 Hari (Porsi Besar / Hari Kerja)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Customizable Cost & Quantity Breakdown */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Rincian Bahan & Biaya ({items.length})
            </span>
            <button
              type="button"
              onClick={() => handleAddItem()}
              className="text-xs font-black text-amber-700 active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tambah Bahan</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 relative"
              >
                {/* Header item */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                    Rincian #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 active:scale-90 transition-transform"
                      title="Hapus rincian ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 1. Nama Rincian (Bisa Custom Sendiri) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nama Rincian (Bisa Diedit Bebas):
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    placeholder="Contoh: Daging Sapi Has Luar"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                  />
                  {/* Preset chips for quick renaming */}
                  <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar py-0.5">
                    {PRESET_NAMES.map((pName) => (
                      <button
                        key={pName}
                        type="button"
                        onClick={() => handleUpdateItem(item.id, 'name', pName)}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white border border-slate-200 text-slate-600 hover:text-amber-800 shrink-0 active:scale-90"
                      >
                        {pName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Satuan / Takaran (misal: 2 kg, 4 kg) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                    <span>Satuan / Takaran (Contoh: 2 kg, 500 gr, 1 paket):</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={item.qty}
                      onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                      placeholder="Contoh: 2 kg"
                      className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-black text-slate-900 focus:border-amber-600 outline-none"
                    />
                  </div>
                  {/* Quick unit chips */}
                  <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar py-0.5">
                    {PRESET_UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => handleUpdateItem(item.id, 'qty', u)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-900 border border-amber-200 shrink-0 active:scale-90"
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Total Biaya (Rp) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Total Biaya (Rp):
                  </label>
                  <CurrencyInput
                    value={item.cost}
                    onChange={(newCost) => handleUpdateItem(item.id, 'cost', newCost)}
                    placeholder="0"
                    showQuickChips={index < 2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HASIL CETAK BAKSO & ESTIMASI OMZET (Point Revisi) */}
        <div className="p-4 bg-amber-500/10 border-2 border-amber-400/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs uppercase tracking-wider">
                <Utensils className="w-4 h-4 text-amber-700" />
                <span>Hasil Cetak Bakso & Potensi Omzet</span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium">
                Catat hasil butir bakso dicetak & estimasi harga jualnya
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddYieldItem('Bakso Baru', 10, 5000)}
              className="text-xs font-black text-amber-800 bg-white border border-amber-300 px-2.5 py-1 rounded-xl shadow-2xs active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Varian</span>
            </button>
          </div>

          {/* Quick preset chips to add variants */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {PRESET_BAKSO_TYPES.map((bt) => (
              <button
                key={bt.name}
                type="button"
                onClick={() => handleAddYieldItem(bt.name, 10, bt.defaultPrice)}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white border border-amber-300 text-amber-900 shrink-0 active:scale-95 shadow-2xs"
              >
                +{bt.name}
              </button>
            ))}
          </div>

          {/* Yield items rows */}
          <div className="space-y-2.5">
            {yieldItems.map((y, idx) => (
              <div 
                key={y.id}
                className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-900 uppercase">
                    Varian #{idx + 1}
                  </span>
                  {yieldItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveYieldItem(y.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Varian Name */}
                <input
                  type="text"
                  value={y.name}
                  onChange={(e) => handleUpdateYieldItem(y.id, 'name', e.target.value)}
                  placeholder="Nama Bakso (contoh: Bakso Mercon, Bakso Keju, Bakso Biasa)"
                  className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                />

                {/* Qty & Price per unit */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Jumlah Cetak:
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={y.qty || ''}
                        onChange={(e) => handleUpdateYieldItem(y.id, 'qty', Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full text-xs font-black text-slate-900 bg-transparent outline-none"
                      />
                      <span className="text-[10px] text-slate-500 font-bold ml-1">butir</span>
                    </div>
                  </div>

                  <div className="col-span-7">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Estimasi Harga / Butir:
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Rp</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="500"
                        value={y.price_per_unit || ''}
                        onChange={(e) => handleUpdateYieldItem(y.id, 'price_per_unit', Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full text-xs font-black text-slate-900 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtotal per varian */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-semibold">Estimasi Omzet:</span>
                  <span className="font-black text-amber-900">
                    {formatRupiah((Number(y.qty) || 0) * (Number(y.price_per_unit) || 0))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Projection Calculation Box */}
          <div className="p-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl shadow-md space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-100">Total Butir Bakso Dicetak:</span>
              <span className="font-black text-sm">{totalBallsMolded} Butir</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-100">Estimasi Potensi Omzet:</span>
              <span className="font-black text-base text-amber-200">{formatRupiah(totalProjectedRevenue)}</span>
            </div>
            <div className="pt-1.5 border-t border-amber-500/60 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-200">Estimasi Keuntungan Kotor:</span>
              <span className="font-black text-sm text-emerald-300">
                {projectedGrossProfit >= 0 ? `+${formatRupiah(projectedGrossProfit)}` : formatRupiah(projectedGrossProfit)}
                {profitMarginPercent > 0 && ` (${profitMarginPercent}% Margin)`}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Textbox Catatan Diperluas Menjadi Textarea */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
            Catatan Batch (Opsional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Daging sapi 2 kg + tetelan gurih 500 gr. Persiapan stok akhir pekan yang ramai."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-amber-600 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Total Cost Display */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-xs font-extrabold text-amber-900 block">Total Modal Adonan:</span>
            <span className="text-[10px] text-amber-700 font-bold">
              ~{formatRupiah(Math.round(totalDoughCost / (estimatedDays || 1)))} / hari
            </span>
          </div>
          <span className="text-xl font-black text-amber-950">{formatRupiah(totalDoughCost)}</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full min-h-[48px] py-3 px-4 bg-amber-600 active:bg-amber-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-98 transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Simpan Batch Adonan ({formatRupiah(totalDoughCost)})</span>
        </button>
      </form>

      {/* Batch History List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-extrabold text-slate-800 text-sm">
          Riwayat Batch Adonan ({batches.length})
        </h3>

        {batches.length > 0 ? (
          <div className="space-y-3">
            {[...batches].reverse().map((b) => {
              const daysPassed = calculateDaysBetween(b.grind_date, today);
              const dayIndex = Math.max(1, daysPassed + 1);

              return (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    !b.is_completed
                      ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-slate-900 text-sm">
                          Batch #{b.batch_number}
                        </span>
                        {!b.is_completed ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Aktif (Hari ke-{dayIndex} dari {b.estimated_days})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 text-slate-700">
                            Selesai / Habis
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Giling: {formatDateIndonesian(b.grind_date, false)}
                      </p>
                      {b.notes && (
                        <p className="text-xs text-slate-600 italic mt-1 font-medium bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                          "{b.notes}"
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-amber-950">
                        {formatRupiah(b.total_dough_cost)}
                      </div>
                    </div>
                  </div>

                  {/* Component Breakdown Pills (Supports new dynamic items or legacy items) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1">
                    {b.items && b.items.length > 0 ? (
                      <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-700">
                        {b.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white/60 px-2 py-1 rounded-lg border border-slate-100">
                            <span>
                              <strong>{it.name}</strong> {it.qty && <span className="text-amber-800 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded text-[10px]">({it.qty})</span>}
                            </span>
                            <span className="font-black text-slate-900">{formatRupiah(it.cost)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                        <div>🥩 Daging: <strong className="text-slate-800 font-black">{formatRupiah(b.meat_cost)}</strong></div>
                        <div>🧂 Bumbu: <strong className="text-slate-800 font-black">{formatRupiah(b.seasoning_flour_cost)}</strong></div>
                        <div>⚙️ Giling: <strong className="text-slate-800 font-black">{formatRupiah(b.grinding_fee ?? b.grindingFee)}</strong></div>
                        <div>📦 Lainnya: <strong className="text-slate-800 font-black">{formatRupiah(b.other_cost)}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Yield Breakdown (Hasil Cetak Bakso & Estimasi Omzet) */}
                  {b.yield_items && b.yield_items.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 bg-amber-50/60 p-2.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-amber-700" />
                          <span>Hasil Cetak ({b.total_yield_balls || b.yield_items.reduce((s, y) => s + (y.qty||0), 0)} Butir)</span>
                        </span>
                        <span className="font-black text-amber-900 text-xs">
                          Potensi Omzet: {formatRupiah(b.total_projected_revenue || 0)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {b.yield_items.map((y, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[10px] font-bold text-slate-800 shadow-2xs"
                          >
                            <strong>{y.name}</strong>: {y.qty} btr {y.price_per_unit ? `@${formatRupiah(y.price_per_unit)}` : ''}
                          </span>
                        ))}
                      </div>
                      {b.projected_profit !== undefined && (
                        <div className="text-[10px] font-bold text-emerald-800 pt-0.5 flex items-center justify-between">
                          <span>Potensi Untung Kotor Adonan:</span>
                          <span className="font-black text-emerald-700">
                            {b.projected_profit >= 0 ? `+${formatRupiah(b.projected_profit)}` : formatRupiah(b.projected_profit)}
                            {b.profit_margin_percent ? ` (${b.profit_margin_percent}%)` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingBatch(b)}
                        className="text-xs font-black px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Ubah Rincian</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleBatchStatus(b.id)}
                        className={`text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 transition-all ${
                          !b.is_completed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{!b.is_completed ? 'Tandai Habis' : 'Aktifkan'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus catatan Batch #${b.batch_number}?`)) {
                          onDeleteBatch(b.id);
                        }
                      }}
                      className="text-xs text-rose-600 p-1.5 rounded-lg active:scale-90 transition-transform flex items-center gap-1"
                      title="Hapus batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4 font-medium">
            Belum ada catatan batch adonan.
          </p>
        )}
      </div>

      {/* Edit Modal */}
      <EditBatchModal
        isOpen={Boolean(editingBatch)}
        batch={editingBatch}
        onClose={() => setEditingBatch(null)}
        onSave={(updated) => {
          if (onUpdateBatch) onUpdateBatch(updated);
          setEditingBatch(null);
        }}
      />
    </div>
  );
}
