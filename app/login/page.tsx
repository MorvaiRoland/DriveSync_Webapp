import { login, signup, signInWithGoogle } from './action'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === 'string' ? searchParams.message : null
  
  const mode = searchParams.mode === 'signup' ? 'signup' : 'signin'

  return (
    <div className="flex min-h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* --- BAL OLDAL: Dekoratív Art (Asztali nézeten) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 items-center justify-center overflow-hidden">
        {/* Háttér gradiens - Mélyebb fekete/szürke az arany kontrasztért */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black opacity-90" />
        
        {/* Absztrakt háttér elemek */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 L 100 0" stroke="#F59E0B" strokeWidth="0.5" /> {/* Arany vonalak */}
               <path d="M20 100 L 100 20" stroke="#F59E0B" strokeWidth="0.5" />
               <path d="M0 80 L 80 0" stroke="#F59E0B" strokeWidth="0.5" />
               <circle cx="0" cy="50" r="40" stroke="#F59E0B" strokeWidth="0.5" fill="none" />
             </svg>
        </div>
        
        {/* Szöveges tartalom */}
        <div className="relative z-10 text-white p-12 text-center">
          
          {/* --- CÉG LOGÓ HELYE --- */}
          <div className="mb-6 flex justify-center">
             <div className="relative w-44 h-44">
                <Image 
                  src="/drivesync-logo.png" 
                  width={250} 
                  height={250} 
                  alt="DriveSync Logo"
                  className="object-contain drop-shadow-2xl"
                  priority
                />
             </div>
          </div>

          {/* Főcím - Arany kiemeléssel */}
          <h1 className="text-5xl font-extrabold mb-2 tracking-wide uppercase text-white">
            Drive<span className="text-amber-500">Sync</span>
          </h1>
          
          {/* Mottó - Arany színben */}
          <p className="text-2xl font-light italic text-amber-400 mb-8 tracking-wider font-serif">
            "Just drive. We Sync."
          </p>

          {/* Leírás */}
          <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed border-t border-slate-800 pt-6">
            Saját autók kezelése és szervizkönyv vezetése egyszerűen. 
            Kövesd nyomon a karbantartásokat, kiadásokat és tankolásokat egy helyen. 
            Ideális saját célra és kisebb flottákhoz.
          </p>
          
          {/* Badge-ek - Arany kerettel hover esetén */}
          <div className="mt-8 flex justify-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="border border-slate-700 px-3 py-1 rounded-full hover:border-amber-500 hover:text-amber-500 transition-colors cursor-default">Digitális Szervizkönyv</span>
            <span className="border border-slate-700 px-3 py-1 rounded-full hover:border-amber-500 hover:text-amber-500 transition-colors cursor-default">Költségkövetés</span>
          </div>
        </div>
      </div>

      {/* --- JOBB OLDAL: Form --- */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative shadow-2xl lg:shadow-none">
         
         {/* Logo mobilon */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
            <Logo className="w-8 h-8 text-amber-600" />
            <span className="font-bold text-xl text-slate-900 uppercase tracking-tight">DriveSync</span>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {mode === 'signin' ? 'Bejelentkezés' : 'Fiók létrehozása'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {mode === 'signin' ? 'Nincs még DriveSync fiókja?' : 'Már van fiókja?'}{' '}
              <Link 
                href={mode === 'signin' ? '/login?mode=signup' : '/login?mode=signin'} 
                className="font-bold text-amber-600 hover:text-amber-500 transition-colors"
              >
                {mode === 'signin' ? 'Regisztráljon ingyen' : 'Jelentkezzen be'}
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {/* GOOGLE GOMB */}
            <div className="mb-6">
              <form action={signInWithGoogle}>
                <button
                  className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 transition-all duration-200"
                >
                  <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path
                      d="M12.0003 20.45c4.6667 0 8.0834-3.2083 8.0834-8.25 0-.6667-.0834-1.2917-.2084-1.875h-7.875v3.4583h4.4584c-.2084 1.3333-1.4167 3.8333-4.4584 3.8333-2.7083 0-4.9166-1.8333-5.75-4.2916h-3.0417v2.3333c1.5 2.9167 4.5 4.7917 8.0834 4.7917z"
                      fill="#34A853"
                    />
                    <path
                      d="M12.0003 7.375c2.3334 0 4.0834 1.0417 5.0417 1.9583l2.5417-2.5416c-1.7084-1.5834-4.2084-2.7917-7.5834-2.7917-3.5833 0-6.5833 1.875-8.0833 4.7917l3.0416 2.3333c.8334-2.4583 3.0417-4.2917 5.75-4.2917z"
                      fill="#EA4335"
                    />
                    <path
                      d="M6.2503 14.5417c-.4167-1.25-.4167-2.5834 0-3.8334l-3.0416-2.3333c-1.375 2.75-1.375 6.0417 0 8.7917l3.0416-2.3334z"
                      fill="#FBBC05"
                    />
                  </svg>
                  <span className="text-sm">Folytatás Google fiókkal</span>
                </button>
              </form>
            </div>

            {/* Elválasztó */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">vagy email címmel</span>
              </div>
            </div>

            {/* EMAIL FORM */}
            <form className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email cím
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="pelda@mail.com"
                    className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2.5 placeholder-slate-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Jelszó
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    placeholder="••••••••"
                    className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2.5 placeholder-slate-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm transition-shadow"
                  />
                </div>
              </div>

              {/* Üzenetek */}
              {message && (
                <div className={`p-3 rounded-md text-sm flex items-center gap-2 border-l-4 ${
                  message.toLowerCase().includes('hiba') || message.toLowerCase().includes('error')
                    ? 'bg-red-50 text-red-700 border-red-500' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-500'
                }`}>
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                     {message.toLowerCase().includes('hiba') || message.toLowerCase().includes('error') ? (
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     ) : (
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                     )}
                  </svg>
                  {message}
                </div>
              )}

              <div>
                <button
                  formAction={mode === 'signin' ? login : signup}
                  className="flex w-full justify-center rounded-md bg-amber-500 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition-all duration-200 transform active:scale-[0.98]"
                >
                  {mode === 'signin' ? 'BELÉPÉS' : 'FIÓK LÉTREHOZÁSA'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-6 left-0 w-full text-center">
             <span className="text-xs text-slate-400">© 2025 DriveSync Technologies | v0.1</span>
        </div>
      </div>
    </div>
  )
}

function Logo({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
      <path d="M14.7 9a3 3 0 0 0-4.2 0L5 14.5a2.12 2.12 0 0 0 3 3l5.5-5.5" opacity="0.5" />
    </svg>
  )
}