
import React, { useState } from 'react';
import { DailyLog, UserProfile, Macros } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BrainCircuit, Sparkles, Zap, AlertCircle, 
  MessageSquareCode, Utensils, Target, Clock, History, 
  BarChart3, Rocket, CheckCircle2, 
  Dumbbell, Activity, TrendingDown,
  Gauge, Hash, Flame, ChevronRight
} from 'lucide-react';
import { MEAL_PLAN, WORKOUT_PLAN, HOME_GYM_WORKOUT_PLAN } from '../constants';
import { getISTDateInfo, getPastDays, calculateMacros, calculateDailyScore, calculateMacrosForSlot } from '../utils';

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
  nutritionalGaps: {
    nutrient: string;
    status: 'Critically Low' | 'Lagging' | 'Stable' | 'Excess';
    deficitValue: string;
    insight: string;
  }[];
  metabolicDrift: { category: string; status: string; adjustment: string }[];
  mealBlueprints: {
    slot: string;
    summaryProtocol: string;
    options: { 
      id: number; 
      name: string; 
      quantity: string; 
      metabolicLogic: string; 
      gapSolution: string; 
      impactTag: string; 
      priority: string;
      kcal: number;
      protein: number;
      carbs: number;
      fiber: number;
    }[];
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

const AICoach: React.FC<AICoachProps> = ({ log, profile, macros, logs = {} }) => {
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
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error("No JSON object found");
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI JSON:", e, text);
      throw new Error("AI analysis malformed. Please try again.");
    }
  };

  const performDailyAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const slotReports = MEAL_PLAN.map(cat => {
        const sm = calculateMacrosForSlot(log, cat.id);
        return `${cat.label}: ${Math.round(sm.kcal)}kcal (P:${Math.round(sm.protein)}g, C:${Math.round(sm.carbs)}g, F:${Math.round(sm.fat)}g, Fiber:${Math.round(sm.fiber)}g)`;
      }).join('\n');

      const dayIndex = (new Date(log.date).getDay() + 6) % 7;
      const plan = profile.workoutMode === 'homegym' ? HOME_GYM_WORKOUT_PLAN : WORKOUT_PLAN;
      const workoutToday = plan[dayIndex];
      const completedList = workoutToday.exercises
        .filter(ex => log.completedExercises.includes(ex.id))
        .map(ex => ex.name)
        .join(', ');
      
      const prompt = `ALPHA-1 DEEP PERFORMANCE AUDIT.
      IST: ${currentTimeStr}. 
      GOALS: 1900kcal, P:142g, C:195g, F:60g, Fiber:35g.
      CURRENT INTAKE: ${Math.round(macros.kcal)}kcal (P:${Math.round(macros.protein)}g, C:${Math.round(macros.carbs)}g, F:${Math.round(macros.fat)}g, Fiber:${Math.round(macros.fiber)}g).
      DONE TODAY: ${completedList || 'Nothing logged yet'}.

      MISSION:
      1. ANALYZE GAPS: Explicitly identify which nutrients are below target (Fiber, Protein, etc).
      2. NUTRITIONAL GAPS: In the response, explain why these gaps are dangerous for muscle preservation.
      3. MEAL PROTOCOL: For all remaining slots, provide EXACTLY 4 Indian food options per slot.
      4. MACRO PRECISION: Each option MUST include kcal, protein, carbs, and fiber numbers.
      5. GAP SOLUTION: Explain how each specific food choice fixes today's deficiencies.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              briefing: { type: Type.STRING },
              nutritionalGaps: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    nutrient: { type: Type.STRING }, 
                    status: { type: Type.STRING }, 
                    deficitValue: { type: Type.STRING }, 
                    insight: { type: Type.STRING } 
                  } 
                } 
              },
              mealBlueprints: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    slot: { type: Type.STRING }, 
                    summaryProtocol: { type: Type.STRING }, 
                    options: { 
                      type: Type.ARRAY, 
                      items: { 
                        type: Type.OBJECT, 
                        properties: { 
                          id: { type: Type.NUMBER }, 
                          name: { type: Type.STRING }, 
                          quantity: { type: Type.STRING }, 
                          metabolicLogic: { type: Type.STRING }, 
                          gapSolution: { type: Type.STRING },
                          impactTag: { type: Type.STRING }, 
                          priority: { type: Type.STRING },
                          kcal: { type: Type.NUMBER },
                          protein: { type: Type.NUMBER },
                          carbs: { type: Type.NUMBER },
                          fiber: { type: Type.NUMBER }
                        } 
                      } 
                    } 
                  } 
                } 
              },
              kineticDirectives: { 
                type: Type.OBJECT, 
                properties: {
                  summary: { type: Type.STRING },
                  protocolAdjustments: { type: Type.STRING },
                  suggestedExercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.NUMBER }, drill: { type: Type.STRING }, protocol: { type: Type.STRING }, focus: { type: Type.STRING }, executionCue: { type: Type.STRING }, priority: { type: Type.STRING } } } }
                }
              }
            },
            required: ["briefing", "nutritionalGaps", "mealBlueprints", "kineticDirectives"]
          },
          systemInstruction: "You are 'Alpha-1 Master Coach'. You specialize in High-Volume Indian Nutrition. You identify deficiencies in Fiber, Protein, and Healthy Fats and suggest corrective Indian meals. Always provide exactly 4 options with full macro breakdowns."
        }
      });
      
      setDailyAudit(parseJSONSafely(response.text ?? ""));
    } catch (e: any) { 
      console.error(e);
      setError(e.message || "Daily Audit Failed. Ensure API Key is active."); 
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
        const ds = calculateDailyScore(dLog, dm, 1900, profile);
        return `Date ${date}: Score ${ds}, Kcal ${Math.round(dm.kcal)}, Prot ${Math.round(dm.protein)}g, Fiber ${Math.round(dm.fiber)}g`;
      }).join('\n');

      const prompt = `RETRO ANALYSIS: ${retroRange} Days. Analyze Protein/Fiber/Consistent adherence. DATA: ${compressedLogs}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              briefing: { type: Type.STRING },
              executiveSummary: { type: Type.OBJECT, properties: { consistency: { type: Type.STRING }, primaryBottleneck: { type: Type.STRING }, metabolicWins: { type: Type.STRING } } },
              trends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sentiment: { type: Type.STRING }, title: { type: Type.STRING }, observation: { type: Type.STRING } } } },
              dietaryPivots: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, skipDishes: { type: Type.ARRAY, items: { type: Type.STRING } }, addDishes: { type: Type.ARRAY, items: { type: Type.STRING } }, logic: { type: Type.STRING } } } },
              motivationalDirective: { type: Type.STRING }
            }
          }
        }
      });
      setRetroAudit(parseJSONSafely(response.text ?? ""));
    } catch (e: any) { setError("Retro Failed."); } finally { setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 pb-40 animate-in fade-in duration-700 max-w-full">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Coach Protocol</h2>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none flex items-center gap-3">
            Elite AI Coach <BrainCircuit className="text-blue-500" size={24} />
          </h1>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">IST SYNC</span>
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
        <button onClick={() => { setActiveMode('daily'); setDailyAudit(null); setRetroAudit(null); setError(null); }} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeMode === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}><Zap size={14}/> Performance</button>
        <button onClick={() => { setActiveMode('retro'); setDailyAudit(null); setRetroAudit(null); setError(null); }} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeMode === 'retro' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}><History size={14}/> Retro</button>
      </div>

      <div className="dark-hud rounded-[40px] p-5 sm:p-8 relative border border-white/5 shadow-2xl min-h-[400px]">
        {!dailyAudit && !retroAudit && !loading && (
          <div className="space-y-10 py-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${activeMode === 'retro' ? 'bg-indigo-600' : 'bg-blue-600'} rounded-[24px] flex items-center justify-center shadow-2xl border border-white/10`}>
                {activeMode === 'retro' ? <BarChart3 className="text-white" size={32} /> : <Sparkles className="text-white" size={32} />}
              </div>
              <div>
                <h4 className="text-xl font-black text-white">{activeMode === 'retro' ? 'Historical Retro' : 'Deep Nutrient Audit'}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Metabolic Intelligence Engine</p>
              </div>
            </div>

            {activeMode === 'retro' && (
              <div className="space-y-5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Analysis Window</label>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {[3, 7, 14, 30].map(r => (
                    <button key={r} onClick={() => setRetroRange(r)} className={`py-4 rounded-xl text-xs font-black border transition-all ${retroRange === r ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>{r}D</button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-slate-400 font-medium leading-relaxed bg-white/5 p-6 rounded-[32px] border border-white/5 italic">
              {activeMode === 'retro' 
                ? `Engine will scan ${retroRange} days of logs to find systemic failures in your metabolic consistency.` 
                : `Coach will perform a Deep Audit of your Fiber, Protein, and Carb balance. Suggestions will be targeted to fill specific gaps.`}
            </p>

            <button 
              onClick={activeMode === 'retro' ? performRetroAudit : performDailyAudit}
              className={`w-full py-7 ${activeMode === 'retro' ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-blue-600 shadow-blue-500/30'} text-white rounded-[28px] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 border border-white/10`}
            >
              <Rocket size={20} /> Launch Audit Engine
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
            <p className="text-[12px] font-black text-white uppercase tracking-[0.8em] animate-pulse text-center">Syncing Protocol...</p>
          </div>
        )}

        {/* Retro Results UI */}
        {retroAudit && activeMode === 'retro' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             <section className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-400 border-b border-white/10 pb-4"><MessageSquareCode size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Retro Briefing</span></div>
                <div className="text-base text-slate-200 font-medium leading-relaxed italic bg-indigo-600/5 p-6 sm:p-10 rounded-[40px] border border-indigo-500/10">"{retroAudit.briefing}"</div>
              </section>
              <button onClick={() => setRetroAudit(null)} className="w-full py-7 bg-white/5 rounded-[32px] text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] border border-white/5">Flush Data Core</button>
          </div>
        )}

        {/* Daily Audit Results UI */}
        {dailyAudit && activeMode === 'daily' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             <section className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-400 border-b border-white/10 pb-3"><MessageSquareCode size={20}/><span className="text-[9px] font-black uppercase tracking-[0.4em]">Metabolic Directive</span></div>
                <div className="text-sm text-slate-200 font-medium leading-relaxed italic bg-indigo-600/5 p-6 rounded-[32px] border border-indigo-500/10 shadow-inner">"{dailyAudit.briefing}"</div>
              </section>

              {/* DEFICIENCY SCANNER */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-rose-400 border-b border-white/10 pb-3"><Gauge size={20}/><span className="text-[9px] font-black uppercase tracking-[0.4em]">Deficiency Scan</span></div>
                <div className="grid grid-cols-1 gap-3">
                  {(dailyAudit.nutritionalGaps || []).map((gap, i) => {
                    const isDeficit = gap.status.includes('Low') || gap.status.includes('Lagging');
                    return (
                      <div key={i} className={`bg-white/5 border border-white/10 rounded-[28px] p-5 flex gap-4 items-start ${isDeficit ? 'border-rose-500/20' : ''}`}>
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                           isDeficit ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                         }`}>
                           {isDeficit ? <TrendingDown size={20}/> : <CheckCircle2 size={20}/>}
                         </div>
                         <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-white">{gap.nutrient}</h4>
                              <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                 isDeficit ? 'bg-rose-500/20 border-rose-500/20 text-rose-500' : 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                              }`}>{gap.status}</span>
                            </div>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${isDeficit ? 'text-rose-400' : 'text-slate-500'}`}>Deficit: <span className="text-white font-black">{gap.deficitValue}</span></p>
                            <p className="text-[11px] text-slate-400 font-medium leading-tight italic">"{gap.insight}"</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* MEAL BLUEPRINTS - ENHANCED FOR GAPS */}
              <section className="space-y-10">
                <div className="flex items-center gap-3 text-emerald-400 border-b border-white/10 pb-3"><Utensils size={20}/><span className="text-[9px] font-black uppercase tracking-[0.4em]">Gap Correction Protocols</span></div>
                {(dailyAudit.mealBlueprints || []).map((blueprint, idx) => (
                  <div key={idx} className="bg-white/5 rounded-[48px] border border-white/5 p-1 overflow-hidden shadow-2xl">
                    <div className="p-6 pb-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white">{blueprint.slot}</h3>
                        <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border border-emerald-500/20">Elite Selection Required</div>
                      </div>
                      <p className="text-xs text-slate-400 font-bold bg-white/5 p-4 rounded-2xl leading-relaxed italic border border-white/5">"{blueprint.summaryProtocol}"</p>
                    </div>
                    
                    <div className="px-4 pb-8 space-y-4">
                      {(blueprint.options || []).map((opt, i) => (
                        <div key={i} className="bg-slate-900/60 rounded-[32px] p-5 border border-white/5 flex flex-col gap-4 group transition-all hover:bg-slate-900 active:scale-[0.98]">
                          <div className="flex gap-4 items-start">
                             <div className={`w-12 h-12 rounded-[20px] flex flex-col items-center justify-center shrink-0 border shadow-lg ${opt.priority === 'High' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                               <span className="text-[7px] font-black uppercase opacity-60">Prot.</span>
                               <span className="text-sm font-black">#{i + 1}</span>
                             </div>
                             
                             <div className="space-y-1 flex-1">
                               <h6 className="text-sm font-black text-white leading-tight">{opt.name}</h6>
                               <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl mt-2">
                                  <p className="text-[10px] text-slate-200 font-bold leading-tight italic">"{opt.gapSolution}"</p>
                               </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
                             <div className="bg-slate-800/50 p-2 rounded-xl flex flex-col items-center">
                               <span className="text-[7px] font-black text-slate-500 uppercase">Kcal</span>
                               <span className="text-xs font-black text-white">{opt.kcal}</span>
                             </div>
                             <div className="bg-blue-500/10 p-2 rounded-xl flex flex-col items-center border border-blue-500/10">
                               <span className="text-[7px] font-black text-blue-400 uppercase">Prot</span>
                               <span className="text-xs font-black text-blue-300">{opt.protein}g</span>
                             </div>
                             <div className="bg-emerald-500/10 p-2 rounded-xl flex flex-col items-center border border-emerald-500/10">
                               <span className="text-[7px] font-black text-emerald-400 uppercase">Carb</span>
                               <span className="text-xs font-black text-emerald-300">{opt.carbs}g</span>
                             </div>
                             <div className={`p-2 rounded-xl flex flex-col items-center border ${opt.fiber >= 8 ? 'bg-indigo-500/20 border-indigo-500/20' : 'bg-white/5 border-white/5'}`}>
                               <span className="text-[7px] font-black text-indigo-400 uppercase">Fiber</span>
                               <span className="text-xs font-black text-indigo-300">{opt.fiber}g</span>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
              
              <button onClick={() => setDailyAudit(null)} className="w-full py-7 bg-white/5 rounded-[32px] text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] border border-white/5 flex items-center justify-center gap-3">
                <ChevronRight size={16} className="rotate-180" /> Back to Dashboard
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICoach;
