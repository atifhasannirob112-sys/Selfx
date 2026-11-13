import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Upload, 
  Trash2, 
  Disc, 
  Heart,
  Repeat,
  Shuffle,
  ListMusic,
  Maximize2
} from 'lucide-react';
import { triggerNotification } from '../utils';

interface TrackItem {
  id: string;
  name: string;
  size: string;
  url: string; // Object URL to local sound
  addedAt: string;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    bgAudioEngine?: HTMLAudioElement;
    bgAudioCurrentTrack?: TrackItem;
    bgAudioIsPlaying?: boolean;
    bgAudioTrackList?: TrackItem[];
    bgAudioCurrentIndex?: number;
    bgAudioVolume?: number;
  }
}

export default function MusicPlayer() {
  const [tracks, setTracks] = useState<TrackItem[]>(() => {
    // Keep local tracks session reference across tab mounts inside the window global state
    if (window.bgAudioTrackList) {
      return window.bgAudioTrackList;
    }
    return [];
  });

  const [currentTrack, setCurrentTrack] = useState<TrackItem | null>(() => {
    return window.bgAudioCurrentTrack || null;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    return window.bgAudioIsPlaying || false;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return window.bgAudioCurrentIndex !== undefined ? window.bgAudioCurrentIndex : -1;
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState<number>(() => {
    return window.bgAudioVolume !== undefined ? window.bgAudioVolume : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [pulseBars, setPulseBars] = useState<number[]>(Array.from({ length: 30 }, () => 15));
  const [bgPlaybackMode, setBgPlaybackMode] = useState<'normal' | 'remix'>(() => {
    return (typeof window !== 'undefined' && window.bgMusicPlaybackMode) ? window.bgMusicPlaybackMode : (localStorage.getItem('bg_music_playback_mode') as 'normal' | 'remix') || 'normal';
  });

  useEffect(() => {
    const onModeChange = (e: Event) => {
      const custom = e as CustomEvent<{ mode?: 'normal' | 'remix' }>;
      if (custom?.detail?.mode) {
        setBgPlaybackMode(custom.detail.mode);
      }
    };
    window.addEventListener('bg_music_mode_change', onModeChange);
    return () => window.removeEventListener('bg_music_mode_change', onModeChange);
  }, []);

  const togglePlaybackMode = (mode: 'normal' | 'remix') => {
    setBgPlaybackMode(mode);
    localStorage.setItem('bg_music_playback_mode', mode);
    if (typeof window !== 'undefined') {
      window.bgMusicPlaybackMode = mode;
      if (window.setBgMusicPlaybackMode) {
        window.setBgMusicPlaybackMode(mode);
      }
    }
    if (mode === 'remix') {
      triggerNotification("🎛️ Remix Mode সক্রিয়", "প্রতিটি গান সর্বোচ্চ ১:৩০ চলবে এবং ভোকাল-মুক্ত ইন্সট্রুমেন্টাল অংশে বিট-ম্যাচড ক্রসফেড ও পজিশন মেমোরি সক্রিয় হয়েছে!");
    } else {
      triggerNotification("🎵 Normal Mode সক্রিয়", "প্রতিটি গান সম্পূর্ণ স্বাভাবিকভাবে বাজবে।");
    }
  };

  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);

  // Sync with Global window variables so audio continues playing background-ly
  useEffect(() => {
    window.bgAudioTrackList = tracks;
  }, [tracks]);

  useEffect(() => {
    window.bgAudioCurrentTrack = currentTrack || undefined;
  }, [currentTrack]);

  useEffect(() => {
    window.bgAudioCurrentIndex = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    window.bgAudioIsPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    window.bgAudioVolume = volume;
  }, [volume]);

  // Initial setup of persistent background audio engine
  useEffect(() => {
    if (!window.bgAudioEngine) {
      window.bgAudioEngine = new Audio();
      window.bgAudioEngine.volume = volume;
    }

    const engine = window.bgAudioEngine;

    // Listeners for continuous updates
    const onTimeUpdate = () => {
      setCurrentTime(engine.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(engine.duration);
    };

    const onEnded = () => {
      handleNextTrackAuto();
    };

    engine.addEventListener('timeupdate', onTimeUpdate);
    engine.addEventListener('loadedmetadata', onLoadedMetadata);
    engine.addEventListener('ended', onEnded);

    // Initial state matching
    setCurrentTime(engine.currentTime);
    if (!isNaN(engine.duration)) {
      setDuration(engine.duration);
    }
    // Match mute/volume slider
    engine.volume = isMuted ? 0 : volume;

    return () => {
      engine.removeEventListener('timeupdate', onTimeUpdate);
      engine.removeEventListener('loadedmetadata', onLoadedMetadata);
      engine.removeEventListener('ended', onEnded);
    };
  }, [isMuted]);

  // Reactive audio spectrum visualizer emulation
  useEffect(() => {
    let animId: number;
    const generateBars = () => {
      if (isPlaying) {
        setPulseBars(prev => prev.map(() => Math.floor(Math.random() * 45) + 8));
      } else {
        // Drop down slowly
        setPulseBars(prev => prev.map(h => Math.max(8, h - 3)));
      }
      animId = requestAnimationFrame(generateBars);
    };
    animId = requestAnimationFrame(generateBars);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Helper formats duration (seconds) into mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracksList: TrackItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/')) {
        alert("Please upload a valid audio file!");
        continue;
      }
      const fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      const fileUrl = URL.createObjectURL(file);
      
      newTracksList.push({
        id: 'track_' + Date.now() + '_' + i,
        name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        size: fileSize,
        url: fileUrl,
        addedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    }

    setTracks(prev => {
      const combined = [...prev, ...newTracksList];
      // Auto select first track if nothing is loaded or configured
      if (combined.length > 0 && currentIndex === -1) {
        setCurrentIndex(0);
        setCurrentTrack(combined[0]);
      }
      return combined;
    });

    triggerNotification("🎵 Background Audio Synced", `Loaded ${newTracksList.length} local sound tracks into continuous background slot.`);
  };

  const handlePlayPause = () => {
    if (!window.bgAudioEngine) return;
    if (tracks.length === 0) {
      alert("Please upload local audio files (MP3/WAV) to boot!");
      return;
    }

    // Default to index 0 if not setup
    let targetIndex = currentIndex;
    let targetTrack = currentTrack;
    if (currentIndex === -1 && tracks.length > 0) {
      targetIndex = 0;
      targetTrack = tracks[0];
      setCurrentIndex(0);
      setCurrentTrack(tracks[0]);
    }

    if (isPlaying) {
      window.bgAudioEngine.pause();
      setIsPlaying(false);
    } else {
      if (targetTrack && window.bgAudioEngine.src !== targetTrack.url) {
        window.bgAudioEngine.src = targetTrack.url;
      }
      window.bgAudioEngine.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Audio trigger failed or blocked:", err);
          // Auto retry loading src
          if (targetTrack) {
            window.bgAudioEngine!.src = targetTrack.url;
            window.bgAudioEngine!.play().then(() => setIsPlaying(true));
          }
        });
    }
  };

  const playSpecificTrack = (track: TrackItem, index: number) => {
    if (!window.bgAudioEngine) return;
    setCurrentIndex(index);
    setCurrentTrack(track);

    window.bgAudioEngine.src = track.url;
    window.bgAudioEngine.volume = volume;
    window.bgAudioEngine.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // Retry
        window.bgAudioEngine!.load();
        window.bgAudioEngine!.play().then(() => setIsPlaying(true));
      });
  };

  const handleNextTrackAuto = () => {
    if (isRepeat && window.bgAudioEngine) {
      window.bgAudioEngine.currentTime = 0;
      window.bgAudioEngine.play().then(() => setIsPlaying(true));
      return;
    }
    handleNext();
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else if (nextIdx >= tracks.length) {
      nextIdx = 0; // loop back
    }
    playSpecificTrack(tracks[nextIdx], nextIdx);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (isShuffle) {
      prevIdx = Math.floor(Math.random() * tracks.length);
    } else if (prevIdx < 0) {
      prevIdx = tracks.length - 1; // loop back to end
    }
    playSpecificTrack(tracks[prevIdx], prevIdx);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (window.bgAudioEngine) {
      window.bgAudioEngine.volume = val;
    }
    if (val > 0) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (window.bgAudioEngine) {
      window.bgAudioEngine.volume = nextMute ? 0 : volume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekVal = Number(e.target.value);
    setCurrentTime(seekVal);
    if (window.bgAudioEngine) {
      window.bgAudioEngine.currentTime = seekVal;
    }
  };

  const removeTrack = (trackId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTracks(prev => {
      const updated = prev.filter(t => t.id !== trackId);
      // If we deleted the active track, adjust indices
      if (idx === currentIndex) {
        if (updated.length > 0) {
          const newIdx = 0;
          setCurrentIndex(newIdx);
          setCurrentTrack(updated[0]);
          if (isPlaying && window.bgAudioEngine) {
            window.bgAudioEngine.src = updated[0].url;
            window.bgAudioEngine.play().catch(() => {});
          }
        } else {
          setCurrentIndex(-1);
          setCurrentTrack(null);
          setIsPlaying(false);
          if (window.bgAudioEngine) {
            window.bgAudioEngine.pause();
            window.bgAudioEngine.src = '';
          }
        }
      } else if (idx < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      }
      return updated;
    });
  };

  return (
    <div id="ambient-music-hub" className="space-y-6">
      
      {/* BANNER ASSISTANT */}
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full tracking-wider font-semibold">
              Zen Acoustic Protocol / Background Music Player
            </span>
            <h3 className="font-display font-semibold text-xl text-zinc-100 flex items-center gap-2">
              <Disc className="w-5 h-5 text-gold-400 animate-spin-slow" />
              Continuous Background Player / Relaxation Center
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Upload any audio track (MP3, WAV, etc.) from your device. It runs continuously in the background so your music never interrupts, even when you switch tabs or perform other tasks.
            </p>
          </div>
          
          <button
            onClick={() => audioFileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all self-stretch md:self-auto text-center justify-center font-sans"
          >
            <Upload className="w-4 h-4 text-zinc-950" /> Upload Music / Add Audio
          </button>
          
          <input
            ref={audioFileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleAudioUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE VINYL / CONTROLS (5 cols) */}
        <div className="lg:col-span-5 bg-[#121214] border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden">
          
          {/* Aesthetic pulsing background rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-zinc-900/40 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-zinc-900/30 pointer-events-none" />

          {/* ACTIVE DISK */}
          <div className="text-center space-y-4 py-4 relative z-10">
            <div className={`w-40 h-40 rounded-full bg-zinc-950 border-4 border-zinc-850 mx-auto flex items-center justify-center shadow-2xl relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-gold-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-gold-400" />
              </div>
              <div className="absolute inset-0 rounded-full border border-zinc-800/10" />
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="font-display font-black text-sm text-zinc-200 truncate leading-none">
                {currentTrack ? currentTrack.name : 'No Music Playing'}
              </h4>
              <p className="text-[10px] text-zinc-600 font-mono">
                {currentTrack ? `Ready offline · ${currentTrack.size}` : 'Upload and play audio'}
              </p>
            </div>
          </div>

          {/* PULSING AUDIO SPECTRUM VISUALIZER */}
          <div className="h-16 flex items-end justify-center gap-1 bg-zinc-950/60 p-3 rounded-xl border border-zinc-900 overflow-hidden">
            {pulseBars.map((height, idx) => (
              <div
                key={idx}
                className="w-1 bg-gold-400 rounded-t transition-all duration-75"
                style={{ 
                  height: `${height}%`,
                  opacity: isPlaying ? 0.9 : 0.25,
                  background: `linear-gradient(to top, rgba(212,163,89,1), rgba(245,158,11,0.5))`
                }}
              />
            ))}
          </div>

          {/* SEEK SLIDER */}
          <div className="space-y-1 relative z-10 font-mono">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-550">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* MAIN PLAYER ACTION BUTTONS */}
          <div className="flex items-center justify-between gap-4 py-2 relative z-10">
            {/* Repeat button */}
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${isRepeat ? 'bg-amber-400/10 border-amber-400/20 text-gold-400' : 'bg-transparent border-zinc-900 text-zinc-650 hover:text-zinc-450'}`}
              title="Repeat Mode"
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Back button */}
            <button
              onClick={handlePrev}
              className="p-2.5 bg-zinc-950 border border-zinc-900 text-zinc-350 hover:text-zinc-100 hover:border-zinc-800 rounded-xl cursor-pointer transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-zinc-350 hover:fill-zinc-100" />
            </button>

            {/* Play/Pause center toggle button */}
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 bg-gold-500 hover:bg-gold-400 text-zinc-950 flex items-center justify-center rounded-2xl shadow-xl hover:shadow-gold-500/10 cursor-pointer active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-zinc-950 fill-zinc-950" />
              ) : (
                <Play className="w-6 h-6 text-zinc-950 fill-zinc-950 translation-x-0.5" />
              )}
            </button>

            {/* Skip next button */}
            <button
              onClick={handleNext}
              className="p-2.5 bg-zinc-950 border border-zinc-900 text-zinc-350 hover:text-zinc-100 hover:border-zinc-800 rounded-xl cursor-pointer transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-zinc-350 hover:fill-zinc-100" />
            </button>

            {/* Shuffle button */}
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${isShuffle ? 'bg-amber-400/10 border-amber-400/20 text-gold-400' : 'bg-transparent border-zinc-900 text-zinc-650 hover:text-zinc-450'}`}
              title="Shuffle Mode"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>

          {/* VOLUME SLIDER CONTROL BAR */}
          <div className="flex items-center gap-3 bg-zinc-950/80 p-3 rounded-xl border border-zinc-900/60 relative z-10">
            <button
              onClick={handleMuteToggle}
              className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-gold-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
            <span className="text-[9px] text-zinc-550 font-mono w-6">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* PLAYBACK MODE SWITCHER (NORMAL VS REMIX) */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-900/60 space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Playback Engine Mode</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${bgPlaybackMode === 'remix' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                {bgPlaybackMode === 'remix' ? '🎛️ REMIX' : '🎵 NORMAL'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => togglePlaybackMode('normal')}
                className={`py-2 px-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                  bgPlaybackMode === 'normal'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
                    : 'bg-zinc-900/60 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                }`}
              >
                <div className="text-[11px] font-semibold">🎵 Normal Mode</div>
                <span className="text-[8px] text-zinc-500 block leading-tight mt-0.5">Full track playback</span>
              </button>

              <button
                type="button"
                onClick={() => togglePlaybackMode('remix')}
                className={`py-2 px-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                  bgPlaybackMode === 'remix'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold shadow-sm shadow-amber-950/20'
                    : 'bg-zinc-900/60 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                }`}
              >
                <div className="text-[11px] font-semibold">🎛️ Remix Mode</div>
                <span className="text-[8px] text-zinc-500 block leading-tight mt-0.5">1m 30s • Beat match mix</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PLAYLISTS / TRACK SHELF (7 cols) */}
        <div className="lg:col-span-7 bg-[#121214] border border-zinc-900 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h4 className="font-display font-semibold text-xs uppercase text-zinc-300 tracking-wider flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-gold-400" />
              Offline Sound Tracklist / Audio Files
            </h4>
            <span className="text-[10px] font-mono text-zinc-550 font-semibold uppercase">
              {tracks.length} Files Loaded
            </span>
          </div>

          {tracks.length === 0 ? (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-zinc-900 rounded-xl gap-3">
              <Music className="w-10 h-10 text-zinc-800 animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-350">No Audio Track Found</p>
                <p className="text-[10px] text-zinc-550 max-w-sm mx-auto leading-relaxed">
                  Click the "Upload Music" button above to select MP3 or WAV audio tracks from your phone. They will load and be ready to play immediately.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1 custom-scrollbar">
              {tracks.map((track, index) => {
                const isActive = index === currentIndex;
                return (
                  <div
                    key={track.id}
                    onClick={() => playSpecificTrack(track, index)}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group ${
                      isActive 
                        ? 'bg-zinc-900/80 border-gold-500/30 text-gold-400' 
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-350 hover:bg-zinc-950 hover:border-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isActive ? 'bg-gold-500 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-550 group-hover:text-zinc-300'
                      }`}>
                        {isActive && isPlaying ? (
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-0.5 bg-zinc-950 animate-pulse h-full" />
                            <span className="w-0.5 bg-zinc-950 animate-pulse h-2" />
                            <span className="w-0.5 bg-zinc-950 animate-pulse h-3" />
                          </div>
                      ) : (
                        <span className="text-[10px] font-mono">{index + 1}</span>
                      )}
                      </div>
                      
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate leading-snug ${isActive ? 'text-gold-400 font-bold' : 'text-zinc-200 group-hover:text-gold-400'}`}>
                          {track.name}
                        </p>
                        <span className="block text-[8px] text-zinc-600 font-mono">
                          Size: {track.size} · Saved offline
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-zinc-650 font-mono shrink-0">
                        {track.addedAt}
                      </span>
                      <button
                        onClick={(e) => removeTrack(track.id, index, e)}
                        className="p-1.5 bg-zinc-900/60 hover:bg-red-950 hover:text-red-400 border border-zinc-850 hover:border-red-900/30 text-zinc-550 rounded-lg transition-colors cursor-pointer"
                        title="Delete track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
