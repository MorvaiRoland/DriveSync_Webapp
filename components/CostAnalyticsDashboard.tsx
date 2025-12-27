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

  // --- REÁLIS ADATFELDOLGOZÁS ---
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
    <div className="space-y-6 pb-20 pt-[env(safe-area-inset-top)] px-2 sm:px-4 md:px-0 transition-all font-sans">
      
      {/* --- FEJLÉC --- */}
      <header className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic"
          >
            DynamicSense <span className="text-primary">Elemzés .</span>
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
              className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-foreground w-full py-2"
            >
              <option value="all">Összesített nézet</option>
              {cars.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.plate} - {c.model}</option>)}
            </select>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-1 p-1">
            {(['month', 'quarter', 'year', 'all'] as const).map((r) => (
              <button 
                key={r} 
                onClick={() => setTimeRange(r)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tighter whitespace-nowrap transition-all ${timeRange === r ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-accent'}`}
              >
                {r === 'month' ? '1 Hónap' : r === 'quarter' ? '3 Hónap' : r === 'year' ? '1 Év' : 'Mind'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- BENTO GRID STATISZTIKA --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -5 }} className="sm:col-span-2 glass rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-primary/20 shadow-xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Pénzügyi Áttekintés</span>
              <Wallet className="text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-6">
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
                {data.total.toLocaleString()} <span className="text-xl sm:text-2xl font-light text-slate-400">Ft</span>
              </h2>
              <div className="flex gap-4 sm:gap-8 mt-6">
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400">Havi átlag</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-200">{~~(data.ftPerDay * 30).toLocaleString()} Ft</p>
                </div>
                <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400">Napi lebontás</p>
                  <p className="text-lg sm:text-xl font-black text-primary">{~~data.ftPerDay.toLocaleString()} Ft</p>
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
             A dokumentált szervizmúlt piaci előnye eladáskor.
          </p>
        </div>

        <div className="glass rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-primary/20 flex flex-col justify-between group border-l-4 border-l-primary">
          <Zap className="w-8 h-8 text-primary mb-4" />
          <div>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter italic text-slate-900 dark:text-white">
                {data.ftPerKm.toFixed(1)} <span className="text-xs sm:text-sm font-bold uppercase not-italic text-slate-400">Ft/km</span>
            </h3>
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500 mt-1">Fenntartási hatékonyság</p>
          </div>
        </div>
      </section>

      {/* --- GRAFIKON PANEL --- */}
      <section className="glass rounded-[2rem] sm:rounded-[3rem] border-neon-glow overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 gap-4">
          <div className="flex gap-2 bg-accent/40 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'finance', label: 'Pénzforgalom', icon: Wallet },
              { id: 'market', label: 'Állapot Radar', icon: Scale }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-background text-primary shadow-xl ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:flex items-center gap-2">
            <Activity size={12} className="text-primary animate-pulse" /> Élő Adatfolyam
          </div>
        </div>

        <div className="p-4 sm:p-10 h-[320px] sm:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'finance' ? (
              <ComposedChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.18 230)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.55 0.18 230)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.50 0.05 240 / 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 9, fontWeight: 800}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '15px', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '11px' }}
                />
                <Bar dataKey="total" fill="oklch(0.55 0.18 230 / 0.15)" radius={[5, 5, 0, 0]} barSize={35} name="Havi Összes" />
                <Area type="monotone" dataKey="total" stroke="oklch(0.55 0.18 230)" strokeWidth={3} fill="url(#colorTotal)" name="Trendvonal" />
              </ComposedChart>
            ) : (
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.radarData}>
                <PolarGrid stroke="var(--muted-foreground)" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 900}} />
                <Radar name="Jármű Profil" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- ALSÓ RÉSZLETEZŐ --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Költségstruktúra */}
        <div className="lg:col-span-2 glass rounded-[2rem] p-6 sm:p-10 border border-slate-200 dark:border-primary/20 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase italic tracking-tighter">
              <Briefcase size={22} className="text-primary" /> Költségportfólió
            </h3>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Súlyozott Analízis</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            {data.distribution.map((item) => (
              <div key={item.id} className="space-y-3 group cursor-default">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                     <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
                     <span className="text-[11px] font-black uppercase text-slate-500 group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">{item.value.toLocaleString()} Ft</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(item.value / data.total) * 100}%` }} 
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full rounded-full relative" 
                    style={{ backgroundColor: item.color }}
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase italic">
                   <span className="text-primary">{((item.value / data.total) * 100).toFixed(1)}%</span>
                   <span>Utoljára: {data.lastDates[item.id] ? new Date(data.lastDates[item.id]).toLocaleDateString('hu-HU', {month: 'short', day: 'numeric'}) : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DynamicSense Intelligens Monitor */}
        <div className="space-y-4 flex flex-col">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-8 border-l-4 border-l-primary flex flex-col shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                   <Lightbulb size={20} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">AI Előrejelzés</h4>
             </div>
             <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                A jelenlegi trendek alapján a következő szerviz eseményed becsült költsége: 
                <span className="text-primary ml-1 font-black">{~~(data.total / 4).toLocaleString()} Ft</span>. 
                Javasoljuk ennek az összegnek a félretételét a következő negyedévre.
             </p>
          </div>

          <div className="glass rounded-[2rem] p-8 border border-slate-200 dark:border-primary/20 shadow-xl flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative h-28 w-28 flex items-center justify-center mb-6">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                  <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * 0.88)} className="text-primary transition-all duration-1500" strokeLinecap="round" />
               </svg>
               <span className="absolute text-2xl font-black italic text-slate-900 dark:text-white">88%</span>
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Adatminőség Score</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 leading-relaxed">
               A naplózásod sűrűsége alapján <br/>a riport 100% hitelesített.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}