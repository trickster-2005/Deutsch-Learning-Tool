"""Download all external data into build/.cache/ (resumable, cached, retried).

Wiktionary dumps are streamed line by line through gzip and filtered to
German entries (lang_code == "de") into build/.cache/wikt_{en,de,zh}_de.jsonl.
Failures are logged to .cache/download_log.json and the build continues
without the missing source.
"""
from __future__ import annotations

import gzip
import json
import shutil
import sys
import tarfile
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / ".cache"
LOG = CACHE / "download_log.json"

UDER_HANDLE_URL = "https://lindat.mff.cuni.cz/repository/xmlui/bitstream/handle/11234/1-3247/UDer-1.1.tgz"
UDER_PID = "hdl:11234/1-3247"
LINDAT_API = "https://lindat.mff.cuni.cz/repository/server/api"

# English Wiktionary: the full raw dump is ~3 GB (all languages). kaikki.org also
# publishes the German-only slice of the same wiktextract run (~100 MB), which
# holds exactly the lang_code == "de" entries we keep. We try it first and fall
# back to the raw dump (see DECISIONS.md).
WIKT_EN_GERMAN_SLICE = "https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl.gz"

WIKT = {
    "en": "https://kaikki.org/dictionary/raw-wiktextract-data.jsonl.gz",
    "de": "https://kaikki.org/dewiktionary/raw-wiktextract-data.jsonl.gz",
    "zh": "https://kaikki.org/zhwiktionary/raw-wiktextract-data.jsonl.gz",
}

HEADERS = {"User-Agent": "gwf-build/0.1 (German word family explorer; offline data build)"}


def fetch(url: str, dest: Path, retries: int = 3, expect_binary: bool = True) -> None:
    """Resumable download with retries. Raises on final failure."""
    part = dest.with_suffix(dest.suffix + ".part")
    last_err: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            have = part.stat().st_size if part.exists() else 0
            headers = dict(HEADERS)
            if have:
                headers["Range"] = f"bytes={have}-"
            with requests.get(url, headers=headers, stream=True, timeout=60) as r:
                if r.status_code == 416:  # already complete
                    break
                r.raise_for_status()
                ctype = r.headers.get("Content-Type", "")
                if expect_binary and "text/html" in ctype:
                    raise RuntimeError(f"got HTML instead of data from {url}")
                mode = "ab" if (have and r.status_code == 206) else "wb"
                total = int(r.headers.get("Content-Length", 0)) + (have if mode == "ab" else 0)
                done = have if mode == "ab" else 0
                t0 = time.time()
                with open(part, mode) as f:
                    for chunk in r.iter_content(chunk_size=1 << 20):
                        f.write(chunk)
                        done += len(chunk)
                        if time.time() - t0 > 15:
                            t0 = time.time()
                            pct = f"{100 * done / total:.1f}%" if total else "?"
                            print(f"  {dest.name}: {done / 1e6:.0f} MB {pct}", flush=True)
            part.replace(dest)
            return
        except Exception as e:  # noqa: BLE001 - log and retry
            last_err = e
            print(f"  attempt {attempt} failed for {url}: {e}", flush=True)
            time.sleep(3 * attempt)
    if part.exists() and not dest.exists():
        # 416 path: the part file is complete
        part.replace(dest)
        return
    raise RuntimeError(f"download failed: {url}: {last_err}")


def resolve_uder_url() -> list[str]:
    """LINDAT migrated to DSpace 7; the old xmlui URL now returns HTML.
    Resolve the handle through the REST API and return candidate URLs."""
    urls = []
    try:
        r = requests.get(f"{LINDAT_API}/pid/find", params={"id": UDER_PID}, headers=HEADERS,
                         allow_redirects=False, timeout=30)
        item = r.headers.get("Location")
        if item:
            bundles = requests.get(f"{item}/bundles", headers=HEADERS, timeout=30).json()
            for b in bundles["_embedded"]["bundles"]:
                if b["name"] != "ORIGINAL":
                    continue
                bs = requests.get(b["_links"]["bitstreams"]["href"], headers=HEADERS, timeout=30).json()
                for s in bs["_embedded"]["bitstreams"]:
                    if s["name"] == "UDer-1.1.tgz":
                        urls.append(s["_links"]["content"]["href"])
    except Exception as e:  # noqa: BLE001
        print(f"  REST resolution failed: {e}")
    urls.append(UDER_HANDLE_URL)
    return urls


def download_uder(log: dict) -> None:
    out_dir = CACHE / "de-DErivBase"
    if out_dir.exists() and any(out_dir.glob("*.tsv.gz")):
        log["uder"] = {"status": "cached"}
        return
    tgz = CACHE / "UDer-1.1.tgz"
    if not tgz.exists():
        err = None
        for url in resolve_uder_url():
            try:
                print(f"UDer: {url}")
                fetch(url, tgz)
                log["uder_url"] = url
                break
            except Exception as e:  # noqa: BLE001
                err = e
        else:
            log["uder"] = {"status": "failed", "error": str(err)}
            return
    with tarfile.open(tgz) as tf:
        members = [m for m in tf.getmembers() if "de-DErivBase/" in m.name and m.isfile()]
        out_dir.mkdir(parents=True, exist_ok=True)
        for m in members:
            src = tf.extractfile(m)
            assert src is not None
            with open(out_dir / Path(m.name).name, "wb") as f:
                shutil.copyfileobj(src, f)
    log["uder"] = {"status": "ok", "files": sorted(p.name for p in out_dir.iterdir())}


def download_wiktionary(edition: str, url: str, log: dict) -> None:
    out = CACHE / f"wikt_{edition}_de.jsonl"
    if out.exists() and out.stat().st_size > 0:
        log[f"wikt_{edition}"] = {"status": "cached"}
        return
    raw = CACHE / f"raw-{edition}.jsonl.gz"
    try:
        if edition == "en" and not raw.exists():
            slice_path = CACHE / "en-german-slice.jsonl.gz"
            try:
                if not slice_path.exists():
                    print(f"Wiktionary en (German slice): {WIKT_EN_GERMAN_SLICE}")
                    fetch(WIKT_EN_GERMAN_SLICE, slice_path)
                raw = slice_path
                log["wikt_en_source"] = WIKT_EN_GERMAN_SLICE
            except Exception as e:  # noqa: BLE001
                print(f"  German slice failed ({e}); falling back to raw dump")
        if not raw.exists():
            print(f"Wiktionary {edition}: {url}")
            fetch(url, raw)
            log[f"wikt_{edition}_source"] = url
        n_in = n_out = 0
        tmp = out.with_suffix(".tmp")
        with gzip.open(raw, "rt", encoding="utf-8") as fin, open(tmp, "w", encoding="utf-8") as fout:
            for line in fin:
                n_in += 1
                # cheap prefilter before parsing JSON
                if '"lang_code": "de"' not in line and '"lang_code":"de"' not in line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if obj.get("lang_code") == "de":
                    fout.write(line if line.endswith("\n") else line + "\n")
                    n_out += 1
        tmp.replace(out)
        log[f"wikt_{edition}"] = {"status": "ok", "lines_in": n_in, "german_entries": n_out}
        print(f"  {edition}: {n_out} German entries of {n_in}")
    except Exception as e:  # noqa: BLE001
        log[f"wikt_{edition}"] = {"status": "failed", "error": str(e)}
        print(f"  Wiktionary {edition} failed: {e}")


def main(argv: list[str]) -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    log = json.loads(LOG.read_text("utf-8")) if LOG.exists() else {}
    only = set(argv[1:])
    if not only or "uder" in only:
        download_uder(log)
        LOG.write_text(json.dumps(log, indent=2), "utf-8")
    for ed, url in WIKT.items():
        if not only or ed in only:
            download_wiktionary(ed, url, log)
            LOG.write_text(json.dumps(log, indent=2), "utf-8")
    print(json.dumps(log, indent=2))


if __name__ == "__main__":
    main(sys.argv)
