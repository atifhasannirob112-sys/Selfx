import React, { useEffect, useState } from 'react';
import { Download, Send, X, Loader2, Sparkles, CheckCircle2, Film, Check, ArrowLeft } from 'lucide-react';
import { cacheRemoteVideoToIndexedDB } from '../utils/mediaStorage';

export type ResolvedShareVideo = {
  platform: 'tiktok' | 'instagram' | string;
  url?: string;
  title: string;
  cover: string;
  videoUrl: string;
  rawVideoUrl?: string;
};

type Props = {
  onPost?: (v: ResolvedShareVideo, selectedModel?: any) => Promise<void> | void;
};

export default function ShareReceiver({ onPost }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'posting' | 'posted'>('loading');
  const [data, setData] = useState<ResolvedShareVideo | null>(null);
  const [error, setError] = useState('');
  const [originalSharedText, setOriginalSharedText] = useState('');

  // Load user's REAL saved models from Model Option (SecretModelVault / localStorage / Server)
  const [availableModels, setAvailableModels] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_custom_ai_personas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: 'hamza_malik', name: 'Hamza Malik', handle: '@hamza_malik', avatar: '/assets/models/hamza_malik.jpg' },
      { id: 'zaviyar_nauman', name: 'Zaviyar Nauman', handle: '@zaviyar_nauman', avatar: '/assets/models/zaviyar_nauman.jpg' },
      { id: 'daniyal_zafar', name: 'Daniyal Zafar', handle: '@daniyal_zafar', avatar: '/assets/models/daniyal_zafar.jpg' },
      { id: 'bilal_abbas', name: 'Bilal Abbas', handle: '@bilal_abbas', avatar: '/assets/models/bilal_abbas.jpg' },
      { id: 'shahzad_noor', name: 'Shahzad Noor', handle: '@shahzad_noor', avatar: '/assets/models/shahzad_noor.jpg' },
      { id: 'zarrar_khan', name: 'Zarrar Khan', handle: '@zarrar_khan', avatar: '/assets/models/zarrar_khan.jpg' },
      { id: 'niromax', name: 'Atif Nirob', handle: '@niromax', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80' }
    ];
  });

  const [selectedModel, setSelectedModel] = useState<any>(() => availableModels[0]);

  // Sync real models when user modifies them in Model Option or from server
  useEffect(() => {
    fetch('/api/community/personas')
      .then(r => r.json())
      .then(d => {
        if (d && d.success && Array.isArray(d.personas) && d.personas.length > 0) {
          setAvailableModels(d.personas);
          setSelectedModel(d.personas[0]);
        }
      })
      .catch(() => {});

    const onUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setAvailableModels(e.detail);
        setSelectedModel(e.detail[0]);
      }
    };
    window.addEventListener('selfx_custom_personas_updated', onUpdate);
    return () => window.removeEventListener('selfx_custom_personas_updated', onUpdate);
  }, []);

  const resolveLink = async (text: string) => {
    if (!text || !/https?:\/\//i.test(text)) return;
    setOriginalSharedText(text);

    setOpen(true);
    setStatus('loading');
    setError('');

    try {
      const r = await fetch('/api/share/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) {
        throw new Error(j.error || 'Failed to resolve video from link');
      }
      setData({ ...j, url: j.url || text });
      setStatus('ready');
    } catch (e: any) {
      console.warn("ShareReceiver resolve error:", e);
      setError(e.message || 'Could not load video. Make sure the post is public.');
      setStatus('error');
    }
  };

  useEffect(() => {
    // 1. Check current URL query params (from Web Share Target or browser intent)
    const p = new URLSearchParams(window.location.search);
    const sharedText = [p.get('url'), p.get('text'), p.get('title')].filter(Boolean).join(' ');
    
    if (/https?:\/\//.test(sharedText)) {
      window.history.replaceState({}, '', window.location.pathname);
      resolveLink(sharedText);
    }

    // 2. Global handler for native Android bridge
    (window as any).handleNativeSharedLink = (urlOrText: string) => {
      if (urlOrText && /https?:\/\//.test(urlOrText)) {
        resolveLink(urlOrText);
      }
    };

    // 3. Custom event listener
    const onCustomShare = (e: any) => {
      if (e.detail?.url) {
        resolveLink(e.detail.url);
      }
    };
    window.addEventListener('selfx_trigger_share_download', onCustomShare);

    return () => {
      window.removeEventListener('selfx_trigger_share_download', onCustomShare);
    };
  }, []);

  const closeAndReturnToOrigin = () => {
    setOpen(false);
    setData(null);
    try {
      if (window.opener) {
        window.close();
      } else if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    } catch (e) {
      window.close();
    }
  };

  const handlePost = async () => {
    setStatus('posting');
    try {
      if (data && onPost) {
        await onPost({ ...data, url: data.url || originalSharedText }, selectedModel);
      } else {
        const shareUrl = originalSharedText || data?.url || data?.rawVideoUrl || data?.videoUrl;
        const res = await fetch('/api/share/quick-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: shareUrl,
            mode: 'video',
            model: selectedModel
          })
        });
        const pubData = await res.json();
        if (!pubData.success) {
          throw new Error(pubData.error || 'Publish failed');
        }
        if (pubData.post) {
          try {
            const rawPerm = localStorage.getItem('selfx_permanent_tiktok_posts');
            const permList = rawPerm ? JSON.parse(rawPerm) : [];
            localStorage.setItem('selfx_permanent_tiktok_posts', JSON.stringify([pubData.post, ...permList.filter((p: any) => p.id !== pubData.post.id)]));

            const rawLocal = localStorage.getItem('selfx_user_local_posts');
            const localList = rawLocal ? JSON.parse(rawLocal) : [];
            localStorage.setItem('selfx_user_local_posts', JSON.stringify([pubData.post, ...localList.filter((p: any) => p.id !== pubData.post.id)]));
          } catch (le) {}
          if (pubData.post.video) {
            cacheRemoteVideoToIndexedDB(pubData.post.video, [pubData.post.id]).catch(() => {});
          }
          window.dispatchEvent(new CustomEvent('selfx_new_post_published', { detail: pubData.post }));
        }
      }

      setStatus('posted');
      // Auto-return immediately so user stays inside TikTok
      setTimeout(() => {
        closeAndReturnToOrigin();
      }, 1100);
    } catch (e: any) {
      setError(e?.message || 'Failed to post to GrowGram');
      setStatus('error');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex flex-col justify-end animate-in fade-in duration-200">
      {/* Top dismiss area: click to instantly dismiss and return to TikTok */}
      <div 
        className="flex-1 w-full cursor-pointer" 
        onClick={closeAndReturnToOrigin}
      />

      {/* Snaptube-Style Pinned Bottom Sheet */}
      <div className="bg-[#111216] border-t border-white/10 text-zinc-100 rounded-t-[28px] w-full max-w-lg mx-auto p-5 pb-8 shadow-2xl relative flex flex-col gap-3.5 animate-in slide-in-from-bottom duration-250">
        {/* Top Grab Handle Bar */}
        <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-1" />

        {/* Title Header with Model Badge */}
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Post to GrowGram</span>
          </h3>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
            {selectedModel?.name ? selectedModel.name.split(' ')[0] : 'Model'} Active
          </span>
        </div>

        {/* Real Saved Models Selection Row */}
        <div>
          <span className="text-xs font-semibold text-zinc-400">Select Model / Creator</span>
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1.5 custom-scrollbar">
            {availableModels.map((m) => {
              const isSelected = selectedModel?.id === m.id || selectedModel?.handle === m.handle;
              return (
                <button
                  key={m.id || m.handle}
                  type="button"
                  onClick={() => setSelectedModel(m)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-400/20 border border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover border border-amber-400/30" />
                  ) : (
                    <span>🔥</span>
                  )}
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Reel Option Card (MP3 removed as requested) */}
        <div>
          <span className="text-xs font-semibold text-zinc-400">Video</span>
          <div className="flex items-center justify-between py-3 px-3.5 mt-1.5 rounded-2xl bg-[#191b22] border border-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">MP4 Video Reel</p>
                <p className="text-[11px] text-zinc-400">Full HD • Auto-posted to GrowGram Feed</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#f7c92b] flex items-center justify-center text-black shadow-md shadow-yellow-500/20">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Shared Link Preview */}
        {originalSharedText && (
          <p className="text-[11px] text-zinc-500 font-mono truncate px-1">
            🔗 {originalSharedText}
          </p>
        )}

        {/* Status / Error Notifications */}
        {status === 'error' && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center font-medium">
            {error || 'ভিডিও লোড করা যায়নি, আবার চেষ্টা করুন'}
          </div>
        )}
        {status === 'posted' && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold">
            ✓ GrowGram-এ সফলভাবে পোস্ট হয়েছে! 🚀
          </div>
        )}

        {/* Big Solid Yellow Action Button */}
        <button
          type="button"
          onClick={handlePost}
          disabled={status === 'posting'}
          className="w-full mt-1.5 py-4 rounded-full bg-[#f7c92b] hover:bg-[#eab308] active:scale-[0.98] text-black font-extrabold text-base shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
        >
          {status === 'posting' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>GrowGram-এ পোস্ট হচ্ছে...</span>
            </>
          ) : status === 'posted' ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>✓ Posted to GrowGram</span>
            </>
          ) : (
            <span>Post to GrowGram</span>
          )}
        </button>

        {/* Back to TikTok cancel button */}
        <button
          type="button"
          onClick={closeAndReturnToOrigin}
          className="text-center text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors cursor-pointer"
        >
          বাতিল ও টিকটকে ফিরে যান (Return to TikTok)
        </button>
      </div>
    </div>
  );
}
