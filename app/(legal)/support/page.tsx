import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Támogatás & Ügyfélszolgálat | DynamicSense',
  description: 'Segítség, GYIK és kapcsolat a DynamicSense csapatával.',
}

const FAQ = [
  {
    q: 'Hogyan adhatok hozzá új járművet a garázsomhoz?',
    a: 'A főoldalon kattints a „+ Jármű hozzáadása" gombra. Add meg a jármű főbb adatait (gyártmány, modell, évjárat, rendszám), majd mentsd el. A VIN-szám alapján a rendszer automatikusan kiegészítheti az adatokat.',
  },
  {
    q: 'Hogyan generálhatok PDF riportot a szerviztörténetről?',
    a: 'Nyisd meg a kívánt jármű részleteit, majd kattints az „Export" gombra a jobb felső sarokban. Válaszd ki a riport típusát (Teljes / Szerviz / Üzemanyag), és a PDF automatikusan letöltődik.',
  },
  {
    q: 'Mi a különbség a Starter és a Pro csomag között?',
    a: 'A Starter csomag ingyenes és 1 jármű kezelését teszi lehetővé. A Pro csomaggal korlátlan számú járművet rögzíthetsz, és hozzáférsz az AI Szerelő asszisztenshez, a VIN-keresőhöz, a fejlett statisztikákhoz és a kereskedői funkciókhoz.',
  },
  {
    q: 'Az AI Szerelő mennyire megbízható?',
    a: 'Az AI Szerelő tájékoztató jellegű tanácsokat nyújt a járműved szerviznapló-adatai és az általad leírt tünetek alapján. Az AI diagnózisa nem helyettesíti a képzett szakember személyes vizsgálatát; mindig konzultálj szervizzel fontos döntések előtt.',
  },
  {
    q: 'Hogyan mondhatom le az előfizetésemet?',
    a: 'Lépj be a Beállítások → Előfizetés menübe, majd kattints a „Számlázási adatok kezelése" gombra. A Stripe biztonságos felületén lehetőséged van az előfizetés lemondására. A lemondás után a Pro funkciók a kifizetett időszak végéig elérhetők maradnak.',
  },
  {
    q: 'Biztonságban vannak az adataim?',
    a: 'Igen. Az adataidat a Supabase infrastruktúrán tároljuk, amely SOC 2 Type 2 tanúsítvánnyal rendelkezik. A kapcsolat TLS 1.3 titkosítással védett. Adataidat harmadik félnek nem adjuk ki. Részletekért olvasd el Adatvédelmi Tájékoztatónkat.',
  },
  {
    q: 'Hogyan törölhetem a fiókomat?',
    a: 'Lépj be a Beállítások oldalra, görgess le a „Veszélyzóna" szekcióhoz, és kattints a „Törlés indítása" gombra. Figyelem: a törlés visszavonhatatlan, minden adatod véglegesen megszűnik.',
  },
  {
    q: 'Elérhető az app iOS és Android rendszeren?',
    a: 'A DynamicSense progresszív webalkalmazásként (PWA) fut, ami telepíthető mind iOS (Safari → „Főképernyőre adás"), mind Android (Chrome → „Telepítés") eszközökre, alkalmazásbolt nélkül.',
  },
]

const CONTACT_CHANNELS = [
  {
    icon: '📧',
    title: 'E-mail Ügyfélszolgálat',
    desc: 'Részletes kérdések, hibabejelentés és számlázási ügyek.',
    action: 'support@dynamicsense.hu',
    href: 'mailto:support@dynamicsense.hu',
    badge: 'Átl. válasz: 24–48h',
    badgeColor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
  },
  {
    icon: '🐛',
    title: 'Hibabejelentés',
    desc: 'Technikai hibák, váratlan viselkedés bejelentése a fejlesztői csapatnak.',
    action: 'bugs@dynamicsense.hu',
    href: 'mailto:bugs@dynamicsense.hu',
    badge: 'Fejlesztői csapat',
    badgeColor: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40',
  },
  {
    icon: '💼',
    title: 'Üzleti Megkeresések',
    desc: 'Partnerség, API hozzáférés és vállalati licencek.',
    action: 'business@dynamicsense.hu',
    href: 'mailto:business@dynamicsense.hu',
    badge: 'B2B',
    badgeColor: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40',
  },
]

export default function SupportPage() {
  return (
    <article>
      {/* Hero */}
      <div className="not-prose mb-14 pb-10 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-5">
          Ügyfélszolgálat
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Hogyan segíthetünk<br />
          <span className="text-amber-500">neked?</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl">
          Találd meg a választ kérdéseidre, vagy vedd fel velünk a kapcsolatot – csapatunk munkanapokon rendelkezésre áll.
        </p>
      </div>

      {/* Contact Channels */}
      <div className="not-prose mb-14">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">📬</span> Kapcsolatfelvétel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONTACT_CHANNELS.map((ch) => (
            <a
              key={ch.href}
              href={ch.href}
              className="group block p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{ch.icon}</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {ch.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{ch.desc}</p>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 break-all">{ch.action}</span>
              <div className="mt-3">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${ch.badgeColor}`}>
                  {ch.badge}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* SLA table */}
      <div className="not-prose mb-14 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60">
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-700/60">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Válaszidő Garancia (SLA)</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
          {[
            { priority: 'Kritikus (Rendszerkimaradás)', time: '4 munkaóra', color: 'bg-red-500' },
            { priority: 'Magas (Fő funkció nem működik)', time: '24 munkaóra', color: 'bg-amber-500' },
            { priority: 'Normál (Egyéb hibabejelentés)', time: '48 munkaóra', color: 'bg-blue-500' },
            { priority: 'Alacsony (Funkciókérés, kérdés)', time: '3–5 munkanap', color: 'bg-emerald-500' },
          ].map((row) => (
            <div key={row.priority} className="px-6 py-4 flex items-center justify-between gap-4 bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.color}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.priority}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">{row.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <h2>Gyakran Ismételt Kérdések</h2>
      <div className="not-prose space-y-3 mb-14">
        {FAQ.map((item, i) => (
          <details
            key={i}
            className="group rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 overflow-hidden"
          >
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              <span>{item.q}</span>
              <svg
                className="w-4 h-4 flex-shrink-0 text-slate-400 group-open:rotate-180 transition-transform duration-200"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/40 pt-4">
              {item.a}
            </div>
          </details>
        ))}
      </div>

      {/* Status */}
      <div className="not-prose mb-12 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-4">
        <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 flex-shrink-0 animate-pulse" />
        <div>
          <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-1">Minden rendszer működőképes</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">
            A DynamicSense platform és API-k normálisan működnek. Tervezett karbantartás esetén előzetesen értesítjük a felhasználókat.
          </p>
        </div>
      </div>

      {/* Footer links */}
      <div className="not-prose p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">Jogi dokumentumok:</span>
        <div className="flex flex-wrap gap-3">
          <Link href="/terms" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">ÁSZF</Link>
          <Link href="/privacy" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Adatvédelem</Link>
          <Link href="/(legal)/impressum" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Impresszum</Link>
        </div>
      </div>
    </article>
  )
}
