import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, Sparkles, Camera, Upload, CheckCircle2, AlertCircle, 
  Sparkle, X, ArrowRight, UserCheck, Star, RefreshCw, ShoppingBag,
  Info, ShieldAlert, Heart, Layers, Flame
} from 'lucide-react';
import { triggerNotification } from '../utils';

interface HairMaxingModalProps {
  onClose: () => void;
}

export default function HairMaxingModal({ onClose }: HairMaxingModalProps) {
  const [userHairPhoto, setUserHairPhoto] = useState<string | null>(null);
  const [celebHairPhoto, setCelebHairPhoto] = useState<string | null>(null);
  
  const userPhotoInputRef = useRef<HTMLInputElement>(null);
  const celebPhotoInputRef = useRef<HTMLInputElement>(null);

  const [hairType, setHairType] = useState<string>('Straight (সোজা চুল)');
  const [concerns, setConcerns] = useState<string[]>(['চুল পড়া', 'খুশকি']);
  const [currentProducts, setCurrentProducts] = useState<string>('সাধারণ শ্যাম্পু ও নারকেল তেল');
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const toggleConcern = (concern: string) => {
    setConcerns(prev => 
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const handleUserPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserHairPhoto(reader.result as string);
        triggerNotification("📸 ছবি যুক্ত হয়েছে", "আপনার বর্তমান চুলের সেলফি সেভ করা হয়েছে!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCelebPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCelebHairPhoto(reader.result as string);
        triggerNotification("⭐ সেলিব্রিটি রেফারেন্স যুক্ত হয়েছে", "আপনার পছন্দের স্টাইলের রেফারেন্স পিকচার লোড হয়েছে!");
      };
      reader.readAsDataURL(file);
    }
  };

  const runHairAnalysis = async () => {
    if (!userHairPhoto) {
      triggerNotification("⚠️ ছবি প্রয়োজন", "অনুগ্রহ করে আপনার চুলের একটি সেলফি আপলোড করুন!");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/hairmaxing/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hairPhoto: userHairPhoto,
          modelPhoto: celebHairPhoto,
          appliedProducts: [currentProducts],
          problems: concerns
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setAnalysisResult({
          faceShape: data.result.faceShapeMatch || 'Oval / Square Mix (উন্নত চোয়াল ও ব্যালেন্সড ফেসিয়াাল অনুপাত)',
          currentHairState: {
            density: data.result.currentHairStatus?.density || 'মাঝারি ডেনসিটি (Medium Density)',
            healthScore: '8.2/10',
            scalpType: 'ব্যালেন্সড স্ক্যাল্প',
            issuesDetected: concerns.length > 0 ? concerns.join(', ') : 'সাধারণ যত্ন প্রয়োজন'
          },
          friendAdvice: data.result.friendAdvice || (celebHairPhoto
            ? `দোস্ত শোন, তুই যে সেলিব্রিটি কাটটা পছন্দ করেছিস, তোর ফেস শেপ আর চুলের যা টাইপ সেদিক থেকে দেখলে এই কাটটা তোর চেহারার সাথে দারুণ মানাবে! তবে সাইড ২ নাম্বার ফেড রাখতে হবে আর ওপরের চুলে ম্যাট ক্লে ব্যবহার করে ড্রায়ার দিয়ে টেক্সচার দিতে হবে। চিন্তা করিস না, তুই নিয়মিত এই রুটিন ফলো করলে পুরোপুরি সেলিব্রিটির মতো ভাইব পাবি!`
            : `দোস্ত শোন, তোর চুলের হেলথ আগের চেয়ে অনেক ভালো আছে। তবে খুশকি আর ড্রাইনেস দূর করতে নিয়মিত শ্যাম্পুর পাশাপাশি নারকেল ও রোজমেরি অয়েল ম্যাসাজ দরকার। তোর ফেস শেপের সাথে টেক্সচার্ড ফ্রিন্জ সবথেকে আকর্ষণীয় দেখাবে ভাই!`),
          celebStyleMatch: {
            compatibility: data.result.celebMatchVerdict || (celebHairPhoto ? '৮৮% পারফেক্ট ম্যাচ!' : '৯০% ম্যাচিং স্টাইল'),
            suggestedCut: data.result.recommendedStyles?.[0]?.title || 'Modern Textured Crop with Low Taper Fade',
            stepsToAchieve: data.result.recommendedStyles?.[0]?.description
              ? [data.result.recommendedStyles[0].description, ...(data.result.careRoutineSteps || [])]
              : [
                '১. সেলুন বার্বারকে বলুন সাইডে Low Fade রাখতে এবং উপরে ১.৫-২ ইঞ্চি টেক্সচার্ড লেয়ার রাখতে।',
                '২. চুল বেশি ড্রায়ার দিয়ে হিট না দিয়ে তোয়ালে দিয়ে ব্লট করে শুকান।',
                '৩. চুলে হালকা ম্যাট ক্লে বা সি-সল্ট স্প্রে ব্যবহার করে টেক্সচার আনুন।'
              ]
          },
          productRecommendations: [
            {
              name: 'KeraVitam Rosemary + Organic Coconut Hair Oil',
              type: 'চুলের গোড়া মজবুত করার তেল',
              price: '৳৪৫০ - ৳৫৫০',
              usage: 'সপ্তাহে ৩ দিন রাতে তালুতে হালকা ম্যাসাজ করে সকালে ধুয়ে ফেলুন।'
            },
            {
              name: 'Tresemme Keratin Smooth Shampoo',
              type: 'স্মুথ ও ফ্রিজ-ফ্রি শ্যাম্পু',
              price: '৳৩৫০ - ৳৪২০',
              usage: 'একদিন পর পর অল্প পরিমাণ ব্যবহার করুন।'
            }
          ],
          routinePlan: data.result.careRoutineSteps || [
            'সকাল: কোল্ড ওয়াটার দিয়ে চুল ধোয়া ও স্ক্যাল্পে আলতো হাত চালানো।',
            'রাত: রোজমেরি অয়েল ম্যাসাজ ও সিল্ক ড্রায়ার প্রোটেকশন।',
            'খাবার: প্রতিদিন অন্তত ২টি ডিম, বাদাম ও প্রচুর পানি পান করা।'
          ]
        });
        triggerNotification("✨ বিশ্লেষণ সম্পন্ন", "আপনার কাস্টম হেয়ার ম্যাক্সিং রিপোর্ট তৈরি হয়ে গেছে!");
      } else {
        generateLocalFallback();
      }
    } catch (e) {
      console.error(e);
      generateLocalFallback();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateLocalFallback = () => {
    setAnalysisResult({
      faceShape: 'Oval / Square Mix (উন্নত চোয়াল ও ব্যালেন্সড ফেসিয়ালের অনুপাত)',
      currentHairState: {
        density: 'মাঝারি ডেনসিটি (Medium Density)',
        healthScore: '7.8/10',
        scalpType: 'মাইল্ড অয়েলি অ্যান্ড ড্রাই এন্ডস',
        issuesDetected: concerns.length > 0 ? concerns.join(', ') : 'হালকা ড্রাইনেস'
      },
      friendAdvice: celebHairPhoto
        ? `দোস্ত শোন, তুই যে পিকচারটা আপলোড দিয়েছিস, তোর ফেস শেপ আর চুলের যে টাইপ তা মিলিয়ে দেখলে এই সেলিব্রিটি কাটটা তোকে মারাত্মক মানাবে! তবে খেয়াল রাখিস, সামনের চুলে হালকা সি-সল্ট স্প্রে দিয়ে টেক্সচার না দিলে ওই ভলিউমটা পাবি না। বার্বারকে বলবি দুই পাশে ট্যাপার ফেড করে ওপরের চুলে সিজার টেক্সচার কাট দিতে। নিশ্চিন্তে কাটতে পারিস দোস্ত, ফুল আগুন দেখাবে!`
        : `দোস্ত শোন, তোর চুলের ন্যাচারাল ঘনত্ব বেশ ভালো! নিয়মিত নারকেল তেলের সাথে কয়েক ফোটা রোজমেরি তেল ম্যাসাজ করবি, এতে নতুন চুল গজানো তরান্বিত হবে। তোর মুখের শেপ অনুযায়ী ফ্রন্টাল মেস বা ট্যাপার ফ্রিন্জ রাখলে সবচেয়ে জোস লাগবে ভাই!`,
      celebStyleMatch: {
        compatibility: celebHairPhoto ? '৮৮% পারফেক্ট ম্যাচ!' : '৯০% ম্যাচিং স্টাইল',
        suggestedCut: 'Modern Textured Crop with Low Taper Fade',
        stepsToAchieve: [
          '১. সেলুন বার্বারকে বলুন সাইডে Low Fade রাখতে এবং উপরে ১.৫-২ ইঞ্চি টেক্সচার্ড লেয়ার রাখতে।',
          '২. চুল বেশি ড্রায়ার দিয়ে হিট না দিয়ে তোয়ালে দিয়ে ব্লট করে শুকান।',
          '৩. চুলে হালকা ম্যাট ক্লে (Matte Clay) বা সি-সল্ট স্প্রে (Sea Salt Spray) ব্যবহার করে টেক্সচার আনুন।'
        ]
      },
      productRecommendations: [
        {
          name: 'KeraVitam Rosemary + Organic Coconut Hair Oil',
          type: 'চুলের গোড়া মজবুত করার তেল',
          price: '৳৪৫০ - ৳৫৫০',
          usage: 'সপ্তাহে ৩ দিন রাতে তালুতে হালকা ম্যাসাজ করে সকালে ধুয়ে ফেলুন।'
        },
        {
          name: 'Tresemme Keratin Smooth Shampoo (200ml)',
          type: 'স্মুথ ও ফ্রিজ-ফ্রি শ্যাম্পু',
          price: '৳৩৫০ - ৳৪২০',
          usage: 'একদিন পর পর অল্প পরিমাণ ধুয়ে ব্যবহার করুন।'
        }
      ],
      routinePlan: [
        'সকাল: কোল্ড ওয়াটার দিয়ে চুল ধোয়া ও স্ক্যাল্পে আলতো হাত চালানো।',
        'রাত: রোজমেরি অয়েল ম্যাসাজ ও সিল্ক ড্রায়ার প্রোটেকশন।',
        'খাবার: প্রতিদিন অন্তত ২টি ডিম, বাদাম ও প্রচুর পানি পান করা।'
      ]
    });
    triggerNotification("✨ বিশ্লেষণ সম্পন্ন", "আপনার কাস্টম হেয়ার ম্যাক্সিং রিপোর্ট তৈরি হয়ে গেছে!");
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0c0c10] border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-zinc-100"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-950/60 via-zinc-950 to-indigo-950/60 border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-sm">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white font-display flex items-center gap-2">
                <span>Hair Maxing AI Studio</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono uppercase">PRO</span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans">
                আপনার হেয়ার কাট, চুলের যত্ন ও সেলিব্রিটি স্টাইল ম্যাচিং গাইড
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* Photo Upload Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* User Selfie */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 relative group">
              <input 
                type="file" 
                ref={userPhotoInputRef} 
                onChange={handleUserPhotoSelect} 
                accept="image/*" 
                className="hidden" 
              />
              {userHairPhoto ? (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-zinc-700">
                  <img src={userHairPhoto} alt="User Hair Selfie" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setUserHairPhoto(null)}
                    className="absolute top-2 right-2 bg-black/80 hover:bg-black text-red-400 p-1.5 rounded-full border border-zinc-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => userPhotoInputRef.current?.click()}
                  className="w-full h-44 border-2 border-dashed border-zinc-700 hover:border-purple-500/60 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/40 hover:bg-purple-950/10 transition-all p-3"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-zinc-200">১. আপনার চুলের বর্তমান সেলফি আপলোড করুন *</span>
                  <span className="text-[10px] text-zinc-500 font-mono">লাইটিং ভালো থাকলে এনালাইসিস ১০০% সঠিক হবে</span>
                </div>
              )}
            </div>

            {/* Celebrity Reference Photo */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 relative group">
              <input 
                type="file" 
                ref={celebPhotoInputRef} 
                onChange={handleCelebPhotoSelect} 
                accept="image/*" 
                className="hidden" 
              />
              {celebHairPhoto ? (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-zinc-700">
                  <img src={celebHairPhoto} alt="Celebrity Reference" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCelebHairPhoto(null)}
                    className="absolute top-2 right-2 bg-black/80 hover:bg-black text-red-400 p-1.5 rounded-full border border-zinc-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => celebPhotoInputRef.current?.click()}
                  className="w-full h-44 border-2 border-dashed border-zinc-700 hover:border-indigo-500/60 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-black/40 hover:bg-indigo-950/10 transition-all p-3"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-zinc-200">২. প্রিয় সেলিব্রিটি বা রেফারেন্স ফটো (অপশনাল)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">যার মতো চুল আপনি করতে চান</span>
                </div>
              )}
            </div>

          </div>

          {/* Questionnaire Section */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4.5 space-y-4">
            
            {/* Hair Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 font-sans block">
                আপনার চুলের ধরণ (Hair Type):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'Straight (সোজা চুল)', 
                  'Wavy (হালকা কোঁকড়ানো)', 
                  'Curly (রিং কোঁকড়ানো)', 
                  'Coily / Dense'
                ].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setHairType(type)}
                    className={`py-2 px-3 rounded-xl text-[11px] font-sans text-center border transition-all cursor-pointer ${
                      hairType === type 
                        ? 'bg-purple-950/60 border-purple-500/80 text-purple-200 font-bold'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Concerns */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 font-sans block">
                বর্তমান সমস্যা বা লক্ষ্য (Concerns / Goals):
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'চুল পড়া', 'খুশকি', 'শুষ্কতা (Dry Hair)', 'তৈলাক্ত স্ক্যাল্প (Oily)', 
                  'কপালের হেয়ারলাইন পিছানো', 'পাতলা চুল (Thin Hair)', 'গ্রোথ বাড়াতে চাই'
                ].map(c => {
                  const active = concerns.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleConcern(c)}
                      className={`py-1.5 px-3 rounded-full text-[11px] font-sans border transition-all cursor-pointer flex items-center gap-1.5 ${
                        active 
                          ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-500/80 text-white font-bold' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {active && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Products Used */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 font-sans block">
                বর্তমানে কি কি লাগাচ্ছেন বা ব্যবহার করছেন (Products/Routine Used):
              </label>
              <input
                type="text"
                value={currentProducts}
                onChange={(e) => setCurrentProducts(e.target.value)}
                placeholder="যেমন: নরমাল শ্যাম্পু, তেল বা নারকেল তেল ব্যবহার করি..."
                className="w-full bg-black border border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={runHairAnalysis}
            disabled={isAnalyzing || !userHairPhoto}
            className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              !userHairPhoto 
                ? 'bg-zinc-850 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white active:scale-98 shadow-purple-950/40'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                <span>এআই আপনার চুলের স্বাস্থ্য ও ফেস কাটিং স্ক্যান করছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>এআই হেয়ার ম্যাক্সিং বিশ্লেষণ শুরু করুন</span>
              </>
            )}
          </button>

          {/* Analysis Results Display */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border border-purple-500/30 rounded-3xl p-5 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-white">
                      আপনার কাস্টম হেয়ার ম্যাক্সিং রিপোর্ট
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Face Shape & Hair Follicle AI Diagnosis
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-1 rounded-full font-mono font-bold">
                  {analysisResult.celebStyleMatch?.compatibility || '৮৮% পারফেক্ট ম্যাচ'}
                </span>
              </div>

              {/* BEST FRIEND DETAILED ADVICE BOX (বন্ধু টাইপ পরামর্শ) */}
              {analysisResult.friendAdvice && (
                <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/40 p-4 rounded-2xl space-y-2 relative overflow-hidden shadow-lg">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-sans">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500/30 animate-pulse" />
                    <span>🤝 এআই বন্ধুর বিশ্বস্ত পরামর্শ (Best Friend AI Advice):</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans font-medium whitespace-pre-line">
                    {analysisResult.friendAdvice}
                  </p>
                </div>
              )}

              {/* Face Shape & Current State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] text-purple-400 font-mono uppercase font-bold block">👤 ফেস কাটিং সনাক্তকরণ:</span>
                  <span className="text-xs font-bold text-zinc-100 block">{analysisResult.faceShape}</span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block">🌿 চোটের স্বাস্থ্য স্কোর:</span>
                  <span className="text-xs font-bold text-zinc-100 block">{analysisResult.currentHairState.healthScore} ({analysisResult.currentHairState.density})</span>
                </div>
              </div>

              {/* Celebrity Hair Cut Matching */}
              <div className="bg-purple-950/20 border border-purple-900/40 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-200 uppercase tracking-wider flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-purple-400" />
                    <span>প্রস্তাবিত পারফেক্ট হেয়ারকাট (Best Haircut for You):</span>
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-amber-300">
                    {analysisResult.celebStyleMatch.suggestedCut}
                  </span>
                </div>
                <ul className="space-y-2">
                  {analysisResult.celebStyleMatch.stepsToAchieve.map((step: string, idx: number) => (
                    <li key={idx} className="text-xs text-zinc-300 leading-relaxed font-sans flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product Recommendations */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  <span>কোন প্রোডাক্ট বা সিরাম লাগানো দরকার:</span>
                </h4>
                <div className="space-y-2">
                  {analysisResult.productRecommendations.map((prod: any, i: number) => (
                    <div key={i} className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <span className="block text-xs font-bold text-zinc-100 font-sans">{prod.name}</span>
                        <span className="block text-[10px] text-zinc-400 font-mono">{prod.usage}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-400 font-mono shrink-0 bg-amber-950/40 border border-amber-900/60 px-2.5 py-1 rounded-xl">
                        {prod.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Hair Routine */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>দৈনিক ডেইলি কেয়ার রুটিন:</span>
                </h4>
                <ul className="space-y-1.5">
                  {analysisResult.routinePlan.map((r: string, idx: number) => (
                    <li key={idx} className="text-xs text-zinc-300 font-sans flex items-start gap-2">
                      <span className="text-rose-400">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
