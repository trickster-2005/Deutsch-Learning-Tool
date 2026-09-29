import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/i18n';
import { loadComplete, loadEntries, loadEntry, loadFolded, loadForms, type CompleteRow } from '../lib/data';
import { searchWord, type SearchResult } from '../lib/search';
import { normForm } from '../lib/text';
import type { LexEntry } from '../lib/types';
import { Article, Gloss, PosTag, Word } from './Word';

const SPECIAL = ['ä', 'ö', 'ü', 'ß'];

export const searchDeps = {
  forms: async (f: string) => (await loadForms(f))[f] ?? [],
  folded: async (f: string) => (await loadFolded(f))[f] ?? [],
};

export function familyPath(entry: LexEntry, key: string): string | null {
  const fid = entry.family_id;
  return fid ? `/family/${fid}?focus=${encodeURIComponent(key)}` : null;
}

export function SearchBox({ big = false, autoFocus = false }: { big?: boolean; autoFocus?: boolean }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [complete, setComplete] = useState<CompleteRow[]>([]);
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [entries, setEntries] = useState<Record<string, LexEntry>>({});
  const [busy, setBusy] = useState(false);
  const [charsOpen, setCharsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // autocomplete (max 8, nouns with article)
  useEffect(() => {
    const norm = normForm(q);
    if (norm.length < 2 || result) {
      setComplete([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      loadComplete(norm)
        .then((rows) => {
          if (cancelled) return;
          const hits: CompleteRow[] = [];
          const seen = new Set<string>();
          for (const r of rows) {
            if (normForm(r[0]).startsWith(norm) && !seen.has(r[1])) {
              seen.add(r[1]);
              hits.push(r);
              if (hits.length >= 8) break;
            }
          }
          setComplete(hits);
          setActive(-1);
        })
        .catch(() => setComplete([]));
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q, result]);

  // close popovers on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = async (key: string) => {
    const e = await loadEntry(key);
    const path = e ? familyPath(e, key) : null;
    if (path) {
      setOpen(false);
      setResult(null);
      setQ('');
      navigate(path);
    }
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (active >= 0 && complete[active]) {
      void go(complete[active][1]);
      return;
    }
    if (!q.trim()) return;
    setBusy(true);
    setOpen(true);
    try {
      const r = await searchWord(q, searchDeps);
      if (r.keys.length === 1 && !r.suggestions.length) {
        await go(r.keys[0]);
        return;
      }
      setEntries(await loadEntries([...r.keys, ...r.suggestions]));
      setResult(r);
    } catch {
      setResult({ query: q, keys: [], suggestions: [], matched: null, hint: 'notFound' });
    } finally {
      setBusy(false);
    }
  };

  // keep the input (and the phone keyboard) focused while tapping helper buttons
  const keepFocus = (e: PointerEvent<HTMLButtonElement>) => e.preventDefault();

  const insert = (c: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? q.length;
    const end = el?.selectionEnd ?? q.length;
    const next = q.slice(0, start) + c + q.slice(end);
    setQ(next);
    setResult(null);
    setOpen(true);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + 1, start + 1);
    });
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && complete.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(complete.length - 1, a + 1));
    } else if (e.key === 'ArrowUp' && complete.length) {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  const showComplete = open && !result && complete.length > 0;
  const showResult = open && (result || busy);

  const row = (key: string) => {
    const en = entries[key];
    if (!en) return null;
    return (
      <li key={key}>
        <button type="button" onClick={() => void go(key)}>
          <Article article={en.article} />
          <Word seg={en.segmentation?.parts.map((p) => p.map((m) => [m.text, m.type] as [string, typeof m.type]))} display={en.display} />
          <PosTag pos={en.pos} />
          <Gloss en={en.gloss_en.text} zh={en.gloss_zh.text} />
        </button>
      </li>
    );
  };

  return (
    <div className={`search ${big ? 'big' : ''}`} ref={boxRef}>
      <form role="search" onSubmit={submit} className="search-row">
        <label htmlFor={`${listId}-input`} className="sr-only">{t('search.label')}</label>
        <input
          id={`${listId}-input`}
          ref={inputRef}
          type="search"
          value={q}
          lang="de"
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={t('search.placeholder')}
          role="combobox"
          aria-expanded={showComplete}
          aria-controls={`${listId}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          onChange={(e) => {
            setQ(e.target.value);
            setResult(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />
        {/* wide screens: the four letters inline */}
        {SPECIAL.map((c) => (
          <button key={c} type="button" className="btn char-btn char-inline" onPointerDown={keepFocus} onClick={() => insert(c)} aria-label={t('search.insert', { c })}>
            {c}
          </button>
        ))}
        {/* phones: one small toggle; the letters open in a row below the field */}
        <button
          type="button"
          className="btn chars-toggle"
          aria-expanded={charsOpen}
          aria-controls={`${listId}-chars`}
          aria-label={t('search.specialChars')}
          title={t('search.specialChars')}
          onPointerDown={keepFocus}
          onClick={() => setCharsOpen((o) => !o)}
        >
          äöü
        </button>
        <button type="submit" className="btn primary" aria-label={t('search.submit')}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </form>
      {charsOpen && (
        <div className="char-strip" id={`${listId}-chars`} role="group" aria-label={t('search.specialChars')}>
          {SPECIAL.map((c) => (
            <button key={c} type="button" className="btn char-btn" onPointerDown={keepFocus} onClick={() => insert(c)} aria-label={t('search.insert', { c })}>
              {c}
            </button>
          ))}
        </div>
      )}

      {showComplete && (
        <div className="popover">
          <ul role="listbox" id={`${listId}-list`}>
            {complete.map((r, i) => (
              <li key={r[1]} role="option" id={`${listId}-opt-${i}`} aria-selected={i === active} className="option-li">
                <button type="button" className="option" aria-selected={i === active} onMouseDown={(e) => e.preventDefault()} onClick={() => void go(r[1])}>
                  <Article article={r[3]} />
                  <span className="word">{r[5]}</span>
                  <PosTag pos={r[2]} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showResult && (
        <div className="popover" role="region" aria-live="polite">
          {busy && <p className="note muted">{t('search.searching')}</p>}
          {result && !busy && (
            <>
              {result.suggestions.length > 0 && (
                <p className="note">
                  {result.suggestions.map((k) => (
                    <button key={k} type="button" className="btn ghost" onClick={() => void go(k)}>
                      {t('search.didYouMean', { word: entries[k]?.lemma ?? k.split('#')[0] })}
                    </button>
                  ))}
                </p>
              )}
              {result.keys.length > 1 && <p className="note muted">{t('search.chooseLemma')}</p>}
              {result.keys.length > 0 && <ul>{result.keys.map(row)}</ul>}
              {result.hint && <p className="note">{result.hint === 'scriptHint' ? t('search.scriptHint') : t('search.notFound', { q: result.query })}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
