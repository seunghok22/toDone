import { useTaskStore } from "@/store/useTaskStore";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from "date-fns";

export function MonthlyView() {
  const { tasks, selectedDate } = useTaskStore();
  const currentDate = new Date(selectedDate);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const calendarTasks = tasks.filter(t => t.recurrence === 'none' && t.due_date);
  const noDueDateTasks = tasks.filter(t => !t.due_date && t.recurrence === 'none');
  
  return (
    <div className="flex flex-col h-full w-full gap-4 overflow-hidden pb-2">
      <div className="flex-1 border rounded-xl overflow-hidden bg-card flex flex-col shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-[10px] uppercase font-semibold text-muted-foreground">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = calendarTasks.filter(t => t.due_date === dateStr);
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div key={i} className={`border-b border-r border-border p-1 lg:p-1.5 overflow-hidden flex flex-col ${!isCurrentMonth ? 'bg-muted/10 opacity-40' : ''}`}>
                <div className={`text-[11px] font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </div>
                <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 no-scrollbar">
                  {dayTasks.map(t => (
                    <div key={t.id} className="text-[9px] leading-tight truncate bg-primary/15 text-primary outline outline-1 outline-primary/20 px-1 py-0.5 rounded-sm">
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="h-[25%] min-h-[120px] bg-card border rounded-xl p-3 lg:p-4 flex flex-col shadow-sm">
        <h3 className="text-xs font-semibold mb-2 text-muted-foreground shrink-0 uppercase tracking-wide">No Due Date</h3>
        <div className="flex flex-col gap-1 overflow-y-auto pr-2">
          {noDueDateTasks.length === 0 && <p className="text-xs text-muted-foreground italic">All tasks are scheduled</p>}
          {noDueDateTasks.map(t => (
            <div key={t.id} className="text-xs p-2 border rounded flex justify-between bg-background items-center">
              <span className="truncate">{t.title}</span>
              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded shrink-0">{t.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
