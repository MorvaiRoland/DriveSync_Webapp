import { 
  Fuel, Zap, TrendingUp, TrendingDown, 
  Droplet, MapPin, Calendar, ArrowRight, Gauge 
} from 'lucide-react';

export default function FuelTrackerCard({ events, isElectric, carMileage }: { events: any[], isElectric: boolean, carMileage: number }) {
  // --- ADATFELDOLGOZÁS ---
  // 1. Csak az üzemanyag események kellenek, kilométer szerint rendezve
  const fuelEvents = events
    .filter(e => e.type === 'fuel' && e.mileage && e.liters)
    .sort((a, b) => a.mileage - b.mileage);

  // 2. Statisztikák számolása
  let totalLiters = 0;
  let totalCost = 0;
  let weightedConsumption = 0;
  let lastConsumption = 0;
  let lastPricePerUnit = 0;
  let lastDistance = 0;

  // Részletes lista generálása (delta számításokkal)
  const history = [];

  for (let i = 0; i < fuelEvents.length; i++) {
    const current = fuelEvents[i];
    const next = fuelEvents[i + 1]; // A következő tankolás (időben későbbi)

    totalLiters += current.liters || 0;
    totalCost += current.cost || 0;

    // Ha van következő tankolás, ki tudjuk számolni a fogyasztást ezen a tankon
    // (Feltételezzük a teli tank módszert: a KÖVETKEZŐ tankolásnál látjuk, mennyit ettünk meg az ELŐZŐ óta)
    // De a te táblázatodban fordított sorrend is lehet, itt most növekvő mileage szerint megyünk.
    // A klasszikus számítás: (Mostani Literek / (Mostani KM - Előző KM)) * 100
    
    let stats = {
      consumption: 0,
      distance: 0,
      pricePerUnit: (current.cost && current.liters) ? Math.round(current.cost / current.liters) : 0,
      isEfficient: false
    };

    if (i > 0) {
      const prev = fuelEvents[i - 1];
      const distance = current.mileage - prev.mileage;
      
      if (distance > 0) {
        // (Betankolt mennyiség / Megtett út) * 100
        const cons = (current.liters / distance) * 100;
        stats.consumption = cons;
        stats.distance = distance;
        lastDistance = distance;
        lastConsumption = cons;
      }
    }
    
    history.push({ ...current, ...stats });
  }
  
  // Átlagfogyasztás (Teljes futás / Teljes tankolás - az első tankolás literszáma, mert azzal indultunk)
  // Itt egy egyszerűsített átlagot számolunk a már kiszámolt szakaszokból
  const validSegments = history.filter(h => h.consumption > 0 && h.consumption < 50); // Szűrés irreális adatokra
  const avgCons = validSegments.reduce((sum, h) => sum + h.consumption, 0) / (validSegments.length || 1);
  
  // Utolsó tankolás adatai
  const lastEvent = history[history.length - 1];
  if (lastEvent) lastPricePerUnit = lastEvent.pricePerUnit;

  // Fordított sorrend a megjelenítéshez (legfrissebb felül)
  const displayHistory = [...history].reverse().slice(0, 5); // Csak az utolsó 5

  // --- STÍLUSOK ---
  const unit = isElectric ? 'kWh' : 'L';
  const currency = 'Ft';
  const themeColor = isElectric ? 'text-cyan-500' : 'text-amber-500';
  const bgColor = isElectric ? 'bg-cyan-500' : 'bg-amber-500';
  const lightBg = isElectric ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'bg-amber-50 dark:bg-amber-900/20';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
      {/* HEADER & HERO */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Átlagfogyasztás
            </h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl md:text-5xl font-black tracking-tighter ${themeColor}`}>
                {avgCons > 0 ? avgCons.toFixed(1) : '-'}
              </span>
              <span className="text-slate-400 font-bold text-lg">
                {unit}/100km
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${lightBg} ${themeColor}`}>
            {isElectric ? <Zap className="w-6 h-6" /> : <Fuel className="w-6 h-6" />}
          </div>
        </div>

        {/* SUMMARY GRID */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <SummaryBox 
            label="Legutóbbi Ár" 
            value={`${lastPricePerUnit} ${currency}/${unit}`} 
            subLabel="Egységár"
          />
          <SummaryBox 
            label="Utolsó Táv" 
            value={`${lastDistance} km`} 
            subLabel="Két tankolás közt"
          />
          <SummaryBox 
            label="Összesen" 
            value={`${totalCost.toLocaleString()} ${currency}`} 
            subLabel={`${fuelEvents.length} alkalom`}
          />
        </div>
      </div>

      {/* RECENT HISTORY LIST */}
      <div className="flex-1 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800/50 p-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Legutóbbi tankolások</h4>
        <div className="space-y-2">
          {displayHistory.map((item, idx) => {
            // Hatékonyság vizsgálata az átlaghoz képest
            const isBetter = item.consumption < avgCons;
            const diff = Math.abs(item.consumption - avgCons).toFixed(1);
            
            return (
              <div key={item.id || idx} className="group bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs leading-none ${lightBg} ${themeColor}`}>
                      <span>{new Date(item.event_date).getMonth() + 1}.</span>
                      <span className="text-sm">{new Date(item.event_date).getDate()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title || 'Ismeretlen kút'}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> {item.mileage.toLocaleString()} km</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1"><Droplet className="w-3 h-3"/> {item.liters}{unit}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Jobb oldal: Fogyasztás az adott tankra */}
                  <div className="text-right">
                     {item.consumption > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                            {item.consumption.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">{unit}/100</span>
                          </span>
                          {/* Kis badge, hogy jobb vagy rosszabb volt-e az átlagnál */}
                          <div className={`text-[10px] font-bold flex items-center gap-0.5 ${isBetter ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isBetter ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                            {diff} {unit}
                          </div>
                        </div>
                     ) : (
                        <span className="text-xs text-slate-400 italic">Első mérés</span>
                     )}
                  </div>
                </div>
                
                {/* Ár sáv */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800/50 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Összeg</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.cost.toLocaleString()} Ft</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Kis segédkomponens a dobozokhoz
function SummaryBox({ label, value, subLabel }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 truncate">{label}</p>
      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate mb-0.5">{value}</p>
      <p className="text-[9px] text-slate-400 truncate opacity-70">{subLabel}</p>
    </div>
  )
}