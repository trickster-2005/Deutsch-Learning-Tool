"""Offline data build: DErivBase + Wiktionary + CharSplit + wordfreq -> JSON.

Run after download.py:  uv run python pipeline.py
Steps follow spec section 7 (7.1 ... 7.11). Output goes to web/public/data/,
reports to build/reports/.
"""
from __future__ import annotations

import json
import re
import sys
import time
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path

import yaml

from adapters.base import DerivNode, Morpheme, Segmentation
from adapters.compounds import CompoundAnalyser
from adapters.derivbase import DErivBaseProvider, rule_description
from adapters.frequency import allocate, lemma_zipf, stars
from adapters.levels import estimate_levels, load_custom
from adapters.segmenter import AffixInventory, Match, PathSegmenter, split_verb_ending
from adapters.stitch import (Forest, detach_compound_edges, reorient_nominalized_infinitives,
                             stitch_alt_parents, stitch_conversions, stitch_etymology,
                             stitch_prefixed)
from adapters.text import has_umlaut, undo_umlaut
from adapters.topics import TopicMapper
from adapters.wiktionary import (adjective_forms, load_edition, noun_forms, noun_gender,
                                 search_forms, verb_features, verb_separability)

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / ".cache"
CURATED = ROOT / "curated"
REPORTS = ROOT / "reports"
OUT = ROOT.parent / "web" / "public" / "data"

Key = tuple[str, str]
POS_ORDER = ["NOUN", "VERB", "ADJ", "ADV", "OTHER"]
ARTICLE = {"masc": "der", "femn": "die", "neut": "das"}


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def load_yaml(p: Path) -> dict:
    return yaml.safe_load(p.read_text("utf-8")) or {}


# ------------------------------------------------------------------ model

@dataclass
class Word:
    key: Key
    lemma: str
    pos: str
    in_wikt: bool = False
    forms: set[str] = field(default_factory=set)
    zipf: float = 0.0
    prefix_type: str | None = None
    sep_prefix: str | None = None
    dual: bool = False
    lemma_key: str = ""
    kept: bool = False
    path_node: bool = False
    family: str | None = None
    seg: Segmentation | None = None
    match: Match | None = None
    compound: dict | None = None


def plural_type(sg: str | None, pl: str | None) -> str:
    """Spec 8: compare singular and nominative plural."""
    if not pl or pl in ("-", "—"):
        return "none"
    if not sg:
        return "other"
    if pl == sg:
        return "zero"
    if undo_umlaut(pl) == undo_umlaut(sg):
        return "uml_zero"
    if sg.endswith("in") and pl == sg + "nen":
        return "en"
    for suf in ("er", "en", "e", "n", "s"):
        if pl.endswith(suf):
            base = pl[:-len(suf)]
            if undo_umlaut(base) == undo_umlaut(sg):
                uml = base != sg and has_umlaut(base)
                if suf in ("en", "n"):
                    return "en"
                if suf == "s":
                    return "s"
                return ("uml_" if uml else "") + suf
    return "other"


ZH_BRACKETS = [re.compile(r"〔[^〕]*〕"), re.compile(r"\{[^}]*\}"), re.compile(r"【[^】]*】"),
               re.compile(r"\[助動詞[^\]]*\]"), re.compile(r"［[^］]*］"), re.compile(r"〈[^〉]*〉"),
               re.compile(r"\bpl\.\s*\S+"), re.compile(r"^\s*(?:adj|adv|vt|vi|v|n|a|prep|konj|interj)\.\s*")]
ZH_JUNK = ("國際音標", "IPA", "幫助", "http")


def clean_zh(text: str, cc) -> str:
    """OpenCC s2twp, then drop grammar markers (spec 7.8); '' for junk lines."""
    t = cc.convert(text) if cc else text
    if any(j in t for j in ZH_JUNK) or t.lstrip().startswith("*"):
        return ""
    for pat in ZH_BRACKETS:
        t = pat.sub("", t)
    t = re.sub(r"\s+", " ", t).strip(" ；;，,、。:：")
    return t


def truncate(s: str, n: int) -> str:
    return s if len(s) <= n else s[:n - 1].rstrip() + "…"


def _participles(v: dict) -> list[str]:
    return [f for f, tags, _pr, _a, src in v["forms"]
            if not src and ("participle-2" in tags or {"participle", "past"} <= set(tags))]


def decide_separability(lemma: str, variants: list[dict], verbs: set[str], inv: AffixInventory,
                        override: str | None = None) -> tuple[str, str | None, bool]:
    """Spec 7.4 -> (prefix_type, prefix, dual).

    1 override; 5 (checked first) variants disagree -> dual (übersetzen);
    2 split finite forms ('steht auf'); 3 past participle (auf-ge-standen vs
    übersetzt); 4 prefix lists, only when the rest of the word is itself a verb.
    """
    pref = sorted(inv.prefixes, key=len, reverse=True)
    insep_like = inv.inseparable | inv.dual
    plausible = [p for p in pref if lemma.startswith(p) and lemma[len(p):] in verbs and len(lemma) - len(p) >= 3]
    if override:
        return override, (plausible[0] if plausible else None), False
    classes = set()
    for v in variants:
        t, p = verb_separability(lemma, v)
        if t:
            classes.add(("separable", p))
            continue
        pp = _participles(v)
        for pr in pref:
            if pr in insep_like and pr != "ge" and lemma.startswith(pr) and pp and                     pp[0].startswith(pr) and not pp[0].startswith(pr + "ge"):
                classes.add(("inseparable", pr))
                break
    types = {c[0] for c in classes}
    if types == {"separable", "inseparable"}:
        return "unknown", next(c[1] for c in classes if c[0] == "separable"), True
    if "separable" in types:
        return "separable", next(c[1] for c in classes), False
    pps = [f for v in variants for f in _participles(v)]
    for pr in pref:
        if not lemma.startswith(pr) or len(lemma) - len(pr) < 3:
            continue
        if pr not in plausible and (pr not in insep_like or pr == "ge"):
            continue
        for pp in pps:
            if pp.startswith(pr + "ge") and pr not in inv.inseparable:
                return "separable", pr, False
            if pp.startswith(pr) and not pp.startswith(pr + "ge") and pr in insep_like:
                return "inseparable", pr, False
    if plausible:
        pr = plausible[0]
        if pr in inv.separable:
            return "separable", pr, False
        if pr in inv.inseparable:
            return "inseparable", pr, False
        if pr in inv.dual:
            return "unknown", pr, False
    return "none", None, False


# ------------------------------------------------------------------ build

class Build:
    def __init__(self):
        self.cfg = load_yaml(ROOT / "config.yaml")
        self.particles = load_yaml(CURATED / "particles.yaml")
        self.affixes = load_yaml(CURATED / "affixes.yaml")
        self.topics_table = load_yaml(CURATED / "topics.yaml")
        self.overrides = load_yaml(CURATED / "overrides.yaml")
        for k in ("segmentation", "separable", "compound", "gloss_en", "gloss_zh"):
            self.overrides.setdefault(k, {})
            self.overrides[k] = self.overrides[k] or {}
        for k in ("unlink", "not_compound"):
            self.overrides[k] = self.overrides.get(k) or []
        self.inv = AffixInventory.from_yaml(self.affixes, self.particles)
        self.seg = PathSegmenter(self.inv)
        self.decisions: list[str] = []
        self.stats: dict = {}
        self.reports: dict[str, list] = defaultdict(list)

    # -------------------------------------------------------------- 7.1-7.2
    def load_sources(self) -> None:
        log("loading DErivBase")
        self.dbase = DErivBaseProvider(CACHE / "de-DErivBase")
        if self.dbase.available():
            nodes, _trees = self.dbase.load()
            self.decisions.append(
                "UDer columns detected from the first 200 lines: "
                + ", ".join(f"{k}={v}" for k, v in sorted(self.dbase.columns.items(), key=lambda x: x[1])))
            self.stats["derivbase"] = self.dbase.stats
        else:
            nodes = {}
            self.decisions.append("DErivBase missing: every lemma becomes a single-node family.")
        log("loading Wiktionary (en/de/zh)")
        self.lex = {}
        for ed in ("en", "de", "zh"):
            p = CACHE / f"wikt_{ed}_de.jsonl"
            self.lex[ed] = load_edition(p, ed, CACHE / f"lex_{ed}.pkl") if p.exists() else {}
            if not self.lex[ed]:
                self.decisions.append(f"Wiktionary {ed} unavailable; fields from it are empty.")
        self.stats["wiktionary_lemmas"] = {ed: len(v) for ed, v in self.lex.items()}

        # universe: DErivBase lemmas + Wiktionary lemmas (en/de) not in DErivBase
        wikt_keys = set(self.lex["en"]) | set(self.lex["de"])
        for k in wikt_keys:
            if k not in nodes:
                nodes[k] = DerivNode(key=k, lemma=k[0], pos=k[1], source="wiktionary")
        self.nodes = nodes
        self.words: dict[Key, Word] = {k: Word(k, k[0], k[1], in_wikt=k in wikt_keys) for k in nodes}
        # lookup helpers
        self.by_lower: dict[str, list[Key]] = defaultdict(list)
        for k in self.words:
            self.by_lower[k[0].lower()].append(k)
        log(f"universe: {len(self.words)} lemmas")

    def variants(self, k: Key, ed: str) -> list[dict]:
        return self.lex[ed].get(k, [])

    def lookup_key(self, word: str, prefer_wikt: bool = True) -> Key | None:
        """Word -> best matching lemma key (case of first letter ignored)."""
        cands = self.by_lower.get(word.lower(), [])
        if not cands:
            return None
        def score(k: Key):
            exact = k[0] == word
            capital = k[0][:1].isupper() == word[:1].isupper()
            return (self.words[k].in_wikt if prefer_wikt else True, exact, capital,
                    -POS_ORDER.index(k[1]))
        best = max(cands, key=score)
        if prefer_wikt and not self.words[best].in_wikt:
            return best if self.nodes[best].source == "derivbase" else None
        return best

    # ---------------------------------------------------------------- 7.3 freq (pre-pass)
    def frequencies(self) -> None:
        log("frequencies")
        boost = float(self.cfg["separable_boost"])
        claim_forms, sep = {}, {}
        for k, w in self.words.items():
            var = self.variants(k, "de") + self.variants(k, "en")
            w.forms = search_forms(k[0], var) | {k[0]}
            if w.in_wikt:
                claim_forms[k] = w.forms
                sep[k] = w.prefix_type == "separable"
        alloc = allocate(claim_forms, sep, boost)
        for k, w in self.words.items():
            w.zipf = alloc[k] if k in alloc else lemma_zipf(w.forms, separable=False, boost=boost)
        self.decisions.append(
            "Frequency: forms shared by several lemmas (wordfreq is case-insensitive: haus/Haus, "
            "freie/freien) are split in proportion to each lemma's unambiguous forms. Hyphenated "
            "forms are not counted (wordfreq splits them).")

    # ---------------------------------------------------------------- 7.4
    def separability(self) -> None:
        log("separability")
        verbs = {k[0] for k in self.words if k[1] == "VERB"}
        unknown = []
        for k, w in self.words.items():
            if k[1] != "VERB":
                continue
            var = self.variants(k, "de") + self.variants(k, "en")
            w.prefix_type, w.sep_prefix, w.dual = decide_separability(
                k[0], var, verbs, self.inv, self.overrides["separable"].get(k[0]))
            if w.prefix_type == "unknown" and not w.dual:
                unknown.append((k[0], w.sep_prefix, "dual prefix, no split forms or participle"))
        self.reports["separability_unknown"] = unknown

    # ---------------------------------------------------------------- stitching
    def stitch(self) -> None:
        log("stitching DErivBase trees")
        f = Forest(self.nodes)
        zipf = lambda k: self.words[k].zipf  # noqa: E731
        reorient_nominalized_infinitives(f)
        verb_prefixes = [p for p in self.inv.prefixes if self.inv.prefix_kind.get(self.inv.prefixes[p]) != "nominal"]
        stitch_prefixed(f, verb_prefixes, ["un"], zipf)

        def ety_of(k: Key):
            out = []
            for v in self.variants(k, "en"):
                out += list(v["ety"])
            return out

        def lookup(word: str):
            k = self.lookup_key(word)
            return k

        stitch_etymology(f, ety_of, lookup)
        stitch_conversions(f, zipf)
        stitch_alt_parents(f)
        reorient_nominalized_infinitives(f)  # alt parents may re-introduce noun-over-verb
        detach_compound_edges(f, set(self.inv.prefixes),
                              lambda s: any(self.words[k].in_wikt for k in self.by_lower.get(s, [])))
        # overrides: unlink
        for pair in self.overrides["unlink"]:
            parent, child = pair
            for k in self.by_lower.get(child.lower(), []):
                n = self.nodes[k]
                if n.parent and n.parent[0].lower() == parent.lower():
                    n.parent = None
                    n.rule = "unlinked:override"
                    f.log["unlink_override"] += 1
        self.forest = f
        self.stats["stitching"] = dict(f.log)
        self.stats["stitching_examples"] = dict(f.examples)

    # ---------------------------------------------------------------- 7.3 retention
    def retain(self) -> None:
        log("retention")
        min_z = float(self.cfg["min_zipf"])
        custom = {(r["lemma"], r.get("pos", "")) for r in load_custom(CURATED / "levels_custom.csv")}
        custom_lemmas = {c[0] for c in custom}
        for k, w in self.words.items():
            w.kept = w.in_wikt and (w.zipf >= min_z or k[0] in custom_lemmas)
        # keep ancestors
        for k, w in list(self.words.items()):
            if not w.kept:
                continue
            p = self.nodes[k].parent
            while p is not None:
                pw = self.words[p]
                if pw.kept or pw.path_node:
                    break  # the rest of the chain is handled from there
                pw.path_node = True
                p = self.nodes[p].parent
        included = [k for k, w in self.words.items() if w.kept or w.path_node]
        self.included = included
        self.stats["kept"] = sum(1 for w in self.words.values() if w.kept)
        self.stats["path_nodes"] = sum(1 for w in self.words.values() if w.path_node)

    # ---------------------------------------------------------------- keys & families
    def assign_keys(self) -> None:
        by_lemma: dict[str, list[Key]] = defaultdict(list)
        for k in self.included:
            by_lemma[k[0]].append(k)
        for lemma, ks in by_lemma.items():
            ks.sort(key=lambda k: (not self.words[k].kept, -self.words[k].zipf, POS_ORDER.index(k[1])))
            for i, k in enumerate(ks):
                self.words[k].lemma_key = lemma if i == 0 else f"{lemma}#{k[1].lower()}"
        self.key_index = {self.words[k].lemma_key: k for k in self.included}

    def build_families(self) -> None:
        log("families")
        inc = set(self.included)
        ch = defaultdict(list)
        roots = []
        for k in self.included:
            p = self.nodes[k].parent
            if p is not None and p in inc:
                ch[p].append(k)
            else:
                roots.append(k)
        self.children = ch
        roots.sort(key=lambda k: (k[0].lower(), k[1]))
        self.families = []
        for i, r in enumerate(roots, start=1):
            fid = f"f{i:05d}"
            members = []
            stack = [r]
            while stack:
                k = stack.pop()
                members.append(k)
                self.words[k].family = fid
                stack.extend(ch.get(k, []))
            self.families.append({"id": fid, "root": r, "members": members})
        self.stats["families"] = len(self.families)

    # ---------------------------------------------------------------- 7.5 segmentation
    def segment(self) -> None:
        log("segmentation")
        ovs = self.overrides["segmentation"]
        outcome = Counter()
        unmatched = Counter()
        unmatched_ex: dict[str, str] = {}
        for fam in self.families:
            order = [fam["root"]]
            i = 0
            while i < len(order):
                order.extend(self.children.get(order[i], []))
                i += 1
            for k in order:
                w = self.words[k]
                if w.lemma_key in ovs:
                    parts = [[Morpheme(m["text"], m["type"]) for m in part] for part in ovs[w.lemma_key]]
                    w.seg = Segmentation(parts, "override", 1.0)
                    outcome["override"] += 1
                    continue
                parent = self.nodes[k].parent
                if parent is None or parent not in self.words or self.words[parent].seg is None:
                    w.seg = self.seg.root(k[0], k[1])
                    outcome["root"] += 1
                    continue
                pw = self.words[parent]
                pstem = "".join(m.text for m in pw.seg.parts[-1] if m.type != "END") \
                    if len(pw.seg.parts) == 1 else parent[0]
                if parent[1] == "VERB" and len(pw.seg.parts) != 1:
                    pstem = split_verb_ending(parent[0])[0]
                if k[1] != "VERB" and k[0].lower() == parent[0].lower():
                    # nominalized infinitive: das Essen keeps essen's morphemes
                    parts = [[Morpheme(m.text, m.type) for m in pw.seg.parts[-1]]]
                    if parts[0]:
                        parts[0][0] = Morpheme(k[0][:len(parts[0][0].text)], parts[0][0].type)
                    w.seg = Segmentation(parts, "derivation-path", 1.0)
                    w.match = Match([], [], k[0], "", None, 1.0)
                    outcome["path"] += 1
                    continue
                if k[1] == "ADJ" and parent[1] == "VERB":
                    rest = k[0][len(pstem):] if k[0].lower().startswith(pstem.lower()) else None
                    if rest in ("end", "nd", "d", "t", "et", "en"):
                        # participle adjective (stehend, befreit): inflection, not an affix
                        parts = [[Morpheme(m.text, m.type) for m in pw.seg.parts[-1] if m.type != "END"]
                                 + [Morpheme(rest, "END")]]
                        w.seg = Segmentation(parts, "derivation-path", 1.0)
                        w.match = Match([], [], k[0][:len(pstem)], rest, None, 1.0)
                        outcome["path"] += 1
                        continue
                m = self.seg.match(k[0], k[1], parent[0], parent[1], pstem)
                if m is not None:
                    w.match = m
                    w.seg = self.seg.child_segmentation(m, pw.seg, k[1], w.sep_prefix, w.prefix_type)
                    outcome["path" if m.confidence == 1.0 else f"path-{m.change}"] += 1
                    continue
                ety = []
                for v in self.variants(k, "en"):
                    ety += list(v["ety"])
                s = self.seg.from_etymology(k[0], k[1], tuple(ety), w.sep_prefix, w.prefix_type)
                if s is not None:
                    w.seg = s
                    outcome["wiktionary"] += 1
                    continue
                w.seg = self.seg.failed(k[0], k[1])
                outcome["failed"] += 1
                # remember the unexplained difference for affix_unmatched.csv
                cl, pl = k[0].lower(), pstem.lower()
                if cl.startswith(pl) and len(cl) > len(pl):
                    diff = "-" + cl[len(pl):]
                elif cl.endswith(pl) and len(cl) > len(pl):
                    diff = cl[:len(cl) - len(pl)] + "-"
                else:
                    diff = None
                if diff:
                    unmatched[diff] += 1
                    unmatched_ex.setdefault(diff, f"{parent[0]} -> {k[0]}")
        self.stats["segmentation"] = dict(outcome)
        self.reports["affix_unmatched"] = [(a, n, unmatched_ex[a]) for a, n in unmatched.most_common()]

    # ---------------------------------------------------------------- 7.6 compounds
    def compounds(self) -> None:
        log("compounds")
        try:
            from charsplit import Splitter
            splitter = Splitter()
        except Exception as e:  # noqa: BLE001
            splitter = None
            self.decisions.append(f"CharSplit unavailable ({e}); only Wiktionary compounds are used.")

        def lookup(word: str) -> str | None:
            k = self.lookup_key(word)
            if k and self.words[k].in_wikt:
                return k[0]
            return None

        ca = CompoundAnalyser(lookup, splitter, float(self.cfg["charsplit_min_score"]),
                              int(self.cfg["charsplit_min_modifier_len"]))
        ov = self.overrides["compound"]
        not_c = set(self.overrides["not_compound"])
        src = Counter()
        for k in self.included:
            w = self.words[k]
            if k[1] not in ("NOUN", "ADJ") or not w.kept or k[0] in not_c:
                continue
            if w.match is not None and w.seg and w.seg.source == "derivation-path":
                continue  # explained as a derivation of its parent
            a = None
            if k[0] in ov:
                a = ca.from_parts(k[0], list(ov[k[0]]), "override", 1.0)
            if a is None:
                ety = []
                for v in self.variants(k, "en"):
                    ety += list(v["ety"])
                a = ca.from_etymology(k[0], tuple(ety))
            is_root = self.nodes[k].parent is None or self.nodes[k].parent not in self.words                 or not (self.words[self.nodes[k].parent].kept or self.words[self.nodes[k].parent].path_node)
            if a is None and splitter is not None and is_root:
                a = ca.from_charsplit(k[0])
            if a is None or len(a.parts) < 2:
                continue
            if any(p.lower() == k[0].lower() for p in a.parts):
                continue
            src[a.source] += 1
            w.compound = a
        self.stats["compounds"] = dict(src)
        self.reports["compound_rejects"] = ca.rejects[:500]

    def compound_segmentation(self, w: Word) -> Segmentation:
        a = w.compound
        parts = []
        for i, (lem, surf) in enumerate(zip(a.parts, a.surfaces)):
            link = a.links[i] if i < len(a.links) else ""
            body = surf[:len(surf) - len(link)] if link else surf
            pk = self.lookup_key(lem)
            pseg = self.words[pk].seg if pk and self.words[pk].seg else None
            morphs: list[Morpheme]
            if pseg and len(pseg.parts) == 1:
                pm = [m for m in pseg.parts[0] if not (m.type == "END" and i < len(a.parts) - 1)]
                if i == len(a.parts) - 1:
                    pm = list(pseg.parts[0])
                total = sum(len(m.text) for m in pm)
                if total == len(body):
                    morphs, pos = [], 0
                    for m in pm:
                        morphs.append(Morpheme(body[pos:pos + len(m.text)], m.type))
                        pos += len(m.text)
                else:
                    morphs = [Morpheme(body, "ROOT")]
            else:
                morphs = [Morpheme(body, "ROOT")]
            if link:
                morphs.append(Morpheme(surf[len(body):], "LINK"))
            parts.append(morphs)
        conf = a.confidence
        return Segmentation(parts, a.source if a.source != "wiktionary-etymology" else "compound-wiktionary",
                            conf, conf < 0.8)

    # ---------------------------------------------------------------- 7.7 edges
    def edge(self, parent: Key, child: Key) -> dict:
        w = self.words[child]
        m = w.match
        pc = f"{parent[1]}>{child[1]}"
        e = {"parent": None, "child": None, "added_prefixes": [], "prefix_types": [],
             "added_suffixes": [], "vowel_change": None, "pos_change": pc, "semantic_type": None}
        rule = self.nodes[child].rule
        if rule:
            e["rule"] = rule
        if m is None:
            if w.seg and w.seg.source == "wiktionary-etymology":
                for mm in w.seg.parts[0]:
                    if mm.type in ("PREF", "PREF_SEP"):
                        canon = self.inv.prefixes.get(mm.text.lower(), mm.text.lower() + "-")
                        e["added_prefixes"].append(canon)
                        e["prefix_types"].append(self._prefix_type(canon, mm, w))
                    elif mm.type == "SUFF":
                        e["added_suffixes"].append(self.seg.canon_suffix(mm.text, child[1] == "VERB")
                                                   or "-" + mm.text.lower())
                e["semantic_type"] = self._semantic(e, parent, child)
            e["uncertain"] = True
            return e
        for p in m.prefixes:
            canon = self.inv.prefixes.get(p.lower(), p.lower() + "-")
            mm = Morpheme(p, self.seg.prefix_type_for(p, child[1], w.sep_prefix, w.prefix_type))
            e["added_prefixes"].append(canon)
            e["prefix_types"].append(self._prefix_type(canon, mm, w))
        for s in m.suffixes:
            e["added_suffixes"].append(self.seg.canon_suffix(s, child[1] == "VERB") or "-" + s.lower())
        if m.change in ("umlaut", "ablaut"):
            e["vowel_change"] = m.change
        e["semantic_type"] = self._semantic(e, parent, child)
        return e

    def _prefix_type(self, canon: str, mm: Morpheme, w: Word) -> str:
        kind = self.inv.prefix_kind.get(canon, "nominal")
        if w.pos == "VERB":
            if mm.type == "PREF_SEP":
                return "separable"
            if kind == "dual":
                return "inseparable" if w.prefix_type == "inseparable" else ("unknown" if w.prefix_type != "separable" else "separable")
            return "inseparable" if kind in ("inseparable",) else kind
        return kind

    def _semantic(self, e: dict, parent: Key, child: Key) -> str | None:
        pc = e["pos_change"]
        ppos, cpos = parent[1], child[1]
        if e["added_suffixes"]:
            canon = e["added_suffixes"][-1]
            for row in self.inv.suffix_info.get(canon, []):
                inp = row.get("input_pos")
                inp = inp if isinstance(inp, list) else [inp]
                if (row.get("output_pos") == cpos) and (ppos in inp or not inp or inp == [None]):
                    return row.get("semantic_type")
            for row in self.inv.suffix_info.get(canon, []):
                if row.get("output_pos") == cpos:
                    return row.get("semantic_type")
            return None
        if e["added_prefixes"]:
            return "prefixed_verb" if pc == "VERB>VERB" else None
        if ppos == cpos:
            return None
        if pc == "VERB>NOUN":
            gender = self.noun_info(child)[0]
            if child[0] == parent[0][:1].upper() + parent[0][1:] and gender in ("neut", None):
                return "nominalized_infinitive"
            return "stem_noun"
        return {"ADJ>NOUN": "nominalized_adjective", "NOUN>VERB": "denominal_verb",
                "ADJ>VERB": "deadjectival_verb"}.get(pc)

    # ---------------------------------------------------------------- lexicon entries
    def noun_info(self, k: Key) -> tuple[str | None, list[str]]:
        g, gl = noun_gender(self.variants(k, "de") + self.variants(k, "en"))
        if g is None and self.nodes[k].gender:
            g, gl = self.nodes[k].gender, [self.nodes[k].gender]
        return g, gl

    def glosses(self, k: Key, variants_en: list[dict], variants_zh: list[dict], lemma_key: str):
        n = int(self.cfg["max_senses"])
        mx = int(self.cfg["gloss_max_chars"])
        ov_en, ov_zh = self.overrides["gloss_en"], self.overrides["gloss_zh"]
        if lemma_key in ov_en:
            gen = {"text": ov_en[lemma_key], "source": "override"}
        else:
            gl = []
            for v in variants_en:
                for text, tags in v["glosses"]:
                    if set(tags) & {"obsolete", "archaic", "rare", "dated", "dialectal"}:
                        continue
                    short = re.sub(r"\s*\([^()]*\)", "", text).strip(" ;,") or text
                    if short not in gl:
                        gl.append(short)
            gen ={"text": truncate("; ".join(gl[:n]), mx), "source": "wiktionary-en"} if gl else \
                {"text": "", "source": "none"}
        if lemma_key in ov_zh:
            gzh = {"text": ov_zh[lemma_key], "source": "override"}
        else:
            gl = []
            for v in variants_zh:
                for text, tags in v["glosses"]:
                    if set(tags) & {"obsolete", "archaic", "rare", "dated", "dialectal"}:
                        continue
                    t = clean_zh(text, self.cc)
                    if t and t not in gl:
                        gl.append(t)
            gzh = {"text": truncate("；".join(gl[:n]), mx), "source": "wiktionary-zh"} if gl else \
                {"text": "", "source": "none"}
        return gen, gzh

    def examples(self, variants_en: list[dict]) -> list[dict]:
        out = []
        mx = int(self.cfg["example_max_chars"])
        for v in variants_en:
            for de, en in v["examples"]:
                if len(de) <= mx and {"de": de, "en": en} not in out:
                    out.append({"de": de, "en": en})
                if len(out) >= int(self.cfg["max_examples"]):
                    return out
        return out

    def display(self, lemma: str, pos: str, prefix_type: str | None, sep_prefix: str | None,
                compound: dict | None) -> str:
        if pos == "VERB" and prefix_type == "separable" and sep_prefix and lemma.startswith(sep_prefix):
            return f"{sep_prefix}|{lemma[len(sep_prefix):]}"
        if compound:
            segs = []
            for i, surf in enumerate(compound["surfaces"]):
                link = compound["links"][i] if i < len(compound["links"]) else ""
                if link:
                    segs.append(surf[:len(surf) - len(link)])
                    segs.append(link)
                else:
                    segs.append(surf)
            return "·".join(segs)
        return lemma

    def entries(self) -> None:
        log("lexicon entries")
        try:
            import opencc
            self.cc = opencc.OpenCC("s2twp")
        except Exception as e:  # noqa: BLE001
            self.cc = None
            self.decisions.append(f"OpenCC unavailable ({e}); Chinese glosses are not converted.")
        tm = TopicMapper(self.topics_table)
        thresholds = {int(k): v for k, v in self.cfg["stars"].items()}
        self.lexicon: dict[str, dict] = {}
        for k in self.included:
            w = self.words[k]
            if w.compound and (w.match is None or w.seg is None or w.seg.source != "derivation-path"):
                w.seg = self.compound_segmentation(w)
            de, en, zh = self.variants(k, "de"), self.variants(k, "en"), self.variants(k, "zh")
            ipa = None
            for v in de + en:
                if v.get("ipa"):
                    ipa = v["ipa"]
                    break
            cats = []
            for v in en:
                cats += list(v["cats"])
            comp = None
            if w.compound:
                a = w.compound
                comp = {
                    "parts": [], "surfaces": a.surfaces, "links": a.links, "elision": a.elision,
                    "umlaut": a.umlaut, "head_index": len(a.parts) - 1, "source": a.source,
                }
                for lem, surf in zip(a.parts, a.surfaces):
                    pk = self.lookup_key(lem)
                    pw = self.words.get(pk) if pk else None
                    comp["parts"].append({
                        "lemma": lem, "surface": surf,
                        "lemma_key": pw.lemma_key if pw and pw.lemma_key else None,
                        "family_id": pw.family if pw else None,
                    })
            gen, gzh = self.glosses(k, en, zh, w.lemma_key)
            e = {
                "lemma": k[0],
                "display": self.display(k[0], k[1], w.prefix_type, w.sep_prefix, comp),
                "pos": k[1],
                "ipa": ipa,
                "segmentation": w.seg.to_json() if w.seg else None,
                "features": {},
                "gloss_en": gen,
                "gloss_zh": gzh,
                "examples": self.examples(en),
                "topics": tm.topics(cats),
                "freq_stars": stars(w.zipf, thresholds),
                "zipf": w.zipf,
                "compound": comp,
                "family_id": w.family,
                "is_path_node": w.path_node,
            }
            if k[1] == "NOUN":
                g, gl = self.noun_info(k)
                nf = noun_forms(de, en)
                e["gender"] = g or "unknown"
                if g == "plural_only":
                    e["article"] = "die"
                elif gl:
                    e["article"] = "/".join(ARTICLE[x] for x in gl)
                else:
                    e["article"] = None
                e["genitive"] = nf["genitive"]
                e["plural"] = nf["plural"] if g != "plural_only" else k[0]
                e["plural_type"] = plural_type(k[0], nf["plural"]) if (de or en) else "other"
                if g == "plural_only":
                    e["plural_type"] = "other"
                if not (de or en):
                    e["plural_type"] = "other"
                e["features"] = {"gender": e["gender"], "plural_type": e["plural_type"]}
            elif k[1] == "ADJ":
                af = adjective_forms(de, en)
                e.update(af)
            if k[1] == "VERB":
                if w.dual:
                    self._dual_entries(k, w, e, de, en, zh)
                else:
                    vf = verb_features(k[0], de, en)
                    e["features"] = {
                        "conjugation": vf["conjugation"] or "unknown",
                        "prefix_type": w.prefix_type or "none",
                        "separable_prefix": w.sep_prefix if w.prefix_type in ("separable", "inseparable", "unknown") else None,
                        "auxiliary": vf["auxiliary"] or "unknown",
                        "reflexive": vf["reflexive"],
                    }
                    e["principal_parts"] = {
                        "present_3sg": vf.get("present_3sg"), "preterite_3sg": vf.get("preterite_3sg"),
                        "past_participle": vf.get("past_participle"),
                    }
            self.lexicon[w.lemma_key] = e

    def _dual_entries(self, k: Key, w: Word, e: dict, de, en, zh) -> None:
        """übersetzen#sep / übersetzen#insep (spec 7.4 step 5)."""
        lemma = k[0]

        def cls(v):
            t, _p = verb_separability(lemma, v)
            if t:
                return "sep"
            pp = [f for f, tags, _pr, _a, src in v["forms"]
                  if not src and ("participle-2" in tags or {"participle", "past"} <= set(tags))]
            if pp and pp[0].startswith(w.sep_prefix) and not pp[0].startswith(w.sep_prefix + "ge"):
                return "insep"
            return None

        keys = []
        for variant, ptype in (("sep", "separable"), ("insep", "inseparable")):
            d = [v for v in de if cls(v) == variant]
            n = [v for v in en if cls(v) == variant] or [v for v in en if cls(v) is None]
            z = zh
            vf = verb_features(lemma, d, n)
            gen, gzh = self.glosses(k, n, z, f"{lemma}#{variant}")
            seg = None
            if w.seg:
                parts = [[Morpheme(m.text, ("PREF_SEP" if ptype == "separable" else "PREF")
                                   if m.type in ("PREF", "PREF_SEP") and i == 0 else m.type)
                          for i, m in enumerate(part)] for part in w.seg.parts]
                seg = Segmentation(parts, w.seg.source, w.seg.confidence, w.seg.uncertain).to_json()
            sub = dict(e)
            sub.update({
                "display": f"{w.sep_prefix}|{lemma[len(w.sep_prefix):]}" if variant == "sep" else lemma,
                "segmentation": seg,
                "features": {
                    "conjugation": vf["conjugation"] or "unknown", "prefix_type": ptype,
                    "separable_prefix": w.sep_prefix, "auxiliary": vf["auxiliary"] or "unknown",
                    "reflexive": vf["reflexive"],
                },
                "principal_parts": {"present_3sg": vf.get("present_3sg"),
                                    "preterite_3sg": vf.get("preterite_3sg"),
                                    "past_participle": vf.get("past_participle")},
                "gloss_en": gen, "gloss_zh": gzh, "examples": self.examples(n),
                "variant_of": w.lemma_key, "variant": variant,
            })
            key = f"{lemma}#{variant}"
            self.lexicon[key] = sub
            keys.append(key)
        e["dual"] = keys
        e["features"] = {"prefix_type": "unknown", "separable_prefix": w.sep_prefix,
                         "conjugation": "unknown", "auxiliary": "unknown", "reflexive": False}
        e["principal_parts"] = None

    # ---------------------------------------------------------------- 7.10 levels
    def levels(self) -> None:
        log("levels")
        entries = [(self.words[k].lemma_key, k[1], self.words[k].zipf)
                   for k in self.included if self.words[k].kept]
        lv = estimate_levels(entries, self.cfg["cefr_cutoffs"])
        for k in self.included:
            w = self.words[k]
            if w.lemma_key not in lv:
                lv[w.lemma_key] = "beyond"
        for key, e in self.lexicon.items():
            if "variant_of" in e:
                lv[key] = lv.get(e["variant_of"], "beyond")
        self.level_map = lv
        custom_rows = load_custom(CURATED / "levels_custom.csv")
        self.custom_levels = {}
        for r in custom_rows:
            lem = r["lemma"].strip()
            for key, e in self.lexicon.items():
                if e["lemma"] == lem and (not r.get("pos") or r["pos"].upper() == e["pos"]):
                    self.custom_levels[key] = r["level"].strip()
        self.stats["levels"] = dict(Counter(lv.values()))

    # ---------------------------------------------------------------- run
    def run(self) -> None:
        t0 = time.time()
        self.load_sources()
        self.separability()
        self.frequencies()
        self.stitch()
        self.retain()
        self.assign_keys()
        self.build_families()
        self.segment()
        self.compounds()
        self.entries()
        self.levels()
        from export import Exporter
        Exporter(self, OUT, REPORTS).write_all()
        log(f"done in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    Build().run()
    sys.exit(0)
