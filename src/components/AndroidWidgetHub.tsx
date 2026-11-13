import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Smartphone, 
  Check, 
  Plus, 
  X, 
  Clock, 
  Sparkles, 
  CheckSquare,
  Square,
  CheckCircle2,
  ListTodo,
  Calendar
} from 'lucide-react';
import { triggerNotification } from '../utils';

interface AndroidWidgetHubProps {
  onClose: () => void;
  todos?: any[];
  onToggleTodo?: (id: string) => void;
  onAddTodo?: (text: string) => void;
  waterCount?: number;
  onAddWater?: (amount?: number) => void;
  streakDays?: number;
  faithData?: any;
  activeRoutineTask?: { title: string; timeRange: string; desc?: string } | null;
  deferredPrompt?: any;
}

// Gentle pleasant audio chime when clicking / completing tasks offline
function playTaskCompleteChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  } catch (e) {}
}

export default function AndroidWidgetHub({
  onClose,
  activeRoutineTask,
  deferredPrompt
}: AndroidWidgetHubProps) {
  // Live ticking clock
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [newQuickTaskText, setNewQuickTaskText] = useState('');
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  // Today's date key for daily statuses
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // 1. Load real user Dream Day routine activities from storage
  const [dreamActivities, setDreamActivities] = useState<any[]>(() => {
    try {
      const savedV7 = localStorage.getItem('selfx_dream_day_routine_v7');
      if (savedV7) {
        const parsed = JSON.parse(savedV7);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const savedV2 = localStorage.getItem('lookmax_dream_activities_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { 
        id: 'dd_1', 
        title: 'Morning Sunlight, Hydration & Dua', 
        startTime: '06:30', 
        endTime: '07:30', 
        category: 'glow',
        visionImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80'
      },
      { 
        id: 'dd_2', 
        title: 'Deep Focus & Skills Mastery Block', 
        startTime: '08:30', 
        endTime: '11:30', 
        category: 'work',
        visionImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80'
      },
      { 
        id: 'dd_3', 
        title: 'Salah & Healthy Nutrition Lunch', 
        startTime: '12:30', 
        endTime: '13:30', 
        category: 'faith',
        visionImageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80'
      },
      { 
        id: 'dd_4', 
        title: 'Workout, Posture & Face Exercises', 
        startTime: '17:00', 
        endTime: '18:15', 
        category: 'fitness',
        visionImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80'
      },
      { 
        id: 'dd_5', 
        title: 'Evening Skincare, Reflection & Sleep', 
        startTime: '22:00', 
        endTime: '23:00', 
        category: 'routine',
        visionImageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80'
      }
    ];
  });

  // 2. Daily execution statuses for today
  const [todayStatuses, setTodayStatuses] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(`selfx_dream_day_status_v7_${todayDateStr}`);
      if (saved) return JSON.parse(saved);
      const prevSaved = localStorage.getItem(`selfx_dream_day_status_v6_${todayDateStr}`);
      if (prevSaved) return JSON.parse(prevSaved);
    } catch (e) {}
    return {};
  });

  // Listen for background updates from Dream Day
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedV7 = localStorage.getItem('selfx_dream_day_routine_v7');
        if (savedV7) setDreamActivities(JSON.parse(savedV7));
        const statuses = localStorage.getItem(`selfx_dream_day_status_v7_${todayDateStr}`);
        if (statuses) setTodayStatuses(JSON.parse(statuses));
      } catch (e) {}
    };
    window.addEventListener('selfx-dream-day-updated', handleSync);
    return () => window.removeEventListener('selfx-dream-day-updated', handleSync);
  }, [todayDateStr]);

  // Live second ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current active Dream Day routine based on time
  const currentDreamRoutine = useMemo(() => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (const act of dreamActivities) {
      if (act.startTime && act.endTime) {
        const [sh, sm] = String(act.startTime).split(':').map(Number);
        const [eh, em] = String(act.endTime).split(':').map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        if (currentMinutes >= startMin && currentMinutes < endMin) {
          return {
            ...act,
            timeRange: `${act.startTime} - ${act.endTime}`,
            isOngoing: true
          };
        }
      }
    }
    const fallback = dreamActivities[0];
    return {
      ...fallback,
      title: activeRoutineTask?.title || fallback?.title || 'Daily Glow-Up Routine',
      timeRange: `${fallback?.startTime || '07:00'} - ${fallback?.endTime || '08:30'}`,
      isOngoing: false
    };
  }, [currentTime, dreamActivities, activeRoutineTask]);

  // Next upcoming routine step
  const nextDreamRoutine = useMemo(() => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const act of dreamActivities) {
      if (act.startTime) {
        const [sh, sm] = String(act.startTime).split(':').map(Number);
        const startMin = sh * 60 + sm;
        if (startMin > currentMinutes) {
          return act;
        }
      }
    }
    return dreamActivities[0] || null;
  }, [currentTime, dreamActivities]);

  // Helper to extract image URL for an activity
  const getActivityImage = (act: any): string | null => {
    if (!act) return null;
    return (
      todayStatuses[act.id]?.personalPhotoUrl ||
      act.personalPhotoUrl ||
      act.visionImageUrl ||
      act.mediaUrl ||
      null
    );
  };

  // Toggle routine activity completion status
  const toggleActivityDone = (actId: string) => {
    setTodayStatuses(prev => {
      const current = prev[actId];
      const isCurrentlyCompleted = current?.status === 'completed';
      const updated = {
        ...prev,
        [actId]: {
          ...current,
          status: isCurrentlyCompleted ? 'pending' : 'completed',
          completedAt: isCurrentlyCompleted ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date().toISOString()
        }
      };
      try {
        localStorage.setItem(`selfx_dream_day_status_v7_${todayDateStr}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('selfx-dream-day-updated', { detail: { dateStr: todayDateStr } }));
      } catch (e) {}
      if (!isCurrentlyCompleted) {
        playTaskCompleteChime();
        triggerNotification("✨ Dream Day Task Completed!", "রুটিন কাজ সম্পন্ন হয়েছে!");
      }
      return updated;
    });
  };

  // Quick Add a custom routine task to Dream Day
  const handleAddRoutineTask = (text: string) => {
    if (!text.trim()) return;
    const newAct = {
      id: `dd_widget_${Date.now()}`,
      title: text.trim(),
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: '',
      category: 'routine',
      isCustomTask: true
    };
    const updated = [...dreamActivities, newAct];
    setDreamActivities(updated);
    try {
      localStorage.setItem('selfx_dream_day_routine_v7', JSON.stringify(updated));
      localStorage.setItem('lookmax_dream_activities_v2', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('selfx-dream-day-updated'));
    } catch (e) {}
    setNewQuickTaskText('');
    playTaskCompleteChime();
  };

  // Completion stats
  const completedCount = dreamActivities.filter(a => todayStatuses[a.id]?.status === 'completed').length;
  const totalCount = dreamActivities.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatHoursMinutes = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    hours = hours % 12 || 12;
    return `${hours}:${minutes}`;
  };

  const handleTriggerInstall = async () => {
    const promptEvent = (window as any).deferredPWAInstallPrompt || deferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === 'accepted') {
          (window as any).deferredPWAInstallPrompt = null;
          triggerNotification("🎉 ফোনে ইনস্টল সম্পন্ন হয়েছে!", "SelfX উইজেট এখন আপনার ফোনের হোম স্ক্রিন ও উইজেট ড্রয়ারে সক্রিয়!");
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowAddSuccess(true);
    }
  };

  const currentRoutineImg = getActivityImage(currentDreamRoutine);
  const isCurrentRoutineDone = todayStatuses[currentDreamRoutine.id]?.status === 'completed';

  return (
    <div 
      className="fixed inset-0 z-[200] overflow-y-auto text-white select-none"
      style={{
        backgroundColor: '#0c0d10',
        backgroundImage: 'radial-gradient(at 50% 0%, #1c1e26 0px, transparent 65%), radial-gradient(at 100% 100%, #101114 0px, transparent 65%)'
      }}
    >
      {/* Subtle wallpaper texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-md mx-auto min-h-screen px-4 py-4 pb-20 space-y-4">
        
        {/* Top Header Bar: Clean & Minimal */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 p-2 -ml-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="text-xs font-bold font-sans">Back</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerInstall}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            <Smartphone className="w-4 h-4 stroke-[2.5]" />
            <span>📲 Add to Home Screen</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* THE CLEAN HOME SCREEN WIDGET CARD (WITH PICTURES, TIME, & CHECKLIST)     */}
        {/* ========================================================================= */}
        <div className="w-full rounded-3xl bg-zinc-900/85 backdrop-blur-2xl border border-amber-500/35 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white space-y-4">
          
          {/* Header: Digital Clock & Date */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-light font-sans tracking-tight text-white">
                  {formatHoursMinutes(currentTime)}
                </span>
                <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                  {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium pt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-amber-400/80" />
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider inline-block">
                Dream Day Widget
              </span>
              <p className="text-[10px] text-zinc-400 font-mono pt-1">
                {completedCount}/{totalCount} Done ({progressPercent}%)
              </p>
            </div>
          </div>

          {/* ONGOING ROUTINE HERO WITH REAL USER PICTURE */}
          <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden space-y-3 p-3">
            
            {/* The Picture Added By The User */}
            {currentRoutineImg ? (
              <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden shadow-inner group">
                <img 
                  src={currentRoutineImg} 
                  alt={currentDreamRoutine.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-amber-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Ongoing Routine
                </div>

                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-zinc-200 font-bold">
                  {currentDreamRoutine.timeRange}
                </div>

                <div className="absolute bottom-2.5 inset-x-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-white drop-shadow-md leading-tight">
                    {currentDreamRoutine.title}
                  </h3>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Ongoing Routine
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight pt-1">
                    {currentDreamRoutine.title}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {currentDreamRoutine.timeRange}
                </span>
              </div>
            )}

            {/* One-Tap Complete Button for Current Routine */}
            <button
              type="button"
              onClick={() => toggleActivityDone(currentDreamRoutine.id)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all ${
                isCurrentRoutineDone
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-zinc-950 hover:from-amber-300 hover:to-yellow-300 border-amber-400/50 shadow-md'
              }`}
            >
              {isCurrentRoutineDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>✓ Routine Done for Today</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                  <span>Mark Ongoing Routine Done (টিক দিন)</span>
                </>
              )}
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TODAY'S DREAM DAY TO-DO ROUTINE CHECKLIST (WITH PICTURES)                  */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-zinc-200 uppercase font-bold flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-amber-400" />
                Today's To-Do Routine
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                {progressPercent}% Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Task list: Pictures + Checkboxes */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {dreamActivities.map((act, idx) => {
                const isDone = todayStatuses[act.id]?.status === 'completed';
                const actImage = getActivityImage(act);

                return (
                  <div
                    key={act.id || idx}
                    onClick={() => toggleActivityDone(act.id)}
                    className={`p-2 rounded-xl text-xs flex items-center justify-between border cursor-pointer transition-all select-none active:scale-[0.99] ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-zinc-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isDone 
                          ? 'bg-emerald-500 text-zinc-950 shadow-sm' 
                          : 'border border-zinc-500 bg-black/40 hover:border-amber-400'
                      }`}>
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {/* Photo Thumbnail if user added a picture */}
                      {actImage ? (
                        <img 
                          src={actImage} 
                          alt={act.title}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/15 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 text-xs shrink-0">
                          ⚡
                        </div>
                      )}

                      {/* Title */}
                      <span className={`truncate font-medium text-xs ${isDone ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                        {act.title}
                      </span>
                    </div>

                    {/* Time */}
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-2">
                      {act.startTime || ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Custom Routine Task */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="+ নতুন রুটিন কাজ যোগ করুন..."
                value={newQuickTaskText}
                onChange={(e) => setNewQuickTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddRoutineTask(newQuickTaskText);
                }}
                className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleAddRoutineTask(newQuickTaskText)}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Simple Direct Home Screen Action */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleTriggerInstall}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 text-xs font-black text-center cursor-pointer shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 stroke-[2.5]" />
              <span>হোম স্ক্রিনে উইজেট সেট করুন (Add to Home Screen)</span>
            </button>

            <button
              type="button"
              onClick={() => window.open('/widget.html', '_blank')}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 text-xs font-bold text-center cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>🚀 আলাদা উইজেট পেজ ওপেন করুন (/widget.html)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Manual Install Instruction Modal if prompt cannot be triggered automatically */}
      <AnimatePresence>
        {showAddSuccess && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="max-w-sm w-full bg-zinc-900 border border-amber-500/40 rounded-3xl p-5 space-y-3 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">হোম স্ক্রিনে যোগ করার নিয়ম</h4>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans text-left">
                আপনার ফোনের ব্রাউজারের উপরে ডানদিকের <strong className="text-white">৩-ডট (⋮) মেন্যু</strong> চাপুন, এবং <strong className="text-amber-400">"Add to Home screen"</strong> অথবা <strong className="text-amber-400">"Install app"</strong> চাপলেই ফোনের হোম স্ক্রিনে উইজেট হিসেবে যুক্ত হয়ে যাবে!
              </p>
              <button
                type="button"
                onClick={() => setShowAddSuccess(false)}
                className="w-full py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase cursor-pointer"
              >
                বুঝেছি (Got It)
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
