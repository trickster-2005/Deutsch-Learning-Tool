# Final report

Build date: 2026-09-29 · Repository: <https://github.com/trickster-2005/Deutsch-Learning-Tool> (branch `main`) · Site: <https://trickster-2005.github.io/Deutsch-Learning-Tool/>

## ⚠ Manual step needed (one time)

GitHub Pages is not enabled on the repository yet, and no logged-in `gh` CLI was available to enable it. The first workflow run therefore built and tested everything, then stopped at `actions/configure-pages` ("Pages not enabled").

1. Open <https://github.com/trickster-2005/Deutsch-Learning-Tool/settings/pages>.
2. **Build and deployment → Source: GitHub Actions.**
3. Re-run the workflow: Actions → "Deploy to GitHub Pages" → Run workflow (or push any commit).
4. Check: `curl -I https://trickster-2005.github.io/Deutsch-Learning-Tool/` and `curl -I https://trickster-2005.github.io/Deutsch-Learning-Tool/data/families_index.json` should both return `200`.

Alternatively, with the GitHub CLI logged in: `gh api -X POST repos/trickster-2005/Deutsch-Learning-Tool/pages -f build_type=workflow`, then `gh workflow run deploy.yml`.

## Push and deployment results

| Step | Result |
|---|---|
| `git push -u origin main` | ✅ succeeded (remote was empty: no README/LICENSE to merge, no force push) |
| Workflow run [36518978865](https://github.com/trickster-2005/Deutsch-Learning-Tool/actions/runs/36518978865) | ✅ checkout, setup-node (Node 20), `npm ci`, `npm test` (17 tests), `npm run build` · ❌ `configure-pages` — Pages not enabled · ⏭ upload/deploy skipped |
| Site / data URL (`curl`) | `404` / `404` — expected until Pages is enabled |

## Completed milestones

| Milestone | Status |
|---|---|
| M1 download & exploration | ✅ `download.py` (resumable, 3 retries, cached); UDer columns and Wiktionary fields detected and recorded in `DECISIONS.md` |
| M2 lexicon & derivation trees | ✅ DErivBase + Wiktionary merge, frequency with separable boost, separability, path-node retention, tree stitching |
| M3 segmentation, compounds, edges | ✅ path-based segmentation (elision/umlaut/ablaut), Wiktionary fallback, compounds (Wiktionary + CharSplit), linking elements, edge annotation; all curated files from section 9 |
| M4 glosses, examples, topics, levels, output | ✅ all JSON of section 11 plus reports in `build/reports/` |
| M5 frontend skeleton | ✅ HashRouter, i18n (EN default, 繁體中文), colour tokens, fonts (self-hosted), dark mode, search (multi-word, folded suggestions, ä ö ü ß buttons, autocomplete) |
| M6 tree, compounds, details | ✅ D3 tree (zoom/pan/collapse/keyboard/focus), outline view, compound panel, detail panel incl. two-reading verbs |
| M7 levels, filters, modes, my level, colour-by, URL sync | ✅ |
| M8 browse page (4 tabs) | ✅ families, affixes (with dual-prefix comparison), formation patterns (+ vowel change), compounds (by part / linking element) |
| M9 guide & help, accessibility, tests | ✅ How it works page, "?" legend popover generated from the tree's tokens; Lighthouse accessibility 100 on Home, Family, Browse and How it works (heading order fixed after a first 98); all tests pass |
| M10 docs & screenshots | ✅ `README.md`, `README.zh-TW.md` (linked to each other), `LICENSES.md`, screenshots via Playwright (Edge) |
| M11 push & deploy | ✅ pushed · ⚠ Pages must be enabled manually (see top) |

## Data statistics

| | |
|---|---|
| Families | 15,845 (12,244 single-word, 2,842 with 2–4 words, 519 with 5–9, 161 with 10–19, 79 with 20+) |
| Words in families | 27,308 (25,662 kept by frequency, 1,646 path nodes) |
| Compounds | 4,743 (2,876 from Wiktionary templates, 1,867 from CharSplit) |
| Same-spelling separable/inseparable verbs | 79 (e.g. `übersetzen#sep` / `übersetzen#insep`) |
| Estimated levels | A1 810 · A2 691 · B1 1,154 · B2 2,704 · C1 5,136 · C2 10,179 · beyond 6,792 |
| Coverage | English gloss 82.7 % · Chinese gloss 71.6 % · IPA 95.2 % · examples 16.6 % · topics 11.4 % · noun gender 98.7 % · noun plural 87.4 % · verb conjugation 86.5 % · auxiliary 97.9 % · principal parts 97.5 % · adjective comparative 58.3 % |
| Segmentation | derivation-path success 82.4 % of non-root nodes (8,595 exact, 465 umlaut, 380 ablaut); 644 from Wiktionary templates; 1,379 uncertain |
| Tree stitching | 7,315 prefixed verbs, 9,384 via Wiktionary etymology, 1,685 infinitive reorientations, 1,284 conversions, 601 `un-`, 94 deadjectival, 406 DErivBase other-parents; 3,708 compound edges detached |
| `web/public/data/` | 61.0 MB in 17,203 files (limit 500 MB); largest file `browse/words.json` 7.5 MB (limit 50 MB); final Zipf threshold 3.0 (unchanged) |

Spot checks (`build/reports/spot_checks.md`): stehen (48 words), gehen (53), sprechen (31), fahren (38), Haus (7 words + 82 compounds: 22 as first part, 60 as head), frei (10), schreiben (28), kaufen (25), arbeiten (39), Freund (19, root `froh` via DErivBase/Wiktionary), geben (45), lesen (21). The trees are plausible: e.g. `stehen → auf|stehen → Aufstehen`, `kaufen → verkaufen → Verkauf → Vorverkauf`, `arbeiten → Arbeit → arbeitslos → Arbeitslosigkeit`, `sprechen → an|sprechen → Ansprache (ablaut)`.

## Acceptance checks (spec 15.4)

| Check | Result |
|---|---|
| `stand auf`, `aufgestanden`, `steht auf` → `stehen` family, focus `aufstehen` | ✅ (forms index + browser test) |
| `Häuser` → `Haus`; compound panel has `Haus·tür` (first part) and `Kranken·haus` (head) | ✅ |
| `Strasse` → "Did you mean Straße?" | ✅ |
| `aufstehen` detail: `steht auf · stand auf · ist aufgestanden` | ✅ |
| Switch to Chinese: all UI in Traditional Chinese, German unchanged, kept after reload | ✅ (`gwf.lang` in localStorage; `lang=` URL parameter wins) |
| `?level=A1,A2&pos=VERB&pt=separable&mode=prune` reproduces the view | ✅ (filters, mode and focus live in the URL) |
| 375 px phone width | ✅ no horizontal scroll; outline view, full-screen filters, bottom detail drawer |
| Lighthouse accessibility ≥ 90 | ✅ 100 on Home, Family, Browse, How it works (Edge, headless) |
| All routes open directly on GitHub Pages | ⏳ HashRouter + `base: '/Deutsch-Learning-Tool/'` are in place; verifiable once Pages is enabled |
| How it works in both languages, legend identical to the tree | ✅ legend renders the same CSS token classes as the tree |
| READMEs exist, link to each other, include site URL and screenshots | ✅ |
| Code on `main`, Actions deployment | ✅ pushed; ⚠ deployment waits for Pages to be enabled |

## Tests

- `cd build && uv run pytest` — 62 passed (root endings, prefixes, two suffixes, e-elision, umlaut, ablaut, failure, Wiktionary fallback, separability incl. `übersetzen`, linking elements, CharSplit threshold/part checks, plural types, conversion types, path retention, frequency sum + separable boost, level cut-offs, Chinese gloss cleanup, search keys, stitching).
- `cd web && npm test` — 17 passed (filter AND/OR, dual verbs, URL round trip, prune ancestors, edge filters act on the child, affix filter, multi-word search, folded suggestions, my-level groups, identical i18n key sets, morpheme/separator alignment).
- `npm run build` — succeeds locally and in CI.

## Fallbacks used

- **UDer download**: the LINDAT `xmlui` URL now returns HTML (DSpace 7 migration) → resolved through the LINDAT REST API.
- **English Wiktionary**: the 3 GB raw dump downloaded at ~0.4 MB/s → used kaikki.org's German-only slice of the same extraction (98 MB); the raw dump stays as automatic fallback.
- **CharSplit**: the PyPI package named `charsplit` is a different project → installed from `github.com/dtuggener/CharSplit` (MIT, bundled model).
- **d3-transition** not in the stack → 200 ms zoom/focus animation implemented with `requestAnimationFrame`.
- **Pages enablement**: no `gh` CLI → manual step (top of this report).
- No source was missing, so no "continue without source" fallback was needed.

## Known issues

- DErivBase itself links some unrelated words (e.g. `freuen → freund → Freund`, root `froh`); stitching rules can also connect look-alikes. Fix via `overrides.yaml` → `unlink`.
- Frequencies are case-insensitive; shared forms are split by a heuristic (e.g. `Frei` noun vs `frei`), and place names inflate some verbs (`hausen`).
- Participle adjectives (`stehend`, `befreit`) appear in trees because Wiktionary lists them as adjectives; their edges have no formation label.
- Compound segmentation of words whose parts are not themselves kept lemmas falls back to whole-part stems.
- For same-spelling verbs the Chinese gloss is shared by both readings (zh.wiktionary does not split them).
- `affix_unmatched.csv` (96 candidates, e.g. participle `-t`, `-e`) and `separability_unknown.csv` (327 verbs with dual prefixes and no evidence) list open data-quality work.
- The browse page loads `browse/words.json` (7.5 MB, ~1.5 MB gzipped) on first visit.

## Files

`DECISIONS.md` (all small decisions with reasons, plus the pipeline's auto-detected fields), `LICENSES.md`, `README.md`, `README.zh-TW.md`, `build/reports/*`, `docs/screenshots/*`.
