import { useTaskStore, Task } from "@/store/useTaskStore";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { Checkbox } from "@/atoms/checkbox";

export function WeeklyView() {
  const { tasks, toggleTask, openEditModal, selectedDate } = useTaskStore();
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
    <div onClick={() => openEditModal(task)} className="cursor-pointer bg-card p-3 rounded-lg border border-border flex items-center gap-3 transition-colors hover:bg-muted/50 hover:border-primary/40 group shadow-sm">
      <Checkbox 
        checked={task.status === 'done'}
        onCheckedChange={() => toggleTask(task.id, task.is_completed)}
        onClick={e => e.stopPropagation()}
      />
      <span className={`text-sm flex-1 truncate ${task.status === 'done' ? 'line-through text-muted-foreground opacity-70' : 'text-foreground font-medium'}`}>
        {task.title}
      </span>
      {task.recurrence === 'weekly' && (
        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-medium shrink-0">
          Weekly
        </span>
      )}
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
