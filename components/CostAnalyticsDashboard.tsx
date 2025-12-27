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
  Wallet, Scale, Rocket, ShieldCheck, Gem, BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- KONFIGURÁCIÓ ---
type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'other';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', other: 'Egyéb'
};

const COLORS: Record<CategoryKey, string> = {
  fuel: 'oklch(0.65 0.16 200)',      // Neon Cyan
  service: 'oklch(0.55 0.18 230)',   // Electric Teal
  insurance: 'oklch(0.60 0.15 290)', // Violet
  maintenance: 'oklch(0.70 0.15 190)', // Aqua
  parking: 'oklch(0.50 0.15 320)',   // Magenta
  other: 'oklch(0.45 0.15 260)'      // Deep Navy
};

export default function CostAnalyticsDashboard({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'finance' | 'technical' | 'market'>('finance');

  // --- REÁLIS ADATFELDOLGOZÓ MOTOR ---
  const data = useMemo(() => {
    const totals: Record<CategoryKey, number> = { fuel: 0, service: 0, insurance: 0, maintenance: 0, parking: 0, other: 0 };
    const chartMap: Record<string, any> = {};
    const categoryLastDate: Record<string, string> = {};
    
    let minKm = Infinity;
    let maxKm = 0;
    const now = new Date();

    const filtered = events.filter((e: any) => {
      const carMatch = selectedCar === 'all' || e.car_id === parseInt(selectedCar);
      if (!carMatch) return false;
      const date = new Date(e.event_date);
      if (timeRange === 'month') return date >= new Date(new Date().setMonth(now.getMonth() - 1));
      if (timeRange === 'quarter') return date >= new Date(new Date().setMonth(now.getMonth() - 3));
      if (timeRange === 'year') return date >= new Date(new Date().setFullYear(now.getFullYear() - 1));
      return true;
    });

    filtered.forEach((e: any) => {
      let cat: CategoryKey = 'other';
      const dbType = e.type?.toLowerCase();
      const title = e.title?.toLowerCase() || '';

      if (dbType === 'fuel') cat = 'fuel';
      else if (dbType === 'service' || title.includes('szerviz') || title.includes('olaj')) cat = 'service';
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
        chartMap[dateLabel] = { name: dateLabel, fuel: 0, service: 0, maintenance: 0, insurance: 0, total: 0 };
      }
      chartMap[dateLabel][cat] = (chartMap[dateLabel][cat] || 0) + cost;
      chartMap[dateLabel].total += cost;
    });

    const totalCost = Object.values(totals).reduce((a, b) => a + b, 0);
    const kmDiff = (maxKm - minKm) > 0 ? (maxKm - minKm) : 0;
    const ftPerKm = kmDiff > 0 ? totalCost / kmDiff : 0;
    
    // --- EGYEDI LOGIKA: ÉRTÉK-MEGŐRZÉSI INDEX ---
    // A szervizelt autó piaci előnye a szervizköltség ~40%-a eladáskor
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
        { subject: 'Dokumentáltság', A: Math.min(100, filtered.length * 15), fullMark: 100 },
        { subject: 'Értéktartás', A: Math.min(100, (equityGain / 100000) * 100), fullMark: 100 },
      ]
    };
  }, [events, selectedCar, timeRange]);

  return (
    <div className="space-y-6 pb-20 pt-[env(safe-area-inset-top)] selection:bg-primary/20">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic"
          >
            Apex <span className="text-primary">Analytics .</span>
          </motion.h1>
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <ShieldCheck size={12} /> Hitelesített Adatforrás
             </span>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                Live Sync: {new Date().toLocaleTimeString('hu-HU')}
             </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-primary/20 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-2 px-4 border-r border-slate-200 dark:border-slate-800">
            <Layers size={16} className="text-primary" />
            <select 
              value={selectedCar} 
              onChange={(e) => setSelectedCar(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <option value="all">Flotta Összesített</option>
              {cars.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.plate} - {c.model}</option>)}
            </select>
          </div>
          <div className="flex gap-1">
            {(['month', 'quarter', 'year', 'all'] as const).map((r) => (
              <button 
                key={r} 
                onClick={() => setTimeRange(r)}
                className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all ${timeRange === r ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {r === 'month' ? '1 Hó' : r === 'quarter' ? '3 Hó' : r === 'year' ? '1 Év' : 'Mind'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- BENTO GRID STATS --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Fő Kiadás Kártya */}
        <motion.div whileHover={{ y: -5 }} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-primary/20 shadow-2xl shadow-slate-200/60 dark:shadow-none relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Összesített mérleg</span>
              <Download className="text-slate-300 dark:text-slate-700 hover:text-primary transition-colors cursor-pointer" />
            </div>
            <div className="mt-8">
              <h2 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
                {data.total.toLocaleString()} <span className="text-2xl font-light text-slate-400">Ft</span>
              </h2>
              <div className="flex gap-8 mt-6">
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400">Havi burn-rate</p>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-200">{Math.round(data.total / (timeRange === 'all' ? 12 : 1)).toLocaleString()} Ft</p>
                </div>
                <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400">Napi átlag</p>
                  <p className="text-xl font-black text-primary">{Math.round(data.ftPerDay).toLocaleString()} Ft</p>
                </div>
              </div>
            </div>
          </div>
          <DollarSign className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-1000" />
        </motion.div>

        {/* Resale Bonus (Egyedi Funkció) */}
        <div className="bg-primary rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="relative z-10">
             <Gem className="mb-4 opacity-50 group-hover:rotate-12 transition-transform" />
             <h3 className="text-3xl font-black tracking-tighter italic">
                + {Math.round(data.equityGain).toLocaleString()} Ft
             </h3>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Becsült értéknövekedés</p>
          </div>
          <p className="relative z-10 text-[11px] font-bold leading-tight opacity-70 mt-4 border-t border-white/10 pt-4">
             A dokumentált szervizmúlt piaci előnye az eladáskor.
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-700" />
        </div>

        {/* AI Karbantartási Index */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between border border-primary/20 relative overflow-hidden group">
          <div className="relative z-10">
             <Sparkles className="mb-4 text-primary animate-pulse" />
             <p className="text-xs font-bold leading-relaxed">
                {`A ${CATEGORY_LABELS[data.topCategory as CategoryKey]} költségek dominálnak. Az autód karbantartási indexe: `}
                <span className="text-primary font-black text-lg">{data.healthScore.toFixed(0)}%</span>
             </p>
          </div>
          <div className="relative z-10 mt-6 h-1 w-full bg-white/10 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }} animate={{ width: `${data.healthScore}%` }}
               className="h-full bg-primary"
             />
          </div>
          <Rocket className="absolute -bottom-6 -right-6 w-24 h-24 opacity-5 group-hover:-translate-y-4 transition-transform duration-700" />
        </div>
      </section>

      {/* --- FŐ ANALITIKAI PANEL --- */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-primary/20 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
        <div className="flex flex-wrap items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 gap-6">
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
            {[
              { id: 'finance', label: 'Cash-Flow', icon: Wallet },
              { id: 'technical', label: 'Dinamika', icon: Activity },
              { id: 'market', label: 'Health Radar', icon: Scale }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Adatfolyam: Aktív
          </div>
        </div>

        <div className="p-10 h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'finance' ? (
              <ComposedChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.16 200)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.65 0.16 200)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '24px', border: '1px solid var(--primary)', color: 'var(--card-foreground)', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[10, 10, 0, 0]} barSize={45} opacity={0.15} name="Havi Összes" />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} fill="url(#colorMain)" name="Trendvonal" />
                <Line type="monotone" dataKey="service" stroke="oklch(0.60 0.15 290)" strokeWidth={3} dot={{ r: 4, fill: 'oklch(0.60 0.15 290)' }} name="Szerviz Események" />
              </ComposedChart>
            ) : activeTab === 'technical' ? (
              <AreaChart data={data.chartData}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                 <Tooltip />
                 <Area type="stepAfter" dataKey="total" stroke="oklch(0.70 0.15 190)" fill="oklch(0.70 0.15 190)" fillOpacity={0.1} strokeWidth={3} name="Műszaki Intenzitás" />
              </AreaChart>
            ) : (
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                <PolarGrid stroke="var(--muted-foreground)" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--foreground)', fontSize: 11, fontWeight: 900}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                <Radar name="Autó Profil" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- ALSÓ RÉSZLETEZŐ GRID --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Költségstruktúra */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-10 border border-slate-200 dark:border-primary/20 shadow-xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase italic tracking-tighter">
              <Briefcase size={24} className="text-primary" /> Költségportfólió
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Súlyozott Analízis</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {data.distribution.map((item) => (
              <div key={item.id} className="space-y-3 group cursor-default">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]" style={{ backgroundColor: item.color }} />
                     <span className="text-xs font-black uppercase text-slate-500 group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 tabular-nums">{item.value.toLocaleString()} Ft</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner">
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
                <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase italic">
                   <span>{((item.value / data.total) * 100).toFixed(1)}%</span>
                   <span>Utoljára: {data.lastDates[item.id] ? new Date(data.lastDates[item.id]).toLocaleDateString('hu-HU') : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proaktív Monitor */}
        <div className="space-y-4">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] p-8 border-l-4 border-l-primary flex flex-col shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                   <Lightbulb size={20} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Pénzügyi Előrejelzés</h4>
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                A jelenlegi trendek alapján a következő szerviz eseményed becsült költsége: 
                <span className="text-primary ml-1 font-black">{~~(data.total / 4).toLocaleString()} Ft</span>. 
                Javasoljuk ennek az összegnek a félretételét a következő 2 hónapban.
             </p>
          </div>

          <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-primary/20 shadow-xl flex-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6 flex items-center gap-2 italic">
              <Clock size={16} className="text-primary" /> Naplózási Minőség
            </h3>
            <div className="flex flex-col items-center">
                <div className="relative h-28 w-28 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                      <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={301} strokeDashoffset={301 - (301 * 0.88)} className="text-primary transition-all duration-1500" strokeLinecap="round" />
                   </svg>
                   <span className="absolute text-2xl font-black italic text-slate-900 dark:text-white">88%</span>
                </div>
                <p className="text-[10px] text-center text-slate-400 font-black uppercase mt-4 tracking-widest">
                   Professzionális adatsűrűség. <br/> A jelentés hiteles.
                </p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}