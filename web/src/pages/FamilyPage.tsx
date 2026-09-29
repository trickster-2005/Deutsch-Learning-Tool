import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useI18n, useTitle } from '../i18n/i18n';
import { loadAffixes, loadFamily } from '../lib/data';
import {
  affixLookup, buildModel, defaultExpanded, matchedIds, nodeLevel, pruneKeep, visibleTree, type AffixLookup, type FamilyModel,
} from '../lib/family';
import { isEmpty, parseFilters, parseMode, writeFilters, type Filters, type Mode } from '../lib/filters';
import { levelIndex } from '../lib/levels';
import { isColorBy, useSettings } from '../lib/settings';
import { writeStore } from '../lib/storage';
import type { Family } from '../lib/types';
import { FamilyTree } from '../components/FamilyTree';
import { Outline, NodeChip } from '../components/Outline';
import { CompoundPanel } from '../components/CompoundPanel';
import { DetailPanel } from '../components/DetailPanel';
import { FilterChips, FilterPanel } from '../components/FilterPanel';
import { Legend } from '../components/Legend';
import { Article, Gloss, Word } from '../components/Word';

const isWide = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

function HelpButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="rel" ref={ref}>
      <button type="button" className="btn icon-btn" aria-label={t('help.open')} title={t('help.open')} aria-expanded={open} onClick={() => setOpen((o) => !o)}>?</button>
      {open && (
        <div className="help-pop" role="dialog" aria-label={t('help.title')}>
          <p className="card-title">{t('help.title')}</p>
          <Legend />
          <p className="small" style={{ marginBottom: 0 }}><Link to="/how-it-works">{t('help.more')}</Link></p>
        </div>
      )}
    </div>
  );
}

export function FamilyPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { t } = useI18n();
  const settings = useSettings();
  const [family, setFamily] = useState<Family | null>(null);
  const [error, setError] = useState(false);
  const [lk, setLk] = useState<AffixLookup>(() => affixLookup(null));
  const [view, setView] = useState<'tree' | 'outline'>(() => (isWide() ? 'tree' : 'outline'));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(isWide());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialFocus, setInitialFocus] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState<Set<string>>(new Set());

  const filters = useMemo(() => parseFilters(params), [params]);
  const mode = parseMode(params);
  const colorParam = params.get('colorBy');
  const colorBy = isColorBy(colorParam) ? colorParam : settings.colorBy;
  const listSort = params.get('sort') === 'stars' ? 'stars' : 'level';
  const filtered = !isEmpty(filters);

  useEffect(() => {
    loadAffixes().then((a) => setLk(affixLookup(a))).catch(() => {});
  }, []);

  // load family
  useEffect(() => {
    let live = true;
    setFamily(null);
    setError(false);
    loadFamily(id)
      .then((f) => {
        if (!live) return;
        setFamily(f);
        writeStore('gwf.lastFamily', id);
      })
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [id]);

  const model: FamilyModel | null = useMemo(() => (family ? buildModel(family) : null), [family]);
  const focusKey = params.get('focus');

  // selection & initial focus when the family or an external focus (search, link) changes;
  // clicks inside the tree also write `focus` but must not re-centre the view
  const internalFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!model) return;
    if (focusKey && focusKey === internalFocus.current) return;
    const n = focusKey ? model.byKey.get(focusKey) ?? model.byKey.get(focusKey.split('#')[0]) : undefined;
    const fid = n?.id ?? null;
    setInitialFocus(fid);
    setSelectedId(fid ?? model.rootId);
  }, [model, focusKey]);

  const matched = useMemo(
    () => (model && filtered ? matchedIds(model, filters, lk, settings.levelSource) : null),
    [model, filters, filtered, lk, settings.levelSource],
  );

  // (re)compute default expansion when family, focus or filters change
  useEffect(() => {
    if (!model) return;
    setExpanded(defaultExpanded(model, initialFocus, mode === 'dim' ? matched : null));
    setShowAll(new Set());
  }, [model, initialFocus, matched, mode]);

  const keep = useMemo(() => (model && matched && mode === 'prune' ? pruneKeep(model.parent, matched) : null), [model, matched, mode]);
  const visible = useMemo(() => {
    if (!model) return null;
    let exp = expanded;
    if (keep) exp = new Set([...expanded, ...keep]);
    // make sure the selected node's ancestors are open
    return visibleTree(model, exp, showAll, keep);
  }, [model, expanded, showAll, keep]);

  const rootNode = model?.byId.get(model.rootId);
  useTitle(rootNode ? rootNode.lemma : '');

  const setFilters = (f: Filters) => setParams(writeFilters(params, f), { replace: true });
  const setMode = (m: Mode) => {
    const p = new URLSearchParams(params);
    if (m === 'dim') p.delete('mode');
    else p.set('mode', m);
    setParams(p, { replace: true });
  };
  const select = (nid: string) => {
    setSelectedId(nid);
    setDetailOpen(true);
    const n = model?.byId.get(nid);
    if (n) {
      internalFocus.current = n.key;
      const p = new URLSearchParams(params);
      p.set('focus', n.key);
      setParams(p, { replace: true });
    }
  };
  const toggle = (nid: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(nid)) n.delete(nid);
      else n.add(nid);
      return n;
    });
  const more = (pid: string) => setShowAll((s) => new Set([...s, pid]));

  if (error) {
    return (
      <main className="page" id="main">
        <p className="error">{t('family.notFound')}</p>
        <Link to="/">{t('family.back')}</Link>
      </main>
    );
  }
  if (!model || !visible || !rootNode) return <p className="loading">{t('common.loading')}</p>;

  const treeProps = {
    model, visible, matched, mode: (mode === 'prune' ? 'prune' : 'dim') as 'dim' | 'prune', colorBy, myLevel: settings.myLevel,
    levelSource: settings.levelSource, focusId: initialFocus, selectedId, onSelect: select, onToggle: toggle, onShowMore: more,
  };

  const listItems = mode === 'list'
    ? model.family.nodes
        .filter((n) => !matched || matched.has(n.id!))
        .sort((a, b) =>
          listSort === 'stars'
            ? b.stars - a.stars || b.zipf - a.zipf
            : levelIndex(nodeLevel(a, settings.levelSource)) - levelIndex(nodeLevel(b, settings.levelSource)) || b.zipf - a.zipf,
        )
    : [];

  return (
    <div className={`family-layout ${detailOpen ? '' : 'no-detail'}`}>
      <aside className={`filters-drawer ${filtersOpen ? '' : 'closed'}`} aria-label={t('filter.title')} aria-hidden={!filtersOpen}>
        {filtersOpen && <FilterPanel filters={filters} onChange={setFilters} mode={mode} onMode={setMode} onClose={() => setFiltersOpen(false)} />}
      </aside>
      <main className="family-main" id="main" tabIndex={-1}>
        <div className="family-head">
          <h1>
            <Article article={rootNode.article} />
            <Word seg={rootNode.seg} display={rootNode.display} />
          </h1>
          <span className="small muted">
            {matched ? t('filter.matches', { n: matched.size, total: model.family.nodes.length }) : t('family.words', { n: model.family.nodes.length })}
          </span>
          <span className="spacer" />
          <button type="button" className="btn" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((o) => !o)}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 2h12L8.5 7.5V12l-3-1.5v-3Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            {t('filter.title')}
          </button>
          {mode !== 'list' && (
            <div className="seg-group" role="group" aria-label={t('view.label')}>
              <button type="button" className="seg-btn" aria-pressed={view === 'tree'} onClick={() => setView('tree')}>{t('view.tree')}</button>
              <button type="button" className="seg-btn" aria-pressed={view === 'outline'} onClick={() => setView('outline')}>{t('view.outline')}</button>
            </div>
          )}
          <HelpButton />
        </div>
        {filtered && (
          <div className="chipbar" aria-label={t('filter.title')}>
            <FilterChips filters={filters} onChange={setFilters} />
            <button type="button" className="btn ghost small" onClick={() => setFilters(parseFilters(new URLSearchParams()))}>{t('filter.clear')}</button>
          </div>
        )}

        {mode === 'list' ? (
          <>
            <div className="toolbar" style={{ padding: '8px 16px 0' }}>
              <label htmlFor="list-sort" className="small">{t('list.sort')}</label>
              <select id="list-sort" value={listSort} onChange={(e) => { const p = new URLSearchParams(params); p.set('sort', e.target.value); setParams(p, { replace: true }); }}>
                <option value="level">{t('list.byLevel')}</option>
                <option value="stars">{t('list.byStars')}</option>
              </select>
            </div>
            {listItems.length ? (
              <ul className="word-list">
                {listItems.map((n) => (
                  <li key={n.id}>
                    <button type="button" onClick={() => select(n.id!)} aria-current={n.id === selectedId}>
                      <NodeChip n={n} level={nodeLevel(n, settings.levelSource)} custom={!!n.custom_level && settings.levelSource === 'custom'} />
                      <Gloss en={n.gloss_en} zh={n.gloss_zh} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="loading">{t('browse.empty')}</p>
            )}
          </>
        ) : view === 'tree' ? (
          <FamilyTree {...treeProps} />
        ) : (
          <Outline {...treeProps} />
        )}

        <CompoundPanel
          asModifier={model.family.compounds.as_modifier}
          asHead={model.family.compounds.as_head}
          parts={model.family.compound_parts}
          filters={filters}
          levelSource={settings.levelSource}
          myLevel={settings.myLevel}
        />
        <footer className="site">{t('footer.data')}</footer>
      </main>
      {detailOpen && (
        <aside className="detail-panel" aria-label={t('detail.title')}>
          <DetailPanel model={model} selectedId={selectedId} levelSource={settings.levelSource} onClose={() => setDetailOpen(false)} onSelect={select} />
        </aside>
      )}
    </div>
  );
}
