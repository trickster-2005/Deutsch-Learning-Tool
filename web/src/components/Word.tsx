import { Fragment } from 'react';
import type { MorphType, SegPart } from '../lib/types';
import { useI18n } from '../i18n/i18n';

export interface Token {
  text: string;
  type: MorphType | 'SEP';
}

/**
 * Align the morpheme segmentation with the display string, which carries the
 * separators: 'auf|stehen' (separable prefix) and 'Arbeit·s·platz' (compound).
 */
export function wordTokens(seg: SegPart[] | undefined, display: string): Token[] {
  if (!seg || !seg.length) return [{ text: display, type: 'ROOT' }];
  const chars: { c: string; t: MorphType }[] = [];
  for (const part of seg) for (const [text, type] of part) for (const c of text) chars.push({ c, t: type });
  const letters = display.replace(/[|·]/g, '');
  const tokens: Token[] = [];
  const push = (text: string, type: Token['type']) => {
    const last = tokens[tokens.length - 1];
    if (last && last.type === type && type !== 'SEP') last.text += text;
    else tokens.push({ text, type });
  };
  if (chars.map((x) => x.c).join('').toLowerCase() === letters.toLowerCase()) {
    let i = 0;
    for (const c of display) {
      if (c === '|' || c === '·') push(c, 'SEP');
      else push(c, chars[i++].t);
    }
    return tokens;
  }
  // fallback: separators between compound parts and before linking elements
  seg.forEach((part, pi) => {
    if (pi > 0) push('·', 'SEP');
    for (const [text, type] of part) {
      if (type === 'LINK') push('·', 'SEP');
      push(text, type);
    }
  });
  return tokens;
}

export function Word({
  seg, display, uncertain, className = '', lang = 'de',
}: { seg?: SegPart[]; display: string; uncertain?: boolean; className?: string; lang?: string }) {
  const tokens = wordTokens(seg, display);
  return (
    <span className={`word ${uncertain ? 'uncertain' : ''} ${className}`} lang={lang}>
      {tokens.map((tk, i) => (
        <Fragment key={i}>
          {/* preferred line-break points where a long word may wrap (morpheme boundaries) */}
          {i > 0 && <wbr />}
          {tk.type === 'SEP' ? <span className="sep">{tk.text}</span> : <span className={`m-${tk.type}`}>{tk.text}</span>}
        </Fragment>
      ))}
    </span>
  );
}

export function articleClass(article: string | null | undefined): string {
  if (!article) return '';
  if (article.includes('/')) return 'art-multi';
  return `art-${article}`;
}

export function Article({ article }: { article?: string | null }) {
  if (!article) return null;
  return (
    <span className={`art ${articleClass(article)}`} lang="de">
      {article}
    </span>
  );
}

export function LevelBadge({ level, custom }: { level: string; custom?: boolean }) {
  const { t } = useI18n();
  const label = level === 'beyond' ? 'C2+' : level;
  const title = `${level === 'beyond' ? t('level.beyond') : level} · ${custom ? t('detail.customLevel') : t('detail.estimated')}`;
  return (
    <span className={`lvl lvl-${level} ${custom ? 'custom' : ''}`} title={title} aria-label={title}>
      {label}
    </span>
  );
}

export function PosTag({ pos }: { pos: string }) {
  const { t } = useI18n();
  return <span className="postag">{t(`pos.${pos}`)}</span>;
}

/** Gloss in the UI language; Chinese falls back to English with an "EN" mark. */
export function Gloss({ en, zh, className = 'gloss' }: { en: string; zh: string; className?: string }) {
  const { lang, t } = useI18n();
  if (lang === 'zh-Hant') {
    if (zh) return <span className={className}>{zh}</span>;
    if (en)
      return (
        <span className={className}>
          <span className="en-badge" title={t('detail.enBadgeTitle')}>{t('detail.enBadge')}</span>
          <span lang="en">{en}</span>
        </span>
      );
  } else if (en) return <span className={className}>{en}</span>;
  return <span className={`${className} muted`}>{t('detail.noGloss')}</span>;
}

export function Stars({ n }: { n: number }) {
  const { t } = useI18n();
  return (
    <span className="stars" aria-label={t('detail.stars', { n })} title={t('detail.stars', { n })}>
      {'★'.repeat(n)}
      <span aria-hidden="true" style={{ opacity: 0.3 }}>{'★'.repeat(5 - n)}</span>
    </span>
  );
}
