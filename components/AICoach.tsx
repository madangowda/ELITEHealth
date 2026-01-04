
import React, { useState, useMemo } from 'react';
import { DailyLog, UserProfile, Macros, MealEntry } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BrainCircuit, Sparkles, Loader2, ShieldCheck, Zap, AlertCircle, 
  TrendingUp, Info, ChevronRight, MessageSquareCode, Utensils, 
  Dumbbell, Target, Clock, Leaf, ListChecks, ArrowUpCircle, 
  Activity, Flame, Scale, Timer, MoveRight, Beaker, Repeat, ShieldCheck as Shield,
  ArrowRightCircle, CheckCircle2, Calendar, TrendingDown, History, BarChart3, 
  ArrowDownCircle, Ban, PlusCircle, FlameKindling, Coffee, Egg, Droplets, Pill,
  HeartPulse, Award, ShieldAlert, Rocket
} from 'lucide-react';
import { WORKOUT_PLAN, HOME_GYM_WORKOUT_PLAN, DAILY_TARGETS, MEAL_PLAN, SUPPLEMENTS } from '../constants';
import { getISTDateInfo, calculateMacrosForSlot, getPastDays, calculateMacros, calculateDailyScore, getScheduledSupplements } from '../utils';

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
  kineticDirectives: { id: number; drill: string; protocol: string; focus: string; executionCue: string }[];
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

  const performDailyAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const slotReports = MEAL_PLAN.map(cat => {
        const sm = calculateMacrosForSlot(log, cat.id);
        return `${cat.label}: ${Math.round(sm.kcal)}kcal (P: ${Math.round(sm.protein)}g)`;
      }).join('\n');

      const prompt = `DAILY AUDIT MISSION. IST: ${currentTimeStr}. LOGS: ${slotReports}. Goal: 1950kcal. Suggest 6+ HIGH-VOLUME Indian food options (Include Non-veg: Chicken/Fish, Eggs, Paneer, Curd, Whole Wheat/Millet breads) per remaining meal. Focus on Indian availability.`;
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
              kineticDirectives: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.NUMBER }, drill: { type: Type.STRING }, protocol: { type: Type.STRING }, focus: { type: Type.STRING }, executionCue: { type: Type.STRING } } } }
            },
            required: ["briefing", "metabolicDrift", "mealBlueprints", "kineticDirectives"]
          },
          systemInstruction: "You are 'Alpha-1 Master', the ultimate performance coach. Focus on the Indian context: Paneer, Sattu, Chicken Breast, Eggs, Whole Wheat Bread, Curd, etc. Be exhaustive."
        }
      });
      setDailyAudit(JSON.parse(response.text || '{}'));
    } catch (e) { setError("Daily Audit Sync Failed."); } finally { setLoading(false); }
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

      const prompt = `
        RETROSPECTIVE ANALYSIS: Last ${retroRange} Days.
        MISSION:
        1. Analyze patterns in calorie/protein/walking/hydration/supplements.
        2. Identify EXACT Indian dishes to SKIP (e.g., oily parathas, white rice surpluses, high-sugar snacks).
        3. Identify EXACT Indian dishes to ADD (e.g., Chicken/Egg Bhurji, Fish, Curd/Dairy, Millet breads).
        4. Provide a 'Biological Forecast': What does this behavior lead to? (e.g., 'Chronic dehydration leading to metabolic slowdown' or 'Sundays without D3 leading to fatigue').
        5. Provide a 'Motivational Directive' to push the user to the next level.
        
        DATA:
        ${compressedLogs}
      `;
      
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
          systemInstruction: "You are 'Alpha-1 Analyst'. You analyze Indian fitness data. Focus on consequences: lack of hydration leads to kidney stress and muscle cramps; skipping supplements ruins the recovery cycle. Provide a brutal biological forecast and high-intensity motivation."
        }
      });
      setRetroAudit(JSON.parse(response.text || '{}'));
    } catch (e) { setError("Retro Engine Failed."); } finally { setLoading(false); }
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

      {/* Mode Selector */}
      <div className="flex p-1 bg-white/5 border border-white/5 rounded-[24px] shadow-inner">
        <button onClick={() => { setActiveMode('daily'); setDailyAudit(null); setRetroAudit(null); }} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeMode === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}><Zap size={14}/> Daily Sync</button>
        <button onClick={() => { setActiveMode('retro'); setDailyAudit(null); setRetroAudit(null); }} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeMode === 'retro' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}><History size={14}/> Trend Retro</button>
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
                  <h4 className="text-xl font-black text-white">{activeMode === 'retro' ? 'Trend Retro Audit' : 'Real-Time Bio Audit'}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Metabolic Intelligence Unit</p>
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
                  ? `Engine will analyze ${retroRange} days of biological logs. Identifying failures in hydration, supplement adherence, and Indian dietary surpluses.` 
                  : `Coach is ready to audit your current macros and suggest high-volume Indian fuel (Eggs, Chicken, Fish, Paneer, Curd) for remaining slots.`}
              </p>

              <button 
                onClick={activeMode === 'retro' ? performRetroAudit : performDailyAudit}
                className={`w-full py-7 ${activeMode === 'retro' ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-blue-600 shadow-blue-500/30'} text-white rounded-[28px] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 border border-white/10`}
              >
                {activeMode === 'retro' ? <History size={20} /> : <Zap size={20} />} Run Performance Audit
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
              <p className="text-[12px] font-black text-white uppercase tracking-[0.8em] animate-pulse">Running Diagnostic</p>
            </div>
          )}

          {/* Retrospective Results UI */}
          {retroAudit && activeMode === 'retro' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 overflow-x-hidden">
              {/* Briefing */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-400 border-b border-white/10 pb-4"><MessageSquareCode size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit Briefing</span></div>
                <div className="text-base text-slate-200 font-medium leading-relaxed italic bg-indigo-600/5 p-6 sm:p-10 rounded-[40px] border border-indigo-500/10 shadow-inner">"{retroAudit.briefing}"</div>
              </section>

              {/* Performance Metrics Grid */}
              <section className="grid grid-cols-1 gap-5">
                 <div className="bg-white/5 border border-white/10 p-8 rounded-[48px] space-y-5">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target size={14} className="text-emerald-500"/> Consistency Profile</h3>
                    <div className="text-2xl font-black text-white tracking-tight">{retroAudit.executiveSummary.consistency}</div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-blue-600 w-[70%]" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold italic">"{retroAudit.executiveSummary.metabolicWins}"</p>
                 </div>
                 {/* RED Section - Bottleneck (Ensuring visibility) */}
                 <div className="bg-rose-600/10 border border-rose-500/20 p-8 rounded-[48px] space-y-4">
                    <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14}/> Critical Failure Point</h3>
                    <div className="text-base font-black text-rose-200 leading-tight italic">"{retroAudit.executiveSummary.primaryBottleneck}"</div>
                 </div>
              </section>

              {/* Biometric Integrity Section (Hydration & Supps) */}
              <section className="space-y-8">
                <div className="flex items-center gap-3 text-blue-400 border-b border-white/10 pb-4"><HeartPulse size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Biometric Integrity Scan</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] space-y-4">
                    <div className="flex justify-between items-center">
                      <Droplets className="text-blue-400" size={20} />
                      <span className="text-lg font-black text-white">{retroAudit.biometricIntegrity.hydration.percentage}%</span>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hydration Status</h5>
                      <p className="text-xs font-black text-blue-100 mt-1">{retroAudit.biometricIntegrity.hydration.status}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-bold italic">"{retroAudit.biometricIntegrity.hydration.insight}"</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] space-y-4">
                    <div className="flex justify-between items-center">
                      <Pill className="text-indigo-400" size={20} />
                      <span className="text-lg font-black text-white">{retroAudit.biometricIntegrity.supplements.percentage}%</span>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplement Stack Adherence</h5>
                      <p className="text-xs font-black text-indigo-100 mt-1">{retroAudit.biometricIntegrity.supplements.status}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-bold italic">"{retroAudit.biometricIntegrity.supplements.insight}"</p>
                  </div>
                </div>
              </section>

              {/* Biological Forecast Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-rose-400 border-b border-white/10 pb-4"><ShieldAlert size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Biological Outcome Forecast</span></div>
                <div className="bg-rose-600/5 border border-rose-500/20 p-8 rounded-[48px] space-y-6">
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Current Physiological Path</span>
                    <p className="text-sm font-black text-white italic">"{retroAudit.biologicalForecast.path}"</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Primary Risk</span>
                      <p className="text-[10px] text-rose-300 font-bold">{retroAudit.biologicalForecast.riskFactor}</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Likely Outcome</span>
                      <p className="text-[10px] text-emerald-300 font-bold">{retroAudit.biologicalForecast.outcome}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Trend Matrix */}
              <section className="space-y-8">
                <div className="flex items-center gap-3 text-amber-400 border-b border-white/10 pb-4"><TrendingUp size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Clinical Observation Matrix</span></div>
                <div className="grid grid-cols-1 gap-4">
                  {retroAudit.trends.map((t, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[32px] flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${t.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                        {t.sentiment === 'positive' ? <CheckCircle2 size={24}/> : <TrendingDown size={24}/>}
                      </div>
                      <div className="space-y-2 flex-1">
                        <h5 className="text-sm font-black text-white uppercase tracking-tight">{t.title}</h5>
                        <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">"{t.observation}"</p>
                        {t.remedy && <div className="text-[9px] font-black text-blue-400 bg-blue-400/5 p-3 rounded-xl border border-blue-400/10 mt-2 leading-relaxed">Tactical Correction: {t.remedy}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Strategic Dietary Pivots */}
              <section className="space-y-10">
                <div className="flex items-center gap-3 text-emerald-400 border-b border-white/10 pb-4"><Utensils size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Dietary Pivot Directives</span></div>
                {retroAudit.dietaryPivots.map((pivot, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 sm:p-10 rounded-[56px] space-y-10 relative group">
                     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        {pivot.category.toLowerCase().includes('snack') ? <Coffee size={100}/> : <Utensils size={100}/>}
                     </div>
                     <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] bg-emerald-600/10 px-6 py-3 rounded-2xl border border-emerald-500/20 inline-block">{pivot.category} Focus</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {/* RED - Eliminate Section */}
                        <div className="space-y-5">
                           <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-3"><Ban size={14}/> Eliminate / Minimize</div>
                           <div className="flex flex-col gap-2">
                              {pivot.skipDishes.map((d, idx) => (
                                <div key={idx} className="bg-rose-500/10 p-4 rounded-2xl text-[10px] font-black text-rose-300 border border-rose-500/10 flex items-center justify-between">
                                  {d} <TrendingDown size={14} className="opacity-40" />
                                </div>
                              ))}
                           </div>
                        </div>
                        {/* GREEN - Add Section */}
                        <div className="space-y-5">
                           <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3"><PlusCircle size={14}/> Inject / Prioritize</div>
                           <div className="flex flex-col gap-2">
                              {pivot.addDishes.map((d, idx) => (
                                <div key={idx} className="bg-emerald-500/10 p-4 rounded-2xl text-[10px] font-black text-emerald-300 border border-emerald-500/10 flex items-center justify-between">
                                  {d} <TrendingUp size={14} className="opacity-40" />
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="bg-slate-950/40 p-6 sm:p-8 rounded-[32px] border border-white/5">
                        <p className="text-xs text-slate-400 font-bold italic leading-relaxed"><span className="text-white font-black uppercase text-[8px] tracking-[0.3em] block mb-2 opacity-40">Strategic Logic Hub</span>{pivot.logic}</p>
                     </div>
                  </div>
                ))}
              </section>

              {/* Motivational Directive Section */}
              <section className="bg-gradient-to-br from-indigo-700 to-blue-900 text-white p-10 rounded-[56px] shadow-2xl relative group overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
                 <h4 className="text-[11px] font-black uppercase tracking-[0.5em] mb-8 opacity-70 flex items-center gap-3"><Rocket size={16}/> Alpha-1 Command Directive</h4>
                 <p className="text-2xl font-black leading-tight tracking-tight italic">"{retroAudit.motivationalDirective}"</p>
                 <ArrowRightCircle className="mt-12 text-white/40 group-hover:text-white group-hover:translate-x-4 transition-all duration-700" size={48} />
              </section>

              <button onClick={() => setRetroAudit(null)} className="w-full py-7 bg-white/5 rounded-[32px] text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] border border-white/5 hover:text-white transition-all shadow-xl">Flush Historical Core</button>
            </div>
          )}

          {/* Daily Audit Results UI */}
          {dailyAudit && activeMode === 'daily' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
               <section className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-400 border-b border-white/10 pb-4"><MessageSquareCode size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Strategic Briefing</span></div>
                <div className="text-base text-slate-200 font-medium leading-relaxed italic bg-indigo-600/5 p-8 sm:p-10 rounded-[40px] border border-indigo-500/10 shadow-inner">"{dailyAudit.briefing}"</div>
              </section>

              <section className="space-y-12">
                <div className="flex items-center gap-3 text-emerald-400 border-b border-white/10 pb-4"><Utensils size={24}/><span className="text-[10px] font-black uppercase tracking-[0.4em]">Fuel Injection Blueprints</span></div>
                {dailyAudit.mealBlueprints.map((blueprint, idx) => (
                  <div key={idx} className="bg-white/5 rounded-[56px] border border-white/5 p-1 overflow-hidden shadow-2xl">
                    <div className="p-8 sm:p-10 pb-6 space-y-6">
                      <h3 className="text-2xl font-black text-white flex items-center justify-between">
                        {blueprint.slot} 
                        <span className="px-5 py-2 bg-blue-600/10 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/10">Target {idx+1}</span>
                      </h3>
                      <p className="text-sm text-slate-400 font-bold bg-white/5 p-6 rounded-3xl leading-relaxed italic border border-white/5">{blueprint.summaryProtocol}</p>
                    </div>
                    <div className="px-6 sm:px-8 pb-10 space-y-4">
                      {blueprint.options.map((opt, i) => (
                        <div key={i} className="bg-slate-900/60 rounded-[32px] p-6 sm:p-8 border border-white/5 flex gap-6 sm:gap-8 group hover:bg-slate-900 transition-all">
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] flex items-center justify-center shrink-0 border shadow-lg ${opt.priority === 'High' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}><span className="text-base font-black">{idx+1}.{i+1}</span></div>
                          <div className="space-y-2 flex-1 min-w-0">
                            <h6 className="text-base font-black text-white leading-tight truncate">{opt.name}</h6>
                            <p className="text-xs text-slate-400 font-bold leading-tight">{opt.metabolicLogic}</p>
                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
                               <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-xl border border-emerald-500/10 uppercase tracking-widest whitespace-nowrap">{opt.impactTag}</span>
                               <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-xl border border-blue-500/10 uppercase tracking-widest whitespace-nowrap">{opt.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
              <button onClick={() => setDailyAudit(null)} className="w-full py-7 bg-white/5 rounded-[32px] text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] border border-white/5 shadow-2xl">Flush Buffer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICoach;
