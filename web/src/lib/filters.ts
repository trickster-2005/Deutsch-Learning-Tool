import type { DualSummary } from './types';

/** Filter state; every field maps to one URL parameter (spec 12.6). */
export interface Filters {
  level: string[];
  pos: string[];
  gender: string[];
  pl: string[];
  conj: string[];
  pt: string[];
  aux: string[];
  refl: boolean;
  st: string[];
  pc: string[];
  vc: string[];
  affix: string[];
  topic: string[];
  stars: number;
  certain: boolean;
}

export type Mode = 'dim' | 'prune' | 'list';

export const LIST_KEYS = ['level', 'pos', 'gender', 'pl', 'conj', 'pt', 'aux', 'st', 'pc', 'vc', 'affix', 'topic'] as const;
export type ListKey = (typeof LIST_KEYS)[number];

export const emptyFilters = (): Filters => ({
  level: [], pos: [], gender: [], pl: [], conj: [], pt: [], aux: [],
  refl: false, st: [], pc: [], vc: [], affix: [], topic: [], stars: 0, certain: false,
});

export function parseFilters(p: URLSearchParams): Filters {
  const f = emptyFilters();
  for (const k of LIST_KEYS) {
    const v = p.get(k);
    if (v) f[k] = v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  f.refl = p.get('refl') === '1';
  f.certain = p.get('certain') === '1';
  const s = Number(p.get('stars'));
  f.stars = Number.isFinite(s) && s >= 1 && s <= 5 ? Math.floor(s) : 0;
  return f;
}

/** Write filters into (a copy of) the params; empty values are removed. */
export function writeFilters(p: URLSearchParams, f: Filters): URLSearchParams {
  const out = new URLSearchParams(p);
  for (const k of LIST_KEYS) {
    if (f[k].length) out.set(k, f[k].join(','));
    else out.delete(k);
  }
  if (f.refl) out.set('refl', '1');
  else out.delete('refl');
  if (f.certain) out.set('certain', '1');
  else out.delete('certain');
  if (f.stars) out.set('stars', String(f.stars));
  else out.delete('stars');
  return out;
}

export function isEmpty(f: Filters): boolean {
  return LIST_KEYS.every((k) => f[k].length === 0) && !f.refl && !f.certain && !f.stars;
}

export function parseMode(p: URLSearchParams): Mode {
  const m = p.get('mode');
  return m === 'prune' || m === 'list' ? m : 'dim';
}

/** Everything the matcher needs about one word (tree node or browse row). */
export interface Candidate {
  level: string;
  pos: string;
  gender?: string | null;
  plural?: string | null;
  conj?: string | null;
  pt?: string | null;
  aux?: string | null;
  refl?: boolean;
  dual?: DualSummary[];
  topics: string[];
  stars: number;
  uncertain: boolean;
  /** incoming derivation edge (formation filters act on the child) */
  st?: string | null;
  pc?: string | null;
  vc?: string | null;
  /** canonical affixes the word contains */
  affixes: string[];
}

const anyOf = (sel: string[], v: string | null | undefined) => !sel.length || (v != null && sel.includes(v));

function verbMatch(f: Filters, c: { pt?: string | null; conj?: string | null; aux?: string | null; refl?: boolean }) {
  return anyOf(f.pt, c.pt) && anyOf(f.conj, c.conj) && anyOf(f.aux, c.aux) && (!f.refl || !!c.refl);
}

/** AND between dimensions, OR inside one dimension. */
export function matches(c: Candidate, f: Filters): boolean {
  if (!anyOf(f.level, c.level)) return false;
  if (!anyOf(f.pos, c.pos)) return false;
  if ((f.gender.length || f.pl.length) && c.pos !== 'NOUN') return false;
  if (!anyOf(f.gender, c.gender ?? 'unknown')) return false;
  if (!anyOf(f.pl, c.plural ?? 'other')) return false;
  const verbDims = f.pt.length || f.conj.length || f.aux.length || f.refl;
  if (verbDims) {
    if (c.pos !== 'VERB') return false;
    // same-spelling verbs (übersetzen): either reading may match
    const variants = c.dual?.length
      ? c.dual.map((d) => ({ pt: d.prefix_type, conj: d.conjugation, aux: d.auxiliary, refl: d.reflexive }))
      : [{ pt: c.pt, conj: c.conj, aux: c.aux, refl: c.refl }];
    if (!variants.some((v) => verbMatch(f, v))) return false;
  }
  if (!anyOf(f.st, c.st)) return false;
  if (!anyOf(f.pc, c.pc)) return false;
  if (!anyOf(f.vc, c.vc)) return false;
  if (f.affix.length && !f.affix.some((a) => c.affixes.includes(a))) return false;
  if (f.topic.length && !f.topic.some((t) => c.topics.includes(t) || (t === 'other' && !c.topics.length))) return false;
  if (f.stars && c.stars < f.stars) return false;
  if (f.certain && c.uncertain) return false;
  return true;
}

/** Show noun / verb sub-filters only when POS is unset or includes them (spec 12.6). */
export function showNounFilters(f: Filters) {
  return !f.pos.length || f.pos.includes('NOUN');
}
export function showVerbFilters(f: Filters) {
  return !f.pos.length || f.pos.includes('VERB');
}

/** Flat list of active values for the chip bar. */
export function activeChips(f: Filters): { dim: keyof Filters; value: string }[] {
  const out: { dim: keyof Filters; value: string }[] = [];
  for (const k of LIST_KEYS) for (const v of f[k]) out.push({ dim: k, value: v });
  if (f.refl) out.push({ dim: 'refl', value: '1' });
  if (f.stars) out.push({ dim: 'stars', value: String(f.stars) });
  if (f.certain) out.push({ dim: 'certain', value: '1' });
  return out;
}

export function removeChip(f: Filters, dim: keyof Filters, value: string): Filters {
  const n: Filters = { ...f };
  if (dim === 'refl') n.refl = false;
  else if (dim === 'certain') n.certain = false;
  else if (dim === 'stars') n.stars = 0;
  else n[dim as ListKey] = (f[dim as ListKey] as string[]).filter((v) => v !== value);
  return n;
}

/**
 * Prune mode: keep matching nodes and their ancestors (spec 12.7).
 * Returns the set of node ids to render.
 */
export function pruneKeep(parentOf: Map<string, string | null>, matched: Set<string>): Set<string> {
  const keep = new Set<string>();
  for (const id of matched) {
    let cur: string | null | undefined = id;
    while (cur && !keep.has(cur)) {
      keep.add(cur);
      cur = parentOf.get(cur) ?? null;
    }
  }
  return keep;
}
