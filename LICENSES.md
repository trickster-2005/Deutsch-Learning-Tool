# Licenses and credits

> This is an engineering assessment of license compatibility, not legal advice.

## Summary

| Part | License |
|---|---|
| Source code (`build/`, `web/src/`, workflows, scripts) | MIT (below) |
| Generated data (`web/public/data/`) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Self-hosted fonts (PT Serif, IBM Plex Sans, Noto Sans TC via Fontsource) | SIL Open Font License 1.1 |

All data sources are CC BY-SA or more permissive. CC BY-SA 3.0 material may be adapted under CC BY-SA 4.0 (CC BY-SA 3.0 Unported §4(b) allows an Adaptation to be licensed under "a later version of this License with the same License Elements"), GFDL-dual-licensed Wiktionary text is used under its CC BY-SA option, and MIT/Apache-licensed tools impose no share-alike conditions on their output. The combined data is therefore released as one CC BY-SA 4.0 dataset.

If you create `build/curated/levels_custom.csv`, the generated `web/public/data/levels/custom.json` is **not** committed (see `.gitignore`); you must make sure you have the right to use and publish that list.

## Data sources

| Source | Used for | License | Authors / link |
|---|---|---|---|
| DErivBase 2.0, harmonised in Universal Derivations (UDer) 1.1 | derivational family trees | CC BY-SA 3.0 (`LICENSE` in the `de-DErivBase` folder of UDer-1.1.tgz) | Britta Zeller, Jan Šnajder, Sebastian Padó (University of Stuttgart); harmonised by Lukáš Kyjánek et al. — <https://lindat.mff.cuni.cz/repository/xmlui/handle/11234/1-3247> |
| English Wiktionary (via Wiktextract / kaikki.org) | English definitions, examples, grammar, word forms, categories, etymology templates | CC BY-SA 3.0/4.0 and GFDL | Wiktionary contributors — <https://en.wiktionary.org/>, <https://kaikki.org/dictionary/> |
| German Wiktionary (via Wiktextract / kaikki.org) | grammar (gender, plurals, conjugation, auxiliaries), IPA, word forms | CC BY-SA 3.0/4.0 and GFDL | Wiktionary contributors — <https://de.wiktionary.org/>, <https://kaikki.org/dewiktionary/> |
| Chinese Wiktionary (via Wiktextract / kaikki.org) | Chinese definitions (converted to Traditional Chinese with OpenCC `s2twp`) | CC BY-SA 3.0/4.0 and GFDL | Wiktionary contributors — <https://zh.wiktionary.org/>, <https://kaikki.org/zhwiktionary/> |
| CharSplit (bundled n-gram model) | splitting compounds | MIT | Don Tuggener — <https://github.com/dtuggener/CharSplit> |
| wordfreq data | word frequencies, levels | CC BY-SA 4.0 (data), Apache 2.0 (code) | Robyn Speer — <https://github.com/rspeer/wordfreq> |
| Curated tables (`build/curated/*.yaml`) | affix meanings, prefix lists, topic map | CC BY-SA 4.0 (this project) | this project |

Tools used only at build time: Wiktextract (Tatu Ylonen, MIT), OpenCC (Apache 2.0), polars (MIT), PyYAML (MIT), requests (Apache 2.0).
Frontend libraries: React (MIT), React Router (MIT), d3-hierarchy / d3-zoom / d3-selection (ISC), Vite (MIT).

### Not used

No Goethe-Institut word lists or datasets derived from them, no DAFlex / Profile Deutsch / publisher lists, and no GermaNet data are used, because they are not openly licensed.

## Citations

- Zeller, Britta; Šnajder, Jan; Padó, Sebastian (2013). *DErivBase: Inducing and Evaluating a Derivational Morphology Resource for German.* Proceedings of ACL 2013, Sofia, pp. 1201–1211.
- Kyjánek, Lukáš; Žabokrtský, Zdeněk; Ševčíková, Magda; Vidra, Jonáš (2020). *Universal Derivations 1.0, A Growing Collection of Harmonised Word-Formation Resources.* The Prague Bulletin of Mathematical Linguistics 115, pp. 5–30. (Data: Universal Derivations 1.1, LINDAT/CLARIAH-CZ, hdl:11234/1-3247.)
- Ylonen, Tatu (2022). *Wiktextract: Wiktionary as Machine-Readable Structured Data.* Proceedings of LREC 2022, pp. 1317–1325.
- Tuggener, Don (2016). *Incremental Coreference Resolution for German.* PhD thesis, University of Zurich (CharSplit).
- Speer, Robyn (2022). *rspeer/wordfreq: v3.0.* Zenodo. doi:10.5281/zenodo.7199437.

## MIT License (code)

Copyright (c) 2026 trickster-2005 and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## CC BY-SA 4.0 (data)

The generated data in `web/public/data/` is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License: <https://creativecommons.org/licenses/by-sa/4.0/legalcode>. Attribution: "German Word Families data, built from DErivBase (Zeller, Šnajder & Padó), Universal Derivations, Wiktionary contributors, CharSplit and wordfreq."
