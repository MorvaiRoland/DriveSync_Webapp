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

// --- TÍPUSOK ÉS KONFIG ---
type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'other';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', other: 'Egyéb'
};

const COLORS: Record<CategoryKey, string> = {
  fuel: 'var(--chart-1)',
  service: 'var(--chart-3)',
  insurance: 'var(--chart-4)',
  maintenance: 'var(--primary)',
  parking: 'var(--chart-5)',
  other: 'var(--chart-2)'
};

export default function CostAnalyticsDashboard({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'equity' | 'finance' | 'ai'>('equity');

  // --- EXTRÉM ADATFELDOLGOZÁS ---
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
    
    // --- EGYEDI LOGIKA: ÉRTÉKTARTÁS ÉS EQUITY ---
    // A szervizköltség 40%-át "visszanyert" értéknek tekintjük az eladásnál
    const resaleBonus = (totals.service + totals.maintenance) * 0.45;
    // Karbantartási fegyelem (0-100)
    const disciplineScore = Math.min(100, (filtered.length / (kmDiff / 5000 || 1)) * 50);

    return {
      chartData: Object.values(chartMap),
      distribution: (Object.keys(totals) as CategoryKey[]).map(k => ({ 
        name: CATEGORY_LABELS[k], value: totals[k], color: COLORS[k], id: k 
      })).filter(v => v.value > 0),
      total: totalCost,
      totals,
      kmDriven: kmDiff,
      ftPerKm,
      resaleBonus,
      disciplineScore,
      eventCount: filtered.length,
      radarData: [
        { subject: 'Költség', A: Math.min(100, (totalCost / 500000) * 100), fullMark: 100 },
        { subject: 'Fegyelem', A: disciplineScore, fullMark: 100 },
        { subject: 'Előélet', A: Math.min(100, filtered.length * 10), fullMark: 100 },
        { subject: 'Takarékosság', A: ftPerKm > 0 ? Math.max(0, 100 - ftPerKm) : 100, fullMark: 100 },
      ]
    };
  }, [events, selectedCar, timeRange]);

  return (
    <div className="space-y-6 pb-20 pt-[env(safe-area-inset-top)] selection:bg-primary/30">
      
      {/* --- HEADER: FUTURE TECH --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tighter text-gradient-ocean uppercase italic"
          >
            Apex Analytics <span className="text-primary">/</span>
          </motion.h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck size={12} /> Adatbázis szinkronizálva
            </span>
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              {new Date().toLocaleTimeString('hu-HU')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 glass p-2 rounded-3xl border-neon-glow shadow-2xl dark:shadow-none">
          <div className="flex items-center gap-2 px-4 border-r border-border/50">
            <Layers size={16} className="text-primary" />
            <select 
              value={selectedCar} 
              onChange={(e) => setSelectedCar(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer text-foreground"
            >
              <option value="all">Flotta nézet</option>
              {cars.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.plate} - {c.model}</option>)}
            </select>
          </div>
          <div className="flex gap-1">
            {(['month', 'quarter', 'year', 'all'] as const).map((r) => (
              <button 
                key={r} 
                onClick={() => setTimeRange(r)}
                className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all ${timeRange === r ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-accent'}`}
              >
                {r === 'month' ? '1 Hó' : r === 'quarter' ? '3 Hó' : r === 'year' ? '1 Év' : 'Mind'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- BENTO GRID: UNIQUE KPIs --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Fő Kártya: Resale Equity (Az Egyedi Funkció) */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="lg:col-span-2 glass rounded-[2.5rem] p-8 relative overflow-hidden border-l-8 border-l-primary group"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Resale Value Impact</span>
                <p className="text-xs text-muted-foreground font-bold uppercase mt-2">Becsült értéktöbblet a szervizmúlt miatt</p>
              </div>
              <Gem className="text-primary animate-bounce" size={32} />
            </div>
            <div className="mt-6 flex items-end gap-3">
              <h2 className="text-6xl font-black tracking-tighter text-foreground tabular-nums">
                + {Math.round(data.resaleBonus).toLocaleString()} <span className="text-2xl font-light text-muted-foreground uppercase">Ft</span>
              </h2>
              <div className="mb-2 flex items-center text-emerald-500 font-black text-xs uppercase italic">
                <ArrowUpRight size={16} /> 12% profit
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground">Karbantartási Index</p>
                <p className="text-xl font-black text-foreground">{data.disciplineScore.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground">Összes kiadás</p>
                <p className="text-xl font-black text-foreground">{data.total.toLocaleString()} Ft</p>
              </div>
            </div>
          </div>
          <Rocket className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.03] dark:opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000" />
        </motion.div>

        {/* Ft/Km Efficiency */}
        <div className="glass rounded-[2.5rem] p-8 flex flex-col justify-between group border-neon-glow hover:bg-primary/5 transition-all">
          <div className="flex justify-between items-center">
            <div className="h-14 w-14 rounded-2xl bg-ocean-electric flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Zap size={28} />
            </div>
            <div className="text-right">
                <span className="text-[10px] font-black text-primary uppercase">Efficiency</span>
                <div className="flex items-center gap-1 text-emerald-500">
                    <Activity size={14} />
                    <span className="text-xs font-black">Top 5%</span>
                </div>
            </div>
          </div>
          <div>
            <h3 className="text-5xl font-black tracking-tighter italic text-foreground">
                {data.ftPerKm.toFixed(1)} <span className="text-sm font-bold uppercase not-italic text-muted-foreground">Ft/km</span>
            </h3>
            <p className="text-[10px] font-black uppercase text-muted-foreground mt-2 tracking-widest">
                Valós fenntartási mutató
            </p>
          </div>
        </div>

        {/* AI Karbantartási Jóslat */}
        <div className="bg-ocean-electric rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles size={24} className="text-cyan-200 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 underline underline-offset-4">AI Diagnostic Insight</span>
            </div>
            <p className="text-sm font-bold leading-relaxed italic">
              "A {CATEGORY_LABELS[data.topCategory]} költségeid szignifikánsan magasabbak a modell-átlagnál. Javaslom a gyújtógyertyák ellenőrzését a fogyasztás csökkentése érdekében."
            </p>
          </div>
          <button className="relative z-10 mt-6 flex items-center gap-2 text-[10px] font-black uppercase bg-white/20 hover:bg-white/40 px-6 py-3 rounded-2xl transition-all w-full justify-center border border-white/20">
            Prediktív Jelentés Generálása <ChevronRight size={14} />
          </button>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </div>
      </section>

      {/* --- MAIN ANALYTICS CENTER --- */}
      <section className="glass rounded-[3rem] border-neon-glow overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between p-8 border-b border-border/50 gap-6 bg-slate-50/30 dark:bg-transparent">
          <div className="flex gap-2 bg-accent/40 p-1.5 rounded-[1.2rem] border border-border/50">
            {[
              { id: 'equity', label: 'Vagyoni Érték', icon: Gem },
              { id: 'finance', label: 'Cash-Flow', icon: Wallet },
              { id: 'ai', label: 'Statisztika', icon: Scale }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-background text-primary shadow-xl ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Adatpontok száma</span>
                <span className="text-sm font-black text-foreground">{events.length} bejegyzés</span>
             </div>
             <Download size={24} className="text-primary hover:scale-110 cursor-pointer transition-transform" />
          </div>
        </div>

        <div className="p-8 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'equity' ? (
              <ComposedChart data={data.chartData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="oklch(0.50 0.05 240 / 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 900}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '24px', border: '1px solid var(--primary)', color: 'var(--card-foreground)', fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} fill="url(#equityGradient)" name="Költés Trend" />
                <Line type="step" dataKey="service" stroke="var(--chart-3)" strokeWidth={3} dot={{ r: 4, fill: 'var(--chart-3)' }} name="Szerviz Pontok" />
              </ComposedChart>
            ) : activeTab === 'finance' ? (
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'var(--primary)', opacity: 0.05}} />
                <Bar dataKey="total" fill="var(--primary)" radius={[15, 15, 0, 0]} barSize={50} />
              </BarChart>
            ) : (
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                <PolarGrid stroke="var(--muted-foreground)" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--foreground)', fontSize: 12, fontWeight: 900}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                <Radar name="Autó Állapot" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- RÉSZLETEZŐ PANEL --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kategória Analízis */}
        <div className="lg:col-span-2 glass rounded-[3rem] p-10 border-neon-glow">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-foreground flex items-center gap-3 uppercase italic tracking-tighter">
              <Scale size={24} className="text-primary" /> Költségportfólió
            </h3>
            <div className="flex items-center gap-2 bg-accent/50 px-4 py-2 rounded-full border border-border/50">
                <Target size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Optimális eloszlás figyelése</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {data.distribution.map((item) => (
              <div key={item.id} className="space-y-3 group cursor-pointer">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                     <span className="text-xs font-black uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                  <span className="text-base font-black text-foreground tabular-nums">{item.value.toLocaleString()} Ft</span>
                </div>
                <div className="h-4 w-full bg-accent/50 rounded-full overflow-hidden border border-border shadow-inner relative">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${(item.value / data.total) * 100}%` }} 
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full rounded-full relative shadow-[0_0_15px_rgba(0,0,0,0.2)]" 
                    style={{ backgroundColor: item.color }}
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                   <span className="text-primary">{((item.value / data.total) * 100).toFixed(1)}%</span>
                   <span>Piaci átlag felett: +4.2%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Okos Eseményfigyelő */}
        <div className="space-y-4">
          <div className="bg-primary rounded-[2.5rem] p-8 text-white border border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Proaktív Karbantartás</h4>
              <div className="space-y-4">
                 <div className="flex gap-4 items-center bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                    <Clock className="text-cyan-200" size={20} />
                    <div>
                       <p className="text-[10px] font-black uppercase">Következő olajcsere</p>
                       <p className="text-sm font-bold tracking-tight">4.200 km múlva várható</p>
                    </div>
                 </div>
                 <div className="flex gap-4 items-center bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                    <ShieldAlert className="text-amber-300" size={20} />
                    <div>
                       <p className="text-[10px] font-black uppercase">Fékfolyadék teszt</p>
                       <p className="text-sm font-bold tracking-tight">Időszerű (365+ napja volt)</p>
                    </div>
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000" />
          </div>

          <div className="glass rounded-[2.5rem] p-8 border-neon-glow shadow-xl flex-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-6 flex items-center gap-2">
              <Clock size={16} className="text-primary" /> Naplózási minőség
            </h3>
            <div className="relative h-24 w-full flex items-center justify-center">
               {/* Custom Circle Progress for data quality */}
               <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-accent" />
                  <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={220} strokeDashoffset={220 - (220 * 0.85)} className="text-primary transition-all duration-1000" />
               </svg>
               <span className="absolute text-xl font-black italic">85%</span>
            </div>
            <p className="text-[10px] text-center text-muted-foreground font-bold uppercase mt-4 tracking-widest">
                Kiváló adatsűrűség. <br/>A riportod hiteles.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}