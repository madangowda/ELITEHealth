
import React, { useState, useEffect } from 'react';
import { DailyLog, Macros } from '../types';
import { MEAL_PLAN, DAILY_TARGETS, TARGET_RANGES } from '../constants';
import { CheckCircle2, Plus, ChevronDown, Trash2, Sparkles, WifiOff, Loader2, Save, Info, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

declare var process: { env: { API_KEY: string } };

interface DietTrackerProps {
  log: DailyLog;
  updateLog: (updated: Partial<DailyLog>) => void;
  macros: Macros;
}

const DietTracker: React.FC<DietTrackerProps> = ({ log, updateLog, macros }) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  
  // Manual Input States
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<Macros | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const analyzeWithAI = async () => {
    if (!isOnline) {
      setError("Uplink unavailable. Switching to manual.");
      return;
    }
    if (!customName || customName.length < 2) {
      setError("Please name the food item first.");
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);
    setError(null);

    try {
      // Ensure key exists before making the request
      if (!process.env.API_KEY) {
        throw new Error("API_KEY not configured in environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Nutritional data for: "${customName}". Return JSON with keys: kcal, protein, carbs, fat, fiber, grams. Use standard weights.`,
        config: {
          thinkingConfig: { thinkingBudget: 1024 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              kcal: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
              grams: { type: Type.NUMBER },
            },
            required: ["kcal", "protein", "carbs", "fat", "fiber", "grams"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("AI returned empty stream.");
      
      // DEEP CLEANING: Finds the first { and last } to isolate JSON from any markdown noise
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) throw new Error("Malformed JSON stream.");
      
      const cleanJson = text.substring(firstBrace, lastBrace + 1);
      const data = JSON.parse(cleanJson);
      
      // Auto-populate all fields with high-visibility values
      setCustomKcal(Math.round(data.kcal).toString());
      setCustomProtein(Math.round(data.protein).toString());
      setCustomCarbs(Math.round(data.carbs).toString());
      setCustomFat(Math.round(data.fat).toString());
      setCustomFiber(Math.round(data.fiber).toString());
      
      setAiResult({
        kcal: Math.round(data.kcal),
        protein: Math.round(data.protein),
        carbs: Math.round(data.carbs),
        fat: Math.round(data.fat),
        fiber: Math.round(data.fiber),
        grams: data.grams
      });
    } catch (err: any) {
      console.error("Metabolic Analysis Logic Failure:", err);
      setError("AI Engine Busy. Please fill details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addCustomEntry = () => {
    const kcal = parseInt(customKcal);
    if (!customName || isNaN(kcal)) {
      setError("Name and Calories are required.");
      return;
    }

    const currentCustom = log.meals.custom || [];
    const entryMacros: Macros = { 
      kcal: kcal, 
      protein: parseInt(customProtein) || 0, 
      carbs: parseInt(customCarbs) || 0, 
      fat: parseInt(customFat) || 0, 
      fiber: parseInt(customFiber) || 0, 
      grams: aiResult?.grams || 0 
    };

    updateLog({ 
      meals: { 
        ...log.meals, 
        custom: [...currentCustom, { name: customName, macros: entryMacros }] 
      } 
    });

    // Reset All UI States
    setCustomName(''); setCustomKcal(''); setCustomProtein(''); 
    setCustomCarbs(''); setCustomFat(''); setCustomFiber('');
    setAiResult(null); setShowCustom(false); setError(null);
  };

  const removeCustomEntry = (index: number) => {
    const currentCustom = log.meals.custom || [];
    updateLog({ meals: { ...log.meals, custom: currentCustom.filter((_, i) => i !== index) } });
  };

  const handleSelect = (category: string, optionId: string) => {
    updateLog({ meals: { ...log.meals, [category]: optionId } });
    setExpandedCat(null);
  };

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header HUD */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Metabolic Feed</h2>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Fuel Log</h1>
        </div>
        <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 flex flex-col items-end shadow-lg shadow-blue-500/20 border border-blue-400/20">
          <span className="text-[8px] font-black text-blue-100 uppercase tracking-widest opacity-60">Daily Total</span>
          <span className="text-xl font-black">{Math.round(macros.kcal)} <span className="text-xs font-medium opacity-40">kcal</span></span>
        </div>
      </div>

      {/* Target Progress Card */}
      <div className="stealth-card rounded-[40px] p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Delta</h3>
          </div>
          <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase border border-blue-400/20">
            {TARGET_RANGES.kcal} Protocol
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MacroGoal label="Protein" val={macros.protein} target={DAILY_TARGETS.protein} unit="g" color="text-blue-400" bg="bg-white/5" />
          <MacroGoal label="Carbs" val={macros.carbs} target={DAILY_TARGETS.carbs} unit="g" color="text-emerald-400" bg="bg-white/5" />
          <MacroGoal label="Fat" val={macros.fat} target={DAILY_TARGETS.fat} unit="g" color="text-amber-400" bg="bg-white/5" />
          <MacroGoal label="Fiber" val={macros.fiber} target={DAILY_TARGETS.fiber} unit="g" color="text-indigo-400" bg="bg-white/5" />
        </div>
      </div>

      {/* Meal Selection HUD */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Protocol Meals</h3>
        {MEAL_PLAN.map((cat) => {
          const selectedId = log.meals[cat.id as keyof DailyLog['meals']] as string;
          const selectedOption = cat.options.find(o => o.id === selectedId);
          const isExpanded = expandedCat === cat.id;

          return (
            <div key={cat.id} className={`stealth-card rounded-[32px] overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-blue-500/30' : ''}`}>
              <button 
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                className="w-full p-5 flex justify-between items-center active:bg-white/5"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedOption ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-600'}`}>
                    {selectedId ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Plus size={24} strokeWidth={2.5} />}
                  </div>
                  <div className="text-left">
                    <h3 className={`font-black tracking-tight ${selectedOption ? 'text-white' : 'text-slate-400'}`}>
                      {cat.label.split(' (')[0]}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[140px]">
                      {selectedOption ? selectedOption.name : 'Select Protocol'}
                    </p>
                  </div>
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} className="text-slate-600" />
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-4 duration-300">
                  <div className="max-h-[300px] overflow-y-auto space-y-3 no-scrollbar pr-1">
                    {cat.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(cat.id, opt.id)}
                        className={`w-full text-left p-5 rounded-[24px] border transition-all ${
                          selectedId === opt.id ? 'bg-blue-600 border-blue-400 shadow-xl' : 'bg-slate-800/50 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-black text-sm ${selectedId === opt.id ? 'text-white' : 'text-slate-200'}`}>{opt.name}</span>
                          <span className={`text-[10px] font-black ${selectedId === opt.id ? 'text-blue-100' : 'text-blue-400'}`}>{opt.kcal} kcal</span>
                        </div>
                        <div className={`text-[9px] font-black uppercase tracking-widest ${selectedId === opt.id ? 'text-white/60' : 'text-slate-500'}`}>
                          P:{opt.protein}g • C:{opt.carbs}g • F:{opt.fat}g
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Entry System */}
      <div className="space-y-4">
        {!showCustom ? (
          <button 
            onClick={() => { setShowCustom(true); setError(null); }}
            className="w-full py-6 bg-white/5 border-2 border-dashed border-white/5 rounded-[32px] flex items-center justify-center gap-4 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 active:scale-95 transition-all"
          >
            <Sparkles size={16} />
            AI Metabolic Analysis
          </button>
        ) : (
          <div className="stealth-card rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400" />
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Manual Entry Scan</h3>
                </div>
                {!isOnline && <span className="text-[8px] font-black text-rose-500 uppercase flex items-center gap-1"><WifiOff size={10}/> Offline</span>}
             </div>

             {error && (
               <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                  <AlertCircle size={16} className="text-rose-500" />
                  {error}
               </div>
             )}

             <div className="space-y-4">
                <div className="flex gap-2">
                    <input 
                    placeholder="Identify Food Item..." 
                    className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 font-black text-white focus:border-blue-500 transition-all placeholder:text-slate-600" 
                    value={customName} 
                    onChange={e => { setCustomName(e.target.value); setError(null); }} 
                    />
                    <button 
                        onClick={analyzeWithAI} 
                        disabled={isAnalyzing} 
                        className={`w-16 rounded-2xl flex items-center justify-center transition-all ${isOnline ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95' : 'bg-slate-800 text-slate-600'}`}
                        title="AI Analyze"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18}/>}
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <ManualInput label="Calories" value={customKcal} setter={setCustomKcal} unit="kcal" color="border-white/20" />
                    <ManualInput label="Protein" value={customProtein} setter={setCustomProtein} unit="g" color="border-blue-500/40" />
                    <ManualInput label="Carbs" value={customCarbs} setter={setCustomCarbs} unit="g" color="border-emerald-500/40" />
                    <ManualInput label="Fat" value={customFat} setter={setCustomFat} unit="g" color="border-amber-500/40" />
                    <ManualInput label="Fiber" value={customFiber} setter={setCustomFiber} unit="g" color="border-indigo-500/40" className="col-span-2" />
                </div>
             </div>

             <div className="flex gap-3 pt-2">
               <button 
                 onClick={() => { setShowCustom(false); setAiResult(null); setError(null); }} 
                 className="flex-1 py-5 bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
               >
                 Abort
               </button>
               <button 
                 onClick={addCustomEntry} 
                 className="flex-[2] bg-white text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
               >
                 <Save size={16} />
                 Commit Entry
               </button>
             </div>
          </div>
        )}

        {/* List of Custom Entries */}
        {log.meals.custom && log.meals.custom.length > 0 && (
          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-2">Added Scans</h4>
             {log.meals.custom.map((entry, idx) => (
               <div key={idx} className="stealth-card rounded-[24px] p-5 flex justify-between items-center group">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-white">{entry.name}</h5>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {entry.macros.kcal} kcal • P:{entry.macros.protein}g • C:{entry.macros.carbs}g
                      </span>
                    </div>
                 </div>
                 <button 
                   onClick={() => removeCustomEntry(idx)}
                   className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-500 bg-rose-500/10 transition-opacity"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ManualInput = ({ label, value, setter, unit, color = "border-white/10", className = "" }: any) => (
    <div className={`relative ${className}`}>
        <input 
            placeholder={label} 
            type="number" 
            className={`w-full bg-slate-900 border ${color} rounded-2xl px-5 py-5 font-black text-white focus:border-blue-500 transition-all placeholder:text-slate-500 text-sm`} 
            value={value} 
            onChange={e => setter(e.target.value)} 
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-600 uppercase tracking-widest">{unit}</span>
    </div>
);

const MacroGoal: React.FC<{ label: string; val: number; target: number; unit: string; color: string; bg: string }> = ({ label, val, target, unit, color, bg }) => {
  const percent = Math.min(100, (val / target) * 100);
  return (
    <div className={`${bg} rounded-3xl p-5 border border-white/5 flex flex-col items-start shadow-inner`}>
      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</span>
      <div className={`text-sm font-black ${color} mb-3`}>
        {Math.round(val)}<span className="text-[9px] opacity-30 ml-0.5">/{Math.round(target)}{unit}</span>
      </div>
      <div className="w-full progress-pill bg-white/5">
        <div 
          className={`h-full ${color.replace('text', 'bg')} transition-all duration-1000 ease-out`} 
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
};

export default DietTracker;
