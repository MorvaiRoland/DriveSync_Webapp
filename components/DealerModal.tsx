// components/DealerModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Bővített, kategóriákra bontott extralista
const FEATURES_CATEGORIES = {
    'Biztonság': [
        'ABS (blokkolásgátló)', 'ASR (kipörgésgátló)', 'ESP (menetstabilizátor)', 
        'Légzsák (Vezető/Utas)', 'Oldallégzsák', 'Függönylégzsák', 'ISOFIX', 
        'Guminyomás-ellenőrző', 'Sávtartó rendszer', 'Holttér-figyelő', 
        'Tábla-felismerő', 'Vészfék asszisztens', 'Fáradtságérzékelő'
    ],
    'Kényelem': [
        'Klíma (Manuális)', 'Klíma (Automata)', 'Klíma (Digitális)', 
        'Tempomat', 'Adaptív tempomat', 'Ülésfűtés', 'Ülésszellőztetés',
        'Kormányfűtés', 'Kulcsnélküli nyitás/indítás', 'Start-Stop',
        'Elektromos ablak', 'Elektromos tükör', 'Elektromos csomagtérajtó'
    ],
    'Multimédia & Navigáció': [
        'Navigáció (GPS)', 'Bluetooth kihangosító', 'Android Auto', 
        'Apple CarPlay', 'USB csatlakozó', 'Hi-Fi rendszer', 
        'Érintőkijelző', 'Digitális műszerfal', 'HUD (Head-Up Display)'
    ],
    'Külső & Világítás': [
        'Könnyűfém felni', 'Metálfény', 'LED fényszóró', 'Mátrix LED', 
        'Xenon fényszóró', 'Kanyarkövető fényszóró', 'Ködlámpa', 
        'Esőszenzor', 'Tolatóradar', 'Tolatókamera', '360° kamera', 
        'Vonóhorog', 'Tetősín', 'Panorámatető'
    ]
}

export default function DealerModal({ car, onClose }: { car: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
      car.features ? [...car.features] : []
  )
  const [customFeature, setCustomFeature] = useState('')

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const toggleFeature = (feat: string) => {
      setSelectedFeatures(prev => {
          if (prev.includes(feat)) {
              return prev.filter(f => f !== feat)
          } else {
              return [...prev, feat]
          }
      })
  }

  const addCustomFeature = () => {
      if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
          setSelectedFeatures([...selectedFeatures, customFeature.trim()])
          setCustomFeature('')
      }
  }

  const handleSaveAndGenerate = async (formData: FormData) => {
    setLoading(true)
    formData.set('features', selectedFeatures.join(','))

    try {
        await updateDealerInfo(formData)
    } catch (error) {
        console.error("Mentési hiba:", error)
    }

    try {
        const doc = new jsPDF()
        
        // 1. Erőforrások letöltése párhuzamosan (Font + Logó)
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        
        // FONTOS: Feltételezzük, hogy a logó a public mappában van 'drivesync-logo.png' néven
        // Ha más a neve, írd át itt!
        const logoUrl = window.location.origin + '/drivesync-logo.png'; 

        const [fontRes, logoRes] = await Promise.all([
            fetch(fontUrl),
            fetch(logoUrl)
        ]);

        const fontBuffer = await fontRes.arrayBuffer();
        const logoBuffer = await logoRes.arrayBuffer();

        // Font beállítása
        doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(fontBuffer));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');

        // Logó konvertálása
        const logoBase64 = arrayBufferToBase64(logoBuffer);

        // --- PDF DESIGN ---
        
        // Sötét fejléc háttér
        doc.setFillColor(15, 23, 42) // Slate-900
        doc.rect(0, 0, 210, 60, 'F') 
        
        // LOGÓ BEILLESZTÉSE (Bal felső sarok)
        // paraméterek: kép, típus, x, y, szélesség, magasság
        try {
            doc.addImage(logoBase64, 'PNG', 10, 10, 30, 30); 
        } catch (e) {
            console.warn("Nem sikerült a logót beilleszteni (lehet nem PNG?)", e);
        }

        // Cím (Autó neve)
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(30)
        // Kicsit jobbra toljuk a szöveget, hogy ne lógjon a logóba, vagy marad középen
        doc.text(`${car.make} ${car.model}`, 105, 25, { align: 'center' })
        
        // Motor
        const engine = formData.get('engine_details') as string
        if (engine) {
            doc.setFontSize(16)
            doc.setTextColor(245, 158, 11) // Amber
            doc.text(engine, 105, 40, { align: 'center' })
        }

        // Ár
        const priceVal = formData.get('price') as string
        if (priceVal) {
            const price = parseInt(priceVal).toLocaleString()
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(50) 
            doc.text(`${price} Ft`, 105, 90, { align: 'center' })
        }

        // Adatok
        doc.setFontSize(14)
        doc.setTextColor(80, 80, 80)
        const yStart = 120
        
        doc.text(`Évjárat:`, 30, yStart); doc.setFontSize(14); doc.setTextColor(0,0,0); doc.text(`${car.year}`, 70, yStart); doc.setTextColor(80,80,80);
        doc.text(`Üzemanyag:`, 30, yStart + 15); doc.setFontSize(14); doc.setTextColor(0,0,0); doc.text(`${car.fuel_type}`, 70, yStart + 15); doc.setTextColor(80,80,80);
        doc.text(`Futásteljesítmény:`, 110, yStart); doc.setFontSize(14); doc.setTextColor(0,0,0); doc.text(`${car.mileage.toLocaleString()} km`, 160, yStart); doc.setTextColor(80,80,80);
        doc.text(`Váltó:`, 110, yStart + 15); doc.setFontSize(14); doc.setTextColor(0,0,0); doc.text(`${formData.get('transmission') || '-'}`, 160, yStart + 15); doc.setTextColor(80,80,80);
        
        // Extrák
        if (selectedFeatures.length > 0) {
            doc.setFontSize(16)
            doc.setTextColor(0, 0, 0)
            doc.text("Kiemelt Felszereltség:", 105, yStart + 45, { align: 'center' })
            
            doc.setFontSize(11)
            doc.setTextColor(50, 50, 50)
            let yFeat = yStart + 60
            let xPos = 40
            
            selectedFeatures.forEach((feat, i) => {
                if (i % 2 === 0) xPos = 40; else xPos = 120;
                doc.text(`• ${feat}`, xPos, yFeat)
                if (i % 2 !== 0) yFeat += 8;
                if (yFeat > 200) yFeat = 200; 
            })
        }

        // QR Kód
        const verifyUrl = `${window.location.origin}/verify/${car.id}`
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 })
        
        const pageHeight = doc.internal.pageSize.height;
        doc.addImage(qrDataUrl, 'PNG', 80, pageHeight - 80, 50, 50)
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text("Szkennelje be a hitelesített szerviztörténetért!", 105, pageHeight - 20, { align: 'center' })
        
        doc.save(`${car.make}_Kereskedoi_Adatlap.pdf`)
        onClose()

    } catch (err) {
        console.error("PDF Hiba:", err)
        alert('Hiba történt. Ellenőrizd, hogy a drivesync-logo.png elérhető-e a public mappában!')
    } finally {
        setLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl">Kereskedői Adatlap</h3>
                        <p className="text-slate-400 text-xs">Jármű adatainak szerkesztése és PDF generálás</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors">✕</button>
            </div>
            
            <form action={handleSaveAndGenerate} className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
                <input type="hidden" name="id" value={car.id} />
                
                <div className="space-y-8">
                    {/* ALAP ADATOK */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-900 font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <span className="bg-blue-100 text-blue-600 p-1 rounded">🚗</span> Alapadatok
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Eladási Ár</label>
                                <div className="relative">
                                    <input name="price" type="number" defaultValue={car.price} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 pl-4 pr-12 focus:ring-amber-500 focus:border-amber-500 font-bold text-lg" placeholder="0" />
                                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm">Ft</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motor</label>
                                <input name="engine_details" type="text" defaultValue={car.engine_details} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 font-medium" placeholder="Pl. 2.0 TDI" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teljesítmény</label>
                                <div className="relative">
                                    <input name="performance_hp" type="number" defaultValue={car.performance_hp} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 pl-4 pr-12 focus:ring-blue-500 focus:border-blue-500 font-medium" placeholder="0" />
                                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm">LE</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Váltó</label>
                                <select name="transmission" defaultValue={car.transmission} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 font-medium">
                                    <option value="Manuális">Manuális</option>
                                    <option value="Automata">Automata</option>
                                    <option value="Félautomata">Félautomata</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* FELSZERELTSÉG LISTA */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-900 font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <span className="bg-emerald-100 text-emerald-600 p-1 rounded">✨</span> Felszereltség kiválasztása
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8">
                            {Object.entries(FEATURES_CATEGORIES).map(([category, items]) => (
                                <div key={category}>
                                    <h5 className="font-bold text-slate-900 text-xs mb-3 uppercase tracking-wider border-b border-slate-200 pb-1">{category}</h5>
                                    <div className="space-y-1.5">
                                        {items.map(item => {
                                            const isSelected = selectedFeatures.includes(item);
                                            return (
                                                <div 
                                                    key={item} 
                                                    onClick={() => toggleFeature(item)}
                                                    className={`flex items-start gap-2 cursor-pointer group select-none transition-all hover:bg-slate-50 p-1 rounded ${isSelected ? 'opacity-100' : 'opacity-70'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                                                        isSelected 
                                                            ? 'bg-emerald-500 border-emerald-500 shadow-sm' 
                                                            : 'bg-white border-slate-300 group-hover:border-emerald-400'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`text-[11px] leading-tight ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>{item}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Egyéb extra hozzáadása */}
                        <div className="mt-8 pt-4 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Egyéb extra hozzáadása</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={customFeature}
                                    onChange={(e) => setCustomFeature(e.target.value)}
                                    className="flex-1 rounded-xl border-slate-300 bg-white text-slate-900 py-2 px-4 text-sm focus:ring-emerald-500 focus:border-emerald-500" 
                                    placeholder="Pl. Tetőbox..." 
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                                />
                                <button type="button" onClick={addCustomFeature} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors">
                                    Hozzáad
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedFeatures.map(feat => (
                                    <span key={feat} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                        {feat}
                                        <button type="button" onClick={() => toggleFeature(feat)} className="hover:text-red-500 ml-1">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                        Mégsem
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-transform active:scale-95"
                    >
                        {loading ? 'Generálás...' : 'Mentés és Nyomtatás'}
                    </button>
                </div>
            </form>
        </div>
    </div>,
    document.body
  )
}