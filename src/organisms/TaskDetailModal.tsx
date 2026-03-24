import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { Button } from "@/atoms/button";
import { Input } from "@/atoms/input";

export function TaskDetailModal() {
  const { isModalOpen, editingTask, closeModal, saveTask, deleteTask } = useTaskStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<'todo'|'in-progress'|'done'>("todo");
  const [recurrence, setRecurrence] = useState<'none'|'daily'|'weekly'|'monthly'>("none");

  useEffect(() => {
    if (isModalOpen && editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setDueDate(editingTask.due_date || "");
      setStatus(editingTask.status || "todo");
      setRecurrence(editingTask.recurrence || "none");
    }
  }, [isModalOpen, editingTask]);

  if (!isModalOpen || !editingTask) return null;

  const isEditMode = editingTask.id !== '';

  const handleSave = () => {
    if (!title.trim()) return;
    saveTask({
      id: isEditMode ? editingTask.id : undefined,
      title,
      description,
      due_date: dueDate || null,
      status,
      recurrence,
      category: editingTask.category
    });
  };

  const handleDelete = () => {
    if (!isEditMode) return;
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(editingTask.id);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold tracking-tight">{isEditMode ? "Edit Task" : "New Task"}</h2>
          <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>
        
        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[70vh] no-scrollbar">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title..." className="font-semibold text-base py-5" autoFocus />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Add details, notes, or sub-items..." 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Due Date</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="shadow-sm" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 font-medium"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recurrence</label>
            <select 
              value={recurrence} 
              onChange={e => setRecurrence(e.target.value as any)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 font-medium"
            >
              <option value="none">None (One-time)</option>
              <option value="daily">Daily (Every day)</option>
              <option value="weekly">Weekly (Every week)</option>
              <option value="monthly">Monthly (Every month)</option>
            </select>
            <p className="text-[10px] text-muted-foreground ml-1">When closed, a duplicate task for the next cycle will be automatically created.</p>
          </div>
        </div>
        
        <div className="p-4 border-t border-border flex justify-between bg-muted/10">
          {isEditMode ? (
            <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive">Delete</Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} className="font-semibold shadow-sm px-6">Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
