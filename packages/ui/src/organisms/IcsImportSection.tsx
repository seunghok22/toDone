import { useState, useRef } from 'react';
import { useTaskStore } from '@todone/store';
import { parseIcsToTasks } from '@todone/utils';
import { useTranslation } from 'react-i18next';

export function IcsImportSection() {
  const { importExternalIcs } = useTaskStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [importCount, setImportCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.ics')) {
      setImportStatus('error');
      return;
    }

    setImportStatus('parsing');
    try {
      const text = await file.text();
      const parsed = parseIcsToTasks(text);
      
      if (parsed.length === 0) {
        setImportStatus('error');
        return;
      }

      await importExternalIcs(parsed);
      setImportCount(parsed.length);
      setImportStatus('success');
      
      // 3초 후 상태 리셋
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (e) {
      console.error('[IcsImport] failed:', e);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // input 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
      <label className="text-sm font-bold text-muted-foreground tracking-wider">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5 -mt-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        {t('settings.import.label')}
      </label>
      <p className="text-xs text-muted-foreground mb-1">{t('settings.import.desc')}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".ics"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragOver 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border/50 hover:border-primary/30 hover:bg-muted/20'
        }`}
      >
        {importStatus === 'idle' && (
          <div className="flex flex-col items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span className="text-sm text-muted-foreground font-medium">{t('settings.import.button')}</span>
            <span className="text-[10px] text-muted-foreground/60">.ics</span>
          </div>
        )}

        {importStatus === 'parsing' && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">{t('settings.import.parsing')}</span>
          </div>
        )}

        {importStatus === 'success' && (
          <div className="flex items-center justify-center gap-2 py-2 text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span className="text-sm font-medium">{t('settings.import.success', { count: importCount })}</span>
          </div>
        )}

        {importStatus === 'error' && (
          <div className="flex items-center justify-center gap-2 py-2 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span className="text-sm font-medium">{t('settings.import.error')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
