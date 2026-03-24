import { create } from 'zustand';
import Database from '@tauri-apps/plugin-sql';
import { addDays, addWeeks, addMonths, parseISO, format } from 'date-fns';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  is_completed: number;
  due_date: string | null;
  category: string | null;
  created_at: string;
  status: 'todo' | 'in-progress' | 'done';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
}

interface TaskStore {
  tasks: Task[];
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  loadTasks: () => Promise<void>;
  
  isModalOpen: boolean;
  editingTask: Task | null;
  openCreateModal: (defaultDate?: string) => void;
  openEditModal: (task: Task) => void;
  closeModal: () => void;
  saveTask: (taskData: Partial<Task>) => Promise<void>;

  updateTaskStatus: (id: string, newStatus: 'todo' | 'in-progress' | 'done') => Promise<void>;
  toggleTask: (id: string, currentStatus: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const generateNextDueDate = (current: string | null, recurrence: string) => {
  const baseDate = current ? parseISO(current) : new Date();
  let nextDate = baseDate;
  if (recurrence === 'daily') nextDate = addDays(baseDate, 1);
  else if (recurrence === 'weekly') nextDate = addWeeks(baseDate, 1);
  else if (recurrence === 'monthly') nextDate = addMonths(baseDate, 1);
  return format(nextDate, 'yyyy-MM-dd');
};

const handleRecurringTaskCreation = async (db: Database, task: Task) => {
  if (task.recurrence !== 'none') {
    const effectiveDueDate = task.due_date || task.created_at.split('T')[0];
    const newDueDate = generateNextDueDate(effectiveDueDate, task.recurrence);
    
    const existing = await db.select<Task[]>('SELECT id FROM tasks WHERE title = $1 AND recurrence = $2 AND due_date = $3', [task.title, task.recurrence, newDueDate]);
    if (existing && existing.length > 0) {
      return; // Duplicate guard: task for the next cycle already exists
    }

    const newId = Date.now().toString() + Math.random().toString(36).substring(2);
    const created_at = new Date().toISOString();
    await db.execute(
      'INSERT INTO tasks (id, title, description, is_completed, due_date, category, created_at, status, recurrence) VALUES ($1, $2, $3, 0, $4, $5, $6, $7, $8)',
      [newId, task.title, task.description || null, newDueDate, task.category || null, created_at, 'todo', task.recurrence]
    );
  }
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  isModalOpen: false,
  editingTask: null,
  openCreateModal: (defaultDate) => {
    set({ isModalOpen: true, editingTask: { id: '', title: '', status: 'todo', is_completed: 0, recurrence: 'none', due_date: defaultDate || get().selectedDate, category: 'daily', created_at: '' } as Task });
  },
  openEditModal: (task) => set({ isModalOpen: true, editingTask: task }),
  closeModal: () => set({ isModalOpen: false, editingTask: null }),

  loadTasks: async () => {
    try {
      const db = await Database.load('sqlite:todone.db');
      const result = await db.select<Task[]>('SELECT * FROM tasks ORDER BY created_at DESC');
      set({ tasks: result, error: null });
    } catch (e) {
      console.error("Failed to load tasks", e);
      set({ error: "Load DB Error: " + String(e) });
    }
  },
  
  saveTask: async (taskData) => {
    try {
      const db = await Database.load('sqlite:todone.db');
      if (taskData.id) {
        const { id, title, description, due_date, category, status, recurrence } = taskData;
        const isCompleted = status === 'done' ? 1 : 0;
        const originalTask = get().tasks.find(t => t.id === id);
        
        await db.execute(
          'UPDATE tasks SET title = $1, description = $2, due_date = $3, category = $4, status = $5, is_completed = $6, recurrence = $7 WHERE id = $8',
          [title, description || null, due_date || null, category || null, status, isCompleted, recurrence || 'none', id]
        );
        
        if (status === 'done' && originalTask && originalTask.status !== 'done') {
           const updatedTask = { ...originalTask, title: title || originalTask.title, due_date: due_date || originalTask.due_date, recurrence: recurrence || originalTask.recurrence } as Task;
           await handleRecurringTaskCreation(db, updatedTask);
        }
      } else {
        const id = Date.now().toString() + Math.random().toString(36).substring(2);
        const { title, description, due_date, category, recurrence } = taskData;
        const created_at = new Date().toISOString();
        const status = 'todo';
        await db.execute(
          'INSERT INTO tasks (id, title, description, is_completed, due_date, category, created_at, status, recurrence) VALUES ($1, $2, $3, 0, $4, $5, $6, $7, $8)',
          [id, title, description || null, due_date || null, category || null, created_at, status, recurrence || 'none']
        );
      }
      set({ isModalOpen: false, editingTask: null });
      await get().loadTasks();
    } catch (e) {
      console.error("Failed to save task", e);
      set({ error: "Save DB Error: " + String(e) });
    }
  },

  updateTaskStatus: async (id, newStatus) => {
    try {
      const db = await Database.load('sqlite:todone.db');
      const isCompleted = newStatus === 'done' ? 1 : 0;
      const task = get().tasks.find(t => t.id === id);
      
      await db.execute('UPDATE tasks SET status = $1, is_completed = $2 WHERE id = $3', [newStatus, isCompleted, id]);
      
      if (newStatus === 'done' && task && task.status !== 'done') {
        await handleRecurringTaskCreation(db, task);
      }
      await get().loadTasks();
    } catch (e) {
      console.error("Failed to update status", e);
      set({ error: "Status Update DB Error: " + String(e) });
    }
  },
  
  toggleTask: async (id, currentStatus) => {
    try {
      const db = await Database.load('sqlite:todone.db');
      const newCompleted = currentStatus === 0 ? 1 : 0;
      const newStatus = newCompleted === 1 ? 'done' : 'todo';
      const task = get().tasks.find(t => t.id === id);

      await db.execute('UPDATE tasks SET is_completed = $1, status = $2 WHERE id = $3', [newCompleted, newStatus, id]);
      
      if (newStatus === 'done' && task && task.status !== 'done') {
        await handleRecurringTaskCreation(db, task);
      }
      await get().loadTasks();
    } catch (e) {
      console.error("Failed to toggle task", e);
      set({ error: "Toggle DB Error: " + String(e) });
    }
  },
  
  deleteTask: async (id) => {
    try {
      const db = await Database.load('sqlite:todone.db');
      await db.execute('DELETE FROM tasks WHERE id = $1', [id]);
      await get().loadTasks();
    } catch (e) {
      console.error("Failed to delete task", e);
      set({ error: "Delete DB Error: " + String(e) });
    }
  }
}));
