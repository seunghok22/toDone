import React, { useState, useMemo } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { useTaskStore, isTaskInPeriod } from '@todone/store';
import type { Task } from '@todone/types';;

function KanbanColumn({ id, title, tasks }: { id: string, title: string, tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 bg-muted/20 border ${isOver ? 'border-primary' : 'border-transparent'} rounded-xl p-4 flex flex-col gap-3 min-h-0 transition-colors`}
    >
      <h3 className="font-semibold text-sm text-foreground mb-1 shrink-0">{title} <span className="text-muted-foreground ml-1 font-normal">{tasks.length}</span></h3>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0 pr-1 no-scrollbar pb-8">
        {tasks.map(task => <KanbanCard key={task.id} task={task} />)}
      </div>
    </div>
  );
}

function KanbanCard({ task }: { task: Task }) {
  const { openEditModal } = useTaskStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  });
  
  const style: React.CSSProperties = { 
    opacity: isDragging ? 0.3 : 1,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => openEditModal(task)}
      className={`bg-card p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-2 justify-between hover:border-foreground/20 transition-colors ${task.status === 'done' ? 'line-through text-muted-foreground bg-muted/50' : 'border-border text-foreground'}`}
    >
      <span className="text-sm font-medium leading-snug truncate flex-1">{task.title}</span>
      {task.recurrence !== 'none' && (
        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider shrink-0">
          {task.recurrence}
        </span>
      )}
    </div>
  );
}

export function KanbanBoard() {
  const { tasks, updateTaskStatus, selectedDate, allTabPeriod } = useTaskStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as 'todo' | 'in-progress' | 'done';
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === 'cancelled') return false;
      if (allTabPeriod === 'all') return true;
      
      const effectiveDateStr = t.due_date || t.created_at.split('T')[0];
      return isTaskInPeriod(effectiveDateStr, selectedDate, allTabPeriod);
    });
  }, [tasks, allTabPeriod, selectedDate]);

  const columns = [
    { id: 'todo', title: 'To Do', items: filteredTasks.filter(t => t.status === 'todo') },
    { id: 'in-progress', title: 'In Progress', items: filteredTasks.filter(t => t.status === 'in-progress') },
    { id: 'done', title: 'Done', items: filteredTasks.filter(t => t.status === 'done') },
  ];

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 w-full h-full pb-2">
        {columns.map(col => (
          <KanbanColumn key={col.id} id={col.id} title={col.title} tasks={col.items} />
        ))}
      </div>
      
      <DragOverlay dropAnimation={{ duration: 250, easing: 'ease-out' }}>
        {activeTask ? (
          <div className={`bg-card p-3 rounded-lg border shadow-xl cursor-grabbing flex items-center justify-between border-primary text-foreground opacity-95 scale-105 origin-center transition-none ${activeTask.status === 'done' ? 'line-through text-muted-foreground bg-muted/80 border-border' : ''}`}>
            <span className="text-sm font-medium leading-snug">{activeTask.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
