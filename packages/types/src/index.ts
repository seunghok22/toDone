export interface Task {
  id: string;
  title: string;
  description?: string | null;
  is_completed: number;
  due_date: string | null;
  category: string | null;
  created_at: string;
  last_modified: string;
  status: 'todo' | 'in-progress' | 'done' | 'cancelled';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
}
