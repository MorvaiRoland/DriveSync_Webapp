'use client'

import { useState, useMemo } from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts'
import { 
  TrendingUp, TrendingDown, AlertCircle, Target, Fuel, Wrench, 
  DollarSign, Calendar, Info, ChevronDown, Plus, Settings, Download
} from 'lucide-react'

const COLORS = {
  fuel: '#f59e0b',        // Amber
  service: '#3b82f6',     // Blue
  insurance: '#8b5cf6',   // Violet
  maintenance: '#10b981', // Emerald
  parking: '#ec4899',     // Pink
  other: '#6b7280',       // Gray
  warning: '#ef4444',     // Red
  success: '#22c55e'      // Green
}

const COST_CATEGORIES = {
  fuel: { label: 'Tankolás', icon: '⛽', color: COLORS.fuel },
  service: { label: 'Szerviz', icon: '🔧', color: COLORS.service },
  insurance: { label: 'Biztosítás', icon: '🛡️', color: COLORS.insurance },
  maintenance: { label: 'Karbantartás', icon: '🔩', color: COLORS.maintenance },
  parking: { label: 'Parkolás', icon: '🅿️', color: COLORS.parking },
  other: { label: 'Egyéb', icon: '📌', color: COLORS.other }
}

interface CostAnalyticsProps {
  events: any[]
  cars: any[]
}

export default function CostAnalyticsDashboard({ events, cars }: CostAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('year')
  const [selectedCar, setSelectedCar] = useState<string | 'all'>('all')
  const [budgetMode, setBudgetMode] = useState(false)
  const [budgetData, setBudgetData] = useState<Record<string, number>>({
    fuel: 50000,
    service: 30000,
    insurance: 0,
    maintenance: 10000,
    parking: 5000,
    other: 5000
  })

  // --- ADATFELDOLGOZÁS ---
  const processedData = useMemo(() => {
    let filteredEvents = [...events]

    // Szűrés autó alapján
    if (selectedCar !== 'all') {
      filteredEvents = filteredEvents.filter((e) => e.car_id === parseInt(selectedCar))
    }

    // Szűrés időtartomány alapján
    const now = new Date()
    let dateFrom = new Date()
    
    switch (timeRange) {
      case 'month':
        dateFrom.setMonth(dateFrom.getMonth() - 1)
        break
      case 'quarter':
        dateFrom.setMonth(dateFrom.getMonth() - 3)
        break
      case 'year':
        dateFrom.setFullYear(dateFrom.getFullYear() - 1)
        break
      case 'all':
        dateFrom = new Date(0)
        break
    }

    filteredEvents = filteredEvents.filter((e) => new Date(e.event_date) >= dateFrom)

    // --- Kategorizálás (az event típusa alapján + custom kategóriák) ---
    const categorizedEvents = filteredEvents.map((e) => {
      let category = e.type === 'fuel' ? 'fuel' : e.type === 'service' ? 'service' : 'other'
      
      // Ha notes-ban van kulcsszó, akkor felülbírálunk
      const notes = e.notes?.toLowerCase() || ''
      if (notes.includes('biztosítás') || notes.includes('insurance')) category = 'insurance'
      else if (notes.includes('szerviz') || notes.includes('service')) category = 'service'
      else if (notes.includes('karbantartás') || notes.includes('maintenance')) category = 'maintenance'
      else if (notes.includes('parkolás') || notes.includes('parking')) category = 'parking'

      return { ...e, category }
    })

    // --- Havi adatok (grafikon)
    const monthlyMap: Record<string, any> = {}
    const categoryTotals: Record<string, number> = {}
    const categoryTrendMap: Record<string, Record<string, number>> = {}

    Object.keys(COST_CATEGORIES).forEach((cat) => {
      categoryTotals[cat] = 0
      categoryTrendMap[cat] = {}
    })

    categorizedEvents.forEach((e) => {
      const date = new Date(e.event_date)
      const monthKey = date.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' })

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { date: monthKey, total: 0 }
        Object.keys(COST_CATEGORIES).forEach((cat) => {
          monthlyMap[monthKey][cat] = 0
        })
      }

      const cost = e.cost || 0
      monthlyMap[monthKey][e.category] += cost
      monthlyMap[monthKey].total += cost
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + cost

      if (!categoryTrendMap[e.category][monthKey]) {
        categoryTrendMap[e.category][monthKey] = 0
      }
      categoryTrendMap[e.category][monthKey] += cost
    })

    const monthlyData = Object.values(monthlyMap).slice(-30) // Utolsó 30 pont

    // --- Kategória eloszlás
    const distributionData = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: COST_CATEGORIES[key as keyof typeof COST_CATEGORIES].label,
        value: value,
        color: COST_CATEGORIES[key as keyof typeof COST_CATEGORIES].color,
        key: key
      }))

    // --- Statisztikák
    const totalCost = Object.values(categoryTotals).reduce((a, b) => a + b, 0)
    const avgMonthly = timeRange === 'month' ? totalCost : totalCost / (timeRange === 'quarter' ? 3 : timeRange === 'year' ? 12 : 1)
    const avgPerCar = cars.length > 0 ? totalCost / cars.length : 0

    // --- Budget vs Actual
    const budgetComparison = Object.entries(budgetData).map(([key, budget]) => ({
      category: COST_CATEGORIES[key as keyof typeof COST_CATEGORIES]?.label || key,
      budget: budget,
      actual: categoryTotals[key] || 0,
      key: key
    }))

    return {
      monthlyData,
      distributionData,
      categoryTotals,
      totalCost,
      avgMonthly,
      avgPerCar,
      budgetComparison,
      filteredEventCount: filteredEvents.length
    }
  }, [events, cars, timeRange, selectedCar, budgetData])

  // --- CUSTOM TOOLTIP ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-slate-300 font-bold text-xs mb-2">{label}</p>
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 text-xs">{entry.name}:</span>
              <span className="text-white font-mono font-bold ml-auto">{(entry.value || 0).toLocaleString()} Ft</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{value.toLocaleString()} Ft</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(trend)}% {trend >= 0 ? 'nőtt' : 'csökkent'}
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
        <DollarSign className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Nincs költségadat. Kezdj hozzá esemény rögzítésével!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* --- FEJLÉC ÉS VEZÉRLŐK --- */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <DollarSign className="text-white" />
              </div>
              Költség Analitika
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {processedData.filteredEventCount} esemény • {processedData.totalCost.toLocaleString()} Ft összesen
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeRange === 'month' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
              1H
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeRange === 'quarter' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
              3H
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeRange === 'year' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
              1É
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeRange === 'all' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
              Összes
            </button>
          </div>
        </div>

        {/* Autó szűrő és Budget mód */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2 block">Szűrés autó szerint</label>
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Összes autó</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.make} {car.model} ({car.plate})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setBudgetMode(!budgetMode)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${budgetMode ? 'bg-violet-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
              <Target size={16} />
              Költségvetés
            </button>
          </div>
        </div>
      </div>

      {/* --- STATISZTIKA KÁRTYÁK --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Összes költség"
          value={processedData.totalCost}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          icon={Calendar}
          label={timeRange === 'month' ? 'Ez a hónap' : timeRange === 'quarter' ? 'Ez a negyed' : 'Átlag havonta'}
          value={processedData.avgMonthly}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Autónként átlag"
          value={processedData.avgPerCar}
          color="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          icon={Fuel}
          label="Tankolásra fordítva"
          value={processedData.categoryTotals['fuel'] || 0}
          color="bg-gradient-to-br from-yellow-500 to-amber-600"
        />
      </div>

      {/* --- KÖLTSÉGTRENDEK GRAFIKON --- */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-amber-500" />
          Költségtrendek
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={processedData.monthlyData}>
            <defs>
              <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.fuel} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.fuel} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.service} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.service} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.other} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.other} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="fuel" stackId="1" stroke={COLORS.fuel} fill="url(#colorFuel)" name="Tankolás" />
            <Area type="monotone" dataKey="service" stackId="1" stroke={COLORS.service} fill="url(#colorService)" name="Szerviz" />
            <Area type="monotone" dataKey="other" stackId="1" stroke={COLORS.other} fill="url(#colorOther)" name="Egyéb" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* --- KATEGÓRIA ELOSZLÁS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pite grafikon */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-black text-slate-900 dark:text-white mb-4">Költségek megoszlása</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processedData.distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData.distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>

          {/* Kategória lista */}
          <div className="mt-6 space-y-2">
            {processedData.distributionData.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{item.value.toLocaleString()} Ft</span>
              </div>
            ))}
          </div>
        </div>

        {/* Költségvetés vs Tényleges (ha aktív) */}
        {budgetMode && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-violet-500" />
              Költségvetés vs Tényleges
            </h3>

            {/* --- KÖLTSÉGVETÉS SZERKESZTÉS --- */}
            <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-700">
              <p className="text-sm font-bold text-violet-900 dark:text-violet-200 mb-4">📝 Költségvetés szerkesztése</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(budgetData).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      {COST_CATEGORIES[key as keyof typeof COST_CATEGORIES]?.label || key}
                    </label>
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-lg border border-violet-300 dark:border-violet-600 overflow-hidden">
                      <span className="px-2 text-slate-400 text-xs font-bold">Ft</span>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setBudgetData({ ...budgetData, [key]: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="flex-1 px-2 py-2 bg-transparent text-slate-900 dark:text-white font-mono text-sm outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Költségvetés vs Tényleges Grafikon */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.budgetComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="category" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="budget" fill={COLORS.success} name="Költségvetés" />
                <Bar dataKey="actual" fill={COLORS.warning} name="Tényleges" />
              </BarChart>
            </ResponsiveContainer>

            {/* Budget status lista */}
            <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
              {processedData.budgetComparison.map((item) => {
                const isOver = item.actual > item.budget
                return (
                  <div key={item.key} className={`p-3 rounded-lg border ${isOver ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white">{item.category}</span>
                      <span className={`font-bold text-sm ${isOver ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isOver ? '📈' : '✓'} {Math.abs(item.actual - item.budget).toLocaleString()} Ft
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{item.actual.toLocaleString()} / {item.budget.toLocaleString()} Ft</span>
                      <span>{((item.actual / item.budget) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((item.actual / item.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Figyelmeztetések */}
        {!budgetMode && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Figyelmeztetések & Tippek
            </h3>
            <div className="space-y-3">
              {processedData.categoryTotals['fuel'] > 100000 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    💡 Magas tankolási költség ({(processedData.categoryTotals['fuel'] || 0).toLocaleString()} Ft)
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">Ellenőrizd az autó fogyasztását és a vezetési szokásaidat.</p>
                </div>
              )}
              {processedData.categoryTotals['service'] > 50000 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                    🔧 Magas szerviz költség ({(processedData.categoryTotals['service'] || 0).toLocaleString()} Ft)
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-300 mt-1">Időben tervezzük a karbantartást a nagyobb költségek elkerülésére.</p>
                </div>
              )}
              {processedData.avgMonthly > 50000 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    📊 Magas havi költség ({processedData.avgMonthly.toLocaleString()} Ft)
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">Fontold meg költségvetést beállítani a kontrollabb működéshez.</p>
                </div>
              )}
              {processedData.categoryTotals['fuel'] > 0 && processedData.categoryTotals['service'] > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 rounded-lg">
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                    ✅ Jó: Rendszeres szerviz és tankolás adatok
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">Folytatsd az adatok naplózását - így tudunk jobb előrejelzéseket csinálni.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
