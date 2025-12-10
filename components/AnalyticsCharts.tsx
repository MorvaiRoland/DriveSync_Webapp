'use client'

import { useMemo } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts'
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react'

// Színek a grafikonhoz
const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1'] // Amber, Blue, Emerald, Indigo

export default function AnalyticsCharts({ events }: { events: any[] }) {
  
  // --- 1. ADATELŐKÉSZÍTÉS ---
  
  // A. Fogyasztás Trend (Csak tankolások, ahol van liter és km)
  const consumptionData = useMemo(() => {
    const fuelEvents = events
      .filter(e => e.type === 'fuel' && e.mileage && e.liters)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

    // Fogyasztás számítás két tankolás között
    const data = []
    for (let i = 1; i < fuelEvents.length; i++) {
      const prev = fuelEvents[i-1]
      const curr = fuelEvents[i]
      const dist = curr.mileage - prev.mileage
      
      // Csak reális adatok (pl. nem 0 km, nem teli tankolás hiba)
      if (dist > 0) {
        const consumption = (curr.liters / dist) * 100
        data.push({
          date: new Date(curr.event_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
          value: parseFloat(consumption.toFixed(1))
        })
      }
    }
    // Utolsó 10 tankolás, hogy ne legyen zsúfolt
    return data.slice(-10)
  }, [events])

  // B. Költség Megoszlás (Kategóriák szerint)
  const costDistribution = useMemo(() => {
    const categories: Record<string, number> = {
      'fuel': 0, 'service': 0, 'insurance': 0, 'other': 0
    }
    
    events.forEach(e => {
      const type = categories[e.type] !== undefined ? e.type : 'other'
      categories[type] += (e.cost || 0)
    })

    return [
      { name: 'Üzemanyag', value: categories.fuel, color: COLORS[0] },
      { name: 'Szerviz', value: categories.service, color: COLORS[1] },
      { name: 'Biztosítás', value: categories.insurance, color: COLORS[3] }, // Ha lenne ilyen típus
      { name: 'Egyéb', value: categories.other, color: COLORS[2] },
    ].filter(item => item.value > 0)
  }, [events])

  // --- RENDER ---

  if (events.length < 2) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-500 font-bold">Nincs elég adat a grafikonokhoz</h3>
            <p className="text-sm text-slate-400">Rögzíts legalább két tankolást!</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. KÁRTYA: FOGYASZTÁS TREND */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Fogyasztás Trend (l/100km)
            </h3>
        </div>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consumptionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 2. KÁRTYA: KÖLTSÉG MEGOSZLÁS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-blue-500" />
                Költség Megoszlás
            </h3>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={costDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {costDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                         formatter={(value: number) => `${value.toLocaleString()} Ft`}
                         contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
        {/* Jelmagyarázat */}
        <div className="flex justify-center gap-4 flex-wrap mt-2">
            {costDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    {entry.name}
                </div>
            ))}
        </div>
      </div>

    </div>
  )
}