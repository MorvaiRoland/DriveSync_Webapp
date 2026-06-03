import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
});

// ─────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────
const DARK       = '#0F172A'; // slate-900
const DARK2      = '#1E293B'; // slate-800
const AMBER      = '#F59E0B'; // amber-500
const SLATE_700  = '#334155';
const SLATE_500  = '#64748B';
const SLATE_100  = '#F1F5F9';
const SLATE_50   = '#F8FAFC';
const EMERALD    = '#10B981';
const INDIGO     = '#6366F1';
const WHITE      = '#FFFFFF';
const BORDER     = '#E2E8F0';

// ─────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Roboto',
    fontSize: 9,
    color: SLATE_700,
    backgroundColor: WHITE,
  },

  // ── HEADER ──────────────────────────────────────
  header: {
    backgroundColor: DARK,
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 0,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 4,
  },
  logo: {
    width: 110,
    height: 28,
    objectFit: 'contain',
    marginBottom: 6,
  },
  headerSubtext: {
    fontSize: 7.5,
    color: '#94A3B8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 3,
  },
  reportTypeBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AMBER,
    letterSpacing: 0.5,
  },
  headerMeta: {
    fontSize: 8,
    color: WHITE,
    opacity: 0.7,
  },
  accentBar: {
    height: 3,
    backgroundColor: AMBER,
    marginTop: 2,
  },
  accentBarInner: {
    width: 80,
    height: 3,
    backgroundColor: INDIGO,
  },

  // ── BODY CONTENT ────────────────────────────────
  body: {
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 60, // lábléc helye
    flex: 1,
  },

  // ── CAR TITLE ───────────────────────────────────
  carTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK,
    marginBottom: 3,
  },
  carSub: {
    fontSize: 8.5,
    color: SLATE_500,
    marginBottom: 14,
    letterSpacing: 0.3,
  },

  // ── CAR DATA PANEL ───────────────────────────────
  dataPanelWrapper: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  dataPanel: {
    flex: 1,
    backgroundColor: SLATE_50,
    borderRadius: 6,
    padding: 12,
    borderLeft: `3px solid ${AMBER}`,
  },
  carImage: {
    width: 170,
    height: 110,
    borderRadius: 6,
    objectFit: 'cover',
    border: `1px solid ${BORDER}`,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 90,
    fontSize: 7.5,
    color: SLATE_500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 1,
  },
  infoValue: {
    flex: 1,
    fontSize: 9.5,
    fontWeight: 'bold',
    color: DARK,
  },

  // ── STAT CARDS ──────────────────────────────────
  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: SLATE_100,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  statAccent: {
    height: 2.5,
    borderRadius: 2,
    marginBottom: 6,
    width: '100%',
  },
  statLabel: {
    fontSize: 6.5,
    color: SLATE_500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: DARK,
  },

  // ── SECTION TITLE ────────────────────────────────
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: DARK,
    marginBottom: 2,
  },
  sectionAccentLine: {
    width: 40,
    height: 1.5,
    backgroundColor: AMBER,
    marginBottom: 10,
  },

  // ── TABLE ────────────────────────────────────────
  table: {
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    border: `1px solid ${BORDER}`,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: DARK,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    color: WHITE,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${BORDER}`,
  },
  tableRowAlt: {
    backgroundColor: SLATE_50,
  },
  tableCell: {
    fontSize: 8.5,
    color: SLATE_700,
  },
  tableCellBold: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: DARK,
  },
  tableCellMuted: {
    fontSize: 7.5,
    color: SLATE_500,
    marginTop: 2,
  },

  // col widths
  colDate:  { width: '15%' },
  colType:  { width: '13%' },
  colDesc:  { width: '42%' },
  colKm:    { width: '15%' },
  colCost:  { width: '15%', textAlign: 'right' },

  // ── TOTAL ROW ────────────────────────────────────
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: SLATE_700,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: AMBER,
  },

  // ── FOOTER ──────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK2,
    paddingVertical: 10,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `2px solid ${AMBER}`,
  },
  footerLeft: {
    fontSize: 7.5,
    color: '#94A3B8',
  },
  footerBrand: {
    fontSize: 8,
    color: AMBER,
    fontWeight: 'bold',
  },
  footerRight: {
    fontSize: 7.5,
    color: '#94A3B8',
    textAlign: 'right',
  },
});

// ─────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────
const formatHUF = (val: number) =>
  val
    ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val)
    : '—';

const typeLabel = (type: string) => {
  if (type === 'fuel')    return 'Tankolás';
  if (type === 'service') return 'Szerviz';
  return 'Egyéb';
};

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────
type ReportProps = {
  car: any;
  events: any[];
  type: 'full' | 'service' | 'fuel';
};

// ─────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────
export const CarReportDocument = ({ car, events, type }: ReportProps) => {
  const currentDate = new Date().toLocaleDateString('hu-HU');
  const reportId    = `DS-${String(car.id || '0').slice(-5)}-${Date.now().toString().slice(-6)}`;

  const filteredEvents = events.filter(e => {
    if (type === 'full') return true;
    return e.type === type;
  });

  const totalCost     = filteredEvents.reduce((s, e) => s + (e.cost || 0), 0);
  const mileages      = filteredEvents.map(e => e.mileage).filter(Boolean);
  const distanceDriven = mileages.length > 1 ? (Math.max(...mileages) - Math.min(...mileages)) : 0;

  const reportTypeLabel = type === 'full' ? 'TELJES RIPORT' : type === 'service' ? 'SZERVIZ RIPORT' : 'TANKOLÁSI RIPORT';

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image
                src={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://dynamicsense.hu'}/DynamicSense-logo.png`}
                style={styles.logo}
              />
              <Text style={styles.headerSubtext}>Járműtörténeti Jelentés</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.reportTypeBadge}>{reportTypeLabel}</Text>
              <Text style={styles.headerMeta}>Generálva: {currentDate}</Text>
              <Text style={styles.headerMeta}>Azonosító: #{reportId}</Text>
              <Text style={styles.headerMeta}>Jármű: {car.plate}</Text>
            </View>
          </View>
          <View style={styles.accentBar}>
            <View style={styles.accentBarInner} />
          </View>
        </View>

        {/* ── BODY ── */}
        <View style={styles.body}>

          {/* Jármű cím */}
          <Text style={styles.carTitle}>{car.make} {car.model}</Text>
          <Text style={styles.carSub}>
            {car.plate}   •   {car.year}   •   {car.fuel_type}   •   DynamicSense Verified ✓
          </Text>

          {/* Jármű adatok + kép */}
          <View style={styles.dataPanelWrapper}>
            <View style={styles.dataPanel}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rendszám</Text>
                <Text style={styles.infoValue}>{car.plate || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Alvázszám (VIN)</Text>
                <Text style={styles.infoValue}>{car.vin || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Évjárat</Text>
                <Text style={styles.infoValue}>{car.year || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Üzemanyag</Text>
                <Text style={styles.infoValue}>{car.fuel_type || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Motor</Text>
                <Text style={styles.infoValue}>{car.engine_size ? `${car.engine_size} cm³` : '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teljesítmény</Text>
                <Text style={styles.infoValue}>{car.power_hp ? `${car.power_hp} LE` : '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Km-óra</Text>
                <Text style={styles.infoValue}>{car.mileage?.toLocaleString() || '—'} km</Text>
              </View>
            </View>

            {car.image_url && (
              <Image src={car.image_url} style={styles.carImage} />
            )}
          </View>

          {/* Stat kártyák */}
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <View style={[styles.statAccent, { backgroundColor: INDIGO }]} />
              <Text style={styles.statLabel}>Összes Kiadás</Text>
              <Text style={styles.statValue}>{formatHUF(totalCost)}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statAccent, { backgroundColor: EMERALD }]} />
              <Text style={styles.statLabel}>Események Száma</Text>
              <Text style={styles.statValue}>{filteredEvents.length} db</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statAccent, { backgroundColor: AMBER }]} />
              <Text style={styles.statLabel}>Dokumentált Futás</Text>
              <Text style={styles.statValue}>{distanceDriven.toLocaleString()} km</Text>
            </View>
          </View>

          {/* Esemény táblázat */}
          <Text style={styles.sectionTitle}>Eseménynapló</Text>
          <View style={styles.sectionAccentLine} />

          <View style={styles.table}>
            {/* Fejléc */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Dátum</Text>
              <Text style={[styles.tableHeaderCell, styles.colType]}>Típus</Text>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Leírás</Text>
              <Text style={[styles.tableHeaderCell, styles.colKm]}>Km-óra</Text>
              <Text style={[styles.tableHeaderCell, styles.colCost]}>Költség</Text>
            </View>

            {filteredEvents.length === 0 && (
              <View style={[styles.tableRow]}>
                <Text style={[styles.tableCell, { flex: 1, color: SLATE_500, fontStyle: 'italic' }]}>
                  Nincs rögzített esemény ebben a kategóriában.
                </Text>
              </View>
            )}

            {filteredEvents.map((event, i) => (
              <View
                key={i}
                style={[
                  styles.tableRow,
                  i % 2 !== 0 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={[styles.tableCell, styles.colDate]}>
                  {new Date(event.event_date).toLocaleDateString('hu-HU')}
                </Text>
                <Text style={[styles.tableCell, styles.colType]}>
                  {typeLabel(event.type)}
                </Text>
                <View style={styles.colDesc}>
                  <Text style={styles.tableCellBold}>{event.title || '—'}</Text>
                  {event.description ? (
                    <Text style={styles.tableCellMuted}>{event.description}</Text>
                  ) : event.type === 'fuel' && event.liters ? (
                    <Text style={styles.tableCellMuted}>{event.liters} liter</Text>
                  ) : null}
                </View>
                <Text style={[styles.tableCell, styles.colKm]}>
                  {event.mileage ? `${event.mileage.toLocaleString()} km` : '—'}
                </Text>
                <Text style={[styles.tableCellBold, styles.colCost]}>
                  {event.cost ? formatHUF(event.cost) : '—'}
                </Text>
              </View>
            ))}
          </View>

          {/* Összesen */}
          {totalCost > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Összesen:</Text>
              <Text style={styles.totalValue}>{formatHUF(totalCost)}</Text>
            </View>
          )}
        </View>

        {/* ── FOOTER (fixed bottom) ── */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerBrand}>DynamicSense</Text>
            <Text style={styles.footerLeft}>dynamicsense.hu  •  Hivatalos Járműriport</Text>
          </View>
          <Text style={styles.footerRight}>
            Generálva: {currentDate}{'\n'}Riport: #{reportId}
          </Text>
        </View>

      </Page>
    </Document>
  );
};