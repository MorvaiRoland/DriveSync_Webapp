// app/login/page.tsx
import Image from 'next/image';
import AuthForm from '@/components/AuthForm';
import { LoginSidePanel } from './components/LoginSidePanel'; // Ezt hozd létre lentebb!

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams;
  const message = typeof searchParams.message === 'string' ? searchParams.message : null;
  const mode = searchParams.mode === 'signup' ? 'signup' : 'signin';
  const isLogin = mode === 'signin';

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-200 overflow-hidden selection:bg-amber-500/30">
      
      {/* --- BAL OLDAL (Kliens komponens a mozgó effektekhez) --- */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-slate-900 border-r border-white/5">
         <LoginSidePanel />
      </div>

      {/* --- JOBB OLDAL (Form - Szerver/Kliens hibrid) --- */}
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-slate-950 relative w-full h-full min-h-screen z-10">
        
        {/* Mobile Background Effects */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">
           <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-amber-600/10 rounded-full blur-[80px] animate-pulse"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[80px]"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm relative z-20">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                 <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Dynamic<span className="text-amber-500">Sense</span>
              </h1>
              <p className="text-slate-500 text-sm mt-2">Jelentkezz be a garázsodba.</p>
          </div>

          {/* A tényleges Auth Form (Glass effektussal mobilon) */}
          <div className="relative group">
              {/* Glow effect behind form */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              
              <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl">
                 <AuthForm isLogin={isLogin} message={message} />
              </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-600 lg:hidden">
            © 2025 DynamicSense Technologies
          </div>
        </div>
      </div>
    </div>
  )
}