// app/update-password/page.tsx
import Image from 'next/image'
import UpdatePasswordForm from '@/components/UpdatePasswordForm' // <-- Ezt importáljuk az AuthForm helyett

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UpdatePasswordPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === 'string' ? searchParams.message : null
  
  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-200">
      
      {/* BAL OLDAL (Dekoráció - ugyanaz marad) */}
      <div className="relative hidden w-0 flex-1 lg:flex lg:flex-col lg:justify-center lg:items-center bg-slate-900 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-90 z-0"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-12">
           <div className="relative w-64 h-64 mb-8 animate-in zoom-in duration-700">
             <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain drop-shadow-2xl" priority />
           </div>
           <h1 className="text-5xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
             Drive<span className="text-amber-500">Sync</span>
           </h1>
           <p className="text-xl text-slate-400 max-w-md leading-relaxed font-light">
             Jelszó biztonságos megújítása.
           </p>
        </div>
      </div>

      {/* JOBB OLDAL (Form) */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-slate-950 relative w-full lg:w-[600px]">
        <div className="mx-auto w-full max-w-sm lg:w-96 relative z-10">
          <div className="lg:hidden text-center mb-10">
              <h1 className="text-3xl font-black text-white">Drive<span className="text-amber-500">Sync</span></h1>
          </div>

          {/* ITT HASZNÁLJUK AZ ÚJ KOMPONENST */}
          <UpdatePasswordForm message={message} />

        </div>
      </div>
    </div>
  )
}