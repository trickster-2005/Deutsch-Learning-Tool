import { useI18n } from '../i18n/i18n';
import { levelGroup } from '../lib/levels';
import { nodeLevel, type VisibleNode } from '../lib/family';
import { fillToken } from '../lib/tokens';
import type { WordSummary } from '../lib/types';
import type { TreeViewProps } from './FamilyTree';
import { edgeLabel } from './FamilyTree';
import { Article, LevelBadge, PosTag, Word } from './Word';

export function NodeChip({ n, level, custom }: { n: WordSummary; level: string; custom: boolean }) {
  return (
    <>
      <Article article={n.article} />
      <Word seg={n.seg} display={n.display} uncertain={n.uncertain} />
      <LevelBadge level={level} custom={custom} />
      <PosTag pos={n.pos} />
    </>
  );
}

/** Indented list view of the same visible hierarchy (default under 768px). */
export function Outline(props: TreeViewProps) {
  const { model, visible, matched, mode, colorBy, myLevel, levelSource, focusId, selectedId, onSelect, onToggle, onShowMore } = props;
  const { t } = useI18n();

  const render = (v: VisibleNode, depth: number) => {
    if (v.kind === 'more') {
      return (
        <li key={v.id} role="treeitem" aria-level={depth + 1}>
          <div className="o-row">
            <button type="button" className="btn ghost small" onClick={() => onShowMore(v.parentId!)}>
              {t('tree.showMore', { n: v.hiddenCount ?? 0 })}
            </button>
          </div>
        </li>
      );
    }
    const n = model.byId.get(v.id)!;
    const level = nodeLevel(n, levelSource);
    const group = levelGroup(level, myLevel);
    let opacity = 1;
    if (matched && !matched.has(v.id)) opacity = mode === 'prune' ? 0.4 : 0.25;
    if (group === 'above') opacity = Math.min(opacity, 0.5);
    const e = model.edgeTo.get(v.id);
    const label = edgeLabel(e, t);
    const cls = ['o-node', `bg-${fillToken(colorBy, { level, pos: n.pos, gender: n.gender })}`];
    if (n.path) cls.push('path-node');
    if (group === 'next') cls.push('next');
    if (v.id === selectedId) cls.push('selected');
    if (v.id === focusId) cls.push('focus');
    return (
      <li key={v.id} role="treeitem" aria-level={depth + 1} aria-expanded={v.childCount ? !v.collapsed : undefined} aria-selected={v.id === selectedId}>
        <div className="o-row">
          {!!v.childCount && (
            <button type="button" className="o-toggle" onClick={() => onToggle(v.id)} aria-label={v.collapsed ? t('tree.expand') : t('tree.collapse')}>
              {v.collapsed ? '+' : '−'}
            </button>
          )}
          {label && <span className="o-edge">{label} →</span>}
          <button type="button" className={cls.join(' ')} style={{ opacity }} onClick={() => onSelect(v.id)} title={n.path ? t('tree.pathNode') : undefined}>
            <NodeChip n={n} level={level} custom={!!n.custom_level && levelSource === 'custom'} />
            {group === 'next' && <span className="next-tag">{t('level.next')}</span>}
            {v.collapsed && <span className="small muted">+{v.childCount}</span>}
          </button>
        </div>
        {v.children.length > 0 && <ul role="group">{v.children.map((c) => render(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <nav className="outline" aria-label={t('tree.label', { word: model.byId.get(model.rootId)!.lemma })}>
      <ul role="tree">{render(visible, 0)}</ul>
    </nav>
  );
}
