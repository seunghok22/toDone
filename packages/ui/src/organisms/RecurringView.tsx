import { useMemo } from 'react';
import { useTaskStore } from '@todone/store';
import type { Task } from '@todone/types';;
import { isSameMonth, parseISO, startOfWeek, endOfWeek, endOfMonth } from "date-fns";
import { Checkbox } from '../atoms/checkbox';
import { useTranslation } from "react-i18next";

type SeriesItem = {
  title: string;
  recurrence: string;
  isCompleted: boolean;
  taskRef: Task;
};

export function RecurringView() {
  const { tasks, selectedDate, toggleTask, openEditModal } = useTaskStore();
  const { t } = useTranslation();
  const { dailySeries, weeklySeries, monthlySeries, hasAnyData } = useMemo(() => {
    const currentDate = new Date(selectedDate);
    const recurringTasks = tasks.filter(t => t.recurrence !== 'none');
    
    const seriesMap = new Map<string, Task[]>();
    recurringTasks.forEach(task => {
      const key = `${task.title}-${task.recurrence}`;
      if (!seriesMap.has(key)) seriesMap.set(key, []);
      seriesMap.get(key)!.push(task);
    });
    
    const sData = Array.from(seriesMap.values()).map((instances) => {
      instances.sort((a, b) => {
        const getEffectiveDate = (t: Task) => t.due_date ? parseISO(t.due_date).getTime() : parseISO(t.created_at).getTime();
        return getEffectiveDate(b) - getEffectiveDate(a); // descending
      });

      const recurrenceType = instances[0].recurrence;
      const title = instances[0].title;
      
      const currentWeekStart = startOfWeek(currentDate);
      const currentWeekEnd = endOfWeek(currentDate);

      let currentCycleInstance = instances.find(t => {
        const effectiveStr = t.due_date || t.created_at.split('T')[0];
        const tDate = parseISO(effectiveStr);
        if (recurrenceType === 'daily') {
          return effectiveStr === selectedDate;
        } else if (recurrenceType === 'weekly') {
          return tDate >= currentWeekStart && tDate <= currentWeekEnd;
        } else if (recurrenceType === 'monthly') {
          return isSameMonth(tDate, currentDate);
        }
        return false;
      });
      
      let isCompletedForCycle = false;
      let targetTaskToToggle = currentCycleInstance || instances[0]; 
      
      if (currentCycleInstance) {
        isCompletedForCycle = currentCycleInstance.status === 'done';
      } else {
        const latestDate = parseISO(instances[0].due_date || selectedDate);
        const endOfCycle = 
          recurrenceType === 'daily' ? parseISO(selectedDate) :
          recurrenceType === 'weekly' ? currentWeekEnd :
          endOfMonth(currentDate); 
          
        if (latestDate > endOfCycle) {
           isCompletedForCycle = true;
        }
      }

      return {
        title,
        recurrence: recurrenceType,
        isCompleted: isCompletedForCycle,
        taskRef: targetTaskToToggle
      };
    });

    return {
      dailySeries: sData.filter(s => s.recurrence === 'daily'),
      weeklySeries: sData.filter(s => s.recurrence === 'weekly'),
      monthlySeries: sData.filter(s => s.recurrence === 'monthly'),
      hasAnyData: sData.length > 0
    };
  }, [tasks, selectedDate]);

  const renderSection = (title: string, data: SeriesItem[]) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">{title}</h3>
        <div className="flex flex-col gap-2">
          {data.map((item, i) => (
            <div 
              key={i} 
              onClick={() => openEditModal(item.taskRef)}
              className="bg-card p-3.5 rounded-xl border border-border flex items-center justify-between gap-3 transition-all hover:bg-card/80 hover:border-primary/40 shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} className="flex items-center">
                  <Checkbox 
                    checked={item.isCompleted} 
                    onCheckedChange={() => toggleTask(item.taskRef.id, item.taskRef.is_completed)} 
                  />
                </div>
                <span className={`text-sm font-medium truncate pointer-events-none ${item.isCompleted ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}>
                  {item.title}
                </span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider shrink-0">
                {item.recurrence}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-1 pr-2 pb-6 no-scrollbar h-full outline-none">
      {!hasAnyData && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 opacity-80 mt-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p className="text-sm font-medium">{t('recurring.empty')}</p>
        </div>
      )}
      {renderSection("Daily", dailySeries)}
      {renderSection("Weekly", weeklySeries)}
      {renderSection("Monthly", monthlySeries)}
    </div>
  );
}
