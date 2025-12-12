import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// --- SEGÉDFÜGGVÉNYEK ---

// Kép betöltése URL-ből és Base64 konvertálás (Javított verzió)
const loadImage = async (url: string): Promise<{ data: string, format: string } | null> => {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn(`Kép betöltési hiba (${response.status}): ${url}`);
            return null;
        }

        const blob = await response.blob();
        
        // Ellenőrizzük, hogy tényleg kép-e
        if (!blob.type.startsWith('image/')) {
            console.warn(`A letöltött fájl nem kép: ${url} (${blob.type})`);
            return null;
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                let format = 'PNG';
                if (base64data.includes('image/jpeg') || base64data.includes('image/jpg')) {
                    format = 'JPEG';
                }
                resolve({ data: base64data, format });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("Logo betöltése sikertelen:", e);
        return null;
    }
}

// Font betöltése ArrayBuffer-be
const loadFont = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Pénz formázó
const formatCurrency = (val: number) => {
    return val ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val) : '-';
}

// --- FŐ GENERÁTOR FÜGGVÉNY ---

export const generatePersonalPDF = async (car: any, events: any[]) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // 1. FONTOK BETÖLTÉSE
        const fontRegular = await loadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
        const fontBold = await loadFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf');

        doc.addFileToVFS('Roboto-Regular.ttf', fontRegular);
        doc.addFileToVFS('Roboto-Bold.ttf', fontBold);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        doc.setFont('Roboto');

        // 2. ADATOK ELŐKÉSZÍTÉSE
        const totalCost = events.reduce((sum, e) => sum + (e.cost || 0), 0);
        
        const mileages = events.map(e => e.mileage).filter(m => m > 0);
        const distanceDriven = mileages.length > 1 ? (Math.max(...mileages) - Math.min(...mileages)) : 0;

        // 3. LOGÓ BETÖLTÉSE
        const logoObj = await loadImage('/icons/icon-512.png'); 

        // --- PDF RAJZOLÁS ---

        // >>> FEJLÉC (Header)
        doc.setFillColor(15, 23, 42); // Slate-900 háttér
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Logó (ha sikerült betölteni)
        if (logoObj) {
            // @ts-ignore
            doc.addImage(logoObj.data, logoObj.format, 14, 8, 28, 28);
        }

        // Cím és Alcím
        doc.setTextColor(255, 255, 255);
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(24);
        doc.text("DriveSync", 50, 20); // Logó mellé
        
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text("JÁRMŰTÖRTÉNETI JELENTÉS", 50, 26);

        // Jobb oldali infó blokk a fejlécben
        doc.setFontSize(20);
        doc.setTextColor(245, 158, 11); // Amber-500
        doc.text("SZEMÉLYES RIPORT", pageWidth - 14, 20, { align: 'right' });
        
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(`Generálva: ${new Date().toLocaleDateString('hu-HU')}`, pageWidth - 14, 28, { align: 'right' });
        const reportId = `${car.id}-${Date.now().toString().slice(-6)}`;
        doc.text(`Azonosító: #${reportId}`, pageWidth - 14, 33, { align: 'right' });


        // >>> JÁRMŰ ADATLAP (Vehicle Info Box)
        let yPos = 60;
        
        // Főcím
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.setFont('Roboto', 'bold');
        doc.text(`${car.make} ${car.model}`, 14, yPos);
        
        // Szürke vonal
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPos + 3, pageWidth - 14, yPos + 3);
        yPos += 12;

        // Adat rács (Grid)
        const col1 = 14;
        const col2 = 110;
        const rowHeight = 7;

        doc.setFontSize(10);
        
        const printRow = (label: string, value: string, x: number, y: number) => {
            doc.setFont('Roboto', 'normal');
            doc.setTextColor(100, 116, 139); // Label color
            doc.text(label, x, y);
            
            doc.setFont('Roboto', 'bold');
            doc.setTextColor(15, 23, 42); // Value color
            doc.text(value || '-', x + 40, y);
        }

        printRow("Rendszám:", car.plate, col1, yPos);
        printRow("Évjárat:", car.year?.toString(), col2, yPos);
        yPos += rowHeight;

        printRow("Alvázszám (VIN):", car.vin, col1, yPos);
        printRow("Üzemanyag:", car.fuel_type, col2, yPos);
        yPos += rowHeight;

        // ÚJ MEZŐK: Motor és Teljesítmény
        // Feltételezve, hogy a car objektumban ezek a mezők 'engine_size' és 'power_hp' néven vannak
        const engineInfo = car.engine_size ? `${car.engine_size} cm³` : '-';
        const powerInfo = car.power_hp ? `${car.power_hp} LE` : '-';

        printRow("Motor:", engineInfo, col1, yPos);
        printRow("Teljesítmény:", powerInfo, col2, yPos);
        yPos += rowHeight;

        printRow("Aktuális Km:", `${car.mileage?.toLocaleString()} km`, col1, yPos);
        printRow("Szín:", car.color, col2, yPos);
        yPos += rowHeight;

        // >>> ÖSSZESÍTŐ STATISZTIKA (Summary Box)
        yPos += 10;
        
        // Doboz háttér
        doc.setFillColor(248, 250, 252); // Slate-50
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.roundedRect(14, yPos, pageWidth - 28, 25, 3, 3, 'FD');

        const sectionWidth = (pageWidth - 28) / 3;
        
        // Költség
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("ÖSSZES KÖLTSÉG", 14 + (sectionWidth * 0.5), yPos + 8, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(formatCurrency(totalCost), 14 + (sectionWidth * 0.5), yPos + 16, { align: 'center' });

        // Szervizek
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("RÖGZÍTETT ESEMÉNY", 14 + (sectionWidth * 1.5), yPos + 8, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(`${events.length} db`, 14 + (sectionWidth * 1.5), yPos + 16, { align: 'center' });

        // Megtett út
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("DOKUMENTÁLT FUTÁS", 14 + (sectionWidth * 2.5), yPos + 8, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(`${distanceDriven.toLocaleString()} km`, 14 + (sectionWidth * 2.5), yPos + 16, { align: 'center' });

        yPos += 35;

        // >>> TÁBLÁZAT (Table)
        const tableData = events.map(e => {
            let typeLabel = e.type === 'fuel' ? 'Tankolás' : 
                            e.type === 'service' ? 'Szerviz' :
                            e.type === 'repair' ? 'Javítás' : 'Egyéb';

            // LEÍRÁS LOGIKA MÓDOSÍTÁSA
            // Elsődlegesen a 'description' mezőt használjuk, ha van.
            // Ha nincs, akkor a 'title' mezőt.
            // Tankolásnál formázunk.
            let desc = '';
            
            if (e.description && e.description.trim() !== '') {
                desc = e.description;
            } else if (e.title && e.title.trim() !== '') {
                desc = e.title;
            }

            // Tankolásnál kiegészítjük, ha van liter adat, de nem írjuk felül a description-t ha az létezik
            if (e.type === 'fuel') {
                const fuelInfo = `${e.liters ? e.liters + 'L ' : ''}Üzemanyag`;
                if (desc) {
                    desc = `${fuelInfo} - ${desc}`;
                } else {
                    desc = fuelInfo;
                }
            }

            // Ha még mindig üres
            if (!desc) desc = '-';

            // Túl hosszú leírás vágása (opcionális, de táblázatnál hasznos)
            if (desc.length > 50) desc = desc.substring(0, 47) + '...';

            return [
                new Date(e.event_date).toLocaleDateString('hu-HU'),
                typeLabel,
                desc,
                e.mileage ? `${e.mileage.toLocaleString()} km` : '-',
                e.cost ? formatCurrency(e.cost) : '-'
            ]
        });

        autoTable(doc, {
            startY: yPos,
            head: [['Dátum', 'Típus', 'Leírás', 'Km Állás', 'Költség']],
            body: tableData,
            theme: 'striped', 
            headStyles: { 
                fillColor: [15, 23, 42], 
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                font: 'Roboto',
                halign: 'left'
            },
            bodyStyles: { 
                font: 'Roboto',
                textColor: [51, 65, 85],
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 25, fontStyle: 'bold' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 35, halign: 'right', font: 'Roboto' },
                4: { cellWidth: 35, halign: 'right', font: 'Roboto' }
            },
            alternateRowStyles: {
                fillColor: [241, 245, 249]
            },
            // Lábléc minden oldalra
            didDrawPage: function (data) {
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                
                doc.setFontSize(8);
                doc.setTextColor(150);
                
                const footerText = "Készült a DriveSync alkalmazással - https://www.drivesync-hungary.hu/";
                doc.text(footerText, 14, pageHeight - 10);
                
                const pageNumber = `Oldal ${doc.getNumberOfPages()}`;
                doc.text(pageNumber, pageWidth - 14, pageHeight - 10, { align: 'right' });
            }
        });

        // Letöltés
        const fileName = `${car.make}_${car.model}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error("PDF Generálási Hiba:", error);
        throw error;
    }
}