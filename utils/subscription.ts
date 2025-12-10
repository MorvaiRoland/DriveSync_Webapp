import { createClient } from '@/supabase/server'

// 1. Definiáljuk a csomagok típusát
export type SubscriptionPlan = 'free' | 'pro' | 'founder';

// 2. Definiáljuk, hogy milyen beállításai vannak egy csomagnak (Interface)
interface PlanConfig {
  maxCars: number;
  allowDocuments: boolean;
  allowExport: boolean;
  allowAi: boolean;
  allowReminders: boolean;
}

// 3. Szigorúan típusos konfiguráció
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    maxCars: 1,
    allowDocuments: false,
    allowExport: false,
    allowAi: false,
    allowReminders: true, 
  },
  pro: {
    maxCars: 10,
    allowDocuments: true,
    allowExport: true,
    allowAi: true,
    allowReminders: true,
  },
  founder: {
    maxCars: 999,
    allowDocuments: true,
    allowExport: true,
    allowAi: true,
    allowReminders: true,
  }
};

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionPlan> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('status, plan_type')
    .eq('user_id', userId)
    .single();

  const isActive = data?.status === 'active' || data?.status === 'trialing';
  // Kényszerítjük a típust, hogy biztosan SubscriptionPlan legyen
  const planType = data?.plan_type as SubscriptionPlan;

  if (isActive && (planType === 'pro' || planType === 'founder')) {
      return planType;
  }

  return 'free';
}

// 4. A függvény, ami biztosan boolean-t ad vissza
export function checkLimit(
  plan: SubscriptionPlan, 
  feature: keyof PlanConfig, 
  currentCount: number = 0
): boolean {
  const limits = PLAN_LIMITS[plan];
  
  if (feature === 'maxCars') {
    return currentCount < limits.maxCars;
  }
  
  // Mivel a maxCars-t már kezeltük, a maradék property biztosan boolean,
  // de a biztonság kedvéért kényszerítjük a boolean visszatérést (!!)
  return !!limits[feature as keyof PlanConfig]; 
}