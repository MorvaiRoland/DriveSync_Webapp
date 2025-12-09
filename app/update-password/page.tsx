// app/update-password/page.tsx
import { updatePassword } from '@/app/login/action'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UpdatePasswordPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === 'string' ? searchParams.message : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-900 p-8 shadow-xl border border-white/5 relative overflow-hidden">
        
        {/* Háttér dekoráció */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-600/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="text-center relative z-10">
            <h2 className="text-2xl font-bold tracking-tight text-white">Új jelszó megadása</h2>
            <p className="mt-2 text-sm text-slate-400">
              Kérjük, add meg az új jelszavadat a fiókodhoz.
            </p>
        </div>

        {/* Hibaüzenet */}
        {message && (
          <div className="relative z-10 p-4 rounded-lg text-sm flex items-start gap-3 border bg-red-500/10 border-red-500/20 text-red-200">
             <span>{message}</span>
          </div>
        )}

        <form action={updatePassword} className="mt-8 space-y-6 relative z-10">
          <div className="space-y-4">
            <div>
              {/* JAVÍTVA: className a class helyett */}
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Új Jelszó</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full rounded-xl border-0 bg-slate-950/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
              />
            </div>

            <div>
              {/* JAVÍTVA: className a class helyett */}
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Jelszó megerősítése</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full rounded-xl border-0 bg-slate-950/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all uppercase tracking-wide"
          >
            Jelszó mentése
          </button>
        </form>
      </div>
    </div>
  )
}