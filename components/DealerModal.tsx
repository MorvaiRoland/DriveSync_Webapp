'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

// Segédfüggvény: Base64 konverzió (Fontokhoz)
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// KATEGÓRIÁKRA BONTOTT EXTRÁK (Adatstruktúra)
const FEATURES_CATEGORIES: Record<string, string[]> = {
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
          if (prev.includes(feat)) return prev.filter(f => f !== feat)
          return [...prev, feat]
      })
  }

  const addCustomFeature = () => {
      if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
          setSelectedFeatures([...selectedFeatures, customFeature.trim()])
          setCustomFeature('')
      }
  }

  // --- PDF GENERÁLÁS LOGIKA ---
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
        
        // 1. ERŐFORRÁSOK BETÖLTÉSE
        const fontRegularUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontBoldUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf';
        const logoUrl = window.location.origin + '/drivesync-logo.png'; 

        const [fontRegRes, fontBoldRes, logoRes] = await Promise.all([
            fetch(fontRegularUrl),
            fetch(fontBoldUrl),
            fetch(logoUrl)
        ]);

        // Fontok regisztrálása
        doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(await fontRegRes.arrayBuffer()));
        doc.addFileToVFS('Roboto-Bold.ttf', arrayBufferToBase64(await fontBoldRes.arrayBuffer()));
        
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        doc.setFont('Roboto');

        // Logó (ellenőrzéssel)
        let logoBase64 = null;
        if (logoRes.ok) {
            logoBase64 = arrayBufferToBase64(await logoRes.arrayBuffer());
        }

        // --- PDF RAJZOLÁS ---
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // 1. FEJLÉC (Modern Sötétkék)
        doc.setFillColor(15, 23, 42) // Slate-900
        doc.rect(0, 0, pageWidth, 50, 'F') 
        
        if (logoBase64) {
            try { doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30); } catch (e) {}
        }

        // Cím
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(26)
        doc.setFont('Roboto', 'bold')
        doc.text(`${car.make} ${car.model}`, 50, 25)
        
        doc.setFontSize(12)
        doc.setFont('Roboto', 'normal')
        doc.setTextColor(148, 163, 184) // Slate-400
        doc.text(car.plate, 50, 32)

        // Ár (Jobb oldal)
        const priceVal = formData.get('price') as string
        if (priceVal) {
            const price = parseInt(priceVal).toLocaleString()
            doc.setFontSize(32)
            doc.setTextColor(245, 158, 11) // Amber-500
            doc.setFont('Roboto', 'bold')
            doc.text(`${price} Ft`, pageWidth - 14, 30, { align: 'right' })
        }

        // 2. FŐ ADATOK (Grid elrendezés)
        let yPos = 70;
        const col1 = 14;
        const col2 = 80;
        const col3 = 140;

        const drawDataBlock = (label: string, value: string, x: number) => {
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139); // Label szürke
            doc.setFont('Roboto', 'normal');
            doc.text(label.toUpperCase(), x, yPos);
            
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42); // Value sötét
            doc.setFont('Roboto', 'bold');
            doc.text(value || '-', x, yPos + 6);
        }

        drawDataBlock("Évjárat", `${car.year}`, col1);
        drawDataBlock("Futásteljesítmény", `${car.mileage.toLocaleString()} km`, col2);
        drawDataBlock("Üzemanyag", car.fuel_type, col3);
        
        yPos += 20;

        const engineDetails = formData.get('engine_details') as string;
        const performance = formData.get('performance_hp') as string;
        const transmission = formData.get('transmission') as string;

        drawDataBlock("Motor", engineDetails, col1);
        drawDataBlock("Teljesítmény", performance ? `${performance} LE` : '-', col2);
        drawDataBlock("Váltó", transmission, col3);

        yPos += 25;

        // Vízszintes elválasztó
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(14, yPos, pageWidth - 14, yPos);
        yPos += 15;

        // 3. FELSZERELTSÉG (Kategóriákra bontva)
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text("Kiemelt Felszereltség", 14, yPos);
        yPos += 10;

        // Kategóriák kirajzolása (2 oszlopos elrendezés a kategóriáknak)
        const leftColX = 14;
        const rightColX = 110;
        let isLeft = true;
        let currentY = yPos;
        let maxY = yPos; // Hogy tudjuk hol folytassuk ha vége

        // Csoportosítjuk a kiválasztott extrákat kategóriákba
        const groupedFeatures: Record<string, string[]> = {};
        const otherFeatures: string[] = [];

        selectedFeatures.forEach(feat => {
            let found = false;
            for (const [cat, items] of Object.entries(FEATURES_CATEGORIES)) {
                if (items.includes(feat)) {
                    if (!groupedFeatures[cat]) groupedFeatures[cat] = [];
                    groupedFeatures[cat].push(feat);
                    found = true;
                    break;
                }
            }
            if (!found) otherFeatures.push(feat);
        });

        // "Egyéb" kategória hozzáadása ha van
        if (otherFeatures.length > 0) {
            groupedFeatures['Egyéb Extrák'] = otherFeatures;
        }

        // Kirajzolás
        Object.entries(groupedFeatures).forEach(([category, feats]) => {
            // Ha nem fér ki az oldalra, új oldal
            if (currentY > pageHeight - 60) {
                doc.addPage();
                currentY = 20;
                maxY = 20;
            }

            const x = isLeft ? leftColX : rightColX;
            const startY = isLeft ? currentY : (currentY === yPos ? yPos : currentY); // Jobb oszlop igazítása

            // Kategória Cím
            doc.setFontSize(11);
            doc.setTextColor(245, 158, 11); // Amber
            doc.setFont('Roboto', 'bold');
            doc.text(category.toUpperCase(), x, currentY);
            
            currentY += 6;

            // Elemek felsorolása
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85); // Slate-700
            doc.setFont('Roboto', 'normal');

            feats.forEach(feat => {
                doc.text(`• ${feat}`, x, currentY);
                currentY += 5;
            });

            currentY += 8; // Térköz a kategóriák között
            
            // Oszlop váltás logika
            if (currentY > maxY) maxY = currentY;
            
            // Ha a bal oszlopban voltunk, most nézzük meg, hogy váltsunk-e
            // Egyszerűsített logika: Sorban haladunk, ha betelik a bal, megyünk jobbra? 
            // Vagy inkább Z alakban? Most maradjunk a Z alaknál (Bal-Jobb-Bal-Jobb)
            if (isLeft) {
                isLeft = false;
                // A jobb oszlop "tetőpontja" az előző bal oszlop kezdete legyen? 
                // Nem, egyszerűbb ha folytonos. 
                // Visszaállítjuk a Y-t a jobb oszlopnak az előző blokk tetejére?
                // Korrekció: Egyszerűsítsük le 1 oszloposra ha túl bonyolult, de a 2 oszlop szebb.
                // Megoldás: Minden kategória után váltunk oldalt (X-et), de Y-t csak minden második után növeljük.
                currentY = maxY - (feats.length * 5) - 14; // Visszaugrás (hack) -> Nem jó.
                
                // Helyesebb megközelítés:
                // Tároljuk a LeftY és RightY értékeket külön.
            }
        });
        
        // ÚJRAÍRT KATEGÓRIA RAJZOLÓ (Stabilabb 2 oszlopos)
        let leftY = yPos;
        let rightY = yPos;

        Object.entries(groupedFeatures).forEach(([category, feats], index) => {
            const isLeftColumn = leftY <= rightY;
            const x = isLeftColumn ? leftColX : rightColX;
            let y = isLeftColumn ? leftY : rightY;

            // Kategória Cím
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42); // Sötét
            doc.setFont('Roboto', 'bold');
            doc.text(category.toUpperCase(), x, y);
            y += 6;

            // Elemek
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105); // Szürkébb
            doc.setFont('Roboto', 'normal');
            
            feats.forEach(feat => {
                doc.text(`•  ${feat}`, x, y);
                y += 5;
            });

            y += 10; // Margó

            // Frissítjük a magasságot
            if (isLeftColumn) leftY = y; else rightY = y;
        });

        // A tartalom vége a lejjebb lévő oszlop alja
        yPos = Math.max(leftY, rightY) + 10;


        // 4. LÁBLÉC QR KÓDDAL
        const verifyUrl = `${window.location.origin}/verify/${car.id}`
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 })
        
        // Ha nem fér ki, új oldal
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        } else {
            yPos = pageHeight - 50; // Legalulra igazítva
        }

        // QR Kód
        doc.addImage(qrDataUrl, 'PNG', 14, yPos, 40, 40);
        
        // Szöveg a QR mellett
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.setFont('Roboto', 'bold');
        doc.text("Hitelesített Járműtörténet", 60, yPos + 10);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont('Roboto', 'normal');
        doc.text("Szkennelje be a kódot a részletes digitális", 60, yPos + 16);
        doc.text("szervizkönyv és futásteljesítmény megtekintéséhez.", 60, yPos + 21);
        
        doc.text("drivesync.hu", 60, yPos + 35);

        doc.save(`${car.make}_${car.model}_Adatlap.pdf`)
        onClose()

    } catch (err) {
        console.error("PDF Hiba:", err)
        alert('Hiba történt a generáláskor.')
    } finally {
        setLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* MODAL HEADER */}
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
                        {/* Ikon */}
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
                    {/* ALAP ADATOK INPUTOK */}
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motor (pl. 2.0 TDI)</label>
                                <input name="engine_details" type="text" defaultValue={car.engine_details} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 font-medium" />
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

                    {/* FELSZERELTSÉG VÁLASZTÓ */}
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

                        {/* Egyéb extra */}
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