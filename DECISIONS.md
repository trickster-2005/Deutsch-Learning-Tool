# Decisions

Small decisions not fixed by the spec. One line each: decision — reason.

## Sources and downloads

- The project root is this repository (`deutsch-learning-project/`), not a `german-word-family/` sub-folder — the repo is the project.
- UDer 1.1 is fetched through the LINDAT DSpace 7 REST API (`/server/api/pid/find` → bundles → bitstream `content`); the old `xmlui/bitstream/...` URL is kept as fallback — LINDAT migrated to DSpace 7 and the old URL now returns an HTML page.
- English Wiktionary is read from kaikki.org's German-only slice (`dictionary/German/kaikki.org-dictionary-German.jsonl.gz`, 98 MB) with the full raw dump (3 GB) as fallback — both come from the same wiktextract run and contain exactly the `lang_code == "de"` entries; the raw dump took hours to download here.
- `charsplit` is installed from GitHub (`dtuggener/CharSplit`) — the `charsplit` package on PyPI is an unrelated image-splitting library.
- Wiktionary entries are reduced once to compact records and cached as `build/.cache/lex_{en,de,zh}.pkl` — parsing 3.9 GB of JSON takes minutes; the cache is invalidated when the JSONL is newer.

## Lexicon (Wiktionary)

- Only lemma entries are kept: German-edition sections titled "Deklinierte/Konjugierte Form", "Partizip", "Komparativ", "Superlativ", entries whose senses are all `form_of`, and entries whose senses are all `alt_of`/`misspelling` (Hauß, Strasse) are skipped — inflected forms and spelling variants are not words of their own.
- Wiktionary `name` (proper nouns), phrases, affixes, abbreviations and symbols are ignored; pronouns, prepositions, conjunctions, determiners, numerals, particles and interjections become POS `OTHER`.
- Lemmas that exist in Wiktionary (en or de) but not in DErivBase become single-node families — adverbs, function words and most compounds are not in DErivBase but learners search for them.
- A lemma is eligible for the frequency filter only if it has a Wiktionary entry with the same POS — DErivBase contains many automatically induced lemmas (e.g. `Aufsprechen`) with no dictionary support; they can still appear as path nodes.
- Same spelling, different POS: the most frequent kept reading gets the bare `lemma_key`, others get `lemma#pos` (e.g. `schon#other`) — keys must be unique.
- Auxiliary: the auxiliary marked on the first English sense (`[auxiliary sein]`) wins, then the German conjugation table (`Hilfsverb sein`), then German/English entry lists — entry-level lists add regional variants (aufstehen: haben in the south), while the primary sense gives the textbook answer (ist aufgestanden).
- Conjugation class: modal list → `modal`; `mixed` tag or `irregular` + `weak` → `mixed` (bringen); `strong` (incl. "irregular strong") → `strong`; `weak` → `weak`; `irregular` alone → `irregular` (sein) — English Wiktionary labels mixed verbs "irregular weak".
- Past participle: when several are listed, a form different from the infinitive is preferred (`gekonnt`, not the Ersatzinfinitiv `können`).
- Search forms exclude forms tagged `auxiliary`, `diminutive`, `abbreviation`, `obsolete`, `alternative`, table/template tags, and multi-word forms except separable splits (`steht auf`) and `am …sten` — `haben` must not map to every verb, `Häuschen` is its own lemma.
- Separable splits are recognised when a finite form is "verb + particle" and the lemma starts with that particle (`split_particle`); only top-level forms are used, not conjugation tables, because homograph entries share one table (übersetzen).
- Plural-only nouns get article `die`, plural = lemma and plural type `other`.
- Chinese glosses additionally drop `〈…〉` gender marks, `pl.…` forms, leading `adj./adv./v./n.` and `[助動詞 …]`, and lines containing IPA/help links — zh.wiktionary glosses embed grammar notes that are not definitions.
- English glosses drop parenthetical explanations (`to get up (move from a sitting …)` → `to get up`) — the 80-character limit otherwise cuts the second sense.

### Wiktionary fields actually used (spec 7.2 field detection)

| feature | German edition | English edition | Chinese edition |
|---|---|---|---|
| gender | `forms[].article` on nominative singular | head expansion `Haus n (…)` / `pl`; tag `plural-only` | — |
| genitive / plural | `forms` tagged `genitive+singular` / `nominative+plural` | same tags, or `genitive` / `plural` | — |
| 3sg present | `forms` tagged `present` with pronoun `er` | `present+third-person+singular` | — |
| preterite | `forms` tagged `past` with pronoun `ich` (not `subjunctive-ii`) | `past` without person/subjunctive tags | — |
| past participle | `participle-2` | `participle+past` | — |
| auxiliary | `raw_tags` "Hilfsverb haben/sein"; `forms` tagged `auxiliary` | sense `raw_glosses` "[auxiliary sein]"; `forms` tagged `auxiliary` | — |
| conjugation | — | tags `strong`/`weak`/`mixed`/`irregular` in senses or head expansion | — |
| reflexive | tag `reflexive` | tag `reflexive`, `sich` in head or forms | — |
| comparative / superlative | `forms` tagged `comparative` / `superlative` | same | — |
| IPA | first `sounds[].ipa` | fallback | — |
| glosses / examples | — | `senses[].glosses` (last element), `examples` with `translation`/`english` | `senses[].glosses` |
| categories (topics) | — | `categories[].name` (entry and senses) | — |
| etymology | — | `etymology_templates` `af`/`affix`/`prefix`/`suffix`/`confix`/`compound`/`com`, incl. new-style `{{ety|de|:af|…}}` | — |

## Family trees (DErivBase)

- Tree stitching: the UDer harmonisation splits many DErivBase families (e.g. `Aufstehen → aufstehen` is separate from `stehen`). Rule-based passes reconnect them, each attaching a tree root below a node of a different tree (no cycles):
  1. nominalized infinitive reorientation — `Aufstehen → aufstehen` becomes `aufstehen → Aufstehen` (run again at the end);
  2. prefixed verbs — a verb `prefix + V` whose `V` is a verb in another tree is re-rooted and attached under `V` (aufstehen → stehen, verstehen → stehen);
  3. `un-` nouns/adjectives attach to their base (Unglück → Glück); `ur-`/`miss-` only via Wiktionary evidence — `Mission` ≠ miss + Ion;
  4. remaining roots with an English-Wiktionary `{{af}}/{{prefix}}/{{suffix}}/{{confix}}` template naming exactly one known base (Häuschen → Haus);
  5. stem-noun / denominal conversions between roots (Lauf ↔ laufen; the less frequent one goes below) and deadjectival verbs (offen → öffnen, trocken → trocknen);
  6. DErivBase's own `other_parents` for roots still unattached.
- Compound edges in DErivBase (`Haus → Haupthaus`, `Stehende → Außenstehende`) are cut when the extra material is itself a lemma and not a prefix — compounds belong in the compound panel (spec 7.6), not in derivation trees.
- DErivBase rule ids are kept on edges only in `reports/spot_checks.md` (with the rule's example line from `-rules.txt`), not in the web data — spec: debug only.
- Duplicate `(lemma, POS)` rows in DErivBase are merged into the first occurrence — 439 rows; a lemma must belong to one family.
- Family ids `f00001…` are assigned by root lemma in alphabetical order — deterministic between builds of the same data.

## Frequency and levels

- Zipf is clamped at 0 — wordfreq returns tiny non-zero values that give negative Zipf.
- Dual separable/inseparable verbs (übersetzen) get no separable boost — the contiguous forms are shared by both readings.
- Words of POS `OTHER` do not consume CEFR ranks; they get the level of the first ranked lemma with the same or lower frequency — spec ranks only NOUN/VERB/ADJ/ADV, but function words still need a level for filters.
- Path nodes get the level `beyond` unless they are frequent enough to be ranked.

## Segmentation and annotation

- The prefix inventory is `affixes.yaml` plus the particles from `particles.yaml` that lack a meaning row (dar-, empor-, herein-, …) — separable particles must be recognisable even without a gloss.
- Participle adjectives (`stehend`, `befreit`, `verarbeitet`) are segmented as parent stem + END (`end`, `d`, `t`, `et`, `en`) and their edge carries no affix — participles are inflection, not derivation.
- Nominalized adjectives (`das Gute`) keep `e` as END when the parent is an adjective.
- Unstressed-e deletion is treated as elision (`trocken → trockn-en`, `offen → öffn-en` with umlaut) — otherwise the consonant-skeleton test would call it ablaut.
- Edges whose segmentation failed get no affix labels and no semantic type, and are flagged `uncertain` — the spec forbids inventing a formation.
- Formation filters use `other` for derivation edges without a semantic type or vowel change; the root never matches formation filters (it has no incoming edge).
- CharSplit is only tried on family roots (words not explained by a derivation) — derived words like `bevorstehend` were otherwise split as compounds.

## Frontend

- Family files embed a compact summary of every node (display, segmentation, level, features, gloss) — the tree and all filters work from one request; the full entry is loaded only for the detail panel.
- `browse/words.json` (one compact row per word) powers all four Browse tabs; `families_index.json` only carries the spec fields — loaded only on the Browse page.
- `lexicon/complete/{shard}.json` holds lemma lists sorted by frequency for autocomplete — the forms index is keyed by form, not by lemma prefix.
- d3-transition is not used (not in the stack); zoom/focus animations use a 200 ms `requestAnimationFrame` interpolation and are skipped under `prefers-reduced-motion`.
- A theme setting (system/light/dark) was added to the settings menu — dark mode is a listed feature and users need a way to override the OS preference.
- The `lang=` URL parameter is also honoured when it appears in a link opened inside the app (hashchange) — spec: URL parameter wins.
- UI strings live in `web/scripts/strings.py`, which generates `en.json` and `zh-Hant.json` with identical keys.

<!-- auto:start -->

### Auto-detected by pipeline.py (last build)

- UDer columns detected from the first 200 lines: ID=0, LEMID=1, LEMMA=2, POS=3, FEATS=4, SEGMENTATION=5, PARENTID=6, RELTYPE=7, OTHERPARENTS=8, MISC=9
- Frequency: forms shared by several lemmas (wordfreq is case-insensitive: haus/Haus, freie/freien) are split in proportion to each lemma's unambiguous forms. Hyphenated forms are not counted (wordfreq splits them).

<!-- auto:end -->
