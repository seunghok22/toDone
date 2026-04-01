import { useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash-es';
import { useTaskStore } from '../useTaskStore';

/**
 * 디바운스 및 오프라인/앱 종료 상황을 방어하는 자동 동기화 커스텀 훅
 */
export function useAutoSync() {
  const syncWithCloud = useTaskStore(state => state.syncWithCloud);
  const tasks = useTaskStore(state => state.tasks);
  const isSyncing = useTaskStore(state => state.isSyncing);
  const isTasksChangedBySync = useTaskStore(state => state.isTasksChangedBySync);
  const syncUuid = useTaskStore(state => state.syncUuid);

  // 현재 실행 중인지 여부를 저장
  const syncInProgress = useRef(false);
  syncInProgress.current = isSyncing;

  // 1. Debounce 처리된 Sync 함수 (3초 대기)
  const debouncedSync = useCallback(
    debounce(() => {
      // 오프라인이거나, Uuid가 없거나, 이미 동기화 중이면 보류
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }
      if (!syncUuid || syncInProgress.current) return;
      
      syncWithCloud({ keepalive: false }).catch(e => console.error('[AutoSync] failed:', e));
    }, 3000),
    [syncWithCloud, syncUuid]
  );

  // 2. tasks 배열이 변경될 때마다 debouncedSync 호출
  useEffect(() => {
    if (isTasksChangedBySync) {
      return; // ignore tasks updates triggered by the sync process itself
    }
    if (tasks.length > 0 && syncUuid) {
      debouncedSync();
    }
  }, [tasks, syncUuid, debouncedSync, isTasksChangedBySync]);

  // 3. 앱 종료/백그라운드 전환 및 오프라인 복귀 방어 로직 (Flush)
  useEffect(() => {
    const handleOnline = () => {
      // 인터넷이 복구되면 딜레이 없이 즉시 실행
      if (syncUuid && !syncInProgress.current) {
        syncWithCloud({ keepalive: false }).catch(console.error);
      }
    };

    const handleExitOrBackground = () => {
      // 대기 중인 디바운스가 있다면 취소
      debouncedSync.cancel();

      // 만약 동기화가 아직 실행되지 않았고, 오프라인이 아니며, UUID가 있다면
      // keepalive: true 옵션을 줘서 즉시 강제 백그라운드 동기화(Flush) 실행 
      // (브라우저나 앱이 닫히거나 탭을 변경하는 동안에도 Fetch 요청이 끊기지 않도록 함)
      if (syncUuid && typeof navigator !== 'undefined' && navigator.onLine) {
        syncWithCloud({ keepalive: true }).catch(console.error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleExitOrBackground();
      }
    };

    // 온라인 복귀 감지
    window.addEventListener('online', handleOnline);
    // 데스크톱 브라우저 닫힘/새로고침 방어
    window.addEventListener('beforeunload', handleExitOrBackground);
    // 모바일 브라우저/PWA 백그라운드 전환 방어
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleExitOrBackground);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('beforeunload', handleExitOrBackground);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleExitOrBackground);
      debouncedSync.cancel();
    };
  }, [debouncedSync, syncWithCloud, syncUuid]);
}
