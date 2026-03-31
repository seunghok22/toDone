/**
 * Cloudflare R2 동기화 클라이언트
 * Worker URL: todone-auth-worker.seunghok22.workers.dev
 */

const WORKER_BASE_URL = 'https://todone-auth-worker.seunghok22.workers.dev';

export interface SyncResult {
  icsContent: string;
  etag: string;
}

/** UUID/PIN 최초 등록 */
export async function initSync(uuid: string, pin: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${WORKER_BASE_URL}/sync/${uuid}/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Pin': pin,
      },
    });
    const data = await res.json();
    return { success: res.ok, message: data.message || data.error };
  } catch (e) {
    console.error('[SyncClient] initSync failed:', e);
    return { success: false, message: String(e) };
  }
}

/** R2에서 .ics 다운로드 + ETag 반환 */
export async function downloadFromR2(uuid: string, pin: string): Promise<SyncResult | null> {
  try {
    const res = await fetch(`${WORKER_BASE_URL}/sync/${uuid}`, {
      method: 'GET',
      headers: { 'X-User-Pin': pin },
    });

    if (!res.ok) {
      console.error('[SyncClient] download failed:', res.status, await res.text());
      return null;
    }

    const icsContent = await res.text();
    const etag = res.headers.get('ETag') || '"empty"';
    return { icsContent, etag };
  } catch (e) {
    console.error('[SyncClient] download error:', e);
    return null;
  }
}

/** R2에 .ics 업로드 (ETag Optimistic Locking) */
export async function uploadToR2(
  uuid: string,
  pin: string,
  icsContent: string,
  etag: string
): Promise<{ success: boolean; newEtag?: string; conflict?: boolean }> {
  try {
    const res = await fetch(`${WORKER_BASE_URL}/sync/${uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/calendar',
        'X-User-Pin': pin,
        'If-Match': etag,
      },
      body: icsContent,
    });

    if (res.status === 412) {
      // ETag 충돌 — Merge 필요
      return { success: false, conflict: true };
    }

    if (!res.ok) {
      console.error('[SyncClient] upload failed:', res.status);
      return { success: false, conflict: false };
    }

    const newEtag = res.headers.get('ETag') || '';
    return { success: true, newEtag };
  } catch (e) {
    console.error('[SyncClient] upload error:', e);
    return { success: false, conflict: false };
  }
}

/** UUID v4 생성 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 폴백
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/** 4자리 PIN 생성 */
export function generatePIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
