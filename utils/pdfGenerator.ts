import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─────────────────────────────────────────────────
// SEGÉDFÜGGVÉNYEK
// ─────────────────────────────────────────────────

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
}

const loadImageAsBase64 = async (url: string): Promise<{ data: string; fmt: string } | null> => {
    try {
        const res = await fetch(url)
        if (!res.ok) return null
        const buf = await res.arrayBuffer()
        const b64 = arrayBufferToBase64(buf)
        const ct = res.headers.get('content-type') || ''
        const fmt = ct.includes('jpeg') || ct.includes('jpg') ? 'JPEG' : 'PNG'
        return { data: `data:${ct};base64,${b64}`, fmt }
    } catch {
        return null
    }
}

const loadFont = async (url: string): Promise<string> => {
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    return arrayBufferToBase64(buf)
}

const formatHUF = (val: number) =>
    val
        ? new Intl.NumberFormat('hu-HU', {
              style: 'currency',
              currency: 'HUF',
              maximumFractionDigits: 0,
          }).format(val)
        : '—'

// ─────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────

const C = {
    DARK:       [15,  23,  42]  as [number,number,number], // Slate-900
    AMBER:      [245, 158, 11]  as [number,number,number], // Amber-500
    SLATE_700:  [51,  65,  85]  as [number,number,number],
    SLATE_500:  [100, 116, 139] as [number,number,number],
    SLATE_100:  [241, 245, 249] as [number,number,number],
    WHITE:      [255, 255, 255] as [number,number,number],
    INDIGO:     [99,  102, 241] as [number,number,number], // Indigo-500
    EMERALD:    [16,  185, 129] as [number,number,number], // Emerald-500
}

// ─────────────────────────────────────────────────
// SZEMÉLYES RIPORT – FŐ FÜGGVÉNY
// ─────────────────────────────────────────────────

export const generatePersonalPDF = async (car: any, allEvents: any[]) => {
    try {
        const serviceEvents = allEvents.filter(e => e.type === 'service')
        const fuelEvents    = allEvents.filter(e => e.type === 'fuel')

        // ── Statisztikák ──────────────────────────
        const totalServiceCost = serviceEvents.reduce((s, e) => s + (e.cost || 0), 0)
        const totalFuelCost    = fuelEvents.reduce((s, e) => s + (e.cost || 0), 0)
        const totalCost        = totalServiceCost + totalFuelCost
        const mileages         = allEvents.map(e => e.mileage).filter(m => m > 0)
        const distanceDriven   = mileages.length > 1
            ? (Math.max(...mileages) - Math.min(...mileages))
            : 0

        // ── PDF init ──────────────────────────────
        const doc = new jsPDF({ unit: 'mm', format: 'a4' })
        const PW  = doc.internal.pageSize.width   // 210
        const M   = 14 // margin

        // ── Fontok betöltése ──────────────────────
        const [fReg, fBold] = await Promise.all([
            loadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf'),
            loadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf'),
        ])
        doc.addFileToVFS('Roboto-Regular.ttf', fReg)
        doc.addFileToVFS('Roboto-Bold.ttf',    fBold)
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
        doc.addFont('Roboto-Bold.ttf',    'Roboto', 'bold')
        doc.setFont('Roboto')

        // ── Logó betöltése ────────────────────────
        const logoObj = await loadImageAsBase64(window.location.origin + '/DynamicSense-logo.png')
        const iconObj = await loadImageAsBase64(window.location.origin + '/icons/icon-512.png')

        // ═══════════════════════════════════════════
        // FEJLÉC (sötét sáv, 48mm)
        // ═══════════════════════════════════════════
        const headerH = 48
        doc.setFillColor(...C.DARK)
        doc.rect(0, 0, PW, headerH, 'F')

        // Decoratív accent vonal (amber)
        doc.setFillColor(...C.AMBER)
        doc.rect(0, headerH - 3, PW, 3, 'F')

        // Indigo accent szín – dekoráció
        doc.setFillColor(...C.INDIGO)
        doc.rect(0, headerH - 3, 60, 3, 'F')

        // Logó (ha elérhető)
        if (logoObj) {
            try { doc.addImage(logoObj.data, logoObj.fmt, M, 10, 52, 13) } catch {}
        } else if (iconObj) {
            try { doc.addImage(iconObj.data, iconObj.fmt, M, 8, 18, 18) } catch {}
            doc.setFont('Roboto', 'bold')
            doc.setFontSize(16)
            doc.setTextColor(...C.WHITE)
            doc.text('DynamicSense', M + 22, 20)
        }

        // Cím jobb oldalon
        doc.setFont('Roboto', 'bold')
        doc.setFontSize(18)
        doc.setTextColor(...C.AMBER)
        doc.text('SZEMÉLYES RIPORT', PW - M, 20, { align: 'right' })

        doc.setFont('Roboto', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(180, 195, 215)
        doc.text('SZERVIZTÖRTÉNETI JELENTÉS', PW - M, 28, { align: 'right' })

        const reportId = `DS-${car.id?.toString().slice(-5) || '00000'}-${Date.now().toString().slice(-6)}`
        doc.text(`Azonosító: #${reportId}`, PW - M, 34, { align: 'right' })
        doc.text(`Generálva: ${new Date().toLocaleDateString('hu-HU')}`, PW - M, 40, { align: 'right' })

        // ═══════════════════════════════════════════
        // JÁRMŰ ADATLAP PANEL (fehér kártya)
        // ═══════════════════════════════════════════
        let y = headerH + 10

        doc.setFont('Roboto', 'bold')
        doc.setFontSize(22)
        doc.setTextColor(...C.DARK)
        doc.text(`${car.make} ${car.model}`, M, y)

        doc.setFont('Roboto', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...C.SLATE_500)
        doc.text(`${car.plate || ''}   •   ${car.year || ''}   •   DynamicSense Verified`, M, y + 6)

        y += 14

        // Vékony elválasztó vonal
        doc.setDrawColor(220, 226, 234)
        doc.setLineWidth(0.3)
        doc.line(M, y, PW - M, y)
        y += 6

        // Adatok 2 oszlopos elrendezésben
        const col1x = M
        const col2x = PW / 2 + 4
        const rowH  = 8.5

        const fields: [string, string][] = [
            ['Rendszám',       car.plate || '—'],
            ['Alvázszám (VIN)', car.vin || '—'],
            ['Motor',          car.engine_size ? `${car.engine_size} cm³` : '—'],
            ['Aktuális km-óra', car.mileage ? `${car.mileage.toLocaleString()} km` : '—'],
        ]
        const fieldsR: [string, string][] = [
            ['Évjárat',         car.year?.toString() || '—'],
            ['Üzemanyag',       car.fuel_type || '—'],
            ['Teljesítmény',    car.power_hp ? `${car.power_hp} LE` : '—'],
            ['Szín',            car.color || '—'],
        ]

        fields.forEach(([lbl, val], i) => {
            doc.setFont('Roboto', 'normal')
            doc.setFontSize(8)
            doc.setTextColor(...C.SLATE_500)
            doc.text(lbl, col1x, y + i * rowH)

            doc.setFont('Roboto', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(...C.DARK)
            doc.text(val, col1x + 46, y + i * rowH)
        })

        fieldsR.forEach(([lbl, val], i) => {
            doc.setFont('Roboto', 'normal')
            doc.setFontSize(8)
            doc.setTextColor(...C.SLATE_500)
            doc.text(lbl, col2x, y + i * rowH)

            doc.setFont('Roboto', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(...C.DARK)
            doc.text(val, col2x + 46, y + i * rowH)
        })

        y += fields.length * rowH + 8

        // ═══════════════════════════════════════════
        // STATISZTIKA SÁV (3 kártya)
        // ═══════════════════════════════════════════
        const statCards = [
            { label: 'ÖSSZES KIADÁS',      value: formatHUF(totalCost),                   color: C.INDIGO },
            { label: 'ELVÉGZETT SZERVIZ',  value: `${serviceEvents.length} db`,            color: C.EMERALD },
            { label: 'DOKUMENTÁLT FUTÁS',  value: `${distanceDriven.toLocaleString()} km`, color: C.AMBER },
        ]

        const cardW = (PW - M * 2 - 6) / 3
        const cardH = 22

        statCards.forEach((card, i) => {
            const cx = M + i * (cardW + 3)

            // Kártya háttér
            doc.setFillColor(...C.SLATE_100)
            doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'F')

            // Accent felső sáv
            doc.setFillColor(...card.color)
            doc.roundedRect(cx, y, cardW, 2.5, 1, 1, 'F')

            // Label
            doc.setFont('Roboto', 'bold')
            doc.setFontSize(6.5)
            doc.setTextColor(...C.SLATE_500)
            doc.text(card.label, cx + cardW / 2, y + 8, { align: 'center' })

            // Value
            doc.setFont('Roboto', 'bold')
            doc.setFontSize(11)
            doc.setTextColor(...C.DARK)
            doc.text(card.value, cx + cardW / 2, y + 17, { align: 'center' })
        })

        y += cardH + 12

        // ═══════════════════════════════════════════
        // SZERVIZ TÁBLÁZAT
        // ═══════════════════════════════════════════
        doc.setFont('Roboto', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...C.DARK)
        doc.text('SZERVIZTÖRTÉNET', M, y)

        // Amber dekorációs vonal
        doc.setFillColor(...C.AMBER)
        doc.rect(M, y + 2.5, 38, 1.5, 'F')

        y += 8

        const tableBody = serviceEvents.map(e => {
            const desc = e.description?.trim() || e.title?.trim() || '—'
            return [
                new Date(e.event_date).toLocaleDateString('hu-HU'),
                desc,
                e.mileage ? `${e.mileage.toLocaleString()} km` : '—',
                e.cost ? formatHUF(e.cost) : '—',
            ]
        })

        if (tableBody.length === 0) {
            tableBody.push(['—', 'Nincs rögzített szerviz esemény', '—', '—'])
        }

        autoTable(doc, {
            startY: y,
            head: [['Dátum', 'Elvégzett munka / Leírás', 'Km-óra', 'Költség']],
            body: tableBody,
            theme: 'plain',
            headStyles: {
                fillColor:   C.DARK,
                textColor:   C.WHITE,
                fontStyle:   'bold',
                font:        'Roboto',
                halign:      'left',
                fontSize:    9,
                cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
            },
            bodyStyles: {
                font:      'Roboto',
                textColor: C.SLATE_700,
                fontSize:  9,
                cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
                valign:    'top',
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] as [number, number, number],
            },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 32, halign: 'right' },
                3: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
            },
            styles: {
                overflow:  'linebreak',
                cellWidth: 'wrap',
                lineColor: [226, 232, 240] as [number, number, number],
                lineWidth: 0.2,
            },
            // Minden oldalon fejléc + lábléc
            didDrawPage: (data) => {
                const pageH = doc.internal.pageSize.height
                const pageN = doc.getNumberOfPages()

                // Minden oldal alján lábléc
                doc.setFont('Roboto', 'normal')
                doc.setFontSize(7.5)
                doc.setTextColor(...C.SLATE_500)
                doc.text(
                    `DynamicSense | dynamicsense.hu | Riport: #${reportId}`,
                    M,
                    pageH - 8
                )
                doc.text(
                    `Oldal ${pageN}`,
                    PW - M,
                    pageH - 8,
                    { align: 'right' }
                )

                // Amber lábléc vonal
                doc.setDrawColor(...C.AMBER)
                doc.setLineWidth(0.5)
                doc.line(M, pageH - 11, PW - M, pageH - 11)
            },
        })

        // ── Összesítő sor a táblázat után ────────────────
        const finalY = (doc as any).lastAutoTable?.finalY || y + 30
        const totalServiceOnly = serviceEvents.reduce((s, e) => s + (e.cost || 0), 0)

        if (totalServiceOnly > 0) {
            doc.setFont('Roboto', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...C.DARK)
            doc.text('Szerviz összesen:', PW - M - 60, finalY + 10, { align: 'left' })

            doc.setTextColor(...C.AMBER)
            doc.setFontSize(12)
            doc.text(formatHUF(totalServiceOnly), PW - M, finalY + 10, { align: 'right' })
        }

        // ─────────────────────────────────────────────────
        // MENTÉS
        // ─────────────────────────────────────────────────
        const fileName = `DynamicSense_Szerviz_${car.make}_${car.model}_${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)

    } catch (error) {
        console.error('PDF Generálási Hiba:', error)
        throw error
    }
}