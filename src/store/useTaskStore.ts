import { create } from 'zustand';
import Database from '@tauri-apps/plugin-sql';

export interface Task {
  id: string;
  title: string;
  is_completed: number;
  due_date: string | null;
  category: string | null;
  created_at: string;
  status: 'todo' | 'in-progress' | 'done';
}

interface TaskStore {
  tasks: Task[];
  error: string | null;
  loadTasks: () => Promise<void>;
  addTask: (title: string, category?: string, dueDate?: string | null) => Promise<void>;
  updateTaskStatus: (id: string, newStatus: 'todo' | 'in-progress' | 'done') => Promise<void>;
  toggleTask: (id: string, currentStatus: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  error: null,
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
  addTask: async (title, category, dueDate) => {
    try {
      const db = await Database.load('sqlite:todone.db');
      const id = Date.now().toString() + Math.random().toString(36).substring(2); // Safe fallback UUID
      const created_at = new Date().toISOString();
      await db.execute(
        'INSERT INTO tasks (id, title, is_completed, due_date, category, created_at, status) VALUES ($1, $2, 0, $3, $4, $5, $6)',
        [id, title, dueDate || null, category || null, created_at, 'todo']
      );
      await get().loadTasks();
    } catch (e) {
      console.error("Failed to add task", e);
      set({ error: "Add DB Error: " + String(e) });
    }
  },
  updateTaskStatus: async (id, newStatus) => {
    try {
      const db = await Database.load('sqlite:todone.db');
      // If setting to done, also update is_completed for backward compatibility or toggle logic
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
