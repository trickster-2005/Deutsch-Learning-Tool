import { lazy, Suspense } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useI18n } from './i18n/i18n';
import { SearchBox } from './components/SearchBox';
import { SettingsMenu } from './components/SettingsMenu';
import { HomePage } from './pages/HomePage';
import { FamilyPage } from './pages/FamilyPage';
import { GuidePage } from './pages/GuidePage';
import { readStore } from './lib/storage';

const BrowsePage = lazy(() => import('./pages/BrowsePage'));

function TopBar() {
  const { t, lang, setLang } = useI18n();
  const loc = useLocation();
  const onHome = loc.pathname === '/';
  const lastFamily = readStore('gwf.lastFamily');
  return (
    <header className="topbar">
      <Link to="/" className="brand">{t('app.title')}</Link>
      {!onHome && <SearchBox />}
      <nav className="topnav" aria-label={t('nav.main')}>
        <NavLink to={lastFamily ? `/family/${lastFamily}` : '/'} className={() => ''} aria-current={loc.pathname.startsWith('/family') ? 'page' : undefined}>
          {t('nav.family')}
        </NavLink>
        <NavLink to="/browse">{t('nav.browse')}</NavLink>
        <NavLink to="/how-it-works">{t('nav.guide')}</NavLink>
        <div className="seg-group" role="group" aria-label={t('lang.toggle')}>
          <button type="button" className="seg-btn" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">EN</button>
          <button type="button" className="seg-btn" aria-pressed={lang === 'zh-Hant'} onClick={() => setLang('zh-Hant')} lang="zh-Hant">中文</button>
        </div>
        <SettingsMenu />
      </nav>
    </header>
  );
}

function NotFound() {
  const { t } = useI18n();
  return (
    <main className="page" id="main">
      <h1>{t('notFound.title')}</h1>
      <p><Link to="/">{t('family.back')}</Link></p>
    </main>
  );
}

export default function App() {
  const { t } = useI18n();
  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('common.skip')}</a>
      <TopBar />
      <Suspense fallback={<p className="loading">{t('common.loading')}</p>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/family/:id" element={<FamilyPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/how-it-works" element={<GuidePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
