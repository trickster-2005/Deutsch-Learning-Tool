"""FamilyProvider for DErivBase in Universal Derivations (UDer 1.1) format.

Columns follow the DeriNet 2.0 convention. They are auto-detected from the
first 200 lines and reported so pipeline.py can log them in DECISIONS.md.
"""
from __future__ import annotations

import gzip
import json
import re
from pathlib import Path

from .base import DerivNode

STANDARD_COLUMNS = ["ID", "LEMID", "LEMMA", "POS", "FEATS", "SEGMENTATION",
                    "PARENTID", "RELTYPE", "OTHERPARENTS", "MISC"]
POS_VALUES = {"NOUN", "VERB", "ADJ", "ADV", "PROPN", "X"}
GENDER_MAP = {"Masc": "masc", "Fem": "femn", "Neut": "neut"}

_ID = re.compile(r"^\d+\.\d+$")


def detect_columns(lines: list[list[str]]) -> dict[str, int]:
    """Guess column roles from content; fall back to the DeriNet 2.0 order."""
    ncols = max(len(r) for r in lines)
    votes: dict[str, dict[int, int]] = {}

    def vote(name: str, i: int) -> None:
        votes.setdefault(name, {}).setdefault(i, 0)
        votes[name][i] += 1

    for row in lines:
        for i, v in enumerate(row):
            if not v:
                continue
            if _ID.match(v):
                vote("ID" if i == 0 else "PARENTID", i)
            elif "#" in v and i < 3:
                vote("LEMID", i)
            elif v in POS_VALUES:
                vote("POS", i)
            elif v.startswith("Gender=") or re.match(r"^\w+=\w+(\|\w+=\w+)*$", v) and "Rule" not in v:
                vote("FEATS", i)
            elif v.startswith("Rule=") or "Type=" in v:
                vote("RELTYPE", i)
            elif v.startswith("{"):
                vote("MISC", i)
    cols = {name: max(c, key=c.get) for name, c in votes.items()}
    if "LEMID" in cols:
        cols.setdefault("LEMMA", cols["LEMID"] + 1)
    for i, name in enumerate(STANDARD_COLUMNS):
        if i < ncols:
            cols.setdefault(name, i)
    return cols


def load_rule_descriptions(path: Path) -> dict[str, str]:
    """Map rule id (e.g. dVV14) -> the example comment above its definition."""
    out: dict[str, str] = {}
    if not path.exists():
        return out
    comments: list[str] = []
    for line in path.read_text("utf-8", errors="replace").splitlines():
        s = line.strip()
        if s.startswith("--") and "->" in s:
            comments.append(s.lstrip("- ").strip())
            continue
        m = re.match(r"^(d[A-Z]{2}\d+)\s*=", s)
        if m:
            out[m.group(1)] = " ".join(comments)[:200]
            comments = []
        elif s and not s.startswith("--") and not line.startswith(" "):
            comments = []
    return out


def rule_description(rule: str | None, table: dict[str, str]) -> str | None:
    if not rule:
        return None
    return table.get(rule) or table.get(rule.split(".")[0])


class DErivBaseProvider:
    def __init__(self, folder: Path):
        self.folder = folder
        self.tsv = next(folder.glob("*.tsv.gz"), None)
        rules = next(folder.glob("*-rules.txt"), None)
        self.rules = load_rule_descriptions(rules) if rules else {}
        self.columns: dict[str, int] = {}
        self.stats: dict[str, int] = {}

    def available(self) -> bool:
        return self.tsv is not None

    def _rows(self):
        with gzip.open(self.tsv, "rt", encoding="utf-8") as f:
            for line in f:
                line = line.rstrip("\n")
                if not line.strip():
                    continue
                yield line.split("\t")

    def load(self) -> tuple[dict[tuple[str, str], DerivNode], dict[str, list[tuple[str, str]]]]:
        """Return (nodes by (lemma, POS), trees: tree id -> member keys).

        Duplicate (lemma, POS) rows are merged into the first occurrence;
        children of a duplicate are re-attached to the kept node.
        """
        head = []
        for row in self._rows():
            head.append(row)
            if len(head) >= 200:
                break
        c = self.columns = detect_columns(head)

        id_to_key: dict[str, tuple[str, str]] = {}
        raw: list[tuple[str, tuple[str, str], str | None, str | None, str | None, dict]] = []
        nodes: dict[tuple[str, str], DerivNode] = {}
        trees: dict[str, list[tuple[str, str]]] = {}
        dup = 0
        for row in self._rows():
            row += [""] * (10 - len(row))
            rid = row[c["ID"]]
            lemma = row[c["LEMMA"]]
            pos = row[c["POS"]]
            feats = row[c["FEATS"]]
            parent_id = row[c["PARENTID"]] or None
            rel = row[c["RELTYPE"]]
            misc = row[c["MISC"]]
            rule = None
            m = re.search(r"Rule=([\w.]+)", rel)
            if m:
                rule = m.group(1)
            gender = None
            m = re.search(r"Gender=(\w+)", feats)
            if m:
                gender = GENDER_MAP.get(m.group(1))
            try:
                js = json.loads(misc) if misc.startswith("{") else {}
            except json.JSONDecodeError:
                js = {}
            key = (lemma, pos)
            if key in nodes:
                dup += 1
                if gender and not nodes[key].gender:
                    nodes[key].gender = gender
            else:
                nodes[key] = DerivNode(key=key, lemma=lemma, pos=pos, gender=gender, rule=rule)
                trees.setdefault(rid.split(".")[0], []).append(key)
            id_to_key[rid] = key
            raw.append((rid, key, parent_id, rule, None, js))

        for rid, key, parent_id, rule, _, js in raw:
            node = nodes[key]
            if parent_id and parent_id in id_to_key:
                pkey = id_to_key[parent_id]
                if pkey != key and node.parent is None and not _is_ancestor(nodes, key, pkey):
                    node.parent = pkey
                    node.rule = rule
            for alt in str(js.get("other_parents", "")).split("|"):
                if not alt:
                    continue
                aid = alt.split("&")[0]
                if aid in id_to_key and id_to_key[aid] != key:
                    node.alt_parents.append(id_to_key[aid])
        self.stats = {"rows": len(raw), "lemmas": len(nodes), "duplicate_rows_merged": dup,
                      "trees": len(trees)}
        return nodes, trees


def _is_ancestor(nodes: dict, anc: tuple[str, str], key: tuple[str, str]) -> bool:
    """True if `anc` is `key` or an ancestor of `key`."""
    seen = set()
    cur: tuple[str, str] | None = key
    while cur is not None and cur not in seen:
        if cur == anc:
            return True
        seen.add(cur)
        cur = nodes[cur].parent if cur in nodes else None
    return False
