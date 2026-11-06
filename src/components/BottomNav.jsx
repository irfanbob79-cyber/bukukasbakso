import React from 'react';
import { Home, Wallet, ShoppingCart, Flame, History } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Ringkasan', icon: Home },
    { id: 'sales', label: 'Uang Masuk', icon: Wallet },
    { id: 'expenses', label: 'Belanja', icon: ShoppingCart },
    { id: 'batches', label: 'Adonan', icon: Flame },
    { id: 'history', label: 'Riwayat', icon: History, alsoActive: ['reports'] },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 no-print flex justify-center pointer-events-none">
      {/* Constrain bottom bar to the 430px mobile shell */}
      <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pointer-events-auto pb-[max(env(safe-area-inset-bottom),8px)]">
        <div className="grid grid-cols-5 px-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.alsoActive && tab.alsoActive.includes(activeTab));

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[50px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative active:scale-90 ${
                  isActive
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-500 font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-full animate-in fade-in zoom-in duration-150" />
                )}
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-emerald-50 scale-105' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-emerald-800' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
