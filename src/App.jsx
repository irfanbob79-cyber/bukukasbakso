import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import DashboardView from './views/DashboardView';
import SalesView from './views/SalesView';
import ExpensesView from './views/ExpensesView';
import DoughBatchView from './views/DoughBatchView';
import HistoryView from './views/HistoryView';
import ReportsView from './views/ReportsView';
import { 
  getStoredData, 
  saveStoredData, 
  STORAGE_KEYS
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Clean empty state on first launch (no auto-seeding)
  const [sales, setSales] = useState(() => {
    try {
      const s = getStoredData(STORAGE_KEYS.SALES, []);
      return Array.isArray(s) ? s : [];
    } catch (err) {
      console.error('Error init sales', err);
      return [];
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const e = getStoredData(STORAGE_KEYS.EXPENSES, []);
      return Array.isArray(e) ? e : [];
    } catch (err) {
      console.error('Error init expenses', err);
      return [];
    }
  });

  const [batches, setBatches] = useState(() => {
    try {
      const b = getStoredData(STORAGE_KEYS.BATCHES, []);
      return Array.isArray(b) ? b : [];
    } catch (err) {
      console.error('Error init batches', err);
      return [];
    }
  });

  // Reload data from storage
  const reloadData = () => {
    try {
      const loadedSales = getStoredData(STORAGE_KEYS.SALES, []);
      const loadedExpenses = getStoredData(STORAGE_KEYS.EXPENSES, []);
      const loadedBatches = getStoredData(STORAGE_KEYS.BATCHES, []);

      setSales(Array.isArray(loadedSales) ? loadedSales : []);
      setExpenses(Array.isArray(loadedExpenses) ? loadedExpenses : []);
      setBatches(Array.isArray(loadedBatches) ? loadedBatches : []);
    } catch (err) {
      console.error('Error reloading data', err);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Handlers for Sales
  const handleSaveSale = (saleData) => {
    const updated = (sales || []).filter((s) => s.date !== saleData.date);
    const newSales = [...updated, saleData];
    setSales(newSales);
    saveStoredData(STORAGE_KEYS.SALES, newSales);
  };

  const handleDeleteSale = (saleId) => {
    const newSales = (sales || []).filter((s) => s.id !== saleId);
    setSales(newSales);
    saveStoredData(STORAGE_KEYS.SALES, newSales);
  };

  // Handlers for Expenses
  const handleSaveExpenses = (newExpenses) => {
    const updated = [...(expenses || []), ...newExpenses];
    setExpenses(updated);
    saveStoredData(STORAGE_KEYS.EXPENSES, updated);
  };

  const handleDeleteExpense = (expenseId) => {
    const updated = (expenses || []).filter((e) => e.id !== expenseId);
    setExpenses(updated);
    saveStoredData(STORAGE_KEYS.EXPENSES, updated);
  };

  // Handlers for Dough Batches
  const handleSaveBatch = (newBatch) => {
    const updated = [...(batches || []), newBatch];
    setBatches(updated);
    saveStoredData(STORAGE_KEYS.BATCHES, updated);
  };

  const handleToggleBatchStatus = (batchId) => {
    const updated = (batches || []).map((b) =>
      b.id === batchId ? { ...b, is_completed: !b.is_completed } : b
    );
    setBatches(updated);
    saveStoredData(STORAGE_KEYS.BATCHES, updated);
  };

  const handleDeleteBatch = (batchId) => {
    const updated = (batches || []).filter((b) => b.id !== batchId);
    setBatches(updated);
    saveStoredData(STORAGE_KEYS.BATCHES, updated);
  };

  const isHistoryOrReports = activeTab === 'history' || activeTab === 'reports';

  return (
    // Outer container: On desktop, provides a neutral backdrop; on mobile, takes 100% viewport
    <div className="min-h-screen bg-slate-900 flex justify-center items-stretch selection:bg-emerald-500 selection:text-white">
      {/* Mobile App Shell (Fixed 100% on Mobile, Max 430px on desktop simulation) */}
      <div className="w-full max-w-[430px] min-h-screen bg-slate-50 flex flex-col justify-between relative shadow-2xl overflow-x-hidden border-x border-slate-200/40">
        
        {/* Top Header with iOS/Android safe area support */}
        <Navbar onDataUpdated={reloadData} />

        {/* Scrollable View Area */}
        <main className="flex-1 px-4 pt-3 pb-24 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              sales={sales || []}
              expenses={expenses || []}
              batches={batches || []}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              sales={sales || []}
              onSaveSale={handleSaveSale}
              onDeleteSale={handleDeleteSale}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses || []}
              onSaveExpenses={handleSaveExpenses}
              onDeleteExpense={handleDeleteExpense}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'batches' && (
            <DoughBatchView
              batches={batches || []}
              onSaveBatch={handleSaveBatch}
              onToggleBatchStatus={handleToggleBatchStatus}
              onDeleteBatch={handleDeleteBatch}
            />
          )}

          {/* Sub-navigation pill for History vs Reports */}
          {isHistoryOrReports && (
            <div className="mb-3.5 p-1 bg-slate-200/80 rounded-2xl grid grid-cols-2 text-center text-xs font-black shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`py-2 rounded-xl transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📜 Riwayat & Cari Tanggal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`py-2 rounded-xl transition-all ${
                  activeTab === 'reports'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 Rekap Laba Bersih
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView
              sales={sales || []}
              expenses={expenses || []}
              batches={batches || []}
              onDeleteSale={handleDeleteSale}
              onDeleteExpense={handleDeleteExpense}
              onDeleteBatch={handleDeleteBatch}
              onToggleBatchStatus={handleToggleBatchStatus}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              sales={sales || []}
              expenses={expenses || []}
              batches={batches || []}
            />
          )}
        </main>

        {/* Thumb-friendly Fixed Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
