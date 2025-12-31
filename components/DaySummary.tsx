import React from 'react';
import { DailyLog, Macros, MealEntry, UserProfile, Supplement } from '../types';
import { calculateMacros, calculateExerciseBurn, calculateDailyScore, getScheduledSupplements } from '../utils';
import { DAILY_TARGETS, MEAL_PLAN, WORKOUT_PLAN, HOME_GYM_WORKOUT_PLAN, SUPPLEMENTS } from '../constants';
import { CheckCircle2, Flame, Droplets, Footprints, Utensils, Dumbbell, Zap, Repeat, Layers, Sparkles, Pill, Scale, Circle, Clock } from 'lucide-react';

interface DaySummaryProps {
  log: DailyLog;
  tdee: number;
  profile: UserProfile;
}

const DaySummary: React.FC<DaySummaryProps> = ({ log, tdee, profile }) => {
  const macros = calculateMacros(log);
  const burn = calculateExerciseBurn(log, profile);
  const score = calculateDailyScore(log, macros, tdee, profile);
  const dayName = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const d = new Date(log.date);
  const dayIndex = d.getDay();
  const adjustedIndex = (dayIndex + 6) % 7;
  const plan = profile.workoutMode === 'homegym' ? HOME_GYM_WORKOUT_PLAN : WORKOUT_PLAN;
  const workout = plan[adjustedIndex];

  const scheduledSupps = getScheduledSupplements(log.date);
  const takenSupps = log.takenSupplements || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{dayName}</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Metabolic Protocol Audit</p>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl px-5 py-2 flex flex-col items-center shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Score</span>
          <span className="text-xl font-black">{score.toFixed(1)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-500">
              <Zap size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Net Energy (K)</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {Math.round(macros.kcal - burn)} <span className="text-sm text-slate-400">kcal</span>
            </div>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">In</span>
              <span className="text-sm font-black text-slate-700">{Math.round(macros.kcal)}</span>
            </div>
            <div>
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">Burn</span>
              <span className="text-sm font-black text-emerald-500">-{burn}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SummaryMacro label="P" val={macros.protein} target={DAILY_TARGETS.protein} unit="g" color="text-blue-600" bg="bg-blue-50" />
        <SummaryMacro label="C" val={macros.carbs} target={DAILY_TARGETS.carbs} unit="g" color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryMacro label="F" val={macros.fat} target={DAILY_TARGETS.fat} unit="g" color="text-amber-600" bg="bg-amber-50" />
        <SummaryMacro label="Fi" val={macros.fiber} target={DAILY_TARGETS.fiber} unit="g" color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Utensils size={16} className="text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nutrient Logs</h3>
        </div>
        <div className="space-y-3">
          {MEAL_PLAN.map(cat => {
            const entry = log.meals[cat.id as keyof DailyLog['meals']] as MealEntry;
            if (!entry) return null;
            const option = cat.options.find(o => o.id === entry.id);
            if (!option) return null;
            const qty = entry.qty || 1;
            return (
              <div key={cat.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                <div className="flex flex-col min-w-0 pr-4">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{cat.label.split(' ')[0]}</span>
                  <span className="text-xs font-bold text-slate-800 truncate">{option.name}</span>
                </div>
                <div className="text-right shrink-0">
                    <span className="block text-xs font-black text-slate-900">{Math.round(option.kcal * qty)} K</span>
                    <div className="flex gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                        <span className="text-blue-500">P:{Math.round(option.protein * qty)}</span>
                        <span className="text-emerald-600">C:{Math.round(option.carbs * qty)}</span>
                        <span className="text-amber-600">F:{Math.round(option.fat * qty)}</span>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SummaryMacro: React.FC<{ label: string; val: number; target: number; unit: string; color: string; bg: string }> = ({ label, val, target, unit, color, bg }) => {
  const percent = Math.min(100, (val / target) * 100);
  return (
    <div className={`${bg} rounded-2xl p-4 border border-white flex flex-col items-center`}>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      <div className={`text-base font-black ${color}`}>
        {Math.round(val)}<span className="text-[10px] opacity-40">/{Math.round(target)}{unit}</span>
      </div>
      <div className="w-full h-1 bg-white/50 rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${color.replace('text', 'bg')} transition-all duration-700`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default DaySummary;