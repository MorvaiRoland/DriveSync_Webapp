import { SupabaseClient } from '@supabase/supabase-js'

export type SubscriptionPlan = 'free' | 'pro' | 'lifetime';

export const PLAN_LIMITS = {
  free: {
    maxCars: 1,
    aiMechanic: false,
    sharedGarage: false,
    cloudSync: true, // Alap szinkronizáció marad
    export: false, // Export letiltva
    storage: false,
    serviceMap: false,
    vinSearch: false,
    tripPlanner: false,
    mileageLog: false // Útnyilvántartás (Trips) letiltva
  },
  pro: {
    maxCars: 10,
    aiMechanic: true,
    sharedGarage: true,
    cloudSync: true,
    export: true, // Export engedélyezve
    storage: true,
    serviceMap: true,
    vinSearch: true,
    tripPlanner: true,
    mileageLog: true // Útnyilvántartás engedélyezve
  },
  lifetime: {
    maxCars: 999,
    aiMechanic: true,
    sharedGarage: true,
    cloudSync: true,
    export: true, // Export engedélyezve
    storage: true,
    serviceMap: true,
    vinSearch: true,
    tripPlanner: true,
    mileageLog: true // Útnyilvántartás engedélyezve
  }
};

export async function getSubscriptionStatus(supabase: SupabaseClient, userId: string) {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: config } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'early_access')
    .single();

  const earlyAccess = config?.value || { enabled: false };

  if (earlyAccess.enabled && sub?.plan_type !== 'lifetime') {
     return { 
       plan: 'pro' as SubscriptionPlan, 
       isTrial: true, 
       status: 'active' 
     };
  }

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

export async function checkLimit(supabase: SupabaseClient, userId: string, feature: keyof typeof PLAN_LIMITS['free']) {
  const { plan } = await getSubscriptionStatus(supabase, userId);
  const limits = PLAN_LIMITS[plan];

  if (feature === 'maxCars') {
    const { count } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    return (count || 0) < limits.maxCars;
  }

  return limits[feature];
}