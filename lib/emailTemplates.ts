export function serviceReminderTemplate(userName: string, carName: string, serviceDate: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Szerviz emlékeztető</h2>
      <p>Kedves ${userName}!</p>
      <p>A(z) <b>${carName}</b> járműved szervizelése hamarosan esedékes: <b>${serviceDate}</b>.</p>
      <p>Kérjük, ne felejts el időpontot foglalni a szervizbe!</p>
      <br />
      <p>Üdvözlettel,<br />DriveSync csapat</p>
    </div>
  `;
}

export function documentExpiryTemplate(userName: string, docType: string, expiryDate: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Okirat lejárati emlékeztető</h2>
      <p>Kedves ${userName}!</p>
      <p>A(z) <b>${docType}</b> okiratod lejár: <b>${expiryDate}</b>.</p>
      <p>Kérjük, intézkedj időben a hosszabbításról!</p>
      <br />
      <p>Üdvözlettel,<br />DriveSync csapat</p>
    </div>
  `;
}
