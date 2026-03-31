import { useState } from "react";
import { useTaskStore } from '@todone/store';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { useTranslation } from "react-i18next";

export function GlobalCalendar() {
  const { tasks, selectedDate, setSelectedDate } = useTaskStore();
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const { t } = useTranslation();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayNames: string[] = t('calendar.days', { returnObjects: true }) as string[];
  
  // Filter out recurring tasks, keep only non-recurring with due_date
  const calendarTasks = tasks.filter(t => t.recurrence === 'none' && t.due_date && t.status !== 'cancelled');
  
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  return (
    <div className="flex flex-col w-full shrink-0 border border-white/10 bg-card/30 backdrop-blur-lg p-3 z-10 mx-3 rounded-xl" style={{width: 'calc(100% - 1.5rem)'}}>
      <div className="flex items-center justify-between mb-2 px-2">
        <h2 className="text-sm font-bold text-foreground tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day: string) => (
          <div key={day} className="text-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr gap-1">
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = calendarTasks.filter(t => t.due_date === dateStr);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = dateStr === selectedDate;
          
          return (
            <button 
              key={i} 
              onClick={() => {
                setSelectedDate(dateStr);
                if (!isCurrentMonth) setCurrentMonth(day);
              }}
              className={`p-1 flex flex-col items-center justify-start h-10 rounded-lg transition-all border ${isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-transparent hover:border-border hover:bg-white/5'} ${!isCurrentMonth ? 'opacity-35' : ''}`}
            >
              <div className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1 ${isSelected ? 'bg-primary text-primary-foreground' : isToday(day) ? 'bg-muted-foreground/20 text-foreground' : 'text-foreground'}`}>
                {format(day, 'd')}
              </div>
              <div className="flex gap-0.5 mt-auto flex-wrap justify-center w-full px-0.5 h-2 overflow-hidden">
                {dayTasks.slice(0, 3).map(t => (
                  <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${t.status === 'done' ? 'bg-muted-foreground/50' : 'bg-primary'}`} title={t.title} />
                ))}
                {dayTasks.length > 3 && <span className="text-[7px] font-bold text-primary leading-none ml-px">+{dayTasks.length-3}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
