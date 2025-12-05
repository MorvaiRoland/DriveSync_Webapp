import { addCar } from '../actions'
import Link from 'next/link'

export default async function NewCarPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const error = searchParams.error

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Fejléc */}
      <div className="bg-slate-900 pt-10 pb-24 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
            Új Jármű <span className="text-amber-500">Rögzítése</span>
          </h1>
          <p className="mt-2 text-slate-400">Add hozzá a garázsodhoz az új családtagot.</p>
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
                <InputGroup label="Gyártó (Márka)" name="make" placeholder="pl. BMW" required />
                <InputGroup label="Modell (Típus)" name="model" placeholder="pl. 320d" required />
                <InputGroup label="Rendszám" name="plate" placeholder="AA-BB-123" required uppercase />
                <InputGroup label="Alvázszám (VIN)" name="vin" placeholder="Opcionális" />
              </div>
            </div>

            {/* Szekció 2: Részletek */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Műszaki Adatok
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup label="Évjárat" name="year" type="number" placeholder="2020" required />
                <InputGroup label="Km óra állás" name="mileage" type="number" placeholder="150000" required />
                
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">Üzemanyag</label>
                  <select name="fuel_type" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 bg-slate-50 border px-3">
                    <option value="diesel">Dízel</option>
                    <option value="petrol">Benzin</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Elektromos</option>
                  </select>
                </div>

                <InputGroup label="Szín" name="color" placeholder="pl. Fekete" />
                
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700">Státusz</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="active" defaultChecked className="text-amber-500 focus:ring-amber-500" />
                      <span className="text-slate-700">Aktív (Használatban)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="service" className="text-amber-500 focus:ring-amber-500" />
                      <span className="text-slate-700">Szerviz alatt</span>
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

// Segéd komponens az inputokhoz
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
        className={`block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-all ${uppercase ? 'uppercase' : ''}`}
      />
    </div>
  )
}