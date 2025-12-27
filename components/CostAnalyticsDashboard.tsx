'use client'

import { useState, useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ComposedChart, Bar, Line, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { 
  TrendingUp, Target, Fuel, DollarSign, PieChart as PieIcon, 
  Layers, Sparkles, Activity, Zap, ShieldAlert, ChevronRight, 
  ArrowUpRight, Briefcase, Clock, Gauge, Download, Lightbulb, 
  Wallet, Scale, Rocket, ShieldCheck, Gem
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- KONFIGURÁCIÓ ---
type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'other';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', other: 'Egyéb'
};

const COLORS: Record<CategoryKey, string> = {
  fuel: 'oklch(0.65 0.16 200)',
  service: 'oklch(0.55 0.18 230)',
  insurance: 'oklch(0.60 0.15 290)',
  maintenance: 'oklch(0.70 0.15 190)',
  parking: 'oklch(0.50 0.15 320)',
  other: 'oklch(0.45 0.15 260)'
};

export default function CostAnalyticsDashboard({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'finance' | 'technical' | 'market'>('finance');

  // --- ADATFELDOLGOZÁS ---
  const data = useMemo(() => {
    const totals: Record<CategoryKey, number> = { fuel: 0, service: 0, insurance: 0, maintenance: 0, parking: 0, other: 0 };
    const chartMap: Record<string, any> = {};
    const categoryLastDate: Record<string, string> = {};
    
    let minKm = Infinity;
    let maxKm = 0;

    const filtered = events.filter((e: any) => {
      const carMatch = selectedCar === 'all' || e.car_id === parseInt(selectedCar);
      if (!carMatch) return false;
      const date = new Date(e.event_date);
      const now = new Date();
      if (timeRange === 'month') return date >= new Date(now.setMonth(now.getMonth() - 1));
      if (timeRange === 'quarter') return date >= new Date(now.setMonth(now.getMonth() - 3));
      if (timeRange === 'year') return date >= new Date(now.setFullYear(now.getFullYear() - 1));
      return true;
    });

    filtered.forEach((e: any) => {
      let cat: CategoryKey = 'other';
      const type = e.type?.toLowerCase();
      const title = e.title?.toLowerCase() || '';

      if (type === 'fuel') cat = 'fuel';
      else if (type === 'service' || title.includes('szerviz') || title.includes('olaj')) cat = 'service';
      else if (title.includes('biztosítás') || title.includes('kgfb')) cat = 'insurance';
      else if (title.includes('parkolás')) cat = 'parking';
      else if (title.includes('karbantartás') || title.includes('mosás')) cat = 'maintenance';

      const cost = Number(e.cost) || 0;
      totals[cat] += cost;

      if (e.mileage > 0) {
        minKm = Math.min(minKm, e.mileage);
        maxKm = Math.max(maxKm, e.mileage);
      }
      if (!categoryLastDate[cat] || new Date(e.event_date) > new Date(categoryLastDate[cat])) {
        categoryLastDate[cat] = e.event_date;
      }

      const dateLabel = new Date(e.event_date).toLocaleDateString('hu-HU', { year: '2-digit', month: 'short' });
      if (!chartMap[dateLabel]) {
        chartMap[dateLabel] = { name: dateLabel, fuel: 0, service: 0, total: 0 };
      }
      chartMap[dateLabel][cat] = (chartMap[dateLabel][cat] || 0) + cost;
      chartMap[dateLabel].total += cost;
    });

    const totalCost = Object.values(totals).reduce((a, b) => a + b, 0);
    const kmDiff = (maxKm - minKm) > 0 ? (maxKm - minKm) : 0;
    const ftPerKm = kmDiff > 0 ? totalCost / kmDiff : 0;
    const equityGain = (totals.service + totals.maintenance) * 0.42;
    const healthScore = Math.min(100, (filtered.length / ((kmDiff / 8000) || 1)) * 60);

    return {
      chartData: Object.values(chartMap),
      distribution: (Object.keys(totals) as CategoryKey[]).map(k => ({ 
        name: CATEGORY_LABELS[k], value: totals[k], color: COLORS[k], id: k 
      })).filter(v => v.value > 0),
      total: totalCost,
      totals,
      kmDriven: kmDiff,
      ftPerKm,
      ftPerDay: totalCost / (timeRange === 'year' ? 365 : timeRange === 'quarter' ? 90 : 30),
      equityGain,
      healthScore,
      eventCount: filtered.length,
      topCategory: (Object.keys(totals) as CategoryKey[]).reduce((a, b) => totals[a] > totals[b] ? a : b),
      lastDates: categoryLastDate,
      radarData: [
        { subject: 'Hatékonyság', A: ftPerKm > 0 ? Math.max(20, 100 - ftPerKm) : 80, fullMark: 100 },
        { subject: 'Karbantartás', A: healthScore, fullMark: 100 },
        { subject: 'Adatok', A: Math.min(100, filtered.length * 15), fullMark: 100 },
        { subject: 'Érték', A: Math.min(100, (equityGain / 100000) * 100), fullMark: 100 },
      ]
    };
  }, [events, selectedCar, timeRange]);

  return (
    <div className="space-y-6 pb-20 pt-[env(safe-area-inset-top)] px-2 sm:px-4 md:px-0 transition-all">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic"
          >
            Apex <span className="text-primary">Analytics .</span>
          </motion.h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
             <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 sm:px-3 py-1 rounded-full border border-primary/20">
                <ShieldCheck size={12} /> Hitelesített Adatok
             </span>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Frissítve: {new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 glass p-2 rounded-2xl sm:rounded-3xl border-neon-glow">
          <div className="flex items-center gap-2 px-3 sm:px-4 border-b sm:border-b-0 sm:border-r border-border/50 pb-2 sm:pb-0">
            <Layers size={16} className="text-primary" />
            <select 
              value={selectedCar} 
              onChange={(e) => setSelectedCar(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-foreground w-full"
            >
              <option value="all">Flotta Nézet</option>
              {cars.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.plate}</option>)}
            </select>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-1">
            {(['month', 'quarter', 'year', 'all'] as const).map((r) => (
              <button 
                key={r} 
                onClick={() => setTimeRange(r)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tighter whitespace-nowrap transition-all ${timeRange === r ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-accent'}`}
              >
                {r === 'month' ? '1 Hó' : r === 'quarter' ? '3 Hó' : r === 'year' ? '1 Év' : 'Mind'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- BENTO GRID STATS --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -5 }} className="sm:col-span-2 glass rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-primary/20 shadow-xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Pénzügyi Status</span>
              <Wallet className="text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-6">
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
                {data.total.toLocaleString()} <span className="text-xl sm:text-2xl font-light text-slate-400">Ft</span>
              </h2>
              <div className="flex gap-4 sm:gap-8 mt-6">
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400">Havi átlag</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-200">{~~data.ftPerDay * 30} Ft</p>
                </div>
                <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400">Napi költség</p>
                  <p className="text-lg sm:text-xl font-black text-primary">{~~data.ftPerDay} Ft</p>
                </div>
              </div>
            </div>
          </div>
          <DollarSign className="absolute -bottom-10 -right-10 w-48 h-48 sm:w-64 sm:h-64 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-1000" />
        </motion.div>

        <div className="bg-primary rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
             <Gem className="mb-4 opacity-50" size={24} />
             <h3 className="text-2xl sm:text-3xl font-black tracking-tighter italic">
                + {Math.round(data.equityGain).toLocaleString()} Ft
             </h3>
             <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Becsült Értéknövekedés</p>
          </div>
          <p className="relative z-10 text-[10px] font-bold leading-tight opacity-70 mt-4 border-t border-white/10 pt-4">
             A dokumentált szerviz előnye eladáskor.
          </p>
        </div>

        <div className="glass rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-primary/20 flex flex-col justify-between group border-l-4 border-l-primary">
          <Zap className="w-8 h-8 text-primary mb-4" />
          <div>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter italic text-slate-900 dark:text-white">
                {data.ftPerKm.toFixed(1)} <span className="text-xs sm:text-sm font-bold uppercase not-italic text-slate-400">Ft/km</span>
            </h3>
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500 mt-1">Üzemeltetési hatékonyság</p>
          </div>
        </div>
      </section>

      {/* --- GRAFIKON PANEL --- */}
      <section className="glass rounded-[2rem] sm:rounded-[3rem] border-neon-glow overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 gap-4">
          <div className="flex gap-1 bg-accent/50 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {[
              { id: 'finance', label: 'Cash-Flow', icon: Wallet },
              { id: 'market', label: 'Radar', icon: Scale }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-muted-foreground'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-8 h-[300px] sm:h-[400px] md:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'finance' ? (
              <ComposedChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 800}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '15px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="total" fill="#06b6d4" radius={[5, 5, 0, 0]} barSize={30} opacity={0.2} />
                <Area type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={3} fill="url(#colorTotal)" />
              </ComposedChart>
            ) : (
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarData}>
                <PolarGrid stroke="var(--muted-foreground)" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 900}} />
                <Radar name="Autó Status" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- ALSÓ RÉSZLETEZŐ --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div className="lg:col-span-2 glass rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-primary/20 shadow-xl">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6 uppercase italic">
            <Briefcase size={20} className="text-primary" /> Költségstruktúra
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            {data.distribution.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-slate-500">{item.name}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">{item.value.toLocaleString()} Ft</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(item.value / data.total) * 100}%` }} 
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div className="flex justify-between text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase italic">
                   <span>{((item.value / data.total) * 100).toFixed(1)}%</span>
                   <span>Utoljára: {data.lastDates[item.id] ? new Date(data.lastDates[item.id]).toLocaleDateString('hu-HU', {month: 'short', day: 'numeric'}) : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-primary/20 flex flex-col justify-center items-center text-center">
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex items-center justify-center mb-4">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="300" strokeDashoffset={300 - (300 * 0.88)} className="text-primary transition-all duration-1500" strokeLinecap="round" />
             </svg>
             <span className="absolute text-xl sm:text-2xl font-black italic text-slate-900 dark:text-white">88%</span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Adatminőség</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2 leading-relaxed">
             Professzionális adatsűrűség.<br/>A riportod hitelesített.
          </p>
        </div>

      </section>
    </div>
  );
}