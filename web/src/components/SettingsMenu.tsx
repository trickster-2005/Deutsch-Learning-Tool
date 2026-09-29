import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../i18n/i18n';
import { MY_LEVELS } from '../lib/levels';
import { useSettings, type ColorBy, type LevelSource, type Theme } from '../lib/settings';

export function SettingsMenu() {
  const { t } = useI18n();
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="rel" ref={ref}>
      <button type="button" className="btn icon-btn ghost" aria-label={t('settings.open')} title={t('settings.title')} aria-expanded={open} aria-controls={`${id}-menu`} onClick={() => setOpen((o) => !o)}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.7 7.7 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.7 7.7 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.3 7.3 0 0 0 1.7 1L11 21h4l.4-2.9a7.3 7.3 0 0 0 1.7-1l2.5 1 2-3.5ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" transform="translate(-1 0)" /></svg>
      </button>
      {open && (
        <div className="popover menu-pop" id={`${id}-menu`} role="dialog" aria-label={t('settings.title')}>
          <label htmlFor={`${id}-lvl`}>{t('settings.myLevel')}</label>
          <select id={`${id}-lvl`} value={s.myLevel ?? ''} onChange={(e) => s.setMyLevel(e.target.value || null)}>
            <option value="">{t('settings.myLevel.none')}</option>
            {MY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <label htmlFor={`${id}-color`}>{t('settings.colorBy')}</label>
          <select id={`${id}-color`} value={s.colorBy} onChange={(e) => s.setColorBy(e.target.value as ColorBy)}>
            {(['level', 'pos', 'gender'] as ColorBy[]).map((c) => <option key={c} value={c}>{t(`settings.colorBy.${c}`)}</option>)}
          </select>
          {s.hasCustomLevels && (
            <>
              <label htmlFor={`${id}-src`}>{t('settings.levelSource')}</label>
              <select id={`${id}-src`} value={s.levelSource} onChange={(e) => s.setLevelSource(e.target.value as LevelSource)}>
                <option value="estimated">{t('settings.levelSource.estimated')}</option>
                <option value="custom">{t('settings.levelSource.custom')}</option>
              </select>
            </>
          )}
          <label htmlFor={`${id}-theme`}>{t('settings.theme')}</label>
          <select id={`${id}-theme`} value={s.theme} onChange={(e) => s.setTheme(e.target.value as Theme)}>
            {(['system', 'light', 'dark'] as Theme[]).map((c) => <option key={c} value={c}>{t(`settings.theme.${c}`)}</option>)}
          </select>
          <p className="small muted" style={{ marginBottom: 0 }}>{t('guide.levelsNote')}</p>
        </div>
      )}
    </div>
  );
}
