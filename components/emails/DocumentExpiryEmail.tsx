import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button
} from '@react-email/components';
import * as React from 'react';

interface Props {
  userName: string;
  carName: string;
  plate: string;
  docType: string;
  expiryDate: string;
}

export default function DocumentExpiryEmail({ userName, carName, plate, docType, expiryDate }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{docType} lejárati értesítő - {carName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Figyelem, lejáró okmány!</Heading>
          
          <Text style={text}>Kedves {userName},</Text>
          
          <Text style={text}>
            Ez egy automatikus emlékeztető, hogy az alábbi járműved <strong>{docType}a</strong> 3 nap múlva lejár.
          </Text>

          <Section style={box}>
            <Text style={paragraph}><strong>Jármű:</strong> {carName}</Text>
            <Text style={paragraph}><strong>Rendszám:</strong> {plate}</Text>
            <Text style={paragraph}><strong>Lejárat dátuma:</strong> {expiryDate}</Text>
          </Section>

          <Text style={text}>
            Kérjük, intézkedj időben a megújításról, hogy elkerüld a büntetéseket!
          </Text>

          <Button style={button} href="https://dynamicsense.hu/garage">
            Garázs Megnyitása
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

// Stílusok (egyszerűsítve)
const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', borderRadius: '10px' };
const h1 = { color: '#ef4444', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const };
const text = { color: '#333', fontSize: '16px', lineHeight: '24px' };
const box = { background: '#f9fafb', padding: '15px', borderRadius: '8px', margin: '20px 0' };
const paragraph = { margin: '5px 0', fontSize: '15px' };
const button = { backgroundColor: '#000', color: '#fff', padding: '12px 20px', borderRadius: '5px', textDecoration: 'none', display: 'block', textAlign: 'center' as const, marginTop: '20px' };