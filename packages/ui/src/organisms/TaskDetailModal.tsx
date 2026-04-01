import { useState, useEffect } from "react";
import { useTaskStore } from '@todone/store';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { useTranslation } from "react-i18next";

export function TaskDetailModal() {
  const { isModalOpen, closeModal, editingTask, saveTask, deleteTask, selectedDate } = useTaskStore();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [noDeadline, setNoDeadline] = useState(false);
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>("todo");
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>("none");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | null>(null);

  useEffect(() => {
    if (isModalOpen && editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      const hasNoDeadline = editingTask.due_date === null || editingTask.due_date === '';
      setNoDeadline(hasNoDeadline);
      setDueDate(editingTask.due_date || "");
      // cancelled 태스크는 모달에서 편집 불가 — todo로 폴백
      const safeStatus = editingTask.status === 'cancelled' ? 'todo' : editingTask.status;
      setStatus(safeStatus || "todo");
      setRecurrence(editingTask.recurrence || "none");
      setPriority(editingTask.priority ?? null);
    }
  }, [isModalOpen, editingTask]);

  if (!isModalOpen || !editingTask) return null;

  const isEditMode = editingTask.id !== '';

  const handleSave = () => {
    if (!title.trim()) return;

    let finalDueDate: string | undefined = undefined;
    if (noDeadline) {
      finalDueDate = undefined; // No deadline — due_date will be null
    } else if (recurrence !== 'none' && !dueDate) {
      finalDueDate = selectedDate;
    } else {
      finalDueDate = dueDate || undefined;
    }

    saveTask({
      id: isEditMode ? editingTask.id : undefined,
      title,
      description,
      due_date: finalDueDate,
      status,
      recurrence,
      priority,
    });
    closeModal();
  };

  const handleDelete = () => {
    if (!isEditMode) return;
    deleteTask(editingTask.id);
    closeModal();
  };

  // 우선순위 버튼 스타일 helper
  const priorityBtnClass = (p: 'high' | 'medium' | 'low') => {
    const selected = priority === p;
    const colors: Record<string, string> = {
      high: selected
        ? 'bg-red-500/20 border-red-500 text-red-400'
        : 'border-border text-muted-foreground hover:bg-red-500/10',
      medium: selected
        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
        : 'border-border text-muted-foreground hover:bg-yellow-500/10',
      low: selected
        ? 'bg-green-500/20 border-green-500 text-green-400'
        : 'border-border text-muted-foreground hover:bg-green-500/10',
    };
    return `flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${colors[p]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold tracking-tight">{isEditMode ? "Edit Task" : "New Task"}</h2>
          <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </Button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[70vh] no-scrollbar">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('modal.field.title')}</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title..." className="font-semibold text-base py-5" autoFocus />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('modal.field.description')}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details, notes, or sub-items..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 resize-none"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
            <div className="flex gap-2">
              <button type="button" className={priorityBtnClass('high')} onClick={() => setPriority(priority === 'high' ? null : 'high')}>🔴 High</button>
              <button type="button" className={priorityBtnClass('medium')} onClick={() => setPriority(priority === 'medium' ? null : 'medium')}>🟡 Medium</button>
              <button type="button" className={priorityBtnClass('low')} onClick={() => setPriority(priority === 'low' ? null : 'low')}>🟢 Low</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date + No Deadline toggle */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('modal.field.dueDate')}</label>
                <button
                  type="button"
                  onClick={() => { setNoDeadline(!noDeadline); if (!noDeadline) setDueDate(''); }}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${noDeadline ? 'bg-primary/15 border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                >
                  No deadline
                </button>
              </div>
              <Input
                type="date"
                value={dueDate}
                onChange={e => { setDueDate(e.target.value); setNoDeadline(false); }}
                disabled={noDeadline}
                className={`shadow-sm h-11 text-sm font-medium ${noDeadline ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('modal.field.status')}</label>
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

          {/* Recurrence */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('modal.field.recurrence')}</label>
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
