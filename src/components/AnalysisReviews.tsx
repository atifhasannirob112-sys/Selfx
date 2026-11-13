import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BarChart2, 
  Brain, 
  AlertCircle, 
  Award, 
  X, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Check, 
  Edit2, 
  XCircle,
  TrendingUp,
  Target,
  Smartphone,
  Clock,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Battery,
  Cpu,
  Wifi,
  Lock,
  AlertTriangle,
  Plus,
  Minus,
  Zap,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { DreamDayActivity, DreamDayActivityStatus } from '../types';

interface AppUsageItem {
  id: string;
  name: string;
  minutes: number;
  icon: string;
  category: 'social' | 'video' | 'productivity' | 'messaging' | 'other';
}

interface AnalysisReviewsProps {
  habitsCount?: number;
  habitsDone?: number;
  onSpeak?: (text: string) => void;
}

export default function AnalysisReviews({ habitsCount = 0, habitsDone = 0, onSpeak }: AnalysisReviewsProps) {
  const [isWeeklySabhaOpen, setIsWeeklySabhaOpen] = useState(false);
  const [isDailyReviewOpen, setIsDailyReviewOpen] = useState(false);

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Load activities from localStorage or default
  const [activities] = useState<DreamDayActivity[]>(() => {
    try {
      const saved = localStorage.getItem('selfx_dream_day_routine_v7');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const prevSaved = localStorage.getItem('selfx_dream_day_routine_v6');
      if (prevSaved) {
        const parsed = JSON.parse(prevSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: '1', startTime: '05:30', endTime: '06:00', title: 'Wake Up & Pray', description: 'Start the day with gratitude', category: 'morning' },
      { id: '2', startTime: '06:15', endTime: '07:15', title: 'Workout', description: 'Stay fit, stay healthy', category: 'workout' },
      { id: '3', startTime: '07:30', endTime: '09:00', title: 'Study Time', description: 'Focus on learning', category: 'focus' },
      { id: '4', startTime: '11:00', endTime: '13:00', title: 'Deep Work Block', description: 'Monk mode high-value output', category: 'focus' },
      { id: '5', startTime: '16:00', endTime: '17:00', title: 'Outdoor Walk', description: 'Fresh air & mind clearing', category: 'evening' },
      { id: '6', startTime: '21:30', endTime: '05:30', title: 'Deep Sleep', description: 'Restorative physical recovery', category: 'night' }
    ] as DreamDayActivity[];
  });

  // Load today's status
  const [dailyStatuses, setDailyStatuses] = useState<Record<string, DreamDayActivityStatus>>(() => {
    try {
      const saved = localStorage.getItem(`selfx_dream_day_status_v7_${todayDateStr}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Re-read daily status on sync or focus
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(`selfx_dream_day_status_v7_${todayDateStr}`);
        if (saved) setDailyStatuses(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('dream_day_status_synced', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('dream_day_status_synced', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [todayDateStr]);

  // Compute Daily Statistics
  const stats = useMemo(() => {
    const total = activities.length || 1;
    let completed = 0;
    let modified = 0;
    let missed = 0;

    activities.forEach(act => {
      const st = dailyStatuses[act.id]?.status;
      if (st === 'completed') completed++;
      else if (st === 'modified') modified++;
      else if (st === 'missed') missed++;
    });

    const progressPercentage = Math.min(100, Math.round(((completed + modified * 0.5) / total) * 100));
    return { total: activities.length, completed, modified, missed, progressPercentage };
  }, [activities, dailyStatuses]);

  // AI 2-Line Evaluation
  const aiDebrief = useMemo(() => {
    const { total, completed, modified, missed, progressPercentage } = stats;
    let rating = 0;
    if (total > 0) {
      const score = (completed * 10 + modified * 6) / total;
      rating = Math.round(score * 10) / 10;
    } else {
      rating = 7.5;
    }

    let line1 = total === 0 || (completed === 0 && modified === 0 && missed === 0)
      ? `Your routine is ready for today. Complete scheduled tasks to log verified progress.`
      : `You have completed ${completed} out of ${total} planned daily routines (${progressPercentage}% progress).`;

    let line2 = (completed === total && total > 0)
      ? `Outstanding execution—you operated at peak clarity and nailed every single target!`
      : (modified > 0 || missed > 0)
      ? `Protect your scheduled hours tomorrow to prevent the ${missed > 0 ? `${missed} skipped` : ''}${missed > 0 && modified > 0 ? ' and ' : ''}${modified > 0 ? `${modified} modified` : ''} routine slots.`
      : `Keep consistent execution as the day unfolds to achieve 100% completion.`;

    const feedback = {
      strengths: completed > 0 ? [
        `Logged ${completed} completed routine blocks with verified timestamps.`,
        "Maintained mental stamina through scheduled daily targets."
      ] : [
        "Fresh day awaiting execution. Start with your earliest morning habit!"
      ],
      mistakes: missed > 0 ? [
        `${missed} scheduled activity was missed due to schedule slippage.`
      ] : ["No critical execution gaps detected."],
      tomorrow: [
        "Keep evening routine fixed to ensure restorative 8h sleep.",
        "Hydrate immediately upon rising to kickstart morning alertness."
      ]
    };

    return { rating, line1, line2, feedback };
  }, [stats]);

  // 7-DAY WEEKLY SABHA AGGREGATION
  const weeklySabhaData = useMemo(() => {
    const past7Days: {
      dateStr: string;
      dayName: string;
      dayNum: number;
      isToday: boolean;
      total: number;
      completed: number;
      modified: number;
      missed: number;
      score: number;
    }[] = [];

    const taskMissCounts: Record<string, { title: string; count: number }> = {};
    const taskSuccessCounts: Record<string, { title: string; count: number }> = {};
    let totalTasksAccum = 0;
    let totalCompletedAccum = 0;
    let totalModifiedAccum = 0;
    let totalMissedAccum = 0;

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayDateStr;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();

      let dayCompleted = 0;
      let dayModified = 0;
      let dayMissed = 0;

      let dayStatusMap: Record<string, DreamDayActivityStatus> = {};
      if (dateStr === todayDateStr) {
        dayStatusMap = dailyStatuses;
      } else {
        try {
          const saved = localStorage.getItem(`selfx_dream_day_status_v7_${dateStr}`);
          if (saved) dayStatusMap = JSON.parse(saved);
        } catch (e) {}
      }

      activities.forEach(act => {
        const st = dayStatusMap[act.id]?.status;
        if (st === 'completed') {
          dayCompleted++;
          taskSuccessCounts[act.id] = {
            title: act.title,
            count: (taskSuccessCounts[act.id]?.count || 0) + 1
          };
        } else if (st === 'modified') {
          dayModified++;
        } else if (st === 'missed') {
          dayMissed++;
          taskMissCounts[act.id] = {
            title: act.title,
            count: (taskMissCounts[act.id]?.count || 0) + 1
          };
        } else {
          if (i > 0) {
            dayMissed++;
            taskMissCounts[act.id] = {
              title: act.title,
              count: (taskMissCounts[act.id]?.count || 0) + 1
            };
          }
        }
      });

      const dayTotal = activities.length || 1;
      const dayScore = dayTotal > 0 ? Math.round(((dayCompleted + dayModified * 0.5) / dayTotal) * 100) : 0;

      totalTasksAccum += activities.length;
      totalCompletedAccum += dayCompleted;
      totalModifiedAccum += dayModified;
      totalMissedAccum += dayMissed;

      past7Days.push({
        dateStr,
        dayName,
        dayNum,
        isToday,
        total: activities.length,
        completed: dayCompleted,
        modified: dayModified,
        missed: dayMissed,
        score: dayScore
      });
    }

    const overallWeekScore = totalTasksAccum > 0
      ? Math.round(((totalCompletedAccum + totalModifiedAccum * 0.5) / totalTasksAccum) * 100)
      : stats.progressPercentage;

    const mostMissedList = Object.values(taskMissCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const topWinsList = Object.values(taskSuccessCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      past7Days,
      overallWeekScore,
      totalCompletedAccum,
      totalMissedAccum,
      totalTasksAccum,
      mostMissedList,
      topWinsList
    };
  }, [activities, dailyStatuses, todayDateStr, stats.progressPercentage]);

  // Sabha Council Strategic Verdict
  const sabhaAdvice = useMemo(() => {
    const score = weeklySabhaData.overallWeekScore;
    let grade = "A+ Elite Standard";
    let verdictHeadline = "Outstanding 7-Day Discipline & Execution!";
    let guidanceNotes = [
      "You demonstrated high self-discipline across your daily routines.",
      "Keep standard wake-up times and protect evening wind-down to sustain peak performance.",
      "Prioritize your spiritual routine (5 daily prayers) as the anchor for mental focus."
    ];

    if (score < 50) {
      grade = "C Critical Reset Needed";
      verdictHeadline = "Routine Slippage Detected — Needs Strategic Reset";
      guidanceNotes = [
        "Multiple routine blocks were missed during the past 7 days. Simplify your daily schedule to 3 essential non-negotiables.",
        "Eliminate late-night phone screen time to ensure on-time Fajr & morning workout execution.",
        "Track your tasks live throughout the day rather than postponing check-offs until late night."
      ];
    } else if (score < 80) {
      grade = "B Steady Growth";
      verdictHeadline = "Solid Foundation with Minor Consistency Gaps";
      guidanceNotes = [
        "Good momentum, but afternoon and evening routines show intermittent drops.",
        "Set gentle alarms 10 minutes prior to crucial transitions (Study, Salah, Workout).",
        "Focus on the most frequently missed tasks highlighted below to push your weekly score above 90%."
      ];
    }

    return { grade, verdictHeadline, guidanceNotes };
  }, [weeklySabhaData.overallWeekScore]);

  return (
    <div className="space-y-3 pt-1 text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <h4 className="text-xs font-display font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Performance & Reviews</span>
        </h4>
        <span className="text-[10px] text-zinc-500 font-mono uppercase">
          Tactical Insights
        </span>
      </div>

      {/* 7-DAY WEEKLY SABHA CARD */}
      <div
        onClick={() => setIsWeeklySabhaOpen(true)}
        className="rounded-2xl bg-gradient-to-r from-[#17140b] via-[#121118] to-[#0d0c14] border border-amber-500/50 hover:border-amber-400 p-4 flex items-center justify-between shadow-lg transition-all cursor-pointer group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-wide text-amber-300 font-display">
                ৭ দিনের সাপ্তাহিক পর্যালোচনা সভা
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-mono text-[9px] font-bold">
                Score: {weeklySabhaData.overallWeekScore}%
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
              পুরো সপ্তাহের অগ্রগতি, ভুলত্রুটি, স্কোর ও ভবিষ্যৎ কর্মপরিকল্পনা
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
      </div>

      {/* DAILY REVIEW & AI EVALUATION CARD */}
      <div
        onClick={() => setIsDailyReviewOpen(true)}
        className="rounded-2xl bg-gradient-to-r from-[#12111d] via-[#0f0e1b] to-[#0c0b16] border border-indigo-900/50 hover:border-indigo-700/80 p-4 flex items-center justify-between shadow-lg transition-all cursor-pointer group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-wide text-white font-display group-hover:text-purple-300 transition-colors">
                DAILY REVIEW & AI EVALUATION
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[9px] font-bold">
                ⭐ {aiDebrief.rating}/10
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
              See your daily performance scorecard & actionable insights
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
      </div>



      {/* ========================================================================= */}
      {/* 7-DAY WEEKLY SABHA MODAL DIALOG                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isWeeklySabhaOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-[#0d0c14] border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 font-display">
                      ৭ দিনের সাপ্তাহিক পর্যালোচনা সভা (Weekly Sabha)
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      7-Day Comprehensive Review & Tactical Advisory Council
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsWeeklySabhaOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Main Score Gauge & 7-Day Performance Metric */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-500/30 relative overflow-hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      Weekly Execution Score
                    </span>
                    <h4 className="text-2xl font-black text-white font-display mt-0.5">
                      {weeklySabhaData.overallWeekScore}% <span className="text-xs text-zinc-400 font-normal">/ 100%</span>
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                      {sabhaAdvice.grade}
                    </span>
                  </div>
                </div>

                {/* 7-Day Trend Bar Visualizer */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Last 7 Days Consistency</span>
                    <span>{weeklySabhaData.totalCompletedAccum} Tasks Finished</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                    {weeklySabhaData.past7Days.map((d) => (
                      <div key={d.dateStr} className="flex flex-col items-center gap-1">
                        <div className="w-full h-12 bg-zinc-900 rounded-lg p-0.5 flex flex-col justify-end overflow-hidden border border-zinc-800">
                          <div 
                            className={`w-full rounded transition-all duration-500 ${
                              d.score >= 80 ? 'bg-emerald-400' : d.score >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ height: `${Math.max(12, d.score)}%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-mono ${d.isToday ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}>
                          {d.dayName}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-400">
                          {d.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Most Frequently Missed & Best Habits Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Most Missed Tasks */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold uppercase">বেশি মিস হওয়া কাজ (Gaps)</span>
                  </div>
                  {weeklySabhaData.mostMissedList.length > 0 ? (
                    <div className="space-y-1.5">
                      {weeklySabhaData.mostMissedList.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate pr-2">• {m.title}</span>
                          <span className="text-rose-400 font-mono text-[10px] shrink-0">{m.count}x missed</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400">কোনো কাজ বাদ পড়েনি! চমৎকার ধারাবাহিকতা।</p>
                  )}
                </div>

                {/* Best Consistent Habits */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono font-bold uppercase">সেরা অভ্যাস (Top Wins)</span>
                  </div>
                  {weeklySabhaData.topWinsList.length > 0 ? (
                    <div className="space-y-1.5">
                      {weeklySabhaData.topWinsList.map((w, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-zinc-300">
                          <span className="truncate pr-2">✓ {w.title}</span>
                          <span className="text-emerald-400 font-mono text-[10px] shrink-0">{w.count}x done</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400">নতুন সপ্তাহ শুরু করুন এবং কাজ সম্পন্ন করুন।</p>
                  )}
                </div>
              </div>

              {/* 3. Sabha Council Verdict & Strategic Advice */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <Brain className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    কাউন্সিল পরামর্শ ও সমাধান (Strategic Action Plan)
                  </span>
                </div>
                <p className="text-xs text-zinc-200 font-semibold leading-relaxed">
                  "{sabhaAdvice.verdictHeadline}"
                </p>
                <div className="space-y-1.5 pt-1">
                  {sabhaAdvice.guidanceNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                      <span className="text-amber-400 font-bold">➜</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeeklySabhaOpen(false)}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer transition-colors"
                >
                  পর্যালোচনা সমাপ্ত ও শপথ গ্রহণ
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DAILY REVIEW & AI EVALUATION MODAL DIALOG                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDailyReviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-[#0e0e17] border border-zinc-800 rounded-3xl p-5 space-y-5 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/50">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white font-display">
                    DAILY PERFORMANCE & AI EVALUATION
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsDailyReviewOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rating & 2-Line Statement */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                    Daily Scorecard
                  </span>
                  <span className="text-base font-black text-amber-400 font-display">
                    ⭐ {aiDebrief.rating} / 10
                  </span>
                </div>
                <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                  1. {aiDebrief.line1}
                </p>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  2. {aiDebrief.line2}
                </p>
              </div>

              {/* 3 Metric Counters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-base font-bold text-emerald-400 font-display">{stats.completed}</span>
                  <span className="block text-[9px] font-mono text-emerald-300 mt-0.5">Completed</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-base font-bold text-amber-400 font-display">{stats.modified}</span>
                  <span className="block text-[9px] font-mono text-amber-300 mt-0.5">Modified</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-base font-bold text-rose-400 font-display">{stats.missed}</span>
                  <span className="block text-[9px] font-mono text-rose-300 mt-0.5">Skipped</span>
                </div>
              </div>

              {/* Key Insights List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                  Daily Execution Insights
                </span>
                <div className="space-y-1.5">
                  {aiDebrief.feedback.strengths.map((str, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                  {aiDebrief.feedback.mistakes.map((mst, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{mst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tomorrow's Actionable Tips */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                  Actionable Feedback for Tomorrow
                </span>
                {aiDebrief.feedback.tomorrow.map((tip, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsDailyReviewOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase cursor-pointer transition-colors"
              >
                Close Review
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
