import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import zh from '../i18n/zh-Hant.json';
import { emptyFilters, matches, parseFilters, pruneKeep, writeFilters, type Candidate } from './filters';
import { levelGroup } from './levels';
import { searchWord, type SearchDeps } from './search';
import { foldUmlauts, normForm, shardKey } from './text';
import { affixLookup, buildModel, candidateOf, matchedIds } from './family';
import { wordTokens } from '../components/Word';
import type { Family } from './types';

const cand = (over: Partial<Candidate>): Candidate => ({
  level: 'A1', pos: 'NOUN', topics: [], stars: 3, uncertain: false, affixes: [], ...over,
});

describe('filters', () => {
  it('AND between dimensions, OR inside one', () => {
    const f = { ...emptyFilters(), level: ['A1', 'A2'], pos: ['VERB'] };
    expect(matches(cand({ level: 'A2', pos: 'VERB' }), f)).toBe(true);
    expect(matches(cand({ level: 'A1', pos: 'VERB' }), f)).toBe(true);
    expect(matches(cand({ level: 'B1', pos: 'VERB' }), f)).toBe(false);
    expect(matches(cand({ level: 'A1', pos: 'NOUN' }), f)).toBe(false);
  });

  it('noun sub-filters only match nouns; verb filters only verbs; dual verbs match either reading', () => {
    const g = { ...emptyFilters(), gender: ['neut'] };
    expect(matches(cand({ pos: 'NOUN', gender: 'neut' }), g)).toBe(true);
    expect(matches(cand({ pos: 'VERB' }), g)).toBe(false);
    const v = { ...emptyFilters(), pt: ['inseparable'] };
    expect(matches(cand({ pos: 'VERB', pt: 'separable' }), v)).toBe(false);
    const dual = [
      { prefix_type: 'separable', conjugation: 'weak', auxiliary: 'sein', reflexive: false },
      { prefix_type: 'inseparable', conjugation: 'weak', auxiliary: 'haben', reflexive: false },
    ];
    expect(matches(cand({ pos: 'VERB', pt: 'unknown', dual }), v)).toBe(true);
    expect(matches(cand({ pos: 'VERB', pt: 'unknown', dual }), { ...v, aux: ['sein'] })).toBe(false);
  });

  it('URL round trip', () => {
    const p = new URLSearchParams('level=A1,A2&pos=VERB&pt=separable&mode=prune&stars=3&refl=1');
    const f = parseFilters(p);
    expect(f.level).toEqual(['A1', 'A2']);
    expect(f.stars).toBe(3);
    expect(f.refl).toBe(true);
    const out = writeFilters(new URLSearchParams('mode=prune'), f);
    expect(parseFilters(out)).toEqual(f);
    expect(out.get('mode')).toBe('prune');
  });

  it('prune keeps ancestors of matches', () => {
    const parent = new Map<string, string | null>([['n0', null], ['n1', 'n0'], ['n2', 'n1'], ['n3', 'n0']]);
    expect([...pruneKeep(parent, new Set(['n2']))].sort()).toEqual(['n0', 'n1', 'n2']);
  });
});

const family: Family = {
  id: 'f1', root_lemma: 'stehen', root_key: 'stehen',
  nodes: [
    { id: 'n0', key: 'stehen', lemma: 'stehen', display: 'stehen', pos: 'VERB', level: 'A1', stars: 5, zipf: 6, seg: [[['steh', 'ROOT'], ['en', 'END']]], uncertain: false, topics: [], gloss_en: '', gloss_zh: '', prefix_type: 'none' },
    { id: 'n1', key: 'aufstehen', lemma: 'aufstehen', display: 'auf|stehen', pos: 'VERB', level: 'A2', stars: 4, zipf: 5, seg: [[['auf', 'PREF_SEP'], ['steh', 'ROOT'], ['en', 'END']]], uncertain: false, topics: [], gloss_en: '', gloss_zh: '', prefix_type: 'separable' },
    { id: 'n2', key: 'Aufstehen', lemma: 'Aufstehen', display: 'Aufstehen', pos: 'NOUN', level: 'C1', stars: 2, zipf: 3, seg: [[['Auf', 'PREF_SEP'], ['steh', 'ROOT'], ['en', 'END']]], uncertain: false, topics: [], gloss_en: '', gloss_zh: '', gender: 'neut' },
  ],
  edges: [
    { parent: 'n0', child: 'n1', added_prefixes: ['auf-'], prefix_types: ['separable'], added_suffixes: [], vowel_change: null, pos_change: 'VERB>VERB', semantic_type: 'prefixed_verb' },
    { parent: 'n1', child: 'n2', added_prefixes: [], prefix_types: [], added_suffixes: [], vowel_change: null, pos_change: 'VERB>NOUN', semantic_type: 'nominalized_infinitive' },
  ],
  compounds: { as_modifier: [], as_head: [] },
};

describe('family model', () => {
  const m = buildModel(family);
  const lk = affixLookup(null);

  it('edge filters act on the child node', () => {
    const f = { ...emptyFilters(), st: ['nominalized_infinitive'] };
    expect([...matchedIds(m, f, lk, 'estimated')]).toEqual(['n2']);
    const pc = { ...emptyFilters(), pc: ['VERB>VERB'] };
    expect([...matchedIds(m, pc, lk, 'estimated')]).toEqual(['n1']);
  });

  it('affix filter finds words containing the affix', () => {
    const f = { ...emptyFilters(), affix: ['auf-'] };
    expect([...matchedIds(m, f, lk, 'estimated')].sort()).toEqual(['n1', 'n2']);
  });

  it('root has no incoming edge, so formation filters never match it', () => {
    expect(candidateOf(m.byId.get('n0')!, undefined, lk, 'estimated').st).toBeNull();
  });
});

describe('search', () => {
  const FORMS: Record<string, string[]> = {
    'stand auf': ['aufstehen'], 'steht auf': ['aufstehen'], aufgestanden: ['aufstehen'], stand: ['stehen', 'Stand'],
    aufstehen: ['aufstehen', 'Aufstehen'], schon: ['schon'], strasse: ['Straße', 'Strass'], häuser: ['Haus'],
  };
  const FOLDED: Record<string, string[]> = {
    schon: ['schon', 'schön'], strasse: ['Straße', 'Strass'], hauser: ['Haus', 'Hauser'],
  };
  const deps: SearchDeps = { forms: async (f) => FORMS[f] ?? [], folded: async (f) => FOLDED[f] ?? [] };

  it('finds separated verb forms', async () => {
    expect((await searchWord('stand auf', deps)).keys).toEqual(['aufstehen']);
    expect((await searchWord('Steht  auf', deps)).keys).toEqual(['aufstehen']);
  });

  it('combines first and last word when words are in between', async () => {
    expect((await searchWord('steht morgen früh auf', deps)).keys).toEqual(['aufstehen']);
  });

  it('builds prefix + lemma of the first word', async () => {
    const deps2: SearchDeps = { ...deps, forms: async (f) => (f === 'stand auf' ? [] : FORMS[f] ?? []) };
    const r = await searchWord('stand auf', deps2);
    expect(r.keys).toEqual(['aufstehen']);
  });

  it('suggests umlaut and ß spellings', async () => {
    expect((await searchWord('schon', deps)).suggestions).toEqual(['schön']);
    expect((await searchWord('Strasse', deps)).suggestions).toEqual(['Straße']);
    const h = await searchWord('Häuser', deps);
    expect(h.keys).toEqual(['Haus']);
    expect(h.suggestions).toEqual([]);
  });

  it('hints for non-Latin input', async () => {
    expect((await searchWord('你好', deps)).hint).toBe('scriptHint');
    expect((await searchWord('qwertz', deps)).hint).toBe('notFound');
  });
});

describe('my level', () => {
  it('groups words relative to my level', () => {
    expect(levelGroup('A2', 'B1')).toBe('normal');
    expect(levelGroup('B1', 'B1')).toBe('normal');
    expect(levelGroup('B2', 'B1')).toBe('next');
    expect(levelGroup('C1', 'B1')).toBe('above');
    expect(levelGroup('beyond', 'C2')).toBe('next');
    expect(levelGroup('C2', null)).toBe('normal');
  });
});

describe('i18n', () => {
  it('both language files have exactly the same keys', () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
  });
  it('no empty strings', () => {
    for (const d of [en, zh] as Record<string, string>[]) for (const [k, v] of Object.entries(d)) expect(v, k).not.toBe('');
  });
});

describe('text', () => {
  it('normalises like the build', () => {
    expect(normForm(' Straße ')).toBe('strasse');
    expect(foldUmlauts('Schön')).toBe('schon');
    expect(shardKey('übersetzen#sep')).toBe('ub');
    expect(shardKey('a')).toBe('a_');
  });
  it('aligns morphemes with display separators', () => {
    const tk = wordTokens([[['auf', 'PREF_SEP'], ['steh', 'ROOT'], ['en', 'END']]], 'auf|stehen');
    expect(tk.map((t) => t.text)).toEqual(['auf', '|', 'steh', 'en']);
    const c = wordTokens([[['Arbeit', 'ROOT'], ['s', 'LINK']], [['platz', 'ROOT']]], 'Arbeit·s·platz');
    expect(c.map((t) => `${t.text}:${t.type}`)).toEqual(['Arbeit:ROOT', '·:SEP', 's:LINK', '·:SEP', 'platz:ROOT']);
  });
});
