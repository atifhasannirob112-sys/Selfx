import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Check, RefreshCw, Sparkles, BookOpen, AlertCircle, Save, CheckSquare, Plus, Trash2, Droplet, Bookmark, Clock, Flame, Zap, AlertTriangle, Calendar, Award, ShieldAlert, Heart, EyeOff, Shield, UserCheck, Send, MessageSquare, Compass, Lock, Upload, Play, FileVideo, FileImage, Coins, ShieldCheck, Settings as SettingsIcon, GraduationCap, Smartphone } from 'lucide-react';
import { HabitItem, WaterTracker, FaithTracker as FaithType, TodoItem } from '../types';
import { triggerNotification } from '../utils';
import WaterIntake from './WaterIntake';
import NotesTodo from './NotesTodo';
import LoveAngelFull from './LoveAngelFull';
import SocialGrowthHub from './SocialGrowthHub';
import SecretModelVault from './SecretModelVault';
import { TrainingRoast } from './TrainingRoast';
import LectureHub from './LectureHub';
import DreamDay from './DreamDay';
import { compressPrayerPhoto } from './FaithTracker';
import { saveMediaItem, getMediaItem } from '../utils/mediaStorage';

interface DailyHabitsProps {
  habits: HabitItem[];
  setHabits: React.Dispatch<React.SetStateAction<HabitItem[]>>;
  water: WaterTracker;
  setWater: React.Dispatch<React.SetStateAction<WaterTracker>>;
  faith: FaithType;
  setFaith: React.Dispatch<React.SetStateAction<FaithType>>;
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  onEarnPoints?: (amount: number, reason: string) => void;
  initialSubTab?: 'menu' | 'matrix' | 'water' | 'faith' | 'notes' | 'routine' | 'dream_day' | 'nofap' | 'love_angel' | 'lecture';
}

export default function DailyHabits({ 
  habits, 
  setHabits, 
  water, 
  setWater, 
  faith, 
  setFaith, 
  todos,
  setTodos,
  onEarnPoints,
  initialSubTab
}: DailyHabitsProps) {
  const [subTab, setSubTab] = useState<'menu' | 'matrix' | 'water' | 'faith' | 'notes' | 'routine' | 'dream_day' | 'nofap' | 'love_angel' | 'secret_vault' | 'training_roast' | 'settings' | 'lecture'>(
    initialSubTab === 'social' as any ? 'menu' : ((initialSubTab as any) || 'menu')
  );
  const [partnerName, setPartnerName] = useState<string>("Unknown");

  const getScopedKey = (baseKey: string) => {
    let name = '';
    try {
      const savedProfile = localStorage.getItem('lookmax_user_profile_v2');
      if (savedProfile) {
        name = JSON.parse(savedProfile).name || '';
      }
    } catch (e) {}
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanName) return baseKey;
    return `${baseKey}_usr_${cleanName}`;
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getScopedKey('lookmax_crush_list_v2'));
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          const preferred = list.find((c: any) => c && (c.status === 'GF/BF' || c.status === 'Secret Love' || c.status === 'Crush')) || list[0];
          if (preferred && preferred.name) {
            setPartnerName(preferred.name);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load partner name for NoFap", e);
    }
  }, []);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // --- SETTINGS STATE ---
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('selfx_theme') || 'dark';
  });

  const [hasLegacyPassword, setHasLegacyPassword] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('selfx_current_user_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        return !!(profile.password && profile.password.trim());
      }
    } catch (e) {}
    return false;
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });

  // Custom Prayer Wallpapers / Images for 5 Prayers + Tahajjud
  const [prayerPhotos, setPrayerPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('selfx_prayer_custom_photos');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [isSavingPrayerPhotos, setIsSavingPrayerPhotos] = useState(false);
  const [hasUnsavedPrayerPhotos, setHasUnsavedPrayerPhotos] = useState(false);

  // Multi-tier restore of prayer photos (IndexedDB + LocalStorage + Server)
  useEffect(() => {
    const restorePrayerPhotos = async () => {
      const keys = ['fajr', 'zohor', 'achr', 'magrib', 'esha', 'tahajjud'];
      const loaded: Record<string, string> = {};

      // 1. IndexedDB Check
      for (const k of keys) {
        try {
          const item = await getMediaItem(`selfx_prayer_photo_${k}`);
          if (item) loaded[k] = item;
        } catch (e) {}
      }

      // 2. LocalStorage Check
      try {
        const saved = localStorage.getItem('selfx_prayer_custom_photos');
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(loaded, parsed);
        }
      } catch (e) {}

      // 3. Server Check
      try {
        const res = await fetch('/api/user/prayer-photos');
        const data = await res.json();
        if (data && data.success && data.photos) {
          Object.assign(loaded, data.photos);
        }
      } catch (e) {}

      if (Object.keys(loaded).length > 0) {
        setPrayerPhotos(prev => ({ ...loaded, ...prev }));
      }
    };

    restorePrayerPhotos();
  }, []);

  const handleUploadPrayerPhoto = async (prayerKey: string, file: File) => {
    try {
      const compressed = await compressPrayerPhoto(file, 600, 0.72);
      const updated = { ...prayerPhotos, [prayerKey]: compressed };
      setPrayerPhotos(updated);
      setHasUnsavedPrayerPhotos(true);

      // Instantly save to IndexedDB & memory
      await saveMediaItem(`selfx_prayer_photo_${prayerKey}`, compressed);
      try {
        localStorage.setItem('selfx_prayer_custom_photos', JSON.stringify(updated));
      } catch (storageErr) {}

      window.dispatchEvent(new CustomEvent('selfx_prayer_photos_updated', { detail: updated }));
      triggerNotification('📸 ছবি লোড হয়েছে', `${prayerKey.toUpperCase()} এর ছবি প্রিভিউতে যুক্ত হয়েছে। নিচে "সব ওয়াক্তের ছবি সেভ করুন" বাটনে চাপুন।`);
    } catch (e) {
      console.error("Failed to compress prayer photo:", e);
      triggerNotification('⚠️ ছবি আপলোড সমস্যা', 'ছবি প্রসেস করা যায়নি, আবার চেষ্টা করুন।');
    }
  };

  const handleResetPrayerPhoto = async (prayerKey: string) => {
    const updated = { ...prayerPhotos };
    delete updated[prayerKey];
    setPrayerPhotos(updated);
    setHasUnsavedPrayerPhotos(true);
    try {
      localStorage.setItem('selfx_prayer_custom_photos', JSON.stringify(updated));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('selfx_prayer_photos_updated', { detail: updated }));
    triggerNotification('🔄 ছবি রিসেট', `${prayerKey.toUpperCase()} এর ছবি সরানো হয়েছে। সেভ করতে নিচে বাটনে চাপুন।`);
  };

  const handleSaveAllPrayerPhotos = async () => {
    setIsSavingPrayerPhotos(true);
    try {
      // 1. Save all photos to IndexedDB
      for (const [key, photo] of Object.entries(prayerPhotos)) {
        if (photo) {
          await saveMediaItem(`selfx_prayer_photo_${key}`, photo);
        }
      }

      // 2. Save into LocalStorage
      try {
        localStorage.setItem('selfx_prayer_custom_photos', JSON.stringify(prayerPhotos));
      } catch (storageErr) {
        console.warn("Storage quota warning:", storageErr);
      }

      // 3. Save to server file system
      try {
        await fetch('/api/user/prayer-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: prayerPhotos })
        });
      } catch (serverErr) {
        console.warn("Server prayer photos sync notice:", serverErr);
      }

      // 4. Dispatch event so FaithTracker updates instantly
      window.dispatchEvent(new CustomEvent('selfx_prayer_photos_updated', { detail: prayerPhotos }));

      setHasUnsavedPrayerPhotos(false);
      triggerNotification('✅ নামাজের ছবি সেভ হয়েছে!', 'সব ওয়াক্তের ছবি সফলভাবে সংরক্ষিত হয়েছে। Faith Duty-তে এবার আপনার ছবিগুলো স্থায়ীভাবে দেখা যাবে।');
    } catch (err) {
      console.error("Failed to save prayer photos:", err);
      triggerNotification('⚠️ সেভ করতে সমস্যা', 'ছবি সংরক্ষণ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsSavingPrayerPhotos(false);
    }
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    localStorage.setItem('selfx_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-oled');
    root.classList.add(`theme-${theme}`);
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    window.dispatchEvent(new Event('lookmax_theme_changed'));
    triggerNotification("🎨 থিম ও ইন্টারফেস পরিবর্তন সম্পন্ন!", `সফলভাবে ${theme === 'light' ? '৩x২ গ্রিড' : theme === 'oled' ? 'ভার্টিক্যাল ব্যানার' : '৩ডি সোয়াইপ ডেক'} ইন্টারফেসে পরিবর্তিত হয়েছে।`);
  };

  const handlePasswordSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setPasswordMsg({ text: '⚠️ পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: '❌ পাসওয়ার্ড দুটি মেলেনি!', isError: true });
      return;
    }

    try {
      const saved = localStorage.getItem('selfx_current_user_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        profile.password = newPassword.trim();
        localStorage.setItem('selfx_current_user_profile', JSON.stringify(profile));
        
        // Sync to accounts db
        const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || '{}';
        const db = JSON.parse(dbStr);
        if (profile.username && db[profile.username]) {
          db[profile.username].profile = profile;
          localStorage.setItem('selfx_user_accounts_db_v2', JSON.stringify(db));
        }
        
        setHasLegacyPassword(true);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordMsg({ text: '✅ পাসওয়ার্ড সফলভাবে সেট করা হয়েছে!', isError: false });
        triggerNotification("🔒 নিরাপত্তা পাসওয়ার্ড", "আপনার একাউন্টের পাসওয়ার্ড সফলভাবে সেট হয়েছে!");
      }
    } catch (e) {
      setPasswordMsg({ text: '❌ পাসওয়ার্ড সেট করতে সমস্যা হয়েছে!', isError: true });
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = localStorage.getItem('selfx_current_user_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        if (profile.password !== oldPassword.trim()) {
          setPasswordMsg({ text: '❌ বর্তমান পাসওয়ার্ডটি সঠিক নয়!', isError: true });
          return;
        }
        if (newPassword.length < 4) {
          setPasswordMsg({ text: '⚠️ নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!', isError: true });
          return;
        }
        if (newPassword !== confirmPassword) {
          setPasswordMsg({ text: '❌ নতুন পাসওয়ার্ড দুটি মেলেনি!', isError: true });
          return;
        }

        profile.password = newPassword.trim();
        localStorage.setItem('selfx_current_user_profile', JSON.stringify(profile));
        
        // Sync to accounts db
        const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || '{}';
        const db = JSON.parse(dbStr);
        if (profile.username && db[profile.username]) {
          db[profile.username].profile = profile;
          localStorage.setItem('selfx_user_accounts_db_v2', JSON.stringify(db));
        }

        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordMsg({ text: '✅ পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', isError: false });
        triggerNotification("🔒 পাসওয়ার্ড পরিবর্তিত", "আপনার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!");
      }
    } catch (e) {
      setPasswordMsg({ text: '❌ পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে!', isError: true });
    }
  };

  // --- MY ROUTINE PERSISTED STATE ---
  const [routineItems, setRoutineItems] = useState<{ id: string; time: string; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('selfx_my_routine');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'rot_1', time: '06:00 AM', text: 'Sufi Prayer & Meditation', completed: false },
      { id: 'rot_2', time: '06:30 AM', text: 'Hydration Base (500ml water)', completed: false },
      { id: 'rot_3', time: '07:00 AM', text: 'Grooming & Skincare routine', completed: false },
      { id: 'rot_4', time: '08:00 AM', text: 'High Protein Breakfast', completed: false },
      { id: 'rot_5', time: '05:30 PM', text: 'Workout Session (Push Yourself!)', completed: false },
      { id: 'rot_6', time: '10:00 PM', text: 'Bedtime reflection & Journaling', completed: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('selfx_my_routine', JSON.stringify(routineItems));
  }, [routineItems]);

  // Periodic check for routine notifications
  useEffect(() => {
    const notifiedMap: { [key: string]: boolean } = {}; // Track already-notified minutes

    const checkRoutineTimes = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // convert 0 to 12
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      const strHours = hours < 10 ? '0' + hours : hours;
      const currentTimeString = `${strHours}:${strMinutes} ${ampm}`; // e.g. "06:30 AM"

      const todayDateStr = now.toDateString();

      routineItems.forEach(item => {
        if (item.time.toUpperCase() === currentTimeString.toUpperCase() && !item.completed) {
          const notifiedKey = `${item.id}-${todayDateStr}-${currentTimeString}`;
          if (!notifiedMap[notifiedKey]) {
            notifiedMap[notifiedKey] = true;
            // Trigger beautiful routine alert
            triggerNotification(
              "⏰ রুটিন রিমাইন্ডার (Routine Task Check)", 
              `আপনি কি এখনো "${item.text}" কাজটি সম্পন্ন করেছেন? অ্যাপে গিয়ে চেক-ইন করুন!`
            );
          }
        }
      });
    };

    // Check immediately, then poll every 20 seconds
    checkRoutineTimes();
    const intervalId = setInterval(checkRoutineTimes, 20000);

    return () => clearInterval(intervalId);
  }, [routineItems]);

  const [newRoutineTime, setNewRoutineTime] = useState('08:00');
  const [newRoutineText, setNewRoutineText] = useState('');

  const handleAddRoutineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineText.trim()) return;
    
    // Format time to 12 hour AM/PM
    const [hrs, mins] = newRoutineTime.split(':');
    const hrNum = parseInt(hrs);
    const ampm = hrNum >= 12 ? 'PM' : 'AM';
    const formattedHr = hrNum % 12 === 0 ? 12 : hrNum % 12;
    const time12 = `${formattedHr.toString().padStart(2, '0')}:${mins} ${ampm}`;

    const newItem = {
      id: 'routine-' + Date.now(),
      time: time12,
      text: newRoutineText.trim(),
      completed: false
    };
    
    // Sort routine items by time logically
    setRoutineItems(prev => {
      const updated = [...prev, newItem];
      return updated.sort((a, b) => {
        const toMinutes = (tStr: string) => {
          const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return 0;
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          const isPm = match[3].toUpperCase() === 'PM';
          if (isPm && h !== 12) h += 12;
          if (!isPm && h === 12) h = 0;
          return h * 60 + m;
        };
        return toMinutes(a.time) - toMinutes(b.time);
      });
    });

    setNewRoutineText('');
    triggerNotification("📅 Routine Update", "New item added to your schedule!");
    if (onEarnPoints) onEarnPoints(5, "Added an activity to your daily routine");
  };

  const handleToggleRoutineItem = (id: string) => {
    setRoutineItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState) {
          triggerNotification("🎯 Routine Task Complete", `Good job! Done: ${item.text}`);
          if (onEarnPoints) onEarnPoints(10, `Completed routine task: ${item.text}`);
        }
        return { ...item, completed: nextState };
      }
      return item;
    }));
  };

  const handleDeleteRoutineItem = (id: string) => {
    setRoutineItems(prev => prev.filter(item => item.id !== id));
    triggerNotification("🗑️ Item Removed", "Routine activity deleted.");
  };

  const handleAutofillRoutine = () => {
    const suggested = [
      { id: 's_1', time: '10:00 AM', text: 'Deep Focus & Monk Mode learning task', completed: false },
      { id: 's_2', time: '12:00 PM', text: 'Posture exercises & Mewing workout', completed: false },
      { id: 's_3', time: '02:00 PM', text: 'Mindfulness & No-Screen break', completed: false },
      { id: 's_4', time: '04:00 PM', text: 'Cold water facial rinse & Hydration check', completed: false },
      { id: 's_5', time: '08:30 PM', text: 'Nutrient-rich dinner & Magnesium intake', completed: false },
      { id: 's_6', time: '09:30 PM', text: 'Dental care, Flossing, & Night hygiene', completed: false }
    ];

    setRoutineItems(prev => {
      const existingTexts = prev.map(p => p.text.toLowerCase());
      const filteredSuggest = suggested.filter(s => !existingTexts.includes(s.text.toLowerCase()));
      
      const updated = [...prev, ...filteredSuggest];
      return updated.sort((a, b) => {
        const toMinutes = (tStr: string) => {
          const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return 0;
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          const isPm = match[3].toUpperCase() === 'PM';
          if (isPm && h !== 12) h += 12;
          if (!isPm && h === 12) h = 0;
          return h * 60 + m;
        };
        return toMinutes(a.time) - toMinutes(b.time);
      });
    });

    triggerNotification("🧠 AI Assistant Sync", "SelfX beautifully optimized your routine with lookmaxing protocols!");
    if (onEarnPoints) onEarnPoints(15, "Synchronized routine with lookmaxing recommendations");
  };

  // --- NO FAP LIVE STATE ---
  const [nofapStreakStart, setNofapStreakStart] = useState<string>(() => {
    const saved = localStorage.getItem('selfx_nofap_streak_start');
    if (saved) return saved;
    const defaultStart = new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('selfx_nofap_streak_start', defaultStart);
    return defaultStart;
  });

  const [lastNofapCheckIn, setLastNofapCheckIn] = useState<string>(() => {
    return localStorage.getItem('selfx_nofap_last_checkin') || '';
  });

  const [nofapUrgesCount, setNofapUrgesCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('selfx_nofap_urges') || '0');
  });

  const [timePassed, setTimePassed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showRelapseConfirm, setShowRelapseConfirm] = useState(false);
  const [showUrgeTips, setShowUrgeTips] = useState(false);

  const nofapStreakDays = timePassed.days;
  const nofapStreakHours = timePassed.hours;
  const nofapStreakMinutes = timePassed.minutes;

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(nofapStreakStart).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      setTimePassed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [nofapStreakStart]);

  const [isNofapUnlocked, setIsNofapUnlocked] = useState<boolean>(true);
  const [nofapPassword, setNofapPassword] = useState('');
  const [nofapPasswordError, setNofapPasswordError] = useState(false);

  // Web Audio Context & TTS refs for relaxing rescue music & speaking
  const nofapAudioCtxRef = useRef<AudioContext | null>(null);
  const nofapOscsRef = useRef<OscillatorNode[]>([]);
  const nofapGainRef = useRef<GainNode | null>(null);

  const startNofapRelaxMusic = () => {
    try {
      window.speechSynthesis.cancel();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      nofapAudioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2.0);
      mainGain.connect(ctx.destination);
      nofapGainRef.current = mainGain;

      // Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.connect(mainGain);

      // Super deep soothing chord progression/drone
      const freqs = [110.00, 164.81, 220.00]; // A2, E3, A3
      const oscs: OscillatorNode[] = [];

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        if (i === 1) osc.detune.setValueAtTime(6, ctx.currentTime);
        if (i === 2) osc.detune.setValueAtTime(-6, ctx.currentTime);
        osc.connect(filter);
        osc.start();
        oscs.push(osc);
      });
      nofapOscsRef.current = oscs;
    } catch (err) {
      console.error("Failed to start NoFap music:", err);
    }
  };

  const stopNofapRelaxMusic = () => {
    try {
      window.speechSynthesis.cancel();
      if (nofapGainRef.current && nofapAudioCtxRef.current) {
        const ctx = nofapAudioCtxRef.current;
        const gain = nofapGainRef.current;
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
        setTimeout(() => {
          try {
            nofapOscsRef.current.forEach(osc => osc.stop());
            if (ctx.state !== 'closed') ctx.close();
          } catch (e) {}
          nofapAudioCtxRef.current = null;
          nofapOscsRef.current = [];
        }, 1100);
      }
    } catch (err) {
      console.error("Failed to stop NoFap music:", err);
    }
  };

  const speakNofapRescueText = (text: string) => {
    // Disabled AI voice audio pronunciation as requested by user
  };

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
        nofapOscsRef.current.forEach(osc => osc.stop());
        if (nofapAudioCtxRef.current && nofapAudioCtxRef.current.state !== 'closed') {
          nofapAudioCtxRef.current.close();
        }
      } catch (e) {}
    };
  }, []);

  // Rescue Mode and Emergency active states
  const [isRescueModeActive, setIsRescueModeActive] = useState(false);
  const [rescueStep, setRescueStep] = useState(0);
  const [activeRescueSessionMessages, setActiveRescueSessionMessages] = useState<{ category: string; text: string }[]>([]);

  // Rotating advice state (manually controlled)
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);

  const handleNextAdvice = () => {
    setCurrentAdviceIndex((prev) => (prev + 1) % ADVOCACY_MESSAGES.length);
  };

  const handleResetNofapStreak = () => {
    const now = new Date().toISOString();
    setNofapStreakStart(now);
    localStorage.setItem('selfx_nofap_streak_start', now);
    setShowRelapseConfirm(false);
    triggerNotification("⚠️ Streak Reset", "Your streak has been reset. Stand tall, learn, and start strong again!", true);
  };

  const partnerDisp = partnerName && partnerName !== "Unknown" ? partnerName : "Unknown";
  const partnerClean = partnerDisp !== "Unknown" ? partnerDisp.replace(/\s*\(.*?\)\s*/g, '').trim() : "Unknown";

  const partnerTextDisp = partnerDisp !== "Unknown" ? partnerDisp : "প্রিয়তমা";
  const partnerTextClean = partnerClean !== "Unknown" ? partnerClean : "প্রিয়তমা";

  const ADVOCACY_MESSAGES = [
    {
      category: "💍 HALAL MARRIAGE & FUTURE (ভবিষ্যৎ ও বিয়ে)",
      title: `সতীত্ব রক্ষা করে সসম্মানে ${partnerTextClean}কে বিয়ে করার শপথ`,
      bengaliText: `হালাল উপায়ে সসম্মানে ${partnerTextDisp}-কে বিয়ে করতে চাইলে প্রথম শর্ত হলো নিজের ক্যারিয়ার আর উপার্জনের একটা চরম শক্ত ও সৎ পথ তৈরি করা দোস্ত! সস্তা পর্ন আর হস্তমৈথুনের মরীচিকায় নিজের অমূল্য জীবনশক্তি বাথরুমের ড্রেনে ফেলে দিলে তুই কখনোই একজন আত্মবিশ্বাসী ও দায়িত্বশীল স্বামী হতে পারবি না। নিজেকে আর্থিকভাবে স্বাবলম্বী কর ভাই। সতীত্ব রক্ষা করা তোর জীবনের সবচেয়ে বড় আমল। ${partnerTextClean}-এর সম্মানের কথা ভাব আর আজকেই নিজেকে বদলে ফেল!`,
      actionableTip: "সস্তা মোহ বর্জন করে হালাল বিয়ের জন্য ক্যারিয়ারে পূর্ণ ফোকাস কর দোস্ত। প্রতিদিন অন্তত ২০ মিনিট দক্ষতা বাড়াতে সময় দে।"
    },
    {
      category: "🚨 CHRONIC LOOK DESTRUCTION (চেহারা ধ্বংসের সতর্কতা)",
      title: "হস্তমৈথুন ও পর্নের মাধ্যমে নিজের আকর্ষনীয় চেহারা নষ্ট করার অবসান",
      bengaliText: "তুই কি জানিস দোস্ত? হস্তমৈথুনের কারণে তোর সুন্দর ফেস স্ট্রাকচার আর আকর্ষনীয় চেহারা ভয়াবহভাবে নষ্ট হয়ে যাচ্ছে! চোখের নিচে কালো দাগ পড়ে যাবে, স্কিনের সমস্ত উজ্জ্বলতা আর গ্লো হারিয়ে যাবি, চুল পড়ে খসে পড়বে আর ফেসটা দেখতে মরা-মলিন লাগবে। Looksmaxing-এর এক নম্বর শর্তই হলো বীর্য সংরক্ষণ করা! এই অমূল্য জীবনীশক্তি তোর চেহারার পুরুষালি জ্যোতি ধরে রাখে, গলার আওয়াজ গভীর করে। নিজের চেহারা নষ্ট করা বন্ধ কর ভাই!",
      actionableTip: "চেহারা নষ্ট করা বন্ধ কর দোস্ত! আজ থেকেই কঠোর নো-ফ্যাপ ব্রত শুরু কর, প্রচুর পানি খা আর নিয়মিত মেউইং (Mewing) প্র্যাকটিস কর।"
    },
    {
      category: "🎥 CONTENT CREATOR REVOLUTION (ইউটিউব চ্যানেল)",
      title: "স্ক্রিনের অলীক পিক্সেল দেখা বাদ দিয়ে নিজের ইউটিউব চ্যানেল খুলে সফল হোন",
      bengaliText: "তোর এখনও নিজের একটা ইউটিউব বা টিকটক চ্যানেল নাই, কোনো নিজস্ব পরিচয় নাই দোস্ত! অথচ চারপাশের লাখ লাখ তরুণ কনটেন্ট বানিয়ে মাসে লাখ টাকা কামাচ্ছে, ব্র্যান্ড বানাচ্ছে। স্ক্রিনে অন্যদের পর্ন বা ফালতু ভিডিও দেখার বদলে নিজের একটা ইউটিউব (YouTube) চ্যানেল খুলে ফেল। ভিডিও এডিটিং শেখ, কোনো স্কিল বা Looksmaxing জার্নি নিয়ে ভিডিও বানিয়ে সোশ্যাল মিডিয়ায় নিজের রাজত্ব শুরু কর!",
      actionableTip: "আজই একটা নতুন ইউটিউব চ্যানেল খোল দোস্ত, সুন্দর একটা নাম দে আর প্রথম ভিডিওর স্ক্রিপ্ট লেখা শুরু কর।"
    }
  ];

  // --- NOFAP RESCUE MODE STATE WITH 12 DEEP CLOSE-FRIEND TOPICS ---
  const RESCUE_MOTIVATIONAL_POOL = [
    {
      category: `💍 রিলেশন আর তোর ভবিষ্যৎ`,
      text: `শোন দোস্ত, তুই ${partnerTextClean}-কে মন থেকে ভালোবাসিস না? একবার বুক ঠুকে ভাব তো—তুই কি তার সামনে একজন দুর্বল, মাথা নিচু করা পর্ন-আসক্ত ছেলে হিসেবে দাঁড়াবি? নাকি বুক ফুলিয়ে একজন আত্মবিশ্বাসী ও ভরসার মানুষ হয়ে তার পাশে থাকবি? বাথরুমে লুকিয়ে ২ সেকেন্ডের ফালতু আনন্দের জন্য নিজের সম্মান আর যৌবনের তেজ নষ্ট করিস না ভাই। নিজেকে শক্ত কর, তুই অনেক বড় কিছু করবি!`
    },
    {
      category: "🧬 চেহারা আর স্কিনের গ্লো",
      text: `দোস্ত, আয়নার সামনে যা তো একবার! তোর চোখ দুইটার দিকে তাকা। তুই তো দেখতে যথেষ্ট হ্যান্ডসাম। কিন্তু এই ফালতু অভ্যাসের কারণে চোখের নিচে কালি পড়ে যায়, স্কিনের গ্লো নষ্ট হয় আর মুখটা মরা লাগে। নিজের রূপ আর এনার্জিটা ড্রেনে নষ্ট না করে ধরে রাখ, দেখবি চেহারা এমনিতেই চমকাবে। এখনই চোখে-মুখে একটু ঠান্ডা পানির ঝাপটা দে ভাই!`
    },
    {
      category: "💰 পকেট আর নিজের ক্যারিয়ার",
      text: `ভাই রে, পকেটে যখন টাকা থাকবে না আর বয়স বেড়ে যাবে, তখন কিন্তু এই মোবাইল স্ক্রিনের পর্ন তোকে একমুঠো ভাতও এনে দেবে না। একটু ভাব দোস্ত, আমাদের লাইফে অনেক বড় হতে হবে! কোনো স্কিল শেখ, কাজ কর, নিজের একটা পরিচয় আর পকেট ভারী কর। টাকা আর সফলতা থাকলে সবাই তোকে দাম দেবে। এই অন্ধকার থেকে এখনই বের হয়ে আয় ভাই!`
    },
    {
      category: "🧘‍♂️ একটু থাম আর গভীর শ্বাস নে",
      text: `শোন ভাই, তোর মন তোকে এখন ছলনা করতেছে—'লাস্ট একবার দেখে নিই, কাল থেকে আর করব না।' এই ফাঁদে একদম পা দিস না দোস্ত! মন বারবার এই নাটকটাই করে। ফোনটা এখন উল্টা করে টেবিলে রাখ। উঠে গিয়ে এক গ্লাস ঠান্ডা পানি খা, আর ১০টা বুকডন (Push-up) দে। দেখবি রক্ত চলাচল ভালো হবে আর ৫ মিনিট পরেই এই ফালতু ফিলিংটা ধোঁয়া হয়ে যাবে!`
    },
    {
      category: "🛡️ তুই দুর্বল না দোস্ত",
      text: `ভাই আমার, তুই কিন্তু কোনো দুর্বল বা অলস ছেলে না। তুই যখন মন দিয়ে কিছু করিস, তুই যে কোনো কিছু জয় করতে পারিস। একটা ১০ সেকেন্ডের সস্তা অনুভূতির জন্য তুই নিজের আত্মসম্মান আর এতোদিনের কষ্ট নষ্ট করবি? তোর জেদটা কোথায় ভাই? আজ এই মুহূর্তটাতে তোকে জিততেই হবে!`
    },
    {
      category: "🏡 আব্বু-আম্মুর স্বপ্ন ও হাসি",
      text: `তোর বাবা-মা কত আশা নিয়ে তোকে নিয়ে স্বপ্ন দেখে একবার ভাব তো দোস্ত? কত কষ্ট করে তারা তোকে মানুষ করতেছে। আর তুই নিজের রুমে দরজা বন্ধ করে এসব সস্তা জিনিস দেখতেছিস? তাদের মুখে হাসি ফোটানোর জন্য হলেও তোকে এই অভ্যাসটা ছুড়ে ফেলতে হবে। নিজেকে এমন মানুষ বানা যেন তোর বাবা-মা তোকে নিয়ে বুক ফুলিয়ে গর্ব করতে পারে।`
    },
    {
      category: "📚 নিজের আসল আত্মসম্মান",
      text: `তুই কি এতোই সস্তা ভাই? একটা ৫ ইঞ্চির মোবাইল স্ক্রিন আর টাকার জন্য অভিনয় করা কিছু অচেনা মানুষের ভিডিও তোকে নাচাবে? তোর কি নিজস্ব কোনো নিয়ন্ত্রণ নাই? তুই তোর নিজের জীবনের আসল বস! আজ নিজেকে সামলে প্রমাণ কর যে তুই কাউকে পরোয়া করিস না, তুই তোর নিজের লাইফের হিরো!`
    },
    {
      category: "🚀 ম্যাগনেটিক ভাইব ও এনার্জি",
      text: `তুই যখন নো-ফ্যাপ ধরে রাখবি, নিজের ভেতরে একটা আলাদা তেজ আর কনফিডেন্স পাবি দোস্ত। মানুষের সাথে কথা বলতে গিয়ে সোজা চোখের দিকে তাকিয়ে কথা বলতে পারবি, গলার আওয়াজ ভারী হবে, হাঁটলে একটা স্মার্ট আর রাজকীয় ভাব ফুটে উঠবে। এই অমূল্য শক্তিটা নষ্ট করিস না ভাই, এটা নিজের কাজে লাগা!`
    },
    {
      category: "⏳ 'আজকেই লাস্ট' একটা ধোঁকা",
      text: `দোস্ত, সত্যি করে বলতো—এই 'আজকে লাস্ট' কথাটা তুই আগে কত শ' বার নিজেকে বলছিস? কোনো লাভ হইছে? হয় নাই। কারণ 'লাস্ট' বলে কিছু নাই, যা থামানোর এই এখনই থামাতে হবে। নোংরা ট্যাবগুলা এখনই কেটে দে, হিস্ট্রি ক্লিয়ার কর। দেখবি একটু পরেই তোর নিজের প্রতি একটা আলাদা গর্ব ফিল হবে।`
    },
    {
      category: "❤️ মনের পবিত্রতা ও শান্তি",
      text: `ভেতরটা পরিষ্কার রাখ দোস্ত। যখন তুই খারাপ চিন্তা আর এসব নোংরামি থেকে দূরে থাকবি, তোর মনটা একদম ফুরফুরে আর হালকা লাগবে। রাতে শান্তি মতো সুন্দর ঘুম হবে, কোনো গিল্ট বা পাপবোধ থাকবে না। মন পরিষ্কার থাকলে জীবনে সফলতা এমনিতেই আসবে। বিশ্বাস কর, বুক ভরে শান্তি পাবি!`
    },
    {
      category: "🌱 বাস্তব জীবন বনাম স্ক্রিনের মিথ্যা",
      text: `স্ক্রিনে যা দেখিস ওগুলা সব মিথ্যা নাটক আর ব্যবসার ধান্দা দোস্ত। বাস্তবের সাথে ওইসবের কোনো মিল নাই। বাস্তব জীবনে মানুষের সাথে কথা বল, বন্ধুদের সাথে আড্ডা দে, খোলা আকাশের নিচে হাঁট। একটা সুস্থ, সুন্দর আর বাস্তব জীবনের লক্ষ্যের দিকে ফোকাস কর ভাই!`
    },
    {
      category: "🔥 তোর অরা (Aura) বাড়া দোস্ত",
      text: `দোস্ত, ব্যক্তিত্ব আর গাম্ভীর্যই কিন্তু একটা ছেলের আসল রূপ। তুই যখন নো-ফ্যাপ করবি, মানুষ তোর মধ্যে একটা পাওয়ারফুল আর পজিটিভ ভাইব ফিল করবে। আর আসক্ত থাকলে চেহারা কেমন যেন ভ্যাবাচ্যাকা আর মরা লাগে। নিজের অরা নষ্ট করিস না ভাই, বাঘের মতো গর্জন কর আর নিজের ওপর জয়ী হ!`
    }
  ];

  const handleStartRescueStream = () => {
    // Increment urges count
    const updatedUrges = nofapUrgesCount + 1;
    setNofapUrgesCount(updatedUrges);
    localStorage.setItem('selfx_nofap_urges', String(updatedUrges));

    // Shuffle and pick exactly 3 random messages
    const shuffled = [...RESCUE_MOTIVATIONAL_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    setActiveRescueSessionMessages(selected);
    setRescueStep(0);
    setIsRescueModeActive(true);

    triggerNotification("🚨 Emergency Intervention Started", "Your close friend is here to guide you. Take a deep breath.");

    // Play soothing background music and read first quote
    startNofapRelaxMusic();
    setTimeout(() => {
      if (selected[0]) {
        speakNofapRescueText(selected[0].text);
      }
    }, 400);
  };

  const handleNextRescueStep = () => {
    if (rescueStep < 2) {
      const nextStep = rescueStep + 1;
      setRescueStep(nextStep);
      triggerNotification("📖 Next Advice Ready", "Keep reading, bro. Keep fighting!");

      const nextMsg = activeRescueSessionMessages[nextStep];
      if (nextMsg) {
        speakNofapRescueText(nextMsg.text);
      }
    }
  };

  const handleStopRescueStream = () => {
    setIsRescueModeActive(false);
    setRescueStep(0);
    setActiveRescueSessionMessages([]);

    // Stop music and speech
    stopNofapRelaxMusic();
    
    if (onEarnPoints) {
      onEarnPoints(30, "Conquered extreme urges with emergency friend intervention! 🛡️🔥");
    }
    
    triggerNotification("🛡️ Relapse Prevented!", "অসাধারণ ভাই! তুই নিজেকে নিয়ন্ত্রণ করতে পেরেছিস। সাবাশ যোদ্ধা!", true);
  };

  // Store editing habit IDs
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Custom habit creation form states
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');

  const completedCount = habits.filter(h => h.completed).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100) || 0;

  const handleToggleComplete = (id: string) => {
    let currentlyCompleted = false;
    let habitName = '';
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id === id) {
          currentlyCompleted = !h.completed;
          habitName = h.name;
          return { ...h, completed: currentlyCompleted };
        }
        return h;
      });
      
      // Trigger notification on completion
      if (currentlyCompleted) {
        triggerNotification(`✨ Habit Complete!`, `Completed: ${habitName || 'Habit'}`);
        if (onEarnPoints) {
          onEarnPoints(15, `Completed habit: ${habitName || 'Habit'}! 🔥`);
        }
      }
      return updated;
    });
  };

  const handleStartEdit = (habit: HabitItem) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditDesc(habit.description);
  };

  const handleSaveEdit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        return {
          ...h,
          name: editName.trim() || h.name,
          description: editDesc.trim() || h.description
        };
      }
      return h;
    }));
    setEditingId(null);
  };

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: HabitItem = {
      id: 'custom-' + Date.now(),
      name: newHabitName.trim(),
      description: newHabitDesc.trim() || 'My custom self-care routine habit.',
      completed: false
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
    setNewHabitDesc('');
    setIsAddingCustom(false);
    triggerNotification("🔥 New Habit Added!", `Custom goal: ${newHabit.name} has been added.`);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    triggerNotification("🗑️ Habit Removed", "The custom habit has been successfully removed.");
  };

  const handleCompleteAll = () => {
    setHabits(prev => prev.map(h => ({ ...h, completed: true })));
    triggerNotification("🚀 Absolute Peak lookmaxing unlocked!", "All base habits marked as completed!");
  };

  const handleResetDay = () => {
    setHabits(prev => prev.map(h => ({ ...h, completed: false })));
  };

  return (
    <div id="daily-habits" className="space-y-6 text-left">
      
      {/* COMPREHENSIVE COMBINED NAVIGATION TABS (REPLACED WITH DASHBOARD GRID SECTOR LAUNCHER) */}
      {subTab === 'menu' ? (
        <div className="space-y-6">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-xs font-mono tracking-widest text-zinc-400 uppercase font-black">
              ✦ SELECT HABIT SECTOR TO ACCESS DISCIPLINE PROTOCOLS
            </h2>
            <p className="text-xs text-zinc-500">
              রুটিন ঠিক রাখতে এবং আপনার চরিত্র উন্নত করতে নির্দিষ্ট সেক্টর সিলেক্ট করুন।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { id: 'water', label: 'WATER BASE', desc: 'Fluid retention manager', icon: Droplet, color: 'text-sky-400' },
              { id: 'notes', label: 'NOTES & TO-DOS', desc: 'Task lists & shopping', icon: Bookmark, color: 'text-teal-400' },
              { id: 'nofap', label: 'NO FAP SOLDIER', desc: 'Mind and body purification', icon: Flame, color: 'text-rose-500 font-black' },
              { id: 'love_angel', label: 'LOVE ANGEL', desc: 'Crush memory & advisor', icon: Heart, color: 'text-pink-500 font-black animate-pulse' },
              { id: 'lecture', label: 'LECTURE ROOM', desc: 'Self-Improvement Lectures', icon: GraduationCap, color: 'text-violet-400 font-black animate-pulse' },
              { id: 'settings', label: 'SETTINGS ⚙️', desc: 'Theme & Password Setup', icon: SettingsIcon, color: 'text-zinc-400 font-black' },
              { id: 'secret_vault', label: 'Model 🔒', desc: 'Leader secret model posts', icon: Lock, color: 'text-amber-400 font-black animate-pulse' },
              { id: 'training_roast', label: 'TRAINING ROAST 🔐', desc: 'Secret custom roast trainer', icon: ShieldCheck, color: 'text-rose-400 font-black animate-pulse' }
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSubTab(item.id as any)}
                  className="bg-[#0b0c20]/60 border border-zinc-900/90 hover:border-gold-500/30 p-4 rounded-3xl flex flex-col items-center justify-center gap-3.5 hover:bg-gradient-to-b hover:from-[#111235] hover:to-[#07081a] hover:scale-[1.04] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/5 group text-center aspect-square"
                >
                  <div className={`p-3 rounded-2xl bg-zinc-950/90 border border-zinc-900/60 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-display font-black text-[10.5px] uppercase tracking-wider text-zinc-100 group-hover:text-gold-400 transition-colors block leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-zinc-500 block truncate max-w-[105px] font-mono leading-tight">
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSubTab('menu')}
            className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-2 w-auto inline-flex"
          >
            <span>← Back to Habits Sectors</span>
          </button>

          <AnimatePresence mode="wait">
            {subTab === 'training_roast' && (
              <motion.div
                key="training_roast"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TrainingRoast onClose={() => setSubTab('menu')} />
              </motion.div>
            )}

            {subTab === 'secret_vault' && (
              <motion.div
                key="secret_vault"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SecretModelVault onClose={() => setSubTab('menu')} />
              </motion.div>
            )}

            {subTab === 'love_angel' && (
              <LoveAngelFull
                onClose={() => {
                  setSubTab('menu');
                  try {
                    const saved = localStorage.getItem(getScopedKey('lookmax_crush_list_v2'));
                    if (saved) {
                      const list = JSON.parse(saved);
                      if (Array.isArray(list) && list.length > 0) {
                        const preferred = list.find((c: any) => c && (c.status === 'GF/BF' || c.status === 'Secret Love' || c.status === 'Crush')) || list[0];
                        if (preferred && preferred.name) {
                          setPartnerName(preferred.name);
                        }
                      }
                    }
                  } catch (e) {
                    console.error("Failed to re-sync partner name in DailyHabits onClose", e);
                  }
                }}
              />
            )}

            {subTab === 'lecture' && (
              <motion.div
                key="lecture"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LectureHub onEarnPoints={onEarnPoints || (() => {})} />
              </motion.div>
            )}

            {subTab === 'matrix' && (
              <motion.div
                key="matrix"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Progress bar card */}
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">Daily habits progress (আজকের অগ্রগতি)</h3>
                    <p className="text-xs text-zinc-400">Complete all core rules to achieve absolute peak lookmaxing status!</p>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-mono font-black text-amber-400">{completedCount} / {habits.length} Done</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">Progress: {progressPercent}%</span>
                    </div>
                    <div className="w-32 bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-850 p-[1px]">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Quick controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(true)}
                      className="px-4.5 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-300 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Habit
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteAll}
                      className="px-4.5 py-2 bg-[#111225] hover:bg-[#1a1b3a] border border-[#1c1d3a] hover:border-purple-500/20 text-purple-400 hover:text-purple-300 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all"
                    >
                      Complete All
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDay}
                    className="px-4 py-2 text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Day
                  </button>
                </div>

                {/* Add habit form modal/block if isAddingCustom */}
                {isAddingCustom && (
                  <form onSubmit={handleAddCustomHabit} className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">✍️ Create custom habit (নতুন হ্যাবিট যোগ করুন)</span>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] uppercase font-mono text-zinc-500 block mb-1">Habit Name (কাজের নাম)</label>
                        <input
                          type="text"
                          required
                          value={newHabitName}
                          onChange={(e) => setNewHabitName(e.target.value)}
                          placeholder="e.g. 50 Squats & Calf Raises"
                          className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-700 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-mono text-zinc-500 block mb-1">Description (সংক্ষিপ্ত বিবরণ)</label>
                        <input
                          type="text"
                          value={newHabitDesc}
                          onChange={(e) => setNewHabitDesc(e.target.value)}
                          placeholder="e.g. To boost testosterone and leg strength"
                          className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-700 font-sans"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingCustom(false)}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Create Habit
                      </button>
                    </div>
                  </form>
                )}

                {/* Habits list */}
                <div className="grid gap-3.5">
                  {habits.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                        item.completed
                          ? 'bg-zinc-950/40 border-zinc-900/60 opacity-60'
                          : 'bg-[#111225]/25 border-zinc-900/90 hover:border-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(item.id)}
                          className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            item.completed
                              ? 'bg-amber-400 border-amber-400 text-zinc-950'
                              : 'border-zinc-750 hover:border-amber-500/50'
                          }`}
                        >
                          {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        {editingId === item.id ? (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-[#121214] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-sans focus:outline-none"
                            />
                            <input
                              type="text"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full bg-[#121214] border border-zinc-800 rounded-lg px-3 py-1.5 text-[11px] text-zinc-400 font-sans focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <h4 className={`text-xs font-bold leading-normal ${item.completed ? 'text-zinc-550 line-through' : 'text-zinc-150'}`}>
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal font-sans">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {editingId === item.id ? (
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-350 hover:bg-zinc-900 rounded-xl cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-2 text-zinc-650 hover:text-zinc-400 hover:bg-zinc-900 rounded-xl cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteHabit(item.id)}
                          className="p-2 text-zinc-650 hover:text-red-400 hover:bg-zinc-900 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {subTab === 'water' && (
              <motion.div
                key="water"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <WaterIntake water={water} setWater={setWater} onEarnPoints={onEarnPoints} />
              </motion.div>
            )}

            {subTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <NotesTodo todos={todos} setTodos={setTodos} />
              </motion.div>
            )}

            {(subTab === 'dream_day' || subTab === 'routine') && (
              <motion.div
                key="dream_day"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DreamDay 
                  onEarnPoints={onEarnPoints} 
                  onClose={() => setSubTab('menu')} 
                />
              </motion.div>
            )}

        {subTab === 'nofap' && !isNofapUnlocked && (
          <motion.div
            key="nofap-lock"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto bg-zinc-950 border border-rose-950/40 p-8 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-rose-500/5 rounded-full filter blur-2xl -z-10" />
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-rose-400 font-mono uppercase tracking-widest font-black">🔥 PRIVATE SECURE ZONE</span>
              <h3 className="text-lg font-display font-black text-zinc-100 tracking-tight uppercase">Enter Private Password</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                এই সেকশনটি সম্পূর্ণ ব্যক্তিগত এবং লক করা। প্রবেশ করতে গোপন পাসওয়ার্ডটি লিখুন।
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (nofapPassword === 'atiffap') {
                  setIsNofapUnlocked(true);
                  sessionStorage.setItem('selfx_nofap_unlocked', 'true');
                  setNofapPasswordError(false);
                  triggerNotification("🔓 Unlocked", "গোপন সেকশনটি আনলক করা হয়েছে!");
                } else {
                  setNofapPasswordError(true);
                  triggerNotification("❌ Wrong Password", "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।", true);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <input
                  type="password"
                  value={nofapPassword}
                  onChange={(e) => setNofapPassword(e.target.value)}
                  placeholder="Password..."
                  className={`w-full bg-[#121214] border rounded-xl px-4 py-3.5 text-sm text-center text-zinc-100 focus:outline-none focus:border-rose-500 font-mono tracking-widest ${
                    nofapPasswordError ? 'border-red-500/50 focus:border-red-500/50' : 'border-zinc-850'
                  }`}
                />
                {nofapPasswordError && (
                  <span className="text-[10px] text-red-400 block font-medium">ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড লিখুন।</span>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-950/40"
              >
                Access Protocol
              </button>
            </form>
          </motion.div>
        )}

        {subTab === 'nofap' && isNofapUnlocked && (
          <motion.div
            key="nofap-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header / Streak Stats */}
            <div className="bg-gradient-to-b from-[#1c0d12] to-black border border-rose-950/40 rounded-2xl p-6 md:p-8 text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full filter blur-3xl -z-10" />

              <div className="space-y-1.5 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse mb-1">
                  <Flame className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] text-rose-400 font-mono uppercase tracking-widest font-black">🔥 SELF-DISCIPLINE & VITALITY PROTOCOL</span>
                <h3 className="text-xl font-display font-black text-zinc-100 tracking-tight uppercase">MASCULINE RECOVERY HUB</h3>
                <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                  পর্ন ও হস্তমৈথুনের অলীক বিভ্রম বর্জন করে বাস্তব জীবনে উন্নতি করুন। নিজের ব্যক্তিত্ব এবং স্বাস্থ্য সুরক্ষা করুন।
                </p>
              </div>

              {/* Streak Tracker Section */}
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 max-w-md mx-auto grid grid-cols-3 gap-2 text-center divide-x divide-zinc-900">
                <div>
                  <span className="text-rose-500 text-xl font-mono font-black block">{nofapStreakDays}</span>
                  <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block">DAYS</span>
                </div>
                <div>
                  <span className="text-zinc-200 text-xl font-mono font-black block">{nofapStreakHours}</span>
                  <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block">HOURS</span>
                </div>
                <div>
                  <span className="text-zinc-200 text-xl font-mono font-black block">{nofapStreakMinutes}</span>
                  <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block">MINS</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRelapseConfirm(true)}
                  className="px-4 py-2 text-[10px] bg-zinc-900 hover:bg-red-950/20 border border-zinc-850 hover:border-red-500/20 text-zinc-400 hover:text-red-400 font-mono uppercase font-black rounded-xl transition-all cursor-pointer"
                >
                  ⚠️ Reset Streak
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNofapUnlocked(false);
                    sessionStorage.removeItem('selfx_nofap_unlocked');
                    triggerNotification("🔒 Locked", "No Fap সেকশনটি আবার লক করা হয়েছে।");
                  }}
                  className="px-4 py-2 text-[10px] bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-mono uppercase font-black rounded-xl transition-all cursor-pointer"
                >
                  🔒 Lock Section
                </button>
              </div>
            </div>

            {/* EMERGENCY INTERVENTION SECTION: I CAN'T CONTROL MYSELF */}
            <div id="nofap-rescue-panel" className="bg-zinc-950 border border-rose-950/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-rose-500/5 rounded-full filter blur-2xl -z-10" />

              {!isRescueModeActive ? (
                <div className="text-center space-y-4 py-4">
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">দোস্ত, খারাপ কোনো চিন্তা বা কন্ট্রোল হারাচ্ছিস?</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      মাথা গরম লাগলে বা কোনো নোংরা ইচ্ছা জাগলে এক সেকেন্ডও দেরি করবি না। নিচের লাল বাটনে চাপ দে—তোর বন্ধু তোকে ঠান্ডা করে সঠিক রাস্তায় রাখবে।
                    </p>
                  </div>
                  <button
                    id="btn-rescue-start"
                    type="button"
                    onClick={handleStartRescueStream}
                    className="w-full max-w-sm py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:via-rose-500 hover:to-red-600 text-white text-sm font-black uppercase rounded-2xl transition-all cursor-pointer shadow-lg shadow-red-950/60 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 mx-auto animate-pulse"
                  >
                    <Flame className="w-5 h-5 animate-bounce text-yellow-400" />
                    🔥 দোস্ত, আমি নিজেকে সামলাতে পারছি না (Help Me Bro!)
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Streaming Header */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-[10px] text-rose-400 font-mono uppercase tracking-widest font-black animate-pulse">🚨 জরুরি মুহূর্তে তোর বন্ধুর বার্তা</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Step {rescueStep + 1} of 3</span>
                  </div>

                  {/* Step indicators */}
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          idx <= rescueStep ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-zinc-900'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Message card */}
                  <AnimatePresence mode="wait">
                    {activeRescueSessionMessages[rescueStep] && (
                      <motion.div
                        key={rescueStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="p-5 md:p-6 rounded-2xl border border-rose-500/10 bg-gradient-to-br from-zinc-950 via-[#18090d]/50 to-zinc-950 text-left space-y-4 shadow-xl"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded-full font-mono">
                            {activeRescueSessionMessages[rescueStep].category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 leading-relaxed font-sans font-medium">
                          {activeRescueSessionMessages[rescueStep].text}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        stopNofapRelaxMusic();
                        setIsRescueModeActive(false);
                      }}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl text-[10px] font-bold uppercase cursor-pointer"
                    >
                      এখন ভালো লাগছে দোস্ত
                    </button>
                    {rescueStep < 2 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setRescueStep(prev => prev + 1);
                        }}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer flex items-center gap-1.5"
                      >
                        পরের টিপস ➜
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          stopNofapRelaxMusic();
                          setIsRescueModeActive(false);
                          onEarnPoints?.(10, 'Conquered lust urge');
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer"
                      >
                        আমি শক্ত হয়ে গেছি! (+10 XP)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Rotating Guidance and Tips */}
            <div className="bg-zinc-950 border border-rose-950/20 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="text-[10px] text-rose-400 font-mono uppercase tracking-widest font-black">📖 Daily Guidance Panel</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAdviceIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/15">
                      {ADVOCACY_MESSAGES[currentAdviceIndex]?.category || 'General'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Advice {currentAdviceIndex + 1} of {ADVOCACY_MESSAGES.length}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-zinc-100 leading-snug">
                    {ADVOCACY_MESSAGES[currentAdviceIndex]?.title}
                  </h3>

                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {ADVOCACY_MESSAGES[currentAdviceIndex]?.bengaliText}
                  </p>

                  <div className="p-4 rounded-xl bg-black/60 border border-rose-950/20 space-y-2">
                    <span className="text-[9px] font-mono text-rose-400 font-extrabold uppercase tracking-widest block">🎯 ACTION PROTOCOL (বাস্তব পদক্ষেপ):</span>
                    <p className="text-[10.5px] text-zinc-400 leading-normal">
                      {ADVOCACY_MESSAGES[currentAdviceIndex]?.actionableTip}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-zinc-900/60 mt-4">
                {/* Dot Indicators */}
                <div className="flex items-center gap-1.5">
                  {ADVOCACY_MESSAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentAdviceIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        i === currentAdviceIndex ? 'bg-rose-500 w-3' : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextAdvice}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-rose-950/40 active:scale-95"
                >
                  📖 Read Next Advice (পরবর্তী উপদেশ) ➜
                </button>
              </div>
            </div>

            {/* Emergency Urge Tips Overlay / Modals */}
            <AnimatePresence>
              {showUrgeTips && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-950 border border-amber-500/30 max-w-md w-full p-6 rounded-2xl shadow-2xl text-left space-y-4"
                  >
                    <div className="flex items-center gap-2.5 text-amber-400">
                      <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                      <h4 className="font-display font-black text-sm uppercase tracking-wider">🚨 CONQUER THE LUST DEMONS</h4>
                    </div>
                    
                    <div className="text-xs text-zinc-300 leading-relaxed space-y-2.5">
                      <p className="font-extrabold text-zinc-100">
                        Stay strong, champ! Don&apos;t exchange 10 seconds of weakness for days of guilt and depleted energy.
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
                        <li><strong className="text-amber-300">Cold Water Shock</strong>: Wash your face or take a cold shower immediately to reset your nervous system.</li>
                        <li><strong className="text-amber-300">Drop and Give 20</strong>: Do 20 pushups or squat jumps right now to pump blood back to your muscles.</li>
                        <li><strong className="text-amber-300">Room Change</strong>: Walk out of the current room or put your phone across the table.</li>
                        <li><strong className="text-amber-300">Real-Life Focus</strong>: Remember, your final goal is to looksmax and build healthy, real-world relationships, not satisfy screen addictions.</li>
                      </ul>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowUrgeTips(false)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold-500 text-zinc-950 font-black text-xs uppercase rounded-xl cursor-pointer"
                      >
                        I Conquered The Urge!
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {showRelapseConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-950 border border-red-500/30 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-left space-y-4"
                  >
                    <div className="flex items-center gap-2.5 text-red-500">
                      <AlertTriangle className="w-6 h-6" />
                      <h4 className="font-display font-black text-sm uppercase tracking-wider">⚠️ CONFIRM STREAK RESET?</h4>
                    </div>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Are you sure you want to reset your streak? Honest self-tracking is the foundation of growth. If you relapsed, reset now and stand tall again. There is no shame in rising after a fall.
                    </p>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowRelapseConfirm(false)}
                        className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl text-xs font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleResetNofapStreak}
                        className="px-4.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                      >
                        Reset Streak
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {subTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* SETTINGS MAIN CONTAINER */}
            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-6">
              <div className="border-b border-zinc-900 pb-4">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">⚙️ APP CONFIGURATION & SETTINGS</h3>
                <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                  পাসওয়ার্ড সুরক্ষা ও সালাত ট্র্যাকার ইমেজ কাস্টমাইজেশন কনফিগারেশন।
                </p>
              </div>

              {/* PRAYER PHOTO UPLOAD SECTION (FAITH TRACKER WALLPAPERS) */}
              <div className="space-y-4 pb-6 border-b border-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <span>🕌 Custom Prayer Wallpapers & Photos</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                      পাঁচ ওয়াক্ত নামাজ ও তাহাজ্জুদের জন্য আপনার পছন্দের ছবি আপলোড করুন যা সালাত ট্র্যাকারে প্রদর্শিত হবে।
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                    6 Prayer Slots
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { key: 'fajr', label: 'Fajr (ফজর)', defaultTime: '04:15 AM' },
                    { key: 'zohor', label: 'Dhuhr (যোহর)', defaultTime: '01:15 PM' },
                    { key: 'achr', label: 'Asr (আসর)', defaultTime: '04:30 PM' },
                    { key: 'magrib', label: 'Maghrib (মাগরিব)', defaultTime: '06:35 PM' },
                    { key: 'esha', label: 'Isha (এশা)', defaultTime: '08:00 PM' },
                    { key: 'tahajjud', label: 'Tahajjud (তাহাজ্জুদ)', defaultTime: '03:15 AM' }
                  ].map((item) => {
                    const customImg = prayerPhotos[item.key];
                    const inputId = `prayer_upload_${item.key}`;

                    return (
                      <div
                        key={item.key}
                        className="p-3 rounded-2xl bg-[#0e0e16] border border-zinc-850 flex flex-col gap-2.5 relative group hover:border-amber-500/40 transition-all"
                      >
                        <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                          {customImg ? (
                            <img
                              src={customImg}
                              alt={item.label}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-1 p-2 text-center">
                              <FileImage className="w-6 h-6 text-zinc-500" />
                              <span className="text-[9px] font-mono text-zinc-500">Default Photo</span>
                            </div>
                          )}
                          {customImg && (
                            <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-black text-[8px] font-mono font-bold">
                              CUSTOM
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-200">{item.label}</span>
                            <span className="text-[9px] font-mono text-zinc-500">{item.defaultTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-auto pt-1">
                          <label
                            htmlFor={inputId}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] text-center cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            <span>{customImg ? 'Change' : 'Upload'}</span>
                          </label>
                          <input
                            id={inputId}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadPrayerPhoto(item.key, file);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />

                          {customImg && (
                            <button
                              type="button"
                              onClick={() => handleResetPrayerPhoto(item.key)}
                              className="p-1.5 rounded-xl bg-zinc-850 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
                              title="Reset to default"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* EXPLICIT SAVE BUTTON FOR PRAYER PHOTOS */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAllPrayerPhotos}
                    disabled={isSavingPrayerPhotos}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                      hasUnsavedPrayerPhotos 
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] border border-amber-300' 
                        : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750'
                    }`}
                  >
                    {isSavingPrayerPhotos ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                        <span>ওয়াক্তের ছবিগুলো সংরক্ষণ করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">সব ওয়াক্তের ছবি সেভ করুন (Save All Prayer Photos)</span>
                        {hasUnsavedPrayerPhotos && (
                          <span className="px-2 py-0.5 rounded-full bg-black/30 text-black text-[10px] font-mono uppercase tracking-wider font-bold">
                            Unsaved
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center mt-2 font-mono">
                    ছবি আপলোড বা পরিবর্তনের পর এই সেভ বাটনে ক্লিক করলে তা স্থায়ীভাবে সংরক্ষিত হবে এবং Faith Duty-তে প্রদর্শিত হবে।
                  </p>
                </div>
              </div>

              {/* ACCOUNT SECURITY (PASSWORD UPDATE) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">🔒 Password & Privacy Control (পাসওয়ার্ড সেটিংস)</h4>
                
                {hasLegacyPassword ? (
                  // IF LEGACY PASSWORD ALREADY EXISTS (User wants to change it)
                  <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 max-w-md">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Old Password (বর্তমান পাসওয়ার্ড)</label>
                        <input
                          type="password"
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                          className="w-full bg-[#121214] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-150 focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">New Password (নতুন পাসওয়ার্ড)</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="নতুন পাসওয়ার্ড লিখুন"
                          className="w-full bg-[#121214] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-150 focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Confirm New Password (পাসওয়ার্ড নিশ্চিত করুন)</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
                          className="w-full bg-[#121214] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-150 focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                    </div>

                    {passwordMsg.text && (
                      <p className={`text-[11px] font-sans font-medium ${passwordMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                        {passwordMsg.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Change Password
                    </button>
                  </form>
                ) : (
                  // IF NO PASSWORD EXISTS YET (Legacy Account setup)
                  <form onSubmit={handlePasswordSetupSubmit} className="space-y-4 max-w-md">
                    <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl text-amber-400 text-xs font-sans leading-relaxed">
                      ⚠️ আপনি ইতিপূর্বে কোনো পাসওয়ার্ড সেট করেননি। একটি পাসওয়ার্ড সেট করে আপনার প্রোফাইল সুরক্ষিত করুন যাতে পরবর্তী লগইনে কেউ আপনার ডাটা দেখতে না পারে।
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">New Password (নতুন পাসওয়ার্ড)</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="একটি পাসওয়ার্ড দিন"
                          className="w-full bg-[#121214] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-150 focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Confirm Password (পাসওয়ার্ড নিশ্চিত করুন)</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="পাসওয়ার্ড আবার লিখুন"
                          className="w-full bg-[#121214] border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-150 focus:outline-none focus:border-amber-500 font-sans"
                        />
                      </div>
                    </div>

                    {passwordMsg.text && (
                      <p className={`text-[11px] font-sans font-medium ${passwordMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                        {passwordMsg.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Setup Security Password
                    </button>
                  </form>
                )}
              </div>

              {/* HOME SCREEN WIDGET & OFFLINE HUB SECTION */}
              <div className="pt-4 border-t border-zinc-900 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Smartphone className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">📱 Home Screen Widget & Offline Hub (হোম স্ক্রিন উইজেট)</h4>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  আপনার মোবাইল স্ক্রীনে টু-ডু রুটিন চার্ট সরাসরি পিন করুন যাতে প্রতিদিন ইন্টারনেট ছাড়াই সহজে কাজ সম্পন্ন করে টিক দেওয়া যায়।
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('selfx-open-add-to-homescreen'));
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-zinc-950 font-black text-xs uppercase cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-98 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>➕ Add to Home Screen (হোম স্ক্রিনে অ্যাড করুন)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('selfx-open-widget-hub'));
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-2 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>📱 Add Widgets (উইজেট গ্যালারি ও অফলাইন হাব)</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )}
</div>
  );
}
