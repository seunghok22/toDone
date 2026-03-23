import React from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Task, useTaskStore } from '@/store/useTaskStore';

function KanbanColumn({ id, title, tasks }: { id: string, title: string, tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 bg-muted/20 border ${isOver ? 'border-primary' : 'border-transparent'} rounded-xl p-4 flex flex-col gap-3 min-h-[400px] transition-colors`}
    >
      <h3 className="font-semibold text-sm text-foreground mb-1">{title} <span className="text-muted-foreground ml-1 font-normal">{tasks.length}</span></h3>
      <div className="flex flex-col gap-2 flex-1">
        {tasks.map(task => <KanbanCard key={task.id} task={task} />)}
      </div>
    </div>
  );
}

function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  });
  
  const style: React.CSSProperties = transform ? { 
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  } : {};
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-card p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing flex items-center justify-between hover:border-foreground/20 transition-colors ${task.status === 'done' ? 'line-through text-muted-foreground bg-muted/50' : 'border-border text-foreground'}`}
    >
      <span className="text-sm font-medium leading-snug">{task.title}</span>
    </div>
  );
}

export function KanbanBoard() {
  const { tasks, updateTaskStatus } = useTaskStore();

  const handleDragEnd = (event: DragEndEvent) => {
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

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 w-full h-full pb-2">
        <KanbanColumn id="todo" title="To Do" tasks={todoTasks} />
        <KanbanColumn id="in-progress" title="In Progress" tasks={inProgressTasks} />
        <KanbanColumn id="done" title="Done" tasks={doneTasks} />
      </div>
    </DndContext>
  );
}
