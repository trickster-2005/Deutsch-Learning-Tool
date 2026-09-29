import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { hierarchy, tree as d3tree, type HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, zoomTransform, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { useI18n } from '../i18n/i18n';
import type { ColorBy } from '../lib/settings';
import { fillToken } from '../lib/tokens';
import { levelGroup } from '../lib/levels';
import { flattenVisible, nodeLevel, type FamilyModel, type VisibleNode } from '../lib/family';
import type { Edge, WordSummary } from '../lib/types';
import { wordTokens } from './Word';

export interface TreeViewProps {
  model: FamilyModel;
  visible: VisibleNode;
  matched: Set<string> | null; // null = no filter active
  mode: 'dim' | 'prune';
  colorBy: ColorBy;
  myLevel: string | null;
  levelSource: 'estimated' | 'custom';
  focusId: string | null;
  selectedId: string | null;
  onSelect(id: string): void;
  onToggle(id: string): void;
  onShowMore(parentId: string): void;
}

const ROW = 56;
const NODE_H = 42;
const COL_GAP = 170;
const PAD_X = 10;

let canvas: HTMLCanvasElement | null = null;
function measure(text: string, font: string): number {
  canvas = canvas ?? document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.length * 9;
  ctx.font = font;
  return ctx.measureText(text).width;
}
const WORD_FONT = '16px "PT Serif", Georgia, serif';
const META_FONT = '10.5px "IBM Plex Sans", sans-serif';
const ART_FONT = '600 12px "IBM Plex Sans", sans-serif';

/** 200ms eased zoom/pan (spec 14: animation only for expand, collapse and focus). */
function animateTo(svg: SVGSVGElement, z: ZoomBehavior<SVGSVGElement, unknown>, to: ZoomTransform, ms = 200) {
  const sel = select(svg);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || ms <= 0) {
    sel.call(z.transform, to);
    return;
  }
  const from = zoomTransform(svg);
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / ms);
    const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
    const k = from.k + (to.k - from.k) * e;
    const x = from.x + (to.x - from.x) * e;
    const y = from.y + (to.y - from.y) * e;
    sel.call(z.transform, zoomIdentity.translate(x, y).scale(k));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export interface Bounds { minX: number; maxX: number; minY: number; maxY: number }

export const FIT = { padX: 24, padTop: 12, padBottom: 32, minScale: 0.35, maxScale: 1.2, focusMargin: 40 };

/**
 * Default canvas transform: scale so the whole tree fits the canvas
 * (clamped to [minScale, maxScale]), left-aligned horizontally and centred
 * vertically. When the tree is too big to fit at minScale, the focused word
 * is kept inside the visible area.
 */
export function fitTransform(
  b: Bounds, width: number, height: number, focus: { x: number; y: number; w: number } | null,
): { k: number; x: number; y: number } {
  const availW = width - 2 * FIT.padX;
  const availH = height - FIT.padTop - FIT.padBottom;
  const k = Math.max(FIT.minScale, Math.min(FIT.maxScale, availW / (b.maxX - b.minX), availH / (b.maxY - b.minY)));
  let x = FIT.padX - b.minX * k;
  let y = FIT.padTop + availH / 2 - ((b.minY + b.maxY) / 2) * k;
  if (focus) {
    const right = (focus.x + focus.w) * k + x;
    if (right > width - FIT.focusMargin) x -= right - (width - FIT.focusMargin);
    const fy = focus.y * k + y;
    if (fy < FIT.padTop + FIT.focusMargin) y += FIT.padTop + FIT.focusMargin - fy;
    if (fy > height - FIT.padBottom - FIT.focusMargin) y -= fy - (height - FIT.padBottom - FIT.focusMargin);
  }
  return { k, x, y };
}

export function edgeLabel(e: Edge | undefined, t: (k: string) => string): string {
  if (!e) return '';
  const aff = [...e.added_prefixes, ...e.added_suffixes].join(' + ');
  const parts: string[] = [];
  if (aff) parts.push(aff);
  if (e.semantic_type) parts.push(t(`sem.${e.semantic_type}`));
  if (e.vowel_change) parts.push(t(e.vowel_change === 'umlaut' ? 'tree.umlaut' : 'tree.ablaut'));
  return parts.join(' · ');
}

interface Box {
  id: string;
  kind: 'word' | 'more';
  x: number;
  y: number;
  w: number;
  depth: number;
  v: VisibleNode;
  n?: WordSummary;
}

export function FamilyTree(props: TreeViewProps) {
  const { model, visible, matched, mode, colorBy, myLevel, levelSource, focusId, selectedId, onSelect, onToggle, onShowMore } = props;
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [kbdId, setKbdId] = useState<string | null>(null);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true)).catch(() => setFontsReady(true));
  }, []);

  // ------------------------------------------------------------- layout
  const layout = useMemo(() => {
    const root = hierarchy<VisibleNode>(visible, (d) => d.children);
    d3tree<VisibleNode>().nodeSize([ROW, 1]).separation((a, b) => (a.parent === b.parent ? 1 : 1.15))(root);
    const nodes = root.descendants() as HierarchyPointNode<VisibleNode>[];
    const widths = new Map<string, number>();
    const colW: number[] = [];
    for (const d of nodes) {
      let w: number;
      if (d.data.kind === 'more') w = measure(t('tree.showMore').replace('{n}', String(d.data.hiddenCount)), '12px sans-serif') + 24;
      else {
        const n = model.byId.get(d.data.id)!;
        const art = n.article ? measure(n.article, ART_FONT) + 16 : 0;
        const meta = 40 + measure(t(`pos.${n.pos}`), META_FONT) + (levelGroup(nodeLevel(n, levelSource), myLevel) === 'next' ? 40 : 0);
        w = Math.max(art + measure(n.display, WORD_FONT), meta) + PAD_X * 2 + (d.data.childCount ? 12 : 0);
      }
      widths.set(d.data.id, w);
      colW[d.depth] = Math.max(colW[d.depth] ?? 0, w);
    }
    const colX: number[] = [0];
    for (let i = 1; i < colW.length; i++) colX[i] = colX[i - 1] + colW[i - 1] + COL_GAP;
    const boxes: Box[] = nodes.map((d) => ({
      id: d.data.id, kind: d.data.kind, x: colX[d.depth], y: d.x, w: widths.get(d.data.id)!, depth: d.depth, v: d.data,
      n: d.data.kind === 'word' ? model.byId.get(d.data.id) : undefined,
    }));
    const byId = new Map(boxes.map((b) => [b.id, b]));
    const links = nodes.filter((d) => d.parent).map((d) => ({ from: byId.get(d.parent!.data.id)!, to: byId.get(d.data.id)! }));
    const minY = Math.min(...boxes.map((b) => b.y)) - NODE_H;
    const maxY = Math.max(...boxes.map((b) => b.y)) + NODE_H;
    const maxX = Math.max(...boxes.map((b) => b.x + b.w));
    return { boxes, byId, links, bounds: { minX: -20, maxX: maxX + 20, minY, maxY } };
    // fontsReady re-measures once web fonts are loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, model, t, levelSource, myLevel, fontsReady]);

  // ------------------------------------------------------------- zoom
  // layout effect so the zoom behaviour exists before the initial fit below
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 2.5])
      .on('zoom', (ev) => gRef.current?.setAttribute('transform', ev.transform.toString()));
    zoomRef.current = z;
    select(svg).call(z).on('dblclick.zoom', null);
    return () => {
      select(svg).on('.zoom', null);
    };
  }, []);

  /** Default view (and the "fit" button): see `fitTransform`. */
  const fit = useCallback(
    (keepVisible: string | null = null, animate = true): boolean => {
      const svg = svgRef.current;
      const z = zoomRef.current;
      if (!svg || !z) return false;
      const { width, height } = svg.getBoundingClientRect();
      if (!width || !height) return false;
      const f = keepVisible ? layout.byId.get(keepVisible) : undefined;
      const { k, x, y } = fitTransform(layout.bounds, width, height, f ? { x: f.x, y: f.y, w: f.w } : null);
      animateTo(svg, z, zoomIdentity.translate(x, y).scale(k), animate ? 200 : 0);
      return true;
    },
    [layout],
  );

  const centerOn = useCallback(
    (id: string, animate = true) => {
      const svg = svgRef.current;
      const z = zoomRef.current;
      const b = layout.byId.get(id);
      if (!svg || !z || !b) return;
      const { width, height } = svg.getBoundingClientRect();
      const k = 1;
      const tr = zoomIdentity.translate(width / 2 - (b.x + b.w / 2) * k, height / 2 - b.y * k).scale(k);
      animateTo(svg, z, tr, animate ? 200 : 0);
    },
    [layout],
  );

  // default view: fit the whole tree (again once web fonts have changed node widths)
  const didInit = useRef<string | null>(null);
  useLayoutEffect(() => {
    const key = `${model.family.id}:${focusId}:${fontsReady}`;
    if (didInit.current === key) return;
    if (fit(focusId && layout.byId.has(focusId) ? focusId : null, false)) didInit.current = key;
  }, [model, focusId, layout, fit, fontsReady]);

  // ------------------------------------------------------------- keyboard
  const order = useMemo(() => flattenVisible(visible).filter((v) => v.kind === 'word' || v.kind === 'more'), [visible]);
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const cur = kbdId ?? selectedId ?? model.rootId;
    const idx = order.findIndex((v) => v.id === cur);
    const node = order[idx];
    let next: string | null = null;
    switch (e.key) {
      case 'ArrowDown':
        next = order[Math.min(order.length - 1, idx + 1)]?.id ?? null;
        break;
      case 'ArrowUp':
        next = order[Math.max(0, idx - 1)]?.id ?? null;
        break;
      case 'ArrowRight':
        if (node?.collapsed) onToggle(node.id);
        else next = node?.children[0]?.id ?? null;
        break;
      case 'ArrowLeft':
        if (node && node.children.length && node.kind === 'word') onToggle(node.id);
        else next = node?.parentId ?? null;
        break;
      case 'Enter':
        if (node?.kind === 'more') onShowMore(node.parentId!);
        else if (node) onSelect(node.id);
        break;
      case ' ':
        if (node?.kind === 'word' && node.childCount) onToggle(node.id);
        break;
      case 'Home':
        next = model.rootId;
        break;
      default:
        return;
    }
    e.preventDefault();
    if (next) {
      setKbdId(next);
      centerOn(next);
    }
  };

  // ------------------------------------------------------------- render
  const opacityOf = (id: string, n: WordSummary): number => {
    let o = 1;
    if (matched && !matched.has(id)) o = mode === 'prune' ? 0.4 : 0.25;
    const g = levelGroup(nodeLevel(n, levelSource), myLevel);
    if (g === 'above') o = Math.min(o, 0.5);
    return o;
  };
  const focusPath = useMemo(() => {
    const s = new Set<string>();
    let cur: string | null = selectedId;
    while (cur) {
      s.add(cur);
      cur = model.parent.get(cur) ?? null;
    }
    return s;
  }, [selectedId, model]);

  const rootWord = model.byId.get(model.rootId)!;
  return (
    <div className="tree-wrap">
      <div className="tree-tools">
        <button type="button" className="btn icon-btn" onClick={() => zoomRef.current && svgRef.current && select(svgRef.current).call(zoomRef.current.scaleBy, 1.25)} aria-label={t('tree.zoomIn')} title={t('tree.zoomIn')}>+</button>
        <button type="button" className="btn icon-btn" onClick={() => zoomRef.current && svgRef.current && select(svgRef.current).call(zoomRef.current.scaleBy, 0.8)} aria-label={t('tree.zoomOut')} title={t('tree.zoomOut')}>−</button>
        <button type="button" className="btn icon-btn" onClick={() => fit(selectedId)} aria-label={t('tree.reset')} title={t('tree.reset')}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
      </div>
      <svg
        ref={svgRef}
        className="tree-svg"
        role="tree"
        aria-label={t('tree.label', { word: rootWord.lemma })}
        aria-activedescendant={kbdId ? `tn-${kbdId}` : undefined}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => setKbdId((k) => k ?? selectedId ?? model.rootId)}
      >
        <g ref={gRef}>
          {layout.links.map(({ from, to }) => {
            const x1 = from.x + from.w;
            const y1 = from.y;
            const x2 = to.x;
            const y2 = to.y;
            const mx = (x1 + x2) / 2;
            const e = to.kind === 'word' ? model.edgeTo.get(to.id) : undefined;
            const label = edgeLabel(e, t);
            const hl = focusPath.has(to.id) && focusPath.has(from.id);
            const faded = to.n && matched && !matched.has(to.id);
            return (
              <g key={`${from.id}-${to.id}`} style={{ opacity: faded ? 0.35 : 1 }}>
                <path className={`t-link ${hl ? 'hl' : ''}`} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} />
                {label && (
                  <g transform={`translate(${x2 - 8},${y2 - 7})`}>
                    <text className="t-elabel" textAnchor="end">
                      {label.length > 30 ? `${label.slice(0, 29)}…` : label}
                      <title>{label}</title>
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          {layout.boxes.map((b) => {
            if (b.kind === 'more') {
              return (
                <g
                  key={b.id}
                  id={`tn-${b.id}`}
                  role="treeitem"
                  aria-level={b.depth + 1}
                  className={`t-more ${kbdId === b.id ? 'kbd' : ''}`}
                  style={{ transform: `translate(${b.x}px, ${b.y}px)` }}
                  onClick={() => onShowMore(b.v.parentId!)}
                >
                  <rect x={0} y={-14} width={b.w} height={28} rx={4} />
                  <text x={12} y={4}>{t('tree.showMore', { n: b.v.hiddenCount ?? 0 })}</text>
                </g>
              );
            }
            const n = b.n!;
            const level = nodeLevel(n, levelSource);
            const group = levelGroup(level, myLevel);
            const tokens = wordTokens(n.seg, n.display);
            const artW = n.article ? measure(n.article, ART_FONT) + 10 : 0;
            const classes = ['t-node'];
            if (n.path) classes.push('path-node');
            if (group === 'next') classes.push('next');
            if (b.id === selectedId) classes.push('selected');
            if (b.id === focusId) classes.push('focus');
            if (b.id === kbdId) classes.push('kbd');
            const wordW = measure(n.display, WORD_FONT);
            const label = `${n.article ? `${n.article} ` : ''}${n.display.replace(/[|·]/g, '')}, ${t(`pos.${n.pos}`)}, ${level === 'beyond' ? t('level.beyond') : level}`;
            return (
              <g
                key={b.id}
                id={`tn-${b.id}`}
                role="treeitem"
                aria-level={b.depth + 1}
                aria-label={label}
                aria-selected={b.id === selectedId}
                aria-expanded={b.v.childCount ? !b.v.collapsed : undefined}
                className={classes.join(' ')}
                style={{ transform: `translate(${b.x}px, ${b.y}px)`, opacity: opacityOf(b.id, n) }}
                onClick={() => {
                  setKbdId(b.id);
                  onSelect(b.id);
                }}
              >
                {n.path && <title>{t('tree.pathNode')}</title>}
                <rect className={`box fill-${fillToken(colorBy, { level, pos: n.pos, gender: n.gender })}`} x={0} y={-NODE_H / 2} width={b.w} height={NODE_H} rx={4} />
                {n.article && (
                  <g className={`svg-art svg-art-${n.article.includes('/') ? 'multi' : n.article}`} transform={`translate(${PAD_X},-15)`}>
                    <rect width={artW} height={17} rx={3} />
                    <text x={5} y={12.5} style={{ font: ART_FONT }}>{n.article}</text>
                  </g>
                )}
                <text x={PAD_X + (n.article ? artW + 6 : 0)} y={1} className="t-word" fontSize={16} lang="de">
                  {tokens.map((tk, i) => (
                    <tspan key={i} className={tk.type === 'SEP' ? 'sep' : `m-${tk.type}`}>{tk.text}</tspan>
                  ))}
                </text>
                {n.uncertain && (
                  <line x1={PAD_X + (n.article ? artW + 6 : 0)} x2={PAD_X + (n.article ? artW + 6 : 0) + wordW} y1={5} y2={5} className="t-uncertain" />
                )}
                <g transform={`translate(${PAD_X},${NODE_H / 2 - 15})`}>
                  <rect className={`t-lvl fill-lvl-${level} ${n.custom_level && levelSource === 'custom' ? 'custom' : ''}`} width={32} height={12} rx={2} />
                  <text x={16} y={9.5} textAnchor="middle" className="t-lvl-text">{level === 'beyond' ? 'C2+' : level}</text>
                  <text x={38} y={9.5} className="meta">{t(`pos.${n.pos}`)}</text>
                  {group === 'next' && (
                    <text x={44 + measure(t(`pos.${n.pos}`), META_FONT)} y={9.5} className="next-label">{t('level.next')}</text>
                  )}
                </g>
                {!!b.v.childCount && (
                  <g
                    className="t-toggle"
                    transform={`translate(${b.w},0)`}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onToggle(b.id);
                    }}
                    aria-hidden="true"
                  >
                    <circle r={8} />
                    <text textAnchor="middle" y={4}>{b.v.collapsed ? '+' : '−'}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <p className="tree-hint small muted">{t('tree.keyboardHint')}</p>
    </div>
  );
}
