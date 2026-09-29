import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import en from './en.json';
import zh from './zh-Hant.json';
import { readStore, writeStore } from '../lib/storage';

export type Lang = 'en' | 'zh-Hant';
type Dict = Record<string, string>;
const DICTS: Record<Lang, Dict> = { en, 'zh-Hant': zh };
const STORE_KEY = 'gwf.lang';

export function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'zh-Hant';
}

/** URL `lang=` (in the hash query or the real query) wins over localStorage; default English. */
export function initialLang(): Lang {
  try {
    const hashQuery = window.location.hash.split('?')[1] ?? '';
    const fromUrl = new URLSearchParams(hashQuery).get('lang') ?? new URLSearchParams(window.location.search).get('lang');
    if (isLang(fromUrl)) return fromUrl;
  } catch {
    /* ignore */
  }
  const stored = readStore(STORE_KEY);
  return isLang(stored) ? stored : 'en';
}

const warned = new Set<string>();

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s = DICTS[lang][key];
  if (s === undefined) {
    if (!warned.has(`${lang}:${key}`)) {
      warned.add(`${lang}:${key}`);
      console.warn(`[i18n] missing "${key}" for ${lang}`);
    }
    s = DICTS.en[key] ?? key;
  }
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return s;
}

interface I18n {
  lang: Lang;
  setLang(l: Lang): void;
  t(key: string, vars?: Record<string, string | number>): string;
}

const Ctx = createContext<I18n>({ lang: 'en', setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeStore(STORE_KEY, l);
    // keep a lang= parameter in the URL consistent with the choice
    try {
      const [path, q = ''] = window.location.hash.split('?');
      const p = new URLSearchParams(q);
      if (p.has('lang')) {
        p.set('lang', l);
        window.history.replaceState(null, '', `${path}?${p.toString()}`);
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  // a lang= parameter in a link opened inside the app also wins
  useEffect(() => {
    const onHash = () => {
      const q = window.location.hash.split('?')[1] ?? '';
      const l = new URLSearchParams(q).get('lang');
      if (isLang(l)) {
        setLangState(l);
        writeStore(STORE_KEY, l);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const value = useMemo<I18n>(() => ({ lang, setLang, t: (k, v) => translate(lang, k, v) }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

/** Set <title> per page and language. */
export function useTitle(title: string) {
  const { t } = useI18n();
  useEffect(() => {
    document.title = title ? `${title} · ${t('app.title')}` : t('app.title');
  }, [title, t]);
}

export const DICTIONARIES = DICTS;
