import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageSquare, Send, Bookmark, Image as ImageIcon, Plus, 
  X, Check, Compass, Grid, Users, Search, Play, Pause, Volume2, VolumeX, Sparkles, 
  Lock, Award, Eye, MessageCircle, Info, ChevronRight, ChevronLeft, UserCheck, Inbox, UserPlus, Loader2,
  User, Film, Video, Edit, Trash2, Star, Sliders, MoreVertical, Mic, RefreshCw, CheckCircle2,
  Download, Share2, RotateCcw, UploadCloud, Music, Copy
} from 'lucide-react';
import { triggerNotification, t, getLanguage } from '../utils';
import { UserProfileInfo } from '../types';
import { initMediaDB, saveMediaItem, getMediaItem, getAllStoredMediaKeys, saveMediaBlob, getMediaRawBlob, isValidVideoBlob, cacheRemoteVideoToIndexedDB } from '../utils/mediaStorage';
import { acquireBgMusicPauseLock, releaseBgMusicPauseLock } from '../utils/remixAudioEngine';

export { initMediaDB, saveMediaItem, getMediaItem, getAllStoredMediaKeys };

// Robust secondary IndexedDB for large text metadata (saves, posts, dms, local_backups)
const PERSIST_DB_NAME = 'glowup_persistence_db_v4';
const PERSIST_STORE_NAME = 'glowup_store_v4';

export function initPersistDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PERSIST_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PERSIST_STORE_NAME)) {
        db.createObjectStore(PERSIST_STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function writeGlowupData(key: string, value: any): Promise<void> {
  // Always write to localStorage as an immediate synchronous backup
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("localStorage backup write failed:", err);
  }

  return initPersistDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PERSIST_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(PERSIST_STORE_NAME);
      const request = store.put({ key, data: value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }).catch(e => {
    console.warn("IndexedDB write failed, but localStorage backup was saved.", e);
  });
}

export function readGlowupData<T = any>(key: string, defaultValue: T): Promise<T> {
  return initPersistDB().then(db => {
    return new Promise<T>((resolve) => {
      const transaction = db.transaction(PERSIST_STORE_NAME, 'readonly');
      const store = transaction.objectStore(PERSIST_STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result && request.result.data !== undefined && request.result.data !== null) {
          resolve(request.result.data as T);
        } else {
          // If IndexedDB has no record, try reading from localStorage
          try {
            const saved = localStorage.getItem(key);
            resolve(saved ? JSON.parse(saved) : defaultValue);
          } catch {
            resolve(defaultValue);
          }
        }
      };
      request.onerror = () => {
        try {
          const saved = localStorage.getItem(key);
          resolve(saved ? JSON.parse(saved) : defaultValue);
        } catch {
          resolve(defaultValue);
        }
      };
    });
  }).catch(e => {
    console.warn("IndexedDB read failed, trying localStorage", e);
    try {
      const saved = localStorage.getItem(key);
      return (saved ? JSON.parse(saved) : defaultValue) as T;
    } catch {
      return defaultValue;
    }
  });
}

interface CommunityVideoProps {
  videoUrlOrKey: string;
  posterUrl?: string;
  postId?: string;
  sourceUrl?: string;
}

interface CommunityImageProps {
  imageUrlOrKey: string;
  className?: string;
  alt?: string;
}

// In-memory media cache to prevent repeated IndexedDB / fetch reads during scrolling (eliminates lag & micro-stutter)
const imageSrcMemoryCache = new Map<string, string>();
const videoSrcMemoryCache = new Map<string, string>();

export const CommunityImage: React.FC<CommunityImageProps> = React.memo(({ imageUrlOrKey, className, alt = "Glowup submission" }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    if (!imageUrlOrKey) return '';
    return imageSrcMemoryCache.get(imageUrlOrKey) || '';
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (!imageUrlOrKey) return false;
    return !imageSrcMemoryCache.has(imageUrlOrKey);
  });

  useEffect(() => {
    if (!imageUrlOrKey) {
      setResolvedSrc('');
      setLoading(false);
      return;
    }

    if (imageSrcMemoryCache.has(imageUrlOrKey)) {
      setResolvedSrc(imageSrcMemoryCache.get(imageUrlOrKey)!);
      setLoading(false);
      return;
    }

    if (imageUrlOrKey.startsWith('media-id-') || imageUrlOrKey.startsWith('local-video-') || imageUrlOrKey.startsWith('vault-media-')) {
      getMediaItem(imageUrlOrKey)
        .then(async data => {
          if (data) {
            imageSrcMemoryCache.set(imageUrlOrKey, data);
            setResolvedSrc(data);
            setLoading(false);
          } else {
            // Not found in local IndexedDB, try to load from the server API!
            try {
              const apiRes = await fetch(`/api/community/media?id=${imageUrlOrKey}`);
              const apiData = await apiRes.json();
              if (apiData.success && apiData.dataUrl) {
                imageSrcMemoryCache.set(imageUrlOrKey, apiData.dataUrl);
                setResolvedSrc(apiData.dataUrl);
                // Cache it locally so next time it loads instantly!
                await saveMediaItem(imageUrlOrKey, apiData.dataUrl);
                setLoading(false);
              } else {
                throw new Error("Not found on server");
              }
            } catch (err) {
              const fallback = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";
              setResolvedSrc(fallback);
              setLoading(false);
            }
          }
        })
        .catch(() => {
          const fallback = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";
          setResolvedSrc(fallback);
          setLoading(false);
        });
    } else {
      imageSrcMemoryCache.set(imageUrlOrKey, imageUrlOrKey);
      setResolvedSrc(imageUrlOrKey);
      setLoading(false);
    }
  }, [imageUrlOrKey]);

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      referrerPolicy="no-referrer"
    />
  );
});

// Global audio unlock helper to avoid attaching multiple redundant window listeners
let globalAudioUnlocked = false;
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    globalAudioUnlocked = true;
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('click', unlockAudio);
  };
  window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
  window.addEventListener('click', unlockAudio, { passive: true, once: true });
}

function dataUrlToBlobUrl(dataUrl: string): string {
  try {
    if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
    const parts = dataUrl.split(';base64,');
    if (!parts[1]) return dataUrl;
    const contentType = parts[0].replace('data:', '') || 'video/mp4';
    const binary = atob(parts[1]);
    const len = binary.length;
    // Chunked allocation for large video buffers to avoid call stack / memory spikes
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: contentType });
    return URL.createObjectURL(blob);
  } catch (e) {
    return dataUrl;
  }
}

// Global video playback coordinator: ensures strictly ONLY the centered video in front of user plays
let globalCurrentPlayingVideoId: string | null = null;
const globalVideoPauseCallbacks = new Map<string, () => void>();

function pauseAllOtherVideos(currentId: string) {
  globalCurrentPlayingVideoId = currentId;
  globalVideoPauseCallbacks.forEach((pauseFn, id) => {
    if (id !== currentId) {
      pauseFn();
    }
  });
}

const CommunityVideo: React.FC<CommunityVideoProps> = React.memo(({ videoUrlOrKey, posterUrl, postId, sourceUrl }) => {
  const instanceIdRef = useRef<string>(`feed-vid-${Math.random().toString(36).substring(2, 9)}`);
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    if (!videoUrlOrKey) return '';
    if (videoSrcMemoryCache.has(videoUrlOrKey)) {
      return videoSrcMemoryCache.get(videoUrlOrKey)!;
    }
    if (videoUrlOrKey.startsWith('/media/') || videoUrlOrKey.startsWith('http://') || videoUrlOrKey.startsWith('https://')) {
      return videoUrlOrKey;
    }
    return '';
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (!videoUrlOrKey) return false;
    if (videoUrlOrKey.startsWith('/media/') || videoUrlOrKey.startsWith('http://') || videoUrlOrKey.startsWith('https://')) {
      return false;
    }
    return !videoSrcMemoryCache.has(videoUrlOrKey);
  });
  const [error, setError] = useState(false);
  const [errorReason, setErrorReason] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Muted by default allows reliable autoplay without browser blocking
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isManuallyPausedRef = useRef<boolean>(false);
  const isVisibleInFrontRef = useRef<boolean>(false);

  // Derive poster from video filename or passed posterUrl so the video NEVER renders as a black box
  const effectivePoster = React.useMemo(() => {
    if (posterUrl && (posterUrl.startsWith('http') || posterUrl.startsWith('/media/') || posterUrl.startsWith('data:image/'))) {
      return posterUrl;
    }
    if (videoUrlOrKey && videoUrlOrKey.startsWith('/media/') && videoUrlOrKey.endsWith('.mp4')) {
      return videoUrlOrKey.replace(/\.mp4$/, '.jpg');
    }
    const idMatch = (videoUrlOrKey || '').match(/(media-id-[0-9a-zA-Z_-]+|local-video-[0-9a-zA-Z_-]+|vault-media-[0-9a-zA-Z_-]+|upload-vid-[0-9a-zA-Z_-]+|vid-[0-9a-zA-Z_-]+|tiktok_[0-9a-zA-Z_-]+|instagram_[0-9a-zA-Z_-]+|post-[0-9a-zA-Z_-]+|tiktok-post-[0-9a-zA-Z_-]+|vault-model-post-[0-9a-zA-Z_-]+|share-post-[0-9a-zA-Z_-]+)/);
    const cleanId = idMatch ? (idMatch[1] || idMatch[0]).replace(/^\/media\//, '').replace(/\.[^.]+$/, '') : null;
    if (cleanId) {
      return `/media/${cleanId}.jpg`;
    }
    return undefined;
  }, [posterUrl, videoUrlOrKey]);

  // Register in global coordinator so any other video immediately pauses when a new video plays
  useEffect(() => {
    const myId = instanceIdRef.current;
    const pauseThisVideo = () => {
      const videoEl = videoRef.current;
      if (videoEl && !videoEl.paused) {
        videoEl.pause();
        videoEl.muted = true;
        setIsPaused(true);
        setIsMuted(true);
      }
    };
    globalVideoPauseCallbacks.set(myId, pauseThisVideo);

    return () => {
      globalVideoPauseCallbacks.delete(myId);
      if (globalCurrentPlayingVideoId === myId) {
        globalCurrentPlayingVideoId = null;
      }
    };
  }, []);

  const loadMedia = async () => {
    if (!videoUrlOrKey) {
      setLoading(false);
      return;
    }

    if (videoSrcMemoryCache.has(videoUrlOrKey)) {
      setResolvedSrc(videoSrcMemoryCache.get(videoUrlOrKey)!);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    // 1. Direct blob: or data: URL
    if (videoUrlOrKey.startsWith('blob:') || videoUrlOrKey.startsWith('data:video/')) {
      setResolvedSrc(videoUrlOrKey);
      videoSrcMemoryCache.set(videoUrlOrKey, videoUrlOrKey);
      setLoading(false);
      return;
    }

    // 2. Direct static MP4 file path: check local IndexedDB Blob first so container restarts never break playback!
    if (videoUrlOrKey.startsWith('/media/')) {
      try {
        const cachedBlob = await getMediaRawBlob(videoUrlOrKey) || (postId ? await getMediaRawBlob(postId) : null);
        if (cachedBlob && (await isValidVideoBlob(cachedBlob))) {
          const blobUrl = URL.createObjectURL(cachedBlob);
          videoSrcMemoryCache.set(videoUrlOrKey, blobUrl);
          setResolvedSrc(blobUrl);
          setLoading(false);
          // Silently ensure server still has this MP4; if missing, auto-heal server with real Blob
          fetch(videoUrlOrKey, { method: 'HEAD' }).then(headRes => {
            if (!headRes.ok) {
              const cleanId = videoUrlOrKey.replace(/^\/media\//, '').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '');
              if (cleanId) {
                fetch('/api/community/video/upload-binary', {
                  method: 'POST',
                  headers: { 'x-media-id': cleanId, 'Content-Type': cachedBlob.type || 'video/mp4' },
                  body: cachedBlob
                }).catch(() => {});
              }
            }
          }).catch(() => {});
          return;
        }
      } catch {}

      setResolvedSrc(videoUrlOrKey);
      setLoading(false);
      // Cache real MP4 Blob to IndexedDB in background once loaded from server
      cacheRemoteVideoToIndexedDB(videoUrlOrKey, postId ? [postId] : []).catch(() => {});
      return;
    }

    // 3. API proxy stream or full http/https video URL
    if (
      videoUrlOrKey.startsWith('/api/') || 
      videoUrlOrKey.startsWith('http://') || 
      videoUrlOrKey.startsWith('https://')
    ) {
      videoSrcMemoryCache.set(videoUrlOrKey, videoUrlOrKey);
      setResolvedSrc(videoUrlOrKey);
      setLoading(false);
      return;
    }

    // 4. Extract media ID for local or vault references
    const idMatch = videoUrlOrKey.match(/(media-id-[0-9a-zA-Z_-]+|local-video-[0-9a-zA-Z_-]+|vault-media-[0-9a-zA-Z_-]+|upload-vid-[0-9a-zA-Z_-]+|vid-[0-9a-zA-Z_-]+|tiktok_[0-9a-zA-Z_-]+|instagram_[0-9a-zA-Z_-]+|post-[0-9a-zA-Z_-]+|tiktok-post-[0-9a-zA-Z_-]+|vault-model-post-[0-9a-zA-Z_-]+|share-post-[0-9a-zA-Z_-]+)/) ||
                    videoUrlOrKey.match(/\/media\/([a-zA-Z0-9_-]+)/);
    const cleanId = idMatch ? (idMatch[1] || idMatch[0]).replace(/^\/media\//, '').replace(/\.[^.]+$/, '') : videoUrlOrKey.replace(/^\/media\//, '').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '');

    // 5. Check IndexedDB / LocalStorage / Server API for instant offline-first playback
    if (cleanId || videoUrlOrKey) {
      try {
        const localData = await getMediaItem(cleanId) || await getMediaItem(videoUrlOrKey);
        if (localData && (localData.startsWith('data:video') || localData.startsWith('blob:') || localData.length > 500)) {
          const blobUrl = localData.startsWith('data:') ? dataUrlToBlobUrl(localData) : localData;
          videoSrcMemoryCache.set(videoUrlOrKey, blobUrl);
          if (cleanId) videoSrcMemoryCache.set(cleanId, blobUrl);
          setResolvedSrc(blobUrl);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    if (cleanId) {
      const streamUrl = `/media/${cleanId}.mp4`;
      videoSrcMemoryCache.set(videoUrlOrKey, streamUrl);
      setResolvedSrc(streamUrl);
      setLoading(false);
      return;
    }

    // Regular URL
    videoSrcMemoryCache.set(videoUrlOrKey, videoUrlOrKey);
    setResolvedSrc(videoUrlOrKey);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, [videoUrlOrKey]);

  // When resolvedSrc changes, reset playback to beginning
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !resolvedSrc) return;
    videoEl.currentTime = 0;
    isManuallyPausedRef.current = false;
  }, [resolvedSrc]);

  // Viewport IntersectionObserver & Visibility Handler - plays video when in front of user and auto-resumes
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || loading || !resolvedSrc) return;

    const startPlayback = () => {
      pauseAllOtherVideos(instanceIdRef.current);
      videoEl.preload = 'auto';
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPaused(false);
        }).catch(() => {
          // If browser restricts unmuted autoplay before user interaction, play muted first
          videoEl.muted = true;
          setIsMuted(true);
          videoEl.play().then(() => setIsPaused(false)).catch(() => {});
        });
      }
    };

    const checkViewportAndPlay = () => {
      if (!videoEl) return;
      const rect = videoEl.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1;
      if (inView && !isManuallyPausedRef.current) {
        isVisibleInFrontRef.current = true;
        startPlayback();
      }
    };

    // Immediate check on mount/resolvedSrc so the video plays right away when user enters
    const initialTimer = setTimeout(checkViewportAndPlay, 120);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
            isVisibleInFrontRef.current = true;
            if (!isManuallyPausedRef.current) {
              startPlayback();
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio <= 0.05) {
            isVisibleInFrontRef.current = false;
            if (videoEl && !videoEl.paused) {
              videoEl.pause();
              setIsPaused(true);
            }
          }
        });
      },
      {
        threshold: [0, 0.15, 0.5],
      }
    );

    observer.observe(videoEl);

    const handleVisibilityChange = () => {
      if (document.hidden && videoEl) {
        videoEl.pause();
        setIsPaused(true);
      } else if (!document.hidden) {
        // Automatically resume when returning to the app!
        setTimeout(checkViewportAndPlay, 150);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkViewportAndPlay);

    return () => {
      clearTimeout(initialTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkViewportAndPlay);
      if (videoEl) {
        observer.unobserve(videoEl);
        videoEl.pause();
      }
    };
  }, [loading, resolvedSrc]);

  // Click on video to toggle play/pause with audio support
  // Click on video to toggle play/pause cleanly (Sound ON when playing, Sound OFF when paused, zero overlay icons)
  const handleVideoToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      pauseAllOtherVideos(instanceIdRef.current);
      isManuallyPausedRef.current = false;
      // UNMUTE and TURN SOUND ON immediately when playing!
      videoEl.muted = false;
      setIsMuted(false);
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPaused(false);
          setIsBuffering(false);
        }).catch(() => {
          // If browser restricts unmuted autoplay, start muted then unmute on next interaction
          videoEl.muted = true;
          setIsMuted(true);
          videoEl.play().then(() => {
            setIsPaused(false);
            setIsBuffering(false);
          }).catch(() => {});
        });
      }
    } else {
      isManuallyPausedRef.current = true;
      videoEl.pause();
      // MUTE and TURN SOUND OFF when paused!
      videoEl.muted = true;
      setIsMuted(true);
      setIsPaused(true);
      setIsBuffering(false);
    }
  };

  const retryCountRef = useRef<number>(0);
  const repairAttemptedRef = useRef<boolean>(false);

  const attemptSourceUrlRepair = async (): Promise<boolean> => {
    if (repairAttemptedRef.current && !isRecovering) return false;
    repairAttemptedRef.current = true;
    setIsRecovering(true);
    try {
      const r = await fetch('/api/community/posts/repair-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          videoUrl: videoUrlOrKey,
          sourceUrl
        })
      });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.success && j?.video) {
        const freshUrl = `${j.video}?t=${Date.now()}`;
        setResolvedSrc(freshUrl);
        setError(false);
        setErrorReason('');
        cacheRemoteVideoToIndexedDB(j.video, postId ? [postId] : []).catch(() => {});
        if (videoRef.current) videoRef.current.load();
        return true;
      }
    } catch {}
    finally {
      setIsRecovering(false);
    }
    return false;
  };

  const handleVideoError = async () => {
    // 1. Check local IndexedDB Blob cache immediately (survives container restarts & offline mode)
    const idMatch = videoUrlOrKey.match(/(media-id-[0-9a-zA-Z_-]+|local-video-[0-9a-zA-Z_-]+|vault-media-[0-9a-zA-Z_-]+|upload-vid-[0-9a-zA-Z_-]+|vid-[0-9a-zA-Z_-]+|tiktok_[0-9a-zA-Z_-]+|instagram_[0-9a-zA-Z_-]+|post-[0-9a-zA-Z_-]+|tiktok-post-[0-9a-zA-Z_-]+|vault-model-post-[0-9a-zA-Z_-]+|share-post-[0-9a-zA-Z_-]+)/) ||
                    videoUrlOrKey.match(/\/media\/([a-zA-Z0-9_-]+)/);
    const cleanId = idMatch ? (idMatch[1] || idMatch[0]).replace(/^\/media\//, '').replace(/\.[^.]+$/, '') : null;

    if (!resolvedSrc.startsWith('blob:')) {
      try {
        const rawBlob = await getMediaRawBlob(videoUrlOrKey) || (cleanId ? await getMediaRawBlob(cleanId) : null) || (postId ? await getMediaRawBlob(postId) : null);
        if (rawBlob && (await isValidVideoBlob(rawBlob))) {
          const blobUrl = URL.createObjectURL(rawBlob);
          videoSrcMemoryCache.set(videoUrlOrKey, blobUrl);
          setResolvedSrc(blobUrl);
          setError(false);
          setErrorReason('');
          if (cleanId) {
            fetch('/api/community/video/upload-binary', {
              method: 'POST',
              headers: { 'x-media-id': cleanId, 'Content-Type': rawBlob.type || 'video/mp4' },
              body: rawBlob
            }).catch(() => {});
          }
          if (videoRef.current) videoRef.current.load();
          return;
        }
      } catch {}
    }

    // 2. If server file was missing and not in IndexedDB, try legitimate re-download from original sourceUrl
    if (!repairAttemptedRef.current && (sourceUrl || postId)) {
      const repaired = await attemptSourceUrlRepair();
      if (repaired) return;
    }

    // 3. If external HTTP video URL failed, route through proxy stream (with optional source re-resolve)
    if ((videoUrlOrKey.startsWith('http://') || videoUrlOrKey.startsWith('https://')) && !resolvedSrc.includes('/api/share/stream') && retryCountRef.current < 1) {
      retryCountRef.current += 1;
      const proxyStream = `/api/share/stream?u=${encodeURIComponent(videoUrlOrKey)}${sourceUrl ? `&source=${encodeURIComponent(sourceUrl)}` : ''}`;
      setResolvedSrc(proxyStream);
      setError(false);
      if (videoRef.current) videoRef.current.load();
      return;
    }

    // 4. Genuine Error State — NEVER fall back to any demo video!
    setError(true);
    setErrorReason(sourceUrl ? 'ভিডিও ফাইলটি পাওয়া যায়নি। মূল লিংক থেকে আবার ডাউনলোড করতে নিচের বাটনে চাপুন।' : 'ভিডিও ফাইলটি লোড করা যায়নি বা পাওয়া যাচ্ছে না।');
  };

  if (loading && !resolvedSrc) {
    return (
      <div className="relative w-full h-56 bg-zinc-950 flex items-center justify-center overflow-hidden">
        {effectivePoster && (
          <img 
            src={effectivePoster} 
            alt="Video thumbnail" 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
        )}
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 font-mono text-[10px] text-zinc-300 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-sm">
          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
          <span>LOADING VIDEO...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleVideoToggle}
      className="relative w-full overflow-hidden bg-zinc-950 select-none cursor-pointer flex items-center justify-center min-h-[220px] group"
    >
      {/* Permanent underlying poster image so video never turns black or flashes empty */}
      {effectivePoster && (
        <img 
          src={effectivePoster} 
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 pointer-events-none"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      )}
      <video 
        ref={(el) => {
          videoRef.current = el;
          if (el) {
            el.muted = isMuted;
          }
        }}
        src={resolvedSrc || videoUrlOrKey} 
        poster={effectivePoster}
        loop
        muted={isMuted}
        playsInline
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
        className="w-full max-h-[520px] object-cover relative z-10 bg-transparent"
        preload="auto"
        onError={handleVideoError}
        onWaiting={() => {
          if (videoRef.current && !videoRef.current.paused) {
            setIsBuffering(true);
          }
        }}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPaused(false);
        }}
        onCanPlay={() => setIsBuffering(false)}
        onTimeUpdate={() => {
          if (isBuffering) setIsBuffering(false);
        }}
        onPlay={() => {
          setIsPaused(false);
          setIsBuffering(false);
          pauseAllOtherVideos(instanceIdRef.current);
        }}
        onPause={() => {
          setIsPaused(true);
          setIsBuffering(false);
        }}
        onLoadedMetadata={() => {
          setIsBuffering(false);
          if (videoRef.current && !isManuallyPausedRef.current) {
            videoRef.current.play().then(() => {
              setIsPaused(false);
              setIsBuffering(false);
            }).catch(() => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                videoRef.current.play().then(() => {
                  setIsPaused(false);
                  setIsBuffering(false);
                }).catch(() => {});
              }
            });
          }
        }}
      />

      {/* Clean video screen without any overlay icons, spinners, or sound buttons */}
      {/* Genuine Error State (NEVER shows a demo video) */}
      {error && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 z-20 gap-2.5 p-5 text-center"
        >
          <p className="text-xs text-rose-400 font-bold">ভিডিওটি লোড হতে সমস্যা হয়েছে</p>
          <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed">
            {errorReason || 'ভিডিও ফাইলটি বর্তমানে সার্ভারে বা ডিভাইসে পাওয়া যাচ্ছে না।'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            <button
              type="button"
              disabled={isRecovering}
              onClick={async (e) => {
                e.stopPropagation();
                setError(false);
                retryCountRef.current = 0;
                repairAttemptedRef.current = false;
                if (sourceUrl) {
                  const ok = await attemptSourceUrlRepair();
                  if (!ok) {
                    setError(true);
                    setErrorReason('সোর্স লিংক থেকে ভিডিওটি পুনরায় ডাউনলোড করা যায়নি।');
                  }
                } else {
                  loadMedia();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecovering ? 'animate-spin' : ''}`} />
              <span>{isRecovering ? 'রিকভার হচ্ছে...' : 'আবার চেষ্টা করুন'}</span>
            </button>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                মূল লিংক দেখুন
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

interface PostItem {
  id: string;
  author: string;
  authorUsername: string;
  authorBadge?: string;
  avatarUrl: string;
  time: string;
  content: string;
  image?: string;
  video?: string;
  sourceUrl?: string;
  likes: number;
  likedByUser?: boolean;
  comments: CommentItem[];
  savedByUser?: boolean;
  createdAt?: string;
}

interface CommunityPostCardProps {
  post: PostItem;
  postIndex?: number;
  totalPosts?: number;
  userProfile: UserProfileInfo;
  isLead?: boolean;
  openMemberProfile: (author: string, postContext?: PostItem) => void;
  handleDeletePost: (postId: string) => void;
  handleLikePost: (postId: string) => void;
  handleSavePost: (postId: string) => void;
  onCommentSubmit: (postId: string, text: string) => void;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = React.memo(({
  post,
  postIndex,
  totalPosts,
  userProfile,
  isLead,
  openMemberProfile,
  handleDeletePost,
  handleLikePost,
  handleSavePost,
  onCommentSubmit,
}) => {
  const [localCommentText, setLocalCommentText] = useState('');

  const isUserAuthor = Boolean(
    (post.author && userProfile.name && post.author.toLowerCase().trim() === userProfile.name.toLowerCase().trim()) ||
    (post.authorUsername && userProfile.numberId && post.authorUsername.toLowerCase().trim() === userProfile.numberId.toLowerCase().trim()) ||
    (post.author && userProfile.numberId && post.author.toLowerCase().trim() === userProfile.numberId.toLowerCase().trim())
  );

  const avatarSrc = isUserAuthor ? (userProfile.avatarBase64 || post.avatarUrl) : post.avatarUrl;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!localCommentText.trim()) return;
    onCommentSubmit(post.id, localCommentText.trim());
    setLocalCommentText('');
  };

  return (
    <div 
      style={{ contentVisibility: 'auto', containIntrinsicSize: '520px' }}
      className="bg-[#121214] border border-zinc-850 rounded-3xl overflow-hidden shadow-xl transform-gpu relative"
    >
      {/* Post Header */}
      <div className="p-4.5 flex items-center justify-between border-b border-zinc-950">
        <div 
          onClick={() => openMemberProfile(post.author, post)}
          className="flex items-center gap-3 cursor-pointer group/header select-none"
        >
          <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-yellow-400 transition-transform group-hover/header:scale-105 shrink-0">
            <div className="w-full h-full rounded-full border-2 border-zinc-950 overflow-hidden bg-zinc-900">
              <img 
                src={avatarSrc || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                alt={post.author} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-zinc-100 group-hover/header:text-amber-400 transition-colors">{post.author}</span>
              {post.authorBadge && (
                <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase">
                  {post.authorBadge}
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">@{post.authorUsername} · {post.time}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {(isLead || isUserAuthor || post.authorUsername === userProfile.numberId) && (
            <button 
              onClick={() => {
                if (window.confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান?")) {
                  handleDeletePost(post.id);
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
              title="Delete Post"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Image */}
      {/* Post Image (only if no video attached) */}
      {!post.video && post.image && (
        <div className="relative bg-zinc-950 max-h-[480px] overflow-hidden flex items-center justify-center border-b border-zinc-950 select-none">
          <CommunityImage 
            imageUrlOrKey={post.image} 
            className="w-full object-cover max-h-[480px]" 
          />
        </div>
      )}

      {/* Post Video */}
      {post.video && (
        <div className="relative bg-zinc-950 max-h-[480px] overflow-hidden flex items-center justify-center border-b border-zinc-950 select-none group/vidcontainer">
          <CommunityVideo key={post.video} videoUrlOrKey={post.video} posterUrl={post.image} postId={post.id} sourceUrl={post.sourceUrl} />
        </div>
      )}

      {/* Action Bar */}
      <div className="p-4.5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => handleLikePost(post.id)}
              className="flex items-center gap-2 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer group"
            >
              <Heart 
                className={`w-5 h-5 transition-transform duration-200 group-active:scale-150 ${
                  post.likedByUser ? 'text-rose-500 fill-rose-500' : ''
                }`} 
              />
              <span className="text-xs font-mono font-bold">{post.likes}</span>
            </button>

            <div className="flex items-center gap-2 text-zinc-400">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-mono font-bold">{post.comments?.length || 0}</span>
            </div>
          </div>

          <button
            onClick={() => handleSavePost(post.id)}
            className={`text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer ${
              post.savedByUser ? 'text-amber-400 fill-amber-400' : ''
            }`}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Caption/Content (Compact & Sleek) */}
        <div className="text-left space-y-1">
          <p className="text-zinc-300 text-[11px] leading-snug">
            <strong className="text-zinc-100 mr-1.5 font-bold">@{post.authorUsername}</strong>
            <span className="text-zinc-300 font-medium">{post.content}</span>
          </p>
        </div>

        {/* Comments Section */}
        {post.comments && post.comments.length > 0 && (
          <div className="pt-3 border-t border-zinc-950 space-y-2">
            {post.comments.map((comm) => (
              <div key={comm.id} className="text-xs flex items-start gap-2 text-zinc-400">
                <span 
                  onClick={() => openMemberProfile(comm.author)}
                  className="font-bold text-zinc-200 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                >
                  @{comm.author.toLowerCase().replace(/\s+/g, '_')}
                </span>
                <p className="flex-1 text-left text-zinc-300 leading-relaxed">{comm.content}</p>
                <span className="text-[9px] text-zinc-650 font-mono shrink-0">{comm.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Post Comment Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-zinc-950">
          <input
            type="text"
            value={localCommentText}
            onChange={(e) => setLocalCommentText(e.target.value)}
            placeholder="Add a comment on this progress..."
            className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/20"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-amber-400 hover:text-amber-300 border border-zinc-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
});

interface StoryItem {
  id: string;
  author: string;
  avatar: string;
  image: string;
  text: string;
  viewed?: boolean;
  musicUrl?: string;
  musicName?: string;
}

interface MessageItem {
  id: string;
  sender: 'me' | 'them';
  content: string;
  time: string;
}

interface ChatChannel {
  id: string;
  name: string;
  avatar: string;
  title: string;
  status: 'online' | 'offline';
  messages: MessageItem[];
}

const COMMUNITY_MEMBERS = [
  "Sajid Rahman", "Tahmid Alvi", "Fahim Ahmed", "Rohan Kabir", "Adnan Chowdhury"
];

function calculateOrganicLikes(text: string, hasMedia: boolean, createdAt?: string, postId?: string): number {
  const cleanText = (text || "").toLowerCase();
  
  // Self-improvement & looksmaxing keywords
  const selfImprovementKeywords = [
    "glowup", "glow-up", "looksmax", "looksmaxing", "mewing", "skincare", "gym", 
    "workout", "discipline", "progress", "transformation", "selfie", "jawline", 
    "hairmaxing", "habit", "fitness", "bodybuilding", "posture", "ice water",
    "alhamdulillah", "mashaallah", "subhanallah", "effort", "fajr", "salat",
    "সকাল", "ওয়ার্কআউট", "মিয়োইং", "স্কিন কেয়ার", "গ্লো-আপ", "ডিসিপ্লিন", 
    "প্রোগ্রেস", "ফটো", "ফিটনেস", "মোটিভেশন", "লাইফস্টাইল", "অভ্যাস", "পার্সোনালিটি",
    "চুল", "ফেসিয়াল", "জিম", "শারীরিক", "উন্নতি", "স্বাস্থ্য", "খাবার", "ডায়েট"
  ];
  
  let matchCount = 0;
  for (const kw of selfImprovementKeywords) {
    if (cleanText.includes(kw)) {
      matchCount++;
    }
  }

  // Deterministic seed from postId or content to ensure stability across renders
  let hash = 0;
  const seedStr = (postId || '') + (text || '');
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  // Determine target auto-likes range (10 to 500)
  let targetLikes = 25;
  const isSelfImprovementOrLooksmax = matchCount > 0 || cleanText.length > 25 || hasMedia;

  if (isSelfImprovementOrLooksmax) {
    // High-tier target between 120 and 500 likes based on matchCount, media, and hash
    const baseVal = 120 + (matchCount * 40) + (hasMedia ? 50 : 0) + (cleanText.length > 60 ? 30 : 0);
    const hashVariation = positiveHash % 160;
    targetLikes = Math.min(500, Math.max(120, baseVal + hashVariation));
  } else {
    // Standard tier target between 10 and 120
    targetLikes = Math.min(120, Math.max(10, 15 + (positiveHash % 90)));
  }

  // Gradual growth over time ("aste aste barbe")
  const postTime = createdAt ? new Date(createdAt).getTime() : Date.now();
  const elapsedMs = Math.max(0, Date.now() - postTime);
  const elapsedMinutes = elapsedMs / 60000;

  // Initial immediate likes (10 to 30)
  const initialLikes = Math.min(targetLikes, 10 + (positiveHash % 20));
  
  // Growth rate: gradually increases auto-likes over time
  const growth = Math.floor(elapsedMinutes * 6);
  const currentAutoLikes = Math.min(targetLikes, initialLikes + growth);

  return currentAutoLikes;
}

interface VoiceMessagePlayerProps {
  content: string;
  sender: 'me' | 'them';
}

function VoiceMessagePlayer({ content, sender }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<any>(null);

  // Extract base64 or custom audio data
  const hasAudioData = content.includes('[AUDIO_DATA]');
  const audioParts = content.split('[AUDIO_DATA]');
  const cleanContent = audioParts[0];
  const base64Audio = hasAudioData ? audioParts[1] : '';

  // Extract duration from string, e.g. "🎙️ Voice Message (0:05)"
  const durationStr = cleanContent.match(/\d+:\d+/)?.[0] || '0:05';
  const parts = durationStr.split(':');
  const secondsTotal = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsPlaying(true);
      setProgress(0);

      if (base64Audio) {
        try {
          if (!audioRef.current) {
            audioRef.current = new Audio(base64Audio);
          }
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1.0;
          audioRef.current.play().catch(e => console.warn("Audio playback failed:", e));
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
            setProgress(100);
            if (intervalRef.current) clearInterval(intervalRef.current);
          };
        } catch (e) {
          console.error("Failed to play real recorded audio:", e);
        }
      }

      let currentSec = 0;
      intervalRef.current = setInterval(() => {
        currentSec += 0.1;
        if (currentSec >= secondsTotal) {
          setIsPlaying(false);
          setProgress(100);
          clearInterval(intervalRef.current);
        } else {
          setProgress((currentSec / secondsTotal) * 1000);
        }
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3.5 min-w-[200px] select-none py-1 text-left">
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all ${
          isPlaying 
            ? 'bg-amber-500 text-zinc-950 scale-105' 
            : 'bg-zinc-900 border border-zinc-800 text-amber-500 hover:text-amber-400'
        }`}
      >
        {isPlaying ? (
          <span className="flex items-center gap-0.5 justify-center">
            <span className="w-1 h-3 bg-zinc-950 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-zinc-950 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-3 bg-zinc-950 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        ) : (
          <Play className="w-3.5 h-3.5 fill-amber-500 text-amber-500 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-0.5 h-6">
          {Array.from({ length: 18 }).map((_, i) => {
            const baseHeights = [3, 5, 8, 4, 6, 12, 10, 4, 6, 8, 14, 8, 4, 10, 12, 6, 4, 3];
            const height = baseHeights[i % baseHeights.length];
            const isActive = isPlaying && (i / 18) * 1000 <= progress;
            return (
              <span
                key={i}
                style={{ height: `${height * 1.5}px` }}
                className={`w-[3px] rounded-full transition-all duration-150 ${
                  isActive 
                    ? 'bg-amber-500' 
                    : 'bg-zinc-800'
                }`}
              />
            );
          })}
        </div>
        
        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
          <span>{isPlaying ? 'Playing...' : 'Voice Note'}</span>
          <span>{durationStr}</span>
        </div>
      </div>
    </div>
  );
}

export const DEFAULT_MODEL_PERSONAS = [
  { id: 'hamza_malik', name: 'Hamza Malik', handle: '@hamza_malik', avatar: '/assets/models/hamza_malik.jpg', badge: 'MODEL', bio: 'Aesthetic Lifestyle & Modern Pakistani Streetwear Model 🇵🇰⚡' },
  { id: 'zaviyar_nauman', name: 'Zaviyar Nauman', handle: '@zaviyar_nauman', avatar: '/assets/models/zaviyar_nauman.jpg', badge: 'MODEL', bio: "Men's High-Fashion & Editorial Looksmaxing Creator 🔱" },
  { id: 'daniyal_zafar', name: 'Daniyal Zafar', handle: '@daniyal_zafar', avatar: '/assets/models/daniyal_zafar.jpg', badge: 'MODEL', bio: 'Pakistani TikTok Star & Vibe Aesthetics ✨' },
  { id: 'bilal_abbas', name: 'Bilal Abbas', handle: '@bilal_abbas', avatar: '/assets/models/bilal_abbas.jpg', badge: 'MODEL', bio: 'Classic Grooming, Chiseled Frame & Mindset 💎' },
  { id: 'shahzad_noor', name: 'Shahzad Noor', handle: '@shahzad_noor', avatar: '/assets/models/shahzad_noor.jpg', badge: 'MODEL', bio: "Aesthetic Athlete & Men's Physique Model 🔥" },
  { id: 'zarrar_khan', name: 'Zarrar Khan', handle: '@zarrar_khan', avatar: '/assets/models/zarrar_khan.jpg', badge: 'MODEL', bio: 'Elite Silent Aura & Fluffy Hair Looksmaxing ✦' },
  { id: 'niromax', name: 'Atif Nirob', handle: '@niromax', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', badge: 'CREATOR', bio: 'Founder & Lead Creator - GrowGram & SelfX' }
];

export const BOT_ID_SET = new Set(['hamza_malik', 'zaviyar_nauman', 'daniyal_zafar', 'bilal_abbas', 'shahzad_noor', 'zarrar_khan', 'sajid_rahman', 'tahmid_alvi', 'fahim_ahmed', 'yourzfai', 'abbas_khan', 'sajid', 'tahmid', 'fahim', 'abbas', 'anonymous_recruit']);

export const isFakeBotId = (idOrUname?: string) => {
  if (!idOrUname) return false;
  const clean = idOrUname.toLowerCase().trim().replace(/^m_/, '').replace(/^@/, '');
  if (clean === 'niromax' || clean === 'atif nirob') return false;
  if (clean.startsWith('seeded_') || clean.startsWith('sim_') || clean.startsWith('user_') || clean === 'guest' || clean === 'itsatifbro' || clean === 'atif') return true;
  return BOT_ID_SET.has(clean);
};

export const isMatchMember = (id1?: string, id2?: string) => {
  if (!id1 || !id2) return false;
  const s1 = id1.toLowerCase().trim().replace(/^@/, '');
  const s2 = id2.toLowerCase().trim().replace(/^@/, '');
  if (s1 === s2) return true;
  const s1NoM = s1.replace(/^m_/, '');
  const s2NoM = s2.replace(/^m_/, '');
  if (s1NoM === s2NoM) return true;
  const s1Email = s1NoM.includes('@') ? s1NoM.split('@')[0] : s1NoM;
  const s2Email = s2NoM.includes('@') ? s2NoM.split('@')[0] : s2NoM;
  return s1Email === s2Email;
};

export const isBetweenUs = (dm: any, myId: string, friendId: string) => {
  if (!dm) return false;
  return (isMatchMember(dm.senderId, myId) && isMatchMember(dm.receiverId, friendId)) ||
         (isMatchMember(dm.senderId, friendId) && isMatchMember(dm.receiverId, myId));
};

interface OurCommunityProps {
  userProfile: UserProfileInfo;
  onEarnPoints?: (amount: number, reason: string) => void;
  setUserProfile?: (profile: UserProfileInfo) => void;
  onBack?: () => void;
  memberId?: string;
  initialTikTokUrl?: string;
}

const syncedMediaToServerCache = new Set<string>();

export default function OurCommunity({ userProfile, onEarnPoints, setUserProfile, onBack, memberId: propMemberId, initialTikTokUrl }: OurCommunityProps) {
  useEffect(() => {
    acquireBgMusicPauseLock('component:growgram');
    return () => releaseBgMusicPauseLock('component:growgram');
  }, []);
  const [activeView, setActiveView] = useState<'feed' | 'explore' | 'messages' | 'directory' | 'me'>('feed');
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  const hasInitialSyncedBackupsRef = useRef(false);

  // TikTok & Instagram Downloader & Model Auto-Publisher state
  const [showTikTokModal, setShowTikTokModal] = useState<boolean>(Boolean(initialTikTokUrl));
  const [tikTokUrlInput, setTikTokUrlInput] = useState<string>(initialTikTokUrl || '');
  const [isTikTokDownloading, setIsTikTokDownloading] = useState<boolean>(false);
  const [tikTokStep, setTikTokStep] = useState<number>(0); // 0: idle, 1: downloading, 2: assigning model, 3: uploading, 4: complete
  const [tikTokAutoCountdown, setTikTokAutoCountdown] = useState<number | null>(null);
  
  // Real models created & configured by the user in Model Option (SecretModelVault)
  const [availableModelPersonas, setAvailableModelPersonas] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_custom_ai_personas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_MODEL_PERSONAS;
  });
  const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);

  // Sync when user adds/modifies a model in Model Option
  useEffect(() => {
    const onPersonasUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setAvailableModelPersonas(e.detail);
      }
    };
    window.addEventListener('selfx_custom_personas_updated', onPersonasUpdate);

    // Initial check from server
    fetch('/api/community/personas')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.personas) && data.personas.length > 0) {
          setAvailableModelPersonas(prev => {
            const merged = [...prev];
            data.personas.forEach((sp: any) => {
              const idx = merged.findIndex(p => p.id === sp.id || (p.handle && sp.handle && p.handle.toLowerCase() === sp.handle.toLowerCase()));
              if (idx !== -1) merged[idx] = { ...merged[idx], ...sp };
              else merged.push(sp);
            });
            return merged;
          });
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('selfx_custom_personas_updated', onPersonasUpdate);
  }, []);

  const activeChosenModel = availableModelPersonas[selectedModelIdx % availableModelPersonas.length] || availableModelPersonas[0] || DEFAULT_MODEL_PERSONAS[0];

  useEffect(() => {
    if (initialTikTokUrl) {
      setTikTokUrlInput(initialTikTokUrl);
      setShowTikTokModal(true);
      setTikTokAutoCountdown(3);
    }
  }, [initialTikTokUrl]);

  // Auto-scan clipboard for TikTok/Instagram link so user NEVER has to paste manually
  useEffect(() => {
    if (showTikTokModal && !tikTokUrlInput) {
      if (navigator.clipboard?.readText) {
        navigator.clipboard.readText().then(text => {
          if (text && (text.includes('tiktok.com') || text.includes('douyin.com') || text.includes('instagram.com') || text.includes('instagr.am'))) {
            const m = text.match(/https?:\/\/[^\s]+/i);
            const link = m ? m[0] : text.trim();
            setTikTokUrlInput(link);
            triggerNotification("🎬 ভিডিও লিংক সনাক্ত হয়েছে!", "ডাউনলোড বাটনে ক্লিক করলেই অটো-পোস্ট হবে!");
          }
        }).catch(() => {});
      }
    }
  }, [showTikTokModal, tikTokUrlInput]);

  // Handle auto-countdown for zero-friction share and auto-upload
  useEffect(() => {
    if (tikTokAutoCountdown === null || isTikTokDownloading) return;
    if (tikTokAutoCountdown <= 0) {
      setTikTokAutoCountdown(null);
      handleTikTokDownloadAndAutoPost();
      return;
    }
    const timer = setTimeout(() => {
      setTikTokAutoCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [tikTokAutoCountdown, isTikTokDownloading]);
  
  // Profile specific states
  const [userBio, setUserBioState] = useState(() => {
    return userProfile.bio || localStorage.getItem('lookmax_user_bio_v3') || 'Glowup monk on a relentless self-care & looksmaxing journey. Live timeline active. 🔥';
  });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(userBio);
  const [ratedMovies, setRatedMovies] = useState<any[]>([]);
  const [profileSubTab, setProfileSubTab] = useState<'posts' | 'friends' | 'cinema'>('posts');
  const [selectedProfilePost, setSelectedProfilePost] = useState<PostItem | null>(null);

  // Fetch rated movies when Entering or refreshing profile
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lookmax_movies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRatedMovies(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeView]);

  const handleSaveBio = () => {
    setUserBioState(bioInput);
    localStorage.setItem('lookmax_user_bio_v3', bioInput);
    if (setUserProfile) {
      setUserProfile({
        ...userProfile,
        bio: bioInput
      });
    }
    setIsEditingBio(false);
    triggerNotification("📝 Bio Updated", "Your profile biography has been successfully updated!");
  };
  
  // Real dynamic user stats from LocalStorage gamification sync
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('lookmax_gamification_points_v1');
    return saved ? parseInt(saved) || 0 : 0;
  });

  const [badgesList, setBadgesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('lookmax_gamification_badges_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return ['Glowup Initiate'];
  });

  const userLevel = Math.floor(userPoints / 200) + 1;

  // Search filter for Member Directory
  const [directorySearch, setDirectorySearch] = useState('');

  // Persistent unique member ID for multi-user sharing (deterministic per username to allow multi-device sync)
  const memberId = React.useMemo(() => {
    if (propMemberId) return propMemberId;
    if (userProfile && userProfile.username) {
      const cleanUsername = userProfile.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername) return 'm_' + cleanUsername;
    }
    if (userProfile && userProfile.name) {
      const cleanName = userProfile.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanName) {
        return 'm_' + cleanName;
      }
    }
    let id = localStorage.getItem('lookmax_member_id_v2');
    if (!id) {
      id = 'm_' + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem('lookmax_member_id_v2', id);
    }
    return id;
  }, [propMemberId, userProfile?.name, userProfile?.username, userProfile?.numberId]);

  const [posts, setPosts] = useState<PostItem[]>(() => {
    try {
      const cached = localStorage.getItem('selfx_all_cached_posts') || localStorage.getItem('glowgram_posts');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [allServerMembers, setAllServerMembers] = useState<any[]>([]);
  const [serverDMs, setServerDMs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_cached_dms');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [stories, setStories] = useState<StoryItem[]>([]);

  const fetchStories = async (isForced: boolean = false) => {
    try {
      const cacheParam = isForced ? `?t=${Date.now()}` : '';
      const res = await fetch(`/api/community/stories${cacheParam}`, {
        cache: isForced ? 'no-store' : 'default',
        signal: AbortSignal.timeout(3500)
      });
      const data = await res.json();
      if (data && data.success && data.stories) {
        setStories(data.stories);
      }
    } catch (err) {
      console.warn("Notice: stories fetch skipped or timed out:", err);
    }
  };

  const [showStoryModal, setShowStoryModal] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [newStoryImage, setNewStoryImage] = useState<string | null>(null);
  const [newStoryImageName, setNewStoryImageName] = useState('');
  const [newStoryMusicUrl, setNewStoryMusicUrl] = useState<string | null>(null);
  const [newStoryMusicName, setNewStoryMusicName] = useState('');

  const storyMusicFileInputRef = useRef<HTMLInputElement>(null);
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);

  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostImageName, setNewPostImageName] = useState('');
  
  // Video upload states
  const [newPostVideo, setNewPostVideo] = useState<string | null>(null);
  const [newPostVideoPreview, setNewPostVideoPreview] = useState<string | null>(null);
  const [newPostVideoName, setNewPostVideoName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoUploadPromiseRef = useRef<Promise<any> | null>(null);
  
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeExplorePost, setActiveExplorePost] = useState<PostItem | null>(null);
  
  // Direct Message states
  const [chats, setChats] = useState<ChatChannel[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [chatInputText, setChatInputText] = useState('');

  // Voice recording states and selected profile states
  const [selectedProfileMember, setSelectedProfileMember] = useState<any | null>(null);
  const [memberProfileTab, setMemberProfileTab] = useState<'about' | 'posts' | 'movies'>('about');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Feed scroll container reference for instant smooth scrolling on refresh/rotate
  const feedScrollContainerRef = useRef<HTMLDivElement>(null);

  // Custom feed order persistence so shuffles stay persistent and never flip back prematurely
  const customFeedOrderRef = useRef<string[] | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('growgram_shuffled_order') || sessionStorage.getItem('growgram_shuffled_order');
      if (saved) customFeedOrderRef.current = JSON.parse(saved);
    } catch (e) {}
  }, []);

  // Video replacement cycle counter for in-place video rotation on refresh
  const videoCycleCounterRef = useRef<number>(0);

  // Helper to shuffle & rotate feed posts so top/bottom items flip and reorder dynamically
  const shufflePostsOrder = (list: PostItem[]): PostItem[] => {
    if (list.length <= 1) return [...list];
    const arr = [...list];
    
    // Perform Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    // Ensure the top item noticeably flips if there are multiple items
    if (arr[0]?.id === list[0]?.id && arr.length > 1) {
      const first = arr.shift();
      if (first) arr.push(first);
    }
    return arr;
  };

  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    triggerNotification("🔄 ফিড ও সিরিয়াল রিফ্রেশ হচ্ছে...", "ভিডিওগুলোর ক্রম এবং সিরিয়াল নম্বর পরিবর্তিত হচ্ছে...");

    try {
      videoSrcMemoryCache.clear();

      // Clear existing order cache so a genuinely new shuffled order is generated
      localStorage.removeItem('growgram_shuffled_order');
      sessionStorage.removeItem('growgram_shuffled_order');
      customFeedOrderRef.current = null;

      // Fetch latest posts with shouldShuffle = true to reorder videos and rotate serial numbers
      await fetchPosts(true, true);
      lastRefreshTimeRef.current = Date.now();

      // Smoothly scroll back to top of feed so user sees the newly rotated videos & updated serial numbers (#1, #2...)
      if (feedScrollContainerRef.current) {
        feedScrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      triggerNotification("✨ রিফ্রেশ সম্পন্ন!", "ভিডিওগুলোর নতুন ক্রম ও সিরিয়াল নাম্বার (#১, #২...) সক্রিয় হয়েছে!");
    } catch (err) {
      console.warn("GrowGram refresh notice:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // TikTok & Instagram Downloader & Model Auto-Publisher
  const handleTikTokDownloadAndAutoPost = async (overrideUrl?: string, overrideHtml?: string) => {
    const rawInput = (overrideUrl || tikTokUrlInput).trim();
    const providedHtml = (overrideHtml || (rawInput.startsWith('<') || rawInput.includes('<!DOCTYPE') || rawInput.includes('<html') ? rawInput : '')).trim();
    const url = providedHtml ? (rawInput.match(/https?:\/\/[^\s"']+/i)?.[0] || '') : rawInput;

    if (!url && !providedHtml) {
      triggerNotification("⚠️ লিংক বা HTML প্রয়োজন", "দয়া করে একটি TikTok / Instagram ভিডিও লিংক বা ডাউনলোডার পেজের HTML দিন!");
      return;
    }

    const isInstagram = url.includes('instagram.com') || url.includes('instagr.am') || providedHtml.includes('instagram.com');
    const platformLabel = isInstagram ? 'Instagram Reel' : 'TikTok';

    setTikTokAutoCountdown(null);
    setIsTikTokDownloading(true);
    setTikTokStep(1); // 1: Downloading full video

    try {
      await new Promise(r => setTimeout(r, 600));
      setTikTokStep(2); // 2: Assigning model

      const safeModel = activeChosenModel || DEFAULT_MODEL_PERSONAS[0];
      const res = await fetch('/api/community/tiktok/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url || undefined,
          htmlContent: providedHtml || undefined,
          customPersona: {
            id: safeModel?.id || 'niromax',
            name: safeModel?.name || 'Atif Nirob',
            handle: safeModel?.handle || '@niromax',
            avatar: safeModel?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
            badge: safeModel?.badge || 'CREATOR'
          }
        })
      });

      const data = await res.json();
      if (!data || !data.success || !data.post) {
        throw new Error(data?.error || "Failed to download video");
      }

      setTikTokStep(3); // 3: Uploading & publishing
      await new Promise(r => setTimeout(r, 500));

      const newPost: PostItem = {
        id: data.post.id || `post-${Date.now()}`,
        author: safeModel?.name || data.post.author || 'Atif Nirob',
        authorUsername: (safeModel?.handle || data.post.numberId || 'creator').replace(/^@/, ''),
        authorBadge: safeModel?.badge || 'CREATOR',
        avatarUrl: safeModel?.avatar || data.post.avatarUrlOrBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        time: 'Just now',
        content: data.post.content || 'Aesthetic grind 🔥',
        video: data.post.video || data.videoUrl || '',
        image: data.post.image || '',
        sourceUrl: url || data.post.sourceUrl || undefined,
        likes: data.post.likedBy?.length || 12,
        likedByUser: false,
        comments: [],
        createdAt: data.post.createdAt || new Date().toISOString()
      };

      // Cache video in memory and IndexedDB Blob store immediately so it survives restarts & hours of inactivity
      if (newPost.video) {
        videoSrcMemoryCache.set(newPost.video, newPost.video);
        videoSrcMemoryCache.set(newPost.id, newPost.video);
        cacheRemoteVideoToIndexedDB(newPost.video, [newPost.id]).catch(() => {});
      }

      // Persist in permanent dedicated TikTok store so it NEVER disappears on reload or session switch
      try {
        const rawPerm = localStorage.getItem('selfx_permanent_tiktok_posts');
        const permList = rawPerm ? JSON.parse(rawPerm) : [];
        localStorage.setItem('selfx_permanent_tiktok_posts', JSON.stringify([newPost, ...permList.filter((p: any) => p.id !== newPost.id)]));

        const rawLocal = localStorage.getItem('selfx_user_local_posts');
        const localList = rawLocal ? JSON.parse(rawLocal) : [];
        localStorage.setItem('selfx_user_local_posts', JSON.stringify([newPost, ...localList.filter((p: any) => p.id !== newPost.id)]));

        const rawAll = localStorage.getItem('glowgram_posts');
        const allList = rawAll ? JSON.parse(rawAll) : [];
        localStorage.setItem('glowgram_posts', JSON.stringify([newPost, ...allList.filter((p: any) => p.id !== newPost.id)]));

        // Persist feed order in BOTH localStorage and sessionStorage
        customFeedOrderRef.current = [newPost.id, ...(customFeedOrderRef.current || []).filter(id => id !== newPost.id)];
        localStorage.setItem('growgram_shuffled_order', JSON.stringify(customFeedOrderRef.current));
        sessionStorage.setItem('growgram_shuffled_order', JSON.stringify(customFeedOrderRef.current));
      } catch (e) {}

      // Guarantee server persistence as well
      try {
        fetch('/api/community/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newPost.id,
            author: newPost.author,
            avatarUrlOrBase64: newPost.avatarUrl,
            numberId: newPost.authorUsername,
            content: newPost.content,
            video: newPost.video,
            image: newPost.image,
            sourceUrl: newPost.sourceUrl,
            isLead: true,
            createdAt: newPost.createdAt
          })
        }).catch(() => {});
      } catch (e) {}

      setPosts(prev => [newPost, ...prev.filter(p => p.id !== newPost.id)]);
      setTikTokStep(4); // 4: Complete!

      // Smoothly bring the newly uploaded video right before the user's eyes
      requestAnimationFrame(() => {
        if (feedScrollContainerRef.current) {
          feedScrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      triggerNotification("🎉 ডাউনলোড ও আপলোড সফল!", `${activeChosenModel.name} প্রোফাইল থেকে পুরো ${platformLabel} GrowGram-এ সফলভাবে পোস্ট হয়েছে!`);

      setTimeout(() => {
        setShowTikTokModal(false);
        setIsTikTokDownloading(false);
        setTikTokStep(0);
        setTikTokUrlInput('');
      }, 1200);

    } catch (err: any) {
      console.error("Video download error:", err);
      triggerNotification("⚠️ ডাউনলোড সমস্যা", err.message || "ভিডিও প্রসেস করা সম্ভব হয়নি। লিংকটি সঠিক ও পাবলিক কি না নিশ্চিত করুন।");
      setIsTikTokDownloading(false);
      setTikTokStep(0);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecordingVoice = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        
        let recorder: MediaRecorder;
        try {
          const options = { mimeType: 'audio/webm' };
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            recorder = new MediaRecorder(stream, options);
          } else {
            recorder = new MediaRecorder(stream);
          }
        } catch (e) {
          recorder = new MediaRecorder(stream);
        }

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      } else {
        alert("Microphone not supported on this browser!");
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
      triggerNotification("⚠️ Microphone Error", "Could not access microphone.");
    }
  };

  const stopRecordingVoiceAndGetBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve('');
        return;
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        try {
          recorder.stream.getTracks().forEach(track => track.stop());
        } catch (e) {}

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string || '');
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.stop();
    });
  };

  const handleCancelRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {
        try {
          recorder.stream.getTracks().forEach(track => track.stop());
        } catch (e) {}
      };
      recorder.stop();
    }
    setIsRecording(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (activeView === 'messages' && selectedChatId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serverDMs.length, selectedChatId, activeView]);

  // FETCH MEMBERS FROM SERVER
  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/community/members?t=${Date.now()}`, { 
        cache: 'no-store',
        signal: AbortSignal.timeout(3500)
      });
      const data = await res.json();
      if (data.success && data.members) {
        // Authoritative clean list from server only - real accounts only
        const cleanMembers = data.members.filter((m: any) => 
          m && m.id && !isFakeBotId(m.id) && !isFakeBotId(m.username)
        );
        setAllServerMembers(cleanMembers);
      }
    } catch (err) {
      console.warn("Notice: community members fetch skipped or timed out:", err);
    }
  };

  // FETCH DMs FROM SERVER
  const fetchDMs = async () => {
    try {
      const targetId = effectiveMemberId || memberId;
      const res = await fetch(`/api/community/dms?memberId=${targetId}&t=${Date.now()}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3500)
      });
      const data = await res.json();
      if (data.success && data.messages) {
        const currentMsgs = data.messages;
        if (serverDMs.length > 0) {
          const knownIds = new Set(serverDMs.map(m => m.id));
          currentMsgs.forEach((dm: any) => {
            if (isMatchMember(dm.receiverId, targetId) && !knownIds.has(dm.id)) {
              const sender = allServerMembers.find(m => isMatchMember(m.id, dm.senderId));
              const senderName = sender ? sender.name : 'কারো থেকে';
              triggerNotification(`💬 ${senderName} থেকে নতুন মেসেজ`, dm.content);
            }
          });
        }
        
        // Merge with existing cached messages without duplicates
        const mergedMap = new Map<string, any>();
        currentMsgs.forEach((dm: any) => {
          if (dm && dm.id) mergedMap.set(dm.id, dm);
        });
        
        serverDMs.forEach(dm => {
          if (dm && dm.id && dm.id.startsWith('dm_local_')) {
            const alreadyOnServer = currentMsgs.some((sDm: any) => 
              isMatchMember(sDm.senderId, dm.senderId) && 
              isMatchMember(sDm.receiverId, dm.receiverId) && 
              sDm.content === dm.content
            );
            if (!alreadyOnServer) {
              mergedMap.set(dm.id, dm);
            }
          }
        });
        
        const finalDMs = Array.from(mergedMap.values());
        setServerDMs(finalDMs);
        try {
          localStorage.setItem('selfx_cached_dms', JSON.stringify(finalDMs));
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Notice: DMs fetch timed out or offline:", err);
    }
  };

  // FETCH POSTS FROM SERVER WITH CACHE PERSISTENCE
  const fetchPosts = async (shouldShuffle: boolean = false, isForced: boolean = false) => {
    try {
      const cacheParam = `?t=${Date.now()}`;

      // Concurrently fetch posts and vault data with zero browser disk caching for cross-device sync
      const [postsRes, vaultRes] = await Promise.all([
        fetch(`/api/community/posts${cacheParam}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' },
          signal: AbortSignal.timeout(5000)
        }).then(r => r.json()).catch(err => {
          console.warn("Notice: posts fetch skipped or timed out:", err);
          return { success: false, posts: [] };
        }),
        fetch(`/api/community/vault${cacheParam}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' },
          signal: AbortSignal.timeout(5000)
        }).then(r => r.json()).catch(err => {
          console.warn("Notice: vault fetch skipped or timed out:", err);
          return { success: false, vault: [] };
        })
      ]);

      const data = postsRes;
      const serverVaultItems: any[] = (vaultRes && vaultRes.success && Array.isArray(vaultRes.vault)) ? vaultRes.vault : [];

      if (data.success && data.posts) {
        let likedByMe: string[] = [];
        try {
          likedByMe = JSON.parse(localStorage.getItem('glowgram_liked_by_me') || '[]');
        } catch (e) {}
  
        // Load our local backups (posts created on this device)
        let localBackups: any[] = [];
        try {
          localBackups = JSON.parse(localStorage.getItem('selfx_user_local_posts') || '[]');
        } catch (e) {}

        // Load dedicated permanent TikTok posts so they NEVER disappear
        let permanentTikTokPosts: any[] = [];
        try {
          permanentTikTokPosts = JSON.parse(localStorage.getItem('selfx_permanent_tiktok_posts') || '[]');
        } catch (e) {}
  
        // Load previously cached posts (if not forced refresh)
        let previouslyCached: any[] = [];
        if (!isForced) {
          try {
            const cachedStr = localStorage.getItem('selfx_all_cached_posts') || localStorage.getItem('glowgram_posts');
            if (cachedStr) {
              previouslyCached = JSON.parse(cachedStr);
            }
          } catch (e) {}
        }

        // Load our deleted posts to avoid syncing them
        let deletedPostIds: string[] = [];
        try {
          deletedPostIds = JSON.parse(localStorage.getItem('selfx_deleted_posts') || '[]');
        } catch (e) {}
  
        const serverPosts = data.posts || [];
        const mergedMap = new Map<string, any>();
        const serverIds = new Set(serverPosts.map((p: any) => p.id));
        const localBackupIds = new Set(localBackups.map((p: any) => p.id));
  
        // Helper to map DBPost format (server/local raw posts) to frontend PostItem format
        const mapRawPostToFrontend = (p: any) => {
          const likedByUser = p.likedBy?.includes(memberId) || p.likedBy?.includes(userProfile.name) || likedByMe.includes(p.id);
          const rawLikes = Array.isArray(p.likedBy) ? p.likedBy.length : 0;
          const autoLikes = calculateOrganicLikes(p.content || '', Boolean(p.image || p.video), p.createdAt, p.id);
          const totalLikes = Math.max(rawLikes + autoLikes, p.likes || 0, likedByUser ? 1 : 0);

          const rawAuthor = (p.author && p.author.trim()) ? p.author.trim() : (p.isLead ? 'Atif (Lead Creator)' : 'Glowup Member');
          const isAtif = rawAuthor.includes('Atif') || p.numberId === 'itsatifbro';

          const isUserAuthor = (
            (p.author && userProfile.name && p.author.toLowerCase().trim() === userProfile.name.toLowerCase().trim()) ||
            (p.authorUsername && userProfile.numberId && p.authorUsername.toLowerCase().trim() === userProfile.numberId.toLowerCase().trim()) ||
            (p.author && userProfile.numberId && p.author.toLowerCase().trim() === userProfile.numberId.toLowerCase().trim())
          );

          const authorHandle = (p.numberId && p.numberId !== 'N/A' && p.numberId !== 'creator')
            ? p.numberId.replace(/^@/, '')
            : (isAtif ? 'itsatifbro' : rawAuthor.toLowerCase().replace(/[^a-z0-9_]/g, ''));

          const postAvatar = isUserAuthor ? (userProfile.avatarBase64 || p.avatarUrlOrBase64 || p.avatarUrl) : (p.avatarUrlOrBase64 || p.avatarUrl);

          return {
            id: p.id,
            author: rawAuthor,
            authorUsername: authorHandle,
            authorBadge: (p.isLead || isAtif) ? 'CREATOR' : undefined,
            avatarUrl: postAvatar || (isAtif ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'),
            time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: p.content,
            image: p.image || undefined,
            video: p.video || undefined,
            sourceUrl: p.sourceUrl || undefined,
            likes: totalLikes,
            likedByUser,
            comments: (p.comments || []).map((c: any) => {
              const isCommentUser = (
                (c.author && userProfile.name && c.author.toLowerCase().trim() === userProfile.name.toLowerCase().trim()) ||
                (c.author && userProfile.numberId && c.author.toLowerCase().trim() === userProfile.numberId.toLowerCase().trim())
              );
              return {
                id: c.id,
                author: c.author,
                avatar: isCommentUser ? (userProfile.avatarBase64 || c.avatarUrlOrBase64 || c.avatar) : (c.avatarUrlOrBase64 || c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'),
                content: c.content,
                time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }),
            createdAt: p.createdAt || new Date().toISOString()
          };
        };

        // 1. Populate map with previously cached posts
        previouslyCached.forEach((p: any) => {
          if (p && p.id && !deletedPostIds.includes(p.id)) {
            mergedMap.set(p.id, p);
          }
        });
  
        // 2. Populate/Overwrite map with local backups (always keep local posts)
        localBackups.forEach((lp: any) => {
          if (lp && lp.id && !deletedPostIds.includes(lp.id)) {
            mergedMap.set(lp.id, mapRawPostToFrontend(lp));
          }
        });
  
        // 3. Sync with server posts if any are returned
        if (serverPosts.length > 0) {
          // Overwrite with fresh server data without deleting cached posts
          serverPosts.forEach((sp: any) => {
            if (sp && sp.id && !deletedPostIds.includes(sp.id)) {
              mergedMap.set(sp.id, mapRawPostToFrontend(sp));
            }
          });
        }

        // 3b. Guaranteed retention of permanent TikTok posts (never deleted by server sync)
        permanentTikTokPosts.forEach((pt: any) => {
          if (pt && pt.id && !deletedPostIds.includes(pt.id)) {
            mergedMap.set(pt.id, mapRawPostToFrontend(pt));
          }
        });

        // Load items from Secret Model Vault (BOTH SERVER AND LOCAL) and convert to AI posts
        try {
          const vaultStr = localStorage.getItem('selfx_vault_photos_backup_v2') || localStorage.getItem('selfx_secret_model_vault');
          const localVaultItems = vaultStr ? JSON.parse(vaultStr) : [];
          
          const allVaultItems = [...serverVaultItems];
          localVaultItems.forEach((lv: any) => {
            if (lv && lv.id && !allVaultItems.some((sv: any) => sv.id === lv.id)) {
              allVaultItems.push(lv);
            }
          });

          allVaultItems.forEach((item: any, idx: number) => {
            if (item && (item.image || item.video)) {
              const vaultPostId = item.id || `vault-model-post-${idx}-${item.persona}`;
              if (!mergedMap.has(vaultPostId) && !deletedPostIds.includes(vaultPostId)) {
                let savedPersonas: any[] = [];
                try {
                  const customP = localStorage.getItem('selfx_custom_ai_personas');
                  if (customP) savedPersonas = JSON.parse(customP);
                } catch (e) {}

                const defaultPersonaMap: Record<string, { name: string; avatar: string; badge: string; handle: string }> = {
                  niromax: { name: 'Atif Nirob', handle: '@niromax', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', badge: 'CREATOR' },
                  atif: { name: 'Atif Nirob', handle: '@niromax', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', badge: 'CREATOR' },
                  itsatifbro: { name: 'Atif Nirob', handle: '@niromax', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', badge: 'CREATOR' },
                  my_account: { name: 'Atif Nirob', handle: '@niromax', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', badge: 'CREATOR' }
                };

                const foundCustom = savedPersonas.find((sp: any) => sp.id === item.persona);
                const meta = item.author ? {
                  name: item.author,
                  handle: item.numberId ? `@${item.numberId.replace(/^@/, '')}` : (item.handle || (foundCustom ? foundCustom.handle : '@creator')),
                  avatar: item.avatar || (foundCustom ? foundCustom.avatar : (defaultPersonaMap[item.persona]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80')),
                  badge: (item.author.includes('Atif') || item.persona === 'atif') ? 'CREATOR' : 'AI CREATOR'
                } : (foundCustom ? {
                  name: foundCustom.name,
                  handle: foundCustom.handle,
                  avatar: foundCustom.avatar,
                  badge: 'CREATOR'
                } : (defaultPersonaMap[item.persona] || defaultPersonaMap.atif));

                const isVideo = item.mediaType === 'video' || (typeof item.image === 'string' && (item.image.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)($|\?)/i.test(item.image)));
                const mediaContent = item.video || item.image;

                mergedMap.set(vaultPostId, {
                  id: vaultPostId,
                  author: meta.name,
                  authorUsername: meta.handle.replace(/^@/, ''),
                  authorBadge: meta.badge,
                  avatarUrl: meta.avatar,
                  time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10 mins ago',
                  content: item.caption || 'Glowup aesthetic vibe ✨ #looksmaxing #aesthetic',
                  image: isVideo ? undefined : mediaContent,
                  video: isVideo ? mediaContent : undefined,
                  likes: item.likes || 142,
                  likedByUser: false,
                  comments: item.comments || [],
                  createdAt: item.createdAt || new Date().toISOString()
                });
              }
            }
          });
        } catch (e) {}
  
        // Convert Map to array
        let combinedList = Array.from(mergedMap.values());
  
        // Strictly sort by createdAt descending (newest first)
        combinedList.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        // Apply shuffle or persisted custom feed order if active
        if (shouldShuffle) {
          combinedList = shufflePostsOrder(combinedList);
          try {
            const orderIds = combinedList.map(p => p.id);
            sessionStorage.setItem('growgram_shuffled_order', JSON.stringify(orderIds));
            localStorage.setItem('growgram_shuffled_order', JSON.stringify(orderIds));
            customFeedOrderRef.current = orderIds;
          } catch (e) {}
        } else if (customFeedOrderRef.current && customFeedOrderRef.current.length > 0) {
          const orderMap = new Map(customFeedOrderRef.current.map((id, idx) => [id, idx]));
          // CRITICAL FIX: Posts NOT in orderMap are NEW posts (e.g. newly uploaded/shared TikTok videos).
          // They must STAY AT THE VERY TOP (index < 0) and be sorted newest first, NEVER pushed to 9999!
          combinedList.sort((a, b) => {
            const hasA = orderMap.has(a.id);
            const hasB = orderMap.has(b.id);
            if (!hasA && !hasB) {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            }
            if (!hasA) return -1; // New post A always takes top precedence
            if (!hasB) return 1;  // New post B always takes top precedence
            return orderMap.get(a.id)! - orderMap.get(b.id)!;
          });

          // Prepend newly found post IDs to customFeedOrderRef so the updated top order is permanently remembered
          const unmappedIds = combinedList.filter(p => !orderMap.has(p.id)).map(p => p.id);
          if (unmappedIds.length > 0) {
            customFeedOrderRef.current = [...unmappedIds, ...customFeedOrderRef.current];
            try {
              localStorage.setItem('growgram_shuffled_order', JSON.stringify(customFeedOrderRef.current));
              sessionStorage.setItem('growgram_shuffled_order', JSON.stringify(customFeedOrderRef.current));
            } catch (e) {}
          }
        }
  
        // Only update state if IDs or content changed (unless forced refresh) to prevent video reload/tearing!
        setPosts(prev => {
          if (!isForced && prev.length === combinedList.length) {
            const isIdentical = prev.every((p, idx) => {
              const c = combinedList[idx];
              return c && p.id === c.id && p.likes === c.likes && (p.comments?.length || 0) === (c.comments?.length || 0) && p.likedByUser === c.likedByUser;
            });
            if (isIdentical) return prev;
          }
          return combinedList;
        });

        // Non-blocking async caching in background to ensure zero scrolling lag or UI stutter
        setTimeout(() => {
          try {
            // Store safe copy: persist heavy base64 video payloads to IndexedDB so they NEVER disappear!
            const safePostsToCache = combinedList.slice(0, 50).map(p => {
              if (typeof p.video === 'string' && p.video.startsWith('data:video/')) {
                saveMediaItem(p.id, p.video).catch(() => {});
                return { ...p, video: `media-id-${p.id}` };
              }
              return p;
            });
            localStorage.setItem('glowgram_posts', JSON.stringify(safePostsToCache));
            localStorage.setItem('selfx_all_cached_posts', JSON.stringify(safePostsToCache));

            // Proactively cache /media/*.mp4 blobs into IndexedDB so background/Android shares also survive server restarts
            combinedList.filter(p => p.video && p.video.startsWith('/media/')).slice(0, 15).forEach(p => {
              cacheRemoteVideoToIndexedDB(p.video!, [p.id]).catch(() => {});
            });
          } catch (e) {
            console.warn("Non-critical cache save skipped to preserve smoothness:", e);
          }
        }, 150);
  
        // Background-sync local backups only ONCE on startup (never repeated on polling intervals to eliminate lag)
        if (!hasInitialSyncedBackupsRef.current) {
          hasInitialSyncedBackupsRef.current = true;
          const missingOnServer = [
            ...localBackups.filter((lp: any) => lp.id && !serverIds.has(lp.id) && !deletedPostIds.includes(lp.id)),
            ...permanentTikTokPosts.filter((pt: any) => pt.id && !serverIds.has(pt.id) && !deletedPostIds.includes(pt.id)),
            ...previouslyCached.filter((cp: any) => cp.id && !serverIds.has(cp.id) && !deletedPostIds.includes(cp.id) && !cp.id.startsWith('spost-'))
          ];
          const uniqueMissing = Array.from(new Map(missingOnServer.map(p => [p.id, p])).values());

          setTimeout(async () => {
            for (const lp of localBackups) {
              if (lp && lp.video && (lp.video.startsWith('media-id-') || lp.video.startsWith('local-video-')) && !syncedMediaToServerCache.has(lp.video)) {
                try {
                  const videoData = await getMediaItem(lp.video);
                  if (videoData) {
                    await fetch('/api/community/media/upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: lp.video, dataUrl: videoData })
                    });
                    syncedMediaToServerCache.add(lp.video);
                  }
                } catch (vErr) {}
              }
              if (lp && lp.image && (lp.image.startsWith('media-id-') || lp.image.startsWith('local-image-')) && !syncedMediaToServerCache.has(lp.image)) {
                try {
                  const imgData = await getMediaItem(lp.image);
                  if (imgData) {
                    await fetch('/api/community/media/upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: lp.image, dataUrl: imgData })
                    });
                    syncedMediaToServerCache.add(lp.image);
                  }
                } catch (iErr) {}
              }
            }

            if (uniqueMissing.length > 0) {
              for (const post of uniqueMissing) {
                try {
                  await fetch('/api/community/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: post.id,
                      author: post.author,
                      avatarUrlOrBase64: post.avatarUrl || post.avatarUrlOrBase64 || '',
                      numberId: post.numberId || post.authorUsername || '',
                      content: post.content,
                      image: post.image || '',
                      video: post.video || '',
                      sourceUrl: post.sourceUrl || '',
                      isLead: post.isLead || !!post.authorBadge,
                      createdAt: post.createdAt
                    })
                  });
                } catch (syncErr) {}
              }
            }
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Failed to fetch posts from server:", err);
    }
  };

  // AUTO-REGISTER/SYNC CURRENT PROFILE
  useEffect(() => {
    const currentName = userProfile.name || 'Glowup Recruit';
    fetch('/api/community/members/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: memberId,
        name: currentName,
        username: userProfile.username || '',
        numberId: (userProfile as any).numberId || userProfile.username || (userProfile as any).accountId || '',
        avatar: userProfile.avatarBase64 || (userProfile as any).avatarUrl || '',
        points: userPoints,
        level: userLevel,
        niche: userProfile.bio || 'Glowup Transformation'
      })
    }).then(res => res.json())
      .then(data => {
        if (data && data.success) {
          fetchMembers();
        }
      }).catch(err => console.error(err));
  }, [memberId, userProfile.name, userProfile.username, (userProfile as any).numberId, userProfile.avatarBase64, userPoints, userLevel]);

  // SMART VISIBILITY-AWARE INTERVAL POLLING (ELIMINATES LAG & CPU SPIKES)
  useEffect(() => {
    fetchMembers();
    fetchDMs();
    fetchPosts();
    fetchStories();

    // Direct Message delivery (high-frequency when in messages tab, relaxed in feed)
    const messageInterval = setInterval(() => {
      if (!document.hidden && activeViewRef.current === 'messages') {
        fetchDMs();
      }
    }, 4000);

    // Background DM check while in feed/explore to update unread badges without interrupting scroll
    const backgroundDMInterval = setInterval(() => {
      if (!document.hidden && activeViewRef.current !== 'messages') {
        fetchDMs();
      }
    }, 20000);

    // Social graph updates (30s interval, paused when tab hidden)
    const membersInterval = setInterval(() => {
      if (!document.hidden) {
        fetchMembers();
      }
    }, 30000);

    // Feed & Stories updates (respects recent user manual refresh)
    const postsInterval = setInterval(() => {
      if (!document.hidden && activeViewRef.current === 'feed') {
        if (Date.now() - (lastRefreshTimeRef.current || 0) < 15000) return;
        fetchPosts();
        fetchStories();
      }
    }, 6000);

    // Refresh immediately upon user returning to the app or switching tabs
    const onWindowFocus = () => {
      fetchMembers();
      fetchDMs();
      fetchPosts(false, false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPosts(false, false);
      }
    };
    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onPersonasUpdated = () => {
      fetchPosts(false);
    };
    const onNewPostPublished = (e?: any) => {
      if (e?.detail) {
        const p = e.detail;
        const newPostItem: PostItem = {
          id: p.id,
          author: p.author || 'Atif Nirob',
          authorUsername: (p.numberId || p.authorUsername || 'niromax').replace(/^@/, ''),
          authorBadge: p.isLead ? 'CREATOR' : undefined,
          avatarUrl: p.avatarUrlOrBase64 || p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          time: 'Just now',
          content: p.content || 'Aesthetic grind 🔥',
          video: p.video || '',
          image: p.image || '',
          sourceUrl: p.sourceUrl || undefined,
          likes: Array.isArray(p.likedBy) ? p.likedBy.length : (p.likes || 12),
          likedByUser: false,
          comments: p.comments || [],
          createdAt: p.createdAt || new Date().toISOString()
        };
        if (newPostItem.video && newPostItem.video.startsWith('/media/')) {
          cacheRemoteVideoToIndexedDB(newPostItem.video, [newPostItem.id]).catch(() => {});
        }
        setPosts(prev => [newPostItem, ...prev.filter(item => item.id !== newPostItem.id)]);
        if (feedScrollContainerRef.current) {
          feedScrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      fetchPosts(false, true);
    };
    const onProfileUpdated = (e: any) => {
      if (e?.detail && setUserProfile) {
        const updated = e.detail;
        setUserProfile({
          name: updated.name,
          numberId: updated.username,
          avatarBase64: updated.avatarUrl,
          bio: updated.bio,
          isLead: updated.isLead
        });
      }
    };
    window.addEventListener('selfx_custom_personas_updated', onPersonasUpdated);
    window.addEventListener('selfx_new_post_published', onNewPostPublished);
    window.addEventListener('selfx_profile_updated', onProfileUpdated);

    return () => {
      clearInterval(messageInterval);
      clearInterval(backgroundDMInterval);
      clearInterval(membersInterval);
      clearInterval(postsInterval);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('selfx_custom_personas_updated', onPersonasUpdated);
      window.removeEventListener('selfx_new_post_published', onNewPostPublished);
      window.removeEventListener('selfx_profile_updated', onProfileUpdated);
    };
  }, [memberId]);

  // FRIEND REQUEST HANDLERS
  const sendFriendRequest = async (toId: string) => {
    // Optimistic UI Update with safety fallbacks
    setAllServerMembers(prev => prev.map(m => {
      if (isMatchMember(m.id, effectiveMemberId)) {
        const existingOut = m.outgoingRequests || [];
        return { ...m, outgoingRequests: existingOut.includes(toId) ? existingOut : [...existingOut, toId] };
      }
      if (isMatchMember(m.id, toId)) {
        const existingIn = m.incomingRequests || [];
        return { ...m, incomingRequests: existingIn.includes(effectiveMemberId) ? existingIn : [...existingIn, effectiveMemberId] };
      }
      return m;
    }));
    triggerNotification("💖 Friend Request Sent", "আপনার বন্ধুত্বের অনুরোধ সফলভাবে পাঠানো হয়েছে!");

    try {
      const res = await fetch('/api/community/members/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: effectiveMemberId, toId })
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error("Failed to send friend request:", err);
    }
  };

  const respondFriendRequest = async (fromId: string, action: 'accept' | 'decline') => {
    // Optimistic UI Update
    setAllServerMembers(prev => prev.map(m => {
      if (isMatchMember(m.id, effectiveMemberId)) {
        const existingInc = m.incomingRequests || [];
        const existingFriends = m.friends || [];
        const newIncoming = existingInc.filter((id: string) => !isMatchMember(id, fromId));
        const newFriends = action === 'accept' ? [...new Set([...existingFriends, fromId])] : existingFriends;
        return { ...m, incomingRequests: newIncoming, friends: newFriends };
      }
      if (isMatchMember(m.id, fromId)) {
        const existingOut = m.outgoingRequests || [];
        const existingFriends = m.friends || [];
        const newOutgoing = existingOut.filter((id: string) => !isMatchMember(id, effectiveMemberId));
        const newFriends = action === 'accept' ? [...new Set([...existingFriends, effectiveMemberId])] : existingFriends;
        return { ...m, outgoingRequests: newOutgoing, friends: newFriends };
      }
      return m;
    }));

    if (action === 'accept') {
      triggerNotification("🤝 Friends Connected", "আপনারা এখন বন্ধু! এখন ডিরেক্ট মেসেজ পাঠাতে পারবেন।");
    } else {
      triggerNotification("❌ Request Declined", "বন্ধুত্বের অনুরোধ রিজেক্ট করা হয়েছে।");
    }

    try {
      const res = await fetch('/api/community/members/friend-request/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId: effectiveMemberId, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error("Failed to respond to friend request:", err);
    }
  };

  // Active Community Members Directory data (including dynamic local stats)
  const currentUserName = userProfile?.name || 'Glowup Member';
  const rawU = (userProfile?.username || (userProfile as any)?.numberId || currentUserName || 'user').toLowerCase().replace(/^@/, '');
  const currentUserUsername = (rawU.includes('@') ? rawU.split('@')[0] : rawU).replace(/[^a-z0-9_]/g, '');
  const currentUserNumberId = (userProfile as any)?.numberId || (userProfile as any)?.username || (userProfile as any)?.accountId || currentUserUsername || '1001';
  const currentUserAvatar = userProfile?.avatarBase64 || (userProfile as any)?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150';

  const myServerProfile = allServerMembers.find(m => 
    isMatchMember(m.id, memberId) ||
    isMatchMember(m.username, currentUserUsername) ||
    isMatchMember(m.numberId, currentUserNumberId) ||
    (userProfile?.email && m.email && m.email.toLowerCase() === userProfile.email.toLowerCase())
  );
  const effectiveMemberId = myServerProfile?.id || memberId;
  const myFriends = myServerProfile?.friends || [];
  const myIncomingRequests = myServerProfile?.incomingRequests || [];
  const myOutgoingRequests = myServerProfile?.outgoingRequests || [];

  const activeMembersList = [
    {
      id: effectiveMemberId,
      name: currentUserName,
      username: currentUserUsername,
      avatar: currentUserAvatar,
      level: userLevel,
      levelName: userLevel >= 10 ? 'Aesthetic Overlord' : userLevel >= 7 ? 'Elite Mewing Monk' : userLevel >= 5 ? 'Grooming Paladin' : userLevel >= 3 ? 'Skincare Tactician' : 'Glowup Recruit',
      badgeCount: badgesList.length,
      points: userPoints,
      isOnline: true,
      isCurrentUser: true,
      isFounder: false,
      numberId: currentUserNumberId,
      niche: userProfile?.bio || 'Your Custom Self-Care Journey',
      badges: badgesList
    },
    ...allServerMembers
      .filter(m => m && m.id && !isMatchMember(m.id, effectiveMemberId) && !isFakeBotId(m.id) && !isFakeBotId(m.username))
      .map(m => {
        const lvl = m.level || Math.floor((m.points || 0) / 200) + 1 || 1;
        return {
          id: m.id,
          numberId: m.numberId || m.username || m.id.slice(-6),
          name: m.name,
          username: m.username || (m.name.toLowerCase().replace(/[^a-z0-9_]/g, '')),
          avatar: m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
          level: lvl,
          levelName: lvl >= 10 ? 'Aesthetic Overlord' : lvl >= 7 ? 'Elite Mewing Monk' : lvl >= 5 ? 'Grooming Paladin' : lvl >= 3 ? 'Skincare Tactician' : 'Glowup Recruit',
          badgeCount: m.badges ? m.badges.length : 1,
          points: m.points || 0,
          isOnline: m.isOnline !== undefined ? m.isOnline : true,
          isCurrentUser: false,
          isFounder: false,
          niche: m.niche || 'Transformation Focus',
          badges: m.badges && m.badges.length > 0 ? m.badges : ['Glowup Member']
        };
      })
      .sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        const aFriend = myFriends.includes(a.id);
        const bFriend = myFriends.includes(b.id);
        if (aFriend && !bFriend) return -1;
        if (!aFriend && bFriend) return 1;
        return (b.points || 0) - (a.points || 0);
      })
  ];

  const openMemberProfile = async (nameOrId: string, postContext?: PostItem) => {
    setMemberProfileTab('about');
    if (!nameOrId || !nameOrId.trim()) return;
    const q = nameOrId.trim().toLowerCase();
    const cleanQ = q.replace(/^@/, '');

    // 1. Explicit check if the query intentionally refers to the current logged-in user only
    const isMe = 
      q === 'me' ||
      q === 'myself' ||
      isMatchMember(effectiveMemberId, q) ||
      isMatchMember(memberId, q) ||
      (currentUserUsername && isMatchMember(currentUserUsername, cleanQ));

    if (isMe) {
      const myCard = activeMembersList[0];
      setSelectedProfileMember({
        id: myCard.id,
        name: myCard.name,
        username: myCard.username,
        avatar: myCard.avatar,
        level: myCard.level,
        levelName: myCard.levelName,
        points: myCard.points,
        niche: myCard.niche,
        friends: myFriends,
        isOnline: true,
        isCurrentUser: true
      });
      return;
    }

    // 2. Direct postContext match (instant 100% accurate profile for clicked post author)
    if (postContext && postContext.author) {
      const isClickedUserMe = isMatchMember(postContext.authorUsername, currentUserUsername) ||
                             (currentUserName && postContext.author.toLowerCase() === currentUserName.toLowerCase());
      if (!isClickedUserMe) {
        setSelectedProfileMember({
          id: postContext.authorUsername || postContext.id,
          name: postContext.author,
          username: postContext.authorUsername || postContext.author.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          avatar: postContext.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
          level: 16,
          levelName: postContext.authorBadge === 'CREATOR' ? 'Lead Creator' : 'Aesthetic Overlord',
          points: 3250,
          niche: postContext.authorBadge === 'CREATOR' ? 'SelfX Lead Creator & Founder' : 'Discipline, Workout & Looksmaxing Transformation 🔥',
          friends: myFriends.includes(postContext.authorUsername || postContext.id) ? [effectiveMemberId] : [],
          isOnline: true,
          isCurrentUser: false
        });
        return;
      }
    }

    // 3. Search in posts array for matching author
    const matchedPost = posts.find(p => 
      p.author?.toLowerCase().trim() === q ||
      p.authorUsername?.toLowerCase().trim() === cleanQ ||
      p.author?.toLowerCase().includes(q)
    );
    if (matchedPost) {
      setSelectedProfileMember({
        id: matchedPost.authorUsername || matchedPost.id,
        name: matchedPost.author,
        username: matchedPost.authorUsername || matchedPost.author.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        avatar: matchedPost.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
        level: 15,
        levelName: matchedPost.authorBadge === 'CREATOR' ? 'Lead Creator' : 'Aesthetic Overlord',
        points: 3100,
        niche: matchedPost.authorBadge === 'CREATOR' ? 'SelfX Lead Creator & Founder' : 'Discipline, Workout & Looksmaxing Transformation 🔥',
        friends: myFriends.includes(matchedPost.authorUsername || matchedPost.id) ? [effectiveMemberId] : [],
        isOnline: true,
        isCurrentUser: false
      });
      return;
    }

    // 4. Remote live backend search query
    try {
      const res = await fetch(`/api/community/members/search?q=${encodeURIComponent(cleanQ || q)}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.members) && data.members.length > 0) {
        const found = data.members[0];
        const lvl = found.level || Math.floor((found.points || 0) / 200) + 1 || 1;
        setSelectedProfileMember({
          id: found.id,
          name: found.name,
          username: found.username || found.name.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          avatar: found.avatar || '',
          level: lvl,
          levelName: lvl >= 10 ? 'Aesthetic Overlord' : lvl >= 7 ? 'Elite Mewing Monk' : lvl >= 5 ? 'Grooming Paladin' : lvl >= 3 ? 'Skincare Tactician' : 'Glowup Recruit',
          points: found.points || 0,
          niche: found.niche || 'Transformation Focus',
          friends: found.friends || [],
          isOnline: found.isOnline !== undefined ? found.isOnline : true,
          isCurrentUser: isMatchMember(found.id, effectiveMemberId)
        });
        fetchMembers();
        return;
      }
    } catch (e) {
      console.warn("Server search request failed:", e);
    }

    // 5. Search in activeMembersList / allServerMembers as local fallback
    const activeMatch = activeMembersList.find(m => 
      !m.isCurrentUser && (
        isMatchMember(m.id, q) ||
        isMatchMember(m.username, cleanQ) ||
        m.name.toLowerCase().trim() === q ||
        m.name.toLowerCase().includes(q) || 
        (m.numberId && isMatchMember(m.numberId.toString(), cleanQ)) ||
        (m.niche && m.niche.toLowerCase().includes(q))
      )
    );

    if (activeMatch) {
      setSelectedProfileMember({
        id: activeMatch.id,
        name: activeMatch.name,
        username: activeMatch.username,
        avatar: activeMatch.avatar,
        level: activeMatch.level,
        levelName: activeMatch.levelName,
        points: activeMatch.points,
        niche: activeMatch.niche,
        friends: myFriends.includes(activeMatch.id) ? [effectiveMemberId] : [],
        isOnline: activeMatch.isOnline,
        isCurrentUser: false
      });
      return;
    }

    triggerNotification("🔍 আইডি পাওয়া যায়নি", `"${nameOrId}" নামের কোনো মেম্বার খুঁজে পাওয়া যায়নি। সঠিক নাম বা ইউজারনেম দিয়ে সার্চ করুন।`);
  };

  const handleContactMember = (targetMemberId: string) => {
    if (isMatchMember(targetMemberId, effectiveMemberId)) {
      triggerNotification("✨ এটি আপনার প্রোফাইল!", "নিজের সাথে সরাসরি চ্যাট করা যাবে না।");
      return;
    }
    const memberObj = allServerMembers.find(m => isMatchMember(m.id, targetMemberId)) || activeMembersList.find(m => isMatchMember(m.id, targetMemberId));
    const finalChatId = memberObj?.id || targetMemberId;
    setSelectedChatId(finalChatId);
    setActiveView('messages');
  };

  useEffect(() => {
    try {
      localStorage.setItem('glowgram_stories', JSON.stringify(stories));
    } catch (e) {
      console.warn("Local storage limit exceeded, removing oldest stories.");
      if (stories.length > 2) {
        setStories(prev => prev.slice(0, 2));
      } else {
        triggerNotification("⚠️ Storage Full", "Cannot save more stories offline. Please clear some space.");
      }
    }
  }, [stories]);

  // Story Image select with auto-compression
  const handleStoryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450; // Optimized size for mobile screen stories
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.6); // Very light & looks crisp
          setNewStoryImage(compressed);
          setNewStoryImageName(file.name);
          triggerNotification("📸 Story Image Optimized", "Your photo is compressed and ready to share!");
        }
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleStoryMusicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      triggerNotification("⚠️ Music Too Large", "Please select an audio file smaller than 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setNewStoryMusicUrl(evt.target?.result as string);
      setNewStoryMusicName(file.name);
      triggerNotification("🎵 Custom Music Linked", `"${file.name}" has been added to your story!`);
    };
    reader.readAsDataURL(file);
  };

  const selectPredefinedMusic = (name: string, url: string) => {
    setNewStoryMusicUrl(url);
    setNewStoryMusicName(name);
    triggerNotification("🎵 Theme Music Selected", `"${name}" will play on your story!`);
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryImage) {
      triggerNotification("⚠️ Image Required", "Please choose or capture a photo for your story!");
      return;
    }

    const payload = {
      id: 'story_' + Date.now(),
      author: userProfile.name || 'Atif Hasan',
      avatar: userProfile.avatarBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      image: newStoryImage,
      text: newStoryText.trim() || 'Daily transformation check!',
      musicUrl: newStoryMusicUrl || undefined,
      musicName: newStoryMusicName || undefined
    };

    try {
      const res = await fetch('/api/community/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        setStories(prev => [data.story, ...prev]);
        setNewStoryText('');
        setNewStoryImage(null);
        setNewStoryImageName('');
        setNewStoryMusicUrl(null);
        setNewStoryMusicName('');
        setShowStoryModal(false);

        if (onEarnPoints) {
          onEarnPoints(10, "Shared a daily progress story with the community!");
        }
        triggerNotification("✨ Story Shared", "Your daily transformation story is live on GlowGram!");
        fetchStories();
      } else {
        triggerNotification("❌ Story Failed", "Could not share story with server.");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("❌ Story Failed", "Network error when sharing story.");
    }
  };

  // Story autoplay & audio player synchronization
  useEffect(() => {
    if (activeStory) {
      // Setup and play audio if exists
      if (activeStory.musicUrl) {
        try {
          const audio = new Audio(activeStory.musicUrl);
          audio.volume = 0.65;
          audio.loop = true;
          audio.play().catch(err => console.log("Audio play deferred or blocked by browser gesture", err));
          storyAudioRef.current = audio;
        } catch (audioErr) {
          console.error("Failed to initialize story audio", audioErr);
        }
      }

      const timer = setTimeout(() => {
        // Move to next story
        const currentIndex = stories.findIndex(s => s.id === activeStory.id);
        if (currentIndex < stories.length - 1) {
          setActiveStory(stories[currentIndex + 1]);
        } else {
          setActiveStory(null);
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
        if (storyAudioRef.current) {
          storyAudioRef.current.pause();
          storyAudioRef.current = null;
        }
      };
    }
  }, [activeStory, stories]);

  // Image Upload helper with safe auto-compression
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 550; // Optimized feed resolution
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.65); // high quality, tiny byte size
          setNewPostImage(compressed);
          setNewPostImageName(file.name);
          triggerNotification("📸 Photo Optimized", "Ready to publish to the community!");
        }
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      triggerNotification("⚠️ ভিডিও সাইজ বড় (Video Too Large)", "১০০ এমবি-র ছোট ভিডিও সিলেক্ট করুন।");
      return;
    }

    setIsUploadingVideo(true);
    const uniqueMediaId = `upload-vid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const previewUrl = URL.createObjectURL(file);
    const finalVideoUrl = `/media/${uniqueMediaId}.mp4`;

    setNewPostVideoPreview(previewUrl);
    setNewPostVideo(finalVideoUrl);
    setNewPostVideoName(file.name);
    setNewPostImage(null);
    setNewPostImageName('');

    // Pre-cache video preview immediately in memory
    videoSrcMemoryCache.set(finalVideoUrl, previewUrl);
    videoSrcMemoryCache.set(uniqueMediaId, previewUrl);

    triggerNotification("🎥 Video Processing", "ভিডিও সফলভাবে লোড হয়েছে ও GrowGram-এ সেভ হচ্ছে...");

    // 1. Direct Binary streaming upload to disk (saves full MP4 instantly)
    const uploadTask = fetch('/api/community/video/upload-binary', {
      method: 'POST',
      headers: {
        'x-media-id': uniqueMediaId,
        'Content-Type': file.type || 'video/mp4'
      },
      body: file
    }).then(async (res) => {
      const data = await res.json();
      if (data && data.url) {
        setNewPostVideo(data.url);
        videoSrcMemoryCache.set(data.url, previewUrl);
        setIsUploadingVideo(false);
      }
      return data;
    }).catch(async (err) => {
      console.warn("Binary video upload error, falling back to base64 upload:", err);
      return new Promise<any>((resolve) => {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          if (typeof evt.target?.result === 'string') {
            const videoDataUrl = evt.target.result;
            try {
              const res2 = await fetch('/api/community/video/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: uniqueMediaId, dataUrl: videoDataUrl })
              });
              const data2 = await res2.json();
              if (data2?.url) {
                setNewPostVideo(data2.url);
                videoSrcMemoryCache.set(data2.url, previewUrl);
              }
              resolve(data2);
            } catch (e2) {
              resolve(null);
            } finally {
              setIsUploadingVideo(false);
            }
          } else {
            setIsUploadingVideo(false);
            resolve(null);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    videoUploadPromiseRef.current = uploadTask;

    // 2. Also save raw Blob to IndexedDB as permanent local fallback (no base64 memory bloat)
    saveMediaBlob(uniqueMediaId, file, [finalVideoUrl]).catch(() => {});
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostImage && !newPostVideo) {
      triggerNotification("⚠️ Empty Post", "Write something or attach an image/video to publish!");
      return;
    }

    // If user pasted an Instagram or TikTok link directly into the post composer without attaching a video, auto-download and post the video!
    if (!newPostVideo && !newPostImage && (newPostText.includes('instagram.com') || newPostText.includes('instagr.am') || newPostText.includes('tiktok.com') || newPostText.includes('douyin.com'))) {
      const linkMatch = newPostText.match(/(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(?:tiktok\.com|douyin\.com|instagram\.com|instagr\.am)\/[^\s]+/i) || newPostText.match(/https?:\/\/[^\s]+/i);
      if (linkMatch && linkMatch[0]) {
        let detectedUrl = linkMatch[0].trim();
        if (!detectedUrl.startsWith('http://') && !detectedUrl.startsWith('https://')) {
          detectedUrl = 'https://' + detectedUrl;
        }
        setNewPostText('');
        setTikTokUrlInput(detectedUrl);
        setShowTikTokModal(true);
        handleTikTokDownloadAndAutoPost(detectedUrl);
        return;
      }
    }

    setIsPublishing(true);

    // Wait for in-flight video upload to finish so disk file is 100% saved
    if (isUploadingVideo && videoUploadPromiseRef.current) {
      try {
        await videoUploadPromiseRef.current;
      } catch (e) {}
    }

    // Pre-create video media id and sync to server to ensure all users can watch it
    let videoMediaIdToPost = newPostVideo;
    if (newPostVideo) {
      if (newPostVideo.startsWith('/media/')) {
        // Already a permanent disk file, keep as is
        videoMediaIdToPost = newPostVideo;
      } else if (newPostVideo.startsWith('data:video')) {
        const generatedMediaId = `media-id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        try {
          const upRes = await fetch('/api/community/video/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: generatedMediaId, dataUrl: newPostVideo })
          });
          const upData = await upRes.json();
          videoMediaIdToPost = upData?.url || `/media/${generatedMediaId}.mp4`;
          await saveMediaItem(generatedMediaId, newPostVideo);
        } catch (err) {
          console.warn("Failed to upload raw video to server:", err);
        }
      } else if (newPostVideo.startsWith('media-id-') || newPostVideo.startsWith('local-video-') || newPostVideo.startsWith('upload-vid-')) {
        const cleanId = newPostVideo.replace(/[^a-zA-Z0-9_-]/g, '');
        videoMediaIdToPost = `/media/${cleanId}.mp4`;
        try {
          const videoDataUrl = await getMediaItem(newPostVideo);
          if (videoDataUrl) {
            await fetch('/api/community/video/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: cleanId, dataUrl: videoDataUrl })
            });
          }
        } catch (uploadErr) {
          console.warn("Failed to upload video to server:", uploadErr);
        }
      }
    }

    let imageMediaIdToPost = newPostImage;
    if (newPostImage && newPostImage.startsWith('data:image') && newPostImage.length > 50000) {
      const generatedImgId = `media-id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      try {
        await fetch('/api/community/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: generatedImgId, dataUrl: newPostImage })
        });
        await saveMediaItem(generatedImgId, newPostImage);
        imageMediaIdToPost = generatedImgId;
      } catch (err) {
        console.warn("Failed to upload image to server:", err);
      }
    }
    
    // Pre-create offline-first backup post with smart organic motivative likes
    const hasMedia = !!(imageMediaIdToPost || videoMediaIdToPost);
    const likeCount = calculateOrganicLikes(newPostText, hasMedia);
    const shuffledMembers = [...COMMUNITY_MEMBERS].sort(() => 0.5 - Math.random());
    const simulatedLikedBy = shuffledMembers.slice(0, Math.min(likeCount, shuffledMembers.length));

    const offlinePostId = "post-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
    const offlinePostObj = {
      id: offlinePostId,
      author: userProfile.name || 'Glowup Recruit',
      avatarUrlOrBase64: userProfile.avatarBase64 || '',
      numberId: userProfile.numberId || '',
      createdAt: new Date().toISOString(),
      content: newPostText.trim(),
      image: imageMediaIdToPost || '',
      video: videoMediaIdToPost || '',
      likedBy: simulatedLikedBy,
      isLead: !!userProfile.isLead
    };

    // Save offline immediately to guarantee persistence
    try {
      const userLocalPosts = JSON.parse(localStorage.getItem('selfx_user_local_posts') || '[]');
      userLocalPosts.unshift(offlinePostObj);
      localStorage.setItem('selfx_user_local_posts', JSON.stringify(userLocalPosts));
    } catch (err) {
      console.error("Local storage backup failed:", err);
    }

    // Immediately insert post at top of current feed view
    const frontendNewPost = {
      id: offlinePostId,
      author: userProfile.name || 'Glowup Recruit',
      authorUsername: userProfile.numberId || 'creator',
      authorBadge: userProfile.isLead ? 'CREATOR' : undefined,
      avatarUrl: userProfile.avatarBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      time: 'Just now',
      content: newPostText.trim(),
      image: imageMediaIdToPost || undefined,
      video: videoMediaIdToPost || undefined,
      likes: simulatedLikedBy.length,
      likedByUser: false,
      comments: [],
      createdAt: offlinePostObj.createdAt
    };

    setPosts(prev => [frontendNewPost, ...prev.filter(p => p.id !== offlinePostId)]);

    // Update customFeedOrder so newly created post remains pinned at top during shuffles
    customFeedOrderRef.current = [offlinePostId, ...(customFeedOrderRef.current || []).filter(id => id !== offlinePostId)];
    try {
      sessionStorage.setItem('growgram_shuffled_order', JSON.stringify(customFeedOrderRef.current));
    } catch (e) {}

    // Smooth scroll to top of feed so user sees their new post instantly
    requestAnimationFrame(() => {
      if (feedScrollContainerRef.current) {
        feedScrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: offlinePostId,
          author: userProfile.name || 'Glowup Recruit',
          avatarUrlOrBase64: userProfile.avatarBase64 || '',
          numberId: userProfile.numberId || '',
          content: newPostText.trim(),
          image: imageMediaIdToPost || '',
          video: videoMediaIdToPost || '',
          isLead: userProfile.isLead,
          createdAt: offlinePostObj.createdAt
        })
      });
      const data = await res.json();
      if (data.success) {
        // If server confirms, replace/update with server response to match state perfectly
        if (data.post) {
          try {
            const userLocalPosts = JSON.parse(localStorage.getItem('selfx_user_local_posts') || '[]');
            const filtered = userLocalPosts.filter((p: any) => p.id !== offlinePostId);
            filtered.unshift(data.post);
            localStorage.setItem('selfx_user_local_posts', JSON.stringify(filtered));
          } catch (err) {}
        }
      }
    } catch (err) {
      console.warn("Server publish deferred (Offline Mode enabled). Your post is safely saved locally and will auto-sync shortly!", err);
    } finally {
      setNewPostText('');
      setNewPostImage(null);
      setNewPostImageName('');
      setNewPostVideo(null);
      setNewPostVideoName('');
      setIsPublishing(false);
      
      if (onEarnPoints) {
        onEarnPoints(20, "Published a post to the Glowup Community!");
      }
      triggerNotification("🚀 Post Saved", "Your transformation update is active and saved!");
      fetchPosts();
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // Save deleted postId to prevent background re-sync
      try {
        const deletedPosts = JSON.parse(localStorage.getItem('selfx_deleted_posts') || '[]');
        if (!deletedPosts.includes(postId)) {
          deletedPosts.push(postId);
          localStorage.setItem('selfx_deleted_posts', JSON.stringify(deletedPosts));
        }
      } catch (err) {}

      // Remove from localStorage backups as well
      try {
        const userLocalPosts = JSON.parse(localStorage.getItem('selfx_user_local_posts') || '[]');
        const updatedLocal = userLocalPosts.filter((lp: any) => lp.id !== postId);
        localStorage.setItem('selfx_user_local_posts', JSON.stringify(updatedLocal));
      } catch (err) {
        console.error("Failed to clean up post from local storage:", err);
      }

      // Also remove from local cached posts lists immediately
      try {
        const cachedStr = localStorage.getItem('selfx_all_cached_posts') || localStorage.getItem('glowgram_posts');
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          const updatedCached = cached.filter((p: any) => p.id !== postId);
          localStorage.setItem('selfx_all_cached_posts', JSON.stringify(updatedCached));
          localStorage.setItem('glowgram_posts', JSON.stringify(updatedCached));
        }
      } catch (err) {}

      const res = await fetch('/api/community/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification("🗑️ Post Deleted", "Your transformation update has been removed.");
        fetchPosts();
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleLikePost = async (postId: string) => {
    let likedByMe: string[] = [];
    try {
      likedByMe = JSON.parse(localStorage.getItem('glowgram_liked_by_me') || '[]');
    } catch (e) {}

    const index = likedByMe.indexOf(postId);
    if (index === -1) {
      likedByMe.push(postId);
    } else {
      likedByMe.splice(index, 1);
    }
    try {
      localStorage.setItem('glowgram_liked_by_me', JSON.stringify(likedByMe));
    } catch (e) {}

    // Instant optimistic UI update without main thread stalls
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const liked = likedByMe.includes(postId);
          return {
            ...p,
            likedByUser: liked,
            likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      });
      setTimeout(() => {
        try {
          localStorage.setItem('glowgram_posts', JSON.stringify(updated.slice(0, 40)));
        } catch (e) {}
      }, 50);
      return updated;
    });

    try {
      await fetch('/api/community/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userNameOrId: memberId })
      });
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleSavePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const saved = !p.savedByUser;
        triggerNotification(saved ? "🔖 Post Bookmarked" : "🔖 Removed Bookmark", saved ? "Post added to your private references." : "Removed from bookmarks.");
        return {
          ...p,
          savedByUser: saved
        };
      }
      return p;
    }));
  };

  const handleCommentSubmit = async (postId: string, textParam?: string) => {
    const text = (textParam !== undefined ? textParam : commentInputs[postId]) || '';
    if (!text || !text.trim()) return;

    const trimmed = text.trim();
    const newCommentItem: CommentItem = {
      id: 'comm_' + Date.now(),
      author: userProfile.name || 'Aesthetic User',
      avatar: userProfile.avatarBase64 || '',
      content: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Instant optimistic comment addition
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), newCommentItem]
        };
      }
      return p;
    }));

    if (textParam === undefined) {
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    }
    triggerNotification("💬 Comment Posted", "Your feedback is now visible.");

    try {
      await fetch('/api/community/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          author: userProfile.name || 'Aesthetic User',
          avatarUrlOrBase64: userProfile.avatarBase64 || '',
          numberId: userProfile.numberId || '',
          content: trimmed
        })
      });
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const triggerStopAndSendVoice = async () => {
    const base64Audio = await stopRecordingVoiceAndGetBase64();
    setIsRecording(false);
    const durationText = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
    const noteContent = `🎙️ Voice Message (${durationText})[AUDIO_DATA]${base64Audio}`;
    
    const localId = 'dm_local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const localVoiceDM = {
      id: localId,
      senderId: effectiveMemberId,
      receiverId: selectedChatId,
      content: noteContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    };

    setServerDMs(prev => [...prev, localVoiceDM]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const res = await fetch('/api/community/dms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: effectiveMemberId,
          receiverId: selectedChatId,
          content: noteContent
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setServerDMs(prev => prev.map(m => m.id === localId ? data.message : m));
        try {
          const updated = [...serverDMs.filter(m => m.id !== localId), data.message];
          localStorage.setItem('selfx_cached_dms', JSON.stringify(updated));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Failed to send voice message:", err);
    }
  };

  const handleSendDM = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRecording) {
      await triggerStopAndSendVoice();
      return;
    }

    if (!chatInputText.trim() || !selectedChatId) return;

    const typedText = chatInputText.trim();
    setChatInputText('');

    const localId = 'dm_local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const localDM = {
      id: localId,
      senderId: effectiveMemberId,
      receiverId: selectedChatId,
      content: typedText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    };

    setServerDMs(prev => [...prev, localDM]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const res = await fetch('/api/community/dms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: effectiveMemberId,
          receiverId: selectedChatId,
          content: typedText
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setServerDMs(prev => prev.map(m => m.id === localId ? data.message : m));
        try {
          const updated = [...serverDMs.filter(m => m.id !== localId), data.message];
          localStorage.setItem('selfx_cached_dms', JSON.stringify(updated));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Failed to send direct message:", err);
    }
  };

  const selectedChat = (() => {
    if (selectedChatId) {
      const friend = allServerMembers.find(m => isMatchMember(m.id, selectedChatId));
      if (!friend) return null;
      
      const friendDMs = serverDMs.filter(dm => isBetweenUs(dm, effectiveMemberId, friend.id));
      
      return {
        id: friend.id,
        name: friend.name,
        title: friend.niche || 'Glowup Transformation Partner',
        avatar: friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
        status: friend.isOnline !== undefined ? (friend.isOnline ? 'online' : 'offline') : 'online',
        messages: friendDMs.map(dm => ({
          id: dm.id,
          sender: isMatchMember(dm.senderId, effectiveMemberId) ? 'me' : 'them',
          content: dm.content,
          time: dm.time
        }))
      };
    }
    return null;
  })();

  return (
    <div id="glowgram-community-root" className="w-full h-full flex flex-col bg-black text-zinc-100 overflow-hidden">
      
      {/* GLOWGRAM INSTAGRAM NAV BAR */}
      <div className="bg-black border-b border-zinc-900 px-4 py-4 flex items-center justify-between gap-4 shrink-0 z-10 select-none">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:text-white text-zinc-400 transition-colors rounded-full hover:bg-zinc-900 cursor-pointer"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-yellow-400 p-[1.5px] flex items-center justify-center text-zinc-950 shadow-md overflow-hidden shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] p-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="15" y="25" width="70" height="55" rx="16" stroke="url(#glow-grad)" strokeWidth="8" fill="none" />
                <circle cx="50" cy="52" r="18" stroke="url(#glow-grad)" strokeWidth="6" fill="none" />
                <path d="M 68,15 L 72,25 L 82,29 L 72,33 L 68,43 L 64,33 L 54,29 L 64,25 Z" fill="url(#spark-grad)" />
                <circle cx="28" cy="38" r="4" fill="url(#glow-grad)" />
                <defs>
                  <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                  <linearGradient id="spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div 
            className="cursor-pointer select-none"
            onDoubleClick={() => {
              if (activeView === 'feed') {
                handleRefreshAll();
              }
            }}
            title="ডবল ক্লিক করে নিউজ ফিড রিফ্রেশ করুন"
          >
            <h2 className="text-lg font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-yellow-300">
              GrowGram
            </h2>
            <p className="text-[9px] text-zinc-550 font-mono uppercase tracking-widest leading-none mt-0.5">
              Live Elite Transformation Timeline
            </p>
          </div>
        </div>

        {/* Info label for active page, TikTok button & refresh button */}
        <div className="flex items-center gap-2">
          {/* TikTok Import & Auto-Poster button */}
          <button
            type="button"
            onClick={async () => {
              try {
                if (navigator.clipboard?.readText) {
                  const text = await navigator.clipboard.readText();
                  if (text && (text.includes('tiktok.com') || text.includes('douyin.com') || text.includes('instagram.com') || text.includes('instagr.am'))) {
                    const m = text.match(/https?:\/\/[^\s]+/i);
                    const link = m ? m[0] : text.trim();
                    setTikTokUrlInput(link);
                  }
                }
              } catch (e) {}
              setShowTikTokModal(true);
            }}
            className="px-2.5 py-1.5 bg-gradient-to-r from-zinc-900 to-black hover:from-zinc-850 hover:to-zinc-900 border border-zinc-800 hover:border-pink-500/60 rounded-xl text-zinc-200 transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm group"
            title="TikTok ও Instagram Reel শেয়ার ও মডেল ভিডিও অটো-আপলোড"
            aria-label="TikTok & Instagram Import"
          >
            <div className="flex items-center -space-x-1.5 group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 rounded-lg bg-black border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_8px_rgba(255,0,127,0.5)]">
                🎵
              </div>
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_8px_rgba(225,48,108,0.5)]">
                📸
              </div>
            </div>
            <span className="text-[10px] font-bold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 hidden sm:inline">TikTok / IG</span>
          </button>

          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/50 rounded-xl text-zinc-200 hover:text-amber-300 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center shadow-sm"
            title="Refresh Timeline"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-amber-500'}`} />
          </button>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800/50">
            {activeView === 'feed' ? '🎴 Live Timeline' : activeView === 'messages' ? '💬 Direct Chat' : activeView === 'directory' ? '👥 Member Directory' : '👤 My Profile & Cinema'}
          </div>
        </div>
      </div>

      {/* Main scrollable body area */}
      <div 
        ref={feedScrollContainerRef}
        style={{ WebkitOverflowScrolling: 'touch' }} 
        className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-900 transform-gpu backface-hidden ${activeView === 'messages' ? 'p-0' : 'p-4 md:p-6 space-y-6'}`}
      >
        <div className={activeView === 'messages' ? 'w-full h-full' : 'max-w-6xl mx-auto w-full space-y-6'}>

      {/* INSTAGRAM STORIES CHANNEL BAR (ONLY IN FEED) */}
      {activeView === 'feed' && (
        <div className="bg-[#121214] border border-zinc-900 rounded-3xl p-4 overflow-x-auto scrollbar-none flex items-center gap-5 shadow-md">
          {/* Hidden Story Upload Input */}
          <input 
            type="file" 
            ref={storyFileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleStoryImageSelect} 
          />

          {/* Add Story Button */}
          <button
            onClick={() => setShowStoryModal(true)}
            className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer shrink-0 group transition-all active:scale-95 text-left"
          >
            <div className="relative">
              <div className="w-15 h-15 rounded-full p-[2.5px] bg-gradient-to-tr from-zinc-850 to-zinc-700 shadow-md group-hover:from-amber-500 group-hover:via-rose-500 group-hover:to-yellow-400 transition-all duration-300">
                <div className="w-full h-full rounded-full border-2 border-zinc-950 overflow-hidden bg-zinc-900 flex items-center justify-center">
                  {userProfile.avatarBase64 ? (
                    <img 
                      src={userProfile.avatarBase64} 
                      alt="My Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs font-black text-amber-400 uppercase">You</span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-5.5 h-5.5 bg-gradient-to-r from-amber-500 to-rose-500 border-2 border-zinc-950 rounded-full flex items-center justify-center text-zinc-950 shadow">
                <Plus className="w-3.5 h-3.5 stroke-[3] text-white" />
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold max-w-[64px] truncate group-hover:text-amber-400 text-center">
              Add Story
            </span>
          </button>

          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer shrink-0 group transition-all active:scale-95"
            >
              <div className="relative">
                {/* Rainbow/Gold Gradient Instagram Circle ring */}
                <div className="w-15 h-15 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-yellow-400 shadow-md group-hover:rotate-45 transition-transform duration-500">
                  <div className="w-full h-full rounded-full border-2 border-zinc-950 overflow-hidden bg-zinc-900">
                    <img 
                      src={story.avatar} 
                      alt={story.author} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 font-bold max-w-[64px] truncate group-hover:text-amber-400">
                {story.author}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* CORE VIEW IMPLEMENTATIONS */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: DISCIPLINE TIMELINE FEED */}
        {activeView === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto w-full space-y-6"
          >
              
              {/* FEED LEVEL INCOMING FRIEND REQUESTS NOTIFICATION PANEL */}
              {myIncomingRequests.length > 0 && (
                <div className="bg-[#121214] border border-emerald-500/20 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4.5 h-4.5 text-emerald-400" />
                    <h4 className="text-xs font-display font-black text-zinc-200 uppercase tracking-wider">
                      নতুন বন্ধুত্বের অনুরোধ! ({myIncomingRequests.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {myIncomingRequests.map((reqId: string) => {
                      const requester = allServerMembers.find(m => m.id === reqId);
                      if (!requester) return null;
                      return (
                        <div key={reqId} className="flex items-center justify-between p-3.5 bg-zinc-950/80 border border-zinc-900 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <img
                              src={requester.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
                              alt={requester.name}
                              className="w-10 h-10 rounded-full object-cover border border-zinc-850"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-left">
                              <span className="text-xs font-bold text-zinc-200 block">{requester.name}</span>
                              <span className="text-[9.5px] text-zinc-500 block">ID: {requester.numberId || requester.id.slice(-6)} · {requester.niche || 'Glowup Partner'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => respondFriendRequest(reqId, 'accept')}
                              className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-zinc-950 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all active:scale-95 shadow"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => respondFriendRequest(reqId, 'decline')}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-rose-400 rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95 border border-zinc-800"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* POST CREATOR BOX */}
              <div className="bg-[#121214] border border-zinc-850 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                {isPublishing && (
                  <div className="absolute inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-zinc-200">পোস্ট এবং মিডিয়া আপলোড হচ্ছে...</p>
                      <p className="text-[10px] text-zinc-500">দয়া করে অপেক্ষা করুন, এটি সম্পন্ন হতে কয়েক সেকেন্ড লাগতে পারে।</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-400" />
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                      <img 
                        src={userProfile.avatarBase64 || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"} 
                        alt="My Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Share your grooming milestones, jawline progress, or posture check..."
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/30 min-h-[75px] resize-none"
                      />
                      
                      {newPostImage && (
                        <div className="relative rounded-xl border border-zinc-800 overflow-hidden max-h-[220px]">
                          <img 
                            src={newPostImage} 
                            alt="Preview" 
                            className="w-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewPostImage(null);
                              setNewPostImageName('');
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors animate-fade-in"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {(newPostVideo || newPostVideoPreview) && (
                        <div className="relative rounded-xl border border-zinc-800 overflow-hidden max-h-[220px] bg-zinc-950 flex items-center justify-center">
                          <video 
                            src={newPostVideoPreview || newPostVideo || ''} 
                            className="w-full h-full object-cover max-h-[200px]" 
                            autoPlay
                            loop
                            playsInline
                            muted
                          />
                          {isUploadingVideo && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2 text-amber-400 font-mono text-[10px]">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>ভিডিও সেভ হচ্ছে (Saving to Server)...</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setNewPostVideo(null);
                              setNewPostVideoPreview(null);
                              setNewPostVideoName('');
                              setIsUploadingVideo(false);
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-950">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-amber-400 border border-zinc-900 hover:border-zinc-800 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        {newPostImageName ? 'Change Image' : 'Add Photo'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-rose-400 border border-zinc-900 hover:border-zinc-800 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                        {newPostVideoName ? 'Change Video' : 'Add Video'}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            if (navigator.clipboard?.readText) {
                              const text = await navigator.clipboard.readText();
                              if (text && (text.includes('tiktok.com') || text.includes('douyin.com') || text.includes('instagram.com') || text.includes('instagr.am'))) {
                                const m = text.match(/https?:\/\/[^\s]+/i);
                                const link = m ? m[0] : text.trim();
                                setTikTokUrlInput(link);
                              }
                            }
                          } catch (e) {}
                          setShowTikTokModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-black hover:bg-zinc-900 text-zinc-300 hover:text-amber-400 border border-zinc-850 hover:border-amber-500/40 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm group"
                        title="TikTok ও Instagram রিল ডাউনলোড ও মডেল অটো-আপলোড"
                      >
                        <span className="text-xs group-hover:scale-110 transition-transform">⚡</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300">TikTok / Reels Import</span>
                      </button>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageSelect} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    <input 
                      type="file" 
                      ref={videoInputRef} 
                      onChange={handleVideoSelect} 
                      accept="video/*" 
                      className="hidden" 
                    />

                    <button
                      type="submit"
                      disabled={isPublishing || isUploadingVideo}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-500 text-zinc-950 font-black text-[11px] uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : isUploadingVideo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Video...</span>
                        </>
                      ) : (
                        <span>Publish Post</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* POSTS TIMELINE */}
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="bg-[#121214] border border-zinc-850 rounded-3xl p-10 text-center space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-900/80 flex items-center justify-center mx-auto text-zinc-500 shadow-inner">
                      <ImageIcon className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="space-y-2.5 max-w-sm mx-auto">
                      <h4 className="text-sm font-bold text-zinc-200">{t("কোনো পোস্ট করা হয়নি এখনও (No Posts Yet)", "No Posts Yet")}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {t("আমরা এখনও আইডি খুলিনি বা কেউ কোনো পোস্ট শেয়ার করিনি। তাই এই টাইমলাইনটি একদম ফ্রেশ এবং রেডি রাখা হয়েছে। আপনার প্রথম গ্রুমিং বা সেলফ-কেয়ার প্রোগ্রেস সবার আগে উপরে শেয়ার করুন!", "No posts have been shared yet. This timeline is ready and waiting for your first grooming or self-care progress post. Share your transformation first!")}
                      </p>
                      <div className="pt-2 border-t border-zinc-900/60">
                        <p className="text-[10px] text-zinc-500 font-mono italic">
                          "Timeline prepared. No automated mock posts will be added."
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  posts.map((post, index) => (
                    <CommunityPostCard
                      key={post.id}
                      post={post}
                      postIndex={index + 1}
                      totalPosts={posts.length}
                      userProfile={userProfile}
                      isLead={userProfile.isLead}
                      openMemberProfile={openMemberProfile}
                      handleDeletePost={handleDeletePost}
                      handleLikePost={handleLikePost}
                      handleSavePost={handleSavePost}
                      onCommentSubmit={handleCommentSubmit}
                    />
                  ))
                )}
              </div>
          </motion.div>
        )}



        {/* VIEW 3: SECURE COACH CHAT DMs */}
        {activeView === 'messages' && (
          <motion.div
            key="messages"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 border-0 md:border-b border-zinc-900 overflow-hidden bg-[#121214] w-full h-[calc(100vh-140px)]"
          >
            {/* DIRECT MESSAGE CHANNELS list (4 COLUMNS) */}
            <div className={`md:col-span-4 border-r border-zinc-950 p-4 space-y-4 overflow-y-auto h-full max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-zinc-900 ${
              selectedChatId ? 'hidden md:block' : 'block'
            }`}>
              <div className="text-left">
                <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">GlowGram Private Channels</span>
                <h3 className="text-sm font-display font-black text-zinc-200 uppercase">COMMUNITY MEMBERS / মেম্বারদের তালিকা</h3>
              </div>

              <div className="space-y-2">
                {(() => {
                  const friendsChatList = allServerMembers
                    .filter(m => m && m.id && !isMatchMember(m.id, effectiveMemberId) && !isFakeBotId(m.id) && !isFakeBotId(m.username))
                    .map(friend => {
                      const friendDMs = serverDMs.filter(dm => isBetweenUs(dm, effectiveMemberId, friend.id));
                      const lastDM = friendDMs[friendDMs.length - 1];
                      
                      return {
                        id: friend.id,
                        name: friend.name,
                        title: friend.niche || 'Glowup Transformation Partner',
                        avatar: friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
                        status: friend.isOnline !== undefined ? (friend.isOnline ? 'online' : 'offline') : 'online',
                        lastDMTime: lastDM ? lastDM.timestamp || lastDM.time : '',
                        messages: friendDMs.map(dm => ({
                          id: dm.id,
                          sender: isMatchMember(dm.senderId, effectiveMemberId) ? 'me' : 'them',
                          content: dm.content,
                          time: dm.time
                        }))
                      };
                    })
                    .sort((a, b) => {
                      if (a.messages.length > 0 && b.messages.length === 0) return -1;
                      if (a.messages.length === 0 && b.messages.length > 0) return 1;
                      return (b.lastDMTime || '').localeCompare(a.lastDMTime || '');
                    });

                  if (friendsChatList.length === 0) {
                    return (
                      <div className="py-8 px-4 text-center space-y-3 bg-zinc-950/40 rounded-2xl border border-zinc-900/40">
                        <Users className="w-8 h-8 text-zinc-700 mx-auto" />
                        <p className="text-[11px] text-zinc-300 font-bold">কোনো চ্যাট চ্যানেল নেই</p>
                        <p className="text-[9.5px] text-zinc-500 leading-relaxed">
                          মেম্বার অপশন থেকে বন্ধুদের সার্চ করে মেসেঞ্জারের মতো সরাসরি কথা বলুন!
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveView('directory')}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow transition-all active:scale-95 inline-flex items-center gap-1.5"
                        >
                          <Search className="w-3 h-3 text-zinc-950" />
                          <span>মেম্বার খুঁজুন (Find Members)</span>
                        </button>
                      </div>
                    );
                  }

                  return friendsChatList.map((ch) => {
                    const lastMsg = ch.messages[ch.messages.length - 1];
                    const isSelected = selectedChatId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedChatId(ch.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                          isSelected
                            ? 'bg-zinc-950 border-zinc-900 text-amber-400'
                            : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-950/40 hover:text-zinc-200'
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                            <img 
                              src={ch.avatar} 
                              alt={ch.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          {ch.status === 'online' && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-zinc-100 truncate">{ch.name}</h4>
                            <span className="text-[8px] font-mono text-zinc-550 shrink-0">Live</span>
                          </div>
                          <p className="text-[9.5px] text-zinc-500 truncate mt-0.5">{ch.title}</p>
                          {lastMsg && (
                            <p className="text-[9.5px] text-zinc-400 truncate font-mono mt-1">
                              {lastMsg.sender === 'me' ? 'You: ' : ''}{lastMsg.content}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* MESSAGE CONTAINER (8 COLUMNS) */}
            <div className={`md:col-span-8 flex flex-col justify-between h-full max-h-[calc(100vh-140px)] ${
              selectedChatId ? 'flex' : 'hidden md:flex'
            }`}>
              {selectedChat ? (
                <>
                  {/* Active Header */}
                  <div className="p-4.5 border-b border-zinc-950 bg-zinc-950/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedChatId('')}
                        className="md:hidden p-2 -ml-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title="ফিরে যান"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>লিস্ট</span>
                      </button>
                      <div 
                        onClick={() => openMemberProfile(selectedChat.id)}
                        className="flex items-center gap-3 cursor-pointer group/header select-none"
                      >
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-transform group-hover/header:scale-105">
                          <img 
                            src={selectedChat.avatar} 
                            alt={selectedChat.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-zinc-200 group-hover/header:text-amber-400 transition-colors">{selectedChat.name}</h4>
                          <span className="text-[9px] text-zinc-500 font-mono tracking-wide uppercase flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedChat.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-650'}`} />
                            {selectedChat.title} · {selectedChat.status === 'online' ? 'Active now' : 'Away'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 h-[calc(100vh-275px)] scrollbar-thin scrollbar-thumb-zinc-900">
                    {selectedChat.messages.map((m) => {
                      const isVoice = m.content && m.content.startsWith('🎙️ Voice Message');
                      return (
                        <div
                          key={m.id}
                          className={`flex gap-3 max-w-[80%] ${m.sender === 'me' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                          <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            m.sender === 'me'
                              ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/5 border border-amber-500/20 text-zinc-100 rounded-tr-none'
                              : 'bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-tl-none'
                          }`}>
                            {isVoice ? (
                              <VoiceMessagePlayer content={m.content} sender={m.sender === 'me' ? 'me' : 'them'} />
                            ) : (
                              <p className="text-left">{m.content}</p>
                            )}
                            <span className="block text-[8px] text-zinc-550 font-mono text-right mt-1.5">{m.time}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Form */}
                  <form onSubmit={handleSendDM} className="p-4 border-t border-zinc-950 bg-zinc-950/40 flex items-center gap-2 relative">
                    {isRecording ? (
                      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between bg-zinc-950 border border-zinc-900 rounded-2xl p-4 gap-3">
                        <div className="flex items-center gap-3 font-mono text-xs text-red-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                          <span className="font-bold tracking-wider uppercase">🎙️ RECORDING VOICE NOTE (রেকর্ড হচ্ছে):</span>
                          <span className="font-mono text-xs bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/20">
                            0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleCancelRecording}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-all active:scale-95 border border-zinc-800"
                          >
                            ❌ Cancel (বাতিল)
                          </button>
                          <button
                            type="button"
                            onClick={triggerStopAndSendVoice}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 rounded-xl text-xs font-black uppercase cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5 stroke-[3.5]" />
                            ✅ Send (রেকর্ড পাঠান)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          placeholder={`Send private message to ${selectedChat.name}...`}
                          className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/30"
                        />
                        
                        {/* Voice Message Toggle Button */}
                        <button
                          type="button"
                          onClick={startRecordingVoice}
                          className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-xl cursor-pointer transition-all flex items-center justify-center shadow-lg active:scale-95 shrink-0"
                          title="Record Voice Note"
                        >
                          <Mic className="w-4.5 h-4.5" />
                        </button>

                        <button
                          type="submit"
                          className="p-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl cursor-pointer transition-all flex items-center justify-center shadow-lg active:scale-95 shrink-0"
                          title="Send Message"
                        >
                          <Send className="w-4.5 h-4.5 stroke-[2.5]" />
                        </button>
                      </>
                    )}
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <Inbox className="w-12 h-12 text-zinc-800 animate-pulse" />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400">কোনো চ্যাট চ্যানেল লোড করা হয়নি</h4>
                    <p className="text-xs text-zinc-600 max-w-sm mt-1">বাম পাশের বন্ধুদের তালিকা থেকে যেকোনো বন্ধুর ওপর ক্লিক করে মেসেঞ্জারের মতো চ্যাট শুরু করুন।</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 4: ACTIVE MEMBERS DIRECTORY */}
        {activeView === 'directory' && (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search and stats bar */}
            <div className="bg-[#121214] border border-zinc-850 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left w-full md:w-auto">
                <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">GlowGram Collective Directory</span>
                <h3 className="text-sm font-display font-black text-zinc-200">ACTIVE TRANSFORMATION MEMBERS</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && directorySearch.trim()) {
                        openMemberProfile(directorySearch.trim());
                      }
                    }}
                    placeholder="মেম্বারের নাম বা আইডি লিখে সার্চ করুন..."
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl pl-10 pr-8 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/40"
                  />
                  {directorySearch && (
                    <button
                      onClick={() => setDirectorySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (directorySearch.trim()) {
                      openMemberProfile(directorySearch.trim());
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-zinc-950" />
                  <span>আইডি খুঁজুন / Open ID</span>
                </button>
              </div>
            </div>

            {/* INCOMING FRIEND REQUESTS NOTIFICATION SECTION */}
            {myIncomingRequests.length > 0 && (
              <div className="bg-[#121214] border border-zinc-850 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4.5 h-4.5 text-emerald-400" />
                  <h4 className="text-xs font-display font-black text-zinc-200 uppercase tracking-wider">বন্ধুত্বের অনুরোধসমূহ ({myIncomingRequests.length})</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myIncomingRequests.map((reqId: string) => {
                    const requester = allServerMembers.find(m => m.id === reqId || (m.name && m.name.toLowerCase() === reqId.toLowerCase()));
                    const reqName = requester?.name || reqId.replace(/^m_/, '').toUpperCase();
                    const reqAvatar = requester?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150';
                    const reqNumId = requester?.numberId || reqId.slice(-6);

                    return (
                      <div key={reqId} className="flex items-center justify-between p-3.5 bg-zinc-950/80 border border-zinc-900 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <img
                            src={reqAvatar}
                            alt={reqName}
                            className="w-10 h-10 rounded-full object-cover border border-zinc-850"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <span className="text-xs font-bold text-zinc-200 block">{reqName}</span>
                            <span className="text-[9.5px] text-zinc-500 block">ID: {reqNumId}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => respondFriendRequest(reqId, 'accept')}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-zinc-950 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all active:scale-95 shadow"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondFriendRequest(reqId, 'decline')}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-rose-400 rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95 border border-zinc-800"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Members Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMembersList
                .filter(m => 
                  m.name.toLowerCase().includes(directorySearch.toLowerCase()) || 
                  m.username.toLowerCase().includes(directorySearch.toLowerCase()) ||
                  m.niche.toLowerCase().includes(directorySearch.toLowerCase()) ||
                  (m.id && m.id.toLowerCase().includes(directorySearch.toLowerCase())) ||
                  (m.numberId && m.numberId.toString().toLowerCase().includes(directorySearch.toLowerCase()))
                )
                .map((member) => (
                  <div
                    key={member.id}
                    className={`bg-[#121214] border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all relative overflow-hidden group ${
                      member.isCurrentUser 
                        ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.03)]' 
                        : 'border-zinc-850 hover:border-zinc-800'
                    }`}
                  >
                    {/* Decorative Top Accent for Current User */}
                    {member.isCurrentUser && (
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 to-rose-500" />
                    )}

                    <div>
                      {/* Member Info Row */}
                      <div 
                        onClick={() => openMemberProfile(member.id)}
                        className="flex items-start justify-between gap-3 cursor-pointer group/member select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full p-[2px] ${
                              member.isCurrentUser 
                                ? 'bg-gradient-to-tr from-amber-500 to-rose-500' 
                                : 'bg-gradient-to-tr from-zinc-800 to-zinc-900'
                            }`}>
                              <div className="w-full h-full rounded-full border border-zinc-950 overflow-hidden bg-zinc-900">
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                            {/* Online green indicator */}
                            {member.isOnline && (
                              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                                {member.name}
                              </h4>
                              {member.isCurrentUser && (
                                <span className="text-[7.5px] font-mono bg-amber-500 text-zinc-950 px-1 py-0.2 rounded font-black uppercase">
                                  You
                                </span>
                              )}
                              {member.level >= 10 && (
                                <span className="text-[7.5px] font-mono bg-gradient-to-r from-amber-500 to-rose-500 text-zinc-950 px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5 shadow">
                                  ⚡ Top Member
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-550 font-mono">@{member.username}</span>
                          </div>
                        </div>

                        {/* Status label */}
                        <div className={`text-[8px] font-mono px-2 py-0.5 rounded-full border ${
                          member.isOnline 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-zinc-950/80 text-zinc-650 border-zinc-900'
                        }`}>
                          {member.isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>

                      {/* Level and Points Stats Card */}
                      <div className="bg-zinc-950/80 border border-zinc-900/60 rounded-2xl p-3.5 mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-550 text-[10px] uppercase">Level {member.level}</span>
                          <span className="text-amber-400 font-bold">{member.points} pts</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-[10px] text-zinc-300 font-bold font-mono tracking-wide uppercase truncate">
                            {member.levelName}
                          </span>
                        </div>
                      </div>

                      {/* Niche specialization */}
                      <div className="mt-3.5 text-left">
                        <span className="text-[8px] font-mono text-zinc-600 uppercase block tracking-wider">Transformation Focus</span>
                        <p className="text-[10.5px] text-zinc-400 leading-relaxed mt-0.5">
                          {member.niche}
                        </p>
                      </div>

                      {/* Badges Earned Container */}
                      {member.badges.length > 0 && (
                        <div className="mt-4 text-left">
                          <span className="text-[8px] font-mono text-zinc-650 uppercase block tracking-wider mb-1.5">
                            Unlocked Badges ({member.badgeCount})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {member.badges.map((badge, bidx) => (
                              <span
                                key={bidx}
                                className="text-[8.5px] font-mono font-medium bg-zinc-950 border border-zinc-900 text-zinc-400 px-2 py-0.5 rounded-md hover:border-amber-500/30 hover:text-amber-400 transition-colors"
                              >
                                🏆 {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA Action Button */}
                    <div className="mt-5 pt-3.5 border-t border-zinc-950 flex flex-col gap-2">
                      <button
                        onClick={() => openMemberProfile(member.id)}
                        className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-amber-400 font-bold border border-zinc-800 hover:border-zinc-700 rounded-xl text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>🆔 Profile ID Card / প্রোফাইল আইডি দেখুন</span>
                      </button>

                      {member.isCurrentUser ? (
                        <div className="w-full text-center py-1.5 bg-zinc-950 border border-zinc-900 rounded-xl text-[9.5px] text-zinc-550 font-mono uppercase tracking-wide">
                          Your Active Account
                        </div>
                      ) : myFriends.some(id => isMatchMember(id, member.id)) ? (
                        <button
                          onClick={() => handleContactMember(member.id)}
                          className="w-full py-2 bg-gradient-to-r from-amber-500/10 to-rose-500/10 hover:from-amber-500/20 hover:to-rose-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>DM Message</span>
                        </button>
                      ) : myOutgoingRequests.some(id => isMatchMember(id, member.id)) ? (
                        <div className="w-full text-center py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                          Requested / অনুরোধ পাঠানো হয়েছে
                        </div>
                      ) : myIncomingRequests.some(id => isMatchMember(id, member.id)) ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => respondFriendRequest(member.id, 'accept')}
                            className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondFriendRequest(member.id, 'decline')}
                            className="px-3 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border border-zinc-900 rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(member.id)}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-zinc-950 font-black uppercase tracking-widest rounded-xl text-[10px] hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-zinc-950" />
                          <span>Add Friend / বন্ধুত্ব করুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State for Search */}
            {activeMembersList.filter(m => 
              m.name.toLowerCase().includes(directorySearch.toLowerCase()) || 
              m.username.toLowerCase().includes(directorySearch.toLowerCase()) ||
              m.niche.toLowerCase().includes(directorySearch.toLowerCase()) ||
              (m.id && m.id.toLowerCase().includes(directorySearch.toLowerCase())) ||
              (m.numberId && m.numberId.toString().toLowerCase().includes(directorySearch.toLowerCase()))
            ).length === 0 && (
              <div className="bg-[#121214] border border-zinc-850 rounded-3xl p-10 text-center space-y-4 max-w-md mx-auto">
                <Users className="w-10 h-10 text-zinc-700 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-200">No Members Match Search</h4>
                  <p className="text-[10.5px] text-zinc-500">
                    We couldn't find any community members matching "{directorySearch}". Try searching for other names or IDs.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 5: MY INSTAGRAM-STYLE PROFILE (ME TAB) */}
        {activeView === 'me' && (
          <motion.div
            key="me-profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto w-full space-y-6 transform-gpu backface-hidden"
          >
            {/* INSTAGRAM PROFILE HEADER CARD */}
            <div className="bg-[#121214] border border-zinc-850 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              {/* UPPER AREA: AVATAR & QUICK STATS */}
              <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
                
                {/* AVATAR COLUMN WITH INSTAGRAM RING */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-rose-500 to-yellow-400 shadow-xl">
                    <div className="w-full h-full rounded-full border-4 border-[#121214] overflow-hidden bg-zinc-950 flex items-center justify-center">
                      {userProfile.avatarBase64 ? (
                        <img 
                          src={userProfile.avatarBase64} 
                          alt="My avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-10 h-10 text-zinc-500" />
                      )}
                    </div>
                  </div>
                  {userProfile.isLead && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-wider font-mono font-black bg-gradient-to-r from-amber-500 to-rose-500 text-zinc-950 border border-zinc-950 px-2.5 py-0.5 rounded-full shadow-lg">
                      CREATOR
                    </span>
                  )}
                </div>

                {/* STATS COUNT GRID */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-around text-center gap-2">
                    <div className="space-y-0.5">
                      <span className="block text-base sm:text-lg font-mono font-black text-zinc-100">
                        {posts.filter(p => 
                          p.author === (userProfile.name || 'Glowup Recruit') || 
                          p.authorUsername === (userProfile.name || '').toLowerCase().replace(/\s+/g, '_')
                        ).length}
                      </span>
                      <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-semibold">Posts</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="block text-base sm:text-lg font-mono font-black text-zinc-100">
                        {myFriends.length}
                      </span>
                      <span className="block text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-semibold">Friends (বন্ধু)</span>
                    </div>
                  </div>

                  {/* LEVEL & RANK DETAILED PILL */}
                  <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="text-left min-w-0">
                        <span className="block text-[8px] uppercase text-zinc-550 font-mono font-bold leading-none">Your Rank status</span>
                        <span className="block text-[10px] font-bold text-zinc-300 truncate uppercase mt-0.5">
                          Level {userLevel} · {userLevel >= 10 ? 'Aesthetic Overlord' : userLevel >= 7 ? 'Elite Mewing Monk' : userLevel >= 5 ? 'Grooming Paladin' : userLevel >= 3 ? 'Skincare Tactician' : 'Glowup Recruit'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-black bg-amber-500/10 px-2 py-0.5 rounded-md shrink-0">
                      {userPoints} PTS
                    </span>
                  </div>
                </div>

              </div>

              {/* IDENTITY & BIO SECTION */}
              <div className="text-left space-y-3 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-zinc-100 leading-tight flex items-center gap-1.5">
                      {userProfile.name || 'Aesthetic User'}
                      {userProfile.isLead && (
                        <svg className="w-5 h-5 text-blue-500 fill-current drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.4-1.4 2.7 2.7 6.6-6.6 1.4 1.4-8 8z" />
                        </svg>
                      )}
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">
                      @{userProfile.numberId || (userProfile.name || 'user').toLowerCase().replace(/\s+/g, '_')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (isEditingBio) {
                        handleSaveBio();
                      } else {
                        setBioInput(userBio);
                        setIsEditingBio(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all active:scale-95"
                  >
                    {isEditingBio ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Save Bio</span>
                      </>
                    ) : (
                      <>
                        <Edit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit Profile Bio</span>
                      </>
                    )}
                  </button>
                </div>

                {/* BIO RENDER / EDITOR */}
                {isEditingBio ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={3}
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder="Write your custom Instagram-style self-care bio..."
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/40 font-sans resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveBio}
                        className="px-3 py-1.5 bg-amber-500 text-[#0d0d0e] hover:bg-amber-400 font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        Save ✔
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans whitespace-pre-wrap bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-900/50">
                    {userBio}
                  </p>
                )}
              </div>

            </div>

            {/* INSTAGRAM-STYLE SWITCHABLE PROFILE SUB-TABS */}
            <div className="flex border-b border-zinc-900 gap-6 justify-center">
              <button
                onClick={() => setProfileSubTab('posts')}
                className={`pb-3 text-xs uppercase font-extrabold tracking-widest flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  profileSubTab === 'posts'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>My Posts ({
                  posts.filter(p => 
                    p.author === (userProfile.name || 'Glowup Recruit') || 
                    p.authorUsername === (userProfile.name || '').toLowerCase().replace(/\s+/g, '_')
                  ).length
                })</span>
              </button>
              <button
                onClick={() => setProfileSubTab('friends')}
                className={`pb-3 text-xs uppercase font-extrabold tracking-widest flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  profileSubTab === 'friends'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>My Friends ({myFriends.length})</span>
              </button>
              <button
                onClick={() => setProfileSubTab('cinema')}
                className={`pb-3 text-xs uppercase font-extrabold tracking-widest flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  profileSubTab === 'cinema'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>His Cinema ({ratedMovies.length})</span>
              </button>
            </div>

            {/* SUBTAB CONTENTS RENDER */}
            <div className="space-y-6">
              
              {/* PROFILE SUBTAB 1: USER POSTS GRID */}
              {profileSubTab === 'posts' && (
                <div className="space-y-4">
                  {posts.filter(p => 
                    p.author === (userProfile.name || 'Glowup Recruit') || 
                    p.authorUsername === (userProfile.name || '').toLowerCase().replace(/\s+/g, '_')
                  ).length === 0 ? (
                    <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-12 text-center space-y-4">
                      <ImageIcon className="w-12 h-12 text-zinc-800 mx-auto opacity-45" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-400 font-sans">আপনি এখনো কোনো পোস্ট করেননি</p>
                        <p className="text-xs text-zinc-600 max-w-sm mx-auto font-sans">
                          টাইমলাইন ফিডে গিয়ে ফটো বা ভিডিও আপলোড করে আপনার প্রথম গ্লো-আপ জার্নি শেয়ার করুন!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveView('feed')}
                        className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-all cursor-pointer font-sans"
                      >
                        ফিডে ফিরে যান (Go to Feed)
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {posts.filter(p => 
                        p.author === (userProfile.name || 'Glowup Recruit') || 
                        p.authorUsername === (userProfile.name || '').toLowerCase().replace(/\s+/g, '_')
                      ).map((post) => {
                        return (
                          <div
                            key={post.id}
                            onClick={() => setSelectedProfilePost(post)}
                            className="aspect-square bg-zinc-950 border border-zinc-900 hover:border-zinc-700 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md"
                          >
                            {post.image ? (
                              <CommunityImage
                                imageUrlOrKey={post.image}
                                alt="Post thumbnail"
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                              />
                            ) : post.video ? (
                              <div className="w-full h-full relative bg-black flex items-center justify-center">
                                <Play className="w-8 h-8 text-amber-400 absolute opacity-70 group-hover:opacity-100 transition-opacity z-10" />
                                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-[9px] font-mono text-zinc-650">
                                  [Video Clip]
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full p-4.5 bg-gradient-to-b from-[#121214] to-[#090a0c] flex flex-col justify-between text-left">
                                <p className="text-[10px] text-zinc-300 font-sans line-clamp-4 leading-normal">
                                  {post.content}
                                </p>
                                <span className="text-[8px] font-mono text-zinc-600">
                                  [Text Only]
                                </span>
                              </div>
                            )}

                            {/* HOVER OVERLAY (LIKES & COMMENTS COUNT) */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white text-xs font-black select-none">
                              <span className="flex items-center gap-1.5">
                                <Heart className="w-4.5 h-4.5 fill-rose-500 text-rose-500" />
                                {post.likes}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                                {post.comments.length}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE SUBTAB 2: HIS CINEMA VAULT */}
              {profileSubTab === 'cinema' && (
                <div className="space-y-4">
                  <div className="text-left bg-amber-500/5 border border-amber-500/10 p-4.5 rounded-2xl space-y-1">
                    <span className="text-[9px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md tracking-wider font-semibold w-max inline-block">
                      Cinematic Reflections
                    </span>
                    <h4 className="text-xs font-display font-black text-zinc-200">আমার মুভির টেস্ট ও রেটিং (My Cinema Taste Logs)</h4>
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans">
                      আমি যে অনুপ্রেরণামূলক সিনেমাগুলো দেখেছি, রেটিং দিয়েছি এবং আমার জীবনের মূল শিক্ষা বা নোটগুলো এখানে সংক্ষেপে দেখতে পাবেন।
                    </p>
                  </div>

                  {ratedMovies.length === 0 ? (
                    <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-12 text-center space-y-4">
                      <Film className="w-12 h-12 text-zinc-800 mx-auto opacity-45" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-400 font-sans">কোনো সিনেমা দেখা সম্পন্ন হয়নি</p>
                        <p className="text-xs text-zinc-600 max-w-sm mx-auto font-sans">
                          সিনেমা হাব অপশনে গিয়ে আপনার দেখা চমৎকার মুভিগুলোকে রেটিং ও রিভিউ দিলে এখানে সংক্ষেপে চমৎকারভাবে প্রদর্শিত হবে!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ratedMovies.map((movie) => (
                        <div
                          key={movie.id}
                          className="bg-[#121214] border border-zinc-900 rounded-2xl overflow-hidden flex items-center shadow-lg p-3 gap-3"
                        >
                          {/* Small aspect-2/3 movie poster */}
                          <img
                            src={movie.posterBase64}
                            alt={movie.title}
                            className="w-12 h-18 object-cover rounded-lg border border-zinc-800 shrink-0 shadow-md"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left min-w-0">
                            <h5 className="font-display font-black text-xs text-zinc-100 truncate">
                              {movie.title}
                            </h5>
                            <div className="flex gap-0.5 mt-1.5">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star 
                                  key={idx} 
                                  className={`w-3.5 h-3.5 ${idx < movie.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-800'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE SUBTAB 3: MY FRIENDS LIST */}
              {profileSubTab === 'friends' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-left bg-emerald-500/5 border border-emerald-500/10 p-4.5 rounded-2xl space-y-1">
                    <span className="text-[9px] uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md tracking-wider font-semibold w-max inline-block">
                      My Glowup Circle (আমার সার্কেল)
                    </span>
                    <h4 className="text-xs font-display font-black text-zinc-200">আমার বন্ধুদের তালিকা (My Connected Friends)</h4>
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed font-sans">
                      আমি যাদের সাথে কানেক্টেড আছি এবং যাদের সাথে গ্লো-আপ করার জন্য চমৎকার টিপস শেয়ার করছি।
                    </p>
                  </div>

                  {myFriends.length === 0 ? (
                    <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-12 text-center space-y-4">
                      <Users className="w-12 h-12 text-zinc-800 mx-auto opacity-45" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-400 font-sans">আপনার কোনো বন্ধু নেই</p>
                        <p className="text-xs text-zinc-600 max-w-sm mx-auto font-sans">
                          কমিউনিটি মেম্বারদের প্রোফাইলে গিয়ে "Add Friend" রিকোয়েস্ট পাঠান এবং কানেক্টেড হোন!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allServerMembers
                        .filter(m => myFriends.includes(m.id))
                        .map((friend) => (
                          <div
                            key={friend.id}
                            className="bg-[#121214] border border-zinc-900 rounded-2xl p-4 flex items-center justify-between shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'}
                                alt={friend.name}
                                className="w-10 h-10 object-cover rounded-full border border-zinc-850"
                                referrerPolicy="no-referrer"
                              />
                              <div className="text-left">
                                <h5 className="font-display font-black text-xs text-zinc-100">
                                  {friend.name}
                                </h5>
                                <p className="text-[10px] text-zinc-500 font-mono">@{friend.username || 'unknown'}</p>
                                <span className="inline-block px-1.5 py-0.5 bg-zinc-950 border border-zinc-900 text-[8px] font-mono rounded text-amber-500/80 mt-1 uppercase">
                                  {friend.niche || 'Glowup Partner'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-zinc-700'}`} />
                              <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500">
                                {friend.isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* PROFILE POST DETAIL MODAL */}
      <AnimatePresence>
        {selectedProfilePost && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#121214] border border-zinc-850 max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] my-auto">
              
              {/* Modal Header */}
              <div className="p-4.5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
                <div 
                  onClick={() => {
                    const post = selectedProfilePost;
                    setSelectedProfilePost(null);
                    openMemberProfile(post.author, post);
                  }}
                  className="flex items-center gap-2.5 text-left cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 group-hover:scale-105 transition-transform">
                    <img 
                      src={selectedProfilePost.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                      alt={selectedProfilePost.author} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">{selectedProfilePost.author}</h4>
                    <span className="text-[8.5px] font-mono text-zinc-500">@{selectedProfilePost.authorUsername}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProfilePost(null)}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Image/Video representation */}
                {!selectedProfilePost.video && selectedProfilePost.image && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-900 bg-black max-h-80 flex items-center justify-center">
                    <CommunityImage 
                      imageUrlOrKey={selectedProfilePost.image} 
                      alt="Post content" 
                      className="w-full h-full object-contain max-h-80" 
                    />
                  </div>
                )}
                {selectedProfilePost.video && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-900 bg-black">
                    <CommunityVideo videoUrlOrKey={selectedProfilePost.video} posterUrl={selectedProfilePost.image} postId={selectedProfilePost.id} sourceUrl={selectedProfilePost.sourceUrl} />
                  </div>
                )}

                {/* Text Content */}
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap text-left bg-zinc-950 p-4 rounded-2xl border border-zinc-900 font-sans">
                  {selectedProfilePost.content}
                </p>

                {/* Likes indicators */}
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-1">
                  <span>Logged at {selectedProfilePost.time}</span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    {selectedProfilePost.likes} likes
                  </span>
                </div>

                {/* Comments List Section */}
                <div className="space-y-3 pt-2">
                  <h5 className="text-[10px] font-mono uppercase text-zinc-550 tracking-widest text-left">Comments ({selectedProfilePost.comments.length})</h5>
                  
                  {selectedProfilePost.comments.length === 0 ? (
                    <p className="text-[11px] text-zinc-600 text-left font-sans py-2">No comments on this post yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedProfilePost.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2.5 p-3 bg-zinc-950/50 rounded-2xl border border-zinc-900 text-left font-sans">
                          <img 
                            src={comment.avatar} 
                            alt={comment.author} 
                            className="w-6.5 h-6.5 rounded-full object-cover border border-zinc-850 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-zinc-300">{comment.author}</span>
                              <span className="text-[8px] font-mono text-zinc-650">{comment.time}</span>
                            </div>
                            <p className="text-[10.5px] text-zinc-450 leading-normal mt-0.5">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer bar with Delete post option */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-between gap-3 items-center">
                {(userProfile.isLead || selectedProfilePost.authorUsername === userProfile.numberId) ? (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this post? This action is permanent.")) {
                        handleDeletePost(selectedProfilePost.id);
                        setSelectedProfilePost(null);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-zinc-950 text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={() => setSelectedProfilePost(null)}
                  className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-250 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL STORIES LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* Top timer countdown bar */}
              <div className="absolute top-4 inset-x-4 flex gap-1 z-10">
                <div className="h-[2px] bg-white/40 flex-1 rounded overflow-hidden">
                  <div className="h-full bg-white animate-[progress_5000ms_linear_forwards]" />
                </div>
              </div>

              {/* Story Header */}
              <div className="p-4 flex items-center justify-between border-b border-zinc-950 absolute top-6 inset-x-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img src={activeStory.avatar} alt={activeStory.author} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-xs text-white block leading-none">{activeStory.author}</span>
                    {activeStory.musicName && (
                      <span className="text-[8px] font-mono text-amber-400 flex items-center gap-1 mt-0.5 animate-pulse">
                        <Volume2 className="w-2.5 h-2.5" />
                        {activeStory.musicName}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 bg-black/55 rounded-full text-zinc-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Image */}
              <div className="relative flex-1 min-h-[400px] flex items-center justify-center bg-zinc-950">
                <img 
                  src={activeStory.image} 
                  alt="Story update" 
                  className="w-full object-cover h-[400px]" 
                  referrerPolicy="no-referrer"
                />
                
                {/* Motivational Quote Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/40 to-transparent text-left">
                  <p className="text-xs text-zinc-100 leading-relaxed font-semibold">
                    {activeStory.text}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE STORY DIALOG MODAL */}
      <AnimatePresence>
        {showStoryModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                    Share Story Update
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowStoryModal(false);
                    setNewStoryImage(null);
                    setNewStoryImageName('');
                    setNewStoryText('');
                  }}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 border border-zinc-900 rounded-lg bg-zinc-950/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateStory} className="p-5 space-y-4">
                {/* Upload Area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider block">
                    Upload Story Image
                  </label>
                  
                  {newStoryImage ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-850 bg-zinc-900/40">
                      <img 
                        src={newStoryImage} 
                        alt="Story preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNewStoryImage(null);
                          setNewStoryImageName('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black rounded-full text-zinc-400 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-[9px] font-mono text-zinc-300 truncate max-w-[80%]">
                        {newStoryImageName}
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => storyFileInputRef.current?.click()}
                      className="border border-dashed border-zinc-850 hover:border-amber-500/30 bg-zinc-900/20 hover:bg-zinc-900/40 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-2 group"
                    >
                      <ImageIcon className="w-8 h-8 text-zinc-650 group-hover:text-amber-400 mx-auto transition-colors" />
                      <div>
                        <p className="text-xs text-zinc-300 font-bold">Select Story Picture</p>
                        <p className="text-[10px] text-zinc-550 font-mono mt-0.5">Supports PNG, JPG (Max 4MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden File Inputs */}
                <input 
                  type="file" 
                  ref={storyFileInputRef} 
                  onChange={handleStoryImageSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <input 
                  type="file" 
                  ref={storyMusicFileInputRef} 
                  onChange={handleStoryMusicSelect} 
                  accept="audio/*" 
                  className="hidden" 
                />

                {/* Text Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider block">
                    Story Caption
                  </label>
                  <textarea
                    placeholder="Enter custom motivation, daily progress milestone, or thoughts..."
                    value={newStoryText}
                    onChange={(e) => setNewStoryText(e.target.value)}
                    rows={3}
                    maxLength={150}
                    className="w-full bg-zinc-900/60 border border-zinc-850 rounded-2xl p-3.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 resize-none"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                    <span>Keep it short & inspiring</span>
                    <span>{newStoryText.length}/150</span>
                  </div>
                </div>

                {/* Background Music Selector Block */}
                <div className="space-y-2 border-t border-zinc-900 pt-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Add Background Music (গান যোগ করুন)</span>
                    </label>
                    {newStoryMusicName && (
                      <span className="text-[9px] font-mono text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                        Song Active
                      </span>
                    )}
                  </div>

                  {newStoryMusicName ? (
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Volume2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[11px] text-zinc-200 font-bold truncate max-w-[220px]">
                            {newStoryMusicName}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-mono">
                            Auto-sync with story image duration
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewStoryMusicUrl(null);
                          setNewStoryMusicName('');
                          triggerNotification("🎵 Music Removed", "Background music has been detached.");
                        }}
                        className="p-1 text-zinc-550 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Presets Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => selectPredefinedMusic("🎵 Romantic Lofi (প্রেম ও আবেশ)", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3")}
                          className="px-2 py-2 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 border border-zinc-850 rounded-xl text-[9px] text-zinc-450 hover:text-white transition-all text-center font-bold"
                        >
                          Romantic Lofi
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPredefinedMusic("🎵 Alpha Phonk (এনার্জি ও জেদ)", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")}
                          className="px-2 py-2 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 border border-zinc-850 rounded-xl text-[9px] text-zinc-450 hover:text-white transition-all text-center font-bold"
                        >
                          Alpha Phonk
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPredefinedMusic("🎵 Soft Acoustic (মিষ্টি মেলোডি)", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3")}
                          className="px-2 py-2 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 border border-zinc-850 rounded-xl text-[9px] text-zinc-450 hover:text-white transition-all text-center font-bold"
                        >
                          Soft Acoustic
                        </button>
                      </div>

                      {/* Custom upload button */}
                      <button
                        type="button"
                        onClick={() => storyMusicFileInputRef.current?.click()}
                        className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-xl text-[10px] text-zinc-450 hover:text-amber-400 font-bold font-mono uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload Custom Audio (ফাইল থেকে গান)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStoryModal(false);
                      setNewStoryImage(null);
                      setNewStoryImageName('');
                      setNewStoryText('');
                    }}
                    className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-zinc-950 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-zinc-950" />
                    Share Story
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPLORE POST LIGHTBOX POPUP */}
      <AnimatePresence>
        {activeExplorePost && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setActiveExplorePost(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black/90 text-zinc-400 hover:text-white rounded-full cursor-pointer border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="bg-zinc-950 max-h-[350px] overflow-hidden flex items-center justify-center">
                <img 
                  src={activeExplorePost.image} 
                  alt={activeExplorePost.content} 
                  className="w-full object-cover max-h-[350px]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 space-y-4 text-left">
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                    Aesthetic Pillars
                  </span>
                  <span className="text-[10px] text-zinc-550 font-mono">Curated Explore Vault</span>
                </div>
                
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeExplorePost.content}
                </p>

                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> {activeExplorePost.likes} total saves
                  </span>
                  
                  <button
                    onClick={() => {
                      triggerNotification("✅ Save Successful", "Routine saved to your bookmarks library!");
                      setActiveExplorePost(null);
                    }}
                    className="px-4.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Save Protocol
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        </div>
      </div>

      {/* INSTAGRAM-STYLE FIXED BOTTOM NAVIGATION BAR */}
      <div className="bg-[#0b0b0c]/95 backdrop-blur-md border-t border-zinc-900/80 h-16.5 flex items-center justify-around shrink-0 z-20 px-4 select-none pb-safe">
        <button
          onClick={() => setActiveView('feed')}
          onDoubleClick={() => {
            if (activeView === 'feed') {
              handleRefreshAll();
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-2.5 transition-all cursor-pointer ${
            activeView === 'feed'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 font-black scale-105'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
          title="ডবল ক্লিক করে নিউজ ফিড রিফ্রেশ করুন"
        >
          <Grid className={`w-5.5 h-5.5 transition-colors ${activeView === 'feed' ? 'text-amber-400' : 'text-zinc-500'}`} />
          <span className="text-[9px] uppercase tracking-wider font-extrabold">Feed</span>
        </button>

        <button
          onClick={() => setActiveView('messages')}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-2.5 transition-all cursor-pointer relative ${
            activeView === 'messages'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 font-black scale-105'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5.5 h-5.5 transition-colors ${activeView === 'messages' ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          </div>
          <span className="text-[9px] uppercase tracking-wider font-extrabold">Chat DMs</span>
        </button>

        <button
          onClick={() => setActiveView('directory')}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-2.5 transition-all cursor-pointer ${
            activeView === 'directory'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 font-black scale-105'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <Users className={`w-5.5 h-5.5 transition-colors ${activeView === 'directory' ? 'text-amber-400' : 'text-zinc-500'}`} />
          <span className="text-[9px] uppercase tracking-wider font-extrabold">Members</span>
        </button>

        <button
          onClick={() => setActiveView('me')}
          className={`flex flex-col items-center justify-center gap-1 w-20 py-2.5 transition-all cursor-pointer ${
            activeView === 'me'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 font-black scale-105'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          {userProfile.avatarBase64 ? (
            <img 
              src={userProfile.avatarBase64} 
              alt="Me avatar" 
              className={`w-5.5 h-5.5 rounded-full object-cover border transition-all ${
                activeView === 'me' ? 'border-amber-400 scale-110 shadow-lg ring-2 ring-amber-400/25' : 'border-zinc-700 hover:border-zinc-500'
              }`} 
            />
          ) : (
            <User className={`w-5.5 h-5.5 transition-colors ${activeView === 'me' ? 'text-amber-400' : 'text-zinc-500'}`} />
          )}
          <span className="text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-0.5">
            Me <span className="px-0.5 py-[1px] text-[7.5px] font-mono bg-amber-500/15 border border-amber-500/25 text-amber-400 rounded-sm scale-90">L{userLevel}</span>
          </span>
        </button>
      </div>

      {/* SEAMLESS MEMBER PROFILE DIALOG PANEL */}
      <AnimatePresence>
        {selectedProfileMember && (() => {
          // Inner helper for member-specific movie watchlists matching their aesthetic niches perfectly
          const getMemberMovies = (member: any) => {
            if (member.isCurrentUser) {
              return ratedMovies;
            }
            const name = member.name || '';
            if (name.includes('Sajid')) {
              return [
                {
                  id: 'm_s_1',
                  title: 'American Psycho',
                  rating: 5,
                  addedAt: '2026-06-15',
                  posterBase64: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=150',
                  description: 'The morning routine and aesthetic grooming protocol are legendary. Absolutely necessary for self-care focus and discipline.'
                },
                {
                  id: 'm_s_2',
                  title: 'Fight Club',
                  rating: 5,
                  addedAt: '2026-05-10',
                  posterBase64: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150',
                  description: 'A masterclass in reclaiming masculinity, rejecting consumerism, and developing pure willpower and discipline.'
                }
              ];
            } else if (name.includes('Tahmid')) {
              return [
                {
                  id: 'm_t_1',
                  title: 'Limitless',
                  rating: 5,
                  addedAt: '2026-07-01',
                  posterBase64: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=150',
                  description: 'How a complete lifestyle transformation can unlock 100% of your cognitive and physical potential. Insanely motivating.'
                },
                {
                  id: 'm_t_2',
                  title: 'The Social Network',
                  rating: 4,
                  addedAt: '2026-06-20',
                  posterBase64: 'https://images.unsplash.com/photo-1542204172-e70528091850?auto=format&fit=crop&w=150',
                  description: 'Focusing 100% of your time on building an empire, ignoring distractions, and working with ultimate efficiency.'
                }
              ];
            } else if (name.includes('Fahim')) {
              return [
                {
                  id: 'm_f_1',
                  title: 'Whiplash',
                  rating: 5,
                  addedAt: '2026-06-05',
                  posterBase64: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150',
                  description: 'The cost of greatness. Absolute obsession, blood, sweat, and tears are required to become the best in the world.'
                },
                {
                  id: 'm_f_2',
                  title: 'Rocky',
                  rating: 5,
                  addedAt: '2026-05-01',
                  posterBase64: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150',
                  description: 'The ultimate tale of grit, willpower, and physical self-mastery. True classic for any gym aesthetic lover.'
                }
              ];
            } else {
              return [
                {
                  id: 'm_fallback_1',
                  title: 'Drive',
                  rating: 5,
                  addedAt: '2026-07-12',
                  posterBase64: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=150',
                  description: 'Minimalist, quiet confidence, elegant styling, and an incredible retro-futuristic aesthetic style.'
                },
                {
                  id: 'm_fallback_2',
                  title: 'The Great Gatsby',
                  rating: 4,
                  addedAt: '2026-07-05',
                  posterBase64: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?auto=format&fit=crop&w=150',
                  description: 'Impeccable style, extreme presentation, social elegance, and an inspiring journey of personal reinvention.'
                }
              ];
            }
          };

          const memberPosts = posts.filter(p => 
            p.author === selectedProfileMember.name || 
            p.authorUsername === selectedProfileMember.username || 
            (p.authorUsername && p.authorUsername.toLowerCase() === (selectedProfileMember.name || '').toLowerCase().replace(/\s+/g, '_'))
          );

          const memberMovies = getMemberMovies(selectedProfileMember);

          return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              {/* Backdrop with elegant blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProfileMember(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
              />
              
              {/* Elegant Modal Box with soft blue accents */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md bg-gradient-to-b from-[#0a0f1d] to-[#04060b] border border-sky-500/15 rounded-[28px] overflow-hidden shadow-2xl p-6 select-none"
              >
                {/* Top ambient glow */}
                <div className="absolute top-0 left-1/4 right-1/4 h-16 bg-gradient-to-b from-sky-500/10 to-transparent blur-xl pointer-events-none" />

                {/* Header section with Close Button */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-900/40 relative z-10">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-sky-400">
                    Member Protocol Profile
                  </span>
                  <button
                    onClick={() => setSelectedProfileMember(null)}
                    className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Details Header Section */}
                <div className="pt-4 pb-2 flex flex-col items-center text-center space-y-3 relative z-10">
                  <div className="relative">
                    {/* Outer breathing blue circle */}
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 opacity-25 blur animate-pulse" />
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-950 bg-zinc-900 relative">
                      <img 
                        src={selectedProfileMember.avatar} 
                        alt={selectedProfileMember.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-zinc-950 font-mono text-[8px] font-black px-1.5 py-0.5 rounded-full border border-zinc-950 shadow-md">
                      LVL {selectedProfileMember.level}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-sm font-display font-black tracking-wide text-zinc-100 uppercase">
                      {selectedProfileMember.name}
                    </h3>
                    <p className="text-[9px] text-sky-400 font-mono tracking-wider">
                      @{selectedProfileMember.username}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-sans font-medium px-4 pt-1 italic font-mono">
                      "{selectedProfileMember.niche}"
                    </p>
                  </div>
                </div>

                {/* Custom Tab Switcher */}
                <div className="flex border-b border-zinc-900/40 relative z-10 text-xs my-3 justify-center gap-2">
                  <button
                    onClick={() => setMemberProfileTab('about')}
                    className={`pb-2 px-2.5 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer text-[9.5px] ${
                      memberProfileTab === 'about'
                        ? 'border-sky-500 text-sky-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    About (পরিচিতি)
                  </button>
                  <button
                    onClick={() => setMemberProfileTab('posts')}
                    className={`pb-2 px-2.5 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer text-[9.5px] ${
                      memberProfileTab === 'posts'
                        ? 'border-sky-500 text-sky-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    Posts ({memberPosts.length})
                  </button>
                  <button
                    onClick={() => setMemberProfileTab('movies')}
                    className={`pb-2 px-2.5 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer text-[9.5px] ${
                      memberProfileTab === 'movies'
                        ? 'border-sky-500 text-sky-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    Cinema ({memberMovies.length})
                  </button>
                </div>

                {/* Tabbed Content Area */}
                <div className="w-full min-h-[140px] max-h-[220px] overflow-y-auto pr-1 text-left relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 space-y-3 mb-4">
                  {memberProfileTab === 'about' && (
                    <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4.5 space-y-3.5 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Rank Status:</span>
                        <span className="font-bold text-sky-300 font-display text-[10px] tracking-wide uppercase bg-sky-500/5 border border-sky-500/10 px-2 py-0.5 rounded-md">
                          {selectedProfileMember.levelName}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Experience Points:</span>
                        <span className="font-black text-zinc-200 font-mono">{selectedProfileMember.points} XP</span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Status:</span>
                        <span className="flex items-center gap-1.5 font-bold">
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedProfileMember.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-650'}`} />
                          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">{selectedProfileMember.isOnline ? 'Active Online' : 'Offline'}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {memberProfileTab === 'posts' && (
                    <div className="space-y-2.5">
                      {memberPosts.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-[11px] italic font-sans">
                          এই ইউজারের কোনো পোস্ট পাওয়া যায়নি (No posts recorded)
                        </div>
                      ) : (
                        memberPosts.map((post: any) => (
                          <div key={post.id} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3.5 space-y-2">
                            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans text-left">{post.content}</p>
                            {post.image && (
                              <CommunityImage
                                imageUrlOrKey={post.image}
                                alt="Post attachment"
                                className="w-full max-h-32 object-cover rounded-lg border border-zinc-900"
                              />
                            )}
                            <span className="block text-[8px] text-zinc-600 font-mono text-right">{post.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {memberProfileTab === 'movies' && (
                    <div className="space-y-2.5">
                      {memberMovies.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-[11px] italic font-sans">
                          কোনো সিনেমা টেস্ট ডেটা নেই (No movie logs recorded)
                        </div>
                      ) : (
                        memberMovies.map((movie: any) => (
                          <div key={movie.id} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 flex items-center gap-3">
                            <img
                              src={movie.posterBase64}
                              alt={movie.title}
                              className="w-10 h-15 object-cover rounded-md border border-zinc-900 shrink-0 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-left min-w-0 flex-1">
                              <h5 className="font-display font-black text-[11px] text-zinc-200 truncate">{movie.title}</h5>
                              <div className="flex gap-0.5 mt-1.5">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <Star 
                                    key={idx} 
                                    className={`w-2.5 h-2.5 ${idx < movie.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-800'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Footer action buttons */}
                <div className="space-y-2 relative z-10 pt-2 border-t border-zinc-900/30">
                  {!selectedProfileMember.isCurrentUser && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedProfileMember(null);
                          setActiveView('messages');
                          setSelectedChatId(selectedProfileMember.id);
                        }}
                        className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 fill-zinc-950" />
                        Send Private Message (মেসেজ করুন)
                      </button>
                      
                      {/* Only show friend requests interactions if they aren't friends already */}
                      {!myFriends.some(id => isMatchMember(id, selectedProfileMember.id)) && (
                        <button
                          onClick={() => {
                            sendFriendRequest(selectedProfileMember.id);
                            setSelectedProfileMember(null);
                          }}
                          className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-900 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Send Friend Request
                        </button>
                      )}
                    </>
                  )}
                  
                  <button
                    onClick={() => setSelectedProfileMember(null)}
                    className="w-full py-2.5 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                  >
                    Dismiss Profile
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* TIKTOK VIDEO DOWNLOADER & MODEL AUTO-POSTER MODAL */}
      <AnimatePresence>
        {showTikTokModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-[#0e0e11] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(255,0,127,0.15)] overflow-hidden space-y-6"
            >
              {/* Background ambient accents */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-850 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <div className="w-10 h-10 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center shadow-lg shadow-pink-500/20 text-lg">
                      🎵
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 border border-zinc-800 flex items-center justify-center shadow-lg shadow-rose-500/20 text-lg">
                      📸
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 tracking-tight">
                      TikTok ও Instagram ডাউনলোডার
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      ভিডিও ডাউনলোড ও মডেল প্রোফাইল নিয়ে অটো-আপলোড
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isTikTokDownloading) {
                      setShowTikTokModal(false);
                      setTikTokStep(0);
                    }
                  }}
                  disabled={isTikTokDownloading}
                  className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="space-y-4 relative z-10 text-left">
                {/* Video URL or Downloader HTML Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <span>🔗 লিংক বা ডাউনলোডার HTML</span>
                      {tikTokUrlInput && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          tikTokUrlInput.startsWith('<') || tikTokUrlInput.includes('<!DOCTYPE') || tikTokUrlInput.includes('<html') || tikTokUrlInput.includes('sf_url')
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : tikTokUrlInput.includes('instagram.com') || tikTokUrlInput.includes('instagr.am')
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {tikTokUrlInput.startsWith('<') || tikTokUrlInput.includes('<!DOCTYPE') || tikTokUrlInput.includes('<html') || tikTokUrlInput.includes('sf_url')
                            ? '🌐 Website HTML Parser'
                            : tikTokUrlInput.includes('instagram.com') || tikTokUrlInput.includes('instagr.am')
                            ? '📸 Instagram Reel'
                            : '🎵 TikTok Video'}
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (navigator.clipboard?.readText) {
                            const text = await navigator.clipboard.readText();
                            if (text) {
                              setTikTokUrlInput(text.trim());
                              triggerNotification("📋 পেস্ট সম্পন্ন!", "লিংক/HTML ইনপুটে নেওয়া হয়েছে।");
                            }
                          }
                        } catch (e) {}
                      }}
                      disabled={isTikTokDownloading}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Copy className="w-3 h-3" />
                      পেস্ট করুন
                    </button>
                  </div>

                  <div className="relative">
                    {tikTokUrlInput.length > 120 || tikTokUrlInput.includes('\n') || tikTokUrlInput.startsWith('<') ? (
                      <textarea
                        value={tikTokUrlInput}
                        onChange={(e) => setTikTokUrlInput(e.target.value)}
                        placeholder="ইনস্টাগ্রাম/টিকটক লিংক অথবা কোনো ডাউনলোডার সাইটের সম্পূর্ণ HTML পেস্ট করুন..."
                        disabled={isTikTokDownloading}
                        rows={3}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={tikTokUrlInput}
                        onChange={(e) => setTikTokUrlInput(e.target.value)}
                        placeholder="ইনস্টাগ্রাম বা টিকটক রিল লিংক দিন..."
                        disabled={isTikTokDownloading}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono"
                      />
                    )}
                    {tikTokUrlInput && !isTikTokDownloading && (
                      <button
                        type="button"
                        onClick={() => setTikTokUrlInput('')}
                        className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Assigned User Model Card from Model Option */}
                <div className="bg-zinc-950/90 border border-zinc-850 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={activeChosenModel.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                        alt={activeChosenModel.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/70 shadow-md bg-zinc-900"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                    </div>
                    <div className="overflow-hidden min-w-0 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-white truncate">
                          {activeChosenModel.name}
                        </h4>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 shrink-0 font-mono">
                          মডেল অপশন
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                        @{activeChosenModel.handle ? activeChosenModel.handle.replace(/^@/, '') : 'creator'}
                      </p>
                      <p className="text-[9px] text-zinc-500 truncate">
                        এই অ্যাকাউন্টের প্রোফাইল থেকে পোস্ট হবে
                      </p>
                    </div>
                  </div>

                  {availableModelPersonas.length > 1 && !isTikTokDownloading && (
                    <button
                      type="button"
                      onClick={() => setSelectedModelIdx(prev => prev + 1)}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/50 rounded-xl text-[10px] font-mono font-bold text-amber-400 transition-all shrink-0 cursor-pointer active:scale-95"
                      title="মডেল অপশনের পরবর্তী আইডিতে পরিবর্তন করুন"
                    >
                      বদলান ↻
                    </button>
                  )}
                </div>

                {/* Auto Countdown Badge */}
                {tikTokAutoCountdown !== null && !isTikTokDownloading && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      স্বয়ংক্রিয়ভাবে ডাউনলোড হচ্ছে ({tikTokAutoCountdown}s)...
                    </span>
                    <button
                      type="button"
                      onClick={() => setTikTokAutoCountdown(null)}
                      className="text-[10px] font-bold text-zinc-400 hover:text-white px-2 py-0.5 bg-zinc-900 rounded-lg cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                )}

                {/* Progress Steps when downloading */}
                {isTikTokDownloading && (
                  <div className="space-y-3 bg-zinc-950 border border-zinc-850 rounded-2xl p-4 animate-fadeIn text-left">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300 font-bold flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
                        {tikTokStep === 1 && "১. ভিডিও ডাউনলোড হচ্ছে..."}
                        {tikTokStep === 2 && "২. মডেল প্রোফাইলে অ্যাসাইন হচ্ছে..."}
                        {tikTokStep === 3 && "৩. GrowGram টাইমলাইনে আপলোড হচ্ছে..."}
                        {tikTokStep === 4 && "৪. সম্পন্ন হয়েছে! 🎉"}
                      </span>
                      <span className="text-pink-400 font-black">{tikTokStep * 25}%</span>
                    </div>

                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, tikTokStep * 25)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Big Action Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleTikTokDownloadAndAutoPost()}
                    disabled={isTikTokDownloading || !tikTokUrlInput.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-[0_8px_30px_rgba(255,0,127,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    {isTikTokDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 text-black animate-spin" />
                        <span>ভিডিও প্রসেস হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-black transition-transform group-hover:-translate-y-0.5" />
                        <span>ভিডিও ডাউনলোড ও পোস্ট করুন</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Simple 1-line quick helper */}
                <p className="text-[10px] text-zinc-500 text-center font-mono pt-1">
                  💡 টিকটক বা ইনস্টাগ্রামে কোনো ভিডিও "Copy Link" করলেই এখানে চলে আসবে
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
