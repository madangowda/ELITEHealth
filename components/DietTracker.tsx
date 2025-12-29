
import React, { useState, useEffect } from 'react';
import { DailyLog, Macros } from '../types';
import { MEAL_PLAN, DAILY_TARGETS, TARGET_RANGES } from '../constants';
import { CheckCircle2, Plus, ChevronDown, Trash2, Sparkles, Loader2, Save, AlertCircle, Key, Info, Utensils } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

declare var process: { env: { API_KEY: string } };
declare var window: any;

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
  const [hasKey, setHasKey] = useState<boolean>(true); // Default to true to attempt AI calls
  
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
    const checkKeyStatus = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected || (!!process.env.API_KEY && process.env.API_KEY !== 'undefined'));
      }
    };
    checkKeyStatus();
    
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Rule: Assume success after trigger to mitigate race conditions
        setHasKey(true);
        setError(null);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const analyzeWithAI = async () => {
    if (!isOnline) {
      setError({ message: "Network connection required for AI scanning.", type: 'network' });
      return;
    }
    if (!customName || customName.length < 2) {
      setError({ message: "Please enter a valid food description first.", type: 'logic' });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const apiKey = process.env.API_KEY;
      
      // If key is missing, prompt selection immediately
      if (!apiKey || apiKey === "undefined") {
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          setHasKey(true);
        } else {
          throw new Error("AUTH_KEY_MISSING");
        }
      }

      // Initialize fresh for every call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze: "${customName}". Return JSON: {kcal, protein, carbs, fat, fiber, grams}.`,
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
      
      const match = text.match(/\{[\s\S]*\}/);
      const data = JSON.parse(match ? match[0] : text);
      
      setCustomKcal(Math.round(data.kcal || 0).toString());
      setCustomProtein(Math.round(data.protein || 0).toString());
      setCustomCarbs(Math.round(data.carbs || 0).toString());
      setCustomFat(Math.round(data.fat || 0).toString());
      setCustomFiber(Math.round(data.fiber || 0).toString());
      
    } catch (err: any) {
      console.error("Metabolic Engine Error:", err);
      if (err.message?.includes("not found") || err.message?.includes("API_KEY_INVALID") || err.message === "AUTH_KEY_MISSING") {
        setError({ message: "Gemini API authorization missing. Click 'Link Key' below.", type: 'auth' });
      } else {
        setError({ message: "AI Engine is temporarily unavailable. Manual entry is active.", type: 'network' });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addCustomEntry = () => {
    const kcal = parseInt(customKcal);
    if (!customName || isNaN(kcal)) {
      setError({ message: "Food name and calorie values are required.", type: 'logic' });
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
      <div className="stealth-card rounded-[32px] p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <MacroGoal label="Protein" val={macros.protein} target={DAILY_TARGETS.protein} unit="g" color="text-blue-400" bg="bg-blue-500/5" />
          <MacroGoal label="Carbs" val={macros.carbs} target={DAILY_TARGETS.carbs} unit="g" color="text-emerald-400" bg="bg-emerald-500/5" />
          <MacroGoal label="Fat" val={macros.fat} target={DAILY_TARGETS.fat} unit="g" color="text-amber-400" bg="bg-amber-500/5" />
          <MacroGoal label="Fiber" val={macros.fiber} target={DAILY_TARGETS.fiber} unit="g" color="text-indigo-400" bg="bg-indigo-500/5" />
        </div>
      </div>

      {/* Meal Categories */}
      <div className="space-y-4">
        {MEAL_PLAN.map((cat) => (
          <div key={cat.id} className="bg-white/5 rounded-[32px] overflow-hidden border border-white/5">
            <button 
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="w-full p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                  <Utensils size={18} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-white">{cat.label}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {log.meals[cat.id as keyof DailyLog['meals']] ? cat.options.find(o => o.id === log.meals[cat.id as keyof DailyLog['meals']])?.name : 'Nothing Logged'}
                  </p>
                </div>
              </div>
              <ChevronDown size={20} className={`text-slate-500 transition-transform ${expandedCat === cat.id ? 'rotate-180' : ''}`} />
            </button>
            
            {expandedCat === cat.id && (
              <div className="px-4 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
                {cat.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(cat.id, opt.id)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all ${
                      log.meals[cat.id as keyof DailyLog['meals']] === opt.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-black text-xs">{opt.name}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{opt.kcal} kcal • {opt.quantity}</div>
                    </div>
                    {log.meals[cat.id as keyof DailyLog['meals']] === opt.id && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Entries */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Custom Fuel</h3>
          <button 
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest"
          >
            <Plus size={14} /> Add Manual
          </button>
        </div>

        {log.meals.custom?.map((entry, idx) => (
          <div key={idx} className="stealth-card rounded-[32px] p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">{entry.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{entry.macros.kcal} kcal</p>
              </div>
            </div>
            <button onClick={() => removeCustomEntry(idx)} className="text-slate-600 hover:text-rose-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* AI Custom Form Modal */}
      {showCustom && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f172a] rounded-[40px] border border-white/10 shadow-2xl p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Manual Log</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">AI-Powered Macro Analysis</p>
              </div>
              <button onClick={() => { setShowCustom(false); setError(null); }} className="text-slate-500 hover:text-white">
                <Trash2 size={24} />
              </button>
            </div>

            {error && (
              <div className={`p-4 rounded-2xl flex items-start gap-3 border ${error.type === 'auth' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-[11px] font-bold leading-relaxed">{error.message}</p>
                  {error.type === 'auth' && (
                    <button onClick={handleConnectKey} className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      <Key size={12} /> Link Key
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Food Description</label>
                <div className="relative">
                  <input 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., 200g of Grilled Chicken"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none pr-12"
                  />
                  <button 
                    onClick={analyzeWithAI}
                    disabled={isAnalyzing}
                    className="absolute right-2 top-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 disabled:opacity-50 transition-all"
                  >
                    {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputBox label="Calories" val={customKcal} setVal={setCustomKcal} colorClass="border-blue-500/20" />
                <InputBox label="Protein (g)" val={customProtein} setVal={setCustomProtein} />
                <InputBox label="Carbs (g)" val={customCarbs} setVal={setCustomCarbs} />
                <InputBox label="Fat (g)" val={customFat} setVal={setCustomFat} />
              </div>
            </div>

            <button 
              onClick={addCustomEntry}
              className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Confirm Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietTracker;
