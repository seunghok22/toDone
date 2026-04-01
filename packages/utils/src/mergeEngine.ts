import type { Task } from '@todone/types';

/**
 * UID 기반 프론트엔드 Merge 엔진
 * 
 * 로컬 태스크와 리모트(R2) 태스크를 LAST-MODIFIED 타임스탬프 기준으로 병합.
 * - 동일 UID: last_modified가 더 최신인 쪽 우선
 * - 로컬 only: 로컬 유지
 * - 리모트 only: 리모트 추가
 * - cancelled(Tombstone)도 병합 대상 (양쪽 모두에서 동기화)
 */
export function mergeTasks(localTasks: Task[], remoteTasks: Task[]): Task[] {
  const mergedMap = new Map<string, Task>();

  // 로컬 태스크를 먼저 등록
  for (const task of localTasks) {
    mergedMap.set(task.id, task);
  }

  // 리모트 태스크와 병합
  for (const remoteTask of remoteTasks) {
    const localTask = mergedMap.get(remoteTask.id);

    if (!localTask) {
      // 리모트에만 존재 → 추가
      mergedMap.set(remoteTask.id, remoteTask);
      continue;
    }

    // 양쪽 모두 존재 → last_modified 비교
    const localTime = getModifiedTime(localTask);
    const remoteTime = getModifiedTime(remoteTask);

    if (remoteTime > localTime) {
      // 리모트가 더 최신
      mergedMap.set(remoteTask.id, remoteTask);
    }
    // else: 로컬이 더 최신이거나 같으면 로컬 유지
  }

  return Array.from(mergedMap.values());
}

function getModifiedTime(task: Task): number {
  const timestamp = task.last_modified || task.created_at;
  return new Date(timestamp).getTime() || 0;
}
