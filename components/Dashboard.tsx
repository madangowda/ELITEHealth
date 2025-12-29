
import React, { useState, useMemo } from 'react';
import { DailyLog, Macros, WeightEntry, UserProfile } from '../types';
import { calculateTDEE, calculateBMR } from '../utils';
import DaySummary from './DaySummary';
import { Zap, Flame, Footprints, Droplets, Activity, ClipboardList, ChevronLeft, Sparkles, TrendingDown, ChevronRight, ShieldCheck, WifiOff } from 'lucide-react';

interface DashboardProps {
  log: DailyLog;
  macros: Macros;
  burn: number;
  score: number;
  advice: string | null;
  weights: WeightEntry[];
  updateLog: (updated: Partial<DailyLog>) => void;
  openSettings: () => void;
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  log, macros, burn, score, weights, updateLog, profile 
}) => {
  const [showTodaySummary, setShowTodaySummary] = useState(false);
  const isOnline = navigator.onLine;

  const currentWeight = log.weight || (weights.length > 0 ? weights[weights.length - 1].weight : 92);
  const bmr = useMemo(() => calculateBMR(profile, currentWeight), [profile, currentWeight]);
  const deficit = 1950 - Math.round(macros.kcal - burn);

  if (showTodaySummary) {
    return (
      <div className="p-6 space-y-6 pb-24 bg-slate-50 text-slate-900 min-h-screen animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowTodaySummary(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black tracking-tight">Protocol Audit</h1>
        </div>
        <DaySummary log={log} tdee={1950} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
             {!isOnline && <WifiOff size={12} className="text-amber-500" />}
             <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Local Node Active</h2>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Coach Alpha</h1>
        </div>
        <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/20">
          <span className="text-[8px] font-black uppercase opacity-70">Score</span>
          <span className="text-xl font-black">{score.toFixed(1)}</span>
        </div>
      </div>

      {/* Main HUD */}
      <div className="dark-hud rounded-[40px] p-8 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheck size={12} /> Metabolic Baseline
              </div>
              <div className="text-5xl font-black text-white tracking-tighter">
                {Math.round(bmr)} <span className="text-lg font-medium opacity-30 tracking-normal ml-1">BMR</span>
              </div>
            </div>
            <div className={`text-xl font-black ${deficit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {deficit > 0 ? `+${deficit}` : deficit} <span className="text-[8px] block text-right opacity-50 uppercase">Delta</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Intake Budget</span>
              <span className="text-sm font-black text-white">{Math.round(macros.kcal)} <span className="text-slate-600 font-bold">/ 1950</span></span>
            </div>
            <div className="progress-pill">
              <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full ${macros.kcal > 1950 ? 'bg-rose-500' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`} 
                style={{ width: `${Math.min(100, (macros.kcal / 1950) * 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stealth-card rounded-[32px] p-6 flex flex-col gap-4">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
            <Footprints size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active min</span>
            <div className="text-2xl font-black text-white">{log.walkingMinutes}</div>
          </div>
        </div>
        <div className="stealth-card rounded-[32px] p-6 flex flex-col gap-4">
          <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center">
            <Flame size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Burned kcal</span>
            <div className="text-2xl font-black text-white">{burn}</div>
          </div>
        </div>
      </div>

      {/* Water Tracking */}
      <button 
        onClick={() => updateLog({ waterIntakeMl: (log.waterIntakeMl || 0) + 250 })}
        className="w-full stealth-card rounded-[32px] p-6 flex items-center justify-between active:scale-95 transition-all"
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center">
            <Droplets size={24} />
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hydration</h4>
            <p className="text-2xl font-black text-white leading-none mt-1">{(log.waterIntakeMl || 0) / 1000}<span className="text-xs opacity-30 ml-1">L</span></p>
          </div>
        </div>
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
           <ChevronRight size={20} />
        </div>
      </button>

      {/* Intelligence */}
      <div className="bg-white/5 rounded-[32px] p-6 border border-white/5 flex items-start gap-5">
        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
          <Sparkles size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Autonomous Advice</h4>
          <p className="text-xs text-slate-400 font-bold leading-relaxed">
            Metabolic precision is stable. Current weight is {currentWeight}kg. Protocol suggests +10min cardio to offset {macros.kcal > 1900 ? 'excess' : 'current'} intake.
          </p>
        </div>
      </div>

      {/* Summary Trigger */}
      <button 
        onClick={() => setShowTodaySummary(true)}
        className="w-full dark-hud text-white py-6 rounded-[32px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 shadow-xl border border-white/10 active:scale-95 transition-all"
      >
        <ClipboardList size={20} />
        Full Protocol Audit
      </button>
    </div>
  );
};

export default Dashboard;
