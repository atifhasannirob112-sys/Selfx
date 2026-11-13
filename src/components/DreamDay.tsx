import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Sunrise, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Flame, 
  BookOpen, 
  Dumbbell, 
  Coffee, 
  Brain, 
  Camera, 
  Upload, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Music, 
  Edit2, 
  Trash2, 
  Star, 
  Award, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BarChart2, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon,
  CheckCheck,
  TrendingUp,
  Users,
  Smartphone,
  Share2,
  Download,
  ShieldCheck,
  Wifi,
  Layers,
  RotateCcw,
  HelpCircle,
  CheckSquare,
  Square,
  Minimize2,
  Target,
  MessageSquare,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { DreamDayActivity, DreamDayActivityStatus, DreamDayStatus } from '../types';
import { triggerNotification } from '../utils';

interface DreamDayProps {
  onEarnPoints?: (amount: number, reason: string) => void;
  onClose?: () => void;
}

// Prayer definitions for time-locking and Faith Tracker synchronization
const PRAYER_DEFINITIONS: { match: RegExp; prayerKey: string; defaultTime: string; label: string; bengaliLabel: string }[] = [
  { match: /fajr|fazr|fojr|faajr|ফজর|fajor|pray\s*fazr|pray\s*fajr/i, prayerKey: 'fajr', defaultTime: '04:45 AM', label: 'Fajr (ফজর)', bengaliLabel: 'ফজর নামাজ' },
  { match: /dhuhr|zohor|zuhr|duhr|johor|zohr|zuhor|যোহর|জোহর|pray\s*zohor|pray\s*zuhr|pray\s*dhuhr/i, prayerKey: 'zohor', defaultTime: '01:15 PM', label: 'Dhuhr (যোহর)', bengaliLabel: 'যোহর নামাজ' },
  { match: /asr|achr|asar|asor|asir|আসর|pray\s*asar|pray\s*asr/i, prayerKey: 'achr', defaultTime: '04:30 PM', label: 'Asr (আসর)', bengaliLabel: 'আসর নামাজ' },
  { match: /maghrib|magrib|magrhib|maghreb|magreb|মাগরিব|pray\s*magrhib|pray\s*maghrib|pray\s*magrib/i, prayerKey: 'magrib', defaultTime: '06:35 PM', label: 'Maghrib (মাগরিব)', bengaliLabel: 'মাগরিব নামাজ' },
  { match: /isha|esha|eesha|isya|ishaa|prau\s*isha|pray\s*isha|pray\s*esha|এশা/i, prayerKey: 'esha', defaultTime: '08:00 PM', label: 'Isha (এশা)', bengaliLabel: 'এশা নামাজ' },
  { match: /tahajjud|তাহাজ্জুদ|tahajjut|pray\s*tahajjud/i, prayerKey: 'tahajjud', defaultTime: '03:30 AM', label: 'Tahajjud (তাহাজ্জুদ)', bengaliLabel: 'তাহাজ্জুদ নামাজ' },
  { match: /jummah|juma|জুমআ|জুমা|jumma|pray\s*jummah|pray\s*juma/i, prayerKey: 'zohor', defaultTime: '01:30 PM', label: 'Jummah (জুমা)', bengaliLabel: 'জুমুআ নামাজ' },
];

// Helper to determine if a task is a prayer / Salah
export function getPrayerTaskInfo(title?: string, description?: string) {
  if (!title && !description) return null;
  const fullText = `${title || ''} ${description || ''}`.trim();
  const matched = PRAYER_DEFINITIONS.find(p => p.match.test(fullText));
  if (matched) return matched;
  if (/pray|namaz|salah|salat|নামাজ|সালাত|ওয়াক্ত|ওয়াক্ত/i.test(fullText)) {
    return {
      match: /pray|namaz|salah/i,
      prayerKey: 'fajr',
      defaultTime: 'Prayer Time',
      label: 'Salah (নামাজ)',
      bengaliLabel: 'নামাজ'
    };
  }
  return null;
}

// Starter Activities for Today's Essential Tasks (No prayer tasks - prayer is in Faith Tracker)
const STARTER_ROUTINE_TEMPLATE: Omit<DreamDayActivity, 'id'>[] = [
  {
    startTime: '',
    endTime: '',
    title: 'Morning Sunlight & Hydration',
    description: 'Fresh air, 500ml water and positive morning focus',
    category: 'morning',
    visionImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80'
  },
  {
    startTime: '',
    endTime: '',
    title: 'Workout & Physical Training',
    description: 'Gym weightlifting, push-ups & discipline training',
    category: 'workout',
    visionImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80'
  },
  {
    startTime: '',
    endTime: '',
    title: 'Deep Study & Skill Learning',
    description: 'Focused skill learning, tech practice and reading',
    category: 'focus',
    visionImageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80'
  },
  {
    startTime: '',
    endTime: '',
    title: 'Nutritious High-Protein Fuel',
    description: 'Clean nutrition to feed body and brain',
    category: 'nutrition',
    visionImageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80'
  },
  {
    startTime: '',
    endTime: '',
    title: 'Deep Work Block / Project Creation',
    description: 'Monk mode high-value task without distraction',
    category: 'focus',
    visionImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80'
  },
  {
    startTime: '',
    endTime: '',
    title: 'Outdoor Walk & Mental Reset',
    description: 'Fresh air, walking & clear headspace',
    category: 'evening',
    visionImageUrl: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1200&auto=format&fit=crop&q=80'
  },
  {
    startTime: '',
    endTime: '',
    title: 'Night Reflection & Review',
    description: 'Review achievements, Prime check-in & tomorrow plan',
    category: 'night',
    visionImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80'
  }
];

// Compress Image to High-Quality Base64
function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error("Image failed to load"));
    };
    reader.onerror = (err) => reject(err);
  });
}

// Gentle Harmonic Audio Chime
function playInspiringChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const frequencies = [523.25, 659.25, 783.99, 987.77];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.0001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.035, now + i * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.0);
    });
  } catch (e) {}
}

export default function DreamDay({ onEarnPoints, onClose }: DreamDayProps) {
  // 1. Routine activities list (Excludes prayer tasks - prayer belongs in Faith Tracker)
  const [activities, setActivities] = useState<DreamDayActivity[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_dream_day_routine_v8') || localStorage.getItem('selfx_dream_day_routine_v7') || localStorage.getItem('selfx_dream_day_routine_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nonPrayer = parsed.filter((act: any) => !getPrayerTaskInfo(act.title, act.description));
          if (nonPrayer.length > 0) return nonPrayer;
        }
      }
    } catch (e) {}
    return STARTER_ROUTINE_TEMPLATE.map((item, idx) => ({
      ...item,
      id: `dd_item_${idx}_${Date.now()}`
    }));
  });

  // 2. Today's date string & selected calendar date string
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayDateStr);

  // Generate 7-day rolling calendar strip (past 3 days, today, next 3 days)
  const weekDays = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayDateStr;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      days.push({ dateStr, isToday, dayName, dayNum });
    }
    return days;
  }, [todayDateStr]);

  // Daily execution status for the selected date
  const [dailyStatuses, setDailyStatuses] = useState<Record<string, DreamDayActivityStatus>>(() => {
    try {
      const saved = localStorage.getItem(`selfx_dream_day_status_v7_${todayDateStr}`);
      if (saved) return JSON.parse(saved);
      const prevSaved = localStorage.getItem(`selfx_dream_day_status_v6_${todayDateStr}`);
      if (prevSaved) return JSON.parse(prevSaved);
    } catch (e) {}
    const initial: Record<string, DreamDayActivityStatus> = {};
    return initial;
  });

  // Load status whenever selected date changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`selfx_dream_day_status_v7_${selectedDateStr}`);
      if (saved) {
        setDailyStatuses(JSON.parse(saved));
      } else {
        setDailyStatuses({});
      }
    } catch (e) {
      setDailyStatuses({});
    }
  }, [selectedDateStr]);

  // Two-way synchronization event listener
  useEffect(() => {
    const handleSyncEvent = () => {
      try {
        const saved = localStorage.getItem(`selfx_dream_day_status_v7_${selectedDateStr}`);
        if (saved) setDailyStatuses(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('dream_day_status_synced', handleSyncEvent);
    return () => window.removeEventListener('dream_day_status_synced', handleSyncEvent);
  }, [selectedDateStr]);

  // View All toggle in Today's Plan
  const [isViewAllExpanded, setIsViewAllExpanded] = useState(false);

  // Background Audio
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('selfx_dream_day_bg_audio') || null;
    } catch (e) {
      return null;
    }
  });
  const [customAudioName, setCustomAudioName] = useState<string>(() => {
    try {
      return localStorage.getItem('selfx_dream_day_bg_audio_name') || 'Inspiring Flow.mp3';
    } catch (e) {
      return 'Inspiring Flow.mp3';
    }
  });
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Animate Day Vertical Player State
  const [isAnimateModalOpen, setIsAnimateModalOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState(true);
  const [slideProgress, setSlideProgress] = useState(0);
  const [showFinaleReview, setShowFinaleReview] = useState(false);

  // Daily Review & AI Evaluation Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // 7-Day Weekly Review Sabha Modal State
  const [isWeeklySabhaOpen, setIsWeeklySabhaOpen] = useState(false);

  // Home Screen Widget Mode State (auto opened if ?widget=true in URL or dispatched from Settings)
  const [isWidgetModeOpen, setIsWidgetModeOpen] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('widget') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showWidgetInstallModal, setShowWidgetInstallModal] = useState(false);

  useEffect(() => {
    const handleOpenWidget = () => setIsWidgetModeOpen(true);
    window.addEventListener('selfx-open-widget-mode', handleOpenWidget);
    return () => window.removeEventListener('selfx-open-widget-mode', handleOpenWidget);
  }, []);

  // Live ticking time clock for Widget & Live Tracker
  const [liveClockTime, setLiveClockTime] = useState<string>(() => 
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setLiveClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Create / Edit Activity Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formStartTime, setFormStartTime] = useState('07:00');
  const [formEndTime, setFormEndTime] = useState('08:30');
  const [formDesc, setFormDesc] = useState('');
  const [formVisionImageUrl, setFormVisionImageUrl] = useState<string | undefined>(undefined);
  const [formPersonalPhotoUrl, setFormPersonalPhotoUrl] = useState<string | undefined>(undefined);

  // Hidden Inputs
  const quickSnapInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetSnapId, setTargetSnapId] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('selfx_dream_day_routine_v7', JSON.stringify(activities));
    } catch (e) {}
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(`selfx_dream_day_status_v7_${selectedDateStr}`, JSON.stringify(dailyStatuses));
    } catch (e) {}
  }, [dailyStatuses, selectedDateStr]);

  // Compute Daily Statistics - STRICTLY REAL & REACTIVE TO USER CLICKS (NO FAKE PRE-FILLS)
  const stats = useMemo(() => {
    const total = activities.length;
    let completed = 0;
    let modified = 0;
    let missed = 0;

    activities.forEach(act => {
      const st = dailyStatuses[act.id]?.status;
      if (st === 'completed') completed++;
      else if (st === 'modified') modified++;
      else if (st === 'missed') missed++;
    });

    const progressPercentage = total > 0 ? Math.round(((completed + modified * 0.5) / total) * 100) : 0;
    return { total, completed, modified, missed, progressPercentage };
  }, [activities, dailyStatuses]);

  // AI 2-Line English Evaluation
  const aiDebrief = useMemo(() => {
    const { total, completed, modified, missed } = stats;
    let rating = 0;
    if (total > 0) {
      const score = (completed * 10 + modified * 6) / total;
      rating = Math.round(score * 10) / 10;
    }

    let line1 = total === 0 || (completed === 0 && modified === 0 && missed === 0)
      ? `Your routine is ready for today. Click off tasks as you finish them to build momentum!`
      : `You have completed ${completed} out of ${total} planned daily routines (${stats.progressPercentage}% progress).`;

    let line2 = (completed === total && total > 0)
      ? `Outstanding day—you operated at peak clarity and executed every single routine perfectly!`
      : (modified > 0 || missed > 0)
      ? `Protect your scheduled hours tomorrow to prevent the ${missed > 0 ? `${missed} skipped` : ''}${missed > 0 && modified > 0 ? ' and ' : ''}${modified > 0 ? `${modified} modified` : ''} routine slots.`
      : `Keep following through on your schedule as the day unfolds to achieve 100% completion.`;

    const feedback = {
      strengths: completed > 0 ? [
        `Logged ${completed} completed routine blocks with verified timestamps.`,
        "Maintained mental stamina through scheduled daily targets."
      ] : [
        "Fresh day awaiting execution. Start with your earliest morning habit!"
      ],
      mistakes: missed > 0 ? [
        `${missed} scheduled activity was missed due to schedule slippage.`
      ] : ["No critical execution gaps detected."],
      tomorrow: [
        "Keep evening routine fixed to ensure restorative 8h sleep.",
        "Hydrate immediately upon rising to kickstart morning alertness."
      ]
    };

    return { rating, line1, line2, feedback };
  }, [stats]);

  // 7-DAY WEEKLY SABHA DATA AGGREGATION & SCORE CALCULATION
  const weeklySabhaData = useMemo(() => {
    const past7Days: {
      dateStr: string;
      dayName: string;
      dayNum: number;
      isToday: boolean;
      total: number;
      completed: number;
      modified: number;
      missed: number;
      score: number;
    }[] = [];

    const taskMissCounts: Record<string, { title: string; count: number }> = {};
    const taskSuccessCounts: Record<string, { title: string; count: number }> = {};
    let totalTasksAccum = 0;
    let totalCompletedAccum = 0;
    let totalModifiedAccum = 0;
    let totalMissedAccum = 0;

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayDateStr;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();

      let dayCompleted = 0;
      let dayModified = 0;
      let dayMissed = 0;

      let dayStatusMap: Record<string, DreamDayActivityStatus> = {};
      if (dateStr === selectedDateStr) {
        dayStatusMap = dailyStatuses;
      } else {
        try {
          const saved = localStorage.getItem(`selfx_dream_day_status_v7_${dateStr}`);
          if (saved) dayStatusMap = JSON.parse(saved);
        } catch (e) {}
      }

      activities.forEach(act => {
        const st = dayStatusMap[act.id]?.status;
        if (st === 'completed') {
          dayCompleted++;
          taskSuccessCounts[act.id] = {
            title: act.title,
            count: (taskSuccessCounts[act.id]?.count || 0) + 1
          };
        } else if (st === 'modified') {
          dayModified++;
        } else if (st === 'missed') {
          dayMissed++;
          taskMissCounts[act.id] = {
            title: act.title,
            count: (taskMissCounts[act.id]?.count || 0) + 1
          };
        } else {
          // If past day and untouched, count as missed
          if (i > 0) {
            dayMissed++;
            taskMissCounts[act.id] = {
              title: act.title,
              count: (taskMissCounts[act.id]?.count || 0) + 1
            };
          }
        }
      });

      const dayTotal = activities.length || 1;
      const dayScore = dayTotal > 0 ? Math.round(((dayCompleted + dayModified * 0.5) / dayTotal) * 100) : 0;

      totalTasksAccum += activities.length;
      totalCompletedAccum += dayCompleted;
      totalModifiedAccum += dayModified;
      totalMissedAccum += dayMissed;

      past7Days.push({
        dateStr,
        dayName,
        dayNum,
        isToday,
        total: activities.length,
        completed: dayCompleted,
        modified: dayModified,
        missed: dayMissed,
        score: dayScore
      });
    }

    // 7-day average score
    const overallWeekScore = totalTasksAccum > 0
      ? Math.round(((totalCompletedAccum + totalModifiedAccum * 0.5) / totalTasksAccum) * 100)
      : stats.progressPercentage;

    // Top Most Missed tasks
    const mostMissedList = Object.values(taskMissCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Top Consistent Wins
    const topWinsList = Object.values(taskSuccessCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      past7Days,
      overallWeekScore,
      totalCompletedAccum,
      totalMissedAccum,
      totalTasksAccum,
      mostMissedList,
      topWinsList
    };
  }, [activities, dailyStatuses, selectedDateStr, todayDateStr, stats.progressPercentage]);

  // Sabha Council AI Strategic Verdict & Advice
  const sabhaAdvice = useMemo(() => {
    const score = weeklySabhaData.overallWeekScore;
    let grade = "A+ Elite Standard";
    let verdictHeadline = "Outstanding 7-Day Discipline & Execution!";
    let guidanceNotes = [
      "You demonstrated high self-discipline across your morning & deep work blocks.",
      "Keep standard wake-up times and protect evening wind-down to sustain this peak performance.",
      "Prioritize your spiritual routine (5 daily prayers) as the anchor for mental focus."
    ];

    if (score < 50) {
      grade = "C Critical Reset Needed";
      verdictHeadline = "Routine Slippage Detected — Needs Strategic Reset";
      guidanceNotes = [
        "Multiple routine blocks were missed during the past 7 days. Simplify your daily schedule to 3 essential non-negotiables.",
        "Eliminate late-night phone screen time to ensure on-time Fajr & morning workout execution.",
        "Track your tasks live throughout the day rather than postponing check-offs until late night."
      ];
    } else if (score < 80) {
      grade = "B Steady Growth";
      verdictHeadline = "Solid Foundation with Minor Consistency Gaps";
      guidanceNotes = [
        "Good momentum, but afternoon and evening routines show intermittent drops.",
        "Set gentle alarms 10 minutes prior to crucial routine transitions (e.g. Study, Asr/Maghrib, Workout).",
        "Focus on the most frequently missed tasks highlighted below to push your weekly score above 90%."
      ];
    }

    return { grade, verdictHeadline, guidanceNotes };
  }, [weeklySabhaData.overallWeekScore]);

  // Format 24h to 12h
  const formatTimeDisplay = (timeStr?: string) => {
    if (!timeStr) return '05:30 AM';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const min = parts[1];
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
    return `${hourStr}:${min} ${ampm}`;
  };

  // Launch Animate Day
  const handleStartAnimateDay = () => {
    if (activities.length === 0) return;
    setCurrentSlideIndex(0);
    setSlideProgress(0);
    setIsPlayingAuto(true);
    setShowFinaleReview(false);
    setIsAnimateModalOpen(true);

    if (customAudioUrl && bgAudioRef.current) {
      bgAudioRef.current.currentTime = 0;
      bgAudioRef.current.play().catch(() => {});
    } else {
      playInspiringChime();
    }
  };

  // Slide Auto-Advance
  useEffect(() => {
    if (!isAnimateModalOpen || !isPlayingAuto) return;

    const totalSlides = activities.length;
    const slideDuration = 4500;
    const intervalTime = 50;
    const step = (intervalTime / slideDuration) * 100;

    const timer = setInterval(() => {
      setSlideProgress(prev => {
        if (prev >= 100) {
          setCurrentSlideIndex(curr => {
            if (curr < totalSlides - 1) {
              if (!customAudioUrl) playInspiringChime();
              return curr + 1;
            } else {
              setIsPlayingAuto(false);
              setShowFinaleReview(true);
              return curr;
            }
          });
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAnimateModalOpen, isPlayingAuto, activities.length, customAudioUrl]);

  // Cycle / Toggle Status when clicking checkbox in timeline (Prayer Waqt Locked & Live Time Tracked)
  const handleToggleTaskStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetAct = activities.find(a => a.id === id);

    // Check if this task is a prayer (Salah - Fazr, Zohor, Asar, Magrhib, Isha etc.)
    const prayerMatch = getPrayerTaskInfo(targetAct?.title, targetAct?.description);

    let prayerWaqtTime: string | undefined = undefined;
    if (prayerMatch) {
      if (targetAct?.startTime && targetAct.startTime.trim()) {
        prayerWaqtTime = formatTimeDisplay(targetAct.startTime);
      } else {
        prayerWaqtTime = prayerMatch.defaultTime;
      }
    }

    setDailyStatuses(prev => {
      const current = prev[id]?.status || 'pending';
      let next: DreamDayStatus = 'completed';
      let newCompletedAt: string | undefined = nowTimeStr;

      if (current === 'completed') {
        next = 'pending';
        newCompletedAt = undefined;
      } else if (current === 'pending') {
        next = 'completed';
        // If prayer, lock to its specific Waqt time rather than late click time
        newCompletedAt = prayerWaqtTime || nowTimeStr;
        if (onEarnPoints) onEarnPoints(20, 'Dream Day Task Completed');
        playInspiringChime();
        if (prayerMatch) {
          triggerNotification("🕌 Prayer Recorded! (নামাজ সম্পন্ন)", `"${targetAct?.title || prayerMatch.label}" marked with official Waqt time (${prayerWaqtTime}) & synced to Faith Tracker.`);
        } else {
          triggerNotification("🎯 Task Completed!", `"${targetAct?.title || 'Task'}" completed (Saved at ${nowTimeStr}).`);
        }
      } else if (current === 'modified') {
        next = 'missed';
        newCompletedAt = undefined;
      } else if (current === 'missed') {
        next = 'completed';
        newCompletedAt = prayerWaqtTime || nowTimeStr;
      }

      // Sync with Faith Tracker if prayer
      if (prayerMatch) {
        try {
          const savedFaith = localStorage.getItem('lookmax_faith');
          const parsedFaith = savedFaith ? JSON.parse(savedFaith) : {};
          parsedFaith[prayerMatch.prayerKey] = (next === 'completed');
          localStorage.setItem('lookmax_faith', JSON.stringify(parsedFaith));
          window.dispatchEvent(new CustomEvent('lookmax_faith_updated', { detail: parsedFaith }));
        } catch (err) {
          console.error("Failed to sync prayer with FaithTracker", err);
        }
      }

      return {
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          status: next,
          updatedAt: nowTimeStr,
          completedAt: newCompletedAt
        }
      };
    });
  };

  // Quick Inline Add Task State
  const [quickTaskInput, setQuickTaskInput] = useState('');

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskInput.trim()) return;

    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const prayerMatch = getPrayerTaskInfo(quickTaskInput.trim());
    const isPrayer = Boolean(prayerMatch);

    let defaultStartTime = currentTimeStr;
    if (isPrayer && prayerMatch) {
      if (prayerMatch.prayerKey === 'fajr') defaultStartTime = '05:00';
      else if (prayerMatch.prayerKey === 'zohor') defaultStartTime = '13:15';
      else if (prayerMatch.prayerKey === 'achr') defaultStartTime = '16:30';
      else if (prayerMatch.prayerKey === 'magrib') defaultStartTime = '18:35';
      else if (prayerMatch.prayerKey === 'esha') defaultStartTime = '20:00';
      else if (prayerMatch.prayerKey === 'tahajjud') defaultStartTime = '03:30';
    }

    const newAct: DreamDayActivity = {
      id: 'dd_task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: quickTaskInput.trim(),
      startTime: defaultStartTime,
      endTime: '',
      description: isPrayer ? `${prayerMatch?.bengaliLabel || 'নামাজ'} (Waqt Prayer)` : 'Daily Routine (To-Do Task)',
      category: isPrayer ? 'morning' : 'todo',
      isCustomTask: true,
      visionImageUrl: isPrayer
        ? 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80'
    };

    setActivities(prev => [...prev, newAct]);
    setQuickTaskInput('');
    if (isPrayer) {
      triggerNotification("🕌 Prayer Added", `"${newAct.title}" (${prayerMatch?.bengaliLabel}) added as Waqt Prayer to routine.`);
    } else {
      triggerNotification("📝 Task Added", `"${newAct.title}" has been added to your today's routine.`);
    }
  };

  // Quick Real Photo Upload Handler
  const handleSetExplicitTaskStatus = (id: string, status: DreamDayStatus, photoUrl?: string) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDailyStatuses(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
        personalPhotoUrl: photoUrl || prev[id]?.personalPhotoUrl,
        completedAt: status === 'completed' ? (prev[id]?.completedAt || nowTimeStr) : undefined,
        updatedAt: new Date().toISOString()
      }
    }));
    if (photoUrl) {
      setActivities(prev => prev.map(a => a.id === id ? { ...a, personalPhotoUrl: photoUrl } : a));
    }
    if (status === 'completed' && onEarnPoints) {
      onEarnPoints(30, 'Task Verified');
    }
  };

  const handleQuickSnapFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSnapId) return;

    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      const targetId = targetSnapId;
      setDailyStatuses(prev => ({
        ...prev,
        [targetId]: {
          ...(prev[targetId] || { status: 'completed' }),
          personalPhotoUrl: compressed
        }
      }));
      setActivities(prev => prev.map(a => a.id === targetId ? { ...a, personalPhotoUrl: compressed } : a));
      triggerNotification("📸 Real Photo Saved", "Your real-life photo has been linked to this activity.");
      setTargetSnapId(null);
    } catch (err) {
      triggerNotification("❌ Upload Failed", "Could not process photo.");
    }
  };

  // Audio Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomAudioName(file.name);
      try {
        localStorage.setItem('selfx_dream_day_bg_audio_name', file.name);
      } catch (err) {}
      triggerNotification("🎵 Audio Loaded", `"${file.name}" loaded as background music.`);
    } catch (err) {
      triggerNotification("❌ Error", "Could not load audio.");
    }
  };

  // Open Form
  const handleOpenAddForm = () => {
    setEditingActivityId(null);
    setFormTitle('');
    setFormStartTime('07:00');
    setFormEndTime('08:30');
    setFormDesc('');
    setFormVisionImageUrl(undefined);
    setFormPersonalPhotoUrl(undefined);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (act: DreamDayActivity) => {
    setEditingActivityId(act.id);
    setFormTitle(act.title);
    setFormStartTime(act.startTime || '07:00');
    setFormEndTime(act.endTime || '08:30');
    setFormDesc(act.description || '');
    setFormVisionImageUrl(act.visionImageUrl || act.mediaUrl);
    setFormPersonalPhotoUrl(dailyStatuses[act.id]?.personalPhotoUrl || act.personalPhotoUrl);
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingActivityId) {
      setActivities(prev => prev.map(act => {
        if (act.id === editingActivityId) {
          return {
            ...act,
            startTime: formStartTime,
            endTime: formEndTime,
            title: formTitle.trim(),
            description: formDesc.trim(),
            visionImageUrl: formVisionImageUrl,
            personalPhotoUrl: formPersonalPhotoUrl,
            mediaUrl: formVisionImageUrl
          };
        }
        return act;
      }));

      if (formPersonalPhotoUrl) {
        setDailyStatuses(prev => ({
          ...prev,
          [editingActivityId]: {
            ...(prev[editingActivityId] || { status: 'completed' }),
            personalPhotoUrl: formPersonalPhotoUrl
          }
        }));
      }
      triggerNotification("✅ Activity Updated", `"${formTitle}" updated.`);
    } else {
      const newAct: DreamDayActivity = {
        id: 'dd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        startTime: formStartTime,
        endTime: formEndTime,
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: 'focus',
        visionImageUrl: formVisionImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
        personalPhotoUrl: formPersonalPhotoUrl
      };
      setActivities(prev => [...prev, newAct]);
      triggerNotification("✨ Activity Created", `"${newAct.title}" added.`);
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    setDailyStatuses(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    triggerNotification("🗑 Removed", "Activity removed.");
  };

  // Filter out any prayer tasks from Dream Day (Prayers are dedicated to Faith Tracker)
  const nonPrayerActivities = useMemo(() => {
    return activities.filter(act => !getPrayerTaskInfo(act.title, act.description));
  }, [activities]);

  // Activities to display in Today's Plan (first 6 by default, all if expanded)
  const displayedActivities = isViewAllExpanded ? nonPrayerActivities : nonPrayerActivities.slice(0, 6);

  // Current Scene for Animate Day
  const currentScene = activities[currentSlideIndex] || activities[0];
  const sceneRealPhoto = dailyStatuses[currentScene?.id]?.personalPhotoUrl || currentScene?.personalPhotoUrl;
  const sceneVisionPhoto = currentScene?.visionImageUrl || currentScene?.mediaUrl;
  const activeSceneImage = sceneRealPhoto || sceneVisionPhoto;
  const isRealPhotoActive = !!sceneRealPhoto;

  return (
    <div id="dream-day-screenshot-perfect-root" className="w-full max-w-md mx-auto space-y-4 text-zinc-100 font-sans pb-24 animate-fadeIn select-none">
      
      {/* Background Continuous Audio */}
      {customAudioUrl && (
        <audio 
          ref={bgAudioRef} 
          src={customAudioUrl} 
          loop 
          muted={isAudioMuted}
          preload="auto"
        />
      )}

      {/* Hidden File Upload Inputs */}
      <input ref={quickSnapInputRef} type="file" accept="image/*" onChange={handleQuickSnapFile} className="hidden" />
      <input ref={audioFileInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER (MATCHING SCREENSHOT WITH SABHA & WIDGET QUICK ACCESS)       */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between px-1 pt-1 pb-2">
        {/* Back Button */}
        <button 
          type="button" 
          onClick={onClose}
          className="w-10 h-10 rounded-2xl bg-[#14141e]/90 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Title & Subtitle */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <h1 className="text-base font-black tracking-widest text-amber-400 font-display uppercase">
              DREAM DAY
            </h1>
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-zinc-400 font-sans tracking-wide">
              Build your ideal 24-hour routine
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline Ready</span>
            </span>
          </div>
        </div>

        {/* Header Action Group: Soundtrack Upload */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => audioFileInputRef.current?.click()}
            className="w-10 h-10 rounded-2xl bg-[#14141e]/90 border border-zinc-800/80 flex items-center justify-center text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer"
            title="Upload Background Music (.mp3)"
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1.5 MINI CALENDAR STRIP (COMPACT DAY-BY-DAY TRACKER & AUTO NEW DAY RESET) */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-[#0e0e17] border border-zinc-850/90 p-2.5 shadow-lg">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium font-sans">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {selectedDateStr === todayDateStr ? "Today's Routine" : `Date: ${selectedDateStr}`}
            </span>
          </div>
          {selectedDateStr !== todayDateStr && (
            <button
              type="button"
              onClick={() => setSelectedDateStr(todayDateStr)}
              className="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 cursor-pointer"
            >
              Jump to Today
            </button>
          )}
        </div>

        {/* 7-Day Rolling Calendar Strip */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((item) => {
            const isSelected = item.dateStr === selectedDateStr;
            const isToday = item.isToday;

            // Check recorded completions for this day
            let savedDayCount = 0;
            try {
              const saved = localStorage.getItem(`selfx_dream_day_status_v7_${item.dateStr}`);
              if (saved) {
                const parsed = JSON.parse(saved);
                savedDayCount = Object.values(parsed).filter((s: any) => s?.status === 'completed').length;
              }
            } catch (e) {}

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.35)] scale-105 z-10'
                    : isToday
                    ? 'bg-zinc-800/80 border border-amber-400/50 text-amber-300'
                    : 'bg-zinc-900/60 border border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <span className={`text-[9px] font-mono uppercase tracking-wider ${isSelected ? 'text-black/80 font-bold' : isToday ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {item.dayName}
                </span>
                <span className={`text-xs font-black font-display mt-0.5 ${isSelected ? 'text-black' : 'text-white'}`}>
                  {item.dayNum}
                </span>

                {/* Day status indicator dot */}
                <div className="mt-1 flex items-center justify-center">
                  {savedDayCount > 0 ? (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-emerald-400'}`} />
                  ) : (
                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-black/30' : 'bg-zinc-700'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CARD 1: TODAY'S PROGRESS (100% REAL & REACTIVE TO USER CLICKS)          */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#0e0e17] border border-zinc-850 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-300/80 font-mono">
            TODAY'S PROGRESS
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">
            {stats.completed} of {stats.total} Tasks Checked
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          
          {/* Left: Speedometer Gauge Progress */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-28 h-20 flex items-center justify-center overflow-hidden">
              {/* Semi-circle SVG Arch */}
              <svg className="w-28 h-28 transform -rotate-90 absolute top-0" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800/80"
                  strokeWidth="3.2"
                  strokeDasharray="50, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-700"
                  strokeDasharray={`${(stats.progressPercentage * 50) / 100}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="url(#progressGradient)"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-1 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white font-display leading-none">
                  {stats.progressPercentage}%
                </span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-sans mt-1">
              Overall Progress
            </span>
          </div>

          {/* Right: 3 Metric Counters */}
          <div className="space-y-3 pl-2">
            
            {/* Completed */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-sm font-bold text-emerald-400 font-display">{stats.completed}</span>
              </div>
              <span className="text-zinc-300 font-medium text-xs">Completed</span>
            </div>

            {/* Modified */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Edit2 className="w-2.5 h-2.5" />
                </div>
                <span className="text-sm font-bold text-amber-400 font-display">{stats.modified}</span>
              </div>
              <span className="text-zinc-300 font-medium text-xs">Modified</span>
            </div>

            {/* Missed */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <X className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-sm font-bold text-rose-400 font-display">{stats.missed}</span>
              </div>
              <span className="text-zinc-300 font-medium text-xs">Missed</span>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD: TODAY'S ESSENTIAL TASKS (PREMIUM AESTHETIC TO-DO LIST)              */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#0d0d15] border border-zinc-800/80 p-4 sm:p-5 shadow-2xl space-y-4">
        
        {/* Header: TODAY'S ESSENTIAL TASKS & COUNTER */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/70">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display flex items-center gap-2">
              <span>TODAY'S ESSENTIAL TASKS</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                Daily Priority
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Lock in your non-negotiable goals for today and verify with completion proof
            </p>
          </div>
          <span className="text-xs sm:text-sm font-mono text-amber-400 font-bold shrink-0 ml-2">
            {stats.completed} of {nonPrayerActivities.length} Done
          </span>
        </div>

        {/* Quick Add To-Do Task Input Bar */}
        <form onSubmit={handleQuickAddTask} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickTaskInput}
              onChange={(e) => setQuickTaskInput(e.target.value)}
              placeholder="+ Add new essential task..."
              className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-white placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={!quickTaskInput.trim()}
            className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </form>

        {/* Timeline / To-Do List of Tasks */}
        <div className="space-y-3 pt-1 relative">
          {displayedActivities.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-3xl bg-zinc-900/30 border border-dashed border-zinc-800 text-zinc-400 space-y-2">
              <p className="text-sm font-sans font-medium">No tasks recorded for today</p>
              <p className="text-xs font-mono text-zinc-500">Enter a target above to log your core daily focus.</p>
            </div>
          ) : (
            displayedActivities.map((act) => {
              const statusData = dailyStatuses[act.id];
              const isDone = statusData?.status === 'completed';
              const isModified = statusData?.status === 'modified';
              const isMissed = statusData?.status === 'missed';
              const liveCompletedAt = statusData?.completedAt;
              const realPhoto = statusData?.personalPhotoUrl || act.personalPhotoUrl;
              const visionPhoto = act.visionImageUrl || act.mediaUrl;
              const displayImage = realPhoto || visionPhoto || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80';

              return (
                <div 
                  key={act.id} 
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4.5 rounded-3xl border transition-all cursor-pointer ${
                    isDone 
                      ? 'bg-[#0f1713] border-emerald-500/35 shadow-[0_0_20px_rgba(16,185,129,0.08)]' 
                      : 'bg-[#12121b] border-zinc-800/90 hover:bg-[#151522] hover:border-amber-500/40 shadow-lg'
                  }`}
                  onClick={() => handleOpenEditForm(act)}
                >
                  {/* Left Side: Large Photo + Task Content */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* 1. Large High-Resolution Image Thumbnail */}
                    <div className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-2xl overflow-hidden shrink-0 border transition-all shadow-md bg-zinc-950 ${
                      isDone ? 'border-emerald-500/50' : 'border-zinc-700/80 group-hover:border-amber-400/60'
                    }`}>
                      <img 
                        src={displayImage} 
                        alt={act.title} 
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isDone ? 'opacity-85' : 'opacity-100'}`} 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      {/* Subtle Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Real Photo / Done Indicator */}
                      {realPhoto ? (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-500 text-[8px] font-mono font-black text-black rounded uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <span>📸</span>
                          <span>REAL</span>
                        </span>
                      ) : isDone && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-500/95 text-[8px] font-mono font-black text-black rounded uppercase tracking-wider shadow-md">
                          ✓ DONE
                        </span>
                      )}
                    </div>

                    {/* 2. Task Details */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Category & Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
                          {act.category || 'Essential Task'}
                        </span>

                        {liveCompletedAt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>Done: {liveCompletedAt}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500">
                            Daily Target
                          </span>
                        )}
                      </div>

                      {/* Task Title */}
                      <h4 className={`text-sm sm:text-base font-bold font-display leading-snug transition-all ${
                        isDone 
                          ? 'line-through text-zinc-400 font-normal' 
                          : 'text-white group-hover:text-amber-300'
                      }`}>
                        {act.title}
                      </h4>

                      {/* Description / Notes */}
                      {act.description && (
                        <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Big Interactive Checkbox & Action Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                    <div className="sm:hidden text-[11px] font-mono text-zinc-400">
                      {isDone ? 'Completed' : 'Tap to complete'}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Big Custom Interactive Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleTaskStatus(act.id, e)}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isDone 
                            ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105' 
                            : isModified
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                            : isMissed
                            ? 'bg-rose-500/20 border-rose-500/60 text-rose-400'
                            : 'bg-zinc-850 border-zinc-700 hover:border-amber-400 text-transparent hover:text-zinc-500'
                        }`}
                        title="Click to check off and record completion time"
                      >
                        {isDone ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : isModified ? (
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : isMissed ? (
                          <X className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Check className="w-4 h-4 stroke-[2] opacity-0 group-hover:opacity-40" />
                        )}
                      </button>

                      {/* Delete icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteActivity(act.id);
                        }}
                        className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* View All / Collapse Button */}
        {nonPrayerActivities.length > 6 && (
          <div className="pt-2 text-center border-t border-zinc-800/60">
            <button
              type="button"
              onClick={() => setIsViewAllExpanded(!isViewAllExpanded)}
              className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>{isViewAllExpanded ? 'Collapse Tasks' : `View All (${nonPrayerActivities.length} Tasks)`}</span>
              {isViewAllExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. DOTTED BUTTON: + ADD NEW ACTIVITY (WITH DETAILS & PHOTOS)               */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={handleOpenAddForm}
        className="w-full py-3.5 rounded-2xl border border-dashed border-purple-500/40 hover:border-purple-400/80 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
      >
        <Plus className="w-4 h-4 text-purple-400" />
        <span>Add Detailed Activity with Photos</span>
      </button>

      {/* ========================================================================= */}
      {/* 7. MODAL: 7-DAY WEEKLY SABHA & SCORE REVIEW (সাপ্তাহিক সভা)                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isWeeklySabhaOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-[#0d0c14] border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
              
              {/* Sabha Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 font-display">
                      ৭ দিনের সাপ্তাহিক পর্যালোচনা সভা (Weekly Sabha)
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      7-Day Comprehensive Review & Tactical Advisory Council
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsWeeklySabhaOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Main Score Gauge & 7-Day Performance Metric */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-500/30 relative overflow-hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      Weekly Execution Score
                    </span>
                    <h4 className="text-2xl font-black text-white font-display mt-0.5">
                      {weeklySabhaData.overallWeekScore}% <span className="text-xs text-zinc-400 font-normal">/ 100%</span>
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                      {sabhaAdvice.grade}
                    </span>
                  </div>
                </div>

                {/* 7-Day Trend Bar Visualizer */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Last 7 Days Consistency</span>
                    <span>{weeklySabhaData.totalCompletedAccum} Tasks Finished</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                    {weeklySabhaData.past7Days.map((d) => (
                      <div key={d.dateStr} className="flex flex-col items-center gap-1">
                        <div className="w-full h-12 bg-zinc-900 rounded-lg p-0.5 flex flex-col justify-end overflow-hidden border border-zinc-800">
                          <div 
                            className={`w-full rounded transition-all duration-500 ${
                              d.score >= 80 ? 'bg-emerald-400' : d.score >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ height: `${Math.max(12, d.score)}%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-mono ${d.isToday ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}>
                          {d.dayName}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-400">
                          {d.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Most Frequently Missed & Best Habits Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Most Missed Tasks */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold uppercase">বেশি মিস হওয়া কাজ (Gaps)</span>
                  </div>
                  {weeklySabhaData.mostMissedList.length > 0 ? (
                    <div className="space-y-1.5">
                      {weeklySabhaData.mostMissedList.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate pr-2">• {m.title}</span>
                          <span className="text-rose-400 font-mono text-[10px] shrink-0">{m.count}x missed</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400">কোনো কাজ বাদ পড়েনি! চমৎকার ধারাবাহিকতা।</p>
                  )}
                </div>

                {/* Best Consistent Habits */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold uppercase">সেরা অভ্যাস (Top Wins)</span>
                  </div>
                  {weeklySabhaData.topWinsList.length > 0 ? (
                    <div className="space-y-1.5">
                      {weeklySabhaData.topWinsList.map((w, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate pr-2">✓ {w.title}</span>
                          <span className="text-emerald-400 font-mono text-[10px] shrink-0">{w.count}x done</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400">নতুন সপ্তাহ শুরু করুন এবং কাজ সম্পন্ন করুন।</p>
                  )}
                </div>
              </div>

              {/* 3. Sabha Council Verdict & Strategic Advice */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <Brain className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    কাউন্সিল পরামর্শ ও সমাধান (Strategic Action Plan)
                  </span>
                </div>
                <p className="text-xs text-zinc-200 font-semibold leading-relaxed">
                  "{sabhaAdvice.verdictHeadline}"
                </p>
                <div className="space-y-1.5 pt-1">
                  {sabhaAdvice.guidanceNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                      <span className="text-amber-400 font-bold">➜</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsWeeklySabhaOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer"
                >
                  পর্যালোচনা সমাপ্ত ও শপথ গ্রহণ
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. MODAL: FULL-SCREEN STANDALONE HOME SCREEN WIDGET & OFFLINE HUB         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isWidgetModeOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 bg-[#08080c] flex flex-col p-4 sm:p-6 overflow-y-auto"
          >
            <div className="w-full max-w-lg mx-auto space-y-5 my-auto py-4">
              
              {/* Top Widget Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                    HOME SCREEN TO-DO WIDGET
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('selfx-open-widget-hub'));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Widgets / Hub</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWidgetModeOpen(false)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Big Interactive Widget Card */}
              <div className="rounded-3xl bg-gradient-to-b from-[#131224] to-[#0c0b16] border-2 border-amber-500/40 p-5 shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-4">
                
                {/* Live Clock & Progress Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                        {liveClockTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30">
                      <span className="text-xl sm:text-2xl font-black text-amber-400 font-display">
                        {stats.progressPercentage}%
                      </span>
                    </div>
                    <span className="block text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                      {stats.completed}/{stats.total} COMPLETED
                    </span>
                  </div>
                </div>

                {/* Progress Bar Line */}
                <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500" 
                    style={{ width: `${stats.progressPercentage}%` }}
                  />
                </div>

                {/* Interactive Big Touch Target To-Do List with Visual Images/Icons */}
                <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
                  {activities.map((act) => {
                    const isDone = dailyStatuses[act.id]?.status === 'completed';
                    const liveTime = dailyStatuses[act.id]?.completedAt;
                    
                    // Determine smart emoji or icon visual
                    let visualIcon = '✨';
                    const prayerInfo = getPrayerTaskInfo(act.title, act.description);
                    const tLower = act.title.toLowerCase();
                    if (prayerInfo) visualIcon = '🕌';
                    else if (tLower.includes('gym') || tLower.includes('workout') || tLower.includes('pushup') || tLower.includes('run')) visualIcon = '💪';
                    else if (tLower.includes('code') || tLower.includes('coding') || tLower.includes('study') || tLower.includes('read') || tLower.includes('book')) visualIcon = '💻';
                    else if (tLower.includes('water') || tLower.includes('drink')) visualIcon = '💧';
                    else if (tLower.includes('sleep') || tLower.includes('night') || tLower.includes('wake')) visualIcon = '🌙';
                    else if (tLower.includes('food') || tLower.includes('diet') || tLower.includes('eat') || tLower.includes('meal')) visualIcon = '🥗';
                    else if (tLower.includes('walk') || tLower.includes('steps')) visualIcon = '🚶';

                    return (
                      <div 
                        key={act.id}
                        onClick={(e) => handleToggleTaskStatus(act.id, e)}
                        className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] group ${
                          isDone 
                            ? 'bg-emerald-950/20 border-emerald-500/35 text-zinc-400' 
                            : 'bg-zinc-900/90 border-zinc-800 text-white hover:border-amber-400/60 hover:bg-zinc-850/90'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Visual Image / Thumbnail / Icon */}
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                            {act.visionImageUrl || act.personalPhotoUrl ? (
                              <img 
                                src={act.personalPhotoUrl || act.visionImageUrl} 
                                alt={act.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">{visualIcon}</span>
                            )}
                            {isDone && (
                              <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-[1px] flex items-center justify-center">
                                <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className={`text-xs sm:text-sm font-bold truncate block ${isDone ? 'line-through text-zinc-500' : 'text-zinc-100 group-hover:text-amber-300'}`}>
                              {act.title}
                            </span>
                            {act.description && (
                              <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">
                                {act.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {liveTime ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                              ✓ {liveTime}
                            </span>
                          ) : act.startTime ? (
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-850">
                              {formatTimeDisplay(act.startTime)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Inline Add inside Widget */}
                <form onSubmit={handleQuickAddTask} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={quickTaskInput}
                    onChange={(e) => setQuickTaskInput(e.target.value)}
                    placeholder="+ Add quick task with image icon..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!quickTaskInput.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-black font-black text-xs rounded-xl cursor-pointer shadow-md transition-all shrink-0"
                  >
                    Add Task
                  </button>
                </form>

              </div>

              {/* Bottom Widget Footer with Offline Guarantee */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-2">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>100% Offline Persistence Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWidgetModeOpen(false)}
                  className="text-amber-400 hover:underline cursor-pointer font-bold"
                >
                  Return to Dashboard ➜
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8.5 WIDGET INSTALL GUIDE POPUP                                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showWidgetInstallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm bg-[#12111d] border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-2xl text-left">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-amber-400">
                  <Smartphone className="w-5 h-5" />
                  <h4 className="text-xs font-black uppercase tracking-wider font-display">
                    হোম স্ক্রীন উইজেট ইনস্টল গাইড
                  </h4>
                </div>
                <button type="button" onClick={() => setShowWidgetInstallModal(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                এই সুন্দর উইজেটটি সবসময় এক ক্লিকে পেতে ফোনের হোম স্ক্রীনে পিন বা শর্টকাট করে নিন:
              </p>

              <div className="space-y-2.5 text-xs text-zinc-300 font-sans">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white block">অ্যাপের ইনস্টল বাটন প্রেস করুন</span>
                    <span className="text-[11px] text-zinc-400">Settings থেকে <strong>"Install App"</strong> বা <strong>"Add to Home Screen"</strong> চাপুন।</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white block">আইকন যুক্ত উইজেট ইন্টারফেস</span>
                    <span className="text-[11px] text-zinc-400">প্রতিটি রুটিনের নামের পাশে প্রিমিয়াম থাম্বনেইল ও ছবি থাকবে যা লাইভ ট্র্যাকিং করবে।</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    const promptEvent = (window as any).deferredPWAInstallPrompt;
                    if (promptEvent) {
                      try {
                        await promptEvent.prompt();
                        const choiceResult = await promptEvent.userChoice;
                        if (choiceResult?.outcome === 'accepted') {
                          (window as any).deferredPWAInstallPrompt = null;
                        }
                      } catch (e) {
                        console.log(e);
                      }
                    }
                    setShowWidgetInstallModal(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4 text-zinc-950 stroke-[3]" />
                  <span>➕ Add to Home Screen (এখনই পিন করুন)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWidgetInstallModal(false)}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold text-xs uppercase rounded-xl cursor-pointer border border-zinc-800 transition-colors"
                >
                  বুঝেছি (Got It)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 9. MODAL: VERTICAL 9:16 FULL-SCREEN ANIMATION PLAYER                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAnimateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4"
          >
            {/* 9:16 Vertical Video Frame */}
            <div className="relative w-full max-w-sm sm:max-w-md h-[90vh] max-h-[840px] rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col justify-between">
              
              {/* Top Controls & Story Progress Bar */}
              <div className="relative z-30 p-4 space-y-3 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
                
                {/* Horizontal Story Progress Bars */}
                <div className="flex items-center gap-1 w-full">
                  {activities.map((_, idx) => (
                    <div key={idx} className="flex-1 h-1 rounded-full bg-zinc-800/80 overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-300"
                        style={{
                          width: idx < currentSlideIndex ? '100%' : idx === currentSlideIndex ? `${slideProgress}%` : '0%'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Top Header inside Vertical Video */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {isRealPhotoActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-mono text-[9px] font-black tracking-wider">
                        📸 REAL PHOTO
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAudioMuted(!isAudioMuted)}
                      className="p-2 rounded-full bg-black/60 text-white hover:text-white border border-white/20 backdrop-blur-md cursor-pointer"
                    >
                      {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnimateModalOpen(false)}
                      className="p-2 rounded-full bg-black/60 text-white hover:text-white border border-white/20 backdrop-blur-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Visual Image Layer with Ultra Smooth Ken Burns Crossfade Effect */}
              <div className="absolute inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  {activeSceneImage ? (
                    <motion.img
                      key={`${currentScene?.id}_${isRealPhotoActive ? 'real' : 'vision'}_${currentSlideIndex}`}
                      src={activeSceneImage}
                      alt={currentScene?.title}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1.08 }}
                      exit={{ opacity: 0, scale: 1.10 }}
                      transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
                      className="w-full h-full object-cover absolute inset-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <motion.div 
                      key={`fallback_${currentSlideIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center absolute inset-0"
                    >
                      <Sunrise className="w-20 h-20 text-white/30" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Gradient Dimming overlay for high text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />
              </div>

              {/* Tap Left / Right Hotspots for Manual Navigation */}
              <div className="absolute inset-y-20 left-0 w-1/3 z-20 cursor-pointer" onClick={() => {
                if (currentSlideIndex > 0) {
                  setCurrentSlideIndex(prev => prev - 1);
                  setSlideProgress(0);
                }
              }} />
              <div className="absolute inset-y-20 right-0 w-1/3 z-20 cursor-pointer" onClick={() => {
                if (currentSlideIndex < activities.length - 1) {
                  setCurrentSlideIndex(prev => prev + 1);
                  setSlideProgress(0);
                } else {
                  setShowFinaleReview(true);
                  setIsPlayingAuto(false);
                }
              }} />

              {/* Center & Bottom Minimalist Display: Clean White Time & Task Name Only */}
              <div className="relative z-30 p-6 flex flex-col items-center justify-end text-center space-y-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`text_${currentScene?.id}_${currentSlideIndex}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-full flex flex-col items-center justify-center space-y-3"
                  >
                    {/* Time Rate: Centered in Clean Crisp White */}
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/25 shadow-xl">
                      <span className="text-white font-mono text-xs sm:text-sm font-bold tracking-widest uppercase drop-shadow-md">
                        {formatTimeDisplay(currentScene?.startTime)} — {formatTimeDisplay(currentScene?.endTime)}
                      </span>
                    </div>

                    {/* Task Title: Pure White, Centered, Bold, No Extra Clutter */}
                    <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] max-w-xs leading-tight">
                      {currentScene?.title}
                    </h2>
                  </motion.div>
                </AnimatePresence>

                {/* Minimalist Controls */}
                <div className="w-full flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAuto(!isPlayingAuto)}
                    className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs font-mono flex items-center gap-2 shadow-2xl hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    {isPlayingAuto ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlayingAuto ? 'PAUSE' : 'PLAY'}</span>
                  </button>
                </div>
              </div>

              {/* Finale Review Modal Overlay (After Video finishes) */}
              <AnimatePresence>
                {showFinaleReview && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute inset-0 z-40 bg-black/95 p-6 flex flex-col justify-between text-left overflow-y-auto"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Award className="w-6 h-6" />
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setIsAnimateModalOpen(false)}
                          className="p-1 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <h3 className="text-xl font-black uppercase text-white font-display">
                        Day Animation Completed!
                      </h3>

                      {/* AI 2-Line Assessment */}
                      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                            AI Executive Summary
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            ⭐ {aiDebrief.rating} / 10
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 font-medium">
                          1. {aiDebrief.line1}
                        </p>
                        <p className="text-xs text-zinc-400 font-medium">
                          2. {aiDebrief.line2}
                        </p>
                      </div>

                      {/* 3 Metric Badges */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-base font-bold text-emerald-400">{stats.completed}</span>
                          <span className="block text-[9px] font-mono text-emerald-300">Done</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                          <span className="text-base font-bold text-amber-400">{stats.modified}</span>
                          <span className="block text-[9px] font-mono text-amber-300">Modified</span>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                          <span className="text-base font-bold text-rose-400">{stats.missed}</span>
                          <span className="block text-[9px] font-mono text-rose-300">Skipped</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <button
                        type="button"
                        onClick={handleStartAnimateDay}
                        className="w-full py-3 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Replay Animation
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAnimateModalOpen(false)}
                        className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs"
                      >
                        Return to Routine
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 10. MODAL: DAILY REVIEW & AI EVALUATION DETAIL DIALOG                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-[#0e0e17] border border-zinc-800 rounded-3xl p-5 space-y-5 shadow-2xl text-left">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/50">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white font-display">
                    DAILY PERFORMANCE & AI EVALUATION
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rating & 2-Line Statement */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                    Daily Scorecard
                  </span>
                  <span className="text-base font-black text-amber-400 font-display">
                    ⭐ {aiDebrief.rating} / 10
                  </span>
                </div>
                <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                  1. {aiDebrief.line1}
                </p>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  2. {aiDebrief.line2}
                </p>
              </div>

              {/* Key Insights List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                  Actionable Feedback for Tomorrow
                </span>
                {aiDebrief.feedback.tomorrow.map((tip, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 11. MODAL: CREATE / EDIT ACTIVITY FORM                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isFormModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-[#0e0e17] border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-white font-display">
                  {editingActivityId ? 'Edit Activity' : 'Add New Activity'}
                </h3>
                <button 
                  type="button" 
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-3.5">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Activity Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Study Time, Workout, Deep Work"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Start & End Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Start Time</label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">End Time</label>
                    <input
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Short Subtitle / Description</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="e.g. Focus on studies and learning"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Upload Pinterest / Vision Image */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">1. Ideal Vision Photo (Pinterest/Gallery)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const compressed = await compressImage(file, 1200, 1200, 0.85);
                      setFormVisionImageUrl(compressed);
                    }}
                    className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-800 file:text-amber-300 hover:file:bg-zinc-700"
                  />
                  {formVisionImageUrl && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-amber-500/40 mt-1">
                      <img src={formVisionImageUrl} alt="Vision" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Upload Real Photo */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">2. Today's Real Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const compressed = await compressImage(file, 1200, 1200, 0.85);
                      setFormPersonalPhotoUrl(compressed);
                    }}
                    className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-800 file:text-emerald-300 hover:file:bg-zinc-700"
                  />
                  {formPersonalPhotoUrl && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-emerald-500/40 mt-1">
                      <img src={formPersonalPhotoUrl} alt="Real" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Save & Delete Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase cursor-pointer"
                  >
                    {editingActivityId ? 'Save Changes' : 'Create Activity'}
                  </button>
                  {editingActivityId && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteActivity(editingActivityId);
                        setIsFormModalOpen(false);
                      }}
                      className="px-3 py-2.5 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400 text-xs hover:bg-rose-900 cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </form>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
