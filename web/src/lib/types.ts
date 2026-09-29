export type Pos = 'NOUN' | 'VERB' | 'ADJ' | 'ADV' | 'OTHER';
export type MorphType = 'PREF_SEP' | 'PREF' | 'ROOT' | 'SUFF' | 'END' | 'LINK';
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'beyond';

/** Morpheme as stored in family files: [text, type]. */
export type SegPart = [string, MorphType][];

export interface DualSummary {
  prefix_type: string;
  conjugation: string;
  auxiliary: string;
  reflexive: boolean;
}

/** Compact per-word data embedded in family files (tree, filters, compound panel). */
export interface WordSummary {
  id?: string;
  key: string;
  lemma: string;
  display: string;
  pos: Pos;
  family?: string | null;
  level: Level;
  custom_level?: string;
  stars: number;
  zipf: number;
  seg: SegPart[];
  uncertain: boolean;
  topics: string[];
  gloss_en: string;
  gloss_zh: string;
  path?: boolean;
  article?: string | null;
  gender?: string;
  plural_type?: string;
  conjugation?: string;
  prefix_type?: string;
  auxiliary?: string;
  reflexive?: boolean;
  dual?: DualSummary[];
  compound?: boolean;
}

export interface Edge {
  parent: string;
  child: string;
  added_prefixes: string[];
  prefix_types: string[];
  added_suffixes: string[];
  vowel_change: 'umlaut' | 'ablaut' | null;
  pos_change: string;
  semantic_type: string | null;
  uncertain?: boolean;
}

export interface CompoundPartRef {
  lemma: string;
  surface: string;
  lemma_key: string | null;
  family_id: string | null;
}

export interface Family {
  id: string;
  root_lemma: string;
  root_key: string;
  nodes: WordSummary[];
  edges: Edge[];
  compounds: { as_modifier: WordSummary[]; as_head: WordSummary[] };
  compound_parts?: CompoundPartRef[];
}

export interface Gloss {
  text: string;
  source: string;
}

export interface Morpheme {
  text: string;
  type: MorphType;
}

export interface LexEntry {
  lemma: string;
  display: string;
  pos: Pos;
  ipa: string | null;
  segmentation: { parts: Morpheme[][]; source: string; confidence: number; uncertain: boolean } | null;
  features: Record<string, string | boolean | null>;
  principal_parts?: { present_3sg: string | null; preterite_3sg: string | null; past_participle: string | null } | null;
  gloss_en: Gloss;
  gloss_zh: Gloss;
  examples: { de: string; en: string }[];
  topics: string[];
  freq_stars: number;
  zipf: number;
  compound: {
    parts: CompoundPartRef[];
    surfaces: string[];
    links: string[];
    elision: boolean[];
    umlaut: boolean[];
    head_index: number;
    source: string;
  } | null;
  family_id: string | null;
  is_path_node: boolean;
  level: Level;
  article?: string | null;
  genitive?: string | null;
  plural?: string | null;
  plural_type?: string;
  gender?: string;
  comparative?: string | null;
  superlative?: string | null;
  dual?: string[];
  variant?: 'sep' | 'insep';
  variant_of?: string;
}

export interface FamilyIndexRow {
  id: string;
  root_lemma: string;
  root_key: string;
  size: number;
  min_level: Level;
  pos_counts: Partial<Record<Pos, number>>;
  pos_changes?: string[];
  affixes?: string[];
  compound_count?: number;
}

/** Row of browse/words.json (short keys to keep the file small). */
export interface BrowseRow {
  k: string; f: string; d: string; p: Pos; l: Level; s: number; z: number;
  g?: string | null; pl?: string | null; cj?: string | null; pt?: string | null; ax?: string | null;
  rf: 0 | 1; t: string[]; u: 0 | 1; a?: string | null; ge: string; gz: string; x?: 1;
  pk?: string; pc?: string; st?: string | null; vc?: string | null; af?: string[]; ptp?: string[];
  cp?: string[]; cl?: string[]; cs?: string[]; ce?: boolean[];
  dual?: DualSummary[]; cl2?: string;
}

export interface AffixRow {
  affix: string;
  kind?: string;
  variants?: string[];
  meaning_en: string | null;
  meaning_zh: string | null;
  examples: string[];
  count: number;
  input_pos?: string | string[];
  output_pos?: string;
  semantic_type?: string;
  gender?: string;
}

export interface Meta {
  built: string;
  stats: { families: number; lemmas: number; kept: number; path_nodes: number; compounds: number };
  has_custom_levels: boolean;
  pos_changes: string[];
  semantic_types: string[];
}
