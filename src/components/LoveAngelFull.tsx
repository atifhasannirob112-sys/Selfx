import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, User, MapPin, Sparkles, Trash2, Edit2, Bookmark, Compass, MessageCircle, HeartHandshake, Camera, Upload } from 'lucide-react';
import { triggerNotification } from '../utils';
import loveAngelBannerImg from '../assets/images/love_angle_prio2ma_exact_1787165356685.jpg';

interface Crush {
  id: string;
  name: string;
  status: string;
  number?: string;
  personality?: string;
  currentSituation?: string;
  address?: string;
  arabicOilOption?: string;
  details?: string;
  image?: string; // base64 string
}

interface LoveAngelFullProps {
  onClose: () => void;
  onSyncMemory?: () => void;
}

export default function LoveAngelFull({ onClose, onSyncMemory }: LoveAngelFullProps) {
  const [crushes, setCrushes] = useState<Crush[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Crush');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [personality, setPersonality] = useState('');
  const [situation, setSituation] = useState('');
  const [arabicOilOption, setArabicOilOption] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const getScopedKey = (baseKey: string) => {
    let name = '';
    try {
      const savedProfile = localStorage.getItem('lookmax_user_profile_v2');
      if (savedProfile) {
        name = JSON.parse(savedProfile).name || '';
      }
    } catch (e) {}
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanName) return baseKey;
    return `${baseKey}_usr_${cleanName}`;
  };

  // Loaded upon mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getScopedKey('lookmax_crush_list_v2'));
      if (saved) {
        setCrushes(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load crush list inside LoveAngelFull", e);
    }
  }, []);

  const saveToStorage = (updatedList: Crush[]) => {
    localStorage.setItem(getScopedKey('lookmax_crush_list_v2'), JSON.stringify(updatedList));
    setCrushes(updatedList);
    if (onSyncMemory) {
      onSyncMemory();
    }
  };

  const handleResetForm = () => {
    setName('');
    setStatus('Crush');
    setContact('');
    setAddress('');
    setPersonality('');
    setSituation('');
    setArabicOilOption('');
    setDetails('');
    setImage(null);
    setEditingId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি সঠিক ছবি আপলোড করুন।');
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // compact base64 size
        const scale = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImage(dataUrl);
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setIsCompressing(false);
        alert('ছবি লোড করতে সমস্যা হয়েছে।');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updatedList: Crush[];

    if (editingId) {
      updatedList = crushes.map(c => c.id === editingId ? {
        ...c,
        name: name.trim(),
        status,
        number: contact.trim() || undefined,
        address: address.trim() || undefined,
        personality: personality.trim() || undefined,
        currentSituation: situation.trim() || undefined,
        arabicOilOption: arabicOilOption.trim() || undefined,
        details: details.trim() || undefined,
        image: image || undefined,
      } : c);

      triggerNotification(
        "💖 লাভ এঞ্জেল প্রোফাইল আপডেট",
        `"${name}" এর প্রোফাইল ইনফরমেশন সফলভাবে আপডেট করা হয়েছে এবং AI মেমরিতে সিঙ্ক হয়েছে!`
      );
    } else {
      const newCrush: Crush = {
        id: 'crush-' + Date.now(),
        name: name.trim(),
        status,
        number: contact.trim() || undefined,
        address: address.trim() || undefined,
        personality: personality.trim() || undefined,
        currentSituation: situation.trim() || undefined,
        arabicOilOption: arabicOilOption.trim() || undefined,
        details: details.trim() || undefined,
        image: image || undefined,
      };

      updatedList = [newCrush, ...crushes];

      triggerNotification(
        "💖 লাভ এঞ্জেল প্রোফাইল যুক্ত হয়েছে",
        `"${name}" এর প্রোফাইল সফলভাবে AI মেমরিতে সেভ হয়েছে! AI চ্যাট এখন তার নাম ও প্রোফাইল চিনে কথা বলবে।`
      );
    }

    saveToStorage(updatedList);
    handleResetForm();
  };

  const handleDelete = (id: string, nameToDelete: string) => {
    if (window.confirm(`আপনি কি সত্যিই "${nameToDelete}" এর প্রোফাইল ডিলিট করতে চান?`)) {
      const updatedList = crushes.filter(c => c.id !== id);
      saveToStorage(updatedList);
      triggerNotification("🗑️ প্রোফাইল মুছে ফেলা হয়েছে", `"${nameToDelete}" এর ডাটা ডিলিট করা হয়েছে।`);
    }
  };

  const handleStartEdit = (crush: Crush) => {
    setEditingId(crush.id);
    setName(crush.name);
    setStatus(crush.status || 'Crush');
    setContact(crush.number || '');
    setAddress(crush.address || '');
    setPersonality(crush.personality || '');
    setSituation(crush.currentSituation || '');
    setArabicOilOption(crush.arabicOilOption || '');
    setDetails(crush.details || '');
    setImage(crush.image || null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-[#03030a]/98 text-zinc-100 overflow-y-auto p-4 md:p-8 flex flex-col font-sans"
    >
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col space-y-6 relative z-10">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/15 rounded-2xl border border-pink-500/20 text-pink-500 animate-pulse">
              <Heart className="w-7 h-7 fill-pink-500/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-lg md:text-xl uppercase tracking-widest text-zinc-100">
                  LOVE ANGEL ADVISOR
                </h1>
                <span className="text-[10px] bg-pink-500/10 text-pink-400 border border-pink-500/25 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  FULL SCREEN MODE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                আপনার ক্রাশ, প্রেমিকা বা সঙ্গিনীর প্রোফাইল ডিটেইলস সেভ করুন। এআই চ্যাট এই মেমোরি ব্যবহার করে নিখুঁত লাভ অ্যাডভাইস দিবে।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-3 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-black uppercase tracking-wider"
          >
            <X className="w-4 h-4" /> বন্ধ করুন (Close)
          </button>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 backdrop-blur-md space-y-5">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3.5">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <h2 className="font-display font-black text-xs uppercase tracking-widest text-pink-400">
                  {editingId ? 'প্রোফাইল সম্পাদন (Edit Profile)' : 'নতুন ক্রাশ বা রিলেশন তথ্য যোগ করুন'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider mb-1.5">
                    নাম (Name) <span className="text-pink-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: নুসরাত জাহান বা রাশেদা"
                      className="w-full bg-[#070814]/90 border border-zinc-850 focus:border-pink-500 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Crush's Photo Upload */}
                <div className="bg-[#0c0d1e]/50 p-4 border border-zinc-850 rounded-2xl space-y-3">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider">
                    📸 মেয়ের ছবি যোগ করুন (Partner/Crush's Photo - Optional)
                  </label>
                  
                  <div className="flex items-center gap-4">
                    {image ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 shadow-lg shrink-0 group/img">
                        <img 
                          src={image} 
                          alt="Crush Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-rose-400 font-extrabold cursor-pointer"
                        >
                          রিমুভ
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-zinc-950/80 border border-zinc-850 flex items-center justify-center text-zinc-650 shrink-0">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          id="crush-photo-upload"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="crush-photo-upload"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-pink-500/40 text-zinc-300 hover:text-pink-400 rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isCompressing ? 'প্রসেসিং হচ্ছে...' : (image ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন')}
                        </label>
                      </div>
                      <p className="text-[9.5px] text-zinc-500 leading-normal">
                        তার একটি সুন্দর ছবি দিন। ফেস রেটিং এআই এবং লাভ এঞ্জেল এই ছবি অনুযায়ী পরামর্শ কাস্টমাইজ করবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider mb-1.5">
                      সম্পর্কের স্থিতি (Status)
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#070814]/90 border border-zinc-850 focus:border-pink-500 rounded-xl px-3 py-3 text-xs text-zinc-200 focus:outline-none transition-all font-sans cursor-pointer"
                    >
                      <option value="Crush">Crush (ক্রাশ)</option>
                      <option value="GF/BF">Girlfriend (প্রেমিকা)</option>
                      <option value="Secret Love">Secret Love (গোপন ভালোবাসা)</option>
                      <option value="Wife">Wife (স্ত্রী)</option>
                      <option value="Ex">Ex-partner (প্রাক্তন)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider mb-1.5">
                      সোশ্যাল আইডি / হ্যান্ডেল
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="@instagram_handle"
                      className="w-full bg-[#070814]/90 border border-zinc-850 focus:border-pink-500 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider mb-1.5">
                    ঠিকানা (Address / Location)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="যেমন: মিরপুর, ঢাকা"
                      className="w-full bg-[#070814]/90 border border-zinc-850 focus:border-pink-500 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Personality & Situation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider mb-1.5">
                      তার ব্যক্তিত্ব (Personality)
                    </label>
                    <input
                      type="text"
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                      placeholder="মিষ্টি ও লাজুক, চঞ্চল..."
                      className="w-full bg-[#070814]/90 border border-zinc-850 focus:border-pink-500 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider mb-1.5">
                      বর্তমান পর্যায় (Situation)
                    </label>
                    <input
                      type="text"
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                      placeholder="কথা হয় মাঝে মাঝে, গভীর সম্পর্ক..."
                      className="w-full bg-[#070814]/90 border border-zinc-850 focus:border-pink-500 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Arabic Oil Special Memory Option */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1.5">
                    ✨ আরবি তেল / বিশেষ মেমোরি অপশন (Special Charm)
                  </label>
                  <input
                    type="text"
                    value={arabicOilOption}
                    onChange={(e) => setArabicOilOption(e.target.value)}
                    placeholder="যেমন: তার পছন্দের ফুল গোলাপ, প্রিয় খাবার চকোলেট..."
                    className="w-full bg-[#070814]/90 border border-zinc-850 focus:border-pink-500 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all font-sans"
                  />
                  <span className="text-[9px] text-zinc-550 block mt-1">
                    সঙ্গিনীর দুর্বলতা, প্রিয় জিনিস, বা পছন্দের টপিক যা তাকে মোহিত করতে সাহায্য করবে।
                  </span>
                </div>

                {/* Details */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider mb-1.5">
                    সম্পর্ক বা তার ব্যাপারে বিস্তারিত (Detailed Description)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    placeholder="তার স্বভাব কেমন, আমাদের শেষ কথা কি হয়েছিল, আমি এখন কোন পর্যায়ে আছি..."
                    className="w-full bg-[#070814]/90 border border-zinc-850 focus:border-pink-500 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all font-sans resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                    >
                      বাতিল (Cancel)
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer shadow-lg shadow-pink-950/20 text-center flex items-center justify-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    {editingId ? 'মেমোরি আপডেট করুন 💾' : 'এআই মেমোরিতে সেভ করুন 💾'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Saved Profiles (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Romantic Aesthetic Cover Banner with POV Holding Hands Photo */}
            <div className="relative overflow-hidden rounded-3xl border border-pink-500/40 bg-gradient-to-r from-[#28071e] via-[#1a0515] to-[#0d020b] shadow-[0_4px_25px_rgba(236,72,153,0.15)] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-5 group">
              <div className="space-y-2 max-w-sm z-10 text-left w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400/40 animate-pulse" />
                  <span className="text-[9.5px] font-mono font-black uppercase tracking-wider text-pink-300">POV ROMANTIC BONDING</span>
                </div>
                <h3 className="text-base font-display font-black text-white tracking-wide">
                  Deep Connection & Warmth
                </h3>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed font-sans">
                  হাতে হাত রেখে একসঙ্গে পথচলার পবিত্র অনুভূতি ও মানসিক গভীর বন্ধন গড়ে তুলুন।
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[9px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full font-bold">
                    🤍 Couple Bracelet POV
                  </span>
                </div>
              </div>

              <div 
                className="w-full sm:w-48 aspect-[3/4] sm:h-44 rounded-2xl overflow-hidden shrink-0 border-2 border-pink-500/60 relative shadow-2xl group-hover:border-pink-400 transition-all duration-300 bg-zinc-950"
              >
                <img 
                  src={loveAngelBannerImg} 
                  alt="Love Angel Holding Hands POV" 
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-[50%_48%] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 right-2.5 text-[9px] font-mono font-extrabold text-pink-200 bg-black/75 px-2 py-0.5 rounded-md backdrop-blur-sm border border-pink-500/30 shadow-md">
                  POV BOND
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4.5 h-4.5 text-pink-500" />
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-zinc-300">
                  সংরক্ষিত এঞ্জেল প্রোফাইলসমূহ ({crushes.length})
                </h3>
              </div>
              {crushes.length > 0 && (
                <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold animate-pulse">
                  • AI MEMORY SYNCED
                </span>
              )}
            </div>

            {crushes.length === 0 ? (
              <div className="bg-zinc-950/20 border-2 border-dashed border-zinc-900 rounded-3xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-pink-500/5 border border-pink-500/10 flex items-center justify-center text-pink-500 mx-auto opacity-60">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-300">কোনো ক্রাশ প্রোফাইল নেই!</h4>
                  <p className="text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    বাম পাশের ফর্মটি পূরণ করে আপনার জীবনের প্রিয় মানুষের প্রোফাইল এআই মেমোরিতে যুক্ত করুন।
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {crushes.map((crush) => (
                  <motion.div
                    key={crush.id}
                    layout
                    className="bg-zinc-950/70 border border-zinc-900 hover:border-pink-500/20 rounded-2xl p-5 space-y-4 transition-all relative overflow-hidden group"
                  >
                    {/* Glowing Accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {crush.image ? (
                          <div className="w-12 h-12 rounded-full border-2 border-pink-500 overflow-hidden shrink-0 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
                            <img 
                              src={crush.image} 
                              alt={crush.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 font-display font-black shrink-0 text-sm">
                            {crush.name.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-zinc-100 leading-tight">
                              {crush.name}
                            </h4>
                            <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase font-mono tracking-wider rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                              {crush.status}
                            </span>
                            {crush.number && (
                              <span className="text-[9.5px] text-zinc-400 font-mono">
                                ({crush.number})
                              </span>
                            )}
                          </div>
                          
                          {crush.address && (
                            <div className="flex items-center gap-1 text-[10.5px] text-zinc-400">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{crush.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 relative z-20">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(crush)}
                          className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-zinc-900/60 rounded-xl transition-all cursor-pointer"
                          title="সম্পাদন করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(crush.id, crush.name)}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-900/60 rounded-xl transition-all cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                      {crush.personality && (
                        <div className="bg-[#070814]/80 border border-zinc-900/60 p-2.5 rounded-xl">
                          <span className="text-[8.5px] font-mono text-pink-400 block font-black uppercase tracking-wider mb-0.5">🧠 ব্যক্তিত্ব (Personality)</span>
                          <span className="text-zinc-200 text-[11px] font-medium">{crush.personality}</span>
                        </div>
                      )}
                      {crush.currentSituation && (
                        <div className="bg-[#070814]/80 border border-zinc-900/60 p-2.5 rounded-xl">
                          <span className="text-[8.5px] font-mono text-pink-400 block font-black uppercase tracking-wider mb-0.5">🚦 বর্তমান অবস্থা (Situation)</span>
                          <span className="text-zinc-200 text-[11px] font-medium">{crush.currentSituation}</span>
                        </div>
                      )}
                    </div>

                    {/* Arabic Oil Specialty */}
                    {crush.arabicOilOption && (
                      <div className="bg-pink-500/5 border border-pink-500/10 p-3 rounded-xl space-y-0.5">
                        <span className="text-[8.5px] font-mono text-pink-400 font-extrabold uppercase tracking-widest block">✨ আরবি তেল / বিশেষ মেমোরি (Special Charm)</span>
                        <p className="text-zinc-300 text-[11px] font-medium leading-normal">
                          {crush.arabicOilOption}
                        </p>
                      </div>
                    )}

                    {/* Detail content */}
                    {crush.details && (
                      <div className="bg-zinc-950/90 border border-zinc-900 p-3 rounded-xl space-y-1">
                        <span className="text-[8.5px] font-mono text-zinc-500 font-black uppercase tracking-wider block">📝 সম্পর্ক ও তার বিস্তারিত বিবরণ (Detailed Memo)</span>
                        <p className="text-zinc-300 text-[11px] leading-relaxed font-medium font-sans">
                          {crush.details}
                        </p>
                      </div>
                    )}

                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
}
