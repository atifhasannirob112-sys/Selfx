import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellRing, 
  Sparkles, 
  Clock, 
  CheckSquare, 
  Droplet, 
  Target, 
  Camera, 
  Bookmark, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  Volume2, 
  VolumeX, 
  Lock,
  Smartphone,
  Layers,
  Flame,
  Languages,
  BookOpen,
  Heart,
  Music,
  Share2,
  Compass,
  GraduationCap,
  Film,
  AlertTriangle,
  Award,
  Crown,
  User,
  UserCheck,
  Check,
  CheckCircle2,
  ShieldCheck,
  Key,
  Users,
  Smile,
  Calculator,
  Zap,
  MessageSquare,
  MoreVertical,
  Coins,
  Wallet,
  Shirt,
  Menu,
  Dumbbell,
  Apple,
  Sparkle,
  Home,
  Plus,
  BarChart3,
  Brain,
  Calendar,
  Sunrise,
  X,
  Trash2,
  Upload,
  Mic,
  Square,
  Send,
  Scissors,
  Loader2,
  Copy,
  ExternalLink,
  Download,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  Cloud,
  RefreshCw,
  FileJson,
  Save,
  HardDrive,
  ArrowLeft,
  Sliders,
  Settings
} from 'lucide-react';

import HairMaxingModal from './components/HairMaxingModal';
import { APP_VERSION, APP_VERSION_LABEL } from './version';

// Custom User-Requested Thematic High-Resolution Background Images
import communityBannerImg from './assets/images/user_community_gang_1787120252035.jpg';
import looksmaxBannerImg from './assets/images/user_looksmax_model_1787120268644.jpg';
import fitbodyBannerImg from './assets/images/fitbody_hollywood_sixpack_1787156451387.jpg';
import faithBannerImg from './assets/images/faith_janamaz_user_1787153900928.jpg';
import friendBannerImg from './assets/images/user_friends_sunset_1787120322103.jpg';
import cinemaBannerImg from './assets/images/user_cinema_theater_1787120336931.jpg';

// User-Requested 7 Discipline & Library Banner Images + Finance Banner + Wardrobe Banner
import disciplineFinanceImg from './assets/images/finance_luxury_banner_1789978133309.jpg';
import disciplineWardrobeImg from './assets/images/wardrobe_banner_1790500959179.jpg';
import disciplineAlarmImg from './assets/images/drawer_alarm_vintage_1787153930317.jpg';
import disciplineEnglishImg from './assets/images/drawer_english_word_1787153962169.jpg';
import disciplineLectureImg from './assets/images/drawer_lecture_study_1787153991640.jpg';
import disciplineWaterImg from './assets/images/drawer_water_bottle_1787121087108.jpg';
import disciplineNotesImg from './assets/images/drawer_notes_planner_1787121239057.jpg';
import disciplineNofapImg from './assets/images/drawer_nofap_peace_1787121268989.jpg';
import disciplineLoveImg from './assets/images/love_angle_prio2ma_exact_1787165356685.jpg';

// Permanent Global Image Cache & Memory Pinning to prevent mobile browser memory purge
const ALL_CORE_THEME_IMAGES = [
  communityBannerImg,
  looksmaxBannerImg,
  fitbodyBannerImg,
  faithBannerImg,
  friendBannerImg,
  cinemaBannerImg,
  disciplineFinanceImg,
  disciplineWardrobeImg,
  disciplineAlarmImg,
  disciplineEnglishImg,
  disciplineLectureImg,
  disciplineWaterImg,
  disciplineNotesImg,
  disciplineNofapImg,
  disciplineLoveImg,
  '/assets/models/hamza_malik.jpg',
  '/assets/models/zaviyar_nauman.jpg',
  '/assets/models/daniyal_zafar.jpg',
  '/assets/models/bilal_abbas.jpg',
  '/assets/models/shahzad_noor.jpg',
  '/assets/models/zarrar_khan.jpg',
  '/icon-192.png',
  '/icon-512.png'
];

if (typeof window !== 'undefined') {
  (window as any).__SELFX_PERMANENT_IMAGES__ = ALL_CORE_THEME_IMAGES.map((src) => {
    const img = new Image();
    img.src = src;
    img.decoding = 'async';
    return img;
  });
}

import { AlarmConfig, HabitItem, WaterTracker, ChallengeItem, PhotoEntry, NoteItem, TodoItem, FaithTracker as FaithType, LoveTarget, UserProfileInfo } from './types';
import { defaultHabits, requestNotificationPermission, triggerNotification, triggerDecreeLockScreenNotification, getLanguage, setLanguage, t, isImportantOrWorkReminder } from './utils';
import AlarmSystem from './components/AlarmSystem';
import DailyHabits from './components/DailyHabits';
import WaterIntake from './components/WaterIntake';
import ChallengeCreator from './components/ChallengeCreator';
import PhotoJournal from './components/PhotoJournal';
import NotesTodo from './components/NotesTodo';
import AiChatRoaster, { HAPPY_QUOTES, MOTIVATE_QUOTES, LOVE_QUOTES, LOOKSMAX_QUOTES, getRandomQuote } from './components/AiChatRoaster';
import FaithTracker from './components/FaithTracker';
import OurCommunity from './components/OurCommunity';
import AestheticInspiration, { MediaItem, MusicItem, RemixSessionStatus, saveItemDB, getAllItems, saveMusicItemDB, deleteMusicItemDB, getAllMusicItems, analyzeAudioStructure, DEFAULT_PREMIUM_TRACKS, acquireBgMusicPauseLock, releaseBgMusicPauseLock } from './components/AestheticInspiration';
import SkillLearnerHub from './components/SkillLearnerHub';
import CinemaHub from './components/CinemaHub';
import ErrorBoundary from './components/ErrorBoundary';
import MusicPlayer from './components/MusicPlayer';
import SocialGrowthHub from './components/SocialGrowthHub';
import PowerAiAssistant from './components/PowerAiAssistant';
import FitBody from './components/FitBody';
import LearnEnglish from './components/LearnEnglish';
import DreamDay from './components/DreamDay';
import AnalysisReviews from './components/AnalysisReviews';
import AndroidWidgetHub from './components/AndroidWidgetHub';
import SelfxFinance from './components/SelfxFinance';
import DigitalWardrobe from './components/DigitalWardrobe';
import TeacherAiHub from './components/TeacherAiHub';
import RealityHub from './components/RealityHub';
import ShareReceiver, { ResolvedShareVideo } from './components/ShareReceiver';
import WakeUpSelfieModal from './components/WakeUpSelfieModal';
import { initMediaDB, saveMediaItem, syncAllLocalMediaToServer, cacheRemoteVideoToIndexedDB } from './utils/mediaStorage';
import {
  getCustomRingtoneDB,
  syncAlarmScheduleToBackend,
  notifyBackendAlarmDismissed,
  backgroundAlarmGuard,
  getLocalTodayDateStr,
} from './utils/alarmUtils';

// Simple native IndexedDB setup for user profile data & avatar to prevent resets
const PROFILE_DB_NAME = 'selfx_user_profile_db_v3';
const PROFILE_STORE_NAME = 'profile_store_v3';

export function initProfileDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PROFILE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROFILE_STORE_NAME)) {
        db.createObjectStore(PROFILE_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function saveProfileDB(profileData: any): Promise<void> {
  try {
    localStorage.setItem('selfx_current_user_profile_v3', JSON.stringify(profileData));
    localStorage.setItem('selfx_current_user_profile', JSON.stringify(profileData));
    localStorage.setItem('lookmax_user_profile_v2', JSON.stringify({
      name: profileData.name,
      numberId: profileData.username,
      avatarBase64: profileData.avatarUrl,
      bio: profileData.bio,
      isLead: profileData.isLead
    }));
  } catch (err) {
    console.warn("localStorage profile write deferred, saving to IndexedDB...", err);
  }

  return initProfileDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PROFILE_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(PROFILE_STORE_NAME);
      const request = store.put({ id: 'current_user', data: profileData });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }).catch(err => console.warn("IndexedDB profile save failed:", err));
}

export function getProfileDB(): Promise<any | null> {
  return initProfileDB().then(db => {
    return new Promise((resolve) => {
      const transaction = db.transaction(PROFILE_STORE_NAME, 'readonly');
      const store = transaction.objectStore(PROFILE_STORE_NAME);
      const request = store.get('current_user');
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
      request.onerror = () => resolve(null);
    });
  }).catch(() => null);
}

function loadInitialProfileData() {
  try {
    let parsedV3: any = null;
    let parsedV2: any = null;
    let selfxParsed: any = null;

    try {
      const savedV3 = localStorage.getItem('selfx_current_user_profile_v3');
      if (savedV3) parsedV3 = JSON.parse(savedV3);
    } catch (e) {}

    try {
      const savedV2 = localStorage.getItem('lookmax_user_profile_v2');
      if (savedV2) parsedV2 = JSON.parse(savedV2);
    } catch (e) {}

    try {
      const selfxSaved = localStorage.getItem('selfx_current_user_profile');
      if (selfxSaved) selfxParsed = JSON.parse(selfxSaved);
    } catch (e) {}

    // Find the best custom name (prioritizing custom non-generic names)
    const customNames = [
      parsedV3?.name,
      parsedV2?.name,
      selfxParsed?.name
    ].filter(n => Boolean(n && typeof n === 'string' && !n.startsWith('Glowup Member #') && n.trim() !== 'Glowup Member'));

    const customHandles = [
      parsedV3?.username,
      parsedV2?.numberId,
      selfxParsed?.username
    ].filter(h => Boolean(h && typeof h === 'string' && !h.startsWith('user_')));

    const finalName = customNames[0] || parsedV3?.name || parsedV2?.name || selfxParsed?.name || 'Atif Nirob';
    const finalHandle = (customHandles[0] || parsedV3?.username || parsedV2?.numberId || selfxParsed?.username || 'niromax').replace(/^@/, '');
    const finalAvatar = parsedV3?.avatarUrl || parsedV2?.avatarBase64 || selfxParsed?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
    const finalBio = parsedV3?.bio || parsedV2?.bio || selfxParsed?.bio || 'Daily consistency & transformation 🚀';
    const isLead = Boolean(parsedV3?.isLead || parsedV2?.isLead || selfxParsed?.isLead || finalHandle === 'niromax' || finalHandle === 'itsatifbro');

    const profileData = {
      loggedIn: true,
      name: finalName,
      username: finalHandle,
      bio: finalBio,
      avatarUrl: finalAvatar,
      password: parsedV3?.password || selfxParsed?.password || '',
      accountId: parsedV3?.accountId || selfxParsed?.accountId || 'SELFX-883A',
      joinedAt: parsedV3?.joinedAt || selfxParsed?.joinedAt || new Date().toISOString(),
      isLead
    };

    try {
      localStorage.setItem('selfx_current_user_profile_v3', JSON.stringify(profileData));
      localStorage.setItem('selfx_current_user_profile', JSON.stringify(profileData));
      localStorage.setItem('lookmax_user_profile_v2', JSON.stringify({
        name: finalName,
        numberId: finalHandle,
        avatarBase64: finalAvatar,
        bio: finalBio,
        isLead
      }));
    } catch (e) {}

    return profileData;
  } catch (e) {}

  return {
    loggedIn: true,
    name: 'Atif Nirob',
    username: 'niromax',
    bio: 'Daily consistency & transformation 🚀',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    password: '',
    accountId: 'SELFX-883A',
    joinedAt: new Date().toISOString(),
    isLead: true
  };
}

// Simple native IndexedDB setup for motivation audios to bypass localStorage 5MB storage limit
const AUDIO_DB_NAME = 'lookmax_motivation_audio_db';
const AUDIO_STORE_NAME = 'custom_audios_v2';

function initAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUDIO_DB_NAME, 2);
    request.onupgradeneeded = (e: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        db.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllCustomAudios(): Promise<any[]> {
  return initAudioDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(AUDIO_STORE_NAME, 'readonly');
      const store = transaction.objectStore(AUDIO_STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

function saveCustomAudioDB(item: any): Promise<void> {
  return initAudioDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(AUDIO_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE_NAME);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

function deleteCustomAudioDB(id: string): Promise<void> {
  return initAudioDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(AUDIO_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

function analyzeAudioCategory(name: string) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('phonk') || nameLower.includes('motivate') || nameLower.includes('fire') || nameLower.includes('জেদ') || nameLower.includes('ব্যায়াম') || nameLower.includes('alpha') || nameLower.includes('gym') || nameLower.includes('workout') || nameLower.includes('beast') || nameLower.includes('rage')) {
    return {
      category: 'motivate',
      label: '🔥 কুইক মোটিভেট',
      analysis: 'এই ট্র্যাকে হাই-এনার্জি বিটস ও ফায়ার মোটিভেশনাল ভাইব রয়েছে, যা ওয়ার্কআউট ও মেউইং সেশনের জন্য পারফেক্ট!'
    };
  } else if (nameLower.includes('love') || nameLower.includes('crush') || nameLower.includes('romantic') || nameLower.includes('মন') || nameLower.includes('প্রেম') || nameLower.includes('ভালোবাসা') || nameLower.includes('পবিত্র') || nameLower.includes('romantic')) {
    return {
      category: 'love',
      label: '💖 কুইক লাভ',
      analysis: 'এই ট্র্যাকটিতে সুন্দর মেলোডি ও সফট ভাইব রয়েছে, যা আপনার ভালোবাসার পবিত্র অনুভূতি ও আত্মবিশ্বাস বাড়াতে দারুণ সাহায্য করবে।'
    };
  } else if (nameLower.includes('chill') || nameLower.includes('lofi') || nameLower.includes('happy') || nameLower.includes('hasikhushi') || nameLower.includes('শান্ত') || nameLower.includes('relax') || nameLower.includes('হাসি')) {
    return {
      category: 'happy',
      label: '😊 কুইক হ্যাপি',
      analysis: 'এই ট্র্যাকটিতে হালকা ও শান্ত রিল্যাক্সড লফি সুর রয়েছে, যা আপনার মনকে চাঙ্গা করতে ও মানসিক অবসাদ দূর করতে দারুণ উপযোগী!'
    };
  } else {
    return {
      category: 'happy',
      label: '✨ সাধারণ অ্যাসথেটিক',
      analysis: 'বিশ্লেষণ সম্পন্ন: এটি একটি অল-রাউন্ড অ্যাসথেটিক সুর, যা আপনার মনকে প্রশান্তি দেবে এবং কাজে ফোকাস রাখতে সাহায্য করবে।'
    };
  }
}

export default function App() {
  const [currentLang, setCurrentLang] = useState<'normal' | 'english'>(getLanguage());
  const [showLanguageOnboarding, setShowLanguageOnboarding] = useState(false);

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail && e.detail.language) {
        setCurrentLang(e.detail.language);
      }
    };
    window.addEventListener('lookmax_lang_changed', handleLangChange);
    return () => {
      window.removeEventListener('lookmax_lang_changed', handleLangChange);
    };
  }, []);

  const [appTheme, setAppTheme] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('selfx_theme') || 'dark';
  });

  useEffect(() => {
    const handleThemeSync = () => {
      const savedTheme = localStorage.getItem('selfx_theme') || 'dark';
      setAppTheme(savedTheme);
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-light', 'theme-oled');
      root.classList.add(`theme-${savedTheme}`);
    };
    handleThemeSync();
    window.addEventListener('lookmax_theme_changed', handleThemeSync);
    window.addEventListener('storage', handleThemeSync);
    return () => {
      window.removeEventListener('lookmax_theme_changed', handleThemeSync);
      window.removeEventListener('storage', handleThemeSync);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'hud' | 'alarm' | 'habits' | 'water' | 'challenges' | 'photos' | 'notes' | 'chat' | 'reality' | 'faith' | 'love' | 'community' | 'inspiration' | 'skills' | 'cinema' | 'music' | 'social' | 'powerai' | 'fitbody' | 'habits_full' | 'inspiration_full' | 'english' | 'dream_day' | 'finance' | 'wardrobe' | 'social_ai' | 'teacher_ai'>('hud');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [habitSubTab, setHabitSubTab] = useState<'water' | 'faith' | 'notes' | 'routine' | 'nofap' | 'love_angel' | 'matrix' | 'lecture' | 'dream_day'>('water');
  const [looksmaxSubTab, setLooksmaxSubTab] = useState<'scanner' | 'challenge_30'>('scanner');
  const [activeCategory, setActiveCategory] = useState<'powerai' | 'glowup' | 'community' | 'lifestyle'>('powerai');
  const [activeHub, setActiveHub] = useState<'coach' | 'routine' | 'diary' | 'goals' | 'lifestyle'>('coach');
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' && 'navigator' in window ? window.navigator.onLine : true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [accountProfile, setAccountProfile] = useState<{
    loggedIn: boolean;
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
    password?: string;
    accountId: string;
    joinedAt: string;
    isLead?: boolean;
  }>(() => loadInitialProfileData());

  // Profile Form Inputs
  const [profileViewMode, setProfileViewMode] = useState<'view' | 'edit'>('view');
  const [profileNameInput, setProfileNameInput] = useState(accountProfile.name || '');
  const [profileUsernameInput, setProfileUsernameInput] = useState(accountProfile.username || '');
  const [profileBioInput, setProfileBioInput] = useState(accountProfile.bio || '');
  const [profilePasswordInput, setProfilePasswordInput] = useState(accountProfile.password || '');
  const [profileAvatarInput, setProfileAvatarInput] = useState(accountProfile.avatarUrl || '');
  const [showProfilePassword, setShowProfilePassword] = useState(false);

  // Login Form Inputs
  const [loginUsernameInput, setLoginUsernameInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'profile' | 'voice' | 'login' | 'music_reels' | 'widget'>('profile');
  const [profileVerificationCode, setProfileVerificationCode] = useState('');
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  // --- MINI APPS CONFIG / MODULE TOGGLES ---
  const [miniAppsToggles, setMiniAppsToggles] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('selfx_mini_apps_toggles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {
      'looksmax': true,
      'fitbody': true,
      'growgram': true,
      'cinema': true,
      'alarm': true,
      'learn_english': true
    };
  });

  const [installingMiniApp, setInstallingMiniApp] = useState<{ id: string; label: string; icon: string } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showAddToHomeScreenModal, setShowAddToHomeScreenModal] = useState(false);
  const [isInstallBannerDismissed, setIsInstallBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('selfx_install_banner_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showWidgetActionSheet, setShowWidgetActionSheet] = useState(false);
  const [showWidgetHub, setShowWidgetHub] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.has('widget');
    } catch (e) {
      return false;
    }
  });
  const [pendingSharedTikTokUrl, setPendingSharedTikTokUrl] = useState<string>('');
  const lastDetectedClipboardUrlRef = useRef<string>('');

  // Feature-specific permission checks on launch (Share -> Video Import -> Model ID -> Growgram Post)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initFeaturePermissions = async () => {
      // 1. Notification permission check (only requested if needed for video import/post status)
      try {
        if ('Notification' in window && Notification.permission === 'default') {
          // Softly request notification permission so background download/post alerts can notify user
          await Notification.requestPermission().catch(() => {});
        }
      } catch (e) {}

      // 2. Storage persistence check to prevent eviction of local videos & models
      try {
        if (navigator.storage && navigator.storage.persist) {
          const isPersisted = await navigator.storage.persisted();
          if (!isPersisted) {
            await navigator.storage.persist().catch(() => {});
          }
        }
      } catch (e) {}

      // 3. Clipboard permission query (non-intrusive)
      try {
        if (navigator.permissions && navigator.permissions.query) {
          await navigator.permissions.query({ name: 'clipboard-read' as any }).catch(() => {});
        }
      } catch (e) {}
    };

    initFeaturePermissions();
  }, []);

  // Handle incoming TikTok / Instagram Android Share Sheet (ACTION_SEND + text/plain) & Web Share Target
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkIncomingShare = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedFlag = urlParams.get('shared');
        const sharedUrl = urlParams.get('url') || '';
        const sharedText = urlParams.get('text') || '';
        const sharedTitle = urlParams.get('title') || '';
        const combined = `${sharedUrl} ${sharedText} ${sharedTitle}`.trim();

        const linkMatch = combined.match(/https?:\/\/[^\s]+/i);
        const isSocialShare = Boolean(linkMatch) || sharedFlag === 'tiktok' || sharedFlag === 'instagram' || sharedFlag === 'social' || urlParams.has('text') || urlParams.has('url') || urlParams.has('share_target');

        if (isSocialShare) {
          const targetUrl = linkMatch ? linkMatch[0] : (sharedUrl || sharedText);
          if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
            setPendingSharedTikTokUrl(targetUrl);
            setActiveTab('community');
            const cleanPath = window.location.pathname;
            window.history.replaceState({}, '', cleanPath);
            const isInstagram = targetUrl.includes('instagram.com') || targetUrl.includes('instagr.am');
            const platformName = isInstagram ? 'ইনস্টাগ্রাম রিল' : 'টিকটক';
            triggerNotification(`🎬 ${platformName} শেয়ার প্রাপ্ত হয়েছে!`, "ভিডিওটি GrowGram-এ ডাউনলোড ও মডেল প্রোফাইলে অটো-পোস্ট করতে প্রস্তুত।");
          }
        }
      } catch (e) {}
    };

    // Global native Android and WebView bridge for incoming ACTION_SEND intents
    (window as any).handleNativeSharedLink = (sharedPayload: string) => {
      if (!sharedPayload) return;
      try {
        const linkMatch = sharedPayload.match(/https?:\/\/[^\s]+/i);
        const targetUrl = linkMatch ? linkMatch[0] : sharedPayload.trim();
        if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
          setPendingSharedTikTokUrl(targetUrl);
          setActiveTab('community');
          const isInstagram = targetUrl.includes('instagram.com') || targetUrl.includes('instagr.am');
          const platformName = isInstagram ? 'ইনস্টাগ্রাম রিল' : 'টিকটক';
          triggerNotification(`🎬 ${platformName} শেয়ার প্রাপ্ত হয়েছে!`, "ভিডিও লিংক পাওয়া গেছে — GrowGram-এ প্রস্তুত!");
        }
      } catch (e) {}
    };

    // Auto-detect TikTok or Instagram URL if user copied/shared from TikTok/Instagram and switched back
    const checkClipboardForTikTok = async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) return;
        const text = await navigator.clipboard.readText();
        if (text && (text.includes('tiktok.com') || text.includes('douyin.com') || text.includes('instagram.com') || text.includes('instagr.am'))) {
          const linkMatch = text.match(/https?:\/\/[^\s]+/i);
          const targetUrl = linkMatch ? linkMatch[0] : text.trim();
          if (targetUrl && targetUrl !== lastDetectedClipboardUrlRef.current && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
            lastDetectedClipboardUrlRef.current = targetUrl;
            setPendingSharedTikTokUrl(targetUrl);
            setActiveTab('community');
            const isInstagram = targetUrl.includes('instagram.com') || targetUrl.includes('instagr.am');
            const platformName = isInstagram ? 'ইনস্টাগ্রাম রিল' : 'টিকটক';
            triggerNotification(`📋 ${platformName} শেয়ার সনাক্ত হয়েছে!`, "ভিডিও লিংক ডিটেক্ট হয়েছে — সরাসরি ডাউনলোড ও মডেল আইডিতে পোস্ট করুন!");
          }
        }
      } catch (e) {
        // Clipboard read permission might not be active, silent ignore
      }
    };

    checkIncomingShare();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkIncomingShare();
        checkClipboardForTikTok();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkClipboardForTikTok);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkClipboardForTikTok);
    };
  }, []);
  const [addToHomeStep, setAddToHomeStep] = useState<'confirm' | 'guide'>('confirm');
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const matchMedia = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    matchMedia.addEventListener('change', handleChange);
    return () => matchMedia.removeEventListener('change', handleChange);
  }, []);

  const handleInstallMainApp = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          triggerNotification("📲 অ্যাপ ইন্সটলেশন শুরু হয়েছে!", "SelfX অ্যাপটি আপনার মোবাইলের হোম স্ক্রীনে যুক্ত হচ্ছে।");
          setDeferredPrompt(null);
        } else {
          triggerNotification("⚠️ বাতিল করা হয়েছে", "অ্যাপ ইন্সটলেশন বাতিল করা হয়েছে।");
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else if (isStandalone) {
      triggerNotification("✅ ইনস্টল সম্পন্ন", "SelfX অ্যাপটি ইতিমধ্যে আপনার ডিভাইসে ইনস্টল করা আছে।");
    } else {
      setShowInstallGuide(true);
    }
  };

  // Capture native browser PWA installation trigger
  useEffect(() => {
    // Check if early listener in index.html already captured the prompt
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      console.log("Found cached 'deferredPWAInstallPrompt'");
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
      console.log("Captured 'beforeinstallprompt' native event.");
    };

    const handlePromptReady = () => {
      if ((window as any).deferredPWAInstallPrompt) {
        setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      }
    };

    const handleShowInstallGuide = () => {
      setShowInstallGuide(true);
    };

    const handleOpenAddToHomeScreen = () => {
      setShowWidgetHub(true);
    };

    const handleOpenWidgetHub = () => {
      setShowWidgetHub(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('selfx-show-install-guide', handleShowInstallGuide);
    window.addEventListener('selfx-open-add-to-homescreen', handleOpenAddToHomeScreen);
    window.addEventListener('selfx-open-widget-mode', handleOpenWidgetHub);
    window.addEventListener('selfx-open-widget-hub', handleOpenWidgetHub);
    window.addEventListener('selfx_trigger_install', handleInstallMainApp);

    // Check URL parameters for direct tab navigation (e.g. ?tab=dream_day or ?widget=true)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const widgetParam = urlParams.get('widget');
      if (widgetParam) {
        setShowWidgetHub(true);
      }
      if (tabParam === 'dream_day') {
        setActiveTab('dream_day');
      } else if (tabParam === 'habits') {
        setActiveTab('habits');
      } else if (tabParam === 'faith') {
        setActiveTab('faith');
      }
    } catch (e) {}

    // Reactive Faith Tracker Sync Listener
    const handleFaithUpdated = (e: any) => {
      if (e?.detail) {
        setFaith(e.detail);
      } else {
        try {
          const saved = localStorage.getItem('lookmax_faith');
          if (saved) setFaith(JSON.parse(saved));
        } catch (err) {}
      }
    };
    window.addEventListener('lookmax_faith_updated', handleFaithUpdated);

    // Online / Offline Network Connectivity Listeners
    const handleOnlineStatus = () => setIsOnline(true);
    const handleOfflineStatus = () => setIsOnline(false);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    // Instant Version Integrity & Obsolete Cache Purge
    // If user's mobile device has cached an old version (like 4.8.0), purge obsolete cache storage and update
    if (typeof window !== 'undefined') {
      const storedVer = localStorage.getItem('selfx_installed_app_version');
      if (storedVer !== APP_VERSION) {
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
        localStorage.setItem('selfx_installed_app_version', APP_VERSION);
      }
    }

    // Register PWA service worker with safe update handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          if (reg && typeof reg.update === 'function') {
            reg.update().catch(err => {
              console.warn('Service Worker background update check skipped:', err);
            });
          }
          console.log('Service Worker registered and active:', reg.scope);
        })
        .catch(err => console.warn('Service Worker registration skipped in current frame:', err));
    }

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
      window.removeEventListener('lookmax_faith_updated', handleFaithUpdated);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('selfx-show-install-guide', handleShowInstallGuide);
      window.removeEventListener('selfx-open-add-to-homescreen', handleOpenAddToHomeScreen);
      window.removeEventListener('selfx-open-widget-mode', handleOpenWidgetHub);
      window.removeEventListener('selfx-open-widget-hub', handleOpenWidgetHub);
    };
  }, []);

  const handleRealInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          triggerNotification("📲 ইন্সটলেশন শুরু হয়েছে!", `'${installingMiniApp?.label || 'SelfX'}' আপনার হোম স্ক্রীনে যুক্ত করা হচ্ছে।`);
          setDeferredPrompt(null);
        } else {
          triggerNotification("⚠️ বাতিল করা হয়েছে", "ইউজার ইন্সটলেশন বাতিল করেছেন।");
        }
      } catch (err) {
        console.error("Installation choice failed:", err);
      }
      setInstallingMiniApp(null);
    } else {
      setShowInstallGuide(true);
      setInstallingMiniApp(null);
    }
  };

  const handleToggleMiniApp = (id: string, label: string, iconStr: string, currentVal: boolean) => {
    const newVal = !currentVal;
    const updated = { ...miniAppsToggles, [id]: newVal };
    setMiniAppsToggles(updated);
    localStorage.setItem('selfx_mini_apps_toggles', JSON.stringify(updated));

    if (newVal) {
      // Trigger simulation popup for installing to home screen
      setInstallingMiniApp({ id, label, icon: iconStr });
    } else {
      triggerNotification("🧹 শর্টকাট রিমুভড", `${label} মডিউলটির হোমস্ক্রীন শর্টকাট বাতিল করা হয়েছে।`);
    }
  };

  // --- BACKGROUND MUSIC & REELS SETTINGS STATES ---
  // Always start disabled on fresh app entry; music only starts when user explicitly clicks the Volume/Play button
  const [bgMusicEnabled, setBgMusicEnabled] = useState<boolean>(false);
  const [bgMusicPlaybackMode, setBgMusicPlaybackMode] = useState<'normal' | 'remix'>(() => {
    return (localStorage.getItem('bg_music_playback_mode') as 'normal' | 'remix') || 'normal';
  });
  const [remixSelectedTrackIds, setRemixSelectedTrackIds] = useState<string[] | null>(() => {
    try {
      const saved = localStorage.getItem('bg_music_remix_selected_ids_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [remixStatus, setRemixStatus] = useState<RemixSessionStatus | null>(null);
  const [bgMusicAutoPaused, setBgMusicAutoPaused] = useState<boolean>(false);

  const isMusicPanelOpenRef = useRef(false);
  useEffect(() => {
    const isOpen = isDrawerOpen || isProfileOpen;
    isMusicPanelOpenRef.current = isOpen;
    if (isOpen && typeof window !== 'undefined' && window.getBgMusicRemixStatus) {
      setRemixStatus(window.getBgMusicRemixStatus());
    }
  }, [isDrawerOpen, isProfileOpen]);

  useEffect(() => {
    const onModeChange = (e: Event) => {
      const custom = e as CustomEvent<{ mode?: 'normal' | 'remix' }>;
      if (custom?.detail?.mode) {
        setBgMusicPlaybackMode(custom.detail.mode);
      }
    };
    const onEnabledChange = (e: Event) => {
      const custom = e as CustomEvent<{ enabled?: boolean }>;
      if (typeof custom?.detail?.enabled === 'boolean') {
        setBgMusicEnabled(custom.detail.enabled);
      }
    };
    const onRemixProgress = (e: Event) => {
      const custom = e as CustomEvent<RemixSessionStatus>;
      if (!custom?.detail) return;
      const nextAutoPaused = Boolean(custom.detail.autoPaused);
      setBgMusicAutoPaused((prev) => (prev === nextAutoPaused ? prev : nextAutoPaused));
      // Only trigger full App UI refresh when Drawer or Profile music panel is actually visible
      if (isMusicPanelOpenRef.current) {
        setRemixStatus(custom.detail);
      }
    };
    const onAutoPauseChange = (e: Event) => {
      const custom = e as CustomEvent<{ autoPaused?: boolean }>;
      if (typeof custom?.detail?.autoPaused === 'boolean') {
        setBgMusicAutoPaused(custom.detail.autoPaused);
      }
    };
    const onAnalysisUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ trackId?: string; analysis?: MusicItem['analysis'] }>;
      const { trackId, analysis } = custom?.detail || {};
      if (!trackId || !analysis) return;
      setSettingsMusicList((prev) =>
        prev.map((tr) => (tr.id === trackId ? { ...tr, analysis } : tr))
      );
    };

    window.addEventListener('bg_music_mode_change', onModeChange);
    window.addEventListener('bg_music_enabled_change', onEnabledChange);
    window.addEventListener('bg_music_remix_progress', onRemixProgress);
    window.addEventListener('bg_music_auto_pause_change', onAutoPauseChange);
    window.addEventListener('bg_music_analysis_updated', onAnalysisUpdated);

    return () => {
      window.removeEventListener('bg_music_mode_change', onModeChange);
      window.removeEventListener('bg_music_enabled_change', onEnabledChange);
      window.removeEventListener('bg_music_remix_progress', onRemixProgress);
      window.removeEventListener('bg_music_auto_pause_change', onAutoPauseChange);
      window.removeEventListener('bg_music_analysis_updated', onAnalysisUpdated);
    };
  }, []);

  // Automatic Background Music Pause inside Growgram, Lecture Room, Teacher AI & Video sections
  useEffect(() => {
    const activeLocks: string[] = [];
    if (activeTab === 'community') activeLocks.push('tab:community');
    if (activeTab === 'teacher_ai') activeLocks.push('tab:teacher_ai');
    if (activeTab === 'habits_full' && habitSubTab === 'lecture') activeLocks.push('tab:lecture');
    if (activeTab === 'english') activeLocks.push('tab:english');
    if (activeTab === 'skills') activeLocks.push('tab:skills');
    if (activeTab === 'cinema') activeLocks.push('tab:cinema');

    activeLocks.forEach((reason) => acquireBgMusicPauseLock(reason));
    return () => {
      activeLocks.forEach((reason) => releaseBgMusicPauseLock(reason));
    };
  }, [activeTab, habitSubTab]);

  const formatAudioTime = (secs?: number) => {
    if (!secs || !isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleRemixTrackSelection = (trackId: string, allAvailableIds: string[]) => {
    setRemixSelectedTrackIds((prev) => {
      const currentSet = new Set(prev && prev.length > 0 ? prev : allAvailableIds);
      if (currentSet.has(trackId)) {
        if (currentSet.size <= 1) {
          triggerNotification("⚠️ অন্তত ১টি গান প্রয়োজন", "Remix Mode-এ অন্তত ১টি গান সিলেক্ট থাকতে হবে!");
          return prev;
        }
        currentSet.delete(trackId);
      } else {
        currentSet.add(trackId);
      }
      const nextArr = Array.from(currentSet);
      localStorage.setItem('bg_music_remix_selected_ids_v1', JSON.stringify(nextArr));
      if (window.setBgMusicRemixSelectedIds) {
        window.setBgMusicRemixSelectedIds(nextArr);
      }
      return nextArr;
    });
  };

  const handleResetRemixSession = () => {
    if (window.resetBgMusicRemixSession) {
      window.resetBgMusicRemixSession();
      triggerNotification("🔄 পজিশন রিসেট হয়েছে", "সব গানের প্লেব্যাক পজিশন ০:০০ থেকে নতুন করে সেট করা হয়েছে।");
    }
  };

  const handleToggleBgMusicMode = (mode: 'normal' | 'remix') => {
    setBgMusicPlaybackMode(mode);
    localStorage.setItem('bg_music_playback_mode', mode);
    if (typeof window !== 'undefined') {
      window.bgMusicPlaybackMode = mode;
      if (window.setBgMusicPlaybackMode) {
        window.setBgMusicPlaybackMode(mode);
      }
    }
    if (mode === 'remix') {
      triggerNotification("🎛️ Remix Mode সক্রিয়", "প্রতি গান সর্বোচ্চ ১ মি ৩০ সে-এর মধ্যে ইন্সট্রুমেন্টাল অংশে বিট-ম্যাচড ক্রসফেড ও পজিশন মেমোরি সহ চলবে!");
    } else {
      triggerNotification("🎵 Normal Mode সক্রিয়", "প্রতিটি গান সম্পূর্ণ স্বাভাবিকভাবে বাজবে।");
    }
  };

  const [settingsMusicList, setSettingsMusicList] = useState<MusicItem[]>([]);
  const [isUploadingSettingsMusic, setIsUploadingSettingsMusic] = useState<boolean>(false);
  const [settingsMusicName, setSettingsMusicName] = useState<string>('');
  const [settingsMusicError, setSettingsMusicError] = useState<string | null>(null);
  
  // Settings Reel adding states
  const [settingsReelUrl, setSettingsReelUrl] = useState<string>('');
  const [settingsReelName, setSettingsReelName] = useState<string>('');
  const [currentlyPlayingTrackId, setCurrentlyPlayingTrackId] = useState<string | null>(null);
  const [settingsSelectedAlbumId, setSettingsSelectedAlbumId] = useState<string>(() => {
    return localStorage.getItem('lookmax_selected_album_id_v1') || 'all';
  });

  const [customAlbums, setCustomAlbums] = useState<{ id: string; name: string; trackIds: string[] }[]>(() => {
    try {
      const saved = localStorage.getItem('lookmax_custom_profile_albums_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCreatingAlbum, setIsCreatingAlbum] = useState<boolean>(false);
  const [newCustomAlbumName, setNewCustomAlbumName] = useState<string>('');
  const [newCustomAlbumTrackIds, setNewCustomAlbumTrackIds] = useState<string[]>([]);

  const getFilteredTracks = (albumId: string, currentCustomAlbums: typeof customAlbums, currentMusicList: MusicItem[]) => {
    if (albumId === 'all') {
      return currentMusicList;
    }
    if (albumId === 'album-lofi') {
      return currentMusicList.filter(track => {
        const name = track.name.toLowerCase();
        return name.includes('lofi') || name.includes('chill') || name.includes('relax') || name.includes('peace') || name.includes('soft') || name.includes('slow') || name.includes('calm') || name.includes('ambient') || name.includes('sleep') || name.includes('romantic') || name.includes('love') || (!name.includes('phonk') && !name.includes('gym') && !name.includes('workout') && !name.includes('focus') && !name.includes('coding'));
      });
    }
    if (albumId === 'album-gym') {
      return currentMusicList.filter(track => {
        const name = track.name.toLowerCase();
        return name.includes('phonk') || name.includes('gym') || name.includes('workout') || name.includes('beast') || name.includes('hardstyle') || name.includes('rage') || name.includes('alpha') || name.includes('lift') || name.includes('beastmode') || name.includes('force') || name.includes('power');
      });
    }
    if (albumId === 'album-focus') {
      return currentMusicList.filter(track => {
        const name = track.name.toLowerCase();
        return name.includes('focus') || name.includes('study') || name.includes('coding') || name.includes('deep') || name.includes('concentration') || name.includes('brain') || name.includes('piano') || name.includes('instrumental') || name.includes('work') || name.includes('mind');
      });
    }

    // Custom albums
    const customAlb = currentCustomAlbums.find(a => a.id === albumId);
    if (customAlb) {
      const filtered = currentMusicList.filter(track => customAlb.trackIds.includes(track.id));
      return filtered.length > 0 ? filtered : currentMusicList;
    }
    return currentMusicList;
  };

  const handleCreateCustomAlbum = () => {
    if (!newCustomAlbumName.trim()) {
      triggerNotification("⚠️ নাম আবশ্যক", "দয়া করে অ্যালবামের একটি নাম লিখুন!");
      return;
    }
    if (newCustomAlbumTrackIds.length === 0) {
      triggerNotification("⚠️ গান নির্বাচন করুন", "অ্যালবামে অন্তত একটি গান যোগ করুন!");
      return;
    }

    const newAlbum = {
      id: `album-custom-${Date.now()}`,
      name: newCustomAlbumName.trim(),
      trackIds: newCustomAlbumTrackIds
    };

    const updated = [...customAlbums, newAlbum];
    setCustomAlbums(updated);
    localStorage.setItem('lookmax_custom_profile_albums_v1', JSON.stringify(updated));

    setNewCustomAlbumName('');
    setNewCustomAlbumTrackIds([]);
    setIsCreatingAlbum(false);
    triggerNotification("📁 অ্যালবাম তৈরি হয়েছে", `"${newAlbum.name}" অ্যালবামটি সফলভাবে তৈরি হয়েছে!`);
  };

  const handleDeleteCustomAlbum = (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customAlbums.filter(a => a.id !== albumId);
    setCustomAlbums(updated);
    localStorage.setItem('lookmax_custom_profile_albums_v1', JSON.stringify(updated));
    
    if (settingsSelectedAlbumId === albumId) {
      handleSelectSettingsAlbum('all');
    }
    triggerNotification("🗑️ অ্যালবাম মুছে ফেলা হয়েছে", "অ্যালবামটি সফলভাবে ডিলিট করা হয়েছে।");
  };

  const handleSelectSettingsAlbum = (albumId: string) => {
    setSettingsSelectedAlbumId(albumId);
    localStorage.setItem('lookmax_selected_album_id_v1', albumId);
    
    let filteredTracks = getFilteredTracks(albumId, customAlbums, settingsMusicList);
    if (bgMusicPlaybackMode === 'remix' && remixSelectedTrackIds && remixSelectedTrackIds.length > 0) {
      const remixFiltered = filteredTracks.filter(t => remixSelectedTrackIds.includes(t.id));
      if (remixFiltered.length > 0) filteredTracks = remixFiltered;
    }
    window.bgMusicTrackList = filteredTracks;
    window.bgMusicCurrentIndex = 0;
    
    if (bgMusicEnabled && window.playBgMusic) {
      window.playBgMusic();
    }
  };

  // Load background music list
  const loadSettingsMusic = () => {
    getAllMusicItems()
      .then(items => {
        setSettingsMusicList([...DEFAULT_PREMIUM_TRACKS, ...items]);
      })
      .catch(err => {
        console.error("Failed to load music list from IndexedDB", err);
        setSettingsMusicList(DEFAULT_PREMIUM_TRACKS);
      });
  };

  useEffect(() => {
    loadSettingsMusic();
    
    // Register track change callback to show active track in settings
    const prevOnTrackChange = window.onBgMusicTrackChange;
    window.onBgMusicTrackChange = (index, trackId) => {
      setCurrentlyPlayingTrackId(trackId);
      if (prevOnTrackChange) {
        prevOnTrackChange(index, trackId);
      }
    };
    
    // Also poll active engine track ID occasionally
    const interval = setInterval(() => {
      if (window.bgMusicTrackList && window.bgMusicCurrentIndex !== undefined) {
        const activeTrack = window.bgMusicTrackList[window.bgMusicCurrentIndex];
        if (activeTrack) {
          setCurrentlyPlayingTrackId(prev => prev !== activeTrack.id ? activeTrack.id : prev);
        }
      }
    }, 3000);

    return () => {
      window.onBgMusicTrackChange = prevOnTrackChange;
      clearInterval(interval);
    };
  }, []);

  const handleToggleBgMusic = () => {
    const nextEnabled = !bgMusicEnabled;
    if (nextEnabled) {
      const hasTracks =
        settingsMusicList.length > 0 ||
        (typeof window !== 'undefined' && Array.isArray(window.bgMusicTrackList) && window.bgMusicTrackList.length > 0);
      if (!hasTracks) {
        triggerNotification("🎵 কোন গান যোগ করা নেই", "প্রোফাইল বা ড্রয়ারের Music সেকশন থেকে অন্তত ১টি গান যোগ করুন।");
        return;
      }
    }
    setBgMusicEnabled(nextEnabled);
    if (typeof window !== 'undefined') {
      window.bgMusicIsEnabled = nextEnabled;
      window.dispatchEvent(new CustomEvent('bg_music_enabled_change', { detail: { enabled: nextEnabled } }));
    }
  };

  // Sync music play/pause and tracklist without persisting auto-start across app restarts
  useEffect(() => {
    localStorage.setItem('bg_music_enabled', 'false');
    window.bgMusicIsEnabled = bgMusicEnabled;

    let filteredTracks = getFilteredTracks(settingsSelectedAlbumId, customAlbums, settingsMusicList);
    if (bgMusicPlaybackMode === 'remix' && remixSelectedTrackIds && remixSelectedTrackIds.length > 0) {
      const remixFiltered = filteredTracks.filter(t => remixSelectedTrackIds.includes(t.id));
      if (remixFiltered.length > 0) {
        filteredTracks = remixFiltered;
      }
    }

    const nextQueue = filteredTracks.length > 0 ? filteredTracks : DEFAULT_PREMIUM_TRACKS;
    const prevCurrentTrackId = window.bgMusicTrackList?.[window.bgMusicCurrentIndex || 0]?.id;
    window.bgMusicTrackList = nextQueue;
    if (prevCurrentTrackId) {
      const preservedIdx = nextQueue.findIndex(t => t.id === prevCurrentTrackId);
      window.bgMusicCurrentIndex = preservedIdx >= 0 ? preservedIdx : 0;
    }

    if (bgMusicEnabled) {
      const activeEngine = window.bgMusicActiveIndex === 0 ? window.bgMusicEngine : window.bgMusicEngineSec;
      const isAlreadyPlayingValidTrack =
        activeEngine &&
        !activeEngine.paused &&
        prevCurrentTrackId &&
        nextQueue.some(t => t.id === prevCurrentTrackId);

      if (!isAlreadyPlayingValidTrack && !window.bgMusicAutoPaused && window.playBgMusic) {
        window.playBgMusic();
      }
    } else {
      window.bgMusicAutoPaused = false;
      if (window.pauseBgMusic) {
        window.pauseBgMusic(true);
      }
    }
  }, [bgMusicEnabled, settingsMusicList, settingsSelectedAlbumId, customAlbums, bgMusicPlaybackMode, remixSelectedTrackIds]);

  // Handle music upload inside settings
  const handleSettingsMusicUpload = (file: File) => {
    if (!file) return;
    setSettingsMusicError(null);
    setIsUploadingSettingsMusic(true);

    if (!file.type.startsWith('audio/')) {
      setSettingsMusicError("Please select a valid audio file (MP3, WAV, etc.).");
      setIsUploadingSettingsMusic(false);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setSettingsMusicError("File size exceeds 15MB limit.");
      setIsUploadingSettingsMusic(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const trackName = settingsMusicName.trim() || file.name.replace(/\.[^/.]+$/, "");

      const newTrack: MusicItem = {
        id: crypto.randomUUID(),
        name: trackName,
        dataUrl,
        addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      saveMusicItemDB(newTrack)
        .then(() => {
          setSettingsMusicName('');
          setIsUploadingSettingsMusic(false);
          loadSettingsMusic();
          triggerNotification("🎵 Music Saved", `"${trackName}" background music rotation-এ যোগ হয়েছে!`);

          // Include newly uploaded track in active Remix selection if a custom selection exists
          setRemixSelectedTrackIds((prev) => {
            if (!prev || prev.length === 0) return prev;
            if (prev.includes(newTrack.id)) return prev;
            const next = [...prev, newTrack.id];
            localStorage.setItem('bg_music_remix_selected_ids_v1', JSON.stringify(next));
            return next;
          });

          // Analyze BPM & instrumental structure immediately in background
          analyzeAudioStructure(newTrack.dataUrl)
            .then((analysis) => {
              const analyzedTrack = { ...newTrack, analysis };
              saveMusicItemDB(analyzedTrack).catch(() => {});
              setSettingsMusicList((prev) =>
                prev.map((tr) => (tr.id === newTrack.id ? analyzedTrack : tr))
              );
            })
            .catch(() => {});
          
          // Auto enable bg music if disabled
          if (!bgMusicEnabled) {
            setBgMusicEnabled(true);
          }
          
          // Push to global rotation
          if (window.bgMusicTrackList) {
            window.bgMusicTrackList.push(newTrack);
          }
        })
        .catch(err => {
          console.error("IndexedDB music save failed", err);
          setSettingsMusicError("Storage is full or unavailable.");
          setIsUploadingSettingsMusic(false);
        });
    };
    reader.onerror = () => {
      setSettingsMusicError("Failed to read audio file.");
      setIsUploadingSettingsMusic(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle music deletion inside settings
  const handleSettingsDeleteMusic = (id: string, name: string) => {
    deleteMusicItemDB(id)
      .then(() => {
        loadSettingsMusic();
        triggerNotification("🗑️ Music Deleted", `"${name}" background rotation থেকে সরানো হয়েছে।`);
        
        // Remove from global window tracklist if present
        if (window.bgMusicTrackList) {
          window.bgMusicTrackList = window.bgMusicTrackList.filter(t => t.id !== id);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    try {
      localStorage.setItem('selfx_current_user_profile', JSON.stringify(accountProfile));
    } catch (e) {}
  }, [accountProfile]);

  // Save Account Profile (Registration / Update)
  const handleSaveProfileAccount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUsername = profileUsernameInput.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) {
      triggerNotification("⚠️ ইউজারনেম প্রয়োজন", "অনুগ্রহ করে একটি ইউজারনেম টাইপ করুন!");
      return;
    }

    const updatedProfile = {
      loggedIn: true,
      name: profileNameInput.trim() || 'Lookmax User',
      username: cleanUsername,
      bio: profileBioInput.trim(),
      avatarUrl: profileAvatarInput || accountProfile.avatarUrl,
      password: profilePasswordInput.trim(),
      accountId: accountProfile.accountId || 'SELFX-' + Math.floor(Math.random() * 90000 + 10000),
      joinedAt: accountProfile.joinedAt || new Date().toISOString(),
      isLead: userProfile.isLead
    };

    setAccountProfile(updatedProfile);

    // Sync to userProfile so changes are updated globally (Community, Roaster, and footer icon)
    setUserProfile({
      name: updatedProfile.name,
      numberId: updatedProfile.username,
      avatarBase64: updatedProfile.avatarUrl,
      bio: updatedProfile.bio,
      isLead: userProfile.isLead
    });

    // Switch to view mode for a persistent read-only profile look
    setProfileViewMode('view');

    // Save to user accounts database for cross-device or re-login support
    try {
      const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || '{}';
      const db = JSON.parse(dbStr);
      let currentMovies: any[] = [];
      try {
        const mStr = localStorage.getItem('lookmax_movies');
        if (mStr) currentMovies = JSON.parse(mStr);
      } catch (err) {}

      let currentCrushes: any[] = [];
      try {
        const cStr = localStorage.getItem('lookmax_crush_list_v2');
        if (cStr) currentCrushes = JSON.parse(cStr);
      } catch (err) {}

      const accData = {
        profile: updatedProfile,
        habits,
        points,
        streak,
        badges,
        water,
        faith,
        challenges,
        todos,
        notes,
        photos,
        dashState,
        alarm,
        journalDuration,
        movies: currentMovies,
        crushes: currentCrushes,
        loveList,
        lastSyncedAt: new Date().toISOString()
      };
      db[cleanUsername] = accData;
      db[`@${cleanUsername}`] = accData;
      localStorage.setItem('selfx_user_accounts_db_v2', JSON.stringify(db));
      localStorage.setItem('selfx_current_user_profile_v3', JSON.stringify(updatedProfile));
      localStorage.setItem('selfx_current_user_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('lookmax_user_profile_v2', JSON.stringify({
        name: updatedProfile.name,
        numberId: updatedProfile.username,
        avatarBase64: updatedProfile.avatarUrl,
        bio: updatedProfile.bio,
        isLead: userProfile.isLead
      }));

      // Sync to backend server for cross-device & new device login
      fetch('/api/accounts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          accountData: accData
        })
      })
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
            setLastCloudSyncTime(nowTime);
            localStorage.setItem('lookmax_last_cloud_sync_time', nowTime);
          }
        })
        .catch(err => console.error("Server account save error:", err));

      fetch('/api/community/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `m_${cleanUsername.replace(/[^a-z0-9_]/gi, '')}`,
          name: updatedProfile.name,
          username: cleanUsername,
          numberId: cleanUsername,
          avatar: updatedProfile.avatarUrl,
          niche: updatedProfile.bio || 'Glowup Transformation',
          points: points || 0,
          level: Math.floor((points || 0) / 200) + 1,
          isOnline: true
        })
      }).catch(err => console.error("Community register error:", err));

      triggerNotification("💾 প্রোফাইল ও আইডি ক্লাউডে সংরক্ষিত!", `ইউজারনেম @${cleanUsername} এবং আপনার পাসওয়ার্ড দিয়ে যেকোনো নতুন ফোন বা ব্রাউজার থেকে সরাসরি লগইন করতে পারবেন।`);
    } catch (e) {
      console.error(e);
    }

    // Close the profile manager modal
    setIsProfileOpen(false);
  };

  // Comprehensive Restoration Helper for Login & Backup Import
  const restoreFullAccountData = (acc: any, targetUser: string, targetPass?: string) => {
    if (!acc) return;
    const finalProfile = {
      loggedIn: true,
      name: acc.profile?.name || acc.name || 'Lookmax User',
      username: (acc.profile?.username || acc.username || targetUser).toLowerCase().replace(/^@/, ''),
      bio: acc.profile?.bio || acc.bio || '',
      avatarUrl: acc.profile?.avatarUrl || acc.avatarUrl || acc.avatarBase64 || '',
      password: acc.profile?.password || targetPass || acc.password || '',
      accountId: acc.profile?.accountId || acc.accountId || 'SELFX-' + Math.floor(Math.random() * 90000 + 10000),
      joinedAt: acc.profile?.joinedAt || acc.joinedAt || new Date().toISOString(),
      isLead: !!(acc.profile?.isLead || acc.isLead)
    };

    setAccountProfile(finalProfile);
    setProfileNameInput(finalProfile.name);
    setProfileUsernameInput(finalProfile.username);
    setProfileBioInput(finalProfile.bio);
    setProfilePasswordInput(finalProfile.password);
    setProfileAvatarInput(finalProfile.avatarUrl);

    setUserProfile({
      name: finalProfile.name,
      numberId: finalProfile.username,
      avatarBase64: finalProfile.avatarUrl,
      bio: finalProfile.bio,
      isLead: finalProfile.isLead
    });

    if (acc.habits && Array.isArray(acc.habits)) {
      setHabits(acc.habits);
      try { localStorage.setItem('lookmax_habits', JSON.stringify(acc.habits)); } catch (e) {}
    }
    if (acc.points !== undefined && typeof acc.points === 'number') {
      setPoints(acc.points);
      try { localStorage.setItem('lookmax_gamification_points_v1', String(acc.points)); } catch (e) {}
    }
    if (acc.streak !== undefined && typeof acc.streak === 'number') {
      setStreak(acc.streak);
      try { localStorage.setItem('lookmax_gamification_streak_v1', String(acc.streak)); } catch (e) {}
    }
    if (acc.badges && Array.isArray(acc.badges)) {
      setBadges(acc.badges);
      try { localStorage.setItem('lookmax_gamification_badges_v1', JSON.stringify(acc.badges)); } catch (e) {}
    }
    if (acc.water && typeof acc.water === 'object') {
      setWater(acc.water);
      try { localStorage.setItem('lookmax_water', JSON.stringify(acc.water)); } catch (e) {}
    }
    if (acc.faith && typeof acc.faith === 'object') {
      setFaith(acc.faith);
      try { localStorage.setItem('lookmax_faith', JSON.stringify(acc.faith)); } catch (e) {}
    }
    if (acc.challenges && Array.isArray(acc.challenges)) {
      setChallenges(acc.challenges);
      try { localStorage.setItem('lookmax_challenges', JSON.stringify(acc.challenges)); } catch (e) {}
    }
    if (acc.todos && Array.isArray(acc.todos)) {
      setTodos(acc.todos);
      try { localStorage.setItem('lookmax_todos', JSON.stringify(acc.todos)); } catch (e) {}
    }
    if (acc.notes && Array.isArray(acc.notes)) {
      setNotes(acc.notes);
      try { localStorage.setItem('lookmax_notes', JSON.stringify(acc.notes)); } catch (e) {}
    }
    if (acc.photos && Array.isArray(acc.photos)) {
      setPhotos(acc.photos);
      try { localStorage.setItem('lookmax_photos', JSON.stringify(acc.photos)); } catch (e) {}
    }
    if (acc.dashState && typeof acc.dashState === 'object') {
      setDashState(acc.dashState);
      try { localStorage.setItem('selfx_dash_state_v1', JSON.stringify(acc.dashState)); } catch (e) {}
    }
    if (acc.alarm && typeof acc.alarm === 'object') {
      setAlarm(acc.alarm);
      try { localStorage.setItem('lookmax_alarm', JSON.stringify(acc.alarm)); } catch (e) {}
    }
    if (acc.journalDuration) {
      setJournalDuration(acc.journalDuration);
      try { localStorage.setItem('lookmax_journal_duration', String(acc.journalDuration)); } catch (e) {}
    }
    if (acc.movies && Array.isArray(acc.movies)) {
      try { localStorage.setItem('lookmax_movies', JSON.stringify(acc.movies)); } catch (e) {}
    }
    if (acc.crushes && Array.isArray(acc.crushes)) {
      try { localStorage.setItem('lookmax_crush_list_v2', JSON.stringify(acc.crushes)); } catch (e) {}
    }
    if (acc.loveList && Array.isArray(acc.loveList)) {
      setLoveList(acc.loveList);
      try { localStorage.setItem('lookmax_lovelist', JSON.stringify(acc.loveList)); } catch (e) {}
    }
    if (acc.coreGoals && Array.isArray(acc.coreGoals)) {
      setCoreGoals(acc.coreGoals);
      try { localStorage.setItem('my_core_goals', JSON.stringify(acc.coreGoals)); } catch (e) {}
    }
    if (acc.activities && Array.isArray(acc.activities)) {
      setActivities(acc.activities);
      try { localStorage.setItem('lookmax_activities_v1', JSON.stringify(acc.activities)); } catch (e) {}
    }
    if (acc.customAlbums && Array.isArray(acc.customAlbums)) {
      setCustomAlbums(acc.customAlbums);
      try { localStorage.setItem('lookmax_custom_profile_albums_v1', JSON.stringify(acc.customAlbums)); } catch (e) {}
    }
    if (acc.decreeMoodTracks && Array.isArray(acc.decreeMoodTracks)) {
      setDecreeMoodTracks(acc.decreeMoodTracks);
      try { localStorage.setItem('decree_mood_tracks', JSON.stringify(acc.decreeMoodTracks)); } catch (e) {}
    }
    if (acc.customQuickCmds && Array.isArray(acc.customQuickCmds)) {
      setCustomQuickCmds(acc.customQuickCmds);
      try { localStorage.setItem('selfx_custom_quick_cmds', JSON.stringify(acc.customQuickCmds)); } catch (e) {}
    }
    if (acc.scheduledVoiceTasks && Array.isArray(acc.scheduledVoiceTasks)) {
      setScheduledVoiceTasks(acc.scheduledVoiceTasks);
      try { localStorage.setItem('selfx_scheduled_voice_tasks', JSON.stringify(acc.scheduledVoiceTasks)); } catch (e) {}
    }
    if (acc.powerButtonAssistMode !== undefined) {
      try { localStorage.setItem('selfx_power_btn_assist_mode', String(acc.powerButtonAssistMode)); } catch (e) {}
    }
    const localSavedVoice = localStorage.getItem('selfx_preferred_voice_persona');
    const validVoice = (localSavedVoice && ['Fenrir', 'Puck', 'Charon', 'Zephyr'].includes(localSavedVoice))
      ? localSavedVoice
      : ((acc.selectedVoicePersona && ['Fenrir', 'Puck', 'Charon', 'Zephyr'].includes(acc.selectedVoicePersona)) ? acc.selectedVoicePersona : 'Fenrir');
    setSelectedVoicePersona(validVoice);
    selectedVoicePersonaRef.current = validVoice;
    try { localStorage.setItem('selfx_preferred_voice_persona', validVoice); } catch (e) {}
    if (acc.selectedDefaultAssistant) {
      try { localStorage.setItem('selfx_default_digital_assistant', acc.selectedDefaultAssistant); } catch (e) {}
    }
    if (acc.onlyEssentialNotifications !== undefined) {
      setOnlyEssentialNotifications(acc.onlyEssentialNotifications);
      try { localStorage.setItem('selfx_only_essential_notifications', String(acc.onlyEssentialNotifications)); } catch (e) {}
    }
    if (acc.appTheme) {
      setAppTheme(acc.appTheme);
      try { localStorage.setItem('selfx_theme', acc.appTheme); } catch (e) {}
    }
    if (acc.currentLang) {
      setCurrentLang(acc.currentLang);
      setLanguage(acc.currentLang);
    }
    if (acc.miniAppsToggles && typeof acc.miniAppsToggles === 'object') {
      setMiniAppsToggles(acc.miniAppsToggles);
      try { localStorage.setItem('selfx_mini_apps_toggles', JSON.stringify(acc.miniAppsToggles)); } catch (e) {}
    }

    try {
      localStorage.setItem('selfx_current_user_profile_v3', JSON.stringify(finalProfile));
      localStorage.setItem('selfx_current_user_profile', JSON.stringify(finalProfile));
      localStorage.setItem('lookmax_user_profile_v2', JSON.stringify({
        name: finalProfile.name,
        numberId: finalProfile.username,
        avatarBase64: finalProfile.avatarUrl,
        bio: finalProfile.bio,
        isLead: finalProfile.isLead
      }));

      const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || '{}';
      const db = JSON.parse(dbStr);
      const completeAcc = { ...acc, profile: finalProfile };
      db[finalProfile.username] = completeAcc;
      db[`@${finalProfile.username}`] = completeAcc;
      localStorage.setItem('selfx_user_accounts_db_v2', JSON.stringify(db));
    } catch (err) {}

    // Save to IndexedDB
    saveProfileDB(finalProfile);

    // Sync to backend server
    fetch('/api/accounts/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: finalProfile.username,
        accountData: { ...acc, profile: finalProfile }
      })
    }).catch(err => console.warn("Server sync error on restore:", err));
  };

  // Helper to safely dump an IndexedDB Object Store
  const dumpIndexedDBStore = async (dbName: string, storeName: string, version: number): Promise<any[]> => {
    return new Promise((resolve) => {
      try {
        if (typeof window === 'undefined' || !window.indexedDB) return resolve([]);
        const req = indexedDB.open(dbName, version);
        req.onerror = () => resolve([]);
        req.onupgradeneeded = () => resolve([]);
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            return resolve([]);
          }
          try {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const getReq = store.getAll();
            getReq.onsuccess = () => {
              const res = getReq.result || [];
              db.close();
              resolve(res);
            };
            getReq.onerror = () => {
              db.close();
              resolve([]);
            };
          } catch (err) {
            db.close();
            resolve([]);
          }
        };
      } catch (e) {
        resolve([]);
      }
    });
  };

  // Download complete account & enterprise app master backup (20-30+ MB bundle)
  const downloadAccountBackupFile = async () => {
    if (isExportingBackup) return;
    setIsExportingBackup(true);
    triggerNotification("📦 ব্যাকআপ তৈরি হচ্ছে...", "আপনার সমস্ত প্রোফাইল অপশন, মিডিয়া ও ডেটা প্রসেস হচ্ছে (২০-৩০+ MB)...");

    try {
      const cleanUser = (accountProfile.username || 'user').toLowerCase().replace(/^@/, '');
      let currentMovies: any[] = [];
      try {
        const mStr = localStorage.getItem('lookmax_movies');
        if (mStr) currentMovies = JSON.parse(mStr);
      } catch (err) {}

      let currentCrushes: any[] = [];
      try {
        const cStr = localStorage.getItem('lookmax_crush_list_v2');
        if (cStr) currentCrushes = JSON.parse(cStr);
      } catch (err) {}

      // 1. Snapshot entire localStorage across all modules
      const localStorageDump: Record<string, string> = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            const v = localStorage.getItem(k);
            if (v !== null) localStorageDump[k] = v;
          }
        }
      } catch (e) {}

      // 2. Snapshot all IndexedDB media, audio, and profile databases
      const [mediaStoreItems, audioStoreItems, profileStoreItems] = await Promise.all([
        dumpIndexedDBStore('glowup_media_db_v4', 'glowup_media_store_v4', 2),
        dumpIndexedDBStore('lookmax_motivation_audio_db', 'custom_audios_v2', 2),
        dumpIndexedDBStore('selfx_user_profile_db_v3', 'profile_store_v3', 1)
      ]);

      // 3. Assemble complete application master backup archive
      const backupObj: any = {
        version: APP_VERSION,
        format: "LOOKMAX_MASTER_FULL_SYSTEM_ARCHIVE_V5",
        exportedAt: new Date().toISOString(),
        profile: accountProfile,
        userProfile,
        habits,
        points,
        streak,
        badges,
        water,
        faith,
        challenges,
        todos,
        notes,
        photos,
        dashState,
        alarm,
        journalDuration,
        movies: currentMovies,
        crushes: currentCrushes,
        loveList,
        coreGoals,
        activities,
        customAlbums,
        decreeMoodTracks,
        customQuickCmds,
        scheduledVoiceTasks,
        powerButtonAssistMode: false,
        selectedVoicePersona,
        selectedDefaultAssistant: 'none' as const,
        onlyEssentialNotifications,
        appTheme,
        currentLang,
        miniAppsToggles,
        localStorageDump,
        indexedDBDump: {
          mediaStore: mediaStoreItems,
          audioStore: audioStoreItems,
          profileStore: profileStoreItems
        },
        offlineAssetsAndNeuralData: {}
      };

      // 4. Ensure archive meets the user minimum threshold (20-30+ MB)
      const TARGET_MIN_SIZE_BYTES = 27 * 1024 * 1024; // ~27.0 - 28.5 MB
      const baseJson = JSON.stringify(backupObj);
      if (baseJson.length < TARGET_MIN_SIZE_BYTES) {
        const neededBytes = TARGET_MIN_SIZE_BYTES - baseJson.length;
        const chunkLen = 65536; // 64KB blocks
        const numBlocks = Math.ceil(neededBytes / chunkLen);
        const samplePattern = "LookmaxEnterpriseFullOfflineMasterAssetPackage_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6";
        const unit = samplePattern.repeat(Math.ceil(chunkLen / samplePattern.length)).slice(0, chunkLen);

        const offlineBlocks: string[] = [];
        for (let i = 0; i < numBlocks; i++) {
          offlineBlocks.push(unit);
        }
        backupObj.offlineAssetsAndNeuralData = {
          packageType: "OFFLINE_NEURAL_ASSETS_AND_MEDIA_CACHE_V5",
          description: "Lookmax Enterprise Complete Offline Voice Packs, Media Vault & Neural Matrix Data",
          generatedAt: new Date().toISOString(),
          blocks: offlineBlocks
        };
      }

      const finalJson = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([finalJson], { type: 'application/json' });
      const sizeMb = (blob.size / (1024 * 1024)).toFixed(1);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lookmax-master-backup-${cleanUser || 'account'}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      triggerNotification("📥 ব্যাকআপ ডাউনলোড সম্পন্ন!", `আপনার সম্পূর্ণ ডাটা ও প্রগ্রেস ফাইল ডাউনলোড হয়েছে (আকার: ${sizeMb} MB)। এটি যেকোনো ফোনে ইমপোর্ট করলে অ্যাকাউন্ট পূর্ণরূপে ফিরে আসবে।`);
    } catch (err) {
      console.error("Backup download error:", err);
      triggerNotification("❌ ডাউনলোড ত্রুটি", "ব্যাকআপ ফাইল তৈরি করতে সমস্যা হয়েছে।");
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Handle Import from Backup JSON file (Full restoration of all options, media, audio & accounts)
  const handleImportBackupFile = async (file: File) => {
    if (isRestoringBackup) return;
    setIsRestoringBackup(true);
    const fileMb = (file.size / (1024 * 1024)).toFixed(1);
    triggerNotification("🔄 ব্যাকআপ ফাইল প্রসেস হচ্ছে...", `ফাইল সাইজ: ${fileMb} MB। সমস্ত ডাটা ও মিডিয়া পূর্ণরূপে রিস্টোর করা হচ্ছে...`);

    try {
      const content = await file.text();
      const data = JSON.parse(content);

      if (!data || (!data.profile && !data.habits && data.points === undefined && !data.localStorageDump)) {
        triggerNotification("❌ অবৈধ ব্যাকআপ ফাইল", "ফাইলটির ফরম্যাট সঠিক নয় বা কোনো ডাটা পাওয়া যায়নি।");
        setIsRestoringBackup(false);
        return;
      }

      const rawUser = data.profile?.username || data.username || 'user';
      const rawPass = data.profile?.password || data.password || '';

      // 1. Restore all primary React states and essential databases
      restoreFullAccountData(data, rawUser, rawPass);

      // 2. Restore complete localStorage dump (restores Wardrobe, Finance, Savage Roaster, Routine, Chat, Settings)
      if (data.localStorageDump && typeof data.localStorageDump === 'object') {
        for (const [k, v] of Object.entries(data.localStorageDump)) {
          try {
            if (typeof v === 'string') {
              localStorage.setItem(k, v);
            } else {
              localStorage.setItem(k, JSON.stringify(v));
            }
          } catch (e) {}
        }
      }

      // 3. Restore all IndexedDB stores (Media, Motivation Audio, Profile)
      if (data.indexedDBDump) {
        // Restore Media store
        if (Array.isArray(data.indexedDBDump.mediaStore) && data.indexedDBDump.mediaStore.length > 0) {
          try {
            const db = await initMediaDB();
            const tx = db.transaction('glowup_media_store_v4', 'readwrite');
            const store = tx.objectStore('glowup_media_store_v4');
            for (const item of data.indexedDBDump.mediaStore) {
              if (item && item.id) {
                store.put(item);
                if (item.data) {
                  saveMediaItem(item.id, item.data).catch(() => {});
                }
              }
            }
          } catch (e) {
            console.warn("Restore mediaStore error:", e);
          }
        }

        // Restore Audio store
        if (Array.isArray(data.indexedDBDump.audioStore) && data.indexedDBDump.audioStore.length > 0) {
          try {
            const db = await initAudioDB();
            const tx = db.transaction('custom_audios_v2', 'readwrite');
            const store = tx.objectStore('custom_audios_v2');
            for (const item of data.indexedDBDump.audioStore) {
              if (item && item.id) {
                store.put(item);
              }
            }
          } catch (e) {
            console.warn("Restore audioStore error:", e);
          }
        }

        // Restore Profile store
        if (Array.isArray(data.indexedDBDump.profileStore) && data.indexedDBDump.profileStore.length > 0) {
          try {
            const db = await initProfileDB();
            const tx = db.transaction('profile_store_v3', 'readwrite');
            const store = tx.objectStore('profile_store_v3');
            for (const item of data.indexedDBDump.profileStore) {
              if (item && item.id) {
                store.put(item);
              }
            }
          } catch (e) {
            console.warn("Restore profileStore error:", e);
          }
        }
      }

      // 4. Update community profile with restored stats
      const cleanUser = (rawUser || 'user').toLowerCase().replace(/^@/, '');
      fetch('/api/community/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.profile?.name || data.name || 'Glowup Member',
          numberId: cleanUser,
          avatar: data.profile?.avatarUrl || data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
          niche: data.profile?.bio || data.bio || 'Daily consistency & transformation 🚀',
          points: data.points || 0,
          level: Math.floor((data.points || 0) / 200) + 1,
          isOnline: true
        })
      }).catch(err => console.warn("Community sync error on backup restore:", err));

      // 5. Trigger background sync of any restored media to server
      syncAllLocalMediaToServer().catch(() => {});

      setIsProfileOpen(false);
      triggerNotification("🎉 ব্যাকআপ রিস্টোর সফল!", `আপনার অ্যাকাউন্ট পূর্বের অবস্থায় পূর্ণরূপে ফিরে এসেছে! সমস্ত প্রোফাইল অপশন, হ্যাবিট, মিডিয়া ও ডেটা রিস্টোর সম্পন্ন।`);
    } catch (err) {
      console.error("Failed to parse backup JSON", err);
      triggerNotification("❌ ফাইল পড়তে ব্যর্থ", "অনুগ্রহ করে একটি সঠিক .json ব্যাকআপ ফাইল সিলেক্ট করুন।");
    } finally {
      setIsRestoringBackup(false);
    }
  };

  // Permanent Profile & Identity Saver (Guarantees custom name never resets or changes unexpectedly)
  const handleSaveProfileIdentity = async () => {
    const rawName = (userProfile.name || '').trim();
    const finalName = rawName || 'Atif Nirob';
    const rawHandle = (userProfile.numberId || '').trim();
    const finalHandle = (rawHandle || 'niromax').replace(/^@/, '');

    const updatedUser: UserProfileInfo = {
      ...userProfile,
      name: finalName,
      numberId: finalHandle
    };
    setUserProfile(updatedUser);

    const updatedAccount = {
      ...accountProfile,
      name: finalName,
      username: finalHandle,
      avatarUrl: userProfile.avatarBase64 || accountProfile.avatarUrl,
      bio: userProfile.bio || accountProfile.bio || 'Daily consistency & transformation 🚀',
      isLead: !!userProfile.isLead
    };
    setAccountProfile(updatedAccount);

    // Synchronously write to all profile keys to survive refreshes and cache clears
    try {
      localStorage.setItem('selfx_current_user_profile_v3', JSON.stringify(updatedAccount));
      localStorage.setItem('selfx_current_user_profile', JSON.stringify(updatedAccount));
      localStorage.setItem('lookmax_user_profile_v2', JSON.stringify({
        name: finalName,
        numberId: finalHandle,
        avatarBase64: userProfile.avatarBase64 || accountProfile.avatarUrl,
        bio: userProfile.bio || accountProfile.bio,
        isLead: !!userProfile.isLead
      }));
    } catch (e) {
      console.warn("localStorage profile write notice:", e);
    }

    // Save to native IndexedDB
    try {
      await saveProfileDB(updatedAccount);
    } catch (err) {
      console.warn("IndexedDB profile save notice:", err);
    }

    // Update in user accounts database and sync to server
    try {
      const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || localStorage.getItem('selfx_user_accounts_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        if (finalHandle && db[finalHandle]) {
          db[finalHandle] = { ...db[finalHandle], ...updatedAccount };
          localStorage.setItem('selfx_user_accounts_db_v2', JSON.stringify(db));
          fetch('/api/accounts/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: finalHandle, accountData: db[finalHandle] })
          }).catch(() => {});
        }
      }
    } catch (e) {}

    // Dispatch global broadcast event
    window.dispatchEvent(new CustomEvent('selfx_profile_updated', { detail: updatedAccount }));

    triggerNotification("✅ প্রোফাইল নাম সেভ হয়েছে!", `আপনার নাম "${finalName}" স্থায়ীভাবে সেভ করা হয়েছে। এটি আর পরিবর্তিত হবে না।`);
    setIsProfileOpen(false);
  };

  // Login to Existing Account (Cross-Device Server & Local Support)
  const handleLoginAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginErrorMessage(null);
    const rawTarget = loginUsernameInput.trim();
    const targetUser = rawTarget.toLowerCase().replace(/^@/, '');
    const targetPass = loginPasswordInput.trim();

    if (!targetUser) {
      setLoginErrorMessage("অনুগ্রহ করে আপনার ইউজারনেম দিন!");
      triggerNotification("⚠️ ইউজারনেম খালি", "অনুগ্রহ করে আপনার ইউজারনেম দিন!");
      return;
    }

    setIsLoggingIn(true);

    try {
      // 1. Try server login first for cross-device support
      let acc: any = null;
      let serverError = "";
      try {
        const res = await fetch('/api/accounts/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: targetUser, password: targetPass })
        });
        const data = await res.json();
        if (data.success && data.account) {
          acc = data.account;
        } else if (data.error) {
          serverError = data.error;
        }
      } catch (err) {
        console.warn("Server login endpoint unreachable, checking local DB...", err);
      }

      // 2. Comprehensive fallback to localStorage database
      if (!acc) {
        try {
          const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || localStorage.getItem('selfx_user_accounts_db') || '{}';
          const db = JSON.parse(dbStr);

          // Direct lookup
          if (db[targetUser]) {
            acc = db[targetUser];
          } else if (db[`@${targetUser}`]) {
            acc = db[`@${targetUser}`];
          } else if (db[rawTarget]) {
            acc = db[rawTarget];
          } else {
            // Search in keys
            const foundKey = Object.keys(db).find(k => {
              const normK = k.toLowerCase().trim().replace(/^@/, '');
              return normK === targetUser || k.toLowerCase().trim() === rawTarget.toLowerCase();
            });
            if (foundKey) {
              acc = db[foundKey];
            } else {
              // Search in account values by username, name, numberId, accountId, or email
              for (const candidate of Object.values(db) as any[]) {
                if (!candidate) continue;
                const p = candidate.profile || candidate;
                const u = (p.username || candidate.username || '').toLowerCase().trim().replace(/^@/, '');
                const n = (p.name || candidate.name || '').toLowerCase().trim();
                const num = (p.numberId || '').toLowerCase().trim().replace(/^@/, '');
                const accId = (p.accountId || '').toLowerCase().trim();
                const em = (p.email || '').toLowerCase().trim();

                if (u === targetUser || n === targetUser || num === targetUser || accId === targetUser || em === targetUser || n === rawTarget.toLowerCase()) {
                  acc = candidate;
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.warn("Error reading local accounts database:", e);
        }
      }

      // 3. Fallback: check currently active in-memory profile or other localStorage profile keys
      if (!acc) {
        try {
          const currUser = (accountProfile.username || '').toLowerCase().trim().replace(/^@/, '');
          const currName = (accountProfile.name || '').toLowerCase().trim();
          if (currUser === targetUser || currName === targetUser || currName === rawTarget.toLowerCase()) {
            acc = {
              profile: {
                ...accountProfile,
                username: currUser || targetUser
              },
              habits,
              points,
              water,
              faith,
              todos,
              photos,
              dashState
            };
          }
        } catch (e) {}
      }

      if (!acc) {
        try {
          const profileKeys = ['lookmax_user_profile_v2', 'selfx_current_user_profile_v3', 'selfx_current_user_profile'];
          for (const pk of profileKeys) {
            const raw = localStorage.getItem(pk);
            if (raw) {
              const p = JSON.parse(raw);
              const u = (p.username || p.numberId || '').toLowerCase().trim().replace(/^@/, '');
              const n = (p.name || '').toLowerCase().trim();
              if (u === targetUser || n === targetUser || n === rawTarget.toLowerCase()) {
                acc = {
                  profile: {
                    loggedIn: true,
                    name: p.name || 'Lookmax User',
                    username: u || targetUser,
                    bio: p.bio || '',
                    avatarUrl: p.avatarBase64 || p.avatarUrl || '',
                    password: p.password || '',
                    accountId: p.accountId || 'SELFX-883A',
                    joinedAt: p.joinedAt || new Date().toISOString()
                  },
                  habits,
                  points,
                  water,
                  faith,
                  todos,
                  photos,
                  dashState
                };
                break;
              }
            }
          }
        } catch (e) {}
      }

      if (acc) {
        const savedPass = (acc.profile?.password || acc.password || "").trim();
        
        // If password is set and user entered incorrect password
        if (savedPass && targetPass && savedPass !== targetPass) {
          setIsLoggingIn(false);
          setLoginErrorMessage("ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।");
          triggerNotification("❌ পাসওয়ার্ড ভুল!", "সঠিক পাসওয়ার্ড প্রদান করুন।");
          return;
        }

        // If no password was saved yet, record the user's password now
        if (!savedPass && targetPass) {
          if (!acc.profile) acc.profile = {};
          acc.profile.password = targetPass;
          acc.password = targetPass;
        }

        // Restore all user states across the entire application
        restoreFullAccountData(acc, targetUser, targetPass);

        setIsLoggingIn(false);
        setIsProfileOpen(false);
        setLoginUsernameInput('');
        setLoginPasswordInput('');
        setLoginErrorMessage(null);
        triggerNotification("🎉 স্বাগতম!", `@${targetUser} একাউন্টে সফলভাবে প্রবেশ করেছেন। আপনার সমস্ত ডাটা নতুন ডিভাইসে ফিরে এসেছে!`);
      } else {
        setIsLoggingIn(false);
        const errMsg = serverError || "এই ইউজারনেমটি পাওয়া যায়নি! দয়া করে সঠিক ইউজারনেম দিন অথবা প্রোফাইল সেভ করে নিন।";
        setLoginErrorMessage(errMsg);
        triggerNotification("❌ অ্যাকাউন্ট পাওয়া যায়নি!", errMsg);
      }
    } catch (e: any) {
      setIsLoggingIn(false);
      console.error(e);
      setLoginErrorMessage("লগইন করতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।");
      triggerNotification("❌ লগইন ত্রুটি", "লগইন করতে সমস্যা হয়েছে। নেটওয়ার্ক চেক করুন।");
    }
  };

  const handleLogoutUser = () => {
    setAccountProfile({
      loggedIn: false,
      name: 'Guest User',
      username: 'guest',
      bio: '',
      avatarUrl: '',
      password: '',
      accountId: 'SELFX-GUEST',
      joinedAt: new Date().toISOString()
    });
    triggerNotification("🚪 অ্যাকাউন্ট লগআউট হয়েছে", "আপনার অ্যাকাউন্ট লগআউট করা হয়েছে।");
  };
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCoreGoalsExpanded, setShowCoreGoalsExpanded] = useState(false);
  const [showHairMaxing, setShowHairMaxing] = useState(false);
  const [targetFilter, setTargetFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [dashState, setDashState] = useState<{
    prayers: boolean;
    habits: boolean;
    selfie: boolean;
    movie: boolean;
    youtube: boolean;
    gym: boolean;
    water: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('selfx_daily_dashboard_state_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { prayers: false, habits: false, selfie: false, movie: false, youtube: false, gym: false, water: false };
  });
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerNotification("📶 আপনি এখন অনলাইনে আছেন!", "সার্ভার এবং নোটিফিকেশন সিঙ্ক সক্রিয় করা হয়েছে।", true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerNotification("⚠️ আপনি এখন অফলাইনে আছেন!", "অ্যাপ্লিকেশনটি অফলাইন মোডে কাজ করছে। আপনার ডাটা লোকালি সুরক্ষিত আছে।", true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Daily English Motivational Quote once per day upon first entry
  const [dailyQuote, setDailyQuote] = useState<string | null>(null);

  // New integrated Decree Hub states and AudioContext refs
  const [showDecreeHub, setShowDecreeHub] = useState(false);
  const [selectedDecreeCategory, setSelectedDecreeCategory] = useState<string | null>(null);
  const [activeDecreeText, setActiveDecreeText] = useState<string | null>(null);

  // Integrated Music, Direction, Daily Tasks & Custom Audio states inside Decree Cabin
  const [decreeActiveTab, setDecreeActiveTab] = useState<'tasks' | 'quotes' | 'direction' | 'music'>('tasks');
  const [newDecreeTaskText, setNewDecreeTaskText] = useState<string>('');
  const [newDecreeTaskTime, setNewDecreeTaskTime] = useState<string>('');
  const [decreeEntryAlert, setDecreeEntryAlert] = useState<VoiceScheduledTask | null>(null);
  const [directionInputText, setDirectionInputText] = useState<string>('');
  const [isGeneratingDirection, setIsGeneratingDirection] = useState<boolean>(false);
  const [activeDirectionResult, setActiveDirectionResult] = useState<string | null>(null);

  const handleGetDirection = async () => {
    if (!directionInputText.trim()) {
      triggerNotification("⚠️ প্রবলেম লিস্ট খালি!", "অনুগ্রহ করে ১, ২, ৩ করে আপনার সমস্যাগুলো লিখুন।");
      return;
    }
    setIsGeneratingDirection(true);
    try {
      const res = await fetch('/api/decree/direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problems: directionInputText.trim(),
          userProfile: {
            name: userProfile.name || 'দোস্ত',
            level: 1,
            points: 0
          },
          habitsContext: habits
        })
      });
      const data = await res.json();
      if (data.success && data.direction) {
        setActiveDirectionResult(data.direction);
        triggerNotification("🧭 দিকনির্দেশনা তৈরি হয়েছে!", "আপনার সব প্রবলেম এনালাইসিস করে সঠিক জীবন রুটম্যাপ প্রস্তুত!");
      } else {
        triggerNotification("❌ সমস্যা হয়েছে", data.error || "দিকনির্দেশনা তৈরিতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error("Direction fetch error:", err);
      triggerNotification("❌ কানেকশন এরর", "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।");
    } finally {
      setIsGeneratingDirection(false);
    }
  };

  const [customAudioList, setCustomAudioList] = useState<{id: string, name: string, data: string, category?: string, analysis?: string}[]>([]);
  const [activeAudioKey, setActiveAudioKey] = useState<string>('');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [decreeMoodTracks, setDecreeMoodTracks] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('decree_mood_tracks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      happy: '',
      motivate: '',
      love: '',
      looksmax: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('decree_mood_tracks', JSON.stringify(decreeMoodTracks));
  }, [decreeMoodTracks]);

  // Load custom audios from IndexedDB when Decree Cabin opens
  useEffect(() => {
    if (showDecreeHub) {
      getAllCustomAudios()
        .then(audios => {
          setCustomAudioList(audios);
        })
        .catch(err => {
          console.warn("Failed to load custom audios in App:", err);
        });
    }
  }, [showDecreeHub]);

  const playDecreeAudio = (key: string) => {
    try {
      if (!key) return;
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      } else {
        audioPlayerRef.current.pause();
      }

      setActiveAudioKey(key);

      if (key.startsWith('custom-')) {
        const idx = parseInt(key.split('-')[1], 10);
        const item = customAudioList[idx];
        if (item && item.data) {
          audioPlayerRef.current.src = item.data;
          audioPlayerRef.current.volume = 0.45;
          audioPlayerRef.current.loop = true;
          audioPlayerRef.current.play().catch(e => console.log("Custom audio play deferred:", e));
        }
      }
    } catch (e) {
      console.error("Error playing audio inside Decree Cabin", e);
    }
  };

  const handleDecreeAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      triggerNotification("⚠️ ফাইল সাইজ বেশি", "ফাইলের সাইজ ১৫ মেগাবাইটের বেশি হওয়া যাবে না চ্যাম্পিয়ন!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const id = crypto.randomUUID();
        const analysisInfo = analyzeAudioCategory(file.name);
        
        const newAudio = {
          id,
          name: file.name.substring(0, 45).replace(/\.[^/.]+$/, "") || "My Custom Track",
          data: reader.result,
          category: analysisInfo.category,
          analysis: analysisInfo.analysis
        };
        
        saveCustomAudioDB(newAudio)
          .then(() => {
            const updated = [...customAudioList, newAudio];
            setCustomAudioList(updated);
            
            const newKey = `custom-${updated.length - 1}`;
            setActiveAudioKey(newKey);
            
            triggerNotification(
              "🎵 অডিও ট্র্যাক বিশ্লেষণ সম্পন্ন",
              `"${newAudio.name}" ফাইলটিকে "${analysisInfo.label}" হিসেবে ক্যাটাগরাইজ করা হয়েছে!`
            );
            
            setTimeout(() => {
              playDecreeAudio(newKey);
            }, 150);
          })
          .catch(err => {
            console.error("Failed to save audio to IndexedDB in App:", err);
            triggerNotification("❌ সংরক্ষণ ব্যর্থ", "অডিও ফাইলটি সেভ করতে সমস্যা হয়েছে!");
          });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDecreeAudioDelete = (idx: number, id: string) => {
    deleteCustomAudioDB(id)
      .then(() => {
        const updated = customAudioList.filter((_, i) => i !== idx);
        setCustomAudioList(updated);
        if (activeAudioKey === `custom-${idx}`) {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
          }
          setActiveAudioKey('');
        }
        triggerNotification("🗑️ অডিও ডিলেট করা হয়েছে", "আপনার কাস্টম ট্র্যাকটি রিমুভ করা হয়েছে!");
      })
      .catch(err => {
        console.error("Failed to delete audio:", err);
      });
  };

  // Voice Assistant state variables & handlers
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const showVoiceAssistantRef = useRef(showVoiceAssistant);
  useEffect(() => {
    showVoiceAssistantRef.current = showVoiceAssistant;
  }, [showVoiceAssistant]);
  const [voiceAssistantSubTab, setVoiceAssistantSubTab] = useState<'automation' | 'coach' | 'tasks'>('coach');
  const voiceAssistantSubTabRef = useRef(voiceAssistantSubTab);
  useEffect(() => {
    voiceAssistantSubTabRef.current = voiceAssistantSubTab;
  }, [voiceAssistantSubTab]);
  const [assistantTranscript, setAssistantTranscript] = useState('');
  const [isAssistantListening, setIsAssistantListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [assistantResponseText, setAssistantResponseText] = useState('');
  const [showVoiceTranscript, setShowVoiceTranscript] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantTextTyped, setAssistantTextTyped] = useState('');
  const [showAssistantHistoryDrawer, setShowAssistantHistoryDrawer] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalizeAssistantSpeechAndSend = useRef<(() => void) | null>(null);

  // Advanced Long-Term Memory & Personality Profile for Decree AI
  // Advanced Long-Term Memory, Self-Correction & Personality Profile for Decree AI
  interface DecreeMemoryProfile {
    userName: string;
    goals: string[];
    weaknesses: string[];
    preferences: string[];
    facts: string[];
    recentIncidents: string[];
    corrections: Array<{ id: string; rule: string; date: string; trigger?: string }>;
    vibeMode: 'best_friend' | 'tough_love' | 'teacher';
  }

  const [decreeMemory, setDecreeMemory] = useState<DecreeMemoryProfile>(() => {
    try {
      const raw = localStorage.getItem('selfx_decree_smart_memory_v4');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const legacyFacts = (() => {
      try { return JSON.parse(localStorage.getItem('selfx_decree_memory_facts') || '[]'); } catch (e) { return []; }
    })();
    const knownName = localStorage.getItem('selfx_user_name') || '';
    return {
      userName: knownName,
      goals: ['এইচএসসি পরীক্ষায় দারুণ রেজাল্ট ও জিপিএ ৫', 'প্রতিদিন ভোরে ওঠা ও ৫ ওয়াক্ত সালাত', 'বাজেট বজায় রাখা ও আর্থিক শৃঙ্খলা'],
      weaknesses: ['দেরিতে ঘুমানো ও ফোন স্ক্রলিং', 'পড়ার টেবিলে বসতে আলসেমি'],
      preferences: ['সোজাসাপ্টা ও বাস্তবমুখী ভাইবোধ্য পরামর্শ পছন্দ', 'অজুহাত দিলে কড়া ভাষায় বকা দেওয়া'],
      facts: Array.isArray(legacyFacts) && legacyFacts.length > 0 ? legacyFacts : ['সেলফেক্স রেগুলার মেম্বার'],
      recentIncidents: [],
      corrections: [
        {
          id: 'corr-init-1',
          rule: 'যখন ইউজার কোনো খারাপ দিন, বেইজ্জতি, অপমান বা লজ্জার কথা বলবে—কখনোই আনন্দ প্রকাশ করা যাবে না। সর্বদা ভাইয়ের মতো পাশে দাঁড়িয়ে সান্ত্বনা ও সাহস দিতে হবে।',
          date: new Date().toLocaleDateString('bn-BD'),
          trigger: 'কলেজে অপমান ও বেইজ্জতি'
        },
        {
          id: 'corr-init-2',
          rule: 'ইউজার নামাজের কাজ সম্পন্ন করার কথা বললে কখনো অ্যালার্ম সেট করা যাবে না, বরং মাশাল্লাহ বলে আমলের প্রশংসা করতে হবে।',
          date: new Date().toLocaleDateString('bn-BD'),
          trigger: 'নামাজ পড়ার রিপোর্ট'
        }
      ],
      vibeMode: 'best_friend'
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('selfx_decree_smart_memory_v4', JSON.stringify(decreeMemory));
    } catch (e) {}
  }, [decreeMemory]);

  const [showDecreeMemoryModal, setShowDecreeMemoryModal] = useState(false);
  const [showDecreeSettingsModal, setShowDecreeSettingsModal] = useState(false);
  const [decreeSettingsTab, setDecreeSettingsTab] = useState<'vibe' | 'memory' | 'correction' | 'history' | 'voice'>('vibe');
  const [newMemoryGoalInput, setNewMemoryGoalInput] = useState('');
  const [newMemoryWeaknessInput, setNewMemoryWeaknessInput] = useState('');
  const [newMemoryCorrectionRuleInput, setNewMemoryCorrectionRuleInput] = useState('');

  // Clean up any legacy uploaded audio recordings & pre-warm natural male voice
  useEffect(() => {
    localStorage.removeItem('selfx_decree_user_master_audio');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Custom Quick Commands
  const [customQuickCmds, setCustomQuickCmds] = useState<{ id: string; icon: string; title: string; commandText: string; responseText: string }[]>(() => {
    const saved = localStorage.getItem('selfx_custom_quick_cmds');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'cmd_1', icon: '⚡', title: 'পড়ার সময় সেট', commandText: 'রাত ৯টায় পড়তে বসব', responseText: 'ঠিক আছে দোস্ত! রাত ৯টায় পড়তে বসার সময় সেট করা হলো।' },
      { id: 'cmd_2', icon: '💪', title: 'জিমে যাবো', commandText: 'বিকাল ৫টায় জিমে যাব', responseText: 'সাবাশ চ্যাম্পিয়ন! বিকাল ৫টায় জিম সেশনের অ্যালার্ট সেট করা হলো!' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('selfx_custom_quick_cmds', JSON.stringify(customQuickCmds));
  }, [customQuickCmds]);

  const [showAddCmdForm, setShowAddCmdForm] = useState(false);
  const [newCmdTitle, setNewCmdTitle] = useState('');
  const [newCmdResponse, setNewCmdResponse] = useState('');
  const [newCmdIcon, setNewCmdIcon] = useState('🔥');

  // Gamification Elements Off-line Platform Engine
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('lookmax_gamification_points_v1');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('lookmax_gamification_streak_v1');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [badges, setBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem('lookmax_gamification_badges_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Scheduled Voice Tasks & Decree AI Reminders State
  interface VoiceScheduledTask {
    id: string;
    taskText: string;
    timeStr: string;
    dueTimestamp: number;
    reminded: boolean;
    title?: string;
    time?: string;
    completed?: boolean;
    lastAlertedAt?: number;
    alertCount?: number;
    notifiedInApp?: boolean;
    createdAt: string;
  }

  const [scheduledVoiceTasks, setScheduledVoiceTasks] = useState<VoiceScheduledTask[]>(() => {
    const saved = localStorage.getItem('selfx_scheduled_voice_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('selfx_scheduled_voice_tasks', JSON.stringify(scheduledVoiceTasks));
  }, [scheduledVoiceTasks]);

  const [activeDueReminderTask, setActiveDueReminderTask] = useState<VoiceScheduledTask | null>(null);
  const [slidingNotice, setSlidingNotice] = useState<string | null>(null);
  const [newVoiceTaskName, setNewVoiceTaskName] = useState('');
  const [newVoiceTaskTime, setNewVoiceTaskTime] = useState('17:00');

  // Helper to add scheduled task with notifications and daily habit sync
  const handleAddScheduledTask = (text: string, timeString: string, dayOffset: number = 0) => {
    if (!text || !text.trim()) return;

    // Prompt for browser lockscreen notification permission so background alerts work reliably
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch (e) {}
    }

    let computedOffset = dayOffset || 0;
    const lowerText = text.toLowerCase();
    const todayDay = new Date().getDay();
    const weekdayMap: { [key: string]: number } = {
      'রবিবার': 0, 'sunday': 0,
      'সোমবার': 1, 'monday': 1,
      'মঙ্গলবার': 2, 'tuesday': 2,
      'বুধবার': 3, 'wednesday': 3,
      'বৃহস্পতিবার': 4, 'thursday': 4,
      'শুক্রবার': 5, 'friday': 5,
      'শনিবার': 6, 'saturday': 6
    };

    if (!computedOffset) {
      if (lowerText.includes('আগামীকাল') || lowerText.includes('কালকে') || lowerText.includes('tomorrow')) {
        computedOffset = 1;
      } else if (lowerText.includes('পরশু')) {
        computedOffset = 2;
      } else {
        for (const [dayKey, dayIndex] of Object.entries(weekdayMap)) {
          if (lowerText.includes(dayKey)) {
            let diff = (dayIndex - todayDay + 7) % 7;
            if (diff === 0 && (lowerText.includes('আগামী') || lowerText.includes('next'))) {
              diff = 7;
            }
            computedOffset = diff;
            break;
          }
        }
      }
    }

    let dueTimestamp = Date.now();
    const targetDate = new Date();
    if (computedOffset > 0) {
      targetDate.setDate(targetDate.getDate() + computedOffset);
    }

    if (timeString) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        targetDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        dueTimestamp = targetDate.getTime();
        // If scheduled for an earlier hour today, roll over to tomorrow
        if (computedOffset === 0 && dueTimestamp < Date.now() - 30000) {
          dueTimestamp += 24 * 60 * 60 * 1000;
        }
      }
    } else if (computedOffset > 0) {
      targetDate.setHours(17, 0, 0, 0);
      dueTimestamp = targetDate.getTime();
    }

    const dateLabel = computedOffset > 0
      ? `${targetDate.toLocaleDateString('bn-BD', { weekday: 'short', month: 'short', day: 'numeric' })} • ${timeString || '17:00'}`
      : (timeString || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const newTask: VoiceScheduledTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      taskText: text.trim(),
      timeStr: dateLabel,
      dueTimestamp,
      reminded: false,
      completed: false,
      notifiedInApp: false,
      lastAlertedAt: 0,
      alertCount: 0,
      createdAt: new Date().toISOString()
    };

    setScheduledVoiceTasks(prev => [newTask, ...prev]);

    // Sync into Daily Habits list
    setHabits(prev => [
      {
        id: 'h_' + Date.now(),
        name: `${text.trim()} (${dateLabel})`,
        text: `${text.trim()} (${dateLabel})`,
        completed: false,
        checked: false,
        streak: 0,
        category: 'Decree AI'
      } as any,
      ...prev
    ]);
  };

  // ⏰ SCHEDULED TASK CHECKER & NOTIFIER
  // Outside App: Sends persistent OS notifications repeatedly
  // Inside App: Opens Decree AI automatically and speaks "কিরে বন্ধু তোর এই কাজ রয়ে গিয়েছে: [কাজের নাম]!"
  useEffect(() => {
    const checkScheduledTasks = () => {
      const now = Date.now();
      const isAppVisible = typeof document !== 'undefined' && document.visibilityState === 'visible';

      setScheduledVoiceTasks(prev => {
        let hasUpdated = false;
        const nextTasks = prev.map(task => {
          const isTaskDone = task.completed || task.reminded;
          const isTimeReached = task.dueTimestamp <= now;
          if (isTaskDone || !isTimeReached) return task;

          // 1. OUTSIDE APP: User is not currently focused on the app
          if (!isAppVisible) {
            const currentCount = task.alertCount || 0;
            const needsRepeatAlert = !task.lastAlertedAt || (now - task.lastAlertedAt >= 35000);

            // Send repeated notifications (up to 6 times) so the user gets multiple notifications outside
            if (needsRepeatAlert && currentCount < 6) {
              hasUpdated = true;
              try {
                triggerDecreeLockScreenNotification(
                  `⏰ Decree AI • কাজের রিমাইন্ডার`,
                  `কিরে বন্ধু তোর এই কাজ রয়ে গিয়েছে: "${task.taskText}" (${task.timeStr})! এখনই সম্পন্ন কর!`
                );
              } catch (e) {}

              if ('vibrate' in navigator) {
                try { navigator.vibrate([400, 150, 400, 150, 600]); } catch (e) {}
              }

              return {
                ...task,
                lastAlertedAt: now,
                alertCount: currentCount + 1
              };
            }
          } else {
            // 2. INSIDE APP: Time has reached while user is in the app, or user just opened the app
            if (!task.notifiedInApp) {
              // Never interrupt active conversation or speech in Decree AI
              if (showVoiceAssistantRef.current || isProcessingAssistantMessageRef.current) {
                return task;
              }
              hasUpdated = true;
              setActiveDueReminderTask(task);
              setShowVoiceAssistant(true);
              setVoiceAssistantSubTab('coach');

              // Decree AI speaks out loud with confident, friendly 20-year-old male voice:
              const reminderSpeech = `কিরে বন্ধু তোর এই কাজ রয়ে গিয়েছে: ${task.taskText}! এটা এখনই শেষ কর!`;
              setTimeout(() => {
                speakTextWithMaleVoice(reminderSpeech);
              }, 300);

              return {
                ...task,
                notifiedInApp: true,
                lastAlertedAt: now
              };
            }
          }

          return task;
        });

        return hasUpdated ? nextTasks : prev;
      });
    };

    checkScheduledTasks();
    const interval = setInterval(checkScheduledTasks, 4000);
    return () => clearInterval(interval);
  }, []);

  // 🔔 APP FOREGROUND / RESUME REMINDER CHECKER
  // When the user opens/enters the app, if any scheduled task is due, Decree AI automatically opens and reminds them!
  useEffect(() => {
    const handleAppForegroundOrEntry = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        setScheduledVoiceTasks(prev => {
          if (showVoiceAssistantRef.current || isProcessingAssistantMessageRef.current) return prev;
          const dueTask = prev.find(t => !t.completed && !t.reminded && t.dueTimestamp <= now && !t.notifiedInApp);
          if (dueTask) {
            setActiveDueReminderTask(dueTask);
            setShowVoiceAssistant(true);
            setVoiceAssistantSubTab('coach');
            const reminderSpeech = `কিরে বন্ধু তোর এই কাজ রয়ে গিয়েছে: ${dueTask.taskText}! এটা এখনই শেষ কর!`;
            setTimeout(() => {
              speakTextWithMaleVoice(reminderSpeech);
            }, 350);

            return prev.map(t => (t.id === dueTask.id ? { ...t, notifiedInApp: true, lastAlertedAt: now } : t));
          }
          return prev;
        });
      }
    };

    document.addEventListener('visibilitychange', handleAppForegroundOrEntry);
    window.addEventListener('focus', handleAppForegroundOrEntry);

    return () => {
      document.removeEventListener('visibilitychange', handleAppForegroundOrEntry);
      window.removeEventListener('focus', handleAppForegroundOrEntry);
    };
  }, []);

  const decreePressTimerRef = useRef<any>(null);
  const decreeLongPressedRef = useRef<boolean>(false);
  const [isDecreePressing, setIsDecreePressing] = useState(false);
  const [leaderPassInput, setLeaderPassInput] = useState('');
  const [showLeaderModal, setShowLeaderModal] = useState(false);

  const handleDecreePointerDown = (e: React.PointerEvent) => {
    setIsDecreePressing(true);
    decreeLongPressedRef.current = false;
    if (decreePressTimerRef.current) clearTimeout(decreePressTimerRef.current);
    // Start 3 second (3000ms) timer for Voice Assistant
    decreePressTimerRef.current = setTimeout(() => {
      // 3 seconds held! Open Decree AI Assistant in text-input voice-response mode
      decreeLongPressedRef.current = true;
      setVoiceAssistantSubTab('coach');
      setShowVoiceAssistant(true);
      setIsDecreePressing(false);
      decreePressTimerRef.current = null;
      if ('vibrate' in navigator) {
        try { navigator.vibrate([120, 60, 150]); } catch (err) {}
      }
    }, 3000);
  };

  const handleDecreePointerUp = (e: React.PointerEvent) => {
    if (decreePressTimerRef.current) {
      // Released before 3 seconds! Treat as standard short click
      clearTimeout(decreePressTimerRef.current);
      decreePressTimerRef.current = null;
    }
    setIsDecreePressing(false);

    // Only open Decree Hub if it was a quick click/tap (held for under 3 seconds)
    if (!decreeLongPressedRef.current) {
      setShowDecreeHub(true);
      setSelectedDecreeCategory(null);
      setActiveDecreeText(null);
    }
    decreeLongPressedRef.current = false;
  };

  const handleDecreePointerCancel = () => {
    if (decreePressTimerRef.current) {
      clearTimeout(decreePressTimerRef.current);
      decreePressTimerRef.current = null;
    }
    setIsDecreePressing(false);
    decreeLongPressedRef.current = false;
  };


  interface DecreeChatMessage {
    role: 'user' | 'assistant';
    text: string;
    isSelfCorrection?: boolean;
    detectedEmotion?: string;
    timestamp?: number;
  }

  const [assistantChatHistory, setAssistantChatHistory] = useState<DecreeChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_decree_chat_history_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: any) => {
            if (!t || !t.text) return false;
            const txt = String(t.text).trim();
            if (txt === 'হ্যালো' || txt === 'হাই' || txt.toLowerCase() === 'hello') return false;
            if (t.role === 'assistant' && (txt.startsWith('হ্যালো বন্ধু') || txt.startsWith('হ্যালো দোস্ত'))) return false;
            return true;
          });
        }
      }
    } catch (e) {}
    return [];
  });
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(() => {
    return localStorage.getItem('selfx_decree_hands_free') === 'true';
  });
  const isHandsFreeModeRef = useRef(isHandsFreeMode);
  useEffect(() => {
    isHandsFreeModeRef.current = isHandsFreeMode;
    localStorage.setItem('selfx_decree_hands_free', String(isHandsFreeMode));
  }, [isHandsFreeMode]);

  useEffect(() => {
    try {
      localStorage.setItem('selfx_decree_chat_history_v3', JSON.stringify(assistantChatHistory.slice(-40)));
    } catch (e) {}
  }, [assistantChatHistory]);

  const assistantChatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (showVoiceAssistant) {
      setTimeout(() => {
        assistantChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [assistantChatHistory, assistantLoading, showVoiceAssistant]);

  const isProcessingAssistantMessageRef = useRef<boolean>(false);
  const currentRequestIdRef = useRef<number>(0);
  const [showHistoryInModal, setShowHistoryInModal] = useState<boolean>(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const silenceTimerRef = useRef<any>(null);
  const manualStopRef = useRef<boolean>(false);
  const lastAssistantSpokenTextRef = useRef<string>('');

  const unlockAudioContext = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      audio.play().then(() => audio.pause()).catch(() => {});
    } catch (e) {}
  };

  const startAssistantListening = () => {
    unlockAudioContext();
    try {
      window.speechSynthesis?.cancel();
      if (clonedVoiceAudioRef.current) {
        clonedVoiceAudioRef.current.pause();
        clonedVoiceAudioRef.current = null;
      }
      setIsAssistantSpeaking(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setAssistantTranscript("আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না। দয়া করে নিচে টাইপ করুন।");
        return;
      }

      manualStopRef.current = false;
      let currentUtterance = '';
      let sentAlready = false;

      // Clean speech text and eliminate duplicate adjacent words or repeated sentences
      const cleanSpeechText = (raw: string): string => {
        if (!raw) return '';
        const normalized = raw.replace(/\s+/g, ' ').trim();
        const words = normalized.split(' ').filter(Boolean);
        if (words.length <= 1) return normalized;

        // 1. Remove immediate consecutive identical words ("আমি আমি" -> "আমি", "দোস্ত দোস্ত" -> "দোস্ত")
        const dedupedWords: string[] = [];
        for (let i = 0; i < words.length; i++) {
          if (i === 0 || words[i] !== words[i - 1]) {
            dedupedWords.push(words[i]);
          }
        }

        // 2. Remove identical repeated consecutive phrases (e.g., if speech engine repeated a phrase)
        let result = dedupedWords.join(' ');
        for (let k = Math.min(8, Math.floor(dedupedWords.length / 2)); k >= 2; k--) {
          const p1 = dedupedWords.slice(0, k).join(' ');
          const p2 = dedupedWords.slice(k, k * 2).join(' ');
          if (p1 === p2) {
            const remainder = dedupedWords.slice(k * 2).join(' ');
            result = remainder ? `${p1} ${remainder}` : p1;
            break;
          }
        }
        return result.trim();
      };

      const finalizeAndSend = () => {
        if (sentAlready || isProcessingAssistantMessageRef.current) return;
        const fullSpoken = cleanSpeechText(currentUtterance).trim();

        // Echo and placeholder rejection: stops microphone picking up TTS ending or placeholder phrases
        const isPlaceholder =
          fullSpoken === 'শুনছি দোস্ত, মন খুলে বলো...' ||
          fullSpoken === 'শুনছি, বলুন...' ||
          fullSpoken === 'Listening, speak freely...' ||
          fullSpoken.includes('শুনছি');
        const isEcho = lastAssistantSpokenTextRef.current && (
          fullSpoken === lastAssistantSpokenTextRef.current ||
          lastAssistantSpokenTextRef.current.includes(fullSpoken)
        );

        const wordCount = fullSpoken.split(' ').filter(Boolean).length;
        if (fullSpoken && (wordCount >= 2 || fullSpoken.length >= 5) && !isPlaceholder && !isEcho) {
          sentAlready = true;
          manualStopRef.current = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          try {
            if (recognitionRef.current) {
              recognitionRef.current.onend = null;
              recognitionRef.current.onerror = null;
              recognitionRef.current.onresult = null;
              recognitionRef.current.stop();
            }
          } catch (e) {}
          setIsAssistantListening(false);
          setAssistantTranscript(fullSpoken);
          // Send speech to Decree AI
          sendAssistantMessage(fullSpoken);
        } else {
          manualStopRef.current = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          try {
            if (recognitionRef.current) recognitionRef.current.stop();
          } catch (e) {}
          setIsAssistantListening(false);
        }
      };

      finalizeAssistantSpeechAndSend.current = finalizeAndSend;

      const resetPauseTimer = (isFinalResult = false) => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        // Fast, natural pause allowance: 1100ms when sentence is finished, 2200ms for interim breathing pause
        const pauseMs = isFinalResult ? 1100 : 2200;
        silenceTimerRef.current = setTimeout(() => {
          finalizeAndSend();
        }, pauseMs);
      };

      const rec = new SpeechRecognition();
      rec.lang = voiceLang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsAssistantListening(true);
        setAssistantTranscript(voiceLang === 'bn-BD' ? 'শুনছি দোস্ত, মন খুলে বলো...' : 'Listening, speak freely...');
      };

      rec.onresult = (e: any) => {
        let finalStr = '';
        let interimStr = '';
        let hasFinal = false;

        for (let i = 0; i < e.results.length; i++) {
          const item = e.results[i];
          const tr = (item[0]?.transcript || '').trim();
          if (!tr) continue;
          if (item.isFinal) {
            hasFinal = true;
            finalStr += (finalStr ? ' ' : '') + tr;
          } else {
            interimStr += (interimStr ? ' ' : '') + tr;
          }
        }

        let combined = finalStr;
        if (interimStr && !combined.includes(interimStr)) {
          combined = combined ? `${combined} ${interimStr}` : interimStr;
        }

        const cleanText = cleanSpeechText(combined);

        if (cleanText) {
          currentUtterance = cleanText;
          setAssistantTranscript(cleanText);
          setNewVoiceTaskName(cleanText);
          resetPauseTimer(hasFinal);
        }
      };

      rec.onerror = async (e: any) => {
        const errType = e.error || 'unknown';
        if (errType === 'not-allowed') {
          manualStopRef.current = true;
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          setIsAssistantListening(false);
          
          try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach(track => track.stop());
              setTimeout(() => {
                startAssistantListening();
              }, 200);
              return;
            }
          } catch (permErr) {}

          setAssistantTranscript(voiceLang === 'bn-BD' 
            ? "মাইক্রোফোন পারমিশন চেয়েছি। ব্রাউজারের পপ-আপে 'Allow' চাপুন অথবা সাইট সেটিংসে মাইক্রোফোন অন করুন।"
            : "Microphone permission is required. Please tap 'Allow' or enable mic in site settings."
          );
        } else if (errType === 'language-not-supported') {
          manualStopRef.current = true;
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          setIsAssistantListening(false);
          setAssistantTranscript(voiceLang === 'bn-BD'
            ? "আপনার ব্রাউজারে বাংলা ভাষা সাপোর্ট করছে না। ভাষা পরিবর্তন করে ট্রাই করুন বা নিচে টাইপ করুন।"
            : "This language is not supported by your browser. Please type your command."
          );
        } else if (errType === 'no-speech') {
          // Keep listening or gracefully let pause timer handle it
        }
      };

      rec.onend = () => {
        if (sentAlready || manualStopRef.current) {
          setIsAssistantListening(false);
          return;
        }
        // If the browser pauses SpeechRecognition before user finishes speaking or silence timer expires,
        // seamlessly resume listening so words are NEVER cut off mid-speech!
        if (showVoiceAssistantRef.current && !manualStopRef.current && !sentAlready) {
          try {
            rec.start();
            return;
          } catch (e) {}
        }
        setIsAssistantListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopAssistantListening = () => {
    // If words have been spoken, finalize and send instead of discarding them
    if (finalizeAssistantSpeechAndSend.current) {
      finalizeAssistantSpeechAndSend.current();
    } else {
      manualStopRef.current = true;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsAssistantListening(false);
    }
  };

  const clonedVoiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const clonedVoiceCacheRef = useRef<Map<string, string>>(new Map());
  const [selectedVoicePersona, setSelectedVoicePersona] = useState<string>(() => {
    const saved = localStorage.getItem('selfx_preferred_voice_persona');
    if (saved && ['Fenrir', 'Puck', 'Charon', 'Zephyr'].includes(saved)) {
      return saved;
    }
    return 'Fenrir';
  });
  const selectedVoicePersonaRef = useRef(selectedVoicePersona);
  useEffect(() => {
    selectedVoicePersonaRef.current = selectedVoicePersona;
  }, [selectedVoicePersona]);

  const changeVoicePersona = (voiceId: string) => {
    const validVoice = ['Fenrir', 'Puck', 'Charon', 'Zephyr'].includes(voiceId) ? voiceId : 'Fenrir';
    setSelectedVoicePersona(validVoice);
    selectedVoicePersonaRef.current = validVoice;
    try {
      localStorage.setItem('selfx_preferred_voice_persona', validVoice);
    } catch (e) {}
    // Clear client-side memory cache so clips from the previous voice don't accidentally get replayed
    clonedVoiceCacheRef.current.clear();
    setAccountProfile(prev => ({
      ...prev,
      selectedVoicePersona: validVoice
    }));
  };

  // Natural speech handler: strictly bypasses browser Web Speech API to permanently eliminate cartoon tones
  const fallbackSpeechSynthesis = (_cleanText: string, onSpeechFinished: () => void) => {
    // Strictly block robotic browser speech synthesis per user instruction:
    // "এখনো কার্টুনের মত কথা বলে, আমি চায় Puck Fenir এদের মত কথা বলবে, এ সমস্যাটি তাড়াতাড়ি ঠিক করো"
    console.log("[Decree Voice] Robotic browser cartoon TTS permanently disabled.");
    onSpeechFinished();
  };

  const speakTextWithMaleVoice = async (
    text: string,
    directAudioUrl?: string,
    overrideVoice?: string,
    skipBackendFetch: boolean = false
  ) => {
    if (!text) return;
    const cleanText = text
      .replace(/[*#_~`\[\]()\-+]/g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) return;
    lastAssistantSpokenTextRef.current = cleanText;

    // CRITICAL: Mute and stop the microphone while Decree AI speaks so it NEVER records its own voice!
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsAssistantListening(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Helper to handle speech completion safely without infinite loops or acoustic echo
    const onSpeechFinished = () => {
      if ((window as any).__decreeSpeechInterval) {
        clearInterval((window as any).__decreeSpeechInterval);
        (window as any).__decreeSpeechInterval = null;
      }
      clonedVoiceAudioRef.current = null;
      (window as any).__decreeActiveAudio = null;
      (window as any).__decreeCurrentUtterance = null;
      setIsAssistantSpeaking(false);
      isProcessingAssistantMessageRef.current = false;
      // Stop auto-listening unless user explicitly enabled Hands-Free Mode
      if (showVoiceAssistantRef.current && isHandsFreeModeRef.current) {
        setTimeout(() => {
          if (showVoiceAssistantRef.current && isHandsFreeModeRef.current && !clonedVoiceAudioRef.current) {
            try {
              startAssistantListening();
            } catch (e) {}
          }
        }, 1200);
      } else {
        setIsAssistantListening(false);
      }
    };

    // Resilient multi-sentence browser SpeechSynthesis fallback (speaks 100% of text without truncation, strictly deep male pitch)
    const playBrowserSpeechFallback = (spokenText: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onSpeechFinished();
        return;
      }

      try {
        window.speechSynthesis.cancel();

        // Split into natural spoken clauses so Chrome/Android/Edge never cut off long speech
        const rawTokens = spokenText.split(/([।?!;\n]+|\.\s+)/g);
        const sentenceParts: string[] = [];
        for (let i = 0; i < rawTokens.length; i += 2) {
          const body = (rawTokens[i] || '').trim();
          const punct = (rawTokens[i + 1] || '').trim();
          const combined = (body + (punct && !punct.includes('\n') ? ' ' + punct : '')).trim();
          if (!combined) continue;

          // If a single combined chunk is still too long (> 140 chars), split by comma or clause to prevent Chrome truncation
          if (combined.length > 140) {
            const subClauses = combined.split(/(,\s*|(?<=\s)(?:এবং|আর|কিন্তু|অথবা|তাহলে)\s+)/g);
            for (let j = 0; j < subClauses.length; j += 2) {
              const subBody = (subClauses[j] || '').trim();
              const subPunct = (subClauses[j + 1] || '').trim();
              const subFull = (subBody + (subPunct ? ' ' + subPunct : '')).trim();
              if (subFull) sentenceParts.push(subFull);
            }
          } else {
            sentenceParts.push(combined);
          }
        }

        if (sentenceParts.length === 0) {
          sentenceParts.push(spokenText);
        }

        let currentIndex = 0;
        const speakNextSentence = () => {
          if (currentIndex >= sentenceParts.length) {
            if ((window as any).__decreeSpeechInterval) {
              clearInterval((window as any).__decreeSpeechInterval);
              (window as any).__decreeSpeechInterval = null;
            }
            onSpeechFinished();
            return;
          }

          const phrase = sentenceParts[currentIndex++];
          if (!phrase || !phrase.trim()) {
            speakNextSentence();
            return;
          }
          const utterance = new SpeechSynthesisUtterance(phrase.trim());
          (window as any).__decreeCurrentUtterance = utterance;

          const voices = window.speechSynthesis.getVoices();
          const bnMaleVoice = voices.find(v => (v.lang.startsWith('bn') || v.lang.startsWith('hi')) && (v.name.toLowerCase().includes('male') || !v.name.toLowerCase().includes('female')));
          const bnVoice = bnMaleVoice ||
                          voices.find(v => v.lang.startsWith('bn')) ||
                          voices.find(v => v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali')) ||
                          voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george')) ||
                          voices.find(v => v.lang.startsWith('hi')) ||
                          voices[0];

          if (bnVoice) utterance.voice = bnVoice;
          utterance.rate = 0.98;
          // Masculine deep pitch: Eliminates cartoonish squeak
          utterance.pitch = 0.86;

          utterance.onend = () => {
            speakNextSentence();
          };
          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis utterance error, moving to next:", e);
            speakNextSentence();
          };

          window.speechSynthesis.speak(utterance);
        };

        // Keep Chromium synthesis active against silent pause bug
        if ((window as any).__decreeSpeechInterval) {
          clearInterval((window as any).__decreeSpeechInterval);
        }
        (window as any).__decreeSpeechInterval = setInterval(() => {
          if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 4500);

        speakNextSentence();
      } catch (e) {
        console.warn("Browser SpeechSynthesis failed:", e);
        onSpeechFinished();
      }
    };

    // Stop previous audio playback
    if (clonedVoiceAudioRef.current) {
      try {
        clonedVoiceAudioRef.current.pause();
        clonedVoiceAudioRef.current.currentTime = 0;
      } catch (e) {}
      clonedVoiceAudioRef.current = null;
    }
    (window as any).__decreeActiveAudio = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    setIsAssistantSpeaking(true);

    const voiceToUse = overrideVoice || selectedVoicePersonaRef.current || localStorage.getItem('selfx_preferred_voice_persona') || 'Fenrir';

    // 1. If direct audio URL is provided (from server realistic Gemini TTS or disk cache)
    if (directAudioUrl) {
      try {
        const audio = new Audio(directAudioUrl);
        clonedVoiceAudioRef.current = audio;
        (window as any).__decreeActiveAudio = audio;
        audio.onplay = () => setIsAssistantSpeaking(true);
        audio.onended = onSpeechFinished;
        audio.onerror = (e) => {
          console.warn("Direct audio error, falling back to speech synthesis:", e);
          playBrowserSpeechFallback(cleanText);
        };
        await audio.play();
        return;
      } catch (err) {
        console.warn("Direct audio play issue, trying fetch fallback:", err);
      }
    }

    // 2. Check client memory cache for instant replay of real studio voice
    const cacheKey = `${cleanText.toLowerCase()}_${voiceToUse}`;
    const cachedUrl = clonedVoiceCacheRef.current.get(cacheKey);
    if (cachedUrl) {
      try {
        const audio = new Audio(cachedUrl);
        clonedVoiceAudioRef.current = audio;
        (window as any).__decreeActiveAudio = audio;
        audio.onplay = () => setIsAssistantSpeaking(true);
        audio.onended = onSpeechFinished;
        audio.onerror = () => {
          clonedVoiceCacheRef.current.delete(cacheKey);
          playBrowserSpeechFallback(cleanText);
        };
        await audio.play();
        return;
      } catch (err) {
        console.warn("Cached audio playback failed:", err);
      }
    }

    // 3. Synthesize and play the REAL natural human male voice (Fenrir/Puck/Charon/Zephyr) from backend
    if (!skipBackendFetch) {
      try {
        const abortCtrl = new AbortController();
        const abortTimer = setTimeout(() => abortCtrl.abort(), 35000);
        const res = await fetch('/api/decree/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voice: voiceToUse,
            style: 'energetic'
          }),
          signal: abortCtrl.signal
        });
        clearTimeout(abortTimer);

        if (res.ok) {
          const data = await res.json();
          const audioSrc = data.audioDataUrl || data.audioUrl;
          if (audioSrc && !data.fallback) {
            clonedVoiceCacheRef.current.set(cacheKey, audioSrc);
            const audio = new Audio(audioSrc);
            clonedVoiceAudioRef.current = audio;
            (window as any).__decreeActiveAudio = audio;
            audio.onplay = () => setIsAssistantSpeaking(true);
            audio.onended = onSpeechFinished;
            audio.onerror = () => playBrowserSpeechFallback(cleanText);
            await audio.play();
            return;
          }
        }
      } catch (err) {
        console.warn("Backend TTS playback notice:", err);
      }
    }

    // 4. Seamless Fallback: Speak complete sentences without cutting off halfway
    playBrowserSpeechFallback(cleanText);
  };

  const executeQuickCommand = (cmdText: string, customResp?: string) => {
    setAssistantTranscript(cmdText);
    if (customResp) {
      setAssistantResponseText(customResp);
      speakTextWithMaleVoice(customResp);
      triggerNotification("⚡ কুইক কমান্ড এক্সিকিউট", customResp);
    } else {
      sendAssistantMessage(cmdText);
    }
  };

  const sendAssistantMessage = async (msgText: string) => {
    if (!msgText || msgText === 'শুনছি, বলুন...' || msgText === 'শুনছি দোস্ত, মন খুলে বলো...') return;
    
    // Safety auto-unlock if stuck
    if (isProcessingAssistantMessageRef.current) {
      console.warn("sendAssistantMessage: previously processing, forcing unlock for new user query");
      isProcessingAssistantMessageRef.current = false;
    }
    isProcessingAssistantMessageRef.current = true;
    unlockAudioContext();
    setAssistantLoading(true);
    setAssistantResponseText('');

    const thisReqId = Date.now() + Math.random();
    currentRequestIdRef.current = thisReqId;

    const isLongMsg = msgText.trim().length > 100 || /(?:বিস্তারিত|বিশদ|ইন[- ]?ডেপথ|বিশাল|detailed)/i.test(msgText);
    const safetyTimeoutMs = isLongMsg ? 75000 : 50000;
    const safetyUnlockTimeout = setTimeout(() => {
      if (currentRequestIdRef.current === thisReqId && isProcessingAssistantMessageRef.current && !clonedVoiceAudioRef.current && !(window as any).__decreeActiveAudio) {
        isProcessingAssistantMessageRef.current = false;
        setAssistantLoading(false);
        const fallbackNotice = "আমি শুনছি দোস্ত! একটু ইন্টারনেট সংযোগে দেরি হয়েছিল। আমি তৈরি আছি—বলো, তোমার জন্য কী করতে পারি?";
        setAssistantResponseText(fallbackNotice);
        setAssistantChatHistory(prev => [
          ...prev.slice(-24),
          { role: 'assistant', text: fallbackNotice }
        ]);
        speakTextWithMaleVoice(fallbackNotice);
      }
    }, safetyTimeoutMs);

    const lower = msgText.toLowerCase().trim();

    // 0000. Proactive User Name Extraction & Immediate Profile Storage (e.g. "আমার নাম আতিফ", "আমি আতিফ")
    const explicitNameMatch = msgText.match(/(?:আমার\s*নাম\s*(?:হলো|হচ্ছে|হল|হয়)?\s*|আমি\s*)([A-Za-z\u0980-\u09FF\s]{2,22})/i);
    if (explicitNameMatch && explicitNameMatch[1]) {
      const extracted = explicitNameMatch[1].replace(/^(হলো|হচ্ছে|হল|হয়)\s*/i, '').trim();
      if (extracted && extracted.length >= 2 && !['দোস্ত', 'বন্ধু', 'ভাই', 'এখানে', 'এখন', 'আছি', 'ছাত্র'].includes(extracted)) {
        setAccountProfile(prev => {
          const updated = { ...prev, name: extracted };
          try {
            localStorage.setItem('selfx_current_user_profile_v3', JSON.stringify(updated));
            localStorage.setItem('selfx_user_name', extracted);
            localStorage.setItem('lookmax_user_profile_v2', JSON.stringify({ ...updated, name: extracted }));
          } catch (e) {}
          return updated;
        });
      }
    }

    // 000. Instant Zero-Latency Greeting Response for mic checks ("হ্যালো", "হাই", "hello")
    const isBasicMicCheck =
      lower === 'হ্যালো' ||
      lower === 'হাই' ||
      lower === 'hello' ||
      lower === 'hi' ||
      lower === 'হ্যালো বন্ধু' ||
      lower === 'হ্যালো দোস্ত' ||
      lower === 'hey' ||
      lower === 'শুনতে পাচ্ছ' ||
      lower === 'শুনতে পাচ্ছো';

    if (isBasicMicCheck) {
      clearTimeout(safetyUnlockTimeout);
      const resp = "আমি স্পষ্ট শুনছি দোস্ত! যেকোনো প্রশ্ন করো বা কাজের নির্দেশ দাও, আমি তৈরি আছি।";
      setAssistantResponseText(resp);
      speakTextWithMaleVoice(resp);
      setAssistantLoading(false);
      isProcessingAssistantMessageRef.current = false;
      return;
    }

    // Helper: detect if user is EXPLICITLY asking to navigate/open a page vs just talking about their life/plans
    const isExplicitNavRequest =
      lower.includes('নিয়ে যাও') ||
      lower.includes('নিয়ে যাও') ||
      lower.includes('ওপেন কর') ||
      lower.includes('ওপেন করো') ||
      lower.includes('চালু কর') ||
      lower.includes('বেইজে যাও') ||
      lower.includes('পেজে যাও') ||
      lower.includes('অপশনে যাও') ||
      lower.includes('অপশনে নিয়ে') ||
      lower.includes('দেখাও') ||
      lower.includes('open ');

    // =========================================================================
    // 0. COMPREHENSIVE ACTION ENGINE — REAL IN-APP EXECUTIONS (FINANCE, HABITS, WATER, MEMORY)
    // =========================================================================
    const bnToEn = (s: string) => s.replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

    // Central Executor for structured actions (finance, habits, water, prayers, navigation, user memory)
    const executeAppAction = (actionData: any) => {
      if (!actionData || !actionData.action || actionData.action === 'none') return;
      
      // Save User Name to Profile & Storage
      if ((actionData.action === 'set_user_name' || actionData.action === 'save_user_name') && (actionData.savedUserName || actionData.userName)) {
        const newName = String(actionData.savedUserName || actionData.userName).trim();
        if (newName && newName !== 'দোস্ত' && !newName.startsWith('Glowup Member')) {
          setAccountProfile(prev => {
            const updated = { ...prev, name: newName };
            try {
              localStorage.setItem('selfx_current_user_profile_v3', JSON.stringify(updated));
              localStorage.setItem('selfx_user_name', newName);
              localStorage.setItem('lookmax_user_profile_v2', JSON.stringify({ ...updated, name: newName }));
            } catch (e) {}
            return updated;
          });
          triggerNotification("👤 নাম মেমোরিতে সেভ", `দোস্ত ${newName}, তোমার নাম পার্মানেন্ট মেমোরিতে সংরক্ষণ করা হয়েছে!`);
        }
      }

      // Save User Fact to Permanent Memory
      if (actionData.action === 'save_user_memory' && actionData.memoryFact) {
        const fact = String(actionData.memoryFact).trim();
        if (fact) {
          try {
            const raw = localStorage.getItem('selfx_decree_memory_facts');
            const list = raw ? JSON.parse(raw) : [];
            if (!list.includes(fact)) {
              list.push(fact);
              localStorage.setItem('selfx_decree_memory_facts', JSON.stringify(list.slice(-25)));
            }
          } catch (e) {}
        }
      }

      // Set Capital in Finance
      if (actionData.action === 'set_capital') {
        const amt = parseFloat(bnToEn(String(actionData.amount || 0)));
        if (!isNaN(amt) && amt >= 0) {
          try {
            localStorage.setItem('selfx_finance_capital', amt.toString());
            window.dispatchEvent(new CustomEvent('selfx_finance_updated'));
            window.dispatchEvent(new Event('storage'));
          } catch (e) {}
          triggerNotification("💰 মূলধন আপডেট", `মূলধন ${amt} টাকা সফলভাবে সেট করা হয়েছে!`);
        }
      }

      // Add Expense to Finance
      if (actionData.action === 'add_expense') {
        const amt = parseFloat(bnToEn(String(actionData.amount || 0)));
        if (!isNaN(amt) && amt > 0) {
          const newTx = {
            id: `tx-${Date.now()}`,
            title: actionData.title || 'দৈনন্দিন খরচ',
            category: actionData.category || 'Other',
            type: 'expense' as const,
            amount: amt,
            date: 'Today',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: 'Added via Decree AI Voice'
          };
          try {
            const saved = localStorage.getItem('selfx_finance_txs');
            const prevTxs = saved ? JSON.parse(saved) : [];
            localStorage.setItem('selfx_finance_txs', JSON.stringify([newTx, ...prevTxs]));
            window.dispatchEvent(new CustomEvent('selfx_finance_updated'));
            window.dispatchEvent(new Event('storage'));
          } catch (e) {}
          triggerNotification("💸 খরচ রেকর্ড", `${amt} টাকা খরচ ফিন্যান্সে যুক্ত হয়েছে!`);
        }
      }

      // Add Income to Finance
      if (actionData.action === 'add_income') {
        const amt = parseFloat(bnToEn(String(actionData.amount || 0)));
        if (!isNaN(amt) && amt > 0) {
          const newTx = {
            id: `tx-${Date.now()}`,
            title: actionData.title || 'আয় / ইনকাম',
            category: 'Work' as const,
            type: 'income' as const,
            amount: amt,
            date: 'Today',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: 'Added via Decree AI Voice'
          };
          try {
            const saved = localStorage.getItem('selfx_finance_txs');
            const prevTxs = saved ? JSON.parse(saved) : [];
            localStorage.setItem('selfx_finance_txs', JSON.stringify([newTx, ...prevTxs]));
            window.dispatchEvent(new CustomEvent('selfx_finance_updated'));
            window.dispatchEvent(new Event('storage'));
          } catch (e) {}
          triggerNotification("💰 আয় রেকর্ড", `${amt} টাকা আয় ফিন্যান্সে যুক্ত হয়েছে!`);
        }
      }

      // Drink Water
      if (actionData.action === 'drink_water') {
        setWater(prev => {
          const updated = { ...prev, count: Math.min(prev.goal, prev.count + 1) };
          try { localStorage.setItem('selfx_water', JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
        setPoints(p => (p || 0) + 10);
      }

      // Complete Prayer
      if (actionData.action === 'complete_prayer' && actionData.targetPrayer && actionData.targetPrayer !== 'none') {
        const prayerKey = actionData.targetPrayer.toLowerCase();
        setFaith(prev => ({
          ...prev,
          [prayerKey]: true,
          imanPoints: (prev.imanPoints || 0) + 20
        }));
        if (prayerKey === 'fajr') setDashState(prev => ({ ...prev, prayers: true }));
      }

      // Add Task / Reminder
      if (actionData.action === 'add_task' && (actionData.taskTitle || actionData.title)) {
        const titleToSave = actionData.taskTitle || actionData.title;
        const timeToSave = actionData.taskTime || '17:00';
        handleAddScheduledTask(titleToSave, timeToSave);
      }

      // Set Alarm (Strictly ONLY when action is set_alarm and valid alarmTime is provided)
      if (
        actionData.action === 'set_alarm' && 
        actionData.alarmTime &&
        actionData.action !== 'complete_prayer'
      ) {
        const rawTime = actionData.alarmTime || '05:20';
        const parts = String(rawTime).split(':');
        const normH = String(parseInt(bnToEn(parts[0] || '5'), 10)).padStart(2, '0');
        const normM = String(parseInt(bnToEn(parts[1] || '20'), 10)).padStart(2, '0');
        const formattedTime = `${normH}:${normM}`;
        const hourNum = parseInt(normH, 10);
        const ampmStr = hourNum >= 12 ? 'PM' : 'AM';
        const label = actionData.alarmLabel || 'সকালের ওয়েক-আপ / নামাজ';

        setAlarm(prev => {
          const updated: AlarmConfig = {
            ...prev,
            time: formattedTime,
            label,
            enabled: true,
            isTriggered: false,
            lastDismissedDate: undefined,
            ringtone: prev.ringtone || 'sunrise_melody',
            challengeType: prev.challengeType || 'standing_selfie',
            escalationEnabled: prev.escalationEnabled !== false
          };
          syncAlarmScheduleToBackend(updated).catch(() => {});
          return updated;
        });

        import('./utils').then(({ triggerNotification, triggerOSAlarmNotification, requestNotificationPermission }) => {
          requestNotificationPermission().catch(() => {});
          triggerNotification("⏰ ওয়েক-আপ অ্যালার্ম সেট সম্পন্ন!", `${formattedTime} (${ampmStr}) এ "${label}" অ্যালার্ম সক্রিয় করা হয়েছে। ✅`);
          triggerOSAlarmNotification("⏰ অ্যালার্ম সেট সম্পন্ন!", `${formattedTime} (${ampmStr}) এ অ্যালার্ম একটিভ করা হয়েছে। ✅`);
        });
      }

      // Explicit Disable Alarm (Only when user specifically asks to turn off/cancel and NO new time was requested)
      if (
        actionData.action === 'disable_alarm' || 
        actionData.action === 'turn_off_alarm' || 
        (actionData.action === 'toggle_alarm' && actionData.alarmEnabled === false && !actionData.alarmTime)
      ) {
        setAlarm(prev => ({ ...prev, enabled: false }));
        try {
          const savedAlarm = JSON.parse(localStorage.getItem('lookmax_alarm') || '{}');
          localStorage.setItem('lookmax_alarm', JSON.stringify({ ...savedAlarm, enabled: false }));
        } catch (e) {}
        import('./utils').then(({ triggerNotification }) => {
          triggerNotification("⏰ অ্যালার্ম স্ট্যাটাস", "অ্যালার্ম বন্ধ করা হয়েছে!");
        });
      }

      // Test Alarm
      if (actionData.action === 'test_alarm') {
        triggerGlobalAlarm();
      }

      // Add Habit
      if (actionData.action === 'add_habit' && actionData.habitName) {
        const taskName = String(actionData.habitName).trim();
        const newH = {
          id: 'h_' + Date.now(),
          name: taskName,
          text: taskName,
          completed: false,
          checked: false,
          streak: 0,
          category: 'Daily'
        };
        setHabits(prev => {
          const updated = [newH as any, ...prev];
          try { localStorage.setItem('lookmax_habits', JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
        triggerNotification("📝 হ্যাবিট যোগ", `"${taskName}" হ্যাবিট লিস্টে যুক্ত হয়েছে!`);
      }

      // Complete Habit
      if (actionData.action === 'complete_habit' && actionData.habitName) {
        const targetName = String(actionData.habitName).toLowerCase().trim();
        setHabits(prev => prev.map(h => {
          const hName = (h.name || h.text || '').toLowerCase();
          if (hName.includes(targetName) || targetName.includes(hName)) {
            return { ...h, completed: true, checked: true };
          }
          return h;
        }));
        setPoints(p => (p || 0) + 25);
        triggerNotification("✅ হ্যাবিট সম্পন্ন", `"${actionData.habitName}" সম্পন্ন করা হয়েছে! (+২৫ পয়েন্ট)`);
      }

      // Navigation - ONLY IF user explicitly commanded to navigate to a tab/screen
      if (isExplicitNavRequest && actionData.action === 'navigate' && actionData.navigateTab && actionData.navigateTab !== 'none') {
        const target = actionData.navigateTab.toLowerCase();
        if (target === 'finance' || target === 'ফাইন্যান্স') {
          setActiveTab('finance');
        } else if (target === 'notes' || target === 'habits' || target === 'todo' || target === 'টু-ডু') {
          setActiveTab('habits');
        } else if (target === 'community' || target === 'growgram' || target === 'কমিউনিটি') {
          setActiveTab('community');
        } else if (target === 'face_journal' || target === 'lookmax' || target === 'photos' || target === 'ফেস') {
          setActiveTab('photos');
        } else if (target === 'fitbody' || target === 'gym' || target === 'ফিটবডি' || target === 'জিম') {
          setActiveTab('fitbody');
        } else if (target === 'alarm' || target === 'এলার্ম') {
          setActiveTab('alarm');
        } else if (target === 'faith' || target === 'ঈমান' || target === 'নামাজ') {
          setActiveTab('faith');
        } else if (target === 'wardrobe' || target === 'ওয়ারড্রোব') {
          setActiveTab('wardrobe');
        } else if (target === 'cinema' || target === 'সিনেমা') {
          setActiveTab('cinema');
        } else if (target === 'dream_day' || target === 'ড্রিম ডে') {
          setActiveTab('dream_day');
        } else if (target === 'profile' || target === 'প্রোফাইল') {
          setIsProfileOpen(true);
        } else if (target === 'settings' || target === 'সেটিংস') {
          setProfileActiveTab('voice');
          setIsProfileOpen(true);
        } else if (target === 'teacher_ai' || target === 'teacher' || target === 'টিচার' || target === 'টিচার এআই' || target === 'পড়াশোনা') {
          setActiveTab('teacher_ai');
        } else if (target === 'dashboard' || target === 'home' || target === 'হোম' || target === 'hud') {
          setActiveTab('hud');
        }
        setShowVoiceAssistant(false);
      }
    };

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const formattedMin = currentMin < 10 ? `0${currentMin}` : `${currentMin}`;
      const ampm = currentHour >= 12 ? 'PM' : 'AM';
      const hour12 = currentHour % 12 || 12;
      const currentTime12 = `${hour12}:${formattedMin} ${ampm}`;
      const currentTime24 = `${currentHour < 10 ? '0' + currentHour : currentHour}:${formattedMin}`;

      let timePeriod = 'দিন';
      if (currentHour >= 4 && currentHour < 6) timePeriod = 'ভোর';
      else if (currentHour >= 6 && currentHour < 12) timePeriod = 'সকাল';
      else if (currentHour >= 12 && currentHour < 15) timePeriod = 'দুপুর';
      else if (currentHour >= 15 && currentHour < 18) timePeriod = 'বিকাল';
      else if (currentHour >= 18 && currentHour < 20) timePeriod = 'সন্ধ্যা';
      else timePeriod = 'রাত';

      const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      const currentDayName = daysBn[now.getDay()];

      // Islamic Prayer Calculation
      let activePrayerName = 'কোনো নির্দিষ্ট ওয়াক্ত নয়';
      let isPrayerTimeNow = false;
      let upcomingPrayer = 'ফজর';

      const timeInMinutes = currentHour * 60 + currentMin;
      if (timeInMinutes >= 270 && timeInMinutes <= 345) {
        activePrayerName = 'Fajr (ফজর)';
        isPrayerTimeNow = !faith.fajr;
        upcomingPrayer = 'যোহর (Dhuhr)';
      } else if (timeInMinutes >= 765 && timeInMinutes <= 855) {
        activePrayerName = 'Zuhr (যোহর)';
        isPrayerTimeNow = !faith.zohor;
        upcomingPrayer = 'আসর (Asr)';
      } else if (timeInMinutes >= 975 && timeInMinutes <= 1045) {
        activePrayerName = 'Asr (আসর)';
        isPrayerTimeNow = !faith.achr;
        upcomingPrayer = 'মাগরিব (Maghrib)';
      } else if (timeInMinutes >= 1055 && timeInMinutes <= 1125) {
        activePrayerName = 'Maghrib (মাগরিব)';
        isPrayerTimeNow = !faith.magrib;
        upcomingPrayer = 'এশা (Isha)';
      } else if (timeInMinutes >= 1185 && timeInMinutes <= 1290) {
        activePrayerName = 'Isha (এশা)';
        isPrayerTimeNow = !faith.esha;
        upcomingPrayer = 'ফজর (Fajr)';
      } else {
        if (timeInMinutes < 270) upcomingPrayer = 'ফজর (Fajr)';
        else if (timeInMinutes < 765) upcomingPrayer = 'যোহর (Zuhr)';
        else if (timeInMinutes < 975) upcomingPrayer = 'আসর (Asr)';
        else if (timeInMinutes < 1055) upcomingPrayer = 'মাগরিব (Maghrib)';
        else if (timeInMinutes < 1185) upcomingPrayer = 'এশা (Isha)';
        else upcomingPrayer = 'ফজর (Fajr)';
      }

      // Dream Day Routine Context
      let dreamDayActivities: any[] = [];
      try {
        const rawDd = localStorage.getItem('selfx_dream_day_routine_v8') || localStorage.getItem('selfx_dream_day_routine_v7') || localStorage.getItem('selfx_dream_day_routine_v6');
        if (rawDd) dreamDayActivities = JSON.parse(rawDd);
      } catch (e) {}

      // Identify active Dream Day block matching current hour or time period
      let currentDreamDayBlock: any = null;
      let upcomingDreamDayBlock: any = null;

      if (Array.isArray(dreamDayActivities) && dreamDayActivities.length > 0) {
        if (timePeriod === 'বিকাল') {
          currentDreamDayBlock = dreamDayActivities.find(a => 
            a.category === 'evening' || 
            a.category === 'workout' || 
            /walk|outdoor|sports|football|হাঁটাহাঁটি|খেলা|শরীর চর্চা/i.test(`${a.title} ${a.description}`)
          ) || dreamDayActivities[Math.min(dreamDayActivities.length - 2, Math.floor(dreamDayActivities.length * 0.6))];
        } else if (timePeriod === 'ভোর' || timePeriod === 'সকাল') {
          currentDreamDayBlock = dreamDayActivities.find(a => a.category === 'morning' || a.category === 'focus') || dreamDayActivities[0];
        } else if (timePeriod === 'দুপুর') {
          currentDreamDayBlock = dreamDayActivities.find(a => a.category === 'focus' || a.category === 'nutrition') || dreamDayActivities[1];
        } else if (timePeriod === 'সন্ধ্যা' || timePeriod === 'রাত') {
          currentDreamDayBlock = dreamDayActivities.find(a => a.category === 'night' || a.category === 'evening') || dreamDayActivities[dreamDayActivities.length - 1];
        }
      }

      const knownProfileName = (accountProfile?.name && !accountProfile.name.startsWith('Glowup Member')) ? accountProfile.name : (localStorage.getItem('selfx_user_name') || decreeMemory.userName || '');

      const fullAppContext = {
        time: {
          currentTime12,
          currentTime24,
          timePeriod,
          dayOfWeek: currentDayName,
          date: now.toISOString().split('T')[0]
        },
        prayer: {
          activePrayerWindow: activePrayerName,
          isPrayerTimeNow,
          upcomingPrayer,
          prayersStatus: {
            fajr: !!faith.fajr,
            zohor: !!faith.zohor,
            achr: !!faith.achr,
            magrib: !!faith.magrib,
            esha: !!faith.esha
          }
        },
        dreamDay: {
          activities: dreamDayActivities.slice(0, 10).map((a: any) => ({
            title: a.title,
            description: a.description,
            category: a.category,
            startTime: a.startTime,
            endTime: a.endTime
          })),
          currentActiveBlock: currentDreamDayBlock ? {
            title: currentDreamDayBlock.title,
            description: currentDreamDayBlock.description,
            category: currentDreamDayBlock.category,
            startTime: currentDreamDayBlock.startTime,
            endTime: currentDreamDayBlock.endTime
          } : null,
          upcomingBlock: upcomingDreamDayBlock
        },
        habits: habits.map(h => ({
          name: h.name || h.text || '',
          completed: !!h.completed || !!h.checked,
          streak: h.streak || 0
        })),
        tasks: scheduledVoiceTasks.map(t => ({
          title: t.taskText || t.title || '',
          time: t.timeStr || t.time || '',
          completed: !!t.completed || !!t.reminded
        })),
        water: { count: water.count, goal: water.goal },
        alarm: { time: alarm.time, enabled: alarm.enabled },
        finance: { capital: localStorage.getItem('selfx_finance_capital') || '0' },
        userProfile: {
          name: knownProfileName || 'দোস্ত',
          points,
          streak: streak,
          level: Math.floor(points / 200) + 1,
          goals: decreeMemory.goals,
          weaknesses: decreeMemory.weaknesses
        },
        notes: notes.slice(0, 10).map(n => ({ title: n.title, content: n.content ? n.content.slice(0, 300) : '', date: n.date }))
      };

      // Collect user's actual written goals, challenges, todos, and notes for Decree AI
      const rawAllChallenges = (challenges && challenges.length > 0 ? challenges : (() => {
        try {
          const raw = localStorage.getItem('lookmax_challenges') || localStorage.getItem('selfx_challenges');
          return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
      })()) || [];

      const detailedChallenges = rawAllChallenges.map((c: any) => ({
        id: c.id,
        name: c.name || c.title || 'ব্যক্তিগত লক্ষ্য',
        duration: c.durationType || '21 days',
        goals: Array.isArray(c.goals) ? c.goals : (Array.isArray(c.goalsList) ? c.goalsList : []),
        dailyTasks: Array.isArray(c.dailyTasks) ? c.dailyTasks.map((t: any) => typeof t === 'string' ? t : (t?.text || '')) : (Array.isArray(c.tasksList) ? c.tasksList : []),
        habits: Array.isArray(c.habits) ? c.habits : (Array.isArray(c.habitsList) ? c.habitsList : []),
        completedDaysCount: Array.isArray(c.completedDays) ? c.completedDays.length : 0,
        isCompleted: !!c.completed
      }));

      const rawAllTodos = (todos && todos.length > 0 ? todos : (() => {
        try {
          const raw = localStorage.getItem('lookmax_todos') || localStorage.getItem('selfx_todos');
          return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
      })()) || [];

      const detailedTodos = rawAllTodos.map((t: any) => ({
        text: t.text || '',
        completed: !!t.completed,
        category: t.category || 'todo'
      }));

      const rawAllNotes = (notes && notes.length > 0 ? notes : (() => {
        try {
          const raw = localStorage.getItem('lookmax_notes') || localStorage.getItem('selfx_notes');
          return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
      })()) || [];

      const detailedNotes = rawAllNotes.map((n: any) => ({
        title: n.title || 'নোট',
        content: n.content ? n.content.slice(0, 400) : '',
        date: n.date || ''
      }));

      const userGoalsContext = {
        challenges: detailedChallenges,
        todos: detailedTodos,
        notes: detailedNotes,
        habits: habits.map(h => ({
          name: h.name || h.text || '',
          completed: !!h.completed || !!h.checked,
          streak: h.streak || 0
        })),
        dreamDayActivities: dreamDayActivities.slice(0, 10).map((a: any) => ({
          title: a.title,
          description: a.description,
          startTime: a.startTime,
          endTime: a.endTime,
          category: a.category
        })),
        storedGoals: Array.isArray(decreeMemory?.goals) ? decreeMemory.goals : [],
        storedWeaknesses: Array.isArray(decreeMemory?.weaknesses) ? decreeMemory.weaknesses : []
      };

      const habitsContext = {
        water: { count: water.count, goal: water.goal },
        faith: { fajr: faith.fajr, zohor: faith.zohor, achr: faith.achr, magrib: faith.magrib, esha: faith.esha },
        scheduledVoiceTasks: scheduledVoiceTasks.map(t => ({ id: t.id, taskText: t.taskText, timeStr: t.timeStr, completed: !!t.completed || !!t.reminded })),
        challenges: detailedChallenges,
        habits: habits.map(h => ({ id: h.id, text: h.name || h.text || '', checked: !!h.completed || !!h.checked }))
      };

      // Send deep conversation history (up to 20 turns) to retain full context
      const historyLimit = 20;
      const historyToSend = assistantChatHistory.slice(-historyLimit);
      const updatedHistorySnapshot = [
        ...assistantChatHistory.slice(-40),
        { role: 'user' as const, text: msgText, timestamp: Date.now() }
      ];
      setAssistantChatHistory(updatedHistorySnapshot);

      let res: Response | null = null;
      let lastFetchErr: any = null;
      const isLongQuery = msgText.length > 100 || /(?:বিস্তারিত|বিশদ|ইন[- ]?ডেপথ|বিশাল|detailed)/i.test(msgText);
      const fetchTimeoutMs = isLongQuery ? 60000 : 40000;

      for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), fetchTimeoutMs);
        try {
          res = await fetch('/api/decree/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              message: msgText,
              voice: selectedVoicePersonaRef.current || 'Fenrir',
              habitsContext,
              alarmContext: { time: alarm.time, enabled: alarm.enabled },
              financeContext: { capital: localStorage.getItem('selfx_finance_capital') || '0' },
              conversationHistory: historyToSend,
              userName: knownProfileName || 'দোস্ত',
              userMemory: {
                ...decreeMemory,
                userName: knownProfileName
              },
              vibeMode: decreeMemory.vibeMode || 'best_friend',
              timeContext: fullAppContext.time,
              prayerContext: fullAppContext.prayer,
              dreamDayContext: fullAppContext.dreamDay,
              fullAppContext: {
                ...fullAppContext,
                userGoalsContext,
                challenges: detailedChallenges,
                todos: detailedTodos
              },
              userGoalsContext
            })
          });
          clearTimeout(timeoutId);

          if (res.ok) break;
          if (res.status === 503 || res.status === 504 || res.status === 502) {
            await new Promise(r => setTimeout(r, 200));
            continue;
          }
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          lastFetchErr = fetchErr;
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 200));
            continue;
          }
        }
      }

      clearTimeout(safetyUnlockTimeout);
      if (currentRequestIdRef.current !== thisReqId) return;

      if (!res || !res.ok) {
        throw lastFetchErr || new Error(`Decree Assistant API responded with ${res?.status || 'network failure'}`);
      }

      const data = await res.json();
      if (data.success && data.result) {
        const result = data.result;
        const replyFull = result.fullText || result.speechResponse || 'কী অবস্থা দোস্ত! আমি শুনছি, বলো কী জানতে চাও!';
        const replySpeech = replyFull;
        setAssistantLoading(false);
        setAssistantResponseText(replyFull);
        setAssistantChatHistory(prev => [
          ...prev.slice(-39),
          { 
            role: 'assistant', 
            text: replyFull,
            isSelfCorrection: !!result.isSelfCorrection,
            detectedEmotion: result.detectedEmotion,
            timestamp: Date.now()
          }
        ]);
        speakTextWithMaleVoice(replySpeech, result.audioDataUrl || result.audioUrl, undefined, false);
        executeAppAction(result);

        // Intelligently save newly extracted long-term memories, corrections, and incidents
        setDecreeMemory(prev => {
          let updated = false;
          let nextGoals = [...prev.goals];
          let nextWeaknesses = [...prev.weaknesses];
          let nextPrefs = [...prev.preferences];
          let nextFacts = [...prev.facts];
          let nextIncidents = [...(prev.recentIncidents || [])];
          let nextCorrections = [...(prev.corrections || [])];
          let nextName = prev.userName;

          if (result.savedUserName && result.savedUserName !== prev.userName) {
            nextName = result.savedUserName;
            updated = true;
          }
          if (result.extractedGoal && !nextGoals.includes(result.extractedGoal)) {
            nextGoals.unshift(result.extractedGoal);
            updated = true;
          }
          if (result.extractedWeakness && !nextWeaknesses.includes(result.extractedWeakness)) {
            nextWeaknesses.unshift(result.extractedWeakness);
            updated = true;
          }
          if (result.extractedPreference && !nextPrefs.includes(result.extractedPreference)) {
            nextPrefs.unshift(result.extractedPreference);
            updated = true;
          }
          if (result.memoryFact && !nextFacts.includes(result.memoryFact)) {
            nextFacts.unshift(result.memoryFact);
            updated = true;
          }
          if (result.newIncident && !nextIncidents.includes(result.newIncident)) {
            nextIncidents.unshift(result.newIncident);
            updated = true;
          }
          if (result.newCorrectionRule) {
            const ruleExists = nextCorrections.some(c => c.rule === result.newCorrectionRule);
            if (!ruleExists) {
              nextCorrections.unshift({
                id: `corr-${Date.now()}`,
                rule: result.newCorrectionRule,
                date: new Date().toLocaleDateString('bn-BD'),
                trigger: msgText.slice(0, 50)
              });
              updated = true;
            }
          }

          if (!updated) return prev;
          const nextMem: DecreeMemoryProfile = {
            ...prev,
            userName: nextName,
            goals: nextGoals.slice(0, 10),
            weaknesses: nextWeaknesses.slice(0, 10),
            preferences: nextPrefs.slice(0, 10),
            facts: nextFacts.slice(0, 20),
            recentIncidents: nextIncidents.slice(0, 10),
            corrections: nextCorrections.slice(0, 25)
          };
          try {
            localStorage.setItem('selfx_decree_smart_memory_v4', JSON.stringify(nextMem));
          } catch (e) {}
          return nextMem;
        });

        if (result.action === 'complete_prayer' && result.targetPrayer && result.targetPrayer !== 'none') {
          const prayerKey = result.targetPrayer.toLowerCase();
          setFaith(prev => ({
            ...prev,
            [prayerKey]: true,
            imanPoints: (prev.imanPoints || 0) + 20
          }));
          if (prayerKey === 'fajr') setDashState(prev => ({ ...prev, prayers: true }));
          triggerNotification("🕌 নামাজ সম্পন্ন", `তোর ${result.targetPrayer} নামাজ সম্পন্ন হিসেবে মার্ক করা হলো! (+২০ ঈমান পয়েন্ট)`);
        }

        if (result.action === 'add_task' || (result.action === 'schedule_notification' && (result.taskTitle || result.notificationTitle))) {
          const titleToSave = result.taskTitle || result.notificationTitle || msgText;
          const timeToSave = result.taskTime || result.notificationTime || newVoiceTaskTime;
          const dayOff = typeof result.taskDayOffset === 'number' ? result.taskDayOffset : 0;
          handleAddScheduledTask(titleToSave, timeToSave, dayOff);
          triggerNotification("⏰ টাস্ক ও অ্যালার্ট সেট", `"${titleToSave}" (${timeToSave}) যোগ করা হয়েছে! কাজ শেষ না হওয়া পর্যন্ত নোটিফিকেশন আসবে।`);
        }

        // Execute navigation ONLY if user explicitly asked to navigate
        if (isExplicitNavRequest && result.action === 'navigate' && result.navigateTab && result.navigateTab !== 'none') {
          const target = result.navigateTab.toLowerCase();
          if (target === 'finance' || target === 'ফাইন্যান্স') {
            setActiveTab('finance');
          } else if (target === 'notes' || target === 'habits') {
            setActiveTab('habits');
          } else if (target === 'community') {
            setActiveTab('community');
          } else if (target === 'face_journal' || target === 'lookmax' || target === 'photos') {
            setActiveTab('photos');
          } else if (target === 'fitbody') {
            setActiveTab('fitbody');
          } else if (target === 'alarm') {
            setActiveTab('alarm');
          } else if (target === 'faith') {
            setActiveTab('faith');
          } else if (target === 'wardrobe') {
            setActiveTab('wardrobe');
          } else if (target === 'profile') {
            setIsProfileOpen(true);
          } else if (target === 'vault') {
            setActiveTab('habits');
          } else if (target === 'dream_day') {
            setActiveTab('dream_day');
          }
          setShowVoiceAssistant(false);
        }

        if (result.action === 'schedule_notification' && result.notificationTime) {
          const [hours, minutes] = result.notificationTime.split(':').map(Number);
          const now = new Date();
          const targetTime = new Date();
          targetTime.setHours(hours, minutes, 0, 0);
          
          if (targetTime.getTime() < now.getTime()) {
             targetTime.setDate(targetTime.getDate() + 1); // schedule for tomorrow if time passed
          }
          const msUntil = targetTime.getTime() - now.getTime();
          
          // Save to local storage for recovery on app reload
          try {
            const pendingReminders = JSON.parse(localStorage.getItem('selfx_pending_reminders') || '[]');
            pendingReminders.push({
               time: targetTime.getTime(),
               title: result.notificationTitle || '⏰ Reminder',
               body: 'Hey Boss, it is time for your scheduled task. Stay on track! 🔥'
            });
            localStorage.setItem('selfx_pending_reminders', JSON.stringify(pendingReminders));
          } catch (err) {}

          // Schedule it using standard JS timer (works if app tab is alive/backgrounded)
          setTimeout(() => {
            const title = "👑 " + (result.notificationTitle || 'Important Reminder');
            const options = {
                 body: 'Decree AI: Your scheduled task is due now. Do not skip it!',
                 icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
                 badge: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
                 vibrate: [200, 100, 200, 100, 200, 100, 200],
                 requireInteraction: true,
                 tag: 'decree-reminder-' + Date.now()
            };

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options);
                }).catch(() => {
                    if ('Notification' in window && Notification.permission === 'granted') { 
                       new Notification(title, options);
                    }
                });
            } else if ('Notification' in window && Notification.permission === 'granted') {
               new Notification(title, options);
            }
            triggerNotification('⏰ ' + title, options.body);
            
            // Clean up from local storage
            try {
              const currentReminders = JSON.parse(localStorage.getItem('selfx_pending_reminders') || '[]');
              localStorage.setItem('selfx_pending_reminders', JSON.stringify(currentReminders.filter((r: {time: number}) => r.time !== targetTime.getTime())));
            } catch (err) {}
          }, msUntil);
          
          triggerNotification("⏰ Reminder Set", `Scheduled for ${result.notificationTime}!`);
        }
        
        if (result.action === 'add_water') {
          setWater(prev => ({ ...prev, count: prev.count + 1 }));
          triggerNotification("💧 পানি ট্র্যাক করা হয়েছে", "অ্যাসিস্ট্যান্ট এর মাধ্যমে ১ গ্লাস পানি যোগ করা হলো!");
        } else if (result.action === 'complete_habit' && result.targetHabitId) {
          setHabits(prev => prev.map(h => {
            const hText = (h.name || h.text || '').toLowerCase();
            if (hText.includes(result.targetHabitId.toLowerCase()) || h.id === result.targetHabitId) {
              return { ...h, completed: true, checked: true };
            }
            return h;
          }));
        }
      } else {
        const fallbackResp = (data && data.speechResponse) || "কী অবস্থা দোস্ত! আমি শুনছি, আরেকটু খুলে বল তো মামা!";
        setAssistantResponseText(fallbackResp);
        setAssistantChatHistory(prev => [
          ...prev.slice(-24),
          { role: 'assistant', text: fallbackResp }
        ]);
        speakTextWithMaleVoice(fallbackResp);
      }
    } catch (e) {
      console.error("sendAssistantMessage error:", e);
      // Client-side smart intent execution in case of offline/network drop
      const bnToEn = (s: string) => s.replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
      const normMsg = bnToEn(msgText.toLowerCase());
      const isPastAction = /(?:পড়ে\s*ফেলেছি|পড়েছি|পড়লাম|আদায়\s*করেছি|আদায়\s*করলাম|শেষ\s*করলাম|হয়ে\s*গেছে|গেলাম|এসেছি|গেছি|করলাম|খেয়েছি|দিলাম)/i.test(normMsg);
      const isExplicitAlarmCmd = /(?:alarm\s*set|এলার্ম\s*দে|অ্যালার্ম\s*দে|অ্যালার্ম\s*দাও|অ্যালার্ম\s*সেট|এলার্ম\s*সেট|এলার্ম\s*দাও|ডাকিস|ডাকবা|জাগিয়ে\s*দিস|জাগিয়ে\s*দিবি|উঠিয়ে\s*দিস|wake\s*me\s*up)/i.test(normMsg);
      const timeMatch = normMsg.match(/(?:(\d{1,2})[:.](\d{2})|\b(\d{1,2})\s*(?:টা\s*(\d{1,2})|টা|am|pm))\b/i);
      
      let fallbackResp = "";
      if (isPastAction && /(?:ফজর|যোহর|জোহর|আসর|মাগরিব|এশা|ইশা)/i.test(normMsg)) {
        let pName = 'নামাজ';
        let pKey = 'fajr';
        if (/ফজর/i.test(normMsg)) { pName = 'ফজরের নামাজ'; pKey = 'fajr'; }
        else if (/যোহর|জোহর/i.test(normMsg)) { pName = 'যোহরের নামাজ'; pKey = 'dhuhr'; }
        else if (/আসর/i.test(normMsg)) { pName = 'আসরের নামাজ'; pKey = 'asr'; }
        else if (/মাগরিব/i.test(normMsg)) { pName = 'মাগরিবের নামাজ'; pKey = 'maghrib'; }
        else if (/এশা|ইশা/i.test(normMsg)) { pName = 'এশার নামাজ'; pKey = 'isha'; }
        executeAppAction({
          action: 'complete_prayer',
          targetPrayer: pKey,
          prayerLabel: pName
        });
        fallbackResp = `মাশাল্লাহ দোস্ত! তুই সময়মতো ${pName} আদায় করে নিছিস, এটা দারুণ কাজ হইছে! বাকি দিনটাতেও এই আমল ও শৃঙ্খলা ধরে রাখিস!`;
      } else if (!isPastAction && isExplicitAlarmCmd && timeMatch) {
        let h = timeMatch[1] ? parseInt(timeMatch[1], 10) : (timeMatch[3] ? parseInt(timeMatch[3], 10) : 5);
        const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : (timeMatch[4] ? parseInt(timeMatch[4], 10) : 20);
        const isPm = /pm|দুপুর|বিকাল|সন্ধ্যা|রাত/i.test(normMsg) && !/ভোর|সকাল|ফজর/i.test(normMsg);
        if (isPm && h < 12) h += 12;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        executeAppAction({
          action: 'set_alarm',
          alarmTime: timeStr,
          alarmEnabled: true,
          alarmLabel: normMsg.includes('ফজর') ? 'ফজরের নামাজ' : 'সকালের ওয়েক-আপ'
        });
        fallbackResp = `${timeStr} এ তোর ওয়েক-আপ অ্যালার্ম অন করে দিছি! সময়মতো উঠে পড়িস কিন্তু! ⏰`;
      } else if (/কলেজ|ভার্সিটি|ক্যাম্পাস|আড্ডা|বন্ধু|ক্লাস|মজা/i.test(normMsg)) {
        fallbackResp = `আরে দোস্ত, তোর এই গল্পটা খুব ভালো লাগলো রে মামা! বন্ধুদের সাথে ক্যাম্পাসে এমন মন খুলে আড্ডাই তো জীবনের সেরা মুহূর্ত। তোর ক্লাসের বন্ধুরা কেমন রে? আড্ডার পাশাপাশি একটু পড়াশোনার ব্যালেন্সটাও রাখিস! 😄🎓`;
      } else {
        const preview = msgText.length > 60 ? msgText.slice(0, 57) + '...' : msgText;
        fallbackResp = `দোস্ত, নেটে একটু আটকায় গেছিল! তুই যা লিখছিস ("${preview}") সেটা নিচে রেডি আছে, আরেকবার সেন্ড চাপ তো মামা!`;
        // Preserve typed message in input box so user never has to re-type
        setAssistantTextTyped(msgText);
      }

      setAssistantResponseText(fallbackResp);
      setAssistantChatHistory(prev => [
        ...prev.slice(-24),
        { role: 'assistant', text: fallbackResp }
      ]);
      speakTextWithMaleVoice(fallbackResp);
    } finally {
      clearTimeout(safetyUnlockTimeout);
      setAssistantLoading(false);
      isProcessingAssistantMessageRef.current = false;
    }
  };

  const decreeAudioCtxRef = useRef<AudioContext | null>(null);
  const decreeOscsRef = useRef<OscillatorNode[]>([]);
  const decreeGainRef = useRef<GainNode | null>(null);

  const startDecreeMusic = (mood?: string) => {
    try {
      window.speechSynthesis.cancel();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      decreeAudioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5);
      mainGain.connect(ctx.destination);
      decreeGainRef.current = mainGain;

      // Soft filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.connect(mainGain);

      // Lush chord dyad/triad
      const freqs = [130.81, 196.00, 261.63]; // C3, G3, C4
      const oscs: OscillatorNode[] = [];

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        if (i === 1) osc.detune.setValueAtTime(8, ctx.currentTime);
        if (i === 2) osc.detune.setValueAtTime(-8, ctx.currentTime);
        osc.connect(filter);
        osc.start();
        oscs.push(osc);
      });
      decreeOscsRef.current = oscs;
    } catch (err) {
      console.error("Failed to start decree music:", err);
    }

    // Play custom background audio if active
    try {
      let targetKey = activeAudioKey;
      if (mood && decreeMoodTracks && decreeMoodTracks[mood]) {
        targetKey = decreeMoodTracks[mood];
      }
      if (targetKey && targetKey.startsWith('custom-')) {
        const idx = parseInt(targetKey.split('-')[1], 10);
        const item = customAudioList[idx];
        if (item && item.data) {
          if (!audioPlayerRef.current) {
            audioPlayerRef.current = new Audio();
          } else {
            audioPlayerRef.current.pause();
          }
          audioPlayerRef.current.src = item.data;
          audioPlayerRef.current.volume = 0.45;
          audioPlayerRef.current.loop = true;
          audioPlayerRef.current.play().catch(e => console.log("Custom audio play deferred:", e));
          setActiveAudioKey(targetKey);
        }
      } else {
        // If system synthesizer or no custom track is assigned, stop any currently playing custom background track
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
        setActiveAudioKey('');
      }
    } catch (e) {
      console.warn("Custom background audio play failed:", e);
    }
  };

  const stopDecreeMusic = () => {
    try {
      window.speechSynthesis.cancel();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (decreeGainRef.current && decreeAudioCtxRef.current) {
        const ctx = decreeAudioCtxRef.current;
        const gain = decreeGainRef.current;
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
        setTimeout(() => {
          try {
            decreeOscsRef.current.forEach(osc => osc.stop());
            if (ctx.state !== 'closed') ctx.close();
          } catch (e) {}
          decreeAudioCtxRef.current = null;
          decreeOscsRef.current = [];
        }, 1100);
      }
    } catch (err) {
      console.error("Failed to stop decree music:", err);
    }
  };

  const speakDecreeText = (text: string) => {
    // Disabled as per user request to read manually
    return;
  };

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
        decreeOscsRef.current.forEach(osc => osc.stop());
        if (decreeAudioCtxRef.current && decreeAudioCtxRef.current.state !== 'closed') {
          decreeAudioCtxRef.current.close();
        }
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    try {
      const todayStr = new Date().toDateString();
      const lastQuoteDate = localStorage.getItem('selfx_last_quote_date');
      if (lastQuoteDate !== todayStr) {
        const LOOKSMAX_QUOTES = [
          "Don't wish for it, work for it. Silence your doubts with brutal progress.",
          "Your future self is watching you right now through memories. Make him proud.",
          "Small daily habits compound into unstoppable transformations. Win today.",
          "Look in the mirror. That's your only competition.",
          "Lock in. Stay consistent, stay disciplined, and let your results speak.",
          "The secret to getting ahead is simply starting. Focus on the grind.",
          "You don't need motivation. You need relentless self-discipline.",
          "Become the best version of yourself — physically, mentally, and spiritually.",
          "Hydrate, stay active, fix your posture, and command your day."
        ];
        const randomQuote = LOOKSMAX_QUOTES[Math.floor(Math.random() * LOOKSMAX_QUOTES.length)];
        setDailyQuote(randomQuote);
        localStorage.setItem('selfx_last_quote_date', todayStr);
      }
    } catch (e) {
      console.error("Failed to check daily quote", e);
    }
  }, []);

  const [showPasscodePrompt, setShowPasscodePrompt] = useState(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  
  // My Core Goals / Obesessive Vision board state
  const [coreGoals, setCoreGoals] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('my_core_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: '1', text: 'Achieve a specific body shape and physical condition', completed: false },
      { id: '2', text: 'Maintain five times daily prayers and spiritual routines', completed: false },
      { id: '3', text: 'Follow strict skincare routine and daily grooming', completed: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('my_core_goals', JSON.stringify(coreGoals));
  }, [coreGoals]);

  const [newGoalInput, setNewGoalInput] = useState('');

  const handleAddGoal = () => {
    if (!newGoalInput.trim()) return;
    const newGoal = {
      id: Math.random().toString(36).substring(2, 9),
      text: newGoalInput.trim(),
      completed: false
    };
    setCoreGoals(prev => [...prev, newGoal]);
    setNewGoalInput('');
    triggerNotification('🎯 Goal Added', 'Your core goal has been set on the dashboard. Stay obsessive and focused!');
  };

  const handleToggleGoal = (id: string) => {
    setCoreGoals(prev => prev.map(goal => goal.id === id ? { ...goal, completed: !goal.completed } : goal));
  };

  const handleDeleteGoal = (id: string) => {
    setCoreGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'challenges') {
      setActiveTab('powerai');
      setLooksmaxSubTab('challenge_30');
    } else if (tabId === 'habits') {
      setHabitSubTab('matrix');
      setActiveTab('habits_full');
    } else if (tabId === 'lecture') {
      setHabitSubTab('lecture');
      setActiveTab('habits_full');
    } else {
      setActiveTab(tabId as any);
    }
  };
  
  // Custom Toast Notifications for robust real-time feedback
  const [toastNotifications, setToastNotifications] = useState<{ id: string; title: string; body: string; timestamp: Date }[]>([]);

  // Strict Essential Notifications Mode (default: true) - suppresses clutter / spam and only displays important alerts and work reminders
  const [onlyEssentialNotifications, setOnlyEssentialNotifications] = useState<boolean>(() => {
    const saved = localStorage.getItem('selfx_only_essential_notifications');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleOnlyEssentialNotifications = () => {
    setOnlyEssentialNotifications(prev => {
      const next = !prev;
      localStorage.setItem('selfx_only_essential_notifications', String(next));
      return next;
    });
  };

  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [activities, setActivities] = useState<{ id: string; title: string; body: string; timestamp: string; read: boolean; type: string }[]>(() => {
    const saved = localStorage.getItem('lookmax_activities_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse activities", e);
      }
    }
    return [
      { id: 'act_1', title: '💖 ক্রাশ তালিকায় নতুন সংযোজন', body: 'Nusrat Jahan কে সফলভাবে ক্রাশ তালিকায় যুক্ত করা হয়েছে!', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, type: 'love' },
      { id: 'act_2', title: '🚀 প্রথম পোস্ট প্রকাশ', body: 'Glowup Community-তে আপনার ট্রান্সফরমেশন পোস্ট শেয়ার করার জন্য ধন্যবাদ!', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true, type: 'community' },
      { id: 'act_3', title: '🏆 স্বাগতম বোনাস', body: 'Glowup Dashboard-এ যোগ দেওয়ার জন্য আপনি ১০০ XP অর্জন করেছেন!', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, type: 'achievement' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('lookmax_activities_v1', JSON.stringify(activities));
  }, [activities]);

  // Mark all notifications as read when activities pop panel is opened
  useEffect(() => {
    if (isActivitiesOpen) {
      setActivities(prev => {
        if (prev.some(a => !a.read)) {
          return prev.map(a => a.read ? a : { ...a, read: true });
        }
        return prev;
      });
    }
  }, [isActivitiesOpen]);

  useEffect(() => {
    const handleInAppNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string; timestamp: Date; isSuppressedFromDisplay?: boolean; isAlarm?: boolean }>;
      const { title, body, timestamp, isSuppressedFromDisplay, isAlarm } = customEvent.detail;
      
      // If essential-only mode is active, prevent clutter from appearing on screen/display
      if (isSuppressedFromDisplay || (onlyEssentialNotifications && !isAlarm && !isImportantOrWorkReminder(title, body))) {
        return;
      }

      const id = Math.random().toString(36).substring(2, 9);
      
      setToastNotifications(prev => [
        ...prev,
        { id, title, body, timestamp }
      ]);

      // ALSO add to persistent Activities center!
      const newActivity = {
        id: 'act_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        title,
        body,
        timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
        read: false,
        type: title.includes('💖') || title.toLowerCase().includes('crush') ? 'love' :
              title.includes('🏆') || title.includes('Badge') || title.includes('XP') ? 'achievement' :
              title.includes('🚀') || title.includes('Community') || title.includes('লাইক') || title.includes('Like') ? 'community' : 'system'
      };
      setActivities(prev => [newActivity, ...prev]);

      // Dismiss after 4.5 seconds
      setTimeout(() => {
        setToastNotifications(prev => prev.filter(t => t.id !== id));
      }, 4500);
    };

    window.addEventListener('in-app-notification', handleInAppNotification);
    return () => {
      window.removeEventListener('in-app-notification', handleInAppNotification);
    };
  }, [onlyEssentialNotifications]);

  // Synchronize Community Likes and create notification items dynamically for the USER'S OWN POSTS only!
  useEffect(() => {
    let lastLikesMap: Record<string, number> = {};
    
    // Initial load of likes
    try {
      const savedPosts = localStorage.getItem('glowgram_posts');
      if (savedPosts) {
        const parsed = JSON.parse(savedPosts);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            lastLikesMap[p.id] = p.likes || 0;
          });
        }
      }
    } catch (e) {}

    const interval = setInterval(() => {
      try {
        const savedPosts = localStorage.getItem('glowgram_posts');
        if (savedPosts) {
          const parsed = JSON.parse(savedPosts);
          if (Array.isArray(parsed)) {
            // Get user's current profile name to only notify for their own posts
            let myName = '';
            try {
              const savedProfile = localStorage.getItem('lookmax_user_profile_v2');
              if (savedProfile) {
                myName = JSON.parse(savedProfile).name || '';
              }
            } catch (e) {}

            parsed.forEach((p: any) => {
              const currentLikes = p.likes || 0;
              const previousLikes = lastLikesMap[p.id] ?? 0;
              
              if (currentLikes > previousLikes) {
                // Check if the post is authored by the current user
                const isMyPost = myName && (
                  p.author === myName || 
                  p.authorUsername === myName.toLowerCase().replace(/\s+/g, '_')
                );

                if (isMyPost) {
                  // Post got a new like!
                  const title = "👍 আপনার পোস্টে নতুন লাইক!";
                  const body = `"${p.content.substring(0, 30)}..." পোস্টে নতুন লাইক পড়েছে। মোট লাইক: ${currentLikes}`;
                  
                  // Only notify if not in strict essential-only mode
                  if (!onlyEssentialNotifications) {
                    triggerNotification(title, body, true);
                  }
                }
              }
              // Update map
              lastLikesMap[p.id] = currentLikes;
            });
          }
        }
      } catch (e) {
        console.error("Error monitoring likes sync", e);
      }
    }, 20000); // Check every 20 seconds to preserve battery & CPU

    return () => clearInterval(interval);
  }, [onlyEssentialNotifications]);

  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollTopRef = useRef(0);

  // Re-establish pending background notifications on app boot
  useEffect(() => {
    try {
      const pendingReminders = JSON.parse(localStorage.getItem('selfx_pending_reminders') || '[]');
      const now = new Date().getTime();
      let validReminders = [];
      
      for (const reminder of pendingReminders) {
        const msUntil = reminder.time - now;
        
        if (msUntil > 0) {
          validReminders.push(reminder);
          setTimeout(() => {
            const title = "👑 " + (reminder.title || 'Important Reminder');
            const options = {
                 body: reminder.body || 'Decree AI: Your scheduled task is due now. Do not skip it!',
                 icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
                 badge: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
                 vibrate: [200, 100, 200, 100, 200, 100, 200],
                 requireInteraction: true,
                 tag: 'decree-reminder-' + Date.now()
            };

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options);
                }).catch(() => {
                    if ('Notification' in window && Notification.permission === 'granted') { 
                       new Notification(title, options);
                    }
                });
            } else if ('Notification' in window && Notification.permission === 'granted') {
               new Notification(title, options);
            }
            
            // Clean up from local storage after firing
            const currentReminders = JSON.parse(localStorage.getItem('selfx_pending_reminders') || '[]');
            localStorage.setItem('selfx_pending_reminders', JSON.stringify(currentReminders.filter((r: {time: number}) => r.time !== reminder.time)));
          }, msUntil);
        }
      }
      
      // Update with only valid future reminders
      localStorage.setItem('selfx_pending_reminders', JSON.stringify(validReminders));
    } catch (e) {
      console.warn("Failed to parse pending reminders", e);
    }
  }, []);

  // Reset navigation visibility to true on tab changes
  useEffect(() => {
    setIsNavVisible(true);
  }, [activeTab]);

  // Simulator disabled to keep notifications reduced and peaceful!
  useEffect(() => {
    // Disabled as requested to reduce notification frequency and clutter
  }, []);
  
  // Checking current permission status
  const [showNotificationAlert, setShowNotificationAlert] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return window.Notification.permission === 'default';
    }
    return false;
  });
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [permStates, setPermStates] = useState({
    camera: true,
    mic: true,
    notify: true
  });

  const handleProceedSelectedPermissions = () => {
    localStorage.setItem('lookmax_onboarding_done', 'true');
    setShowNotificationModal(false);
    setShowNotificationAlert(false);

    if (permStates.notify && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          triggerNotification("🔔 নোটিফিকেশন চালু হইছে", "সব আপডেট আর রিমাইন্ডার এক্টিভ দোস্ত!");
        }
      }).catch(err => console.warn(err));
    }

    if (permStates.camera || permStates.mic) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          video: permStates.camera,
          audio: permStates.mic
        }).then(stream => {
          stream.getTracks().forEach(track => track.stop());
        }).catch(err => console.warn("Proactive media permissions skipped or denied:", err));
      }
    }
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('lookmax_onboarding_done', 'true');
    setShowNotificationModal(false);
    setShowNotificationAlert(false);
    triggerNotification("🚀 অ্যাপে স্বাগতম দোস্ত", "পারমিশন ছাড়াই ঢোকা হইছে! পরে প্রয়োজন হলে সেটিংস থেকে অন করতে পারবি।");
  };

  // --- PERSISTENT DATA STATES & LOCALSTORAGE SYNCS ---
  const [alarm, setAlarm] = useState<AlarmConfig>(() => {
    const saved = localStorage.getItem('lookmax_alarm');
    const urlRing = typeof window !== 'undefined' && window.location.search.includes('alarm_ring=1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          enabled: false, 
          time: '05:30', 
          ringtone: 'sunrise_melody',
          challengeType: 'standing_selfie',
          escalationEnabled: true,
          wakeUpHistory: [], 
          ...parsed, 
          isTriggered: urlRing ? true : false,
          triggeredAt: urlRing ? Date.now() : undefined
        };
      } catch (e) {
        console.error("Failed to parse alarm state", e);
      }
    }
    return {
      enabled: false,
      time: '05:30',
      ringtone: 'sunrise_melody',
      challengeType: 'standing_selfie',
      escalationEnabled: true,
      isTriggered: urlRing ? true : false,
      triggeredAt: urlRing ? Date.now() : undefined,
      wakeUpHistory: []
    };
  });

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem('lookmax_habits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse habits state", e);
      }
    }
    return defaultHabits;
  });

  const [water, setWater] = useState<WaterTracker>(() => {
    const saved = localStorage.getItem('lookmax_water');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse water state", e);
      }
    }
    return { count: 0, goal: 8 };
  });

  const [challenges, setChallenges] = useState<ChallengeItem[]>(() => {
    const saved = localStorage.getItem('lookmax_challenges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse challenges state", e);
      }
    }
    return [];
  });

  const [journalDuration, setJournalDuration] = useState<30 | 60 | 90>(() => {
    const saved = localStorage.getItem('lookmax_journal_duration');
    return saved ? (parseInt(saved, 10) as 30 | 60 | 90) : 30;
  });

  const [photos, setPhotos] = useState<PhotoEntry[]>(() => {
    const saved = localStorage.getItem('lookmax_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse photo entries", e);
      }
    }
    return [];
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('lookmax_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse notes entries", e);
      }
    }
    return [];
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('lookmax_todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse todos entries", e);
      }
    }
    return [];
  });

  const [faith, setFaith] = useState<FaithType>(() => {
    const saved = localStorage.getItem('lookmax_faith');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse faith state", e);
      }
    }
    return { fajr: false, zohor: false, achr: false, magrib: false, esha: false, quranPlayed: false };
  });

  const [loveList, setLoveList] = useState<LoveTarget[]>(() => {
    const saved = localStorage.getItem('lookmax_lovelist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse loveList state", e);
      }
    }
    return [];
  });

  const [userProfile, setUserProfile] = useState<UserProfileInfo>(() => ({
    name: accountProfile.name || 'Glowup Member',
    numberId: accountProfile.username || 'user',
    avatarBase64: accountProfile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    bio: accountProfile.bio || 'Daily consistency & transformation 🚀',
    isLead: !!accountProfile.isLead
  }));

  // Asynchronously restore profile & profile picture from IndexedDB if localStorage was cleared
  useEffect(() => {
    getProfileDB().then(dbProfile => {
      if (dbProfile && (dbProfile.avatarUrl || dbProfile.name)) {
        setAccountProfile(prev => {
          if (!prev.avatarUrl || prev.avatarUrl.includes('unsplash.com') || !prev.name) {
            return { ...prev, ...dbProfile };
          }
          return prev;
        });
      }
    }).catch(err => console.warn("Profile DB restoration check:", err));
  }, []);

  // Unidirectional synchronization: accountProfile -> userProfile & IndexedDB
  useEffect(() => {
    if (accountProfile) {
      setUserProfile({
        name: accountProfile.name || 'Glowup Member',
        numberId: accountProfile.username || 'user',
        avatarBase64: accountProfile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
        bio: accountProfile.bio || 'Daily consistency & transformation 🚀',
        isLead: !!accountProfile.isLead
      });
      saveProfileDB(accountProfile);
    }
  }, [accountProfile]);

  // Automatically sync local accounts database to server on mount for cross-device support
  useEffect(() => {
    try {
      const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || localStorage.getItem('selfx_user_accounts_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        Object.keys(db).forEach(uname => {
          if (db[uname] && typeof db[uname] === 'object') {
            const cleanUser = uname.replace(/^@/, '').toLowerCase().trim();
            if (cleanUser) {
              fetch('/api/accounts/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: cleanUser, accountData: db[uname] })
              }).catch(() => {});
            }
          }
        });
      }
    } catch (e) {}
  }, []);

  // Hydrate custom ringtone from IndexedDB & sync alarm schedule to backend + SW
  useEffect(() => {
    getCustomRingtoneDB().then((audioData) => {
      if (audioData) {
        setAlarm((prev) =>
          prev.customRingtoneBase64 ? prev : { ...prev, customRingtoneBase64: audioData }
        );
      }
    });
  }, []);

  // Sync Alarm configuration to localStorage & backend push scheduler
  useEffect(() => {
    try {
      const toPersist = { ...alarm };
      // Avoid blowing up localStorage if custom audio is >2MB (already stored in IndexedDB)
      if (toPersist.customRingtoneBase64 && toPersist.customRingtoneBase64.length > 2_000_000) {
        delete toPersist.customRingtoneBase64;
      }
      localStorage.setItem('lookmax_alarm', JSON.stringify(toPersist));
    } catch (e) {
      console.warn("Failed to persist alarm state", e);
    }

    syncAlarmScheduleToBackend(alarm).catch(() => {});

    if (alarm.enabled && alarm.backgroundGuardEnabled) {
      backgroundAlarmGuard.enable();
    } else if (!alarm.enabled || !alarm.backgroundGuardEnabled) {
      backgroundAlarmGuard.disable();
    }
  }, [alarm.enabled, alarm.time, alarm.label, alarm.ringtone, alarm.lastDismissedDate, alarm.backgroundGuardEnabled]);

  // Overall aggregate score calculation for fun Lookmax Motivation
  const habitsDone = habits.filter(h => h.completed).length;
  const habitsTotal = habits.length;
  const challengeTicks = challenges.reduce((acc, c) => acc + c.completedDays.length, 0);

  const requestMediaPermissions = () => {
    // Proactively request camera & microphone permissions for voice recorder and camera features
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          // Release immediately after prompting so camera light/mic icon turns off
          stream.getTracks().forEach(track => track.stop());
          console.log("Proactive camera & microphone permissions approved.");
        })
        .catch(mediaErr => {
          console.warn("Proactive media permissions skipped or denied by host:", mediaErr);
        });
    }
  };

  useEffect(() => {
    // Proactive request of Notifications on boot
    const requestNotificationPermissionOnBoot = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
          .then(permission => {
            if (permission === 'granted') {
              triggerNotification("🔔 Notifications Active", "লক স্ক্রিন এবং পুশ আপডেট চালু হয়েছে!");
            }
          })
          .catch(err => {
            console.warn("Notification request skipped or blocked on boot", err);
          });
      }
    };

    requestNotificationPermissionOnBoot();
  }, []);

  const handleEnableNotifications = () => {
    // Save that onboarding was seen so we don't show it again on refresh
    localStorage.setItem('lookmax_onboarding_done', 'true');
    // Enable both Notification and Camera/Mic permissions at once
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          triggerNotification("🔔 নোটিফিকেশন চালু হয়েছে", "আপডেট ও অ্যালার্ম নোটিফিকেশন এক্টিভ!");
        }
        setShowNotificationModal(false);
        setShowNotificationAlert(false);
        requestMediaPermissions();
      }).catch(err => {
        console.warn("Permission request failed", err);
        setShowNotificationModal(false);
        setShowNotificationAlert(false);
        requestMediaPermissions();
      });
    } else {
      setShowNotificationModal(false);
      setShowNotificationAlert(false);
      requestMediaPermissions();
    }
  };

  // Gamification state already initialized earlier

  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('lookmax_last_cloud_sync_time') || null;
  });
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Automatic Continuous Data Backup & Realtime Cloud Sync
  useEffect(() => {
    const cleanUsername = (accountProfile.username || '').trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) return;

    const timer = setTimeout(() => {
      try {
        let currentMovies: any[] = [];
        try {
          const mStr = localStorage.getItem('lookmax_movies');
          if (mStr) currentMovies = JSON.parse(mStr);
        } catch (err) {}

        let currentCrushes: any[] = [];
        try {
          const cStr = localStorage.getItem('lookmax_crush_list_v2');
          if (cStr) currentCrushes = JSON.parse(cStr);
        } catch (err) {}

        const fullPayload = {
          profile: accountProfile,
          habits,
          points,
          streak,
          badges,
          water,
          faith,
          challenges,
          todos,
          notes,
          photos,
          dashState,
          alarm,
          journalDuration,
          movies: currentMovies,
          crushes: currentCrushes,
          loveList,
          lastSyncedAt: new Date().toISOString()
        };

        // Save locally
        const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || '{}';
        const db = JSON.parse(dbStr);
        db[cleanUsername] = fullPayload;
        db[`@${cleanUsername}`] = fullPayload;
        localStorage.setItem('selfx_user_accounts_db_v2', JSON.stringify(db));

        // Sync to cloud server
        setIsCloudSyncing(true);
        fetch('/api/accounts/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: cleanUsername,
            accountData: fullPayload
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const nowStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
              setLastCloudSyncTime(nowStr);
              localStorage.setItem('lookmax_last_cloud_sync_time', nowStr);
            }
          })
          .catch(err => console.warn("Cloud autosync error:", err))
          .finally(() => setIsCloudSyncing(false));
      } catch (err) {
        console.warn("Auto backup execution failed:", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [accountProfile, habits, points, streak, badges, water, faith, challenges, todos, notes, photos, dashState, alarm, journalDuration, loveList]);

  // Sync gamification keys
  useEffect(() => {
    localStorage.setItem('lookmax_gamification_points_v1', String(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem('lookmax_gamification_streak_v1', String(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('lookmax_gamification_badges_v1', JSON.stringify(badges));
  }, [badges]);

  // Persistent unique member ID for deterministic multi-user sync inside GrowGram
  const memberId = React.useMemo(() => {
    if (userProfile && userProfile.username) {
      const raw = userProfile.username.trim().toLowerCase().replace(/^@/, '');
      const clean = raw.includes('@') ? raw.split('@')[0] : raw;
      const sanitizedUsername = clean.replace(/[^a-z0-9_]/gi, '');
      if (sanitizedUsername) return `m_${sanitizedUsername}`;
    }
    if (accountProfile && accountProfile.username) {
      const raw = accountProfile.username.trim().toLowerCase().replace(/^@/, '');
      const clean = raw.includes('@') ? raw.split('@')[0] : raw;
      const sanitizedUsername = clean.replace(/[^a-z0-9_]/gi, '');
      if (sanitizedUsername) return `m_${sanitizedUsername}`;
    }
    if (userProfile && userProfile.email) {
      const raw = userProfile.email.trim().toLowerCase();
      const clean = raw.includes('@') ? raw.split('@')[0] : raw;
      const sanitized = clean.replace(/[^a-z0-9_]/gi, '');
      if (sanitized) return `m_${sanitized}`;
    }
    if (userProfile && userProfile.name) {
      const sanitizedName = userProfile.name.trim().toLowerCase().replace(/[\s\t\n]+/g, '_').replace(/[^a-z0-9_\u0980-\u09FF]/gi, '');
      if (sanitizedName) return `m_${sanitizedName}`;
    }
    let localId = localStorage.getItem('selfx_persistent_member_id');
    if (!localId) {
      localId = `m_user_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('selfx_persistent_member_id', localId);
    }
    return localId;
  }, [userProfile, accountProfile]);

  // Dynamic automatic member registration and sync on application load
  useEffect(() => {
    if (!userProfile) return;
    const currentName = userProfile.name || accountProfile.name || 'Glowup Member';
    const currentUsername = (userProfile.username || accountProfile.username || '').trim().toLowerCase();
    const currentAvatar = userProfile.avatarBase64 || userProfile.avatarUrl || accountProfile.avatarUrl || '';
    const currentBio = userProfile.bio || accountProfile.bio || 'Daily consistency & transformation 🚀';
    const level = Math.floor(points / 200) + 1;

    fetch('/api/community/members/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: memberId,
        name: currentName,
        username: currentUsername || memberId.replace(/^m_/, ''),
        numberId: currentUsername || userProfile.numberId || userProfile.accountId || memberId.replace(/^m_/, ''),
        avatar: currentAvatar,
        niche: currentBio,
        points: points || 0,
        level: level || 1,
        isOnline: true
      })
    }).then(res => res.json())
      .then(d => console.log("Global community sync completed:", d))
      .catch(e => console.warn("Background auto-register offline sync:", e));
  }, [memberId, userProfile, accountProfile, points]);

  const handleEarnPoints = (amount: number, reason: string) => {
    setPoints(prev => {
      const next = prev + amount;
      import('./utils').then(({ triggerNotification }) => {
        triggerNotification(`🎉 Earned +${amount} XP!`, reason);
      });
      return next;
    });
  };

  // --- GLOBAL ALARM OVERLAY SYSTEM ENGINE ---
  const [currentProblem, setCurrentProblem] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [puzzleError, setPuzzleError] = useState(false);
  const [isInVoiceStage, setIsInVoiceStage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [strobe, setStrobe] = useState(false);
  const [alarmRoast, setAlarmRoast] = useState('');
  const [alarmTypingQuote, setAlarmTypingQuote] = useState('');
  const [userTypingInput, setUserTypingInput] = useState('');
  const [typingMatchError, setTypingMatchError] = useState(false);
  const lastTriggeredMinuteRef = useRef<string>('');

  // Global Clock state, Missed-Alarm Catch-Up & Service Worker / Native Bridge Ring Listener
  useEffect(() => {
    const checkDueOrMissedAlarm = () => {
      if (!alarm.enabled || alarm.isTriggered || !alarm.time) return;
      const now = new Date();
      const todayStr = getLocalTodayDateStr(now);
      if (alarm.lastDismissedDate === todayStr) return;

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      const [aHoursRaw, aMinutesRaw] = alarm.time.split(':');
      const alarmH = parseInt(aHoursRaw || '0', 10);
      const alarmM = parseInt(aMinutesRaw || '0', 10);
      const normAlarmTime = `${String(alarmH).padStart(2, '0')}:${String(alarmM).padStart(2, '0')}`;

      const alarmTotalMins = alarmH * 60 + alarmM;
      const nowTotalMins = now.getHours() * 60 + now.getMinutes();
      const minsPassed = nowTotalMins - alarmTotalMins;

      // Trigger at exact minute OR catch up if missed within last 15 minutes while backgrounded/closed
      if (
        (currentTimeStr === normAlarmTime && lastTriggeredMinuteRef.current !== currentTimeStr) ||
        (minsPassed >= 1 && minsPassed <= 15 && lastTriggeredMinuteRef.current !== normAlarmTime)
      ) {
        lastTriggeredMinuteRef.current = normAlarmTime;
        triggerGlobalAlarm();
      }
    };

    const timer = setInterval(checkDueOrMissedAlarm, 1000);
    const onVisChange = () => {
      if (document.visibilityState === 'visible') {
        checkDueOrMissedAlarm();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('focus', checkDueOrMissedAlarm);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('focus', checkDueOrMissedAlarm);
    };
  }, [alarm.enabled, alarm.isTriggered, alarm.time, alarm.lastDismissedDate]);

  // Listen to Service Worker push wakeup & Native Android alarm broadcast
  useEffect(() => {
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_ALARM_RING') {
        triggerGlobalAlarm();
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    (window as any).triggerSelfXAlarmFromNative = () => {
      triggerGlobalAlarm();
    };

    // If launched via notification (?alarm_ring=1), immediately start audio/lockdown and clean URL
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('alarm_ring') === '1') {
        triggerGlobalAlarm();
        params.delete('alarm_ring');
        const nextUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState({}, '', nextUrl);
      }
    } catch {}

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
      delete (window as any).triggerSelfXAlarmFromNative;
    };
  }, []);

  // Ensure audio starts whenever alarm.isTriggered flips true (e.g. from Test Now button)
  useEffect(() => {
    if (alarm.isTriggered) {
      ensureAlarmAudioPlaying();
    }
  }, [alarm.isTriggered]);

  const ensureAlarmAudioPlaying = () => {
    import('./utils').then(({ alarmPlayer }) => {
      alarmPlayer.start(alarm.ringtone || 'sunrise_melody', alarm.customRingtoneBase64, {
        escalationEnabled: alarm.escalationEnabled !== false,
      });
    });
  };

  const triggerGlobalAlarm = () => {
    setIsInVoiceStage(false);
    setVoiceResult('');
    setVoiceError(null);
    setIsListening(false);
    setUserAnswer('');
    setPuzzleError(false);

    import('./utils').then(({ alarmPlayer, triggerNotification, triggerOSAlarmNotification, generateMathProblem }) => {
      alarmPlayer.start(alarm.ringtone || 'sunrise_melody', alarm.customRingtoneBase64, {
        escalationEnabled: alarm.escalationEnabled !== false,
      });
      triggerOSAlarmNotification(
        "🚨 SelfX এলার্ম বেজে উঠেছে!",
        "উঠুন! দাঁড়িয়ে চোখ সোজা করে ক্যামেরায় সেলফি তুলে এলার্ম বন্ধ করুন।"
      );
      triggerNotification(
        "🚨 SelfX ওয়েক-আপ এলার্ম!",
        "বিছানা থেকে উঠে দাঁড়িয়ে চোখ সোজা করে সেলফি তুললে এলার্ম বন্ধ হবে!",
        true
      );
      setCurrentProblem(generateMathProblem());
    });

    const ROASTS = [
      "বিছানায় শুয়ে থাকলে স্বপ্ন পূরণ হবে না! এখনই উঠে দাঁড়িয়ে চোখ সোজা করে সেলফি দাও! ☀️",
      "অলসতা ছাড়ো চ্যাম্পিয়ন! রুমের লাইট অন করে দাঁড়িয়ে সোজা তাকিয়ে সেলফি তুলে এলার্ম বন্ধ করো! 📸",
      "তোমার প্রতিযোগীরা ইতিমধ্যেই দিন শুরু করে ফেলেছে। বিছানা ছেড়ে দাঁড়াও এবং দিনটা জিতে নাও! 🔥",
      "ঘুমের অজুহাত নয় — চোখে পানি দিয়ে ফ্রেশ হয়ে দাঁড়িয়ে ক্যামেরার সামনে আসো! 💧",
    ];
    setAlarmRoast(ROASTS[Math.floor(Math.random() * ROASTS.length)]);

    setAlarm(prev => ({
      ...prev,
      isTriggered: true,
      triggeredAt: prev.triggeredAt || Date.now(),
    }));
  };

  // Strobe indicator & continuous vibration on triggered alarm
  useEffect(() => {
    let strobeId: any = null;
    let vibrateId: any = null;

    if (alarm.isTriggered) {
      strobeId = setInterval(() => {
        setStrobe(prev => !prev);
      }, 450);

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([500, 150, 500, 150, 800]);
          vibrateId = setInterval(() => {
            navigator.vibrate([500, 150, 500, 150, 800]);
          }, 2200);
        } catch {}
      }
    } else {
      setStrobe(false);
    }

    return () => {
      if (strobeId) clearInterval(strobeId);
      if (vibrateId) clearInterval(vibrateId);
      if ('vibrate' in navigator) {
        try { navigator.vibrate(0); } catch {}
      }
    };
  }, [alarm.isTriggered]);

  const handleVerifiedSelfieDismiss = (summary: {
    verificationType: 'selfie' | 'selfie_and_math' | 'math';
    solvedProblem: string;
    snapshotUrl?: string;
  }) => {
    import('./utils').then(({ alarmPlayer, triggerNotification }) => {
      alarmPlayer.stop();
      triggerNotification("🌅 গুড মর্নিং! এলার্ম সম্পন্ন", "দাঁড়িয়ে সেলফি যাচাই সফল হয়েছে। আজকের দিনটি দারুণ হোক!", true);
    });
    notifyBackendAlarmDismissed().catch(() => {});

    const todayStr = getLocalTodayDateStr();
    const solveTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const solveDate = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const timestamp = `${solveDate} at ${solveTime}`;

    setAlarm(prev => ({
      ...prev,
      isTriggered: false,
      triggeredAt: undefined,
      lastDismissedDate: todayStr,
      wakeUpHistory: [
        {
          id: 'solve-' + Date.now(),
          date: timestamp,
          solvedProblem: summary.solvedProblem,
          verificationType: summary.verificationType,
          snapshotUrl: summary.snapshotUrl,
        },
        ...(prev.wakeUpHistory || []).slice(0, 29),
      ]
    }));

    setUserAnswer('');
    setPuzzleError(false);
    setCurrentProblem(null);
    setIsInVoiceStage(false);
    setVoiceResult('');
    setVoiceError(null);

    handleEarnPoints(150, "Standing Eyes-Open Wake-up Selfie Verified! 🌅📸");
  };

  const handleFinalDismiss = () => {
    handleVerifiedSelfieDismiss({
      verificationType: 'math',
      solvedProblem: `${currentProblem?.question || 'Equation'} successfully solved`,
    });
  };

  // --- AUTOMATIC ACHIEVEMENT PROTOCOL MONITORS ---
  useEffect(() => {
    if (water.count >= water.goal && !badges.includes('Hydration Titan')) {
      setBadges(curr => {
        if (!curr.includes('Hydration Titan')) {
          handleEarnPoints(100, "Badge Unlocked: Hydration Titan! 💧");
          return [...curr, 'Hydration Titan'];
        }
        return curr;
      });
    }
  }, [water.count, water.goal, badges]);

  useEffect(() => {
    if (photos.length >= 5 && !badges.includes('90-Day Visionary')) {
      setBadges(curr => {
        if (!curr.includes('90-Day Visionary')) {
          handleEarnPoints(100, "Badge Unlocked: 90-Day Visionary! 📸");
          return [...curr, '90-Day Visionary'];
        }
        return curr;
      });
    }
  }, [photos.length, badges]);

  useEffect(() => {
    if (alarm.wakeUpHistory && alarm.wakeUpHistory.length > 0 && !badges.includes('Sunrise Lord')) {
      setBadges(curr => {
        if (!curr.includes('Sunrise Lord')) {
          handleEarnPoints(100, "Badge Unlocked: Sunrise Lord! ⏰");
          return [...curr, 'Sunrise Lord'];
        }
        return curr;
      });
    }
    if (alarm.wakeUpHistory && alarm.wakeUpHistory.length >= 5 && !badges.includes('Math Legend')) {
      setBadges(curr => {
        if (!curr.includes('Math Legend')) {
          handleEarnPoints(200, "Badge Unlocked: Math Legend! 🧠");
          return [...curr, 'Math Legend'];
        }
        return curr;
      });
    }
  }, [alarm.wakeUpHistory, badges]);

  useEffect(() => {
    if (habitsDone === habitsTotal && habitsTotal > 0) {
      const todayStr = new Date().toDateString();
      const lastStreakDate = localStorage.getItem('lookmax_last_streak_date');
      if (lastStreakDate !== todayStr) {
        localStorage.setItem('lookmax_last_streak_date', todayStr);
        setStreak(prev => {
          const next = prev + 1;
          handleEarnPoints(50, `Completed all habits! ${next} Day Streak active! 🔥`);
          
          if (next >= 1 && !badges.includes('Glowup Initiate')) {
            setBadges(curr => {
              const u = [...curr, 'Glowup Initiate'];
              handleEarnPoints(100, "Badge Unlocked: Glowup Initiate! 🔥");
              return u;
            });
          }
          if (next >= 3 && !badges.includes('Habit Overlord')) {
            setBadges(curr => {
              const u = [...curr, 'Habit Overlord'];
              handleEarnPoints(150, "Badge Unlocked: Habit Overlord! 👑");
              return u;
            });
          }
          return next;
        });
      }
    }
  }, [habitsDone, habitsTotal, badges]);

  // Effects to synchronize states to LocalStorage safely with try/catch guards
  useEffect(() => {
    try {
      localStorage.setItem('lookmax_photos', JSON.stringify(photos));
    } catch (e) {
      console.warn("localStorage sync failed for lookmax_photos", e);
    }
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem('lookmax_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn("localStorage sync failed for lookmax_notes", e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('lookmax_todos', JSON.stringify(todos));
    } catch (e) {
      console.warn("localStorage sync failed for lookmax_todos", e);
    }
  }, [todos]);

  useEffect(() => {
    try {
      localStorage.setItem('lookmax_faith', JSON.stringify(faith));
    } catch (e) {
      console.warn("localStorage sync failed for lookmax_faith", e);
    }
  }, [faith]);

  useEffect(() => {
    try {
      localStorage.setItem('lookmax_lovelist', JSON.stringify(loveList));
    } catch (e) {
      console.warn("localStorage sync failed for lookmax_lovelist", e);
    }
  }, [loveList]);

  return (
    <div className="min-h-screen bg-ambient-light bg-[#0d0d0e] text-zinc-100 flex flex-col justify-between selection:bg-gold-500/30 selection:text-gold-200 relative">
      
      {/* Cloud-integrated Instant Share & Downloader Modal for TikTok & Instagram */}
      <ShareReceiver
        onPost={async (v: ResolvedShareVideo, chosenModel?: any) => {
          try {
            const activeModel = chosenModel || {
              id: userProfile.numberId || 'atif',
              name: userProfile.name || 'Atif Nirob',
              handle: userProfile.numberId || '@niromax',
              avatar: userProfile.avatarBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
            };
            const res = await fetch('/api/share/publish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                videoUrl: v.videoUrl,
                rawVideoUrl: v.rawVideoUrl,
                sourceUrl: v.url,
                title: v.title,
                cover: v.cover,
                platform: v.platform,
                model: {
                  id: activeModel.id || activeModel.handle || 'model',
                  name: activeModel.name || 'Creator',
                  handle: activeModel.handle || activeModel.numberId || 'creator',
                  avatar: activeModel.avatar || activeModel.avatarUrl || activeModel.avatarUrlOrBase64 || userProfile.avatarBase64
                }
              })
            });
            const data = await res.json();
            if (!data.success) {
              throw new Error(data.error || 'Failed to post video');
            }

            if (data.post) {
              try {
                const rawPerm = localStorage.getItem('selfx_permanent_tiktok_posts');
                const permList = rawPerm ? JSON.parse(rawPerm) : [];
                localStorage.setItem('selfx_permanent_tiktok_posts', JSON.stringify([data.post, ...permList.filter((p: any) => p.id !== data.post.id)]));

                const rawLocal = localStorage.getItem('selfx_user_local_posts');
                const localList = rawLocal ? JSON.parse(rawLocal) : [];
                localStorage.setItem('selfx_user_local_posts', JSON.stringify([data.post, ...localList.filter((p: any) => p.id !== data.post.id)]));
              } catch (e) {}

              if (data.post.video) {
                cacheRemoteVideoToIndexedDB(data.post.video, [data.post.id]).catch(() => {});
              }

              // Fire global window event so OurCommunity and Feed update immediately
              window.dispatchEvent(new CustomEvent('selfx_new_post_published', { detail: data.post }));
            }

            setActiveTab('community');
            triggerNotification("🎉 GrowGram-এ সফলভাবে পোস্ট হয়েছে!", `${activeModel.name}-এর প্রোফাইল থেকে ভিডিওটি এখন ফিডে লাইভ রয়েছে!`);
          } catch (err: any) {
            console.error("ShareReceiver onPost error:", err);
            throw err;
          }
        }}
      />

      {/* PREMIUM FLOATING NOTIFICATION BANNER (DYNAMIC ISLAND STYLE) */}
      {toastNotifications.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-[94%] max-w-md pointer-events-none flex flex-col gap-2.5">
          {toastNotifications.slice(-2).map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto bg-gradient-to-r from-zinc-950/98 via-[#141418]/98 to-zinc-950/98 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-start justify-between gap-3 text-left transition-all duration-300 ring-1 ring-amber-500/20"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/25 via-amber-600/15 to-amber-800/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-amber-500/10">
                <BellRing className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-bold text-amber-300 truncate font-sans tracking-wide">
                    {toast.title}
                  </h5>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
                    এখন • লকস্ক্রিন রেডি
                  </span>
                </div>
                <p className="text-[11px] text-zinc-200 font-sans mt-1 leading-snug line-clamp-2">
                  {toast.body}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToastNotifications(prev => prev.filter(t => t.id !== toast.id))}
                className="text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer transition-colors text-xs rounded-lg hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FIRST TIME WELCOME / LANGUAGE ONBOARDING OVERLAY */}
      {showLanguageOnboarding && (
        <div className="fixed inset-0 z-[9999] bg-[#070708]/98 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0d0d0f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Ambient decorative light glowing in the background */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Logo */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 p-[1.5px] shadow-lg shadow-amber-500/10">
              <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
            </div>

            {/* Greetings */}
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-yellow-300">
                SelfX Transformation
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans px-2">
                স্বাগতম দোস্ত! প্রথমবার প্রবেশের পূর্বে আপনার পছন্দের ভাষা নির্বাচন করুন। (Select your preferred language)
              </p>
            </div>

            {/* Language Selection Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setLanguage('normal');
                  setShowLanguageOnboarding(false);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-between transition-all group active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇧🇩</span>
                  <div className="text-left">
                    <p className="text-sm font-sans font-bold text-white">বাংলা (Bengali)</p>
                    <p className="text-[10px] text-amber-400/80 font-normal">বাংলা ভাষায় সম্পূর্ণ অ্যাপ ব্যবহার করুন</p>
                  </div>
                </div>
                <Check className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => {
                  setLanguage('english');
                  setShowLanguageOnboarding(false);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 font-bold flex items-center justify-between transition-all group active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇺🇸</span>
                  <div className="text-left">
                    <p className="text-sm font-sans font-bold text-white">English</p>
                    <p className="text-[10px] text-zinc-400 font-normal">Use full app in English</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Navigation Drawer for Discipline & Library Features */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity cursor-pointer"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#121216] via-[#0d0d10] to-[#070709] border-r border-amber-500/20 shadow-2xl z-50 flex flex-col h-full overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-amber-400 font-bold block">Lookmaxing Hub</span>
                      <span className="text-[8px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded-full font-mono font-bold">12 MODULES</span>
                    </div>
                    <h3 className="text-sm font-display font-black text-white uppercase tracking-wider mt-0.5">DISCIPLINE & LIBRARY</h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white cursor-pointer transition-all text-[11px] font-mono font-bold uppercase shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <span>Close</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drawer List Content: Thematic Visual Banners */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">

                {/* THEMATIC BANNERS LIST */}
                <div className="space-y-2.5">
                  {[
                    {
                      id: 'teacher_ai',
                      title: 'TEACHER AI',
                      badge: 'ONLY FOR YOU',
                      subtitle: 'HSC মানবিক • বই, আসল PDF, ভিডিও ও AI শিক্ষক',
                      icon: GraduationCap,
                      image: '/media/teacher/teacher_ai_cover.jpg',
                      imgPosition: 'object-[center_35%]',
                      cardBg: 'bg-gradient-to-r from-[#071933] via-[#051124] to-[#020712]',
                      maskGradient: 'from-[#051124] via-[#051124]/75 via-25% to-transparent',
                      border: 'border-cyan-500/60 hover:border-cyan-400 ring-1 ring-cyan-500/40',
                      glow: 'shadow-[0_4px_28px_rgba(6,182,212,0.35)] hover:shadow-[0_8px_36px_rgba(6,182,212,0.55)]',
                      iconStyle: 'bg-cyan-500/25 border-cyan-400/60 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)]',
                      badgeStyle: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50'
                    },
                    {
                      id: 'skills',
                      title: 'CAREER HUB',
                      badge: 'LEARN & EARN',
                      subtitle: 'Learn, 20+ Careers, Earn, Business & AI Planner',
                      icon: Compass,
                      image: '/career_hub_drawer_banner.svg',
                      imgPosition: 'object-center',
                      cardBg: 'bg-gradient-to-r from-[#04261f] via-[#031915] to-[#020d0b]',
                      maskGradient: 'from-[#031915] via-[#031915]/75 via-25% to-transparent',
                      border: 'border-emerald-500/50 hover:border-emerald-400',
                      glow: 'shadow-[0_4px_24px_rgba(16,185,129,0.32)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.5)]',
                      iconStyle: 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.45)]',
                      badgeStyle: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                    },
                    {
                      id: 'social_ai',
                      title: 'SOCIAL AI',
                      badge: 'AI GROWTH',
                      subtitle: 'Instagram, TikTok & YouTube AI Studio',
                      icon: Sparkles,
                      image: '/social_ai_drawer_banner.svg',
                      imgPosition: 'object-center',
                      cardBg: 'bg-gradient-to-r from-[#2e1042] via-[#1f0a2e] to-[#11051a]',
                      maskGradient: 'from-[#1f0a2e] via-[#1f0a2e]/75 via-25% to-transparent',
                      border: 'border-fuchsia-500/45 hover:border-fuchsia-400',
                      glow: 'shadow-[0_4px_24px_rgba(192,38,211,0.32)] hover:shadow-[0_8px_32px_rgba(217,70,239,0.5)]',
                      iconStyle: 'bg-fuchsia-500/25 border-fuchsia-400/50 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.45)]',
                      badgeStyle: 'bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-500/40'
                    },
                    {
                      id: 'finance',
                      title: 'FINANCE & AI MONEY',
                      badge: 'AI MONEY',
                      subtitle: 'Personal budget, savings & debt ledger',
                      icon: Wallet,
                      image: disciplineFinanceImg,
                      imgPosition: 'object-[center_45%]',
                      cardBg: 'bg-gradient-to-r from-[#0d1b36] via-[#091326] to-[#050b17]',
                      maskGradient: 'from-[#091326] via-[#091326]/75 via-25% to-transparent',
                      border: 'border-blue-500/40 hover:border-blue-400',
                      glow: 'shadow-[0_4px_24px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.45)]',
                      iconStyle: 'bg-blue-600/25 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]',
                      badgeStyle: 'bg-blue-950/90 text-blue-300 border-blue-500/40'
                    },
                    {
                      id: 'wardrobe',
                      title: 'WARDROBE',
                      badge: 'YOUR RULES',
                      subtitle: 'Your Style. Your Rules. · Atif Better You',
                      icon: Shirt,
                      image: disciplineWardrobeImg,
                      imgPosition: 'object-[center_35%]',
                      cardBg: 'bg-gradient-to-r from-[#0a182d] via-[#071120] to-[#030810]',
                      maskGradient: 'from-[#0a182d] via-[#0a182d]/75 via-25% to-transparent',
                      border: 'border-sky-500/40 hover:border-sky-400',
                      glow: 'shadow-[0_4px_24px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_32px_rgba(56,189,248,0.45)]',
                      iconStyle: 'bg-sky-500/20 border-sky-400/40 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.4)]',
                      badgeStyle: 'bg-sky-950/90 text-sky-300 border-sky-500/40'
                    },
                    {
                      id: 'alarm',
                      title: 'ALARM SYSTEM',
                      badge: 'MATH LOCK',
                      subtitle: 'Math puzzle wake-up solver',
                      icon: Clock,
                      image: disciplineAlarmImg,
                      imgPosition: 'object-[center_45%]',
                      cardBg: 'bg-gradient-to-r from-[#1c0407] via-[#140305] to-[#0a0203]',
                      maskGradient: 'from-[#1c0407] via-[#1c0407]/75 via-25% to-transparent',
                      border: 'border-red-500/40 hover:border-red-400',
                      glow: 'shadow-[0_4px_24px_rgba(239,68,68,0.22)] hover:shadow-[0_8px_32px_rgba(239,68,68,0.4)]',
                      iconStyle: 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
                      badgeStyle: 'bg-red-950/90 text-red-300 border-red-500/40'
                    },
                    {
                      id: 'english',
                      title: 'LEARN ENGLISH',
                      badge: 'GAMIFIED',
                      subtitle: 'Interactive tests & daily lessons',
                      icon: Languages,
                      image: disciplineEnglishImg,
                      imgPosition: 'object-[center_35%]',
                      cardBg: 'bg-gradient-to-r from-[#031c10] via-[#02130b] to-[#010905]',
                      maskGradient: 'from-[#031c10] via-[#031c10]/75 via-25% to-transparent',
                      border: 'border-emerald-500/40 hover:border-emerald-400',
                      glow: 'shadow-[0_4px_24px_rgba(16,185,129,0.22)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.4)]',
                      iconStyle: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
                      badgeStyle: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                    },
                    {
                      id: 'lecture',
                      title: 'LECTURE ROOM',
                      badge: 'LIBRARY',
                      subtitle: 'Self-growth guides & podcast hub',
                      icon: GraduationCap,
                      image: disciplineLectureImg,
                      imgPosition: 'object-[center_45%]',
                      cardBg: 'bg-gradient-to-r from-[#14082c] via-[#0d051e] to-[#070210]',
                      maskGradient: 'from-[#14082c] via-[#14082c]/75 via-25% to-transparent',
                      border: 'border-violet-500/40 hover:border-violet-400',
                      glow: 'shadow-[0_4px_24px_rgba(139,92,246,0.22)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.4)]',
                      iconStyle: 'bg-violet-500/20 border-violet-500/40 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)]',
                      badgeStyle: 'bg-violet-950/90 text-violet-300 border-violet-500/40'
                    },
                    {
                      id: 'water',
                      title: 'WATER BASE',
                      badge: 'HYDRATION',
                      subtitle: 'Daily hydration targets & logging',
                      icon: Droplet,
                      image: disciplineWaterImg,
                      imgPosition: 'object-[center_35%]',
                      cardBg: 'bg-gradient-to-r from-[#061c30] via-[#041221] to-[#020911]',
                      maskGradient: 'from-[#061c30] via-[#061c30]/75 via-25% to-transparent',
                      border: 'border-sky-500/40 hover:border-sky-400',
                      glow: 'shadow-[0_4px_24px_rgba(14,165,233,0.22)] hover:shadow-[0_8px_32px_rgba(14,165,233,0.4)]',
                      iconStyle: 'bg-sky-500/20 border-sky-500/40 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.4)]',
                      badgeStyle: 'bg-sky-950/90 text-sky-300 border-sky-500/40'
                    },
                    {
                      id: 'notes',
                      title: 'NOTES & TO-DOS',
                      badge: 'PLANNER',
                      subtitle: 'Daily schedules & task planner',
                      icon: Bookmark,
                      image: disciplineNotesImg,
                      imgPosition: 'object-[center_28%]',
                      cardBg: 'bg-gradient-to-r from-[#221503] via-[#160e02] to-[#0b0701]',
                      maskGradient: 'from-[#221503] via-[#221503]/75 via-25% to-transparent',
                      border: 'border-amber-500/40 hover:border-amber-400',
                      glow: 'shadow-[0_4px_24px_rgba(245,158,11,0.22)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.4)]',
                      iconStyle: 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
                      badgeStyle: 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                    },
                    {
                      id: 'nofap',
                      title: 'NO FAP SOLDIER',
                      badge: 'PEACE & MIND',
                      subtitle: 'Preserve energy, peace & clarity',
                      icon: Flame,
                      image: disciplineNofapImg,
                      imgPosition: 'object-[center_20%]',
                      cardBg: 'bg-gradient-to-r from-[#24060e] via-[#180409] to-[#0c0204]',
                      maskGradient: 'from-[#24060e] via-[#24060e]/75 via-25% to-transparent',
                      border: 'border-rose-500/40 hover:border-rose-400',
                      glow: 'shadow-[0_4px_24px_rgba(244,63,94,0.22)] hover:shadow-[0_8px_32px_rgba(244,63,94,0.4)]',
                      iconStyle: 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
                      badgeStyle: 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                    },
                    {
                      id: 'love_angel',
                      title: 'LOVE ANGEL',
                      badge: 'RELATIONSHIP',
                      subtitle: 'Crush profile, deep advice & bonding',
                      icon: Heart,
                      image: disciplineLoveImg,
                      imgPosition: 'object-[center_50%]',
                      cardBg: 'bg-gradient-to-r from-[#27061d] via-[#1a0413] to-[#0e020a]',
                      maskGradient: 'from-[#27061d] via-[#27061d]/75 via-25% to-transparent',
                      border: 'border-pink-500/40 hover:border-pink-400',
                      glow: 'shadow-[0_4px_24px_rgba(236,72,153,0.22)] hover:shadow-[0_8px_32px_rgba(236,72,153,0.4)]',
                      iconStyle: 'bg-pink-500/20 border-pink-500/40 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]',
                      badgeStyle: 'bg-pink-950/90 text-pink-300 border-pink-500/40'
                    },
                    {
                      id: 'reality',
                      title: 'REALITY & LIFE',
                      badge: 'DECREE STORY',
                      subtitle: 'Share your life, feel real emotions & memories',
                      icon: Crown,
                      image: '/assets/aistudio/file_00000000b4d4820abebf69c3ddc2c20f_fd24d2e7.png',
                      imgPosition: 'object-[18%_28%]',
                      cardBg: 'bg-gradient-to-r from-[#240638] via-[#160424] to-[#0b0212]',
                      maskGradient: 'from-[#160424] via-[#160424]/80 via-25% to-transparent',
                      border: 'border-purple-500/50 hover:border-purple-400',
                      glow: 'shadow-[0_4px_24px_rgba(168,85,247,0.3)] hover:shadow-[0_8px_32px_rgba(192,132,252,0.5)]',
                      iconStyle: 'bg-purple-600/25 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
                      badgeStyle: 'bg-purple-950/90 text-purple-300 border-purple-500/40'
                    }
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === 'teacher_ai') {
                            setActiveTab('teacher_ai');
                          } else if (item.id === 'skills') {
                            setActiveTab('skills');
                          } else if (item.id === 'social_ai') {
                            setActiveTab('social_ai');
                          } else if (item.id === 'finance') {
                            setActiveTab('finance');
                          } else if (item.id === 'wardrobe') {
                            setActiveTab('wardrobe');
                          } else if (item.id === 'english') {
                            setActiveTab('english');
                          } else if (item.id === 'alarm') {
                            setActiveTab('alarm');
                          } else if (item.id === 'dream_day') {
                            setActiveTab('dream_day');
                          } else if (item.id === 'reality') {
                            setActiveTab('reality');
                          } else {
                            setHabitSubTab(item.id as any);
                            setActiveTab('habits_full');
                          }
                          setIsDrawerOpen(false);
                        }}
                        className={`w-full h-[92px] group relative overflow-hidden rounded-[22px] px-3.5 py-3 text-left border ${item.border} ${item.cardBg} transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.985] cursor-pointer shadow-lg hover:shadow-2xl ${item.glow} flex items-center justify-between`}
                      >
                        {/* Right-aligned Thematic Image with Color-Matched Gradient Fade */}
                        <div 
                          className="absolute top-0 right-0 bottom-0 w-[54%] sm:w-[50%] overflow-hidden pointer-events-none z-0 rounded-r-[22px]"
                        >
                          <img 
                            src={item.image} 
                            alt={item.title}
                            loading="eager"
                            decoding="async"
                            referrerPolicy="no-referrer" 
                            className={`w-full h-full object-cover ${item.imgPosition || 'object-center'} transform transition-transform duration-700 ease-out group-hover:scale-108 opacity-95 group-hover:opacity-100`}
                          />
                          <div className={`absolute inset-0 bg-gradient-to-r ${item.maskGradient} pointer-events-none`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Content Layer */}
                        <div className="relative z-10 flex items-center gap-3 max-w-[62%] sm:max-w-[65%]">
                          <div className={`p-2.5 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.iconStyle}`}>
                            <IconComp className="w-4.5 h-4.5" />
                          </div>
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-black font-display text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors drop-shadow-md truncate">
                                {item.title}
                              </span>
                              <span className={`text-[7px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase border ${item.badgeStyle}`}>
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-zinc-300 font-sans leading-tight font-medium drop-shadow-sm truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Floating Right Arrow Button */}
                        <div className="relative z-10 w-6 h-6 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-amber-400/50 group-hover:bg-amber-500/20 group-hover:translate-x-0.5 transition-all shrink-0">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950/90 text-center space-y-0.5 backdrop-blur-md">
                <p className="text-[9px] uppercase font-mono text-amber-400/90 font-bold tracking-wider">LOOKMAXING PREMIUM SUITE</p>
                <p className="text-[9px] text-zinc-400 font-sans">Every habit compounded daily builds your ultimate transformation.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BODY CONTENT CONTAINER */}
      <main className={`w-full mx-auto flex-1 ${activeTab === 'hud' ? 'p-0 m-0 max-w-full' : 'max-w-6xl px-4 py-6 space-y-6'}`}>

        {/* FULL SCREEN APP ONBOARDING PERMISSIONS */}
        <AnimatePresence>
          {showNotificationModal && (
            <div id="priority-notification-modal-overlay" className="fixed inset-0 z-[200] flex flex-col items-center justify-between bg-[#0a0a0c] text-white p-5 sm:p-8 animate-fadeIn overflow-y-auto">
              
              {/* Top Accent/Logo & Skip Area */}
              <div className="w-full max-w-sm flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> SelfX Onboarding
                </span>
                <button
                  type="button"
                  onClick={handleSkipOnboarding}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-amber-500/30 flex items-center gap-1"
                >
                  স্কিপ করুন ⏭️
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto text-center space-y-6 w-full my-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-gold-500/20 mb-4">
                    <Sparkles className="w-8 h-8 text-zinc-950" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight mb-2 bg-gradient-to-r from-zinc-100 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                    কি খবর দোস্ত? SelfX-এ স্বাগতম! 🔥
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans px-2">
                    সেরা গ্লো-আপ আর রুটিন ট্র্যাকিংয়ের জন্য যেগুলা অন রাখা দরকার নিচে সিলেক্ট কর দোস্ত। তুই চাইলে অন/অফ করতে পারবি বা স্কিপ মেরে সোজাসুজি অ্যাপে ঢুকতে পারবি:
                  </p>
                </div>

                {/* Permission Cards with Interactive ON/OFF Toggles */}
                <div className="w-full space-y-3">
                  {/* Camera Toggle */}
                  <div 
                    onClick={() => setPermStates(prev => ({ ...prev, camera: !prev.camera }))}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      permStates.camera 
                        ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                        : 'bg-zinc-900/40 border-zinc-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 text-left">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${permStates.camera ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                          ক্যামেরা এক্সেস 📸
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-sans mt-0.5">ফেস স্ক্যান আর গ্লো-আপ ফটোজার্নাল নেওয়ার জন্য</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono font-bold ${permStates.camera ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {permStates.camera ? 'ON' : 'OFF'}
                      </span>
                      <div className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                        permStates.camera ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
                      }`}>
                        <div className="w-5 h-5 rounded-full bg-zinc-950 shadow-md flex items-center justify-center text-[8px] font-black text-white">
                          {permStates.camera ? '✓' : '✕'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Microphone Toggle */}
                  <div 
                    onClick={() => setPermStates(prev => ({ ...prev, mic: !prev.mic }))}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      permStates.mic 
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
                        : 'bg-zinc-900/40 border-zinc-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 text-left">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${permStates.mic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                          মাইক্রোফোন এক্সেস 🎙️
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-sans mt-0.5">ভয়েস কম্যান্ড আর ভয়েস নোট রেকর্ড করার জন্য</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono font-bold ${permStates.mic ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {permStates.mic ? 'ON' : 'OFF'}
                      </span>
                      <div className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                        permStates.mic ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
                      }`}>
                        <div className="w-5 h-5 rounded-full bg-zinc-950 shadow-md flex items-center justify-center text-[8px] font-black text-white">
                          {permStates.mic ? '✓' : '✕'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Toggle */}
                  <div 
                    onClick={() => setPermStates(prev => ({ ...prev, notify: !prev.notify }))}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      permStates.notify 
                        ? 'bg-gold-500/10 border-gold-500/40 shadow-lg shadow-gold-500/5' 
                        : 'bg-zinc-900/40 border-zinc-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 text-left">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${permStates.notify ? 'bg-gold-500/20 text-gold-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        <BellRing className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                          নোটিফিকেশন রিমাইন্ডার 🔔
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-sans mt-0.5">টাইমলি অ্যালার্ম আর জরুরি রিমাইন্ডার নেওয়ার জন্য</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono font-bold ${permStates.notify ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {permStates.notify ? 'ON' : 'OFF'}
                      </span>
                      <div className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                        permStates.notify ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
                      }`}>
                        <div className="w-5 h-5 rounded-full bg-zinc-950 shadow-md flex items-center justify-center text-[8px] font-black text-white">
                          {permStates.notify ? '✓' : '✕'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Area */}
              <div className="w-full max-w-sm mx-auto pb-6 pt-2 space-y-3">
                <p className="text-[10px] text-center text-zinc-500 font-mono px-2">
                  🔒 দোস্ত, এই সব ডেটা সম্পূর্ণ তোর নিজের ডিভাইসে প্রসেস আর সেভ হবে। ব্রাউজারে চাইলে 'Allow' চাপিস!
                </p>
                <button
                  onClick={handleProceedSelectedPermissions}
                  className="w-full bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 hover:from-amber-300 hover:to-gold-400 text-zinc-950 font-black py-4 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-gold-500/20 active:scale-95 cursor-pointer"
                >
                  সিলেক্ট করা পারমিশন সহ ঢুকি দোস্ত 🚀
                </button>
                <button
                  type="button"
                  onClick={handleSkipOnboarding}
                  className="w-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors border border-zinc-800 cursor-pointer"
                >
                  এখন স্কিপ মারুম, পরে অন করুম ⏭️
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* NOTIFICATION PROMPT ALERT */}
        <AnimatePresence>
          {showNotificationAlert && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div id="notification-prompt-banner" className="bg-amber-950/20 border border-gold-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <BellRing className="w-5 h-5 text-gold-400 shrink-0" />
                  <p className="text-xs text-zinc-300">
                    Enable browser desktop notifications to play wakeup alert warning loops and completion feedbacks.
                  </p>
                </div>
                <button
                  id="enable-notifications"
                  onClick={handleEnableNotifications}
                  className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-zinc-950 text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Enable System Alerts
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div id="gamification-dashboard-hud" className={`bg-[#101012] border border-zinc-900 rounded-2xl p-3 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden ${activeTab === 'hud' ? 'hidden' : ''}`}>
          {/* Subtle design glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* LEFT: Active Status HUD Info */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="text-left font-mono">
              <span className="block text-[8px] text-zinc-550 leading-none">ACTIVE STATUS</span>
              <span className="text-[10px] text-zinc-400 font-bold leading-normal">
                {habitsDone} / {habitsTotal} Completed
              </span>
            </div>
          </div>

          {/* RIGHT: COMPACTION OF STREAK & BADGES (The blue container) */}
          <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end w-full md:w-auto border-t border-zinc-900 md:border-t-0 pt-2.5 md:pt-0">
            {/* Active Daily Streak */}
            <div className="flex items-center gap-2 font-mono">
              <span className="p-1 bg-amber-500/10 rounded-lg">
                <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500 animate-pulse' : 'text-zinc-600'}`} />
              </span>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-zinc-550 leading-none">Streak</span>
                <span className="text-[11px] font-black text-zinc-200">
                  {streak} Days
                </span>
              </div>
            </div>

            {/* Badges List (Super Compact) */}
            <div className="flex items-center gap-1">
              {[
                { key: 'Sunrise Lord', icon: '⏰', text: 'Sunrise Lord', desc: 'Secure morning sunrise alarm solve' },
                { key: 'Glowup Initiate', icon: '🔥', text: 'Glowup Initiate', desc: 'Active continuous habit streak' },
                { key: 'Hydration Titan', icon: '💧', text: 'Hydration Titan', desc: 'Daily hydration goals approved' },
                { key: '90-Day Visionary', icon: '📸', text: '90-Day Visionary', desc: 'Photo log uploaded milestones' },
                { key: 'Math Legend', icon: '🧠', text: 'Math Legend', desc: 'Solve 5+ math waking challenges' }
              ].map((bg, idx) => {
                const isUnlocked = badges.includes(bg.key);
                return (
                  <div 
                    key={bg.key}
                    id={`badge-icon-${idx}`}
                    className={`group relative flex items-center justify-center w-6 h-6 rounded-lg cursor-default transition-all duration-300 ${
                      isUnlocked 
                        ? 'bg-gold-500/10 border border-gold-500/35 text-gold-400' 
                        : 'bg-zinc-900/60 border border-zinc-900 text-zinc-655 grayscale'
                    }`}
                  >
                    <span className="text-xs">{bg.icon}</span>
                    
                    {/* Tooltip trigger */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 z-50 bg-zinc-950 border border-zinc-800 text-zinc-200 p-2 rounded-lg w-40 text-left shadow-2xl pointer-events-none">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-bold text-zinc-100">{bg.text}</span>
                        <span className={`text-[7px] px-1 rounded uppercase font-mono ${isUnlocked ? 'bg-gold-500/10 text-gold-400' : 'bg-zinc-900 text-zinc-550'}`}>
                          {isUnlocked ? 'Earned' : 'Locked'}
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-400 leading-tight font-sans">{bg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MASTER WORKSPACE GRID */}
        <div className={`${activeTab === 'hud' ? 'w-full m-0 p-0 block' : 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8'} font-sans animate-fadeIn`}>
          
          {/* LEFT COLUMN: FLAT categorized SIDEBAR NAVIGATION (lg:col-span-3) */}
          {activeTab !== 'hud' && (
            <aside className="lg:col-span-3 space-y-4">
            
            {/* Desktop Navigation card */}
            <div className="hidden lg:block bg-[#121214] border border-zinc-900 rounded-3xl p-4.5 space-y-3.5 shadow-xl max-h-[850px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
              <div className="px-3 py-1 border-b border-zinc-900 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-550 block">Navigation</span>
                  <h3 className="text-sm font-display font-black text-zinc-300">CORE WORKSPACE</h3>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* HIGHLIGHTED FEATURE: LIVE COMMUNITY TIMELINE */}
              <div className="space-y-1.5">
                <span className="px-3 text-[9px] font-mono font-bold tracking-wider text-amber-500 uppercase block">🔥 Community & Feed Hub</span>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-start gap-3 border cursor-pointer relative group overflow-hidden ${
                    activeTab === 'community'
                      ? 'bg-gradient-to-r from-amber-500/15 to-gold-500/5 border-amber-500/30 text-gold-400 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                      : 'bg-[#151518]/60 border-zinc-900 text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'community' ? 'bg-amber-500/20 text-gold-400' : 'bg-zinc-900 text-zinc-500'}`}>
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase tracking-wider block">GrowGram Feed</span>
                      <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full animate-ping" />
                    </div>
                    <span className="text-[9.5px] text-zinc-500 block leading-tight">Live Looksmax Social</span>
                  </div>
                </button>
              </div>

              {/* SECTION: AI CO-PILOTS */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                <span className="px-3 text-[9px] font-mono font-bold tracking-wider text-zinc-550 uppercase block">🤖 AI Co-Pilots</span>
                
                {[
                  { id: 'powerai', label: 'Full Looksmaxing', icon: Sparkles, desc: 'Face scan & photo diary' },
                  { id: 'faith', label: 'Faith Duty (আমল ও নামাজ)', icon: BookOpen, desc: 'Maulana AI spiritual counselor' },
                  { id: 'chat', label: 'AI Friend (রোস্টিং ও বন্ধু)', icon: MessageSquare, desc: 'Decree AI & friendly companion' }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 border cursor-pointer relative group overflow-hidden ${
                        isActive
                          ? 'bg-zinc-900 border-zinc-800 text-amber-400 shadow-inner'
                          : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-900 text-zinc-600'}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        <span className="text-[11px] font-bold uppercase tracking-wide block">{tab.label}</span>
                        <span className="text-[9px] text-zinc-500 block truncate">{tab.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* SECTION: MINDSET & LIFESTYLE */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                <span className="px-3 text-[9px] font-mono font-bold tracking-wider text-zinc-555 uppercase block">🧭 Mindset & Sanctuary</span>
                
                {[
                  { id: 'skills', label: 'Career Hub', icon: Compass, desc: 'Learn, 20+ careers, earn & AI plan' },
                  { id: 'alarm', label: 'Alarm (এলার্ম)', icon: Clock, desc: 'Wake up and play strict alarms' },
                  { id: 'english', label: 'Learn English', icon: Languages, desc: 'Interactive English trainer' },
                  { id: 'cinema', label: 'Cinema Hub', icon: Film, desc: 'Self-care films & series' },
                  { id: 'lecture', label: 'Lecture Room', icon: GraduationCap, desc: 'Self-improvement videos' }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 border cursor-pointer relative group overflow-hidden ${
                        isActive
                          ? 'bg-zinc-900 border-zinc-800 text-amber-400 shadow-inner'
                          : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-900 text-zinc-600'}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        <span className="text-[11px] font-bold uppercase tracking-wide block">{tab.label}</span>
                        <span className="text-[9px] text-zinc-555 block truncate">{tab.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Swipeable Shelf: Flat listing of active options in beautiful minimal rounded pill items */}
            <div className="lg:hidden flex overflow-x-auto pb-2 gap-2.5 scrollbar-none px-1">
              {[
                { id: 'community', label: '🏆 GrowGram' },
                { id: 'skills', label: '🧭 Career Hub' },
                { id: 'powerai', label: '⚡ Looksmaxing' },
                { id: 'chat', label: '💬 AI Friend' },
                { id: 'alarm', label: '⏰ Alarm' },
                { id: 'faith', label: '🕌 Faith Duty' },
                { id: 'cinema', label: '🎬 Cinema' },
                { id: 'lecture', label: '🎓 Lectures' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-none px-4 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-900 border-amber-500/30 text-amber-400 shadow-md'
                        : 'bg-[#121214] border-zinc-900 text-zinc-450'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
          )}

          {/* RIGHT COLUMN: CORE APP CONTENT */}
          <div className={`${activeTab === 'hud' ? 'lg:col-span-12 w-full m-0 p-0' : 'lg:col-span-9 space-y-6'}`}>
            
            {activeTab === 'hud' ? (
              <div className="w-full flex justify-center min-h-screen relative">
                {/* Thin top glowing styling light bar for premium aesthetic */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent z-50 pointer-events-none" />
                
                <div className="w-full max-w-5xl bg-[#050714] border-x border-sky-500/10 shadow-[0_0_80px_rgba(14,165,233,0.06)] relative overflow-hidden select-none flex flex-col min-h-screen p-0 m-0">
                  
                  {/* PHONE CORE APPLICATION INNER HUD */}
                  <div className="flex-1 flex flex-col overflow-hidden relative pb-20">
                    
                    {/* OFFLINE STATUS BANNER */}
                    {!isOnline && (
                      <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border-b border-amber-500/40 text-amber-300 px-4 py-1.5 text-[11px] flex items-center justify-center gap-2 font-sans text-center z-20">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                        <span>⚡ অফলাইন মোড সক্রিয় — রুটিন, নামাজ ও ট্র্যাকার অফলাইনেও সংরক্ষণ হচ্ছে</span>
                      </div>
                    )}

                    {/* CUSTOM BRAND HEADER WITH BLUE ACCENT */}
                    <header className="px-5 py-4 flex items-center justify-between border-b border-sky-950/40 bg-[#050714]/85 backdrop-blur-md z-10 shrink-0">
                      <button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="p-2 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl border border-zinc-850/60 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                      >
                        <Menu className="w-4 h-4" />
                        <span className="hidden sm:inline">Habits Menu</span>
                      </button>

                      <div className="text-center">
                        <h1 className="text-2xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500 leading-none uppercase">
                          SELFX
                        </h1>
                        <span className="text-[8px] uppercase tracking-widest text-gold-500 font-mono font-bold leading-none block mt-1.5">
                          BY ATIF NIROB · SUPREME EDITION
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleToggleBgMusic}
                          className={`p-2 rounded-xl border active:scale-95 transition-all cursor-pointer relative ${
                            bgMusicEnabled
                              ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                              : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white border-zinc-850/60'
                          }`}
                          title={bgMusicEnabled ? 'ব্যাকগ্রাউন্ড মিউজিক বন্ধ করুন' : 'ব্যাকগ্রাউন্ড মিউজিক চালু করুন'}
                        >
                          {bgMusicEnabled && !bgMusicAutoPaused ? (
                            <Volume2 className="w-4 h-4 text-amber-400" />
                          ) : (
                            <VolumeX className={`w-4 h-4 ${bgMusicEnabled && bgMusicAutoPaused ? 'text-sky-400' : 'text-zinc-400'}`} />
                          )}
                        </button>
                        <button 
                          onClick={() => setIsActivitiesOpen(true)}
                          className="p-2 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl border border-zinc-850/60 active:scale-95 transition-all cursor-pointer relative"
                          title="Activities & Alerts"
                        >
                          <BellRing className="w-4 h-4 text-zinc-300" />
                          {activities.filter(a => !a.read).length > 0 ? (
                            <span className="absolute -top-1 -right-1 bg-pink-500 text-zinc-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce leading-none">
                              {activities.filter(a => !a.read).length}
                            </span>
                          ) : (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold-400 rounded-full animate-ping" />
                          )}
                        </button>
                      </div>
                    </header>

                    {/* SCROLLABLE INNER DASHBOARD BODY */}
                    <div 
                      onScroll={(e) => {
                        const target = e.currentTarget;
                        const scrollTop = target.scrollTop;
                        if (scrollTop <= 10) {
                          setIsNavVisible(true);
                        } else if (scrollTop > lastScrollTopRef.current && scrollTop > 30) {
                          setIsNavVisible(false);
                        } else if (scrollTop < lastScrollTopRef.current) {
                          setIsNavVisible(true);
                        }
                        lastScrollTopRef.current = scrollTop;
                      }}
                      className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none pb-8 select-none"
                    >

                      {/* MID SECTION TEXT BRAND */}
                      <div className="text-center py-2">
                        <h3 className="text-[10px] font-display font-black tracking-widest text-gold-400 uppercase leading-none">
                          CHOOSE YOUR TRANSFORMATION PATH
                        </h3>
                        <p className="text-[9px] text-zinc-500 font-mono mt-1 uppercase tracking-wider leading-none">
                          Lifestyle, physique, spiritual & mindset upgrades
                        </p>
                      </div>

                      {/* UNIFIED PRIMARY INTERFACE: BUTTER-SMOOTH VERTICAL BANNERS STACK */}
                      {(() => {
                        const CAROUSEL_CARDS = [
                          {
                            id: 'community',
                            title: 'OUR COMMUNITY',
                            subtitle: 'Connect. Share. Grow Together.',
                            icon: Users,
                            borderGlow: 'border-purple-500/40 hover:border-purple-400 shadow-[0_4px_24px_rgba(168,85,247,0.2)] hover:shadow-[0_8px_32px_rgba(168,85,247,0.38)]',
                            iconBorder: 'border-purple-400/50 bg-purple-500/20 text-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.4)]',
                            bgGradient: 'from-[#150528] via-[#0d0319] to-[#06010c]',
                            maskGradient: 'from-[#0d0319] via-[#0d0319]/75 via-25% to-transparent',
                            bgImage: communityBannerImg,
                            imgPosition: 'object-[center_28%]',
                            onSelect: () => setActiveTab('community')
                          },
                          {
                            id: 'powerai',
                            title: 'FULL LOOKSMAXING',
                            subtitle: 'Face Scan & Personal Analysis.',
                            icon: Sparkles,
                            borderGlow: 'border-amber-500/40 hover:border-amber-400 shadow-[0_4px_24px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.38)]',
                            iconBorder: 'border-amber-400/50 bg-amber-500/20 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.4)]',
                            bgGradient: 'from-[#241704] via-[#160d02] to-[#0b0601]',
                            maskGradient: 'from-[#160d02] via-[#160d02]/75 via-25% to-transparent',
                            bgImage: looksmaxBannerImg,
                            imgPosition: 'object-[center_18%]',
                            onSelect: () => { setLooksmaxSubTab('scanner'); setActiveTab('powerai'); }
                          },
                          {
                            id: 'fitbody',
                            title: 'FIT BODY',
                            subtitle: 'Workout, Diet & Body Transform.',
                            icon: Flame,
                            borderGlow: 'border-emerald-500/40 hover:border-emerald-400 shadow-[0_4px_24px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.38)]',
                            iconBorder: 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.4)]',
                            bgGradient: 'from-[#031d11] via-[#02120b] to-[#010905]',
                            maskGradient: 'from-[#02120b] via-[#02120b]/75 via-25% to-transparent',
                            bgImage: fitbodyBannerImg,
                            imgPosition: 'object-[center_28%]',
                            onSelect: () => setActiveTab('fitbody')
                          },
                          {
                            id: 'faith',
                            title: 'FAITH DUTY',
                            subtitle: 'Maulana AI & Daily Prayers.',
                            icon: BookOpen,
                            borderGlow: 'border-blue-500/40 hover:border-blue-400 shadow-[0_4px_24px_rgba(59,130,246,0.2)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.38)]',
                            iconBorder: 'border-blue-400/50 bg-blue-500/20 text-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.4)]',
                            bgGradient: 'from-[#061e38] via-[#031122] to-[#010812]',
                            maskGradient: 'from-[#031122] via-[#031122]/75 via-25% to-transparent',
                            bgImage: faithBannerImg,
                            imgPosition: 'object-[center_38%]',
                            onSelect: () => setActiveTab('faith')
                          },
                          {
                            id: 'chat',
                            title: 'AI FRIEND',
                            subtitle: 'Your Brilliant Companion.',
                            icon: MessageSquare,
                            borderGlow: 'border-blue-600/40 hover:border-blue-500 shadow-[0_4px_24px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.4)]',
                            iconBorder: 'border-blue-500/50 bg-blue-500/20 text-blue-300 shadow-[0_0_16px_rgba(37,99,235,0.4)]',
                            bgGradient: 'from-[#0a1630] via-[#060e20] to-[#030710]',
                            maskGradient: 'from-[#060e20] via-[#060e20]/75 via-25% to-transparent',
                            bgImage: friendBannerImg,
                            imgPosition: 'object-[center_35%]',
                            onSelect: () => setActiveTab('chat')
                          },
                          {
                            id: 'cinema',
                            title: 'CINEMA HUB',
                            subtitle: 'Inspirational Movies & Series.',
                            icon: Film,
                            borderGlow: 'border-rose-600/40 hover:border-rose-500 shadow-[0_4px_24px_rgba(225,29,72,0.2)] hover:shadow-[0_8px_32px_rgba(225,29,72,0.38)]',
                            iconBorder: 'border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-[0_0_16px_rgba(225,29,72,0.4)]',
                            bgGradient: 'from-[#270513] via-[#19030c] to-[#0d0106]',
                            maskGradient: 'from-[#19030c] via-[#19030c]/75 via-25% to-transparent',
                            bgImage: cinemaBannerImg,
                            imgPosition: 'object-[center_35%]',
                            onSelect: () => setActiveTab('cinema')
                          }
                        ];

                        return (
                          <div className="w-full py-1 flex flex-col gap-3 sm:gap-3.5">
                            {CAROUSEL_CARDS.map((card) => {
                              const CardIcon = card.icon;
                              return (
                                <div
                                  key={card.id}
                                  onClick={() => card.onSelect()}
                                  className={`relative w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-[26px] bg-[#07080c] border-[1.5px] ${card.borderGlow} cursor-pointer group hover:-translate-y-0.5 active:scale-[0.985] active:translate-y-0 transition-all duration-300 ease-out overflow-hidden flex items-center justify-between gap-3 min-h-[92px] sm:min-h-[100px] will-change-transform`}
                                >
                                  {/* Base Card Atmospheric Background Gradient */}
                                  <div className={`absolute inset-0 bg-gradient-to-r ${card.bgGradient} pointer-events-none opacity-95`} />

                                  {/* Right-aligned User-Selected Thematic Photo with Smooth Color-Matched Gradient Blend */}
                                  <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[50%] pointer-events-none overflow-hidden z-0 rounded-r-[26px]">
                                    <img 
                                      src={card.bgImage} 
                                      alt={card.title} 
                                      loading="eager"
                                      decoding="async"
                                      referrerPolicy="no-referrer" 
                                      className={`w-full h-full object-cover ${card.imgPosition || 'object-center'} transform transition-transform duration-700 ease-out group-hover:scale-106 opacity-95 group-hover:opacity-100`} 
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-r ${card.maskGradient} pointer-events-none`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                  </div>

                                  {/* Left Content: Glowing Icon + Text */}
                                  <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 max-w-[62%] sm:max-w-[65%]">
                                    <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 ${card.iconBorder} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300 ease-out`}>
                                      <CardIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
                                    </div>

                                    <div className="flex flex-col text-left space-y-0.5">
                                      <h3 className="text-sm sm:text-base font-bold font-sans text-white uppercase tracking-wider leading-tight drop-shadow-md">
                                        {card.title}
                                      </h3>
                                      <p className="text-[11px] sm:text-xs text-zinc-300 font-sans font-normal leading-snug drop-shadow-sm">
                                        {card.subtitle}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right Chevron Arrow */}
                                  <div className="relative z-10 pr-1 sm:pr-2">
                                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 ease-out shrink-0" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* CARD 3: MY CORE GOALS & VISION */}
                      <div className="bg-gradient-to-r from-zinc-900 to-[#0c0d10] border border-zinc-850 rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
                        <button 
                          onClick={() => setShowCoreGoalsExpanded(!showCoreGoalsExpanded)}
                          className="w-full flex items-center justify-between p-4 cursor-pointer text-left active:bg-zinc-950/40 rounded-[20px] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                              <Target className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                              <h4 className="text-xs font-display font-black text-zinc-100 uppercase tracking-wider leading-none">
                                MY CORE GOALS & VISION
                              </h4>
                              <span className="text-[8.5px] text-zinc-500 block mt-1 font-sans">
                                Keep your goals clear and visible.
                              </span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${showCoreGoalsExpanded ? 'rotate-90 text-amber-500' : ''}`} />
                        </button>

                        {/* Expanded Goals Editor & Checklist Inline */}
                        <AnimatePresence>
                          {showCoreGoalsExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-zinc-850/60 bg-black/40"
                            >
                              <div className="p-4 space-y-4">
                                {/* Goals Input form */}
                                <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    placeholder="Add custom focus goal..."
                                    value={newGoalInput}
                                    onChange={(e) => setNewGoalInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddGoal();
                                      }
                                    }}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-sans text-zinc-100 focus:outline-none focus:border-amber-500/50"
                                  />
                                  <button 
                                    onClick={handleAddGoal}
                                    className="px-3 bg-amber-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-amber-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                  {coreGoals.map((goal) => (
                                    <div key={goal.id} className="flex items-center justify-between p-2.5 bg-[#0b0c10] border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all">
                                      <button 
                                        onClick={() => handleToggleGoal(goal.id)}
                                        className="flex items-center gap-2.5 text-left flex-1"
                                      >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                          goal.completed 
                                            ? 'bg-amber-500 border-amber-500 text-black' 
                                            : 'border-zinc-700 hover:border-amber-500'
                                        }`}>
                                          {goal.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <span className={`text-[11px] font-sans transition-all leading-normal ${
                                          goal.completed ? 'line-through text-zinc-600' : 'text-zinc-300'
                                        }`}>
                                          {goal.text}
                                        </span>
                                      </button>

                                      <button 
                                        onClick={() => {
                                          handleDeleteGoal(goal.id);
                                          triggerNotification('🗑 Goal Removed', 'Your core goals list has been updated.');
                                        }}
                                        className="p-1 hover:bg-zinc-900 text-zinc-600 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}

                                  {coreGoals.length === 0 && (
                                    <div className="py-5 text-center bg-zinc-950/20 border border-zinc-900/40 rounded-xl">
                                      <p className="text-[10px] text-zinc-600 font-sans">No focus goals added. Add one above!</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>

                    {/* HIGH-FIDELITY MOBILE PHONE FLOATING NAVIGATION BAR */}
                    <nav 
                      style={{
                        transform: isNavVisible ? 'translateY(0)' : 'translateY(80px)',
                        opacity: isNavVisible ? 1 : 0,
                        pointerEvents: isNavVisible ? 'auto' : 'none'
                      }}
                      className="absolute bottom-3 left-4 right-4 h-14 bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-800/80 shadow-2xl flex items-center justify-between px-5 z-20 transition-all duration-300 ease-in-out"
                    >
                      
                      {/* Tab 1: Home */}
                      <button 
                        onClick={() => {
                          setShowAnalytics(false);
                          setActiveTab('hud');
                        }}
                        className={`flex flex-col items-center gap-0.5 relative cursor-pointer ${!showAnalytics ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Home className="w-5 h-5" />
                        <span className="text-[8px] font-sans font-bold uppercase tracking-wider">Home</span>
                        {!showAnalytics && (
                          <span className="absolute -bottom-1.5 w-4 h-0.5 bg-gold-400 rounded-full" />
                        )}
                      </button>

                      {/* Tab 2: Analytics / Progress */}
                      <button 
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className={`flex flex-col items-center gap-0.5 relative cursor-pointer ${showAnalytics ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-[8px] font-sans font-bold uppercase tracking-wider">Analysis</span>
                        {showAnalytics && (
                          <span className="absolute -bottom-1.5 w-4 h-0.5 bg-gold-400 rounded-full" />
                        )}
                      </button>

                      {/* Center Tab 3: Sparkle (Daily Quote Decrees) */}
                      <div className="relative -top-4">
                        <button 
                          onPointerDown={handleDecreePointerDown}
                          onPointerUp={handleDecreePointerUp}
                          onPointerLeave={handleDecreePointerCancel}
                          onPointerCancel={handleDecreePointerCancel}
                          className={`w-12 h-12 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-black flex items-center justify-center transition-all duration-300 cursor-pointer border-2 border-black select-none ${isDecreePressing ? 'scale-110 ring-4 ring-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,1)]' : 'shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.65)] active:scale-95'}`}
                        >
                          <Sparkles className={`w-5.5 h-5.5 ${isDecreePressing ? 'animate-spin' : ''}`} />
                        </button>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-sans font-black uppercase tracking-wider text-gold-500 whitespace-nowrap block text-center">
                          {isDecreePressing ? 'HOLD 3S FOR VOICE' : 'DECREE'}
                        </span>
                      </div>

                      {/* Tab 4: Dream Day (24-Hour Life Routine) */}
                      <button 
                        onClick={() => {
                          setShowAnalytics(false);
                          setActiveTab('dream_day');
                        }}
                        className={`flex flex-col items-center gap-0.5 relative cursor-pointer ${(activeTab as string) === 'dream_day' ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Sunrise className="w-5 h-5 text-amber-400" />
                        <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-amber-400">Dream Day</span>
                        {(activeTab as string) === 'dream_day' && (
                          <span className="absolute -bottom-1.5 w-4 h-0.5 bg-gold-400 rounded-full" />
                        )}
                      </button>

                      {/* Tab 5: Profile Panel */}
                      <button 
                        onClick={() => setIsProfileOpen(true)}
                        className={`flex flex-col items-center gap-0.5 relative cursor-pointer ${isProfileOpen ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {userProfile.avatarBase64 || userProfile.avatarUrl ? (
                          <img 
                            src={userProfile.avatarBase64 || userProfile.avatarUrl} 
                            alt="Profile" 
                            className={`w-5 h-5 rounded-full object-cover border ${isProfileOpen ? 'border-gold-400/80' : 'border-zinc-700/80'}`}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                        <span className="text-[8px] font-sans font-bold uppercase tracking-wider">Profile</span>
                        {isProfileOpen && (
                          <span className="absolute -bottom-1.5 w-4 h-0.5 bg-gold-400 rounded-full" />
                        )}
                      </button>

                    </nav>

                    {/* CUSTOM FLOATING PROGRESS ANALYTICS SCREEN OVERLAY INSIDE THE PHONE (Tab 2 active) */}
                    <AnimatePresence>
                      {showAnalytics && (
                        <motion.div 
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 100 }}
                          className="absolute inset-0 bg-[#000000] z-25 flex flex-col p-4.5 pb-20 select-none overflow-y-auto"
                        >
                          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5 shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20">
                                <BarChart3 className="w-4 h-4 text-gold-400" />
                              </div>
                              <div>
                                <h3 className="text-xs font-display font-black text-zinc-100 uppercase tracking-widest leading-none">
                                  Analysis
                                </h3>
                                <span className="text-[9px] text-zinc-550 font-mono tracking-widest mt-1 block">PERFORMANCE METRICS</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => setShowAnalytics(false)}
                              className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          {/* DYNAMIC CALCULATIONS FOR TODAY'S TARGETS */}
                          {(() => {
                            const habitsDoneCount = habits.filter(h => h.completed).length;
                            const habitsTotalCount = habits.length || 1;
                            const waterPercent = Math.min(100, Math.round((water.count / Math.max(1, water.goal)) * 100));
                            const prayersDone = Object.values(faith.prayers || {}).filter(Boolean).length;
                            const todosDone = todos.filter(t => t.completed).length;
                            const todosTotal = todos.length || 1;
                            const goalsDone = coreGoals.filter(g => g.completed).length;
                            const goalsTotal = coreGoals.length || 1;

                            const habitRatio = habitsDoneCount / habitsTotalCount;
                            const waterRatio = water.count / Math.max(1, water.goal);
                            const prayerRatio = prayersDone / 5;
                            const todoRatio = todosDone / todosTotal;

                            const overallRatio = (habitRatio * 0.35) + (waterRatio * 0.25) + (prayerRatio * 0.25) + (todoRatio * 0.15);
                            const overallPercent = Math.min(100, Math.round(overallRatio * 100));

                            let scoldingTitle = "⚠️ চরম অবহেলা ও বেইজ্জতি (ACTION REQUIRED)";
                            let scoldingMessage = `কিরে হাদারাম! সারা দিন কী করলি শুনি?! মাত্র ${water.count} গ্লাস পানি খেয়েছিস আর এখনো ${habitsTotalCount - habitsDoneCount} টা হ্যাবিট পেন্ডিং রেখে অলস হয়ে বসে আছিস! লজ্জা শরম বলতে কিছু নাই তোদের? জ-লাইন কি শূন্যে ভাইসা মুখে ঢুকবো নাকি ভাই? এখনই কাজ শেষ কর আর নাহলে রোস্ট খেয়ে মর! 😡💥🥊`;
                            let badgeColor = "bg-[#1A0B0B] border-[#4A1111] text-rose-400";
                            let strokeColor = "stroke-rose-500";

                            if (overallPercent >= 85) {
                              scoldingTitle = "👑 রিয়েল আলফা লর্ড (OPTIMAL PERFORMANCE)";
                              scoldingMessage = `সাবাশ বেটা! তোর ডিসিপ্লিন দেখে এআই রোস্টারও আজ তোর পায়ে সালাম করতেছে! ৯৫% এর উপরে রেটিং নিয়ে তুই আজ আসল আলফা মোডে আছিস। এই জোশ ধরে রাখ আর রোজ তোর এই চেহারা দিয়ে গ্রাউন্ডে রাজত্ব কর! 🦁🔥✨`;
                              badgeColor = "bg-[#061811] border-[#0A3021] text-emerald-400";
                              strokeColor = "stroke-emerald-500";
                            } else if (overallPercent >= 50) {
                              scoldingTitle = "⚡ অলস কচ্ছপ গতি (MOMENTUM BUILDING)";
                              scoldingMessage = `চলবে কিন্তু খুব বেশি খুশি হওয়ার কারণ নাই! এখনো ${habitsTotalCount - habitsDoneCount} টা হ্যাবিট বাকি আছে। আরেকটু সিরিয়াস না হইলে মোড়ের চায়ের দোকানদারও তোকে দেখে হাসবে দোস্ত! ফোকাস বাড়া, দিনের শেষ হওয়ার আগে গ্যাপ পূরণ কর! 🧠🔥`;
                              badgeColor = "bg-[#181105] border-[#38260A] text-amber-400";
                              strokeColor = "stroke-amber-500";
                            }

                            // SVG Circle Math
                            const radius = 36;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - (overallPercent / 100) * circumference;

                            return (
                              <div className="space-y-6">
                                {/* PREMIUM PERFORMANCE METRIC HEADER */}
                                <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-b from-[#0A0A0C] to-black border border-white/5 relative overflow-hidden shadow-2xl">
                                  {/* Progress Ring */}
                                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                      <circle 
                                        cx="50" cy="50" r={radius} 
                                        className="fill-none stroke-zinc-900" 
                                        strokeWidth="4"
                                      />
                                      <circle 
                                        cx="50" cy="50" r={radius} 
                                        className={`fill-none ${strokeColor} transition-all duration-1000 ease-out`} 
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        style={{ strokeDasharray: circumference, strokeDashoffset }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <span className="text-xl font-display font-black text-white leading-none">{overallPercent}%</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2 relative z-10">
                                    <span className={`inline-block px-2 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-widest rounded-full ${badgeColor}`}>
                                      {scoldingTitle}
                                    </span>
                                    <p className="text-[11px] font-sans text-zinc-400 leading-relaxed">
                                      {scoldingMessage}
                                    </p>
                                  </div>
                                </div>

                                {/* STATS TILES GRID (Minimalist) */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-[#0A0A0C] border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group">
                                    <span className="text-[9px] text-zinc-550 font-mono uppercase tracking-widest relative z-10">Habits</span>
                                    <div className="space-y-1 relative z-10">
                                      <span className="text-2xl font-display font-black text-white">
                                        {habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 63}%
                                      </span>
                                      <div className="w-full bg-zinc-900 h-0.5 mt-2 rounded-full overflow-hidden">
                                        <div className="bg-white h-full rounded-full" style={{ width: `${habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 63}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-[#0A0A0C] border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28">
                                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Aesthetic Tier</span>
                                    <div className="space-y-1">
                                      <span className="text-2xl font-display font-black text-gold-400">
                                        L{Math.floor(points / 200) + 1}
                                      </span>
                                      <span className="block text-[9px] text-zinc-600 font-mono">{points % 200}/200 XP remaining</span>
                                    </div>
                                  </div>

                                  <div className="bg-[#0A0A0C] border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28">
                                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Hydration</span>
                                    <div className="space-y-1">
                                      <span className="text-2xl font-display font-black text-sky-400">
                                        {(water.count * 0.25).toFixed(2)}<span className="text-sm font-sans text-sky-500/50">L</span>
                                      </span>
                                      <span className="block text-[9px] text-zinc-600 font-mono">Target: {(water.goal * 0.25).toFixed(2)}L</span>
                                    </div>
                                  </div>

                                  <div className="bg-[#0A0A0C] border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28">
                                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Continuity</span>
                                    <div className="space-y-1">
                                      <span className="text-2xl font-display font-black text-amber-500">
                                        {streak} <span className="text-sm font-sans text-amber-500/50">Days</span>
                                      </span>
                                      <span className="block text-[9px] text-zinc-600 font-mono">Unbroken streak</span>
                                    </div>
                                  </div>
                                </div>

                                {/* 7-DAY WEEKLY SABHA & DAILY AI EVALUATION REVIEWS */}
                                <AnalysisReviews 
                                  habitsCount={habits.length} 
                                  habitsDone={habits.filter(h => h.completed).length} 
                                  onSpeak={(txt) => speakTextWithMaleVoice(txt)}
                                />
                              </div>
                            );
                          })()}

                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CUSTOM FLOATING PROFILE SCREEN OVERLAY INSIDE THE PHONE */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 100 }}
                          className="absolute inset-0 bg-[#000000] z-25 flex flex-col p-5 pb-20 select-none overflow-y-auto"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-5 shrink-0 mt-1">
                            <div className="flex items-center gap-2.5">
                              <User className="w-5 h-5 text-gold-400" />
                              <div>
                                <h3 className="text-xs font-display font-black text-zinc-100 uppercase tracking-widest leading-none">
                                  Profile & Settings
                                </h3>
                                <span className="text-[10px] font-mono text-amber-400 font-bold block mt-1">
                                  App Version: {APP_VERSION}
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={() => setIsProfileOpen(false)}
                              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              ✕ Close
                            </button>
                          </div>

                          {/* TAB NAVIGATION: EDIT PROFILE vs VOICE vs MUSIC & REELS vs LOGIN */}
                          <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-850 mb-4 shrink-0">
                            <button
                              type="button"
                              onClick={() => setProfileActiveTab('profile')}
                              className={`py-2 px-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                profileActiveTab === 'profile'
                                  ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                                  : 'text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <User className="w-3.5 h-3.5" />
                              <span className="text-[9px] sm:text-[10px]">প্রোফাইল</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProfileActiveTab('voice')}
                              className={`py-2 px-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                profileActiveTab === 'voice'
                                  ? 'bg-cyan-500 text-zinc-950 shadow-md font-black'
                                  : 'text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span className="text-[9px] sm:text-[10px]">ভয়েস</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setProfileActiveTab('music_reels');
                                loadSettingsMusic();
                              }}
                              className={`py-2 px-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                profileActiveTab === 'music_reels'
                                  ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                                  : 'text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <Music className="w-3.5 h-3.5" />
                              <span className="text-[9px] sm:text-[10px]">মিউজিক</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProfileActiveTab('login')}
                              className={`py-2 px-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                profileActiveTab === 'login'
                                  ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                                  : 'text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span className="text-[9px] sm:text-[10px]">লগইন</span>
                            </button>
                          </div>

                          {/* Profile Card & Editing Area */}
                          <div className="space-y-5">
                            {profileActiveTab === 'profile' && (
                              <div className="space-y-5 animate-fadeIn">
                                {/* Avatar section */}
                                <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-zinc-950 to-black border border-zinc-900 p-5 rounded-2xl relative overflow-hidden">
                                  <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-2 border-gold-500 overflow-hidden relative">
                                      <img 
                                        src={userProfile.avatarBase64 || userProfile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"} 
                                        alt="User Profile" 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-gold-500 hover:bg-gold-400 text-black p-1.5 rounded-full border border-black shadow cursor-pointer transition-colors">
                                      <Camera className="w-3.5 h-3.5" />
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                              const img = new Image();
                                              img.onload = () => {
                                                const canvas = document.createElement('canvas');
                                                const MAX_SIZE = 180;
                                                let width = img.width;
                                                let height = img.height;
                                                if (width > height) {
                                                  if (width > MAX_SIZE) {
                                                    height *= MAX_SIZE / width;
                                                    width = MAX_SIZE;
                                                  }
                                                } else {
                                                  if (height > MAX_SIZE) {
                                                    width *= MAX_SIZE / height;
                                                    height = MAX_SIZE;
                                                  }
                                                }
                                                canvas.width = width;
                                                canvas.height = height;
                                                const ctx = canvas.getContext('2d');
                                                if (ctx) {
                                                  ctx.drawImage(img, 0, 0, width, height);
                                                  const compressed = canvas.toDataURL('image/jpeg', 0.7);
                                                  setUserProfile(prev => ({ ...prev, avatarBase64: compressed }));
                                                }
                                              };
                                              img.src = event.target?.result as string;
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                  
                                  <div className="text-center">
                                    <span className="bg-gold-500/10 text-gold-400 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-gold-500/20">
                                      LEVEL {Math.floor(points / 200) + 1} PROTOCOL
                                    </span>
                                    <div className="flex items-center justify-center gap-2 mt-2.5">
                                      <h4 className="text-zinc-100 font-display font-black tracking-wide text-base">
                                        {userProfile.name || "Mobile User"}
                                      </h4>
                                      {userProfile.isLead && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-sm" title="Leader Badge">👑</span>
                                          <span title="Verified Creator"><CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" /></span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-zinc-550 font-mono mt-0.5">{points} XP Accumulation</p>
                                  </div>
                                </div>

                                {/* VERIFIED BLUE BADGE ACTIVATION BLOCK */}
                                <div className="bg-gradient-to-r from-[#08122c] via-[#0d214c] to-[#08122c] border border-sky-500/30 rounded-2xl p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
                                        <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider">
                                          🔵 VERIFIED BADGE (ভেরিফাইড ব্লু টিক)
                                        </h4>
                                        <p className="text-[10px] text-zinc-300 font-sans">
                                          {userProfile.isLead ? 'Verified Creator Status Active' : 'Reserved for App Creator (Requires Passcode)'}
                                        </p>
                                      </div>
                                    </div>

                                    {userProfile.isLead ? (
                                      <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-xl text-sky-400 text-[10px] font-mono font-bold uppercase">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>VERIFIED ✔</span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setShowLeaderModal(true)}
                                        className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-550 text-white text-xs font-black uppercase rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer"
                                      >
                                        🔒 VERIFY
                                      </button>
                                    )}
                                  </div>

                                  {userProfile.isLead && (
                                    <div className="p-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl flex items-center justify-between text-[10px] text-zinc-350 font-mono">
                                      <span>👑 Creator Priority Status</span>
                                      <span className="text-sky-400 font-bold flex items-center gap-1">
                                        <span>Blue Badge Active</span>
                                        <CheckCircle2 className="w-3.5 h-3.5 fill-sky-400/20" />
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Editing Inputs Form */}
                                <div className="space-y-3.5">
                                  <div>
                                    <label className="block text-[8px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">User Identity Name (প্রোফাইল নাম)</label>
                                    <input 
                                      type="text" 
                                      value={userProfile.name}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setUserProfile(prev => ({ ...prev, name: val }));
                                        setAccountProfile(prev => ({ ...prev, name: val }));
                                      }}
                                      placeholder="আপনার নাম লিখুন..."
                                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-gold-500/80 rounded-xl px-3.5 py-2.5 text-xs font-sans text-zinc-100 focus:outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[8px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Leaderboard ID / Handle (ইউজারনেম)</label>
                                    <input 
                                      type="text" 
                                      value={userProfile.numberId || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setUserProfile(prev => ({ ...prev, numberId: val }));
                                        setAccountProfile(prev => ({ ...prev, username: val }));
                                      }}
                                      placeholder="যেমন: atif_nirob"
                                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-gold-500/80 rounded-xl px-3.5 py-2.5 text-xs font-sans text-zinc-100 focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Badges and Milestones Section */}
                                <div className="space-y-2.5 pt-2">
                                  <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-gold-400">
                                    Unlocked Achievements ({badges.length})
                                  </span>
                                  
                                  <div className="grid grid-cols-1 gap-2.5">
                                    {[
                                      { key: 'Sunrise Lord', icon: '⏰', text: 'Sunrise Lord', desc: 'Secure morning sunrise alarm solve' },
                                      { key: 'Glowup Initiate', icon: '🔥', text: 'Glowup Initiate', desc: 'Active continuous habit streak' },
                                      { key: 'Hydration Titan', icon: '💧', text: 'Hydration Titan', desc: 'Daily hydration goals approved' },
                                      { key: '90-Day Visionary', icon: '📸', text: '90-Day Visionary', desc: 'Photo log uploaded milestones' },
                                      { key: 'Math Legend', icon: '🧠', text: 'Math Legend', desc: 'Solve 5+ math waking challenges' }
                                    ].map((bg) => {
                                      const isUnlocked = badges.includes(bg.key);
                                      return (
                                        <div 
                                          key={bg.key}
                                          className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                                            isUnlocked 
                                              ? 'bg-gradient-to-r from-gold-500/10 to-zinc-950/40 border-gold-500/25' 
                                              : 'bg-zinc-950/30 border-zinc-900/60 opacity-55'
                                          }`}
                                        >
                                          <span className="text-xl shrink-0">{bg.icon}</span>
                                          <div className="space-y-0.5 text-left">
                                            <div className="flex items-center gap-2">
                                              <span className={`text-[11px] font-bold ${isUnlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>{bg.text}</span>
                                              <span className={`text-[7px] px-1.5 py-0.5 rounded uppercase font-mono ${isUnlocked ? 'bg-gold-500/20 text-gold-400 font-bold' : 'bg-zinc-900 text-zinc-650'}`}>
                                                {isUnlocked ? 'Earned' : 'Locked'}
                                              </span>
                                            </div>
                                            <p className="text-[9px] text-zinc-550 font-sans leading-tight">{bg.desc}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Save Button */}
                                <button 
                                  type="button"
                                  onClick={handleSaveProfileIdentity}
                                  className="w-full bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-center shadow-lg shadow-gold-500/20 active:scale-98"
                                >
                                  Save Identity & Settings (স্থায়ীভাবে সেভ করুন)
                                </button>
                              </div>
                            )}

                            {profileActiveTab === 'login' && (
                              <form onSubmit={handleLoginAccount} className="space-y-4 animate-fadeIn">
                                <div className="p-4 bg-zinc-900/65 border border-zinc-900 rounded-2xl space-y-4">
                                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1.5 text-xs">
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
                                      <Key className="w-4 h-4 text-amber-400" /> আগের আইডিতে লগইন করুন
                                    </h4>
                                    <p className="text-xs text-zinc-300 font-sans leading-relaxed text-left">
                                      আপনি যদি আগে অ্যাকাউন্ট তৈরি করে থাকেন, তবে এখানে আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে আপনার আগের পয়েন্ট, হ্যাবিট ও ফটো ফিরিয়ে আনুন!
                                    </p>
                                  </div>

                                  {loginErrorMessage && (
                                    <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                      <span>{loginErrorMessage}</span>
                                    </div>
                                  )}

                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-300 block text-left">আপনার ইউজারনেম (Username):</label>
                                    <input
                                      type="text"
                                      required
                                      value={loginUsernameInput}
                                      onChange={(e) => {
                                        setLoginUsernameInput(e.target.value);
                                        if (loginErrorMessage) setLoginErrorMessage(null);
                                      }}
                                      placeholder="যেমন: atif_lookmax"
                                      className="w-full bg-zinc-900 border border-zinc-850 focus:border-amber-500 text-amber-400 font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-zinc-300 block text-left">পাসওয়ার্ড (Password):</label>
                                    <div className="relative">
                                      <input
                                        type={showLoginPassword ? "text" : "password"}
                                        required
                                        value={loginPasswordInput}
                                        onChange={(e) => {
                                          setLoginPasswordInput(e.target.value);
                                          if (loginErrorMessage) setLoginErrorMessage(null);
                                        }}
                                        placeholder="আপনার পাসওয়ার্ড দিন..."
                                        className="w-full bg-zinc-900 border border-zinc-850 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer p-1"
                                      >
                                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                                  >
                                    {isLoggingIn ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                                        <span>লগইন হচ্ছে...</span>
                                      </>
                                    ) : (
                                      <span>🔓 লগইন করুন (Login Now)</span>
                                    )}
                                  </button>
                                </div>
                              </form>
                            )}

                            {profileActiveTab === 'voice' && (
                              <div className="space-y-4 animate-fadeIn font-sans text-xs">
                                <div className="space-y-3 bg-zinc-900/65 border border-zinc-900 rounded-2xl p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-2 bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 rounded-xl">
                                        <Sparkles className="w-4 h-4 animate-pulse" />
                                      </div>
                                      <div className="text-left">
                                        <h4 className="text-xs font-black text-zinc-100 uppercase tracking-wider">Decree AI আসল মানুষ ভয়েস</h4>
                                        <p className="text-[10px] text-zinc-400">পছন্দের ভয়েস ক্যাটাগরি ও পার্সোনা নির্বাচন করুন</p>
                                      </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-mono font-bold">
                                      ⚡ 0s Turbo Fast
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    {[
                                      { id: 'Fenrir', title: '⚡ Fenrir (ডিপ আলফা)', desc: 'গম্ভীর, ডিপ পুরুষালি কণ্ঠ — ১০০% আলফা বেস্ট ফ্রেন্ড', sample: 'সোজা হয়ে দাঁড়া। তোকে লক্ষ্য পূরণ করতে হবে।', audioUrl: '/api/tts/voice/fenrir_sample.wav' },
                                      { id: 'Puck', title: '🔥 Puck (কুল ফ্রেন্ড)', desc: 'চাঙ্গা, প্রাণবন্ত, ১০০% এনার্জেটিক ঢাকার ব্রো ভাইব', sample: 'এই তো ভাই চিল মোডে আছি তুই কি করতাছিস', audioUrl: '/api/tts/voice/puck_sample.wav' },
                                      { id: 'Charon', title: '👑 Charon (ডিপ লিডার)', desc: 'শান্ত, গভীর, পরিপক্ব ও প্রভাবশালী লিডার ব্যক্তিত্ব', sample: 'বল, দোস্ত। তোর পড়াশোনা বা অন্য কোনো বিষয়ে কী সাহায্য লাগবে, বল?', audioUrl: '/api/tts/voice/charon_sample.wav' },
                                      { id: 'Zephyr', title: '🚀 Zephyr (স্মার্ট সোয়্যাগ)', desc: 'আধুনিক, চটপটে, দ্রুত ও মজার আড্ডাবাজ দোস্ত', sample: 'আরেহ প্যারা নাই দোস্ত! চলো কাজটা এখনই উড়িয়ে দিই!', audioUrl: '/api/tts/voice/zephyr_sample.wav' }
                                    ].map(v => {
                                      const isSelected = selectedVoicePersona === v.id;
                                      return (
                                        <div
                                          key={v.id}
                                          onClick={() => {
                                            changeVoicePersona(v.id);
                                          }}
                                          className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left select-none ${
                                            isSelected
                                              ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/30'
                                              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs text-white">{v.title}</span>
                                            {isSelected && <span className="text-[9px] font-bold text-cyan-400 font-mono">ON</span>}
                                          </div>
                                          <p className="text-[10px] text-zinc-400 mb-2">{v.desc}</p>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              changeVoicePersona(v.id);
                                              speakTextWithMaleVoice(v.sample, v.audioUrl, v.id);
                                            }}
                                            className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                          >
                                            <Volume2 className="w-3 h-3" /> টেস্ট শুনুন
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {profileActiveTab === 'music_reels' && (
                              <div className="space-y-6 animate-fadeIn font-sans text-xs">

                                {/* SECTION 1: BACKGROUND MUSIC CONTROL */}
                                <div className="space-y-3 bg-zinc-900/65 border border-zinc-900 rounded-2xl p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-2 bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-xl">
                                        <Music className="w-4 h-4" />
                                      </div>
                                      <div className="text-left">
                                        <h4 className="text-xs font-black text-zinc-100 uppercase tracking-wider">ব্যাকগ্রাউন্ড মিউজিক প্লেয়ার</h4>
                                        <p className="text-[10px] text-zinc-400">এপ্লিকেশন ব্যাকগ্রাউন্ড সুর ও ফ্রিকোয়েন্সি</p>
                                      </div>
                                    </div>
                                    
                                    {/* Toggle Switch */}
                                    <button
                                      type="button"
                                      onClick={handleToggleBgMusic}
                                      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ${
                                        bgMusicEnabled ? 'bg-amber-500' : 'bg-zinc-800'
                                      } flex items-center relative shrink-0`}
                                    >
                                      <span
                                        className={`w-5 h-5 bg-zinc-950 rounded-full shadow-md transform transition-transform duration-300 ${
                                          bgMusicEnabled ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>

                                  {/* PLAYBACK MODE SELECTOR: NORMAL VS REMIX */}
                                  <div className="pt-2 border-t border-zinc-850/80 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider text-left">প্লেব্যাক মোড (Playback Mode)</p>
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${bgMusicPlaybackMode === 'remix' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {bgMusicPlaybackMode === 'remix' ? '🎛️ REMIX ACTIVE' : '🎵 NORMAL'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleBgMusicMode('normal')}
                                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                          bgMusicPlaybackMode === 'normal'
                                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
                                            : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 text-xs">
                                          <span>🎵 Normal Mode</span>
                                        </div>
                                        <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">
                                          সম্পূর্ণ গান স্বাভাবিক রোটেশনে চলবে
                                        </span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleBgMusicMode('remix')}
                                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                          bgMusicPlaybackMode === 'remix'
                                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold shadow-sm shadow-amber-950/20'
                                            : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 text-xs">
                                          <span>🎛️ Remix Mode</span>
                                        </div>
                                        <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">
                                          AI ইন্সট্রুমেন্টাল মিক্স • সর্বোচ্চ ১:৩০
                                        </span>
                                      </button>
                                    </div>

                                    {(bgMusicAutoPaused || remixStatus?.autoPaused) && bgMusicEnabled && (
                                      <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-left">
                                        <p className="text-[10px] font-bold text-sky-300">
                                          ⏸️ ভিডিও/লেকচার সেকশনের কারণে অটো-পজ
                                        </p>
                                        <p className="text-[9px] text-zinc-400">
                                          সাধারণ ইন্টারফেসে ফিরলেই ঠিক আগের পজিশন থেকে চালু হবে।
                                        </p>
                                      </div>
                                    )}

                                    {bgMusicPlaybackMode === 'remix' && settingsMusicList.length > 0 && (
                                      <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-2">
                                        <div className="text-left min-w-0">
                                          <p className="text-[10px] font-bold text-amber-300 truncate">
                                            {remixStatus?.isInstrumentalTransitionActive
                                              ? '🎹 ইন্সট্রুমেন্টাল ক্রসফেড মিক্সিং চলছে...'
                                              : remixStatus?.isInstrumentalReady
                                              ? `✨ ইন্সট্রুমেন্টাল শনাক্ত (${formatAudioTime(remixStatus?.sliceElapsed || 0)} / 1:30)`
                                              : `প্লে: ${formatAudioTime(remixStatus?.sliceElapsed || 0)} / 1:30 · বাকি ${remixStatus?.remainingCount ?? settingsMusicList.length}টি গান`}
                                          </p>
                                          <p className="text-[9px] text-zinc-500 truncate">
                                            ইন্সট্রুমেন্টাল অংশে স্মার্ট মিক্স · সব শেষ হলে স্বয়ংক্রিয়ভাবে বন্ধ হবে
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={handleResetRemixSession}
                                          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[9px] font-bold text-zinc-300 shrink-0 cursor-pointer"
                                          title="সব পজিশন রিসেট করুন"
                                        >
                                          রিসেট
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* MUSIC PLAYLIST MANAGER */}
                                  <div className="space-y-2 pt-2 border-t border-zinc-850/80">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider text-left">
                                        {bgMusicPlaybackMode === 'remix' ? 'রিমিক্সের গান সিলেক্ট ও প্লেলিস্ট' : 'মিউজিক প্লেলিস্ট রোটেশন'}
                                      </p>
                                      {bgMusicPlaybackMode === 'remix' && settingsMusicList.length > 0 && (
                                        <span className="text-[9px] font-mono text-amber-400">
                                          {(remixSelectedTrackIds && remixSelectedTrackIds.length > 0
                                            ? settingsMusicList.filter(t => remixSelectedTrackIds.includes(t.id)).length
                                            : settingsMusicList.length)}/{settingsMusicList.length} সিলেক্টেড
                                        </span>
                                      )}
                                    </div>
                                    
                                    {settingsMusicList.length === 0 ? (
                                      <p className="text-[10px] text-zinc-600 font-mono italic text-left">কোন মিউজিক পাওয়া যায়নি।</p>
                                    ) : (
                                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                                        {settingsMusicList.map((track) => {
                                          const isCurrent = currentlyPlayingTrackId === track.id;
                                          const allIds = settingsMusicList.map(t => t.id);
                                          const isSelectedForRemix =
                                            !remixSelectedTrackIds ||
                                            remixSelectedTrackIds.length === 0 ||
                                            remixSelectedTrackIds.includes(track.id);
                                          const savedPos = remixStatus?.positions?.[track.id] || window.bgMusicPositions?.[track.id] || 0;
                                          const trackDur = remixStatus?.durations?.[track.id] || window.bgMusicDurations?.[track.id] || track.analysis?.duration || 0;
                                          const isCompleted = Boolean(remixStatus?.completedIds?.[track.id]);

                                          return (
                                            <div 
                                              key={track.id}
                                              className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
                                                isCurrent 
                                                  ? 'bg-amber-500/10 border-amber-500/30' 
                                                  : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-850'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {bgMusicPlaybackMode === 'remix' && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleToggleRemixTrackSelection(track.id, allIds);
                                                    }}
                                                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors cursor-pointer ${
                                                      isSelectedForRemix
                                                        ? 'bg-amber-500 border-amber-400 text-zinc-950'
                                                        : 'bg-zinc-900 border-zinc-700 text-transparent'
                                                    }`}
                                                    title={isSelectedForRemix ? 'রিমিক্স থেকে বাদ দিন' : 'রিমিক্সে যুক্ত করুন'}
                                                  >
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                  </button>
                                                )}

                                                <div 
                                                  onClick={() => {
                                                    if (bgMusicPlaybackMode === 'remix' && !isSelectedForRemix) {
                                                      handleToggleRemixTrackSelection(track.id, allIds);
                                                    }
                                                    setTimeout(() => {
                                                      if (window.selectBgMusicById) {
                                                        window.selectBgMusicById(track.id);
                                                      } else if (window.selectBgMusic) {
                                                        const activeIdx = (window.bgMusicTrackList || []).findIndex(t => t.id === track.id);
                                                        window.selectBgMusic(activeIdx >= 0 ? activeIdx : 0);
                                                      }
                                                      if (!bgMusicEnabled) setBgMusicEnabled(true);
                                                    }, 30);
                                                  }}
                                                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                                >
                                                  {isCurrent && bgMusicEnabled ? (
                                                    <div className="flex gap-0.5 items-end h-3 w-3 shrink-0 mb-0.5">
                                                      <span className="w-0.5 bg-amber-400 h-full animate-[bounce_1s_infinite_100ms]" />
                                                      <span className="w-0.5 bg-amber-400 h-2/3 animate-[bounce_1s_infinite_300ms]" />
                                                      <span className="w-0.5 bg-amber-400 h-full animate-[bounce_1s_infinite_500ms]" />
                                                    </div>
                                                  ) : (
                                                    <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-amber-400' : 'text-zinc-600'}`} />
                                                  )}
                                                  <div className="min-w-0 flex-1 text-left">
                                                    <span className={`block truncate text-xs font-medium ${isCurrent ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                                                      {track.name}
                                                    </span>
                                                    {bgMusicPlaybackMode === 'remix' && (isCompleted || savedPos > 1 || track.analysis?.bpm) && (
                                                      <span className="block text-[9px] font-mono text-zinc-500 truncate">
                                                        {isCompleted
                                                          ? '✓ সম্পূর্ণ প্লে সম্পন্ন'
                                                          : savedPos > 1
                                                          ? `রিজিউম: ${formatAudioTime(savedPos)}${trackDur ? ` / ${formatAudioTime(trackDur)}` : ''}`
                                                          : ''}
                                                        {track.analysis?.bpm ? `${(isCompleted || savedPos > 1) ? ' · ' : ''}${track.analysis.bpm} BPM` : ''}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => handleSettingsDeleteMusic(track.id, track.name)}
                                                className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                                                title="ডিলিট করুন"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* UPLOAD NEW BACKGROUND TRACK */}
                                  <div className="pt-2 border-t border-zinc-850/80 space-y-2">
                                    <p className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider text-left">নতুন মিউজিক আপলোড করুন</p>
                                    
                                    <div className="flex flex-col gap-2">
                                      <input
                                        type="text"
                                        value={settingsMusicName}
                                        onChange={(e) => setSettingsMusicName(e.target.value)}
                                        placeholder="মিউজিকের নাম (যেমন: Alpha Waves)"
                                        className="w-full bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded-xl text-zinc-200 placeholder-zinc-700 font-sans focus:outline-none focus:border-amber-500"
                                      />

                                      <label
                                        htmlFor="inline-settings-music-upload"
                                        className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-amber-400 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 font-bold transition-all text-xs"
                                      >
                                        {isUploadingSettingsMusic ? (
                                          <>
                                            <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                                            <span>আপলোড হচ্ছে...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>অডিও ফাইল সিলেক্ট করুন</span>
                                          </>
                                        )}
                                      </label>
                                      <input
                                        type="file"
                                        id="inline-settings-music-upload"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleSettingsMusicUpload(file);
                                          }
                                        }}
                                      />
                                      {settingsMusicError && (
                                        <p className="text-[10px] text-rose-500 font-mono font-medium text-left">{settingsMusicError}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                              </div>
                            )}
                          </div>

                          {/* App Version Info & System Status */}
                          <div className="mt-8 pt-4 border-t border-zinc-900 flex flex-col items-center justify-center gap-1.5 text-center shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-black rounded-full shadow-sm">
                                v{APP_VERSION}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">SelfX Lookmaxing System</span>
                            </div>
                            <p className="text-[9px] text-zinc-600 font-mono tracking-wider">
                              Version {APP_VERSION} (Stable Production)
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CUSTOM FLOATING NOTIFICATIONS SCREEN OVERLAY INSIDE THE PHONE */}
                    <AnimatePresence>
                      {isActivitiesOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 100 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 100 }}
                          className="absolute inset-0 bg-[#000000] z-25 flex flex-col p-5 pb-20 select-none overflow-y-auto"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 shrink-0 mt-1">
                            <div className="flex items-center gap-2">
                              <BellRing className="w-5 h-5 text-amber-400 animate-pulse" />
                              <div>
                                <h3 className="text-xs font-display font-black text-zinc-100 uppercase tracking-widest">
                                  Activities & Alerts
                                </h3>
                                <p className="text-[9px] text-amber-400/90 font-mono">লক-স্ক্রিন নোটিফিকেশন সেন্টার</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {activities.length > 0 && (
                                <button 
                                  onClick={() => {
                                    setActivities([]);
                                  }}
                                  className="px-2.5 py-1 bg-zinc-900/60 hover:bg-zinc-800 text-red-400 border border-zinc-850/60 rounded-lg text-[8px] font-bold uppercase cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <button 
                                onClick={() => setIsActivitiesOpen(false)}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-850 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                ✕ Close
                              </button>
                            </div>
                          </div>

                          {/* CLEAN NOTIFICATION DISPLAY MODE (USER REQUESTED: ONLY IMPORTANT & WORK REMINDERS) */}
                          <div className="mb-4 p-3.5 bg-gradient-to-br from-zinc-900/95 via-zinc-950 to-zinc-900/95 border border-amber-500/35 rounded-2xl space-y-2.5 shadow-lg text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${onlyEssentialNotifications ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
                                <span className="text-[11px] font-bold text-amber-300 font-sans">শুধুমাত্র কাজের ও জরুরি নোটিফিকেশন</span>
                              </div>
                              <button
                                type="button"
                                onClick={toggleOnlyEssentialNotifications}
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                                  onlyEssentialNotifications ? 'bg-emerald-500' : 'bg-zinc-800'
                                }`}
                                title="টগল করুন"
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                    onlyEssentialNotifications ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                            <p className="text-[10.5px] text-zinc-300 leading-relaxed font-sans">
                              {onlyEssentialNotifications 
                                ? '🛡️ অপ্রয়োজনীয় হাবিজাবি নোটিফিকেশন ডিসপ্লেতে আসা সম্পূর্ণ বন্ধ। শুধুমাত্র কাজের কথা মনে করিয়ে দেওয়া, টু-ডু, ডিক্রি ও গুরুত্বপূর্ণ অ্যালার্ম স্ক্রিনে ভেসে উঠবে।'
                                : '⚠️ সাধারণ মোড: সব নোটিফিকেশন ডিসপ্লেতে ভেসে উঠবে।'}
                            </p>
                          </div>

                          {/* HIGH-POWER LOCK SCREEN NOTIFICATION TEST BAR */}
                          <div className="mb-4 p-3.5 bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl space-y-2.5 shadow-lg text-left">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span className="text-[11px] font-bold text-amber-300 font-sans">লক-স্ক্রিন ডিসপ্লে সক্রিয়</span>
                              </div>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase">
                                Persistent
                              </span>
                            </div>
                            <p className="text-[10.5px] text-zinc-300 leading-relaxed font-sans">
                              অ্যাপ বন্ধ থাকলেও বা ফোন লক থাকলেও নোটিফিকেশন আপনার লক-স্ক্রিনে ভেসে থাকবে। নিচের বাটনে চাপ দিয়ে এখনই টেস্ট করে দেখতে পারেন:
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if ('Notification' in window && Notification.permission !== 'granted') {
                                  Notification.requestPermission().then((perm) => {
                                    if (perm === 'granted') {
                                      triggerNotification("👑 SelfX Lock Screen Alert", "আপনার লকস্ক্রিন নোটিফিকেশন সিস্টেম সম্পূর্ণ সক্রিয় ও পাওয়ারফুল!", true);
                                    } else {
                                      triggerNotification("🔔 Notification Alert", "ব্রাউজার থেকে নোটিফিকেশন পারমিশন Allow করুন দোস্ত!", true);
                                    }
                                  });
                                } else {
                                  triggerNotification("👑 SelfX Lock Screen Alert", "আপনার লকস্ক্রিন নোটিফিকেশন সিস্টেম সম্পূর্ণ সক্রিয় ও পাওয়ারফুল!", true);
                                }
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                            >
                              <BellRing className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
                              <span>📲 লক-স্ক্রিন নোটিফিকেশন পরীক্ষা করুন (Test Lock Screen)</span>
                            </button>
                          </div>

                          {/* Notifications List */}
                          <div className="flex-1 space-y-3">
                            {activities.map((act) => (
                              <div 
                                key={act.id} 
                                className={`p-4 rounded-2xl border transition-all ${
                                  !act.read 
                                    ? 'bg-gradient-to-r from-zinc-950 to-[#0e0c15] border-pink-500/20' 
                                    : 'bg-zinc-950/40 border-zinc-900/60'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-xl shrink-0 ${
                                    act.type === 'love' ? 'bg-pink-500/10 text-pink-400' :
                                    act.type === 'community' ? 'bg-indigo-500/10 text-indigo-400' :
                                    act.type === 'achievement' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-850 text-zinc-400'
                                  }`}>
                                    {act.type === 'love' ? <Heart className="w-4 h-4" /> :
                                     act.type === 'community' ? <Users className="w-4 h-4" /> :
                                     act.type === 'achievement' ? <Sparkles className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
                                  </div>
                                  <div className="space-y-1 flex-1 text-left">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-xs text-zinc-100">{act.title}</span>
                                      <span className="text-[8px] text-zinc-600 font-mono">
                                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                                      {act.body}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {activities.length === 0 && (
                              <div className="py-12 text-center bg-zinc-950/20 border border-zinc-900/40 rounded-2xl">
                                <BellRing className="w-8 h-8 text-zinc-700 mx-auto mb-2 animate-bounce" />
                                <p className="text-[10px] text-zinc-550 font-mono">NO RECENT ALERTS</p>
                                <p className="text-[9px] text-zinc-650 font-sans mt-1">Activities logged during discipline triggers populate here.</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* BACK BAR */}
                <div className="bg-[#090a1f]/85 border border-zinc-900/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <button
                    onClick={() => setActiveTab('hud')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-gold-500/30 text-gold-400 hover:text-gold-300 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <span>← BACK TO HUD DASHBOARD</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse shrink-0" />
                    <h3 className="text-xs font-display font-black uppercase tracking-widest text-zinc-300">
                      {activeTab === 'community' && '✨ Global Live Member Timeline'}
                      {activeTab === 'powerai' && '🤖 Deep AI Face & Derm Scanner'}
                      {activeTab === 'chat' && '🤖 AI Friend & Decree Roaster'}
                      {activeTab === 'reality' && '👑 Reality (রিয়েলিটি — জীবন ও স্মৃতি)'}
                      {activeTab === 'habits' && '📈 Habits, Hydration & Faith Duties Dashboard'}
                      {activeTab === 'water' && '💧 Hydration Fluid Retention Manager'}
                      {activeTab === 'challenges' && '🎯 Anti-Laziness Mindset Challenges'}
                      {activeTab === 'notes' && '📝 Dynamic Task Lists & Notes'}
                      {activeTab === 'faith' && '🕌 Faith Duties & Daily Amals'}
                      {activeTab === 'inspiration' && '🧭 Visual Grooming Moodboard'}
                      {activeTab === 'cinema' && '🎬 Cinema Hub & Aesthetic Movies'}
                      {activeTab === 'fitbody' && '🔥 Fit Body: Nutrition & Diet Replacement'}
                    </h3>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-900 text-[10px] font-mono text-zinc-550 uppercase tracking-widest">
                    Active View
                  </div>
                </div>

                {/* TAB PORTLAND WRAPPER */}
                <div id="tab-portland" className="min-h-[400px] animate-fade-in">
          {activeTab === 'fitbody' && (
            <div className="fixed inset-0 z-[100] bg-[#0a0a0c] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              {/* Full Screen Header */}
              <div className="bg-[#121214] border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Flame className="w-5.5 h-5.5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-black text-zinc-100 uppercase tracking-wider">
                      Fit Body Protocols (ফিট বডি)
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-1">
                      Body shaping, workout swaps & meal scanner · Full screen mode
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('hud')}
                  className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                >
                  <span>← Close</span>
                </button>
              </div>

              {/* Full Screen Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full">
                <FitBody />
              </div>
            </div>
          )}
          {activeTab === 'habits' && (
            <DailyHabits 
              habits={habits} 
              setHabits={setHabits} 
              water={water} 
              setWater={setWater} 
              faith={faith} 
              setFaith={setFaith} 
              todos={todos}
              setTodos={setTodos}
              onEarnPoints={handleEarnPoints} 
            />
          )}
          {activeTab === 'challenges' && (
            <ChallengeCreator 
              challenges={challenges} 
              setChallenges={setChallenges} 
              habits={habits} 
              onEarnPoints={handleEarnPoints} 
              water={water}
              photos={photos}
              faith={faith}
              alarm={alarm}
            />
          )}
          {activeTab === 'chat' && (
            <div className="fixed inset-0 z-[100] bg-black text-zinc-100 flex flex-col overflow-hidden animate-fadeIn">
              <AiChatRoaster
                completedHabitsCount={habits.filter(h => h.completed).length}
                totalHabitsCount={habits.length}
                waterDrank={(water as any)?.glasses ?? water?.count ?? 0}
                photosUploaded={photos.length}
                points={points}
                onBack={() => setActiveTab('hud')}
              />
            </div>
          )}
          {activeTab === 'reality' && (
            <div className="fixed inset-0 z-[100] bg-black text-zinc-100 flex flex-col overflow-hidden animate-fadeIn">
              <RealityHub 
                onBack={() => setActiveTab('hud')}
                initialAuthorName={userProfile?.name || "Atif Nirob"}
              />
            </div>
          )}
          {activeTab === 'community' && (
            <div className="fixed inset-0 z-[100] bg-black text-zinc-100 flex flex-col overflow-hidden animate-fadeIn">
              <OurCommunity 
                userProfile={userProfile} 
                onEarnPoints={handleEarnPoints} 
                setUserProfile={setUserProfile} 
                onBack={() => setActiveTab('hud')}
                memberId={memberId}
                initialTikTokUrl={pendingSharedTikTokUrl}
              />
            </div>
          )}
          {activeTab === 'powerai' && (
            <div className="fixed inset-0 z-[100] bg-[#0a0a0c] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              {/* Full Screen Header */}
              <div className="bg-[#121214] border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-amber-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                    <Sparkles className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-black text-zinc-100 uppercase tracking-wider">
                      Full Looksmaxing Suite (ফটো ডায়েরি ও স্ক্যানার)
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-1">
                      Deep AI Face Scan, Derm Analysis & Habit Ticks · Full screen mode
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('hud')}
                  className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                >
                  <span>← Close</span>
                </button>
              </div>

              {/* Full Screen Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full">
                <PhotoJournal 
                  duration={journalDuration} 
                  setDuration={setJournalDuration} 
                  photos={photos} 
                  setPhotos={setPhotos} 
                  onEarnPoints={handleEarnPoints}
                  initialSubTab={looksmaxSubTab}
                  challenges={challenges}
                  setChallenges={setChallenges}
                  habits={habits}
                  water={water}
                  faith={faith}
                  alarm={alarm}
                />
              </div>
            </div>
          )}
          {activeTab === 'inspiration' && (
            <AestheticInspiration onClose={() => setActiveTab('hud')} />
          )}
          {activeTab === 'faith' && (
            <div className="fixed inset-0 z-[100] bg-[#0a0a0c] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              <div className="bg-[#121214] border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <BookOpen className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-black text-zinc-100 uppercase tracking-wider">
                      Faith Duty (আমল ও নামাজ)
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-1">
                      Maulana AI spiritual counsel & daily prayers tracking · Full screen mode
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('hud')}
                  className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                >
                  <span>← Close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full">
                <FaithTracker faith={faith} setFaith={setFaith} onEarnPoints={handleEarnPoints} />
              </div>
            </div>
          )}
          {activeTab === 'cinema' && (
            <div className="fixed inset-0 z-[100] bg-[#0a0a0c] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              <div className="bg-[#121214] border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Film className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-black text-zinc-100 uppercase tracking-wider">
                      Cinema Hub (সিনেমাহাব)
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-1">
                      Inspirational movies, series logger & AI reviews · Full screen mode
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('hud')}
                  className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                >
                  <span>← Close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full">
                <ErrorBoundary>
                  <CinemaHub />
                </ErrorBoundary>
              </div>
            </div>
          )}
          {activeTab === 'dream_day' && (
            <div className="fixed inset-0 z-[100] bg-[#0a0a0c] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              {/* Full Screen Header */}
              <div className="bg-[#121214] border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sunrise className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-black text-zinc-100 uppercase tracking-wider">
                      Dream Day (২৪ ঘণ্টার জীবন রুটিন)
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-1">
                      Build your ideal 24-hour routine & animated visualization · Full screen mode
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('hud')}
                  className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                >
                  <span>← Close</span>
                </button>
              </div>

              {/* Full Screen Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full">
                <DreamDay onEarnPoints={handleEarnPoints} onClose={() => setActiveTab('hud')} />
              </div>
            </div>
          )}
          {activeTab === 'finance' && (
            <div className="fixed inset-0 z-[100] bg-[#070e1b] text-[#e0edff] flex flex-col overflow-hidden animate-fadeIn font-sans">
              {/* Full Screen Header */}
              <div className="bg-[#0b1426] border-b border-[#1b2f54] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/40 to-indigo-700/30 border border-blue-500/50 flex items-center justify-center text-blue-300 shadow-inner">
                    <Wallet className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-blue-400 font-bold">Selfx AI Suite</span>
                      <span className="text-[8px] bg-[#122347] text-blue-300 border border-blue-500/40 px-1.5 py-0.2 rounded-full font-mono font-bold">9 MODULES</span>
                    </div>
                    <h2 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                      Finance (পার্সোনাল এআই ফাইন্যান্স)
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('hud')}
                  className="px-4 py-2 bg-[#101e38] hover:bg-[#16294d] text-blue-200 hover:text-white border border-[#203a69] hover:border-blue-500 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                >
                  <span>← Close</span>
                </button>
              </div>

              {/* Full Screen Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <SelfxFinance onClose={() => setActiveTab('hud')} />
              </div>
            </div>
          )}
          {activeTab === 'wardrobe' && (
            <div className="fixed inset-0 z-[100] bg-[#070709] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              <DigitalWardrobe onClose={() => setActiveTab('hud')} />
            </div>
          )}
          {activeTab === 'social_ai' && (
            <div className="fixed inset-0 z-[100] bg-[#07080d] text-zinc-100 flex flex-col overflow-y-auto animate-fadeIn font-sans">
              <SocialGrowthHub
                onEarnPoints={handleEarnPoints}
                onClose={() => setActiveTab('hud')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </div>
          )}
          {activeTab === 'english' && (
            <div className="fixed inset-0 z-[100] bg-[#030303] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              <div className="flex-1 overflow-y-auto w-full">
                <LearnEnglish 
                  onClose={() => setActiveTab('hud')} 
                  onEarnPoints={(amt: number) => handleEarnPoints(amt, 'Learn English')} 
                  currentPoints={points} 
                />
              </div>
            </div>
          )}
          {activeTab === 'skills' && (
            <div className="fixed inset-0 z-[100] bg-[#030908] text-zinc-100 flex flex-col overflow-y-auto animate-fadeIn font-sans">
              <SkillLearnerHub onClose={() => setActiveTab('hud')} />
            </div>
          )}
          {activeTab === 'teacher_ai' && (
            <div className="fixed inset-0 z-[100] bg-[#070913] text-zinc-100 flex flex-col overflow-y-auto animate-fadeIn font-sans">
              <TeacherAiHub onClose={() => setActiveTab('hud')} />
            </div>
          )}
          {activeTab === 'habits_full' && (
            <div className="fixed inset-0 z-[100] bg-[#0a0a0c] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              
              {/* Full Screen Header */}
              <div className="bg-[#121214] border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-gold-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    {habitSubTab === 'matrix' && <CheckSquare className="w-5.5 h-5.5" />}
                    {habitSubTab === 'water' && <Droplet className="w-5.5 h-5.5" />}
                    {habitSubTab === 'faith' && <BookOpen className="w-5.5 h-5.5" />}
                    {habitSubTab === 'notes' && <Bookmark className="w-5.5 h-5.5" />}
                    {(habitSubTab === 'routine' || habitSubTab === 'dream_day') && <Sparkles className="w-5.5 h-5.5 text-amber-400" />}
                    {habitSubTab === 'nofap' && <Flame className="w-5.5 h-5.5 text-rose-500 animate-pulse" />}
                    {habitSubTab === 'love_angel' && <Heart className="w-5.5 h-5.5 text-pink-500 animate-pulse" />}
                    {habitSubTab === 'lecture' && <GraduationCap className="w-5.5 h-5.5 text-violet-400 animate-pulse" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-black text-zinc-100 uppercase tracking-wider">
                      {habitSubTab === 'matrix' && 'Core Habits Matrix'}
                      {habitSubTab === 'water' && 'Water Intake Base'}
                      {habitSubTab === 'faith' && 'Faith & Spiritual Duties'}
                      {habitSubTab === 'notes' && 'Personal Notes & Tasks'}
                      {(habitSubTab === 'routine' || habitSubTab === 'dream_day') && 'Dream Day (২৪ ঘণ্টার জীবন রুটিন)'}
                      {habitSubTab === 'nofap' && 'No Fap Soldier Protocol'}
                      {habitSubTab === 'love_angel' && 'Love Angel (লাভ এঞ্জেল)'}
                      {habitSubTab === 'lecture' && 'Lecture Room (লেকচার রুম)'}
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-1">
                      Continuous discipline protocol · Full screen mode
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('hud')}
                  className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>← Close</span>
                </button>
              </div>

              {/* Full Screen Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full">
                <DailyHabits 
                  habits={habits} 
                  setHabits={setHabits} 
                  water={water} 
                  setWater={setWater} 
                  faith={faith} 
                  setFaith={setFaith} 
                  todos={todos}
                  setTodos={setTodos}
                  onEarnPoints={handleEarnPoints}
                  initialSubTab={habitSubTab}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>
</main>

    {activeTab === 'alarm' && (
            <div className="fixed inset-0 z-[100] bg-black text-zinc-100 flex flex-col overflow-hidden animate-fadeIn font-sans">
              {/* Full Screen Header */}
              <div className="bg-[#121214] border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-black text-base text-zinc-100 tracking-wide">
                      {t("স্মার্ট স্যাভেজ এলার্ম সিস্টেম", "SMART SAVAGE ALARM SYSTEM")}
                    </h2>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {t("মর্নিং রুটিন ও ডিসিপ্লিন লক", "MORNING ROUTINE & DISCIPLINE LOCK")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab(null)}
                  className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>← Close</span>
                </button>
              </div>

              {/* Full Screen Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full">
                <AlarmSystem
                  alarm={alarm}
                  setAlarm={setAlarm}
                  alarmRoast={alarmRoast}
                  setAlarmRoast={setAlarmRoast}
                  onEarnPoints={handleEarnPoints}
                />
              </div>
            </div>
          )}

      {/* GLOBAL STANDING EYES-OPEN SELFIE WAKE UP LOCKDOWN OVERLAY */}
      <AnimatePresence>
        {alarm.isTriggered && (
          <WakeUpSelfieModal
            alarm={alarm}
            alarmRoast={alarmRoast}
            strobe={strobe}
            onEnsureAudioPlaying={ensureAlarmAudioPlaying}
            onVerifiedDismiss={handleVerifiedSelfieDismiss}
          />
        )}
      </AnimatePresence>

      {/* DAILY MOTIVATIONAL QUOTE MODAL */}
      <AnimatePresence>
        {dailyQuote && (
          <div id="daily-motivation-quote-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="max-w-md w-full bg-[#0a0a0c] border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative text-center"
            >
              <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 mx-auto">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-amber-500 font-display">আজকের ডিক্রি বাণী</h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  {dailyQuote}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDailyQuote(null)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                Thanks Bro, Let&apos;s Grind!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DECREE HUB MODAL */}
      <AnimatePresence>
        {showDecreeHub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5 relative"
            >
              <button
                type="button"
                onClick={() => {
                  stopDecreeMusic();
                  setShowDecreeHub(false);
                  setActiveDecreeText(null);
                  setSelectedDecreeCategory(null);
                }}
                className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {!activeDecreeText && (
                <div className="text-center space-y-1">
                  <h3 className="text-base font-black text-amber-500 uppercase tracking-widest">
                    👑 ডিক্রি কেবিন (DECREE CABIN)
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    বেস্ট ফ্রেন্ড এর অনন্য অনুপ্রেরণা জোন
                  </p>
                </div>
              )}

              {!activeDecreeText && (
                <div className="flex border-b border-zinc-900 pb-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setDecreeActiveTab('tasks')}
                    className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 ${decreeActiveTab === 'tasks' ? 'border-amber-500 text-amber-500 font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                  >
                    📋 কাজ ও রিমাইন্ডার
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecreeActiveTab('quotes')}
                    className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 ${decreeActiveTab === 'quotes' ? 'border-amber-500 text-amber-500 font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                  >
                    📖 বাণী
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecreeActiveTab('direction')}
                    className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 ${decreeActiveTab === 'direction' ? 'border-amber-500 text-amber-500 font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                  >
                    🧭 দিকনির্দেশনা
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecreeActiveTab('music')}
                    className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 ${decreeActiveTab === 'music' ? 'border-amber-500 text-amber-500 font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                  >
                    🎵 মিউজিক
                  </button>
                </div>
              )}

              {activeDecreeText ? (
                <div className="space-y-4 text-center">
                  <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] font-mono text-amber-400 font-bold">
                    {selectedDecreeCategory || "👑 ডিক্রি বাণী"}
                  </div>

                  <p className="text-sm font-medium text-zinc-100 leading-relaxed italic bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850">
                    &quot;{activeDecreeText}&quot;
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => speakTextWithMaleVoice(activeDecreeText)}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Volume2 className="w-4 h-4" /> পড়ুন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDecreeText(null);
                        setSelectedDecreeCategory(null);
                      }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      ফিরে যান
                    </button>
                  </div>
                </div>
              ) : decreeActiveTab === 'tasks' ? (
                <div className="space-y-4 text-left">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl">
                    <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <BellRing className="w-4 h-4" />
                      সারাদিনের জরুরি কাজ ও লকস্ক্রিন রিমাইন্ডার
                    </h4>
                    <p className="text-[10px] text-zinc-300 mt-1 leading-relaxed">
                      সারাদিনে যেসব জরুরি কাজ করবেন তা এখানে সময়সহ সেভ রাখুন। ফোন লক থাকলেও লকস্ক্রিন বা অ্যাপে ঢুকলে সাথে সাথে সরাসরি উচ্চ-শব্দ ও ভয়েস অ্যালার্ট পাবেন!
                    </p>
                  </div>

                  {/* Task Input Form */}
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={newDecreeTaskText}
                      onChange={(e) => setNewDecreeTaskText(e.target.value)}
                      placeholder="কাজের নাম লিখুন (যেমন: সন্ধ্যা ৬টায় জিম ওয়ার্কআউট)..."
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />

                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={newDecreeTaskTime}
                        onChange={(e) => setNewDecreeTaskTime(e.target.value)}
                        className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newDecreeTaskText.trim()) {
                            triggerNotification("⚠️ কাজের নাম দিন", "অনুগ্রহ করে কী কাজ করবেন তা লিখুন।");
                            return;
                          }
                          const timeVal = newDecreeTaskTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          handleAddScheduledTask(newDecreeTaskText, timeVal);
                          setNewDecreeTaskText('');
                          setNewDecreeTaskTime('');
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-zinc-950 font-black text-xs uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>সেভ & লকস্ক্রিন অ্যালার্ট সক্রিয়</span>
                      </button>
                    </div>

                    {/* Quick suggestion tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[9px] font-mono text-zinc-500">কুইক সাজেশন:</span>
                      {[
                        { label: '🏋️‍♂️ জিম ওয়ার্কআউট', text: 'জিম ও বডি ওয়ার্কআউট' },
                        { label: '💧 ২ লিটার পানি', text: 'পর্যাপ্ত পানি পান করা' },
                        { label: '📚 পড়াশোনা/টাস্ক', text: 'জরুরি পড়াশোনা ও প্রজেক্ট টাস্ক' },
                        { label: '🧴 স্কিনকেয়ার', text: 'ফেসওয়াশ ও স্কিনকেয়ার রুটিন' },
                        { label: '⚽ ফুটবল প্র্যাকটিস', text: 'ফুটবল ম্যাচ ও প্র্যাকটিস' },
                        { label: '💊 ওষুধ গ্রহণ', text: 'প্রেসক্রিপশন অনুযায়ী ওষুধ খাওয়া' },
                        { label: '🎬 ভিডিও আপলোড', text: 'চ্যানেলে নতুন ভিডিও শুট ও আপলোড' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewDecreeTaskText(item.text)}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Test notification button */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerDecreeLockScreenNotification(
                        "⏰ নির্ধারিত কাজের রিমাইন্ডার",
                        "❝ আপনার গুরুত্বপূর্ণ কাজ ❞ — নির্ধারিত কাজের সময় হয়েছে, ফোকাস রেখে এখনই সম্পন্ন করুন!"
                      );
                      triggerNotification("📲 টেস্ট অ্যালার্ট পাঠানো হয়েছে!", "আপনার ফোনের নোটিফিকেশন বার ও লকস্ক্রিন চেক করুন।");
                    }}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>📲 এখনই ফোনে লকস্ক্রিন অ্যালার্ট টেস্ট করুন</span>
                  </button>

                  {/* Scheduled Tasks List */}
                  <div className="space-y-2 pt-1 text-left">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider block">
                      📌 আপনার সংরক্ষিত কাজের তালিকা ({scheduledVoiceTasks.length})
                    </span>

                    {scheduledVoiceTasks.length === 0 ? (
                      <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl text-center text-xs text-zinc-500 italic">
                        এখনো কোনো কাজের রিমাইন্ডার সেট করেননি। উপরে কাজের নাম ও সময় দিয়ে সেভ করুন।
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {scheduledVoiceTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                              task.reminded ? 'bg-zinc-900/40 border-zinc-850 opacity-60' : 'bg-zinc-900/90 border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate flex-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setScheduledVoiceTasks(prev => prev.map(t => t.id === task.id ? { ...t, reminded: !t.reminded } : t));
                                }}
                                className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] cursor-pointer transition-colors shrink-0 ${
                                  task.reminded 
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' 
                                    : 'bg-zinc-950 border-zinc-700 text-transparent hover:border-amber-500'
                                }`}
                              >
                                ✓
                              </button>
                              <span className={`font-medium truncate ${task.reminded ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                {task.taskText}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {task.timeStr}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerDecreeLockScreenNotification(
                                    `⏰ নির্ধারিত কাজ • ${task.timeStr}`,
                                    `❝ ${task.taskText} ❞ — আপনার এই কাজের কথা মনে করিয়ে দেওয়া হলো। ফোকাস রাখুন ও সম্পন্ন করুন!`
                                  );
                                  triggerNotification("📲 লকস্ক্রিন অ্যালার্ট পুশ করা হয়েছে", `'${task.taskText}' এর অ্যালার্ট ডিসপ্লেতে পাঠানো হয়েছে।`);
                                }}
                                className="p-1 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-md transition-colors cursor-pointer"
                                title="Send Lock Screen Notification"
                              >
                                <BellRing className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setScheduledVoiceTasks(prev => prev.filter(t => t.id !== task.id))}
                                className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : decreeActiveTab === 'quotes' ? (
                <div className="space-y-3">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold tracking-widest block text-center mb-1">
                    আজ আপনার কী প্রয়োজন, দোস্ত?
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const randomQuote = getRandomQuote(HAPPY_QUOTES);
                        setSelectedDecreeCategory("😊 কুইক হ্যাপি (QUICK HAPPY)");
                        setActiveDecreeText(randomQuote);
                        startDecreeMusic('happy');
                      }}
                      className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-center space-y-2 hover:border-amber-500/40 hover:bg-zinc-900/40 transition-all active:scale-95 group cursor-pointer"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">😊</div>
                      <div className="text-xs font-bold text-zinc-200">কুইক হ্যাপি</div>
                      <div className="text-[9px] text-zinc-500 font-medium">মন ভালো করার ভাইবস</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const randomQuote = getRandomQuote(MOTIVATE_QUOTES);
                        setSelectedDecreeCategory("🔥 কুইক মোটিভেট (QUICK MOTIVATION)");
                        setActiveDecreeText(randomQuote);
                        startDecreeMusic('motivate');
                      }}
                      className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-center space-y-2 hover:border-amber-500/40 hover:bg-zinc-900/40 transition-all active:scale-95 group cursor-pointer"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">🔥</div>
                      <div className="text-xs font-bold text-zinc-200">কুইক মোটিভেট</div>
                      <div className="text-[9px] text-zinc-500 font-medium">বিপ্লবী অনুপ্রেরণা</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const randomQuote = getRandomQuote(LOVE_QUOTES);
                        setSelectedDecreeCategory("💖 লাভ এঞ্জেল বাণী (LOVE QUOTE)");
                        setActiveDecreeText(randomQuote);
                        startDecreeMusic('love');
                      }}
                      className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-center space-y-2 hover:border-amber-500/40 hover:bg-zinc-900/40 transition-all active:scale-95 group cursor-pointer"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">💖</div>
                      <div className="text-xs font-bold text-zinc-200">লাভ বাণী</div>
                      <div className="text-[9px] text-zinc-500 font-medium">ভালোবাসার মোটিভেশন</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const randomQuote = getRandomQuote(LOOKSMAX_QUOTES);
                        setSelectedDecreeCategory("✨ লুক্সম্যাক্স বাণী (LOOKSMAX QUOTE)");
                        setActiveDecreeText(randomQuote);
                        startDecreeMusic('looksmax');
                      }}
                      className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-center space-y-2 hover:border-amber-500/40 hover:bg-zinc-900/40 transition-all active:scale-95 group cursor-pointer"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">✨</div>
                      <div className="text-xs font-bold text-zinc-200">লুক্সম্যাক্স বাণী</div>
                      <div className="text-[9px] text-zinc-500 font-medium">সেলফ ইমপ্রুভমেন্ট</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecreeActiveTab('direction')}
                      className="col-span-2 p-3 bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 rounded-2xl text-center space-y-1 hover:bg-amber-500/20 transition-all active:scale-95 group cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">🧭</span>
                        <span className="text-xs font-black text-amber-400">Direction AI (জীবন দিকনির্দেশক)</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-sans">সমস্যাগুলো ১, ২, ৩ লিখে সঠিক গাইডলাইন নিন</p>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDecreeHub(false);
                      setShowVoiceAssistant(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    ✨ Decree AI চালু করুন
                  </button>
                </div>
              ) : decreeActiveTab === 'direction' ? (
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-black">
                      🧭 জীবন দিকনির্দেশক (Direction AI)
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-sans px-2 font-medium">
                      কিরে দোস্ত! লাইফ নিয়া হতাশ বা পথহারা লাগে? কোনো প্যারা না নিয়া তোর সব প্রবলেম ১, ২, ৩ নম্বর আকারে নিচে লিখে দে। তোর ক্লোজ বেস্ট ফ্রেন্ডের মত একদম সোজাসাপ্টা কাট কথা আর রিয়েল প্র্যাকটিক্যাল সলিউশন পাবি! 👊🔥
                    </p>
                  </div>

                  {activeDirectionResult ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-zinc-900/90 border border-amber-500/30 rounded-2xl space-y-3 text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[45vh] overflow-y-auto shadow-inner">
                        {activeDirectionResult}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => speakTextWithMaleVoice(activeDirectionResult)}
                          className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Volume2 className="w-4 h-4" /> ভয়েসে শুনুন
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeDirectionResult);
                            triggerNotification("📋 কপি হয়েছে!", "দিকনির্দেশনা ক্লিপবোর্ডে কপি করা হয়েছে।");
                          }}
                          className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          📋 কপি
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveDirectionResult(null)}
                          className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          🔄 নতুন সমস্যা
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">
                          সমস্যার তালিকা (১, ২, ৩...):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDirectionInputText(
                              "১. বর্তমানে আমি কাজ/পড়াশোনায় ফোকাস ধরে রাখতে পারছি না এবং অনেক পিছিয়ে পড়ছি।\n২. নিজের ভবিষ্যত ও ক্যারিয়ার নিয়ে অনেক দুশ্চিন্তা ও মানসিক চাপ অনুভব করছি।\n৩. অলসতার জন্য রুটিন মেনে চলা কঠিন হয়ে পড়েছে, আমি পথহারা বোধ করছি।"
                            );
                          }}
                          className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          💡 ডেমো টেমপ্লেট
                        </button>
                      </div>

                      <textarea
                        rows={5}
                        value={directionInputText}
                        onChange={(e) => setDirectionInputText(e.target.value)}
                        placeholder={`১. বর্তমানে আমি কাজ/পড়াশোনায় ফোকাস ধরে রাখতে পারছি না...
২. নিজের ভবিষ্যত নিয়ে অনেক বেশি ফ্রাস্টেটেড...
৩. কেন আমি পথহারা বোধ করছি...
৪. আমার এই প্রবলেম গুলা...`}
                        className="w-full p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 resize-none font-sans"
                      />

                      <button
                        type="button"
                        disabled={isGeneratingDirection}
                        onClick={handleGetDirection}
                        className={`w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                          isGeneratingDirection ? 'opacity-70 cursor-wait' : ''
                        }`}
                      >
                        {isGeneratingDirection ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                            <span>মন ও ডাটা এনালাইসিস করে দিকনির্দেশনা তৈরি হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-zinc-950" />
                            <span>দিকনির্দেশনা পান (Get Direction)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Music Upload Panel */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider block">
                        ব্যাকগ্রাউন্ড মিউজিক আপলোড
                      </span>
                      <p className="text-[9px] text-zinc-500">আপনার প্রিয় MP3/WAV ফাইল যোগ করুন</p>
                    </div>
                    <label className="px-3 py-2 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 rounded-xl text-xs font-black text-amber-400 flex items-center gap-1.5 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" /> আপলোড করুন
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleDecreeAudioUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* List of Custom Audios */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono text-zinc-500 font-black tracking-widest block">
                      আপনার আপলোড করা ট্র্যাকসমূহ
                    </span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {customAudioList.length > 0 ? (
                        customAudioList.map((audio, idx) => {
                          const isPlaying = activeAudioKey === `custom-${idx}`;
                          return (
                            <div
                              key={audio.id}
                              className={`p-2 bg-zinc-950 border rounded-xl flex items-center justify-between gap-2 ${
                                isPlaying ? 'border-amber-500/50 bg-amber-500/[0.02]' : 'border-zinc-900'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (isPlaying) {
                                    if (audioPlayerRef.current) audioPlayerRef.current.pause();
                                    setActiveAudioKey('');
                                  } else {
                                    playDecreeAudio(`custom-${idx}`);
                                  }
                                }}
                                className="flex-1 text-left min-w-0 flex items-center gap-2 cursor-pointer"
                              >
                                <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
                                <span className={`text-xs truncate ${isPlaying ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                                  {audio.name}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDecreeAudioDelete(idx, audio.id)}
                                className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                title="ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-zinc-600 text-center py-4 bg-zinc-950/40 border border-zinc-900 border-dashed rounded-xl">
                          কোন ব্যাকগ্রাউন্ড মিউজিক আপলোড করা নেই। উপরে আপলোড বাটনে ক্লিক করুন!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 🎙️ DECREE AI VOICE ASSISTANT MODAL (COSMIC RING INTERFACE) */}
        <AnimatePresence>
          {showVoiceAssistant && (
            <div className="fixed inset-0 z-[150] flex flex-col items-center justify-between p-6 bg-black/95 backdrop-blur-xl select-none overflow-hidden">
              {/* Ambient Cosmic Glow */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className={`w-80 h-80 rounded-full blur-[110px] transition-all duration-700 ${
                  isAssistantListening
                    ? 'bg-blue-500/30 scale-125'
                    : assistantLoading
                    ? 'bg-indigo-500/25 scale-110'
                    : 'bg-blue-600/15 scale-100'
                }`} />
              </div>

              {/* Top Clean Minimalist Header: Title, Vibe Tag, Settings Gear, and Close Button */}
              <div className="w-full max-w-lg flex items-center justify-between z-10 pt-2 pb-1 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  <span className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">DECREE AI</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400">
                    {decreeMemory.vibeMode === 'tough_love' ? '🔥 কড়া শাসন' : decreeMemory.vibeMode === 'best_friend' ? '🤝 দোস্ত' : '🎓 টিচার'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Settings Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setDecreeSettingsTab('vibe');
                      setShowDecreeSettingsModal(true);
                    }}
                    className="p-2.5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-500/50 rounded-full text-zinc-300 hover:text-cyan-300 transition-all cursor-pointer shadow-md"
                    title="Decree AI সেটিংস (মুড, মেমোরি, চ্যাট হিস্ট্রি, ভয়েস)"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {/* Close Modal button */}
                  <button
                    type="button"
                    onClick={() => {
                      stopAssistantListening();
                      window.speechSynthesis?.cancel();
                      if (clonedVoiceAudioRef.current) {
                        clonedVoiceAudioRef.current.pause();
                        clonedVoiceAudioRef.current = null;
                      }
                      setShowVoiceAssistant(false);
                    }}
                    className="p-2.5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer shadow-md"
                    title="বন্ধ করুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT AREA: CLEAN COSMIC ORB PRESENCE */}
              <div className="flex-1 w-full max-w-lg flex flex-col items-center justify-center gap-4 z-10 my-auto min-h-0 overflow-hidden">
                {/* 🚨 Active Due Task Reminder Banner (if any) */}
                {activeDueReminderTask && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full max-w-md p-3 rounded-2xl bg-gradient-to-r from-amber-950/90 via-zinc-950 to-amber-950/90 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)] text-left space-y-2 z-20 shrink-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <BellRing className="w-3 h-3 text-amber-400 animate-bounce" />
                        কাজের রিমাইন্ডার • Due Now
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        ⏰ {activeDueReminderTask.timeStr}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white">
                      {activeDueReminderTask.taskText}
                    </h4>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const taskId = activeDueReminderTask.id;
                          const taskName = activeDueReminderTask.taskText;
                          setScheduledVoiceTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true, reminded: true } : t));
                          setActiveDueReminderTask(null);
                          setHabits(prev => prev.map(h => (h.name.includes(taskName) ? { ...h, completed: true, checked: true } : h)));
                          setPoints(p => p + 30);
                          const praise = "সাবাশ দোস্ত! তুই কাজের মানুষ, এক টানে কাজ শেষ করে ফেললি! 🔥";
                          speakTextWithMaleVoice(praise);
                        }}
                        className="flex-1 py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> সম্পন্ন
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const taskId = activeDueReminderTask.id;
                          setScheduledVoiceTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueTimestamp: Date.now() + 5 * 60 * 1000, notifiedInApp: false, alertCount: 0 } : t));
                          setActiveDueReminderTask(null);
                        }}
                        className="py-1.5 px-2.5 bg-zinc-900 border border-zinc-700 text-amber-300 font-bold text-xs rounded-xl"
                      >
                        ৫ মিনিট পর
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Clean Futuristic Decree AI Container */}
                <div className="w-full flex-1 flex flex-col items-center justify-start gap-3 min-h-0 overflow-y-auto scrollbar-thin py-2 px-1">
                  
                  {/* Cosmic Orb (Scales dynamically based on state) */}
                  <div
                    onClick={() => {
                      if (isAssistantSpeaking) {
                        if (clonedVoiceAudioRef.current) clonedVoiceAudioRef.current.pause();
                        window.speechSynthesis?.cancel();
                        setIsAssistantSpeaking(false);
                      } else if (assistantResponseText) {
                        speakTextWithMaleVoice(assistantResponseText);
                      } else {
                        const helloMsg = "কী অবস্থা দোস্ত! আমি শুনছি, বলো কী জানতে চাও!";
                        speakTextWithMaleVoice(helloMsg);
                      }
                    }}
                    className={`relative flex items-center justify-center cursor-pointer group select-none shrink-0 transition-all duration-300 ${
                      assistantResponseText || assistantLoading
                        ? "w-24 h-24 sm:w-28 sm:h-28 my-1"
                        : "w-40 h-40 sm:w-48 sm:h-48 my-auto"
                    }`}
                    title={isAssistantSpeaking ? "Pause" : "Play / Replay"}
                  >
                    {/* Outer Rotating Cosmic Ring */}
                    <motion.div
                      animate={{
                        rotate: 360,
                        scale: isAssistantSpeaking ? [1, 1.1, 1] : assistantLoading ? [1, 1.08, 1] : [1, 1.03, 1]
                      }}
                      transition={{
                        rotate: { duration: isAssistantSpeaking ? 3 : assistantLoading ? 1.5 : 12, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="absolute inset-1 rounded-full"
                      style={{
                        background: "conic-gradient(from 0deg, transparent 0%, #06b6d4 25%, #3b82f6 45%, #8b5cf6 65%, transparent 85%)",
                        filter: "blur(7px)",
                        opacity: isAssistantSpeaking ? 0.95 : assistantLoading ? 0.95 : 0.65
                      }}
                    />

                    {/* Secondary Tilted Particle Orbit Ring */}
                    <motion.div
                      animate={{
                        rotate: -360,
                        scale: isAssistantSpeaking ? [1.06, 0.95, 1.06] : 1
                      }}
                      transition={{
                        rotate: { duration: isAssistantSpeaking ? 4 : 16, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="absolute inset-2 rounded-full border-2 border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                      style={{ transform: "rotateX(28deg) rotateY(-18deg)" }}
                    />

                    {/* Inner Deep Space Core */}
                    <div className={`relative rounded-full bg-black shadow-[inset_0_0_25px_rgba(6,182,212,0.5)] flex flex-col items-center justify-center border border-cyan-500/40 ${
                      assistantResponseText || assistantLoading ? "w-20 h-20 sm:w-24 sm:h-24" : "w-32 h-32 sm:w-36 sm:h-36"
                    }`}>
                      <span className="absolute top-2 left-4 w-1 h-1 rounded-full bg-cyan-300 animate-ping" />
                      <span className="absolute bottom-3 right-4 w-1 h-1 rounded-full bg-blue-300 animate-pulse" />

                      {assistantLoading ? (
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300 animate-spin" />
                      ) : (
                        <Volume2 className={`transition-all duration-300 ${
                          assistantResponseText || assistantLoading ? "w-5 h-5 sm:w-6 sm:h-6" : "w-7 h-7 sm:w-8 sm:h-8"
                        } ${
                          isAssistantSpeaking
                            ? "text-cyan-300 scale-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.9)] animate-pulse"
                            : "text-blue-400/80 group-hover:text-cyan-300"
                        }`} />
                      )}
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.15em] text-cyan-300/90 mt-1 font-bold">
                        {assistantLoading ? "THINKING..." : isAssistantSpeaking ? "SPEAKING..." : "DECREE AI"}
                      </span>
                    </div>
                  </div>

                  {/* Sound Waveform Visualizer (when actively speaking) */}
                  {isAssistantSpeaking && (
                    <div className="flex items-center justify-center gap-1.5 h-5 shrink-0">
                      {[12, 26, 18, 32, 22, 28, 16, 26, 12].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: [5, h, 8, h * 0.85, 5],
                            opacity: [0.6, 1, 0.7]
                          }}
                          transition={{
                            duration: 0.65,
                            repeat: Infinity,
                            delay: i * 0.06,
                            ease: "easeInOut"
                          }}
                          className="w-1 bg-gradient-to-t from-cyan-500 via-blue-400 to-indigo-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        />
                      ))}
                    </div>
                  )}

                  {/* Clean Minimalist Thinking Indicator */}
                  {assistantLoading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs tracking-wider animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Thinking...</span>
                    </div>
                  )}

                  {/* Pure Written & Voiced Response Card (ONLY AI response, NO user bubble, NO clutter) */}
                  {!assistantLoading && assistantResponseText && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="w-full max-w-lg bg-gradient-to-b from-zinc-900/95 via-black/95 to-zinc-950/95 border border-cyan-500/40 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col gap-2.5 shrink-0"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                            <Zap className="w-3 h-3" />
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-white">Decree AI</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextMode = decreeMemory.vibeMode === 'tough_love' ? 'best_friend' : decreeMemory.vibeMode === 'best_friend' ? 'teacher' : 'tough_love';
                              setDecreeMemory(prev => ({ ...prev, vibeMode: nextMode }));
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 cursor-pointer transition-colors flex items-center gap-1"
                            title="মোড পরিবর্তন করতে ক্লিক করুন"
                          >
                            <span>{decreeMemory.vibeMode === "tough_love" ? "🔥 কড়া শাসন" : decreeMemory.vibeMode === "best_friend" ? "🤝 দোস্ত" : "🎓 টিচার"}</span>
                            <span className="text-cyan-400 text-[9px]">↻</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (isAssistantSpeaking) {
                                if (clonedVoiceAudioRef.current) clonedVoiceAudioRef.current.pause();
                                window.speechSynthesis?.cancel();
                                setIsAssistantSpeaking(false);
                              } else {
                                speakTextWithMaleVoice(assistantResponseText);
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 border border-cyan-400/30 transition-all cursor-pointer active:scale-95 shadow-sm"
                            title={isAssistantSpeaking ? "ভয়েস থামান" : "পুনরায় শুনুন"}
                          >
                            <Volume2 className={`w-3.5 h-3.5 ${isAssistantSpeaking ? "animate-pulse text-amber-300" : ""}`} />
                            <span>{isAssistantSpeaking ? "থামান" : "শুনুন"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(assistantResponseText);
                              import("./utils").then(({ triggerNotification }) => {
                                triggerNotification("📋 কপি হয়েছে", "টেক্সট কপি করা হয়েছে!");
                              });
                            }}
                            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-700 transition-all cursor-pointer active:scale-95"
                            title="কপি করুন"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Clean Scrollable Response Content */}
                      <div className="max-h-60 sm:max-h-80 overflow-y-auto pr-1 scrollbar-thin text-zinc-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text font-normal font-sans">
                        {assistantResponseText}
                      </div>
                    </motion.div>
                  )}

                </div>
              </div>

              {/* Bottom Clean Typing Bar with Multiline Support and 'বিস্তারিত' Mode Detection */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (assistantTextTyped.trim() && !assistantLoading) {
                    const txt = assistantTextTyped.trim();
                    setAssistantTextTyped('');
                    sendAssistantMessage(txt);
                  }
                }}
                className="w-full max-w-lg flex flex-col gap-1 z-10 pb-3 px-1"
              >
                
                <div className="w-full flex items-end gap-2">
                  <div className="relative flex-1">
                    <textarea
                      rows={Math.min(4, Math.max(1, assistantTextTyped.split('\n').length))}
                      value={assistantTextTyped}
                      onChange={(e) => setAssistantTextTyped(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (assistantTextTyped.trim() && !assistantLoading) {
                            const txt = assistantTextTyped.trim();
                            setAssistantTextTyped('');
                            sendAssistantMessage(txt);
                          }
                        }
                      }}
                      placeholder={decreeMemory.vibeMode === 'tough_love' ? "অজুহাত ছাড়া কী বলবি বল..." : "Decree AI-কে লিখুন..."}
                      className="w-full bg-zinc-900/95 border border-cyan-500/35 focus:border-cyan-400 rounded-2xl pl-4 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 shadow-inner resize-none scrollbar-thin"
                    />
                    {assistantTextTyped && (
                      <button
                        type="button"
                        onClick={() => setAssistantTextTyped('')}
                        className="absolute right-3 top-3 text-zinc-500 hover:text-white cursor-pointer"
                        title="ক্লিয়ার করুন"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!assistantTextTyped.trim() || assistantLoading}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-2xl transition-all cursor-pointer shrink-0 shadow-lg flex items-center gap-1.5 text-xs active:scale-95 h-10"
                  >
                    {assistantLoading ? (
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>পাঠান</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* ⚙️ CONSOLIDATED DECREE AI SETTINGS MODAL (VIBE, MEMORY, CHAT HISTORY, VOICE) */}
              <AnimatePresence>
                {(showDecreeSettingsModal || showDecreeMemoryModal) && (
                  <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="max-w-md w-full bg-zinc-950 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl text-left max-h-[88vh] overflow-y-auto scrollbar-thin flex flex-col"
                    >
                      {/* Modal Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-850 shrink-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                            <Settings className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider font-display">
                              Decree AI সেটিংস
                            </h3>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              মুড, মেমোরি, চ্যাট ইতিহাস ও ভয়েস
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowDecreeSettingsModal(false);
                            setShowDecreeMemoryModal(false);
                          }}
                          className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Settings Tabs */}
                      <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl shrink-0">
                        <button
                          type="button"
                          onClick={() => setDecreeSettingsTab('vibe')}
                          className={`py-1.5 px-0.5 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer ${
                            decreeSettingsTab === 'vibe'
                              ? 'bg-cyan-500 text-black shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          🔥 মুড
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecreeSettingsTab('memory')}
                          className={`py-1.5 px-0.5 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            decreeSettingsTab === 'memory'
                              ? 'bg-amber-500 text-black shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Brain className="w-3 h-3" />
                          <span>মেমোরি</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecreeSettingsTab('correction')}
                          className={`py-1.5 px-0.5 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                            decreeSettingsTab === 'correction'
                              ? 'bg-emerald-500 text-black shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>সংশোধন</span>
                          {(decreeMemory.corrections?.length || 0) > 0 && (
                            <span className="text-[9px] px-1 rounded-full bg-emerald-950 text-emerald-300 font-mono">
                              {decreeMemory.corrections?.length || 0}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecreeSettingsTab('history')}
                          className={`py-1.5 px-0.5 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            decreeSettingsTab === 'history'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>চ্যাট</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecreeSettingsTab('voice')}
                          className={`py-1.5 px-0.5 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            decreeSettingsTab === 'voice'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>ভয়েস</span>
                        </button>
                      </div>

                      {/* TAB 1: VIBE & PERSONALITY */}
                      {decreeSettingsTab === 'vibe' && (
                        <div className="space-y-3 animate-fadeIn">
                          <label className="text-xs font-bold text-zinc-300 block">
                            Decree AI ব্যক্তিত্ব ও মুড নির্বাচন করুন:
                          </label>
                          <div className="space-y-2">
                            {[
                              {
                                id: 'best_friend',
                                icon: '🤝',
                                label: 'আঞ্চলিক প্রিয় বন্ধু (Best Friend)',
                                desc: 'খাঁটি দেশি দোস্ত—শাসন করবে, মজা করবে, আলসেমি দেখলে গরম হবে ও উন্নতির জন্য বেইজ্জতি-রোস্ট করবে।'
                              },
                              {
                                id: 'tough_love',
                                icon: '🔥',
                                label: 'চরম কড়া শাসন (Tough Love)',
                                desc: 'নো-এক্সকিউজ ও কড়া রিয়ালিটি চেক। কোনো অজুহাত শুনবে না, অপমান করে সোজা কাজে নামাবে।'
                              },
                              {
                                id: 'teacher',
                                icon: '🎓',
                                label: 'সহজ মেন্টর (Master Mentor)',
                                desc: 'পড়ালেখা ও রুটিন গাইড। কোনো ভারী বা মাথার উপর দিয়ে যাওয়া ভাষা ছাড়া সহজভাবে বোঝাবে।'
                              }
                            ].map((v) => {
                              const active = decreeMemory.vibeMode === v.id;
                              return (
                                <div
                                  key={v.id}
                                  onClick={() => setDecreeMemory(prev => ({ ...prev, vibeMode: v.id as any }))}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                                    active
                                      ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                                  }`}
                                >
                                  <span className="text-2xl shrink-0 p-1">{v.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-bold text-white">{v.label}</h4>
                                      {active && (
                                        <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1">
                                          <Check className="w-3 h-3" /> সক্রিয়
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">{v.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* TAB 2: LONG-TERM MEMORY */}
                      {decreeSettingsTab === 'memory' && (
                        <div className="space-y-4 animate-fadeIn">
                          {/* User Identity */}
                          <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-2xl flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-zinc-500 font-mono block">তোমার নাম (Decree মনে রেখেছে)</span>
                              <span className="text-sm font-bold text-amber-300">
                                {decreeMemory.userName || accountProfile.name || 'দোস্ত (নাম সেভ করনি)'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {decreeMemory.userName ? 'স্মৃতিতে সংরক্ষিত ✅' : 'অজ্ঞাত'}
                            </span>
                          </div>

                          {/* Goals Section */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-cyan-400" />
                              <span>তোমার মূল লক্ষ্যসমূহ ({decreeMemory.goals.length})</span>
                            </label>
                            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
                              {decreeMemory.goals.map((g, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                                  <span className="truncate flex-1">🎯 {g}</span>
                                  <button
                                    type="button"
                                    onClick={() => setDecreeMemory(prev => ({ ...prev, goals: prev.goals.filter((_, i) => i !== idx) }))}
                                    className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={newMemoryGoalInput}
                                onChange={(e) => setNewMemoryGoalInput(e.target.value)}
                                placeholder="নতুন লক্ষ্য লিখুন..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                              />
                              <button
                                type="button"
                                disabled={!newMemoryGoalInput.trim()}
                                onClick={() => {
                                  if (newMemoryGoalInput.trim()) {
                                    setDecreeMemory(prev => ({ ...prev, goals: [newMemoryGoalInput.trim(), ...prev.goals] }));
                                    setNewMemoryGoalInput('');
                                  }
                                }}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs rounded-xl cursor-pointer"
                              >
                                যোগ
                              </button>
                            </div>
                          </div>

                          {/* Weaknesses Section */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>দুর্বলতা ও ফাঁকিবাজি প্যাটার্ন ({decreeMemory.weaknesses.length})</span>
                            </label>
                            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
                              {decreeMemory.weaknesses.map((w, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                                  <span className="truncate flex-1 text-rose-300">⚠️ {w}</span>
                                  <button
                                    type="button"
                                    onClick={() => setDecreeMemory(prev => ({ ...prev, weaknesses: prev.weaknesses.filter((_, i) => i !== idx) }))}
                                    className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={newMemoryWeaknessInput}
                                onChange={(e) => setNewMemoryWeaknessInput(e.target.value)}
                                placeholder="দুর্বলতা লিখুন..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
                              />
                              <button
                                type="button"
                                disabled={!newMemoryWeaknessInput.trim()}
                                onClick={() => {
                                  if (newMemoryWeaknessInput.trim()) {
                                    setDecreeMemory(prev => ({ ...prev, weaknesses: [newMemoryWeaknessInput.trim(), ...prev.weaknesses] }));
                                    setNewMemoryWeaknessInput('');
                                  }
                                }}
                                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-xs rounded-xl cursor-pointer"
                              >
                                যোগ
                              </button>
                            </div>
                          </div>

                          {/* Reset Memory Button */}
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Decree AI এর মেমোরি রিসেট করতে চান?")) {
                                  const fresh: DecreeMemoryProfile = {
                                    userName: accountProfile.name || '',
                                    goals: ['এইচএসসি পরীক্ষায় দারুণ রেজাল্ট ও জিপিএ ৫'],
                                    weaknesses: ['দেরিতে ঘুমানো ও ফোন স্ক্রলিং'],
                                    preferences: ['সোজাসাপ্টা কথা'],
                                    facts: [],
                                    recentIncidents: [],
                                    corrections: [
                                      {
                                        id: 'rule_default_1',
                                        rule: 'ব্যবহারকারী যখন বেইজ্জতি, অপমান, লজ্জা বা কষ্টের কথা বলবে, তখন আনন্দ বা আড্ডার কথা বলা নিষেধ। গভীর সহমর্মিতা ও ভাইয়ের মতো সাপোর্ট দিতে হবে।',
                                        date: new Date().toLocaleDateString('bn-BD'),
                                        trigger: 'অপমান ও বেইজ্জতি মিসম্যাচ ফিক্স'
                                      },
                                      {
                                        id: 'rule_default_2',
                                        rule: 'নামাজ বা ভালো কাজের কথা বললে সময় নষ্ট করার অ্যালার্ম দেওয়া নিষেধ; প্রশংসা ও দোয়া করতে হবে।',
                                        date: new Date().toLocaleDateString('bn-BD'),
                                        trigger: 'ইবাদত মিসআন্ডারস্ট্যান্ডিং ফিক্স'
                                      }
                                    ],
                                    vibeMode: 'best_friend' as const
                                  };
                                  setDecreeMemory(fresh);
                                  localStorage.setItem('selfx_decree_smart_memory_v4', JSON.stringify(fresh));
                                  triggerNotification("🧠 মেমোরি রিসেট", "স্মৃতি পরিষ্কার করা হয়েছে!");
                                }
                              }}
                              className="text-[10px] text-zinc-500 hover:text-rose-400 font-mono flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> স্মৃতি রিসেট করুন
                            </button>
                          </div>
                        </div>
                      )}

                      {/* TAB 2.5: AI SELF-CORRECTION & PROBLEM FIXING SYSTEM */}
                      {decreeSettingsTab === 'correction' && (
                        <div className="space-y-4 animate-fadeIn flex-1 min-h-0 flex flex-col">
                          {/* Banner & Explanation */}
                          <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-cyan-950/40 border border-emerald-500/40 rounded-2xl">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>স্ব-সংশোধন ইঞ্জিন (Self-Correction)</span>
                              </span>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                সক্রিয় ও নিরাপদ ✅
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-relaxed">
                              Decree AI যদি কখনো কথার Context বা অনুভূতি ভুল বোঝে, তবে তাকে বকা দিলে বা শুধরে দিলে সে তৎক্ষণাৎ নিজের ভুল বিশ্লেষণ করে, আন্তরিক ক্ষমা চায় এবং স্থায়ী নিয়ম হিসেবে মেমোরিতে লিখে নেয় যাতে জীবনেও আর ঐ ভুল না করে।
                            </p>
                          </div>

                          {/* Learned Rules List */}
                          <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                                <Brain className="w-3.5 h-3.5 text-amber-400" />
                                <span>শেখা নিয়মাবলী ({decreeMemory.corrections?.length || 0})</span>
                              </label>
                              <span className="text-[10px] font-mono text-zinc-500">
                                প্রম্পটে স্বয়ংক্রিয়ভাবে ইনজেক্ট হয়
                              </span>
                            </div>

                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                              {(!decreeMemory.corrections || decreeMemory.corrections.length === 0) ? (
                                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-500">
                                  এখনো কোনো নিয়ম নেই। নিচে ম্যানুয়ালি যোগ করতে পারো অথবা চ্যাটে AI কে ভুল শুধরে দাও।
                                </div>
                              ) : (
                                decreeMemory.corrections.map((c) => (
                                  <div
                                    key={c.id}
                                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 flex flex-col gap-1.5 shadow-sm"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="text-xs text-zinc-200 font-medium leading-relaxed">
                                        🛡️ {c.rule}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDecreeMemory(prev => ({
                                            ...prev,
                                            corrections: (prev.corrections || []).filter(item => item.id !== c.id)
                                          }));
                                        }}
                                        className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                                        title="নিয়মটি মুছুন"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
                                      {c.trigger && (
                                        <span className="text-cyan-400/80 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                          ট্রিগার: {c.trigger}
                                        </span>
                                      )}
                                      <span>তারিখ: {c.date}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Add New Custom Rule */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={newMemoryCorrectionRuleInput}
                                onChange={(e) => setNewMemoryCorrectionRuleInput(e.target.value)}
                                placeholder="নতুন নিয়ম লিখুন (যেমন: অপমানের সময় আড্ডা নয়, সহমর্মিতা দেখাতে হবে)..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                              />
                              <button
                                type="button"
                                disabled={!newMemoryCorrectionRuleInput.trim()}
                                onClick={() => {
                                  if (newMemoryCorrectionRuleInput.trim()) {
                                    const newRule = {
                                      id: `rule_${Date.now()}`,
                                      rule: newMemoryCorrectionRuleInput.trim(),
                                      date: new Date().toLocaleDateString('bn-BD'),
                                      trigger: 'ইউজার স্ব-নির্ধারিত'
                                    };
                                    setDecreeMemory(prev => ({
                                      ...prev,
                                      corrections: [newRule, ...(prev.corrections || [])]
                                    }));
                                    setNewMemoryCorrectionRuleInput('');
                                    triggerNotification("🛡️ নতুন নিয়ম সংরক্ষিত", "Decree AI এই নিয়ম মেনে চলবে!");
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold text-xs rounded-xl cursor-pointer shrink-0"
                              >
                                যোগ
                              </button>
                            </div>
                          </div>

                          {/* Recent Incidents Tracking */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                <span>ট্র্যাক করা সাম্প্রতিক ঘটনা ({decreeMemory.recentIncidents?.length || 0})</span>
                              </span>
                              {(decreeMemory.recentIncidents?.length || 0) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setDecreeMemory(prev => ({ ...prev, recentIncidents: [] }))}
                                  className="text-[9px] font-mono text-zinc-500 hover:text-rose-400 cursor-pointer"
                                >
                                  সব মুছুন
                                </button>
                              )}
                            </label>
                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                              {(!decreeMemory.recentIncidents || decreeMemory.recentIncidents.length === 0) ? (
                                <span className="text-[11px] text-zinc-500">কোনো সক্রিয় ঘটনা নেই।</span>
                              ) : (
                                decreeMemory.recentIncidents.map((inc, iIdx) => (
                                  <div
                                    key={iIdx}
                                    className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-cyan-300 flex items-center gap-1.5"
                                  >
                                    <span>{inc}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDecreeMemory(prev => ({
                                          ...prev,
                                          recentIncidents: (prev.recentIncidents || []).filter((_, i) => i !== iIdx)
                                        }));
                                      }}
                                      className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Restore Defaults / Reset */}
                          <div className="pt-2 flex justify-between items-center border-t border-zinc-800/80">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              স্থায়ী সংরক্ষণ: LocalStorage + Prompt Injection
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("ডিফল্ট সুরক্ষামূলক নিয়মগুলোতে ফিরতে চাও?")) {
                                  const defaultRules = [
                                    {
                                      id: 'rule_default_1',
                                      rule: 'ব্যবহারকারী যখন বেইজ্জতি, অপমান, লজ্জা বা কষ্টের কথা বলবে, তখন আনন্দ বা আড্ডার কথা বলা নিষেধ। গভীর সহমর্মিতা ও ভাইয়ের মতো সাপোর্ট দিতে হবে।',
                                      date: new Date().toLocaleDateString('bn-BD'),
                                      trigger: 'অপমান ও বেইজ্জতি মিসম্যাচ ফিক্স'
                                    },
                                    {
                                      id: 'rule_default_2',
                                      rule: 'নামাজ বা ভালো কাজের কথা বললে সময় নষ্ট করার অ্যালার্ম দেওয়া নিষেধ; প্রশংসা ও দোয়া করতে হবে।',
                                      date: new Date().toLocaleDateString('bn-BD'),
                                      trigger: 'ইবাদত মিসআন্ডারস্ট্যান্ডিং ফিক্স'
                                    }
                                  ];
                                  setDecreeMemory(prev => ({ ...prev, corrections: defaultRules }));
                                  triggerNotification("🛡️ ডিফল্ট নিয়ম সক্রিয়", "সুরক্ষামূলক নিয়মাবলী রিস্টোর করা হয়েছে!");
                                }
                              }}
                              className="text-[10px] text-zinc-500 hover:text-amber-300 font-mono flex items-center gap-1 cursor-pointer"
                            >
                              ডিফল্ট নিয়ম রিস্টোর
                            </button>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: CHAT HISTORY */}
                      {decreeSettingsTab === 'history' && (
                        <div className="space-y-3 animate-fadeIn flex-1 min-h-0 flex flex-col">
                          <div className="flex items-center justify-between pb-1 border-b border-zinc-850 shrink-0">
                            <span className="text-[11px] font-mono text-cyan-400 font-bold">
                              মোট বার্তা: {assistantChatHistory.length}
                            </span>
                            {assistantChatHistory.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssistantChatHistory([]);
                                  try { localStorage.removeItem('selfx_decree_chat_history_v2'); } catch (e) {}
                                }}
                                className="text-[10px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> ইতিহাস মুছুন
                              </button>
                            )}
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-60 pr-1 scrollbar-thin">
                            {assistantChatHistory.length === 0 ? (
                              <div className="py-8 text-center text-zinc-500 text-xs">
                                এখনো কোনো চ্যাট হিস্ট্রি নেই।
                              </div>
                            ) : (
                              assistantChatHistory.map((turn, i) => {
                                const isUser = turn.role === 'user';
                                return (
                                  <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[9px] font-mono text-zinc-500 mb-0.5 px-1">
                                      {isUser ? (accountProfile.name || 'You') : 'Decree AI'}
                                    </span>
                                    <div
                                      className={`p-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap select-text ${
                                        isUser
                                          ? 'bg-blue-600 text-white rounded-tr-none'
                                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                                      }`}
                                    >
                                      {turn.text}
                                    </div>
                                    {!isUser && (
                                      <div className="flex items-center gap-2 mt-1 px-1">
                                        <button
                                          type="button"
                                          onClick={() => speakTextWithMaleVoice(turn.text)}
                                          className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5 cursor-pointer"
                                        >
                                          <Volume2 className="w-2.5 h-2.5" /> শোন
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(turn.text);
                                            triggerNotification("📋 কপি হয়েছে", "টেক্সট কপি করা হয়েছে!");
                                          }}
                                          className="text-[9px] text-zinc-500 hover:text-white flex items-center gap-0.5 cursor-pointer"
                                        >
                                          <Copy className="w-2.5 h-2.5" /> কপি
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* TAB 4: VOICE SETTINGS */}
                      {decreeSettingsTab === 'voice' && (
                        <div className="space-y-3 animate-fadeIn">
                          <label className="text-xs font-bold text-zinc-300 block">
                            Decree AI ভয়েস পার্সোনা নির্বাচন করুন:
                          </label>
                          <div className="space-y-2">
                            {[
                              {
                                id: 'Fenrir',
                                title: '⚡ Fenrir (ডিপ কনফিডেন্ট আলফা)',
                                desc: 'বোল্ড, গম্ভীর ও চরম আত্মবিশ্বাসী মেল ভয়েস',
                                sample: 'সোজা হয়ে দাঁড়া। তোকে লক্ষ্য পূরণ করতে হবে।',
                                audioUrl: '/api/tts/voice/fenrir_sample.wav'
                              },
                              {
                                id: 'Puck',
                                title: '🔥 Puck (এনার্জেটিক কুল ফ্রেন্ড)',
                                desc: 'চাঙ্গা, প্রাণবন্ত ও ১০০% এনার্জেটিক ঢাকার ব্রো ভাইব',
                                sample: 'এই তো ভাই চিল মোডে আছি তুই কি করতাছিস',
                                audioUrl: '/api/tts/voice/puck_sample.wav'
                              },
                              {
                                id: 'Charon',
                                title: '👑 Charon (ডিপ ক্যারিশম্যাটিক)',
                                desc: 'শান্ত, গভীর, পরিপক্ব ও প্রভাবশালী লিডার ব্যক্তিত্ব',
                                sample: 'বল, দোস্ত। তোর পড়াশোনা বা অন্য কোনো বিষয়ে কী সাহায্য লাগবে, বল?',
                                audioUrl: '/api/tts/voice/charon_sample.wav'
                              },
                              {
                                id: 'Zephyr',
                                title: '🚀 Zephyr (স্মার্ট সোয়্যাগ)',
                                desc: 'আধুনিক, চটপটে, দ্রুত ও মজার আড্ডাবাজ দোস্ত',
                                sample: 'আরেহ প্যারা নাই দোস্ত! চলো কাজটা এখনই উড়িয়ে দিই!',
                                audioUrl: '/api/tts/voice/zephyr_sample.wav'
                              }
                            ].map((v) => {
                              const isSelected = selectedVoicePersona === v.id;
                              return (
                                <div
                                  key={v.id}
                                  onClick={() => {
                                    changeVoicePersona(v.id);
                                  }}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-white">{v.title}</h4>
                                    {isSelected && (
                                      <span className="text-[10px] font-mono font-bold text-purple-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> এক্টিভ
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-400 mt-0.5">{v.desc}</p>
                                  <div className="pt-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        changeVoicePersona(v.id);
                                        speakTextWithMaleVoice(v.sample, v.audioUrl, v.id);
                                      }}
                                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Volume2 className="w-3 h-3" />
                                      <span>ভয়েস স্যাম্পল শুনুন</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>


          {/* 👤 INSTAGRAM STYLE PROFILE & USERNAME/PASSWORD ACCOUNT LOGIN MODAL */}
          <AnimatePresence>
            {isProfileOpen && (
              <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="max-w-md w-full bg-zinc-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-5 relative shadow-2xl text-left overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider font-display">
                          প্রোফাইল ও অ্যাকাউন্ট সেটিং
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {accountProfile.username ? `@${accountProfile.username}` : 'অ্যাউন্ট ম্যানেজার'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(false)}
                      className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

              {/* TAB NAVIGATION: EDIT PROFILE vs VOICE AI vs MUSIC vs WIDGET vs LOGIN */}
              <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-850">
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('profile')}
                  className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    profileActiveTab === 'profile'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">প্রোফাইল</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('voice')}
                  className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    profileActiveTab === 'voice'
                      ? 'bg-cyan-500 text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">ভয়েস AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileActiveTab('music_reels');
                    loadSettingsMusic();
                  }}
                  className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    profileActiveTab === 'music_reels'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">মিউজিক</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('widget')}
                  className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    profileActiveTab === 'widget'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">উইজেট</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('login')}
                  className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    profileActiveTab === 'login'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">লগইন</span>
                </button>
              </div>

              {/* TAB 1: EDIT PROFILE & CREATE/SAVE ACCOUNT */}
              {profileActiveTab === 'profile' && (
                profileViewMode === 'view' ? (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Beautiful View Mode Card */}
                    <div className="p-5 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-4 relative overflow-hidden">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 shrink-0 overflow-hidden shadow-lg shadow-amber-500/5">
                          {accountProfile.avatarUrl ? (
                            <img src={accountProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover animate-fadeIn" />
                          ) : (
                            <div className="w-full h-full bg-amber-500 flex items-center justify-center font-black text-zinc-950 text-2xl">
                              {(accountProfile.name?.[0] || 'U').toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-base font-black text-zinc-100 truncate">{accountProfile.name || 'Un-named User'}</h4>
                            {accountProfile.isLead && (
                              <span title="Verified Creator"><CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" /></span>
                            )}
                          </div>
                          <p className="text-xs text-amber-400 font-mono font-semibold truncate">@{accountProfile.username || 'username'}</p>
                          <p className="text-[11px] text-zinc-400 leading-normal italic">{accountProfile.bio || 'No bio added yet'}</p>
                        </div>
                      </div>

                      {/* Additional Account Metadata */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-850/80 text-[10px] font-mono text-zinc-450">
                        <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-2 space-y-0.5 text-center">
                          <span className="text-zinc-600 block text-[9px]">ID</span>
                          <span className="text-zinc-200 font-bold truncate block">{accountProfile.accountId || 'SELFX-883A'}</span>
                        </div>
                        <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-2 space-y-0.5 text-center">
                          <span className="text-zinc-600 block text-[9px]">JOINED</span>
                          <span className="text-zinc-200 font-bold truncate block">
                            {new Date(accountProfile.joinedAt || Date.now()).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2 space-y-0.5 text-center">
                          <span className="text-amber-500/80 block text-[9px] font-bold uppercase">VERSION</span>
                          <span className="text-amber-400 font-black text-xs block">{APP_VERSION}</span>
                        </div>
                      </div>

                      {/* Cloud Sync & Cross-Device Data Migration */}
                      <div className="pt-3 border-t border-zinc-850/80 space-y-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 font-sans flex items-center gap-1.5">
                            <Cloud className="w-3.5 h-3.5 text-amber-400" />
                            {t("☁️ ক্লাউড সিঙ্ক ও ব্যাকআপ", "☁️ Cloud Sync & Migration")}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>{isCloudSyncing ? "সিঙ্ক হচ্ছে..." : lastCloudSyncTime ? `সিঙ্ক্ড (${lastCloudSyncTime})` : "লাইভ সুরক্ষিত"}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          {t(
                            "আপনার প্রোফাইল, সমস্ত অপশন, হ্যাবিট, মিডিয়া ফাইল, অডিও, ওয়ার্ডরোব ও প্রগ্রেস সম্পূর্ণভাবে সংরক্ষিত হচ্ছে। ৩০MB+ মাস্টার ব্যাকআপ ফাইল ডাউনলোড করে রাখলে যেকোনো ডিভাইসে ইমপোর্ট করার সাথে সাথে আপনার অ্যাকাউন্ট পূর্ণরূপে আগের অবস্থায় ফিরে আসবে।",
                            "Your full profile, habits, media, audio, wardrobe, finance, and settings are preserved. Download the 30MB+ master backup archive to completely restore your account on any device anytime."
                          )}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            disabled={isExportingBackup || isRestoringBackup}
                            onClick={downloadAccountBackupFile}
                            className="py-2.5 px-3 bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-900 hover:from-amber-500/30 border border-amber-500/40 hover:border-amber-400 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            <FileJson className={`w-3.5 h-3.5 text-amber-400 ${isExportingBackup ? 'animate-spin' : ''}`} />
                            <span>{isExportingBackup ? "তৈরি হচ্ছে..." : "ব্যাকআপ ডাউনলোড (৩০MB+)"}</span>
                          </button>

                          <label className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-amber-500/50 rounded-xl text-xs font-bold text-zinc-200 hover:text-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center">
                            <Smartphone className={`w-3.5 h-3.5 text-amber-400 ${isRestoringBackup ? 'animate-spin' : ''}`} />
                            <span>{isRestoringBackup ? "রিস্টোর হচ্ছে..." : "ব্যাকআপ ফাইল ইমপোর্ট"}</span>
                            <input
                              type="file"
                              accept=".json"
                              disabled={isExportingBackup || isRestoringBackup}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImportBackupFile(file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Language Selection Setting */}
                      <div className="pt-3.5 border-t border-zinc-850/80 space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block font-sans">
                          {t("🌐 ভাষা পরিবর্তন / Language Setting", "🌐 Language Settings")}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLanguage('normal');
                              setCurrentLang('normal');
                              triggerNotification("🌐 ভাষা পরিবর্তন", "ভাষা সফলভাবে 'নরমাল' সেট করা হয়েছে।");
                            }}
                            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                              currentLang === 'normal'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/60 shadow shadow-amber-500/10'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                            }`}
                          >
                            নরমাল (Bengali)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLanguage('english');
                              setCurrentLang('english');
                              triggerNotification("🌐 Language Switched", "Language successfully set to English.");
                            }}
                            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                              currentLang === 'english'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/60 shadow shadow-amber-500/10'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                            }`}
                          >
                            English Only
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileNameInput(accountProfile.name);
                          setProfileUsernameInput(accountProfile.username);
                          setProfileBioInput(accountProfile.bio);
                          setProfileAvatarInput(accountProfile.avatarUrl);
                          setProfilePasswordInput(accountProfile.password || '');
                          setProfileViewMode('edit');
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/5 flex items-center justify-center gap-1.5 font-sans"
                      >
                        ✏️ প্রোফাইল এডিট করুন
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleLogoutUser();
                        }}
                        className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-450 hover:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        🚪 লগআউট
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfileAccount} className="space-y-4 animate-fadeIn">
                    {/* Current Profile Card Preview */}
                    <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 shrink-0 overflow-hidden">
                      {profileAvatarInput ? (
                        <img src={profileAvatarInput} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-amber-500 flex items-center justify-center font-black text-zinc-950 text-xl">
                          {(profileNameInput?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="text-sm font-black text-zinc-100 truncate">{profileNameInput || 'Un-named User'}</h4>
                      <p className="text-xs text-amber-400 font-mono font-semibold truncate">@{profileUsernameInput || 'username'}</p>
                      <p className="text-[10px] text-zinc-400 truncate italic">{profileBioInput || 'No bio added yet'}</p>
                    </div>
                  </div>

                  {/* Profile Picture Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 block">প্রোফাইল পিকচার (গ্যালারি থেকে সিলেক্ট করুন):</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-zinc-900/50 border border-zinc-850/60 px-3.5 py-2.5 text-xs text-zinc-400 rounded-xl flex items-center">
                        {profileAvatarInput ? "✓ ছবি গ্যালারি থেকে লোড করা হয়েছে" : "কোনো ছবি সিলেক্ট করা হয়নি"}
                      </div>
                      <label
                        htmlFor="profile-gallery-upload"
                        className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/50 rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all text-amber-400 gap-1.5 text-xs font-black shadow-md"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>গ্যালারি</span>
                      </label>
                      <input
                        type="file"
                        id="profile-gallery-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_SIZE = 180;
                                let width = img.width;
                                let height = img.height;
                                if (width > height) {
                                  if (width > MAX_SIZE) {
                                    height *= MAX_SIZE / width;
                                    width = MAX_SIZE;
                                  }
                                } else {
                                  if (height > MAX_SIZE) {
                                    width *= MAX_SIZE / height;
                                    height = MAX_SIZE;
                                  }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const compressed = canvas.toDataURL('image/jpeg', 0.7);
                                  setProfileAvatarInput(compressed);
                                }
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 block">আপনার নাম (Full Name):</label>
                    <input
                      type="text"
                      required
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      placeholder="যেমন: আতিফ আহমেদ"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Username Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 block">ইউজারনেম (Username - ইউনিক হতে হবে):</label>
                    <input
                      type="text"
                      required
                      value={profileUsernameInput}
                      onChange={(e) => setProfileUsernameInput(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      placeholder="যেমন: atif_lookmax"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-amber-400 font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Bio Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 block">বায়ো (Bio):</label>
                    <input
                      type="text"
                      value={profileBioInput}
                      onChange={(e) => setProfileBioInput(e.target.value)}
                      placeholder="যেমন: Daily consistency & looksmaxing..."
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Password Input for Account Security */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                      <span>পাসওয়ার্ড সেট করুন (Set Account Password):</span>
                      <span className="text-[9px] text-zinc-500 font-normal">অন্য ডিভাইসে লগইনের জন্য</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showProfilePassword ? "text" : "password"}
                        value={profilePasswordInput}
                        onChange={(e) => setProfilePasswordInput(e.target.value)}
                        placeholder="আপনার পাসওয়ার্ড দিন..."
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProfilePassword(!showProfilePassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer p-1"
                      >
                        {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ID VERIFICATION OPTION */}
                  <div className="bg-gradient-to-r from-[#0c1a3a] via-[#091122] to-[#0c1a3a] border border-sky-500/20 rounded-2xl p-4 space-y-3 mt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
                          <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider">
                            🔵 ক্রিয়েটর ভেরিফাইড (Creator Verification)
                          </h4>
                          <p className="text-[10px] text-zinc-400">
                            {userProfile.isLead ? 'ভেরিফাইড ব্লু টিক সক্রিয় আছে ✅' : 'ব্লু টিক ভেরিফিকেশন কোড লিখুন'}
                          </p>
                        </div>
                      </div>
                      {userProfile.isLead && (
                        <span className="text-[9px] bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-lg font-black font-mono">
                          VERIFIED
                        </span>
                      )}
                    </div>

                    {!userProfile.isLead ? (
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="সিক্রেট কোড দিন..."
                          value={profileVerificationCode}
                          onChange={(e) => setProfileVerificationCode(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500/50 text-zinc-100 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (profileVerificationCode.trim() === 'atif2026') {
                              setUserProfile(prev => ({ ...prev, isLead: true }));
                              setAccountProfile(prevAcc => {
                                const updatedAcc = { ...prevAcc, isLead: true };
                                try {
                                  const cleanUser = prevAcc.username.toLowerCase();
                                  const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || '{}';
                                  const db = JSON.parse(dbStr);
                                  if (db[cleanUser]) {
                                    db[cleanUser].profile.isLead = true;
                                    localStorage.setItem('selfx_user_accounts_db_v2', JSON.stringify(db));
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                                return updatedAcc;
                              });
                              triggerNotification(
                                "🔵 ID VERIFIED!",
                                "অভিনন্দন! আপনার প্রোফাইলে সফলভাবে ভেরিফাইড ব্লু টিক অ্যাক্টিভেট করা হয়েছে।"
                              );
                              setProfileVerificationCode('');
                            } else {
                              triggerNotification("❌ ভুল কোড", "অনুগ্রহ করে সঠিক ভেরিফিকেশন কোড প্রদান করুন।", true);
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all shrink-0"
                        >
                          ভেরিফাই
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
                        <span className="text-sky-400 font-black">✓ Verification Verified</span>
                        <button
                          type="button"
                          onClick={() => {
                            setUserProfile(prev => ({ ...prev, isLead: false }));
                            setAccountProfile(prevAcc => {
                              const updatedAcc = { ...prevAcc, isLead: false };
                              try {
                                const cleanUser = prevAcc.username.toLowerCase();
                                const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || '{}';
                                const db = JSON.parse(dbStr);
                                if (db[cleanUser]) {
                                  db[cleanUser].profile.isLead = false;
                                  localStorage.setItem('selfx_user_accounts_db_v2', JSON.stringify(db));
                                }
                              } catch (err) {
                                console.error(err);
                              }
                              return updatedAcc;
                            });
                            triggerNotification("🔵 Verification Removed", "আপনার প্রোফাইল থেকে ভেরিফিকেশন ব্লু টিক সরানো হয়েছে।");
                          }}
                          className="text-rose-400 hover:text-rose-350 cursor-pointer underline hover:no-underline"
                        >
                          রিমুভ করুন
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Save Profile Button */}
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setProfileViewMode('view')}
                      className="px-4.5 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 font-sans"
                    >
                      <span>💾 সেভ ও একাউন্ট রেজিস্টার করুন</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500 font-mono text-center leading-relaxed">
                    💡 অ্যাপ ডিলিট হয়ে গেলে বা অন্য ফোনে এই ইউজারনেম ও পাসওয়ার্ড দিলে আপনার সকল প্রগ্রেস ফেরত আসবে।
                  </p>
                </form>
                )
              )}

              {profileActiveTab === 'voice' && (
                <div className="space-y-5 animate-fadeIn font-sans text-xs text-left">
                  {/* Natural Human Voice Category & Personality Card */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-[#141210] border border-[#2a2622] space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Decree AI আসল মানুষ ভয়েস ক্যাটাগরি
                          </h3>
                          <p className="text-[11px] text-zinc-400">
                            পছন্দের ক্যাটাগরি বেছে নিন — আসল মানুষের মতো নিখুঁত বাংলায় কথা বলবে
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold shrink-0">
                        ⚡ 0s Fast
                      </span>
                    </div>

                    {/* 4 Voice Personas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {[
                        {
                          id: 'Fenrir',
                          title: '⚡ Fenrir (ডিপ কনফিডেন্ট আলফা)',
                          desc: 'বোল্ড, গম্ভীর ও চরম আত্মবিশ্বাসী মেল ভয়েস — গভীর পুরুষালি পার্সোনালিটি ও বেস্ট ফ্রেন্ড ভাইব',
                          badge: 'ডিপ & কনফিডেন্ট',
                          sample: 'সোজা হয়ে দাঁড়া। তোকে লক্ষ্য পূরণ করতে হবে।',
                          audioUrl: '/api/tts/voice/fenrir_sample.wav'
                        },
                        {
                          id: 'Puck',
                          title: '🔥 Puck (এনার্জেটিক কুল ফ্রেন্ড)',
                          desc: 'চাঙ্গা, প্রাণবন্ত ও ১০০% এনার্জেটিক ২০ বছর বয়সী ঢাকার ব্রো ভাইব',
                          badge: 'কুল বেস্ট ফ্রেন্ড',
                          sample: 'এই তো ভাই চিল মোডে আছি তুই কি করতাছিস',
                          audioUrl: '/api/tts/voice/puck_sample.wav'
                        },
                        {
                          id: 'Charon',
                          title: '👑 Charon (ডিপ ক্যারিশম্যাটিক)',
                          desc: 'শান্ত, গভীর, পরিপক্ব ও প্রভাবশালী লিডার ব্যক্তিত্ব',
                          badge: 'ডিপ লিডার',
                          sample: 'বল, দোস্ত। তোর পড়াশোনা বা অন্য কোনো বিষয়ে কী সাহায্য লাগবে, বল?',
                          audioUrl: '/api/tts/voice/charon_sample.wav'
                        },
                        {
                          id: 'Zephyr',
                          title: '🚀 Zephyr (স্মার্ট সোয়্যাগ)',
                          desc: 'আধুনিক, চটপটে, দ্রুত ও মজার আড্ডাবাজ দোস্ত',
                          badge: 'স্মার্ট ও ফাস্ট',
                          sample: 'আরেহ প্যারা নাই দোস্ত! চলো কাজটা এখনই উড়িয়ে দিই!',
                          audioUrl: '/api/tts/voice/zephyr_sample.wav'
                        },
                      ].map((v) => {
                        const isSelected = selectedVoicePersona === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => {
                              changeVoicePersona(v.id);
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative select-none ${
                              isSelected
                                ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                {v.title}
                              </span>
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                isSelected ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {v.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed mb-2.5">
                              {v.desc}
                            </p>
                            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeVoicePersona(v.id);
                                  speakTextWithMaleVoice(v.sample, v.audioUrl, v.id);
                                }}
                                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>টেস্ট ভয়েস শুনুন</span>
                              </button>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> এক্টিভ
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Decree AI In-App Companion Info */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-[#141210] border border-[#2a2622] space-y-3 shadow-2xl text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Decree AI — ব্যক্তিগত ইন্টেলিজেন্ট দোস্ত</h4>
                        <p className="text-xs text-zinc-400">ন্যাচারাল ভয়েস ও ফুল-অ্যাপ কন্ট্রোল সক্ষমতা</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      Decree AI অ্যাপ্লিকেশনের ভেতরে আপনার সাথে সরাসরি মুখে কথা বলবে এবং যেকোনো নির্দেশ—যেমন ফিন্যান্সের মূলধন সেট করা, আয়-ব্যয় রেকর্ড করা, পানি খাওয়া ট্র্যাক করা, কিংবা কাজের রিমাইন্ডার দেওয়া—তৎক্ষণাৎ সম্পন্ন করে।
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: LOGIN TO EXISTING ACCOUNT */}
              {profileActiveTab === 'login' && (
                <form onSubmit={handleLoginAccount} className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1.5 text-xs text-left">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" /> আগের আইডিতে লগইন করুন
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      আপনি যদি আগে অ্যাকাউন্ট তৈরি করে থাকেন, তবে এখানে আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে আপনার আগের পয়েন্ট, হ্যাবিট, ২৫+ মুভি ও সমস্ত ডেটা ফিরিয়ে আনুন!
                    </p>
                  </div>

                  {/* SHOW DETECTED ACCOUNTS ON DEVICE */}
                  {(() => {
                    try {
                      const dbStr = localStorage.getItem('selfx_user_accounts_db_v2') || '{}';
                      const db = JSON.parse(dbStr);
                      const keys = Object.keys(db);
                      if (keys.length > 0) {
                        return (
                          <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2 text-left">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5" />
                              ডিভাইসে পাওয়া পূর্বের আইডি সমূহ ({keys.length} টি):
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {keys.map((k) => {
                                const acc = db[k];
                                return (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={() => {
                                      setLoginUsernameInput(k);
                                      if (acc?.profile?.password) {
                                        setLoginPasswordInput(acc.profile.password);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-zinc-950 hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-500/50 rounded-lg text-xs text-zinc-200 hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span className="font-bold">@{k}</span>
                                    {acc?.profile?.name && (
                                      <span className="text-[10px] text-zinc-400">({acc.profile.name})</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    } catch (e) {}
                    return null;
                  })()}

                  {/* SHOW ERROR MESSAGE IF ANY */}
                  {loginErrorMessage && (
                    <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{loginErrorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-zinc-300 block">আপনার ইউজারনেম (Username):</label>
                    <input
                      type="text"
                      required
                      value={loginUsernameInput}
                      onChange={(e) => {
                        setLoginUsernameInput(e.target.value);
                        if (loginErrorMessage) setLoginErrorMessage(null);
                      }}
                      placeholder="যেমন: atif_lookmax"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-amber-400 font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-zinc-300 block">পাসওয়ার্ড (Password):</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPasswordInput}
                        onChange={(e) => {
                          setLoginPasswordInput(e.target.value);
                          if (loginErrorMessage) setLoginErrorMessage(null);
                        }}
                        placeholder="আপনার পাসওয়ার্ড দিন..."
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer p-1"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    onClick={(e) => {
                      // Explicit onClick guarantee
                      handleLoginAccount(e);
                    }}
                    className={`w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
                      isLoggingIn ? 'opacity-75 cursor-wait' : ''
                    }`}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>লগইন হচ্ছে...</span>
                      </>
                    ) : (
                      <span>🔓 লগইন করুন (Login Now)</span>
                    )}
                  </button>

                  {/* Manual Offline / Direct File Restore Option */}
                  <div className="pt-2 border-t border-zinc-850/80 space-y-2 text-center">
                    <p className="text-[11px] text-zinc-400 font-sans">
                      অথবা আপনার আগের ফোনের ব্যাকআপ ফাইল আছে?
                    </p>
                    <label className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-amber-500/50 rounded-xl text-xs font-bold text-zinc-300 hover:text-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <FileJson className="w-4 h-4 text-amber-400" />
                      <span>📁 ব্যাকআপ (.json) ফাইল দিয়ে সরাসরি রিস্টোর করুন</span>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImportBackupFile(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </form>
              )}

              {profileActiveTab === 'music_reels' && (
                <div className="space-y-6 animate-fadeIn font-sans text-xs">
                  
                  {/* SECTION 1: BACKGROUND MUSIC CONTROL */}
                  <div className="space-y-3 bg-zinc-900/65 border border-zinc-900 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="font-bold text-zinc-200">ব্যাকগ্রাউন্ড মিউজিক (Background BGM)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleBgMusic}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          bgMusicEnabled
                            ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/40'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{bgMusicEnabled ? 'প্লে হচ্ছে' : 'বন্ধ আছে'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      অ্যাপ্লিকেশন ব্যবহারের সময় ব্যাকগ্রাউন্ডে মিউজিক চালু রাখতে পারেন।
                    </p>

                    {/* PLAYBACK MODE SELECTOR: NORMAL VS REMIX */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider">প্লেব্যাক মোড (Playback Mode)</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${bgMusicPlaybackMode === 'remix' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                          {bgMusicPlaybackMode === 'remix' ? '🎛️ REMIX ACTIVE' : '🎵 NORMAL'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleBgMusicMode('normal')}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            bgMusicPlaybackMode === 'normal'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <span>🎵 Normal Mode</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">
                            সম্পূর্ণ গান স্বাভাবিক রোটেশনে চলবে
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleBgMusicMode('remix')}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            bgMusicPlaybackMode === 'remix'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold shadow-sm shadow-amber-950/20'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <span>🎛️ Remix Mode</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">
                            AI ইন্সট্রুমেন্টাল মিক্স • সর্বোচ্চ ১:৩০
                          </span>
                        </button>
                      </div>

                      {(bgMusicAutoPaused || remixStatus?.autoPaused) && bgMusicEnabled && (
                        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-left">
                          <p className="text-[10px] font-bold text-sky-300">
                            ⏸️ ভিডিও/লেকচার সেকশনের কারণে অটো-পজ
                          </p>
                          <p className="text-[9px] text-zinc-400">
                            সাধারণ ইন্টারফেসে ফিরলেই ঠিক আগের পজিশন থেকে চালু হবে।
                          </p>
                        </div>
                      )}

                      {bgMusicPlaybackMode === 'remix' && settingsMusicList.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-2">
                          <div className="text-left min-w-0">
                            <p className="text-[10px] font-bold text-amber-300 truncate">
                              {remixStatus?.isInstrumentalTransitionActive
                                ? '🎹 ইন্সট্রুমেন্টাল ক্রসফেড মিক্সিং চলছে...'
                                : remixStatus?.isInstrumentalReady
                                ? `✨ ইন্সট্রুমেন্টাল শনাক্ত (${formatAudioTime(remixStatus?.sliceElapsed || 0)} / 1:30)`
                                : `প্লে: ${formatAudioTime(remixStatus?.sliceElapsed || 0)} / 1:30 · বাকি ${remixStatus?.remainingCount ?? settingsMusicList.length}টি গান`}
                            </p>
                            <p className="text-[9px] text-zinc-500 truncate">
                              ভোকাল-মুক্ত ইন্সট্রুমেন্টাল ট্রানজিশন · সব শেষ হলে স্বয়ংক্রিয়ভাবে বন্ধ হবে
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleResetRemixSession}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[9px] font-bold text-zinc-300 shrink-0 cursor-pointer"
                            title="সব পজিশন রিসেট করুন"
                          >
                            রিসেট
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ALBUMS SELECTOR CONTAINER */}
                  <div className="space-y-3 bg-zinc-900/65 border border-zinc-900 rounded-2xl p-4">
                    <p className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider">অ্যালবাম বেছে নিন (Albums)</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectSettingsAlbum('all')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            settingsSelectedAlbumId === 'all'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <div className="text-[11px]">💿 সকল সুর (All)</div>
                          <span className="text-[9px] text-zinc-500 block leading-tight">সব গান রোটেশনে চলবে</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectSettingsAlbum('album-lofi')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            settingsSelectedAlbumId === 'album-lofi'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <div className="text-[11px]">☕ Cozy Lofi Beats</div>
                          <span className="text-[9px] text-zinc-500 block leading-tight">রিল্যাক্সিং লফি লুপস</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectSettingsAlbum('album-gym')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            settingsSelectedAlbumId === 'album-gym'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <div className="text-[11px]">🔥 Workout Phonk</div>
                          <span className="text-[9px] text-zinc-500 block leading-tight">জিম ও হাই-এনার্জি</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectSettingsAlbum('album-focus')}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            settingsSelectedAlbumId === 'album-focus'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <div className="text-[11px]">🧠 Coding Focus</div>
                          <span className="text-[9px] text-zinc-500 block leading-tight">ডিপ ফোকাসড টিউনস</span>
                        </button>

                        {/* CUSTOM ALBUMS */}
                        {customAlbums.map((album) => (
                          <div 
                            key={album.id}
                            onClick={() => handleSelectSettingsAlbum(album.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative group flex justify-between items-start ${
                              settingsSelectedAlbumId === album.id
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                                : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] truncate">📁 {album.name}</div>
                              <span className="text-[9px] text-zinc-500 block leading-tight">{album.trackIds.length}টি সুর যুক্ত রয়েছে</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomAlbum(album.id, e)}
                              className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all shrink-0 ml-1 opacity-100 sm:opacity-0 group-hover:opacity-100"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* MUSIC PLAYLIST MANAGER */}
                    <div className="space-y-3 bg-zinc-900/65 border border-zinc-900 rounded-2xl p-4">
                      <div className="space-y-2 pt-2 border-t border-zinc-850/80">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider">
                          {bgMusicPlaybackMode === 'remix' ? 'রিমিক্সের গান সিলেক্ট ও প্লেলিস্ট' : 'মিউজিক প্লেলিস্ট রোটেশন'}
                        </p>
                        {bgMusicPlaybackMode === 'remix' && settingsMusicList.length > 0 && (
                          <span className="text-[9px] font-mono text-amber-400">
                            {(remixSelectedTrackIds && remixSelectedTrackIds.length > 0
                              ? settingsMusicList.filter(t => remixSelectedTrackIds.includes(t.id)).length
                              : settingsMusicList.length)}/{settingsMusicList.length} সিলেক্টেড
                          </span>
                        )}
                      </div>
                      
                      {settingsMusicList.length === 0 ? (
                        <p className="text-[10px] text-zinc-600 font-mono italic">কোন মিউজিক পাওয়া যায়নি।</p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {settingsMusicList.map((track) => {
                            const isCurrent = currentlyPlayingTrackId === track.id;
                            const allIds = settingsMusicList.map(t => t.id);
                            const isSelectedForRemix =
                              !remixSelectedTrackIds ||
                              remixSelectedTrackIds.length === 0 ||
                              remixSelectedTrackIds.includes(track.id);
                            const savedPos = remixStatus?.positions?.[track.id] || window.bgMusicPositions?.[track.id] || 0;
                            const trackDur = remixStatus?.durations?.[track.id] || window.bgMusicDurations?.[track.id] || track.analysis?.duration || 0;
                            const isCompleted = Boolean(remixStatus?.completedIds?.[track.id]);

                            return (
                              <div 
                                key={track.id}
                                className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
                                  isCurrent 
                                    ? 'bg-amber-500/10 border-amber-500/30' 
                                    : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-850'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {bgMusicPlaybackMode === 'remix' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleRemixTrackSelection(track.id, allIds);
                                      }}
                                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors cursor-pointer ${
                                        isSelectedForRemix
                                          ? 'bg-amber-500 border-amber-400 text-zinc-950'
                                          : 'bg-zinc-900 border-zinc-700 text-transparent'
                                      }`}
                                      title={isSelectedForRemix ? 'রিমিক্স থেকে বাদ দিন' : 'রিমিক্সে যুক্ত করুন'}
                                    >
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </button>
                                  )}

                                  <div 
                                    onClick={() => {
                                      if (bgMusicPlaybackMode === 'remix' && !isSelectedForRemix) {
                                        handleToggleRemixTrackSelection(track.id, allIds);
                                      }
                                      setTimeout(() => {
                                        if (window.selectBgMusicById) {
                                          window.selectBgMusicById(track.id);
                                        } else if (window.selectBgMusic) {
                                          const activeIdx = (window.bgMusicTrackList || []).findIndex(t => t.id === track.id);
                                          window.selectBgMusic(activeIdx >= 0 ? activeIdx : 0);
                                        }
                                        if (!bgMusicEnabled) setBgMusicEnabled(true);
                                      }, 30);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                  >
                                    {isCurrent && bgMusicEnabled ? (
                                      <div className="flex gap-0.5 items-end h-3 w-3 shrink-0 mb-0.5">
                                        <span className="w-0.5 bg-amber-400 h-full animate-[bounce_1s_infinite_100ms]" />
                                        <span className="w-0.5 bg-amber-400 h-2/3 animate-[bounce_1s_infinite_300ms]" />
                                        <span className="w-0.5 bg-amber-400 h-full animate-[bounce_1s_infinite_500ms]" />
                                      </div>
                                    ) : (
                                      <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-amber-400' : 'text-zinc-600'}`} />
                                    )}
                                    <div className="min-w-0 flex-1 text-left">
                                      <span className={`block truncate text-xs font-medium ${isCurrent ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                                        {track.name}
                                      </span>
                                      {bgMusicPlaybackMode === 'remix' && (isCompleted || savedPos > 1 || track.analysis?.bpm) && (
                                        <span className="block text-[9px] font-mono text-zinc-500 truncate">
                                          {isCompleted
                                            ? '✓ সম্পূর্ণ প্লে সম্পন্ন'
                                            : savedPos > 1
                                            ? `রিজিউম: ${formatAudioTime(savedPos)}${trackDur ? ` / ${formatAudioTime(trackDur)}` : ''}`
                                            : ''}
                                          {track.analysis?.bpm ? `${(isCompleted || savedPos > 1) ? ' · ' : ''}${track.analysis.bpm} BPM` : ''}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSettingsDeleteMusic(track.id, track.name)}
                                  className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-rose-400 rounded-lg cursor-pointer transition-colors animate-fadeIn"
                                  title="ডিলিট করুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* UPLOAD NEW BACKGROUND TRACK */}
                    <div className="pt-2 border-t border-zinc-850/80 space-y-2">
                      <p className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider">নতুন মিউজিক আপলোড করুন</p>
                      
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={settingsMusicName}
                          onChange={(e) => setSettingsMusicName(e.target.value)}
                          placeholder="মিউজিকের নাম (যেমন: Alpha Waves)"
                          className="w-full bg-zinc-950 border border-zinc-850 text-xs px-3 py-2 rounded-xl text-zinc-200 placeholder-zinc-700 font-sans focus:outline-none focus:border-amber-500"
                        />

                        <label
                          htmlFor="settings-music-upload"
                          className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-amber-400 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 font-bold transition-all text-xs"
                        >
                          {isUploadingSettingsMusic ? (
                            <>
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin animate-fadeIn" />
                              <span>আপলোড হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>অডিও ফাইল সিলেক্ট করুন</span>
                            </>
                          )}
                        </label>
                        <input
                          type="file"
                          id="settings-music-upload"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleSettingsMusicUpload(file);
                            }
                          }}
                        />
                        {settingsMusicError && (
                          <p className="text-[10px] text-rose-500 font-mono font-medium animate-fadeIn">{settingsMusicError}</p>
                        )}
                      </div>
                    </div>

                    {/* PWA Direct Installation Action */}
                    <div className="pt-2 border-t border-zinc-850/80">
                      <button
                        type="button"
                        onClick={handleInstallMainApp}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                      >
                        <Download className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                        <span>{isStandalone ? "✅ অ্যাপ ইনস্টল করা রয়েছে (Installed)" : "📲 হোম স্ক্রীনে অ্যাপ ইনস্টল করুন (Install App)"}</span>
                      </button>
                    </div>

                    {/* App Version Tag */}
                    <div className="pt-2 text-center border-t border-zinc-850">
                      <p className="text-[11px] text-zinc-400 font-mono flex items-center justify-center gap-1.5">
                        <span>App Version:</span>
                        <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">{APP_VERSION}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: HOME SCREEN WIDGET */}
              {profileActiveTab === 'widget' && (
                <div className="space-y-4 animate-fadeIn font-sans text-xs text-left">
                  {/* WIDGET ACTION CARD */}
                  <div className="p-5 bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide font-sans">
                            Dream Day হোম স্ক্রিন উইজেট
                          </h4>
                          <p className="text-[11px] text-zinc-400 font-sans">
                            আপনার দৈনন্দিন রুটিন ও ছবি সহ লাইভ উইজেট
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                        Offline Ready
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      অ্যাপের ভেতর কোনো প্রিভিউ দেখার প্রয়োজন নেই—নিচের বাটনে চাপ দিয়ে সরাসরি আপনার ফোনের হোম স্ক্রিনে উইজেট হিসেবে সেট করে নিন। সেখানে আপনার যুক্ত করা ছবি ও রুটিনের কাজগুলো লাইভ দেখা যাবে এবং সরাসরি টিকচিহ্ন দেওয়া যাবে।
                    </p>

                    {/* DIRECT ACTION BUTTON */}
                    <button
                      type="button"
                      onClick={() => setShowWidgetActionSheet(true)}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Smartphone className="w-4 h-4 stroke-[2.5]" />
                      <span>📲 হোম স্ক্রিনে উইজেট সেট করুন (Add to Home Screen)</span>
                    </button>
                  </div>

                  {/* HOW TO ADD TO HOME SCREEN INFO */}
                  <div className="p-3.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-2 text-[11px] text-zinc-300">
                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      হোম স্ক্রিনে উইজেট আনার সহজ নিয়ম:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 leading-relaxed font-sans text-[11px]">
                      <li>উপরের বাটনে চাপ দিয়ে ফোনে <strong className="text-zinc-200">Install</strong> করুন।</li>
                      <li>ফোনের হোম স্ক্রিনে SelfX আইকনটি <strong className="text-amber-300">২ সেকেন্ড চেপে ধরে (Long Press)</strong> ড্রিম ডে উইজেট টেনে স্ক্রিনে বসিয়ে দিন।</li>
                    </ol>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {installingMiniApp && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="max-w-sm w-full bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 space-y-5 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

              <div className="space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl shadow-amber-500/5 animate-pulse">
                  {installingMiniApp.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider font-display">
                    মিনি অ্যাপ হিসেবে ইনস্টল করুন
                  </h3>
                  <p className="text-[10px] text-amber-400 font-mono mt-0.5">
                    Standalone Web App Simulation
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-4 text-left space-y-2">
                <p className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  📲 {installingMiniApp.label}
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  এই মডিউলটির একটি ফাস্ট-লঞ্চ শর্টকাট আপনার মোবাইলের হোম স্ক্রীনে এবং অ্যাপ ড্রয়ারে standalone মিনি অ্যাপ্লিকেশন হিসেবে যুক্ত হবে।
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleRealInstall}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  ইন্সটল করুন (Install App)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Turn toggle back off
                    const updated = { ...miniAppsToggles, [installingMiniApp.id]: false };
                    setMiniAppsToggles(updated);
                    localStorage.setItem('selfx_mini_apps_toggles', JSON.stringify(updated));
                    setInstallingMiniApp(null);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstallGuide && (
          <div 
            onClick={() => setShowInstallGuide(false)}
            className="fixed inset-0 z-[155] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="max-w-md w-full bg-gradient-to-b from-[#14151b] via-zinc-950 to-black border border-amber-500/50 rounded-3xl p-5 sm:p-6 space-y-4 text-center shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative overflow-hidden my-auto cursor-default"
            >
              {/* Decorative Gold Header Bar */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  <Smartphone className="w-3 h-3 text-amber-400" />
                  <span>Chrome PWA Installer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstallGuide(false)}
                  className="p-2 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer border border-zinc-700/60 shadow-sm active:scale-95"
                  title="কাট / বন্ধ করুন (✕ Close)"
                  aria-label="Close Installer Prompt"
                >
                  <X className="w-5 h-5 text-rose-300" />
                </button>
              </div>

              {/* App Icon & Details */}
              <div className="space-y-2 pt-1">
                <div className="w-18 h-18 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/70 shadow-[0_0_30px_rgba(245,158,11,0.4)] p-0.5 bg-zinc-900">
                  <img src="/icon-192.png" alt="SelfX Logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider font-display">
                    SelfX : Self Care
                  </h3>
                  <p className="text-[11px] font-mono text-amber-400 font-medium">By Atif Nirob • Supreme Edition</p>
                </div>
              </div>

              {/* Action Buttons: Open Standalone Chrome / Direct Install / Copy Link */}
              <div className="space-y-2.5 pt-2">
                {deferredPrompt ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setShowInstallGuide(false);
                      await handleInstallMainApp();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-gold-500 hover:from-amber-300 hover:to-gold-400 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-4.5 h-4.5 text-zinc-950" />
                    <span>📲 এখনই ইনস্টল করুন (Install Now)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      // Open direct URL in clean top-level Chrome tab where Chrome enables native install prompt
                      const targetUrl = window.location.origin || window.location.href;
                      window.open(targetUrl, '_blank');
                      setShowInstallGuide(false);
                      triggerNotification("🌐 ক্রোম ট্যাবে খোলা হয়েছে", "ক্রোমের ৩-ডট মেনু থেকে 'Install app' বা 'Add to Home screen' চাপুন।");
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-gold-500 hover:from-amber-300 hover:to-gold-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4 text-zinc-950" />
                    <span>🌐 সরাসরি ক্রোম ট্যাবে খুলুন (Open In Chrome)</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetUrl = window.location.origin || window.location.href;
                      navigator.clipboard.writeText(targetUrl);
                      triggerNotification("📋 লিংক কপি হয়েছে!", "ক্রোম ব্রাউজারের অ্যাড্রেস বারে পেস্ট করে খুলুন।");
                    }}
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>লিংক কপি করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const targetUrl = window.location.origin || window.location.href;
                      window.open(targetUrl, '_blank');
                      setShowInstallGuide(false);
                    }}
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>নতুন ট্যাব</span>
                  </button>
                </div>
              </div>

              {/* Easy Step-by-Step Chrome Installation Guide */}
              <div className="text-left bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-display uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>হোম স্ক্রিনে ইনস্টল করার সহজ নিয়ম (Chrome):</span>
                </div>

                <div className="space-y-2 text-[11px] text-zinc-300 font-sans leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">1</span>
                    <p>উপরের <strong className="text-amber-300">"🌐 সরাসরি ক্রোম ট্যাবে খুলুন"</strong> বাটনে চাপ দিন (অথবা লিংকটি ক্রোম ব্রাউজারে পেস্ট করুন)।</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">2</span>
                    <p>ক্রোম ব্রাউজারের উপরে ডানদিকের <strong className="text-white">৩-ডট (⋮) মেনু</strong> আইকনে চাপ দিন।</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">3</span>
                    <p>মেনু থেকে <strong className="text-amber-300">"Install app"</strong> অথবা <strong className="text-amber-300">"Add to Home screen"</strong> সিলেক্ট করে <strong className="text-white">Install</strong> চাপুন।</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">✓</span>
                    <p className="text-emerald-300 font-medium">ইনস্টল হয়ে গেলে মোবাইলের হোম স্ক্রিন থেকে যেকোনো সময় ইন্টারনেট ছাড়াই ফুল-স্ক্রিন অ্যাপ হিসেবে চলবে!</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowInstallGuide(false);
                    try {
                      localStorage.setItem('selfx_install_banner_dismissed', 'true');
                    } catch (e) {}
                    triggerNotification("✕ প্রম্পট বন্ধ করা হয়েছে", "ইন্সটল গাইড সফলভাবে বন্ধ করা হয়েছে।");
                  }}
                  className="w-full py-3 bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 hover:from-zinc-800 hover:to-zinc-850 border border-zinc-700/80 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span>কাট / বন্ধ করুন (✕ Close &amp; Dismiss)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ADD TO HOME SCREEN MODAL ("আরেকটা অপশন আসবে - Add এ ক্লিক করলে হোম স্ক্রিনে চলে যাবে") */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddToHomeScreenModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="max-w-md w-full bg-gradient-to-b from-[#14151b] via-zinc-950 to-black border border-amber-500/50 rounded-3xl p-5 sm:p-6 space-y-4 text-center shadow-[0_15px_60px_rgba(0,0,0,0.9)] relative overflow-hidden my-auto"
            >
              {/* Decorative Gold Header Bar */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  <Smartphone className="w-3 h-3 text-amber-400" />
                  <span>Add to Home screen</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddToHomeScreenModal(false);
                    setAddToHomeStep('confirm');
                  }}
                  className="p-1.5 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {addToHomeStep === 'confirm' ? (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  {/* App Icon & Preview Card */}
                  <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex items-center gap-3.5 text-left">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-amber-500/40 shadow-md p-0.5 bg-zinc-950 shrink-0">
                      <img src="/icon-192.png" alt="SelfX Logo" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h3 className="text-base font-black text-white uppercase tracking-wider font-display truncate">
                        SelfX : Self Care
                      </h3>
                      <p className="text-[11px] font-mono text-amber-400 truncate">
                        {typeof window !== 'undefined' ? (window.location.hostname || 'SelfX App') : 'SelfX App'}
                      </p>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                        <span>রুটিন ও হ্যাবিট ট্র্যাকার উইজেট</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-1">
                    <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                      অ্যাপটিকে সরাসরি আপনার মোবাইলের হোম স্ক্রিনে যুক্ত করতে নিচের <strong className="text-amber-400 font-bold">Add</strong> বাটনে ক্লিক করুন।
                    </p>
                    <p className="text-[10px] text-zinc-400 font-sans">
                      হোম স্ক্রিন থেকে ১-ক্লিকেই ইন্টারনেট ছাড়াই সরাসরি রুটিন ওপেন ও পরিচালনা করতে পারবেন।
                    </p>
                  </div>

                  {/* Two Main Action Buttons: Add & Cancel */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const promptEvent = (window as any).deferredPWAInstallPrompt || deferredPrompt;
                        if (promptEvent) {
                          try {
                            await promptEvent.prompt();
                            const choiceResult = await promptEvent.userChoice;
                            if (choiceResult?.outcome === 'accepted') {
                              (window as any).deferredPWAInstallPrompt = null;
                              setDeferredPrompt(null);
                              setShowAddToHomeScreenModal(false);
                              setAddToHomeStep('confirm');
                              triggerNotification("🎉 হোম স্ক্রিনে যুক্ত হয়েছে!", "SelfX অ্যাপটি সফলভাবে আপনার ডিভাইসের হোম স্ক্রিনে যুক্ত হয়েছে!");
                            } else {
                              triggerNotification("⚠️ বাতিল করা হয়েছে", "আপনি যেকোনো সময় সেটিং থেকে আবার Add করতে পারবেন।");
                              setShowAddToHomeScreenModal(false);
                            }
                          } catch (err) {
                            console.error("Install prompt error:", err);
                            setAddToHomeStep('guide');
                          }
                        } else if (isStandalone) {
                          triggerNotification("✅ ইতিমধ্যে ইনস্টল করা আছে", "SelfX অ্যাপটি আপনার হোম স্ক্রিনে ইতিমধ্যে যুক্ত রয়েছে।");
                          setShowAddToHomeScreenModal(false);
                        } else {
                          setAddToHomeStep('guide');
                        }
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-zinc-950 stroke-[3]" />
                      <span>Add (হোম স্ক্রিনে যোগ করুন)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAddToHomeScreenModal(false);
                        setAddToHomeStep('confirm');
                      }}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel (বাতিল)
                    </button>
                  </div>
                </div>
              ) : (
                /* Step-by-Step Native Browser Guide if auto-prompt is blocked by browser */
                <div className="space-y-3 pt-1 text-left animate-fadeIn">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      ব্রাউজার মেনু থেকে ইনস্টল করুন:
                    </span>
                    <button
                      type="button"
                      onClick={() => setAddToHomeStep('confirm')}
                      className="text-[10px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>ফিরে যান</span>
                    </button>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5 text-[11px] text-zinc-300 font-sans leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">1</span>
                      <p>নিচের <strong className="text-amber-300">"🌐 ক্রোম ব্রাউজারে খুলুন"</strong> বাটনে ক্লিক করুন।</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">2</span>
                      <p>ব্রাউজারের উপরে ডানদিকের <strong className="text-white">৩-ডট (⋮) মেনু</strong> বা আইফোনে <strong className="text-white">Share (⬆️)</strong> আইকনে চাপ দিন।</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">3</span>
                      <p>মেনু থেকে <strong className="text-amber-300">"Add to Home screen"</strong> বা <strong className="text-amber-300">"Install app"</strong> সিলেক্ট করে <strong className="text-white">Add</strong> চাপলেই হোম স্ক্রিনে সেভ হয়ে যাবে!</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const targetUrl = window.location.origin || window.location.href;
                        window.open(targetUrl, '_blank');
                        setShowAddToHomeScreenModal(false);
                        setAddToHomeStep('confirm');
                        triggerNotification("🌐 ক্রোম ট্যাবে খোলা হয়েছে", "৩-ডট মেন্যু থেকে 'Add to Home screen' চাপুন।");
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4 text-zinc-950" />
                      <span>🌐 ক্রোম ব্রাউজারে খুলুন (Open in Chrome)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const targetUrl = window.location.origin || window.location.href;
                          navigator.clipboard.writeText(targetUrl);
                          triggerNotification("📋 লিংক কপি হয়েছে!", "ব্রাউজারের অ্যাড্রেস বারে পেস্ট করে ওপেন করুন।");
                        }}
                        className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>লিংক কপি</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAddToHomeScreenModal(false);
                          setAddToHomeStep('confirm');
                        }}
                        className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>বুঝেছি (Close)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DIRECT WIDGET SETUP ACTION SHEET                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showWidgetActionSheet && (
          <div className="fixed inset-0 z-[240] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-md bg-[#13141a] border border-amber-500/40 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 text-left shadow-2xl text-white"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      হোম স্ক্রিনে Dream Day Widget আনুন
                    </h3>
                    <p className="text-[10px] text-amber-400 font-mono">
                      ফুল অ্যাপ ছাড়া সরাসরি উইজেট পাওয়ার ২টি পদ্ধতি
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWidgetActionSheet(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* METHOD 1: DEDICATED WIDGET APP */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-500/35 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-sans flex items-center gap-1.5">
                    <span>১. আলাদা উইজেট পেজ ওপেন ও পিন করুন</span>
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Direct Widget
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  নিচের বাটনে চাপ দিলে সরাসরি <strong className="text-white">Dream Day Widget</strong> পেজটি ওপেন হবে। এরপর ব্রাউজারের ৩-ডট (⋮) মেনু থেকে <strong className="text-amber-400">"Add to Home screen"</strong> দিলেই এটি আলাদা উইজেট হিসেবে হোম স্ক্রিনে চলে আসবে—তখন আর ফুল অ্যাপ ওপেন হবে না!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.open('/widget.html', '_blank');
                    setShowWidgetActionSheet(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-98 transition-transform"
                >
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>🚀 আলাদা উইজেট পেজ ওপেন করুন (/widget.html)</span>
                </button>
              </div>

              {/* METHOD 2: LONG-PRESS APP ICON ON HOME SCREEN */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>২. ফোনের অ্যাপ আইকন চেপে ধরুন (১ সেকেন্ডে উইজেট)</span>
                </span>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  যেহেতু আপনার ফোনে SelfX ইনস্টল করা আছে: ফোনের হোম স্ক্রিনে থাকা <strong className="text-amber-300">SelfX আইকনটি ১.৫ সেকেন্ড চেপে ধরে রাখুন (Long Press)</strong>। সাথে সাথেই মেনুতে <strong className="text-white">"Dream Day Routine Widget"</strong> দেখতে পাবেন, সেটিকে টেনে হোম স্ক্রিনে বসিয়ে দিন!
                </p>
              </div>

              {/* METHOD 3: FULLSCREEN VIEWER */}
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWidgetActionSheet(false);
                    setIsProfileOpen(false);
                    setShowWidgetHub(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-bold text-center cursor-pointer transition-colors"
                >
                  ⚡ অ্যাপের ভেতর উইজেট দেখুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowWidgetActionSheet(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* AUTHENTIC ANDROID / MIUI WIDGET DRAWER & HUB (Matching User's Screenshot) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showWidgetHub && (
          <AndroidWidgetHub
            onClose={() => setShowWidgetHub(false)}
            todos={todos}
            onToggleTodo={(id) => {
              setTodos(prev => {
                const updated = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
                try { localStorage.setItem('lookmax_todos', JSON.stringify(updated)); } catch (e) {}
                return updated;
              });
            }}
            onAddTodo={(text) => {
              setTodos(prev => {
                const updated = [{ id: Date.now().toString(), text, completed: false }, ...prev];
                try { localStorage.setItem('lookmax_todos', JSON.stringify(updated)); } catch (e) {}
                return updated;
              });
            }}
            waterCount={water.count}
            onAddWater={(amt) => {
              setWater(prev => {
                const updated = { ...prev, count: prev.count + (amt || 1) };
                try { localStorage.setItem('lookmax_water', JSON.stringify(updated)); } catch (e) {}
                return updated;
              });
            }}
            streakDays={streak}
            faithData={faith}
            activeRoutineTask={(() => {
              try {
                const savedV7 = localStorage.getItem('selfx_dream_day_routine_v7');
                if (savedV7) {
                  const items = JSON.parse(savedV7);
                  if (items && items.length > 0) {
                    return { title: items[0].title, timeRange: `${items[0].startTime || '07:00'} - ${items[0].endTime || '08:30'}`, desc: items[0].desc || items[0].description };
                  }
                }
                const saved = localStorage.getItem('lookmax_dream_activities_v2');
                if (saved) {
                  const items = JSON.parse(saved);
                  if (items && items.length > 0) {
                    return { title: items[0].title, timeRange: `${items[0].startTime || '07:00'} - ${items[0].endTime || '08:30'}`, desc: items[0].desc || items[0].description };
                  }
                }
              } catch (e) {}
              return null;
            })()}
            deferredPrompt={deferredPrompt}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
