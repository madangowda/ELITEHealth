
import React from 'react';
import { DailyLog, Macros } from '../types';
import { calculateMacros, calculateExerciseBurn, calculateDailyScore } from '../utils';
import { DAILY_TARGETS, MEAL_PLAN, WORKOUT_PLAN } from '../constants';
import { CheckCircle2, Flame, Droplets, Footprints, Clock, Utensils, Dumbbell, Zap, Target, Repeat, Layers } from 'lucide-react';

interface DaySummaryProps {
  log: DailyLog;
  // Added tdee prop to fix calculateDailyScore argument count error
  tdee: number;
  onClose?: () => void;
}

const DaySummary: React.FC<DaySummaryProps> = ({ log, tdee, onClose }) => {
  const macros = calculateMacros(log);
  const burn = calculateExerciseBurn(log);
  // Fixed: Passed tdee as the third argument to calculateDailyScore
  const score = calculateDailyScore(log, macros, tdee);
  const dayName = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const d = new Date(log.date);
  const dayIndex = d.getDay();
  const adjustedIndex = (dayIndex + 6) % 7;
  const workout = WORKOUT_PLAN[adjustedIndex];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{dayName}</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Full Performance Audit</p>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl px-5 py-2 flex flex-col items-center shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Score</span>
          <span className="text-xl font-black">{score.toFixed(1)}</span>
        </div>
      </div>

      {/* Energy Balance */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-500">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Net Energy</span>
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

      {/* Macro Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryMacro label="Protein" val={macros.protein} target={DAILY_TARGETS.protein} unit="g" color="text-blue-600" bg="bg-blue-50" />
        <SummaryMacro label="Carbs" val={macros.carbs} target={DAILY_TARGETS.carbs} unit="g" color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryMacro label="Fat" val={macros.fat} target={DAILY_TARGETS.fat} unit="g" color="text-amber-600" bg="bg-amber-50" />
        <SummaryMacro label="Fiber" val={macros.fiber} target={DAILY_TARGETS.fiber} unit="g" color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      {/* Meals Summary */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Utensils size={16} className="text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nutrient Sources</h3>
        </div>
        <div className="space-y-3">
          {MEAL_PLAN.map(cat => {
            const selectedId = log.meals[cat.id as keyof DailyLog['meals']] as string;
            const option = cat.options.find(o => o.id === selectedId);
            if (!option) return null;
            return (
              <div key={cat.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{cat.label.split(' ')[0]}</span>
                  <span className="text-xs font-bold text-slate-800">{option.name}</span>
                  <span className="text-[10px] font-medium text-slate-400 italic mt-0.5">{option.quantity}</span>
                </div>
                <div className="text-right">
                    <span className="block text-xs font-black text-slate-900">{option.kcal} kcal</span>
                    <div className="flex gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                        <span>P: {option.protein}g</span>
                        <span>C: {option.carbs}g</span>
                    </div>
                </div>
              </div>
            );
          })}
          {log.meals.custom?.map((entry, i) => (
            <div key={`c-${i}`} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">AI Log</span>
                <span className="text-xs font-bold text-slate-800">{entry.name}</span>
                {entry.macros.grams && (
                    <span className="text-[10px] font-medium text-slate-400 italic mt-0.5">{entry.macros.grams}g serving</span>
                )}
              </div>
              <div className="text-right">
                <span className="block text-xs font-black text-indigo-600">{entry.macros.kcal} kcal</span>
                <div className="flex gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                    <span>P: {entry.macros.protein}g</span>
                    <span>C: {entry.macros.carbs}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-blue-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Physical Execution</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
              <Footprints size={20} />
            </div>
            <div>
              <span className="block text-[9px] font-black text-white/40 uppercase tracking-tighter">Walking</span>
              <span className="text-sm font-black">{log.walkingMinutes} min</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-cyan-400">
              <Droplets size={20} />
            </div>
            <div>
              <span className="block text-[9px] font-black text-white/40 uppercase tracking-tighter">Hydration</span>
              <span className="text-sm font-black">{log.waterIntakeMl / 1000}L</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest">Completed Routine Details</h4>
          <div className="space-y-3">
            {workout.exercises.filter(ex => log.completedExercises.includes(ex.id)).length > 0 ? (
                workout.exercises.filter(ex => log.completedExercises.includes(ex.id)).map(ex => (
                    <div key={ex.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-white tracking-tight">{ex.name}</h5>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{ex.equipment}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <Layers size={12} className="text-blue-400 mx-auto mb-1" />
                                <span className="block text-[10px] font-black leading-none">{ex.sets}</span>
                                <span className="text-[7px] text-white/40 uppercase font-black">Sets</span>
                            </div>
                            <div className="text-center">
                                <Repeat size={12} className="text-cyan-400 mx-auto mb-1" />
                                <span className="block text-[10px] font-black leading-none">{ex.reps}</span>
                                <span className="text-[7px] text-white/40 uppercase font-black">Reps</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-[10px] text-white/30 italic">No exercises logged for this day.</p>
            )}
          </div>
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
