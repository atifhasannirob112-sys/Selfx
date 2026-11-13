import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Calendar, Trash2, CalendarCheck, Image as ImageIcon, Sparkles, Loader2, ArrowRight, Zap, Target, Star, Smile, Award, CheckSquare, Scissors, Copy, Check, Upload, User, ShieldCheck, RefreshCw, HelpCircle, AlertTriangle, Plus, Globe, X, Clock } from 'lucide-react';
import { PhotoEntry } from '../types';
import { triggerNotification, t, getLanguage, setLanguage } from '../utils';
import ChallengeCreator from './ChallengeCreator';
import HairMaxing from './HairMaxing';

// Lightweight IndexedDB helper for saved video clips to completely bypass localStorage quota limits
const openVideosDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lookmax_videos_db_v2', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveVideoToDB = async (video: { id: string; videoBase64: string; thumbnail: string; date: string }) => {
  try {
    const db = await openVideosDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      store.put(video);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("IndexedDB save failed", e);
  }
};

const getVideosFromDB = async (): Promise<{ id: string; videoBase64: string; thumbnail: string; date: string }[]> => {
  try {
    const db = await openVideosDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readonly');
      const store = tx.objectStore('videos');
      const request = store.getAll();
      request.onsuccess = () => {
        const list = request.result || [];
        list.sort((a, b) => b.id.localeCompare(a.id));
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("IndexedDB retrieve failed", e);
    return [];
  }
};

const deleteVideoFromDB = async (id: string) => {
  try {
    const db = await openVideosDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("IndexedDB delete failed", e);
  }
};

function FaceMesh3DOverlay({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    let laserY = 0;
    let laserDir = 1;

    // 3D face mesh node definitions (relative coordinates)
    const rawNodes = [
      // Jawline curve
      { x: -0.6, y: -0.1, z: 0.1 }, { x: -0.5, y: -0.4, z: 0.2 }, { x: -0.3, y: -0.65, z: 0.35 },
      { x: 0, y: -0.75, z: 0.5 }, // Chin tip
      { x: 0.3, y: -0.65, z: 0.35 }, { x: 0.5, y: -0.4, z: 0.2 }, { x: 0.6, y: -0.1, z: 0.1 },
      // Cheekbones & Mid-face
      { x: -0.45, y: 0.0, z: 0.4 }, { x: 0.45, y: 0.0, z: 0.4 },
      // Nose bridge & tip
      { x: 0, y: 0.25, z: 0.45 }, { x: 0, y: 0.0, z: 0.6 }, { x: 0, y: -0.2, z: 0.55 },
      // Eye Orbits
      { x: -0.25, y: 0.2, z: 0.45 }, { x: -0.15, y: 0.2, z: 0.48 }, { x: 0.15, y: 0.2, z: 0.48 }, { x: 0.25, y: 0.2, z: 0.45 },
      // Forehead & hairline
      { x: -0.4, y: 0.5, z: 0.3 }, { x: -0.2, y: 0.6, z: 0.38 }, { x: 0, y: 0.65, z: 0.4 }, { x: 0.2, y: 0.6, z: 0.38 }, { x: 0.4, y: 0.5, z: 0.3 }
    ];

    const render = () => {
      const w = canvas.width = canvas.offsetWidth || 320;
      const h = canvas.height = canvas.offsetHeight || 240;
      ctx.clearRect(0, 0, w, h);

      angle += 0.02;
      laserY += laserDir * 1.8;
      if (laserY > h || laserY < 0) laserDir *= -1;

      const cx = w / 2;
      const cy = h / 2 - 10;
      const scale = Math.min(w, h) * 0.38;

      const cosA = Math.cos(Math.sin(angle) * 0.35);
      const sinA = Math.sin(Math.sin(angle) * 0.35);

      // Project 3D nodes
      const projected = rawNodes.map((n) => {
        const rx = n.x * cosA - n.z * sinA;
        const rz = n.x * sinA + n.z * cosA;
        const perspective = 1 / (1 + rz * 0.4);
        return {
          px: cx + rx * scale * perspective,
          py: cy - n.y * scale * perspective,
          pz: rz,
          perspective
        };
      });

      // Draw wireframe connection lines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      // Connect jawline nodes
      for (let i = 0; i < 6; i++) {
        ctx.moveTo(projected[i].px, projected[i].py);
        ctx.lineTo(projected[i + 1].px, projected[i + 1].py);
      }
      // Connect nose bridge
      ctx.moveTo(projected[9].px, projected[9].py);
      ctx.lineTo(projected[10].px, projected[10].py);
      ctx.lineTo(projected[11].px, projected[11].py);

      // Connect forehead arc
      for (let i = 16; i < 20; i++) {
        ctx.moveTo(projected[i].px, projected[i].py);
        ctx.lineTo(projected[i + 1].px, projected[i + 1].py);
      }
      ctx.stroke();

      // Draw glowing landmark dots
      projected.forEach((p, idx) => {
        const radius = Math.max(2, 3.5 * p.perspective);
        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = idx === 3 ? '#34d399' : '#f59e0b';
        ctx.shadowColor = idx === 3 ? '#10b981' : '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw 3D Laser Scanning Line
      const grad = ctx.createLinearGradient(0, laserY, w, laserY);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, laserY);
      ctx.lineTo(w, laserY);
      ctx.stroke();

      // Laser aura sweep
      ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
      ctx.fillRect(0, Math.max(0, laserY - 15), w, 30);

      // Rotating HUD Reticle Outer Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([8, 12]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (active) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [active]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}

interface PhotoJournalProps {
  duration: 30 | 60 | 90;
  setDuration: (days: 30 | 60 | 90) => void;
  photos: PhotoEntry[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoEntry[]>>;
  onEarnPoints?: (amount: number, reason: string) => void;
  initialSubTab?: 'scanner' | 'model_match' | 'training_roast' | 'hair_maxing' | 'challenge_30' | 'coach';
  challenges?: any[];
  setChallenges?: React.Dispatch<React.SetStateAction<any[]>>;
  habits?: any[];
  water?: any;
  faith?: any;
  alarm?: any;
}

interface FaceScanResult {
  isBlockedNotUser?: boolean;
  isFakeOrNotUser?: boolean;
  fakeScolding?: string;
  isModelOrCelebrity?: boolean;
  detectedModelDetails?: string;
  isPersonMismatch?: boolean;
  personMismatchNotice?: string;
  modelRoast?: string;
  clothingAndVisualProof?: string;
  rating: number;
  ratingVerdict: string;
  flaws: string[];
  positiveTraits: string[];
  adviceList: string[];
  roastBengali?: string;
  girlsPov?: string;
  motivationBengali?: string;
  canAttractCrush?: {
    verdict: 'Yes' | 'No';
    explanation: string;
  };
}

interface ChallengePhoto {
  dayNumber: number;
  imageBase64: string;
  caption: string;
  dateSaved: string;
}

const COACH_GUIDES = [
  {
    id: 'skincare',
    title: 'Skincare Routine',
    tagline: 'Glow & Pore optimization protocols',
    icon: Smile,
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    bullets: [
      { name: 'Daily Cleansing', detail: 'Wash face Morning and Evening with a gentle salicylic cleanser to remove grease and dead cells.' },
      { name: 'Moisturize Correctly', detail: 'Apply light hyaluronic-acid gel to damp skin to trap moisture without blocking facial pores.' },
      { name: 'Anti-Oxidant Defense', detail: 'Apply 3-4 drops of Vitamin C serum every morning to protect skin and clear matching spots.' },
      { name: 'UV Protection (Crucial)', detail: 'Never step out without applying SPF 50 sunscreen. UV rays accelerate aging and worsen scarring.' }
    ],
    englishTip: 'Tip: Always choose a face wash and moisturizer formulated specifically for your skin type (oily, dry, or combination).'
  },
  {
    id: 'haircare',
    title: 'Hair & Scalp Care',
    tagline: 'Density, texture, and root shielding',
    icon: Sparkles,
    color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    bullets: [
      { name: 'Sulfate-Free Wash', detail: 'Cleanse hair 2-3 times a week with sulfate-free growth shampoo. Washing daily drains beneficial oils.' },
      { name: 'Rosemary Oil Magic', detail: 'Massage cold-pressed rosemary oil onto scalp once a week to dilate blood vessels and spur active hair follicles.' },
      { name: 'Condition Tips Only', detail: 'Never put conditioner directly on the scalp. Apply only on hair tips to avoid root damping.' },
      { name: 'Cool Water Finish', detail: 'Avoid extremely hot water washes. Cool water flattens cuticle flakes, boosting natural shine.' }
    ],
    englishTip: 'Tip: Massage cold-pressed coconut or castor oil into your scalp for 5 minutes at least once a week to stimulate hair follicles.'
  },
  {
    id: 'grooming',
    title: 'Grooming & Symmetry',
    tagline: 'Elevating facial structure and jawlines',
    icon: Zap,
    color: 'text-red-400 border-red-500/20 bg-red-500/5',
    bullets: [
      { name: 'Neckline Trimming', detail: 'Shape your beard neckline exactly 1 inch above your Adam’s apple for an immediate, sharp jaw outline.' },
      { name: 'Eyebrow Grooming', detail: 'Remove stray uni-brow hair with small, sanitized tweezers. Sharp brows frame your eyes brilliantly.' },
      { name: 'Lips Hydration', detail: 'Exfoliate lips once a week using a sugar-cinnamon mix, then lock with non-scented petroleum jelly.' },
      { name: 'Fresh Breath Protocol', detail: 'Clean your tongue using a metal tongue-scraper daily to minimize sulfur-producing odor bacteria.' }
    ],
    englishTip: 'Tip: A professionally structured haircut paired with neat clothing creases multiplies your physical presence effortlessly.'
  },
  {
    id: 'fitness',
    title: 'Fitness & Lean Muscle',
    tagline: 'Fat percentages and vascular build',
    icon: Target,
    color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
    bullets: [
      { name: 'Caloric Deficit', detail: 'To reveal sharp cheekbones and jawlines, focus on lowering overall body fat percentage via healthy deficits.' },
      { name: '10K Daily Steps', detail: 'Keep active body circulation. Walking drains body puffiness and delivers fresh nutrients to skin.' },
      { name: 'Neck & Shoulders', detail: 'Train chin tucks and traps. A powerful neck naturally accentuates facial definition.' },
      { name: 'Hydration Volume', detail: 'Drink 3.5+ liters of clean water daily to wash excess sodium out of puffy, swollen facial fat.' }
    ],
    englishTip: 'Tip: Log at least 10,000 steps daily and lower your direct sodium intake to drain stubborn facial retention and puffy cheek syndrome.'
  },
  {
    id: 'posture',
    title: 'Posture & Mewing',
    tagline: 'Orthodontic frame and tongue posture',
    icon: CalendarCheck,
    color: 'text-teal-400 border-teal-500/20 bg-teal-500/5',
    bullets: [
      { name: 'Hard Mewing', detail: 'Rest your entire tongue (including the back part) against the roof of your mouth. Never breathe through your mouth.' },
      { name: 'Neck Retraction', detail: 'Perform chin-tucks against walls to reverse modern "tech-neck" head forward slumps.' },
      { name: 'Chest Out, Traps Down', detail: 'Relax trap muscles, pull shoulder blades back, and align head directly above spine.' },
      { name: 'Chew Hard Foods', detail: 'Chew falafel, carrots, or mastic-gum 20 minutes a day to sculpt strong temporalis and masseter muscles.' }
    ],
    englishTip: 'Tip: Breathe exclusively through your nose. Mouth-breathing alters your skeletal alignment, resulting in a recessed chin and dark under-eye bags.'
  },
  {
    id: 'fashion',
    title: 'Style & Wardrobe',
    tagline: 'Body silhouettes, tailored colors, and fits',
    icon: Award,
    color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    bullets: [
      { name: 'Strict Tailor Fit', detail: 'Buy simple basic pieces and get them custom-fitted by a professional tailor. Fit beats brand names 10x.' },
      { name: 'Neutral Colors First', detail: 'Construct your wardrobe base with solid black, dark navy, white, grey, and camel before buying bold patterns.' },
      { name: 'Contrast Rules', detail: 'Maintain high contrast between upper and lower halves to make yourself look taller and lean.' },
      { name: 'Footwear Dignity', detail: 'Keep shoes spotless and clean. It is the very first detail people glance at.' }
    ],
    englishTip: 'Tip: Perfectly tailored clothing fit is the ultimate secret of modern style. Shun luxury branding nameplates in favor of proportional sizing.'
  },
  {
    id: 'confidence',
    title: 'Eye Contact & Presence',
    tagline: 'Vocal projection and high confidence power',
    icon: Star,
    color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    bullets: [
      { name: 'Unwavering Gaze', detail: 'Hold comfortable eye contact. Look away slowly horizontally, never cast your gaze down.' },
      { name: 'Deep Diaphragm Voice', detail: 'Speak slower, pause on key thoughts, and project your voice from your chest instead of your throat.' },
      { name: 'Open Shield Posture', detail: 'Keep arms uncrossed and chest open. Closed postures signal defensiveness or lower status.' },
      { name: 'Immediate Action Mind', detail: 'When you think of doing something beneficial, count 3-2-1 and act immediately to defeat excuses.' }
    ],
    englishTip: 'Tip: Lock eye contact confidently during social conversations. Looking down signals low-status submission.'
  }
];

export default function PhotoJournal({ 
  duration, 
  setDuration, 
  photos, 
  setPhotos, 
  onEarnPoints, 
  initialSubTab,
  challenges = [],
  setChallenges = () => {},
  habits = [],
  water,
  faith,
  alarm
}: PhotoJournalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'model_match' | 'training_roast' | 'hair_maxing' | 'challenge_30' | 'photo_journal' | 'coach'>('scanner');

  // Hold-to-delete state for photo cards
  const [heldPhotoId, setHeldPhotoId] = useState<string | null>(null);
  const holdTimerRef = useRef<any>(null);

  const handlePhotoPressStart = (photoId: string) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      setHeldPhotoId(photoId);
      triggerNotification("🗑️ ডিলিট অপশন আনলক হয়েছে!", "ছবিটি ডিলিট করতে 'ডিলিট করুন' বাটনে চাপ দিন।");
    }, 500);
  };

  const handlePhotoPressEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Training Roast (ট্রেনিং রোস্ট 🔐) State
  const [isTrainingRoastUnlocked, setIsTrainingRoastUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savedPassword, setSavedPassword] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('training_roast_password_v1');
      return stored || '1234';
    } catch {
      return '1234';
    }
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const defaultCategories = [
    { id: 'fat', name: 'সে মোটা 🐷', icon: '🐷' },
    { id: 'black', name: 'সে কালো 🏿', icon: '🏿' },
    { id: 'skinny', name: 'সে চিকন 🦴', icon: '🦴' },
    { id: 'chubby_cheeks', name: 'গাল ফোলা 🐡', icon: '🐡' },
    { id: 'hair_loss', name: 'টাক মাথা / চুল কম 👨‍🦲', icon: '👨‍🦲' },
    { id: 'dark_circles', name: 'চোখের নিচে কালি 👁️', icon: '👁️' },
    { id: 'general_funny', name: 'সাধারণ ফানি ডায়ালগ 😂', icon: '😂' }
  ];

  const defaultJokes: Record<string, string[]> = {
    fat: [
      "তোকে দেখলে মনে হয় ট্রাফিকের মতো তোর পেটে পুরো একটা মিনিবাস এসে আটকে গেছে! 🚌💥",
      "তোর বডি ফ্যাট দেখে ওয়েট স্কেল ভয়ে থাপ্পড় মেরে নিজেই অফ হয়ে যায়! ⚖️🚨"
    ],
    black: [
      "তোকে দেখে মনে হচ্ছে তুই মোমবাতির আলোয় চোর ধরতে গিয়ে নিজেই কুপি হয়ে গেছিস! 🕯️⚡",
      "রাতে তোকে খুঁজতে ড্রোন ক্যামেরার সাথে নাইট ভিশন চশমা পরা লাগে ভাই! 🕶️🌙"
    ],
    skinny: [
      "তোর হাড্ডি আর মাংসের যে সাইজ, ঝোড়ো বাতাস আসলে তোকে সুতা দিয়ে বেঁধে রাখা দরকার! 🪁💨",
      "তোর এক্সরে প্লেট দেখলে ডাক্তার ভাবে কঙ্কালের কার্টুন ছবি আঁকা হইছে! 🦴💀"
    ],
    chubby_cheeks: [
      "তোর গালে দুইপাশে মনে হয় দুটো গোল রসগোল্লা একসাথে মুখ ভরে গিলে রাখিস! 🐡🍬",
      "তোর গাল ফুলা দেখে কাঠবিড়ালি ভাবে তুই দুই গালে বাদাম জমাইয়া রাখছিস! 🐿️🥜"
    ],
    hair_loss: [
      "তোর মাথায় চুলের চেয়ে আয়নার মতো রিফ্লেকশন বেশি মারতেছে! ☀️👨‍🦲",
      "তোর মাথায় মাছি বসলে মনে হয় ফ্লাইওভারের ওপর গ্লাইড মারতেছে! 🛫🪰"
    ],
    dark_circles: [
      "চোখের নিচে যে ডার্ক সার্কেল, মনে হচ্ছে সারা রাত বসে বিশ্বযুদ্ধের স্ট্র্যাটেজি বানাচ্ছিস! 💀😴"
    ],
    general_funny: [
      "কিরে ভাই! ক্যামেরার দিকে এমন মুখ করে আছিস যেন ক্যামেরাটা তোর কাছে টাকা ধার নিয়ে পালাইছে! 🤣📸",
      "তোর এই এক্সপ্রেশন দেখে তো মনে হচ্ছে ইন্টারভিউ বোর্ডে ঢুকে নিজেই বলতেছিস—'চাকরি লাগবে না ভাই, ছেড়ে দেন!' 💀😂"
    ]
  };

  const [roastCategories, setRoastCategories] = useState<{ id: string; name: string; icon?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('lookmax_custom_training_roasts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.categories && Array.isArray(parsed.categories)) return parsed.categories;
      }
    } catch (e) {}
    return defaultCategories;
  });

  const [roastJokesMap, setRoastJokesMap] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('lookmax_custom_training_roasts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.jokes && typeof parsed.jokes === 'object') return parsed.jokes;
      }
    } catch (e) {}
    return defaultJokes;
  });

  const [selectedTrainingCategory, setSelectedTrainingCategory] = useState<string>('fat');
  const [newJokeInput, setNewJokeInput] = useState<string>('');
  const [newCategoryNameInput, setNewCategoryNameInput] = useState<string>('');
  const [showAddCategoryForm, setShowAddCategoryForm] = useState<boolean>(false);

  // Sync Training Roasts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lookmax_custom_training_roasts_v1', JSON.stringify({
        password: savedPassword,
        categories: roastCategories,
        jokes: roastJokesMap
      }));
    } catch (e) {
      console.error("Failed to save custom training roasts:", e);
    }
  }, [savedPassword, roastCategories, roastJokesMap]);

  const handleUnlockTrainingRoast = () => {
    if (passwordInput.trim() === savedPassword) {
      setIsTrainingRoastUnlocked(true);
      setPasswordError(null);
      setPasswordInput('');
      triggerNotification("🔓 Training Roast Unlocked", "You now have full access to custom roast jokes & categories!");
    } else {
      setPasswordError("ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।");
    }
  };

  const handleAddJokeToCategory = () => {
    if (!newJokeInput.trim()) return;
    const jokeText = newJokeInput.trim();
    setRoastJokesMap(prev => {
      const currentList = prev[selectedTrainingCategory] || [];
      const updated = [...currentList, jokeText];
      return { ...prev, [selectedTrainingCategory]: updated };
    });
    setNewJokeInput('');
    triggerNotification("🎯 Roast Joke Saved", "আপনার নতুন রোস্ট জোক সফলভাবে সেভ করা হয়েছে!");
  };

  const handleDeleteJokeFromCategory = (categoryKey: string, index: number) => {
    setRoastJokesMap(prev => {
      const currentList = prev[categoryKey] || [];
      const updated = currentList.filter((_, i) => i !== index);
      return { ...prev, [categoryKey]: updated };
    });
    triggerNotification("🗑️ Joke Deleted", "জোকটি মুছে ফেলা হয়েছে।");
  };

  const handleAddNewCategory = () => {
    if (!newCategoryNameInput.trim()) return;
    const catName = newCategoryNameInput.trim();
    const newId = 'custom_' + Date.now();
    const newCatObj = { id: newId, name: catName + ' 🎭', icon: '🎭' };
    setRoastCategories(prev => [...prev, newCatObj]);
    setRoastJokesMap(prev => ({ ...prev, [newId]: [] }));
    setSelectedTrainingCategory(newId);
    setNewCategoryNameInput('');
    setShowAddCategoryForm(false);
    triggerNotification("➕ New Category Added", `নতুন ক্যাটাগরি "${catName}" যুক্ত করা হয়েছে!`);
  };

  const handleChangePassword = () => {
    if (!newPasswordValue.trim()) return;
    const updatedPass = newPasswordValue.trim();
    setSavedPassword(updatedPass);
    localStorage.setItem('training_roast_password_v1', updatedPass);
    setIsChangingPassword(false);
    setNewPasswordValue('');
    triggerNotification("🔑 Password Changed", "Training Roast পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!");
  };
  const [chosenCoachCategory, setChosenCoachCategory] = useState<string>('skincare');
  const [dragActive, setDragActive] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [secScanPhoto, setSecScanPhoto] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiScanElapsedSeconds, setAiScanElapsedSeconds] = useState<number>(0);
  const [aiScanProgressPercent, setAiScanProgressPercent] = useState<number>(0);

  useEffect(() => {
    let timerInterval: any = null;
    let progressInterval: any = null;

    if (isAiLoading) {
      setAiScanElapsedSeconds(0);
      setAiScanProgressPercent(12);

      const startTime = Date.now();
      timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setAiScanElapsedSeconds(elapsed);
      }, 100);

      progressInterval = setInterval(() => {
        setAiScanProgressPercent((prev) => {
          if (prev < 45) return prev + 3.5;
          if (prev < 72) return prev + 2.2;
          if (prev < 88) return prev + 1.2;
          if (prev < 98) return prev + 0.3;
          return 98.5;
        });
      }, 200);
    } else {
      setAiScanElapsedSeconds(0);
      setAiScanProgressPercent(0);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isAiLoading]);
  const [scanResult, setScanResult] = useState<FaceScanResult | null>(null);
  const [lookmaxSubTab, setLookmaxSubTab] = useState<'analysis' | 'roast' | 'girls_pov' | 'traits' | 'crush' | 'advice' | 'motivation' | 'hair_maxing'>('roast');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Master Registered User Face Lock
  const [registeredUserFace, setRegisteredUserFace] = useState<string | null>(() => {
    try {
      const savedFace = localStorage.getItem('selfx_registered_user_face');
      if (savedFace && savedFace.length > 50) return savedFace;
      if (photos && photos.length > 0 && photos[0]?.imageBase64 && photos[0].imageBase64.length > 50) {
        return photos[0].imageBase64;
      }
      const savedProfile = localStorage.getItem('lookmax_user_profile_v2');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.avatarBase64 && parsed.avatarBase64.length > 50) return parsed.avatarBase64;
      }
    } catch (e) {}
    return null;
  });

  const handleResetRegisteredFace = (newFaceBase64?: string) => {
    if (newFaceBase64) {
      setRegisteredUserFace(newFaceBase64);
      try {
        localStorage.setItem('selfx_registered_user_face', newFaceBase64);
      } catch (e) {}
      triggerNotification("✅ চেহারা আপডেট সম্পন্ন", "নতুন ছবিটিকে আপনার নিজস্ব আসল চেহারা হিসেবে সেট করা হয়েছে।");
    } else {
      setRegisteredUserFace(null);
      try {
        localStorage.removeItem('selfx_registered_user_face');
      } catch (e) {}
      triggerNotification("🔄 চেহারা রিসেট হয়েছে", "এবার আপনার নতুন নিজস্ব সেলফি তুলুন।");
    }
  };

  // 10-Second Live Camera Scan State ("ব্যাক ক্যামেরার মাধ্যমে পুরো মুখ ঘুরিয়ে ১০ সেকেন্ড লাইভ স্ক্যান")
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [liveScanTimer, setLiveScanTimer] = useState(10);
  const [liveScanStructured, setLiveScanStructured] = useState<any>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);

  // 10-Second Video Recording states and references
  const mediaRecorderRef = useRef<any>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const [savedVideos, setSavedVideos] = useState<{ id: string; videoBase64: string; thumbnail: string; date: string }[]>([]);
  const [activePlaybackVideo, setActivePlaybackVideo] = useState<string | null>(null);

  const [currentLang, setCurrentLang] = useState<'normal' | 'english'>(getLanguage());

  useEffect(() => {
    // Load saved videos from IndexedDB
    const loadVideos = async () => {
      const list = await getVideosFromDB();
      // Safe migration from localStorage if any
      try {
        const saved = localStorage.getItem('lookmax_saved_live_videos');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            for (const v of parsed) {
              if (!list.some(item => item.id === v.id)) {
                await saveVideoToDB(v);
                list.push(v);
              }
            }
            localStorage.removeItem('lookmax_saved_live_videos');
          }
        }
      } catch (err) {}
      setSavedVideos(list);
    };
    loadVideos();

    // Listen to global language change events
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

  // 10-Second Live Scan analysis states
  const [isLiveScanAnalyzing, setIsLiveScanAnalyzing] = useState(false);
  const [liveScanAnalyzeProgress, setLiveScanAnalyzeProgress] = useState(0);
  const [liveScanResultText, setLiveScanResultText] = useState<string | null>(null);

  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('lookmax_user_profile_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed.name;
      }
      const ap = localStorage.getItem('selfx_current_user_profile');
      if (ap) {
        const parsed = JSON.parse(ap);
        if (parsed && parsed.name) return parsed.name;
      }
    } catch (e) {
      console.warn("Failed to retrieve username for live scan assessment, defaulting", e);
    }
    return 'দোস্ত';
  });

  const [isTranslatingScan, setIsTranslatingScan] = useState(false);

  // Auto-translate existing scan result whenever language changes
  useEffect(() => {
    if (!scanResult || isTranslatingScan || isAiLoading) return;
    const hasBengaliChars = (text: string) => /[\u0980-\u09FF]/.test(text);
    const isTargetEnglish = currentLang === 'english';
    
    // Check if the current scan is in Bengali
    const scanIsBengali = 
      hasBengaliChars(scanResult.roastBengali || '') ||
      hasBengaliChars(scanResult.ratingVerdict || '') ||
      (scanResult.flaws && scanResult.flaws.some((f: string) => hasBengaliChars(f)));

    // Needs translation if target is English but report is Bengali, OR target is Bengali but report is English
    const needsTranslation = isTargetEnglish ? scanIsBengali : !scanIsBengali;
    if (needsTranslation) {
      const translateCurrentScan = async () => {
        setIsTranslatingScan(true);
        try {
          const res = await fetch("/api/lookmax/translate-result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scanResult,
              targetLang: currentLang
            })
          });
          if (res.ok) {
            const translated = await res.json();
            setScanResult(translated);
          }
        } catch (e) {
          console.error("Auto scan translation error:", e);
        } finally {
          setIsTranslatingScan(false);
        }
      };
      translateCurrentScan();
    }
  }, [currentLang]);

  const startLiveCameraScan = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      triggerNotification("⚠️ Camera API Error", "তোর ব্রাউজার বা সংযোগটি লাইভ ক্যামেরা স্ক্যান সাপোর্ট করে না। দয়া করে ছবি আপলোড কর দোস্ত!");
      alert("তোর ব্রাউজার বা সংযোগটি লাইভ ক্যামেরা স্ক্যান সাপোর্ট করে না। দয়া করে গ্যালারি থেকে ছবি আপলোড কর দোস্ত!");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      liveStreamRef.current = stream;
      setIsLiveScanning(true);
      setLiveScanTimer(10);

      // Initialize MediaRecorder for 10-second recording
      try {
        videoChunksRef.current = [];
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        } catch (e) {
          recorder = new MediaRecorder(stream);
        }
        
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            videoChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          if (videoChunksRef.current.length > 0) {
            const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Video = reader.result as string;
              
              // Synchronously capture a thumbnail frame
              let thumb = '';
              if (liveVideoRef.current) {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = 160;
                  canvas.height = 120;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(liveVideoRef.current, 0, 0, canvas.width, canvas.height);
                    thumb = canvas.toDataURL('image/jpeg', 0.5);
                  }
                } catch (err) {}
              }

              const newVideo = {
                id: 'video_' + Date.now(),
                videoBase64: base64Video,
                thumbnail: thumb || '',
                date: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('bn-BD')
              };

              setSavedVideos(prev => {
                const updated = [newVideo, ...prev].slice(0, 4); // Keep last 4 to preserve quota
                saveVideoToDB(newVideo);
                return updated;
              });
            };
            reader.readAsDataURL(blob);
          }
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
      } catch (recErr) {
        console.warn("Failed to start media recorder:", recErr);
      }

      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play();
        }
      }, 100);
    } catch (err) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        liveStreamRef.current = stream;
        setIsLiveScanning(true);
        setLiveScanTimer(10);

        // Initialize MediaRecorder for 10-second recording
        try {
          videoChunksRef.current = [];
          let recorder: MediaRecorder;
          try {
            recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          } catch (e) {
            recorder = new MediaRecorder(stream);
          }
          
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              videoChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            if (videoChunksRef.current.length > 0) {
              const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Video = reader.result as string;
                
                let thumb = '';
                if (liveVideoRef.current) {
                  try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 160;
                    canvas.height = 120;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(liveVideoRef.current, 0, 0, canvas.width, canvas.height);
                      thumb = canvas.toDataURL('image/jpeg', 0.5);
                    }
                  } catch (err) {}
                }

                const newVideo = {
                  id: 'video_' + Date.now(),
                  videoBase64: base64Video,
                  thumbnail: thumb || '',
                  date: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('bn-BD')
                };

                setSavedVideos(prev => {
                  const updated = [newVideo, ...prev].slice(0, 4);
                  saveVideoToDB(newVideo);
                  return updated;
                });
              };
              reader.readAsDataURL(blob);
            }
          };

          mediaRecorderRef.current = recorder;
          recorder.start();
        } catch (recErr) {
          console.warn("Failed to start media recorder fallback:", recErr);
        }

        setTimeout(() => {
          if (liveVideoRef.current) {
            liveVideoRef.current.srcObject = stream;
            liveVideoRef.current.play();
          }
        }, 100);
      } catch (fallbackErr) {
        alert("ক্যামেরা অন করা যায়নি! অনুগ্রহ করে আপনার ব্রাউজারে ক্যামেরা পারমিশন এলাউ করুন।");
      }
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isLiveScanning && liveScanTimer > 0) {
      interval = setInterval(() => {
        setLiveScanTimer(prev => prev - 1);
      }, 1000);
    } else if (isLiveScanning && liveScanTimer === 0) {
      captureLiveSnapshotAndAnalyze();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveScanning, liveScanTimer]);

  const triggerLiveScanAnalysis = async (base64: string) => {
    setIsLiveScanAnalyzing(true);
    setLiveScanResultText(null);
    setLiveScanStructured(null);
    setLiveScanAnalyzeProgress(0);
    setScannerError(null);

    let apiResultText: string | null = null;
    let apiStructured: any = null;
    let apiCompleted = false;

    fetch('/api/lookmax/live-scan-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        userName: currentUserName,
        lang: getLanguage()
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          apiResultText = data.analysis;
          apiStructured = data.structured;
        } else {
          apiResultText = t("বিশ্লেষণ করা যায়নি দোস্ত, আবার চেষ্টা কর!", "Analysis failed, buddy. Please try again!");
        }
        apiCompleted = true;
      })
      .catch(err => {
        console.error("Live scan analyze error:", err);
        apiResultText = t("সার্ভার এরর! দয়া করে আবার চেষ্টা কর দোস্ত।", "Server error! Please try again, buddy.");
        apiCompleted = true;
      });

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 1;
      setLiveScanAnalyzeProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        
        const checkCompletion = setInterval(() => {
          if (apiCompleted) {
            clearInterval(checkCompletion);
            setLiveScanResultText(apiResultText || "বিশ্লেষণ সম্পন্ন হয়েছে!");
            setLiveScanStructured(apiStructured);
            setIsLiveScanAnalyzing(false);
            if (onEarnPoints) {
              onEarnPoints(15, "Completed a 10-second deep Looksmaxing Live Scan!");
            }
          }
        }, 100);
      }
    }, 300);
  };

  const captureLiveSnapshotAndAnalyze = () => {
    if (liveVideoRef.current) {
      const video = liveVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = (video.videoHeight / (video.videoWidth || 1)) * 500 || 500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setSecScanPhoto(base64);
        
        // Stop recording properly
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          try {
            mediaRecorderRef.current.stop();
          } catch (e) {}
        }
        
        stopLiveCamera();
        triggerLiveScanAnalysis(base64);
      }
    } else {
      stopLiveCamera();
    }
  };

  const stopLiveCamera = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach(t => t.stop());
      liveStreamRef.current = null;
    }
    setIsLiveScanning(false);
  };

  // Model Target Match state ("আমি এই মডেলের মতো হতে চাই")
  const [modelPhoto, setModelPhoto] = useState<string | null>(null);
  const [userModelMatchPhoto, setUserModelMatchPhoto] = useState<string | null>(null);
  const [isModelMatchLoading, setIsModelMatchLoading] = useState<boolean>(false);
  const [modelMatchError, setModelMatchError] = useState<string | null>(null);
  const [modelMatchResult, setModelMatchResult] = useState<any>(null);

  const modelFileInputRef = useRef<HTMLInputElement>(null);
  const userModelMatchFileInputRef = useRef<HTMLInputElement>(null);

  const handleModelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setModelPhoto(compressed);
          triggerModelMatchApi(compressed, userModelMatchPhoto);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUserModelMatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setUserModelMatchPhoto(compressed);
          if (modelPhoto) {
            triggerModelMatchApi(modelPhoto, compressed);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerModelMatchApi = async (mPhoto: string, uPhoto: string | null) => {
    setIsModelMatchLoading(true);
    setModelMatchError(null);
    try {
      const res = await fetch("/api/lookmax/model-target-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelPhotoBase64: mPhoto,
          userPhotoBase64: uPhoto
        })
      });
      if (!res.ok) {
        throw new Error("Failed to analyze target model photo.");
      }
      const data = await res.json();
      setModelMatchResult(data);
      triggerNotification("🎯 Target Model Analyzed", "Model aesthetic profile and transformation roadmap generated!");
    } catch (err: any) {
      console.error(err);
      setModelMatchError(err.message || "Failed to analyze model photo.");
    } finally {
      setIsModelMatchLoading(false);
    }
  };

  // Redesigned Analysis Section - Daily Self-Improvement Dashboard State
  const [dailyDashboard, setDailyDashboard] = useState<{
    prayers: boolean;
    habits: boolean;
    selfie: boolean;
    movie: boolean;
    youtube: boolean;
    gym: boolean;
    water: boolean;
    streak: number;
    lastDate: string;
  }>(() => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const saved = localStorage.getItem('selfx_daily_dashboard_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastDate === today) {
          return { water: false, ...parsed };
        } else {
          return {
            prayers: false,
            habits: false,
            selfie: false,
            movie: false,
            youtube: false,
            gym: false,
            water: false,
            streak: parsed.streak ? parsed.streak + 1 : 1,
            lastDate: today
          };
        }
      }
    } catch (e) {}
    return {
      prayers: false,
      habits: false,
      selfie: false,
      movie: false,
      youtube: false,
      gym: false,
      water: false,
      streak: 5,
      lastDate: today
    };
  });

  const [analysisFilter, setAnalysisFilter] = useState<'all' | 'pending' | 'done'>('all');

  useEffect(() => {
    try {
      localStorage.setItem('selfx_daily_dashboard_state_v1', JSON.stringify(dailyDashboard));
    } catch (e) {}
  }, [dailyDashboard]);

  // Hair Maxing state variables
  const [selectedHairType, setSelectedHairType] = useState<string>('straight');
  const [hairConcerns, setHairConcerns] = useState<string[]>([]);
  const [hairPhoto, setHairPhoto] = useState<string | null>(null);
  const [hairAnalysisLoading, setHairAnalysisLoading] = useState(false);
  const [hairAnalysisResult, setHairAnalysisResult] = useState<{
    score: number;
    verdict: string;
    flaws: string[];
    strengths: string[];
    routine: { title: string; desc: string; icon: string }[];
  } | null>(null);

  // 30-Day Photo Challenge states
  const [challengePhotos, setChallengePhotos] = useState<ChallengePhoto[]>(() => {
    try {
      const saved = localStorage.getItem('30day_challenge_photos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ACTIVE DYNAMIC LOOKSMAXING CHALLENGE STATE
  const [activeChallenge, setActiveChallenge] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('active_looksmax_challenge_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [creatorDuration, setCreatorDuration] = useState<number>(30);
  const [creatorTasks, setCreatorTasks] = useState<string[]>([
    "Mewing jaw alignment",
    "Skincare & SPF protection",
    "Face ice & Cold shower",
    "Correct posture alignment",
    "Chewing exercise & jaw training"
  ]);
  const [customTaskInput, setCustomTaskInput] = useState<string>('');

  const handleAddCustomTask = () => {
    if (customTaskInput.trim()) {
      setCreatorTasks(prev => [...prev, customTaskInput.trim()]);
      setCustomTaskInput('');
    }
  };

  const handleToggleCreatorTask = (task: string) => {
    setCreatorTasks(prev => 
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const handleLaunchChallenge = () => {
    if (creatorTasks.length === 0) {
      triggerNotification("Selection Required", "Please select at least 1 task or habit to begin, champion!", true);
      return;
    }
    const newChallenge = {
      duration: creatorDuration,
      tasks: creatorTasks,
      startDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      progress: {}
    };
    setActiveChallenge(newChallenge);
    localStorage.setItem('active_looksmax_challenge_v2', JSON.stringify(newChallenge));
    if (onEarnPoints) {
      onEarnPoints(100, "Looksmax challenge started successfully! 🎯"); // bonus 100 points
    }
  };

  const handleResetChallenge = () => {
    if (window.confirm("Are you sure you want to reset your ongoing Glow-up Challenge? All your progress will be cleared!")) {
      setActiveChallenge(null);
      localStorage.removeItem('active_looksmax_challenge_v2');
    }
  };

  const handleToggleTaskForDay = (dayNum: number, task: string) => {
    if (!activeChallenge) return;
    
    setActiveChallenge((prev: any) => {
      if (!prev) return null;
      const dayProgress = prev.progress[dayNum] || { completedTasks: [] };
      const completed = dayProgress.completedTasks.includes(task)
        ? dayProgress.completedTasks.filter((t: string) => t !== task)
        : [...dayProgress.completedTasks, task];
        
      const updatedProgress = {
        ...prev.progress,
        [dayNum]: {
          ...dayProgress,
          completedTasks: completed
        }
      };
      
      const updated = {
        ...prev,
        progress: updatedProgress
      };
      localStorage.setItem('active_looksmax_challenge_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCompleteAllTasksForDay = (dayNum: number) => {
    if (!activeChallenge) return;
    setActiveChallenge((prev: any) => {
      if (!prev) return null;
      const dayProgress = prev.progress[dayNum] || { completedTasks: [] };
      const allCompleted = dayProgress.completedTasks.length === prev.tasks.length;
      const completed = allCompleted ? [] : [...prev.tasks];
      
      const updatedProgress = {
        ...prev.progress,
        [dayNum]: {
          ...dayProgress,
          completedTasks: completed
        }
      };
      
      const updated = {
        ...prev,
        progress: updatedProgress
      };
      localStorage.setItem('active_looksmax_challenge_v2', JSON.stringify(updated));
      return updated;
    });

    if (onEarnPoints) {
      onEarnPoints(30, `Completed all tasks for Day ${dayNum}! ⚡`);
    }
  };

  const handleSaveChallengeDaySelfie = (dayNum: number, file: File, captionText: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Error: Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setActiveChallenge((prev: any) => {
            if (!prev) return null;
            const dayProgress = prev.progress[dayNum] || { completedTasks: [] };
            const updatedProgress = {
              ...prev.progress,
              [dayNum]: {
                ...dayProgress,
                selfieBase64: compressedBase64,
                caption: captionText || `Day ${dayNum} progress secured!`,
                dateSaved: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              }
            };
            const updated = {
              ...prev,
              progress: updatedProgress
            };
            localStorage.setItem('active_looksmax_challenge_v2', JSON.stringify(updated));
            return updated;
          });

          if (onEarnPoints) {
            onEarnPoints(50, `Looksmax challenge Day ${dayNum} selfie saved! 📸`);
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const [selectedDayForUpload, setSelectedDayForUpload] = useState<number | null>(null);
  const [tempCaption, setTempCaption] = useState('');
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null);
  const tempFileInputRef = useRef<HTMLInputElement>(null);

  // Compress challenge photo helper
  const handleChallengePhotoUpload = (dayNum: number, file: File, captionText: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Error: Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setChallengePhotos(prev => {
            const updated = prev.filter(p => p.dayNumber !== dayNum);
            const newPhoto: ChallengePhoto = {
              dayNumber: dayNum,
              imageBase64: compressedBase64,
              caption: captionText || `Day ${dayNum} progress secured!`,
              dateSaved: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            };
            const result = [...updated, newPhoto].sort((a,b) => a.dayNumber - b.dayNumber);
            localStorage.setItem('30day_challenge_photos', JSON.stringify(result));
            return result;
          });
          
          triggerNotification("🏆 Day Progress Locked", `Day ${dayNum} image saved successfully! Keep the streak alive!`);
          if (onEarnPoints) {
            onEarnPoints(40, `Day ${dayNum} challenge photo milestone secured! 📸`);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleTempFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTempImageFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setTempImagePreview(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChallengeDay = () => {
    if (!selectedDayForUpload || !tempImageFile) {
      alert("Please choose a progress photo first!");
      return;
    }
    handleChallengePhotoUpload(selectedDayForUpload, tempImageFile, tempCaption);
    handleSaveChallengeDaySelfie(selectedDayForUpload, tempImageFile, tempCaption);
    setSelectedDayForUpload(null);
    setTempCaption('');
    setTempImageFile(null);
    setTempImagePreview(null);
  };

  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayStr();
  const hasUploadedToday = photos.some(p => p.date === todayStr);

  // Resize and compress uploaded image to prevent local storage quota limit overflow (~5MB max)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Error: Please upload a valid image file');
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scale = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          
          // Trigger face analysis & biometric verification FIRST before saving to journal
          setSecScanPhoto(dataUrl);
          triggerFaceAnalysisApi(dataUrl, true);
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        alert("Error: Failed to process selection");
        setIsCompressing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Process image for instant face rating scan
  const handleScanFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setSecScanPhoto(compressedBase64);
          triggerFaceAnalysisApi(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerFaceAnalysisApi = async (imageBase64: string, isJournalUpload: boolean = false) => {
    setIsAiLoading(true);
    setScannerError(null);
    setScanResult(null);
    setLookmaxSubTab('analysis');

    try {
      // Fetch the Love Angel crush details from localStorage if they exist
      let loveAngelContext = null;
      try {
        const saved = localStorage.getItem('lookmax_crush_list_v2');
        if (saved) {
          const crushes = JSON.parse(saved);
          // find the preferred crush
          const preferred = crushes.find((c: any) => c && (c.status === 'GF/BF' || c.status === 'Secret Love' || c.status === 'Crush')) || crushes[0];
          if (preferred) {
            loveAngelContext = {
              name: preferred.name,
              status: preferred.status,
              personality: preferred.personality,
              currentSituation: preferred.currentSituation,
              address: preferred.address,
              arabicOilOption: preferred.arabicOilOption,
              details: preferred.details,
              image: preferred.image
            };
          }
        }
      } catch (e) {
        console.error("Failed to read love angel context for lookmax:", e);
      }

      let customRoastTraining = null;
      try {
        const savedRoastData = localStorage.getItem('lookmax_custom_training_roasts_v1');
        if (savedRoastData) {
          customRoastTraining = JSON.parse(savedRoastData);
        }
      } catch (e) {}

      const previousPhoto = photos && photos.length > 0 ? (photos.find(p => p.imageBase64 !== imageBase64) || photos[0]) : null;
      const previousImageBase64 = previousPhoto ? previousPhoto.imageBase64 : null;

      let userName = "দোস্ত";
      try {
        const savedProfile = localStorage.getItem('lookmax_user_profile_v2');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed && parsed.name) {
            userName = parsed.name;
          }
        }
      } catch (e) {}

      let pastRoasts: string[] = [];
      try {
        const savedRoasts = localStorage.getItem('lookmax_generated_roasts_v1');
        if (savedRoasts) {
          pastRoasts = JSON.parse(savedRoasts);
        }
      } catch (e) {}

      let pastGirlsPov: string[] = [];
      try {
        const savedGirlsPov = localStorage.getItem('lookmax_generated_girlspov_v1');
        if (savedGirlsPov) {
          pastGirlsPov = JSON.parse(savedGirlsPov);
        }
      } catch (e) {}

      const res = await fetch("/api/lookmax/rate-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageBase64, 
          loveAngelContext, 
          registeredFaceBase64: registeredUserFace,
          previousImageBase64: registeredUserFace || previousImageBase64,
          customRoastTraining,
          userName,
          pastRoasts,
          pastGirlsPov,
          lang: currentLang
        }),
      });

      if (!res.ok) {
        throw new Error("Lookmaxing server declined! Try a cleaner selfie picture with good lighting.");
      }

      const data = await res.json();
      setScanResult(data);

      // If biometric mismatch or model/stranger detected: HALT & BLOCK!
      if (data.isBlockedNotUser || data.isPersonMismatch) {
        triggerNotification("🛑 চেহারা অমিল!", "এটি আপনার চেহারা নয়! অন্য কারো বা মডেলের ছবি দিয়ে লুকম্যাক্স কাজ করবে না।");
        return;
      }

      // If this is the user's first real face scan, register it as their authenticated face
      if (!registeredUserFace && !data.isModelOrCelebrity && !data.isFakeOrNotUser) {
        setRegisteredUserFace(imageBase64);
        try {
          localStorage.setItem('selfx_registered_user_face', imageBase64);
        } catch (e) {}
      }

      // Only save to daily diary if this photo was verified as the authenticated user!
      if (isJournalUpload) {
        setPhotos(prev => {
          const filtered = prev.filter(p => p.date !== todayStr);
          const updated = [
            {
              id: crypto.randomUUID(),
              date: todayStr,
              imageBase64
            },
            ...filtered
          ];
          triggerNotification("📸 Selfie Journal Saved", "Successfully uploaded verified selfie for today!");
          if (onEarnPoints) {
            onEarnPoints(35, "Daily Selfie Journal Entry secured! 📸");
          }
          return updated;
        });
      }

      if (data.roastBengali) {
        try {
          const currentRoastsRaw = localStorage.getItem('lookmax_generated_roasts_v1');
          const currentRoasts = currentRoastsRaw ? JSON.parse(currentRoastsRaw) : [];
          if (!currentRoasts.includes(data.roastBengali)) {
            const updatedRoasts = [data.roastBengali, ...currentRoasts].slice(0, 25);
            localStorage.setItem('lookmax_generated_roasts_v1', JSON.stringify(updatedRoasts));
          }
        } catch (e) {
          console.error("Failed to update lookmax_generated_roasts_v1 in localStorage", e);
        }
      }

      if (data.girlsPov) {
        try {
          const currentGirlsRaw = localStorage.getItem('lookmax_generated_girlspov_v1');
          const currentGirls = currentGirlsRaw ? JSON.parse(currentGirlsRaw) : [];
          if (!currentGirls.includes(data.girlsPov)) {
            const updatedGirls = [data.girlsPov, ...currentGirls].slice(0, 25);
            localStorage.setItem('lookmax_generated_girlspov_v1', JSON.stringify(updatedGirls));
          }
        } catch (e) {
          console.error("Failed to update lookmax_generated_girlspov_v1 in localStorage", e);
        }
      }

      triggerNotification("✨ Lookmax Analysis Complete", `Your score is ${data.rating}/10! Let's work on the flaws.`);

      // Automatically add this verified selfie to the 30/60/90 days challenge progress diary!
      setPhotos(prev => {
        const filtered = prev.filter(p => p.date !== todayStr);
        return [
          {
            id: crypto.randomUUID(),
            date: todayStr,
            imageBase64: imageBase64
          },
          ...filtered
        ];
      });
      triggerNotification("📸 Challenge Photo Synced", "This selfie has been registered for your 30-day Lookmax challenge.");

    } catch (err: any) {
      console.error(err);
      setScannerError(err.message || "Something went sleepy in looking database.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDeletePhoto = (id: string, date: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    triggerNotification("Photo Deleted", `Removed progress picture from ${date}`);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const triggerScanUploadClick = () => {
    scanInputRef.current?.click();
  };

  const formatPhotoDate = (dStr: string) => {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div id="photo-journal-sec" className="space-y-6">
      
      {/* OUTER LEVEL HUB NAV SELECTOR */}
      <div className="bg-[#121214] p-2 rounded-2xl border border-zinc-800 shadow-2xl space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            onClick={() => setActiveSubTab('scanner')}
            className={`py-3.5 px-3 text-xs uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'scanner'
                ? 'bg-zinc-900 text-gold-400 border border-gold-500/40 shadow-lg shadow-gold-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Camera className="w-4 h-4 text-gold-400" />
            <span>SELFIE ANALYZER 📸</span>
          </button>
          <button
            onClick={() => setActiveSubTab('model_match')}
            className={`py-3.5 px-3 text-xs uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'model_match'
                ? 'bg-gradient-to-r from-amber-500/30 to-gold-500/20 text-gold-300 border border-gold-500/50 shadow-lg shadow-gold-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Target className="w-4 h-4 text-gold-400 animate-bounce" />
            <span>MODEL MATCH 🎯</span>
          </button>
          <button
            onClick={() => setActiveSubTab('hair_maxing')}
            className={`py-3.5 px-3 text-xs uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'hair_maxing'
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Scissors className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>HAIR MAXING 💇‍♂️</span>
          </button>
          <button
            onClick={() => setActiveSubTab('challenge_30')}
            className={`py-3.5 px-3 text-xs uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'challenge_30'
                ? 'bg-zinc-900 text-gold-400 border border-gold-500/40 shadow-lg shadow-gold-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Award className="w-4 h-4 text-gold-400" />
            <span>GLOW-UP CHALLENGE 🎯</span>
          </button>
          <button
            onClick={() => setActiveSubTab('photo_journal')}
            className={`py-3.5 px-3 text-xs uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'photo_journal'
                ? 'bg-zinc-900 text-gold-400 border border-gold-500/40 shadow-lg shadow-gold-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Camera className="w-4 h-4 text-gold-400" />
            <span>PHOTO JOURNAL 📁</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'scanner' && (
        <>
          {/* HIDDEN SCAN FILE INPUT */}
          <input
            ref={scanInputRef}
            id="scan-file-input"
            type="file"
            accept="image/*"
            onChange={handleScanFileUpload}
            className="hidden"
          />

          {/* EXACT MATCH TO USER SCREENSHOT 2: AI LOOKMAX SCANNER & RATING CARD */}
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-black text-zinc-100 tracking-tight">
                  AI Lookmax Scanner & Rating
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextLang = currentLang === 'english' ? 'normal' : 'english';
                    setLanguage(nextLang);
                    setCurrentLang(nextLang);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                    currentLang === 'english'
                      ? 'bg-blue-950/80 text-blue-300 border-blue-500/50'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  }`}
                  title={currentLang === 'english' ? 'Switch to Bengali (বাংলা)' : 'Switch to English'}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{currentLang === 'english' ? 'Language: English' : 'ভাষা: বাংলা'}</span>
                </button>
                <span className="hidden sm:inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
                  DIRECT RATING ENGINE
                </span>
              </div>
            </div>

            {/* Subtitle text */}
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Upload any picture of your face to analyze symmetry, skin health, under-eye logs, jawline tier, and receive constructive feedback on your face issues!
            </p>

            {/* Live Camera Scan vs File Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Live Back Camera 10s Scan */}
              <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-5 text-center space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Camera className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                    📹 ১০ সেকেন্ডের ব্যাক ক্যামেরা লাইভ স্ক্যান
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    ক্যামেরা অন করে ১০ সেকেন্ডে চারপাশ থেকে আপনার পুরো মুখ ঘুরিয়ে দেখান।
                  </p>
                </div>

                <button
                  onClick={startLiveCameraScan}
                  disabled={isLiveScanning || isAiLoading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>লাইভ স্ক্যান শুরু করুন</span>
                </button>
              </div>

              {/* Option 2: Gallery / Portrait File Upload */}
              <div
                onClick={triggerScanUploadClick}
                className="border-2 border-dashed border-zinc-800 hover:border-amber-500/60 rounded-2xl p-5 text-center cursor-pointer transition-all bg-zinc-950/60 hover:bg-zinc-900/40 group space-y-3 flex flex-col justify-between"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-all shadow-inner">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-200 group-hover:text-amber-400 transition-all">
                    গ্যালারি থেকে পোর্ট্রেট ছবি দিন
                  </p>
                  <p className="text-xs text-zinc-500">
                    ক্যামেরা বা ফটো গ্যালারির আগে তোলা ছবি সিলেক্ট করুন
                  </p>
                </div>
                <div className="py-2.5 px-4 bg-zinc-900 text-zinc-300 font-bold text-xs uppercase rounded-xl border border-zinc-800">
                  ফাইল পছন্দ করুন
                </div>
              </div>
            </div>

            {/* LIVE CAMERA FEED OVERLAY */}
            {isLiveScanning && (
              <div className="bg-zinc-950 border-2 border-red-500/80 rounded-3xl p-5 text-center space-y-4 shadow-2xl relative overflow-hidden animate-fadeIn">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-xs">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                    <span>🔴 ব্যাক ক্যামেরা লাইভ রেকর্ড হচ্ছে...</span>
                  </div>
                  <div className="px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 rounded-full font-mono font-black text-sm">
                    ⏱️ {liveScanTimer}s
                  </div>
                </div>

                <div className="relative w-full max-w-sm mx-auto h-64 rounded-2xl overflow-hidden border border-amber-500/40 bg-black shadow-2xl">
                  <video
                    ref={liveVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <FaceMesh3DOverlay active={true} />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-amber-300 text-xs font-bold font-sans z-20">
                    🔄 এই পাস এই পাস ঘুরিয়ে আপনার পুরো মুখ সুন্দর করে দেখান...
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={captureLiveSnapshotAndAnalyze}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    এখনই স্ক্যান রিসিভ করুন
                  </button>
                  <button
                    onClick={stopLiveCamera}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    ক্যানসেল করুন
                  </button>
                </div>
              </div>
            )}

            {/* Stored Journal Photos Selector */}
            {photos && photos.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                  OR ANALYZE STORED JOURNAL PHOTO:
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {photos.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSecScanPhoto(item.imageBase64);
                        triggerFaceAnalysisApi(item.imageBase64);
                      }}
                      disabled={isAiLoading}
                      className="w-16 h-16 rounded-xl overflow-hidden border-2 border-zinc-800 hover:border-amber-500 transition-all shrink-0 cursor-pointer relative group"
                    >
                      <img src={item.imageBase64} alt={`Journal photo ${item.date}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        Analyze
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MY SAVED LIVE SCAN VIDEOS SECTION */}
          <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative overflow-hidden mt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-lg font-black text-zinc-100 tracking-tight">
                  আমার সংরক্ষিত ১০ সেকেন্ডের লাইভ স্ক্যান ভিডিওসমূহ
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {savedVideos.length} টি সংরক্ষিত
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              ১০ সেকেন্ডের পুরো মুখ ঘুরানো রেকর্ড করা ভিডিওগুলো সরাসরি এখানে প্লে করে দেখতে পারবি। এআই বিশ্লেষণ নিখুঁত ও সত্য প্রমাণিত করার জন্য এটি একটি স্থায়ী সংরক্ষণাগার!
            </p>

            {savedVideos.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-zinc-900 bg-zinc-950/40 text-zinc-500 text-xs font-medium space-y-2">
                <p>এখনো কোনো ১০ সেকেন্ডের লাইভ স্ক্যান ভিডিও সংরক্ষণ করা হয়নি।</p>
                <p className="text-amber-500/60">"লাইভ স্ক্যান শুরু করুন" বাটনে ক্লিক করে পুরো মুখ ঘুরিয়ে ১০ সেকেন্ড স্ক্যান সম্পন্ন করলেই ভিডিওটি এখানে সংরক্ষিত হবে! 🤫</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedVideos.map((video) => (
                  <div key={video.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 space-y-3 relative group transition-all hover:border-amber-500/40">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-900 group">
                      {activePlaybackVideo === video.id ? (
                        <video
                          src={video.videoBase64}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt="Live Video Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                              <Camera className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-all group-hover:bg-black/40">
                            <button
                              onClick={() => setActivePlaybackVideo(video.id)}
                              className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer shadow-lg"
                            >
                              <span className="ml-1 text-xs">▶</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        সংরক্ষিত লাইভ স্ক্যান
                      </span>
                      <span>{video.date}</span>
                    </div>

                    <div className="flex gap-2">
                      {activePlaybackVideo === video.id && (
                        <button
                          onClick={() => setActivePlaybackVideo(null)}
                          className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 text-[10px] font-bold uppercase transition-all"
                        >
                          প্লেয়ার বন্ধ করুন
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSavedVideos(prev => {
                            const updated = prev.filter(v => v.id !== video.id);
                            deleteVideoFromDB(video.id);
                            return updated;
                          });
                          if (activePlaybackVideo === video.id) setActivePlaybackVideo(null);
                        }}
                        className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 text-[10px] font-bold uppercase transition-all"
                      >
                        ভিডিও ডিলিট করুন 🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 10-SECOND LIVE SCANNING PROGRESS AND ANALYSIS OVERLAY (30 SECONDS DURATIONAL IMMERSION) */}
          {isLiveScanAnalyzing && (
            <div className="bg-[#121214] border border-amber-500/40 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden animate-fadeIn shadow-2xl">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-amber-500/50 relative shadow-2xl flex items-center justify-center bg-black/40">
                {secScanPhoto ? (
                  <img src={secScanPhoto} alt="Live Scan Snapshot" className="w-full h-full object-cover referrerPolicy=no-referrer" referrerPolicy="no-referrer" />
                ) : (
                  <Camera className="w-8 h-8 text-amber-400 animate-pulse" />
                )}
                <div className="absolute inset-x-0 h-1 bg-amber-500 animate-bounce shadow-[0_0_15px_#f59e0b]" />
              </div>
              
              <div className="space-y-3 max-w-md mx-auto">
                <h4 className="text-base font-display font-black uppercase text-amber-400 tracking-wider flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ডিপ ৩ডি লাইভ এআই ফেস অ্যানালাইসিস...
                </h4>
                
                <div className="w-full h-3 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5 relative">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                    style={{ width: `${liveScanAnalyzeProgress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>বিশ্লেষণ চলছে...</span>
                  <span className="text-amber-400 font-bold">{liveScanAnalyzeProgress}%</span>
                </div>
                
                <p className="text-xs text-zinc-400 leading-relaxed pt-2 font-sans">
                  {liveScanAnalyzeProgress < 30 ? "তোর ৩ডি ফেস স্ট্রাকচার ম্যাপিং লোড করা হচ্ছে..." :
                   liveScanAnalyzeProgress < 60 ? "চোখ, চোয়াল এবং চুলের ঘনত্ব এআই দিয়ে গভীরভাবে প্রসেস করা হচ্ছে..." :
                   liveScanAnalyzeProgress < 90 ? "পজিটিভ সাইড, ইম্প্রুভমেন্ট এরিয়া এবং ব্রো মোটিভেশন তৈরি করা হচ্ছে..." :
                   "ফলাফল প্রস্তুত করা হচ্ছে! আরেকটু ধৈর্য ধর দোস্ত..."}
                </p>
              </div>
            </div>
          )}

          {/* 10-SECOND LIVE SCAN BEAUTIFIED ASSESSMENT RESULT CARD */}
          {liveScanResultText && !isLiveScanAnalyzing && (
            <div className="bg-[#0e0e11] border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5.5 h-5.5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-100 tracking-tight uppercase font-display flex items-center gap-2 font-bold">
                      ৩ডি লাইভ ফেসিয়াল রিপোর্ট (Live Facial Report)
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                      deep structural ai face & skin analysis
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLiveScanResultText(null);
                    setLiveScanStructured(null);
                  }}
                  className="p-2 bg-zinc-900/60 hover:bg-zinc-850 rounded-xl text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer border border-zinc-850"
                >
                  ✕
                </button>
              </div>

              {liveScanStructured ? (
                <div className="space-y-8">
                  {/* Part 1: Aura Overview (চেহারার অবস্থা ও ওভারভিউ) */}
                  <div className="relative p-6 bg-gradient-to-br from-amber-500/10 via-zinc-950 to-zinc-950 border border-amber-500/20 rounded-2xl space-y-3 shadow-lg">
                    <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
                      ⚡ Facial Aura Overview
                    </div>
                    <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      👑 তোর চেহারার বর্তমান অবস্থা:
                    </h4>
                    <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                      {liveScanStructured.auraOverview}
                    </p>
                  </div>

                  {/* Part 2: Assets (তোর চেহারার সেরা দিকগুলো) */}
                  {liveScanStructured.assets && liveScanStructured.assets.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span>🌟 সেরা ফেসিয়াল প্লাস পয়েন্ট (Top Facial Assets)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {liveScanStructured.assets.map((asset: string, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950/80 border border-emerald-500/10 hover:border-emerald-500/30 rounded-xl transition-all flex items-start gap-3">
                            <span className="text-emerald-400 text-lg">✓</span>
                            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                              {asset}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Part 3: Issues (উন্নতির জায়গা ও সমস্যাগুলো) */}
                  {liveScanStructured.issues && liveScanStructured.issues.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <span>🛠️ ইম্প্রুভমেন্ট এরিয়া ও সমাধান (Areas to Improve)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {liveScanStructured.issues.map((issue: string, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950/80 border border-amber-500/10 hover:border-amber-500/30 rounded-xl transition-all flex items-start gap-3">
                            <span className="text-amber-400 text-lg">⚠</span>
                            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                              {issue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Part 4: Bad Habits (বর্জনীয় অভ্যাসগুলো) */}
                  {liveScanStructured.badHabits && liveScanStructured.badHabits.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <span>🚫 ক্ষতিকর অভ্যাসগুলো এখনই ছাড় (Bad Habits to Quit)</span>
                      </h4>
                      <div className="space-y-3">
                        {liveScanStructured.badHabits.map((habit: string, idx: number) => (
                          <div key={idx} className="p-4 bg-red-950/5 border border-red-500/10 hover:border-red-500/20 rounded-xl flex items-start gap-3.5">
                            <span className="text-red-400 text-lg">✗</span>
                            <p className="text-xs text-zinc-350 leading-relaxed font-medium">
                              {habit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Part 5: Daily Routine Checklist (আজকের অ্যাকশন রুটিন) */}
                  {liveScanStructured.dailyRoutine && liveScanStructured.dailyRoutine.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                        <span>📅 তোর আজকের কাস্টম রুটিন (Today's Routine)</span>
                      </h4>
                      <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-3">
                        {liveScanStructured.dailyRoutine.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 py-1.5 border-b border-zinc-900/40 last:border-0">
                            <input 
                              type="checkbox" 
                              id={`routine-${idx}`} 
                              className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 bg-zinc-900 border-zinc-850 cursor-pointer"
                              defaultChecked={false}
                            />
                            <label htmlFor={`routine-${idx}`} className="text-xs text-zinc-300 font-medium cursor-pointer select-none">
                              {item}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback raw display */
                <div className="relative p-5 md:p-6 bg-zinc-950 border border-zinc-850 rounded-2xl">
                  <div className="absolute top-3 left-3 text-3xl text-zinc-800 font-serif leading-none select-none">“</div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans font-medium text-justify relative z-10 whitespace-pre-wrap">
                    {liveScanResultText}
                  </p>
                  <div className="absolute bottom-1 right-3 text-3xl text-zinc-800 font-serif leading-none select-none">”</div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-900">
                <button
                  onClick={() => {
                    setLiveScanResultText(null);
                    setLiveScanStructured(null);
                    startLiveCameraScan();
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>আরেকবার লাইভ স্ক্যান কর (Scan Again)</span>
                </button>
                <button
                  onClick={() => {
                    setLiveScanResultText(null);
                    setLiveScanStructured(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold text-xs uppercase tracking-wide rounded-xl transition-all cursor-pointer"
                >
                  ফলাফল বন্ধ করুন
                </button>
              </div>
            </div>
          )}

          {/* AI SCANNER LOADING OVERLAY WITH BEAUTIFUL REAL-TIME TIMER & PROGRESS */}
          {isAiLoading && (() => {
            const sec = aiScanElapsedSeconds;
            const pct = Math.min(99, Math.round(aiScanProgressPercent));
            
            let stageNum = 1;
            let stageTitle = "১/৫: ফেসিয়াল গ্রিড ও গোল্ডেন রেশিও ডিটেকশন";
            let stageDesc = "চোখের দূরত্ব, নাকের মাপ ও চেহারার সামগ্রিক ফ্রেম স্ক্যান করা হচ্ছে...";
            
            if (sec >= 2.5 && sec < 5.0) {
              stageNum = 2;
              stageTitle = "২/৫: জলাইন, চিন ও বোন স্ট্রাকচার ম্যাপিং";
              stageDesc = "শার্প জলাইন, থুতনির কোণ ও পুরুষালি চোয়ালের গঠন বিশ্লেষণ চলছে...";
            } else if (sec >= 5.0 && sec < 7.5) {
              stageNum = 3;
              stageTitle = "৩/৫: স্কিন ডার্মাটোলজি, টেক্সচার ও ক্যানথাল টিল্ট";
              stageDesc = "ত্বকের কোয়ালিটি, গ্লো, পোরস এবং পজিটিভ ক্যানথাল টিল্ট অ্যাসেসমেন্ট...";
            } else if (sec >= 7.5 && sec < 10.5) {
              stageNum = 4;
              stageTitle = "৪/৫: হেয়ারস্টাইল, ফেস শেপ ও সিমেট্রি স্কোরিং";
              stageDesc = "হেয়ার ভলিউম, কপালের হেয়ারলাইন এবং দুই পাশের সিমেট্রি হিসাব করা হচ্ছে...";
            } else if (sec >= 10.5) {
              stageNum = 5;
              stageTitle = "৫/৫: চূড়ান্ত লুকসম্যাক্সিং স্কোর ও কাস্টম গাইড তৈরি";
              stageDesc = "আপনার ইউনিক চেহারার জন্য পার্সোনালাইজড ট্রান্সফরমেশন রুটিন জেনারেট হচ্ছে...";
            }

            return (
              <div className="bg-gradient-to-b from-[#14151b] via-[#0e0f14] to-[#090a0d] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30 animate-in fade-in zoom-in-95 duration-300">
                {/* Ambient scanner light glow */}
                <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Top Header Badge & Live Monospace Timer Counter */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      AI Live Looksmaxing Vision
                    </span>
                  </div>

                  {/* PROMINENT DIGITAL MONOSPACE LIVE TIMER BADGE */}
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 shadow-inner">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs text-zinc-400 font-medium font-sans">প্রসেসিং সময়:</span>
                    <span className="text-sm font-mono font-black text-amber-300 tracking-wider">
                      {sec < 10 ? `0${sec.toFixed(1)}s` : `${sec.toFixed(1)}s`}
                    </span>
                  </div>
                </div>

                {/* Cybernetic Face Scanning Box with 3D Holographic Lasers */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.35)] bg-zinc-950 flex items-center justify-center group">
                  {secScanPhoto ? (
                    <img 
                      src={secScanPhoto} 
                      alt="Scanning Target" 
                      className="w-full h-full object-cover filter brightness-95 contrast-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-amber-400">
                      <Camera className="w-10 h-10 animate-pulse" />
                    </div>
                  )}

                  {/* High-Tech Corner Reticles */}
                  <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
                  <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

                  {/* Crosshair grid lines */}
                  <div className="absolute inset-0 border border-amber-400/20 pointer-events-none" />
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-400/25 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-amber-400/25 pointer-events-none" />

                  {/* Animated Sweeping 3D Laser Beam */}
                  <div 
                    className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_18px_#f59e0b] pointer-events-none animate-bounce"
                    style={{ animationDuration: '1.4s' }}
                  />

                  {/* Status Overlay Tag */}
                  <div className="absolute bottom-2 inset-x-2 bg-black/75 backdrop-blur-md rounded-lg py-1 px-2 border border-amber-400/30 text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider text-center">
                    SCANNING BIOMETRICS
                  </div>
                </div>

                {/* Dynamic Stage Information & Subtext */}
                <div className="space-y-2 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-amber-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>{stageTitle}</span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {stageDesc}
                  </p>
                </div>

                {/* Progress Bar with Glowing Amber Gradient & Percentage Text */}
                <div className="space-y-2 max-w-md mx-auto pt-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span>বিশ্লেষণ অগ্রগতি (Progress)</span>
                    </span>
                    <span className="text-amber-400 font-black tracking-wider text-sm">
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5 relative">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* 5-Step Progress Indicators */}
                  <div className="flex items-center justify-between pt-1 px-1">
                    {[1, 2, 3, 4, 5].map((step) => {
                      const isDone = stageNum > step;
                      const isCurrent = stageNum === step;
                      return (
                        <div key={step} className="flex items-center gap-1">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                            isDone 
                              ? 'bg-amber-400 text-black shadow-sm' 
                              : isCurrent 
                              ? 'bg-amber-500/30 text-amber-300 ring-2 ring-amber-400/50 animate-pulse' 
                              : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {isDone ? '✓' : step}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 font-sans italic pt-1">
                  💡 নিখুঁত ফলাফলের জন্য ব্যাকগ্রাউন্ডে এআই মডেল ডিপ ফেসিয়াল প্যারামিটারগুলো যাচাই করছে, কয়েক সেকেন্ড সাথে থাকুন!
                </p>
              </div>
            );
          })()}

          {/* SCANNER ERROR MESSAGE */}
          {scannerError && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 text-rose-300 text-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{scannerError}</span>
              </div>
              <button
                onClick={triggerScanUploadClick}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-lg text-xs font-bold uppercase cursor-pointer"
              >
                আবার ট্রাই কর
              </button>
            </div>
          )}

          {/* COMPLETE AI FACE SCAN RESULT CARD */}
          {scanResult && !isAiLoading && (
            (scanResult.isBlockedNotUser || scanResult.isPersonMismatch) ? (
              /* DEDICATED BIOMETRIC FACE MISMATCH & REJECTION CARD */
              <div className="bg-[#121214] border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn text-center">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto text-3xl shadow-[0_0_30px_rgba(244,63,94,0.35)]">
                  🛑
                </div>

                <div className="space-y-2">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-mono font-black bg-rose-500/30 text-rose-300 border border-rose-500/50 uppercase tracking-widest inline-block">
                    {currentLang === 'english' ? 'BIOMETRIC MISMATCH • SCAN BLOCKED' : 'বায়োমেট্রিক অমিল • স্ক্যান বাতিল'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-white">
                    {currentLang === 'english' ? 'This is NOT your face!' : 'এটি আপনার চেহারা নয়!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
                    {scanResult.personMismatchNotice || (currentLang === 'english'
                      ? "Your account is locked to your verified personal face. You uploaded someone else's or an internet model's photo. Looksmaxing only analyzes your own real selfies!"
                      : "আপনার সিস্টেমে ইতিমধ্যে আপনার আসল চেহারা সেট করা আছে। আপনি অন্য কোনো ব্যক্তি বা ইন্টারনেটের মডেলের ছবি আপলোড করেছেন। অন্য কারো ছবি দিয়ে লুকম্যাক্স কাজ করবে না।")}
                  </p>
                </div>

                {/* Biometric Verification Comparison Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-zinc-800 flex items-center justify-center gap-4 sm:gap-8 max-w-md mx-auto">
                  {registeredUserFace && (
                    <div className="text-center space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 block flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> আপনার আসল মুখ
                      </span>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-lg mx-auto">
                        <img src={registeredUserFace} alt="Registered Face" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  <div className="text-2xl text-rose-500 font-black">≠</div>
                  <div className="text-center space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-rose-400 block flex items-center justify-center gap-1">
                      <X className="w-3 h-3 text-rose-400" /> অন্য কারো ছবি
                    </span>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-rose-500/80 shadow-lg mx-auto">
                      <img src={secScanPhoto || ''} alt="Uploaded Photo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* AI Scolding / Roast details */}
                {(scanResult.modelRoast || scanResult.fakeScolding) && (
                  <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-left space-y-1.5 max-w-lg mx-auto">
                    <span className="text-[10px] font-mono font-black text-rose-300 uppercase block">🔥 এআই রোস্ট ও মন্তব্য:</span>
                    <p className="text-xs text-rose-100 leading-relaxed font-medium italic">
                      "{scanResult.modelRoast || scanResult.fakeScolding}"
                    </p>
                    {scanResult.rating && scanResult.rating > 7.0 && (
                      <p className="text-[10px] text-zinc-400 pt-1 border-t border-rose-500/20">
                        {currentLang === 'english'
                          ? `Visual note: The model in this photo has high-tier aesthetics (${scanResult.rating}/10), but because it is not your authenticated selfie, it will not be saved.`
                          : `নোট: এই ছবির মডেলের চেহারা আকর্ষণীয় (রেটিং: ${scanResult.rating}/১০), তবে যেহেতু এটি আপনার নিজের ছবি নয়, তাই এটি বাতিল করা হয়েছে।`}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setScanResult(null);
                      setSecScanPhoto(null);
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{currentLang === 'english' ? 'Upload My Real Selfie' : 'আমার নিজস্ব আসল সেলফি তুলুন / দিন'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(currentLang === 'english' ? 'Are you sure this is actually you with a new look? This will update your registered face.' : 'আপনি কি নিশ্চিত যে এটি আসলেই আপনি? এটি আপনার নতুন সংরক্ষিত চেহারা হিসেবে সেট হবে।')) {
                        if (secScanPhoto) {
                          handleResetRegisteredFace(secScanPhoto);
                          triggerFaceAnalysisApi(secScanPhoto);
                        }
                      }
                    }}
                    className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    {currentLang === 'english' ? 'Update As My New Face' : 'এটিই আমি (চেহারা আপডেট করুন)'}
                  </button>
                </div>
              </div>
            ) : (
            <div className="bg-[#121214] border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
              {/* Translating Indicator Banner */}
              {isTranslatingScan && (
                <div className="bg-blue-950/70 border border-blue-500/40 rounded-2xl p-3.5 flex items-center justify-center gap-3 text-blue-200 text-xs animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="font-semibold">
                    {currentLang === 'english'
                      ? 'Translating complete facial analysis report, flaws, advice, and roast to English...'
                      : 'সম্পূর্ণ এনালাইসিস রিপোর্ট, ত্রুটি, পরামর্শ ও রোস্ট বাংলায় অনুবাদ হচ্ছে...'}
                  </span>
                </div>
              )}

              {/* Top Rating Header */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-900">
                <div className="flex items-center gap-4">
                  {secScanPhoto && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 shrink-0 shadow-lg">
                      <img src={secScanPhoto} alt="Analyzed selfie" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      AI Lookmax Rating
                    </span>
                    <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tight">
                      {scanResult.ratingVerdict || (currentLang === 'english' ? 'Facial Architecture Analysis' : 'ফেসিয়াল আর্কিটেকচার এনালাইসিস')}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {currentLang === 'english' ? 'Your selfie scan report is ready!' : 'তোর সেলফি স্ক্যানের পূর্ণাঙ্গ রিপোর্ট প্রস্তুত!'}
                    </p>
                  </div>
                </div>

                {/* Giant Score Badge */}
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shadow-inner">
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block">Overall Score</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-gold-300">
                      {scanResult.rating} <span className="text-xs text-zinc-600 font-normal">/ 10.0</span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              </div>

              {/* PERSON MISMATCH DETECTION CARD (When user uploads their photo first, and a model/different person photo second) */}
              {scanResult.isPersonMismatch && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-indigo-950/80 to-purple-900/70 border-2 border-purple-500/70 shadow-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0 text-xl">
                      🎭
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                          {currentLang === 'english' ? 'Different Person / Model Detected!' : 'আগের ছবির সাথে ব্যক্তির অমিল ধরা পড়েছে!'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50">
                          {currentLang === 'english' ? 'DIFFERENT HUMAN FACE' : 'ভিন্ন ব্যক্তির চেহারা'}
                        </span>
                      </div>
                      <p className="text-xs text-purple-200 leading-relaxed font-medium">
                        {scanResult.personMismatchNotice || (currentLang === 'english' ? 'The person in your previous photo and this new photo are two completely different people!' : 'আপনার আগের সেলফির মানুষটি এবং এই নতুন ছবির মানুষটি এক ব্যক্তি নন — আপনি কোনো মডেল বা অন্য কারো ছবি দিয়ে পরীক্ষা করেছেন!')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MODEL / CELEBRITY DETECTION ALERT CARD */}
              {(scanResult.isModelOrCelebrity || scanResult.isFakeOrNotUser) && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-950/80 to-rose-900/70 border-2 border-rose-500/70 shadow-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 text-xl">
                      🚨
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                          {currentLang === 'english' ? 'Model / Celebrity Photo Detected!' : 'মডেল বা ইন্টারনেট ছবির চালাকি ধরা পড়েছে!'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/30 text-rose-200 border border-rose-500/50">
                          {currentLang === 'english' ? 'STUDIO / INTERNET PHOTO' : 'ইন্টারনেট / মডেল ফটো'}
                        </span>
                      </div>
                      <p className="text-xs text-rose-200 leading-relaxed font-medium">
                        {scanResult.detectedModelDetails || (currentLang === 'english' ? 'This image was identified as a professional fashion model / internet studio photoshoot rather than your casual everyday selfie.' : 'এটি একজন ফ্যাশন মডেল / প্রফেশনাল মডেলের স্টুডিও ফটোশুট। এটি আপনার নিজের ব্যক্তিগত সাধারণ সেলফি নয়!')}
                      </p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/60 border border-rose-500/30 text-xs text-rose-100 italic leading-relaxed">
                    "{scanResult.modelRoast || scanResult.fakeScolding || (currentLang === 'english' ? 'Nice try testing the AI with a model photo! Upload your own real selfie to see your true score.' : 'আমাকে পরীক্ষা করার জন্য কোনো মডেলের ছবি দিয়েছিস?! আমি তো সেকেন্ডেই ধরে ফেলেছি! এবার নিজের আসল সেলফি তোল!')}"
                  </div>
                </div>
              )}

              {/* VISUAL PROOF & ATTIRE VERIFICATION BADGE */}
              {scanResult.clothingAndVisualProof && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-zinc-900/90 to-blue-950/50 border border-cyan-500/40 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      🔍 {currentLang === 'english' ? 'Verified Vision & Attire Proof' : 'আসল ছবির গভীর ভিজ্যুয়াল প্রমাণ (পোশাক ও পরিবেশ)'}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                      100% REAL VISION
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {scanResult.clothingAndVisualProof}
                  </p>
                </div>
              )}

              {/* REQUIRED SUBTABS */}
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2 border-b border-zinc-800">
                {[
                  { id: 'analysis', label: currentLang === 'english' ? '📊 Traits & Flaws' : '📊 বৈশিষ্ট্য ও ত্রুটি' },
                  { id: 'advice', label: currentLang === 'english' ? '💡 Analysis Advice' : '💡 বিস্তারিত পরামর্শ' },
                  { id: 'roast', label: currentLang === 'english' ? '🔥 Roast Mode' : '🔥 রোস্ট মোড' },
                  { id: 'girls_pov', label: currentLang === 'english' ? "💖 Girls POV" : "💖 মেয়েদের দৃষ্টিভঙ্গি" },
                  { id: 'motivation', label: currentLang === 'english' ? '⚡ Motivation' : '⚡ অনুপ্রেরণা' },
                ].map((tab) => {
                  const isActive = lookmaxSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setLookmaxSubTab(tab.id as any)}
                      className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? tab.id === 'roast'
                            ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300 shadow-lg shadow-rose-950/50'
                            : tab.id === 'girls_pov'
                            ? 'bg-pink-950/80 border border-pink-500/60 text-pink-300 shadow-lg shadow-pink-950/50'
                            : tab.id === 'motivation'
                            ? 'bg-amber-950/80 border border-amber-500/60 text-amber-300 shadow-lg shadow-amber-950/50'
                            : 'bg-zinc-900 border border-gold-500/50 text-gold-400 shadow-lg'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: TRAITS & FLAWS */}
              {lookmaxSubTab === 'analysis' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Traits & Flaws Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Positive Traits */}
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-emerald-400" /> {currentLang === 'english' ? '🟢 Positive Traits & Strengths' : '🟢 পজিটিভ ফিচারসমূহ (Positive Traits)'}
                      </span>
                      <ul className="space-y-2">
                        {scanResult.positiveTraits && scanResult.positiveTraits.length > 0 ? (
                          scanResult.positiveTraits.map((trait, i) => (
                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-900">
                              <span className="text-emerald-400 font-bold shrink-0">✓</span>
                              <span>{trait}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-zinc-500 italic">
                            {currentLang === 'english' ? 'No prominent positive traits detected.' : 'কোনো স্পষ্ট পজিটিভ দিক পাওয়া যায়নি।'}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Flaws / Weaknesses */}
                    <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-5 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> {currentLang === 'english' ? '🔴 Improvement Areas & Flaws' : '🔴 উন্নতির জায়গা ও ফ্লসমূহ (Flaws)'}
                      </span>
                      <ul className="space-y-2">
                        {scanResult.flaws && scanResult.flaws.length > 0 ? (
                          scanResult.flaws.map((flaw, i) => (
                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-900">
                              <span className="text-rose-400 font-bold shrink-0">✕</span>
                              <span>{flaw}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-zinc-500 italic">
                            {currentLang === 'english' ? 'No major flaws detected!' : 'কোনো বড় ধরনের ফ্ল পাওয়া যায়নি!'}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILED ANALYSIS ADVICE */}
              {lookmaxSubTab === 'advice' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Detailed Practical Advice Section Header */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-gold-500/10 to-zinc-950 border border-amber-500/30 p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm md:text-base font-black text-amber-300 uppercase tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" /> {currentLang === 'english' ? '👑 Complete Glow-Up & Grooming Blueprint' : '👑 আপনার চেহারা ও পারসোনালিটি উন্নত করার কমপ্লিট অ্যাডভাইস'}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        {currentLang === 'english'
                          ? 'Based on your selfie analysis, AI has formulated a tailored skincare, jawline, and style roadmap.'
                          : 'আপনার আজকের সেলফি বিশ্লেষণ করে এআই বিশেষায়িত স্কিনকেয়ার, জলাইন ও স্টাইলিং রোডম্যাপ তৈরি করেছে।'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold rounded-lg uppercase shrink-0">
                      SCORE: {scanResult.rating}/10
                    </span>
                  </div>

                  {/* AI Generated Actionable Step-by-Step Practical Advice List */}
                  <div className="bg-zinc-950 border border-amber-500/20 rounded-2xl p-5 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-3">
                      <Zap className="w-4.5 h-4.5 text-amber-400" /> {currentLang === 'english' ? '⚡ Actionable Step-by-Step Glow-Up Plan' : '⚡ সেলফি-ভিত্তিক বিশেষায়িত কাজের টিপস (Actionable Step-by-Step Plan)'}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {scanResult.adviceList && scanResult.adviceList.map((adv, i) => (
                        <div key={i} className="p-4 bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-xs text-zinc-100 flex items-start gap-3.5 transition-all shadow-md group">
                          <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-zinc-950 font-mono font-black text-xs shrink-0 flex items-center justify-center shadow-md">
                            {i + 1}
                          </span>
                          <div className="space-y-1">
                            <span className="font-semibold text-amber-200 block text-[11px] uppercase tracking-wider">
                              {currentLang === 'english' ? `Glow-Up Tip #${i + 1}` : `গ্লো-আপ টিপ #${i + 1}`}
                            </span>
                            <p className="leading-relaxed font-sans text-zinc-200 text-xs">{adv}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comprehensive Skincare, Jawline & Grooming Master Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Skincare Routine */}
                    <div className="bg-[#0f1418] border border-cyan-500/20 rounded-2xl p-4.5 space-y-3">
                      <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                        <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">🧴</span>
                        <div>
                          <h4 className="text-xs font-black text-cyan-200 uppercase tracking-wider">
                            {currentLang === 'english' ? 'Skincare & Glow Protocol' : 'স্কিনকেয়ার ও গ্লো প্রোটোকল'}
                          </h4>
                          <span className="text-[9px] text-zinc-400 font-mono">Daily Skin Barrier Routine</span>
                        </div>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-300 font-sans">
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-cyan-400 font-bold">1.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Morning Cold Compress:</strong> 
                              : <strong>সকালে বরফ কমপ্রেস:</strong>}
                            {currentLang === 'english'
                              ? ' Massage face with green tea ice cubes for 2 mins to drain under-eye puffiness and dark circles.'
                              : ' ২ মিনিট মুখে গ্রিন-টি আইস কিউব মাসাজ করুন যা চোখের ফোলাভাব ও চোখের নিচের কালি দূর করবে।'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-cyan-400 font-bold">2.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Gentle Cleanser:</strong> 
                              : <strong>জেন্টল ক্লিনজার:</strong>}
                            {currentLang === 'english'
                              ? ' Use a gentle Salicylic Acid face wash for oily or acne-prone skin.'
                              : ' তৈলাক্ত ও অ্যাকনে স্কিনের জন্য Salicylic Acid ফেসওয়াশ ব্যবহার করুন।'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-cyan-400 font-bold">3.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Hydration:</strong> 
                              : <strong>হাইড্রেশন:</strong>}
                            {currentLang === 'english'
                              ? ' Drink at least 3 to 3.5L water daily to maintain clear, plump facial skin.'
                              : ' প্রতিদিন অন্তত ৩ লিটার পানি পান করুন যাতে মুখে ন্যাচারাল গ্লো থাকে।'}
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Jawline & Structure */}
                    <div className="bg-[#18110f] border border-amber-500/20 rounded-2xl p-4.5 space-y-3">
                      <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
                        <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400">📐</span>
                        <div>
                          <h4 className="text-xs font-black text-amber-200 uppercase tracking-wider">
                            {currentLang === 'english' ? 'Jawline & Mewing Protocol' : 'জলাইন ও মিউইং এক্সারসাইজ'}
                          </h4>
                          <span className="text-[9px] text-zinc-400 font-mono">Facial Bone Structure</span>
                        </div>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-300 font-sans">
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-amber-400 font-bold">1.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Proper Mewing:</strong> 
                              : <strong>প্রোপার মিউইং (Mewing):</strong>}
                            {currentLang === 'english'
                              ? ' Keep tongue vacuum-sealed against palate. Sharpens mandibular jawline over 1-3 months.'
                              : ' জিব্বা সবসময় তালুতে চাপ দিয়ে রাখুন। এটি ১-৩ মাসে চোয়ালের হাড় শার্প করে।'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-amber-400 font-bold">2.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Upright Posture:</strong> 
                              : <strong>সোজা পোশ্চার:</strong>}
                            {currentLang === 'english'
                              ? ' Maintain upright neck and thoracic alignment to prevent submental double chin.'
                              : ' হাঁটা ও বসার সময় ঘাড় ও মেরুদণ্ড সোজা রাখুন যাতে ডাবল চিন না দেখা যায়।'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-amber-400 font-bold">3.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Lower Body Fat:</strong> 
                              : <strong>বডি ফ্যাট কমানো:</strong>}
                            {currentLang === 'english'
                              ? ' Cardio and high-protein clean nutrition reveal underlying facial bone definition.'
                              : ' কার্ডিও ও ক্লিন ডায়েটের মাধ্যমে শরীরের অতিরিক্ত ফ্যাট ঝরান।'}
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Hair & Grooming */}
                    <div className="bg-[#160f18] border border-purple-500/20 rounded-2xl p-4.5 space-y-3">
                      <div className="flex items-center gap-2 border-b border-purple-500/20 pb-2">
                        <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400">✂️</span>
                        <div>
                          <h4 className="text-xs font-black text-purple-200 uppercase tracking-wider">
                            {currentLang === 'english' ? 'Hair & Beard Grooming' : 'হেয়ার ও দাড়ি গ্রুমিং'}
                          </h4>
                          <span className="text-[9px] text-zinc-400 font-mono">Precision Styling & Sunnah</span>
                        </div>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-300 font-sans">
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-purple-400 font-bold">1.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Face-Shape Haircut:</strong> 
                              : <strong>ফেইস-শেপ কাট:</strong>}
                            {currentLang === 'english'
                              ? ' Taper fade sides to accentuate facial symmetry and jawline angles.'
                              : ' আপনার মুখের গড়ন অনুযায়ী দুই পাশে শাইন বা ফেড কাট দিন।'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-purple-400 font-bold">2.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Beard Care:</strong> 
                              : <strong>দাড়ির যত্ন:</strong>}
                            {currentLang === 'english'
                              ? ' Massage roots twice weekly with castor/almond oil for thickness and luster.'
                              : ' সপ্তাহে ২ দিন অর্গানিক অয়েল (কাস্টর/আমন্ড) দিয়ে দাড়ি ও চুলের গোড়া মাসাজ করুন।'}
                          </span>
                        </li>
                        <li className="flex items-start gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                          <span className="text-purple-400 font-bold">3.</span>
                          <span>
                            {currentLang === 'english' 
                              ? <strong>Attar / Fragrance:</strong> 
                              : <strong>সুন্নাহ পারফিউম/আতর:</strong>}
                            {currentLang === 'english'
                              ? ' Clean personal fragrance elevates perceived aura and confidence 3x.'
                              : ' সুগন্ধি ব্যবহার করুন যা আপনার কনফিডেন্স ৩ গুণ বাড়িয়ে দেবে।'}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ROAST MODE */}
              {lookmaxSubTab === 'roast' && (
                <div className={`rounded-2xl p-6 md:p-8 space-y-4 animate-fadeIn border ${
                  scanResult.rating && scanResult.rating >= 8.0
                    ? 'bg-[#0a1810] border-emerald-900/50'
                    : 'bg-[#180a0a] border-rose-900/50'
                }`}>
                  <div className="flex items-center justify-between gap-4 border-b border-rose-950/80 pb-4">
                    <span className={`text-base font-black uppercase tracking-tight flex items-center gap-2 ${
                      scanResult.rating && scanResult.rating >= 8.0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {scanResult.rating && scanResult.rating >= 8.0 
                        ? (currentLang === 'english' ? '🙏 APOLOGY & RESPECT KING!' : '🙏 মাপ চাই ভাই! (RESPECT & APOLOGY)') 
                        : (currentLang === 'english' ? '🔥 BRUTALLY HONEST ROAST' : '🔥 BRUTALLY HONEST BENGALI ROAST')}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      scanResult.rating && scanResult.rating >= 8.0
                        ? 'bg-emerald-950 border-emerald-800/80 text-emerald-400'
                        : 'bg-rose-950 border-rose-800/80 text-rose-400'
                    }`}>
                      {scanResult.rating && scanResult.rating >= 8.0 
                        ? '👑 RATING 8.0+ ALPHA LORD' 
                        : (currentLang === 'english' ? 'WARNING: SAVAGE COMEDY' : 'সতর্কবার্তা: চরম সত্যি ও রোস্ট')}
                    </span>
                  </div>

                  <div className={`p-5 rounded-xl border ${
                    scanResult.rating && scanResult.rating >= 8.0
                      ? 'bg-zinc-950/80 border-emerald-950 text-emerald-100'
                      : 'bg-zinc-950/80 border-rose-950 text-rose-200'
                  }`}>
                    <p className="text-sm md:text-base font-sans leading-relaxed font-medium whitespace-pre-line">
                      {scanResult.roastBengali || (currentLang === 'english'
                        ? `Damn bro! You look like an extra from a zombie movie who wandered onto the set by mistake and forgot his lines! 💀 Even your mirror is probably filing for emotional distress damages right now! Why are you staring into the camera like your soul packed its bags and filed a missing persons report?! That messy hair looks like it lost a 12-round heavyweight boxing match with your pillow! A single smile won't crash your operating system champion! Put down the gloomy stare, wash that zombie glaze off your face with ice-cold water, get 8 hours of sleep, and resurrect yourself! 🤦‍♂️🤣🔥`
                        : `কিরে মামা! তোরে দেইখা মনে হইতাছে শ্মশান থেইকা কোনো জিন-ভূত উইকএন্ডের ছুটি পাইয়া ভুল কইরা সেলফি ক্যামেরার সামনে বইসা পড়ছে! 💀 মুখের এক্সপ্রেশন এমন মুগের ডালের মতো ক্যান রে ভাই, মনে হইতাছে আত্মা অলরেডি তোর ওপর বেইজ্জত হইয়া বাড়ি ছাইড়া চইলা গেছে আর থানায় জিডি করণের ধান্দা করতেছে! চোখের নিচের যে গর্ত আর কালি, নাসার বিজ্ঞানীরা শিওর ওখানে ড্রোন নামাইয়া রিসার্চ করণের প্রজেক্ট বানাইবো! পুরান ঢাকার বিরিয়ানির ডেগে পুড়ে যাওয়া কালচে পোড়া আলুর চেয়েও তোর আজকের ফেসিয়াল ভাইব বেশি করুণ লাগতাছে! আর নোয়াখাইল্লা ভাষায় কইলে তো তোরে দেইখা কইবো—'আইচ্ছা ভাইয়া, আঁন্নেরে কি কেউ পেটের ভিতর থাইকা ঠ্যালা মারি বাইর করছে?' 🤦‍♂️ তোর এই মুখ দেখলে ক্রাশ তো দূর কি বাত, ওর পোষা বিড়ালও ৩ দিন না খাইয়া বিষণ্ণতায় ভুগবো! দোস্ত, মরা-জম্বি মার্কা পোজ বন্ধ কর, মুখে বরফ-ঠান্ডা পানি মার, একটু মানুষের মতো হাস আর তাড়াতাড়ি ঘুমাইতে যা! 🤣⚰️🔥`)}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: GIRLS POV (INCLUDES CRUSH YES/NO VERDICT) */}
              {lookmaxSubTab === 'girls_pov' && (
                <div className="bg-[#180814] border border-pink-900/50 rounded-2xl p-6 md:p-8 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between gap-4 border-b border-pink-950/80 pb-4">
                    <span className="text-base font-black text-pink-400 uppercase tracking-tight flex items-center gap-2">
                      {currentLang === 'english' ? '💖 POINT OF VIEW OF A GIRL' : '💖 POINT OF VIEW OF A GIRL (মেয়েদের দৃষ্টিভঙ্গি)'}
                    </span>
                  </div>

                  <div className="p-5 bg-zinc-950/80 border border-pink-950/80 rounded-xl space-y-2">
                    <p className="text-sm md:text-base font-sans text-pink-100 leading-relaxed font-medium whitespace-pre-line">
                      {scanResult.girlsPov || (currentLang === 'english' 
                        ? 'Girls see your facial potential, but you need dedicated grooming, hair styling, and better posture bro!' 
                        : 'মেয়েরা তোর চেহারার পটেনশিয়াল দেখছে, তবে আরেকটু গ্রুমিং ও ফোকাস লাগবে দোস্ত!')}
                    </p>
                  </div>

                  {/* CRUSH YES OR NO VERDICT */}
                  {scanResult.canAttractCrush && (
                    <div className="bg-gradient-to-br from-pink-950/60 to-zinc-950 border border-pink-500/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2 border-b border-pink-900/40 pb-3">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-pink-400 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-pink-400" /> {currentLang === 'english' ? '💘 Attraction Potential (Crush Verdict)' : '💘 ক্রাশকে আকর্ষণ করার সম্ভাবনা (Crush Verdict)'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          scanResult.canAttractCrush.verdict === 'Yes' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {scanResult.canAttractCrush.verdict === 'Yes' 
                            ? (currentLang === 'english' ? 'YES (High Potential)' : 'YES (হ্যাঁ পসিবল!)') 
                            : (currentLang === 'english' ? 'NO (Fix Grooming First)' : 'NO (আগে চেইঞ্জ কর)')}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-zinc-200 leading-relaxed bg-zinc-950/80 p-4 rounded-xl border border-zinc-900 font-sans">
                        {scanResult.canAttractCrush.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MOTIVATION & PHOTO COMPARISON */}
              {lookmaxSubTab === 'motivation' && (
                <div className="bg-[#141006] border border-amber-900/50 rounded-2xl p-6 md:p-8 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between gap-4 border-b border-amber-950/80 pb-4">
                    <span className="text-base font-black text-amber-400 uppercase tracking-tight flex items-center gap-2">
                      {currentLang === 'english' ? '⚡ BEST FRIEND MOTIVATION' : '⚡ BEST FRIEND MOTIVATION (বেস্ট ফ্রেন্ড মোটিভেশন)'}
                    </span>
                  </div>

                  <div className="p-5 bg-zinc-950/80 border border-amber-950/80 rounded-xl">
                    <p className="text-sm md:text-base font-sans text-amber-200 leading-relaxed font-medium whitespace-pre-line italic">
                      "{scanResult.motivationBengali || (currentLang === 'english'
                        ? 'You got this champion! Stay consistent with the daily habits, and in 30 days your facial definition and glow will shock everyone around you!'
                        : 'তুই পারবি দোস্ত! প্রতিদিনের হ্যাবিট মেনে চল, ১ মাস পরেই তোর আসল চেইঞ্জ তুই দেখতে পাবি!')}"
                    </p>
                  </div>

                  {/* Photo comparison if photos exist */}
                  {photos && photos.length > 0 && (
                    <div className="bg-zinc-950/80 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-amber-400" /> {currentLang === 'english' ? 'Progress Comparison' : 'পূর্বের ছবির সাথে উন্নতি তুলনা (Photo Comparison)'}
                      </span>
                      <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {secScanPhoto && (
                          <div className="text-center space-y-1">
                            <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">
                              {currentLang === 'english' ? 'Current Selfie' : 'বর্তমান সেলফি'}
                            </span>
                            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-500/50 mx-auto">
                              <img src={secScanPhoto} alt="Current scan" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        )}
                        {(() => {
                          const pastPhoto = [...photos].reverse().find(p => p.imageBase64 !== secScanPhoto);
                          if (pastPhoto) {
                            return (
                              <div className="text-center space-y-1 animate-fadeIn">
                                <span className="text-[10px] text-zinc-400 font-mono block">
                                  {currentLang === 'english' ? 'Past Diary Photo' : 'আগের ডায়েরি ছবি'}
                                </span>
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-800 mx-auto opacity-80 animate-pulse">
                                  <img src={pastPhoto.imageBase64} alt="Past photo" className="w-full h-full object-cover" />
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="text-center space-y-1 opacity-50">
                                <span className="text-[10px] text-zinc-500 font-mono block">
                                  {currentLang === 'english' ? 'Past Diary Photo' : 'আগের ডায়েরি ছবি'}
                                </span>
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-850 border-dashed mx-auto flex items-center justify-center text-[8px] text-zinc-500 px-1 text-center">
                                  {currentLang === 'english' ? 'No other photo to compare' : 'তুলনার জন্য অন্য ছবি নেই'}
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                        {currentLang === 'english'
                          ? '💡 Consistency is everything! Following the daily habits will noticeably transform your facial aura in 30 days.'
                          : '💡 দোস্ত, নিয়মিত হাবিট মেনে চললে ১ মাসেই তোর মুখের গ্লো ও স্ট্রাকচার স্পষ্ট বদলে যাবে!'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            )
          )}
        </>
      )}

      {/* HAIR MAXING SUBTAB */}
      {activeSubTab === 'hair_maxing' && (
        <div className="space-y-6 animate-fadeIn">
          <HairMaxing />
        </div>
      )}

      {/* GLOW-UP CHALLENGE & DAILY PHOTO JOURNAL SUBTAB */}
      {activeSubTab === 'challenge_30' && (
        <div className="space-y-6 animate-fadeIn">
          {/* CARD LAYOUT INFO */}
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 glow-gold">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-xl text-zinc-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gold-400 animate-pulse" />
                  Glow-Up Challenge & Daily Photo Journal 🎯
                </h3>
                <p className="text-xs text-zinc-400">
                  প্রতিদিনের সেলফি আপলোড দিয়ে ৩০/৬০/৯০ দিনের গ্লো-আপ চ্যালেঞ্জ মেইনটেইন কর দোস্ত!
                </p>
              </div>

              {/* DURATION CONFIG */}
              <div className="bg-zinc-950/60 border border-zinc-800 p-2 rounded-xl flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 px-2">Cycle Horizon</span>
                {[30, 60, 90].map((days) => (
                  <button
                    key={days}
                    id={`journal-duration-${days}`}
                    onClick={() => setDuration(days as 30 | 60 | 90)}
                    className="px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>

            {/* PROGRESS PREVIEW CHART */}
            <div className="mt-6 pt-5 border-t border-zinc-850 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CalendarCheck className="w-4 h-4 text-gold-500" />
                Uploaded Portrait Count: <span className="text-zinc-100 font-bold">{photos.length}</span> / {duration} Days
              </div>
              <div className="text-xs text-zinc-500">
                {duration - photos.length > 0 ? `${duration - photos.length} days remaining` : 'Challenge completed! Amazing!'}
              </div>
            </div>
          </div>

          <div className="max-w-xl mx-auto">
            {/* DRAG AND DROP ZONE */}
            <div
              id="photo-dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`h-72 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center select-none relative transition-all duration-300 ${
                dragActive
                  ? 'border-gold-400 bg-gold-500/5'
                  : hasUploadedToday
                  ? 'border-emerald-500/20 bg-emerald-950/5'
                  : 'border-zinc-800 bg-[#121214] hover:border-zinc-700'
              }`}
            >
              {isCompressing ? (
                <div className="space-y-3">
                  <Loader2 className="w-10 h-10 text-gold-400 animate-spin mx-auto" />
                  <p className="text-xs font-medium text-zinc-400">Processing visual asset...</p>
                </div>
              ) : hasUploadedToday ? (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-200">Selfie Log Secured!</h4>
                    <p className="text-[11px] text-zinc-500 mt-1">Today's lookup portrait is captured. You can override it anytime by uploading a new photo below.</p>
                  </div>
                  <button
                    id="selfie-override-btn"
                    onClick={triggerUploadClick}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 text-xs rounded-lg flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Re-upload Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gold-400/5 border border-gold-500/20 rounded-full flex items-center justify-center text-gold-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-200">Submit Daily Portrait</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Drag your selfie directly here, or click to choose from directory</p>
                  </div>
                  <button
                    id="selfie-select-btn"
                    onClick={triggerUploadClick}
                    className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-zinc-950 font-bold text-xs uppercase rounded-lg cursor-pointer transition-all"
                  >
                    Select File
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                id="selfie-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODEL TARGET MATCH SUBTAB (আমি যার মতো হতে চাই) */}
      {activeSubTab === 'model_match' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Hidden file inputs */}
          <input
            ref={modelFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleModelFileUpload}
            className="hidden"
          />
          <input
            ref={userModelMatchFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUserModelMatchFileUpload}
            className="hidden"
          />

          <div className="bg-[#121214] border border-gold-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />

            {/* Title */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full tracking-wider font-bold inline-flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                🎯 MODEL MATCHING & TRANSFORMATION ENGINE
              </span>
              <h3 className="font-display font-black text-xl md:text-2xl text-zinc-100 flex items-center gap-2">
                আমি এই মডেলের মতো হতে চাই (Target Model Match)
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-sans max-w-3xl">
                ১. তুমি যে সুন্দর মডেল বা সেলিব্রিটির মতো হতে চাও তার একটি ফটো আপলোড করো। এআই তার ফেসিয়াল অ্যানালিসিস ও রেটিং করবে।<br />
                ২. এরপর তোমার নিজের সেলফি দাও। এআই সুন্দরভাবে বলে দেবে কীভাবে ধাপে ধাপে তুমি ওই মডেলের মতো হতে পারবে!
              </p>
            </div>

            {/* 2-Step Image Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Target Model Upload */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" /> ১. টার্গেট মডেলের ছবি (Target Model Photo)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    মডেল, অভিনেতা বা ইনফ্লুয়েন্সারের স্পষ্ট ফেস ফটো আপলোড করো।
                  </p>
                </div>

                {modelPhoto ? (
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-lg">
                      <img src={modelPhoto} alt="Target Model" className="w-full h-full object-cover" />
                      {modelMatchResult && (
                        <div className="absolute top-3 right-3 bg-zinc-950/90 border border-amber-500/50 px-3 py-1.5 rounded-xl text-amber-400 font-bold text-xs flex items-center gap-1 shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Model Rating: {modelMatchResult.modelRating} / 10</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => modelFileInputRef.current?.click()}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      🔄 অন্য মডেলের ছবি আপলোড করুন
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => modelFileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-amber-300">মডেলের ছবি আপলোড করতে ট্যাপ করো</p>
                    <p className="text-[10px] text-zinc-500">JPG, PNG supported</p>
                  </div>
                )}
              </div>

              {/* Step 2: User Selfie Upload */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" /> ২. আপনার নিজস্ব সেলফি (Your Selfie)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    আপনার নিজের ফ্রন্ট-ফেস সেলফি দিন যাতে এআই তুলনা করতে পারে।
                  </p>
                </div>

                {userModelMatchPhoto ? (
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-lg">
                      <img src={userModelMatchPhoto} alt="Your Selfie" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => userModelMatchFileInputRef.current?.click()}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      🔄 আপনার নিজস্ব ছবি পরিবর্তন করুন
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => userModelMatchFileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-emerald-300">তোমার সেলফি আপলোড করতে ট্যাপ করো</p>
                    <p className="text-[10px] text-zinc-500">JPG, PNG supported</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Trigger Button */}
            {modelPhoto && (
              <button
                onClick={() => triggerModelMatchApi(modelPhoto, userModelMatchPhoto)}
                disabled={isModelMatchLoading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-gold-400 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isModelMatchLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
                    <span>মডেল ফেস অ্যানালাইসিস ও রোডম্যাপ প্রসেসিং হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-zinc-950 fill-zinc-950" />
                    <span>
                      {userModelMatchPhoto
                        ? '🚀 মডেলের মতো হওয়ার রোডম্যাপ তৈরি করো (Generate Roadmap)'
                        : '⭐ মডেলের ফেস অ্যানালাইসিস করো (Analyze Model)'}
                    </span>
                  </>
                )}
              </button>
            )}

            {modelMatchError && (
              <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-2xl text-rose-300 text-xs text-center font-bold">
                ⚠️ {modelMatchError}
              </div>
            )}

            {/* MODEL MATCH RESULT DISPLAY */}
            {modelMatchResult && (
              <div className="space-y-6 pt-6 border-t border-zinc-800 animate-fadeIn">
                {/* Model Overview Card */}
                <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                        Target Model Assessment
                      </span>
                      <h4 className="text-lg font-black text-zinc-100 uppercase tracking-tight mt-1">
                        {modelMatchResult.modelVerdict || 'Aesthetic Model Profile'}
                      </h4>
                    </div>
                    <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-black text-xl flex items-center gap-1.5 shrink-0">
                      <Star className="w-5 h-5 fill-amber-400" />
                      <span>{modelMatchResult.modelRating} <span className="text-xs text-zinc-500 font-normal">/ 10.0</span></span>
                    </div>
                  </div>

                  {modelMatchResult.modelKeyFeatures && modelMatchResult.modelKeyFeatures.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                        🌟 মডেলের প্রধান আকর্ষণীয় ফিচারসমূহ (Key Aesthetics):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {modelMatchResult.modelKeyFeatures.map((feat: string, i: number) => (
                          <div key={i} className="text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                            <span className="text-amber-400 font-bold">★</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* If User Photo is Analyzed Together */}
                {userModelMatchPhoto && modelMatchResult.similaritySummary && (
                  <div className="space-y-6">
                    {/* Match Score Bar */}
                    <div className="bg-gradient-to-r from-amber-950/40 via-zinc-950 to-emerald-950/40 border border-amber-500/30 rounded-2xl p-6 space-y-4 text-center">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                        🎯 Potential Transformation Match Score
                      </span>
                      <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-gold-300 to-emerald-400">
                        {modelMatchResult.matchPercentage || 75}% Match Potential
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl mx-auto font-sans">
                        {modelMatchResult.similaritySummary}
                      </p>
                    </div>

                    {/* 4 Custom Actionable Roadmaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. Hair */}
                      {modelMatchResult.hairTransformationPlan && (
                        <div className="bg-zinc-950/90 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-amber-400" /> 💇‍♂️ ১. মডেলের মতো হেয়ারস্টাইল প্ল্যান
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
                            {modelMatchResult.hairTransformationPlan}
                          </p>
                        </div>
                      )}

                      {/* 2. Jawline & Lean */}
                      {modelMatchResult.jawlineAndFacialLeanPlan && (
                        <div className="bg-zinc-950/90 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-400" /> 🗿 ২. শার্প জ-লাইন ও বোন স্ট্রাকচার গাইড
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
                            {modelMatchResult.jawlineAndFacialLeanPlan}
                          </p>
                        </div>
                      )}

                      {/* 3. Skin & Grooming */}
                      {modelMatchResult.skinAndGroomingPlan && (
                        <div className="bg-zinc-950/90 border border-teal-500/20 rounded-2xl p-5 space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                            <Smile className="w-4 h-4 text-teal-400" /> ✨ ৩. গ্লাস স্কিন ও বিয়ার্ড ট্রিম সেটিং
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
                            {modelMatchResult.skinAndGroomingPlan}
                          </p>
                        </div>
                      )}

                      {/* 4. Posture & Style */}
                      {modelMatchResult.postureAndAttirePlan && (
                        <div className="bg-zinc-950/90 border border-purple-500/20 rounded-2xl p-5 space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-400" /> 👕 ৪. বডি পোস্টার, আইব্রো ও ড্রেসিং সেন্স
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
                            {modelMatchResult.postureAndAttirePlan}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Timeline & Motivation */}
                    <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-6 space-y-4 text-center">
                      <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-mono font-bold">
                        ⏱️ আনুমানিক সময়কাল: {modelMatchResult.estimatedTimeline || '৬০ থেকে ৯০ দিন'}
                      </div>
                      <p className="text-sm font-sans text-amber-200 leading-relaxed font-medium italic">
                        "{modelMatchResult.encouragementBengali}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'challenge_30' && (
        <div className="space-y-6">
          {!activeChallenge ? (
            /* CHALLENGE CREATOR FORM */
            <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden animate-fadeIn space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full tracking-wider font-bold">
                  🎯 Glow-Up Challenge Creator
                </span>
                <h3 className="font-display font-semibold text-xl text-zinc-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                  Start New Custom Glow-Up Challenge
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-2xl">
                  Define your challenge duration, organize your daily grooming routine, lock daily progress selfies, and start looksmax tracking! 🏆
                </p>
              </div>

              {/* 1-CLICK QUICK TEMPLATES */}
              <div className="space-y-3 p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
                <label className="block text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                  🚀 Quick 1-Click Challenge Templates:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      name: "🔥 Jawline & Mewing Pro",
                      desc: "Sculpt a razor-sharp jawline using targeted mewing posture and jaw mastication workouts.",
                      tasks: [
                        "Mewing jaw alignment",
                        "Chewing & jaw training",
                        "Face ice & massage",
                        "Correct posture alignment",
                        "Water hydration"
                      ]
                    },
                    {
                      name: "🧼 Skincare & Glow",
                      desc: "Pore cleansing, sunscreen UV-defense, and hydration replenishment routine.",
                      tasks: [
                        "Skincare & SPF protection",
                        "Face ice & Cold shower",
                        "Sulfate-free facewash",
                        "Good sleep & low sodium",
                        "Healthy diet"
                      ]
                    },
                    {
                      name: "👑 Ultimate Alpha Glow-Up",
                      desc: "The ultimate looksmax bundle: jawline, healthy hair density, athletic physique, and lifestyle habits.",
                      tasks: [
                        "Mewing jaw alignment",
                        "Skincare & SPF protection",
                        "Face ice & Cold shower",
                        "Correct posture alignment",
                        "Chewing exercise & jaw training",
                        "Scalp massage & hair care",
                        "10k steps walk"
                      ]
                    }
                  ].map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCreatorTasks(tpl.tasks);
                        const customEvent = new CustomEvent('in_app_notification', {
                          detail: {
                            title: '📋 Template Loaded',
                            body: `The tasks for "${tpl.name}" have been added to your checklist.`,
                            timestamp: new Date()
                          }
                        });
                        window.dispatchEvent(customEvent);
                      }}
                      className="p-3.5 bg-zinc-950/80 hover:bg-amber-500/10 border border-zinc-900 hover:border-amber-500/30 rounded-2xl text-left transition-all cursor-pointer group"
                    >
                      <span className="block text-xs font-bold text-zinc-150 group-hover:text-amber-400 transition-colors">{tpl.name}</span>
                      <span className="block text-[10px] text-zinc-500 font-sans mt-1 leading-tight">{tpl.desc}</span>
                      <span className="inline-block mt-2 text-[8px] font-mono uppercase bg-zinc-900 text-amber-400 px-2 py-0.5 rounded border border-zinc-800">
                        {tpl.tasks.length} tasks selected
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. SELECT DURATION */}
              <div className="space-y-3 pt-3">
                <label className="block text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                  1. Choose Challenge Duration:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[7, 10, 21, 30, 60].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setCreatorDuration(days)}
                      className={`py-3.5 px-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-1 ${
                        creatorDuration === days
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-black shadow-lg shadow-amber-500/5'
                          : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-sm font-mono">{days} Days</span>
                      <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-semibold font-mono">
                        {days === 7 ? 'Quick Glow' : days === 10 ? 'Protocol' : days === 21 ? 'Habit Sculpt' : days === 30 ? 'Alpha' : 'Ultimate'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. CONFIGURE DAILY TASKS / HABITS */}
              <div className="space-y-3 pt-2">
                <label className="block text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                  2. Daily Routine Checklist:
                </label>
                <p className="text-[10px] text-zinc-500 font-sans">Complete these core discipline habits every single day to maximize your daily score.</p>
                
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                  {creatorTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xl gap-3 text-xs text-zinc-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                        <span className="font-medium font-sans">{task}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleCreatorTask(task)}
                        className="text-red-500 hover:text-red-400 text-xs px-1 cursor-pointer font-bold font-mono"
                        title="Remove task"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Habit */}
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={customTaskInput}
                    onChange={(e) => setCustomTaskInput(e.target.value)}
                    placeholder="e.g., 10k steps walk, sunscreen SPF, cold shower..."
                    className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTask}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-amber-400 hover:text-amber-300 font-bold text-xs rounded-xl cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* 3. LAUNCH ACTION */}
              <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                <p className="text-[10px] text-zinc-500 font-mono">* Starting this challenge awards +100 bonus self-improvement points!</p>
                <button
                  type="button"
                  onClick={handleLaunchChallenge}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2"
                >
                  🚀 Launch {creatorDuration}-Day Glow-Up Challenge
                </button>
              </div>

            </div>
          ) : (
            /* ACTIVE CHALLENGE DASHBOARD */
            <div className="space-y-6">
              
              {/* HEADER STATS BANNER */}
              <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold font-sans">
                        Active Glow-Up Protocol
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        (Started: {activeChallenge.startDate})
                      </span>
                    </div>
                    <h3 className="font-display font-black text-xl text-zinc-100 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      {activeChallenge.duration}-Day Custom Looksmax Challenge
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-sans">
                      Check off your habits daily, upload progress selfies, and write daily notes to visualize your transformation!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                    {/* STATS */}
                    <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl px-4 py-3 flex items-center gap-3">
                      <div className="text-right">
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-550 font-mono font-bold">Champion Progress</span>
                        <span className="text-xs font-bold text-zinc-200 font-mono">
                          {Object.keys(activeChallenge.progress).filter(k => (activeChallenge.progress[k]?.completedTasks || []).length === activeChallenge.tasks.length).length} / {activeChallenge.duration} Days Complete
                        </span>
                      </div>
                      <div className="h-2 w-20 bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                          style={{ width: `${(Object.keys(activeChallenge.progress).filter(k => (activeChallenge.progress[k]?.completedTasks || []).length === activeChallenge.tasks.length).length / activeChallenge.duration) * 100}%` }} 
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetChallenge}
                      className="px-3.5 py-2.5 bg-zinc-950/40 hover:bg-red-500/10 border border-zinc-900 hover:border-red-500/20 text-zinc-500 hover:text-red-400 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* DAY BY DAY EXPANDABLE CHANNELS LIST */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: activeChallenge.duration }, (_, index) => {
                  const dayNum = index + 1;
                  const dayProg = activeChallenge.progress[dayNum] || { completedTasks: [] };
                  const selfie = dayProg.selfieBase64;
                  const isCompleted = activeChallenge.tasks.length > 0 && dayProg.completedTasks.length === activeChallenge.tasks.length;

                  return (
                    <div
                      key={dayNum}
                      className={`bg-zinc-950/80 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                        isCompleted
                          ? 'border-[#10b981]/30 shadow-lg shadow-[#10b981]/5'
                          : selfie
                          ? 'border-amber-500/25'
                          : 'border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="p-4 border-b border-zinc-900/60 bg-zinc-950/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-[#10b981] animate-pulse' : selfie ? 'bg-[#f59e0b]' : 'bg-zinc-700'}`} />
                          <span className="text-xs font-black font-sans text-zinc-200">Day {dayNum} Protocol</span>
                        </div>
                        {isCompleted && (
                          <span className="text-[9px] font-bold bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20 px-2 py-0.5 rounded-full font-sans">
                            SUCCESS 🏆
                          </span>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                        {/* Selfie Section */}
                        <div className="space-y-2">
                          <span className="block text-[9px] uppercase font-mono tracking-widest text-zinc-550 font-bold">
                            📷 Today's Progress Selfie:
                          </span>
                          
                          {selfie ? (
                            <div className="relative h-40 rounded-xl overflow-hidden border border-zinc-900 group">
                              <img
                                src={selfie}
                                alt={`Day ${dayNum} selfie`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center pointer-events-auto">
                                <div className="space-y-2">
                                  <p className="text-[10px] text-zinc-300 font-sans italic leading-tight">
                                    "{dayProg.caption || 'No progress notes logged yet.'}"
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDayForUpload(dayNum)}
                                    className="px-2.5 py-1.5 bg-amber-500 text-zinc-950 font-bold text-[9px] uppercase rounded-lg transition-all cursor-pointer"
                                  >
                                    Update Selfie / Note
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedDayForUpload(dayNum)}
                              className="w-full h-40 bg-zinc-950 border border-dashed border-zinc-850 hover:border-amber-500/30 rounded-xl flex flex-col items-center justify-center p-4 text-center text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                            >
                              <Camera className="w-6 h-6 mb-2 text-zinc-600 hover:text-amber-400 transition-colors" />
                              <span className="block text-[11px] font-bold font-sans">Upload Today's Selfie</span>
                              <span className="text-[8px] uppercase tracking-widest text-zinc-650 font-mono mt-0.5 font-bold">READY TO CAPTURE</span>
                            </button>
                          )}
                        </div>

                        {/* Daily Checklist Section */}
                        <div className="space-y-2 pt-2 border-t border-zinc-900/40">
                          <div className="flex items-center justify-between">
                            <span className="block text-[9px] uppercase font-mono tracking-widest text-zinc-550 font-bold">
                              📝 Daily Routine Checklist ({dayProg.completedTasks.length} / {activeChallenge.tasks.length}):
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCompleteAllTasksForDay(dayNum)}
                              className="text-[9px] font-bold text-amber-400 hover:text-amber-300 font-sans flex items-center gap-1 cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 hover:scale-[1.02] transition-all"
                            >
                              ⚡ {dayProg.completedTasks.length === activeChallenge.tasks.length ? "Reset Day" : "Complete All"}
                            </button>
                          </div>
                          
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {activeChallenge.tasks.map((task: string, idx: number) => {
                              const isTaskDone = dayProg.completedTasks.includes(task);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleToggleTaskForDay(dayNum, task)}
                                  className={`w-full text-left p-2 rounded-lg border text-[11px] font-sans flex items-center gap-2 transition-all cursor-pointer ${
                                    isTaskDone
                                      ? 'bg-zinc-900/60 border-zinc-850 text-zinc-300'
                                      : 'bg-zinc-950 border-transparent text-zinc-500 hover:bg-zinc-900/30'
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    isTaskDone ? 'bg-[#10b981] border-[#10b981] text-zinc-950' : 'border-zinc-800'
                                  }`}>
                                    {isTaskDone && "✓"}
                                  </span>
                                  <span className={`truncate font-medium ${isTaskDone ? 'line-through text-zinc-500' : ''}`}>{task}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Modal / Uplink Frame for Selfie Camera */}
          <AnimatePresence>
            {selectedDayForUpload !== null && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#121214] border border-zinc-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
                >
                  <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
                    <h4 className="font-display font-black text-xs uppercase text-amber-400 tracking-wider">
                      📷 Progress Selfie: Day {selectedDayForUpload}
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedDayForUpload(null);
                        setTempCaption('');
                        setTempImageFile(null);
                        setTempImagePreview(null);
                      }}
                      className="text-zinc-550 hover:text-zinc-350 font-mono text-xs cursor-pointer font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Image selector */}
                    <div
                      onClick={() => tempFileInputRef.current?.click()}
                      className="h-44 rounded-xl border border-zinc-850 bg-zinc-950/60 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-zinc-700 transition-colors"
                    >
                      {tempImagePreview ? (
                        <img src={tempImagePreview} className="h-full w-auto object-contain rounded" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="space-y-2 text-zinc-550">
                          <ImageIcon className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                          <p className="text-xs font-semibold text-zinc-250 font-sans">Select photo from gallery or camera</p>
                          <p className="text-[10px] text-zinc-600 font-sans">Click to select portrait / selfie file</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={tempFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleTempFileSelect}
                      className="hidden"
                    />

                    {/* Annotation Caption text */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-550">
                        Today's Reflection / Progress Note (Caption):
                      </label>
                      <input
                        type="text"
                        value={tempCaption}
                        onChange={(e) => setTempCaption(e.target.value)}
                        placeholder="e.g., feeling refreshed, consistent mewing, completed skincare..."
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-2.5 px-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 font-sans"
                      />
                    </div>
                  </div>

                  <div className="p-5 border-t border-zinc-900 bg-zinc-950/50 flex gap-3 justify-end bg-zinc-950">
                    <button
                      onClick={() => {
                        setSelectedDayForUpload(null);
                        setTempCaption('');
                        setTempImageFile(null);
                        setTempImagePreview(null);
                      }}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-lg cursor-pointer animate-none font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChallengeDay}
                      disabled={!tempImageFile}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 font-bold text-xs uppercase rounded-lg cursor-pointer transition-colors"
                    >
                      Save Progress 🏆
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {activeSubTab === 'photo_journal' && (
        <div className="space-y-6 animate-fadeIn">
          {/* HEADER CARD */}
          <div className="bg-[#121214] border border-gold-500/30 rounded-3xl p-6 md:p-8 space-y-3 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
            <span className="text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full tracking-wider font-bold inline-flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              📁 PHOTO JOURNAL GALLERY
            </span>
            <h3 className="font-display font-black text-xl md:text-2xl text-zinc-100">
              আপনার আপলোড করা সকল ছবি (Selfie & Progress Journal)
            </h3>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              এখানে আপনার সকল স্ক্যান ও গ্লো-আপ জার্নালের ছবি সংরক্ষিত থাকবে। <br />
              <strong className="text-amber-400">💡 টিপস:</strong> ছবি ডিলিট করতে চাইলে ছবির উপর কিছুক্ষণ (Hold) চেপে ধরে রাখুন, তাহলে ডিলিট অপশন দেখতে পাবেন।
            </p>
          </div>

          {/* UPLOAD NEW PHOTO BUTTON */}
          <div className="flex justify-between items-center bg-zinc-950 border border-zinc-900 rounded-2xl p-4">
            <span className="text-xs font-mono text-zinc-400">
              মোট সংরক্ষিত ছবি: <strong className="text-amber-400 font-bold">{photos.length + (secScanPhoto ? 1 : 0)} টি</strong>
            </span>
            <button
              onClick={triggerUploadClick}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow"
            >
              <Upload className="w-3.5 h-3.5" /> নতুন ছবি যোগ করুন
            </button>
          </div>

          {/* ALL PHOTOS GRID */}
          {photos.length === 0 && !secScanPhoto ? (
            <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-3xl p-12 text-center space-y-3">
              <Camera className="w-10 h-10 text-zinc-600 mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-zinc-300">কোনো ছবি সংরক্ষিত নেই</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                উপরে 'নতুন ছবি যোগ করুন' বাটনে চাপ দিয়ে বা এআই স্ক্যান করে আপনার প্রথম ফটো আপলোড করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {secScanPhoto && (
                <div
                  onMouseDown={() => handlePhotoPressStart('sec_scan_main')}
                  onTouchStart={() => handlePhotoPressStart('sec_scan_main')}
                  onMouseUp={handlePhotoPressEnd}
                  onTouchEnd={handlePhotoPressEnd}
                  onMouseLeave={handlePhotoPressEnd}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-zinc-950 shadow-lg group cursor-pointer select-none"
                >
                  <img src={secScanPhoto} alt="Recent scan photo" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-zinc-950/80 border border-amber-500/40 px-2 py-0.5 rounded-md text-[9px] font-mono text-amber-400 font-bold">
                    স্ক্যান ফেস ফটো
                  </div>

                  {heldPhotoId === 'sec_scan_main' && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-fadeIn">
                      <p className="text-[10px] text-zinc-300 mb-2 font-bold text-center">স্ক্যান ফটো মুছে ফেলবেন?</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSecScanPhoto(null);
                          setHeldPhotoId(null);
                          triggerNotification("🗑️ ডিলিট করা হয়েছে", "স্ক্যান ফটো মুছে ফেলা হয়েছে!");
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                      >
                        🗑️ ডিলিট করুন
                      </button>
                    </div>
                  )}
                </div>
              )}

              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onMouseDown={() => handlePhotoPressStart(photo.id)}
                  onTouchStart={() => handlePhotoPressStart(photo.id)}
                  onMouseUp={handlePhotoPressEnd}
                  onTouchEnd={handlePhotoPressEnd}
                  onMouseLeave={handlePhotoPressEnd}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow group cursor-pointer select-none transition-all hover:border-zinc-700"
                >
                  <img src={photo.imageBase64} alt={photo.caption || 'Selfie'} className="w-full h-full object-cover" />
                  
                  {photo.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2.5 pt-6">
                      <p className="text-[10px] text-zinc-200 line-clamp-1 font-sans">{photo.caption}</p>
                      <span className="text-[8px] text-zinc-400 font-mono block">{photo.date}</span>
                    </div>
                  )}

                  {heldPhotoId === photo.id && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-fadeIn">
                      <p className="text-[10px] text-zinc-300 mb-2 font-bold text-center">ছবিটি ডিলিট করতে চান?</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id, photo.date);
                          setHeldPhotoId(null);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                      >
                        🗑️ ডিলিট করুন
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
