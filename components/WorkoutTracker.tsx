
import React, { useState, useRef, useEffect } from 'react';
import { DailyLog, Exercise, UserProfile, CustomExerciseEntry } from '../types';
import { WORKOUT_PLAN, HOME_GYM_WORKOUT_PLAN } from '../constants';
import { CheckCircle2, Circle, Clock, Info, ChevronDown, AlertCircle, Loader2, Plus, Zap, Layers, Repeat, Cpu, Sparkles, Trash2, Save, Minus, Box, Edit3 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

declare var process: { env: { API_KEY: string } };

interface WorkoutTrackerProps {
  log: DailyLog;
  updateLog: (updated: Partial<DailyLog>) => void;
  profile: UserProfile;
}

const VideoPlayer: React.FC<{ exercise: Exercise; isExpanded: boolean }> = ({ exercise, isExpanded }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isYouTube = exercise.videoUrl?.includes('youtube.com') || exercise.videoUrl?.includes('youtu.be');
  
  useEffect(() => {
    if (isExpanded && videoRef.current && !isYouTube) {
      videoRef.current.play().catch(() => {});
    }
  }, [isExpanded, isYouTube]);

  if (!exercise.videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-slate-50/50">
        <AlertCircle size={32} className="text-slate-300 mb-3 opacity-20" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tutorial Offline</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-slate-50/50">
        <AlertCircle size={32} className="text-rose-300 mb-3" />
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Invalid Source</span>
      </div>
    );
  }

  if (isYouTube) {
    const videoId = exercise.videoUrl.split('/').pop()?.split('?')[0];
    return (
      <iframe 
        src={`${exercise.videoUrl}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1`}
        title={exercise.name}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <>
      <video 
        ref={videoRef}
        src={exercise.videoUrl}
        autoPlay loop muted playsInline preload="auto"
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400">
          <Loader2 className="animate-spin mb-3" size={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing Feed...</span>
        </div>
      )}
    </>
  );
};

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ log, updateLog, profile }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom Exercise State
  const [customName, setCustomName] = useState('');
  const [customSets, setCustomSets] = useState('3');
  const [customReps, setCustomReps] = useState('12');
  const [customBurn, setCustomBurn] = useState('');

  const dayOfWeek = new Date(log.date).getDay();
  const adjustedIndex = (dayOfWeek + 6) % 7;
  const plan = profile.workoutMode === 'homegym' ? HOME_GYM_WORKOUT_PLAN : WORKOUT_PLAN;
  const currentWorkout = plan[adjustedIndex];

  const analyzeExercise = async () => {
    if (!customName || customName.length < 2) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Estimate calories burned for a single set/round of: "${customName}". The user intends to do ${customReps} reps/intensity. Return JSON only with field: kcalPerSet.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: { kcalPerSet: { type: Type.NUMBER } },
            required: ["kcalPerSet"],
          },
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text.replace(/```json|```/g, "").trim());
        setCustomBurn(Math.round(data.kcalPerSet * parseInt(customSets)).toString());
      } else {
        throw new Error("Empty response from AI engine");
      }
    } catch (err) {
      setError("AI unavailable. Please input burn manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addCustomExercise = () => {
    if (!customName || !customBurn) return;
    const entry: CustomExerciseEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: customName,
      sets: parseInt(customSets),
      reps: customReps,
      kcalBurn: parseInt(customBurn),
      timestamp: Date.now()
    };
    const currentCustom = log.customExercises || [];
    updateLog({ customExercises: [...currentCustom, entry] });
    setCustomName(''); setCustomBurn(''); setCustomReps('12'); setCustomSets('3'); setShowCustom(false);
  };

  const removeCustomExercise = (id: string) => {
    const currentCustom = log.customExercises || [];
    updateLog({ customExercises: currentCustom.filter(ex => ex.id !== id) });
  };

  const toggleExercise = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCompleted = log.completedExercises.includes(id);
    const newList = isCompleted 
      ? log.completedExercises.filter(i => i !== id)
      : [...log.completedExercises, id];
    updateLog({ completedExercises: newList });
  };

  const progressPercent = currentWorkout.exercises.length 
    ? (log.completedExercises.length / currentWorkout.exercises.length) * 100 
    : 100;

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{currentWorkout.day} Focus</h2>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{currentWorkout.type}</h1>
            {profile.workoutMode === 'homegym' && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest">HG</span>
            )}
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100">
          <span className="text-xs font-black uppercase tracking-tighter">{Math.round(progressPercent)}% Ready</span>
        </div>
      </div>

      {/* Flexible Fast Walking Hud */}
      <div className="dark-hud rounded-[40px] p-7 shadow-xl shadow-slate-900/20 flex justify-between items-center group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-500/20" />
        <div className="relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Fast Walking Protocol</h3>
          <div className="text-xs font-black text-slate-500 mb-1">Duration Goal: {currentWorkout.walkingTarget} min</div>
          <div className="flex items-center gap-1.5 mt-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            <Zap size={10} className="text-orange-400" />
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
              Burned: {Math.round((log.walkingMinutes || 0) * 5)} kcal
            </span>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-24">
            <input 
              type="number"
              value={log.walkingMinutes || ''}
              onChange={(e) => updateLog({ walkingMinutes: parseInt(e.target.value) || 0 })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-2xl font-black text-center text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="0"
            />
            <div className="absolute -bottom-5 left-0 right-0 text-center text-[8px] font-black text-slate-600 uppercase tracking-widest">Minutes</div>
          </div>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Active Routine</h3>
        {currentWorkout.exercises.map((ex) => {
          const completed = log.completedExercises.includes(ex.id);
          const isExpanded = expandedId === ex.id;
          const estBurn = Math.round(ex.kcalPerUnit * (ex.unit === 'second' ? 40 : 1) * ex.sets);
          
          return (
            <div
              key={ex.id}
              className={`stealth-card rounded-[32px] transition-all duration-500 overflow-hidden ${
                completed ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white'
              }`}
            >
              <div 
                onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                className="p-5 flex items-center gap-5 cursor-pointer"
              >
                <button
                  onClick={(e) => toggleExercise(ex.id, e)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-50 text-slate-300'}`}
                >
                  {completed ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Circle size={28} strokeWidth={2.5} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-base tracking-tight leading-none ${completed ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                    <span className="flex items-center gap-1"><Layers size={10}/> {ex.sets} Sets</span>
                    <span className="flex items-center gap-1 text-orange-500 font-black"><Zap size={10}/> Burn: {estBurn} kcal</span>
                    {ex.machine && (
                      <span className="flex items-center gap-1 text-indigo-400 font-black"><Cpu size={10}/> {ex.machine}</span>
                    )}
                  </div>
                </div>

                <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} className="text-slate-300" />
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-6 space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="relative rounded-[24px] overflow-hidden aspect-[16/10] bg-slate-900 shadow-2xl border border-slate-800">
                    <VideoPlayer exercise={ex} isExpanded={isExpanded} />
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Info size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Protocol Tips</span>
                    </div>
                    {ex.formTips?.map((tip, i) => (
                      <div key={i} className="flex gap-4 text-xs text-slate-600 font-bold leading-relaxed">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Exercise Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Custom Protocols</h3>
          <button 
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest bg-blue-500/5 px-3 py-2 rounded-xl border border-blue-500/10 active:scale-95 transition-all"
          >
            <Plus size={14} /> AI Engineer
          </button>
        </div>

        {log.customExercises?.map((ex) => (
          <div key={ex.id} className="stealth-card rounded-[32px] p-5 flex items-center justify-between group border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">
                  {ex.name} 
                  <span className="text-[10px] text-blue-400 font-black ml-2 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    {ex.sets} × {ex.reps}
                  </span>
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <Zap size={10} className="text-orange-500" />
                  <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Burned Calories: {ex.kcalBurn} kcal</p>
                </div>
              </div>
            </div>
            <button onClick={() => removeCustomExercise(ex.id)} className="text-slate-600 hover:text-rose-500 transition-colors p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* AI Exercise Modal */}
      {showCustom && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-[40px] border border-white/10 shadow-2xl p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">AI Protocol Engineer</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Metabolic Cost Estimation</p>
              </div>
              <button onClick={() => setShowCustom(false)} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                <Minus size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Protocol Description (e.g. Boxing, Pullups)</label>
                <div className="relative">
                  <input 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Describe activity..."
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-4 text-white font-bold text-sm outline-none pr-14 focus:border-blue-500/50 transition-colors"
                  />
                  <button 
                    onClick={analyzeExercise}
                    disabled={isAnalyzing}
                    className="absolute right-2 top-2 bottom-2 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 disabled:opacity-50 transition-all"
                  >
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Sets / Rounds</label>
                  <input type="number" value={customSets} onChange={(e) => setCustomSets(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-blue-500/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Reps / Round Intensity</label>
                  <input type="text" value={customReps} onChange={(e) => setCustomReps(e.target.value)} placeholder="e.g. 15, 3min" className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-blue-500/30" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Total Estimated Burn (kcal)</label>
                <div className="relative">
                   <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 opacity-50" size={16} />
                   <input type="number" value={customBurn} onChange={(e) => setCustomBurn(e.target.value)} placeholder="AI will estimate or enter manual" className="w-full bg-slate-900 border border-orange-500/20 rounded-xl pl-12 pr-4 py-4 text-white font-black text-lg outline-none focus:border-orange-500/50" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={addCustomExercise}
                className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> Inject Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTracker;
