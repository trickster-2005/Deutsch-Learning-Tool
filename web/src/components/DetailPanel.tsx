import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18n';
import { loadAffixes, loadEntries, loadEntry, loadTopics } from '../lib/data';
import type { FamilyModel } from '../lib/family';
import { effectiveLevel } from '../lib/levels';
import type { AffixRow, LexEntry, MorphType, SegPart } from '../lib/types';
import { Article, Gloss, LevelBadge, PosTag, Stars, Word } from './Word';

const AUX_PREFIX: Record<string, string> = { haben: 'hat', sein: 'ist', both: 'hat/ist' };

function segOf(e: LexEntry): SegPart[] {
  return (e.segmentation?.parts ?? []).map((p) => p.map((m) => [m.text, m.type] as [string, MorphType]));
}

function Grammar({ e }: { e: LexEntry }) {
  const { t } = useI18n();
  if (e.pos === 'NOUN') {
    return (
      <dl className="kv">
        {e.article && (<><dt>{t('filter.gender')}</dt><dd><Article article={e.article} />{e.gender && e.gender !== 'unknown' && <span className="small muted">{t(`gender.${e.gender}`)}</span>}</dd></>)}
        {e.genitive && (<><dt>{t('detail.genitive')}</dt><dd className="de">{e.genitive}</dd></>)}
        {e.plural && (<><dt>{t('detail.plural')}</dt><dd className="de">{e.plural}</dd></>)}
        {e.plural_type && (<><dt>{t('detail.pluralType')}</dt><dd>{t(`plural.${e.plural_type}`)}</dd></>)}
      </dl>
    );
  }
  if (e.pos === 'VERB') {
    const f = e.features ?? {};
    const pp = e.principal_parts;
    const aux = String(f.auxiliary ?? 'unknown');
    const parts = pp
      ? [pp.present_3sg, pp.preterite_3sg, pp.past_participle ? `${AUX_PREFIX[aux] ? `${AUX_PREFIX[aux]} ` : ''}${pp.past_participle}` : null].filter(Boolean)
      : [];
    const pt = String(f.prefix_type ?? 'none');
    return (
      <>
        {parts.length > 0 && (
          <>
            <p className="card-title">{t('detail.principalParts')}</p>
            <p className="pp" lang="de">{parts.join(' · ')}</p>
          </>
        )}
        <dl className="kv">
          <dt>{t('detail.conjugation')}</dt>
          <dd>{t(`conj.${f.conjugation ?? 'unknown'}`)}</dd>
          <dt>{t('filter.prefixType')}</dt>
          <dd>{pt === 'separable' ? t('detail.separable') : pt === 'inseparable' ? t('detail.inseparable') : t(`pt.${pt}`)}</dd>
          <dt>{t('filter.auxiliary')}</dt>
          <dd lang="de">{t(`aux.${aux}`)}</dd>
          {f.reflexive === true && (<><dt>&nbsp;</dt><dd>{t('detail.reflexive')}</dd></>)}
        </dl>
      </>
    );
  }
  if (e.pos === 'ADJ' && (e.comparative || e.superlative)) {
    return (
      <dl className="kv">
        {e.comparative && (<><dt>{t('detail.comparative')}</dt><dd className="de">{e.comparative}</dd></>)}
        {e.superlative && (<><dt>{t('detail.superlative')}</dt><dd className="de">{e.superlative}</dd></>)}
      </dl>
    );
  }
  return null;
}

export function DetailPanel({
  model, selectedId, levelSource, onClose, onSelect,
}: {
  model: FamilyModel;
  selectedId: string | null;
  levelSource: 'estimated' | 'custom';
  onClose(): void;
  onSelect(id: string): void;
}) {
  const { t, lang } = useI18n();
  const node = selectedId ? model.byId.get(selectedId) : undefined;
  const [entry, setEntry] = useState<LexEntry | null>(null);
  const [duals, setDuals] = useState<LexEntry[]>([]);
  const [affixes, setAffixes] = useState<Map<string, AffixRow>>(new Map());
  const [topics, setTopics] = useState<Record<string, { en: string; zh: string }>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    loadAffixes()
      .then((a) => setAffixes(new Map([...a.prefixes, ...a.suffixes].map((r) => [r.affix, r]))))
      .catch(() => {});
    loadTopics().then(setTopics).catch(() => {});
  }, []);

  useEffect(() => {
    let live = true;
    setEntry(null);
    setDuals([]);
    setError(false);
    if (!node) return;
    loadEntry(node.key)
      .then(async (e) => {
        if (!live) return;
        setEntry(e);
        if (e?.dual?.length) {
          const subs = await loadEntries(e.dual);
          if (live) setDuals(e.dual.map((k) => subs[k]).filter(Boolean));
        }
      })
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [node]);

  if (!node) return <div className="detail"><p className="muted">{t('detail.empty')}</p></div>;

  const edge = model.edgeTo.get(node.id!);
  const parentId = model.parent.get(node.id!) ?? null;
  const parent = parentId ? model.byId.get(parentId) : undefined;
  const level = effectiveLevel(node.level, node.custom_level, levelSource);
  const isCustom = levelSource === 'custom' && !!node.custom_level;
  const affixList = edge ? [...edge.added_prefixes, ...edge.added_suffixes] : [];
  const presentTypes = new Set<MorphType>();
  for (const p of node.seg) for (const [, ty] of p) presentTypes.add(ty);

  const parentLink = parent ? (
    <button type="button" className="btn ghost" style={{ padding: '0 4px', minHeight: 0 }} onClick={() => onSelect(parent.id!)}>
      <Article article={parent.article} />
      <Word seg={parent.seg} display={parent.display} />
    </button>
  ) : null;

  const formation = () => {
    if (!parent || !edge) return <p className="small muted">{t('detail.root')}</p>;
    const [before, after = ''] = (affixList.length ? t('detail.addedFrom', { parent: '\u0000' }) : edge.semantic_type ? t('detail.conversion', { parent: '\u0000' }) : t('detail.uncertainLink', { parent: '\u0000' })).split('\u0000');
    return (
      <>
        <p>
          {before}
          {parentLink}
          {after}
          {edge.semantic_type && !affixList.length && <> · {t(`sem.${edge.semantic_type}`)}</>}
        </p>
        {affixList.map((a) => {
          const row = affixes.get(a);
          const meaning = row ? (lang === 'zh-Hant' ? row.meaning_zh : row.meaning_en) : null;
          return (
            <p key={a} className="small">
              <span className="affix-chip" lang="de">{a}</span>
              {edge.semantic_type && <strong>{t(`sem.${edge.semantic_type}`)}</strong>}
              {meaning && <> — {meaning}</>}
              {row?.examples?.length ? <span className="muted" lang="de"> ({row.examples.slice(0, 3).join(', ')})</span> : null}
            </p>
          );
        })}
        {edge.vowel_change === 'umlaut' && <p className="small">{t('detail.umlautNote')}</p>}
        {edge.vowel_change === 'ablaut' && <p className="small">{t('detail.ablautNote')}</p>}
      </>
    );
  };

  return (
    <div className="detail" aria-live="polite">
      <button type="button" className="btn icon-btn close" onClick={onClose} aria-label={t('detail.close')}>×</button>
      <h2 className="headword">
        <Article article={node.article} />
        <Word seg={node.seg} display={node.display} uncertain={node.uncertain} />
      </h2>
      <p style={{ margin: '2px 0' }}>
        <PosTag pos={node.pos} /> {entry?.ipa && <span className="ipa" aria-label={t('detail.ipa')}>[{entry.ipa}]</span>}
      </p>
      <div className="morph-legend" aria-label={t('legend.morphemes')}>
        {(['PREF_SEP', 'PREF', 'ROOT', 'SUFF', 'END', 'LINK'] as MorphType[]).filter((m) => presentTypes.has(m)).map((m) => (
          <span key={m}><span className={`m-${m}`}>■</span> {t(`morph.${m}`)}</span>
        ))}
      </div>
      {node.uncertain && <p className="small muted">{t('detail.uncertain')}</p>}
      {node.path && <p className="small muted">{t('detail.pathNode')}</p>}
      {error && <p className="error small">{t('common.error')}</p>}

      {entry && !entry.dual && (
        <>
          <h3>{t('detail.grammar')}</h3>
          <div className="card"><Grammar e={entry} /></div>
        </>
      )}
      {entry?.dual && duals.length > 0 && (
        <>
          <h3>{t('detail.twoMeanings')}</h3>
          {duals.map((d) => (
            <div className="card" key={d.variant}>
              <p className="card-title">
                <Word seg={segOf(d)} display={d.display} /> · {d.variant === 'sep' ? t('pt.separable') : t('pt.inseparable')}
              </p>
              <Grammar e={d} />
              <p><Gloss en={d.gloss_en.text} zh={d.gloss_zh.text} className="" /></p>
            </div>
          ))}
        </>
      )}

      <h3>{t('detail.level')}</h3>
      <p>
        <LevelBadge level={level} custom={isCustom} /> <span className="small muted">{isCustom ? t('detail.customLevel') : t('detail.estimated')}</span>
      </p>

      {!entry?.dual && (
        <>
          <h3>{t('detail.meaning')}</h3>
          <p><Gloss en={entry?.gloss_en.text ?? node.gloss_en} zh={entry?.gloss_zh.text ?? node.gloss_zh} className="" /></p>
        </>
      )}

      <h3>{t('detail.formation')}</h3>
      {formation()}

      {entry?.compound && (
        <>
          <h3>{t('detail.parts')}</h3>
          <p>
            {entry.compound.parts.map((p, i) => (
              <span key={i}>
                {i > 0 && <span className="sep"> + </span>}
                {entry.compound!.links[i - 1] ? <span className="m-LINK small">(-{entry.compound!.links[i - 1]}-) </span> : null}
                {p.family_id ? (
                  <Link className="word" to={`/family/${p.family_id}?focus=${encodeURIComponent(p.lemma_key ?? p.lemma)}`}>{p.lemma}</Link>
                ) : (
                  <span className="word">{p.lemma}</span>
                )}
              </span>
            ))}
          </p>
          <p className="small muted">{t('compounds.genderHint')}</p>
        </>
      )}

      {node.topics.length > 0 && (
        <>
          <h3>{t('detail.topics')}</h3>
          <p>{node.topics.map((tp) => <span key={tp} className="chip" style={{ paddingRight: 10, marginRight: 4 }}>{topics[tp] ? (lang === 'zh-Hant' ? topics[tp].zh : topics[tp].en) : tp}</span>)}</p>
        </>
      )}

      {entry && entry.examples.length > 0 && (
        <>
          <h3>{t('detail.examples')}</h3>
          <ul className="examples-list">
            {entry.examples.map((ex, i) => (
              <li key={i}>
                <span className="de" lang="de">{ex.de}</span>
                <span className="small muted" lang="en">{ex.en}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>{t('detail.frequency')}</h3>
      <p><Stars n={node.stars} /></p>
    </div>
  );
}
