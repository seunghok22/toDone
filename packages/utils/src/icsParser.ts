import ICAL from 'ical.js';
import type { Task } from '@todone/types';

export function parseIcsToTasks(icsString: string): Task[] {
  if (!icsString || !icsString.trim()) return [];
  
  try {
    const jcalData = ICAL.parse(icsString);
    const comp = new ICAL.Component(jcalData);
    const vtodos = comp.getAllSubcomponents('vtodo');

    return vtodos.map((vtodo: any): Task => {
      const rruleProps = vtodo.getFirstProperty('rrule');
      let recurrence: Task['recurrence'] = 'none';
      if (rruleProps) {
        const rrule = rruleProps.getFirstValue();
        if (rrule && rrule.freq) {
          if (rrule.freq === 'DAILY') recurrence = 'daily';
          else if (rrule.freq === 'WEEKLY') recurrence = 'weekly';
          else if (rrule.freq === 'MONTHLY') recurrence = 'monthly';
        }
      }

      const completed = vtodo.getFirstPropertyValue('completed');
      const statusVal = vtodo.getFirstPropertyValue('status');
      
      let status: Task['status'] = 'todo';
      let is_completed = 0;
      if (statusVal === 'CANCELLED') {
        status = 'cancelled';
      } else if (statusVal === 'COMPLETED' || completed) {
        status = 'done';
        is_completed = 1;
      } else if (statusVal === 'IN-PROCESS') {
        status = 'in-progress';
      }

      const rootDue = vtodo.getFirstPropertyValue('due');
      let due_date = null;
      if (rootDue) {
         due_date = rootDue.toString().split('T')[0];
      }
      
      const rootCreated = vtodo.getFirstPropertyValue('dtstamp');
      let created_at = rootCreated ? rootCreated.toString() : new Date().toISOString();

      // LAST-MODIFIED 파싱
      const rootLastModified = vtodo.getFirstPropertyValue('last-modified');
      let last_modified = rootLastModified ? rootLastModified.toString() : created_at;

      return {
        id: vtodo.getFirstPropertyValue('uid') || Date.now().toString(),
        title: vtodo.getFirstPropertyValue('summary') || 'Untitled',
        description: vtodo.getFirstPropertyValue('description') || null,
        is_completed,
        due_date,
        category: vtodo.getFirstPropertyValue('categories') || 'daily',
        created_at,
        last_modified,
        status,
        recurrence
      };
    });
  } catch (err) {
    console.error("Failed to parse ICS string:", err);
    return [];
  }
}

export function generateIcsFromTasks(tasks: Task[]): string {
  const comp = new ICAL.Component(['vcalendar', [], []]);
  comp.updatePropertyWithValue('version', '2.0');
  comp.updatePropertyWithValue('prodid', '-//toDone//EN');

  tasks.forEach(task => {
    const vtodo = new ICAL.Component('vtodo');
    
    vtodo.updatePropertyWithValue('uid', task.id);
    vtodo.updatePropertyWithValue('summary', task.title);
    
    if (task.description) {
      vtodo.updatePropertyWithValue('description', task.description);
    }
    
    // STATUS 매핑 (cancelled = Tombstone)
    if (task.status === 'cancelled') {
      vtodo.updatePropertyWithValue('status', 'CANCELLED');
    } else if (task.status === 'done' || task.is_completed === 1) {
      vtodo.updatePropertyWithValue('status', 'COMPLETED');
    } else if (task.status === 'in-progress') {
      vtodo.updatePropertyWithValue('status', 'IN-PROCESS');
    } else {
      vtodo.updatePropertyWithValue('status', 'NEEDS-ACTION');
    }
    
    if (task.due_date) {
      const dueData = task.due_date.split('-');
      if (dueData.length === 3) {
        vtodo.updatePropertyWithValue('due', new ICAL.Time({
          year: parseInt(dueData[0]),
          month: parseInt(dueData[1]),
          day: parseInt(dueData[2]),
          isDate: true
        }, undefined as any));
      }
    }

    if (task.category) {
      vtodo.updatePropertyWithValue('categories', task.category);
    }

    // DTSTAMP (created_at)
    if (task.created_at) {
      try {
        const createdTime = ICAL.Time.fromJSDate(new Date(task.created_at));
        vtodo.updatePropertyWithValue('dtstamp', createdTime);
      } catch (e) {
        vtodo.updatePropertyWithValue('dtstamp', ICAL.Time.now());
      }
    } else {
      vtodo.updatePropertyWithValue('dtstamp', ICAL.Time.now());
    }

    // LAST-MODIFIED 기록
    if (task.last_modified) {
      try {
        const modifiedTime = ICAL.Time.fromJSDate(new Date(task.last_modified));
        vtodo.updatePropertyWithValue('last-modified', modifiedTime);
      } catch (e) {
        vtodo.updatePropertyWithValue('last-modified', ICAL.Time.now());
      }
    } else {
      vtodo.updatePropertyWithValue('last-modified', ICAL.Time.now());
    }

    if (task.recurrence && task.recurrence !== 'none') {
      const rrule = new ICAL.Recur({
        freq: task.recurrence.toUpperCase()
      });
      vtodo.updatePropertyWithValue('rrule', rrule);
    }

    comp.addSubcomponent(vtodo);
  });

  return comp.toString();
}
