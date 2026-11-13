import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Loader2, RefreshCw, Zap, Star, ShieldAlert,
  Sparkles, CheckCircle2, Bookmark, HelpCircle, BookOpen, ShoppingBag, Search, Eye,
  Paperclip, Image as ImageIcon, X, Trophy, Activity, Dumbbell, ExternalLink, Globe,
  Phone, PhoneOff, Volume2, Heart, Plus, Trash2, Mic, MoreVertical, ArrowLeft, Menu, User
} from 'lucide-react';
import { triggerNotification } from '../utils';
import LoveAngelFull from './LoveAngelFull';
import loveAngelBannerImg from '../assets/images/love_angle_prio2ma_exact_1787165356685.jpg';

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

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  imageBase64?: string;
  videoFileName?: string;
}

interface AiChatRoasterProps {
  completedHabitsCount: number;
  totalHabitsCount: number;
  waterDrank: number;
  photosUploaded: number;
  points?: number;
  onBack?: () => void;
}

// Interactive Full Body & Face Routine Task
interface GoalTask {
  id: string;
  text: string;
  category: 'face' | 'body' | 'grooming';
  completed: boolean;
}

interface BDProduct {
  name: string;
  brand: string;
  category: string;
  priceBdt: string;
  source: 'Arogga & Daraz' | 'Arogga Only' | 'Daraz Only';
  rating: string;
  benefit: string;
  howToUse: string;
  concern: string;
  aroggaQuery: string;
  darazQuery: string;
}

interface Crush {
  id: string;
  name: string;
  status: string; // e.g. "Crush", "Sweetheart", "Secret Lover"
  number?: string;
  personality?: string;
  currentSituation?: string;
  address?: string;
  arabicOilOption?: string;
  details?: string;
}

const LOCAL_BD_PRODUCTS: BDProduct[] = [
  {
    name: "CeraVe Foaming Facial Cleanser (for Normal to Oily Skin)",
    brand: "CeraVe",
    category: "🧼 Face Wash",
    priceBdt: "৳1,320 - ৳1,450",
    source: "Arogga & Daraz",
    rating: "4.8",
    benefit: "Removes excess sebum, builds ceramides, maintains natural skin balance.",
    howToUse: "Wash face morning and night with lukewarm water. Massage gently for 60 seconds.",
    concern: "Oily skin, Acne, Open Pores, Everyday dirt",
    aroggaQuery: "cerave foaming facial cleanser",
    darazQuery: "cerave foaming facial cleanser"
  },
  {
    name: "CeraVe Hydrating Facial Cleanser (Normal to Dry Skin)",
    brand: "CeraVe",
    category: "🧼 Face Wash",
    priceBdt: "৳1,320 - ৳1,450",
    source: "Arogga & Daraz",
    rating: "4.9",
    benefit: "Deep non-foaming hydration contains premium Hyaluronic acid and 3 essential ceramides.",
    howToUse: "Apply morning & night. Cleanse gently without stripping modern skin moisture.",
    concern: "Dry skin, Flaky texture, Damaged skin barrier",
    aroggaQuery: "cerave hydrating facial cleanser",
    darazQuery: "cerave hydrating facial cleanser"
  },
  {
    name: "Cosrx Low pH Good Morning Gel Cleanser",
    brand: "COSRX",
    category: "🧼 Face Wash",
    priceBdt: "৳920 - ৳1,050",
    source: "Arogga & Daraz",
    rating: "4.7",
    benefit: "Infused with botanical tea tree oil and natural BHA to gently dissolve deep-pore residue.",
    howToUse: "Squeeze onto wet hands, lather well, apply with focus on greasy forehead & T-zone.",
    concern: "Sensitive skin, Morning shiny-oil, Mild acne breakouts",
    aroggaQuery: "cosrx low ph good morning gel",
    darazQuery: "cosrx low ph good morning cleanser"
  },
  {
    name: "Simple Kind to Skin Refreshing Facial Wash",
    brand: "Simple",
    category: "🧼 Face Wash",
    priceBdt: "৳380 - ৳450",
    source: "Arogga & Daraz",
    rating: "4.6",
    benefit: "100% soap-free cleanser, enriched with Pro-Vitamin B5 and active nourishing Vitamin E.",
    howToUse: "Apply to wet face morning and evening, rinse dry. Best for zero irritation.",
    concern: "Redness, irritation, highly sensitive young skincare",
    aroggaQuery: "simple refreshing facial wash",
    darazQuery: "simple refreshing facial wash 150ml"
  },
  {
    name: "Himalaya Purifying Neem Face Wash (50ml)",
    brand: "Himalaya",
    category: "🧼 Face Wash",
    priceBdt: "৳150 - ৳220",
    source: "Arogga & Daraz",
    rating: "4.5",
    benefit: "Natural neem and turmeric formulation to prevent acne and clear skin.",
    howToUse: "Use daily morning and evening.",
    concern: "Acne prone skin",
    aroggaQuery: "himalaya neem face wash",
    darazQuery: "himalaya neem face wash"
  },
  {
    name: "Skin Aqua UV Super Moisture Gel SPF 50+ PA++++",
    brand: "Rohto Skin Aqua",
    category: "☀️ Sun Protection",
    priceBdt: "৳1,350 - ৳1,480",
    source: "Arogga & Daraz",
    rating: "4.8",
    benefit: "Lightweight gel sunscreen with no white cast, perfect for sunny daily protection.",
    howToUse: "Apply generously on exposed skin 15 mins before heading outside.",
    concern: "Sun damage, tanning, aging prevention",
    aroggaQuery: "skin aqua uv super moisture gel",
    darazQuery: "skin aqua uv gel spf50"
  },
  {
    name: "Neutrogena Hydro Boost Water Gel",
    brand: "Neutrogena",
    category: "🧴 Hydration",
    priceBdt: "৳1,400 - ৳1,650",
    source: "Arogga & Daraz",
    rating: "4.9",
    benefit: "Deep hydration with hyaluronic acid for soft, plump skin.",
    howToUse: "Apply on clean face morning and night.",
    concern: "Dry skin, dehydration",
    aroggaQuery: "neutrogena hydro boost",
    darazQuery: "neutrogena hydro boost gel"
  }
];

const BEST_FRIEND_OPENERS = [
  "কিরে মামা! ", "আরে চ্যাম্পিয়ন! ", "শুনছিস ভাই? ", "দোস্ত শোন! ", "আরে অলফা গড! ", "মামা শোন! ", "আমার প্রিয় দোস্ত! ", "কিরে ভাইরে ভাই! ", "আরে শের ভাই! "
];

export interface QuickMsgQuote {
  en: string;
  bn: string;
}

export const HAPPY_QUOTES: QuickMsgQuote[] = [
  {
    en: "Keep a big smile and throw the stress away,\nEnjoy every moment and shine through the day!",
    bn: "আজ কোনো ফালতু প্যারা নিবি না মামা,\nমন ফুরফুরে রাখ, তুই হাসলেই সব জয়! 😊✨"
  },
  {
    en: "Take a deep breath and let your heart feel light,\nEverything is fine and everything is bright!",
    bn: "এক কাপ গরম চা খা আর রিল্যাক্স কর ভাই,\nতোর এই সুন্দর হাসিটার চেয়ে দামি আর কিছু নাই! ☕💖"
  },
  {
    en: "Let the dark fade and let the sunshine glow,\nTrust the good vibes and let the happiness flow!",
    bn: "অতীতের দুশ্চিন্তা বাতাসে উড়িয়ে দে দোস্ত,\nআজকের দিনটা তোর, মন খুলে চিল কর! 🌞🎈"
  },
  {
    en: "Play your favorite song and dance with the beat,\nLife is so sweet when you stand on your feet!",
    bn: "পছন্দের গানটা ছেড়ে দিয়ে একটু মন ভালো কর মামা,\nতুই পাশে আছিস এটাই তো আমাদের বড় আনন্দ! 🎵🕺"
  },
  {
    en: "Spread positive vibes and throw away the doubt,\nYour happy inner soul is what life is all about!",
    bn: "সব বাজে চিন্তা বাদ দিয়ে এক গাল মুচকি হাসি দে,\nতোর খুশির সামনে কোনো বিষাদ টিকবে না ভাই! 😄✨"
  },
  {
    en: "Look up at the sky and feel the gentle breeze,\nPut a smile on your face and live with pure ease!",
    bn: "একটু খোলা বাতাসে দাঁড়িয়ে মনটা রিফ্রেশ কর,\nআজকের এই স্পেশাল দিনটা একদম উপভোগ কর! 🌸🎈"
  },
  {
    en: "Smile from your heart and let your spirit rise,\nSee the beautiful world through your own eyes!",
    bn: "আরে শের ভাই! মন খারাপের কোনো চান্স নাই,\nতোর এক হাসিতেই সব কষ্ট হাওয়া হয়ে যাবে! 🌟😊"
  },
  {
    en: "Leave the heavy worries and dance in the rain,\nJoy is returning and clearing every pain!",
    bn: "দোস্ত শোন, মনটা হালকা করে হাসির গান গা,\nআজকের রিল্যাক্স মুডে শুধুই আনন্দমেলা ভাই! 🎉✨"
  }
];

export const MOTIVATE_QUOTES: QuickMsgQuote[] = [
  {
    en: "Work hard today and make your dreams come true,\nNothing can stop the fire inside of you!",
    bn: "আলসেমি ঝেড়ে ফেলে এখনই কাজে নাম ভাই,\nআজকের কঠিন পরিশ্রমই তোকে কালকে কিং বানাবে! 🔥👊"
  },
  {
    en: "Stand up with pride and face the tough fight,\nKeep pushing forward with all of your might!",
    bn: "ভয় পেয়ে বসে থাকার লোক তুই না মামা,\nসোজা হয়ে দাঁড়া আর মাঠ কাঁপিয়ে কাজ শেষ কর! 🦁⚡"
  },
  {
    en: "Focus on your goal and never lose your pace,\nYou are born a winner, you will win the race!",
    bn: "কে কী বলল থোড়াই কেয়ার কর দোস্ত,\nতোর লক্ষ্য ঠিক রাখ, তোকে বিজয়ী হতে হবেই! 🎯💥"
  },
  {
    en: "No more excuses, it's time to build your name,\nTurn all your hard pain into golden fame!",
    bn: "অজুহাত দেওয়া বন্ধ করে কাজে নেমে পড় মামা,\nতোর আজকের ঘামই কালকের সেরা ট্রফি হবে! 🏆🔥"
  },
  {
    en: "Wake up with power and chase your high dream,\nYou are stronger today than you could ever seem!",
    bn: "চোখেমুখে পানি দিয়ে আগুন মন নিয়ে নাম ভাই,\nতোর ভেতরের সুপ্ত সিংহটাকে আজ জাগিয়ে দে! 🦁🚀"
  },
  {
    en: "Keep your spine straight and work until you win,\nLet the new glory and ultimate victory begin!",
    bn: "মেরুদণ্ড সোজা কর আর নিজের ওপর বিশ্বাস রাখ,\nতোর নামেই কিন্তু কালকের জয়লেখা থাকবে! 👑✨"
  },
  {
    en: "Break through the wall and rise above the crowd,\nMake your own story that makes everyone proud!",
    bn: "শুনছিস ভাই? কোনো বাঁধাই তোকে থামাতে পারবে না,\nআজ রাত কাটুক কঠোর পরিশ্রমে, সাফল্য আসবেই! 💪👑"
  },
  {
    en: "Never step back when the storm gets rough,\nYou are a true champion, built super tough!",
    bn: "আরে চ্যাম্পিয়ন! এক সেকেন্ড সময় নষ্ট না করে লেগে পড়,\nতোর বীরত্ব আর জেদের সামনে পাহাড়ও নুইয়ে যাবে! ⚡🔥"
  }
];

export const LOVE_QUOTES: QuickMsgQuote[] = [
  {
    en: "Build up your worth and respect who you are,\nTrue love will find you no matter how far!",
    bn: "আগে নিজেকে এক নম্বরে নিয়ে আয় আর ইগো বাদ দে দোস্ত,\nসঠিক মান সম্মান আর ভালোবাসা তুই এমনিতেই পাবি! 💖👑"
  },
  {
    en: "Speak with a calm heart and throw away the pride,\nLove becomes pure when you stay side by side!",
    bn: "ভালোবাসার জায়গায় ইগো রাখিস না ভাই,\nশান্ত মাথায় বুঝিয়ে বল, সব ভুল বোঝাবুঝি দূর হয়ে যাবে! 💞🌸"
  },
  {
    en: "Love yourself first and keep your mind clean,\nBe the best person that you have ever seen!",
    bn: "কাউকে ভালোবাসার আগে নিজের খেয়াল রাখ মামা,\nতুই যখন সেরা মানুষ হবি, বিশ্ব তোকে সম্মান করবে! 🌹✨"
  },
  {
    en: "Care for each other with trust and with grace,\nMake love the safest and happiest place!",
    bn: "ভালোবাসার মানুষটা যেন তোর ওপর বিশ্বাস রাখতে পারে,\nএমন এক খাঁটি আর দায়িত্বশীল মানুষ হ ভাই! 💐😊"
  },
  {
    en: "Forgive small mistakes and hold your hands tight,\nTogether you two will make the future so bright!",
    bn: "ছোটখাটো অভিমান ভুলে একটু ভালোবেসে জড়িয়ে ধর,\nতোদের বন্ডিং আর ভালোবাসা সারাজীবন অটুট থাক! 💕🌟"
  },
  {
    en: "Glow in your spirit and respect every soul,\nKindness and true loyalty will make you whole!",
    bn: "শ্রদ্ধা আর বিশ্বাস দিয়ে সম্পর্ক মজবুত রাখ মামা,\nপ্রকৃত ভালোবাসা কখনোই হারিয়ে যায় না ভাই! ❤️🕊️"
  }
];

export const LOOKSMAX_QUOTES: QuickMsgQuote[] = [
  {
    en: "Drink your water clean and keep your posture straight,\nSmall daily habits will make your grooming great!",
    bn: "ঠান্ডা পানি খা আর মেরুদণ্ড টানটান করে বোস মামা,\nতোর প্রতিদিনের এই ছোট অভ্যাসই তোকে প্রিমিয়াম বানাবে! 💧😎"
  },
  {
    en: "Clean up your face and sweat out the gym,\nKeep your mind sharp and your posture so trim!",
    bn: "ফেস ওয়াশ আর ওয়ার্কআউটে ফাঁকি দিবি না দোস্ত,\nতোর এই চমৎকার গ্লো-আপ দেখে সবাই অবাক হয়ে যাবে! 🏋️‍♂️✨"
  },
  {
    en: "Ice up your skin and wear a stylish smile,\nYour classy confidence will shine for a mile!",
    bn: "বরফ দিয়ে ফেস কমপ্রেস কর আর জোস একটা হাসি দে,\nতোর ক্লাসি অ্যাটিটিউডই তোকে ভিড়ের মাঝে আলাদা করবে! ❄️💎"
  },
  {
    en: "Care for your hair and stand with your chest wide,\nWalk like a king with ultimate power and pride!",
    bn: "চুলটা সুন্দর পরিপাটি কর আর শোল্ডার চওড়া করে হাঁট,\nতোর এই রয়েল লুকসমাক্স রূপান্তর আগুন জ্বালিয়ে দেবে! 💆‍♂️🔥"
  },
  {
    en: "Fix up your posture and shine in the light,\nYour sharp glow-up makes your aura so bright!",
    bn: "আজকের স্কিনকেয়ার আর গ্রুমিং শেষ করে ফেলা ভাই,\nআয়নায় নিজের গ্লো দেখে নিজেই ফিদা হয়ে যাবি! 🌟🔍"
  }
];

export function getRandomQuote(quotes: QuickMsgQuote[]): string {
  const item = quotes[Math.floor(Math.random() * quotes.length)];
  return `${item.en}\n\n${item.bn}`;
}

function getGrowgramCaption(idx: number) {
  const captions: Record<number, { poetry: string; deep: string; handle: string; location: string; imageBg: string }> = {
    0: {
      poetry: "🧼 ফোমিং জাদুতে মুছে যাক ক্লান্তি,\nত্বকে ফিরে আসুক এক অনাবিল শান্তি!",
      deep: "প্রতিদিনের ধুলোবালি ও দূষণ আপনার ত্বকের স্বাভাবিক উজ্জ্বলতা কেড়ে নেয়। এই জেন্টল ক্লিনজার ব্যবহার করে ত্বককে রাখুন ফ্রেশ, সজীব ও প্রাণবন্ত।",
      handle: "glow_skincare",
      location: "Dhaka, Bangladesh",
      imageBg: "from-amber-900/40 via-yellow-950/20 to-black"
    }
  };
  return captions[idx] || {
    poetry: "✨ সৌন্দর্য লুকিয়ে থাকে নিজের সঠিক পরিচর্যায়!",
    deep: "ত্বক এবং ব্যক্তিত্বকে সুন্দর ও পরিচ্ছন্ন রাখতে সঠিক যত্ন অত্যন্ত প্রয়োজন।",
    handle: "glowup_bd",
    location: "GlowUp HQ",
    imageBg: "from-purple-900/40 via-zinc-900/20 to-black"
  };
}

export default function AiChatRoaster({ 
  completedHabitsCount, 
  totalHabitsCount, 
  waterDrank, 
  photosUploaded, 
  points = 0, 
  onBack 
}: AiChatRoasterProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_chat_messages_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
          }));
        }
      }
    } catch (e) {}
    return [
      {
        id: 'init-msg',
        role: 'model',
        content: "হেলো চ্যাম্পিয়ন! কী খবর বল? আজকে তোর কোন দিকটা নিয়ে কাজ করতে চাস? তোর সব লক্ষ্য, দ্বিধা বা মনের কথা আজ একদম মন খুলে শেয়ার করতে পারিস, তোর প্রিয় বেস্ট ফ্রেন্ড হিসেবে আমি শুনছি।",
        timestamp: new Date()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('selfx_chat_messages_v2', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  const [subTab, setSubTab] = useState<'chat' | 'love_angel' | 'guides' | 'products'>('chat');

  const [inputValue, setInputValue] = useState('');
  const [activeDisplayQuote, setActiveDisplayQuote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTurboMode, setIsTurboMode] = useState(true); // Turbo mode active by default for fast responses!
  const [loveAngelActivated, setLoveAngelActivated] = useState(false);
  const [detectedCrushName, setDetectedCrushName] = useState('');
  const [showCrushAdvisor, setShowCrushAdvisor] = useState(false);
  const [loveAngelCrushName, setLoveAngelCrushName] = useState('');
  const [loveAngelTopic, setLoveAngelTopic] = useState('how_to_talk');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Topic State
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showThreeDots, setShowThreeDots] = useState(false);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(true);
  const lastChatScrollTopRef = useRef(0);
  const [threeDotsTab, setThreeDotsTab] = useState<'menu' | 'love_angel' | 'my_social'>('menu');

  const [customUserName, setCustomUserName] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('lookmax_user_profile_v2');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.name) return p.name;
      }
    } catch (e) {}
    return localStorage.getItem('selfx_custom_user_name') || 'চ্যাম্পিয়ন';
  });

  const [customFatherName, setCustomFatherName] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('lookmax_user_profile_v2');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.fatherName) return p.fatherName;
      }
    } catch (e) {}
    return localStorage.getItem('selfx_custom_father_name') || '';
  });

  const [showIdentityEdit, setShowIdentityEdit] = useState(false);

  const saveIdentityNames = (name: string) => {
    const trimmedName = name.trim() || 'চ্যাম্পিয়ন';
    setCustomUserName(trimmedName);
    localStorage.setItem('selfx_custom_user_name', trimmedName);
    
    // Also sync to global user profile
    try {
      const savedProfile = localStorage.getItem('lookmax_user_profile_v2');
      const existing = savedProfile ? JSON.parse(savedProfile) : {};
      existing.name = trimmedName;
      localStorage.setItem('lookmax_user_profile_v2', JSON.stringify(existing));
    } catch (e) {}

    setShowIdentityEdit(false);
    triggerNotification("🤝 Identity Saved", `তোমার নিজের পরিচয় ও নাম "${trimmedName}" সেভ করা হয়েছে!`);
  };

  const [customPartnerName, setCustomPartnerName] = useState(() => {
    return localStorage.getItem('selfx_custom_partner_name') || 'My Angel';
  });

  // Crush Saver State
  const [crushes, setCrushes] = useState<Crush[]>(() => {
    const saved = localStorage.getItem('lookmax_crush_list_v2');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Nusrat Jahan', status: 'Crush', number: '01712345678', personality: 'মিষ্টি ও লাজুক (Shy & Sweet)', currentSituation: 'কথা হয় মাঝে মাঝে (Talking sometimes)' },
      { id: '2', name: 'Fariha Rahman', status: 'Secret Love', number: '01987654321', personality: 'একটু অভিমানী (Rude/Emotional)', currentSituation: 'ক্লাসমেট (Classmates)' }
    ];
  });

  const [newCrushName, setNewCrushName] = useState('');
  const [newCrushStatus, setNewCrushStatus] = useState('Crush');
  const [newCrushNumber, setNewCrushNumber] = useState('');
  const [newCrushPersonality, setNewCrushPersonality] = useState('মিষ্টি ও লাজুক (Shy & Sweet)');
  const [newCrushSituation, setNewCrushSituation] = useState('কথা হয় মাঝে মাঝে (Talking sometimes)');
  const [newCrushAddress, setNewCrushAddress] = useState('');
  const [newCrushArabicOilOption, setNewCrushArabicOilOption] = useState('');

  // Voice Call Simulator States
  const [isCalling, setIsCalling] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [spokenText, setSpokenText] = useState<string>('');

  // File Attachment states (Supporting Image AND Videos)
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileType, setAttachedFileType] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const chatFileRef = useRef<HTMLInputElement>(null);

  // QUICK HAPPY & QUICK MOTIVATE NEW EXPERIENCES
  const [quickMotivationText, setQuickMotivationText] = useState<string | null>(null);
  const [quickMotivationTitle, setQuickMotivationTitle] = useState<string>('');
  const [showSecretAudioModal, setShowSecretAudioModal] = useState(false);
  const [showLoveAngelFull, setShowLoveAngelFull] = useState(false);
  
  // Custom audio files loaded from mobile (persisted in IndexedDB to prevent localstorage 5MB quota errors!)
  const [customAudioList, setCustomAudioList] = useState<{id: string, name: string, data: string, category?: string, analysis?: string}[]>([]);

  // Load custom audios from IndexedDB on mount
  useEffect(() => {
    getAllCustomAudios()
      .then(audios => {
        setCustomAudioList(audios);
      })
      .catch(err => {
        console.warn("Failed to load custom audios from IndexedDB:", err);
      });
  }, []);

  const DEFAULT_TRACKS: { name: string; url: string }[] = [];

  // Selected motivation audio: starts empty, no default tracks anymore!
  const [activeAudioKey, setActiveAudioKey] = useState<string>(() => {
    return localStorage.getItem('motivation_active_audio_key_v2') || "";
  });

  const [moodTracks, setMoodTracks] = useState<Record<'happy' | 'motivate' | 'love', string>>(() => {
    const saved = localStorage.getItem('motivation_mood_tracks_v3');
    return saved ? JSON.parse(saved) : {
      happy: '',
      motivate: '',
      love: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('motivation_mood_tracks_v3', JSON.stringify(moodTracks));
  }, [moodTracks]);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("All");
  const [productQuery, setProductQuery] = useState<string>("");
  
  // Grow Gram States (Instagram Interface)
  const [growgramLikes, setGrowgramLikes] = useState<Record<number, { count: number; liked: boolean }>>({});
  const [growgramBookmarks, setGrowgramBookmarks] = useState<Record<number, boolean>>({});
  const [growgramComments, setGrowgramComments] = useState<Record<number, { author: string; text: string }[]>>({});
  const [activeStory, setActiveStory] = useState<{ name: string; avatarBg: string; text: string; imageEmoji: string } | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [doubleClickAnims, setDoubleClickAnims] = useState<Record<number, boolean>>({});

  const playMotivationAudio = (key: string) => {
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
          audioPlayerRef.current.play().catch(e => console.log("Custom audio play deferred:", e));
        }
      }
    } catch (e) {
      console.error("Error playing audio", e);
    }
  };

  const playMotivationAudioWithMood = (mood: 'happy' | 'motivate' | 'love') => {
    const trackKey = moodTracks[mood];
    if (trackKey) {
      playMotivationAudio(trackKey);
    } else {
      // Find any custom audio uploaded that matches this category as a smart fallback,
      // otherwise ask the user to upload one!
      const matchingCustomIdx = customAudioList.findIndex(a => a.category === mood);
      if (matchingCustomIdx !== -1) {
        const key = `custom-${matchingCustomIdx}`;
        playMotivationAudio(key);
      } else {
        // No custom audio uploaded/set, show a beautiful notification advising the user to upload
        triggerNotification(
          "মুড ট্র্যাক সেট করা নেই! 📲",
          "অডিও জোনে গিয়ে নিজের মোবাইল থেকে আপনার প্রিয় অডিও আপলোড করে সেট করুন চ্যাম্পিয়ন। 😊"
        );
      }
    }
  };

  const activeCallVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const fallbackSpeechSynthesis = (_cleanText: string) => {
    // Robotic browser speech synthesis permanently disabled per user instruction
    console.log("[AiChatRoaster] Robotic browser TTS bypassed.");
  };

  const speakTextWithMaleVoice = async (text: string) => {
    if (!text) return;
    const cleanText = text.replace(/[*#_~`\[\]()\-+]/g, '').trim();
    if (!cleanText) return;

    if (activeCallVoiceAudioRef.current) {
      try {
        activeCallVoiceAudioRef.current.pause();
        activeCallVoiceAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeCallVoiceAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    try {
      const preferredVoice = localStorage.getItem('selfx_preferred_voice_persona') || 'Fenrir';
      const res = await fetch('/api/decree/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: preferredVoice,
          style: 'energetic'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const audioSrc = data.audioUrl || data.audioDataUrl;
        if (audioSrc) {
          const audio = new Audio(audioSrc);
          activeCallVoiceAudioRef.current = audio;
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Natural voice synthesis deferred in chat roaster:", err);
    }
  };

  
  
  const handleQuickHappy = () => {
    const randomQuote = getRandomQuote(HAPPY_QUOTES);
    setQuickMotivationTitle("😊 কুইক হ্যাপি (QUICK HAPPY - মন ভালো করার ভাইবস)");
    setQuickMotivationText(randomQuote);
    playMotivationAudioWithMood('happy');
  };

  const handleQuickMotivate = () => {
    const randomQuote = getRandomQuote(MOTIVATE_QUOTES);
    setQuickMotivationTitle("🔥 কুইক মোটিভেট (QUICK MOTIVATION - অল-আউট মোটিভেশন)");
    setQuickMotivationText(randomQuote);
    playMotivationAudioWithMood('motivate');
  };

  const handleQuickLove = () => {
    const randomQuote = getRandomQuote(LOVE_QUOTES);
    setQuickMotivationTitle("💖 কুইক লাভ (ROMANTIC WORK - লাভ ও রিলেশন টিপস)");
    setQuickMotivationText(randomQuote);
    playMotivationAudioWithMood('love');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("ফাইলের সাইজ ১৫ মেগাবাইটের কম হতে হবে চ্যাম্পিয়ন!");
      return;
    }

    setIsUploadingFile(true);
    setAttachedFileName(file.name);
    setAttachedFileType(file.type);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachedImageBase64(reader.result);
          triggerNotification("📸 ছবি যুক্ত হয়েছে", `"${file.name}" সফলভাবে চ্যাটে যুক্ত হয়েছে!`);
        }
        setIsUploadingFile(false);
      };
      reader.onerror = () => {
        setIsUploadingFile(false);
        alert("ছবি লোড করতে সমস্যা হয়েছে চ্যাম্পিয়ন!");
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachedImageBase64(reader.result);
          triggerNotification("🎥 ভিডিও যুক্ত হয়েছে", `"${file.name}" সফলভাবে চ্যাটে যুক্ত করা হয়েছে চ্যাম্পিয়ন!`);
        }
        setIsUploadingFile(false);
      };
      reader.onerror = () => {
        setIsUploadingFile(false);
        alert("ভিডিও লোড করতে সমস্যা হয়েছে চ্যাম্পিয়ন!");
      };
      reader.readAsDataURL(file);
    } else {
      setIsUploadingFile(false);
      alert("শুধুমাত্র ছবি এবং ভিডিও আপলোড করা যাবে চ্যাম্পিয়ন!");
    }
  };

  const handleStartCall = () => {
    if (isMicListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Interactive full face & body checklist
  const [glowGoals, setGlowGoals] = useState<GoalTask[]>(() => {
    const saved = localStorage.getItem('lookmax_interactive_glow_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', text: 'Mewing position', category: 'face', completed: false },
      { id: '2', text: 'Ice face compression', category: 'face', completed: false },
      { id: '3', text: 'SPF 50+ Shield', category: 'grooming', completed: false },
      { id: '4', text: 'No phone slump neck', category: 'body', completed: false },
      { id: '5', text: 'Thicker neck exercise', category: 'body', completed: false },
      { id: '6', text: 'Clavicle broadening stretch', category: 'body', completed: false }
    ];
  });

  // Save Crushes & Goals to localStorage
  useEffect(() => {
    localStorage.setItem('lookmax_crush_list_v2', JSON.stringify(crushes));
  }, [crushes]);

  useEffect(() => {
    localStorage.setItem('lookmax_interactive_glow_goals', JSON.stringify(glowGoals));
  }, [glowGoals]);

  useEffect(() => {
    localStorage.setItem('motivation_active_audio_key_v2', activeAudioKey);
  }, [activeAudioKey]);

  

  const handleQuickLook = () => {
    const randomQuote = getRandomQuote(LOOKSMAX_QUOTES);
    setQuickMotivationTitle("🔍 কুইক লুকমাক্সিং (GLOWUP SPECIAL - লুকমাক্সিং ও গ্রুমিং)");
    setQuickMotivationText(randomQuote);
    playMotivationAudioWithMood('happy');
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 15 * 1024 * 1024) {
      alert("অডিও ফাইলের সাইজ ১৫ মেগাবাইটের বেশি হওয়া যাবে না চ্যাম্পিয়ন!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const id = crypto.randomUUID();
        const analysisInfo = analyzeAudioCategory(file.name);
        
        const newAudio = {
          id,
          name: file.name.substring(0, 45).replace(/\.[^/.]+$/, "") || "My Device Audio",
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
            
            if (newAudio.category) {
              setMoodTracks(prev => ({
                ...prev,
                [newAudio.category]: newKey
              }));
            }
            
            triggerNotification(
              "🎵 অডিও ট্র্যাক বিশ্লেষণ সম্পন্ন",
              `"${newAudio.name}" ফাইলটিকে "${analysisInfo.label}" হিসেবে ম্যাচ করে ওই মুডের ডিফল্ট অডিও সেট করা হয়েছে!`
            );
            
            setTimeout(() => {
              playMotivationAudio(newKey);
            }, 150);
          })
          .catch(err => {
            console.error("Failed to save audio to IndexedDB:", err);
            alert("অডিও ফাইলটি সেভ করতে সমস্যা হয়েছে!");
          });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAudio = (indexToRemove: number) => {
    const item = customAudioList[indexToRemove];
    if (item && item.id) {
      deleteCustomAudioDB(item.id)
        .then(() => {
          const updated = customAudioList.filter((_, idx) => idx !== indexToRemove);
          setCustomAudioList(updated);
          setActiveAudioKey("");
          if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
          }
        })
        .catch(err => {
          console.error("Failed to delete custom audio:", err);
        });
    } else {
      const updated = customAudioList.filter((_, idx) => idx !== indexToRemove);
      setCustomAudioList(updated);
      setActiveAudioKey("");
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    }
  };

  // Voice Call Timer Logic
  useEffect(() => {
    let interval: any;
    if (isCalling && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCalling, callStatus]);

  const toggleGoal = (id: string) => {
    setGlowGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    triggerNotification("🎯 টার্গেট আপডেট", "আপনার ডেইলি লুকমাক্স গোলস সেভ করা হয়েছে।");
  };

  const handleAddCrush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrushName.trim()) return;
    const newCrush: Crush = {
      id: crypto.randomUUID(),
      name: newCrushName.trim(),
      status: newCrushStatus,
      number: newCrushNumber.trim() || 'Not specified',
      personality: newCrushPersonality,
      currentSituation: newCrushSituation
    };
    setCrushes(prev => [...prev, newCrush]);
    setNewCrushName('');
    setNewCrushNumber('');
    setNewCrushPersonality('মিষ্টি ও লাজুক (Shy & Sweet)');
    setNewCrushSituation('ক্লাসমেট (Classmates)');
    triggerNotification("💖 ক্রাশ যুক্ত হয়েছে", `"${newCrush.name}" আপনার ক্রাশ তালিকায় সেভ হয়েছে!`);
  };

  const handleDeleteCrush = (id: string) => {
    setCrushes(prev => prev.filter(c => c.id !== id));
    triggerNotification("❌ ক্রাশ রিমুভড", "তালিকা থেকে সফলভাবে রিমুভ করা হয়েছে।");
  };

  const [userSpeechSubtitle, setUserSpeechSubtitle] = useState('');
  const [isMicListening, setIsMicListening] = useState(false);
  const speechTranscriptRef = useRef('');
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'bn-BD'; // Bengali language focus

    rec.onresult = (event: any) => {
      let finalSpeech = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalSpeech += event.results[i][0].transcript;
      }
      if (finalSpeech && finalSpeech.trim()) {
        console.log("Recognized interim speech:", finalSpeech);
        speechTranscriptRef.current = finalSpeech;
        setUserSpeechSubtitle(finalSpeech);
      }
    };

    rec.onend = () => {
      console.log("Recognition ended.");
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current = rec;

    return () => {
      isListeningRef.current = false;
      try {
        rec.abort();
      } catch (e) {}
    };
  }, []);

  const handleVoiceInput = async (text: string) => {
    if (!text || !text.trim()) return;
    stopSpeechRecognition();
    await handleSendChat(undefined, text);
  };

  const handleSendChat = async (e?: React.FormEvent, presetPrompt?: string) => {
    e?.preventDefault();
    const textToSend = presetPrompt || inputValue.trim();
    if (!textToSend && !attachedImageBase64 && !attachedFileName) return;
    if (isLoading) return;

    if (!presetPrompt) {
      setInputValue('');
    }

    const activeImage = attachedImageBase64;
    const activeFileName = attachedFileName;
    const activeFileType = attachedFileType;

    // Reset attachments
    setAttachedImageBase64(null);
    setAttachedFileName(null);
    setAttachedFileType(null);

    let contentFinal = textToSend;
    if (activeFileName && activeFileType?.startsWith('video/')) {
      contentFinal = `${textToSend ? textToSend + " " : ""}[Attached Video Reference: ${activeFileName}]`;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: contentFinal || "আমি একটি রেফারেন্স ফাইল আপলোড করেছি, একটু চেক করে গাইড করো ফ্রেন্ড।",
      timestamp: new Date(),
      imageBase64: activeImage || undefined,
      videoFileName: activeFileName && activeFileType?.startsWith('video/') ? activeFileName : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Auto-save user life story to Reality Hub in background without needing any extra buttons
    if (contentFinal && contentFinal.length > 20) {
      try {
        localStorage.setItem('selfx_reality_story_v1', contentFinal);
      } catch {}
    }

    // Instant answer check for face wash under 200 BDT
    const lowQuery = (contentFinal || '').toLowerCase();
    const isFaceWashQuery = lowQuery.includes('face wash') || lowQuery.includes('facewash') || lowQuery.includes('cleanser') || lowQuery.includes('ফেসওয়াশ') || lowQuery.includes('ফেস ওয়াশ') || lowQuery.includes('সাবান') || lowQuery.includes('মুখ ধোয়া') || lowQuery.includes('মুখ ধোয়ার');
    const isUnder200Query = lowQuery.includes('200') || lowQuery.includes('২০০') || lowQuery.includes('two hundred') || lowQuery.includes('দুইশত') || lowQuery.includes('দুই শ') || lowQuery.includes('টাকা');

    if (isFaceWashQuery && isUnder200Query) {
      setTimeout(() => {
        const bdRecommendations = `চ্যাম্পিয়ন! ২০০ টাকার (200 BDT) মধ্যে অরিজিনাল এবং সেরা কয়েকটি ফেসওয়াশের তালিকা নিচে দেওয়া হলো, যা তুমি সরাসরি যেকোনো লোকাল ফার্মেসি বা অনলাইন থেকে কিনতে পারবে:

১. **Himalaya Purifying Neem Face Wash (50ml)** - দাম: ৳১৫০ - ৳১৭৫
   - *উপকারিতা*: এটি ব্রণ প্রতিরোধ করতে সাহায্য করে এবং অতিরিক্ত তেল দূর করে। আমাদের বাংলাদেশের অন্যতম সেরা এবং নিরাপদ ফেসওয়াশ বাজেট ফ্রেন্ডলি হওয়ার কারণে।
   
২. **Ponds Bright Beauty Spotless Glow Facial Foam (50g)** - দাম: ৳১৬০ - ৳১৯০
   - *উপকারিতা*: ভিটামিন B3+ সমৃদ্ধ যা ত্বকের কালো দাগ এবং রোদে পোড়া ভাব দূর করে ইনস্ট্যান্ট গ্লো দেয়।

৩. **Glow & Lovely Instant Glow Face Wash (50g)** - দাম: ৳১১০ - ৳১৩০
   - *উপকারিতা*: খুব অল্প দামে গভীর থেকে ময়লা পরিষ্কার করে এবং ইনস্ট্যান্ট ফর্সা ভাব এনে দেয়।

*টিপস*: সবসময় কেনার সময় জেনুইন অরিজিনাল প্রোডাক্ট চেক করে কিনবে! স্ক্রিনকেয়ার শুরু করার জন্য এটিই তোমার সেরা বাজেট অপশন। 💪✨`;
        
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'model',
            content: bdRecommendations,
            timestamp: new Date()
          }
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const statsSummary = `Habits progress: ${completedHabitsCount}/${totalHabitsCount}, Water: ${waterDrank}/8, Selfies: ${photosUploaded}. Saved crushes: ${crushes.map(c => `${c.name} (${c.status})`).join(', ')}`;
      
      let matchedCrush: any = undefined;
      const lowerUserMsg = userMsg.content.toLowerCase();
      matchedCrush = crushes.find(c => {
        const nameLower = c.name.toLowerCase();
        return lowerUserMsg.includes(nameLower) || nameLower.split(' ').some(part => part.length > 2 && lowerUserMsg.includes(part));
      });

      // Prepare AI Long-term memory for crushes/partners
      let loveAngelMemory = "";
      if (crushes && crushes.length > 0) {
        loveAngelMemory = `[AI LONG-TERM MEMORY: You have access to the user's saved partner/crush details. ALWAYS remember these in your memory. If the user asks about relationship, crush, love, or tips, use this info dynamically to give custom tailored suggestions.
Saved Partners/Crushes Info:
${crushes.map((c, idx) => `- Partner #${idx+1}: Name: "${c.name}", Status: "${c.status}", Address/Location: "${c.address || 'Unknown'}", Relationship Stage: "${c.currentSituation || 'Unknown'}", Personality: "${c.personality || 'Unknown'}", Arabic Oil / Special Memory Option: "${c.arabicOilOption || 'None'}"`).join('\n')}
]\n`;
      }

      const romanticKeywords = ["crush", "relationship", "love", "partner", "gf", "bf", "girlfriend", "boyfriend", "মেয়ে", "মেয়েটি", "মেয়ে", "ক্রাশ", "ভালোবাসা", "প্রেম", "পছন্দ", "বিয়ে", "বিয়ের", "বিয়ে"];
      const isRomanticQuery = romanticKeywords.some(kw => lowerUserMsg.includes(kw));

      let finalUserMsgContent = userMsg.content;
      if (matchedCrush) {
        finalUserMsgContent = `[SYSTEM INSTRUCTION & CONTEXT - LOVE ANGEL MODE: User is asking about their saved crush named "${matchedCrush.name}". Crush Status is: "${matchedCrush.status}". Personality: "${matchedCrush.personality}". Address/Location: "${matchedCrush.address || 'Unknown'}". Our current relationship situation/stage is: "${matchedCrush.currentSituation}". Special Arabic Oil Memory details: "${matchedCrush.arabicOilOption || 'None'}". Act as "Love Angel" / "লাভ এঞ্জেল" - an expert, warm, and highly persuasive romantic advisor. Give a highly strategic, psychological, custom romantic analysis, conversation prompts, and relationship coaching tailored to this specific crush's situation. Speak in very friendly, smart, and coaching Bengali.]\n\n${loveAngelMemory}${userMsg.content}`;
        
        setDetectedCrushName(matchedCrush.name);
        setLoveAngelActivated(true);
        setTimeout(() => {
          setLoveAngelActivated(false);
        }, 8000);
      } else if (isRomanticQuery && crushes && crushes.length > 0) {
        finalUserMsgContent = `${loveAngelMemory}${userMsg.content}`;
      }

      const payloadMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
        imageBase64: m.imageBase64
      })).concat({
        role: userMsg.role,
        content: finalUserMsgContent,
        imageBase64: userMsg.imageBase64
      });

      const res = await fetch('/api/lookmax/chat-roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: payloadMessages,
          userGoals: statsSummary,
          isFriendlyCoach: true, // Speaks Bengali friendly, fast, short
          isQuick: isTurboMode
        })
      });

      if (!res.ok) {
        throw new Error("Coach lag");
      }

      const data = await res.json();
      const aiReplyText = data.reply || "চ্যাম্পিয়ন! তোমার টার্গেটগুলো চমৎকার। মেউইং এবং ডেইলি রুটিনগুলো কঠোরভাবে ফলো করো, খুব জলদি বড় পরিবর্তন দেখতে পাবে। যেকোনো দরকারে আমি আছি তোমার পাশে! 💪";
      
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'model',
          content: aiReplyText,
          timestamp: new Date()
        }
      ]);

      // If voice call is active, speak out loud!
      if (isCalling && callStatus === 'connected') {
        speakTextWithMaleVoice(aiReplyText);
      }
    } catch (err: any) {
      console.error(err);
      const errReply = "চ্যাম্পিয়ন, নেটওয়ার্ক একটু ব্যস্ত মনে হচ্ছে। তবে মেউইং টেকনিক ও তোমার পিঠের পোজ একদম সোজা রাখো। সবসময় নিজের উপর বিশ্বাস রাখবে! 🔥";
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'model',
          content: errReply,
          timestamp: new Date()
        }
      ]);
      if (isCalling && callStatus === 'connected') {
        speakTextWithMaleVoice(errReply);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'model',
        content: "অতীতের ভুলগুলো নিয়ে পড়ে থাকার কোনো মানে হয় না, দোস্ত। দিনশেষে নিজেকে নতুন করে গুছিয়ে নেওয়ার শক্তিটাই আসল।\n\nআমাদের আগের সব চ্যাট সুন্দরভাবে ক্লিয়ার করে দিয়েছি। চল, আবার নতুন করে শুরু করি! তোর মনের সব কথা আমার সাথে শেয়ার কর, আমি সবসময় আছি তোর পাশে। ✨",
        timestamp: new Date()
      }
    ]);
  };

  const startSpeechRecognition = () => {
    if (recognitionRef.current) {
      speechTranscriptRef.current = '';
      setUserSpeechSubtitle('');
      setIsMicListening(true);
      try {
        recognitionRef.current.start();
        console.log("Speech recognition started.");
      } catch (e) {
        console.warn("Speech recognition start failed:", e);
      }
    }
  };

  const stopSpeechRecognition = () => {
    setIsMicListening(false);

    // Delay slightly to capture final words from the last millisecond of speech before shutting down the microphone
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log("Speech recognition stopped after delay.");
        } catch (e) {
          console.warn("Speech recognition stop failed:", e);
        }
      }

      if (isMuted) {
        console.log("Mic is muted. Speech ignored.");
        speechTranscriptRef.current = '';
        return;
      }

      const capturedText = speechTranscriptRef.current;
      if (capturedText && capturedText.trim()) {
        speechTranscriptRef.current = '';
        setUserSpeechSubtitle('');
        handleVoiceInput(capturedText);
      }
    }, 650);
  };

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (activeCallVoiceAudioRef.current) {
      try {
        activeCallVoiceAudioRef.current.pause();
        activeCallVoiceAudioRef.current.currentTime = 0;
      } catch (err) {}
      activeCallVoiceAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    startSpeechRecognition();
  };

  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    stopSpeechRecognition();
  };

  return (
    <div id="full-lookmax-command-ctr" className={`w-full h-full flex flex-col text-zinc-100 overflow-hidden ${subTab === 'products' ? 'p-0 space-y-0' : 'p-4 md:p-6 space-y-4'}`}>
      
      {/* HEADER HUD BAR - Hidden in chat and products for maximum clarity and space */}
      {subTab !== 'chat' && subTab !== 'products' && (
        <div className="bg-[#121214] border border-zinc-850 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-slideUp shrink-0">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-zinc-100 tracking-wide uppercase flex items-center gap-2">
                  ★ AI FRIEND · এআই ফ্রেন্ড ★
                </h2>
                <p className="text-xs text-zinc-500 font-sans">আপনার সবচেয়ে বিশ্বস্ত বাংলা বন্ধু ও পার্সোনাল ডেভেলপমেন্ট মেন্টর</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:hidden">
              <button 
                type="button"
                onClick={() => setSubTab('chat')}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-500/25 cursor-pointer"
              >
                ← চ্যাট
              </button>
              {onBack && (
                <button 
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#171717] hover:bg-zinc-800 text-zinc-300 rounded-full text-[10px] font-bold border border-zinc-850/20 cursor-pointer"
                >
                  ← HUD
                </button>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <button 
              type="button"
              onClick={() => setSubTab('chat')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-black tracking-wider transition-all border border-indigo-500/25 cursor-pointer"
            >
              ← এআই চ্যাটে ফিরুন (Back to Chat)
            </button>

            {onBack && (
              <button 
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-[#171717] hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-black tracking-wider transition-all border border-zinc-850/20 cursor-pointer"
                title="ড্যাশবোর্ডে ফিরে যান"
              >
                ← HUD ড্যাশবোর্ড
              </button>
            )}
          </div>
        </div>
      )}

      {subTab === 'love_angel' && (
        <div className="w-full max-w-5xl mx-auto animate-fadeIn space-y-6 pb-12">
          {/* Header card with user's POV holding hands photo */}
          <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-r from-[#28071e] via-[#1a0515] to-[#0d020b] shadow-xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 group">
            <div className="flex items-center gap-4 z-10">
              <div className="p-3.5 bg-pink-500/20 rounded-2xl border border-pink-500/30 text-pink-400 animate-pulse shrink-0">
                <Heart className="w-6 h-6 fill-pink-500/30" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-sm md:text-base text-zinc-100 uppercase tracking-widest">
                    💖 LOVE ANGEL ADVISOR
                  </h3>
                  <span className="text-[10px] bg-pink-500/15 border border-pink-500/30 text-pink-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    POV BONDING
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans max-w-md leading-relaxed">
                  আপনার ক্রাশ বা প্রিয় মানুষের স্মৃতি ও প্রোফাইল সেভ করুন। এআই মেমোরি গভীর মনস্তাত্ত্বিক পরামর্শ প্রদান করবে।
                </p>
              </div>
            </div>

            <div className="w-full sm:w-44 aspect-[3/4] sm:h-36 rounded-2xl overflow-hidden shrink-0 border-2 border-pink-500/60 relative shadow-xl group-hover:border-pink-400 transition-all bg-zinc-950">
              <img 
                src={loveAngelBannerImg} 
                alt="Love Angel POV Holding Hands" 
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-[50%_48%] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-1.5 right-2 text-[8px] font-mono font-extrabold text-pink-200 bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-xs">
                POV BOND
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* LEFT COLUMN: Add & Manage Crushes */}
            <div className="space-y-6">
              <div className="bg-[#121214] border border-zinc-900 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" />
                  <span className="font-display font-black text-xs uppercase tracking-widest text-pink-400">
                    নতুন ক্রাশ প্রোফাইল যোগ করুন (Add Crush Profile)
                  </span>
                </div>
                <form onSubmit={handleAddCrush} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold mb-1">নাম (Name):</label>
                    <input 
                      type="text"
                      value={newCrushName}
                      onChange={(e) => setNewCrushName(e.target.value)}
                      placeholder="যেমন: নুসরাত জাহান"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2.5 py-2 text-zinc-150 placeholder-zinc-700 focus:outline-none focus:border-pink-550 transition-colors font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold mb-1">স্ট্যাটাস (Status):</label>
                      <select
                        value={newCrushStatus}
                        onChange={(e) => setNewCrushStatus(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2 py-2 text-zinc-200 focus:outline-none focus:border-pink-550 transition-colors"
                      >
                        <option value="Crush">Crush (ক্রাশ)</option>
                        <option value="GF/BF">Girlfriend (প্রেমিকা)</option>
                        <option value="Secret Love">Secret Love (গোপন ভালোবাসা)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold mb-1">যোগাযোগ / সোশ্যাল আইডি:</label>
                      <input 
                        type="text"
                        value={newCrushNumber}
                        onChange={(e) => setNewCrushNumber(e.target.value)}
                        placeholder="ফোন বা ইনস্টাগ্রাম হ্যান্ডেল"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2.5 py-2 text-zinc-150 placeholder-zinc-700 focus:outline-none focus:border-pink-550 transition-colors font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold mb-1">ঠিকানা (Address / Location):</label>
                    <input 
                      type="text"
                      value={newCrushAddress}
                      onChange={(e) => setNewCrushAddress(e.target.value)}
                      placeholder="যেমন: ঢাকা, বাংলাদেশ"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2.5 py-2 text-zinc-150 placeholder-zinc-700 focus:outline-none focus:border-pink-550 transition-colors font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold mb-1">ব্যক্তিত্ব (Personality):</label>
                      <input 
                        type="text"
                        value={newCrushPersonality}
                        onChange={(e) => setNewCrushPersonality(e.target.value)}
                        placeholder="যেমন: মিষ্টি ও লাজুক"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2.5 py-2 text-zinc-150 placeholder-zinc-700 focus:outline-none focus:border-pink-550 transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold mb-1">বর্তমান অবস্থা (Situation):</label>
                      <input 
                        type="text"
                        value={newCrushSituation}
                        onChange={(e) => setNewCrushSituation(e.target.value)}
                        placeholder="যেমন: কথা হয় মাঝে মাঝে"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2.5 py-2 text-zinc-150 placeholder-zinc-700 focus:outline-none focus:border-pink-550 transition-colors font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold mb-1">আরবি তেল / বিশেষ মেমোরি অপশন:</label>
                    <input 
                      type="text"
                      value={newCrushArabicOilOption}
                      onChange={(e) => setNewCrushArabicOilOption(e.target.value)}
                      placeholder="যেমন: তার পছন্দের ফুল গোলাপ"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg text-xs px-2.5 py-2 text-zinc-150 placeholder-zinc-700 focus:outline-none focus:border-pink-550 transition-colors font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-pink-600 hover:bg-pink-550 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(219,39,119,0.2)]"
                  >
                    সেভ করুন ও এআই মেমোরি সিঙ্ক করুন ➕💖
                  </button>
                </form>
              </div>

              {/* Saved Crushes List Card */}
              <div className="bg-[#121214] border border-zinc-900 rounded-2xl p-5 space-y-3">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                  সেভ করা তালিকা (Saved Crush List):
                </span>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {crushes.length === 0 ? (
                    <div className="text-center py-6 text-zinc-650 text-xs border border-dashed border-zinc-850 rounded-xl">
                      কোনো ক্রাশ সেভ করা নেই। ওপরের ফর্ম থেকে যোগ করুন!
                    </div>
                  ) : (
                    crushes.map((crush) => (
                      <div key={crush.id} className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <span className="font-bold text-zinc-200">{crush.name}</span>
                          <span className="mx-1.5 text-zinc-600">|</span>
                          <span className="text-pink-400 font-mono text-[9px] uppercase font-bold bg-pink-500/10 px-2 py-0.5 rounded-full">{crush.status}</span>
                          <div className="text-[11px] text-zinc-400 truncate mt-1">
                            🏠 {crush.address || 'mention na'} • 💡 {crush.personality} • 💬 {crush.currentSituation}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCrush(crush.id)}
                          className="text-red-500 hover:text-red-400 p-1.5 hover:bg-zinc-900/60 rounded-lg cursor-pointer transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Advice & Tips Generator */}
            <div className="space-y-6">
              <div className="bg-[#121214] border border-zinc-900 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span className="font-display font-black text-xs uppercase tracking-widest text-zinc-150">
                    এআই রিলেশনশিপ টিপস জেনারেটর (Love Advisor)
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400 leading-normal">
                    আপনার যেকোনো সেভড ক্রাশ বা প্রেমিকার নাম চ্যাটে উল্লেখ করে মেসেজ পাঠালেই এআই রোস্টার সরাসরি "লাভ এঞ্জেল" মোডে চলে যাবে এবং কাস্টম মনস্তাত্ত্বিক পরামর্শ দিবে! চ্যাটে সরাসরি পরামর্শ পেতে নিচের বাটন চাপুন।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubTab('chat');
                      setInputValue("লাভ এঞ্জেল! আমাকে একটু রিলেশনশিপ গাইডেন্স ও মেয়েদের ইমপ্রেস করার মনস্তাত্ত্বিক সিক্রেট টিপস দাও তো।");
                    }}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-pink-400 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    💬 লাভ এঞ্জেল চ্যাট শুরু করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showThreeDots && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col p-6 animate-fadeIn">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      {threeDotsTab !== 'menu' && (
                        <button
                          type="button"
                          onClick={() => setThreeDotsTab('menu')}
                          className="mr-1 text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 bg-zinc-900/60 hover:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-800/40 cursor-pointer"
                        >
                          ← ব্যাক
                        </button>
                      )}
                      <span className="text-amber-400">⚙️</span>
                      <h3 className="font-display font-black text-xs uppercase tracking-widest text-zinc-200">
                        {threeDotsTab === 'menu' && "কাস্টমাইজেশন ও সেটিংস (Settings)"}
                        {threeDotsTab === 'love_angel' && "লাভ এঞ্জেল মেমোরি (Love Angel Memory Settings)"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowThreeDots(false)}
                      className="text-zinc-500 hover:text-zinc-300 cursor-pointer text-xs font-bold"
                    >
                      ✕ বন্ধ করুন
                    </button>
                  </div>

                  {/* Content Area */}
                  {threeDotsTab === 'menu' ? (
                    /* COMPACT LOVE ANGEL BUTTON - "সে সময় গুলো ছোট হয় শুধু নাম আসবে" */
                    <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full space-y-4">
                      <span className="text-center text-[11px] uppercase font-mono tracking-widest text-zinc-400 font-bold mb-2">
                        একটি অপশন নির্বাচন করুন:
                      </span>

                      {/* Love Angel Option Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoveAngelFull(true);
                          setShowThreeDots(false);
                        }}
                        className="w-full p-4 rounded-xl border border-rose-950/40 bg-gradient-to-r from-rose-950/20 to-black hover:from-rose-950/30 hover:to-zinc-900/80 hover:border-rose-500/50 transition-all duration-300 text-left cursor-pointer group flex items-center justify-between animate-slideUp"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform">
                            💖
                          </div>
                          <div>
                            <span className="block font-bold text-zinc-150 text-xs">Love Angel Advisor</span>
                            <span className="block text-[10px] text-zinc-400">লাভ এঞ্জেল সেটিংস</span>
                          </div>
                        </div>
                        <span className="text-rose-400 group-hover:translate-x-1 transition-transform text-xs font-bold">→</span>
                      </button>
                    </div>
                  ) : (
                    /* FULL-SCREEN DETAILED VIEWS - "তারপরে এখানে ভিতর ক্লিক করলে পুলিশ ক্রিনে বিস্তারিত সেখানে ভিতরে আসবে" */
                    <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 space-y-4">
                      {threeDotsTab === 'love_angel' && (
                        <div className="bg-[#0b0c20]/50 border border-zinc-900 rounded-2xl p-5 space-y-5 animate-slideUp">
                          <div className="flex items-center justify-between border-b border-zinc-900/40 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-rose-500 text-base">💖</span>
                              <span className="text-xs uppercase font-mono font-bold tracking-wider text-rose-300">
                                লাভ এঞ্জেল অ্যাডভাইজার বিস্তারিত মেমোরি
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={loveAngelActivated}
                                onChange={(e) => setLoveAngelActivated(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                              <span className="ml-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                {loveAngelActivated ? "সক্রিয়" : "নিষ্ক্রিয়"}
                              </span>
                            </label>
                          </div>

                          <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-rose-500/5 p-3 rounded-xl border border-rose-950/20">
                            লাভ এঞ্জেল মোড সক্রিয় থাকলে এআই আপনার দেওয়া তথ্যগুলোর ভিত্তিতে কাস্টমাইজড এবং চমৎকার লাভ টিপস ও সিক্রেট রিলেশনশিপ গাইডেন্স দিবে। আপনার পার্টনারের বিস্তারিত নিচে মেমোরিতে সেভ করে রাখুন। 🤫✨
                          </p>

                          {/* Crush List & Add Crush */}
                          <div className="space-y-3 pt-1">
                            <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                              সংরক্ষিত পার্টনার/ক্রাশ তালিকা (Saved Partner & Crush Memory):
                            </span>

                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                              {crushes.length === 0 ? (
                                <div className="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-900 rounded-xl">
                                  কোনো ক্রাশ বা পার্টনার সেভ করা নেই। নিচে যোগ করুন!
                                </div>
                              ) : (
                                crushes.map((crush) => (
                                  <div key={crush.id} className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900 flex items-start justify-between text-xs space-x-2">
                                    <div className="truncate flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-rose-300 text-sm">{crush.name}</span>
                                        <span className="text-rose-400 font-mono text-[9px] uppercase font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">{crush.status}</span>
                                      </div>
                                      <div className="text-[11px] text-zinc-400 mt-1.5 space-y-1">
                                        <div>💡 <strong>ব্যক্তিত্ব:</strong> {crush.personality}</div>
                                        <div>💬 <strong>পর্যায় ও গভীরতা:</strong> {crush.currentSituation}</div>
                                        {crush.address && <div>📍 <strong>ঠিকানা:</strong> {crush.address}</div>}
                                        {crush.arabicOilOption && <div>🛢️ <strong>আরবি তেল / বিশেষ অপশন:</strong> {crush.arabicOilOption}</div>}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = crushes.filter(c => c.id !== crush.id);
                                        setCrushes(updated);
                                      }}
                                      className="text-red-500 hover:text-red-400 p-1.5 hover:bg-zinc-900/60 rounded-lg cursor-pointer transition-colors"
                                      title="মুছে ফেলুন"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Quick Add Form */}
                            <div className="bg-black/60 p-4 rounded-xl border border-zinc-900 space-y-3">
                              <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-black">
                                নতুন ক্রাশ/প্রেমিকা যোগ করুন:
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">তার নাম (Name):</label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: নুসরত জাহান"
                                    value={newCrushName}
                                    onChange={(e) => setNewCrushName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded-lg text-zinc-200 focus:outline-none focus:border-rose-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">স্ট্যাটাস:</label>
                                  <select
                                    value={newCrushStatus}
                                    onChange={(e) => setNewCrushStatus(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded-lg text-zinc-200 focus:outline-none focus:border-rose-500"
                                  >
                                    <option value="Crush">Crush (ক্রাশ)</option>
                                    <option value="GF/BF">Girlfriend (প্রেমিকা)</option>
                                    <option value="Secret Love">Secret Love (গোপন ভালোবাসা)</option>
                                    <option value="Wife">Wife (স্ত্রী)</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">ব্যক্তিত্ব (Personality):</label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: মিষ্টি, লাজুক, বা একটু অভিমানী"
                                    value={newCrushPersonality}
                                    onChange={(e) => setNewCrushPersonality(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded-lg text-zinc-200 focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">তার ঠিকানা / অবস্থান (Address):</label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: মিরপুর, ঢাকা"
                                    value={newCrushAddress}
                                    onChange={(e) => setNewCrushAddress(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded-lg text-zinc-200 focus:outline-none focus:border-rose-500"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">সম্পর্কের পর্যায় ও গভীরতা (Relationship Stage):</label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: কথা হয় মাঝে মাঝে, সম্পর্ক গভীর"
                                    value={newCrushSituation}
                                    onChange={(e) => setNewCrushSituation(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded-lg text-zinc-200 focus:outline-none focus:border-rose-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                                    <span>🛢️</span> আরবি তেল / বিশেষ মেমোরি অপশন:
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: তার পছন্দের জিনিস, বিশেষ কোনো গোপন তথ্য"
                                    value={newCrushArabicOilOption}
                                    onChange={(e) => setNewCrushArabicOilOption(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-850 p-2 text-xs rounded-lg text-zinc-200 focus:outline-none focus:border-rose-500"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newCrushName) return;
                                  const newC = {
                                    id: Date.now().toString(),
                                    name: newCrushName,
                                    status: newCrushStatus,
                                    number: '',
                                    personality: newCrushPersonality || 'মিষ্টি ও লাজুক',
                                    currentSituation: newCrushSituation || 'কথা হয় মাঝে মাঝে',
                                    address: newCrushAddress || 'উল্লেখ নেই',
                                    arabicOilOption: newCrushArabicOilOption || 'উল্লেখ নেই'
                                  };
                                  setCrushes([...crushes, newC]);
                                  setNewCrushName('');
                                  setNewCrushAddress('');
                                  setNewCrushArabicOilOption('');
                                }}
                                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.2)]"
                              >
                                এআই মেমোরিতে সেট করুন ও যোগ করুন ➕🧠
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto shrink-0 pt-4 flex gap-3 border-t border-zinc-900">
                    {threeDotsTab !== 'menu' && (
                      <button
                        type="button"
                        onClick={() => setThreeDotsTab('menu')}
                        className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-center border border-zinc-800/40"
                      >
                        ← মেনুতে ফিরে যান (Back to Menu)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowThreeDots(false);
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black rounded-xl text-xs transition-all cursor-pointer text-center shadow-[0_0_15px_rgba(225,29,72,0.15)]"
                    >
                      সংরক্ষণ ও বন্ধ করুন (Save & Close)
                    </button>
                  </div>
                </div>
              )}

      {subTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-black border border-zinc-900 rounded-3xl overflow-hidden relative animate-fadeIn">
          {/* HEADER EXACT TO SCREENSHOT 2 */}
          <div className="bg-[#08080a] border-b border-purple-500/20 shadow-[0_2px_15px_rgba(168,85,247,0.12)] px-4 py-3 flex items-center justify-between shrink-0 relative z-20">
            {/* Left: Hamburger Menu Icon */}
            <button
              type="button"
              onClick={() => {
                if (onBack) onBack();
                else setShowThreeDots(true);
              }}
              className="p-2 text-zinc-300 hover:text-white transition-all cursor-pointer rounded-lg hover:bg-zinc-900 active:scale-95"
              title="মেনু / ফিরে যান"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Center: Logo, Title & Subtitle */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300/20 animate-pulse" />
                <h1 className="text-base md:text-lg font-black tracking-tight text-white font-display">
                  GlowUp AI
                </h1>
              </div>
              <span className="text-[8px] md:text-[9px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                YOUR AI BEST FRIEND
              </span>
            </div>

            {/* Right: User Profile Icon */}
            <button
              type="button"
              onClick={() => setShowIdentityEdit(true)}
              className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900/90 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95"
              title="আমার প্রোফাইল / পরিচয়"
            >
              <User className="w-4 h-4" />
            </button>
          </div>

              {/* MESSAGE HISTORY */}
              <div 
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const scrollTop = target.scrollTop;
                  if (scrollTop <= 10) {
                    setIsSuggestionsVisible(true);
                  } else if (scrollTop > lastChatScrollTopRef.current && scrollTop > 30) {
                    setIsSuggestionsVisible(false);
                  } else if (scrollTop < lastChatScrollTopRef.current) {
                    setIsSuggestionsVisible(true);
                  }
                  lastChatScrollTopRef.current = scrollTop;
                }}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-black scrollbar-thin scrollbar-thumb-zinc-800"
              >
                {/* RENDERING REAL MESSAGES */}
                {messages.map((m) => {
                  let displayContent = m.content;
                  if (displayContent.includes('[SYSTEM INSTRUCTION') || displayContent.startsWith('আমার ক্রাশ')) {
                    const regex = /saved crush named "([^"]+)"/;
                    const match = displayContent.match(regex);
                    const name = match ? match[1] : (detectedCrushName || "ক্রাশ");
                    displayContent = `💖 লাভ এঞ্জেল এসিস্ট্যান্ট: "${name}" এর প্রোফাইল ইনফরমেশন এনালাইসিস করে মনস্তাত্ত্বিক পরামর্শ তৈরি করতে বলা হয়েছে।`;
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3 animate-fadeIn`}
                    >
                      {m.role !== 'user' && (
                        <div className="w-9 h-9 rounded-full bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                          <Sparkles className="w-4.5 h-4.5" />
                        </div>
                      )}

                      <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} gap-1 max-w-[85%]`}>
                        <div
                          className={`rounded-2xl px-4.5 py-3.5 text-xs leading-relaxed shadow-sm transition-all ${
                            m.role === 'user'
                              ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tr-none'
                              : 'bg-[#121218] border border-zinc-800/80 text-zinc-150 rounded-tl-none font-normal font-sans text-left'
                          }`}
                        >
                          {m.imageBase64 && (
                            <div className="mb-2 max-w-[180px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                              {m.imageBase64.startsWith('data:video/') ? (
                                <video src={m.imageBase64} controls className="w-full max-h-[140px] object-cover" />
                              ) : (
                                <img src={m.imageBase64} alt="Attached asset" referrerPolicy="no-referrer" className="w-full max-h-[140px] object-cover" />
                              )}
                            </div>
                          )}
                          {m.videoFileName && (
                            <div className="mb-2 p-2 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center gap-2 text-zinc-400 text-[10px] font-mono">
                              <span className="text-purple-400 font-bold">🎬 Video:</span>
                              <span className="truncate text-zinc-300 max-w-[120px]">{m.videoFileName}</span>
                            </div>
                          )}
                          <p className="whitespace-pre-line leading-relaxed">{displayContent}</p>
                        </div>

                        <span className="text-[9px] text-zinc-500 font-mono px-1">
                          {new Date(m.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start items-start gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="bg-[#121218] border border-zinc-800/80 rounded-2xl rounded-tl-none px-4 py-3 text-zinc-400 flex items-center gap-2 text-xs font-sans">
                        <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                        <span>GlowUp AI চিন্তাভাবনা করছে...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

            {/* Chat form matching Screenshot 2 */}
            <form onSubmit={handleSendChat} className="p-4 md:p-6 bg-black border-t border-zinc-900/60 shrink-0 space-y-2.5">
              
              {/* Attachment Preview Banner */}
              {attachedFileName && (
                <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-850 p-2.5 rounded-2xl animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    {attachedImageBase64 ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                        <img src={attachedImageBase64} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-zinc-950 rounded-lg border border-zinc-850 flex items-center justify-center shrink-0">
                        <span className="text-xs">🎬</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-[10px] font-bold text-zinc-300 font-mono">ফাইল যুক্ত হয়েছে:</span>
                      <span className="block text-[8px] text-zinc-500 font-mono truncate max-w-[180px]">{attachedFileName}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setAttachedImageBase64(null);
                      setAttachedFileName(null);
                      setAttachedFileType(null);
                    }} 
                    className="p-1 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-md text-red-500 hover:text-red-400 text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    মুছে ফেলো <X className="w-3 h-3 inline ml-1" />
                  </button>
                </div>
              )}

              {isUploadingFile && (
                <div className="text-[10px] text-purple-400 font-mono animate-pulse flex items-center gap-1.5 pl-1">
                  <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                  <span>মিডিয়া ফাইল অপ্টিমাইজ করা হচ্ছে...</span>
                </div>
              )}

              {/* Capsule pill input bar */}
              <div className="w-full max-w-2xl mx-auto bg-[#0d0d12] border border-zinc-800/90 rounded-full flex items-center px-3.5 py-1.5 shadow-xl focus-within:border-purple-500/40 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all">
                <input
                  type="file"
                  ref={chatFileRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => chatFileRef.current?.click()}
                  className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0"
                  title="ফাইল বা ছবি আপলোড করুন"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>

                <input
                  type="text"
                  required={!attachedFileName}
                  disabled={isLoading || isCalling}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Message GlowUp AI..."
                  className="flex-1 bg-transparent text-xs py-2 px-3 text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans"
                />

                <button
                  type="submit"
                  disabled={isLoading || isCalling || (!inputValue.trim() && !attachedFileName)}
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md ${
                    (inputValue.trim() || attachedFileName)
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 active:scale-95'
                      : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                  }`}
                  title="পাঠান"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="text-[10px] text-zinc-500 font-sans text-center font-medium">
                GlowUp AI cares. Always here for you.
              </div>
            </form>

          </div>

      )}

      {subTab === 'guides' && (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="font-display font-black text-sm text-zinc-200 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-500" />
              মেডিকেল গ্রেড লুকমাক্সিং ও শারীরিক স্ট্রাকচার গাইড
            </h3>
            <p className="text-xs text-zinc-500">আপনার চোয়াল, ফেস পোজ এবং শারীরিক গঠন আকর্ষণীয় করার বিজ্ঞানসম্মত বৈজ্ঞানিক গাইডলাইন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            
            {/* ITEM 1 */}
            <div className="bg-zinc-950/60 p-5 rounded-2xl border border-zinc-900 space-y-3">
              <div className="flex items-center gap-2 text-pink-400">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-wider">১. মেউইং ও জ-লাইন ডেভেলপমেন্ট</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                <strong>মেউইং টেকনিক:</strong> সব সময় ঠোঁট বন্ধ রেখে জিহ্বাটিকে তালুর উপরে সমানভাবে চেপে ধরে রাখুন। এটি মুখের ম্যাক্সিলা হাড়কে ধীরে ধীরে উপরে ও সামনের দিকে ঠেলে দেয়, যার ফলে চোয়াল শার্প ও চওড়া হয় এবং ডাবল-চিন দূর হয়। ফেস থেকে মেদ কমানোর জন্য সোডিয়াম কম খান।
              </p>
            </div>

            {/* ITEM 2 */}
            <div className="bg-zinc-950/60 p-5 rounded-2xl border border-zinc-900 space-y-3">
              <div className="flex items-center gap-2 text-pink-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-wider">২. হান্টার গেজ ও আকর্ষক চোখ</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                <strong>হান্টার গেজ ফেস পোজ:</strong> চোখের নিচের কালো ফুসকুড়ি বা ফোলাভাব দূর করতে প্রতিদিন সকালে বরফ-শীতল পানিতে ফেস ডিপ করুন বা আইস কম্প্রেশন থেরাপি দিন। চোখ ডলবেন না, পর্যাপ্ত পানি পান করুন এবং সুন্দরভাবে ভ্রু গ্রুম করুন।
              </p>
            </div>

            {/* ITEM 3 */}
            <div className="bg-zinc-950/60 p-5 rounded-2xl border border-zinc-900 space-y-3">
              <div className="flex items-center gap-2 text-pink-400">
                <Bookmark className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-wider">৩. হেয়ার ডেনসিটি ও মজবুত চুল</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                <strong>ঘন চুলের সিক্রেট:</strong> চুলে কখনোই ক্ষতিকারক সালফেটযুক্ত শ্যাম্পু ব্যবহার করবেন না। সপ্তাহে অন্তত দুইবার রোজমেরি এবং ক্যাস্টর অয়েল দিয়ে স্ক্যাল্পে আলতো ম্যাসাজ করুন। হেয়ার ড্রায়ার এড়িয়ে চুলকে প্রাকৃতিকভাবে শুকাতে দিন।
              </p>
            </div>

          </div>
        </div>
      )}

      {subTab === 'products' && (() => {
        const categories = ["All", "🧼 Face Wash", "☀️ Sun Protection", "🧴 Hydration", "🎯 Acne & Spots", "🔥 Sculptor & Posture"];

        const filteredProducts = LOCAL_BD_PRODUCTS.filter(prod => {
          const matchesCategory = selectedProductCategory === "All" || prod.category === selectedProductCategory;
          const matchesKeyword = !productQuery.trim() || 
            prod.name.toLowerCase().includes(productQuery.toLowerCase()) || 
            prod.brand.toLowerCase().includes(productQuery.toLowerCase()) || 
            prod.benefit.toLowerCase().includes(productQuery.toLowerCase()) || 
            prod.concern.toLowerCase().includes(productQuery.toLowerCase());
          return matchesCategory && matchesKeyword;
        });

        // 5 Beautiful Stories configuration
        const storiesList = [
          { name: "My Glow", avatarBg: "from-blue-500 to-indigo-600", text: "আজকে সকালে ৫ ওয়াক্ত নামাজ এবং স্কিনকেয়ার সাকসেসফুলি কমপ্লিট! 🎯 প্রতিদিনের এই ডিসিপ্লিনই আমাদের ভবিষ্যতে অনন্য উচ্চতায় নিয়ে যাবে। অলসতাকে জয় করো!", imageEmoji: "🧼", color: "text-blue-400" },
          { name: "Savage Coach", avatarBg: "from-red-500 to-amber-500", text: "অলসতা ভাঙতে হলে সকালে জলদি ওঠো এবং ২০ বার পুশ-আপ দাও! জলাইন এমনিতেই শার্প হবে না! কঠোর পরিশ্রম করো, চ্যাম্পিয়ন!", imageEmoji: "🔥", color: "text-amber-400" },
          { name: "Love Angel", avatarBg: "from-pink-500 to-rose-600", text: "প্রথমে নিজের আত্মমর্যাদা আর সুন্দর ব্যক্তিত্ব গড়ে তোলো, ভালোবাসা তখন নিজেই নক করবে তোর দরজায়। সস্তা আকর্ষণে জড়াস না, নিজেকে দামী কর!", imageEmoji: "💖", color: "text-rose-400" },
          { name: "Skin Doc", avatarBg: "from-teal-400 to-emerald-600", text: "ত্বক ভালো রাখতে রাতে অবশ্যই ফেসওয়াশ ব্যবহার করবে এবং পর্যাপ্ত পানি পান করবে। ক্ষতিকর সানবার্ন থেকে বাঁচতে সানস্ক্রিন মাস্ট!", imageEmoji: "🧴", color: "text-emerald-400" },
          { name: "Atif (You)", avatarBg: "from-yellow-500 to-amber-600", text: "গ্রো গ্রাম অ্যাপের নতুন আপডেট রিলিজ হলো! ইনস্টাগ্রামের মতো ১০০% ফুল স্ক্রিন ইন্টারফেসে এখন উপভোগ করো জেনুইন বিউটি ও গ্রুমিং গাইড!", imageEmoji: "👑", color: "text-yellow-400" }
        ];

        return (
          <div className="w-full h-full max-w-none animate-fadeIn flex flex-col font-sans bg-black">
            
            {/* STORIES POPUP MODAL (INSTAGRAM REALS STYLE) */}
            <AnimatePresence>
              {activeStory && (
                <div className="fixed inset-0 z-[110] bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-0 md:p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full h-full md:max-w-md md:h-[650px] bg-gradient-to-b from-[#111] to-[#000] border-0 md:border md:border-zinc-800 rounded-none md:rounded-[32px] overflow-hidden flex flex-col relative shadow-2xl"
                  >
                    {/* Top Progress bar indicator */}
                    <div className="absolute top-4 inset-x-4 flex gap-1 z-50">
                      <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 7, ease: "linear" }}
                          onAnimationComplete={() => setActiveStory(null)}
                          className="h-full bg-gradient-to-r from-pink-500 to-yellow-500"
                        />
                      </div>
                    </div>

                    {/* Story Header */}
                    <div className="absolute top-8 inset-x-4 flex items-center justify-between z-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${activeStory.avatarBg} flex items-center justify-center text-xs font-bold text-white ring-2 ring-pink-500`}>
                          {activeStory.name[0]}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-white font-sans">{activeStory.name}</span>
                          <span className="block text-[9px] text-zinc-400 font-sans">Sponsored · Active Now</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveStory(null)}
                        className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Story Body with Big Emoji & Glassmorphism Message */}
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-7xl drop-shadow-lg"
                      >
                        {activeStory.imageEmoji}
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/40 p-6 rounded-2xl max-w-sm space-y-4 w-full"
                      >
                        <p className="text-sm text-zinc-200 leading-relaxed font-sans font-medium text-left">
                          {activeStory.text}
                        </p>

                        {/* Compact Level Display for 'me' option of Growgram */}
                        {activeStory.name === "Atif (You)" && typeof points === 'number' && (
                          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900/80 space-y-1.5 text-left w-full mt-3">
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                              <span className="font-bold text-gold-400">Level {Math.floor(points / 200) + 1} Status</span>
                              <span>{points} XP Total</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden p-[1px] border border-zinc-850">
                              <div 
                                style={{ width: `${Math.min(100, ((points % 200) / 200) * 100)}%` }}
                                className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full transition-all duration-300"
                              />
                            </div>
                            <div className="flex justify-between text-[8px] text-zinc-550 font-mono">
                              <span>{points % 200} / 200 XP</span>
                              <span>Next Level: {200 - (points % 200)} XP</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Story Swipe up helper */}
                    <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-1 z-55">
                      <motion.div 
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-xs text-zinc-400 font-mono flex flex-col items-center"
                      >
                        <span>Swipe Up for GlowUp</span>
                        <span className="text-pink-500 font-bold text-sm">↑</span>
                      </motion.div>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* INSTAGRAM-STYLE HEADER */}
            <div className="bg-black border-b border-zinc-900 shrink-0 px-4 py-3.5 flex items-center justify-between z-10">
              {/* Left Logo / back to chat */}
              <div className="flex items-center gap-3">
                {onBack && (
                  <button 
                    type="button"
                    onClick={onBack}
                    className="p-1 hover:text-white text-zinc-400 transition-colors"
                    title="ড্যাশবোর্ডে ফিরে যান"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                      <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                <span className="font-serif italic font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 cursor-default select-none">
                  Growgram
                </span>
                <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  LIVE
                </span>
              </div>

              {/* Middle Search Bar */}
              <div className="flex-1 max-w-xs mx-4 relative hidden sm:block">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="সার্চ প্রোডাক্টস..."
                  className="w-full bg-[#121212] border border-zinc-800 text-xs rounded-full pl-9 pr-4 py-1.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              {/* Right Menu Icons */}
              <div className="flex items-center gap-3.5 relative">
                <button
                  type="button"
                  onClick={() => {
                    setSubTab('chat');
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors relative"
                  title="এআই চ্যাটে যান"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black animate-pulse" />
                </button>
              </div>
            </div>

            {/* INSTAGRAM-STYLE MAIN SCROLL AREA */}
            <div className="flex-1 overflow-y-auto bg-[#000] scrollbar-thin scrollbar-thumb-zinc-900 flex flex-col items-center">
              
              {/* STORIES TRAY (Edge-to-edge list of circular stories) */}
              <div className="w-full max-w-2xl border-b border-zinc-900 py-3.5 px-4 flex items-center gap-4.5 overflow-x-auto scrollbar-none shrink-0 bg-black">
                {storiesList.map((story, idx) => (
                  <button
                    key={`story-${idx}`}
                    type="button"
                    onClick={() => setActiveStory(story)}
                    className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer group"
                  >
                    <div className="relative">
                      {/* Insta colored gradient ring wrapper */}
                      <div className="w-[66px] h-[66px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 transition-transform group-hover:scale-105 duration-200">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-[2px]">
                          <div className={`w-full h-full rounded-full bg-gradient-to-tr ${story.avatarBg} flex items-center justify-center text-xl font-bold text-white shadow-inner`}>
                            {story.imageEmoji}
                          </div>
                        </div>
                      </div>
                      {/* Green active dot */}
                      <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-black rounded-full" />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium tracking-tight truncate max-w-[62px] font-sans">
                      {story.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* SEARCH BAR MOBILE ONLY */}
              <div className="w-full max-w-2xl px-4 pt-3 sm:hidden bg-black shrink-0">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Search Growgram..."
                    className="w-full bg-[#121212] border border-zinc-850 text-xs rounded-xl pl-9 pr-4 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* HORIZONTAL CATEGORIES BAR */}
              <div className="w-full max-w-2xl px-4 py-3 bg-black overflow-x-auto scrollbar-none shrink-0 flex items-center gap-1.5">
                {categories.map((cat, idx) => (
                  <button
                    key={`cat-${idx}`}
                    type="button"
                    onClick={() => setSelectedProductCategory(cat)}
                    className={`px-3 py-1.5 text-[11px] font-sans rounded-full border transition-all shrink-0 cursor-pointer ${
                      selectedProductCategory === cat
                        ? 'bg-zinc-100 text-black border-zinc-100 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* THE FEED (List of beautiful edge-to-edge Instagram cards) */}
              <div className="w-full max-w-2xl px-0 sm:px-4 pb-12 space-y-5 bg-black">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 text-zinc-600">
                    <p className="text-xs">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
                    <button 
                      onClick={() => { setSelectedProductCategory("All"); setProductQuery(""); }} 
                      className="mt-3 text-xs font-bold text-pink-500 hover:underline"
                    >
                      ক্লিয়ার ফিল্টার
                    </button>
                  </div>
                ) : (
                  filteredProducts.map((prod, idx) => {
                    // Match with getGrowgramCaption for custom, emotional, thought-provoking text
                    const captionData = getGrowgramCaption(idx);
                    
                    // Like counts & Bookmarks custom state
                    const likesState = growgramLikes[idx] || { count: 124 + idx * 47, liked: false };
                    const commentsList = growgramComments[idx] || [
                      { author: "savage_bro_99", text: "পিক আর ক্যাপশনের গভীর কথাগুলো মন ছুঁয়ে গেল ভাই। ❤️" },
                      { author: "nisha_glow", text: idx % 2 === 0 ? "এই প্রোডাক্টটা অনেক জোস, স্কিন ব্যারিয়ার পুরা জোস করে!" : "বাংলাদেশী প্রাইসে আসল জিনিস চেনার সেরা গাইড!" }
                    ];
                    const isBookmarked = !!growgramBookmarks[idx];
                    const [expanded, setExpanded] = useState(false);

                    return (
                      <div 
                        key={`feed-post-${idx}`} 
                        className="bg-[#000] border-y sm:border sm:border-zinc-900 rounded-none sm:rounded-2xl overflow-hidden font-sans"
                      >
                        {/* Post Header: User, Location & Option Menu */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-950 bg-[#000]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-500 to-pink-500">
                              <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-[1px]">
                                <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-400 uppercase">
                                  {captionData.handle[0]}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[11.5px] font-bold text-white tracking-tight">{captionData.handle}</span>
                                <span className="text-sky-400 text-[10px]" title="Verified Specialist">👑</span>
                              </div>
                              <span className="block text-[9px] text-zinc-500 font-sans">{captionData.location}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 shrink-0">
                            {prod.priceBdt}
                          </span>
                        </div>

                        {/* Post Body: The visual product canvas (Double tap gesture trigger) */}
                        <div 
                          className="relative aspect-square w-full select-none cursor-pointer overflow-hidden"
                          onDoubleClick={() => {
                            // Trigger double click animation
                            setDoubleClickAnims(prev => ({ ...prev, [idx]: true }));
                            setTimeout(() => {
                              setDoubleClickAnims(prev => ({ ...prev, [idx]: false }));
                            }, 800);

                            // Increment likes if not liked yet
                            if (!likesState.liked) {
                              setGrowgramLikes(prev => ({
                                ...prev,
                                [idx]: { count: likesState.count + 1, liked: true }
                              }));
                              triggerNotification("পছন্দ করা হয়েছে!", "আপনি পোস্টটিতে লাইক দিয়েছেন ❤️");
                            }
                          }}
                        >
                          {/* Rich atmospheric background matching product profile */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${captionData.imageBg} flex flex-col justify-between p-6`}>
                            {/* Brand watermark badge */}
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-mono uppercase tracking-widest bg-black/40 text-zinc-300 border border-zinc-800/40 px-2.5 py-1 rounded-full backdrop-blur-md">
                                {prod.brand}
                              </span>
                              <div className="flex items-center gap-1 text-amber-400 text-xs bg-black/40 border border-zinc-800/40 px-2.5 py-1 rounded-full backdrop-blur-md">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{prod.rating}</span>
                              </div>
                            </div>

                            {/* Centered Beautiful Product Representation */}
                            <div className="text-center space-y-3.5 my-auto">
                              <div className="w-20 h-20 rounded-3xl bg-zinc-950/65 border border-zinc-800/50 flex items-center justify-center text-4xl mx-auto shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-105">
                                {prod.category.split(" ")[0]}
                              </div>
                              <div className="space-y-1 px-4">
                                <h4 className="text-sm font-display font-black text-white leading-tight tracking-wide drop-shadow-md">
                                  {prod.name}
                                </h4>
                                <p className="text-[10.5px] text-zinc-300/90 leading-relaxed font-sans max-w-xs mx-auto line-clamp-2">
                                  {prod.benefit}
                                </p>
                              </div>
                            </div>

                            {/* Bottom usage instruction banner */}
                            <div className="bg-black/55 backdrop-blur-md border border-zinc-800/30 p-2 rounded-xl text-center">
                              <p className="text-[9.5px] text-zinc-300/90 leading-normal font-sans">
                                <span className="text-amber-400 font-bold">📖 ব্যবহার:</span> {prod.howToUse}
                              </p>
                            </div>
                          </div>

                          {/* Heart popping animation overlap on double-tap */}
                          <AnimatePresence>
                            {doubleClickAnims[idx] && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: [0, 1.4, 0.9, 1.1, 1] }}
                                exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                                className="absolute inset-0 flex items-center justify-center z-20 bg-black/10"
                              >
                                <svg className="w-28 h-28 text-white filter drop-shadow-[0_10px_15px_rgba(239,68,68,0.4)] fill-red-500" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Engagement Interaction Buttons */}
                        <div className="px-4 py-3 flex items-center justify-between bg-black">
                          <div className="flex items-center gap-4 text-zinc-300">
                            <button 
                              type="button"
                              onClick={() => {
                                const newLiked = !likesState.liked;
                                setGrowgramLikes(prev => ({
                                  ...prev,
                                  [idx]: { count: likesState.count + (newLiked ? 1 : -1), liked: newLiked }
                                }));
                              }}
                              className="focus:outline-none transition-transform hover:scale-110 duration-150 cursor-pointer"
                            >
                              <Heart 
                                className={`w-5.5 h-5.5 ${likesState.liked ? 'text-red-500 fill-red-500 animate-heartBeat' : 'hover:text-red-400'}`} 
                              />
                            </button>
                            <button 
                              type="button"
                              className="hover:text-white transition-transform hover:scale-110 duration-150 cursor-pointer"
                              title="মন্তব্য দেখুন"
                            >
                              <MessageSquare className="w-5.5 h-5.5" />
                            </button>
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`GlowUp BD Guide: Check out ${prod.name} at only ${prod.priceBdt}!`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-white transition-transform hover:scale-110 duration-150 cursor-pointer"
                              title="বন্ধুর সাথে শেয়ার করুন"
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                              </svg>
                            </a>
                          </div>

                          <button 
                            type="button"
                            onClick={() => {
                              const newBookmarked = !isBookmarked;
                              setGrowgramBookmarks(prev => ({ ...prev, [idx]: newBookmarked }));
                              triggerNotification(
                                newBookmarked ? "সংরক্ষিত হয়েছে!" : "সংরক্ষণ বাতিল!", 
                                newBookmarked ? "প্রোডাক্টটি আপনার বুকমার্কে যোগ করা হয়েছে।" : "বুকমার্ক থেকে সরিয়ে ফেলা হয়েছে।"
                              );
                            }}
                            className="focus:outline-none text-zinc-300 hover:text-white transition-transform hover:scale-110 duration-150 cursor-pointer"
                            title="বুকমার্ক করুন"
                          >
                            <Bookmark className={`w-5.5 h-5.5 ${isBookmarked ? 'text-amber-500 fill-amber-500' : ''}`} />
                          </button>
                        </div>

                        {/* Likes counter display */}
                        <div className="px-4 pb-1 bg-black text-[11.5px] font-sans font-black text-white">
                          <span>{likesState.count.toLocaleString()} likes</span>
                        </div>

                        {/* Poetic couplet & deep meaning context captions */}
                        <div className="px-4 pb-2 bg-black leading-relaxed">
                          <div className="text-[11.5px] text-zinc-100 font-sans">
                            <span className="font-extrabold mr-2 text-white text-[12px]">{captionData.handle}</span>
                            
                            {/* First 2 lines of Poetic Couple */}
                            <span className="block italic text-pink-400 font-semibold mt-1 whitespace-pre-line leading-relaxed font-sans text-left">
                              {captionData.poetry}
                            </span>
                            
                            {/* Deep meaning context (next 2 lines) */}
                            {expanded ? (
                              <span className="block mt-2 text-zinc-300 leading-relaxed font-sans font-medium text-left border-l-2 border-zinc-800 pl-3 py-1 bg-zinc-950/40 rounded-r-lg">
                                {captionData.deep}
                              </span>
                            ) : null}

                            <button 
                              type="button"
                              onClick={() => setExpanded(!expanded)}
                              className="text-[10px] text-zinc-550 hover:text-zinc-350 font-bold tracking-wider mt-1.5 focus:outline-none block uppercase"
                            >
                              {expanded ? "सहज করে বলুন..." : "গভীর কথাটি জানুন..."}
                            </button>
                          </div>
                        </div>

                        {/* Direct Store Links */}
                        <div className="px-4 py-2 border-t border-zinc-950 bg-zinc-950/40 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider shrink-0">
                            জেনুইন শপ লিঙ্ক:
                          </span>
                          <div className="flex gap-1.5 font-mono">
                            {prod.source !== "Daraz Only" ? (
                              <a 
                                href={`https://www.arogga.com/search?q=${encodeURIComponent(prod.aroggaQuery)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/15 rounded-md text-[9px] font-bold uppercase transition-all"
                              >
                                Arogga
                              </a>
                            ) : null}
                            {prod.source !== "Arogga Only" ? (
                              <a 
                                href={`https://www.daraz.com.bd/catalog/?q=${encodeURIComponent(prod.darazQuery)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/15 rounded-md text-[9px] font-bold uppercase transition-all"
                              >
                                Daraz
                              </a>
                            ) : null}
                          </div>
                        </div>

                        {/* Post Comments section */}
                        <div className="px-4 py-2 border-t border-zinc-950 bg-black space-y-1.5">
                          {commentsList.map((comment, cIdx) => (
                            <div key={`comm-${cIdx}`} className="text-[10.5px] text-zinc-300 font-sans text-left">
                              <span className="font-extrabold mr-1.5 text-zinc-100">{comment.author}</span>
                              <span className="text-zinc-400 font-medium">{comment.text}</span>
                            </div>
                          ))}

                          {/* Write custom Comment form */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const inputVal = commentInputs[idx] || "";
                              if (!inputVal.trim()) return;

                              const updatedComments = [
                                ...commentsList,
                                { author: "atif_looksmax_king", text: inputVal }
                              ];

                              setGrowgramComments(prev => ({
                                ...prev,
                                [idx]: updatedComments
                              }));

                              setCommentInputs(prev => ({
                                ...prev,
                                [idx]: ""
                              }));

                              triggerNotification("মন্তব্য পোস্ট হয়েছে!", "আপনার মন্তব্যটি সফলভাবে যুক্ত করা হয়েছে 💬");
                            }}
                            className="flex items-center gap-2 pt-2"
                          >
                            <input
                              type="text"
                              value={commentInputs[idx] || ""}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                              placeholder="একটি সুন্দর মন্তব্য লিখুন..."
                              className="flex-1 bg-[#0c0c0e] border border-zinc-900 rounded-full px-3 py-1.5 text-[10px] text-zinc-100 placeholder-zinc-750 focus:outline-none focus:border-zinc-800"
                            />
                            <button
                              type="submit"
                              disabled={!(commentInputs[idx] || "").trim()}
                              className="text-[10px] font-black text-pink-500 hover:text-pink-400 disabled:opacity-30 pr-1 transition-colors"
                            >
                              Post
                            </button>
                          </form>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>
        );
      })()}

      {/* Hidden motivation audio element */}
      <audio ref={audioPlayerRef} loop />

      {/* Quick motivation popup dialog */}
      <AnimatePresence>
        {quickMotivationText && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0c20] border-2 border-amber-500/30 p-6 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl animate-bounce">
                👑
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-amber-400">
                  {quickMotivationTitle}
                </h3>
                <div className="h-0.5 w-12 bg-amber-500/20 mx-auto" />
              </div>

              <p className="text-sm text-zinc-100 font-sans leading-relaxed font-medium">
                "{quickMotivationText}"
              </p>

              {/* Minimal Audio Playback indicator */}
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-900 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-zinc-400">ব্যাকিং মিউজিক বাজছে...</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (audioPlayerRef.current) {
                      if (audioPlayerRef.current.paused) {
                        audioPlayerRef.current.play();
                      } else {
                        audioPlayerRef.current.pause();
                      }
                    }
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold"
                >
                  মিউজিক অন/অফ
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuickMotivationText(null);
                  if (audioPlayerRef.current) {
                    audioPlayerRef.current.pause();
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/10"
              >
                ধন্যবাদ ভাই! এবার কাজে ফিরি! 💪
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secret Audio Zone config modal */}
      <AnimatePresence>
        {showSecretAudioModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0c20] border border-zinc-800 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* FIXED HEADER */}
              <div className="p-4 border-b border-zinc-900 flex items-center justify-between shrink-0 bg-[#0b0c20]">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎵</span>
                  <h3 className="font-display font-black text-[11px] uppercase tracking-widest text-zinc-200">
                    সিক্রেট অডিও জোন (Secret Music Corner)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecretAudioModal(false)}
                  className="text-amber-500 hover:text-amber-400 cursor-pointer text-[10px] font-bold flex items-center gap-1 bg-zinc-950/80 px-2.5 py-1 rounded-full border border-zinc-900"
                >
                  <span>👈</span> ফিরে যান
                </button>
              </div>

              {/* SCROLLABLE BODY */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  কুইক হ্যাপি বা কুইক মোটিভেট বাটনে ক্লিক করলে ব্যাকগ্রাউন্ডে যে অডিও ট্র্যাকটি বাজবে তা এখান থেকে সিলেক্ট বা আপনার মোবাইল থেকে যুক্ত করতে পারেন! 📲
                </p>

                {/* Built-in Tracks List */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] uppercase font-mono tracking-widest text-zinc-500 font-bold">
                    ডিফল্ট ট্র্যাকসমূহ:
                  </span>
                  {DEFAULT_TRACKS.map((track, idx) => (
                    <button
                      key={`default-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveAudioKey(`default-${idx}`);
                        setTimeout(() => playMotivationAudio(`default-${idx}`), 100);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border border-zinc-900 text-[11px] font-sans flex items-center justify-between transition-all cursor-pointer ${
                        activeAudioKey === `default-${idx}`
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold'
                          : 'bg-zinc-950 border border-transparent text-zinc-300 hover:border-zinc-800'
                      }`}
                    >
                      <span>{track.name}</span>
                      {activeAudioKey === `default-${idx}` && <span className="text-[9px] text-amber-400 font-mono">ACTIVE 🔊</span>}
                    </button>
                  ))}
                </div>

                {/* Custom Uploaded Tracks */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="block text-[9px] uppercase font-mono tracking-widest text-zinc-500 font-bold">
                      আপনার নিজস্ব অডিও (My Devices):
                    </span>
                    <label className="text-[10px] text-amber-400 hover:text-amber-300 font-bold font-sans cursor-pointer flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      📥 অডিও যোগ করুন
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {customAudioList.length === 0 ? (
                    <p className="text-[10px] text-zinc-650 text-center py-4 bg-zinc-950 border border-zinc-900/40 rounded-xl">
                      মোবাইল থেকে কোনো অডিও ফাইল যোগ করা নেই।
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
                      {customAudioList.map((audio, idx) => (
                        <div
                          key={`custom-${idx}`}
                          className={`p-2.5 rounded-xl border text-[11px] font-sans flex flex-col gap-2 transition-all ${
                            activeAudioKey === `custom-${idx}`
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-zinc-950/60 border border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAudioKey(`custom-${idx}`);
                                setTimeout(() => playMotivationAudio(`custom-${idx}`), 100);
                              }}
                              className="flex-1 text-left truncate cursor-pointer font-bold text-xs text-zinc-200"
                            >
                              📲 {audio.name}
                            </button>
                            <div className="flex items-center gap-2 shrink-0">
                              {activeAudioKey === `custom-${idx}` && <span className="text-[9px] text-amber-400 font-mono">ACTIVE 🔊</span>}
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomAudio(idx)}
                                className="text-red-500 hover:text-red-400 text-xs p-1 cursor-pointer font-bold"
                                title="মুছে ফেলুন"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          {/* Auto categorization and analysis text display! */}
                          <div className="bg-[#050614] p-2 rounded-lg border border-zinc-900/50 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-amber-400/80 font-mono uppercase">
                                🎯 ম্যাচড ক্যাটাগরি: {audio.category === 'motivate' ? '🔥 কুইক মোটিভেট' : audio.category === 'love' ? '💖 কুইক লাভ' : '😊 কুইক হ্যাপি'}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                              {audio.analysis || "অডিও অ্যানালাইসিস সম্পন্ন: মাল্টি-পারপাস অ্যাসথেটিক সুর।"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mood Audio Setup Section */}
                {(() => {
                  const allAvailableTracks = [
                    ...DEFAULT_TRACKS.map((t, i) => ({ key: `default-${i}`, name: t.name })),
                    ...customAudioList.map((t, i) => ({ key: `custom-${i}`, name: `📲 ${t.name} (Custom)` }))
                  ];

                  return (
                    <div className="border-t border-zinc-900/60 pt-3.5 space-y-2">
                      <span className="block text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                        🎭 মুড অনুযায়ী কাস্টম অডিও (Mood Audio Setup):
                      </span>
                      
                      <div className="space-y-1.5">
                        {/* Happy Mood */}
                        <div className="flex items-center justify-between gap-3 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900/40">
                          <span className="text-[11px] font-sans text-zinc-300 font-medium flex items-center gap-1.5 shrink-0">
                            <span>😊</span> হ্যাপি (Happy):
                          </span>
                          <select
                            value={moodTracks.happy}
                            onChange={(e) => {
                              setMoodTracks(prev => ({ ...prev, happy: e.target.value }));
                              playMotivationAudio(e.target.value);
                            }}
                            className="bg-zinc-900 border border-zinc-850 text-zinc-200 text-[11px] rounded-lg p-1.5 focus:outline-none focus:border-amber-500 max-w-[170px] truncate"
                          >
                            {allAvailableTracks.map(t => (
                              <option key={t.key} value={t.key}>{t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Motivate Mood */}
                        <div className="flex items-center justify-between gap-3 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900/40">
                          <span className="text-[11px] font-sans text-zinc-300 font-medium flex items-center gap-1.5 shrink-0">
                            <span>🔥</span> মোটিভেট (Motivate):
                          </span>
                          <select
                            value={moodTracks.motivate}
                            onChange={(e) => {
                              setMoodTracks(prev => ({ ...prev, motivate: e.target.value }));
                              playMotivationAudio(e.target.value);
                            }}
                            className="bg-zinc-900 border border-zinc-850 text-zinc-200 text-[11px] rounded-lg p-1.5 focus:outline-none focus:border-amber-500 max-w-[170px] truncate"
                          >
                            {allAvailableTracks.map(t => (
                              <option key={t.key} value={t.key}>{t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Love Mood */}
                        <div className="flex items-center justify-between gap-3 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900/40">
                          <span className="text-[11px] font-sans text-zinc-300 font-medium flex items-center gap-1.5 shrink-0">
                            <span>💖</span> লাভ (Love):
                          </span>
                          <select
                            value={moodTracks.love}
                            onChange={(e) => {
                              setMoodTracks(prev => ({ ...prev, love: e.target.value }));
                              playMotivationAudio(e.target.value);
                            }}
                            className="bg-zinc-900 border border-zinc-850 text-zinc-200 text-[11px] rounded-lg p-1.5 focus:outline-none focus:border-amber-500 max-w-[170px] truncate"
                          >
                            {allAvailableTracks.map(t => (
                              <option key={t.key} value={t.key}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* FIXED FOOTER */}
              <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowSecretAudioModal(false);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  <span>👈</span> ফিরে যান (মিউজিক চালু থাকবে)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSecretAudioModal(false);
                    if (audioPlayerRef.current) {
                      audioPlayerRef.current.pause();
                    }
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>⏹️</span> বন্ধ করুন ও মিউজিক থামান
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIdentityEdit && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f0f14] border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative text-zinc-100"
            >
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-white">
                      আমার নিজের পরিচয় (Personal Identity)
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      চ্যাটে এআই আপনাকে এই নামে ডাকবে
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIdentityEdit(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                    আমার নিজের নাম (Your Personal Name):
                  </label>
                  <input
                    type="text"
                    value={customUserName}
                    onChange={(e) => setCustomUserName(e.target.value)}
                    placeholder="যেমন: আতিফ / চ্যাম্পিয়ন"
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <div className="bg-purple-950/20 border border-purple-900/30 p-3 rounded-xl text-[11px] text-purple-300 leading-relaxed">
                  💡 <strong>টিপস:</strong> এখানে আপনার নিজের আসল বা প্রিয় নামটি সেভ রাখলে GlowUp AI আপনাকে এই নামে সম্বোধন করবে।
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIdentityEdit(false)}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => saveIdentityNames(customUserName)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  সেভ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoveAngelFull && (
          <LoveAngelFull
            onClose={() => {
              setShowLoveAngelFull(false);
              try {
                const saved = localStorage.getItem('lookmax_crush_list_v2');
                if (saved) {
                  setCrushes(JSON.parse(saved));
                }
              } catch (e) {
                console.error("Failed to re-sync crushes in AiChatRoaster onClose", e);
              }
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
