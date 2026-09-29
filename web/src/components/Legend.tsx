import { useI18n } from '../i18n/i18n';
import { useSettings } from '../lib/settings';
import { ARTICLES, LEVEL_LIST, MORPH_EXAMPLES, MORPH_TYPES, POS_LIST } from '../lib/tokens';

/** Legend built from the same token classes the tree uses. */
export function Legend() {
  const { t } = useI18n();
  const { colorBy } = useSettings();
  return (
    <div className="legend">
      <div>
        <h3>{t('legend.articles')}</h3>
        <div className="legend-row">
          {ARTICLES.map((a) => (
            <span key={a}>
              <span className={`art art-${a}`} lang="de">{a}</span>
              {t(`gender.${a === 'der' ? 'masc' : a === 'die' ? 'femn' : 'neut'}`).replace(/^\w+\s*/, '')}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3>{t('legend.morphemes')}</h3>
        <div className="legend-row">
          {MORPH_TYPES.map((m) => (
            <span key={m}>
              <span className={`word m-${m}`} lang="de">{MORPH_EXAMPLES[m]}</span> {t(`morph.${m}`)}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3>{t('legend.marks')}</h3>
        <div className="legend-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>
            <span className="word" lang="de"><span className="m-PREF_SEP">auf</span><span className="sep">|</span><span className="m-ROOT">steh</span><span className="m-END">en</span></span>{' '}
            {t('legend.bar')}
          </span>
          <span>
            <span className="word" lang="de"><span className="m-ROOT">Haus</span><span className="sep">·</span><span className="m-ROOT">tür</span></span>{' '}
            {t('legend.dot')}
          </span>
          <span>
            <span className="lvl lvl-B1">B1</span> {t('legend.dashed')}
          </span>
          <span>
            <span className="word uncertain" lang="de">Wort</span> {t('legend.uncertain')}
          </span>
          <span>
            <span className="swatch faded" /> {t('legend.faded')}
          </span>
          <span>
            <span className="swatch bold" /> {t('legend.next')}
          </span>
        </div>
      </div>
      {colorBy === 'level' && (
        <div>
          <h3>{t('legend.levels')}</h3>
          <div className="legend-row">
            {LEVEL_LIST.map((l) => (
              <span key={l}>
                <span className={`swatch bg-lvl-${l}`} />
                {l === 'beyond' ? t('level.beyond') : l}
              </span>
            ))}
          </div>
        </div>
      )}
      {colorBy === 'pos' && (
        <div>
          <h3>{t('legend.pos')}</h3>
          <div className="legend-row">
            {POS_LIST.map((p) => (
              <span key={p}>
                <span className={`swatch bg-pos-${p}`} />
                {t(`pos.${p}`)}
              </span>
            ))}
          </div>
        </div>
      )}
      {colorBy === 'gender' && (
        <div>
          <h3>{t('filter.gender')}</h3>
          <div className="legend-row">
            {ARTICLES.map((a) => (
              <span key={a}>
                <span className={`swatch bg-g-${a}`} />
                {a}
              </span>
            ))}
            <span>
              <span className="swatch bg-neutral" />
              {t('pos.OTHER')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
