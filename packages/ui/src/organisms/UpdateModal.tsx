import { useState } from 'react';
import { relaunch } from '@tauri-apps/plugin-process';
import { useTaskStore } from '@todone/store';
import { Button } from '../atoms/button';
import { useTranslation } from 'react-i18next';
import { isTauri } from '@todone/utils';

export function UpdateModal() {
  const { isUpdateModalOpen, setUpdateModalOpen, pendingUpdate } = useTaskStore();
  const { t } = useTranslation();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isTauri() || !isUpdateModalOpen || !pendingUpdate) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await pendingUpdate.downloadAndInstall();
      await relaunch();
    } catch (e) {
      console.error('[AutoUpdater] install failed:', e);
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <h2 className="text-base font-bold tracking-tight">{t('update.title')}</h2>
          </div>
          <p className="text-xs text-muted-foreground ml-11">
            {t('update.available', { version: pendingUpdate.version })}
          </p>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-muted-foreground">{t('update.description')}</p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2 justify-end bg-muted/10">
          <Button
            variant="outline"
            onClick={() => setUpdateModalOpen(false)}
            disabled={isInstalling}
          >
            {t('update.later')}
          </Button>
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            className="font-semibold px-5 hover:scale-105 transition-transform"
          >
            {isInstalling ? t('update.installing') : t('update.install')}
          </Button>
        </div>
      </div>
    </div>
  );
}
