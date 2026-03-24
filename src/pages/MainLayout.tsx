import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/atoms/tabs";
import { Button } from "@/atoms/button";
import { Input } from "@/atoms/input";
import { Checkbox } from "@/atoms/checkbox";
import { useTaskStore } from "@/store/useTaskStore";
import { KanbanBoard } from "@/organisms/KanbanBoard";
import { WeeklyView } from "@/organisms/WeeklyView";
import { GlobalCalendar } from "@/molecules/GlobalCalendar";

export function MainLayout() {
  const { tasks, error, loadTasks, addTask, toggleTask, deleteTask, selectedDate } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const isReady = true;

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const dailyTasks = tasks.filter(t => t.due_date === selectedDate || t.category === "daily");

  const handleAdd = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask(newTaskTitle, "daily", selectedDate);
    setNewTaskTitle("");
  };

  if (!isReady) return <div className="p-4 flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="w-full max-w-[800px] mx-auto h-screen flex flex-col select-none bg-transparent">
      {error && <div className="bg-destructive text-destructive-foreground p-3 m-6 mb-0 rounded-md text-sm">{error}</div>}
      <header className="flex justify-between items-center px-6 pt-6 pb-2 shrink-0">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">toDone</h1>
        <Button size="sm" variant="ghost">Settings</Button>
      </header>
      
      <GlobalCalendar />
      
      <Tabs defaultValue="daily" className="w-full h-full flex flex-col items-center overflow-hidden px-6 pt-4 pb-6">
        <TabsList className="mb-4 w-fit shrink-0">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="w-full h-full flex flex-col overflow-hidden outline-none">
          <div className="flex-1 overflow-y-auto pr-2 pb-2">
            <div className="flex flex-col gap-3">
              {dailyTasks.length === 0 && (
                <p className="text-center text-muted-foreground mt-10 text-sm">No tasks for today. Add one below!</p>
              )}
              {dailyTasks.map((task) => (
                <div key={task.id} className="bg-card p-4 rounded-xl flex items-center justify-between gap-3 border border-border group transition-colors hover:bg-card/80">
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <Checkbox 
                      id={task.id} 
                      checked={task.is_completed === 1} 
                      onCheckedChange={() => toggleTask(task.id, task.is_completed)} 
                    />
                    <label 
                      htmlFor={task.id} 
                      className={`text-sm font-medium leading-snug truncate transition-all cursor-pointer ${task.is_completed === 1 ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}
                    >
                      {task.title}
                    </label>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    tabIndex={-1}
                    className="opacity-0 group-hover:opacity-100 transition-opacity size-7 text-destructive hover:text-destructive hover:bg-destructive/10" 
                    onClick={() => deleteTask(task.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4 shrink-0 px-1 pb-1">
            <Input 
              placeholder="Add a new daily task..." 
              className="flex-1 bg-input !border-none shadow-sm focus-visible:ring-1" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} className="shadow-sm">Add</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="w-full flex-1 outline-none overflow-hidden pb-4">
          <WeeklyView />
        </TabsContent>
        <TabsContent value="all" className="w-full flex-1 outline-none overflow-hidden flex flex-col">
          <KanbanBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
