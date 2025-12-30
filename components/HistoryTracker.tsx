
import React, { useState, useMemo } from 'react';
import { DailyLog, WeightEntry, UserProfile, MealEntry } from '../types';
import { getPastDays, calculateMacros, calculateDailyScore, calculateTDEE, calculateExerciseBurn, getISTDateString, getScheduledSupplements } from '../utils';
import { WORKOUT_PLAN, MEAL_PLAN } from '../constants';
import DaySummary from './DaySummary';
import { CalendarDays, ChevronRight, CheckCircle2, ChevronLeft, Dumbbell, Utensils, Zap, Sparkles, Pill } from 'lucide-react';

interface HistoryTrackerProps {
  logs: Record<string, DailyLog>;
  weights: WeightEntry[];
  profile: UserProfile;
}

const HistoryTracker: React.FC<HistoryTrackerProps> = ({ logs, weights, profile }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const past30Days = useMemo(() => getPastDays(30), []);

  const getLogForDate = (date: string): DailyLog => {
    return logs[date] || {
      date,
      meals: {},
      completedExercises: [],
      customExercises: [],
      walkingMinutes: 0,
      waterIntakeMl: 0,
      takenSupplements: []
    };
  };

  const getWeightForDate = (date: string) => {
    return weights.find(w => w.date === date)?.weight;
  };

  const getWorkoutInfo = (date: string) => {
    const d = new Date(date);
    const dayIndex = d.getDay();
    const adjustedIndex = (dayIndex + 6) % 7;
    return WORKOUT_PLAN[adjustedIndex];
  };

  if (selectedDate) {
    const log = getLogForDate(selectedDate);
    const weightForDate = getWeightForDate(selectedDate) || 75;
    const tdeeForDate = calculateTDEE(profile, weightForDate);

    return (
      <div className="p-5 space-y-6 pb-24 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => setSelectedDate(null)}
            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-sm active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Day Detail</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Timeline Review</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100">
          <div className="p-4">
            <DaySummary log={log} tdee={tdeeForDate} profile={profile} />
          </div>
        </div>

        <button 
          onClick={() => setSelectedDate(null)}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-lg"
        >
          Return to Timeline
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 pb-24 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Timeline</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">30-Day Protocol Audit</p>
        </div>
        <div className="p-3 bg-white border border-slate-100 rounded-2xl text-blue-500 shadow-sm">
          <CalendarDays size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {past30Days.map((date) => {
          const log = getLogForDate(date);
          const weight = getWeightForDate(date);
          const workout = getWorkoutInfo(date);
          const macros = calculateMacros(log);
          const burn = calculateExerciseBurn(log, profile);
          
          const tdeeForDate = calculateTDEE(profile, weight || 75);
          const score = calculateDailyScore(log, macros, tdeeForDate, profile);
          
          const d = new Date(date);
          // Strictly IST aware "Today" highlighting
          const isToday = date === getISTDateString();
          
          const completedExNames = workout.exercises
            .filter(ex => log.completedExercises.includes(ex.id))
            .map(ex => ex.name);
          
          if (log.customExercises) {
            log.customExercises.forEach(ex => completedExNames.push(ex.name));
          }

          const eatenFoodNames: string[] = [];
          MEAL_PLAN.forEach(cat => {
            const entry = log.meals[cat.id as keyof DailyLog['meals']] as MealEntry | undefined;
            const selectedId = entry?.id;
            const option = cat.options.find(o => o.id === selectedId);
            if (option) eatenFoodNames.push(option.name);
          });
          if (log.meals.custom) {
            log.meals.custom.forEach(c => eatenFoodNames.push(c.name));
          }

          const scheduledSupps = getScheduledSupplements(date);
          const takenSuppsCount = (log.takenSupplements || []).length;

          const hasData = eatenFoodNames.length > 0 || completedExNames.length > 0 || log.walkingMinutes > 0 || takenSuppsCount > 0;

          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`w-full bg-white rounded-[32px] p-5 flex flex-col gap-4 border transition-all active:scale-[0.99] text-left ${
                isToday ? 'border-blue-200 shadow-md ring-4 ring-blue-50/50' : 'border-slate-100 shadow-sm hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                    hasData ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300'
                  }`}>
                    <span className="text-[9px] font-black uppercase leading-none mb-0.5">{d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                    <span className="text-base font-black leading-none">{d.getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-800">{isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h4>
                      {score >= 8 && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 items-center mt-1">
                       <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">In: {Math.round(macros.kcal)}</span>
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Burn: {burn}</span>
                       <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">Net: {Math.round(macros.kcal - burn)}</span>
                       {weight && <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">• {weight}kg</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-0.5">Daily Score</span>
                    <span className={`text-lg font-black leading-none ${score >= 7 ? 'text-emerald-500' : score >= 4 ? 'text-amber-500' : 'text-slate-300'}`}>
                      {score.toFixed(1)}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-slate-200" />
                </div>
              </div>

              {hasData && (
                <div className="space-y-3 pt-3 border-t border-slate-50">
                  {completedExNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <div className="w-5 h-5 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                        <Dumbbell size={10} strokeWidth={3} />
                      </div>
                      {completedExNames.slice(0, 4).map((name, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap">
                          {name}
                        </span>
                      ))}
                      {completedExNames.length > 4 && <span className="text-[9px] font-bold text-slate-400">+{completedExNames.length - 4}</span>}
                    </div>
                  )}

                  {eatenFoodNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <div className="w-5 h-5 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                        <Utensils size={10} strokeWidth={3} />
                      </div>
                      {eatenFoodNames.slice(0, 4).map((name, i) => (
                        <span key={i} className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap">
                          {name}
                        </span>
                      ))}
                      {eatenFoodNames.length > 4 && <span className="text-[9px] font-bold text-slate-400">+{eatenFoodNames.length - 4}</span>}
                    </div>
                  )}

                  <div className="flex gap-4">
                    {takenSuppsCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                          <Pill size={10} strokeWidth={3} />
                        </div>
                        <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">
                          {takenSuppsCount} / {scheduledSupps.length} Supplements
                        </span>
                      </div>
                    )}
                    
                    {log.walkingMinutes > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center shrink-0">
                          <Zap size={10} strokeWidth={3} />
                        </div>
                        <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                          {log.walkingMinutes} Min Walk
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!hasData && (
                <p className="text-[10px] text-slate-300 italic font-medium pt-2 border-t border-slate-50">No activity logged for this date.</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTracker;
