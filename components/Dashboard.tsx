
import React, { useState, useMemo } from 'react';
import { DailyLog, Macros, WeightEntry, AppNotification, UserProfile } from '../types';
import { calculateTDEE, calculateBMR } from '../utils';
import DaySummary from './DaySummary';
import { Zap, Target, Flame, Footprints, Info, Droplets, Trophy, X, Bell, Activity, CheckCircle, Settings, ClipboardList, ChevronLeft, Sparkles, TrendingDown } from 'lucide-react';

interface DashboardProps {
  log: DailyLog;
  macros: Macros;
  burn: number;
  score: number;
  advice: string | null;
  weights: WeightEntry[];
  updateLog: (updated: Partial<DailyLog>) => void;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  openSettings: () => void;
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  log, 
  macros, 
  burn, 
  score, 
  weights, 
  updateLog,
  notifications,
  setNotifications,
  profile
}) => {
  const [showTodaySummary, setShowTodaySummary] = useState(false);

  const currentWeight = log.weight || (weights.length > 0 ? weights[weights.length - 1].weight : 92);
  const bmr = useMemo(() => calculateBMR(profile, currentWeight), [profile, currentWeight]);
  const tdee = useMemo(() => calculateTDEE(profile, currentWeight), [profile, currentWeight]);
  
  const deficit = 1950 - Math.round(macros.kcal - burn);

  if (showTodaySummary) {
    return (
      <div className="p-5 space-y-6 pb-24 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => setShowTodaySummary(false)}
            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-sm active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Daily Audit</h1>
        </div>
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
          <DaySummary log={log} tdee={tdee} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-slate-400 font-medium text-xs uppercase tracking-widest">Command Center</h2>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Status Alpha</h1>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl px-5 py-2 flex flex-col items-center shadow-lg">
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Daily Score</span>
          <span className="text-xl font-bold leading-none mt-1">{score.toFixed(1)}</span>
        </div>
      </div>

      {/* Metabolic Base Card */}
      <div className="bg-slate-900 rounded-[32px] p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Basal Metabolic Rate</span>
              </div>
              <div className="text-4xl font-black">{Math.round(bmr)} <span className="text-sm opacity-40">kcal/day</span></div>
              <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest italic leading-tight">Calories burned doing NOTHING</p>
            </div>
            <div className="text-right">
               <div className={`text-xl font-black ${deficit > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                 {deficit > 0 ? `+${deficit}` : deficit}
               </div>
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Goal Delta</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Fuel Progress</span>
              <span>Intake: {Math.round(macros.kcal)} / 1950</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className={`h-full transition-all duration-1000 ${macros.kcal > 1950 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                style={{ width: `${Math.min(100, (macros.kcal / 1950) * 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-500">
              <span>Factor: 1.0 Baseline</span>
              <span className="text-emerald-400">Maintenance Zone</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Footprints size={18} />} label="Steps" val={`${log.walkingMinutes}m`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={<Flame size={18} />} label="Extra" val={`${burn}`} color="text-orange-600" bg="bg-orange-50" />
        <button 
          onClick={() => updateLog({ waterIntakeMl: (log.waterIntakeMl || 0) + 250 })}
          className="bg-white rounded-[28px] p-4 shadow-sm border border-slate-100 flex flex-col items-center active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-2">
            <Droplets size={20} />
          </div>
          <span className="text-lg font-black leading-none">{(log.waterIntakeMl || 0) / 1000}L</span>
          <span className="text-[9px] text-slate-400 font-black uppercase mt-1">Water</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-800">Metabolic Precision</h4>
          <p className="text-xs text-slate-500 font-medium">
            At a strict 1950 kcal intake (Factor 1), your weight remains stable at {currentWeight}kg with zero exercise.
          </p>
        </div>
      </div>

      <button 
        onClick={() => setShowTodaySummary(true)}
        className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all"
      >
        <ClipboardList size={20} />
        Audit Full Day
      </button>
    </div>
  );
};

const StatCard = ({ icon, label, val, color, bg }: any) => (
  <div className="bg-white rounded-[28px] p-4 shadow-sm border border-slate-100 flex flex-col items-center">
    <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-2`}>{icon}</div>
    <span className="text-lg font-black leading-none">{val}</span>
    <span className="text-[9px] text-slate-400 font-black uppercase mt-1">{label}</span>
  </div>
);

export default Dashboard;
