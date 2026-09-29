"""TopicProvider: English Wiktionary categories -> fixed topics (spec 7.9, 9.3)."""
from __future__ import annotations

import re
from typing import Iterable

# Wiktionary maintenance categories that must not produce topics
EXCLUDE = ("terms", "lemmas", "entries", "pages", "with", "derived", "inherited",
           "borrowed", "suffixed", "prefixed", "compound", "words", "requests",
           "links", "forms", "usage", "etymolog", "language", "rhymes", "verbs",
           "nouns", "adjectives", "adverbs", "homophones", "syllable")


class TopicMapper:
    def __init__(self, table: dict):
        self.table = table
        self.patterns = {
            topic: [re.compile(rf"\b{re.escape(k)}", re.I) for k in spec["keywords"]]
            for topic, spec in table.items()
        }

    def topics(self, categories: Iterable[str]) -> list[str]:
        out: list[str] = []
        for cat in categories:
            low = cat.lower()
            if any(x in low for x in EXCLUDE):
                continue
            for topic, pats in self.patterns.items():
                if topic not in out and any(p.search(low) for p in pats):
                    out.append(topic)
        return out
