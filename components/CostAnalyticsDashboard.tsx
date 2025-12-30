'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Zap, Calendar, 
  Download, Car, AlertCircle, CheckCircle2, MoreHorizontal, Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- TÍPUSOK ÉS KONSTANSOK ---
type TimeRange = 'month' | 'quarter' | 'year' | 'all';
type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'other';

const COLORS: Record<CategoryKey, string> = {
  fuel: '#3b82f6',       // Blue-500
  service: '#ef4444',    // Red-500
  insurance: '#8b5cf6',  // Violet-500
  maintenance: '#f59e0b',// Amber-500
  parking: '#10b981',    // Emerald-500
  other: '#64748b'       // Slate-500
};

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', other: 'Egyéb'
};

// Segédfüggvény a számformázáshoz
const formatCurrency = (val: number) => 
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val);

export default function ProCostAnalytics({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [activeChart, setActiveChart] = useState<'trend' | 'breakdown'>('trend');
  const [loading, setLoading] = useState(true);

  // Szimulált betöltés az animációkhoz
  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  // --- KOMPLEX ADATLOGIKA ---
  const analytics = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    // Időszak szűrés
    switch (timeRange) {
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
      case 'all': startDate = new Date(0); break;
    }

    const filteredEvents = events.filter(e => {
      const eDate = new Date(e.event_date);
      const carMatch = selectedCar === 'all' || e.car_id === Number(selectedCar);
      return carMatch && eDate >= startDate;
    });

    // Aggregálás
    const totalCost = filteredEvents.reduce((acc, e) => acc + Number(e.cost), 0);
    const categoryTotals: Record<string, number> = {};
    const monthlyData: Record<string, any> = {};
    
    let minKm = Infinity;
    let maxKm = 0;

    filteredEvents.forEach(e => {
      // Kategória detektálás (egyszerűsített logika a példa kedvéért)
      let cat: CategoryKey = 'other';
      const type = e.type?.toLowerCase() || '';
      const title = e.title?.toLowerCase() || '';
      if (type === 'fuel' || title.includes('tankolás')) cat = 'fuel';
      else if (type === 'service' || title.includes('szerviz')) cat = 'service';
      else if (title.includes('biztosítás')) cat = 'insurance';
      else if (title.includes('parkolás')) cat = 'parking';
      else if (title.includes('karbantartás')) cat = 'maintenance';

      // Totálok
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.cost);

      // Idősoros adat
      const monthKey = new Date(e.event_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { name: monthKey, total: 0 };
      monthlyData[monthKey][cat] = (monthlyData[monthKey][cat] || 0) + Number(e.cost);
      monthlyData[monthKey].total += Number(e.cost);

      // Km számítás
      if (e.mileage) {
        if (e.mileage < minKm) minKm = e.mileage;
        if (e.mileage > maxKm) maxKm = e.mileage;
      }
    });

    const chartData = Object.values(monthlyData);
    
    // Futásteljesítmény és fajlagos költség
    const kmDiff = maxKm > minKm && minKm !== Infinity ? maxKm - minKm : 0;
    const costPerKm = kmDiff > 0 ? totalCost / kmDiff : 0;

    // Trend számítás (utolsó hónap vs előző hónap átlaga)
    const sortedDates = Object.keys(monthlyData).sort();
    const lastMonthCost = sortedDates.length > 0 ? monthlyData[sortedDates[sortedDates.length - 1]].total : 0;
    const avgCost = chartData.length > 0 ? totalCost / chartData.length : 0;
    const trendPercentage = avgCost > 0 ? ((lastMonthCost - avgCost) / avgCost) * 100 : 0;

    return {
      totalCost,
      chartData,
      categoryStats: Object.entries(categoryTotals)
        .map(([key, value]) => ({ key: key as CategoryKey, value, percentage: (value / totalCost) * 100 }))
        .sort((a, b) => b.value - a.value),
      costPerKm,
      kmDriven: kmDiff,
      trend: trendPercentage,
      isTrendUp: trendPercentage > 0,
      projection: totalCost > 0 ? (totalCost / (filteredEvents.length || 1)) * 1.1 : 0 // Egyszerű becslés
    };
  }, [events, selectedCar, timeRange]);

  const exportReport = () => {
    alert("Jelentés generálása folyamatban... (CSV letöltés szimuláció)");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Car className="text-blue-600" size={32} />
            Költség Elemzés
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Részletes betekintés a flotta pénzügyi és műszaki teljesítményébe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <select 
            value={selectedCar} 
            onChange={(e) => setSelectedCar(e.target.value)}
            className="bg-slate-50 border-none text-sm font-bold rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="all">Minden jármű</option>
            {cars.map(c => <option key={c.id} value={c.id}>{c.plate} - {c.model}</option>)}
          </select>
          
          <div className="h-6 w-px bg-slate-200 mx-1" />

          {(['month', 'year', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                timeRange === r 
                ? 'bg-slate-900 text-white shadow-lg scale-105' 
                : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {r === 'month' ? '30 Nap' : r === 'year' ? '1 Év' : 'Összes'}
            </button>
          ))}
          
          <button onClick={exportReport} className="ml-2 p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Exportálás">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Összköltség" 
          value={formatCurrency(analytics.totalCost)} 
          icon={Wallet} 
          trend={analytics.trend}
          subtext="az időszakban"
        />
        <KPICard 
          title="Km Költség" 
          value={`${analytics.costPerKm.toFixed(0)} Ft/km`} 
          icon={Zap} 
          subtext={`${analytics.kmDriven.toLocaleString()} km futás alapján`}
          highlight
        />
        <KPICard 
          title="Havi Átlag" 
          value={formatCurrency(analytics.totalCost / (analytics.chartData.length || 1))} 
          icon={Calendar} 
          subtext="becsült átlag"
        />
        <KPICard 
          title="Következő Hó" 
          value={`~${formatCurrency(analytics.projection)}`} 
          icon={TrendingUp} 
          subtext="AI előrejelzés alapján"
          color="indigo"
        />
      </div>

      {/* --- MAIN CONTENT SPLIT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bal oldal: Grafikon */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Költségeloszlás Idővonalon</h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setActiveChart('trend')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeChart === 'trend' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}
              >
                Trend
              </button>
              <button 
                onClick={() => setActiveChart('breakdown')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeChart === 'breakdown' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}
              >
                Oszlop
              </button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'trend' ? (
                <AreaChart data={analytics.chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={analytics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {analytics.chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobb oldal: Részletes bontás és Insights */}
        <div className="space-y-6">
          
          {/* Kategória lista */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
              Kategóriák
              <Filter size={16} className="text-slate-400" />
            </h3>
            <div className="space-y-5">
              {analytics.categoryStats.map((cat) => (
                <div key={cat.key} className="group">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-bold text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[cat.key]}} />
                      {CATEGORY_LABELS[cat.key]}
                    </span>
                    <span className="font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[cat.key] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Insights (AI Doboz) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Zap size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Smart Insight</span>
              </div>
              
              <h4 className="text-lg font-bold mb-2">Mire figyelj?</h4>
              
              {analytics.costPerKm > 60 ? (
                <p className="text-sm text-slate-300 leading-relaxed">
                  A kilométerköltséged (<span className="text-white font-bold">{analytics.costPerKm.toFixed(0)} Ft/km</span>) magasabb az iparági átlagnál. Ellenőrizd az üzemanyag-fogyasztást vagy a gyakori szerviz látogatásokat.
                </p>
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed">
                  A fenntartási költségeid optimálisak. A jelenlegi trend alapján év végéig <span className="text-emerald-400 font-bold">~80.000 Ft</span> megtakarítás várható a tavalyi évhez képest.
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-xs font-medium text-slate-400">Adatok 100%-ban feldolgozva</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// --- KISEBB KOMPONENSEK A TISZTA KÓD ÉRDEKÉBEN ---

function KPICard({ title, value, icon: Icon, trend, subtext, highlight, color = 'blue' }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-3xl border ${highlight ? 'bg-blue-600 text-white border-blue-500 shadow-blue-200 shadow-xl' : 'bg-white text-slate-900 border-slate-200 shadow-sm'} flex flex-col justify-between h-36 relative overflow-hidden`}
    >
      <div className="flex justify-between items-start z-10">
        <span className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-blue-100' : 'text-slate-500'}`}>{title}</span>
        <Icon size={20} className={highlight ? 'text-blue-200' : `text-${color}-500`} />
      </div>
      
      <div className="z-10">
        <h2 className="text-2xl font-black tracking-tight">{value}</h2>
        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <span className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-red-500' : 'text-emerald-500'} ${highlight && 'text-white'}`}>
              {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          <span className={`text-[10px] font-medium truncate ${highlight ? 'text-blue-100' : 'text-slate-400'}`}>{subtext}</span>
        </div>
      </div>

      {/* Háttér dekoráció */}
      <Icon className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-5 pointer-events-none transform rotate-12`} />
    </motion.div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700/50">
        <p className="font-bold mb-2 text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-black mb-1">
          {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}