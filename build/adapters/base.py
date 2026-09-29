"""Shared data types and provider interfaces (spec section 5).

Every adapter output carries `source` and `confidence` (0-1; curated data 1.0).
Priority: curated > human-edited data (Wiktionary) > rules > models.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Iterable, Literal, Protocol

MorphType = Literal["PREF_SEP", "PREF", "ROOT", "SUFF", "END", "LINK"]


@dataclass
class Morpheme:
    text: str
    type: MorphType


@dataclass
class Segmentation:
    parts: list[list[Morpheme]]  # compounds have several parts; others exactly one
    source: str
    confidence: float
    uncertain: bool = False

    def to_json(self) -> dict:
        return {
            "parts": [[asdict(m) for m in part] for part in self.parts],
            "source": self.source,
            "confidence": round(self.confidence, 2),
            "uncertain": self.uncertain,
        }


@dataclass
class DerivNode:
    """One lemma in a derivation forest."""
    key: tuple[str, str]  # (lemma, POS)
    lemma: str
    pos: str
    gender: str | None = None
    parent: tuple[str, str] | None = None
    rule: str | None = None       # DErivBase rule id (debug/report only)
    source: str = "derivbase"
    confidence: float = 1.0
    alt_parents: list[tuple[str, str]] = field(default_factory=list)


@dataclass
class CompoundAnalysis:
    parts: list[str]              # part lemmas, head last
    surfaces: list[str]           # surface strings as they appear in the compound
    links: list[str]              # linking element after each non-head part ("" if none)
    elision: list[bool]           # final -e dropped on each non-head part
    umlaut: list[bool]
    source: str
    confidence: float


class FamilyProvider(Protocol):
    def load(self) -> dict[tuple[str, str], DerivNode]: ...


class LexiconProvider(Protocol):
    def entries(self) -> Iterable[dict]: ...


class CompoundSplitter(Protocol):
    def analyse(self, lemma: str, pos: str) -> CompoundAnalysis | None: ...


class Segmenter(Protocol):
    def segment(self, lemma: str, pos: str) -> Segmentation: ...


class FrequencyProvider(Protocol):
    def zipf(self, forms: Iterable[str]) -> float: ...


class LevelProvider(Protocol):
    def levels(self) -> dict[str, str]: ...


class TopicProvider(Protocol):
    def topics(self, categories: Iterable[str]) -> list[str]: ...
