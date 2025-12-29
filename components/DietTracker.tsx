
import React, { useState, useEffect } from 'react';
import { DailyLog, Macros } from '../types';
import { MEAL_PLAN, DAILY_TARGETS, TARGET_RANGES } from '../constants';
import { CheckCircle2, Plus, ChevronDown, Trash2, Sparkles, WifiOff, Loader2, Save, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

declare var process: { env: { API_KEY: string } };

interface DietTrackerProps {
  log: DailyLog;
  updateLog: (updated: Partial<DailyLog>) => void;
  macros: Macros;
}

const MacroGoal: React.FC<{ label: string; val: number; target: number; unit: string; color: string; bg: string }> = ({ label, val, target, unit, color, bg }) => {
  const percent = Math.min(100, (val / target) * 100);
  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col items-center`}>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      <div className={`text-base font-black ${color}`}>
        {Math.round(val)}<span className="text-[10px] opacity-40">/{Math.round(target)}{unit}</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${color.replace('text', 'bg')} transition-all duration-700`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const InputBox = ({ label, val, setVal, colorClass = "border-white/5" }: { label: string, val: string, setVal: (v: string) => void, colorClass?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</label>
    <input 
      type="number" 
      value={val}
      onChange={(e) => setVal(e.target.value)}
      placeholder="0"
      className={`w-full bg-slate-900 border ${colorClass} rounded-xl px-4 py-3 text-white font-bold text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:opacity-20`}
    />
  </div>
);

const DietTracker: React.FC<DietTrackerProps> = ({ log, updateLog, macros }) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<{ message: string; type: 'auth' | 'network' | 'logic' } | null>(null);

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
      setError({ message: "Network offline. AI analysis unavailable.", type: 'network' });
      return;
    }
    if (!customName || customName.length < 2) {
      setError({ message: "Identify food item first.", type: 'logic' });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
        throw new Error("AUTH_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide nutritional data for a standard serving of: "${customName}". Return JSON with keys: kcal, protein, carbs, fat, fiber, grams.`,
        config: {
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
      if (!text) throw new Error("EMPTY_RESPONSE");
      
      // Ultra-robust JSON extraction
      const match = text.match(/\{[\s\S]*\}/);
      const cleanJson = match ? match[0] : text;
      const data = JSON.parse(cleanJson);
      
      setCustomKcal(Math.round(data.kcal || 0).toString());
      setCustomProtein(Math.round(data.protein || 0).toString());
      setCustomCarbs(Math.round(data.carbs || 0).toString());
      setCustomFat(Math.round(data.fat || 0).toString());
      setCustomFiber(Math.round(data.fiber || 0).toString());
      
    } catch (err: any) {
      console.error("Metabolic Engine Trace:", err);
      if (err.message === "AUTH_KEY_MISSING") {
        setError({ message: "AI API Key missing. Please check Netlify Environment Variables.", type: 'auth' });
      } else {
        setError({ message: "AI analysis failed. Please enter macros manually.", type: 'network' });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addCustomEntry = () => {
    const kcal = parseInt(customKcal);
    if (!customName || isNaN(kcal)) {
      setError({ message: "Food Name and Calories are mandatory.", type: 'logic' });
      return;
    }

    const currentCustom = log.meals.custom || [];
    const entryMacros: Macros = { 
      kcal: kcal, 
      protein: parseInt(customProtein) || 0, 
      carbs: parseInt(customCarbs) || 0, 
      fat: parseInt(customFat) || 0, 
      fiber: parseInt(customFiber) || 0, 
      grams: 0 
    };

    updateLog({ 
      meals: { 
        ...log.meals, 
        custom: [...currentCustom, { name: customName, macros: entryMacros }] 
      } 
    });

    setCustomName(''); setCustomKcal(''); setCustomProtein(''); 
    setCustomCarbs(''); setCustomFat(''); setCustomFiber('');
    setShowCustom(false); setError(null);
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

      {/* Manual Entry System */}
      <div className="space-y-4">
        {!showCustom ? (
          <button 
            onClick={() => { setShowCustom(true); setError(null); }}
            className="w-full py-6 bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] flex items-center justify-center gap-4 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 active:scale-95 transition-all"
          >
            <Plus size={16} />
            Add Custom Entry / AI Scan
          </button>
        ) : (
          <div className="stealth-card rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400" />
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Fuel Entry Protocol</h3>
                </div>
                <button onClick={() => setShowCustom(false)} className="text-[10px] font-black text-slate-500 uppercase">Cancel</button>
             </div>

             <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter food name..." 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button 
                    onClick={analyzeWithAI}
                    disabled={isAnalyzing}
                    className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all hover:bg-blue-500 active:scale-90"
                  >
                    {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InputBox label="Kcal" val={customKcal} setVal={setCustomKcal} colorClass="border-white/20" />
                  <InputBox label="Protein" val={customProtein} setVal={setCustomProtein} colorClass="border-blue-500/30" />
                  <InputBox label="Carbs" val={customCarbs} setVal={setCustomCarbs} colorClass="border-emerald-500/30" />
                  <InputBox label="Fat" val={customFat} setVal={setCustomFat} colorClass="border-amber-500/30" />
                </div>
                
                {error && (
                  <div className={`p-4 rounded-2xl flex items-start gap-3 border ${error.type === 'auth' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold leading-tight uppercase tracking-wider">{error.message}</p>
                  </div>
                )}

                <button 
                  onClick={addCustomEntry}
                  className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
                >
                  <Save size={18} />
                  Confirm Entry
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Meal Categories */}
      <div className="space-y-4">
        {MEAL_PLAN.map((cat) => {
          const selectedId = log.meals[cat.id as keyof typeof log.meals] as string;
          const selectedOption = cat.options.find(o => o.id === selectedId);
          const isExpanded = expandedCat === cat.id;

          return (
            <div key={cat.id} className="stealth-card rounded-[32px] overflow-hidden">
              <button 
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedOption ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                    {selectedOption ? <CheckCircle2 size={24} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{cat.label}</h3>
                    <p className="text-sm font-black text-white">{selectedOption ? selectedOption.name : 'Select Protocol'}</p>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 grid grid-cols-1 gap-2 animate-in slide-in-from-top-2">
                  {cat.options.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(cat.id, option.id)}
                      className={`p-4 rounded-2xl text-left border transition-all ${selectedId === option.id ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-white">{option.name}</span>
                        <span className="text-[10px] font-black text-slate-400">{option.kcal} kcal</span>
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[8px] font-bold text-slate-500 uppercase">P: {option.protein}g</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">C: {option.carbs}g</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">F: {option.fat}g</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Entries List */}
      {(log.meals.custom?.length || 0) > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Custom Injections</h3>
          {log.meals.custom?.map((entry, idx) => (
            <div key={idx} className="stealth-card rounded-[32px] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white leading-none mb-1">{entry.name}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{entry.macros.kcal} kcal • {entry.macros.protein}g Protein</p>
                </div>
              </div>
              <button 
                onClick={() => removeCustomEntry(idx)}
                className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500/20 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DietTracker;
