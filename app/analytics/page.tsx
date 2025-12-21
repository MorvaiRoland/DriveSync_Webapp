import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import CostAnalyticsDashboard from '@/components/CostAnalyticsDashboard'

export const metadata = {
  title: 'Költség Analitika | DriveSync',
  description: 'Teljes költségelemzés, költségvetés kalkulátor és trendek az autóddal kapcsolatban.'
}

export default async function CostAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Adatlekérések párhuzamosan
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('id, make, model, plate, fuel_type, image_url').eq('user_id', user.id),
    supabase.from('events').select('*').eq('user_id', user.id).order('event_date', { ascending: false })
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []

  // Ha nincs autó, visszairánytunk
  if (cars.length === 0) {
    return redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigáció */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold text-sm"
          >
            ← Vissza a dashboardra
          </a>
        </div>

        {/* Fő tartalom */}
        <CostAnalyticsDashboard events={events} cars={cars} />
      </div>
    </div>
  )
}
