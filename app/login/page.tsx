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
  const isLogin = mode === 'signin'

  return (
    // JAVÍTÁS: Különálló, teljes képernyős elrendezés, ami mobilon is görgethető, ha kell
    <div className="min-h-screen w-full bg-slate-950 font-sans text-slate-200 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30 overflow-y-auto h-screen w-full overflow-y-auto overscroll-none">
      
      {/* Háttér (halványabb, hogy ne zavarja az olvasást) */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-amber-600/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Login Kártya */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Fejléc */}
        <div className="text-center mb-8">
            <Link href="/" className="inline-block relative w-20 h-20 mb-4 transition-transform hover:scale-105">
                <Image 
                    src="/drivesync-logo.png" 
                    alt="DriveSync Logo" 
                    fill 
                    className="object-contain" 
                    priority
                />
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
                {isLogin ? 'Üdvözlünk újra!' : 'Fiók létrehozása'}
            </h1>
            <p className="text-slate-400 text-sm">
                {isLogin ? 'Jelentkezz be a garázsod kezeléséhez.' : 'Csatlakozz ingyenesen a DriveSync-hez.'}
            </p>
        </div>

        {/* Google Gomb */}
        <form action={signInWithGoogle} className="mb-6">
            <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100 transition-all active:scale-[0.98]">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Folytatás Google fiókkal</span>
            </button>
        </form>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-slate-900 px-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">vagy email</span>
            </div>
        </div>

        {/* Email Form */}
        <form className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email cím</label>
                <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="pelda@mail.com" 
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3.5 px-4 text-white shadow-sm placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" 
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Jelszó</label>
                <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3.5 px-4 text-white shadow-sm placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" 
                />
            </div>

            {/* Hibaüzenet */}
            {message && (
                <div className={`p-3 rounded-xl text-sm border flex items-center gap-2 ${message.toLowerCase().includes('hiba') || message.toLowerCase().includes('error') ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-green-500/10 border-green-500/20 text-green-300'}`}>
                    <span>{message}</span>
                </div>
            )}

            <button 
                formAction={isLogin ? login : signup} 
                className="w-full flex justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 transition-all transform active:scale-[0.98] uppercase tracking-wide"
            >
                {isLogin ? 'Belépés' : 'Fiók létrehozása'}
            </button>
        </form>

        {/* Váltó Gomb */}
        <div className="mt-8 text-center pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400">
                {isLogin ? 'Nincs még fiókod?' : 'Már regisztráltál?'} {' '}
                <Link 
                    href={isLogin ? '/login?mode=signup' : '/login?mode=signin'} 
                    className="font-bold text-amber-500 hover:text-amber-400 transition-colors hover:underline"
                >
                    {isLogin ? 'Regisztrálj ingyen' : 'Jelentkezz be'}
                </Link>
            </p>
        </div>

      </div>

      <div className="mt-8 text-xs text-slate-600 z-10">
         © 2025 DriveSync Technologies
      </div>
    </div>
  )
}