export async function sendDocumentExpiryEmail({ to, userName, docType, expiryDate }: { to: string, userName: string, docType: string, expiryDate: string }) {
  await fetch('/api/document-expiry-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, userName, docType, expiryDate })
  });
}
