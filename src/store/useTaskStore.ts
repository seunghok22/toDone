import { create } from 'zustand';
import Database from '@tauri-apps/plugin-sql';

export interface Task {
  id: string;
  title: string;
  is_completed: number;
  due_date: string | null;
  category: string | null;
  created_at: string;
}

interface TaskStore {
  tasks: Task[];
  error: string | null;
  loadTasks: () => Promise<void>;
  addTask: (title: string, category?: string) => Promise<void>;
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
  addTask: async (title, category) => {
    try {
      const db = await Database.load('sqlite:todone.db');
      const id = Date.now().toString() + Math.random().toString(36).substring(2); // Safe fallback UUID
      const created_at = new Date().toISOString();
      await db.execute(
        'INSERT INTO tasks (id, title, is_completed, due_date, category, created_at) VALUES ($1, $2, 0, NULL, $3, $4)',
        [id, title, category || null, created_at]
      );
      await get().loadTasks();
    } catch (e) {
      console.error("Failed to add task", e);
      set({ error: "Add DB Error: " + String(e) });
    }
  },
  toggleTask: async (id, currentStatus) => {
    try {
      const db = await Database.load('sqlite:todone.db');
      const newStatus = currentStatus === 0 ? 1 : 0;
      await db.execute('UPDATE tasks SET is_completed = $1 WHERE id = $2', [newStatus, id]);
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
