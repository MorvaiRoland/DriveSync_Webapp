import Image from 'next/image';
import { Shield, Zap, Terminal, Lock } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import { LoginSidePanel } from './components/LoginSidePanel';
import { LoginClientWrapper } from './components/LoginClientWrapper';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams;
  const message = typeof searchParams.message === 'string' ? searchParams.message : null;
  const mode = searchParams.mode === 'signup' ? 'signup' : 'signin';
  const isLogin = mode === 'signin';

  return (
    <LoginClientWrapper>
      {/* FULL SCREEN CONTAINER 
          A pt-[env(safe-area-inset-top)] biztosítja, hogy a mobil notch ne takarja ki a logót.
      */}
      <div className="fixed inset-0 w-full h-[100dvh] bg-[#020617] font-sans text-slate-200 overflow-hidden touch-none flex z-50 selection:bg-primary/30">
        
        {/* === MOBIL HÁTTÉR (NEON AMŐBÁK) === */}
        <div className="absolute inset-0 z-0 lg:hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[120vw] h-[120vw] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[100vw] h-[100vw] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
          {/* Háttérvideó finomítva */}
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 grayscale brightness-50">
            <source src="/login.mp4" type="video/mp4" />
          </video>
        </div>

        {/* === ASZTALI OLDALPANEL (BAL OLDAL) === */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-slate-950 border-r border-white/5 z-20">
            <LoginSidePanel />
            {/* Elválasztó fénycsík */}
            <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent opacity-30 z-30 shadow-[0_0_15px_#06b6d4]" />
        </div>

        {/* === FORM KONTÉNER (JOBB OLDAL / MOBIL TELJES) === */}
        <div className="flex-1 flex flex-col relative w-full h-full z-10 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          
          <div className="w-full h-full flex flex-col p-6 lg:p-12 overflow-y-auto no-scrollbar scroll-smooth">
            
            {/* 1. MOBIL FEJLÉC (Csak telefonon) */}
            <div className="lg:hidden flex flex-col items-center justify-center shrink-0 py-8">
               <div className="flex items-center gap-3 mb-2 group">
                  <div className="w-12 h-12 relative transition-transform duration-500 group-hover:rotate-[360deg]">
                     <Image src="/DynamicSense-logo.png" alt="DS Logo" fill className="object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" />
                  </div>
                  <span className="text-3xl font-black text-white tracking-tighter uppercase italic">
                    Dynamic<span className="text-primary drop-shadow-[0_0_10px_#06b6d4]">Sense</span>
                  </span>
               </div>
               <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Rendszer Üzemkész</span>
               </div>
            </div>

            {/* 2. BEJELENTKEZŐ KÁRTYA - Apex Bento Style */}
            <div className="flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto z-20 py-4">
               <div className="relative group transition-all duration-700">
                  {/* Külső ragyogás (Teal & Blue) */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-blue-500/20 to-primary/30 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000" />
                  
                  {/* Kártya test (Glassmorphism) */}
                  <div className="relative bg-[#0f172a]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-8 sm:p-10 ring-1 ring-white/5">
                     {/* Belső zaj textúra */}
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                     {/* Felső dekor csík */}
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                     
                     <div className="mb-10 space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                          <Lock size={12} className="fill-current" /> Biztonságos Belépés
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                          {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Lépjen be a központi vezérlőegységbe
                        </p>
                     </div>

                     <AuthForm isLogin={isLogin} message={message} />
                  </div>
               </div>
            </div>

            {/* 3. LÁBLÉC */}
            <div className="mt-auto flex justify-between items-end pb-4 text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] shrink-0 w-full max-w-[420px] mx-auto">
                <div className="flex flex-col gap-1">
                  <span className="opacity-50">Apex_OS v2.5.4 Béta</span>
                  <span className="text-primary/60">Build_2025.12.27</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10">
                  <Shield size={10} /> 
                  <span>Titkosított Kapcsolat</span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </LoginClientWrapper>
  );
}