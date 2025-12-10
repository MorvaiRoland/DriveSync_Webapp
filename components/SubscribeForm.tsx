// components/SubscribeForm.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { subscribeToWaitlist } from '@/app/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      disabled={pending} 
      className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] shadow-lg shadow-white/5"
    >
      {pending ? (
        <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
      ) : (
        'Feliratkozás'
      )}
    </button>
  )
}

export default function SubscribeForm() {
   // Kezdeti állapot
   const [state, formAction] = useFormState(subscribeToWaitlist, { success: false, message: '' })

   if (state.success) {
     return (
       <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl text-center animate-in zoom-in duration-300 backdrop-blur-md">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="font-bold text-lg">{state.message}</p>
          <p className="text-sm mt-1 text-emerald-500/70">Hamarosan hallasz felőlünk!</p>
       </div>
     )
   }

   return (
     <form action={formAction} className="w-full relative group max-w-lg mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
        <div className="relative flex flex-col sm:flex-row gap-2 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/50 shadow-2xl">
          <input 
           name="email"
           type="email" 
           placeholder="E-mail címed..." 
           required
           className="flex-1 bg-transparent border border-transparent focus:border-slate-600 rounded-xl text-white px-4 py-3 focus:outline-none focus:ring-0 placeholder-slate-500 transition-colors font-medium"
          />
          <SubmitButton />
        </div>
        {state.message && !state.success && (
          <p className="text-red-400 text-sm mt-3 text-center bg-red-900/20 py-2 rounded-lg border border-red-900/50 animate-in fade-in slide-in-from-top-2">
            ⚠️ {state.message}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-4 text-center">
          Csatlakozz a várólistához és kapj <span className="text-amber-500 font-bold">Launch Edition</span> státuszt induláskor.
        </p>
     </form>
   )
}