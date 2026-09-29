"""Forest repair on top of DErivBase (see DECISIONS.md, "Tree stitching").

The UDer harmonisation splits many DErivBase families into small trees
(e.g. `Aufstehen -> aufstehen` is separate from `stehen`). These rule-based
passes reconnect them. Every pass only attaches a tree *root* (after an
optional re-rooting) below a node of a different tree, so cycles cannot occur.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Callable

from .base import DerivNode
from .segmenter import split_verb_ending
from .text import undo_umlaut

Key = tuple[str, str]


class Forest:
    def __init__(self, nodes: dict[Key, DerivNode]):
        self.nodes = nodes
        self.log: dict[str, int] = defaultdict(int)
        self.examples: dict[str, list[str]] = defaultdict(list)

    def root_of(self, k: Key) -> Key:
        seen = set()
        while self.nodes[k].parent is not None and k not in seen:
            seen.add(k)
            k = self.nodes[k].parent
        return k

    def children(self) -> dict[Key, list[Key]]:
        ch: dict[Key, list[Key]] = defaultdict(list)
        for k, n in self.nodes.items():
            if n.parent is not None:
                ch[n.parent].append(k)
        return ch

    def reroot(self, k: Key) -> None:
        """Make k the root of its tree by reversing the path to the old root."""
        path = [k]
        while self.nodes[path[-1]].parent is not None:
            path.append(self.nodes[path[-1]].parent)
        # reverse: parent of path[i+1] becomes path[i]
        rules = [self.nodes[x].rule for x in path]
        self.nodes[k].parent = None
        self.nodes[k].rule = None
        for i in range(len(path) - 1):
            self.nodes[path[i + 1]].parent = path[i]
            self.nodes[path[i + 1]].rule = f"reversed:{rules[i]}" if rules[i] else "reversed"

    def attach(self, child: Key, parent: Key, reason: str) -> bool:
        if self.root_of(parent) == self.root_of(child):
            return False
        if self.nodes[child].parent is not None:
            self.reroot(child)
        self.nodes[child].parent = parent
        self.nodes[child].rule = f"stitch:{reason}"
        self.nodes[child].source = f"stitch-{reason}"
        self.log[reason] += 1
        if len(self.examples[reason]) < 15:
            self.examples[reason].append(f"{parent[0]} -> {child[0]}")
        return True

    def depth(self, k: Key) -> int:
        d = 0
        while self.nodes[k].parent is not None:
            k = self.nodes[k].parent
            d += 1
        return d


def cap(s: str) -> str:
    return s[:1].upper() + s[1:]


def reorient_nominalized_infinitives(f: Forest) -> None:
    """DErivBase often roots a tree at the noun (Aufstehen -> aufstehen).
    Make the verb the parent of its nominalized infinitive."""
    for k, n in list(f.nodes.items()):
        if n.pos != "VERB" or n.parent is None:
            continue
        p = f.nodes[n.parent]
        if p.pos == "NOUN" and p.lemma == cap(n.lemma):
            grand = p.parent
            n.parent = grand
            n.rule = p.rule
            p.parent = k
            p.rule = "reoriented:nominalized_infinitive"
            f.log["reorient_infinitive"] += 1


def stitch_prefixed(f: Forest, prefixes: list[str], nominal_prefixes: list[str],
                    zipf: Callable[[Key], float]) -> None:
    """aufstehen (own tree) -> child of stehen; Unglück -> child of Glück."""
    verbs = {k[0]: k for k in f.nodes if k[1] == "VERB"}
    pref = sorted(prefixes, key=len, reverse=True)
    # members of each tree, shallowest first
    by_root: dict[Key, list[Key]] = defaultdict(list)
    for k in f.nodes:
        by_root[f.root_of(k)].append(k)
    for root, members in by_root.items():
        best = None
        for k in sorted(members, key=lambda x: (f.depth(x), -zipf(x))):
            if k[1] != "VERB":
                continue
            for p in pref:
                if k[0].startswith(p) and len(k[0]) - len(p) >= 3:
                    base = verbs.get(k[0][len(p):])
                    if base and f.root_of(base) != root:
                        best = (k, base)
                        break
            if best:
                break
        if best:
            f.attach(best[0], best[1], "prefix")
    # nouns / adjectives with un-, ur-, miss- (roots only)
    lemmas = {(k[0], k[1]): k for k in f.nodes}
    for k, n in list(f.nodes.items()):
        if n.parent is not None or k[1] not in ("NOUN", "ADJ"):
            continue
        low = k[0].lower()
        for p in nominal_prefixes:
            if low.startswith(p) and len(low) - len(p) >= 3:
                rest = k[0][len(p):]
                rest = cap(rest) if k[1] == "NOUN" else rest
                base = lemmas.get((rest, k[1]))
                if base:
                    f.attach(k, base, "nominal-prefix")
                    break


def stitch_etymology(f: Forest, ety_of: Callable[[Key], tuple], lookup: Callable[[str], Key | None]) -> None:
    """Attach remaining roots via Wiktionary {{af}}/{{prefix}}/{{suffix}} templates."""
    for k, n in list(f.nodes.items()):
        if n.parent is not None:
            continue
        for name, parts in ety_of(k):
            if name not in ("af", "affix", "prefix", "suffix", "confix") or len(parts) < 2:
                continue
            content = []
            for i, p in enumerate(parts):
                is_affix = p.endswith("-") or p.startswith("-") or \
                    (name == "prefix" and i == 0) or (name == "suffix" and i == len(parts) - 1) or \
                    (name == "confix" and i in (0, len(parts) - 1))
                if not is_affix:
                    content.append(p)
            if len(content) != 1 or len(content) == len(parts):
                continue
            base = lookup(content[0])
            if base and base != k and f.attach(k, base, "wiktionary-etymology"):
                break


def stitch_conversions(f: Forest, zipf: Callable[[Key], float]) -> None:
    """Lauf <-> laufen (stem noun / denominal verb) and offen -> öffnen."""
    roots = [k for k, n in f.nodes.items() if n.parent is None]
    verb_roots = {undo_umlaut(k[0]): k for k in roots if k[1] == "VERB"}
    for k in roots:
        if f.nodes[k].parent is not None:
            continue
        if k[1] == "NOUN":
            low = undo_umlaut(k[0].lower())
            for v in (low + "en", low + "n"):
                vk = verb_roots.get(v)
                if vk and vk[0].lower().startswith(k[0].lower()[:2]):
                    if zipf(vk) >= zipf(k):
                        f.attach(k, vk, "conversion")
                    else:
                        f.attach(vk, k, "conversion")
                    break
        elif k[1] == "ADJ":
            a = undo_umlaut(k[0].lower())
            cands = {a + "en", a + "n"}
            if len(a) > 3 and a[-2] == "e" and a[-1] in "nlr":
                cands.add(a[:-2] + a[-1] + "en")
                cands.add(a[:-2] + a[-1] + "n")
            for v in cands:
                vk = verb_roots.get(v)
                if vk and f.nodes[vk].parent is None:
                    f.attach(vk, k, "deadjectival")
                    break


def stitch_alt_parents(f: Forest) -> None:
    """Use DErivBase's own other_parents for roots that are still unattached."""
    for k, n in list(f.nodes.items()):
        if n.parent is None and n.alt_parents:
            for a in n.alt_parents:
                if a in f.nodes and f.attach(k, a, "derivbase-other-parent"):
                    break


def detach_compound_edges(f: Forest, prefixes: set[str], is_lemma: Callable[[str], bool]) -> list[Key]:
    """DErivBase occasionally links compounds (Haupthaus <- Haus). Such children
    start with another lemma instead of an affix; cut them into their own tree."""
    cut = []
    for k, n in list(f.nodes.items()):
        if n.parent is None:
            continue
        p = f.nodes[n.parent]
        child, par = k[0].lower(), p.lemma.lower()
        stems = {par}
        if p.pos == "VERB":
            stems.add(split_verb_ending(par)[0])
        for st in stems:
            idx = child.find(st, 1)
            if idx < 3 or not child.endswith(st) and idx + len(st) < len(child) - 4:
                continue
            head = child[:idx]
            if head in prefixes or any(head == a + b for a in prefixes for b in prefixes):
                break
            cands = [head, head[:-1] if head.endswith("s") else None, head + "e",
                     head[:-1] if head.endswith("n") else None]
            if any(c and len(c) >= 3 and is_lemma(c) for c in cands):
                n.parent = None
                n.rule = "detached:compound"
                cut.append(k)
                f.log["detached_compound"] += 1
                if len(f.examples["detached_compound"]) < 15:
                    f.examples["detached_compound"].append(f"{p.lemma} -/-> {k[0]}")
                break
    return cut
