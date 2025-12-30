
import React from 'react';
import { DailyLog, Supplement } from '../types';
import { SUPPLEMENTS } from '../constants';
import { getScheduledSupplements, getISTDateInfo } from '../utils';
import { CheckCircle2, Circle, Clock, Sunrise, Sunset, ShieldAlert, Pill, Info } from 'lucide-react';

interface SupplementTrackerProps {
  log: DailyLog;
  updateLog: (updated: Partial<DailyLog>) => void;
}

const SupplementTracker: React.FC<SupplementTrackerProps> = ({ log, updateLog }) => {
  const scheduled = getScheduledSupplements(log.date);
  const morningSupps = scheduled.filter(s => s.timing === 'morning');
  const nightSupps = scheduled.filter(s => s.timing === 'night');
  const taken = log.takenSupplements || [];

  const toggleSupplement = (id: string) => {
    const isTaken = taken.includes(id);
    
    // Safety check for D3: Must have breakfast fat
    if (id === 'd3' && !isTaken) {
      if (!log.meals.breakfast) {
        alert("CRITICAL ERROR: Vitamin D3 (SuperD3) cannot be taken without a fat-containing breakfast. Please log your breakfast first.");
        return;
      }
    }

    const newList = isTaken ? taken.filter(s => s !== id) : [...taken, id];
    updateLog({ takenSupplements: newList });
  };

  const dayName = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="p-6 space-y-8 pb-40 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">IST SYNC: {dayName} Protocol</h2>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Supplement Vault</h1>
        </div>
        <div className={`rounded-2xl px-5 py-3 flex flex-col items-end shadow-lg border transition-all ${
          taken.length === scheduled.length && scheduled.length > 0 
            ? 'bg-emerald-600 border-emerald-400 shadow-emerald-500/20' 
            : 'bg-indigo-600 border-indigo-400 shadow-indigo-500/20'
        }`}>
          <span className="text-[8px] font-black text-white uppercase tracking-widest opacity-60">Daily Stack</span>
          <span className="text-xl font-black text-white">{taken.length} / {scheduled.length}</span>
        </div>
      </div>

      {/* Protocol Reminders Section */}
      <div className="bg-slate-900 rounded-[32px] p-6 border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <Info size={16} className="text-indigo-400" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Directives</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
           <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>MORNING: Take after breakfast (7:45 - 8:30 AM IST)</span>
           </div>
           <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>NIGHT: Take after dinner / Pre-sleep (9:30 - 10:00 PM IST)</span>
           </div>
           {dayName === 'Sunday' && (
             <div className="flex items-center gap-3 text-[10px] font-bold text-rose-400 bg-rose-500/5 p-2 rounded-xl border border-rose-500/10">
               <ShieldAlert size={12} />
               <span>D3 ALERT: Today is SuperD3 day. Do not take on empty stomach.</span>
             </div>
           )}
        </div>
      </div>

      {/* Morning Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Sunrise size={18} className="text-amber-400" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Morning Stack</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {morningSupps.map(s => (
            <SupplementCard 
              key={s.id} 
              supplement={s} 
              isTaken={taken.includes(s.id)} 
              onToggle={() => toggleSupplement(s.id)} 
            />
          ))}
          {morningSupps.length === 0 && <p className="text-xs text-slate-600 italic pl-2">No morning supplements scheduled for today.</p>}
        </div>
      </div>

      {/* Night Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Sunset size={18} className="text-indigo-400" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Night Stack</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {nightSupps.map(s => (
            <SupplementCard 
              key={s.id} 
              supplement={s} 
              isTaken={taken.includes(s.id)} 
              onToggle={() => toggleSupplement(s.id)} 
            />
          ))}
          {nightSupps.length === 0 && <p className="text-xs text-slate-600 italic pl-2">No night supplements scheduled for today.</p>}
        </div>
      </div>
    </div>
  );
};

const SupplementCard: React.FC<{ supplement: Supplement, isTaken: boolean, onToggle: () => void }> = ({ supplement, isTaken, onToggle }) => (
  <button 
    onClick={onToggle}
    className={`w-full stealth-card rounded-[32px] p-6 flex items-center justify-between border transition-all active:scale-[0.98] text-left ${
      isTaken ? 'border-emerald-500/30 bg-emerald-500/5 shadow-inner' : 'border-white/5 hover:border-white/10'
    }`}
  >
    <div className="flex items-center gap-5 flex-1 min-w-0">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
        isTaken ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-600 border border-white/5'
      }`}>
        <Pill size={24} strokeWidth={isTaken ? 3 : 2} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className={`text-base font-black truncate ${isTaken ? 'text-emerald-400' : 'text-white'}`}>{supplement.name}</h4>
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 truncate">
          Brand: <span className="text-slate-300">{supplement.brand}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
             <Clock size={10} /> {supplement.dose}
          </span>
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
            isTaken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'
          }`}>
            {supplement.timing}
          </span>
        </div>
        <div className="mt-2 text-[9px] font-bold text-blue-400/70 leading-tight">
          {supplement.instruction}
        </div>
      </div>
    </div>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ml-4 ${
      isTaken ? 'text-emerald-500' : 'text-slate-800'
    }`}>
      {isTaken ? <CheckCircle2 size={28} /> : <Circle size={28} />}
    </div>
  </button>
);

export default SupplementTracker;
