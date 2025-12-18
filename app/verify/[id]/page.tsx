'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

// --- SEGÉDFÜGGVÉNYEK ---

// Buffer -> Base64 (Fontokhoz)
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// --- KONFIGURÁCIÓ ---
const COLORS = {
    DARK: [15, 23, 42],      // Slate-900
    ACCENT: [245, 158, 11],  // Amber-500
    TEXT_MAIN: [51, 65, 85], // Slate-700
    TEXT_LIGHT: [100, 116, 139], // Slate-500
    BG_LIGHT: [241, 245, 249], // Slate-100
}

const FEATURES_CATEGORIES: Record<string, string[]> = {
    'Biztonság & Védelem': [
        'ABS (blokkolásgátló)', 'ASR (kipörgésgátló)', 'ESP (menetstabilizátor)', 
        'Légzsák (Vezető/Utas)', 'Oldallégzsák', 'Függönylégzsák', 'ISOFIX', 
        'Guminyomás-ellenőrző', 'Sávtartó rendszer', 'Holttér-figyelő', 
        'Tábla-felismerő', 'Vészfék asszisztens', 'Fáradtságérzékelő', 'Riasztó'
    ],
    'Kényelem & Luxus': [
        'Klíma (Manuális)', 'Klíma (Automata)', 'Klíma (Digitális)', 
        'Tempomat', 'Adaptív tempomat', 'Ülésfűtés', 'Ülésszellőztetés', 'Memóriás ülés',
        'Kormányfűtés', 'Kulcsnélküli nyitás/indítás', 'Start-Stop',
        'Elektromos ablak', 'Elektromos tükör', 'Elektromos csomagtérajtó', 'Állófűtés'
    ],
    'Multimédia & Tech': [
        'Navigáció (GPS)', 'Bluetooth kihangosító', 'Android Auto', 
        'Apple CarPlay', 'USB csatlakozó', 'Hi-Fi rendszer', 'Prémium Hifi',
        'Érintőkijelző', 'Digitális műszerfal', 'HUD (Head-Up Display)', 'Vezeték nélküli töltő'
    ],
    'Külső & Megjelenés': [
        'Könnyűfém felni', 'Metálfény', 'LED fényszóró', 'Mátrix LED', 
        'Xenon fényszóró', 'Kanyarkövető fényszóró', 'Ködlámpa', 
        'Esőszenzor', 'Tolatóradar', 'Tolatókamera', '360° kamera', 
        'Vonóhorog', 'Tetősín', 'Panorámatető', 'Sötétített üveg'
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

  // --- PDF GENERÁLÁS ---
  const handleSaveAndGenerate = async (formData: FormData) => {
    setLoading(true)
    formData.set('features', selectedFeatures.join(','))

    // 1. Mentés az adatbázisba
    try {
        await updateDealerInfo(formData)
    } catch (error) {
        console.error("Adatbázis mentési hiba:", error)
        // Nem állunk meg, a PDF generálás mehet tovább a form adatokkal
    }

    try {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;

        // 2. Erőforrások betöltése (Fontok, Logó)
        const fontRegularUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontBoldUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf';
        
        // Logó (Helyi útvonalról) - cseréld le a sajátodra
        const logoUrl = window.location.origin + '/icons/icon-512.png'; 

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

        // Logó feldolgozása
        let logoBase64 = null;
        if (logoRes.ok) logoBase64 = arrayBufferToBase64(await logoRes.arrayBuffer());

        // --- RAJZOLÁS KEZDÉSE ---

        // 1. FEJLÉC (Sötét sáv)
        const headerHeight = 35;
        doc.setFillColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        // Logó balra fent
        if (logoBase64) {
            try { doc.addImage(logoBase64, 'PNG', margin, 5, 25, 25); } catch (e) {}
        }

        // Céges felirat (Jobbra fent)
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.text("DynamicSense | Prémium Járműadatlap", pageWidth - margin, 15, { align: 'right' });
        doc.text(new Date().toLocaleDateString('hu-HU'), pageWidth - margin, 22, { align: 'right' });

        let yPos = headerHeight + 25;

        // 2. AUTÓ CÍM & ÁR
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFontSize(28); // Még nagyobb cím
        doc.setFont('Roboto', 'bold');
        doc.text(`${car.make} ${car.model}`, margin, yPos);
        
        // Ár (Jobb oldalra, kiemelve)
        const priceVal = formData.get('price') as string;
        if (priceVal) {
            const price = parseInt(priceVal).toLocaleString();
            doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
            doc.setFontSize(32); // Még nagyobb ár
            doc.text(`${price} Ft`, pageWidth - margin, yPos, { align: 'right' });
        }

        yPos += 10;
        
        // Rendszám / Altípus
        doc.setFontSize(14);
        doc.setTextColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
        doc.setFont('Roboto', 'normal');
        doc.text(`${car.plate}  |  DynamicSense Verified`, margin, yPos);

        yPos += 20;

        // 3. FŐ ADATOK GRID (Nincs kép, helyette nagyobb, tiszta adatblokk)
        
        // Adatok kinyerése a formból (hogy a friss adat kerüljön be)
        const engineDetails = formData.get('engine_details') as string; // Amit beírt a mezőbe
        const performance = formData.get('performance_hp') as string;
        const transmissionVal = formData.get('transmission') as string;
        
        // Vagy fallback a car objektumból, ha a form üres lenne (de a formon ott vannak az adatok)
        const engineSize = car.engine_size ? `${car.engine_size} ccm` : '';
        const displayEngine = engineDetails || engineSize || '-';
        const displayTransmission = transmissionVal || car.transmission || '-';
        const displayPower = performance ? `${performance} LE` : (car.power_hp ? `${car.power_hp} LE` : '-');

        // Nagy specifikációs sáv
        const specYStart = yPos;
        const specHeight = 35; // Magasabb sáv
        doc.setFillColor(COLORS.BG_LIGHT[0], COLORS.BG_LIGHT[1], COLORS.BG_LIGHT[2]);
        doc.roundedRect(margin, specYStart, pageWidth - (margin * 2), specHeight, 3, 3, 'F');

        // Adatok rajzolása gridben (4 oszlop)
        const specs = [
            { label: 'ÉVJÁRAT', val: `${car.year}` },
            { label: 'FUTÁSTELJESÍTMÉNY', val: `${car.mileage.toLocaleString()} km` },
            { label: 'ÜZEMANYAG', val: car.fuel_type },
            { label: 'MOTOR', val: displayEngine }, 
            { label: 'TELJESÍTMÉNY', val: displayPower },
            { label: 'VÁLTÓ', val: displayTransmission }
        ];

        // 3 sor, 2 oszlop helyett most legyen 3 oszlop, 2 sorban
        const colCount = 3;
        const colWidth = (pageWidth - (margin * 2)) / colCount;
        let rowIdx = 0;
        let colIdx = 0;

        specs.forEach((spec) => {
            const currentX = margin + (colIdx * colWidth) + (colWidth / 2);
            const currentY = specYStart + 10 + (rowIdx * 15); // Sorok közötti távolság

            doc.setFontSize(8);
            doc.setTextColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
            doc.setFont('Roboto', 'bold');
            doc.text(spec.label, currentX, currentY, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
            doc.setFont('Roboto', 'bold');
            
            // Hosszú szöveg vágása
            const displayVal = spec.val.length > 25 ? spec.val.substring(0, 22) + '...' : spec.val;
            doc.text(displayVal || '-', currentX, currentY + 6, { align: 'center' });

            colIdx++;
            if (colIdx >= colCount) {
                colIdx = 0;
                rowIdx++;
            }
        });

        yPos += specHeight + 20;

        // 4. FELSZERELTSÉG (2 Oszlopos Layout)
        doc.setFontSize(16);
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFont('Roboto', 'bold');
        doc.text("KIEMELT FELSZERELTSÉG", margin, yPos);
        
        // Vonal
        doc.setDrawColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos + 3, margin + 70, yPos + 3); 
        
        yPos += 12;

        // Adatok előkészítése
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
        if (otherFeatures.length > 0) groupedFeatures['Egyéb Extrák'] = otherFeatures;

        // Renderelés 2 oszlopban
        const leftColX = margin;
        const rightColX = pageWidth / 2 + 10;
        let isLeft = true;
        
        let leftY = yPos;
        let rightY = yPos;

        Object.entries(groupedFeatures).forEach(([category, feats]) => {
            // Melyik oszlopba fér jobban?
            const currentX = isLeft ? leftColX : rightColX;
            let currentY = isLeft ? leftY : rightY;

            // Kategória Cím
            doc.setFontSize(11);
            doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
            doc.setFont('Roboto', 'bold');
            doc.text(category.toUpperCase(), currentX, currentY);
            currentY += 7;

            // Listaelemek
            doc.setFontSize(10);
            doc.setTextColor(COLORS.TEXT_MAIN[0], COLORS.TEXT_MAIN[1], COLORS.TEXT_MAIN[2]);
            doc.setFont('Roboto', 'normal');

            feats.forEach(feat => {
                doc.setDrawColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
                doc.setFillColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
                doc.circle(currentX + 1.5, currentY - 1.5, 0.7, 'F'); // Kicsit nagyobb pötty
                
                doc.text(feat, currentX + 6, currentY);
                currentY += 6;
            });

            currentY += 8; // Térköz kategóriák között

            if (isLeft) {
                leftY = currentY;
                isLeft = false;
            } else {
                rightY = currentY;
                isLeft = true;
            }
        });

        // 5. LÁBLÉC & QR KÓD (Alulra rögzítve)
        const footerHeight = 45;
        const footerY = pageHeight - footerHeight;

        // Háttér a láblécnek
        doc.setFillColor(250, 250, 250);
        doc.rect(0, footerY, pageWidth, footerHeight, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.line(0, footerY, pageWidth, footerY);

        // QR Generálás
        const verifyUrl = `${window.location.origin}/verify/${car.id}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 0 });
        
        // QR kép
        doc.addImage(qrDataUrl, 'PNG', margin, footerY + 6, 34, 34);

        // QR Szöveg
        const textX = margin + 42;
        const textY = footerY + 14;

        doc.setFontSize(12);
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFont('Roboto', 'bold');
        doc.text("Eredetiségvizsgálat & Digitális Szervizkönyv", textX, textY);

        doc.setFontSize(9);
        doc.setTextColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
        doc.setFont('Roboto', 'normal');
        doc.text("Olvassa be a QR kódot a jármű részletes előéletének,", textX, textY + 6);
        doc.text("futásteljesítmény-grafikonjának és dokumentációjának megtekintéséhez.", textX, textY + 11);
        
        doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
        doc.setFontSize(10);
        doc.setFont('Roboto', 'bold');
        doc.text("Powered by DynamicSense", textX, textY + 22);

        // Mentés
        doc.save(`${car.make}_${car.model}_Adatlap.pdf`)
        onClose()

    } catch (err) {
        console.error("PDF Generálási Hiba:", err)
        alert('Hiba történt a generáláskor. Ellenőrizd a konzolt.')
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
                    <div className="bg-amber-500 p-2 rounded-lg text-slate-900 shadow-lg shadow-amber-500/20">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl tracking-tight">Kereskedői Adatlap</h3>
                        <p className="text-slate-400 text-xs font-medium">Specifikáció szerkesztése és PDF exportálás</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors hover:bg-white/10">✕</button>
            </div>
            
            <form action={handleSaveAndGenerate} className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
                <input type="hidden" name="id" value={car.id} />
                
                <div className="space-y-8">
                    {/* ALAP ADATOK INPUTOK */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-900 font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg text-sm">🚗</span> Alapadatok
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Eladási Ár</label>
                                <div className="relative group">
                                    <input name="price" type="number" defaultValue={car.price} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 pl-4 pr-12 focus:ring-amber-500 focus:border-amber-500 font-bold text-lg shadow-sm transition-all" placeholder="0" />
                                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm bg-slate-100 px-2 rounded">Ft</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Motor (pl. 2.0 TDI)</label>
                                {/* Default value: próbáljuk meg a meglévő engine_details-t, vagy ha nincs, akkor az engine_size-t */}
                                <input name="engine_details" type="text" defaultValue={car.engine_details || (car.engine_size ? `${car.engine_size} ccm` : '')} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm" placeholder="pl. 1.6 CRDI" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Teljesítmény</label>
                                <div className="relative">
                                    <input name="performance_hp" type="number" defaultValue={car.performance_hp || car.power_hp} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 pl-4 pr-12 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm" placeholder="0" />
                                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm bg-slate-100 px-2 rounded">LE</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Váltó</label>
                                <select name="transmission" defaultValue={car.transmission || "Manuális"} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm">
                                    <option value="Manuális">Manuális</option>
                                    <option value="Automata">Automata</option>
                                    <option value="Félautomata">Félautomata</option>
                                    <option value="Fokozatmentes">Fokozatmentes (CVT)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* FELSZERELTSÉG VÁLASZTÓ */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-900 font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg text-sm">✨</span> Felszereltség kiválasztása
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Object.entries(FEATURES_CATEGORIES).map(([category, items]) => (
                                <div key={category} className="space-y-3">
                                    <h5 className="font-black text-slate-800 text-[10px] mb-2 uppercase tracking-widest border-b-2 border-slate-100 pb-1">{category}</h5>
                                    <div className="space-y-1">
                                        {items.map(item => {
                                            const isSelected = selectedFeatures.includes(item);
                                            return (
                                                <div 
                                                    key={item} 
                                                    onClick={() => toggleFeature(item)}
                                                    className={`flex items-center gap-2.5 cursor-pointer group select-none transition-all px-2 py-1.5 rounded-lg ${isSelected ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-600'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                                                        isSelected 
                                                            ? 'bg-emerald-500 border-emerald-500 shadow-sm scale-110' 
                                                            : 'bg-white border-slate-300 group-hover:border-emerald-400'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs font-medium ${isSelected ? 'font-bold' : ''}`}>{item}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Egyéb extra */}
                        <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Egyéb extra hozzáadása</label>
                            <div className="flex gap-2 max-w-md">
                                <input 
                                    type="text" 
                                    value={customFeature}
                                    onChange={(e) => setCustomFeature(e.target.value)}
                                    className="flex-1 rounded-xl border-slate-300 bg-white text-slate-900 py-2 px-4 text-sm focus:ring-emerald-500 focus:border-emerald-500 shadow-sm" 
                                    placeholder="Pl. Tetőbox..." 
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                                />
                                <button type="button" onClick={addCustomFeature} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide transition-colors shadow-lg shadow-slate-900/20">
                                    Hozzáad
                                </button>
                            </div>
                            
                            {selectedFeatures.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {selectedFeatures.map(feat => (
                                        <span key={feat} className="bg-white text-slate-700 border border-slate-200 pl-3 pr-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm animate-in fade-in zoom-in duration-200">
                                            {feat}
                                            <button type="button" onClick={() => toggleFeature(feat)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-slate-200 sticky bottom-0 bg-slate-50 pb-2">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">
                        Mégsem
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none flex items-center gap-2 transition-all"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Generálás...
                            </>
                        ) : (
                            <>
                                <span>Mentés és PDF</span>
                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>,
    document.body
  )
}