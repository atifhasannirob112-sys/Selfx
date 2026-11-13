import React, { useState, useEffect, useRef } from 'react';
import robotMascotImg from '../assets/images/selfx_app_icon_1787119659781.jpg';
import shirtCategoryImg from '../assets/images/wardrobe_shirt_1790501711479.jpg';
import pantCategoryImg from '../assets/images/wardrobe_pant_1790501729722.jpg';
import tshirtCategoryImg from '../assets/images/wardrobe_tshirt_1790501744433.jpg';
import shoeCategoryImg from '../assets/images/wardrobe_shoe_1790501759862.jpg';

import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Camera,
  Image as ImageIcon,
  Upload,
  Send,
  Sparkles,
  Home,
  Shirt,
  Layers,
  Bot,
  X,
  Check,
  Star,
  Plane,
  Heart,
  Briefcase,
  GraduationCap,
  Coffee,
  Sun,
  Dumbbell,
  Lightbulb,
  Maximize2,
  Trash2,
  Wand2,
  Palette,
  Tag
} from 'lucide-react';

export type MainCategory = 'Shirt' | 'Pant' | 'Tshirt' | 'Shoe';

export interface WardrobeGarment {
  id: string;
  code: string; // 3-digit code e.g. "445", "665", "789", "985"
  name: string;
  mainCategory: MainCategory;
  customCategory?: string;
  season: 'All' | 'Summer' | 'Winter' | 'Rainy';
  occasion: 'Casual' | 'Formal' | 'Sport' | 'Event';
  location?: string; // e.g. "আলমারির ৩য় তাক", "হ্যাঙ্গার ২", "ড্রয়ার ১"
  notes?: string;
  imageUrl: string;
  originalImageUrl?: string;
  studioBackdropId?: string;
  createdAt: string;
}

export interface CustomCategoryItem {
  id: string;
  name: string;
  iconName: string;
  colorBg: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

// Studio Backdrop Palette definitions for automatic background replacement
export const STUDIO_BACKDROPS = [
  { id: 'obsidian', name: 'Studio Obsidian', bg: 'linear-gradient(135deg, #0d1b32 0%, #060e1a 100%)', color: '#0d1b32' },
  { id: 'grey', name: 'Editorial Grey', bg: 'linear-gradient(135deg, #242c38 0%, #121720 100%)', color: '#242c38' },
  { id: 'sand', name: 'Warm Camel Sand', bg: 'linear-gradient(135deg, #2b2219 0%, #15100b 100%)', color: '#2b2219' },
  { id: 'slate', name: 'Tailored Navy', bg: 'linear-gradient(135deg, #112340 0%, #081222 100%)', color: '#112340' },
  { id: 'forest', name: 'Sage Olive', bg: 'linear-gradient(135deg, #18261e 0%, #09120e 100%)', color: '#18261e' },
];

// Custom Hanger SVG Icon (matching the glowing neon blue hanger in the screenshot)
export const HangerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2a3 3 0 0 1 3 3c0 1.3-.8 2.4-2 2.8V9" />
    <path d="M2.5 17.5 12 9l9.5 8.5a1.5 1.5 0 0 1-1 2.5H3.5a1.5 1.5 0 0 1-1-2.5z" />
    <path d="M2 20h20" />
  </svg>
);

// Helper function to remove background from image and composite clean studio backdrop
export function removeBackgroundAndApplyStudio(
  imageSrc: string,
  backdropId: string = 'obsidian'
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        const width = 800;
        const height = Math.round((img.height / img.width) * 800) || 800;
        canvas.width = width;
        canvas.height = height;

        // Draw original
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Sample corner colors (background detection)
        const corners = [
          { r: data[0], g: data[1], b: data[2] },
          { r: data[(width - 1) * 4], g: data[(width - 1) * 4 + 1], b: data[(width - 1) * 4 + 2] },
          { r: data[((height - 1) * width) * 4], g: data[((height - 1) * width) * 4 + 1], b: data[((height - 1) * width) * 4 + 2] },
          { r: data[((height - 1) * width + (width - 1)) * 4], g: data[((height - 1) * width + (width - 1)) * 4 + 1], b: data[((height - 1) * width + (width - 1)) * 4 + 2] }
        ];

        // Average corner color
        const bgR = corners.reduce((a, c) => a + c.r, 0) / 4;
        const bgG = corners.reduce((a, c) => a + c.g, 0) / 4;
        const bgB = corners.reduce((a, c) => a + c.b, 0) / 4;

        // Soft threshold mask
        const threshold = 48;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const diff = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          if (diff < threshold) {
            data[i + 3] = Math.max(0, Math.round((diff / threshold) * 255 * 0.3));
          }
        }

        const cutoutCanvas = document.createElement('canvas');
        cutoutCanvas.width = width;
        cutoutCanvas.height = height;
        const cutoutCtx = cutoutCanvas.getContext('2d');
        if (cutoutCtx) {
          cutoutCtx.putImageData(imageData, 0, 0);
        }

        // Draw final canvas with selected studio backdrop
        ctx.clearRect(0, 0, width, height);

        const grad = ctx.createLinearGradient(0, 0, width, height);
        if (backdropId === 'obsidian') {
          grad.addColorStop(0, '#0e1d35');
          grad.addColorStop(1, '#050a14');
        } else if (backdropId === 'grey') {
          grad.addColorStop(0, '#242c38');
          grad.addColorStop(1, '#10151e');
        } else if (backdropId === 'sand') {
          grad.addColorStop(0, '#2b2118');
          grad.addColorStop(1, '#130d07');
        } else if (backdropId === 'slate') {
          grad.addColorStop(0, '#112340');
          grad.addColorStop(1, '#07101e');
        } else {
          grad.addColorStop(0, '#19281f');
          grad.addColorStop(1, '#08130d');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Ambient glow
        const radialGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
        radialGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, width, height);

        // Drop shadow for garment
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 12;

        ctx.drawImage(cutoutCanvas, 0, 0);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (e) {
        console.warn('Canvas background replacement fallback:', e);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
  });
}

// Generate unique 3-digit code like 445, 665, 789, 985
const SAMPLE_CODES = [445, 665, 789, 985, 312, 524, 619, 831, 742, 915, 634, 558];
function generateThreeDigitCode(existingItems: WardrobeGarment[]): string {
  const existingCodes = new Set(existingItems.map(i => i.code));
  for (const sample of SAMPLE_CODES) {
    if (!existingCodes.has(String(sample))) {
      return String(sample);
    }
  }
  // If samples are exhausted, generate random 3-digit code
  let candidate = Math.floor(100 + Math.random() * 900);
  while (existingCodes.has(String(candidate))) {
    candidate = Math.floor(100 + Math.random() * 900);
  }
  return String(candidate);
}

interface DigitalWardrobeProps {
  onClose: () => void;
}

export const DigitalWardrobe: React.FC<DigitalWardrobeProps> = ({ onClose }) => {
  // START DIRECTLY ON DASHBOARD (No welcome/history screen, no dev toolbar!)
  const [currentScreen, setCurrentScreen] = useState<
    'dashboard' | 'add_category' | 'add_item_photo' | 'add_item_details' | 'assistant' | 'outfits' | 'category_view'
  >('dashboard');

  // Bottom Navigation active tab (PROFILE REMOVED as requested!)
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'wardrobe' | 'outfits' | 'assistant'>('home');

  // Selected Main Category
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>('Shirt');

  // Selected Occasion Filter for Outfits Suggestion Screen
  const [selectedOutfitOccasion, setSelectedOutfitOccasion] = useState<'College' | 'Casual' | 'Sport' | 'Event' | 'Travel'>('College');

  // Items State (ALL PRELOADED CLOTHES REMOVED - starts completely empty as requested!)
  const [items, setItems] = useState<WardrobeGarment[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_wardrobe_items_user_custom_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return []; // Empty start!
  });

  // Custom Categories State (ALL DEFAULT CATEGORIES REMOVED - user creates their own!)
  const [customCategories, setCustomCategories] = useState<CustomCategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_wardrobe_user_categories_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return []; // Empty start! User creates their own
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('selfx_wardrobe_items_user_custom_v4', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('selfx_wardrobe_user_categories_v4', JSON.stringify(customCategories));
  }, [customCategories]);

  // Form State for "Add Category"
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('camera');

  // Form State for "Add Item"
  const [itemRawPhotoUrl, setItemRawPhotoUrl] = useState<string>('');
  const [itemStudioPhotoUrl, setItemStudioPhotoUrl] = useState<string>('');
  const [isAutoCutoutActive, setIsAutoCutoutActive] = useState<boolean>(true);
  const [selectedStudioBackdrop, setSelectedStudioBackdrop] = useState<string>('obsidian');
  const [isProcessingStudioCutout, setIsProcessingStudioCutout] = useState<boolean>(false);

  const [itemCategory, setItemCategory] = useState<MainCategory>('Shirt');
  const [itemCustomCategory, setItemCustomCategory] = useState('');
  const [itemCodeInput, setItemCodeInput] = useState<string>('445');
  const [itemSeason, setItemSeason] = useState<'All' | 'Summer' | 'Winter' | 'Rainy'>('All');
  const [itemOccasion, setItemOccasion] = useState<'Casual' | 'Formal' | 'Sport' | 'Event'>('Casual');
  const [itemNotes, setItemNotes] = useState('');
  const [itemLocation, setItemLocation] = useState('');

  // AI Assistant Chat Messages in BENGALI (বাংলা)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "সালাম ব্রো! আমি আপনার পার্সোনাল AI Style Assistant 🤖✨\n\nআপনার যেকোনো পোশাকের ৩ সংখ্যার কোড (যেমন: 445, 665, 789, 985) উল্লেখ করে আমাকে প্রশ্ন করুন। আমি আপনাকে সেরা কালার কম্বিনেশন ও পরামর্শ দেব!",
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Settings / Help Modal State
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // When photo or studio backdrop changes, run background remove and apply studio backdrop
  const processImageBackground = async (rawSrc: string, backdropId: string) => {
    setIsProcessingStudioCutout(true);
    try {
      const processed = await removeBackgroundAndApplyStudio(rawSrc, backdropId);
      setItemStudioPhotoUrl(processed);
    } catch (e) {
      setItemStudioPhotoUrl(rawSrc);
    } finally {
      setIsProcessingStudioCutout(false);
    }
  };

  // Add Category Handler
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: CustomCategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      iconName: newCatIcon,
      colorBg: 'bg-blue-900/60 text-blue-400 border-blue-500/40'
    };

    setCustomCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setCurrentScreen('dashboard');
  };

  // Delete Custom Category Handler
  const handleDeleteCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('এই ক্যাটাগরি ডিলিট করতে চান?')) {
      setCustomCategories(prev => prev.filter(c => c.id !== catId));
    }
  };

  // Delete Clothing Item Handler
  const handleDeleteItem = (itemId: string, itemCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`কোড #${itemCode} জামাটি আপনার ওয়ার্ডরোব থেকে ডিলিট করতে চান?`)) {
      setItems(prev => prev.filter(it => it.id !== itemId));
    }
  };

  // Open Add Item Modal & pre-fill 3-digit code
  const openAddItemFlow = (category: MainCategory) => {
    setItemCategory(category);
    setItemCodeInput(generateThreeDigitCode(items));
    setCurrentScreen('add_item_photo');
  };

  // Add Item Save Handler (with 3-digit code e.g. 445, 665, 789, 985)
  const handleSaveItem = () => {
    const finalCode = (itemCodeInput.trim() || generateThreeDigitCode(items)).replace(/[^0-9]/g, '').slice(0, 3) || '445';
    const finalPhoto = isAutoCutoutActive ? itemStudioPhotoUrl : itemRawPhotoUrl;

    const newItem: WardrobeGarment = {
      id: `item-${Date.now()}`,
      code: finalCode,
      name: `${itemCategory} #${finalCode}`,
      mainCategory: itemCategory,
      customCategory: itemCustomCategory || undefined,
      season: itemSeason,
      occasion: itemOccasion,
      location: itemLocation.trim() || undefined,
      notes: itemNotes.trim() || undefined,
      imageUrl: finalPhoto || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      originalImageUrl: itemRawPhotoUrl,
      studioBackdropId: selectedStudioBackdrop,
      createdAt: new Date().toISOString()
    };

    setItems(prev => [newItem, ...prev]);

    // Reset fields and transition to Category View
    setItemNotes('');
    setItemLocation('');
    setSelectedMainCategory(itemCategory);
    setCurrentScreen('category_view');
    setActiveBottomTab('wardrobe');
  };

  // File Upload Handler (Auto triggers background isolate & studio background apply!)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const rawUrl = reader.result;
        setItemRawPhotoUrl(rawUrl);
        await processImageBackground(rawUrl, selectedStudioBackdrop);
        setCurrentScreen('add_item_details');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Quick Assistant Prompt Click (In Bengali with codes!)
  const handleQuickAssistantPrompt = (promptText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: promptText,
      time: 'Just now'
    };

    const firstItem = items[0];
    const secondItem = items[1];
    const thirdItem = items[2];

    let reply = '';
    if (promptText.includes('আজকে আমি কী পরব?')) {
      if (items.length > 0) {
        reply = `আজকের জন্য বেস্ট লুক:\nআপনার কোড **#${firstItem.code}** (${firstItem.name}) এর সাথে ${secondItem ? `**#${secondItem.code}** (${secondItem.name})` : 'যেকোনো ডার্ক প্যান্ট'} পরলে দারুণ লাগবে! ⚡`;
      } else {
        reply = "আপনার ওয়ার্ডরোবে এখনও কোনো জামা কাপড় অ্যাড করা হয়নি। নতুন জামা অ্যাড করে কোড (যেমন: 445, 665) দিয়ে জিজ্ঞেস করুন!";
      }
    } else if (promptText.includes('চেক করো')) {
      if (items.length >= 2) {
        reply = `আপনার **#${firstItem.code}** ও **#${secondItem.code}** এর কালার কম্বিনেশন চমৎকার! শার্ট বা টপটি হালকা কালার হলে নিচে ডার্ক কালার ট্রাউজার পরলে শার্পনেস অনেক বেড়ে যায়।`;
      } else {
        reply = "পোশাকের ছবি তুলে অ্যাড করুন, অটো ব্যাকগ্রাউন্ড যুক্ত হলে আমি আপনার লুক চেক করে দেব!";
      }
    } else if (promptText.includes('নতুন একটি লুক')) {
      reply = `মিনিমালিস্ট ওল্ড মানি লুকের জন্য:\nএকটি সলিড শার্টের হাতা দুই ভাঁজ গুটিয়ে ক্যাজুয়াল ট্রাউজার এবং পরিষ্কার জুতো পরুন। ঘড়ি ভুলবেন না! ✨`;
    } else {
      reply = "আপনার ওয়ার্ডরোবে একটি ক্লাসিক কালো ট্রাউজার বা সাদা স্নিকার্স যুক্ত করলে আপনি যেকোনো শার্টের সাথে সহজেই স্টাইল করতে পারবেন!";
    }

    const aiMsg: ChatMessage = {
      id: `msg-ai-${Date.now() + 1}`,
      sender: 'ai',
      text: reply,
      time: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg, aiMsg]);
  };

  // Handle Bengali / 3-Digit Code-based Chat Input Send (e.g. 445, 665, 789, 985)
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      // Parse 3-digit codes (e.g. 445, 665, 789, 985)
      const codeMatches = userText.match(/(?:#|\b)(\d{3})\b/g);
      let aiResponse = '';

      if (codeMatches && codeMatches.length > 0) {
        const cleanCodes = codeMatches.map(c => c.replace('#', ''));
        const matchedItems = items.filter(it => cleanCodes.includes(it.code));

        if (matchedItems.length === 1) {
          const item = matchedItems[0];
          const otherItems = items.filter(it => it.id !== item.id);
          const matchPartner = otherItems[0];

          aiResponse = `আপনার কোড **#${item.code}** (${item.name}) এর সাথে ${
            matchPartner ? `**#${matchPartner.code}** (${matchPartner.name})` : 'যেকোনো ডার্ক চিনো বা ফর্মাল প্যান্ট'
          } পরলে দারুণ ম্যাচিং হবে! ক্যাজুয়াল লুকের জন্য সাদা স্নিকার্স বেছে নিন। ✨`;
        } else if (matchedItems.length >= 2) {
          const names = matchedItems.map(i => `**#${i.code}** (${i.name})`).join(' এবং ');
          aiResponse = `আপনার ${names} এর কম্বিনেশন চমৎকার! কালার কন্ট্রাস্ট খুব ব্যালেন্সড। এর সাথে মানানসই ঘড়ি ও জুতো পরে নিলেই আপনি পুরোপুরি তৈরি! 💫`;
        } else {
          aiResponse = `আপনি কোড #${cleanCodes[0]} উল্লেখ করেছেন। এই কোডের কোনো জামা এখনও আপনার ওয়ার্ডরোবে পাওয়া যায়নি। ওয়ার্ডরোবে নতুন জামা অ্যাড করুন বা বিদ্যমান কোড ব্যবহার করুন!`;
        }
      } else if (userText.includes('কলেজ') || userText.includes('ক্লাস')) {
        aiResponse = "কলেজের জন্য রিল্যাক্সড কমফোর্ট সেরা: পরিষ্কার স্নিকার্স, কালো ট্রাউজার বা ডেনিম, আর আরামদায়ক কটন শার্ট বা টি-শার্ট!";
      } else if (userText.includes('পার্টি') || userText.includes('দাওয়াত') || userText.includes('event')) {
        aiResponse = "অনুষ্ঠানের জন্য অল-ব্ল্যাক বা ডার্ক মনোটোন লুক পারফেক্ট! শার্ট বা ব্লেজার ইন করে পরবেন আর জুতো অবশ্যই চকচকে রাখবেন।";
      } else {
        aiResponse = "দারুণ প্রশ্ন ব্রো! আপনি যে কোনো জামার ৩ সংখ্যার কোড (যেমন: 445, 665, 789) দিয়ে জিজ্ঞেস করুন, আমি সুনির্দিষ্ট পরামর্শ দিয়ে দেব।";
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        time: 'Just now'
      };
      setChatMessages(prev => [...prev, aiMsg]);
    }, 450);
  };

  // Helper to count items in main categories
  const countInMainCategory = (cat: MainCategory) => {
    return items.filter(i => i.mainCategory === cat).length;
  };

  // Helper to count items in custom category
  const countInCustomCategory = (catName: string) => {
    return items.filter(i => i.customCategory?.toLowerCase() === catName.toLowerCase()).length;
  };

  // Render Icon helper for Custom Categories
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'graduation': return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case 'runner': return <span className="text-emerald-400 font-bold text-sm">🏃</span>;
      case 'dumbbell': return <Dumbbell className="w-5 h-5 text-lime-400" />;
      case 'star': return <Star className="w-5 h-5 text-amber-400 fill-amber-400/40" />;
      case 'plane': return <Plane className="w-5 h-5 text-sky-400" />;
      case 'home': return <Home className="w-5 h-5 text-yellow-400" />;
      case 'heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'camera': return <Camera className="w-5 h-5 text-blue-400" />;
      case 'briefcase': return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'coffee': return <Coffee className="w-5 h-5 text-amber-500" />;
      default: return <Shirt className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#030712] text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* MOBILE CONTAINER (CLEAN, NO DEV BUTTONS, NO ONBOARDING) */}
      <div className="flex-1 flex items-center justify-center p-0 sm:p-2 overflow-y-auto bg-gradient-to-b from-[#050b15] via-[#030712] to-[#010409]">
        <div className="w-full max-w-[420px] h-full sm:h-[844px] bg-[#070e1b] sm:rounded-[36px] border-0 sm:border-[3px] sm:border-[#1a2d4b] shadow-[0_0_50px_rgba(14,165,233,0.15)] flex flex-col overflow-hidden relative">

          {/* ========================================================== */}
          {/* SCREEN 2: MAIN WARDROBE DASHBOARD ("Your Style Collection")*/}
          {/* ========================================================== */}
          {currentScreen === 'dashboard' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
              
              {/* Header with Title and Clean Close Button */}
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#12233e] shrink-0 bg-[#070e1b]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner">
                    <HangerIcon className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-black text-white leading-none">
                      Wardrobe
                    </h2>
                    <span className="text-[11px] text-sky-400 font-semibold tracking-wide block mt-0.5">
                      Your Style Collection
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowTutorialModal(true)}
                    className="p-2 rounded-xl bg-[#0f1d35] border border-[#1e3862] text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-all"
                    title="Rules & Settings"
                  >
                    <Settings className="w-4 h-4 text-sky-400" />
                  </button>

                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-200 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                    title="Exit Wardrobe"
                  >
                    <span>Close</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Dashboard Body */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 custom-scrollbar">
                
                {/* 4 MAIN CATEGORIES ROW (Shirt, Pant, Tshirt, Shoe) */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { cat: 'Shirt' as MainCategory, img: shirtCategoryImg },
                    { cat: 'Pant' as MainCategory, img: pantCategoryImg },
                    { cat: 'Tshirt' as MainCategory, img: tshirtCategoryImg },
                    { cat: 'Shoe' as MainCategory, img: shoeCategoryImg },
                  ].map(({ cat, img }) => {
                    const count = countInMainCategory(cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => {
                          setSelectedMainCategory(cat);
                          setCurrentScreen('category_view');
                          setActiveBottomTab('wardrobe');
                        }}
                        className="bg-[#0b162a] border border-[#1b3154] hover:border-sky-500/60 rounded-2xl p-1.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-md"
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#060c18] border border-[#162744] mb-1.5">
                          <img src={img} alt={cat} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-white">{cat}</span>
                        <span className="text-[10px] text-sky-400 font-mono font-semibold">{count} items</span>
                      </div>
                    );
                  })}
                </div>

                {/* Section Header: My Categories (User Creates Their Own!) */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-sm font-bold text-white">My Categories</h3>
                    <span className="text-[10px] text-zinc-400">নিজের পছন্দমতো ক্যাটাগরি তৈরি করুন</span>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('add_category')}
                    className="p-1.5 px-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black cursor-pointer transition-all active:scale-90 flex items-center gap-1 text-[11px] font-bold shadow-md"
                    title="Add Custom Category"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ক্যাটাগরি বানান</span>
                  </button>
                </div>

                {/* Custom Categories List: Empty State or User-Added Categories */}
                {customCategories.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-[#0b162a]/60 border border-dashed border-[#1b3154] text-center space-y-2">
                    <p className="text-xs text-zinc-400">
                      কোনো ক্যাটাগরি নেই। উপরের <strong className="text-sky-400">+ ক্যাটাগরি বানান</strong> বাটনে চাপ দিয়ে অফিস, কলেজ বা পার্টির জন্য ক্যাটাগরি তৈরি করুন।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setItemCustomCategory(cat.name);
                          setCurrentScreen('category_view');
                          setActiveBottomTab('wardrobe');
                        }}
                        className="bg-[#0b162a] border border-[#162947] hover:border-[#254677] rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${cat.colorBg}`}>
                            {renderCategoryIcon(cat.iconName)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                            <span className="text-[10px] text-zinc-400">{countInCustomCategory(cat.name)} items</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCategory(cat.id, e)}
                            className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Navigation Bar (PROFILE TAB REMOVED AS REQUESTED) */}
              <div className="border-t border-[#12233e] bg-[#070e1b] px-3 py-2 flex items-center justify-around shrink-0 z-20">
                {[
                  { id: 'home', label: 'Wardrobe', icon: Home, screen: 'dashboard' },
                  { id: 'outfits', label: 'Outfits', icon: Layers, screen: 'outfits' },
                  { id: 'assistant', label: 'AI Assistant', icon: Bot, screen: 'assistant' },
                ].map((tab) => {
                  const IconComp = tab.icon as any;
                  const isActive = activeBottomTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveBottomTab(tab.id as any);
                        setCurrentScreen(tab.screen as any);
                      }}
                      className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl cursor-pointer transition-all ${
                        isActive ? 'text-sky-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                      <span className="text-[11px]">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 3: ADD CATEGORY SCREEN                            */}
          {/* ========================================================== */}
          {currentScreen === 'add_category' && (
            <div className="flex-1 flex flex-col justify-between p-5 overflow-y-auto custom-scrollbar animate-fadeIn">
              
              {/* Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="p-1.5 rounded-xl bg-[#0e1c33] text-zinc-300 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-bold text-white">Add Category</h2>
              </div>

              {/* Body */}
              <div className="my-auto space-y-5 py-4">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
                    <Plus className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">Create Your Own Category</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto font-sans leading-relaxed">
                    নিজের পছন্দমতো ক্যাটাগরির নাম ও আইকন দিন (যেমন: কলেজ, অফিস, পার্টি, ট্রাভেল)।
                  </p>
                </div>

                {/* Input Field */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Office, Gym, Party, Travel, College..."
                    className="w-full bg-[#0b162a] border border-[#1b3154] rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Choose Icon Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">Choose Icon</label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { id: 'camera', icon: Camera },
                      { id: 'dumbbell', icon: Dumbbell },
                      { id: 'star', icon: Star },
                      { id: 'plane', icon: Plane },
                      { id: 'home', icon: Home },
                      { id: 'sun', icon: Sun },
                      { id: 'heart', icon: Heart },
                      { id: 'briefcase', icon: Briefcase },
                      { id: 'graduation', icon: GraduationCap },
                      { id: 'coffee', icon: Coffee },
                      { id: 'shirt', icon: Shirt },
                      { id: 'sparkles', icon: Sparkles },
                    ].map(({ id, icon: IconC }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setNewCatIcon(id)}
                        className={`aspect-square rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                          newCatIcon === id
                            ? 'bg-sky-500 text-black border-sky-400 shadow-md scale-105'
                            : 'bg-[#0b162a] border-[#182c4a] text-sky-400 hover:bg-[#10223f]'
                        }`}
                      >
                        <IconC className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Create Button */}
              <div className="pt-4">
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCatName.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-full flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <span>Create Category</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 4: ADD ITEM (PHOTO CAPTURE / SOURCE SELECTION)      */}
          {/* ========================================================== */}
          {currentScreen === 'add_item_photo' && (
            <div className="flex-1 flex flex-col justify-between p-5 overflow-hidden animate-fadeIn relative">
              
              {/* Header */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setCurrentScreen('category_view')}
                  className="p-1.5 rounded-xl bg-[#0e1c33] text-zinc-300 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-bold text-white">Add Item</h2>
              </div>

              {/* Category Selector Pills at Top */}
              <div className="flex items-center gap-1.5 pt-2 pb-1 shrink-0">
                {(['Shirt', 'Pant', 'Tshirt', 'Shoe'] as MainCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedMainCategory(cat);
                      setItemCategory(cat);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      itemCategory === cat
                        ? 'bg-sky-500 text-black shadow-md'
                        : 'bg-[#0b162a] text-zinc-400 border border-[#162744] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Central Moody Photo Area */}
              <div className="my-auto w-full aspect-[4/5] rounded-3xl overflow-hidden relative border border-[#1a2e4e] bg-gradient-to-b from-[#0e1b30] via-[#091120] to-[#040810] flex flex-col items-center justify-center p-6 text-center shadow-2xl">
                
                {/* Background ambient lighting */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent pointer-events-none" />

                {/* Central Card: Take a Photo or Choose from Gallery */}
                <div className="bg-[#0b1628]/90 border border-sky-500/30 rounded-3xl p-6 space-y-3 backdrop-blur-md max-w-xs w-full shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Take a Photo</h3>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 font-sans">— or —</span>
                    <span className="text-xs text-sky-400 font-semibold block mt-0.5">Choose from Gallery</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      🪄 অটো ব্যাকগ্রাউন্ড রিমুভ ও স্টুডিও লুক
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons: Camera | Gallery | Upload */}
              <div className="grid grid-cols-2 gap-3 pt-3 shrink-0">
                <label className="py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-bold flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95 transition-all shadow-md">
                  <Camera className="w-4 h-4" />
                  <span>ক্যামেরা দিয়ে ছবি তুলুন</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <label className="py-3 rounded-2xl bg-[#0b162a] border border-[#192f50] hover:border-sky-500/50 text-zinc-200 hover:text-white flex items-center justify-center gap-2 text-xs font-bold cursor-pointer active:scale-95 transition-all">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>গ্যালারি থেকে নিন</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 5: ADD ITEM (DETAILS & SAVE FORM WITH 3-DIGIT CODE) */}
          {/* ========================================================== */}
          {currentScreen === 'add_item_details' && (
            <div className="flex-1 flex flex-col justify-between p-5 overflow-y-auto custom-scrollbar animate-fadeIn">
              
              {/* Header with Save button and 3-digit Code badge (e.g. 445, 665, 789, 985) */}
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen('add_item_photo')}
                    className="p-1.5 rounded-xl bg-[#0e1c33] text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-white">Add Item</h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-500/30">
                    <span className="text-[10px] text-zinc-400 font-mono">কোড:</span>
                    <span className="text-sky-400 font-mono text-xs font-black">
                      #{itemCodeInput || '445'}
                    </span>
                  </div>
                  <button
                    onClick={handleSaveItem}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-3 py-3 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Garment Photo Preview with Auto Background Removal & Studio Color Replacement */}
                <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#060c18] border border-[#1a2e4e] relative group shadow-xl">
                  <img 
                    src={isAutoCutoutActive ? (itemStudioPhotoUrl || itemRawPhotoUrl) : itemRawPhotoUrl} 
                    alt="Item Preview" 
                    className="w-full h-full object-cover transition-all duration-300" 
                  />

                  {/* Processing indicator */}
                  {isProcessingStudioCutout && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 text-sky-400 text-xs font-bold">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>স্টুডিও ব্যাকগ্রাউন্ড তৈরি হচ্ছে...</span>
                    </div>
                  )}

                  {/* Cutout Toggle Button */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAutoCutoutActive(prev => !prev)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer ${
                        isAutoCutoutActive 
                          ? 'bg-sky-500 text-black border border-sky-300 shadow-md' 
                          : 'bg-black/60 text-zinc-300 border border-white/20'
                      }`}
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>{isAutoCutoutActive ? 'Studio BG: ON' : 'Original Photo'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentScreen('add_item_photo')}
                    className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Change Photo"
                  >
                    <Maximize2 className="w-4 h-4 text-sky-400" />
                  </button>
                </div>

                {/* Studio Color Backdrop Selector (User Requested Color Choice) */}
                <div className="bg-[#0b162a] border border-[#162744] p-2.5 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-400 font-mono uppercase flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Studio Backdrop Color</span>
                    </span>
                    <span className="text-[9px] text-zinc-400 font-sans">
                      {STUDIO_BACKDROPS.find(b => b.id === selectedStudioBackdrop)?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                    {STUDIO_BACKDROPS.map((bd) => (
                      <button
                        key={bd.id}
                        type="button"
                        onClick={async () => {
                          setSelectedStudioBackdrop(bd.id);
                          await processImageBackground(itemRawPhotoUrl, bd.id);
                        }}
                        className={`w-7 h-7 rounded-full border-2 transition-all shrink-0 flex items-center justify-center ${
                          selectedStudioBackdrop === bd.id
                            ? 'border-sky-400 scale-110 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                            : 'border-zinc-700 opacity-70 hover:opacity-100'
                        }`}
                        style={{ background: bd.bg }}
                        title={bd.name}
                      >
                        {selectedStudioBackdrop === bd.id && (
                          <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3-Digit Code Field (e.g. 445, 665, 789, 985) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-400">৩ সংখ্যার পোশাক কোড (যেমন: 445, 665, 789)</label>
                    <button
                      type="button"
                      onClick={() => setItemCodeInput(generateThreeDigitCode(items))}
                      className="text-[10px] text-sky-400 font-mono hover:underline"
                    >
                      র্যান্ডম কোড জেনারেট
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sky-400 font-bold">#</span>
                    <input
                      type="text"
                      maxLength={3}
                      value={itemCodeInput}
                      onChange={(e) => setItemCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 445, 665, 789, 985"
                      className="w-full bg-[#0b162a] border border-[#162744] rounded-2xl pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                {/* Category Picker */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400">Category</label>
                  <div className="bg-[#0b162a] border border-[#162744] rounded-2xl px-4 py-3 flex items-center justify-between text-xs font-bold text-white">
                    <div className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-sky-400" />
                      <span>{itemCategory}</span>
                    </div>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value as MainCategory)}
                      className="bg-transparent text-sky-400 text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="Shirt" className="bg-[#070e1b] text-white">Shirt</option>
                      <option value="Pant" className="bg-[#070e1b] text-white">Pant</option>
                      <option value="Tshirt" className="bg-[#070e1b] text-white">Tshirt</option>
                      <option value="Shoe" className="bg-[#070e1b] text-white">Shoe</option>
                    </select>
                  </div>
                </div>

                {/* Custom Category Selection (From user's own categories) */}
                {customCategories.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">Custom Category (Optional)</label>
                    <select
                      value={itemCustomCategory}
                      onChange={(e) => setItemCustomCategory(e.target.value)}
                      className="w-full bg-[#0b162a] border border-[#162744] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400"
                    >
                      <option value="">কোনোটিই নয় (None)</option>
                      {customCategories.map(c => (
                        <option key={c.id} value={c.name} className="bg-[#070e1b] text-white">{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Season Pills */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400">Season</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['All', 'Summer', 'Winter', 'Rainy'] as const).map((seas) => (
                      <button
                        key={seas}
                        type="button"
                        onClick={() => setItemSeason(seas)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          itemSeason === seas
                            ? 'bg-sky-500 text-black shadow-md font-bold'
                            : 'bg-[#0b162a] text-zinc-400 border border-[#162744] hover:text-white'
                        }`}
                      >
                        {seas}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion Pills */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400">Occasion</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Casual', 'Formal', 'Sport', 'Event'] as const).map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setItemOccasion(occ)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          itemOccasion === occ
                            ? 'bg-sky-500 text-black shadow-md font-bold'
                            : 'bg-[#0b162a] text-zinc-400 border border-[#162744] hover:text-white'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes (Optional) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400">Notes (Optional)</label>
                  <input
                    type="text"
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    placeholder="e.g. Best for college or evening wear..."
                    className="w-full bg-[#0b162a] border border-[#162744] rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Keeping Location / রাখার জায়গা (যেমন: আলমারির ৩য় তাক, হ্যাঙ্গার ২) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
                    <span>📍 রাখার জায়গা / লোকেশন (কোন জায়গায় আছে)</span>
                  </label>
                  <input
                    type="text"
                    value={itemLocation}
                    onChange={(e) => setItemLocation(e.target.value)}
                    placeholder="যেমন: আলমারির ৩য় তাক, হ্যাঙ্গার ২, ড্রয়ার ৩..."
                    className="w-full bg-[#0b162a] border border-[#162744] focus:border-sky-400 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Bottom Save Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveItem}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Item (#{itemCodeInput || '445'})</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 6: AI STYLE ASSISTANT (BENGALI + 3-DIGIT CODES)     */}
          {/* ========================================================== */}
          {currentScreen === 'assistant' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
              
              {/* Header */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#12233e] shrink-0 bg-[#070e1b]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setCurrentScreen('dashboard');
                      setActiveBottomTab('home');
                    }}
                    className="p-1 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold text-white">AI Style Assistant</h2>
                      <span className="text-[9px] font-bold bg-sky-500 text-black px-1.5 py-0.2 rounded-full uppercase">
                        বাংলা
                      </span>
                    </div>
                    <span className="text-[10px] text-sky-400 font-mono">কোড (যেমন: 445, 665) উল্লেখ করুন</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full overflow-hidden border border-sky-400/50">
                  <img src={robotMascotImg} alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Quick Wardrobe Item Code Chips Strip */}
              {items.length > 0 && (
                <div className="px-4 py-2 bg-[#091322] border-b border-[#162744] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold shrink-0">পোশাক কোড:</span>
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setChatInput(prev => `${prev ? prev + ' ' : ''}#${item.code}`)}
                      className="px-2 py-0.5 rounded-lg bg-[#0e1d35] hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold shrink-0 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>#{item.code}</span>
                      <span className="text-zinc-400 font-normal">({item.mainCategory})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat & Prompt Content Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                
                {/* Robot Welcome Mascot Bubble (In Bengali) */}
                <div className="bg-[#0b162a] border border-sky-500/30 rounded-3xl p-3.5 flex items-start gap-3 shadow-lg">
                  <div className="flex-1 text-xs text-zinc-300 font-sans leading-relaxed space-y-1">
                    <p className="font-bold text-white">সালাম ব্রো! আমি আপনার AI Style Assistant।</p>
                    <p className="text-[11px] text-sky-300">৩ সংখ্যার কোড দিয়ে জিজ্ঞেস করুন (যেমন: 445, 665):</p>
                    <ul className="list-disc list-inside text-zinc-400 text-[10.5px] space-y-0.5 pl-1">
                      <li>"445 এর সাথে কোন প্যান্ট মানাবে?"</li>
                      <li>"665 আর 789 দিয়ে আউটফিট সাজাও"</li>
                      <li>কালার হারমোনি ও জুতোর ম্যাচিং</li>
                    </ul>
                  </div>

                  <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-sky-400 shadow-md shrink-0 bg-[#060c18]">
                    <img src={robotMascotImg} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* 4 Quick Action Prompt Cards in Bengali */}
                <div className="space-y-1.5">
                  {[
                    {
                      title: 'আজকে আমি কী পরব?',
                      subtitle: 'কোড অনুযায়ী আজকের সেরা আউটফিট সাজেস্ট করো।',
                      icon: Shirt,
                    },
                    {
                      title: 'আমার পোশাকের লুক চেক করো',
                      subtitle: 'কালার কম্বিনেশন ও প্রোপোরশন রিভিউ নাও।',
                      icon: Camera,
                    },
                    {
                      title: 'নতুন একটি লুক বানিয়ে দাও',
                      subtitle: 'ওয়ার্ডরোব থেকে ওল্ড মানি লুক মিক্স করো।',
                      icon: Layers,
                    },
                    {
                      title: 'নতুন জামার আইডিয়া দাও',
                      subtitle: 'আমার কালেকশনে আর কী যোগ করা উচিত?',
                      icon: Lightbulb,
                    },
                  ].map((card, idx) => {
                    const IconC = card.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleQuickAssistantPrompt(card.title)}
                        className="bg-[#0b162a] border border-[#162947] hover:border-sky-500/50 rounded-2xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
                      >
                        <div className="w-7 h-7 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
                          <IconC className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{card.title}</h4>
                          <p className="text-[10px] text-zinc-400 truncate">{card.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Messages */}
                {chatMessages.slice(1).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${
                        msg.sender === 'user'
                          ? 'bg-sky-500 text-black font-semibold'
                          : 'bg-[#0e1c33] border border-[#1a345c] text-zinc-200'
                      }`}
                    >
                      <p className="leading-relaxed font-sans whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Bottom Bengali Input Bar */}
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-[#12233e] bg-[#070e1b] flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="বাংলায় লিখুন, যেমন: 445 এর সাথে কি পরব?..."
                  className="flex-1 bg-[#0b162a] border border-[#162744] rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-black flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 7: OUTFIT SUGGESTIONS SCREEN                        */}
          {/* ========================================================== */}
          {currentScreen === 'outfits' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
              
              {/* Header */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#12233e] shrink-0 bg-[#070e1b]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setCurrentScreen('dashboard');
                      setActiveBottomTab('home');
                    }}
                    className="p-1 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-white">Outfit Suggestions</h2>
                </div>
              </div>

              {/* Occasion Filter Pills */}
              <div className="px-5 pt-3 pb-1 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
                {(['College', 'Casual', 'Sport', 'Event', 'Travel'] as const).map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setSelectedOutfitOccasion(occ)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      selectedOutfitOccasion === occ
                        ? 'bg-sky-500 text-black shadow-md'
                        : 'bg-[#0b162a] text-zinc-400 border border-[#162744] hover:text-white'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>

              {/* Outfits Content Area */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-[#0b162a]/40 border border-dashed border-[#1a2f50] rounded-3xl p-6">
                    <HangerIcon className="w-10 h-10 text-sky-400 mx-auto" />
                    <h3 className="text-sm font-bold text-white">ওয়ার্ডরোবে কোনো জামা নেই</h3>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                      প্রথমে আপনার শার্ট, প্যান্ট ও জুতোর ছবি অ্যাড করুন। এরপর AI স্বয়ংক্রিয়ভাবে আউটফিট কম্বিনেশন তৈরি করে দেবে!
                    </p>
                    <button
                      onClick={() => openAddItemFlow('Shirt')}
                      className="px-4 py-2 bg-sky-500 text-black font-bold text-xs rounded-full inline-flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>জামা কাপড় যোগ করুন</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-[#0b162a] border border-[#1a2f50] rounded-3xl overflow-hidden shadow-xl space-y-3 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {items.slice(0, 4).map(it => (
                          <div key={it.id} className="aspect-square rounded-2xl overflow-hidden bg-black relative border border-white/10">
                            <img src={it.imageUrl} alt="" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-sky-400 font-bold">
                              #{it.code}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="px-1 space-y-1">
                        <h3 className="text-sm font-bold text-white">Simple & Clean Combination</h3>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          {selectedOutfitOccasion} অকেশনের জন্য পারফেক্ট কম্বিনেশন।
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom "Save to Wardrobe" Button */}
              <div className="p-4 border-t border-[#12233e] bg-[#070e1b] shrink-0">
                <button
                  onClick={() => {
                    alert('আউটফিটটি আপনার লুকবুকে সেভ হয়েছে! ✨');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Save to Wardrobe
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 8: WARDROBE CATEGORY VIEW & 3-DIGIT CODES           */}
          {/* ========================================================== */}
          {currentScreen === 'category_view' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
              
              {/* Header */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#12233e] shrink-0 bg-[#070e1b]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setCurrentScreen('dashboard');
                      setActiveBottomTab('home');
                    }}
                    className="p-1 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-white">Wardrobe Items</h2>
                </div>

                <button 
                  onClick={() => setShowTutorialModal(true)}
                  className="p-1.5 rounded-xl bg-[#0f1d35] border border-[#1e3862] text-zinc-300 hover:text-white cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Main Category Pills: Shirt | Pant | Tshirt | Shoe */}
              <div className="px-5 pt-3 pb-1 flex items-center gap-2 shrink-0">
                {(['Shirt', 'Pant', 'Tshirt', 'Shoe'] as MainCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedMainCategory(cat)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMainCategory === cat
                        ? 'bg-sky-500 text-black shadow-md'
                        : 'bg-[#0b162a] text-zinc-400 border border-[#162744] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Content Body: Empty State OR Populated Items With 3-Digit Codes & Easy Delete */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col justify-between custom-scrollbar">
                {items.filter(i => i.mainCategory === selectedMainCategory).length === 0 ? (
                  
                  // EMPTY STATE (Clean start as requested)
                  <div className="my-auto space-y-6 text-center py-6">
                    <div className="w-24 h-24 rounded-full bg-[#0d1c34] border-2 border-sky-400/40 text-sky-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                      <HangerIcon className="w-12 h-12 text-sky-400" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">No {selectedMainCategory} Yet</h3>
                      <p className="text-xs text-zinc-400 font-sans max-w-xs mx-auto">
                        আপনার প্রথম {selectedMainCategory.toLowerCase()} অ্যাড করুন। ফটো তোলার পর ব্যাকগ্রাউন্ড স্বয়ংক্রিয়ভাবে মুছে স্টুডিও কালার বসে যাবে!
                      </p>
                    </div>

                    <div className="space-y-2.5 max-w-xs mx-auto w-full">
                      <button
                        onClick={() => openAddItemFlow(selectedMainCategory)}
                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add {selectedMainCategory}</span>
                      </button>

                      <button
                        onClick={() => setShowTutorialModal(true)}
                        className="w-full py-3 bg-[#0b162a] hover:bg-[#10203a] border border-[#182d4d] text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
                      >
                        গাইড ও টিপস দেখুন
                      </button>
                    </div>

                    <div className="bg-[#0b162a] border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5 text-left max-w-xs mx-auto">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] leading-snug">
                        <span className="font-bold text-amber-300 block">স্মার্ট কোড সিস্টেম</span>
                        <span className="text-zinc-400">প্রতিটি পোশাকে ৩ সংখ্যার কোড (যেমন: 445, 665) থাকবে যা দিয়ে AI Assistant-এর সাথে কথা বলা যাবে।</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  
                  // POPULATED ITEMS GRID WITH 3-DIGIT CODE BADGES & EASY DELETE BUTTONS!
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-mono">
                        {items.filter(i => i.mainCategory === selectedMainCategory).length} items cataloged
                      </span>
                      <button
                        onClick={() => openAddItemFlow(selectedMainCategory)}
                        className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold rounded-full flex items-center gap-1 cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add {selectedMainCategory}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {items.filter(i => i.mainCategory === selectedMainCategory).map(item => (
                        <div 
                          key={item.id} 
                          className="bg-[#0b162a] border border-[#162744] hover:border-sky-500/50 rounded-2xl overflow-hidden p-2 space-y-1.5 transition-all shadow-md group relative"
                        >
                          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-black relative">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            
                            {/* 3-DIGIT CODE PROMINENT BADGE (e.g. #445, #665, #789, #985) */}
                            <div className="absolute top-1.5 left-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[11px] font-mono font-black text-sky-400 border border-sky-400/40 shadow-lg">
                                #{item.code}
                              </span>
                            </div>

                            {/* PROMINENT DELETE BUTTON (USER REQUESTED!) */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteItem(item.id, item.code, e)}
                              className="absolute top-1.5 right-1.5 px-2 py-1 rounded-md bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 hover:text-white cursor-pointer shadow-md flex items-center gap-1 text-[10px] font-bold active:scale-90 transition-all"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>ডিলিট</span>
                            </button>
                          </div>

                          <div className="px-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-white truncate max-w-[100px]">{item.name}</h4>
                              <span className="text-[10px] font-mono font-bold text-sky-400">#{item.code}</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 block truncate">{item.season} · {item.occasion}</span>
                            {item.location && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-300/90 font-medium truncate pt-0.5">
                                <span>📍</span>
                                <span className="truncate">{item.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation Bar (PROFILE REMOVED) */}
              <div className="border-t border-[#12233e] bg-[#070e1b] px-3 py-2 flex items-center justify-around shrink-0 z-20">
                {[
                  { id: 'home', label: 'Wardrobe', icon: Home, screen: 'dashboard' },
                  { id: 'outfits', label: 'Outfits', icon: Layers, screen: 'outfits' },
                  { id: 'assistant', label: 'AI Assistant', icon: Bot, screen: 'assistant' },
                ].map((tab) => {
                  const IconComp = tab.icon as any;
                  const isActive = activeBottomTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveBottomTab(tab.id as any);
                        setCurrentScreen(tab.screen as any);
                      }}
                      className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl cursor-pointer transition-all ${
                        isActive ? 'text-sky-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                      <span className="text-[11px]">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Tutorial / Help Modal */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a1529] border border-sky-500/30 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#162b4c] pb-3">
              <div className="flex items-center gap-2">
                <HangerIcon className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Wardrobe Rules & Tips</h3>
              </div>
              <button onClick={() => setShowTutorialModal(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 font-sans leading-relaxed">
              <p className="font-bold text-sky-400">Atif Better You, Every Day</p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-[#060c18] border border-[#142644]">
                  <strong className="text-white block mb-0.5">১. অটো স্টুডিও ব্যাকগ্রাউন্ড</strong>
                  <span>ছবি আপলোড করলে মেসের বা রুমের এলোমেলো ব্যাকগ্রাউন্ড বাদ গিয়ে লাক্সারি স্টুডিও ব্যাকগ্রাউন্ড বসে যাবে।</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060c18] border border-[#142644]">
                  <strong className="text-white block mb-0.5">২. ৩ সংখ্যার কোড সিস্টেম (#445, #665)</strong>
                  <span>প্রতিটি পোশাকের ৩ সংখ্যার কোড দিয়ে AI Assistant-এর সাথে বাংলায় সরাসরি কথা বলুন।</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060c18] border border-[#142644]">
                  <strong className="text-white block mb-0.5">৩. সহজ ডিলিট অপশন</strong>
                  <span>যেকোনো পোশাকের পাশে ডিলিট বাটনে ক্লিক করে এক ট্যাপে মুছে ফেলতে পারবেন।</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTutorialModal(false)}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs uppercase rounded-full transition-all cursor-pointer"
            >
              বুঝেছি · সম্পন্ন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalWardrobe;
