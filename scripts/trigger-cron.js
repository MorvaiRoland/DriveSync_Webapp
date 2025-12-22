// Egyszerű Node.js script a szerviz emlékeztető email cron endpoint meghívásához
const fetch = require('node-fetch');

const CRON_URL = process.env.CRON_URL || 'http://localhost:3000/api/cron';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.error('HIBA: Nincs CRON_SECRET megadva!');
  process.exit(1);
}

fetch(CRON_URL, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('CRON válasz:', data);
    if (data.error) process.exit(1);
    process.exit(0);
  })
  .catch(err => {
    console.error('Hiba a CRON endpoint hívásakor:', err);
    process.exit(1);
  });
