import { useEffect, useState } from 'react';
import { relaunch } from '@tauri-apps/plugin-process';
import { getVersion } from '@tauri-apps/api/app';
import { useTaskStore } from '@todone/store';
import { Button } from '../atoms/button';
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { isTauri } from "@todone/utils";
import { IcsImportSection } from './IcsImportSection';

interface SettingsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps = {}) {
  const store = useTaskStore();
  
  const isSettingsModalOpen = open !== undefined ? open : store.isSettingsModalOpen;
  const setSettingsModalOpen = onOpenChange !== undefined ? onOpenChange : store.setSettingsModalOpen;
  
  const {
    allTabPeriod, setAllTabPeriod,
    autoDeleteDays, setAutoDeleteDays,
    pendingUpdate,
    syncUuid, syncPin, isSyncing, lastSyncedAt, syncError,
    initSyncCredentials, syncWithCloud,
  } = store;
  const { t, i18n } = useTranslation();
  const [isInstalling, setIsInstalling] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [showSyncInfo, setShowSyncInfo] = useState(false);
  const [isEditingSync, setIsEditingSync] = useState(false);
  const [editUuid, setEditUuid] = useState('');
  const [editPin, setEditPin] = useState('');

  useEffect(() => {
    if (isTauri()) {
      getVersion().then(setAppVersion).catch(console.error);
    } else {
      setAppVersion('Web/PWA');
    }
  }, []);

  // 동기화 자격 증명 자동 초기화 로직 제거 (사용자가 명시적으로 선택하도록 변경)

  const handleQuit = async () => { if (isTauri()) { await invoke('quit_app'); } };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('todone-language', lang);
  };

  const handleInstallUpdate = async () => {
    if (!pendingUpdate) return;
    setIsInstalling(true);
    try {
      await pendingUpdate.downloadAndInstall();
      await relaunch();
    } catch (e) {
      console.error('[AutoUpdater] install failed:', e);
      setIsInstalling(false);
    }
  };

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-card w-full max-w-sm rounded-2xl shadow-xl flex flex-col border border-border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/20 shrink-0">
          <h2 className="text-lg font-bold tracking-tight">{t('settings.title')}</h2>
          <Button variant="ghost" size="icon" onClick={() => setSettingsModalOpen(false)} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </Button>
        </div>

        <div className="p-5 flex flex-col gap-6 overflow-y-auto no-scrollbar">
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

          {/* Auto Delete (#5) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-muted-foreground tracking-wider">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5 -mt-0.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              오래된 작업 자동 삭제
            </label>
            <p className="text-xs text-muted-foreground mb-1">설정한 기간이 지난 태스크를 앱 시작 시 자동으로 삭제합니다.</p>
            <div className="flex gap-2">
              {([0, 7, 30] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setAutoDeleteDays(days)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border ${autoDeleteDays === days ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:bg-muted/50'}`}
                >
                  {days === 0 ? '끄기' : `${days}일`}
                </button>
              ))}
            </div>
          </div>

          {/* Cloud Sync */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
            <label className="text-sm font-bold text-muted-foreground tracking-wider">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5 -mt-0.5"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
              {t('settings.sync.label')}
            </label>
            <p className="text-xs text-muted-foreground mb-1">{t('settings.sync.desc')}</p>
            
            <Button
              variant="outline"
              onClick={() => syncWithCloud()}
              disabled={isSyncing || !syncUuid}
              className={`w-full justify-between items-center h-10 font-medium rounded-lg transition-colors ${isSyncing ? 'opacity-60' : 'hover:border-primary/50'}`}
            >
              <span className="text-sm">
                {isSyncing ? t('settings.sync.syncing') : t('settings.sync.button')}
              </span>
              {lastSyncedAt && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(lastSyncedAt).toLocaleTimeString()}
                </span>
              )}
            </Button>

            {!syncUuid && (
              <div className="flex flex-col gap-2 mt-2">
                <Button onClick={initSyncCredentials} className="w-full text-xs h-8">
                  {t('settings.sync.enable') || '새 계정으로 동기화 켜기'}
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border/50 flex-1"></div>
                  <span className="text-[10px] text-muted-foreground uppercase">or</span>
                  <div className="h-px bg-border/50 flex-1"></div>
                </div>
                {isEditingSync ? (
                  <div className="bg-muted/30 rounded-lg p-3 flex flex-col gap-2 text-xs font-mono border border-primary/30">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">UUID</span>
                      <input 
                        type="text" 
                        value={editUuid}
                        onChange={(e) => setEditUuid(e.target.value)}
                        className="bg-transparent border border-input rounded px-2 py-1 flex-1 focus:outline-none focus:border-primary/50" 
                        placeholder="기존 UUID 입력"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">PIN</span>
                      <input 
                        type="text" 
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value)}
                        className="bg-transparent border border-input rounded px-2 py-1 flex-1 focus:outline-none focus:border-primary/50" 
                        placeholder="기존 PIN 입력"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button onClick={() => setIsEditingSync(false)} className="text-muted-foreground hover:text-foreground">Cancel</button>
                      <button 
                        onClick={() => {
                          store.setSyncCredentials(editUuid, editPin);
                          setIsEditingSync(false);
                        }}
                        className="text-primary font-medium hover:text-primary/80"
                      >Connect</button>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={() => setIsEditingSync(true)} className="w-full text-xs h-8">
                    기존 계정 연결하기
                  </Button>
                )}
              </div>
            )}

            {syncError && (
              <p className="text-xs text-destructive mt-1">{syncError}</p>
            )}

            {syncUuid && (
              <div className="mt-1">
                <div className="flex justify-between items-center mb-1">
                  <button 
                    onClick={() => {
                      if (!isEditingSync) {
                        setEditUuid(syncUuid);
                        setEditPin(syncPin);
                        setShowSyncInfo(true);
                      }
                      setIsEditingSync(!isEditingSync);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {isEditingSync ? t('settings.sync.cancelEdit') || 'Cancel Edit' : (showSyncInfo ? '▾ ' : '▸ ') + t('settings.sync.info')}
                  </button>
                  {isEditingSync && (
                    <button
                      onClick={() => {
                        store.setSyncCredentials(editUuid, editPin);
                        setIsEditingSync(false);
                      }}
                      className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      {t('settings.sync.save') || 'Save'}
                    </button>
                  )}
                </div>
                
                {showSyncInfo && syncUuid && !isEditingSync && (
                  <div className="bg-muted/30 rounded-lg p-3 flex flex-col gap-1.5 text-xs font-mono border border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">UUID</span>
                      <span className="text-foreground truncate ml-2 max-w-[200px]">{syncUuid}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">PIN</span>
                      <span className="text-foreground">{syncPin}</span>
                    </div>
                  </div>
                )}

                {isEditingSync && (
                  <div className="bg-muted/30 rounded-lg p-3 flex flex-col gap-2 text-xs font-mono border border-primary/30">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">UUID</span>
                      <input 
                        type="text" 
                        value={editUuid}
                        onChange={(e) => setEditUuid(e.target.value)}
                        className="bg-transparent border border-input rounded px-2 py-1 flex-1 focus:outline-none focus:border-primary/50" 
                        placeholder="UUID"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">PIN</span>
                      <input 
                        type="text" 
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value)}
                        className="bg-transparent border border-input rounded px-2 py-1 w-full focus:outline-none focus:border-primary/50" 
                        placeholder="PIN"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ICS Import */}
          <IcsImportSection />

          {/* Version & Update (Only available in desktop) */}
          {isTauri() && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-muted-foreground tracking-wider">{t('settings.version')}</label>
              <Button
                variant="outline"
                disabled={!pendingUpdate || isInstalling}
                onClick={handleInstallUpdate}
                className={`w-full justify-between items-center h-10 font-medium rounded-lg transition-colors ${pendingUpdate ? 'border-primary/50 text-primary hover:bg-primary/10' : 'text-muted-foreground opacity-60 cursor-default'}`}
              >
                <span className="text-xs text-muted-foreground font-mono">
                  v{appVersion || '...'}
                </span>
                <span className="text-sm">
                  {isInstalling
                    ? t('update.installing')
                    : pendingUpdate
                      ? t('settings.update.available', { version: pendingUpdate.version })
                      : t('settings.update.latest')}
                </span>
              </Button>
            </div>
          )}

          {/* App / Quit (Only available in desktop) */}
          {isTauri() && (
            <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
              <label className="text-sm font-bold text-muted-foreground tracking-wider">{t('settings.app.label')}</label>
              <p className="text-xs text-muted-foreground mb-1">{t('settings.app.desc')}</p>
              <Button
                variant="ghost"
                onClick={handleQuit}
                className="w-full justify-start gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive border border-destructive/20 rounded-lg h-10 font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                {t('settings.quit')}
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end bg-muted/10 shrink-0">
          <Button onClick={() => setSettingsModalOpen(false)} className="font-semibold px-6 hover:scale-105 transition-transform">{t('settings.done')}</Button>
        </div>
      </div>
    </div>
  );
}
