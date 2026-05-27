'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  Wallet, Zap, Car, Wrench, Fuel, ArrowRight, Activity, Gauge,
  Download, CalendarClock, AlertCircle, ChevronDown
} from 'lucide-react'
import { motion } from 'framer-motion'

// ──────────────────────────────────────────
// CONFIGURATION & TYPES
// ──────────────────────────────────────────
type TimeRange = '30_days' | '90_days' | 'year' | 'ytd' | 'all'
type CategoryKey = 'fuel' | 'service' | 'insurance' | 'maintenance' | 'parking' | 'tax' | 'other'

const COLORS: Record<CategoryKey, string> = {
  fuel: '#3b82f6',       // Blue-500
  service: '#ef4444',    // Red-500
  insurance: '#8b5cf6',  // Violet-500
  maintenance: '#f59e0b',// Amber-500
  parking: '#10b981',    // Emerald-500
  tax: '#64748b',        // Slate-500
  other: '#94a3b8'       // Slate-400
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', tax: 'Adó/Illeték', other: 'Egyéb'
}

const formatHUF = (val: number) =>
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val)

const formatNumber = (val: number) =>
  new Intl.NumberFormat('hu-HU').format(val)

// Glass container helper
function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.04]
      border border-white/70 dark:border-white/[0.08]
      backdrop-blur-xl shadow-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

export default function CostAnalyticsDashboard({ events, cars }: { events: any[]; cars: any[] }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('year')
  const [selectedCar, setSelectedCar] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // ──────────────────────────────────────────
  // ANALYTICS ENGINE
  // ──────────────────────────────────────────
  const analytics = useMemo(() => {
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case '30_days': startDate.setDate(now.getDate() - 30); break
      case '90_days': startDate.setDate(now.getDate() - 90); break
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break
      case 'ytd': startDate = new Date(now.getFullYear(), 0, 1); break
      case 'all': startDate = new Date(1970, 0, 1); break
    }

    const filteredEvents = events
      .filter(e => {
        const eDate = new Date(e.event_date)
        const carMatch = selectedCar === 'all' || e.car_id === Number(selectedCar)
        return carMatch && eDate >= startDate && eDate <= now
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

    let totalCost = 0
    const catTotals: Record<string, number> = {}
    const monthlyData: Record<string, any> = {}
    let fuelLiters = 0
    let minOdo = Infinity
    let maxOdo = 0
    let lastServiceOdo = 0

    filteredEvents.forEach(e => {
      const cost = Number(e.cost) || 0
      const type = (e.type || 'other').toLowerCase()

      let cat: CategoryKey = 'other'
      const title = (e.title || '').toLowerCase()
      if (type === 'fuel' || title.includes('tank')) cat = 'fuel'
      else if (type === 'service' || title.includes('szerviz') || title.includes('olaj')) cat = 'service'
      else if (title.includes('biztosítás') || title.includes('kgfb')) cat = 'insurance'
      else if (title.includes('parkolás')) cat = 'parking'
      else if (title.includes('adó') || title.includes('súlyadó')) cat = 'tax'
      else if (title.includes('mosás') || title.includes('karbantartás')) cat = 'maintenance'

      totalCost += cost
      catTotals[cat] = (catTotals[cat] || 0) + cost

      const odo = Number(e.mileage) || 0
      if (odo > 0) {
        if (odo < minOdo) minOdo = odo
        if (odo > maxOdo) maxOdo = odo
        if (cat === 'service' && odo > lastServiceOdo) lastServiceOdo = odo
      }

      if (cat === 'fuel') fuelLiters += e.volume ? Number(e.volume) : (cost / 620)

      // Monthly grouping
      const dateKey = new Date(e.event_date).toLocaleDateString('hu-HU', { year: '2-digit', month: 'short' })
      const sortKey = new Date(e.event_date).toISOString().slice(0, 7)

      if (!monthlyData[sortKey]) monthlyData[sortKey] = { name: dateKey, iso: sortKey, total: 0, fuel: 0, service: 0, odo: 0 }
      monthlyData[sortKey].total += cost
      if (['fuel', 'service'].includes(cat)) monthlyData[sortKey][cat] += cost
      if (odo > monthlyData[sortKey].odo) monthlyData[sortKey].odo = odo
    })

    const kmDriven = (maxOdo > minOdo && minOdo !== Infinity) ? maxOdo - minOdo : 0
    const costPerKm = kmDriven > 0 ? totalCost / kmDriven : 0
    const avgConsumption = (kmDriven > 0 && fuelLiters > 0) ? (fuelLiters / kmDriven) * 100 : 0
    const kmSinceService = maxOdo - lastServiceOdo

    // Projected
    const daysInPeriod = Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const projectedAnnualCost = (totalCost / daysInPeriod) * 365
    const projectedAnnualKm = (kmDriven / daysInPeriod) * 365

    // Chart dataset
    const chartData = Object.keys(monthlyData).sort().map((key, index, keys) => {
      const d = monthlyData[key]
      const prevKey = keys[index - 1]
      const prevOdo = prevKey ? monthlyData[prevKey].odo : minOdo
      const monthKm = d.odo > prevOdo ? d.odo - prevOdo : 0
      const efficiency = monthKm > 50 ? Math.round(d.total / monthKm) : 0
      return { ...d, efficiency: efficiency > 600 ? 600 : efficiency }
    })

    const pieData = Object.keys(catTotals)
      .map(k => ({ name: CATEGORY_LABELS[k as CategoryKey], value: catTotals[k], color: COLORS[k as CategoryKey] }))
      .filter(i => i.value > 0)
      .sort((a, b) => b.value - a.value)

    return {
      totalCost, kmDriven, costPerKm, avgConsumption, kmSinceService,
      projectedAnnualCost, projectedAnnualKm,
      chartData, pieData,
      topCategory: pieData.length > 0 ? pieData[0] : null,
      recentEvents: filteredEvents.slice().reverse().slice(0, 10),
      filteredEvents
    }
  }, [events, selectedCar, timeRange])

  // ──────────────────────────────────────────
  // EXPORT ENGINE
  // ──────────────────────────────────────────
  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      const headers = ['Dátum', 'Autó ID', 'Típus', 'Leírás', 'Km óra', 'Összeg (Ft)']
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
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dynamicsense_export_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      setIsExporting(false)
    }, 500)
  }

  const serviceHealth = Math.max(0, 100 - (analytics.kmSinceService / 15000) * 100)

  return (
    <div className="space-y-6">

      {/* ── FILTER SECTION BAR ── */}
      <Glass className="rounded-2xl p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/30 flex-shrink-0">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">
              Szűrők & Paraméterek
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">
              {loading ? 'Adatok betöltése...' : 'Elemzés készen áll'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Car selector */}
          <div className="relative flex-1 sm:flex-initial min-w-[140px]">
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl text-xs font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer transition-colors
                bg-white/80 dark:bg-white/5
                border border-slate-200 dark:border-white/10
                text-slate-700 dark:text-slate-200
                focus:border-indigo-400 dark:focus:border-indigo-500"
            >
              <option value="all">Összes Autó</option>
              {cars.map(c => <option key={c.id} value={c.id}>{c.plate} ({c.make})</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/40 dark:border-white/5 whitespace-nowrap">
            {[{ id: '30_days', label: '30 nap' }, { id: 'year', label: '1 év' }, { id: 'all', label: 'Mind' }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id as TimeRange)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  timeRange === tab.id
                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50
              bg-slate-900 dark:bg-white text-white dark:text-slate-900
              hover:bg-slate-800 dark:hover:bg-slate-100"
          >
            {isExporting ? 'Export...' : <><Download className="w-3.5 h-3.5" /> CSV</>}
          </button>
        </div>
      </Glass>

      {/* ── METRICS DETAILS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Cost summary */}
        <Glass className="rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Kiadások</span>
            <Wallet className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatNumber(analytics.totalCost)} <span className="text-xs font-normal text-slate-400">Ft</span>
          </h3>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              Várható éves: <span className="text-slate-700 dark:text-slate-300 font-mono">{formatNumber(Math.round(analytics.projectedAnnualCost))} Ft</span>
            </p>
          </div>
        </Glass>

        {/* 2. Fuel efficiency */}
        <Glass className="rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Hatékonyság</span>
            <Gauge className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {analytics.costPerKm.toFixed(0)} <span className="text-xs font-normal text-slate-400">Ft/km</span>
          </h3>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${analytics.costPerKm < 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {analytics.costPerKm < 60 ? 'Optimális szint' : 'Magasabb kiadások'}
            </p>
          </div>
        </Glass>

        {/* 3. Fuel Volume */}
        <Glass className="rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Fogyasztás</span>
            <Fuel className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {analytics.avgConsumption > 0 ? analytics.avgConsumption.toFixed(1) : '-'} <span className="text-xs font-normal text-slate-400">L/100 km</span>
          </h3>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              Futásteljesítmény: <span className="text-slate-700 dark:text-slate-300 font-mono">{analytics.kmDriven.toLocaleString()} km</span>
            </p>
          </div>
        </Glass>

        {/* 4. Maintenance / Service progress */}
        <Glass className="rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${serviceHealth > 50 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
              Szerviz életút
            </span>
            <Wrench className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xl font-bold text-slate-900 dark:text-white">{analytics.kmSinceService.toLocaleString()} km</span>
            <span className="text-[8px] font-bold uppercase text-slate-400">eltelt</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${serviceHealth > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, (analytics.kmSinceService / 15000) * 100)}%` }}
            />
          </div>
        </Glass>
      </div>

      {/* ── MAIN ANALYSIS GRAPHS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart (span 2) */}
        <Glass className="lg:col-span-2 rounded-2xl p-5 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Költség & Hatékonyság Trend</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Költések havi lebontásban vs. km költség</p>
            </div>

            <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" /> Költés</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-rose-500 rounded-full" /> Hatékonyság</div>
            </div>
          </div>

          <div className="h-[280px] sm:h-[340px] w-full">
            {analytics.chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">Nincs elég adat a grafikonhoz.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.chartData} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.06} stroke="currentColor" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                    dy={8}
                    minTickGap={25}
                  />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.03 }} />
                  <Bar yAxisId="left" dataKey="total" fill="url(#colorBar)" stroke="#6366f1" strokeWidth={1} radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#f43f5e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </Glass>

        {/* Sidebar categories & AI tips */}
        <div className="flex flex-col gap-6">
          {/* Categories card */}
          <Glass className="rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5">Kategóriák Megoszlása</h3>
            {analytics.pieData.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400 italic">Nincs tranzakció.</p>
            ) : (
              <>
                <div className="flex items-center justify-center h-[140px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.pieData}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={60}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {analytics.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {analytics.pieData.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-500 dark:text-slate-400">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 dark:text-slate-500 font-mono font-normal">{formatNumber(item.value)} Ft</span>
                        <span className="text-slate-900 dark:text-white font-mono">{((item.value / analytics.totalCost) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Glass>

          {/* AI tip summary */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 dark:border-indigo-500/20 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold uppercase tracking-widest mb-3">
                <Zap className="w-3.5 h-3.5 fill-current" /> AI Insights
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                A flotta legnagyobb költségforrása a(z) <span className="font-bold text-indigo-600 dark:text-indigo-400">{analytics.topCategory?.name || 'Egyéb'}</span>, ami a teljes büdzsé <span className="font-bold">{analytics.topCategory ? ((analytics.topCategory.value / analytics.totalCost) * 100).toFixed(0) : 0}%-át</span> teszi ki.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRANSACTIONS LIST TABLE ── */}
      <Glass className="rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100/60 dark:border-white/[0.06] flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tranzakció Napló</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">A legutóbbi 10 tétel</p>
          </div>
          <button
            onClick={handleExport}
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all
              text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:scale-105"
          >
            Exportálás
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100/60 dark:border-white/[0.06]">
              <tr>
                <th className="px-5 py-3">Dátum</th>
                <th className="px-5 py-3">Kategória</th>
                <th className="px-5 py-3">Megnevezés</th>
                <th className="px-5 py-3 text-center">Kilométer</th>
                <th className="px-5 py-3 text-right">Összeg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 dark:divide-white/[0.04]">
              {analytics.recentEvents.map((event: any, idx: number) => {
                const typeKey = (event.type || 'other').toLowerCase() as CategoryKey
                return (
                  <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {new Date(event.event_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border"
                        style={{
                          backgroundColor: (COLORS[typeKey] || COLORS.other) + '15',
                          color: COLORS[typeKey] || COLORS.other,
                          borderColor: (COLORS[typeKey] || COLORS.other) + '30'
                        }}
                      >
                        {CATEGORY_LABELS[typeKey] || event.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{event.title || '-'}</td>
                    <td className="px-5 py-4 text-center font-mono text-slate-500 dark:text-slate-400">
                      {event.mileage ? `${Number(event.mileage).toLocaleString()} km` : '-'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                      {formatHUF(Number(event.cost))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {analytics.recentEvents.length === 0 && (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold text-xs">Nincs adat</h4>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">Válassz másik szűrést vagy rögzíts új kiadást a garázsodban.</p>
            </div>
          )}
        </div>
      </Glass>
    </div>
  )
}

// ──────────────────────────────────────────
// CUSTOM CHART TOOLTIP
// ──────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const total = payload.find((p: any) => p.dataKey === 'total')
    const eff = payload.find((p: any) => p.dataKey === 'efficiency')

    return (
      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 text-[10px] min-w-[150px]">
        <p className="font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-white/5 pb-1">{label}</p>
        <div className="space-y-1.5 font-bold">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Költés:</span>
            <span className="text-slate-900 dark:text-white">{formatHUF(total?.value || 0)}</span>
          </div>
          {eff && eff.value > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Hatékonyság:</span>
              <span className="text-rose-500">{eff.value} Ft/km</span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}