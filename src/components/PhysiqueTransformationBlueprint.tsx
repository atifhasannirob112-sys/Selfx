import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Sparkles, Upload, Camera, Check, AlertCircle, RefreshCw, 
  ChevronRight, Download, Copy, Share2, Dumbbell, Apple, Moon, 
  Droplet, Award, Zap, Clock, ShieldCheck, Heart, Trash2, Eye, 
  Maximize2, ArrowRight, Play, Info, ArrowUpRight, Target
} from 'lucide-react';
import { triggerNotification } from '../utils';

// Preset dream physiques for quick selection
const DREAM_PHYSIQUE_PRESETS = [
  {
    id: 'vtaper',
    title: 'Hollywood V-Taper (চওড়া কাঁধ ও চিকন কোমর)',
    desc: 'ব্র্যাড পিট / ক্রিস ইভান্স স্টাইল - কলারবোন ও সিক্স-প্যাক ফোকাস',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    tags: ['V-Taper', 'Wide Lats', '6-Pack']
  },
  {
    id: 'athletic',
    title: 'Athletic Lean (অ্যাথলেটিক ও শার্প ফিজিক)',
    desc: 'ক্রিস্টিয়ানো রোনালদো স্টাইল - লিন মাসল, হাই স্ট্যামিনা ও ভ্যাসকুলারিটি',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    tags: ['Low Body Fat', 'Cardio Fit', 'Defined Abs']
  },
  {
    id: 'classic_bulk',
    title: 'Heavy Muscle Mass (ম্যাসিভ পেশীবহুল বডি)',
    desc: 'ভরপুর মাসল, ভারী বুক, বড় বাইসেপ্স ও শক্তিশালী কাঁধ',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    tags: ['Hypertrophy', 'Mass Gain', 'Strength']
  },
  {
    id: 'aesthetic_model',
    title: 'Aesthetic Model (লিন ও শার্প লুক)',
    desc: 'ফ্ল্যাট বেলি, সুগঠিত বুক ও ড্রিম জামা-কাপড়ের ফিটিং',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    tags: ['Slim Waist', 'Chest Cut', 'Aesthetic']
  }
];

export default function PhysiqueTransformationBlueprint() {
  // Input States
  const [currentImage, setCurrentImage] = useState<string | null>(() => {
    return localStorage.getItem('fitbody_transform_current_img') || null;
  });
  const [targetImage, setTargetImage] = useState<string | null>(() => {
    return localStorage.getItem('fitbody_transform_target_img') || null;
  });

  const [age, setAge] = useState<number>(() => {
    return Number(localStorage.getItem('fitbody_age')) || 22;
  });
  const [weight, setWeight] = useState<number>(() => {
    return Number(localStorage.getItem('fitbody_weight')) || 68;
  });
  const [heightFeet, setHeightFeet] = useState<number>(() => {
    return Number(localStorage.getItem('fitbody_height_feet')) || 5;
  });
  const [heightInches, setHeightInches] = useState<number>(() => {
    return Number(localStorage.getItem('fitbody_height_inches')) || 8;
  });
  const [timeline, setTimeline] = useState<string>('6 মাস (6 Months)');
  const [workoutPlace, setWorkoutPlace] = useState<string>('Gym & Weights (জিমে ডাম্বেল ও রড)');
  const [dietBudget, setDietBudget] = useState<string>('বাজেট ফ্রেন্ডলি খাঁটি দেশি খাবার (ডিম, ভাত, ডাল, ছোলা)');
  const [dailySleep, setDailySleep] = useState<string>('৭.৫ - ৮ ঘণ্টা');
  const [customFocus, setCustomFocus] = useState<string>('উপরের বুক, চওড়া কাঁধ ও পেটের মেদ ঝরিয়ে সিক্স-প্যাক');

  // Generator & Animation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  // Result Blueprint State
  const [blueprintResult, setBlueprintResult] = useState<any | null>(() => {
    const saved = localStorage.getItem('fitbody_active_blueprint');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [activeTabSection, setActiveTabSection] = useState<'overview' | 'workout' | 'diet' | 'habits' | 'phases' | 'vtaper' | 'protein'>('overview');

  // V-Taper Interactive Tool State
  const [shoulderInch, setShoulderInch] = useState<number>(44);
  const [waistInch, setWaistInch] = useState<number>(31);

  // Daily Habits Ticks State
  const [habitTicks, setHabitTicks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fitbody_blueprint_habit_ticks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleHabit = (key: string) => {
    setHabitTicks(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('fitbody_blueprint_habit_ticks', JSON.stringify(updated));
      return updated;
    });
  };

  const vTaperRatio = waistInch > 0 ? (shoulderInch / waistInch).toFixed(2) : '1.00';
  const vTaperScore = Math.min(100, Math.round((Number(vTaperRatio) / 1.618) * 100));

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'current' | 'target'>('current');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const STAGES = [
    { title: "বর্তমান বডি কম্পোজিশন ও বডি ফ্যাট স্ক্যানিং...", desc: "অ্যানাটমিক্যাল স্ট্রাকচার ও ফ্রেম সাইজ ডিটেকশন" },
    { title: "ড্রিম ফিজিক অ্যানাটমি ও ফ্রেম ম্যাচিং...", desc: "মাসল গ্যাপ ও সুনির্দিষ্ট টার্গেট পয়েন্ট চিহ্নিতকরণ" },
    { title: "৭ দিনের পার্সোনালাইজড ওয়ার্কআউট স্প্লিট তৈরি...", desc: "হোম/জিম উপযোগী সেটস, রেপ্স ও ফর্ম রুটিন" },
    { title: "দেশি পুষ্টি ও ম্যাক্রো ডায়েট ক্যালকুলেশন...", desc: "সাশ্রয়ী বাঙালি মিল, প্রোটিন ও ক্যালরি বিভাজন" },
    { title: "লাইফস্টাইল, স্লিপ ও নো-ফ্যাপ হ্যাবিট ব্লুপ্রিন্ট...", desc: "মাইলস্টোন ও টেস্টোস্টেরন অপটিমাইজেশন শিডিউল" }
  ];

  // Auto-save key inputs
  useEffect(() => {
    try {
      if (currentImage) localStorage.setItem('fitbody_transform_current_img', currentImage);
      if (targetImage) localStorage.setItem('fitbody_transform_target_img', targetImage);
    } catch (e) {}
  }, [currentImage, targetImage]);

  // Image Upload Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'current' | 'target') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'current') {
          setCurrentImage(base64);
          triggerNotification("📸 বর্তমান বডির ছবি আপলোড হয়েছে", "আপনার বর্তমান শারীরিক গঠন স্ক্যানিংয়ের জন্য প্রস্তুত।");
        } else {
          setTargetImage(base64);
          triggerNotification("🎯 লক্ষ্য/ড্রিম বডির ছবি সিলেক্ট হয়েছে", "টার্গেট ফিজিক ফ্রেম ম্যাচিংয়ের জন্য যুক্ত হয়েছে।");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera Handlers
  const startCamera = async (type: 'current' | 'target') => {
    setCameraTarget(type);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setIsCameraActive(false);
      triggerNotification("⚠️ ক্যামেরা খোলা সম্ভব হয়নি", "পারমিশন দিন অথবা গ্যালারি থেকে ছবি সিলেক্ট করুন।");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      if (cameraTarget === 'current') {
        setCurrentImage(dataUrl);
      } else {
        setTargetImage(dataUrl);
      }
      stopCamera();
      triggerNotification("✅ ছবি সফলভাবে ক্যাপচার হয়েছে", "আপনার ছবি যুক্ত হয়েছে।");
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
    }
    setIsCameraActive(false);
  };

  // Deep AI Blueprint Generation Trigger
  const handleGenerateBlueprint = async () => {
    if (!currentImage) {
      triggerNotification("⚠️ বর্তমান বডির ছবি প্রয়োজন", "অনুগ্রহ করে আপনার বর্তমান শারীরিক অবস্থার একটি ছবি আপলোড বা ক্যাপচার করুন।");
      return;
    }

    setIsGenerating(true);
    setProgress(5);
    setStageIndex(0);

    // Progress Animation Loop
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          return 95;
        }
        const next = prev + Math.floor(Math.random() * 5) + 3;
        const currentStage = Math.min(4, Math.floor((next / 100) * 5));
        setStageIndex(currentStage);
        return next;
      });
    }, 450);

    try {
      const response = await fetch('/api/fitbody/transformation-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentImage,
          targetImage,
          age,
          weight,
          height: `${heightFeet}'${heightInches}"`,
          timeline,
          workoutPlace,
          dietBudget,
          dailySleep,
          customNotes: customFocus
        })
      });

      const data = await response.json();
      clearInterval(interval);
      setProgress(100);
      setStageIndex(4);

      setTimeout(() => {
        setBlueprintResult(data);
        setIsGenerating(false);
        try {
          localStorage.setItem('fitbody_active_blueprint', JSON.stringify(data));
        } catch (e) {}
        triggerNotification("🎉 ট্রান্সফরমেশন ব্লুপ্রিন্ট তৈরি হয়েছে!", "আপনার বর্তমান ও ড্রিম ফিজিকের ওপর ভিত্তি করে পূর্ণাঙ্গ গাইডলাইন তৈরি সম্পন্ন।");
      }, 600);

    } catch (err) {
      console.error("Blueprint generation error:", err);
      clearInterval(interval);
      setIsGenerating(false);
      triggerNotification("⚠️ নেটওয়ার্ক কিছুটা ধীর", "আমরা অফলাইন ব্যাকআপ ডাটা দিয়ে আপনার ব্লুপ্রিন্ট লোড করছি।");
    }
  };

  const handleCopyPlan = () => {
    if (!blueprintResult) return;
    const text = `
🏆 ${blueprintResult.planTitle || 'AI Physique Transformation Blueprint'}
--------------------------------------------------
📌 বডি মূল্যায়ন:
- বর্তমান বডি ফ্যাট: ${blueprintResult.physiqueAssessment?.currentEstimatedBodyFat || 'N/A'}
- বডি টাইপ: ${blueprintResult.physiqueAssessment?.somatotype || 'N/A'}
- লক্ষ্য অর্জনের সম্ভাবনা: ${blueprintResult.physiqueAssessment?.targetFeasibility || 'N/A'}

🎯 মূল ফোকাস:
${(blueprintResult.keyFocusAreas || []).map((f: string) => `• ${f}`).join('\n')}

🥗 দৈনিক পুষ্টি ও ম্যাক্রো লক্ষ্য:
- ক্যালরি: ${blueprintResult.dailyNutritionPlan?.targetCalories || 2400} kcal
- প্রোটিন: ${blueprintResult.dailyNutritionPlan?.macros?.protein || '140g'}
- কার্বস: ${blueprintResult.dailyNutritionPlan?.macros?.carbs || '250g'}
- ফ্যাট: ${blueprintResult.dailyNutritionPlan?.macros?.fats || '60g'}
- পানি: ${blueprintResult.dailyNutritionPlan?.macros?.water || '4 লিটার'}

📅 সাপ্তাহিক ওয়ার্কআউট স্প্লিট:
${(blueprintResult.weeklyWorkoutSplit || []).map((w: any) => `
${w.day} (${w.focus}):
${(w.exercises || []).map((e: any) => `  - ${e.name} (${e.sets}, ${e.reps}) [টিপ: ${e.tip}]`).join('\n')}
`).join('\n')}

⚡ দৈনিক লাইফস্টাইল ও ডিসিপ্লিন:
${(blueprintResult.lifestyleAndHabits || []).map((h: string) => `• ${h}`).join('\n')}
    `;

    navigator.clipboard.writeText(text);
    triggerNotification("📋 ক্লিপবোর্ডে কপি হয়েছে", "সম্পূর্ণ ট্রান্সফরমেশন প্ল্যানটি কপি করা হয়েছে।");
  };

  const handleDownloadPlan = () => {
    if (!blueprintResult) return;
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(blueprintResult, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SelfX_Physique_Transformation_Plan.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerNotification("💾 প্ল্যান ডাউনলোড হয়েছে", "আপনার ট্রান্সফরমেশন ব্লুপ্রিন্ট সেভ করা হয়েছে।");
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-amber-950/30 border border-emerald-500/30 shadow-[0_4px_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
              DEEP AI MULTIMODAL DUAL-SCANNER
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              HIGH PRECISION KINESIOLOGY
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-display font-black text-white uppercase tracking-wide">
            AI ফিজিক ট্রান্সফরমেশন ও ড্রিম বডি ব্লুপ্রিন্ট
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            আপনার **বর্তমান বডির ছবি** এবং **যেরকম বডি বানাতে চান তার ছবি** আপলোড করুন। AI আপনার ফ্রেম, বডি ফ্যাট ও জেনেটিক্স বিশ্লেষণ করে সম্পূর্ণ ডে-বাই-ডে জিম/হোম রুটিন, খাঁটি দেশি ডায়েট এবং প্রতিদিনের লাইফস্টাইল নির্দেশিকা সাজিয়ে দেবে।
          </p>
        </div>

        {blueprintResult && (
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyPlan}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>কপি</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPlan}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড</span>
            </button>
          </div>
        )}

        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* LIVE CAMERA MODAL IF OPEN */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{cameraTarget === 'current' ? 'বর্তমান বডির ছবি তুলুন' : 'টার্গেট/ড্রিম বডির ছবি তুলুন'}</span>
              </h4>
              <button
                type="button"
                onClick={stopCamera}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800 cursor-pointer"
              >
                বাতিল
              </button>
            </div>

            <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-xl pointer-events-none" />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>ছবি তুলুন ও সেভ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DUAL PHOTO UPLOAD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD 1: CURRENT BODY PHOTO */}
        <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-850 hover:border-zinc-700/80 transition-all space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                  ১. আমার বর্তমান বডির ছবি
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono">Current physique reference</p>
              </div>
            </div>
            {currentImage && (
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                UPLOADED ✓
              </span>
            )}
          </div>

          <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xl bg-zinc-900/80 border border-dashed border-zinc-700/80 overflow-hidden flex flex-col items-center justify-center p-3 group">
            {currentImage ? (
              <div className="relative w-full h-full">
                <img src={currentImage} alt="Current Physique" className="w-full h-full object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="p-2 rounded-lg bg-zinc-900/90 text-zinc-200 hover:text-white border border-zinc-700 cursor-pointer text-xs flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>পরিবর্তন</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'current')} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCurrentImage(null)}
                    className="p-2 rounded-lg bg-red-950/90 text-red-300 hover:text-red-200 border border-red-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-all">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-300">আপনার বডির সামনের একটি ছবি যুক্ত করুন</p>
                  <p className="text-[10px] text-zinc-500 font-sans">টি-শার্ট ছাড়া বা ফিটেড পোশাকে স্পষ্ট ছবি দিলে স্ক্যান নির্ভুল হবে</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <label className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload className="w-3 h-3" />
                    <span>গ্যালারি থেকে সিলেক্ট</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'current')} />
                  </label>
                  <button
                    type="button"
                    onClick={() => startCamera('current')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Camera className="w-3 h-3" />
                    <span>ক্যামেরা</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: TARGET / DREAM BODY PHOTO */}
        <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-850 hover:border-zinc-700/80 transition-all space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                  ২. ড্রিম / লক্ষ্য বডির ছবি (Target Goal)
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono">Desired physique goal</p>
              </div>
            </div>
            {targetImage && (
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                GOAL SET ✓
              </span>
            )}
          </div>

          <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xl bg-zinc-900/80 border border-dashed border-zinc-700/80 overflow-hidden flex flex-col items-center justify-center p-3 group">
            {targetImage ? (
              <div className="relative w-full h-full">
                <img src={targetImage} alt="Target Physique" className="w-full h-full object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="p-2 rounded-lg bg-zinc-900/90 text-zinc-200 hover:text-white border border-zinc-700 cursor-pointer text-xs flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>পরিবর্তন</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'target')} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setTargetImage(null)}
                    className="p-2 rounded-lg bg-red-950/90 text-red-300 hover:text-red-200 border border-red-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-all">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-300">যেরকম বডি বানাতে চান তার ছবি দিন বা প্রিসেট বেছে নিন</p>
                  <p className="text-[10px] text-zinc-500 font-sans">যেকোনো মডেল, অ্যাথলেট বা আপনার পছন্দের ফিজিকের ছবি আপলোড করুন</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <label className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload className="w-3 h-3" />
                    <span>গ্যালারি থেকে ফটো</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'target')} />
                  </label>
                  <button
                    type="button"
                    onClick={() => startCamera('target')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Camera className="w-3 h-3" />
                    <span>ক্যামেরা</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Dream Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              অথবা পছন্দের ড্রিম প্রিসেট বেছে নিন:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DREAM_PHYSIQUE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setTargetImage(preset.image);
                    triggerNotification("🎯 প্রিসেট যুক্ত হয়েছে", `${preset.title} আপনার লক্ষ্য হিসেবে নির্ধারিত হয়েছে।`);
                  }}
                  className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 text-left transition-all cursor-pointer flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-700">
                    <img src={preset.image} alt={preset.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-zinc-200 group-hover:text-amber-300 truncate">
                      {preset.title}
                    </p>
                    <p className="text-[9px] text-zinc-500 truncate font-mono">
                      {preset.tags.join(' • ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* PARAMETERS & PREFERENCES SELECTION */}
      <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
          <Info className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
            ৩. আপনার বর্তমান প্যারামিটার ও কাস্টম প্রেফারেন্স
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {/* Age */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">বয়স (Age)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Current Weight */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">বর্তমান ওজন (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Height */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">উচ্চতা (Feet & Inch)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={heightFeet}
                onChange={(e) => setHeightFeet(Number(e.target.value))}
                placeholder="Feet"
                className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                value={heightInches}
                onChange={(e) => setHeightInches(Number(e.target.value))}
                placeholder="Inch"
                className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">টার্গেট সময়সীমা</label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="3 মাস (3 Months)">৩ মাস (দ্রুত ফ্যাট ড্রপ)</option>
              <option value="6 মাস (6 Months)">৬ মাস (স্ট্যান্ডার্ড রূপান্তর)</option>
              <option value="1 বছর (1 Year)">১ বছর (ম্যাসিভ ট্রান্সফরমেশন)</option>
            </select>
          </div>

          {/* Workout Environment */}
          <div className="space-y-1 col-span-2 sm:col-span-1 md:col-span-2">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">ব্যায়ামের স্থান ও মাধ্যম</label>
            <select
              value={workoutPlace}
              onChange={(e) => setWorkoutPlace(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Gym & Weights (জিমে ডাম্বেল ও রড)">🏋️‍♂️ Gym & Weights (জিমে ডাম্বেল ও রড)</option>
              <option value="Home Calisthenics (বাসায় বডিওয়েট ও পুশ-আপ)">🏠 Home Calisthenics (বাসায় বডিওয়েট ও পুশ-আপ)</option>
              <option value="Dumbbells at Home (বাসায় এক জোড়া ডাম্বেল)">💪 Dumbbells at Home (বাসায় এক জোড়া ডাম্বেল)</option>
            </select>
          </div>

          {/* Diet Budget */}
          <div className="space-y-1 col-span-2 sm:col-span-2 md:col-span-2">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">খাদ্য বাজেট ও প্রেফারেন্স</label>
            <select
              value={dietBudget}
              onChange={(e) => setDietBudget(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="বাজেট ফ্রেন্ডলি খাঁটি দেশি খাবার (ডিম, ভাত, ডাল, ছোলা)">🥚 বাজেট ফ্রেন্ডলি খাঁটি দেশি খাবার (ডিম, ভাত, ডাল, ছোলা)</option>
              <option value="হাই প্রোটিন চিকেন ও ডিম ডায়েট">🍗 হাই প্রোটিন চিকেন ও ডিম ডায়েট</option>
              <option value="স্টুডেন্ট লো-কস্ট মেস ডায়েট">🎓 স্টুডেন্ট লো-কস্ট মেস ডায়েট</option>
            </select>
          </div>
        </div>

        {/* Custom Focus */}
        <div className="space-y-1 pt-1">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">বিশেষ ফোকাস বা নোট (যেমন: পেটের মেদ, চওড়া বুক, বাইসেপ্স)</label>
          <input
            type="text"
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
            placeholder="যেমন: বুকের ওপরের অংশে মাসল ভরাট করা এবং পেটের সিক্স-প্যাক স্পষ্ট করা"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* GENERATE BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerateBlueprint}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
              isGenerating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 active:scale-[0.99] shadow-emerald-950/30'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>ডিপ এআই স্ক্যান ও ব্লুপ্রিন্ট প্রস্তুত হচ্ছে ({progress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>সম্পূর্ণ ট্রান্সফরমেশন প্ল্যান তৈরি করুন (Deep AI Blueprint)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* MULTI-STAGE PROGRESS SCANNER MODAL / OVERLAY */}
      {isGenerating && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-zinc-950 border border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                DEEP MULTIMODAL PHYSIQUE SCANNING IN PROGRESS
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{progress}% COMPLETED</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>

          {/* Stages Checklist */}
          <div className="space-y-2.5 pt-2">
            {STAGES.map((stg, idx) => {
              const isDone = stageIndex > idx;
              const isCurrent = stageIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isDone 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                      : isCurrent 
                      ? 'bg-zinc-900 border-emerald-500/60 text-white shadow-md' 
                      : 'bg-zinc-950/50 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      isDone ? 'bg-emerald-500 text-zinc-950' : isCurrent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-600'
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{stg.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{stg.desc}</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* GENERATED TRANSFORMATION BLUEPRINT DISPLAY */}
      {blueprintResult && !isGenerating && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-[#090b10] border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.12)] space-y-6 relative"
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                VERIFIED AI BLUEPRINT
              </span>
              <h3 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-wider mt-1">
                {blueprintResult.planTitle || "আলটিমেট বডি ট্রান্সফরমেশন ব্লুপ্রিন্ট"}
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                আপনার শরীর, মেটাবলিজম ও ড্রিম ফিজিকের ওপর ভিত্তি করে পূর্ণাঙ্গ বৈজ্ঞানিক গাইডলাইন
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPlan}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>কপি</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPlan}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>সেভ</span>
              </button>
            </div>
          </div>

          {/* SUB-TABS NAVIGATION */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-850">
            {[
              { id: 'overview', label: '১. বডি মূল্যায়ন ও লক্ষ্য', icon: Flame },
              { id: 'workout', label: '২. ৭ দিনের ওয়ার্কআউট স্প্লিট', icon: Dumbbell },
              { id: 'diet', label: '৩. দেশি খাদ্য ও পুষ্টি প্ল্যান', icon: Apple },
              { id: 'protein', label: '৪. দেশি প্রোটিন বাজেট ম্যাট্রিক্স', icon: Zap },
              { id: 'vtaper', label: '৫. ভি-ট্যাপার গোল্ডেন রেশিও', icon: Target },
              { id: 'habits', label: '৬. ডেইলি ডিসিপ্লিন ট্র্যাকার', icon: Moon },
              { id: 'phases', label: '৭. মাসভিত্তিক মাইলস্টোন', icon: Award },
            ].map((tb) => {
              const IconComp = tb.icon;
              const isActive = activeTabSection === tb.id;
              return (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setActiveTabSection(tb.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-display font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md'
                      : 'bg-zinc-900/50 text-zinc-400 border border-zinc-850 hover:text-zinc-200'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span>{tb.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & PHYSIQUE ASSESSMENT */}
          {activeTabSection === 'overview' && (
            <div className="space-y-5">
              {/* Assessment Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">আনুমানিক বডি ফ্যাট %</span>
                  <p className="text-base font-black text-emerald-400 font-mono">
                    {blueprintResult.physiqueAssessment?.currentEstimatedBodyFat || "১৮% - ২২%"}
                  </p>
                  <p className="text-[10px] text-zinc-400">বর্তমান ফটো স্ক্যান অনুসারে</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">শারীরিক গঠন (Somatotype)</span>
                  <p className="text-base font-black text-amber-300 font-mono">
                    {blueprintResult.physiqueAssessment?.somatotype || "স্কিনি ফ্যাট / এন্ডোমর্ফ"}
                  </p>
                  <p className="text-[10px] text-zinc-400">মেটাবলিজম ও বডি ফ্রেম টাইপ</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">টার্গেট অর্জনের বাস্তবতা</span>
                  <p className="text-base font-black text-sky-400 font-mono">
                    {timeline}
                  </p>
                  <p className="text-[10px] text-zinc-400">১০০% ডিসিপ্লিনে ৮৫-৯০% পৌঁছানো সম্ভব</p>
                </div>
              </div>

              {/* Feasibility & Posture Notes */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                <h4 className="text-xs font-bold text-zinc-200 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>অ্যানাটমি ও ফ্রেম বিশ্লেষণ:</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {blueprintResult.physiqueAssessment?.postureAndFrameNotes || "আপনার কাঁধ ও বুকের ওপরের অংশ ভরাট করার জন্য ইনক্লাইন প্রেস এবং ল্যাটেরাল রেইজ সবচেয়ে কার্যকর। পেটের মেদ ঝরিয়ে ড্রিম ফিজিকের কাঠামোর সাথে সমন্বয় করতে ক্যালরি ডেফিসিট ও পর্যাপ্ত প্রোটিন বজায় রাখুন।"}
                </p>
              </div>

              {/* Key Focus Muscle Areas */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>মূল টার্গেট পয়েন্টস (Target Muscle Priorities):</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(blueprintResult.keyFocusAreas || [
                    "উপরের বুক ও কলারবোন ভরাট করা (Upper Chest Incline Focus)",
                    "ভি-টেপার পিঠ চওড়া করা (Wide Lats & V-Taper)",
                    "গোল কাঁধ বা থ্রিডি ডেল্টস (Shoulder 3D Deltoids)",
                    "লোয়ার বেলি ফ্যাট ড্রপ ও সিক্স প্যাক অ্যাবস",
                    "হাতের বাইসেপ্স ও ট্রাইসেপ্স পিক"
                  ]).map((focus: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-850 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-xs font-bold text-zinc-200">{focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do's and Don'ts */}
              {blueprintResult.dosAndDonts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <h5 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>যা অবশ্যই করবেন (DOs):</span>
                    </h5>
                    <ul className="space-y-1.5">
                      {(blueprintResult.dosAndDonts.dos || []).map((d: string, idx: number) => (
                        <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <h5 className="text-xs font-bold text-red-300 uppercase flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>যা কঠোরভাবে পরিহার করবেন (DON'Ts):</span>
                    </h5>
                    <ul className="space-y-1.5">
                      {(blueprintResult.dosAndDonts.donts || []).map((d: string, idx: number) => (
                        <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 7-DAY WORKOUT SPLIT */}
          {activeTabSection === 'workout' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">সাপ্তাহিক রুটিন ও স্প্লিট ({workoutPlace})</h4>
                  <p className="text-[10px] text-zinc-400 font-mono">বিজ্ঞানসম্মত পুশ-পুল-লেগ্স বা আপার-লোয়ার হাইপারট্রফি শিডিউল</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  ৭ DAYS COMPLETE SPLIT
                </span>
              </div>

              <div className="space-y-3">
                {(blueprintResult.weeklyWorkoutSplit || []).map((split: any, idx: number) => (
                  <div key={idx} className="p-4.5 rounded-xl bg-zinc-950/80 border border-zinc-850 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-850 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h5 className="text-xs font-display font-black text-white uppercase tracking-wider">
                          {split.day}
                        </h5>
                      </div>
                      <span className="text-[11px] text-amber-300 font-mono font-bold">
                        {split.focus}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(split.exercises || []).map((ex: any, eIdx: number) => (
                        <div key={eIdx} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-bold text-zinc-200">{ex.name}</p>
                            {ex.tip && (
                              <p className="text-[10px] text-zinc-400 font-sans flex items-center gap-1">
                                <span className="text-emerald-400 font-bold">টিপ:</span> {ex.tip}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-emerald-400 font-bold">
                              {ex.sets}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                              {ex.reps}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                              রেস্ট: {ex.rest}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIET & NUTRITION PLAN */}
          {activeTabSection === 'diet' && (
            <div className="space-y-5">
              {/* Macros Target Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-zinc-950 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">দৈনিক ক্যালরি টার্গেট</span>
                  <p className="text-xl font-black text-white font-mono">
                    {blueprintResult.dailyNutritionPlan?.targetCalories || 2350} <span className="text-xs font-normal text-zinc-400">kcal/day</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] font-mono text-zinc-500 block">প্রোটিন (Protein)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{blueprintResult.dailyNutritionPlan?.macros?.protein || "140g"}</span>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] font-mono text-zinc-500 block">কার্বস (Carbs)</span>
                    <span className="text-xs font-mono font-bold text-amber-300">{blueprintResult.dailyNutritionPlan?.macros?.carbs || "240g"}</span>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] font-mono text-zinc-500 block">ফ্যাট (Healthy Fat)</span>
                    <span className="text-xs font-mono font-bold text-sky-400">{blueprintResult.dailyNutritionPlan?.macros?.fats || "60g"}</span>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] font-mono text-zinc-500 block">পানি (Water)</span>
                    <span className="text-xs font-mono font-bold text-blue-400">{blueprintResult.dailyNutritionPlan?.macros?.water || "4L"}</span>
                  </div>
                </div>
              </div>

              {/* 6 Daily Meals List */}
              <div className="space-y-3">
                <h4 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Apple className="w-4 h-4 text-emerald-400" />
                  <span>দৈনিক ৬ বেলার দেশি পুষ্টিকর খাবার তালিকা:</span>
                </h4>

                {(blueprintResult.dailyNutritionPlan?.meals || []).map((meal: any, mIdx: number) => (
                  <div key={mIdx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                      <h5 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center">
                          {mIdx + 1}
                        </span>
                        <span>{meal.mealName}</span>
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">প্রোটিন: {meal.protein}</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400">{meal.calories}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {meal.items}
                    </p>
                  </div>
                ))}
              </div>

              {/* Supplements Guide */}
              {blueprintResult.dailyNutritionPlan?.supplementsGuide && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                  <h5 className="text-xs font-bold text-amber-300 uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>সাপ্লিমেন্ট ও ভিটামিন পরামর্শ (Natural & Budget Friendly):</span>
                  </h5>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {blueprintResult.dailyNutritionPlan.supplementsGuide}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DESI PROTEIN BUDGET MATRIX */}
          {activeTabSection === 'protein' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>সাশ্রয়ী দেশি হাই-প্রোটিন ক্যালকুলেটর ও মূল্য তালিকা</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    দামি সাপ্লিমেন্ট ছাড়া খাঁটি দেশি খাবার দিয়ে প্রতিদিন ১০০-১৪০ গ্রাম প্রোটিন পূরণ করুন
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold self-start sm:self-auto">
                  টার্গেট: ১২০g প্রোটিন / দিন
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'ফার্মের ডিম (Egg)', qty: '৪ টি সেদ্ধ ডিম', protein: '২৪ গ্রাম', cost: '৳৪৮-৳৫২', costPerG: '৳২.০/g', desc: 'সেরা বায়োলজিক্যাল ভ্যালুযুক্ত লিন প্রোটিন ও কোলিন' },
                  { name: 'ছোলা বুট (Boiled Chickpeas)', qty: '১০০ গ্রাম ভেজানো/সেদ্ধ', protein: '১৯ গ্রাম', cost: '৳১২-৳১৫', costPerG: '৳০.৭/g', desc: 'সর্বনিম্ন খরচে মাসল ফাইবার ও ক্লিন কার্বোহাইড্রেট' },
                  { name: 'কাঁচা বাদাম বা ছাতু (Peanuts/Sattu)', qty: '৬০ গ্রাম ছাতুর শরবত', protein: '১৬ গ্রাম', cost: '৳১৮-৳২২', costPerG: '৳১.১/g', desc: 'সহজে হজমযোগ্য ড্রিংক ও দীর্ঘস্থায়ী শক্তি' },
                  { name: 'মুরগির বুকের মাংস (Chicken Breast)', qty: '১৫০ গ্রাম সেদ্ধ/গ্রিল', protein: '৪৬ গ্রাম', cost: '৳৬৫-৳৭৫', costPerG: '৳১.৫/g', desc: 'জিরো ফ্যাট খাঁটি পেশী বৃদ্ধির গোল্ড স্ট্যান্ডার্ড' },
                  { name: 'মসুর ডাল (Lentils thick soup)', qty: '১ বাটি ঘন ডাল', protein: '১২ গ্রাম', cost: '৳১০-৳১২', costPerG: '৳০.৯/g', desc: 'প্রতিদিনের ভাতের সাথে সহজে অতিরিক্ত প্রোটিন যোগ' },
                  { name: 'পাঙ্গাশ / তেলাপিয়া / রুই মাছ', qty: '১ টুকরো (১০০g)', protein: '২০ গ্রাম', cost: '৳২৫-৳৩০', costPerG: '৳১.৩/g', desc: 'ওমেগা-৩ ফ্যাটি এসিড ও ক্লিন মাসল বিল্ডিং' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-850 space-y-2 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white font-display truncate">{item.name}</h5>
                      <span className="text-xs font-mono font-black text-emerald-400">{item.protein}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>পরিমাণ: {item.qty}</span>
                      <span className="text-amber-400 font-bold">{item.cost}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-sans leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-zinc-950 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white uppercase font-display">💡 ডেইলি অল-ইন-ওয়ান স্টুডেন্ট কম্বো</span>
                  <p className="text-[11px] text-zinc-300">৪টি ডিম (২৪g) + ১০০g ছোলা (১৯g) + ৬০g ছাতু (১৬g) + ১৫০g চিকেন (৪৬g) = <strong className="text-emerald-400">১০৫ গ্রাম প্রোটিন</strong></p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-zinc-500 font-mono block">মোট দৈনিক খরচ</span>
                  <span className="text-base font-black text-emerald-400 font-mono">≈ ৳১৩০ - ৳১৫০</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: V-TAPER GOLDEN RATIO CALCULATOR */}
          {activeTabSection === 'vtaper' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>ভি-ট্যাপার (V-Taper) ও অ্যাডোনিস গোল্ডেন রেশিও মাপক</span>
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono">
                  ক্লাসিক্যাল গ্রিক ভাস্কর্য ও হলিউড ফিজিকের আইডিয়াল অনুপাত হলো ১.৬১৮:১ (কাঁধ বনাম কোমর)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inputs */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3">
                  <span className="text-xs font-bold text-white uppercase">শারীরিক পরিমাপ (ইঞ্চিতে):</span>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">কাঁধের পরিধি (Shoulder Circumference):</span>
                      <span className="text-amber-400 font-mono font-bold">{shoulderInch} ইঞ্চি</span>
                    </div>
                    <input 
                      type="range" 
                      min={32} 
                      max={60} 
                      value={shoulderInch} 
                      onChange={(e) => setShoulderInch(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">কোমরের পরিধি (Waist Circumference):</span>
                      <span className="text-emerald-400 font-mono font-bold">{waistInch} ইঞ্চি</span>
                    </div>
                    <input 
                      type="range" 
                      min={24} 
                      max={48} 
                      value={waistInch} 
                      onChange={(e) => setWaistInch(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Score & Verdict Card */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase">আপনার বর্তমান রেশিও</span>
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {vTaperRatio} : 1.00
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>আইডিয়াল ১.৬১৮ গোল্ডেন রেশিওর সাথে নৈকট্য:</span>
                      <span className="font-bold text-emerald-400">{vTaperScore}% ম্যাচ</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${vTaperScore}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    {Number(vTaperRatio) >= 1.55 
                      ? '🔥 চমৎকার ভি-ট্যাপার ফ্রেম! কাঁধের চওড়া ভাব বজায় রেখে কোর মাসল টাইট রাখুন।'
                      : Number(vTaperRatio) >= 1.40
                      ? '⚡ ভালো অ্যাথলেটিক বেস। ল্যাটেরাল রেইজ ও পুল-আপ দিয়ে কাঁধ আরও ২-৩ ইঞ্চি বড় করুন এবং পেটের ফ্যাট ঝরান।'
                      : '🎯 লক্ষ্য: পেটের মেদ ঝরিয়ে কোমর ২৯-৩১ ইঞ্চিতে আনা এবং ল্যাটস ও শোল্ডারে নিয়মিত ওয়েট ট্রেনিং দেওয়া।'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DAILY HABITS & DISCIPLINE TRACKER */}
          {activeTabSection === 'habits' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">দৈনিক ডিসিপ্লিন ও ট্রান্সফরমেশন ট্র্যাকার</h4>
                  <p className="text-[10px] text-zinc-400 font-mono">প্রতিদিন সম্পন্ন করে চেক বক্সে টিক দিন (স্বয়ংক্রিয় সেভ হবে)</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {Object.values(habitTicks).filter(Boolean).length} / 6 সম্পন্ন
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'water', title: '৩.৫ লিটার বিশুদ্ধ পানি পান', desc: 'ডিটক্স ও স্কিন গ্লো' },
                  { id: 'sleep', title: '৭.৫ - ৮ ঘণ্টা গভীর ঘুম', desc: 'টেস্টোস্টেরন ও মাসল রিকভারি' },
                  { id: 'protein', title: 'টার্গেট প্রোটিন গ্রহণ (১০০g+)', desc: 'পেশী ক্ষয় রোধ ও গ্রোথ' },
                  { id: 'steps', title: '৮,০০০ - ১০,০০০ স্টেপস ওয়াক', desc: 'ল্যাথার্জিক ফ্যাট বার্ন' },
                  { id: 'sugar', title: 'জিরো প্রসেসড সুগার ও জাঙ্ক ফুড', desc: 'ওয়াটার রিটেনশন ও ফেস ব্লোটিং রোধ' },
                  { id: 'posture', title: 'সোজা মেরুদণ্ড ও সঠিক পশ্চার', desc: 'ভিজুয়াল শোল্ডার ওয়াইডেনিং' }
                ].map((hab) => {
                  const isChecked = !!habitTicks[hab.id];
                  return (
                    <div 
                      key={hab.id}
                      onClick={() => toggleHabit(hab.id)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-white' 
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-emerald-500 border-emerald-400 text-zinc-950' : 'border-zinc-700 bg-zinc-900'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${isChecked ? 'text-emerald-300 line-through opacity-80' : 'text-zinc-200'}`}>
                          {hab.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">{hab.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Routine Recommendations */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">ব্লুপ্রিন্ট গাইডলাইন:</span>
                {(blueprintResult.lifestyleAndHabits || []).map((habit: string, hIdx: number) => (
                  <div key={hIdx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-mono font-bold text-[10px] mt-0.5">
                      {hIdx + 1}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {habit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TRANSFORMATION PHASES */}
          {activeTabSection === 'phases' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850">
                <h4 className="text-xs font-bold text-white uppercase">মাসভিত্তিক ট্রান্সফরমেশন রোডম্যাপ ({timeline})</h4>
                <p className="text-[10px] text-zinc-400 font-mono">আপনার ফিজিক পরিবর্তনের সম্ভাব্য ধাপ ও লক্ষ্যমাত্রা</p>
              </div>

              <div className="space-y-3">
                {(blueprintResult.transformationPhases || []).map((phs: any, pIdx: number) => (
                  <div key={pIdx} className="p-4.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                        PHASE {pIdx + 1}
                      </span>
                      <h5 className="text-xs font-display font-black text-white uppercase tracking-wider">
                        {phs.phase}
                      </h5>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans pl-2 border-l-2 border-emerald-500/40">
                      {phs.goal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
}
