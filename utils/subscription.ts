import { SupabaseClient } from '@supabase/supabase-js'

export type SubscriptionPlan = 'free' | 'pro' | 'lifetime';

export const PLAN_LIMITS = {
  free: {
    maxCars: 1,
    aiMechanic: false,
    sharedGarage: false,
    cloudSync: true,
    export: false,
    storage: false,
    // ÚJ PRÉMIUM FUNKCIÓK (Ingyenesben kikapcsolva)
    serviceMap: false,
    vinSearch: false,
    tripPlanner: false
  },
  pro: {
    maxCars: 10,
    aiMechanic: true,
    sharedGarage: true,
    cloudSync: true,
    export: true,
    storage: true,
    // ÚJ PRÉMIUM FUNKCIÓK (Próban bekapcsolva)
    serviceMap: true,
    vinSearch: true,
    tripPlanner: true
  },
  lifetime: {
    maxCars: 999,
    aiMechanic: true,
    sharedGarage: true,
    cloudSync: true,
    export: true,
    storage: true,
    // ÚJ PRÉMIUM FUNKCIÓK (Lifetimeban bekapcsolva)
    serviceMap: true,
    vinSearch: true,
    tripPlanner: true
  }
};

export async function getSubscriptionStatus(supabase: SupabaseClient, userId: string) {
  // 1. Megnézzük a user konkrét előfizetését
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 2. Megnézzük az Admin Konfigurációt (Early Access)
  const { data: config } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'early_access')
    .single();

  const earlyAccess = config?.value || { enabled: false };

  // --- EARLY ACCESS LOGIKA ---
  // Ha be van kapcsolva az Early Access, ÉS a usernek nincs már 'lifetime' csomagja:
  // Akkor automatikusan PRO jogokat kap.
  if (earlyAccess.enabled && sub?.plan_type !== 'lifetime') {
     return { 
       plan: 'pro' as SubscriptionPlan, 
       isTrial: true, 
       status: 'active' 
     };
  }

  // Ha nincs előfizetés rekordja és nincs Early Access, akkor FREE
  if (!sub) {
     return { plan: 'free' as SubscriptionPlan, status: 'active', isTrial: false };
  }

  return {
    plan: sub.plan_type as SubscriptionPlan,
    status: sub.status,
    periodEnd: sub.current_period_end,
    isTrial: false
  };
}

// Segédfüggvény a limitek ellenőrzésére
export async function checkLimit(supabase: SupabaseClient, userId: string, feature: keyof typeof PLAN_LIMITS['free']) {
  const { plan } = await getSubscriptionStatus(supabase, userId);
  const limits = PLAN_LIMITS[plan];

  if (feature === 'maxCars') {
    const { count } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    return (count || 0) < limits.maxCars;
  }

  return limits[feature];
}