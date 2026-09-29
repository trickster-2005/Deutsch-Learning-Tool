"""FrequencyProvider backed by wordfreq (spec 7.3).

Lemma frequency = sum of the linear frequencies of all its (single-token)
inflected forms, converted back to Zipf. Separable verbs are multiplied by
`separable_boost` because their split forms ("steht ... auf") cannot be counted.
"""
from __future__ import annotations

import math
from functools import lru_cache
from typing import Iterable

from wordfreq import word_frequency


@lru_cache(maxsize=None)
def _wf(token: str) -> float:
    return word_frequency(token, "de")


def to_zipf(freq: float) -> float:
    return max(0.0, round(math.log10(freq * 1e9), 2)) if freq > 0 else 0.0


def countable(form: str) -> bool:
    """Single plain tokens only: wordfreq splits 'Ex-Freund' into two tokens
    and returns a combined estimate that is not the word's own frequency."""
    f = form.strip()
    return bool(f) and " " not in f and "-" not in f and "'" not in f and not any(c.isdigit() for c in f)


def summed_frequency(forms: Iterable[str]) -> float:
    seen = {f.lower() for f in forms if countable(f)}
    return sum(_wf(f) for f in seen)


def lemma_zipf(forms: Iterable[str], separable: bool = False, boost: float = 2.5) -> float:
    f = summed_frequency(forms)
    if separable:
        f *= boost
    return to_zipf(f)


def allocate(lemma_forms: dict, separable: dict, boost: float = 2.5) -> dict:
    """Zipf per lemma when several lemmas claim the same (lowercased) form.

    wordfreq is case-insensitive, so 'haus' (imperative of hausen) is the same
    token as 'Haus'. A shared form's frequency is split between its claimants
    in proportion to each claimant's weight = frequency of its own citation
    form + the frequency of the forms only it claims. (Pure 'unambiguous mass'
    fails when an obsolete spelling such as Hauß duplicates every form of Haus.)
    """
    claims: dict[str, list] = {}
    low_forms = {}
    for key, forms in lemma_forms.items():
        fs = {f.lower() for f in forms if countable(f)}
        low_forms[key] = fs
        for f in fs:
            claims.setdefault(f, []).append(key)
    unique = {}
    for key, fs in low_forms.items():
        cit = key[0].lower()
        unique[key] = sum(_wf(f) for f in fs if len(claims[f]) == 1) +             (_wf(cit) if countable(cit) else 0.0) + 1e-12
    out = {}
    for key, fs in low_forms.items():
        total = 0.0
        for f in fs:
            cl = claims[f]
            if len(cl) == 1:
                total += _wf(f)
                continue
            total += _wf(f) * unique[key] / sum(unique[c] for c in cl)
        if separable.get(key):
            total *= boost
        out[key] = to_zipf(total)
    return out


def stars(zipf: float, thresholds: dict) -> int:
    for n in (5, 4, 3, 2):
        if zipf >= float(thresholds[n]):
            return n
    return 1
