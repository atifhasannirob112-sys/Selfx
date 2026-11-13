import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  X, 
  Crown, 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Image as ImageIcon, 
  Smile, 
  Upload, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  Camera,
  Check,
  Trash2,
  Sliders,
  RefreshCw
} from 'lucide-react';

// Pure High-Resolution Visuals
import realityRejectionRain from '../assets/images/reality_rejection_rain_1794410694375.jpg';
import realityMirrorTears from '../assets/images/reality_mirror_tears_1794410712281.jpg';
import realityAloneStreet from '../assets/images/reality_alone_street_1794410733267.jpg';
import realityGymWorkout from '../assets/images/reality_gym_workout_1794410752538.jpg';
import realityCreatorMic from '../assets/images/reality_creator_mic_1794410770362.jpg';
import realityPeaceMosque from '../assets/images/reality_peace_mosque_1794410795241.jpg';

export interface RealitySubImage {
  imageUrl: string;
  caption: string;
  subText?: string;
}

export interface RealityScene {
  id: string;
  title: string;
  subImages: RealitySubImage[];
}

interface RealityHubProps {
  onBack: () => void;
  initialAuthorName?: string;
}

// Simple native IndexedDB for user's custom uploaded audio files for both modes
const AUDIO_DB_NAME = 'selfx_reality_audio_db_v3';
const AUDIO_STORE_NAME = 'uploaded_songs_dual_v3';

function initRealityAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUDIO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        db.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveModeAudio(mode: 'emotional' | 'motivated', name: string, dataUrl: string): Promise<void> {
  return initRealityAudioDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE_NAME);
      const req = store.put({ id: mode, name, dataUrl, date: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

function getModeAudio(mode: 'emotional' | 'motivated'): Promise<{ id: string; name: string; dataUrl: string } | null> {
  return initRealityAudioDB().then((db) => {
    return new Promise<{ id: string; name: string; dataUrl: string } | null>((resolve) => {
      const tx = db.transaction(AUDIO_STORE_NAME, 'readonly');
      const store = tx.objectStore(AUDIO_STORE_NAME);
      const req = store.get(mode);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }).catch(() => null);
}

// =========================================================================
// PRESET SCENES: খাঁটি আঞ্চলিক ঠেস ছন্দ কবিতা (REGIONAL THESH CHHANDO KOBITA)
// =========================================================================

// 1. Emotional (হৃদয়ভাঙা আঞ্চলিক ঠেস, অবহেলার মোক্ষম জবাব ও ছ্যাঁকার ছন্দ কবিতা)
const DEFAULT_EMOTIONAL_SCENES: RealityScene[] = [
  {
    id: 'emo-thesh-1',
    title: 'রূপের বড়াই ও ছ্যাঁকার মোক্ষম জবাব',
    subImages: [
      {
        imageUrl: realityRejectionRain,
        caption: 'মুখ ঘুরাইয়া গেলি চইলা, ভাবলি খাইছি ধরা? / বাঘের বাচ্চার সামনে তোদের দেমাগ ঝইড়া পরা!',
        subText: 'তোর রূপের দেমাগ বাজারে সস্তা, একদিন এই আমার ছায়ার পেছনেই ঘুরবি পাগলী!'
      },
      {
        imageUrl: realityMirrorTears,
        caption: 'যারে মন উজাড় কইরা বাসলাম ভালো বেইমান তারে কয় / ছ্যাঁকা দিয়া ভাবিস না তুই জিতে গেছিস জয়!',
        subText: 'আয়নার সামনে দাঁড়াইয়া চোখ মুছতে মুছতে কইছি—অবহেলার আগুন দিয়াই সাম্রাজ্য গড়মু।'
      },
      {
        imageUrl: realityAloneStreet,
        caption: 'রাইতের আঁধারে কান্দে চোখ, বুকে জ্বলে চিতা / বেইমান দুনিয়ায় কারে কমু আপন মনের ব্যথা?',
        subText: 'রাইতের নিস্তব্ধ রাস্তায় একা হাঁটি, কিন্তু মাথার মগজে বারুদ জমাট বাঁধছে।'
      },
      {
        imageUrl: realityRejectionRain,
        caption: 'আজকে আমার কান্নার দিন, কালকে দেখবি তেজ / হেরে যাওয়া পুতুল ভাবিস? শেষ দেখবি এবার শেষ!',
        subText: 'ক্ষমা শব্দটা আমার ডিকশনারিতে নাই, হিসাব তোরে পাই পাই কইরা চুকামু।'
      }
    ]
  },
  {
    id: 'emo-thesh-2',
    title: 'মানুষের তাচ্ছিল্য ও চায়ের দোকানের খোঁচা',
    subImages: [
      {
        imageUrl: realityAloneStreet,
        caption: 'পকেটে ছিল না টেকা, গায়ে মলিন জামা / দূর থাইকা ঠেস মারতি, ভাবতি নিজেরে ড্রামা!',
        subText: 'চায়ের দোকানে বসে চেহারা আর জামা নিয়া হাসাহাসি করতি, মনে রাখিস হিসাব তোলা আছে।'
      },
      {
        imageUrl: realityMirrorTears,
        caption: 'হাসিস তোরা যত খুশি, হাসির দিন তো শেষ / ছাইয়ের ভেতর থাইকা উইঠা কাঁপামু এবার দেশ!',
        subText: 'তোদের প্রতিটি হাসির শব্দ আমার রাতের ঘুম কাড়ায়া লোহা আর টেবিলে বসাইছে।'
      },
      {
        imageUrl: realityRejectionRain,
        caption: 'ভিড়ের মাঝে একা ছিলাম, দিলি না কেউ পাত্তা / আমার এই রূপান্তর দেইখা শুকায় যাইবো আত্মা!',
        subText: 'কাউরে পাশে পাই নাই যখন ভাঙছিলাম, এখন জোড়া লাইগা যখন সিংহ হইছি তখন তোরা কে রে?'
      },
      {
        imageUrl: realityAloneStreet,
        caption: 'অবহেলার বিষ খাইয়া আজ হইয়া গেছি খাঁটি / তোদের অহংকার ভাইঙা মিশাইয়া দিমু মাটি!',
        subText: 'যেদিন ডাকলেও আর হাত পাবি না, সেদিন বুঝবি কিসের অহংকার করছিলি।'
      }
    ]
  },
  {
    id: 'emo-thesh-3',
    title: 'স্বার্থপর ভালোবাসার শেষ চিঠি',
    subImages: [
      {
        imageUrl: realityMirrorTears,
        caption: 'গাড়ির হর্ন আর চকচকে সাজে ভুললি আমার মন / তোদের মতো জাতের কাছে টাকাই বড় ধন!',
        subText: 'ভালোবাসার নামে ধান্ধাবাজি করলি, একদিন তোরে এই চকচকে দুনিয়াই ছুঁইড়া ফেলবে।'
      },
      {
        imageUrl: realityAloneStreet,
        caption: 'বুকের ভেতর পাথর বাইন্ধা হাসতে শিখছি ভাই / বেইমান মানুষের চোখের পানির কোনো মূল্য নাই!',
        subText: 'চোখের পানি মাটিতে ফেলুম না আর, প্রতিটি ফোঁটায় তৈরি হইছে প্রতিশোধের জেদ।'
      },
      {
        imageUrl: realityRejectionRain,
        caption: 'দিন বদলাইবো রে সুন্দরীর, বছর ঘুরলেই খেলা / ডাকলেও আর ফিরবো না এই অবহেলার বেলা!',
        subText: 'তখন দূর থাইকা হাত কচলাবি আর আফসোস করবি কারে অবহেলা করছিলি।'
      },
      {
        imageUrl: realityMirrorTears,
        caption: 'ছাইড়া গেছিস একা কইরা, ভাবছিস গেছি মরি? / নিজের তালেই নাচমু এবার, রাজার বেশেই তরী!',
        subText: 'আমার অস্তিত্ব ভাঙার সাধ্য তোর নাই, এবার শুধু তামাশা দেখার পালা।'
      }
    ]
  }
];

// 2. Motivated (সিংহভাগ জাগরণ, লোহা, জেদ, কামব্যাক, আঞ্চলিক ঠেস ও বিজয়ের ছন্দ)
const DEFAULT_MOTIVATED_SCENES: RealityScene[] = [
  {
    id: 'mot-thesh-1',
    title: 'ঘাম, লোহা ও শরীরের গর্জন',
    subImages: [
      {
        imageUrl: realityGymWorkout,
        caption: 'লোহা টাইনা ঘাম ঝরাই, চোখের পানি না / আমার বিজয়ের সামনে টিকবে না কোনো বাহানা!',
        subText: 'জিমে প্রতিটি ফোঁটা ঘামে ঝইড়া পড়ছে ফেলে আসা বেইমানি আর অপমানের দাগ।'
      },
      {
        imageUrl: realityGymWorkout,
        caption: 'দুর্বল ভাইবা হাসছিলি না? তাকায়া দেখ এবার / বুক চিতাইয়া দাঁড়াইছি, ডর নাই কারো বাবার!',
        subText: 'যেই শরীরে দাগ দিছিলি, সেই শরীর এখন পাথরের মতো শক্ত আর অটল।'
      },
      {
        imageUrl: realityCreatorMic,
        caption: 'কাটছাঁট চোয়াল, চোখে বারুদ, চলন-বলন রাজকীয় / হারিয়ে গেছি ভাইবা যারা হাসছিলি, চোখ তুইলা দেখিও!',
        subText: 'নিজের দাম নিজেই বাড়াইছি, কারো দয়া বা করুণার দান নিয়া জন্মাই নাই।'
      },
      {
        imageUrl: realityGymWorkout,
        caption: 'ঘুম ভাঙছে বাঘের এবার, জঙ্গল কাঁপবো ডরে / তোদের কথার জবাবটা দিমু নিজের কাজের জোরে!',
        subText: 'কথার কথা না, কাজে প্রমাণ করমু সিংহ কাকে বলে।'
      }
    ]
  },
  {
    id: 'mot-thesh-2',
    title: 'মাইক হাতে শহরের বুকে আগুন',
    subImages: [
      {
        imageUrl: realityCreatorMic,
        caption: 'মাইক হাতে যখন দাঁড়াই, কথা কয় আগুন / অবহেলা যারা করতি, তাদের বুকে এখন ফাগুন!',
        subText: 'ইউটিউব আর সোশ্যাল মিডিয়ায় আমার নাম বাজবে, চোখ নামায়া চলবি তোরা।'
      },
      {
        imageUrl: realityGymWorkout,
        caption: 'যেদিন আমি নামুম মাঠে চইড়া নিজের গাড়ি / তোদের জাতের অহংকার হইয়া যাইবো আড়ি!',
        subText: 'চায়ের দোকানে বসে গল্প বানাস, আমার গল্প লেখা হইতাছে ইতিহাসে।'
      },
      {
        imageUrl: realityCreatorMic,
        caption: 'রাতের আঁধারে খাটছি ভাই, তোরা যখন ঘুমে / সফলতার গন্ধ এখন ছড়াইয়া গেছে রুমে!',
        subText: 'সহজে পাই নাই রে ভাই, কলিজার রক্ত পুড়ায়া এই জায়গায় আসছি।'
      },
      {
        imageUrl: realityPeaceMosque,
        caption: 'তোদের দেয়া প্রতিটি ঠেস আমারে দিছে জোর / অন্ধকার ফাটাইয়া এই দেখ আনছি নতুন ভোর!',
        subText: 'ধন্যবাদ তোদের অবহেলা আর তাচ্ছিল্যরে, তোরাই বানাইছিস আমারে আজকের এই বিজয়ী!'
      }
    ]
  },
  {
    id: 'mot-thesh-3',
    title: 'সেজদায় মাথা ও খোদার রহমতের মুকুট',
    subImages: [
      {
        imageUrl: realityPeaceMosque,
        caption: 'সাদা পাঞ্জাবি পইড়া মসজিদে নামাইলাম নিজের মাথা / মাটির মানুষের আবার কিসের এত দেমাগী কথা?',
        subText: 'মানুষের তাচ্ছিল্য আজ পায়ের ধুলা, আসল শক্তি তো খোদার সেজদায়।'
      },
      {
        imageUrl: realityPeaceMosque,
        caption: 'যার সহায় আছেন আল্লাহ, তারে কে আটকাইতে পারে? / দুনিয়ার সব দেমাগ শেষ ঐ এক মালিকের দ্বারে!',
        subText: 'আল্লাহ ছাড়া কারো কাছে মাথা নত করি নাই, তাই তো আজকে মাথা উঁচা কইরা দাঁড়াইছি।'
      },
      {
        imageUrl: realityCreatorMic,
        caption: 'বেইমানীর বদলা নিতে যাই নাই খারাপ পথে / খোদার রহমতেই তো বিজয়ী এই রথে!',
        subText: 'অহংকার মাটিতে মিশাইছি, যোগ্যতা নিয়া আসছি—এবার সামনে তাকানোর পালা।'
      },
      {
        imageUrl: realityPeaceMosque,
        caption: 'জয় আমার হইবোই ভাই, লিখে রাখিস খাতায় / রাজার মুকুট শোভা পায় শুধু যোদ্ধারই মাথায়!',
        subText: 'খেলা তো কেবল শুরু হইলো, তোদের চোখের সামনেই তৈরি হইবো আমার রাজত্ব!'
      }
    ]
  }
];

export const RealityHub: React.FC<RealityHubProps> = ({ onBack, initialAuthorName = "Atif Nirob" }) => {
  // Navigation states: 'main' | 'add_story' | 'generating' | 'experience'
  const [currentView, setCurrentView] = useState<'main' | 'add_story' | 'generating' | 'experience'>('main');

  // Modal asking: "আপনি ইমোশনাল দেখবেন নাকি মোটিভেশন?"
  const [showMoodSelectionModal, setShowMoodSelectionModal] = useState<boolean>(false);

  // Author & Story Input State
  const [authorName] = useState<string>(initialAuthorName);
  
  // Specific single incident state for "Add Your Story"
  const [incidentCategory, setIncidentCategory] = useState<'emotional' | 'motivated'>('emotional');
  const [incidentText, setIncidentText] = useState<string>('মুখ ঘুরাইয়া গেলি চইলা, ভাবলি খাইছি ধরা? একদিন এই আমার ছায়ার পেছনেই তোদের ঘুরতে হইবো!');

  // User's Own Uploaded Photos State (Replaces Face Reference completely)
  const [userUploadedPhotos, setUserUploadedPhotos] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('selfx_reality_user_photos_v3');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Photo usage preference: 'direct_slide' (use photo directly) | 'ai_likeness' (use as character photo)
  const [photoUsageMode, setPhotoUsageMode] = useState<'direct_slide' | 'ai_likeness'>('direct_slide');

  // Gemini AI generation state & progress
  const [generatingProgress, setGeneratingProgress] = useState<number>(0);
  const [generatingStepText, setGeneratingStepText] = useState<string>('');
  const [generationCompleted, setGenerationCompleted] = useState<boolean>(false);
  const [newlyCreatedScene, setNewlyCreatedScene] = useState<RealityScene | null>(null);

  // Experience state: mood ('emotional' | 'motivated')
  const [currentMood, setCurrentMood] = useState<'emotional' | 'motivated'>('emotional');
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [subImageIndex, setSubImageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Scenes list with v3 chhando storage keys so new regional thesh chhando poetry displays immediately
  const [emotionalScenes, setEmotionalScenes] = useState<RealityScene[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_reality_scenes_emo_v3_chhando');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_EMOTIONAL_SCENES;
  });

  const [motivatedScenes, setMotivatedScenes] = useState<RealityScene[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_reality_scenes_mot_v3_chhando');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MOTIVATED_SCENES;
  });

  // Audio settings: Main line start offset in seconds (CRITICAL: audio starts from the main line, not 0:00)
  const [mainLineOffsetSeconds, setMainLineOffsetSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('selfx_reality_mainline_offset_v3');
      if (saved) return Number(saved) || 22;
    } catch {}
    return 22; // Default: 22 seconds (where the main vocal hook / chorus / beat drops)
  });

  // Dual audio tracks for Emotional and Motivated modes
  const [showMusicDrawer, setShowMusicDrawer] = useState<boolean>(false);
  const [musicDrawerTab, setMusicDrawerTab] = useState<'emotional' | 'motivated'>('emotional');
  
  const [emotionalAudioUrl, setEmotionalAudioUrl] = useState<string | null>(null);
  const [emotionalSongName, setEmotionalSongName] = useState<string>('Tum Hi Ho (Emotional Ambient)');

  const [motivatedAudioUrl, setMotivatedAudioUrl] = useState<string | null>(null);
  const [motivatedSongName, setMotivatedSongName] = useState<string>('Heeriye (Motivated Ambient)');

  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.85);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Context Ref & HTML5 Audio Element Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const userPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const slidePhotoReplaceInputRef = useRef<HTMLInputElement | null>(null);
  const musicFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load custom audios from IndexedDB on startup
  useEffect(() => {
    getModeAudio('emotional').then((item) => {
      if (item && item.dataUrl) {
        setEmotionalAudioUrl(item.dataUrl);
        setEmotionalSongName(item.name);
      }
    });
    getModeAudio('motivated').then((item) => {
      if (item && item.dataUrl) {
        setMotivatedAudioUrl(item.dataUrl);
        setMotivatedSongName(item.name);
      }
    });
  }, []);

  // Save main line offset in localStorage when updated
  const updateMainLineOffset = (seconds: number) => {
    setMainLineOffsetSeconds(seconds);
    try {
      localStorage.setItem('selfx_reality_mainline_offset_v3', String(seconds));
    } catch {}
    if (customAudioRef.current && currentView === 'experience') {
      try {
        customAudioRef.current.currentTime = seconds;
      } catch {}
    }
  };

  // Play audio starting directly from MAIN LINE
  const playAudioFromMainLine = () => {
    if (customAudioRef.current) {
      try {
        customAudioRef.current.currentTime = mainLineOffsetSeconds;
        customAudioRef.current.volume = isMuted ? 0 : musicVolume;
        customAudioRef.current.play().catch(() => {});
      } catch (err) {
        console.warn('Audio play error:', err);
      }
    }
  };

  // Web Audio ambient synthesizer: Starts directly with high-impact chord progression
  const startSynthMusic = (type: string) => {
    try {
      if (currentView !== 'experience') {
        stopSynthMusic();
        return;
      }
      const activeCustomUrl = currentMood === 'emotional' ? emotionalAudioUrl : motivatedAudioUrl;
      if (activeCustomUrl && customAudioRef.current) {
        playAudioFromMainLine();
        return;
      }

      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }

      // Start directly on the main dramatic climax chord (no quiet intro)
      let chordIndex = 1;
      const chords = type === 'synth_piano'
        ? [[220.00, 261.63, 329.63], [174.61, 220.00, 261.63], [196.00, 246.94, 293.66], [261.63, 329.63, 392.00]]
        : type === 'synth_strings'
        ? [[196.00, 246.94, 293.66], [164.81, 207.65, 246.94], [220.00, 277.18, 329.63], [220.00, 261.63, 329.63]]
        : [[174.61, 220.00, 261.63], [146.83, 174.61, 220.00], [130.81, 164.81, 196.00], [196.00, 233.08, 293.66]];

      const playChord = () => {
        if (!audioCtxRef.current || isMuted || !isPlayingMusic || currentView !== 'experience') return;
        const currentChord = chords[chordIndex % chords.length];
        chordIndex++;

        currentChord.forEach((freq) => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            // Immediate punchy attack directly hitting the main chord
            gain.gain.setValueAtTime(0.06 * musicVolume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.6);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 4.8);
          } catch {}
        });
      };

      playChord();
      synthIntervalRef.current = setInterval(playChord, 4500);
    } catch {}
  };

  const stopSynthMusic = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }
  };

  // Start music playback starting immediately at MAIN LINE when opening experience player
  useEffect(() => {
    if (currentView === 'experience' && isPlayingMusic && !isMuted && !isPaused) {
      const activeCustomUrl = currentMood === 'emotional' ? emotionalAudioUrl : motivatedAudioUrl;
      if (activeCustomUrl && customAudioRef.current) {
        playAudioFromMainLine();
      } else {
        const type = currentMood === 'emotional' ? 'synth_piano' : 'synth_strings';
        startSynthMusic(type);
      }
    } else {
      stopSynthMusic();
    }
    return () => {
      stopSynthMusic();
    };
  }, [currentView, isPlayingMusic, isMuted, isPaused, currentMood, emotionalAudioUrl, motivatedAudioUrl, musicVolume, mainLineOffsetSeconds]);

  // Handle phone audio upload for specific mode
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      
      if (musicDrawerTab === 'emotional') {
        setEmotionalAudioUrl(dataUrl);
        setEmotionalSongName(cleanName);
        await saveModeAudio('emotional', cleanName, dataUrl);
        showToast(`💔 ইমোশনাল অডিও "${cleanName}" সেট হয়েছে (মেইন লাইন থেকে বাজবে)!`);
      } else {
        setMotivatedAudioUrl(dataUrl);
        setMotivatedSongName(cleanName);
        await saveModeAudio('motivated', cleanName, dataUrl);
        showToast(`👑 মোটিভেশনাল অডিও "${cleanName}" সেট হয়েছে (মেইন লাইন থেকে বাজবে)!`);
      }
      setIsPlayingMusic(true);
      setIsMuted(false);
    };
    reader.readAsDataURL(file);
  };

  // Active Scene & Sub-Images slideshow
  const activeScenes = currentMood === 'emotional' ? emotionalScenes : motivatedScenes;
  const currentScene = activeScenes[currentSceneIndex] || activeScenes[0];
  const totalSubImages = currentScene?.subImages?.length || 1;
  const currentSubImage = currentScene?.subImages?.[subImageIndex] || currentScene?.subImages?.[0];

  // Auto transition for slides (every 6 seconds)
  useEffect(() => {
    if (currentView !== 'experience' || isPaused) return;

    const timer = setInterval(() => {
      setSubImageIndex((prev) => {
        if (prev + 1 < totalSubImages) {
          return prev + 1;
        } else {
          setCurrentSceneIndex((sPrev) => (sPrev + 1) % activeScenes.length);
          return 0;
        }
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [currentView, isPaused, totalSubImages, activeScenes.length, currentSceneIndex]);

  // USER PHOTO UPLOADER (No reference required, user uploads their own photo directly)
  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setUserUploadedPhotos((prev) => {
          const next = [url, ...prev].slice(0, 8);
          try {
            localStorage.setItem('selfx_reality_user_photos_v3', JSON.stringify(next));
          } catch {}
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
    showToast('📸 আপনার ছবি সফলভাবে আপলোড হয়েছে!');
  };

  const removeUserPhoto = (idx: number) => {
    setUserUploadedPhotos((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      try {
        localStorage.setItem('selfx_reality_user_photos_v3', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('ছবি মুছে ফেলা হয়েছে');
  };

  // Replace current slide image directly with user's photo right in Experience Player
  const handleReplaceCurrentSlidePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newUrl = reader.result as string;
      
      const updateScenes = (prevScenes: RealityScene[]) => {
        return prevScenes.map((scene, sIdx) => {
          if (sIdx !== currentSceneIndex) return scene;
          const updatedSubImages = scene.subImages.map((sub, imgIdx) => {
            if (imgIdx !== subImageIndex) return sub;
            return { ...sub, imageUrl: newUrl };
          });
          return { ...scene, subImages: updatedSubImages };
        });
      };

      if (currentMood === 'emotional') {
        setEmotionalScenes((prev) => {
          const updated = updateScenes(prev);
          try {
            localStorage.setItem('selfx_reality_scenes_emo_v3_chhando', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      } else {
        setMotivatedScenes((prev) => {
          const updated = updateScenes(prev);
          try {
            localStorage.setItem('selfx_reality_scenes_mot_v3_chhando', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      // Also add to user photos
      setUserUploadedPhotos((prev) => [newUrl, ...prev.filter(p => p !== newUrl)].slice(0, 8));
      showToast('✨ এই স্লাইডে আপনার ছবি সফলভাবে সেট হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  // START GENERATION: Uses user's own uploaded photo and generates pure regional thesh chhando poetry
  const handleStartIncidentGeneration = () => {
    const text = incidentText.trim();
    if (!text) {
      showToast('⚠️ অনুগ্রহ করে আপনার নির্দিষ্ট ঘটনাটি লিখুন!');
      return;
    }

    setCurrentView('generating');
    setGeneratingProgress(15);
    setGeneratingStepText('১. ঘটনার প্রেক্ষাপট বিশ্লেষণ ও আবেগ বাছাই হচ্ছে...');
    setGenerationCompleted(false);

    // Multi-stage processor
    setTimeout(() => {
      setGeneratingProgress(50);
      setGeneratingStepText(
        userUploadedPhotos.length > 0 
          ? '২. আপনার আপলোড করা আসল ছবি দিয়ে ভিজ্যুয়াল স্লাইড সাজানো হচ্ছে...' 
          : '২. ঘটনার সাথে মিল রেখে বাস্তব ভিজ্যুয়াল ফ্রেম তৈরি হচ্ছে...'
      );
    }, 800);

    setTimeout(() => {
      setGeneratingProgress(80);
      setGeneratingStepText('৩. খাঁটি আঞ্চলিক ঠেস ছন্দ কবিতা ও গানের তালের সুর সাজানো হচ্ছে...');
    }, 1600);

    setTimeout(() => {
      const isEmo = incidentCategory === 'emotional';
      const userPhotoPrimary = userUploadedPhotos.length > 0 ? userUploadedPhotos[0] : null;
      const userPhotoSecondary = userUploadedPhotos.length > 1 ? userUploadedPhotos[1] : userPhotoPrimary;

      let rhymes: { caption: string; subText: string; img: string }[] = [];

      if (isEmo) {
        rhymes = [
          {
            img: userPhotoPrimary || realityRejectionRain,
            caption: 'মুখ ঘুরাইয়া গেলি চইলা, ভাবলি খাইছি ধরা? / বাঘের বাচ্চার সামনে তোদের দেমাগ ঝইড়া পরা!',
            subText: text.length > 15 ? text.slice(0, 90) : 'তোর রূপের দেমাগ বাজারে সস্তা, একদিন এই আমার ছায়ার পেছনেই ঘুরবি পাগলী!'
          },
          {
            img: userPhotoSecondary || realityMirrorTears,
            caption: 'যারে মন উজাড় কইরা বাসলাম ভালো বেইমান তারে কয় / ছ্যাঁকা দিয়া ভাবিস না তুই জিতে গেছিস জয়!',
            subText: 'আয়নার সামনে দাঁড়াইয়া চোখ মুছতে মুছতে কইছি—অবহেলার আগুন দিয়াই সাম্রাজ্য গড়মু।'
          },
          {
            img: userPhotoPrimary || realityAloneStreet,
            caption: 'পকেটে ছিল না টেকা, গায়ে মলিন জামা / দূর থাইকা ঠেস মারতি, ভাবতি নিজেরে ড্রামা!',
            subText: 'চায়ের দোকানে বসে যে চেহারা নিয়া হাসাহাসি করতি, মনে রাখিস হিসাব তোলা আছে।'
          },
          {
            img: userPhotoSecondary || realityRejectionRain,
            caption: 'আজকে আমার কান্নার দিন, কালকে দেখবি তেজ / হেরে যাওয়া পুতুল ভাবিস? শেষ দেখবি এবার শেষ!',
            subText: 'ক্ষমা শব্দটা আমার ডিকশনারিতে নাই, জবাবটা যোগ্যতায় দিমু।'
          }
        ];
      } else {
        rhymes = [
          {
            img: userPhotoPrimary || realityGymWorkout,
            caption: 'লোহা টাইনা ঘাম ঝরাই, চোখের পানি না / আমার বিজয়ের সামনে টিকবে না কোনো বাহানা!',
            subText: text.length > 15 ? text.slice(0, 90) : 'জিমে প্রতিটি ফোঁটা ঘামে ঝইড়া পড়ছে অতীতের অপমান আর তাচ্ছিল্যের দাগ।'
          },
          {
            img: userPhotoSecondary || realityCreatorMic,
            caption: 'দুর্বল ভাইবা হাসছিলি না? তাকায়া দেখ এবার / বুক চিতাইয়া দাঁড়াইছি, ডর নাই কারো বাবার!',
            subText: 'যেই শরীরে দাগ দিছিলি, সেই শরীর এখন পাথরের মতো শক্ত আর অটল।'
          },
          {
            img: userPhotoPrimary || realityPeaceMosque,
            caption: 'মাইক হাতে যখন দাঁড়াই, কথা কয় আগুন / অবহেলা যারা করতি, তাদের বুকে এখন ফাগুন!',
            subText: 'ইউটিউব আর সোশ্যাল মিডিয়ায় আমার নাম বাজবে, চোখ নামায়া চলবি তোরা।'
          },
          {
            img: userPhotoSecondary || realityPeaceMosque,
            caption: 'সাদা পাঞ্জাবি পইড়া মসজিদে নামাইলাম নিজের মাথা / মাটির মানুষের আবার কিসের এত দেমাগী কথা?',
            subText: 'আল্লাহর সেজদায় সব অহংকার শেষ, মানুষের তাচ্ছিল্য আজ আমার পায়ের ধুলা।'
          }
        ];
      }

      const newScene: RealityScene = {
        id: `incident-${Date.now()}`,
        title: isEmo ? 'বেদনা ও আঞ্চলিক ঠেসের জবাব' : 'ঘুরে দাঁড়ানো ও চূড়ান্ত বিজয়',
        subImages: rhymes.map((r) => ({
          imageUrl: r.img,
          caption: r.caption,
          subText: r.subText
        }))
      };

      if (isEmo) {
        setEmotionalScenes((prev) => {
          const updated = [newScene, ...prev];
          try {
            localStorage.setItem('selfx_reality_scenes_emo_v3_chhando', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      } else {
        setMotivatedScenes((prev) => {
          const updated = [newScene, ...prev];
          try {
            localStorage.setItem('selfx_reality_scenes_mot_v3_chhando', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      setNewlyCreatedScene(newScene);
      setGeneratingProgress(100);
      setGeneratingStepText('✨ আপনার নিজের ছবি ও আঞ্চলিক ঠেস ছন্দ কবিতায় রিয়েলিটি মেমোরি কার্ড প্রস্তুত!');
      setGenerationCompleted(true);
      showToast('🎉 নতুন রিয়েলিটি অধ্যায় সফলভাবে তৈরি হয়েছে!');
    }, 2400);
  };

  // Switch between scenes manually
  const goToNextScene = () => {
    setSubImageIndex(0);
    setCurrentSceneIndex((prev) => (prev + 1) % activeScenes.length);
  };

  const goToPrevScene = () => {
    setSubImageIndex(0);
    setCurrentSceneIndex((prev) => (prev - 1 + activeScenes.length) % activeScenes.length);
  };

  const currentActiveAudioUrl = currentMood === 'emotional' ? emotionalAudioUrl : motivatedAudioUrl;

  return (
    <div className="relative w-full h-full bg-[#07050d] text-white overflow-hidden flex flex-col font-sans select-none">
      {/* Hidden Audio element for custom audio: Starts strictly from the main line hook, not 0:00! */}
      {currentActiveAudioUrl && (
        <audio 
          ref={customAudioRef}
          src={currentActiveAudioUrl}
          loop
          onLoadedMetadata={() => {
            if (customAudioRef.current && currentView === 'experience') {
              try {
                customAudioRef.current.currentTime = mainLineOffsetSeconds;
                customAudioRef.current.volume = isMuted ? 0 : musicVolume;
                if (isPlayingMusic && !isPaused) {
                  customAudioRef.current.play().catch(() => {});
                }
              } catch {}
            }
          }}
          onPlay={() => {
            if (currentView !== 'experience') {
              customAudioRef.current?.pause();
            } else {
              setIsPlayingMusic(true);
            }
          }}
          onEnded={() => {
            // Loop back to main line
            if (customAudioRef.current) {
              customAudioRef.current.currentTime = mainLineOffsetSeconds;
              customAudioRef.current.play().catch(() => {});
            }
          }}
        />
      )}

      {/* Hidden File Inputs: User photo upload & slide photo replace */}
      <input 
        type="file" 
        ref={userPhotoInputRef} 
        onChange={handleUserPhotoUpload} 
        accept="image/*" 
        multiple 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={slidePhotoReplaceInputRef} 
        onChange={handleReplaceCurrentSlidePhoto} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={musicFileInputRef} 
        onChange={handleMusicUpload} 
        accept="audio/*" 
        className="hidden" 
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[150] bg-purple-900/90 border border-purple-500/50 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          SCREEN 1: MAIN HUB SCREEN
         ========================================================================= */}
      {currentView === 'main' && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden p-5 sm:p-7">
          {/* Atmospheric Dusk Skyline Background */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <img 
              src="/assets/aistudio/file_00000000b4d4820abebf69c3ddc2c20f_fd24d2e7.png" 
              alt="Reality Atmosphere" 
              className="w-full h-full object-cover object-[15%_15%] opacity-40 scale-105 filter saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#090314]/70 via-[#07040d]/85 to-[#06030c] pointer-events-none" />
            <div className="absolute inset-0 bg-radial-at-c from-purple-900/25 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between w-full pt-2">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-zinc-900/70 hover:bg-zinc-800 border border-purple-500/30 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 shadow-md backdrop-blur-md"
                title="Back"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <h1 className="text-xl font-display font-black tracking-wider text-white">Selfx</h1>
              </div>
            </div>

            {/* Audio Pill: Shows song and indicates main line start */}
            <button 
              onClick={() => setShowMusicDrawer(true)}
              className="px-3.5 py-1.5 rounded-full bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 text-xs font-mono font-medium flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg backdrop-blur-md group"
              title="অডিও ও মেইন লাইন শুরুর সময় নির্ধারণ করুন"
            >
              <Music className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="truncate max-w-[110px] font-sans">
                {currentMood === 'emotional' ? (emotionalSongName || 'Emotional') : (motivatedSongName || 'Motivated')}
              </span>
              <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full font-mono">
                {mainLineOffsetSeconds}s
              </span>
            </button>
          </div>

          {/* Hero Section */}
          <div className="relative z-10 my-auto py-8 text-left max-w-lg">
            <h2 className="text-4xl sm:text-5xl font-serif italic font-bold tracking-tight text-white drop-shadow-[0_2px_15px_rgba(192,132,252,0.45)] leading-tight">
              Share <br /> Your Life...
            </h2>
            <p className="mt-3 text-sm sm:text-base font-sans text-purple-200/80 font-light tracking-wide">
              Because your story matters...
            </p>
          </div>

          {/* TWO SIDE-BY-SIDE GLOWING CARDS */}
          <div className="relative z-10 grid grid-cols-2 gap-3.5 sm:gap-5 pb-6">
            {/* Card 1: Add Your Story */}
            <div 
              onClick={() => setCurrentView('add_story')}
              className="relative group overflow-hidden rounded-[26px] p-4 sm:p-5 border-2 border-blue-500/70 hover:border-blue-400 bg-gradient-to-b from-[#0b1738]/90 via-[#060e24]/95 to-[#030713]/98 cursor-pointer transition-all duration-300 shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between min-h-[175px] sm:min-h-[195px]"
            >
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
              
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
                    <Camera className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 border border-blue-300 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                    +
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                  Add Your Story
                </h3>
                <p className="text-[11px] sm:text-xs text-blue-200/75 mt-1 leading-snug">
                  নিজের ছবি ও জীবনের ঘটনা শেয়ার করুন...
                </p>
              </div>

              <div className="mt-3 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-blue-600/80 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:translate-x-1">
                  <ChevronRight className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>

            {/* Card 2: Reality - Opens Mood Selection */}
            <div 
              onClick={() => setShowMoodSelectionModal(true)}
              className="relative group overflow-hidden rounded-[26px] p-4 sm:p-5 border-2 border-purple-500/70 hover:border-purple-400 bg-gradient-to-b from-[#250b3d]/90 via-[#170529]/95 to-[#0b0214]/98 cursor-pointer transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between min-h-[175px] sm:min-h-[195px]"
            >
              <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
              
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                  Reality
                </h3>
                <p className="text-[11px] sm:text-xs text-purple-200/75 mt-1 leading-snug">
                  আঞ্চলিক ঠেস ছন্দ কবিতা ও গান...
                </p>
              </div>

              <div className="mt-3 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-purple-600/80 group-hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:translate-x-1">
                  <ChevronRight className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-10 pt-2 pb-1 border-t border-purple-900/40 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold block mb-1">
              — From Selfx —
            </span>
            <p className="text-xs text-purple-200/70 font-serif italic">
              "Your story, your power... Keep going, you're enough. ♡"
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: ADD YOUR STORY (USER'S OWN PHOTO UPLOAD - NO FACE REFERENCE)
         ========================================================================= */}
      {currentView === 'add_story' && (
        <div className="relative w-full h-full flex flex-col bg-[#080511] p-5 sm:p-7 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
            <button 
              onClick={() => setCurrentView('main')}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-display font-bold text-white tracking-wide">Add Your Story</h2>
            </button>
            <button 
              onClick={handleStartIncidentGeneration}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
              title="Done"
            >
              <Check className="w-4 h-4" />
              <span>ডান (DONE)</span>
            </button>
          </div>

          {/* Incident Category Selector */}
          <div className="my-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-2">
              ঘটনার ধরন নির্বাচন করুন (INCIDENT MOOD)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIncidentCategory('emotional')}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  incidentCategory === 'emotional'
                    ? 'bg-gradient-to-r from-pink-950/80 to-purple-950/80 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]'
                    : 'bg-black/40 border-purple-900/40 text-zinc-400 hover:text-white'
                }`}
              >
                <span>💔</span>
                <span>ইমোশনাল (কষ্ট/প্রত্যাখ্যান/ঠেস)</span>
              </button>

              <button
                type="button"
                onClick={() => setIncidentCategory('motivated')}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  incidentCategory === 'motivated'
                    ? 'bg-gradient-to-r from-amber-950/80 to-purple-950/80 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                    : 'bg-black/40 border-purple-900/40 text-zinc-400 hover:text-white'
                }`}
              >
                <span>👑</span>
                <span>মোটিভেশনাল (বিজয়/জেদ/গর্ব)</span>
              </button>
            </div>
          </div>

          {/* Incident Text Area Card */}
          <div className="relative bg-[#110924]/80 border border-purple-500/30 rounded-2xl p-4 shadow-inner flex flex-col min-h-[140px] my-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300 block mb-2">
              ঘটনার সারসংক্ষেপ (WRITE YOUR INCIDENT / STORY)
            </span>
            <textarea 
              value={incidentText}
              onChange={(e) => setIncidentText(e.target.value)}
              placeholder="এখানে আপনার জীবনের নির্দিষ্ট ঘটনাটি লিখুন... যেমন: ভালোবাসার মানুষের মুখ ঘুরিয়ে নেওয়া, বন্ধুদের কটূক্তি, চায়ের দোকানে হাসাহাসি, জিমের ঘামে নিজেকে গড়ে তোলার জেদ কিংবা সফল হয়ে ফিরে আসার গল্প..."
              className="w-full flex-1 bg-transparent text-sm text-zinc-100 placeholder-purple-300/40 resize-none outline-none leading-relaxed font-sans min-h-[90px]"
            />
            <div className="flex items-center justify-between pt-2 border-t border-purple-900/30 mt-2">
              <span className="text-[10px] text-purple-400/60 font-mono">
                {incidentText.length} characters
              </span>
              <button 
                type="button"
                onClick={() => setIncidentText((p) => p + ' 🔥')}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              USER'S OWN PHOTO UPLOAD SECTION (COMPLETELY REPLACES FACE REFERENCE)
              No reference required. The user can upload their own photo directly!
             ========================================================================= */}
          <div className="my-4 p-4 rounded-2xl bg-[#110924] border border-purple-500/40 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-purple-200 font-bold">
                  আমার ছবি আপলোড (UPLOAD YOUR OWN PHOTO)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">
                কোনো রেফারেন্স লাগবে না
              </span>
            </div>

            <p className="text-[11px] text-purple-300/80 mb-3 leading-relaxed">
              এখানে কোনো রেফারেন্স মুখ নির্বাচন করার প্রয়োজন নেই। আপনি সরাসরি আপনার নিজের আসল ছবি আপলোড করতে পারবেন। স্টোরি স্লাইডে সরাসরি আপনার ছবি বসবে এবং চাইলে AI ছবি তৈরিতেও আপনার ছবিই ব্যবহার হবে।
            </p>

            {/* Photo Mode Selection */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPhotoUsageMode('direct_slide')}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-left transition-all flex items-center gap-2 cursor-pointer ${
                  photoUsageMode === 'direct_slide'
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                    : 'bg-black/40 border-purple-950 text-zinc-400 hover:text-white'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${photoUsageMode === 'direct_slide' ? 'border-purple-400 bg-purple-500' : 'border-zinc-500'}`}>
                  {photoUsageMode === 'direct_slide' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </span>
                <span>আমার আসল ছবি সরাসরি স্লাইডে বসাও</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoUsageMode('ai_likeness')}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-left transition-all flex items-center gap-2 cursor-pointer ${
                  photoUsageMode === 'ai_likeness'
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                    : 'bg-black/40 border-purple-950 text-zinc-400 hover:text-white'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${photoUsageMode === 'ai_likeness' ? 'border-purple-400 bg-purple-500' : 'border-zinc-500'}`}>
                  {photoUsageMode === 'ai_likeness' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </span>
                <span>AI ভিজ্যুয়ালের রেফারেন্স হিসেবে ব্যবহার করো</span>
              </button>
            </div>

            {/* Upload Button & Preview List */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              <button 
                type="button"
                onClick={() => userPhotoInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-purple-500/60 hover:border-purple-400 bg-purple-950/30 hover:bg-purple-900/40 flex flex-col items-center justify-center text-purple-300 transition-all shrink-0 cursor-pointer active:scale-95 group shadow-inner"
              >
                <Camera className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-purple-400" />
                <span className="text-[9px] font-bold text-center leading-tight">আমার ছবি<br />যোগ করুন</span>
              </button>

              {userUploadedPhotos.map((photo, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-500/60 shrink-0 group shadow-lg">
                  <img src={photo} alt={`User Photo ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-purple-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow backdrop-blur-xs">
                    আমার ছবি
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeUserPhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow"
                    title="মুছুন"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {userUploadedPhotos.length === 0 && (
                <div className="flex-1 py-4 px-3 rounded-2xl border border-dashed border-purple-900/50 bg-black/20 flex items-center justify-center text-center">
                  <span className="text-[11px] text-zinc-400">
                    এখনো কোনো ছবি আপলোড করেননি। ক্যামেরা বা গ্যালারি থেকে আপনার ছবি যোগ করুন।
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button: DONE - Generates story with user's photo and regional thesh chhando poetry */}
          <div className="mt-auto pt-4">
            <button 
              onClick={handleStartIncidentGeneration}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4.5 h-4.5 text-amber-300 animate-pulse" />
              <span>ডান (DONE) — আমার ছবি ও আঞ্চলিক ঠেস ছন্দ কবিতায় সাজান</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2.5: GENERATION & WAITING SCREEN
         ========================================================================= */}
      {currentView === 'generating' && (
        <div className="relative w-full h-full flex flex-col justify-center items-center bg-[#07050d] p-6 text-center select-none overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-c from-purple-900/30 via-transparent to-transparent pointer-events-none" />

          {!generationCompleted ? (
            <div className="relative z-10 w-full max-w-sm flex flex-col items-center space-y-6">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-1 animate-pulse shadow-[0_0_40px_rgba(168,85,247,0.7)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#0d071a] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-purple-300 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
                  SELFX REALITY GENERATOR
                </span>
                <h3 className="text-xl font-display font-black text-white">
                  আপনার গল্প ও ছবি সাজানো হচ্ছে...
                </h3>
                <p className="text-xs text-purple-200/70 mt-1 font-sans">
                  আঞ্চলিক ঠেস ছন্দ কবিতা ও আপনার ছবির সাথে রিয়েলিটি মেমোরি তৈরি হচ্ছে
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-900/90 border border-purple-500/40 rounded-full h-3 overflow-hidden p-0.5 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                  style={{ width: `${generatingProgress}%` }}
                />
              </div>

              {/* Step Notification Banner */}
              <div className="px-4 py-2 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-semibold backdrop-blur-md shadow animate-fadeIn">
                <span>{generatingStepText}</span>
              </div>
            </div>
          ) : (
            /* GENERATION COMPLETE PREVIEW CARD */
            <div className="relative z-10 w-full max-w-sm flex flex-col items-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Check className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                  GENERATION SUCCESSFUL
                </span>
                <h3 className="text-lg font-display font-black text-white">
                  নতুন রিয়েলিটি মেমোরি কার্ড প্রস্তুত!
                </h3>
                <p className="text-xs text-purple-200/70 mt-0.5 font-sans">
                  আপনার ছবি ও আঞ্চলিক ঠেস ছন্দ কবিতায় সাজানো হয়েছে
                </p>
              </div>

              {/* Preview Card */}
              {newlyCreatedScene && (
                <div className="w-full bg-zinc-950/90 border border-purple-500/40 rounded-[24px] overflow-hidden shadow-2xl p-3 text-left space-y-2.5">
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-purple-500/30">
                    <img 
                      src={newlyCreatedScene.subImages[0]?.imageUrl} 
                      alt="Generated" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[10px] font-mono text-purple-300 font-bold">
                        {incidentCategory === 'emotional' ? '💔 ইমোশনাল ঠেস ছন্দ' : '👑 মোটিভেশনাল ছন্দ'}
                      </span>
                    </div>
                  </div>

                  <div className="px-1 space-y-1">
                    <p className="text-xs font-serif font-bold text-white line-clamp-2 leading-snug">
                      "{newlyCreatedScene.subImages[0]?.caption}"
                    </p>
                    <p className="text-[11px] text-purple-200/70 font-sans line-clamp-2">
                      {newlyCreatedScene.subImages[0]?.subText}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-full space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMood(incidentCategory);
                    setCurrentSceneIndex(0);
                    setSubImageIndex(0);
                    setIsPlayingMusic(true);
                    setIsMuted(false);
                    setCurrentView('experience');
                    playAudioFromMainLine();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>🎬 রিয়েলিটিতে এখনই দেখুন (Play in Reality)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIncidentText('');
                    setGenerationCompleted(false);
                    setCurrentView('add_story');
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>আরেকটি ঘটনা যোগ করুন (Add Another)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('main')}
                  className="w-full py-2 text-zinc-400 hover:text-white text-xs font-sans transition-colors cursor-pointer"
                >
                  মূল মেনুতে ফিরে যান (Back to Reality Hub)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: REALITY EXPERIENCE PLAYER (REGIONAL THESH CHHANDO KOBITA & MAIN LINE AUDIO)
         ========================================================================= */}
      {currentView === 'experience' && (
        <div className="relative w-full h-full flex flex-col justify-between bg-[#07050d] overflow-hidden select-none px-4 py-3 sm:py-5">
          {/* Atmospheric blurred ambient backdrop */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <img 
              src={currentSubImage?.imageUrl || realityRejectionRain} 
              alt="Backdrop" 
              className="w-full h-full object-cover blur-3xl opacity-35 scale-125 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07050d]/85 via-[#07050d]/65 to-[#07050d]" />
          </div>

          {/* Top Bar */}
          <div className="relative z-30 w-full max-w-[390px] mx-auto flex items-center justify-between pb-2 shrink-0">
            <button 
              onClick={() => {
                stopSynthMusic();
                if (customAudioRef.current) customAudioRef.current.pause();
                setCurrentView('main');
              }}
              className="w-9 h-9 rounded-full bg-black/60 border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-900/50 transition-all cursor-pointer active:scale-95 backdrop-blur-md shadow-lg"
              title="Back"
            >
              <ArrowLeft className="w-4.5 h-4.5 text-purple-200" />
            </button>

            {/* Quick Actions: Replace Slide Photo + Mode Switch + Pause */}
            <div className="flex items-center gap-2">
              {/* Replace Current Slide Image with User's Own Photo */}
              <button 
                onClick={() => slidePhotoReplaceInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-full bg-black/70 border border-blue-500/40 text-blue-200 text-xs font-bold flex items-center gap-1 backdrop-blur-md shadow-lg cursor-pointer active:scale-95 hover:border-blue-400"
                title="এই স্লাইডে আমার ছবি বসান"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px]">আমার ছবি</span>
              </button>

              <button 
                onClick={() => {
                  setCurrentMood(currentMood === 'emotional' ? 'motivated' : 'emotional');
                  setCurrentSceneIndex(0);
                  setSubImageIndex(0);
                  playAudioFromMainLine();
                }}
                className="px-3 py-1.5 rounded-full bg-black/70 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1 backdrop-blur-md shadow-lg cursor-pointer active:scale-95 hover:border-purple-400"
              >
                <span>{currentMood === 'emotional' ? '💔 Emotional' : '👑 Motivated'}</span>
              </button>

              <button 
                onClick={() => {
                  const nextPause = !isPaused;
                  setIsPaused(nextPause);
                  if (nextPause) {
                    stopSynthMusic();
                  } else {
                    playAudioFromMainLine();
                  }
                }}
                className="w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-md cursor-pointer active:scale-95 shadow hover:border-purple-400"
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>

          {/* FRAMED VERTICAL CINEMATIC PLAYER CARD */}
          <div className="relative z-20 mx-auto w-full max-w-[390px] flex-1 max-h-[580px] min-h-[440px] rounded-[30px] overflow-hidden border-2 border-purple-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(168,85,247,0.25)] flex flex-col justify-between bg-black">
            {/* The Image with Ken Burns animation */}
            <div className="absolute inset-0 overflow-hidden">
              <img 
                key={`${currentScene.id}-${subImageIndex}`}
                src={currentSubImage?.imageUrl || realityRejectionRain} 
                alt="Scene" 
                className="w-full h-full object-cover animate-ken-burns-alive transition-all duration-700"
                style={{
                  filter: currentMood === 'emotional' ? 'grayscale(10%) contrast(110%)' : 'contrast(115%) saturate(115%)'
                }}
              />
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none z-10" />

            {/* Tap areas for screen navigation */}
            <div 
              onClick={goToPrevScene}
              className="absolute left-0 top-0 bottom-28 w-1/3 z-20 cursor-pointer"
              title="Previous"
            />
            <div 
              onClick={() => setIsPaused(!isPaused)}
              className="absolute left-1/3 top-0 bottom-28 w-1/3 z-20 cursor-pointer"
              title="Toggle Pause"
            />
            <div 
              onClick={goToNextScene}
              className="absolute right-0 top-0 bottom-28 w-1/3 z-20 cursor-pointer"
              title="Next"
            />

            {/* Story progression mini indicators */}
            <div className="relative z-20 pt-3.5 px-4 flex items-center justify-center gap-1.5">
              {currentScene.subImages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === subImageIndex 
                      ? 'w-6 bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' 
                      : idx < subImageIndex 
                      ? 'w-2 bg-white/70' 
                      : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* PURE BANGLA REGIONAL THESH CHHANDO KOBITA (আঞ্চলিক ঠেস ছন্দ কবিতা) */}
            <div className="relative z-20 pb-6 px-5 sm:px-7 text-center pointer-events-none mt-auto">
              {/* Three dots aesthetic divider */}
              <div className="w-full flex items-center justify-center gap-1.5 mb-2.5 opacity-80">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              </div>

              {/* Dynamic Regional Thesh Chhando Lines */}
              <div className="space-y-1.5">
                <p className="text-lg sm:text-xl font-serif font-bold text-white leading-snug drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                  {currentSubImage?.caption}
                </p>
                {currentSubImage?.subText && (
                  <p className="text-xs sm:text-sm font-sans text-purple-200/90 font-light leading-relaxed drop-shadow-md">
                    {currentSubImage?.subText}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Spacing */}
          <div className="relative z-10 w-full max-w-[390px] mx-auto pt-2 flex items-center justify-between px-2 text-[10px] font-mono tracking-widest text-purple-400/70">
            <span>SELFX REALITY · {currentMood.toUpperCase()}</span>
            <span className="text-amber-300">মেইন লাইন: {mainLineOffsetSeconds}s</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: "আপনি ইমোশনাল দেখবেন নাকি মোটিভেশন?"
         ========================================================================= */}
      {showMoodSelectionModal && (
        <div className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-md flex items-center justify-center p-5 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#110724] border-2 border-purple-500/50 rounded-[32px] p-6 shadow-2xl flex flex-col space-y-4">
            <div className="text-center pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
                SELFX REALITY
              </span>
              <h3 className="text-lg font-display font-black text-white">
                আপনি কোনটি দেখতে চান?
              </h3>
              <p className="text-xs text-purple-200/70 mt-1 font-sans">
                আপনার বর্তমান মনের ভাব অনুযায়ী নির্বাচন করুন (গান সরাসরি মেইন লাইন থেকে বাজবে):
              </p>
            </div>

            {/* Option 1: Emotional 💔 */}
            <button
              onClick={() => {
                setCurrentMood('emotional');
                setCurrentSceneIndex(0);
                setSubImageIndex(0);
                setIsPlayingMusic(true);
                setIsMuted(false);
                setIsPaused(false);
                setShowMoodSelectionModal(false);
                setCurrentView('experience');
                playAudioFromMainLine();
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#2b0821] to-[#170412] hover:from-[#3d0b2f] hover:to-[#22061b] border border-pink-500/50 hover:border-pink-400 transition-all text-left flex items-center gap-3.5 shadow-lg group active:scale-[0.98] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                💔
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                  Emotional (ইমোশনাল)
                </h4>
                <p className="text-[11px] text-pink-200/70 mt-0.5 leading-snug">
                  ছ্যাঁকা, প্রত্যাখ্যান ও অবহেলার আঞ্চলিক ঠেস ছন্দ কবিতা
                </p>
              </div>
            </button>

            {/* Option 2: Motivated 👑 */}
            <button
              onClick={() => {
                setCurrentMood('motivated');
                setCurrentSceneIndex(0);
                setSubImageIndex(0);
                setIsPlayingMusic(true);
                setIsMuted(false);
                setIsPaused(false);
                setShowMoodSelectionModal(false);
                setCurrentView('experience');
                playAudioFromMainLine();
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#261304] to-[#140a02] hover:from-[#381c06] hover:to-[#200f03] border border-amber-500/50 hover:border-amber-400 transition-all text-left flex items-center gap-3.5 shadow-lg group active:scale-[0.98] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                👑
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Motivated (মোটিভেশনাল)
                </h4>
                <p className="text-[11px] text-amber-200/70 mt-0.5 leading-snug">
                  লোহা, ঘাম, ঘুরে দাঁড়ানো ও বীরত্বের আঞ্চলিক ছন্দ
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowMoodSelectionModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition-all cursor-pointer mt-1"
            >
              বাতিল (Cancel)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUDIO MANAGER DRAWER WITH MAIN LINE HOOK OFFSET CONTROLS
         ========================================================================= */}
      {showMusicDrawer && (
        <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-[#100824] border border-purple-500/40 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <div className="flex items-center gap-2.5">
                <Music className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                  গান ও মেইন লাইন নিয়ন্ত্রণ
                </h3>
              </div>
              <button 
                onClick={() => setShowMusicDrawer(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-purple-900/50 rounded-2xl">
              <button
                onClick={() => setMusicDrawerTab('emotional')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  musicDrawerTab === 'emotional'
                    ? 'bg-pink-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>💔 ইমোশনাল গান</span>
              </button>
              <button
                onClick={() => setMusicDrawerTab('motivated')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  musicDrawerTab === 'motivated'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>👑 মোটিভেশনাল গান</span>
              </button>
            </div>

            {/* =========================================================================
                CRITICAL FEATURE: MAIN LINE START TIME SELECTOR (starts from main line)
               ========================================================================= */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/70 to-indigo-950/60 border border-purple-500/50 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-white uppercase">
                    মেইন লাইন শুরুর সময় (Main Line Hook)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-md border border-amber-500/40">
                  {mainLineOffsetSeconds} সেকেন্ড
                </span>
              </div>

              <p className="text-[11px] text-purple-200/80 leading-snug">
                রিয়েলিটিতে ঢুকলেই গান শুরু (0:00) থেকে নয়, সরাসরি মূল ড্রপ বা মেইন লাইন থেকে শুরু হবে:
              </p>

              {/* Quick Select Chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 20, 22, 30].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => updateMainLineOffset(sec)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      mainLineOffsetSeconds === sec
                        ? 'bg-amber-500 text-black border-amber-300 shadow'
                        : 'bg-black/50 text-purple-200 border-purple-800/60 hover:border-purple-400'
                    }`}
                  >
                    {sec}s {sec === 22 && '★'}
                  </button>
                ))}
              </div>

              {/* Fine-tune Slider */}
              <div className="pt-1">
                <input 
                  type="range" 
                  min="5" 
                  max="60" 
                  step="1"
                  value={mainLineOffsetSeconds}
                  onChange={(e) => updateMainLineOffset(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Custom Phone Upload Section */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border-2 border-dashed border-purple-500/60 flex flex-col items-center text-center space-y-2">
              <Upload className="w-6 h-6 text-purple-400 animate-bounce" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase">
                  {musicDrawerTab === 'emotional' ? 'ইমোশনাল মোডের গান আপলোড' : 'মোটিভেশনাল মোডের গান আপলোড'}
                </h4>
                <p className="text-[10px] text-purple-300/70 mt-0.5">
                  ফোন থেকে যেকোনো MP3/M4A/WAV অডিও নির্বাচন করুন
                </p>
              </div>
              <button 
                onClick={() => musicFileInputRef.current?.click()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer mt-1"
              >
                📁 ফোন থেকে অডিও বেছে নিন
              </button>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                <Check className="w-3.5 h-3.5" />
                <span className="truncate max-w-[220px]">
                  {musicDrawerTab === 'emotional' 
                    ? `বর্তমান: ${emotionalSongName}` 
                    : `বর্তমান: ${motivatedSongName}`}
                </span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="p-3 rounded-2xl bg-black/40 border border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-semibold">ভলিউম</span>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-300 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={isMuted ? 0 : musicVolume}
                onChange={(e) => {
                  setMusicVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <button 
              onClick={() => setShowMusicDrawer(false)}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase transition-all cursor-pointer"
            >
              সংরক্ষণ করুন (Done)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealityHub;
