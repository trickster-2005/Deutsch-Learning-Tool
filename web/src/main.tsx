import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource/pt-serif/400.css';
import '@fontsource/pt-serif/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/700.css';
import './styles.css';
import App from './App';
import { I18nProvider } from './i18n/i18n';
import { SettingsProvider } from './lib/settings';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <I18nProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </I18nProvider>
    </HashRouter>
  </StrictMode>,
);
