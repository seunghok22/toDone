import { format, addDays, subDays, eachDayOfInterval } from "date-fns";
import { useTaskStore } from "@/store/useTaskStore";
import { useEffect, useRef } from "react";

export function CalendarStrip() {
  const { selectedDate, setSelectedDate } = useTaskStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const current = new Date(selectedDate || new Date());
  const startDate = subDays(current, 14);
  const endDate = addDays(current, 14);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  useEffect(() => {
    if (scrollRef.current) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        const selectedEl = scrollRef.current?.querySelector('[data-selected="true"]');
        if (selectedEl) {
          selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }, 50);
    }
  }, [selectedDate]);

  return (
    <div className="w-full flex items-center border-b border-border/40 py-3 shrink-0 overflow-x-auto no-scrollbar" ref={scrollRef}>
      <div className="flex gap-2 min-w-max mx-auto px-6">
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <button
              key={dateStr + i}
              data-selected={isSelected}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center justify-center w-11 h-14 rounded-2xl transition-all duration-200 ${
                isSelected 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : isToday 
                    ? 'bg-muted/80 text-foreground border border-primary/20 hover:bg-muted' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isSelected ? 'opacity-90' : 'opacity-60'}`}>
                {format(day, 'EEE')}
              </span>
              <span className="text-sm font-semibold">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
