import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n, useTitle } from '../i18n/i18n';
import { loadAffixes, loadBrowse, loadFamiliesIndex, loadMeta } from '../lib/data';
import { isEmpty, matches, parseFilters, writeFilters, type Candidate, type Filters } from '../lib/filters';
import { LEVELS, levelIndex } from '../lib/levels';
import { useSettings } from '../lib/settings';
import { normForm } from '../lib/text';
import type { AffixRow, BrowseRow, FamilyIndexRow } from '../lib/types';
import { FilterPanel, OPTIONS } from '../components/FilterPanel';
import { Article, Gloss, LevelBadge } from '../components/Word';

type Tab = 'families' | 'affix' | 'formation' | 'compounds';
const TABS: Tab[] = ['families', 'affix', 'formation', 'compounds'];
const TAB_LABEL: Record<Tab, string> = {
  families: 'browse.tab.families', affix: 'browse.tab.affixes', formation: 'browse.tab.formation', compounds: 'browse.tab.compounds',
};
const PAGE = 50;
const LINKS = ['s', 'es', 'n', 'en', 'er', 'e', 'ens', 'ns', 'none'];

function rowLevel(r: BrowseRow, source: 'estimated' | 'custom') {
  return source === 'custom' && r.cl2 ? r.cl2 : r.l;
}

function rowCandidate(r: BrowseRow, source: 'estimated' | 'custom'): Candidate {
  return {
    level: rowLevel(r, source), pos: r.p, gender: r.g, plural: r.pl, conj: r.cj, pt: r.pt, aux: r.ax, refl: !!r.rf,
    dual: r.dual, topics: r.t, stars: r.s, uncertain: !!r.u,
    st: r.pk ? r.st ?? 'other' : null, pc: r.pc ?? null, vc: r.pk ? r.vc ?? 'other' : null, affixes: r.af ?? [],
  };
}

function RowWord({ r, source }: { r: BrowseRow; source: 'estimated' | 'custom' }) {
  return (
    <Link to={`/family/${r.f}?focus=${encodeURIComponent(r.k)}`} className="pair" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Article article={r.a} />
      <span className="word" lang="de">{r.d}</span>
      <LevelBadge level={rowLevel(r, source)} custom={source === 'custom' && !!r.cl2} />
    </Link>
  );
}

function Pager({ page, total, onPage }: { page: number; total: number; onPage(p: number): void }) {
  const { t } = useI18n();
  const pages = Math.max(1, Math.ceil(total / PAGE));
  if (pages <= 1) return null;
  return (
    <div className="pager">
      <button type="button" className="btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>{t('browse.prev')}</button>
      <span className="small">{t('browse.page', { n: page, m: pages })}</span>
      <button type="button" className="btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>{t('browse.next')}</button>
    </div>
  );
}

function Empty() {
  const { t } = useI18n();
  return <p className="muted">{t('browse.empty')}</p>;
}

// ------------------------------------------------------------------ families
function FamiliesTab({ rows, byKey, matched, filtered, params, setParam }: TabProps) {
  const { t } = useI18n();
  const { levelSource } = useSettings();
  const [index, setIndex] = useState<FamilyIndexRow[] | null>(null);
  useEffect(() => {
    loadFamiliesIndex().then(setIndex).catch(() => setIndex([]));
  }, []);
  const sort = params.get('sort') ?? 'level';
  const min = Math.max(1, Number(params.get('min')) || 1);
  const page = Math.max(1, Number(params.get('page')) || 1);

  const list = useMemo(() => {
    if (!index) return [];
    const counts = new Map<string, number>();
    const byFam = new Map<string, BrowseRow[]>();
    for (const r of rows) {
      if (r.x) continue;
      if (!byFam.has(r.f)) byFam.set(r.f, []);
      byFam.get(r.f)!.push(r);
      if (!filtered || matched.has(r.k)) counts.set(r.f, (counts.get(r.f) ?? 0) + 1);
    }
    const out = index
      .filter((f) => (counts.get(f.id) ?? 0) >= (filtered ? min : 1))
      .map((f) => {
        const members = byFam.get(f.id) ?? [];
        const lv: Record<string, number> = {};
        let minLevel = 'beyond';
        for (const m of members) {
          const l = rowLevel(m, levelSource);
          lv[l] = (lv[l] ?? 0) + 1;
          if (levelIndex(l) < levelIndex(minLevel)) minLevel = l;
        }
        return { f, root: byKey.get(f.root_key), lv, minLevel, matches: counts.get(f.id) ?? 0 };
      });
    out.sort((a, b) => {
      if (sort === 'size') return b.f.size - a.f.size || a.f.root_lemma.localeCompare(b.f.root_lemma, 'de');
      if (sort === 'alpha') return a.f.root_lemma.localeCompare(b.f.root_lemma, 'de');
      return levelIndex(a.minLevel) - levelIndex(b.minLevel) || b.f.size - a.f.size;
    });
    return out;
  }, [index, rows, byKey, matched, filtered, min, sort, levelSource]);

  if (!index) return <p className="loading">{t('common.loading')}</p>;
  const shown = list.slice((page - 1) * PAGE, page * PAGE);
  return (
    <>
      <div className="toolbar">
        <label htmlFor="fam-sort" className="small">{t('browse.sort')}</label>
        <select id="fam-sort" value={sort} onChange={(e) => setParam({ sort: e.target.value, page: null })}>
          <option value="level">{t('browse.sort.level')}</option>
          <option value="size">{t('browse.sort.size')}</option>
          <option value="alpha">{t('browse.sort.alpha')}</option>
        </select>
        <span className="small muted">{t('browse.results', { n: list.length.toLocaleString() })}</span>
      </div>
      {shown.length === 0 ? <Empty /> : (
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>{t('browse.col.root')}</th>
                <th>{t('browse.col.meaning')}</th>
                <th>{t('browse.col.minLevel')}</th>
                <th>{t('browse.col.size')}</th>
                <th>{t('browse.col.levels')}</th>
                <th>{t('browse.col.compounds')}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ f, root, lv, minLevel, matches: n }) => (
                <tr key={f.id}>
                  <td>
                    <Link to={`/family/${f.id}${filtered ? `?${writeFilters(new URLSearchParams(), parseFilters(params)).toString()}` : ''}`} className="pair" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Article article={root?.a} />
                      <span className="word" lang="de">{root?.d ?? f.root_lemma}</span>
                    </Link>
                  </td>
                  <td><Gloss en={root?.ge ?? ''} zh={root?.gz ?? ''} /></td>
                  <td><LevelBadge level={minLevel} /></td>
                  <td>{filtered ? `${n} / ${f.size}` : f.size}</td>
                  <td>
                    <span className="minibar" title={LEVELS.filter((l) => lv[l]).map((l) => `${l}: ${lv[l]}`).join(', ')}>
                      {LEVELS.filter((l) => lv[l]).map((l) => (
                        <span key={l} className={`bg-lvl-${l}`} style={{ width: `${(100 * lv[l]) / Math.max(1, Object.values(lv).reduce((a, b) => a + b, 0))}%` }} />
                      ))}
                    </span>
                  </td>
                  <td>{f.compound_count || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} total={list.length} onPage={(p) => setParam({ page: String(p) })} />
    </>
  );
}

// ------------------------------------------------------------------ affixes
function AffixTab({ rows, byKey, matched, filtered, params, setParam }: TabProps) {
  const { t, lang } = useI18n();
  const { levelSource } = useSettings();
  const [affixes, setAffixes] = useState<{ prefixes: AffixRow[]; suffixes: AffixRow[] } | null>(null);
  useEffect(() => {
    loadAffixes().then(setAffixes).catch(() => {});
  }, []);
  const sel = params.get('a');
  const page = Math.max(1, Number(params.get('page')) || 1);
  const groups = useMemo(() => {
    const g: Record<string, AffixRow[]> = { separable: [], inseparable: [], dual: [], nominal: [], suffix: [] };
    for (const p of affixes?.prefixes ?? []) if (p.count > 0) (g[p.kind ?? 'nominal'] ?? g.nominal).push(p);
    for (const s of affixes?.suffixes ?? []) if (s.count > 0) g.suffix.push(s);
    return g;
  }, [affixes]);
  const row = [...(affixes?.prefixes ?? []), ...(affixes?.suffixes ?? [])].find((r) => r.affix === sel);
  const words = useMemo(
    () => (sel ? rows.filter((r) => !r.x && r.af?.includes(sel) && (!filtered || matched.has(r.k))).sort((a, b) => b.z - a.z) : []),
    [rows, sel, matched, filtered],
  );
  const shown = words.slice((page - 1) * PAGE, page * PAGE);
  const isDual = row?.kind === 'dual';
  const sepEx = isDual ? words.filter((r) => r.pt === 'separable').slice(0, 6) : [];
  const insepEx = isDual ? words.filter((r) => r.pt === 'inseparable').slice(0, 6) : [];
  return (
    <>
      <div className="affix-groups">
        {Object.entries(groups).map(([kind, list]) =>
          list.length ? (
            <fieldset className="fgroup" key={kind}>
              <legend>{t(`affixKind.${kind}`)}</legend>
              <div className="opts">
                {list.map((a) => (
                  <button key={a.affix} type="button" className="btn small" aria-pressed={sel === a.affix} onClick={() => setParam({ a: a.affix, page: null })} lang="de">
                    {a.affix} <span className="muted small">{a.count}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null,
        )}
      </div>
      {!sel && <p className="muted">{t('browse.chooseAffix')}</p>}
      {sel && (
        <>
          <h2 lang="de">{t('browse.affixWords', { affix: sel })}</h2>
          {row && (row.meaning_en || row.meaning_zh) && <p>{lang === 'zh-Hant' ? row.meaning_zh : row.meaning_en}</p>}
          {isDual && (sepEx.length > 0 || insepEx.length > 0) && (
            <div className="card">
              <p className="card-title">{t('browse.dualCompare')}</p>
              <div className="two-col">
                <div>
                  <p className="small muted">{t('browse.dualSep')}</p>
                  <ul className="clist">{sepEx.map((r) => <li key={r.k}><RowWord r={r} source={levelSource} /> <Gloss en={r.ge} zh={r.gz} /></li>)}</ul>
                </div>
                <div>
                  <p className="small muted">{t('browse.dualInsep')}</p>
                  <ul className="clist">{insepEx.map((r) => <li key={r.k}><RowWord r={r} source={levelSource} /> <Gloss en={r.ge} zh={r.gz} /></li>)}</ul>
                </div>
              </div>
            </div>
          )}
          <p className="small muted">{t('browse.results', { n: words.length })}</p>
          {shown.length === 0 ? <Empty /> : (
            <div className="table-scroll">
              <table className="data">
                <thead><tr><th>{t('browse.col.word')}</th><th>{t('browse.col.parent')}</th><th>{t('browse.col.meaning')}</th></tr></thead>
                <tbody>
                  {shown.map((r) => {
                    const p = r.pk ? byKey.get(r.pk) : undefined;
                    return (
                      <tr key={r.k}>
                        <td><RowWord r={r} source={levelSource} /></td>
                        <td>{p && <span className="word" lang="de">{p.d}</span>}</td>
                        <td><Gloss en={r.ge} zh={r.gz} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pager page={page} total={words.length} onPage={(p) => setParam({ page: String(p) })} />
        </>
      )}
    </>
  );
}

// ------------------------------------------------------------------ formation
function FormationTab({ rows, byKey, matched, filtered, params, setParam }: TabProps) {
  const { t } = useI18n();
  const { levelSource } = useSettings();
  const [posChanges, setPosChanges] = useState<string[]>([]);
  useEffect(() => {
    loadMeta().then((m) => setPosChanges(m.pos_changes)).catch(() => {});
  }, []);
  const pattern = params.get('pattern') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pairs = useMemo(() => {
    if (!pattern) return [];
    const [kind, val] = pattern.split(':');
    return rows
      .filter((r) => r.pk && !r.x && (!filtered || matched.has(r.k)))
      .filter((r) => (kind === 'st' ? (r.st ?? 'other') === val : kind === 'pc' ? r.pc === val : kind === 'vc' ? !!r.vc : false))
      .sort((a, b) => b.z - a.z);
  }, [rows, pattern, matched, filtered]);
  const shown = pairs.slice((page - 1) * PAGE, page * PAGE);
  return (
    <>
      <div className="toolbar">
        <label htmlFor="pattern" className="small">{t('browse.chooseFormation')}</label>
        <select id="pattern" value={pattern.startsWith('vc') ? '' : pattern} onChange={(e) => setParam({ pattern: e.target.value || null, page: null })}>
          <option value="">—</option>
          <optgroup label={t('browse.bySemantic')}>
            {OPTIONS.st.map((s) => <option key={s} value={`st:${s}`}>{t(`sem.${s}`)}</option>)}
          </optgroup>
          <optgroup label={t('browse.byPosChange')}>
            {posChanges.map((p) => <option key={p} value={`pc:${p}`}>{p.replace('>', ' → ')}</option>)}
          </optgroup>
        </select>
        <button type="button" className="btn" aria-pressed={pattern.startsWith('vc')} onClick={() => setParam({ pattern: 'vc:any', page: null })}>{t('browse.vowelView')}</button>
        {pattern && <span className="small muted">{t('browse.results', { n: pairs.length })}</span>}
      </div>
      {pattern && (shown.length === 0 ? <Empty /> : (
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>{t('browse.col.parent')}</th><th /><th>{t('browse.col.child')}</th><th>{t('filter.formation')}</th><th>{t('browse.col.meaning')}</th></tr></thead>
            <tbody>
              {shown.map((r) => {
                const p = byKey.get(r.pk!);
                return (
                  <tr key={r.k}>
                    <td>{p ? <><Article article={p.a} /><span className="word" lang="de">{p.d}</span></> : r.pk}</td>
                    <td aria-hidden="true">→</td>
                    <td><RowWord r={r} source={levelSource} /></td>
                    <td className="small">
                      {(r.af ?? []).join(' + ')}
                      {r.st && <> {t(`sem.${r.st}`)}</>}
                      {r.vc && <> · {t(r.vc === 'umlaut' ? 'tree.umlaut' : 'tree.ablaut')}</>}
                    </td>
                    <td><Gloss en={r.ge} zh={r.gz} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
      <Pager page={page} total={pairs.length} onPage={(p) => setParam({ page: String(p) })} />
    </>
  );
}

// ------------------------------------------------------------------ compounds
function CompoundsTab({ rows, byKey, matched, filtered, params, setParam }: TabProps) {
  const { t } = useI18n();
  const { levelSource } = useSettings();
  const part = params.get('part') ?? '';
  const link = params.get('link') ?? '';
  const [input, setInput] = useState(part);
  const page = Math.max(1, Number(params.get('page')) || 1);
  const compounds = useMemo(() => rows.filter((r) => r.cp && (!filtered || matched.has(r.k))), [rows, matched, filtered]);
  const partOptions = useMemo(() => {
    const n = new Map<string, number>();
    for (const r of rows) for (const p of r.cp ?? []) n.set(p, (n.get(p) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  }, [rows]);
  const resolvedPart = useMemo(() => {
    if (!part) return '';
    const np = normForm(part);
    return partOptions.find((p) => normForm(p.split('#')[0]) === np) ?? part;
  }, [part, partOptions]);
  const asMod = resolvedPart ? compounds.filter((r) => r.cp!.slice(0, -1).includes(resolvedPart)).sort((a, b) => b.z - a.z) : [];
  const asHead = resolvedPart ? compounds.filter((r) => r.cp![r.cp!.length - 1] === resolvedPart).sort((a, b) => b.z - a.z) : [];
  const byLink = link
    ? compounds.filter((r) => (link === 'none' ? (r.cl ?? []).every((l) => !l) : (r.cl ?? []).includes(link))).sort((a, b) => b.z - a.z)
    : [];
  const list = (items: BrowseRow[], title: string) => (
    <section>
      <h3>{title} <span className="small muted">({items.length})</span></h3>
      {items.length === 0 ? <Empty /> : (
        <ul className="clist">
          {items.slice(0, 200).map((r) => (
            <li key={r.k}><RowWord r={r} source={levelSource} /> <Gloss en={r.ge} zh={r.gz} /></li>
          ))}
        </ul>
      )}
    </section>
  );
  const shownLink = byLink.slice((page - 1) * PAGE, page * PAGE);
  return (
    <>
      <form className="toolbar" onSubmit={(e) => { e.preventDefault(); setParam({ part: input.trim() || null, link: null, page: null }); }}>
        <label htmlFor="cpart" className="small">{t('browse.choosePart')}</label>
        <input id="cpart" type="search" lang="de" list="cpart-list" value={input} onChange={(e) => setInput(e.target.value)} />
        <datalist id="cpart-list">{partOptions.slice(0, 400).map((p) => <option key={p} value={p.split('#')[0]} />)}</datalist>
        <button type="submit" className="btn primary">{t('search.submit')}</button>
      </form>
      <fieldset className="fgroup">
        <legend>{t('browse.byLink')}</legend>
        <p className="small muted" style={{ margin: '0 0 6px' }}>{t('browse.linkHint')}</p>
        <div className="opts">
          {LINKS.map((l) => (
            <button key={l} type="button" className="btn small" aria-pressed={link === l} onClick={() => setParam({ link: l, part: null, page: null })} lang="de">
              {l === 'none' ? t('browse.linkNone') : `-${l}-`}
            </button>
          ))}
        </div>
      </fieldset>
      {resolvedPart && (
        <div className="two-col">
          {list(asMod, t('compounds.asModifier'))}
          {list(asHead, t('compounds.asHead'))}
        </div>
      )}
      {link && (
        <>
          <p className="small muted">{t('browse.results', { n: byLink.length })}</p>
          <div className="table-scroll">
            <table className="data">
              <thead><tr><th>{t('browse.col.word')}</th><th>{t('detail.parts')}</th><th>{t('browse.col.meaning')}</th></tr></thead>
              <tbody>
                {shownLink.map((r) => (
                  <tr key={r.k}>
                    <td><RowWord r={r} source={levelSource} /></td>
                    <td className="small" lang="de">
                      {(r.cp ?? []).map((p, i) => (
                        <span key={i}>
                          {i > 0 && ' + '}
                          {byKey.get(p)?.d ?? p.split('#')[0]}
                          {r.cl?.[i] ? <span className="m-LINK"> (-{r.cl[i]}-)</span> : null}
                        </span>
                      ))}
                    </td>
                    <td><Gloss en={r.ge} zh={r.gz} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={page} total={byLink.length} onPage={(p) => setParam({ page: String(p) })} />
        </>
      )}
    </>
  );
}

// ------------------------------------------------------------------ page
interface TabProps {
  rows: BrowseRow[];
  byKey: Map<string, BrowseRow>;
  matched: Set<string>;
  filtered: boolean;
  params: URLSearchParams;
  setParam(p: Record<string, string | null>): void;
}

export default function BrowsePage() {
  const { t } = useI18n();
  const { levelSource } = useSettings();
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState<BrowseRow[] | null>(null);
  const [error, setError] = useState(false);
  useTitle(t('browse.title'));
  useEffect(() => {
    loadBrowse().then(setRows).catch(() => setError(true));
  }, []);
  const tabParam = params.get('tab') as Tab | null;
  const tab: Tab = tabParam && TABS.includes(tabParam) ? tabParam : 'families';
  const filters = useMemo(() => parseFilters(params), [params]);
  const filtered = !isEmpty(filters);
  const byKey = useMemo(() => new Map((rows ?? []).map((r) => [r.k, r])), [rows]);
  const matched = useMemo(() => {
    const s = new Set<string>();
    if (!rows || !filtered) return s;
    for (const r of rows) if (matches(rowCandidate(r, levelSource), filters)) s.add(r.k);
    return s;
  }, [rows, filters, filtered, levelSource]);

  const setParam = (p: Record<string, string | null>) => {
    const n = new URLSearchParams(params);
    for (const [k, v] of Object.entries(p)) {
      if (v === null || v === '') n.delete(k);
      else n.set(k, v);
    }
    setParams(n, { replace: true });
  };
  const setFilters = (f: Filters) => {
    const n = writeFilters(params, f);
    n.delete('page');
    setParams(n, { replace: true });
  };
  const setTab = (tb: Tab) => {
    const n = writeFilters(new URLSearchParams(), filters);
    n.set('tab', tb);
    setParams(n);
  };

  let body: ReactNode = null;
  if (error) body = <p className="error">{t('common.error')}</p>;
  else if (!rows) body = <p className="loading">{t('browse.loading')}</p>;
  else {
    const props: TabProps = { rows, byKey, matched, filtered, params, setParam };
    body = tab === 'families' ? <FamiliesTab {...props} /> : tab === 'affix' ? <AffixTab {...props} /> : tab === 'formation' ? <FormationTab {...props} /> : <CompoundsTab {...props} />;
  }

  return (
    <main className="page" id="main" tabIndex={-1}>
      <h1>{t('browse.title')}</h1>
      <div className="tabs" role="tablist" aria-label={t('browse.title')}>
        {TABS.map((tb) => (
          <button key={tb} type="button" role="tab" id={`tab-${tb}`} aria-selected={tab === tb} aria-controls="browse-panel" onClick={() => setTab(tb)}>
            {t(TAB_LABEL[tb])}
          </button>
        ))}
      </div>
      <div className="browse-layout">
        <aside aria-label={t('filter.title')}>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            extra={tab === 'families' ? (
              <fieldset className="fgroup">
                <legend><label htmlFor="min-matches">{t('filter.minMatches', { n: params.get('min') || 1 })}</label></legend>
                <input id="min-matches" type="range" min={1} max={20} value={Number(params.get('min')) || 1} onChange={(e) => setParam({ min: e.target.value === '1' ? null : e.target.value, page: null })} style={{ width: '100%' }} />
              </fieldset>
            ) : undefined}
          />
        </aside>
        <section id="browse-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {body}
        </section>
      </div>
    </main>
  );
}

