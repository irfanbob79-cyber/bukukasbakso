import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Flame, 
  Plus, 
  Trash2, 
  Scale, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import CurrencyInput from './CurrencyInput';
import IndonesianDatePicker from './IndonesianDatePicker';
import { formatRupiah, generateUUID } from '../utils/formatters';

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

export default function EditBatchModal({ isOpen, batch, onClose, onSave }) {
  if (!isOpen || !batch) return null;

  // Initialize form state from existing batch
  const [grindDate, setGrindDate] = useState(batch.grind_date || '');
  const [estimatedDays, setEstimatedDays] = useState(batch.estimated_days || 3);
  const [isCompleted, setIsCompleted] = useState(Boolean(batch.is_completed));
  const [notes, setNotes] = useState(batch.notes || '');

  // Normalize items array
  const initialItems = (batch.items && batch.items.length > 0)
    ? batch.items.map(it => ({
        id: it.id || generateUUID(),
        name: it.name || 'Bahan Adonan',
        qty: it.qty || '',
        cost: Number(it.cost) || 0
      }))
    : [
        { id: generateUUID(), name: 'Daging Sapi / Tetelan', qty: '2 kg', cost: Number(batch.meat_cost) || 0 },
        { id: generateUUID(), name: 'Bumbu, Tepung Premix & Es', qty: '1 paket', cost: Number(batch.seasoning_flour_cost) || 0 },
        { id: generateUUID(), name: 'Ongkos Giling di Pasar', qty: '1 kali', cost: Number(batch.grinding_fee) || 0 },
        { id: generateUUID(), name: 'Biaya Lainnya', qty: '', cost: Number(batch.other_cost) || 0 }
      ];

  const [items, setItems] = useState(initialItems);

  const totalDoughCost = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

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
      alert('Total modal adonan tidak boleh Rp 0!');
      return;
    }

    const meatItem = items.find(i => /daging|tetelan|ayam/i.test(i.name));
    const flourItem = items.find(i => /bumbu|tepung|premix|es/i.test(i.name));
    const grindItem = items.find(i => /giling/i.test(i.name));

    const updatedBatch = {
      ...batch,
      grind_date: grindDate,
      estimated_days: Number(estimatedDays),
      is_completed: isCompleted,
      items: items.map(i => ({
        id: i.id,
        name: i.name.trim() || 'Bahan Adonan',
        qty: (i.qty || '').trim(),
        cost: Number(i.cost) || 0
      })),
      meat_cost: meatItem ? Number(meatItem.cost) || 0 : (Number(items[0]?.cost) || 0),
      seasoning_flour_cost: flourItem ? Number(flourItem.cost) || 0 : (Number(items[1]?.cost) || 0),
      grinding_fee: grindItem ? Number(grindItem.cost) || 0 : (Number(items[2]?.cost) || 0),
      other_cost: Number(items[3]?.cost) || 0,
      total_dough_cost: totalDoughCost,
      notes: notes.trim(),
      updated_at: new Date().toISOString()
    };

    onSave(updatedBatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-[430px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-black">Ubah Batch Adonan #{batch.batch_number}</h3>
              <p className="text-[10px] text-amber-100 font-medium">Koreksi rincian nama bahan, satuan, harga atau catatan</p>
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
          {/* Tanggal Giling (Indonesian Format) */}
          <div>
            <IndonesianDatePicker
              id="edit-grind-date"
              label="Tanggal Giling Adonan"
              value={grindDate}
              onChange={setGrindDate}
              accentColor="amber"
            />
          </div>

          {/* Estimasi Masa Pakai */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Estimasi Masa Pakai
            </label>
            <select
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-800 focus:border-amber-600 outline-none"
            >
              <option value={2}>2 Hari (Warung Sangat Ramai)</option>
              <option value={3}>3 Hari (Standar Umum Warung)</option>
              <option value={4}>4 Hari (Warung Santai)</option>
              <option value={5}>5 Hari (Porsi Besar/Kulkas Freezer)</option>
            </select>
          </div>

          {/* Status Batch */}
          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-slate-800 block">Status Adonan</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {isCompleted ? 'Adonan ini sudah ditandai HABIS/SELESAI' : 'Adonan ini masih AKTIF digunakan di warung'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCompleted(!isCompleted)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                !isCompleted ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {!isCompleted ? '✓ Aktif' : 'Habis'}
            </button>
          </div>

          {/* Dynamic Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Rincian Bahan, Satuan & Harga:</span>
              </label>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="text-[11px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase">
                    Rincian #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 active:scale-90"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Nama Bahan & Satuan (Side-by-side) */}
                <div className="grid grid-cols-12 gap-1.5">
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      placeholder="Nama bahan / biaya"
                      className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.qty}
                      onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                      placeholder="Satuan: 2 kg"
                      className="w-full px-2 py-1.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-amber-900 placeholder-slate-400 focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>

                {/* Nominal Biaya */}
                <CurrencyInput
                  value={item.cost}
                  onChange={(val) => handleUpdateItem(item.id, 'cost', val)}
                  placeholder="0"
                  size="normal"
                  showQuickChips={true}
                />
              </div>
            ))}
          </div>

          {/* Quick Preset Buttons */}
          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-amber-900 uppercase block">
              + Tambah Cepat Bahan Umum:
            </span>
            <div className="flex flex-wrap gap-1">
              {PRESET_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleAddItem(name, name.toLowerCase().includes('daging') ? '2 kg' : '')}
                  className="px-2 py-1 bg-white border border-amber-300 text-[10px] font-bold text-amber-900 rounded-lg active:scale-95 shadow-2xs"
                >
                  +{name}
                </button>
              ))}
            </div>
          </div>

          {/* Total Modal Box */}
          <div className="p-3 bg-amber-100/80 rounded-2xl border border-amber-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase block">Total Modal Adonan Baru:</span>
              <span className="text-base font-black text-amber-950">{formatRupiah(totalDoughCost)}</span>
            </div>
          </div>

          {/* Catatan Textarea */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Catatan Adonan
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Daging sapi paha 3kg + tetelan 1kg giling agak kasar..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-amber-600 outline-none resize-none leading-relaxed"
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
              className="flex-2 py-3 px-4 bg-amber-600 active:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/30 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Adonan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
