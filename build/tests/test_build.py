"""Build tests (spec 15.1)."""
from __future__ import annotations

import pytest

from adapters.base import DerivNode, Morpheme, Segmentation
from adapters.compounds import CompoundAnalyser, detect_link
from adapters.frequency import allocate, to_zipf
from adapters.levels import estimate_levels
from adapters.segmenter import AffixInventory, PathSegmenter, split_verb_ending
from adapters.stitch import Forest, reorient_nominalized_infinitives, stitch_prefixed
from adapters.text import fold_umlauts, norm_form, shard_key
from pipeline import Build, Word, clean_zh, decide_separability, plural_type


@pytest.fixture(scope="module")
def build() -> Build:
    return Build()  # only reads config.yaml and curated/*.yaml


@pytest.fixture(scope="module")
def seg(build) -> PathSegmenter:
    return build.seg


def root_seg(seg: PathSegmenter, lemma: str, pos: str) -> Segmentation:
    return seg.root(lemma, pos)


def derive(seg: PathSegmenter, parent: str, ppos: str, child: str, cpos: str, pseg: Segmentation | None = None):
    pseg = pseg or seg.root(parent, ppos)
    stem = "".join(m.text for m in pseg.parts[0] if m.type != "END")
    m = seg.match(child, cpos, parent, ppos, stem)
    assert m is not None, f"{parent} -> {child} did not match"
    return m, seg.child_segmentation(m, pseg, cpos, None, None)


def texts(s: Segmentation) -> list[tuple[str, str]]:
    return [(m.text, m.type) for m in s.parts[0]]


# ------------------------------------------------------------------ 7.5 roots
@pytest.mark.parametrize("verb,expected", [
    ("lächeln", ("lächel", "n")),
    ("wandern", ("wander", "n")),
    ("tun", ("tu", "n")),
    ("gehen", ("geh", "en")),
])
def test_root_verb_endings(verb, expected):
    assert split_verb_ending(verb) == expected


def test_root_noun_is_whole_root(seg):
    assert texts(seg.root("Haus", "NOUN")) == [("Haus", "ROOT")]


# ------------------------------------------------------------------ 7.5 children
def test_prefix_inseparable(seg):
    _m, s = derive(seg, "stehen", "VERB", "verstehen", "VERB")
    assert texts(s) == [("ver", "PREF"), ("steh", "ROOT"), ("en", "END")]


def test_prefix_separable(seg):
    _m, s = derive(seg, "stehen", "VERB", "aufstehen", "VERB")
    assert texts(s) == [("auf", "PREF_SEP"), ("steh", "ROOT"), ("en", "END")]


def test_two_suffixes_along_path(seg):
    m1, s1 = derive(seg, "Freund", "NOUN", "freundlich", "ADJ")
    assert m1.suffixes == ["lich"]
    m2, s2 = derive(seg, "freundlich", "ADJ", "Freundlichkeit", "NOUN", s1)
    assert texts(s2) == [("Freund", "ROOT"), ("lich", "SUFF"), ("keit", "SUFF")]


def test_e_elision(seg):
    m, s = derive(seg, "Schule", "NOUN", "schulisch", "ADJ")
    assert m.change == "elision"
    assert texts(s) == [("schul", "ROOT"), ("isch", "SUFF")]


def test_umlaut(seg):
    m, s = derive(seg, "kaufen", "VERB", "Käufer", "NOUN")
    assert m.change == "umlaut" and m.confidence == 0.9
    assert texts(s) == [("Käuf", "ROOT"), ("er", "SUFF")]


def test_ablaut(seg):
    m, s = derive(seg, "springen", "VERB", "Sprung", "NOUN")
    assert m.change == "ablaut" and m.confidence == 0.8
    assert s.uncertain is False  # 0.8 is not below the 0.8 threshold


def test_failure(seg):
    pseg = seg.root("gehen", "VERB")
    assert seg.match("Hund", "NOUN", "gehen", "VERB", "geh") is None
    f = seg.failed("Hund", "NOUN")
    assert f.uncertain and f.confidence == 0.3 and f.source == "none"
    assert pseg.parts


def test_wiktionary_template_fallback(seg):
    s = seg.from_etymology("Wohnung", "NOUN", (("af", ("wohnen", "-ung")),), None, None)
    assert s is not None and texts(s) == [("Wohn", "ROOT"), ("ung", "SUFF")]


# ------------------------------------------------------------------ 7.4 separability
def _variant(forms):
    return {"ed": "de", "forms": [(f, tuple(tags), (), None, None) for f, tags in forms]}


@pytest.fixture(scope="module")
def inv(build) -> AffixInventory:
    return build.inv


def test_separable_from_split_forms(inv):
    v = _variant([("steht auf", ["present"]), ("stand auf", ["past"]), ("aufgestanden", ["participle-2"])])
    assert decide_separability("aufstehen", [v], {"stehen", "aufstehen"}, inv) == ("separable", "auf", False)


def test_separable_from_ge_participle(inv):
    v = _variant([("angefangen", ["participle-2"])])
    assert decide_separability("anfangen", [v], {"fangen"}, inv)[:2] == ("separable", "an")


def test_inseparable_from_participle(inv):
    v = _variant([("verkauft", ["participle-2"])])
    assert decide_separability("verkaufen", [v], {"kaufen"}, inv)[:2] == ("inseparable", "ver")


def test_dual_uebersetzen(inv):
    sep = _variant([("setzt über", ["present"]), ("übergesetzt", ["participle-2"])])
    insep = _variant([("übersetzt", ["present"]), ("übersetzt", ["participle-2"])])
    ptype, prefix, dual = decide_separability("übersetzen", [insep, sep], {"setzen"}, inv)
    assert dual is True and prefix == "über"


def test_no_prefix(inv):
    v = _variant([("gegangen", ["participle-2"])])
    assert decide_separability("gehen", [v], {"gehen"}, inv) == ("none", None, False)
    v = _variant([("gebetet", ["participle-2"])])
    assert decide_separability("beten", [v], {"beten"}, inv) == ("none", None, False)


# ------------------------------------------------------------------ 7.6 compounds
@pytest.mark.parametrize("lemma,surface,expected", [
    ("Arbeit", "Arbeits", ("s", False, False)),
    ("Straße", "Straßen", ("n", False, False)),
    ("Kind", "Kinder", ("er", False, False)),
    ("Schule", "Schul", ("", True, False)),
    ("Huhn", "Hühner", ("er", False, True)),
    ("Haus", "Haus", ("", False, False)),
])
def test_linking_elements(lemma, surface, expected):
    assert detect_link(lemma, surface) == expected


class FakeSplitter:
    def __init__(self, result):
        self.result = result

    def split_compound(self, word):
        return self.result


LEX = {"haus": "Haus", "tür": "Tür", "arbeit": "Arbeit", "platz": "Platz"}


def lookup(w):
    return LEX.get(w.lower())


def test_charsplit_accepts_valid_split():
    ca = CompoundAnalyser(lookup, FakeSplitter([(0.88, "Haus", "Tür")]))
    a = ca.from_charsplit("Haustür")
    assert a is not None and a.parts == ["Haus", "Tür"] and a.links == [""]


def test_charsplit_link_detected():
    ca = CompoundAnalyser(lookup, FakeSplitter([(0.92, "Arbeits", "Platz")]))
    a = ca.from_charsplit("Arbeitsplatz")
    assert a is not None and a.parts == ["Arbeit", "Platz"] and a.links == ["s"]


def test_charsplit_threshold():
    ca = CompoundAnalyser(lookup, FakeSplitter([(0.3, "Haus", "Tür")]))
    assert ca.from_charsplit("Haustür") is None
    assert "score" in ca.rejects[-1][2]


def test_charsplit_parts_must_exist():
    ca = CompoundAnalyser(lookup, FakeSplitter([(0.9, "Hau", "Stür")]))
    assert ca.from_charsplit("Haustür") is None
    ca = CompoundAnalyser(lookup, FakeSplitter([(0.9, "Xyzab", "Tür")]))
    assert ca.from_charsplit("Xyzabtür") is None


def test_compound_from_wiktionary_template():
    ca = CompoundAnalyser(lookup, None)
    a = ca.from_etymology("Haustür", (("compound", ("Haus", "Tür")),))
    assert a is not None and a.surfaces == ["Haus", "tür"]


# ------------------------------------------------------------------ section 8 plurals
@pytest.mark.parametrize("sg,pl,expected", [
    ("Haus", "Häuser", "uml_er"),
    ("Tag", "Tage", "e"),
    ("Auto", "Autos", "s"),
    ("Lehrer", "Lehrer", "zero"),
    ("Vater", "Väter", "uml_zero"),
    ("Frau", "Frauen", "en"),
    ("Blume", "Blumen", "en"),
    ("Sohn", "Söhne", "uml_e"),
    ("Kind", "Kinder", "er"),
    ("Lehrerin", "Lehrerinnen", "en"),
    ("Obst", None, "none"),
])
def test_plural_types(sg, pl, expected):
    assert plural_type(sg, pl) == expected


# ------------------------------------------------------------------ 7.7 conversions
def _setup_semantic(build, nodes):
    build.lex = {"en": {}, "de": {}, "zh": {}}
    build.nodes = {k: DerivNode(key=k, lemma=k[0], pos=k[1], gender=g) for k, g in nodes.items()}


@pytest.mark.parametrize("parent,child,gender,expected", [
    (("essen", "VERB"), ("Essen", "NOUN"), "neut", "nominalized_infinitive"),
    (("laufen", "VERB"), ("Lauf", "NOUN"), "masc", "stem_noun"),
    (("gut", "ADJ"), ("Gute", "NOUN"), "neut", "nominalized_adjective"),
    (("Fisch", "NOUN"), ("fischen", "VERB"), None, "denominal_verb"),
    (("offen", "ADJ"), ("öffnen", "VERB"), None, "deadjectival_verb"),
])
def test_conversion_types(build, parent, child, gender, expected):
    _setup_semantic(build, {parent: None, child: gender})
    e = {"added_prefixes": [], "added_suffixes": [], "pos_change": f"{parent[1]}>{child[1]}"}
    assert build._semantic(e, parent, child) == expected


def test_suffix_semantic_type(build):
    _setup_semantic(build, {("wohnen", "VERB"): None, ("Wohnung", "NOUN"): "femn"})
    e = {"added_prefixes": [], "added_suffixes": ["-ung"], "pos_change": "VERB>NOUN"}
    assert build._semantic(e, ("wohnen", "VERB"), ("Wohnung", "NOUN")) == "action_noun"
    e = {"added_prefixes": ["auf-"], "added_suffixes": [], "pos_change": "VERB>VERB"}
    assert build._semantic(e, ("stehen", "VERB"), ("aufstehen", "VERB")) == "prefixed_verb"


def test_deadjectival_segmentation(seg):
    m, _s = derive(seg, "offen", "ADJ", "öffnen", "VERB")
    assert m.change == "umlaut" and not m.prefixes and not m.suffixes


# ------------------------------------------------------------------ 7.3 retention
def test_path_ancestors_are_kept(build):
    a, b, c = ("stehen", "VERB"), ("rarewort", "VERB"), ("Frequentwort", "NOUN")
    build.nodes = {
        a: DerivNode(key=a, lemma=a[0], pos=a[1]),
        b: DerivNode(key=b, lemma=b[0], pos=b[1], parent=a),
        c: DerivNode(key=c, lemma=c[0], pos=c[1], parent=b),
    }
    build.words = {
        a: Word(a, a[0], a[1], in_wikt=True, zipf=5.0),
        b: Word(b, b[0], b[1], in_wikt=True, zipf=1.0),
        c: Word(c, c[0], c[1], in_wikt=True, zipf=4.0),
    }
    build.stats = {}
    build.retain()
    assert build.words[a].kept and not build.words[a].path_node
    assert not build.words[b].kept and build.words[b].path_node
    assert build.words[c].kept


# ------------------------------------------------------------------ frequency & levels
def test_frequency_sum_and_separable_boost():
    forms = {("aufstehen", "VERB"): {"aufstehen", "aufgestanden"}}
    plain = allocate(forms, {}, 2.5)[("aufstehen", "VERB")]
    boosted = allocate(forms, {("aufstehen", "VERB"): True}, 2.5)[("aufstehen", "VERB")]
    assert boosted == pytest.approx(plain + 0.4, abs=0.011)  # log10(2.5) = 0.398


def test_shared_form_goes_to_main_lemma():
    forms = {("Haus", "NOUN"): {"Haus", "Hauses", "Häuser"}, ("hausen", "VERB"): {"hausen", "haust", "haus"}}
    z = allocate(forms, {}, 2.5)
    assert z[("Haus", "NOUN")] > z[("hausen", "VERB")] + 1


def test_zipf_never_negative():
    assert to_zipf(1e-15) == 0.0


def test_level_cutoffs():
    entries = [(f"w{i}", "NOUN", 7 - i / 10000) for i in range(21000)]
    cut = {"A1": 650, "A2": 1300, "B1": 2400, "B2": 5000, "C1": 10000, "C2": 20000}
    lv = estimate_levels(entries, cut)
    assert lv["w0"] == "A1" and lv["w649"] == "A1" and lv["w650"] == "A2"
    assert lv["w2399"] == "B1" and lv["w2400"] == "B2" and lv["w19999"] == "C2" and lv["w20000"] == "beyond"


# ------------------------------------------------------------------ 7.8 Chinese glosses
class FakeCC:
    def convert(self, s):
        return s.replace("软件", "軟體")


@pytest.mark.parametrize("raw,expected", [
    ("起身；起床 [助動詞 sein]", "起身；起床"),
    ("〔口〕软件  {文法}", "軟體"),
    ("【書】房子", "房子"),
    ("〈陰〉 pl.Behausungen 寓所，住處", "寓所，住處"),
    ("adj. 被解放的", "被解放的"),
    ("* 國際音標^((幫助)): /x/", ""),
])
def test_clean_zh(raw, expected):
    assert clean_zh(raw, FakeCC()) == expected


# ------------------------------------------------------------------ 11.3 search keys
def test_norm_and_fold():
    assert norm_form("  Straße  ") == "strasse"
    assert norm_form("steht   auf") == "steht auf"
    assert fold_umlauts("schön") == "schon"
    assert fold_umlauts("Häuser") == "hauser"


def test_shard_key():
    assert shard_key("übersetzen#sep") == "ub"
    assert shard_key("Straße") == "st"
    assert shard_key("a") == "a_"


# ------------------------------------------------------------------ stitching
def test_stitching_reconnects_aufstehen():
    k = {x: (x, p) for x, p in [("stehen", "VERB"), ("Aufstehen", "NOUN"), ("aufstehen", "VERB")]}
    nodes = {
        k["stehen"]: DerivNode(key=k["stehen"], lemma="stehen", pos="VERB"),
        k["Aufstehen"]: DerivNode(key=k["Aufstehen"], lemma="Aufstehen", pos="NOUN"),
        k["aufstehen"]: DerivNode(key=k["aufstehen"], lemma="aufstehen", pos="VERB", parent=k["Aufstehen"]),
    }
    f = Forest(nodes)
    reorient_nominalized_infinitives(f)
    assert nodes[k["Aufstehen"]].parent == k["aufstehen"]
    stitch_prefixed(f, ["auf"], [], lambda _k: 1.0)
    assert nodes[k["aufstehen"]].parent == k["stehen"]
    assert f.root_of(k["Aufstehen"]) == k["stehen"]


def test_segmentation_json_roundtrip():
    s = Segmentation([[Morpheme("auf", "PREF_SEP"), Morpheme("steh", "ROOT"), Morpheme("en", "END")]], "derivation-path", 1.0)
    j = s.to_json()
    assert j["parts"][0][0] == {"text": "auf", "type": "PREF_SEP"} and j["uncertain"] is False
