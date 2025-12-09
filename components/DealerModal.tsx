'use client'

import { useState } from 'react'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

export default function DealerModal({ car, onClose }: { car: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  
  // ArrayBuffer to Base64 segédfüggvény (fontokhoz)
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
  }

  const handleSaveAndGenerate = async (formData: FormData) => {
    setLoading(true)
    
    // 1. Mentés az adatbázisba
    await updateDealerInfo(formData)

    // 2. PDF Generálás (Client Side)
    try {
        const doc = new jsPDF()
        
        // Font betöltése (hogy szép legyen)
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontRes = await fetch(fontUrl);
        const fontBuffer = await fontRes.arrayBuffer();
        doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(fontBuffer));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');

        // --- DESIGN ---
        
        // Fejléc
        doc.setFillColor(30, 41, 59) // Slate-800
        doc.rect(0, 0, 210, 50, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(28)
        doc.text(`${car.make} ${car.model}`, 105, 25, { align: 'center' })
        
        doc.setFontSize(14)
        doc.setTextColor(245, 158, 11) // Amber-500
        doc.text(formData.get('engine_details') as string || '', 105, 35, { align: 'center' })

        // Ár (Nagyban)
        const price = formData.get('price') ? parseInt(formData.get('price') as string).toLocaleString() : '-'
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(40)
        doc.text(`${price} Ft`, 105, 75, { align: 'center' })

        // Fő adatok rácsban
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        
        const yStart = 90
        doc.text(`Évjárat: ${car.year}`, 20, yStart)
        doc.text(`Futásteljesítmény: ${car.mileage.toLocaleString()} km`, 110, yStart)
        
        doc.text(`Üzemanyag: ${car.fuel_type}`, 20, yStart + 10)
        doc.text(`Teljesítmény: ${formData.get('performance_hp') || '-'} LE`, 110, yStart + 10)
        
        doc.text(`Váltó: ${formData.get('transmission') || '-'}`, 20, yStart + 20)
        doc.text(`Rendszám: ${car.plate}`, 110, yStart + 20)

        // Extrák felsorolása
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text("Kiemelt Extrák:", 20, yStart + 45)
        
        doc.setFontSize(11)
        doc.setTextColor(50, 50, 50)
        const features = (formData.get('features') as string).split(',')
        let yFeat = yStart + 55
        
        features.forEach((feat) => {
            if(feat.trim()) {
                doc.text(`• ${feat.trim()}`, 25, yFeat)
                yFeat += 7
            }
        })

        // QR Kód (AZ ALJA)
        // Ez visz a hitelesített oldalra (ahol ott a szerviztörténet is)
        const verifyUrl = `${window.location.origin}/verify/${car.id}`
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 150, margin: 1 })
        
        doc.addImage(qrDataUrl, 'PNG', 75, 200, 60, 60)
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text("Olvassa be a teljes, hitelesített szerviztörténetért!", 105, 270, { align: 'center' })
        
        doc.save(`${car.make}_Adatlap.pdf`)
        onClose()

    } catch (err) {
        console.error(err)
        alert('Hiba történt a generáláskor')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Kereskedői Adatlap</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form action={handleSaveAndGenerate} className="p-6 space-y-4">
                <input type="hidden" name="id" value={car.id} />
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Eladási Ár (Ft)</label>
                        <input name="price" type="number" defaultValue={car.price} className="w-full rounded-lg border-slate-300" placeholder="Pl. 4500000" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teljesítmény (LE)</label>
                        <input name="performance_hp" type="number" defaultValue={car.performance_hp} className="w-full rounded-lg border-slate-300" placeholder="Pl. 150" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motor (Pl. 2.0 TDI)</label>
                        <input name="engine_details" type="text" defaultValue={car.engine_details} className="w-full rounded-lg border-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Váltó</label>
                        <select name="transmission" defaultValue={car.transmission} className="w-full rounded-lg border-slate-300">
                            <option value="Manuális">Manuális</option>
                            <option value="Automata">Automata</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Extrák (Vesszővel elválasztva)</label>
                    <textarea 
                        name="features" 
                        defaultValue={car.features?.join(', ')} 
                        className="w-full rounded-lg border-slate-300 h-24 text-sm" 
                        placeholder="Pl. Digitklíma, Ülésfűtés, Tolatóradar, ..."
                    ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg">Mégsem</button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg shadow-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Generálás...' : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Adatlap Nyomtatása
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}