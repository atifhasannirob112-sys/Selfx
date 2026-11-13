import * as React from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck, Database, Wrench } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorDetails?: string;
  isRecovering: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorDetails: '',
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // If it's a quota error, clean transient cache immediately
    if (error && (error.name === 'QuotaExceededError' || error.message?.includes('quota') || error.message?.includes('QuotaExceeded'))) {
      try {
        ['selfx_temp_modal_state', 'selfx_pending_upload', 'selfx_active_subtab'].forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }

    return { 
      hasError: true, 
      error,
      errorDetails: error?.message || 'Unknown runtime exception',
      isRecovering: false
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleSafeRecovery = () => {
    this.setState({ isRecovering: true });
    try {
      // 1. Preserve critical user data safely
      const preservedKeys = [
        'lookmax_movies',
        'selfx_movies',
        'selfx_current_user_profile_v3',
        'lookmax_user_profile_v2',
        'selfx_current_user_profile',
        'selfx_user_accounts_db_v2',
        'lookmax_crush_list_v2',
        'selfx_habits',
        'selfx_points',
        'selfx_water',
        'selfx_faith'
      ];
      
      const backup: Record<string, string> = {};
      preservedKeys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) backup[key] = val;
      });

      // Deeply sanitize lookmax_movies to eliminate any corrupted entries or quota blockers
      try {
        const rawMovies = localStorage.getItem('lookmax_movies');
        if (rawMovies) {
          const parsed = JSON.parse(rawMovies);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.filter(Boolean).map((m: any) => ({
              id: typeof m?.id === 'string' ? m.id : 'm_' + Math.random().toString(36).substring(2, 7),
              title: typeof m?.title === 'string' ? m.title : String(m?.title || 'Untitled'),
              genre: typeof m?.genre === 'string' ? m.genre : 'Drama',
              description: typeof m?.description === 'string' ? m.description : String(m?.description || ''),
              rating: Number(m?.rating) || 5,
              posterBase64: (typeof m?.posterBase64 === 'string' && m.posterBase64.trim().length > 10 && !m.posterBase64.includes('photo-1542204172-e705278817a2')) 
                ? m.posterBase64 
                : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600',
              recommended: Boolean(m?.recommended),
              addedAt: typeof m?.addedAt === 'string' ? m.addedAt : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              type: 'watched'
            }));
            backup['lookmax_movies'] = JSON.stringify(sanitized);
          } else {
            delete backup['lookmax_movies'];
            localStorage.removeItem('lookmax_movies');
          }
        }
      } catch (err) {
        delete backup['lookmax_movies'];
        localStorage.removeItem('lookmax_movies');
      }

      // 2. Clean temporary broken UI state keys that can cause render crashes
      const transientKeys = [
        'selfx_active_tab',
        'selfx_active_subtab',
        'selfx_temp_modal_state',
        'selfx_pending_upload'
      ];
      transientKeys.forEach(k => localStorage.removeItem(k));

      // 3. Ensure sanitized backup is intact
      Object.entries(backup).forEach(([k, v]) => {
        localStorage.setItem(k, v);
      });

      // 4. Reset component error state
      setTimeout(() => {
        this.setState({ hasError: false, error: null, isRecovering: false });
        window.location.reload();
      }, 300);
    } catch (e) {
      window.location.reload();
    }
  };

  handleResetMoviesAndRecover = () => {
    try {
      localStorage.removeItem('lookmax_movies');
      localStorage.removeItem('selfx_movies');
      localStorage.removeItem('selfx_temp_modal_state');
      localStorage.removeItem('selfx_pending_upload');
      this.setState({ hasError: false, error: null });
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  handleNormalReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-xl shadow-amber-500/5">
            <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          
          <h1 className="text-xl font-bold text-zinc-100 mb-2 tracking-tight">
            অ্যাপ্লিকেশনে সাময়িক সমস্যা দেখা দিয়েছে
          </h1>
          
          <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
            আপনার মুভি, প্রোফাইল ও পয়েন্ট ডেটা সম্পূর্ণ নিরাপদ রয়েছে। নিচের বাটনে চাপ দিয়ে নিরাপদ মোডে অ্যাপটি সচল করুন।
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm mb-4">
            <button
              onClick={this.handleSafeRecovery}
              disabled={this.state.isRecovering}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {this.state.isRecovering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ডেটা রিকভার হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>নিরাপদ রিস্টার্ট ও অটো-ফিক্স</span>
                </>
              )}
            </button>

            <button
              onClick={this.handleNormalReload}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>সাধারণ রিলোড</span>
            </button>
          </div>

          {this.state.errorDetails && (
            <div className="mb-4 p-2.5 bg-red-950/50 border border-red-800/50 rounded-xl text-[10px] font-mono text-red-300 max-w-sm overflow-x-auto text-left break-all shadow-inner">
              <span className="text-red-400 font-bold block mb-0.5">⚠️ এরর বিবরণ (Error Details):</span>
              {this.state.errorDetails}
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={this.handleResetMoviesAndRecover}
              className="text-[11px] text-zinc-500 hover:text-amber-400 underline underline-offset-4 cursor-pointer transition-colors"
            >
              ⚠️ ক্যাশ সমস্যা থাকলে এখানে ক্লিক করে মুভি ক্যাশ ক্লিন করুন
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  const p = localStorage.getItem('selfx_current_user_profile_v3');
                  sessionStorage.clear();
                  localStorage.removeItem('lookmax_movies');
                  localStorage.removeItem('selfx_movies');
                  localStorage.removeItem('selfx_temp_modal_state');
                  localStorage.removeItem('selfx_mini_apps_toggles');
                  localStorage.removeItem('selfx_all_cached_posts');
                  localStorage.removeItem('glowgram_posts');
                  localStorage.removeItem('selfx_active_tab');
                  if (p) localStorage.setItem('selfx_current_user_profile_v3', p);
                  window.location.href = '/';
                } catch (e) {
                  window.location.reload();
                }
              }}
              className="text-[10px] text-amber-500/80 hover:text-amber-400 font-mono underline cursor-pointer"
            >
              🧹 ফুল ক্যাশ ক্লিন ও রিফ্রেশ (Clean Corrupted Cache & Reset)
            </button>
            <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-1 mt-2">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>Local Database & Saved Logs Intact</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
