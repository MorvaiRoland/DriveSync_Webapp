'use client'

import { useState, useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ComposedChart, Bar, Line, Scatter, ZAxis
} from 'recharts'
import { 
  TrendingUp, Target, Fuel, DollarSign, PieChart as PieIcon, 
  Layers, Sparkles, Activity, Zap, ShieldAlert, ChevronRight, 
  ArrowUpRight, Briefcase, CalendarDays, Clock, Gauge, MousePointer2, 
  Download, Lightbulb, TrendingDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- KONFIGURÁCIÓ ÉS TÍPUSOK ---
type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'other';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', other: 'Egyéb'
};

// Dinamikus színek a CSS változókból (vagy fix tech színek)
const COLORS: Record<CategoryKey, string> = {
  fuel: 'oklch(0.65 0.16 200)',      // Neon Cyan
  service: 'oklch(0.55 0.18 230)',   // Primary Teal
  insurance: 'oklch(0.60 0.15 290)', // Purple
  maintenance: 'oklch(0.70 0.15 190)', // Cyan
  parking: 'oklch(0.50 0.15 320)',   // Magenta
  other: 'oklch(0.45 0.15 260)'      // Deep Blue
};

export default function CostAnalyticsDashboard({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'finance' | 'technical' | 'ai'>('finance');

  // --- INTELLIGENS ADATFELDOLGOZÁS ---
  const data = useMemo(() => {
    const totals: Record<CategoryKey, number> = { fuel: 0, service: 0, insurance: 0, maintenance: 0, parking: 0, other: 0 };
    const chartMap: Record<string, any> = {};
    const categoryLastDate: Record<string, string> = {};
    
    let minKm = Infinity;
    let maxKm = 0;
    let fuelVolume = 0;

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
      const dbType = e.type?.toLowerCase();
      const title = e.title?.toLowerCase() || '';

      if (dbType === 'fuel') cat = 'fuel';
      else if (dbType === 'service' || title.includes('szerviz') || title.includes('olaj')) cat = 'service';
      else if (title.includes('biztosítás') || title.includes('kgfb') || title.includes('casco')) cat = 'insurance';
      else if (title.includes('parkolás')) cat = 'parking';
      else if (title.includes('mosás') || title.includes('karbantartás')) cat = 'maintenance';

      const cost = Number(e.cost) || 0;
      totals[cat] += cost;

      if (!categoryLastDate[cat] || new Date(e.event_date) > new Date(categoryLastDate[cat])) {
        categoryLastDate[cat] = e.event_date;
      }

      if (e.mileage > 0) {
        minKm = Math.min(minKm, e.mileage);
        maxKm = Math.max(maxKm, e.mileage);
      }

      const dateLabel = new Date(e.event_date).toLocaleDateString('hu-HU', { year: '2-digit', month: 'short' });
      if (!chartMap[dateLabel]) {
        chartMap[dateLabel] = { name: dateLabel, fuel: 0, service: 0, insurance: 0, maintenance: 0, parking: 0, other: 0, total: 0, count: 0 };
      }
      chartMap[dateLabel][cat] = (chartMap[dateLabel][cat] || 0) + cost;
      chartMap[dateLabel].total += cost;
      chartMap[dateLabel].count += 1;
    });

    const totalCost = Object.values(totals).reduce((a, b) => a + b, 0);
    const kmDiff = (maxKm - minKm) > 0 ? (maxKm - minKm) : 0;
    const ftPerKm = kmDiff > 0 ? totalCost / kmDiff : 0;

    return {
      chartData: Object.values(chartMap),
      distribution: (Object.keys(totals) as CategoryKey[]).map(k => ({ name: CATEGORY_LABELS[k], value: totals[k], color: COLORS[k], id: k })).filter(v => v.value > 0),
      total: totalCost,
      totals,
      kmDriven: kmDiff,
      ftPerKm: ftPerKm,
      lastDates: categoryLastDate,
      eventCount: filtered.length,
      avgEventCost: totalCost / (filtered.length || 1)
    };
  }, [events, selectedCar, timeRange]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700 pt-[env(safe-area-inset-top)]">
      
      {/* --- FELSŐ VEZÉRLŐPULT --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gradient-ocean uppercase">
            Költség Analitika <span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm flex items-center gap-2 mt-1">
            <Clock size={14} className="text-primary" /> Frissítve: {new Date().toLocaleDateString('hu-HU')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 glass p-2 rounded-2xl border-neon-glow">
          <div className="flex items-center gap-2 px-3 border-r border-border/50">
            <Layers size={16} className="text-primary" />
            <select 
              value={selectedCar} 
              onChange={(e) => setSelectedCar(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer"
            >
              <option value="all">Összes autó</option>
              {cars.map(c => <option key={c.id} value={c.id}>{c.plate} - {c.model}</option>)}
            </select>
          </div>
          
          <div className="flex gap-1">
            {(['month', 'quarter', 'year', 'all'] as const).map((r) => (
              <button 
                key={r} 
                onClick={() => setTimeRange(r)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${timeRange === r ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:bg-accent'}`}
              >
                {r === 'month' ? '1 Hónap' : r === 'quarter' ? '3 Hónap' : r === 'year' ? '1 Év' : 'Összes'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- BENTO GRID STATISZTIKA --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fő Kiadás Box */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="lg:col-span-2 glass rounded-[2.5rem] p-8 relative overflow-hidden border-neon-glow group"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Pénzügyi mérleg</div>
              <Download size={20} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
            <div className="mt-8">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Összesített kiadás</span>
              <h2 className="text-6xl font-black tracking-tighter text-foreground mt-1 tabular-nums">
                {data.total.toLocaleString()} <span className="text-2xl font-light text-muted-foreground">Ft</span>
              </h2>
            </div>
            <div className="flex gap-8 mt-8 border-t border-border/50 pt-6">
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground">Események</p>
                <p className="text-xl font-black text-primary">{data.eventCount} db</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground">Átlag / tétel</p>
                <p className="text-xl font-black text-foreground">{~~data.avgEventCost.toLocaleString()} Ft</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] dark:opacity-[0.07] group-hover:scale-110 transition-transform duration-1000">
            <DollarSign size={280} />
          </div>
        </motion.div>

        {/* Ft/Km Kártya */}
        <div className="glass rounded-[2.5rem] p-8 flex flex-col justify-between group border-l-4 border-l-primary">
          <div className="flex justify-between items-center">
            <div className="h-12 w-12 rounded-2xl bg-ocean-electric flex items-center justify-center text-white shadow-inner">
              <Zap size={22} />
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                    <TrendingDown size={12} /> Hatékony
                </span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-black tracking-tighter italic text-foreground">
                {data.ftPerKm.toFixed(1)} <span className="text-sm font-bold uppercase not-italic text-muted-foreground">Ft/km</span>
            </h3>
            <p className="text-[10px] font-black uppercase text-muted-foreground mt-2 tracking-widest leading-none">
                Üzemeltetési hatékonyság a megtett {data.kmDriven.toLocaleString()} km alapján
            </p>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-ocean-electric rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-cyan-200" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Smart Insight</span>
            </div>
            <p className="text-sm font-bold leading-relaxed">
              {data.totals.fuel > data.totals.service 
                ? "Az üzemanyagköltséged dominál. Egy szoftveres optimalizálás vagy higgadtabb vezetés havi ~15.000 Ft-ot spórolhatna."
                : "A karbantartási költségek megugrottak. Ez hosszú távon növeli az autó eladási értékét és üzembiztonságát."}
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase mt-4 bg-white/20 w-fit px-4 py-2 rounded-full cursor-pointer hover:bg-white/30 transition-all">
            Részletes elemzés <ChevronRight size={14} />
          </div>
          {/* Dekoratív körök */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* --- FŐ VIZUALIZÁCIÓS PANEL --- */}
      <section className="glass rounded-[3rem] border-neon-glow overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-6 border-b border-border/50 gap-4">
          <div className="flex gap-2 bg-accent/50 p-1 rounded-2xl">
            {[
              { id: 'finance', label: 'Pénzügy', icon: DollarSign },
              { id: 'technical', label: 'Műszaki', icon: Gauge },
              { id: 'ai', label: 'Predikció', icon: ShieldAlert }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <Activity size={14} className="text-primary animate-pulse" /> Live Data Stream
          </div>
        </div>

        <div className="p-8 h-[450px]">
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'oklch(0.50 0.05 240)', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: 'oklch(0.55 0.18 230)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: 'oklch(0.15 0.04 260)', borderRadius: '20px', border: '1px solid oklch(0.65 0.16 200 / 0.2)', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="oklch(0.55 0.18 230 / 0.2)" radius={[10, 10, 0, 0]} barSize={40} />
                <Area type="monotone" dataKey="total" stroke="oklch(0.55 0.18 230)" strokeWidth={4} fill="url(#colorTotal)" />
                <Line type="monotone" dataKey="fuel" stroke="oklch(0.65 0.16 200)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            ) : activeTab === 'technical' ? (
              <AreaChart data={data.chartData}>
                <CartesianGrid strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="name" hide />
                <Tooltip />
                <Area type="stepAfter" dataKey="total" stroke="oklch(0.70 0.15 190)" fill="oklch(0.70 0.15 190 / 0.1)" strokeWidth={3} />
              </AreaChart>
            ) : (
              // AI Predikció / Szórás grafikon
              <PieChart>
                <Pie 
                  data={data.distribution} 
                  innerRadius={110} 
                  outerRadius={150} 
                  paddingAngle={10} 
                  dataKey="value" 
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {data.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- ALSÓ RÉSZLETES ADATOK ÉS INSIGHTOK --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kategória Ranglista */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border-neon-glow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2 uppercase tracking-tighter">
              <Briefcase size={20} className="text-primary" /> Költségstruktúra Elemzés
            </h3>
            <span className="text-[10px] font-black text-muted-foreground uppercase">Súlyozott Eloszlás</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {data.distribution.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-black text-foreground tabular-nums">{item.value.toLocaleString()} Ft</span>
                </div>
                <div className="h-2.5 w-full bg-accent rounded-full overflow-hidden border border-border/20">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(item.value / data.total) * 100}%` }} 
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full relative" 
                    style={{ backgroundColor: item.color }}
                  >
                     <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
                <p className="text-[9px] text-muted-foreground font-bold italic">
                   Utolsó bejegyzés: {data.lastDates[item.id] ? new Date(data.lastDates[item.id]).toLocaleDateString('hu-HU') : 'Nincs adat'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Okos Értesítések */}
        <div className="space-y-4">
          <div className="glass rounded-[2.5rem] p-6 border-l-4 border-l-primary flex gap-4 items-start border-neon-glow">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
               <Lightbulb size={20} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Proaktív Tipp</h4>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                A következő 3 hónapban várhatóan 1 db szerviz eseményed lesz az átlagos futásteljesítményed alapján.
              </p>
            </div>
          </div>

          <div className="glass rounded-[2.5rem] p-8 border-neon-glow flex-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
              <Clock size={16} className="text-primary" /> Gyors Előzmények
            </h3>
            <div className="space-y-3">
              {events.slice(0, 3).map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-accent/30 hover:bg-accent/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: (COLORS as any)[ev.type] || COLORS.other }} />
                    <span className="text-[10px] font-bold text-foreground truncate max-w-[120px]">{ev.title}</span>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground">{new Date(ev.event_date).toLocaleDateString('hu-HU', {month: 'short', day: 'numeric'})}</span>
                </div>
              ))}
              <button className="w-full py-3 mt-2 rounded-xl bg-secondary text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2">
                Összes tranzakció <MousePointer2 size={12} />
              </button>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}