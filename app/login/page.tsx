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
      <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-200 overflow-hidden selection:bg-amber-500/30">
        
        {/* --- BAL OLDAL (Holografikus Dashboard) --- */}
        <div className="hidden lg:flex lg:w-[60%] xl:w-[65%] relative overflow-hidden bg-slate-900 border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-20">
           <LoginSidePanel />
        </div>

        {/* --- JOBB OLDAL (Form Area) --- */}
        <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-slate-950 relative w-full h-full min-h-screen z-10">
          
          {/* Mobile Background Effects */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[100vw] h-[100vw] bg-amber-600/5 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-indigo-600/5 rounded-full blur-[100px]"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
          </div>

          {/* Form Container */}
          <div className="w-full max-w-[400px] relative z-20">
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-10">
                <div className="relative w-24 h-24 mx-auto mb-6 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                   <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter">
                  Dynamic<span className="text-amber-500">Sense</span>
                </h1>
                <p className="text-slate-500 text-sm mt-3 font-medium">A garázsod digitális kulcsa.</p>
            </div>

            {/* A tényleges Auth Form */}
            {/* Itt egy trükk: a 'group' osztályt használjuk a hover effekthez */}
            <div className="relative group transition-all duration-500 hover:scale-[1.01]">
                {/* Neon Glow Border Effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-br from-amber-500/50 via-transparent to-indigo-500/50 rounded-2xl blur-sm opacity-30 group-hover:opacity-100 transition duration-500"></div>
                
                {/* Form Background */}
                <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl ring-1 ring-white/5">
                   <AuthForm isLogin={isLogin} message={message} />
                </div>
            </div>

            <div className="mt-10 text-center text-[10px] text-slate-600 font-mono lg:hidden uppercase tracking-widest">
              Secured by DynamicSense Auth v2.0
            </div>
          </div>
        </div>
      </div>
    </LoginClientWrapper>
  );
}