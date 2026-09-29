"""Small text helpers shared by adapters and export (normalisation, umlauts)."""
from __future__ import annotations

import re

UMLAUT_UNDO = str.maketrans({"ä": "a", "ö": "o", "ü": "u", "Ä": "A", "Ö": "O", "Ü": "U"})
VOWELS = set("aeiouäöüyAEIOUÄÖÜY")
_WS = re.compile(r"\s+")


def norm_form(s: str) -> str:
    """Search key: lowercase, ß -> ss, trim, collapse whitespace (spec 11.3)."""
    return _WS.sub(" ", s.strip().lower().replace("ß", "ss"))


def fold_umlauts(s: str) -> str:
    """Additional folding for 'did you mean' keys: ä ö ü -> a o u."""
    return norm_form(s).translate(UMLAUT_UNDO)


def undo_umlaut(s: str) -> str:
    """äu -> au is covered because ä -> a."""
    return s.translate(UMLAUT_UNDO)


def has_umlaut(s: str) -> bool:
    return any(c in "äöüÄÖÜ" for c in s)


def consonant_skeleton(s: str) -> str:
    return "".join(c for c in s.lower() if c not in VOWELS)


def shard_key(lemma_key: str, n: int = 2) -> str:
    """Shard files by the first n letters of the normalised, umlaut-folded key."""
    k = fold_umlauts(lemma_key.split("#")[0])
    k = re.sub(r"[^a-z]", "_", k)
    return (k + "__")[:n]
