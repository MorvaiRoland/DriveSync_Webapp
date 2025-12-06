import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Betűtípus regisztrálása a magyar ékezetekhez
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Roboto', fontSize: 10, color: '#334155' },
  
  // Fejléc
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: 2, borderBottomColor: '#F59E0B', paddingBottom: 10 },
  brand: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', textTransform: 'uppercase' },
  subBrand: { fontSize: 10, color: '#F59E0B', marginTop: 2 },
  meta: { textAlign: 'right', fontSize: 8, color: '#64748b' },

  // Szekciók
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginTop: 15, marginBottom: 8, borderBottom: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  
  // Autó infó rács
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  infoItem: { width: '33%', marginBottom: 8 },
  infoLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 11, fontWeight: 'bold', color: '#0F172A' },

  // Kép
  imageContainer: { height: 150, marginBottom: 15, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  carImage: { width: '100%', height: '100%', objectFit: 'cover' },

  // Táblázat
  table: { width: 'auto', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', minHeight: 20, alignItems: 'center' },
  tableHeader: { backgroundColor: '#f8fafc', fontWeight: 'bold' },
  colDate: { width: '15%', padding: 4, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  colType: { width: '15%', padding: 4, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  colDesc: { width: '40%', padding: 4, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  colKm: { width: '15%', padding: 4, borderRightWidth: 1, borderRightColor: '#e2e8f0', textAlign: 'right' },
  colCost: { width: '15%', padding: 4, textAlign: 'right' },

  // Footer
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTop: 1, borderTopColor: '#e2e8f0', paddingTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingRight: 5 },
  totalText: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' }
});

type ReportProps = {
  car: any;
  events: any[];
  type: 'full' | 'service' | 'fuel';
};

export const CarReportDocument = ({ car, events, type }: ReportProps) => {
  const currentDate = new Date().toLocaleDateString('hu-HU');
  
  // Szűrés
  const filteredEvents = events.filter(e => {
    if (type === 'full') return true;
    return e.type === type;
  });

  const totalCost = filteredEvents.reduce((sum, e) => sum + (e.cost || 0), 0);
  const reportName = type === 'full' ? 'TELJES TÖRTÉNET' : type === 'service' ? 'SZERVIZ TÖRTÉNET' : 'TANKOLÁSI NAPLÓ';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* FEJLÉC */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>DriveSync</Text>
            <Text style={styles.subBrand}>Jármű Jelentés - {car.plate}</Text>
          </View>
          <View style={styles.meta}>
            <Text>Dátum: {currentDate}</Text>
            <Text>{reportName}</Text>
            <Text>Jármű ID: {car.id}</Text>
          </View>
        </View>

        {/* AUTÓ ADATOK */}
        <Text style={styles.sectionTitle}>Jármű Adatai</Text>
        
        {/* Ha van kép, megjelenítjük */}
        {car.image_url && (
            <View style={styles.imageContainer}>
                {/* Fontos: A React-PDF Image komponense nem ugyanaz mint a Next.js Image! */}
                <Image src={car.image_url} style={styles.carImage} />
            </View>
        )}

        <View style={styles.infoGrid}>
           <View style={styles.infoItem}><Text style={styles.infoLabel}>Gyártmány</Text><Text style={styles.infoValue}>{car.make}</Text></View>
           <View style={styles.infoItem}><Text style={styles.infoLabel}>Modell</Text><Text style={styles.infoValue}>{car.model}</Text></View>
           <View style={styles.infoItem}><Text style={styles.infoLabel}>Rendszám</Text><Text style={styles.infoValue}>{car.plate}</Text></View>
           <View style={styles.infoItem}><Text style={styles.infoLabel}>Évjárat</Text><Text style={styles.infoValue}>{car.year}</Text></View>
           <View style={styles.infoItem}><Text style={styles.infoLabel}>Km Óraállás</Text><Text style={styles.infoValue}>{car.mileage?.toLocaleString()} km</Text></View>
           <View style={styles.infoItem}><Text style={styles.infoLabel}>Üzemanyag</Text><Text style={styles.infoValue}>{car.fuel_type}</Text></View>
           <View style={{width: '100%', marginTop: 5}}><Text style={styles.infoLabel}>Alvázszám (VIN)</Text><Text style={styles.infoValue}>{car.vin || '-'}</Text></View>
        </View>

        {/* ESEMÉNYEK TÁBLÁZAT */}
        <Text style={styles.sectionTitle}>Rögzített Események</Text>
        <View style={styles.table}>
          {/* Fejléc Sor */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colDate}><Text>Dátum</Text></View>
            <View style={styles.colType}><Text>Típus</Text></View>
            <View style={styles.colDesc}><Text>Leírás / Helyszín</Text></View>
            <View style={styles.colKm}><Text>Km állás</Text></View>
            <View style={styles.colCost}><Text>Költség</Text></View>
          </View>
          
          {/* Adat Sorok */}
          {filteredEvents.map((event, i) => (
             <View key={i} style={{...styles.tableRow, backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc'}}>
                <View style={styles.colDate}><Text>{event.event_date}</Text></View>
                <View style={styles.colType}>
                    <Text style={{color: event.type === 'fuel' ? '#F59E0B' : '#334155'}}>
                        {event.type === 'fuel' ? 'Tankolás' : 'Szerviz'}
                    </Text>
                </View>
                <View style={styles.colDesc}>
                    <Text style={{fontWeight: 'bold'}}>{event.title}</Text>
                    <Text style={{fontSize: 8, color: '#64748b'}}>
                        {event.type === 'fuel' ? `${event.liters} liter` : event.description}
                        {event.location ? ` @ ${event.location}` : ''}
                    </Text>
                </View>
                <View style={styles.colKm}><Text>{event.mileage?.toLocaleString()}</Text></View>
                <View style={styles.colCost}><Text>{event.cost?.toLocaleString()} Ft</Text></View>
             </View>
          ))}
        </View>

        {/* ÖSSZESÍTÉS */}
        <View style={styles.totalRow}>
           <Text style={styles.totalText}>Összes Költség: {totalCost.toLocaleString()} Ft</Text>
        </View>

        {/* LÁBLÉC */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `DriveSync Jelentés - ${pageNumber} / ${totalPages}`
        )} fixed />

      </Page>
    </Document>
  );
};