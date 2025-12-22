import { serviceReminderTemplate, documentExpiryTemplate } from './emailTemplates';

export async function sendServiceReminder({ to, userName, carName, serviceDate }: { to: string, userName: string, carName: string, serviceDate: string }) {
  const subject = `Szerviz emlékeztető: ${carName}`;
  const html = serviceReminderTemplate(userName, carName, serviceDate);
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
}

export async function sendDocumentExpiry({ to, userName, docType, expiryDate }: { to: string, userName: string, docType: string, expiryDate: string }) {
  const subject = `Lejáró okirat: ${docType}`;
  const html = documentExpiryTemplate(userName, docType, expiryDate);
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
}
