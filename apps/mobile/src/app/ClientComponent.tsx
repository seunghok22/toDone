"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Checkbox, KanbanBoard, WeeklyView, RecurringView, GlobalCalendar, TaskDetailModal, SettingsModal } from '@todone/ui';
import { useTranslation } from 'react-i18next';
import { useTaskStore, useAutoSync, isTaskInPeriod } from '@todone/store';
import I18nProvider from '../providers/I18nProvider';

export default function MobileAppClient() {
  const { tasks, loadTasks, syncRecurringTasks, error, selectedDate, allTabPeriod, openCreateModal, toggleTask, openEditModal, isSettingsModalOpen, setSettingsModalOpen } = useTaskStore();
  useAutoSync();
  const isReady = true;

  const { t } = useTranslation();

  // 검색 상태 (#6)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
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

  const today = new Date().toISOString().split('T')[0];

  const dailyTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === 'cancelled') return false;
      // No-deadline 태스크 항상 노출 (#9)
      if (!t.due_date && t.recurrence === 'none') return true;
      const effectiveDateStr = t.due_date || ((t.recurrence === 'none') ? t.created_at.split('T')[0] : null);
      if (!effectiveDateStr) return false;

      const isExactlyToday = effectiveDateStr.startsWith(selectedDate);
      const isActiveInProgress = t.status === 'in-progress'
        && isTaskInPeriod(effectiveDateStr, selectedDate, allTabPeriod);

      return isExactlyToday || isActiveInProgress;
    });
  }, [tasks, selectedDate, allTabPeriod]);

  // 검색 결과 (#6): 제목/내용 기준 실시간 필터링
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return tasks.filter(t =>
      t.status !== 'cancelled' &&
      (t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
    ).slice(0, 8);
  }, [tasks, searchQuery]);

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  if (!isReady) return <div className="p-4 flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <I18nProvider>
      <div className="w-full h-[100dvh] flex flex-col select-none bg-background overflow-hidden relative">
        {error && <div className="bg-destructive text-destructive-foreground p-3 m-4 mb-0 rounded-xl text-sm">{error}</div>}

        <header className="flex justify-between items-center px-4 pt-4 pb-2 shrink-0 border-b border-border/30 bg-background/80 backdrop-blur-sm z-10">
          {isSearchOpen ? (
            <div className="flex-1 flex items-center gap-2 animate-in slide-in-from-top-1 duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button onClick={closeSearch} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">toDone Mobile</h1>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={openSearch} className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSettingsModalOpen(true)}>{t('app.settings')}</Button>
              </div>
            </>
          )}
        </header>

        {/* 검색 결과 드롭다운 (#6) */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="mx-4 mt-1 bg-card border border-border rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in duration-150">
            {searchResults.length === 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground">No results found</div>
            ) : (
              <div className="flex flex-col max-h-64 overflow-y-auto">
                {searchResults.map(task => (
                  <button
                    key={task.id}
                    onClick={() => { openEditModal(task); closeSearch(); }}
                    className="flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'done' ? 'bg-muted-foreground/40' : task.status === 'in-progress' ? 'bg-blue-400' : 'bg-primary'}`} />
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>}
                    </div>
                    {task.due_date && <span className="text-[10px] text-muted-foreground shrink-0">{task.due_date}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <GlobalCalendar />

        <Tabs defaultValue="daily" className="w-full flex-1 flex flex-col items-center overflow-hidden">
          <TabsContent value="daily" className="w-full h-full flex flex-col overflow-hidden outline-none px-4 pt-4">
            <div className="flex-1 overflow-y-auto pr-1 pb-2">
              <div className="flex flex-col gap-3">
                {dailyTasks.length === 0 && (
                  <p className="text-center text-muted-foreground mt-10 text-sm">{t('daily.empty')}</p>
                )}
                {dailyTasks.map((task) => {
                  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done';
                  const priorityBg: Record<string, string> = {
                    high: 'bg-red-500/10 border-red-500/30',
                    medium: 'bg-yellow-500/8 border-yellow-500/20',
                    low: 'bg-green-500/8 border-green-500/20',
                  };
                  const cardBorder = isOverdue
                    ? 'border-red-500/60'
                    : task.priority && priorityBg[task.priority]
                      ? priorityBg[task.priority]
                      : 'border-border';

                  return (
                    <div key={task.id} onClick={() => openEditModal(task)} className={`bg-card p-4 rounded-xl flex items-center justify-between gap-3 border group active:bg-card/80 active:border-primary/40 shadow-sm ${cardBorder}`}>
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOverdue && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">OD</span>
                        )}
                        {!task.due_date && (
                          <span className="text-[10px] bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">∞</span>
                        )}
                        {task.priority && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                            task.priority === 'high' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                            task.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                            'bg-green-500/15 text-green-400 border-green-500/30'
                          }`}>{task.priority[0].toUpperCase()}</span>
                        )}
                        {task.recurrence !== 'none' && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {task.recurrence}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
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
