import { useTaskStore, Task } from "@/store/useTaskStore";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { Checkbox } from "@/atoms/checkbox";

export function WeeklyView() {
  const { tasks, toggleTask, deleteTask, selectedDate } = useTaskStore();
  const currentDate = new Date(selectedDate);
  
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  
  const weeklyTasks = tasks.filter(t => {
    if (t.recurrence === 'weekly') return true;
    if (t.due_date) {
      try {
        const date = parseISO(t.due_date);
        return isWithinInterval(date, { start: weekStart, end: weekEnd });
      } catch (e) {
        return false; // Safely handle parse errors
      }
    }
    return false;
  });
  
  const doneTasks = weeklyTasks.filter(t => t.status === 'done');
  const todoTasks = weeklyTasks.filter(t => t.status !== 'done');
  
  const TaskItem = ({ task }: { task: Task }) => (
    <div className="bg-card p-3 rounded-lg border border-border flex items-center gap-3 transition-colors hover:bg-muted/50 group shadow-sm">
      <Checkbox 
        checked={task.status === 'done'}
        onCheckedChange={() => toggleTask(task.id, task.is_completed)}
      />
      <span className={`text-sm flex-1 truncate ${task.status === 'done' ? 'line-through text-muted-foreground opacity-70' : 'text-foreground font-medium'}`}>
        {task.title}
      </span>
      {task.recurrence === 'weekly' && (
        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-medium shrink-0">
          Weekly
        </span>
      )}
      <button 
        onClick={() => deleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 p-1.5 rounded-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full gap-6 overflow-y-auto pr-2 pb-4 no-scrollbar">
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pending This Week</h3>
        {todoTasks.length === 0 && (
          <div className="text-sm p-4 border border-dashed rounded-lg text-center text-muted-foreground/70 bg-muted/20">
            No pending tasks this week.
          </div>
        )}
        {todoTasks.map(t => <TaskItem key={t.id} task={t} />)}
      </div>
      
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Completed</h3>
        {doneTasks.length === 0 && (
          <div className="text-sm p-4 border border-dashed rounded-lg text-center text-muted-foreground/70 bg-muted/20">
            No completed tasks yet.
          </div>
        )}
        {doneTasks.map(t => <TaskItem key={t.id} task={t} />)}
      </div>
    </div>
  );
}
