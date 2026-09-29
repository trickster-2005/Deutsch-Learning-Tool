// Mirrors build/adapters/text.py so shard names match the exported files.

const UMLAUTS: Record<string, string> = { ä: 'a', ö: 'o', ü: 'u', Ä: 'A', Ö: 'O', Ü: 'U' };

/** Search key: lowercase, ß -> ss, trim, collapse whitespace (spec 11.3). */
export function normForm(s: string): string {
  return s.trim().toLowerCase().replace(/ß/g, 'ss').replace(/\s+/g, ' ');
}

/** 'Did you mean' key: additionally fold ä ö ü -> a o u. */
export function foldUmlauts(s: string): string {
  return normForm(s).replace(/[äöüÄÖÜ]/g, (c) => UMLAUTS[c]);
}

/** First n letters of the normalised, folded key; non a-z -> '_'. */
export function shardKey(key: string, n = 2): string {
  const k = foldUmlauts(key.split('#')[0]).replace(/[^a-z]/g, '_');
  return (k + '__').slice(0, n);
}

/** True when the query contains letters that are not Latin script. */
export function hasNonLatin(s: string): boolean {
  return /[^\p{Script=Latin}\p{N}\s\-'.,!?|·]/u.test(s);
}
