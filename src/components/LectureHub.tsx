import React, { useState, useEffect, useRef } from 'react';
import {
  Play, CheckCircle, CheckCircle2, Plus,
  Search, X, Award, Bookmark,
  RefreshCw, ChevronRight, Link2, SlidersHorizontal,
  Maximize2, Minimize2, Tv, Sparkles
} from 'lucide-react';
import { triggerNotification } from '../utils';
import { acquireBgMusicPauseLock, releaseBgMusicPauseLock } from '../utils/remixAudioEngine';

export type LectureCategory =
  | 'All'
  | 'Watchlist'
  | 'Chadtag'
  | 'Psychology & Mind'
  | 'Self Improvement'
  | 'Social & Communication'
  | 'Fashion & Grooming'
  | 'Goals & Mindset';

export interface LectureVideo {
  id: string;
  youtubeId: string;
  title: string;
  banglaTitle: string;
  presenter: string;
  duration: string;
  views?: string;
  published?: string;
  category?: string;
  watched: boolean;
  xpValue: number;
}

// Preseeded fallback lectures (Chadtag, Psychology, Self Improvement, Social Skills, Fashion in Hindi)
const PRESEEDED_LECTURES: LectureVideo[] = [
  {
    id: 'lec_hindi_chadtag_1',
    youtubeId: '3tX9UfCstks',
    title: 'Complete Glow Up & Looksmaxing Guide (Hindi)',
    banglaTitle: 'Complete Glow Up & Looksmaxing Guide (Hindi)',
    presenter: 'Chadtag',
    duration: '12:40',
    views: '420K views',
    published: 'Featured',
    category: 'Chadtag',
    watched: false,
    xpValue: 25
  },
  {
    id: 'lec_hindi_psych_1',
    youtubeId: '9QiE-M1LrZ4',
    title: 'Dopamine Detox & Human Mind Control (Hindi)',
    banglaTitle: 'Dopamine Detox & Human Mind Control (Hindi)',
    presenter: 'Self Improvement Hindi',
    duration: '11:15',
    views: '680K views',
    published: 'Popular',
    category: 'Psychology & Mind',
    watched: false,
    xpValue: 20
  },
  {
    id: 'lec_hindi_social_1',
    youtubeId: 'RQC_PEPum60',
    title: 'Master Communication Skills, Body Language & Confidence (Hindi)',
    banglaTitle: 'Master Communication Skills, Body Language & Confidence (Hindi)',
    presenter: 'Mindset & Social Skills',
    duration: '14:20',
    views: '510K views',
    published: 'Popular',
    category: 'Social & Communication',
    watched: false,
    xpValue: 20
  },
  {
    id: 'lec_hindi_fashion_1',
    youtubeId: 'D-3g21z3CNo',
    title: 'Men Fashion, Grooming & Dressing Sense Guide (Hindi)',
    banglaTitle: 'Men Fashion, Grooming & Dressing Sense Guide (Hindi)',
    presenter: 'Chadtag & Style',
    duration: '10:50',
    views: '390K views',
    published: 'Featured',
    category: 'Fashion & Grooming',
    watched: false,
    xpValue: 20
  }
];

interface LectureHubProps {
  onEarnPoints: (points: number, reason: string) => void;
}

export default function LectureHub({ onEarnPoints }: LectureHubProps) {
  useEffect(() => {
    acquireBgMusicPauseLock('component:lecture_hub');
    return () => releaseBgMusicPauseLock('component:lecture_hub');
  }, []);
  const [customLectures, setCustomLectures] = useState<LectureVideo[]>(() => {
    try {
      const saved = localStorage.getItem('lookmax_lectures_v3_custom');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [watchedMap, setWatchedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('lookmax_lectures_watched_v3');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [watchlistLectures, setWatchlistLectures] = useState<LectureVideo[]>(() => {
    try {
      const saved = localStorage.getItem('lookmax_lectures_watchlist_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<LectureCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveHindiResults, setLiveHindiResults] = useState<LectureVideo[]>([]);
  const [chadtagFeatured, setChadtagFeatured] = useState<LectureVideo[]>([]);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState<boolean>(false);
  const [activeLecture, setActiveLecture] = useState<LectureVideo | null>(null);
  const [isExpandedCinema, setIsExpandedCinema] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Chadtag');
  const [isImportingVideo, setIsImportingVideo] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('lookmax_lectures_v3_custom', JSON.stringify(customLectures));
    } catch {}
  }, [customLectures]);

  useEffect(() => {
    try {
      localStorage.setItem('lookmax_lectures_watched_v3', JSON.stringify(watchedMap));
    } catch {}
  }, [watchedMap]);

  useEffect(() => {
    try {
      localStorage.setItem('lookmax_lectures_watchlist_v1', JSON.stringify(watchlistLectures));
    } catch {}
  }, [watchlistLectures]);

  // Smooth scroll to player when user clicks any video
  useEffect(() => {
    if (activeLecture && playerCardRef.current) {
      playerCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLecture]);

  // Load any shared server custom lectures
  useEffect(() => {
    fetch('/api/lectures')
      .then((r) => r.json())
      .then((serverCustomLectures) => {
        if (Array.isArray(serverCustomLectures) && serverCustomLectures.length > 0) {
          setCustomLectures((prev) => {
            const existingIds = new Set(prev.map((p) => p.youtubeId));
            const merged = [...prev];
            serverCustomLectures.forEach((s: any) => {
              if (s && s.youtubeId && !existingIds.has(s.youtubeId)) {
                merged.push({
                  id: s.id || `lec_${s.youtubeId}`,
                  youtubeId: s.youtubeId,
                  title: s.title || s.banglaTitle || 'Self Improvement Lecture',
                  banglaTitle: s.banglaTitle || s.title || 'Self Improvement Lecture',
                  presenter: s.presenter || 'YouTube Creator',
                  duration: s.duration || '12:00',
                  views: 'Featured',
                  published: 'Saved',
                  category: s.category || 'Self Improvement',
                  watched: false,
                  xpValue: s.xpValue || 20
                });
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Always fetch real Chadtag videos on mount so Chadtag videos are guaranteed in the feed
  useEffect(() => {
    fetch('/api/lectures/youtube-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'chadtag looksmaxing grooming self improvement hindi',
        category: 'Chadtag'
      })
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.videos) && data.videos.length > 0) {
          setChadtagFeatured(
            data.videos.slice(0, 6).map((v: any) => ({
              ...v,
              category: 'Chadtag'
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Live YouTube Hindi search for Psychology, Human Mind, Self Improvement, Social/Communication, Fashion, Goals & Chadtag
  useEffect(() => {
    if (selectedCategory === 'Watchlist') {
      setIsSearchingYouTube(false);
      return;
    }

    const trimmed = searchQuery.trim();
    const timer = setTimeout(async () => {
      setIsSearchingYouTube(true);
      try {
        const res = await fetch('/api/lectures/youtube-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            category: selectedCategory
          })
        });
        const data = await res.json();
        if (Array.isArray(data?.videos) && data.videos.length > 0) {
          setLiveHindiResults(data.videos);
        }
      } catch {
        // Keep existing results
      } finally {
        setIsSearchingYouTube(false);
      }
    }, trimmed ? 350 : 60);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Combine Chadtag + Live Hindi YouTube results + Custom Lectures
  const displayedLectures: LectureVideo[] = React.useMemo(() => {
    if (selectedCategory === 'Watchlist') {
      const q = searchQuery.trim().toLowerCase();
      const list = watchlistLectures.map((l) => ({
        ...l,
        watched: !!watchedMap[l.youtubeId]
      }));
      if (!q) return list;
      return list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.presenter.toLowerCase().includes(q)
      );
    }

    const combined: LectureVideo[] = [];
    const seenIds = new Set<string>();

    const pushUnique = (item: LectureVideo) => {
      if (!item || !item.youtubeId || seenIds.has(item.youtubeId)) return;
      // Remove watched videos from main interface so a new video takes its place!
      if (watchedMap[item.youtubeId]) return;
      seenIds.add(item.youtubeId);
      combined.push({
        ...item,
        watched: false
      });
    };

    if (searchQuery.trim()) {
      liveHindiResults.forEach(pushUnique);
      customLectures
        .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .forEach(pushUnique);
      return combined;
    }

    if (selectedCategory === 'All') {
      customLectures.forEach(pushUnique);
      chadtagFeatured.slice(0, 4).forEach(pushUnique);
      liveHindiResults.forEach(pushUnique);
      PRESEEDED_LECTURES.forEach(pushUnique);
      return combined;
    }

    if (selectedCategory === 'Chadtag') {
      chadtagFeatured.forEach(pushUnique);
      liveHindiResults.forEach(pushUnique);
      return combined;
    }

    liveHindiResults.forEach(pushUnique);
    customLectures
      .filter((c) => c.category === selectedCategory)
      .forEach(pushUnique);
    return combined.length > 0 ? combined : PRESEEDED_LECTURES;
  }, [
    selectedCategory,
    searchQuery,
    watchlistLectures,
    watchedMap,
    liveHindiResults,
    chadtagFeatured,
    customLectures
  ]);

  const toggleWatchlist = (lec: LectureVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlistLectures((prev) => {
      const exists = prev.some((v) => v.youtubeId === lec.youtubeId);
      if (exists) {
        triggerNotification("Removed from Watchlist", `"${lec.title}" removed from Fav / Watchlist.`);
        return prev.filter((v) => v.youtubeId !== lec.youtubeId);
      } else {
        triggerNotification("⭐ Added to Watchlist", `"${lec.title}" saved to Fav / Watchlist.`);
        return [lec, ...prev];
      }
    });
  };

  const handleMarkAsWatched = (lec: LectureVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!watchedMap[lec.youtubeId]) {
      setWatchedMap((prev) => ({ ...prev, [lec.youtubeId]: true }));
      onEarnPoints(lec.xpValue || 20, `Lecture Completed: ${lec.title}`);
      triggerNotification("🏆 ভিডিও দেখা সম্পন্ন!", `সাবাশ! +${lec.xpValue || 20} XP অর্জিত হয়েছে এবং নতুন ভিডিও যুক্ত হয়েছে!`);
      if (activeLecture?.youtubeId === lec.youtubeId) {
        setActiveLecture(null);
        setIsExpandedCinema(false);
      }
      // Fetch extra replacement videos if list gets short
      if (displayedLectures.length <= 5) {
        fetch('/api/lectures/youtube-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'self improvement psychology communication skills chadtag in hindi',
            category: selectedCategory
          })
        })
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data?.videos) && data.videos.length > 0) {
              setLiveHindiResults((prev) => {
                const seen = new Set(prev.map((p) => p.youtubeId));
                return [...prev, ...data.videos.filter((v: LectureVideo) => !seen.has(v.youtubeId))];
              });
            }
          })
          .catch(() => {});
      }
    }
  };

  const getYoutubeId = (url: string): string => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    return match ? match[1] : url.trim().length === 11 ? url.trim() : '';
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = getYoutubeId(newUrl);
    if (!ytId) {
      triggerNotification("⚠️ সঠিক লিংক দিন", "সঠিক YouTube ভিডিও লিংক পেস্ট করুন!");
      return;
    }

    setIsImportingVideo(true);
    let realTitle = 'Hindi Self-Improvement Lecture';
    let realAuthor = 'YouTube Creator';

    try {
      const res = await fetch('/api/career/youtube-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${ytId}` })
      });
      const data = await res.json();
      if (data?.title) realTitle = data.title;
      if (data?.author) realAuthor = data.author;
    } catch {}

    const newLec: LectureVideo = {
      id: `lec_${ytId}_${Date.now()}`,
      youtubeId: ytId,
      title: realTitle,
      banglaTitle: realTitle,
      presenter: realAuthor,
      duration: 'Video',
      views: 'Saved',
      published: 'Just now',
      category: newCategory,
      watched: false,
      xpValue: 20
    };

    fetch('/api/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLec)
    }).catch(() => {});

    setCustomLectures((prev) => [newLec, ...prev.filter((l) => l.youtubeId !== ytId)]);
    setActiveLecture(newLec);
    setNewUrl('');
    setShowAddForm(false);
    setIsImportingVideo(false);
    triggerNotification("✅ Video Added", `"${realTitle}" Lecture Room-এ যুক্ত হয়েছে!`);
  };

  const totalCompletedCount = Object.values(watchedMap).filter(Boolean).length;

  const CATEGORIES: { id: LectureCategory; label: string }[] = [
    { id: 'All', label: 'All Hindi' },
    { id: 'Watchlist', label: `Fav / Watchlist (${watchlistLectures.length})` },
    { id: 'Chadtag', label: '🔥 Chadtag' },
    { id: 'Psychology & Mind', label: '🧠 Psychology & Mind' },
    { id: 'Self Improvement', label: '⚡ Self Improvement' },
    { id: 'Social & Communication', label: '🗣️ Social & Communication' },
    { id: 'Fashion & Grooming', label: '👔 Fashion & Grooming' },
    { id: 'Goals & Mindset', label: '🎯 Achieve Goals' }
  ];

  return (
    <div id="lecture-hub-root" className="max-w-5xl mx-auto space-y-4 font-sans text-zinc-100 pb-10">
      {/* =====================================================================
          PREMIUM SAPPHIRE BLUE HERO CARD
         ===================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#061229] via-[#071733] to-[#0a2147] border border-blue-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_10px_35px_rgba(3,10,28,0.75)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0a224a] border border-sky-400/40 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.28)] shrink-0">
            <div className="w-9 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-sky-400 flex items-center justify-center text-[#030b1c] shadow-[0_0_14px_rgba(56,189,248,0.65)]">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Lecture Room
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-sky-400/35 text-[10px] font-bold text-sky-300">
                Hindi Masterclass
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-snug max-w-lg mt-0.5">
              Psychology, Human Mind, Chadtag, Self Improvement, Communication ও Fashion-এর সেরা Hindi ভিডিও।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-2xl bg-[#081b3a]/90 border border-blue-400/30 flex items-center gap-1.5 text-xs font-bold text-sky-300">
            <Award className="w-4 h-4 text-sky-400" />
            <span>{totalCompletedCount} Watched</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-[#030b1c] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_18px_rgba(56,189,248,0.35)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          LIVE YOUTUBE HINDI SEARCH BAR (BLUE THEME)
         ===================================================================== */}
      <div className="relative flex items-center bg-[#050f21] border border-blue-500/30 focus-within:border-sky-400/70 rounded-2xl px-4 py-3 shadow-inner transition-all">
        <Search className="w-4.5 h-4.5 text-blue-300/70 shrink-0 mr-3" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search any lecture, topic or creator (e.g. Hsc 28 Ict, Psychology, Chadtag, Communication)..."
          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-blue-200/45 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="p-1 text-blue-300/70 hover:text-white mr-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="pl-3 border-l border-blue-500/25 text-blue-200/80 flex items-center">
          {isSearchingYouTube ? (
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
          ) : (
            <SlidersHorizontal className="w-4 h-4 text-blue-300/70" />
          )}
        </div>
      </div>

      {/* =====================================================================
          CATEGORY FILTER PILLS (BLUE THEME)
         ===================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                active
                  ? 'bg-gradient-to-r from-blue-500 to-sky-400 text-[#030b1c] font-bold shadow-[0_0_20px_rgba(56,189,248,0.45)]'
                  : 'bg-[#061226] text-blue-100/80 border border-blue-500/25 hover:border-sky-400/50 hover:text-white'
              }`}
            >
              {cat.id === 'Watchlist' && (
                <Bookmark className={`w-3.5 h-3.5 ${active ? 'fill-current' : 'text-sky-400'}`} />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          LARGE YOUTUBE PLAYER (NATIVE WORKING YOUTUBE PLAYER + BIG THEATER VIEW)
         ===================================================================== */}
      {activeLecture && (
        <div
          ref={playerCardRef}
          className={
            isExpandedCinema
              ? 'fixed inset-0 z-[250] bg-[#020712]/95 backdrop-blur-xl flex flex-col justify-center p-2 sm:p-6 overflow-y-auto'
              : 'bg-gradient-to-b from-[#07152e] to-[#040c1a] border-2 border-sky-400/45 rounded-3xl p-3 sm:p-5 space-y-3.5 shadow-[0_16px_50px_rgba(37,99,235,0.32)] -mx-1 sm:mx-0'
          }
        >
          <div className={isExpandedCinema ? 'max-w-6xl w-full mx-auto space-y-3.5' : 'space-y-3.5'}>
            {/* Top Header & Action Controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                  <Tv className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-sky-400 font-semibold truncate">
                    {activeLecture.presenter} • {activeLecture.category || 'Hindi Lecture'}
                  </p>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {activeLecture.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Big Screen / Theater Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsExpandedCinema((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-sky-400/40 text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  title={isExpandedCinema ? 'Normal Size' : 'Big Theater Screen'}
                >
                  {isExpandedCinema ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>ছোট করুন</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>বড় স্ক্রিন</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleMarkAsWatched(activeLecture);
                    setIsExpandedCinema(false);
                    setActiveLecture(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* Extra Large Native YouTube Embed Player */}
            <div
              className={`relative w-full rounded-2xl overflow-hidden bg-black border border-sky-400/35 shadow-[0_12px_40px_rgba(0,0,0,0.85)] ${
                isExpandedCinema
                  ? 'h-[62vh] sm:h-[78vh]'
                  : 'min-h-[260px] sm:min-h-[460px] md:min-h-[520px] aspect-video'
              }`}
            >
              <iframe
                key={activeLecture.youtubeId}
                src={`https://www.youtube.com/embed/${activeLecture.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={activeLecture.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION HEADER ROW
         ===================================================================== */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-base font-bold text-white">
          {searchQuery.trim()
            ? `"${searchQuery}" Hindi Videos`
            : selectedCategory === 'Watchlist'
            ? 'আপনার Fav / Watchlist ভিডিও'
            : selectedCategory === 'All'
            ? 'Featured Hindi Self-Improvement & Chadtag Videos'
            : `${selectedCategory} (Hindi Videos)`}
        </h2>
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
        >
          <span>See All</span>
          <span>→</span>
        </button>
      </div>

      {/* =====================================================================
          VIDEO FEED CARDS (Real YouTube Thumbnails & Real Titles in Blue Theme)
         ===================================================================== */}
      <div className="space-y-3">
        {selectedCategory === 'Watchlist' && displayedLectures.length === 0 && (
          <div className="p-8 rounded-2xl bg-[#061226] border border-blue-500/25 text-center space-y-2">
            <Bookmark className="w-6 h-6 text-sky-400 mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-white">আপনার Fav / Watchlist এখনো খালি</p>
            <p className="text-xs text-blue-200/70">
              যেকোনো ভিডিওর পাশে থাকা বুকমার্ক আইকনে ক্লিক করে এখানে সেভ করে রাখুন।
            </p>
          </div>
        )}

        {displayedLectures.map((lec) => {
          const isSaved = watchlistLectures.some((w) => w.youtubeId === lec.youtubeId);
          const isWatched = !!watchedMap[lec.youtubeId];
          const isPlaying = activeLecture?.youtubeId === lec.youtubeId;

          return (
            <div
              key={lec.id}
              onClick={() => setActiveLecture(lec)}
              className={`relative group bg-gradient-to-r from-[#061329] to-[#050e1f] hover:from-[#091d3e] hover:to-[#071630] border rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.45)] ${
                isPlaying
                  ? 'border-sky-400/80 shadow-[0_0_25px_rgba(56,189,248,0.2)]'
                  : 'border-blue-500/25 hover:border-sky-400/50'
              }`}
            >
              {/* Small Corner Fav / Save Button */}
              <button
                type="button"
                onClick={(e) => toggleWatchlist(lec, e)}
                title={isSaved ? 'Remove from Fav / Watchlist' : 'Save to Fav / Watchlist'}
                className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-blue-500/25 border-sky-400/60 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-sky-300 hover:border-sky-400/40'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              <div className="flex items-start gap-3 min-w-0">
                {/* Real YouTube Thumbnail + Duration Badge */}
                <div className="relative w-28 sm:w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-blue-400/20">
                  <img
                    src={`https://i.ytimg.com/vi/${lec.youtubeId}/hqdefault.jpg`}
                    alt={lec.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('mqdefault.jpg')) {
                        target.src = `https://i.ytimg.com/vi/${lec.youtubeId}/mqdefault.jpg`;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-mono font-bold text-white">
                    {lec.duration}
                  </span>
                </div>

                {/* Real Title, Channel & Tags with full clear space */}
                <div className="min-w-0 flex-1 pr-7 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                    {lec.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[11px] text-blue-200/70 truncate">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500/25 text-sky-400 inline-flex items-center justify-center text-[8px] font-bold shrink-0">
                      ▶
                    </span>
                    <span className="text-zinc-200 font-medium truncate">{lec.presenter}</span>
                    <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                    {lec.views && (
                      <>
                        <span>•</span>
                        <span className="shrink-0">{lec.views}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#0a2146] border border-blue-400/30 text-[9px] font-medium text-sky-200">
                      {lec.presenter.toLowerCase().includes('chadtag') ? 'Chadtag' : lec.category || 'Hindi Lecture'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#091b38] border border-sky-400/25 text-[9px] font-medium text-sky-300">
                      Hindi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          BOTTOM IMPORT A YOUTUBE VIDEO CARD (BLUE THEME)
         ===================================================================== */}
      <button
        type="button"
        onClick={() => setShowAddForm(true)}
        className="w-full mt-2 bg-gradient-to-r from-[#06142b] to-[#051024] hover:from-[#091f42] hover:to-[#071835] border border-blue-500/30 hover:border-sky-400/50 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#0a234a] border border-sky-400/35 flex items-center justify-center text-sky-300">
            <Link2 className="w-4.5 h-4.5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Import a YouTube Lecture Video
            </h4>
            <p className="text-[11px] text-blue-200/70">
              যেকোনো YouTube ভিডিওর লিংক এখানে পেস্ট করে সেভ করুন (আসল টাইটেল ও থাম্বনেইলসহ)
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-sky-400" />
      </button>

      {/* =====================================================================
          ADD / IMPORT YOUTUBE VIDEO MODAL (BLUE THEME)
         ===================================================================== */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[#061329] border border-blue-500/40 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-sky-400/35 flex items-center justify-center text-sky-300">
                  <Link2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">YouTube Video যুক্ত করুন</h3>
                  <p className="text-[11px] text-blue-200/70">লিংক দিলেই আসল টাইটেল ও থাম্বনেইল চলে আসবে</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLecture} className="space-y-3">
              <input
                type="text"
                required
                placeholder="https://youtu.be/... অথবা https://youtube.com/watch?v=..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-[#040b18] border border-blue-500/35 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-sky-400"
              />

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#040b18] border border-blue-500/35 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-400"
              >
                <option value="Chadtag">Chadtag</option>
                <option value="Psychology & Mind">Psychology & Mind</option>
                <option value="Self Improvement">Self Improvement</option>
                <option value="Social & Communication">Social & Communication</option>
                <option value="Fashion & Grooming">Fashion & Grooming</option>
                <option value="Goals & Mindset">Achieve Goals</option>
              </select>

              <button
                type="submit"
                disabled={isImportingVideo}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-[#030b1c] font-bold text-xs cursor-pointer"
              >
                {isImportingVideo ? 'যুক্ত হচ্ছে...' : 'Lecture Room-এ যুক্ত করুন'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
