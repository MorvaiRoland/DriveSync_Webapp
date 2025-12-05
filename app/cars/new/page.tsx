'use client'

import { useState, useEffect } from 'react'
import { addCar } from '../actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// --- AUTÓ ADATBÁZIS (Márkák és Típusok) ---
const CAR_DATABASE: Record<string, string[]> = {
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "R8", "e-tron"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i3", "i4", "iX"],
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "EQA", "EQC", "EQS"],
  "Volkswagen": ["Golf", "Passat", "Polo", "Tiguan", "Touareg", "Arteon", "T-Roc", "T-Cross", "ID.3", "ID.4", "ID.5", "Touran", "Sharan", "Caddy", "Amarok"],
  "Ford": ["Fiesta", "Focus", "Mondeo", "Kuga", "Puma", "Mustang", "Mustang Mach-E", "Ranger", "S-MAX", "Galaxy", "EcoSport", "Edge"],
  "Toyota": ["Yaris", "Corolla", "Camry", "C-HR", "RAV4", "Highlander", "Land Cruiser", "Hilux", "Prius", "Aygo X", "Supra", "bZ4X"],
  "Honda": ["Civic", "Jazz", "HR-V", "CR-V", "ZR-V", "e", "Accord", "NSX"],
  "Hyundai": ["i10", "i20", "i30", "IONIQ", "IONIQ 5", "IONIQ 6", "Kona", "Tucson", "Santa Fe", "Bayon"],
  "Kia": ["Picanto", "Rio", "Ceed", "XCeed", "Niro", "Sportage", "Sorento", "EV6", "EV9", "Stinger"],
  "Opel": ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Zafira", "Vivaro"],
  "Skoda": ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq iV"],
  "Suzuki": ["Swift", "Ignis", "Vitara", "S-Cross", "Swace", "Across", "Jimny"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40"],
  "Renault": ["Clio", "Megane", "Captur", "Arkana", "Austral", "Espace", "Zoe", "Twingo"],
  "Peugeot": ["208", "308", "408", "508", "2008", "3008", "5008", "Rifter"],
  "Nissan": ["Micra", "Juke", "Qashqai", "X-Trail", "Ariya", "Leaf", "Navara"],
  "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-30", "CX-5", "CX-60", "MX-5", "MX-30"],
  "Fiat": ["500", "500X", "Panda", "Tipo"],
  "Seat": ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
  "Dacia": ["Sandero", "Duster", "Jogger", "Spring"],
  "Lexus": ["UX", "NX", "RX", "RZ", "ES", "LS", "LC"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
  "Jeep": ["Renegade", "Compass", "Wrangler", "Grand Cherokee", "Avenger"]
}

export default function NewCarPage() {
  // URL paraméterek kezelése kliens oldalon
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  // Állapotkezelés a dinamikus listákhoz
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [availableModels, setAvailableModels] = useState<string[]>([])

  // Amikor a márka változik, frissítjük a modelleket
  useEffect(() => {
    if (selectedBrand && CAR_DATABASE[selectedBrand]) {
      setAvailableModels(CAR_DATABASE[selectedBrand])
    } else {
      setAvailableModels([])
    }
  }, [selectedBrand])

  // Évszámok generálása (Idei évtől 1990-ig)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i)

  // Színek
  const colors = [
    "Fehér", "Fekete", "Ezüst / Szürke", "Kék", "Piros", 
    "Zöld", "Barna / Bézs", "Sárga / Arany", "Narancs", "Egyéb"
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Fejléc */}
      <div className="bg-slate-900 pt-10 pb-24 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
            Új Jármű <span className="text-amber-500">Rögzítése</span>
          </h1>
          <p className="mt-2 text-slate-400">Válassz a márkák és típusok adatbázisából.</p>
        </div>
      </div>

      {/* Űrlap Konténer */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          
          <form action={addCar} className="p-8 space-y-8">
            
            {/* Hibaüzenet */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Szekció 1: Alapadatok */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Jármű Azonosítás
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* MÁRKA - Interaktív Lista */}
                <div className="space-y-1">
                  <label htmlFor="make" className="block text-sm font-semibold text-slate-700">
                    Gyártó (Márka) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="make"
                      id="make"
                      required
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="block w-full appearance-none rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all text-slate-700 cursor-pointer"
                    >
                      <option value="" disabled>Válassz márkát...</option>
                      {Object.keys(CAR_DATABASE).sort().map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                      <option value="Egyéb">Egyéb / Nem listázott</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* MODELL - Dinamikus Lista */}
                <div className="space-y-1">
                  <label htmlFor="model" className="block text-sm font-semibold text-slate-700">
                    Modell (Típus) <span className="text-amber-500">*</span>
                  </label>
                  
                  {selectedBrand === "Egyéb" || selectedBrand === "" && availableModels.length === 0 ? (
                    // Ha "Egyéb" vagy nincs kiválasztva, akkor szöveges mező (vagy disabled)
                    <input
                      type="text"
                      name="model"
                      id="model"
                      required
                      placeholder={selectedBrand === "" ? "Először válassz márkát!" : "Írd be a típust"}
                      disabled={selectedBrand === ""}
                      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  ) : (
                    // Ha van kiválasztott márka, akkor legördülő lista
                    <div className="relative">
                      <select
                        name="model"
                        id="model"
                        required
                        className="block w-full appearance-none rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all text-slate-700 cursor-pointer"
                      >
                        <option value="" disabled selected>Válassz típust...</option>
                        {availableModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                        <option value="Egyéb">Egyéb / Nincs a listában</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                         <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  )}
                </div>
                
                <InputGroup label="Rendszám" name="plate" placeholder="AA-BB-123" required uppercase />
                <InputGroup label="Alvázszám (VIN)" name="vin" placeholder="Opcionális" uppercase />
              </div>
            </div>

            {/* Szekció 2: Részletek */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Műszaki Adatok
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* ÉVJÁRAT - LISTA */}
                <SelectGroup label="Évjárat" name="year" required>
                  <option value="" disabled selected>Válassz...</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </SelectGroup>

                <InputGroup label="Km óra állás" name="mileage" type="number" placeholder="pl. 154000" required />
                
                {/* ÜZEMANYAG - LISTA */}
                <SelectGroup label="Üzemanyag" name="fuel_type" required>
                    <option value="diesel">Dízel</option>
                    <option value="petrol">Benzin</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Elektromos</option>
                    <option value="lpg">LPG / Gáz</option>
                </SelectGroup>

                {/* SZÍN - LISTA */}
                <SelectGroup label="Szín" name="color">
                   <option value="" disabled selected>Válassz színt...</option>
                   {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </SelectGroup>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700">Státusz</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                         <input type="radio" name="status" value="active" defaultChecked className="peer sr-only" />
                         <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all"></div>
                      </div>
                      <span className="text-slate-700 group-hover:text-amber-600 transition-colors">Aktív (Használatban)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                         <input type="radio" name="status" value="service" className="peer sr-only" />
                         <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all"></div>
                      </div>
                      <span className="text-slate-700 group-hover:text-amber-600 transition-colors">Szerviz alatt</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Gombok */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
              <Link href="/" className="px-6 py-3 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors">
                Mégse
              </Link>
              <button type="submit" className="px-8 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 hover:shadow-xl transition-all transform active:scale-[0.98]">
                Mentés a Garázsba
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// --- Segéd Komponensek ---

function InputGroup({ label, name, type = "text", placeholder, required = false, uppercase = false }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        required={required}
        placeholder={placeholder}
        className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all ${uppercase ? 'uppercase placeholder:normal-case' : ''}`}
      />
    </div>
  )
}

// Select komponens nyíllal
function SelectGroup({ label, name, children, required = false }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          id={name}
          required={required}
          className="block w-full appearance-none rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all text-slate-700 cursor-pointer"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  )
}