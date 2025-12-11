import LegalLayout from '@/components/LegalLayout'

export default function ImpressumPage() {
  return (
    <LegalLayout title="Impresszum">
      <h1>Impresszum</h1>
      
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 not-prose mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Szolgáltató Adatai</h2>
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">Cégnév / Üzemeltető:</span>
            <span className="font-medium text-white">DriveSync Technologies</span>
          </li>
          <li className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">Székhely:</span>
            <span className="font-medium text-white text-right">4251 Hajdúsámson, Sima utca 5/4</span>
          </li>
          <li className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">Adószám:</span>
            <span className="font-medium text-white">-</span>
          </li>
          <li className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-500">Email:</span>
            <a href="mailto:info.drivesync.mail@gmail.com" className="font-medium text-amber-500 hover:underline">info.drivesync.mail@gmail.com</a>
          </li>
          <li className="pt-2">
            <span className="block text-slate-500 mb-1">Tárhelyszolgáltató:</span>
            <span className="font-medium text-white block">Vercel Inc. (USA), Supabase Inc. (USA/EU)</span>
          </li>
        </ul>
      </div>

      <p className="text-sm text-slate-500 italic">
        Jelen weboldal tartalmának másolása, átdolgozása a tulajdonos írásos engedélye nélkül tilos.
      </p>
    </LegalLayout>
  )
}