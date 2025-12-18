import Image from 'next/image';
import { Shield } from 'lucide-react';

// Saját komponensek importálása
import AuthForm from '@/components/AuthForm';
import { LoginSidePanel } from './components/LoginSidePanel';
import { LoginClientWrapper } from './components/LoginClientWrapper';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  // Next.js 15+ esetén a searchParams aszinkron
  const searchParams = await props.searchParams;
  const message = typeof searchParams.message === 'string' ? searchParams.message : null;
  const mode = searchParams.mode === 'signup' ? 'signup' : 'signin';
  const isLogin = mode === 'signin';

  return (
    <LoginClientWrapper>
      {/* MAIN CONTAINER 
        h-[100dvh]: A 'dynamic viewport height' kezeli a mobilos címsor ugrálását.
        overflow-hidden: Megakadályozza a teljes oldal görgetését, csak a tartalom görögjön.
      */}
      <div className="flex h-[100dvh] w-full bg-slate-950 font-sans text-slate-200 overflow-hidden relative">
        
        {/* ==============================================
            MOBILE HÁTTÉR (Csak mobilon: lg:hidden)
            Ez biztosítja a "cinematic" élményt telefonon.
           ============================================== */}
        <div className="absolute inset-0 z-0 lg:hidden pointer-events-none">
          {/* Sötétítés és effektek */}
          <div className="absolute inset-0 bg-slate-950/80 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80 z-10" />
          
          {/* Textúrák */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent z-20 animate-scanline opacity-30" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] z-20" />

          {/* Háttérvideó */}
          <video 
            autoPlay loop muted playsInline 
            className="w-full h-full object-cover scale-110 blur-[2px]"
          >
            <source src="/login.mp4" type="video/mp4" />
          </video>
        </div>

        {/* ==============================================
            DESKTOP BAL OLDAL (Side Panel)
            Csak nagy képernyőn látszik (hidden lg:flex)
           ============================================== */}
        <div className="hidden lg:flex lg:w-[60%] xl:w-[65%] relative overflow-hidden bg-slate-900 border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.8)] z-20">
           <LoginSidePanel />
           {/* Elválasztó vonal effekt */}
           <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-amber-500/50 to-transparent opacity-50 z-30" />
        </div>

        {/* ==============================================
            JOBB OLDAL / MOBILE FORM AREA
            Ez a rész tartalmazza a bejelentkező űrlapot.
           ============================================== */}
        <div className="flex flex-1 flex-col relative w-full h-full z-10 lg:bg-slate-950/80 lg:backdrop-blur-md">
          
          {/* Görgethető konténer (overflow-y-auto):
            Ez kritikus mobilon! Ha felugrik a billentyűzet, így görgethető marad a form,
            és nem takaródik ki a 'Bejelentkezés' gomb.
          */}
          <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center p-4 py-8 scrollbar-hide">
            
            {/* Form Wrapper */}
            <div className="w-full max-w-[420px] relative z-20 flex flex-col items-center">
              
              {/* --- MOBILE HEADER LOGO --- */}
              <div className="lg:hidden text-center mb-8 relative shrink-0">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                     <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-spin-slow" />
                     <Image 
                        src="/DynamicSense-logo.png" 
                        alt="Logo" 
                        fill 
                        className="object-contain p-2 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" 
                     />
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-widest uppercase drop-shadow-lg">
                    Dynamic<span className="text-amber-500">Sense</span>
                  </h1>
                  <div className="flex justify-center items-center gap-2 mt-2 opacity-80">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-slate-300 text-[10px] font-mono uppercase tracking-[0.2em]">System Online</p>
                  </div>
              </div>

              {/* --- AUTH FORM CARD --- */}
              <div className="relative group w-full transition-all duration-500">
                  {/* Glow effekt a kártya mögött */}
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-amber-500/30 via-transparent to-indigo-500/30 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
                  
                  <div className="relative bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl ring-1 ring-white/5 overflow-hidden">
                     
                     {/* Textúrák a kártyán belül */}
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
                     <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500/30 animate-scanline-fast opacity-30 pointer-events-none" />

                     {/* Desktop Címsor */}
                     <div className="hidden lg:block mb-8">
                        <h2 className="text-2xl font-bold text-white">
                          {isLogin ? 'Üdvözöljük vissza.' : 'Fiók létrehozása.'}
                        </h2>
                        <p className="text-slate-400 text-sm mt-2">
                            {isLogin ? 'Jelentkezzen be a folytatáshoz.' : 'Kezdje meg a digitális garázs építését.'}
                        </p>
                     </div>

                     {/* A tényleges form komponens */}
                     <AuthForm isLogin={isLogin} message={message} />
                  </div>
              </div>

              {/* --- FOOTER TECH INFO --- */}
              <div className="mt-8 w-full flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-widest opacity-70">
                <div>Ver: <span className="text-white">2.3.0</span></div>
                <div className="flex items-center gap-1"><Shield size={10} /> Secure</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </LoginClientWrapper>
  );
}