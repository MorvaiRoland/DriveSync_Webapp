'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Server, Database, Shield, Zap, Activity, Globe, ArrowLeft
} from 'lucide-react';

// --- TÍPUSOK ÉS MOCK ADATOK ---

type Status = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface Service {
  id: string;
  name: string;
  status: Status;
  icon: React.ReactNode;
  uptime: number; // százalék
}

const SERVICES: Service[] = [
  { id: 'web', name: 'Web Alkalmazás', status: 'operational', icon: <Globe size={18} />, uptime: 99.99 },
  { id: 'api', name: 'API Végpontok', status: 'operational', icon: <Server size={18} />, uptime: 99.95 },
  { id: 'db', name: 'Adatbázis (Supabase)', status: 'operational', icon: <Database size={18} />, uptime: 100.00 },
  { id: 'auth', name: 'Hitelesítés', status: 'operational', icon: <Shield size={18} />, uptime: 99.98 },
  { id: 'ai', name: 'AI Szolgáltatások', status: 'degraded', icon: <Zap size={18} />, uptime: 98.50 }, // Példa egy hibára
  { id: 'storage', name: 'Fájltárolás', status: 'operational', icon: <Server size={18} />, uptime: 100.00 },
];

const INCIDENTS = [
  {
    id: 1,
    title: "AI Válaszidő Lassulás",
    status: "Investigating",
    date: "Ma, 14:30",
    description: "Jelenleg lassabb válaszidőket tapasztalunk az AI modulnál. A mérnökök vizsgálják a szolgáltatói API-t.",
    updates: [
        { time: "14:45", msg: "A hiba forrását azonosítottuk (OpenAI latency)." },
        { time: "14:30", msg: "A vizsgálat megkezdődött." }
    ]
  },
  {
    id: 2,
    title: "Tervezett Karbantartás",
    status: "Completed",
    date: "2025. máj. 10.",
    description: "Sikeres adatbázis frissítés és biztonsági patch telepítés.",
    updates: []
  }
];

// --- SEGÉDFÜGGVÉNYEK ---

const getStatusColor = (status: Status) => {
  switch (status) {
    case 'operational': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'degraded': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'outage': return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'maintenance': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  }
};

const getStatusIcon = (status: Status) => {
  switch (status) {
    case 'operational': return <CheckCircle2 className="w-5 h-5" />;
    case 'degraded': return <AlertTriangle className="w-5 h-5" />;
    case 'outage': return <XCircle className="w-5 h-5" />;
    case 'maintenance': return <RefreshCw className="w-5 h-5 animate-spin" />;
  }
};

const getStatusText = (status: Status) => {
    switch (status) {
      case 'operational': return 'Működik';
      case 'degraded': return 'Lassulás';
      case 'outage': return 'Kiesés';
      case 'maintenance': return 'Karbantartás';
    }
  };

// --- KOMPONENS: UPTIME BARS (90 NAP) ---
const UptimeHistory = ({ status }: { status: Status }) => {
    // Generálunk 60 "napot" (csíkot). A legtöbb zöld, random legyen benne hiba, ha a status nem operational
    const bars = Array.from({ length: 60 }).map((_, i) => {
        const isToday = i === 59;
        let color = 'bg-emerald-500';
        
        // Random "múltbeli" hibák generálása a realisztikus hatáshoz
        if (!isToday && Math.random() > 0.98) color = 'bg-amber-500'; 
        if (!isToday && Math.random() > 0.995) color = 'bg-red-500';
        
        // Ha a mai napon baj van
        if (isToday && status !== 'operational') {
             color = status === 'degraded' ? 'bg-amber-500' : status === 'outage' ? 'bg-red-500' : 'bg-blue-500';
        }

        return (
            <div 
                key={i} 
                className={`w-full h-8 rounded-sm ${color} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                title={`Nap ${i + 1} - ${color.includes('emerald') ? '100% Uptime' : 'Incident'}`}
            ></div>
        );
    });

    return (
        <div className="flex gap-[2px] mt-3 items-end h-8">
            {bars}
        </div>
    );
};

// --- FŐ OLDAL ---

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const overallStatus: Status = SERVICES.some(s => s.status === 'outage') ? 'outage' 
                              : SERVICES.some(s => s.status === 'degraded') ? 'degraded' 
                              : SERVICES.some(s => s.status === 'maintenance') ? 'maintenance' 
                              : 'operational';

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-amber-500/30 pb-20">
      
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 relative">
                      <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <span className="font-bold text-white uppercase text-lg hidden sm:block">
                      Drive<span className="text-amber-500">Sync</span> Status
                  </span>
              </div>
           </Link>
           <a href="mailto:support@DynamicSense.hu" className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-slate-700 rounded-lg px-4 py-2 hover:bg-slate-800">
               Hibabejelentés
           </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12">

        {/* --- OVERALL STATUS BANNER --- */}
        <div className={`p-8 rounded-3xl border mb-12 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left transition-all duration-500 relative overflow-hidden ${getStatusColor(overallStatus)}`}>
            {/* Háttér Pulse Effekt */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-current opacity-10 blur-[80px] rounded-full pointer-events-none -mr-16 -mt-16"></div>

            <div className={`p-4 rounded-full bg-slate-950/20 backdrop-blur-sm border border-white/10 shadow-lg`}>
                {overallStatus === 'operational' ? <CheckCircle2 size={48} /> : 
                 overallStatus === 'degraded' ? <AlertTriangle size={48} /> : 
                 overallStatus === 'maintenance' ? <RefreshCw size={48} className="animate-spin" /> : 
                 <XCircle size={48} />}
            </div>
            
            <div className="flex-1 relative z-10">
                <h1 className="text-3xl font-black mb-2 tracking-tight">
                    {overallStatus === 'operational' ? 'Minden rendszer megfelelően működik.' : 
                     overallStatus === 'degraded' ? 'Részleges lassulást tapasztalunk.' :
                     overallStatus === 'maintenance' ? 'Tervezett karbantartás zajlik.' :
                     'Kritikus szolgáltatás kiesés.'}
                </h1>
                <p className="opacity-80 text-sm font-mono flex items-center justify-center sm:justify-start gap-2">
                    <Activity size={14} />
                    Utolsó ellenőrzés: {lastUpdated}
                </p>
            </div>
        </div>

        {/* --- SERVICES GRID --- */}
        <div className="space-y-4 mb-16">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Server size={20} className="text-slate-500" />
                Szolgáltatások állapota
            </h2>

            <div className="grid grid-cols-1 gap-4">
                {SERVICES.map((service) => (
                    <div key={service.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white transition-colors">
                                    {service.icon}
                                </div>
                                <span className="font-bold text-slate-200">{service.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-slate-500 hidden sm:block">{service.uptime}% uptime</span>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(service.status)}`}>
                                    {getStatusIcon(service.status)}
                                    {getStatusText(service.status)}
                                </div>
                            </div>
                        </div>

                        {/* Uptime Visualization */}
                        <div className="w-full">
                            <UptimeHistory status={service.status} />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-mono uppercase tracking-widest">
                                <span>90 napja</span>
                                <span>Ma</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- INCIDENT HISTORY --- */}
        <div className="mb-20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-slate-500" />
                Eseménynapló
            </h2>

            <div className="relative border-l border-slate-800 ml-3 space-y-8 pb-8">
                {INCIDENTS.map((incident, idx) => (
                    <div key={idx} className="relative pl-8 group">
                        {/* Dot */}
                        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${incident.status === 'Investigating' ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}></div>

                        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{incident.title}</h3>
                                    <p className="text-xs text-slate-500 font-mono">{incident.date}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase w-fit ${
                                    incident.status === 'Investigating' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                    {incident.status === 'Investigating' ? 'Vizsgálat alatt' : 'Megoldva'}
                                </span>
                            </div>

                            <p className="text-slate-300 text-sm leading-relaxed mb-4">{incident.description}</p>

                            {incident.updates.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                                    {incident.updates.map((update, i) => (
                                        <div key={i} className="text-xs flex gap-3">
                                            <span className="text-slate-500 font-mono min-w-[50px]">{update.time}</span>
                                            <span className="text-slate-400">{update.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </main>
      
      {/* SIMPLE FOOTER */}
      <footer className="border-t border-slate-900 py-8 text-center text-slate-600 text-xs font-mono uppercase tracking-widest">
         Powered by DynamicSense Monitors • 2025
      </footer>

    </div>
  );
}