import { create } from 'zustand';
import { BaseDirectory, readTextFile, writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { addDays, addWeeks, addMonths, parseISO, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { debounce } from 'lodash-es';
import type { Update } from '@tauri-apps/plugin-updater';
import { parseIcsToTasks, generateIcsFromTasks } from '@todone/utils';
import type { Task } from '@todone/types';

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

  // 외부 ICS Import
  importExternalIcs: (externalTasks: Task[]) => Promise<void>;

  // Auto updater
  pendingUpdate: Update | null;
  setPendingUpdate: (update: Update | null) => void;
  isUpdateModalOpen: boolean;
  setUpdateModalOpen: (isOpen: boolean) => void;
}

const ICS_FILENAME = 'todone.ics';
const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const nowIso = () => new Date().toISOString();

async function loadIcsData(): Promise<string> {
  if (isTauri()) {
    try {
      const hasDir = await exists('', { baseDir: BaseDirectory.AppData });
      if (!hasDir) await mkdir('', { baseDir: BaseDirectory.AppData });
        
      const hasFile = await exists(ICS_FILENAME, { baseDir: BaseDirectory.AppData });
      if (hasFile) {
        return await readTextFile(ICS_FILENAME, { baseDir: BaseDirectory.AppData });
      }
    } catch (e) {
      console.warn("Failed to load ICS from FS", e);
    }
  } else {
    return localStorage.getItem(ICS_FILENAME) || '';
  }
  return '';
}

async function saveIcsData(content: string): Promise<void> {
  if (isTauri()) {
    try {
      const hasDir = await exists('', { baseDir: BaseDirectory.AppData });
      if (!hasDir) await mkdir('', { baseDir: BaseDirectory.AppData });
      
      await writeTextFile(ICS_FILENAME, content, { baseDir: BaseDirectory.AppData });
    } catch (e) {
      console.error("Failed to save ICS to FS", e);
    }
  } else {
    localStorage.setItem(ICS_FILENAME, content);
  }
}

const triggerSave = debounce(async (tasks: Task[]) => {
  const fileString = generateIcsFromTasks(tasks);
  await saveIcsData(fileString);
}, 3000);

const generateNextDueDate = (current: string | null, recurrence: string) => {
  const baseDate = current ? parseISO(current) : new Date();
  let nextDate = baseDate;
  if (recurrence === 'daily') nextDate = addDays(baseDate, 1);
  else if (recurrence === 'weekly') nextDate = addWeeks(baseDate, 1);
  else if (recurrence === 'monthly') nextDate = addMonths(baseDate, 1);
  return format(nextDate, 'yyyy-MM-dd');
};

/** UI 표시용: cancelled(Tombstone) 상태의 태스크를 필터링 */
const filterActiveTasks = (tasks: Task[]) => tasks.filter(t => t.status !== 'cancelled');

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
  allTabPeriod: (typeof window !== 'undefined' ? localStorage.getItem('allTabPeriod') : null) as any || 'all',
  setAllTabPeriod: (period) => {
    localStorage.setItem('allTabPeriod', period);
    set({ allTabPeriod: period });
  },

  // Auto updater
  pendingUpdate: null,
  setPendingUpdate: (update) => set({ pendingUpdate: update }),
  isUpdateModalOpen: false,
  setUpdateModalOpen: (isOpen) => set({ isUpdateModalOpen: isOpen }),

  openCreateModal: (defaultDate) => {
    set({ isModalOpen: true, editingTask: { id: '', title: '', status: 'todo', is_completed: 0, recurrence: 'none', due_date: defaultDate || get().selectedDate, category: 'daily', created_at: '', last_modified: '' } as Task });
  },
  openEditModal: (task) => set({ isModalOpen: true, editingTask: task }),
  closeModal: () => set({ isModalOpen: false, editingTask: null }),

  loadTasks: async () => {
    try {
      const icsString = await loadIcsData();
      const loadedTasks = parseIcsToTasks(icsString);
      loadedTasks.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      // Tombstone 포함 전체 저장 (cancelled 포함), UI에서 filterActiveTasks로 필터
      set({ tasks: loadedTasks, error: null });
    } catch (e) {
      console.error("Failed to load tasks", e);
      set({ error: "Load ICS Error: " + String(e) });
    }
  },
  
  saveTask: async (taskData) => {
    try {
      const currentTasks = [...get().tasks];
      const timestamp = nowIso();
      if (taskData.id) {
        const { id, title, description, due_date, category, status, recurrence } = taskData;
        const isCompleted = status === 'done' ? 1 : 0;
        
        const idx = currentTasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          currentTasks[idx] = { ...currentTasks[idx], title, description: description||null, due_date: due_date||null, category: category||null, status, is_completed: isCompleted, recurrence: recurrence || 'none', last_modified: timestamp } as Task;
        }
      } else {
        const id = Date.now().toString() + Math.random().toString(36).substring(2);
        const { title, description, due_date, category, recurrence } = taskData;
        const created_at = timestamp;
        const status: Task['status'] = 'todo';
        
        currentTasks.unshift({
           id, title: title!, description: description || null, is_completed: 0, 
           due_date: due_date || null, category: category || null, 
           created_at, last_modified: timestamp, status, recurrence: recurrence || 'none'
        });
      }
      set({ tasks: currentTasks, isModalOpen: false, editingTask: null });
      triggerSave(currentTasks);
    } catch (e) {
      console.error("Failed to save task", e);
      set({ error: "Save ICS Error: " + String(e) });
    }
  },

  updateTaskStatus: async (id, newStatus) => {
    try {
      const isCompleted = newStatus === 'done' ? 1 : 0;
      const timestamp = nowIso();
      const currentTasks = get().tasks.map(t => t.id === id ? { ...t, status: newStatus, is_completed: isCompleted, last_modified: timestamp } : t);
      set({ tasks: currentTasks });
      triggerSave(currentTasks);
    } catch (e) {
      console.error("Failed to update status", e);
      set({ error: "Status Update ICS Error: " + String(e) });
    }
  },
  
  toggleTask: async (id, currentStatus) => {
    try {
      const newCompleted = currentStatus === 0 ? 1 : 0;
      const newStatus: Task['status'] = newCompleted === 1 ? 'done' : 'todo';
      const timestamp = nowIso();
      const currentTasks = get().tasks.map(t => t.id === id ? { ...t, is_completed: newCompleted, status: newStatus, last_modified: timestamp } : t);
      set({ tasks: currentTasks });
      triggerSave(currentTasks);
    } catch (e) {
      console.error("Failed to toggle task", e);
      set({ error: "Failed to toggle task" });
    }
  },
  
  /** Soft Delete: 물리 삭제 대신 STATUS:CANCELLED로 변경 (Tombstone) */
  deleteTask: async (id) => {
    try {
      const timestamp = nowIso();
      const currentTasks = get().tasks.map(t => 
        t.id === id ? { ...t, status: 'cancelled' as const, is_completed: 0, last_modified: timestamp } : t
      );
      set({ tasks: currentTasks });
      triggerSave(currentTasks);
    } catch (e) {
      console.error("Failed to delete task", e);
      set({ error: "Delete ICS Error: " + String(e) });
    }
  },

  syncRecurringTasks: async () => {
    try {
      const currentTasks = [...get().tasks];
      const activeTasks = filterActiveTasks(currentTasks);
      const recurrentTasks = activeTasks.filter(t => t.recurrence !== 'none');
      
      const seriesMap = new Map<string, Task[]>();
      recurrentTasks.forEach(t => {
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
          return tB - tA;
        });
        
        const latestTask = instances[0];
        let lastGeneratedDate = latestTask.due_date || latestTask.created_at.split('T')[0];

        while (new Date(lastGeneratedDate) < new Date(todayStr)) {
          lastGeneratedDate = generateNextDueDate(lastGeneratedDate, latestTask.recurrence);
          
          const existing = currentTasks.find(t => t.title === latestTask.title && t.recurrence === latestTask.recurrence && t.due_date === lastGeneratedDate);
          
          if (!existing) {
            const timestamp = nowIso();
            const newId = Date.now().toString() + Math.random().toString(36).substring(2);
            currentTasks.push({
               id: newId,
               title: latestTask.title,
               description: latestTask.description || null,
               is_completed: 0,
               due_date: lastGeneratedDate,
               category: latestTask.category || null,
               created_at: timestamp,
               last_modified: timestamp,
               status: 'todo',
               recurrence: latestTask.recurrence
            });
            isSynced = true;
          }
        }
      }
      
      if (isSynced) {
        currentTasks.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        set({ tasks: currentTasks });
        triggerSave(currentTasks);
      }
    } catch (e) {
      console.error("Failed to sync recurring tasks", e);
    }
  },

  /** 외부 ICS 파일에서 가져온 태스크를 기존 데이터에 병합 */
  importExternalIcs: async (externalTasks: Task[]) => {
    try {
      const currentTasks = [...get().tasks];
      const timestamp = nowIso();
      let imported = 0;

      for (const ext of externalTasks) {
        const existingIdx = currentTasks.findIndex(t => t.id === ext.id);
        if (existingIdx !== -1) {
          // UID 중복: last_modified 비교하여 최신만 반영
          const existing = currentTasks[existingIdx];
          if (new Date(ext.last_modified || ext.created_at).getTime() > new Date(existing.last_modified || existing.created_at).getTime()) {
            currentTasks[existingIdx] = { ...ext, last_modified: timestamp };
            imported++;
          }
        } else {
          // 신규 태스크
          currentTasks.unshift({ ...ext, last_modified: timestamp });
          imported++;
        }
      }

      if (imported > 0) {
        currentTasks.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        set({ tasks: currentTasks });
        triggerSave(currentTasks);
      }

      return;
    } catch (e) {
      console.error("Failed to import external ICS", e);
      set({ error: "Import Error: " + String(e) });
    }
  },
}));

/** UI에서 사용하는 활성 태스크만 반환하는 유틸리티 (cancelled 제외) */
export { filterActiveTasks };
