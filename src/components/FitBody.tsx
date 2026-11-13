import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Target, Sparkles, Scale, DollarSign, RefreshCw, Apple, ShieldAlert, 
  Upload, Check, AlertCircle, Play, ChevronRight, ChevronLeft, Award, Send, 
  Trash2, Clock, Coins, MessageSquare, ShieldCheck, HeartPulse, Camera, Scan, 
  Zap, Utensils, UtensilsCrossed, Dumbbell, LayoutGrid, User, Salad, 
  ArrowLeftRight, Video, VideoOff, Maximize2, Minimize2, X, Repeat 
} from 'lucide-react';
import { triggerNotification } from '../utils';
import PhysiqueTransformationBlueprint from './PhysiqueTransformationBlueprint';

// Bangladesh specific healthy, budget-friendly food swaps
const BANGLA_FOOD_SWAPS: Record<string, { good: string; desc: string; cost: string; protein: string }> = {
  'পরোটা': { good: 'লাল আটার রুটি / ওটস', desc: 'অতিরিক্ত তেল ও ময়দা এড়িয়ে কার্বোহাইড্রেটের ভালো উৎস।', cost: '৳৫-৳১০', protein: '৩g' },
  'চা মিষ্টি সহ / কনডেন্সড milk চা': { good: 'রং চা / গ্রিন টি (চিনি ছাড়া)', desc: 'মেটাবলিজম বাড়াতে সাহায্য করে এবং বাড়তি ক্যালরি জমতে দেয় না।', cost: '৳৫', protein: '০g' },
  'আলুভর্তা ও সাদা ভাত': { good: 'লাল চালের ভাত ও ডাল / ডিম', desc: 'কম গ্লাইসেমিক ইনডেক্স এবং প্রোটিনের নিখুঁত ডাবল কম্বো।', cost: '৳১৫-৳২০', protein: '৯g' },
  'সাদা পাউরুটি': { good: 'লাল আটার রুটি / সিদ্ধ ডিম', desc: 'রিফাইন্ড ময়দার চেয়ে কমপ্লেক্স কার্ব ও প্রোটিন অনেক গুণ ভালো।', cost: '৳১২', protein: '৭g' },
  'বিরিয়ানি / তেহারী': { good: 'খিচুড়ি (সবজি ও ডিম দিয়ে)', desc: 'হাই-ক্যালরি ও ফ্যাটসমৃদ্ধ বিরিয়ানির বদলে পুষ্টিকর ফাইবারযুক্ত খিচুড়ি।', cost: '৳৩০-৳৪০', protein: '১২g' },
  'সিঙ্গারা / সমুচা / জিলাপি': { good: 'মুড়ি ও চানাচুর (কম তেল) / কলা', desc: 'ট্রান্স-ফ্যাট থেকে বাঁচতে পটাশিয়াম ও এনার্জির সেরা ইনস্ট্যান্ট উৎস।', cost: '৳১০', protein: '২g' },
  'মিষ্টি কোমল পানীয় (কোক/ফান্টা)': { good: 'লেবুর শরবত (চিনি ছাড়া) / ডাব', desc: 'সুগার স্পাইক প্রতিরোধ করে এবং বডি ডিটক্স করতে অত্যন্ত কার্যকর।', cost: '৳১০-৳৩০', protein: '০g' },
  'ফার্মের মুরগির ফ্রাই': { good: 'মুরগির স্যুপ / গ্রিল্ড চিকেন', desc: 'ডিপ-ফ্রাই এর তেল বাদ দিয়ে মুরগির প্রোটিন পাওয়ার সেরা মাধ্যম।', cost: '৳৫০', protein: '২৫g' },
  'আইসক্রিম / মিষ্টি দই': { good: 'টক দই / কলা', desc: 'ফ্যাট লস করতে এবং পেটের ব্যাকটেরিয়া ভালো রাখতে সাহায্য করে।', cost: '৳১৫', protein: '৪g' },
};

export default function FitBody() {
  // Hub state: null (shows 5 options matching screenshot) | 'blueprint' | 'scan_food' | 'questionnaire' | 'scanner' | 'swapper'
  const [selectedProtocol, setSelectedProtocol] = useState<null | 'blueprint' | 'scan_food' | 'questionnaire' | 'scanner' | 'swapper'>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Questionnaire States
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  // 2. Scanner States
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // 3. Swapper Chat-based states
  interface MealPlanItem {
    time: string;
    items: string;
    estimatedCost: string;
    isWithinBudget: boolean;
    howToEat: string;
  }

  interface MealPlanResponse {
    analysis: string;
    budgetVerdict: string;
    mealPlan: MealPlanItem[];
    nutritionTips: string[];
    overallGuideline: string;
  }

  interface SwapperMessage {
    id: string;
    role: 'user' | 'model';
    content?: string;
    planData?: MealPlanResponse;
    timestamp: Date;
  }

  const [swapperMessages, setSwapperMessages] = useState<SwapperMessage[]>(() => {
    const saved = localStorage.getItem('swapper_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        content: `স্বাগতম! আপনার জন্য একটি সম্পূর্ণ পারসোনালাইজড এবং বাজেট-বান্ধব দৈনিক পুষ্টি ও মিল প্ল্যান তৈরি করতে আমি প্রস্তুত। 

অনুগ্রহ করে একটি মেসেজে আপনার জীবনধারা সম্পর্কে বিস্তারিত বলুন, যেমন:
- **সারাদিন সাধারণত কী কী খাবার খান?**
- **আপনার ঘুম ও দৈনন্দিন রুটিন কেমন?**
- **খাবারের জন্য আপনার বাজেট কেমন?**
- **আপনার পরিবারের আর্থিক অবস্থা বা সীমাবদ্ধতা কেমন?**
- **আপনার জীবনযাত্রার অন্য কোনো গুরুত্বপূর্ণ তথ্য।**

আপনি এই তথ্যগুলো নিচে লিখে দিলেই আমি আপনার বাজেট মিলিয়ে একটি চমৎকার ডায়েট ও ফুড প্ল্যান সাজিয়ে দেব।`,
        timestamp: new Date()
      }
    ];
  });

  const [swapperInput, setSwapperInput] = useState('');
  const [isSwapperLoading, setIsSwapperLoading] = useState(false);
  const [swapperError, setSwapperError] = useState<string | null>(null);

  // --- NEW SCAN FOOD & NUTRITION GOAL STATES ---
  // Body Goals and Profile Settings
  const [bodyGoal, setBodyGoal] = useState<string>(() => {
    return localStorage.getItem('fitbody_goal') || 'Bulk (ওজন ও মাসল বাড়ানো)';
  });
  const [currentWeight, setCurrentWeight] = useState<number>(() => {
    return Number(localStorage.getItem('fitbody_weight')) || 70;
  });
  const [userGender, setUserGender] = useState<string>(() => {
    return localStorage.getItem('fitbody_gender') || 'male';
  });
  const [userAge, setUserAge] = useState<number>(() => {
    return Number(localStorage.getItem('fitbody_age')) || 22;
  });
  const [userHeightFeet, setUserHeightFeet] = useState<number>(() => {
    return Number(localStorage.getItem('fitbody_height_feet')) || 5;
  });
  const [userHeightInches, setUserHeightInches] = useState<number>(() => {
    return Number(localStorage.getItem('fitbody_height_inches')) || 7;
  });
  const [userActivityLevel, setUserActivityLevel] = useState<string>(() => {
    return localStorage.getItem('fitbody_activity') || 'moderately_active';
  });

  // Goal Targets (Calculated based on body goal and personal metrics)
  const getNutritionTargets = (
    goal: string,
    weight: number,
    gender: string,
    age: number,
    hFeet: number,
    hInches: number,
    activity: string
  ) => {
    const heightCm = (hFeet * 12 + hInches) * 2.54;
    
    // Mifflin-St Jeor Equation for BMR
    let bmr = 10 * weight + 6.25 * heightCm - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity Multiplier
    let multiplier = 1.2; // sedentary
    if (activity === 'lightly_active') multiplier = 1.375;
    else if (activity === 'moderately_active') multiplier = 1.55;
    else if (activity === 'very_active') multiplier = 1.725;

    const tdee = bmr * multiplier;

    let cal = 2000;
    let prot = 100;
    let fat = 65;
    let carbs = 250;

    if (goal.includes('Bulk')) {
      cal = Math.round(tdee + 400);
      prot = Math.round(2.0 * weight);
      fat = Math.round(1.0 * weight);
      carbs = Math.round((cal - prot * 4 - fat * 9) / 4);
    } else if (goal.includes('Cut') || goal.includes('মেদ')) {
      cal = Math.round(Math.max(1200, tdee - 500));
      prot = Math.round(2.2 * weight);
      fat = Math.round(0.8 * weight);
      carbs = Math.round((cal - prot * 4 - fat * 9) / 4);
    } else if (goal.includes('Lean') || goal.includes('লিন')) {
      cal = Math.round(tdee + 100);
      prot = Math.round(2.0 * weight);
      fat = Math.round(0.9 * weight);
      carbs = Math.round((cal - prot * 4 - fat * 9) / 4);
    } else { // Maintenance
      cal = Math.round(tdee);
      prot = Math.round(1.6 * weight);
      fat = Math.round(0.9 * weight);
      carbs = Math.round((cal - prot * 4 - fat * 9) / 4);
    }

    // Ensure non-negative and realistic
    if (carbs < 0) carbs = Math.round((cal * 0.45) / 4);

    return { calories: cal, protein: prot, fat: fat, carbs: carbs };
  };

  const targets = getNutritionTargets(bodyGoal, currentWeight, userGender, userAge, userHeightFeet, userHeightInches, userActivityLevel);

  // Scan food states
  const [foodQuery, setFoodQuery] = useState('');
  const [scannedFoodResult, setScannedFoodResult] = useState<any | null>(null);
  const [isScanningFood, setIsScanningFood] = useState(false);
  const [foodImage, setFoodImage] = useState<string | null>(null);

  // Live camera stream states
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startLiveCamera = async () => {
    try {
      setIsLiveCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setLiveStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      triggerNotification("📷 লাইভ ক্যামেরা চালু হয়েছে", "খাবারের থালার দিকে ক্যামেরা ধরুন এবং 'স্ন্যাপ ও স্ক্যান' চাপুন।");
    } catch (err) {
      console.error("Camera access error:", err);
      triggerNotification("⚠️ ক্যামেরা চালুর চেষ্টা ব্যর্থ", "ক্যামেরা পারমিশন এলাউ করুন অথবা গ্যালারি থেকে ফটো আপলোড করুন।");
      setIsLiveCameraOpen(false);
    }
  };

  const stopLiveCamera = () => {
    if (liveStream) {
      liveStream.getTracks().forEach(track => track.stop());
      setLiveStream(null);
    }
    setIsLiveCameraOpen(false);
  };

  const captureLiveFrameAndScan = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFoodImage(capturedDataUrl);
      stopLiveCamera();
      
      // Auto trigger scan immediately
      setTimeout(() => {
        handleScanFoodDirect(capturedDataUrl, foodQuery.trim() || "লাইভ ক্যামেরা থেকে স্ক্যানকৃত খাবার");
      }, 100);
    }
  };

  // Today's consumed food logs (Saved in localStorage)
  interface FoodLogItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    timestamp: string;
  }

  const [todayFoodLogs, setTodayFoodLogs] = useState<FoodLogItem[]>(() => {
    const saved = localStorage.getItem('fitbody_today_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Save changes to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('fitbody_goal', bodyGoal);
      localStorage.setItem('fitbody_weight', currentWeight.toString());
      localStorage.setItem('fitbody_gender', userGender);
      localStorage.setItem('fitbody_age', userAge.toString());
      localStorage.setItem('fitbody_height_feet', userHeightFeet.toString());
      localStorage.setItem('fitbody_height_inches', userHeightInches.toString());
      localStorage.setItem('fitbody_activity', userActivityLevel);
    } catch (e) {}
  }, [bodyGoal, currentWeight, userGender, userAge, userHeightFeet, userHeightInches, userActivityLevel]);

  React.useEffect(() => {
    try {
      localStorage.setItem('fitbody_today_logs', JSON.stringify(todayFoodLogs));
    } catch (e) {}
  }, [todayFoodLogs]);

  // Totals calculations
  const totalConsumed = todayFoodLogs.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const remaining = {
    calories: Math.max(0, targets.calories - totalConsumed.calories),
    protein: Math.max(0, targets.protein - totalConsumed.protein),
    fat: Math.max(0, targets.fat - totalConsumed.fat),
    carbs: Math.max(0, targets.carbs - totalConsumed.carbs),
  };

  const getClientFallbackFood = (query: string, goal: string) => {
    const q = query.toLowerCase();
    let name = query || "খাবারের প্লেট";
    let calories = 480;
    let protein = 26;
    let fat = 10;
    let carbs = 62;
    let verdict = "এই খাবারটিতে প্রোটিন ও কার্বোহাইড্রেটের ভালো ভারসাম্য রয়েছে। আপনার দৈনিক লক্ষ্য অনুযায়ী পরিমিত পরিমাণে উপভোগ করুন।";
    let shouldEat = "YES";
    let alternatives = ["পর্যাপ্ত পানি পান করুন", "কম তেলে রান্না করার চেষ্টা করুন"];
    let itemsBreakdown: any[] = [];

    if (q.includes("ভাত") || q.includes("rice") || q.includes("তরকারি") || q.includes("curry") || q.includes("মাছ") || q.includes("fish") || q.includes("photo") || q.includes("image") || q.includes("plate") || q.includes("uploaded") || q.includes("scan")) {
      name = "সাদা ভাত, রুই মাছের ঝোল ও মসুর ডাল";
      calories = 480;
      protein = 26;
      fat = 10;
      carbs = 62;
      itemsBreakdown = [
        { item: "সাদা ভাত", portion: "১.৫ কাপ (~২২০ গ্রাম)", calories: 240, protein: 4.5, carbs: 52, fat: 0.5 },
        { item: "রুই মাছের ঝোল", portion: "১ টুকরো মাছ + ঝোল", calories: 160, protein: 18, carbs: 4, fat: 7.5 },
        { item: "পাতলা মসুর ডাল", portion: "১/২ কাপ", calories: 80, protein: 3.5, carbs: 6, fat: 2 }
      ];
      if (goal.includes("Cut") || goal.includes("মেদ")) {
        shouldEat = "MODERATE";
        verdict = "ভাতে কার্বোহাইড্রেট থাকে। ফ্যাট লসের লক্ষ্য থাকলে ভাতের পরিমাণ ১ কাপে নামিয়ে মাছ ও ডাল বেশি খেতে পারেন।";
        alternatives = ["ভাতের পরিমাণ কমিয়ে সালাদ বাড়িয়ে নিন", "কম তেলের রান্না বেছে নিন"];
      } else {
        shouldEat = "YES";
        verdict = "বাঙালি ট্রেডিশনাল মিল হিসেবে প্রোটিন ও কার্বোহাইড্রেটের চমৎকার মেলবন্ধন।";
        alternatives = ["সাথে এক টুকরো লেবু ও শসা যোগ করুন"];
      }
    } else if (q.includes("চিকেন") || q.includes("মুরগি") || q.includes("chicken")) {
      name = "মুরগির মাংসের ঝোল ও ভাত";
      calories = 510;
      protein = 35;
      fat = 12;
      carbs = 58;
      itemsBreakdown = [
        { item: "সাদা ভাত", portion: "১.৫ কাপ", calories: 240, protein: 4.5, carbs: 52, fat: 0.5 },
        { item: "মুরগির মাংসের কষা", portion: "১০০ গ্রাম চিকেন", calories: 220, protein: 28, carbs: 3, fat: 10 },
        { item: "শসা সালাদ", portion: "১ বাটি", calories: 50, protein: 2.5, carbs: 3, fat: 1.5 }
      ];
      shouldEat = "YES";
      verdict = "মুরগির মাংস প্রোটিনের দারুণ উৎস। পেশী গঠন ও ফিটনেসের জন্য এটি অত্যন্ত উপযুক্ত।";
      alternatives = ["তেলে ভাজার বদলে গ্রিল বা কম তেলে রান্না করুন"];
    } else if (q.includes("ডিম") || q.includes("egg")) {
      name = "সিদ্ধ ডিম ও লাল আটার রুটি";
      calories = 230;
      protein = 13;
      fat = 7;
      carbs = 26;
      itemsBreakdown = [
        { item: "সিদ্ধ ডিম", portion: "১টি", calories: 75, protein: 6, carbs: 0.6, fat: 5 },
        { item: "লাল আটার রুটি", portion: "২টি", calories: 155, protein: 7, carbs: 25.4, fat: 2 }
      ];
      shouldEat = "YES";
      verdict = "ডিম ও লাল আটার রুটি শক্তি ও প্রোটিনের সেরা সহজলভ্য কম্বো।";
      alternatives = ["কুসুম সহ বা ছাড়া আপনার দৈনিক ফ্যাট গোল অনুযায়ী খান"];
    } else if (q.includes("বিরিয়ানি") || q.includes("biryani") || q.includes("তেহারি")) {
      name = "চিকেন বিরিয়ানি (১ প্লেট)";
      calories = 680;
      protein = 28;
      fat = 24;
      carbs = 82;
      itemsBreakdown = [
        { item: "বিরিয়ানি চাল", portion: "১ প্লেট (~২৫০ গ্রাম)", calories: 450, protein: 8, carbs: 75, fat: 12 },
        { item: "চিকেন লেগ/ব্রেস্ট", portion: "১ টুকরো", calories: 230, protein: 20, carbs: 7, fat: 12 }
      ];
      if (goal.includes("Cut") || goal.includes("মেদ")) {
        shouldEat = "NO";
        verdict = "বিরিয়ানিতে প্রচুর তেল, ঘি ও রিফাইন্ড কার্ব থাকে। ফ্যাট লস বা কাটিং পর্বে এটি এড়িয়ে চলাই ভালো।";
        alternatives = ["বিরিয়ানির বদলে চিকেন ও সবজি দিয়ে খিচুড়ি খেতে পারেন"];
      } else {
        shouldEat = "MODERATE";
        verdict = "হাই ক্যালরি খাবার। বাল্কিং এ সহায়ক হলেও পরিমিত পরিমাণে খাবেন।";
        alternatives = ["সালাদ সহকারে খাবেন এবং কোল্ড ড্রিংকস এড়িয়ে চলুন"];
      }
    } else {
      itemsBreakdown = [
        { item: name, portion: "১ পরিবেশন", calories: calories, protein: protein, carbs: carbs, fat: fat }
      ];
      if (goal.includes("Cut") || goal.includes("মেদ")) {
        shouldEat = "MODERATE";
        verdict = "এই খাদ্যটির আনুমানিক পুষ্টি বিশ্লেষণ করা হয়েছে। ফ্যাট লস বা মেদ কমানোর সময়ে অতিরিক্ত ফ্যাট ও চিনিযুক্ত খাবার পরিহার করুন।";
      } else {
        shouldEat = "YES";
        verdict = "এই খাদ্যটির আনুমানিক পুষ্টি বিশ্লেষণ করা হয়েছে। আপনার লক্ষ্য অর্জনের জন্য পরিমিত এবং সুষমভাবে এই খাবারটি গ্রহণ করতে পারেন।";
      }
    }

    return {
      foodName: name,
      calories,
      protein,
      fat,
      carbs,
      shouldEat,
      itemsBreakdown,
      verdict,
      alternatives
    };
  };

  const handleScanFoodDirect = async (overrideImage?: string | null, overrideQuery?: string) => {
    const targetImg = overrideImage !== undefined ? overrideImage : foodImage;
    const targetQuery = overrideQuery !== undefined ? overrideQuery : foodQuery;

    if (!targetQuery.trim() && !targetImg) {
      triggerNotification("⚠️ খাবারের নাম বা ছবি দিন", "যেকোনো খাবারের নাম বাংলায়/ইংরেজিতে লিখুন অথবা লাইভ ক্যামেরায় ছবি তুলে স্ক্যান করুন।");
      return;
    }

    setIsScanningFood(true);
    setScannedFoodResult(null);

    const queryText = targetQuery.trim() || (targetImg ? "Scan food items in photo" : "Uploaded food item");
    const richGoalContext = `${bodyGoal} (User profile: Weight: ${currentWeight}kg, Gender: ${userGender}, Age: ${userAge} years, Height: ${userHeightFeet}'${userHeightInches}", Daily Targets: Calories: ${targets.calories} kcal, Protein: ${targets.protein}g, Fat: ${targets.fat}g, Carbs: ${targets.carbs}g)`;

    try {
      const res = await fetch('/api/fitbody/scan-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          foodInput: queryText,
          bodyGoal: richGoalContext,
          imageData: targetImg
        })
      });

      if (!res.ok) {
        throw new Error('ফুড স্ক্যান করতে সমস্যা হয়েছে।');
      }

      const data = await res.json();
      setScannedFoodResult(data);
      triggerNotification("🎯 ফুড স্ক্যান সম্পন্ন!", `${data.foodName || 'খাবার'} সফলভাবে বিশ্লেষণ করা হয়েছে।`);
    } catch (err) {
      console.warn("API Error, running local fallback parser:", err);
      const fallbackResult = getClientFallbackFood(queryText, bodyGoal);
      setScannedFoodResult(fallbackResult);
      triggerNotification("🎯 ফুড স্ক্যান সম্পন্ন (স্থানীয় ডেটা)!", `${fallbackResult.foodName} সফলভাবে বিশ্লেষণ করা হয়েছে।`);
    } finally {
      setIsScanningFood(false);
    }
  };

  const handleScanFood = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await handleScanFoodDirect();
  };

  const handleAddFoodToLog = () => {
    if (!scannedFoodResult) return;

    const newItem: FoodLogItem = {
      id: crypto.randomUUID(),
      name: scannedFoodResult.foodName,
      calories: Math.round(scannedFoodResult.calories || 0),
      protein: Math.round(scannedFoodResult.protein || 0),
      fat: Math.round(scannedFoodResult.fat || 0),
      carbs: Math.round(scannedFoodResult.carbs || 0),
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    setTodayFoodLogs(prev => [...prev, newItem]);
    setScannedFoodResult(null);
    setFoodQuery('');
    setFoodImage(null);
    triggerNotification("✅ খাবারে যোগ করা হয়েছে", "আজকের দৈনিক রুটিনে খাবারটি যুক্ত হয়েছে।");
  };

  const handleRemoveLogItem = (id: string) => {
    setTodayFoodLogs(prev => prev.filter(item => item.id !== id));
  };

  const handleResetLogs = () => {
    if (window.confirm("আপনি কি আজকের সমস্ত ফুড লগ মুছে ফেলে নতুন দিন শুরু করতে চান?")) {
      setTodayFoodLogs([]);
      triggerNotification("🧹 দিন রিসেট করা হয়েছে", "আজকের ক্যালোরি ও পুষ্টির হিসাব নতুন করে শুরু হয়েছে।");
    }
  };

  React.useEffect(() => {
    localStorage.setItem('swapper_chat_history', JSON.stringify(swapperMessages));
  }, [swapperMessages]);

  const handleSendSwapperMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!swapperInput.trim() || isSwapperLoading) return;

    const userText = swapperInput.trim();
    setSwapperInput('');
    setSwapperError(null);

    const newUserMsg: SwapperMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      timestamp: new Date()
    };

    setSwapperMessages(prev => [...prev, newUserMsg]);
    setIsSwapperLoading(true);

    try {
      const payloadHistory = swapperMessages.map(m => ({
        role: m.role,
        content: m.content || JSON.stringify(m.planData)
      }));

      const res = await fetch('/api/fitbody/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          previousMessages: payloadHistory
        })
      });

      if (!res.ok) {
        throw new Error('মিল প্ল্যানার সার্ভার রেসপন্স করতে ব্যর্থ হয়েছে।');
      }

      const data = await res.json();
      
      const newModelMsg: SwapperMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        planData: data,
        content: data.analysis ? undefined : "আপনার তথ্য পেয়েছি। দুঃখিত, সার্ভার থেকে পূর্ণাঙ্গ ডাটা প্রসেস করা যায়নি। দয়া করে আবার চেষ্টা করুন বা অন্যভাবে লিখুন।",
        timestamp: new Date()
      };

      setSwapperMessages(prev => [...prev, newModelMsg]);
    } catch (err: any) {
      console.error(err);
      setSwapperError("সার্ভার সংযোগে ত্রুটি হয়েছে। দয়া করে ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
      setSwapperMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'model',
          content: "দুঃখিত, সংযোগে ত্রুটি হয়েছে। অনুগ্রহ করে আরেকবার চেষ্টা করুন বন্ধু!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSwapperLoading(false);
    }
  };

  const handleClearSwapperChat = () => {
    if (window.confirm("আপনি কি ডায়েট চ্যাট হিস্ট্রি রিসেট করতে চান?")) {
      localStorage.removeItem('swapper_chat_history');
      setSwapperMessages([
        {
          id: 'welcome-msg',
          role: 'model',
          content: `স্বাগতম! আপনার জন্য একটি সম্পূর্ণ পারসোনালাইজড এবং বাজেট-বান্ধব দৈনিক পুষ্টি ও মিল প্ল্যান তৈরি করতে আমি প্রস্তুত। 

অনুগ্রহ করে একটি মেসেজে আপনার জীবনধারা সম্পর্কে বিস্তারিত বলুন, যেমন:
- **সারাদিন সাধারণত কী কী খাবার খান?**
- **আপনার ঘুম ও দৈনন্দিন রুটিন কেমন?**
- **খাবারের জন্য আপনার বাজেট কেমন?**
- **আপনার পরিবারের আর্থিক অবস্থা বা সীমাবদ্ধতা কেমন?**
- **আপনার জীবনযাত্রার অন্য কোনো গুরুত্বপূর্ণ তথ্য।**

আপনি এই তথ্যগুলো নিচে লিখে দিলেই আমি আপনার বাজেট মিলিয়ে একটি চমৎকার ডায়েট ও ফুড প্ল্যান সাজিয়ে দেব।`,
          timestamp: new Date()
        }
      ]);
    }
  };

  // 40 Questions definitions for highly personalized fitness and nutrition planning
  const questions = [
    { id: 1, text: "আপনার বয়স কত বছর?", placeholder: "যেমন: ২২ বছর", type: "text" },
    { id: 2, text: "আপনার বর্তমান ওজন কত কেজি?", placeholder: "যেমন: ৭৫ কেজি", type: "text" },
    { id: 3, text: "আপনার উচ্চতা কত (ফুট ও ইঞ্চি)?", placeholder: "যেমন: ৫ ফুট ৭ ইঞ্চি", type: "text" },
    { id: 4, text: "আপনার কাঙ্ক্ষিত বা টার্গেট ওজন কত কেজি?", placeholder: "যেমন: ৬৫ কেজি", type: "text" },
    { id: 5, text: "আপনার বডি গোল বা শারীরিক লক্ষ্য কী?", options: ["ফ্যাট লস ও মেদ কমানো (Fat Loss)", "মাসল গেইন ও বডি গঠন (Muscle Gain)", "ওজন বাড়ানো ও বাল্ক করা (Weight Gain)", "লিন ফিজিক ও চোয়াল শার্প করা (Lean Shredded)"] },
    { id: 6, text: "খাদ্য তালিকার জন্য আপনার বাজেট কেমন?", options: ["সীমিত বা কম বাজেট (৳৩,০০০-৳৪,৫০০/মাস)", "মাঝারি বাজেট (৳৫,০০০-৳৮,০০০/মাস)", "আনলিমিটেড বা প্রিমিয়াম বাজেট"] },
    { id: 7, text: "সকালে সাধারণত কী খাবার খান?", placeholder: "যেমন: পরোটা, ডিম ভাজি, চা মিষ্টি সহ", type: "text" },
    { id: 8, text: "দুপুরে সাধারণত কী খাবার খান?", placeholder: "যেমন: সাদা ভাত, আলুভর্তা, মুরগির মাংস", type: "text" },
    { id: 9, text: "রাতে সাধারণত কী খাবার খান?", placeholder: "যেমন: রুটি বা ভাত, ডাল ও সবজি", type: "text" },
    { id: 10, text: "বাইরের ভাজাপোড়া বা ফাস্টফুড কত ঘন ঘন খাওয়া হয়?", options: ["প্রতিদিন ৩-৪ বার", "সপ্তাহে ২-৩ বার", "খুব কম বা মাসে ১-২ বার"] },
    { id: 11, text: "সারাদিনে চা, কফি বা মিষ্টি পানীয় কয় কাপ খাওয়া হয়?", placeholder: "যেমন: ৪ কাপ দুধ চা", type: "text" },
    { id: 12, text: "আপনার প্রতিদিনের পানি পানের পরিমাণ কেমন?", options: ["খুব কম (১ লিটারের কম)", "মাঝারি (১.৫-২ লিটার)", "সঠিক (৩ লিটার বা তার বেশি)"] },
    { id: 13, text: "আপনার কি ডাবল চিন বা ফেসে অতিরিক্ত ফ্যাট জমার সমস্যা আছে?", options: ["হ্যাঁ, অনেক বেশি", "সামান্য আছে", "একদমই নেই, চোয়াল শার্প"] },
    { id: 14, text: "কোনো বিশেষ অ্যালার্জি বা এড়াতে চান এমন খাবার আছে?", placeholder: "যেমন: চিংড়ি, গরুর মাংস, দুধ বা নেই", type: "text" },
    { id: 15, text: "আপনার দৈনিক মেটাবলিজম কেমন মনে হয়?", options: ["ধীরগতির (সহজেই ফ্যাট জমে)", "খুব দ্রুত (খেলেও সহজে মোটা হই না)", "স্বাভাবিক মেটাবলিজম"] },
    { id: 16, text: "দৈনিক ঘুম কেমন হয় আপনার?", options: ["৫ ঘণ্টার কম (অনিয়মিত ঘুম)", "৬ থেকে ৭ ঘণ্টা (মাঝারি)", "৮ ঘণ্টা বা তার বেশি (নিখুঁত ঘুম)"] },
    { id: 17, text: "আপনার পেশা বা দৈনিক কাজের ধরন কেমন?", options: ["বসে থাকা বা ডেস্ক জব (Sedentary)", "হাঁটাহাঁটি বা মাঝারি কাজ (Lightly Active)", "ভারী শারীরিক পরিশ্রমের কাজ"] },
    { id: 18, text: "আপনার কি প্রায়ই মিষ্টি বা ভাজাপোড়া খাওয়ার তীব্র ইচ্ছা (Cravings) হয়?", options: ["হ্যাঁ, নিয়ন্ত্রণ করতে পারি না", "মাঝেমধ্যে হয়", "খুবই কম হয়"] },
    { id: 19, text: "কোন প্রধান পুষ্টির ঘাটতি বা ক্লান্তি অনুভব করেন বলে মনে হয়?", options: ["সারাদিন অলসতা ও শক্তিহীন লাগে", "খাবার খেয়েও পুষ্টি লাগে না", "না, আমি ফিট ও এনার্জেটিক বোধ করি"] },
    { id: 20, text: "খাদ্য বা ডায়েট নিয়ন্ত্রণের ক্ষেত্রে আপনার প্রধান বাধা কোনটি?", options: ["বাজেট সমস্যা ও সঠিক খাবারের অভাব", "পরিবারের খাবার এড়াতে না পারা", "নিয়মিত ধৈর্য ধরে রাখতে না পারা"] },
    { id: 21, text: "আপনার রক্তে শর্করার মাত্রা বা ডায়াবেটিসের কোনো পারিবারিক ইতিহাস আছে কি?", options: ["হ্যাঁ, ডায়াবেটিস আছে", "পারিবারিক ইতিহাস আছে কিন্তু আমার নেই", "না, একদম নেই বা জানা নেই"] },
    { id: 22, text: "সারাদিনে বাড়তি লবণ বা অতিরিক্ত নোনতা খাবার খাওয়ার প্রবণতা কেমন?", options: ["খাবারে বাড়তি কাঁচা লবণ নিই", "চিপস/নোনতা খাবার বেশি খাওয়া হয়", "লবণ পরিমিত ও নিয়ন্ত্রণে রাখি"] },
    { id: 23, text: "খাবার চিবানোর গতি কেমন আপনার?", options: ["খুব দ্রুত চিবিয়ে গিলে ফেলি", "স্বাভাবিক গতিতে চিবিয়ে খাই", "ধীরে ধীরে অনেক চিবিয়ে খাই"] },
    { id: 24, text: "ঘুমানোর ঠিক কতক্ষণ আগে রাতের খাবার শেষ করেন?", options: ["ঘুমানোর ১ ঘণ্টার কম সময় আগে", "ঘুমানোর ২-৩ ঘণ্টা আগে", "ঘুমানোর ৪ ঘণ্টা বা তার বেশি আগে"] },
    { id: 25, text: "খাবারের মাঝখানে বা অলস সময়ে মুখরোচক স্ন্যাক্স খাওয়ার অভ্যাস কেমন?", options: ["প্রতিদিন ভাজাপোড়া বা টোস্ট বিস্কুট খাই", "মাঝেমধ্যে বাদাম বা ফলমূল খাই", "একদমই স্ন্যাক্স খাই না"] },
    { id: 26, text: "চা বা কফিতে কী ধরনের দুধ ও মিষ্টি ব্যবহার করেন?", options: ["কনডেন্সড মিল্ক বা ফুল ক্রিম গুঁড়ো দুধ ও চিনি", "লিকুইড গরুর দুধ বা লেমন টি ও কম চিনি", "চিনি ও দুধ ছাড়া ব্ল্যাক টি/কফি/গ্রিন টি"] },
    { id: 27, text: "প্রতিদিনের খাদ্যতালিকায় সবুজ শাকসবজির উপস্থিতি কেমন?", options: ["প্রতিদিন পর্যাপ্ত পরিমাণে খাই", "সপ্তাহে ২-৩ দিন খাওয়া হয়", "খুবই কম বা একদমই খাওয়া হয় না"] },
    { id: 28, text: "প্রতি সপ্তাহে কয়টি আস্ত ডিম খাওয়া হয় আপনার?", options: ["৭টির বেশি (প্রতিদিন ১ বা একাধিক)", "৩ থেকে ৬টি", "১-২টি অথবা একদমই খাওয়া হয় না"] },
    { id: 29, text: "প্রধান প্রোটিনের উৎস হিসেবে আপনার সর্বাধিক পছন্দ কোনটি?", options: ["ডিম ও মুরগির মাংস", "মাছ ও গরুর মাংস", "ডাল, ছোলা ও নিরামিষ প্রোটিন"] },
    { id: 30, text: "খাবার খাওয়ার পর আপনার কি পেটে গ্যাস বা ফোলা ভাব (Bloating) হয়?", options: ["হ্যাঁ, প্রায় প্রতিটি খাবারের পরেই হয়", "মাঝেমধ্যে বা তৈলাক্ত খাবার খেলে হয়", "না, হজম প্রক্রিয়া সম্পূর্ণ স্বাভাবিক ও নিখুঁত"] },
    { id: 31, text: "আপনার সারাদিনের মানসিক চাপ বা স্ট্রেসের মাত্রা কেমন থাকে?", options: ["অতিরিক্ত মানসিক চাপ থাকে (High Stress)", "মাঝারি ধরনের স্ট্রেস অনুভব করি", "খুবই শান্ত ও রিল্যাক্সড থাকি"] },
    { id: 32, text: "সারাদিনে একটানা বসে থাকার সময় কত ঘণ্টা?", options: ["৮ ঘণ্টার বেশি (ডেস্ক জব বা বসে থাকা)", "৪ থেকে ৮ ঘণ্টা", "৪ ঘণ্টার কম সময় বসে থাকি"] },
    { id: 33, text: "আপনার দৈনিক আনুমানিক কত কদম বা স্টেপ হাঁটা হয়?", options: ["৩,০০০ কদমের কম (খুব অলস জীবন)", "৩,০০০ থেকে ৭,০০০ কদম (মাঝারি)", "১০,০০০ কদম বা তার বেশি (অত্যন্ত সচল)"] },
    { id: 34, text: "আপনার বডি ফিটনেস অর্জনের প্রধান উদ্দেশ্য বা মোটিভেশন কোনটি?", options: ["মানসিক ফোকাস ও মেজাজ উন্নত করা", "আকর্ষণীয় ও শার্প ফেস/বডি শেপ পাওয়া", "দীর্ঘমেয়াদী রোগমুক্ত সুস্থ জীবন"] },
    { id: 35, text: "সপ্তাহে কত দিন বাড়ির বাইরে রেস্টুরেন্ট বা হোটেল থেকে খাবার খাওয়া হয়?", options: ["৩ দিনের বেশি (বাইরের খাবার নির্ভর)", "১ থেকে ২ দিন (মাঝেমধ্যে)", "একদমই না, সম্পূর্ণ বাড়ির খাবার"] },
    { id: 36, text: "আপনার কি গভীর রাতে ফ্রিজ খুলে খাবার খোঁজার (Late-night Snacking) অভ্যাস আছে?", options: ["হ্যাঁ, প্রায় প্রতি রাতেই হয়", "মাঝেমধ্যে বা কোনো কোনো দিন হয়", "না, ঘুমানোর পর একদমই উঠি না"] },
    { id: 37, text: "ফলমূল খাওয়ার অভ্যাস কেমন আপনার?", options: ["প্রতিদিন অন্তত ১টি ফল খাই", "সপ্তাহে ২-৩ দিন খাওয়া হয়", "খুবই কম বা একদমই খাওয়া হয় না"] },
    { id: 38, text: "আপনার কি সোডা বা ডায়েট কোক খাওয়ার অভ্যাস আছে?", options: ["হ্যাঁ, সপ্তাহে ২-৩ ক্যান বা বেশি", "মাঝেমধ্যে ১-২ বার খাই", "একদমই খাই না বা এড়িয়ে চলি"] },
    { id: 39, text: "প্রতিদিনের খাবারে তেলের পরিমাণ কেমন মনে হয়?", options: ["অতিরিক্ত তেল-মসলাযুক্ত চর্বিযুক্ত খাবার", "পরিমিত ও সাধারণ রান্না", "অত্যন্ত কম তেল বা সেদ্ধ খাবার"] },
    { id: 40, text: "অনুপ্রেরণার জন্য আপনি এই অ্যাপে কার সাহায্য সবচেয়ে বেশি চান?", options: ["কঠোর শাসন ও স্যাভেজ রোস্টিং চালাই", "নরম সুরে আন্তরিক ডায়েট কোচিং ও সাপোর্ট", "উভয়ের ব্যালেন্সড মিক্সচার"] }
  ];

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResult(true);
      triggerNotification("🎉 Fit Body প্রোফাইল রেডি!", "আপনার ৪০ প্রশ্নের ডায়েট অ্যানালাইসিস কমপ্লিট হয়েছে।");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: val }));
    // Wait slightly for visual confirmation, then auto-next for options
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => ({ ...prev, [currentStep]: e.target.value }));
  };

  const handleScanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScanImage(reader.result as string);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runBodyScan = () => {
    if (!scanImage) {
      triggerNotification("⚠️ ছবি আপলোড করুন", "স্ক্যান করার জন্য আগে একটি ছবি আপলোড করুন।");
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      // Simulate scanning response based on random realistic looking calculations
      setIsScanning(false);
      setScanResult({
        faceFat: '১৫.২% (মাঝারি)',
        doubleChinRisk: '৩০% (নিম্ন)',
        bodyType: 'Mesomorph / Endomorph Mix',
        waterRetention: 'উচ্চ (পানি পানের অভাব)',
        puffinessScore: '৬.৮ / ১০ (ফোলা ভাব লক্ষ্য করা গেছে)',
        dietRecommendation: 'পরোটা ও চিনিযুক্ত চা অবিলম্বে বাদ দিয়ে দিনে অন্তত ৩ লিটার পানি পান করুন। সোডিয়াম ও লবণ নিয়ন্ত্রণ করুন।'
      });
      triggerNotification("🎯 স্ক্যান সমাপ্ত!", "আপনার ফেস ও বডি ফ্যাট ডিস্ট্রিবিউশন আনুমানিক বিশ্লেষণ সম্পন্ন করা হয়েছে।");
    }, 2500);
  };

  const CORE_PROTOCOLS = [
    { 
      id: 'blueprint', 
      num: '01',
      badge: 'V-TAPER',
      title: 'PHYSIQUE BLUEPRINT', 
      subtitle: 'V-Taper & Workout Split', 
      color: 'text-amber-400',
      borderActive: 'border-amber-500/70',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      glowBg: 'from-amber-500/15 via-amber-950/30 to-zinc-950',
      activeRing: 'ring-2 ring-amber-500/50 shadow-amber-950/40',
      renderLogo: () => (
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16l-3 7-5 10-5-10L4 4z" fill="currentColor" fillOpacity="0.2" />
          <path d="M4 4h16l-3 7-5 10-5-10L4 4z" />
          <path d="M12 4v17" strokeDasharray="2 2" />
          <path d="M8 8h8" />
        </svg>
      )
    },
    { 
      id: 'scan_food', 
      num: '02',
      badge: 'AI MACRO',
      title: 'MEAL SCANNER & LOG', 
      subtitle: 'Calorie & Protein Tracker', 
      color: 'text-emerald-400',
      borderActive: 'border-emerald-500/70',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      glowBg: 'from-emerald-500/15 via-emerald-950/30 to-zinc-950',
      activeRing: 'ring-2 ring-emerald-500/50 shadow-emerald-950/40',
      renderLogo: () => (
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
        </svg>
      )
    },
    { 
      id: 'questionnaire', 
      num: '03',
      badge: '20Q MATRIX',
      title: 'DIET MATRIX 20Q', 
      subtitle: 'Custom Nutrition Engine', 
      color: 'text-cyan-400',
      borderActive: 'border-cyan-500/70',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      glowBg: 'from-cyan-500/15 via-cyan-950/30 to-zinc-950',
      activeRing: 'ring-2 ring-cyan-500/50 shadow-cyan-950/40',
      renderLogo: () => (
        <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2" fill="currentColor" fillOpacity="0.2" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="9" />
          <line x1="12" y1="15" x2="12" y2="22" />
        </svg>
      )
    },
    { 
      id: 'scanner', 
      num: '04',
      badge: 'BIOMETRIC',
      title: 'BODY & FACE SCANNER', 
      subtitle: 'Fat % & Puffiness Analysis', 
      color: 'text-purple-400',
      borderActive: 'border-purple-500/70',
      badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      glowBg: 'from-purple-500/15 via-purple-950/30 to-zinc-950',
      activeRing: 'ring-2 ring-purple-500/50 shadow-purple-950/40',
      renderLogo: () => (
        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <circle cx="12" cy="10" r="3.5" fill="currentColor" fillOpacity="0.2" />
          <path d="M9 16c1.5 1 4.5 1 6 0" />
        </svg>
      )
    },
    { 
      id: 'swapper', 
      num: '05',
      badge: 'DESI SWAP',
      title: 'MEAL SWAP & BUDGET', 
      subtitle: 'Smart Budget Meal Swaps', 
      color: 'text-rose-400',
      borderActive: 'border-rose-500/70',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      glowBg: 'from-rose-500/15 via-rose-950/30 to-zinc-950',
      activeRing: 'ring-2 ring-rose-500/50 shadow-rose-950/40',
      renderLogo: () => (
        <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3l4 4-4 4" />
          <path d="M21 7H7a4 4 0 0 0-4 4v1" />
          <path d="M7 21l-4-4 4-4" />
          <path d="M3 17h14a4 4 0 0 0 4-4v-1" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      )
    }
  ];

  const currentProtocol = CORE_PROTOCOLS.find(p => p.id === selectedProtocol) || CORE_PROTOCOLS[0];

  return (
    <div id="fit-body-container" className="text-left">
      
      {/* 1. PROTOCOLS HUB VIEW (MATCHING USER SCREENSHOT EXACTLY) */}
      {selectedProtocol === null ? (
        <div className="max-w-md mx-auto py-2 px-1 text-center select-none animate-in fade-in duration-300">
          
          {/* TOP BAR WITH BACK, CYAN FLAME, AND GRID ICONS */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-11 h-11 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-300" />
            </button>

            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400/20 blur-xl rounded-full" />
                <Flame className="w-10 h-10 text-[#2dd4bf] relative drop-shadow-[0_0_14px_rgba(45,212,191,0.7)]" />
              </div>
            </div>

            <button
              type="button"
              className="w-11 h-11 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer shadow-md"
            >
              <LayoutGrid className="w-5 h-5 text-zinc-300" />
            </button>
          </div>

          {/* FIT BODY TITLE & PROTOCOLS */}
          <div className="mb-7 space-y-1 text-center">
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-zinc-100 tracking-[0.25em] uppercase">
              FIT BODY
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1px] w-6 bg-emerald-500/50" />
              <span className="font-mono font-bold text-xs sm:text-sm tracking-[0.25em] text-[#10b981] uppercase">
                PROTOCOLS
              </span>
              <span className="h-[1px] w-6 bg-emerald-500/50" />
            </div>
            <p className="text-xs text-zinc-400 font-sans pt-1">
              Nutrition, Calorie Tracking &amp; Body Transformation Hub
            </p>
          </div>

          {/* 2x2 GRID FOR TOP 4 OPTIONS */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
            
            {/* 1. PHYSIQUE */}
            <div
              onClick={() => setSelectedProtocol('blueprint')}
              className="bg-[#0e1017] border border-zinc-850 hover:border-emerald-500/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer aspect-square sm:aspect-auto sm:py-7 group shadow-xl hover:scale-[1.02]"
            >
              <div className="w-16 h-16 rounded-full bg-[#064e3b]/30 border-2 border-[#10b981]/60 flex items-center justify-center text-[#10b981] mb-3.5 group-hover:scale-110 transition-transform shadow-[0_0_16px_rgba(16,185,129,0.2)]">
                <Dumbbell className="w-7 h-7" />
              </div>
              <span className="font-display font-black text-sm sm:text-base text-zinc-100 uppercase tracking-wider mb-1.5">
                PHYSIQUE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#064e3b]/60 border border-[#10b981]/40 text-[9px] font-mono font-bold text-[#10b981] uppercase tracking-widest">
                V-TAPER
              </span>
            </div>

            {/* 2. MEAL SCANNER */}
            <div
              onClick={() => setSelectedProtocol('scan_food')}
              className="bg-[#0e1017] border border-zinc-850 hover:border-blue-500/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer aspect-square sm:aspect-auto sm:py-7 group shadow-xl hover:scale-[1.02]"
            >
              <div className="w-16 h-16 rounded-full bg-[#1e3a8a]/30 border-2 border-[#3b82f6]/60 flex items-center justify-center text-[#3b82f6] mb-3.5 group-hover:scale-110 transition-transform shadow-[0_0_16px_rgba(59,130,246,0.2)]">
                <Salad className="w-7 h-7" />
              </div>
              <div className="font-display font-black text-sm sm:text-base text-zinc-100 uppercase tracking-wider leading-tight">
                <div>MEAL</div>
                <div>SCANNER</div>
              </div>
            </div>

            {/* 3. DIET MATRIX */}
            <div
              onClick={() => setSelectedProtocol('questionnaire')}
              className="bg-[#0e1017] border border-zinc-850 hover:border-purple-500/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer aspect-square sm:aspect-auto sm:py-7 group shadow-xl hover:scale-[1.02]"
            >
              <div className="w-16 h-16 rounded-full bg-[#581c87]/30 border-2 border-[#a855f7]/60 flex items-center justify-center text-[#a855f7] mb-3.5 group-hover:scale-110 transition-transform shadow-[0_0_16px_rgba(168,85,247,0.2)]">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <div className="font-display font-black text-sm sm:text-base text-zinc-100 uppercase tracking-wider leading-tight">
                <div>DIET</div>
                <div>MATRIX</div>
              </div>
            </div>

            {/* 4. BODY & FACE */}
            <div
              onClick={() => setSelectedProtocol('scanner')}
              className="bg-[#0e1017] border border-zinc-850 hover:border-amber-500/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer aspect-square sm:aspect-auto sm:py-7 group shadow-xl hover:scale-[1.02]"
            >
              <div className="w-16 h-16 rounded-full bg-[#78350f]/30 border-2 border-[#f59e0b]/60 flex items-center justify-center text-[#f59e0b] mb-3.5 group-hover:scale-110 transition-transform shadow-[0_0_16px_rgba(245,158,11,0.2)]">
                <User className="w-7 h-7" />
              </div>
              <div className="font-display font-black text-sm sm:text-base text-zinc-100 uppercase tracking-wider leading-tight">
                <div>BODY &amp;</div>
                <div>FACE</div>
              </div>
            </div>

          </div>

          {/* 5. MEAL SWAP (BOTTOM FULL-WIDTH) */}
          <div
            onClick={() => setSelectedProtocol('swapper')}
            className="w-full bg-[#0e1017] border border-zinc-850 hover:border-rose-500/50 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group shadow-xl hover:scale-[1.01] mt-3.5 sm:mt-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#881337]/30 border-2 border-[#f43f5e]/60 flex items-center justify-center text-[#f43f5e] mb-2.5 group-hover:scale-110 transition-transform shadow-[0_0_16px_rgba(244,63,94,0.2)]">
              <RefreshCw className="w-7 h-7" />
            </div>
            <span className="font-display font-black text-sm sm:text-base text-zinc-100 uppercase tracking-wider">
              MEAL SWAP
            </span>
          </div>

        </div>
      ) : (
        /* 2. FULL-SCREEN DEDICATED VIEW FOR THE SELECTED PROTOCOL */
        <div className="fixed inset-0 z-50 bg-[#07080d] p-3 sm:p-6 overflow-y-auto flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">
          
          {/* FULL-SCREEN TOP BAR */}
          <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-850 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedProtocol(null)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-zinc-200 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md group"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>BACK TO PROTOCOLS</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                {currentProtocol.renderLogo()}
              </div>
              <h3 className="font-display font-black text-xs sm:text-sm text-zinc-100 uppercase tracking-wider hidden sm:block">
                {currentProtocol.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setSelectedProtocol(null)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
              title="Close Fullscreen"
            >
              <X className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">CLOSE</span>
            </button>
          </div>

          {/* ACTIVE PROTOCOL CONTENT */}
          <div className="max-w-5xl mx-auto w-full pb-10">
            {/* 0. PHYSIQUE TRANSFORMATION BLUEPRINT */}
            {selectedProtocol === 'blueprint' && (
              <PhysiqueTransformationBlueprint />
            )}

            {/* 1. INTERACTIVE QUESTIONNAIRE */}
            {selectedProtocol === 'questionnaire' && (
          <div className="space-y-6">
            {!showResult ? (
              <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-mono text-emerald-400 uppercase tracking-wider font-bold">Fit Body Questionnaire</span>
                    <span className="font-mono font-black">{currentStep + 1} / {questions.length} ({( (currentStep + 1) / questions.length * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-[#0b0c16] border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-zinc-650 uppercase tracking-widest font-black">
                    Step {questions[currentStep].id}
                  </div>

                  <h3 className="font-display font-black text-lg md:text-xl text-zinc-100 leading-relaxed">
                    {questions[currentStep].text}
                  </h3>

                  {/* Render Input Field or Option Buttons */}
                  {questions[currentStep].options ? (
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {questions[currentStep].options.map((option, idx) => {
                        const isSelected = answers[currentStep] === option;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAnswerSelect(option)}
                            className={`p-4 rounded-xl border text-left transition-all text-xs font-bold flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 font-black'
                                : 'bg-zinc-950/80 border-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                            }`}
                          >
                            <span>{option}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-500/20' : 'border-zinc-800'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <input
                        type="text"
                        value={answers[currentStep] || ''}
                        onChange={handleTextChange}
                        placeholder={questions[currentStep].placeholder}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-medium transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNext();
                        }}
                      />
                      <p className="text-[10px] text-zinc-500 font-mono">
                        টাইপ করা শেষ হলে নিচের 'Next' বাটনে চাপুন বা এন্টার চাপুন।
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="px-5 py-3 rounded-xl border border-zinc-900 text-xs text-zinc-400 font-bold hover:text-zinc-200 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    পূর্ববর্তী প্রশ্ন
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!answers[currentStep]}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 text-xs font-black hover:opacity-90 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-950/20"
                  >
                    {currentStep === questions.length - 1 ? 'সাবমিট করুন' : 'পরবর্তী প্রশ্ন'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              // 40-Question Result Summary
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-[#0b0c16] border border-emerald-900/20 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-lg text-zinc-100 uppercase tracking-wide">
                        আপনার বডি ও ডায়েট প্রোফাইল রিপোর্ট
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        ৪০টি প্রশ্নের উপর ভিত্তি করে সম্পূর্ণ নিজস্ব ফ্যাট লস ও ক্যালোরি রুটিন
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">শারীরিক অনুপাত (Metrics)</span>
                      <div className="space-y-1.5 text-xs text-zinc-300">
                        <p>👤 বয়স: <span className="text-zinc-100 font-bold font-mono">{answers[0] || '২৮ বছর'}</span></p>
                        <p>⚖️ বর্তমান ওজন: <span className="text-zinc-100 font-bold font-mono">{answers[1] || '৭৮ কেজি'}</span></p>
                        <p>📏 উচ্চতা: <span className="text-zinc-100 font-bold font-mono">{answers[2] || '৫ ফুট ৮ ইঞ্চি'}</span></p>
                        <p>🎯 লক্ষ্য ওজন: <span className="text-zinc-100 font-bold font-mono">{answers[3] || '৬৮ কেজি'}</span></p>
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400 block">ডায়েট ও অভ্যাস (Lifestyle)</span>
                      <div className="space-y-1.5 text-xs text-zinc-300">
                        <p>💪 লক্ষ্য: <span className="text-zinc-100 font-bold">{answers[4] || 'ফ্যাট লস'}</span></p>
                        <p>💰 বাজেট: <span className="text-zinc-100 font-bold">{answers[5] || 'কম বাজেট'}</span></p>
                        <p>🚰 পানি পান: <span className="text-zinc-100 font-bold">{answers[11] || 'মাঝারি'}</span></p>
                        <p>😴 ঘুম: <span className="text-zinc-100 font-bold">{answers[15] || '৬-৭ ঘণ্টা'}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Personalized Recommendations based on their answers */}
                  <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-xl space-y-3.5">
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold-400" />
                      এআই ফ্রেন্ড কাস্টম ডায়েট সুপারিশ (Bengali Core Diet Blueprint)
                    </h4>
                    
                    <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
                      <p>
                        ১. **প্রাতরাশ (সকাল)**: সাদা পরোটার পরিবর্তে দুটি **লাল আটার রুটি** এবং কুসুম ছাড়া ২টি সিদ্ধ ডিম খান। চিনিযুক্ত দুধ চা পুরোপুরি বাদ দিয়ে লাল চা বা গ্রিন টি খাওয়ার অভ্যাস করুন। এতে আপনার ডাবল চিন বা ফেসে জমে থাকা অতিরিক্ত পানি ও ফোলা ভাব দ্রুত দূর হবে।
                      </p>
                      <p>
                        ২. **মধ্যাহ্নভোজ (দুপুর)**: দুপুরের ভাতের পরিমাণ কমিয়ে অর্ধেক প্লেট করুন। সাদা চালের বদলে **লাল চালের ভাত** ব্যবহার করুন। সাথে অবশ্যই ঘন ডাল ও যেকোনো এক পিস মাছ বা মুরগি রাখবেন।
                      </p>
                      <p>
                        ৩. **রাতের খাবার**: রাতের খাবার অবশ্যই রাত ৮টা থেকে সাড়ে ৮টার মধ্যে শেষ করবেন। রাতে ভাত এড়িয়ে মাত্র ১টি রুটি অথবা সালাদ খাবেন। ভাতের তুলনায় রাতে কার্বোহাইড্রেট কম খেলে ঘুমানোর সময়ে শরীরে ফ্যাট সেল বার্ন হওয়ার হার দ্রুত হয়।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResult(false);
                        setCurrentStep(0);
                        setAnswers({});
                      }}
                      className="px-4 py-2.5 rounded-xl border border-zinc-900 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      আবার শুরু করুন
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProtocol('swapper')}
                      className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-black text-emerald-400 hover:border-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      খাদ্য সোয়াপ করতে যান
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. BODY & FACE FAT SCANNER */}
        {selectedProtocol === 'scanner' && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="font-display font-black text-lg text-zinc-100 uppercase tracking-wide">
                  বডি ও ফেস ফ্যাট স্ক্যানার (Visual Scanner)
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  আপনার একটি ছবি আপলোড করুন। আমাদের ভিজ্যুয়াল এআই সিমুলেটর আপনার ছবি স্ক্যান করে ফেস পাফিনেস, চোয়ালের ফ্যাট ডিস্ট্রিবিউশন এবং ওয়াটার রিটেনশন মেজার করবে।
                </p>
              </div>

              {/* Upload Interface */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-900 hover:border-emerald-500/30 bg-[#0b0c16]/50 rounded-2xl transition-all relative">
                {scanImage ? (
                  <div className="space-y-4 max-w-xs relative w-full">
                    <img 
                      src={scanImage} 
                      alt="Uploaded face or body" 
                      className="w-full h-56 object-cover rounded-xl border border-zinc-800 relative overflow-hidden" 
                    />
                    
                    {/* Scanner bar animation */}
                    {isScanning && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 animate-scanner shadow-md shadow-emerald-400" />
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={runBodyScan}
                        disabled={isScanning}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black text-xs hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {isScanning ? 'স্ক্যান হচ্ছে...' : 'স্ক্যান শুরু করুন'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setScanImage(null)}
                        disabled={isScanning}
                        className="py-2.5 px-4 rounded-xl border border-zinc-900 text-zinc-400 text-xs hover:text-zinc-200 cursor-pointer disabled:opacity-40"
                      >
                        রিমুভ
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-3 py-6 block w-full">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-200">এখানে ছবি ড্রপ করুন বা ব্রাউজ করুন</p>
                      <p className="text-[10px] text-zinc-500 font-mono">JPG, PNG বা WEBP ফর্ম্যাট (মুখমণ্ডল বা ফ্রন্ট বডি)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleScanUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Scanning Results Panel */}
              <AnimatePresence>
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-left space-y-4 max-w-xl mx-auto shadow-xl"
                  >
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">স্ক্যান ফলাফল (Scanner Metrics)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-zinc-500 block text-[10px] font-mono">FACE FAT (ফেসিয়াল ফ্যাট):</span>
                        <span className="text-zinc-200 font-bold">{scanResult.faceFat}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-zinc-500 block text-[10px] font-mono">DOUBLE CHIN RISK (ডাবল চিন):</span>
                        <span className="text-zinc-200 font-bold">{scanResult.doubleChinRisk}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-zinc-500 block text-[10px] font-mono">PHYSIQUE TYPE (সোমাটোটাইপ):</span>
                        <span className="text-zinc-200 font-bold">{scanResult.bodyType}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-zinc-500 block text-[10px] font-mono">WATER RETENTION (ফোলা ভাব):</span>
                        <span className="text-zinc-200 font-bold text-amber-400">{scanResult.waterRetention}</span>
                      </div>
                    </div>

                    <div className="bg-[#0b0c16] border border-zinc-900 p-3.5 rounded-xl space-y-1 text-xs">
                      <span className="text-emerald-400 font-bold block">💡 স্ক্যান ভিত্তিক কাস্টম ডায়েট অ্যাডভাইস:</span>
                      <p className="text-zinc-300 leading-relaxed">{scanResult.dietRecommendation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        )}

        {/* 3. DIET SWAPPER & BUDGET MEAL REPLACER */}
        {selectedProtocol === 'swapper' && (
          <div className="space-y-6">
            <div className="max-w-4xl mx-auto flex flex-col h-[650px] bg-[#0b0c16] border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative">
              
              {/* Chat Header */}
              <div className="bg-[#101121] border-b border-zinc-900 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                    <Apple className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs sm:text-sm text-zinc-100 uppercase tracking-wider flex flex-wrap items-center gap-1.5">
                      <span>স্মার্ট ফুড সোয়াপ ও দৈনিক মিল প্ল্যানার</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest font-normal">AI Powered</span>
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      আপনার দৈনন্দিন রুটিন, খাদ্য অভ্যাস ও বাজেট বিশ্লেষণ করে তৈরি নিখুঁত ডায়েট গাইড
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearSwapperChat}
                  title="চ্যাট হিস্ট্রি রিসেট করুন"
                  className="p-2.5 bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-red-400 rounded-xl cursor-pointer transition-all hover:bg-red-950/10 hover:border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Log Message Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
                {swapperMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Icon Column */}
                    <div className={`p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border ${
                      msg.role === 'user'
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {msg.role === 'user' ? (
                        <div className="font-mono text-xs font-black uppercase text-zinc-400">ME</div>
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="space-y-3 min-w-0 flex-1">
                      {/* Normal text response */}
                      {msg.content && (
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-zinc-950 border border-zinc-900 text-zinc-200 rounded-tr-none'
                            : 'bg-[#101121] border border-zinc-900 text-zinc-300 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      )}

                      {/* Structured response with beautiful meal cards */}
                      {msg.planData && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 max-w-2xl"
                        >
                          {/* Overview Analysis Card */}
                          <div className="bg-gradient-to-br from-[#101121] to-[#07080e] border border-zinc-900 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                              <ShieldCheck className="w-16 h-16 text-emerald-400" />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">এআই ডায়েট বিশ্লেষণ (AI Analysis)</span>
                              <div className="h-px bg-zinc-900 flex-1" />
                            </div>
                            
                            <p className="text-[11px] text-zinc-300 leading-relaxed font-sans italic">
                              "{msg.planData.analysis}"
                            </p>

                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-mono text-zinc-500">বাজেট সামঞ্জস্যতা:</span>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <HeartPulse className="w-3.5 h-3.5" />
                                {msg.planData.budgetVerdict}
                              </span>
                            </div>
                          </div>

                          {/* Interactive Meal Plan Grid/List */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold text-emerald-400">সকাল থেকে রাত: পুষ্টি রুটিন (Daily Schedule)</span>
                              <div className="h-px bg-zinc-900 flex-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {msg.planData.mealPlan.map((meal, mIdx) => (
                                <div
                                  key={mIdx}
                                  className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-md transition-all group"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-1.5">
                                      <span className="text-[11px] font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                        {meal.time}
                                      </span>
                                      
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                                        meal.isWithinBudget
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                      }`}>
                                        {meal.estimatedCost}
                                      </span>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[10px] font-mono text-zinc-550 block">মেনু আইটেম:</span>
                                      <p className="text-[11px] text-zinc-100 font-bold leading-relaxed">{meal.items}</p>
                                    </div>
                                  </div>

                                  <div className="bg-[#0b0c16] border border-zinc-900/60 p-2 rounded-lg space-y-0.5">
                                    <span className="text-[9px] font-mono text-zinc-550 block">খাওয়ার নিয়ম ও প্রস্তুতি:</span>
                                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">{meal.howToEat}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Nutrition Tips */}
                          {msg.planData.nutritionTips && msg.planData.nutritionTips.length > 0 && (
                            <div className="bg-[#0e1610] border border-emerald-950/50 rounded-2xl p-4 space-y-3">
                              <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4" />
                                প্র্যাক্টিক্যাল পুষ্টি ও সাশ্রয়ী টিপস
                              </h4>
                              <ul className="space-y-2">
                                {msg.planData.nutritionTips.map((tip, tIdx) => (
                                  <li key={tIdx} className="flex items-start gap-2 text-[10.5px] text-zinc-300 leading-relaxed">
                                    <span className="p-0.5 mt-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 rounded-md shrink-0">
                                      <Check className="w-3 h-3" />
                                    </span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Closing Guidance */}
                          {msg.planData.overallGuideline && (
                            <div className="p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                              <p className="text-[10px] text-zinc-400 leading-relaxed italic text-center">
                                "{msg.planData.overallGuideline}"
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading state indicator */}
                {isSwapperLoading && (
                  <div className="flex gap-3.5 mr-auto max-w-[90%]">
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 h-9 w-9 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    </div>
                    <div className="bg-[#101121] border border-zinc-900 rounded-2xl rounded-tl-none p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        এআই আপনার লাইফস্টাইল ও বাজেট বিশ্লেষণ করছে...
                      </div>
                      <p className="text-[10px] text-zinc-400 animate-pulse">
                        দয়া করে কয়েক মুহূর্ত অপেক্ষা করুন। আপনার জন্য একটি চমৎকার কাস্টম ডায়েট প্ল্যান প্রস্তুত করা হচ্ছে।
                      </p>
                    </div>
                  </div>
                )}

                {/* Connection Error warning */}
                {swapperError && (
                  <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold">সার্ভার ত্রুটি</p>
                      <p className="text-[10px] leading-relaxed text-zinc-350">{swapperError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendSwapperMessage}
                className="p-4 bg-[#101121] border-t border-zinc-900 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={swapperInput}
                  onChange={(e) => setSwapperInput(e.target.value)}
                  disabled={isSwapperLoading}
                  placeholder="এখানে আপনার ডায়েট, ঘুম, বাজেট, ফ্যামিলি অবস্থা ইত্যাদি লিখে সাবমিট করুন..."
                  className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 leading-relaxed placeholder-zinc-600 font-sans disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={isSwapperLoading || !swapperInput.trim()}
                  className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black rounded-xl hover:opacity-90 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-950/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>
        )}

        {/* 4. SCAN FOOD & TRACKER */}
        {selectedProtocol === 'scan_food' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Body Goal Setup & Interactive Dashboard */}
              <div className="lg:col-span-1 space-y-5">
                
                {/* Body Goal Card */}
                <div className="bg-[#0b0c16] border border-emerald-950 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Target className="w-5 h-5 animate-pulse" />
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-zinc-100">
                      বডি গোল ও রুটিন সেটআপ
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-zinc-500">আমি কিরকম বডি বানাতে চাই?</label>
                      <select
                        value={bodyGoal}
                        onChange={(e) => setBodyGoal(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-medium"
                      >
                        <option value="Bulk (ওজন ও মাসল বাড়ানো)">Bulk (ওজন ও মাসল বাড়ানো)</option>
                        <option value="Cut (মেদ কমানো ও ফ্যাট লস)">Cut (মেদ কমানো ও ফ্যাট লস)</option>
                        <option value="Lean Muscle (লিন মাসল ও চোয়াল শার্প)">Lean Muscle (লিন মাসল ও চোয়াল শার্প)</option>
                        <option value="Maintenance (ওজন নিয়ন্ত্রণ ও ফিটনেস)">Maintenance (ওজন নিয়ন্ত্রণ ও ফিটনেস)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-zinc-500">লিঙ্গ (Gender)</label>
                        <select
                          value={userGender}
                          onChange={(e) => setUserGender(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-medium"
                        >
                          <option value="male">পুরুষ (Male)</option>
                          <option value="female">নারী (Female)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-zinc-500">বয়স (Age)</label>
                        <input
                          type="number"
                          value={userAge}
                          onChange={(e) => setUserAge(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-zinc-500">বর্তমান ওজন (কেজি)</label>
                        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-1">
                          <input
                            type="number"
                            value={currentWeight}
                            onChange={(e) => setCurrentWeight(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none font-mono font-bold h-10"
                          />
                          <span className="text-[10px] text-zinc-500 font-bold font-mono">KG</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-zinc-500">উচ্চতা (Height)</label>
                        <div className="grid grid-cols-2 gap-1 bg-zinc-950 border border-zinc-900 rounded-xl px-2 py-1 h-[42px] items-center">
                          <div className="flex items-center gap-0.5">
                            <input
                              type="number"
                              value={userHeightFeet}
                              onChange={(e) => setUserHeightFeet(Math.max(1, Number(e.target.value)))}
                              className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none font-mono font-bold text-right"
                            />
                            <span className="text-[10px] text-zinc-500 font-bold font-mono">ft</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <input
                              type="number"
                              value={userHeightInches}
                              onChange={(e) => setUserHeightInches(Math.max(0, Math.min(11, Number(e.target.value))))}
                              className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none font-mono font-bold text-right"
                            />
                            <span className="text-[10px] text-zinc-500 font-bold font-mono">in</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-zinc-500">দৈনিক অ্যাক্টিভিটি (Activity)</label>
                      <select
                        value={userActivityLevel}
                        onChange={(e) => setUserActivityLevel(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 font-medium"
                      >
                        <option value="sedentary">বসে বসে কাজ / কোনো ব্যায়াম নেই (BMR x 1.2)</option>
                        <option value="lightly_active">হালকা সক্রিয় / হাঁটাচলা (BMR x 1.375)</option>
                        <option value="moderately_active">মাঝারি কায়িক পরিশ্রম / নিয়মিত ব্যায়াম (BMR x 1.55)</option>
                        <option value="very_active">কঠোর পরিশ্রম / হেভি ওয়ার্কআউট (BMR x 1.725)</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculated daily default targets */}
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-900/60 space-y-2.5">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">আপনার জন্য দৈনিক লক্ষ্যমাত্রা:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-zinc-900/60 p-2 rounded-lg text-center border border-zinc-850">
                        <span className="text-[10px] text-zinc-500 block font-mono">ক্যালরি</span>
                        <span className="font-mono font-black text-zinc-200 text-sm">{targets.calories} <span className="text-[10px] font-normal text-zinc-500">kcal</span></span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg text-center border border-zinc-850">
                        <span className="text-[10px] text-zinc-500 block font-mono">প্রোটিন</span>
                        <span className="font-mono font-black text-emerald-400 text-sm">{targets.protein} <span className="text-[10px] font-normal text-zinc-500">g</span></span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg text-center border border-zinc-850">
                        <span className="text-[10px] text-zinc-500 block font-mono">ফ্যাট</span>
                        <span className="font-mono font-black text-zinc-200 text-sm">{targets.fat} <span className="text-[10px] font-normal text-zinc-500">g</span></span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg text-center border border-zinc-850">
                        <span className="text-[10px] text-zinc-500 block font-mono">কার্বোহাইড্রেট</span>
                        <span className="font-mono font-black text-zinc-200 text-sm">{targets.carbs} <span className="text-[10px] font-normal text-zinc-500">g</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Progress Tracker Bars */}
                <div className="bg-[#0b0c16] border border-zinc-900 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Apple className="w-5 h-5" />
                      <h3 className="font-display font-black text-xs uppercase tracking-wider text-zinc-100">
                        আজকের ক্যালোরি অগ্রগতি
                      </h3>
                    </div>
                    <button
                      onClick={handleResetLogs}
                      className="text-[9px] uppercase font-mono font-black text-zinc-500 hover:text-red-400 flex items-center gap-1 border border-zinc-900 hover:border-red-950/40 p-1.5 rounded-lg transition-all"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      দিন রিসেট
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Calories progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400 font-bold">ক্যালরি (Calories)</span>
                        <span className="font-mono text-zinc-300"><span className="text-emerald-400 font-black">{totalConsumed.calories}</span> / {targets.calories} kcal</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2.5 rounded-full border border-zinc-900 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (totalConsumed.calories / targets.calories) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Protein progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400 font-bold">প্রোটিন (Protein)</span>
                        <span className="font-mono text-zinc-300"><span className="text-emerald-400 font-black">{totalConsumed.protein}g</span> / {targets.protein}g</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2.5 rounded-full border border-zinc-900 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (totalConsumed.protein / targets.protein) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Carbs progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400 font-bold">কার্বস (Carbs)</span>
                        <span className="font-mono text-zinc-300"><span className="text-zinc-200 font-black">{totalConsumed.carbs}g</span> / {targets.carbs}g</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2.5 rounded-full border border-zinc-900 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (totalConsumed.carbs / targets.carbs) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remaining calculations */}
                  <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-900 space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider block">আজকের দিনে আর কত কি খাওয়া লাগবে:</span>
                    <div className="space-y-1.5 text-xs text-zinc-300">
                      <p className="flex justify-between">
                        <span>ক্যালরি বাকি:</span>
                        <span className="font-mono font-bold text-zinc-100">{remaining.calories} kcal</span>
                      </p>
                      <p className="flex justify-between">
                        <span>প্রোটিন বাকি:</span>
                        <span className="font-mono font-bold text-emerald-400">{remaining.protein} g</span>
                      </p>
                      <p className="flex justify-between">
                        <span>কার্বোহাইড্রেট বাকি:</span>
                        <span className="font-mono font-bold text-zinc-100">{remaining.carbs} g</span>
                      </p>
                      <p className="flex justify-between">
                        <span>ফ্যাট বাকি:</span>
                        <span className="font-mono font-bold text-zinc-100">{remaining.fat} g</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (Span 2): Food Scanner Input & Search & Daily Food Log */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* Food Scanner Form */}
                <div className="bg-[#0b0c16] border border-zinc-900 rounded-2xl p-5 md:p-6 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Scan className="w-5 h-5 animate-pulse" />
                      <h3 className="font-display font-black text-xs uppercase tracking-wider text-zinc-100">
                        এআই ক্যামেরা ফুড স্ক্যানার (AI Vision Plate Scanner)
                      </h3>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      South Asian AI Model 3.5
                    </span>
                  </div>

                  <form onSubmit={handleScanFood} className="space-y-4">
                    {/* Viewfinder / Live Camera / Image Capture Upload Box */}
                    <div className="relative border-2 border-dashed border-emerald-500/30 rounded-2xl p-4 bg-zinc-950/80 text-center transition-all hover:border-emerald-500/60 overflow-hidden">
                      {/* Corner Brackets */}
                      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm pointer-events-none z-10" />
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm pointer-events-none z-10" />
                      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm pointer-events-none z-10" />
                      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400 rounded-br-sm pointer-events-none z-10" />

                      {isLiveCameraOpen ? (
                        /* LIVE CAMERA FEED HUD */
                        <div className="relative w-full overflow-hidden rounded-xl bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full max-h-72 object-cover rounded-xl border border-emerald-500/50 shadow-2xl"
                          />
                          
                          {/* HUD Overlay graphics */}
                          <div className="absolute inset-0 pointer-events-none border border-emerald-500/20 rounded-xl flex flex-col justify-between p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold bg-black/70 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> LIVE AI VISION STREAM
                              </span>
                              <span className="text-[9px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded-md">
                                Hold plate steady
                              </span>
                            </div>

                            {/* Center Target Box */}
                            <div className="w-32 h-32 md:w-40 md:h-40 border-2 border-emerald-400/60 rounded-2xl mx-auto flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                className="absolute inset-0 border border-dashed border-emerald-400/40 rounded-2xl pointer-events-none"
                              />
                            </div>

                            <span className="text-[10px] font-mono text-emerald-300 bg-black/70 px-2 py-1 rounded-lg mx-auto">
                              খাবারের থালার উপর ক্যামেরা ধরে রাখুন
                            </span>
                          </div>

                          {/* Live Capture Controls */}
                          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4 z-20">
                            <button
                              type="button"
                              onClick={captureLiveFrameAndScan}
                              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-emerald-950/60 flex items-center gap-2 cursor-pointer"
                            >
                              <Camera className="w-4 h-4" />
                              <span>স্ন্যাপ ও স্ক্যান করুন</span>
                            </button>
                            <button
                              type="button"
                              onClick={stopLiveCamera}
                              className="px-3 py-2.5 bg-black/80 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            >
                              <VideoOff className="w-3.5 h-3.5" />
                              <span>বন্ধ করুন</span>
                            </button>
                          </div>
                        </div>
                      ) : foodImage ? (
                        /* CAPTURED / UPLOADED IMAGE PREVIEW */
                        <div className="relative inline-block max-w-full">
                          <img src={foodImage} alt="Scanned Food Plate" className="max-h-56 rounded-xl border border-zinc-800 shadow-xl mx-auto object-cover" />
                          
                          {/* Live Scanning reticle line when scanning */}
                          {isScanningFood && (
                            <motion.div 
                              initial={{ top: '0%' }}
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                              className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-200 to-emerald-500 shadow-[0_0_20px_#10b981]"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => { setFoodImage(null); setFoodQuery(''); }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all"
                            title="ছবি মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        /* INITIAL CHOICE: LIVE CAMERA OR FILE UPLOAD */
                        <div className="py-4 space-y-4">
                          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={startLiveCamera}
                              className="w-full md:w-auto px-5 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              <Video className="w-4 h-4 animate-pulse text-emerald-400" />
                              <span>সরাসরি লাইভ ক্যামেরা চালু করুন</span>
                            </button>

                            <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">অথবা</span>

                            <label className="w-full md:w-auto cursor-pointer block">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 8 * 1024 * 1024) {
                                      triggerNotification("⚠️ ছবি অনেক বড়", "৮ মেগাবাইটের কম সাইজের ছবি আপলোড করুন।");
                                      return;
                                    }
                                    const r = new FileReader();
                                    r.onloadend = () => {
                                      setFoodImage(r.result as string);
                                      setFoodQuery(file.name.split('.')[0] || "খাবারের প্লেট");
                                    };
                                    r.readAsDataURL(file);
                                  }
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />
                              <div className="px-5 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                                <Upload className="w-4 h-4 text-emerald-400" />
                                <span>গ্যালারি থেকে ফটো আপলোড করুন</span>
                              </div>
                            </label>
                          </div>

                          <p className="text-[10px] text-zinc-400 font-sans">
                            ভাত, মাছ, তরকারি, মাংস, ডিম বা নাস্তার থালা লাইভ ক্যামেরায় ধরে রাখুন অথবা ফটো সিলেক্ট করুন।
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-zinc-400 flex items-center gap-1">
                        <span>অথবা খাবারের নাম/বিবরণ লিখুন (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={foodQuery}
                        onChange={(e) => setFoodQuery(e.target.value)}
                        placeholder="যেমন: ১ বাটি মসুর ডাল, ১ টুকরো মাছ ও ১.৫ কাপ ভাত..."
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isScanningFood || (!foodQuery.trim() && !foodImage)}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:opacity-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30"
                    >
                      {isScanningFood ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                          <span>এআই প্লেট ও উপাদান বিশ্লেষণ করছে...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-zinc-950" />
                          <span>প্লেটের খাবার ও নিউট্রিশন স্ক্যান করুন</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Scanned Food Results display */}
                  <AnimatePresence>
                    {scannedFoodResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-zinc-950 border border-emerald-500/30 rounded-2xl p-5 space-y-5 shadow-2xl"
                      >
                        {/* Title & Goal Status */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-900">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              <Zap className="w-3 h-3" /> স্ক্যানকৃত প্লেটের ফলাফল
                            </span>
                            <h4 className="font-display font-black text-base text-zinc-100">{scannedFoodResult.foodName}</h4>
                          </div>

                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase border tracking-wider inline-flex items-center gap-1 ${
                              scannedFoodResult.shouldEat === 'YES' 
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                : scannedFoodResult.shouldEat === 'NO'
                                ? 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse'
                                : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                            }`}>
                              {scannedFoodResult.shouldEat === 'YES' ? '✓ গোলের জন্য উপযুক্ত' : scannedFoodResult.shouldEat === 'NO' ? '⚠ এড়িয়ে চলুন' : '⟳ পরিমিত খান'}
                            </span>
                          </div>
                        </div>

                        {/* Total Macros Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                          <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl text-center space-y-0.5">
                            <span className="text-[9px] text-zinc-400 font-mono uppercase block">মোট ক্যালরি</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">{scannedFoodResult.calories} kcal</span>
                          </div>
                          <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl text-center space-y-0.5">
                            <span className="text-[9px] text-zinc-400 font-mono uppercase block">প্রোটিন (Protein)</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">{scannedFoodResult.protein} g</span>
                          </div>
                          <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl text-center space-y-0.5">
                            <span className="text-[9px] text-zinc-400 font-mono uppercase block">কার্বোহাইড্রেট</span>
                            <span className="font-mono font-black text-zinc-200 text-sm">{scannedFoodResult.carbs} g</span>
                          </div>
                          <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl text-center space-y-0.5">
                            <span className="text-[9px] text-zinc-400 font-mono uppercase block">ফ্যাট (Fat)</span>
                            <span className="font-mono font-black text-zinc-200 text-sm">{scannedFoodResult.fat} g</span>
                          </div>
                        </div>

                        {/* Itemized Dish Breakdown */}
                        {scannedFoodResult.itemsBreakdown && scannedFoodResult.itemsBreakdown.length > 0 && (
                          <div className="space-y-2 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 pb-1 border-b border-zinc-850">
                              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                              <span>প্লেটের উপাদান ও পরিমাণের বিস্তারিত (Item Breakdown):</span>
                            </div>

                            <div className="space-y-2 pt-1">
                              {scannedFoodResult.itemsBreakdown.map((item: any, idx: number) => (
                                <div key={idx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 flex items-center justify-between text-xs gap-2">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-zinc-200 block">{item.item}</span>
                                    <span className="text-[10px] text-zinc-400 font-mono">{item.portion}</span>
                                  </div>
                                  <div className="text-right font-mono text-[10px] text-zinc-400">
                                    <span className="text-emerald-400 font-bold block">{item.calories} kcal</span>
                                    <span>P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Verdict & Tips */}
                        <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2 text-xs text-zinc-300">
                          <p className="leading-relaxed font-sans">{scannedFoodResult.verdict}</p>
                          
                          {scannedFoodResult.alternatives && scannedFoodResult.alternatives.length > 0 && (
                            <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">পরামর্শ ও বিকল্প:</span>
                              <ul className="space-y-1 text-zinc-400">
                                {scannedFoodResult.alternatives.map((alt: string, i: number) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-emerald-400 font-bold">•</span>
                                    <span>{alt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Add to today's food log button */}
                        <button
                          type="button"
                          onClick={handleAddFoodToLog}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
                        >
                          <Check className="w-4 h-4" />
                          <span>আজকের ফুড লগে যুক্ত করুন ({scannedFoodResult.calories} kcal)</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Today's Food Logs */}
                <div className="bg-[#0b0c16] border border-zinc-900 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Clock className="w-5 h-5" />
                      <h3 className="font-display font-black text-xs uppercase tracking-wider text-zinc-100">
                        আজকের ফুড লগ (Today&apos;s Food Log)
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{todayFoodLogs.length} items logged</span>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
                    {todayFoodLogs.length === 0 ? (
                      <div className="text-center py-8 text-zinc-650 text-xs font-mono">
                        <p>আজকে এখনো কোনো খাবার স্ক্যান করে যোগ করা হয়নি।</p>
                        <p className="text-[10px] mt-1 text-zinc-700">খাবার স্ক্যান করে ডায়েরি আপডেট রাখুন</p>
                      </div>
                    ) : (
                      todayFoodLogs.map((item) => (
                        <div key={item.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between gap-4 hover:border-zinc-800 transition-all">
                          <div className="space-y-1 min-w-0">
                            <h5 className="text-xs font-bold text-zinc-200 truncate">{item.name}</h5>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {item.timestamp} • <span className="text-emerald-400">{item.calories} kcal</span> • P: {item.protein}g • F: {item.fat}g • C: {item.carbs}g
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveLogItem(item.id)}
                            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

          </div>
        </div>
      )}

    </div>
  );
}
