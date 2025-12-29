import React, { useState, useRef, useEffect } from 'react';
import { DailyLog, Exercise } from '../types';
import { WORKOUT_PLAN } from '../constants';
import { CheckCircle2, Circle, Clock, PlayCircle, Info, ChevronDown, AlertCircle, Loader2, RefreshCw, Box, Repeat, Zap, Layers } from 'lucide-react';

interface WorkoutTrackerProps {
  log: DailyLog;
  updateLog: (updated: Partial<DailyLog>) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ log, updateLog }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<Record<string, boolean>>({});
  const [videoLoading, setVideoLoading] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  
  const dayOfWeek = new Date(log.date).getDay();
  const adjustedIndex = (dayOfWeek + 6) % 7;
  const currentWorkout = WORKOUT_PLAN[adjustedIndex];

  // Effect to explicitly trigger play when an exercise is expanded
  useEffect(() => {
    if (expandedId && videoRefs.current[expandedId]) {
      const video = videoRefs.current[expandedId];
      if (video) {
        video.play().catch(err => {
          console.debug("Autoplay blocked, user interaction required:", err);
        });
      }
    }
  }, [expandedId]);

  const toggleExercise = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof id !== 'string') return;
    
    const isCompleted = log.completedExercises.includes(id);
    const newList = isCompleted 
      ? log.completedExercises.filter(i => i !== id)
      : [...log.completedExercises, id];
    updateLog({ completedExercises: newList });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const retryVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoError(prev => ({...prev, [id]: false}));
    setVideoLoading(prev => ({...prev, [id]: true}));
    
    // Attempt re-play on retry
    setTimeout(() => {
      if (videoRefs.current[id]) {
        videoRefs.current[id]?.load();
        videoRefs.current[id]?.play().catch(() => {});
      }
    }, 100);
  };

  const progressPercent = currentWorkout.exercises.length 
    ? (log.completedExercises.length / currentWorkout.exercises.length) * 100 
    : 100;

  return (
    <div className="p-5 space-y-6 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-slate-400 font-bold text-xs uppercase tracking-widest">{currentWorkout.day} Phase</h2>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentWorkout.type}</h1>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">
            {Math.round(progressPercent)}% Ready
          </span>
        </div>
      </div>

      {/* Walking Counter */}
      <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl shadow-slate-200 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
        <div className="space-y-1 relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Cardio Protocol</h3>
          <div className="text-2xl font-black">{log.walkingMinutes} / {currentWorkout.walkingTarget} Min</div>
        </div>
        <div className="flex gap-2 relative z-10">
          <button 
            onClick={() => updateLog({ walkingMinutes: Math.max(0, log.walkingMinutes - 10) })}
            className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl hover:bg-white/20 active:scale-90 transition-all"
          >-</button>
          <button 
            onClick={() => updateLog({ walkingMinutes: log.walkingMinutes + 10 })}
            className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl hover:bg-white/20 active:scale-90 transition-all"
          >+</button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {currentWorkout.exercises.map((ex) => {
          const completed = log.completedExercises.includes(ex.id);
          const isExpanded = expandedId === ex.id;
          const hasError = videoError[ex.id];
          const isLoading = videoLoading[ex.id];
          const estBurn = Math.round(ex.kcalPerUnit * (ex.unit === 'second' ? 40 : 1) * ex.sets);
          
          return (
            <div
              key={ex.id}
              className={`group rounded-[28px] border transition-all duration-300 overflow-hidden ${
                completed ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div 
                onClick={() => toggleExpand(ex.id)}
                className="p-4 flex items-center gap-4 cursor-pointer"
              >
                <button
                  onClick={(e) => toggleExercise(ex.id, e)}
                  className={`transition-colors shrink-0 ${completed ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-400'}`}
                >
                  {completed ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Circle size={28} strokeWidth={2.5} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-sm tracking-tight ${completed ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {ex.name}
                  </h4>
                  {!isExpanded && (
                    <div className="flex gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                      <span>{ex.sets} Sets</span>
                      <span>{ex.reps}</span>
                    </div>
                  )}
                </div>

                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} className="text-slate-300" />
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                  {/* Video Demo Section */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center border border-slate-200 group/vid">
                    {ex.videoUrl && !hasError ? (
                      <>
                        <video 
                          ref={(el) => { videoRefs.current[ex.id] = el; }}
                          key={ex.videoUrl}
                          src={ex.videoUrl}
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          preload="auto"
                          onLoadStart={() => setVideoLoading(prev => ({...prev, [ex.id]: true}))}
                          onCanPlay={() => setVideoLoading(prev => ({...prev, [ex.id]: false}))}
                          onError={() => {
                            console.error(`Video failed to load: ${ex.videoUrl}`);
                            setVideoError(prev => ({...prev, [ex.id]: true}));
                            setVideoLoading(prev => ({...prev, [ex.id]: false}));
                          }}
                          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/vid:opacity-100 transition-opacity pointer-events-none" />
                        {isLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400 bg-slate-900/40 backdrop-blur-[2px]">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Buffering Routine...</span>
                          </div>
                        )}
                        {/* Play Overlay if video fails to autoplay */}
                        {!isLoading && !hasError && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              videoRefs.current[ex.id]?.play();
                            }}
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity"
                          >
                            <PlayCircle size={48} className="text-white drop-shadow-lg" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-slate-50">
                        {hasError ? (
                          <AlertCircle size={32} className="text-rose-500 mb-3" />
                        ) : (
                          <PlayCircle size={32} className="mb-3 opacity-20" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {hasError ? 'Asset Missing' : 'Demo Offline'}
                        </span>
                        {hasError ? (
                          <div className="mt-2 space-y-2">
                            <p className="text-[9px] text-slate-400 font-semibold leading-tight">
                              Path: "{ex.videoUrl}" not found.<br/>
                              Check the 'attach' folder.
                            </p>
                            <button 
                              onClick={(e) => retryVideo(ex.id, e)}
                              className="flex items-center gap-1.5 mx-auto bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-slate-300 transition-colors"
                            >
                              <RefreshCw size={10} /> Retry
                            </button>
                          </div>
                        ) : (
                          <p className="text-[9px] mt-2 text-slate-400 font-medium">Standard instruction set only.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Coach Instructions (Form Tips) */}
                  <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-100/50 shadow-inner">
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                      <Info size={16} strokeWidth={3} />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Form Instructions</span>
                    </div>
                    {ex.formTips && ex.formTips.length > 0 ? (
                      <ul className="space-y-3">
                        {ex.formTips.map((tip, i) => (
                          <li key={i} className="flex gap-3 text-xs text-slate-700 font-bold leading-relaxed">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic font-medium">Follow standard safety guidelines and maintain proper spinal alignment.</p>
                    )}
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ExerciseStat label="Gear" value={ex.equipment} icon={<Box size={14} />} color="text-slate-700" bg="bg-slate-50" />
                    <ExerciseStat label="Sets" value={`${ex.sets} Targets`} icon={<Layers size={14} />} color="text-blue-700" bg="bg-blue-50/50" />
                    <ExerciseStat label="Rep/Time" value={ex.reps} icon={<Repeat size={14} />} color="text-emerald-700" bg="bg-emerald-50/50" />
                    <ExerciseStat label="Burn" value={`${estBurn} kcal`} icon={<Zap size={14} />} color="text-orange-700" bg="bg-orange-50/50" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {currentWorkout.exercises.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Active Recovery Day</p>
            <p className="text-slate-500 font-medium mt-2">No resistance training today.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 text-white rounded-[32px] p-6 flex items-start gap-4">
        <div className="p-3 bg-blue-500/20 rounded-2xl">
          <Clock className="text-blue-400" size={20} />
        </div>
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-1">Execution Rule</h4>
          <p className="text-xs text-slate-100 leading-relaxed font-medium">
            "Form over weight. Every rep must be intentional. If you fail mid-set, drop weight but finish the count."
          </p>
        </div>
      </div>
    </div>
  );
};

const ExerciseStat: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string; bg: string }> = ({ label, value, icon, color, bg }) => (
  <div className={`${bg} rounded-2xl p-3 border border-white flex flex-col items-center text-center shadow-sm`}>
    <div className={`flex items-center gap-1.5 mb-1 ${color} opacity-60`}>
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-[11px] font-black tracking-tight leading-none ${color}`}>{value}</span>
  </div>
);

export default WorkoutTracker;