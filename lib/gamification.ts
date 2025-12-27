export const RANKS = [
  { minLevel: 1, title: 'Kezdő Sofőr', color: 'text-slate-400' },
  { minLevel: 5, title: 'Városi Vagány', color: 'text-emerald-400' },
  { minLevel: 10, title: 'Haladó Tuningos', color: 'text-blue-400' },
  { minLevel: 20, title: 'Profi Restaurátor', color: 'text-purple-400' },
  { minLevel: 50, title: 'Showroom Legenda', color: 'text-primary' },
];

export function calculateLevel(xp: number) {
  // Logika: Minden szinthez 1000 XP kell (lineáris) vagy használhatunk négyzetes skálát
  const level = Math.floor(xp / 1000) + 1;
  const currentLevelXp = xp % 1000;
  const progress = (currentLevelXp / 1000) * 100;
  
  const rank = [...RANKS].reverse().find(r => level >= r.minLevel) || RANKS[0];

  return { level, currentLevelXp, progress, rank };
}