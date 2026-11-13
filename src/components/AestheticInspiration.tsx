import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Play, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Film, 
  Sparkles, 
  BookOpen, 
  Clock, 
  AlertCircle,
  Music,
  Music2,
  Volume2,
  VolumeX,
  Pause,
  Zap,
  Disc,
  Timer,
  ChevronDown,
  ChevronUp,
  Shield,
  Heart,
  HelpCircle,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import { triggerNotification } from '../utils';

import {
  analyzeAudioStructure,
  initRemixAudioEngine,
  acquireBgMusicPauseLock,
  releaseBgMusicPauseLock,
  getBgMusicPauseLocks,
  findBestInstrumentalEntry,
  isWindowInstrumental,
  type MusicItem,
  type MusicAnalysis,
  type MusicSegment,
  type RemixSessionStatus
} from '../utils/remixAudioEngine';

export {
  analyzeAudioStructure,
  acquireBgMusicPauseLock,
  releaseBgMusicPauseLock,
  getBgMusicPauseLocks,
  findBestInstrumentalEntry,
  isWindowInstrumental,
  type MusicItem,
  type MusicAnalysis,
  type MusicSegment,
  type RemixSessionStatus
};

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  dataUrl: string; // Base64 representation of the photo or video, or direct URL
  addedAt: string;
  likes?: number;
  isLiked?: boolean;
}

interface MusicAlbum {
  id: string;
  name: string;
  theme: string;
  trackIds: string[]; // references to MusicItem IDs
  addedAt: string;
}

// Simple native IndexedDB setup
const DB_NAME = 'lookmax_aesthetic_library_db';
const STORE_NAME = 'inspiration_items_v2';
const MUSIC_STORE_NAME = 'library_music_items_v2';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Upgraded to version 4 to include the new music store (retaining database version 4)
    const request = indexedDB.open(DB_NAME, 4);
    request.onupgradeneeded = (e: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MUSIC_STORE_NAME)) {
        db.createObjectStore(MUSIC_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getAllItems(): Promise<MediaItem[]> {
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

export function saveItemDB(item: MediaItem): Promise<void> {
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export function deleteItemDB(id: string): Promise<void> {
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export function getAllMusicItems(): Promise<MusicItem[]> {
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MUSIC_STORE_NAME, 'readonly');
      const store = transaction.objectStore(MUSIC_STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

export function saveMusicItemDB(item: MusicItem): Promise<void> {
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MUSIC_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(MUSIC_STORE_NAME);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export function deleteMusicItemDB(id: string): Promise<void> {
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MUSIC_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(MUSIC_STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export const DEFAULT_PREMIUM_TRACKS: MusicItem[] = [];

// Initialize Intelligent Instrumental Remix Audio Engine globally
if (typeof window !== 'undefined') {
  initRemixAudioEngine();
  if (!(window as any).__REMIX_DB_ANALYSIS_SYNC__) {
    (window as any).__REMIX_DB_ANALYSIS_SYNC__ = true;
    window.addEventListener('bg_music_analysis_updated', (e: any) => {
      const { trackId, analysis } = e?.detail || {};
      if (!trackId || !analysis) return;
      const track = (window.bgMusicTrackList || []).find((t) => t.id === trackId);
      if (track) {
        saveMusicItemDB({ ...track, analysis }).catch(() => {});
      }
    });
  }
}

const REMOVED_DUPLICATE_TRACKS: MusicItem[] = []; // [
/*
  {
    name: 'Cozy Rain Lofi (লফি রিলাক্স)',
    dataUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    addedAt: '২৮ জুলাই, ২০২৬'
  },
  {
    id: 'premium-2',
    name: 'Chill Study Session (স্টাডি লফি)',
    dataUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    addedAt: '২৮ জুলাই, ২০২৬'
  },
  {
    id: 'premium-3',
    name: 'Phonk Gym Energy (জিম মোটিভেশন)',
    dataUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    addedAt: '২৮ জুলাই, ২০২৬'
  },
  {
    id: 'premium-4',
    name: 'Midnight Run Synth (মিডনাইট সিন্থ)',
    dataUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    addedAt: '২৮ জুলাই, ২০২৬'
  },
  {
    id: 'premium-5',
    name: 'Morning Coffee Focus (মর্নিং কফি)',
    dataUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    addedAt: '২৮ জুলাই, ২০২৬'
  },
  {
    id: 'premium-6',
    name: 'Aesthetic Chill Wave (অ্যাথলেটিক চিল)',
    dataUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    addedAt: '২৮ জুলাই, ২০২৬'
  }
];
*/

const DEFAULT_REELS: MediaItem[] = [
  {
    id: 'default-reel-1',
    name: 'Aesthetic Flow & Focus',
    type: 'video',
    dataUrl: '/media/reel_cinema_3.mp4',
    addedAt: '২৮ জুলাই, ২০২৬',
    likes: 124,
    isLiked: false
  },
  {
    id: 'default-reel-2',
    name: 'Hardcore Gym Motivation',
    type: 'video',
    dataUrl: '/media/reel_fitness_2.mp4',
    addedAt: '২৮ জুলাই, ২০২৬',
    likes: 310,
    isLiked: false
  },
  {
    id: 'default-reel-3',
    name: 'SelfX Cinema & Luxury',
    type: 'video',
    dataUrl: '/media/reel_aesthetic_1.mp4',
    addedAt: '২৮ জুলাই, ২০২৬',
    likes: 85,
    isLiked: false
  },
  {
    id: 'default-reel-4',
    name: 'Cardio Run & TikTok Reel',
    type: 'video',
    dataUrl: '/media/tiktok_1790492113986.mp4',
    addedAt: '২৮ জুলাই, ২০২৬',
    likes: 198,
    isLiked: false
  }
];

export interface AestheticInspirationProps {
  onClose?: () => void;
}

export default function AestheticInspiration({ onClose }: AestheticInspirationProps = {}) {
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemName, setItemName] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'video' | 'image'>('all');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- REELS STATES ---
  const [activeReelIndex, setActiveReelIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showAddReelModal, setShowAddReelModal] = useState<boolean>(false);
  const [manualReelUrl, setManualReelUrl] = useState<string>('');
  const [manualReelName, setManualReelName] = useState<string>('');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [doubleTapHeart, setDoubleTapHeart] = useState<boolean>(false);

  // Background Music States
  const [musicList, setMusicList] = useState<MusicItem[]>(() => {
    return window.bgMusicTrackList || DEFAULT_PREMIUM_TRACKS;
  });

  const [bgMusicEnabled, setBgMusicEnabled] = useState<boolean>(() => {
    return Boolean(window.bgMusicIsEnabled);
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(() => {
    return window.bgMusicCurrentIndex !== undefined ? window.bgMusicCurrentIndex : 0;
  });

  const [musicName, setMusicName] = useState<string>('');
  const [isUploadingMusic, setIsUploadingMusic] = useState<boolean>(false);
  const [musicError, setMusicError] = useState<string | null>(null);

  const [analyzingTrackIds, setAnalyzingTrackIds] = useState<string[]>([]);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);



  const handleAnalyzeTrack = (trackId: string) => {
    const track = musicList.find(t => t.id === trackId);
    if (!track) return;

    setAnalyzingTrackIds(prev => [...prev, trackId]);
    triggerNotification("⚡ AI DJ scanning audio...", `"${track.name}" এর ভোকাল এবং টিউন সীমানা চিহ্নিত করা হচ্ছে। অনুগ্রহ করে একটু অপেক্ষা করুন।`);

    setTimeout(() => {
      analyzeAudioStructure(track.dataUrl)
        .then(analysisResult => {
          const updatedTrack = { ...track, analysis: analysisResult };
          saveMusicItemDB(updatedTrack)
            .then(() => {
              setMusicList(prev => prev.map(t => t.id === trackId ? updatedTrack : t));
              setAnalyzingTrackIds(prev => prev.filter(id => id !== trackId));
              triggerNotification("✨ AI DJ Mapping complete!", `"${track.name}"-এর জন্য সঠিক ট্রানজিশন পয়েন্ট সেট করা হয়েছে! BPM: ${analysisResult.bpm} | Energy: ${analysisResult.energy}`);
            })
            .catch(err => {
              console.error("Failed to save analysis to IndexedDB", err);
              setAnalyzingTrackIds(prev => prev.filter(id => id !== trackId));
              triggerNotification("❌ Analysis Failed", "স্টোরেজে সেভ করতে সমস্যা হয়েছে।", true);
            });
        })
        .catch(err => {
          console.error("Audio analysis failed", err);
          setAnalyzingTrackIds(prev => prev.filter(id => id !== trackId));
          triggerNotification("❌ Analysis Error", "অডিও ফাইলটি পার্স করা সম্ভব হয়নি।", true);
        });
    }, 400);
  };

  // Music Album States
  const [albums, setAlbums] = useState<MusicAlbum[]>(() => {
    const DEFAULT_ALBUMS: MusicAlbum[] = [];
    const saved = localStorage.getItem('lookmax_music_albums_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : DEFAULT_ALBUMS;
      } catch (e) {
        return DEFAULT_ALBUMS;
      }
    }
    return DEFAULT_ALBUMS;
  });

  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(() => {
    return localStorage.getItem('lookmax_selected_album_id_v1') || 'all';
  });

  const [showCreateAlbum, setShowCreateAlbum] = useState<boolean>(false);
  const [newAlbumName, setNewAlbumName] = useState<string>('');
  const [newAlbumTheme, setNewAlbumTheme] = useState<string>('');
  const [selectedTrackIdsForAlbum, setSelectedTrackIdsForAlbum] = useState<string[]>([]);
  const [albumError, setAlbumError] = useState<string | null>(null);

  // Turbo DJ Remix Mode States
  const [remixModeEnabled, setRemixModeEnabled] = useState<boolean>(() => {
    return localStorage.getItem('lookmax_remix_enabled_v1') === 'true';
  });

  const [remixSessionDuration, setRemixSessionDuration] = useState<number>(() => {
    const val = localStorage.getItem('lookmax_remix_duration_v1');
    return val ? parseInt(val) : 10; // Default: 10 minutes
  });

  const [remixBlendInterval, setRemixBlendInterval] = useState<number>(() => {
    const val = localStorage.getItem('lookmax_remix_interval_v1');
    return val ? parseInt(val) : 60; // Default: 60 seconds
  });

  const [remixClimaxBoost, setRemixClimaxBoost] = useState<boolean>(() => {
    return localStorage.getItem('lookmax_remix_climax_boost_v1') !== 'false'; // Default: true
  });

  const [remixSessionActive, setRemixSessionActive] = useState<boolean>(false);
  const [remixSessionTimeElapsed, setRemixSessionTimeElapsed] = useState<number>(0);
  const [remixClimaxActive, setRemixClimaxActive] = useState<boolean>(false);
  const [liveBass, setLiveBass] = useState<number>(0);
  const [liveVocal, setLiveVocal] = useState<number>(0);

  // Active tracks is memoized based on selection
  const activeTracks = useMemo(() => {
    if (selectedAlbumId === 'all' || !selectedAlbumId) {
      return musicList;
    }
    const album = albums.find(a => a.id === selectedAlbumId);
    if (!album) return musicList;
    return musicList.filter(track => album.trackIds.includes(track.id));
  }, [musicList, albums, selectedAlbumId]);

  const [currentlyPlayingTrackId, setCurrentlyPlayingTrackId] = useState<string | null>(() => {
    const active = window.bgMusicActiveIndex === 0 ? window.bgMusicEngine : window.bgMusicEngineSec;
    if (active && !active.paused && window.bgMusicTrackList && window.bgMusicCurrentIndex !== undefined) {
      const track = window.bgMusicTrackList[window.bgMusicCurrentIndex];
      return track ? track.id : null;
    }
    return null;
  });

  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // Load background music tracks from IndexedDB without auto-starting playback
  useEffect(() => {
    getAllMusicItems()
      .then(items => {
        const list = [...DEFAULT_PREMIUM_TRACKS, ...items];
        setMusicList(list);
        window.bgMusicTrackList = list;
      })
      .catch(err => {
        console.error("Failed to load music items", err);
        setMusicList(DEFAULT_PREMIUM_TRACKS);
        window.bgMusicTrackList = DEFAULT_PREMIUM_TRACKS;
      });
  }, []);

  // Sync background music states with window on user interaction
  useEffect(() => {
    window.bgMusicTrackList = activeTracks;
    window.bgMusicIsEnabled = bgMusicEnabled;
  }, [activeTracks, bgMusicEnabled]);

  // Sync DJ Remix states with global window object
  useEffect(() => {
    window.bgMusicRemixModeEnabled = remixModeEnabled;
    window.bgMusicRemixBlendInterval = remixBlendInterval;
    window.bgMusicRemixClimaxActive = remixClimaxActive;
  }, [remixModeEnabled, remixBlendInterval, remixClimaxActive]);

  // Manage Remix Session timer
  useEffect(() => {
    if (!remixModeEnabled || !bgMusicEnabled || !currentlyPlayingTrackId) {
      setRemixSessionTimeElapsed(0);
      setRemixClimaxActive(false);
      return;
    }

    const interval = setInterval(() => {
      setRemixSessionTimeElapsed(prev => {
        const nextElapsed = prev + 1;
        
        if (remixSessionDuration > 0) {
          const totalSeconds = remixSessionDuration * 60;
          const remaining = totalSeconds - nextElapsed;

          // Check for Climax Phase (last 90 seconds of the total session)
          if (remixClimaxBoost && remaining <= 90 && remaining > 0) {
            if (!remixClimaxActive) {
              setRemixClimaxActive(true);
              triggerNotification("🔥 TURBO CLIMAX ACTIVE", "রিমিক্স সেশনের শেষ ৯০ সেকেন্ডে গানগুলো দ্রুত পরিবর্তিত হবে ও একে অপরের সাথে মিশে যাবে!");
            }
          }

          if (remaining <= 0) {
            clearInterval(interval);
            if (window.pauseBgMusic) {
              window.pauseBgMusic(true);
            }
            triggerNotification("🎉 Session Completed!", `${remixSessionDuration} মিনিটের রিমিক্স সেশন সফলভাবে শেষ হয়েছে!`);
            setRemixClimaxActive(false);
            return 0;
          }
        }

        return nextElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remixModeEnabled, bgMusicEnabled, currentlyPlayingTrackId, remixSessionDuration, remixClimaxBoost, remixClimaxActive]);

  // Poll active engine's currentTime to show accurate countdown
  const [engineTime, setEngineTime] = useState<number>(0);
  useEffect(() => {
    if (!remixModeEnabled || !bgMusicEnabled || !currentlyPlayingTrackId) {
      setEngineTime(0);
      setLiveBass(0);
      setLiveVocal(0);
      return;
    }

    const timer = setInterval(() => {
      const active = window.bgMusicActiveIndex === 0 ? window.bgMusicEngine : window.bgMusicEngineSec;
      if (active) {
        setEngineTime(active.currentTime);
      }
      const analyser = window.bgMusicActiveIndex === 0 ? window.bgMusicAnalyser1 : window.bgMusicAnalyser2;
      if (analyser) {
        try {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          // Calculate live bass and live vocal values
          let bassSum = 0;
          for (let i = 0; i <= 3; i++) {
            bassSum += dataArray[i];
          }
          setLiveBass(Math.round(bassSum / 4));

          let vocalSum = 0;
          for (let i = 4; i <= 30; i++) {
            vocalSum += dataArray[i];
          }
          setLiveVocal(Math.round(vocalSum / 27));
        } catch (e) {}
      }
    }, 250); // fast update for smooth countdown bar

    return () => clearInterval(timer);
  }, [remixModeEnabled, bgMusicEnabled, currentlyPlayingTrackId]);

  // Set up track change callback
  useEffect(() => {
    window.onBgMusicTrackChange = (index, trackId) => {
      setCurrentTrackIndex(index);
      setCurrentlyPlayingTrackId(trackId);
    };
    return () => {
      window.onBgMusicTrackChange = undefined;
    };
  }, []);

  // Sync enablement changes when explicitly toggled inside the session
  useEffect(() => {
    const onEnabledChange = (e: Event) => {
      const custom = e as CustomEvent<{ enabled?: boolean }>;
      if (typeof custom?.detail?.enabled === 'boolean') {
        setBgMusicEnabled(custom.detail.enabled);
      }
    };
    window.addEventListener('bg_music_enabled_change', onEnabledChange);
    return () => window.removeEventListener('bg_music_enabled_change', onEnabledChange);
  }, []);

  useEffect(() => {
    window.bgMusicIsEnabled = bgMusicEnabled;
    if (bgMusicEnabled) {
      if (!window.bgMusicAutoPaused && getBgMusicPauseLocks().length === 0 && window.playBgMusic) {
        window.playBgMusic();
      }
    } else {
      window.bgMusicAutoPaused = false;
      if (window.pauseBgMusic) {
        window.pauseBgMusic(true);
      }
    }
  }, [bgMusicEnabled]);

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMusicError(null);
    setIsUploadingMusic(true);

    if (!file.type.startsWith('audio/')) {
      setMusicError("Please select a valid audio file (MP3, WAV, M4A, etc.).");
      setIsUploadingMusic(false);
      return;
    }

    // Limit files to 15MB for optimal IndexedDB speed
    if (file.size > 15 * 1024 * 1024) {
      setMusicError("Music file is too large. Please select a track under 15MB.");
      setIsUploadingMusic(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const trackName = musicName.trim() || file.name.replace(/\.[^/.]+$/, ""); // strip extension

      const newTrack: MusicItem = {
        id: crypto.randomUUID(),
        name: trackName,
        dataUrl,
        addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      saveMusicItemDB(newTrack)
        .then(() => {
          setMusicList(prev => [...prev, newTrack]);
          triggerNotification("🎵 Music Saved", `"${trackName}" added to background music rotation!`);
          
          // Clear inputs
          setMusicName('');
          if (audioFileInputRef.current) {
            audioFileInputRef.current.value = '';
          }
          setIsUploadingMusic(false);
          
          // Enable music only within active session after explicit upload
          if (!bgMusicEnabled) {
            setBgMusicEnabled(true);
            window.dispatchEvent(new CustomEvent('bg_music_enabled_change', { detail: { enabled: true } }));
          }
        })
        .catch(err => {
          console.error("IndexedDB music save failed", err);
          setMusicError("Storage is full or unavailable in your browser.");
          setIsUploadingMusic(false);
        });
    };

    reader.onerror = () => {
      setMusicError("Failed to read audio file.");
      setIsUploadingMusic(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteMusic = (id: string, name: string) => {
    deleteMusicItemDB(id)
      .then(() => {
        const updated = musicList.filter(item => item.id !== id);
        setMusicList(updated);

        // Remove from albums too
        const updatedAlbums = albums.map(alb => ({
          ...alb,
          trackIds: alb.trackIds.filter(tid => tid !== id)
        }));
        setAlbums(updatedAlbums);
        localStorage.setItem('lookmax_music_albums_v1', JSON.stringify(updatedAlbums));

        triggerNotification("🗑️ Music Deleted", `"${name}" removed from background rotation.`);
        
        // If current track is deleted, reset index or handle it
        if (updated.length === 0) {
          if (window.pauseBgMusic) {
            window.pauseBgMusic(false);
          } else if (window.bgMusicEngine) {
            window.bgMusicEngine.pause();
          }
          setCurrentlyPlayingTrackId(null);
        } else {
          if (window.selectBgMusic) {
            window.selectBgMusic(0);
          } else {
            setCurrentTrackIndex(0);
          }
        }
      })
      .catch(err => {
        console.error("Failed to delete track", err);
      });
  };



  // Load from IndexedDB on mount and handle shared PWA targets
  useEffect(() => {
    getAllItems()
      .then(items => {
        const videoItems = items.filter(item => item.type === 'video');
        if (videoItems.length === 0) {
          setLibraryItems(DEFAULT_REELS);
          // Save them to DB for consistency
          DEFAULT_REELS.forEach(reel => saveItemDB(reel).catch(() => {}));
        } else {
          const sorted = [...videoItems].sort((a, b) => b.id.localeCompare(a.id));
          setLibraryItems(sorted);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.warn("IndexedDB failed, falling back to localStorage", err);
        const saved = localStorage.getItem('lookmax_simplified_library');
        if (saved) {
          try {
            const parsed = JSON.parse(saved).filter((item: any) => item.type === 'video');
            if (parsed.length === 0) {
              setLibraryItems(DEFAULT_REELS);
            } else {
              setLibraryItems(parsed);
            }
          } catch (e) {
            setLibraryItems(DEFAULT_REELS);
          }
        } else {
          setLibraryItems(DEFAULT_REELS);
        }
        setIsLoading(false);
      });

    // Check for Instagram Shared PWA intent
    const urlParams = new URLSearchParams(window.location.search);
    const text = urlParams.get('text') || '';
    const url = urlParams.get('url') || '';
    const title = urlParams.get('title') || '';
    
    const combined = `${title} ${text} ${url}`;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = combined.match(urlRegex);
    
    if (matches && matches.length > 0) {
      const foundUrl = matches[0];
      // Only process valid links (Instagram, web videos, etc.)
      if (foundUrl.includes('instagram.com') || foundUrl.includes('facebook.com') || foundUrl.includes('youtube.com') || foundUrl.includes('tiktok.com') || foundUrl.match(/\.(mp4|webm|mov|ogg)/i)) {
        const cleanUrl = foundUrl.trim();
        const id = 'shared-' + Date.now();
        const newReel: MediaItem = {
          id,
          name: "Shared Instagram Reel",
          type: 'video',
          dataUrl: cleanUrl,
          addedAt: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
          likes: Math.floor(Math.random() * 120) + 15,
          isLiked: false
        };
        
        saveItemDB(newReel).then(() => {
          setLibraryItems(prev => [newReel, ...prev]);
          setActiveReelIndex(0);
          triggerNotification("🎬 রিলস সেভ হয়েছে!", "ইনস্টাগ্রাম থেকে রিলসটি সফলভাবে লাইব্রেরিতে যোগ করা হয়েছে!");
          
          // Clear query params immediately
          window.history.replaceState({}, document.title, window.location.pathname);
        }).catch(err => {
          console.error("Auto import of shared reel failed:", err);
        });
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMsg("Please select a valid image or video file from your phone.");
      setIsProcessing(false);
      return;
    }

    // Larger files are fully supported now via IndexedDB!
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("File size too large. Please upload files under 15MB to maintain smooth offline playback.");
      setIsProcessing(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isImage) {
        // Compress images to save space but retain nice resolution
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Better quality, up from 500
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82); // High quality, up from 0.65
            setFileDataUrl(compressed);
            setFileType('image');
          }
          setIsProcessing(false);
        };
        img.onerror = () => {
          setErrorMsg("Failed to process selected picture.");
          setIsProcessing(false);
        };
        img.src = result;
      } else {
        // Safe base64 video string (Fully supported in IndexedDB)
        setFileDataUrl(result);
        setFileType('video');
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("Failed to read selection.");
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileDataUrl || !fileType) {
      setErrorMsg("Please select a file first!");
      return;
    }

    const nameToUse = itemName.trim() || `Inspiration ${fileType === 'video' ? 'Reel' : 'Photo'} #${libraryItems.length + 1}`;

    const newItem: MediaItem = {
      id: crypto.randomUUID(),
      name: nameToUse,
      type: fileType,
      dataUrl: fileDataUrl,
      addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setIsProcessing(true);

    // Save to IndexedDB (virtually unlimited quota!)
    saveItemDB(newItem)
      .then(() => {
        setLibraryItems(prev => [newItem, ...prev]);
        triggerNotification("✨ Save Successful", `Added ${nameToUse} to your inspiration library!`);
        
        // Safe localStorage backup (stores without the heavy dataUrl to avoid crashes)
        try {
          const minimalItems = [newItem, ...libraryItems].map(item => ({
            ...item,
            dataUrl: "" // keep local storage light and clean, zero risk of QuotaExceededError
          }));
          localStorage.setItem('lookmax_simplified_library', JSON.stringify(minimalItems));
        } catch (err) {
          console.warn("localStorage sync skipped", err);
        }

        // Reset form
        setItemName('');
        setFileDataUrl(null);
        setFileType(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setIsProcessing(false);
      })
      .catch(err => {
        console.error("IndexedDB write failed", err);
        setErrorMsg("Local sandbox storage error. Attempting safe fallback save...");
        
        // Localstorage fallback, wrapped safely
        try {
          const minimalItem = { ...newItem, dataUrl: newItem.dataUrl.substring(0, 100000) }; // limit data URL length to prevent crashes
          setLibraryItems(prev => [newItem, ...prev]);
          localStorage.setItem('lookmax_simplified_library', JSON.stringify([minimalItem, ...libraryItems]));
          triggerNotification("✨ Saved with limits", "Saved to standard memory with compression.");
          
          setItemName('');
          setFileDataUrl(null);
          setFileType(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (lsErr: any) {
          setErrorMsg("Could not save to browser. Please free up space in your browser history / cache.");
        }
        setIsProcessing(false);
      });
  };

  const handleDeleteItem = (id: string, name: string) => {
    deleteItemDB(id)
      .then(() => {
        const remaining = libraryItems.filter(item => item.id !== id);
        setLibraryItems(remaining);
        triggerNotification("🗑️ Item Removed", `"${name}" has been deleted.`);
        
        // Update light legacy backup
        try {
          const minimalRemaining = remaining.map(item => ({ ...item, dataUrl: "" }));
          localStorage.setItem('lookmax_simplified_library', JSON.stringify(minimalRemaining));
        } catch (err) {
          console.warn("localStorage legacy sync error", err);
        }
      })
      .catch(err => {
        console.error("IndexedDB deletion error", err);
        // Fallback State filter
        setLibraryItems(prev => prev.filter(item => item.id !== id));
        triggerNotification("🗑️ Item Removed", `"${name}" removed from view.`);
      });
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    setAlbumError(null);

    const name = newAlbumName.trim();
    const theme = newAlbumTheme.trim();

    if (!name) {
      setAlbumError("অ্যালবামের নাম দিতে হবে!");
      return;
    }

    if (selectedTrackIdsForAlbum.length === 0) {
      setAlbumError("অন্তত ১টি গান নির্বাচন করুন!");
      return;
    }

    const newAlbum: MusicAlbum = {
      id: crypto.randomUUID(),
      name,
      theme: theme || 'General',
      trackIds: selectedTrackIdsForAlbum,
      addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedAlbums = [...albums, newAlbum];
    setAlbums(updatedAlbums);
    localStorage.setItem('lookmax_music_albums_v1', JSON.stringify(updatedAlbums));

    // Reset create fields
    setNewAlbumName('');
    setNewAlbumTheme('');
    setSelectedTrackIdsForAlbum([]);
    setShowCreateAlbum(false);

    triggerNotification("📁 অ্যালবাম তৈরি হয়েছে", `"${name}" অ্যালবামটি সফলভাবে তৈরি হয়েছে!`);
  };

  const handleSelectAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId);
    localStorage.setItem('lookmax_selected_album_id_v1', albumId);

    // Get the tracks for the selected album
    let tracksForSelection = musicList;
    if (albumId !== 'all') {
      const alb = albums.find(a => a.id === albumId);
      if (alb) {
        tracksForSelection = musicList.filter(track => alb.trackIds.includes(track.id));
      }
    }

    // We must reset the background current track index to 0
    window.bgMusicCurrentIndex = 0;
    setCurrentTrackIndex(0);

    // Update global list immediately so the engine can pick it up
    window.bgMusicTrackList = tracksForSelection;

    if (bgMusicEnabled && tracksForSelection.length > 0) {
      if (window.selectBgMusic) {
        // Trigger play of first track in this album with smooth crossfade
        window.selectBgMusic(0);
      } else if (window.playBgMusic) {
        window.playBgMusic();
      }
      triggerNotification("📁 অ্যালবাম চালু হয়েছে", `"${albumId === 'all' ? 'সব গান' : albums.find(a => a.id === albumId)?.name}" ব্যাকগ্রাউন্ডে বাজছে`);
    } else {
      triggerNotification("📁 অ্যালবাম সিলেক্ট করা হয়েছে", `"${albumId === 'all' ? 'সব গান' : albums.find(a => a.id === albumId)?.name}" সিলেক্ট করা হয়েছে`);
    }
  };

  const handleDeleteAlbum = (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the album when clicking delete
    const updatedAlbums = albums.filter(a => a.id !== albumId);
    setAlbums(updatedAlbums);
    localStorage.setItem('lookmax_music_albums_v1', JSON.stringify(updatedAlbums));

    if (selectedAlbumId === albumId) {
      // Switch back to "all"
      setSelectedAlbumId('all');
      localStorage.setItem('lookmax_selected_album_id_v1', 'all');
      window.bgMusicTrackList = musicList;
      window.bgMusicCurrentIndex = 0;
      setCurrentTrackIndex(0);
      if (bgMusicEnabled && musicList.length > 0) {
        if (window.selectBgMusic) {
          window.selectBgMusic(0);
        }
      }
    }

    triggerNotification("🗑️ অ্যালবাম ডিলিট করা হয়েছে", "অ্যালবামটি ডিলিট করা হয়েছে (কিন্তু গানগুলো ডিলিট হয়নি)।");
  };

  // --- REELS HELPER FUNCTIONS ---
  const toggleLikeReel = (reelId: string) => {
    setLibraryItems(prev => prev.map(item => {
      if (item.id === reelId) {
        const isLiked = !item.isLiked;
        const currentLikes = item.likes || 0;
        const updatedItem = {
          ...item,
          isLiked,
          likes: isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)
        };
        saveItemDB(updatedItem).catch(e => console.error("Failed to save liked state:", e));
        return updatedItem;
      }
      return item;
    }));
    setDoubleTapHeart(true);
    setTimeout(() => setDoubleTapHeart(false), 800);
  };

  const handleDeleteReel = (reelId: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই রিলসটি ডিলিট করতে চান?")) {
      deleteItemDB(reelId)
        .then(() => {
          setLibraryItems(prev => prev.filter(item => item.id !== reelId));
          setActiveReelIndex(prev => Math.max(0, prev - 1));
          triggerNotification("🗑️ রিলস ডিলিট হয়েছে", "লাইব্রেরি থেকে রিলসটি ডিলিট করা হয়েছে।");
        })
        .catch(err => {
          console.error("Failed to delete reel:", err);
          triggerNotification("❌ ডিলিট ব্যর্থ", "রিলসটি ডিলিট করতে সমস্যা হয়েছে।", true);
        });
    }
  };

  const handleAddManualReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReelUrl) {
      alert("অনুগ্রহ করে একটি লিংক দিন!");
      return;
    }
    const id = 'manual-' + Date.now();
    const newReel: MediaItem = {
      id,
      name: manualReelName || "Custom Added Reel",
      type: 'video',
      dataUrl: manualReelUrl.trim(),
      addedAt: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      likes: Math.floor(Math.random() * 80) + 10,
      isLiked: false
    };

    saveItemDB(newReel)
      .then(() => {
        setLibraryItems(prev => [newReel, ...prev]);
        setActiveReelIndex(0);
        setShowAddReelModal(false);
        setManualReelUrl('');
        setManualReelName('');
        triggerNotification("🎉 রিলস যোগ হয়েছে!", "নতুন রিলস সফলভাবে লাইব্রেরিতে যোগ করা হয়েছে!");
      })
      .catch(err => {
        console.error("Failed to save manual reel:", err);
        alert("রিলস যোগ করতে সমস্যা হয়েছে!");
      });
  };

  const isInstagramUrl = (url: string) => {
    return url.includes('instagram.com/reel/') || url.includes('instagram.com/p/');
  };

  const getInstagramEmbedUrl = (url: string) => {
    const clean = url.split('?')[0];
    const slash = clean.endsWith('/') ? '' : '/';
    return `${clean}${slash}embed/`;
  };

  const isYoutubeShorts = (url: string) => {
    return url.includes('youtube.com/shorts/') || url.includes('youtu.be/shorts/');
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/shorts\/([^/?#&]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&loop=1&playlist=${match[1]}&controls=0&mute=${isMuted ? 1 : 0}`;
    }
    return url;
  };

  // Cooldown and Gesture handling
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        // Next reel
        setActiveReelIndex(prev => Math.min(libraryItems.length - 1, prev + 1));
      } else {
        // Prev reel
        setActiveReelIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (window.reelScrollCooldown) return;
    window.reelScrollCooldown = true;
    setTimeout(() => { window.reelScrollCooldown = false; }, 850);

    if (e.deltaY > 0) {
      setActiveReelIndex(prev => Math.min(libraryItems.length - 1, prev + 1));
    } else if (e.deltaY < 0) {
      setActiveReelIndex(prev => Math.max(0, prev - 1));
    }
  };

  const currentReel = libraryItems[activeReelIndex];

  // Auto-pause background music when viewing YouTube Shorts inside Reels
  useEffect(() => {
    const isYt = Boolean(currentReel && isYoutubeShorts(currentReel.dataUrl));
    if (isYt) {
      acquireBgMusicPauseLock('component:reels_youtube');
      return () => {
        releaseBgMusicPauseLock('component:reels_youtube');
      };
    }
  }, [currentReel?.id, currentReel?.dataUrl]);

  return (
    <div id="full-screen-reels-container" className="w-full h-full min-h-screen flex flex-col relative select-none bg-black justify-center items-center">
      
      {/* FLOATING CLOSE BUTTON */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 z-40 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-zinc-300 hover:text-white border border-zinc-800/80 flex items-center justify-center transition-all cursor-pointer shadow-xl"
          title="Exit Full Screen"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* CORE REELS INTERACTION LAYER */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-black">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <span className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-zinc-500 font-mono">ভিডিওসমূহ লোড হচ্ছে...</p>
          </div>
        ) : !currentReel ? (
          <div className="text-center bg-zinc-950/20 border border-dashed border-zinc-900 rounded-3xl p-10 max-w-md">
            <Film className="w-12 h-12 text-zinc-750 mx-auto mb-3" />
            <h4 className="text-sm font-black text-zinc-300 uppercase tracking-wider">কোন রিলস পাওয়া যায়নি</h4>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              সেটিংস মেনু থেকে আপনার প্রিয় ইনস্টাগ্রাম রিলস বা ভিডিও লিংক যোগ করুন!
            </p>
          </div>
        ) : (
          <div 
            className="w-full h-full max-w-[450px] md:h-[95vh] md:aspect-[9/16] md:my-auto bg-black md:rounded-3xl overflow-hidden shadow-2xl md:border md:border-zinc-900 relative flex items-center justify-center"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* THE VIDEO / IFRAME PLAYER */}
            <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
              {isInstagramUrl(currentReel.dataUrl) ? (
                <iframe
                  key={currentReel.id}
                  src={getInstagramEmbedUrl(currentReel.dataUrl)}
                  className="w-full h-full border-0 pointer-events-auto"
                  allowTransparency={true}
                  allow="fullscreen"
                  scrolling="no"
                />
              ) : isYoutubeShorts(currentReel.dataUrl) ? (
                <iframe
                  key={currentReel.id}
                  src={getYoutubeEmbedUrl(currentReel.dataUrl)}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  key={currentReel.id}
                  src={currentReel.dataUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={() => toggleLikeReel(currentReel.id)}
                />
              )}
            </div>

            {/* TOUCH DOUBLE-TAP HEART BURST ANIMATION */}
            <AnimatePresence>
              {doubleTapHeart && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute z-30 pointer-events-none text-red-500 drop-shadow-xl"
                >
                  <Heart className="w-20 h-20 fill-current" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* FLOATING HUD OVERLAYS - RIGHT COLUMN (Heart) */}
            <div className="absolute bottom-20 right-4 z-20 flex flex-col items-center gap-5">
              
              {/* Like / Heart Action */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleLikeReel(currentReel.id)}
                  className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-zinc-800/80 flex items-center justify-center cursor-pointer hover:bg-black/80 transition-transform active:scale-90 shadow-2xl"
                >
                  <Heart className={`w-6 h-6 ${currentReel.isLiked ? 'text-red-500 fill-red-500' : 'text-zinc-250'}`} />
                </button>
                <span className="text-[11px] font-mono text-zinc-100 font-black drop-shadow-lg select-none">
                  {currentReel.likes || 0}
                </span>
              </div>
            </div>

            {/* FLOATING HUD OVERLAYS - BOTTOM TITLE BAR (Very subtle title overlay) */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 pt-10 z-10 text-left pointer-events-none">
              <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
                {currentReel.name}
              </h4>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
