import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Image as ImageIcon, Sparkles, Plus, Trash2, Send, Check, ShieldCheck, Heart, Upload, RefreshCw, Loader2, Video } from 'lucide-react';
import { triggerNotification } from '../utils';
import { getMediaItem, saveMediaItem, getAllStoredMediaKeys, convertBlobUrlToDataUrl } from '../utils/mediaStorage';

interface SecretModelVaultProps {
  onClose?: () => void;
}

export interface ModelPersona {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  isCustom?: boolean;
}

export interface VaultModelPhoto {
  id: string;
  persona: string;
  author?: string;
  avatar?: string;
  numberId?: string;
  image: string;
  mediaType?: 'image' | 'video';
  caption: string;
  createdAt: string;
  postedToGrowgram?: boolean;
}

const VaultMediaRenderer: React.FC<{ imageSrc: string; mediaType?: 'image' | 'video' }> = ({ imageSrc, mediaType }) => {
  const [src, setSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!imageSrc) {
      setSrc('');
      setLoading(false);
      return;
    }

    // Direct base64 data or standard http URL
    if (imageSrc.startsWith('data:') || imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('/')) {
      setSrc(imageSrc);
      setLoading(false);
      return;
    }

    getMediaItem(imageSrc).then(async data => {
      if (!isMounted) return;
      if (data) {
        setSrc(data);
        setLoading(false);
      } else {
        try {
          const apiRes = await fetch(`/api/community/media?id=${imageSrc}`);
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData && apiData.success && apiData.dataUrl) {
              setSrc(apiData.dataUrl);
              saveMediaItem(imageSrc, apiData.dataUrl).catch(() => {});
              setLoading(false);
              return;
            }
          }
        } catch (e) {}
        // Fallback to streaming buffer endpoint
        setSrc(`/api/community/media/stream?id=${imageSrc}`);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setSrc(`/api/community/media/stream?id=${imageSrc}`);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageSrc]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
      </div>
    );
  }

  const isVideo = mediaType === 'video' || src.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)($|\?)/i.test(src);

  if (isVideo && src) {
    return (
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain bg-black"
      />
    );
  }

  return (
    <img
      src={src || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
      alt="Model Media"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover"
    />
  );
};

const DEFAULT_PERSONAS: ModelPersona[] = [
  {
    id: 'hamza_malik',
    name: 'Hamza Malik',
    handle: '@hamza_malik',
    avatar: '/assets/models/hamza_malik.jpg',
    bio: 'Aesthetic Lifestyle & Modern Pakistani Streetwear Model 🇵🇰⚡'
  },
  {
    id: 'zaviyar_nauman',
    name: 'Zaviyar Nauman',
    handle: '@zaviyar_nauman',
    avatar: '/assets/models/zaviyar_nauman.jpg',
    bio: "Men's High-Fashion & Editorial Looksmaxing Creator 🔱"
  },
  {
    id: 'daniyal_zafar',
    name: 'Daniyal Zafar',
    handle: '@daniyal_zafar',
    avatar: '/assets/models/daniyal_zafar.jpg',
    bio: 'Pakistani TikTok Star & Vibe Aesthetics ✨'
  },
  {
    id: 'bilal_abbas',
    name: 'Bilal Abbas',
    handle: '@bilal_abbas',
    avatar: '/assets/models/bilal_abbas.jpg',
    bio: 'Classic Grooming, Chiseled Frame & Mindset 💎'
  },
  {
    id: 'shahzad_noor',
    name: 'Shahzad Noor',
    handle: '@shahzad_noor',
    avatar: '/assets/models/shahzad_noor.jpg',
    bio: "Aesthetic Athlete & Men's Physique Model 🔥"
  },
  {
    id: 'zarrar_khan',
    name: 'Zarrar Khan',
    handle: '@zarrar_khan',
    avatar: '/assets/models/zarrar_khan.jpg',
    bio: 'Elite Silent Aura & Fluffy Hair Looksmaxing ✦'
  }
];

const DEFAULT_LOOKSMAXING_CAPTIONS = [
  "Angles sharp, frame held. 🔱 #aesthetic #looksmaxing",
  "Defined by discipline, not circumstance. ⚡ #glowup #mindset",
  "Quiet rituals, undeniable results. 💎 #discipline #aesthetic",
  "Sharpening the silhouette every single day. ✦ #looksmaxing #grooming",
  "Aura speaks before words do. 🔱 #mindset #selfmastery",
  "Posture tall, focus locked in. ⚡ #aesthetic #discipline",
  "Symmetry in motion. 💎 #glowup #looksmaxing",
  "Subtle daily grind, permanent evolution. ✦ #discipline #grind",
  "Less noise, more presence. 🔱 #aesthetic #quietconfidence",
  "Built in silence, carried with confidence. ⚡ #looksmaxing #alpha",
  "Sharp jawline, clearer vision. 💎 #aesthetic #jawline",
  "Holding frame under pressure. ✦ #mindset #presence",
  "Elegance chiseled by routine. 🔱 #grooming #classic",
  "Day by day, elevating the standard. ⚡ #grind #glowup",
  "Confidence rooted in consistency. 💎 #looksmaxing #aesthetic",
  "Uncompromising standards in every detail. ✦ #aesthetic #discipline",
  "Form follows daily devotion. 🔱 #looksmaxing #selfmastery",
  "Aesthetic discipline is an art form. ⚡ #glowup #fitness",
  "Frame steady, energy calm. 💎 #mindset #aesthetic",
  "The standard is elevation. ✦ #looksmaxing #discipline"
];

export default function SecretModelVault({ onClose }: SecretModelVaultProps) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('selfx_vault_unlocked') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);

  // Custom AI Personas State (Editable Name, Handle, Avatar, Bio, and Custom Creation)
  const [customPersonas, setCustomPersonas] = useState<ModelPersona[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_custom_ai_personas_pakistani_v2') || localStorage.getItem('selfx_custom_ai_personas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOld = parsed.some(p => p.id === 'yourzfai' || p.id === 'sajid' || p.id === 'tahmid' || p.id === 'fahim' || p.id === 'abbas');
          if (!hasOld) return parsed;
        }
      }
    } catch (e) {}
    try {
      localStorage.setItem('selfx_custom_ai_personas_pakistani_v2', JSON.stringify(DEFAULT_PERSONAS));
      localStorage.setItem('selfx_custom_ai_personas', JSON.stringify(DEFAULT_PERSONAS));
    } catch (e) {}
    return DEFAULT_PERSONAS;
  });

  // Cross-device sync: fetch custom personas from server on mount
  useEffect(() => {
    fetch('/api/community/personas')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.personas) && data.personas.length > 0) {
          setCustomPersonas(prev => {
            const merged = [...prev];
            data.personas.forEach((serverP: any) => {
              if (serverP.id === 'yourzfai' || serverP.id === 'sajid' || serverP.id === 'tahmid' || serverP.id === 'fahim' || serverP.id === 'abbas') {
                return;
              }
              const idx = merged.findIndex(p => p.id === serverP.id || p.handle.toLowerCase() === serverP.handle.toLowerCase());
              if (idx !== -1) {
                merged[idx] = { ...merged[idx], ...serverP };
              } else {
                merged.push({ ...serverP, isCustom: true });
              }
            });
            try {
              localStorage.setItem('selfx_custom_ai_personas_pakistani_v2', JSON.stringify(merged));
              localStorage.setItem('selfx_custom_ai_personas', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
    return () => {};
  }, []);

  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');

  // State for creating a new custom ID/Persona
  const [isCreatingNewId, setIsCreatingNewId] = useState(false);
  const [newIdName, setNewIdName] = useState('');
  const [newIdHandle, setNewIdHandle] = useState('');
  const [newIdAvatar, setNewIdAvatar] = useState('');
  const [newIdBio, setNewIdBio] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('selfx_custom_ai_personas', JSON.stringify(customPersonas));
    } catch (e) {}
  }, [customPersonas]);

  const handleCreateNewPersona = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newIdName.trim();
    if (!cleanName) {
      triggerNotification("⚠️ নাম আবশ্যক", "অনুগ্রহ করে নতুন আইডির নাম লিখুন (যেমন: ফুটবল)");
      return;
    }

    const safeSlug = cleanName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `id_${Date.now()}`;
    const generatedId = `custom_${safeSlug}_${Date.now().toString(36)}`;
    
    let handle = newIdHandle.trim();
    if (!handle) {
      handle = `@${safeSlug}`;
    } else if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }

    // High quality aesthetic fallback avatars
    const fallbackAvatars = [
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80', // Sports/Football
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80', // Gym/Fitness
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', // Alpha Portrait
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', // Creator/Vlogger
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'  // Aesthetic Guy
    ];
    const avatar = newIdAvatar.trim() || fallbackAvatars[Math.floor(Math.random() * fallbackAvatars.length)];
    const bio = newIdBio.trim() || `${cleanName} - Premium Visuals & Daily Highlights 🎬🔥`;

    const newPersona: ModelPersona = {
      id: generatedId,
      name: cleanName,
      handle,
      avatar,
      bio,
      isCustom: true
    };

    const updated = [...customPersonas, newPersona];
    setCustomPersonas(updated);
    setSelectedPersona(generatedId);
    try {
      localStorage.setItem('selfx_custom_ai_personas', JSON.stringify(updated));
    } catch (e) {}
    // Sync to server so other phones can discover & search this persona ID immediately
    fetch('/api/community/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPersona)
    }).catch(err => console.warn("Notice: Persona server sync:", err));

    window.dispatchEvent(new CustomEvent('selfx_custom_personas_updated', { detail: updated }));

    setNewIdName('');
    setNewIdHandle('');
    setNewIdAvatar('');
    setNewIdBio('');
    setIsCreatingNewId(false);
    triggerNotification("🎉 নতুন আইডি তৈরি সম্পন্ন!", `'${cleanName}' আইডি যুক্ত হয়েছে। এখন এখান থেকে যে কোনো ভিডিও পোস্ট করতে পারেন!`);
  };

  const PRESET_CHANNELS = [
    {
      name: 'ফুটবল (Football Highlights)',
      handle: '@football_pro',
      avatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
      bio: '⚽ ডেইলি ফুটবল হাইলাইটস, গোলস ও স্কিল ভিডিওস'
    },
    {
      name: 'জিম ও ফিটনেস (Gym Beast)',
      handle: '@gym_beast',
      avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
      bio: '💪 হার্ডকোর ওয়ার্কআউট, ডায়েট ও বডিবিল্ডিং মোটিভেশন'
    },
    {
      name: 'লাইফস্টাইল ও ভ্লগ (Aesthetic Vlogs)',
      handle: '@lifestyle_vlogs',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: '🎬 দৈনিক লাইফস্টাইল, ট্রাভেল ও ড্রিপ স্টাইল ভ্লগস'
    },
    {
      name: 'গেমিং ক্লিপস (Gaming Clips)',
      handle: '@game_clips',
      avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
      bio: '🎮 এপিক গেমপ্লে মোমেন্টস, ক্লিপস ও স্ট্রিমিং'
    },
    {
      name: 'আলফা মাইন্ডসেট (Alpha Mindset)',
      handle: '@alpha_mindset',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: '🔥 সফলতা, ফোকাস ও ব্রাদারহুড মোটিভেশন'
    },
    {
      name: 'মার্শাল আর্ট (Combat Sports)',
      handle: '@combat_warrior',
      avatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
      bio: '🥋 বক্সিং, এমএমএ ও সেলফ-ডিফেন্স ক্লিপস'
    },
    {
      name: 'পডকাস্ট ও টকস (Deep Talks)',
      handle: '@deep_talks',
      avatar: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=80',
      bio: '🎙️ জীবন দর্শন, রিলেশনশিপ ও গভীর আলোচনা'
    }
  ];

  const handleQuickAddPreset = (preset: typeof PRESET_CHANNELS[0]) => {
    const exists = customPersonas.find(p => p.handle.toLowerCase() === preset.handle.toLowerCase());
    if (exists) {
      setSelectedPersona(exists.id);
      triggerNotification("📌 চ্যানেল নির্বাচিত", `'${exists.name}' আইডিটি সিলেক্ট করা হয়েছে।`);
      return;
    }

    const generatedId = `custom_${preset.handle.replace('@', '')}_${Date.now().toString(36)}`;
    const newPersona: ModelPersona = {
      id: generatedId,
      name: preset.name,
      handle: preset.handle,
      avatar: preset.avatar,
      bio: preset.bio,
      isCustom: true
    };

    const updated = [...customPersonas, newPersona];
    setCustomPersonas(updated);
    setSelectedPersona(generatedId);
    try {
      localStorage.setItem('selfx_custom_ai_personas', JSON.stringify(updated));
    } catch (e) {}
    // Sync to server so all devices have this persona
    fetch('/api/community/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPersona)
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent('selfx_custom_personas_updated', { detail: updated }));
    triggerNotification("🎉 নতুন আইডি যুক্ত হয়েছে!", `'${preset.name}' আইডি সফলভাবে তৈরি ও নির্বাচন করা হয়েছে।`);
  };

  const handleDeleteCustomPersona = (personaId: string, personaName: string) => {
    if (DEFAULT_PERSONAS.some(p => p.id === personaId)) {
      triggerNotification("⚠️ ডিফল্ট আইডি", "ডিফল্ট ৫টি আইডি ডিলিট করা যাবে না, তবে আপনি চাইলে তাদের তথ্য এডিট করতে পারেন।");
      return;
    }
    const updated = customPersonas.filter(p => p.id !== personaId);
    setCustomPersonas(updated);
    if (selectedPersona === personaId) {
      setSelectedPersona(updated[0]?.id || 'hamza_malik');
    }
    try {
      localStorage.setItem('selfx_custom_ai_personas', JSON.stringify(updated));
    } catch (e) {}
    // Delete on server
    fetch(`/api/community/personas/${personaId}`, { method: 'DELETE' }).catch(() => {});

    window.dispatchEvent(new CustomEvent('selfx_custom_personas_updated', { detail: updated }));
    triggerNotification("🗑️ আইডি ডিলিট হয়েছে", `'${personaName}' আইডিটি সফলভাবে সরিয়ে নেওয়া হয়েছে।`);
  };

  const [vaultPhotos, setVaultPhotos] = useState<VaultModelPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_vault_photos_backup_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly keep only real user posts; never keep auto-generated or seed posts
          return parsed.filter(p => p && p.id && p.id !== 'v-1' && p.id !== 'v-2' && !p.id.startsWith('vault-recovered-'));
        }
      }
    } catch (e) {}
    return [];
  });
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchVaultFromServer = async () => {
    try {
      const res = await fetch('/api/community/vault');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.vault)) {
        setVaultPhotos(prevLocal => {
          // Merge server items with any locally uploaded items not yet on server
          const map = new Map<string, VaultModelPhoto>();
          data.vault.forEach((item: VaultModelPhoto) => {
            if (item && item.id && item.id !== 'v-1' && item.id !== 'v-2' && !item.id.startsWith('vault-recovered-')) {
              map.set(item.id, item);
            }
          });
          prevLocal.forEach(item => {
            if (item && item.id && item.id !== 'v-1' && item.id !== 'v-2' && !item.id.startsWith('vault-recovered-') && !map.has(item.id)) {
              map.set(item.id, item);
              // Push local missing item to server in background
              fetch('/api/community/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              }).catch(() => {});
            }
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('selfx_vault_photos_backup_v2', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (err) {
      console.error("Failed to fetch vault photos from server:", err);
    }
  };

  useEffect(() => {
    fetchVaultFromServer();
    setHasLoaded(true);

    // Background sync every 30 seconds when window is active (never auto-generate posts)
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchVaultFromServer();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [selectedPersona, setSelectedPersona] = useState<string>('hamza_malik');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMediaType, setUploadedMediaType] = useState<'image' | 'video'>('image');
  const [captionInput, setCaptionInput] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const activePersona = customPersonas.find(p => p.id === selectedPersona) || customPersonas[0];

  const handleGenerateAiCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/community/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: uploadedMediaType,
          topic: 'looksmaxing',
          persona: activePersona?.name
        })
      });
      const data = await res.json();
      if (data && data.success && data.caption) {
        setCaptionInput(data.caption);
        triggerNotification("✨ AI Caption Ready", "লুকমাক্সিং ক্যাপশন সফলভাবে তৈরি হয়েছে!");
      } else {
        const randomCaption = DEFAULT_LOOKSMAXING_CAPTIONS[Math.floor(Math.random() * DEFAULT_LOOKSMAXING_CAPTIONS.length)];
        setCaptionInput(randomCaption);
      }
    } catch (e) {
      const randomCaption = DEFAULT_LOOKSMAXING_CAPTIONS[Math.floor(Math.random() * DEFAULT_LOOKSMAXING_CAPTIONS.length)];
      setCaptionInput(randomCaption);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim().toLowerCase();
    if (cleanPass === 'model10' || cleanPass === '1234') {
      setIsUnlocked(true);
      localStorage.setItem('selfx_vault_unlocked', 'true');
      setPassError(false);
      triggerNotification("🔓 Access Granted", "Welcome! Accessing Model 🔒 Vault.");
    } else {
      setPassError(true);
      triggerNotification("❌ Access Denied", "ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।");
    }
  };

  const selectedFileRef = React.useRef<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      selectedFileRef.current = file;
      const isVideo = file.type.startsWith('video/');
      setUploadedMediaType(isVideo ? 'video' : 'image');
      setIsFileLoading(true);

      // Instant 0ms local preview using object URL
      try {
        const objUrl = URL.createObjectURL(file);
        setFilePreviewUrl(objUrl);
      } catch (err) {}

      // Auto-populate with elegant, medium-long looksmaxing caption with tasteful emojis if caption is empty
      if (!captionInput.trim()) {
        const randomCaption = DEFAULT_LOOKSMAXING_CAPTIONS[Math.floor(Math.random() * DEFAULT_LOOKSMAXING_CAPTIONS.length)];
        setCaptionInput(randomCaption);
      }

      // Fast background reader for storage payload
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setIsFileLoading(false);
      };
      reader.onerror = () => {
        setIsFileLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = async (autoPost: boolean = true) => {
    let finalMedia = imageBase64;
    if (!finalMedia && filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      finalMedia = await convertBlobUrlToDataUrl(filePreviewUrl);
    }
    if (!finalMedia && !selectedFileRef.current) {
      finalMedia = imageUrlInput.trim();
    }
    if (!finalMedia && !selectedFileRef.current) {
      triggerNotification("⚠️ Media Required", "ভিডিও বা ফটোর ফাইল অথবা লিংক দিন।");
      return;
    }

    setIsPublishing(true);
    setUploadProgress(20);

    const isVideo = uploadedMediaType === 'video' || 
                    (selectedFileRef.current && selectedFileRef.current.type.startsWith('video/')) ||
                    finalMedia.startsWith('data:video/') || 
                    /\.(mp4|webm|ogg|mov)($|\?)/i.test(finalMedia);

    // AI looksmaxing caption generation if caption is empty
    let finalCaption = captionInput.trim();
    if (!finalCaption) {
      try {
        const capRes = await fetch('/api/community/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaType: isVideo ? 'video' : 'image',
            topic: 'looksmaxing',
            persona: activePersona?.name
          })
        });
        const capData = await capRes.json();
        if (capData && capData.success && capData.caption) {
          finalCaption = capData.caption;
        }
      } catch (err) {
        console.warn("AI caption auto-generate failed:", err);
      }

      if (!finalCaption) {
        finalCaption = DEFAULT_LOOKSMAXING_CAPTIONS[Math.floor(Math.random() * DEFAULT_LOOKSMAXING_CAPTIONS.length)];
      }
    }

    const isUpload = Boolean(selectedFileRef.current) || (!finalMedia.startsWith('http://') && !finalMedia.startsWith('https://'));
    const mediaId = isUpload ? 'vault-media-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6) : finalMedia;

    let serverUploadedUrl = '';
    if (isUpload) {
      setUploadProgress(40);
      // Fast direct MP4 upload to server to preserve 100% video and audio without quality loss
      if (isVideo) {
        try {
          if (selectedFileRef.current) {
            const binRes = await fetch('/api/community/video/upload-binary', {
              method: 'POST',
              headers: {
                'x-media-id': mediaId,
                'Content-Type': selectedFileRef.current.type || 'video/mp4'
              },
              body: selectedFileRef.current
            });
            const binData = await binRes.json();
            if (binData && binData.url) {
              serverUploadedUrl = binData.url;
            }
          }
          if (!serverUploadedUrl && finalMedia) {
            const vRes = await fetch('/api/community/video/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: mediaId, dataUrl: finalMedia })
            });
            const vData = await vRes.json();
            if (vData && vData.url) {
              serverUploadedUrl = vData.url;
            }
          }
        } catch (vErr) {
          console.warn("Direct video upload notice:", vErr);
        }
      }
      setUploadProgress(65);
      // Save into memory cache and IndexedDB under both mediaId and serverUploadedUrl
      if (finalMedia) {
        await saveMediaItem(mediaId, finalMedia);
        if (serverUploadedUrl) {
          await saveMediaItem(serverUploadedUrl, finalMedia);
        }
      }
      setUploadProgress(80);
    }
    selectedFileRef.current = null;

    const personaMeta = customPersonas.find(p => p.id === selectedPersona) || customPersonas[0];
    const finalMediaReference = serverUploadedUrl || mediaId;

    const newPhoto: VaultModelPhoto = {
      id: 'vault-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      persona: selectedPersona,
      author: personaMeta.name,
      avatar: personaMeta.avatar,
      numberId: personaMeta.handle.replace(/^@/, ''),
      image: finalMediaReference,
      mediaType: isVideo ? 'video' : 'image',
      caption: finalCaption,
      createdAt: new Date().toISOString(),
      postedToGrowgram: true
    };

    // Instant local state update
    setVaultPhotos(prev => {
      const next = [newPhoto, ...prev.filter(p => p.id !== newPhoto.id)];
      try {
        localStorage.setItem('selfx_vault_photos_backup_v2', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setUploadProgress(90);

    // Save metadata to server in background with exact creator credentials
    fetch('/api/community/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newPhoto.id,
        persona: selectedPersona,
        author: personaMeta.name,
        avatar: personaMeta.avatar,
        numberId: personaMeta.handle.replace(/^@/, ''),
        image: finalMediaReference,
        video: isVideo ? finalMediaReference : undefined,
        mediaType: isVideo ? 'video' : 'image',
        caption: newPhoto.caption,
        createdAt: newPhoto.createdAt,
        postedToGrowgram: true
      })
    }).catch(err => console.warn("Vault metadata sync notice:", err));

    // Post to GrowGram timeline
    await handlePostNowToGrowgram(newPhoto);

    setUploadProgress(100);
    setTimeout(() => {
      setIsPublishing(false);
      setUploadProgress(0);
      setImageUrlInput('');
      setImageBase64('');
      setFilePreviewUrl('');
      setCaptionInput('');
      setUploadedMediaType('image');
    }, 300);

    triggerNotification("📸 Media Published", isVideo ? "ভিডিওটি দ্রুত ও সফলভাবে পোস্ট করা হয়েছে!" : "ছবি দ্রুত সফলভাবে পোস্ট করা হয়েছে!");
  };

  const handleDeletePhoto = async (id: string) => {
    setVaultPhotos(prev => {
      const next = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('selfx_vault_photos_backup_v2', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // Also remove from local cached community posts if present
    try {
      const deletedPosts = JSON.parse(localStorage.getItem('selfx_deleted_posts') || '[]');
      if (!deletedPosts.includes(id)) {
        deletedPosts.push(id);
        localStorage.setItem('selfx_deleted_posts', JSON.stringify(deletedPosts));
      }
      const cachedStr = localStorage.getItem('selfx_all_cached_posts') || localStorage.getItem('glowgram_posts');
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        const updatedCached = cached.filter((p: any) => p.id !== id);
        localStorage.setItem('selfx_all_cached_posts', JSON.stringify(updatedCached));
        localStorage.setItem('glowgram_posts', JSON.stringify(updatedCached));
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/community/vault/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const d = await res.json();
      if (d && d.success) {
        triggerNotification("🗑️ Media Deleted", "Removed from vault and timeline.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostNowToGrowgram = async (photo: VaultModelPhoto) => {
    const personaMeta = customPersonas.find(p => p.id === photo.persona) || (photo.author ? {
      name: photo.author,
      avatar: photo.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      handle: photo.numberId ? `@${photo.numberId.replace(/^@/, '')}` : '@creator'
    } : DEFAULT_PERSONAS.find(p => p.id === photo.persona) || customPersonas[0]);
    const isVid = photo.mediaType === 'video' || (typeof photo.image === 'string' && (photo.image.startsWith('data:video/') || photo.image.startsWith('vault-media-') || photo.image.includes('.mp4') || photo.image.includes('/media/')));
    const authorName = (photo.author || personaMeta?.name || '').trim() || 'Creator';
    const isLeadUser = authorName.includes('Atif') || photo.persona === 'atif' || photo.persona === 'itsatifbro' || photo.persona === 'my_account';
    
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: photo.id,
          author: authorName,
          avatarUrlOrBase64: photo.avatar || personaMeta?.avatar,
          numberId: photo.numberId || personaMeta?.handle.replace(/^@/, ''),
          content: photo.caption,
          image: isVid ? '' : photo.image,
          video: isVid ? photo.image : '',
          isLead: isLeadUser,
          createdAt: photo.createdAt || new Date().toISOString()
        })
      });
      const d = await res.json();
      if (d && d.success) {
        setVaultPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, postedToGrowgram: true } : p));
        window.dispatchEvent(new CustomEvent('selfx_custom_personas_updated'));
      }
    } catch (err: any) {
      console.warn("GrowGram timeline sync:", err);
    }
  };

  return (
    <div className="bg-zinc-950 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden text-left">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
              🔒 SECRET LEADER SECTION
            </span>
            <h3 className="text-base font-black font-display text-zinc-100 tracking-wide">
              Model 🔒 (মডেল সিক্রেট ভল্ট)
            </h3>
          </div>
        </div>
        {isUnlocked && (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            UNLOCKED
          </span>
        )}
      </div>

      {/* LOCKED PASSCODE FORM */}
      {!isUnlocked ? (
        <form onSubmit={handleUnlock} className="space-y-4 max-w-sm mx-auto text-center py-6">
          <div className="p-4 bg-zinc-900/80 border border-zinc-850 rounded-2xl space-y-2">
            <Lock className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-sm font-black text-zinc-100 uppercase tracking-wider">
              পাসওয়ার্ড দিয়ে প্রবেশ করুন
            </h4>
            <p className="text-xs text-zinc-400 font-sans">
              এই অপশনটি শুধুমাত্র অ্যাপের লিডারের গোপন ব্যবহার এবং মডেল ফটোজ আপলোডের জন্য সুরক্ষিত।
            </p>
          </div>

          <div className="space-y-2">
            <input 
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন..."
              className={`w-full bg-black border ${passError ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-3 text-sm text-center text-zinc-100 font-mono tracking-widest focus:outline-none focus:border-amber-500`}
            />
            {passError && (
              <p className="text-xs text-red-400 font-bold">ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-zinc-950 text-xs font-black uppercase rounded-xl cursor-pointer transition-all shadow-lg active:scale-95"
          >
            🔓 ভল্ট আনলক করুন (Unlock Vault)
          </button>
        </form>
      ) : (
        /* UNLOCKED VAULT CONTENT */
        <div className="space-y-6">
          <p className="text-xs text-zinc-300 font-medium leading-relaxed">
            এখানে ৫টি বিল্ট-ইন AI একাউন্টের তথ্য (<strong className="text-amber-400">নাম, ইউজারনেম, প্রোফাইল পিকচার, বায়ো</strong>) এডিট করতে পারবেন। এছাড়া ছবি আপলোড করলেই তা অটোমেটিক সুন্দর ক্যাপশনসহ গ্রো গ্রামে পোস্ট হয়ে যাবে!
          </p>

          {/* EDIT PERSONA MODAL / ACCORDION */}
          {editingPersonaId && (
            <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  ✏️ প্রোফাইল তথ্য এডিট করুন
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingPersonaId(null)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 block mb-1">প্রোফাইল নাম (Name):</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 block mb-1">ইউজারনেম (Username/Handle):</label>
                  <input
                    type="text"
                    value={editHandle}
                    onChange={(e) => setEditHandle(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-mono text-zinc-400 block mb-1">প্রোফাইল পিকচার (Avatar Image URL or Base64):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setEditAvatar(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-mono text-zinc-400 block mb-1">বায়ো / ডেসক্রিপশন (Bio):</label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const updated = customPersonas.map(p => {
                      if (p.id === editingPersonaId) {
                        return { ...p, name: editName, handle: editHandle, avatar: editAvatar, bio: editBio };
                      }
                      return p;
                    });
                    setCustomPersonas(updated);
                    try {
                      localStorage.setItem('selfx_custom_ai_personas', JSON.stringify(updated));
                    } catch (e) {}

                    const targetP = updated.find(p => p.id === editingPersonaId);
                    if (targetP) {
                      fetch('/api/community/personas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(targetP)
                      }).catch(() => {});
                    }

                    window.dispatchEvent(new CustomEvent('selfx_custom_personas_updated', { detail: updated }));
                    setEditingPersonaId(null);
                    triggerNotification("✅ Profile Updated", "AI Account information updated successfully!");
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  সেভ করুন (Save Profile)
                </button>
              </div>
            </div>
          )}

          {/* AI PERSONAS SELECTION & CUSTOM CREATION CARDS */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-2">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block font-bold">
                  ১. আপলোড অ্যাকাউন্ট / চ্যানেল নির্বাচন করুন ({customPersonas.length}টি আইডি রয়েছে):
                </label>
                <span className="text-[10px] text-zinc-400">যে আইডিতে ক্লিক করবেন, ভিডিও বা ফটো সেই আইডির নামে গ্রো-গ্রামে পোস্ট হবে।</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNewId(prev => !prev)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন আইডি তৈরি করুন (Create ID)</span>
              </button>
            </div>

            {/* 1-CLICK PRESET CHANNELS QUICK SELECT / ADD */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  ⚡ কুইক ১-ক্লিক চ্যানেল যোগ করুন (যেমন ফুটবল, জিম, ভ্লগ — ইচ্ছামতো ৫-৭টি আইডি করতে পারেন):
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">ট্যাপ করলেই আইডি তৈরি ও সিলেক্ট হবে</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_CHANNELS.map((preset, idx) => {
                  const alreadyAdded = customPersonas.some(p => p.handle.toLowerCase() === preset.handle.toLowerCase());
                  const isSelected = selectedPersona === customPersonas.find(p => p.handle.toLowerCase() === preset.handle.toLowerCase())?.id;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickAddPreset(preset)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md font-black'
                          : alreadyAdded
                          ? 'bg-zinc-850 hover:bg-zinc-800 text-amber-300 border-amber-500/30'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                      }`}
                    >
                      <span>{preset.name.split(' ')[0]}</span>
                      <span>{preset.name.split(' ').slice(1).join(' ')}</span>
                      {alreadyAdded && <span className="text-[9px] text-emerald-400 font-mono">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CREATE NEW CUSTOM ID FORM */}
            {isCreatingNewId && (
              <form onSubmit={handleCreateNewPersona} className="bg-zinc-900/90 border-2 border-amber-500/50 p-4 sm:p-5 rounded-2xl space-y-4 animate-fadeIn shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      ✨ নতুন আইডি তৈরি করুন (যেমন: ফুটবল, ফিটনেস, লাইফস্টাইল)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewId(false)}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    ✕ বন্ধ করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-300 block mb-1 font-bold">
                      আইডির নাম (Name) <span className="text-amber-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={newIdName}
                      onChange={(e) => {
                        setNewIdName(e.target.value);
                        if (!newIdHandle) {
                          const slug = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                          if (slug) setNewIdHandle(`@${slug}`);
                        }
                      }}
                      placeholder="যেমন: ফুটবল / Football Mania / Gym Beast"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-300 block mb-1 font-bold">
                      হ্যান্ডেল / ইউজারনেম (Handle):
                    </label>
                    <input
                      type="text"
                      value={newIdHandle}
                      onChange={(e) => setNewIdHandle(e.target.value)}
                      placeholder="@football_hub"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-zinc-300 block mb-1 font-bold">
                      প্রোফাইল ছবি (Avatar):
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newIdAvatar}
                          onChange={(e) => setNewIdAvatar(e.target.value)}
                          placeholder="ইমেজ লিংক দিন অথবা ফাইল আপলোড করুন..."
                          className="flex-1 bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                        />
                        <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const r = new FileReader();
                                r.onloadend = () => setNewIdAvatar(r.result as string);
                                r.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Quick Avatar Suggestions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[9px] text-zinc-500 font-mono">আইকন সাজেশনস:</span>
                        {[
                          { label: '⚽ ফুটবল', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80' },
                          { label: '💪 জিম/ফিটনেস', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80' },
                          { label: '🔥 আলফা স্টাইল', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                          { label: '🎬 ভ্লগ/লাইফস্টাইল', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' }
                        ].map((sugg, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewIdAvatar(sugg.url)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              newIdAvatar === sugg.url ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                            }`}
                          >
                            {sugg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-zinc-300 block mb-1 font-bold">
                      বায়ো বা ক্যাটাগরি ডেসক্রিপশন (Bio):
                    </label>
                    <input
                      type="text"
                      value={newIdBio}
                      onChange={(e) => setNewIdBio(e.target.value)}
                      placeholder="যেমন: Daily Football Highlights & Reels ⚽🔥"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewId(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-zinc-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>আইডি সেভ করুন (Save New ID)</span>
                  </button>
                </div>
              </form>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {customPersonas.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex items-center justify-between ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30' 
                        : 'bg-zinc-900/60 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div 
                      onClick={() => setSelectedPersona(p.id)}
                      className="flex items-center gap-3 flex-1 overflow-hidden"
                    >
                      <div className="relative shrink-0">
                        <img src={p.avatar} alt={p.name} className="w-11 h-11 rounded-full object-cover border border-amber-500/40" />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 p-0.5 rounded-full ring-2 ring-zinc-950">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 overflow-hidden flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-100 truncate block">{p.name}</span>
                          {p.isCustom && (
                            <span className="text-[8px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded font-bold shrink-0">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono block truncate">{p.handle}</span>
                        <span className="text-[9px] text-zinc-400 block truncate">{p.bio}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPersonaId(p.id);
                          setEditName(p.name);
                          setEditHandle(p.handle);
                          setEditAvatar(p.avatar);
                          setEditBio(p.bio);
                        }}
                        className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-amber-400 rounded-lg transition-colors cursor-pointer"
                        title="Edit Account Info"
                      >
                        ✏️
                      </button>
                      {p.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`আপনি কি নিশ্চিত যে '${p.name}' আইডিটি ডিলিট করতে চান?`)) {
                              handleDeleteCustomPersona(p.id, p.name);
                            }
                          }}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Custom ID"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADD NEW MODEL PHOTO / VIDEO FORM */}
          <div className="bg-zinc-900/80 border border-zinc-850 p-4.5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black font-display text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4" />
                ২. ভিডিও বা ফটো আপলোড ও অটো-পোস্ট (Upload Video/Photo & Post)
              </h4>
              <span className="text-[10px] text-zinc-400 font-mono">ভিডিও ও ফটো দুইটাই সাপোর্টেড</span>
            </div>

            {/* Currently Active Posting Persona Banner */}
            {activePersona && (
              <div className="p-3 bg-zinc-950/80 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img src={activePersona.avatar} alt={activePersona.name} className="w-9 h-9 rounded-full object-cover border border-amber-500/40 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-300 truncate">{activePersona.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">{activePersona.handle}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">
                      ভিডিও বা ফটো আপলোড করলে সরাসরি এই <b>'{activePersona.name}'</b> চ্যানেলের নামে পোস্ট হবে।
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                  একটিভ পোস্টিং চ্যানেল
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono text-zinc-400 block mb-1">ভিডিও বা ছবির লিংক (Media URL):</label>
                <input 
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    if (e.target.value) setImageBase64('');
                  }}
                  placeholder="https://... (mp4, webm অথবা image URL)"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-zinc-500 font-mono">অথবা ফাইল আপলোড:</span>
                <label className="px-3.5 py-2 bg-gradient-to-r from-zinc-800 to-zinc-750 hover:from-zinc-700 hover:to-zinc-650 text-zinc-100 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2 border border-zinc-700 shadow-sm">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>ভিডিও বা ছবি সিলেক্ট করুন (Choose Video/Image)</span>
                  <input type="file" accept="video/*,image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                {isFileLoading && (
                  <span className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    মিডিয়া অপ্টিমাইজ হচ্ছে...
                  </span>
                )}
                {!isFileLoading && (filePreviewUrl || imageBase64) && (
                  <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    ✓ {uploadedMediaType === 'video' ? 'ভিডিও ফাইল প্রস্তুত 🎬 (তাত্ক্ষণিক প্রিভিউ)' : 'ফটো লোড হয়েছে 📸'}
                  </span>
                )}
              </div>

              {/* LIVE MEDIA PREVIEW */}
              {(filePreviewUrl || imageBase64 || imageUrlInput) && (
                <div className="p-2 bg-black/60 border border-zinc-800 rounded-xl overflow-hidden max-h-64 flex flex-col items-center justify-center relative shadow-inner">
                  {uploadedMediaType === 'video' || (filePreviewUrl || imageBase64 || imageUrlInput).startsWith('data:video') || (filePreviewUrl || imageBase64 || imageUrlInput).startsWith('blob:') || /\.(mp4|webm|ogg|mov)($|\?)/i.test(filePreviewUrl || imageBase64 || imageUrlInput) ? (
                    <video 
                      src={filePreviewUrl || imageBase64 || imageUrlInput} 
                      controls 
                      className="max-h-60 w-full rounded-lg object-contain bg-black" 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                    />
                  ) : (
                    <img 
                      src={filePreviewUrl || imageBase64 || imageUrlInput} 
                      alt="Media Preview" 
                      className="max-h-60 w-full rounded-lg object-contain" 
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setImageBase64('');
                      setFilePreviewUrl('');
                      setImageUrlInput('');
                    }}
                    className="absolute top-3 right-3 px-2 py-1 bg-black/80 hover:bg-black text-zinc-400 hover:text-white rounded-lg text-xs font-mono border border-zinc-700 cursor-pointer"
                    title="রিমুভ করুন"
                  >
                    ✕ রিমুভ
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-mono text-zinc-400">
                    ক্যাপশন (খালি রাখলে অটোমেটিক সুন্দর ইংলিশ লুকমাক্সিং ক্যাপশন আসবে):
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiCaption}
                    disabled={isGeneratingCaption}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isGeneratingCaption ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    )}
                    <span>AI ইংলিশ ক্যাপশন তৈরি করুন</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <input 
                    type="text"
                    value={captionInput}
                    onChange={(e) => setCaptionInput(e.target.value)}
                    placeholder="ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে ছোট আকর্ষণীয় English Looksmaxing ক্যাপশন যুক্ত হবে ✨"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Upload Progress Bar if publishing */}
              {isPublishing && (
                <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ভিডিও আল্ট্রা-ফাস্ট প্রসেস ও আপলোড হচ্ছে...
                    </span>
                    <span className="text-zinc-300 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-850 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isPublishing || isFileLoading}
                onClick={() => handleAddPhoto(true)}
                className={`w-full py-3 text-zinc-950 font-black text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                  isPublishing || isFileLoading
                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 cursor-pointer active:scale-95'
                }`}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                    <span>পোস্ট হচ্ছে ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      🚀 '{activePersona?.name || 'নির্বাচিত'}' চ্যানেল থেকে পোস্ট করুন (Post to Feed)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* VAULT GALLERY LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h4 className="text-xs font-black uppercase text-zinc-300 font-mono">
                📸 সংরক্ষিত মডেল ফটো গ্যালারি ({vaultPhotos.length})
              </h4>
            </div>

            {vaultPhotos.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-900/30 border border-zinc-850 rounded-2xl">
                ভল্টে এখনও কোনো মডেল ফটো যোগ করা হয়নি। উপরে নতুন ছবি যোগ করুন!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vaultPhotos.map((photo) => {
                  const personaMeta = customPersonas.find(p => p.id === photo.persona) || DEFAULT_PERSONAS.find(p => p.id === photo.persona) || (photo.author ? {
                    name: photo.author,
                    handle: photo.numberId ? `@${photo.numberId.replace(/^@/, '')}` : '@creator',
                    avatar: photo.avatar || ''
                  } : customPersonas[0]);
                  return (
                    <div key={photo.id} className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-2xl space-y-3 relative group">
                      <div className="relative h-44 rounded-xl overflow-hidden bg-black">
                        <VaultMediaRenderer imageSrc={photo.image} mediaType={photo.mediaType} />
                        <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                          {photo.author || personaMeta?.name || 'Creator'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-900 text-zinc-400 hover:text-white rounded-lg border border-white/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-200 font-medium line-clamp-2">
                        {photo.caption}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-850">
                        {photo.postedToGrowgram ? (
                          <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Posted in GrowGram
                          </span>
                        ) : (
                          <span className="text-[9px] text-zinc-500 font-mono">Ready to post</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handlePostNowToGrowgram(photo)}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>এখনই গ্রো গ্রামে পোস্ট করো</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
