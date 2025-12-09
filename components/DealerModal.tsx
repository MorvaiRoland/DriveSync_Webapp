'use client'

import { useState } from 'react'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

// Segédfüggvény a Base64 konverzióhoz
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export default function DealerModal({ car, onClose }: { car: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleSaveAndGenerate = async (formData: FormData) => {
    setLoading(true)
    
    // 1. Mentés (opcionális hibaellenőrzéssel)
    try {
        await updateDealerInfo(formData)
    } catch (error) {
        console.error("Mentési hiba:", error)
    }

    // 2. PDF Generálás
    try {
        const doc = new jsPDF()
        
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontRes = await fetch(fontUrl);
        const fontBuffer = await fontRes.arrayBuffer();
        doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(fontBuffer));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');

        // --- PDF DESIGN ---
        doc.setFillColor(15, 23, 42)
        doc.rect(0, 0, 210, 60, 'F') // Nagyobb fejléc
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(30) // Nagyobb betű
        doc.text(`${car.make} ${car.model}`, 105, 25, { align: 'center' })
        
        const engine = formData.get('engine_details') as string
        if (engine) {
            doc.setFontSize(16)
            doc.setTextColor(245, 158, 11)
            doc.text(engine, 105, 40, { align: 'center' })
        }

        const priceVal = formData.get('price') as string
        if (priceVal) {
            const price = parseInt(priceVal).toLocaleString()
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(50) // Hatalmas ár
            doc.text(`${price} Ft`, 105, 90, { align: 'center' })
        }

        doc.setFontSize(14)
        doc.setTextColor(80, 80, 80)
        const yStart = 120
        
        // Bal oszlop
        doc.text(`Évjárat:`, 30, yStart)
        doc.setFontSize(14); doc.setTextColor(0,0,0); 
        doc.text(`${car.year}`, 70, yStart); doc.setTextColor(80,80,80);

        doc.text(`Üzemanyag:`, 30, yStart + 15)
        doc.setFontSize(14); doc.setTextColor(0,0,0);
        doc.text(`${car.fuel_type}`, 70, yStart + 15); doc.setTextColor(80,80,80);

        // Jobb oszlop
        doc.text(`Futásteljesítmény:`, 110, yStart)
        doc.setFontSize(14); doc.setTextColor(0,0,0);
        doc.text(`${car.mileage.toLocaleString()} km`, 160, yStart); doc.setTextColor(80,80,80);

        doc.text(`Váltó:`, 110, yStart + 15)
        doc.setFontSize(14); doc.setTextColor(0,0,0);
        doc.text(`${formData.get('transmission') || '-'}`, 160, yStart + 15); doc.setTextColor(80,80,80);
        
        // Extrák
        const features = (formData.get('features') as string)?.split(',')
        if (features && features.length > 0 && features[0] !== "") {
            doc.setFontSize(16)
            doc.setTextColor(0, 0, 0)
            doc.text("Kiemelt Felszereltség:", 105, yStart + 45, { align: 'center' })
            
            doc.setFontSize(12)
            doc.setTextColor(50, 50, 50)
            let yFeat = yStart + 60
            let xPos = 40
            
            // Két oszlopba rendezés
            features.forEach((feat, i) => {
                if(feat.trim()) {
                    if (i % 2 === 0) xPos = 40; else xPos = 120;
                    doc.text(`• ${feat.trim()}`, xPos, yFeat)
                    if (i % 2 !== 0) yFeat += 10;
                }
            })
        }

        // QR Kód (Lent középen)
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
        alert('Hiba történt a generáláskor.')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        {/* MODAL KONTÉNER: Szélesebb (max-w-2xl) és reszponzív */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 px-6 py-5 flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-white font-bold text-xl">Kereskedői Adatlap Beállítása</h3>
                    <p className="text-slate-400 text-xs mt-1">Add meg az eladási adatokat a nyomtatáshoz.</p>
                </div>
                <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <form action={handleSaveAndGenerate} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <input type="hidden" name="id" value={car.id} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Eladási Ár (Ft)</label>
                        <div className="relative">
                            <input name="price" type="number" defaultValue={car.price} className="w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-4 pr-12 focus:ring-amber-500 focus:border-amber-500 font-bold text-lg" placeholder="0" />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 font-bold">Ft</div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Teljesítmény</label>
                        <div className="relative">
                            <input name="performance_hp" type="number" defaultValue={car.performance_hp} className="w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-4 pr-12 focus:ring-amber-500 focus:border-amber-500" placeholder="0" />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 font-bold">LE</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Motor megnevezés</label>
                        <input name="engine_details" type="text" defaultValue={car.engine_details} className="w-full rounded-xl border-slate-300 bg-slate-50 py-3 px-4 focus:ring-amber-500 focus:border-amber-500" placeholder="Pl. 2.0 TDI BlueMotion" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Váltó</label>
                        <select name="transmission" defaultValue={car.transmission} className="w-full rounded-xl border-slate-300 bg-slate-50 py-3 px-4 focus:ring-amber-500 focus:border-amber-500">
                            <option value="Manuális">Manuális</option>
                            <option value="Automata">Automata</option>
                            <option value="Félautomata">Félautomata</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Extrák (Vesszővel elválasztva)</label>
                    <textarea 
                        name="features" 
                        defaultValue={car.features?.join(', ')} 
                        className="w-full rounded-xl border-slate-300 bg-slate-50 p-4 h-32 text-sm focus:ring-amber-500 focus:border-amber-500" 
                        placeholder="Pl. Digitklíma, Ülésfűtés, Tolatóradar, LED fényszóró, Tempomat..."
                    ></textarea>
                    <p className="text-[10px] text-slate-400 mt-1 ml-1">Tipp: Sorold fel a legfontosabbakat, ezek jelennek meg a nyomtatványon.</p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Mégsem</button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2 transition-all transform active:scale-95"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Generálás...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Mentés és Nyomtatás
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}