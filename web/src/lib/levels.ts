export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'beyond'] as const;
export const MY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export const levelIndex = (l: string | null | undefined) => {
  const i = LEVELS.indexOf((l ?? 'beyond') as (typeof LEVELS)[number]);
  return i < 0 ? LEVELS.length - 1 : i;
};

export type LevelGroup = 'normal' | 'next' | 'above';

/**
 * "My level" grouping (spec 12.8): at or below my level -> normal;
 * exactly one above -> next (bold outline + Next tag); higher -> above (faded).
 */
export function levelGroup(word: string, mine: string | null): LevelGroup {
  if (!mine) return 'normal';
  const d = levelIndex(word) - levelIndex(mine);
  if (d <= 0) return 'normal';
  if (d === 1) return 'next';
  return 'above';
}

/** Level shown for a word given the chosen source (custom falls back to estimated). */
export function effectiveLevel(estimated: string, custom: string | undefined, source: 'estimated' | 'custom'): string {
  return source === 'custom' && custom ? custom : estimated;
}
