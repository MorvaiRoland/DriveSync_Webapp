'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { X, Check, CarFront, Gauge, Zap, Cog, Tag, FileText, Download, Loader2 } from 'lucide-react'

// --- SEGÉDFÜGGVÉNYEK ---
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

const loadImgB64 = async (url: string): Promise<{ data: string; fmt: string } | null> => {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const b64 = arrayBufferToBase64(buf);
        const ct  = res.headers.get('content-type') || '';
        const fmt = (ct.includes('jpeg') || ct.includes('jpg')) ? 'JPEG' : 'PNG';
        return { data: `data:${ct};base64,${b64}`, fmt };
    } catch { return null; }
}

const preventMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
    }
};

// --- KONFIGURÁCIÓ ---
const COLORS = {
    DARK:       [15,  23,  42]  as [number,number,number], // Slate-900
    DARK2:      [30,  41,  59]  as [number,number,number], // Slate-800
    ACCENT:     [245, 158, 11]  as [number,number,number], // Amber-500
    ACCENT_D:   [217, 119,  6]  as [number,number,number], // Amber-600
    TEXT_MAIN:  [51,  65,  85]  as [number,number,number], // Slate-700
    TEXT_LIGHT: [100, 116, 139] as [number,number,number], // Slate-500
    BG_LIGHT:   [241, 245, 249] as [number,number,number], // Slate-100
    WHITE:      [255, 255, 255] as [number,number,number],
    EMERALD:    [16,  185, 129] as [number,number,number], // Emerald-500
}

const FEATURES_CATEGORIES: Record<string, string[]> = {
    'Biztonság': [
        'ABS (blokkolásgátló)', 'ASR (kipörgésgátló)', 'ESP (menetstabilizátor)',
        'EBD/EBV (fékerő-elosztó)', 'MSR (motorféknyomaték szab.)',
        'Vezetőoldali légzsák', 'Utasoldali légzsák', 'Oldallégzsák', 'Függönylégzsák', 'Térdlégzsák',
        'Hátsó oldallégzsák', 'Kikapcsolható utaslégzsák', 'ISOFIX rendszer', 
        'Guminyomás-ellenőrző', 'Sávtartó rendszer', 'Sávváltó asszisztens',
        'Holttér-figyelő', 'Tábla-felismerő', 'Vészfék asszisztens', 
        'Fáradtságérzékelő', 'Lejtmenet asszisztens', 'Visszagurulás-gátló',
        'Hátsó keresztirányú forgalomfigyelő', 'Éjjellátó asszisztens', 'Gyalogosvédelem',
        'Riasztó', 'Indításgátló (immobiliser)', 'Központi zár', 'Gyerekzár'
    ],
    'Kényelem': [
        'Manuális klíma', 'Automata klíma', 'Digitális kétzónás klíma', 'Digitális többzónás klíma',
        'Állófűtés', 'Szervokormány', 'Sebességfüggő szervó', 'Tempomat', 
        'Adaptív tempomat (ACC)', 'Kulcsnélküli nyitás', 'Kulcsnélküli indítás', 'Start-Stop rendszer',
        'Ülésfűtés (elöl)', 'Ülésfűtés (hátul)', 'Ülésszellőztetés', 'Masszírozós ülés',
        'El. ülésállítás (vezető)', 'El. ülésállítás (utas)',
        'Memóriás vezetőülés', 'Deréktámasz', 'Combtámasz', 'Kormányfűtés', 
        'Elektromos ablak elöl', 'Elektromos ablak hátul', 'Elektromos tükör', 'Fűthető tükör',
        'Auto. sötétedő belső tükör', 'Auto. sötétedő külső tükör',
        'El. behajtható tükrök', 'El. csomagtérajtó',
        'Lábbal nyitható csomagtér', 'Hűthető kesztyűtartó', 'Hűthető kartámasz',
        'Állítható kormány', 'Soft-close'
    ],
    'Multimédia & Navigáció': [
        'Navigációs rendszer', 'Bluetooth kihangosító', 'Android Auto', 'Apple CarPlay', 
        'MirrorLink', 'USB csatlakozó', 'AUX csatlakozó', '12V csatlakozó', '230V csatlakozó',
        'MP3 lejátszás', 'Hi-Fi', 'Prémium hangrendszer', 'Mélynyomó',
        'Érintőkijelző', 'Digitális műszerfal', 'HUD (Head-Up Display)', 'Vezeték nélküli töltő',
        'Hangvezérlés', 'Gesztusvezérlés', 'Wi-Fi Hotspot', 'Multifunkciós kormánykerék',
        'Hátsó szórakoztató rendszer'
    ],
    'Külső & Világítás': [
        'Könnyűfém felni', 'Acélfelni', 'Metálfény', 'LED fényszóró', 'LED mátrix fényszóró', 
        'Lézer fényszóró', 'Bi-Xenon fényszóró', 'Xenon fényszóró', 'Halogén fényszóró',
        'Kanyarkövető fényszóró', 'Kiegészítő fényszóró', 'Ködlámpa', 'Távolsági fényszóró asszisztens',
        'Menetfény', 'Hazakísérő fény', 'Esőszenzor', 'Fényérzékelő', 'Fényszórómosó',
        'Fűthető szélvédő', 'Fűthető ablakmosó fúvókák', 'Tolatóradar', 'Első-hátsó parkolóradar',
        'Parkolóasszisztens', 'Tolatókamera', '360° kamera', 'Elektromos napfénytető', 
        'Panorámatető', 'Nyitható panorámatető', 'Sötétített üvegezés', 'Hővédő üvegezés',
        'Tetősín', 'Vonóhorog', 'Elektromos vonóhorog', 'Pótkerék', 'Defektjavító készlet'
    ],
    'Műszaki & Sport': [
        'Sportfutómű', 'Állítható felfüggesztés', 'Légrugózás', 'Elektronikus futómű hangolás',
        'Módválasztó (Drive Select)', 'Sportülések', 'Sportkormány', 'Kormányváltó (F1 váltó)',
        'Részecskeszűrő', 'Start-Stop rendszer', 'Differenciálzár',
        'Összkerékhajtás (4WD)', 'Kerámia fék'
    ],
    'Belső & Kárpit': [
        'Bőrkárpit', 'Műbőr kárpit', 'Alcantara kárpit', 'Plüss kárpit', 'Szövetkárpit',
        'Fekete tetőkárpit', 'Bőr kormánykerék', 'Faborítás', 'Alumínium betét',
        'Zongoralakk betét', 'Hangulatvilágítás', 'Középső kartámasz', 'Dönthető utasülések', 'Síalagút'
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

  // --- PDF GENERÁLÁS – PROFI KERESKEDŐI ADATLAP ---
  const handleSaveAndGenerate = async (formData: FormData) => {
    setLoading(true)
    formData.set('features', selectedFeatures.join(','))

    try {
        await updateDealerInfo(formData)
    } catch (error) {
        console.error('Adatbázis mentési hiba:', error)
    }

    try {
        const doc  = new jsPDF({ unit: 'mm', format: 'a4' })
        const PW   = doc.internal.pageSize.width   // 210
        const PH   = doc.internal.pageSize.height  // 297
        const M    = 12

        // ── FONTOK ─────────────────────────────────────────────────────────────
        const [fRegBuf, fBoldBuf] = await Promise.all([
            fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf').then(r => r.arrayBuffer()),
            fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf').then(r => r.arrayBuffer()),
        ])
        doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(fRegBuf))
        doc.addFileToVFS('Roboto-Bold.ttf',    arrayBufferToBase64(fBoldBuf))
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
        doc.addFont('Roboto-Bold.ttf',    'Roboto', 'bold')
        doc.setFont('Roboto')

        // ── KÉPEK ──────────────────────────────────────────────────────────────
        const [logoObj, carImgObj] = await Promise.all([
            loadImgB64(window.location.origin + '/DynamicSense-logo.png'),
            car.image_url ? loadImgB64(car.image_url) : Promise.resolve(null),
        ])

        // ══════════════════════════════════════════════════════════════════════
        // 1. FEJLÉC – sötét gradiens + amber ár
        // ══════════════════════════════════════════════════════════════════════
        const headerH = 52

        // Sötét alap
        doc.setFillColor(...COLORS.DARK)
        doc.rect(0, 0, PW, headerH, 'F')

        // Sötétebb sáv jobbra (gradiens hatás)
        doc.setFillColor(...COLORS.DARK2)
        doc.rect(PW / 2, 0, PW / 2, headerH, 'F')

        // Amber accent alul
        doc.setFillColor(...COLORS.ACCENT)
        doc.rect(0, headerH - 3, PW, 3, 'F')

        // Logó
        if (logoObj) {
            try { doc.addImage(logoObj.data, logoObj.fmt, M, 12, 52, 13) } catch {}
        } else {
            doc.setFont('Roboto', 'bold')
            doc.setFontSize(14)
            doc.setTextColor(...COLORS.WHITE)
            doc.text('DynamicSense', M, 22)
        }

        // Badgek bal oldalon (alul)
        doc.setFontSize(6.5)
        doc.setFont('Roboto', 'bold')
        doc.setTextColor(180, 195, 215)
        doc.text('KERESKEDŐI ADATLAP  •  HIVATALOS DOKUMENTUM', M, headerH - 8)
        doc.text(new Date().toLocaleDateString('hu-HU'), M, headerH - 4)

        // ÁR jobb oldalon – nagy kiemelés
        const priceVal = formData.get('price') as string
        if (priceVal && parseInt(priceVal) > 0) {
            const priceFormatted = new Intl.NumberFormat('hu-HU').format(parseInt(priceVal))
            doc.setFont('Roboto', 'bold')
            doc.setFontSize(6)
            doc.setTextColor(...COLORS.ACCENT)
            doc.text('ELADÁSI ÁR', PW - M, 14, { align: 'right' })
            doc.setFontSize(26)
            doc.setTextColor(...COLORS.ACCENT)
            doc.text(`${priceFormatted} Ft`, PW - M, 30, { align: 'right' })
            doc.setFont('Roboto', 'normal')
            doc.setFontSize(7)
            doc.setTextColor(180, 195, 215)
            doc.text('Bruttó ár, ÁFA-val', PW - M, 37, { align: 'right' })
        } else {
            doc.setFont('Roboto', 'bold')
            doc.setFontSize(14)
            doc.setTextColor(...COLORS.ACCENT)
            doc.text('Ár igény szerint', PW - M, 28, { align: 'right' })
        }

        let y = headerH + 10

        // ══════════════════════════════════════════════════════════════════════
        // 2. JÁRMŰ AZONOSÍTÓ + KÉP PANEL
        // ══════════════════════════════════════════════════════════════════════
        const engineDetails    = formData.get('engine_details') as string
        const performanceHP    = formData.get('performance_hp') as string
        const transmissionVal  = formData.get('transmission') as string
        const displayEngine    = engineDetails || (car.engine_size ? `${car.engine_size} ccm` : '—')
        const displayPower     = performanceHP  ? `${performanceHP} LE` : (car.power_hp ? `${car.power_hp} LE` : '—')
        const displayTransmit  = transmissionVal || car.transmission || '—'

        // Autó neve
        doc.setFont('Roboto', 'bold')
        doc.setFontSize(24)
        doc.setTextColor(...COLORS.DARK)
        doc.text(`${car.make} ${car.model}`, M, y)

        doc.setFont('Roboto', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...COLORS.TEXT_LIGHT)
        doc.text(`${car.plate}   •   ${car.year}   •   ${car.fuel_type}   •   DynamicSense Verified ✓`, M, y + 7)

        // Autó kép (ha van)
        if (carImgObj) {
            const imgW = 68
            const imgH = 46
            const imgX = PW - M - imgW
            const imgY = y - 8
            try {
                doc.addImage(carImgObj.data, carImgObj.fmt, imgX, imgY, imgW, imgH)
                // Keret
                doc.setDrawColor(226, 232, 240)
                doc.setLineWidth(0.3)
                doc.roundedRect(imgX, imgY, imgW, imgH, 2, 2, 'S')
            } catch {}
        }

        y += 16

        // ══════════════════════════════════════════════════════════════════════
        // 3. SPEC SÁV
        // ══════════════════════════════════════════════════════════════════════
        const specs = [
            { l: 'ÉVJÁRAT',    v: `${car.year}` },
            { l: 'KM-ÓRA',    v: `${car.mileage.toLocaleString()} km` },
            { l: 'ÜZEMANYAG', v: car.fuel_type },
            { l: 'MOTOR',     v: displayEngine },
            { l: 'TELJ.',     v: displayPower },
            { l: 'VÁLTÓ',     v: displayTransmit },
        ]

        const specW   = (PW - M * 2) / specs.length
        const specH   = 18
        const specY   = y

        doc.setFillColor(...COLORS.BG_LIGHT)
        doc.roundedRect(M, specY, PW - M * 2, specH, 2, 2, 'F')

        specs.forEach((s, i) => {
            const cx = M + i * specW + specW / 2

            // Elválasztó (kivéve utolsónál)
            if (i > 0) {
                doc.setDrawColor(210, 218, 228)
                doc.setLineWidth(0.2)
                doc.line(M + i * specW, specY + 3, M + i * specW, specY + specH - 3)
            }

            doc.setFont('Roboto', 'bold')
            doc.setFontSize(5.5)
            doc.setTextColor(...COLORS.TEXT_LIGHT)
            doc.text(s.l, cx, specY + 6, { align: 'center' })

            doc.setFont('Roboto', 'bold')
            doc.setFontSize(8)
            doc.setTextColor(...COLORS.DARK)
            doc.text(s.v, cx, specY + 13, { align: 'center' })
        })

        y += specH + 10

        // ══════════════════════════════════════════════════════════════════════
        // 4. FELSZERELTSÉG
        // ══════════════════════════════════════════════════════════════════════
        doc.setFont('Roboto', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...COLORS.DARK)
        doc.text('FELSZERELTSÉG', M, y)

        doc.setFillColor(...COLORS.ACCENT)
        doc.rect(M, y + 2.5, 42, 1.5, 'F')

        if (selectedFeatures.length === 0) {
            doc.setFont('Roboto', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(...COLORS.TEXT_LIGHT)
            doc.text('Nincs megadott felszereltség.', M, y + 12)
            y += 20
        } else {
            y += 8

            // Csoportosítás
            const grouped: Record<string, string[]> = {}
            const other: string[] = []
            let totalCount = 0

            selectedFeatures.forEach(feat => {
                let found = false
                for (const [cat, items] of Object.entries(FEATURES_CATEGORIES)) {
                    if (items.includes(feat)) {
                        if (!grouped[cat]) grouped[cat] = []
                        grouped[cat].push(feat)
                        found = true
                        totalCount++
                        break
                    }
                }
                if (!found) { other.push(feat); totalCount++ }
            })
            if (other.length > 0) grouped['EGYÉB'] = other

            // Dinamikus betűméret
            let fSize  = 7.5, lH = 5
            if (totalCount > 120)      { fSize = 6;   lH = 3 }
            else if (totalCount > 80)  { fSize = 6.5; lH = 3.5 }
            else if (totalCount > 50)  { fSize = 7;   lH = 4.5 }

            const colN  = 3
            const colW2 = (PW - M * 2) / colN

            const footerReserve = 36

            Object.entries(grouped).forEach(([cat, feats]) => {
                if (y > PH - footerReserve - 10) return

                // Kategória fejléc
                doc.setFont('Roboto', 'bold')
                doc.setFontSize(7)
                doc.setTextColor(...COLORS.ACCENT)
                doc.text(cat.toUpperCase(), M, y)
                y += 3.5

                // Felszereltség elemek 3 oszlopban
                doc.setFont('Roboto', 'normal')
                doc.setFontSize(fSize)
                doc.setTextColor(...COLORS.TEXT_MAIN)

                const rows = Math.ceil(feats.length / colN)
                for (let r = 0; r < rows; r++) {
                    if (y > PH - footerReserve) break
                    for (let c = 0; c < colN; c++) {
                        const idx = r * colN + c
                        if (idx >= feats.length) break
                        const x = M + c * colW2
                        doc.setFillColor(...COLORS.EMERALD)
                        doc.circle(x + 1.2, y - 1.2, 0.7, 'F')
                        doc.text(feats[idx], x + 3.5, y)
                    }
                    y += lH
                }
                y += 2
            })
        }

        // ══════════════════════════════════════════════════════════════════════
        // 5. LÁBLÉC + QR KÓD (fix pozíció alul)
        // ══════════════════════════════════════════════════════════════════════
        const footerY = PH - 34

        // Fehér fedőréteg (ha esetleg rálóg a felszereltség)
        doc.setFillColor(255, 255, 255)
        doc.rect(0, footerY - 4, PW, 40, 'F')

        // Elválasztó vonal
        doc.setDrawColor(...COLORS.ACCENT)
        doc.setLineWidth(0.7)
        doc.line(M, footerY - 2, PW - M, footerY - 2)

        // Sötét lábléc sáv
        doc.setFillColor(...COLORS.DARK)
        doc.roundedRect(M, footerY + 1, PW - M * 2, 28, 2, 2, 'F')

        // QR kód generálás
        const verifyUrl = `${window.location.origin}/verify/${car.id}`
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 })
        const qrSize    = 22
        const qrX       = M + 4
        const qrY       = footerY + 3.5

        // QR fehér háttér
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1.5, 1.5, 'F')
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

        // Szöveg a QR mellé
        const tX = qrX + qrSize + 6
        const tY = footerY + 9

        doc.setFont('Roboto', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(...COLORS.WHITE)
        doc.text('Hitelesített Járműtörténet', tX, tY)

        doc.setFont('Roboto', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(160, 180, 210)
        doc.text('Olvassa be a QR-kódot az autó digitális szervizkönyvéért,', tX, tY + 5.5)
        doc.text('futásteljesítmény-grafikonjáért és hiteles dokumentumaiért.', tX, tY + 9.5)

        // DynamicSense badge jobb oldalon
        doc.setFont('Roboto', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...COLORS.ACCENT)
        doc.text('Powered by DynamicSense', PW - M - 4, footerY + 10, { align: 'right' })
        doc.setFont('Roboto', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(130, 155, 185)
        doc.text('dynamicsense.hu', PW - M - 4, footerY + 15.5, { align: 'right' })

        // MENTÉS
        doc.save(`${car.make}_${car.model}_Adatlap.pdf`)
        onClose()

    } catch (err) {
        console.error('PDF Hiba:', err)
        alert('Hiba történt a PDF generálás közben.')
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