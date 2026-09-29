import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n, useTitle } from '../i18n/i18n';
import { SearchBox, searchDeps } from '../components/SearchBox';
import { Article, Gloss, Word } from '../components/Word';
import { loadEntry, loadMeta } from '../lib/data';
import type { LexEntry, Meta, MorphType } from '../lib/types';

const EXAMPLES = ['stehen', 'fahren', 'Haus', 'sprechen', 'frei', 'Freund'];

function ExampleCard({ lemma }: { lemma: string }) {
  const [entry, setEntry] = useState<{ key: string; e: LexEntry } | null>(null);
  useEffect(() => {
    searchDeps
      .forms(lemma.toLowerCase())
      .then(async (keys) => {
        const key = keys.find((k) => k.split('#')[0] === lemma) ?? keys[0];
        const e = key ? await loadEntry(key) : null;
        if (e && key) setEntry({ key, e });
      })
      .catch(() => {});
  }, [lemma]);
  if (!entry?.e.family_id) return <div className="example"><span className="word">{lemma}</span></div>;
  const { e, key } = entry;
  return (
    <Link className="example" to={`/family/${e.family_id}?focus=${encodeURIComponent(key)}`}>
      <Article article={e.article} />
      <Word seg={e.segmentation?.parts.map((p) => p.map((m) => [m.text, m.type] as [string, MorphType]))} display={e.display} />
      <br />
      <Gloss en={e.gloss_en.text} zh={e.gloss_zh.text} />
    </Link>
  );
}

export function HomePage() {
  const { t } = useI18n();
  const [meta, setMeta] = useState<Meta | null>(null);
  useTitle('');
  useEffect(() => {
    loadMeta().then(setMeta).catch(() => {});
  }, []);
  return (
    <main className="home" id="main" tabIndex={-1}>
      <h1>{t('app.title')}</h1>
      <p className="lead">{t('app.tagline')}</p>
      <SearchBox big autoFocus />
      {meta && (
        <p className="small muted">
          {t('home.stats', {
            families: meta.stats.families.toLocaleString(),
            words: meta.stats.lemmas.toLocaleString(),
            compounds: meta.stats.compounds.toLocaleString(),
          })}
        </p>
      )}
      <h2>{t('home.examples')}</h2>
      <div className="examples">
        {EXAMPLES.map((l) => <ExampleCard key={l} lemma={l} />)}
      </div>
      <section aria-labelledby="how-title">
        <h2 id="how-title">{t('home.stepsTitle')}</h2>
        <ol className="steps">
          {['home.step1', 'home.step2', 'home.step3'].map((k, i) => (
            <li key={k}>
              <span className="num" aria-hidden="true">{i + 1}</span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ol>
        <p><Link to="/how-it-works">{t('home.learnMore')}</Link></p>
      </section>
      <footer className="site" style={{ marginTop: 40 }}>{t('footer.data')}</footer>
    </main>
  );
}
