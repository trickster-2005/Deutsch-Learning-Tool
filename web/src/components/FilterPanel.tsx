import { useEffect, useId, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n/i18n';
import { loadAffixes, loadMeta, loadTopics } from '../lib/data';
import { activeChips, isEmpty, removeChip, showNounFilters, showVerbFilters, type Filters, type ListKey, type Mode } from '../lib/filters';
import { LEVEL_LIST, POS_LIST } from '../lib/tokens';

export const OPTIONS = {
  gender: ['masc', 'femn', 'neut', 'multiple', 'plural_only', 'unknown'],
  pl: ['e', 'uml_e', 'er', 'uml_er', 'en', 's', 'zero', 'uml_zero', 'other', 'none'],
  conj: ['weak', 'strong', 'mixed', 'irregular', 'modal', 'unknown'],
  pt: ['separable', 'inseparable', 'none', 'unknown'],
  aux: ['haben', 'sein', 'both', 'unknown'],
  vc: ['umlaut', 'ablaut', 'other'],
  st: [
    'action_noun', 'agent_noun', 'person_noun', 'feminine', 'quality_noun', 'collective_noun', 'result_noun',
    'place_noun', 'diminutive', 'relational_adj', 'ability_adj', 'privative_adj', 'material_adj', 'verbalizer',
    'diminutive_verb', 'nominalized_infinitive', 'stem_noun', 'nominalized_adjective', 'denominal_verb',
    'deadjectival_verb', 'prefixed_verb', 'other',
  ],
};

/** Label for one filter value (used by the panel and the chip bar). */
export function useValueLabel() {
  const { t, lang } = useI18n();
  const [topics, setTopics] = useState<Record<string, { en: string; zh: string }>>({});
  useEffect(() => {
    loadTopics().then(setTopics).catch(() => {});
  }, []);
  return (dim: keyof Filters, v: string): string => {
    switch (dim) {
      case 'level': return v === 'beyond' ? t('level.beyond') : v;
      case 'pos': return t(`pos.${v}`);
      case 'gender': return t(`gender.${v}`);
      case 'pl': return t(`plural.${v}`);
      case 'conj': return t(`conj.${v}`);
      case 'pt': return t(`pt.${v}`);
      case 'aux': return t(`aux.${v}`);
      case 'st': return t(`sem.${v}`);
      case 'vc': return v === 'other' ? t('pos.OTHER') : t(`vc.${v}`);
      case 'topic': return v === 'other' ? t('pos.OTHER') : topics[v] ? (lang === 'zh-Hant' ? topics[v].zh : topics[v].en) : v;
      case 'refl': return t('filter.reflexive');
      case 'stars': return t('filter.freqMin', { n: v });
      case 'certain': return t('filter.hideUncertain');
      default: return v;
    }
  };
}

export const DIM_LABEL: Record<string, string> = {
  level: 'filter.level', pos: 'filter.pos', gender: 'filter.gender', pl: 'filter.plural', conj: 'filter.conjugation',
  pt: 'filter.prefixType', aux: 'filter.auxiliary', st: 'filter.formation', pc: 'filter.posChange', vc: 'filter.vowelChange',
  affix: 'filter.affix', topic: 'filter.topic', stars: 'filter.freq', refl: 'filter.reflexive', certain: 'filter.hideUncertain',
};

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="fgroup">
      <legend>{legend}</legend>
      <div className="opts">{children}</div>
    </fieldset>
  );
}

export function FilterPanel({
  filters, onChange, mode, onMode, extra, onClose,
}: {
  filters: Filters;
  onChange(f: Filters): void;
  mode?: Mode;
  onMode?(m: Mode): void;
  extra?: ReactNode;
  onClose?(): void;
}) {
  const { t } = useI18n();
  const label = useValueLabel();
  const [affixOpts, setAffixOpts] = useState<string[]>([]);
  const [topicOpts, setTopicOpts] = useState<string[]>([]);
  const [posChanges, setPosChanges] = useState<string[]>([]);
  const [affixInput, setAffixInput] = useState('');
  const id = useId();

  useEffect(() => {
    loadAffixes().then((a) => setAffixOpts([...a.prefixes, ...a.suffixes].filter((r) => r.count > 0 || r.meaning_en).map((r) => r.affix))).catch(() => {});
    loadTopics().then((tp) => setTopicOpts([...Object.keys(tp), 'other'])).catch(() => {});
    loadMeta().then((m) => setPosChanges(m.pos_changes)).catch(() => {});
  }, []);

  const toggle = (dim: ListKey, v: string) => {
    const cur = filters[dim];
    onChange({ ...filters, [dim]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };
  const opt = (dim: ListKey, v: string, text?: string) => (
    <label className="opt" key={v}>
      <input type="checkbox" checked={filters[dim].includes(v)} onChange={() => toggle(dim, v)} />
      <span lang={dim === 'affix' || dim === 'pc' ? 'de' : undefined}>{text ?? label(dim, v)}</span>
    </label>
  );
  const addAffix = (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v) return;
    const match = affixOpts.find((a) => a === v) ?? affixOpts.find((a) => a.replace(/-/g, '') === v.replace(/-/g, ''));
    const val = match ?? v;
    if (!filters.affix.includes(val)) onChange({ ...filters, affix: [...filters.affix, val] });
    setAffixInput('');
  };

  return (
    <div className="filters">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <h2 style={{ margin: 0, flex: 1 }}>{t('filter.title')}</h2>
        {!isEmpty(filters) && (
          <button type="button" className="btn small" onClick={() => onChange({ ...filters, level: [], pos: [], gender: [], pl: [], conj: [], pt: [], aux: [], refl: false, st: [], pc: [], vc: [], affix: [], topic: [], stars: 0, certain: false })}>
            {t('filter.clear')}
          </button>
        )}
        {onClose && (
          <button type="button" className="btn icon-btn" onClick={onClose} aria-label={t('filter.close')}>×</button>
        )}
      </div>

      {mode && onMode && (
        <fieldset className="fgroup">
          <legend>{t('filter.mode')}</legend>
          <div className="seg-group" role="radiogroup" aria-label={t('filter.mode')}>
            {(['dim', 'prune', 'list'] as Mode[]).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} aria-pressed={mode === m} className="seg-btn" onClick={() => onMode(m)}>
                {t(`filter.mode.${m}`)}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {extra}

      <Group legend={t('filter.level')}>{LEVEL_LIST.map((l) => opt('level', l))}</Group>
      <Group legend={t('filter.pos')}>{POS_LIST.map((p) => opt('pos', p))}</Group>

      {showNounFilters(filters) && (
        <div className="fsub">
          <h3>{t('filter.nounGroup')}</h3>
          <Group legend={t('filter.gender')}>{OPTIONS.gender.map((g) => opt('gender', g))}</Group>
          <Group legend={t('filter.plural')}>{OPTIONS.pl.map((g) => opt('pl', g))}</Group>
        </div>
      )}
      {showVerbFilters(filters) && (
        <div className="fsub">
          <h3>{t('filter.verbGroup')}</h3>
          <Group legend={t('filter.conjugation')}>{OPTIONS.conj.map((g) => opt('conj', g))}</Group>
          <Group legend={t('filter.prefixType')}>{OPTIONS.pt.map((g) => opt('pt', g))}</Group>
          <Group legend={t('filter.auxiliary')}>{OPTIONS.aux.map((g) => opt('aux', g))}</Group>
          <label className="toggle-row">
            <input type="checkbox" checked={filters.refl} onChange={(e) => onChange({ ...filters, refl: e.target.checked })} />
            {t('filter.reflexive')}
          </label>
        </div>
      )}

      <div className="fsub">
        <h3>{t('filter.formationGroup')}</h3>
        <Group legend={t('filter.formation')}>{OPTIONS.st.map((g) => opt('st', g))}</Group>
        <Group legend={t('filter.posChange')}>{posChanges.map((g) => opt('pc', g, g.replace('>', ' → ')))}</Group>
        <Group legend={t('filter.vowelChange')}>{OPTIONS.vc.map((g) => opt('vc', g))}</Group>
        <fieldset className="fgroup">
          <legend>
            <label htmlFor={`${id}-affix`}>{t('filter.affix')}</label>
          </legend>
          <input
            id={`${id}-affix`}
            type="text"
            list={`${id}-affixes`}
            lang="de"
            value={affixInput}
            placeholder={t('filter.affixPlaceholder')}
            onChange={(e) => {
              const v = e.target.value;
              if (affixOpts.includes(v)) addAffix(v);
              else setAffixInput(v);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAffix(affixInput);
              }
            }}
            style={{ width: '100%' }}
          />
          <datalist id={`${id}-affixes`}>
            {affixOpts.map((a) => <option key={a} value={a} />)}
          </datalist>
          <div className="opts" style={{ marginTop: 6 }}>{filters.affix.map((a) => opt('affix', a, a))}</div>
        </fieldset>
      </div>

      <div className="fsub">
        <h3>{t('filter.otherGroup')}</h3>
        <Group legend={t('filter.topic')}>{topicOpts.map((g) => opt('topic', g))}</Group>
        <fieldset className="fgroup">
          <legend><label htmlFor={`${id}-stars`}>{t('filter.freq')}</label></legend>
          <select id={`${id}-stars`} value={filters.stars} onChange={(e) => onChange({ ...filters, stars: Number(e.target.value) })}>
            <option value={0}>{t('filter.freqAny')}</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{t('filter.freqMin', { n })}</option>)}
          </select>
        </fieldset>
        <label className="toggle-row">
          <input type="checkbox" checked={filters.certain} onChange={(e) => onChange({ ...filters, certain: e.target.checked })} />
          {t('filter.hideUncertain')}
        </label>
      </div>
    </div>
  );
}

export function FilterChips({ filters, onChange }: { filters: Filters; onChange(f: Filters): void }) {
  const { t } = useI18n();
  const label = useValueLabel();
  const chips = activeChips(filters);
  if (!chips.length) return null;
  return (
    <>
      {chips.map(({ dim, value }) => {
        const text = dim === 'affix' || dim === 'pc' ? value.replace('>', ' → ') : label(dim, value);
        const name = `${t(DIM_LABEL[dim])}: ${text}`;
        return (
          <span key={`${dim}:${value}`} className="chip">
            <span className="muted">{t(DIM_LABEL[dim])}:</span> {text}
            <button type="button" onClick={() => onChange(removeChip(filters, dim, value))} aria-label={t('filter.remove', { name })}>×</button>
          </span>
        );
      })}
    </>
  );
}
