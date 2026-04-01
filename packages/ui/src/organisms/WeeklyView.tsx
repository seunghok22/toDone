import { useMemo } from 'react';
import { useTaskStore, isTaskInPeriod } from '@todone/store';
import type { Task } from '@todone/types';;
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { Checkbox } from '../atoms/checkbox';
import { useTranslation } from "react-i18next";

const TaskItem = ({ task }: { task: Task }) => {
  const { toggleTask, openEditModal } = useTaskStore();
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done';

  const borderClass = isOverdue
    ? 'border-red-500/60'
    : task.priority === 'high' ? 'border-red-500/20'
    : task.priority === 'medium' ? 'border-yellow-500/20'
    : task.priority === 'low' ? 'border-green-500/20'
    : 'border-border';

  return (
    <div onClick={() => openEditModal(task)} className={`cursor-pointer bg-card p-3 rounded-lg border ${borderClass} flex items-center gap-3 transition-colors hover:bg-muted/50 hover:border-primary/40 group shadow-sm`}>
      <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} className="flex items-center shrink-0">
        <Checkbox 
          checked={task.status === 'done'}
          onCheckedChange={() => toggleTask(task.id, task.is_completed)}
        />
      </div>
      <span className={`text-sm flex-1 truncate ${task.status === 'done' ? 'line-through text-muted-foreground opacity-70' : 'text-foreground font-medium'}`}>
        {task.title}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {isOverdue && (
          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Overdue</span>
        )}
        {task.priority && (
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
            task.priority === 'high' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
            task.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
            'bg-green-500/15 text-green-400 border-green-500/30'
          }`}>{task.priority}</span>
        )}
        {task.due_date && (
          <span className="text-[10px] bg-secondary text-secondary-foreground border border-border/50 px-2 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">
            {format(parseISO(task.due_date), 'MM.dd')}
          </span>
        )}
      </div>
    </div>
  );
};

export function WeeklyView() {
  const { tasks, selectedDate, allTabPeriod } = useTaskStore();
  const { t } = useTranslation();
  
  const { todoTasks, doneTasks } = useMemo(() => {
    const currentDate = parseISO(selectedDate);
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    const wTasks = tasks.filter(t => {
      if (t.status === 'cancelled') return false;
      if (t.recurrence === 'weekly') return true;
      
      const effectiveDateStr = t.due_date || t.created_at.split('T')[0];
      const effectiveDate = parseISO(effectiveDateStr);
      
      const isThisWeek = effectiveDate >= start && effectiveDate <= end;
      const isActiveInProgress = t.status === 'in-progress'
        && isTaskInPeriod(effectiveDateStr, selectedDate, allTabPeriod);
        
      return isThisWeek || isActiveInProgress;
    });

    return {
      doneTasks: wTasks.filter(t => t.status === 'done'),
      todoTasks: wTasks.filter(t => t.status !== 'done')
    };
  }, [tasks, selectedDate, allTabPeriod]);

  return (
    <div className="flex flex-col h-full w-full gap-6 overflow-y-auto pr-2 pb-4 no-scrollbar">
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('weekly.pending')}</h3>
        {todoTasks.length === 0 && (
          <div className="text-sm p-4 border border-dashed rounded-lg text-center text-muted-foreground/70 bg-muted/20">
            {t('weekly.emptyPending')}
          </div>
        )}
        {todoTasks.map(t => <TaskItem key={t.id} task={t} />)}
      </div>
      
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('weekly.completed')}</h3>
        {doneTasks.length === 0 && (
          <div className="text-sm p-4 border border-dashed rounded-lg text-center text-muted-foreground/70 bg-muted/20">
            {t('weekly.emptyCompleted')}
          </div>
        )}
        {doneTasks.map(t => <TaskItem key={t.id} task={t} />)}
      </div>
    </div>
  );
}
