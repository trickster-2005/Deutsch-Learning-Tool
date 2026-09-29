import type { AffixRow, BrowseRow, Family, FamilyIndexRow, LexEntry, Meta } from './types';
import { shardKey } from './text';

/** All data files live under <base>/data/ (base = '/Deutsch-Learning-Tool/' in production). */
export function dataUrl(path: string): string {
  return `${import.meta.env.BASE_URL}data/${path}`;
}

const cache = new Map<string, Promise<unknown>>();

/** Fetch JSON once; a missing file (404) resolves to `fallback`. */
export function loadJson<T>(path: string, fallback?: T): Promise<T> {
  let p = cache.get(path) as Promise<T> | undefined;
  if (!p) {
    p = fetch(dataUrl(path)).then(async (r) => {
      if (r.status === 404 && fallback !== undefined) return fallback;
      if (!r.ok) throw new Error(`${r.status} ${path}`);
      return (await r.json()) as T;
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p;
}

export type FormIndex = Record<string, string[]>;
export type CompleteRow = [lemma: string, key: string, pos: string, article: string | null, zipf: number, display: string];

export const loadForms = (form: string) => loadJson<FormIndex>(`lexicon/forms/${shardKey(form)}.json`, {});
export const loadFolded = (form: string) => loadJson<FormIndex>(`lexicon/forms_folded/${shardKey(form)}.json`, {});
export const loadComplete = (prefix: string) =>
  loadJson<CompleteRow[]>(`lexicon/complete/${shardKey(prefix)}.json`, []);
export const loadFamily = (id: string) => loadJson<Family>(`families/${id}.json`);
export const loadFamiliesIndex = () => loadJson<FamilyIndexRow[]>('families_index.json');
export const loadBrowse = () => loadJson<BrowseRow[]>('browse/words.json');
export const loadAffixes = () => loadJson<{ prefixes: AffixRow[]; suffixes: AffixRow[] }>('affixes.json');
export const loadTopics = () => loadJson<Record<string, { en: string; zh: string }>>('topics.json');
export const loadMeta = () => loadJson<Meta>('meta.json');
export const loadCustomLevels = () => loadJson<Record<string, string>>('levels/custom.json', {});

export async function loadEntry(key: string): Promise<LexEntry | null> {
  const shard = await loadJson<Record<string, LexEntry>>(`lexicon/${shardKey(key)}.json`, {});
  return shard[key] ?? null;
}

export async function loadEntries(keys: string[]): Promise<Record<string, LexEntry>> {
  const out: Record<string, LexEntry> = {};
  await Promise.all(
    keys.map(async (k) => {
      const e = await loadEntry(k);
      if (e) out[k] = e;
    }),
  );
  return out;
}
