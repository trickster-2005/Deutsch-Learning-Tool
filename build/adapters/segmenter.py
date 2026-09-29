"""Segmenter: derive morpheme segmentation along derivation paths (spec 7.5).

German has no good open morpheme segmentation model, so each child is matched
against its parent's stem:  child = PREFIX* + stem' + SUFFIX* + END?
with stem' equal to the parent stem exactly, with final -e elided, with
umlaut, or with ablaut (same consonant skeleton).
"""
from __future__ import annotations

from dataclasses import dataclass, field

from .base import Morpheme, Segmentation
from .text import consonant_skeleton, undo_umlaut

LINK_ELEMENTS = ("ens", "ns", "es", "en", "er", "s", "n", "e")


def split_verb_ending(word: str) -> tuple[str, str]:
    """Root-verb rule (a): lächeln -> lächel+n, wandern -> wander+n, gehen -> geh+en, tun -> tu+n."""
    w = word
    if w.endswith("eln") or w.endswith("ern"):
        return w[:-1], "n"
    if w.endswith("en") and len(w) > 3:
        return w[:-2], "en"
    if w.endswith("n") and len(w) > 2:
        return w[:-1], "n"
    return w, ""


@dataclass
class AffixInventory:
    prefixes: dict[str, str]            # surface -> canonical ("emp" -> "ent-")
    prefix_kind: dict[str, str]         # canonical -> separable|inseparable|dual|nominal
    suffixes: dict[str, str]            # surface -> canonical ("igkeit" -> "-keit")
    suffix_info: dict[str, list[dict]]  # canonical -> table rows
    separable: set[str] = field(default_factory=set)
    inseparable: set[str] = field(default_factory=set)
    dual: set[str] = field(default_factory=set)

    @classmethod
    def from_yaml(cls, affixes: dict, particles: dict) -> "AffixInventory":
        prefixes, kind, suffixes, sinfo = {}, {}, {}, {}
        for row in affixes.get("prefixes", []):
            canon = row["affix"]
            kind[canon] = row.get("kind", "nominal")
            for var in row.get("variants", [canon]):
                prefixes[var.strip("-")] = canon
        # particles.yaml adds prefixes without meaning rows (e.g. dar-, empor-, herein-)
        for k, lst in (("separable", particles.get("separable", [])),
                       ("inseparable", particles.get("inseparable", [])),
                       ("dual", particles.get("dual", []))):
            for p in lst:
                canon = p + "-"
                if p not in prefixes:
                    prefixes[p] = canon
                kind.setdefault(canon, k)
        for row in affixes.get("suffixes", []):
            canon = row["affix"]
            sinfo.setdefault(canon, []).append(row)
            for var in row.get("variants", [canon]):
                suffixes[var.strip("-")] = canon
        return cls(prefixes, kind, suffixes, sinfo,
                   set(particles.get("separable", [])), set(particles.get("inseparable", [])),
                   set(particles.get("dual", [])))

    def suffix_allowed(self, canon: str, parent_pos: str, child_pos: str) -> bool:
        rows = self.suffix_info.get(canon, [])
        for r in rows:
            inp = r.get("input_pos")
            inp = inp if isinstance(inp, list) else [inp]
            if canon == "-en" and not (parent_pos == "NOUN" and child_pos == "ADJ"):
                continue  # adjective -en only for NOUN>ADJ (spec 9.2 note)
            if r.get("output_pos") == child_pos or child_pos in inp or r.get("output_pos") is None:
                return True
        return False


@dataclass
class Match:
    prefixes: list[str]      # surfaces
    suffixes: list[str]      # surfaces
    stem: str                # stem' as it appears in the child
    end: str
    change: str | None       # None | "elision" | "umlaut" | "ablaut"
    confidence: float


def stem_relation(middle: str, parent_stem: str) -> str | None | bool:
    """Return False if unrelated, else the change type (None = identical)."""
    m, p = middle.lower(), parent_stem.lower()
    if not m:
        return False
    if m == p:
        return None
    if p.endswith("e") and m == p[:-1]:
        return "elision"
    if undo_umlaut(m) == undo_umlaut(p):
        return "umlaut"
    if p.endswith("e") and undo_umlaut(m) == undo_umlaut(p[:-1]):
        return "umlaut"
    if len(p) > 3 and p[-2] == "e" and p[-1] in "nlr":
        q = p[:-2] + p[-1]  # unstressed e drops: offen -> öffn(en), trocken -> trockn(en)
        if m == q:
            return "elision"
        if undo_umlaut(m) == undo_umlaut(q):
            return "umlaut"
    sk_m, sk_p = consonant_skeleton(m), consonant_skeleton(p)
    if sk_m and sk_m == sk_p and abs(len(m) - len(p)) <= 2 and len(p) >= 3:
        return "ablaut"
    return False


CHANGE_CONF = {None: 1.0, "elision": 1.0, "umlaut": 0.9, "ablaut": 0.8}


class PathSegmenter:
    def __init__(self, inv: AffixInventory):
        self.inv = inv
        self._pref = sorted(inv.prefixes, key=len, reverse=True)
        self._suff = sorted(inv.suffixes, key=len, reverse=True)

    # ---------------------------------------------------------------- roots
    def root(self, lemma: str, pos: str) -> Segmentation:
        if pos == "VERB":
            stem, end = split_verb_ending(lemma)
            parts = [Morpheme(stem, "ROOT")] + ([Morpheme(end, "END")] if end else [])
            return Segmentation([parts], "root-rule", 1.0)
        return Segmentation([[Morpheme(lemma, "ROOT")]], "root-rule", 1.0)

    # --------------------------------------------------------------- matching
    def _prefix_seqs(self, s: str):
        low = s.lower()
        yield []
        for p in self._pref:
            if low.startswith(p) and len(low) > len(p) + 1:
                yield [s[:len(p)]]
                rest = low[len(p):]
                for q in self._pref:
                    if rest.startswith(q) and len(rest) > len(q) + 1:
                        yield [s[:len(p)], s[len(p):len(p) + len(q)]]

    def _suffix_seqs(self, s: str, child_is_verb: bool):
        low = s.lower()
        yield []
        cands = []
        for suf in self._suff:
            surf = suf
            if child_is_verb and surf.endswith("en") and len(surf) > 2:
                surf = surf[:-2]  # -ieren on a verb stem whose END was stripped
            cands.append((surf, suf))
        for surf, _canon in cands:
            if low.endswith(surf) and len(low) > len(surf) + 1:
                yield [s[len(s) - len(surf):]]
                rest = low[:-len(surf)]
                for surf2, _c2 in cands:
                    if rest.endswith(surf2) and len(rest) > len(surf2) + 1:
                        yield [s[len(s) - len(surf) - len(surf2):len(s) - len(surf)], s[len(s) - len(surf):]]

    def canon_suffix(self, surface: str, child_is_verb: bool) -> str | None:
        low = surface.lower()
        if low in self.inv.suffixes:
            return self.inv.suffixes[low]
        if child_is_verb and (low + "en") in self.inv.suffixes:
            return self.inv.suffixes[low + "en"]
        return None

    def match(self, child: str, child_pos: str, parent: str, parent_pos: str,
              parent_stem: str) -> Match | None:
        is_verb = child_pos == "VERB"
        if is_verb:
            body, end = split_verb_ending(child)
        elif child_pos == "NOUN" and parent_pos == "ADJ" and child.lower().endswith("e") \
                and child.lower()[:-1] == parent.lower():
            body, end = child[:-1], "e"  # nominalized adjective: das Gute
        else:
            body, end = child, ""
        best: Match | None = None
        for pre in self._prefix_seqs(body):
            plen = sum(len(p) for p in pre)
            rest = body[plen:]
            for suf in self._suffix_seqs(rest, is_verb):
                ok = True
                for s in suf:
                    canon = self.canon_suffix(s, is_verb)
                    if not canon or not self.inv.suffix_allowed(canon, parent_pos, child_pos):
                        ok = False
                        break
                if not ok:
                    continue
                slen = sum(len(s) for s in suf)
                middle = rest[:len(rest) - slen] if slen else rest
                rel = stem_relation(middle, parent_stem)
                if rel is False:
                    continue
                conf = CHANGE_CONF[rel]
                m = Match(pre, suf, middle, end, rel, conf)
                score = (conf, -len(pre) - len(suf))
                if best is None or score > (best.confidence, -len(best.prefixes) - len(best.suffixes)):
                    best = m
                if conf == 1.0 and not pre and not suf:
                    return best
        return best

    # ---------------------------------------------------------- composition
    def child_segmentation(self, m: Match, parent_seg: Segmentation, child_pos: str,
                           sep_prefix: str | None, prefix_type: str | None) -> Segmentation:
        morphs: list[Morpheme] = []
        for p in m.prefixes:
            morphs.append(Morpheme(p, self.prefix_type_for(p, child_pos, sep_prefix, prefix_type)))
        morphs += self._inherit_stem(parent_seg, m.stem, m.change)
        for s in m.suffixes:
            morphs.append(Morpheme(s, "SUFF"))
        if m.end:
            morphs.append(Morpheme(m.end, "END"))
        return Segmentation([morphs], "derivation-path", m.confidence, m.confidence < 0.8)

    def prefix_type_for(self, surface: str, child_pos: str, sep_prefix: str | None,
                        prefix_type: str | None) -> str:
        low = surface.lower()
        if child_pos == "VERB":
            if sep_prefix and low == sep_prefix.lower() and prefix_type == "separable":
                return "PREF_SEP"
            if low in self.inv.separable and prefix_type != "inseparable":
                return "PREF_SEP"
        return "PREF"

    @staticmethod
    def _inherit_stem(parent_seg: Segmentation, stem: str, change: str | None) -> list[Morpheme]:
        """Reuse the parent's (non-END) morphemes for the stem, re-cut on the child string."""
        pm = [x for x in parent_seg.parts[-1] if x.type != "END"] if len(parent_seg.parts) == 1 else []
        if not pm:
            return [Morpheme(stem, "ROOT")]
        total = sum(len(x.text) for x in pm)
        if change == "elision" and total == len(stem) + 1:
            out, pos = [], 0
            for i, x in enumerate(pm):
                n = len(x.text) - (1 if i == len(pm) - 1 else 0)
                if n > 0:
                    out.append(Morpheme(stem[pos:pos + n], x.type))
                pos += n
            return out
        if total == len(stem):
            out, pos = [], 0
            for x in pm:
                out.append(Morpheme(stem[pos:pos + len(x.text)], x.type))
                pos += len(x.text)
            return out
        # ablaut changed the length: keep leading prefixes, the rest is ROOT
        out, pos = [], 0
        for x in pm:
            if x.type in ("PREF", "PREF_SEP") and stem.lower()[pos:].startswith(x.text.lower()):
                out.append(Morpheme(stem[pos:pos + len(x.text)], x.type))
                pos += len(x.text)
            else:
                break
        out.append(Morpheme(stem[pos:], "ROOT"))
        return out

    # --------------------------------------------------------- wiktionary
    def from_etymology(self, lemma: str, pos: str, ety: tuple, sep_prefix: str | None,
                       prefix_type: str | None) -> Segmentation | None:
        """Fallback: {{af|de|auf-|stehen}}, {{suffix|de|wohnen|ung}} ..."""
        for name, parts in ety:
            if name not in ("af", "affix", "prefix", "suffix", "confix") or len(parts) < 2:
                continue
            pieces: list[tuple[str, str]] = []
            for i, p in enumerate(parts):
                if name == "prefix" and i == 0 or p.endswith("-") and not p.startswith("-"):
                    pieces.append((p.strip("-"), "PREF"))
                elif name == "suffix" and i == len(parts) - 1 or p.startswith("-") and not p.endswith("-"):
                    pieces.append((p.strip("-"), "SUFF"))
                elif p.startswith("-") and p.endswith("-"):
                    pieces.append((p.strip("-"), "LINK"))
                else:
                    base = p
                    if base[:1].islower() and base.endswith("n") and len(base) > 3:
                        base = split_verb_ending(base)[0]  # verb base loses its infinitive ending
                    pieces.append((base, "ROOT"))
            word = lemma
            end = ""
            if pos == "VERB":
                word, end = split_verb_ending(lemma)
            morphs, cur = [], 0
            low = word.lower()
            ok = True
            for text, typ in pieces:
                t = text.lower()
                if low.startswith(t, cur):
                    seg = word[cur:cur + len(t)]
                elif typ == "ROOT" and t.endswith("e") and low.startswith(t[:-1], cur):
                    seg = word[cur:cur + len(t) - 1]
                elif typ == "ROOT" and undo_umlaut(low[cur:cur + len(t)]) == undo_umlaut(t):
                    seg = word[cur:cur + len(t)]
                else:
                    ok = False
                    break
                if typ == "PREF":
                    typ = self.prefix_type_for(seg, pos, sep_prefix, prefix_type)
                morphs.append(Morpheme(seg, typ))
                cur += len(seg)
            if not ok:
                continue
            if cur < len(word):
                rest = word[cur:]
                if pos == "VERB" and morphs and morphs[-1].type == "ROOT":
                    morphs[-1] = Morpheme(morphs[-1].text + rest, "ROOT")
                else:
                    continue
            if end:
                morphs.append(Morpheme(end, "END"))
            if sum(1 for m in morphs if m.type == "ROOT") < 1:
                continue
            return Segmentation([morphs], "wiktionary-etymology", 0.9)
        return None

    @staticmethod
    def failed(lemma: str, pos: str) -> Segmentation:
        if pos == "VERB":
            stem, end = split_verb_ending(lemma)
            parts = [Morpheme(stem, "ROOT")] + ([Morpheme(end, "END")] if end else [])
        else:
            parts = [Morpheme(lemma, "ROOT")]
        return Segmentation([parts], "none", 0.3, True)
