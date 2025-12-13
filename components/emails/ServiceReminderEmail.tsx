import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface ServiceReminderEmailProps {
  userName: string;
  carMake: string;
  carModel: string;
  plate: string;
  serviceType: string;
  dueDate: string;
  note?: string;
}

export const ServiceReminderEmail = ({
  userName,
  carMake,
  carModel,
  plate,
  serviceType,
  dueDate,
  note,
}: ServiceReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Szerviz emlékeztető: {carMake} {carModel}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* LOGÓ HELYE - Cseréld le a saját publikus URL-edre */}
          <Section style={logoContainer}>
             <span style={logoText}>Drive<span style={{color: '#f59e0b'}}>Sync</span></span>
          </Section>
          
          <Heading style={h1}>Szerviz Emlékeztető</Heading>
          
          <Text style={text}>
            Kedves {userName}!
          </Text>
          
          <Text style={text}>
            Ez egy automatikus emlékeztető, hogy a(z) <strong>{carMake} {carModel}</strong> ({plate}) gépjárművednek hamarosan esedékes a karbantartása.
          </Text>

          {/* Részletek doboz */}
          <Section style={detailsBox}>
            <Text style={detailRow}>
              <strong style={label}>Teendő:</strong>
              <span style={value}>{serviceType}</span>
            </Text>
            <Hr style={hr} />
            <Text style={detailRow}>
              <strong style={label}>Határidő:</strong>
              <span style={value}>{dueDate}</span>
            </Text>
            {note && (
              <>
                <Hr style={hr} />
                <Text style={detailRow}>
                  <strong style={label}>Megjegyzés:</strong>
                  <span style={value}>{note}</span>
                </Text>
              </>
            )}
          </Section>

          <Text style={text}>
            Kérjük, gondoskodj időben az időpontfoglalásról vagy az alkatrészek beszerzéséről.
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

export default ServiceReminderEmail;

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
  color: "#0f172a", // Slate-900
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  margin: "0 0 16px",
};

const detailsBox = {
  backgroundColor: "#f9fafb", // Slate-50
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e2e8f0",
};

const detailRow = {
  margin: "8px 0",
  fontSize: "15px",
  color: "#333",
};

const label = {
  color: "#64748b",
  marginRight: "10px",
  textTransform: "uppercase" as const,
  fontSize: "12px",
  letterSpacing: "0.5px",
};

const value = {
  fontWeight: "600",
  color: "#0f172a",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "12px 0",
};

const footer = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#94a3b8",
  lineHeight: "18px",
};