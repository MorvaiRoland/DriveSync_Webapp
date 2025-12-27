'use client'

import { useState, useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ComposedChart, Bar, Line
} from 'recharts'
import { 
  TrendingUp, Target, Fuel, DollarSign, PieChart as PieIcon, 
  Layers, Sparkles, Activity, Zap, ShieldAlert, ChevronRight, 
  ArrowUpRight, Briefcase, CalendarDays, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'other';

const COLORS: Record<CategoryKey, string> = {
  fuel: '#F59E0B', service: '#3B82F6', insurance: '#8B5CF6',
  maintenance: '#10B981', parking: '#EC4899', other: '#64748B'
};

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', other: 'Egyéb'
};

export default function CostAnalyticsDashboard({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'trends' | 'distribution' | 'prediction'>('trends');

  // --- ADATFELDOLGOZÁS AZ ADATBÁZISBÓL (events tábla alapján) ---
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
      // Intelligens kategorizálás a tábla 'type' és 'title' mezői alapján
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

      // Utolsó dátum rögzítése kategóriánként (Predictionhöz)
      if (!categoryLastDate[cat] || new Date(e.event_date) > new Date(categoryLastDate[cat])) {
        categoryLastDate[cat] = e.event_date;
      }

      // Kilométer számítás
      if (e.mileage > 0) {
        minKm = Math.min(minKm, e.mileage);
        maxKm = Math.max(maxKm, e.mileage);
      }

      // Havi bontás a grafikonhoz
      const dateLabel = new Date(e.event_date).toLocaleDateString('hu-HU', { year: '2-digit', month: 'short' });
      if (!chartMap[dateLabel]) {
        chartMap[dateLabel] = { name: dateLabel, fuel: 0, service: 0, insurance: 0, total: 0 };
      }
      chartMap[dateLabel][cat] = (chartMap[dateLabel][cat] || 0) + cost;
      chartMap[dateLabel].total += cost;
    });

    const totalCost = Object.values(totals).reduce((a, b) => a + b, 0);
    const kmDiff = (maxKm - minKm) > 0 ? (maxKm - minKm) : 1;
    
    return {
      chartData: Object.values(chartMap),
      distribution: (Object.keys(totals) as CategoryKey[]).map(k => ({ name: CATEGORY_LABELS[k], value: totals[k], color: COLORS[k], id: k })).filter(v => v.value > 0),
      total: totalCost,
      totals,
      ftPerKm: totalCost / kmDiff,
      lastDates: categoryLastDate,
      eventCount: filtered.length
    };
  }, [events, selectedCar, timeRange]);

  return (
    <div className="space-y-6 pb-12 transition-colors duration-500">
      
      {/* --- FEJLÉC --- */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Pénzügyi Elemzés <Activity className="text-emerald-500 w-6 h-6" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {data.eventCount} rögzített esemény feldolgozva.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <select 
            value={selectedCar} 
            onChange={(e) => setSelectedCar(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
          >
            <option value="all">Összes autó</option>
            {cars.map(c => <option key={c.id} value={c.id}>{c.plate}</option>)}
          </select>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
          {['month', 'year', 'all'].map((r) => (
            <button 
              key={r} 
              onClick={() => setTimeRange(r as any)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${timeRange === r ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {r === 'month' ? '1H' : r === 'year' ? '1É' : 'Mind'}
            </button>
          ))}
        </div>
      </section>

      {/* --- STATISZTIKAI BENTO GRID --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 relative overflow-hidden group shadow-sm">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Költségvetés</span>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tighter">
              {data.total.toLocaleString()} <span className="text-2xl text-slate-400 font-medium">Ft</span>
            </h2>
            <div className="flex gap-4 mt-6">
               <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-500 italic">~{Math.round(data.total / (data.eventCount || 1)).toLocaleString()} Ft / esemény</span>
               </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-700">
            <DollarSign size={120} className="text-slate-900 dark:text-white" />
          </div>
        </motion.div>

        <div className="bg-amber-500 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-lg shadow-amber-500/20 relative overflow-hidden group">
          <Zap className="w-8 h-8 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="text-3xl font-black tracking-tighter italic">{data.ftPerKm.toFixed(1)} Ft / km</h3>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Valós fenntartási költség</p>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="bg-slate-900 dark:bg-emerald-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-lg group">
          <Sparkles className="w-8 h-8 mb-4 text-emerald-300" />
          <p className="text-sm font-bold leading-snug">
            {data.totals.fuel > data.totals.service 
              ? "Az üzemanyag a legnagyobb kiadásod. Próbálj takarékosabb vezetést!"
              : "A szervizelés dominál. Az autód mostantól megbízhatóbb állapotban van."}
          </p>
          <div className="text-[10px] font-black uppercase opacity-60 mt-4 flex items-center gap-2">
            Adatbázis Insight <ChevronRight size={12} />
          </div>
        </div>
      </section>

      {/* --- GRAFIKONOK (Dark/Light kompatibilis színekkel) --- */}
      <section className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100 dark:border-slate-700 p-4 gap-2 overflow-x-auto">
          {['trends', 'distribution', 'prediction'].map((t) => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
              {t === 'trends' ? <Activity size={14}/> : t === 'distribution' ? <PieIcon size={14}/> : <ShieldAlert size={14}/>}
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-10 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'trends' ? (
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', color: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={4} fill="url(#colorTotal)" />
              </AreaChart>
            ) : activeTab === 'distribution' ? (
              <PieChart>
                <Pie data={data.distribution} innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">
                  {data.distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            ) : (
              <ComposedChart data={data.chartData}>
                <CartesianGrid strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#3B82F6" radius={[10, 10, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={3} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- ADATBÁZIS ALAPÚ EMLÉKEZTETŐK --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-black text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
            <Briefcase className="text-blue-500 w-5 h-5" /> Költségkeret Analízis
          </h3>
          <div className="space-y-5">
            {data.distribution.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">{item.name}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">{item.value.toLocaleString()} Ft</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(item.value / data.total) * 100}%` }} 
                    className="h-full rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner">
          <h3 className="font-black text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
            <Clock className="text-emerald-500 w-5 h-5" /> Utolsó rögzített bejegyzések
          </h3>
          <div className="space-y-3">
             {Object.entries(data.lastDates).slice(0, 4).map(([cat, date]: any) => (
                <div key={cat} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:scale-[1.02] transition-transform">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (COLORS as any)[cat] }} />
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">{CATEGORY_LABELS[cat as CategoryKey]}</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date(date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                   </div>
                   <div className="text-[10px] font-black text-emerald-500 uppercase">Naplózva</div>
                </div>
             ))}
             {Object.keys(data.lastDates).length === 0 && (
               <p className="text-center text-slate-400 text-sm italic py-10">Nincs elég adat az előzmények megjelenítéséhez.</p>
             )}
          </div>
        </div>
      </section>
    </div>
  );
}