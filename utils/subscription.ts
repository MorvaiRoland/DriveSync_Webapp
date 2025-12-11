import { createClient } from '@/supabase/server'

// 1. Csomag típusok
export type SubscriptionPlan = 'free' | 'pro' | 'lifetime';

// 2. Beállítások interface
interface PlanConfig {
  maxCars: number;
  allowDocuments: boolean;
  allowExport: boolean;
  allowAi: boolean; // <--- EZT KERESSÜK MAJD
  allowReminders: boolean;
}

// 3. Konfiguráció
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    maxCars: 1,
    allowDocuments: false,
    allowExport: false,
    allowAi: false, // Ingyenes csomagban tiltva
    allowReminders: true, 
  },
  pro: {
    maxCars: 10,
    allowDocuments: true,
    allowExport: true,
    allowAi: true, // Pro csomagban engedélyezve
    allowReminders: true,
  },
  lifetime: {
    maxCars: 999,
    allowDocuments: true,
    allowExport: true,
    allowAi: true, // Founder csomagban engedélyezve
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
  const planType = data?.plan_type as SubscriptionPlan;

  if (isActive && (planType === 'pro' || planType === 'lifetime')) {
      return planType;
  }

  return 'free';
}

export function checkLimit(
  plan: SubscriptionPlan, 
  feature: keyof PlanConfig, 
  currentCount: number = 0
): boolean {
  const limits = PLAN_LIMITS[plan];
  
  if (feature === 'maxCars') {
    return currentCount < limits.maxCars;
  }
  
  // Minden más feature boolean
  return !!limits[feature]; 
}