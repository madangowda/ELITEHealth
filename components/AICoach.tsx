
import React, { useState, useMemo } from 'react';
import { DailyLog, UserProfile, Macros, MealEntry, Exercise } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BrainCircuit, Sparkles, Loader2, Zap, AlertCircle, 
  TrendingUp, MessageSquareCode, Utensils, 
  Target, Clock, ListChecks, HeartPulse, 
  History, BarChart3, Ban, PlusCircle, Coffee, Droplets, Pill,
  ShieldAlert, Rocket, CheckCircle2, ChevronRight, ArrowRightCircle, TrendingDown,
  Info, Calendar, Dumbbell, Activity, Cpu, Layers, Repeat
} from 'lucide-react';
import { MEAL_PLAN, SUPPLEMENTS, WORKOUT_PLAN, HOME_GYM_WORKOUT_PLAN } from '../constants';
import { getISTDateInfo, getPastDays, calculateMacros, calculateDailyScore, calculateMacrosForSlot, getScheduledSupplements, calculateExerciseBurn } from '../utils';

declare var process: { env: { API_KEY: string } };

interface RetroTrend {
  sentiment: 'positive' | 'negative' | 'neutral';
  title: string;
  observation: string;
  remedy?: string;
}

interface RetroAuditData {
  briefing: string;
  executiveSummary: {
    consistency: string;
    primaryBottleneck: string;
    metabolicWins: string;
  };
  biometricIntegrity: {
    hydration: { status: string; percentage: number; insight: string };
    supplements: { status: string; percentage: number; insight: string };
  };
  trends: RetroTrend[];
  dietaryPivots: {
    category: string;
    skipDishes: string[];
    addDishes: string[];
    logic: string;
  }[];
  biologicalForecast: {
    path: string;
    riskFactor: string;
    outcome: string;
  };
  motivationalDirective: string;
}

interface DailyAuditData {
  briefing: string;
  metabolicDrift: { category: string; status: string; adjustment: string }[];
  mealBlueprints: {
    slot: string;
    summaryProtocol: string;
    options: { id: number; name: string; quantity: string; metabolicLogic: string; impactTag: string; priority: string }[];
  }[];
  kineticDirectives: { 
    summary: string;
    protocolAdjustments: string;
    suggestedExercises: { id: number; drill: string; protocol: string; focus: string; executionCue: string; priority: string }[];
  };
}

interface AICoachProps {
  log: DailyLog;
  profile: UserProfile;
  macros: Macros;
  burn: number;
  score: number;
  logs?: Record<string, DailyLog>;
}

const AICoach: React.FC<AICoachProps> = ({ log, profile, macros, burn, score, logs = {} }) => {
  const [activeMode, setActiveMode] = useState<'daily' | 'retro'>('daily');
  const [retroRange, setRetroRange] = useState<number>(7);
  const [dailyAudit, setDailyAudit] = useState<DailyAuditData | null>(null);
  const [retroAudit, setRetroAudit] = useState<RetroAuditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ist = getISTDateInfo();
  const currentTimeStr = `${ist.hour}:${ist.minutes.toString().padStart(2, '0')}`;

  const parseJSONSafely = (text: string) => {
    try {
      // Find the first '{' and last '}' to handle potential preamble/postscript junk
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error("No JSON object found");
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI JSON:", e, text);
      throw new Error("The AI response was malformed. Please try auditing again.");
    }
  };

  const performDailyAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const slotReports = MEAL_PLAN.map(cat => {
        const sm = calculateMacrosForSlot(log, cat.id);
        return `${cat.label}: ${Math.round(sm.kcal)}kcal (P: ${Math.round(sm.protein)}g)`;
      }).join('\n');

      const dayIndex = (new Date(log.date).getDay() + 6) % 7;
      const plan = profile.workoutMode === 'homegym' ? HOME_GYM_WORKOUT_PLAN : WORKOUT_PLAN;
      const workoutToday = plan[dayIndex];
      const completedList = workoutToday.exercises
        .filter(ex => log.completedExercises.includes(ex.id))
        .map(ex => ex.name)
        .join(', ');
      
      const prompt = `ALPHA-1 PERFORMANCE AUDIT. 
      IST: ${currentTimeStr}. 
      WORKOUT MODE: ${profile.workoutMode}. 
      DAY FOCUS: ${workoutToday.type}.
      COMPLETED DRILLS: ${completedList || 'None yet'}.
      DIET LOGS: ${slotReports}. 
      
      MISSION:
      1. Analyze dietary drift vs 1950kcal goal. Provide 6+ Indian food OPTIONS (Chicken, Paneer, Curd, etc) for remaining slots. Frame as ALTERNATIVES.
      2. Analyze kinetic performance. If user hasn't finished today's exercises, suggest how to optimize remaining sets. If they are done, suggest a "Burner Finisher" or "Core Finisher".
      3. Suggest 3 high-impact specific drills with execution cues.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              briefing: { type: Type.STRING },
              metabolicDrift: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, status: { type: Type.STRING }, adjustment: { type: Type.STRING } } } },
              mealBlueprints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { slot: { type: Type.STRING }, summaryProtocol: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.NUMBER }, name: { type: Type.STRING }, quantity: { type: Type.STRING }, metabolicLogic: { type: Type.STRING }, impactTag: { type: Type.STRING }, priority: { type: Type.STRING } } } } } } },
              kineticDirectives: { 
                type: Type.OBJECT, 
                properties: {
                  summary: { type: Type.STRING },
                  protocolAdjustments: { type: Type.STRING },
                  suggestedExercises: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        id: { type: Type.NUMBER }, 
                        drill: { type: Type.STRING }, 
                        protocol: { type: Type.STRING }, 
                        focus: { type: Type.STRING }, 
                        executionCue: { type: Type.STRING },
                        priority: { type: Type.STRING }
                      } 
                    } 
                  }
                }
              }
            },
            required: ["briefing", "metabolicDrift", "mealBlueprints", "kineticDirectives"]
          },
          systemInstruction: "You are 'Alpha-1 Master'. provide targeted PERFORMANCE directives for Indian fitness enthusiasts. Focus on high-volume diet and precise kinetic execution (Form cues). Labeled options for diet, specific drills for workouts."
        }
      });
      
      setDailyAudit(parseJSONSafely(response.text));
    } catch (e: any) { 
      console.error(e);
      setError(e.message || "Daily Audit Sync Failed. Ensure your API key is active."); 
    } finally { setLoading(false); }
  };

  const performRetroAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const pastDays = getPastDays(retroRange);
      const compressedLogs = pastDays.map(date => {
        const dLog = logs[date];
        if (!dLog) return `Date ${date}: No Entry`;
        const dm = calculateMacros(dLog);
        const ds = calculateDailyScore(dLog, dm, 1950, profile);
        const scheduledSupps = getScheduledSupplements(date).length;
        const takenSupps = (dLog.takenSupplements || []).length;
        return `Date ${date}: Score ${ds}, Kcal ${Math.round(dm.kcal)}, Prot ${Math.round(dm.protein)}g, Walk ${dLog.walkingMinutes}min, Water ${dLog.waterIntakeMl}ml, Supps ${takenSupps}/${scheduledSupps}`;
      }).join('\n');

      const prompt = `RETROSPECTIVE ANALYSIS: Last ${retroRange} Days. Analyze patterns in calorie/protein/walking/hydration/supplements. Identify EXACT Indian dishes to SKIP vs ADD. Provide a Biological Forecast. DATA: ${compressedLogs}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              briefing: { type: Type.STRING },
              executiveSummary: { type: Type.OBJECT, properties: { consistency: { type: Type.STRING }, primaryBottleneck: { type: Type.STRING }, metabolicWins: { type: Type.STRING } }, required: ["consistency", "primaryBottleneck", "metabolicWins"] },
              biometricIntegrity: {
                type: Type.OBJECT,
                properties: {
                  hydration: { type: Type.OBJECT, properties: { status: { type: Type.STRING }, percentage: { type: Type.NUMBER }, insight: { type: Type.STRING } } },
                  supplements: { type: Type.OBJECT, properties: { status: { type: Type.STRING }, percentage: { type: Type.NUMBER }, insight: { type: Type.STRING } } }
                }
              },
              trends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] }, title: { type: Type.STRING }, observation: { type: Type.STRING }, remedy: { type: Type.STRING } }, required: ["sentiment", "title", "observation"] } },
              dietaryPivots: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, skipDishes: { type: Type.ARRAY, items: { type: Type.STRING } }, addDishes: { type: Type.ARRAY, items: { type: Type.STRING } }, logic: { type: Type.STRING } }, required: ["category", "skipDishes", "addDishes", "logic"] } },
              biologicalForecast: {
                type: Type.OBJECT,
                properties: { path: { type: Type.STRING }, riskFactor: { type: Type.STRING }, outcome: { type: Type.STRING } },
                required: ["path", "riskFactor", "outcome"]
              },
              motivationalDirective: { type: Type.STRING }
            },
            required: ["briefing", "executiveSummary", "biometricIntegrity", "trends", "dietaryPivots", "biologicalForecast", "motivationalDirective"]
          },
          systemInstruction: "You are 'Alpha-1 Analyst'. You analyze Indian fitness data. Focus on consequences and trends."
        }
      });
      setRetroAudit(parseJSONSafely(response.text));
    } catch (e: any) { 
      console.error(e);
      setError(e.message || "Retro Engine Failed. Check connection."); 
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 pb-40 animate-in fade-in duration-700 max-w-full">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Alpha-1 Protocol Core</h2>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none flex items-center gap-3">
            Elite Coach <BrainCircuit className="text-blue-500" size={24} />
          </h1>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Local IST</span>
          <span className="text-xs font-black text-blue-400 flex items-center gap-1">
            <Clock size={10} /> {currentTimeStr}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 flex items-center gap-3">
          <AlertCircle size={18} />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex p-1 bg-white/5 border border-white/5 rounded-[24px] shadow-inner">
        <button onClick={() => { setActiveMode('daily'); setDailyAudit(null); setRetroAudit(null); setError(null); }} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeMode === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}><Zap size={14}/> Daily Sync</button>
        <button onClick={() => { setActiveMode('retro'); setDailyAudit(null); setRetroAudit(null); setError(null); }} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeMode === 'retro' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}><History size={14}/> Trend Retro</button>
      </div>

      <div className="dark-hud rounded-[40px] p-5 sm:p-8 relative border border-white/5 shadow-2xl min-h-[400px]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full -mr-40 -mt-40 blur-[100px] animate-pulse pointer-events-none" />
        
        <div className="relative z-10 space-y-12">
          {!dailyAudit && !retroAudit && !loading && (
            <div className="space-y-10 py-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${activeMode === 'retro' ? 'bg-indigo-600' : 'bg-blue-600'} rounded-[24px] flex items-center justify-center shadow-2xl border border-white/10`}>
                  {activeMode === 'retro' ? <BarChart3 className="text-white" size={32} /> : <Sparkles className="text-white" size={32} />}
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">{activeMode === 'retro' ? 'Trend Retro Audit' : 'Performance Audit'}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Kinetic & Metabolic Engine</p>
                </div>
              </div>

              {activeMode === 'retro' && (
                <div className="space-y-5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2"><Calendar size={12}/> Window Selection</label>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {[3, 7, 14, 30].map(r => (
                      <button key={r} onClick={() => setRetroRange(r)} className={`py-4 rounded-xl text-xs font-black border transition-all ${retroRange === r ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-105' : 'bg-white/5 border-white/5 text-slate-500'}`}>{r}D</button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-400 font-medium leading-relaxed bg-white/5 p-6 rounded-[32px] border border-white/5 italic">
                {activeMode === 'retro' 
                  ? `Engine will analyze ${retroRange} days of logs. Identifying failures in nutrition adherence and kinetic consistency.` 
                  : `Coach will perform a dual audit of your current metabolic drift and workout progress. Prepare for targeted injection protocol.`}
              </p>

              <button 
                onClick={activeMode === 'retro' ? performRetroAudit : performDailyAudit}
                className={`w-full py-7 ${activeMode === 'retro' ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-blue-600 shadow-blue-500/30'} text-white rounded-[28px] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 border border-white/10`}
              >
                {activeMode === 'retro' ? <History size={20} /> : <Rocket size={20} />} Start Performance Audit
              </button>
            </div>
          )}

          {loading && (
            <div className="py-24 flex flex-col items-center justify-center gap-10">
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <BrainCircuit className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={40} />
              </div>
              <p className="text-[12px] font-black text-white uppercase tracking-[0.8em] animate-pulse text-center">Engine Synchronizing...</p>
            </div>
          )}

          {/* Retrospective Results UI */}
          {retroAudit && activeMode === 'retro' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 overflow-x-hidden">
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-400 border-b border-white/10 pb-4"><MessageSquareCode size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Briefing</span></div>
                <div className="text-base text-slate-200 font-medium leading-relaxed italic bg-indigo-600/5 p-6 sm:p-10 rounded-[40px] border border-indigo-500/10 shadow-inner">"{retroAudit.briefing}"</div>
              </section>

              <section className="space-y-10">
                <div className="flex items-center gap-3 text-emerald-400 border-b border-white/10 pb-4"><Utensils size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Dietary Pivot Directives</span></div>
                {(retroAudit.dietaryPivots || []).map((pivot, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 sm:p-10 rounded-[56px] space-y-10">
                     <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] bg-emerald-600/10 px-6 py-3 rounded-2xl border border-emerald-500/20 inline-block">{pivot.category}</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                           <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-3"><Ban size={14}/> Eliminate</div>
                           <div className="flex flex-col gap-2">
                              {(pivot.skipDishes || []).map((d, idx) => (
                                <div key={idx} className="bg-rose-500/10 p-4 rounded-2xl text-[10px] font-black text-rose-300 border border-rose-500/10">{d}</div>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-5">
                           <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3"><PlusCircle size={14}/> Prioritize</div>
                           <div className="flex flex-col gap-2">
                              {(pivot.addDishes || []).map((d, idx) => (
                                <div key={idx} className="bg-emerald-500/10 p-4 rounded-2xl text-[10px] font-black text-emerald-300 border border-emerald-500/10">{d}</div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
              </section>

              <button onClick={() => setRetroAudit(null)} className="w-full py-7 bg-white/5 rounded-[32px] text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] border border-white/5">Flush Data Core</button>
            </div>
          )}

          {/* Daily Audit Results UI */}
          {dailyAudit && activeMode === 'daily' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
               <section className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-400 border-b border-white/10 pb-4"><MessageSquareCode size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Strategic Briefing</span></div>
                <div className="text-base text-slate-200 font-medium leading-relaxed italic bg-indigo-600/5 p-8 sm:p-10 rounded-[40px] border border-indigo-500/10 shadow-inner">"{dailyAudit.briefing}"</div>
              </section>

              {/* KINETIC DIRECTIVES SECTION */}
              <section className="space-y-12">
                <div className="flex items-center gap-3 text-blue-400 border-b border-white/10 pb-4"><Dumbbell size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Kinetic Directives</span></div>
                <div className="bg-white/5 rounded-[48px] border border-white/5 p-8 sm:p-10 space-y-10 shadow-2xl">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest"><Activity size={14}/> Performance Analysis</div>
                      <p className="text-sm text-slate-300 font-bold italic leading-relaxed">"{dailyAudit.kineticDirectives?.summary}"</p>
                      <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-[24px] text-[11px] font-black text-blue-300 leading-tight">
                        ADJUSTMENT: {dailyAudit.kineticDirectives?.protocolAdjustments}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2">Suggested Injection Protocols</h4>
                      <div className="grid grid-cols-1 gap-5">
                         {(dailyAudit.kineticDirectives?.suggestedExercises || []).map((drill, idx) => (
                           <div key={idx} className="bg-slate-900/60 rounded-[32px] p-6 sm:p-8 border border-white/5 flex gap-6 items-start">
                              <div className={`w-14 h-14 rounded-[20px] flex flex-col items-center justify-center shrink-0 border ${drill.priority === 'High' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                                <Zap size={20} />
                                <span className="text-[7px] font-black uppercase mt-1">Priority</span>
                              </div>
                              <div className="space-y-3 flex-1">
                                 <div className="flex justify-between items-start">
                                    <h5 className="text-lg font-black text-white">{drill.drill}</h5>
                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{drill.protocol}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                    <Target size={12} className="text-emerald-500" /> Focus: <span className="text-slate-300">{drill.focus}</span>
                                 </div>
                                 <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic bg-white/5 p-4 rounded-2xl border border-white/5">
                                    "CUE: {drill.executionCue}"
                                 </p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </section>

              {/* MEAL BLUEPRINTS SECTION */}
              <section className="space-y-12">
                <div className="flex items-center gap-3 text-emerald-400 border-b border-white/10 pb-4"><Utensils size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Fuel Injection Blueprints</span></div>
                {(dailyAudit.mealBlueprints || []).map((blueprint, idx) => (
                  <div key={idx} className="bg-white/5 rounded-[56px] border border-white/5 p-1 overflow-hidden shadow-2xl">
                    <div className="p-8 sm:p-10 pb-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-white">{blueprint.slot}</h3>
                        <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Pick One Option Only</div>
                      </div>
                      <p className="text-sm text-slate-400 font-bold bg-white/5 p-6 rounded-3xl leading-relaxed italic border border-white/5">{blueprint.summaryProtocol}</p>
                    </div>
                    
                    <div className="px-6 sm:px-8 pb-10 space-y-6">
                      {(blueprint.options || []).map((opt, i) => (
                        <div key={i} className="bg-slate-900/60 rounded-[32px] p-6 sm:p-8 border border-white/5 flex gap-6 sm:gap-8 transition-all hover:bg-slate-900">
                          <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-[24px] flex flex-col items-center justify-center shrink-0 border shadow-lg ${opt.priority === 'High' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                            <span className="text-[8px] font-black uppercase opacity-60 mb-1">Option</span>
                            <span className="text-lg sm:text-xl font-black">{i + 1}</span>
                          </div>
                          
                          <div className="space-y-3 flex-1">
                            <h6 className="text-base sm:text-lg font-black text-white leading-tight">
                              {opt.name}
                            </h6>
                            <p className="text-xs text-slate-400 font-bold leading-relaxed">
                              {opt.metabolicLogic}
                            </p>
                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
                               <div className="flex items-center gap-1 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                                 <Zap size={10} className="text-emerald-400" />
                                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{opt.impactTag}</span>
                               </div>
                               <div className="flex items-center gap-1 bg-blue-400/10 px-3 py-1.5 rounded-xl border border-blue-500/10">
                                 <Target size={10} className="text-blue-400" />
                                 <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{opt.quantity}</span>
                               </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
              
              <button onClick={() => setDailyAudit(null)} className="w-full py-7 bg-white/5 rounded-[32px] text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] border border-white/5">Clear Protocol Cache</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICoach;
