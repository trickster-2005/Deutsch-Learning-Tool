import type { Lang } from '../i18n/i18n';

export interface DictLink {
  id: string;
  name: string;
  /** i18n key of the one-line description */
  hint: string;
  url: string;
}

const enc = encodeURIComponent;

/**
 * External dictionary links for a German lemma, chosen for the UI language:
 * the Wiktionary edition and the LEO pair follow the interface language.
 */
export function dictionaryLinks(lemma: string, lang: Lang): DictLink[] {
  const w = lemma.trim();
  const page = enc(w.replace(/ /g, '_'));
  const links: DictLink[] = [];
  if (lang === 'zh-Hant') {
    links.push({ id: 'wikt-zh', name: '維基詞典（中文）', hint: 'dict.hint.wiktionary', url: `https://zh.wiktionary.org/wiki/${page}#${enc('德語')}` });
  } else {
    links.push({ id: 'wikt-en', name: 'Wiktionary (English)', hint: 'dict.hint.wiktionary', url: `https://en.wiktionary.org/wiki/${page}#German` });
  }
  links.push(
    { id: 'wikt-de', name: 'Wiktionary (Deutsch)', hint: 'dict.hint.dewiktionary', url: `https://de.wiktionary.org/wiki/${page}` },
    { id: 'dwds', name: 'DWDS', hint: 'dict.hint.dwds', url: `https://www.dwds.de/wb/${enc(w)}` },
    { id: 'duden', name: 'Duden', hint: 'dict.hint.duden', url: `https://www.duden.de/suchen/dudenonline/${enc(w)}` },
  );
  if (lang === 'zh-Hant') {
    links.push({ id: 'leo-zh', name: 'LEO 中德', hint: 'dict.hint.leo', url: `https://dict.leo.org/chinesisch-deutsch/${enc(w)}` });
  } else {
    links.push(
      { id: 'leo-en', name: 'LEO', hint: 'dict.hint.leo', url: `https://dict.leo.org/german-english/${enc(w)}` },
      { id: 'linguee', name: 'Linguee', hint: 'dict.hint.linguee', url: `https://www.linguee.com/german-english/search?source=german&query=${enc(w)}` },
    );
  }
  links.push({ id: 'forvo', name: 'Forvo', hint: 'dict.hint.forvo', url: `https://forvo.com/word/${enc(w)}/#de` });
  return links;
}
