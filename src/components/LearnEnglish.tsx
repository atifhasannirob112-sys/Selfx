import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, 
  ChevronRight, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  X, 
  Play, 
  BookOpen, 
  Check, 
  RotateCcw, 
  Flame, 
  Trophy, 
  ArrowRight,
  Smile,
  Volume2,
  Heart,
  Gem,
  Compass,
  Star,
  Gamepad2,
  User,
  GraduationCap,
  Clock,
  Upload,
  AlertTriangle,
  Search,
  Bookmark,
  RefreshCw,
  Tv,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlarmConfig, RingtoneOption } from '../types';
import { t } from '../utils';
import { acquireBgMusicPauseLock, releaseBgMusicPauseLock } from '../utils/remixAudioEngine';

interface LanguageLearnVideo {
  id: string;
  videoId: string;
  title: string;
  author: string;
  duration: string;
  views: string;
  published: string;
  thumbnail: string;
  language: string;
  xpValue: number;
}

const DEFAULT_LANGUAGE_VIDEOS: LanguageLearnVideo[] = [
  {
    id: 'lang_def_1',
    videoId: 'sRFEKvsw-vs',
    title: 'Spoken English Full Course in Bangla - সহজে ইংরেজিতে কথা বলার কৌশল',
    author: '10 Minute School',
    duration: '45:12',
    views: '3.8M views',
    published: 'Featured',
    thumbnail: 'https://i.ytimg.com/vi/sRFEKvsw-vs/hqdefault.jpg',
    language: 'English',
    xpValue: 25
  },
  {
    id: 'lang_def_2',
    videoId: 'henIVlCPVIY',
    title: 'প্রতিদিন ব্যবহৃত ১০০টি ছোট ইংরেজি বাক্য | Daily Use English Sentences in Bangla',
    author: 'Munzereen Shahid',
    duration: '18:30',
    views: '2.4M views',
    published: 'Popular',
    thumbnail: 'https://i.ytimg.com/vi/henIVlCPVIY/hqdefault.jpg',
    language: 'English',
    xpValue: 20
  },
  {
    id: 'lang_def_3',
    videoId: 'Jul2123_01A',
    title: 'Zero থেকে Spoken English শেখার সহজ উপায় | Learn English Easily',
    author: 'Shafin\'s',
    duration: '22:15',
    views: '1.5M views',
    published: 'Popular',
    thumbnail: 'https://i.ytimg.com/vi/Jul2123_01A/hqdefault.jpg',
    language: 'English',
    xpValue: 20
  },
  {
    id: 'lang_def_4',
    videoId: 'b7Ff2Wj8vZc',
    title: 'সহজে আরবি ভাষা শিখুন | Spoken Arabic Course in Bangla for Beginners',
    author: 'Arabic Learning BD',
    duration: '25:40',
    views: '890K views',
    published: 'Featured',
    thumbnail: 'https://i.ytimg.com/vi/b7Ff2Wj8vZc/hqdefault.jpg',
    language: 'Arabic',
    xpValue: 25
  },
  {
    id: 'lang_def_5',
    videoId: '9QiE-M1LrZ4',
    title: 'বাংলা থেকে হিন্দি ভাষা শিক্ষার সহজ কোর্স | Learn Spoken Hindi in Bangla',
    author: 'Language Master BD',
    duration: '19:10',
    views: '640K views',
    published: 'Popular',
    thumbnail: 'https://i.ytimg.com/vi/9QiE-M1LrZ4/hqdefault.jpg',
    language: 'Hindi',
    xpValue: 20
  },
  {
    id: 'lang_def_6',
    videoId: 'rGrBHiuPlT0',
    title: 'Japanese Language N5 Full Course in Bangla | সহজে জাপানি ভাষা শিখুন',
    author: 'Learn Japanese BD',
    duration: '34:50',
    views: '520K views',
    published: 'Featured',
    thumbnail: 'https://i.ytimg.com/vi/rGrBHiuPlT0/hqdefault.jpg',
    language: 'Japanese',
    xpValue: 25
  },
  {
    id: 'lang_def_7',
    videoId: 'ZinAK6n6cWU',
    title: 'Korean Language EPS TOPIK Course in Bangla | কোরিয়ান ভাষা শেখার সহজ ক্লাস',
    author: 'Korean Hub BD',
    duration: '28:15',
    views: '710K views',
    published: 'Popular',
    thumbnail: 'https://i.ytimg.com/vi/ZinAK6n6cWU/hqdefault.jpg',
    language: 'Korean',
    xpValue: 25
  },
  {
    id: 'lang_def_8',
    videoId: 'DAp_v7EH9AA',
    title: 'Learn Spanish Easily in Bangla | স্প্যানিশ ভাষা শেখার সহজ গাইড',
    author: 'Global Languages BD',
    duration: '21:05',
    views: '310K views',
    published: 'Popular',
    thumbnail: 'https://i.ytimg.com/vi/DAp_v7EH9AA/hqdefault.jpg',
    language: 'Spanish',
    xpValue: 20
  }
];

export interface LearnEnglishProps {
  onClose: () => void;
  onEarnPoints: (amount: number) => void;
  currentPoints: number;
  alarm?: AlarmConfig;
  setAlarm?: React.Dispatch<React.SetStateAction<AlarmConfig>>;
}

interface QuestionStep {
  type: 'vocabulary' | 'word-tap' | 'chat-dialog' | 'grammar-mcq';
  question: string;
  banglaQuestion: string;
  // For vocabulary/grammar
  options?: string[];
  correctOptionIndex?: number;
  // For word-tap
  correctOrder?: string[];
  jumbled?: string[];
  // For chat-dialog
  aiPrompt?: string;
  expectedKeywords?: string[];
  translation?: string;
}

interface DuolingoLesson {
  id: string;
  title: string;
  bengaliTitle: string;
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  xp: number;
  unlocked: boolean;
  completed: boolean;
  iconType: 'star' | 'book' | 'headphones' | 'game';
  steps: QuestionStep[];
}

export default function LearnEnglish({ onClose, onEarnPoints, currentPoints }: LearnEnglishProps) {
  useEffect(() => {
    acquireBgMusicPauseLock('component:learn_english');
    return () => releaseBgMusicPauseLock('component:learn_english');
  }, []);
  // Primary entry mode selector: Every time user enters Learn English, show two paths: Video and Practical
  const [entryPath, setEntryPath] = useState<'choose' | 'video' | 'practical'>('choose');

  // Navigation steps for Practical mode
  const [step, setStep] = useState<'onboarding-level' | 'onboarding-interest' | 'dashboard' | 'lesson'>('onboarding-level');
  const [level, setLevel] = useState<'basic' | 'intermediate' | 'advanced' | null>(null);
  const [interest, setInterest] = useState<'freelancing' | 'career' | 'daily' | 'travel' | null>(null);
  
  // Duolingo status stats
  const [hearts, setHearts] = useState(5);
  const [gems, setGems] = useState(() => {
    const saved = localStorage.getItem('selfx_english_gems');
    return saved ? parseInt(saved, 10) : 150;
  });
  const [streak, setStreak] = useState(5);
  const [englishXP, setEnglishXP] = useState(() => {
    const saved = localStorage.getItem('selfx_english_xp');
    return saved ? parseInt(saved, 10) : 120;
  });

  // Game/Lessons path state
  const [lessons, setLessons] = useState<DuolingoLesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<DuolingoLesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedMilestone, setSelectedMilestone] = useState<DuolingoLesson | null>(null);

  // Custom dynamic AI lesson generation states
  const [customTopic, setCustomTopic] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  // Active step interactive states
  const [mcqSelected, setMcqSelected] = useState<number | null>(null);
  const [wordTapSelected, setWordTapSelected] = useState<string[]>([]);
  const [wordTapJumbled, setWordTapJumbled] = useState<string[]>([]);
  const [dialogInput, setDialogInput] = useState('');
  const [dialogMessages, setDialogMessages] = useState<{ sender: 'ai' | 'user'; text: string; translation?: string }[]>([]);

  // Answer checking feedback states
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // ============================================================================
  // YOUTUBE MULTI-LANGUAGE VIDEO LEARNING SYSTEM (English + Other Languages)
  // ============================================================================
  const [selectedVideoLang, setSelectedVideoLang] = useState<string>('English');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [liveLanguageVideos, setLiveLanguageVideos] = useState<LanguageLearnVideo[]>([]);
  const [isSearchingLangVideos, setIsSearchingLangVideos] = useState<boolean>(false);
  const [activeLangVideo, setActiveLangVideo] = useState<LanguageLearnVideo | null>(null);
  const [isLangPlayerExpanded, setIsLangPlayerExpanded] = useState<boolean>(false);
  const [watchedLangVideoIds, setWatchedLangVideoIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('selfx_lang_watched_videos_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const langPlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('selfx_lang_watched_videos_v1', JSON.stringify(watchedLangVideoIds));
    } catch {}
  }, [watchedLangVideoIds]);

  useEffect(() => {
    if (activeLangVideo && langPlayerRef.current) {
      langPlayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLangVideo]);

  const fetchMoreLanguageVideos = async (lang: string, queryStr: string, append: boolean = false) => {
    setIsSearchingLangVideos(true);
    try {
      const res = await fetch('/api/language/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryStr,
          language: lang
        })
      });
      const data = await res.json();
      if (Array.isArray(data?.videos) && data.videos.length > 0) {
        setLiveLanguageVideos((prev) => {
          if (!append) return data.videos;
          const seen = new Set(prev.map((v) => v.videoId));
          return [...prev, ...data.videos.filter((v: LanguageLearnVideo) => !seen.has(v.videoId))];
        });
      }
    } catch {
      // Keep fallback
    } finally {
      setIsSearchingLangVideos(false);
    }
  };

  useEffect(() => {
    const trimmed = videoSearchQuery.trim();
    const timer = setTimeout(() => {
      fetchMoreLanguageVideos(selectedVideoLang, trimmed, false);
    }, trimmed ? 350 : 60);
    return () => clearTimeout(timer);
  }, [selectedVideoLang, videoSearchQuery]);

  // Filter out watched videos from the main interface so watched videos disappear and new ones take their place
  const displayedLangVideos: LanguageLearnVideo[] = React.useMemo(() => {
    const combined: LanguageLearnVideo[] = [];
    const seen = new Set<string>();

    const pushUnwatched = (v: LanguageLearnVideo) => {
      if (!v || !v.videoId || seen.has(v.videoId)) return;
      if (watchedLangVideoIds[v.videoId]) return; // Remove watched videos from main interface!
      seen.add(v.videoId);
      combined.push(v);
    };

    liveLanguageVideos.forEach(pushUnwatched);
    DEFAULT_LANGUAGE_VIDEOS.filter(
      (d) => selectedVideoLang === 'All' || d.language === selectedVideoLang
    ).forEach(pushUnwatched);
    DEFAULT_LANGUAGE_VIDEOS.forEach(pushUnwatched);

    return combined.slice(0, 8);
  }, [liveLanguageVideos, watchedLangVideoIds, selectedVideoLang]);

  const handleCompleteLanguageVideo = (vid: LanguageLearnVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchedLangVideoIds((prev) => ({ ...prev, [vid.videoId]: true }));
    const earned = vid.xpValue || 25;
    setEnglishXP((prev) => prev + earned);
    setGems((prev) => prev + 10);
    onEarnPoints(earned);
    if (activeLangVideo?.videoId === vid.videoId) {
      setActiveLangVideo(null);
      setIsLangPlayerExpanded(false);
    }
    // If pool gets low, fetch fresh replacement videos automatically
    if (displayedLangVideos.length <= 4) {
      fetchMoreLanguageVideos(selectedVideoLang, `${selectedVideoLang} speaking practice lesson`, true);
    }
  };

  // Save Gems to local storage
  useEffect(() => {
    localStorage.setItem('selfx_english_gems', gems.toString());
  }, [gems]);

  // Save XP to local storage
  useEffect(() => {
    localStorage.setItem('selfx_english_xp', englishXP.toString());
  }, [englishXP]);

  // Load / Setup gamified level path
  useEffect(() => {
    const savedLevel = localStorage.getItem('selfx_english_level');
    const savedInterest = localStorage.getItem('selfx_english_interest');
    const savedLessons = localStorage.getItem('selfx_english_lessons_completed_v2');
    const savedCustomLessons = localStorage.getItem('selfx_english_custom_lessons');
    
    if (savedLevel && savedInterest) {
      setLevel(savedLevel as any);
      setInterest(savedInterest as any);
      setStep('dashboard');
    }

    let customList: DuolingoLesson[] = [];
    if (savedCustomLessons) {
      try {
        customList = JSON.parse(savedCustomLessons);
      } catch (e) {}
    }

    // Build standard Duolingo level curriculum with exactly 4 steps per lesson
    const baseLessons: DuolingoLesson[] = [
      { 
        id: 'l1', 
        title: 'Client Greeting', 
        bengaliTitle: 'ক্লায়েন্ট সম্ভাষণ ও গ্রিটিংস', 
        category: 'freelancing', 
        difficulty: 'basic', 
        xp: 20, 
        unlocked: true, 
        completed: false,
        iconType: 'star',
        steps: [
          {
            type: 'vocabulary',
            question: 'Translate "সম্ভাষণ" to English:',
            banglaQuestion: 'সঠিক ইংরেজি শব্দ বেছে নিন:',
            options: ['Greeting', 'Negotiation', 'Salary', 'Deadline'],
            correctOptionIndex: 0
          },
          {
            type: 'word-tap',
            question: 'Arrange the words correctly: "হ্যালো, আমি আপনার সাথে কাজ করতে উন্মুখ হয়ে আছি।"',
            banglaQuestion: 'সঠিক বাক্যে শব্দগুলো সাজান:',
            correctOrder: ['Hello', 'I', 'am', 'excited', 'to', 'work', 'with', 'you'],
            jumbled: ['to', 'excited', 'Hello', 'with', 'work', 'am', 'you', 'I']
          },
          {
            type: 'chat-dialog',
            question: 'Complete Sophia\'s task by typing a friendly introduction containing the words "Hello" or "Hi":',
            banglaQuestion: 'সোফিয়ার সাথে চ্যাটে সম্ভাষণ করুন:',
            aiPrompt: "Hello! I am Sophia, your personal AI English trainer. Let's start! Can you send me a professional, warm greeting?",
            expectedKeywords: ['hello', 'hi', 'dear', 'greetings', 'hope'],
            translation: "হ্যালো! আমি সোফিয়া, আপনার ব্যক্তিগত ইংরেজি প্রশিক্ষক। শুরু করা যাক! আপনি কি আমাকে একটি প্রফেশনাল শুভেচ্ছা বার্তা পাঠাতে পারেন?"
          },
          {
            type: 'grammar-mcq',
            question: 'Which of these is the most professional client greeting for a proposal?',
            banglaQuestion: 'প্রস্তাবের জন্য সবচেয়ে পেশাদার সম্ভাষণ কোনটি?',
            options: [
              'Hey bro, what\'s up? Give me this job.',
              'Dear Client, I hope this message finds you well.',
              'Yo! I can do your work quickly, trust me.'
            ],
            correctOptionIndex: 1
          }
        ]
      },
      { 
        id: 'l2', 
        title: 'Salary Negotiation', 
        bengaliTitle: 'বেতন আলোচনা ও দরদাম', 
        category: 'career', 
        difficulty: 'intermediate', 
        xp: 30, 
        unlocked: false, 
        completed: false,
        iconType: 'book',
        steps: [
          {
            type: 'vocabulary',
            question: 'What does "Negotiate" mean?',
            banglaQuestion: 'নিচের কোনটি সঠিক অর্থ?',
            options: ['আলোচনা ও দরদাম করা', 'চাকরি থেকে ইস্তফা দেওয়া', 'অফিসের কাজ শেষ করা', 'উপহার গ্রহণ করা'],
            correctOptionIndex: 0
          },
          {
            type: 'word-tap',
            question: 'Arrange the words: "আমার কাজের রেট প্রতি ঘন্টায় ৫০ ডলার।"',
            banglaQuestion: 'সঠিকভাবে সাজিয়ে বাক্যটি তৈরি করুন:',
            correctOrder: ['My', 'rate', 'is', 'fifty', 'dollars', 'per', 'hour'],
            jumbled: ['per', 'fifty', 'rate', 'My', 'hour', 'dollars', 'is']
          },
          {
            type: 'chat-dialog',
            question: 'Answer Sophia politely when she asks about your hourly rate. Mention the word "dollar" or "rate":',
            banglaQuestion: 'রেট নিয়ে সোফিয়ার প্রশ্নের নম্র উত্তর দিন:',
            aiPrompt: "I really like your portfolio! What is your pricing structure or typical hourly rate?",
            expectedKeywords: ['rate', 'dollar', 'negotiable', 'per hour', 'usd'],
            translation: "আমি আপনার পোর্টফোলিও খুব পছন্দ করেছি! আপনার কাজের রেট কেমন বা ঘন্টায় কত চার্জ করেন?"
          },
          {
            type: 'grammar-mcq',
            question: 'Select the most polite and confident salary negotiation phrase:',
            banglaQuestion: 'সবচেয়ে মার্জিত ও আত্মবিশ্বাসী দরদামের বাক্যটি বেছে নিন:',
            options: [
              'I am expecting a salary aligned with my experience and skills.',
              'Give me high salary or else I will leave.',
              'Any low salary is fine, I need this job desperately.'
            ],
            correctOptionIndex: 0
          }
        ]
      },
      { 
        id: 'l3', 
        title: 'Introducing Yourself', 
        bengaliTitle: 'নিজের চমৎকার পরিচয় দেওয়া', 
        category: 'daily', 
        difficulty: 'basic', 
        xp: 25, 
        unlocked: false, 
        completed: false,
        iconType: 'headphones',
        steps: [
          {
            type: 'vocabulary',
            question: 'Which word means "অভিজ্ঞতা"?',
            banglaQuestion: 'সঠিক প্রতিশব্দ নির্বাচন করুন:',
            options: ['Confidence', 'Experience', 'Creativity', 'Opportunity'],
            correctOptionIndex: 1
          },
          {
            type: 'word-tap',
            question: 'Arrange words: "আমি বাংলাদেশ থেকে আসা একজন ওয়েব ডেভেলপার।"',
            banglaQuestion: 'সঠিক ক্রমানুসারে সাজান:',
            correctOrder: ['I', 'am', 'a', 'web', 'developer', 'from', 'Bangladesh'],
            jumbled: ['web', 'from', 'Bangladesh', 'am', 'I', 'developer', 'a']
          },
          {
            type: 'chat-dialog',
            question: 'Type a brief introduction about yourself to Sophia. Mention "Bangladesh" or "developer":',
            banglaQuestion: 'সোফিয়ার চ্যাটে নিজের পরিচয় দিন:',
            aiPrompt: "Nice to meet you! Can you introduce yourself and tell me a bit about your profession?",
            expectedKeywords: ['i am', 'bangladesh', 'developer', 'designer', 'work', 'skills'],
            translation: "আপনার সাথে দেখা করে ভালো লাগলো! আপনি কি নিজের পরিচয় দিতে পারেন এবং আপনার পেশা সম্পর্কে কিছু বলতে পারেন?"
          },
          {
            type: 'grammar-mcq',
            question: 'Which is grammatically correct and sounds natural?',
            banglaQuestion: 'কোন বাক্যটি ব্যাকরণগতভাবে সঠিক ও সাবলীল?',
            options: [
              'I have 5 years experience in coding.',
              'I have 5 years of experience in coding.',
              'I has 5 years coding experience.'
            ],
            correctOptionIndex: 1
          }
        ]
      },
      { 
        id: 'l4', 
        title: 'Ordering Food', 
        bengaliTitle: 'স্মার্টলি খাবার অর্ডার করা', 
        category: 'travel', 
        difficulty: 'basic', 
        xp: 20, 
        unlocked: false, 
        completed: false,
        iconType: 'game',
        steps: [
          {
            type: 'vocabulary',
            question: 'What is the english translation of "দয়া করে আমাকে বিল দিন"?',
            banglaQuestion: 'সঠিক ইংরেজি বাক্য কোনটি?',
            options: ['Can I have the bill, please?', 'Where is the food?', 'I don\'t want to pay.', 'Give me free water.'],
            correctOptionIndex: 0
          },
          {
            type: 'word-tap',
            question: 'Arrange words: "আমি এক কাপ কফি চাই, দয়া করে।"',
            banglaQuestion: 'কফি অর্ডারের বাক্যটি সাজান:',
            correctOrder: ['I', 'would', 'like', 'a', 'cup', 'of', 'coffee', 'please'],
            jumbled: ['coffee', 'like', 'I', 'a', 'please', 'cup', 'of', 'would']
          },
          {
            type: 'chat-dialog',
            question: 'Reply to the waiter (Sophia) and order a burger or juice. Mention "please" or "burger" or "juice":',
            banglaQuestion: 'সোফিয়ার অর্ডারের অনুরোধে রেসপন্স করুন:',
            aiPrompt: "Good evening! Welcome to Star Cafe. Are you ready to order, or do you need a few more minutes?",
            expectedKeywords: ['order', 'please', 'burger', 'coffee', 'juice', 'like to', 'have'],
            translation: "শুভ সন্ধ্যা! স্টার ক্যাফেতে স্বাগতম। আপনি কি অর্ডার করতে প্রস্তুত, নাকি আরও কিছু সময় লাগবে?"
          },
          {
            type: 'grammar-mcq',
            question: 'When is it appropriate to ask "Can I see the menu, please?"',
            banglaQuestion: 'কখন আপনি মেনু দেখতে চাইবেন?',
            options: [
              'When you have finished eating.',
              'When you first sit down at the restaurant table.',
              'When you are leaving and paying the bill.'
            ],
            correctOptionIndex: 1
          }
        ]
      },
      { 
        id: 'l5', 
        title: 'Polite Client Feedback', 
        bengaliTitle: 'ভদ্রভাবে ফিডব্যাক হ্যান্ডেল করা', 
        category: 'freelancing', 
        difficulty: 'intermediate', 
        xp: 25, 
        unlocked: false, 
        completed: false,
        iconType: 'star',
        steps: [
          {
            type: 'vocabulary',
            question: 'Translate "সংশোধন" to English:',
            banglaQuestion: 'সঠিক ইংরেজি শব্দ বেছে নিন:',
            options: ['Revision', 'Cancellation', 'Agreement', 'Payment'],
            correctOptionIndex: 0
          },
          {
            type: 'word-tap',
            question: 'Arrange words: "আমি অবিলম্বে প্রয়োজনীয় পরিবর্তন করব।"',
            banglaQuestion: 'সঠিক বাক্যে শব্দগুলো সাজান:',
            correctOrder: ['I', 'will', 'make', 'the', 'necessary', 'revisions', 'immediately'],
            jumbled: ['necessary', 'I', 'immediately', 'revisions', 'make', 'the', 'will']
          },
          {
            type: 'chat-dialog',
            question: 'Reply professionally to Sophia\'s request for design changes. Use keywords like "feedback" or "revise" or "sure":',
            banglaQuestion: 'সোফিয়ার ফিডব্যাক বার্তার উত্তর দিন:',
            aiPrompt: "The draft is great, but could you please change the background color to dark gray and update the fonts?",
            expectedKeywords: ['sure', 'feedback', 'revise', 'problem', 'update', 'immediately'],
            translation: "ড্রাফটটি চমৎকার হয়েছে, তবে আপনি কি ব্যাকগ্রাউন্ড কালার ডার্ক গ্রে করে ফন্টগুলো একটু আপডেট করে দিতে পারেন?"
          },
          {
            type: 'grammar-mcq',
            question: 'Which of the following replies is the most professional when receiving constructive feedback?',
            banglaQuestion: 'ক্লায়েন্ট ফিডব্যাক পাওয়ার পর কোন উত্তরটি পেশাদার?',
            options: [
              'I don\'t agree with you. My choice is perfect.',
              'Thank you for the feedback. I will update it right away.',
              'This is extra work, you have to pay double now.'
            ],
            correctOptionIndex: 1
          }
        ]
      },
      { 
        id: 'l6', 
        title: 'Airport Conversation', 
        bengaliTitle: 'এয়ারপোর্টে প্রয়োজনীয় কথা', 
        category: 'travel', 
        difficulty: 'intermediate', 
        xp: 30, 
        unlocked: false, 
        completed: false,
        iconType: 'book',
        steps: [
          {
            type: 'vocabulary',
            question: 'What is "Boarding Pass" used for?',
            banglaQuestion: 'বোর্ডিং পাস কিসের জন্য ব্যবহৃত হয়?',
            options: ['বিমানে ওঠার অনুমতিপত্র', 'হোটেলের চাবি', 'লাগেজের রশিদ', 'খাবারের বিল'],
            correctOptionIndex: 0
          },
          {
            type: 'word-tap',
            question: 'Arrange: "এই যে আমার পাসপোর্ট এবং বোর্ডিং পাস।"',
            banglaQuestion: 'সঠিক ইংরেজি বাক্য তৈরি করুন:',
            correctOrder: ['Here', 'is', 'my', 'passport', 'and', 'boarding', 'pass'],
            jumbled: ['and', 'passport', 'boarding', 'is', 'my', 'Here', 'pass']
          },
          {
            type: 'chat-dialog',
            question: 'Answer Sophia (the custom officer) politely. Mention "here" or "passport":',
            banglaQuestion: 'পাসপোর্ট চাওয়ার পর সোফিয়াকে উত্তর দিন:',
            aiPrompt: "Excuse me, sir. May I see your passport and boarding pass, please?",
            expectedKeywords: ['here', 'passport', 'sure', 'boarding pass', 'please'],
            translation: "মাফ করবেন স্যার। আমি কি আপনার পাসপোর্ট এবং বোর্ডিং পাস দেখতে পারি?"
          },
          {
            type: 'grammar-mcq',
            question: 'How do you ask someone for directions to the departure gate?',
            banglaQuestion: 'ডিপার্চার গেটের রাস্তা কিভাবে বিনম্রভাবে জিজ্ঞেস করবেন?',
            options: [
              'Tell me where is the departure gate now.',
              'Excuse me, could you please direct me to the departure gate?',
              'Departure gate is where?'
            ],
            correctOptionIndex: 1
          }
        ]
      },
      { 
        id: 'l7', 
        title: 'Client Interview Practice', 
        bengaliTitle: 'লাইভ ক্লায়েন্ট ইন্টারভিউ', 
        category: 'freelancing', 
        difficulty: 'advanced', 
        xp: 35, 
        unlocked: false, 
        completed: false,
        iconType: 'headphones',
        steps: [
          {
            type: 'vocabulary',
            question: 'What does "Strengths" mean in an interview context?',
            banglaQuestion: 'ইন্টারভিউতে "Strengths" এর অর্থ কী?',
            options: ['দুর্বল দিকসমূহ', 'দক্ষতা ও সবল দিকসমূহ', 'বেতনের দাবি', 'যোগাযোগের অভাব'],
            correctOptionIndex: 1
          },
          {
            type: 'word-tap',
            question: 'Arrange: "আমি সময়সীমা বজায় রেখে মানসম্মত কাজ সরবরাহ করতে পারি।"',
            banglaQuestion: 'সঠিক বাক্যে শব্দগুলো সাজান:',
            correctOrder: ['I', 'can', 'deliver', 'high', 'quality', 'work', 'on', 'time'],
            jumbled: ['deliver', 'time', 'work', 'can', 'high', 'on', 'I', 'quality']
          },
          {
            type: 'chat-dialog',
            question: 'Describe your core skills to Sophia. Mention "experience" or "skill" or "developer/designer":',
            banglaQuestion: 'সোফিয়াকে আপনার দক্ষতা সম্পর্কে বলুন:',
            aiPrompt: "Welcome to the interview! Can you tell me about your primary strength and why we should hire you?",
            expectedKeywords: ['hire', 'skill', 'experience', 'quality', 'expert', 'work', 'developer', 'designer'],
            translation: "ইন্টারভিউতে স্বাগতম! আপনি কি আপনার মূল দক্ষতা সম্পর্কে বলতে পারেন এবং কেন আমরা আপনাকে নেব?"
          },
          {
            type: 'grammar-mcq',
            question: 'Which sentence describes your skills in a highly confident and professional manner?',
            banglaQuestion: 'নিজের দক্ষতা প্রকাশের সেরা প্রফেশনাল বাক্য কোনটি?',
            options: [
              'I am a self-motivated developer with a proven track record of building responsive apps.',
              'I know a lot of coding, I am the best coder in the world.',
              'I can do anything you want, just give me money.'
            ],
            correctOptionIndex: 0
          }
        ]
      },
      { 
        id: 'l8', 
        title: 'Professional Pitching', 
        bengaliTitle: 'স্মার্ট বিজনেস প্রেজেন্টেশন', 
        category: 'career', 
        difficulty: 'advanced', 
        xp: 40, 
        unlocked: false, 
        completed: false,
        iconType: 'game',
        steps: [
          {
            type: 'vocabulary',
            question: 'What is a "Pitch" in business?',
            banglaQuestion: 'ব্যবসায়িক "Pitch" বলতে কী বোঝায়?',
            options: ['আইডিয়া চমৎকারভাবে উপস্থাপন করা', 'দাম কমানোর অনুরোধ', 'হিসাব বইয়ের তালিকা', 'অফিসের আসবাবপত্র'],
            correctOptionIndex: 0
          },
          {
            type: 'word-tap',
            question: 'Arrange: "আমাদের সমাধান আপনার ব্যবসার কার্যকারিতা ৩০ শতাংশ বাড়িয়ে দেবে।"',
            banglaQuestion: 'সঠিক ক্রমানুসারে বাক্যটি সাজান:',
            correctOrder: ['Our', 'solution', 'will', 'increase', 'your', 'efficiency', 'by', 'thirty', 'percent'],
            jumbled: ['thirty', 'efficiency', 'will', 'Our', 'your', 'percent', 'solution', 'increase', 'by']
          },
          {
            type: 'chat-dialog',
            question: 'Pitch your unique solution to Sophia. Mention "solution" or "increase" or "save":',
            banglaQuestion: 'সোফিয়ার কাছে আপনার প্রজেক্ট আইডিয়া পিচ করুন:',
            aiPrompt: "I am interested in your project proposal. How does your solution benefit my business?",
            expectedKeywords: ['solution', 'increase', 'efficiency', 'save', 'benefit', 'growth', 'business'],
            translation: "আমি আপনার প্রজেক্ট প্রপোজালটি পছন্দ করেছি। আপনার এই সমাধানটি আমার ব্যবসার কী উপকার করবে?"
          },
          {
            type: 'grammar-mcq',
            question: 'Which structure is ideal for summarizing a business pitch headline?',
            banglaQuestion: 'বিজনেস পিচ হেডলাইন সামারাইজ করার আদর্শ বাক্য কোনটি?',
            options: [
              'We help startups scale their operations by automating key workflows.',
              'We do automation for startup companies which is very nice.',
              'Startup operations get automations because of our software.'
            ],
            correctOptionIndex: 0
          }
        ]
      }
    ];

    const fullLessonsList = [...baseLessons, ...customList];

    if (savedLessons) {
      try {
        const completedIds = JSON.parse(savedLessons) as string[];
        const updated = fullLessonsList.map((les, idx) => {
          const isCompleted = completedIds.includes(les.id);
          // Unlock rule: first is unlocked, or previous lesson is completed, or it's custom generated (gen_)
          let unlocked = idx === 0 || les.id.startsWith('gen_');
          if (idx > 0 && !les.id.startsWith('gen_')) {
            const prevLesson = fullLessonsList[idx - 1];
            unlocked = completedIds.includes(prevLesson.id);
          }
          return {
            ...les,
            completed: isCompleted,
            unlocked: unlocked
          };
        });
        setLessons(updated);
      } catch (e) {
        setLessons(fullLessonsList);
      }
    } else {
      setLessons(fullLessonsList);
    }
  }, []);

  const handleSelectLevel = (selected: 'basic' | 'intermediate' | 'advanced') => {
    setLevel(selected);
    localStorage.setItem('selfx_english_level', selected);
    setStep('onboarding-interest');
  };

  const handleSelectInterest = (selected: 'freelancing' | 'career' | 'daily' | 'travel') => {
    setInterest(selected);
    localStorage.setItem('selfx_english_interest', selected);
    setStep('dashboard');
    onEarnPoints(15); // Reward onboarding
    setGems(prev => prev + 50); // Welcome bonus gems
  };

  // Start selected lesson
  const handleStartLesson = (lesson: DuolingoLesson) => {
    setActiveLesson(lesson);
    setSelectedMilestone(null);
    setStep('lesson');
    setCurrentStepIndex(0);
    resetStepStates(lesson.steps[0]);
  };

  const resetStepStates = (stepData: QuestionStep) => {
    setMcqSelected(null);
    setIsChecked(false);
    setIsCorrect(null);
    setFeedbackMsg('');
    setWordTapSelected([]);
    setDialogInput('');

    if (stepData.type === 'word-tap') {
      const copyJumbled = [...(stepData.jumbled || [])];
      setWordTapJumbled(copyJumbled.sort(() => Math.random() - 0.5));
    } else if (stepData.type === 'chat-dialog') {
      setDialogMessages([
        { sender: 'ai', text: stepData.aiPrompt || '', translation: stepData.translation }
      ]);
    }
  };

  // Word tap actions
  const handleTapWord = (word: string) => {
    if (isChecked) return;
    setWordTapSelected(prev => [...prev, word]);
    setWordTapJumbled(prev => prev.filter(w => w !== word));
  };

  const handleRemoveWord = (word: string) => {
    if (isChecked) return;
    setWordTapSelected(prev => prev.filter(w => w !== word));
    setWordTapJumbled(prev => [...prev, word]);
  };

  // Main Answer Checker
  const handleCheckAnswer = () => {
    if (!activeLesson) return;
    const currentStep = activeLesson.steps[currentStepIndex];
    let correct = false;
    let feedback = '';

    if (currentStep.type === 'vocabulary' || currentStep.type === 'grammar-mcq') {
      if (mcqSelected === null) return;
      correct = mcqSelected === currentStep.correctOptionIndex;
      feedback = correct 
        ? "অসাধারণ! আপনার উত্তর একদম সঠিক হয়েছে। চমৎকার প্রস্তুতি! 🎉" 
        : `দুঃখিত, উত্তরটি সঠিক হয়নি। সঠিক উত্তর ছিল: "${currentStep.options?.[currentStep.correctOptionIndex || 0]}"`;
    } else if (currentStep.type === 'word-tap') {
      const isWordOrderCorrect = JSON.stringify(wordTapSelected) === JSON.stringify(currentStep.correctOrder);
      correct = isWordOrderCorrect;
      feedback = correct 
        ? "দারুণ! আপনি নিখুঁতভাবে বাক্যটি গঠন করতে পেরেছেন। 👑" 
        : `ভুল বিন্যাস। সঠিক বাক্য: "${currentStep.correctOrder?.join(' ')}"`;
    } else if (currentStep.type === 'chat-dialog') {
      if (!dialogInput.trim()) return;
      
      const userText = dialogInput.trim();
      setDialogMessages(prev => [...prev, { sender: 'user', text: userText }]);
      
      const textLower = userText.toLowerCase();
      // Check if user text contains at least one expected keyword
      const hasKeywords = currentStep.expectedKeywords?.some(word => textLower.includes(word));
      
      correct = !!hasKeywords;
      feedback = correct 
        ? "চমৎকার সংলাপ! সোফিয়া আপনার প্রতিক্রিয়া খুবই পছন্দ করেছে এবং বাক্য গঠন চমৎকার লেগেছে! ✨"
        : "সোফিয়া আপনার প্রতিক্রিয়া পুরোপুরি বুঝতে পারেনি। আরও স্পষ্ট ও প্রাসঙ্গিক বাক্য ব্যবহার করে পুনরায় চ্যাট করার অনুরোধ রইল!";

      setDialogInput('');
    }

    setIsCorrect(correct);
    setIsChecked(true);
    setFeedbackMsg(feedback);

    if (correct) {
      // Reward gems & points
      setGems(prev => prev + 5);
    } else {
      // Lose heart/life
      setHearts(prev => Math.max(0, prev - 1));
    }
  };

  // Proceed to next step or complete lesson
  const handleNextStep = () => {
    if (!activeLesson) return;

    if (currentStepIndex < activeLesson.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      resetStepStates(activeLesson.steps[nextIndex]);
    } else {
      // Completed all 4 steps of the lesson!
      setEnglishXP(prev => prev + activeLesson.xp);
      onEarnPoints(activeLesson.xp);
      setGems(prev => prev + 25); // Finish bonus gems
      markLessonCompleted(activeLesson.id);
      setStep('dashboard');
      setActiveLesson(null);
    }
  };

  const markLessonCompleted = (lessonId: string) => {
    try {
      const completed = JSON.parse(localStorage.getItem('selfx_english_lessons_completed_v2') || '[]') as string[];
      if (!completed.includes(lessonId)) {
        completed.push(lessonId);
        localStorage.setItem('selfx_english_lessons_completed_v2', JSON.stringify(completed));
      }
    } catch (e) {}

    // Update state & unlock next lesson in progression
    setLessons(prev => {
      return prev.map((les, idx) => {
        const isCompleted = les.id === lessonId || les.completed;
        let unlocked = les.unlocked;
        if (idx > 0) {
          const prevLesson = prev[idx - 1];
          unlocked = prevLesson.id === lessonId || prevLesson.completed;
        }
        return {
          ...les,
          completed: isCompleted,
          unlocked: unlocked
        };
      });
    });
  };

  const handleRefillHearts = () => {
    if (gems >= 50) {
      setGems(prev => prev - 50);
      setHearts(5);
    } else {
      alert("দুঃখিত, হার্ট রিফিল করার জন্য পর্যাপ্ত জেমস নেই!");
    }
  };

  const triggerNotification = (title: string, desc: string, isError: boolean = false) => {
    // Fallback trigger notification
    try {
      const { triggerNotification: parentTrigger } = require('../utils');
      parentTrigger(title, desc, isError);
    } catch {
      console.log(`[Notification] ${title}: ${desc}`);
    }
  };

  const handleGenerateCustomLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) {
      alert("দয়া করে টপিক বা বিষয়বস্তু লিখুন!");
      return;
    }

    setGeneratingLesson(true);
    try {
      const response = await fetch("/api/english/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customTopic.trim(),
          difficulty: customDifficulty
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate lesson from server.");
      }

      const resData = await response.json();
      if (resData.success && resData.lesson) {
        const newLec: DuolingoLesson = resData.lesson;
        // Save to localStorage list of custom lessons
        const savedCustom = localStorage.getItem('selfx_english_custom_lessons');
        const customList = savedCustom ? JSON.parse(savedCustom) : [];
        customList.push(newLec);
        localStorage.setItem('selfx_english_custom_lessons', JSON.stringify(customList));

        // Append to local state lessons
        setLessons(prev => {
          if (prev.some(l => l.id === newLec.id)) return prev;
          return [...prev, { ...newLec, unlocked: true, completed: false }];
        });

        alert("🎉 AI Lesson Ready! সোফিয়া আপনার জন্য একটি চমৎকার কাস্টম লেভেল তৈরি করেছে!");
        setCustomTopic('');
        setShowGenerateForm(false);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (err: any) {
      console.error("AI Lesson Generation failed:", err);
      alert("দুঃখিত, কাস্টম লেভেল তৈরি করা সম্ভব হয়নি। আবার চেষ্টা করুন।");
    } finally {
      setGeneratingLesson(false);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm("আপনি কি ইংরেজি অনবোর্ডিং এবং সমস্ত লেভেল নতুন করে শুরু করতে চান?")) {
      localStorage.removeItem('selfx_english_level');
      localStorage.removeItem('selfx_english_interest');
      localStorage.removeItem('selfx_english_lessons_completed_v2');
      localStorage.setItem('selfx_english_xp', '120');
      localStorage.setItem('selfx_english_gems', '150');
      setLevel(null);
      setInterest(null);
      setHearts(5);
      setGems(150);
      setEnglishXP(120);
      setStep('onboarding-level');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] text-zinc-100 font-sans select-none">
      
      {/* DUOLINGO PREMIUM HIGH-CONTRAST HEADER */}
      <div className="bg-[#09090b] border-b border-zinc-900/80 px-3.5 sm:px-6 py-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Languages className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <span className="truncate">Duolingo English Lab</span>
              <span className="text-[8px] sm:text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold font-mono shrink-0">Premium</span>
            </h2>
            <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-1 truncate">
              Level tree game interactive trainer
            </p>
          </div>
        </div>

        {/* STATUS BAR WITH HEARTS, GEMS & STREAK */}
        {entryPath === 'practical' && step === 'dashboard' && (
          <div className="hidden md:flex items-center gap-5 bg-zinc-950 px-4 py-2 rounded-2xl border border-zinc-900">
            <div className="flex items-center gap-1.5 text-orange-400 font-bold" title="Daily Streak">
              <Flame className="w-4 h-4 fill-current" />
              <span className="text-xs font-mono">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold" title="Gems Balance">
              <Gem className="w-4 h-4 fill-current" />
              <span className="text-xs font-mono">{gems}</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-500 font-bold" title="Hearts / Lives">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
              <span className="text-xs font-mono">{hearts}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {entryPath !== 'choose' && (
            <button
              type="button"
              onClick={() => {
                setActiveLangVideo(null);
                setIsLangPlayerExpanded(false);
                setEntryPath('choose');
              }}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] sm:text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1"
            >
              <span>← পথ পরিবর্তন</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 text-[11px] sm:text-xs font-bold uppercase rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* CORE CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full flex flex-col justify-start">

        {/* =====================================================================
            ENTRY SCREEN: CHOOSE BETWEEN 2 PATHS (1. VIDEO  2. PRACTICAL)
            Appears every time the user opens Learn English
           ===================================================================== */}
        {entryPath === 'choose' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto w-full my-auto py-8 space-y-6 text-center"
          >
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                <Languages className="w-3.5 h-3.5" /> Learn English & Languages
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                আপনি কোন পথে শিখতে চান?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                আপনার পছন্দের মাধ্যমটি বেছে নিন—সরাসরি ভিডিও দেখে শিখুন অথবা প্র্যাকটিক্যাল কুইজ ও চ্যাটের মাধ্যমে অনুশীলন করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
              {/* PATH 1: VIDEO */}
              <button
                type="button"
                onClick={() => setEntryPath('video')}
                className="group relative bg-gradient-to-br from-[#0b1914] via-[#09110e] to-zinc-950 hover:from-emerald-950/60 border-2 border-emerald-500/35 hover:border-emerald-400 rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all duration-300 cursor-pointer shadow-[0_10px_35px_rgba(16,185,129,0.12)] active:scale-98 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
                    <Tv className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider">
                    Path 1 • YouTube
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <span>🎬 Video (ভিডিও ক্লাস)</span>
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    সহজে সুন্দর ভিডিওগুলো দেখে Spoken English এবং আরবি, হিন্দি, জাপানি, কোরিয়ানসহ বিভিন্ন ভাষা শিখুন। দেখা শেষ হলে নতুন ভিডিও আসবে!
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs font-black text-emerald-400">
                  <span>ভিডিওগুলো দেখুন</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* PATH 2: PRACTICAL */}
              <button
                type="button"
                onClick={() => setEntryPath('practical')}
                className="group relative bg-gradient-to-br from-[#101422] via-[#0b0e17] to-zinc-950 hover:from-blue-950/60 border-2 border-blue-500/35 hover:border-blue-400 rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all duration-300 cursor-pointer shadow-[0_10px_35px_rgba(59,130,246,0.12)] active:scale-98 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform">
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider">
                    Path 2 • Interactive
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                    <span>🎯 Practical (প্র্যাকটিক্যাল অনুশীলন)</span>
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    আগের মতো ডুলিংগো লেভেল ট্রি, ভোকাবুলারি কুইজ, বাক্য সাজানো এবং সোফিয়ার সাথে সরাসরি ইংরেজি চ্যাট করে প্র্যাকটিক্যাল অনুশীলন করুন।
                  </p>
                </div>

                <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between text-xs font-black text-blue-400">
                  <span>প্র্যাকটিক্যাল শুরু করুন</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* =====================================================================
            PATH 1: DEDICATED VIDEO MODE (YOUTUBE LANGUAGE VIDEO HUB)
           ===================================================================== */}
        {entryPath === 'video' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="bg-[#080d0b] border border-emerald-500/25 rounded-3xl p-4 sm:p-5 text-left space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                        YouTube Video Language Hub
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                        English + ৭টি ভাষা
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      সহজে ভিডিও দেখে Spoken English এবং আরবি, হিন্দি, জাপানি, কোরিয়ানসহ বিভিন্ন ভাষা শিখুন। দেখা শেষ হলে নতুন ভিডিও আসবে!
                    </p>
                  </div>
                </div>
              </div>

              {/* Language Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'English', label: '🇬🇧 English শেখা' },
                  { id: 'Arabic', label: '🇸🇦 আরবি (Arabic)' },
                  { id: 'Hindi', label: '🇮🇳 হিন্দি (Hindi)' },
                  { id: 'Japanese', label: '🇯🇵 জাপানি (Japanese)' },
                  { id: 'Korean', label: '🇰🇷 কোরিয়ান (Korean)' },
                  { id: 'Spanish', label: '🇪🇸 স্প্যানিশ (Spanish)' },
                  { id: 'German', label: '🇩🇪 জার্মান (German)' },
                  { id: 'Chinese', label: '🇨🇳 চাইনিজ (Chinese)' }
                ].map((langOpt) => {
                  const active = selectedVideoLang === langOpt.id;
                  return (
                    <button
                      key={langOpt.id}
                      type="button"
                      onClick={() => setSelectedVideoLang(langOpt.id)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-emerald-500/40 hover:text-white'
                      }`}
                    >
                      {langOpt.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar for any Language Video */}
              <div className="relative flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-emerald-400/60 rounded-2xl px-3.5 py-2.5">
                <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  placeholder={`${selectedVideoLang} ভাষা শেখার যেকোনো টপিক লিখে YouTube ভিডিও সার্চ করুন...`}
                  className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                {videoSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setVideoSearchQuery('')}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="pl-2.5 border-l border-zinc-800 ml-1">
                  {isSearchingLangVideos ? (
                    <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
              </div>

              {/* Active Large YouTube Video Player */}
              {activeLangVideo && (
                <div
                  ref={langPlayerRef}
                  className={
                    isLangPlayerExpanded
                      ? 'fixed inset-0 z-[250] bg-black/95 backdrop-blur-xl flex flex-col justify-center p-3 sm:p-6 overflow-y-auto'
                      : 'bg-zinc-950 border-2 border-emerald-500/45 rounded-2xl p-3 sm:p-4 space-y-3 shadow-2xl'
                  }
                >
                  <div className={isLangPlayerExpanded ? 'max-w-6xl w-full mx-auto space-y-3' : 'space-y-3'}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                          {activeLangVideo.language} Video Class • {activeLangVideo.author}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {activeLangVideo.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsLangPlayerExpanded((prev) => !prev)}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {isLangPlayerExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                          <span>{isLangPlayerExpanded ? 'ছোট করুন' : 'বড় স্ক্রিন'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCompleteLanguageVideo(activeLangVideo, e)}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                        >
                          Close ✕
                        </button>
                      </div>
                    </div>

                    <div
                      className={`relative w-full rounded-xl overflow-hidden bg-black border border-emerald-500/30 ${
                        isLangPlayerExpanded ? 'h-[65vh] sm:h-[78vh]' : 'min-h-[250px] sm:min-h-[420px] aspect-video'
                      }`}
                    >
                      <iframe
                        key={activeLangVideo.videoId}
                        src={`https://www.youtube.com/embed/${activeLangVideo.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                        title={activeLangVideo.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Video Feed List (Auto-Replaces Watched Videos) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedLangVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setActiveLangVideo(vid)}
                    className="group bg-zinc-950/90 hover:bg-zinc-900/90 border border-zinc-850 hover:border-emerald-500/45 rounded-2xl p-3 flex items-start gap-3 transition-all cursor-pointer"
                  >
                    <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-800">
                      <img
                        src={`https://i.ytimg.com/vi/${vid.videoId}/hqdefault.jpg`}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono font-bold text-white">
                        {vid.duration}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                        {vid.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {vid.author} • {vid.views}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-bold text-emerald-300">
                          {vid.language}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 1: ONBOARDING LEVEL (PRACTICAL MODE) */}
        {entryPath === 'practical' && step === 'onboarding-level' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center max-w-md mx-auto my-auto py-12"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 text-3xl">
              🎯
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">আপনার ইংরেজির বর্তমান লেভেল কোনটি?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">লেভেল অনুযায়ী সোফিয়া আপনার সাথে ইংরেজি চ্যাট ও গেম খেলবে।</p>
            </div>

            <div className="space-y-3 pt-4">
              {[
                { id: 'basic', title: 'Basic / প্রারম্ভিক', desc: 'আমি মাত্র ইংরেজি শিখা শুরু করেছি বা অল্প বুঝতে পারি', emoji: '🌱' },
                { id: 'intermediate', title: 'Intermediate / মধ্যবর্তী', desc: 'পড়তে ও বুঝতে পারি, কিন্তু ফ্লুয়েন্টলি বলতে সমস্যা হয়', emoji: '⚡' },
                { id: 'advanced', title: 'Advanced / উন্নত', desc: 'সহজেই ইংরেজিতে কথা বলি, তবে আরো নিখুঁত হতে চাই', emoji: '🔥' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectLevel(opt.id as any)}
                  className="w-full text-left p-4 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 flex items-center gap-4 cursor-pointer group"
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-zinc-100 group-hover:text-emerald-400 transition-colors block">{opt.title}</span>
                    <span className="text-[10px] text-zinc-550 block leading-tight">{opt.desc}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 ml-auto group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: ONBOARDING INTEREST (PRACTICAL MODE) */}
        {entryPath === 'practical' && step === 'onboarding-interest' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center max-w-md mx-auto my-auto py-12"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 text-3xl">
              🚀
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">আপনার ইংরেজি শেখার মূল উদ্দেশ্য কী?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">উদ্দেশ্য অনুযায়ী সোফিয়া আপনার সাথে গেম খেলবে এবং চ্যাট করবে।</p>
            </div>

            <div className="space-y-3 pt-4">
              {[
                { id: 'freelancing', title: 'Freelancing / ফ্রিল্যান্সিং ও টেক', desc: 'ক্লায়েন্টের সাথে প্রফেশনাল কমিউনিকেশন ও বিড', emoji: '💻' },
                { id: 'career', title: 'Career & Jobs / চাকরি ও ইন্টারভিউ', desc: 'অফিস মিটিং, সিভি প্রেজেন্টেশন ও কর্পোরেট স্মার্টনেস', emoji: '💼' },
                { id: 'daily', title: 'Daily Fluency / দৈনিক আড্ডা', desc: 'বন্ধু ও আড্ডায় সাবলীল ইংরেজি কথা বলা', emoji: '💬' },
                { id: 'travel', title: 'Travel / বিদেশ ভ্রমণ', desc: 'এয়ারপোর্ট, রেস্টুরেন্ট ও শপিংয়ে স্মার্ট ইংরেজি', emoji: '✈️' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectInterest(opt.id as any)}
                  className="w-full text-left p-4 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 flex items-center gap-4 cursor-pointer group"
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-zinc-100 group-hover:text-emerald-400 transition-colors block">{opt.title}</span>
                    <span className="text-[10px] text-zinc-550 block leading-tight">{opt.desc}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 ml-auto group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: MAIN DUOLINGO GAME DASHBOARD & PATH TREE (PRACTICAL MODE) */}
        {entryPath === 'practical' && step === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* MOBILE ONLY STATS BAR */}
            <div className="flex md:hidden items-center justify-between bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-900 text-xs">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Flame className="w-4 h-4 fill-current" />
                <span className="font-mono">{streak}d</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Gem className="w-4 h-4 fill-current" />
                <span className="font-mono">{gems}</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                <Heart className="w-4 h-4 fill-current" />
                <span className="font-mono">{hearts}</span>
              </div>
            </div>

            {/* DASHBOARD GRID STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* English Mastery XP */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-4.5 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 block font-bold">English Mastery XP</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-display font-black text-emerald-400">{englishXP}</span>
                    <span className="text-xs text-zinc-450 font-bold">XP Accumulated 🏆</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>

              {/* Current Learning Profile Info */}
              <div className="bg-[#09090b] border border-zinc-900 p-4.5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase font-mono text-zinc-550 block">My Lab Profile</span>
                    <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wide">
                      {level === 'basic' ? '🌱 Basic Explorer' : level === 'intermediate' ? '⚡ Intermediate Solver' : '🔥 Advanced Pro'}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-sans leading-none mt-0.5">
                      Interest: {interest === 'freelancing' ? 'Freelancing' : interest === 'career' ? 'Career' : interest === 'daily' ? 'Social Fluency' : 'Travel'}
                    </p>
                  </div>
                  <button 
                    onClick={handleResetProgress}
                    className="text-[9px] uppercase font-mono font-bold text-zinc-650 hover:text-red-400 cursor-pointer p-1.5 border border-zinc-900 hover:border-zinc-800 rounded-xl"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Heart Refill Widget */}
              <div className="bg-[#09090b] border border-zinc-900 p-4.5 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block font-bold">LIVES / HEARTS</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-rose-500">{hearts} / 5</span>
                    <Heart className="w-4 h-4 fill-current text-rose-500" />
                  </div>
                </div>
                {hearts < 5 && (
                  <button
                    onClick={handleRefillHearts}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Gem className="w-3.5 h-3.5 fill-current" />
                    <span>Refill (-50 💎)</span>
                  </button>
                )}
              </div>

            </div>

            {/* SOPHIA VOICE ASSISTANT ADVICE BLOCK */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-zinc-950/80 to-[#030303] border border-emerald-500/20 flex gap-4.5 items-start relative overflow-hidden">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
                👩‍🏫
              </div>
              <div className="space-y-1.5 text-left relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">SOPHIA SMART ADVISER (সোফিয়া)</span>
                  <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold font-mono">AI Partner</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  "ইংরেজি শেখার মূল চাবিকাঠি হলো প্রতিদিন নিয়মিত ছোট ছোট ধাপে অনুশীলন করা! নিচে আপনার জন্য ডুলিংগো-স্টাইল লেভেল গাছ সাজানো হয়েছে। প্রতিটি নোড সম্পূর্ণ করে আপনার কাঙ্ক্ষিত গন্তব্যে পৌঁছান!"
                </p>
              </div>
            </div>

            {/* CURRENT UNIT BANNER */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-zinc-950 shadow-xl relative overflow-hidden">
              <div className="absolute right-4 bottom-[-20px] opacity-15">
                <GraduationCap className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10 space-y-1 text-left">
                <span className="text-[9px] uppercase font-mono font-extrabold tracking-widest text-emerald-950 bg-emerald-400/20 px-2.5 py-1 rounded-full">সেকশন ১ • ইউনিট ১</span>
                <h3 className="text-lg font-black text-white">স্মার্ট প্রফেশনাল কমিউনিকেশন</h3>
                <p className="text-xs text-emerald-100 font-medium">ইংরেজি সম্ভাষণ, বাজেট দরদাম ও প্রফেশনাল চ্যাট দক্ষতা বৃদ্ধি করুন</p>
              </div>
            </div>

            {/* AI CUSTOM LESSON GENERATOR WIDGET */}
            <div className="bg-[#09090b] border border-zinc-900 rounded-3xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">এআই ডুলিংগো কাস্টম লেভেল</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Dynamic AI Level Generator</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGenerateForm(!showGenerateForm)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
                >
                  {showGenerateForm ? 'ফোল্ড করুন (Hide)' : 'লেভেল তৈরি করুন (Create)'}
                </button>
              </div>

              {showGenerateForm && (
                <form onSubmit={handleGenerateCustomLesson} className="space-y-4 pt-2 border-t border-zinc-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">লেভেলের বিষয়বস্তু (Topic Name)</label>
                      <input
                        type="text"
                        placeholder="যেমন: Freelance Proposal, Restaurant order, Interview"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">কঠিনতার মাত্রা (Difficulty)</label>
                      <select
                        value={customDifficulty}
                        onChange={(e: any) => setCustomDifficulty(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="basic">সহজ (Basic)</option>
                        <option value="intermediate">মাঝারি (Intermediate)</option>
                        <option value="advanced">কঠিন (Advanced)</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={generatingLesson}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {generatingLesson ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>সোফিয়া লেভেল তৈরি করছে... (Generating...)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-zinc-950 fill-current" />
                        <span>লেভেল যোগ করুন (Generate AI Level Node)</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* THE DUOLINGO MILESTONE PATH TREE */}
            <div className="relative py-12 bg-zinc-950/20 border border-zinc-900 rounded-3xl p-6 flex flex-col items-center overflow-hidden">
              
              {/* Path connector line */}
              <div className="absolute top-16 bottom-16 w-1.5 bg-zinc-900 rounded-full left-1/2 -translate-x-1/2 z-0" />

              {/* MASCOT GRAPHIC FLOATING ASIDE */}
              <div className="absolute top-36 left-8 hidden lg:flex flex-col items-center gap-2 p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl max-w-[200px] animate-bounce">
                <div className="text-4xl">🦉</div>
                <div className="text-[10px] text-zinc-300 text-center leading-normal">
                  "দারুণ এগোচ্ছেন! ভুল হলেও সমস্যা নেই, আমি সাথে আছি!"
                </div>
              </div>

              {/* THE PROGRESS TREE PATH */}
              <div className="relative z-10 w-full flex flex-col items-center gap-8">
                {lessons.map((les, index) => {
                  // Stagger left, center, right, center, etc.
                  let staggerClass = 'self-center';
                  if (index % 4 === 1) staggerClass = 'md:translate-x-[-80px] self-center';
                  if (index % 4 === 3) staggerClass = 'md:translate-x-[80px] self-center';

                  const isCurrentUnlocked = les.unlocked;
                  const isCurrentCompleted = les.completed;

                  return (
                    <div key={les.id} className={`flex flex-col items-center relative ${staggerClass}`}>
                      
                      {/* Circle Milestone Button */}
                      <button
                        onClick={() => setSelectedMilestone(les)}
                        className={`w-20 h-20 rounded-full flex flex-col items-center justify-center relative cursor-pointer group select-none transition-transform duration-300 active:scale-90 ${
                          isCurrentCompleted 
                            ? 'bg-emerald-500 text-zinc-950 ring-4 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                            : isCurrentUnlocked 
                            ? 'bg-orange-500 text-white ring-4 ring-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                            : 'bg-zinc-900 text-zinc-650 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {/* Icon based on lesson type */}
                        {les.iconType === 'star' && <Star className="w-8 h-8 fill-current" />}
                        {les.iconType === 'book' && <BookOpen className="w-8 h-8" />}
                        {les.iconType === 'headphones' && <Volume2 className="w-8 h-8" />}
                        {les.iconType === 'game' && <Gamepad2 className="w-8 h-8" />}

                        {/* Complete Crown overlay */}
                        {isCurrentCompleted && (
                          <div className="absolute top-[-8px] right-[-4px] bg-yellow-400 text-zinc-950 p-1 rounded-full text-[8px] font-black border border-zinc-950 shadow-md">
                            👑
                          </div>
                        )}

                        {/* Lesson Indicator Star Ring */}
                        {isCurrentUnlocked && !isCurrentCompleted && (
                          <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/40 animate-spin" style={{ animationDuration: '8s' }} />
                        )}
                      </button>

                      {/* Small Info Label */}
                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-bold text-zinc-300 block">{les.title}</span>
                        <span className="text-[9px] text-zinc-550 block font-sans">{les.bengaliTitle}</span>
                      </div>

                      {/* POPUP CARD FOR SELECTED MILESTONE */}
                      <AnimatePresence>
                        {selectedMilestone?.id === les.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-24 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl w-64 text-left shadow-2xl z-50 space-y-4"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] uppercase font-mono font-bold tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                                Category: {les.category}
                              </span>
                              <button onClick={() => setSelectedMilestone(null)} className="text-zinc-600 hover:text-zinc-300">
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-white uppercase">{les.title}</h4>
                              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{les.bengaliTitle}</p>
                              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 pt-1 font-mono uppercase">
                                <span>Diff: {les.difficulty}</span>
                                <span>•</span>
                                <span>+{les.xp} XP reward</span>
                              </div>
                            </div>

                            {isCurrentUnlocked ? (
                              <button
                                onClick={() => handleStartLesson(les)}
                                className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg hover:shadow-orange-500/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>শুরু করুন (Start)</span>
                              </button>
                            ) : (
                              <div className="text-center p-2 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] text-zinc-650 font-bold uppercase font-mono">
                                🔒 Locked - Complete Previous Level First
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })}
              </div>

            </div>

          </motion.div>
        )}

        {/* STEP 4: INTERACTIVE LEVEL GAMEPLAY (PRACTICAL MODE) */}
        {entryPath === 'practical' && step === 'lesson' && activeLesson && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-lg mx-auto w-full my-auto py-6 text-left"
          >
            {/* GAMEPLAY HEADER & STEPS PROGRESS BAR */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <button 
                  onClick={() => {
                    if (window.confirm("আপনি কি নিশ্চিত গেম ছেড়ে ড্যাশবোর্ডে ফিরে যেতে চান?")) {
                      setStep('dashboard');
                      setActiveLesson(null);
                    }
                  }} 
                  className="text-zinc-450 hover:text-white uppercase font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  ← Exit Lesson
                </button>
                <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span className="font-mono text-xs">{hearts} / 5</span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-550">
                  <span>CHALLENGE PROGRESS</span>
                  <span>STEP {currentStepIndex + 1} OF {activeLesson.steps.length}</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / activeLesson.steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* MAIN INTERACTIVE CARD */}
            <div className="bg-[#09090b] border border-zinc-850 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              
              {/* Challenge Heading */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {activeLesson.steps[currentStepIndex].type.toUpperCase()} CHALLENGE
                </span>
                <h3 className="text-base font-extrabold text-zinc-100 leading-snug">
                  {activeLesson.steps[currentStepIndex].question}
                </h3>
                <p className="text-xs text-zinc-500 font-sans">
                  {activeLesson.steps[currentStepIndex].banglaQuestion}
                </p>
              </div>

              {/* GAMEPLAY 1: VOCABULARY MCQ & GRAMMAR MCQ */}
              {(activeLesson.steps[currentStepIndex].type === 'vocabulary' || activeLesson.steps[currentStepIndex].type === 'grammar-mcq') && (
                <div className="space-y-2.5">
                  {activeLesson.steps[currentStepIndex].options?.map((opt, optIdx) => {
                    const isSelected = mcqSelected === optIdx;
                    return (
                      <button
                        key={optIdx}
                        disabled={isChecked}
                        onClick={() => setMcqSelected(optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'bg-zinc-950 border-zinc-900 text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900/30'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* GAMEPLAY 2: WORD TAP (SENTENCE ARRANGEMENT) */}
              {activeLesson.steps[currentStepIndex].type === 'word-tap' && (
                <div className="space-y-5">
                  {/* Selected block */}
                  <div className="min-h-[70px] p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-wrap gap-2 items-center justify-center">
                    {wordTapSelected.length === 0 ? (
                      <span className="text-xs text-zinc-750 font-sans italic">Arrange words here by tapping them below...</span>
                    ) : (
                      wordTapSelected.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRemoveWord(word)}
                          disabled={isChecked}
                          className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl cursor-pointer transition-all duration-200"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Jumbled pool */}
                  <div className="flex flex-wrap gap-2 items-center justify-center pt-2">
                    {wordTapJumbled.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTapWord(word)}
                        disabled={isChecked}
                        className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 duration-200"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* GAMEPLAY 3: DIALOG PRACTICE CHAT */}
              {activeLesson.steps[currentStepIndex].type === 'chat-dialog' && (
                <div className="space-y-4">
                  
                  {/* Dialogue thread */}
                  <div className="max-h-[220px] overflow-y-auto p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4 flex flex-col justify-end">
                    {dialogMessages.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'ai' ? 'self-start' : 'self-end'}`}
                      >
                        <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                          msg.sender === 'ai' 
                            ? 'bg-zinc-900 text-zinc-150 rounded-tl-none border border-zinc-850' 
                            : 'bg-emerald-500 text-zinc-950 font-bold rounded-tr-none'
                        }`}>
                          {msg.text}
                        </div>
                        {msg.translation && (
                          <span className="text-[9px] text-zinc-550 px-1 font-sans italic leading-none">
                            {msg.translation}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Input field */}
                  {!isChecked && (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={dialogInput}
                        onChange={(e) => setDialogInput(e.target.value)}
                        placeholder="ইংরেজিতে টাইপ করুন বা উত্তর দিন..."
                        className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/40"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCheckAnswer();
                        }}
                      />
                      <button
                        onClick={handleCheckAnswer}
                        disabled={!dialogInput.trim()}
                        className="px-5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-20 text-zinc-950 text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ACTION BAR CHECK BUTTON */}
              {!isChecked && activeLesson.steps[currentStepIndex].type !== 'chat-dialog' && (
                <button
                  onClick={handleCheckAnswer}
                  disabled={
                    (activeLesson.steps[currentStepIndex].type === 'vocabulary' || activeLesson.steps[currentStepIndex].type === 'grammar-mcq')
                      ? mcqSelected === null 
                      : wordTapSelected.length === 0
                  }
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Check Answer / উত্তর দিন
                </button>
              )}

              {/* EVALUATION RESULTS PANEL PANEL */}
              <AnimatePresence>
                {isChecked && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border text-left space-y-3 pt-4 ${
                      isCorrect 
                        ? 'bg-[#040c06] border-emerald-500/35 text-emerald-400' 
                        : 'bg-[#140606] border-red-500/35 text-rose-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">{isCorrect ? '👑 CORRECT!' : '❌ INCORRECT'}</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-zinc-900/60 px-2 py-0.5 rounded text-zinc-350">
                        {isCorrect ? 'Gained +5 💎' : 'Lost 1 Life ❤️'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {feedbackMsg}
                    </p>

                    <button
                      onClick={handleNextStep}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-center active:scale-95 transition-all"
                    >
                      {currentStepIndex < activeLesson.steps.length - 1 ? 'Next Challenge / পরবর্তী টাস্ক' : 'Complete Lesson / লেভেল সম্পন্ন করুন 🎉'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
