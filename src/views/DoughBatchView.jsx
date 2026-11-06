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
  Sparkles
} from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import IndonesianDatePicker from '../components/IndonesianDatePicker';
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

export default function DoughBatchView({ batches, onSaveBatch, onToggleBatchStatus, onDeleteBatch }) {
  const [grindDate, setGrindDate] = useState(getTodayDateString());
  const [estimatedDays, setEstimatedDays] = useState(3);
  
  // Dynamic customizable components with custom name and quantity/unit
  const [items, setItems] = useState([
    { id: generateUUID(), name: 'Daging Sapi / Tetelan', qty: '2 kg', cost: 0 },
    { id: generateUUID(), name: 'Bumbu, Tepung Premix & Es Batu', qty: '1 paket', cost: 0 },
    { id: generateUUID(), name: 'Ongkos Giling di Pasar', qty: '1 kali', cost: 0 },
    { id: generateUUID(), name: 'Biaya Lainnya (Bensin/Plastik)', qty: '', cost: 0 },
  ]);

  const [notes, setNotes] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const totalDoughCost = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

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

                  {/* Actions */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between">
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
    </div>
  );
}
