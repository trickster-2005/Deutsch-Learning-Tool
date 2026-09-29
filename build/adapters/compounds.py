"""CompoundSplitter: overrides -> Wiktionary templates -> CharSplit (spec 7.6).

Linking elements (LINK) are detected by comparing a modifier's lemma with its
surface string inside the compound: Arbeit·s·platz, Straße·n·bahn,
Kind·er·zimmer, Schul·bus (elision), Hühn·er·ei (umlaut + er).
"""
from __future__ import annotations

from typing import Callable

from .base import CompoundAnalysis
from .text import undo_umlaut

LINKS = ("ens", "ns", "es", "en", "er", "s", "n", "e")


def detect_link(lemma: str, surface: str) -> tuple[str, bool, bool] | None:
    """Return (link, elision, umlaut) or None if `surface` cannot come from `lemma`."""
    l, s = lemma.lower(), surface.lower()
    if s == l:
        return "", False, False
    if s.startswith(l) and s[len(l):] in LINKS:
        return s[len(l):], False, False
    if lemma[:1].islower() and l.endswith("en") and s == l[:-2] and len(s) >= 3:
        return "", False, False  # verb stem as modifier: Fahr·rad, Wohn·zimmer
    if lemma[:1].islower() and l.endswith(("eln", "ern")) and s == l[:-1]:
        return "", False, False
    if l.endswith("e") and s == l[:-1]:
        return "", True, False
    if l.endswith("e") and s.startswith(l[:-1]) and s[len(l) - 1:] in LINKS:
        # Schule -> Schul+... handled above; Sprache -> Sprachen is plain 'n'
        return s[len(l) - 1:], True, False
    ul, us = undo_umlaut(l), undo_umlaut(s)
    if us != s and us.startswith(ul) and s[len(l):] in ("er", "e"):
        return s[len(l):], False, True
    return None


class CompoundAnalyser:
    def __init__(self, lookup: Callable[[str], str | None], splitter=None,
                 min_score: float = 0.5, min_modifier_len: int = 3):
        """lookup(word) -> canonical lemma spelling if the word is a known lemma
        (initial-letter case is ignored), else None."""
        self.lookup = lookup
        self.splitter = splitter
        self.min_score = min_score
        self.min_mod = min_modifier_len
        self.rejects: list[tuple[str, str, str]] = []

    # ------------------------------------------------------------ helpers
    def _resolve_modifier(self, surface: str) -> tuple[str, str, bool, bool] | None:
        """surface ('Arbeits') -> (lemma, link, elision, umlaut)."""
        cands = [surface]
        low = surface.lower()
        for link in LINKS:
            if low.endswith(link) and len(low) - len(link) >= 2:
                cands.append(surface[:-len(link)])
        cands.append(surface + "e")
        cands += [surface.lower() + "en", surface.lower() + "n"]  # verb stems
        for link in LINKS:
            if low.endswith(link) and len(low) - len(link) >= 2:
                cands.append(surface[:-len(link)] + "e")
        for c in cands:
            for variant in (c, undo_umlaut(c)):
                lem = self.lookup(variant)
                if lem:
                    d = detect_link(lem, surface)
                    if d is not None:
                        return lem, d[0], d[1], d[2]
        return None

    def _build(self, parts: list[str], surfaces: list[str], source: str, conf: float
               ) -> CompoundAnalysis | None:
        links, elision, uml = [], [], []
        for lem, surf in zip(parts[:-1], surfaces[:-1]):
            d = detect_link(lem, surf)
            if d is None:
                return None
            links.append(d[0])
            elision.append(d[1])
            uml.append(d[2])
        return CompoundAnalysis(parts, surfaces, links, elision, uml, source, conf)

    def _surfaces_for(self, word: str, parts: list[str]) -> list[str] | None:
        """Locate each part lemma in the compound string (allowing links/elision)."""
        low = word.lower()
        surfaces, cur = [], 0
        for i, p in enumerate(parts):
            pl = p.lower()
            if i == len(parts) - 1:
                rest = word[cur:]
                if rest.lower() == pl or undo_umlaut(rest.lower()) == undo_umlaut(pl):
                    surfaces.append(rest)
                    return surfaces
                return None
            found = None
            for cand_len in range(len(pl) + 3, len(pl) - 2, -1):
                s = word[cur:cur + cand_len]
                if not s or cur + cand_len >= len(word):
                    continue
                if detect_link(p, s) is not None:
                    # the rest must still be able to hold the remaining parts
                    found = s
                    nxt = parts[i + 1].lower()
                    if low[cur + cand_len:].startswith(nxt[:2]) or \
                            undo_umlaut(low[cur + cand_len:]).startswith(undo_umlaut(nxt[:2])):
                        break
            if not found:
                return None
            surfaces.append(found)
            cur += len(found)
        return None

    # ---------------------------------------------------------------- API
    def from_parts(self, word: str, parts: list[str], source: str, conf: float
                   ) -> CompoundAnalysis | None:
        resolved = []
        for p in parts:
            lem = self.lookup(p) or p
            resolved.append(lem)
        surfaces = self._surfaces_for(word, resolved)
        if not surfaces:
            return None
        return self._build(resolved, surfaces, source, conf)

    def from_etymology(self, word: str, ety: tuple) -> CompoundAnalysis | None:
        for name, parts in ety:
            if name in ("compound", "com", "com+"):
                content = [p for p in parts if not p.startswith("-") and not p.endswith("-")]
                if len(content) >= 2:
                    a = self.from_parts(word, content, "wiktionary-etymology", 0.95)
                    if a:
                        return a
            elif name in ("af", "affix"):
                content = [p for p in parts if not p.startswith("-") and not p.endswith("-")]
                if len(content) >= 2:
                    a = self.from_parts(word, content, "wiktionary-etymology", 0.95)
                    if a:
                        return a
        return None

    def from_charsplit(self, word: str, depth: int = 0) -> CompoundAnalysis | None:
        if self.splitter is None or len(word) < 6:
            return None
        try:
            cands = self.splitter.split_compound(word)
        except Exception:  # noqa: BLE001
            return None
        if not cands:
            return None
        score, mod, head = cands[0]
        if score < self.min_score:
            self.rejects.append((word, f"{mod}+{head}", f"score {score:.2f} < {self.min_score}"))
            return None
        # CharSplit capitalises the head; restore the compound's own casing
        head_surface = word[len(word) - len(head):]
        head_lemma = self.lookup(head_surface) or self.lookup(head)
        if not head_lemma:
            self.rejects.append((word, f"{mod}+{head}", "head not in lexicon"))
            return None
        mod_surface = word[:len(word) - len(head)]
        r = self._resolve_modifier(mod_surface)
        if r is None:
            # try splitting the modifier once more (max three parts)
            if depth == 0:
                inner = self.from_charsplit(mod_surface, depth=1)
                if inner is not None and len(inner.parts) == 2:
                    return CompoundAnalysis(inner.parts + [head_lemma],
                                            inner.surfaces + [head_surface],
                                            inner.links + [""], inner.elision + [False],
                                            inner.umlaut + [False], "charsplit", round(score, 2))
            self.rejects.append((word, f"{mod}+{head}", "modifier not in lexicon"))
            return None
        lem, link, elided, uml = r
        if len(lem) < self.min_mod:
            self.rejects.append((word, f"{mod}+{head}", "modifier shorter than 3"))
            return None
        if lem.lower() == word.lower() or head_lemma.lower() == word.lower():
            return None
        parts, surfaces = [lem, head_lemma], [mod_surface, head_surface]
        links, elision, umlaut = [link], [elided], [uml]
        if depth == 0:
            # recursive split of the modifier, once
            inner = self.from_charsplit(lem, depth=1)
            if inner is not None and len(inner.parts) == 2 and not link:
                s0 = inner.surfaces[0]
                parts = inner.parts + [head_lemma]
                surfaces = [s0, mod_surface[len(s0):], head_surface]
                links = inner.links + [link]
                elision = inner.elision + [elided]
                umlaut = inner.umlaut + [uml]
        return CompoundAnalysis(parts, surfaces, links, elision, umlaut, "charsplit",
                                round(min(1.0, score), 2))
