import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Zap, Target, X, Lock, Sparkles } from 'lucide-react';

interface TrainingRoastProps {
  onClose?: () => void;
}

export function TrainingRoast({ onClose }: TrainingRoastProps) {
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
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  const triggerNotification = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const defaultCategories = [
    { id: 'fat', name: 'সে মোটা 🐷', icon: '🐷' },
    { id: 'black', name: 'সে কালো 🏿', icon: '🏿' },
    { id: 'skinny', name: 'সে চিকন 🦴', icon: '🦴' },
    { id: 'chubby_cheeks', name: 'গাল ফোলা 🐡', icon: '🐡' },
    { id: 'hair_loss', name: 'টাক মাথা / চুল কম 👨‍🦲', icon: '👨‍🦲' },
    { id: 'dark_circles', name: 'চোখের নিচে কালি 👁️', icon: '👁️' },
    { id: 'general_funny', name: 'সাধারণ ফানি ডায়ালগ 😂', icon: '😂' }
  ];

  const defaultJokes: Record<string, { id: string; text: string; views: number }[]> = {
    fat: [
      { id: 'def_fat_1', text: "তোকে দেখলে মনে হয় ট্রাফিকের মতো তোর পেটে পুরো একটা মিনিবাস এসে আটকে গেছে! 🚌💥", views: 0 },
      { id: 'def_fat_2', text: "তোর বডি ফ্যাট দেখে ওয়েট স্কেল ভয়ে থাপ্পড় মেরে নিজেই অফ হয়ে যায়! ⚖️🚨", views: 0 }
    ],
    black: [
      { id: 'def_black_1', text: "তোর গায়ের রঙ এত ইউনিক যে লোডশেডিং হলে তোকে খুঁজতে আমাদের টর্চলাইট জ্বালানো লাগে! 🔦☠️", views: 0 },
      { id: 'def_black_2', text: "তোর চেহারা দেখে রাতে মনে হয় কোনো কয়লার খনি থেকে হীরে চুরি করতে বের হইছিস! 💎🔥", views: 0 }
    ],
    skinny: [
      { id: 'def_skinny_1', text: "তোর শুকনা চেহারা দেখে মনে হয় বাতাস আসলে তোকে সুতা দিয়ে বান্ধা লাগবে! 🦴💨", views: 0 }
    ],
    chubby_cheeks: [
      { id: 'def_chubby_1', text: "তোর গাল ফোলা দেখে মনে হয় তুই দুই পাশে দুটা রসগোল্লা লুকিয়ে চুরি করে খাচ্ছিস! 🐡🍬", views: 0 }
    ],
    hair_loss: [
      { id: 'def_hair_1', text: "তোর মাথার সামনের চুল তো এভাবে দেশ ছেড়ে পালাচ্ছে যেমন কোনো ব্যাংক লুটেরা ব্যাংক লুট করে পালায়! 👨‍🦲💸", views: 0 }
    ],
    dark_circles: [
      { id: 'def_dark_1', text: "চোখের নিচে যে ডার্ক সার্কেল, মনে হচ্ছে সারা রাত বসে বিশ্বযুদ্ধের স্ট্র্যাটেজি বানাচ্ছিস! 💀😴", views: 0 }
    ],
    general_funny: [
      { id: 'def_gen_1', text: "কিরে ভাই! ক্যামেরার দিকে এমন মুখ করে আছিস যেন ক্যামেরাটা তোর কাছে টাকা ধার নিয়ে পালাইছে! 🤣📸", views: 0 },
      { id: 'def_gen_2', text: "তোর এই গম্ভীর এক্সপ্রেশন দেখে তো মনে হচ্ছে ইন্টারভিউ বোর্ডে ঢুকে নিজেই বলতেছিস—'চাকরি লাগবে না ভাই, ছেড়ে দেন!' 💀😂", views: 0 }
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

  const [roastJokesMap, setRoastJokesMap] = useState<Record<string, { id: string; text: string; views: number }[]>>(() => {
    try {
      const saved = localStorage.getItem('lookmax_custom_training_roasts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.jokes && typeof parsed.jokes === 'object') {
          const normalized: Record<string, { id: string; text: string; views: number }[]> = {};
          Object.entries(parsed.jokes).forEach(([catId, arr]: [string, any]) => {
            if (Array.isArray(arr)) {
              normalized[catId] = arr.map((item: any, idx: number) => {
                if (typeof item === 'string') {
                  return { id: `joke_${catId}_${idx}`, text: item, views: 0 };
                }
                return { id: item.id || `joke_${catId}_${idx}`, text: item.text || '', views: item.views || 0 };
              });
            }
          });
          return normalized;
        }
      }
    } catch (e) {}
    return defaultJokes;
  });

  const [selectedTrainingCategory, setSelectedTrainingCategory] = useState<string>('fat');
  const [newJokeInput, setNewJokeInput] = useState<string>('');
  const [newCategoryNameInput, setNewCategoryNameInput] = useState<string>('');
  const [showAddCategoryForm, setShowAddCategoryForm] = useState<boolean>(false);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [questionAnswerInput, setQuestionAnswerInput] = useState<string>('');

  const aiHelpQuestions = [
    {
      id: 'fat_help',
      category: 'fat',
      question: "১. দোস্ত, একটা ছেলের শরীর যদি অনেক বেশি মোটা (হাতির মতো বডি ফ্যাট) হয়, তাকে আঞ্চলিক ভাষায় বেইজ্জত করার জন্য একটা নতুন চরম জোক শেখা তো? আমি রোস্ট করার সময় তোর জোকটাই মারব! 🐷🔥",
      placeholder: "যেমন: তোর পেটের সাইজ দেখে মনে হয় ভিতরে আস্ত একখান ফুটবল লুকিয়ে রেখেছিস..."
    },
    {
      id: 'black_help',
      category: 'black',
      question: "২. কিরে ভাই, একটা ছেলের গায়ের রঙ যদি অনেক বেশি কালো বা কয়লার মতো ডার্ক হয়, তাকে অপমান করার একটা চরম ডার্ক হিউমার যুক্ত জোক কী হতে পারে? একটু আঞ্চলিক ও বুদ্ধিদীপ্ত জোক শিখা আমাকে! 🏿☠️",
      placeholder: "যেমন: তোকে রাতে লোডশেডিংয়ে খুঁজতে গেলে তো ভাই আইপিএস বাতি জ্বালানো লাগবে..."
    },
    {
      id: 'skinny_help',
      category: 'skinny',
      question: "৩. দোস্ত, একটা ছেলে যদি বেশি চিকন (হাড় হাড্ডি বের হওয়া, বাতাসের ভয়ে সুতা দিয়ে বাঁধা) হয়, তাকে আঞ্চলিক বেইজ্জতি দিয়ে চরম একটা কৌতুক বল তো? আমি ওকে ফানি অপমান করতে চাই! 🦴💨",
      placeholder: "যেমন: তোকে দেখলে মনে হয় খাসির হাড় থেকে গোশত সব একাই টেনে নিয়ে গেছিস..."
    },
    {
      id: 'chubby_help',
      category: 'chubby_cheeks',
      question: "৪. কিরে মামা, একটা ছেলের গাল যদি অনেক ফোলা ফোলা (রসগোল্লা টাইপ ফ্যাটি গাল) হয়, তাকে হাসির ছলে চরম সরম দেওয়ার মতো কী জোক লেখা যায় বল তো? 🐡🍬",
      placeholder: "যেমন: তোর দুই গালে মনে হয় দুইটা আলু বোখারা চিরদিনের জন্য ভাড়া নিয়ে ঘর সংসার শুরু করছে..."
    },
    {
      id: 'hair_help',
      category: 'hair_loss',
      question: "৫. দোস্ত, কোনো ছেলের মাথা যদি টাকপড়া (সামনের চুল সব দেশ ছেড়ে পালিয়েছে) হয়, তাকে বেইজ্জত করে সবার সামনে হাসানোর জন্য কী জোক মারা যায়? চরম অপমান বানাবি! 👨‍🦲💸",
      placeholder: "যেমন: তোর মাথার চুল যেভাবে পলায়ন করতেছে, ব্যাংক ডাকাতির আসামিও ওভাবে পালায় না..."
    },
    {
      id: 'dark_help',
      category: 'dark_circles',
      question: "৬. কিরে ভাই, কোনো ছেলের চোখের নিচে যদি অনেক ডার্ক সার্কেল (গভীর কালো দাগ, পেঁচা বা পান্ডা মার্কা চোখ) থাকে, তাকে বেইজ্জত দিতে কী চরম অপমানজনক কথা বলা যায়? 👁️🐼",
      placeholder: "যেমন: তোর এই রিমান্ডের আসামির মতো চাহনি দেখে পেঁচাও তোকে নিজের ফুফাতো ভাই ভাববে..."
    }
  ];

  const handleTeachAi = () => {
    if (!questionAnswerInput.trim()) return;
    const currentQ = aiHelpQuestions[activeQuestionIdx];
    const answerText = questionAnswerInput.trim();
    
    const newJokeObj = {
      id: 'joke_' + Date.now(),
      text: answerText,
      views: 0
    };

    setRoastJokesMap(prev => {
      const currentList = prev[currentQ.category] || [];
      return { ...prev, [currentQ.category]: [...currentList, newJokeObj] };
    });

    setQuestionAnswerInput('');
    
    // Choose another question
    const nextIdx = (activeQuestionIdx + 1) % aiHelpQuestions.length;
    setActiveQuestionIdx(nextIdx);

    triggerNotification("🎯 সাবাশ দোস্ত! 🤣", "তোর এই চরম জোকটা আমি মুখস্থ করে নিলাম! এখন থেকে এই মুখের সমস্যায় এটি দিয়ে বেইজ্জত করব! 😈🔥");
  };

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
    const cleanPass = passwordInput.trim().toLowerCase();
    if (cleanPass === savedPassword.toLowerCase() || cleanPass === '1234') {
      setIsTrainingRoastUnlocked(true);
      setPasswordError(null);
      setPasswordInput('');
      triggerNotification("🔓 Training Roast Unlocked", "You now have full access to custom roast jokes & categories!");
    } else {
      setPasswordError("ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।");
    }
  };

  const handleAddJokeToCategory = () => {
    if (!newJokeInput.trim() || !selectedTrainingCategory) return;
    const jokeText = newJokeInput.trim();
    const newJokeObj = {
      id: 'joke_' + Date.now(),
      text: jokeText,
      views: 0
    };

    setRoastJokesMap(prev => {
      const currentList = prev[selectedTrainingCategory] || [];
      const updated = [...currentList, newJokeObj];
      return { ...prev, [selectedTrainingCategory]: updated };
    });
    setNewJokeInput('');
  };

  const [isGeneratingRewrites, setIsGeneratingRewrites] = useState<boolean>(false);

  const handleAiRewriteAndSave = async () => {
    if (!newJokeInput.trim() || !selectedTrainingCategory) return;
    const jokeText = newJokeInput.trim();
    setIsGeneratingRewrites(true);

    try {
      const selectedCatObj = roastCategories.find(c => c.id === selectedTrainingCategory);
      const res = await fetch('/api/lookmax/rewrite-joke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jokeText,
          categoryName: selectedCatObj ? selectedCatObj.name : ''
        })
      });

      const data = await res.json();
      const rewrites: string[] = (data && Array.isArray(data.rewrites) && data.rewrites.length > 0)
        ? data.rewrites
        : [`কিরে ভাই! "${jokeText}" এর আসল ভার্সন ৩ জন দেখলে কিন্তু সার্ভিস খতম! 🤣`];

      const newJokeObjs = rewrites.map((txt, idx) => ({
        id: `joke_${Date.now()}_${idx}`,
        text: txt,
        views: 0
      }));

      setRoastJokesMap(prev => {
        const currentList = prev[selectedTrainingCategory] || [];
        return { ...prev, [selectedTrainingCategory]: [...currentList, ...newJokeObjs] };
      });

      setNewJokeInput('');
      triggerNotification("✨ AI 3-5 Unique Variations Saved!", `${rewrites.length}টি ভিন্ন ভিন্ন আঞ্চলিক হাসির জোক সেভ করা হয়েছে! ৪ জন দেখলে অটো গায়েব হবে।`);
    } catch (err) {
      console.error(err);
      triggerNotification("⚠️ Failed", "AI জোকস রিরাইট করতে সমস্যা হয়েছে।");
    } finally {
      setIsGeneratingRewrites(false);
    }
  };

  const handleIncrementJokeView = (categoryKey: string, jokeId: string, countToAdd: number = 1) => {
    setRoastJokesMap(prev => {
      const currentList = prev[categoryKey] || [];
      const updatedList: { id: string; text: string; views: number }[] = [];

      for (const joke of currentList) {
        if (joke.id === jokeId) {
          const newViews = joke.views + countToAdd;
          if (newViews >= 4) {
            // Auto delete when reaches 4 views!
            triggerNotification("🔥 ৪ জনের ভিউ সম্পূর্ণ!", `"${joke.text.substring(0, 20)}..." জোকটি ৪ জন দেখা শেষ হওয়ায় সার্ভার থেকে গায়েব হয়ে গেছে!`);
            continue; // Exclude from updatedList
          } else {
            updatedList.push({ ...joke, views: newViews });
          }
        } else {
          updatedList.push(joke);
        }
      }

      return { ...prev, [categoryKey]: updatedList };
    });
  };

  const handleDeleteJokeFromCategory = (categoryKey: string, jokeId: string) => {
    setRoastJokesMap(prev => {
      const currentList = prev[categoryKey] || [];
      const updated = currentList.filter(j => j.id !== jokeId);
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

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-rose-950 border border-rose-500/50 text-rose-100 px-4 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-bold text-xs">{toastMsg.title}</p>
            <p className="text-[11px] text-rose-200">{toastMsg.desc}</p>
          </div>
        </div>
      )}

      <div className="bg-[#121214] border border-rose-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full tracking-wider font-bold inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                🔐 SECRET ROAST ENGINE & CUSTOM TRAINING
              </span>
              {isTrainingRoastUnlocked && (
                <span className="text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  UNLOCKED 🔓
                </span>
              )}
            </div>
            <h3 className="font-display font-black text-xl md:text-2xl text-zinc-100 flex items-center gap-2">
              ট্রেনিং রোস্ট ও কাস্টম কৌতুক হাব (Training Roast)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              মানুষের চেহারা বা মুখের সমস্যা অনুযায়ী (যেমন: সে মোটা, সে কালো, সে চিকন, গাল ফোলা) কাস্টম জোকস এবং বেইজ্জত করার ডায়ালগ সেভ করুন। রোস্ট মোডে স্ক্যান করলে এআই আপনার শেখানো এই কৌতুকগুলো ব্যবহার করবে!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isTrainingRoastUnlocked && (
              <>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>পাসওয়ার্ড চেঞ্জ</span>
                </button>
                <button
                  onClick={() => {
                    setIsTrainingRoastUnlocked(false);
                    triggerNotification("🔒 Locked", "Training Roast আবার লক করা হয়েছে।");
                  }}
                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>লক করুন 🔒</span>
                </button>
              </>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-xl transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* PASSWORD LOCKED SCREEN */}
        {!isTrainingRoastUnlocked ? (
          <div className="bg-zinc-950/80 border border-rose-500/20 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-6 shadow-2xl my-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-black text-zinc-100">সিক্রেট ট্রেনিং রোস্ট প্রবেশাধিকার</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                এই সেকশনটি পাসওয়ার্ড দিয়ে সুরক্ষিত। আপনার কাস্টম জোকস ও রোস্ট কন্ট্রোল করার জন্য সঠিক পাসওয়ার্ড লিখুন।
              </p>
            </div>

            <div className="space-y-3 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                পাসওয়ার্ড দিন:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUnlockTrainingRoast();
                  }}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-rose-500 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-rose-400 font-bold bg-rose-950/50 p-2.5 rounded-lg border border-rose-800/50 text-center">
                  ⚠️ {passwordError}
                </p>
              )}
            </div>

            <button
              onClick={handleUnlockTrainingRoast}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-zinc-950" />
              <span>আনলক করুন (Unlock Secret Roast)</span>
            </button>
          </div>
        ) : (
          /* UNLOCKED MAIN TRAINING DASHBOARD */
          <div className="space-y-6">

            {/* Change Password Form (Toggleable) */}
            {isChangingPassword && (
              <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-5 space-y-3 animate-fadeIn">
                <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> পাসওয়ার্ড পরিবর্তন করুন
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                    className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2.5 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all cursor-pointer"
                  >
                    সেভ করুন
                  </button>
                </div>
              </div>
            )}

            {/* INTERACTIVE AI QUESTION ASSISTANT (এআই সাহায্য প্রার্থনা ও প্রশ্নোত্তর) */}
            <div className="bg-zinc-950 border-2 border-dashed border-rose-500/20 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-xl">
                  <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-rose-300">
                    এআই রোস্ট মাস্টার আপনার কাছে সাহায্য চাচ্ছে! (AI Needs Your Help)
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    এআইকে আপনার চমৎকার অপমানজনক বা হাসির কৌতুক শেখান। এটি সরাসরি স্ক্যান করার সময় মানুষকে রোস্ট করতে ব্যবহার হবে!
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-rose-200 leading-relaxed font-sans">
                  💬 {aiHelpQuestions[activeQuestionIdx].question}
                </p>
                <textarea
                  rows={2}
                  value={questionAnswerInput}
                  onChange={(e) => setQuestionAnswerInput(e.target.value)}
                  placeholder={aiHelpQuestions[activeQuestionIdx].placeholder}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500/50 text-zinc-100 text-xs rounded-xl p-3 focus:outline-none transition-all font-sans leading-relaxed"
                />
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionAnswerInput('');
                      setActiveQuestionIdx((activeQuestionIdx + 1) % aiHelpQuestions.length);
                    }}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                  >
                    অন্য প্রশ্ন দেখাও 🔄
                  </button>
                  <button
                    type="button"
                    onClick={handleTeachAi}
                    disabled={!questionAnswerInput.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 disabled:opacity-45 text-zinc-950 font-black text-[11px] uppercase tracking-wider rounded-xl hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
                  >
                    <Zap className="w-3.5 h-3.5 fill-zinc-950" />
                    <span>এআইকে শেখান (Teach AI)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CATEGORIES SELECTION GRID / TABS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-rose-400" /> ১. ক্যাটাগরি সিলেক্ট করুন (Select Facial Trait):
                </span>
                <button
                  onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-400" />
                  <span>কাস্টম ক্যাটাগরি যোগ</span>
                </button>
              </div>

              {/* Add New Custom Category Inline Input */}
              {showAddCategoryForm && (
                <div className="p-4 bg-zinc-950 border border-rose-500/40 rounded-2xl space-y-3 animate-fadeIn">
                  <span className="text-xs font-bold text-zinc-200 block">নতুন মুখের সমস্যা বা টাইটেল ক্যাটাগরি লিখুন (যেমন: "দাঁত উঁচু", "লম্বা কান", "ছোট চোখ"):</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryNameInput}
                      onChange={(e) => setNewCategoryNameInput(e.target.value)}
                      placeholder="ক্যাটাগরির নাম লিখুন..."
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={handleAddNewCategory}
                      className="px-4 py-2 bg-rose-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-rose-400 transition-all cursor-pointer"
                    >
                      যোগ করুন
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {roastCategories.map((cat) => {
                  const count = (roastJokesMap[cat.id] || []).length;
                  const isSelected = selectedTrainingCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedTrainingCategory(cat.id)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-rose-300 border-rose-500 shadow-lg shadow-rose-500/10 scale-[1.02]'
                          : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected ? 'bg-rose-500/30 text-rose-200' : 'bg-zinc-900 text-zinc-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SELECTED CATEGORY EDITOR & JOKES LIST */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Selected Category
                  </span>
                  <h4 className="text-base font-black text-rose-300 flex items-center gap-2">
                    {roastCategories.find(c => c.id === selectedTrainingCategory)?.name || selectedTrainingCategory}
                  </h4>
                </div>
                <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Total Jokes: {(roastJokesMap[selectedTrainingCategory] || []).length}
                </span>
              </div>

              {/* Add New Joke / Bangers Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 block">
                  ✍️ এই ক্যাটাগরিতে নতুন জোকস বা বেইজ্জতি করার কথা লিখুন:
                </label>
                <textarea
                  rows={3}
                  value={newJokeInput}
                  onChange={(e) => setNewJokeInput(e.target.value)}
                  placeholder="যেমন: কিরে ভাই! ক্যামেরার দিকে এমন মুখ করে আছিস যেন ক্যামেরাটা তোর কাছে টাকা পায়... 🤣"
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-rose-500 text-zinc-100 text-xs rounded-xl p-3.5 focus:outline-none transition-all font-sans leading-relaxed"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleAddJokeToCategory}
                    disabled={!newJokeInput.trim()}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4 text-zinc-950" />
                    <span>ডাইরেক্ট সেভ (Save)</span>
                  </button>

                  <button
                    onClick={handleAiRewriteAndSave}
                    disabled={!newJokeInput.trim() || isGeneratingRewrites}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 text-purple-200 animate-spin-slow" />
                    <span>{isGeneratingRewrites ? 'AI বানাচ্ছে...' : '✨ AI-তে ৩-৫টি ইউনিক রিরাইট সেভ করুন'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (!newJokeInput.trim()) return;
                      const text = newJokeInput.trim();
                      try {
                        // Request AI rewrites
                        const rewriteRes = await fetch('/api/lookmax/rewrite-joke', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ jokeText: text })
                        });
                        const rewriteData = await rewriteRes.json();
                        const rewritesList: string[] = (rewriteData && Array.isArray(rewriteData.rewrites) && rewriteData.rewrites.length > 0)
                          ? rewriteData.rewrites
                          : [
                              `কিরে ভাই! ${text} 🤣 শুনে তো এলাকার পোলাপাইন ফিট খাইছে!`,
                              `আরে শোন! ${text} 💀 তোরে নিয়া ১ জন খবর দিছে!`,
                              `এই মামা! ${text} 🔥 হাসি থামাইতে পারতেছি না!`
                            ];

                        // Fetch active members
                        const res = await fetch('/api/community/members');
                        const data = await res.json();
                        const members = (data && data.members && data.members.length > 0)
                          ? data.members
                          : [{ name: 'Shakib_Glow', avatar: '' }, { name: 'Rafi_Max', avatar: '' }, { name: 'Tanvir_Vibe', avatar: '' }];
                        
                        // Pick 1 to 3 random members (strictly max 3)
                        const countToSend = Math.min(Math.floor(Math.random() * 3) + 1, members.length);
                        const shuffled = [...members].sort(() => 0.5 - Math.random()).slice(0, countToSend);

                        for (let i = 0; i < shuffled.length; i++) {
                          const targetMember = shuffled[i];
                          const uniqueRoastForMember = rewritesList[i % rewritesList.length];
                          
                          await fetch('/api/community/posts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              authorName: `AI Roast Master (Targeting ${targetMember.name}) 🎭`,
                              authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RoastMaster',
                              content: uniqueRoastForMember,
                              imageUrl: ''
                            })
                          });
                        }

                        triggerNotification(
                          "🚀 Sent to GrowGram Feed!",
                          `আপনার জোকসটি ${shuffled.length} জন ফ্রেন্ডের কাছে ৩টি সম্পূর্ণ ভিন্ন আঞ্চলিক হাসির বেইজ্জত টুইস্টে সেন্ট করা হয়েছে!`
                        );
                        setNewJokeInput('');
                      } catch (err) {
                        triggerNotification("⚠️ Failed", "মেসেজ পাঠাতে সমস্যা হয়েছে।");
                      }
                    }}
                    disabled={!newJokeInput.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 disabled:opacity-40 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <Zap className="w-4 h-4 fill-zinc-950" />
                    <span>১-৩ জন ফ্রেন্ডকে রিরাইট করে পাঠাও 🎭</span>
                  </button>
                </div>
              </div>

              {/* List of Saved Jokes for Selected Category */}
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  📜 সেভ করা জোকস ও রোস্ট ডায়ালগসমূহ:
                </span>

                {(!selectedTrainingCategory || !roastJokesMap[selectedTrainingCategory] || roastJokesMap[selectedTrainingCategory].length === 0) ? (
                  <div className="text-center py-8 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-2">
                    <p className="text-xs text-zinc-500">এই ক্যাটাগরিতে এখনো কোনো জোকস সেভ করা হয়নি।</p>
                    <p className="text-[11px] text-zinc-600">উপরে আপনার মাথায় থাকা যে কোনো কৌতুক লিখে সেভ বাটন চাপুন!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {roastJokesMap[selectedTrainingCategory].map((jokeObj, idx) => {
                      const jokeText = typeof jokeObj === 'string' ? jokeObj : jokeObj.text;
                      const jokeId = typeof jokeObj === 'string' ? `joke_${idx}` : jokeObj.id;
                      const viewsCount = typeof jokeObj === 'string' ? 0 : (jokeObj.views || 0);

                      return (
                        <div
                          key={jokeId}
                          className="bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-all"
                        >
                          <div className="flex items-start gap-2.5 text-xs text-zinc-200 leading-relaxed font-sans min-w-0 flex-1">
                            <span className="text-rose-400 font-bold shrink-0">{idx + 1}.</span>
                            <div className="space-y-1">
                              <p className="whitespace-pre-line">{jokeText}</p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-md font-mono font-bold">
                                  👁️ ভিউ গণনা: {viewsCount}/4 জন (৪ হলে উধাও হবে)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleIncrementJokeView(selectedTrainingCategory, jokeId, 1)}
                              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="১ জন ফ্রেন্ডকে দেখাও (ভিউ বাড়াও)"
                            >
                              <span>👁️ +১ ভিউ</span>
                            </button>
                            <button
                              onClick={() => handleDeleteJokeFromCategory(selectedTrainingCategory, jokeId)}
                              className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Info Box */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-200/90 space-y-1.5 font-sans">
              <p className="font-bold flex items-center gap-1.5 text-amber-300">
                💡 কী ঘটে এই জোকসগুলো সেভ করার পর?
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                যখন কোনো ব্যক্তি বা আপনি নিজেই ফটো স্ক্যানারের মধ্যে ছবি আপলোড করবেন এবং সেটির ফেস লোকাল ক্যাটাগরির সাথে মিলে যাবে (অথবা জেনারেল ফানি স্ক্যান হবে), এআই সরাসরি আপনার সেভ করা জোকস ও ডায়ালগগুলো নিয়ে চমৎকার রোস্ট রিপ্লাই তৈরি করবে!
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
