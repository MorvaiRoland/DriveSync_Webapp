import Image from 'next/image';
import { Shield, Zap, Terminal } from 'lucide-react';
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
      {/* SAFE AREA PROTECTION: pt-[env(safe-area-inset-top)] 
          A teljes képernyős élmény érdekében fixed inset-0
      */}
      <div className="fixed inset-0 w-full h-[100dvh] bg-background font-sans text-foreground overflow-hidden touch-none flex z-50">
        
        {/* === MOBILE BACKGROUND (Neon Glow) === */}
        <div className="absolute inset-0 z-0 lg:hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 grayscale">
            <source src="/login.mp4" type="video/mp4" />
          </video>
        </div>

        {/* === DESKTOP SIDE PANEL (Bento Left) === */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-slate-950 border-r border-white/5 z-20">
            <LoginSidePanel />
            <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-30 z-30" />
        </div>

        {/* === FORM CONTAINER AREA (Right Side) === */}
        <div className="flex-1 flex flex-col relative w-full h-full z-10 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          
          <div className="w-full h-full flex flex-col p-6 lg:p-12 overflow-y-auto no-scrollbar scroll-smooth">
            
            {/* 1. MOBILE HEADER */}
            <div className="lg:hidden flex flex-col items-center justify-center shrink-0 py-8">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 relative">
                     <Image src="/DynamicSense-logo.png" alt="DS Logo" fill className="object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                  </div>
                  <span className="text-2xl font-black text-white tracking-tighter uppercase italic">
                    Dynamic<span className="text-primary">Sense</span>
                  </span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Ready</span>
               </div>
            </div>

            {/* 2. FORM CARD - Apex Style Bento */}
            <div className="flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto z-20 py-4">
               <div className="relative group transition-all duration-700">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/10 to-primary/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                  
                  {/* Kártya test */}
                  <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-10 ring-1 ring-white/5">
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50" />
                     
                     <div className="mb-8 space-y-1">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Bejelentkezés</h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hozzáférés a központi maghoz</p>
                     </div>

                     <AuthForm isLogin={isLogin} message={message} />
                  </div>
               </div>
            </div>

            {/* 3. FOOTER */}
            <div className="mt-auto flex justify-between items-end pb-4 text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] shrink-0 w-full max-w-[420px] mx-auto">
                <span className="opacity-50">v2.5 Béta</span>
                <span className="flex items-center gap-1.5 text-primary">
                  <Terminal size={10} /> Encrypted Session
                </span>
            </div>

          </div>
        </div>
      </div>
    </LoginClientWrapper>
  );
}