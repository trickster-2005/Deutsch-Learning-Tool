import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStore, writeStore } from './storage';
import { loadMeta } from './data';

export type ColorBy = 'level' | 'pos' | 'gender';
export type LevelSource = 'estimated' | 'custom';
export type Theme = 'system' | 'light' | 'dark';

interface Settings {
  myLevel: string | null;
  setMyLevel(v: string | null): void;
  colorBy: ColorBy;
  setColorBy(v: ColorBy): void;
  levelSource: LevelSource;
  setLevelSource(v: LevelSource): void;
  theme: Theme;
  setTheme(v: Theme): void;
  hasCustomLevels: boolean;
}

const isColorBy = (v: unknown): v is ColorBy => v === 'level' || v === 'pos' || v === 'gender';
const isTheme = (v: unknown): v is Theme => v === 'system' || v === 'light' || v === 'dark';
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const Ctx = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [myLevel, setMyLevelS] = useState<string | null>(() => {
    const v = readStore('gwf.myLevel');
    return v && LEVELS.includes(v) ? v : null;
  });
  const [colorBy, setColorByS] = useState<ColorBy>(() => {
    const v = readStore('gwf.colorBy');
    return isColorBy(v) ? v : 'level';
  });
  const [levelSource, setLevelSourceS] = useState<LevelSource>(() =>
    readStore('gwf.levelSource') === 'custom' ? 'custom' : 'estimated',
  );
  const [theme, setThemeS] = useState<Theme>(() => {
    const v = readStore('gwf.theme');
    return isTheme(v) ? v : 'system';
  });
  const [hasCustomLevels, setHasCustom] = useState(false);

  useEffect(() => {
    loadMeta()
      .then((m) => setHasCustom(!!m.has_custom_levels))
      .catch(() => setHasCustom(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo<Settings>(
    () => ({
      myLevel,
      setMyLevel: (v) => {
        setMyLevelS(v);
        writeStore('gwf.myLevel', v);
      },
      colorBy,
      setColorBy: (v) => {
        setColorByS(v);
        writeStore('gwf.colorBy', v);
      },
      levelSource: hasCustomLevels ? levelSource : 'estimated',
      setLevelSource: (v) => {
        setLevelSourceS(v);
        writeStore('gwf.levelSource', v);
      },
      theme,
      setTheme: (v) => {
        setThemeS(v);
        writeStore('gwf.theme', v);
      },
      hasCustomLevels,
    }),
    [myLevel, colorBy, levelSource, theme, hasCustomLevels],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): Settings {
  const s = useContext(Ctx);
  if (!s) throw new Error('SettingsProvider missing');
  return s;
}

export { isColorBy };
