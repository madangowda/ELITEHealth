
import React, { useState } from 'react';
import { DailyLog, Macros } from '../types';
import { MEAL_PLAN, DAILY_TARGETS, TARGET_RANGES } from '../constants';
import { CheckCircle2, Plus, ChevronDown, ChevronUp, Trash2, Sparkles } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// Declare process for TypeScript to satisfy the strict API key requirement
declare var process: { env: { API_KEY: string } };

interface DietTrackerProps {
  log: DailyLog;
  updateLog: (updated: Partial<DailyLog>) => void;
  macros: Macros;
}

const DietTracker: React.FC<DietTrackerProps> = ({ log, updateLog, macros }) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<Macros | null>(null);

  const handleSelect = (category: string, optionId: string) => {
    updateLog({
      meals: {
        ...log.meals,
        [category]: optionId
      }
    });
    setExpandedCat(null);
  };

  const analyzeWithAI = async () => {
    if (!customName || customName.length < 3) return;
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the nutritional content of this dish: "${customName}". Provide estimates for a standard single serving including the weight in grams.`,
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
      
      const responseText = response.text;
      if (!responseText) throw new Error("Empty AI response");
      
      const data = JSON.parse(responseText);
      setAiResult(data);
      setCustomKcal(data.kcal.toString());
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addCustomEntry = () => {
    const kcal = parseInt(customKcal);
    if (!customName || (isNaN(kcal) && !aiResult)) return;
    const currentCustom = log.meals.custom || [];
    const entryMacros: Macros = aiResult || { kcal, protein: 0, carbs: 0, fat: 0, fiber: 0, grams: 0 };
    updateLog({ meals: { ...log.meals, custom: [...currentCustom, { name: customName, macros: entryMacros }] } });
    setCustomName(''); setCustomKcal(''); setAiResult(null); setShowCustom(false);
  };

  const removeCustomEntry = (index: number) => {
    const currentCustom = log.meals.custom || [];
    updateLog({ meals: { ...log.meals, custom: currentCustom.filter((_, i) => i !== index) } });
  };

  return (
    <div className="p-5 space-y-6 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fuel Log</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Disciplined Protocol</p>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl px-4 py-2 flex flex-col items-end shadow-lg">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Current Intake</span>
          <span className="text-lg font-black">{Math.round(macros.kcal)} <span className="text-xs opacity-50">kcal</span></span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Protocol</h3>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{TARGET_RANGES.kcal} kcal</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MacroGoal label="Protein" val={macros.protein} target={DAILY_TARGETS.protein} range={TARGET_RANGES.protein} unit="g" color="text-blue-600" bg="bg-blue-50" />
          <MacroGoal label="Carbs" val={macros.carbs} target={DAILY_TARGETS.carbs} range={TARGET_RANGES.carbs} unit="g" color="text-emerald-600" bg="bg-emerald-50" />
          <MacroGoal label="Fat" val={macros.fat} target={DAILY_TARGETS.fat} range={TARGET_RANGES.fat} unit="g" color="text-amber-600" bg="bg-amber-50" />
          <MacroGoal label="Fiber" val={macros.fiber} target={DAILY_TARGETS.fiber} range={TARGET_RANGES.fiber} unit="g" color="text-indigo-600" bg="bg-indigo-50" />
        </div>
      </div>

      <div className="space-y-4">
        {MEAL_PLAN.map((cat) => {
          const selectedId = log.meals[cat.id as keyof DailyLog['meals']] as string;
          const selectedOption = cat.options.find(o => o.id === selectedId);
          const isExpanded = expandedCat === cat.id;

          return (
            <div key={cat.id} className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
              <button 
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                className="w-full p-5 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedOption ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                    {selectedId ? <CheckCircle2 size={24} /> : <Plus size={24} />}
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-slate-800 tracking-tight">{cat.label.split(' (')[0]}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[140px]">
                      {selectedOption ? selectedOption.name : 'Selection Required'}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="bg-slate-50/80 p-4 pt-2 border-t border-slate-100">
                  <div className="max-h-[380px] overflow-y-auto pr-2 space-y-2 overscroll-contain touch-auto scroll-smooth">
                    {cat.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(cat.id, opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          selectedId === opt.id 
                            ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-50' 
                            : 'bg-white border-slate-100 active:scale-[0.98]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-bold text-sm ${selectedId === opt.id ? 'text-blue-900' : 'text-slate-700'}`}>
                            {opt.name}
                          </span>
                          <span className="text-xs font-black text-blue-600">{opt.kcal} kcal</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                          <span>{opt.quantity}</span>
                          <span>P:{opt.protein}g C:{opt.carbs}g F:{opt.fat}g</span>
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

      <div className="space-y-4">
        {log.meals.custom?.map((entry, idx) => (
          <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-[24px] p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xs">AI</div>
              <div>
                <h4 className="font-bold text-indigo-900 text-sm leading-none">{entry.name}</h4>
                <span className="text-[10px] font-black text-slate-500 uppercase">{entry.macros.kcal} kcal</span>
              </div>
            </div>
            <button onClick={() => removeCustomEntry(idx)} className="text-rose-500 p-2"><Trash2 size={18} /></button>
          </div>
        ))}

        {!showCustom ? (
          <button 
            onClick={() => setShowCustom(true)}
            className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[24px] flex items-center justify-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-slate-100"
          >
            <Sparkles size={18} className="text-blue-500" />
            Add Manual / AI Entry
          </button>
        ) : (
          <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100 space-y-4">
             <input placeholder="Dish Name..." className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold" value={customName} onChange={e => setCustomName(e.target.value)} />
             <div className="flex gap-2">
               <input placeholder="Kcal" type="number" className="w-1/2 bg-slate-50 border-none rounded-xl p-4 font-bold" value={customKcal} onChange={e => setCustomKcal(e.target.value)} />
               <button onClick={analyzeWithAI} disabled={isAnalyzing} className="w-1/2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">
                {isAnalyzing ? '...' : 'AI Analyze'}
               </button>
             </div>
             <button onClick={addCustomEntry} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs">Log Entry</button>
             <button onClick={() => setShowCustom(false)} className="w-full text-slate-400 text-xs font-bold py-2 uppercase">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

const MacroGoal: React.FC<{ label: string; val: number; target: number; range: string; unit: string; color: string; bg: string }> = ({ label, val, target, range, unit, color, bg }) => (
  <div className={`${bg} rounded-2xl p-4 border border-white flex flex-col items-center shadow-sm`}>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
    <div className={`text-base font-black ${color}`}>
      {Math.round(val)}<span className="text-[8px] opacity-40 ml-0.5">/{range}{unit}</span>
    </div>
    <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
      <div className={`h-full ${color.replace('text', 'bg')} transition-all duration-700`} style={{ width: `${Math.min(100, (val/target)*100)}%` }} />
    </div>
  </div>
);

export default DietTracker;
