
import React, { useState, useRef, useEffect } from 'react';
import { DailyLog, Exercise } from '../types';
import { WORKOUT_PLAN } from '../constants';
import { CheckCircle2, Circle, Clock, PlayCircle, Info, ChevronDown, AlertCircle, Loader2, RefreshCw, Box, Repeat, Zap, Layers } from 'lucide-react';

interface WorkoutTrackerProps {
  log: DailyLog;
  updateLog: (updated: Partial<DailyLog>) => void;
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
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tutorial Unlocked In V2</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-slate-50/50">
        <AlertCircle size={32} className="text-rose-300 mb-3" />
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Feed Offline / Invalid Source</span>
      </div>
    );
  }

  if (isYouTube) {
    const videoId = exercise.videoUrl.split('/').pop()?.split('?')[0];
    return (
      <iframe 
        src={`${exercise.videoUrl}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
        title={exercise.name}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ log, updateLog }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const dayOfWeek = new Date(log.date).getDay();
  const adjustedIndex = (dayOfWeek + 6) % 7;
  const currentWorkout = WORKOUT_PLAN[adjustedIndex];

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{currentWorkout.type}</h1>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100">
          <span className="text-xs font-black uppercase tracking-tighter">{Math.round(progressPercent)}% Ready</span>
        </div>
      </div>

      {/* Cardio Hud */}
      <div className="dark-hud rounded-[40px] p-7 shadow-xl shadow-slate-900/20 flex justify-between items-center group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-500/20" />
        <div className="relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Cardio Protocol</h3>
          <div className="text-3xl font-black tracking-tight">{log.walkingMinutes} <span className="text-sm font-medium opacity-30">/ {currentWorkout.walkingTarget} min</span></div>
        </div>
        <div className="flex gap-3 relative z-10">
          <button 
            onClick={() => updateLog({ walkingMinutes: Math.max(0, log.walkingMinutes - 10) })}
            className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black text-2xl hover:bg-white/10 active:scale-90 transition-all border border-white/5"
          >-</button>
          <button 
            onClick={() => updateLog({ walkingMinutes: log.walkingMinutes + 10 })}
            className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl hover:bg-blue-500 active:scale-90 transition-all shadow-lg shadow-blue-500/20"
          >+</button>
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
                  <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                    <span className="flex items-center gap-1"><Layers size={10}/> {ex.sets} Sets</span>
                    <span className="flex items-center gap-1"><Repeat size={10}/> {ex.reps}</span>
                  </div>
                </div>

                <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} className="text-slate-300" />
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-6 space-y-6 animate-in slide-in-from-top-4 duration-500">
                  {/* Video Cinema Container */}
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

                  <div className="grid grid-cols-4 gap-3">
                    <ExDetail label="Burn" value={`${estBurn}`} icon={<Zap size={14}/>} color="text-orange-600" bg="bg-orange-50" />
                    <ExDetail label="Sets" value={ex.sets} icon={<Layers size={14}/>} color="text-blue-600" bg="bg-blue-50" />
                    <ExDetail label="Goal" value={ex.reps} icon={<Repeat size={14}/>} color="text-emerald-600" bg="bg-emerald-50" />
                    <ExDetail label="Gear" value={ex.equipment.split(' ')[0]} icon={<Box size={14}/>} color="text-indigo-600" bg="bg-indigo-50" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ExDetail = ({ label, value, icon, color, bg }: any) => (
  <div className={`${bg} rounded-2xl p-3 flex flex-col items-center text-center`}>
    <div className={`${color} mb-1 opacity-50`}>{icon}</div>
    <span className={`text-[11px] font-black tracking-tight ${color}`}>{value}</span>
    <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</span>
  </div>
);

export default WorkoutTracker;
