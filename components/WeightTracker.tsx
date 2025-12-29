
import React, { useState, useMemo, useEffect } from 'react';
import { WeightEntry, DailyLog, UserProfile } from '../types';
import { calculateTDEE, projectWeightLoss } from '../utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, TrendingDown, Calendar, ArrowDownRight, ArrowUpRight, Activity, Target, History, Sparkles, ChevronRight, Zap, Calculator } from 'lucide-react';

interface WeightTrackerProps {
  weights: WeightEntry[];
  setWeights: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  log: DailyLog;
  updateLog: (updated: Partial<DailyLog>) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

const WeightTracker: React.FC<WeightTrackerProps> = ({ weights, setWeights, log, updateLog, profile, setProfile }) => {
  const [weightInput, setWeightInput] = useState(log.weight?.toString() || '');
  const [heightInput, setHeightInput] = useState(profile.height.toString());
  const [timeframe, setTimeframe] = useState<'14d' | '1y'>('14d');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSaveWeight = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val)) return;
    updateLog({ weight: val });
    const existingIndex = weights.findIndex(w => w.date === log.date);
    if (existingIndex > -1) {
      const newWeights = [...weights];
      newWeights[existingIndex].weight = val;
      setWeights(newWeights);
    } else {
      setWeights(prev => [...prev, { date: log.date, weight: val }].sort((a,b) => a.date.localeCompare(b.date)));
    }
  };

  const handleSaveHeight = () => {
    const val = parseFloat(heightInput);
    if (isNaN(val)) return;
    setProfile({ ...profile, height: val });
  };

  const currentWeight = log.weight || (weights.length > 0 ? weights[weights.length - 1].weight : 0);
  const tdee = useMemo(() => calculateTDEE(profile, currentWeight), [profile, currentWeight]);

  const projections = useMemo(() => {
    if (tdee === 0) return null;
    return [
      { name: 'Conservative', deficit: 200, color: 'text-blue-500' },
      { name: 'Standard', deficit: 500, color: 'text-emerald-500' },
      { name: 'Aggressive', deficit: 750, color: 'text-rose-500' }
    ].map(p => ({
      ...p,
      tenDayLoss: projectWeightLoss(p.deficit, 10).toFixed(2),
      thirtyDayLoss: projectWeightLoss(p.deficit, 30).toFixed(1),
      dailyTarget: tdee - p.deficit
    }));
  }, [tdee]);

  const timeframeStats = useMemo(() => {
    const data = timeframe === '14d' ? weights.slice(-14) : weights.slice(-365);
    if (data.length === 0) return { loss: 0, checkIns: 0 };
    const loss = data[0].weight - data[data.length - 1].weight;
    return { loss, checkIns: data.length };
  }, [weights, timeframe]);

  const chartData = useMemo(() => {
    const data = timeframe === '14d' ? weights.slice(-14) : weights.slice(-365);
    if (data.length === 0) return [];
    return data.map(w => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: timeframe === '14d' ? 'numeric' : undefined }),
      weight: w.weight,
    }));
  }, [weights, timeframe]);

  return (
    <div className="p-5 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bio Metrics</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setTimeframe('14d')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeframe === '14d' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>14D</button>
          <button onClick={() => setTimeframe('1y')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeframe === '1y' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>1Y</button>
        </div>
      </div>

      {/* Profile & Weight Input Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 flex flex-col">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Height (cm)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-lg font-black focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSaveHeight} className="bg-slate-900 text-white p-3 rounded-xl active:scale-90 transition-transform"><Activity size={18}/></button>
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 flex flex-col">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Weight (kg)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-lg font-black focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSaveWeight} className="bg-blue-600 text-white p-3 rounded-xl active:scale-90 transition-transform"><Scale size={18}/></button>
          </div>
        </div>
      </div>

      {/* Metabolic Command Center */}
      <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="relative z-10 flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-blue-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Metabolic Status</h3>
          </div>
        </div>
        
        <div className="flex items-end justify-between mb-8 relative z-10">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Running Maintenance (TDEE)</span>
            <div className="text-4xl font-black">{tdee} <span className="text-sm opacity-50">kcal/day</span></div>
          </div>
          <div className="text-right">
             <div className="text-emerald-400 text-lg font-black">-{timeframeStats.loss.toFixed(1)}kg</div>
             <div className="text-[8px] font-black text-slate-400 uppercase">Period Loss</div>
          </div>
        </div>

        {/* AI Projection Cards */}
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-2 mb-2">
             <Sparkles size={12} className="text-blue-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Loss Projections</span>
           </div>
           
           <div className="grid grid-cols-1 gap-2">
             {projections?.map((p, i) => (
               <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.color.replace('text', 'bg')}`} />
                      <h4 className="text-xs font-black uppercase tracking-tight">{p.name} Deficit</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Eat {p.dailyTarget} kcal daily</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black ${p.color}`}>-{p.thirtyDayLoss}kg <span className="text-[8px] opacity-60">/ 30 Days</span></div>
                    <div className="text-[8px] font-bold text-slate-500 mt-0.5">-{p.tenDayLoss}kg / 10 Days</div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trajectory</h3>
          </div>
        </div>
        
        <div className="h-48 -mx-2 min-w-0" style={{ position: 'relative', width: '100%' }}>
          {isMounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Awaiting Data Streams...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;
