'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Area, ReferenceLine
} from 'recharts'
import { 
  Wallet, Zap, Car, Wrench, Fuel, ArrowRight, Activity, Gauge, 
  Download, TrendingUp, TrendingDown, CalendarClock, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- KONFIGURÁCIÓ & TÍPUSOK ---
type TimeRange = '30_days' | '90_days' | 'year' | 'ytd' | 'all';
type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'tax' | 'other';

const COLORS: Record<CategoryKey, string> = {
  fuel: '#2563eb',       // Blue-600
  service: '#dc2626',    // Red-600
  insurance: '#7c3aed',  // Violet-600
  maintenance: '#d97706',// Amber-600
  parking: '#059669',    // Emerald-600
  tax: '#475569',        // Slate-600
  other: '#94a3b8'       // Slate-400
};

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', tax: 'Adó/Illeték', other: 'Egyéb'
};

const formatHUF = (val: number) => 
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val);

const formatNumber = (val: number) => 
  new Intl.NumberFormat('hu-HU').format(val);

export default function CostAnalyticsDashboard({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  // --- ANALITIKAI MOTOR ---
  const analytics = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    // Időszak logika
    switch (timeRange) {
      case '30_days': startDate.setDate(now.getDate() - 30); break;
      case '90_days': startDate.setDate(now.getDate() - 90); break;
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
      case 'ytd': startDate = new Date(now.getFullYear(), 0, 1); break;
      case 'all': startDate = new Date(1970, 0, 1); break;
    }

    const filteredEvents = events
      .filter(e => {
        const eDate = new Date(e.event_date);
        const carMatch = selectedCar === 'all' || e.car_id === Number(selectedCar);
        return carMatch && eDate >= startDate && eDate <= now;
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    let totalCost = 0;
    const catTotals: Record<string, number> = {};
    const monthlyData: Record<string, any> = {};
    let fuelLiters = 0;
    let minOdo = Infinity;
    let maxOdo = 0;
    let lastServiceOdo = 0;

    filteredEvents.forEach(e => {
      const cost = Number(e.cost) || 0;
      const type = (e.type || 'other').toLowerCase();
      
      let cat: CategoryKey = 'other';
      const title = (e.title || '').toLowerCase();
      if (type === 'fuel' || title.includes('tank')) cat = 'fuel';
      else if (type === 'service' || title.includes('szerviz') || title.includes('olaj')) cat = 'service';
      else if (title.includes('biztosítás') || title.includes('kgfb')) cat = 'insurance';
      else if (title.includes('parkolás')) cat = 'parking';
      else if (title.includes('adó') || title.includes('súlyadó')) cat = 'tax';
      else if (title.includes('mosás') || title.includes('karbantartás')) cat = 'maintenance';

      totalCost += cost;
      catTotals[cat] = (catTotals[cat] || 0) + cost;

      const odo = Number(e.mileage) || 0;
      if (odo > 0) {
        if (odo < minOdo) minOdo = odo;
        if (odo > maxOdo) maxOdo = odo;
        if (cat === 'service' && odo > lastServiceOdo) lastServiceOdo = odo;
      }

      if (cat === 'fuel') fuelLiters += e.volume ? Number(e.volume) : (cost / 620);

      // Havi bontás
      const dateKey = new Date(e.event_date).toLocaleDateString('hu-HU', { year: '2-digit', month: 'short' });
      const sortKey = new Date(e.event_date).toISOString().slice(0, 7); 
      
      if (!monthlyData[sortKey]) monthlyData[sortKey] = { name: dateKey, iso: sortKey, total: 0, fuel: 0, service: 0, odo: 0 };
      monthlyData[sortKey].total += cost;
      if (['fuel', 'service'].includes(cat)) monthlyData[sortKey][cat] += cost;
      if (odo > monthlyData[sortKey].odo) monthlyData[sortKey].odo = odo;
    });

    const kmDriven = (maxOdo > minOdo && minOdo !== Infinity) ? maxOdo - minOdo : 0;
    const costPerKm = kmDriven > 0 ? totalCost / kmDriven : 0;
    const avgConsumption = (kmDriven > 0 && fuelLiters > 0) ? (fuelLiters / kmDriven) * 100 : 0;
    const kmSinceService = maxOdo - lastServiceOdo;
    
    // Éves becslés
    const daysInPeriod = Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const projectedAnnualCost = (totalCost / daysInPeriod) * 365;
    const projectedAnnualKm = (kmDriven / daysInPeriod) * 365;

    // Grafikon adat
    const chartData = Object.keys(monthlyData).sort().map((key, index, keys) => {
        const d = monthlyData[key];
        const prevKey = keys[index - 1];
        const prevOdo = prevKey ? monthlyData[prevKey].odo : minOdo;
        const monthKm = d.odo > prevOdo ? d.odo - prevOdo : 0;
        const efficiency = monthKm > 50 ? Math.round(d.total / monthKm) : 0;
        return { ...d, efficiency: efficiency > 600 ? 600 : efficiency };
    });

    const pieData = Object.keys(catTotals)
      .map(k => ({ name: CATEGORY_LABELS[k as CategoryKey], value: catTotals[k], color: COLORS[k as CategoryKey] }))
      .filter(i => i.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      totalCost, kmDriven, costPerKm, avgConsumption, kmSinceService,
      projectedAnnualCost, projectedAnnualKm,
      chartData, pieData,
      topCategory: pieData.length > 0 ? pieData[0] : null,
      recentEvents: filteredEvents.slice().reverse().slice(0, 10),
      filteredEvents
    };
  }, [events, selectedCar, timeRange]);

  // --- EXPORT FUNKCIÓ ---
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ['Dátum', 'Autó ID', 'Típus', 'Leírás', 'Km óra', 'Összeg (Ft)'];
      const csvContent = [
        headers.join(';'),
        ...analytics.filteredEvents.map(e => [
          new Date(e.event_date).toLocaleDateString('hu-HU'),
          e.car_id,
          CATEGORY_LABELS[(e.type || 'other').toLowerCase() as CategoryKey] || e.type,
          `"${e.title || ''}"`,
          e.mileage || 0,
          e.cost
        ].join(';'))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dynamicsense_export_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      setIsExporting(false);
    }, 1000);
  };

  const serviceHealth = Math.max(0, 100 - (analytics.kmSinceService / 15000) * 100);

  return (
    // Fő konténer: Light mód: slate-50, Dark mód: slate-950 (hogy illeszkedjen a page.tsx-hez)
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-32 min-h-screen transition-colors duration-300">
      
      {/* --- RAGADÓS HEADER --- */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-all pt-[env(safe-area-inset-top)]">
        <div className="px-4 sm:px-8 py-4">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
            
            {/* Cím */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Analytics Pro
                </h2>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-1">
                  Valós idejű flotta adatok
                </p>
              </div>
              {loading && <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
            </div>

            {/* Szűrők */}
            <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              <div className="relative group min-w-[140px]">
                <select 
                  value={selectedCar} 
                  onChange={(e) => setSelectedCar(e.target.value)}
                  className="appearance-none w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wide py-2.5 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <option value="all">Minden Jármű</option>
                  {cars.map(c => <option key={c.id} value={c.id}>{c.plate}</option>)}
                </select>
                <ArrowRight className="absolute right-3 top-3 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl whitespace-nowrap">
                {[{ id: '30_days', label: '30 Nap' }, { id: 'year', label: '1 Év' }, { id: 'all', label: 'Összes' }].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTimeRange(tab.id as TimeRange)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      timeRange === tab.id 
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors disabled:opacity-70 whitespace-nowrap shadow-lg shadow-slate-900/20"
              >
                {isExporting ? <span className="animate-pulse">Export...</span> : <><Download size={14} /> CSV</>}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-[1600px] mx-auto">
        
        {/* --- KPI SOR --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* 1. Pénzügy + Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Kiadások</span>
              <Wallet className="text-slate-200 dark:text-slate-700 group-hover:text-blue-500 transition-colors transform group-hover:scale-110 duration-300" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {formatNumber(analytics.totalCost)} <span className="text-lg font-medium text-slate-400 dark:text-slate-500">Ft</span>
            </h3>
            <div className="mt-4 flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit">
              <TrendingUp size={14} className="text-slate-400 dark:text-slate-400" />
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
                Várható éves: <span className="text-slate-900 dark:text-white">{formatNumber(Math.round(analytics.projectedAnnualCost))} Ft</span>
              </p>
            </div>
          </motion.div>

          {/* 2. Hatékonyság (Dark kártya - marad sötét, de light módban igazodik) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 dark:bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-slate-900/10 relative overflow-hidden group text-white transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-white/10 text-white/90 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">Hatékonyság</span>
              <Gauge className="text-white/20" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">
              {analytics.costPerKm.toFixed(0)} <span className="text-lg font-medium text-slate-500 dark:text-blue-200">Ft/km</span>
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full animate-pulse ${analytics.costPerKm < 60 ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <p className="text-xs text-slate-400 dark:text-blue-100 font-medium">
                {analytics.costPerKm < 60 ? 'Optimális működés' : 'Magas költségszint'}
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          {/* 3. Fogyasztás */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Üzemanyag</span>
              <Fuel className="text-slate-200 dark:text-slate-700 group-hover:text-amber-500 transition-colors" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {analytics.avgConsumption > 0 ? analytics.avgConsumption.toFixed(1) : '-'} <span className="text-lg font-medium text-slate-400 dark:text-slate-500">L/100</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium flex items-center gap-1">
              <Car size={12} /> {analytics.kmDriven.toLocaleString()} km futás alapján
            </p>
          </motion.div>

           {/* 4. Szerviz Egészség */}
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between transition-colors">
              <div className="flex justify-between items-start">
                 <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${serviceHealth > 50 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                    Szerviz
                 </span>
                 <Wrench className="text-slate-200 dark:text-slate-700" />
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{analytics.kmSinceService.toLocaleString()}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">km telt el</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${Math.min(100, (analytics.kmSinceService / 15000) * 100)}%` }}
                    className={`h-full rounded-full ${serviceHealth > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                </div>
                {analytics.kmSinceService > 10000 && (
                   <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1">
                      <AlertCircle size={10} /> Esedékes hamarosan!
                   </p>
                )}
              </div>
          </motion.div>
        </div>

        {/* --- GRAFIKONOK GRID --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          
          {/* FŐ CHART */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 relative transition-colors"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Költség Analízis</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Havi költés (Oszlop) vs. Ft/km hatékonyság (Vonal)</p>
              </div>
              
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-sm" /> Költés</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-1 bg-red-500 rounded-full" /> Hatékonyság</div>
              </div>
            </div>

            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  {/* Grid vonalak halványítása dark módban */}
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} stroke="currentColor" className="text-slate-400 dark:text-slate-600" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                    dy={10} 
                    minTickGap={30} 
                  />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', opacity: 0.05}} />
                  <Bar yAxisId="left" dataKey="total" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={24} animationDuration={1500} />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{r: 6}} animationDuration={2000} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* INSIGHTS OLDALSÁV */}
          <div className="space-y-6">
            
            {/* Kördiagram */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Kategóriák</h3>
              <div className="flex items-center justify-center h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={analytics.pieData} 
                      cx="50%" cy="50%" 
                      innerRadius={60} outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="value"
                      stroke="none"
                    >
                      {analytics.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', fontWeight: 'bold'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-3 mt-2">
                 {analytics.pieData.slice(0, 4).map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between group cursor-default">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-sm" style={{backgroundColor: item.color}} />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</span>
                       </div>
                       <span className="text-xs font-black text-slate-900 dark:text-white">{((item.value / analytics.totalCost) * 100).toFixed(0)}%</span>
                    </div>
                 ))}
              </div>
            </motion.div>

            {/* AI Tipp Kártya */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap size={100} />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white">AI Elemzés</span>
                 </div>
                 <p className="text-sm font-medium leading-relaxed opacity-90 mb-4">
                   A legnagyobb kiadásod a <span className="font-bold text-yellow-300 border-b border-yellow-300/30">{analytics.topCategory?.name || 'Egyéb'}</span> volt ({analytics.topCategory ? ((analytics.topCategory.value / analytics.totalCost)*100).toFixed(0) : 0}%).
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    <CalendarClock size={12} />
                    {analytics.projectedAnnualKm > 20000 ? 'Nagy futásteljesítmény várható' : 'Átlagos használat'}
                 </div>
               </div>
            </motion.div>
          </div>
        </div>

        {/* --- TRANZAKCIÓS NAPLÓ --- */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
             <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Legutóbbi Tranzakciók</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">Az utolsó 10 rögzített tétel</p>
             </div>
             <button onClick={handleExport} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-xl transition-all flex items-center gap-2">
               Minden megtekintése <ArrowRight size={14} />
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="px-6 sm:px-8 py-4">Dátum</th>
                  <th className="px-6 py-4">Típus</th>
                  <th className="px-6 py-4">Leírás</th>
                  <th className="px-6 py-4 text-center">Km óra</th>
                  <th className="px-6 sm:px-8 py-4 text-right">Összeg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics.recentEvents.map((event: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 sm:px-8 py-4 font-bold text-slate-700 dark:text-slate-300">
                      {new Date(event.event_date).toLocaleDateString('hu-HU', {month: 'short', day: 'numeric', year: 'numeric'})}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm" style={{
                         backgroundColor: COLORS[(event.type || 'other').toLowerCase() as CategoryKey] + '15',
                         color: COLORS[(event.type || 'other').toLowerCase() as CategoryKey]
                      }}>
                         {CATEGORY_LABELS[(event.type || 'other').toLowerCase() as CategoryKey] || event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium max-w-[200px] truncate">{event.title || '-'}</td>
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs text-center">
                      {event.mileage ? <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-bold">{Number(event.mileage).toLocaleString()}</span> : '-'}
                    </td>
                    <td className="px-6 sm:px-8 py-4 text-right font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {formatHUF(Number(event.cost))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Empty State */}
            {analytics.recentEvents.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <Car size={32} className="text-slate-300 dark:text-slate-600" />
                </div>
                <h4 className="text-slate-900 dark:text-white font-bold">Nincs megjeleníthető adat</h4>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Válassz másik időszakot vagy autót.</p>
              </div>
            )}
          </div>
        </motion.div>

      </main>
    </div>
  )
}

// --- TOOLTIP KOMPONENS (Modern & Clean) ---
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const total = payload.find((p: any) => p.dataKey === 'total');
    const eff = payload.find((p: any) => p.dataKey === 'efficiency');
    
    return (
      <div className="bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 dark:border-slate-700/50 text-xs z-50 min-w-[180px]">
        <p className="font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">{label}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
             <span className="font-medium text-slate-300">Összesen:</span>
             <span className="font-black text-white text-sm">{formatHUF(total?.value || 0)}</span>
          </div>
          
          {eff && eff.value > 0 && (
            <div className="flex items-center justify-between gap-4">
               <span className="font-medium text-slate-300">Hatékonyság:</span>
               <span className="font-bold text-emerald-400">{eff.value} Ft/km</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}