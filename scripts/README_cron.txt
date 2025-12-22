# Email CRON Trigger használata

1. Állítsd be a környezeti változókat (vagy .env.local):
   - CRON_SECRET (ez már megvan)
   - CRON_URL (pl. http://localhost:3000/api/cron vagy a production URL)

2. Futtasd a scriptet manuálisan:

   ```
   node scripts/trigger-cron.js
   ```

3. Ha működik, ütemezd Windows Task Scheduler-rel vagy bármilyen cron rendszerrel (pl. minden nap 8:00-kor):

   - Parancs: `node D:\DriveSync_WEBAPP\drivesync-webapp\scripts\trigger-cron.js`

4. Ellenőrizd a logokat és az email fiókot!

Ha a script hibát ad vissza, ellenőrizd a .env.local-t, a CRON_SECRET-et, és hogy a szerver fut-e.
