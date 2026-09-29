import { foldUmlauts, hasNonLatin, normForm } from './text';

export interface SearchDeps {
  /** exact normalised form -> lemma keys (most frequent first) */
  forms(form: string): Promise<string[]>;
  /** umlaut-folded form -> lemma keys */
  folded(form: string): Promise<string[]>;
}

export interface SearchResult {
  query: string;
  /** lemma keys the input belongs to */
  keys: string[];
  /** "Did you mean …?" candidates (lemma keys) */
  suggestions: string[];
  /** the form that finally matched */
  matched: string | null;
  hint: 'notFound' | 'scriptHint' | null;
}

const lemmaOf = (key: string) => key.split('#')[0];
const hasSpecial = (s: string) => /[äöüß]/i.test(s);

/**
 * Search flow (spec 12.2):
 * 1. exact form lookup;
 * 2. several words and no hit: "first last" (steht … auf), "lastfirst" (aufstand),
 *    prefix + lemma of the first word (auf + stehen), then the first word alone;
 * 3. umlaut-folded lookup for "did you mean" (schon -> schön, Strasse -> Straße);
 * 4. nothing: notFound, or scriptHint for non-Latin input.
 */
export async function searchWord(q: string, deps: SearchDeps): Promise<SearchResult> {
  const query = q.trim();
  const norm = normForm(query);
  const empty: SearchResult = { query, keys: [], suggestions: [], matched: null, hint: null };
  if (!norm) return empty;

  let keys = await deps.forms(norm);
  let matched: string | null = keys.length ? norm : null;
  const tokens = norm.split(' ');
  if (!keys.length && tokens.length >= 2) {
    const first = tokens[0];
    const last = tokens[tokens.length - 1];
    for (const cand of [`${first} ${last}`, `${last}${first}`]) {
      const r = await deps.forms(cand);
      if (r.length) {
        keys = r;
        matched = cand;
        break;
      }
    }
    if (!keys.length) {
      const firstLemmas = await deps.forms(first);
      for (const lk of firstLemmas) {
        const exact = last + lemmaOf(lk);
        const combo = normForm(exact);
        const all = (await deps.forms(combo)).filter((k) => normForm(lemmaOf(k)) === combo);
        // prefer the verb (auf + stehen = aufstehen) over its nominalization (Aufstehen)
        const r = all.some((k) => lemmaOf(k) === exact) ? all.filter((k) => lemmaOf(k) === exact) : all;
        if (r.length) {
          keys = r;
          matched = combo;
          break;
        }
      }
    }
    if (!keys.length) {
      keys = await deps.forms(first);
      if (keys.length) matched = first;
    }
  }

  // "did you mean": spelling variants that differ only by ß/ss or umlauts
  const suggestions: string[] = [];
  const seen = new Set<string>();
  const add = (k: string) => {
    const l = lemmaOf(k).toLowerCase();
    if (seen.has(l) || l === query.toLowerCase()) return;
    seen.add(l);
    suggestions.push(k);
  };
  for (const k of keys) {
    const l = lemmaOf(k);
    if (normForm(l) === (matched ?? norm) && l.toLowerCase() !== query.toLowerCase() && hasSpecial(l)) add(k);
  }
  if (!hasSpecial(query)) {
    const folded = await deps.folded(foldUmlauts(matched ?? norm));
    for (const k of folded) {
      if (!keys.includes(k) && hasSpecial(lemmaOf(k))) add(k);
    }
  }
  const hint = keys.length || suggestions.length ? null : hasNonLatin(query) ? 'scriptHint' : 'notFound';
  return { query, keys, suggestions: suggestions.slice(0, 3), matched, hint };
}
