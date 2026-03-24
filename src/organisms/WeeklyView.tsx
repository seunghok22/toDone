import { useTaskStore, Task, isTaskInPeriod } from "@/store/useTaskStore";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { Checkbox } from "@/atoms/checkbox";

export function WeeklyView() {
  const { tasks, toggleTask, openEditModal, selectedDate, allTabPeriod } = useTaskStore();
  const currentDate = parseISO(selectedDate);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const weeklyTasks = tasks.filter(t => {
    if (t.recurrence === 'weekly') return true;
    
    const effectiveDateStr = t.due_date || t.created_at.split('T')[0];
    const effectiveDate = parseISO(effectiveDateStr);
    
    // 1. 해당 주에 속하는 작업
    const isThisWeek = effectiveDate >= weekStart && effectiveDate <= weekEnd;
    
    // 2. 마감일 지남 + in-progress 상태 + allTabPeriod 설정 범위 내 (carry-over)
    const isOverdueInProgress = t.status === 'in-progress'
      && effectiveDate < weekStart
      && isTaskInPeriod(effectiveDateStr, selectedDate, allTabPeriod);
      
    return isThisWeek || isOverdueInProgress;
  });
  
  const doneTasks = weeklyTasks.filter(t => t.status === 'done');
  const todoTasks = weeklyTasks.filter(t => t.status !== 'done');
  
  const TaskItem = ({ task }: { task: Task }) => (
    <div onClick={() => openEditModal(task)} className="cursor-pointer bg-card p-3 rounded-lg border border-border flex items-center gap-3 transition-colors hover:bg-muted/50 hover:border-primary/40 group shadow-sm">
      <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} className="flex items-center shrink-0">
        <Checkbox 
          checked={task.status === 'done'}
          onCheckedChange={() => toggleTask(task.id, task.is_completed)}
        />
      </div>
      <span className={`text-sm flex-1 truncate ${task.status === 'done' ? 'line-through text-muted-foreground opacity-70' : 'text-foreground font-medium'}`}>
        {task.title}
      </span>
      {task.due_date && (
        <span className="text-[10px] bg-secondary text-secondary-foreground border border-border/50 px-2 py-1 rounded-md font-bold uppercase tracking-wider shrink-0 shadow-sm">
          {format(parseISO(task.due_date), 'MM.dd')}
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
