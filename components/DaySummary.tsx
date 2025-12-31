
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
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Full Performance Audit</p>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl px-5 py-2 flex flex-col items-center shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Score</span>
          <span className="text-xl font-black">{score.toFixed(1)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Net Energy Card */}
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

        {/* Weight Card */}
        {log.weight && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-500">
                <Scale size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Recorded Weight</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {log.weight} <span className="text-sm text-slate-400">kg</span>
              </div>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
              Check-In Done
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SummaryMacro label="Protein" val={macros.protein} target={DAILY_TARGETS.protein} unit="g" color="text-blue-600" bg="bg-blue-50" />
        <SummaryMacro label="Carbs" val={macros.carbs} target={DAILY_TARGETS.carbs} unit="g" color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryMacro label="Fat" val={macros.fat} target={DAILY_TARGETS.fat} unit="g" color="text-amber-600" bg="bg-amber-50" />
        <SummaryMacro label="Fiber" val={macros.fiber} target={DAILY_TARGETS.fiber} unit="g" color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      {/* Hydration Audit */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Droplets size={16} className="text-blue-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hydration Audit</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-2xl font-black text-slate-900">{log.waterIntakeMl || 0} <span className="text-xs text-slate-400">ml</span></span>
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {log.waterIntakeMl >= 3000 ? 'Optimized' : 'Incomplete'}</span>
          </div>
          <div className="w-32 h-2 bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (log.waterIntakeMl / 3000) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Diet Audit */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Utensils size={16} className="text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nutrient Sources</h3>
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
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{cat.label.split(' ')[0]} (x{qty})</span>
                  <span className="text-xs font-bold text-slate-800">{option.name}</span>
                  <span className="text-[10px] font-medium text-slate-400 italic mt-0.5">{option.quantity} base</span>
                </div>
                <div className="text-right">
                    <span className="block text-xs font-black text-slate-900">{Math.round(option.kcal * qty)} kcal</span>
                    <div className="flex gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                        <span>P: {Math.round(option.protein * qty)}g</span>
                        <span>C: {Math.round(option.carbs * qty)}g</span>
                    </div>
                </div>
              </div>
            );
          })}
          {log.meals.custom?.map((entry, i) => (
            <div key={`c-${i}`} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">Manual (x{entry.qty})</span>
                <span className="text-xs font-bold text-slate-800">{entry.name}</span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-black text-indigo-600">{Math.round(entry.macros.kcal * entry.qty)} kcal</span>
                <div className="flex gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                    <span>P: {Math.round(entry.macros.protein * entry.qty)}g</span>
                    <span>C: {Math.round(entry.macros.carbs * entry.qty)}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplement Audit */}
      {scheduledSupps.length > 0 && (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill size={16} className="text-indigo-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplement Protocol</h3>
          </div>
          <div className="space-y-3">
            {scheduledSupps.map(s => {
              const completed = takenSupps.includes(s.id);
              return (
                <div key={s.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={completed ? 'text-emerald-500' : 'text-slate-200'}>
                      {completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.timing} stack</span>
                      <span className={`text-xs font-bold ${completed ? 'text-slate-800' : 'text-slate-400'}`}>{s.name}</span>
                      <span className="text-[10px] font-medium text-slate-500">{s.dose}</span>
                    </div>
                  </div>
                  {completed && (
                    <div className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded">Ingested</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercise Audit */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell size={16} className="text-orange-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Workout Protocol</h3>
        </div>
        <div className="space-y-3">
          {workout.exercises.map(ex => {
            const completed = log.completedExercises.includes(ex.id);
            if (!completed) return null;
            const kcalBurn = Math.round(ex.kcalPerUnit * (ex.unit === 'second' ? 40 : 1) * ex.sets);
            
            return (
              <div key={ex.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{ex.equipment}</span>
                  <span className="text-xs font-bold text-slate-800">{ex.name}</span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">{ex.sets} Sets × {ex.reps}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-black text-orange-600">-{kcalBurn} kcal</span>
                </div>
              </div>
            );
          })}
          {log.customExercises?.map((ex) => (
            <div key={ex.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Sparkles size={8} className="text-blue-500" />
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">AI / Custom</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{ex.name}</span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">{ex.sets} × {ex.reps}</span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-black text-orange-600">-{ex.kcalBurn} kcal</span>
              </div>
            </div>
          ))}
          {log.walkingMinutes > 0 && (
            <div className="flex justify-between items-center py-3 border-t border-slate-50 mt-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Cardio</span>
                <span className="text-xs font-bold text-slate-800">Fast Walking</span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">{log.walkingMinutes} Minutes</span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-black text-orange-600">-{log.walkingMinutes * 5} kcal</span>
              </div>
            </div>
          )}
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
