"""LevelProvider: CEFR levels estimated from frequency rank (spec 10).

There is no freely redistributable German CEFR list, so every level is an
estimate. An optional curated/levels_custom.csv (lemma,pos,level) produces a
separate custom level map that is never committed.
"""
from __future__ import annotations

import csv
from pathlib import Path

LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "beyond"]
RANKED_POS = {"NOUN", "VERB", "ADJ", "ADV"}


def estimate_levels(entries: list[tuple[str, str, float]], cutoffs: dict) -> dict[str, str]:
    """entries: (lemma_key, pos, zipf). Only NOUN/VERB/ADJ/ADV are ranked;
    other POS inherit the level of their rank position too (so function
    words get A1) but do not consume ranks."""
    ranked = sorted((e for e in entries if e[1] in RANKED_POS), key=lambda e: (-e[2], e[0]))
    bounds = [(lvl, int(cutoffs[lvl])) for lvl in LEVELS[:-1]]
    out: dict[str, str] = {}
    zipf_floor: list[tuple[float, str]] = []
    for rank, (key, _pos, z) in enumerate(ranked, start=1):
        lvl = next((l for l, b in bounds if rank <= b), "beyond")
        out[key] = lvl
        zipf_floor.append((z, lvl))
    # non-ranked POS: level of the first ranked lemma with zipf <= theirs
    for key, pos, z in entries:
        if pos in RANKED_POS:
            continue
        lvl = "beyond"
        for zz, l in zipf_floor:
            if zz <= z:
                lvl = l
                break
        out[key] = lvl
    return out


def load_custom(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return [r for r in csv.DictReader(f) if r.get("lemma") and r.get("level")]
