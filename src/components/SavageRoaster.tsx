import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, MessageSquare, Send, Loader2, RefreshCw, Zap, Star, ShieldAlert,
  Sparkles, CheckCircle2, Bookmark, HelpCircle, X, Paperclip
} from 'lucide-react';
import { triggerNotification } from '../utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  imageBase64?: string;
}

interface SavageRoasterProps {
  completedHabitsCount: number;
  totalHabitsCount: number;
  waterDrank: number;
  photosUploaded: number;
  userProfile?: { name: string; avatarBase64?: string };
}

export default function SavageRoaster({
  completedHabitsCount,
  totalHabitsCount,
  waterDrank,
  photosUploaded,
  userProfile
}: SavageRoasterProps) {
  // Quick Roast function
  const handleQuickRoast = () => {
    const name = userProfile?.name || "দোস্ত";

    let customTrainedJokes: string[] = [];
    try {
      const savedRoastData = localStorage.getItem('lookmax_custom_training_roasts_v1');
      if (savedRoastData) {
        const parsed = JSON.parse(savedRoastData);
        if (parsed && parsed.jokes) {
          Object.values(parsed.jokes).forEach((jokeArr: any) => {
            if (Array.isArray(jokeArr)) {
              customTrainedJokes.push(...jokeArr);
            }
          });
        }
      }
    } catch (e) {}

    const localRoasts = [
      ...customTrainedJokes,
      `কিরে ${name}! 🤣 তোকে দেখে তো মনে হচ্ছে বাপের ফ্রি ওয়াইফাই গিলে রাত ৪টা পর্যন্ত স্ক্রোল করতে করতে আত্মা শরীর ছেড়ে অলরেডি থানায় জিডি করতে রওনা দিছে! 💀 মাত্র ${completedHabitsCount}/${totalHabitsCount} টা হ্যাবিট শেষ করে ভাব দেখাস যেন নাসার প্রধান বিজ্ঞানী তুই! চোখের নিচে যে ডার্ক সার্কেলের ব্ল্যাকহোল বানাইছিস, ওখানে পুরো একটা ফুটবল টিম নেমে প্র্যাকটিস করতে পারবে। আয়নায় মুখ দেখলে আয়নাও নিজে আত্মহত্যা করার হুমকি দেয়! লজ্জা থাকলে মোবাইল ফেলে গিয়ে মুখে বরফ ঘষ কুঁড়ের বাদশা! ⚰️🔥`,
      `আরে ${name} মামা! 😜 তোকে দেখে তো মনে হচ্ছে সদরঘাটের ভাঙা লঞ্চের ইঞ্জিনের নিচে ৩ দিন মড়ার মতো ঘুমাইয়া ছুটি নিয়ে আসছিস! ☠️ সারাদিনে মাত্র ${waterDrank} গ্লাস পানি খাইয়া আবার ক্রাশের সামনে আলফা লর্ড সাজার স্বপ্ন দেখিস? ক্রাশ তো তোর এই ডেথ-স্টার ফেস দেখে ভলান্টিয়ারি এলাকা ছাড়া হবে, এমনকি পাড়ার নেড়ি কুত্তাও তোকে দেখে রাস্তা ক্রস করবে! মুখের যা তেলতেলে অবস্থা, ওখানে এক কেজি পরোটা ভেজে মেলায় বিক্রি করা যাবে! 🍳💥⚰️`,
      `কিরে ভাই ${name}! 😭 তোর ক্যামেরার মুখের এক্সপ্রেশনটা এমন যেন শ্মশান থেকে কোনো অভিশপ্ত ভূত অনুমতি না নিয়ে সেলফি তুলতে চলে আসছে! 💀 ক্যামেরা তোকে ফোকাস করতে গিয়া নিজে থেকেই লেন্স অফ করে নীল স্ক্রিন দিয়ে হ্যাং হয়ে যায়! বাপের হোটেল ধ্বংস করে বিছানায় পড়ে আছিস, পিঠের চামড়া তো ম্যাট্রেসের সাথে পার্মানেন্টলি ওয়েল্ডিং হয়ে গেছে! একটু বাইরে বের হয়ে বাতাস খা, নাহলে মানুষ ভুল করে জানাজা পড়াতে শুরু করবে! 🤦‍♂️🪦`,
      `আরে ${name}! 🦍 তোর বসার ভঙ্গি দেখে মনে হচ্ছে চায়ের দোকানের ভাঙা বেঞ্চে বসে পুরো মহাবিশ্বের ব্যর্থতার বোঝা একাই কাঁধে নিয়ে ঝিমাচ্ছিস! 💀 মেরুদণ্ড সোজা কর ল্যাদাশের শিরোমণি! ক্রাশের ইনবক্সে ৫ বছর আগে পাঠানো 'Hlw' মেসেজে আজও ধুলা জমতেছে, আর তুই এদিকে ভাব মারিস বিলিওনেয়ার মেন্টর! মুখে একটু ঠান্ডা পানি মার, বাপের জুতার বাড়ির ভয় থাকলে দৌড়ের ওপর থাক! 🎭⚡`,
      `কিরে দোস্ত ${name}! 😂 শ্মশানের ফিল্টার ছাড়াও তোকে দেখতে পুরো জম্বি সিনেমার এক্সট্রা অ্যাক্টরের মতো লাগতেছে! 💀 ক্রাশ তো দূর, ভিখারিও তোকে দেখে উল্টা দুই টাকা দান করে সান্ত্বনা দিয়ে চলে যাবে। নিজের এই চেহারা নিয়ে লুকমাক্সিংয়ের বড়াই করার আগে বাপের ওয়াইফাই বিলটা শোধ কর! লজ্জা থাকলে এখনি উঠ আর ১০টা পুশ-আপ দিয়ে প্রমাণ কর তুই এখনো জীবিত! 🥊🔥⚰️`
    ];
    
    const randomRoast = localRoasts[Math.floor(Math.random() * localRoasts.length)];
    
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: `⚡ আমাকে একটা বেইজ্জতি কুইক রোস্ট দাও!`,
      timestamp: new Date()
    };
    
    const modelMsg: Message = {
      id: crypto.randomUUID(),
      role: 'model',
      content: randomRoast,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg, modelMsg]);
    triggerNotification("🔥 কুইক বেইজ্জতি!", `${name}-কে নিয়ে চরম রোস্ট তৈরি করা হলো!`);
  };

  // Roast States
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_savage_messages');
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
        id: "initial-hello-roast",
        role: 'model',
        content: "আসসালামু আলাইকুম দোস্ত! 🤣 আমি তোর ১ নম্বর বেইজ্জতি কারিগর ও স্যাভেজ রোস্টার! কোনো বানোনো প্রশংসা না, এখানে খালি জমে খীর হওয়া ডার্ক রিজিওনাল কমেডি আর কড়া বেইজ্জত হবে! বল আজকের কী খবর? 🎭🔥😈",
        timestamp: new Date()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('selfx_savage_messages', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roastStyle, setRoastStyle] = useState<'funny' | 'savage' | 'reality_check' | 'legendary'>('savage');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Attachment photo
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image selfie!");
      return;
    }

    setIsUploading(true);
    setAttachedFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
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
          const compressed = canvas.toDataURL('image/jpeg', 0.6);
          setAttachedImageBase64(compressed);
        }
        setIsUploading(false);
        triggerNotification("📸 Selfie Attached", "Ready to face the absolute roast!");
      };
      img.onerror = () => {
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSendChat = async (e?: React.FormEvent, presetPrompt?: string) => {
    e?.preventDefault();
    const textToSend = presetPrompt || inputValue.trim();
    if (!textToSend && !attachedImageBase64) return;
    if (isLoading) return;

    if (!presetPrompt) {
      setInputValue('');
    }

    const activeImage = attachedImageBase64;
    setAttachedImageBase64(null);
    setAttachedFileName(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend || "Assess my uploaded photo",
      timestamp: new Date(),
      imageBase64: activeImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const statsSummary = `Today complete habits: ${completedHabitsCount}/${totalHabitsCount}, Water: ${waterDrank}/8, Selfies: ${photosUploaded}`;
      const payloadMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
        imageBase64: m.imageBase64
      }));

      let pastRoasts: string[] = [];
      try {
        const savedRoasts = localStorage.getItem('lookmax_generated_roasts_v1');
        if (savedRoasts) {
          pastRoasts = JSON.parse(savedRoasts);
        }
      } catch (e) {}

      const res = await fetch('/api/lookmax/chat-roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: payloadMessages,
          userGoals: statsSummary,
          roastStyle: roastStyle,
          isFriendlyCoach: false, // Savage Roasting Activated!
          pastRoasts
        })
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const replyText = data.reply || "Connection lagged, but that doesn't excuse you! Rise up and practice posture check!";

      if (data.reply) {
        try {
          const currentRoastsRaw = localStorage.getItem('lookmax_generated_roasts_v1');
          const currentRoasts = currentRoastsRaw ? JSON.parse(currentRoastsRaw) : [];
          if (!currentRoasts.includes(data.reply)) {
            const updatedRoasts = [data.reply, ...currentRoasts].slice(0, 25);
            localStorage.setItem('lookmax_generated_roasts_v1', JSON.stringify(updatedRoasts));
          }
        } catch (e) {
          console.error("Failed to update lookmax_generated_roasts_v1 in localStorage", e);
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'model',
          content: replyText,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'model',
          content: "Network glitch hit! Perhaps the weight of your pending habits overloaded our server capacity. Try again immediately!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'model',
        content: "Haha! Purging the chat logs won't hide your missed routines. At the end of the day, absolute commitment is the only thing that reflects in the mirror. Ask your query, and let the real grind begin!",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div id="looksmax-savage-roaster-view" className="space-y-6">
      
      {/* BRAND HEADER */}
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Discipline Correction Arena</span>
          </div>
          <h2 className="font-display font-black text-2xl text-zinc-100 flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500 animate-bounce" />
            Savage Looksmax Roaster
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
            The ultimate self-worth wakeup call! Upload your selfie or state your excuse, select your severity level, and get brutally roasted into taking physical action.
          </p>
        </div>

        {/* STATS OVERVIEW SHORT */}
        <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
          <div className="text-right">
            <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-mono">Today's Habits</span>
            <span className="font-mono text-xs font-black text-red-500">
              {completedHabitsCount}/{totalHabitsCount} Done
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ROAST LEVEL SELECTION */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* INSTANT QUICK ROAST SUPER ACCENT BUTTON */}
          <button
            onClick={handleQuickRoast}
            type="button"
            className="w-full py-4.5 px-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-zinc-950 hover:scale-[1.02] font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_4px_20px_rgba(239,68,68,0.25)] cursor-pointer text-center text-xs flex items-center justify-center gap-2 animate-pulse"
          >
            <Zap className="w-5 h-5 fill-zinc-950 text-zinc-950 animate-bounce" />
            <span>Instant Quick Roast ({userProfile?.name || 'Atif Hasan'})</span>
          </button>

          <div className="bg-[#121214] border border-zinc-900 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
              <Flame className="w-5 h-5 text-red-500" />
              <span className="font-display font-black text-xs uppercase tracking-widest text-zinc-350">
                Setup Roast Severity
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Select the severity level before triggering the companion. Warning: Legendary mode contains high heat!
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { id: 'smart_mild', label: 'Funny Mild 😆', desc: 'Lighthearted comedy' },
                { id: 'savage', label: 'Raw Savage 🔥', desc: 'Classic direct critique' },
                { id: 'reality_check', label: 'Reality Check 🧠', desc: 'Deep-EQ future truth' },
                { id: 'legendary', label: 'Legendary Peak 👑', desc: 'Peak comedy and motivation' }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setRoastStyle(st.id as any);
                    triggerNotification("🌶️ Setting Calibrated", `Severity level set to: ${st.label}`);
                  }}
                  className={`py-3 px-2 rounded-xl border text-left transition-all cursor-pointer ${
                    roastStyle === st.id
                      ? 'bg-red-500/10 border-red-500 text-red-400'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="block text-xs font-bold font-mono">{st.label}</span>
                  <span className="block text-[8px] text-zinc-550 mt-0.5 truncate">{st.desc}</span>
                </button>
              ))}
            </div>

            {/* PRE-CHIP TRIPPERS */}
            <div className="pt-4 border-t border-zinc-900 space-y-2">
              <span className="block text-[9px] uppercase tracking-wider font-mono text-zinc-500 font-bold">Quick Excuse Roasts</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "Roast my lazyness", prompt: "I haven't drank a single glass of water today and slept like a log. Show no mercy, roast my discipline!" },
                  { label: "Mouth breathing failure", prompt: "I struggle keeping my mouth closed during work and keep forgetting to mew. Give me an ultimate raw truth check!" },
                  { label: "Missed early wake-up", prompt: "I woke up at 10 AM today and skipped my workout. Give me a terrifying wake-up roast to force me up tomorrow!" }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(undefined, preset.prompt)}
                    disabled={isLoading}
                    className="w-full text-left p-3 bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-90 w-full hover:border-zinc-850 rounded-xl text-[10px] text-zinc-300 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVENUE-READY SAPPHIRE CHAT */}
        <div className="lg:col-span-8 bg-[#121214] border border-zinc-800 rounded-2xl flex flex-col justify-between h-[560px] overflow-hidden relative shadow-2xl animate-fadeIn">
          
          {/* Header chats */}
          <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <h3 className="font-display font-black text-xs text-zinc-200 uppercase tracking-widest">Savage Roast Simulator</h3>
                <p className="text-[9px] text-zinc-500 font-mono">Real-time Banglish sarcastic wakeup calls</p>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              disabled={isLoading}
              className="text-[10px] font-mono hover:text-red-400 text-zinc-650 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Log
            </button>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-950/20 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-red-500 text-zinc-950 rounded-tr-none font-bold shadow-[0_2px_8px_rgba(239,68,68,0.15)]'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-850 rounded-tl-none font-normal'
                  }`}
                >
                  {m.imageBase64 && (
                    <div className="mb-2 max-w-[200px] rounded-xl overflow-hidden border border-zinc-850 bg-zinc-950">
                      <img src={m.imageBase64} alt="Selfie upload" className="w-full max-h-[165px] object-cover" />
                    </div>
                  )}
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl rounded-tl-none p-4 text-zinc-400 flex items-center gap-2 text-xs font-mono">
                  <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                  <span>Looking for excuses... brewing roasted payload...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSendChat} className="p-4 bg-zinc-950 border-t border-zinc-900 space-y-3">
            
            {attachedFileName && (
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-850 p-2 rounded-xl animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-red-500/30 shrink-0">
                    <img src={attachedImageBase64!} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-300 font-mono">Selfie Loaded:</span>
                    <span className="block text-[8px] text-zinc-500 font-mono max-w-[150px] truncate">{attachedFileName}</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setAttachedImageBase64(null);
                    setAttachedFileName(null);
                  }}
                  className="p-1 px-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-md text-red-500 hover:text-red-400 text-[10px] font-mono cursor-pointer transition-all"
                >
                  Remove <X className="w-3 h-3 inline" />
                </button>
              </div>
            )}

            {isUploading && (
              <div className="text-[9px] text-red-500 font-mono animate-pulse">
                Optimizing selfie metadata for high roasts...
              </div>
            )}

            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-red-500 text-zinc-400 hover:text-red-500 rounded-xl transition-all cursor-pointer shrink-0"
                title="Attach Selfie Photo"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="relative flex-1">
                <input
                  type="text"
                  required={!attachedImageBase64}
                  disabled={isLoading}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about skin, double chin, or give your excuse..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-xl py-3.5 pl-4 pr-12 text-zinc-100 placeholder-zinc-550 focus:outline-none focus:border-red-500 transition-colors"
                />
                
                <button
                  type="submit"
                  disabled={isLoading || (!inputValue.trim() && !attachedImageBase64)}
                  className="absolute right-2 top-2 w-8 h-8 bg-red-500 hover:bg-red-400 text-zinc-950 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-[0_2px_6px_rgba(239,68,68,0.2)]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}
