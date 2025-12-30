'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Area
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Wallet, Zap, Calendar, 
  Download, Car, AlertTriangle, CheckCircle, Wrench, 
  Fuel, FileText, ArrowRight, Activity, Gauge
} from 'lucide-react'
import { motion } from 'framer-motion'

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

export default function UltimateDashboard({ events, cars }: { events: any[], cars: any[] }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('year');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  // --- ANALITIKAI MOTOR (The Brain) ---
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

    // 1. Szűrés
    const filteredEvents = events
      .filter(e => {
        const eDate = new Date(e.event_date);
        const carMatch = selectedCar === 'all' || e.car_id === Number(selectedCar);
        return carMatch && eDate >= startDate && eDate <= now;
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    // 2. Aggregálás változók
    let totalCost = 0;
    const catTotals: Record<string, number> = {};
    const monthlyData: Record<string, any> = {};
    let fuelLiters = 0;
    let minOdo = Infinity;
    let maxOdo = 0;
    let lastServiceOdo = 0;
    let lastServiceDate = null;

    filteredEvents.forEach(e => {
      const cost = Number(e.cost) || 0;
      const type = (e.type || 'other').toLowerCase();
      
      // Kategória felismerés (ha nincs explicit type, title alapján)
      let cat: CategoryKey = 'other';
      const title = (e.title || '').toLowerCase();
      if (type === 'fuel' || title.includes('tank')) cat = 'fuel';
      else if (type === 'service' || title.includes('szerviz') || title.includes('olaj')) cat = 'service';
      else if (title.includes('biztosítás') || title.includes('kgfb')) cat = 'insurance';
      else if (title.includes('parkolás')) cat = 'parking';
      else if (title.includes('adó') || title.includes('súlyadó')) cat = 'tax';
      else if (title.includes('mosás') || title.includes('karbantartás')) cat = 'maintenance';

      // Összesítések
      totalCost += cost;
      catTotals[cat] = (catTotals[cat] || 0) + cost;

      // Kilométer adatok
      const odo = Number(e.mileage) || 0;
      if (odo > 0) {
        if (odo < minOdo) minOdo = odo;
        if (odo > maxOdo) maxOdo = odo;
        
        // Utolsó szerviz keresése
        if (cat === 'service') {
          if (odo > lastServiceOdo) {
            lastServiceOdo = odo;
            lastServiceDate = e.event_date;
          }
        }
      }

      // Liter becslés (ha nincs adat, cost / 600 Ft)
      if (cat === 'fuel') {
        fuelLiters += e.volume ? Number(e.volume) : (cost / 620); 
      }

      // Idősoros adat (Havi bontás)
      const dateKey = new Date(e.event_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });
      if (!monthlyData[dateKey]) monthlyData[dateKey] = { name: dateKey, total: 0, fuel: 0, service: 0, other: 0, odo: odo };
      monthlyData[dateKey].total += cost;
      if (['fuel', 'service'].includes(cat)) {
        monthlyData[dateKey][cat] += cost;
      } else {
        monthlyData[dateKey].other += cost;
      }
      // Odo frissítés a hónapra (mindig a legnagyobbat vesszük az adott hónapban)
      if (odo > monthlyData[dateKey].odo) monthlyData[dateKey].odo = odo;
    });

    // 3. Számított mutatók
    const kmDriven = (maxOdo > minOdo && minOdo !== Infinity) ? maxOdo - minOdo : 0;
    const costPerKm = kmDriven > 0 ? totalCost / kmDriven : 0;
    const avgConsumption = (kmDriven > 0 && fuelLiters > 0) ? (fuelLiters / kmDriven) * 100 : 0;
    const kmSinceService = maxOdo - lastServiceOdo;
    
    // Grafikon adat kiegészítése kumulatív és hatékonysági adatokkal
    const chartData = Object.values(monthlyData).map((d: any, index, arr) => {
        // Havi futás becslése a pontosabb Ft/km érdekében
        const prevOdo = index > 0 ? arr[index-1].odo : minOdo;
        const monthKm = d.odo - prevOdo;
        const efficiency = monthKm > 0 ? Math.round(d.total / monthKm) : 0;
        return { ...d, efficiency: efficiency > 500 ? 500 : efficiency }; // Capelni a kiugró értékeket a grafikon miatt
    });

    const pieData = Object.keys(catTotals)
      .map(k => ({ name: CATEGORY_LABELS[k as CategoryKey], value: catTotals[k], color: COLORS[k as CategoryKey] }))
      .filter(i => i.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      totalCost,
      kmDriven,
      costPerKm,
      avgConsumption,
      kmSinceService,
      lastServiceDate,
      chartData,
      pieData,
      topCategory: pieData.length > 0 ? pieData[0] : null,
      recentEvents: filteredEvents.slice().reverse().slice(0, 5) // Utolsó 5 tétel
    };

  }, [events, selectedCar, timeRange]);

  const serviceHealth = Math.max(0, 100 - (analytics.kmSinceService / 15000) * 100); // 15.000 km periódus feltételezése

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      
      {/* --- FŐ HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-slate-900">
              <Car className="text-blue-600" />
              DynamicSense <span className="text-slate-400 font-light">Ultimate</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Autó Választó */}
            <div className="relative group">
              <select 
                value={selectedCar} 
                onChange={(e) => setSelectedCar(e.target.value)}
                className="appearance-none bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wide py-2.5 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
              >
                <option value="all">Teljes Flotta</option>
                {cars.map(c => <option key={c.id} value={c.id}>{c.plate}</option>)}
              </select>
              <ArrowRight className="absolute right-3 top-3 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>

            {/* Időszak Választó (Tabok) */}
            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
              {[
                { id: '30_days', label: '30 Nap' },
                { id: '90_days', label: '90 Nap' },
                { id: 'year', label: '1 Év' },
                { id: 'all', label: 'Összes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id as TimeRange)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    timeRange === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* --- KPI SOR (BENTO GRID STYLE) --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Kártya: Összköltség */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Pénzügy</span>
                <Wallet className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                {formatNumber(analytics.totalCost)} <span className="text-lg font-medium text-slate-400">Ft</span>
              </h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">A kiválasztott időszakban</p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
          </div>

          {/* 2. Kártya: Valós Hatékonyság (Ft/km) */}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-lg relative overflow-hidden group text-white">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-white/10 text-white/80 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Hatékonyság</span>
                <Gauge className="text-white/30" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter">
                {analytics.costPerKm.toFixed(0)} <span className="text-lg font-medium text-slate-400">Ft/km</span>
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${analytics.costPerKm < 60 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <p className="text-xs text-slate-400 font-medium">
                  {analytics.costPerKm < 60 ? 'Optimális tartomány' : 'Magas üzemeltetési költség'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Kártya: Fogyasztás */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Fogyasztás</span>
                <Fuel className="text-slate-300 group-hover:text-amber-500 transition-colors" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                {analytics.avgConsumption > 0 ? analytics.avgConsumption.toFixed(1) : '-'} <span className="text-lg font-medium text-slate-400">L/100km</span>
              </h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {analytics.kmDriven.toLocaleString()} km futásteljesítmény alapján
              </p>
            </div>
          </div>

           {/* 4. Kártya: Szerviz Állapot */}
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${serviceHealth > 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    Szerviz Státusz
                 </span>
                 <Wrench className="text-slate-300" />
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-2xl font-black text-slate-900">{analytics.kmSinceService.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400 mb-1">km telt el</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${Math.min(100, (analytics.kmSinceService / 15000) * 100)}%` }}
                    className={`h-full rounded-full ${serviceHealth > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-right">Következő: {(15000 - analytics.kmSinceService).toLocaleString()} km múlva</p>
              </div>
          </div>
        </section>

        {/* --- ANALITIKA GRID --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FŐ GRAFIKON (Bal oldal - 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900">Költség és Hatékonyság Trend</h3>
                <p className="text-xs text-slate-500 font-medium">Havi költés (oszlop) vs. Ft/km hatékonyság (vonal)</p>
              </div>
              <Activity className="text-blue-600" />
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.chartData}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="total" fill="url(#colorBar)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444', strokeWidth: 0}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KATEGÓRIA KÖRDIAGRAM + LISTA (Jobb oldal - 1/3) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-black text-slate-900 mb-6">Eloszlás</h3>
              <div className="flex items-center justify-center h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={analytics.pieData} 
                      cx="50%" cy="50%" 
                      innerRadius={60} outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="value"
                    >
                      {analytics.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                 {analytics.pieData.slice(0, 4).map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                          <span className="font-bold text-slate-600">{item.name}</span>
                       </div>
                       <span className="font-bold text-slate-900">{((item.value / analytics.totalCost) * 100).toFixed(0)}%</span>
                    </div>
                 ))}
              </div>
            </div>

            {/* AI Insight Kicsi Kártya */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
               <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-yellow-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Elemzés</span>
               </div>
               <p className="text-sm font-medium leading-relaxed opacity-90">
                 A legnagyobb kiadásod a <span className="font-bold text-white underline decoration-yellow-400">{analytics.topCategory?.name || 'Egyéb'}</span> volt, ami az összköltség <span className="font-bold">{analytics.topCategory ? ((analytics.topCategory.value / analytics.totalCost)*100).toFixed(0) : 0}%</span>-át tette ki.
                 {analytics.kmSinceService > 10000 && " Javasolt a szerviz időpont foglalása!"}
               </p>
            </div>
          </div>
        </section>

        {/* --- TRANZAKCIÓS NAPLÓ --- */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-lg font-black text-slate-900">Legutóbbi Tranzakciók</h3>
             <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
               Teljes napló <ArrowRight size={14} />
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Dátum</th>
                  <th className="px-6 py-4">Típus</th>
                  <th className="px-6 py-4">Leírás</th>
                  <th className="px-6 py-4">Km óra</th>
                  <th className="px-6 py-4 text-right">Összeg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.recentEvents.map((event: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">
                      {new Date(event.event_date).toLocaleDateString('hu-HU')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{
                         backgroundColor: `${COLORS[(event.type || 'other').toLowerCase() as CategoryKey]}20`,
                         color: COLORS[(event.type || 'other').toLowerCase() as CategoryKey]
                      }}>
                         {CATEGORY_LABELS[(event.type || 'other').toLowerCase() as CategoryKey] || event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{event.title || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {event.mileage ? `${Number(event.mileage).toLocaleString()} km` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      {formatHUF(Number(event.cost))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.recentEvents.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">Nincs adat a kiválasztott időszakban.</div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}

// --- HELPER KOMPONENSEK ---

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const total = payload.find((p: any) => p.dataKey === 'total');
    const eff = payload.find((p: any) => p.dataKey === 'efficiency');
    
    return (
      <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 text-xs z-50">
        <p className="font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{label}</p>
        
        <div className="flex items-center justify-between gap-6 mb-2">
           <span className="font-bold text-slate-600">Összesen:</span>
           <span className="font-black text-blue-600 text-sm">{formatHUF(total?.value || 0)}</span>
        </div>
        
        {eff && eff.value > 0 && (
          <div className="flex items-center justify-between gap-6">
             <span className="font-bold text-slate-600">Hatékonyság:</span>
             <span className="font-black text-red-500">{eff.value} Ft/km</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}