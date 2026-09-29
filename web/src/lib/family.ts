import type { AffixRow, Edge, Family, WordSummary } from './types';
import type { Candidate, Filters } from './filters';
import { matches, pruneKeep } from './filters';
import { effectiveLevel } from './levels';

export interface FamilyModel {
  family: Family;
  byId: Map<string, WordSummary>;
  byKey: Map<string, WordSummary>;
  children: Map<string, string[]>;
  parent: Map<string, string | null>;
  edgeTo: Map<string, Edge>;
  depth: Map<string, number>;
  rootId: string;
}

export function buildModel(family: Family): FamilyModel {
  const byId = new Map<string, WordSummary>();
  const byKey = new Map<string, WordSummary>();
  for (const n of family.nodes) {
    byId.set(n.id!, n);
    byKey.set(n.key, n);
  }
  const children = new Map<string, string[]>();
  const parent = new Map<string, string | null>();
  const edgeTo = new Map<string, Edge>();
  for (const n of family.nodes) {
    children.set(n.id!, []);
    parent.set(n.id!, null);
  }
  for (const e of family.edges) {
    children.get(e.parent)?.push(e.child);
    parent.set(e.child, e.parent);
    edgeTo.set(e.child, e);
  }
  // most frequent children first (spec 12.3: first 8 shown)
  for (const [id, kids] of children) {
    kids.sort((a, b) => (byId.get(b)?.zipf ?? 0) - (byId.get(a)?.zipf ?? 0));
    children.set(id, kids);
  }
  const rootId = family.nodes[0].id!;
  const depth = new Map<string, number>();
  const stack: [string, number][] = [[rootId, 0]];
  while (stack.length) {
    const [id, d] = stack.pop()!;
    depth.set(id, d);
    for (const c of children.get(id) ?? []) stack.push([c, d + 1]);
  }
  return { family, byId, byKey, children, parent, edgeTo, depth, rootId };
}

/** Canonical affix lookup built from affixes.json (variants: emp- -> ent-, -igkeit -> -keit). */
export function affixLookup(affixes: { prefixes: AffixRow[]; suffixes: AffixRow[] } | null) {
  const pre = new Map<string, string>();
  const suf = new Map<string, string>();
  for (const r of affixes?.prefixes ?? []) for (const v of r.variants ?? [r.affix]) pre.set(v.replace(/-/g, '').toLowerCase(), r.affix);
  for (const r of affixes?.suffixes ?? []) for (const v of r.variants ?? [r.affix]) suf.set(v.replace(/-/g, '').toLowerCase(), r.affix);
  return {
    prefix: (t: string) => pre.get(t.toLowerCase()) ?? `${t.toLowerCase()}-`,
    suffix: (t: string) => suf.get(t.toLowerCase()) ?? suf.get(`${t.toLowerCase()}en`) ?? `-${t.toLowerCase()}`,
  };
}
export type AffixLookup = ReturnType<typeof affixLookup>;

/** Affixes a word contains: from its segmentation and from its incoming edge. */
export function wordAffixes(n: WordSummary, e: Edge | undefined, lk: AffixLookup): string[] {
  const out = new Set<string>();
  for (const part of n.seg) {
    for (const [text, type] of part) {
      if (type === 'PREF' || type === 'PREF_SEP') out.add(lk.prefix(text));
      else if (type === 'SUFF') out.add(lk.suffix(text));
    }
  }
  if (e) for (const a of [...e.added_prefixes, ...e.added_suffixes]) out.add(a);
  return [...out];
}

export function nodeLevel(n: WordSummary, source: 'estimated' | 'custom'): string {
  return effectiveLevel(n.level, n.custom_level, source);
}

export function candidateOf(n: WordSummary, e: Edge | undefined, lk: AffixLookup, source: 'estimated' | 'custom'): Candidate {
  return {
    level: nodeLevel(n, source), pos: n.pos, gender: n.gender, plural: n.plural_type,
    conj: n.conjugation, pt: n.prefix_type, aux: n.auxiliary, refl: n.reflexive, dual: n.dual,
    topics: n.topics, stars: n.stars, uncertain: n.uncertain,
    // 'other' = a derivation edge without a formation type / vowel change
    st: e ? e.semantic_type ?? 'other' : null, pc: e?.pos_change ?? null, vc: e ? e.vowel_change ?? 'other' : null,
    affixes: wordAffixes(n, e, lk),
  };
}

export function matchedIds(m: FamilyModel, f: Filters, lk: AffixLookup, source: 'estimated' | 'custom'): Set<string> {
  const out = new Set<string>();
  for (const n of m.family.nodes) {
    if (matches(candidateOf(n, m.edgeTo.get(n.id!), lk, source), f)) out.add(n.id!);
  }
  return out;
}

/** Nodes whose subtree (including themselves) contains a match. */
export function subtreeHasMatch(m: FamilyModel, matched: Set<string>): Set<string> {
  const out = new Set<string>();
  const visit = (id: string): boolean => {
    let has = matched.has(id);
    for (const c of m.children.get(id) ?? []) if (visit(c)) has = true;
    if (has) out.add(id);
    return has;
  };
  visit(m.rootId);
  return out;
}

export function ancestors(m: FamilyModel, id: string): string[] {
  const out: string[] = [];
  let cur = m.parent.get(id) ?? null;
  while (cur) {
    out.push(cur);
    cur = m.parent.get(cur) ?? null;
  }
  return out;
}

/** Default expansion: two levels, plus the path to the focused word (spec 12.3). */
export function defaultExpanded(m: FamilyModel, focusId: string | null, matched: Set<string> | null): Set<string> {
  const exp = new Set<string>();
  if (matched) {
    // dim mode with filters: open exactly the subtrees that contain matches
    const has = subtreeHasMatch(m, matched);
    for (const id of has) if ((m.children.get(id) ?? []).some((c) => has.has(c))) exp.add(id);
  } else {
    for (const [id, d] of m.depth) if (d < 2) exp.add(id);
  }
  if (focusId) for (const a of ancestors(m, focusId)) exp.add(a);
  return exp;
}

export interface VisibleNode {
  id: string;
  kind: 'word' | 'more';
  hiddenCount?: number;
  parentId: string | null;
  children: VisibleNode[];
  /** word has children that are currently collapsed */
  collapsed?: boolean;
  childCount?: number;
}

export const MAX_CHILDREN = 8;
export const MAX_VISIBLE = 300;

/**
 * Visible hierarchy for tree/outline: honours expansion, "show more" and
 * prune mode (only `keep` nodes). Collapses deeper levels if > 300 nodes.
 */
export function visibleTree(
  m: FamilyModel, expanded: Set<string>, showAll: Set<string>, keep: Set<string> | null,
  pinned: Set<string> = new Set(),
): VisibleNode {
  const build = (id: string, parentId: string | null, maxDepth: number, d: number): VisibleNode => {
    const all = (m.children.get(id) ?? []).filter((c) => !keep || keep.has(c));
    const node: VisibleNode = { id, kind: 'word', parentId, children: [], childCount: all.length };
    if (!all.length) return node;
    if (!expanded.has(id) || d >= maxDepth) {
      node.collapsed = true;
      return node;
    }
    let shown = showAll.has(id) || all.length <= MAX_CHILDREN ? all : all.slice(0, MAX_CHILDREN);
    // the focused word and its ancestors are never hidden behind "Show n more"
    const extra = all.filter((c) => pinned.has(c) && !shown.includes(c));
    if (extra.length) shown = all.filter((c) => shown.includes(c) || extra.includes(c));
    node.children = shown.map((c) => build(c, id, maxDepth, d + 1));
    if (shown.length < all.length) {
      node.children.push({ id: `${id}::more`, kind: 'more', hiddenCount: all.length - shown.length, parentId: id, children: [] });
    }
    return node;
  };
  const count = (v: VisibleNode): number => 1 + v.children.reduce((s, c) => s + count(c), 0);
  let maxDepth = 99;
  let root = build(m.rootId, null, maxDepth, 0);
  while (count(root) > MAX_VISIBLE && maxDepth > 1) {
    const deepest = Math.max(...[...m.depth.values()]);
    maxDepth = Math.min(maxDepth, deepest) - 1;
    root = build(m.rootId, null, maxDepth, 0);
  }
  return root;
}

export function flattenVisible(v: VisibleNode, out: VisibleNode[] = []): VisibleNode[] {
  out.push(v);
  for (const c of v.children) flattenVisible(c, out);
  return out;
}

export { pruneKeep };
