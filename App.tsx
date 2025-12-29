
import React, { useState, useEffect, useMemo } from 'react';
import { DailyLog, WeightEntry, Macros, AppNotification, UserProfile } from './types';
import { formatDate, calculateMacros, calculateExerciseBurn, calculateDailyScore, calculateTDEE, generateSmartNotifications } from './utils';
import { WORKOUT_PLAN, DAILY_TARGETS } from './constants';
import Dashboard from './components/Dashboard';
import DietTracker from './components/DietTracker';
import WorkoutTracker from './components/WorkoutTracker';
import WeightTracker from './components/WeightTracker';
import HistoryTracker from './components/HistoryTracker';
import { LayoutGrid, Utensils, Dumbbell, Scale, Settings, Bell, Download, ShieldCheck, History, FileDown, Trash2 } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  height: 188,
  age: 30,
  gender: 'male',
  activityLevel: 1.0
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'diet' | 'workout' | 'weight' | 'history' | 'settings'>('home');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [today, setToday] = useState(formatDate(new Date()));

  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('coach_logs');
      const savedWeights = localStorage.getItem('coach_weights');
      const savedNotifs = localStorage.getItem('coach_notifs');
      const savedProfile = localStorage.getItem('coach_profile');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedWeights) setWeights(JSON.parse(savedWeights));
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    } catch (e) { console.warn(e); }

    const interval = setInterval(() => {
      const current = formatDate(new Date());
      if (current !== today) setToday(current);
    }, 60000);
    return () => clearInterval(interval);
  }, [today]);

  useEffect(() => {
    localStorage.setItem('coach_logs', JSON.stringify(logs));
    localStorage.setItem('coach_weights', JSON.stringify(weights));
    localStorage.setItem('coach_notifs', JSON.stringify(notifications));
    localStorage.setItem('coach_profile', JSON.stringify(profile));
  }, [logs, weights, notifications, profile]);

  const currentLog: DailyLog = useMemo(() => {
    return logs[today] || {
      date: today,
      meals: {},
      completedExercises: [],
      walkingMinutes: 0,
      waterIntakeMl: 0
    };
  }, [logs, today]);

  const macros = useMemo(() => calculateMacros(currentLog), [currentLog]);
  const currentWeight = currentLog.weight || (weights.length > 0 ? weights[weights.length - 1].weight : 92);
  const tdee = useMemo(() => calculateTDEE(profile, currentWeight), [profile, currentWeight]);
  const burn = useMemo(() => calculateExerciseBurn(currentLog), [currentLog]);
  const score = useMemo(() => calculateDailyScore(currentLog, macros, tdee), [currentLog, macros, tdee]);

  const updateLog = (updated: Partial<DailyLog>) => {
    setLogs(prev => ({
      ...prev,
      [today]: { ...(prev[today] || currentLog), ...updated }
    }));
  };

  const exportData = () => {
    const data = { logs, weights, profile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elite_health_backup_${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            log={currentLog} 
            macros={macros} 
            burn={burn} 
            score={score} 
            advice={null} 
            weights={weights} 
            updateLog={updateLog}
            notifications={notifications}
            setNotifications={setNotifications}
            openSettings={() => setActiveTab('settings')}
            profile={profile}
          />
        );
      case 'diet':
        return <DietTracker log={currentLog} updateLog={updateLog} macros={macros} />;
      case 'workout':
        return <WorkoutTracker log={currentLog} updateLog={updateLog} />;
      case 'weight':
        return <WeightTracker weights={weights} setWeights={setWeights} log={currentLog} updateLog={updateLog} profile={profile} setProfile={setProfile} />;
      case 'history':
        return <HistoryTracker logs={logs} weights={weights} profile={profile} />;
      case 'settings':
        return (
          <div className="p-6 pb-24 space-y-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Configuration</h1>
            
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Biological Input</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Age</label>
                    <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Activity Factor</label>
                    <select value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: parseFloat(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold appearance-none">
                      <option value={1.0}>Factor: 1.0 (BMR Only)</option>
                      <option value={1.2}>Factor: 1.2 (Sedentary)</option>
                      <option value={1.55}>Factor: 1.55 (Active)</option>
                    </select>
                 </div>
               </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={exportData}
                className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all"
              >
                <FileDown size={20} />
                Export Health History
              </button>

              <button 
                onClick={() => { if(confirm("Purge all logs?")) { localStorage.clear(); window.location.reload(); } }} 
                className="w-full bg-rose-50 text-rose-600 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
              >
                <Trash2 size={18} />
                Purge Database
              </button>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Build Version: 1.0.4-PRO</p>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-slate-50 font-inter no-scrollbar flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">{renderContent()}</div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 safe-bottom z-40">
        <div className="max-w-md mx-auto flex justify-between px-6 py-3">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutGrid size={24} />} label="Dash" />
          <NavButton active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} icon={<Utensils size={24} />} label="Diet" />
          <NavButton active={activeTab === 'workout'} onClick={() => setActiveTab('workout')} icon={<Dumbbell size={24} />} label="Train" />
          <NavButton active={activeTab === 'weight'} onClick={() => setActiveTab('weight')} icon={<Scale size={24} />} label="Body" />
          <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={24} />} label="Logs" />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
    <div className={`p-1 rounded-xl ${active ? 'bg-blue-50' : ''}`}>{icon}</div>
    <span className="text-[9px] font-black mt-1 uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
