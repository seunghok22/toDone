import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/atoms/tabs";
import { Button } from "@/atoms/button";
import { Checkbox } from "@/atoms/checkbox";
import { useTaskStore } from "@/store/useTaskStore";
import { KanbanBoard } from "@/organisms/KanbanBoard";
import { WeeklyView } from "@/organisms/WeeklyView";
import { RecurringView } from "@/organisms/RecurringView";
import { GlobalCalendar } from "@/molecules/GlobalCalendar";
import { TaskDetailModal } from "@/organisms/TaskDetailModal";

export function MainLayout() {
  const { tasks, error, loadTasks, toggleTask, openCreateModal, openEditModal, selectedDate } = useTaskStore();
  const isReady = true;

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const dailyTasks = tasks.filter(t => t.due_date === selectedDate || t.category === "daily");

  if (!isReady) return <div className="p-4 flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="w-full max-w-[800px] mx-auto h-screen flex flex-col select-none bg-transparent">
      {error && <div className="bg-destructive text-destructive-foreground p-3 m-6 mb-0 rounded-md text-sm">{error}</div>}
      <header className="flex justify-between items-center px-6 pt-6 pb-2 shrink-0">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">toDone</h1>
        <Button size="sm" variant="ghost">Settings</Button>
      </header>
      
      <GlobalCalendar />
      
      <Tabs defaultValue="daily" className="w-full h-full flex flex-col items-center overflow-hidden px-6 pt-4 pb-2">
        <TabsContent value="daily" className="w-full h-full flex flex-col overflow-hidden outline-none">
          <div className="flex-1 overflow-y-auto pr-2 pb-2">
            <div className="flex flex-col gap-3">
              {dailyTasks.length === 0 && (
                <p className="text-center text-muted-foreground mt-10 text-sm">No tasks for today. Add one below!</p>
              )}
              {dailyTasks.map((task) => (
                <div key={task.id} onClick={() => openEditModal(task)} className="bg-card p-4 rounded-xl flex items-center justify-between gap-3 border border-border group transition-all hover:bg-card/80 hover:border-primary/40 shadow-sm cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <Checkbox 
                      id={task.id} 
                      checked={task.is_completed === 1} 
                      onCheckedChange={() => toggleTask(task.id, task.is_completed)} 
                      onClick={e => e.stopPropagation()}
                    />
                    <label 
                      htmlFor={task.id} 
                      className={`text-sm font-medium leading-snug truncate pointer-events-none ${task.is_completed === 1 ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}
                    >
                      {task.title}
                    </label>
                  </div>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add New Task
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
          <TabsTrigger value="daily" className="flex-1 h-full rounded-lg data-[state=active]:shadow-sm">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 h-full rounded-lg data-[state=active]:shadow-sm">Weekly</TabsTrigger>
          <TabsTrigger value="recurring" className="flex-1 h-full rounded-lg data-[state=active]:shadow-sm">Recurring</TabsTrigger>
          <TabsTrigger value="all" className="flex-1 h-full rounded-lg data-[state=active]:shadow-sm">All</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <TaskDetailModal />
    </div>
  );
}
