import Image from 'next/image'
import AuthForm from '@/components/AuthForm'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === 'string' ? searchParams.message : null
  
  const mode = searchParams.mode === 'signup' ? 'signup' : 'signin'
  const isLogin = mode === 'signin'

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-200">
      
      {/* BAL OLDAL (Dekoráció) */}
      <div className="relative hidden w-0 flex-1 lg:flex lg:flex-col lg:justify-center lg:items-center bg-slate-900 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-90 z-0"></div>
        <div className="absolute -top-[20%] -left-[20%] w-[50vw] h-[50vw] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-12">
           <div className="relative w-64 h-64 mb-8 animate-in zoom-in duration-700">
             <Image src="/drivesync-logo.png" alt="DriveSync Logo" fill className="object-contain drop-shadow-2xl" priority />
           </div>
           <h1 className="text-5xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
             Drive<span className="text-amber-500">Sync</span>
           </h1>
           <p className="text-xl text-slate-400 max-w-md leading-relaxed font-light">
             Prémium garázsmenedzsment a zsebedben.<br/>
             <span className="text-amber-500/90 italic font-serif mt-2 block">"Just drive. We Sync."</span>
           </p>
        </div>
        <div className="absolute bottom-8 text-xs text-slate-600 z-10">© 2025 DriveSync Technologies</div>
      </div>

      {/* JOBB OLDAL (Form) */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-slate-950 relative w-full lg:w-[600px]">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-600/20 rounded-full blur-[80px]"></div>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96 relative z-10">
          <div className="lg:hidden text-center mb-10">
              <div className="relative w-24 h-24 mx-auto mb-4">
                 <Image src="/drivesync-logo.png" alt="DriveSync Logo" fill className="object-contain" />
              </div>
              <h1 className="text-3xl font-black text-white">Drive<span className="text-amber-500">Sync</span></h1>
          </div>

          <AuthForm isLogin={isLogin} message={message} />

        </div>
      </div>
    </div>
  )
}