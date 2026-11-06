import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Sparkles, 
  X, 
  Cloud, 
  RefreshCw 
} from 'lucide-react';
import { 
  exportDataAsJSON, 
  importDataFromJSON, 
  clearAllData, 
  generateDemoData,
  fetchServerData,
  syncAllToServer,
  saveStoredData,
  STORAGE_KEYS
} from '../services/storage';

export default function Navbar({ onDataUpdated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch server data
      const serverData = await fetchServerData();
      if (serverData) {
        if (serverData.sales?.length || serverData.expenses?.length || serverData.batches?.length) {
          saveStoredData(STORAGE_KEYS.SALES, serverData.sales || []);
          saveStoredData(STORAGE_KEYS.EXPENSES, serverData.expenses || []);
          saveStoredData(STORAGE_KEYS.BATCHES, serverData.batches || []);
          if (onDataUpdated) onDataUpdated();
          showNotice('✅ Data berhasil disinkronkan dari server!');
        } else {
          // Server empty, upload local data
          const pushRes = await syncAllToServer({});
          if (pushRes.success) {
            showNotice('✅ Data lokal berhasil diunggah ke database server!');
          } else {
            showNotice('⚠️ Server terhubung tapi gagal menyimpan.', true);
          }
        }
      } else {
        showNotice('⚠️ Tidak dapat terhubung ke /api/data server.', true);
      }
    } catch (err) {
      showNotice('Gagal sinkron: ' + err.message, true);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `backup_bakso_josjis_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('Backup berhasil didownload!');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importDataFromJSON(content);
        if (result.success) {
          showNotice('Data cadangan berhasil dipulihkan!');
          onDataUpdated();
        } else {
          showNotice('Gagal memulihkan file: ' + result.error, true);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemo = () => {
    if (window.confirm('Muat data sampel warung bakso 7 hari terakhir? Data lama akan ditimpa.')) {
      generateDemoData();
      showNotice('Data demo warung bakso berhasil dimuat!');
      onDataUpdated();
      setIsModalOpen(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('PERINGATAN: Semua data penjualan, pengeluaran, dan adonan akan dihapus. Yakin?')) {
      clearAllData();
      showNotice('Semua data berhasil dibersihkan.');
      onDataUpdated();
      setIsModalOpen(false);
    }
  };

  const showNotice = (msg, isError = false) => {
    setMessage({ text: msg, isError });
    setTimeout(() => setMessage(null), 3500);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md no-print pt-[max(env(safe-area-inset-top),6px)]">
        <div className="w-full px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xl shadow-inner select-none">
              🍜
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none flex items-center gap-1.5">
                <span>Bakso Josjis</span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-900/90 text-amber-300 border border-emerald-700/80">
                  Mobile
                </span>
              </h1>
              <p className="text-[11px] text-emerald-200 font-medium mt-0.5">Buku Kas & Modal Adonan</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-700/90 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 border border-emerald-600 active:scale-95 transition-transform"
              title="Kelola Data & Cadangan"
            >
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span>Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Alert Notice */}
      {message && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-[380px]">
          <div
            className={`p-3 rounded-2xl shadow-2xl text-center text-xs font-bold border animate-in fade-in slide-in-from-top-2 duration-200 ${
              message.isError
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-emerald-900 text-emerald-100 border-emerald-700'
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* Backup & Settings Modal - Bottom sheet feel on mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] shadow-2xl overflow-hidden border-t border-slate-200 pb-[max(env(safe-area-inset-bottom),16px)] animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-slate-800 text-base">Kelola Cadangan Data</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 bg-slate-200/60 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {/* Cloud Server Sync Button (Solusi Pindah Device Data Hilang) */}
              <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                    <Cloud className="w-4 h-4 text-emerald-700" />
                    <span>Sinkronisasi Cloud Server</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    Antar Device
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                  Gunakan tombol ini agar data yang Anda input di HP langsung tersimpan di server dan otomatis muncul saat dibuka di laptop / HP lain.
                </p>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full min-h-[42px] py-2.5 px-3 rounded-xl bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-emerald-700/20 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menghubungi Server...' : '⚡ Sinkronkan Data Sekarang'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Selain tersimpan di server, data juga dicadangkan di memori lokal. Anda juga bisa mengunduh file cadangan mandiri:
              </p>

              {/* Download Backup */}
              <button
                onClick={handleExport}
                className="w-full min-h-[46px] py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center justify-between active:scale-98 transition-transform"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Download Backup (JSON)</span>
                </div>
                <span className="text-[10px] bg-emerald-200/90 text-emerald-900 px-2 py-0.5 rounded font-extrabold">Simpan</span>
              </button>

              {/* Restore Backup */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[46px] py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-between active:scale-98 transition-transform"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Pulihkan Data dari File Cadangan</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-extrabold">Upload</span>
              </button>

              <hr className="my-2 border-slate-200" />

              {/* Load Demo Data */}
              <button
                onClick={handleLoadDemo}
                className="w-full min-h-[46px] py-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-bold text-xs flex items-center justify-between active:scale-98 transition-transform"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Isi Data Sampel Warung (7 Hari Demo)</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-extrabold">Demo</span>
              </button>

              {/* Clear Data */}
              <button
                onClick={handleClear}
                className="w-full min-h-[46px] py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-between active:scale-98 transition-transform"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Hapus Bersih Semua Data</span>
                </div>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-extrabold">Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
