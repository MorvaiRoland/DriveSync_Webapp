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
        
        {/* --- MOBILE VIDEO BACKGROUND (Csak mobilon látszik) --- */}
        <div className="absolute inset-0 z-0 lg:hidden">
            <div className="absolute inset-0 bg-slate-950/70 z-10"></div> {/* Erősebb sötétítés mobilon a jobb olvashatóságért */}
             {/* Ugyanaz a videó, mint a sidepanelben */}
            <video 
                autoPlay loop muted playsInline
                className="w-full h-full object-cover blur-[4px]"
                src="https://videos.pexels.com/video-files/2887684/2887684-uhd_2160_4096_25fps.mp4" 
            />
        </div>


        {/* --- BAL OLDAL (Cinematic Panel - Desktopon) --- */}
        {/* Szélesebb lett (65%), hogy a videó jobban érvényesüljön */}
        <div className="hidden lg:flex lg:w-[65%] xl:w-[70%] relative overflow-hidden bg-slate-900 border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.8)] z-20">
           <LoginSidePanel />
           
           {/* Fénycsík a két panel találkozásánál */}
           <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-amber-500/50 to-transparent opacity-50 z-30"></div>
        </div>


        {/* --- JOBB OLDAL (Form Area) --- */}
        {/* Glassmorphism effektust kapott a háttér */}
        <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative w-full h-full min-h-screen z-10 lg:bg-slate-950/80 lg:backdrop-blur-md">
          
          {/* Form Container */}
          <div className="w-full max-w-[420px] relative z-20">
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-12">
                <div className="relative w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse-slow">
                   <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-widest uppercase">
                  Dynamic<span className="text-amber-500">Sense</span>
                </h1>
                <p className="text-amber-500/80 text-xs mt-3 font-mono uppercase tracking-[0.2em]">System Access Request</p>
            </div>

            {/* A tényleges Auth Form - HUD Stílusban */}
            <div className="relative group transition-all duration-500">
                {/* Háttér fény (Glow) */}
                <div className="absolute -inset-[1px] bg-gradient-to-b from-amber-500/20 via-transparent to-indigo-500/20 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-500"></div>
                
                {/* Üveg hatású kártya */}
                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl ring-1 ring-white/5 relative overflow-hidden">
                   
                   {/* Scanline effekt a form felett */}
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500/30 animate-scanline-fast opacity-30 pointer-events-none"></div>

                   {/* Fejléc a formon belül desktopon */}
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
            <div className="mt-12 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              <div>Status: <span className="text-emerald-500 animate-pulse">Online</span></div>
              <div>Secure Connection V2.3</div>
            </div>
          </div>
        </div>
      </div>
    </LoginClientWrapper>
  );
}