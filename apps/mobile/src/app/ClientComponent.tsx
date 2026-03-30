"use client";

import { useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Checkbox, KanbanBoard, WeeklyView, RecurringView, GlobalCalendar, TaskDetailModal, SettingsModal } from '@todone/ui';
import { useTranslation } from 'react-i18next';
import { useTaskStore, isTaskInPeriod } from '@todone/store';
import I18nProvider from '../providers/I18nProvider';

export default function MobileAppClient() {
  const { tasks, loadTasks, syncRecurringTasks, error, selectedDate, allTabPeriod, openCreateModal, toggleTask, openEditModal, isSettingsModalOpen, setSettingsModalOpen } = useTaskStore();
  const isReady = true;

  const { t } = useTranslation();

  useEffect(() => {
    const init = async () => {
      // Because we refactored useTaskStore to fallback to localStorage if Tauri FS is absent
      await loadTasks();
      await syncRecurringTasks();
    };
    init();

    const handleFocus = () => {
      syncRecurringTasks();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadTasks, syncRecurringTasks]);

  const dailyTasks = useMemo(() => {
    return tasks.filter(t => {
      const effectiveDateStr = t.due_date || ((t.recurrence === 'none') ? t.created_at.split('T')[0] : null);
      if (!effectiveDateStr) return false;

      const isExactlyToday = effectiveDateStr.startsWith(selectedDate);
      const isActiveInProgress = t.status === 'in-progress'
        && isTaskInPeriod(effectiveDateStr, selectedDate, allTabPeriod);

      return isExactlyToday || isActiveInProgress;
    });
  }, [tasks, selectedDate, allTabPeriod]);

  if (!isReady) return <div className="p-4 flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <I18nProvider>
      <div className="w-full h-[100dvh] flex flex-col select-none bg-background overflow-hidden relative">
        {error && <div className="bg-destructive text-destructive-foreground p-3 m-4 mb-0 rounded-xl text-sm">{error}</div>}
        
        <header className="flex justify-between items-center px-4 pt-4 pb-2 shrink-0 border-b border-border/30 bg-background/80 backdrop-blur-sm z-10">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">toDone Mobile</h1>
          <Button size="sm" variant="ghost" onClick={() => setSettingsModalOpen(true)}>{t('app.settings')}</Button>
        </header>

        <GlobalCalendar />

        <Tabs defaultValue="daily" className="w-full flex-1 flex flex-col items-center overflow-hidden">
          <TabsContent value="daily" className="w-full h-full flex flex-col overflow-hidden outline-none px-4 pt-4">
            <div className="flex-1 overflow-y-auto pr-1 pb-2">
              <div className="flex flex-col gap-3">
                {dailyTasks.length === 0 && (
                  <p className="text-center text-muted-foreground mt-10 text-sm">{t('daily.empty')}</p>
                )}
                {dailyTasks.map((task) => (
                  <div key={task.id} onClick={() => openEditModal(task)} className="bg-card p-4 rounded-xl flex items-center justify-between gap-3 border border-border group active:bg-card/80 active:border-primary/40 shadow-sm">
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} className="flex items-center">
                        <Checkbox
                          id={task.id}
                          checked={task.is_completed === 1}
                          onCheckedChange={() => toggleTask(task.id, task.is_completed)}
                        />
                      </div>
                      <label
                        htmlFor={task.id}
                        className={`text-sm font-medium leading-snug truncate pointer-events-none ${task.is_completed === 1 ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}
                      >
                        {task.title}
                      </label>
                    </div>
                    {task.recurrence !== 'none' && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider shrink-0">
                        {task.recurrence}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 px-1 mt-2">
              <Button
                variant="ghost"
                onClick={() => openCreateModal(selectedDate)}
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium h-10 rounded-lg px-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                {t('daily.addTask')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="w-full h-full min-h-0 outline-none overflow-hidden flex flex-col px-4 pt-4 pb-4">
            <WeeklyView />
          </TabsContent>

          <TabsContent value="recurring" className="w-full h-full min-h-0 outline-none overflow-hidden flex flex-col px-4 pt-4 pb-4">
            <RecurringView />
          </TabsContent>

          <TabsContent value="all" className="w-full h-full min-h-0 outline-none overflow-hidden flex flex-col px-4 pt-4 pb-4">
            <KanbanBoard />
          </TabsContent>

          <TabsList className="mt-auto w-full flex shrink-0 h-16 bg-card border-t border-border rounded-none p-2 gap-1 pb-safe">
            <TabsTrigger value="daily" className="flex-1 h-full rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">{t('tab.daily')}</TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 h-full rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">{t('tab.weekly')}</TabsTrigger>
            <TabsTrigger value="recurring" className="flex-1 h-full rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">{t('tab.recurring')}</TabsTrigger>
            <TabsTrigger value="all" className="flex-1 h-full rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary">{t('tab.all')}</TabsTrigger>
          </TabsList>
        </Tabs>

        <TaskDetailModal />
        <SettingsModal 
          open={isSettingsModalOpen} 
          onOpenChange={setSettingsModalOpen} 
        />
      </div>
    </I18nProvider>
  );
}
