import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image as PdfImage, Font } from '@react-pdf/renderer';

// Betűtípus regisztrálása a magyar ékezetekhez (Roboto)
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
});

Font.register({
  family: 'Roboto-Bold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
});

// Stílusok
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: 1, borderBottomColor: '#ccc', paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontFamily: 'Roboto-Bold', color: '#0F172A', textTransform: 'uppercase' },
  headerSub: { fontSize: 10, color: '#F59E0B' }, // Amber color
  section: { margin: 10, padding: 10 },
  title: { fontSize: 14, fontFamily: 'Roboto-Bold', marginBottom: 10, marginTop: 10, borderBottom: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  
  // Autó adatok rács
  carInfoContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, backgroundColor: '#f8fafc', padding: 10, borderRadius: 5 },
  carInfoItem: { width: '33%', marginBottom: 5 },
  label: { fontSize: 8, color: '#64748b', textTransform: 'uppercase' },
  value: { fontSize: 10, fontFamily: 'Roboto-Bold' },

  // Táblázat
  table: { width: 'auto', borderWidth: 1, borderStyle: 'solid', borderColor: '#e2e8f0', marginBottom: 10 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableHeader: { margin: 'auto', flexDirection: 'row', backgroundColor: '#f1f5f9', fontFamily: 'Roboto-Bold' },
  tableCol1: { width: '15%', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 5 },
  tableCol2: { width: '45%', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 5 },
  tableCol3: { width: '20%', borderRightWidth: 1, borderRightColor: '#e2e8f0', padding: 5 },
  tableCol4: { width: '20%', padding: 5, textAlign: 'right' },
  tableCell: { margin: 'auto', fontSize: 9 },

  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTop: 1, borderTopColor: '#eee', paddingTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5, paddingRight: 5 },
  totalText: { fontFamily: 'Roboto-Bold', fontSize: 12 }
});

type ReportProps = {
  car: any;
  events: any[];
  type: 'full' | 'service' | 'fuel';
};

export const CarReportDocument = ({ car, events, type }: ReportProps) => {
  const currentDate = new Date().toLocaleDateString('hu-HU');
  
  // Szűrés típus alapján
  const filteredEvents = events.filter(e => {
    if (type === 'full') return true;
    return e.type === type;
  });

  const totalCost = filteredEvents.reduce((sum, e) => sum + e.cost, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* FEJLÉC */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>DriveSync</Text>
            <Text style={styles.headerSub}>Digitális Jármű Törzskönyv</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text>Dátum: {currentDate}</Text>
            <Text>Riport típus: {type === 'full' ? 'Teljes Történet' : type === 'service' ? 'Szerviz Történet' : 'Tankolási Napló'}</Text>
          </View>
        </View>

        {/* AUTÓ ADATOK */}
        <Text style={styles.title}>Jármű Adatai</Text>
        <View style={styles.carInfoContainer}>
           <View style={styles.carInfoItem}><Text style={styles.label}>Márka</Text><Text style={styles.value}>{car.make}</Text></View>
           <View style={styles.carInfoItem}><Text style={styles.label}>Modell</Text><Text style={styles.value}>{car.model}</Text></View>
           <View style={styles.carInfoItem}><Text style={styles.label}>Rendszám</Text><Text style={styles.value}>{car.plate}</Text></View>
           <View style={styles.carInfoItem}><Text style={styles.label}>Évjárat</Text><Text style={styles.value}>{car.year}</Text></View>
           <View style={styles.carInfoItem}><Text style={styles.label}>Jelenlegi Km</Text><Text style={styles.value}>{car.mileage.toLocaleString()} km</Text></View>
           <View style={styles.carInfoItem}><Text style={styles.label}>Üzemanyag</Text><Text style={styles.value}>{car.fuel_type}</Text></View>
           <View style={{width: '100%', marginTop: 5}}><Text style={styles.label}>Alvázszám (VIN)</Text><Text style={styles.value}>{car.vin || '-'}</Text></View>
        </View>

        {/* ESEMÉNYEK TÁBLÁZAT */}
        <Text style={styles.title}>Eseménynapló</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableCol1}><Text style={styles.tableCell}>Dátum</Text></View>
            <View style={styles.tableCol2}><Text style={styles.tableCell}>Megnevezés / Leírás</Text></View>
            <View style={styles.tableCol3}><Text style={styles.tableCell}>Km óra</Text></View>
            <View style={styles.tableCol4}><Text style={styles.tableCell}>Költség</Text></View>
          </View>
          
          {filteredEvents.map((event, i) => (
             <View key={i} style={{...styles.tableRow, backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc'}}>
                <View style={styles.tableCol1}>
                    <Text style={styles.tableCell}>{event.event_date}</Text>
                    <Text style={{fontSize: 7, color: '#666'}}>{event.type === 'fuel' ? 'Tankolás' : 'Szerviz'}</Text>
                </View>
                <View style={styles.tableCol2}>
                    <Text style={styles.tableCell}>{event.title}</Text>
                    {event.type === 'fuel' ? (
                       <Text style={{fontSize: 8, color: '#666'}}>{event.liters} liter @ {event.location || '-'}</Text>
                    ) : (
                       <Text style={{fontSize: 8, color: '#666'}}>{event.description}</Text>
                    )}
                </View>
                <View style={styles.tableCol3}><Text style={styles.tableCell}>{event.mileage.toLocaleString()}</Text></View>
                <View style={styles.tableCol4}><Text style={styles.tableCell}>{event.cost.toLocaleString()} Ft</Text></View>
             </View>
          ))}
        </View>

        {/* ÖSSZESÍTÉS */}
        <View style={styles.totalRow}>
           <Text style={styles.totalText}>Összesen: {totalCost.toLocaleString()} Ft</Text>
        </View>

        {/* LÁBLÉC */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `DriveSync - Hivatalos Járműjelentés | ${pageNumber} / ${totalPages} oldal`
        )} fixed />

      </Page>
    </Document>
  );
};