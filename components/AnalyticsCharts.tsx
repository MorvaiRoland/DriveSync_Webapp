'use client'

import { useState, useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts'
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react'

// Színek definiálása a grafikonokhoz
const COLORS = {
  fuel: '#f59e0b',   // Amber-500
  service: '#3b82f6', // Blue-500
  other: '#10b981',   // Emerald-500
  text: '#94a3b8',    // Slate-400
  grid: '#334155'     // Slate-700
}

export default function AnalyticsCharts({ events }: { events: any[];isPro?: boolean; }) {
  const [activeTab, setActiveTab] = useState<'trend' | 'distribution'>('trend')

  // --- ADATFELDOLGOZÁS ---
  const { monthlyData, distributionData, totalStats } = useMemo(() => {
    if (!events || events.length === 0) return { monthlyData: [], distributionData: [], totalStats: {} };

    // 1. Dátum szerinti rendezés (növekvő)
    const sortedEvents = [...events].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    // 2. Havi csoportosítás (Trendhez)
    const months: Record<string, any> = {};
    const categoryCounts: Record<string, number> = { fuel: 0, service: 0, other: 0 };

    sortedEvents.forEach(event => {
      const date = new Date(event.event_date);
      const monthKey = date.toLocaleDateString('hu-HU', { year: '2-digit', month: 'short' }); // pl. 24. jan.
      
      if (!months[monthKey]) {
        months[monthKey] = { name: monthKey, fuel: 0, service: 0, other: 0, total: 0 };
      }

      const cost = event.cost || 0;
      const type = event.type === 'fuel' ? 'fuel' : (event.type === 'service' ? 'service' : 'other');

      months[monthKey][type] += cost;
      months[monthKey].total += cost;
      categoryCounts[type] += cost;
    });

    // Utolsó 6-12 hónap adatainak kinyerése
    const monthlyDataArray = Object.values(months).slice(-12);

    // 3. Kategória eloszlás (Fánkhoz)
    const distributionArray = [
      { name: 'Tankolás', value: categoryCounts.fuel, color: COLORS.fuel },
      { name: 'Szerviz', value: categoryCounts.service, color: COLORS.service },
      { name: 'Egyéb', value: categoryCounts.other, color: COLORS.other },
    ].filter(item => item.value > 0);

    return { 
      monthlyData: monthlyDataArray, 
      distributionData: distributionArray,
      totalStats: categoryCounts
    };
  }, [events]);

  if (!events || events.length === 0) return null;

  // --- EGYEDI TOOLTIP ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-slate-300 font-bold mb-2 text-xs uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 capitalize">{entry.name === 'fuel' ? 'Tankolás' : entry.name === 'service' ? 'Szerviz' : entry.name}:</span>
              <span className="text-white font-mono font-bold ml-auto">
                {entry.value.toLocaleString()} Ft
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[400px]">
      
      {/* --- FEJLÉC ÉS TABOK --- */}
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
           <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-indigo-500" />
             Pénzügyi Elemzés
           </h3>
           <p className="text-xs text-slate-500 mt-1 hidden sm:block">
             Költségek alakulása az elmúlt időszakban
           </p>
        </div>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center">
          <button 
            onClick={() => setActiveTab('trend')}
            className={`p-2 rounded-md transition-all ${activeTab === 'trend' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Trend"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveTab('distribution')}
            className={`p-2 rounded-md transition-all ${activeTab === 'distribution' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Eloszlás"
          >
            <PieIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --- GRAFIKON TARTALOM --- */}
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'trend' ? (
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.fuel} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.fuel} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.service} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.service} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} opacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: COLORS.text, fontSize: 10 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: COLORS.text, fontSize: 10 }} 
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="service" 
                stackId="1" 
                stroke={COLORS.service} 
                fill="url(#colorService)" 
                strokeWidth={2}
                name="Szerviz"
              />
              <Area 
                type="monotone" 
                dataKey="fuel" 
                stackId="1" 
                stroke={COLORS.fuel} 
                fill="url(#colorFuel)" 
                strokeWidth={2}
                name="Tankolás"
              />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie
                data={distributionData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {distributionData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                 itemStyle={{ color: '#fff' }}
                 formatter={(value: number) => `${value.toLocaleString()} Ft`}
              />
              <Legend 
                verticalAlign="middle" 
                align="right" 
                layout="vertical"
                iconType="circle"
                wrapperStyle={{ paddingLeft: '20px' }}
                formatter={(value, entry: any) => (
                    <span className="text-slate-600 dark:text-slate-300 text-xs font-bold ml-2">{value}</span>
                )}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}