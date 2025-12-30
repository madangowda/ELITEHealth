
import React, { useState, useEffect, useMemo } from 'react';
import { DailyLog, WeightEntry, AppNotification, UserProfile } from './types';
import { getISTDateString, calculateMacros, calculateExerciseBurn, calculateDailyScore, calculateTDEE } from './utils';
import Dashboard from './components/Dashboard';
import DietTracker from './components/DietTracker';
import WorkoutTracker from './components/WorkoutTracker';
import WeightTracker from './components/WeightTracker';
import HistoryTracker from './components/HistoryTracker';
import SupplementTracker from './components/SupplementTracker';
import { LayoutGrid, Utensils, Dumbbell, Scale, History, Settings, Pill, Box, User, ShieldCheck } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  height: 188,
  age: 30,
  gender: 'male',
  activityLevel: 1.0,
  workoutMode: 'standard'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'diet' | 'workout' | 'weight' | 'history' | 'supps' | 'settings'>('home');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  // Strictly follow Indian Time for today's log key
  const [today, setToday] = useState(getISTDateString());

  useEffect(() => {
    // Update today's date periodically to check for IST rollover
    const timer = setInterval(() => {
      const newToday = getISTDateString();
      if (newToday !== today) {
        setToday(newToday);
      }
    }, 60000); // Check every minute

    try {
      const savedLogs = localStorage.getItem('coach_logs');
      const savedWeights = localStorage.getItem('coach_weights');
      const savedProfile = localStorage.getItem('coach_profile');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedWeights) setWeights(JSON.parse(savedWeights));
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
      }
    } catch (e) { console.warn("Local storage error:", e); }

    return () => clearInterval(timer);
  }, [today]);

  useEffect(() => {
    localStorage.setItem('coach_logs', JSON.stringify(logs));
    localStorage.setItem('coach_weights', JSON.stringify(weights));
    localStorage.setItem('coach_profile', JSON.stringify(profile));
  }, [logs, weights, profile]);

  const currentLog: DailyLog = useMemo(() => {
    return logs[today] || {
      date: today,
      meals: {},
      completedExercises: [],
      customExercises: [],
      walkingMinutes: 0,
      waterIntakeMl: 0,
      takenSupplements: []
    };
  }, [logs, today]);

  const macros = useMemo(() => calculateMacros(currentLog), [currentLog]);
  const burn = useMemo(() => calculateExerciseBurn(currentLog, profile), [currentLog, profile]);
  const score = useMemo(() => calculateDailyScore(currentLog, macros, 1950, profile), [currentLog, macros, profile]);

  const updateLog = (updated: Partial<DailyLog>) => {
    setLogs(prev => ({
      ...prev,
      [today]: { ...(prev[today] || currentLog), ...updated }
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard log={currentLog} macros={macros} burn={burn} score={score} advice={null} weights={weights} updateLog={updateLog} openSettings={() => setActiveTab('settings')} profile={profile} />;
      case 'diet': return <DietTracker log={currentLog} updateLog={updateLog} macros={macros} />;
      case 'workout': return <WorkoutTracker log={currentLog} updateLog={updateLog} profile={profile} />;
      case 'weight': return <WeightTracker weights={weights} setWeights={setWeights} log={currentLog} updateLog={updateLog} profile={profile} setProfile={setProfile} />;
      case 'history': return <HistoryTracker logs={logs} weights={weights} profile={profile} />;
      case 'supps': return <SupplementTracker log={currentLog} updateLog={updateLog} />;
      case 'settings': return (
        <div className="p-8 space-y-10 pb-32 bg-[#0f172a] min-h-screen text-white animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">System Config</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Profile & Protocol Selection</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Workout Mode Selection</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setProfile({ ...profile, workoutMode: 'standard' })}
                  className={`stealth-card p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 active:scale-95 ${profile.workoutMode === 'standard' ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/5 opacity-40'}`}
                >
                  <Dumbbell className="text-white" size={28} />
                  <span className="block text-xs font-black uppercase tracking-tight">Elite Standard</span>
                </button>
                <button 
                  onClick={() => setProfile({ ...profile, workoutMode: 'homegym' })}
                  className={`stealth-card p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 active:scale-95 ${profile.workoutMode === 'homegym' ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-500/20' : 'bg-white/5 border-white/5 opacity-40'}`}
                >
                  <Box className="text-white" size={28} />
                  <span className="block text-xs font-black uppercase tracking-tight">Home Gym Plan</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Biometric Parameters</h3>
              <div className="grid grid-cols-1 gap-4">
                 <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] space-y-4">
                    <div className="flex items-center gap-3 text-slate-400">
                      <User size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">General Profile</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Age</label>
                         <input 
                           type="number" 
                           value={profile.age} 
                           onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 30})}
                           className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white"
                         />
                       </div>
                       <div>
                         <label className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Height (cm)</label>
                         <input 
                           type="number" 
                           value={profile.height} 
                           onChange={(e) => setProfile({...profile, height: parseInt(e.target.value) || 188})}
                           className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white"
                         />
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[40px] flex items-center gap-5">
              <ShieldCheck className="text-emerald-400 shrink-0" size={32} />
              <div>
                <h4 className="text-sm font-black text-emerald-400">Protocol Active</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Metabolic Baseline: 1950 kcal</p>
              </div>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-[#0f172a] no-scrollbar flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">{renderContent()}</div>
      
      {/* Floating Navigation Dock */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <nav className="glass-nav rounded-[32px] p-2 flex justify-between shadow-2xl max-w-[400px] mx-auto border border-white/5">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutGrid size={20} />} />
          <NavButton active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} icon={<Utensils size={20} />} />
          <NavButton active={activeTab === 'workout'} onClick={() => setActiveTab('workout')} icon={<Dumbbell size={20} />} />
          <NavButton active={activeTab === 'supps'} onClick={() => setActiveTab('supps')} icon={<Pill size={20} />} />
          <NavButton active={activeTab === 'weight'} onClick={() => setActiveTab('weight')} icon={<Scale size={20} />} />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} />
          <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} />
        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon }: any) => (
  <button onClick={onClick} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon}
  </button>
);

export default App;
