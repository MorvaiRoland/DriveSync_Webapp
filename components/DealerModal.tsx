'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

// --- SEGÉDFÜGGVÉNY: Buffer -> Base64 ---
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
    'Biztonság': [ // Rövidített nevek a helytakarékosságért
        'ABS', 'ASR', 'ESP', 
        'Vezetőoldali légzsák', 'Utasoldali légzsák', 'Oldallégzsák', 'Függönylégzsák', 'ISOFIX', 
        'Guminyomás-ell.', 'Sávtartó', 'Holttér-figyelő', 
        'Tábla-felismerő', 'Vészfék assz.', 'Fáradtságérzékelő', 'Riasztó'
    ],
    'Kényelem': [
        'Man. Klíma', 'Aut. Klíma', 'Dig. Klíma', 
        'Tempomat', 'Adaptív tempomat', 'Ülésfűtés', 'Ülésszellőztetés', 'Memóriás ülés',
        'Kormányfűtés', 'Kulcsnélküli indítás', 'Start-Stop',
        'El. ablak', 'El. tükör', 'El. csomagtér', 'Állófűtés'
    ],
    'Multimédia': [
        'Navigáció', 'Bluetooth', 'Android Auto', 
        'Apple CarPlay', 'USB', 'Hi-Fi', 'Prémium Hifi',
        'Érintőkijelző', 'Dig. műszerfal', 'HUD', 'Vez. nélküli töltő'
    ],
    'Külső': [
        'Alufelni', 'Metálfény', 'LED fényszóró', 'Mátrix LED', 
        'Xenon', 'Kanyarkövető', 'Ködlámpa', 
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

  // --- PDF GENERÁLÁS (SINGLE PAGE OPTIMIZED) ---
  const handleSaveAndGenerate = async (formData: FormData) => {
    setLoading(true)
    formData.set('features', selectedFeatures.join(','))

    try {
        await updateDealerInfo(formData)
    } catch (error) {
        console.error("Adatbázis mentési hiba:", error)
    }

    try {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 12; // Kisebb margó a több helyért

        // Fontok & Logó
        const fontRegularUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontBoldUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf';
        const logoUrl = window.location.origin + '/icons/icon-512.png'; 

        const [fontRegRes, fontBoldRes, logoRes] = await Promise.all([
            fetch(fontRegularUrl),
            fetch(fontBoldUrl),
            fetch(logoUrl)
        ]);

        doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(await fontRegRes.arrayBuffer()));
        doc.addFileToVFS('Roboto-Bold.ttf', arrayBufferToBase64(await fontBoldRes.arrayBuffer()));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        doc.setFont('Roboto');

        let logoBase64 = null;
        if (logoRes.ok) logoBase64 = arrayBufferToBase64(await logoRes.arrayBuffer());

        // --- 1. KOMPAKT FEJLÉC (30mm magas) ---
        const headerHeight = 25;
        doc.setFillColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        if (logoBase64) {
            try { doc.addImage(logoBase64, 'PNG', margin, 4, 18, 18); } catch (e) {}
        }

        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        doc.text("DynamicSense | Hivatalos Adatlap", pageWidth - margin, 12, { align: 'right' });
        doc.text(new Date().toLocaleDateString('hu-HU'), pageWidth - margin, 17, { align: 'right' });

        let yPos = headerHeight + 12;

        // --- 2. CÍM ÉS ÁR (Egymás mellett a helytakarékosságért) ---
        
        // Autó neve
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFontSize(22); 
        doc.setFont('Roboto', 'bold');
        doc.text(`${car.make} ${car.model}`, margin, yPos);
        
        // Ár
        const priceVal = formData.get('price') as string;
        if (priceVal) {
            const price = parseInt(priceVal).toLocaleString();
            doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
            doc.setFontSize(22); 
            doc.text(`${price} Ft`, pageWidth - margin, yPos, { align: 'right' });
        }

        yPos += 7;
        
        // Alcím
        doc.setFontSize(10);
        doc.setTextColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
        doc.setFont('Roboto', 'normal');
        doc.text(`${car.plate}  |  DynamicSense Verified`, margin, yPos);

        yPos += 12;

        // --- 3. KOMPAKT SPECIFIKÁCIÓS SÁV (20mm magas) ---
        const specYStart = yPos;
        const specHeight = 20;
        
        doc.setFillColor(COLORS.BG_LIGHT[0], COLORS.BG_LIGHT[1], COLORS.BG_LIGHT[2]);
        doc.roundedRect(margin, specYStart, pageWidth - (margin * 2), specHeight, 2, 2, 'F');

        const engineDetails = formData.get('engine_details') as string;
        const performance = formData.get('performance_hp') as string;
        const transmissionVal = formData.get('transmission') as string;
        
        const displayEngine = engineDetails || (car.engine_size ? `${car.engine_size}cc` : '-');
        const displayPower = performance ? `${performance}LE` : (car.power_hp ? `${car.power_hp}LE` : '-');
        const displayTransmission = transmissionVal || car.transmission || '-';

        const specs = [
            { label: 'ÉVJÁRAT', val: `${car.year}` },
            { label: 'KM ÓRA', val: `${car.mileage.toLocaleString()} km` },
            { label: 'ÜZEMANYAG', val: car.fuel_type },
            { label: 'MOTOR', val: `${displayEngine} ${displayPower}` }, // Összevonva
            { label: 'VÁLTÓ', val: displayTransmission }
        ];

        const colCount = 5; // 5 oszlop egy sorban
        const colWidth = (pageWidth - (margin * 2)) / colCount;

        specs.forEach((spec, i) => {
            const currentX = margin + (i * colWidth) + (colWidth / 2);
            const currentY = specYStart + 6;

            doc.setFontSize(7);
            doc.setTextColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
            doc.setFont('Roboto', 'bold');
            doc.text(spec.label, currentX, currentY, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
            doc.setFont('Roboto', 'bold');
            doc.text(spec.val || '-', currentX, currentY + 6, { align: 'center' });
        });

        yPos += specHeight + 10;

        // --- 4. FELSZERELTSÉG (4 OSZLOPOS SŰRŰ RÁCS) ---
        doc.setFontSize(12);
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFont('Roboto', 'bold');
        doc.text("FELSZERELTSÉG", margin, yPos);
        
        doc.setDrawColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos + 2, margin + 40, yPos + 2); 
        
        yPos += 8;

        // Csoportosítás
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
        if (otherFeatures.length > 0) groupedFeatures['EGYÉB'] = otherFeatures;

        // 4 Oszlopos Grid Számítás
        // Az elemeket kategóriánként írjuk ki, de a tételeket 4 oszlopba tördeljük a kategórián belül.
        
        const colWidthFeature = (pageWidth - (margin * 2)) / 4;

        Object.entries(groupedFeatures).forEach(([category, feats]) => {
            // Kategória Cím
            doc.setFontSize(9);
            doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
            doc.setFont('Roboto', 'bold');
            doc.text(category.toUpperCase(), margin, yPos);
            yPos += 5;

            // Tételek (4 oszlop)
            doc.setFontSize(8);
            doc.setTextColor(COLORS.TEXT_MAIN[0], COLORS.TEXT_MAIN[1], COLORS.TEXT_MAIN[2]);
            doc.setFont('Roboto', 'normal');

            let colIndex = 0;
            const startYforCat = yPos;
            let rowsInCat = 0;

            feats.forEach((feat, index) => {
                const x = margin + (colIndex * colWidthFeature);
                const y = startYforCat + (rowsInCat * 5); // 5mm sorköz

                // Bullet
                doc.setFillColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
                doc.circle(x + 1, y - 1, 0.5, 'F');
                
                // Szöveg
                doc.text(feat, x + 4, y);

                colIndex++;
                if (colIndex >= 4) {
                    colIndex = 0;
                    rowsInCat++;
                }
            });

            // Ugrás a következő kategória elé (ha maradt töredék sor, azt is számoljuk)
            yPos += (rowsInCat + (colIndex > 0 ? 1 : 0)) * 5 + 3; 
        });

        // --- 5. LÁBLÉC & QR KÓD (FIXEN AZ ALJÁN) ---
        const footerHeight = 35; // Kompakt lábléc
        const footerY = pageHeight - footerHeight;

        // Vonal elválasztó
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        // QR
        const verifyUrl = `${window.location.origin}/verify/${car.id}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 150, margin: 0 });
        doc.addImage(qrDataUrl, 'PNG', margin, footerY, 25, 25);

        // Szöveg
        const textX = margin + 30;
        const textY = footerY + 6;

        doc.setFontSize(10);
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFont('Roboto', 'bold');
        doc.text("Hitelesített Járműtörténet", textX, textY);

        doc.setFontSize(8);
        doc.setTextColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
        doc.setFont('Roboto', 'normal');
        doc.text("A QR kód beolvasásával megtekinthető az autó digitális szervizkönyve,", textX, textY + 5);
        doc.text("hivatalos futásteljesítmény grafikonja és dokumentumai.", textX, textY + 9);
        
        doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
        doc.setFontSize(8);
        doc.setFont('Roboto', 'bold');
        doc.text("Powered by DynamicSense", textX, textY + 16);

        doc.save(`${car.make}_${car.model}_Adatlap.pdf`)
        onClose()

    } catch (err) {
        console.error("PDF Hiba:", err)
        alert('Hiba történt.')
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
                    <div className="bg-amber-500 p-2 rounded-lg text-slate-900 shadow-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl tracking-tight">Kereskedői Adatlap</h3>
                        <p className="text-slate-400 text-xs font-medium">Egyoldalas, kompakt PDF generálás</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors hover:bg-white/10">✕</button>
            </div>
            
            <form action={handleSaveAndGenerate} className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
                <input type="hidden" name="id" value={car.id} />
                
                {/* ŰRLAP MEZŐK (Ugyanaz, mint eddig, csak a PDF logika változott) */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-900 font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg text-sm">🚗</span> Alapadatok
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Eladási Ár</label>
                                <div className="relative group">
                                    <input name="price" type="number" defaultValue={car.price} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 pl-4 pr-12 focus:ring-amber-500 focus:border-amber-500 font-bold text-lg shadow-sm" placeholder="0" />
                                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm bg-slate-100 px-2 rounded">Ft</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motor</label>
                                <input name="engine_details" type="text" defaultValue={car.engine_details || (car.engine_size ? `${car.engine_size} ccm` : '')} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm" placeholder="pl. 2.0 TDI" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teljesítmény</label>
                                <div className="relative">
                                    <input name="performance_hp" type="number" defaultValue={car.performance_hp || car.power_hp} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 pl-4 pr-12 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm" placeholder="0" />
                                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm bg-slate-100 px-2 rounded">LE</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Váltó</label>
                                <select name="transmission" defaultValue={car.transmission || "Manuális"} className="w-full rounded-xl border-slate-300 bg-white text-slate-900 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm">
                                    <option value="Manuális">Manuális</option>
                                    <option value="Automata">Automata</option>
                                    <option value="Félautomata">Félautomata</option>
                                    <option value="Fokozatmentes">Fokozatmentes (CVT)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-900 font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg text-sm">✨</span> Felszereltség
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
                                                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 shadow-sm' : 'bg-white border-slate-300 group-hover:border-emerald-400'}`}>
                                                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    <span className={`text-xs font-medium ${isSelected ? 'font-bold' : ''}`}>{item}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-slate-200 sticky bottom-0 bg-slate-50 pb-2">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Mégsem</button>
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-70 flex items-center gap-2 transition-all">
                        {loading ? 'Generálás...' : 'Mentés és PDF'}
                    </button>
                </div>
            </form>
        </div>
    </div>,
    document.body
  )
}