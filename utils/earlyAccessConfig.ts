// utils/earlyAccessConfig.ts
// Centralized config for Early Access Pro for new users


import { createClient } from '@/supabase/server';

export interface EarlyAccessConfig {
  early_access_pro: boolean;
  early_access_pro_duration_months: number; // e.g. 3
  early_access_fallback_plan: string; // e.g. 'starter'
}

const DEFAULT_CONFIG: EarlyAccessConfig = {
  early_access_pro: true,
  early_access_pro_duration_months: 3,
  early_access_fallback_plan: 'starter',
};

export async function getEarlyAccessConfig(): Promise<EarlyAccessConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('app_config')
    .select('early_access_pro, early_access_pro_duration_months, early_access_fallback_plan')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) return DEFAULT_CONFIG;
  return {
    early_access_pro: data.early_access_pro ?? DEFAULT_CONFIG.early_access_pro,
    early_access_pro_duration_months: data.early_access_pro_duration_months ?? DEFAULT_CONFIG.early_access_pro_duration_months,
    early_access_fallback_plan: data.early_access_fallback_plan ?? DEFAULT_CONFIG.early_access_fallback_plan,
  };
}

export async function setEarlyAccessConfig(config: EarlyAccessConfig) {
  const supabase = await createClient();
  await supabase
    .from('app_config')
    .upsert({ id: 1, ...config }, { onConflict: 'id' });
}
