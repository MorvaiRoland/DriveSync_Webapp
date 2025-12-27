'use client'

import { useState, useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Target, Fuel, DollarSign, 
  Calendar, PieChart as PieIcon, Layers, Sparkles, Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- TÍPUSOK ÉS KONFIGURÁCIÓ ---
type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'other';

const COLORS: Record<CategoryKey, string> = {
  fuel: '#F59E0B',        // Amber
  service: '#3B82F6',     // Blue
  insurance: '#8B5CF6',   // Violet
  maintenance: '#10B981', // Emerald
  parking: '#EC4899',     // Pink
  other: '#64748B'        // Slate
};

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Tankolás',
  service: 'Szerviz',
  insurance: 'Biztosítás',
  maintenance: 'Karbantartás',
  parking: 'Parkolás',
  other: 'Egyéb'
};

export default function CostAnalyticsDashboard({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [budgetMode, setBudgetMode] = useState(false);
  
  // Példa költségvetés adatok
  const [budgetData] = useState<Record<CategoryKey, number>>({
    fuel: 45000,
    service: 25000,
    maintenance: 10000,
    insurance: 15000,
    parking: 5000,
    other: 5000
  });

  // --- ADATFELDOLGOZÁS (TypeScript Biztos) ---
  const data = useMemo(() => {
    const totals: Record<CategoryKey, number> = { fuel: 0, service: 0, insurance: 0, maintenance: 0, parking: 0, other: 0 };
    const chartMap: Record<string, any> = {};

    // Szűrés
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
      // Intelligens kategorizálás
      let cat: CategoryKey = 'other';
      const type = e.type?.toLowerCase();
      const notes = e.notes?.toLowerCase() || '';

      if (type === 'fuel') cat = 'fuel';
      else if (type === 'service' || notes.includes('szerviz')) cat = 'service';
      else if (notes.includes('biztosítás') || notes.includes('kgfb') || notes.includes('casco')) cat = 'insurance';
      else if (notes.includes('parkolás')) cat = 'parking';
      else if (notes.includes('karbantartás') || notes.includes('mosás')) cat = 'maintenance';

      const cost = Number(e.cost) || 0;
      totals[cat] += cost;

      // Grafikon adatok összeállítása
      const dateLabel = new Date(e.event_date).toLocaleDateString('hu-HU', { month: 'short' });
      if (!chartMap[dateLabel]) {
        chartMap[dateLabel] = { name: dateLabel, fuel: 0, service: 0, insurance: 0, maintenance: 0, parking: 0, other: 0 };
      }
      chartMap[dateLabel][cat] += cost;
    });

    // Distribution (Pite grafikonhoz) - JAVÍTOTT MAPPELÉS
    const distribution = (Object.keys(totals) as CategoryKey[])
      .map((key) => ({
        name: CATEGORY_LABELS[key],
        value: totals[key],
        color: COLORS[key],
        id: key
      }))
      .filter(item => item.value > 0);

    return {
      chartData: Object.values(chartMap),
      distribution,
      total: Object.values(totals).reduce((a, b) => a + b, 0),
      totals
    };
  }, [events, selectedCar, timeRange]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* --- FEJLÉC ÉS SZŰRŐK --- */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Költség Analitika <span className="text-amber-500">.</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2">
            <Activity size={16} className="text-amber-500" /> 
            {data.total.toLocaleString()} Ft összköltség a vizsgált időszakban
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-[1.5rem] border border-white/10 backdrop-blur-xl shadow-2xl">
          {['month', 'quarter', 'year', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                timeRange === range 
                ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)]' 
                : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              {range === 'month' ? '1H' : range === 'quarter' ? '3H' : range === 'year' ? '1É' : 'Mind'}
            </button>
          ))}
        </div>
      </section>

      {/* --- STATISZTIKAI BENTO BOXOK --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fő Kártya */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-2 bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2.5rem] text-black relative overflow-hidden shadow-2xl shadow-amber-500/20 group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <DollarSign size={120} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Teljes ráfordítás</p>
              <h3 className="text-5xl font-black mt-2 tracking-tighter">{data.total.toLocaleString()} Ft</h3>
            </div>
            <div className="mt-8 flex items-center gap-3">
               <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-black/5">
                  <Sparkles size={14} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase">AI optimalizált adatok</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Tankolás Box */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <Fuel size={24} />
            </div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div className="mt-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tankolás összesen</p>
            <h3 className="text-3xl font-black mt-1">{(data.totals.fuel || 0).toLocaleString()} Ft</h3>
          </div>
        </div>

        {/* Járműválasztó Box */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-inner">
          <div className="p-3 bg-white/5 rounded-2xl text-slate-400 w-fit">
            <Layers size={24} />
          </div>
          <div className="mt-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Aktuális Garázs</p>
            <select 
              value={selectedCar} 
              onChange={(e) => setSelectedCar(e.target.value)}
              className="w-full bg-transparent border-none font-black text-xl text-white focus:ring-0 p-0 cursor-pointer appearance-none"
            >
              <option value="all">Minden jármű</option>
              {cars.map((c: any) => <option key={c.id} value={c.id} className="bg-slate-900">{c.plate} - {c.model}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* --- GRAFIKONOK SZEKCIÓ --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fő Költségvonal */}
        <div className="lg:col-span-2 bg-white/5 rounded-[3rem] p-8 md:p-10 border border-white/10 backdrop-blur-md relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <h3 className="font-black text-2xl flex items-center gap-3">
              <Activity className="text-amber-500" /> Trendvonal
            </h3>
            <button 
              onClick={() => setBudgetMode(!budgetMode)} 
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black tracking-widest transition-all border ${
                budgetMode 
                ? 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/20' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <Target size={16} /> {budgetMode ? 'BUDGET NÉZET ON' : 'BUDGET NÉZET'}
            </button>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.fuel} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.fuel} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '20px', 
                    border: '1px solid #ffffff10',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="fuel" 
                  stroke={COLORS.fuel} 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorMain)" 
                  name="Tankolás"
                />
                <Area 
                  type="monotone" 
                  dataKey="service" 
                  stroke={COLORS.service} 
                  strokeWidth={4} 
                  fill="transparent" 
                  name="Szerviz"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eloszlás Pite */}
        <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10 backdrop-blur-md flex flex-col">
          <h3 className="font-black text-2xl mb-10 flex items-center gap-3">
            <PieIcon className="text-blue-500" /> Eloszlás
          </h3>
          <div className="h-[280px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribution}
                  innerRadius={85}
                  outerRadius={110}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {data.distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Top Kategória</span>
                <span className="text-xl font-black text-white">{data.distribution[0]?.name || 'N/A'}</span>
            </div>
          </div>
          
          <div className="mt-auto space-y-3 pt-6">
            {data.distribution.slice(0, 4).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="font-mono text-xs font-black">{item.value.toLocaleString()} Ft</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- KÖLTSÉGVETÉS SZEKCIÓ --- */}
      <AnimatePresence>
        {budgetMode && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-[#0f172a] rounded-[3rem] p-8 md:p-12 border border-violet-500/20 shadow-2xl shadow-violet-500/10"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-violet-500 rounded-[1.5rem] text-black shadow-lg shadow-violet-500/40">
                  <Target size={28} />
                </div>
                <div>
                  <h3 className="font-black text-3xl tracking-tighter">Havi Limit Kontroll</h3>
                  <p className="text-slate-400 text-sm font-medium">Beállított célok vs. valós költések</p>
                </div>
              </div>
              <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                 <span className="text-xs font-black uppercase tracking-widest text-violet-400">Status: Aktív Figyelés</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {(Object.keys(budgetData) as CategoryKey[]).map((key) => {
                const limit = budgetData[key];
                const actual = data.totals[key] || 0;
                const percent = Math.min((actual / limit) * 100, 100);
                const isOver = actual > limit;

                return (
                  <div key={key} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[key] }} />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-300">{CATEGORY_LABELS[key]}</span>
                      </div>
                      <span className={`text-sm font-black font-mono ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                        {actual.toLocaleString()} <span className="text-slate-600 font-medium">/ {limit.toLocaleString()} Ft</span>
                      </span>
                    </div>
                    
                    <div className="relative h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full relative ${
                          isOver 
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                          : 'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        }`}
                      >
                         <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
                      </motion.div>
                    </div>

                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className={isOver ? 'text-red-500' : 'text-slate-500'}>{isOver ? 'Limit túllépve!' : 'Kiváló egyensúly'}</span>
                       <span className="text-slate-500">{percent.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}