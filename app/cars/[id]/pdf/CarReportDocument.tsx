import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#334155' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: 2, borderBottomColor: '#F59E0B', paddingBottom: 10 },
  brand: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', textTransform: 'uppercase' },
  subBrand: { fontSize: 10, color: '#F59E0B' },
  meta: { textAlign: 'right', fontSize: 9, color: '#64748b' },
  
  // Autó Adatok
  section: { flexDirection: 'row', marginTop: 10, marginBottom: 20, backgroundColor: '#f8fafc', padding: 10, borderRadius: 5 },
  infoCol: { flex: 1 },
  infoRow: { flexDirection: 'row', marginBottom: 5 },
  infoLabel: { width: 80, fontSize: 8, color: '#64748b', textTransform: 'uppercase' },
  infoValue: { fontSize: 10, fontWeight: 'bold', color: '#0F172A' },
  
  // Kép
  imageContainer: { width: 150, height: 100, marginLeft: 20, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden' },
  carImage: { width: '100%', height: '100%', objectFit: 'cover' },

  // Táblázat
  tableTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 10, marginTop: 10 },
  table: { width: 'auto', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', minHeight: 24, alignItems: 'center' },
  tableHeader: { backgroundColor: '#f1f5f9' },
  colDate: { width: '15%', padding: 5, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  colType: { width: '15%', padding: 5, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  colDesc: { width: '40%', padding: 5, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  colKm: { width: '15%', padding: 5, borderRightWidth: 1, borderRightColor: '#e2e8f0', textAlign: 'right' },
  colCost: { width: '15%', padding: 5, textAlign: 'right' },

  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingRight: 5 },
  totalLabel: { fontSize: 12, marginRight: 10 },
  totalValue: { fontSize: 14, fontWeight: 'bold', color: '#F59E0B' }
});

type ReportProps = {
  car: any;
  events: any[];
  type: 'full' | 'service' | 'fuel';
};

export const CarReportDocument = ({ car, events, type }: ReportProps) => {
  const currentDate = new Date().toLocaleDateString('hu-HU');
  
  const filteredEvents = events.filter(e => {
    if (type === 'full') return true;
    return e.type === type;
  });

  const totalCost = filteredEvents.reduce((sum, e) => sum + (e.cost || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* FEJLÉC */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>DriveSync</Text>
            <Text style={styles.subBrand}>Jármű Jelentés</Text>
          </View>
          <View style={styles.meta}>
            <Text>Dátum: {currentDate}</Text>
            <Text>Jármű ID: {car.plate}</Text>
          </View>
        </View>

        {/* JÁRMŰ ADATOK & KÉP */}
        <View style={styles.section}>
            <View style={styles.infoCol}>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Gyártmány</Text><Text style={styles.infoValue}>{car.make}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Modell</Text><Text style={styles.infoValue}>{car.model}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Rendszám</Text><Text style={styles.infoValue}>{car.plate}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Évjárat</Text><Text style={styles.infoValue}>{car.year}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Km Óraállás</Text><Text style={styles.infoValue}>{car.mileage?.toLocaleString()} km</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Üzemanyag</Text><Text style={styles.infoValue}>{car.fuel_type}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Alvázszám</Text><Text style={styles.infoValue}>{car.vin || '-'}</Text></View>
            </View>
            {car.image_url && (
                <View style={styles.imageContainer}>
                    <Image src={car.image_url} style={styles.carImage} />
                </View>
            )}
        </View>

        {/* ESEMÉNYEK */}
        <Text style={styles.tableTitle}>Eseménynapló</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colDate}><Text>Dátum</Text></View>
            <View style={styles.colType}><Text>Típus</Text></View>
            <View style={styles.colDesc}><Text>Leírás</Text></View>
            <View style={styles.colKm}><Text>Km állás</Text></View>
            <View style={styles.colCost}><Text>Költség</Text></View>
          </View>
          
          {filteredEvents.map((event, i) => (
             <View key={i} style={{...styles.tableRow, backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc'}}>
                <View style={styles.colDate}><Text>{event.event_date}</Text></View>
                <View style={styles.colType}>
                    <Text>{event.type === 'fuel' ? 'Tankolás' : 'Szerviz'}</Text>
                </View>
                <View style={styles.colDesc}>
                    <Text style={{fontWeight: 'bold'}}>{event.title}</Text>
                    <Text style={{fontSize: 8, color: '#64748b'}}>
                        {event.type === 'fuel' ? `${event.liters} liter` : event.description}
                    </Text>
                </View>
                <View style={styles.colKm}><Text>{event.mileage?.toLocaleString()}</Text></View>
                <View style={styles.colCost}><Text>{event.cost?.toLocaleString()} Ft</Text></View>
             </View>
          ))}
        </View>

        <View style={styles.totalRow}>
           <Text style={styles.totalLabel}>Összesen:</Text>
           <Text style={styles.totalValue}>{totalCost.toLocaleString()} Ft</Text>
        </View>

      </Page>
    </Document>
  );
};