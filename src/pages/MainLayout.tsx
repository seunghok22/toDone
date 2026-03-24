import { useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/atoms/tabs";
import { Button } from "@/atoms/button";
import { Checkbox } from "@/atoms/checkbox";
import { useTaskStore, isTaskInPeriod } from "@/store/useTaskStore";
import { KanbanBoard } from "@/organisms/KanbanBoard";
import { WeeklyView } from "@/organisms/WeeklyView";
import { RecurringView } from "@/organisms/RecurringView";
import { GlobalCalendar } from "@/molecules/GlobalCalendar";
import { TaskDetailModal } from "@/organisms/TaskDetailModal";
import { SettingsModal } from "@/organisms/SettingsModal";
import { useTranslation } from "react-i18next";

export function MainLayout() {
  const { tasks, loadTasks, syncRecurringTasks, error, selectedDate, allTabPeriod, openCreateModal, toggleTask, openEditModal, setSettingsModalOpen } = useTaskStore();
  const { t } = useTranslation();
  const isReady = true;

  useEffect(() => {
    const init = async () => {
      await loadTasks();
      await syncRecurringTasks();
    };
    init();

    // 트레이 앱 특성상 화면에 띄울 때마다(Focus) 즉시 동기화 검사
    const handleFocus = () => {
      syncRecurringTasks();
    };
    window.addEventListener('focus', handleFocus);

    // 잠자기 해제 후 혹은 화면을 계속 띄워둘 때를 대비한 1시간 보조 타이머
    const intervalId = setInterval(() => {
      syncRecurringTasks();
    }, 1000 * 60 * 60);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [loadTasks, syncRecurringTasks]);

  const dailyTasks = useMemo(() => {
    return tasks.filter(t => {
      const effectiveDateStr = t.due_date || ((t.recurrence === 'none') ? t.created_at.split('T')[0] : null);
      if (!effectiveDateStr) return false;
      
      // 1. 해당 날짜에 할당된 찐 오늘 작업
      const isExactlyToday = effectiveDateStr.startsWith(selectedDate);
      
      // 2. in-progress 상태 + allTabPeriod 설정 범위 내 (항상 노출)
      const isActiveInProgress = t.status === 'in-progress' 
        && isTaskInPeriod(effectiveDateStr, selectedDate, allTabPeriod);
        
      return isExactlyToday || isActiveInProgress;
    });
  }, [tasks, selectedDate, allTabPeriod]);

  if (!isReady) return <div className="p-4 flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="w-full max-w-[800px] mx-auto h-screen flex flex-col select-none bg-transparent rounded-2xl overflow-hidden">
      {error && <div className="bg-destructive text-destructive-foreground p-3 m-4 mb-0 rounded-xl text-sm">{error}</div>}
      <header className="flex justify-between items-center px-6 pt-4 pb-1 shrink-0">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">toDone</h1>
        <Button size="sm" variant="ghost" onClick={() => setSettingsModalOpen(true)}>{t('app.settings')}</Button>
      </header>

      <GlobalCalendar />

      <Tabs defaultValue="daily" className="w-full h-full flex flex-col items-center overflow-hidden px-6 pt-4 pb-2">
        <TabsContent value="daily" className="w-full h-full flex flex-col overflow-hidden outline-none">
          <div className="flex-1 overflow-y-auto pr-2 pb-2">
            <div className="flex flex-col gap-3">
              {dailyTasks.length === 0 && (
                <p className="text-center text-muted-foreground mt-10 text-sm">{t('daily.empty')}</p>
              )}
              {dailyTasks.map((task) => (
                <div key={task.id} onClick={() => openEditModal(task)} className="bg-card p-4 rounded-xl flex items-center justify-between gap-3 border border-border group transition-all hover:bg-card/80 hover:border-primary/40 shadow-sm cursor-pointer">
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

        <TabsContent value="weekly" className="w-full h-full min-h-0 outline-none overflow-hidden flex flex-col pb-4">
          <WeeklyView />
        </TabsContent>

        <TabsContent value="recurring" className="w-full h-full min-h-0 outline-none overflow-hidden flex flex-col pb-4">
          <RecurringView />
        </TabsContent>

        <TabsContent value="all" className="w-full h-full min-h-0 outline-none overflow-hidden flex flex-col pb-4">
          <KanbanBoard />
        </TabsContent>

        <TabsList className="mt-auto w-full flex shrink-0 h-12 bg-muted/50 rounded-xl p-1 gap-1">
          <TabsTrigger value="daily" className="flex-1 h-full rounded-lg data-[state=active]:shadow-sm">{t('tab.daily')}</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 h-full rounded-lg data-[state=active]:shadow-sm">{t('tab.weekly')}</TabsTrigger>
          <TabsTrigger value="recurring" className="flex-1 h-full rounded-lg data-[state=active]:shadow-sm">{t('tab.recurring')}</TabsTrigger>
          <TabsTrigger value="all" className="flex-1 h-full rounded-lg data-[state=active]:shadow-sm">{t('tab.all')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <TaskDetailModal />
      <SettingsModal />
    </div>
  );
}
