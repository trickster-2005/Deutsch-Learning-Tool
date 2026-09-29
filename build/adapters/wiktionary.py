"""LexiconProvider for Wiktionary (English, German and Chinese editions via wiktextract).

Each edition is streamed once and reduced to compact "variant" records keyed by
(lemma, POS). A lemma may have several variants per edition (homographs,
separable/inseparable pairs such as übersetzen). Merging across editions and
feature derivation happen in `merge_entry`.

Field detection: every feature is looked up by tag / field name first; when
nothing is found the value stays None and is exported as "unknown".
"""
from __future__ import annotations

import json
import pickle
import re
from collections import defaultdict
from pathlib import Path

POS_MAP = {
    "noun": "NOUN", "verb": "VERB", "adj": "ADJ", "adv": "ADV",
    "pron": "OTHER", "prep": "OTHER", "conj": "OTHER", "det": "OTHER",
    "article": "OTHER", "num": "OTHER", "intj": "OTHER", "particle": "OTHER",
    "postp": "OTHER", "prep_phrase": None, "name": None, "phrase": None,
    "proverb": None, "suffix": None, "prefix": None, "affix": None,
    "abbrev": None, "character": None, "symbol": None, "contraction": None,
    "infix": None, "interfix": None, "circumfix": None, "punct": None,
}
# German-edition section titles that are inflected forms, not lemmas
DE_FORM_TITLES = ("Deklinierte Form", "Konjugierte Form", "Partizip", "Komparativ",
                  "Superlativ", "Erweiterter Infinitiv", "Flektierte Form")
BAD_FORM_TAGS = {"table-tags", "inflection-template", "romanization", "auxiliary",
                 "diminutive", "abbreviation", "class", "error-unknown-tag"}
SKIP_SENSE_TAGS = {"obsolete", "archaic", "rare", "dated", "dialectal"}
MODALS = {"dürfen", "können", "mögen", "müssen", "sollen", "wollen"}
PERSON_TAGS = {"first-person", "second-person"}


def _tags(d: dict) -> set[str]:
    return set(d.get("tags") or [])


def _clean_ipa(s: str) -> str:
    return s.strip().strip("[]/").strip()


def _clean_form(s: str) -> str | None:
    s = s.strip().rstrip("!").strip()
    if not s or "<" in s or "{" in s or s in {"-", "—", "–"}:
        return None
    return s


def is_lemma_entry(o: dict, edition: str) -> bool:
    if "form-of" in _tags(o) or "alt-of" in _tags(o):
        return False
    if edition == "de":
        title = o.get("pos_title") or ""
        if any(title.startswith(t) for t in DE_FORM_TITLES):
            return False
    senses = o.get("senses") or []
    if senses and all(("form_of" in s or "form-of" in _tags(s)) for s in senses):
        return False
    # alternative / obsolete / misspelled spellings (Hauß, Strasse) are not lemmas of their own
    if senses and all(("alt_of" in s or _tags(s) & {"alt-of", "misspelling"}) for s in senses):
        return False
    return True


def extract_variant(o: dict, edition: str) -> dict:
    """Reduce one wiktextract entry to the fields we use."""
    forms_all = []
    aux_table: set[str] = set()
    for f in o.get("forms") or []:
        for rt in f.get("raw_tags") or []:
            m = re.match(r"Hilfsverb (haben|sein)$", rt)
            if m:
                aux_table.add(m.group(1))
        form = _clean_form(f.get("form", ""))
        if not form:
            continue
        forms_all.append((form, tuple(sorted(_tags(f))), tuple(f.get("pronouns") or []),
                          f.get("article"), f.get("source")))
    v: dict = {"ed": edition, "forms": forms_all, "aux_table": tuple(sorted(aux_table))}
    head = " ".join(h.get("expansion", "") for h in o.get("head_templates") or [])
    v["head"] = head[:400]
    tags = set(_tags(o))
    for s in o.get("senses") or []:
        tags |= _tags(s)
    v["tags"] = tuple(sorted(tags))
    # IPA
    for snd in o.get("sounds") or []:
        if snd.get("ipa"):
            v["ipa"] = _clean_ipa(snd["ipa"])
            break
    # senses: glosses + examples
    glosses, examples, sense_aux = [], [], []
    cats = set()
    for c in o.get("categories") or []:
        cats.add(c if isinstance(c, str) else c.get("name", ""))
    for s in o.get("senses") or []:
        st = _tags(s)
        for c in s.get("categories") or []:
            cats.add(c if isinstance(c, str) else c.get("name", ""))
        if "form_of" in s or "form-of" in st:
            continue
        for rg in s.get("raw_glosses") or []:
            m = re.search(r"\[auxiliary (haben|sein)(?: or (haben|sein))?\]", rg)
            if m:
                sense_aux.append(tuple(x for x in m.groups() if x))
        gl = s.get("glosses") or s.get("raw_glosses") or []
        if gl:
            glosses.append((gl[-1] if edition == "en" else gl[0], tuple(sorted(st))))
        for ex in s.get("examples") or []:
            tr = ex.get("translation") or ex.get("english")
            txt = ex.get("text")
            if txt and tr and edition == "en":
                examples.append((txt, tr))
    v["glosses"] = glosses[:8]
    v["sense_aux"] = tuple(sense_aux)
    v["examples"] = examples[:6]
    v["cats"] = tuple(sorted(c for c in cats if c))
    ets = []
    for t in o.get("etymology_templates") or []:
        name = t.get("name")
        args = t.get("args") or {}
        if name == "ety" and str(args.get("2", "")).startswith(":"):
            # new-style {{ety|de|:af|auf-|stehen}}
            name = str(args["2"])[1:]
            parts = [args[k] for k in sorted((k for k in args if k.isdigit() and int(k) >= 3), key=int)]
        else:
            parts = [args[k] for k in sorted((k for k in args if k.isdigit() and int(k) >= 2), key=int)]
        if name in {"af", "affix", "prefix", "suffix", "confix", "compound", "com", "com+"}:
            parts = [re.sub(r"<[^>]*>", "", str(p)).strip() for p in parts]
            ets.append((name, tuple(p for p in parts if p and "=" not in p)))
    v["ety"] = tuple(ets)
    return v


def load_edition(path: Path, edition: str, cache: Path) -> dict[tuple[str, str], list[dict]]:
    if cache.exists() and cache.stat().st_mtime > path.stat().st_mtime:
        with open(cache, "rb") as f:
            return pickle.load(f)
    out: dict[tuple[str, str], list[dict]] = defaultdict(list)
    if not path.exists():
        return out
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                o = json.loads(line)
            except json.JSONDecodeError:
                continue
            word = o.get("word")
            pos = POS_MAP.get(o.get("pos") or "", None)
            if not word or pos is None or " " in word.strip():
                continue
            if not is_lemma_entry(o, edition):
                continue
            out[(word, pos)].append(extract_variant(o, edition))
    out = dict(out)
    with open(cache, "wb") as f:
        pickle.dump(out, f, protocol=pickle.HIGHEST_PROTOCOL)
    return out


# ---------------------------------------------------------------- features

def _find_form(v: dict, need: set[str], avoid: set[str] = frozenset(), pronoun: str | None = None,
               top_only: bool = True, not_equal: str | None = None) -> str | None:
    fallback = None
    for form, tags, prons, _art, src in v["forms"]:
        t = set(tags)
        if top_only and src:
            continue
        if need <= t and not (t & avoid) and (pronoun is None or pronoun in prons):
            if not_equal and form == not_equal:
                fallback = fallback or form
                continue
            return form
    return fallback


def noun_gender(variants: list[dict]) -> tuple[str | None, list[str]]:
    """(gender code, sorted list of concrete genders)."""
    genders: set[str] = set()
    plural_only = False
    for v in variants:
        if v["ed"] == "de":
            arts = {art for form, tags, _p, art, _s in v["forms"]
                    if art and "nominative" in tags and "singular" in tags}
            genders |= {{"der": "masc", "die": "femn", "das": "neut"}[a] for a in arts
                        if a in ("der", "die", "das")}
            if not arts and any("nominative" in t and "plural" in t for _f, t, *_ in v["forms"]):
                has_sg = any("singular" in t for _f, t, *_ in v["forms"])
                plural_only = plural_only or not has_sg
        elif v["ed"] == "en":
            m = re.match(r"^\S+ ((?:[mfn]|pl)(?: or (?:[mfn]|pl))*)(?: |$)", v["head"])
            if m:
                for g in m.group(1).split(" or "):
                    if g == "pl":
                        plural_only = True
                    else:
                        genders.add({"m": "masc", "f": "femn", "n": "neut"}[g])
            if "plural-only" in v["tags"] or "plural only" in v["head"]:
                plural_only = True
    order = ["masc", "femn", "neut"]
    gl = sorted(genders, key=order.index)
    if len(genders) > 1:
        return "multiple", gl
    if genders:
        return gl[0], gl
    if plural_only:
        return "plural_only", []
    return None, []


def first_nonempty(*vals):
    for x in vals:
        if x:
            return x
    return None


def verb_features(lemma: str, de: list[dict], en: list[dict]) -> dict:
    out: dict = {}
    for src in (de, en):
        for v in src:
            if v["ed"] == "de":
                p3 = _find_form(v, {"present"}, pronoun="er")
                pret = _find_form(v, {"past"}, {"subjunctive-ii"}, pronoun="ich")
                pp = _find_form(v, {"participle-2"}, not_equal=lemma)
            else:
                p3 = _find_form(v, {"present", "third-person", "singular"}, {"subjunctive"})
                pret = _find_form(v, {"past"}, {"subjunctive", "participle"} | PERSON_TAGS)
                pp = _find_form(v, {"participle", "past"}, not_equal=lemma)
            out.setdefault("present_3sg", p3)
            out.setdefault("preterite_3sg", pret)
            out.setdefault("past_participle", pp)
            if not out["present_3sg"]:
                out["present_3sg"] = p3
            if not out["preterite_3sg"]:
                out["preterite_3sg"] = pret
            if not out["past_participle"]:
                out["past_participle"] = pp
    # auxiliary: the auxiliary marked on the first English sense (the primary
    # meaning, e.g. "[auxiliary sein]") is the most specific; entry-level
    # lists often add regional/rare alternatives. Then the German conjugation
    # table ("Hilfsverb sein"), the German summary line, English entry forms.
    aux: set[str] = set()
    for v in en:
        if v.get("sense_aux"):
            aux |= set(v["sense_aux"][0])
            break
    for v in de if not aux else ():
        aux |= set(v.get("aux_table") or ())
    for src in ((), de, en) if not aux else ():
        for v in src:
            for form, tags, _p, _a, s in v["forms"]:
                if "auxiliary" in tags and not s and form in ("haben", "sein"):
                    aux.add(form)
        if aux:
            break
    out["auxiliary"] = ("both" if len(aux) == 2 else aux.pop()) if aux else None
    # conjugation class from English tags / head line
    words: set[str] = set()
    for v in en:
        words |= set(v["tags"])
        head = v["head"].lower()
        for w in ("strong", "weak", "mixed", "irregular"):
            if re.search(rf"\b{w}\b", head):
                words.add(w)
    if lemma in MODALS:
        conj = "modal"
    elif "mixed" in words or {"irregular", "weak"} <= words and "strong" not in words:
        conj = "mixed"
    elif "strong" in words:
        conj = "strong"
    elif "weak" in words:
        conj = "weak"
    elif "irregular" in words:
        conj = "irregular"
    else:
        conj = None
    out["conjugation"] = conj
    refl = False
    for v in de + en:
        if "reflexive" in v["tags"]:
            refl = True
        if any(f.split()[0] == "sich" or " sich" in f for f, *_ in v["forms"] if " " in f):
            refl = True
        if v["ed"] == "en" and re.search(r"\bsich\b", v["head"]):
            refl = True
    out["reflexive"] = refl
    return out


NOT_PARTICLES = {"sich", "mich", "dich", "uns", "euch", "es", "zu"}


def split_particle(lemma: str, form: str) -> str | None:
    """If `form` is a separated verb form like 'steht auf', return 'auf'."""
    parts = form.split()
    if len(parts) != 2:
        return None
    verb, part = parts[0].lower(), parts[1].lower()
    low = lemma.lower()
    if part in NOT_PARTICLES or not part.isalpha() or len(part) >= len(low) - 2:
        return None
    if low.startswith(part) and not verb.startswith(part):
        return part
    return None


def verb_separability(lemma: str, variant: dict) -> tuple[str | None, str | None]:
    """(prefix_type, prefix) from one variant's finite forms (spec 7.4 step 2)."""
    for form, tags, _p, _a, src in variant["forms"]:
        t = set(tags)
        if src:  # conjugation tables are shared between homograph entries
            continue
        if ("present" in t or "past" in t or "preterite" in t) and " " in form:
            p = split_particle(lemma, form)
            if p:
                return "separable", p
    return None, None


def adjective_forms(de: list[dict], en: list[dict]) -> dict:
    out = {"comparative": None, "superlative": None}
    for v in de + en:
        for key in out:
            if not out[key]:
                out[key] = _find_form(v, {key}, top_only=False)
    return out


def noun_forms(de: list[dict], en: list[dict]) -> dict:
    gen = pl = None
    for v in de:
        gen = gen or _find_form(v, {"genitive", "singular"}, top_only=False)
        pl = pl or _find_form(v, {"nominative", "plural"}, top_only=False)
    for v in en:
        gen = gen or _find_form(v, {"genitive", "singular"}, top_only=False) or _find_form(v, {"genitive"}, {"plural"})
        pl = pl or _find_form(v, {"nominative", "plural"}, top_only=False) or _find_form(v, {"plural"}, {"genitive", "dative"})
    return {"genitive": gen, "plural": pl}


def search_forms(lemma: str, variants: list[dict]) -> set[str]:
    """Inflected forms for the search index (spec 7.2 'all POS').

    Multi-word forms are kept only when they are a separable-verb split
    ("steht auf": second token is a prefix the lemma starts with);
    'am schönsten' contributes 'schönsten'.
    """
    out: set[str] = set()
    low = lemma.lower()
    for v in variants:
        if v["ed"] not in ("en", "de"):
            continue
        for form, tags, _p, _a, _s in v["forms"]:
            t = set(tags)
            if t & BAD_FORM_TAGS or "obsolete" in t or "alternative" in t:
                continue
            parts = form.split()
            if len(parts) == 1:
                out.add(form)
            elif len(parts) == 2 and parts[0] == "am":
                out.add(parts[1])
            elif len(parts) == 2 and low.startswith(parts[1].lower()) and len(parts[1]) < len(low) \
                    and parts[0].lower() not in {"zu", "sich", "haben", "sein", "werden"}:
                out.add(form)
    return out
