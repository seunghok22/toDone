import { create } from 'zustand';
import Database from '@tauri-apps/plugin-sql';
import { addDays, addWeeks, addMonths, parseISO, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

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
  syncRecurringTasks: () => Promise<void>;
  
  isModalOpen: boolean;
  editingTask: Task | null;
  openCreateModal: (defaultDate?: string) => void;
  openEditModal: (task: Task) => void;
  closeModal: () => void;
  saveTask: (taskData: Partial<Task>) => Promise<void>;

  isSettingsModalOpen: boolean;
  setSettingsModalOpen: (isOpen: boolean) => void;
  allTabPeriod: 'all' | 'day' | 'week' | 'month' | 'year';
  setAllTabPeriod: (period: 'all' | 'day' | 'week' | 'month' | 'year') => void;

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

export const isTaskInPeriod = (effectiveDateStr: string, pivotDateStr: string, period: 'all' | 'day' | 'week' | 'month' | 'year') => {
  if (period === 'all') return true;
  if (period === 'day') return effectiveDateStr === pivotDateStr;
  
  const effectiveDate = parseISO(effectiveDateStr);
  const pivotDate = parseISO(pivotDateStr);
  
  if (period === 'week') {
    const start = startOfWeek(pivotDate, { weekStartsOn: 1 });
    const end = endOfWeek(pivotDate, { weekStartsOn: 1 });
    return effectiveDate >= start && effectiveDate <= end;
  } else if (period === 'month') {
    const start = startOfMonth(pivotDate);
    const end = endOfMonth(pivotDate);
    return effectiveDate >= start && effectiveDate <= end;
  } else if (period === 'year') {
    const start = startOfYear(pivotDate);
    const end = endOfYear(pivotDate);
    return effectiveDate >= start && effectiveDate <= end;
  }
  return true;
};


export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  isModalOpen: false,
  editingTask: null,
  
  isSettingsModalOpen: false,
  setSettingsModalOpen: (isOpen) => set({ isSettingsModalOpen: isOpen }),
  allTabPeriod: (localStorage.getItem('allTabPeriod') as any) || 'all',
  setAllTabPeriod: (period) => {
    localStorage.setItem('allTabPeriod', period);
    set({ allTabPeriod: period });
  },

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
        
        await db.execute(
          'UPDATE tasks SET title = $1, description = $2, due_date = $3, category = $4, status = $5, is_completed = $6, recurrence = $7 WHERE id = $8',
          [title, description || null, due_date || null, category || null, status, isCompleted, recurrence || 'none', id]
        );
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
      
      await db.execute('UPDATE tasks SET status = $1, is_completed = $2 WHERE id = $3', [newStatus, isCompleted, id]);
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

      await db.execute('UPDATE tasks SET is_completed = $1, status = $2 WHERE id = $3', [newCompleted, newStatus, id]);
      await get().loadTasks();
    } catch (e) {
      console.error("Failed to toggle task", e);
      set({ error: "Failed to toggle task" });
    }
  },
  
  syncRecurringTasks: async () => {
    try {
      const db = await Database.load('sqlite:todone.db');
      const tasks = get().tasks;
      const recurringTasks = tasks.filter(t => t.recurrence !== 'none');
      
      const seriesMap = new Map<string, Task[]>();
      recurringTasks.forEach(t => {
        const key = `${t.title}-${t.recurrence}`;
        if (!seriesMap.has(key)) seriesMap.set(key, []);
        seriesMap.get(key)!.push(t);
      });

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      let isSynced = false;

      for (const [_, instances] of seriesMap.entries()) {
        instances.sort((a, b) => {
          const tA = a.due_date ? new Date(a.due_date).getTime() : new Date(a.created_at).getTime();
          const tB = b.due_date ? new Date(b.due_date).getTime() : new Date(b.created_at).getTime();
          return tB - tA; // descending
        });
        
        const latestTask = instances[0];
        let lastGeneratedDate = latestTask.due_date || latestTask.created_at.split('T')[0];

        while (new Date(lastGeneratedDate) < new Date(todayStr)) {
          lastGeneratedDate = generateNextDueDate(lastGeneratedDate, latestTask.recurrence);
          
          const existing = await db.select<Task[]>('SELECT id FROM tasks WHERE title = $1 AND recurrence = $2 AND due_date = $3', [latestTask.title, latestTask.recurrence, lastGeneratedDate]);
          if (!existing || existing.length === 0) {
            const newId = Date.now().toString() + Math.random().toString(36).substring(2);
            await db.execute(
              'INSERT INTO tasks (id, title, description, is_completed, due_date, category, created_at, status, recurrence) VALUES ($1, $2, $3, 0, $4, $5, $6, $7, $8)',
              [newId, latestTask.title, latestTask.description || null, lastGeneratedDate, latestTask.category || null, new Date().toISOString(), 'todo', latestTask.recurrence]
            );
            isSynced = true;
          }
        }
      }
      
      if (isSynced) {
        await get().loadTasks();
      }
    } catch (e) {
      console.error("Failed to sync recurring tasks", e);
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
