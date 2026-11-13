import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, Youtube, Compass, Coins, Briefcase, Sparkles,
  Plus, Play, Trash2, CheckCircle2, ChevronRight, ArrowLeft,
  Target, Clock, AlertTriangle, ExternalLink, Search, BookOpen,
  Layers, Check, RefreshCw, Share2, ShieldCheck, TrendingUp, DollarSign, Wrench, Zap,
  SlidersHorizontal, Link2, MoreVertical, X, Bookmark, Heart, Sprout
} from 'lucide-react';
import { triggerNotification } from '../utils';
import { acquireBgMusicPauseLock, releaseBgMusicPauseLock } from '../utils/remixAudioEngine';

export type CareerHubTab = 'learn' | 'career' | 'earn_business' | 'agri_busi' | 'ai_planner';

export interface CuratedLearnVideo {
  id: string;
  videoId: string;
  title: string;
  author: string;
  views: string;
  published: string;
  duration: string;
  thumbnail: string;
  url: string;
  tags: string[];
  category: 'Make Money' | 'Freelancing' | 'Skills' | 'Business' | 'Career' | 'Global';
  completed?: boolean;
}

interface CareerQuestion {
  id: number;
  question: string;
  options: {
    label: string;
    tags: string[];
  }[];
}

export interface CareerRecommendation {
  id: string;
  title: string;
  category: 'Freelancing & Remote' | 'Tech & Digital' | 'Underrated & High-Demand' | 'Creative & Media' | 'Local & Service';
  isUnderrated?: boolean;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeToFirstSkill: string;
  whyItFits: string;
  whatToLearn: string[];
  whatToDoToday: string[];
  roadmapSteps: {
    phase: string;
    title: string;
    tasks: string[];
  }[];
}

interface EarnOpportunity {
  id: string;
  title: string;
  category: 'Small Jobs' | 'Online Work' | 'Freelancing' | 'Local Opportunities';
  difficulty: 'Easy Start' | 'Moderate' | 'Skill Based';
  startupCost: string;
  realisticTimeline: string;
  overview: string;
  howToStartToday: string[];
  whereToFindWork: string[];
  practicalTips: string[];
}

interface BusinessIdeaItem {
  id: string;
  title: string;
  category: 'Low-Cost Local' | 'Digital & Service' | 'E-Commerce & Retail' | 'Food & Daily Needs';
  startupCostRange: string;
  monthlyExpenses: string;
  profitMarginNote: string;
  overview: string;
  requiredResources: string[];
  risksAndSolutions: string[];
  stepByStepLaunch: string[];
}

interface GeneratedAiPlan {
  id: string;
  ideaInput: string;
  createdAt: string;
  title: string;
  summary: string;
  requiredSkills: string[];
  startupCostsAndResources: {
    estimatedCost: string;
    toolsAndResources: string[];
  };
  learningMaterials: string[];
  potentialIncome: {
    beginnerRange: string;
    experiencedRange: string;
    monetizationModel: string;
  };
  risksAndChallenges: string[];
  actionPlan: {
    dailySteps: string[];
    weeklySteps: string[];
    monthlyRoadmap: string[];
  };
}

// ============================================================================
// CURATED DEFAULT YOUTUBE VIDEOS (Authentic YouTube Titles, Channels & Real Thumbnails)
// ============================================================================
const DEFAULT_CURATED_VIDEOS: CuratedLearnVideo[] = [
  {
    id: 'curated_1',
    videoId: 'rfscVS0vtbw',
    title: 'Learn Python - Full Course for Beginners [Tutorial]',
    author: 'freeCodeCamp.org',
    views: '45M views',
    published: 'Popular',
    duration: '4:26:52',
    thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    tags: ['Skills', 'Coding', 'Career'],
    category: 'Skills'
  },
  {
    id: 'curated_2',
    videoId: 'Nu4bf5P9Gm0',
    title: '7 Skills That Will Make You Rich',
    author: 'Ali Abdaal',
    views: '2.1M views',
    published: 'Featured',
    duration: '18:24',
    thumbnail: 'https://i.ytimg.com/vi/Nu4bf5P9Gm0/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=Nu4bf5P9Gm0',
    tags: ['Make Money', 'Freelancing', 'Skills'],
    category: 'Make Money'
  },
  {
    id: 'curated_3',
    videoId: 'G3e-cpL7ofc',
    title: 'HTML & CSS Full Course - Beginner to Pro',
    author: 'SuperSimpleDev',
    views: '12M views',
    published: 'Popular',
    duration: '6:31:24',
    thumbnail: 'https://i.ytimg.com/vi/G3e-cpL7ofc/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
    tags: ['Freelancing', 'Web Dev', 'Skills'],
    category: 'Freelancing'
  },
  {
    id: 'curated_4',
    videoId: 'W6NZfCO5SIk',
    title: 'JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour',
    author: 'Programming with Mosh',
    views: '14M views',
    published: 'Popular',
    duration: '48:17',
    thumbnail: 'https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    tags: ['Career', 'Skills', 'Tech'],
    category: 'Career'
  },
  {
    id: 'curated_5',
    videoId: 'bMknfKXIFA8',
    title: 'React Course - Beginner\'s Tutorial for React JavaScript Library',
    author: 'freeCodeCamp.org',
    views: '4.2M views',
    published: 'Featured',
    duration: '11:55:27',
    thumbnail: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    tags: ['Skills', 'Remote Job', 'Career'],
    category: 'Career'
  },
  {
    id: 'curated_6',
    videoId: '8jLOx1hD3_o',
    title: 'C++ Programming Course - Beginner to Advanced',
    author: 'freeCodeCamp.org',
    views: '7.8M views',
    published: 'Popular',
    duration: '31:07:30',
    thumbnail: 'https://i.ytimg.com/vi/8jLOx1hD3_o/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=8jLOx1hD3_o',
    tags: ['Skills', 'Software', 'Global'],
    category: 'Global'
  }
];

// ============================================================================
// 20 EASY BANGLA + ENGLISH MIXED CAREER QUESTIONS
// ============================================================================
const TWENTY_CAREER_QUESTIONS: CareerQuestion[] = [
  {
    id: 1,
    question: "প্রতিদিন নতুন Skill শেখার জন্য আপনি কতটুকু সময় দিতে পারবেন?",
    options: [
      { label: "১–২ ঘণ্টা (পড়াশোনা বা কাজের পাশাপাশি)", tags: ["flexible", "micro", "creative"] },
      { label: "৩–৪ ঘণ্টা (নিয়মিত সিরিয়াস প্র্যাকটিস)", tags: ["freelance", "digital", "marketing"] },
      { label: "৫+ ঘণ্টা (Full-Time ফোকাস)", tags: ["tech", "agency", "deep_skill"] }
    ]
  },
  {
    id: 2,
    question: "কাজ করার জন্য এই মুহূর্তে আপনার কাছে কোন Device আছে?",
    options: [
      { label: "শুধু Smartphone (মোবাইল ফোন)", tags: ["mobile", "social", "local", "content"] },
      { label: "সাধারণ Laptop বা Desktop PC", tags: ["freelance", "writing", "design", "admin", "marketing"] },
      { label: "ভালো মানের PC বা MacBook", tags: ["video", "tech", "3d", "ai", "dev"] }
    ]
  },
  {
    id: 3,
    question: "কোন ধরনের কাজ করতে আপনার সবচেয়ে বেশি ভালো লাগে?",
    options: [
      { label: "Design, Video Editing এবং Creative কাজ", tags: ["creative", "video", "design", "content"] },
      { label: "Coding, AI Tools, Website ও Tech কাজ", tags: ["tech", "ai", "dev", "data"] },
      { label: "Business, Marketing, Sales ও পেজ ম্যানেজমেন্ট", tags: ["marketing", "sales", "local", "management"] }
    ]
  },
  {
    id: 4,
    question: "আপনি কি একা নিরিবিলি কাজ করতে পছন্দ করেন নাকি মানুষের সাথে কথা বলতে?",
    options: [
      { label: "নিজের মতো একা বসে কাজ করতে পছন্দ করি", tags: ["tech", "writing", "video", "data"] },
      { label: "Client ও মানুষের সাথে কথা বলতে ভালো লাগে", tags: ["sales", "marketing", "local", "consulting"] },
      { label: "দুইভাবেই কাজ করতে পারি", tags: ["freelance", "creative", "agency"] }
    ]
  },
  {
    id: 5,
    question: "English-এ কথা বলা বা চ্যাট করার ক্ষেত্রে আপনি কতটা সহজ?",
    options: [
      { label: "Basic (শুরুতে দেশের ভেতরে কাজ করতে চাই)", tags: ["local", "mobile"] },
      { label: "Medium (বিদেশি Client-দের সাথে Chat ও Email করতে পারি)", tags: ["freelance", "design", "video", "marketing"] },
      { label: "Fluent (সরাসরি মিটিং বা কথা বলতে পারি)", tags: ["sales", "consulting", "agency", "tech"] }
    ]
  },
  {
    id: 6,
    question: "কত দিনের মধ্যে আপনি প্রথম Income শুরু করতে চান?",
    options: [
      { label: "১–২ মাসের মধ্যে (সহজ ও দ্রুত শুরু করা যায় এমন কাজ)", tags: ["quick_start", "local", "micro", "social"] },
      { label: "৩–৬ মাসের মধ্যে (ভালো একটি Freelancing Skill শিখে)", tags: ["freelance", "video", "design", "marketing"] },
      { label: "৬–১২ মাস (বড় ও স্থায়ী ক্যারিয়ার গড়ার জন্য)", tags: ["tech", "dev", "ai", "agency"] }
    ]
  },
  {
    id: 7,
    question: "ক্যামেরার সামনে এসে কথা বলতে আপনার কেমন লাগে?",
    options: [
      { label: "ক্যামেরার পেছনে কাজ করতে চাই (Faceless)", tags: ["video", "design", "tech", "writing", "data"] },
      { label: "শুধু নিজের Voice দিতে পারি, মুখ দেখাতে চাই না", tags: ["content", "social", "video"] },
      { label: "ক্যামেরার সামনে কথা বলতে কোনো সমস্যা নেই", tags: ["content", "sales", "teaching", "marketing"] }
    ]
  },
  {
    id: 8,
    question: "নতুন AI এবং Software টুলস শেখার ব্যাপারে আপনার আগ্রহ কেমন?",
    options: [
      { label: "নতুন AI ও Tech টুলস শিখতে খুব ভালো লাগে", tags: ["ai", "tech", "automation", "video"] },
      { label: "১–২টি সহজ সফটওয়্যার ভালোভাবে শিখে কাজ করতে চাই", tags: ["design", "social", "freelance"] },
      { label: "সফটওয়্যারের চেয়ে বাস্তব ব্যবসা বা লোকাল কাজ বেশি পছন্দ", tags: ["local", "sales", "management"] }
    ]
  },
  {
    id: 9,
    question: "লেখালেখি বা সুন্দর করে আইডিয়া সাজাতে আপনার কেমন লাগে?",
    options: [
      { label: "হ্যাঁ, Script বা কন্টেন্ট লিখতে ভালো লাগে", tags: ["writing", "content", "marketing"] },
      { label: "লেখার চেয়ে Video ও Design বেশি ভালো লাগে", tags: ["design", "video", "creative"] },
      { label: "হিসাব-নিকাশ, Data ও প্ল্যানিং বেশি ভালো লাগে", tags: ["data", "tech", "finance"] }
    ]
  },
  {
    id: 10,
    question: "শুরু করার জন্য আপনার কাছে বাজেট কেমন আছে?",
    options: [
      { label: "৳০ বাজেট (শুধু ফ্রি টুলস ও নিজের Skill দিয়ে শুরু)", tags: ["zero_cost", "freelance", "writing", "social"] },
      { label: "অল্প বাজেট (৳১,০০০ – ৳৫,০০০ প্রয়োজনীয় কাজের জন্য)", tags: ["digital", "marketing", "local"] },
      { label: "মাঝারি বাজেট (৳৫,০০০+ ছোট ব্যবসা বা সেটআপের জন্য)", tags: ["agency", "local", "ecommerce"] }
    ]
  },
  {
    id: 11,
    question: "কোন কাজটি দীর্ঘসময় করলেও আপনার বিরক্ত লাগে না?",
    options: [
      { label: "Video কাটাকাটি, মিউজিক ও সুন্দর ভিজ্যুয়াল বানানো", tags: ["video", "creative", "content"] },
      { label: "Website, App বা AI দিয়ে অটোমেশন তৈরি করা", tags: ["tech", "dev", "ai", "automation"] },
      { label: "পেজ গ্রো করা, Ads চালানো ও প্রোডাক্ট বিক্রি করা", tags: ["marketing", "sales", "social", "ecommerce"] }
    ]
  },
  {
    id: 12,
    question: "অন্যকে কোনো বিষয় সহজ করে বোঝাতে বা শেখাতে কি আপনার ভালো লাগে?",
    options: [
      { label: "হ্যাঁ, আমি যেকোনো বিষয় সহজে বুঝিয়ে বলতে পারি", tags: ["teaching", "consulting", "content", "local"] },
      { label: "না, আমি নিজে প্রজেক্টের কাজ করতে বেশি পছন্দ করি", tags: ["freelance", "tech", "design", "video"] }
    ]
  },
  {
    id: 13,
    question: "YouTube বা Facebook চালানোর সময় কোন জিনিসটি আপনার চোখে বেশি পড়ে?",
    options: [
      { label: "ভিডিওর Editing, শুরুর Hook এবং কীভাবে ভাইরাল হলো", tags: ["social", "video", "marketing", "content"] },
      { label: "বিজ্ঞাপন (Ads) এবং মানুষ কীভাবে অনলাইনে জিনিস কিনছে", tags: ["ecommerce", "marketing", "sales"] },
      { label: "নতুন কোনো App, ওয়েবসাইট বা কাজের টিউটোরিয়াল", tags: ["tech", "deep_skill", "data"] }
    ]
  },
  {
    id: 14,
    question: "আপনি কোন উপায়ে টাকা আয় করতে বেশি আগ্রহী?",
    options: [
      { label: "প্রজেক্ট হিসেবে স্বাধীনভাবে Freelancing করে", tags: ["freelance", "video", "design", "writing"] },
      { label: "কয়েকজন ফিক্সড Client-এর সাথে মাসিক চুক্তিতে কাজ করে", tags: ["social", "marketing", "automation", "data"] },
      { label: "নিজের প্রোডাক্ট বা সার্ভিস এজেন্সি তৈরি করে", tags: ["ecommerce", "local", "content", "agency"] }
    ]
  },
  {
    id: 15,
    question: "রঙ (Color), ফন্ট এবং সুন্দর ডিজাইন সাজানোর ধারণা কি আপনার ভালো?",
    options: [
      { label: "হ্যাঁ, Thumbnail, পোস্টার ও সুন্দর ডিজাইন আমার খুব ভালো লাগে", tags: ["design", "creative", "uiux"] },
      { label: "ডিজাইনের চেয়ে প্ল্যানিং ও টেকনিক্যাল কাজে আমি বেশি ভালো", tags: ["marketing", "tech", "data", "writing"] }
    ]
  },
  {
    id: 16,
    question: "আপনি কি আপনার এলাকার দোকান, রেস্তোরাঁ বা প্রতিষ্ঠানের সাথে কাজ করতে আগ্রহী?",
    options: [
      { label: "হ্যাঁ, এলাকার ব্যবসার জন্য ডিজিটাল সার্ভিস দিতে পারি", tags: ["local", "sales", "marketing", "agency"] },
      { label: "না, আমি ১০০% ঘরে বসে Online-এ কাজ করতে চাই", tags: ["freelance", "remote", "tech", "video", "design"] }
    ]
  },
  {
    id: 17,
    question: "ইন্টারনেট থেকে তথ্য খুঁজে বের করা ও Google Sheets সাজানোর কাজে আপনি কেমন?",
    options: [
      { label: "খুব গুছিয়ে তথ্য ও Data লিস্ট তৈরি করতে পারি", tags: ["data", "admin", "research", "writing"] },
      { label: "ডেটা এন্ট্রির চেয়ে Creative বা Tech কাজ বেশি পছন্দ", tags: ["creative", "video", "tech", "design"] }
    ]
  },
  {
    id: 18,
    question: "আপনি কি কম প্রতিযোগিতার (Underrated) কাজ পছন্দ করেন নাকি জনপ্রিয় কাজ?",
    options: [
      { label: "যেসব কাজে ভিড় কম কিন্তু চাহিদা বেশি (Underrated Skills)", tags: ["underrated", "automation", "ai", "specialized"] },
      { label: "সবচেয়ে জনপ্রিয় ও বড় মার্কেটের কাজ (Video, Design, Web)", tags: ["video", "design", "marketing", "dev"] }
    ]
  },
  {
    id: 19,
    question: "প্রথম কাজ পাওয়ার জন্য আপনি কীভাবে চেষ্টা করতে রাজি আছেন?",
    options: [
      { label: "প্রতিদিন ক্লায়েন্টদের নিজের তৈরি Sample কাজ পাঠিয়ে", tags: ["freelance", "agency", "sales", "deep_skill"] },
      { label: "ছোট ও সহজ কাজ দিয়ে শুরু করে ধীরে ধীরে বড় কাজ নেওয়া", tags: ["quick_start", "local", "micro"] }
    ]
  },
  {
    id: 20,
    question: "আগামী ১ বছরের মধ্যে আপনি নিজেকে কোথায় দেখতে চান?",
    options: [
      { label: "একজন সফল Freelancer বা Remote প্রফেশনাল হিসেবে", tags: ["freelance", "remote", "video", "design", "tech"] },
      { label: "নিজের একটি লাভজনক Online বা Local বিজনেস গড়ে তুলতে", tags: ["agency", "marketing", "automation", "sales"] },
      { label: "পড়াশোনার পাশাপাশি নিজের খরচ ও ভালো Income করতে", tags: ["flexible", "local", "social", "content"] }
    ]
  }
];

// ============================================================================
// 22 CAREER RECOMMENDATIONS (Natural Bangla + Simple English Mix)
// ============================================================================
const TWENTY_TWO_CAREER_RECOMMENDATIONS: CareerRecommendation[] = [
  {
    id: "short_form_retention_editor",
    title: "Short Video Editor (Reels, Shorts & TikTok)",
    category: "Creative & Media",
    tags: ["video", "creative", "mobile", "freelance", "social", "quick_start"],
    difficulty: "Beginner",
    timeToFirstSkill: "3–4 Weeks",
    whyItFits: "বর্তমানে প্রতিটি Content Creator, কোচ এবং বিজনেসের প্রতিদিন Reels, Shorts ও TikTok ভিডিও লাগে। ভালো কাটাকাটি ও ক্যাপশন দিতে পারলে নিয়মিত কাজের অভাব হয় না।",
    whatToLearn: [
      "CapCut বা Premiere Pro দিয়ে দ্রুত ভিডিও কাটাকাটি ও জুম ইফেক্ট",
      "প্রথম ৩ সেকেন্ডে দর্শক ধরে রাখার মতো আকর্ষণীয় Hook তৈরি",
      "সুন্দর অটো ক্যাপশন, B-Roll ভিডিও এবং Sound Effects ব্যবহার"
    ],
    whatToDoToday: [
      "যেকোনো পডকাস্ট বা ক্রিয়েটরের ১টি সাধারণ ভিডিও ডাউনলোড করুন",
      "প্রথম ২০ সেকেন্ড দারুণ ক্যাপশন ও সাউন্ড দিয়ে নতুন করে Edit করুন",
      "নিজের Google Drive ফোল্ডারে Sample #1 হিসেবে সেভ করে রাখুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১–১০ দিন)",
        title: "বেসিক Editing ও Sound শেখা",
        tasks: [
          "ভিডিওর বাড়তি অংশ (Dead air) কাটা ও অডিও পরিষ্কার করা শিখুন",
          "৫টি ভাইরাল স্টাইলের ক্যাপশন ও ট্রানজিশন প্র্যাকটিস করুন"
        ]
      },
      {
        phase: "ধাপ ২ (১১–২০ দিন)",
        title: "৩টি দারুণ Sample তৈরি",
        tasks: [
          "Business, Tech এবং Lifestyle বিষয়ে ৩টি শর্ট ভিডিও Edit করুন",
          "সবগুলো ভিডিও একটি পরিষ্কার Google Drive লিংকে সাজিয়ে রাখুন"
        ]
      },
      {
        phase: "ধাপ ৩ (২১–৩০ দিন)",
        title: "Client খোঁজা ও মাসিক কাজ নেওয়া",
        tasks: [
          "প্রতিদিন ৫ জন ক্রিয়েটরকে তাদেরই একটি ভিডিও সুন্দর করে Edit করে ফ্রি Sample পাঠান",
          "মাসে ১৫–৩০টি ভিডিও এডিটের মাসিক প্যাকেজ অফার করুন"
        ]
      }
    ]
  },
  {
    id: "youtube_thumbnail_packaging",
    title: "YouTube Thumbnail Designer",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["design", "creative", "underrated", "freelance", "quick_start"],
    difficulty: "Beginner",
    timeToFirstSkill: "2–3 Weeks",
    whyItFits: "একটি ভিডিওতে ভিউ আসার পেছনে সবচেয়ে বড় ভূমিকা রাখে তার Thumbnail। সাধারণ গ্রাফিক ডিজাইনের চেয়ে ভালো Thumbnail ডিজাইনারের চাহিদা অনেক বেশি এবং প্রতিযোগিতা কম।",
    whatToLearn: [
      "Photoshop বা Canva দিয়ে ছবি কাটা, আলো (Lighting) ও কালার সুন্দর করা",
      "মাত্র ২–৩টি লেখায় মানুষের আগ্রহ তৈরি করার কৌশল",
      "মোবাইল স্ক্রিনে পরিষ্কার ও আকর্ষণীয় দেখায় এমন লেআউট বানানো"
    ],
    whatToDoToday: [
      "YouTube-এ ভালো কিন্তু দুর্বল Thumbnail ওয়ালা ৩টি ভিডিও খুঁজে বের করুন",
      "সেখান থেকে ১টি ভিডিওর জন্য নতুন ও আকর্ষণীয় একটি Thumbnail ডিজাইন করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "কালার, ফন্ট ও লাইটিং প্র্যাকটিস",
        tasks: [
          "জনপ্রিয় চ্যানেলগুলোর ২০টি ভাইরাল Thumbnail ভালো করে লক্ষ্য করুন",
          "ছবির ব্যাকগ্রাউন্ড পরিবর্তন ও মুখের এক্সপ্রেশন উজ্জ্বল করা শিখুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "১০টি Before / After ডিজাইন",
        tasks: [
          "পুরাতন Thumbnail বনাম আপনার নতুন ডিজাইন—এমন ১০টি কাজের Portfolio বানান"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "YouTuber-দের সাথে যোগাযোগ",
        tasks: [
          "মাঝারি চ্যানেলগুলোকে তাদের পরের ভিডিওর জন্য ১টি ফ্রি Sample পাঠিয়ে কাজ শুরু করুন"
        ]
      }
    ]
  },
  {
    id: "ai_automation_workflow_builder",
    title: "AI & No-Code Automation Specialist",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["ai", "automation", "tech", "underrated", "agency", "remote"],
    difficulty: "Intermediate",
    timeToFirstSkill: "4–6 Weeks",
    whyItFits: "কোডিং ছাড়াই বিভিন্ন কোম্পানির প্রতিদিনের কাজ (যেমন মেসেজ রিপ্লাই, কাস্টমার লিস্ট সেভ করা, ইমেইল পাঠানো) অটোমেটিক করে দেওয়ার প্রচুর চাহিদা রয়েছে।",
    whatToLearn: [
      "Make.com এবং Zapier ব্যবহার করে একটি অ্যাপের সাথে আরেকটি যুক্ত করা",
      "Google Sheets, WhatsApp, Email এবং ChatGPT একসাথে কানেক্ট করা",
      "কাস্টমারের মেসেজের অটোমেটিক উত্তর দেওয়ার সিস্টেম তৈরি করা"
    ],
    whatToDoToday: [
      "Make.com-এ একটি ফ্রি অ্যাকাউন্ট খুলুন",
      "Google Form পূরণ করলে অটোমেটিক Google Sheet-এ সেভ হওয়ার একটি ছোট সিস্টেম বানান"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম–২য় সপ্তাহ)",
        title: "Make.com ও Zapier শেখা",
        tasks: [
          "ইউটিউব দেখে ৫টি কাজের অটোমেশন ওয়ার্কফ্লো নিজে তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ২ (৩য় সপ্তাহ)",
        title: "৩টি ডেমো প্রজেক্ট ভিডিও",
        tasks: [
          "আপনার তৈরি অটোমেশন কীভাবে কাজ করে তার ২ মিনিটের স্ক্রিন রেকর্ড ভিডিও বানান"
        ]
      },
      {
        phase: "ধাপ ৩ (৪র্থ সপ্তাহ+)",
        title: "বিজনেস ক্লায়েন্টদের অফার করা",
        tasks: [
          "অনলাইন এজেন্সি ও ব্যবসাগুলোকে সময় বাঁচানোর এই সিস্টেম সেটআপের অফার দিন"
        ]
      }
    ]
  },
  {
    id: "local_business_gmb_seo",
    title: "Google Maps & Local Business Setup Expert",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["local", "marketing", "underrated", "quick_start", "sales", "zero_cost"],
    difficulty: "Beginner",
    timeToFirstSkill: "2 Weeks",
    whyItFits: "আপনার শহরের অনেক ক্লিনিক, রেস্তোরাঁ, জিম ও দোকানের Google Maps প্রোফাইল ঠিকভাবে সাজানো নেই। তাদের প্রোফাইল র‍্যাংক করিয়ে দিলে তারা সরাসরি নতুন কাস্টমার পায়।",
    whatToLearn: [
      "Google Business Profile সুন্দর করে খোলা ও সঠিক তথ্য দিয়ে সাজানো",
      "কাস্টমার রিভিউ বাড়ানো এবং দোকানের সুন্দর ছবি যুক্ত করা",
      "গুগল ম্যাপে সার্চ করলে প্রথম ৩টির মধ্যে আনার সহজ কৌশল"
    ],
    whatToDoToday: [
      "Google Maps-এ আপনার এলাকার ১০টি রেস্তোরাঁ বা ডেন্টাল ক্লিনিক সার্চ করুন",
      "কাদের ফোন নম্বর, ছবি বা ওয়েবসাইট নেই তার একটি ছোট লিস্ট করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১–৭ দিন)",
        title: "Google Maps র‍্যাংকিং নিয়ম শেখা",
        tasks: [
          "কীভাবে একটি ব্যবসার প্রোফাইল ১০০% সম্পূর্ণ করতে হয় তা শিখুন"
        ]
      },
      {
        phase: "ধাপ ২ (৮–১৫ দিন)",
        title: "২টি পরিচিত দোকানের কাজ করা",
        tasks: [
          "পাশের ২টি ব্যবসা প্রতিষ্ঠানের ম্যাপ প্রোফাইল সাজিয়ে কাজের প্রমাণ তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (১৬–৩০ দিন)",
        title: "লোকাল ক্লায়েন্ট নেওয়া",
        tasks: [
          "প্রতি সপ্তাহে ১০টি ব্যবসাকে তাদের ম্যাপ প্রোফাইল সেটআপ ও দেখাশোনার প্রস্তাব দিন"
        ]
      }
    ]
  },
  {
    id: "social_commerce_page_manager",
    title: "Facebook & Instagram Business Page Manager",
    category: "Local & Service",
    tags: ["social", "marketing", "ecommerce", "mobile", "quick_start"],
    difficulty: "Beginner",
    timeToFirstSkill: "2–3 Weeks",
    whyItFits: "হাজার হাজার অনলাইন পোশাক, গ্যাজেট ও খাবারের পেজে প্রতিদিন প্রচুর মেসেজ আসে। পেজ সাজানো, পোস্ট করা এবং ইনবক্সে অর্ডার নেওয়ার জন্য দক্ষ মানুষের প্রচুর চাহিদা।",
    whatToLearn: [
      "Canva ও CapCut দিয়ে প্রোডাক্টের পোস্টার এবং ছোট ভিডিও তৈরি",
      "Meta Business Suite ব্যবহার করে অটো রিপ্লাই ও দ্রুত কাস্টমার সার্ভিস",
      "Google Sheets-এ প্রতিদিনের অর্ডার ও ডেলিভারির হিসাব রাখা"
    ],
    whatToDoToday: [
      "৩টি জনপ্রিয় অনলাইন শপের ফেসবুক পেজ ঘুরে দেখুন তারা কীভাবে পোস্ট করে",
      "Canva দিয়ে যেকোনো একটি প্রোডাক্টের সুন্দর পোস্টার ও ক্যাপশন লিখে ফেলুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "পোস্ট ডিজাইন ও ইনবক্স ম্যানেজমেন্ট",
        tasks: [
          "কাস্টমারের সাথে কথা বলে অর্ডার কনফার্ম করার সুন্দর নিয়মগুলো শিখুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "ডেমো কাজের স্যাম্পল তৈরি",
        tasks: [
          "৫টি প্রোডাক্ট পোস্টার, ২টি রিলস এবং ১টি অর্ডার শিট তৈরি করে রাখুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "মাসিক বেতনে বা চুক্তিতে কাজ শুরু",
        tasks: [
          "ব্যস্ত অনলাইন শপগুলোতে মেসেজ দিয়ে পেজ ম্যানেজার বা মডারেটর হিসেবে কাজ শুরু করুন"
        ]
      }
    ]
  },
  {
    id: "ui_ux_product_designer",
    title: "Mobile App & Website UI/UX Designer (Figma)",
    category: "Creative & Media",
    tags: ["design", "uiux", "tech", "freelance", "remote", "deep_skill"],
    difficulty: "Intermediate",
    timeToFirstSkill: "6–8 Weeks",
    whyItFits: "যেকোনো অ্যাপ বা ওয়েবসাইট কোডিং করার আগে তার ডিজাইন Figma-তে তৈরি করতে হয়। দেশ-বিদেশের টেক কোম্পানি ও স্টার্টআপে UI/UX ডিজাইনারদের আয়ের সুযোগ অনেক বেশি।",
    whatToLearn: [
      "Figma সফটওয়্যারের সম্পূর্ণ ব্যবহার (Auto Layout, Components)",
      "মোবাইল অ্যাপ ও ওয়েবসাইটের ক্লিন এবং আধুনিক ডার্ক/লাইট ডিজাইন",
      "ব্যবহারকারীর জন্য সহজ ও সুন্দর স্ক্রিন ফ্লো তৈরি করা"
    ],
    whatToDoToday: [
      "Figma.com-এ একটি ফ্রি অ্যাকাউন্ট খুলুন",
      "আপনার প্রিয় যেকোনো অ্যাপের ১টি স্ক্রিন হুবহু দেখে ডিজাইন করার চেষ্টা করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম মাস)",
        title: "Figma ও ডিজাইনের নিয়ম শেখা",
        tasks: [
          "১৫টি সুন্দর অ্যাপ ও ওয়েবসাইটের স্ক্রিন প্র্যাকটিস হিসেবে তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় মাস)",
        title: "৩টি পূর্ণাঙ্গ প্রজেক্ট তৈরি",
        tasks: [
          "১টি মোবাইল অ্যাপ, ১টি ড্যাশবোর্ড এবং ১টি শপিং সাইটের ডিজাইন Behance-এ আপলোড করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য় মাস)",
        title: "Freelancing ও Remote Job আবেদন",
        tasks: [
          "আপনার পোর্টফোলিও দিয়ে Upwork, LinkedIn এবং বিভিন্ন স্টার্টআপে আবেদন করুন"
        ]
      }
    ]
  },
  {
    id: "conversion_landing_page_builder",
    title: "No-Code Website Designer (WordPress / Framer)",
    category: "Tech & Digital",
    tags: ["tech", "design", "freelance", "marketing", "agency"],
    difficulty: "Beginner",
    timeToFirstSkill: "4 Weeks",
    whyItFits: "কঠিন কোডিং না শিখেও এখন WordPress Elementor বা Framer দিয়ে খুব অল্প সময়ে আধুনিক ওয়েবসাইট বানিয়ে ব্যবসা ও ক্লায়েন্টদের ডেলিভারি দেওয়া যায়।",
    whatToLearn: [
      "Framer অথবা WordPress Elementor দিয়ে পুরো ওয়েবসাইট সাজানো",
      "মোবাইল ও কম্পিউটারে সুন্দর দেখায় এমন Responsive পেজ তৈরি",
      "কন্টাক্ট ফর্ম, বুকিং বাটন এবং দ্রুত লোড হওয়ার সেটিংস"
    ],
    whatToDoToday: [
      "Framer.com বা WordPress-এ ফ্রি অ্যাকাউন্ট খুলে টেমপ্লেটগুলো ঘুরে দেখুন",
      "একটি সার্ভিস ওয়েবসাইটের প্রধান ৫টি অংশ কী কী থাকে তা খাতায় নোট করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম–২য় সপ্তাহ)",
        title: "পেজ ডিজাইন প্র্যাকটিস",
        tasks: [
          "দেখে দেখে ৩টি পূর্ণাঙ্গ ওয়েবসাইট হোমপেজ তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ২ (৩য় সপ্তাহ)",
        title: "৩টি লাইভ ডেমো ওয়েবসাইট",
        tasks: [
          "রেস্তোরাঁ, এজেন্সি ও পোর্টফোলিওর জন্য ৩টি লাইভ ডেমো লিংক তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৪র্থ সপ্তাহ+)",
        title: "ক্লায়েন্টদের ওয়েবসাইট বানিয়ে দেওয়া",
        tasks: [
          "যাদের ওয়েবসাইট নেই বা পুরাতন, তাদের আপনার ডেমো দেখিয়ে প্রজেক্ট নিন"
        ]
      }
    ]
  },
  {
    id: "youtube_scriptwriter_storyteller",
    title: "YouTube Video Script Writer",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["writing", "content", "underrated", "remote", "zero_cost"],
    difficulty: "Beginner",
    timeToFirstSkill: "3 Weeks",
    whyItFits: "বড় বড় ইউটিউব চ্যানেলগুলোর প্রতি সপ্তাহে ২–৩টি সুন্দর স্ক্রিপ্ট প্রয়োজন হয়। শুধু মোবাইল বা সাধারণ ল্যাপটপে Google Docs ব্যবহার করেই এই কাজ করা সম্ভব।",
    whatToLearn: [
      "প্রথম ৩০ সেকেন্ডে দর্শকের কৌতূহল জাগানোর মতো শুরু (Hook) লেখা",
      "ইন্টারনেট থেকে তথ্য খুঁজে সহজ ও গল্পের মতো করে সাজিয়ে লেখা",
      "কোন লাইনে কী ছবি বা ভিডিও দেখানো হবে তার নির্দেশনা যুক্ত করা"
    ],
    whatToDoToday: [
      "আপনার পছন্দের ১০ মিনিটের একটি জনপ্রিয় ভিডিও শুরু থেকে শেষ কীভাবে সাজানো তা লিখুন",
      "যেকোনো একটি ইন্টারেস্টিং বিষয়ে ২০০ শব্দের একটি ছোট ভিডিও ইন্ট্রো লিখে ফেলুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "গল্প বলার কৌশল শেখা",
        tasks: [
          "১০টি সফল ভিডিওর স্ক্রিপ্ট পড়ে দেখুন কীভাবে তারা দর্শক ধরে রাখে"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "৩টি নমুনা Script তৈরি",
        tasks: [
          "Tech, Business এবং ক্যারিয়ার বিষয়ে ৩টি সম্পূর্ণ স্ক্রিপ্ট লিখে Google Docs-এ রাখুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "Content Creator-দের পাঠানো",
        tasks: [
          "ইউটিউবারদের ৩টি নতুন ভিডিও আইডিয়া ও ১টি ছোট স্ক্রিপ্ট স্যাম্পল পাঠিয়ে কাজ শুরু করুন"
        ]
      }
    ]
  },
  {
    id: "meta_ads_performance_marketer",
    title: "Facebook & TikTok Ads Expert",
    category: "Freelancing & Remote",
    tags: ["marketing", "sales", "ecommerce", "agency", "data"],
    difficulty: "Intermediate",
    timeToFirstSkill: "4–5 Weeks",
    whyItFits: "প্রতিটি অনলাইন এবং অফলাইন ব্যবসা তাদের বিক্রি বাড়ানোর জন্য বিজ্ঞাপন (Ads) চালায়। যারা সঠিক মানুষদের কাছে বিজ্ঞাপন পৌঁছে দিতে পারে, ব্যবসায়ীরা তাদের নিয়মিত হায়ার করে।",
    whatToLearn: [
      "Meta Ads Manager-এ সঠিক নিয়মে অ্যাড ক্যাম্পেইন ও অডিয়েন্স সেটআপ",
      "কম খরচে বেশি মেসেজ ও সেল আনার মতো বিজ্ঞাপন কপি এবং ভিডিও নির্বাচন",
      "Pixel সেটআপ ও বিজ্ঞাপনের ফলাফল (Report) বিশ্লেষণ করা"
    ],
    whatToDoToday: [
      "Facebook Ad Library-তে গিয়ে দেখুন দেশের জনপ্রিয় ব্র্যান্ডগুলো কী ধরনের বিজ্ঞাপন চালাচ্ছে"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম–২য় সপ্তাহ)",
        title: "Ads Manager-এর কাজ শেখা",
        tasks: [
          "টার্গেটিং, বাজেট সেটআপ এবং রিটার্গেটিং কীভাবে কাজ করে তা বিস্তারিত শিখুন"
        ]
      },
      {
        phase: "ধাপ ২ (৩য় সপ্তাহ)",
        title: "৩টি ব্যবসার জন্য Ads প্ল্যান তৈরি",
        tasks: [
          "৩টি ই-কমার্স পেজের জন্য একটি করে বিজ্ঞাপন প্ল্যান স্যাম্পল হিসেবে তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৪র্থ সপ্তাহ+)",
        title: "মাসিক চুক্তিতে ক্লায়েন্ট নেওয়া",
        tasks: [
          "অনলাইন শপ ও সার্ভিস পেজগুলোর বিজ্ঞাপন পরিচালনার দায়িত্ব নিন"
        ]
      }
    ]
  },
  {
    id: "podcast_video_repurposing_specialist",
    title: "Long Video to Shorts Clip Maker",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["video", "social", "underrated", "freelance", "remote"],
    difficulty: "Beginner",
    timeToFirstSkill: "2–3 Weeks",
    whyItFits: "অনেক স্পিকার ও ইউটিউবার ১ ঘণ্টার বড় ভিডিও বা পডকাস্ট করেন, কিন্তু সেখান থেকে সেরা অংশগুলো কেটে শর্টস বানানোর সময় পান না। এটি অত্যন্ত সহজ ও চাহিদাসম্পন্ন কাজ।",
    whatToLearn: [
      "১ ঘণ্টার ভিডিও থেকে সবচেয়ে গুরুত্বপূর্ণ ৪৫ সেকেন্ডের অংশগুলো খুঁজে বের করা",
      "লম্বা (9:16) সাইজে ফ্রেম ঠিক করে পরিষ্কার সাবটাইটেল বসানো",
      "YouTube Shorts, Reels ও TikTok-এ নিয়মিত আপলোড শিডিউল করা"
    ],
    whatToDoToday: [
      "ইউটিউব থেকে যেকোনো একটি বিজনেস পডকাস্টের সেরা ৪০ সেকেন্ড কেটে একটি শর্টস বানান"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "সেরা অংশ বাছাই ও ফ্রেমিং",
        tasks: [
          "১টি বড় ভিডিও থেকে ৫টি দারুণ শর্ট ক্লিপ আলাদা করার প্র্যাকটিস করুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "কাজের ফোল্ডার তৈরি",
        tasks: [
          "১০টি প্রস্তুত করা শর্ট ক্লিপ দিয়ে একটি সুন্দর স্যাম্পল ফোল্ডার সাজান"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "পডকাস্টার ও স্পিকারদের নক দেওয়া",
        tasks: [
          "যারা বড় ভিডিও বানান তাদের ২টি ফ্রি শর্টস ক্লিপ পাঠিয়ে মাসিক কাজের প্রস্তাব দিন"
        ]
      }
    ]
  },
  {
    id: "frontend_react_developer",
    title: "Modern Web Developer (React & Tailwind)",
    category: "Tech & Digital",
    tags: ["tech", "dev", "deep_skill", "remote", "freelance"],
    difficulty: "Advanced",
    timeToFirstSkill: "3–4 Months",
    whyItFits: "আপনি যদি দীর্ঘমেয়াদী ও উচ্চ আয়ের Tech ক্যারিয়ার গড়তে চান, তবে আধুনিক ওয়েব অ্যাপ্লিকেশন তৈরি শেখা অন্যতম সেরা পথ।",
    whatToLearn: [
      "HTML, CSS, Tailwind CSS এবং JavaScript ভালোভাবে শেখা",
      "React ও TypeScript ব্যবহার করে আধুনিক ওয়েব অ্যাপ তৈরি",
      "GitHub ও Vercel-এ নিজের তৈরি প্রজেক্ট লাইভ করা"
    ],
    whatToDoToday: [
      "HTML ও CSS দিয়ে নিজের নাম ও পরিচয়সহ ১ পেজের একটি সুন্দর পেজ তৈরি করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম মাস)",
        title: "HTML, Tailwind ও JavaScript",
        tasks: [
          "৫টি সুন্দর ও মোবাইল-বান্ধব ওয়েব পেজ নিজে কোড করে বানান"
        ]
      },
      {
        phase: "ধাপ ২ (২য় মাস)",
        title: "React দিয়ে অ্যাপ তৈরি",
        tasks: [
          "৩টি কাজের ওয়েব অ্যাপ তৈরি করে লাইভ লিংকে প্রকাশ করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ মাস)",
        title: "Portfolio ও চাকরিতে আবেদন",
        tasks: [
          "নিজের GitHub সাজিয়ে দেশি-বিদেশি রিমোট জব ও ফ্রিল্যান্সিং প্রজেক্টে আবেদন করুন"
        ]
      }
    ]
  },
  {
    id: "b2b_lead_gen_researcher",
    title: "Lead Generation & Data Research Specialist",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["data", "research", "sales", "underrated", "remote", "zero_cost"],
    difficulty: "Beginner",
    timeToFirstSkill: "2 Weeks",
    whyItFits: "বিদেশি মার্কেটিং এজেন্সিগুলোর প্রতি সপ্তাহে নতুন কোম্পানির ইমেইল, ওয়েবসাইট ও লিংকডইন তথ্যের লিস্ট প্রয়োজন হয়। কোনো জটিল স্কিল ছাড়াই এটি দ্রুত শুরু করা যায়।",
    whatToLearn: [
      "LinkedIn, Google ও ফ্রি টুল ব্যবহার করে কোম্পানির সঠিক ইমেইল খুঁজে বের করা",
      "Google Sheets-এ নাম, ওয়েবসাইট, ইমেইল ও ফোন নম্বর পরিষ্কারভাবে সাজানো",
      "ইমেইলগুলো সচল কি না তা ফ্রি ভেরিফিকেশন টুল দিয়ে চেক করা"
    ],
    whatToDoToday: [
      "Google Sheets-এ ২০টি রিয়েল এস্টেট বা আইটি কোম্পানির নাম, ওয়েবসাইট ও ইমেইলের একটি লিস্ট বানান"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "তথ্য খোঁজার টুলস শেখা",
        tasks: [
          "Apollo, LinkedIn এবং Google Search-এর সঠিক ব্যবহার শিখুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "৩টি নমুনা ডেটা শিট তৈরি",
        tasks: [
          "৩টি ভিন্ন ক্যাটাগরিতে ৫০টি করে মোট ১৫০টি ভেরিফাইড কোম্পানির লিস্ট তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "Upwork ও এজেন্সিতে কাজ নেওয়া",
        tasks: [
          "আপনার স্যাম্পল শিট দেখিয়ে Upwork, Fiverr বা সরাসরি এজেন্সির সাথে কাজ শুরু করুন"
        ]
      }
    ]
  },
  {
    id: "notion_workspace_architect",
    title: "Notion Template & Productivity Setup Creator",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["admin", "data", "tech", "underrated", "zero_cost", "remote"],
    difficulty: "Beginner",
    timeToFirstSkill: "2–3 Weeks",
    whyItFits: "ছাত্রছাত্রী, ক্রিয়েটর ও ছোট কোম্পানিগুলো তাদের প্রতিদিনের কাজ ও প্রজেক্ট গুছিয়ে রাখার জন্য রেডিমেড Notion ড্যাশবোর্ড কিনে থাকে।",
    whatToLearn: [
      "Notion-এ সুন্দর টেবিল, ক্যালেন্ডার ও প্রজেক্ট ট্র্যাকার তৈরি করা",
      "স্টুডেন্ট প্ল্যানার, কন্টেন্ট ক্যালেন্ডার ও বিজনেস ড্যাশবোর্ড সাজানো",
      "Gumroad-এ টেমপ্লেট বিক্রি বা ক্লায়েন্টদের জন্য কাস্টম সেটআপ করে দেওয়া"
    ],
    whatToDoToday: [
      "Notion-এ নিজের প্রতিদিনের রুটিন ও আয়ের হিসাব রাখার একটি সুন্দর পেজ তৈরি করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "Notion-এর সঠিক ব্যবহার শেখা",
        tasks: [
          "ডেটাবেজ ও সুন্দর ড্যাশবোর্ড লেআউট তৈরি করা আয়ত্ত করুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "৩টি কাজের টেমপ্লেট তৈরি",
        tasks: [
          "২টি ফ্রি এবং ১টি প্রিমিয়াম টেমপ্লেট তৈরি করে অনলাইনে শেয়ার করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "টেমপ্লেট বিক্রি ও কাস্টম কাজ",
        tasks: [
          "ক্রিয়েটর ও ছোট টিমগুলোর জন্য তাদের চাহিদামতো ড্যাশবোর্ড বানিয়ে দিন"
        ]
      }
    ]
  },
  {
    id: "canva_brand_kit_designer",
    title: "Social Media Post & Carousel Designer (Canva)",
    category: "Creative & Media",
    tags: ["design", "social", "mobile", "quick_start", "zero_cost"],
    difficulty: "Beginner",
    timeToFirstSkill: "2 Weeks",
    whyItFits: "অনেক ব্যবসা ও প্রফেশনাল মানুষ নিয়মিত Facebook, Instagram ও LinkedIn-এ সুন্দর পোস্ট দিতে চান কিন্তু ডিজাইন করার সময় পান না। মোবাইল বা পিসিতে Canva দিয়েই এটি করা যায়।",
    whatToLearn: [
      "Canva দিয়ে আকর্ষণীয় সোশ্যাল মিডিয়া পোস্টার ও ৫–৭ স্লাইডের Carousel ডিজাইন",
      "সুন্দর কালার ম্যাচিং এবং পরিষ্কার ফন্টের ব্যবহার",
      "ক্লায়েন্টদের জন্য রেডিমেড ব্র্যান্ড টেমপ্লেট তৈরি করা"
    ],
    whatToDoToday: [
      "Canva-তে যেকোনো একটি শিক্ষণীয় বিষয়ে ৫ স্লাইডের একটি সুন্দর পোস্ট ডিজাইন করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "লেআউট ও কালার প্র্যাকটিস",
        tasks: [
          "১০টি প্রফেশনাল পোস্টার এবং ৫টি স্লাইড পোস্ট ডিজাইন করুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "ডিজাইন পোর্টফোলিও সাজানো",
        tasks: [
          "আপনার সেরা ১৫টি ডিজাইন একটি পরিষ্কার ফোল্ডারে বা পেজে সাজিয়ে রাখুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "মাসিক ডিজাইন প্যাকেজ বিক্রি",
        tasks: [
          "অনলাইন পেজ ও কোচদের মাসে ১৫–২০টি পোস্ট ডিজাইনের প্যাকেজ অফার করুন"
        ]
      }
    ]
  },
  {
    id: "ecommerce_shopify_launch_specialist",
    title: "E-Commerce & Shopify Store Setup Expert",
    category: "Tech & Digital",
    tags: ["ecommerce", "tech", "design", "agency", "marketing"],
    difficulty: "Intermediate",
    timeToFirstSkill: "4 Weeks",
    whyItFits: "যারা শুধু ফেসবুক পেজে ব্যবসা করছেন, তারা সবাই একটি সুন্দর শপিং ওয়েবসাইট বানাতে চান। তাদের স্টোর সাজিয়ে দিয়ে ভালো আয় করা যায়।",
    whatToLearn: [
      "Shopify বা WooCommerce দিয়ে প্রোডাক্ট ক্যাটালগ ও থিম সাজানো",
      "অর্ডার ফর্ম, ডেলিভারি চার্জ ও পেমেন্ট অপশন যুক্ত করা",
      "মোবাইলে দ্রুত ও সহজে অর্ডার করার মতো পেজ তৈরি করা"
    ],
    whatToDoToday: [
      "Shopify Partners-এ ফ্রি অ্যাকাউন্ট খুলে ১টি ডেমো শপিং স্টোর তৈরি শুরু করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম–২য় সপ্তাহ)",
        title: "স্টোর ডিজাইন শেখা",
        tasks: [
          "পোশাক ও গ্যাজেট শপের জন্য ২টি পূর্ণাঙ্গ ডেমো ওয়েবসাইট বানান"
        ]
      },
      {
        phase: "ধাপ ২ (৩য় সপ্তাহ)",
        title: "চেকআউট ও অর্ডার সিস্টেম",
        tasks: [
          "কাস্টমার যেন সহজে অর্ডার করতে পারে সেই সেটিংসগুলো আয়ত্ত করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৪র্থ সপ্তাহ+)",
        title: "অনলাইন ব্র্যান্ডদের সাথে কাজ",
        tasks: [
          "জনপ্রিয় ফেসবুক শপগুলোকে তাদের নিজস্ব ওয়েবসাইট বানিয়ে দেওয়ার প্রস্তাব দিন"
        ]
      }
    ]
  },
  {
    id: "ai_product_photography_creator",
    title: "AI Product Photo & Ad Banner Creator",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["ai", "design", "creative", "underrated", "ecommerce", "quick_start"],
    difficulty: "Beginner",
    timeToFirstSkill: "2–3 Weeks",
    whyItFits: "ছোট অনলাইন ব্যবসায়ীদের দামি স্টুডিওতে প্রোডাক্টের ছবি তোলার বাজেট থাকে না। তাদের সাধারণ মোবাইলে তোলা ছবিকে AI ও এডিটিং দিয়ে প্রিমিয়াম বানিয়ে দেওয়ার দারুণ চাহিদা আছে।",
    whatToLearn: [
      "প্রোডাক্টের সাধারণ ব্যাকগ্রাউন্ড সরিয়ে স্টুডিও কোয়ালিটি ব্যাকগ্রাউন্ড বসানো",
      "Canva ও Photoshop দিয়ে সুন্দর আলো-ছায়া (Shadow) ও অফার টেক্সট যুক্ত করা",
      "বিজ্ঞাপনের জন্য আকর্ষণীয় প্রোডাক্ট ব্যানার তৈরি করা"
    ],
    whatToDoToday: [
      "ঘরে থাকা যেকোনো একটি পারফিউম, ঘড়ি বা পণ্যের ছবি তুলে সেটিকে ৩টি প্রিমিয়াম বিজ্ঞাপনের রূপ দিন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "প্রোডাক্ট এডিটিং প্র্যাকটিস",
        tasks: [
          "১০টি সাধারণ পণ্যের ছবিকে প্রফেশনাল পোস্টারে রূপান্তর করুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "Before / After ক্যাটালগ",
        tasks: [
          "আগের সাধারণ ছবি ও আপনার বানানো প্রিমিয়াম ছবির তুলনা সাজিয়ে রাখুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "অনলাইন শপে স্যাম্পল পাঠানো",
        tasks: [
          "প্রতিদিন ৫টি অনলাইন পেজের নিজস্ব পণ্যের ১টি ছবি সুন্দর করে বানিয়ে পাঠান"
        ]
      }
    ]
  },
  {
    id: "executive_virtual_assistant",
    title: "Remote Virtual Assistant (অফিস ও অ্যাডমিন সাপোর্ট)",
    category: "Freelancing & Remote",
    tags: ["admin", "data", "remote", "freelance", "quick_start"],
    difficulty: "Beginner",
    timeToFirstSkill: "2–3 Weeks",
    whyItFits: "ব্যস্ত ব্যবসায়ী ও বিদেশি ক্লায়েন্টদের ইমেইল চেক করা, মিটিং শিডিউল করা এবং প্রতিদিনের ডকুমেন্ট গুছিয়ে দেওয়ার জন্য একজন বিশ্বস্ত সহকারীর প্রয়োজন হয়।",
    whatToLearn: [
      "Google Docs, Sheets, Calendar এবং Gmail প্রফেশনালভাবে ব্যবহার",
      "মিটিং শিডিউল, কাস্টমার ইমেইল রিপ্লাই এবং ফাইল অর্গানাইজ করা",
      "Zoom, Slack ও Trello-তে টিমের কাজের আপডেট রাখা"
    ],
    whatToDoToday: [
      "Google Calendar ও Sheets ব্যবহার করে একটি ৭ দিনের কাজের রুটিন ও ফাইল ট্র্যাকার বানান"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "অফিস টুলস আয়ত্ত করা",
        tasks: [
          "Google Workspace এবং Notion-এর সব জরুরি কাজ শিখে নিন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "নিজের সার্ভিস লিস্ট তৈরি",
        tasks: [
          "আপনি কী কী কাজে সাহায্য করতে পারবেন তার ১ পেজের পরিষ্কার প্রোফাইল বানান"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "রিমোট জবে আবেদন",
        tasks: [
          "Upwork, LinkedIn এবং অনলাইন উদ্যোক্তাদের কাছে সহকারী হিসেবে আবেদন করুন"
        ]
      }
    ]
  },
  {
    id: "email_lifecycle_copywriter",
    title: "Email Marketing & Newsletter Specialist",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["writing", "marketing", "underrated", "ecommerce", "remote"],
    difficulty: "Intermediate",
    timeToFirstSkill: "3–4 Weeks",
    whyItFits: "বিদেশি ব্র্যান্ড ও ক্রিয়েটররা ইমেইল নিউজলেটারের মাধ্যমে প্রচুর প্রোডাক্ট বিক্রি করে। সুন্দর ইমেইল লেখা ও অটোমেশন সেটআপ করা একটি হাই-ডিমান্ড কাজ।",
    whatToLearn: [
      "মানুষ যাতে ইমেইল ওপেন করে এমন আকর্ষণীয় Subject Line লেখা",
      "নতুন কাস্টমারদের জন্য অটোমেটিক Welcome Email সিরিজ সাজানো",
      "Mailchimp বা Beehiiv টুল ব্যবহার করে নিউজলেটার পাঠানো"
    ],
    whatToDoToday: [
      "৩টি জনপ্রিয় ওয়েবসাইটের নিউজলেটারে সাইনআপ করে দেখুন তারা কীভাবে ইমেইল পাঠায়"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম–২য় সপ্তাহ)",
        title: "ইমেইল লেখার কৌশল",
        tasks: [
          "৫টি ভিন্ন স্টাইলের প্রমোশনাল ও শিক্ষণীয় ইমেইল লিখে প্র্যাকটিস করুন"
        ]
      },
      {
        phase: "ধাপ ২ (৩য় সপ্তাহ)",
        title: "ইমেইল টুল সেটআপ",
        tasks: [
          "Mailchimp বা Beehiiv-এ সুন্দর ইমেইল টেমপ্লেট তৈরি শিখুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৪র্থ সপ্তাহ+)",
        title: "ক্লায়েন্টদের সাথে কাজ",
        tasks: [
          "অনলাইন ব্র্যান্ড ও কোচদের সাপ্তাহিক ইমেইল পরিচালনার প্রস্তাব দিন"
        ]
      }
    ]
  },
  {
    id: "seo_content_website_auditor",
    title: "Website SEO & Google Ranking Specialist",
    category: "Tech & Digital",
    tags: ["marketing", "writing", "research", "tech", "remote"],
    difficulty: "Intermediate",
    timeToFirstSkill: "4–6 Weeks",
    whyItFits: "প্রতিটি ওয়েবসাইট মালিক চান মানুষ Google-এ সার্চ করলে যেন তাদের সাইট সবার উপরে আসে। SEO জানলে দীর্ঘমেয়াদী ক্লায়েন্ট পাওয়া যায়।",
    whatToLearn: [
      "মানুষ গুগলে কী লিখে সার্চ করে (Keyword Research) তা বের করা",
      "আর্টিকেল ও ওয়েবসাইটের পেজ সঠিকভাবে সাজানো (On-Page SEO)",
      "Google Search Console দিয়ে সাইটের সমস্যা খুঁজে ঠিক করা"
    ],
    whatToDoToday: [
      "যেকোনো ৩টি ওয়েবসাইট গুগলে সার্চ করে দেখুন তাদের টাইটেল ও লেখা কীভাবে সাজানো"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম–২য় সপ্তাহ)",
        title: "Keyword ও On-Page SEO শেখা",
        tasks: [
          "কীভাবে একটি পেজ গুগলের প্রথম পাতায় আসে তার নিয়মগুলো শিখুন"
        ]
      },
      {
        phase: "ধাপ ২ (৩য় সপ্তাহ)",
        title: "৩টি ওয়েবসাইট অডিট রিপোর্ট",
        tasks: [
          "৩টি রিয়েল ওয়েবসাইটের ভুল ও সমাধান নিয়ে সংক্ষিপ্ত রিপোর্ট তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ৩ (৪র্থ সপ্তাহ+)",
        title: "মাসিক SEO প্রজেক্ট নেওয়া",
        tasks: [
          "ওয়েবসাইট মালিকদের আপনার রিপোর্ট দেখিয়ে মাসিক র‍্যাংকিং কাজের চুক্তি করুন"
        ]
      }
    ]
  },
  {
    id: "event_wedding_reel_creator",
    title: "Mobile Event & Showroom Reel Creator",
    category: "Local & Service",
    tags: ["mobile", "video", "local", "creative", "quick_start"],
    difficulty: "Beginner",
    timeToFirstSkill: "2 Weeks",
    whyItFits: "বিভিন্ন ইভেন্ট, রেস্তোরাঁ, শোরুম এবং প্রোগ্রামে এখন ডিএসএলআর-এর পাশাপাশি সাথে সাথে মোবাইলে সুন্দর Reels শুট ও এডিট করে দেওয়ার প্রচুর চাহিদা।",
    whatToLearn: [
      "স্মার্টফোন দিয়ে স্থির ও সুন্দর অ্যাঙ্গেলে ভিডিও শুট করার কৌশল",
      "CapCut দিয়ে অল্প সময়ে ট্রেন্ডিং মিউজিক ও কালার গ্রেডিংসহ এডিট",
      "শোরুম বা ইভেন্টের আকর্ষণীয় ৩০ সেকেন্ডের হাইলাইট তৈরি"
    ],
    whatToDoToday: [
      "আপনার ফোন দিয়ে কোনো ক্যাফে বা দোকানের ১০টি ছোট ক্লিপ নিয়ে ২০ সেকেন্ডের একটি সুন্দর Reel বানান"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "মোবাইল ভিডিওগ্রাফি প্র্যাকটিস",
        tasks: [
          "ফোন দিয়ে ৫টি প্রফেশনাল মানের শর্ট ভিডিও শুট ও এডিট করুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "২টি লোকাল শপের ডেমো শুট",
        tasks: [
          "পোর্টফোলিওর জন্য পরিচিত ২টি রেস্তোরাঁ বা কাপড়ের দোকানের প্রমো রিল বানান"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "পেইড শুট ও প্যাকেজ নেওয়া",
        tasks: [
          "ইভেন্ট এবং লোকাল ব্র্যান্ডগুলোর জন্য রিলস শুট প্যাকেজ অফার করুন"
        ]
      }
    ]
  },
  {
    id: "online_cohort_tutor",
    title: "Online Batch Tutor & Skill Mentor",
    category: "Local & Service",
    tags: ["teaching", "consulting", "local", "remote", "quick_start", "zero_cost"],
    difficulty: "Beginner",
    timeToFirstSkill: "1–2 Weeks",
    whyItFits: "একজনকে আলাদা করে পড়ানোর চেয়ে Zoom বা Google Meet-এ ৮–১০ জনের ছোট ব্যাচে একাডেমিক বিষয়, Spoken English বা কম্পিউটার শেখালে কম সময়ে অনেক ভালো আয় হয়।",
    whatToLearn: [
      "১ মাসের একটি পরিষ্কার ও সহজ ক্লাস রুটিন বা সিলেবাস সাজানো",
      "Zoom বা Google Meet-এ স্ক্রিন শেয়ার করে ইন্টারঅ্যাকটিভ ক্লাস নেওয়া",
      "ফ্রি ডেমো ক্লাসের মাধ্যমে নতুন শিক্ষার্থী ভর্তি করা"
    ],
    whatToDoToday: [
      "আপনি সবচেয়ে ভালো পারেন এমন ১টি বিষয়ের ৪ সপ্তাহের টপিক লিস্ট খাতায় লিখে ফেলুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "সিলেবাস ও নোট তৈরি",
        tasks: [
          "৮টি ক্লাসের সহজ নোট বা স্লাইড এবং ২টি ছোট ডেমো ভিডিও তৈরি করুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "ফ্রি লাইভ ক্লাস নেওয়া",
        tasks: [
          "আগ্রহী শিক্ষার্থীদের নিয়ে ৪৫ মিনিটের ১টি ফ্রি ওয়ার্কশপ বা ডেমো ক্লাস নিন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "প্রথম ব্যাচ শুরু করা",
        tasks: [
          "৫–১০ জন শিক্ষার্থী নিয়ে আপনার প্রথম মাসিক অনলাইন ব্যাচ শুরু করুন"
        ]
      }
    ]
  },
  {
    id: "high_ticket_appointment_setter",
    title: "Online Client Chat & Appointment Manager",
    category: "Underrated & High-Demand",
    isUnderrated: true,
    tags: ["sales", "consulting", "underrated", "remote", "zero_cost"],
    difficulty: "Intermediate",
    timeToFirstSkill: "2–3 Weeks",
    whyItFits: "বড় অনলাইন এজেন্সি ও কোচদের পেজে প্রতিদিন অনেক মানুষ মেসেজ দেয়। কাস্টমারদের সাথে সুন্দরভাবে কথা বলে মিটিং বুক করে দেওয়ার জন্য তারা ভালো সম্মানী ও কমিশন দেয়।",
    whatToLearn: [
      "মেসেজে কাস্টমারের প্রয়োজন বোঝা ও ভদ্রভাবে সমাধান জানানো",
      "আগ্রহী ক্লায়েন্টদের সাথে ফ্রি কনসালটেশন কল বা মিটিং বুক করা",
      "শিটে কাস্টমারদের ফলো-আপ লিস্ট গুছিয়ে রাখা"
    ],
    whatToDoToday: [
      "বিভিন্ন সার্ভিস এজেন্সি কীভাবে ইনবক্সে ক্লায়েন্টদের সাথে কথা বলে তা লক্ষ্য করুন"
    ],
    roadmapSteps: [
      {
        phase: "ধাপ ১ (১ম সপ্তাহ)",
        title: "কমিউনিকেশন স্ক্রিপ্ট শেখা",
        tasks: [
          "কীভাবে মেসেজে কথা বলে মিটিং ফিক্স করতে হয় তার ৪টি ধাপ শিখুন"
        ]
      },
      {
        phase: "ধাপ ২ (২য় সপ্তাহ)",
        title: "এজেন্সি ও কোচদের সাথে যোগাযোগ",
        tasks: [
          "যারা নিয়মিত বিজ্ঞাপন চালাচ্ছেন এমন ২০টি এজেন্সি বা কোচকে মেসেজ দিন"
        ]
      },
      {
        phase: "ধাপ ৩ (৩য়–৪র্থ সপ্তাহ)",
        title: "মাসিক ফিক্সড + কমিশনে কাজ",
        tasks: [
          "তাদের ইনবক্স ও লিড ম্যানেজ করে প্রতি মাসের ফিক্সড পেমেন্ট ও বোনাস আয় করুন"
        ]
      }
    ]
  }
];

// ============================================================================
// PRACTICAL EARN MONEY OPPORTUNITIES (Easy Bangla + Simple English Mix)
// ============================================================================
const PRACTICAL_EARN_OPPORTUNITIES: EarnOpportunity[] = [
  {
    id: "earn_short_video_packages",
    title: "Short Video Editing (Reels, Shorts ও TikTok এডিটিং)",
    category: "Freelancing",
    difficulty: "Skill Based",
    startupCost: "৳০ (CapCut / DaVinci Free)",
    realisticTimeline: "২–৪ সপ্তাহ",
    overview: "কন্টেন্ট ক্রিয়েটর, ফেসবুক পেজ এবং অনলাইন ব্যবসার জন্য ৩০–৬০ সেকেন্ডের আকর্ষণীয় ভিডিও এডিট করে প্রতি ভিডিও বা মাসিক প্যাকেজে আয় করুন।",
    howToStartToday: [
      "যেকোনো ২টি সাধারণ ভিডিও ডাউনলোড করে সুন্দর ক্যাপশন ও সাউন্ড দিয়ে এডিট করুন",
      "নিজের Google Drive-এ একটি পরিষ্কার Sample ফোল্ডার তৈরি করুন",
      "প্রতিদিন ৫টি সক্রিয় ফেসবুক পেজ বা ইউটিউবারকে ১৫ সেকেন্ডের ফ্রি ডেমো পাঠান"
    ],
    whereToFindWork: [
      "সরাসরি YouTuber ও Facebook Page-এ মেসেজ বা ইমেইল করে",
      "Upwork, Fiverr এবং YTJobs.co",
      "দেশি Content Creator ও E-commerce ফেসবুক গ্রুপ"
    ],
    practicalTips: [
      "শুধু মেসেজ না দিয়ে ছোট একটি কাজের Sample লিংক পাঠালে দ্রুত রিপ্লাই পাবেন",
      "১টি ভিডিওর বদলে মাসে ১০–১৫টি ভিডিওর প্যাকেজ অফার করলে নিয়মিত আয় থাকে"
    ]
  },
  {
    id: "earn_fcommerce_page_moderator",
    title: "Facebook Page Moderator ও Order Manager",
    category: "Online Work",
    difficulty: "Easy Start",
    startupCost: "৳০ (স্মার্টফোন ও ইন্টারনেট)",
    realisticTimeline: "১–২ সপ্তাহ",
    overview: "ব্যস্ত অনলাইন শপগুলোর ফেসবুক ও ইনস্টাগ্রাম পেজে কাস্টমারদের মেসেজের উত্তর দেওয়া, কমেন্ট রিপ্লাই এবং অর্ডার লিস্ট সাজানোর কাজ।",
    howToStartToday: [
      "আপনার দ্রুত টাইপিং, সুন্দর ব্যবহার এবং Google Sheets কাজের কথা লিখে ১ পেজের CV বানান",
      "যেসব অনলাইন পোশাক বা গ্যাজেট পেজে প্রচুর কমেন্ট পড়ে, এমন ১৫টি পেজে যোগাযোগ করুন"
    ],
    whereToFindWork: [
      "সক্রিয় Facebook ও Instagram অনলাইন শপ",
      "E-commerce ও উদ্যোক্তাদের ফেসবুক গ্রুপ"
    ],
    practicalTips: [
      "পেজ মালিককে জানান যে ২ মিনিটের মধ্যে মেসেজের উত্তর দিলে অর্ডার অনেক বেড়ে যায়",
      "বিশ্বাস তৈরির জন্য শুরুতে ২–৩ দিন ট্রায়াল হিসেবে কাজ করে দেখাতে পারেন"
    ]
  },
  {
    id: "earn_local_google_maps_setup",
    title: "Local Business Google Maps ও Page Setup সার্ভিস",
    category: "Local Opportunities",
    difficulty: "Easy Start",
    startupCost: "৳০",
    realisticTimeline: "৩–৭ দিন",
    overview: "আপনার এলাকার ক্লিনিক, রেস্তোরাঁ, সেলুন ও দোকানগুলোর নাম-ঠিকানা Google Maps-এ সুন্দরভাবে যুক্ত করা এবং তাদের ফেসবুক পেজ সাজিয়ে দেওয়া।",
    howToStartToday: [
      "Google Maps-এ আপনার এলাকার ১০টি দোকান বা ক্লিনিক খুঁজুন যাদের তথ্য অসম্পূর্ণ",
      "তাদের সাথে কথা বলে দেখান কীভাবে কাস্টমাররা ম্যাপে সার্চ করে দোকান খোঁজে"
    ],
    whereToFindWork: [
      "আপনার শহরের ডেন্টাল ক্লিনিক, ডায়াগনস্টিক সেন্টার, রেস্তোরাঁ, জিম ও শোরুম"
    ],
    practicalTips: [
      "এককালীন সেটআপ চার্জের পাশাপাশি মাসে একবার আপডেট করার ছোট মাসিক চার্জ রাখতে পারেন"
    ]
  },
  {
    id: "earn_youtube_thumbnail_design",
    title: "YouTube Thumbnail ও Social Media Poster ডিজাইন",
    category: "Freelancing",
    difficulty: "Moderate",
    startupCost: "৳০ (Canva / Photopea / Photoshop)",
    realisticTimeline: "২–৩ সপ্তাহ",
    overview: "ইউটিউবার, অনলাইন শিক্ষক এবং ফেসবুক বিজনেস পেজের জন্য আকর্ষণীয় Thumbnail ও প্রমোশনাল পোস্টার ডিজাইন করে আয়।",
    howToStartToday: [
      "৫টি আসল ইউটিউব ভিডিওর পুরাতন থাম্বনেইল নতুন করে আকর্ষণীয়ভাবে ডিজাইন করুন",
      "ক্রিয়েটরদের আপনার তৈরি Before / After ছবি পাঠিয়ে কাজের প্রস্তাব দিন"
    ],
    whereToFindWork: [
      "YouTube চ্যানেলের About সেকশনে থাকা ইমেইলে",
      "Fiverr, Upwork এবং দেশি-বিদেশি ক্রিয়েটর গ্রুপে"
    ],
    practicalTips: [
      "থাম্বনেইলে বেশি লেখা না দিয়ে ২–৩টি বড় শব্দ ও পরিষ্কার ছবি ব্যবহার করুন"
    ]
  },
  {
    id: "earn_academic_batch_tutoring",
    title: "অফলাইন বা অনলাইন Batch টিউশনি (Academic / English / Computer)",
    category: "Local Opportunities",
    difficulty: "Easy Start",
    startupCost: "৳০",
    realisticTimeline: "১–২ সপ্তাহ",
    overview: "স্কুল-কলেজের যেকোনো বিষয়, Spoken English অথবা বেসিক কম্পিউটার ৫–৮ জনের ছোট গ্রুপে বা Zoom ব্যাচে শেখানো।",
    howToStartToday: [
      "আপনি সবচেয়ে ভালো পারেন এমন ১টি বিষয় বেছে নিয়ে ১ মাসের সহজ লেসন প্ল্যান তৈরি করুন",
      "পরিচিত শিক্ষার্থী বা অনলাইনে ২টি ফ্রি ডেমো ক্লাস অফার করুন"
    ],
    whereToFindWork: [
      "নিজের এলাকার শিক্ষার্থী ও অভিভাবক, টিউশন মিডিয়া অ্যাপ এবং অনলাইন গ্রুপ"
    ],
    practicalTips: [
      "একা একজনকে পড়ানোর চেয়ে ৫–৮ জনের ছোট ব্যাচে পড়ালে সময়ের তুলনায় আয় অনেক বেশি হয়"
    ]
  },
  {
    id: "earn_b2b_data_lead_research",
    title: "Web Research, Data Entry ও Google Sheets অর্গানাইজেশন",
    category: "Small Jobs",
    difficulty: "Easy Start",
    startupCost: "৳০ (PC/Laptop ও ইন্টারনেট)",
    realisticTimeline: "২–৩ সপ্তাহ",
    overview: "বিভিন্ন কোম্পানি বা অনলাইন শপের জন্য ইন্টারনেট থেকে তথ্য খুঁজে বের করা, প্রোডাক্ট লিস্ট তোলা এবং পরিষ্কার এক্সেল/শিট তৈরি করা।",
    howToStartToday: [
      "Google Sheets-এ ৩০টি কোম্পানির নাম, ওয়েবসাইট ও ইমেইল দিয়ে ২টি নমুনা শিট তৈরি করুন",
      "এই স্যাম্পল দেখিয়ে Upwork, Fiverr বা লিংকডইনে কাজের আবেদন করুন"
    ],
    whereToFindWork: [
      "Upwork, Fiverr, LinkedIn এবং ডিজিটাল মার্কেটিং এজেন্সি"
    ],
    practicalTips: [
      "প্রতিটি তথ্য ও ইমেইল শতভাগ নির্ভুল রাখলে একই ক্লায়েন্ট বারবার কাজ দেয়"
    ]
  },
  {
    id: "earn_mobile_product_reel_shoot",
    title: "মোবাইল দিয়ে Product Photo ও Showroom Reel শুট",
    category: "Local Opportunities",
    difficulty: "Moderate",
    startupCost: "৳০ – ৳১,০০০ (নিজের স্মার্টফোন)",
    realisticTimeline: "১–২ সপ্তাহ",
    overview: "এলাকার রেস্তোরাঁ, কেক শপ, বুটিক ও শোরুমের জন্য মোবাইল দিয়েই পরিষ্কার ছবি এবং ৩০ সেকেন্ডের প্রমোশনাল Reels বানিয়ে দেওয়া।",
    howToStartToday: [
      "দিনের আলোতে ঘরেই ৫টি প্রোডাক্টের সুন্দর ছবি এবং ১টি ছোট ভিডিও তৈরি করুন",
      "আপনার এলাকার ৫টি দোকান বা রেস্তোরাঁ মালিককে স্যাম্পল দেখিয়ে সাশ্রয়ী প্যাকেজ অফার করুন"
    ],
    whereToFindWork: [
      "লোকাল ক্যাফে, রেস্তোরাঁ, পোশাকের দোকান এবং হোমমেড ফুড পেজ"
    ],
    practicalTips: [
      "শুট করার ২৪ ঘণ্টার মধ্যে এডিট করা ভিডিও ডেলিভারি দিলে দোকান মালিকরা খুব খুশি হন"
    ]
  },
  {
    id: "earn_presentation_cv_formatting",
    title: "Professional CV, Resume ও Presentation Slide তৈরি",
    category: "Small Jobs",
    difficulty: "Easy Start",
    startupCost: "৳০",
    realisticTimeline: "১ সপ্তাহ",
    overview: "চাকরিপ্রার্থী এবং ইউনিভার্সিটির শিক্ষার্থীদের জন্য আধুনিক মানের CV/Resume, LinkedIn প্রোফাইল এবং PowerPoint স্লাইড তৈরি করে দেওয়া।",
    howToStartToday: [
      "Canva বা MS Word-এ ৩টি সুন্দর ও পরিষ্কার CV টেমপ্লেট এবং ২টি প্রেজেন্টেশন স্লাইড বানান",
      "ইউনিভার্সিটি গ্রুপ ও লিংকডইনে আপনার কাজের নমুনা শেয়ার করুন"
    ],
    whereToFindWork: [
      "বিশ্ববিদ্যালয়ের শিক্ষার্থী, নতুন চাকরিপ্রার্থী এবং কর্পোরেট গ্রুপ"
    ],
    practicalTips: [
      "CV + Cover Letter + LinkedIn সাজানো—এই ৩টি মিলে একটি সুন্দর প্যাকেজ অফার করুন"
    ]
  }
];

// ============================================================================
// PRACTICAL BUSINESS IDEAS (Easy Bangla + Simple English Mix)
// ============================================================================
const PRACTICAL_BUSINESS_IDEAS: BusinessIdeaItem[] = [
  {
    id: "biz_micro_content_agency",
    title: "Short Video ও Social Media সার্ভিস এজেন্সি",
    category: "Digital & Service",
    startupCostRange: "৳০ – ৳৩,০০০ ($0 – $30)",
    monthlyExpenses: "৳১,০০০ – ৳২,৫০০ (ইন্টারনেট ও Canva/CapCut Pro)",
    profitMarginNote: "৭০%–৮৫% লাভ (নিজের ও ছোট টিমের সার্ভিস ভিত্তিক কাজ)",
    overview: "ডাক্তার, কোচ, রেস্তোরাঁ এবং অনলাইন ব্র্যান্ডগুলোর জন্য মাসিক চুক্তিতে তাদের ভিডিও এডিটিং, পোস্টার ডিজাইন ও পেজ দেখাশোনার সার্ভিস দেওয়া।",
    requiredResources: [
      "ল্যাপটপ অথবা ভালো মানের স্মার্টফোন ও ইন্টারনেট",
      "কাজের প্রমাণ হিসেবে ৩টি দারুণ ভিডিও ও ডিজাইন স্যাম্পল",
      "মাসিক সার্ভিস প্যাকেজের পরিষ্কার তালিকা (যেমন: ১৫টি Reels + ১০টি পোস্টার)"
    ],
    risksAndSolutions: [
      "১ মাস পর ক্লায়েন্ট চলে যাওয়া -> শুধু ভিউ না বাড়িয়ে কাস্টমার মেসেজ ও সেল বাড়াতে সাহায্য করুন",
      "কাজের চাপ বেড়ে যাওয়া -> ক্যাপশন ও ডিজাইনের রেডি টেমপ্লেট ব্যবহার করে সময় বাঁচান"
    ],
    stepByStepLaunch: [
      "ধাপ ১: যেকোনো ১টি নির্দিষ্ট ক্যাটাগরি বেছে নিন (যেমন: ক্লিনিক, রেস্তোরাঁ বা ফ্যাশন পেজ)",
      "ধাপ ২: ৩টি চমৎকার ডেমো কাজ তৈরি করে ৩০টি প্রতিষ্ঠানে পাঠান",
      "ধাপ ৩: প্রথম ২–৩ জন মাসিক ক্লায়েন্ট নিয়ে সময়মতো সেরা কাজ ডেলিভারি দিন"
    ]
  },
  {
    id: "biz_niche_fcommerce_brand",
    title: "কম পুঁজিতে Online Shop (Pre-Order ও বাছাইকৃত পণ্য)",
    category: "E-Commerce & Retail",
    startupCostRange: "৳৫,০০০ – ৳১৫,০০০ ($50 – $150)",
    monthlyExpenses: "৳২,০০০ – ৳৬,০০০ (প্যাকেজিং, পেজ বুস্টিং ও ডেলিভারি)",
    profitMarginNote: "প্রতি অর্ডারে ২০%–৩৫% নিট লাভ (ডেলিভারি ও বিজ্ঞাপন খরচ বাদে)",
    overview: "একসাথে অনেক টাকা আটকে না রেখে দরকারি ও মানসম্মত ১–২টি পণ্য (যেমন: পাঞ্জাবি/পোশাক, টোট ব্যাগ, অর্গানিক খাবার বা ডেস্ক গ্যাজেট) নিয়ে অনলাইন ব্র্যান্ড শুরু করা।",
    requiredResources: [
      "নির্ভরযোগ্য পাইকারি সাপ্লায়ার বা প্রস্তুতকারক",
      "আসল ছবি ও ভিডিওসহ পরিষ্কার Facebook ও Instagram পেজ",
      "সারা দেশে Cash on Delivery পাঠানোর কুরিয়ার অ্যাকাউন্ট (Steadfast / Pathao / RedX)"
    ],
    risksAndSolutions: [
      "মাল অবিক্রিত থাকা -> শুরুতে বেশি মাল না কিনে ৫–১০ পিস স্যাম্পল এনে কাস্টমারের চাহিদা পরীক্ষা করুন",
      "ফেইক অর্ডার বা পার্সেল রিটার্ন -> কুরিয়ারে পাঠানোর আগে অবশ্যই ফোনে কথা বলে অর্ডার কনফার্ম করুন"
    ],
    stepByStepLaunch: [
      "ধাপ ১: চাহিদাসম্পন্ন ২–৩টি পণ্যের স্যাম্পল এনে দিনের আলোতে আসল ভিডিও শুট করুন",
      "ধাপ ২: নিয়মিত অর্গানিক Reels পোস্ট করুন এবং অল্প বাজেটে বিজ্ঞাপন চালিয়ে অর্ডার টেস্ট করুন",
      "ধাপ ৩: যে পণ্যটি বেশি বিক্রি হচ্ছে শুধু সেটির স্টক বাড়ান এবং কাস্টমার রিভিউ সংগ্রহ করুন"
    ]
  },
  {
    id: "biz_cloud_kitchen_snacks",
    title: "Home Cloud Kitchen ও অফিস লাঞ্চ বক্স সার্ভিস",
    category: "Food & Daily Needs",
    startupCostRange: "৳৩,০০০ – ৳১০,০০০ ($30 – $100)",
    monthlyExpenses: "কাঁচামাল, পরিষ্কার ফুড বক্স ও লোকাল ডেলিভারি",
    profitMarginNote: "২৫%–৪০% লাভ (সাপ্তাহিক বা মাসিক মিল সাবস্ক্রিপশনে নিয়মিত আয়)",
    overview: "দোকান ভাড়া না নিয়ে নিজের বাসার রান্নাঘর থেকেই এলাকার অফিস, মেস, ব্যাচেলর এবং পরিবারের জন্য ঘরোয়া খাবার বা স্ন্যাকস ডেলিভারি সার্ভিস।",
    requiredResources: [
      "পরিষ্কার রান্নার ব্যবস্থা এবং স্বাস্থ্যসম্মত ফুড প্যাকেজিং বক্স",
      "নির্দিষ্ট ২–৩টি স্পেশাল আইটেম অথবা সাপ্তাহিক লাঞ্চ মেনু",
      "এলাকার ফেসবুক গ্রুপ, WhatsApp ক্যাটালগ এবং Foodpanda রেজিস্ট্রেশন"
    ],
    risksAndSolutions: [
      "খাবার নষ্ট হওয়া -> দুপুরের খাবারের অর্ডার সকাল ১০টার মধ্যে Pre-Order হিসেবে নিন",
      "স্বাদের তারতম্য -> প্রতিদিন নির্দিষ্ট মাপে রান্না করুন যাতে স্বাদ সবসময় এক থাকে"
    ],
    stepByStepLaunch: [
      "ধাপ ১: ২–৩টি সেরা আইটেম ঠিক করে প্রতি বক্সের সঠিক খরচ হিসাব করুন",
      "ধাপ ২: এলাকার অফিস ও আবাসিক ফেসবুক গ্রুপে সুন্দর ছবি দিয়ে ট্রায়াল অর্ডার নিন",
      "ধাপ ৩: সন্তুষ্ট কাস্টমারদের সাপ্তাহিক বা মাসিক লাঞ্চ প্যাকেজে যুক্ত করুন"
    ]
  },
  {
    id: "biz_print_on_demand_merch",
    title: "Custom T-Shirt, Hoodie ও Merchandise ব্র্যান্ড",
    category: "E-Commerce & Retail",
    startupCostRange: "৳২,০০০ – ৳৬,০০০ ($20 – $60)",
    monthlyExpenses: "অর্ডার আসার পর প্রিন্ট খরচ (আগে থেকে বড় স্টকের প্রয়োজন নেই)",
    profitMarginNote: "প্রতি টি-শার্ট বা হুডিতে ২৫%–৪৫% লাভ",
    overview: "সুন্দর ডিজাইন তৈরি করে অর্ডার আসার পর লোকাল প্রিন্টিং প্রেস থেকে টি-শার্ট, জার্সি বা হুডি প্রিন্ট করে ডেলিভারি দেওয়া এবং কলেজ/ক্লাবের বাল্ক অর্ডার নেওয়া।",
    requiredResources: [
      "আকর্ষণীয় ও নতুন ধরনের ১০টি ডিজাইন (Canva / Illustrator / Photoshop)",
      "ভালো মানের কাপড় ও DTF প্রিন্টিং হাউসের সাথে যোগাযোগ",
      "বাস্তব স্যাম্পল ছবি এবং ট্রাই-অন ভিডিও রিলস"
    ],
    risksAndSolutions: [
      "কাপড় বা প্রিন্ট নষ্ট হওয়া -> আগে নিজে ১টি টি-শার্ট প্রিন্ট করে ধুয়ে কোয়ালিটি চেক করে নিন",
      "কাস্টম নামের টি-শার্ট রিটার্ন আসা -> কাস্টম অর্ডারে ডেলিভারি চার্জ অগ্রিম নিয়ে অর্ডার কনফার্ম করুন"
    ],
    stepByStepLaunch: [
      "ধাপ ১: তরুণদের পছন্দমতো ১০টি চমৎকার ডিজাইন প্রস্তুত করুন",
      "ধাপ ২: ২–৩টি স্যাম্পল প্রিন্ট করে বাস্তব ভিডিও ও ছবি তুলুন",
      "ধাপ ৩: অনলাইনে অর্ডার নেওয়ার পাশাপাশি স্কুল-কলেজ ও অফিসের ইভেন্ট টি-শার্টের অর্ডার নিন"
    ]
  },
  {
    id: "biz_local_digital_services",
    title: "Local Business Website, QR Menu ও ডিজিটাল সেটআপ সার্ভিস",
    category: "Low-Cost Local",
    startupCostRange: "৳০ – ৳২,০০০ ($0 – $20)",
    monthlyExpenses: "সামান্য যাতায়াত ও ইন্টারনেট খরচ",
    profitMarginNote: "৮০%+ লাভ (এককালীন সেটআপ ফি + বাৎসরিক রিনিউ চার্জ)",
    overview: "এলাকার রেস্তোরাঁ, ফার্মেসি, কোচিং সেন্টার ও শোরুমগুলোর জন্য ওয়েবসাইট, Google Maps র‍্যাংকিং, ডিজিটাল QR মেনু এবং সহজ হিসাব সফটওয়্যার সেটআপ করে দেওয়া।",
    requiredResources: [
      "ল্যাপটপ বা ট্যাবে ২–৩টি রেডি ডেমো ওয়েবসাইট ও QR মেনু",
      "ভিজিটিং কার্ড এবং ১ পাতার সহজ সার্ভিস তালিকা",
      "WordPress/Framer এবং Google Business Profile-এর বেসিক কাজ"
    ],
    risksAndSolutions: [
      "দোকান মালিকদের বুঝতে সমস্যা হওয়া -> মুখে বলার চেয়ে মোবাইলে লাইভ ডেমো দেখিয়ে সুবিধা বোঝান",
      "বারবার সাপোর্ট চাওয়া -> কাজ শেষে কীভাবে ব্যবহার করতে হয় তার ৫ মিনিটের একটি বাংলা ভিডিও রেকর্ড করে দিন"
    ],
    stepByStepLaunch: [
      "ধাপ ১: রেস্তোরাঁ ও ক্লিনিকের জন্য ২টি সুন্দর ডেমো রেডি করুন",
      "ধাপ ২: প্রতিদিন দুপুরে (যখন দোকানে ভিড় কম থাকে) ৫টি প্রতিষ্ঠানে সরাসরি কথা বলুন",
      "ধাপ ৩: সেটআপ চার্জের পাশাপাশি বাৎসরিক মেইনটেন্যান্স চুক্তি করুন"
    ]
  },
  {
    id: "biz_digital_products_academy",
    title: "Digital Notes, Templates ও Online Course বিজনেস",
    category: "Digital & Service",
    startupCostRange: "৳০ – ৳১,৫০০ ($0 – $15)",
    monthlyExpenses: "৳০ (Google Drive / Notion / Gumroad ফ্রি হোস্টিং)",
    profitMarginNote: "৯০%+ লাভ (একবার তৈরি করলে বারবার বিক্রি করা যায়)",
    overview: "আপনার জানা কোনো দক্ষতা, পরীক্ষার সাজেশন/নোটস, স্পোকেন ইংলিশ গাইড, ডিজাইন টেমপ্লেট বা ই-বুক তৈরি করে অনলাইনে বিক্রি করা।",
    requiredResources: [
      "যেকোনো একটি বিষয়ে ভালো দক্ষতা বা গোছানো স্টাডি ম্যাটেরিয়াল",
      "সুন্দর করে সাজানো PDF গাইড, Notion টেমপ্লেট বা রেকর্ড করা ভিডিও",
      "YouTube, TikTok বা Facebook-এ শিক্ষণীয় ছোট ভিডিও পোস্ট করা"
    ],
    risksAndSolutions: [
      "শুরুতে মানুষের বিশ্বাসের অভাব -> প্রথমে ছোট একটি দরকারি ফ্রি পিডিএফ বা ক্লাস উপহার দিয়ে বিশ্বাস তৈরি করুন",
      "ফাইল কপি হওয়া -> গাইডের সাথে একটি প্রাইভেট সাপোর্ট গ্রুপ বা লাইভ প্রশ্নোত্তর ক্লাস যুক্ত রাখুন"
    ],
    stepByStepLaunch: [
      "ধাপ ১: মানুষের কোন সমস্যাটির সহজ সমাধান আপনি দিতে পারবেন তা ঠিক করুন",
      "ধাপ ২: ৭ দিনের মধ্যে একটি পূর্ণাঙ্গ ও কাজের গাইড বা টেমপ্লেট প্যাক তৈরি করুন",
      "ধাপ ৩: সোশ্যাল মিডিয়ায় নিয়মিত টিপস শেয়ার করে আগ্রহীদের কাছে আপনার রিসোর্সটি অফার করুন"
    ]
  }
];

const DEFAULT_AGRI_BUSI_VIDEOS: CuratedLearnVideo[] = [
  {
    id: 'agri_bd_1',
    videoId: '8X3hW2mB8nQ',
    title: 'বাড়ির পাশে অল্প জায়গায় ও টবে মরিচ, লেবু ও সবজি গাছ লাগিয়ে মাসে আয়',
    author: 'Krishi BioScope (সহজ কৃষি)',
    views: '420K views',
    published: 'Popular',
    duration: '12:15',
    thumbnail: 'https://i.ytimg.com/vi/8X3hW2mB8nQ/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=8X3hW2mB8nQ',
    tags: ['Bangla', 'বাড়ির পাশে গাছ লাগানো'],
    category: 'Business'
  },
  {
    id: 'agri_bd_2',
    videoId: 'k7R2vM5pX1c',
    title: 'মাত্র ৫-১০ হাজার টাকায় চকবাজার থেকে পাইকারি মাল কিনে ছোট পাইকারি ব্যবসা',
    author: 'Amin TV Wholesale BD',
    views: '690K views',
    published: 'Featured',
    duration: '15:40',
    thumbnail: 'https://i.ytimg.com/vi/k7R2vM5pX1c/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=k7R2vM5pX1c',
    tags: ['Bangla', 'ছোট পাইকারি ব্যবসা'],
    category: 'Business'
  },
  {
    id: 'agri_bd_3',
    videoId: 'vN9pL3qT4zY',
    title: 'বাড়ির আঙিনায় ছোট নার্সারি ও ফলের চারা গাছ তৈরি করে সহজে টাকা ইনকাম',
    author: 'Green Garden BD',
    views: '380K views',
    published: 'Featured',
    duration: '11:50',
    thumbnail: 'https://i.ytimg.com/vi/vN9pL3qT4zY/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=vN9pL3qT4zY',
    tags: ['Bangla', 'ছোট নার্সারি ও গাছ'],
    category: 'Business'
  },
  {
    id: 'agri_hi_4',
    videoId: 'm4P8xQ2wK7s',
    title: 'Ghar Ke Paas Sabji Lagana Aur Chota Wholesale Business Kaise Shuru Kare (Hindi)',
    author: 'Smart Kheti & Business Hindi',
    views: '460K views',
    published: 'Hindi Special',
    duration: '13:20',
    thumbnail: 'https://i.ytimg.com/vi/m4P8xQ2wK7s/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=m4P8xQ2wK7s',
    tags: ['Hindi', 'সহজ কৃষি ও পাইকারি'],
    category: 'Business'
  }
];

interface SkillLearnerHubProps {
  onClose?: () => void;
}

export default function SkillLearnerHub({ onClose }: SkillLearnerHubProps) {
  useEffect(() => {
    acquireBgMusicPauseLock('component:skill_learner');
    return () => releaseBgMusicPauseLock('component:skill_learner');
  }, []);
  const [activeTab, setActiveTab] = useState<CareerHubTab>('learn');
  const [watchedCareerVideos, setWatchedCareerVideos] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('selfx_career_watched_videos_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('selfx_career_watched_videos_v1', JSON.stringify(watchedCareerVideos));
    } catch {}
  }, [watchedCareerVideos]);

  // Agri+Busi YouTube State
  const [agriSearchQuery, setAgriSearchQuery] = useState('');
  const [agriCategory, setAgriCategory] = useState<string>('All');
  const [agriLiveVideos, setAgriLiveVideos] = useState<CuratedLearnVideo[]>([]);
  const [isSearchingAgri, setIsSearchingAgri] = useState(false);
  const [activeAgriVideo, setActiveAgriVideo] = useState<CuratedLearnVideo | null>(null);
  const [earnBizSubTab, setEarnBizSubTab] = useState<'all' | 'earn' | 'business'>('all');

  // ============================================================================
  // 1. LEARN TAB STATE (Curated + Live YouTube Search + Link Import + Watchlist)
  // ============================================================================
  const [savedCustomVideos, setSavedCustomVideos] = useState<CuratedLearnVideo[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_career_learn_videos_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [learnSearchQuery, setLearnSearchQuery] = useState('');
  const [learnCategory, setLearnCategory] = useState<'All' | 'Watchlist' | 'Make Money' | 'Freelancing' | 'Skills' | 'Business' | 'Career' | 'Global'>('All');
  const [watchlistVideos, setWatchlistVideos] = useState<CuratedLearnVideo[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_career_watchlist_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [liveSearchResults, setLiveSearchResults] = useState<CuratedLearnVideo[] | null>(null);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const [searchFilterMessage, setSearchFilterMessage] = useState<string | null>(null);

  const [activeWatchVideo, setActiveWatchVideo] = useState<CuratedLearnVideo | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrlInput, setImportUrlInput] = useState('');
  const [importCatInput, setImportCatInput] = useState<'Make Money' | 'Freelancing' | 'Skills' | 'Business' | 'Career' | 'Global'>('Skills');
  const [isImportingVideo, setIsImportingVideo] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('selfx_career_learn_videos_v2', JSON.stringify(savedCustomVideos));
    } catch {}
  }, [savedCustomVideos]);

  useEffect(() => {
    try {
      localStorage.setItem('selfx_career_watchlist_v1', JSON.stringify(watchlistVideos));
    } catch {}
  }, [watchlistVideos]);

  const toggleWatchlistVideo = (vid: CuratedLearnVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlistVideos((prev) => {
      const exists = prev.some((v) => v.videoId === vid.videoId);
      if (exists) {
        triggerNotification("Removed from Watchlist", `"${vid.title}" removed from your Fav / Watchlist.`);
        return prev.filter((v) => v.videoId !== vid.videoId);
      } else {
        const cleanVid: CuratedLearnVideo = {
          ...vid,
          thumbnail: `https://i.ytimg.com/vi/${vid.videoId}/hqdefault.jpg`
        };
        triggerNotification("⭐ Added to Watchlist", `"${vid.title}" saved to your Fav / Watchlist.`);
        return [cleanVid, ...prev];
      }
    });
  };

  // Listen for videos shared directly from YouTube to Selfx and fetch real title & thumbnail
  useEffect(() => {
    const onSharedVideo = async (e: any) => {
      if (e.detail && e.detail.videoId) {
        const vidId = e.detail.videoId;
        let realTitle = e.detail.title || '';
        let realAuthor = e.detail.author || '';
        let realThumb = `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;

        try {
          const metaRes = await fetch('/api/career/youtube-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${vidId}` })
          });
          const metaData = await metaRes.json();
          if (metaData?.title) realTitle = metaData.title;
          if (metaData?.author) realAuthor = metaData.author;
          if (metaData?.thumbnail) realThumb = metaData.thumbnail;
        } catch {}

        const incoming: CuratedLearnVideo = {
          id: `shared_${vidId}_${Date.now()}`,
          videoId: vidId,
          title: realTitle || 'YouTube Skill & Career Video',
          author: realAuthor || 'YouTube Creator',
          views: 'YouTube Video',
          published: 'Just now',
          duration: 'Watch',
          thumbnail: realThumb,
          url: `https://www.youtube.com/watch?v=${vidId}`,
          tags: ['Saved', 'YouTube', 'Learn'],
          category: 'Skills'
        };
        setSavedCustomVideos((prev) => [incoming, ...prev.filter((v) => v.videoId !== incoming.videoId)]);
        setActiveTab('learn');
        setActiveWatchVideo(incoming);
        triggerNotification("📺 Video Added", `"${incoming.title}" saved to Learn.`);
      }
    };
    window.addEventListener('selfx_career_video_added', onSharedVideo);
    return () => window.removeEventListener('selfx_career_video_added', onSharedVideo);
  }, []);

  // Live YouTube search for All categories + custom queries so real YouTube titles & thumbnails always appear
  useEffect(() => {
    if (learnCategory === 'Watchlist') {
      setIsSearchingYouTube(false);
      setSearchFilterMessage(null);
      return;
    }
    const trimmed = learnSearchQuery.trim();

    const timer = setTimeout(async () => {
      setIsSearchingYouTube(true);
      setSearchFilterMessage(null);
      try {
        const res = await fetch('/api/career/youtube-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            category: learnCategory
          })
        });
        const data = await res.json();
        if (data?.filteredOut) {
          setLiveSearchResults([]);
          setSearchFilterMessage('শুধুমাত্র Career, Income, Freelancing, Skills, Business এবং বিদেশে যাওয়া সম্পর্কিত শিক্ষণীয় ভিডিও এখানে দেখানো হয়।');
        } else if (Array.isArray(data?.videos) && data.videos.length > 0) {
          setLiveSearchResults(
            data.videos.map((v: any) => ({
              ...v,
              thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
              category: learnCategory === 'All' ? 'Skills' : learnCategory
            }))
          );
        } else {
          setLiveSearchResults(null);
        }
      } catch {
        setLiveSearchResults(null);
      } finally {
        setIsSearchingYouTube(false);
      }
    }, trimmed ? 380 : 80);

    return () => clearTimeout(timer);
  }, [learnSearchQuery, learnCategory]);

  const extractYouTubeId = (rawUrl: string): string => {
    const match = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    return match ? match[1] : '';
  };

  const handleImportYouTubeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = importUrlInput.trim();
    if (!raw) return;

    const videoId = extractYouTubeId(raw);
    if (!videoId) {
      triggerNotification("⚠️ সঠিক লিংক দিন", "অনুগ্রহ করে একটি সঠিক YouTube ভিডিও লিংক পেস্ট করুন।");
      return;
    }

    setIsImportingVideo(true);
    try {
      const res = await fetch('/api/career/youtube-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw })
      });
      const data = await res.json();
      const newVideo: CuratedLearnVideo = {
        id: `yt_${videoId}_${Date.now()}`,
        videoId,
        title: data?.title || 'YouTube Career & Skill Video',
        author: data?.author || 'YouTube Creator',
        views: 'Imported',
        published: 'Saved',
        duration: 'Video',
        thumbnail: data?.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        tags: [importCatInput, 'YouTube', 'Saved'],
        category: importCatInput
      };
      setSavedCustomVideos((prev) => [newVideo, ...prev.filter((v) => v.videoId !== videoId)]);
      setImportUrlInput('');
      setShowImportModal(false);
      setActiveWatchVideo(newVideo);
      triggerNotification("✅ Video যুক্ত হয়েছে", `"${newVideo.title}" আপনার Learn লিস্টে যুক্ত হয়েছে।`);
    } catch {
      const fallback: CuratedLearnVideo = {
        id: `yt_${videoId}_${Date.now()}`,
        videoId,
        title: 'YouTube Learning Video',
        author: 'YouTube Creator',
        views: 'Imported',
        published: 'Saved',
        duration: 'Video',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        tags: [importCatInput, 'Saved'],
        category: importCatInput
      };
      setSavedCustomVideos((prev) => [fallback, ...prev.filter((v) => v.videoId !== videoId)]);
      setImportUrlInput('');
      setShowImportModal(false);
      setActiveWatchVideo(fallback);
    } finally {
      setIsImportingVideo(false);
    }
  };

  // Combine saved custom videos + real YouTube search results (excluding watched videos so new ones take their place)
  const displayedVideos: CuratedLearnVideo[] = React.useMemo(() => {
    if (learnCategory === 'Watchlist') {
      const q = learnSearchQuery.trim().toLowerCase();
      if (!q) return watchlistVideos;
      return watchlistVideos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.author.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (searchFilterMessage) return [];
    const customFiltered = savedCustomVideos
      .filter((v) => !watchedCareerVideos[v.videoId])
      .map((v) => ({
        ...v,
        thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
      }));

    if (liveSearchResults && liveSearchResults.length > 0) {
      const unwatchedLive = liveSearchResults.filter((r) => !watchedCareerVideos[r.videoId]);
      if (!learnSearchQuery.trim() && learnCategory === 'All') {
        const existingIds = new Set(customFiltered.map((c) => c.videoId));
        return [...customFiltered, ...unwatchedLive.filter((r) => !existingIds.has(r.videoId))];
      }
      return unwatchedLive;
    }

    const combined = [...customFiltered, ...DEFAULT_CURATED_VIDEOS].filter((v) => !watchedCareerVideos[v.videoId]);
    const byCategory =
      learnCategory === 'All'
        ? combined
        : combined.filter(
            (v) =>
              v.category === learnCategory ||
              v.tags.some((t) => t.toLowerCase().includes(learnCategory.toLowerCase()))
          );
    if (!learnSearchQuery.trim()) return byCategory;
    const q = learnSearchQuery.toLowerCase();
    return byCategory.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.author.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [savedCustomVideos, watchlistVideos, liveSearchResults, learnCategory, learnSearchQuery, searchFilterMessage, watchedCareerVideos]);

  const handleMarkCareerVideoWatched = (vid: CuratedLearnVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchedCareerVideos((prev) => ({ ...prev, [vid.videoId]: true }));
    if (activeWatchVideo?.videoId === vid.videoId) {
      setActiveWatchVideo(null);
    }
    if (activeAgriVideo?.videoId === vid.videoId) {
      setActiveAgriVideo(null);
    }
    triggerNotification("✓ ভিডিও দেখা সম্পন্ন!", "ভিডিওটি তালিকা থেকে সরিয়ে নতুন ভিডিও আনা হয়েছে!");
  };

  // Live YouTube search for Agri+Busi (Mostly Bangladeshi Bangla + some Indian Hindi videos on Farming, Home Gardening & Wholesale Paikari Business)
  useEffect(() => {
    const trimmed = agriSearchQuery.trim();
    const timer = setTimeout(async () => {
      setIsSearchingAgri(true);
      try {
        const res = await fetch('/api/agri-busi/youtube-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            category: agriCategory
          })
        });
        const data = await res.json();
        if (Array.isArray(data?.videos) && data.videos.length > 0) {
          setAgriLiveVideos(data.videos);
        }
      } catch {
        // Keep existing
      } finally {
        setIsSearchingAgri(false);
      }
    }, trimmed ? 350 : 60);
    return () => clearTimeout(timer);
  }, [agriSearchQuery, agriCategory]);

  const displayedAgriVideos: CuratedLearnVideo[] = React.useMemo(() => {
    const list = agriLiveVideos.length > 0 ? [...agriLiveVideos, ...DEFAULT_AGRI_BUSI_VIDEOS] : DEFAULT_AGRI_BUSI_VIDEOS;
    const seen = new Set<string>();
    const result: CuratedLearnVideo[] = [];
    for (const v of list) {
      if (!v || !v.videoId || seen.has(v.videoId)) continue;
      if (watchedCareerVideos[v.videoId]) continue; // Auto-remove watched videos
      seen.add(v.videoId);
      result.push(v);
    }
    return result;
  }, [agriLiveVideos, watchedCareerVideos]);

  // ============================================================================
  // 2. CAREER TAB STATE
  // ============================================================================
  const [careerAnswers, setCareerAnswers] = useState<Record<number, string[]>>(() => {
    try {
      const saved = localStorage.getItem('selfx_career_quiz_answers_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [showQuizForm, setShowQuizForm] = useState<boolean>(false);

  const [selectedCareerIds, setSelectedCareerIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_selected_careers_v1');
      return saved ? JSON.parse(saved) : ['short_form_retention_editor', 'youtube_thumbnail_packaging'];
    } catch {
      return ['short_form_retention_editor'];
    }
  });

  const [completedRoadmapTasks, setCompletedRoadmapTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('selfx_career_roadmap_tasks_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [careerSubView, setCareerSubView] = useState<'recommendations' | 'my_roadmaps'>('recommendations');

  useEffect(() => {
    try {
      localStorage.setItem('selfx_career_quiz_answers_v1', JSON.stringify(careerAnswers));
    } catch {}
  }, [careerAnswers]);

  useEffect(() => {
    try {
      localStorage.setItem('selfx_selected_careers_v1', JSON.stringify(selectedCareerIds));
    } catch {}
  }, [selectedCareerIds]);

  useEffect(() => {
    try {
      localStorage.setItem('selfx_career_roadmap_tasks_v1', JSON.stringify(completedRoadmapTasks));
    } catch {}
  }, [completedRoadmapTasks]);

  const handleSelectQuizOption = (questionId: number, tags: string[]) => {
    const updated = { ...careerAnswers, [questionId]: tags };
    setCareerAnswers(updated);
    if (currentQuestionIdx < TWENTY_CAREER_QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      localStorage.setItem('selfx_career_quiz_completed_v1', 'true');
      setShowQuizForm(false);
      triggerNotification("🎯 কুইজ সম্পন্ন হয়েছে", "আপনার উত্তর অনুযায়ী সেরা ২০+ ক্যারিয়ার সাজানো হয়েছে।");
    }
  };

  const toggleSelectCareer = (careerId: string) => {
    setSelectedCareerIds((prev) =>
      prev.includes(careerId) ? prev.filter((id) => id !== careerId) : [...prev, careerId]
    );
  };

  const toggleRoadmapTask = (taskKey: string) => {
    setCompletedRoadmapTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  const scoredCareers = React.useMemo(() => {
    const userTagCounts: Record<string, number> = {};
    Object.values(careerAnswers).forEach((tagList) => {
      if (Array.isArray(tagList)) {
        tagList.forEach((t) => {
          userTagCounts[t] = (userTagCounts[t] || 0) + 1;
        });
      }
    });

    return TWENTY_TWO_CAREER_RECOMMENDATIONS.map((career) => {
      let matchScore = 0;
      career.tags.forEach((t) => {
        if (userTagCounts[t]) matchScore += userTagCounts[t] * 12;
      });
      if (career.isUnderrated && userTagCounts['underrated']) {
        matchScore += 20;
      }
      const matchPercent = Math.min(98, Math.max(75, 76 + Math.round(matchScore / 2)));
      return { ...career, matchScore, matchPercent };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [careerAnswers]);

  // ============================================================================
  // 3. EARN TAB STATE
  // ============================================================================
  const [earnFilter, setEarnFilter] = useState<string>('All');
  const [savedEarnIds, setSavedEarnIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_saved_earn_ids_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [expandedEarnId, setExpandedEarnId] = useState<string | null>(PRACTICAL_EARN_OPPORTUNITIES[0].id);

  useEffect(() => {
    try {
      localStorage.setItem('selfx_saved_earn_ids_v1', JSON.stringify(savedEarnIds));
    } catch {}
  }, [savedEarnIds]);

  const toggleSaveEarn = (id: string) => {
    setSavedEarnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredEarnList =
    earnFilter === 'All'
      ? PRACTICAL_EARN_OPPORTUNITIES
      : PRACTICAL_EARN_OPPORTUNITIES.filter((item) => item.category === earnFilter);

  // ============================================================================
  // 4. BUSINESS TAB STATE
  // ============================================================================
  const [expandedBizId, setExpandedBizId] = useState<string | null>(PRACTICAL_BUSINESS_IDEAS[0].id);

  // ============================================================================
  // 5. AI CAREER & BUSINESS PLANNER STATE
  // ============================================================================
  const [plannerIdeaInput, setPlannerIdeaInput] = useState('');
  const [plannerBudgetInput, setPlannerBudgetInput] = useState('৳০ – ৳৫,০০০ (কম বাজেট)');
  const [plannerTimeInput, setPlannerTimeInput] = useState('দিনে ২–৩ ঘণ্টা');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const [savedAiPlans, setSavedAiPlans] = useState<GeneratedAiPlan[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_career_ai_plans_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activePlanId, setActivePlanId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('selfx_career_ai_plans_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return null;
  });

  const [completedAiPlanSteps, setCompletedAiPlanSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('selfx_career_ai_plan_checks_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('selfx_career_ai_plans_v1', JSON.stringify(savedAiPlans));
    } catch {}
  }, [savedAiPlans]);

  useEffect(() => {
    try {
      localStorage.setItem('selfx_career_ai_plan_checks_v1', JSON.stringify(completedAiPlanSteps));
    } catch {}
  }, [completedAiPlanSteps]);

  const handleGenerateAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerIdeaInput.trim()) return;

    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/career/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: plannerIdeaInput.trim(),
          budget: plannerBudgetInput,
          hoursPerDay: plannerTimeInput
        })
      });
      const data = await res.json();
      if (data && data.plan) {
        const newPlan: GeneratedAiPlan = {
          id: `plan_${Date.now()}`,
          ideaInput: plannerIdeaInput.trim(),
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          ...data.plan
        };
        setSavedAiPlans((prev) => [newPlan, ...prev]);
        setActivePlanId(newPlan.id);
        setPlannerIdeaInput('');
        triggerNotification("✨ Action Plan তৈরি হয়েছে", "আপনার জন্য পূর্ণাঙ্গ রোডম্যাপ প্রস্তুত।");
      }
    } catch {
      triggerNotification("⚠️ সমস্যা হয়েছে", "প্ল্যান তৈরি করা যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const activeAiPlan = savedAiPlans.find((p) => p.id === activePlanId) || savedAiPlans[0] || null;

  return (
    <div className="min-h-screen bg-[#030908] text-zinc-100 flex flex-col font-sans relative pb-24">
      {/* =====================================================================
          CLEAN PREMIUM TOP APP BAR
         ===================================================================== */}
      <header className="sticky top-0 z-30 bg-[#040c0a]/95 backdrop-blur-md border-b border-teal-500/15 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 -ml-1 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-zinc-950 font-black shadow-[0_0_16px_rgba(16,185,129,0.4)]">
              <span className="text-sm tracking-tighter">S</span>
            </div>
            <span className="text-lg font-display font-bold tracking-tight text-white">
              Selfx
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('learn');
              setTimeout(() => searchInputRef.current?.focus(), 80);
            }}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Search Videos"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Import YouTube Link"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN SCROLLABLE VIEWPORT CONTENT
         ===================================================================== */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-5">
        {/* ===================================================================
            TAB 1: LEARN (Clean Bangla + English Mix + Real YouTube Search & Watchlist)
           =================================================================== */}
        {activeTab === 'learn' && (
          <div className="space-y-4">
            {/* Hero Banner Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071a16] via-[#061512] to-[#08221c] border border-teal-500/25 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#072922] border border-emerald-400/35 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.28)] shrink-0">
                  <div className="w-9 h-7 rounded-lg bg-emerald-400 flex items-center justify-center text-[#041511] shadow-[0_0_14px_rgba(52,211,153,0.6)]">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Learn
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-300/90 leading-snug max-w-md mt-0.5">
                    Skill শেখা, Freelancing, টাকা ইনকাম ও Career গড়ার সেরা YouTube ভিডিও।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#08221c]/90 hover:bg-[#0c3128] border border-teal-400/30 transition-all cursor-pointer shrink-0"
              >
                <div className="w-7 h-5 rounded-md bg-white flex items-center justify-center text-zinc-950">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white leading-none">YouTube</span>
                  <span className="block text-[10px] text-teal-200/80 mt-0.5">Add Video Link</span>
                </div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center bg-[#061310] border border-teal-500/25 focus-within:border-emerald-400/60 rounded-2xl px-4 py-3 shadow-inner transition-all">
              <Search className="w-4.5 h-4.5 text-zinc-400 shrink-0 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={learnSearchQuery}
                onChange={(e) => setLearnSearchQuery(e.target.value)}
                placeholder="যেকোনো ভিডিও বা ক্যারিয়ার টপিক (যেমন: Hsc 28 Ict, ফ্রিল্যান্সিং, ভিডিও এডিটিং) সার্চ করুন..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none"
              />
              {learnSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLearnSearchQuery('')}
                  className="p-1 text-zinc-400 hover:text-white mr-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="pl-3 border-l border-teal-500/20 text-zinc-300 flex items-center">
                {isSearchingYouTube ? (
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <SlidersHorizontal className="w-4 h-4 text-zinc-300" />
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(['All', 'Watchlist', 'Make Money', 'Freelancing', 'Skills', 'Business', 'Career', 'Global'] as const).map((cat) => {
                const active = learnCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLearnCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#1de9b6] text-[#031410] font-bold shadow-[0_0_20px_rgba(29,233,182,0.4)]'
                        : 'bg-[#071613] text-zinc-300 border border-teal-500/20 hover:border-teal-400/40 hover:text-white'
                    }`}
                  >
                    {cat === 'Watchlist' && (
                      <Bookmark className={`w-3.5 h-3.5 ${active ? 'fill-current' : 'text-emerald-400'}`} />
                    )}
                    <span>{cat === 'Watchlist' ? `Fav / Watchlist (${watchlistVideos.length})` : cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Embedded Video Player */}
            {activeWatchVideo && (
              <div className="bg-[#071613] border border-emerald-400/40 rounded-2xl p-4 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      Now Playing
                    </span>
                    <h3 className="text-sm font-bold text-white truncate">
                      {activeWatchVideo.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWatchedCareerVideos((prev) => ({ ...prev, [activeWatchVideo.videoId]: true }));
                      setActiveWatchVideo(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer shrink-0"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-teal-500/25">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeWatchVideo.videoId}?autoplay=1&rel=0`}
                    title={activeWatchVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Section Title Row */}
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-base font-bold text-white">
                {learnSearchQuery.trim()
                  ? `"${learnSearchQuery}" এর YouTube ভিডিও`
                  : learnCategory === 'Watchlist'
                  ? 'আপনার Fav / Watchlist ভিডিও'
                  : learnCategory === 'All'
                  ? 'Featured Videos'
                  : `${learnCategory} Videos`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setLearnCategory('All');
                  setLearnSearchQuery('');
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>See All</span>
                <span>→</span>
              </button>
            </div>

            {/* Filtered Out Warning */}
            {searchFilterMessage && (
              <div className="p-5 rounded-2xl bg-[#071613] border border-amber-500/30 text-center space-y-1.5">
                <p className="text-xs sm:text-sm font-bold text-amber-300">
                  Career & Skill Filter চালু আছে
                </p>
                <p className="text-xs text-zinc-400">
                  {searchFilterMessage}
                </p>
              </div>
            )}

            {/* Video Feed Cards */}
            <div className="space-y-3">
              {learnCategory === 'Watchlist' && displayedVideos.length === 0 && (
                <div className="p-8 rounded-2xl bg-[#071613] border border-teal-500/20 text-center space-y-2">
                  <Bookmark className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-xs sm:text-sm font-bold text-white">আপনার Fav / Watchlist এখনো খালি</p>
                  <p className="text-xs text-zinc-400">
                    যেকোনো ভিডিওর পাশে থাকা বুকমার্ক আইকনে ক্লিক করে এখানে সেভ করে রাখুন।
                  </p>
                </div>
              )}

              {displayedVideos.map((vid) => {
                const isSavedInWatchlist = watchlistVideos.some((w) => w.videoId === vid.videoId);
                return (
                  <div
                    key={vid.id}
                    onClick={() => setActiveWatchVideo(vid)}
                    className="relative group bg-gradient-to-r from-[#071613] to-[#06120f] hover:from-[#0a201b] hover:to-[#081a16] border border-teal-500/20 hover:border-emerald-400/40 rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  >
                    {/* Small Corner Fav / Save Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleWatchlistVideo(vid, e)}
                      title={isSavedInWatchlist ? 'Remove from Fav' : 'Save to Fav'}
                      className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSavedInWatchlist
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                          : 'bg-black/40 border-white/10 text-zinc-400 hover:text-emerald-300 hover:border-emerald-400/40'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSavedInWatchlist ? 'fill-current' : ''}`} />
                    </button>

                    <div className="flex items-start gap-3 min-w-0">
                      {/* Thumbnail with Duration Badge */}
                      <div className="relative w-28 sm:w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                        <img
                          src={`https://i.ytimg.com/vi/${vid.videoId}/hqdefault.jpg`}
                          alt={vid.title}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('mqdefault.jpg')) {
                              target.src = `https://i.ytimg.com/vi/${vid.videoId}/mqdefault.jpg`;
                            }
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono font-bold text-white">
                          {vid.duration}
                        </span>
                      </div>

                      {/* Video Info with clear full space for Title */}
                      <div className="min-w-0 flex-1 pr-7 space-y-1">
                        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                          {vid.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                          <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 inline-flex items-center justify-center text-[8px] font-bold shrink-0">
                            ▶
                          </span>
                          <span className="text-zinc-300 font-medium truncate">{vid.author}</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>•</span>
                          <span className="shrink-0">{vid.views}</span>
                        </div>

                        {/* Topic Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {vid.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-[#09241e] border border-teal-500/25 text-[9px] font-medium text-teal-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Import a YouTube Video Card */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="w-full mt-2 bg-gradient-to-r from-[#071915] to-[#061411] hover:from-[#0b251f] hover:to-[#081c18] border border-teal-500/25 hover:border-emerald-400/40 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#0b2b23] border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Link2 className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Import a YouTube Video
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    যেকোনো দরকারি YouTube ভিডিওর লিংক এখানে সেভ করে রাখুন
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        )}

        {/* ===================================================================
            TAB 2: CAREER (20 Questions -> 22 Careers -> Multi-Select Roadmaps)
           =================================================================== */}
        {activeTab === 'career' && (
          <div className="space-y-4">
            {/* Clean Career Header */}
            <div className="rounded-3xl bg-gradient-to-r from-[#071a16] via-[#061512] to-[#08221c] border border-teal-500/25 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#072922] border border-emerald-400/35 flex items-center justify-center text-emerald-400 shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">
                    Career ও Step-by-Step গাইড
                  </h1>
                  <p className="text-xs text-zinc-300/90 mt-0.5">
                    ২০টি সহজ প্রশ্নের উত্তর দিয়ে আপনার জন্য সেরা ক্যারিয়ার ও আজ কী করবেন তার গাইড বেছে নিন।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentQuestionIdx(0);
                    setShowQuizForm(!showQuizForm);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#09241e] hover:bg-[#0d332a] border border-teal-500/30 text-xs font-semibold text-teal-200 cursor-pointer"
                >
                  {showQuizForm ? 'কুইজ বন্ধ করুন' : '২০টি প্রশ্নের Career Quiz'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCareerSubView(careerSubView === 'recommendations' ? 'my_roadmaps' : 'recommendations')
                  }
                  className="px-3.5 py-2 rounded-xl bg-[#1de9b6] text-[#031410] font-bold text-xs cursor-pointer"
                >
                  {careerSubView === 'recommendations'
                    ? `আমার বাছাই করা (${selectedCareerIds.length})`
                    : 'সবগুলো Career (22)'}
                </button>
              </div>
            </div>

            {/* 20-Question Quiz Card */}
            {showQuizForm && (
              <div className="bg-[#071613] border border-emerald-400/35 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold">
                    প্রশ্ন {currentQuestionIdx + 1} / {TWENTY_CAREER_QUESTIONS.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuizForm(false)}
                    className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    বাদ দিন →
                  </button>
                </div>

                <div className="w-full h-1.5 bg-[#040c0a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1de9b6] transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / TWENTY_CAREER_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white">
                  {TWENTY_CAREER_QUESTIONS[currentQuestionIdx].question}
                </h3>

                <div className="space-y-2">
                  {TWENTY_CAREER_QUESTIONS[currentQuestionIdx].options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        handleSelectQuizOption(TWENTY_CAREER_QUESTIONS[currentQuestionIdx].id, opt.tags)
                      }
                      className="w-full text-left p-3.5 rounded-xl bg-[#05100e] hover:bg-emerald-500/15 border border-teal-500/20 hover:border-emerald-400 text-xs sm:text-sm font-medium text-zinc-100 flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <span>{opt.label}</span>
                      <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Career Roadmaps View */}
            {careerSubView === 'my_roadmaps' ? (
              <div className="space-y-4">
                {selectedCareerIds.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#071613] border border-teal-500/20 text-center space-y-3">
                    <p className="text-sm text-zinc-300">আপনি এখনো কোনো Career সিলেক্ট করেননি।</p>
                    <button
                      type="button"
                      onClick={() => setCareerSubView('recommendations')}
                      className="px-4 py-2 rounded-xl bg-[#1de9b6] text-[#031410] font-bold text-xs cursor-pointer"
                    >
                      সবগুলো Career দেখুন
                    </button>
                  </div>
                ) : (
                  scoredCareers
                    .filter((c) => selectedCareerIds.includes(c.id))
                    .map((career) => (
                      <div
                        key={career.id}
                        className="bg-[#071613] border border-teal-500/30 rounded-2xl p-4 sm:p-5 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-teal-500/15 pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-white">{career.title}</h3>
                              {career.isUnderrated && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                  কম প্রতিযোগিতা (Underrated)
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-teal-300/80 mt-0.5">
                              {career.category} • কাজ শেখার সময়: {career.timeToFirstSkill}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSelectCareer(career.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 text-xs cursor-pointer"
                          >
                            সরান
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div className="bg-[#05100e] border border-teal-500/20 rounded-xl p-3.5 space-y-2">
                            <h4 className="text-xs font-bold text-emerald-300">কী কী শিখতে হবে (What to Learn)</h4>
                            <ul className="space-y-1.5 text-xs text-zinc-200">
                              {career.whatToLearn.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-[#05100e] border border-emerald-400/25 rounded-xl p-3.5 space-y-2">
                            <h4 className="text-xs font-bold text-emerald-300">আজই কী করবেন (What to Do Today)</h4>
                            <div className="space-y-2">
                              {career.whatToDoToday.map((step, i) => {
                                const key = `${career.id}_today_${i}`;
                                const done = !!completedRoadmapTasks[key];
                                return (
                                  <label
                                    key={i}
                                    onClick={() => toggleRoadmapTask(key)}
                                    className="flex items-start gap-2 text-xs text-zinc-100 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={done}
                                      onChange={() => {}}
                                      className="mt-0.5 accent-emerald-400"
                                    />
                                    <span className={done ? 'line-through text-zinc-500' : ''}>{step}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {career.roadmapSteps.map((phase, pIdx) => (
                            <div
                              key={pIdx}
                              className="bg-[#05100e] border border-teal-500/15 rounded-xl p-3.5 space-y-2"
                            >
                              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                                {phase.phase}
                              </span>
                              <h5 className="text-xs font-bold text-white">{phase.title}</h5>
                              <div className="space-y-1.5">
                                {phase.tasks.map((t, tIdx) => {
                                  const taskKey = `${career.id}_p${pIdx}_t${tIdx}`;
                                  const isDone = !!completedRoadmapTasks[taskKey];
                                  return (
                                    <div
                                      key={tIdx}
                                      onClick={() => toggleRoadmapTask(taskKey)}
                                      className="flex items-start gap-2 text-xs text-zinc-300 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isDone}
                                        onChange={() => {}}
                                        className="mt-0.5 accent-emerald-400"
                                      />
                                      <span className={isDone ? 'line-through text-zinc-500' : ''}>{t}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </div>
            ) : (
              /* All 22 Careers Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {scoredCareers.map((career, index) => {
                  const isSelected = selectedCareerIds.includes(career.id);
                  return (
                    <div
                      key={career.id}
                      className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#0a211c] border-emerald-400/60'
                          : 'bg-[#071613] border-teal-500/20 hover:border-teal-500/40'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                              #{index + 1} • {career.matchPercent}% Match
                            </span>
                            {career.isUnderrated && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                Underrated
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400">{career.timeToFirstSkill}</span>
                        </div>

                        <h3 className="text-sm font-bold text-white">{career.title}</h3>
                        <p className="text-xs text-zinc-300 leading-relaxed">{career.whyItFits}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-teal-500/15">
                        <button
                          type="button"
                          onClick={() => toggleSelectCareer(career.id)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1de9b6] text-[#031410]'
                              : 'bg-[#09241e] hover:bg-[#0d332a] text-teal-200 border border-teal-500/30'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>বাছাই করা হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>গাইড বেছে নিন</span>
                            </>
                          )}
                        </button>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => setCareerSubView('my_roadmaps')}
                            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 text-xs font-semibold cursor-pointer"
                          >
                            দেখুন →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 3: EARN + BUSINESS (MERGED INTO ONE UNIFIED OPTION)
           =================================================================== */}
        {activeTab === 'earn_business' && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-gradient-to-r from-[#071a16] via-[#061512] to-[#08221c] border border-teal-500/25 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#072922] border border-emerald-400/35 flex items-center justify-center text-emerald-400 shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Earn + Business (আয় ও ব্যবসা গাইড)</h1>
                  <p className="text-xs text-zinc-300/90 mt-0.5">
                    টাকা ইনকামের সহজ পথ (Earn) এবং কম পুঁজিতে লাভজনক ব্যবসা শুরু করার পূর্ণাঙ্গ গাইড (Business) এক জায়গায়।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-[#040c0a] p-1 rounded-2xl border border-teal-500/25 shrink-0">
                {[
                  { id: 'all', label: 'সবগুলো (Earn+Business)' },
                  { id: 'earn', label: '💰 Earn (আয়ের পথ)' },
                  { id: 'business', label: '💼 Business (ব্যবসা)' }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setEarnBizSubTab(sub.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      earnBizSubTab === sub.id
                        ? 'bg-[#1de9b6] text-[#031410]'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* EARN SECTION */}
            {(earnBizSubTab === 'all' || earnBizSubTab === 'earn') && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    <span>বাস্তবসম্মত টাকা ইনকামের পথ (Earn Ways)</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {['All', 'Freelancing', 'Online Work', 'Small Jobs', 'Local Opportunities'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEarnFilter(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                        earnFilter === cat
                          ? 'bg-[#1de9b6] text-[#031410] font-bold'
                          : 'bg-[#071613] text-zinc-300 border border-teal-500/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredEarnList.map((item) => {
                    const isExpanded = expandedEarnId === item.id;
                    const isSaved = savedEarnIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-[#071613] border border-teal-500/20 rounded-2xl overflow-hidden"
                      >
                        <div
                          onClick={() => setExpandedEarnId(isExpanded ? null : item.id)}
                          className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#09241e] border border-teal-500/30 text-teal-200 text-[10px] font-semibold">
                                {item.category}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                খরচ: <strong className="text-zinc-200">{item.startupCost}</strong>
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                সময়: <strong className="text-emerald-300">{item.realisticTimeline}</strong>
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-white">{item.title}</h3>
                            <p className="text-xs text-zinc-300">{item.overview}</p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveEarn(item.id);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
                              isSaved
                                ? 'bg-[#1de9b6] text-[#031410]'
                                : 'bg-white/5 text-zinc-300 border border-white/10'
                            }`}
                          >
                            {isSaved ? 'Saved' : 'Save'}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-teal-500/15 grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-[#05100e]">
                            <div className="space-y-1.5">
                              <h4 className="text-xs font-bold text-emerald-300">আজই কীভাবে শুরু করবেন</h4>
                              <ul className="space-y-1 text-xs text-zinc-200">
                                {item.howToStartToday.map((step, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-emerald-400 font-bold">{i + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5">
                              <h4 className="text-xs font-bold text-teal-300">কোথায় কাজ পাবেন</h4>
                              <ul className="space-y-1 text-xs text-zinc-200">
                                {item.whereToFindWork.map((place, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-teal-400 font-bold">•</span>
                                    <span>{place}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5">
                              <h4 className="text-xs font-bold text-amber-300">জরুরি পরামর্শ (Tips)</h4>
                              <ul className="space-y-1 text-xs text-zinc-200">
                                {item.practicalTips.map((tip, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-amber-400 font-bold">✓</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BUSINESS SECTION */}
            {(earnBizSubTab === 'all' || earnBizSubTab === 'business') && (
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-teal-300 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>কম পুঁজির লাভজনক Business আইডিয়া ও গাইড</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {PRACTICAL_BUSINESS_IDEAS.map((biz) => {
                    const isExpanded = expandedBizId === biz.id;
                    return (
                      <div
                        key={biz.id}
                        className="bg-[#071613] border border-teal-500/20 rounded-2xl overflow-hidden"
                      >
                        <div
                          onClick={() => setExpandedBizId(isExpanded ? null : biz.id)}
                          className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#09241e] border border-teal-500/30 text-teal-200 text-[10px] font-semibold">
                                {biz.category}
                              </span>
                              <span className="text-xs text-emerald-300 font-semibold">
                                শুরুর বাজেট: {biz.startupCostRange}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-white">{biz.title}</h3>
                            <p className="text-xs text-zinc-300">{biz.overview}</p>
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 text-zinc-400 transition-transform shrink-0 ${
                              isExpanded ? 'rotate-90 text-emerald-400' : ''
                            }`}
                          />
                        </div>

                        {isExpanded && (
                          <div className="p-4 border-t border-teal-500/15 bg-[#05100e] space-y-3.5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                              <div className="p-3 rounded-xl bg-[#071613] border border-teal-500/20">
                                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
                                  শুরুর খরচ (Startup Cost)
                                </span>
                                <p className="text-xs font-bold text-white mt-0.5">{biz.startupCostRange}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-[#071613] border border-teal-500/20">
                                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
                                  মাসিক খরচ (Expenses)
                                </span>
                                <p className="text-xs font-bold text-white mt-0.5">{biz.monthlyExpenses}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-[#071613] border border-teal-500/20">
                                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
                                  লাভের ধারণা (Profit Margin)
                                </span>
                                <p className="text-xs text-zinc-200 mt-0.5">{biz.profitMarginNote}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                              <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-teal-300">কী কী লাগবে (Resources)</h4>
                                <ul className="space-y-1 text-xs text-zinc-200">
                                  {biz.requiredResources.map((r, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="text-teal-400">•</span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-amber-300">ঝুঁকি ও সমাধান (Risks)</h4>
                                <ul className="space-y-1 text-xs text-zinc-200">
                                  {biz.risksAndSolutions.map((risk, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="text-amber-400">!</span>
                                      <span>{risk}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-emerald-300">শুরু করার ধাপ (Steps)</h4>
                                <ul className="space-y-1 text-xs text-zinc-200">
                                  {biz.stepByStepLaunch.map((st, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="text-emerald-400 font-bold">✓</span>
                                      <span>{st}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 4: MINI AGRI & PAIKARI (Small Home Gardening, Tree Planting & Small Wholesale Trade)
           =================================================================== */}
        {activeTab === 'agri_busi' && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071f12] via-[#06180f] to-[#0a2918] border border-emerald-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#0a301c] border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <Sprout className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-bold text-white">সহজ কৃষি ও পাইকারি (Mini Agri & Trade)</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                      বাংলাদেশি বাংলা + হিন্দি ভিডিও
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300/90 mt-1 leading-relaxed">
                    বাড়ির পাশে বা টবে গাছ লাগানো, ছোটখাটো সবজি-ফল চাষ এবং অল্প পুঁজিতে পাইকারি কিনে পাইকারি/খুচরা বিক্রি করার সহজ ভিডিও (এখনই নিজে শুরু করার মতো)।
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar for Mini Agri & Trade */}
            <div className="relative flex items-center bg-[#061310] border border-teal-500/25 focus-within:border-emerald-400/60 rounded-2xl px-4 py-3 shadow-inner transition-all">
              <Search className="w-4.5 h-4.5 text-zinc-400 shrink-0 mr-3" />
              <input
                type="text"
                value={agriSearchQuery}
                onChange={(e) => setAgriSearchQuery(e.target.value)}
                placeholder="বাড়ির পাশে গাছ লাগানো, টবে সবজি চাষ, ছোট নার্সারি বা পাইকারি ব্যবসা লিখে সার্চ করুন..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none"
              />
              {agriSearchQuery && (
                <button
                  type="button"
                  onClick={() => setAgriSearchQuery('')}
                  className="p-1 text-zinc-400 hover:text-white mr-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="pl-3 border-l border-teal-500/20 text-zinc-300 flex items-center">
                {isSearchingAgri ? (
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <Sprout className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>

            {/* Mini Agri & Trade Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'All', label: '🌱 সবগুলো (সহজ কৃষি ও পাইকারি)' },
                { id: 'Home & Rooftop Garden', label: '🏡 বাড়ির পাশে গাছ ও সবজি চাষ' },
                { id: 'Small Nursery & Plants', label: '🪴 ছোট নার্সারি ও চারা বিক্রি' },
                { id: 'Wholesale Paikari Business', label: '📦 ছোট পাইকারি কিনে বিক্রি' },
                { id: 'Small Local Business', label: '🏪 অল্প পুঁজিতে ছোট ব্যবসা' },
                { id: 'Hindi Small Agri & Business', label: '🇮🇳 ইন্ডিয়ান (Hindi) সহজ কৃষি ও ব্যবসা' }
              ].map((cat) => {
                const active = agriCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAgriCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-[#1de9b6] text-[#031410] font-bold shadow-[0_0_20px_rgba(29,233,182,0.4)]'
                        : 'bg-[#071613] text-zinc-300 border border-teal-500/20 hover:border-teal-400/40 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Active Mini Agri Video Player */}
            {activeAgriVideo && (
              <div className="bg-[#071613] border-2 border-emerald-400/45 rounded-2xl p-4 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      সহজ কৃষি ও পাইকারি • {activeAgriVideo.author}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate">
                      {activeAgriVideo.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWatchedCareerVideos((prev) => ({ ...prev, [activeAgriVideo.videoId]: true }));
                      setActiveAgriVideo(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-teal-500/25">
                  <iframe
                    key={activeAgriVideo.videoId}
                    src={`https://www.youtube.com/embed/${activeAgriVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={activeAgriVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Mini Agri Video Cards */}
            <div className="space-y-3">
              {displayedAgriVideos.map((vid) => {
                const isSavedInWatchlist = watchlistVideos.some((w) => w.videoId === vid.videoId);
                return (
                  <div
                    key={vid.id}
                    onClick={() => setActiveAgriVideo(vid)}
                    className="relative group bg-gradient-to-r from-[#071613] to-[#06120f] hover:from-[#0a201b] hover:to-[#081a16] border border-teal-500/20 hover:border-emerald-400/40 rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  >
                    {/* Small Corner Fav / Save Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleWatchlistVideo(vid, e)}
                      title={isSavedInWatchlist ? 'Remove from Fav' : 'Save to Fav'}
                      className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSavedInWatchlist
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                          : 'bg-black/40 border-white/10 text-zinc-400 hover:text-emerald-300 hover:border-emerald-400/40'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSavedInWatchlist ? 'fill-current' : ''}`} />
                    </button>

                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative w-28 sm:w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
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

                      <div className="min-w-0 flex-1 pr-7 space-y-1">
                        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                          {vid.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                          <span className="text-zinc-300 font-medium truncate">{vid.author}</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>•</span>
                          <span className="shrink-0">{vid.views}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {(vid.tags || ['Bangla', 'সহজ কৃষি ও পাইকারি']).slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-[#09241e] border border-teal-500/25 text-[9px] font-medium text-teal-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: AI CAREER & BUSINESS PLANNER
           =================================================================== */}
        {activeTab === 'ai_planner' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-r from-[#071a16] via-[#061512] to-[#08221c] border border-teal-500/25 p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#072922] border border-emerald-400/35 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">AI Career & Business Planner</h1>
                  <p className="text-xs text-zinc-300/90 mt-0.5">
                    আপনার যেকোনো Career লক্ষ্য, Skill, ইনকাম বা Business আইডিয়া নিজের ভাষায় লিখুন—AI আপনাকে পুরো গাইড বানিয়ে দেবে।
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerateAiPlan} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={plannerIdeaInput}
                  onChange={(e) => setPlannerIdeaInput(e.target.value)}
                  placeholder="আপনার লক্ষ্য বা আইডিয়া লিখুন (যেমন: আমি ২ মাসে Video Editing শিখে ইনকাম করতে চাই, অথবা ১০ হাজার টাকায় অনলাইনে পোশাকের ব্যবসা শুরু করতে চাই)..."
                  className="w-full bg-[#040c0a] border border-teal-500/25 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 resize-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={plannerBudgetInput}
                    onChange={(e) => setPlannerBudgetInput(e.target.value)}
                    placeholder="আপনার বাজেট"
                    className="bg-[#040c0a] border border-teal-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={plannerTimeInput}
                    onChange={(e) => setPlannerTimeInput(e.target.value)}
                    placeholder="দিনে কত ঘণ্টা সময় দেবেন"
                    className="bg-[#040c0a] border border-teal-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingPlan || !plannerIdeaInput.trim()}
                    className="py-2.5 px-4 rounded-xl bg-[#1de9b6] hover:bg-emerald-300 text-[#031410] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGeneratingPlan ? 'প্ল্যান তৈরি হচ্ছে...' : 'Action Plan তৈরি করুন'}</span>
                  </button>
                </div>
              </form>
            </div>

            {savedAiPlans.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {savedAiPlans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePlanId(p.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer border ${
                      activeAiPlan?.id === p.id
                        ? 'bg-[#1de9b6] text-[#031410] border-emerald-400 font-bold'
                        : 'bg-[#071613] text-zinc-300 border-teal-500/20'
                    }`}
                  >
                    {p.title.slice(0, 30)}
                  </button>
                ))}
              </div>
            )}

            {activeAiPlan && (
              <div className="bg-[#071613] border border-teal-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-teal-500/15 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                      AI Action Plan • {activeAiPlan.createdAt}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{activeAiPlan.title}</h3>
                    <p className="text-xs text-zinc-300 mt-1">{activeAiPlan.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSavedAiPlans((prev) => prev.filter((x) => x.id !== activeAiPlan.id))
                    }
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[#05100e] border border-teal-500/20 rounded-xl p-3.5 space-y-1.5">
                    <h4 className="text-xs font-bold text-emerald-300">প্রয়োজনীয় Skills</h4>
                    <ul className="space-y-1 text-xs text-zinc-200">
                      {activeAiPlan.requiredSkills.map((sk, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{sk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#05100e] border border-teal-500/20 rounded-xl p-3.5 space-y-1.5">
                    <h4 className="text-xs font-bold text-teal-300">খরচ ও প্রয়োজনীয় টুলস</h4>
                    <p className="text-xs font-bold text-white">
                      বাজেট: {activeAiPlan.startupCostsAndResources.estimatedCost}
                    </p>
                    <ul className="space-y-1 text-xs text-zinc-200">
                      {activeAiPlan.startupCostsAndResources.toolsAndResources.map((tr, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-400">•</span>
                          <span>{tr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#05100e] border border-teal-500/20 rounded-xl p-3.5 space-y-1.5">
                    <h4 className="text-xs font-bold text-cyan-300">কোথা থেকে শিখবেন</h4>
                    <ul className="space-y-1 text-xs text-zinc-200">
                      {activeAiPlan.learningMaterials.map((lm, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-cyan-400">•</span>
                          <span>{lm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#05100e] border border-teal-500/20 rounded-xl p-3.5 space-y-1">
                    <h4 className="text-xs font-bold text-emerald-300">সম্ভাব্য আয়ের ধারণা (Income Idea)</h4>
                    <p className="text-xs text-zinc-200">
                      <strong className="text-white">শুরুতে:</strong> {activeAiPlan.potentialIncome.beginnerRange}
                    </p>
                    <p className="text-xs text-zinc-200">
                      <strong className="text-white">অভিজ্ঞ হলে:</strong> {activeAiPlan.potentialIncome.experiencedRange}
                    </p>
                    <p className="text-xs text-teal-200/80">
                      <strong className="text-white">আয়ের ধরন:</strong> {activeAiPlan.potentialIncome.monetizationModel}
                    </p>
                  </div>

                  <div className="bg-[#05100e] border border-amber-500/20 rounded-xl p-3.5 space-y-1">
                    <h4 className="text-xs font-bold text-amber-300">ঝুঁকি ও সতর্কতা</h4>
                    <ul className="space-y-1 text-xs text-zinc-200">
                      {activeAiPlan.risksAndChallenges.map((rc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400">!</span>
                          <span>{rc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[#05100e] border border-emerald-400/25 rounded-xl p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase">প্রতিদিনের কাজ (Daily)</h4>
                    {activeAiPlan.actionPlan.dailySteps.map((step, i) => {
                      const k = `${activeAiPlan.id}_d_${i}`;
                      const checked = !!completedAiPlanSteps[k];
                      return (
                        <label
                          key={i}
                          onClick={() =>
                            setCompletedAiPlanSteps((prev) => ({ ...prev, [k]: !prev[k] }))
                          }
                          className="flex items-start gap-2 text-xs text-zinc-100 cursor-pointer"
                        >
                          <input type="checkbox" checked={checked} onChange={() => {}} className="mt-0.5 accent-emerald-400" />
                          <span className={checked ? 'line-through text-zinc-500' : ''}>{step}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="bg-[#05100e] border border-teal-500/20 rounded-xl p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-teal-300 uppercase">সাপ্তাহিক কাজ (Weekly)</h4>
                    {activeAiPlan.actionPlan.weeklySteps.map((step, i) => {
                      const k = `${activeAiPlan.id}_w_${i}`;
                      const checked = !!completedAiPlanSteps[k];
                      return (
                        <label
                          key={i}
                          onClick={() =>
                            setCompletedAiPlanSteps((prev) => ({ ...prev, [k]: !prev[k] }))
                          }
                          className="flex items-start gap-2 text-xs text-zinc-100 cursor-pointer"
                        >
                          <input type="checkbox" checked={checked} onChange={() => {}} className="mt-0.5 accent-emerald-400" />
                          <span className={checked ? 'line-through text-zinc-500' : ''}>{step}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="bg-[#05100e] border border-teal-500/20 rounded-xl p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase">মাসিক লক্ষ্য (Monthly)</h4>
                    {activeAiPlan.actionPlan.monthlyRoadmap.map((step, i) => {
                      const k = `${activeAiPlan.id}_m_${i}`;
                      const checked = !!completedAiPlanSteps[k];
                      return (
                        <label
                          key={i}
                          onClick={() =>
                            setCompletedAiPlanSteps((prev) => ({ ...prev, [k]: !prev[k] }))
                          }
                          className="flex items-start gap-2 text-xs text-zinc-100 cursor-pointer"
                        >
                          <input type="checkbox" checked={checked} onChange={() => {}} className="mt-0.5 accent-emerald-400" />
                          <span className={checked ? 'line-through text-zinc-500' : ''}>{step}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          IMPORT YOUTUBE VIDEO MODAL
         ===================================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#071613] border border-teal-500/35 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Link2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">YouTube Video যুক্ত করুন</h3>
                  <p className="text-[11px] text-zinc-400">যেকোনো শিক্ষণীয় বা ইনকাম বিষয়ক ভিডিওর লিংক দিন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportYouTubeVideo} className="space-y-3">
              <input
                type="text"
                required
                value={importUrlInput}
                onChange={(e) => setImportUrlInput(e.target.value)}
                placeholder="https://youtu.be/... অথবা https://youtube.com/watch?v=..."
                className="w-full bg-[#040c0a] border border-teal-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />

              <select
                value={importCatInput}
                onChange={(e) => setImportCatInput(e.target.value as any)}
                className="w-full bg-[#040c0a] border border-teal-500/30 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-400"
              >
                <option value="Skills">Skills</option>
                <option value="Freelancing">Freelancing</option>
                <option value="Make Money">Make Money</option>
                <option value="Business">Business</option>
                <option value="Career">Career</option>
                <option value="Global">Global</option>
              </select>

              <button
                type="submit"
                disabled={isImportingVideo}
                className="w-full py-2.5 rounded-xl bg-[#1de9b6] hover:bg-emerald-300 text-[#031410] font-bold text-xs cursor-pointer"
              >
                {isImportingVideo ? 'যুক্ত হচ্ছে...' : 'Learn-এ যুক্ত করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          FIXED BOTTOM NAVIGATION BAR (Learn, Career, Earn+Business, Agri+Busi, Ai)
         ===================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#040d0b]/95 backdrop-blur-xl border-t border-teal-500/25 px-2 py-2">
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-1">
          {[
            { id: 'learn' as CareerHubTab, label: 'Learn', icon: Play },
            { id: 'career' as CareerHubTab, label: 'Career', icon: Compass },
            { id: 'earn_business' as CareerHubTab, label: 'Earn+Business', icon: Coins },
            { id: 'agri_busi' as CareerHubTab, label: 'Mini Agri', icon: Sprout },
            { id: 'ai_planner' as CareerHubTab, label: 'Ai', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1de9b6]/15 text-[#1de9b6] font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#1de9b6] text-[#031410] shadow-[0_0_16px_rgba(29,233,182,0.45)]'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] leading-none tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
