import Image from 'next/image';
import { Shield, Zap } from 'lucide-react';

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
      {/* GLOBAL CONTAINER
         fixed inset-0: Rögzítjük a teljes nézetet, hogy ne lehessen "kihúzni".
         touch-none: Letiltja a görgetést érintőképernyőn.
         z-50: Biztosítjuk, hogy ez legyen legfelül.
      */}
      <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 font-sans text-slate-200 overflow-hidden touch-none flex z-50">
        
        {/* === MOBILE BACKGROUND (Videó) === */}
        <div className="absolute inset-0 z-0 lg:hidden pointer-events-none select-none">
          <div className="absolute inset-0 bg-slate-950/90 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-amber-900/10 z-10 mix-blend-overlay" />
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40 blur-[3px]">
            <source src="/login.mp4" type="video/mp4" />
          </video>
        </div>

        {/* === DESKTOP SIDE PANEL (Bal oldal) === */}
        <div className="hidden lg:flex lg:w-[60%] xl:w-[65%] relative overflow-hidden bg-slate-900 border-r border-white/5 shadow-[20px_0_100px_rgba(0,0,0,1)] z-20">
           <LoginSidePanel />
           <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-amber-500/30 to-transparent opacity-50 z-30" />
        </div>

        {/* === FORM CONTAINER AREA (Jobb oldal / Mobil teljes képernyő) === */}
        <div className="flex-1 flex flex-col relative w-full h-full z-10 overflow-hidden">
          
          {/* BELSŐ SCROLL KONTÉNER (Ha a form mégis túl magas lenne kis képernyőn)
             overflow-y-auto: Csak itt engedünk görgetést, ha muszáj.
             no-scrollbar: Elrejtjük a gördítősávot.
          */}
          <div className="w-full h-full flex flex-col p-4 lg:p-12 overflow-y-auto no-scrollbar scroll-smooth overscroll-none" style={{ WebkitOverflowScrolling: 'auto', touchAction: 'none' }}>
            
            {/* 1. MOBILE HEADER (Spacer a tetején, hogy középre kerüljön a tartalom) */}
            <div className="lg:hidden min-h-[10%] flex flex-col items-center justify-center shrink-0 py-4">
               <div className="flex items-center gap-2 mb-1 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="w-8 h-8 relative">
                     <Image src="/DynamicSense-logo.png" alt="DS Logo" fill className="object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  </div>
                  <span className="text-xl font-black text-white tracking-widest uppercase">
                    Dynamic<span className="text-amber-500">Sense</span>
                  </span>
               </div>
               <div className="flex items-center gap-1.5 opacity-60">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-300">System Online</span>
               </div>
            </div>

            {/* 2. FORM CARD (Középre igazítva) */}
            <div className="flex-1 flex flex-col justify-center w-full max-w-[400px] mx-auto z-20 py-2">
               <div className="relative group transition-all duration-700">
                  {/* Háttér glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-500/20 via-transparent to-indigo-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition duration-700" />
                  
                  {/* Kártya test */}
                  <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 ring-1 ring-white/5">
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-50" />
                     
                     <AuthForm isLogin={isLogin} message={message} />
                  </div>
               </div>
            </div>

            {/* 3. FOOTER (Alulra tapadva) */}
            <div className="lg:mt-8 min-h-[5%] flex justify-between items-end pb-2 text-[9px] text-slate-500 font-mono uppercase tracking-widest shrink-0 w-full max-w-[400px] mx-auto">
                <span className="hover:text-slate-300 transition-colors cursor-default">v2.4.0 Béta</span>
                <span className="flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-default"><Shield size={9} /> Secure</span>
            </div>

          </div>
        </div>
      </div>
    </LoginClientWrapper>
  );
}