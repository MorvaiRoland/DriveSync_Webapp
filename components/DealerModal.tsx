'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { X, Check, CarFront, Gauge, Zap, Cog, Tag, Info, FileText, Download, Loader2 } from 'lucide-react'

// --- SEGÉDFÜGGVÉNYEK ---
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

const preventMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
    }
};

// --- KONFIGURÁCIÓ ---
const COLORS = {
    DARK: [15, 23, 42],      // Slate-900
    ACCENT: [245, 158, 11],  // Amber-500
    TEXT_MAIN: [51, 65, 85], // Slate-700
    TEXT_LIGHT: [100, 116, 139], // Slate-500
    BG_LIGHT: [241, 245, 249], // Slate-100
}

// BŐVÍTETT EXTRA LISTA
const FEATURES_CATEGORIES: Record<string, string[]> = {
    'Biztonság': [
        'ABS (blokkolásgátló)', 
        'ASR (kipörgésgátló)', 
        'ESP (menetstabilizátor)',
        'EBD/EBV (elektronikus fékerő-elosztó)',
        'MSR (motorféknyomaték szabályzás)',
        'Vezetőoldali légzsák', 
        'Utasoldali légzsák', 
        'Oldallégzsák', 
        'Függönylégzsák', 
        'Térdlégzsák',
        'Hátsó oldallégzsák',
        'Kikapcsolható utaslégzsák',
        'ISOFIX rendszer', 
        'Guminyomás-ellenőrző rendszer', 
        'Sávtartó rendszer', 
        'Sávváltó asszisztens',
        'Holttér-figyelő rendszer', 
        'Tábla-felismerő funkció', 
        'Vészfék asszisztens', 
        'Fáradtságérzékelő', 
        'Lejtmenet asszisztens',
        'Visszagurulás-gátló',
        'Hátsó keresztirányú forgalomfigyelő',
        'Éjjellátó asszisztens',
        'Gyalogosvédelem',
        'Riasztó',
        'Indításgátló (immobiliser)',
        'Központi zár',
        'Gyerekzár'
    ],
    'Kényelem': [
        'Manuális klíma', 
        'Automata klíma', 
        'Digitális kétzónás klíma', 
        'Digitális többzónás klíma',
        'Állófűtés',
        'Szervokormány',
        'Sebességfüggő szervókormány',
        'Tempomat', 
        'Adaptív tempomat (ACC)', 
        'Kulcsnélküli nyitás',
        'Kulcsnélküli indítás', 
        'Start-Stop rendszer',
        'Ülésfűtés (elöl)', 
        'Ülésfűtés (hátul)',
        'Ülésszellőztetés', 
        'Masszírozós ülés',
        'Elektromos ülésállítás vezetőoldal',
        'Elektromos ülésállítás utasoldal',
        'Memóriás vezetőülés', 
        'Deréktámasz',
        'Combtámasz',
        'Kormányfűtés', 
        'Elektromos ablak elöl', 
        'Elektromos ablak hátul', 
        'Elektromos tükör', 
        'Fűthető tükör',
        'Automatikusan sötétedő belső tükör',
        'Automatikusan sötétedő külső tükör',
        'Elektromosan behajtható külső tükrök',
        'Elektromos csomagtérajtó-mozgatás',
        'Lábbal nyitható csomagtérajtó',
        'Hűthető kesztyűtartó',
        'Hűthető kartámasz',
        'Állítható kormány',
        'Soft-close (ajtószervó)'
    ],
    'Multimédia & Navigáció': [
        'Navigációs rendszer', 
        'Bluetooth kihangosító', 
        'Android Auto', 
        'Apple CarPlay', 
        'MirrorLink',
        'USB csatlakozó', 
        'AUX csatlakozó',
        '12V csatlakozó',
        '230V csatlakozó',
        'MP3 lejátszás',
        'Hi-Fi', 
        'Prémium hangrendszer (Bose/Harman)',
        'Mélynyomó',
        'Érintőkijelző', 
        'Digitális műszerfal', 
        'Head-up Display (HUD)', 
        'Vezeték nélküli telefontöltő',
        'Hangvezérlés',
        'Gesztusvezérlés',
        'Wi-Fi Hotspot',
        'Multifunkciós kormánykerék',
        'Hátsó szórakoztató rendszer'
    ],
    'Külső & Világítás': [
        'Könnyűfém felni', 
        'Acélfelni',
        'Metálfény', 
        'LED fényszóró', 
        'LED mátrix fényszóró', 
        'Lézer fényszóró',
        'Bi-Xenon fényszóró',
        'Xenon fényszóró', 
        'Halogén fényszóró',
        'Kanyarkövető fényszóró', 
        'Kiegészítő fényszóró',
        'Ködlámpa', 
        'Távolsági fényszóró asszisztens',
        'Menetfény',
        'Hazakísérő fény',
        'Esőszenzor', 
        'Fényérzékelő',
        'Fényszórómosó',
        'Fűthető szélvédő',
        'Fűthető ablakmosó fúvókák',
        'Tolatóradar', 
        'Első-hátsó parkolóradar',
        'Parkolóasszisztens (beparkoló automatika)',
        'Tolatókamera', 
        '360° kamera', 
        'Elektromos napfénytető', 
        'Panorámatető', 
        'Nyitható panorámatető',
        'Sötétített üvegezés',
        'Hővédő üvegezés',
        'Tetősín', 
        'Vonóhorog',
        'Elektromos vonóhorog',
        'Pótkerék',
        'Defektjavító készlet'
    ],
    'Műszaki & Sport': [
        'Sportfutómű',
        'Állítható felfüggesztés',
        'Légrugózás',
        'Elektronikus futómű hangolás',
        'Módválasztó (Drive Select)',
        'Sportülések',
        'Sportkormány',
        'Kormányváltó (F1 váltó)',
        'Részecskeszűrő',
        'Start-Stop/Motormegállító rendszer',
        'Differenciálzár',
        'Összkerékhajtás (4WD/AWD)',
        'Kerámia fék'
    ],
    'Belső & Kárpit': [
        'Bőrkárpit',
        'Műbőr kárpit',
        'Alcantara kárpit',
        'Plüss kárpit',
        'Szövetkárpit',
        'Fekete tetőkárpit',
        'Bőr kormánykerék',
        'Faborítás',
        'Alumínium betét',
        'Zongoralakk betét',
        'Hangulatvilágítás',
        'Középső kartámasz',
        'Dönthető utasülések',
        'Síalagút'
    ]
}

export default function DealerModal({ car, onClose }: { car: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
      car.features ? [...car.features] : []
  )

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
        const margin = 10; // Kisebb margó

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

        // --- 1. KOMPAKT FEJLÉC ---
        const headerHeight = 22;
        doc.setFillColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        if (logoBase64) {
            try { doc.addImage(logoBase64, 'PNG', margin, 3, 16, 16); } catch (e) {}
        }

        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text("DynamicSense | Hivatalos Adatlap", pageWidth - margin, 10, { align: 'right' });
        doc.text(new Date().toLocaleDateString('hu-HU'), pageWidth - margin, 15, { align: 'right' });

        let yPos = headerHeight + 10;

        // --- 2. CÍM ÉS ÁR ---
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFontSize(20); 
        doc.setFont('Roboto', 'bold');
        doc.text(`${car.make} ${car.model}`, margin, yPos);
        
        const priceVal = formData.get('price') as string;
        if (priceVal) {
            const price = parseInt(priceVal).toLocaleString();
            doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
            doc.setFontSize(20); 
            doc.text(`${price} Ft`, pageWidth - margin, yPos, { align: 'right' });
        }

        yPos += 6;
        
        doc.setFontSize(9);
        doc.setTextColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
        doc.setFont('Roboto', 'normal');
        doc.text(`${car.plate}   |   DynamicSense Verified`, margin, yPos);

        yPos += 10;

        // --- 3. KOMPAKT SPECIFIKÁCIÓS SÁV ---
        const specYStart = yPos;
        const specHeight = 16;
        
        doc.setFillColor(COLORS.BG_LIGHT[0], COLORS.BG_LIGHT[1], COLORS.BG_LIGHT[2]);
        doc.roundedRect(margin, specYStart, pageWidth - (margin * 2), specHeight, 2, 2, 'F');

        const engineDetails = formData.get('engine_details') as string;
        const performance = formData.get('performance_hp') as string;
        const transmissionVal = formData.get('transmission') as string;
        
        const displayEngine = engineDetails || (car.engine_size ? `${car.engine_size}cc` : '-');
        const displayPower = performance ? `${performance}LE` : (car.power_hp ? `${car.power_hp}LE` : '-');
        const displayTransmission = transmissionVal || car.transmission || '-';

        const specs = [
            { l: 'ÉVJÁRAT', v: `${car.year}` },
            { l: 'KM ÓRA', v: `${car.mileage.toLocaleString()} km` },
            { l: 'ÜZEMANYAG', v: car.fuel_type },
            { l: 'MOTOR', v: `${displayEngine} ${displayPower}` },
            { l: 'VÁLTÓ', v: displayTransmission }
        ];

        const colW = (pageWidth - (margin * 2)) / 5;
        specs.forEach((s, i) => {
            const cX = margin + (i * colW) + (colW / 2);
            const cY = specYStart + 5;

            doc.setFontSize(6);
            doc.setTextColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
            doc.setFont('Roboto', 'bold');
            doc.text(s.l, cX, cY, { align: 'center' });

            doc.setFontSize(9);
            doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
            doc.setFont('Roboto', 'bold');
            doc.text(s.v, cX, cY + 5, { align: 'center' });
        });

        yPos += specHeight + 8;

        // --- 4. FELSZERELTSÉG (DINAMIKUS TÖRDELÉS) ---
        doc.setFontSize(11);
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFont('Roboto', 'bold');
        doc.text("FELSZERELTSÉG", margin, yPos);
        
        doc.setDrawColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos + 2, margin + 35, yPos + 2); 
        
        yPos += 6;

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

        // Helyszámítás: Ha túl sok, csökkentjük a betűméretet vagy oszlopokat váltunk
        const featFontSize = 7; 
        const featRowH = 4;
        const colCount = 4;
        const colWidthFeature = (pageWidth - (margin * 2)) / colCount;

        Object.entries(groupedFeatures).forEach(([category, feats]) => {
            if (yPos > pageHeight - 40) { 
                doc.addPage();
                yPos = 20; 
            }

            doc.setFontSize(8);
            doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
            doc.setFont('Roboto', 'bold');
            doc.text(category.toUpperCase(), margin, yPos);
            yPos += 4;

            doc.setFontSize(featFontSize);
            doc.setTextColor(COLORS.TEXT_MAIN[0], COLORS.TEXT_MAIN[1], COLORS.TEXT_MAIN[2]);
            doc.setFont('Roboto', 'normal');

            let colIndex = 0;
            const startYforCat = yPos;
            let rowsInCat = 0;

            feats.forEach((feat, index) => {
                const x = margin + (colIndex * colWidthFeature);
                const y = startYforCat + (rowsInCat * featRowH);

                if (y > pageHeight - 40) {
                     doc.addPage();
                     yPos = 20;
                }

                doc.setFillColor(COLORS.TEXT_LIGHT[0], COLORS.TEXT_LIGHT[1], COLORS.TEXT_LIGHT[2]);
                doc.circle(x + 1, y - 1, 0.5, 'F');
                doc.text(feat, x + 3.5, y); 

                colIndex++;
                if (colIndex >= colCount) {
                    colIndex = 0;
                    rowsInCat++;
                }
            });

            yPos += (rowsInCat + (colIndex > 0 ? 1 : 0)) * featRowH + 2; 
        });

        // --- 5. LÁBLÉC & QR (FIXEN AZ ALJÁN) ---
        if (yPos > pageHeight - 35) {
            doc.addPage();
        }

        const footerY = pageHeight - 30;

        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

        const verifyUrl = `${window.location.origin}/verify/${car.id}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 100, margin: 0 });
        doc.addImage(qrDataUrl, 'PNG', margin, footerY, 22, 22);

        const textX = margin + 28;
        const textY = footerY + 5;

        doc.setFontSize(9);
        doc.setTextColor(COLORS.DARK[0], COLORS.DARK[1], COLORS.DARK[2]);
        doc.setFont('Roboto', 'bold');
        doc.text("Hitelesített Járműtörténet", textX, textY);

        doc.setFontSize(7);
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
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] ring-1 ring-slate-200">
            
            {/* --- HEADER --- */}
            <div className="bg-slate-900 px-6 py-5 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-2.5 rounded-xl text-white shadow-lg">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl tracking-tight leading-none">Kereskedői Adatlap</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">Hivatalos, nyomtatható PDF generálás</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2.5 bg-white/5 rounded-full transition-colors hover:bg-white/10 group">
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
            </div>
            
            {/* --- SCROLLABLE CONTENT --- */}
            <form action={handleSaveAndGenerate} className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8 custom-scrollbar">
                <input type="hidden" name="id" value={car.id} />
                
                <div className="space-y-8 max-w-4xl mx-auto">
                    
                    {/* 1. ALAPADATOK CARD */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 group hover:border-slate-200 transition-colors">
                        <h4 className="text-slate-900 font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="bg-blue-50 text-blue-600 p-1.5 rounded-lg"><CarFront className="w-4 h-4" /></span> 
                            Jármű Adatai
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputGroup label="Eladási Ár" name="price" defaultValue={car.price} type="number" suffix="Ft" icon="💰" required min={0} onKeyDown={preventMinus} />
                            <InputGroup label="Motor" name="engine_details" defaultValue={car.engine_details || (car.engine_size ? `${car.engine_size} ccm` : '')} placeholder="pl. 2.0 TDI" icon={<Gauge className="w-4 h-4" />} />
                            
                            <InputGroup 
                                label="Teljesítmény" 
                                name="performance_hp" 
                                defaultValue={car.performance_hp || car.power_hp} 
                                type="number" 
                                suffix="LE" 
                                icon={<Zap className="w-4 h-4" />} 
                                min={0} 
                                onKeyDown={preventMinus} 
                            />

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Váltó</label>
                                <div className="relative">
                                    <select name="transmission" defaultValue={car.transmission || "Manuális"} className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-sm outline-none transition-all cursor-pointer hover:bg-white appearance-none">
                                        <option value="Manuális">Manuális</option>
                                        <option value="Automata">Automata</option>
                                        <option value="Félautomata">Félautomata</option>
                                        <option value="Fokozatmentes">CVT</option>
                                    </select>
                                    <Cog className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. FELSZERELTSÉG CARD */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                            <h4 className="text-slate-900 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg"><Tag className="w-4 h-4" /></span> 
                                Felszereltség
                            </h4>
                            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                {selectedFeatures.length} kiválasztva
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Object.entries(FEATURES_CATEGORIES).map(([category, items]) => (
                                <div key={category} className="space-y-3">
                                    <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-1">{category}</h5>
                                    <div className="space-y-1">
                                        {items.map(item => {
                                            const isSelected = selectedFeatures.includes(item);
                                            return (
                                                <div 
                                                    key={item} 
                                                    onClick={() => toggleFeature(item)}
                                                    className={`flex items-center gap-3 cursor-pointer group select-none px-3 py-2 rounded-xl border transition-all duration-200 ${isSelected ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                                    </div>
                                                    <span className={`text-xs ${isSelected ? 'font-bold text-emerald-900' : 'font-medium text-slate-600 group-hover:text-slate-900'}`}>{item}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* STICKY FOOTER */}
                <div className="sticky -bottom-8 -mx-8 px-8 py-5 bg-white/80 backdrop-blur-md border-t border-slate-200 mt-8 flex justify-end gap-3 z-20">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm">Mégsem</button>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all text-sm"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {loading ? 'Generálás...' : 'Mentés és Letöltés'}
                    </button>
                </div>
            </form>
        </div>
    </div>,
    document.body
  )
}

function InputGroup({ label, name, defaultValue, type = "text", placeholder, suffix, icon, required, min, onKeyDown }: any) {
    return (
        <div className="space-y-1.5 group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 transition-colors group-focus-within:text-blue-600">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input 
                    name={name} 
                    type={type} 
                    defaultValue={defaultValue} 
                    placeholder={placeholder}
                    required={required}
                    min={min}
                    onKeyDown={onKeyDown}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 py-3 pl-10 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-sm shadow-sm outline-none transition-all hover:bg-white focus:bg-white placeholder:text-slate-400 placeholder:font-normal" 
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    {typeof icon === 'string' ? <span className="text-lg leading-none">{icon}</span> : icon}
                </div>
                {suffix && (
                    <div className="absolute right-3 top-2.5 bg-white px-2 py-1 rounded-md text-xs font-bold text-slate-500 border border-slate-100 shadow-sm pointer-events-none">
                        {suffix}
                    </div>
                )}
            </div>
        </div>
    )
}