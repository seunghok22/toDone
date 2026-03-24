import { useTaskStore } from "@/store/useTaskStore";
import { Button } from "@/atoms/button";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export function SettingsModal() {
  const { isSettingsModalOpen, setSettingsModalOpen, allTabPeriod, setAllTabPeriod } = useTaskStore();
  const { t } = useTranslation();

  const handleQuit = async () => {
    await invoke('quit_app');
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('todone-language', lang);
  };

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col border border-border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold tracking-tight">{t('settings.title')}</h2>
          <Button variant="ghost" size="icon" onClick={() => setSettingsModalOpen(false)} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </Button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* Language */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-muted-foreground tracking-wider">{t('settings.language.label')}</label>
            <p className="text-xs text-muted-foreground mb-1">{t('settings.language.desc')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border ${i18n.language === 'en' ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:bg-muted/50'}`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('ko')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border ${i18n.language === 'ko' ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:bg-muted/50'}`}
              >
                한국어
              </button>
            </div>
          </div>

          {/* All Tab Period */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-muted-foreground tracking-wider">{t('settings.allTabPeriod.label')}</label>
            <p className="text-xs text-muted-foreground mb-1">{t('settings.allTabPeriod.desc')}</p>
            <select
              value={allTabPeriod}
              onChange={(e) => setAllTabPeriod(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 font-medium"
            >
              <option value="all">{t('settings.allTabPeriod.all')}</option>
              <option value="day">{t('settings.allTabPeriod.day')}</option>
              <option value="week">{t('settings.allTabPeriod.week')}</option>
              <option value="month">{t('settings.allTabPeriod.month')}</option>
              <option value="year">{t('settings.allTabPeriod.year')}</option>
            </select>
          </div>

          {/* App / Quit */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
            <label className="text-sm font-bold text-muted-foreground tracking-wider">{t('settings.app.label')}</label>
            <p className="text-xs text-muted-foreground mb-1">{t('settings.app.desc')}</p>
            <Button
              variant="ghost"
              onClick={handleQuit}
              className="w-full justify-start gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive border border-destructive/20 rounded-lg h-10 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {t('settings.quit')}
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end bg-muted/10">
          <Button onClick={() => setSettingsModalOpen(false)} className="font-semibold px-6 hover:scale-105 transition-transform">{t('settings.done')}</Button>
        </div>
      </div>
    </div>
  );
}
