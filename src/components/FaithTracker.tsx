import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Check, Play, Pause, Award, Clock, Sparkles, 
  ExternalLink, Trash2, Heart, Volume2, CheckSquare, Square,
  CheckCircle2, Activity, ShieldCheck, ChevronDown, ChevronUp,
  RefreshCw, AlertTriangle
} from 'lucide-react';
import { FaithTracker as FaithType } from '../types';
import { triggerNotification } from '../utils';
import { getMediaItem } from '../utils/mediaStorage';

// Authentic Prayer Mat / Mosque Photos matching exact UI
import fajrImg from '../assets/images/faith_fajr_prayer_1788595444754.jpg';
import dhuhrImg from '../assets/images/faith_dhuhr_prayer_1788595466272.jpg';
import asrImg from '../assets/images/faith_asr_prayer_1788595485754.jpg';
import maghribImg from '../assets/images/faith_maghrib_prayer_1788595517006.jpg';
import ishaImg from '../assets/images/faith_isha_prayer_1788595555234.jpg';
import tahajjudImg from '../assets/images/faith_janamaz_user_1787153900928.jpg';

// High-efficiency image compressor using HTML5 canvas (resizes camera photos to 600x600 max, ~30-40KB)
export async function compressPrayerPhoto(file: File, maxDim = 600, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
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

interface FaithTrackerProps {
  faith: FaithType;
  setFaith: React.Dispatch<React.SetStateAction<FaithType>>;
  onEarnPoints?: (amount: number, reason: string) => void;
}

// -------------------------------------------------------------
// COMPREHENSIVE LIFE WAZ SESSIONS (প্রতিটি ক্ষেত্রের জীবনমুখী ওয়াজ)
// -------------------------------------------------------------
export interface LifeWazSession {
  id: string;
  category: 'career' | 'purity' | 'peace' | 'khushoo' | 'parents' | 'tawbah' | 'youth' | 'jannah';
  categoryLabel: string;
  topic: string;
  subtitle: string;
  speaker: string;
  durationMins: number;
  videoQueryUrl: string;
  maulanaAdvice: string;
  actions: string[];
  keyAyahOrHadith: string;
}

const ALL_LIFE_WAZ_SESSIONS: LifeWazSession[] = [
  {
    id: "w_purity_1",
    category: "purity",
    categoryLabel: "চরিত্র রক্ষা",
    topic: "CHASTITY & FOCUS",
    subtitle: "Purity & Character (চরিত্র রক্ষা ও নো-ফ্যাপ)",
    speaker: "শায়খ আব্দুল হাই সাইফুল্লাহ ও মুফতি মেঙ্ক",
    durationMins: 12,
    videoQueryUrl: "https://www.youtube.com/results?search_query=lowering+gaze+islamic+lecture+bangla",
    maulanaAdvice: "শোন ভাই রে, যৌবনকাল আল্লাহ তায়ালার দেওয়া সবচেয়ে বড় আমানত। এই বয়সে তুই যদি নিজের দৃষ্টি আর চরিত্র পবিত্র রাখতে পারিস, কিয়ামতের কঠিন দিনে আরশের নিচে সুশীতল ছায়া পাবি দোস্ত! তুই ১০ সেকেন্ডের সস্তা পিক্সেল আর নোংরামির জন্য নিজের মুখ আর অন্তরের নূর নষ্ট করে দিচ্ছিস। চোখের গুনাহ অন্তরের সমস্ত একাগ্রতা ও নামাজের শান্তি ধ্বংস করে দেয়। যখনই আজেবাজে নোটিফিকেশন আসবে, সাথে সাথে ভাববি: আল্লাহ আমাকে দেখছেন! যে যুবক একাকী নির্জনে আল্লাহর ভয়ে নিজের কুপ্রবৃত্তিকে দমন করবে, জান্নাতের সুউচ্চ প্রাসাদ তার জন্যই প্রস্তুত!",
    actions: [
      "বাথরুমে বা ঘুমানোর সময় বিছানায় অপ্রয়োজনে মোবাইল ফোন নিয়ে যাওয়া সম্পূর্ণ নিষিদ্ধ কর।",
      "সোশ্যাল মিডিয়ার সকল অশ্লীল পেজ, উসকানিমূলক চ্যানেল ও একাউন্ট আজই আনফলো কর।",
      "কুচিন্তা বা তীব্র কামভাব আসলে সাথে সাথে অজু করে চোখে-মুখে ঠান্ডা পানির ঝাপটা দে ও বাইরে হাঁট।"
    ],
    keyAyahOrHadith: "কুরআন: 'মুমিন পুরুষদেরকে বলুন, তারা যেন তাদের দৃষ্টিকে নত রাখে এবং লজ্জাস্থানের হেফাজত করে।' (সূরা নূর: ৩০)"
  },
  {
    id: "w_time_1",
    category: "career",
    categoryLabel: "সময়ের মূল্য",
    topic: "WAKING UP TO REALITY",
    subtitle: "Value of Time (সময়ের মূল্য ও ক্যারিয়ার)",
    speaker: "মিজানুর রহমান আজহারী",
    durationMins: 15,
    videoQueryUrl: "https://www.youtube.com/results?search_query=value+of+time+islam+career+bangla",
    maulanaAdvice: "শোন দোস্ত, অলসতা আর অবহেলার ঘুমে আর কতকাল কাটিয়ে দিবি? তোর চারপাশের বন্ধুরা কিন্তু অলস বসে নেই, তারা একে একে নিজেদের ক্যারিয়ার গড়ছে, ব্যবসা শুরু করছে, পড়াশোনা আর স্কিল শিখে জীবনে এগিয়ে যাচ্ছে। আর তুই পড়ে আছিস সস্তা স্ক্রিন আসক্তিতে! নিজের ক্যারিয়ার ধ্বংস করছিস, মূল্যবান সময় ড্রেনে ফেলে দিচ্ছিস। মনে রাখিস ভাই, আল্লাহ তায়ালা কিয়ামতের দিন সময়ের পাই পাই হিসেব নেবেন। আজ যদি জেগে না উঠিস, তবে আগামীতে আফসোসের শেষ থাকবে না। নিজেকে অলসতা মুক্ত কর, কাজে ফোকাস কর, বন্ধুদের আগে নিজেকে সফল করে দেখা!",
    actions: [
      "সারাদিনের একটা কঠোর রুটিন বানিয়ে কাজের সময় কোনো মোবাইল ব্যবহার করবি না।",
      "অলস বসে না থেকে প্রতিদিন অন্তত ২ ঘণ্টা নতুন কোনো হাই-ইনকাম স্কিল বা পড়াশোনায় দাও।",
      "ইউটিউব বা সোশ্যাল মিডিয়ার রিলস স্ক্রোলিং সম্পূর্ণ সীমিত করে দাও।"
    ],
    keyAyahOrHadith: "হাদিস: 'অধিকাংশ মানুষ দুটি নেয়ামতের ক্ষেত্রে প্রতারিত হয়: স্বাস্থ্য এবং অবসর সময়।' (সহীহ বুখারী: ৬৪১২)"
  },
  {
    id: "w_marriage_1",
    category: "career",
    categoryLabel: "হালাল বিবাহ",
    topic: "PATH TO HALAL MARRIAGE",
    subtitle: "Halal Love & Qualities (হালাল প্রেম ও যোগ্যতা)",
    speaker: "ড. মিজানুর রহমান আজহারী ও শায়খ আহমাদুল্লাহ",
    durationMins: 14,
    videoQueryUrl: "https://www.youtube.com/results?search_query=halal+marriage+qualities+islam+bangla",
    maulanaAdvice: "তুই যে তোর মনের মানুষকে নিজের হালাল জীবনসঙ্গী হিসেবে ঘরে তুলতে চাস—তার জন্য নিজেকে তৈরি করেছিস কি ভাই? শুধু অলস কল্পনা আর সস্তা স্ক্রিন আসক্তিতে দিন কাটালে কি তাকে কখনো পাবি? মেয়েরা কেবল স্বপ্নচারী অলস পুরুষ খোঁজে না, তারা একজন দায়িত্বশীল, স্বাবলম্বী আর চরিত্রবান পুরুষ চায়। তাকে আপন করতে হলে তোকে আগে হালাল ক্যারিয়ার আর উপার্জনের পথ নিশ্চিত করতে হবে। নিজেকে চরিত্রবান আর শক্তিশালী মুসলিম বানা। তোর ইবাদত, তোর চরিত্র আর আত্মমর্যাদাই তোকে তার যোগ্য করে তুলবে!",
    actions: [
      "হালাল উপার্জনের লক্ষ্যে আজই ক্যারিয়ার বা ফ্রিল্যান্সিংয়ে নতুন একটা পদক্ষেপ নে দোস্ত।",
      "অসৎ বা হারাম চিন্তাভাবনা সম্পূর্ণ বর্জন করে সৎ উপার্জনের চেষ্টা কর।",
      "আল্লাহর কাছে তাহাজ্জুদ পড়ে চোখের জল ফেলে হালাল উপায়ে পাওয়ার দোয়া কর।"
    ],
    keyAyahOrHadith: "হাদিস: 'হে যুবসমাজ! তোমাদের মধ্যে যে বিবাহের সামর্থ্য রাখে, সে যেন বিবাহ করে।' (সহীহ বুখারী: ৫০৬৬)"
  },
  {
    id: "w_career_1",
    category: "career",
    categoryLabel: "ক্যারিয়ার ও হালাল জীবিকা",
    topic: "CAREER & HALAL EARNING",
    subtitle: "Halal Hustle & Overcoming Sloth (হালাল জীবিকা ও বরকত)",
    speaker: "শায়খ আহমাদুল্লাহ ও মিজানুর রহমান আজহারী",
    durationMins: 15,
    videoQueryUrl: "https://www.youtube.com/results?search_query=islamic+career+halal+earning+sheikh+ahmadullah",
    maulanaAdvice: "শোন ভাই আমার, ইসলামে অলসতার কোনো স্থান নেই। আল্লাহর রাসূল (সাঃ) নিজের হাতে কাজ করে জীবিকা নির্বাহ করাকে সর্বোত্তম উপার্জন বলেছেন। তুই যদি অলস বসে থেকে কেবল ভাগ্যের দোষ দিস আর ভাবিস এমনি এমনি রিজিক আসবে, তা মারাত্মক ভুল! একজন মুমিন হবে কর্মঠ, উদ্যমী এবং তার পেশায় শ্রেষ্ঠ। তোর সৎ উপার্জন, হালাল রিজিক অন্বেষণ এবং পরিবারের মুখে হালাল খাবার তুলে দেওয়া এক মহান ইবাদত। আজই অলসতার চাদর ফেলে কঠোর পরিশ্রমে নাম, কোনো হালাল কাজকে ছোট ভাববি না। যখন তুই হালাল পথে উপার্জন করে নিজের পায়ে দাঁড়াবি ও আল্লাহর রাস্তায় ব্যয় করবি, আল্লাহ তোর জীবনে এমন বরকত দেবেন যা তুই কল্পনাও করতে পারবি না!",
    actions: [
      "প্রতিদিন অন্তত ২-৩ ঘণ্টা নতুন কোনো হাই-ইনকাম স্কিল বা পড়াশোনায় নিরবচ্ছিন্ন ফোকাস কর।",
      "যেকোনো সন্দেহজনক, সুদি লেনদেন বা অসদুপায় থেকে একশ হাত দূরে থাক।",
      "কাজের শুরুতে 'বিসমিল্লাহ' এবং কাজ শেষে 'আলহামদুলিল্লাহ' বলে রবের কাছে বরকতের দোয়া কর।"
    ],
    keyAyahOrHadith: "হাদিস: 'কোনো ব্যক্তি নিজ হাতের উপার্জনের চেয়ে উত্তম খাবার কখনো খায়নি।' (সহীহ বুখারী: ২০৭২)"
  },
  {
    id: "w_peace_1",
    category: "peace",
    categoryLabel: "মানসিক প্রশান্তি",
    topic: "MENTAL PEACE & TAWAKKUL",
    subtitle: "Overcoming Anxiety & Overthinking (মানসিক অস্থিরতা ও শান্তি)",
    speaker: "ড. মিজানুর রহমান আজহারী ও নোমান আলী খান",
    durationMins: 14,
    videoQueryUrl: "https://www.youtube.com/results?search_query=mental+peace+islam+anxiety+azhari",
    maulanaAdvice: "তোর মন কেন এত অস্থির ভাই? কেন ভবিষ্যতের দুশ্চিন্তা আর অতীতের অনুশোচনায় বুক ভেঙে যায়? আল্লাহ পবিত্র কুরআনে স্পষ্ট বলে দিয়েছেন: 'আলা বিযিকরিল্লাহি তাত্বমাইন্নুল কুলূব'—জেনে রাখো, একমাত্র আল্লাহর স্মরণের মাধ্যমেই অন্তরসমূহ পরম শান্তি লাভ করে! (সূরা রা’দ: ২৮)। তুই মানসিক শান্তি খুঁজছিস গান শুনে, সোশ্যাল মিডিয়ায় স্ক্রোল করে কিংবা মানুষের কাছে। কিন্তু বান্দার মনের শান্তির চাবি তো স্বয়ং আল্লাহর হাতে! যখন তুই সেজদায় মাথা নত করে কাঁদবি এবং তোর সকল চিন্তা রবের হাতে সঁপে দিয়ে বলবি—'হাসবুনাল্লাহু ওয়া নি’মাল ওয়াকীল', তখন দেখবি মনের সব ভারী বোঝা এক নিমিষে উবে যাবে!",
    actions: [
      "অতিরিক্ত চিন্তা বা ভয় আসলে সাথে সাথে 'হাসবুনাল্লাহু ওয়া নি'মাল ওয়াকীল' ১০০ বার পাঠ কর।",
      "প্রতিদিন অন্তত ১৫ মিনিট সম্পূর্ণ নিঃশব্দে আল্লাহর জিকির ও কুরআন তাদাব্বুরে সময় দে।",
      "মানুষের কথায় মন খারাপ না করে গভীর রাতের তাহাজ্জুদে রবের সামনে মনের কথা খুলে বল।"
    ],
    keyAyahOrHadith: "কুরআন: 'জেনে রাখো, একমাত্র আল্লাহর স্মরণের মাধ্যমেই অন্তরসমূহ পরম শান্তি লাভ করে।' (সূরা রা’দ: ২৮)"
  },
  {
    id: "w_khushoo_1",
    category: "khushoo",
    categoryLabel: "নামাজে একাগ্রতা",
    topic: "SALAH QUALITY & DEVOTION",
    subtitle: "Khushoo & Peace in Salah (নামাজে পরম তৃপ্তি ও খুশু)",
    speaker: "শায়খ আহমাদুল্লাহ",
    durationMins: 18,
    videoQueryUrl: "https://www.youtube.com/results?search_query=namaje+monojog+biddhir+upay+sheikh+ahmadullah",
    maulanaAdvice: "তুই নামাজ পড়িস ভাই, কিন্তু নামাজে তৃপ্তি পাস না কেন জানিস? কারণ তুই নামাজকে বানিয়ে ফেলেছিস একটা দ্রুতগতির মেকানিক্যাল শারীরিক ব্যায়াম! তুই নামাজের মধ্যে দাঁড়ালেও তোর মন পড়ে থাকে মোবাইলের নোটিফিকেশন, টাকা-পয়সা আর দুনিয়াবি চিন্তায়। রাসূলুল্লাহ (সাঃ) বলেছেন: 'নামাজ হলো আমার চোখের শীতলতা ও পরম প্রশান্তি।' নামাজে যখন তাকবীরে তাহরিমা বলবি, তখন কল্পনা করবি—তোর সামনে কাবা শরীফ, তোর পায়ের নিচে পুলসিরাত, ডানে জান্নাত, বাঁয়ে জাহান্নাম, পেছনে মৃত্যুর ফেরেশতা এবং তুই দাঁড়িয়ে আছিস স্বয়ং মহান রবের সামনে! সূরা ফাতিহার প্রতি আয়াতে থামবি এবং অনুভব করবি আল্লাহ তোর কথার উত্তর দিচ্ছেন। সিজদায় যতক্ষণ শান্তি না আসে, মাথা তুলবি না!",
    actions: [
      "নামাজের জন্য আজানের সাথে সাথেই সুন্দরভাবে অজু করে ২ মিনিট আগে জায়নামাজে বসে মন শান্ত কর।",
      "সূরা ফাতিহা ও তিলাওয়াতের প্রতি আয়াতের অর্থ মনে মনে চিন্তা করে ধীরেসুস্থে নামাজ পড়।",
      "নামাজ শেষে তাড়াহুড়ো না করে ৩ বার 'আস্তাগফিরুল্লাহ' এবং ১ বার আয়াতুল কুরসী পাঠ কর।"
    ],
    keyAyahOrHadith: "হাদিস: 'নামাজ হলো মুমিনের চোখের শীতলতা ও অন্তরের পরম শান্তি।' (সুনানে নাসায়ী: ৩৯৪০)"
  },
  {
    id: "w_parents_1",
    category: "parents",
    categoryLabel: "পিতা-মাতার খেদমত",
    topic: "HONORING PARENTS",
    subtitle: "Parents & Beautiful Akhlaq (পিতা-মাতার খেদমত ও চরিত্র)",
    speaker: "ড. জাকির নায়েক ও শায়খ আহমাদুল্লাহ",
    durationMins: 10,
    videoQueryUrl: "https://www.youtube.com/results?search_query=parents+rights+in+islam+bangla",
    maulanaAdvice: "তুই যদি সারা রাত তাহাজ্জুদ পড়িস, সারা দিন রোজা রাখিস, অথচ তোর ব্যবহারে তোর মা-বাবার চোখে পানি আসে—তবে মনে রাখিস ভাই, জান্নাতের সুবাসও তুই পাবি না! রাসূল (সাঃ) বলেছেন: 'পিতার সন্তুষ্টিতে আল্লাহর সন্তুষ্টি, আর পিতার অসন্তুষ্টিতে আল্লাহর অসন্তুষ্টি।' তোর মা যে গর্ভে তোকে ১০ মাস বহন করেছেন, নিজের রাতের ঘুম নষ্ট করে তোকে খাইয়েছেন, আজ বড় হয়ে তুই তাদের সাথে মেজাজ দেখাস? তাদের মুখের ওপর কথা বলিস? আজই মা-বাবার পা জড়িয়ে ক্ষমা চা ভাই! তাদের মাথায় স্নেহের হাত বোলা, তাদের মুখে হাসি ফোটা। তাদের একটি দোয়াই তোর দুনিয়া ও আখেরাতের ভাগ্য বদলে দেওয়ার জন্য যথেষ্ট!",
    actions: [
      "প্রতিদিন অন্তত একবার মা-বাবার মুখের দিকে তাকিয়ে হাসিমুখে সালাম ও খোঁজখবর নে।",
      "কখনো মা-বাবার কথার ওপর রূঢ়ভাবে কথা বলবি না; তাদের জন্য 'রাব্বির হামহুমা কামা রাব্বায়ানী সাগীরা' পড়।",
      "নিজের হালাল উপার্জন থেকে প্রতি মাসে মা-বাবার পছন্দের কোনো উপহার বা ফলমূল কিনে দে।"
    ],
    keyAyahOrHadith: "কুরআন: 'আর তোমার পালনকর্তা আদেশ করেছেন... পিতা-মাতার সাথে সদ্ব্যবহার কর।' (সূরা বনী ইসরাঈল: ২৩)"
  },
  {
    id: "w_tawbah_1",
    category: "tawbah",
    categoryLabel: "তওবা ও ইস্তিগফার",
    topic: "SINCERE TAWBAH & FORGIVENESS",
    subtitle: "Power of Istighfar & Allah's Mercy (তওবা ও আল্লাহর ক্ষমা)",
    speaker: "শায়খ আব্দুল হাই সাইফুল্লাহ",
    durationMins: 12,
    videoQueryUrl: "https://www.youtube.com/results?search_query=tawbah+istighfar+waz+bangla",
    maulanaAdvice: "শয়তান তোকে সবসময় হতাশ করতে চায়—'তুই এত গুনাহ করেছিস, তোর নামাজ আর কবুল হবে না, তুই ভালো হতে পারবি না।' এই কথা সম্পূর্ণ মিথ্যা! আল্লাহ তায়ালা পবিত্র কুরআনে বলেন: 'হে আমার বান্দাগণ! যারা নিজেদের ওপর অবিচার করেছ, তোমরা আল্লাহর রহমত থেকে কখনো নিরাশ হয়ো না। নিশ্চয়ই আল্লাহ সমস্ত গুনাহ ক্ষমা করে দেন!' (সূরা জুমার: ৫৩)। তুই সাগরের ফেনা পরিমাণ গুনাহ করলেও রবের দরবারে অনুতপ্ত হয়ে ২ ফোঁটা চোখের পানি ফেললে আল্লাহ তা মাফ করে দেন। গুনাহ হয়ে গেলে হতাশ না হয়ে সাথে সাথে অজু করে ২ রাকাত সালাতুত তাওবা পড়বি। খাঁটি তওবা মানুষকে নবজাতক শিশুর মতো নিষ্পাপ বানিয়ে দেয়!",
    actions: [
      "প্রতিদিন সকালে ও সন্ধ্যায় ১০০ বার 'আস্তাগফিরুল্লাহ ওয়া আতূবু ইলাইহ' পাঠ কর।",
      "যখনই কোনো ভুল বা গুনাহ হয়ে যাবে, সাথে সাথে অজু করে ২ রাকাত তওবার নামাজ পড়।",
      "রাতে ঘুমানোর আগে সাইয়্যিদুল ইস্তিগফার পাঠ করে নিজের সকল ভুলের জন্য ক্ষমা চেয়ে ঘুমাবি।"
    ],
    keyAyahOrHadith: "কুরআন: 'তোমরা আল্লাহর রহমত থেকে কখনো নিরাশ হয়ো না। নিশ্চয়ই আল্লাহ সমস্ত গুনাহ ক্ষমা করে দেন।' (সূরা যুমার: ৫৩)"
  },
  {
    id: "w_youth_1",
    category: "youth",
    categoryLabel: "যৌবনের শক্তি",
    topic: "YOUTH POWER IN FITNAH",
    subtitle: "Youth Discipline & Resistance (যৌবনের শক্তি ও প্রতিরোধ)",
    speaker: "মিজানুর রহমান আজহারী",
    durationMins: 16,
    videoQueryUrl: "https://www.youtube.com/results?search_query=youth+in+islam+mizanur+rahman+azhari",
    maulanaAdvice: "বৃদ্ধ বয়সে তো সবাই তসবিহ হাতে নেয় ভাই, কিন্তু যৌবন বয়সে রক্ত যখন গরম, হাতছানি যখন চারদিকে, তখন যে যুবক আল্লাহর ভয়ে মাথা নত করে—আল্লাহর কাছে তার মর্যাদা হাজার গুণ বেশি! কিয়ামতের সেই ভয়ংকর দিনে সূর্য যখন মাথার এক বিঘত ওপরে থাকবে, মানুষ নিজের ঘামে হাবুডুবু খাবে, তখন আল্লাহর আরশের সুশীতল ছায়ায় জায়গা পাবে সেই যুবক—যে তার যৌবন কাটিয়েছিল আল্লাহর ইবাদতে! তোকে দিয়ে আল্লাহ সমাজ বদলাতে চান। নিজেকে সস্তা আকর্ষণে বিলিয়ে দিস না। তোর ব্যক্তিত্ব, তোর শৌর্যবীর্য আর ঈমান দিয়ে তুই প্রমাণ করবি—একজন মুসলিম যুবক দুনিয়া ও দ্বীন উভয় ক্ষেত্রে অপরাজেয়!",
    actions: [
      "খারাপ ও অনর্থক আড্ডার বন্ধুদের সঙ্গ আজই ত্যাগ করে সৎ ও ধার্মিক বন্ধুদের সাথে বন্ধুত্ব কর।",
      "সপ্তাহে অন্তত একদিন নফল রোজা রাখার চেষ্টা কর (সোমবার বা বৃহস্পতিবার)।",
      "শারীরিক ফিটনেস ও জিম চর্চাকে আল্লাহর দেওয়া আমানত মনে করে শক্তি অর্জন কর।"
    ],
    keyAyahOrHadith: "হাদিস: 'কিয়ামতের দিন আরশের নিচে ৭ শ্রেণির মানুষ ছায়া পাবে, তার মধ্যে একজন হলো সেই যুবক যে যৌবনে আল্লাহর ইবাদত করেছে।' (বুখারী)"
  },
  {
    id: "w_jannah_1",
    category: "jannah",
    categoryLabel: "মৃত্যু ও জান্নাত",
    topic: "DEATH & REALITY OF JANNAH",
    subtitle: "Grave & Jannatul Firdaus (কবরের জীবন ও জান্নাতুল ফিরদাউস)",
    speaker: "শায়খ আহমাদুল্লাহ ও মুফতি মেঙ্ক",
    durationMins: 20,
    videoQueryUrl: "https://www.youtube.com/results?search_query=jannah+reality+death+islam+bangla",
    maulanaAdvice: "এই দুনিয়া আমাদের আসল ঠিকানা নয় ভাই। আমরা সবাই এখানে মুসাফির। দেখতে দেখতে ৬০-৭০ বছর শেষ হয়ে যাবে, তারপর মাটির সাড়ে তিন হাত অন্ধকার ঘরে তোকে একাকী শুয়ে থাকতে হবে। সাথে কোনো ধন-সম্পদ, দামি গাড়ি বা আইফোন যাবে না—যাবে শুধু তোর নেক আমল আর ঈমান! আর জান্নাত? জান্নাত এমন এক অপূর্ব স্থান যা কোনো চোখ কখনো দেখেনি, কোনো কান কখনো শোনেনি এবং কোনো মানুষের কল্পনাতেও কখনো আসেনি! সেখানে কোনো রোগ নেই, দুঃখ নেই, কষ্ট নেই, বার্ধক্য নেই—আছে কেবল চিরন্তন আনন্দ ও স্বয়ং পরম করুণাময় আল্লাহর দিদার! জান্নাত পাওয়ার জন্য তোকে একটু কষ্ট সহ্য করতে হবে ভাই। আল্লাহর কাছে জান্নাতুল ফিরদাউস চেয়ে দোয়া কর!",
    actions: [
      "প্রতিদিন অন্তত ৩ বার দোয়া কর: 'আল্লাহুম্মা ইন্নী আসআলুকাল জান্নাতুল ফিরদাউস' (اللهم إني أسألك الجنة)।",
      "মৃত্যুর কথা স্মরণ করে নিজের অহংকার ও ক্রোধ দমন কর।",
      "প্রতি রাতে ঘুমানোর আগে সূরা আল-মুলক তিলাওয়াত বা শ্রবণ কর যা কবরের আজাব থেকে রক্ষা করে।"
    ],
    keyAyahOrHadith: "হাদিস: 'যে ব্যক্তি আল্লাহর কাছে ৩ বার জান্নাত চায়, জান্নাত নিজে বলে: হে আল্লাহ! তাকে জান্নাতে প্রবেশ করাও!' (তিরমিযী: ২৫৭২)"
  }
];

// ISLAMIC HISTORY SESSIONS (ইসলামী ইতিহাস ও নবীদের বিপ্লবী জীবনী)
const ISLAMIC_HISTORY_SESSIONS: LifeWazSession[] = [
  {
    id: "h_seerah_1",
    category: "jannah",
    categoryLabel: "ইসলামী ইতিহাস",
    topic: "SEERAH & PROPHETIC BATTLES",
    subtitle: "নবীজি (সাঃ) এর বিপ্লবী জীবন ও বদর-উহুদের সংগ্রাম",
    speaker: "শায়খ আহমাদুল্লাহ ও মিজানুর রহমান আজহারী",
    durationMins: 20,
    videoQueryUrl: "https://www.youtube.com/results?search_query=prophet+muhammad+seerah+badr+uhud+bangla",
    maulanaAdvice: "রাসূলুল্লাহ (সাঃ) এর জীবন ছিল ত্যাগ, নিষ্ঠা ও আল্লাহর ওপর অবিচল আস্থার শ্রেষ্ঠ নিদর্শন। মক্কার ১৩ বছর চরম নির্যাতন সহ্য করেও তিনি কখনো সত্যের পথ থেকে বিচ্যুত হননি। বদরের প্রান্তরে ৩১৩ জন নিরস্ত্র সাহাবীকে নিয়ে ১০০০ সুসজ্জিত কাফের সৈন্যের বিরুদ্ধে দাঁড়িয়ে আল্লাহ তায়ালার অলৌকিক বিজয় ছিনিয়ে এনেছিলেন। ইসলামের ইতিহাস আমাদেরকে শেখায়—সংখ্যা বা অস্ত্র নয়, খাঁটি ঈমান ও আল্লাহর ওপর তাওয়াক্কুলই বিজয়ের আসল চাবিকাঠি। নিজের ঈমানকে সাহাবীদের মতো মজবুত বানাও!",
    actions: [
      "সপ্তাহে অন্তত একদিন নবীজি (সাঃ) এর সিরাত গ্রন্থ (যেমন: আর-রাহীকুল মাখতূম) থেকে একটি অধ্যায় পাঠ কর।",
      "নবীজির ক্ষমাশীলতা ও সাহসিকতার কথা স্মরণ করে নিজের রাগ ও জেদ নিয়ন্ত্রণ কর।",
      "রাসূলুল্লাহ (সাঃ) এর উপর প্রতিদিন অন্তত ১০০ বার দরূদ পাঠ কর।"
    ],
    keyAyahOrHadith: "কুরআন: 'তোমাদের মধ্যে যারা আল্লাহ ও পরকালের আশা রাখে, তাদের জন্য আল্লাহর রাসুলের জীবনে রয়েছে সর্বোত্তম আদর্শ।' (সূরা আহযাব: ২১)"
  },
  {
    id: "h_khulafa_1",
    category: "jannah",
    categoryLabel: "ইসলামী ইতিহাস",
    topic: "GOLDEN AGE OF KHULAFA",
    subtitle: "খোলাফায়ে রাশেদীনের ইনসাফ ও স্বর্ণযুগ (আবু বকর ও উমর রাঃ)",
    speaker: "শায়খ আব্দুল হাই সাইফুল্লাহ",
    durationMins: 18,
    videoQueryUrl: "https://www.youtube.com/results?search_query=khulafa+e+rashideen+umar+abu+bakr+bangla",
    maulanaAdvice: "হযরত আবু বকর (রাঃ) খলিফা হয়েও সাধারণ মানুষের বকরির দুধ দোহন করতেন। আর হযরত উমর (রাঃ) অর্ধ-পৃথিবীর শাসক হয়েও রাতের আঁধারে ক্ষুধার্ত প্রজাদের জন্য নিজ কাঁধে আটার বস্তা বহন করতেন! বলেছিলেন: 'ফোরাত নদীর তীরে যদি একটি কুকুরও না খেয়ে মারা যায়, তবে কিয়ামতের দিন উমরকে তার জন্য জবাবদিহি করতে হবে।' এই হলো ইসলামী নেতৃত্বের ইনসাফ ও খোদাভীতি। নিজেদের জীবনে সেই নিষ্ঠা ও দায়িত্বশীলতা নিয়ে এসো। সততা ও ইনসাফ দিয়ে নিজের চরিত্র গড়ে তোল!",
    actions: [
      "হযরত উমর (রাঃ) এর মতো কোনো মানুষ বা অধীনস্থের সাথে বিন্দুমাত্র অন্যায় না করার শপথ নাও।",
      "নিজের স্বার্থের চেয়ে ন্যায়বিচার ও সত্যের পক্ষে অবিচল থাক।",
      "কুরআন ও হাদিসের শিক্ষাকে নিজের প্রতিটি কাজে পথপ্রদর্শক বানাও।"
    ],
    keyAyahOrHadith: "হাদিস: 'আমার পরে তোমরা আমার সুন্নাত এবং হেদায়েতপ্রাপ্ত খোলাফায়ে রাশেদীনের সুন্নাতকে দৃঢ়ভাবে আঁকড়ে ধরবে।' (আবু দাউদ: ৪৬০৭)"
  },
  {
    id: "h_conquest_1",
    category: "jannah",
    categoryLabel: "ইসলামী ইতিহাস",
    topic: "CONQUEST & MERCY",
    subtitle: "মক্কা বিজয় ও ইসলামের অনুপম ক্ষমাশীলতার ইতিহাস",
    speaker: "ড. মিজানুর রহমান আজহারী",
    durationMins: 16,
    videoQueryUrl: "https://www.youtube.com/results?search_query=makkah+conquest+fathul+makkah+bangla",
    maulanaAdvice: "৮ম হিজরীতে যখন ১০,০০০ সাহাবীকে নিয়ে নবীজি (সাঃ) মক্কায় প্রবেশ করলেন, তখন কুরাইশরা ভয়ে কাঁপছিল। কারণ তারাই নবীজিকে জন্মভূমি থেকে তাড়িয়েছিল, সাহাবীদের রক্তে হাত রাঙিয়েছিল। কিন্তু রাসূল (সাঃ) মাথা নত করে উটের পিঠে আরোহণ করে ঘোষণা করলেন: 'আজ তোমাদের বিরুদ্ধে কোনো প্রতিশোধ নেই, তোমরা সবাই মুক্ত!' ক্ষমার এমন নজির পৃথিবীর ইতিহাসে দ্বিতীয়টি নেই। শত্রুকে ক্ষমা করার মাধ্যমেই ইসলাম মানুষের হৃদয় জয় করেছিল। তুমিও ক্ষমার মতো মহান গুণ অর্জন কর!",
    actions: [
      "যাদের ওপর তোমার ক্ষোভ বা রাগ আছে, আল্লাহর সন্তুষ্টির জন্য তাদের নিঃশর্তভাবে ক্ষমা করে দাও।",
      "বিজয় ও সাফল্যে কখনো অহংকার প্রকাশ না করে সর্বদা রবের সামনে বিনম্র থাক।",
      "প্রতিদিন অন্তত একজনের সাথে সুন্দর ও মিষ্টি ভাষায় কথা বলো।"
    ],
    keyAyahOrHadith: "কুরআন: 'যখন আসবে আল্লাহর সাহায্য ও বিজয়, এবং মানুষকে দলে দলে আল্লাহর দ্বীনে প্রবেশ করতে দেখবে...' (সূরা নাসর: ১-২)"
  },
  {
    id: "h_heroes_1",
    category: "jannah",
    categoryLabel: "ইসলামী ইতিহাস",
    topic: "HEROES & CIVILIZATION",
    subtitle: "খালেদ বিন ওয়ালীদ ও মুসলিম বীরদের সোনালী ইতিহাস",
    speaker: "ড. জাকির নায়েক ও মুফতি মেঙ্ক",
    durationMins: 15,
    videoQueryUrl: "https://www.youtube.com/results?search_query=khalid+bin+walid+history+bangla",
    maulanaAdvice: "সাইফুল্লাহ (আল্লাহর তরবারি) হযরত খালেদ বিন ওয়ালীদ (রাঃ) জীবনে ১০০টিরও বেশি যুদ্ধে সেনাপতিত্ব করেছেন এবং একটিতেও পরাজিত হননি! মৃত্যুর সময় তিনি কেঁদে বলেছিলেন: 'আমার শরীরে এমন কোনো ইঞ্চি জায়গা নেই যেখানে তলোয়ার বা বর্শার দাগ নেই, তবুও আজ বিছানায় স্বাভাবিক মৃত্যুবরণ করছি।' ইসলামের বীরেরা মৃত্যুভয়কে জয় করেছিলেন বলেই গোটা বিশ্বে ন্যায়ের পতাকা ও জ্ঞান-বিজ্ঞানের সোনালী যুগ প্রতিষ্ঠিত হয়েছিল। দুর্বল ও অলস নয়, একজন শক্তিশালী আত্মমর্যাদাশীল মুমিন হিসেবে নিজেকে গড়ে তোল!",
    actions: [
      "কোনো বাধা বা ব্যর্থতায় ভেঙে না পড়ে খালেদ বিন ওয়ালীদের মতো দৃঢ় মনোবল বজায় রাখ।",
      "শারীরিক ফিটনেস ও মানসিক শক্তি বৃদ্ধিতে প্রতিদিন নিয়মিত ব্যায়াম কর।",
      "ইসলামী ইতিহাসের বীরদের জীবনী পড়ে নিজের চরিত্রে আত্মমর্যাদাবোধ গড়ে তোল।"
    ],
    keyAyahOrHadith: "হাদিস: 'শক্তিশালী মুমিন দুর্বল মুমিনের চেয়ে উত্তম এবং আল্লাহর কাছে বেশি প্রিয়।' (সহীহ মুসলিম: ২৬৬৪)"
  },
  {
    id: "h_salahuddin_1",
    category: "jannah",
    categoryLabel: "ইসলামী ইতিহাস",
    topic: "JERUSALEM CONQUEST & IZZAH",
    subtitle: "সুলতান সালাহুদ্দীন আইয়ূবী ও বায়তুল মুকাদ্দাস বিজয়",
    speaker: "শায়খ আহমাদুল্লাহ ও তারিক জামিল",
    durationMins: 22,
    videoQueryUrl: "https://www.youtube.com/results?search_query=salahuddin+ayyubi+history+bangla",
    maulanaAdvice: "সুলতান সালাহুদ্দীন আইয়ূবী (রহ.) যতদিন পর্যন্ত জেরুজালেম মুক্ত করতে পারেননি, ততদিন পর্যন্ত তিনি কখনো মন খুলে হাসেননি। বলেছিলেন: 'কীভাবে আমি হাসব, যখন মসজিদে আকসা কাফেরদের হাতে বন্দি?' ১১৮৭ সালে রক্তপাত ছাড়া তিনি জেরুজালেম বিজয় করেছিলেন এবং পরাজিত শত্রুদের ওপর বিন্দুমাত্র প্রতিহিংসা চালাননি। ইসলামের এই আত্মমর্যাদাবোধ, ঈমানী গায়রত ও মহানুভবতা আজও আমাদের অনুপ্রেরণা। তুমিও দ্বীনের মর্যাদাকে নিজের প্রাণের চেয়েও বেশি ভালোবেসে জীবন গড়ো!",
    actions: [
      "ফিলিস্তিন ও মসজিদে আকসার নির্যাতিত ভাই-বোনদের জন্য প্রতিটি নামাজের পর আন্তরিক দোয়া কর।",
      "দ্বীনের মর্যাদাহানিকর কোনো কাজ বা পাপাচারের সাথে কখনো আপস কর না।",
      "সালাহুদ্দীন আইয়ূবীর মতো ত্যাগ ও নিঃস্বার্থতার মানসিকতা তৈরি কর।"
    ],
    keyAyahOrHadith: "কুরআন: 'নিশ্চয়ই আল্লাহর সাহায্য অতি নিকটে।' (সূরা বাক্বারা: ২১৪)"
  },
  {
    id: "h_andalus_1",
    category: "jannah",
    categoryLabel: "ইসলামী ইতিহাস",
    topic: "ISLAMIC SPAIN & GOLDEN CIVILIZATION",
    subtitle: "স্পেনের মুসলিম আন্দালুস ও তারিক বিন জিয়াদের ইতিহাস",
    speaker: "ড. মিজানুর রহমান আজহারী",
    durationMins: 19,
    videoQueryUrl: "https://www.youtube.com/results?search_query=andalusia+spain+islamic+history+bangla",
    maulanaAdvice: "৭১১ খ্রিস্টাব্দে মাত্র ৭০০০ মুজাহিদ নিয়ে সেনাপতি তারিক বিন জিয়াদ ইউরোপের মাটিতে পা রাখেন এবং নির্দেশ দেন সমস্ত জাহাজ পুড়িয়ে ফেলতে! বলেছিলেন: 'শত্রু তোমাদের সামনে, সমুদ্র তোমাদের পেছনে। আল্লাহর শপথ, এখন কেবল বীরত্ব অথবা শাহাদাত ছাড়া আর কোনো পথ নেই!' এরপর স্পেনে শুরু হয়েছিল মুসলিম আন্দালুসের ৮০০ বছরের সোনালী যুগ—যেখানে পুরো ইউরোপ অন্ধকারে ডুবে থাকলেও স্পেনের কর্ডোবা বিশ্ববিদ্যালয় ও বিজ্ঞানের আলো গোটা বিশ্বকে আলোকিত করেছিল!",
    actions: [
      "জীবনে কোনো বড় নেক লক্ষ্য অর্জনে পেছনের ভীরুতা ও অলসতার নৌকা পুড়িয়ে সামনে এগিয়ে যাও।",
      "ইসলামী স্বর্ণযুগের জ্ঞানচর্চা ও একাগ্রতাকে নিজের পড়াশোনা বা পেশায় বাস্তবায়ন কর।",
      "ইউরোপ ও বিশ্বের বুকে ইসলামের অবদানের সঠিক ইতিহাস নিয়মিত চর্চা কর।"
    ],
    keyAyahOrHadith: "কুরআন: 'তোমরাই হলে সর্বোত্তম উম্মত, যাদের মানবজাতির কল্যাণের জন্য বের করা হয়েছে।' (সূরা আলে ইমরান: ১১০)"
  },
  {
    id: "h_science_1",
    category: "jannah",
    categoryLabel: "ইসলামী ইতিহাস",
    topic: "MUSLIM SCIENTISTS & SCHOLARSHIP",
    subtitle: "চিকিৎসা ও আধুনিক বিজ্ঞানে মুসলমানদের স্বর্ণযুগ ও অবদান",
    speaker: "ড. জাকির নায়েক ও শায়খ আব্দুল হাই সাইফুল্লাহ",
    durationMins: 17,
    videoQueryUrl: "https://www.youtube.com/results?search_query=islamic+golden+age+muslim+scientists+bangla",
    maulanaAdvice: "আধুনিক চিকিৎসা বিজ্ঞানের জনক ইবনে সিনা (অ্যাভিসেনা), বীজগণিতের জনক আল-খাওয়ারিজমি, অপটিক্সের জনক ইবনুল হাইসাম—এঁরা প্রত্যেকেই ছিলেন কুরআনের হাফেজ ও খাঁটি মুমিন! কুরআন তাদেরকে মহাবিশ্ব নিয়ে গবেষণা করার নির্দেশ দিয়েছিল। ইসলাম কখনো বিজ্ঞানের বিরোধী নয়, বরং ইসলামই আধুনিক সভ্যতার ভিত্তিপ্রস্তর স্থাপন করেছে। দ্বীন পালন করে তুমিও জ্ঞান-বিজ্ঞান ও প্রযুক্তির শীর্ষে আরোহণ করে প্রমাণ করবে—একজন নিষ্ঠাবান মুসলিমই বিশ্বের শ্রেষ্ঠ পথপ্রদর্শক হতে পারে!",
    actions: [
      "নিজের পড়াশোনা, কোডিং বা পেশাগত দক্ষতাকে উম্মাহর খেদমতের নিয়তে সর্বোচ্চে নিয়ে যাও।",
      "কুরআনের বৈজ্ঞানিক নিদর্শনগুলো নিয়ে নিয়মিত চিন্তা-ভাবনা কর।",
      "অলস বিনোদন পরিহার করে জ্ঞানচর্চা ও ফলপ্রসূ কাজে সময় ব্যয় কর।"
    ],
    keyAyahOrHadith: "কুরআন: 'বলো, যারা জানে আর যারা জানে না তারা কি সমান হতে পারে?' (সূরা যুমার: ৯)"
  },
  {
    id: "h_sahaba_iman_1",
    category: "jannah",
    categoryLabel: "ইসলামী ইতিহাস",
    topic: "SACRIFICE & FAITH OF COMPANIONS",
    subtitle: "সাহাবায়ে কেরামের ঈমানদীপ্ত ত্যাগ ও অবিচল নিষ্ঠা",
    speaker: "মুফতি মেঙ্ক ও শায়খ আহমাদুল্লাহ",
    durationMins: 20,
    videoQueryUrl: "https://www.youtube.com/results?search_query=sahaba+sacrifice+iman+bangla+waz",
    maulanaAdvice: "হযরত বিলাল (রাঃ) এর বুকের ওপর উত্তপ্ত মরুভূমির ভারী পাথর চেপে ধরা হলেও তার মুখ দিয়ে বের হতো: 'আহাদ! আহাদ!' (আল্লাহ এক)। মুসআব ইবনে উমাইর (রাঃ) যিনি মক্কার সবচেয়ে ধনী ও বিলাসবহুল তরুণ ছিলেন, তিনি ইসলামের জন্য রাজপ্রাসাদ ছেড়ে ওহুদের ময়দানে শাহাদাত বরণ করলেন—কাফনের জন্য পর্যাপ্ত কাপড়ও ছিল না! সাহাবীদের এই ত্যাগের ওপর দাঁড়িয়েই আজ আমরা ইসলাম পেয়েছি। নিজেদের সামান্য ভোগবিলাস বা গুনাহের জন্য সাহাবীদের এই পবিত্র ত্যাগকে অপমান করো না। আল্লাহর জন্য ত্যাগ স্বীকার করতে শেখো!",
    actions: [
      "সাহাবীদের জীবনী পড়ে নিজের জীবনে আল্লাহর আনুগত্যকে এক নম্বরে রাখ।",
      "হারাম ভালোবাসা বা কুপ্রবৃত্তির হাতছানি আসলে মুসআব (রাঃ) এর ত্যাগের কথা মনে করে তা বর্জন কর।",
      "প্রতিদিন দ্বীনের জন্য কিছু না কিছু ভালো কাজ বা সদকা করার অভ্যাস গড়।"
    ],
    keyAyahOrHadith: "কুরআন: 'আল্লাহ তাদের প্রতি সন্তুষ্ট হয়েছেন এবং তারাও আল্লাহর প্রতি সন্তুষ্ট হয়েছে।' (সূরা তাওবা: ১০০)"
  }
];

export default function FaithTracker({ faith, setFaith, onEarnPoints }: FaithTrackerProps) {
  // 4 Tabs: 1. Salah Tracker | 2. Waz Sessions | 3. Daily Deeds | 4. Jannat Meter
  const [activeOption, setActiveOption] = useState<'salah' | 'waz' | 'deeds' | 'meter'>('salah');
  const [wazCategoryFilter, setWazCategoryFilter] = useState<string>('all');
  const [showKhushooTips, setShowKhushooTips] = useState<boolean>(false);
  const [showIslamicHistory, setShowIslamicHistory] = useState<boolean>(() => {
    return localStorage.getItem('selfx_show_islamic_history') === 'true';
  });
  const [historyBatch, setHistoryBatch] = useState<number>(() => {
    return parseInt(localStorage.getItem('selfx_islamic_history_batch') || '1', 10);
  });

  // Initialize faith keys
  useEffect(() => {
    setFaith(prev => {
      const updated = { ...prev };
      if (updated.fajr === undefined) updated.fajr = false;
      if (updated.zohor === undefined) updated.zohor = false;
      if (updated.achr === undefined) updated.achr = false;
      if (updated.magrib === undefined) updated.magrib = false;
      if (updated.esha === undefined) updated.esha = false;
      if (updated.tahajjud === undefined) updated.tahajjud = false;
      if (updated.quranPlayed === undefined) updated.quranPlayed = false;
      if (updated.quranPages === undefined) updated.quranPages = 0;
      if (updated.dhikrCount === undefined) updated.dhikrCount = 0;
      if (updated.dhikrTarget === undefined) updated.dhikrTarget = 33;
      if (updated.adhkarMorningCompleted === undefined) updated.adhkarMorningCompleted = [];
      if (updated.adhkarEveningCompleted === undefined) updated.adhkarEveningCompleted = [];
      if (updated.imanPoints === undefined) updated.imanPoints = 0;
      return updated;
    });
  }, [setFaith]);

  // Custom Prayer Wallpapers loaded from user settings
  const [customPrayerPhotos, setCustomPrayerPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('selfx_prayer_custom_photos');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const restorePhotos = async () => {
      const keys = ['fajr', 'zohor', 'achr', 'magrib', 'esha', 'tahajjud'];
      const loaded: Record<string, string> = {};

      for (const k of keys) {
        try {
          const item = await getMediaItem(`selfx_prayer_photo_${k}`);
          if (item) loaded[k] = item;
        } catch (e) {}
      }

      try {
        const saved = localStorage.getItem('selfx_prayer_custom_photos');
        if (saved) {
          Object.assign(loaded, JSON.parse(saved));
        }
      } catch (e) {}

      if (Object.keys(loaded).length > 0) {
        setCustomPrayerPhotos(prev => ({ ...loaded, ...prev }));
      }
    };

    restorePhotos();
  }, []);

  const prayers = [
    { 
      key: 'fajr', 
      label: 'Fajr (ফজর)', 
      subtitle: 'Early dawn prayer befor...', 
      time: '04:15 AM', 
      reward: 15, 
      img: customPrayerPhotos.fajr || fajrImg 
    },
    { 
      key: 'zohor', 
      label: 'Dhuhr (যোহর)', 
      subtitle: 'Midday prayer & mindful...', 
      time: '01:15 PM', 
      reward: 15, 
      img: customPrayerPhotos.zohor || dhuhrImg 
    },
    { 
      key: 'achr', 
      label: 'Asr (আসর)', 
      subtitle: 'Late afternoon prayer & ...', 
      time: '04:30 PM', 
      reward: 15, 
      img: customPrayerPhotos.achr || asrImg 
    },
    { 
      key: 'magrib', 
      label: 'Maghrib (মাগরিব)', 
      subtitle: 'Sunset prayer & evening...', 
      time: '06:35 PM', 
      reward: 15, 
      img: customPrayerPhotos.magrib || maghribImg 
    },
    { 
      key: 'esha', 
      label: 'Isha (এশা)', 
      subtitle: 'Night prayer & serene cl...', 
      time: '08:00 PM', 
      reward: 15, 
      img: customPrayerPhotos.esha || ishaImg 
    },
    { 
      key: 'tahajjud', 
      label: 'Tahajjud (তাহাজ্জুদ)', 
      subtitle: 'Late night quiet spiritual ...', 
      time: '03:15 AM', 
      reward: 25, 
      img: customPrayerPhotos.tahajjud || tahajjudImg 
    }
  ];

  const deeds = [
    { key: 'quranPlayed', label: 'Quran Recitation', desc: 'Read or listen to a few verses', reward: 15 },
    { key: 'morningAdhkar', label: 'Morning Adhkar', desc: 'Protection & blessings for the day', reward: 15 },
    { key: 'eveningAdhkar', label: 'Evening Adhkar', desc: 'Peace and security before sleep', reward: 15 },
    { key: 'istighfar', label: 'Istighfar 100x', desc: 'Seek forgiveness & quietness of mind', reward: 15 },
    { key: 'durood', label: 'Durood Sharif 100x', desc: 'Send peace to Prophet Muhammad (PBUH)', reward: 15 }
  ];

  const [customDeeds, setCustomDeeds] = useState<string[]>(() => {
    const saved = localStorage.getItem('lookmax_custom_deeds');
    return saved ? JSON.parse(saved) : [];
  });
  const [newDeedInput, setNewDeedInput] = useState('');

  const [completedCustomDeeds, setCompletedCustomDeeds] = useState<string[]>(() => {
    const saved = localStorage.getItem('lookmax_completed_custom_deeds');
    return saved ? JSON.parse(saved) : [];
  });

  // Waz Session State
  const [activeLecture, setActiveLecture] = useState<LifeWazSession | null>(null);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState<boolean>(false);
  const [completedWazCount, setCompletedWazCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('selfx_completed_waz_count') || '1', 10);
  });

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && sessionTimer > 0) {
      interval = setInterval(() => {
        setSessionTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsSessionCompleted(true);
            setCompletedWazCount(c => {
              const next = c + 1;
              localStorage.setItem('selfx_completed_waz_count', next.toString());
              return next;
            });
            if (onEarnPoints) {
              onEarnPoints(50, `Completed Waz Session: ${activeLecture?.topic || 'Session'}`);
            }
            triggerNotification("🏆 ওয়াজ সম্পন্ন!", "মাওলানা নসীহা সফলভাবে শেষ করেছেন (+৫০ এক্সপি)");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, sessionTimer, onEarnPoints, activeLecture]);

  const handleStartSession = (lecture: LifeWazSession) => {
    setActiveLecture(lecture);
    setSessionTimer(lecture.durationMins * 60);
    setIsTimerRunning(true);
    setIsSessionCompleted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePrayer = (prayerKey: string, reward: number) => {
    setFaith(prev => {
      const current = !!(prev as any)[prayerKey];
      const next = !current;
      if (next && onEarnPoints) {
        onEarnPoints(reward, `Completed ${prayerKey.toUpperCase()} Prayer`);
      }
      return {
        ...prev,
        [prayerKey]: next
      };
    });
  };

  const toggleDeed = (deedKey: string) => {
    setFaith(prev => {
      const current = !!(prev as any)[deedKey];
      const next = !current;
      if (next && onEarnPoints) {
        onEarnPoints(15, `Completed Daily Deed: ${deedKey}`);
      }
      return {
        ...prev,
        [deedKey]: next
      };
    });
  };

  const handleAddCustomDeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeedInput.trim()) return;
    const updated = [...customDeeds, newDeedInput.trim()];
    setCustomDeeds(updated);
    localStorage.setItem('lookmax_custom_deeds', JSON.stringify(updated));
    setNewDeedInput('');
  };

  const toggleCustomDeed = (deed: string) => {
    setCompletedCustomDeeds(prev => {
      const exists = prev.includes(deed);
      const updated = exists ? prev.filter(d => d !== deed) : [...prev, deed];
      localStorage.setItem('lookmax_completed_custom_deeds', JSON.stringify(updated));
      if (!exists && onEarnPoints) {
        onEarnPoints(10, `Completed Custom Deed: ${deed}`);
      }
      return updated;
    });
  };

  const handleDeleteCustomDeed = (index: number) => {
    const deedToRemove = customDeeds[index];
    const updated = customDeeds.filter((_, i) => i !== index);
    setCustomDeeds(updated);
    localStorage.setItem('lookmax_custom_deeds', JSON.stringify(updated));
    setCompletedCustomDeeds(prev => prev.filter(d => d !== deedToRemove));
  };

  const filteredWazSessions = useMemo(() => {
    if (wazCategoryFilter === 'all') return ALL_LIFE_WAZ_SESSIONS;
    return ALL_LIFE_WAZ_SESSIONS.filter(s => s.category === wazCategoryFilter);
  }, [wazCategoryFilter]);

  const totalPrayersCount = prayers.filter(p => (faith as any)[p.key]).length;
  const totalDeedsCount = deeds.filter(d => (faith as any)[d.key]).length;

  // -------------------------------------------------------------
  // PRACTICAL AUTOMATIC JANNAT METER ENGINE (আমল অনুযায়ী স্বয়ংক্রিয় মিটার)
  // -------------------------------------------------------------
  // Tracks user's real app actions:
  // - Prayers completed today
  // - Deeds completed today
  // - Waz study done
  // - Self-restraint checklist
  const [meterChecklist, setMeterChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('selfx_jannat_meter_checks_v2');
      return saved ? JSON.parse(saved) : {
        lowerGaze: true,
        noSins: true,
        parentsPleasure: true,
        hadMissedPrayer: false,
        hadGazeViolation: false
      };
    } catch (e) {
      return {
        lowerGaze: true,
        noSins: true,
        parentsPleasure: true,
        hadMissedPrayer: false,
        hadGazeViolation: false
      };
    }
  });

  const toggleMeterCheck = (key: string) => {
    setMeterChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('selfx_jannat_meter_checks_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Live Auto-calculated Jannat Score (0 to 100)
  const practicalJannatScore = useMemo(() => {
    let score = 20; // baseline

    // 1. Daily Prayers: 8 pts per prayer (up to 48 pts for 6 prayers)
    score += totalPrayersCount * 8;

    // 2. Deeds: 5 pts per deed (up to 25 pts)
    score += totalDeedsCount * 5;

    // 3. Completed custom deeds
    score += Math.min(completedCustomDeeds.length * 3, 15);

    // 4. Waz Knowledge sessions
    if (completedWazCount > 0) score += 10;

    // 5. Positive moral checklist
    if (meterChecklist.lowerGaze) score += 10;
    if (meterChecklist.parentsPleasure) score += 8;
    if (meterChecklist.noSins) score += 8;

    // 6. Negative Penalties
    if (meterChecklist.hadMissedPrayer) score -= 30;
    if (meterChecklist.hadGazeViolation) score -= 25;

    return Math.max(5, Math.min(100, score));
  }, [totalPrayersCount, totalDeedsCount, completedCustomDeeds.length, completedWazCount, meterChecklist]);

  // Live Color Calculation:
  // >= 70% : Green (সবুজ বাতি)
  // 40% - 69% : Coffee / Amber (কফি কালার বাতি)
  // < 40% : Red (লাল বাতি)
  const meterLight: 'green' | 'coffee' | 'red' = useMemo(() => {
    if (practicalJannatScore >= 70) return 'green';
    if (practicalJannatScore >= 40) return 'coffee';
    return 'red';
  }, [practicalJannatScore]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* 1. GREEN PROTOCOL HUD BANNER (100% IDENTICAL TO SCREENSHOT 1) */}
      <div className="bg-[#0b241c] border border-emerald-800/40 rounded-3xl p-6 relative overflow-hidden shadow-xl text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-mono tracking-widest uppercase font-bold">
          <Star className="w-3 h-3 text-amber-400" />
          FAITH DUTY PROTOCOL
        </div>
        <h1 className="text-xl md:text-2xl font-display font-black tracking-wider text-zinc-100 uppercase mt-3">
          SPIRITUAL CORE & DISCIPLINE
        </h1>
        <p className="text-emerald-200/70 text-xs leading-relaxed max-w-xl font-sans mt-3">
          Build unshakeable character, clean energy, and purity. Maintain daily prayers and counselor rooms.
        </p>
      </div>

      {/* 2. TAB CONTROLLER: 4 COLUMNS (1. SALAH TRACKER | 2. WAZ SESSIONS | 3. DAILY DEEDS | 4. JANNAT METER) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#090b0e] rounded-2xl border border-zinc-900 shadow-lg">
        {[
          { 
            id: 'salah', 
            label: '1. SALAH TRACKER', 
            badge: `${totalPrayersCount}/6`, 
            badgeActiveColor: 'bg-zinc-900 text-amber-400',
            badgeInactiveColor: 'bg-zinc-900 text-zinc-500'
          },
          { 
            id: 'waz', 
            label: '2. WAZ SESSIONS', 
            badge: 'ACTIVE', 
            badgeActiveColor: 'bg-zinc-900 text-emerald-400',
            badgeInactiveColor: 'bg-zinc-900 text-zinc-500'
          },
          { 
            id: 'deeds', 
            label: '3. DAILY DEEDS', 
            badge: `${totalDeedsCount}/5`, 
            badgeActiveColor: 'bg-zinc-900 text-sky-400',
            badgeInactiveColor: 'bg-zinc-900 text-zinc-500'
          },
          { 
            id: 'meter', 
            label: '4. JANNAT METER', 
            badge: meterLight === 'green' ? '🟢 গ্রীন' : meterLight === 'coffee' ? '🟤 কফি' : '🔴 রেড', 
            badgeActiveColor: meterLight === 'green' ? 'bg-emerald-500/10 text-emerald-400' : meterLight === 'coffee' ? 'bg-amber-600/15 text-amber-400' : 'bg-rose-500/10 text-rose-400',
            badgeInactiveColor: 'bg-zinc-900 text-zinc-500'
          }
        ].map((tab) => {
          const isActive = activeOption === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveOption(tab.id as any);
                if (tab.id !== 'waz') {
                  setActiveLecture(null);
                  setIsTimerRunning(false);
                }
              }}
              className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                isActive 
                  ? 'bg-[#12161b] border border-zinc-800 shadow-md scale-[1.01]' 
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-zinc-900/40'
              }`}
            >
              <span className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-amber-400' : 'text-zinc-300'}`}>
                {tab.label}
              </span>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isActive ? tab.badgeActiveColor : tab.badgeInactiveColor
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. OPTION VIEWS CONTAINER */}
      <div className="min-h-[420px] bg-[#0c0d0f] border border-zinc-900 rounded-3xl p-4 sm:p-6 shadow-xl relative text-left">
        <AnimatePresence mode="wait">
          
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: SALAH TRACKER (100% IDENTICAL TO SCREENSHOT 1 & 2)     */}
          {/* ------------------------------------------------------------- */}
          {activeOption === 'salah' && (
            <motion.div
              key="salah-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Header Box: SALAH DISCIPLINE & PURITY TRACKER */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100">
                    SALAH DISCIPLINE & PURITY TRACKER
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Maintain regular prayer timings for spiritual radiance, inner peace, and steadfast character.
                  </p>
                </div>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-[10px] font-mono font-black tracking-wider uppercase shrink-0">
                  6 PRAYERS
                </div>
              </div>

              {/* Progress Box: COMPLETED 0 of 6 Prayers (Circle %) */}
              <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center font-mono font-black text-xs text-emerald-400 shrink-0">
                  {Math.round((totalPrayersCount / 6) * 100)}%
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                    COMPLETED
                  </div>
                  <div className="text-sm font-black text-zinc-100">
                    {totalPrayersCount} of 6 Prayers
                  </div>
                </div>
              </div>

              {/* KHUSHOO PEACE TIPS ACCORDION (ADDITIONAL REQUESTED BENEFIT) */}
              <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowKhushooTips(!showKhushooTips)}
                  className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    নামাজে পরম শান্তি (খুশু) পাওয়ার ৫টি সোনালী নিয়ম ও জান্নাতের দু'আ
                  </span>
                  {showKhushooTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showKhushooTips && (
                  <div className="p-4 pt-1 border-t border-zinc-900 text-xs text-zinc-300 font-sans space-y-2.5 bg-zinc-950">
                    <p className="leading-relaxed">
                      <strong>১. অজু:</strong> অজু তাড়াহুড়ো না করে ধীরে করুন। ভাবুন প্রতি ফোঁটা পানির সাথে সগীরা গুনাহ ঝরে যাচ্ছে।
                    </p>
                    <p className="leading-relaxed">
                      <strong>২. তাকবীর:</strong> হাত উঠিয়ে 'আল্লাহু আকবার' বলার সময় সব দুনিয়াবি চিন্তা পেছনে ফেলে দিন।
                    </p>
                    <p className="leading-relaxed">
                      <strong>৩. সূরা ফাতিহা:</strong> প্রতি আয়াতে থামুন। আল্লাহ আরশ থেকে জবাব দিচ্ছেন তা অন্তরে অনুভব করুন।
                    </p>
                    <p className="leading-relaxed">
                      <strong>৪. সিজদা:</strong> বান্দা সিজদায় রবের সবচেয়ে কাছে থাকে। সিজদায় চোখের জল ফেলে মনের কথা বলুন।
                    </p>
                    <p className="leading-relaxed text-emerald-400">
                      <strong>জান্নাত নিশ্চিত করার আমল:</strong> ফরজ নামাজের পর ১ বার আয়াতুল কুরসী পাঠ করুন (নাসায়ী - মৃত্যুর পরেই জান্নাত) এবং ৩ বার 'আল্লাহুম্মা ইন্নী আসআলুকাল জান্নাহ' বলুন।
                    </p>
                  </div>
                )}
              </div>

              {/* 6 PRAYER CARDS (EXACT VISUALS FROM SCREENSHOT 2) */}
              <div className="space-y-3 pt-1">
                {prayers.map((prayer) => {
                  const isCompleted = !!(faith as any)[prayer.key];
                  return (
                    <div
                      key={prayer.key}
                      onClick={() => togglePrayer(prayer.key, prayer.reward)}
                      className="w-full bg-[#0c0d0f] border border-zinc-800 hover:border-zinc-700 p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group"
                    >
                      {/* Left side: Thumbnail image & Details */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800 relative">
                          <img 
                            src={prayer.img} 
                            alt={prayer.label}
                            className="w-full h-full object-cover" 
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold text-zinc-100">
                            {prayer.label}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-800/80">
                              {prayer.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate font-sans">
                            {prayer.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Circular Checkbox & XP Badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Circular Check Indicator */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isCompleted 
                            ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                            : 'bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                        </div>

                        {/* XP Badge */}
                        <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-[10px] font-mono font-black tracking-wider">
                          +{prayer.reward} XP
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: WAZ SESSIONS (ক্যারিয়ার, অন্তরের শান্তি সহ সব বিষয়)   */}
          {/* ------------------------------------------------------------- */}
          {activeOption === 'waz' && (
            <motion.div
              key="waz-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="border-b border-zinc-900 pb-3 mb-1 text-left">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  SPIRITUAL COUNSELLING & LECTURES
                </h2>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  Daily counselling to overcome addictions, build channels & glow
                </p>
              </div>

              {!activeLecture ? (
                <div className="space-y-4 text-left">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block pt-0.5">
                    AVAILABLE COUNSELLING TOPICS:
                  </span>

                  {/* Vertically stacked cards matching Screenshot_2026-09-28-23-55-58-038_com.android.chrome.jpg */}
                  <div className="space-y-3">
                    {ALL_LIFE_WAZ_SESSIONS.map((lec) => (
                      <div
                        key={lec.id}
                        onClick={() => handleStartSession(lec)}
                        className="w-full bg-[#0c0d0f] border border-zinc-850 hover:border-emerald-500/40 p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 group cursor-pointer block"
                      >
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                          {lec.topic}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-100 leading-snug">
                          {lec.subtitle}
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-zinc-300 mt-4 block">
                          START SESSION ➔
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ISLAMIC HISTORY SECTION (LOADED WHEN USER CLICKS OR HAS UNLOCKED) */}
                  {showIslamicHistory && (
                    <div id="islamic-history-section" className="pt-5 space-y-3 border-t border-zinc-900 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ইসলামী ইতিহাস ও নবীদের বিপ্লবী জীবন (ISLAMIC HISTORY & SEERAH):
                        </span>
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                          {historyBatch > 1 ? `পর্ব ${historyBatch}` : 'আনলকড'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {ISLAMIC_HISTORY_SESSIONS.slice(0, Math.min(ISLAMIC_HISTORY_SESSIONS.length, Math.max(4, historyBatch * 4))).map((lec) => (
                          <div
                            key={lec.id}
                            onClick={() => handleStartSession(lec)}
                            className="w-full bg-[#0c0d0f] border border-emerald-900/40 hover:border-emerald-500/40 p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 group cursor-pointer block"
                          >
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                              {lec.topic}
                            </span>
                            <h3 className="text-sm font-bold text-zinc-100 leading-snug">
                              {lec.subtitle}
                            </h3>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-zinc-300 mt-4 block">
                              START SESSION ➔
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GREEN TEXT / BUTTON AT THE VERY BOTTOM OF WAZ TAB */}
                  <div className="pt-6 pb-4 flex flex-col items-center justify-center space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowIslamicHistory(true);
                        const nextBatch = historyBatch + 1;
                        setHistoryBatch(nextBatch);
                        try {
                          localStorage.setItem('selfx_show_islamic_history', 'true');
                          localStorage.setItem('selfx_islamic_history_batch', nextBatch.toString());
                          const curCompleted = parseInt(localStorage.getItem('selfx_completed_waz_count') || '1', 10);
                          localStorage.setItem('selfx_completed_waz_count', (curCompleted + 1).toString());
                        } catch (e) {}
                        if (onEarnPoints) {
                          onEarnPoints(50, "Completed Topics & Unlocked Deep Islamic History");
                        }
                        triggerNotification("🕌 আলহামদুলিল্লাহ!", "সবকিছু সম্পন্ন হয়েছে! নতুন ইসলামিক বিষয় ও ইসলামের সোনালী ইতিহাস লোড হয়েছে।");
                        
                        setTimeout(() => {
                          const historyElement = document.getElementById('islamic-history-section');
                          if (historyElement) {
                            historyElement.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_10px_35px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 border border-emerald-300 group"
                    >
                      <CheckCircle2 className="w-5 h-5 text-zinc-950 shrink-0 group-hover:scale-110 transition-transform" />
                      <span>✓ আমার এখানে সবকিছু করা শেষ — নতুন ইসলামিক বিষয় ও ইতিহাস লোড করুন ↻</span>
                    </button>
                    <p className="text-[11px] text-emerald-400 font-mono text-center font-bold">
                      সবগুলো বিষয় শেষ হলে এখানে ক্লিক করুন — স্বয়ংক্রিয়ভাবে নতুন ইসলামিক বিষয় ও ইতিহাসের সেশন লোড হবে।
                    </p>
                  </div>
                </div>
              ) : (
                /* ACTIVE LECTURE ROOM */
                <div className="space-y-4">
                  <div className="bg-zinc-950 border border-emerald-500/30 p-5 rounded-2xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                          {activeLecture.categoryLabel}
                        </span>
                        <h3 className="text-sm font-black text-zinc-100">
                          {activeLecture.subtitle}
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          বক্তা: {activeLecture.speaker}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={activeLecture.videoQueryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          ভিডিও ওয়াজ শুনুন
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveLecture(null);
                            setIsTimerRunning(false);
                          }}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl text-[10px] font-mono"
                        >
                          বন্ধ করুন
                        </button>
                      </div>
                    </div>

                    {/* Hadith / Ayah Quote */}
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl text-emerald-300 text-xs italic font-serif">
                      "{activeLecture.keyAyahOrHadith}"
                    </div>

                    {/* Maulana Advice */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                        মাওলানা নসীহা ও অন্তরের দাওয়াত:
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                        {activeLecture.maulanaAdvice}
                      </p>
                    </div>

                    {/* Actionable Steps */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                        বাস্তব জীবনের ৩টি পদক্ষেপ:
                      </span>
                      <div className="space-y-2">
                        {activeLecture.actions.map((act, i) => (
                          <div key={i} className="bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-xl text-[11px] text-zinc-300 flex items-start gap-2.5 font-sans">
                            <span className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Countdown Timer HUD */}
                  <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl text-center space-y-4">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block">
                        মনোযোগ সহকারে শোনার অবশিষ্ট সময়
                      </span>
                      <h1 className="text-3xl font-mono font-black text-emerald-400 tracking-tight animate-pulse">
                        {formatTime(sessionTimer)}
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {!isSessionCompleted && (
                        <button
                          type="button"
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            isTimerRunning 
                              ? 'bg-zinc-900 text-amber-400 border border-zinc-800' 
                              : 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950'
                          }`}
                        >
                          {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isTimerRunning ? "পজ করুন" : "চালু রাখুন"}
                        </button>
                      )}

                      {isSessionCompleted && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <Award className="w-4 h-4" />
                            সেশন সফলভাবে সম্পন্ন হয়েছে!
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLecture(null);
                              setIsSessionCompleted(false);
                              setSessionTimer(0);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-zinc-950 font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer"
                          >
                            +৫০ এক্সপি পয়েন্ট সংগ্রহ করুন ও ফিরুন
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: DAILY DEEDS (সুন্নাহ আমল ও দৈনন্দিন অভ্যাস)            */}
          {/* ------------------------------------------------------------- */}
          {activeOption === 'deeds' && (
            <motion.div
              key="deeds-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100">
                    Islamic Deeds & Daily Habits
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                    Build mental clarity and blessings with custom and classic daily deeds
                  </p>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {totalDeedsCount} / 5 Completed
                </div>
              </div>

              {/* Standard Deeds List */}
              <div className="space-y-2.5">
                {deeds.map((deed) => {
                  const isCompleted = !!(faith as any)[deed.key];
                  return (
                    <button
                      key={deed.key}
                      type="button"
                      onClick={() => toggleDeed(deed.key)}
                      className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 relative overflow-hidden group ${
                        isCompleted
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-950/40 border-zinc-900 text-zinc-300 hover:bg-zinc-900/20 hover:border-zinc-800'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500" />
                        )}
                      </div>
                      
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block">{deed.label}</span>
                        <p className="text-[10px] text-zinc-400 font-sans">{deed.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic custom deeds section */}
              <div className="pt-4 border-t border-zinc-900 space-y-3">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                  Add custom personal deeds & devotionals:
                </span>
                
                <form onSubmit={handleAddCustomDeed} className="flex gap-2">
                  <input
                    type="text"
                    value={newDeedInput}
                    onChange={(e) => setNewDeedInput(e.target.value)}
                    placeholder="e.g., Read Surah Al-Mulk, Morning Adhkar, Tasbeeh..."
                    className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black text-xs rounded-xl transition-all cursor-pointer font-sans"
                  >
                    + Add
                  </button>
                </form>

                {customDeeds.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-900">
                    {customDeeds.map((deed, index) => {
                      const isCompleted = completedCustomDeeds.includes(deed);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => toggleCustomDeed(deed)}
                            className="flex-1 text-left flex items-center gap-2.5 text-xs font-medium cursor-pointer"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-4.5 h-4.5 rounded-full border border-zinc-800 hover:border-zinc-700 shrink-0" />
                            )}
                            <span className={isCompleted ? 'line-through text-zinc-600 font-sans' : 'text-zinc-300 font-sans'}>{deed}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomDeed(index)}
                            className="p-1 text-zinc-600 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: JANNAT METER (৪ নাম্বার কাতারে প্র্যাকটিক্যাল মিটার)     */}
          {/* ------------------------------------------------------------- */}
          {activeOption === 'meter' && (
            <motion.div
              key="meter-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header Box */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    LIVE JANNAT & DEEN STATUS METER
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    আপনার আসল কাজের (নামাজ, আমল, তওবা) উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে মিটারের রঙ ও স্ট্যাটাস নির্ধারিত হয়
                  </p>
                </div>
                <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 text-[10px] font-mono font-bold">
                  স্কোর: {practicalJannatScore}%
                </div>
              </div>

              {/* REALISTIC HIGH-FIDELITY ILLUMINATED METER CARD */}
              <div className="bg-gradient-to-b from-[#10141a] to-[#0a0d11] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* Glowing Meter Light */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      {meterLight === 'green' && (
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/25 blur-xl animate-pulse" />
                          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 border-4 border-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.9)] flex items-center justify-center text-3xl">
                            🟢
                          </div>
                        </div>
                      )}
                      {meterLight === 'coffee' && (
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-24 h-24 rounded-full bg-amber-600/25 blur-xl animate-pulse" />
                          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-amber-500 via-[#8B5A2B] to-[#5C3A21] border-4 border-amber-300 shadow-[0_0_35px_rgba(217,119,6,0.9)] flex items-center justify-center text-3xl">
                            🟤
                          </div>
                        </div>
                      )}
                      {meterLight === 'red' && (
                        <div className="relative flex items-center justify-center">
                          <div className="absolute w-24 h-24 rounded-full bg-rose-600/35 blur-xl animate-pulse" />
                          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-rose-500 to-red-800 border-4 border-rose-300 shadow-[0_0_35px_rgba(244,63,94,0.9)] flex items-center justify-center text-3xl animate-bounce">
                            🔴
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-0.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">
                        বর্তমান সিগন্যাল বাতি
                      </span>
                      <span className={`text-xs font-black uppercase ${
                        meterLight === 'green' ? 'text-emerald-400' : meterLight === 'coffee' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {meterLight === 'green' ? 'সবুজ বাতি (GREEN)' : meterLight === 'coffee' ? 'কফি কালার (COFFEE)' : 'লাল বাতি (RED)'}
                      </span>
                    </div>
                  </div>

                  {/* Status Diagnosis and Prescription */}
                  <div className="flex-1 space-y-3 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          meterLight === 'green' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          meterLight === 'coffee' ? 'bg-amber-600/15 text-amber-400 border border-amber-600/30' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {meterLight === 'green' ? 'আলহামদুলিল্লাহ' : meterLight === 'coffee' ? 'সতর্কতা' : 'জরুরি সংকেত'}
                        </span>
                        <span className="text-xs font-bold text-zinc-200">
                          {meterLight === 'green' && 'সবকিছু ভালো চলতেছে — জান্নাতের পথে অগ্রগামী!'}
                          {meterLight === 'coffee' && 'ইমপ্রুভ করতে হবে — নামাজ ও আমলে অলসতা দূর করুন!'}
                          {meterLight === 'red' && 'বিপদ সংকেত — দ্রুত তাওবা ও ইস্তিগফার প্রয়োজন!'}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                        {meterLight === 'green' && 'আপনার আজকের নামাজ ও নেক আমল চমৎকারভাবে চালু আছে। রাসুল (সাঃ) বলেছেন: "যে নিয়মিত ফরয নামাজের হেফাজত করে ও পাপ বর্জন করে, জান্নাতের সুউচ্চ প্রাসাদ তার জন্য অপেক্ষা করে।" এই ধারা বজায় রাখুন।'}
                        {meterLight === 'coffee' && 'নামাজে মনোযোগের ঘাটতি বা আমলে অলসতা ঢুকেছে। এখনই প্রতি ওয়াক্ত নামাজের ২ মিনিট আগে জায়নামাজে বসুন। স্ক্রিন টাইম কমিয়ে ১০০ বার "আস্তাগফিরুল্লাহ" পাঠ করুন। বাতি সবুজে রূপ নেবে।'}
                        {meterLight === 'red' && 'দেরি করবেন না! শয়তানের প্রলোভনে নামাজ কাজা বা ভুল হয়ে থাকলে এখনই অজু করে ২ রাকাত সালাতুত তাওবাহ পড়ুন এবং বলুন: "আস্তাগফিরুল্লা হাল্লাজি লা ইলাহা ইল্লা হুয়াল হাইয়্যুল কাইয়্যুমু ওয়া আতূবু ইলাইহ"। আল্লাহ ক্ষমাশীল।'}
                      </p>
                    </div>

                    {/* Progress Bar of Jannat Balance */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>আধ্যাত্মিক ভারসাম্য</span>
                        <span className="font-bold text-zinc-200">{practicalJannatScore}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            meterLight === 'green' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            meterLight === 'coffee' ? 'bg-gradient-to-r from-amber-600 via-[#8B5A2B] to-amber-500' :
                            'bg-gradient-to-r from-rose-600 to-red-500'
                          }`}
                          style={{ width: `${practicalJannatScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* AUTOMATIC ACTIVITY AUDIT (ব্যবহারকারীর কাজের উপর ভিত্তি করে) */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                  স্বয়ংক্রিয় আমল অডিট (আপনার কাজের লাইভ ফলাফল):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">১. নামাজ আদায়</span>
                    <div className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                      <span>{totalPrayersCount} of 6 ওয়াক্ত সম্পন্ন</span>
                      <span className={totalPrayersCount >= 5 ? 'text-emerald-400' : 'text-amber-400'}>
                        {totalPrayersCount >= 5 ? '✓ চমৎকার' : '⚠️ অসম্পূর্ণ'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">২. সুন্নাহ ও জিকির</span>
                    <div className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                      <span>{totalDeedsCount} of 5 আমল সম্পন্ন</span>
                      <span className={totalDeedsCount >= 3 ? 'text-emerald-400' : 'text-zinc-500'}>
                        {totalDeedsCount >= 3 ? '✓ সক্রিয়' : 'বাকি আছে'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">৩. ওয়াজ ও জ্ঞান</span>
                    <div className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                      <span>{completedWazCount > 0 ? 'সেশন শেষ হয়েছে' : 'কোনো সেশন হয়নি'}</span>
                      <span className={completedWazCount > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                        {completedWazCount > 0 ? '✓ সফল' : 'বাকি'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DAILY SELF-RESTRAINT CHECKLIST */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
                  দৈনিক আত্মশুদ্ধি ও বর্জনীয় গুনাহের নিয়ন্ত্রণ (ক্লিক করে সেট করুন):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleMeterCheck('lowerGaze')}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                      meterChecklist.lowerGaze 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                    }`}
                  >
                    <span>👁️ চোখের হেফাজত করেছি (পর্ন ও নিষিদ্ধ জিনিস বর্জন)</span>
                    <span className="font-mono font-bold">{meterChecklist.lowerGaze ? '+10%' : '0%'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleMeterCheck('parentsPleasure')}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                      meterChecklist.parentsPleasure 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                    }`}
                  >
                    <span>❤️ পিতা-মাতার সন্তুষ্টি ও উত্তম আচরণ করেছি</span>
                    <span className="font-mono font-bold">{meterChecklist.parentsPleasure ? '+8%' : '0%'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleMeterCheck('hadMissedPrayer')}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                      meterChecklist.hadMissedPrayer 
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                    }`}
                  >
                    <span>⚠️ [বর্জনীয়] নামাজ কাজা বা অলসতা করে দেরি করেছি</span>
                    <span className="font-mono">{meterChecklist.hadMissedPrayer ? '-30%' : 'না'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleMeterCheck('hadGazeViolation')}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                      meterChecklist.hadGazeViolation 
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                    }`}
                  >
                    <span>🚫 [বর্জনীয়] মোবাইলে কুদৃষ্টি বা গুনাহর জিনিস দেখেছি</span>
                    <span className="font-mono">{meterChecklist.hadGazeViolation ? '-25%' : 'না'}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
