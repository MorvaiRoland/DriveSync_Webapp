import Image from 'next/image';
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
      {/* A fő konténer relative, hogy a mobil videó háttér működjön */}
      <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-200 overflow-hidden relative">
        
        {/* --- MOBILE CINEMATIC BACKGROUND (Csak mobilon aktív: lg:hidden) --- */}
        {/* Ez biztosítja, hogy telefonon is meglegyen a WOW faktor */}
        <div className="absolute inset-0 z-0 lg:hidden overflow-hidden">
            {/* Sötétítő rétegek, hogy a szöveg olvasható legyen a videó felett */}
            <div className="absolute inset-0 bg-slate-950/80 z-10 mix-blend-multiply"></div> 
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/80 z-10"></div>
            
            {/* Scanline effekt mobilon is */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent z-20 animate-scanline opacity-30"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] z-20 pointer-events-none"></div>

            {/* A háttérvideó */}
            <video 
                autoPlay 
                loop 
                muted 
                playsInline // FONTOS: Ez kell, hogy iPhone-on ne nyíljon meg teljes képernyőn a player
                className="w-full h-full object-cover scale-110 blur-[2px]"
            >
                <source src="/video.mp4" type="video/mp4" />
            </video>
        </div>


        {/* --- DESKTOP SIDE PANEL (Csak nagy képernyőn: hidden lg:flex) --- */}
        <div className="hidden lg:flex lg:w-[65%] xl:w-[70%] relative overflow-hidden bg-slate-900 border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.8)] z-20">
           <LoginSidePanel />
           {/* Fénycsík a két panel találkozásánál */}
           <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-amber-500/50 to-transparent opacity-50 z-30"></div>
        </div>


        {/* --- JOBB OLDAL / MOBILE FORM AREA --- */}
        {/* Mobilon átlátszó a háttér, hogy látszódjon a videó, Desktopon sötétített üveg */}
        <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative w-full h-full min-h-screen z-10 lg:bg-slate-950/80 lg:backdrop-blur-md">
          
          {/* Form Container */}
          <div className="w-full max-w-[420px] relative z-20">
            
            {/* Mobile Header - Kicsit "tech" stílusosabb */}
            <div className="lg:hidden text-center mb-10 relative">
                <div className="relative w-24 h-24 mx-auto mb-6">
                   {/* Forgó effekt mobilon is */}
                   <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-spin-slow"></div>
                   <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain p-2 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-widest uppercase drop-shadow-lg">
                  Dynamic<span className="text-amber-500">Sense</span>
                </h1>
                <div className="flex justify-center items-center gap-2 mt-3 opacity-80">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-slate-300 text-[10px] font-mono uppercase tracking-[0.2em]">System Online</p>
                </div>
            </div>

            {/* A tényleges Auth Form - HUD Stílusban */}
            <div className="relative group transition-all duration-500">
                {/* Háttér fény (Glow) */}
                <div className="absolute -inset-[1px] bg-gradient-to-b from-amber-500/30 via-transparent to-indigo-500/30 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-500"></div>
                
                {/* Üveg hatású kártya - Mobilon kicsit sötétebb, hogy olvasható legyen */}
                <div className="relative bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl ring-1 ring-white/5 relative overflow-hidden">
                   
                   {/* Scanline effekt a formon belül */}
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500/30 animate-scanline-fast opacity-30 pointer-events-none"></div>

                   {/* Desktop Header */}
                   <div className="hidden lg:block mb-8">
                      <h2 className="text-2xl font-bold text-white">{isLogin ? 'Üdvözöljük vissza.' : 'Fiók létrehozása.'}</h2>
                      <p className="text-slate-400 text-sm mt-2">
                          {isLogin ? 'Jelentkezzen be a folytatáshoz.' : 'Kezdje meg a digitális garázs építését.'}
                      </p>
                   </div>

                   <AuthForm isLogin={isLogin} message={message} />
                </div>
            </div>

            {/* Footer Tech Text */}
            <div className="mt-8 lg:mt-12 flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-widest opacity-70">
              <div>Ver: <span className="text-white">2.4.0</span></div>
              <div className="flex items-center gap-1"><Shield size={10} /> Secure</div>
            </div>
          </div>
        </div>
      </div>
    </LoginClientWrapper>
  );
}

// Importáljuk a Shield ikont a footerhez, ha még nincs
import { Shield } from 'lucide-react';