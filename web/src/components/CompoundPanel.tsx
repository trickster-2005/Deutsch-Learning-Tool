import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18n';
import { matches, emptyFilters, type Filters } from '../lib/filters';
import { levelGroup } from '../lib/levels';
import { nodeLevel } from '../lib/family';
import type { CompoundPartRef, WordSummary } from '../lib/types';
import { Article, Gloss, LevelBadge, Word } from './Word';

const DEFAULT_SHOWN = 12;

/** Level, topic and frequency filters also apply to the compound lists (spec 12.4). */
function compoundFilters(f: Filters): Filters {
  const g = emptyFilters();
  return { ...g, level: f.level, topic: f.topic, stars: f.stars };
}

function CompoundList({ title, items, levelSource, myLevel }: { title: string; items: WordSummary[]; levelSource: 'estimated' | 'custom'; myLevel: string | null }) {
  const { t } = useI18n();
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, DEFAULT_SHOWN);
  return (
    <section>
      <h3>
        {title} <span className="small muted">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="small muted">{t('compounds.none')}</p>
      ) : (
        <ul className="clist">
          {shown.map((c) => {
            const level = nodeLevel(c, levelSource);
            const g = levelGroup(level, myLevel);
            const fam = c.family;
            const inner = (
              <>
                <Article article={c.article} />
                <Word seg={c.seg} display={c.display} uncertain={c.uncertain} />
                <LevelBadge level={level} custom={!!c.custom_level && levelSource === 'custom'} />
                {g === 'next' && <span className="next-tag">{t('level.next')}</span>}
                <Gloss en={c.gloss_en} zh={c.gloss_zh} />
              </>
            );
            return (
              <li key={c.key} style={{ opacity: g === 'above' ? 0.5 : 1 }}>
                {fam ? <Link to={`/family/${fam}?focus=${encodeURIComponent(c.key)}`}>{inner}</Link> : <span className="o-row">{inner}</span>}
              </li>
            );
          })}
        </ul>
      )}
      {items.length > DEFAULT_SHOWN && (
        <button type="button" className="btn ghost small" onClick={() => setAll((a) => !a)} aria-expanded={all}>
          {all ? t('compounds.showLess') : `${t('compounds.showAll')} (${items.length})`}
        </button>
      )}
    </section>
  );
}

export function CompoundPanel({
  asModifier, asHead, parts, filters, levelSource, myLevel,
}: {
  asModifier: WordSummary[];
  asHead: WordSummary[];
  parts?: CompoundPartRef[];
  filters: Filters;
  levelSource: 'estimated' | 'custom';
  myLevel: string | null;
}) {
  const { t } = useI18n();
  const cf = compoundFilters(filters);
  const keep = (c: WordSummary) =>
    matches(
      { level: nodeLevel(c, levelSource), pos: c.pos, topics: c.topics, stars: c.stars, uncertain: c.uncertain, affixes: [] },
      cf,
    );
  const mod = asModifier.filter(keep);
  const head = asHead.filter(keep);
  return (
    <details className="compounds collapsible" open>
      <summary>
        <span className="compounds-head" style={{ display: 'inline-flex' }}>
          <h2>{t('compounds.title')}</h2>
          <span className="small muted">{t('compounds.count', { n: mod.length + head.length })}</span>
        </span>
      </summary>
      <p className="small muted">{t('compounds.genderHint')}</p>
      {parts && parts.length > 0 && (
        <div className="card">
          <p className="card-title">{t('compounds.partsOf')}</p>
          <div className="o-row">
            {parts.map((p, i) => (
              <span key={i}>
                {i > 0 && <span className="sep"> + </span>}
                {p.family_id ? (
                  <Link to={`/family/${p.family_id}?focus=${encodeURIComponent(p.lemma_key ?? p.lemma)}`} className="word">{p.lemma}</Link>
                ) : (
                  <span className="word">{p.lemma}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="compound-cols">
        <CompoundList title={t('compounds.asModifier')} items={mod} levelSource={levelSource} myLevel={myLevel} />
        <CompoundList title={t('compounds.asHead')} items={head} levelSource={levelSource} myLevel={myLevel} />
      </div>
    </details>
  );
}
