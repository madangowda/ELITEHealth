import React, { useState, useEffect } from 'react';
import { DailyLog, Macros, MealEntry, CustomMealEntry } from '../types';
import { MEAL_PLAN, DAILY_TARGETS } from '../constants';
import { CheckCircle2, Plus, ChevronDown, Trash2, Sparkles, Loader2, Save, AlertCircle, Utensils, Hash, Minus, Edit3 } from 'lucide-react';
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
    <div className={`${bg} rounded-2xl p-4 flex flex-col items-center border border-white/5`}>
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

const MiniMacro: React.FC<{ l: string; v: number; c: string }> = ({ l, v, c }) => (
  <div className="flex items-center gap-0.5">
    <span className="text-[8px] font-black text-slate-500">{l}</span>
    <span className={`text-[10px] font-black ${c}`}>{Math.round(v)}</span>
  </div>
);

const InputBox = ({ label, val, setVal, colorClass = "border-white/5", step = "any" }: { label: string, val: string, setVal: (v: string) => void, colorClass?: string, step?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</label>
    <input 
      type="number" 
      step={step}
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
  const [customQty, setCustomQty] = useState('1.0');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      setError("Network connection required for AI scanning.");
      return;
    }
    if (!customName || customName.length < 2) {
      setError("Please enter a food description first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide estimated nutritional data for a standard single serving of: "${customName}". Return JSON only with fields: kcal, protein, carbs, fat, fiber.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              kcal: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER }
            },
            required: ["kcal", "protein", "carbs", "fat", "fiber"],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanJson);
        setCustomKcal(Math.round(data.kcal || 0).toString());
        setCustomProtein(Math.round(data.protein || 0).toString());
        setCustomCarbs(Math.round(data.carbs || 0).toString());
        setCustomFat(Math.round(data.fat || 0).toString());
        setCustomFiber(Math.round(data.fiber || 0).toString());
      }
    } catch (err: any) {
      setError("AI analysis unavailable. Manual entry is active.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addCustomEntry = () => {
    const kcal = parseFloat(customKcal);
    const qty = parseFloat(customQty) || 1.0;
    if (!customName || isNaN(kcal)) return;

    const currentCustom = log.meals.custom || [];
    const entry: CustomMealEntry = {
      name: customName,
      qty: qty,
      macros: { 
        kcal: kcal, 
        protein: parseFloat(customProtein) || 0, 
        carbs: parseFloat(customCarbs) || 0, 
        fat: parseFloat(customFat) || 0, 
        fiber: parseFloat(customFiber) || 0 
      }
    };

    updateLog({ meals: { ...log.meals, custom: [...currentCustom, entry] } });
    setCustomName(''); setCustomKcal(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat(''); setCustomFiber(''); setCustomQty('1.0');
    setShowCustom(false);
  };

  const removeCustomEntry = (index: number) => {
    const currentCustom = log.meals.custom || [];
    updateLog({ meals: { ...log.meals, custom: currentCustom.filter((_, i) => i !== index) } });
  };

  const handleSelectMeal = (category: string, optionId: string) => {
    const newMeals = { ...log.meals };
    const currentEntry = (newMeals as any)[category];
    if (currentEntry?.id === optionId) {
      delete (newMeals as any)[category];
    } else {
      (newMeals as any)[category] = { id: optionId, qty: 1.0 };
    }
    updateLog({ meals: newMeals });
  };

  const updateMealQty = (category: string, newQty: number) => {
    const currentEntry = log.meals[category as keyof DailyLog['meals']] as MealEntry;
    if (!currentEntry) return;
    updateLog({ meals: { ...log.meals, [category]: { ...currentEntry, qty: Math.max(0.01, newQty) } } });
  };

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Fuel Status</h2>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Metabolic Log</h1>
        </div>
        <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 flex flex-col items-end shadow-lg shadow-blue-500/20 border border-blue-400/20">
          <span className="text-[8px] font-black text-blue-100 uppercase tracking-widest opacity-60">Total K</span>
          <span className="text-xl font-black">{Math.round(macros.kcal)}</span>
        </div>
      </div>

      <div className="stealth-card rounded-[32px] p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <MacroGoal label="P (Protein)" val={macros.protein} target={DAILY_TARGETS.protein} unit="g" color="text-blue-400" bg="bg-blue-500/5" />
          <MacroGoal label="C (Carbs)" val={macros.carbs} target={DAILY_TARGETS.carbs} unit="g" color="text-emerald-400" bg="bg-emerald-500/5" />
          <MacroGoal label="F (Fat)" val={macros.fat} target={DAILY_TARGETS.fat} unit="g" color="text-amber-400" bg="bg-amber-500/5" />
          <MacroGoal label="Fi (Fiber)" val={macros.fiber} target={DAILY_TARGETS.fiber} unit="g" color="text-indigo-400" bg="bg-indigo-500/5" />
        </div>
      </div>

      {/* Main Meal Selection */}
      <div className="space-y-4">
        {MEAL_PLAN.map((cat) => {
          const entry = log.meals[cat.id as keyof DailyLog['meals']] as MealEntry;
          const selectedOption = entry ? cat.options.find(o => o.id === entry.id) : null;
          
          return (
            <div key={cat.id} className="bg-white/5 rounded-[32px] overflow-hidden border border-white/5">
              <button 
                onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                className="w-full p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                    <Utensils size={18} />
                  </div>
                  <div className="text-left min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{cat.label}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate">
                      {selectedOption ? `${selectedOption.name} (x${entry.qty})` : 'Awaiting Injection'}
                    </p>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-slate-500 transition-transform ${expandedCat === cat.id ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedCat === cat.id && (
                <div className="px-4 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  {selectedOption && (
                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between mb-2">
                      <div className="flex flex-col flex-1">
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Multiplier</span>
                        <div className="flex items-center gap-2">
                           <input 
                              type="number"
                              step="any"
                              value={entry.qty}
                              onChange={(e) => updateMealQty(cat.id, parseFloat(e.target.value) || 1.0)}
                              className="w-16 bg-slate-900 border border-blue-500/30 rounded-lg px-2 py-1 text-xs font-black text-white outline-none"
                           />
                           <span className="text-[10px] font-bold text-slate-400">servings</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateMealQty(cat.id, Math.max(0.1, entry.qty - 0.25))} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform"><Minus size={16}/></button>
                        <button onClick={() => updateMealQty(cat.id, entry.qty + 0.25)} className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform"><Plus size={16}/></button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    {cat.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectMeal(cat.id, opt.id)}
                        className={`w-full p-4 rounded-2xl flex flex-col gap-2 text-left transition-all ${
                          entry?.id === opt.id 
                          ? 'bg-blue-600 border-blue-400 shadow-lg' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <div className={`font-black text-xs ${entry?.id === opt.id ? 'text-white' : 'text-slate-200'}`}>{opt.name}</div>
                          {entry?.id === opt.id && <CheckCircle2 size={14} className="text-white shrink-0" />}
                        </div>
                        
                        <div className="flex gap-4 items-center">
                          <div className="flex items-center gap-1">
                             <span className="text-[8px] font-black text-slate-500">K</span>
                             <span className={`text-[11px] font-black ${entry?.id === opt.id ? 'text-blue-100' : 'text-slate-300'}`}>{opt.kcal}</span>
                          </div>
                          <div className="flex gap-3">
                            <MiniMacro l="P" v={opt.protein} c={entry?.id === opt.id ? 'text-white' : 'text-blue-400'} />
                            <MiniMacro l="C" v={opt.carbs} c={entry?.id === opt.id ? 'text-white' : 'text-emerald-400'} />
                            <MiniMacro l="F" v={opt.fat} c={entry?.id === opt.id ? 'text-white' : 'text-amber-400'} />
                            <MiniMacro l="Fi" v={opt.fiber} c={entry?.id === opt.id ? 'text-white' : 'text-indigo-400'} />
                          </div>
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

      {/* Custom Injection Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Custom Fuel Injection</h3>
          <button 
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest bg-blue-500/5 px-3 py-2 rounded-xl border border-blue-500/10 active:scale-95 transition-all"
          >
            <Plus size={14} /> AI Scan / Manual
          </button>
        </div>

        {log.meals.custom?.map((entry, idx) => (
          <div key={idx} className="stealth-card rounded-[32px] p-5 flex items-center justify-between group border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">{entry.name} <span className="text-[10px] text-blue-400 ml-1">x{entry.qty}</span></h4>
                <div className="flex gap-4 mt-1.5">
                  <div className="flex items-center gap-1">
                     <span className="text-[8px] font-black text-slate-500">K</span>
                     <span className="text-[10px] font-black text-slate-300">{Math.round(entry.macros.kcal * entry.qty)}</span>
                  </div>
                  <MiniMacro l="P" v={entry.macros.protein * entry.qty} c="text-blue-400" />
                  <MiniMacro l="C" v={entry.macros.carbs * entry.qty} c="text-emerald-400" />
                  <MiniMacro l="F" v={entry.macros.fat * entry.qty} c="text-amber-400" />
                </div>
              </div>
            </div>
            <button onClick={() => removeCustomEntry(idx)} className="text-slate-600 hover:text-rose-500 transition-colors p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Manual Injection Modal */}
      {showCustom && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-[40px] border border-white/10 shadow-2xl p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">AI Fuel Scan</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Non-Plan Metabolic Entry</p>
              </div>
              <button onClick={() => { setShowCustom(false); setError(null); }} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                <Minus size={20} />
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Description (e.g. 200g Greek Yogurt)</label>
                <div className="relative">
                  <input 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter food details..."
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-4 text-white font-bold text-sm outline-none pr-14 focus:border-blue-500/50 transition-colors"
                  />
                  <button 
                    onClick={analyzeWithAI}
                    disabled={isAnalyzing}
                    className="absolute right-2 top-2 bottom-2 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 disabled:opacity-50 transition-all"
                  >
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-5 space-y-2">
                <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Multiplier (Servings)</label>
                <input 
                  type="number" 
                  step="any"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                  placeholder="1.0"
                  className="w-full bg-slate-900 border border-blue-500/20 rounded-xl px-4 py-3 text-white font-black text-sm outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputBox label="K (Calories)" val={customKcal} setVal={setCustomKcal} colorClass="border-blue-500/20" />
                <InputBox label="P (Protein)" val={customProtein} setVal={setCustomProtein} />
                <InputBox label="C (Carbs)" val={customCarbs} setVal={setCustomCarbs} />
                <InputBox label="F (Fat)" val={customFat} setVal={setCustomFat} />
                <div className="col-span-2">
                  <InputBox label="Fi (Fiber)" val={customFiber} setVal={setCustomFiber} />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={addCustomEntry}
                className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> Confirm Injection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietTracker;