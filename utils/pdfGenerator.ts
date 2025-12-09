import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export const generatePersonalPDF = async (car: any, events: any[]) => {
    try {
        const doc = new jsPDF()

        // Font betöltése
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const response = await fetch(fontUrl);
        const buffer = await response.arrayBuffer();
        doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(buffer));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');

        // Fejléc
        doc.setFillColor(15, 23, 42) // Slate-900
        doc.rect(0, 0, 210, 40, 'F') 
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(22)
        doc.text("DriveSync - Személyes Export", 14, 20)
        
        doc.setFontSize(10)
        doc.setTextColor(245, 158, 11) // Amber-500
        doc.text("TELJES ELŐZMÉNY (SZERVIZ + TANKOLÁS)", 14, 28)

        // Autó adatok
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(16)
        doc.text(`${car.make} ${car.model} (${car.plate})`, 14, 55)
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Generálva: ${new Date().toLocaleDateString('hu-HU')}`, 14, 62)

        // Adatok táblázatba rendezése (MINDEN típus)
        const tableData = events.map(e => {
            let typeLabel = 'Egyéb';
            if (e.type === 'service') typeLabel = 'Szerviz';
            if (e.type === 'repair') typeLabel = 'Javítás';
            if (e.type === 'fuel') typeLabel = 'Tankolás';
            if (e.type === 'maintenance') typeLabel = 'Karbantartás';

            // Leírás formázása
            let desc = e.title || '';
            if (e.type === 'fuel') desc = `${e.liters}L Üzemanyag`;
            if (e.description) desc += ` - ${e.description}`;

            return [
                new Date(e.event_date).toLocaleDateString('hu-HU'),
                typeLabel,
                desc,
                e.mileage ? `${e.mileage.toLocaleString()} km` : '-',
                e.cost ? `${e.cost.toLocaleString()} Ft` : '-'
            ]
        })

        autoTable(doc, {
          startY: 70,
          head: [['Dátum', 'Típus', 'Leírás', 'Km Állás', 'Költség']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [50, 50, 50], font: 'Roboto' },
          bodyStyles: { font: 'Roboto' },
          styles: { fontSize: 9, font: 'Roboto' },
        })

        doc.save(`${car.make}_Teljes_Elozmeny.pdf`)

    } catch (error) {
        console.error("PDF Hiba:", error)
        throw error;
    }
}