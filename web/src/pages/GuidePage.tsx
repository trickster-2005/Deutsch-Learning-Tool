import { useI18n, useTitle } from '../i18n/i18n';
import { Legend } from '../components/Legend';
import { REPO_URL } from '../lib/constants';

const SOURCES = [
  { name: 'DErivBase', key: 'guide.src.derivbase', url: 'https://www.ims.uni-stuttgart.de/forschung/ressourcen/lexika/derivbase/' },
  { name: 'Wiktionary', key: 'guide.src.wiktionary', url: 'https://www.wiktionary.org/' },
  { name: 'CharSplit', key: 'guide.src.charsplit', url: 'https://github.com/dtuggener/CharSplit' },
  { name: 'wordfreq', key: 'guide.src.wordfreq', url: 'https://github.com/rspeer/wordfreq' },
];

/** Plain-language guide (spec 12.12): no technical details here; those live in the README. */
export function GuidePage() {
  const { t } = useI18n();
  useTitle(t('guide.title'));
  return (
    <main className="guide" id="main" tabIndex={-1}>
      <h1>{t('guide.title')}</h1>

      <section aria-labelledby="g1">
        <h2 id="g1">{t('guide.s1.title')}</h2>
        <p>{t('guide.s1.body')}</p>
      </section>

      <section aria-labelledby="g2">
        <h2 id="g2">{t('guide.s2.title')}</h2>
        <p>{t('guide.s2.body')}</p>
        <div className="legend-box" aria-label={t('guide.legend')}>
          <Legend />
        </div>
      </section>

      <section aria-labelledby="g3">
        <h2 id="g3">{t('guide.s3.title')}</h2>
        <ul className="sources">
          {SOURCES.map((s) => (
            <li key={s.name}>
              <a href={s.url} target="_blank" rel="noreferrer">{s.name}</a> — {t(s.key)}
            </li>
          ))}
        </ul>
        <p>{t('guide.s3.body')}</p>
      </section>

      <section aria-labelledby="g4">
        <h2 id="g4">{t('guide.s4.title')}</h2>
        <p>{t('guide.s4.body')}</p>
        <p className="small muted">{t('guide.levelsNote')} {t('guide.separableNote')}</p>
      </section>

      <section aria-labelledby="g5">
        <h2 id="g5">{t('guide.s5.title')}</h2>
        <p>{t('guide.s5.body')}</p>
        <p><a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">{t('guide.report')}</a></p>
      </section>

      <section aria-labelledby="g6">
        <h2 id="g6">{t('guide.s6.title')}</h2>
        <p>{t('guide.s6.body')}</p>
        <p><a href={`${REPO_URL}/blob/main/LICENSES.md`} target="_blank" rel="noreferrer">{t('guide.licenses')}</a></p>
      </section>
    </main>
  );
}
