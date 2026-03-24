import { useTaskStore, Task } from "@/store/useTaskStore";
import { isSameMonth, parseISO, startOfWeek, endOfWeek, endOfMonth } from "date-fns";
import { Checkbox } from "@/atoms/checkbox";

export function RecurringView() {
  const { tasks, selectedDate, toggleTask, openEditModal } = useTaskStore();
  const currentDate = new Date(selectedDate);
  const currentSelectedIso = selectedDate; // e.g. "2026-03-24"
  
  // 1. Get all recurring tasks and group by title to identify "series"
  const recurringTasks = tasks.filter(t => t.recurrence !== 'none');
  
  const seriesMap = new Map<string, Task[]>();
  recurringTasks.forEach(task => {
    const key = `${task.title}-${task.recurrence}`; // Group identifier
    if (!seriesMap.has(key)) seriesMap.set(key, []);
    seriesMap.get(key)!.push(task);
  });
  
  // 2. For each series, figure out the status for the current cycle
  const seriesData = Array.from(seriesMap.values()).map((instances) => {
    // sort instances by due_date descending to get the latest easily
    instances.sort((a, b) => {
      const dateA = a.due_date ? parseISO(a.due_date).getTime() : 0;
      const dateB = b.due_date ? parseISO(b.due_date).getTime() : 0;
      return dateB - dateA; // descending
    });

    const recurrenceType = instances[0].recurrence;
    const title = instances[0].title;
    
    // Find the instance that belongs to the CURRENT cycle based on selectedDate
    const currentWeekStart = startOfWeek(currentDate);
    const currentWeekEnd = endOfWeek(currentDate);

    let currentCycleInstance = instances.find(t => {
      if (!t.due_date) return false;
      const tDate = parseISO(t.due_date);
      if (recurrenceType === 'daily') {
        return t.due_date === currentSelectedIso;
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
      // Check if there is any instance with due_date strictly greater than the end of the current cycle.
      // If there is, it means the user already advanced the recurrence forward (completed it for this cycle).
      const latestDate = parseISO(instances[0].due_date || currentSelectedIso);
      const endOfCycle = 
        recurrenceType === 'daily' ? parseISO(currentSelectedIso) :
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
      taskRef: targetTaskToToggle // the actual DB task we will interact with
    };
  });

  const dailySeries = seriesData.filter(s => s.recurrence === 'daily');
  const weeklySeries = seriesData.filter(s => s.recurrence === 'weekly');
  const monthlySeries = seriesData.filter(s => s.recurrence === 'monthly');

  const renderSection = (title: string, data: typeof seriesData) => {
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
                <Checkbox 
                  checked={item.isCompleted} 
                  onCheckedChange={() => toggleTask(item.taskRef.id, item.taskRef.is_completed)} 
                  onClick={e => e.stopPropagation()}
                />
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
      {seriesData.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 opacity-80 mt-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p className="text-sm font-medium">No recurring tasks found.</p>
        </div>
      )}
      {renderSection("Daily", dailySeries)}
      {renderSection("Weekly", weeklySeries)}
      {renderSection("Monthly", monthlySeries)}
    </div>
  );
}
