// Visual tokens shared by the tree, the outline and the legend, so the legend
// always shows exactly the classes the tree uses (spec 12.12).
import type { ColorBy } from './settings';
import type { MorphType } from './types';

export const MORPH_TYPES: MorphType[] = ['PREF_SEP', 'PREF', 'ROOT', 'SUFF', 'END', 'LINK'];
export const MORPH_EXAMPLES: Record<MorphType, string> = {
  PREF_SEP: 'auf', PREF: 'ver', ROOT: 'steh', SUFF: 'ung', END: 'en', LINK: 's',
};
export const ARTICLES = ['der', 'die', 'das'] as const;
export const POS_LIST = ['NOUN', 'VERB', 'ADJ', 'ADV', 'OTHER'] as const;
export const LEVEL_LIST = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'beyond'] as const;

const GENDER_ARTICLE: Record<string, string> = { masc: 'der', femn: 'die', neut: 'das' };

/** Background token for a node given the colour mode (spec 12.9). */
export function fillToken(colorBy: ColorBy, n: { level: string; pos: string; gender?: string }): string {
  if (colorBy === 'pos') return `pos-${n.pos}`;
  if (colorBy === 'gender') {
    const a = n.pos === 'NOUN' && n.gender ? GENDER_ARTICLE[n.gender] : undefined;
    return a ? `g-${a}` : 'neutral';
  }
  return `lvl-${n.level}`;
}
