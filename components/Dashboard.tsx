
import React, { useState, useMemo, useEffect } from 'react';
import { DailyLog, Macros, WeightEntry, UserProfile } from '../types';
import { calculateTDEE, calculateBMR, getScheduledSupplements, getISTDateInfo } from '../utils';
import DaySummary from './DaySummary';
import { Zap, Flame, Footprints, Droplets, Activity, ClipboardList, ChevronLeft, Sparkles, TrendingDown, ChevronRight, ShieldCheck, WifiOff, HardDrive, Wifi, CheckCircle2, Utensils, Dumbbell, ShieldAlert, AlertTriangle, Clock, Target, Info, Pill } from 'lucide-react';

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const currentWeight = log.weight || (weights.length > 0 ? weights[weights.length - 1].weight : 92);
  const bmr = useMemo(() => calculateBMR(profile, currentWeight), [profile, currentWeight]);
  const net = Math.round(macros.kcal - burn);

  const scheduledSupps = getScheduledSupplements(log.date);
  const takenSuppsCount = (log.takenSupplements || []).length;
  const adherenceColor = takenSuppsCount === scheduledSupps.length && scheduledSupps.length > 0 ? 'text-emerald-400' : takenSuppsCount > 0 ? 'text-amber-400' : 'text-slate-500';

  // Dynamic Reminders based on Indian Time
  const ist = getISTDateInfo();
  const dynamicAdvice = useMemo(() => {
    const isMorning = ist.hour >= 7 && ist.hour < 11;
    const isNight = ist.hour >= 20;
    
    if (isMorning) {
      if (ist.day === 0) return "Today is SuperD3 day – take after a fat-rich breakfast. No empty stomach.";
      if (ist.day === 1 || ist.day === 4) return "Himalayan Organics B12 scheduled. Time for morning supplements.";
      return "Morning protocol active: Omega-3 and Folate after breakfast.";
    }
    if (isNight) {
      return "Time for night stack: Tata 1mg Magnesium & Ashwagandha for deep recovery.";
    }
    return `Metabolic precision stable at ${net} kcal net. All protocol rules must be strictly followed.`;
  }, [ist, net]);

  if (showTodaySummary) {
    return (
      <div className="p-6 space-y-6 pb-24 bg-slate-50 text-slate-900 min-h-screen animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowTodaySummary(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black tracking-tight">Protocol Audit</h1>
        </div>
        <DaySummary log={log} tdee={1950} profile={profile} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
               <HardDrive size={10} className="text-emerald-400" />
               <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Vault Secure</span>
             </div>
             {isOnline ? (
               <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                 <Wifi size={10} className="text-blue-400" />
                 <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">AI Sync</span>
               </div>
             ) : (
               <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                 <WifiOff size={10} className="text-amber-400" />
                 <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Offline</span>
               </div>
             )}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Coach Alpha</h1>
        </div>
        <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/20">
          <span className="text-[8px] font-black uppercase opacity-70">Score</span>
          <span className="text-xl font-black">{score.toFixed(1)}</span>
        </div>
      </div>

      {/* Main Metabolic HUD */}
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
            <div className={`text-xl font-black ${1950 - net > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {1950 - net > 0 ? `+${1950 - net}` : 1950 - net} <span className="text-[8px] block text-right opacity-50 uppercase">Delta</span>
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

      {/* Supplement Shield Status Card */}
      <div className="stealth-card rounded-[32px] p-6 border-indigo-500/20 shadow-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
              <Pill size={24} />
            </div>
            <div>
              <h4 className="text-base font-black text-white leading-none">Supplement Shield</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                Adherence: <span className={adherenceColor}>{takenSuppsCount} / {scheduledSupps.length} Taken</span>
              </p>
            </div>
          </div>
          {takenSuppsCount === scheduledSupps.length && scheduledSupps.length > 0 && (
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          )}
        </div>
      </div>

      {/* Integrated Autonomous Intelligence */}
      <div className="bg-[#1e1b4b] rounded-[40px] border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-start gap-5">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Autonomous Intelligence</h4>
            <p className="text-xs text-slate-300 font-bold leading-relaxed">
              {dynamicAdvice}
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 mb-2">
             <ShieldAlert size={14} className="text-rose-500" />
             <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Directives</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { rule: "Fruit OR Salad", detail: "Never both", icon: <Utensils size={14}/>, color: "text-blue-400" },
              { rule: "Snack Slots", detail: "Strict timing", icon: <Clock size={14}/>, color: "text-emerald-400" },
              { rule: "3 tsp Oil Max", detail: "Daily limit", icon: <Flame size={14}/>, color: "text-amber-400" },
              { rule: "Goat Meat", detail: "Max 2x / Week", icon: <AlertTriangle size={14}/>, color: "text-rose-400" },
              { rule: "Zero Juice", detail: "Whole fruit only", icon: <Droplets size={14}/>, color: "text-indigo-400" },
              { rule: "Late Carbs", detail: "Strict black-out", icon: <Zap size={14}/>, color: "text-amber-400" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className={item.color}>{item.icon}</div>
                <div>
                  <span className="block text-[10px] font-black text-slate-100 uppercase tracking-tight leading-none mb-1">{item.rule}</span>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">{item.detail}</span>
                </div>
              </div>
            ))}
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
