import { useState, useEffect, useCallback } from 'react';

/**
 * 네트워크 온라인/오프라인 상태 감지 + 온라인 복귀 콜백
 */
export function useNetworkStatus(onOnline?: () => void) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    onOnline?.();
  }, [onOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return isOnline;
}
