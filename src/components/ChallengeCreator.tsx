import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Calendar, Target, CheckCircle, Percent, Sparkles, 
  HelpCircle, Flame, Trophy, Award, TrendingUp, Compass, Activity, 
  Heart, Shield, PlusCircle, Check, BookOpen, Clock, AlertTriangle, ChevronRight
} from 'lucide-react';
import { ChallengeItem, HabitItem } from '../types';
import { triggerNotification } from '../utils';

interface ChallengeCreatorProps {
  challenges: ChallengeItem[];
  setChallenges: React.Dispatch<React.SetStateAction<ChallengeItem[]>>;
  habits: HabitItem[];
  onEarnPoints?: (amount: number, reason: string) => void;
  water?: { count: number; goal: number };
  photos?: { id: string; date: string; imageBase64: string }[];
  faith?: {
    fajr: boolean;
    zohor: boolean;
    achr: boolean;
    magrib: boolean;
    esha: boolean;
    tahajjud: boolean;
    ishraq: boolean;
    quranPlayed: boolean;
    quranPages: number;
    dhikrCount: number;
    dhikrTarget: number;
    adhkarMorningCompleted: string[];
    adhkarEveningCompleted: string[];
    sunnahCompleted: string[];
    goodDeedsCompleted: string[];
  };
  alarm?: { enabled: boolean; time: string; isTriggered: boolean };
}

export default function ChallengeCreator({ 
  challenges, 
  setChallenges, 
  habits, 
  onEarnPoints,
  water,
  photos,
  faith,
  alarm
}: ChallengeCreatorProps) {
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState('');
  
  // Custom duration buttons
  const [selectedDuration, setSelectedDuration] = useState<'7' | '10' | '21' | '30' | '60' | 'custom'>('21');
  
  // Lists during editing
  const [goalInput, setGoalInput] = useState('');
  const [goalsList, setGoalsList] = useState<string[]>(['Hit daily lookmax targets', 'Stop procrastinating']);
  
  const [habitInput, setHabitInput] = useState('');
  const [habitsList, setHabitsList] = useState<string[]>(['Skincare morning & night', 'Walk 10,000 steps', 'Practice Mewing']);
  
  const [rewardInput, setRewardInput] = useState('');
  const [rewardsList, setRewardsList] = useState<string[]>(['Delicious protein meal', '1-hour video game reward']);

  const [taskInput, setTaskInput] = useState('');
  const [tasksList, setTasksList] = useState<string[]>(['Morning Face exercise', 'Drink 3L of water', 'Read 5 pages of self-help']);

  // For active day task tracking
  const [selectedDayMap, setSelectedDayMap] = useState<Record<string, string>>({}); // challengeId -> active date string for task check

  // Integrated cross-app goals toggles
  const [integrateWater, setIntegrateWater] = useState(false);
  const [integrateHabits, setIntegrateHabits] = useState(false);
  const [integrateFaith, setIntegrateFaith] = useState(false);
  const [integrateCamera, setIntegrateCamera] = useState(false);
  const [integrateAlarm, setIntegrateAlarm] = useState(false);

  // Result verification modal state
  const [verifyingChallenge, setVerifyingChallenge] = useState<ChallengeItem | null>(null);
  const [verifyingDay, setVerifyingDay] = useState<string>('');

  // Default dates helper
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getFutureDateStr = (daysAhead: number) => {
    const now = new Date();
    now.setDate(now.getDate() + daysAhead - 1); // include today in count
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [startDateInput, setStartDateInput] = useState(getTodayStr());
  const [endDateInput, setEndDateInput] = useState(getFutureDateStr(21));

  // Auto calculate end date if duration changes
  const handleDurationChange = (dur: '7' | '10' | '21' | '30' | '60' | 'custom') => {
    setSelectedDuration(dur);
    if (dur !== 'custom') {
      const days = parseInt(dur);
      setEndDateInput(getFutureDateStr(days));
    }
  };

  // Calculates list of days between two dates (formatted "YYYY-MM-DD")
  const getDaysArray = (startStr: string, endStr: string): string[] => {
    const list: string[] = [];
    const sd = new Date(startStr);
    const ed = new Date(endStr);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return [];
    
    sd.setHours(0, 0, 0, 0);
    ed.setHours(0, 0, 0, 0);

    const curr = new Date(sd);
    let guard = 0;
    while (curr <= ed && guard < 100) { // Safety limit of 100 days maximum
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      list.push(`${y}-${m}-${d}`);
      curr.setDate(curr.getDate() + 1);
      guard++;
    }
    return list;
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const start = new Date(startDateInput);
    const end = new Date(endDateInput);

    if (end < start) {
      alert("Error: End date cannot be before Start date");
      return;
    }

    const daysList = getDaysArray(startDateInput, endDateInput);
    if (daysList.length === 0) return;

    // Create dynamic milestones
    const milestones = [
      { id: 'm-start', title: 'Day 1 Launch Trigger', dayIndex: 0, achieved: false },
      { id: 'm-mid', title: 'Halfway Discipline Star', dayIndex: Math.floor(daysList.length / 2), achieved: false },
      { id: 'm-end', title: 'Championship Finish Line', dayIndex: daysList.length - 1, achieved: false }
    ];

    const newChallenge: ChallengeItem = {
      id: crypto.randomUUID(),
      name: nameInput.trim(),
      startDate: startDateInput,
      endDate: endDateInput,
      completedDays: [],
      durationType: selectedDuration,
      goals: [...goalsList],
      habits: [...habitsList],
      rewards: [...rewardsList],
      milestones: milestones,
      achievements: ['Initiate Warrior Badge'],
      dailyTasks: tasksList.map(t => ({ id: crypto.randomUUID(), text: t, completedDays: [] })),
      xpAwarded: 0,
      integratedWaterGoal: integrateWater,
      integratedHabitsGoal: integrateHabits,
      integratedFaithGoal: integrateFaith,
      integratedCameraGoal: integrateCamera,
      integratedAlarmGoal: integrateAlarm
    };

    setChallenges(prev => [newChallenge, ...prev]);
    setNameInput('');
    setGoalsList(['Hit daily lookmax targets', 'Stop procrastinating']);
    setHabitsList(['Skincare morning & night', 'Walk 10,000 steps', 'Practice Mewing']);
    setRewardsList(['Delicious protein meal', '1-hour video game reward']);
    setTasksList(['Morning Face exercise', 'Drink 3L of water', 'Read 5 pages of self-help']);
    setIntegrateWater(false);
    setIntegrateHabits(false);
    setIntegrateFaith(false);
    setIntegrateCamera(false);
    setIntegrateAlarm(false);
    setShowForm(false);
    triggerNotification("🎯 Upgraded Challenge Registered", `Created your new ${daysList.length}-day "${newChallenge.name}" challenge!`);
  };

  const handleDeleteChallenge = (id: string, name: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    triggerNotification("Discipline Removed", `Deleted challenge: "${name}"`);
  };

  const handleToggleDay = (challengeId: string, dayStr: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        const alreadyChecked = c.completedDays.includes(dayStr);
        let updatedDays: string[];
        if (alreadyChecked) {
          updatedDays = c.completedDays.filter(d => d !== dayStr);
        } else {
          updatedDays = [...c.completedDays, dayStr];
          triggerNotification(`🎯 Day Checked!`, `Success recorded for ${formatDayLabel(dayStr)}!`);
          if (onEarnPoints) {
            onEarnPoints(30, `Successfully completed ${formatDayLabel(dayStr)} milestone! 🎯`);
          }
        }
        
        // Dynamic milestones evaluation
        const daysInChallenge = getDaysArray(c.startDate, c.endDate);
        const dayIdx = daysInChallenge.indexOf(dayStr);
        const updatedMilestones = c.milestones?.map(m => {
          if (m.dayIndex === dayIdx) {
            return { ...m, achieved: !alreadyChecked };
          }
          return m;
        }) || [];

        // Earned Achievements
        const updatedAchievements = [...(c.achievements || [])];
        const progressVal = Math.round((updatedDays.length / daysInChallenge.length) * 100);
        if (progressVal >= 50 && !updatedAchievements.includes('Discipline Overlord (50% Clear)')) {
          updatedAchievements.push('Discipline Overlord (50% Clear)');
          triggerNotification('🏆 Unlocked Achievement!', 'Discipline Overlord unlocked for hitting 50%!');
          if (onEarnPoints) {
            onEarnPoints(100, `Half-Way Master Milestone Unlocked! 🏆`);
          }
        }
        if (progressVal >= 100 && !updatedAchievements.includes('Alchemist of Habit (100% Master)')) {
          updatedAchievements.push('Alchemist of Habit (100% Master)');
          triggerNotification('🏆 Master of Habit!', 'Incredible consistency! 100% challenge completion!');
          if (onEarnPoints) {
            onEarnPoints(250, `100% Alchemist of Habit Achievement Unlocked! 🏆`);
          }
        }

        return {
          ...c,
          completedDays: updatedDays,
          milestones: updatedMilestones,
          achievements: updatedAchievements
        };
      }
      return c;
    }));
  };

  // Toggle dynamic daily task completion inside challenge for a specific day
  const handleToggleDailyTask = (challengeId: string, taskId: string, dayStr: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId && c.dailyTasks) {
        const updatedTasks = c.dailyTasks.map(t => {
          if (t.id === taskId) {
            const alreadyDone = t.completedDays.includes(dayStr);
            const nextCompleted = alreadyDone 
              ? t.completedDays.filter(x => x !== dayStr)
              : [...t.completedDays, dayStr];
            return { ...t, completedDays: nextCompleted };
          }
          return t;
        });
        return {
          ...c,
          dailyTasks: updatedTasks
        };
      }
      return c;
    }));
  };

  // Format YYYY-MM-DD to cleaner preview "Mon, Jun 12"
  const formatDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Calculates current consecutive streak
  const calculateStreak = (challenge: ChallengeItem, days: string[]): number => {
    let streak = 0;
    const sortedCompleted = [...challenge.completedDays].sort();
    if (sortedCompleted.length === 0) return 0;

    // Check back from today or from the latest checked day
    const todayStr = getTodayStr();
    let checkDateObj = new Date();
    // If today is after endDate, check back from endDate
    const endDateObj = new Date(challenge.endDate);
    if (checkDateObj > endDateObj) {
      checkDateObj = endDateObj;
    }

    // Let's implement a simpler consecutive check of the completed dates
    const completedSet = new Set(challenge.completedDays);
    let tempStreak = 0;
    let curr = new Date(endDateObj);

    // Scan backwards from endDate matching consecutive entries
    // Or we scan the calendar days array
    let currentConsecutive = 0;
    const todayIndex = days.indexOf(todayStr);
    const startCheckIndex = todayIndex !== -1 ? todayIndex : days.length - 1;

    for (let i = startCheckIndex; i >= 0; i--) {
      if (completedSet.has(days[i])) {
        currentConsecutive++;
      } else {
        // If checking today and it's not checked yet, we can look at yesterday to continue streak
        if (i === todayIndex && currentConsecutive === 0) {
          continue; 
        }
        break;
      }
    }
    
    // Fallback: simple total continuous chunks in completed days list
    if (currentConsecutive === 0 && challenge.completedDays.length > 0) {
      // Find largest continuous block
      let maxBlock = 0;
      let running = 0;
      for (const d of days) {
        if (completedSet.has(d)) {
          running++;
          if (running > maxBlock) maxBlock = running;
        } else {
          running = 0;
        }
      }
      return maxBlock;
    }

    return currentConsecutive;
  };

  // Calculates absolute XP points and Levels based on checking calendar days + tasks
  const getXpAndLevel = (challenge: ChallengeItem) => {
    const daysXp = challenge.completedDays.length * 100;
    let tasksXp = 0;
    if (challenge.dailyTasks) {
      challenge.dailyTasks.forEach(t => {
        tasksXp += t.completedDays.length * 20;
      });
    }
    const achsCount = challenge.achievements?.length || 1;
    const milestonesAchieved = challenge.milestones?.filter(m => m.achieved).length || 0;
    
    const totalXp = daysXp + tasksXp + (milestonesAchieved * 300) + (achsCount * 150);
    const level = Math.floor(totalXp / 500) + 1;
    const progressToNextLevel = (totalXp % 500) / 5; // percentage

    // Badges list based on Level
    let badge = 'Novice Recruit';
    if (level >= 2) badge = 'Consistency Novice';
    if (level >= 3) badge = 'Skincare Tactician';
    if (level >= 5) badge = 'Grooming Paladin';
    if (level >= 7) badge = 'Elite Mewing Monk';
    if (level >= 10) badge = 'Absolute Alchemist';

    return { xp: totalXp, level, progressToNextLevel, badge };
  };

  // Form lists builder helper
  const addGoal = () => {
    if (goalInput.trim()) {
      setGoalsList(prev => [...prev, goalInput.trim()]);
      setGoalInput('');
    }
  };

  const removeGoal = (idx: number) => {
    setGoalsList(prev => prev.filter((_, i) => i !== idx));
  };

  const addHabit = () => {
    if (habitInput.trim()) {
      setHabitsList(prev => [...prev, habitInput.trim()]);
      setHabitInput('');
    }
  };

  const removeHabit = (idx: number) => {
    setHabitsList(prev => prev.filter((_, i) => i !== idx));
  };

  const addReward = () => {
    if (rewardInput.trim()) {
      setRewardsList(prev => [...prev, rewardInput.trim()]);
      setRewardInput('');
    }
  };

  const removeReward = (idx: number) => {
    setRewardsList(prev => prev.filter((_, i) => i !== idx));
  };

  const addTask = () => {
    if (taskInput.trim()) {
      setTasksList(prev => [...prev, taskInput.trim()]);
      setTaskInput('');
    }
  };

  const removeTask = (idx: number) => {
    setTasksList(prev => prev.filter((_, i) => i !== idx));
  };

  // Overall Progress Performance Calculation
  const totalHabits = habits?.length || 0;
  const completedHabits = habits?.filter(h => h.completed).length || 0;

  let totalChallengeDays = 0;
  let completedChallengeDays = 0;

  challenges.forEach(c => {
    const days = getDaysArray(c.startDate, c.endDate);
    totalChallengeDays += days.length;
    completedChallengeDays += c.completedDays.filter(d => days.includes(d)).length;
  });

  const grandTotal = totalHabits + totalChallengeDays;
  const grandCompleted = completedHabits + completedChallengeDays;
  const overallPercentage = grandTotal > 0 ? Math.round((grandCompleted / grandTotal) * 100) : 0;

  // Dynamic feedback and motivational quotes based on percentage
  const getMotivationalQuote = (percentage: number) => {
    if (percentage === 0) return "Zero excuses. Initiate the daily grind to unlock your peak potential!";
    if (percentage <= 25) return "Good start! The momentum is building. Stay disciplined and focus on consistency.";
    if (percentage <= 50) return "Steadily rising. Your habits are shaping your future. Ignore the laziness.";
    if (percentage <= 75) return "Over halfway! The physical and mental adaptations are locking in. Complete every target.";
    if (percentage < 100) return "Elite status is within reach. Maintain extreme focus for a flawless finish.";
    return "Absolute Mastery unlocked. You have conquered all objectives. Legendary!";
  };

  // SVG Progress Ring Parameters
  const ringRadius = 36;
  const strokeWidth = 6;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (overallPercentage / 100) * ringCircumference;

  return (
    <div id="challenges-system-upgraded" className="space-y-6">

      {/* OVERALL DEVELOPMENT STANDINGS & PROGRESS CARD */}
      <div id="overall-progress-summary-card" className="bg-gradient-to-br from-zinc-950/90 to-zinc-900/40 p-5 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
        
        {/* SVG Progress Ring */}
        <div id="progress-ring-container" className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              className="stroke-zinc-800/60 fill-transparent"
              strokeWidth={strokeWidth}
            />
            {/* Foreground circle with neon progress */}
            <motion.circle
              cx="48"
              cy="48"
              r={ringRadius}
              className="stroke-amber-400 fill-transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={ringCircumference}
              initial={{ strokeDashoffset: ringCircumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          {/* Percentage Value inside the Progress Ring */}
          <div className="absolute flex flex-col items-center justify-center">
            <span id="overall-percentage-value" className="text-lg font-bold font-display text-zinc-100 tracking-tight">{overallPercentage}%</span>
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">Done</span>
          </div>
        </div>

        {/* Development standings info panel */}
        <div className="flex-1 space-y-3 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-gold-400" /> Executive Progress Command Center
              </h3>
              <p className="text-[10px] text-zinc-550 mt-0.5">Aggregates completed lookmaxing tasks and challenge checks</p>
            </div>
            
            <div className="text-[10px] font-mono text-gold-400 shrink-0 bg-gold-400/5 px-2.5 py-1 border border-gold-400/15 rounded-md self-start sm:self-auto">
              Total Score: {grandCompleted} / {grandTotal} Ticks
            </div>
          </div>

          {/* Breakdown stat lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Habits progress stats */}
            <div className="space-y-1.5 bg-zinc-950/50 p-3 rounded-xl border border-zinc-900">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                  <Activity className="w-3.5 h-3.5 text-amber-500" /> Active Habits
                </span>
                <span>{completedHabits} / {totalHabits} Completed</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0}%` }} 
                />
              </div>
            </div>

            {/* Challenges progress stats */}
            <div className="space-y-1.5 bg-zinc-950/50 p-3 rounded-xl border border-zinc-900">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                  <Target className="w-3.5 h-3.5 text-gold-400" /> Challenge Check-Ins
                </span>
                <span>{completedChallengeDays} / {totalChallengeDays} Days</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalChallengeDays > 0 ? (completedChallengeDays / totalChallengeDays) * 100 : 0}%` }} 
                />
              </div>
            </div>

          </div>

          {/* Motivational Directive */}
          <p className="text-xs text-zinc-400 italic">
            "{getMotivationalQuote(overallPercentage)}"
          </p>
        </div>
      </div>

      {/* MOTIVATIONAL TOP BANNER SECTION */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/20 border border-zinc-850 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono rounded-full uppercase tracking-widest">
            <Trophy className="w-3 h-3 text-gold-400" /> Dynamic Growth Platform
          </div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-100 tracking-tight">
            The Hero's <span className="text-gold-400">Discipline Hub</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Gamify your routines with real-time XP calculators, levels, achievement badge locks, and comprehensive calendar trackers. Establish custom challenge spans, define reward parameters, and master consistency.
          </p>
        </div>
        
        <button
          id="trigger-creation-btn"
          onClick={() => setShowForm(!showForm)}
          className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg cursor-pointer shrink-0 flex items-center justify-center gap-2"
        >
          {showForm ? 'Close Creation Panel' : 'Establish New Challenge'}
          <PlusCircle className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* DETAILED CREATION FORM WITH STEPS AND INGREDIENTS */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            className="overflow-hidden bg-[#0e0e10] border border-zinc-800 rounded-2xl shadow-2xl"
          >
            <form onSubmit={handleCreateChallenge} className="p-6 space-y-6">
              <div className="border-b border-zinc-850 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-medium text-sm text-zinc-200 uppercase tracking-wider">Configure Challenge Blueprint</h3>
                  <p className="text-[10px] text-zinc-500">Design custom milestones and gamified rewards to secure long-term interest.</p>
                </div>
                <Award className="w-5 h-5 text-gold-500" />
              </div>

              {/* Step 1: Base Config */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-widest">Challenge Title</label>
                  <input
                    id="challenge-title-box"
                    type="text"
                    required
                    placeholder="e.g. 30 Days Epic Facial Definition Protocol"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-widest">Challenge Duration</label>
                  <div className="grid grid-cols-6 gap-1">
                    {(['7', '10', '21', '30', '60', 'custom'] as const).map(dur => (
                      <button
                        type="button"
                        key={dur}
                        onClick={() => handleDurationChange(dur)}
                        className={`py-2 text-[10px] font-bold font-mono uppercase rounded-lg border transition-all ${
                          selectedDuration === dur 
                            ? 'bg-gold-500/10 border-gold-400 text-gold-300' 
                            : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                        }`}
                      >
                        {dur}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Date Bounds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-widest">Timeline Start</label>
                  <input
                    type="date"
                    required
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-widest">Timeline End</label>
                  <input
                    type="date"
                    required
                    disabled={selectedDuration !== 'custom'}
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-gold-500 font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              {/* STEP 2.5: INTEGRATED SECTOR GOALS SELECTOR */}
              <div className="bg-[#121214] border border-zinc-850 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span className="text-xs uppercase font-mono font-bold text-zinc-300 tracking-wider">
                    DNA Integration: Cross-App Core Goals
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Select which other sections of this app you want to tie directly into this challenge's daily success rate. For example, checking off a day can be evaluated against your live hydration logs, spiritual status, and photo logs!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                  {[
                    { state: integrateWater, setter: setIntegrateWater, label: "💧 Hydration Tracker", desc: "Goal: Hit daily water target" },
                    { state: integrateHabits, setter: setIntegrateHabits, label: "⚡ Daily Habits", desc: "Goal: Complete 6 core habits" },
                    { state: integrateFaith, setter: setIntegrateFaith, label: "🕌 Faith & Spiritual", desc: "Goal: Fulfill spiritual duty" },
                    { state: integrateCamera, setter: setIntegrateCamera, label: "📸 Face Scan Diary", desc: "Goal: Log daily progress photo" },
                    { state: integrateAlarm, setter: setIntegrateAlarm, label: "🌅 Sunrise Wake Up", desc: "Goal: Solved morning math alarm" }
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className={`p-3.5 rounded-xl border flex flex-col items-start gap-1.5 cursor-pointer select-none transition-all ${
                        item.state 
                          ? 'bg-gold-500/5 border-gold-400/30 text-gold-300'
                          : 'bg-zinc-950 border-zinc-900 text-zinc-450 hover:bg-zinc-900 hover:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="checkbox"
                          checked={item.state}
                          onChange={(e) => item.setter(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-gold-500 focus:ring-gold-500 bg-zinc-950 border-zinc-800 cursor-pointer accent-gold-500"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                      </div>
                      <span className="text-[8.5px] text-zinc-500 font-mono leading-none">{item.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Complex features lists (Goals, Habits, Rewards, Daily tasks) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Goals list builder */}
                <div className="bg-zinc-950/50 p-4 border border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gold-500 font-mono tracking-wider">Define Goals</span>
                    <span className="text-[9px] font-mono text-zinc-600">{goalsList.length} items</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add goal (e.g. Sharp jawline, No misses)"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal(); } }}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-gold-500"
                    />
                    <button type="button" onClick={addGoal} className="px-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-gold-400 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {goalsList.map((g, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-900/60 px-2.5 py-1.5 rounded text-xs border border-zinc-900">
                        <span className="text-zinc-300 truncate pr-2">• {g}</span>
                        <button type="button" onClick={() => removeGoal(idx)} className="text-zinc-650 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Habits to develop */}
                <div className="bg-zinc-950/50 p-4 border border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gold-500 font-mono tracking-wider">Custom Habits</span>
                    <span className="text-[9px] font-mono text-zinc-600">{habitsList.length} items</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add habit (e.g. Sleep by 10:30 PM, cold water splash)"
                      value={habitInput}
                      onChange={(e) => setHabitInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHabit(); } }}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-gold-500"
                    />
                    <button type="button" onClick={addHabit} className="px-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-gold-400 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {habitsList.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-900/60 px-2.5 py-1.5 rounded text-xs border border-zinc-900">
                        <span className="text-zinc-300 truncate pr-2">• {h}</span>
                        <button type="button" onClick={() => removeHabit(idx)} className="text-zinc-650 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Rewards setup */}
                <div className="bg-zinc-950/50 p-4 border border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gold-400 font-mono tracking-wider">Milestone Rewards</span>
                    <span className="text-[9px] font-mono text-zinc-600">{rewardsList.length} items</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reward (e.g. Cheat snack, new perfume)"
                      value={rewardInput}
                      onChange={(e) => setRewardInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addReward(); } }}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-gold-500"
                    />
                    <button type="button" onClick={addReward} className="px-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-gold-400 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto font-mono">
                    {rewardsList.map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-900/60 px-2.5 py-1.5 rounded text-[10px] border border-zinc-900 text-gold-400">
                        <span className="truncate pr-2">[REWARD] {r}</span>
                        <button type="button" onClick={() => removeReward(idx)} className="text-zinc-650 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Daily tasks checklist */}
                <div className="bg-zinc-950/50 p-4 border border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gold-400 font-mono tracking-wider">Specific Daily Tasks</span>
                    <span className="text-[9px] font-mono text-zinc-600">{tasksList.length} items</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add task (e.g. Apply serum, 30 min weightlift)"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-gold-500"
                    />
                    <button type="button" onClick={addTask} className="px-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-gold-400 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {tasksList.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-900/60 px-2.5 py-1.5 rounded text-xs border border-zinc-900">
                        <span className="text-zinc-300 truncate pr-2">📋 {t}</span>
                        <button type="button" onClick={() => removeTask(idx)} className="text-zinc-650 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="border-t border-zinc-850 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  id="challenge-build-submit-btn"
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Build Timeline & Set Trackers
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHALLENGES LAYOUT AND CONTAINER */}
      <div className="space-y-8">
        {challenges.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-850 rounded-2xl p-16 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-zinc-950 rounded-full border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 animate-pulse">
              <Compass className="w-8 h-8 text-gold-500/50" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-zinc-300 uppercase tracking-widest">No Active Challenges</h4>
              <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed">
                You have not initiated an active blueprint yet. Set a 7, 10, or 21-day timeline to gamify your habits and unlock levels!
              </p>
            </div>
            <button
              onClick={() => { setShowForm(true); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-gold-400 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Configure First Challenge
            </button>
          </div>
        ) : (
          challenges.map((challenge) => {
            const daysInChallenge = getDaysArray(challenge.startDate, challenge.endDate);
            const totalDaysCount = daysInChallenge.length;
            const completedDaysCount = challenge.completedDays.filter(d => daysInChallenge.includes(d)).length;
            const progressVal = totalDaysCount > 0 ? Math.round((completedDaysCount / totalDaysCount) * 100) : 0;
            const consecutiveStreak = calculateStreak(challenge, daysInChallenge);
            
            // Gamification XP & Level details
            const { xp, level, progressToNextLevel, badge } = getXpAndLevel(challenge);

            // Active day for specific tasks lookup
            const activeDay = selectedDayMap[challenge.id] || getTodayStr();

            // Weekly reporting segments
            const weeklyBreakdown: { weekTitle: string; daysStr: string[]; doneCount: number }[] = [];
            const weekLength = 7;
            for (let i = 0; i < daysInChallenge.length; i += weekLength) {
              const chunk = daysInChallenge.slice(i, i + weekLength);
              const doneInChunk = chunk.filter(cDay => challenge.completedDays.includes(cDay)).length;
              weeklyBreakdown.push({
                weekTitle: `Week ${Math.floor(i / weekLength) + 1}`,
                daysStr: chunk,
                doneCount: doneInChunk
              });
            }

            return (
              <div
                key={challenge.id}
                id={`challenge-${challenge.id}`}
                className="bg-zinc-950/80 border border-zinc-850/80 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden"
              >
                {/* Background ambient lighting accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />

                {/* DYNAMIC COMPREHENSIVE CARD HEADER */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-zinc-850 pb-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 bg-gold-400/10 border border-gold-400/20 text-gold-400 text-[9px] font-mono rounded uppercase tracking-wider">
                        {challenge.durationType ? `${challenge.durationType} Days Blueprint` : `${totalDaysCount} Days Duration`}
                      </span>
                      <span className="text-zinc-600 font-mono text-[10px]">|</span>
                      <span className="text-zinc-400 text-[10px] font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-650" />
                        {challenge.startDate} to {challenge.endDate}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-zinc-100 tracking-tight leading-snug">
                      {challenge.name}
                    </h3>
                  </div>

                  {/* Actions & Delete Control */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                    <button
                      id={`delete-${challenge.id}`}
                      onClick={() => handleDeleteChallenge(challenge.id, challenge.name)}
                      className="p-2.5 bg-zinc-900 hover:bg-red-950/30 text-zinc-500 hover:text-red-400 rounded-xl border border-zinc-850 hover:border-red-900/40 transition-all cursor-pointer"
                      title="Decommission Challenge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* THE PROFESSIONAL PLAYER XP STATS & LEVEL CARD GRID (GAMIFICATION ENGINE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Streak Card */}
                  <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400">
                      <Flame className="w-5 h-5 fill-orange-500/10" />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-mono text-zinc-550 leading-none">Continuous Streak</div>
                      <div className="font-display font-bold text-lg text-zinc-200 mt-1">
                        {consecutiveStreak} <span className="text-xs font-normal text-zinc-500">Days Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Player Level */}
                  <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold-400/15 border border-gold-400/20 flex items-center justify-center text-gold-400 shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase font-mono text-zinc-550 leading-none">Discipline Rank</div>
                        <div className="font-display font-bold text-sm text-zinc-200 mt-1 truncate">
                          Lvl {level} · <span className="text-[10px] text-gold-400 uppercase font-mono">{badge}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 mb-1">
                        <span>XP Progress</span>
                        <span>{xp} XP Total</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-400" style={{ width: `${progressToNextLevel}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Percentage Finished */}
                  <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-mono text-zinc-550 leading-none">Timeline Completed</div>
                      <div className="font-display font-bold text-lg text-zinc-200 mt-1">
                        {progressVal}% <span className="text-[10px] font-normal text-emerald-400">({completedDaysCount} / {totalDaysCount} Days)</span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements Badge Card */}
                  <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase font-mono text-zinc-550 leading-none">Unlocked Badges</div>
                      <div className="text-xs font-mono text-zinc-400 mt-1 truncate">
                        {challenge.achievements ? challenge.achievements.join(', ') : 'None'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLUEPRINT BULLETS PANELS (GOALS, HABITS, AND REWARDS DETAILS) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Goals Panel */}
                  <div className="bg-zinc-900/20 border border-zinc-850 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" /> High-Level Goals
                    </h4>
                    {challenge.goals && challenge.goals.length > 0 ? (
                      <ul className="space-y-1 text-xs text-zinc-400">
                        {challenge.goals.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-gold-500/70 select-none">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-zinc-650">No goals declared in the blueprint.</p>
                    )}
                  </div>

                  {/* Habits Panel */}
                  <div className="bg-zinc-900/20 border border-zinc-850 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" /> Daily Habit Protocols
                    </h4>
                    {challenge.habits && challenge.habits.length > 0 ? (
                      <ul className="space-y-1 text-xs text-zinc-400">
                        {challenge.habits.map((h, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-amber-500/70 select-none">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-zinc-650">No habits declared during setup.</p>
                    )}
                  </div>

                  {/* Rewards Panel */}
                  <div className="bg-zinc-900/20 border border-zinc-850 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5" /> Established Rewards
                    </h4>
                    {challenge.rewards && challenge.rewards.length > 0 ? (
                      <ul className="space-y-1 text-xs text-zinc-400">
                        {challenge.rewards.map((r, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-purple-500/70 select-none">🏆</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-zinc-650">No reward checkpoints defined.</p>
                    )}
                  </div>

                </div>

                {/* MOTIVATIONAL DYNAMIC INSTRUCTION NOTE */}
                <div className="bg-[#15130f] border border-amber-950/20 rounded-xl p-4 flex gap-3">
                  <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gold-400 uppercase font-mono">Discipline Coach Directive</h5>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {progressVal === 0 ? "Welcome to step 1. Check in today's bubble to activate your active tracker! Commit no mistakes." : ""}
                      {progressVal > 0 && progressVal < 50 ? "Excellent initial phase. Maintain consistency to unlock the 'Discipline Overlord' level badge! If you miss a clean day, your streak metrics will reflect it." : ""}
                      {progressVal >= 50 && progressVal < 100 ? "You have broken the 50% barrier! People are noticing the commitment and skin improvements. Keep pushing to the absolute finish line!" : ""}
                      {progressVal === 100 ? "VICTORY! You have completed the absolute duration successfully. Collect your established milestone rewards and spawn a new challenge!" : ""}
                    </p>
                  </div>
                </div>

                {/* DYNAMIC TIMELINE MATRIX WITH INTERACTIVE CALENDAR BUBBLES */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span>TIMELINE CALENDAR FLOW</span>
                    <span>Click bubble to check-in that day · {activeDay === getTodayStr() ? "Today is selected" : `Viewing ${formatDayLabel(activeDay)}`}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-10 gap-2">
                    {daysInChallenge.map((day, idx) => {
                      const isCompleted = challenge.completedDays.includes(day);
                      const isSelected = activeDay === day;
                      const isToday = day === getTodayStr();

                      return (
                        <div
                          key={day}
                          onClick={() => {
                            // Set this day as active for tasks viewing
                            setSelectedDayMap(prev => ({ ...prev, [challenge.id]: day }));
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all duration-250 relative ${
                            isSelected 
                              ? 'ring-2 ring-gold-500/50 scale-102 border-gold-400 z-10' 
                              : ''
                          } ${
                            isCompleted
                              ? 'bg-gold-500/5 border-gold-400/25 text-gold-400 shadow-[0_0_6px_rgba(226,179,7,0.03)]'
                              : 'bg-zinc-900/30 border-zinc-850/80 hover:border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {/* Today indicators */}
                          {isToday && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold-400 rounded-full animate-ping" />
                          )}

                          <span className="text-[9px] uppercase font-bold font-mono tracking-wider">Day {idx + 1}</span>
                          <span className="text-[8px] opacity-65 font-mono leading-none">{formatDayLabel(day)}</span>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid changes to selection state
                              handleToggleDay(challenge.id, day);
                            }}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all mt-1 ${
                              isCompleted 
                                ? 'bg-gold-400 text-zinc-950 scale-110' 
                                : 'border border-zinc-850 hover:border-zinc-700 bg-zinc-950'
                            }`}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* GENETIC CORE APP LINKED STATS */}
                {(challenge.integratedWaterGoal || challenge.integratedHabitsGoal || challenge.integratedFaithGoal || challenge.integratedCameraGoal || challenge.integratedAlarmGoal) && (
                  <div className="bg-zinc-950 border border-zinc-850/80 p-5 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                      <Sparkles className="w-4 h-4 text-gold-400" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          DNA Integrated Cross-App Targets ({activeDay === getTodayStr() ? "Live States" : "Past Metrics"})
                        </h4>
                        <p className="text-[10px] text-zinc-500">Live synchronization with other grooming & self-care panels</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {/* 1. Water Tracker */}
                      {challenge.integratedWaterGoal && (
                        <div className="bg-[#121214] border border-zinc-900 p-3.5 rounded-xl space-y-2 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-bold text-sky-400">💧 Water Target</span>
                            {water && water.count >= water.goal ? (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">Completed</span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">Pending</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-300">
                              {water ? `${water.count} / ${water.goal} glasses` : "0 / 8 glasses"}
                            </p>
                            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                                style={{ width: water ? `${Math.min(100, (water.count / water.goal) * 100)}%` : '0%' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. Daily Habits */}
                      {challenge.integratedHabitsGoal && (
                        <div className="bg-[#121214] border border-zinc-900 p-3.5 rounded-xl space-y-2 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-400">⚡ Core Habits</span>
                            {habits && habits.filter(h => h.completed).length === habits.length ? (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">100% Mastered</span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">In Progress</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-300">
                              {habits ? `${habits.filter(h => h.completed).length} / ${habits.length} Done` : "0 Completed"}
                            </p>
                            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                                style={{ width: habits ? `${(habits.filter(h => h.completed).length / habits.length) * 100}%` : '0%' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. Faith duties */}
                      {challenge.integratedFaithGoal && (
                        <div className="bg-[#121214] border border-zinc-900 p-3.5 rounded-xl space-y-2 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-bold text-blue-400">🕌 Spiritual Duty</span>
                            {faith && (faith.fajr && faith.zohor && faith.achr && faith.magrib && faith.esha) ? (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">All Prayers</span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">Prayers Active</span>
                            )}
                          </div>
                          <div className="space-y-1 text-xs text-zinc-300 font-medium">
                            <p className="truncate">
                              🕌 Prayers: {faith ? [faith.fajr, faith.zohor, faith.achr, faith.magrib, faith.esha].filter(Boolean).length : 0} / 5
                            </p>
                            <p className="text-[9.5px] text-zinc-500 font-mono">Dhikr count: {faith ? faith.dhikrCount : 0}</p>
                          </div>
                        </div>
                      )}

                      {/* 4. Face Scan Diary */}
                      {challenge.integratedCameraGoal && (
                        <div className="bg-[#121214] border border-zinc-900 p-3.5 rounded-xl space-y-2 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">📸 Face Photo Log</span>
                            {photos && photos.some(p => p.date === activeDay) ? (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">Uploaded</span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">Needed</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {photos && photos.some(p => p.date === activeDay) ? (
                              <img 
                                src={photos.find(p => p.date === activeDay)?.imageBase64} 
                                alt="Face scan preview" 
                                className="w-10 h-10 object-cover rounded-lg border border-zinc-800"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center text-zinc-650 font-mono text-[9px]">
                                No img
                              </div>
                            )}
                            <p className="text-[11px] text-zinc-400 leading-tight">
                              {photos && photos.some(p => p.date === activeDay) 
                                ? "Daily Look Logged successfully." 
                                : "Take a Face Scan in Full Looksmaxing section to complete."
                              }
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 5. Sunrise Alarm */}
                      {challenge.integratedAlarmGoal && (
                        <div className="bg-[#121214] border border-zinc-900 p-3.5 rounded-xl space-y-2 relative overflow-hidden group">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-bold text-rose-400">🌅 Sunrise Alarm</span>
                            {alarm && alarm.enabled ? (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">Active</span>
                            ) : (
                              <span className="text-[9px] bg-zinc-500/10 text-zinc-550 px-1.5 py-0.5 rounded-md font-bold uppercase font-mono">Disabled</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-300">
                              Wake time: {alarm ? alarm.time : "06:00"}
                            </p>
                            <p className="text-[9.5px] text-zinc-500 font-mono">
                              Countdown Math Lock Enabled
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ASSESSMENT BUTTON FOR THE CORRESPONDING DAY */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9.5px] text-zinc-500 font-mono">
                        DNA Validation Status: {challenge.completedDays.includes(activeDay) ? "Evaluated" : "Awaiting check-in"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyingChallenge(challenge);
                          setVerifyingDay(activeDay);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-gold-600/20 to-amber-500/10 hover:from-gold-600/30 hover:to-amber-500/20 text-gold-400 border border-gold-400/30 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5" /> Show Result Assessment
                      </button>
                    </div>
                  </div>
                )}

                {/* THE AMAZING INTERACTIVE DAILY TASKS BLUEPRINT (LINKED TO SELECTED DAY) */}
                {challenge.dailyTasks && challenge.dailyTasks.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-850/70 p-5 rounded-2xl space-y-4 shadow-inner">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-gold-400" /> 
                          Daily Task Checklist for: <span className="text-gold-400 font-mono text-[11px] font-medium">{formatDayLabel(activeDay)}</span>
                        </h4>
                        <p className="text-[10px] text-zinc-500">Completing individual daily tasks yields +20 XP point boosts!</p>
                      </div>

                      <div className="text-[10px] text-zinc-500 font-mono">
                        {challenge.completedDays.includes(activeDay) ? (
                          <span className="text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Day is fully checked
                          </span>
                        ) : (
                          <span className="text-zinc-500">Day status: Incomplete</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {challenge.dailyTasks.map(task => {
                        const isTaskDone = task.completedDays.includes(activeDay);
                        return (
                          <label
                            key={task.id}
                            className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                              isTaskDone 
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 line-through decoration-zinc-700'
                                : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isTaskDone}
                              onChange={() => handleToggleDailyTask(challenge.id, task.id, activeDay)}
                              className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 bg-zinc-950 border-zinc-850 cursor-pointer accent-gold-500"
                            />
                            <span className="text-xs">{task.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WEEKLY BREAKDOWN METRICS REPORT (VISUAL STAT TABLE) */}
                <div className="bg-zinc-900/10 border border-zinc-900 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span>Weekly Analytics & Development Reports</span>
                    <span className="text-gold-400 font-bold">Progress Rate Tracker</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weeklyBreakdown.map((week, idx) => {
                      const percent = week.daysStr.length > 0 ? Math.round((week.doneCount / week.daysStr.length) * 100) : 0;
                      return (
                        <div key={idx} className="bg-zinc-950/40 border border-zinc-900 p-3.5 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-zinc-300 uppercase font-mono">{week.weekTitle}</span>
                            <span className="font-mono text-zinc-400">{week.doneCount} / {week.daysStr.length} Days</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-500 to-gold-400 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="font-mono text-[10px] font-semibold text-gold-400 w-8 text-right">{percent}%</span>
                          </div>

                          <div className="text-[10px] text-zinc-600 font-mono truncate">
                            Span: {formatDayLabel(week.daysStr[0])} - {formatDayLabel(week.daysStr[week.daysStr.length - 1])}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ADVANCED MILESTONES (TRACKING SECTIONS ACHIEVED) */}
                {challenge.milestones && challenge.milestones.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-550">Blueprint Milestones</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {challenge.milestones.map(m => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                            m.achieved 
                              ? 'bg-zinc-90 w-full bg-gold-400/5 border-gold-400/20 text-gold-300' 
                              : 'bg-zinc-900/30 border-zinc-900 text-zinc-500'
                          }`}
                        >
                          <Trophy className={`w-4 h-4 shrink-0 ${m.achieved ? 'text-gold-400' : 'text-zinc-700'}`} />
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold font-mono uppercase tracking-wider">Day {m.dayIndex + 1} Target</div>
                            <div className="text-xs truncate">{m.title}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* RESULT ASSESSMENT MODAL */}
      <AnimatePresence>
        {verifyingChallenge && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0b0b0d] border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-6"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/20 border-b border-zinc-850 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-black tracking-widest text-gold-400">📊 DAILY RESULT ASSESSMENT</span>
                  <h3 className="text-sm font-display font-bold uppercase tracking-wider text-zinc-100">{verifyingChallenge.name}</h3>
                  <p className="text-[10px] text-zinc-550 font-mono">Performance evaluation for: {formatDayLabel(verifyingDay)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyingChallenge(null)}
                  className="p-1 text-zinc-500 hover:text-zinc-200 border border-zinc-900 rounded-lg bg-zinc-950/80 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="px-6 space-y-5">
                <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-gold-400" /> Assessment Checklist
                  </h4>

                  <div className="space-y-3">
                    {/* Water */}
                    {verifyingChallenge.integratedWaterGoal && (
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <span className="text-xs text-zinc-400">💧 Hydration target reached:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-zinc-200">
                            {water ? `${water.count} / ${water.goal} gl` : "0 / 8 glasses"}
                          </span>
                          {water && water.count >= water.goal ? (
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Success</span>
                          ) : (
                            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase">Unverified</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Habits */}
                    {verifyingChallenge.integratedHabitsGoal && (
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <span className="text-xs text-zinc-400">⚡ Daily 6 core habits completed:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-zinc-200">
                            {habits ? `${habits.filter(h => h.completed).length} / ${habits.length}` : "0 Completed"}
                          </span>
                          {habits && habits.filter(h => h.completed).length === habits.length ? (
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Success</span>
                          ) : (
                            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase">Unverified</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Faith */}
                    {verifyingChallenge.integratedFaithGoal && (
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <span className="text-xs text-zinc-400">🕌 Spiritual Fajr, Prayers, Dhikr:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-zinc-200">
                            {faith ? `${[faith.fajr, faith.zohor, faith.achr, faith.magrib, faith.esha].filter(Boolean).length} / 5 Prayers` : "0 Prayers"}
                          </span>
                          {faith && faith.fajr && faith.esha ? (
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Verified</span>
                          ) : (
                            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase">Active</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Camera */}
                    {verifyingChallenge.integratedCameraGoal && (
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <span className="text-xs text-zinc-400">📸 Daily Face Photo Logged:</span>
                        <div className="flex items-center gap-2">
                          {photos && photos.some(p => p.date === verifyingDay) ? (
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Verified</span>
                          ) : (
                            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase">Pending</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Alarm */}
                    {verifyingChallenge.integratedAlarmGoal && (
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs text-zinc-400">🌅 Sunrise Morning Alarm solved:</span>
                        <div className="flex items-center gap-2">
                          {alarm && alarm.enabled ? (
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Active</span>
                          ) : (
                            <span className="text-[9px] font-mono bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-bold uppercase">Off</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-2 py-2">
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    Excellent progress! After completion, save these scores and submit this validation certificate to earn additional +50 XP and 20 Points.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-zinc-950 border-t border-zinc-850 flex gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyingChallenge(null)}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Dismiss Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onEarnPoints) {
                      onEarnPoints(50, `Completed daily alignment validation certificate for ${formatDayLabel(verifyingDay)}! 🏆`);
                    }
                    triggerNotification("🏆 Assessment Certificate Approved", "You earned +50 XP and 20 Points for completing cross-app discipline verification!");
                    setVerifyingChallenge(null);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-zinc-950 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Approve & Earn Points
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
