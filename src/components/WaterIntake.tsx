import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Award, CheckCircle2, RefreshCw } from 'lucide-react';
import { WaterTracker } from '../types';
import { triggerNotification } from '../utils';

interface WaterIntakeProps {
  water: WaterTracker;
  setWater: React.Dispatch<React.SetStateAction<WaterTracker>>;
  onEarnPoints?: (amount: number, reason: string) => void;
}

export default function WaterIntake({ water, setWater, onEarnPoints }: WaterIntakeProps) {
  const currentGlasses = water.count;
  const goalGlasses = water.goal;
  const percentage = Math.min(Math.round((currentGlasses / goalGlasses) * 100), 100);

  const handleAddGlass = () => {
    setWater(prev => {
      const nextCount = prev.count + 1;
      
      // Notify at thresholds
      if (nextCount === prev.goal) {
        triggerNotification("💧 Fully Hydrated!", "You completed your 8 glasses goal today. Peak hydration lookmax achieved!");
        if (onEarnPoints) {
          onEarnPoints(30, "Target Hydration of 8 glasses approved! 💧");
        }
      } else {
        triggerNotification("💧 Glass Added", `Hydrated: ${nextCount}/${prev.goal} glasses.`);
        if (onEarnPoints) {
          onEarnPoints(5, "Glass of pure clear water added! 💧");
        }
      }

      return { ...prev, count: nextCount };
    });
  };

  const handleRemoveGlass = () => {
    setWater(prev => ({
      ...prev,
      count: Math.max(0, prev.count - 1)
    }));
  };

  const handleReset = () => {
    setWater(prev => ({
      ...prev,
      count: 0
    }));
  };

  return (
    <div id="water-intake" className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 glow-gold">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Droplet className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-display font-semibold text-lg text-zinc-100">Water Log</h3>
          </div>
          <p className="text-xs text-zinc-400">Aim for at least 8 glasses (2L) to purify skin cells and optimize blood volume.</p>
        </div>

        <button
          id="water-reset-btn"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-gold-400 font-mono transition-colors border border-zinc-800 hover:border-zinc-700/80 px-3 py-1.5 rounded-lg bg-zinc-950/20 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        
        {/* LIQUID WAVE DISPLAY CARD */}
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-950/40 border border-zinc-850 rounded-2xl relative overflow-hidden">
          
          {/* Wave fluid simulation */}
          <div className="h-40 w-24 border-3 border-zinc-800 rounded-2xl relative overflow-hidden bg-zinc-900/40 flex items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${percentage}%` }}
              className="w-full bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 flex items-center justify-center relative shadow-[0_0_12px_rgba(59,130,246,0.3)]"
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-40 animate-pulse pointer-events-none" />
              {percentage > 15 && (
                <span className="text-zinc-950 text-xs font-mono font-bold shrink-0 relative z-10 select-none">
                  {percentage}%
                </span>
              )}
            </motion.div>
          </div>

          <p className="text-xs font-mono text-zinc-500 mt-4 uppercase tracking-widest">Hydration Gauge</p>
        </div>

        {/* INCREMENT CONTROLLERS & GOAL INDICATOR */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">Completed Level</span>
              <span className="text-3xl font-display font-bold text-zinc-100">{currentGlasses} <span className="text-zinc-500 text-lg">/ {goalGlasses} glasses</span></span>
            </div>

            {/* VISUAL RANGE BAR */}
            <div className="w-full h-3.5 bg-zinc-90 w-full bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              id="water-increment-btn"
              onClick={handleAddGlass}
              className="flex-1 min-w-[120px] py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-zinc-950 font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.3)] cursor-pointer transition-all"
            >
              <Droplet className="w-4 h-4 text-zinc-950 shrink-0" />
              Drink Glass (+1)
            </button>
            <button
              id="water-decrement-btn"
              onClick={handleRemoveGlass}
              disabled={currentGlasses === 0}
              className="py-4 px-6 bg-zinc-900 border border-zinc-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono rounded-xl cursor-pointer transition-colors"
            >
              Undo Glass (-1)
            </button>
          </div>

          {/* HYDRO THRESHOLDS */}
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-gold-400/10 rounded-lg shrink-0">
              <Award className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-xs text-zinc-400">
              {percentage >= 100 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Perfect hydration achieved today! Clear skin is on the way.
                </span>
              ) : (
                <span>Drinking enough water prevents under-eye bags, enhances hollow-cheek definition, and improves workout recovery.</span>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
