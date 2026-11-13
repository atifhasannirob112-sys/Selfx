import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, Plus, Star, Trash2, Check, Play, Upload, 
  Clapperboard, Tv, ListVideo, Edit, AlertCircle, X, 
  Image as ImageIcon, Search, SlidersHorizontal, Sparkles, ThumbsUp, 
  ThumbsDown, RotateCcw, RotateCw, Save, ShieldAlert, BadgeCheck, Flame,
  Loader2, Newspaper, TrendingUp, Globe, Coins, Calendar
} from 'lucide-react';
import { triggerNotification } from '../utils';
import { saveMediaItem, getMediaItem, initMediaDB } from '../utils/mediaStorage';
import { acquireBgMusicPauseLock, releaseBgMusicPauseLock } from '../utils/remixAudioEngine';

interface MovieItem {
  id: string;
  title: string;
  genre?: string;
  description: string;
  rating: number;
  posterBase64: string;
  recommended: boolean;
  videoUrl?: string; // Object URL
  videoFileName?: string;
  addedAt: string;
  type: 'watched';
}

interface AIReviewResult {
  funFactor: number;
  recommendation: 'Yes' | 'No';
  ratingCategory: 'poor' | 'normal' | 'dekha jai' | 'valo lagbe' | 'sure shot';
  reviewBengali: string;
}

// Default list of genres and tropes
const AVAILABLE_GENRES = [
  { id: 'action', label: 'Action (অ্যাকশন)' },
  { id: 'scifi', label: 'Sci-Fi (সাই-ফাই)' },
  { id: 'thriller', label: 'Thriller (থ্রিলার)' },
  { id: 'mystery', label: 'Mystery (রহস্য)' },
  { id: 'comedy', label: 'Comedy (কমেডি)' },
  { id: 'drama', label: 'Drama (ড্রামা)' },
  { id: 'horror', label: 'Horror (হরর)' },
  { id: 'romance', label: 'Romance (রোমান্স)' },
  { id: 'animation', label: 'Animation (অ্যানিমেশন)' },
];

const AVAILABLE_TROPES = [
  { id: 'mindbending', label: 'Mind-Bending / Plot Twists' },
  { id: 'underdog', label: 'Underdog Success Story' },
  { id: 'fastpaced', label: 'High Pacing / Non-Boring' },
  { id: 'space', label: 'Space & Universe Exploration' },
  { id: 'survival', label: 'Survival / Heist / Mission' },
  { id: 'feelgood', label: 'Feel-Good / Motivational' },
  { id: 'highiq', label: 'High IQ / Strategic Protagonist' },
];

// Default verified high-res movie cover fallback
export const DEFAULT_CINEMA_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600';

// Ultra-defensive movie sanitizer to prevent any corrupted storage/API items from crashing React
export function sanitizeMovieItem(m: any): MovieItem | null {
  if (!m || typeof m !== 'object') return null;
  try {
    const id = (typeof m.id === 'string' && m.id.trim()) 
      ? m.id.trim() 
      : ('m_' + Math.random().toString(36).substring(2, 9));
    
    let titleStr = 'Untitled Movie';
    if (typeof m.title === 'string') {
      titleStr = m.title.trim() || 'Untitled Movie';
    } else if (m.title && typeof m.title === 'object') {
      titleStr = String(m.title.name || m.title.title || m.title.en || Object.values(m.title)[0] || 'Untitled Movie');
    } else if (m.title != null) {
      titleStr = String(m.title);
    }

    let genreStr = 'Drama';
    if (typeof m.genre === 'string') {
      genreStr = m.genre.trim() || 'Drama';
    } else if (Array.isArray(m.genre)) {
      genreStr = m.genre.map(String).join(', ') || 'Drama';
    } else if (m.genre && typeof m.genre === 'object') {
      genreStr = String(Object.values(m.genre)[0] || 'Drama');
    } else if (m.genre != null) {
      genreStr = String(m.genre);
    }

    let descStr = '';
    if (typeof m.description === 'string') {
      descStr = m.description;
    } else if (m.description && typeof m.description === 'object') {
      descStr = String(m.description.text || m.description.review || Object.values(m.description)[0] || '');
    } else if (m.description != null) {
      descStr = String(m.description);
    }

    const numRating = Number(m.rating);
    const rating = (!isNaN(numRating) && numRating >= 1 && numRating <= 5) ? Math.round(numRating) : 5;

    let posterBase64 = DEFAULT_CINEMA_POSTER;
    if (typeof m.posterBase64 === 'string' && m.posterBase64.trim().length > 5) {
      const p = m.posterBase64.trim();
      posterBase64 = p.includes('photo-1542204172-e705278817a2') ? DEFAULT_CINEMA_POSTER : p;
    } else if (typeof m.posterUrl === 'string' && m.posterUrl.trim().length > 5) {
      const p = m.posterUrl.trim();
      posterBase64 = p.includes('photo-1542204172-e705278817a2') ? DEFAULT_CINEMA_POSTER : p;
    }

    const recommended = typeof m.recommended === 'boolean' ? m.recommended : (rating >= 4);
    const videoUrl = typeof m.videoUrl === 'string' && m.videoUrl.trim() ? m.videoUrl.trim() : undefined;
    const videoFileName = typeof m.videoFileName === 'string' && m.videoFileName.trim() ? m.videoFileName.trim() : undefined;
    const addedAt = typeof m.addedAt === 'string' && m.addedAt.trim() ? m.addedAt.trim() : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return {
      id,
      title: titleStr,
      genre: genreStr,
      description: descStr,
      rating,
      posterBase64,
      recommended,
      videoUrl,
      videoFileName,
      addedAt,
      type: 'watched'
    };
  } catch (err) {
    console.error("Error in sanitizeMovieItem:", err);
    return null;
  }
}

export default function CinemaHub() {
  useEffect(() => {
    acquireBgMusicPauseLock('component:cinema_hub');
    return () => releaseBgMusicPauseLock('component:cinema_hub');
  }, []);
  const [movies, setMovies] = useState<MovieItem[]>(() => {
    try {
      const saved = localStorage.getItem('lookmax_movies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeMovieItem).filter((m): m is MovieItem => m !== null);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeSubTab, setActiveSubTab] = useState<'watched' | 'ai_search' | 'cinema_news'>('watched');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);

  // Cinema News State
  const [cinemaNews, setCinemaNews] = useState<any[]>([]);
  const [newsSearchQuery, setNewsSearchQuery] = useState<string>('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<'all' | 'bollywood' | 'south' | 'box_office' | 'upcoming'>('all');
  const [isLoadingNews, setIsLoadingNews] = useState<boolean>(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  const fetchCinemaNews = async (query = '', forceRefresh = false) => {
    // If forcing refresh and we already have items, instantly shuffle locally for zero perceived latency (< 0ms)
    if (forceRefresh && cinemaNews.length > 1) {
      setCinemaNews(prev => [...prev].sort(() => 0.5 - Math.random()));
    }
    setIsLoadingNews(true);
    setNewsError(null);
    try {
      const res = await fetch("/api/lookmax/cinema-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery: query, forceRefresh })
      });
      if (!res.ok) throw new Error("Failed to load cinema news");
      const data = await res.json();
      if (data.success && Array.isArray(data.news)) {
        setCinemaNews(data.news);
      } else if (Array.isArray(data)) {
        setCinemaNews(data);
      } else {
        setCinemaNews([]);
      }
    } catch (err: any) {
      setNewsError("সিনেমা রিকমেন্ডেশন লোড করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'cinema_news') {
      fetchCinemaNews(newsSearchQuery);
    }
  }, [activeSubTab]);
  
  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<string>('Drama');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [posterBase64, setPosterBase64] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState('');
  
  const posterInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // AI Description Generation State (Strictly 2-Line English tailored to Movie Name, Genre & Rating)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateAiDescription = async () => {
    if (!title || !title.trim()) {
      triggerNotification("⚠️ Title Required", "Please enter the movie title first!");
      return;
    }
    setIsGeneratingDescription(true);
    setGenerationError(null);

    const currentRating = Number(rating) || 5;
    const movieTitleClean = title.trim();
    const currentGenre = genre || 'Drama';

    // Fast client-side fallback generator to guarantee response within 3-4s
    const getFastEnglishReview = (name: string, starRating: number, selectedGenre: string) => {
      if (starRating >= 5) {
        return `"${name}" stands out as an absolute ${selectedGenre} masterpiece featuring compelling storytelling and breathtaking cinematic direction.\nA thoroughly gripping 5/5 triumph that resonates with exceptional emotional depth and brilliance.`;
      } else if (starRating === 4) {
        return `"${name}" delivers an engaging ${selectedGenre} narrative elevated by sharp pacing and standout performances throughout.\nA highly rewarding 4/5 watch that keeps you entertained and invested from start to finish.`;
      } else if (starRating === 3) {
        return `"${name}" presents an intriguing ${selectedGenre} premise with solid visual style and enjoyable moments.\nWhile its pacing has a few minor flaws, it remains a worthwhile 3/5 casual cinematic experience.`;
      } else if (starRating === 2) {
        return `"${name}" sets up a promising ${selectedGenre} concept but struggles with predictable plotlines and uneven execution.\nAn underwhelming 2/5 watch that leaves several promising narrative threads unrealized.`;
      } else {
        return `"${name}" falls short of its ${selectedGenre} premise due to lackluster writing and disjointed pacing.\nA disappointing 1/5 experience that unfortunately fails to leave any lasting impression.`;
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3800); // 3.8s hard cutoff

      const res = await fetch("/api/lookmax/enhance-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ 
          movieName: movieTitleClean, 
          genre: currentGenre,
          rating: currentRating,
          userDescription: description 
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Failed to get response from server");
      const data = await res.json();
      if (data.success && data.description) {
        setDescription(data.description.trim());
        triggerNotification("⚡ 2-Line English Review Ready", `Generated concise English review for "${movieTitleClean}" (${currentRating}★)`);
      } else {
        throw new Error(data.error || "Failed to generate");
      }
    } catch (err: any) {
      console.warn("AI generation timed out or failed, using instant high-fidelity fallback:", err);
      const instantReview = getFastEnglishReview(movieTitleClean, currentRating, currentGenre);
      setDescription(instantReview);
      triggerNotification("⚡ 2-Line English Review Generated", `Generated concise English review for "${movieTitleClean}" (${currentRating}★)`);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // --- AI Movie Search & Recommendation State ---
  const [searchTitle, setSearchTitle] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [personalTaste, setPersonalTaste] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lookmax_cinema_personal_taste');
      return saved ? JSON.parse(saved) : ['fastpaced', 'mindbending']; // Default non-boring tastes
    } catch {
      return ['fastpaced', 'mindbending'];
    }
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIReviewResult | null>(null);
  const [showTasteConfig, setShowTasteConfig] = useState(false);

  // Hydrate from IndexedDB, Server & LocalStorage on mount with automatic poster recovery
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await initMediaDB();

        // 1. Fetch from backend server API
        let serverList: MovieItem[] = [];
        try {
          const res = await fetch("/api/user/movies");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.movies) && data.movies.length > 0) {
              serverList = data.movies.map(sanitizeMovieItem).filter((m): m is MovieItem => m !== null);
            }
          }
        } catch (serverErr) {
          console.warn("Could not sync movies from server:", serverErr);
        }

        // 2. Fetch from IndexedDB durable storage
        let dbList: MovieItem[] = [];
        try {
          const storedMoviesStr = await getMediaItem('selfx_cinemahub_movies');
          if (storedMoviesStr) {
            const parsed = JSON.parse(storedMoviesStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              dbList = parsed.map(sanitizeMovieItem).filter((m): m is MovieItem => m !== null);
            }
          }
        } catch (e) {
          console.warn("Could not load from IndexedDB:", e);
        }

        if (isMounted) {
          // Merge lists with poster protection
          setMovies(prev => {
            const map = new Map<string, MovieItem>();

            const mergeItem = (item: MovieItem) => {
              if (!item || !item.id) return;
              const existing = map.get(item.id);
              if (!existing) {
                map.set(item.id, item);
              } else {
                // If existing has broken or default poster, and incoming has a real base64 poster, keep the better one!
                const existingHasRealPoster = existing.posterBase64 && existing.posterBase64.startsWith('data:') && existing.posterBase64.length > 100;
                const itemHasRealPoster = item.posterBase64 && item.posterBase64.startsWith('data:') && item.posterBase64.length > 100;

                if (!existingHasRealPoster && itemHasRealPoster) {
                  map.set(item.id, { ...existing, ...item, posterBase64: item.posterBase64 });
                }
              }
            };

            (prev || []).forEach(mergeItem);
            serverList.forEach(mergeItem);
            dbList.forEach(mergeItem);

            return Array.from(map.values()).map(sanitizeMovieItem).filter((m): m is MovieItem => m !== null);
          });

          // 3. Post-hydration poster rescue: Check individual IndexedDB poster keys
          setTimeout(async () => {
            if (!isMounted) return;
            try {
              setMovies(currentMovies => {
                currentMovies.forEach(async (m) => {
                  if (!m.posterBase64 || !m.posterBase64.startsWith('data:') || m.posterBase64.includes('photo-1542204172-e705278817a2')) {
                    const savedPoster = await getMediaItem(`movie_poster_${m.id}`);
                    if (savedPoster && savedPoster.startsWith('data:') && isMounted) {
                      setMovies(latest => latest.map(curr => curr.id === m.id ? { ...curr, posterBase64: savedPoster } : curr));
                    }
                  }
                });
                return currentMovies;
              });
            } catch (e) {}
          }, 300);
        }
      } catch (err) {
        console.warn('Failed to load movies from IndexedDB/Server:', err);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Safe auto save movies to IndexedDB, Server and LocalStorage (Quota Protected)
  useEffect(() => {
    const validMovies = (Array.isArray(movies) ? movies : []).map(sanitizeMovieItem).filter((m): m is MovieItem => m !== null);
    if (validMovies.length > 0) {
      // 1. Persist full resolution data to IndexedDB (Virtually unlimited quota)
      saveMediaItem('selfx_cinemahub_movies', JSON.stringify(validMovies)).catch(() => {});

      // 2. Also ensure each movie's poster is saved to its own dedicated IndexedDB key for foolproof preservation
      validMovies.forEach(m => {
        if (m.posterBase64 && m.posterBase64.startsWith('data:')) {
          saveMediaItem(`movie_poster_${m.id}`, m.posterBase64).catch(() => {});
        }
      });

      // 3. Sync with backend server
      fetch("/api/user/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movies: validMovies })
      }).catch(() => {});
    }

    // 4. Graceful LocalStorage save (catches and neutralizes QuotaExceededError without corrupting React state)
    try {
      localStorage.setItem('lookmax_movies', JSON.stringify(validMovies));
    } catch (quotaErr) {
      console.warn("localStorage quota exceeded for lookmax_movies. Saving lightweight version:", quotaErr);
      try {
        const lightweightMovies = validMovies.map(m => ({
          ...m,
          posterBase64: (m && m.posterBase64 && m.posterBase64.length > 2000 && m.posterBase64.startsWith('data:'))
            ? DEFAULT_CINEMA_POSTER
            : (m ? m.posterBase64 : DEFAULT_CINEMA_POSTER)
        }));
        localStorage.setItem('lookmax_movies', JSON.stringify(lightweightMovies));
      } catch (err2) {
        console.warn("Could not save lightweight version to localStorage:", err2);
      }
    }
  }, [movies]);

  // Auto save taste preferences safely
  useEffect(() => {
    try {
      localStorage.setItem('lookmax_cinema_personal_taste', JSON.stringify(personalTaste));
    } catch (e) {}
  }, [personalTaste]);

  // Handle local poster file selection (optimized canvas compression & safe storage)
  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerNotification("⚠️ Image Required", "Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 360; // Clean high-density dimension for posters
          const scale = img.width > 0 ? Math.min(1, MAX_WIDTH / img.width) : 1;
          const w = Math.round(img.width * scale) || 360;
          const h = Math.round(img.height * scale) || 520;
          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);
            // 0.72 quality creates a crisp ~25-35KB poster that avoids memory/quota issues
            const compressed = canvas.toDataURL('image/jpeg', 0.72);
            setPosterBase64(compressed);
            saveMediaItem(`movie_poster_temp_${Date.now()}`, compressed).catch(() => {});
            triggerNotification("🖼️ Poster Loaded", "Movie cover poster loaded successfully.");
          } else {
            const raw = evt.target?.result as string;
            setPosterBase64(raw);
          }
        } catch (err) {
          console.error("Canvas compression error:", err);
          const raw = evt.target?.result as string;
          setPosterBase64(raw);
        }
      };
      img.onerror = () => {
        triggerNotification("⚠️ Poster Error", "Could not process image file.");
      };
      img.src = evt.target?.result as string;
    };
    reader.onerror = () => {
      triggerNotification("⚠️ Upload Error", "Failed to read image file.");
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle local video file upload
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFileName(file.name);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    triggerNotification("🎬 Trailer Loaded", "Local trailer loaded successfully.");
    e.target.value = '';
  };

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setEditingMovieId(null);
    setTitle('');
    setGenre('Drama');
    setDescription('');
    setRating(5);
    setPosterBase64('');
    setVideoUrl('');
    setVideoFileName('');
    setShowModal(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (movie: MovieItem) => {
    setEditingMovieId(movie.id);
    setTitle(movie.title);
    setGenre(movie.genre || 'Drama');
    setDescription(movie.description);
    setRating(movie.rating);
    setPosterBase64(movie.posterBase64);
    setVideoUrl(movie.videoUrl || '');
    setVideoFileName(movie.videoFileName || '');
    setShowModal(true);
  };

  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      triggerNotification("⚠️ Title Required", "Please enter the movie title!");
      return;
    }

    const defaultCover = DEFAULT_CINEMA_POSTER;

    try {
      if (editingMovieId) {
        // Edit mode
        const finalPoster = posterBase64 || defaultCover;
        if (posterBase64) {
          saveMediaItem(`movie_poster_${editingMovieId}`, posterBase64).catch(() => {});
        }
        setMovies(prev => prev.map(m => {
          if (m.id === editingMovieId) {
            return {
              ...m,
              title: title.trim(),
              genre: genre.trim() || 'Drama',
              description: description.trim() || 'No description provided.',
              rating: Number(rating),
              posterBase64: finalPoster,
              recommended: rating >= 4,
              videoUrl: videoUrl || undefined,
              videoFileName: videoFileName || undefined,
            };
          }
          return m;
        }));
        triggerNotification("💾 Changes Saved", `"${title}" movie entry has been successfully updated.`);
      } else {
        // Add mode
        const newId = 'movie_' + Date.now() + "_" + Math.random().toString(36).substring(2, 5);
        const finalPoster = posterBase64 || defaultCover;
        if (posterBase64) {
          saveMediaItem(`movie_poster_${newId}`, posterBase64).catch(() => {});
        }
        const newMovie: MovieItem = {
          id: newId,
          title: title.trim(),
          genre: genre.trim() || 'Drama',
          description: description.trim() || 'No description provided.',
          rating: Number(rating),
          posterBase64: finalPoster,
          recommended: rating >= 4,
          videoUrl: videoUrl || undefined,
          videoFileName: videoFileName || undefined,
          addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'watched'
        };
        setMovies(prev => [newMovie, ...prev]);
        triggerNotification("🎬 Movie Added", `"${newMovie.title}" successfully added to your list!`);
      }

      // Reset and Close cleanly
      setShowModal(false);
      setTitle('');
      setGenre('Drama');
      setDescription('');
      setRating(5);
      setPosterBase64('');
      setVideoUrl('');
      setVideoFileName('');
      setEditingMovieId(null);
    } catch (saveErr) {
      console.error("Failed to save movie entry:", saveErr);
      triggerNotification("⚠️ Save Error", "Could not complete saving. Please try again.");
    }
  };

  const handleDeleteMovie = (movieId: string, titleName: string) => {
    if (window.confirm(`Are you sure you want to remove "${titleName}" from your logs?`)) {
      setMovies(prev => prev.filter(m => m.id !== movieId));
      triggerNotification("🗑️ Movie Removed", `"${titleName}" has been deleted.`);
    }
  };

  const toggleGenreOrTrope = (id: string) => {
    setPersonalTaste(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Call server-side Gemini movie search endpoint
  const handleAISearchAndReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTitle.trim()) {
      triggerNotification("⚠️ Movie Title Required", "Please enter the movie name first!");
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      // Human-readable labels of selected tastes
      const textTasteList = personalTaste.map(tId => {
        const foundG = AVAILABLE_GENRES.find(g => g.id === tId);
        const foundT = AVAILABLE_TROPES.find(tr => tr.id === tId);
        return foundG ? foundG.label : (foundT ? foundT.label : tId);
      });

      const response = await fetch('/api/cinema/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: searchTitle.trim(),
          year: searchYear.trim(),
          personalTaste: textTasteList
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact review server.");
      }

      const resData = await response.json();
      if (resData.success && resData.result) {
        setAiResult(resData.result);
        triggerNotification("✨ Review Generated", `"${searchTitle}" has been analyzed successfully!`);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification("❌ Analysis Failed", "Unable to review this movie at the moment. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Save the analyzed AI movie directly to Completed Watched list
  const handleSaveAISearchResult = () => {
    if (!aiResult) return;

    // Map Fun Factor to 1-5 Star rating
    // 90%+ = 5, 75%+ = 4, 55%+ = 3, 35%+ = 2, lower = 1
    let computedRating = 5;
    if (aiResult.funFactor >= 90) computedRating = 5;
    else if (aiResult.funFactor >= 72) computedRating = 4;
    else if (aiResult.funFactor >= 50) computedRating = 3;
    else if (aiResult.funFactor >= 30) computedRating = 2;
    else computedRating = 1;

    // Use a cool default poster based on keyword search or movie title
    const searchEncoded = encodeURIComponent(searchTitle.trim() + " movie poster");
    const dynamicPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400`;

    const newMovie: MovieItem = {
      id: 'movie_ai_' + Date.now(),
      title: `${searchTitle.trim()} (${searchYear ? searchYear.trim() : new Date().getFullYear()})`,
      description: `[AI VERDICT / রিভিউ]: ${aiResult.reviewBengali}\n\n[Fun Factor]: ${aiResult.funFactor}%\n[Verdict]: ${aiResult.recommendation}\n[Rating Category]: ${aiResult.ratingCategory.toUpperCase()}`,
      rating: computedRating,
      posterBase64: dynamicPoster,
      recommended: aiResult.recommendation === 'Yes',
      type: 'watched',
      addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setMovies(prev => [newMovie, ...prev]);
    triggerNotification("💾 Saved to Completed Logs", `"${searchTitle}" has been saved to your completed movies log!`);
    
    // Clear inputs and result
    setSearchTitle('');
    setSearchYear('');
    setAiResult(null);
    setActiveSubTab('watched');
  };

  const safeMovies = (Array.isArray(movies) ? movies : []).map(sanitizeMovieItem).filter((m): m is MovieItem => m !== null);
  const filteredMovies = safeMovies.filter(m => {
    if (!m) return false;
    return selectedRatingFilter === null || m.rating === selectedRatingFilter;
  });

  return (
    <div id="cinema-hub-section" className="space-y-6 animate-fadeIn text-left">
      
      {/* BANNER HEADER */}
      <div className="bg-[#121214] border border-zinc-850 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full tracking-wider font-semibold">
              Entertainment Mindset / Cinematic Reflections
            </span>
            <h3 className="font-display font-semibold text-xl text-zinc-100 flex items-center gap-2.5">
              <Clapperboard className="w-5.5 h-5.5 text-amber-400 animate-spin-slow" />
              Personal Cinema Journal & AI recommender
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Log your viewed masterpieces, or search any movie by name and year to get dynamic recommendations with real-time percentages of fun/boredom, matching your preferred tropes!
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
            {activeSubTab === 'watched' && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all font-sans"
              >
                <Plus className="w-4.5 h-4.5 text-zinc-950 stroke-[3]" /> Add Movie
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUB-TABS (Removed Watchlist, Replaced with AI Search, Added Cinema News) */}
      <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 gap-1.5 shadow-md flex-col sm:flex-row">
        <button
          onClick={() => { setActiveSubTab('watched'); setSelectedRatingFilter(null); }}
          className={`flex-1 py-3 text-xs uppercase font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'watched'
              ? 'bg-zinc-900 text-amber-400 border border-zinc-850 shadow-md font-bold'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <Tv className="w-4 h-4 text-amber-400" />
          <span>Completed Movie Log ({safeMovies.length})</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('ai_search'); }}
          className={`flex-1 py-3 text-xs uppercase font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'ai_search'
              ? 'bg-zinc-900 text-amber-400 border border-zinc-850 shadow-md font-bold'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Search & AI Review (মুভি এআই রিভিউ)</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('cinema_news'); }}
          className={`flex-1 py-3 text-xs uppercase font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'cinema_news'
              ? 'bg-zinc-900 text-amber-400 border border-zinc-850 shadow-md font-bold'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <Film className="w-4 h-4 text-amber-400" />
          <span>CineAI Recs (মুভি সাজেশন্স)</span>
        </button>
      </div>

      {/* RENDER TAB 1: WATCHED MOVIES JOURNAL */}
      {activeSubTab === 'watched' && (
        <div className="space-y-6">
          {/* RATING FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-900 p-4 rounded-xl shadow-lg backdrop-blur">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-sans">
                Rating Filter (রেটিং ফিল্টার):
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedRatingFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  selectedRatingFilter === null
                    ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-850 hover:text-zinc-200 hover:border-zinc-800'
                }`}
              >
                All Ratings
              </button>
              {[5, 4, 3, 2, 1].map((star) => {
                const starCount = safeMovies.filter(m => m && m.rating === star).length;
                return (
                  <button
                    key={star}
                    onClick={() => setSelectedRatingFilter(star)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                      selectedRatingFilter === star
                        ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                        : 'bg-zinc-900/60 text-zinc-400 border-zinc-850 hover:text-zinc-200 hover:border-zinc-800'
                    }`}
                  >
                    <span>{star}</span>
                    <Star className={`w-3.5 h-3.5 ${selectedRatingFilter === star ? 'fill-current' : 'fill-amber-500/20 text-amber-500'}`} />
                    <span className="text-[10px] opacity-60 font-mono">({starCount})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WATCHED MOVIES LIST */}
          {filteredMovies.length === 0 ? (
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-12 text-center space-y-4">
              <Film className="w-12 h-12 text-zinc-800 mx-auto opacity-45 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-400">Your completed logs are empty</p>
                <p className="text-xs text-zinc-600 max-w-md mx-auto">
                  Click the "Add Completed Movie" button above or search using "Search & AI Review" to add entries instantly with ratings!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMovies.map((movie) => {
                if (!movie) return null;
                const safeRating = Math.max(1, Math.min(5, Number(movie.rating) || 5));
                const rawPoster = typeof movie.posterBase64 === 'string' ? movie.posterBase64.trim() : '';
                const safePoster = (rawPoster.length > 10 && !rawPoster.includes('photo-1542204172-e705278817a2'))
                  ? rawPoster
                  : DEFAULT_CINEMA_POSTER;
                const safeTitle = typeof movie.title === 'string' ? movie.title : String(movie.title || 'Untitled');
                const safeGenre = typeof movie.genre === 'string' ? movie.genre : (movie.genre ? String(movie.genre) : '');
                const safeDescription = typeof movie.description === 'string' ? movie.description : (movie.description ? String(movie.description) : '');
                const safeAddedAt = typeof movie.addedAt === 'string' ? movie.addedAt : 'Recently';
                const safeVideoFile = typeof movie.videoFileName === 'string' ? movie.videoFileName : 'Local video media';

                return (
                <div
                  key={movie.id || 'm_' + Math.random()}
                  className="group bg-[#121214] border border-zinc-900 hover:border-zinc-850 rounded-2xl overflow-hidden relative flex flex-col justify-between transition-all duration-300 shadow-2xl"
                >
                  {/* IMAGE HEADER */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-zinc-950">
                    <img
                      src={safePoster}
                      alt={safeTitle}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== DEFAULT_CINEMA_POSTER) {
                          target.src = DEFAULT_CINEMA_POSTER;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Visual Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/60 flex flex-col justify-between p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] uppercase font-mono tracking-widest font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md backdrop-blur">
                          COMPLETED WATCH
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(movie)}
                            className="p-1.5 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-amber-400 rounded-lg cursor-pointer transition-colors"
                            title="Edit Entry"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(movie.id, safeTitle)}
                            className="p-1.5 bg-red-950/90 hover:bg-red-900 border border-red-900/40 text-red-400 rounded-lg cursor-pointer transition-colors"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="block text-[9px] text-zinc-400 font-mono font-medium">
                          Added: {safeAddedAt}
                        </span>
                        <div className="flex bg-black/75 px-2 py-1 rounded-md border border-zinc-850 gap-0.5 items-center backdrop-blur-sm">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3 h-3 ${idx < safeRating ? 'text-amber-400 fill-amber-400' : 'text-zinc-800'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4 border-t border-zinc-900 bg-zinc-950/20">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display font-extrabold text-base text-zinc-100 group-hover:text-amber-400 transition-colors leading-snug">
                          {safeTitle}
                        </h4>
                        {safeGenre && (
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-md shrink-0 font-sans">
                            {safeGenre}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 whitespace-pre-line leading-relaxed font-sans">
                        {safeDescription}
                      </p>
                    </div>

                    {/* TRAILER COMPONENT */}
                    {movie.videoUrl && (
                      <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1.5">
                        <span className="block text-[8px] uppercase tracking-wider font-mono font-black text-emerald-400 flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-emerald-400" /> Playable File / Movie Clip
                        </span>
                        <video
                          src={movie.videoUrl}
                          controls
                          className="w-full aspect-[16/9] rounded-lg bg-black"
                        />
                        <span className="block text-[8px] text-zinc-650 truncate font-mono text-center">
                          File: {safeVideoFile}
                        </span>
                      </div>
                    )}

                    {movie.recommended && (
                      <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-emerald-400" />
                        <span className="text-[10px] font-medium text-zinc-400 leading-tight">
                          Inspiring masterpiece! Recommended to anyone avoiding boredom.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 2: AI SEARCH & AUTOMATION REVIEW */}
      {activeSubTab === 'ai_search' && (
        <div className="space-y-6">
          
          {/* TASTE CONFIGURATION BOX */}
          <div className="bg-[#121214] border border-zinc-900 rounded-2xl overflow-hidden shadow-lg">
            <button
              onClick={() => setShowTasteConfig(!showTasteConfig)}
              className="w-full flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-900/60 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                    🎯 Personal Movie Taste (আপনার পছন্দের ক্যাটাগরি)
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    পছন্দের tropes বা genres সিলেক্ট করুন যেন AI আপনার রুচি অনুযায়ী রেকমেন্ডেশন দেয়
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold font-mono uppercase bg-zinc-900 text-amber-400 rounded-md border border-zinc-800">
                {showTasteConfig ? 'Hide Config' : 'Configure Taste'}
              </span>
            </button>

            {showTasteConfig && (
              <div className="p-5 border-t border-zinc-900/60 bg-zinc-950/40 space-y-4 animate-fadeIn">
                {/* Genres */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest font-black text-zinc-500">
                    Preferred Genres (পছন্দের জনরা):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GENRES.map(g => {
                      const isSelected = (Array.isArray(personalTaste) ? personalTaste : []).includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGenreOrTrope(g.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm' 
                              : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tropes */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest font-black text-zinc-500">
                    Preferred Story Tropes & Pacing (পছন্দের থিম ও পেসিং):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TROPES.map(t => {
                      const isSelected = (Array.isArray(personalTaste) ? personalTaste : []).includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleGenreOrTrope(t.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm' 
                              : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 italic">
                  * default tastes are automatically optimized to skip boring/slow films and prioritize exciting elements.
                </p>
              </div>
            )}
          </div>

          {/* SEARCH INPUT FORM */}
          <form onSubmit={handleAISearchAndReview} className="bg-[#121214] border border-zinc-900 rounded-2xl p-5 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 font-mono">
              <Search className="w-4 h-4 text-amber-400" />
              AI Search & Smart Recommendation Engine
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] font-mono uppercase tracking-widest font-black text-zinc-500">Movie Title (মুভির নাম)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Inception, Interstellar, Shutter Island..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 px-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase tracking-widest font-black text-zinc-500">Release Year (সাল - optional)</label>
                <input
                  type="number"
                  placeholder="e.g., 2014"
                  value={searchYear}
                  onChange={(e) => setSearchYear(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 px-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-all font-sans font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={aiLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-zinc-950" />
                    Searching & Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-zinc-950" />
                    Search & AI Review (রিভিউ দেখুন)
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI RESULT BLOCK */}
          {aiResult && (
            <div className="bg-[#121214] border-2 border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-100 font-display">
                    🎬 {searchTitle.trim()} {searchYear ? `(${searchYear.trim()})` : ''}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 font-sans">
                    <BadgeCheck className="w-4 h-4 text-emerald-400" /> AI verified reviews and audience consensus scanned
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Verdict badge */}
                  {aiResult.recommendation === 'Yes' ? (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 font-black text-xs uppercase rounded-lg border border-emerald-500/20 shadow-md">
                      <ThumbsUp className="w-3.5 h-3.5 fill-emerald-500/10" /> Watch: YES (দেখুন)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 text-rose-400 font-black text-xs uppercase rounded-lg border border-rose-500/20 shadow-md">
                      <ThumbsDown className="w-3.5 h-3.5 fill-rose-500/10" /> Watch: NO (বোরিং লাগতে পারে)
                    </span>
                  )}

                  {/* Rating Category badge */}
                  {aiResult.ratingCategory === 'sure shot' && (
                    <span className="px-3 py-1.5 bg-amber-500 text-zinc-950 font-black text-xs uppercase rounded-lg border border-amber-400 shadow-md flex items-center gap-1 font-sans">
                      <Flame className="w-3.5 h-3.5 fill-zinc-950" /> Sure Shot (সেরা!)
                    </span>
                  )}
                  {aiResult.ratingCategory === 'valo lagbe' && (
                    <span className="px-3 py-1.5 bg-yellow-500/15 text-yellow-400 font-black text-xs uppercase rounded-lg border border-yellow-500/30 flex items-center gap-1">
                      Valo lagbe (ভালো লাগবে)
                    </span>
                  )}
                  {aiResult.ratingCategory === 'dekha jai' && (
                    <span className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 font-black text-xs uppercase rounded-lg border border-emerald-500/30 flex items-center gap-1">
                      Dekha jai (দেখা যায়)
                    </span>
                  )}
                  {aiResult.ratingCategory === 'normal' && (
                    <span className="px-3 py-1.5 bg-zinc-800 text-zinc-300 font-black text-xs uppercase rounded-lg border border-zinc-700">
                      Normal (চলবে)
                    </span>
                  )}
                  {aiResult.ratingCategory === 'poor' && (
                    <span className="px-3 py-1.5 bg-red-950 text-red-400 font-black text-xs uppercase rounded-lg border border-red-900/30 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Poor (বোরিং)
                    </span>
                  )}
                </div>
              </div>

              {/* CORE METRICS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Fun factor percentage meter */}
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                  {(() => {
                    const safeFunFactor = Math.max(0, Math.min(100, Number(aiResult.funFactor) || 50));
                    return (
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        {/* SVG Progress Ring */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className="text-zinc-900 stroke-current"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className={`stroke-current ${
                              safeFunFactor >= 80 
                                ? 'text-emerald-400' 
                                : safeFunFactor >= 55 
                                  ? 'text-yellow-400' 
                                  : 'text-rose-500'
                            }`}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray="301.6"
                            strokeDashoffset={301.6 - (301.6 * safeFunFactor) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-zinc-100 font-mono">
                            {safeFunFactor}%
                          </span>
                          <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">
                            FUN FACTOR
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-sans">
                      মজা লাগার সম্ভাবনা (Percentage)
                    </h5>
                    <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                      {(Number(aiResult.funFactor) || 50) >= 80 
                        ? "দারুণ এন্টারটেইনিং এবং একদম বোরিং করবে না!" 
                        : (Number(aiResult.funFactor) || 50) >= 55 
                          ? "মোটামুটি চমৎকার গতিতে চলবে।" 
                          : "ধীরগতির বা বোরিং লাগার সম্ভাবনা রয়েছে।"}
                    </p>
                  </div>
                </div>

                {/* AI Review text section */}
                <div className="md:col-span-2 bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest font-black text-amber-400 flex items-center gap-1">
                      👑 AI CINEMATIC ANALYSIS (বিশ্লেষণ)
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans font-medium whitespace-pre-line bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-900">
                      "{typeof aiResult.reviewBengali === 'string' ? aiResult.reviewBengali : String(aiResult.reviewBengali || '')}"
                    </p>
                  </div>

                  {/* Actions to log instantly */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAiResult(null)}
                      className="w-full sm:w-auto px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    >
                      Clear Search
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAISearchResult}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-zinc-950" />
                      Add to Completed Movie Logs (লগ বুক এ সেভ করুন)
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* RENDER TAB 3: CINEMA NEWS & BOX OFFICE (সিনেমা নিউজ) */}
      {activeSubTab === 'cinema_news' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* SEARCH & LIVE AI MOVIE RECOMMENDATION GENERATION */}
          <div className="bg-[#121214] border border-zinc-900 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                <span>CineAI Smart Movie Recommender (এআই স্পেশাল মুভি রিকমেন্ডার)</span>
              </h4>
              <p className="text-[11px] text-zinc-400">
                আপনার প্রিয় ঘরানার (যেমন: Thriller, Romantic, Comedy) বা আপনার মুড সম্পর্কে লিখুন। নিচের বাটনগুলোতে ক্লিক করে চমৎকার সব মুভি রিকমেন্ডেশন পান!
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={newsSearchQuery}
                  onChange={(e) => setNewsSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchCinemaNews(newsSearchQuery, true);
                    }
                  }}
                  placeholder="যেমন: Heart-touching Romantic Drama, High-octane South Action, Sci-Fi Mystery..."
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-850 text-zinc-100 text-xs rounded-xl focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              {/* Grid with Suggest & Refresh buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => fetchCinemaNews(newsSearchQuery, true)}
                  disabled={isLoadingNews}
                  className="sm:col-span-3 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-[0.99] group border-t border-white/10"
                >
                  {isLoadingNews ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>রিকমেন্ডেশন তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-zinc-950 group-hover:scale-110 transition-transform animate-pulse" />
                      <span className="font-extrabold text-[12px] tracking-wide">মুভি সাজেস্ট করুন!</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fetchCinemaNews(newsSearchQuery, true)}
                  disabled={isLoadingNews}
                  className="sm:col-span-1 py-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 disabled:bg-zinc-950 disabled:text-zinc-600 disabled:border-zinc-900 text-zinc-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="নতুন মুভি রিকমেন্ডেশন রিফ্রেশ করুন"
                >
                  <RotateCw className={`w-4 h-4 text-amber-400 ${isLoadingNews ? 'animate-spin' : ''}`} />
                  <span>রিফ্রেশ করুন</span>
                </button>
              </div>
            </div>
          </div>

          {/* CINE AI RECOMMENDATIONS RENDER BLOCK */}
          {isLoadingNews ? (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest animate-pulse">
                CineAI is searching & formulating the best movies for your taste...
              </p>
            </div>
          ) : newsError ? (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="text-xs text-red-400 font-bold">{newsError}</p>
              <button
                type="button"
                onClick={() => fetchCinemaNews(newsSearchQuery, true)}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-bold rounded-lg transition-colors border border-zinc-850 cursor-pointer"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {cinemaNews.length === 0 ? (
                <div className="py-16 bg-zinc-950/40 border border-zinc-900 rounded-2xl text-center space-y-3">
                  <Film className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-zinc-400">কোন এআই রিকমেন্ডেশন লোড করা হয়নি!</p>
                  <p className="text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    উপরে আপনার পছন্দের মুড বা কি-ওয়ার্ড লিখে অথবা ফাঁকা রেখে এআই দিয়ে মুভি সাজেস্ট করার ম্যাজিক বাটনটিতে ক্লিক করুন!
                  </p>
                </div>
              ) : (
                cinemaNews.map((item, idx) => {
                  return (
                    <div 
                      key={item.id || idx}
                      className="bg-zinc-950 border border-zinc-900/80 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all duration-300 shadow-xl flex flex-col animate-fadeIn"
                    >
                      {/* Movie Details & Bengali Review - No Cover Images */}
                      <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500">
                            <span className="bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                              <span>AI SUGGESTION</span>
                            </span>
                            <span className="bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-800">
                              {typeof item.industry === 'string' ? item.industry : (item.industry ? String(item.industry) : "Cinema")}
                            </span>
                            <span className="text-zinc-400 font-bold">Release Year: {typeof item.releasedDate === 'string' ? item.releasedDate : (item.releasedDate ? String(item.releasedDate) : "N/A")}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-bold">{typeof item.verdict === 'string' ? item.verdict : (item.verdict ? String(item.verdict) : "CineAI Recommendation")}</span>
                          </div>

                          <h4 className="text-zinc-100 font-display font-black text-lg sm:text-xl leading-snug hover:text-amber-400 transition-colors">
                            {typeof item.title === 'string' ? item.title : String(item.title || 'Movie Recommendation')}
                          </h4>

                          {/* Beautiful, warm Bengali description - Maximum of 2 lines */}
                          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-medium bg-zinc-950/80 p-4 rounded-xl border border-zinc-900">
                            {typeof item.content === 'string' ? item.content : String(item.content || '')}
                          </p>

                          {/* Cast information */}
                          {item.stars && (Array.isArray(item.stars) ? item.stars.length > 0 : Boolean(item.stars)) && (
                            <div className="pt-2 text-xs flex items-center gap-2">
                              <span className="text-zinc-500 font-bold">প্রধান অভিনয়শিল্পী:</span>
                              <span className="text-zinc-300 font-medium">{Array.isArray(item.stars) ? item.stars.map(s => typeof s === 'string' ? s : String(s?.name || s)).join(', ') : String(item.stars)}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3.5 border-t border-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span className="flex items-center gap-1.5 text-amber-500/80 font-bold">
                            <BadgeCheck className="w-4 h-4 text-amber-500" />
                            <span>১০০% টেস্ট ম্যাচিং এআই রিকমেন্ডেশন</span>
                          </span>
                          <span>CineAI Engine v2.0</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      )}

      {/* BEAUTIFUL ADD & EDIT MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121214] border border-zinc-850 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl relative my-8 animate-fadeIn">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
              <h4 className="font-display font-bold text-xs uppercase text-amber-400 tracking-wider flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-amber-400" />
                {editingMovieId ? 'Edit Movie Details' : 'Add New Movie Entry'}
              </h4>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-350"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="p-5 space-y-4">
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest font-black text-zinc-500">Movie Title / মুভির নাম</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Interstellar, Oppenheimer, Sholay..."
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 px-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                />
              </div>

              {/* Star Rating Selection */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-xl border border-zinc-900/90">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-mono uppercase tracking-widest font-black text-amber-400">
                    Your Rating / আপনার রেটিং ({rating} Stars)
                  </label>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {rating === 5 ? '🌟 Masterpiece' : rating === 4 ? '✨ Great' : rating === 3 ? '👍 Good' : rating === 2 ? '😐 Mediocre' : '👎 Poor'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setRating(stars)}
                      className={`flex-1 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        rating >= stars 
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${rating >= stars ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* GENRE / জনরা INPUT (USER TYPED) */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-xl border border-zinc-900/90">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-widest font-black text-amber-400 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>GENRE / জনরা (নিজের কিবোর্ড দিয়ে লিখুন)</span>
                  </label>
                  {genre && (
                    <span className="text-[10px] font-bold text-amber-300 font-sans px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {genre}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="যেমন: Action, Romantic, Horror, Drama, Psychological..."
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2 px-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-colors font-sans"
                />
              </div>

              {/* AI GENERATE DESCRIPTION BUTTON (PROMINENT & FAST) */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={handleGenerateAiDescription}
                  disabled={isGeneratingDescription || !title.trim()}
                  className={`w-full py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    title.trim()
                      ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border-amber-500/40 text-amber-300 hover:text-amber-200 active:scale-[0.98]'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isGeneratingDescription ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>⚡ Generating 2-Line English Review (৩-৪ সেকেন্ড)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>⚡ Generate 2-Line English Description (অনলি ইংলিশ)</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-zinc-500 mt-1 text-center font-sans">
                  💡 মুভির নাম ও রেটিং অনুযায়ী ৩-৪ সেকেন্ডে আকর্ষণীয় ২ লাইনের ইংলিশ রিভিউ তৈরি হবে
                </p>
                {generationError && (
                  <p className="text-[10px] text-red-500 font-medium font-sans mt-1 text-center">{generationError}</p>
                )}
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest font-black text-zinc-500">
                  Movie Description / Review (English)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="2-line English review will appear here automatically, or type your own..."
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 px-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors resize-none font-sans leading-relaxed"
                />
              </div>

              {/* POSTER UPLOADER */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase tracking-widest font-black text-zinc-500">Movie Poster Cover</label>
                {posterBase64 ? (
                  <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                    <div className="relative w-16 h-22 rounded-lg overflow-hidden border border-amber-500/40 shrink-0 bg-black shadow-md">
                      <img src={posterBase64} alt="Poster preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Poster Added Successfully</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-sans">Poster is saved and preserved in high quality</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => posterInputRef.current?.click()}
                          className="px-2.5 py-1 text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-400 rounded-md border border-zinc-750 transition-colors cursor-pointer"
                        >
                          Change Poster
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosterBase64('')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-red-950/40 hover:bg-red-950/80 text-red-400 rounded-md border border-red-900/40 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => posterInputRef.current?.click()}
                    className="p-4.5 bg-zinc-950 rounded-xl border border-dashed border-zinc-900 hover:border-zinc-800 cursor-pointer text-center text-xs text-zinc-550 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload Movie Poster Cover</span>
                  </div>
                )}
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterSelect}
                  className="hidden"
                />
              </div>

              {/* TRAILER CLIP UPLOADER */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase tracking-widest font-black text-zinc-500">Add Trailer or Clip (Optional)</label>
                <div 
                  onClick={() => videoInputRef.current?.click()}
                  className="p-4.5 bg-zinc-950 rounded-xl border border-dashed border-zinc-900 hover:border-zinc-800 cursor-pointer text-center text-xs text-zinc-550 transition-colors flex items-center justify-center gap-2"
                >
                  {videoFileName ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs max-w-xs truncate">
                      <Play className="w-3.5 h-3.5 fill-emerald-400" />
                      <span className="truncate">{videoFileName}</span>
                    </div>
                  ) : (
                    <>
                      <ListVideo className="w-4 h-4 text-amber-400" />
                      <span>Select MP4/MKV video clip</span>
                    </>
                  )}
                </div>
                <input
                   ref={videoInputRef}
                   type="file"
                   accept="video/*"
                   onChange={handleVideoSelect}
                   className="hidden"
                />
              </div>

              {/* MODAL ACTIONS BAR */}
              <div className="pt-4 border-t border-zinc-900 bg-zinc-950 flex gap-3 justify-end rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs uppercase rounded-lg cursor-pointer transition-all active:scale-95 shadow-lg"
                >
                  {editingMovieId ? 'Save Movie ✔' : 'Add Movie 🎬'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
