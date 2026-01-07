
import React, { useState } from 'react';
import { DailyLog, UserProfile, Macros } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BrainCircuit, Sparkles, Zap, AlertCircle, 
  MessageSquareCode, Utensils, Target, Clock, History, 
  BarChart3, Rocket, CheckCircle2, 
  Dumbbell, Activity, TrendingDown,
  Gauge, ChevronRight, Flame, BarChart, TrendingUp
} from 'lucide-react';
import { MEAL_PLAN, WORKOUT_PLAN, HOME_GYM_WORKOUT_PLAN } from '../constants';
import { getISTDateInfo, getPastDays, calculateMacros, calculateDailyScore, calculateMacrosForSlot, calculateExerciseBurn } from '../utils';

declare var process: { env: { API_KEY: string } };

interface RetroAuditData {
  briefing: string;
  executiveSummary: {
    consistency: string;
    primaryBottleneck: string;
    metabolicWins: string;
  };
  trends: { sentiment: 'positive' | 'negative' | 'neutral'; title: string; observation: string }[];
  dietaryPivots: { category: string; skipDishes: string[]; addDishes: string[]; logic: string }[];
  motivationalDirective: string;
}

interface DailyAuditData {
  briefing: string;
  nutritionalGaps: {
    nutrient: string;
    status: 'DEFICIT' | 'STABLE';
    deficitValue: string;
    insight: string;
  }[];
  mealBlueprints: {
    slot: string;
    summaryProtocol: string;
    options: { 
      id: number; 
      name: string; 
      gapSolution: string; 
      priority: string;
      kcal: number;
      protein: number;
      carbs: number;
      fiber: number;
    }[];
  }[];
  kineticDirectives: { 
    summary: string;
    status: 'LOW_BURN' | 'OPTIMAL' | 'INCOMPLETE_WORKOUT';
    suggestedExercises: { drill: string; protocol: string; executionCue: string; estimatedBurn: number }[];
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
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error("No JSON object found");
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("AI Response Parse Error:", e, text);
      throw new Error("Analysis engine output was unstable. Please try once more.");
    }
  };

  const performDailyAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const dayIndex = (new Date(log.date).getDay() + 6) % 7;
      
      const allPossible = [...WORKOUT_PLAN[dayIndex].exercises, ...HOME_GYM_WORKOUT_PLAN[dayIndex].exercises];
      const completedList = allPossible
        .filter(ex => log.completedExercises.includes(ex.id))
        .map(ex => ex.name)
        .join(', ');

      const prompt = `PERFORMANCE AUDIT [${currentTimeStr} IST].
      GOALS: 1900kcal, Protein: 142g, Fiber: 35g.
      LOGGED: ${Math.round(macros.kcal)}kcal (P:${Math.round(macros.protein)}g, Fiber:${Math.round(macros.fiber)}g).
      BURN: ${burn} kcal.
      DONE: ${completedList || 'None'}.
      
      Suggest exactly 4 meal options with full macros per missing slot. Provide exercise injections if burn < 500.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              briefing: { type: Type.STRING },
              nutritionalGaps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { nutrient: { type: Type.STRING }, status: { type: Type.STRING }, deficitValue: { type: Type.STRING }, insight: { type: Type.STRING } } } },
              mealBlueprints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { slot: { type: Type.STRING }, summaryProtocol: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.NUMBER }, name: { type: Type.STRING }, gapSolution: { type: Type.STRING }, priority: { type: Type.STRING }, kcal: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fiber: { type: Type.NUMBER } } } } } } },
              kineticDirectives: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, status: { type: Type.STRING }, suggestedExercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { drill: { type: Type.STRING }, protocol: { type: Type.STRING }, executionCue: { type: Type.STRING }, estimatedBurn: { type: Type.NUMBER } } } } } }
            },
            required: ["briefing", "nutritionalGaps", "mealBlueprints", "kineticDirectives"]
          },
          systemInstruction: "You are 'Alpha-1 Coach'. Manage Diet and Exercise. If movement is low, prioritize Kinetic Injections. Use Indian food database."
        }
      });
      setDailyAudit(parseJSONSafely(response.text ?? ""));
    } catch (e: any) { setError(e.message || "Audit failed."); } finally { setLoading(false); }
  };

  const performRetroAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const pastDays = getPastDays(retroRange);
      const historySummary = pastDays.map(date => {
        const dLog = logs[date];
        if (!dLog) return `Date ${date}: NO DATA`;
        const m = calculateMacros(dLog);
        const b = calculateExerciseBurn(dLog, profile);
        return `Date ${date}: Kcal ${Math.round(m.kcal)}, Prot ${Math.round(m.protein)}g, Fiber ${Math.round(m.fiber)}g, Burn ${b}`;
      }).join('\n');

      const prompt = `RETRO ANALYSIS: ${retroRange} days. Analyze metabolic consistency.
      HISTORY DATA:
      ${historySummary}
      
      Mission:
      1. Identify bottlenecks (why is protein/fiber low?).
      2. Spot trends.
      3. Suggest specific Indian food pivots (items to skip vs items to add).
      4. Give a motivational directive.`;

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
            },
            required: ["briefing", "executiveSummary", "trends", "dietaryPivots", "motivationalDirective"]
          }
        }
      });
      setRetroAudit(parseJSONSafely(response.text ?? ""));
    } catch (e: any) { setError("Retro analysis failed."); } finally { setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-40 animate-in fade-in duration-700">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Intelligence Layer</h2>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">Coach Alpha <BrainCircuit className="text-blue-500" size={20} /></h1>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-500 uppercase">IST Sync</span>
          <span className="text-xs font-black text-blue-400">{currentTimeStr}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 flex items-center gap-3">
          <AlertCircle size={18} />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
        <button onClick={() => { setActiveMode('daily'); setDailyAudit(null); setRetroAudit(null); }} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${activeMode === 'daily' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Live Scan</button>
        <button onClick={() => { setActiveMode('retro'); setDailyAudit(null); setRetroAudit(null); }} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${activeMode === 'retro' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>History Retro</button>
      </div>

      <div className="dark-hud rounded-[32px] p-5 relative border border-white/5 shadow-2xl min-h-[300px]">
        {!dailyAudit && !retroAudit && !loading && (
          <div className="space-y-8 py-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${activeMode === 'retro' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                {activeMode === 'retro' ? <History className="text-white" size={24} /> : <Sparkles className="text-white" size={24} />}
              </div>
              <div>
                <h4 className="text-lg font-black text-white">{activeMode === 'daily' ? 'Metabolic Audit' : 'Historical Analysis'}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Alpha Protocol Engine</p>
              </div>
            </div>

            {activeMode === 'retro' && (
              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Analysis Period</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 7, 15, 30].map(r => (
                    <button key={r} onClick={() => setRetroRange(r)} className={`py-3 rounded-xl text-xs font-black border transition-all ${retroRange === r ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}>{r}d</button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 italic bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
              {activeMode === 'daily' 
                ? 'Coach will scan Diet + Exercise logs to find Fiber, Protein, and Calorie Burn gaps.' 
                : `Engine will deep-scan the last ${retroRange} days of your metabolic performance to find systemic failures.`}
            </p>

            <button onClick={activeMode === 'daily' ? performDailyAudit : performRetroAudit} className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-3 ${activeMode === 'retro' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
              <Rocket size={18} /> Initiate {activeMode === 'daily' ? 'Live Scan' : 'Retro Analysis'}
            </button>
          </div>
        )}

        {loading && (
          <div className="py-24 flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Syncing Engine...</p>
          </div>
        )}

        {/* Retro Results UI */}
        {retroAudit && activeMode === 'retro' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-3xl">
              <h5 className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2"><MessageSquareCode size={12}/> Retro Briefing</h5>
              <p className="text-xs text-slate-200 font-bold leading-relaxed italic">"{retroAudit.briefing}"</p>
            </section>

            <section className="grid grid-cols-1 gap-4">
               <div className="bg-white/5 p-5 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400"><BarChart size={16}/><span className="text-[9px] font-black uppercase tracking-widest">Executive Summary</span></div>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase">Consistency</span>
                      <p className="text-[11px] font-bold text-slate-200">{retroAudit.executiveSummary.consistency}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-rose-500 uppercase">Primary Bottleneck</span>
                      <p className="text-[11px] font-bold text-rose-300">{retroAudit.executiveSummary.primaryBottleneck}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-emerald-500 uppercase">Metabolic Wins</span>
                      <p className="text-[11px] font-bold text-emerald-300">{retroAudit.executiveSummary.metabolicWins}</p>
                    </div>
                  </div>
               </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 px-1"><TrendingUp size={16}/><span className="text-[9px] font-black uppercase tracking-widest">Metabolic Trends</span></div>
              <div className="grid grid-cols-1 gap-3">
                {retroAudit.trends.map((t, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex gap-4 items-start">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : t.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {t.sentiment === 'positive' ? <CheckCircle2 size={16}/> : t.sentiment === 'negative' ? <TrendingDown size={16}/> : <Activity size={16}/>}
                    </div>
                    <div>
                      <h6 className="text-xs font-black text-white leading-none mb-1">{t.title}</h6>
                      <p className="text-[10px] text-slate-500 font-bold leading-tight">{t.observation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 px-1"><Utensils size={16}/><span className="text-[9px] font-black uppercase tracking-widest">Dietary Pivots</span></div>
              {retroAudit.dietaryPivots.map((pivot, i) => (
                <div key={i} className="bg-slate-900/60 border border-white/5 p-5 rounded-3xl space-y-4">
                  <h6 className="text-xs font-black text-white bg-white/5 px-3 py-1 rounded-lg inline-block">{pivot.category}</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-rose-500 uppercase">Skip These</span>
                      {pivot.skipDishes.map((d, j) => <p key={j} className="text-[10px] font-bold text-slate-400 line-through truncate">• {d}</p>)}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-emerald-500 uppercase">Inject These</span>
                      {pivot.addDishes.map((d, j) => <p key={j} className="text-[10px] font-bold text-emerald-300 truncate">• {d}</p>)}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold italic pt-2 border-t border-white/5">Logic: {pivot.logic}</p>
                </div>
              ))}
            </section>

            <div className="bg-indigo-600 p-6 rounded-3xl text-center space-y-2 shadow-xl shadow-indigo-600/20">
               <Zap className="text-white mx-auto mb-2" size={24} />
               <p className="text-xs font-black text-white uppercase tracking-widest leading-relaxed">{retroAudit.motivationalDirective}</p>
            </div>

            <button onClick={() => setRetroAudit(null)} className="w-full py-5 bg-white/5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5 flex items-center justify-center gap-2">
              <ChevronRight size={14} className="rotate-180" /> Reset Analysis
            </button>
          </div>
        )}

        {/* Daily Audit Results UI (Keep existing) */}
        {dailyAudit && activeMode === 'daily' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl">
              <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MessageSquareCode size={12}/> Strategy Briefing</div>
              <p className="text-xs text-slate-200 font-bold leading-relaxed italic">"{dailyAudit.briefing}"</p>
            </div>

            {/* KINETIC DIRECTIVES */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-orange-400"><Flame size={16}/><span className="text-[9px] font-black uppercase tracking-widest">Kinetic Injections</span></div>
              <div className={`p-4 rounded-[28px] border ${dailyAudit.kineticDirectives.status === 'LOW_BURN' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'} space-y-4`}>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{dailyAudit.kineticDirectives.status.replace('_', ' ')}</span>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/10">Active Monitoring</span>
                 </div>
                 <p className="text-xs text-slate-300 font-bold leading-tight">"{dailyAudit.kineticDirectives.summary}"</p>
                 <div className="grid grid-cols-1 gap-2 pt-2">
                    {dailyAudit.kineticDirectives.suggestedExercises.map((ex, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-2xl flex items-center justify-between border border-white/5">
                        <div className="min-w-0 flex-1">
                          <h6 className="text-[11px] font-black text-white truncate">{ex.drill}</h6>
                          <p className="text-[9px] text-slate-500 font-bold">{ex.protocol}</p>
                        </div>
                        <div className="text-right ml-3"><span className="text-[10px] font-black text-orange-400">+{ex.estimatedBurn} K</span></div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* DEFICIENCY SCANNER */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-400"><Gauge size={16}/><span className="text-[9px] font-black uppercase tracking-widest">Deficiency Scan</span></div>
              <div className="grid grid-cols-2 gap-3">
                {(dailyAudit.nutritionalGaps || []).map((gap, i) => {
                  const isDeficit = gap.status === 'DEFICIT' || gap.status.includes('Low');
                  return (
                    <div key={i} className={`p-3 rounded-2xl border ${isDeficit ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-black ${isDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>{gap.nutrient}</span>
                        {isDeficit ? <TrendingDown size={12} className="text-rose-500" /> : <CheckCircle2 size={12} className="text-emerald-500" />}
                      </div>
                      <div className="text-[10px] font-black text-white">{gap.deficitValue}</div>
                      <div className="text-[8px] text-slate-500 font-bold truncate mt-1">{gap.insight}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MEAL INJECTIONS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-400"><Utensils size={16}/><span className="text-[9px] font-black uppercase tracking-widest">Protocol Injections</span></div>
              {(dailyAudit.mealBlueprints || []).map((blueprint, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-sm font-black text-white bg-white/5 px-4 py-2 rounded-lg inline-block border border-white/5">{blueprint.slot}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {(blueprint.options || []).map((opt, i) => (
                      <div key={i} className="bg-slate-900/60 p-4 rounded-[24px] border border-white/5 space-y-3">
                        <div className="flex justify-between items-start">
                          <h6 className="text-xs font-black text-white">{opt.name}</h6>
                          <span className="text-[8px] font-black text-blue-400 uppercase">Option #{i+1}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="bg-white/5 p-2 rounded-lg flex flex-col items-center"><span className="text-[7px] text-slate-500 font-black uppercase">Kcal</span><span className="text-[10px] text-white font-black">{opt.kcal}</span></div>
                          <div className="bg-blue-500/10 p-2 rounded-lg flex flex-col items-center"><span className="text-[7px] text-blue-400 font-black uppercase">Prot</span><span className="text-[10px] text-blue-300 font-black">{opt.protein}g</span></div>
                          <div className="bg-emerald-500/10 p-2 rounded-lg flex flex-col items-center"><span className="text-[7px] text-emerald-400 font-black uppercase">Carb</span><span className="text-[10px] text-emerald-300 font-black">{opt.carbs}g</span></div>
                          <div className="bg-indigo-500/10 p-2 rounded-lg flex flex-col items-center"><span className="text-[7px] text-indigo-400 font-black uppercase">Fiber</span><span className="text-[10px] text-indigo-300 font-black">{opt.fiber}g</span></div>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold leading-tight border-t border-white/5 pt-2 italic">"{opt.gapSolution}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setDailyAudit(null)} className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5 flex items-center justify-center gap-2">
              <ChevronRight size={14} className="rotate-180" /> Reset Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICoach;
