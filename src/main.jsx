import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleResetData = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Kendala Tampilan</h2>
              <p className="text-xs text-slate-500 mt-1">
                Data di browser memerlukan penyegaran ulang.
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-xl text-left">
              <p className="text-[11px] font-mono text-rose-700 break-words">
                {this.state.error?.message || 'Error rendering component'}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all"
              >
                🔄 Segarkan / Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleResetData}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 active:scale-95 transition-all"
              >
                🧹 Bersihkan Cache & Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
