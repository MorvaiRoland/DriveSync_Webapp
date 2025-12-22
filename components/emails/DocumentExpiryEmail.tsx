import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface DocumentExpiryEmailProps {
  userName: string;
  docType: string;
  expiryDate: string;
}

export const DocumentExpiryEmail = ({
  userName,
  docType,
  expiryDate,
}: DocumentExpiryEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Lejáró okirat: {docType}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
             <span style={logoText}>Drive<span style={{color: '#f59e0b'}}>Sync</span></span>
          </Section>
          <Heading style={h1}>Okirat Lejárati Emlékeztető</Heading>
          <Text style={text}>
            Kedves {userName}!
          </Text>
          <Text style={text}>
            Ez egy automatikus emlékeztető, hogy a(z) <strong>{docType}</strong> okiratod lejár: <b>{expiryDate}</b>.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailRow}>
              <strong style={label}>Lejárat dátuma:</strong>
              <span style={value}>{expiryDate}</span>
            </Text>
          </Section>
          <Text style={text}>
            Kérjük, intézkedj időben a hosszabbításról!
          </Text>
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 DynamicSense Technologies<br />
              Ez egy automatikus üzenet, kérjük ne válaszolj rá.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DocumentExpiryEmail;

// --- STÍLUSOK (CSS) ---
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  maxWidth: "600px",
};

const logoContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0f172a",
};

const h1 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "24px 0 16px 0",
};

const text = {
  fontSize: "16px",
  color: "#334155",
  margin: "12px 0",
};

const detailsBox = {
  background: "#f1f5f9",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "20px 0 24px 0",
};

const detailRow = {
  fontSize: "15px",
  margin: "8px 0",
  display: "flex",
  justifyContent: "space-between",
};

const label = {
  color: "#64748b",
  fontWeight: "bold",
  marginRight: "8px",
};

const value = {
  color: "#0f172a",
  fontWeight: "bold",
};

const hr = {
  border: "none",
  borderTop: "1px solid #e2e8f0",
  margin: "12px 0",
};

const footer = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "13px",
  color: "#64748b",
};
