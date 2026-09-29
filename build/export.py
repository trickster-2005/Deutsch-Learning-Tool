"""Write web/public/data/ JSON and build/reports/ (spec 11, 7.11)."""
from __future__ import annotations

import csv
import json
import shutil
from collections import Counter, defaultdict
from pathlib import Path

from adapters.derivbase import rule_description
from adapters.levels import LEVELS
from adapters.text import fold_umlauts, norm_form, shard_key

SPOT_CHECKS = ["stehen", "gehen", "sprechen", "fahren", "Haus", "frei", "schreiben", "kaufen",
               "arbeiten", "Freund", "geben", "lesen"]
AUTO_START = "<!-- auto:start -->"
AUTO_END = "<!-- auto:end -->"


def dump(path: Path, obj) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    path.write_text(data, "utf-8")
    return len(data.encode("utf-8"))


class Exporter:
    def __init__(self, build, out: Path, reports: Path):
        self.b = build
        self.out = out
        self.reports = reports
        self.sizes: dict[str, int] = defaultdict(int)

    # ------------------------------------------------------------ helpers
    def summary(self, key: str) -> dict:
        """Compact per-node data embedded in family files (tree + filters)."""
        e = self.b.lexicon[key]
        seg = e.get("segmentation") or {}
        f = e.get("features") or {}
        s = {
            "key": key, "lemma": e["lemma"], "display": e["display"], "pos": e["pos"], "family": e["family_id"],
            "level": self.b.level_map.get(key, "beyond"), "stars": e["freq_stars"], "zipf": e["zipf"],
            "seg": [[[m["text"], m["type"]] for m in part] for part in seg.get("parts", [])],
            "uncertain": bool(seg.get("uncertain")),
            "topics": e["topics"],
            "gloss_en": e["gloss_en"]["text"], "gloss_zh": e["gloss_zh"]["text"],
        }
        if e.get("is_path_node"):
            s["path"] = True
        if e["pos"] == "NOUN":
            s.update({"article": e.get("article"), "gender": f.get("gender", "unknown"),
                      "plural_type": f.get("plural_type", "other")})
        if e["pos"] == "VERB":
            if e.get("dual"):
                subs = [self.b.lexicon[x]["features"] for x in e["dual"]]
                s["dual"] = [{"prefix_type": x["prefix_type"], "conjugation": x["conjugation"],
                              "auxiliary": x["auxiliary"], "reflexive": x["reflexive"]} for x in subs]
            s.update({"conjugation": f.get("conjugation", "unknown"),
                      "prefix_type": f.get("prefix_type", "none"),
                      "auxiliary": f.get("auxiliary", "unknown"),
                      "reflexive": bool(f.get("reflexive"))})
        if e.get("compound"):
            s["compound"] = True
        custom = self.b.custom_levels.get(key)
        if custom:
            s["custom_level"] = custom
        return s

    # ------------------------------------------------------------ main
    def write_all(self) -> None:
        b = self.b
        if self.out.exists():
            for sub in ("families", "lexicon", "levels", "browse"):
                shutil.rmtree(self.out / sub, ignore_errors=True)
        self.out.mkdir(parents=True, exist_ok=True)
        self.reports.mkdir(parents=True, exist_ok=True)

        # compound index: part lemma_key -> {as_modifier, as_head}
        comp_index: dict[str, dict[str, list[str]]] = defaultdict(lambda: {"as_modifier": [], "as_head": []})
        for key, e in b.lexicon.items():
            c = e.get("compound")
            if not c or "variant_of" in e:
                continue
            for i, part in enumerate(c["parts"]):
                if not part["lemma_key"]:
                    continue
                role = "as_head" if i == c["head_index"] else "as_modifier"
                if key not in comp_index[part["lemma_key"]][role]:
                    comp_index[part["lemma_key"]][role].append(key)
        for v in comp_index.values():
            for role in v:
                v[role].sort(key=lambda k: -b.lexicon[k]["zipf"])
        self.comp_index = comp_index

        # families
        fam_index = []
        edges_all = []
        affix_index: dict[str, list[dict]] = defaultdict(list)
        for fam in b.families:
            members = fam["members"]
            # BFS order, children sorted by frequency
            order, idmap = [], {}
            queue = [fam["root"]]
            while queue:
                k = queue.pop(0)
                idmap[k] = f"n{len(order)}"
                order.append(k)
                kids = sorted(b.children.get(k, []), key=lambda c: -b.words[c].zipf)
                queue.extend(kids)
            nodes = []
            for k in order:
                w = b.words[k]
                s = self.summary(w.lemma_key)
                s["id"] = idmap[k]
                nodes.append(s)
            edges = []
            for k in order[1:]:
                p = b.nodes[k].parent
                e = b.edge(p, k)
                e["parent"], e["child"] = idmap[p], idmap[k]
                if "rule" in e:
                    e.pop("rule")  # debug only; kept in reports
                edges.append(e)
                edges_all.append((fam["id"], p, k, e))
                for a in e["added_prefixes"] + e["added_suffixes"]:
                    affix_index[a].append({"lemma_key": b.words[k].lemma_key, "family_id": fam["id"]})
            keys = [b.words[k].lemma_key for k in order]
            as_mod, as_head = [], []
            for key in keys:
                ci = comp_index.get(key)
                if ci:
                    as_mod += [x for x in ci["as_modifier"] if x not in as_mod and x not in keys]
                    as_head += [x for x in ci["as_head"] if x not in as_head and x not in keys]
            as_mod.sort(key=lambda k: -b.lexicon[k]["zipf"])
            as_head.sort(key=lambda k: -b.lexicon[k]["zipf"])
            root_e = b.lexicon[keys[0]]
            parts_of = None
            if root_e.get("compound") and len(order) == 1:
                parts_of = [p for p in root_e["compound"]["parts"]]
            fam_json = {
                "id": fam["id"], "root_lemma": order[0][0], "root_key": keys[0],
                "nodes": nodes, "edges": edges,
                "compounds": {
                    "as_modifier": [self.summary(x) for x in as_mod],
                    "as_head": [self.summary(x) for x in as_head],
                },
            }
            if parts_of:
                fam_json["compound_parts"] = parts_of
            self.sizes["families"] += dump(self.out / "families" / f"{fam['id']}.json", fam_json)
            real = [x for x, w in zip(keys, order) if not b.words[w].path_node]
            min_level = min((b.level_map.get(x, "beyond") for x in real), key=LEVELS.index, default="beyond")
            row = {
                "id": fam["id"], "root_lemma": order[0][0], "root_key": keys[0],
                "size": len(order), "min_level": min_level,
                "pos_counts": dict(Counter(k[1] for k in order)),
            }
            pcs = sorted({e["pos_change"] for e in edges})
            affs = sorted({a for e in edges for a in e["added_prefixes"] + e["added_suffixes"]})
            if pcs:
                row["pos_changes"] = pcs
            if affs:
                row["affixes"] = affs
            if as_mod or as_head:
                row["compound_count"] = len(as_mod) + len(as_head)
            fam_index.append(row)
        self.sizes["families_index"] = dump(self.out / "families_index.json", fam_index)
        self.edges_all = edges_all
        self.fam_index = fam_index

        # lexicon shards
        shards: dict[str, dict] = defaultdict(dict)
        for key, e in b.lexicon.items():
            shards[shard_key(key)][key] = dict(e, level=b.level_map.get(key, "beyond"))
        for sk, content in shards.items():
            self.sizes["lexicon"] += dump(self.out / "lexicon" / f"{sk}.json", content)

        # forms index (exact) + folded
        forms: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
        folded: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
        complete: dict[str, list] = defaultdict(list)
        for k in b.included:
            w = b.words[k]
            e = b.lexicon[w.lemma_key]
            for form in w.forms | {k[0]}:
                nf = norm_form(form)
                if not nf:
                    continue
                lst = forms[shard_key(nf)][nf]
                if w.lemma_key not in lst:
                    lst.append(w.lemma_key)
                ff = fold_umlauts(form)
                lst2 = folded[shard_key(ff)][ff]
                if w.lemma_key not in lst2:
                    lst2.append(w.lemma_key)
            complete[shard_key(norm_form(k[0]))].append(
                [k[0], w.lemma_key, k[1], e.get("article"), w.zipf, e["display"]])
        for sk, content in forms.items():
            for lst in content.values():
                lst.sort(key=lambda x: -b.lexicon[x]["zipf"])
            self.sizes["forms"] += dump(self.out / "lexicon" / "forms" / f"{sk}.json", content)
        for sk, content in folded.items():
            for lst in content.values():
                lst.sort(key=lambda x: -b.lexicon[x]["zipf"])
            self.sizes["forms_folded"] += dump(self.out / "lexicon" / "forms_folded" / f"{sk}.json", content)
        for sk, rows in complete.items():
            rows.sort(key=lambda r: -r[4])
            self.sizes["complete"] += dump(self.out / "lexicon" / "complete" / f"{sk}.json", rows)

        self.sizes["affix_index"] = dump(self.out / "lexicon" / "affix_index.json", affix_index)
        self.sizes["compound_index"] = dump(self.out / "lexicon" / "compound_index.json", comp_index)

        # affixes.json / topics.json
        affixes = {"prefixes": [], "suffixes": []}
        counts = Counter(a for _f, _p, _c, e in edges_all for a in e["added_prefixes"] + e["added_suffixes"])
        for row in b.affixes.get("prefixes", []):
            affixes["prefixes"].append(dict(row, count=counts.get(row["affix"], 0)))
        known = {r["affix"] for r in b.affixes.get("prefixes", [])}
        for p, kind in sorted(b.inv.prefix_kind.items()):
            if p not in known and counts.get(p):
                affixes["prefixes"].append({"affix": p, "kind": kind, "count": counts[p],
                                            "meaning_en": None, "meaning_zh": None, "examples": []})
        for row in b.affixes.get("suffixes", []):
            affixes["suffixes"].append(dict(row, count=counts.get(row["affix"], 0)))
        dump(self.out / "affixes.json", affixes)
        dump(self.out / "topics.json", {k: {"en": v["en"], "zh": v["zh"]} for k, v in b.topics_table.items()})

        # levels
        dump(self.out / "levels" / "estimated.json", b.level_map)
        if b.custom_levels:
            dump(self.out / "levels" / "custom.json", b.custom_levels)

        # browse table (Browse page: families filters, affixes, formation, compounds)
        self.write_browse()

        # meta
        meta = {
            "built": __import__("time").strftime("%Y-%m-%d"),
            "stats": {"families": len(b.families), "lemmas": len(b.included),
                      "kept": b.stats.get("kept"), "path_nodes": b.stats.get("path_nodes"),
                      "compounds": sum(1 for e in b.lexicon.values() if e.get("compound") and "variant_of" not in e)},
            "has_custom_levels": bool(b.custom_levels),
            "pos_changes": sorted({e["pos_change"] for *_x, e in edges_all}),
            "semantic_types": sorted({e["semantic_type"] for *_x, e in edges_all if e["semantic_type"]}),
            "shard_letters": 2,
        }
        dump(self.out / "meta.json", meta)
        self.write_reports()

    def write_browse(self) -> None:
        b = self.b
        parent_edge: dict[str, dict] = {}
        for fid, p, c, e in self.edges_all:
            parent_edge[b.words[c].lemma_key] = {**e, "parent": b.words[p].lemma_key}
        rows = []
        for k in b.included:
            w = b.words[k]
            s = self.summary(w.lemma_key)
            pe = parent_edge.get(w.lemma_key)
            row = {
                "k": w.lemma_key, "f": w.family, "d": s["display"], "p": s["pos"], "l": s["level"],
                "s": s["stars"], "z": s["zipf"], "g": s.get("gender"), "pl": s.get("plural_type"),
                "cj": s.get("conjugation"), "pt": s.get("prefix_type"), "ax": s.get("auxiliary"),
                "rf": 1 if s.get("reflexive") else 0, "t": s["topics"], "u": 1 if s["uncertain"] else 0,
                "a": s.get("article"), "ge": s["gloss_en"][:60], "gz": s["gloss_zh"][:40],
            }
            if s.get("path"):
                row["x"] = 1
            if pe:
                row["pk"] = pe["parent"]
                row["pc"] = pe["pos_change"]
                row["st"] = pe["semantic_type"]
                row["vc"] = pe["vowel_change"]
                row["af"] = pe["added_prefixes"] + pe["added_suffixes"]
                row["ptp"] = pe["prefix_types"]
            e = b.lexicon[w.lemma_key]
            if e.get("compound"):
                c = e["compound"]
                row["cp"] = [p["lemma_key"] or p["lemma"] for p in c["parts"]]
                row["cl"] = c["links"]
                row["cs"] = c["surfaces"]
                row["ce"] = c["elision"]
            if s.get("dual"):
                row["dual"] = s["dual"]
            if s.get("custom_level"):
                row["cl2"] = s["custom_level"]
            rows.append(row)
        self.sizes["browse"] = dump(self.out / "browse" / "words.json", rows)

    # ------------------------------------------------------------ reports
    def write_reports(self) -> None:
        b = self.b
        r = self.reports
        with open(r / "affix_unmatched.csv", "w", newline="", encoding="utf-8") as f:
            wr = csv.writer(f)
            wr.writerow(["affix_candidate", "count", "example"])
            wr.writerows(b.reports["affix_unmatched"])
        with open(r / "separability_unknown.csv", "w", newline="", encoding="utf-8") as f:
            wr = csv.writer(f)
            wr.writerow(["lemma", "prefix", "reason"])
            wr.writerows(sorted(b.reports["separability_unknown"]))
        with open(r / "compound_rejects.csv", "w", newline="", encoding="utf-8") as f:
            wr = csv.writer(f)
            wr.writerow(["word", "charsplit_best", "reason"])
            wr.writerows(b.reports["compound_rejects"])

        # summary.md
        lex = [e for e in b.lexicon.values() if "variant_of" not in e]
        n = len(lex)

        def cov(pred, subset=None):
            s = [e for e in lex if subset is None or subset(e)]
            if not s:
                return "n/a"
            return f"{100 * sum(1 for e in s if pred(e)) / len(s):.1f}% of {len(s)}"

        sizes = Counter(len(f["members"]) for f in b.families)
        buckets = Counter()
        for size, cnt in sizes.items():
            label = "1" if size == 1 else "2-4" if size <= 4 else "5-9" if size <= 9 else "10-19" if size <= 19 else "20+"
            buckets[label] += cnt
        seg = b.stats.get("segmentation", {})
        derived = sum(v for k, v in seg.items() if k not in ("root", "override"))
        path_ok = sum(v for k, v in seg.items() if k.startswith("path"))
        lines = [
            "# Build summary", "",
            f"- Families: {len(b.families)}",
            f"- Nodes (lemmas in families): {len(b.included)}",
            f"- Kept by frequency: {b.stats.get('kept')}; path nodes: {b.stats.get('path_nodes')}",
            f"- Compounds: {sum(1 for e in lex if e.get('compound'))} ({b.stats.get('compounds')})",
            f"- Dual separable/inseparable verbs: {sum(1 for e in lex if e.get('dual'))}",
            "", "## Family size distribution", "",
            "| size | families |", "|---|---|",
            *[f"| {k} | {buckets.get(k, 0)} |" for k in ["1", "2-4", "5-9", "10-19", "20+"]],
            "", "## Level distribution (estimated)", "",
            "| level | lemmas |", "|---|---|",
            *[f"| {l} | {b.stats['levels'].get(l, 0)} |" for l in LEVELS],
            "", "## Field coverage", "",
            f"- English gloss: {cov(lambda e: e['gloss_en']['text'])}",
            f"- Chinese gloss: {cov(lambda e: e['gloss_zh']['text'])}",
            f"- IPA: {cov(lambda e: e.get('ipa'))}",
            f"- Examples: {cov(lambda e: e['examples'])}",
            f"- Topics: {cov(lambda e: e['topics'])}",
            f"- Noun gender known: {cov(lambda e: e.get('gender') not in (None, 'unknown'), lambda e: e['pos'] == 'NOUN')}",
            f"- Noun plural known: {cov(lambda e: e.get('plural'), lambda e: e['pos'] == 'NOUN')}",
            f"- Verb conjugation known: {cov(lambda e: (e.get('features') or {}).get('conjugation') not in (None, 'unknown'), lambda e: e['pos'] == 'VERB' and not e.get('dual'))}",
            f"- Verb auxiliary known: {cov(lambda e: (e.get('features') or {}).get('auxiliary') not in (None, 'unknown'), lambda e: e['pos'] == 'VERB' and not e.get('dual'))}",
            f"- Verb principal parts: {cov(lambda e: (e.get('principal_parts') or {}).get('past_participle'), lambda e: e['pos'] == 'VERB' and not e.get('dual'))}",
            f"- Adjective comparative: {cov(lambda e: e.get('comparative'), lambda e: e['pos'] == 'ADJ')}",
            "", "## Segmentation", "",
            f"- Outcomes: {json.dumps(seg)}",
            f"- Derivation-path success rate (non-root nodes): {100 * path_ok / derived:.1f}%" if derived else "- no derived nodes",
            "", "## Tree stitching", "",
            f"- Operations: {json.dumps(b.stats.get('stitching', {}))}",
            *[f"- {k}: " + "; ".join(v[:8]) for k, v in b.stats.get("stitching_examples", {}).items()],
            "", "## Output sizes (bytes)", "",
            *[f"- {k}: {v:,}" for k, v in sorted(self.sizes.items())],
            f"- total: {sum(self.sizes.values()):,}",
            "", "## Sources", "",
            f"- {json.dumps(b.stats.get('derivbase', {}))}",
            f"- Wiktionary lemma records: {json.dumps(b.stats.get('wiktionary_lemmas', {}))}",
        ]
        (r / "summary.md").write_text("\n".join(lines) + "\n", "utf-8")
        self.write_spot_checks()
        self.update_decisions()

    def write_spot_checks(self) -> None:
        b = self.b
        out = ["# Spot checks (spec 15.2)", ""]
        for lemma in SPOT_CHECKS:
            key = next((b.words[k].lemma_key for k in b.included if k[0] == lemma), None)
            if not key:
                out += [f"## {lemma}", "", "_not in output_", ""]
                continue
            fid = b.lexicon[key]["family_id"]
            fam = next(f for f in b.families if f["id"] == fid)
            out += [f"## {lemma} (family {fid}, root {fam['root'][0]}, {len(fam['members'])} nodes)", "", "```"]

            def walk(k, depth):
                w = b.words[k]
                e = b.lexicon[w.lemma_key]
                seg = " + ".join(f"{m['text']}:{m['type']}" for part in (e["segmentation"] or {}).get("parts", [])
                                 for m in part)
                edge = ""
                p = b.nodes[k].parent
                if depth and p is not None:
                    ed = b.edge(p, k)
                    edge = f"  <{'+'.join(ed['added_prefixes'] + ed['added_suffixes']) or '0'}" \
                           f" {ed['pos_change']} {ed['semantic_type'] or ''} {ed['vowel_change'] or ''}>"
                    rd = rule_description(b.nodes[k].rule, b.dbase.rules) if b.nodes[k].rule else None
                    if b.nodes[k].rule:
                        edge += f" [{b.nodes[k].rule}]"
                flag = " (path)" if w.path_node else ""
                out.append(f"{'  ' * depth}{e['display']} {e['pos']} {b.level_map.get(w.lemma_key)} z={w.zipf}{flag}{edge}")
                out.append(f"{'  ' * depth}    seg: {seg}")
                for c in sorted(b.children.get(k, []), key=lambda c: -b.words[c].zipf):
                    walk(c, depth + 1)
            walk(fam["root"], 0)
            out.append("```")
            out.append("")
            out.append("| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |")
            out.append("|---|---|---|---|---|---|---|---|---|")
            for k in fam["members"]:
                e = b.lexicon[b.words[k].lemma_key]
                f = e.get("features") or {}
                pp = e.get("principal_parts") or {}
                out.append("| {} | {} | {} | {} | {} | {} | {} | {} | {} |".format(
                    b.words[k].lemma_key, e.get("article") or "", e.get("plural") or "",
                    " · ".join(x for x in [pp.get("present_3sg"), pp.get("preterite_3sg"), pp.get("past_participle")] if x),
                    f.get("auxiliary", ""), f.get("conjugation", ""), f.get("prefix_type", ""),
                    e["gloss_en"]["text"].replace("|", "/"), e["gloss_zh"]["text"].replace("|", "/")))
            ci = self.comp_index.get(key, {})
            out += ["", f"Compounds with {lemma}: as modifier {ci.get('as_modifier', [])[:10]}, "
                        f"as head {ci.get('as_head', [])[:10]}", ""]
        (self.reports / "spot_checks.md").write_text("\n".join(out) + "\n", "utf-8")

    def update_decisions(self) -> None:
        path = Path(__file__).resolve().parent.parent / "DECISIONS.md"
        auto = [AUTO_START, "", "### Auto-detected by pipeline.py (last build)", ""]
        auto += [f"- {d}" for d in self.b.decisions]
        auto += ["", AUTO_END]
        text = path.read_text("utf-8") if path.exists() else "# Decisions\n\n"
        if AUTO_START in text and AUTO_END in text:
            pre = text.split(AUTO_START)[0]
            post = text.split(AUTO_END)[1]
            text = pre + "\n".join(auto) + post
        else:
            text = text.rstrip() + "\n\n" + "\n".join(auto) + "\n"
        path.write_text(text, "utf-8")
