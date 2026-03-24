import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { Task, useTaskStore } from '@/store/useTaskStore';

function KanbanColumn({ id, title, tasks }: { id: string, title: string, tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 bg-muted/20 border ${isOver ? 'border-primary' : 'border-transparent'} rounded-xl p-4 flex flex-col gap-3 min-h-[400px] h-full overflow-hidden transition-colors`}
    >
      <h3 className="font-semibold text-sm text-foreground mb-1 shrink-0">{title} <span className="text-muted-foreground ml-1 font-normal">{tasks.length}</span></h3>
      <div className="flex flex-col gap-2 overflow-y-auto h-full pr-1 no-scrollbar pb-10">
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
      className={`bg-card p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-between hover:border-foreground/20 transition-colors ${task.status === 'done' ? 'line-through text-muted-foreground bg-muted/50' : 'border-border text-foreground'}`}
    >
      <span className="text-sm font-medium leading-snug">{task.title}</span>
    </div>
  );
}

export function KanbanBoard() {
  const { tasks, updateTaskStatus } = useTaskStore();
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

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 w-full h-full pb-2">
        <KanbanColumn id="todo" title="To Do" tasks={todoTasks} />
        <KanbanColumn id="in-progress" title="In Progress" tasks={inProgressTasks} />
        <KanbanColumn id="done" title="Done" tasks={doneTasks} />
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
