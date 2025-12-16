import { createClient } from '@/supabase/server'

// 1. Csomag típusok (Hozzáadtam a 'founder'-t a biztonság kedvéért)
export type SubscriptionPlan = 'free' | 'pro' | 'lifetime' | 'founder';

// 2. Beállítások interface
interface PlanConfig {
  maxCars: number;
  allowDocuments: boolean;
  allowExport: boolean;
  allowAi: boolean;
  allowReminders: boolean;
}

// 3. Konfiguráció
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    maxCars: 1,
    allowDocuments: false,
    allowExport: false,
    allowAi: false,
    allowReminders: true, 
  },
  pro: {
    maxCars: Infinity, // JAVÍTVA: 999 helyett Infinity a ∞ jelhez
    allowDocuments: true,
    allowExport: true,
    allowAi: true,
    allowReminders: true,
  },
  lifetime: {
    maxCars: Infinity, // JAVÍTVA
    allowDocuments: true,
    allowExport: true,
    allowAi: true,
    allowReminders: true,
  },
  founder: { // JAVÍTVA: Kompatibilitás a régi felhasználókkal
    maxCars: Infinity,
    allowDocuments: true,
    allowExport: true,
    allowAi: true,
    allowReminders: true,
  }
};

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionPlan> {
  const supabase = await createClient();
  
  // Hibakezelés: maybeSingle() biztonságosabb, ha véletlenül nincs rekord
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, plan_type')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return 'free';
  }

  const isActive = data.status === 'active' || data.status === 'trialing';
  // Itt a 'plan_type' stringet kényszerítjük a típusunkra
  const planType = data.plan_type as SubscriptionPlan;

  // Ellenőrizzük, hogy a planType érvényes-e a mi rendszerünkben
  const validPlans: SubscriptionPlan[] = ['pro', 'lifetime', 'founder'];

  if (isActive && validPlans.includes(planType)) {
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
    // Infinity esetén ez mindig true lesz, ami helyes
    return currentCount < limits.maxCars;
  }
  
  // Minden más feature boolean, de a biztonság kedvéért boolean-ra castoljuk
  return !!limits[feature]; 
}