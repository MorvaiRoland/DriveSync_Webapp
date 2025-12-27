import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import CostAnalyticsDashboard from '@/components/CostAnalyticsDashboard'

export const metadata = {
  title: 'Költség Analitika | DriveSync 2025',
  description: 'Profi költségelemzés és budget tervező.'
}

export default async function CostAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('id, make, model, plate, fuel_type, image_url').eq('user_id', user.id),
    supabase.from('events').select('*').eq('user_id', user.id).order('event_date', { ascending: false })
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []

  if (cars.length === 0) return redirect('/')

  return (
    // JAVÍTÁS: bg-background és text-foreground használata a fix színek helyett
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/30 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      {/* Modern Háttér elemek - Halványítva világos módban */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
         {/* Noise textúra finomítása */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] dark:opacity-[0.03] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Vissza gomb - Témafüggő színekkel */}
        <div className="mb-10">
          <a
            href="/"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary/50 dark:bg-white/5 border border-border hover:bg-secondary dark:hover:bg-white/10 transition-all text-sm font-bold backdrop-blur-md shadow-sm dark:shadow-none"
          >
            <span className="group-hover:-translate-x-1 transition-transform text-primary">←</span> 
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">Dashboard</span>
          </a>
        </div>

        <CostAnalyticsDashboard events={events} cars={cars} />
      </div>
    </div>
  )
}